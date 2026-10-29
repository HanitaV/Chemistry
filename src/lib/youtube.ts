/** Tải YouTube IFrame Player API một lần duy nhất. */

export interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getPlayerState(): number;
  loadVideoById(opts: { videoId: string; startSeconds?: number; endSeconds?: number }): void;
  cueVideoById(opts: { videoId: string; startSeconds?: number; endSeconds?: number }): void;
  destroy(): void;
}

interface YTNamespace {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string;
      host?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (e: { target: YTPlayer }) => void;
        onStateChange?: (e: { data: number; target: YTPlayer }) => void;
        onError?: (e: { data: number }) => void;
      };
    },
  ) => YTPlayer;
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number; BUFFERING: number; CUED: number };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let loader: Promise<YTNamespace> | null = null;

export function loadYouTubeApi(timeoutMs = 15000): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (loader) return loader;
  loader = new Promise<YTNamespace>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      loader = null;
      reject(new Error("Không tải được YouTube Player API (có thể do mạng hoặc trình chặn quảng cáo)."));
    }, timeoutMs);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      window.clearTimeout(timer);
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      window.clearTimeout(timer);
      loader = null;
      reject(new Error("Không tải được YouTube Player API."));
    };
    document.head.appendChild(script);
  });
  return loader;
}

/** Trích YouTube ID từ URL bất kỳ (watch, youtu.be, embed, shorts) */
export function parseYouTubeId(url: string): { id: string; start?: number } | null {
  try {
    const u = new URL(url.trim());
    let id: string | null = null;
    if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1);
    else if (u.hostname.includes("youtube.com")) {
      id = u.searchParams.get("v");
      if (!id) {
        const m = /\/(embed|shorts|live)\/([^/?]+)/.exec(u.pathname);
        id = m?.[2] ?? null;
      }
    }
    if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
    const t = u.searchParams.get("t") ?? u.searchParams.get("start");
    let start: number | undefined;
    if (t) {
      const m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/.exec(t);
      if (m) start = Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
    }
    return { id, start };
  } catch {
    return null;
  }
}
