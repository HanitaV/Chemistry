---
id: hess-law
chapterId: chapter-3
order: 4
title: Định luật Hess
summary: Phát biểu định luật Hess; ba cách vận dụng (sơ đồ vòng, đảo chiều, cộng trừ phương trình); tổ hợp nhiều phương trình nhiệt hóa học.
estimatedMinutes: 45
difficulty: medium
objectives:
  - Phát biểu định luật Hess.
  - Lập sơ đồ vòng (chu trình) để tính hiệu ứng nhiệt.
  - Tổ hợp tuyến tính các phương trình nhiệt hóa học để tính ΔH của phản ứng cần tìm.
prerequisites: [enthalpy]
knowledgeNodeIds: [hess-law]
formulaIds: [hess-combination]
videoSegmentIds: [hess-law-video]
guidedExerciseIds: [c3-hess-002]
practiceExerciseIds: [c3-hess-001, c3-hess-003, c3-hess-004, c3-hess-005, c3-hess-006, c3-hess-007, c3-hess-008]
sources:
  - documentId: doc-ch3-theory
    pages: [14, 15, 16, 17, 18, 19, 21, 22, 23, 37, 38, 39]
---

## Giải thích lý thuyết

### Phát biểu (trang 15)

> **Định luật Hess:** Hiệu ứng nhiệt của phản ứng hóa học chỉ phụ thuộc vào bản chất, trạng thái của các chất tham gia và sản phẩm, **không phụ thuộc vào cách tiến hành** quá trình, tức không phụ thuộc vào số lượng và đặc trưng của các giai đoạn trung gian.

Nguyên nhân: H là hàm trạng thái. Nếu từ A + B có thể đi thẳng tới sản phẩm, hoặc qua các giai đoạn trung gian E + F → G + H, thì:

$$\Delta H^\circ_{298} = \Delta H^\circ_1 + \Delta H^\circ_2 + \Delta H^\circ_3$$

### Ba cách vận dụng — ví dụ graphit → kim cương (trang 16–19)

Cho (1) $\mathrm{C(gr) + O_2 \to CO_2}$, $\Delta H_1$; (2) $\mathrm{C(kc) + O_2 \to CO_2}$, $\Delta H_2$. Tìm $\Delta H_3$ của $\mathrm{C(gr) \to C(kc)}$.

1. **Sơ đồ vòng:** đi từ C(gr) đến CO₂ theo hai đường: trực tiếp ($\Delta H_1$) hoặc qua C(kc) ($\Delta H_3 + \Delta H_2$) ⇒ $\Delta H_1 = \Delta H_3 + \Delta H_2$.
2. **Đảo chiều:** viết lại vòng theo chiều khác, đổi dấu tương ứng — cùng kết quả.
3. **Cộng trừ phương trình:** (1) − (2) cho đúng phương trình (3).

$$\Delta H_3 = \Delta H_1 - \Delta H_2$$

### Quy trình tổ hợp phương trình

1. Xác định phương trình cần tìm, đánh dấu chất nào ở vế trái/phải và hệ số của chúng.
2. Với mỗi chất **chỉ xuất hiện trong một** phương trình đã cho: chọn hệ số (kể cả dấu) để chất đó có đúng vị trí và hệ số như phương trình cần tìm.
3. Nhân, đảo chiều các phương trình; **làm tương tự với ΔH**.
4. Cộng lại, kiểm tra các chất trung gian triệt tiêu hết.

$$\Delta H = \sum_i k_i\,\Delta H_i$$

### Lưu ý

- Trạng thái chất phải khớp ($\mathrm{H_2O(l)}$ khác $\mathrm{H_2O(g)}$; $\mathrm{N_2O_5(s)}$ khác $\mathrm{N_2O_5(g)}$).
- Hệ số phân số (½, ⅓) là bình thường trong phương trình nhiệt hóa học.

::formulas

## Ví dụ

**Ví dụ 1 (trang 21–23).** (1) $\mathrm{S(s) + O_2 \to SO_2}$, $-296{,}8$ kJ; (2) $\mathrm{2SO_2 + O_2 \to 2SO_3}$, $-198{,}4$ kJ. Tìm ΔH của $\mathrm{S(s) + \tfrac32O_2 \to SO_3}$:

$$(3) = (1) + \tfrac12(2) \Rightarrow \Delta H_3 = -296{,}8 + \tfrac12(-198{,}4) = -396{,}0\ \text{kJ}$$

Sơ đồ vòng tương đương: $2\Delta H_3 = 2\Delta H_1 + \Delta H_2$.

**Ví dụ 2 (trang 24).** $\mathrm{TiCl_4(l) + 2H_2O(g) \to TiO_2(s) + 4HCl(g)}$ được phân tích thành các giai đoạn phân hủy chất đầu về đơn chất và tạo sản phẩm từ đơn chất — dẫn đến công thức tính từ [nhiệt tạo thành](/courses/general-chemistry/lessons/formation-enthalpy).

::videos

::guided-exercises

::practice-exercises

## Tổng kết

- ΔH không phụ thuộc đường đi (H là hàm trạng thái).
- Tổ hợp phương trình: đảo chiều → đổi dấu; nhân k → nhân k.
- Kiểm tra trạng thái chất và sự triệt tiêu chất trung gian.
