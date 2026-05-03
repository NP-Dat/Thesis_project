"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Card, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { BurnRateGauge } from "@/components/charts/BurnRateGauge";
import { useEmployeeDashboard } from "@/lib/hooks/useEmployeeDashboard";
import { useResources } from "@/lib/hooks/useResources";
import { formatBurnRate } from "@/lib/risk";
import { ClipboardList, History, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function ResultsPage() {
  const { data, isLoading } = useEmployeeDashboard();
  const riskLevel = data?.latestAssessment?.riskLevel ?? "low";
  const { data: resourcesData } = useResources(riskLevel, !!data?.latestAssessment);

  if (isLoading) {
    return (
      <div>
        <TopBar title="Results" />
        <div className="p-8 space-y-6">
          <Skeleton className="h-64" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </div>
    );
  }

  const assessment = data?.latestAssessment;

  if (!assessment) {
    return (
      <div>
        <TopBar title="Results" />
        <div className="p-8">
          <Card className="text-center py-12">
            <p className="text-olive mb-4">No assessment results yet.</p>
            <Link href="/assessment">
              <Button>Take Assessment</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar title="Results" />

      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <Card whisper className="flex flex-col items-center py-8">
          <div className="mb-4">
            <Badge level={assessment.riskLevel} className="text-sm px-4 py-1.5" />
          </div>
          <BurnRateGauge value={assessment.predictedBurnRate} size={300} />
          <p className="text-sm text-olive mt-4">
            Assessment taken on{" "}
            {new Date(assessment.takenAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </Card>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <p className="text-xs text-stone uppercase tracking-wider mb-1">
              Personal Burnout
            </p>
            <p className="text-2xl font-serif font-medium text-near-black">
              {assessment.personalBurnoutScore.toFixed(1)}
            </p>
            <p className="text-xs text-olive mt-1">out of 100</p>
          </Card>
          <Card>
            <p className="text-xs text-stone uppercase tracking-wider mb-1">
              Work-Related Burnout
            </p>
            <p className="text-2xl font-serif font-medium text-near-black">
              {assessment.workBurnoutScore.toFixed(1)}
            </p>
            <p className="text-xs text-olive mt-1">out of 100</p>
          </Card>
          <Card>
            <p className="text-xs text-stone uppercase tracking-wider mb-1">
              Mental Fatigue Score
            </p>
            <p className="text-2xl font-serif font-medium text-near-black">
              {formatBurnRate(assessment.mentalFatigueScore)}
            </p>
            <p className="text-xs text-olive mt-1">out of 10.0</p>
          </Card>
        </div>

        {resourcesData?.resources && resourcesData.resources.length > 0 && (
          <Card>
            <CardTitle className="mb-4">Support Resources</CardTitle>
            <CardContent>
              <div className="space-y-3">
                {resourcesData.resources.map((res) => (
                  <a
                    key={res.id}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 rounded-[var(--radius-card)] border border-cream bg-parchment p-4 hover:shadow-[0_0_0_1px_var(--color-ring-warm)] transition-all"
                  >
                    <ExternalLink
                      size={16}
                      className="text-terracotta mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium text-near-black">
                        {res.title}
                      </p>
                      <p className="text-xs text-olive mt-1">
                        {res.description}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3 justify-center">
          <Link href="/assessment">
            <Button variant="secondary">
              <ClipboardList size={16} />
              Retake Assessment
            </Button>
          </Link>
          <Link href="/history">
            <Button variant="ghost">
              <History size={16} />
              View History
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
