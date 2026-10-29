/**
 * Import/Export Layer — sao lưu, khôi phục và đặt lại dữ liệu cá nhân.
 */
import { z } from "zod";
import { db, PROGRESS_TABLES, type PersonalDocRecord, type ProgressTable } from "./db";
import { downloadBlob, localDateKey } from "./utils";

const FORMAT = "chemistry-learning-hub/backup";
const VERSION = 1;

const BackupSchema = z.object({
  format: z.literal(FORMAT),
  version: z.number(),
  exportedAt: z.string(),
  kind: z.enum(["progress", "full"]),
  tables: z.record(z.string(), z.array(z.unknown())),
  personalDocs: z
    .array(
      z.object({
        name: z.string(),
        kind: z.string(),
        mime: z.string(),
        size: z.number(),
        text: z.string().optional(),
        url: z.string().optional(),
        note: z.string().optional(),
        dataUrl: z.string().optional(),
        createdAt: z.number(),
      }),
    )
    .optional(),
});

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export async function exportData(kind: "progress" | "full") {
  const tables: Record<string, unknown[]> = {};
  for (const name of PROGRESS_TABLES) tables[name] = await db.table(name).toArray();
  let personalDocs: z.infer<typeof BackupSchema>["personalDocs"];
  if (kind === "full") {
    const docs = await db.personalDocs.toArray();
    personalDocs = await Promise.all(
      docs.map(async (d) => ({
        name: d.name,
        kind: d.kind,
        mime: d.mime,
        size: d.size,
        text: d.text,
        url: d.url,
        note: d.note,
        createdAt: d.createdAt,
        dataUrl: d.blob ? await blobToDataUrl(d.blob) : undefined,
      })),
    );
  }
  const payload = { format: FORMAT, version: VERSION, exportedAt: new Date().toISOString(), kind, tables, personalDocs };
  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
  downloadBlob(blob, `${kind === "full" ? "sao-luu-day-du" : "tien-do-hoc-tap"}-${localDateKey()}.json`);
}

export interface ImportSummary {
  tables: Record<string, number>;
  personalDocs: number;
}

/** Nhập dữ liệu. mode = "replace" xóa dữ liệu hiện có trước khi nhập; "merge" ghi đè theo khóa. */
export async function importData(file: File, mode: "replace" | "merge"): Promise<ImportSummary> {
  let json: unknown;
  try {
    json = JSON.parse(await file.text());
  } catch {
    throw new Error("File không phải JSON hợp lệ.");
  }
  const parsed = BackupSchema.safeParse(json);
  if (!parsed.success) throw new Error("File không đúng định dạng sao lưu của Chemistry Learning Hub.");
  const data = parsed.data;
  if (data.version > VERSION) throw new Error("File sao lưu được tạo bởi phiên bản mới hơn của website.");

  const summary: ImportSummary = { tables: {}, personalDocs: 0 };
  const known = new Set<string>(PROGRESS_TABLES);
  await db.transaction("rw", [...PROGRESS_TABLES.map((t) => db.table(t)), db.personalDocs], async () => {
    for (const [name, rows] of Object.entries(data.tables)) {
      if (!known.has(name)) continue;
      const table = db.table(name as ProgressTable);
      if (mode === "replace") await table.clear();
      // bỏ khóa tự tăng để tránh xung đột khi gộp
      const cleaned = mode === "merge" && ["exerciseAttempts", "wrongAnswers", "notes"].includes(name)
        ? rows.map((r) => { const { id: _id, ...rest } = r as Record<string, unknown>; return rest; })
        : rows;
      await table.bulkPut(cleaned as never[]);
      summary.tables[name] = rows.length;
    }
    if (data.personalDocs) {
      if (mode === "replace") await db.personalDocs.clear();
      for (const d of data.personalDocs) {
        const record: PersonalDocRecord = {
          name: d.name,
          kind: d.kind as PersonalDocRecord["kind"],
          mime: d.mime,
          size: d.size,
          text: d.text,
          url: d.url,
          note: d.note,
          createdAt: d.createdAt,
          blob: d.dataUrl ? await dataUrlToBlob(d.dataUrl) : undefined,
        };
        await db.personalDocs.add(record);
        summary.personalDocs++;
      }
    }
  });
  return summary;
}

export async function resetProgress(includePersonalDocs: boolean) {
  await db.transaction("rw", [...PROGRESS_TABLES.filter((t) => t !== "settings").map((t) => db.table(t)), db.personalDocs], async () => {
    for (const name of PROGRESS_TABLES) if (name !== "settings") await db.table(name).clear();
    if (includePersonalDocs) await db.personalDocs.clear();
  });
}
