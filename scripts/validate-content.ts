/**
 * Kiểm tra toàn bộ dữ liệu nội dung trước khi build.
 * Chạy: npm run validate (tự động chạy trước npm run build).
 * Nếu có lỗi, script in danh sách lỗi và thoát với mã 1 → build dừng lại.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { z } from "zod";
import {
  ChapterSchema,
  CourseSchema,
  DocumentsFileSchema,
  ExerciseFileSchema,
  FormulaFileSchema,
  KnowledgeGraphFileSchema,
  LESSON_MARKERS,
  LessonFrontmatterSchema,
  VideoFileSchema,
  type DocumentMeta,
  type Exercise,
  type KnowledgeNode,
  type LessonFrontmatter,
  type SourceRef,
} from "../src/types/schema";
import { parseFrontmatter } from "../src/lib/frontmatter";
import { compileExpression, expressionVariables } from "../src/lib/math-expression";
import { gradeStep } from "../src/lib/grading";

const ROOT = join(import.meta.dirname, "..");
const COURSES_DIR = join(ROOT, "src/content/courses");
const PUBLIC_DIR = join(ROOT, "public");

const errors: string[] = [];
/** ID phải duy nhất trên TOÀN website (mọi môn học) vì route và tiến độ dùng ID làm khóa. */
const globalIds = { lesson: new Map<string, string>(), exercise: new Map<string, string>(), node: new Map<string, string>(), segment: new Map<string, string>(), formula: new Map<string, string>(), document: new Map<string, string>(), chapter: new Map<string, string>() };
const warnings: string[] = [];
const err = (file: string, msg: string) => errors.push(`✗ ${relative(ROOT, file)}: ${msg}`);
const warn = (file: string, msg: string) => warnings.push(`! ${relative(ROOT, file)}: ${msg}`);

function readJson<T>(file: string, schema: z.ZodType<T>): T | null {
  if (!existsSync(file)) {
    err(file, "không tìm thấy file");
    return null;
  }
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    err(file, `JSON không hợp lệ — ${(e as Error).message}`);
    return null;
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    for (const issue of result.error.issues) err(file, `${issue.path.join(".") || "(gốc)"}: ${issue.message}`);
    return null;
  }
  return result.data;
}

function listFiles(dir: string, ext: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(ext))
    .sort()
    .map((f) => join(dir, f));
}

function registerId(registry: Map<string, string>, id: string, file: string, kind: string) {
  const prev = registry.get(id);
  if (prev) err(file, `${kind} ID "${id}" bị trùng (đã có ở ${relative(ROOT, prev)})`);
  else registry.set(id, file);
}

function findCycle(graph: Map<string, string[]>): string[] | null {
  const state = new Map<string, 0 | 1 | 2>();
  const stack: string[] = [];
  const visit = (node: string): string[] | null => {
    state.set(node, 1);
    stack.push(node);
    for (const next of graph.get(node) ?? []) {
      if (!graph.has(next)) continue;
      if (state.get(next) === 1) return [...stack.slice(stack.indexOf(next)), next];
      if (!state.get(next)) {
        const c = visit(next);
        if (c) return c;
      }
    }
    stack.pop();
    state.set(node, 2);
    return null;
  };
  for (const node of graph.keys()) {
    if (!state.get(node)) {
      const c = visit(node);
      if (c) return c;
    }
  }
  return null;
}

function checkSources(file: string, sources: SourceRef[] | undefined, docs: Map<string, DocumentMeta>) {
  for (const s of sources ?? []) {
    const doc = docs.get(s.documentId);
    if (!doc) {
      err(file, `tài liệu "${s.documentId}" không tồn tại trong documents.json`);
      continue;
    }
    for (const p of s.pages ?? []) if (p > doc.pageCount) err(file, `trang ${p} vượt quá số trang (${doc.pageCount}) của ${doc.id}`);
  }
}

