export type RiskLevel = "low" | "moderate" | "high" | "critical";

export type AlertType = "high_risk" | "critical_risk" | "trend_spike";

export type UserRole = "employee" | "admin";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth?: string;
  role: UserRole;
  isActive?: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ResponseOption {
  label: string;
  value: number;
}

export interface QuizQuestion {
  id: number;
  section: string;
  text: string;
  reverseScored?: boolean;
}

export interface QuizSection {
  id: string;
  title: string;
  questionIds: number[];
}

export interface Quiz {
  quizId: string;
  name: string;
  version: number;
  responseOptions: ResponseOption[];
  sections: QuizSection[];
  questions: QuizQuestion[];
}

export interface QuizSubmissionRequest {
  quizVersion: number;
  responses: { questionId: number; answerValue: number }[];
}

export interface AssessmentResult {
  assessmentId: number;
  personalBurnoutScore: number;
  workBurnoutScore: number;
  mentalFatigueScore: number;
  predictedBurnRate: number;
  riskLevel: RiskLevel;
}

export interface QuizSubmissionHistoryItem {
  assessmentId: number;
  quizVersion: number;
  responses: {
    questionId: number;
    answerLabel: string;
    answerValue?: number;
    rawValue?: number;
    adjustedValue?: number;
    reverseScored?: boolean;
  }[];
  personalBurnoutAvg: number;
  workBurnoutAvg: number;
  submittedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface EmployeeProfile {
  firstName: string;
  lastName: string;
  department: string;
  designation: number;
  resourceAllocation: number;
  shiftType: string;
  dateOfJoining: string;
}

export interface TrendPoint {
  date: string;
  burnRate: number;
  riskLevel: RiskLevel;
}

export interface LatestAssessment {
  assessmentId: number;
  predictedBurnRate: number;
  riskLevel: RiskLevel;
  personalBurnoutScore: number;
  workBurnoutScore: number;
  mentalFatigueScore: number;
  takenAt: string;
}

export interface EmployeeDashboard {
  profile: EmployeeProfile;
  latestAssessment: LatestAssessment | null;
  trendData: TrendPoint[];
  totalAssessments: number;
}

export interface HelpResource {
  id: number;
  title: string;
  description: string;
  url: string;
  minRiskLevel: RiskLevel;
  isActive?: boolean;
  createdAt?: string;
}

export interface RiskDistribution {
  low: number;
  moderate: number;
  high: number;
  critical: number;
}

export interface CompanyOverview {
  totalEmployees: number;
  totalAssessments: number;
  avgBurnRate: number;
  riskDistribution: RiskDistribution;
}

export interface DepartmentSummary {
  id: number;
  name: string;
  location: string;
  employeeCount: number;
  avgBurnRate: number;
  highRiskCount: number;
  riskDistribution: RiskDistribution;
}

export interface Alert {
  id: number;
  assessmentResultId?: number;
  alertType: AlertType;
  employeeName: string;
  department: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminDashboard {
  companyOverview: CompanyOverview;
  departments: DepartmentSummary[];
  recentAlerts: Alert[];
}

export interface DepartmentEmployee {
  anonymousId: string;
  designation: number;
  shiftType: string;
  latestBurnRate: number;
  riskLevel: RiskLevel;
  lastAssessmentDate: string;
  assessmentCount: number;
}

export interface DepartmentDetail {
  department: { id: number; name: string; location: string };
  employees: DepartmentEmployee[];
  pagination: Pagination;
}

export interface AlertsFilters {
  isRead?: boolean;
  alertType?: AlertType;
  page?: number;
  limit?: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
}
