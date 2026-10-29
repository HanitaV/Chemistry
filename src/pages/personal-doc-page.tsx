import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Download, Trash2 } from "lucide-react";
import { Markdown } from "@/components/common/markdown";
import { PageLoader } from "@/components/common/page-loader";
import { Breadcrumbs, PageContainer } from "@/components/layout/page-header";
import { NotesPanel } from "@/components/lesson-viewer/notes-panel";
import { YouTubePlayer } from "@/components/video-player/youtube-player";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { parseYouTubeId } from "@/lib/youtube";
import { downloadBlob } from "@/lib/utils";
import NotFoundPage from "./not-found-page";

const PdfViewer = lazy(() => import("@/components/pdf-viewer/pdf-viewer"));

/** Phân tích CSV đơn giản (hỗ trợ dấu ngoặc kép, dấu phẩy hoặc chấm phẩy) */
function parseCsv(text: string): string[][] {
  const sep = (text.split("\n")[0].match(/;/g)?.length ?? 0) > (text.split("\n")[0].match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === sep) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim()));
}

export default function PersonalDocPage() {
  const { docId } = useParams();
  const id = Number(docId);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const doc = useLiveQuery(() => (Number.isFinite(id) ? db.personalDocs.get(id) : undefined), [id], null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!doc?.blob) return;
    const url = URL.createObjectURL(doc.blob);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [doc?.blob]);

  const csv = useMemo(() => (doc?.kind === "csv" && doc.text ? parseCsv(doc.text) : null), [doc]);

  if (doc === null) return <PageLoader />;
  if (!doc) return <NotFoundPage what="Tài liệu cá nhân" />;

  const download = () => {
    const blob = doc.blob ?? new Blob([doc.text ?? doc.url ?? ""], { type: doc.mime || "text/plain" });
    downloadBlob(blob, doc.name);
  };
  const remove = async () => {
    if (!window.confirm(`Xóa “${doc.name}”?`)) return;
    await db.personalDocs.delete(doc.id!);
    navigate("/library");
  };

  const header = (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
      <div className="min-w-0">
        <Breadcrumbs items={[{ label: "Thư viện", to: "/library" }, { label: "Tài liệu cá nhân" }, { label: doc.name }]} />
        <h1 className="truncate text-xl font-bold">{doc.name}</h1>
      </div>
      <div className="flex gap-2">
        {doc.kind !== "youtube" && (
          <Button variant="outline" size="sm" onClick={download}>
            <Download /> Tải xuống
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => void remove()}>
          <Trash2 className="text-destructive" /> Xóa
        </Button>
      </div>
    </div>
  );

  if (doc.kind === "pdf" && doc.blob) {
    const page = Math.max(1, Number(params.get("page")) || 1);
    return (
      <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
        <div className="px-4 pt-4 sm:px-6">{header}</div>
        <Suspense fallback={<PageLoader label="Đang tải trình đọc PDF…" />}>
          <PdfViewer source={{ data: doc.blob }} openUrl={objectUrl ?? "#"} fileName={doc.name} page={page} onPageChange={(p) => setParams({ page: String(p) }, { replace: true })} />
        </Suspense>
      </div>
    );
  }

  const yt = doc.kind === "youtube" && doc.url ? parseYouTubeId(doc.url) : null;

  return (
    <PageContainer>
      {header}
      {doc.kind === "markdown" && (
        <div className="rounded-xl border border-border bg-card p-5">
          <Markdown>{doc.text ?? ""}</Markdown>
        </div>
      )}
      {doc.kind === "json" && (
        <pre className="max-h-[70vh] overflow-auto rounded-xl border border-border bg-card p-4 text-xs">{JSON.stringify(JSON.parse(doc.text ?? "null"), null, 2)}</pre>
      )}
      {doc.kind === "text" && <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-card p-4 text-sm">{doc.text}</pre>}
      {doc.kind === "image" && objectUrl && <img src={objectUrl} alt={doc.name} className="mx-auto max-h-[75vh] rounded-xl border border-border bg-white object-contain" />}
      {csv && (
        <div className="overflow-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {csv[0]?.map((h, i) => (
                  <th key={i} className="whitespace-nowrap px-3 py-2 text-left font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csv.slice(1, 1001).map((r, i) => (
                <tr key={i} className="border-t border-border">
                  {r.map((c, j) => (
                    <td key={j} className="whitespace-nowrap px-3 py-1.5">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {csv.length > 1001 && <p className="p-3 text-xs text-muted-foreground">Chỉ hiển thị 1000 dòng đầu.</p>}
        </div>
      )}
      {yt && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <YouTubePlayer youtubeId={yt.id} startSeconds={yt.start ?? 0} segmentKey={yt.id} title={doc.name} />
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="mb-2 text-sm font-semibold">Ghi chú</p>
            <NotesPanel targetType="document" targetId={`personal-${doc.id}`} />
          </div>
        </div>
      )}
      {doc.kind !== "youtube" && doc.kind !== "pdf" && (
        <div className="mt-6 rounded-xl border border-border bg-card p-4">
          <p className="mb-2 text-sm font-semibold">Ghi chú</p>
          <NotesPanel targetType="document" targetId={`personal-${doc.id}`} />
        </div>
      )}
    </PageContainer>
  );
}
