"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Sidebar, { NavItem } from "@/components/layout/Sidebar";

const employeeNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Take Assessment", href: "/assessment" },
  { label: "Results", href: "/results" },
];

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
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
        navItems={employeeNav}
        userName={user.name}
        userRole={user.role}
        onLogout={handleLogout}
      />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
