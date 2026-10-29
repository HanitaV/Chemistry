import { BookOpen, ChartLine, Dumbbell, LayoutDashboard, Library, Network, PlaySquare, Settings, type LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const NAV_TOP: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/courses", label: "Môn học", icon: BookOpen },
  { to: "/graph", label: "Sơ đồ kiến thức", icon: Network },
];

export const NAV_BOTTOM: NavItem[] = [
  { to: "/practice", label: "Luyện tập", icon: Dumbbell },
  { to: "/videos", label: "Video bài giảng", icon: PlaySquare },
  { to: "/library", label: "Thư viện tài liệu", icon: Library },
  { to: "/progress", label: "Tiến độ học tập", icon: ChartLine },
  { to: "/settings", label: "Cài đặt", icon: Settings },
];
