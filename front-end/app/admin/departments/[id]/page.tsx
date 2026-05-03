"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
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
import { useDepartment } from "@/lib/hooks/useDepartment";
import { formatBurnRate } from "@/lib/risk";
import { ArrowLeft } from "lucide-react";

export default function DepartmentDetailPage() {
  const params = useParams();
  const deptId = Number(params.id);
  const [page, setPage] = useState(1);
  const { data, isLoading } = useDepartment(deptId, page);

  if (isLoading) {
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

  if (!data) return null;

  return (
    <div>
      <TopBar
        title={data.department.name}
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
        <p className="text-sm text-olive mb-6">{data.department.location}</p>

        <Card>
          <CardTitle className="mb-4">Employees</CardTitle>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Burn Rate</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Last Assessment</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.employees.map((emp) => (
                <TableRow key={emp.anonymousId}>
                  <TableCell className="font-medium">
                    {emp.anonymousId}
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
          {data.pagination && (
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
