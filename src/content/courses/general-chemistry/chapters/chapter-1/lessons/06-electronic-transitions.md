---
id: electronic-transitions
chapterId: chapter-1
order: 6
title: Chuyển mức năng lượng và phổ nguyên tử
summary: Hấp thụ và phát xạ photon khi electron chuyển mức; phổ vạch của hydro; các dãy Lyman, Balmer, Paschen, Brackett; công thức Rydberg.
estimatedMinutes: 45
difficulty: medium
objectives:
  - Phân biệt quá trình hấp thụ và phát xạ dựa vào dấu của ΔE.
  - Tính ΔE, bước sóng và tần số của photon khi electron chuyển mức.
  - Xác định dãy phổ và vùng bức xạ của một vạch phổ.
  - Tìm mức năng lượng hoặc Z từ bước sóng đo được.
prerequisites: [bohr-model]
knowledgeNodeIds: [energy-transitions, emission, absorption, atomic-spectrum]
formulaIds: [transition-energy, rydberg-formula, photon-energy-formula]
videoSegmentIds: [electronic-transitions-video, nature-of-light-video]
guidedExerciseIds: [c1-trans-002]
practiceExerciseIds: [c1-trans-001, c1-trans-003, c1-trans-004, c1-trans-005, c1-trans-006, c1-trans-007]
sources:
  - documentId: doc-ch1-theory
    pages: [23, 24, 26, 27, 29, 30]
  - documentId: doc-ch1-exercises
    pages: [1, 3, 4, 5, 6, 7]
---

## Giải thích lý thuyết

### Hấp thụ và phát xạ

Khi electron chuyển từ mức $n_\text{đầu}$ sang $n_\text{cuối}$:

$$\Delta E = E_\text{cuối} - E_\text{đầu} = -2{,}18\times10^{-18}\,Z^2\left(\frac{1}{n_\text{cuối}^2} - \frac{1}{n_\text{đầu}^2}\right)\ \text{J}$$

| | Hướng chuyển | Dấu ΔE | Photon |
|---|---|---|---|
| **Hấp thụ** | thấp → cao | ΔE > 0 | bị hấp thụ |
| **Phát xạ** | cao → thấp | ΔE < 0 | được phát ra |

Năng lượng, tần số, bước sóng của photon:

$$E_\text{photon} = |\Delta E|,\qquad \nu = \frac{|\Delta E|}{h},\qquad \lambda = \frac{hc}{|\Delta E|}$$

### Phổ vạch của hydro

Khí H₂ trong ống phóng điện phát ra ánh sáng; khi cho qua lăng kính ta thu được **phổ vạch** (không liên tục) — bằng chứng trực tiếp rằng năng lượng nguyên tử bị lượng tử hóa. Trong vùng nhìn thấy có 4 vạch: 410,1; 434,1; 486,1; 656,3 nm (trang 23).

Các vạch được nhóm thành **dãy** theo mức cuối:

| Dãy | Mức cuối $n_1$ | Vùng phổ |
|---|---|---|
| Lyman | 1 | tử ngoại |
| Balmer | 2 | nhìn thấy (và gần UV) |
| Paschen | 3 | hồng ngoại |
| Brackett | 4 | hồng ngoại |

### Công thức Rydberg

$$\frac{1}{\lambda} = R\left(\frac{1}{n_1^2} - \frac{1}{n_2^2}\right),\qquad R = 1{,}096776\times10^7\ \text{m}^{-1},\ n_1 < n_2$$

Với ion giống hydro nhân thêm $Z^2$. Công thức Rydberg (thực nghiệm) và công thức năng lượng Bohr là tương đương: $R \approx \dfrac{2{,}18\times10^{-18}}{hc}$.

**Vạch giới hạn** của một dãy ứng với $n_2 \to \infty$: $\lambda_\text{giới hạn} = n_1^2/R$.

### Các dạng bài toán (trang 29–30)

1. Tính ΔE giữa hai mức.
2. Tính năng lượng ion hóa (chuyển $n = 1 \to \infty$) — xem bài [Năng lượng ion hóa](/courses/general-chemistry/lessons/ionization-energy).
3. Tính bước sóng: $\lambda = hc/\Delta E$.
4. Tìm hằng số Rydberg từ phổ.
5. Tìm Z của ion một electron.
6. Ngược lại: từ λ tìm mức $n$ (giải phương trình cho $1/n^2$, kết quả phải gần một số nguyên).

::formulas

## Ví dụ

**Ví dụ.** Vạch đỏ của dãy Balmer ($3 \to 2$) của H:

$$\frac{1}{\lambda} = 1{,}096776\times10^7\left(\frac14 - \frac19\right) = 1{,}5233\times10^6\ \text{m}^{-1} \Rightarrow \lambda = 656{,}5\ \text{nm}$$

Phù hợp với vạch 656,3 nm đo được.

**Ví dụ.** Photon 486,1 nm thuộc dãy Balmer; giải $\dfrac{1}{n_2^2} = \dfrac14 - \dfrac{1}{R\lambda}$ được $n_2 = 4$.

::videos

::guided-exercises

::practice-exercises

## Tổng kết

- ΔE > 0: hấp thụ; ΔE < 0: phát xạ; $\lambda = hc/|\Delta E|$.
- Dãy Lyman (→1, UV), Balmer (→2, nhìn thấy), Paschen (→3, IR).
- Ion một electron: nhân $Z^2$ → bước sóng giảm $Z^2$ lần.
