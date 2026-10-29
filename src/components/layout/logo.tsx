import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("size-8 shrink-0", className)} aria-hidden>
      <rect width="64" height="64" rx="14" fill="var(--primary)" />
      <g fill="none" stroke="var(--primary-foreground)" strokeWidth="3.2">
        <ellipse cx="32" cy="32" rx="22" ry="8.5" />
        <ellipse cx="32" cy="32" rx="22" ry="8.5" transform="rotate(60 32 32)" />
        <ellipse cx="32" cy="32" rx="22" ry="8.5" transform="rotate(120 32 32)" />
      </g>
      <circle cx="32" cy="32" r="4.5" fill="var(--primary-foreground)" />
    </svg>
  );
}
