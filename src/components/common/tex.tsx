import { useMemo } from "react";
import katex from "katex";
import { cn } from "@/lib/utils";

/** Hiển thị một biểu thức LaTeX từ nội dung chính thức (KaTeX tự escape, trust = false). */
export function Tex({ math, display, className }: { math: string; display?: boolean; className?: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, { displayMode: display, throwOnError: false, strict: "ignore", trust: false, output: "htmlAndMathml" });
    } catch {
      return null;
    }
  }, [math, display]);
  if (html === null) return <code>{math}</code>;
  return <span className={cn(display && "block overflow-x-auto py-1", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
