import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { db, type ExerciseStateRecord, type LessonProgressRecord, type NodeStatus } from "@/lib/db";

/** Toàn bộ dữ liệu tiến độ dạng Map, cập nhật trực tiếp khi IndexedDB thay đổi. */
export function useProgressMaps() {
  const lessons = useLiveQuery(() => db.lessonProgress.toArray(), [], undefined);
  const exercises = useLiveQuery(() => db.exerciseState.toArray(), [], undefined);
  const nodes = useLiveQuery(() => db.nodeStatus.toArray(), [], undefined);
  return useMemo(() => {
    const lessonMap = new Map<string, LessonProgressRecord>((lessons ?? []).map((l) => [l.lessonId, l]));
    const exerciseMap = new Map<string, ExerciseStateRecord>((exercises ?? []).map((e) => [e.exerciseId, e]));
    const nodeMap = new Map<string, NodeStatus>((nodes ?? []).map((n) => [n.nodeId, n.status]));
    const lessonCompleted = new Set((lessons ?? []).filter((l) => l.status === "completed").map((l) => l.lessonId));
    const exerciseBest = new Map((exercises ?? []).map((e) => [e.exerciseId, e.bestScore]));
    return {
      ready: lessons !== undefined && exercises !== undefined && nodes !== undefined,
      lessonMap,
      exerciseMap,
      nodeMap,
      lessonCompleted,
      exerciseBest,
    };
  }, [lessons, exercises, nodes]);
}
