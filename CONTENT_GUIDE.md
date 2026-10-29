# Hướng dẫn thêm và sửa nội dung

Toàn bộ nội dung nằm trong `src/content/courses/<course-id>/`. Sau mỗi thay đổi, chạy:

```bash
npm run validate
```

Script kiểm tra bằng Zod (schema ở `src/types/schema.ts`) và **dừng build** nếu có lỗi, kèm thông báo rõ file + vị trí. Các kiểm tra gồm: ID duy nhất toàn website, chapter/lesson/video/node/công thức/tài liệu được tham chiếu phải tồn tại, timestamp hợp lệ (end > start), đáp án bài tập hợp lệ (và được chính bộ chấm công nhận), không có prerequisite trỏ tới node không tồn tại, không có vòng lặp prerequisite (node và bài học), đường dẫn PDF/ảnh tồn tại, số trang trích dẫn không vượt quá số trang PDF, liên kết nội bộ trong bài học không hỏng, mỗi bài có đủ 4 dòng marker.

**Quy ước ID:** chữ thường, số, gạch ngang (`kebab-case`), duy nhất trên toàn website (vì URL và tiến độ dùng ID làm khóa). Nên đặt tiền tố theo môn/chương cho bài tập, ví dụ `c4-eq-001`. **Không đổi ID đã phát hành** — tiến độ của người học gắn với ID.

## Cấu trúc thư mục một môn học

```
src/content/courses/general-chemistry/
├── course.json            # thông tin môn + danh sách chương theo thứ tự
├── documents.json         # tài liệu PDF chính thức
├── knowledge-graph.json   # node sơ đồ kiến thức
├── video-segments.json    # video và các đoạn theo timestamp
├── formulas.json          # công thức (Formula Card)
└── chapters/
    └── chapter-1/
        ├── chapter.json
        ├── lessons/01-atomic-structure.md …
        └── exercises/*.json
```

## Thêm một chương mới (ví dụ chương 4 — Cân bằng hóa học)

1. Đặt PDF vào `public/documents/chapter-4/chuong-4-can-bang.pdf` và khai báo trong `documents.json`:

   ```json
   { "id": "doc-ch4-theory", "courseId": "general-chemistry", "chapterId": "chapter-4",
     "title": "Bài giảng Chương 4 — Cân bằng hóa học", "kind": "theory",
     "path": "documents/chapter-4/chuong-4-can-bang.pdf", "pageCount": 40,
     "description": "…" }
   ```

2. Thêm `"chapter-4"` vào `course.json → chapters`.
3. Tạo `chapters/chapter-4/chapter.json`:

   ```json
   { "id": "chapter-4", "courseId": "general-chemistry", "order": 4,
     "title": "Cân bằng hóa học", "description": "…",
     "lessonIds": ["equilibrium-constant"], "exerciseIds": ["c4-eq-001"],
     "sourceIds": ["doc-ch4-theory"] }
   ```

4. Viết bài học, bài tập, node, công thức, video như dưới đây. Giao diện (sidebar, dashboard, sơ đồ, luyện tập, thư viện) tự cập nhật — không phải sửa component.

## Bài học (Markdown)

```markdown
---
id: equilibrium-constant
chapterId: chapter-4
order: 1
title: Hằng số cân bằng
summary: Một câu tóm tắt.
estimatedMinutes: 40
difficulty: medium            # easy | medium | hard
objectives:
  - Viết biểu thức K.
prerequisites: [gibbs-equilibrium]          # id bài học
knowledgeNodeIds: [equilibrium-constant]    # id node
formulaIds: [gibbs-k]
videoSegmentIds: []
guidedExerciseIds: [c4-eq-001]   # hiện ở mục "Bài tập từng bước" (phải có steps)
practiceExerciseIds: []          # hiện ở mục "Bài tập tự luyện"
sources:
  - documentId: doc-ch4-theory
    pages: [3, 4]
    note: (tuỳ chọn)
---

## Giải thích lý thuyết
Nội dung Markdown; công thức inline $K = e^{-\Delta G^\circ/RT}$ hoặc khối $$…$$.

::formulas

## Ví dụ
…

::videos

::guided-exercises

::practice-exercises

## Tổng kết
- …
```

- 4 dòng marker `::formulas`, `::videos`, `::guided-exercises`, `::practice-exercises` (mỗi dòng đúng một lần) được thay bằng khối tương tác, giữ đúng thứ tự cấu trúc bài học.
- Tiêu đề `## Giải thích lý thuyết`, `## Ví dụ`, `## Tổng kết` được tô màu phân biệt.
- Liên kết nội bộ: `[Bài Gibbs](/courses/general-chemistry/lessons/gibbs)`.
- Ảnh: đặt trong `public/images/...`, viết `![mô tả](images/chapter-4/hinh.png)` (không có `/` đầu).
- Markdown không render HTML thô (an toàn); KaTeX hỗ trợ `\mathrm{}`, `\dfrac`, `\Delta`, `\rightleftharpoons`… (dùng `{,}` cho dấu phẩy thập phân: `2{,}18`).

