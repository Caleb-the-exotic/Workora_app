import { getPayrollRows, getEmployees, getAllPayroll } from "./data";

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

function mapStatus(raw: string): PayrollStatus {
  if (raw === "Pending") return "Pending";
  if (raw === "Paid" || raw === "Processed") return "Processed";
  return "On hold";
}

export const payrollRows: PayrollRow[] = getPayrollRows().map((r) => {
  const status = mapStatus(r.status);
  const issues =
    status === "Pending"
      ? ["Bank account not verified"]
      : status === "On hold"
        ? ["Attendance regularisation pending", "Missing tax declaration"]
        : [];
  return {
    id: r.id,
    name: r.name,
    initials: r.initials,
    department: r.department,
    role: r.role,
    monthlyWage: r.monthlyWage,
    basic: r.basic,
    hra: r.hra,
    allowances: r.allowances,
    deductions: r.deductions,
    net: r.net,
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

export const attendanceDistribution = (() => {
  const stats = (() => {
    const employees = getEmployees();
    const present = employees.filter((e) => e.status === "Present" || e.status === "Late").length;
    const wfh = employees.filter((e) => e.status === "Work from home").length;
    const onLeave = employees.filter((e) => e.status === "On leave").length;
    const absent = employees.filter((e) => e.status === "Absent").length;
    return { present, wfh, onLeave, absent };
  })();
  return [
    { name: "Present", value: stats.present, tone: "var(--success)" },
    { name: "Work from home", value: stats.wfh, tone: "var(--info)" },
    { name: "On leave", value: stats.onLeave, tone: "var(--pending)" },
    { name: "Absent", value: stats.absent, tone: "var(--destructive)" },
  ];
})();

export const leaveTypeDistribution = (() => {
  const requests = getAllPayroll();
  const employees = getEmployees();
  const paid = employees.reduce((s, e) => s + e.leaveBalance.paid, 0);
  const sick = employees.reduce((s, e) => s + e.leaveBalance.sick, 0);
  const unpaid = employees.reduce((s, e) => s + e.leaveBalance.unpaid, 0);
  return [
    { name: "Paid time off", value: paid, tone: "var(--info)" },
    { name: "Sick leave", value: sick, tone: "var(--warning)" },
    { name: "Unpaid leave", value: unpaid, tone: "var(--pending)" },
    { name: "Comp off", value: 17, tone: "var(--success)" },
  ];
})();

export const monthlyAttendance = [
  { month: "Mar", present: 92, late: 5, absent: 3 },
  { month: "Apr", present: 94, late: 4, absent: 2 },
  { month: "May", present: 89, late: 7, absent: 4 },
  { month: "Jun", present: 91, late: 6, absent: 3 },
  { month: "Jul", present: 95, late: 3, absent: 2 },
  { month: "Aug", present: 93, late: 5, absent: 2 },
];

export const payrollOverview = (() => {
  const employees = getEmployees();
  const allPayroll = getAllPayroll();
  const months = [
    { month: "Mar", m: 3 },
    { month: "Apr", m: 4 },
    { month: "May", m: 5 },
    { month: "Jun", m: 6 },
    { month: "Jul", m: 7 },
    { month: "Aug", m: 8 },
  ];
  return months.map(({ month, m }) => {
    const recs = allPayroll.filter((p) => p.month === m && p.year === 2026);
    const gross = recs.reduce((s, r) => s + r.monthlyWage, 0);
    const net = recs.reduce((s, r) => s + r.net, 0);
    return { month, gross: gross / 1_000_000, net: net / 1_000_000 };
  });
})();

export const headcountTrend = [
  { month: "Mar", employees: 231, joiners: 6, exits: 2 },
  { month: "Apr", employees: 236, joiners: 7, exits: 2 },
  { month: "May", employees: 240, joiners: 6, exits: 2 },
  { month: "Jun", employees: 243, joiners: 5, exits: 2 },
  { month: "Jul", employees: 246, joiners: 6, exits: 3 },
  { month: "Aug", employees: 248, joiners: 4, exits: 2 },
];

export const salaryStats = (() => {
  const employees = getEmployees();
  const wages = employees.map((e) => e.monthlyWage).sort((a, b) => a - b);
  const median = wages[Math.floor(wages.length / 2)] ?? 0;
  const average = Math.round(wages.reduce((s, w) => s + w, 0) / wages.length);
  const highest = wages[wages.length - 1] ?? 0;
  const lowest = wages[0] ?? 0;
  return {
    median,
    average,
    highest,
    lowest,
    band: `₹${Math.round(lowest / 1000)}k – ₹${Math.round(highest / 100000) * 100}k / month`,
  };
})();

export const money = (n: number) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
