import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { ExternalLink, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadYouTubeApi, type YTPlayer } from "@/lib/youtube";
import { formatClock, youtubeUrl } from "@/lib/utils";

export interface YouTubePlayerHandle {
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number | undefined;
  play: () => void;
  pause: () => void;
}

interface Props {
  youtubeId: string;
  startSeconds: number;
  endSeconds?: number;
  /** đổi giá trị này để tải lại đoạn (ví dụ id của segment) */
  segmentKey: string;
  autoplay?: boolean;
  onTime?: (seconds: number) => void;
  title: string;
}

const ERROR_TEXT: Record<number, string> = {
  2: "Tham số video không hợp lệ.",
  5: "Trình duyệt không phát được video HTML5 này.",
  100: "Video không tồn tại hoặc đã bị gỡ.",
  101: "Chủ sở hữu không cho phép nhúng video này.",
  150: "Chủ sở hữu không cho phép nhúng video này.",
};

/** Trình phát YouTube (IFrame Player API) giữ tỷ lệ 16:9, có phương án dự phòng mở YouTube. */
export const YouTubePlayer = forwardRef<YouTubePlayerHandle, Props>(function YouTubePlayer(
  { youtubeId, startSeconds, endSeconds, segmentKey, autoplay = false, onTime, title },
  ref,
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const readyRef = useRef(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string>("");
  const onTimeRef = useRef(onTime);
  onTimeRef.current = onTime;
  const firstLoad = useRef(true);

  useImperativeHandle(ref, () => ({
    seekTo: (s) => {
      playerRef.current?.seekTo(s, true);
      playerRef.current?.playVideo();
    },
    getCurrentTime: () => (readyRef.current ? playerRef.current?.getCurrentTime() : undefined),
    play: () => playerRef.current?.playVideo(),
    pause: () => playerRef.current?.pauseVideo(),
  }));

  // Tạo player một lần
  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !hostRef.current) return;
        const target = document.createElement("div");
        hostRef.current.appendChild(target);
        playerRef.current = new YT.Player(target, {
          videoId: youtubeId,
          host: "https://www.youtube-nocookie.com",
          playerVars: {
            start: Math.floor(startSeconds),
            ...(endSeconds ? { end: Math.floor(endSeconds) } : {}),
            autoplay: autoplay ? 1 : 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            hl: "vi",
            cc_lang_pref: "vi",
          },
          events: {
            onReady: () => {
              readyRef.current = true;
              setStatus("ready");
            },
            onError: (e) => {
              setError(ERROR_TEXT[e.data] ?? "Không phát được video.");
              setStatus("error");
            },
          },
        });
        timer = window.setInterval(() => {
          const p = playerRef.current;
          if (!readyRef.current || !p) return;
          try {
            if (p.getPlayerState() === 1) onTimeRef.current?.(p.getCurrentTime());
          } catch {
            /* player đã bị hủy */
          }
        }, 1000);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message);
        setStatus("error");
      });
    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
      readyRef.current = false;
      try {
        playerRef.current?.destroy();
      } catch {
        /* bỏ qua */
      }
      playerRef.current = null;
      if (hostRef.current) hostRef.current.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeId]);

  // Đổi đoạn video
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    const p = playerRef.current;
    if (!p || !readyRef.current) return;
    const opts = { videoId: youtubeId, startSeconds: Math.floor(startSeconds), endSeconds: endSeconds ? Math.floor(endSeconds) : undefined };
    if (autoplay) p.loadVideoById(opts);
    else p.cueVideoById(opts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segmentKey]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black">
      <div ref={hostRef} className="absolute inset-0 [&>iframe]:size-full" title={title} />
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-white/80">
          <Loader2 className="size-4 animate-spin" aria-hidden /> Đang tải video…
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-900 p-6 text-center text-white">
          <TriangleAlert className="size-7 text-amber-400" aria-hidden />
          <p className="max-w-sm text-sm">{error}</p>
          <p className="text-xs text-white/70">Bạn vẫn có thể xem đoạn này trực tiếp trên YouTube (bắt đầu tại {formatClock(startSeconds)}).</p>
          <Button asChild size="sm">
            <a href={youtubeUrl(youtubeId, startSeconds)} target="_blank" rel="noopener noreferrer">
              <ExternalLink /> Mở trên YouTube
            </a>
          </Button>
        </div>
      )}
    </div>
  );
});
