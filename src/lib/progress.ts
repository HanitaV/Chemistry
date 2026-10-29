/**
 * Logic tiến độ học tập: ghi nhận bài học, bài tập, trạng thái node, thời gian học.
 */
import { content, exercisesOfNode, getExercise, getLesson, nodesOfLesson } from "./content";
import { db, type ActivityKind, type ExerciseAttemptRecord, type NodeStatus, type SelfAssessment, type StepResult } from "./db";
import { localDateKey } from "./utils";

export const NODE_STATUS_LABEL: Record<NodeStatus, string> = {
  "not-started": "Chưa học",
  "in-progress": "Đang học",
  completed: "Đã hoàn thành",
  "needs-review": "Cần ôn lại",
};

/** Ngưỡng điểm (0..1) để coi một bài tập là đã nắm vững */
export const MASTERY_THRESHOLD = 0.7;

// ---------------------------------------------------------------- bài học
export async function markLessonVisited(lessonId: string) {
  const lesson = getLesson(lessonId);
  if (!lesson) return;
  const now = Date.now();
  await db.transaction("rw", db.lessonProgress, db.nodeStatus, async () => {
    const existing = await db.lessonProgress.get(lessonId);
    if (existing) {
      await db.lessonProgress.update(lessonId, { lastVisitedAt: now });
    } else {
      await db.lessonProgress.put({
        lessonId,
        courseId: lesson.courseId,
        chapterId: lesson.chapterId,
        status: "in-progress",
        startedAt: now,
        lastVisitedAt: now,
      });
      for (const node of nodesOfLesson(lessonId)) {
        const ns = await db.nodeStatus.get(node.id);
        if (!ns) await db.nodeStatus.put({ nodeId: node.id, courseId: node.courseId, status: "in-progress", updatedAt: now });
      }
    }
  });
}

export async function setLessonCompleted(lessonId: string, completed: boolean) {
  const lesson = getLesson(lessonId);
  if (!lesson) return;
  const now = Date.now();
  await db.transaction("rw", db.lessonProgress, db.nodeStatus, async () => {
    const existing = await db.lessonProgress.get(lessonId);
    await db.lessonProgress.put({
      lessonId,
      courseId: lesson.courseId,
      chapterId: lesson.chapterId,
      status: completed ? "completed" : "in-progress",
      startedAt: existing?.startedAt ?? now,
      lastVisitedAt: now,
      completedAt: completed ? now : undefined,
    });
    for (const node of nodesOfLesson(lessonId)) {
      const ns = await db.nodeStatus.get(node.id);
      if (ns?.manual) continue;
      if (completed && ns?.status === "needs-review") continue;
      await db.nodeStatus.put({ nodeId: node.id, courseId: node.courseId, status: completed ? "completed" : "in-progress", updatedAt: now });
    }
  });
}

export async function setNodeStatus(nodeId: string, status: NodeStatus) {
  const node = content.nodeById.get(nodeId);
  if (!node) return;
  await db.nodeStatus.put({ nodeId, courseId: node.courseId, status, manual: true, updatedAt: Date.now() });
}

// ---------------------------------------------------------------- bài tập
export function scoreGuided(results: StepResult[]) {
  if (!results.length) return 0;
  const points = results.reduce((s, r) => s + (r.revealed ? 0 : r.firstTry ? 1 : r.correct ? 0.5 : 0), 0);
  return points / results.length;
}

export const SELF_SCORE: Record<SelfAssessment, number> = { correct: 1, partial: 0.5, incorrect: 0 };

export async function recordWrongAnswer(exerciseId: string, stepId: string, answer: string) {
  await db.wrongAnswers.add({ exerciseId, stepId, answer: answer.slice(0, 500), createdAt: Date.now() });
}

export async function saveAttempt(attempt: ExerciseAttemptRecord) {
  const ex = getExercise(attempt.exerciseId);
  if (!ex) return;
  const score = attempt.score ?? 0;
  const now = Date.now();
  await db.transaction("rw", db.exerciseAttempts, db.exerciseState, db.nodeStatus, async () => {
    await db.exerciseAttempts.add({ ...attempt, finishedAt: attempt.finishedAt ?? now });
    const prev = await db.exerciseState.get(ex.id);
    const status = score >= MASTERY_THRESHOLD ? "completed" : "needs-review";
    await db.exerciseState.put({
      exerciseId: ex.id,
      courseId: ex.courseId,
      chapterId: ex.chapterId,
      skill: ex.skill,
      status,
      attempts: (prev?.attempts ?? 0) + 1,
      bestScore: Math.max(prev?.bestScore ?? 0, score),
      lastScore: score,
      lastAttemptAt: now,
    });
    // Làm sai nhiều → đánh dấu kiến thức liên quan cần ôn lại (trừ khi người học tự đặt)
    for (const nodeId of ex.nodeIds) {
      const ns = await db.nodeStatus.get(nodeId);
      if (ns?.manual) continue;
      if (score < 0.5) await db.nodeStatus.put({ nodeId, courseId: ex.courseId, status: "needs-review", updatedAt: now });
      else if (ns?.status === "needs-review" && score >= MASTERY_THRESHOLD)
        await db.nodeStatus.put({ nodeId, courseId: ex.courseId, status: "in-progress", updatedAt: now });
      else if (!ns) await db.nodeStatus.put({ nodeId, courseId: ex.courseId, status: "in-progress", updatedAt: now });
    }
  });
}

// ---------------------------------------------------------------- thời gian học
export async function addStudyTime(kind: ActivityKind, seconds: number) {
  if (seconds <= 0) return;
  const date = localDateKey();
  await db.transaction("rw", db.studyDays, async () => {
    const day = (await db.studyDays.get(date)) ?? { date, seconds: 0, byActivity: {} };
    day.seconds += seconds;
    day.byActivity[kind] = (day.byActivity[kind] ?? 0) + seconds;
    await db.studyDays.put(day);
  });
}

// ---------------------------------------------------------------- video
export async function saveVideoPosition(segmentId: string, youtubeId: string, seconds: number) {
  await db.videoPositions.put({ segmentId, youtubeId, seconds: Math.floor(seconds), updatedAt: Date.now() });
}

// ---------------------------------------------------------------- mức độ thành thạo
export interface MasteryInput {
  lessonCompleted: Set<string>;
  exerciseBest: Map<string, number>;
}

/** Mức độ thành thạo (0..1) của một node: 40% từ bài học, 60% từ điểm tốt nhất của các bài tập liên quan. */
export function nodeMastery(nodeId: string, input: MasteryInput) {
  const node = content.nodeById.get(nodeId);
  if (!node) return 0;
  const lessonPart = node.lessonId && input.lessonCompleted.has(node.lessonId) ? 1 : 0;
  const related = exercisesOfNode(nodeId);
  if (!related.length) return lessonPart;
  const exPart = related.reduce((s, e) => s + (input.exerciseBest.get(e.id) ?? 0), 0) / related.length;
  return 0.4 * lessonPart + 0.6 * exPart;
}
