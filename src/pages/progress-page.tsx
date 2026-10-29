import { useMemo } from "react";
import { Link } from "react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { CalendarClock, Settings } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/common/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProgressMaps } from "@/hooks/use-progress";
import { chaptersOfCourse, content, exercisesOfChapter, getExercise, lessonPath, getLesson } from "@/lib/content";
import { db } from "@/lib/db";
import { nodeMastery } from "@/lib/progress";
import { cn, formatDate, formatDuration, localDateKey, pct } from "@/lib/utils";

export default function ProgressPage() {
  const { lessonCompleted, exerciseMap, nodeMap, exerciseBest } = useProgressMaps();
  const days = useLiveQuery(() => db.studyDays.toArray(), []);
  const attempts = useLiveQuery(() => db.exerciseAttempts.orderBy("finishedAt").reverse().limit(12).toArray(), []);
  const wrongCount = useLiveQuery(() => db.wrongAnswers.count(), []);
  const course = content.courses[0];

  const last14 = useMemo(() => {
    const map = new Map((days ?? []).map((d) => [d.date, d.seconds]));
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const key = localDateKey(d);
      return { key, label: `${d.getDate()}/${d.getMonth() + 1}`, seconds: map.get(key) ?? 0 };
    });
  }, [days]);
  const maxSec = Math.max(...last14.map((d) => d.seconds), 600);
  const totalSeconds = (days ?? []).reduce((s, d) => s + d.seconds, 0);
  const byActivity = (days ?? []).reduce<Record<string, number>>((acc, d) => {
    for (const [k, v] of Object.entries(d.byActivity)) acc[k] = (acc[k] ?? 0) + (v ?? 0);
    return acc;
  }, {});

  const topics = content.nodes.filter((n) => n.kind === "topic" && n.courseId === course.id);
  const mastery = topics.map((n) => ({ node: n, value: nodeMastery(n.id, { lessonCompleted, exerciseBest }), status: nodeMap.get(n.id) ?? "not-started" }));

  return (
    <PageContainer>
      <PageHeader
        title="Tiến độ học tập"
        description="Dữ liệu được lưu cục bộ trong trình duyệt (IndexedDB). Xuất file sao lưu để chuyển sang thiết bị khác."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/exam-prep">
                <CalendarClock /> Kế hoạch ôn thi
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/settings">
                <Settings /> Sao lưu / khôi phục
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        {chaptersOfCourse(course.id).map((ch) => {
          const exs = exercisesOfChapter(ch.id);
          const exDone = exs.filter((e) => exerciseMap.get(e.id)?.status === "completed").length;
          const lDone = ch.lessonIds.filter((id) => lessonCompleted.has(id)).length;
          return (
            <Card key={ch.id}>
              <CardHeader>
                <CardDescription>Chương {ch.order}</CardDescription>
                <CardTitle>{ch.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <div>
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Bài học</span>
                    <span>
                      {lDone}/{ch.lessonIds.length}
                    </span>
                  </div>
                  <Progress value={pct(lDone, ch.lessonIds.length)} label="Bài học" />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Bài tập đã nắm vững</span>
                    <span>
                      {exDone}/{exs.length}
                    </span>
                  </div>
                  <Progress value={pct(exDone, exs.length)} indicatorClassName="bg-exercise" label="Bài tập" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Thời gian học 14 ngày gần nhất</CardTitle>
            <CardDescription>
              Tổng: {formatDuration(totalSeconds)} · Bài học {formatDuration(byActivity.lesson ?? 0)} · Video {formatDuration(byActivity.video ?? 0)} · Bài tập {formatDuration(byActivity.exercise ?? 0)} · Đọc tài liệu {formatDuration(byActivity.reading ?? 0)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-1.5" role="img" aria-label="Biểu đồ thời gian học theo ngày">
              {last14.map((d) => (
                <div key={d.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${d.label}: ${formatDuration(d.seconds)}`}>
                  <div className={cn("w-full max-w-7 rounded-t-[4px] bg-primary/80", d.seconds === 0 && "bg-muted")} style={{ height: `${Math.max(3, (d.seconds / maxSec) * 100)}%` }} />
                  <span className="text-[10px] text-muted-foreground">{d.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bài tập gần đây</CardTitle>
            <CardDescription>{wrongCount ?? 0} câu trả lời sai đã được ghi nhận để rút kinh nghiệm.</CardDescription>
          </CardHeader>
          <CardContent>
            {!attempts?.length ? (
              <p className="text-sm text-muted-foreground">Chưa làm bài tập nào.</p>
            ) : (
              <ul className="flex flex-col gap-1.5 text-sm">
                {attempts.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2">
                    <Link to={`/practice/${a.exerciseId}`} className="min-w-0 truncate hover:text-primary">
                      {getExercise(a.exerciseId)?.title}
                    </Link>
                    <span className={cn("shrink-0 text-xs font-medium", (a.score ?? 0) >= 0.7 ? "text-success" : "text-warning")}>
                      {Math.round((a.score ?? 0) * 100)}% · {formatDate(a.finishedAt ?? a.startedAt, { day: "2-digit", month: "2-digit" })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Mức độ thành thạo theo chủ đề</CardTitle>
          <CardDescription>40% từ việc hoàn thành bài học + 60% từ điểm tốt nhất của các bài tập liên quan.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-x-8 gap-y-3 md:grid-cols-2">
            {mastery.map(({ node, value, status }) => (
              <li key={node.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2 text-sm">
                  {node.lessonId ? (
                    <Link to={lessonPath(getLesson(node.lessonId)!)} className="truncate hover:text-primary">
                      {node.label}
                    </Link>
                  ) : (
                    <span className="truncate">{node.label}</span>
                  )}
                  <span className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={status} />
                    <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{Math.round(value * 100)}%</span>
                  </span>
                </div>
                <Progress value={value * 100} className="h-1.5" indicatorClassName={value >= 0.7 ? "bg-success" : value >= 0.4 ? "bg-primary" : "bg-warning"} label={`Thành thạo ${node.label}`} />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
