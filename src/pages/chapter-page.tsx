import { Link, useParams } from "react-router";
import { BookOpen, CircleCheck, CircleDot, Clock, Dumbbell, FileText, PlaySquare, Sigma } from "lucide-react";
import { DifficultyBadge } from "@/components/common/badges";
import { ExerciseCard } from "@/components/exercise-engine/exercise-card";
import { PageContainer, PageHeader } from "@/components/layout/page-header";
import { FormulaCard } from "@/components/lesson-viewer/formula-card";
import { SegmentCard } from "@/components/video-player/segment-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProgressMaps } from "@/hooks/use-progress";
import {
  documentPath,
  documentsOfChapter,
  exercisesOfChapter,
  formulasOfChapter,
  getChapter,
  getCourse,
  lessonPath,
  lessonsOfChapter,
  segmentsOfChapter,
} from "@/lib/content";
import { pct } from "@/lib/utils";
import NotFoundPage from "./not-found-page";

export default function ChapterPage() {
  const { courseId, chapterId } = useParams();
  const course = getCourse(courseId);
  const chapter = getChapter(chapterId);
  const { lessonMap, lessonCompleted, exerciseMap } = useProgressMaps();
  if (!course || !chapter || chapter.courseId !== course.id) return <NotFoundPage what="Chương" />;

  const lessons = lessonsOfChapter(chapter.id);
  const exercises = exercisesOfChapter(chapter.id);
  const formulas = formulasOfChapter(chapter.id);
  const segments = segmentsOfChapter(chapter.id);
  const docs = documentsOfChapter(chapter.id);
  const done = lessons.filter((l) => lessonCompleted.has(l.id)).length;
  const next = lessons.find((l) => !lessonCompleted.has(l.id)) ?? lessons[0];

  return (
    <PageContainer>
      <PageHeader
        crumbs={[{ label: "Môn học", to: "/courses" }, { label: course.title, to: `/courses/${course.id}` }, { label: `Chương ${chapter.order}` }]}
        title={`Chương ${chapter.order}: ${chapter.title}`}
        description={chapter.description}
        actions={
          next && (
            <Button asChild>
              <Link to={lessonPath(next)}>
                <BookOpen /> {done ? "Học tiếp" : "Bắt đầu chương"}
              </Link>
            </Button>
          )
        }
      />
      <div className="mb-6 flex items-center gap-3">
        <Progress value={pct(done, lessons.length)} className="max-w-sm" label="Tiến độ chương" />
        <span className="text-sm text-muted-foreground">
          {done}/{lessons.length} bài học
        </span>
      </div>

      <Tabs defaultValue="lessons">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList>
            <TabsTrigger value="lessons">
              <BookOpen /> Bài học ({lessons.length})
            </TabsTrigger>
            <TabsTrigger value="exercises">
              <Dumbbell /> Bài tập ({exercises.length})
            </TabsTrigger>
            <TabsTrigger value="formulas">
              <Sigma /> Công thức ({formulas.length})
            </TabsTrigger>
            <TabsTrigger value="videos">
              <PlaySquare /> Video ({segments.length})
            </TabsTrigger>
            <TabsTrigger value="docs">
              <FileText /> Tài liệu ({docs.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="lessons">
          <ol className="flex flex-col gap-2">
            {lessons.map((l) => {
              const st = lessonMap.get(l.id)?.status;
              return (
                <li key={l.id}>
                  <Link to={lessonPath(l)} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 sm:flex-row sm:items-center">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                      {chapter.order}.{l.order}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{l.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{l.summary}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <DifficultyBadge difficulty={l.difficulty} />
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" aria-hidden /> {l.estimatedMinutes} phút
                      </span>
                      {st === "completed" ? (
                        <span className="flex items-center gap-1 text-success">
                          <CircleCheck className="size-4" /> Đã học
                        </span>
                      ) : st === "in-progress" ? (
                        <span className="flex items-center gap-1 text-info">
                          <CircleDot className="size-4" /> Đang học
                        </span>
                      ) : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </TabsContent>

        <TabsContent value="exercises">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {exercises.map((e) => (
              <ExerciseCard key={e.id} exercise={e} state={exerciseMap.get(e.id)} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="formulas">
          {formulas.length ? (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {formulas.map((f) => (
                <FormulaCard key={f.id} formula={f} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Chương này chủ yếu là lý thuyết định tính; công thức chính (bậc liên kết, số T) nằm trong từng bài học.</p>
          )}
        </TabsContent>

        <TabsContent value="videos">
          <div className="grid grid-cols-1 gap-2">
            {segments.map((s) => (
              <SegmentCard key={s.id} segment={s} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="docs">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {docs.map((d) => (
              <Link key={d.id} to={documentPath(d.id)} className="flex gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/50">
                <FileText className="size-8 shrink-0 text-destructive" aria-hidden />
                <div>
                  <p className="font-semibold">{d.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{d.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">PDF · {d.pageCount} trang</p>
                </div>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