function checkImages(file: string, markdown: string) {
  for (const m of markdown.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)) {
    const src = m[1];
    if (/^https?:/.test(src)) continue;
    if (!existsSync(join(PUBLIC_DIR, src.replace(/^\.?\//, "")))) err(file, `ảnh "${src}" không tồn tại trong public/`);
  }
}

function validateExercise(file: string, ex: Exercise) {
  const stepIds = new Set<string>();
  for (const step of ex.steps) {
    const where = `${ex.id}/${step.id}`;
    if (stepIds.has(step.id)) err(file, `${where}: ID bước bị trùng`);
    stepIds.add(step.id);
    switch (step.type) {
      case "single-choice":
      case "formula-selection": {
        const ids = step.options.map((o) => o.id);
        if (new Set(ids).size !== ids.length) err(file, `${where}: ID lựa chọn bị trùng`);
        if (!ids.includes(step.correctAnswer)) err(file, `${where}: đáp án "${step.correctAnswer}" không nằm trong các lựa chọn`);
        break;
      }
      case "multiple-choice": {
        const ids = step.options.map((o) => o.id);
        for (const a of step.correctAnswer) if (!ids.includes(a)) err(file, `${where}: đáp án "${a}" không nằm trong các lựa chọn`);
        break;
      }
      case "numeric":
        if (!Number.isFinite(step.correctAnswer)) err(file, `${where}: đáp án số không hợp lệ`);
        if (step.tolerance.relative === undefined && step.tolerance.absolute === undefined)
          err(file, `${where}: cần khai báo sai số cho phép (relative hoặc absolute)`);
        break;
      case "math-expression":
        try {
          compileExpression(step.correctAnswer);
          const used = expressionVariables(step.correctAnswer);
          for (const v of used) if (!step.variables.includes(v)) err(file, `${where}: biến "${v}" chưa được khai báo trong variables`);
        } catch (e) {
          err(file, `${where}: biểu thức đáp án không hợp lệ — ${(e as Error).message}`);
        }
        break;
      case "short-answer":
        break;
    }
  }
  // Đáp án chuẩn phải được chính bộ chấm công nhận là đúng
  for (const step of ex.steps) {
    const canonical =
      step.type === "multiple-choice" ? step.correctAnswer
      : step.type === "short-answer" ? step.correctAnswer[0]
      : step.type === "numeric" ? String(step.correctAnswer)
      : step.correctAnswer;
    try {
      if (!gradeStep(step, canonical).correct) err(file, `${ex.id}/${step.id}: bộ chấm không công nhận đáp án chuẩn`);
    } catch (e) {
      err(file, `${ex.id}/${step.id}: lỗi khi chấm đáp án chuẩn — ${(e as Error).message}`);
    }
  }
  if (ex.steps.length === 0) warn(file, `${ex.id}: không có bước hướng dẫn (chỉ dùng được ở chế độ Exam)`);
  if (ex.source.kind !== "supplementary" && !ex.source.documentId)
    err(file, `${ex.id}: bài "trích/biên soạn lại" phải ghi rõ documentId nguồn`);
  checkImages(file, ex.statement);
}

function validateCourse(courseDir: string) {
  const courseFile = join(courseDir, "course.json");
  const course = readJson(courseFile, CourseSchema);
  if (!course) return;

  const docsFile = join(courseDir, "documents.json");
  const docsData = readJson(docsFile, DocumentsFileSchema);
  const docs = new Map<string, DocumentMeta>();
  for (const d of docsData?.documents ?? []) {
    registerId(globalIds.document, d.id, docsFile, "Tài liệu");
    docs.set(d.id, d);
    if (d.courseId !== course.id) err(docsFile, `${d.id}: courseId phải là "${course.id}"`);
    if (!existsSync(join(PUBLIC_DIR, d.path))) err(docsFile, `${d.id}: file "public/${d.path}" không tồn tại`);
  }

  // ----- chapters, lessons, exercises
  const chapterIds = new Set<string>();
  const lessonRegistry = globalIds.lesson;
  const exerciseRegistry = globalIds.exercise;
  const lessons = new Map<string, LessonFrontmatter & { file: string; body: string }>();
  const exercises = new Map<string, Exercise & { file: string }>();
  const chapterLessonIds = new Map<string, string[]>();
  const chapterExerciseIds = new Map<string, string[]>();

  course.chapters.forEach((chapterId) => {
    const dir = join(courseDir, "chapters", chapterId);
    const chapterFile = join(dir, "chapter.json");
    const chapter = readJson(chapterFile, ChapterSchema);
    if (!chapter) return;
    if (chapter.id !== chapterId) err(chapterFile, `id "${chapter.id}" khác tên thư mục "${chapterId}"`);
    if (chapter.courseId !== course.id) err(chapterFile, `courseId phải là "${course.id}"`);
    registerId(globalIds.chapter, chapter.id, chapterFile, "Chương");
    chapterIds.add(chapter.id);
    chapterLessonIds.set(chapter.id, chapter.lessonIds);
    chapterExerciseIds.set(chapter.id, chapter.exerciseIds);
    for (const s of chapter.sourceIds) if (!docs.has(s)) err(chapterFile, `sourceIds: tài liệu "${s}" không tồn tại`);

    for (const file of listFiles(join(dir, "lessons"), ".md")) {
      const { data, body } = parseFrontmatter(readFileSync(file, "utf8"));
      const parsed = LessonFrontmatterSchema.safeParse(data);
      if (!parsed.success) {
        for (const issue of parsed.error.issues) err(file, `frontmatter ${issue.path.join(".")}: ${issue.message}`);
        continue;
      }
      const fm = parsed.data;
      registerId(lessonRegistry, fm.id, file, "Bài học");
      if (fm.chapterId !== chapter.id) err(file, `chapterId "${fm.chapterId}" không khớp thư mục "${chapter.id}"`);
      lessons.set(fm.id, { ...fm, file, body });
    }
    for (const file of listFiles(join(dir, "exercises"), ".json")) {
      const data = readJson(file, ExerciseFileSchema);
      for (const ex of data?.exercises ?? []) {
        registerId(exerciseRegistry, ex.id, file, "Bài tập");
        if (ex.chapterId !== chapter.id) err(file, `${ex.id}: chapterId "${ex.chapterId}" không khớp thư mục "${chapter.id}"`);
        exercises.set(ex.id, { ...ex, file });
        validateExercise(file, ex);
      }
    }
  });

  // chapter references
  for (const [chapterId, ids] of chapterLessonIds) {
    const f = join(courseDir, "chapters", chapterId, "chapter.json");
    for (const id of ids) {
      const l = lessons.get(id);
      if (!l) err(f, `lessonIds: bài học "${id}" không tồn tại`);
      else if (l.chapterId !== chapterId) err(f, `lessonIds: bài "${id}" thuộc ${l.chapterId}`);
    }
    for (const id of chapterExerciseIds.get(chapterId) ?? []) if (!exercises.has(id)) err(f, `exerciseIds: bài tập "${id}" không tồn tại`);
  }
  for (const l of lessons.values())
    if (!chapterLessonIds.get(l.chapterId)?.includes(l.id)) err(l.file, `bài học chưa được khai báo trong chapter.json → lessonIds`);
  for (const e of exercises.values())
    if (!chapterExerciseIds.get(e.chapterId)?.includes(e.id)) err(e.file, `${e.id}: chưa được khai báo trong chapter.json → exerciseIds`);

  // ----- videos
  const videoFile = join(courseDir, "video-segments.json");
  const videoData = readJson(videoFile, VideoFileSchema);
  const segmentIds = new Set<string>();
  const youtubeIds = new Set(videoData?.videos.map((v) => v.youtubeId));
  for (const seg of videoData?.segments ?? []) {
    registerId(globalIds.segment, seg.id, videoFile, "Đoạn video");
    segmentIds.add(seg.id);
    if (!youtubeIds.has(seg.youtubeId)) err(videoFile, `${seg.id}: youtubeId "${seg.youtubeId}" chưa khai báo trong videos`);
    if (seg.endSeconds <= seg.startSeconds) err(videoFile, `${seg.id}: endSeconds phải lớn hơn startSeconds`);
    if (!chapterIds.has(seg.chapterId)) err(videoFile, `${seg.id}: chapterId "${seg.chapterId}" không tồn tại`);
  }

  // ----- knowledge graph
  const graphFile = join(courseDir, "knowledge-graph.json");
  const graph = readJson(graphFile, KnowledgeGraphFileSchema);
  const nodes = new Map<string, KnowledgeNode>();
  for (const n of graph?.nodes ?? []) {
    registerId(globalIds.node, n.id, graphFile, "Node");
    nodes.set(n.id, n);
  }
  for (const n of nodes.values()) {
    if (!chapterIds.has(n.chapterId)) err(graphFile, `${n.id}: chapterId "${n.chapterId}" không tồn tại`);
    if (n.parentId && !nodes.has(n.parentId)) err(graphFile, `${n.id}: parentId "${n.parentId}" không tồn tại`);
    if (n.lessonId && !lessons.has(n.lessonId)) err(graphFile, `${n.id}: lessonId "${n.lessonId}" không tồn tại`);
    for (const key of ["prerequisites", "related", "applications", "next"] as const)
      for (const ref of n[key]) {
        if (!nodes.has(ref)) err(graphFile, `${n.id}: ${key} trỏ đến node không tồn tại "${ref}"`);
        if (ref === n.id) err(graphFile, `${n.id}: ${key} trỏ đến chính nó`);
      }
    for (const v of n.videoSegmentIds) if (!segmentIds.has(v)) err(graphFile, `${n.id}: video "${v}" không tồn tại`);
  }
  const preCycle = findCycle(new Map([...nodes.values()].map((n) => [n.id, n.prerequisites])));
  if (preCycle) err(graphFile, `vòng lặp prerequisite: ${preCycle.join(" → ")}`);
  const parentCycle = findCycle(new Map([...nodes.values()].map((n) => [n.id, n.parentId ? [n.parentId] : []])));
  if (parentCycle) err(graphFile, `vòng lặp parentId: ${parentCycle.join(" → ")}`);
  for (const seg of videoData?.segments ?? [])
    for (const t of seg.topicIds) if (!nodes.has(t)) err(videoFile, `${seg.id}: topicId "${t}" không tồn tại trong sơ đồ kiến thức`);
  for (const ex of exercises.values()) {
    if (!lessons.has(ex.lessonId)) err(ex.file, `${ex.id}: lessonId "${ex.lessonId}" không tồn tại`);
    for (const nId of ex.nodeIds) if (!nodes.has(nId)) err(ex.file, `${ex.id}: nodeId "${nId}" không tồn tại`);
    if (ex.source.documentId && !docs.has(ex.source.documentId)) err(ex.file, `${ex.id}: tài liệu nguồn "${ex.source.documentId}" không tồn tại`);
    if (ex.source.documentId) checkSources(ex.file, [{ documentId: ex.source.documentId, pages: ex.source.pages }], docs);
  }

  // ----- formulas
  const formulaFile = join(courseDir, "formulas.json");
  const formulas = readJson(formulaFile, FormulaFileSchema);
  const formulaIds = new Set<string>();
  for (const f of formulas?.formulas ?? []) {
    registerId(globalIds.formula, f.id, formulaFile, "Công thức");
    formulaIds.add(f.id);
    if (!chapterIds.has(f.chapterId)) err(formulaFile, `${f.id}: chapterId "${f.chapterId}" không tồn tại`);
    for (const l of f.lessonIds) if (!lessons.has(l)) err(formulaFile, `${f.id}: lessonId "${l}" không tồn tại`);
  }

  // ----- lessons cross references
  const lessonPre = new Map<string, string[]>();
  for (const l of lessons.values()) {
    lessonPre.set(l.id, l.prerequisites);
    for (const p of l.prerequisites) if (!lessons.has(p)) err(l.file, `prerequisites: bài "${p}" không tồn tại`);
    for (const n of l.knowledgeNodeIds) if (!nodes.has(n)) err(l.file, `knowledgeNodeIds: node "${n}" không tồn tại`);
    for (const f of l.formulaIds) if (!formulaIds.has(f)) err(l.file, `formulaIds: công thức "${f}" không tồn tại`);
    for (const v of l.videoSegmentIds) if (!segmentIds.has(v)) err(l.file, `videoSegmentIds: đoạn video "${v}" không tồn tại`);
    for (const e of [...l.guidedExerciseIds, ...l.practiceExerciseIds]) {
      const ex = exercises.get(e);
      if (!ex) err(l.file, `bài tập "${e}" không tồn tại`);
    }
    for (const e of l.guidedExerciseIds) if (exercises.get(e)?.steps.length === 0) err(l.file, `bài tập từng bước "${e}" không có bước nào`);
    checkSources(l.file, l.sources, docs);
    for (const marker of LESSON_MARKERS) {
      const count = l.body.split("\n").filter((line) => line.trim() === marker).length;
      if (count !== 1) err(l.file, `cần đúng một dòng "${marker}" trong thân bài (hiện có ${count})`);
    }
    for (const m of l.body.matchAll(/\]\((\/courses\/([^/)]+)\/lessons\/([^)#]+))\)/g)) {
      if (m[2] !== course.id || !lessons.has(m[3])) err(l.file, `liên kết nội bộ hỏng: ${m[1]}`);
    }
    checkImages(l.file, l.body);
  }
  const lessonCycle = findCycle(lessonPre);
  if (lessonCycle) err(join(courseDir, "chapters"), `vòng lặp prerequisite giữa các bài học: ${lessonCycle.join(" → ")}`);

  return { course: course.id, chapters: chapterIds.size, lessons: lessons.size, exercises: exercises.size, nodes: nodes.size, segments: segmentIds.size, formulas: formulaIds.size, documents: docs.size };
}

const courseDirs = readdirSync(COURSES_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => join(COURSES_DIR, d.name));

if (courseDirs.length === 0) err(COURSES_DIR, "không có môn học nào");
const summaries = courseDirs.map(validateCourse);

for (const w of warnings) console.warn(w);
if (errors.length) {
  console.error(`\nKiểm tra nội dung THẤT BẠI — ${errors.length} lỗi:\n`);
  for (const e of errors) console.error(e);
  console.error("\nSửa các lỗi trên rồi chạy lại `npm run validate`.");
  process.exit(1);
}
for (const s of summaries) if (s) console.log(`✓ ${s.course}: ${s.chapters} chương, ${s.lessons} bài học, ${s.exercises} bài tập, ${s.nodes} node, ${s.segments} đoạn video, ${s.formulas} công thức, ${s.documents} tài liệu`);
console.log("Kiểm tra nội dung: OK");
