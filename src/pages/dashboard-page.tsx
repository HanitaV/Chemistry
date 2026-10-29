import { Link } from "react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowRight, BookOpen, CalendarClock, CircleCheck, Clock, Dumbbell, Network, PlaySquare, RotateCcw, Sparkles } from "lucide-react";
import { PageContainer } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useProgressMaps } from "@/hooks/use-progress";
import { chapterPath, chaptersOfCourse, content, exercisePath, getChapter, getExercise, getLesson, getNode, getSegment, lessonPath, lessonsOfCourse, videoPath } from "@/lib/content";
import { db } from "@/lib/db";
import { buildPlan, planProgressInputs } from "@/lib/exam-plan";
import { formatClock, formatDuration, formatRelative, localDateKey, pct } from "@/lib/utils";
import { useUi } from "@/stores/ui-store";

function greeting() {
  const h = new Date().getHours();
  return h < 11 ? "Chào buổi sáng" : h < 14 ? "Chào buổi trưa" : h < 18 ? "Chào buổi chiều" : "Chào buổi tối";
}

export default function DashboardPage() {
  const name = useUi((s) => s.learnerName);
  const { lessonMap, exerciseMap, nodeMap, lessonCompleted, ready } = useProgressMaps();
  const recentVideos = useLiveQuery(() => db.videoPositions.orderBy("updatedAt").reverse().limit(4).toArray(), []);
  const studyDays = useLiveQuery(() => db.studyDays.toArray(), []);
  const plan = useLiveQuery(() => db.examPlans.get("current"), []);

  const course = content.courses[0];
  const lessons = lessonsOfCourse(course.id);
  const done = lessons.filter((l) => lessonCompleted.has(l.id)).length;
  const exercises = content.exercises.filter((e) => e.courseId === course.id);
  const exDone = exercises.filter((e) => exerciseMap.get(e.id)?.status === "completed").length;
  const exTried = exercises.filter((e) => exerciseMap.has(e.id)).length;

  const lastVisited = [...lessonMap.values()].sort((a, b) => b.lastVisitedAt - a.lastVisitedAt)[0];
  const lastLesson = getLesson(lastVisited?.lessonId);
  const nextLesson = lessons.find((l) => !lessonCompleted.has(l.id));
  const continueLesson = lastLesson && !lessonCompleted.has(lastLesson.id) ? lastLesson : nextLesson;
  const currentChapter = getChapter(continueLesson?.chapterId ?? lastLesson?.chapterId) ?? chaptersOfCourse(course.id)[0];

  const reviewNodes = [...nodeMap.entries()].filter(([, s]) => s === "needs-review").map(([id]) => getNode(id)).filter((n) => !!n);
  const reviewExercises = [...exerciseMap.values()].filter((e) => e.status === "needs-review").sort((a, b) => b.lastAttemptAt - a.lastAttemptAt);

  const weekKeys = new Set(
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return localDateKey(d);
    }),
  );
  const weekSeconds = (studyDays ?? []).filter((d) => weekKeys.has(d.date)).reduce((s, d) => s + d.seconds, 0);
  const todaySeconds = (studyDays ?? []).find((d) => d.date === localDateKey())?.seconds ?? 0;

  const planResult =
    plan && ready
      ? buildPlan({
          examDate: plan.examDate,
          examTime: plan.examTime,
          chapterIds: plan.chapterIds,
          minutesPerDay: plan.minutesPerDay,
          ...planProgressInputs(lessonMap, exerciseMap),
        })
      : null;
  const todayPlan = planResult?.days.find((d) => d.date === localDateKey());

  return (
    <PageContainer>
      <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-sm text-muted-foreground">{greeting()}{name ? `, ${name}` : ""} 👋</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Tiếp tục với {course.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {continueLesson ? (
              <>
                Bài tiếp theo: <span className="font-medium text-foreground">{continueLesson.title}</span> · Chương {getChapter(continueLesson.chapterId)?.order}
              </>
            ) : (
              "Bạn đã hoàn thành mọi bài học — hãy luyện tập và ôn tập các phần cần ôn lại."
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {continueLesson ? (
            <Button size="lg" asChild>
              <Link to={lessonPath(continueLesson)}>
                <BookOpen /> Tiếp tục học <ArrowRight />
              </Link>
            </Button>
          ) : (
            <Button size="lg" asChild>
              <Link to="/practice">
                <Dumbbell /> Luyện tập
              </Link>
            </Button>
          )}
          <Button size="lg" variant="outline" asChild>
            <Link to="/graph">
              <Network /> Sơ đồ kiến thức
            </Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tiến độ tổng thể</CardDescription>
            <CardTitle className="text-2xl">{pct(done, lessons.length)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={pct(done, lessons.length)} label="Tiến độ bài học" />
            <p className="mt-2 text-xs text-muted-foreground">
              {done}/{lessons.length} bài học đã hoàn thành
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bài tập đã hoàn thành</CardDescription>
            <CardTitle className="text-2xl">
              {exDone}
              <span className="text-base font-normal text-muted-foreground">/{exercises.length}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={pct(exDone, exercises.length)} indicatorClassName="bg-exercise" label="Tiến độ bài tập" />
            <p className="mt-2 text-xs text-muted-foreground">{exTried} bài đã thử làm</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Chương đang học</CardDescription>
            <CardTitle className="text-lg leading-snug">
              {currentChapter ? `Chương ${currentChapter.order}: ${currentChapter.title}` : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentChapter && (
              <>
                <Progress value={pct(currentChapter.lessonIds.filter((id) => lessonCompleted.has(id)).length, currentChapter.lessonIds.length)} label="Tiến độ chương" />
                <Link to={chapterPath(currentChapter)} className="mt-2 inline-block text-xs font-medium text-primary hover:underline">
                  Xem chương →
                </Link>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Thời gian học</CardDescription>
            <CardTitle className="text-2xl">{formatDuration(todaySeconds)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" aria-hidden /> Hôm nay · {formatDuration(weekSeconds)} trong 7 ngày qua
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="size-4 text-primary" aria-hidden /> Chế độ ôn thi
              </CardTitle>
              <CardDescription>Nhập ngày thi để nhận kế hoạch học theo ngày.</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/exam-prep">{plan ? "Xem kế hoạch" : "Lập kế hoạch"}</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {planResult ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm">
                  Còn <span className="text-lg font-bold text-primary">{planResult.daysLeft}</span> ngày đến kỳ thi ({plan!.examDate.split("-").reverse().join("/")} lúc {plan!.examTime}).
                </p>
                {todayPlan && todayPlan.items.length > 0 ? (
                  <ul className="flex flex-col gap-1.5">
                    {todayPlan.items.slice(0, 5).map((it) => {
                      const doneItem = it.kind === "lesson" ? lessonCompleted.has(it.id) : it.kind === "exercise" ? exerciseMap.get(it.id)?.status === "completed" : false;
                      const to = it.kind === "lesson" ? lessonPath(getLesson(it.id)!) : it.kind === "exercise" ? exercisePath(it.id) : chapterPath(getChapter(it.id)!);
                      return (
                        <li key={it.kind + it.id}>
                          <Link to={to} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">
                            {doneItem ? <CircleCheck className="size-4 text-success" /> : it.kind === "lesson" ? <BookOpen className="size-4 text-primary" /> : it.kind === "exercise" ? <Dumbbell className="size-4 text-exercise" /> : <RotateCcw className="size-4 text-warning" />}
                            <span className={doneItem ? "line-through text-muted-foreground" : ""}>{it.title}</span>
                            <span className="ml-auto shrink-0 text-xs text-muted-foreground">{it.minutes}′</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Hôm nay không có mục nào trong kế hoạch.</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Chưa có kế hoạch. Kế hoạch được tính từ số bài học còn lại, độ khó và tiến độ hiện tại — hoàn toàn trên trình duyệt, không dùng AI.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="size-4 text-warning" aria-hidden /> Kiến thức cần ôn lại
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reviewNodes.length === 0 && reviewExercises.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="size-4" aria-hidden /> Chưa có mục nào cần ôn lại.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {reviewNodes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {reviewNodes.slice(0, 8).map((n) => (
                      <Link key={n!.id} to={n!.lessonId ? lessonPath(getLesson(n!.lessonId)!) : `/graph?node=${n!.id}`}>
                        <Badge variant="warning">{n!.label}</Badge>
                      </Link>
                    ))}
                  </div>
                )}
                <ul className="flex flex-col gap-1">
                  {reviewExercises.slice(0, 5).map((e) => (
                    <li key={e.exerciseId}>
                      <Link to={exercisePath(e.exerciseId)} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                        <span className="truncate">{getExercise(e.exerciseId)?.title}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">{Math.round(e.lastScore * 100)}%</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Các chương</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {chaptersOfCourse(course.id).map((ch) => {
              const d = ch.lessonIds.filter((id) => lessonCompleted.has(id)).length;
              return (
                <Link key={ch.id} to={chapterPath(ch)} className="rounded-xl border border-border p-4 transition-colors hover:border-primary/50 hover:bg-accent/30">
                  <p className="text-xs font-semibold text-primary">Chương {ch.order}</p>
                  <p className="mt-0.5 font-semibold leading-snug">{ch.title}</p>
                  <Progress value={pct(d, ch.lessonIds.length)} className="mt-3 h-1.5" label={`Tiến độ chương ${ch.order}`} />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {d}/{ch.lessonIds.length} bài · {ch.exerciseIds.length} bài tập
                  </p>
                </Link>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlaySquare className="size-4 text-destructive" aria-hidden /> Video gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!recentVideos?.length ? (
              <p className="text-sm text-muted-foreground">Chưa xem video nào.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {recentVideos.map((v) => {
                  const seg = getSegment(v.segmentId);
                  if (!seg) return null;
                  return (
                    <li key={v.segmentId}>
                      <Link to={videoPath(seg.id)} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                        <span className="min-w-0 flex-1 truncate">{seg.titleVi}</span>
                        <span className="shrink-0 font-mono text-xs text-muted-foreground">{formatClock(v.seconds)}</span>
                      </Link>
                      <p className="px-2 text-[11px] text-muted-foreground">{formatRelative(v.updatedAt)}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
