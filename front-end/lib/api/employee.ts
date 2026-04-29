// ============================================================
// TODO: Replace mock data below with real API calls to:
//   GET /api/employee/dashboard
// ============================================================

export interface DashboardData {
  designation: number;
  resourceAllocation: number;
  currentBurnRate: number;
  lastCheckIn: string;
  history: { date: string; burnRate: number }[];
}

const MOCK_DASHBOARD: DashboardData = {
  designation: 2,
  resourceAllocation: 4,
  currentBurnRate: 0.33,
  lastCheckIn: "2026-04-20",
  history: [
    { date: "Jan", burnRate: 0.16 },
    { date: "Feb", burnRate: 0.29 },
    { date: "Mar", burnRate: 0.36 },
    { date: "Apr", burnRate: 0.33 },
    { date: "May", burnRate: 0.49 },
    { date: "Jun", burnRate: 0.52 },
    { date: "Jul", burnRate: 0.44 },
  ],
};

export async function getDashboardData(): Promise<DashboardData> {
  // TODO: Replace with fetch("GET /api/employee/dashboard")
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_DASHBOARD;
}
