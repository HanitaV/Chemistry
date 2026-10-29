import { Link } from "react-router";
import { CircleCheck, FileText, ListTree, NotebookPen, PlaySquare, Sigma } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { documentPath, getDocument, getSegment, lessonToc, formulasOfLesson, videoPath } from "@/lib/content";
import type { LessonStatus } from "@/lib/db";
import { formatClock, cn } from "@/lib/utils";
import { Tex } from "@/components/common/tex";
import type { Lesson } from "@/types/schema";
import { NotesPanel } from "./notes-panel";

export function LessonPanel({
  lesson,
  status,
  onToggleComplete,
  activeHeading,
  onNavigate,
}: {
  lesson: Lesson;
  status: LessonStatus;
  onToggleComplete: () => void;
  activeHeading?: string;
  onNavigate?: () => void;
}) {
  const toc = lessonToc(lesson);
  const formulas = formulasOfLesson(lesson);
  const segments = lesson.videoSegmentIds.map(getSegment).filter((s) => !!s);
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    onNavigate?.();
  };
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className={cn("rounded-lg border p-3", status === "completed" ? "border-success/40 bg-success/8" : "border-border bg-muted/40")}>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Trạng thái</p>
        <p className="mt-0.5 text-sm font-medium">{status === "completed" ? "Đã học xong" : status === "in-progress" ? "Đang học" : "Chưa học"}</p>
        <Button size="xs" variant={status === "completed" ? "outline" : "success"} className="mt-2 w-full" onClick={onToggleComplete}>
          <CircleCheck /> {status === "completed" ? "Bỏ đánh dấu hoàn thành" : "Đánh dấu đã học xong"}
        </Button>
      </div>

      <Tabs defaultValue="toc">
        <TabsList className="grid h-auto w-full grid-cols-5">
          <TabsTrigger value="toc" aria-label="Mục lục" title="Mục lục" className="px-0">
            <ListTree />
          </TabsTrigger>
          <TabsTrigger value="formulas" aria-label="Công thức liên quan" title="Công thức" className="px-0">
            <Sigma />
          </TabsTrigger>
          <TabsTrigger value="videos" aria-label="Video liên quan" title="Video" className="px-0">
            <PlaySquare />
          </TabsTrigger>
          <TabsTrigger value="docs" aria-label="Tài liệu tham khảo" title="Tài liệu" className="px-0">
            <FileText />
          </TabsTrigger>
          <TabsTrigger value="notes" aria-label="Ghi chú" title="Ghi chú" className="px-0">
            <NotebookPen />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="toc">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mục lục</p>
          <ul className="flex flex-col gap-0.5 text-sm">
            {toc.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => scrollTo(t.id)}
                  className={cn(
                    "w-full rounded-md px-2 py-1.5 text-left hover:bg-muted cursor-pointer",
                    t.level === 3 && "pl-5 text-xs text-muted-foreground",
                    activeHeading === t.id && "bg-accent font-medium text-accent-foreground",
                  )}
                >
                  {t.title}
                </button>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="formulas">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Công thức liên quan</p>
          {formulas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Bài này không có công thức tính toán.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {formulas.map((f) => (
                <li key={f.id}>
                  <button type="button" onClick={() => scrollTo(`formula-${f.id}`)} className="w-full rounded-lg border border-border bg-card p-2.5 text-left hover:border-primary/50 cursor-pointer">
                    <p className="text-xs font-medium">{f.name}</p>
                    <div className="mt-1 overflow-x-auto text-sm">
                      <Tex math={f.latex} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="videos">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Video liên quan</p>
          {segments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có video cho bài này.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {segments.map((s) => (
                <li key={s!.id}>
                  <Link to={videoPath(s!.id)} onClick={onNavigate} className="block rounded-lg border border-border bg-card p-2.5 hover:border-primary/50">
                    <p className="text-sm font-medium">{s!.titleVi}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatClock(s!.startSeconds)} – {formatClock(s!.endSeconds)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="docs">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tài liệu tham khảo</p>
          <ul className="flex flex-col gap-2">
            {lesson.sources.map((s, i) => {
              const doc = getDocument(s.documentId);
              if (!doc) return null;
              return (
                <li key={i} className="rounded-lg border border-border bg-card p-2.5">
                  <p className="text-sm font-medium">{doc.title}</p>
                  {s.note && <p className="mt-0.5 text-xs text-muted-foreground">{s.note}</p>}
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {(s.pages ?? [1]).map((p) => (
                      <Link key={p} to={documentPath(doc.id, p)} onClick={onNavigate} className="rounded bg-muted px-1.5 py-0.5 text-xs hover:bg-accent">
                        tr. {p}
                      </Link>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </TabsContent>

        <TabsContent value="notes">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ghi chú bài học</p>
          <NotesPanel targetType="lesson" targetId={lesson.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
