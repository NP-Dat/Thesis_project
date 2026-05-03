"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  History,
  AlertTriangle,
  BookOpen,
  LogOut,
  Activity,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const employeeLinks: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/assessment", label: "Take Assessment", icon: <ClipboardList size={18} /> },
  { href: "/results", label: "Results", icon: <Activity size={18} /> },
  { href: "/history", label: "History", icon: <History size={18} /> },
];

const adminLinks: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/admin/alerts", label: "Alerts", icon: <AlertTriangle size={18} /> },
  { href: "/admin/resources", label: "Resources", icon: <BookOpen size={18} /> },
];

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const links = role === "admin" ? adminLinks : employeeLinks;

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-ivory border-r border-cream">
      <div className="px-5 py-6 border-b border-cream">
        <h1 className="font-serif text-lg font-medium text-near-black leading-tight">
          Burnout Detection
        </h1>
        <p className="text-xs text-stone mt-1 capitalize">{role} Portal</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-card)] text-sm transition-colors",
                active
                  ? "bg-sand text-near-black font-medium"
                  : "text-olive hover:bg-sand/50 hover:text-near-black"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-cream">
        <div className="flex items-center gap-3 px-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-sand flex items-center justify-center text-xs font-medium text-charcoal-warm">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-near-black truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-stone truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-[var(--radius-card)] text-sm text-olive hover:bg-sand/50 hover:text-near-black transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
