---
id: enthalpy
chapterId: chapter-3
order: 3
title: Enthalpy, công giãn nở và nhiệt dung
summary: Công giãn nở A = −PΔV; định nghĩa enthalpy H = U + PV; Q_p = ΔH và Q_V = ΔU; ΔH = ΔU + ΔnRT; nhiệt dung; phản ứng thu nhiệt và tỏa nhiệt.
estimatedMinutes: 45
difficulty: medium
objectives:
  - Tính công giãn nở ở áp suất không đổi.
  - Giải thích vì sao Q_p = ΔH và Q_V = ΔU.
  - Liên hệ ΔH và ΔU qua Δn khí.
  - Tính nhiệt lượng bằng q = m·c·ΔT.
  - Phân biệt phản ứng thu nhiệt và tỏa nhiệt qua dấu của ΔH.
prerequisites: [first-law]
knowledgeNodeIds: [expansion-work, enthalpy, exo-endothermic, heat-and-work]
formulaIds: [expansion-work-formula, enthalpy-definition, dh-du-relation, heat-capacity-formula]
videoSegmentIds: [first-law-enthalpy-video, pv-work-video, calorimetry-video]
guidedExerciseIds: [c3-enth-001]
practiceExerciseIds: [c3-enth-002, c3-enth-003, c3-enth-004, c3-enth-005]
sources:
  - documentId: doc-ch3-theory
    pages: [9, 10, 11, 12, 13]
---

## Giải thích lý thuyết

### Công giãn nở

Hầu hết phản ứng tiến hành trong bình hở, tức ở **áp suất không đổi**. Nếu thể tích hệ thay đổi ΔV chống lại áp suất ngoài P, hệ nhận công:

$$A = -P\,\Delta V$$

Hệ giãn nở ($\Delta V > 0$) → $A < 0$ (hệ sinh công).

### Enthalpy (trang 9)

Kết hợp với nguyên lý I ở áp suất không đổi:

$$Q_p = \Delta U - A = (U_2 - U_1) + P(V_2 - V_1) = (U_2 + PV_2) - (U_1 + PV_1)$$

Đặt **enthalpy** $H = U + PV$ (cũng là hàm trạng thái):

$$Q_p = H_2 - H_1 = \Delta H$$

**Nhiệt của quá trình đẳng áp bằng biến thiên enthalpy.** Còn nếu thể tích không đổi ($\Delta V = 0$): $Q_V = \Delta U$ — đây là ý nghĩa thực tế của nội năng.

Với khí lý tưởng, $P\Delta V = \Delta n\,RT$:

$$\Delta H = \Delta U + \Delta n_\text{khí}\,RT$$

Khi $\Delta n_\text{khí} = 0$ (hoặc chỉ có chất rắn, lỏng), $\Delta H \approx \Delta U$.

### Nhiệt dung (trang 10)

- **Nhiệt dung riêng** c (J/(g·K)): nhiệt cần để tăng 1 g chất thêm 1 K: $q = c \times m \times \Delta T$.
- **Nhiệt dung mol** C (J/(mol·K)): $C = \dfrac{q}{n\,\Delta T}$. Ví dụ nước lỏng: $C = 4{,}184 \times 18{,}02 = 75{,}40$ J/(mol·K).

### Thu nhiệt và tỏa nhiệt (trang 11–12)

Với phản ứng $aA + bB \to cC + dD$: $\Delta H_\text{pư} = H_\text{sp} - H_\text{cđ}$.

| | So sánh | Dấu ΔH | Ví dụ |
|---|---|---|---|
| **Tỏa nhiệt** | $H_\text{sp} < H_\text{cđ}$ | ΔH < 0 | $\mathrm{H_2(g) + \tfrac12O_2(g) \to H_2O(l)}$, ΔH = −285,8 kJ |
| **Thu nhiệt** | $H_\text{sp} > H_\text{cđ}$ | ΔH > 0 | $\mathrm{H_2O(l) \to H_2O(g)}$, ΔH = +40,7 kJ |

### Phương trình nhiệt hóa học (trang 13–14)

ΔH đi kèm phương trình với **trạng thái chất** xác định và tỉ lệ với lượng chất:

- Đảo chiều phản ứng → ΔH đổi dấu: $\mathrm{2H_2O(l) \to 2H_2 + O_2}$, ΔH = 572 kJ ⇒ $\mathrm{2H_2 + O_2 \to 2H_2O(l)}$, ΔH = −572 kJ.
- Nhân hệ số n → ΔH nhân n: $\mathrm{H_2 + \tfrac12O_2 \to H_2O(l)}$, ΔH = −286 kJ.
- Cộng phương trình → cộng ΔH (cơ sở của [định luật Hess](/courses/general-chemistry/lessons/hess-law)).

::formulas

## Ví dụ

**Ví dụ (trang 10).** Nung 125 g kim loại có $c = 0{,}387$ J/(g·K) từ 25 °C lên 300 °C:

$$q = 0{,}387 \times 125 \times 275 = 1{,}33\times10^4\ \text{J}$$

**Ví dụ.** $\mathrm{CH_4(g) + 2O_2(g) \to CO_2(g) + 2H_2O(l)}$: $\Delta n_\text{khí} = 1 - 3 = -2$ → $\Delta H < \Delta U$ một lượng $2RT \approx 4{,}96$ kJ ở 298 K.

::videos

::guided-exercises

::practice-exercises

## Tổng kết

- $A = -P\Delta V$; $H = U + PV$; $Q_p = \Delta H$, $Q_V = \Delta U$.
- $\Delta H = \Delta U + \Delta n RT$.
- $q = mc\Delta T$.
- ΔH < 0 tỏa nhiệt; ΔH > 0 thu nhiệt; đảo chiều đổi dấu, nhân hệ số nhân ΔH.
