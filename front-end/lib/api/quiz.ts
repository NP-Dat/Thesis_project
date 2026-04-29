// ============================================================
// TODO: Replace mock data below with real API calls to:
//   GET  /api/quiz/questions
//   POST /api/quiz/submit
// ============================================================

export interface ResponseOption {
  label: string;
  value: number;
}

export interface Question {
  id: number;
  section: string;
  text: string;
  reverseScored?: boolean;
}

export interface QuizData {
  name: string;
  responseOptions: ResponseOption[];
  sections: { id: string; title: string; questionIds: number[] }[];
  questions: Question[];
}

const MOCK_QUIZ: QuizData = {
  name: "Copenhagen Burnout Inventory (excerpt)",
  responseOptions: [
    { label: "Always", value: 100 },
    { label: "Often", value: 75 },
    { label: "Sometimes", value: 50 },
    { label: "Seldom", value: 25 },
    { label: "Never/almost never", value: 0 },
  ],
  sections: [
    {
      id: "personal_burnout",
      title: "Personal burnout",
      questionIds: [1, 2, 3, 4, 5, 6],
    },
    {
      id: "work_related_burnout",
      title: "Work-related burnout",
      questionIds: [7, 8, 9, 10, 11, 12, 13],
    },
  ],
  questions: [
    { id: 1, section: "personal_burnout", text: "How often do you feel tired?" },
    { id: 2, section: "personal_burnout", text: "How often are you physically exhausted?" },
    { id: 3, section: "personal_burnout", text: "How often are you emotionally exhausted?" },
    { id: 4, section: "personal_burnout", text: "How often do you think: \"I can't take it anymore?\"" },
    { id: 5, section: "personal_burnout", text: "How often do you feel worn out?" },
    { id: 6, section: "personal_burnout", text: "How often do you feel weak and susceptible to illness?" },
    { id: 7, section: "work_related_burnout", text: "Do you feel worn out at the end of the working day?" },
    { id: 8, section: "work_related_burnout", text: "Are you exhausted in the morning at the thought of another day at work?" },
    { id: 9, section: "work_related_burnout", text: "Do you feel that every working hour is tiring for you?" },
    { id: 10, section: "work_related_burnout", text: "Do you have enough energy for family and friends during leisure time?", reverseScored: true },
    { id: 11, section: "work_related_burnout", text: "Is your work emotionally exhausting?" },
    { id: 12, section: "work_related_burnout", text: "Does your work frustrate you?" },
    { id: 13, section: "work_related_burnout", text: "Do you feel burnt out because of your work?" },
  ],
};

export async function getQuestions(): Promise<QuizData> {
  // TODO: Replace with fetch("GET /api/quiz/questions")
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_QUIZ;
}

export interface PredictionResult {
  mentalFatigueScore: number; // 0-10
  burnRate: number; // 0.0-1.0
}

export async function submitAnswers(
  answers: Record<number, number>
): Promise<PredictionResult> {
  // TODO: Replace with fetch("POST /api/quiz/submit", { answers })
  await new Promise((r) => setTimeout(r, 800));

  // Simple mock calculation: average answers (0-100) -> scale to 0-10
  const values = Object.values(answers);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const mentalFatigueScore = parseFloat((avg / 10).toFixed(1));
  const burnRate = parseFloat((avg / 120).toFixed(2));

  return { mentalFatigueScore, burnRate: Math.min(burnRate, 1) };
}
