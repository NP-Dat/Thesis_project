import { apiFetch } from "./client";
import type {
  Quiz,
  QuizSubmissionRequest,
  AssessmentResult,
  QuizSubmissionHistoryItem,
  Pagination,
} from "../types";

export function getQuiz() {
  return apiFetch<Quiz>("/quiz");
}

export function submitQuiz(body: QuizSubmissionRequest) {
  return apiFetch<AssessmentResult>("/quiz/submit", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getQuizHistory(page = 1, limit = 10) {
  return apiFetch<{
    submissions: QuizSubmissionHistoryItem[];
    pagination: Pagination;
  }>(`/quiz/history?page=${page}&limit=${limit}`);
}
