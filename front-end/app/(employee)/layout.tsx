"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { RouteGuard } from "@/components/auth/RouteGuard";
import type { ReactNode } from "react";

export default function EmployeeLayout({ children }: { children: ReactNode }) {
  return (
    <RouteGuard requiredRole="employee">
      <div className="flex min-h-screen">
        <Sidebar role="employee" />
        <main className="flex-1 bg-parchment">{children}</main>
      </div>
    </RouteGuard>
  );
}
