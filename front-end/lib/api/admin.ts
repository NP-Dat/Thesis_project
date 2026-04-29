// ============================================================
// TODO: Replace mock data below with real API calls to:
//   GET /api/admin/stats
//   GET /api/admin/alerts
// ============================================================

export interface AdminStats {
  totalEmployees: number;
  avgBurnRate: number;
  highRiskCount: number;
  testsThisWeek: number;
  departments: { department: string; avgBurnRate: number }[];
}

const MOCK_STATS: AdminStats = {
  totalEmployees: 248,
  avgBurnRate: 0.42,
  highRiskCount: 17,
  testsThisWeek: 63,
  departments: [
    { department: "Assembly Line", avgBurnRate: 0.58 },
    { department: "Maintenance", avgBurnRate: 0.35 },
    { department: "Quality Control", avgBurnRate: 0.44 },
    { department: "Warehouse", avgBurnRate: 0.51 },
    { department: "Logistics", avgBurnRate: 0.29 },
  ],
};

export async function getStats(): Promise<AdminStats> {
  // TODO: Replace with fetch("GET /api/admin/stats")
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_STATS;
}

export interface AlertEmployee {
  id: string;
  department: string;
  designation: number;
  burnRate: number;
  lastTestDate: string;
}

const MOCK_ALERTS: AlertEmployee[] = [
  { id: "EMP-1024", department: "Assembly Line", designation: 3, burnRate: 0.92, lastTestDate: "2026-04-23" },
  { id: "EMP-0587", department: "Assembly Line", designation: 2, burnRate: 0.88, lastTestDate: "2026-04-22" },
  { id: "EMP-1190", department: "Warehouse", designation: 3, burnRate: 0.87, lastTestDate: "2026-04-24" },
  { id: "EMP-0341", department: "Quality Control", designation: 1, burnRate: 0.85, lastTestDate: "2026-04-21" },
  { id: "EMP-0763", department: "Maintenance", designation: 2, burnRate: 0.84, lastTestDate: "2026-04-20" },
  { id: "EMP-1455", department: "Assembly Line", designation: 3, burnRate: 0.83, lastTestDate: "2026-04-24" },
  { id: "EMP-0092", department: "Warehouse", designation: 1, burnRate: 0.82, lastTestDate: "2026-04-19" },
  { id: "EMP-0678", department: "Quality Control", designation: 2, burnRate: 0.81, lastTestDate: "2026-04-23" },
];

export async function getAlerts(): Promise<AlertEmployee[]> {
  // TODO: Replace with fetch("GET /api/admin/alerts")
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_ALERTS;
}
