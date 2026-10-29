import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { STATUS_ICON } from "@/components/common/badges";
import type { NodeStatus } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { KnowledgeNode } from "@/types/schema";
import { NODE_SIZE } from "./layout";

export type KGNodeData = {
  node: KnowledgeNode;
  status: NodeStatus;
  dimmed: boolean;
  selected: boolean;
  direction: "LR" | "TB";
};
export type KGFlowNode = Node<KGNodeData, "kg">;

const STATUS_STYLE: Record<NodeStatus, string> = {
  "not-started": "border-border",
  "in-progress": "border-info/70",
  completed: "border-success/80 bg-success/8",
  "needs-review": "border-warning bg-warning/10",
};
const STATUS_ICON_COLOR: Record<NodeStatus, string> = {
  "not-started": "text-muted-foreground",
  "in-progress": "text-info",
  completed: "text-success",
  "needs-review": "text-warning",
};
const CATEGORY_DOT: Record<KnowledgeNode["category"], string> = {
  "khai-niem": "bg-theory",
  "nguyen-ly": "bg-example",
  "mo-hinh": "bg-[oklch(0.6_0.15_300)]",
  "tinh-toan": "bg-exercise",
  "tong-quan": "bg-primary",
};

export const KGNode = memo(function KGNode({ data }: NodeProps<KGFlowNode>) {
  const { node, status, dimmed, selected, direction } = data;
  const Icon = STATUS_ICON[status];
  const size = NODE_SIZE[node.kind];
  const lr = direction === "LR";
  return (
    <div
      style={{ width: size.width, height: size.height }}
      className={cn(
        "flex items-center gap-2 rounded-xl border-2 bg-card px-3 text-left shadow-xs transition-opacity",
        STATUS_STYLE[status],
        node.kind === "chapter" && "border-primary bg-primary text-primary-foreground",
        node.kind === "concept" && "rounded-lg border",
        dimmed && "opacity-25",
        selected && "ring-2 ring-ring ring-offset-2 ring-offset-background",
      )}
    >
      <Handle type="target" position={lr ? Position.Left : Position.Top} className="!size-1.5 !min-h-0 !min-w-0 !border-0 !bg-muted-foreground/40" />
      {node.kind !== "chapter" && <Icon className={cn("size-4 shrink-0", STATUS_ICON_COLOR[status])} aria-hidden />}
      <div className="min-w-0 flex-1">
        <p className={cn("line-clamp-2 leading-tight", node.kind === "chapter" ? "text-[13px] font-bold" : node.kind === "topic" ? "text-[13px] font-semibold" : "text-xs")}>{node.label}</p>
      </div>
      {node.kind !== "chapter" && <span className={cn("size-2 shrink-0 rounded-full", CATEGORY_DOT[node.category])} aria-hidden />}
      <Handle type="source" position={lr ? Position.Right : Position.Bottom} className="!size-1.5 !min-h-0 !min-w-0 !border-0 !bg-muted-foreground/40" />
    </div>
  );
});

export const CATEGORY_LABEL: Record<KnowledgeNode["category"], string> = {
  "tong-quan": "Tổng quan",
  "khai-niem": "Khái niệm",
  "nguyen-ly": "Nguyên lý / quy tắc",
  "mo-hinh": "Mô hình / lý thuyết",
  "tinh-toan": "Tính toán / kỹ năng",
};
export { CATEGORY_DOT };
