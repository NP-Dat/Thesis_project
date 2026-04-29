"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  label: string;
  href: string;
}

interface SidebarProps {
  navItems: NavItem[];
  userName: string;
  userRole: string;
  onLogout: () => void;
}

export default function Sidebar({
  navItems,
  userName,
  userRole,
  onLogout,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col bg-ivory border-r border-border-cream">
      <div className="p-6 border-b border-border-cream">
        <h1 className="font-serif font-medium text-xl text-near-black leading-tight">
          Burnout Detection
        </h1>
        <p className="text-sm text-stone-gray mt-1">
          {userRole === "admin" ? "Admin Portal" : "Employee Portal"}
        </p>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2.5 rounded-lg text-base transition-colors ${
                active
                  ? "bg-terracotta/10 text-terracotta font-medium"
                  : "text-olive-gray hover:bg-warm-sand/50 hover:text-near-black"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border-cream">
        <div className="mb-3 px-2">
          <p className="text-sm font-medium text-near-black truncate">
            {userName}
          </p>
          <p className="text-xs text-stone-gray capitalize">{userRole}</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full text-left px-4 py-2 rounded-lg text-sm text-olive-gray hover:bg-warm-sand/50 hover:text-near-black transition-colors cursor-pointer"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
