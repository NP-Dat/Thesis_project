"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { Spinner } from "@/components/ui/Spinner";
import { Skeleton } from "@/components/ui/Skeleton";
import { useQuiz, useSubmitQuiz } from "@/lib/hooks/useQuiz";
import { AlertCircle } from "lucide-react";

export default function AssessmentPage() {
  const { data: quiz, isLoading } = useQuiz();
  const submitMutation = useSubmitQuiz();
  const router = useRouter();

  const [step, setStep] = useState(0); // 0 = personal, 1 = work-related
  const [answers, setAnswers] = useState<Record<number, number>>({});

  if (isLoading) {
    return (
      <div>
        <TopBar title="Assessment" />
        <div className="p-8 space-y-4">
          <Skeleton className="h-6 w-48" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  const sections = quiz.sections;
  const currentSection = sections[step];
  const currentQuestions = quiz.questions.filter(
    (q) => q.section === currentSection.id
  );

  const allAnswered = currentQuestions.every((q) => answers[q.id] !== undefined);
  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;

  async function handleSubmit() {
    if (!quiz) return;

    const responses = quiz.questions.map((q) => ({
      questionId: q.id,
      answerValue: answers[q.id],
    }));

    try {
      const result = await submitMutation.mutateAsync({
        quizVersion: quiz.version,
        responses,
      });
      router.push(`/results?assessmentId=${result.assessmentId}`);
    } catch {
      // error handled by mutation state
    }
  }

  return (
    <div>
      <TopBar title="Assessment" />

      <div className="p-8 max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-olive">
              Step {step + 1} of {sections.length}
            </span>
            <span className="text-sm text-stone">
              {answeredCount} / {totalQuestions} answered
            </span>
          </div>
          <ProgressBar value={(step + (allAnswered ? 1 : 0)) / sections.length} />
        </div>

        <Card whisper>
          <CardTitle className="mb-6">{currentSection.title}</CardTitle>
          <CardContent className="space-y-8">
            {currentQuestions.map((q, idx) => (
              <div key={q.id}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-sand text-charcoal-warm text-xs font-medium flex items-center justify-center">
                    {step === 0 ? idx + 1 : idx + 7}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-near-black leading-relaxed">
                      {q.text}
                    </p>
                    {q.reverseScored && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertCircle size={12} className="text-stone" />
                        <span className="text-xs text-stone">
                          Reverse scored
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <RadioGroup
                  name={`q-${q.id}`}
                  options={quiz.responseOptions}
                  value={answers[q.id] ?? null}
                  onChange={(val) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: val }))
                  }
                  className="ml-10"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {submitMutation.isError && (
          <div className="mt-4 rounded-[var(--radius-card)] bg-crimson/10 border border-crimson/20 px-4 py-3 text-sm text-crimson">
            Submission failed. Please try again.
          </div>
        )}

        <div className="flex justify-between mt-6">
          <Button
            variant="secondary"
            onClick={() => setStep(0)}
            disabled={step === 0}
          >
            Previous
          </Button>

          {step < sections.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!allAnswered}>
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={
                !allAnswered ||
                answeredCount < totalQuestions ||
                submitMutation.isPending
              }
            >
              {submitMutation.isPending ? (
                <Spinner className="h-4 w-4" />
              ) : (
                "Submit Assessment"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
