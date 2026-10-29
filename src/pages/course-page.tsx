import { Link, useParams } from "react-router";
import { BookOpen, CircleCheck, CircleDot, Network } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useProgressMaps } from "@/hooks/use-progress";
import { chapterPath, chaptersOfCourse, getCourse, lessonPath, lessonsOfChapter } from "@/lib/content";
import { pct } from "@/lib/utils";
import NotFoundPage from "./not-found-page";

export default function CoursePage() {
  const { courseId } = useParams();
  const course = getCourse(courseId);
  const { lessonCompleted, lessonMap } = useProgressMaps();
  if (!course) return <NotFoundPage what="Môn học" />;
  const chapters = chaptersOfCourse(course.id);
  return (
    <PageContainer>
      <PageHeader
        crumbs={[{ label: "Môn học", to: "/courses" }, { label: course.title }]}
        title={course.title}
        description={course.description}
        actions={
          <Button variant="outline" asChild>
            <Link to="/graph">
              <Network /> Sơ đồ kiến thức
            </Link>
          </Button>
        }
      />
      <div className="flex flex-col gap-4">
        {chapters.map((ch) => {
          const lessons = lessonsOfChapter(ch.id);
          const d = lessons.filter((l) => lessonCompleted.has(l.id)).length;
          return (
            <section key={ch.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">Chương {ch.order}</p>
                  <h2 className="text-lg font-bold">
                    <Link to={chapterPath(ch)} className="hover:text-primary">
                      {ch.title}
                    </Link>
                  </h2>
                  <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{ch.description}</p>
                </div>
                <div className="w-full shrink-0 sm:w-48">
                  <Progress value={pct(d, lessons.length)} label={`Tiến độ chương ${ch.order}`} />
                  <p className="mt-1 text-right text-xs text-muted-foreground">
                    {d}/{lessons.length} bài
                  </p>
                </div>
              </div>
              <ol className="mt-4 grid gap-1.5 sm:grid-cols-2">
                {lessons.map((l) => {
                  const st = lessonMap.get(l.id)?.status;
                  return (
                    <li key={l.id}>
                      <Link to={lessonPath(l)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted">
                        {st === "completed" ? (
                          <CircleCheck className="size-4 shrink-0 text-success" aria-label="Đã học" />
                        ) : st === "in-progress" ? (
                          <CircleDot className="size-4 shrink-0 text-info" aria-label="Đang học" />
                        ) : (
                          <BookOpen className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                        )}
                        <span className="min-w-0 flex-1">
                          {ch.order}.{l.order} {l.title}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">{l.estimatedMinutes}′</span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </PageContainer>
  );
}
