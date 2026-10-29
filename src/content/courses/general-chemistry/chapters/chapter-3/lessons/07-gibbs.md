---
id: gibbs
chapterId: chapter-3
order: 7
title: Năng lượng tự do Gibbs và điều kiện tự diễn biến
summary: G = H − TS; ΔG = ΔH − TΔS; tiêu chí tự diễn biến; ảnh hưởng của nhiệt độ; tính cộng tính của ΔG và ghép cặp phản ứng.
estimatedMinutes: 45
difficulty: medium
objectives:
  - Định nghĩa năng lượng tự do Gibbs và viết ΔG = ΔH − TΔS.
  - Dùng dấu của ΔG để kết luận chiều phản ứng.
  - Tính ΔG° từ ΔH°, ΔS° hoặc từ ΔG°f.
  - Xác định khoảng nhiệt độ phản ứng tự diễn biến.
prerequisites: [entropy]
knowledgeNodeIds: [gibbs-energy, spontaneity]
formulaIds: [gibbs-formula, gibbs-formation, crossover-temperature]
videoSegmentIds: [gibbs-free-energy-video, calculating-dg-dh-ds-video]
guidedExerciseIds: [c3-gibbs-001]
practiceExerciseIds: [c3-gibbs-002, c3-gibbs-003, c3-gibbs-004, c3-gibbs-005, c3-gibbs-006, c3-eq-003]
sources:
  - documentId: doc-ch3-theory
    pages: [32, 33, 34, 40, 41, 46, 47]
---

## Giải thích lý thuyết

### Định nghĩa (J. W. Gibbs, 1839–1903)

$$G = H - TS$$

Ở nhiệt độ và áp suất không đổi:

$$\Delta G = \Delta H - T\Delta S$$

Với phản ứng: $\Delta G_\text{pư} = \sum\nu\,\Delta G_f(\text{sp}) - \sum\nu\,\Delta G_f(\text{cđ})$; đơn vị thường là kJ (kcal).

### Tiêu chí chiều phản ứng (T, P không đổi)

| ΔG | Kết luận |
|---|---|
| ΔG < 0 | Phản ứng **tự diễn biến** theo chiều thuận |
| ΔG = 0 | Phản ứng **đạt cân bằng** |
| ΔG > 0 | Phản ứng không tự xảy ra theo chiều thuận; chiều **nghịch** tự diễn biến |

ΔG kết hợp hai xu hướng: giảm enthalpy (ΔH < 0) và tăng entropy (ΔS > 0).

### Ảnh hưởng của nhiệt độ

| ΔH | ΔS | Tự diễn biến khi |
|---|---|---|
| − | + | mọi nhiệt độ |
| + | − | không bao giờ (ví dụ quang hợp) |
| − | − | nhiệt độ thấp: $T < \Delta H/\Delta S$ |
| + | + | nhiệt độ cao: $T > \Delta H/\Delta S$ |

Nhiệt độ “đổi chiều” $T = \Delta H^\circ/\Delta S^\circ$ (giả thiết ΔH°, ΔS° không phụ thuộc T).

> **Đơn vị:** ΔH thường tính bằng kJ còn ΔS bằng J/K — phải đổi ΔS sang kJ/K (chia 1000) trước khi nhân với T.

### Tính cộng tính của ΔG (trang 34)

Giống ΔH: cộng phương trình → cộng ΔG; nhân n → nhân ΔG với n; đảo chiều → đổi dấu.

**Ghép cặp phản ứng:** phản ứng có ΔG > 0 có thể được “kéo” xảy ra khi ghép với phản ứng có ΔG âm hơn:

$$\mathrm{Cu_2O(s) \to 2Cu(s) + \tfrac12O_2(g)}\quad \Delta G_{375} = +140{,}0\ \text{kJ}$$

$$\mathrm{C(s) + \tfrac12O_2(g) \to CO(g)}\quad \Delta G_{375} = -143{,}8\ \text{kJ}$$

$$\mathrm{Cu_2O(s) + C(s) \to 2Cu(s) + CO(g)}\quad \Delta G_{375} = -3{,}8\ \text{kJ}$$

> ΔG < 0 chỉ cho biết phản ứng **có thể** tự xảy ra về mặt nhiệt động; phản ứng có thể vẫn rất chậm (ví dụ hỗn hợp H₂S và O₂ — Bài 18).

::formulas

## Ví dụ

**Ví dụ (trang 33).** $\mathrm{4KClO_3(s) \to 3KClO_4(s) + KCl(s)}$: $\Delta H^\circ = -144$ kJ; $\Delta S^\circ = -36{,}8$ J/K:

$$\Delta G^\circ = -144 - 298\times\left(\frac{-36{,}8}{1000}\right) = -133\ \text{kJ} < 0$$

Phản ứng tự diễn biến ở 298 K; vì ΔH < 0 và ΔS < 0 nên ở nhiệt độ đủ cao ($T > 3{,}9\times10^3$ K) nó sẽ không còn tự diễn biến.

::videos

::guided-exercises

::practice-exercises

## Tổng kết

- $\Delta G = \Delta H - T\Delta S$; ΔG < 0 tự diễn biến.
- Dấu ΔH, ΔS quyết định vai trò của nhiệt độ.
- ΔG có tính cộng tính; ghép cặp phản ứng.
- Nhiệt động học không cho biết tốc độ phản ứng.
