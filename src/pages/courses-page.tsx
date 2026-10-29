import { Link } from "react-router";
import { ArrowRight, BookOpen, Dumbbell, FileText, PlaySquare } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-header";
import { Progress } from "@/components/ui/progress";
import { useProgressMaps } from "@/hooks/use-progress";
import { chaptersOfCourse, content, lessonsOfCourse } from "@/lib/content";
import { pct } from "@/lib/utils";

export default function CoursesPage() {
  const { lessonCompleted } = useProgressMaps();
  return (
    <PageContainer>
      <PageHeader title="Môn học" description="Các môn học hiện có trên website. Nội dung được tổ chức theo chương, bài học, bài tập và tài liệu." />
      <div className="grid gap-4 md:grid-cols-2">
        {content.courses.map((course) => {
          const lessons = lessonsOfCourse(course.id);
          const done = lessons.filter((l) => lessonCompleted.has(l.id)).length;
          const chapters = chaptersOfCourse(course.id);
          return (
            <Link key={course.id} to={`/courses/${course.id}`} className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50">
              <div className="flex items-start gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <BookOpen className="size-6" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold group-hover:text-primary">{course.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{course.description}</p>
                </div>
              </div>
              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <li>{chapters.length} chương</li>
                <li className="flex items-center gap-1"><BookOpen className="size-3.5" aria-hidden /> {lessons.length} bài học</li>
                <li className="flex items-center gap-1"><Dumbbell className="size-3.5" aria-hidden /> {content.exercises.filter((e) => e.courseId === course.id).length} bài tập</li>
                <li className="flex items-center gap-1"><PlaySquare className="size-3.5" aria-hidden /> {content.segments.filter((s) => s.courseId === course.id).length} đoạn video</li>
                <li className="flex items-center gap-1"><FileText className="size-3.5" aria-hidden /> {content.documents.filter((d) => d.courseId === course.id).length} tài liệu</li>
              </ul>
              <Progress value={pct(done, lessons.length)} className="mt-4" label="Tiến độ môn học" />
              <p className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{pct(done, lessons.length)}% hoàn thành</span>
                <span className="flex items-center gap-1 font-medium text-primary">
                  Vào học <ArrowRight className="size-3.5" />
                </span>
              </p>
            </Link>
          );
        })}
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Muốn thêm môn học hoặc chương mới? Xem hướng dẫn trong <code className="rounded bg-muted px-1">CONTENT_GUIDE.md</code> của repository — chỉ cần thêm file JSON/Markdown, không phải sửa giao diện.
      </p>
    </PageContainer>
  );
}
