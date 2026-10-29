---
id: mo-theory
chapterId: chapter-2
order: 7
title: Thuyết orbital phân tử (MO)
summary: Quan điểm và luận điểm của thuyết MO; tổ hợp AO tạo MO liên kết và phản liên kết; điều kiện tổ hợp; giản đồ MO của H₂ và phân tử hai nguyên tử chu kỳ 2.
estimatedMinutes: 45
difficulty: hard
objectives:
  - Trình bày quan điểm và bốn luận điểm cơ bản của thuyết MO.
  - Phân biệt MO liên kết, MO phản liên kết, MO không liên kết.
  - Nêu điều kiện để các AO tổ hợp được thành MO.
  - Vẽ giản đồ năng lượng MO của H₂ và của phân tử hai nguyên tử chu kỳ 2 (có/không có tương tác 2s–2p).
prerequisites: [vb-theory, electron-configuration]
knowledgeNodeIds: [mo-theory, bonding-mo, antibonding-mo, mo-energy-diagram]
formulaIds: [bond-order-formula]
videoSegmentIds: [mo-theory-video]
guidedExerciseIds: [c2-mo-001]
practiceExerciseIds: []
sources:
  - documentId: doc-ch2-theory
    pages: [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]
---

## Giải thích lý thuyết

### Quan điểm của thuyết MO (Hund, Mulliken — 1932)

- Phân tử là **một khối thống nhất** gồm các hạt nhân và các electron; trong phân tử không còn “cá tính” riêng của từng nguyên tử.
- Electron chuyển động trong trường của **tất cả** các hạt nhân — phân tử như một “nguyên tử nhiều tâm”, nên kế thừa các kết quả của lý thuyết nguyên tử.

### Bốn luận điểm cơ bản

1. Trạng thái mỗi electron trong phân tử được mô tả bởi hàm sóng $\psi$ gọi là **orbital phân tử (MO)**; $\psi^2\,dV$ là xác suất tìm thấy electron trong thể tích $dV$.
2. Mỗi MO được xác định bởi một bộ số lượng tử.
3. Mỗi MO có một năng lượng xác định.
4. Electron điền vào MO tuân theo **nguyên lý Pauli** (mỗi MO ≤ 2 electron ngược spin), **nguyên lý vững bền** (từ thấp đến cao) và **quy tắc Hund**.

### Tổ hợp AO thành MO

- **2 AO tổ hợp → 2 MO**: một MO năng lượng thấp (**MO liên kết**, xen phủ cùng dấu, $S > 0$, mật độ electron tập trung giữa hai hạt nhân) và một MO năng lượng cao (**MO phản liên kết**, kí hiệu *, xen phủ khác dấu, $S < 0$, có mặt nút giữa hai hạt nhân).
- Tổng quát: **n AO → n MO**, gồm m MO liên kết, m MO phản liên kết và $(n - 2m)$ **MO không liên kết** (không có AO tương ứng để tổ hợp).

**Điều kiện tổ hợp** (các AO “tương ứng”):

1. Năng lượng xấp xỉ nhau (ví dụ 1s của H tổ hợp với 2p của F, không với 2s của F).
2. Xen phủ đáng kể — chỉ các AO hóa trị.
3. Cùng kiểu đối xứng đối với trục liên nhân.

Với hai nguyên tử chu kỳ 2 (trục z là trục liên nhân): $2s_A + 2s_B \to \sigma_s, \sigma_s^*$; $2p_{zA} + 2p_{zB} \to \sigma_z, \sigma_z^*$; $2p_x \to \pi_x, \pi_x^*$; $2p_y \to \pi_y, \pi_y^*$.

### Giản đồ MO của H₂

Hai AO 1s → $\sigma_{1s}$ (liên kết) và $\sigma^*_{1s}$ (phản liên kết). H₂ có 2 electron trên $\sigma_{1s}$: cấu hình $(\sigma_{1s})^2$, bậc liên kết $= \tfrac12(2 - 0) = 1$.

### Phân tử hai nguyên tử chu kỳ 2

Có hai thứ tự năng lượng MO:

| Nhóm | Thứ tự MO (từ thấp đến cao) |
|---|---|
| **O₂, F₂, Ne₂** — không tương tác 2s–2p | $\sigma_{2s} < \sigma^*_{2s} < \sigma_{2p} < \pi_{2p} < \pi^*_{2p} < \sigma^*_{2p}$ |
| **Li₂ … N₂** — có tương tác 2s–2p | $\sigma_{2s} < \sigma^*_{2s} < \pi_{2p} < \sigma_{2p} < \pi^*_{2p} < \sigma^*_{2p}$ |

Với B, C, N, hiệu năng lượng 2s–2p nhỏ nên 2s và 2p tương tác, đẩy $\sigma_{2p}$ lên cao hơn $\pi_{2p}$.

::formulas

## Ví dụ

**Ví dụ.** $\mathrm{He_2}$: 4 electron → $(\sigma_{1s})^2(\sigma^*_{1s})^2$; bậc liên kết 0 → không tồn tại. $\mathrm{He_2^+}$: $(\sigma_{1s})^2(\sigma^*_{1s})^1$, bậc 0,5 → tồn tại (đã quan sát được). Quy tắc bát tử không giải thích được điều này.

**Ví dụ.** $\mathrm{N_2}$ (10 electron hóa trị): $(\sigma_{2s})^2(\sigma^*_{2s})^2(\pi_{2p})^4(\sigma_{2p})^2$.

::videos

::guided-exercises

::practice-exercises

## Tổng kết

- MO = tổ hợp tuyến tính AO; n AO → n MO.
- MO liên kết (năng lượng thấp) / phản liên kết (cao, có mặt nút).
- AO tổ hợp được khi năng lượng gần nhau, xen phủ đáng kể, cùng đối xứng.
- Hai thứ tự MO cho chu kỳ 2: O₂–Ne₂ và Li₂–N₂.
