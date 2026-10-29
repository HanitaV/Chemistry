---
id: ionization-energy
chapterId: chapter-1
order: 7
title: Năng lượng ion hóa
summary: Định nghĩa năng lượng ion hóa; tính năng lượng ion hóa của hệ một electron theo mẫu Bohr; giới hạn khi áp dụng cho nguyên tử nhiều electron.
estimatedMinutes: 30
difficulty: medium
objectives:
  - Phát biểu định nghĩa năng lượng ion hóa thứ nhất, thứ hai.
  - Tính năng lượng ion hóa (J/nguyên tử, kJ/mol) của ion một electron.
  - Xác định Z hoặc nguyên tố từ năng lượng ion hóa.
  - Giải thích vì sao mẫu Bohr không cho IE₁ đúng với nguyên tử nhiều electron.
prerequisites: [electronic-transitions, electron-configuration]
knowledgeNodeIds: [ionization-energy]
formulaIds: [ionization-energy-formula, bohr-energy]
videoSegmentIds: [ionization-energy-video]
guidedExerciseIds: [c1-ion-002]
practiceExerciseIds: [c1-ion-001, c1-ion-003]
sources:
  - documentId: doc-ch1-theory
    pages: [29]
  - documentId: doc-ch1-exercises
    pages: [2, 8]
---

## Giải thích lý thuyết

### Định nghĩa

**Năng lượng ion hóa (IE)** là năng lượng tối thiểu cần để tách một electron ra khỏi nguyên tử (hoặc ion) ở **trạng thái khí**, ở trạng thái cơ bản:

$$\mathrm{X(g) \to X^+(g) + e^-}\qquad \Delta E = IE_1 > 0$$

$$\mathrm{X^+(g) \to X^{2+}(g) + e^-}\qquad \Delta E = IE_2 > IE_1$$

IE luôn dương (phải cung cấp năng lượng) và các năng lượng ion hóa kế tiếp luôn tăng dần, vì electron bị tách khỏi một tiểu phân ngày càng tích điện dương.

### Theo mẫu Bohr

Ion hóa tương ứng với chuyển mức $n = 1 \to n = \infty$:

$$IE = E_\infty - E_1 = 0 - \left(-2{,}18\times10^{-18}Z^2\right) = 2{,}18\times10^{-18}\,Z^2\ \text{J} = 13{,}6\,Z^2\ \text{eV}$$

Với 1 mol: nhân với $N_A = 6{,}022\times10^{23}$. Ví dụ với H:

$$IE = 2{,}18\times10^{-18}\times6{,}022\times10^{23} = 1{,}31\times10^{6}\ \text{J/mol} = 1{,}31\times10^{3}\ \text{kJ/mol}$$

### Giới hạn áp dụng — rất quan trọng

Công thức $IE = 13{,}6\,Z^2$ eV chỉ đúng cho **hệ một electron**. Với nguyên tử nhiều electron:

| Nguyên tử | $13{,}6\,Z^2$ (eV) | Ứng với quá trình | $IE_1$ thực nghiệm (eV) |
|---|---|---|---|
| He | 54,4 | $\mathrm{He^+ \to He^{2+}}$ ($IE_2$) | 24,6 |
| F | 1102 | $\mathrm{F^{8+} \to F^{9+}}$ ($IE_9$) | 17,4 |
| Na | 1646 | $\mathrm{Na^{10+} \to Na^{11+}}$ ($IE_{11}$) | 5,14 |

$IE_1$ thực nghiệm nhỏ hơn rất nhiều vì electron ngoài cùng nằm ở lớp $n > 1$ và bị các electron bên trong **chắn** bớt điện tích hạt nhân. Khi bài tập yêu cầu “tính năng lượng ion hóa theo mẫu Bohr”, hãy hiểu là đang xét ion một electron và ghi rõ giả thiết này trong bài làm.

::formulas

## Ví dụ

**Ví dụ.** Năng lượng ion hóa của Li²⁺ ($Z = 3$):

$$IE = 13{,}6\times3^2 = 122{,}4\ \text{eV} = 1{,}96\times10^{-17}\ \text{J}$$

**Ví dụ (tìm Z).** Một ion một electron có $IE = 8{,}72\times10^{-18}$ J → $Z^2 = 8{,}72\times10^{-18}/2{,}18\times10^{-18} = 4$ → $Z = 2$ (He⁺).

::videos

::guided-exercises

::practice-exercises

## Tổng kết

- IE: năng lượng tách electron ở trạng thái khí; $IE_1 < IE_2 < \dots$
- Hệ một electron: $IE = 2{,}18\times10^{-18}Z^2$ J/nguyên tử.
- Không dùng công thức Bohr để tính $IE_1$ của nguyên tử nhiều electron.
- Chương tiếp theo: electron hóa trị tham gia [liên kết hóa học](/courses/general-chemistry/lessons/bond-concepts).
