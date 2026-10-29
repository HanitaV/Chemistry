import { CircleCheck, CircleDashed, CircleDot, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { NodeStatus } from "@/lib/db";
import { DIFFICULTY_LABEL, SOURCE_LABEL } from "@/lib/utils";
import { NODE_STATUS_LABEL } from "@/lib/progress";
import type { Difficulty, Exercise } from "@/types/schema";

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const variant = difficulty === "easy" ? "success" : difficulty === "medium" ? "warning" : "destructive";
  return <Badge variant={variant}>{DIFFICULTY_LABEL[difficulty]}</Badge>;
}

export function SourceBadge({ source }: { source: Exercise["source"] }) {
  const variant = source.kind === "extracted" ? "info" : source.kind === "adapted" ? "secondary" : "outline";
  return <Badge variant={variant}>{SOURCE_LABEL[source.kind]}</Badge>;
}

export const STATUS_ICON = {
  "not-started": CircleDashed,
  "in-progress": CircleDot,
  completed: CircleCheck,
  "needs-review": RotateCcw,
} as const;

export function StatusBadge({ status }: { status: NodeStatus }) {
  const Icon = STATUS_ICON[status];
  const variant = status === "completed" ? "success" : status === "needs-review" ? "warning" : status === "in-progress" ? "info" : "outline";
  return (
    <Badge variant={variant}>
      <Icon aria-hidden /> {NODE_STATUS_LABEL[status]}
    </Badge>
  );
}
