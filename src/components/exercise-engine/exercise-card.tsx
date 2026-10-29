import { Link } from "react-router";
import { ArrowRight, CircleCheck, RotateCcw } from "lucide-react";
import { DifficultyBadge, SourceBadge } from "@/components/common/badges";
import { Badge } from "@/components/ui/badge";
import type { ExerciseStateRecord } from "@/lib/db";
import { exercisePath, getChapter, type WithCourse } from "@/lib/content";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/types/schema";

export function ExerciseCard({ exercise, state, className, showChapter }: { exercise: WithCourse<Exercise>; state?: ExerciseStateRecord; className?: string; showChapter?: boolean }) {
  const chapter = getChapter(exercise.chapterId);
  return (
    <Link
      to={exercisePath(exercise.id)}
      className={cn("group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-accent/30", className)}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <DifficultyBadge difficulty={exercise.difficulty} />
        <SourceBadge source={exercise.source} />
        {state?.status === "completed" && (
          <Badge variant="success">
            <CircleCheck /> {Math.round(state.bestScore * 100)}%
          </Badge>
        )}
        {state?.status === "needs-review" && (
          <Badge variant="warning">
            <RotateCcw /> Cần ôn lại
          </Badge>
        )}
      </div>
      <p className="font-medium leading-snug group-hover:text-primary">{exercise.title}</p>
      <p className="text-xs text-muted-foreground">
        {showChapter && chapter ? `Chương ${chapter.order} · ` : ""}
        {exercise.skill} · {exercise.steps.length ? `${exercise.steps.length} bước` : "chỉ chế độ thi"}
      </p>
      <span className="mt-auto flex items-center gap-1 pt-1 text-xs font-medium text-primary">
        Làm bài <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
