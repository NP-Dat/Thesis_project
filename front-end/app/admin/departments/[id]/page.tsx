"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { DesignationBurnRateChart } from "@/components/charts/DesignationBurnRateChart";
import { ShiftBurnRateChart } from "@/components/charts/ShiftBurnRateChart";
import { EmployeeBurnRateScatter } from "@/components/charts/EmployeeBurnRateScatter";
import { MonthlyBurnRateChart } from "@/components/charts/MonthlyBurnRateChart";
import { RiskDistributionChart } from "@/components/charts/RiskDistributionChart";
import { KpiLineChart } from "@/components/charts/KpiLineChart";
import { KpiBurnRateComparisonChart } from "@/components/charts/KpiBurnRateComparisonChart";
import { useDepartment, useDepartmentAnalytics } from "@/lib/hooks/useDepartment";
import type { DepartmentQueryOpts } from "@/lib/hooks/useDepartment";
import { formatBurnRate } from "@/lib/risk";
import {
  ArrowLeft,
  Activity,
  AlertTriangle,
  Users,
  TrendingUp,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import type { DepartmentAnalytics } from "@/lib/types";

type Tab = "employees" | "analytics";

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
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
          {sub && <p className="text-xs text-olive mt-0.5">{sub}</p>}
        </div>
      </div>
    </Card>
  );
}

type SortField = "burnRate" | "designation" | "shift" | "lastAssessment" | "assessmentCount" | "riskLevel";

function SortIcon({ field, activeField, order }: { field: SortField; activeField: SortField; order: "asc" | "desc" }) {
  if (field !== activeField) return <ArrowUpDown size={13} className="ml-1 inline text-stone/50" />;
  return order === "asc"
    ? <ChevronUp size={13} className="ml-1 inline text-terracotta" />
    : <ChevronDown size={13} className="ml-1 inline text-terracotta" />;
}

