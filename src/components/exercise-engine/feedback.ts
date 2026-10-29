import { parseNumberInput, type StepAnswer } from "@/lib/grading";
import type { Step } from "@/types/schema";

/** Phân tích lỗi thường gặp để đưa ra nhận xét cụ thể hơn "Chưa đúng". */
export function diagnoseWrong(step: Step, answer: StepAnswer): string | null {
  if (step.type === "numeric") {
    const v = parseNumberInput(String(answer));
    const c = step.correctAnswer;
    if (v === null || v === 0 || c === 0) return null;
    if (Math.sign(v) !== Math.sign(c)) {
      if (Math.abs(Math.abs(v) - Math.abs(c)) <= Math.abs(c) * 0.03) return "Độ lớn đúng nhưng sai dấu. Kiểm tra lại quy ước dấu (hấp thụ/phát xạ, thu/tỏa nhiệt, hệ nhận/nhường).";
      return "Kết quả sai dấu so với đáp án.";
    }
    const ratio = Math.abs(v / c);
    const exp = Math.log10(ratio);
    if (Math.abs(exp - Math.round(exp)) < 0.02 && Math.round(exp) !== 0) {
      return `Kết quả lệch đúng 10^${Math.round(exp)} lần — nhiều khả năng sai khi đổi đơn vị (nm ↔ m, kJ ↔ J, kHz ↔ Hz…).`;
    }
    if (Math.abs(ratio - 1000) / 1000 < 0.05 || Math.abs(ratio - 0.001) / 0.001 < 0.05) return "Có vẻ nhầm giữa J và kJ.";
    if (Math.abs(ratio - 2) < 0.05 || Math.abs(ratio - 0.5) < 0.03) return "Kết quả lệch gấp đôi/một nửa — kiểm tra hệ số tỉ lượng hoặc hệ số ½.";
    if (ratio > 0.9 && ratio < 1.1) return "Rất gần đúng — kiểm tra lại cách làm tròn hoặc hằng số đã dùng.";
    return null;
  }
  if (step.type === "multiple-choice" && Array.isArray(answer)) {
    const expected = new Set(step.correctAnswer);
    const missing = step.correctAnswer.filter((x) => !answer.includes(x)).length;
    const extra = answer.filter((x) => !expected.has(x)).length;
    if (missing && !extra) return `Còn thiếu ${missing} lựa chọn đúng.`;
    if (extra && !missing) return `Có ${extra} lựa chọn không đúng.`;
    return `Thiếu ${missing} và thừa ${extra} lựa chọn.`;
  }
  return null;
}
