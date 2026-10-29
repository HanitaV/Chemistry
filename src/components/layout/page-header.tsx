import type { ReactNode } from "react";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Đường dẫn" className="mb-2 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="size-3" aria-hidden />}
          {c.to ? (
            <Link to={c.to} className="hover:text-foreground hover:underline">
              {c.label}
            </Link>
          ) : (
            <span className="text-foreground/80">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({ title, description, crumbs, actions, className }: { title: ReactNode; description?: ReactNode; crumbs?: Crumb[]; actions?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {crumbs && <Breadcrumbs items={crumbs} />}
        <h1 className="text-2xl font-bold tracking-tight sm:text-[1.7rem]">{title}</h1>
        {description && <p className="mt-1.5 max-w-3xl text-sm text-muted-foreground sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function PageContainer({ children, className, wide }: { children: ReactNode; className?: string; wide?: boolean }) {
  return <div className={cn("mx-auto w-full px-4 py-6 sm:px-6 lg:py-8", wide ? "max-w-[1400px]" : "max-w-6xl", className)}>{children}</div>;
}
