import { Check } from "lucide-react";
import { Markdown } from "@/components/common/markdown";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { StepAnswer } from "@/lib/grading";
import type { Step } from "@/types/schema";

interface Props {
  step: Step;
  value: StepAnswer;
  onChange: (v: StepAnswer) => void;
  onSubmit: () => void;
  disabled?: boolean;
  /** hiển thị đúng/sai trên lựa chọn sau khi đã chấm đúng hoặc xem đáp án */
  reveal?: boolean;
}

export function emptyAnswer(step: Step): StepAnswer {
  return step.type === "multiple-choice" ? [] : "";
}

export function isAnswerEmpty(v: StepAnswer) {
  return Array.isArray(v) ? v.length === 0 : !v.trim();
}

export function StepInput({ step, value, onChange, onSubmit, disabled, reveal }: Props) {
  if (step.type === "single-choice" || step.type === "formula-selection" || step.type === "multiple-choice") {
    const multi = step.type === "multiple-choice";
    const selected = new Set(Array.isArray(value) ? value : value ? [value] : []);
    const correct = new Set(Array.isArray(step.correctAnswer) ? step.correctAnswer : [step.correctAnswer]);
    return (
      <div role={multi ? "group" : "radiogroup"} className={cn("grid gap-2", step.type === "formula-selection" && "sm:grid-cols-2")}>
        {step.options.map((o) => {
          const isSel = selected.has(o.id);
          const isCorrect = reveal && correct.has(o.id);
          const isWrongSel = reveal && isSel && !correct.has(o.id);
          return (
            <button
              key={o.id}
              type="button"
              role={multi ? "checkbox" : "radio"}
              aria-checked={isSel}
              disabled={disabled}
              onClick={() => {
                if (multi) {
                  const next = new Set(selected);
                  if (next.has(o.id)) next.delete(o.id);
                  else next.add(o.id);
                  onChange([...next]);
                } else onChange(o.id);
              }}
              className={cn(
                "flex min-h-12 w-full items-start gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5 text-left text-sm transition-colors hover:border-primary/50 hover:bg-accent/40 disabled:cursor-default cursor-pointer",
                isSel && "border-primary bg-accent/60 ring-1 ring-primary",
                isCorrect && "border-success bg-success/10 ring-1 ring-success",
                isWrongSel && "border-destructive bg-destructive/8 ring-1 ring-destructive",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center border border-input",
                  multi ? "rounded-[5px]" : "rounded-full",
                  isSel && "border-primary bg-primary text-primary-foreground",
                )}
              >
                {isSel && <Check className="size-3.5" />}
              </span>
              <Markdown compact className="min-w-0 flex-1 [&_p]:m-0">
                {o.text}
              </Markdown>
            </button>
          );
        })}
      </div>
    );
  }

  const placeholder =
    step.type === "numeric"
      ? "Ví dụ: 2,04e-18 hoặc 2,04×10^-18"
      : step.type === "math-expression"
        ? (step.placeholder ?? "Nhập biểu thức, ví dụ: H1 - H2")
        : "Nhập câu trả lời";
  return (
    <form
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="flex flex-1 items-center gap-2">
        <Input
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          inputMode={step.type === "numeric" ? "decimal" : "text"}
          autoComplete="off"
          spellCheck={false}
          className="font-mono"
          aria-label="Câu trả lời"
        />
        {step.type === "numeric" && step.unit && <span className="shrink-0 text-sm text-muted-foreground">{step.unit}</span>}
      </div>
      {step.type === "math-expression" && step.variables.length > 0 && (
        <p className="text-xs text-muted-foreground sm:hidden">Biến: {step.variables.join(", ")}</p>
      )}
    </form>
  );
}

/** Mô tả đáp án đúng của một bước (dùng khi người học chọn "Xem đáp án"). */
export function correctAnswerText(step: Step): string {
  switch (step.type) {
    case "single-choice":
    case "formula-selection":
      return step.options.find((o) => o.id === step.correctAnswer)?.text ?? step.correctAnswer;
    case "multiple-choice":
      return step.options.filter((o) => step.correctAnswer.includes(o.id)).map((o) => o.text).join("; ");
    case "numeric":
      return `${step.correctAnswer.toLocaleString("vi-VN", { maximumSignificantDigits: 4 })}${step.unit ? ` ${step.unit}` : ""}`;
    case "short-answer":
      return step.correctAnswer[0];
    case "math-expression":
      return `\`${step.correctAnswer}\``;
  }
}
