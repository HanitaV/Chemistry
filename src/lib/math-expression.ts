/**
 * Bộ phân tích biểu thức toán học nhỏ, an toàn (không dùng eval).
 * Hỗ trợ: số (kể cả dấu phẩy thập phân), biến, + - * / ^, ngoặc, hàm sqrt, ln, log, exp, abs, sin, cos, tan.
 * Dùng để chấm bước "math-expression": so sánh giá trị biểu thức của người học với đáp án tại nhiều điểm ngẫu nhiên.
 */

type Token =
  | { type: "num"; value: number }
  | { type: "id"; value: string }
  | { type: "op"; value: "+" | "-" | "*" | "/" | "^" }
  | { type: "lp" }
  | { type: "rp" };

const FUNCTIONS: Record<string, (x: number) => number> = {
  sqrt: Math.sqrt,
  ln: Math.log,
  log: Math.log10,
  exp: Math.exp,
  abs: Math.abs,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
};

export class ExpressionError extends Error {}

function tokenize(input: string): Token[] {
  const src = input
    .replace(/[×·∙]/g, "*")
    .replace(/[÷:]/g, "/")
    .replace(/[−–]/g, "-")
    .replace(/Δ/g, "")
    .replace(/\s+/g, "");
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/[0-9]/.test(ch) || ((ch === "." || ch === ",") && /[0-9]/.test(src[i + 1] ?? ""))) {
      let j = i;
      while (j < src.length && /[0-9.,]/.test(src[j])) j++;
      if ((src[j] === "e" || src[j] === "E") && /[-+0-9]/.test(src[j + 1] ?? "")) {
        j++;
        if (src[j] === "-" || src[j] === "+") j++;
        while (j < src.length && /[0-9]/.test(src[j])) j++;
      }
      const value = Number(src.slice(i, j).replace(",", "."));
      if (Number.isNaN(value)) throw new ExpressionError(`Số không hợp lệ: ${src.slice(i, j)}`);
      tokens.push({ type: "num", value });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < src.length && /[A-Za-z_0-9]/.test(src[j])) j++;
      tokens.push({ type: "id", value: src.slice(i, j) });
      i = j;
      continue;
    }
    if ("+-*/^".includes(ch)) {
      tokens.push({ type: "op", value: ch as "+" });
      i++;
      continue;
    }
    if (ch === "(" || ch === "[" || ch === "{") {
      tokens.push({ type: "lp" });
      i++;
      continue;
    }
    if (ch === ")" || ch === "]" || ch === "}") {
      tokens.push({ type: "rp" });
      i++;
      continue;
    }
    throw new ExpressionError(`Ký tự không hợp lệ: "${ch}"`);
  }
  return tokens;
}

type Node =
  | { k: "num"; v: number }
  | { k: "var"; name: string }
  | { k: "neg"; a: Node }
  | { k: "bin"; op: string; a: Node; b: Node }
  | { k: "fn"; name: string; a: Node };

class Parser {
  private pos = 0;
  constructor(private tokens: Token[]) {}

