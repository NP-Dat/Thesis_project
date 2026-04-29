"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getQuestions, submitAnswers, QuizData } from "@/lib/api/quiz";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import RadioOption from "@/components/ui/RadioOption";

export default function AssessmentPage() {
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getQuestions().then(setQuiz);
  }, []);

  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-gray">
        Loading questions...
      </div>
    );
  }

  const questions = quiz.questions;
  const total = questions.length;
  const question = questions[currentIndex];
  const selectedValue = answers[question.id];
  const isLast = currentIndex === total - 1;

  const currentSection = quiz.sections.find(
    (s) => s.id === question.section
  );

  const handleSelect = (value: number) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleNext = () => {
    if (selectedValue === undefined) return;
    if (isLast) {
      handleSubmit();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await submitAnswers(answers);
      sessionStorage.setItem("burnout_result", JSON.stringify(result));
      router.push("/results");
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif font-medium text-3xl text-near-black mb-2">
          Burnout Assessment
        </h1>
        <p className="text-olive-gray">{quiz.name}</p>
      </div>

      <ProgressBar current={currentIndex + 1} total={total} />

      <div className="mt-8 bg-ivory border border-border-cream rounded-lg p-8">
        {currentSection && (
          <p className="text-xs font-medium uppercase tracking-wider text-terracotta mb-3">
            {currentSection.title}
          </p>
        )}
        <h2 className="font-serif font-medium text-xl text-near-black mb-6">
          {question.text}
        </h2>

        <div className="flex flex-col gap-3">
          {quiz.responseOptions.map((opt) => (
            <RadioOption
              key={opt.value}
              label={opt.label}
              value={opt.value}
              selected={selectedValue === opt.value}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button
          variant="secondary"
          onClick={handleBack}
          disabled={currentIndex === 0}
        >
          Back
        </Button>
        <Button
          variant="brand"
          onClick={handleNext}
          disabled={selectedValue === undefined || submitting}
        >
          {submitting
            ? "Analyzing..."
            : isLast
              ? "Submit & Get Results"
              : "Next"}
        </Button>
      </div>
    </div>
  );
}
