import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Đường dẫn tới file tĩnh trong public/ (hoạt động với mọi base path của GitHub Pages). */
export function publicUrl(path: string) {
  return import.meta.env.BASE_URL + path.replace(/^\.?\//, "");
}

export function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(h ? 2 : 1, "0");
  const ss = String(sec).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function formatDuration(totalSeconds: number) {
  const minutes = Math.round(totalSeconds / 60);
  if (minutes < 60) return `${minutes} phút`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} giờ ${m} phút` : `${h} giờ`;
}

export function formatDate(value: number | string | Date, opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric" }) {
  return new Intl.DateTimeFormat("vi-VN", opts).format(new Date(value));
}

export function formatRelative(ts: number) {
  const diff = Date.now() - ts;
  const min = Math.round(diff / 60000);
  if (min < 1) return "vừa xong";
  if (min < 60) return `${min} phút trước`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} ngày trước`;
  return formatDate(ts);
}

/** Ngày theo giờ địa phương dạng YYYY-MM-DD */
export function localDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function pct(part: number, total: number) {
  return total ? Math.round((part / total) * 100) : 0;
}

export function youtubeUrl(youtubeId: string, startSeconds = 0) {
  return `https://www.youtube.com/watch?v=${youtubeId}${startSeconds ? `&t=${Math.floor(startSeconds)}s` : ""}`;
}

export const DIFFICULTY_LABEL = { easy: "Cơ bản", medium: "Trung bình", hard: "Nâng cao" } as const;

export const SOURCE_LABEL = {
  extracted: "Trích từ tài liệu",
  adapted: "Biên soạn lại",
  supplementary: "Bài bổ sung",
} as const;

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function safeLocalStorage() {
  try {
    const k = "__clh_test__";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return window.localStorage;
  } catch {
    return null;
  }
}