## Bài tập (JSON)

```json
{
  "exercises": [
    {
      "id": "c4-eq-001",
      "chapterId": "chapter-4",
      "lessonId": "equilibrium-constant",
      "nodeIds": ["equilibrium-constant"],
      "difficulty": "easy",
      "title": "Tính K từ ΔG°",
      "skill": "ΔG° và K",
      "statement": "Đề bài Markdown + LaTeX",
      "steps": [
        { "id": "step-1", "type": "formula-selection", "prompt": "Chọn công thức",
          "options": [{ "id": "a", "text": "$K = e^{-\\Delta G^\\circ/RT}$" }, { "id": "b", "text": "…" }],
          "correctAnswer": "a", "hint": "(tuỳ chọn)", "explanation": "Vì sao đúng" },
        { "id": "step-2", "type": "numeric", "prompt": "K = ?", "correctAnswer": 6.88,
          "tolerance": { "relative": 0.02 }, "unit": "", "explanation": "…" }
      ],
      "solution": "Lời giải tự luận đầy đủ (Markdown)",
      "finalAnswer": "K ≈ 6,88",
      "source": { "kind": "extracted", "documentId": "doc-ch4-theory", "pages": [12], "note": "Bài 3 trang 12" }
    }
  ]
}
```

Các loại bước (`type`):

| type | Trường riêng | Chấm |
|---|---|---|
| `single-choice` | `options`, `correctAnswer` (id) | đúng id |
| `formula-selection` | như trên; `text` thường là LaTeX | đúng id |
| `multiple-choice` | `options`, `correctAnswer` (mảng id) | đúng tập |
| `numeric` | `correctAnswer` (số), `tolerance.relative` hoặc `tolerance.absolute`, `unit` | trong sai số; nhận `2,04e-18`, `2,04×10^-18`, `1,2.10^-18`, dấu phẩy thập phân |
| `short-answer` | `correctAnswer` (mảng đáp án chấp nhận) | so sánh sau chuẩn hóa (bỏ khoảng trắng, chữ hoa/thường, chỉ số trên) |
| `math-expression` | `correctAnswer` (biểu thức), `variables` | so sánh giá trị tại nhiều điểm ngẫu nhiên (`H1 - H2` ≡ `-(H2-H1)`) |

**Nguồn bài tập (`source.kind`)** — bắt buộc trung thực:

- `extracted`: đề trích từ PDF (phải có `documentId`, nên có `pages`). Nếu lời giải do bạn viết, ghi trong `note`.
- `adapted`: biên soạn lại từ nội dung tài liệu (phải có `documentId`).
- `supplementary`: bài bổ sung không có trong tài liệu.

Không gắn nhãn `extracted` cho bài tự tạo. Bài không có `steps` vẫn hợp lệ nhưng chỉ dùng được ở chế độ Exam.

## Sơ đồ kiến thức (`knowledge-graph.json`)

```json
{ "id": "equilibrium-constant", "chapterId": "chapter-4", "kind": "topic",
  "category": "tinh-toan", "label": "Hằng số cân bằng", "description": "…",
  "parentId": "ch4-equilibrium", "lessonId": "equilibrium-constant",
  "prerequisites": ["gibbs-equilibrium"], "related": [], "applications": [], "next": [],
  "videoSegmentIds": [] }
```

- `kind`: `chapter` (gốc của chương) | `topic` | `concept`.
- `category`: `tong-quan` | `khai-niem` | `nguyen-ly` | `mo-hinh` | `tinh-toan` (dùng cho bộ lọc “loại kiến thức”).
- Chỉ nối quan hệ có ý nghĩa sư phạm; `prerequisites` không được tạo vòng lặp.

## Video (`video-segments.json`)

```json
{ "videos": [{ "youtubeId": "6OV3tmt9uhs", "title": "General Chemistry – Full University Course" }],
  "segments": [{ "id": "equilibrium-video", "youtubeId": "6OV3tmt9uhs", "title": "Chemical Equilibrium",
    "titleVi": "Cân bằng hóa học", "chapterId": "chapter-4",
    "startSeconds": 37000, "endSeconds": 38500, "topicIds": ["equilibrium-constant"] }] }
```

`hh:mm:ss` → giây: `h*3600 + m*60 + s`. `topicIds` phải là id node. Không tải video vào repository.

## Công thức (`formulas.json`)

Mỗi công thức cần: `name`, `latex`, `symbols` (ký hiệu – ý nghĩa – đơn vị), `unit`, `conditions` (ít nhất 1 điều kiện áp dụng), `example`, tuỳ chọn `warning` (cảnh báo dùng sai mô hình), `lessonIds`.

## Thêm môn học khác

Tạo thư mục `src/content/courses/<course-id>/` với đủ các file như trên. ID phải không trùng với môn học hiện có. Sidebar, trang Môn học và các bộ lọc tự hiển thị môn mới.
