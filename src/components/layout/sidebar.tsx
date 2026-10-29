import { NavLink, useLocation } from "react-router";
import { ChevronsLeft, ChevronsRight, ListTree } from "lucide-react";
import { useProgressMaps } from "@/hooks/use-progress";
import { chapterPath, chaptersOfCourse, content, getLesson } from "@/lib/content";
import { cn, pct } from "@/lib/utils";
import { useUi } from "@/stores/ui-store";
import { LogoMark } from "./logo";
import { NAV_BOTTOM, NAV_TOP, type NavItem } from "./nav-items";

function NavRow({ item, collapsed, onNavigate }: { item: NavItem; collapsed: boolean; onNavigate?: () => void }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent",
          isActive && "bg-sidebar-accent text-accent-foreground",
          collapsed && "justify-center px-0",
        )
      }
    >
      <item.icon className="size-[18px] shrink-0" aria-hidden />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {collapsed && <span className="sr-only">{item.label}</span>}
    </NavLink>
  );
}

export function SidebarContent({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const { lessonCompleted } = useProgressMaps();
  const location = useLocation();
  const lessonChapter = getLesson(/\/lessons\/([^/?#]+)/.exec(location.pathname)?.[1])?.chapterId;
  return (
    <nav aria-label="Điều hướng chính" className="flex flex-col gap-1 p-3">
      {NAV_TOP.map((item) => (
        <NavRow key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
      ))}

      {!collapsed ? (
        <div className="my-2">
          {content.courses.map((course) => (
            <div key={course.id}>
              <p className="flex items-center gap-2 px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <ListTree className="size-3.5" aria-hidden /> {course.shortTitle ?? course.title}
              </p>
              <ul className="flex flex-col gap-0.5">
                {chaptersOfCourse(course.id).map((ch) => {
                  const done = ch.lessonIds.filter((id) => lessonCompleted.has(id)).length;
                  const active = location.pathname.startsWith(chapterPath(ch)) || lessonChapter === ch.id;
                  return (
                    <li key={ch.id}>
                      <NavLink
                        to={chapterPath(ch)}
                        onClick={onNavigate}
                        className={cn(
                          "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent",
                          active && "bg-sidebar-accent text-accent-foreground",
                        )}
                      >
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/12 text-xs font-semibold text-primary">{ch.order}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{ch.title}</span>
                          <span className="mt-1 block h-1 overflow-hidden rounded-full bg-muted">
                            <span className="block h-full rounded-full bg-primary" style={{ width: `${pct(done, ch.lessonIds.length)}%` }} />
                          </span>
                        </span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="my-2 flex flex-col gap-1">
          {content.chapters.map((ch) => (
            <NavLink
              key={ch.id}
              to={chapterPath(ch)}
              title={`Chương ${ch.order}: ${ch.title}`}
              className={({ isActive }) => cn("mx-auto flex size-9 items-center justify-center rounded-lg text-xs font-semibold text-primary hover:bg-sidebar-accent", isActive && "bg-sidebar-accent")}
            >
              C{ch.order}
            </NavLink>
          ))}
        </div>
      )}

      {NAV_BOTTOM.map((item) => (
        <NavRow key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}

export function DesktopSidebar() {
  const collapsed = useUi((s) => s.sidebarCollapsed);
  const set = useUi((s) => s.set);
  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex transition-[width] duration-200",
        collapsed ? "w-[4.25rem]" : "w-64",
      )}
    >
      <div className={cn("flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4", collapsed && "justify-center px-0")}>
        <LogoMark className="size-7" />
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-bold">Chemistry Hub</p>
            <p className="truncate text-[11px] text-muted-foreground">Học tập tương tác</p>
          </div>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        <SidebarContent collapsed={collapsed} />
      </div>
      <button
        type="button"
        onClick={() => set({ sidebarCollapsed: !collapsed })}
        className="flex h-11 items-center justify-center gap-2 border-t border-sidebar-border text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground cursor-pointer"
        aria-label={collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
      >
        {collapsed ? <ChevronsRight className="size-4" /> : (<><ChevronsLeft className="size-4" /> Thu gọn</>)}
      </button>
    </aside>
  );
}
