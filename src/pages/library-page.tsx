import { useRef, useState } from "react";
import { Link } from "react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { FileJson, FileText, FileType, Image as ImageIcon, Info, Link2, Lock, Sheet as SheetIcon, Trash2, Upload, MonitorPlay as YoutubeIcon } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { chaptersOfCourse, content, documentPath, documentsOfChapter } from "@/lib/content";
import { db, type PersonalDocRecord } from "@/lib/db";
import { parseYouTubeId } from "@/lib/youtube";
import { formatRelative } from "@/lib/utils";

const ACCEPT = ".pdf,.md,.markdown,.json,.csv,.png,.jpg,.jpeg,.webp,.txt";
const MAX_BYTES = 60 * 1024 * 1024;

function kindOf(file: File): PersonalDocRecord["kind"] | null {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf") || file.type === "application/pdf") return "pdf";
  if (/\.(md|markdown)$/.test(name)) return "markdown";
  if (name.endsWith(".json")) return "json";
  if (name.endsWith(".csv")) return "csv";
  if (/\.(png|jpe?g|webp)$/.test(name) || /^image\/(png|jpeg|webp)$/.test(file.type)) return "image";
  if (name.endsWith(".txt") || file.type === "text/plain") return "text";
  return null;
}

export const KIND_ICON = { pdf: FileText, markdown: FileType, json: FileJson, csv: SheetIcon, image: ImageIcon, text: FileText, youtube: YoutubeIcon } as const;
export const KIND_LABEL = { pdf: "PDF", markdown: "Markdown", json: "JSON", csv: "CSV", image: "Ảnh", text: "Văn bản", youtube: "YouTube" } as const;

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default function LibraryPage() {
  const personal = useLiveQuery(() => db.personalDocs.orderBy("createdAt").reverse().toArray(), []);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [ytUrl, setYtUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const course = content.courses[0];

  const importFiles = async (files: FileList | File[]) => {
    const ok: string[] = [];
    const bad: string[] = [];
    for (const file of Array.from(files)) {
      const kind = kindOf(file);
      if (!kind) {
        bad.push(`${file.name} (định dạng không hỗ trợ)`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        bad.push(`${file.name} (lớn hơn 60 MB)`);
        continue;
      }
      const textual = kind === "markdown" || kind === "json" || kind === "csv" || kind === "text";
      try {
        const text = textual ? await file.text() : undefined;
        if (kind === "json") JSON.parse(text!);
        await db.personalDocs.add({ name: file.name, kind, mime: file.type || "application/octet-stream", size: file.size, blob: textual ? undefined : file, text, createdAt: Date.now() });
        ok.push(file.name);
      } catch (e) {
        bad.push(`${file.name} (${kind === "json" ? "JSON không hợp lệ" : (e as Error).message})`);
      }
    }
    setMessage(
      bad.length
        ? { kind: "error", text: `Đã thêm ${ok.length} tệp. Không thêm được: ${bad.join("; ")}` }
        : { kind: "ok", text: `Đã thêm ${ok.length} tệp vào thư viện cá nhân.` },
    );
  };

  const addYoutube = async () => {
    const parsed = parseYouTubeId(ytUrl);
    if (!parsed) {
      setMessage({ kind: "error", text: "URL YouTube không hợp lệ." });
      return;
    }
    await db.personalDocs.add({ name: `YouTube ${parsed.id}`, kind: "youtube", mime: "text/uri-list", size: 0, url: ytUrl.trim(), createdAt: Date.now() });
    setYtUrl("");
    setMessage({ kind: "ok", text: "Đã lưu video YouTube vào thư viện cá nhân." });
  };

  return (
    <PageContainer>
      <PageHeader title="Thư viện tài liệu" description="Tài liệu chính thức của môn học và tài liệu cá nhân bạn tự thêm." />

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Tài liệu chính thức — {course.title}</h2>
        <div className="flex flex-col gap-5">
          {chaptersOfCourse(course.id).map((ch) => (
            <div key={ch.id}>
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                Chương {ch.order}: {ch.title}
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {documentsOfChapter(ch.id).map((d) => (
                  <Link key={d.id} to={documentPath(d.id)} className="flex gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50">
                    <FileText className="size-9 shrink-0 text-destructive" aria-hidden />
                    <div className="min-w-0">
                      <p className="font-semibold leading-snug">{d.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{d.description}</p>
                      <p className="mt-1 text-xs text-muted-foreground">PDF · {d.pageCount} trang · {d.kind === "exercises" ? "Bài tập" : "Lý thuyết"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-lg font-semibold">Tài liệu cá nhân</h2>
        <p className="mb-3 flex items-start gap-2 text-sm text-muted-foreground">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden /> Lưu trong IndexedDB của trình duyệt này — không tải lên máy chủ, không đưa vào repository. Hãy dùng “Sao lưu dữ liệu cá nhân” trong Cài đặt để mang sang máy khác.
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              if (e.dataTransfer.files.length) void importFiles(e.dataTransfer.files);
            }}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${dragging ? "border-primary bg-accent/40" : "border-border"}`}
          >
            <Upload className="size-7 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium">Kéo thả tệp vào đây</p>
            <p className="text-xs text-muted-foreground">PDF, Markdown, JSON, CSV, PNG/JPG/WebP, TXT · tối đa 60 MB/tệp</p>
            <input ref={fileRef} type="file" accept={ACCEPT} multiple className="hidden" onChange={(e) => e.target.files && void importFiles(e.target.files).finally(() => (e.target.value = ""))} />
            <Button size="sm" onClick={() => fileRef.current?.click()}>
              Chọn tệp từ máy tính
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Link2 className="size-4" aria-hidden /> Thêm video YouTube
              </CardTitle>
              <CardDescription>Dán đường dẫn video (có thể kèm thời điểm, ví dụ ?t=120).</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  void addYoutube();
                }}
              >
                <Input value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" aria-label="URL YouTube" />
                <Button type="submit" disabled={!ytUrl.trim()}>
                  Thêm
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        {message && (
          <p role="status" className={`mt-3 rounded-lg p-3 text-sm ${message.kind === "ok" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
            {message.text}
          </p>
        )}

        <div className="mt-5">
          {!personal?.length ? (
            <p className="text-sm text-muted-foreground">Chưa có tài liệu cá nhân.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {personal.map((d) => {
                const Icon = KIND_ICON[d.kind];
                return (
                  <li key={d.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                    <Icon className="size-6 shrink-0 text-primary" aria-hidden />
                    <Link to={`/library/personal/${d.id}`} className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium hover:text-primary">{d.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {KIND_LABEL[d.kind]} {d.size ? `· ${formatBytes(d.size)}` : ""} · {formatRelative(d.createdAt)}
                      </p>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Xóa ${d.name}`}
                      onClick={() => {
                        if (window.confirm(`Xóa “${d.name}” khỏi thư viện cá nhân?`)) void db.personalDocs.delete(d.id!);
                      }}
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-6 flex gap-3 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            <span className="font-medium text-foreground">Nhập nâng cao (dự kiến):</span> chuyển Markdown/JSON theo đúng định dạng trong <code className="rounded bg-muted px-1">CONTENT_GUIDE.md</code> thành bài học cá nhân. Website hiện <strong>không</strong> tự động chuyển PDF thành bài giảng — PDF cá nhân chỉ được hiển thị để đọc.
          </p>
        </div>
      </section>
    </PageContainer>
  );
}
