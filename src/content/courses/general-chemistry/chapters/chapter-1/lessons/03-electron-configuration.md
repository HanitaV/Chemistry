---
id: electron-configuration
chapterId: chapter-1
order: 3
title: Cấu hình electron
summary: Nguyên lý vững bền, nguyên lý Pauli, quy tắc Hund; cách viết cấu hình electron của nguyên tử và ion.
estimatedMinutes: 40
difficulty: medium
objectives:
  - Phát biểu và áp dụng nguyên lý vững bền, nguyên lý Pauli, quy tắc Hund.
  - Viết cấu hình electron đầy đủ và rút gọn của nguyên tử, ion.
  - Xác định số electron độc thân và electron hóa trị.
prerequisites: [quantum-numbers]
knowledgeNodeIds: [electron-configuration, electron-shells, subshells, aufbau-principle, pauli-principle, hund-rule, valence-electrons]
formulaIds: []
videoSegmentIds: [electron-configuration-video]
guidedExerciseIds: [c1-ec-001]
practiceExerciseIds: [c1-ec-002, c1-ec-003, c1-ec-004]
sources:
  - documentId: doc-ch1-theory
    pages: [14, 15]
---

## Giải thích lý thuyết

**Cấu hình electron** cho biết electron phân bố vào các lớp và phân lớp như thế nào. Ba quy tắc cơ bản:

### 1. Nguyên lý vững bền (Aufbau)

Electron chiếm các orbital có năng lượng **từ thấp đến cao**. Thứ tự (sơ đồ trang 14 của bài giảng):

$$1s \to 2s \to 2p \to 3s \to 3p \to 4s \to 3d \to 4p \to 5s \to 4d \to 5p \to 6s \to 4f \to 5d \to 6p \to 7s \to 5f \to 6d \to 7p$$

Chú ý **4s được điền trước 3d** vì có năng lượng thấp hơn (quy tắc $n + l$ nhỏ hơn điền trước; bằng nhau thì $n$ nhỏ hơn trước).

### 2. Nguyên lý loại trừ Pauli

Trong một nguyên tử không có hai electron có cùng bộ bốn số lượng tử. Hệ quả: **mỗi orbital chứa tối đa 2 electron có spin ngược chiều** (↑↓).

### 3. Quy tắc Hund

Trong cùng một phân lớp, electron phân bố sao cho **tổng số electron độc thân là lớn nhất**: điền mỗi orbital một electron (spin song song) trước, rồi mới ghép đôi.

Bảng ở trang 15 minh họa cho chu kỳ 3:

| Z | Nguyên tố | 3s | 3p | Cấu hình rút gọn |
|---|---|---|---|---|
| 11 | Na | ↑ | — | $[\mathrm{Ne}]\,3s^1$ |
| 13 | Al | ↑↓ | ↑ | $[\mathrm{Ne}]\,3s^23p^1$ |
| 14 | Si | ↑↓ | ↑ ↑ | $[\mathrm{Ne}]\,3s^23p^2$ |
| 15 | P | ↑↓ | ↑ ↑ ↑ | $[\mathrm{Ne}]\,3s^23p^3$ |
| 16 | S | ↑↓ | ↑↓ ↑ ↑ | $[\mathrm{Ne}]\,3s^23p^4$ |
| 18 | Ar | ↑↓ | ↑↓ ↑↓ ↑↓ | $[\mathrm{Ne}]\,3s^23p^6$ |

### Cách viết cấu hình

1. Xác định tổng số electron (Z với nguyên tử; $Z - q$ với ion).
2. Điền theo thứ tự năng lượng, mỗi phân lớp tối đa: s² p⁶ d¹⁰ f¹⁴.
3. Viết lại theo thứ tự lớp (ví dụ $3d^6 4s^2$) hoặc dạng rút gọn với lõi khí hiếm $[\mathrm{He}], [\mathrm{Ne}], [\mathrm{Ar}]$…

**Cấu hình của ion dương:** tách electron ở **lớp ngoài cùng** (n lớn nhất) trước — với kim loại chuyển tiếp là tách 4s trước 3d.

### Electron hóa trị

Electron lớp ngoài cùng (với nguyên tố nhóm A) quyết định tính chất hóa học và khả năng tạo liên kết — đây là cầu nối sang [chương 2](/courses/general-chemistry/lessons/bond-concepts).

::formulas

## Ví dụ

**Ví dụ.** O ($Z = 8$): $1s^2 2s^2 2p^4$. Phân lớp 2p: ↑↓ ↑ ↑ → 2 electron độc thân; 6 electron hóa trị.

**Ví dụ.** Fe ($Z = 26$): $[\mathrm{Ar}]\,3d^6 4s^2$; ion $\mathrm{Fe^{3+}}$: $[\mathrm{Ar}]\,3d^5$.

::videos

::guided-exercises

::practice-exercises

## Tổng kết

- Vững bền: điền từ năng lượng thấp đến cao (4s trước 3d).
- Pauli: mỗi orbital ≤ 2 electron, spin ngược chiều.
- Hund: số electron độc thân cực đại.
- Cation: tách electron lớp ngoài cùng trước.
