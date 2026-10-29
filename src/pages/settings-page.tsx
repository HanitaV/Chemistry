import { useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Download, HardDrive, Monitor, Moon, RotateCcw, Sun, Upload } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { exportData, importData, resetProgress } from "@/lib/backup";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { useUi, type FontSize, type ThemePref } from "@/stores/ui-store";

export default function SettingsPage() {
  const ui = useUi();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetDocs, setResetDocs] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const counts = useLiveQuery(async () => ({
    lessons: await db.lessonProgress.count(),
    attempts: await db.exerciseAttempts.count(),
    notes: await db.notes.count(),
    docs: await db.personalDocs.count(),
  }));
  const storage = useLiveQuery(async () => {
    try {
      const est = await navigator.storage?.estimate?.();
      const persisted = await navigator.storage?.persisted?.();
      return { usage: est?.usage ?? 0, quota: est?.quota ?? 0, persisted: !!persisted };
    } catch {
      return null;
    }
  });

  const onImport = async (file: File) => {
    try {
      const summary = await importData(file, importMode);
      const n = Object.values(summary.tables).reduce((s, x) => s + x, 0);
      setMessage({ ok: true, text: `Đã nhập ${n} bản ghi tiến độ${summary.personalDocs ? ` và ${summary.personalDocs} tài liệu cá nhân` : ""}.` });
      await ui.hydrate();
    } catch (e) {
      setMessage({ ok: false, text: (e as Error).message });
    }
  };

  const themes: [ThemePref, string, typeof Sun][] = [
    ["light", "Sáng", Sun],
    ["dark", "Tối", Moon],
    ["system", "Theo hệ thống", Monitor],
  ];

  return (
    <PageContainer>
      <PageHeader title="Cài đặt" description="Giao diện, chế độ luyện tập và quản lý dữ liệu cá nhân (lưu trong trình duyệt)." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Giao diện</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="s-name">Tên hiển thị (lời chào trên Dashboard)</Label>
              <Input id="s-name" value={ui.learnerName} onChange={(e) => ui.set({ learnerName: e.target.value })} placeholder="Ví dụ: Phong" maxLength={40} />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Chế độ màu</span>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Chế độ màu">
                {themes.map(([value, label, Icon]) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={ui.theme === value}
                    onClick={() => ui.set({ theme: value })}
                    className={cn("flex flex-col items-center gap-1.5 rounded-lg border border-border p-3 text-sm hover:bg-muted cursor-pointer", ui.theme === value && "border-primary bg-accent ring-1 ring-primary")}
                  >
                    <Icon className="size-5" aria-hidden /> {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="s-font">Cỡ chữ</Label>
              <Select id="s-font" value={ui.fontSize} onChange={(e) => ui.set({ fontSize: e.target.value as FontSize })}>
                <option value="sm">Nhỏ</option>
                <option value="md">Vừa (mặc định)</option>
                <option value="lg">Lớn</option>
                <option value="xl">Rất lớn</option>
              </Select>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" className="size-4 accent-[var(--primary)]" checked={ui.sidebarCollapsed} onChange={(e) => ui.set({ sidebarCollapsed: e.target.checked })} />
              Thu gọn thanh bên (desktop)
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" className="size-4 accent-[var(--primary)]" checked={ui.rightPanelOpen} onChange={(e) => ui.set({ rightPanelOpen: e.target.checked })} />
              Hiện panel bên phải khi học bài (màn hình rộng)
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Luyện tập</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5">
            <Label htmlFor="s-mode">Chế độ mặc định khi mở bài tập</Label>
            <Select id="s-mode" value={ui.defaultExerciseMode} onChange={(e) => ui.set({ defaultExerciseMode: e.target.value as "guided" | "exam" })}>
              <option value="guided">Guided — từng bước (người mới học)</option>
              <option value="exam">Exam — tự luận (luyện thi)</option>
            </Select>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="size-4" aria-hidden /> Dữ liệu cá nhân
            </CardTitle>
            <CardDescription>
              Tiến độ, ghi chú, vị trí video và tài liệu cá nhân chỉ lưu trong IndexedDB của trình duyệt này — không đồng bộ giữa thiết bị. Hãy xuất file sao lưu định kỳ.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <p className="text-sm text-muted-foreground">
              Hiện có: {counts?.lessons ?? 0} bài học đã mở · {counts?.attempts ?? 0} lần làm bài · {counts?.notes ?? 0} ghi chú · {counts?.docs ?? 0} tài liệu cá nhân
              {storage && storage.quota > 0 && (
                <>
                  {" "}
                  · dung lượng {(storage.usage / 1024 / 1024).toFixed(1)} MB / {(storage.quota / 1024 / 1024 / 1024).toFixed(1)} GB
                  {storage.persisted ? " · lưu trữ bền vững" : ""}
                </>
              )}
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-4">
                <p className="font-medium">Export Progress</p>
                <p className="mt-1 text-sm text-muted-foreground">Xuất tiến độ, kết quả bài tập, ghi chú, cài đặt, kế hoạch ôn thi (JSON).</p>
                <Button className="mt-3" variant="outline" onClick={() => void exportData("progress")}>
                  <Download /> Xuất tiến độ
                </Button>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="font-medium">Backup dữ liệu cá nhân</p>
                <p className="mt-1 text-sm text-muted-foreground">Như trên, kèm toàn bộ tài liệu cá nhân (PDF, ảnh…) — file có thể lớn.</p>
                <Button className="mt-3" variant="outline" onClick={() => void exportData("full")}>
                  <Download /> Sao lưu đầy đủ
                </Button>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="font-medium">Import Progress</p>
                <p className="mt-1 text-sm text-muted-foreground">Nhập file sao lưu đã xuất từ website này.</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Select value={importMode} onChange={(e) => setImportMode(e.target.value as "merge" | "replace")} className="w-auto" aria-label="Cách nhập">
                    <option value="merge">Gộp với dữ liệu hiện có</option>
                    <option value="replace">Thay thế dữ liệu hiện có</option>
                  </Select>
                  <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files?.[0] && void onImport(e.target.files[0]).finally(() => (e.target.value = ""))} />
                  <Button variant="outline" onClick={() => fileRef.current?.click()}>
                    <Upload /> Chọn file
                  </Button>
                </div>
              </div>
              <div className="rounded-xl border border-destructive/30 p-4">
                <p className="font-medium">Reset Progress</p>
                <p className="mt-1 text-sm text-muted-foreground">Xóa toàn bộ tiến độ, kết quả, ghi chú, vị trí video. Cài đặt giao diện được giữ lại.</p>
                <Button className="mt-3" variant="destructive" onClick={() => setResetOpen(true)}>
                  <RotateCcw /> Đặt lại tiến độ
                </Button>
              </div>
            </div>
            {message && (
              <p role="status" className={cn("rounded-lg p-3 text-sm", message.ok ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
                {message.text}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đặt lại tiến độ học tập?</DialogTitle>
            <DialogDescription>Thao tác này không thể hoàn tác. Nên xuất file sao lưu trước.</DialogDescription>
          </DialogHeader>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 accent-[var(--destructive)]" checked={resetDocs} onChange={(e) => setResetDocs(e.target.checked)} />
            Xóa cả tài liệu cá nhân
          </label>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm-reset">Gõ XÓA để xác nhận</Label>
            <Input id="confirm-reset" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} autoComplete="off" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              disabled={confirmText.trim().toUpperCase() !== "XÓA"}
              onClick={async () => {
                await resetProgress(resetDocs);
                setResetOpen(false);
                setConfirmText("");
                setMessage({ ok: true, text: "Đã đặt lại tiến độ học tập." });
              }}
            >
              Xóa dữ liệu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
