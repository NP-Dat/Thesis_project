"use client";

import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { RiskDistributionChart } from "@/components/charts/RiskDistributionChart";
import { DepartmentHeatmap } from "@/components/charts/DepartmentHeatmap";
import { useAdminDashboard } from "@/lib/hooks/useAdminDashboard";
import { formatBurnRate } from "@/lib/risk";
import { Users, ClipboardList, Activity, AlertTriangle } from "lucide-react";
import type { Alert } from "@/lib/types";

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-[var(--radius-card)] bg-sand flex items-center justify-center text-charcoal-warm">
          {icon}
        </div>
        <div>
          <p className="text-xs text-stone uppercase tracking-wider">{label}</p>
          <p className="text-xl font-serif font-medium text-near-black">
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
}

function AlertRow({ alert }: { alert: Alert }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-cream last:border-0">
      <Badge
        level={
          alert.alertType === "critical_risk"
            ? "critical"
            : alert.alertType === "high_risk"
            ? "high"
            : "moderate"
        }
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-near-black">{alert.message}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-stone">
          <span>{alert.department}</span>
          <span>|</span>
          <span>
            {new Date(alert.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminDashboard();

  if (isLoading) {
    return (
      <div>
        <TopBar title="Command Center" />
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { companyOverview, departments, recentAlerts } = data;
  const highRiskTotal =
    companyOverview.riskDistribution.high +
    companyOverview.riskDistribution.critical;

  return (
    <div>
      <TopBar title="Command Center" />

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Employees"
            value={companyOverview.totalEmployees}
            icon={<Users size={20} />}
          />
          <StatCard
            label="Total Assessments"
            value={companyOverview.totalAssessments}
            icon={<ClipboardList size={20} />}
          />
          <StatCard
            label="Avg. Burn Rate"
            value={formatBurnRate(companyOverview.avgBurnRate)}
            icon={<Activity size={20} />}
          />
          <StatCard
            label="High Risk"
            value={highRiskTotal}
            icon={<AlertTriangle size={20} />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card whisper className="lg:col-span-1">
            <CardTitle className="mb-4">Risk Distribution</CardTitle>
            <CardContent>
              <RiskDistributionChart data={companyOverview.riskDistribution} />
            </CardContent>
          </Card>

          <Card whisper className="lg:col-span-2">
            <CardTitle className="mb-4">Department Heatmap</CardTitle>
            <CardContent>
              <DepartmentHeatmap departments={departments} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Recent Alerts</CardTitle>
            <Link
              href="/admin/alerts"
              className="text-sm text-terracotta font-medium hover:underline"
            >
              View all
            </Link>
          </div>
          <CardContent>
            {recentAlerts.length === 0 ? (
              <p className="text-sm text-olive py-4 text-center">
                No recent alerts.
              </p>
            ) : (
              recentAlerts.slice(0, 5).map((alert) => (
                <AlertRow key={alert.id} alert={alert} />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
