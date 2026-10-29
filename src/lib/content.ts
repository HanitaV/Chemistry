/**
 * Content Layer — đọc toàn bộ nội dung tĩnh (JSON + Markdown) tại thời điểm build.
 * Thêm môn học / chương / bài học chỉ cần thêm file đúng cấu trúc thư mục, không phải sửa component.
 */
import {
  ChapterSchema,
  CourseSchema,
  DocumentsFileSchema,
  ExerciseFileSchema,
  FormulaFileSchema,
  KnowledgeGraphFileSchema,
  LessonFrontmatterSchema,
  VideoFileSchema,
  type Chapter,
  type Course,
  type DocumentMeta,
  type Exercise,
  type Formula,
  type KnowledgeNode,
  type Lesson,
  type Video,
  type VideoSegment,
} from "@/types/schema";
import { parseFrontmatter } from "./frontmatter";

type Glob = Record<string, unknown>;

const courseFiles = import.meta.glob("../content/courses/*/course.json", { eager: true, import: "default" }) as Glob;
const chapterFiles = import.meta.glob("../content/courses/*/chapters/*/chapter.json", { eager: true, import: "default" }) as Glob;
const lessonFiles = import.meta.glob("../content/courses/*/chapters/*/lessons/*.md", { eager: true, query: "?raw", import: "default" }) as Record<string, string>;
const exerciseFiles = import.meta.glob("../content/courses/*/chapters/*/exercises/*.json", { eager: true, import: "default" }) as Glob;
const graphFiles = import.meta.glob("../content/courses/*/knowledge-graph.json", { eager: true, import: "default" }) as Glob;
const videoFiles = import.meta.glob("../content/courses/*/video-segments.json", { eager: true, import: "default" }) as Glob;
const formulaFiles = import.meta.glob("../content/courses/*/formulas.json", { eager: true, import: "default" }) as Glob;
const documentFiles = import.meta.glob("../content/courses/*/documents.json", { eager: true, import: "default" }) as Glob;

const courseIdOf = (path: string) => /courses\/([^/]+)\//.exec(path)?.[1] ?? "unknown";

export type WithCourse<T> = T & { courseId: string };

function build() {
  const courses: Course[] = Object.values(courseFiles).map((c) => CourseSchema.parse(c));
  const chapters: Chapter[] = Object.values(chapterFiles)
    .map((c) => ChapterSchema.parse(c))
    .sort((a, b) => a.order - b.order);

  const chapterOrder = new Map<string, number>();
  for (const course of courses) course.chapters.forEach((id, i) => chapterOrder.set(id, i));

  const lessons: Lesson[] = Object.entries(lessonFiles)
    .map(([path, raw]) => {
      const { data, body } = parseFrontmatter(raw);
      return { ...LessonFrontmatterSchema.parse(data), courseId: courseIdOf(path), body };
    })
    .sort((a, b) => (chapterOrder.get(a.chapterId) ?? 0) - (chapterOrder.get(b.chapterId) ?? 0) || a.order - b.order);

  const exercises: WithCourse<Exercise>[] = Object.entries(exerciseFiles).flatMap(([path, data]) =>
    ExerciseFileSchema.parse(data).exercises.map((e) => ({ ...e, courseId: courseIdOf(path) })),
  );
  const nodes: WithCourse<KnowledgeNode>[] = Object.entries(graphFiles).flatMap(([path, data]) =>
    KnowledgeGraphFileSchema.parse(data).nodes.map((n) => ({ ...n, courseId: courseIdOf(path) })),
  );
  const videos: Video[] = [];
  const segments: WithCourse<VideoSegment>[] = [];
  for (const [path, data] of Object.entries(videoFiles)) {
    const parsed = VideoFileSchema.parse(data);
    videos.push(...parsed.videos);
    segments.push(...parsed.segments.map((s) => ({ ...s, courseId: courseIdOf(path) })));
  }
  segments.sort((a, b) => (chapterOrder.get(a.chapterId) ?? 0) - (chapterOrder.get(b.chapterId) ?? 0) || a.startSeconds - b.startSeconds);
  const formulas: WithCourse<Formula>[] = Object.entries(formulaFiles).flatMap(([path, data]) =>
    FormulaFileSchema.parse(data).formulas.map((f) => ({ ...f, courseId: courseIdOf(path) })),
  );
  const documents: DocumentMeta[] = Object.values(documentFiles).flatMap((d) => DocumentsFileSchema.parse(d).documents);

  const byId = <T extends { id: string }>(list: T[]) => new Map(list.map((x) => [x.id, x]));
  return {
    courses,
    chapters,
    lessons,
    exercises,
    nodes,
    videos,
    segments,
    formulas,
    documents,
    courseById: byId(courses),
    chapterById: byId(chapters),
    lessonById: byId(lessons),
    exerciseById: byId(exercises),
    nodeById: byId(nodes),
    segmentById: byId(segments),
    formulaById: byId(formulas),
    documentById: byId(documents),
  };
}

export const content = build();

