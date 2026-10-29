import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, ArrowRight, CircleCheck, Clock, PanelRightClose, PanelRightOpen, Target, TriangleAlert, ListTree } from "lucide-react";
import { DifficultyBadge, StatusBadge } from "@/components/common/badges";
import { Breadcrumbs } from "@/components/layout/page-header";
import { LessonContent } from "@/components/lesson-viewer/lesson-content";
import { LessonPanel } from "@/components/lesson-viewer/lesson-panel";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsWide } from "@/hooks/use-media-query";
import { useProgressMaps } from "@/hooks/use-progress";
import { useStudyTimer } from "@/hooks/use-study-timer";
import { adjacentLessons, getChapter, getCourse, getLesson, lessonPath, lessonToc } from "@/lib/content";
import { markLessonVisited, setLessonCompleted } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { useUi } from "@/stores/ui-store";
import NotFoundPage from "./not-found-page";

export default function LessonPage() {
  const { courseId, lessonId } = useParams();
  const lesson = getLesson(lessonId);
  const course = getCourse(courseId);
  const { lessonMap, exerciseMap } = useProgressMaps();
  const panelOpen = useUi((s) => s.rightPanelOpen);
  const setUi = useUi((s) => s.set);
  const wide = useIsWide();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeHeading, setActiveHeading] = useState<string>();

  useStudyTimer("lesson", !!lesson);

  useEffect(() => {
    if (lesson) void markLessonVisited(lesson.id);
  }, [lesson]);

  // Theo dõi mục đang đọc để tô sáng trong mục lục
  useEffect(() => {
    if (!lesson) return;
    const ids = lessonToc(lesson).map((t) => t.id);
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveHeading(visible.target.id);
      },
      { rootMargin: "-70px 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [lesson]);

  if (!lesson || !course || lesson.courseId !== course.id) return <NotFoundPage what="Bài học" />;
  const chapter = getChapter(lesson.chapterId)!;
  const status = lessonMap.get(lesson.id)?.status ?? "not-started";
  const { prev, next } = adjacentLessons(lesson.id);
  const toggleComplete = () => void setLessonCompleted(lesson.id, status !== "completed");
  const showAside = wide && panelOpen;

  const panel = (
    <LessonPanel lesson={lesson} status={status} onToggleComplete={toggleComplete} activeHeading={activeHeading} onNavigate={() => setSheetOpen(false)} />
  );

  return (
    <div className="mx-auto flex w-full max-w-[1400px] gap-6 px-4 py-6 sm:px-6 lg:py-8">
      <article className="mx-auto min-w-0 max-w-3xl flex-1">
        <div className="flex items-start justify-between gap-2">
          <Breadcrumbs
            items={[
              { label: course.title, to: `/courses/${course.id}` },
              { label: `Chương ${chapter.order}: ${chapter.title}`, to: `/courses/${course.id}/chapters/${chapter.id}` },
              { label: lesson.title },
            ]}
          />
          {wide && (
            <Button variant="ghost" size="xs" onClick={() => setUi({ rightPanelOpen: !panelOpen })} aria-label={panelOpen ? "Ẩn panel bên phải" : "Hiện panel bên phải"} className="shrink-0">
              {panelOpen ? <PanelRightClose /> : <PanelRightOpen />} {panelOpen ? "Ẩn panel" : "Hiện panel"}
            </Button>
          )}
        </div>

        <header className="mb-6">
          <p className="text-sm font-semibold text-primary">
            Bài {chapter.order}.{lesson.order}
          </p>
          <h1 className="mt-1 text-[1.75rem] font-bold leading-tight tracking-tight sm:text-3xl">{lesson.title}</h1>
          <p className="mt-2 text-muted-foreground">{lesson.summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <DifficultyBadge difficulty={lesson.difficulty} />
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden /> ~{lesson.estimatedMinutes} phút
            </span>
            {status === "completed" && (
              <span className="flex items-center gap-1 font-medium text-success">
                <CircleCheck className="size-3.5" /> Đã học xong
              </span>
            )}
          </div>
        </header>

        <section aria-labelledby="objectives" className="mb-5 rounded-xl border border-theory/30 bg-theory/[0.05] p-4">
          <h2 id="objectives" className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-theory">
            <Target className="size-4" aria-hidden /> Mục tiêu học tập
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {lesson.objectives.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="prereq" className="mb-8 rounded-xl border border-border bg-card p-4">
          <h2 id="prereq" className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Kiến thức tiên quyết
          </h2>
          {lesson.prerequisites.length === 0 ? (
            <p className="text-sm text-muted-foreground">Không yêu cầu — đây là bài mở đầu.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {lesson.prerequisites.map((id) => {
                const pre = getLesson(id);
                if (!pre) return null;
                const st = lessonMap.get(id)?.status ?? "not-started";
                return (
                  <li key={id} className="flex flex-wrap items-center justify-between gap-2">
                    <Link to={lessonPath(pre)} className="text-sm font-medium text-primary hover:underline">
                      {pre.title}
                    </Link>
                    <StatusBadge status={st} />
                  </li>
                );
              })}
            </ul>
          )}
          {lesson.prerequisites.some((id) => lessonMap.get(id)?.status !== "completed") && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-warning">
              <TriangleAlert className="size-3.5" aria-hidden /> Bạn chưa hoàn thành hết bài tiên quyết — vẫn có thể học, nhưng nên xem lại khi gặp khó khăn.
            </p>
          )}
        </section>

        <LessonContent lesson={lesson} exerciseStates={exerciseMap} />

        <div className="mt-10 rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{status === "completed" ? "Bạn đã hoàn thành bài này 🎉" : "Đã nắm vững nội dung bài?"}</p>
              <p className="text-sm text-muted-foreground">Trạng thái hoàn thành do bạn tự xác nhận — không tự động đánh dấu khi mở bài hay xem video.</p>
            </div>
            <Button variant={status === "completed" ? "outline" : "success"} onClick={toggleComplete}>
              <CircleCheck /> {status === "completed" ? "Bỏ đánh dấu" : "Đánh dấu đã học xong"}
            </Button>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {prev ? (
              <Link to={lessonPath(prev)} className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm hover:bg-muted">
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
              <Link to={lessonPath(next)} className="flex items-center justify-end gap-2 rounded-lg border border-border p-3 text-right text-sm hover:bg-muted">
                <span className="min-w-0">
                  <span className="block text-xs text-muted-foreground">Bài tiếp theo</span>
                  <span className="block truncate font-medium">{next.title}</span>
                </span>
                <ArrowRight className="size-4 shrink-0" aria-hidden />
              </Link>
            )}
          </div>
        </div>
      </article>

      {showAside && (
        <aside className="sticky top-20 hidden max-h-[calc(100dvh-6rem)] w-80 shrink-0 overflow-y-auto rounded-2xl border border-border bg-card scrollbar-thin xl:block" aria-label="Panel bài học">
          {panel}
        </aside>
      )}

      {!showAside && (
        <>
          <Button
            className={cn("fixed bottom-5 right-4 z-30 rounded-full shadow-lg safe-bottom", wide && "bottom-6")}
            onClick={() => (wide ? setUi({ rightPanelOpen: true }) : setSheetOpen(true))}
            aria-label="Mở mục lục, công thức, ghi chú"
          >
            <ListTree /> Mục lục & ghi chú
          </Button>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent side="bottom" title={lesson.title}>
              {panel}
            </SheetContent>
          </Sheet>
        </>
      )}
    </div>
  );
}