  parse(): Node {
    const node = this.expr();
    if (this.pos < this.tokens.length) throw new ExpressionError("Biểu thức chưa kết thúc đúng");
    return node;
  }
  private peek() {
    return this.tokens[this.pos];
  }
  private expr(): Node {
    let left = this.term();
    for (let t = this.peek(); t && t.type === "op" && (t.value === "+" || t.value === "-"); t = this.peek()) {
      this.pos++;
      left = { k: "bin", op: t.value, a: left, b: this.term() };
    }
    return left;
  }
  private term(): Node {
    let left = this.unary();
    for (;;) {
      const t = this.peek();
      if (t && t.type === "op" && (t.value === "*" || t.value === "/")) {
        this.pos++;
        left = { k: "bin", op: t.value, a: left, b: this.unary() };
      } else if (t && (t.type === "num" || t.type === "id" || t.type === "lp")) {
        // phép nhân ngầm: 2H1, 2(…)
        left = { k: "bin", op: "*", a: left, b: this.unary() };
      } else return left;
    }
  }
  private unary(): Node {
    const t = this.peek();
    if (t && t.type === "op" && (t.value === "-" || t.value === "+")) {
      this.pos++;
      const a = this.unary();
      return t.value === "-" ? { k: "neg", a } : a;
    }
    return this.power();
  }
  private power(): Node {
    const base = this.atom();
    const t = this.peek();
    if (t && t.type === "op" && t.value === "^") {
      this.pos++;
      return { k: "bin", op: "^", a: base, b: this.unary() };
    }
    return base;
  }
  private atom(): Node {
    const t = this.peek();
    if (!t) throw new ExpressionError("Thiếu toán hạng");
    if (t.type === "num") {
      this.pos++;
      return { k: "num", v: t.value };
    }
    if (t.type === "id") {
      this.pos++;
      const next = this.peek();
      if (FUNCTIONS[t.value.toLowerCase()] && next?.type === "lp") {
        this.pos++;
        const a = this.expr();
        if (this.peek()?.type !== "rp") throw new ExpressionError("Thiếu dấu đóng ngoặc");
        this.pos++;
        return { k: "fn", name: t.value.toLowerCase(), a };
      }
      return { k: "var", name: t.value };
    }
    if (t.type === "lp") {
      this.pos++;
      const a = this.expr();
      if (this.peek()?.type !== "rp") throw new ExpressionError("Thiếu dấu đóng ngoặc");
      this.pos++;
      return a;
    }
    throw new ExpressionError("Biểu thức không hợp lệ");
  }
}

function evaluate(node: Node, vars: Record<string, number>): number {
  switch (node.k) {
    case "num":
      return node.v;
    case "var": {
      const key = Object.keys(vars).find((k) => k.toLowerCase() === node.name.toLowerCase());
      if (key === undefined) throw new ExpressionError(`Biến không xác định: ${node.name}`);
      return vars[key];
    }
    case "neg":
      return -evaluate(node.a, vars);
    case "fn":
      return FUNCTIONS[node.name](evaluate(node.a, vars));
    case "bin": {
      const a = evaluate(node.a, vars);
      const b = evaluate(node.b, vars);
      switch (node.op) {
        case "+":
          return a + b;
        case "-":
          return a - b;
        case "*":
          return a * b;
        case "/":
          return a / b;
        default:
          return Math.pow(a, b);
      }
    }
  }
}

export function compileExpression(input: string): (vars: Record<string, number>) => number {
  const ast = new Parser(tokenize(input)).parse();
  return (vars) => evaluate(ast, vars);
}

/** Lấy các tên biến xuất hiện trong biểu thức (bỏ qua tên hàm). */
export function expressionVariables(input: string): string[] {
  const names = new Set<string>();
  const tokens = tokenize(input);
  tokens.forEach((t, i) => {
    if (t.type === "id" && !(FUNCTIONS[t.value.toLowerCase()] && tokens[i + 1]?.type === "lp")) names.add(t.value);
  });
  return [...names];
}

/** So sánh hai biểu thức bằng cách thế 12 bộ giá trị ngẫu nhiên (xác định) cho các biến. */
export function expressionsEquivalent(answer: string, expected: string, variables: string[]): boolean {
  const f = compileExpression(answer);
  const g = compileExpression(expected);
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let trial = 0; trial < 12; trial++) {
    const vars: Record<string, number> = {};
    for (const v of variables) vars[v] = 0.5 + rand() * 3 * (rand() > 0.5 ? 1 : -1);
    const a = f(vars);
    const b = g(vars);
    if (!Number.isFinite(b)) continue;
    if (!Number.isFinite(a)) return false;
    if (Math.abs(a - b) > 1e-9 * Math.max(1, Math.abs(b))) return false;
  }
  return true;
}
