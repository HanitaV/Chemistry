import { useState } from "react";
import { Link } from "react-router";
import { ExternalLink, Play, PlaySquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { videoPath } from "@/lib/content";
import { formatClock, youtubeUrl } from "@/lib/utils";
import type { VideoSegment } from "@/types/schema";
import { YouTubePlayer } from "./youtube-player";

/** Thẻ đoạn video dùng trong bài học: mở trình phát ngay tại chỗ hoặc sang trang Video. */
export function SegmentCard({ segment }: { segment: VideoSegment }) {
  const [open, setOpen] = useState(false);
  const duration = segment.endSeconds - segment.startSeconds;
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
          <PlaySquare className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{segment.titleVi}</p>
          <p className="text-xs text-muted-foreground">
            {segment.title} · {formatClock(segment.startSeconds)}–{formatClock(segment.endSeconds)} ({Math.round(duration / 60)} phút)
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button size="xs" variant={open ? "secondary" : "default"} onClick={() => setOpen((v) => !v)}>
            {open ? <X /> : <Play />} {open ? "Đóng" : "Xem tại đây"}
          </Button>
          <Button size="xs" variant="outline" asChild>
            <Link to={videoPath(segment.id)}>Trang video</Link>
          </Button>
          <Button size="xs" variant="ghost" asChild>
            <a href={youtubeUrl(segment.youtubeId, segment.startSeconds)} target="_blank" rel="noopener noreferrer" aria-label="Mở trên YouTube">
              <ExternalLink />
            </a>
          </Button>
        </div>
      </div>
      {open && (
        <div className="mt-3">
          <YouTubePlayer youtubeId={segment.youtubeId} startSeconds={segment.startSeconds} endSeconds={segment.endSeconds} segmentKey={segment.id} autoplay title={segment.titleVi} />
        </div>
      )}
    </div>
  );
}
