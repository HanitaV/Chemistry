/**
 * Schema nội dung (Content Layer).
 * File này chỉ phụ thuộc vào Zod để có thể dùng chung cho:
 *  - ứng dụng React (đọc dữ liệu lúc build bằng import.meta.glob)
 *  - script kiểm tra dữ liệu `scripts/validate-content.ts` (chạy bằng Node trước khi build)
 */
import { z } from "zod";

const id = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "ID chỉ gồm chữ thường, số và dấu gạch ngang (kebab-case)");

export const SourceRefSchema = z.object({
  documentId: id,
  pages: z.array(z.number().int().positive()).optional(),
  note: z.string().optional(),
});

export const CourseSchema = z.object({
  id,
  title: z.string().min(1),
  shortTitle: z.string().optional(),
  description: z.string(),
  language: z.literal("vi"),
  chapters: z.array(id).min(1),
});

export const ChapterSchema = z.object({
  id,
  courseId: id,
  order: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string(),
  lessonIds: z.array(id),
  exerciseIds: z.array(id),
  sourceIds: z.array(id),
});

export const DocumentSchema = z.object({
  id,
  courseId: id,
  chapterId: id.optional(),
  title: z.string().min(1),
  kind: z.enum(["theory", "exercises", "reference"]),
  /** Đường dẫn tương đối tính từ thư mục public/ */
  path: z.string().regex(/^documents\/.+\.pdf$/, "Tài liệu chính thức phải nằm trong public/documents và là file .pdf"),
  pageCount: z.number().int().positive(),
  description: z.string(),
});
export const DocumentsFileSchema = z.object({ documents: z.array(DocumentSchema) });

export const VideoSchema = z.object({
  youtubeId: z.string().regex(/^[A-Za-z0-9_-]{11}$/, "YouTube ID phải có 11 ký tự"),
  title: z.string(),
  durationSeconds: z.number().int().positive().optional(),
});

export const VideoSegmentSchema = z.object({
  id,
  youtubeId: z.string(),
  title: z.string(),
  titleVi: z.string(),
  chapterId: id,
  startSeconds: z.number().int().nonnegative(),
  endSeconds: z.number().int().positive(),
  topicIds: z.array(id),
});
export const VideoFileSchema = z.object({
  videos: z.array(VideoSchema).min(1),
  segments: z.array(VideoSegmentSchema),
});

export const KnowledgeNodeSchema = z.object({
  id,
  chapterId: id,
  kind: z.enum(["chapter", "topic", "concept"]),
  category: z.enum(["khai-niem", "nguyen-ly", "mo-hinh", "tinh-toan", "tong-quan"]),
  label: z.string().min(1),
  description: z.string(),
  parentId: id.optional(),
  lessonId: id.optional(),
  prerequisites: z.array(id).default([]),
  related: z.array(id).default([]),
  applications: z.array(id).default([]),
  next: z.array(id).default([]),
  videoSegmentIds: z.array(id).default([]),
});
export const KnowledgeGraphFileSchema = z.object({ nodes: z.array(KnowledgeNodeSchema) });

export const FormulaSchema = z.object({
  id,
  chapterId: id,
  name: z.string(),
  latex: z.string(),
  symbols: z.array(z.object({ symbol: z.string(), meaning: z.string(), unit: z.string().optional() })),
  unit: z.string(),
  conditions: z.array(z.string()).min(1, "Mỗi công thức phải nêu điều kiện áp dụng"),
  example: z.string(),
  warning: z.string().optional(),
  lessonIds: z.array(id),
});
export const FormulaFileSchema = z.object({ formulas: z.array(FormulaSchema) });

export const LessonFrontmatterSchema = z.object({
  id,
  chapterId: id,
  order: z.number().int().positive(),
  title: z.string().min(1),
  summary: z.string(),
  estimatedMinutes: z.number().int().positive(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  objectives: z.array(z.string()).min(1),
  prerequisites: z.array(id).default([]),
  knowledgeNodeIds: z.array(id).default([]),
  formulaIds: z.array(id).default([]),
  videoSegmentIds: z.array(id).default([]),
  guidedExerciseIds: z.array(id).default([]),
  practiceExerciseIds: z.array(id).default([]),
  sources: z.array(SourceRefSchema).default([]),
});

/** Các dấu mốc bắt buộc trong thân bài học (để chèn khối tương tác đúng thứ tự cấu trúc bài học). */
export const LESSON_MARKERS = ["::formulas", "::videos", "::guided-exercises", "::practice-exercises"] as const;

const option = z.object({ id: z.string().min(1), text: z.string().min(1) });
const stepBase = {
  id: z.string().min(1),
  prompt: z.string().min(1),
  hint: z.string().optional(),
  explanation: z.string().min(1, "Mỗi bước phải có giải thích"),
};

export const StepSchema = z.discriminatedUnion("type", [
  z.object({ ...stepBase, type: z.literal("single-choice"), options: z.array(option).min(2), correctAnswer: z.string() }),
  z.object({ ...stepBase, type: z.literal("formula-selection"), options: z.array(option).min(2), correctAnswer: z.string() }),
  z.object({
    ...stepBase,
    type: z.literal("multiple-choice"),
    options: z.array(option).min(2),
    correctAnswer: z.array(z.string()).min(1),
  }),
  z.object({
    ...stepBase,
    type: z.literal("numeric"),
    correctAnswer: z.number(),
    tolerance: z.object({ relative: z.number().nonnegative().optional(), absolute: z.number().nonnegative().optional() }),
    unit: z.string().optional(),
  }),
  z.object({
    ...stepBase,
    type: z.literal("short-answer"),
    correctAnswer: z.array(z.string().min(1)).min(1),
    caseSensitive: z.boolean().optional(),
  }),
  z.object({
    ...stepBase,
    type: z.literal("math-expression"),
    correctAnswer: z.string().min(1),
    variables: z.array(z.string()).default([]),
    placeholder: z.string().optional(),
  }),
]);

export const ExerciseSchema = z.object({
  id,
  chapterId: id,
  lessonId: id,
  nodeIds: z.array(id).default([]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  title: z.string().min(1),
  /** Dạng bài (dùng cho thống kê "dạng cần ôn lại") */
  skill: z.string().min(1),
  statement: z.string().min(1),
  steps: z.array(StepSchema).default([]),
  solution: z.string().min(1),
  finalAnswer: z.string().min(1),
  source: z.object({
    kind: z.enum(["extracted", "adapted", "supplementary"]),
    documentId: id.optional(),
    pages: z.array(z.number().int().positive()).optional(),
    note: z.string().optional(),
  }),
});
export const ExerciseFileSchema = z.object({ exercises: z.array(ExerciseSchema) });

export type SourceRef = z.infer<typeof SourceRefSchema>;
export type Course = z.infer<typeof CourseSchema>;
export type Chapter = z.infer<typeof ChapterSchema>;
export type DocumentMeta = z.infer<typeof DocumentSchema>;
export type Video = z.infer<typeof VideoSchema>;
export type VideoSegment = z.infer<typeof VideoSegmentSchema>;
export type KnowledgeNode = z.infer<typeof KnowledgeNodeSchema>;
export type Formula = z.infer<typeof FormulaSchema>;
export type LessonFrontmatter = z.infer<typeof LessonFrontmatterSchema>;
export type Lesson = LessonFrontmatter & { courseId: string; body: string };
export type Step = z.infer<typeof StepSchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
export type Difficulty = Exercise["difficulty"];
