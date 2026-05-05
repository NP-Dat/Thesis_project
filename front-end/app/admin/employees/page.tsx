"use client";

import { useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardTitle } from "@/components/ui/Card";
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
import { useEmployeeList } from "@/lib/hooks/useEmployees";
import { formatBurnRate } from "@/lib/risk";
import { ChevronDown, ChevronUp, Users } from "lucide-react";
import type { EmployeeSortField } from "@/lib/types";

type SortOrder = "asc" | "desc";

const SORT_OPTIONS: { field: EmployeeSortField; label: string }[] = [
  { field: "burnRate", label: "Burn Rate" },
  { field: "riskLevel", label: "Risk Level" },
  { field: "lastAssessment", label: "Last Assessment" },
  { field: "assessmentCount", label: "Total Assessments" },
  { field: "department", label: "Department" },
];

export default function EmployeesPage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<EmployeeSortField>("burnRate");
  const [order, setOrder] = useState<SortOrder>("desc");
  const { data, isLoading } = useEmployeeList(page, sort, order);

  function handleSort(field: EmployeeSortField) {
    if (sort === field) {
      setOrder(order === "desc" ? "asc" : "desc");
    } else {
      setSort(field);
      setOrder("desc");
    }
    setPage(1);
  }

  function SortIcon({ field }: { field: EmployeeSortField }) {
    if (sort !== field) return null;
    return order === "desc" ? (
      <ChevronDown size={14} className="inline ml-1" />
    ) : (
      <ChevronUp size={14} className="inline ml-1" />
    );
  }

  if (isLoading) {
    return (
      <div>
        <TopBar title="All Employees" />
        <div className="p-8 space-y-4">
          <Skeleton className="h-10 w-64" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <TopBar
        title="All Employees"
        action={
          <div className="flex items-center gap-2 text-sm text-olive">
            <Users size={16} />
            <span>{data.pagination.totalItems} employees</span>
          </div>
        }
      />

      <div className="p-8">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="text-sm text-olive font-medium">Sort by:</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.field}
              onClick={() => handleSort(opt.field)}
              className={`px-3 py-1.5 text-sm rounded-[var(--radius-card)] transition-colors cursor-pointer ${
                sort === opt.field
                  ? "bg-terracotta text-white font-medium"
                  : "bg-sand text-olive hover:bg-sand/80"
              }`}
            >
              {opt.label}
              <SortIcon field={opt.field} />
            </button>
          ))}
        </div>

        <Card>
          <CardTitle className="mb-4">Employee Risk Overview</CardTitle>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("burnRate")}
                >
                  Burn Rate
                  <SortIcon field="burnRate" />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("riskLevel")}
                >
                  Risk
                  <SortIcon field="riskLevel" />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("lastAssessment")}
                >
                  Last Assessment
                  <SortIcon field="lastAssessment" />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("assessmentCount")}
                >
                  Total
                  <SortIcon field="assessmentCount" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.employees.map((emp) => (
                <TableRow key={emp.userId} className="hover:bg-sand/30">
                  <TableCell>
                    <Link
                      href={`/admin/employees/${emp.userId}`}
                      className="font-medium text-terracotta hover:underline"
                    >
                      {emp.anonymousId}
                    </Link>
                  </TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell>Level {emp.designation}</TableCell>
                  <TableCell>{emp.shiftType}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {formatBurnRate(emp.latestBurnRate)}
                  </TableCell>
                  <TableCell>
                    <Badge level={emp.riskLevel} />
                  </TableCell>
                  <TableCell className="text-stone">
                    {new Date(emp.lastAssessmentDate).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )}
                  </TableCell>
                  <TableCell>{emp.assessmentCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {data.pagination.totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
