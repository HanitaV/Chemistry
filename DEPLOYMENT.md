# Deploy lên GitHub Pages

Website là SPA tĩnh, dùng `HashRouter` (URL dạng `…/#/courses/...`) và `base: "./"` nên chạy được ở **bất kỳ** đường dẫn nào (`https://<user>.github.io/<repo>/` hoặc domain riêng) mà không cần sửa cấu hình hay thêm `404.html`.

## Cách 1 — GitHub Actions (khuyến nghị)

1. Tạo repository mới trên GitHub (ví dụ `chemistry-learning-hub`) và đẩy mã nguồn:

   ```bash
   git init
   git add .
   git commit -m "Chemistry Learning Hub"
   git branch -M main
   git remote add origin https://github.com/<user>/chemistry-learning-hub.git
   git push -u origin main
   ```

2. Trên GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Workflow `.github/workflows/deploy.yml` tự chạy mỗi lần push lên `main`: `npm ci` → `npm run validate` (Zod) → `npm run build` → deploy `dist/`.
4. Sau khi workflow xanh, website ở `https://<user>.github.io/chemistry-learning-hub/`.

Nếu nội dung sai (ID trùng, đáp án không hợp lệ, prerequisite vòng lặp…), bước *validate* thất bại và website **không** bị deploy — xem log của bước đó để biết file và lỗi cụ thể.

## Cách 2 — build trên máy

```bash
npm ci
npm run build      # tạo dist/
```

Tải nội dung `dist/` lên bất kỳ static host nào (GitHub Pages nhánh `gh-pages`, Netlify, Cloudflare Pages…). Không cần cấu hình rewrite.

## Lưu ý

- PDF trong `public/documents/` được deploy cùng website và chỉ tải khi người học mở trang đọc.
- Repository công khai sẽ công khai cả PDF bài giảng — hãy chắc chắn bạn được phép chia sẻ tài liệu đó. Nếu không, giữ repository ở chế độ riêng tư (GitHub Pages cho repo riêng tư cần gói trả phí) hoặc bỏ PDF khỏi `public/documents` và `documents.json`.
- Dữ liệu cá nhân của người học nằm trong IndexedDB của từng trình duyệt, không bao giờ được gửi lên GitHub.
- Video dùng YouTube IFrame Player API (`youtube-nocookie.com`). Nếu mạng chặn YouTube, trang hiển thị nút mở video trên YouTube tại đúng thời điểm.
- Sau khi deploy phiên bản mới, người đang mở website có thể cần tải lại trang (trang lỗi sẽ gợi ý việc này).
