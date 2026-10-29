import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CircleCheck, CircleX, Eye, Lightbulb, RotateCcw, Trophy } from "lucide-react";
import { Markdown } from "@/components/common/markdown";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { gradeStep, type StepAnswer } from "@/lib/grading";
import type { StepResult } from "@/lib/db";
import { recordWrongAnswer, saveAttempt, scoreGuided } from "@/lib/progress";
import { cn } from "@/lib/utils";
import type { WithCourse } from "@/lib/content";
import type { Exercise } from "@/types/schema";
import { correctAnswerText, emptyAnswer, isAnswerEmpty, StepInput } from "./step-input";
import { diagnoseWrong } from "./feedback";

interface StepState {
  answer: StepAnswer;
  attempts: number;
  correct: boolean;
  firstTry: boolean;
  revealed: boolean;
  feedback: { kind: "correct" | "wrong" | "info"; text: string } | null;
  showHint: boolean;
}

const initialStates = (ex: Exercise): StepState[] =>
  ex.steps.map((s) => ({ answer: emptyAnswer(s), attempts: 0, correct: false, firstTry: false, revealed: false, feedback: null, showHint: false }));

export function GuidedExercise({ exercise, onFinished }: { exercise: WithCourse<Exercise>; onFinished?: (score: number) => void }) {
  const [states, setStates] = useState<StepState[]>(() => initialStates(exercise));
  const [current, setCurrent] = useState(0);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const startedAt = useRef(Date.now());
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    setStates(initialStates(exercise));
    setCurrent(0);
    setFinished(false);
    startedAt.current = Date.now();
  }, [exercise]);

  const steps = exercise.steps;
  const doneCount = states.filter((s) => s.correct || s.revealed).length;

  const update = (i: number, patch: Partial<StepState>) => setStates((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  const check = (i: number) => {
    const step = steps[i];
    const st = states[i];
    if (isAnswerEmpty(st.answer)) {
      update(i, { feedback: { kind: "info", text: "Hãy nhập hoặc chọn câu trả lời trước khi kiểm tra." } });
      return;
    }
    const res = gradeStep(step, st.answer);
    if (res.message && !res.correct) {
      update(i, { feedback: { kind: "info", text: res.message } });
      return;
    }
    const attempts = st.attempts + 1;
    if (res.correct) {
      update(i, { attempts, correct: true, firstTry: attempts === 1, feedback: { kind: "correct", text: step.explanation } });
    } else {
      const diag = diagnoseWrong(step, st.answer);
      void recordWrongAnswer(exercise.id, step.id, Array.isArray(st.answer) ? st.answer.join(",") : st.answer);
      update(i, {
        attempts,
        feedback: { kind: "wrong", text: diag ?? (step.hint && !st.showHint ? "Chưa đúng. Hãy thử xem gợi ý." : "Chưa đúng. Thử lại nhé.") },
        showHint: st.showHint || (attempts >= 1 && !!step.hint && attempts >= 2),
      });
    }
  };

  const reveal = (i: number) => {
    const step = steps[i];
    const answer =
      step.type === "multiple-choice" ? step.correctAnswer : step.type === "single-choice" || step.type === "formula-selection" ? step.correctAnswer : states[i].answer;
    update(i, { revealed: true, answer, feedback: { kind: "info", text: `**Đáp án:** ${correctAnswerText(step)}\n\n${step.explanation}` } });
  };

  const next = (i: number) => {
    if (i + 1 < steps.length) {
      setCurrent(i + 1);
      requestAnimationFrame(() => stepRefs.current[i + 1]?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    } else finish();
  };

  const finish = () => {
    const results: StepResult[] = steps.map((s, i) => ({
      stepId: s.id,
      correct: states[i].correct,
      attempts: states[i].attempts,
      firstTry: states[i].firstTry,
      revealed: states[i].revealed,
    }));
    const sc = scoreGuided(results);
    setScore(sc);
    setFinished(true);
    void saveAttempt({
      exerciseId: exercise.id,
      courseId: exercise.courseId,
      chapterId: exercise.chapterId,
      skill: exercise.skill,
      mode: "guided",
      startedAt: startedAt.current,
      finishedAt: Date.now(),
      stepResults: results,
      score: sc,
    });
    onFinished?.(sc);
  };

  const restart = () => {
    setStates(initialStates(exercise));
    setCurrent(0);
    setFinished(false);
    startedAt.current = Date.now();
  };

  const visibleSteps = useMemo(() => steps.slice(0, current + 1), [steps, current]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Progress value={(doneCount / Math.max(steps.length, 1)) * 100} className="h-1.5" label="Tiến độ các bước" />
        <span className="shrink-0 text-xs text-muted-foreground">
          {doneCount}/{steps.length} bước
        </span>
      </div>

      <ol className="flex flex-col gap-3">
        {visibleSteps.map((step, i) => {
          const st = states[i];
          const locked = st.correct || st.revealed;
          return (
            <li
              key={step.id}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
              className={cn(
                "rounded-xl border border-border bg-card p-4",
                i === current && !locked && "border-exercise/60 ring-1 ring-exercise/30",
                st.correct && "border-success/40",
              )}
            >
              <div className="mb-3 flex items-start gap-3">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full bg-exercise/12 text-sm font-semibold text-exercise",
                    st.correct && "bg-success/15 text-success",
                    st.revealed && !st.correct && "bg-warning/20",
                  )}
                >
                  {st.correct ? <CircleCheck className="size-4" /> : i + 1}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Bước {i + 1}</p>
                  <Markdown compact className="font-medium">
                    {step.prompt}
                  </Markdown>
                </div>
              </div>

              <StepInput step={step} value={st.answer} onChange={(v) => update(i, { answer: v, feedback: st.feedback?.kind === "info" ? null : st.feedback })} onSubmit={() => !locked && check(i)} disabled={locked} reveal={locked} />

              {st.showHint && step.hint && !locked && (
                <div className="mt-3 flex gap-2 rounded-lg bg-info/8 p-3 text-sm">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />
                  <Markdown compact>{step.hint}</Markdown>
                </div>
              )}

              {st.feedback && (
                <div
                  role="status"
                  className={cn(
                    "mt-3 flex gap-2 rounded-lg p-3 text-sm",
                    st.feedback.kind === "correct" && "bg-success/10",
                    st.feedback.kind === "wrong" && "bg-destructive/8",
                    st.feedback.kind === "info" && "bg-muted",
                  )}
                >
                  {st.feedback.kind === "correct" ? (
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  ) : st.feedback.kind === "wrong" ? (
                    <CircleX className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    {st.feedback.kind === "correct" && <p className="mb-1 font-semibold text-success">Chính xác!</p>}
                    <Markdown compact>{st.feedback.text}</Markdown>
                  </div>
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {!locked && (
                  <>
                    <Button size="sm" onClick={() => check(i)}>
                      Kiểm tra
                    </Button>
                    {step.hint && !st.showHint && (
                      <Button size="sm" variant="outline" onClick={() => update(i, { showHint: true })}>
                        <Lightbulb /> Gợi ý
                      </Button>
                    )}
                    {st.attempts >= 2 && (
                      <Button size="sm" variant="ghost" onClick={() => reveal(i)}>
                        <Eye /> Xem đáp án bước này
                      </Button>
                    )}
                  </>
                )}
                {locked && i === current && !finished && (
                  <Button size="sm" onClick={() => next(i)}>
                    {i + 1 < steps.length ? (
                      <>
                        Bước tiếp theo <ArrowRight />
                      </>
                    ) : (
                      <>
                        Hoàn thành & xem lời giải <Trophy />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {finished && (
        <div className="rounded-xl border border-solution/40 bg-solution/5 p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <Trophy className="size-5 text-solution" aria-hidden /> Lời giải tự luận hoàn chỉnh
            </h3>
            <span className="rounded-full bg-card px-3 py-1 text-sm font-medium">
              Điểm: {Math.round(score * 100)}%
            </span>
          </div>
          <Markdown>{exercise.solution}</Markdown>
          <div className="mt-4 rounded-lg bg-card p-3 text-sm">
            <span className="font-semibold">Đáp số: </span>
            {exercise.finalAnswer}
          </div>
          <Button variant="outline" size="sm" className="mt-4" onClick={restart}>
            <RotateCcw /> Làm lại
          </Button>
        </div>
      )}
    </div>
  );
}
