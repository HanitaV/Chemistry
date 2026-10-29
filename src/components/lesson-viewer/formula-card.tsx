import { useState } from "react";
import { Check, Copy, TriangleAlert } from "lucide-react";
import { Markdown } from "@/components/common/markdown";
import { Tex } from "@/components/common/tex";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Formula } from "@/types/schema";

export function FormulaCard({ formula, compact, className }: { formula: Formula; compact?: boolean; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(formula.latex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* trình duyệt không cho phép */
    }
  };
  return (
    <article id={`formula-${formula.id}`} className={cn("min-w-0 overflow-hidden rounded-xl border border-border bg-card", className)}>
      <header className="flex items-start justify-between gap-2 border-b border-border px-4 py-2.5">
        <h4 className="text-sm font-semibold">{formula.name}</h4>
        <Button variant="ghost" size="xs" onClick={copy} aria-label="Sao chép LaTeX">
          {copied ? <Check /> : <Copy />} {copied ? "Đã chép" : "LaTeX"}
        </Button>
      </header>
      <div className="px-4 py-3">
        <div className="overflow-x-auto rounded-lg bg-muted/60 px-3 py-2 text-center">
          <Tex math={formula.latex} display />
        </div>
        {!compact && (
          <div className="mt-3 grid gap-3 text-sm">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ý nghĩa ký hiệu</p>
              <ul className="grid gap-1">
                {formula.symbols.map((s) => (
                  <li key={s.symbol} className="flex flex-wrap gap-x-2">
                    <span className="min-w-12 font-medium">
                      <Tex math={s.symbol} />
                    </span>
                    <span className="text-muted-foreground">
                      — {s.meaning}
                      {s.unit ? ` (${s.unit})` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <p>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Đơn vị: </span>
              {formula.unit}
            </p>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Điều kiện áp dụng</p>
              <ul className="list-disc space-y-1 pl-5">
                {formula.conditions.map((c) => (
                  <li key={c}>
                    <Markdown compact className="[&_p]:inline">
                      {c}
                    </Markdown>
                  </li>
                ))}
              </ul>
            </div>
            {formula.warning && (
              <div className="flex gap-2 rounded-lg bg-warning/12 p-2.5">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
                <Markdown compact>{formula.warning}</Markdown>
              </div>
            )}
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ví dụ ngắn</p>
              <Markdown compact>{formula.example}</Markdown>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
