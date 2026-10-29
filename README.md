# Chemistry Learning Hub

Website học tập tương tác cho sinh viên đại học — môn **Hóa học đại cương** (3 chương đầu). Chạy hoàn toàn ở trình duyệt (frontend-only), deploy trực tiếp lên GitHub Pages, không cần đăng nhập, backend, database server hay API key.

## Tính năng

| Khu vực | Nội dung |
|---|---|
| **Dashboard** | Tiến độ tổng thể, chương đang học, bài tiếp theo, bài tập đã hoàn thành, kiến thức cần ôn lại, video gần đây, thời gian học, nút “Tiếp tục học”, thẻ **Chế độ ôn thi** |
| **Bài học** | 23 bài theo cấu trúc thống nhất: mục tiêu → tiên quyết → lý thuyết → công thức → ví dụ → video → bài tập từng bước → bài tự luyện → tổng kết. Markdown + LaTeX (KaTeX). Panel phải: mục lục, công thức, video, tài liệu (mở PDF đúng trang), ghi chú, trạng thái hoàn thành (ẩn được; trên mobile là bottom sheet) |
| **Sơ đồ kiến thức** | 71 node (chương → chủ đề → khái niệm), quan hệ *tiên quyết / liên quan / ứng dụng / học tiếp*, bố cục tự động (dagre), lọc theo chương, trạng thái, loại kiến thức; pan/zoom; click node → mô tả, tiên quyết, bài học, video, bài tập, nút bắt đầu học, cập nhật trạng thái |
| **Video** | 23 đoạn của *General Chemistry – Full University Course* (YouTube IFrame Player API): seek theo timestamp, chuyển đoạn, mở trên YouTube, ghi chú theo thời điểm, nhớ vị trí xem; phương án dự phòng khi video không nhúng được |
| **Luyện tập** | 80 bài (52 trích từ tài liệu, 13 biên soạn lại, 15 bổ sung), 3 mức độ khó. **Guided mode**: chấm từng bước (một/nhiều lựa chọn, chọn công thức, nhập số, trả lời ngắn, nhập biểu thức), gợi ý, chẩn đoán lỗi (sai dấu, lệch 10ⁿ do đổi đơn vị…), lời giải tự luận đầy đủ. **Exam mode**: tự trình bày, xem đáp án mẫu, tự đánh giá — không tuyên bố chấm tự luận tự động |
| **Thư viện** | 4 PDF chính thức (PDF.js: chuyển trang, zoom, tìm kiếm văn bản, mở tab mới, tải xuống — chỉ tải khi mở). Tài liệu cá nhân: PDF, Markdown, JSON, CSV, ảnh, TXT, URL YouTube — lưu trong IndexedDB |
| **Tiến độ** | Theo chương, mức độ thành thạo theo chủ đề, thời gian học 14 ngày, lịch sử làm bài |
| **Ôn thi** | Nhập ngày/giờ thi, chương cần ôn, phút học/ngày → kế hoạch theo ngày (thuật toán phân bổ, không dùng AI) |
| **Cài đặt** | Sáng/tối/theo hệ thống, cỡ chữ, chế độ bài tập mặc định, Export/Import/Reset Progress, Backup dữ liệu cá nhân |

## Công nghệ

React 19 · Vite · TypeScript · Tailwind CSS v4 · thành phần kiểu shadcn/ui (Radix) · React Router (HashRouter) · @xyflow/react + dagre · react-markdown + remark-math + rehype-katex · PDF.js · YouTube IFrame Player API · Lucide · Zustand · IndexedDB/Dexie · Zod · GitHub Actions.

## Chạy trên máy

Yêu cầu Node.js ≥ 20.19 (khuyến nghị 22).

```bash
npm install
npm run dev        # http://localhost:5173
npm run validate   # kiểm tra toàn bộ nội dung bằng Zod
npm run build      # validate + typecheck + build vào dist/
npm run preview    # xem bản build
```

## Kiến trúc (Content-driven Static SPA)

