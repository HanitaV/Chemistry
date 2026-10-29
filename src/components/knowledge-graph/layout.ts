import { graphlib, layout } from "@dagrejs/dagre";
import type { KnowledgeNode } from "@/types/schema";

export const NODE_SIZE = {
  chapter: { width: 220, height: 64 },
  topic: { width: 196, height: 58 },
  concept: { width: 176, height: 46 },
} as const;

/** Bố trí tự động bằng dagre để các node không chồng lấn. */
export function layoutNodes(nodes: KnowledgeNode[], direction: "LR" | "TB" = "LR") {
  const g = new graphlib.Graph();
  g.setGraph({ rankdir: direction, nodesep: 18, ranksep: direction === "LR" ? 70 : 60, marginx: 20, marginy: 20 });
  g.setDefaultEdgeLabel(() => ({}));
  const ids = new Set(nodes.map((n) => n.id));
  for (const n of nodes) g.setNode(n.id, { ...NODE_SIZE[n.kind] });
  for (const n of nodes) {
    if (n.parentId && ids.has(n.parentId)) g.setEdge(n.parentId, n.id);
    for (const p of n.prerequisites) if (ids.has(p) && p !== n.parentId) g.setEdge(p, n.id, { weight: 2 });
  }
  layout(g);
  const pos = new Map<string, { x: number; y: number }>();
  for (const n of nodes) {
    const p = g.node(n.id) as { x: number; y: number } | undefined;
    const size = NODE_SIZE[n.kind];
    pos.set(n.id, { x: (p?.x ?? 0) - size.width / 2, y: (p?.y ?? 0) - size.height / 2 });
  }
  return pos;
}
