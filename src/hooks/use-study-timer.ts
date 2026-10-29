import { useEffect } from "react";
import { addStudyTime } from "@/lib/progress";
import type { ActivityKind } from "@/lib/db";

/**
 * Đếm thời gian học khi trang đang hiển thị và người học có tương tác gần đây (≤ 2 phút).
 * Ghi vào IndexedDB mỗi 30 giây và khi rời trang.
 */
export function useStudyTimer(kind: ActivityKind, active = true) {
  useEffect(() => {
    if (!active) return;
    let pending = 0;
    let lastInteraction = Date.now();
    const onActivity = () => (lastInteraction = Date.now());
    const events = ["pointerdown", "keydown", "scroll", "wheel", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    const tick = window.setInterval(() => {
      // video có thể phát mà không có tương tác → coi là hoạt động
      const idleLimit = kind === "video" ? 30 * 60_000 : 2 * 60_000;
      if (document.visibilityState === "visible" && Date.now() - lastInteraction < idleLimit) pending += 5;
      if (pending >= 30) {
        void addStudyTime(kind, pending);
        pending = 0;
      }
    }, 5000);
    const flush = () => {
      if (pending > 0) void addStudyTime(kind, pending);
      pending = 0;
    };
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      window.clearInterval(tick);
      events.forEach((e) => window.removeEventListener(e, onActivity));
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", flush);
    };
  }, [kind, active]);
}
