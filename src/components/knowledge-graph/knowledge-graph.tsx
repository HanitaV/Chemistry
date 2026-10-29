import { useEffect, useMemo } from "react";
import { Background, Controls, MarkerType, MiniMap, ReactFlow, ReactFlowProvider, useReactFlow, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodesOfCourse } from "@/lib/content";
import type { NodeStatus } from "@/lib/db";
import type { KnowledgeNode } from "@/types/schema";
import { KGNode, type KGFlowNode } from "./graph-node";
import { layoutNodes, NODE_SIZE } from "./layout";

export interface GraphFilters {
  chapterId: string; // "all" hoặc id chương
  status: NodeStatus | "all";
  category: KnowledgeNode["category"] | "all";
  showConcepts: boolean;
  edges: { prerequisite: boolean; hierarchy: boolean; related: boolean; application: boolean; next: boolean };
  direction: "LR" | "TB";
}

export const DEFAULT_FILTERS: GraphFilters = {
  chapterId: "all",
  status: "all",
  category: "all",
  showConcepts: false,
  edges: { prerequisite: true, hierarchy: true, related: false, application: false, next: false },
  direction: "LR",
};

const nodeTypes = { kg: KGNode };

const EDGE_STYLE = {
  hierarchy: { stroke: "var(--muted-foreground)", strokeOpacity: 0.35, strokeDasharray: "4 4", strokeWidth: 1.2 },
  prerequisite: { stroke: "var(--primary)", strokeWidth: 1.8 },
  related: { stroke: "var(--info)", strokeDasharray: "2 4", strokeWidth: 1.4 },
  application: { stroke: "var(--warning)", strokeWidth: 1.6, strokeDasharray: "6 3" },
  next: { stroke: "var(--success)", strokeWidth: 1.4 },
} as const;

function Canvas({
  courseId,
  filters,
  selectedId,
  onSelect,
  statusOf,
  compactMiniMap,
  focus,
}: {
  courseId: string;
  filters: GraphFilters;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  statusOf: (id: string) => NodeStatus;
  compactMiniMap?: boolean;
  /** yêu cầu di chuyển khung nhìn tới node (thay đổi `nonce` để kích hoạt lại) */
  focus?: { id: string; nonce: number } | null;
}) {
  const { fitView, getNode, setCenter } = useReactFlow();

  const visible = useMemo(() => {
    return nodesOfCourse(courseId).filter(
      (n) => (filters.chapterId === "all" || n.chapterId === filters.chapterId) && (filters.showConcepts || n.kind !== "concept"),
    );
  }, [courseId, filters.chapterId, filters.showConcepts]);

  const positions = useMemo(() => layoutNodes(visible, filters.direction), [visible, filters.direction]);

  const nodes: KGFlowNode[] = useMemo(
    () =>
      visible.map((n) => {
        const status = statusOf(n.id);
        const dimmed =
          n.kind !== "chapter" && ((filters.status !== "all" && status !== filters.status) || (filters.category !== "all" && n.category !== filters.category));
        return {
          id: n.id,
          type: "kg",
          position: positions.get(n.id) ?? { x: 0, y: 0 },
          width: NODE_SIZE[n.kind].width,
          height: NODE_SIZE[n.kind].height,
          data: { node: n, status, dimmed, selected: n.id === selectedId, direction: filters.direction },
          draggable: false,
          connectable: false,
        };
      }),
    [visible, positions, statusOf, filters.status, filters.category, filters.direction, selectedId],
  );

  const edges: Edge[] = useMemo(() => {
    const ids = new Set(visible.map((n) => n.id));
    const list: Edge[] = [];
    const add = (kind: keyof typeof EDGE_STYLE, source: string, target: string, arrow: boolean) => {
      if (!ids.has(source) || !ids.has(target)) return;
      const highlighted = selectedId && (source === selectedId || target === selectedId);
      list.push({
        id: `${kind}:${source}->${target}`,
        source,
        target,
        type: kind === "hierarchy" ? "smoothstep" : "default",
        style: { ...EDGE_STYLE[kind], ...(highlighted ? { strokeWidth: 2.6, strokeOpacity: 1 } : {}) },
        markerEnd: arrow ? { type: MarkerType.ArrowClosed, width: 16, height: 16, color: EDGE_STYLE[kind].stroke } : undefined,
        animated: !!highlighted && kind === "prerequisite",
        zIndex: highlighted ? 10 : 0,
      });
    };
    for (const n of visible) {
      if (filters.edges.hierarchy && n.parentId) add("hierarchy", n.parentId, n.id, false);
      if (filters.edges.prerequisite) for (const p of n.prerequisites) add("prerequisite", p, n.id, true);
      if (filters.edges.related) for (const r of n.related) if (n.id < r || !visible.find((x) => x.id === r)?.related.includes(n.id)) add("related", n.id, r, false);
      if (filters.edges.application) for (const a of n.applications) add("application", n.id, a, true);
      if (filters.edges.next) for (const x of n.next) add("next", n.id, x, true);
    }
    return list;
  }, [visible, filters.edges, selectedId]);

  useEffect(() => {
    const t = window.setTimeout(() => void fitView({ padding: 0.12, duration: 300, minZoom: 0.35 }), 50);
    return () => window.clearTimeout(t);
  }, [visible, filters.direction, fitView]);

  // Khi chọn node từ panel chi tiết → di chuyển tới node đó
  useEffect(() => {
    if (!focus) return;
    const n = getNode(focus.id);
    if (n) void setCenter(n.position.x + (n.measured?.width ?? 180) / 2, n.position.y + (n.measured?.height ?? 50) / 2, { zoom: 1.1, duration: 400 });
  }, [focus, getNode, setCenter]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodeClick={(_, n) => onSelect(n.id)}
      onPaneClick={() => onSelect(null)}
      minZoom={0.15}
      maxZoom={2}
      fitView
      fitViewOptions={{ padding: 0.12, minZoom: 0.35 }}
      proOptions={{ hideAttribution: false }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable
      panOnScroll={false}
      zoomOnPinch
      aria-label="Sơ đồ kiến thức"
    >
      <Background gap={24} size={1} color="var(--border)" />
      <Controls showInteractive={false} position="bottom-left" />
      {!compactMiniMap && (
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => {
            const d = n.data as KGFlowNode["data"];
            if (d.node.kind === "chapter") return "#0f766e";
            return d.status === "completed" ? "#16a34a" : d.status === "needs-review" ? "#d97706" : d.status === "in-progress" ? "#2563eb" : "#94a3b8";
          }}
          maskColor="color-mix(in oklch, var(--background) 70%, transparent)"
          className="!rounded-lg !border !border-border"
        />
      )}
    </ReactFlow>
  );
}

export default function KnowledgeGraph(props: Parameters<typeof Canvas>[0]) {
  return (
    <ReactFlowProvider>
      <Canvas {...props} />
    </ReactFlowProvider>
  );
}
