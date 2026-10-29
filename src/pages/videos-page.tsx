import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { ChevronLeft, ChevronRight, ExternalLink, Info, NotebookPen, PlaySquare } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-header";
import { NotesPanel } from "@/components/lesson-viewer/notes-panel";
import { YouTubePlayer, type YouTubePlayerHandle } from "@/components/video-player/youtube-player";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/common/page-loader";
import { useStudyTimer } from "@/hooks/use-study-timer";
import { chaptersOfCourse, content, getNode, getSegment, lessonPath, getLesson } from "@/lib/content";
import { db } from "@/lib/db";
import { saveVideoPosition } from "@/lib/progress";
import { cn, formatClock, youtubeUrl } from "@/lib/utils";

export default function VideosPage() {
  const [params, setParams] = useSearchParams();
  const positions = useLiveQuery(() => db.videoPositions.toArray(), []);
  const posMap = useMemo(() => new Map((positions ?? []).map((p) => [p.segmentId, p])), [positions]);
  const segments = content.segments;
  const fallbackId = useMemo(() => [...(positions ?? [])].sort((a, b) => b.updatedAt - a.updatedAt)[0]?.segmentId ?? segments[0]?.id, [positions, segments]);
  const segmentId = params.get("segment") ?? fallbackId;
  const segment = getSegment(segmentId) ?? segments[0];
  const index = segments.findIndex((s) => s.id === segment?.id);
  const playerRef = useRef<YouTubePlayerHandle>(null);
  const lastSave = useRef(0);
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  useStudyTimer("video");

  // vị trí bắt đầu: tiếp tục từ vị trí đã lưu nếu còn trong đoạn
  const startAt = useMemo(() => {
    if (!segment) return 0;
    const saved = posMap.get(segment.id)?.seconds;
    return saved && saved > segment.startSeconds + 5 && saved < segment.endSeconds - 10 ? saved : segment.startSeconds;
    // chỉ tính khi đổi đoạn, không tính lại khi vị trí được lưu
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segment?.id, positions === undefined]);

  useEffect(() => setCurrentTime(null), [segment?.id]);

  if (!segment) return null;
  if (positions === undefined) return <PageLoader />;
  const go = (id: string) => setParams({ segment: id });
  const prev = segments[index - 1];
  const next = segments[index + 1];
  const topics = segment.topicIds.map(getNode).filter((n) => !!n);
  const lessonIds = [...new Set(topics.map((t) => t!.lessonId).filter((x): x is string => !!x))];
  const course = content.courses[0];

  const onTime = (t: number) => {
    setCurrentTime(t);
    if (Date.now() - lastSave.current > 5000) {
      lastSave.current = Date.now();
      void saveVideoPosition(segment.id, segment.youtubeId, t);
    }
  };

  return (
    <PageContainer wide>
      <PageHeader
        title="Video bài giảng"
        description={
          <>
            Nguồn: <span className="font-medium text-foreground">{content.videos[0]?.title}</span> (YouTube, tiếng Anh) — chia thành các đoạn theo chủ đề của từng chương.
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <YouTubePlayer
            ref={playerRef}
            youtubeId={segment.youtubeId}
            startSeconds={startAt}
            endSeconds={segment.endSeconds}
            segmentKey={segment.id}
            autoplay={params.has("segment")}
            onTime={onTime}
            title={segment.titleVi}
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Đang học · Chương {content.chapterById.get(segment.chapterId)?.order}</p>
              <h2 className="text-xl font-bold leading-tight">{segment.titleVi}</h2>
              <p className="text-sm text-muted-foreground">
                {segment.title} · {formatClock(segment.startSeconds)} – {formatClock(segment.endSeconds)}
                {currentTime !== null && <> · đang ở {formatClock(currentTime)}</>}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button variant="outline" size="sm" disabled={!prev} onClick={() => prev && go(prev.id)} aria-label="Đoạn trước">
                <ChevronLeft /> Trước
              </Button>
              <Button variant="outline" size="sm" disabled={!next} onClick={() => next && go(next.id)} aria-label="Đoạn tiếp theo">
                Tiếp <ChevronRight />
              </Button>
              <Button variant="secondary" size="sm" asChild>
                <a href={youtubeUrl(segment.youtubeId, currentTime ?? startAt)} target="_blank" rel="noopener noreferrer">
                  <ExternalLink /> Xem trên YouTube
                </a>
              </Button>
            </div>
          </div>

          {(topics.length > 0 || lessonIds.length > 0) && (
            <div className="mt-4 rounded-xl border border-border bg-card p-4 text-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Chủ đề trong đoạn này</p>
              <div className="flex flex-wrap gap-1.5">
                {topics.map((t) => (
                  <Link key={t!.id} to={`/graph?node=${t!.id}`} className="rounded-full border border-border px-2.5 py-1 text-xs hover:border-primary hover:text-primary">
                    {t!.label}
                  </Link>
                ))}
              </div>
              {lessonIds.length > 0 && (
                <p className="mt-3">
                  Bài học tương ứng:{" "}
                  {lessonIds.map((id, i) => {
                    const l = getLesson(id)!;
                    return (
                      <span key={id}>
                        {i > 0 && ", "}
                        <Link to={lessonPath(l)} className="font-medium text-primary hover:underline">
                          {l.title}
                        </Link>
                      </span>
                    );
                  })}
                </p>
              )}
            </div>
          )}

          <div className="mt-4 rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <NotebookPen className="size-4 text-primary" aria-hidden /> Ghi chú theo thời điểm
            </h3>
            <NotesPanel
              targetType="video"
              targetId={segment.id}
              youtubeId={segment.youtubeId}
              placeholder="Ghi chú cho thời điểm đang xem (ví dụ: công thức Rydberg ở phút này)…"
              getVideoTime={() => playerRef.current?.getCurrentTime() ?? currentTime ?? undefined}
              onSeek={(s) => playerRef.current?.seekTo(s)}
            />
          </div>
          <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden /> Vị trí xem được lưu tự động để lần sau tiếp tục. Mở video không tự động đánh dấu bài học hoàn thành.
          </p>
        </div>

        <aside aria-label="Danh sách đoạn video" className="min-w-0">
          <div className="rounded-xl border border-border bg-card lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto scrollbar-thin">
            {chaptersOfCourse(course.id).map((ch) => (
              <div key={ch.id}>
                <p className="sticky top-0 z-10 border-b border-border bg-card/95 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur">
                  Chương {ch.order}: {ch.title}
                </p>
                <ul>
                  {segments
                    .filter((s) => s.chapterId === ch.id)
                    .map((s) => {
                      const pos = posMap.get(s.id)?.seconds;
                      const progress = pos ? Math.min(100, Math.max(0, ((pos - s.startSeconds) / (s.endSeconds - s.startSeconds)) * 100)) : 0;
                      const active = s.id === segment.id;
                      return (
                        <li key={s.id}>
                          <button
                            type="button"
                            onClick={() => go(s.id)}
                            aria-current={active ? "true" : undefined}
                            className={cn("flex w-full items-start gap-3 px-4 py-2.5 text-left text-sm hover:bg-muted cursor-pointer", active && "bg-accent")}
                          >
                            <PlaySquare className={cn("mt-0.5 size-4 shrink-0", active ? "text-destructive" : "text-muted-foreground")} aria-hidden />
                            <span className="min-w-0 flex-1">
                              <span className={cn("block", active && "font-semibold")}>{s.titleVi}</span>
                              <span className="block font-mono text-[11px] text-muted-foreground">
                                {formatClock(s.startSeconds)} · {Math.round((s.endSeconds - s.startSeconds) / 60)} phút
                              </span>
                              {progress > 0 && (
                                <span className="mt-1 block h-1 overflow-hidden rounded-full bg-muted">
                                  <span className="block h-full bg-destructive/70" style={{ width: `${progress}%` }} />
                                </span>
                              )}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
