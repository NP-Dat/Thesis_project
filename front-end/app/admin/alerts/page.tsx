"use client";

import { useEffect, useState } from "react";
import { getAlerts, AlertEmployee } from "@/lib/api/admin";
import Card from "@/components/ui/Card";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertEmployee[]>([]);
  const [filter, setFilter] = useState("");
  const [sortField, setSortField] = useState<keyof AlertEmployee>("burnRate");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    getAlerts().then(setAlerts);
  }, []);

  const handleSort = (field: keyof AlertEmployee) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filtered = alerts
    .filter(
      (a) =>
        a.id.toLowerCase().includes(filter.toLowerCase()) ||
        a.department.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
      return sortAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

  const sortIndicator = (field: keyof AlertEmployee) =>
    sortField === field ? (sortAsc ? " \u2191" : " \u2193") : "";

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="font-serif font-medium text-3xl text-near-black mb-2">
          High-Risk Alerts
        </h1>
        <p className="text-olive-gray">
          Employees with a Burn Rate above 0.80 requiring attention.
        </p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter by ID or department..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full max-w-sm px-3 py-2 rounded-xl border border-border-warm bg-white text-near-black placeholder:text-stone-gray focus:outline-none focus:border-focus-blue focus:ring-2 focus:ring-focus-blue/25 transition-colors"
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-warm">
                {(
                  [
                    ["id", "Employee ID"],
                    ["department", "Department"],
                    ["designation", "Designation"],
                    ["burnRate", "Burn Rate"],
                    ["lastTestDate", "Last Test"],
                  ] as [keyof AlertEmployee, string][]
                ).map(([field, label]) => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    className="px-4 py-3 text-sm font-medium text-stone-gray cursor-pointer hover:text-near-black select-none"
                  >
                    {label}
                    {sortIndicator(field)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr
                  key={emp.id}
                  className={`border-b border-border-cream transition-colors hover:bg-warm-sand/30 ${
                    emp.burnRate >= 0.9 ? "bg-error/5" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-near-black">
                    {emp.id}
                  </td>
                  <td className="px-4 py-3 text-olive-gray">
                    {emp.department}
                  </td>
                  <td className="px-4 py-3 text-olive-gray">
                    Level {emp.designation}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-sm font-medium ${
                        emp.burnRate >= 0.9
                          ? "bg-error/15 text-error"
                          : "bg-coral/15 text-coral"
                      }`}
                    >
                      {emp.burnRate.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-olive-gray">
                    {emp.lastTestDate}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-stone-gray"
                  >
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
