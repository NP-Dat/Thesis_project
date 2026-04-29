"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStats, AdminStats } from "@/lib/api/admin";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DepartmentBarChart from "@/components/charts/DepartmentBarChart";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-gray">
        Loading admin dashboard...
      </div>
    );
  }

  const widgets = [
    { label: "Total Employees", value: stats.totalEmployees.toString() },
    { label: "Avg Burn Rate", value: stats.avgBurnRate.toFixed(2) },
    {
      label: "High-Risk Employees",
      value: stats.highRiskCount.toString(),
      highlight: true,
    },
    { label: "Tests This Week", value: stats.testsThisWeek.toString() },
  ];

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="font-serif font-medium text-3xl text-near-black mb-2">
          Admin Dashboard
        </h1>
        <p className="text-olive-gray">
          Factory-wide burnout monitoring and analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {widgets.map((w) => (
          <Card key={w.label}>
            <p className="text-sm text-stone-gray mb-1">{w.label}</p>
            <p
              className={`text-2xl font-serif font-medium ${
                w.highlight ? "text-error" : "text-near-black"
              }`}
            >
              {w.value}
            </p>
          </Card>
        ))}
      </div>

      <Card title="Average Burn Rate by Department" className="mb-8">
        <DepartmentBarChart data={stats.departments} />
      </Card>

      <Link href="/admin/alerts">
        <Button variant="brand">View High-Risk Alerts</Button>
      </Link>
    </div>
  );
}
