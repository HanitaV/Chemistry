/**
 * Persistence Layer — IndexedDB qua Dexie.
 * Mọi dữ liệu cá nhân (tiến độ, ghi chú, tài liệu cá nhân) chỉ tồn tại trong trình duyệt của người học.
 */
import Dexie, { type EntityTable } from "dexie";

export type NodeStatus = "not-started" | "in-progress" | "completed" | "needs-review";
export type LessonStatus = "not-started" | "in-progress" | "completed";
export type ExerciseStatus = "not-started" | "in-progress" | "completed" | "needs-review";
export type SelfAssessment = "correct" | "partial" | "incorrect";
export type ActivityKind = "lesson" | "video" | "exercise" | "reading";

export interface NodeStatusRecord {
  nodeId: string;
  courseId: string;
  status: NodeStatus;
  /** true nếu người học tự đặt trạng thái (không bị ghi đè tự động) */
  manual?: boolean;
  updatedAt: number;
}

export interface LessonProgressRecord {
  lessonId: string;
  courseId: string;
  chapterId: string;
  status: LessonStatus;
  startedAt: number;
  lastVisitedAt: number;
  completedAt?: number;
}

export interface StepResult {
  stepId: string;
  correct: boolean;
  attempts: number;
  /** Đúng ngay lần đầu */
  firstTry: boolean;
  revealed?: boolean;
}

export interface ExerciseAttemptRecord {
  id?: number;
  exerciseId: string;
  courseId: string;
  chapterId: string;
  skill: string;
  mode: "guided" | "exam";
  startedAt: number;
  finishedAt?: number;
  stepResults: StepResult[];
  examAnswer?: string;
  selfAssessment?: SelfAssessment;
  /** 0..1 */
  score?: number;
}

export interface ExerciseStateRecord {
  exerciseId: string;
  courseId: string;
  chapterId: string;
  skill: string;
  status: ExerciseStatus;
  attempts: number;
  bestScore: number;
  lastScore: number;
  lastAttemptAt: number;
}

export interface WrongAnswerRecord {
  id?: number;
  exerciseId: string;
  stepId: string;
  answer: string;
  createdAt: number;
}

export interface NoteRecord {
  id?: number;
  targetType: "lesson" | "video" | "node" | "exercise" | "document" | "general";
  targetId: string;
  content: string;
  /** giây trong video (ghi chú theo timestamp) */
  videoTime?: number;
  youtubeId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface VideoPositionRecord {
  segmentId: string;
  youtubeId: string;
  seconds: number;
  updatedAt: number;
}

export interface StudyDayRecord {
  date: string;
  seconds: number;
  byActivity: Partial<Record<ActivityKind, number>>;
}

export interface SettingRecord {
  key: string;
  value: unknown;
}

export interface PersonalDocRecord {
  id?: number;
  name: string;
  kind: "pdf" | "markdown" | "json" | "csv" | "image" | "text" | "youtube";
  mime: string;
  size: number;
  blob?: Blob;
  text?: string;
  url?: string;
  note?: string;
  createdAt: number;
}

export interface ExamPlanRecord {
  id: string;
  courseId: string;
  examDate: string;
  examTime: string;
  chapterIds: string[];
  minutesPerDay: number;
  createdAt: number;
}

export const db = new Dexie("chemistry-learning-hub") as Dexie & {
  nodeStatus: EntityTable<NodeStatusRecord, "nodeId">;
  lessonProgress: EntityTable<LessonProgressRecord, "lessonId">;
  exerciseAttempts: EntityTable<ExerciseAttemptRecord, "id">;
  exerciseState: EntityTable<ExerciseStateRecord, "exerciseId">;
  wrongAnswers: EntityTable<WrongAnswerRecord, "id">;
  notes: EntityTable<NoteRecord, "id">;
  videoPositions: EntityTable<VideoPositionRecord, "segmentId">;
  studyDays: EntityTable<StudyDayRecord, "date">;
  settings: EntityTable<SettingRecord, "key">;
  personalDocs: EntityTable<PersonalDocRecord, "id">;
  examPlans: EntityTable<ExamPlanRecord, "id">;
};

db.version(1).stores({
  nodeStatus: "nodeId, courseId, status, updatedAt",
  lessonProgress: "lessonId, courseId, chapterId, status, lastVisitedAt",
  exerciseAttempts: "++id, exerciseId, courseId, chapterId, skill, finishedAt",
  exerciseState: "exerciseId, courseId, chapterId, skill, status, lastAttemptAt",
  wrongAnswers: "++id, exerciseId, createdAt",
  notes: "++id, [targetType+targetId], targetType, youtubeId, updatedAt",
  videoPositions: "segmentId, youtubeId, updatedAt",
  studyDays: "date",
  settings: "key",
  personalDocs: "++id, kind, createdAt",
  examPlans: "id, courseId",
});

/** Các bảng thuộc "tiến độ học tập" (được export/import/reset) */
export const PROGRESS_TABLES = [
  "nodeStatus",
  "lessonProgress",
  "exerciseAttempts",
  "exerciseState",
  "wrongAnswers",
  "notes",
  "videoPositions",
  "studyDays",
  "settings",
  "examPlans",
] as const;
export type ProgressTable = (typeof PROGRESS_TABLES)[number];

/** Yêu cầu trình duyệt lưu trữ bền vững để hạn chế mất dữ liệu. */
export async function requestPersistentStorage() {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) await navigator.storage.persist();
  } catch {
    /* bỏ qua */
  }
}
