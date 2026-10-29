import { Fragment, useState } from "react";
import { Link } from "react-router";
import { ChevronDown, Dumbbell, Footprints, PlaySquare, Sigma } from "lucide-react";
import { Markdown } from "@/components/common/markdown";
import { DifficultyBadge, SourceBadge } from "@/components/common/badges";
import { ExerciseCard } from "@/components/exercise-engine/exercise-card";
import { GuidedExercise } from "@/components/exercise-engine/guided-exercise";
import { SegmentCard } from "@/components/video-player/segment-card";
import { Button } from "@/components/ui/button";
import { exercisePath, formulasOfLesson, getExercise, getSegment, slugify } from "@/lib/content";
import type { ExerciseStateRecord } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { Lesson } from "@/types/schema";
import { FormulaCard } from "./formula-card";

function SectionTitle({ id, icon: Icon, children, tone }: { id: string; icon: typeof Sigma; children: string; tone: string }) {
  return (
    <h2 id={id} className="mb-4 mt-10 flex scroll-mt-20 items-center gap-2 text-[1.4rem] font-bold tracking-tight">
      <span className={cn("flex size-8 items-center justify-center rounded-lg", tone)}>
        <Icon className="size-4.5" aria-hidden />
      </span>
      {children}
    </h2>
  );
}

function GuidedBlock({ exerciseId, defaultOpen }: { exerciseId: string; defaultOpen: boolean }) {
  const ex = getExercise(exerciseId);
  const [open, setOpen] = useState(defaultOpen);
  if (!ex) return null;
  return (
    <div className="rounded-xl border border-exercise/30 bg-exercise/[0.04]">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-start gap-3 p-4 text-left cursor-pointer" aria-expanded={open}>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap gap-1.5">
            <DifficultyBadge difficulty={ex.difficulty} />
            <SourceBadge source={ex.source} />
          </div>
          <p className="font-semibold">{ex.title}</p>
        </div>
        <ChevronDown className={cn("mt-1 size-5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div className="border-t border-exercise/20 p-4 pt-3">
          <div className="mb-4 rounded-lg bg-card p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-exercise">Đề bài</p>
            <Markdown>{ex.statement}</Markdown>
          </div>
          <GuidedExercise exercise={ex} />
          <div className="mt-3 flex justify-end">
            <Button variant="link" size="sm" asChild>
              <Link to={exercisePath(ex.id, "exam")}>Luyện lại ở chế độ thi →</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Hiển thị thân bài học theo cấu trúc thống nhất. Các dòng marker trong Markdown
 * (::formulas, ::videos, ::guided-exercises, ::practice-exercises) được thay bằng khối tương tác.
 */
export function LessonContent({ lesson, exerciseStates }: { lesson: Lesson; exerciseStates: Map<string, ExerciseStateRecord> }) {
  const parts = lesson.body.split(/^(::[a-z-]+)[ \t]*$/m);
  const formulas = formulasOfLesson(lesson);
  const segments = lesson.videoSegmentIds.map(getSegment).filter((s): s is NonNullable<typeof s> => !!s);

  return (
    <div>
      {parts.map((part, i) => {
        switch (part) {
          case "::formulas":
            return formulas.length ? (
              <section key={i} aria-labelledby={slugify("Công thức quan trọng")}>
                <SectionTitle id={slugify("Công thức quan trọng")} icon={Sigma} tone="bg-theory/12 text-theory">
                  Công thức quan trọng
                </SectionTitle>
                <div className="grid grid-cols-1 gap-3">
                  {formulas.map((f) => (
                    <FormulaCard key={f.id} formula={f} />
                  ))}
                </div>
              </section>
            ) : (
              <span key={i} id={slugify("Công thức quan trọng")} />
            );
          case "::videos":
            return (
              <section key={i}>
                <SectionTitle id={slugify("Video liên quan")} icon={PlaySquare} tone="bg-destructive/10 text-destructive">
                  Video liên quan
                </SectionTitle>
                {segments.length ? (
                  <div className="grid grid-cols-1 gap-2">
                    {segments.map((s) => (
                      <SegmentCard key={s.id} segment={s} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Chưa có video cho bài này.</p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">Nguồn: General Chemistry – Full University Course (YouTube, tiếng Anh). Mở video không tự động đánh dấu hoàn thành.</p>
              </section>
            );
          case "::guided-exercises":
            return (
              <section key={i}>
                <SectionTitle id={slugify("Bài tập từng bước")} icon={Footprints} tone="bg-exercise/12 text-exercise">
                  Bài tập từng bước
                </SectionTitle>
                {lesson.guidedExerciseIds.length ? (
                  <div className="grid grid-cols-1 gap-3">
                    {lesson.guidedExerciseIds.map((id, j) => (
                      <GuidedBlock key={id} exerciseId={id} defaultOpen={j === 0} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Chưa có bài tập từng bước.</p>
                )}
              </section>
            );
          case "::practice-exercises":
            return (
              <section key={i}>
                <SectionTitle id={slugify("Bài tập tự luyện")} icon={Dumbbell} tone="bg-solution/12 text-solution">
                  Bài tập tự luyện
                </SectionTitle>
                {lesson.practiceExerciseIds.length ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {lesson.practiceExerciseIds.map((id) => {
                      const ex = getExercise(id);
                      return ex ? <ExerciseCard key={id} exercise={ex} state={exerciseStates.get(id)} /> : null;
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Bài này chưa có bài tập tự luyện thêm — hãy làm lại bài tập từng bước ở chế độ thi.</p>
                )}
              </section>
            );
          default:
            return part.trim() ? (
              <Fragment key={i}>
                <Markdown>{part}</Markdown>
              </Fragment>
            ) : null;
        }
      })}
    </div>
  );
}
