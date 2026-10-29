import { create } from "zustand";
import { db } from "@/lib/db";
import { safeLocalStorage } from "@/lib/utils";

export type ThemePref = "light" | "dark" | "system";
export type FontSize = "sm" | "md" | "lg" | "xl";

export interface UiSettings {
  theme: ThemePref;
  fontSize: FontSize;
  sidebarCollapsed: boolean;
  rightPanelOpen: boolean;
  defaultExerciseMode: "guided" | "exam";
  learnerName: string;
}

interface UiState extends UiSettings {
  hydrated: boolean;
  mobileNavOpen: boolean;
  set: (patch: Partial<UiSettings>) => void;
  setMobileNavOpen: (open: boolean) => void;
  hydrate: () => Promise<void>;
}

const DEFAULTS: UiSettings = {
  theme: "system",
  fontSize: "md",
  sidebarCollapsed: false,
  rightPanelOpen: true,
  defaultExerciseMode: "guided",
  learnerName: "",
};

export function applyTheme(theme: ThemePref) {
  const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

function applyFontSize(size: FontSize) {
  if (size === "md") delete document.documentElement.dataset.fontSize;
  else document.documentElement.dataset.fontSize = size;
}

export const useUi = create<UiState>((set, get) => ({
  ...DEFAULTS,
  hydrated: false,
  mobileNavOpen: false,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  set: (patch) => {
    set(patch);
    const s = get();
    const settings: UiSettings = {
      theme: s.theme,
      fontSize: s.fontSize,
      sidebarCollapsed: s.sidebarCollapsed,
      rightPanelOpen: s.rightPanelOpen,
      defaultExerciseMode: s.defaultExerciseMode,
      learnerName: s.learnerName,
    };
    if (patch.theme) applyTheme(patch.theme);
    if (patch.fontSize) applyFontSize(patch.fontSize);
    const ls = safeLocalStorage();
    ls?.setItem("clh-theme", settings.theme);
    ls?.setItem("clh-font-size", settings.fontSize);
    void db.settings.put({ key: "ui", value: settings }).catch(() => undefined);
  },
  hydrate: async () => {
    try {
      const rec = await db.settings.get("ui");
      const saved = (rec?.value ?? {}) as Partial<UiSettings>;
      const merged = { ...DEFAULTS, ...saved };
      set({ ...merged, hydrated: true });
      applyTheme(merged.theme);
      applyFontSize(merged.fontSize);
    } catch {
      set({ hydrated: true });
    }
  },
}));

// Theo dõi thay đổi giao diện hệ điều hành khi chọn "Theo hệ thống"
if (typeof window !== "undefined") {
  window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
    if (useUi.getState().theme === "system") applyTheme("system");
  });
}
