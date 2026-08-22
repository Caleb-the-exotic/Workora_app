import { hrEmployees, money } from "@/lib/hr-data";

export type PayrollStatus = "Processed" | "Pending" | "On hold";

export type PayrollRow = {
  id: string;
  name: string;
  initials: string;
  department: string;
  role: string;
  monthlyWage: number;
  basic: number;
  hra: number;
  allowances: number;
  deductions: number;
  net: number;
  status: PayrollStatus;
  accuracy: number;
  issues: string[];
};

const statusFor = (i: number): PayrollStatus =>
  i % 7 === 3 ? "Pending" : i % 11 === 5 ? "On hold" : "Processed";

export const payrollRows: PayrollRow[] = hrEmployees.map((e, i) => {
  const wage = e.monthlyWage + (i % 5) * 8500;
  const basic = Math.round(wage * 0.5);
  const hra = Math.round(wage * 0.2);
  const allowances = wage - basic - hra;
  const deductions = Math.round(wage * 0.14) + 200;
  const status = statusFor(i);
  const issues =
    status === "Pending"
      ? ["Bank account not verified"]
      : status === "On hold"
        ? ["Attendance regularisation pending", "Missing tax declaration"]
        : [];
  return {
    id: e.id,
    name: e.name,
    initials: e.initials,
    department: e.department,
    role: e.role,
    monthlyWage: wage,
    basic,
    hra,
    allowances,
    deductions,
    net: wage - deductions,
    status,
    accuracy: status === "Processed" ? 100 : status === "Pending" ? 82 : 64,
    issues,
  };
});

export const payrollTotals = {
  headcount: payrollRows.length,
  gross: payrollRows.reduce((s, r) => s + r.monthlyWage, 0),
  net: payrollRows.reduce((s, r) => s + r.net, 0),
  deductions: payrollRows.reduce((s, r) => s + r.deductions, 0),
  processed: payrollRows.filter((r) => r.status === "Processed").length,
  flagged: payrollRows.filter((r) => r.status !== "Processed").length,
};

export const payrollAccuracy = Math.round(
  payrollRows.reduce((s, r) => s + r.accuracy, 0) / payrollRows.length,
);

/* ---------------------------- reports datasets ---------------------------- */

export const attendanceDistribution = [
  { name: "Present", value: 212, tone: "var(--success)" },
  { name: "Work from home", value: 18, tone: "var(--info)" },
  { name: "On leave", value: 22, tone: "var(--pending)" },
  { name: "Absent", value: 14, tone: "var(--destructive)" },
];

export const leaveTypeDistribution = [
  { name: "Paid time off", value: 128, tone: "var(--info)" },
  { name: "Sick leave", value: 64, tone: "var(--warning)" },
  { name: "Unpaid leave", value: 22, tone: "var(--pending)" },
  { name: "Comp off", value: 17, tone: "var(--success)" },
];

export const monthlyAttendance = [
  { month: "Mar", present: 92, late: 5, absent: 3 },
  { month: "Apr", present: 94, late: 4, absent: 2 },
  { month: "May", present: 89, late: 7, absent: 4 },
  { month: "Jun", present: 91, late: 6, absent: 3 },
  { month: "Jul", present: 95, late: 3, absent: 2 },
  { month: "Aug", present: 93, late: 5, absent: 2 },
];

export const payrollOverview = [
  { month: "Mar", gross: 20.9, net: 17.4 },
  { month: "Apr", gross: 21.2, net: 17.7 },
  { month: "May", gross: 21.6, net: 18.05 },
  { month: "Jun", gross: 21.87, net: 18.28 },
  { month: "Jul", gross: 22.14, net: 18.5 },
  { month: "Aug", gross: 22.32, net: 18.64 },
];

export const headcountTrend = [
  { month: "Mar", employees: 231, joiners: 6, exits: 2 },
  { month: "Apr", employees: 236, joiners: 7, exits: 2 },
  { month: "May", employees: 240, joiners: 6, exits: 2 },
  { month: "Jun", employees: 243, joiners: 5, exits: 2 },
  { month: "Jul", employees: 246, joiners: 6, exits: 3 },
  { month: "Aug", employees: 248, joiners: 4, exits: 2 },
];

export const salaryStats = {
  median: 96000,
  average: 104500,
  highest: 320000,
  lowest: 42000,
  band: "₹42k – ₹3.2L / month",
};

export { money };
