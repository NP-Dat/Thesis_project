"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Sidebar, { NavItem } from "@/components/layout/Sidebar";

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "High-Risk Alerts", href: "/admin/alerts" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user || user.role !== "admin") {
    router.push("/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        navItems={adminNav}
        userName={user.name}
        userRole={user.role}
        onLogout={handleLogout}
      />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
