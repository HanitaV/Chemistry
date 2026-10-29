import { useEffect, useRef, useState } from "react";
import { CircleCheck, CircleHelp, CircleX, ClipboardCheck, Send } from "lucide-react";
import { Markdown } from "@/components/common/markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import type { SelfAssessment } from "@/lib/db";
import { saveAttempt, SELF_SCORE } from "@/lib/progress";
import { cn, formatClock, safeLocalStorage } from "@/lib/utils";
import type { WithCourse } from "@/lib/content";
import type { Exercise } from "@/types/schema";

const CHECKLIST = ["Công thức áp dụng", "Biến đổi / lập luận", "Thay số", "Đơn vị", "Kết luận"];

const draftKey = (id: string) => `clh-draft-${id}`;

export function ExamExercise({ exercise }: { exercise: WithCourse<Exercise> }) {
  const [answer, setAnswer] = useState(() => safeLocalStorage()?.getItem(draftKey(exercise.id)) ?? "");
  const [submitted, setSubmitted] = useState(false);
  const [checks, setChecks] = useState<boolean[]>(CHECKLIST.map(() => false));
  const [assessment, setAssessment] = useState<SelfAssessment | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    setAnswer(safeLocalStorage()?.getItem(draftKey(exercise.id)) ?? "");
    setSubmitted(false);
    setAssessment(null);
    setChecks(CHECKLIST.map(() => false));
    startedAt.current = Date.now();
    setElapsed(0);
  }, [exercise.id]);

  useEffect(() => {
    if (submitted) return;
    const t = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => window.clearInterval(t);
  }, [submitted]);

  useEffect(() => {
    const ls = safeLocalStorage();
    if (!ls) return;
    const t = window.setTimeout(() => (answer ? ls.setItem(draftKey(exercise.id), answer) : ls.removeItem(draftKey(exercise.id))), 400);
    return () => window.clearTimeout(t);
  }, [answer, exercise.id]);

  const assess = (a: SelfAssessment) => {
    setAssessment(a);
    void saveAttempt({
      exerciseId: exercise.id,
      courseId: exercise.courseId,
      chapterId: exercise.chapterId,
      skill: exercise.skill,
      mode: "exam",
      startedAt: startedAt.current,
      finishedAt: Date.now(),
      stepResults: [],
      examAnswer: answer,
      selfAssessment: a,
      score: SELF_SCORE[a],
    });
    safeLocalStorage()?.removeItem(draftKey(exercise.id));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="exam-answer" className="text-sm font-semibold">
            Bài làm tự luận của bạn
          </label>
          <span className="font-mono text-xs text-muted-foreground" aria-label="Thời gian làm bài">
            ⏱ {formatClock(elapsed)}
          </span>
        </div>
        <Textarea
          id="exam-answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={submitted}
          placeholder={"Trình bày: công thức → biến đổi → thay số → đơn vị → kết luận.\nCó thể dùng LaTeX giữa dấu $…$, ví dụ $\\Delta E = h\\nu$."}
          className="min-h-56 font-mono text-sm leading-relaxed"
        />
        <p className="mt-2 text-xs text-muted-foreground">Bản nháp được tự động lưu trên trình duyệt này.</p>
        {!submitted && (
          <Button className="mt-3" onClick={() => setSubmitted(true)} disabled={!answer.trim()}>
            <Send /> Nộp bài & xem đáp án mẫu
          </Button>
        )}
      </div>

      {submitted && (
        <>
          {answer.trim() && (
            <details className="rounded-xl border border-border bg-card p-4">
              <summary className="cursor-pointer text-sm font-semibold">Xem lại bài làm (hiển thị công thức)</summary>
              <Markdown className="mt-3">{answer}</Markdown>
            </details>
          )}
          <div className="rounded-xl border border-solution/40 bg-solution/5 p-4 sm:p-5">
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
              <ClipboardCheck className="size-5 text-solution" aria-hidden /> Đáp án mẫu
            </h3>
            <Markdown>{exercise.solution}</Markdown>
            <div className="mt-4 rounded-lg bg-card p-3 text-sm">
              <span className="font-semibold">Đáp số: </span>
              {exercise.finalAnswer}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold">Tự đánh giá</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Website không tự chấm bài tự luận. Hãy so sánh bài làm với đáp án mẫu theo các tiêu chí sau rồi tự đánh giá.
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {CHECKLIST.map((c, i) => (
                <li key={c}>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="size-4 accent-[var(--primary)]"
                      checked={checks[i]}
                      onChange={(e) => setChecks((prev) => prev.map((v, j) => (j === i ? e.target.checked : v)))}
                      disabled={!!assessment}
                    />
                    Bài làm có: {c.toLowerCase()}
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              {(
                [
                  ["correct", "Đúng hoàn toàn", CircleCheck, "success"],
                  ["partial", "Đúng một phần", CircleHelp, "outline"],
                  ["incorrect", "Chưa đúng", CircleX, "outline"],
                ] as const
              ).map(([key, label, Icon, variant]) => (
                <Button
                  key={key}
                  variant={assessment === key ? "default" : variant}
                  size="sm"
                  disabled={!!assessment}
                  onClick={() => assess(key)}
                  className={cn(assessment && assessment !== key && "opacity-50")}
                >
                  <Icon /> {label}
                </Button>
              ))}
            </div>
            {assessment && (
              <p className="mt-3 text-sm" role="status">
                Đã lưu kết quả.{" "}
                {assessment === "correct"
                  ? "Tốt lắm! Dạng bài này được đánh dấu là đã nắm vững."
                  : `Dạng “${exercise.skill}” được đánh dấu cần ôn lại — bạn có thể làm lại ở chế độ Guided.`}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
