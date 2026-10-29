import { Link, useParams, useSearchParams } from "react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, ArrowRight, BookOpen, ClipboardPen, FileText, Footprints, History } from "lucide-react";
import { DifficultyBadge, SourceBadge } from "@/components/common/badges";
import { Markdown } from "@/components/common/markdown";
import { ExamExercise } from "@/components/exercise-engine/exam-exercise";
import { GuidedExercise } from "@/components/exercise-engine/guided-exercise";
import { PageContainer, Breadcrumbs } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStudyTimer } from "@/hooks/use-study-timer";
import { documentPath, exercisePath, exercisesOfChapter, getChapter, getDocument, getExercise, getLesson, getNode, lessonPath } from "@/lib/content";
import { db } from "@/lib/db";
import { cn, formatRelative } from "@/lib/utils";
import { useUi } from "@/stores/ui-store";
import NotFoundPage from "./not-found-page";

export default function ExercisePage() {
  const { exerciseId } = useParams();
  const [params, setParams] = useSearchParams();
  const defaultMode = useUi((s) => s.defaultExerciseMode);
  const exercise = getExercise(exerciseId);
  const attempts = useLiveQuery(() => (exerciseId ? db.exerciseAttempts.where("exerciseId").equals(exerciseId).reverse().sortBy("finishedAt") : []), [exerciseId]);
  useStudyTimer("exercise", !!exercise);
  if (!exercise) return <NotFoundPage what="Bài tập" />;

  const hasSteps = exercise.steps.length > 0;
  const mode = !hasSteps ? "exam" : ((params.get("mode") as "guided" | "exam" | null) ?? defaultMode);
  const chapter = getChapter(exercise.chapterId)!;
  const lesson = getLesson(exercise.lessonId);
  const doc = getDocument(exercise.source.documentId);
  const siblings = exercisesOfChapter(exercise.chapterId);
  const i = siblings.findIndex((e) => e.id === exercise.id);
  const prev = siblings[i - 1];
  const next = siblings[i + 1];

  return (
    <PageContainer wide>
      <Breadcrumbs
        items={[
          { label: "Luyện tập", to: "/practice" },
          { label: `Chương ${chapter.order}`, to: `/practice?chapter=${chapter.id}` },
          { label: exercise.title },
        ]}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">{exercise.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <DifficultyBadge difficulty={exercise.difficulty} />
            <SourceBadge source={exercise.source} />
            <span className="text-xs text-muted-foreground">Dạng: {exercise.skill}</span>
          </div>

          <section className="mt-5 rounded-xl border border-exercise/30 bg-card p-4 sm:p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-exercise">Đề bài</p>
            <Markdown>{exercise.statement}</Markdown>
          </section>

          <div className="mt-5 flex flex-wrap items-center gap-2" role="tablist" aria-label="Chế độ làm bài">
            <Button
              role="tab"
              aria-selected={mode === "guided"}
              variant={mode === "guided" ? "default" : "outline"}
              size="sm"
              disabled={!hasSteps}
              onClick={() => setParams({ mode: "guided" }, { replace: true })}
            >
              <Footprints /> Guided — từng bước
            </Button>
            <Button role="tab" aria-selected={mode === "exam"} variant={mode === "exam" ? "default" : "outline"} size="sm" onClick={() => setParams({ mode: "exam" }, { replace: true })}>
              <ClipboardPen /> Exam — tự luận
            </Button>
          </div>
          <div className="mt-4">{mode === "guided" ? <GuidedExercise key={exercise.id + "g"} exercise={exercise} /> : <ExamExercise key={exercise.id + "e"} exercise={exercise} />}</div>

          <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {prev ? (
              <Link to={exercisePath(prev.id)} className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm hover:bg-muted">
                <ArrowLeft className="size-4 shrink-0" aria-hidden />
                <span className="min-w-0">
                  <span className="block text-xs text-muted-foreground">Bài trước</span>
                  <span className="block truncate font-medium">{prev.title}</span>
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link to={exercisePath(next.id)} className="flex items-center justify-end gap-2 rounded-lg border border-border p-3 text-right text-sm hover:bg-muted">
                <span className="min-w-0">
                  <span className="block text-xs text-muted-foreground">Bài tiếp theo</span>
                  <span className="block truncate font-medium">{next.title}</span>
                </span>
                <ArrowRight className="size-4 shrink-0" aria-hidden />
              </Link>
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Thông tin bài tập</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              {lesson && (
                <Link to={lessonPath(lesson)} className="flex items-center gap-2 text-primary hover:underline">
                  <BookOpen className="size-4 shrink-0" aria-hidden /> Bài học: {lesson.title}
                </Link>
              )}
              {doc && (
                <div>
                  <Link to={documentPath(doc.id, exercise.source.pages?.[0])} className="flex items-center gap-2 text-primary hover:underline">
                    <FileText className="size-4 shrink-0" aria-hidden /> {doc.title}
                    {exercise.source.pages?.length ? ` — tr. ${exercise.source.pages.join(", ")}` : ""}
                  </Link>
                </div>
              )}
              {exercise.source.note && <p className="text-xs text-muted-foreground">{exercise.source.note}</p>}
              {exercise.nodeIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {exercise.nodeIds.map((id) => (
                    <Link key={id} to={`/graph?node=${id}`} className="rounded-full border border-border px-2 py-0.5 text-xs hover:border-primary hover:text-primary">
                      {getNode(id)?.label}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <History className="size-4" aria-hidden /> Lịch sử làm bài
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!attempts?.length ? (
                <p className="text-sm text-muted-foreground">Chưa có lần làm nào.</p>
              ) : (
                <ul className="flex flex-col gap-1.5 text-sm">
                  {attempts.slice(0, 8).map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">
                        {a.mode === "guided" ? "Guided" : "Exam"} · {formatRelative(a.finishedAt ?? a.startedAt)}
                      </span>
                      <span className={cn("font-medium", (a.score ?? 0) >= 0.7 ? "text-success" : "text-warning")}>{Math.round((a.score ?? 0) * 100)}%</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}
