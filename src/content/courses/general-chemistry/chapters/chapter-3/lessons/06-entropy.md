---
id: entropy
chapterId: chapter-3
order: 6
title: Entropy
summary: Vì sao ΔH không quyết định chiều phản ứng; entropy S = k lnW và độ hỗn độn; ΔS của phản ứng; dự đoán dấu ΔS.
estimatedMinutes: 35
difficulty: medium
objectives:
  - Giải thích vì sao enthalpy không đủ để quyết định chiều phản ứng.
  - Nêu ý nghĩa vi mô của entropy (S = k lnW).
  - Dự đoán dấu ΔS qua trạng thái chất và số mol khí.
  - Tính ΔS° phản ứng từ entropy chuẩn.
prerequisites: [formation-enthalpy]
knowledgeNodeIds: [entropy]
formulaIds: [boltzmann-entropy, reaction-entropy]
videoSegmentIds: [entropy-video, laws-of-thermodynamics-video]
guidedExerciseIds: [c3-ent-002]
practiceExerciseIds: [c3-ent-001, c3-ent-003]
sources:
  - documentId: doc-ch3-theory
    pages: [26, 27, 28, 29, 30, 31]
---

## Giải thích lý thuyết

### Enthalpy không quyết định chiều phản ứng (trang 27)

Nhiều quá trình tự xảy ra là tỏa nhiệt ($\Delta H < 0$): đông đặc nước dưới 0 °C, đốt metan, Na + Cl₂. Nhưng cũng có những quá trình tự xảy ra mà **thu nhiệt** ($\Delta H > 0$): nước đá tan ở trên 0 °C (+6,02 kJ), nước bay hơi (+44,0 kJ ở 100 °C). Vậy cần một đại lượng khác — **entropy**.

### Entropy và độ hỗn độn

$$S = k\ln W\quad (\text{J/K}),\qquad k = \frac{R}{N_A}$$

W là **số trạng thái vi mô** (số cách sắp xếp) ứng với cùng một trạng thái vĩ mô của hệ. Ví dụ ở trang 28: 1 nguyên tử trong hai bình thông nhau có $2^1 = 2$ cách; 3 nguyên tử có $2^3 = 8$ cách; 1 mol nguyên tử có $2^{N_A}$ cách → khí tự giãn nở sang bình chân không vì trạng thái “phân bố đều” có W lớn hơn rất nhiều.

**S đặc trưng cho độ hỗn độn của hệ — hệ càng hỗn độn, S càng lớn** (trang 29):

- $S_\text{rắn} < S_\text{lỏng} \ll S_\text{khí}$ (tăng vọt khi nóng chảy và đặc biệt khi bay hơi).
- S tăng khi nhiệt độ tăng.
- Phân tử càng phức tạp, S càng lớn.

$$\Delta S = S_2 - S_1$$

### Entropy trong phản ứng hóa học (trang 30–31)

$$\Delta S^\circ_\text{pư} = \sum\nu\,S^\circ(\text{sp}) - \sum\nu\,S^\circ(\text{cđ}) = cS_C + dS_D - aS_A - bS_B$$

Đơn vị J/K (hoặc cal/K). **Khác ΔH°f, entropy chuẩn S° của đơn chất khác 0** (S° là giá trị tuyệt đối).

Dự đoán nhanh:

- Phản ứng **tăng số mol khí** → $\Delta S > 0$: $\mathrm{H_2(g) + I_2(s) \to 2HI(g)}$.
- Phản ứng **giảm số mol khí** → $\Delta S < 0$: $\mathrm{N_2(g) + 3H_2(g) \to 2NH_3(g)}$.

Riêng ΔS cũng **không** đủ quyết định chiều phản ứng — cần kết hợp với ΔH thành [năng lượng tự do Gibbs](/courses/general-chemistry/lessons/gibbs).

::formulas

## Ví dụ

**Ví dụ (trang 31).** $\mathrm{N_2(g) + 3H_2(g) \rightleftharpoons 2NH_3(g)}$ với $S^\circ$: NH₃ 193; N₂ 191,5; H₂ 130,6 J/(mol·K):

$$\Delta S^\circ = 2(193) - [191{,}5 + 3(130{,}6)] = -197\ \text{J/K}$$

**Ví dụ.** $\mathrm{C_6H_{12}O_6(s) + 6O_2(g) \to 6CO_2(g) + 6H_2O(g)}$: số mol khí tăng từ 6 lên 12 → $\Delta S > 0$.

::videos

::guided-exercises

::practice-exercises

## Tổng kết

- ΔH không quyết định chiều phản ứng.
- $S = k\ln W$: đo độ hỗn độn; rắn < lỏng < khí.
- $\Delta S^\circ = \sum\nu S^\circ(\text{sp}) - \sum\nu S^\circ(\text{cđ})$; S° đơn chất ≠ 0.
- Tăng mol khí → ΔS > 0.
