import { memo, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Link } from "react-router";
import { cn, publicUrl } from "@/lib/utils";
import { slugify } from "@/lib/content";

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) return textOf((node as { props: { children?: ReactNode } }).props.children);
  return "";
}

/** Phân biệt trực quan các phần: lý thuyết, ví dụ, tổng kết */
const SECTION_TONE: Record<string, string> = {
  "giai-thich-ly-thuyet": "border-theory",
  "vi-du": "border-example",
  "tong-ket": "border-solution",
};

const components: Components = {
  a({ href = "", children, ...props }) {
    if (href.startsWith("/")) return <Link to={href}>{children}</Link>;
    if (href.startsWith("#")) return <a href={href}>{children}</a>;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },
  img({ src = "", alt = "" }) {
    const url = typeof src === "string" && !/^(https?:|data:|blob:)/.test(src) ? publicUrl(src) : String(src);
    return <img src={url} alt={alt} loading="lazy" />;
  },
  table({ children }) {
    return (
      <div className="table-wrap">
        <table>{children}</table>
      </div>
    );
  },
  h2({ children }) {
    const id = slugify(textOf(children));
    const tone = SECTION_TONE[id];
    return (
      <h2 id={id} className={tone ? `border-l-4 pl-3 ${tone}` : undefined}>
        {children}
      </h2>
    );
  },
  h3({ children }) {
    return <h3 id={slugify(textOf(children))}>{children}</h3>;
  },
};

/**
 * Hiển thị Markdown + LaTeX an toàn: react-markdown không render HTML thô (không dùng rehype-raw),
 * nên nội dung người dùng nhập (ghi chú, tài liệu cá nhân) không thể chèn script.
 */
export const Markdown = memo(function Markdown({ children, className, compact }: { children: string; className?: string; compact?: boolean }) {
  return (
    <div className={cn("lesson-prose", compact && "compact-prose", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: "ignore" }]]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
});
