import { useCallback, useState } from "react";
import { useSearchParams } from "react-router";
import { SlidersHorizontal, X } from "lucide-react";
import KnowledgeGraph, { DEFAULT_FILTERS, type GraphFilters } from "@/components/knowledge-graph/knowledge-graph";
import { CATEGORY_DOT, CATEGORY_LABEL } from "@/components/knowledge-graph/graph-node";
import { NodeDetails } from "@/components/knowledge-graph/node-details";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsDesktop } from "@/hooks/use-media-query";
import { useProgressMaps } from "@/hooks/use-progress";
import { chaptersOfCourse, content, getNode } from "@/lib/content";
import type { NodeStatus } from "@/lib/db";
import { NODE_STATUS_LABEL } from "@/lib/progress";
import { cn } from "@/lib/utils";

const EDGE_LABEL: Record<keyof GraphFilters["edges"], { label: string; swatch: string }> = {
  prerequisite: { label: "Tiên quyết", swatch: "border-t-2 border-primary" },
  hierarchy: { label: "Cấu trúc (cha–con)", swatch: "border-t-2 border-dashed border-muted-foreground/50" },
  related: { label: "Liên quan", swatch: "border-t-2 border-dotted border-info" },
  application: { label: "Ứng dụng", swatch: "border-t-2 border-dashed border-warning" },
  next: { label: "Học tiếp theo", swatch: "border-t-2 border-success" },
};

export default function GraphPage() {
  const course = content.courses[0];
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("node");
  const [filters, setFilters] = useState<GraphFilters>(() => ({ ...DEFAULT_FILTERS, chapterId: params.get("chapter") ?? "all" }));
  const [showFilters, setShowFilters] = useState(false);
  const [focus, setFocus] = useState<{ id: string; nonce: number } | null>(null);
  const desktop = useIsDesktop();
  const { nodeMap } = useProgressMaps();
  const statusOf = useCallback((id: string): NodeStatus => nodeMap.get(id) ?? "not-started", [nodeMap]);

  const select = (id: string | null, fromPanel = false) => {
    const next = new URLSearchParams(params);
    if (id) next.set("node", id);
    else next.delete("node");
    setParams(next, { replace: true });
    if (id && fromPanel) {
      const n = getNode(id);
      if (n && filters.chapterId !== "all" && n.chapterId !== filters.chapterId) setFilters((f) => ({ ...f, chapterId: "all" }));
      if (n?.kind === "concept" && !filters.showConcepts) setFilters((f) => ({ ...f, showConcepts: true }));
      setFocus({ id, nonce: Date.now() });
    }
  };

  const filterPanel = (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="f-chapter">Chương</Label>
        <Select id="f-chapter" value={filters.chapterId} onChange={(e) => setFilters({ ...filters, chapterId: e.target.value })}>
          <option value="all">Tất cả chương</option>
          {chaptersOfCourse(course.id).map((c) => (
            <option key={c.id} value={c.id}>
              Chương {c.order}: {c.title}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="f-status">Mức độ hoàn thành</Label>
        <Select id="f-status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value as GraphFilters["status"] })}>
          <option value="all">Tất cả trạng thái</option>
          {(Object.keys(NODE_STATUS_LABEL) as NodeStatus[]).map((s) => (
            <option key={s} value={s}>
              {NODE_STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="f-cat">Loại kiến thức</Label>
        <Select id="f-cat" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value as GraphFilters["category"] })}>
          <option value="all">Tất cả loại</option>
          {(Object.keys(CATEGORY_LABEL) as (keyof typeof CATEGORY_LABEL)[])
            .filter((k) => k !== "tong-quan")
            .map((k) => (
              <option key={k} value={k}>
                {CATEGORY_LABEL[k]}
              </option>
            ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="f-dir">Bố cục</Label>
        <Select id="f-dir" value={filters.direction} onChange={(e) => setFilters({ ...filters, direction: e.target.value as "LR" | "TB" })}>
          <option value="LR">Trái → phải</option>
          <option value="TB">Trên → dưới</option>
        </Select>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:col-span-2 lg:col-span-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className="size-4 accent-[var(--primary)]" checked={filters.showConcepts} onChange={(e) => setFilters({ ...filters, showConcepts: e.target.checked })} />
          Hiện khái niệm chi tiết
        </label>
        <span className="text-sm text-muted-foreground">Quan hệ:</span>
        {(Object.keys(EDGE_LABEL) as (keyof GraphFilters["edges"])[]).map((k) => (
          <label key={k} className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-[var(--primary)]"
              checked={filters.edges[k]}
              onChange={(e) => setFilters({ ...filters, edges: { ...filters.edges, [k]: e.target.checked } })}
            />
            <span className={cn("inline-block w-5", EDGE_LABEL[k].swatch)} aria-hidden />
            {EDGE_LABEL[k].label}
          </label>
        ))}
      </div>
    </div>
  );

  const details = selectedId ? <NodeDetails nodeId={selectedId} statusOf={statusOf} onSelect={(id) => select(id, true)} /> : null;

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <div className="border-b border-border px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Sơ đồ kiến thức — {course.title}</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">Nhấn vào một node để xem mô tả, kiến thức tiên quyết, bài học, video và bài tập. Kéo để di chuyển, chụm/cuộn để phóng to.</p>
          </div>
          <Button variant={showFilters ? "secondary" : "outline"} size="sm" onClick={() => setShowFilters((v) => !v)} aria-expanded={showFilters}>
            <SlidersHorizontal /> Bộ lọc
          </Button>
        </div>
        {showFilters && <div className="mt-3">{filterPanel}</div>}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          {(Object.keys(CATEGORY_LABEL) as (keyof typeof CATEGORY_LABEL)[])
            .filter((k) => k !== "tong-quan")
            .map((k) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className={cn("size-2 rounded-full", CATEGORY_DOT[k])} aria-hidden /> {CATEGORY_LABEL[k]}
              </span>
            ))}
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm border-2 border-success" aria-hidden /> Đã hoàn thành
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm border-2 border-warning" aria-hidden /> Cần ôn lại
          </span>
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1">
          <KnowledgeGraph courseId={course.id} filters={filters} selectedId={selectedId} onSelect={(id) => select(id)} statusOf={statusOf} compactMiniMap={!desktop} focus={focus} />
        </div>
        {desktop && selectedId && (
          <aside className="relative w-[360px] shrink-0 overflow-y-auto border-l border-border bg-card scrollbar-thin" aria-label="Chi tiết kiến thức">
            <button type="button" onClick={() => select(null)} className="absolute right-2 top-2 rounded-md p-1.5 text-muted-foreground hover:bg-muted cursor-pointer" aria-label="Đóng chi tiết">
              <X className="size-4" />
            </button>
            {details}
          </aside>
        )}
      </div>
      {!desktop && (
        <Sheet open={!!selectedId} onOpenChange={(o) => !o && select(null)}>
          <SheetContent side="bottom" title={getNode(selectedId ?? undefined)?.label ?? "Chi tiết"}>
            {details}
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
