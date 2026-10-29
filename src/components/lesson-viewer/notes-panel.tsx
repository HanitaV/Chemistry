import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Pencil, Save, StickyNote, Trash2, X } from "lucide-react";
import { Markdown } from "@/components/common/markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { db, type NoteRecord } from "@/lib/db";
import { formatClock, formatRelative } from "@/lib/utils";

export function NotesPanel({
  targetType,
  targetId,
  placeholder = "Ghi chú của bạn (hỗ trợ Markdown và $LaTeX$)…",
  getVideoTime,
  youtubeId,
  onSeek,
}: {
  targetType: NoteRecord["targetType"];
  targetId: string;
  placeholder?: string;
  /** nếu có: ghi chú gắn với thời điểm hiện tại của video */
  getVideoTime?: () => number | undefined;
  youtubeId?: string;
  onSeek?: (seconds: number) => void;
}) {
  const notes = useLiveQuery(
    () => db.notes.where("[targetType+targetId]").equals([targetType, targetId]).toArray(),
    [targetType, targetId],
  );
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const add = async () => {
    const text = draft.trim();
    if (!text) return;
    const now = Date.now();
    const videoTime = getVideoTime?.();
    await db.notes.add({ targetType, targetId, content: text, videoTime, youtubeId, createdAt: now, updatedAt: now });
    setDraft("");
  };

  const sorted = [...(notes ?? [])].sort((a, b) => (a.videoTime ?? 0) - (b.videoTime ?? 0) || b.updatedAt - a.updatedAt);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          className="min-h-20 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) void add();
          }}
          aria-label="Nội dung ghi chú"
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-muted-foreground">Ctrl/⌘ + Enter để lưu</span>
          <Button size="xs" onClick={() => void add()} disabled={!draft.trim()}>
            <Save /> {getVideoTime ? "Lưu tại thời điểm hiện tại" : "Lưu ghi chú"}
          </Button>
        </div>
      </div>
      {sorted.length === 0 ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <StickyNote className="size-3.5" aria-hidden /> Chưa có ghi chú.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((n) => (
            <li key={n.id} className="rounded-lg border border-border bg-card p-3 text-sm">
              <div className="mb-1 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-2">
                  {n.videoTime !== undefined && (
                    <button type="button" className="rounded bg-primary/12 px-1.5 py-0.5 font-mono font-medium text-primary hover:bg-primary/20 cursor-pointer" onClick={() => onSeek?.(n.videoTime!)}>
                      {formatClock(n.videoTime)}
                    </button>
                  )}
                  {formatRelative(n.updatedAt)}
                </span>
                <span className="flex gap-1">
                  {editing === n.id ? (
                    <button type="button" aria-label="Hủy sửa" className="rounded p-1 hover:bg-muted cursor-pointer" onClick={() => setEditing(null)}>
                      <X className="size-3.5" />
                    </button>
                  ) : (
                    <button type="button" aria-label="Sửa ghi chú" className="rounded p-1 hover:bg-muted cursor-pointer" onClick={() => { setEditing(n.id!); setEditText(n.content); }}>
                      <Pencil className="size-3.5" />
                    </button>
                  )}
                  <button type="button" aria-label="Xóa ghi chú" className="rounded p-1 text-destructive hover:bg-destructive/10 cursor-pointer" onClick={() => void db.notes.delete(n.id!)}>
                    <Trash2 className="size-3.5" />
                  </button>
                </span>
              </div>
              {editing === n.id ? (
                <div className="flex flex-col gap-2">
                  <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="min-h-20 text-sm" aria-label="Sửa ghi chú" />
                  <Button
                    size="xs"
                    className="self-end"
                    onClick={async () => {
                      await db.notes.update(n.id!, { content: editText, updatedAt: Date.now() });
                      setEditing(null);
                    }}
                  >
                    <Save /> Lưu
                  </Button>
                </div>
              ) : (
                <Markdown compact>{n.content}</Markdown>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
