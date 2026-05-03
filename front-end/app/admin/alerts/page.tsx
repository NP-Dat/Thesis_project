"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { useAlerts, useMarkAlertRead, useMarkAllAlertsRead } from "@/lib/hooks/useAlerts";
import { useToast } from "@/components/ui/Toast";
import { Bell, CheckCheck } from "lucide-react";
import type { AlertType } from "@/lib/types";

export default function AlertsPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [isReadFilter, setIsReadFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const filters = {
    page,
    limit: 20,
    ...(isReadFilter !== "" && { isRead: isReadFilter === "true" }),
    ...(typeFilter && { alertType: typeFilter as AlertType }),
  };

  const { data, isLoading } = useAlerts(filters);
  const markRead = useMarkAlertRead();
  const markAllRead = useMarkAllAlertsRead();

  function handleMarkRead(id: number) {
    markRead.mutate(id, {
      onSuccess: () => toast("Alert marked as read", "success"),
    });
  }

  function handleMarkAllRead() {
    markAllRead.mutate(undefined, {
      onSuccess: (data) =>
        toast(`${data.updatedCount} alerts marked as read`, "success"),
    });
  }

  if (isLoading) {
    return (
      <div>
        <TopBar title="Alerts" />
        <div className="p-8 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar
        title="Alerts"
        action={
          <Button variant="secondary" onClick={handleMarkAllRead}>
            <CheckCheck size={16} />
            Mark All Read
          </Button>
        }
      />

      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <Select
            className="w-40"
            value={isReadFilter}
            onChange={(e) => {
              setIsReadFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="false">Unread</option>
            <option value="true">Read</option>
          </Select>
          <Select
            className="w-44"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Types</option>
            <option value="critical_risk">Critical Risk</option>
            <option value="high_risk">High Risk</option>
            <option value="trend_spike">Trend Spike</option>
          </Select>
        </div>

        {!data?.alerts?.length ? (
          <EmptyState
            icon={<Bell size={48} />}
            title="No alerts"
            description="No alerts match the current filters."
          />
        ) : (
          <Card>
            <CardTitle className="mb-4">
              Alerts ({data.pagination.totalItems})
            </CardTitle>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.alerts.map((alert) => (
                  <TableRow
                    key={alert.id}
                    className={alert.isRead ? "opacity-60" : ""}
                  >
                    <TableCell>
                      <Badge
                        level={
                          alert.alertType === "critical_risk"
                            ? "critical"
                            : alert.alertType === "high_risk"
                            ? "high"
                            : "moderate"
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {alert.department}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {alert.message}
                    </TableCell>
                    <TableCell className="text-stone whitespace-nowrap">
                      {new Date(alert.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-medium ${
                          alert.isRead ? "text-stone" : "text-terracotta"
                        }`}
                      >
                        {alert.isRead ? "Read" : "Unread"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {!alert.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkRead(alert.id)}
                        >
                          Mark read
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              page={page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
