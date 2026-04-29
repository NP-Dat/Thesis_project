"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboardData, DashboardData } from "@/lib/api/employee";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import BurnRateLineChart from "@/components/charts/BurnRateLineChart";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    getDashboardData().then(setData);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-gray">
        Loading dashboard...
      </div>
    );
  }

  const summaryCards = [
    {
      label: "Designation",
      value: `Level ${data.designation}`,
      sub: "Seniority level",
    },
    {
      label: "Resource Allocation",
      value: `${data.resourceAllocation}`,
      sub: "Workload score",
    },
    {
      label: "Current Burn Rate",
      value: data.currentBurnRate.toFixed(2),
      sub: burnRateLabel(data.currentBurnRate),
    },
    {
      label: "Last Check-in",
      value: data.lastCheckIn,
      sub: "Most recent test",
    },
  ];

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="font-serif font-medium text-3xl text-near-black mb-2">
          Your Dashboard
        </h1>
        <p className="text-olive-gray">
          Overview of your simulated work profile and burnout trends.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <p className="text-sm text-stone-gray mb-1">{card.label}</p>
            <p className="text-2xl font-serif font-medium text-near-black">
              {card.value}
            </p>
            <p className="text-xs text-stone-gray mt-1">{card.sub}</p>
          </Card>
        ))}
      </div>

      <Card title="Burn Rate History" className="mb-8">
        <BurnRateLineChart data={data.history} />
      </Card>

      <Link href="/assessment">
        <Button variant="brand" className="text-lg px-8 py-3">
          Take Burnout Assessment
        </Button>
      </Link>
    </div>
  );
}

function burnRateLabel(rate: number): string {
  if (rate <= 0.3) return "Low risk";
  if (rate <= 0.6) return "Moderate";
  if (rate <= 0.8) return "High risk";
  return "Critical";
}
