"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { BurnRateGauge } from "@/components/charts/BurnRateGauge";
import { BurnRateLineChart } from "@/components/charts/BurnRateLineChart";
import { SectionScoreChart } from "@/components/charts/SectionScoreChart";
import { KpiLineChart } from "@/components/charts/KpiLineChart";
import { KpiBurnRateComparisonChart } from "@/components/charts/KpiBurnRateComparisonChart";
import { useEmployeeDetail } from "@/lib/hooks/useEmployees";
import { ArrowLeft, ClipboardList } from "lucide-react";

export default function EmployeeDetailPage() {
  const params = useParams();
  const userId = Number(params.id);
  const { data, isLoading } = useEmployeeDetail(userId);

  if (isLoading) {
    return (
      <div>
        <TopBar title="Employee Detail" />
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

  const { anonymousId, department, designation, shiftType, latestAssessment, trendData, totalAssessments, kpiData, kpiBurnRateComparison } = data;

  return (
    <div>
      <TopBar
        title={anonymousId}
        action={
          <Link
            href="/admin/employees"
            className="flex items-center gap-2 text-sm text-olive hover:text-near-black transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Employees
          </Link>
        }
      />

      <div className="p-8 space-y-6">
        <Card>
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta font-serif font-medium text-lg">
              {anonymousId.split("#")[1]}
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-xl font-medium text-near-black">
                {anonymousId}
              </h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-olive">
                <span>{department}</span>
                <span className="text-stone">|</span>
                <span>Designation Level {designation}</span>
                <span className="text-stone">|</span>
                <span>{shiftType} Shift</span>
              </div>
            </div>
            {latestAssessment && <Badge level={latestAssessment.riskLevel} />}
          </div>
        </Card>

        {totalAssessments === 0 ? (
          <EmptyState
            icon={<ClipboardList size={48} />}
            title="No assessments yet"
            description="This employee has not completed any burnout assessments."
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
                    personalScore={latestAssessment?.personalBurnoutScore ?? 0}
                    workScore={latestAssessment?.workBurnoutScore ?? 0}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="text-center py-6">
                <p className="text-sm text-olive mb-1">Personal Burnout</p>
                <p className="font-serif text-2xl font-medium text-near-black">
                  {latestAssessment?.personalBurnoutScore?.toFixed(1) ?? "—"}
                </p>
                <p className="text-xs text-stone mt-1">out of 100</p>
              </Card>
              <Card className="text-center py-6">
                <p className="text-sm text-olive mb-1">Work-Related Burnout</p>
                <p className="font-serif text-2xl font-medium text-near-black">
                  {latestAssessment?.workBurnoutScore?.toFixed(1) ?? "—"}
                </p>
                <p className="text-xs text-stone mt-1">out of 100</p>
              </Card>
              <Card className="text-center py-6">
                <p className="text-sm text-olive mb-1">Mental Fatigue</p>
                <p className="font-serif text-2xl font-medium text-near-black">
                  {latestAssessment?.mentalFatigueScore?.toFixed(1) ?? "—"}
                </p>
                <p className="text-xs text-stone mt-1">out of 10</p>
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

            {kpiData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card whisper>
                  <CardTitle className="mb-4">KPI Performance</CardTitle>
                  <CardContent>
                    <KpiLineChart data={kpiData} />
                  </CardContent>
                </Card>
                <Card whisper>
                  <CardTitle className="mb-4">Burn Rate vs Performance</CardTitle>
                  <CardContent>
                    <KpiBurnRateComparisonChart data={kpiBurnRateComparison} />
                  </CardContent>
                </Card>
              </div>
            )}

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-olive">Total Assessments Taken</p>
                  <p className="font-serif text-xl font-medium text-near-black mt-1">
                    {totalAssessments}
                  </p>
                </div>
                {latestAssessment && (
                  <div className="text-right">
                    <p className="text-sm text-olive">Last Assessment</p>
                    <p className="text-sm text-near-black mt-1">
                      {new Date(latestAssessment.takenAt).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      )}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
