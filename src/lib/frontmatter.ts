import { parse } from "yaml";

/** Tách YAML frontmatter (--- ... ---) khỏi thân Markdown. Dùng chung cho app và script kiểm tra. */
export function parseFrontmatter(raw: string): { data: unknown; body: string } {
  const text = raw.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!match) return { data: {}, body: text };
  return { data: parse(match[1]) ?? {}, body: text.slice(match[0].length) };
}
