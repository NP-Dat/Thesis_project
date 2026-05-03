import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQuiz, submitQuiz, getQuizHistory } from "../api/quiz";
import type { QuizSubmissionRequest } from "../types";

export function useQuiz() {
  return useQuery({
    queryKey: ["quiz"],
    queryFn: getQuiz,
  });
}

export function useSubmitQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: QuizSubmissionRequest) => submitQuiz(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard", "employee"] });
      qc.invalidateQueries({ queryKey: ["quiz", "history"] });
    },
  });
}

export function useQuizHistory(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["quiz", "history", page, limit],
    queryFn: () => getQuizHistory(page, limit),
  });
}