function EmployeesTab({ deptId }: { deptId: number }) {
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("burnRate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterRisk, setFilterRisk] = useState("");
  const [filterShift, setFilterShift] = useState("");
  const [filterDesig, setFilterDesig] = useState("");

  const queryOpts = useMemo<DepartmentQueryOpts>(
    () => ({
      sort: sortField,
      order: sortOrder,
      riskLevel: filterRisk || undefined,
      shiftType: filterShift || undefined,
      designation: filterDesig || undefined,
    }),
    [sortField, sortOrder, filterRisk, filterShift, filterDesig]
  );

  const { data, isLoading } = useDepartment(deptId, page, queryOpts);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder((o) => (o === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setPage(1);
  }

  function clearFilters() {
    setFilterRisk("");
    setFilterShift("");
    setFilterDesig("");
    setPage(1);
  }

  const hasFilters = !!(filterRisk || filterShift || filterDesig);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <CardTitle>Employees</CardTitle>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={filterRisk}
          onChange={(e) => { setFilterRisk(e.target.value); setPage(1); }}
          className="rounded-[var(--radius-input)] border border-cream bg-white px-3 py-1.5 text-sm text-near-black focus:outline-none focus:ring-2 focus:ring-focus"
        >
          <option value="">All Risk Levels</option>
          <option value="low">Low</option>
          <option value="moderate">Moderate</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select
          value={filterShift}
          onChange={(e) => { setFilterShift(e.target.value); setPage(1); }}
          className="rounded-[var(--radius-input)] border border-cream bg-white px-3 py-1.5 text-sm text-near-black focus:outline-none focus:ring-2 focus:ring-focus"
        >
          <option value="">All Shifts</option>
          <option value="Day">Day</option>
          <option value="Night">Night</option>
          <option value="Rotating">Rotating</option>
        </select>
        <select
          value={filterDesig}
          onChange={(e) => { setFilterDesig(e.target.value); setPage(1); }}
          className="rounded-[var(--radius-input)] border border-cream bg-white px-3 py-1.5 text-sm text-near-black focus:outline-none focus:ring-2 focus:ring-focus"
        >
          <option value="">All Designations</option>
          {[0, 1, 2, 3, 4, 5].map((d) => (
            <option key={d} value={String(d)}>Level {d}</option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-terracotta hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>
              <button onClick={() => toggleSort("designation")} className="cursor-pointer inline-flex items-center hover:text-near-black">
                Designation <SortIcon field="designation" activeField={sortField} order={sortOrder} />
              </button>
            </TableHead>
            <TableHead>
              <button onClick={() => toggleSort("shift")} className="cursor-pointer inline-flex items-center hover:text-near-black">
                Shift <SortIcon field="shift" activeField={sortField} order={sortOrder} />
              </button>
            </TableHead>
            <TableHead>
              <button onClick={() => toggleSort("burnRate")} className="cursor-pointer inline-flex items-center hover:text-near-black">
                Burn Rate <SortIcon field="burnRate" activeField={sortField} order={sortOrder} />
              </button>
            </TableHead>
            <TableHead>
              <button onClick={() => toggleSort("riskLevel")} className="cursor-pointer inline-flex items-center hover:text-near-black">
                Risk <SortIcon field="riskLevel" activeField={sortField} order={sortOrder} />
              </button>
            </TableHead>
            <TableHead>
              <button onClick={() => toggleSort("lastAssessment")} className="cursor-pointer inline-flex items-center hover:text-near-black">
                Last Assessment <SortIcon field="lastAssessment" activeField={sortField} order={sortOrder} />
              </button>
            </TableHead>
            <TableHead>
              <button onClick={() => toggleSort("assessmentCount")} className="cursor-pointer inline-flex items-center hover:text-near-black">
                Total <SortIcon field="assessmentCount" activeField={sortField} order={sortOrder} />
              </button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.employees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-olive py-8">
                No employees match the current filters.
              </TableCell>
            </TableRow>
          ) : (
            data.employees.map((emp) => (
              <TableRow key={emp.anonymousId}>
                <TableCell className="font-medium">
                  <Link
                    href={`/admin/employees/${emp.userId}`}
                    className="text-terracotta hover:underline"
                  >
                    {emp.anonymousId}
                  </Link>
                </TableCell>
                <TableCell>Level {emp.designation}</TableCell>
                <TableCell>{emp.shiftType}</TableCell>
                <TableCell className="font-mono text-sm">
                  {formatBurnRate(emp.latestBurnRate)}
                </TableCell>
                <TableCell>
                  <Badge level={emp.riskLevel} />
                </TableCell>
                <TableCell className="text-stone">
                  {new Date(emp.lastAssessmentDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>{emp.assessmentCount}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {data.pagination && (
        <Pagination
          page={page}
          totalPages={data.pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </Card>
  );
}

function AnalyticsTab({ analytics }: { analytics: DepartmentAnalytics }) {
  const { summary, employeeBurnRates, byDesignation, byShift, riskDistribution, burnRateOverTime, avgKpiOverTime, kpiBurnRateOverTime } = analytics;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Avg Burn Rate"
          value={formatBurnRate(summary.avgBurnRate)}
          icon={<Activity size={20} />}
        />
        <StatCard
          label="Median Burn Rate"
          value={formatBurnRate(summary.medianBurnRate)}
          icon={<TrendingUp size={20} />}
        />
        <StatCard
          label="High / Critical Risk"
          value={summary.highRiskCount}
          sub={`${summary.highRiskPercent}% of ${summary.totalEmployees} employees`}
          icon={<AlertTriangle size={20} />}
        />
        <StatCard
          label="Highest Risk Designation"
          value={
            summary.highestDesignation
              ? `Level ${summary.highestDesignation.designation}`
              : "N/A"
          }
          sub={
            summary.highestDesignation
              ? `Avg: ${formatBurnRate(summary.highestDesignation.avgBurnRate)}`
              : undefined
          }
          icon={<Users size={20} />}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card whisper>
          <CardTitle className="mb-4">All Employee Burn Rates</CardTitle>
          <CardContent>
            <EmployeeBurnRateScatter data={employeeBurnRates} />
          </CardContent>
        </Card>
        <Card whisper>
          <CardTitle className="mb-4">Monthly Burn Rate Trend</CardTitle>
          <CardContent>
            <MonthlyBurnRateChart data={burnRateOverTime} />
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card whisper>
          <CardTitle className="mb-4">By Designation</CardTitle>
          <CardContent>
            <DesignationBurnRateChart data={byDesignation} />
          </CardContent>
        </Card>
        <Card whisper>
          <CardTitle className="mb-4">By Shift Type</CardTitle>
          <CardContent>
            <ShiftBurnRateChart data={byShift} />
          </CardContent>
        </Card>
        <Card whisper>
          <CardTitle className="mb-4">Risk Distribution</CardTitle>
          <CardContent>
            <RiskDistributionChart data={riskDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* KPI Charts */}
      {avgKpiOverTime.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card whisper>
            <CardTitle className="mb-4">Average KPI Over Time</CardTitle>
            <CardContent>
              <KpiLineChart data={avgKpiOverTime} />
            </CardContent>
          </Card>
          <Card whisper>
            <CardTitle className="mb-4">KPI vs Burn Rate</CardTitle>
            <CardContent>
              <KpiBurnRateComparisonChart data={kpiBurnRateOverTime} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function DepartmentDetailPage() {
  const params = useParams();
  const deptId = Number(params.id);
  const [activeTab, setActiveTab] = useState<Tab>("employees");

  const { data: deptData, isLoading: deptLoading } = useDepartment(deptId, 1);
  const { data: analyticsData, isLoading: analyticsLoading } =
    useDepartmentAnalytics(deptId);

  const isLoading = activeTab === "employees" ? deptLoading : analyticsLoading;

  if (deptLoading && !deptData) {
    return (
      <div>
        <TopBar title="Department" />
        <div className="p-8 space-y-4">
          <Skeleton className="h-8 w-48" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      </div>
    );
  }

  const departmentName = deptData?.department.name ?? analyticsData?.department.name ?? "Department";
  const departmentLocation = deptData?.department.location ?? analyticsData?.department.location;

  return (
    <div>
      <TopBar
        title={departmentName}
        action={
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-sm text-olive hover:text-near-black transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        }
      />

      <div className="p-8">
        {departmentLocation && (
          <p className="text-sm text-olive mb-4">{departmentLocation}</p>
        )}

        {/* Tab navigation */}
        <div className="flex gap-1 mb-6 border-b border-cream">
          <button
            onClick={() => setActiveTab("employees")}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === "employees"
                ? "text-near-black"
                : "text-stone hover:text-near-black"
            }`}
          >
            Employees
            {activeTab === "employees" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-terracotta rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === "analytics"
                ? "text-near-black"
                : "text-stone hover:text-near-black"
            }`}
          >
            Analytics
            {activeTab === "analytics" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-terracotta rounded-full" />
            )}
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "employees" && <EmployeesTab deptId={deptId} />}

        {activeTab === "analytics" && (
          isLoading || !analyticsData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
              <Skeleton className="h-72" />
              <Skeleton className="h-72" />
            </div>
          ) : (
            <AnalyticsTab analytics={analyticsData} />
          )
        )}
      </div>
    </div>
  );
}
