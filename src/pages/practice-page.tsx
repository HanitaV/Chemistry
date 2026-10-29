import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { Dumbbell, RotateCcw, Search } from "lucide-react";
import { ExerciseCard } from "@/components/exercise-engine/exercise-card";
import { PageContainer, PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Label, Select } from "@/components/ui/input";
import { useProgressMaps } from "@/hooks/use-progress";
import { chaptersOfCourse, content } from "@/lib/content";
import { DIFFICULTY_LABEL, SOURCE_LABEL } from "@/lib/utils";

export default function PracticePage() {
  const [params, setParams] = useSearchParams();
  const { exerciseMap } = useProgressMaps();
  const course = content.courses[0];
  const f = {
    chapter: params.get("chapter") ?? "all",
    difficulty: params.get("difficulty") ?? "all",
    source: params.get("source") ?? "all",
    status: params.get("status") ?? "all",
    q: params.get("q") ?? "",
  };
  const setF = (key: keyof typeof f, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const list = useMemo(() => {
    const q = f.q.trim().toLocaleLowerCase("vi");
    return content.exercises.filter((e) => {
      const st = exerciseMap.get(e.id)?.status ?? "not-started";
      return (
        (f.chapter === "all" || e.chapterId === f.chapter) &&
        (f.difficulty === "all" || e.difficulty === f.difficulty) &&
        (f.source === "all" || e.source.kind === f.source) &&
        (f.status === "all" || st === f.status) &&
        (!q || `${e.title} ${e.skill} ${e.statement}`.toLocaleLowerCase("vi").includes(q))
      );
    });
  }, [f.chapter, f.difficulty, f.source, f.status, f.q, exerciseMap]);

  const reviewSkills = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of exerciseMap.values()) if (s.status === "needs-review") m.set(s.skill, (m.get(s.skill) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [exerciseMap]);

  return (
    <PageContainer wide>
      <PageHeader
        title="Luyện tập"
        description="Hai chế độ: Guided (từng bước, chấm ngay từng bước) dành cho người mới học; Exam (tự trình bày, xem đáp án mẫu và tự đánh giá) để luyện thi tự luận."
      />
      {reviewSkills.length > 0 && (
        <div className="mb-5 rounded-xl border border-warning/40 bg-warning/8 p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <RotateCcw className="size-4 text-warning" aria-hidden /> Dạng bài cần ôn lại
          </p>
          <div className="flex flex-wrap gap-1.5">
            {reviewSkills.map(([skill, n]) => (
              <button key={skill} type="button" onClick={() => setF("q", skill)} className="cursor-pointer">
                <Badge variant="warning">
                  {skill} · {n}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="mb-5 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
          <Label htmlFor="p-q">Tìm kiếm</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input id="p-q" value={f.q} onChange={(e) => setF("q", e.target.value)} placeholder="Tên bài, dạng bài…" className="pl-9" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="p-ch">Chương</Label>
          <Select id="p-ch" value={f.chapter} onChange={(e) => setF("chapter", e.target.value)}>
            <option value="all">Tất cả</option>
            {chaptersOfCourse(course.id).map((c) => (
              <option key={c.id} value={c.id}>
                Chương {c.order}: {c.title}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="p-d">Độ khó</Label>
          <Select id="p-d" value={f.difficulty} onChange={(e) => setF("difficulty", e.target.value)}>
            <option value="all">Tất cả</option>
            {Object.entries(DIFFICULTY_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="p-s">Nguồn</Label>
          <Select id="p-s" value={f.source} onChange={(e) => setF("source", e.target.value)}>
            <option value="all">Tất cả</option>
            {Object.entries(SOURCE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="p-st">Trạng thái</Label>
          <Select id="p-st" value={f.status} onChange={(e) => setF("status", e.target.value)}>
            <option value="all">Tất cả</option>
            <option value="not-started">Chưa làm</option>
            <option value="completed">Đã nắm vững</option>
            <option value="needs-review">Cần ôn lại</option>
          </Select>
        </div>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">{list.length} bài tập</p>
      {list.length === 0 ? (
        <EmptyState icon={Dumbbell} title="Không có bài tập phù hợp bộ lọc" description="Thử bỏ bớt điều kiện lọc." />
      ) : (
        chaptersOfCourse(course.id)
          .filter((ch) => list.some((e) => e.chapterId === ch.id))
          .map((ch) => (
            <section key={ch.id} className="mb-6">
              <h2 className="mb-3 text-base font-semibold">
                Chương {ch.order}: {ch.title}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {list
                  .filter((e) => e.chapterId === ch.id)
                  .map((e) => (
                    <ExerciseCard key={e.id} exercise={e} state={exerciseMap.get(e.id)} />
                  ))}
              </div>
            </section>
          ))
      )}
    </PageContainer>
  );
}
