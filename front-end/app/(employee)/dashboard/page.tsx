"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Card, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { BurnRateGauge } from "@/components/charts/BurnRateGauge";
import { BurnRateLineChart } from "@/components/charts/BurnRateLineChart";
import { SectionScoreChart } from "@/components/charts/SectionScoreChart";
import { useEmployeeDashboard } from "@/lib/hooks/useEmployeeDashboard";
import { useResources } from "@/lib/hooks/useResources";
import { useAuth } from "@/lib/auth-context";
import { ClipboardList, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function EmployeeDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useEmployeeDashboard();
  const riskLevel = data?.latestAssessment?.riskLevel;
  const showHelp = riskLevel === "high" || riskLevel === "critical";
  const { data: resourcesData } = useResources(riskLevel ?? "", showHelp);

  if (isLoading) {
    return (
      <div>
        <TopBar title="Dashboard" />
        <div className="p-8 space-y-6">
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { profile, latestAssessment, trendData, totalAssessments } = data;

  return (
    <div>
      <TopBar
        title="Dashboard"
        action={
          <Link href="/assessment">
            <Button size="md">
              <ClipboardList size={16} />
              Take Assessment
            </Button>
          </Link>
        }
      />

      <div className="p-8 space-y-6">
        <Card>
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta font-serif font-medium text-lg">
              {profile.firstName?.[0]}
              {profile.lastName?.[0]}
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-xl font-medium text-near-black">
                Welcome back, {user?.firstName}
              </h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-olive">
                <span>{profile.department}</span>
                <span className="text-stone">|</span>
                <span>Designation Level {profile.designation}</span>
                <span className="text-stone">|</span>
                <span>{profile.shiftType} Shift</span>
              </div>
            </div>
            {latestAssessment && <Badge level={latestAssessment.riskLevel} />}
          </div>
        </Card>

        {totalAssessments === 0 ? (
          <EmptyState
            icon={<ClipboardList size={48} />}
            title="No assessments yet"
            description="Take your first burnout assessment to get personalized insights."
            action={
              <Link href="/assessment">
                <Button>Take Assessment</Button>
              </Link>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card whisper className="flex flex-col items-center py-8">
                <CardTitle className="mb-6">Burn Rate</CardTitle>
                <BurnRateGauge
                  value={latestAssessment?.predictedBurnRate ?? 0}
                />
              </Card>

              <Card whisper>
                <CardTitle className="mb-4">Section Scores</CardTitle>
                <CardContent>
                  <SectionScoreChart
                    personalScore={
                      latestAssessment?.personalBurnoutScore ?? 0
                    }
                    workScore={latestAssessment?.workBurnoutScore ?? 0}
                  />
                </CardContent>
              </Card>
            </div>

            {trendData.length > 1 && (
              <Card whisper>
                <CardTitle className="mb-4">Burn Rate Trend</CardTitle>
                <CardContent>
                  <BurnRateLineChart data={trendData} />
                </CardContent>
              </Card>
            )}

            {showHelp && resourcesData?.resources && (
              <Card className="border-risk-high/30 bg-risk-high/5">
                <CardTitle className="text-risk-high mb-4">
                  Get Help — Support Resources
                </CardTitle>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resourcesData.resources.map((res) => (
                      <a
                        key={res.id}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 rounded-[var(--radius-card)] border border-cream bg-ivory p-4 hover:shadow-[0_0_0_1px_var(--color-ring-warm)] transition-all"
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
          </>
        )}
      </div>
    </div>
  );
}
