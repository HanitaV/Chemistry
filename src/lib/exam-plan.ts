/**
 * Thuật toán lập kế hoạch ôn thi (không dùng AI).
 *
 * 1. Lấy các bài học và bài tập thuộc các chương được chọn.
 * 2. Bỏ những mục đã hoàn thành; bài tập "cần ôn lại" được ưu tiên.
 * 3. Ước lượng thời lượng: bài học dùng estimatedMinutes × hệ số độ khó;
 *    bài tập 10/15/25 phút theo độ khó.
 * 4. Sắp xếp theo thứ tự học đề xuất (chương → bài → bài tập của bài đó), mục cần ôn đặt lên đầu.
 * 5. Dành ~20% số ngày cuối (tối thiểu 1 ngày nếu có ≥ 3 ngày) cho tổng ôn; phân bổ tuần tự
 *    các mục vào từng ngày theo quỹ thời gian/ngày.
 */
import { content, lessonsOfChapter } from "./content";
import type { Difficulty } from "@/types/schema";
import type { ExerciseStatus } from "./db";

export interface PlanInput {
  examDate: string; // YYYY-MM-DD
  examTime: string; // HH:mm
  chapterIds: string[];
  minutesPerDay: number;
  today?: Date;
  completedLessons: Set<string>;
  exerciseStatus: Map<string, ExerciseStatus>;
}

export interface PlanItem {
  kind: "lesson" | "exercise" | "review";
  id: string;
  title: string;
  chapterId: string;
  minutes: number;
  priority?: "review";
}

export interface PlanDay {
  date: string;
  items: PlanItem[];
  minutes: number;
  isReviewDay: boolean;
}

export interface PlanResult {
  days: PlanDay[];
  totalMinutes: number;
  capacityMinutes: number;
  daysLeft: number;
  overflow: PlanItem[];
  examAt: Date;
}

const LESSON_FACTOR: Record<Difficulty, number> = { easy: 1, medium: 1.2, hard: 1.4 };
const EXERCISE_MINUTES: Record<Difficulty, number> = { easy: 10, medium: 15, hard: 25 };

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function key(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function buildPlan(input: PlanInput): PlanResult {
  const today = input.today ? new Date(input.today) : new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = input.examDate.split("-").map(Number);
  const [hh, mm] = (input.examTime || "07:00").split(":").map(Number);
  const examAt = new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 7, mm ?? 0);
  const examDay = new Date(examAt);
  examDay.setHours(0, 0, 0, 0);

  // Ngày học: từ hôm nay tới trước ngày thi (nếu thi buổi chiều/tối thì vẫn được học buổi sáng ngày thi nhưng ta để ngày thi trống)
  const daysLeft = Math.max(0, Math.round((examDay.getTime() - today.getTime()) / 86400000));

  const review: PlanItem[] = [];
  const queue: PlanItem[] = [];
  const chapterOrder = content.chapters.filter((c) => input.chapterIds.includes(c.id));
  for (const chapter of chapterOrder) {
    for (const lesson of lessonsOfChapter(chapter.id)) {
      if (!input.completedLessons.has(lesson.id))
        queue.push({ kind: "lesson", id: lesson.id, title: lesson.title, chapterId: chapter.id, minutes: Math.round(lesson.estimatedMinutes * LESSON_FACTOR[lesson.difficulty]) });
      for (const ex of content.exercises.filter((e) => e.lessonId === lesson.id)) {
        const st = input.exerciseStatus.get(ex.id) ?? "not-started";
        const item: PlanItem = { kind: "exercise", id: ex.id, title: ex.title, chapterId: chapter.id, minutes: EXERCISE_MINUTES[ex.difficulty] };
        if (st === "needs-review") review.push({ ...item, priority: "review" });
        else if (st !== "completed") queue.push(item);
      }
    }
  }
  const items = [...review, ...queue];
  const totalMinutes = items.reduce((s, i) => s + i.minutes, 0);
  const perDay = Math.max(15, input.minutesPerDay);

  const studyDays = Math.max(daysLeft, 0);
  const reviewDays = studyDays >= 3 ? Math.max(1, Math.round(studyDays * 0.2)) : 0;
  const learnDays = Math.max(studyDays - reviewDays, studyDays > 0 ? 1 : 0);

  const days: PlanDay[] = [];
  for (let i = 0; i < studyDays; i++) days.push({ date: key(addDays(today, i)), items: [], minutes: 0, isReviewDay: i >= learnDays });

  // Phân bổ đều tải học trên các ngày học (không vượt quỹ thời gian/ngày)
  const target = learnDays ? Math.min(perDay, Math.ceil(totalMinutes / learnDays)) : 0;
  let dayIdx = 0;
  const overflow: PlanItem[] = [];
  for (const item of items) {
    while (dayIdx < learnDays && days[dayIdx].minutes > 0 && days[dayIdx].minutes + item.minutes > target) dayIdx++;
    if (dayIdx >= learnDays) {
      // hết quỹ thời gian: giữ nguyên thứ tự học, phần còn lại được báo là chưa xếp được
      overflow.push(item);
      continue;
    }
    days[dayIdx].items.push(item);
    days[dayIdx].minutes += item.minutes;
  }
  // Ngày tổng ôn: ôn theo chương
  for (let i = learnDays; i < studyDays; i++) {
    const ch = chapterOrder[(i - learnDays) % Math.max(chapterOrder.length, 1)];
    if (!ch) continue;
    days[i].items.push({ kind: "review", id: ch.id, title: `Tổng ôn chương ${ch.order}: ${ch.title} — xem lại công thức, làm lại bài cần ôn, chế độ thi`, chapterId: ch.id, minutes: perDay });
    days[i].minutes = perDay;
  }

  return { days, totalMinutes, capacityMinutes: learnDays * perDay, daysLeft, overflow, examAt };
}

/**
 * Chuẩn bị dữ liệu tiến độ cho buildPlan: các mục hoàn thành TRONG HÔM NAY vẫn được giữ trong kế hoạch
 * (để hiển thị gạch ngang “đã xong”), các mục hoàn thành trước hôm nay thì bỏ qua.
 */
export function planProgressInputs(
  lessons: Map<string, { status: string; completedAt?: number }>,
  exercises: Map<string, { status: ExerciseStatus; lastAttemptAt: number }>,
) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const t0 = start.getTime();
  const completedLessons = new Set([...lessons.entries()].filter(([, l]) => l.status === "completed" && (l.completedAt ?? 0) < t0).map(([id]) => id));
  const exerciseStatus = new Map(
    [...exercises.entries()].map(([id, e]) => [id, e.status === "completed" && e.lastAttemptAt >= t0 ? ("in-progress" as const) : e.status]),
  );
  return { completedLessons, exerciseStatus };
}
