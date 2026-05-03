"use client";

import { Fragment, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardTitle } from "@/components/ui/Card";
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
import { useQuizHistory } from "@/lib/hooks/useQuiz";
import { History, ChevronDown, ChevronUp } from "lucide-react";

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuizHistory(page, 10);
  const [expanded, setExpanded] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div>
        <TopBar title="Assessment History" />
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
      <TopBar title="Assessment History" />

      <div className="p-8">
        {!data?.submissions?.length ? (
          <EmptyState
            icon={<History size={48} />}
            title="No submissions yet"
            description="Complete an assessment to see your history here."
          />
        ) : (
          <Card>
            <CardTitle className="mb-4">Past Submissions</CardTitle>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Personal Burnout</TableHead>
                  <TableHead>Work Burnout</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.submissions.map((sub) => (
                  <Fragment key={sub.assessmentId}>
                    <TableRow>
                      <TableCell>
                        {new Date(sub.submittedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        {sub.personalBurnoutAvg.toFixed(1)}
                      </TableCell>
                      <TableCell>{sub.workBurnoutAvg.toFixed(1)}</TableCell>
                      <TableCell>v{sub.quizVersion}</TableCell>
                      <TableCell>
                        <button
                          onClick={() =>
                            setExpanded(
                              expanded === sub.assessmentId
                                ? null
                                : sub.assessmentId
                            )
                          }
                          className="p-1 rounded text-stone hover:text-near-black cursor-pointer"
                        >
                          {expanded === sub.assessmentId ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                      </TableCell>
                    </TableRow>
                    {expanded === sub.assessmentId && (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <div className="bg-parchment rounded-[var(--radius-card)] p-4">
                            <p className="text-xs text-stone uppercase tracking-wider mb-3">
                              Individual Responses
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {sub.responses.map((r) => (
                                <div
                                  key={r.questionId}
                                  className="flex items-center justify-between text-sm py-1"
                                >
                                  <span className="text-olive">
                                    Q{r.questionId}
                                    {r.reverseScored && (
                                      <span className="text-xs text-stone ml-1">
                                        (reversed)
                                      </span>
                                    )}
                                  </span>
                                  <span className="font-medium text-near-black">
                                    {r.answerLabel}{" "}
                                    <span className="text-stone text-xs">
                                      (
                                      {r.reverseScored
                                        ? r.adjustedValue
                                        : (r.answerValue ?? r.rawValue)}
                                      )
                                    </span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
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
        )}
      </div>
    </div>
  );
}
