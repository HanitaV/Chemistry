import type { Step } from "@/types/schema";
import { expressionsEquivalent, ExpressionError } from "./math-expression";

/**
 * Đọc số do người học nhập. Chấp nhận:
 *  1.2e-18 · 1,2e-18 · 1,2×10^-18 · 1.2*10^(-18) · 1,2.10^-18 · −3,8 · 2,04 x 10^-18
 */
export function parseNumberInput(raw: string): number | null {
  let s = raw.trim().replace(/\s+/g, "").replace(/[−–]/g, "-");
  if (!s) return null;
  // a×10^b, a×10^(b), a×10-18 (có dấu), a.10^b (dấu chấm làm phép nhân kiểu Việt Nam), a*10**b
  s = s.replace(/\*\*/g, "^").replace(/[×xX·∙*]/g, "×");
  const sci =
    /^([-+]?[0-9]*[.,]?[0-9]+)×10(?:\^\(?([-+]?[0-9]+)\)?|([-+][0-9]+))$/.exec(s) ??
    /^([-+]?[0-9]*[.,]?[0-9]+)\.10\^\(?([-+]?[0-9]+)\)?$/.exec(s);
  if (sci) {
    const mantissa = Number(sci[1].replace(",", "."));
    const exp = Number(sci[2] ?? sci[3]);
    return Number.isFinite(mantissa) ? mantissa * Math.pow(10, exp) : null;
  }
  const tenPow = /^10\^\(?([-+]?[0-9]+)\)?$/.exec(s);
  if (tenPow) return Math.pow(10, Number(tenPow[1]));
  // dấu phẩy thập phân; bỏ dấu phân cách nghìn kiểu "1.046,5"
  if (/^[-+]?[0-9]{1,3}(\.[0-9]{3})+,[0-9]+$/.test(s)) s = s.replace(/\./g, "").replace(",", ".");
  else s = s.replace(",", ".");
  if (!/^[-+]?([0-9]+\.?[0-9]*|\.[0-9]+)(e[-+]?[0-9]+)?$/i.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function normalizeShortAnswer(s: string, caseSensitive = false): string {
  const sup: Record<string, string> = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁺": "+", "⁻": "-" };
  let out = s
    .normalize("NFC")
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]/g, (c) => sup[c])
    .replace(/[−–]/g, "-")
    .replace(/[\s^_{}()$]/g, "")
    .trim();
  if (!caseSensitive) out = out.toLowerCase();
  return out;
}

export type StepAnswer = string | string[];

export interface GradeResult {
  correct: boolean;
  /** Thông báo khi không chấm được (ví dụ nhập sai định dạng) */
  message?: string;
}

export function gradeStep(step: Step, answer: StepAnswer): GradeResult {
  switch (step.type) {
    case "single-choice":
    case "formula-selection":
      return { correct: answer === step.correctAnswer };
    case "multiple-choice": {
      const chosen = new Set(Array.isArray(answer) ? answer : [answer]);
      const expected = new Set(step.correctAnswer);
      return { correct: chosen.size === expected.size && [...expected].every((x) => chosen.has(x)) };
    }
    case "numeric": {
      const value = parseNumberInput(String(answer));
      if (value === null) return { correct: false, message: "Không đọc được số. Ví dụ hợp lệ: 2,04e-18 hoặc 2,04×10^-18" };
      const { relative, absolute } = step.tolerance;
      const diff = Math.abs(value - step.correctAnswer);
      const tol = absolute ?? (relative ?? 0.01) * Math.abs(step.correctAnswer);
      return { correct: diff <= tol + Math.abs(step.correctAnswer) * 1e-9 };
    }
    case "short-answer": {
      const given = normalizeShortAnswer(String(answer), step.caseSensitive);
      return { correct: step.correctAnswer.some((a) => normalizeShortAnswer(a, step.caseSensitive) === given) };
    }
    case "math-expression": {
      try {
        return { correct: expressionsEquivalent(String(answer), step.correctAnswer, step.variables) };
      } catch (e) {
        if (e instanceof ExpressionError) return { correct: false, message: e.message };
        return { correct: false, message: "Biểu thức không hợp lệ" };
      }
    }
  }
}