```
src/
├── app/                 # App, router (HashRouter, các trang lazy-load)
├── components/
│   ├── layout/          # Sidebar (thu gọn được / drawer mobile), header
│   ├── ui/              # Button, Card, Tabs, Dialog, Sheet… (kiểu shadcn/ui)
│   ├── common/          # Markdown + KaTeX an toàn, badge
│   ├── knowledge-graph/ # React Flow + dagre
│   ├── lesson-viewer/   # nội dung bài, Formula Card, panel phải, ghi chú
│   ├── video-player/    # YouTube IFrame API
│   ├── exercise-engine/ # Guided / Exam
│   └── pdf-viewer/      # PDF.js
├── content/courses/<course>/   # Content + Knowledge Layer (JSON, Markdown)
├── lib/
│   ├── content.ts       # đọc nội dung (import.meta.glob), truy vấn
│   ├── db.ts            # Persistence Layer (Dexie)
│   ├── progress.ts      # tiến độ, thành thạo, thời gian học
│   ├── grading.ts       # chấm từng bước (dùng chung với script validate)
│   ├── backup.ts        # Import/Export Layer
│   └── exam-plan.ts     # thuật toán kế hoạch ôn thi
├── pages/               # Presentation Layer
├── stores/              # Zustand (giao diện)
└── types/schema.ts      # Zod schema — nguồn sự thật cho mọi kiểu dữ liệu
scripts/validate-content.ts      # chạy trước mỗi lần build
public/documents/chapter-*/      # PDF chính thức
```

Không có danh sách chương/bài/video nào được viết cứng trong component — tất cả đọc từ `src/content`. Xem **[CONTENT_GUIDE.md](CONTENT_GUIDE.md)** để thêm chương 4–7 hoặc môn học khác, **[DEPLOYMENT.md](DEPLOYMENT.md)** để deploy.

## Nguồn nội dung và độ tin cậy

- Lý thuyết, ví dụ và bài tập được đối chiếu với 4 PDF trong `public/documents/` (bài giảng chương 1, 2, 3 và bài tập chương 1). Mỗi bài học ghi nguồn theo trang; mỗi bài tập có nhãn **Trích từ tài liệu / Biên soạn lại / Bài bổ sung**. Lời giải của các bài trích từ PDF (khi PDF không có lời giải) do website biên soạn — ghi chú rõ trong trường `source.note`.
- Mọi đáp số được tính bằng script và được bộ chấm kiểm tra lại khi `npm run validate`.
- Phạm vi mô hình được nêu rõ: công thức Bohr chỉ áp dụng cho hệ **một electron** (bài “nguyên tử He” được giải như He⁺; bài năng lượng ion hóa He, F, Na có ghi chú khác biệt với IE₁ thực nghiệm).
- Sửa lỗi trong tài liệu gốc được ghi chú: $S^\circ(\mathrm{CO_2}) = -213{,}74$ in sai dấu (dùng +213,74); bài 2/3 trang 32 ghi “vùng IR” cho chuyển mức từ n = 1 (thực tế thuộc vùng UV).
- Timestamp video lấy từ bảng trong đặc tả dự án (file `Pasted markdown(4).md` không có trong repository). Nên mở thử từng đoạn để xác nhận.
- Một số số liệu bổ sung (ΔH°f của NH₃, NO, H₂O(g); Q nguyên tử hóa CH₄; ΔH đốt graphit/kim cương) là giá trị tham khảo phổ biến, được ghi “bổ sung”.

## Dữ liệu cá nhân

Tiến độ, kết quả bài tập, câu trả lời sai, ghi chú, vị trí video, thời gian học, cài đặt, kế hoạch ôn thi và tài liệu cá nhân được lưu trong **IndexedDB** của trình duyệt (yêu cầu lưu trữ bền vững nếu trình duyệt hỗ trợ). Không đồng bộ giữa thiết bị — dùng *Cài đặt → Export / Import*. Không có dữ liệu cá nhân nào được đưa vào repository.
