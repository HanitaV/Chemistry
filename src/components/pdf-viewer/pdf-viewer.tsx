import { useCallback, useEffect, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "pdfjs-dist/web/pdf_viewer.css";
import { ChevronLeft, ChevronRight, Download, ExternalLink, Loader2, MoveHorizontal, Search, TriangleAlert, X, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

type Source = { url: string } | { data: Blob };

interface Props {
  source: Source;
  /** URL để mở tab mới / tải xuống */
  openUrl: string;
  fileName: string;
  page: number;
  onPageChange: (page: number) => void;
  onPageCount?: (n: number) => void;
}

interface Hit {
  page: number;
  snippet: string;
}

export default function PdfViewer({ source, openUrl, fileName, page, onPageChange, onPageCount }: Props) {
  const [doc, setDoc] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number | "fit">("fit");
  const [rendering, setRendering] = useState(false);
  const [pageInput, setPageInput] = useState(String(page));
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeQuery, setActiveQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const textCache = useRef(new Map<number, string>());
  const [width, setWidth] = useState(0);
  const lastScale = useRef(1);

  // Tải tài liệu (chỉ khi mở trang đọc — không tải khi khởi động ứng dụng)
  useEffect(() => {
    let cancelled = false;
    let task: pdfjs.PDFDocumentLoadingTask | null = null;
    setDoc(null);
    setError(null);
    textCache.current.clear();
    setHits(null);
    (async () => {
      try {
        const params = "url" in source ? { url: source.url } : { data: new Uint8Array(await source.data.arrayBuffer()) };
        task = pdfjs.getDocument(params);
        const d = await task.promise;
        if (cancelled) return;
        setDoc(d);
        setNumPages(d.numPages);
        onPageCount?.(d.numPages);
      } catch (e) {
        if (!cancelled) setError((e as Error).message || "Không mở được tài liệu PDF.");
      }
    })();
    return () => {
      cancelled = true;
      void task?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, ["url" in source ? source.url : source.data]);

  useEffect(() => setPageInput(String(page)), [page]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const cs = getComputedStyle(el);
      setWidth(el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);

  // Vẽ trang hiện tại
  useEffect(() => {
    if (!doc || !canvasRef.current || !width) return;
    let cancelled = false;
    let renderTask: pdfjs.RenderTask | null = null;
    let textLayer: pdfjs.TextLayer | null = null;
    const p = Math.min(Math.max(page, 1), doc.numPages);
    setRendering(true);
    (async () => {
      try {
        const pdfPage = await doc.getPage(p);
        if (cancelled) return;
        const base = pdfPage.getViewport({ scale: 1 });
        const fitScale = Math.max(0.3, (Math.min(width, 1100) - 2) / base.width);
        const s = scale === "fit" ? fitScale : scale;
        lastScale.current = s;
        const viewport = pdfPage.getViewport({ scale: s });
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        const canvas = canvasRef.current!;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        renderTask = pdfPage.render({ canvas, viewport, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined });
        await renderTask.promise;
        if (cancelled) return;
        // Lớp văn bản: cho phép chọn/copy chữ và tô sáng kết quả tìm kiếm
        const tl = textLayerRef.current!;
        tl.innerHTML = "";
        tl.style.width = `${Math.floor(viewport.width)}px`;
        tl.style.height = `${Math.floor(viewport.height)}px`;
        tl.style.setProperty("--scale-factor", String(s));
        textLayer = new pdfjs.TextLayer({ textContentSource: pdfPage.streamTextContent(), container: tl, viewport });
        await textLayer.render();
        if (cancelled) return;
        if (activeQuery) {
          const q = activeQuery.toLocaleLowerCase("vi");
          tl.querySelectorAll("span").forEach((span) => {
            if (span.textContent?.toLocaleLowerCase("vi").includes(q)) span.classList.add("clh-hit");
          });
        }
      } catch (e) {
        if (!cancelled && (e as Error).name !== "RenderingCancelledException") setError((e as Error).message);
      } finally {
        if (!cancelled) setRendering(false);
      }
    })();
    return () => {
      cancelled = true;
      renderTask?.cancel();
      textLayer?.cancel();
    };
  }, [doc, page, scale, width, activeQuery]);

  const go = useCallback((p: number) => onPageChange(Math.min(Math.max(1, p), numPages || 1)), [numPages, onPageChange]);

  // Phím tắt ← →
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === "PageDown") go(page + 1);
      if (e.key === "ArrowLeft" || e.key === "PageUp") go(page - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, page]);

  const runSearch = async () => {
    const q = query.trim();
    if (!doc || !q) return;
    setSearching(true);
    setActiveQuery(q);
    const found: Hit[] = [];
    const needle = q.toLocaleLowerCase("vi");
    for (let i = 1; i <= doc.numPages; i++) {
      let text = textCache.current.get(i);
      if (text === undefined) {
        const pg = await doc.getPage(i);
        const tc = await pg.getTextContent();
        text = tc.items.map((it) => ("str" in it ? it.str : "")).join(" ").replace(/\s+/g, " ");
        textCache.current.set(i, text);
      }
      const idx = text.toLocaleLowerCase("vi").indexOf(needle);
      if (idx >= 0) found.push({ page: i, snippet: text.slice(Math.max(0, idx - 40), idx + q.length + 60) });
    }
    setHits(found);
    setSearching(false);
  };

  const zoom = (delta: number) => {
    const base = scale === "fit" ? lastScale.current : scale;
    setScale(Math.min(4, Math.max(0.4, Math.round((base + delta) * 10) / 10)));
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <style>{`.clh-hit{background:color-mix(in oklch,var(--warning) 55%,transparent);border-radius:2px}.textLayer ::selection{background:color-mix(in oklch,var(--primary) 35%,transparent)}`}</style>
      <div className="sticky top-14 z-20 flex flex-wrap items-center gap-1.5 border-b border-border bg-background/95 px-2 py-2 backdrop-blur sm:px-3">
        <Button variant="outline" size="icon-sm" onClick={() => go(page - 1)} disabled={page <= 1} aria-label="Trang trước">
          <ChevronLeft />
        </Button>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(pageInput);
            if (Number.isFinite(n)) go(n);
          }}
          className="flex items-center gap-1 text-sm"
        >
          <Input value={pageInput} onChange={(e) => setPageInput(e.target.value)} inputMode="numeric" className="h-9 w-14 px-2 text-center" aria-label="Số trang" />
          <span className="text-muted-foreground">/ {numPages || "…"}</span>
        </form>
        <Button variant="outline" size="icon-sm" onClick={() => go(page + 1)} disabled={!numPages || page >= numPages} aria-label="Trang sau">
          <ChevronRight />
        </Button>
        <span className="mx-1 hidden h-6 w-px bg-border sm:block" />
        <Button variant="ghost" size="icon-sm" onClick={() => zoom(-0.2)} aria-label="Thu nhỏ">
          <ZoomOut />
        </Button>
        <span className="w-12 text-center text-xs text-muted-foreground">{scale === "fit" ? "Vừa" : `${Math.round(scale * 100)}%`}</span>
        <Button variant="ghost" size="icon-sm" onClick={() => zoom(0.2)} aria-label="Phóng to">
          <ZoomIn />
        </Button>
        <Button variant={scale === "fit" ? "secondary" : "ghost"} size="icon-sm" onClick={() => setScale("fit")} aria-label="Vừa chiều rộng" title="Vừa chiều rộng">
          <MoveHorizontal />
        </Button>
        <div className="ml-auto flex items-center gap-1">
          <Button variant={searchOpen ? "secondary" : "ghost"} size="icon-sm" onClick={() => setSearchOpen((v) => !v)} aria-label="Tìm kiếm trong tài liệu">
            <Search />
          </Button>
          <Button variant="ghost" size="icon-sm" asChild>
            <a href={openUrl} target="_blank" rel="noopener noreferrer" aria-label="Mở trong tab mới" title="Mở trong tab mới">
              <ExternalLink />
            </a>
          </Button>
          <Button variant="ghost" size="icon-sm" asChild>
            <a href={openUrl} download={fileName} aria-label="Tải xuống" title="Tải xuống">
              <Download />
            </a>
          </Button>
        </div>
        {searchOpen && (
          <div className="flex w-full flex-col gap-2 pt-1">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void runSearch();
              }}
            >
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm văn bản trong PDF (ví dụ: Rydberg)" className="h-9" aria-label="Từ khóa tìm kiếm" />
              <Button type="submit" size="sm" disabled={searching || !query.trim()}>
                {searching ? <Loader2 className="animate-spin" /> : <Search />} Tìm
              </Button>
              {activeQuery && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    setActiveQuery("");
                    setHits(null);
                    setQuery("");
                  }}
                  aria-label="Xóa tìm kiếm"
                >
                  <X />
                </Button>
              )}
            </form>
            {hits && (
              <div className="max-h-40 overflow-y-auto rounded-lg border border-border bg-card text-sm">
                {hits.length === 0 ? (
                  <p className="p-3 text-muted-foreground">
                    Không tìm thấy “{activeQuery}”. Lưu ý: nhiều trang slide là hình ảnh nên không có lớp văn bản để tìm kiếm.
                  </p>
                ) : (
                  <ul>
                    {hits.map((h) => (
                      <li key={h.page}>
                        <button type="button" onClick={() => go(h.page)} className={cn("flex w-full gap-3 px-3 py-2 text-left hover:bg-muted cursor-pointer", h.page === page && "bg-accent")}>
                          <span className="shrink-0 font-medium">Tr. {h.page}</span>
                          <span className="line-clamp-1 text-muted-foreground">…{h.snippet}…</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div ref={containerRef} className="relative flex-1 overflow-auto bg-muted/50 p-0 sm:p-4">
        {error ? (
          <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center">
            <TriangleAlert className="size-7 text-warning" aria-hidden />
            <p className="text-sm">Không hiển thị được PDF: {error}</p>
            <Button asChild size="sm">
              <a href={openUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink /> Mở tài liệu trong tab mới
              </a>
            </Button>
          </div>
        ) : (
          <div className="relative mx-auto w-fit shadow-md">
            <canvas ref={canvasRef} className="block bg-white" aria-label={`Trang ${page} của ${fileName}`} />
            <div ref={textLayerRef} className="textLayer absolute left-0 top-0" />
            {(rendering || !doc) && (
              <div className="absolute inset-0 flex min-h-40 items-center justify-center bg-background/40">
                <Loader2 className="size-5 animate-spin text-muted-foreground" aria-label="Đang tải trang" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
