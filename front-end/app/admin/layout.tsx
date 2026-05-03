"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { RouteGuard } from "@/components/auth/RouteGuard";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RouteGuard requiredRole="admin">
      <div className="flex min-h-screen">
        <Sidebar role="admin" />
        <main className="flex-1 bg-parchment">{children}</main>
      </div>
    </RouteGuard>
  );
}
