import { Link } from "react-router";
import { ArrowRight, BookOpen, Dumbbell, PlaySquare } from "lucide-react";
import { StatusBadge } from "@/components/common/badges";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { exercisePath, exercisesOfNode, getLesson, getNode, getSegment, lessonPath, videoPath, content } from "@/lib/content";
import type { NodeStatus } from "@/lib/db";
import { NODE_STATUS_LABEL, setNodeStatus } from "@/lib/progress";
import { formatClock } from "@/lib/utils";
import { CATEGORY_LABEL } from "./graph-node";

export function NodeDetails({ nodeId, statusOf, onSelect }: { nodeId: string; statusOf: (id: string) => NodeStatus; onSelect: (id: string) => void }) {
  const node = getNode(nodeId);
  if (!node) return null;
  const lesson = getLesson(node.lessonId);
  const exercises = exercisesOfNode(node.id);
  const children = content.nodes.filter((n) => n.parentId === node.id);
  const segments = node.videoSegmentIds.map(getSegment).filter((s) => !!s);
  const status = statusOf(node.id);
  const relatedGroups: [string, string[]][] = [
    ["Kiến thức liên quan", node.related],
    ["Ứng dụng", node.applications],
    ["Học tiếp theo", node.next],
  ];

  return (
    <div className="flex flex-col gap-4 p-4 text-sm">
      <div>
        <p className="text-xs text-muted-foreground">{CATEGORY_LABEL[node.category]}</p>
        <h2 className="mt-0.5 text-lg font-bold leading-tight">{node.label}</h2>
        <div className="mt-2">
          <StatusBadge status={status} />
        </div>
        <p className="mt-3 leading-relaxed text-muted-foreground">{node.description}</p>
      </div>

      {lesson && (
        <Button asChild>
          <Link to={lessonPath(lesson)}>
            <BookOpen /> Bắt đầu học <ArrowRight />
          </Link>
        </Button>
      )}

      {node.kind !== "chapter" && (
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cập nhật trạng thái</span>
          <Select value={status} onChange={(e) => void setNodeStatus(node.id, e.target.value as NodeStatus)}>
            {(Object.keys(NODE_STATUS_LABEL) as NodeStatus[]).map((s) => (
              <option key={s} value={s}>
                {NODE_STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </label>
      )}

      <section>
        <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kiến thức tiên quyết</h3>
        {node.prerequisites.length ? (
          <ul className="flex flex-col gap-1">
            {node.prerequisites.map((id) => (
              <li key={id}>
                <button type="button" onClick={() => onSelect(id)} className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted cursor-pointer">
                  <span>{getNode(id)?.label}</span>
                  <StatusBadge status={statusOf(id)} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">Không có — có thể bắt đầu ngay.</p>
        )}
      </section>

      {lesson && (
        <section>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bài học</h3>
          <Link to={lessonPath(lesson)} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted">
            <BookOpen className="size-4 text-primary" aria-hidden /> {lesson.title}
          </Link>
        </section>
      )}

      {segments.length > 0 && (
        <section>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Video tương ứng</h3>
          <ul className="flex flex-col gap-1">
            {segments.map((s) => (
              <li key={s!.id}>
                <Link to={videoPath(s!.id)} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted">
                  <PlaySquare className="size-4 shrink-0 text-destructive" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{s!.titleVi}</span>
                  <span className="font-mono text-xs text-muted-foreground">{formatClock(s!.startSeconds)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bài tập liên quan ({exercises.length})</h3>
        {exercises.length ? (
          <ul className="flex flex-col gap-1">
            {exercises.slice(0, 8).map((e) => (
              <li key={e.id}>
                <Link to={exercisePath(e.id)} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted">
                  <Dumbbell className="size-4 shrink-0 text-exercise" aria-hidden />
                  <span className="min-w-0 flex-1">{e.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">Chưa có bài tập gắn trực tiếp.</p>
        )}
      </section>

      {children.length > 0 && (
        <section>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nội dung con</h3>
          <div className="flex flex-wrap gap-1.5">
            {children.map((c) => (
              <button key={c.id} type="button" onClick={() => onSelect(c.id)} className="rounded-full border border-border px-2.5 py-1 text-xs hover:border-primary hover:text-primary cursor-pointer">
                {c.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {relatedGroups.map(([title, ids]) =>
        ids.length ? (
          <section key={title}>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
            <div className="flex flex-wrap gap-1.5">
              {ids.map((id) => (
                <button key={id} type="button" onClick={() => onSelect(id)} className="rounded-full border border-border px-2.5 py-1 text-xs hover:border-primary hover:text-primary cursor-pointer">
                  {getNode(id)?.label}
                </button>
              ))}
            </div>
          </section>
        ) : null,
      )}
    </div>
  );
}