// ------------------------------------------------------------------ truy vấn tiện dụng
export const getCourse = (id: string | undefined) => (id ? content.courseById.get(id) : undefined);
export const getChapter = (id: string | undefined) => (id ? content.chapterById.get(id) : undefined);
export const getLesson = (id: string | undefined) => (id ? content.lessonById.get(id) : undefined);
export const getExercise = (id: string | undefined) => (id ? content.exerciseById.get(id) : undefined);
export const getNode = (id: string | undefined) => (id ? content.nodeById.get(id) : undefined);
export const getSegment = (id: string | undefined) => (id ? content.segmentById.get(id) : undefined);
export const getDocument = (id: string | undefined) => (id ? content.documentById.get(id) : undefined);

export const chaptersOfCourse = (courseId: string) => {
  const course = getCourse(courseId);
  return course ? course.chapters.map((id) => content.chapterById.get(id)).filter((c): c is Chapter => !!c) : [];
};
export const lessonsOfChapter = (chapterId: string) => {
  const chapter = getChapter(chapterId);
  return chapter ? chapter.lessonIds.map((id) => content.lessonById.get(id)).filter((l): l is Lesson => !!l) : [];
};
export const lessonsOfCourse = (courseId: string) => content.lessons.filter((l) => l.courseId === courseId);
export const exercisesOfChapter = (chapterId: string) => content.exercises.filter((e) => e.chapterId === chapterId);
export const exercisesOfLesson = (lessonId: string) => content.exercises.filter((e) => e.lessonId === lessonId);
/** Bài tập liên quan tới một node: gắn trực tiếp, gắn với node con, hoặc thuộc bài học của node (với chủ đề/chương). */
export const exercisesOfNode = (nodeId: string) => {
  const node = content.nodeById.get(nodeId);
  if (!node) return [];
  const ids = new Set([nodeId, ...content.nodes.filter((n) => n.parentId === nodeId).map((n) => n.id)]);
  return content.exercises.filter(
    (e) => e.nodeIds.some((x) => ids.has(x)) || (node.kind !== "concept" && node.lessonId !== undefined && e.lessonId === node.lessonId) || (node.kind === "chapter" && e.chapterId === node.chapterId),
  );
};
export const nodesOfLesson = (lessonId: string) => content.nodes.filter((n) => n.lessonId === lessonId);
export const nodesOfCourse = (courseId: string) => content.nodes.filter((n) => n.courseId === courseId);
export const segmentsOfChapter = (chapterId: string) => content.segments.filter((s) => s.chapterId === chapterId);
export const documentsOfChapter = (chapterId: string) => content.documents.filter((d) => d.chapterId === chapterId);
export const formulasOfLesson = (lesson: Lesson) =>
  lesson.formulaIds.map((id) => content.formulaById.get(id)).filter((f): f is WithCourse<Formula> => !!f);
export const formulasOfChapter = (chapterId: string) => content.formulas.filter((f) => f.chapterId === chapterId);

export function adjacentLessons(lessonId: string) {
  const lesson = getLesson(lessonId);
  if (!lesson) return { prev: undefined, next: undefined };
  const list = lessonsOfCourse(lesson.courseId);
  const i = list.findIndex((l) => l.id === lessonId);
  return { prev: list[i - 1], next: list[i + 1] };
}

export const lessonPath = (lesson: Pick<Lesson, "courseId" | "id">) => `/courses/${lesson.courseId}/lessons/${lesson.id}`;
export const chapterPath = (chapter: Pick<Chapter, "courseId" | "id">) => `/courses/${chapter.courseId}/chapters/${chapter.id}`;
export const exercisePath = (exerciseId: string, mode?: "guided" | "exam") => `/practice/${exerciseId}${mode ? `?mode=${mode}` : ""}`;
export const videoPath = (segmentId: string) => `/videos?segment=${segmentId}`;
export const documentPath = (documentId: string, page?: number) => `/library/${documentId}${page ? `?page=${page}` : ""}`;

/** Danh sách mục lục (heading cấp 2–3) của một bài học, kèm các khối được chèn bởi marker. */
export function lessonToc(lesson: Lesson) {
  const items: { id: string; title: string; level: 2 | 3 }[] = [];
  const markerTitles: Record<string, string> = {
    "::formulas": "Công thức quan trọng",
    "::videos": "Video liên quan",
    "::guided-exercises": "Bài tập từng bước",
    "::practice-exercises": "Bài tập tự luyện",
  };
  let inCode = false;
  for (const line of lesson.body.split("\n")) {
    if (line.startsWith("```")) inCode = !inCode;
    if (inCode) continue;
    const m = /^(#{2,3})\s+(.+)$/.exec(line);
    if (m) items.push({ id: slugify(m[2]), title: stripMarkdown(m[2]), level: m[1].length as 2 | 3 });
    const marker = markerTitles[line.trim()];
    if (marker) items.push({ id: slugify(marker), title: marker, level: 2 });
  }
  return items;
}

export function stripMarkdown(s: string) {
  return s.replace(/\$([^$]+)\$/g, "$1").replace(/[*_`]/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

export function slugify(s: string) {
  return (
    stripMarkdown(s)
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "muc"
  );
}
