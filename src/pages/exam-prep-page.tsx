import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { BookOpen, CalendarClock, CircleCheck, Dumbbell, Info, RotateCcw, Trash2, TriangleAlert } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useProgressMaps } from "@/hooks/use-progress";
import { chapterPath, chaptersOfCourse, content, exercisePath, getChapter, getLesson, lessonPath } from "@/lib/content";
import { db } from "@/lib/db";
import { buildPlan, planProgressInputs, type PlanItem } from "@/lib/exam-plan";
import { cn, formatDate, formatDuration, localDateKey, pct } from "@/lib/utils";

function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(t);
  }, [intervalMs]);
  return now;
}

export default function ExamPrepPage() {
  const course = content.courses[0];
  const chapters = chaptersOfCourse(course.id);
  const saved = useLiveQuery(() => db.examPlans.get("current"), [], null);
  const { lessonCompleted, lessonMap, exerciseMap, ready } = useProgressMaps();
  const now = useNow();

  const defaultDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return localDateKey(d);
  }, []);
  const [form, setForm] = useState({ examDate: defaultDate, examTime: "07:30", chapterIds: chapters.map((c) => c.id), minutesPerDay: 90 });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (saved) setForm({ examDate: saved.examDate, examTime: saved.examTime, chapterIds: saved.chapterIds, minutesPerDay: saved.minutesPerDay });
  }, [saved]);

  const plan = useMemo(() => {
    if (!saved || !ready) return null;
    return buildPlan({
      examDate: saved.examDate,
      examTime: saved.examTime,
      chapterIds: saved.chapterIds,
      minutesPerDay: saved.minutesPerDay,
      ...planProgressInputs(lessonMap, exerciseMap),
    });
  }, [saved, ready, lessonMap, exerciseMap]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.chapterIds.length) return;
    await db.examPlans.put({ id: "current", courseId: course.id, ...form, createdAt: Date.now() });
    setEditing(false);
  };

  const isDone = (it: PlanItem) => (it.kind === "lesson" ? lessonCompleted.has(it.id) : it.kind === "exercise" ? exerciseMap.get(it.id)?.status === "completed" : false);
  const linkOf = (it: PlanItem) => (it.kind === "lesson" ? lessonPath(getLesson(it.id)!) : it.kind === "exercise" ? exercisePath(it.id, "exam") : chapterPath(getChapter(it.id)!));

  const msLeft = plan ? plan.examAt.getTime() - now : 0;
  const countdown = msLeft > 0 ? `${Math.floor(msLeft / 86400000)} ngày ${Math.floor((msLeft % 86400000) / 3600000)} giờ` : "Đã đến giờ thi";

  // Tiến độ các mục trong phạm vi ôn thi
  const scopeLessons = content.lessons.filter((l) => saved?.chapterIds.includes(l.chapterId));
  const scopeExercises = content.exercises.filter((e) => saved?.chapterIds.includes(e.chapterId));
  const scopeDone = scopeLessons.filter((l) => lessonCompleted.has(l.id)).length + scopeExercises.filter((e) => exerciseMap.get(e.id)?.status === "completed").length;
  const scopeTotal = scopeLessons.length + scopeExercises.length;

  const showForm = !saved || editing;

  return (
    <PageContainer>
      <PageHeader
        crumbs={[{ label: "Dashboard", to: "/" }, { label: "Ôn thi" }]}
        title="Chế độ ôn thi (Exam Preparation)"
        description="Nhập ngày giờ thi, các chương cần ôn và thời gian học mỗi ngày. Kế hoạch được tính bằng thuật toán phân bổ thời gian dựa trên số bài học, độ khó và tiến độ hiện tại — không dùng AI."
      />

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="size-4 text-primary" aria-hidden /> Thông tin kỳ thi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => void save(e)} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="exam-date">Ngày thi</Label>
                <Input id="exam-date" type="date" required min={localDateKey()} value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="exam-time">Giờ thi</Label>
                <Input id="exam-time" type="time" required value={form.examTime} onChange={(e) => setForm({ ...form, examTime: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="exam-min">Thời gian học dự kiến mỗi ngày (phút)</Label>
                <Input id="exam-min" type="number" min={15} max={720} step={5} required value={form.minutesPerDay} onChange={(e) => setForm({ ...form, minutesPerDay: Number(e.target.value) })} />
              </div>
              <fieldset className="flex flex-col gap-1.5">
                <legend className="mb-1.5 text-sm font-medium">Các chương cần ôn</legend>
                {chapters.map((c) => (
                  <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="size-4 accent-[var(--primary)]"
                      checked={form.chapterIds.includes(c.id)}
                      onChange={(e) =>
                        setForm({ ...form, chapterIds: e.target.checked ? chapters.filter((x) => x.id === c.id || form.chapterIds.includes(x.id)).map((x) => x.id) : form.chapterIds.filter((x) => x !== c.id) })
                      }
                    />
                    Chương {c.order}: {c.title}
                  </label>
                ))}
              </fieldset>
              <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
                <Button type="submit" disabled={!form.chapterIds.length}>
                  {saved ? "Cập nhật kế hoạch" : "Tạo kế hoạch"}
                </Button>
                {saved && (
                  <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                    Hủy
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {saved && plan && (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Thời gian còn lại</CardDescription>
                <CardTitle className="text-2xl">{countdown}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Thi lúc {saved.examTime}, {formatDate(plan.examAt, { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Tiến độ trong phạm vi ôn</CardDescription>
                <CardTitle className="text-2xl">{pct(scopeDone, scopeTotal)}%</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={pct(scopeDone, scopeTotal)} label="Tiến độ ôn thi" />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {scopeDone}/{scopeTotal} bài học + bài tập
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Khối lượng còn lại / quỹ thời gian</CardDescription>
                <CardTitle className="text-2xl">
                  {formatDuration(plan.totalMinutes * 60)}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Quỹ thời gian học mới: {formatDuration(plan.capacityMinutes * 60)} ({saved.minutesPerDay} phút/ngày)
                <div className="mt-2">
                  <Button variant="outline" size="xs" onClick={() => setEditing(true)}>
                    Sửa thông tin
                  </Button>{" "}
                  <Button variant="ghost" size="xs" onClick={() => window.confirm("Xóa kế hoạch ôn thi?") && void db.examPlans.delete("current")}>
                    <Trash2 /> Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {(plan.overflow.length > 0 || plan.daysLeft === 0) && (
            <div className="mb-4 flex gap-2 rounded-xl border border-warning/50 bg-warning/10 p-4 text-sm">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
              <p>
                {plan.daysLeft === 0
                  ? "Hôm nay là ngày thi — hãy xem lại công thức và các bài cần ôn lại."
                  : `Không đủ thời gian cho ${plan.overflow.length} mục (≈ ${formatDuration(plan.overflow.reduce((s, i) => s + i.minutes, 0) * 60)}). Hãy tăng thời gian học mỗi ngày hoặc ưu tiên các mục đầu danh sách.`}
              </p>
            </div>
          )}

          <ol className="flex flex-col gap-3">
            {plan.days.map((day) => {
              const today = day.date === localDateKey();
              const dDone = day.items.filter(isDone).length;
              return (
                <li key={day.date} className={cn("rounded-xl border border-border bg-card p-4", today && "border-primary ring-1 ring-primary/40")}>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">
                      {formatDate(day.date + "T00:00:00", { weekday: "long", day: "2-digit", month: "2-digit" })}
                      {today && <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">Hôm nay</span>}
                      {day.isReviewDay && <span className="ml-2 rounded-full bg-warning/20 px-2 py-0.5 text-xs">Tổng ôn</span>}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {day.items.length ? `${dDone}/${day.items.length} mục · ${day.minutes} phút` : "Nghỉ / dự phòng"}
                    </span>
                  </div>
                  {day.items.length > 0 && (
                    <ul className="grid gap-1.5 sm:grid-cols-2">
                      {day.items.map((it) => {
                        const done = isDone(it);
                        const Icon = done ? CircleCheck : it.kind === "lesson" ? BookOpen : it.kind === "exercise" ? (it.priority ? RotateCcw : Dumbbell) : RotateCcw;
                        return (
                          <li key={it.kind + it.id}>
                            <Link to={linkOf(it)} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted">
                              <Icon className={cn("size-4 shrink-0", done ? "text-success" : it.kind === "lesson" ? "text-primary" : it.priority || it.kind === "review" ? "text-warning" : "text-exercise")} aria-hidden />
                              <span className={cn("min-w-0 flex-1", done && "text-muted-foreground line-through")}>{it.title}</span>
                              <span className="shrink-0 text-xs text-muted-foreground">{it.minutes}′</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>
          <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Thời lượng ước tính: bài học = thời gian dự kiến × hệ số độ khó (1; 1,2; 1,4); bài tập 10/15/25 phút theo độ khó. Bài “cần ôn lại” được ưu tiên đầu tiên; khoảng 20% số ngày cuối dành cho tổng ôn. Kế hoạch tự cập nhật theo tiến độ.
          </p>
        </>
      )}
    </PageContainer>
  );
}
