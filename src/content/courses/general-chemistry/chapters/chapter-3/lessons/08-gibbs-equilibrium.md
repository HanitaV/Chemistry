---
id: gibbs-equilibrium
chapterId: chapter-3
order: 8
title: Năng lượng tự do Gibbs và hằng số cân bằng
summary: ΔG = ΔG° + RT lnQ; ΔG° = −RT lnK; so sánh Q và K; quan hệ K theo nhiệt độ (van 't Hoff).
estimatedMinutes: 45
difficulty: hard
objectives:
  - Viết và áp dụng ΔG = ΔG° + RT lnQ.
  - Tính K từ ΔG° và ngược lại.
  - Dự đoán chiều phản ứng bằng cách so sánh Q với K.
  - Biến đổi K khi đảo chiều hoặc nhân hệ số phương trình.
prerequisites: [gibbs]
knowledgeNodeIds: [gibbs-equilibrium]
formulaIds: [gibbs-q, gibbs-k, vant-hoff, gibbs-formation]
videoSegmentIds: [gibbs-equilibrium-video]
guidedExerciseIds: [c3-eq-001]
practiceExerciseIds: [c3-eq-002]
sources:
  - documentId: doc-ch3-theory
    pages: [35, 36, 42, 43, 44, 45]
---

## Giải thích lý thuyết

### ΔG ở điều kiện bất kỳ

$$\Delta G = \Delta G^\circ + RT\ln Q$$

Q là **thương số phản ứng** — cùng dạng với biểu thức hằng số cân bằng nhưng dùng áp suất riêng phần (atm) hoặc nồng độ (M) **tại thời điểm đang xét**. Ở điều kiện chuẩn ($P = 1$ atm, $[\,] = 1$ M) thì $Q = 1$ và $\Delta G = \Delta G^\circ$.

### Tại cân bằng

Khi cân bằng: $\Delta G = 0$ và $Q = K$, nên

$$\Delta G^\circ = -RT\ln K\qquad\Longleftrightarrow\qquad K = e^{-\Delta G^\circ/RT}$$

Thay vào: $\Delta G = RT\ln\dfrac{Q}{K}$.

| So sánh | ΔG | Chiều phản ứng |
|---|---|---|
| Q/K < 1 | ΔG < 0 | chiều thuận |
| Q/K = 1 | ΔG = 0 | cân bằng |
| Q/K > 1 | ΔG > 0 | chiều nghịch |

- $\Delta G^\circ < 0$ ⇔ $K > 1$: ở cân bằng sản phẩm chiếm ưu thế.
- Đảo chiều phản ứng: $K' = 1/K$. Nhân hệ số n: $K' = K^n$.

> Khi tính $e^{-\Delta G^\circ/RT}$, đổi ΔG° sang **J/mol** vì $R = 8{,}314$ J/(mol·K).

### Ảnh hưởng của nhiệt độ (trang 36)

Từ $\Delta G^\circ = \Delta H^\circ - T\Delta S^\circ = -RT\ln K$ ⇒ $\Delta S^\circ = \dfrac{\Delta H^\circ}{T} + R\ln K$. Nếu ΔH°, ΔS° không phụ thuộc nhiệt độ, viết cho hai nhiệt độ $T_1$, $T_2$ rồi trừ vế:

$$\Delta H^\circ\left(\frac{1}{T_1} - \frac{1}{T_2}\right) = R\,(\ln K_2 - \ln K_1)$$

Phản ứng thu nhiệt: tăng T → K tăng; phản ứng tỏa nhiệt: tăng T → K giảm.

::formulas

## Ví dụ

**Ví dụ (Bài 7, trang 43–45).** $\mathrm{A_2(g) + B_2(g) \rightleftharpoons 2AB(g)}$, $\Delta G^\circ = -3{,}4$ kJ/mol. Tại cân bằng $P_{A_2} = P_{B_2} = 0{,}20$ atm, $P_{AB} = 0{,}40$ atm:

$$K = \frac{(0{,}40)^2}{(0{,}20)(0{,}20)} = 4{,}0;\qquad T = \frac{3400}{8{,}314\ln 4{,}0} = 295\ \text{K}$$

Ở hỗn hợp có $Q = 36 > K$: $\Delta G = -3400 + 8{,}314\times295\ln36 = +5{,}4\times10^3$ J → phản ứng chạy theo chiều nghịch.

::videos

::guided-exercises

::practice-exercises

## Tổng kết

- $\Delta G = \Delta G^\circ + RT\ln Q = RT\ln(Q/K)$.
- $\Delta G^\circ = -RT\ln K$.
- Q < K: thuận; Q = K: cân bằng; Q > K: nghịch.
- Đây là cầu nối sang chương 4 — Cân bằng hóa học.
