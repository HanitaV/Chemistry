---
id: formation-enthalpy
chapterId: chapter-3
order: 5
title: Nhiệt tạo thành và enthalpy chuẩn
summary: Điều kiện chuẩn; nhiệt tạo thành chuẩn ΔH°f; quy ước đơn chất bằng 0; tính ΔH° phản ứng từ ΔH°f.
estimatedMinutes: 35
difficulty: medium
objectives:
  - Định nghĩa điều kiện chuẩn và nhiệt tạo thành chuẩn.
  - Viết đúng phương trình nhiệt tạo thành của một chất.
  - Tính ΔH° phản ứng từ bảng ΔH°f.
prerequisites: [hess-law]
knowledgeNodeIds: [formation-enthalpy]
formulaIds: [reaction-enthalpy-formation, hess-combination]
videoSegmentIds: [hess-law-video, calculating-dg-dh-ds-video]
guidedExerciseIds: [c3-form-001]
practiceExerciseIds: [c3-form-002, c3-hess-009]
sources:
  - documentId: doc-ch3-theory
    pages: [24, 25, 33, 39]
---

## Giải thích lý thuyết

### Điều kiện chuẩn

Bài giảng (trang 25) dùng điều kiện chuẩn **1 atm và 25 °C** (298 K); hiệu ứng nhiệt khi đó kí hiệu $\Delta H^\circ_{298}$. (Một số tài liệu dùng áp suất chuẩn 1 bar; chênh lệch không đáng kể ở mức độ môn học.)

### Nhiệt tạo thành chuẩn

**Nhiệt tạo thành chuẩn** $\Delta H^\circ_f$ của một chất là hiệu ứng nhiệt của phản ứng tạo **1 mol** chất đó từ các **đơn chất bền nhất** ở điều kiện chuẩn.

- $\mathrm{\tfrac12H_2(g) + \tfrac12Cl_2(g) \to HCl(g)}$: $\Delta H^\circ_f(\mathrm{HCl}) = -92{,}3$ kJ/mol.
- **Quy ước:** $\Delta H^\circ_f$ của **đơn chất bền** = 0 (ví dụ $\mathrm{O_2(g)}$, $\mathrm{C(graphit)}$, $\mathrm{S(s)}$). Kim cương không phải dạng bền nhất của C nên $\Delta H^\circ_f \ne 0$.

### Tính ΔH° phản ứng từ ΔH°f

Áp dụng định luật Hess: mọi phản ứng có thể tưởng tượng gồm hai giai đoạn — phân hủy chất đầu thành đơn chất (ngược với tạo thành) rồi tạo sản phẩm từ đơn chất (ví dụ $\mathrm{TiCl_4}$ trang 24). Do đó với $aA + bB \to cC + dD$:

$$\Delta H^\circ_\text{pư} = \sum\nu\,\Delta H^\circ_f(\text{sp}) - \sum\nu\,\Delta H^\circ_f(\text{cđ}) = (c\,\Delta H^\circ_C + d\,\Delta H^\circ_D) - (a\,\Delta H^\circ_A + b\,\Delta H^\circ_B)$$

Đơn vị thường là kJ (hoặc kcal).

> Lỗi thường gặp: quên nhân hệ số, đảo thứ tự “sản phẩm trừ chất đầu”, dùng nhầm $\Delta H^\circ_f$ của $\mathrm{H_2O(l)}$ (−285,8) với $\mathrm{H_2O(g)}$ (−241,8).

::formulas

## Ví dụ

**Ví dụ (trang 33).** $\mathrm{4KClO_3(s) \to 3KClO_4(s) + KCl(s)}$ với $\Delta H^\circ_f$: KClO₃ −397,7; KClO₄ −432,8; KCl −436,7 kJ/mol:

$$\Delta H^\circ = [3(-432{,}8) + (-436{,}7)] - 4(-397{,}7) = -144\ \text{kJ}$$

**Ví dụ (trang 25).** $\mathrm{4NH_3(g) + 5O_2(g) \to 4NO(g) + 6H_2O(g)}$:

$$\Delta H^\circ = \{4\Delta H^\circ_f[\mathrm{NO}] + 6\Delta H^\circ_f[\mathrm{H_2O(g)}]\} - \{4\Delta H^\circ_f[\mathrm{NH_3}] + 5\Delta H^\circ_f[\mathrm{O_2}]\}$$

::videos

::guided-exercises

::practice-exercises

## Tổng kết

- $\Delta H^\circ_f$: tạo 1 mol chất từ đơn chất bền, điều kiện chuẩn.
- $\Delta H^\circ_f$(đơn chất bền) = 0.
- $\Delta H^\circ_\text{pư} = \sum\nu\Delta H^\circ_f(\text{sp}) - \sum\nu\Delta H^\circ_f(\text{cđ})$.
