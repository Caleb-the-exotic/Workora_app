export type LeaveStatus = "approved" | "pending" | "rejected";

export const employee = {
  id: "DF-2041",
  name: "Ananya Sharma",
  firstName: "Ananya",
  designation: "Senior Product Designer",
  department: "Design",
  manager: "Rohit Menon",
  location: "Bengaluru — Prestige Tech Park",
  employmentType: "Full-time",
  dateOfJoining: "12 Feb 2022",
  workEmail: "ananya.sharma@workora.io",
  loginId: "ananya.sharma",
  personalEmail: "ananya.s@gmail.com",
  phone: "+91 98450 22113",
  address: "402, Lakeview Residency, Indiranagar, Bengaluru 560038",
  dateOfBirth: "18 Aug 1994",
  gender: "Female",
  maritalStatus: "Married",
  nationality: "Indian",
  emergencyContact: "Vikram Sharma — +91 98860 44120",
  bankName: "HDFC Bank",
  accountNumber: "XXXX XXXX 4412",
  ifsc: "HDFC0001204",
  pan: "AXQPS4412K",
  uan: "101223440091",
  shift: "General — 09:30 to 18:30",
  workingDays: 5,
};

export const salary = {
  monthlyWage: 90000,
  yearlyWage: 1080000,
  currency: "₹",
  components: [
    { label: "Basic salary", pct: 50, amount: 45000, note: "50% of monthly wage" },
    { label: "House rent allowance", pct: 20, amount: 18000, note: "20% of monthly wage" },
    { label: "Standard allowance", pct: 16.67, amount: 15003, note: "Fixed statutory allowance" },
    { label: "Performance bonus", pct: 8.33, amount: 7497, note: "Variable, paid quarterly" },
    { label: "Leave travel allowance", pct: 3, amount: 2700, note: "Annual, paid on claim" },
    { label: "Fixed allowance", pct: 2, amount: 1800, note: "Balancing component" },
  ],
  deductions: [
    { label: "Provident fund — employee (12%)", amount: 5400 },
    { label: "Professional tax", amount: 200 },
    { label: "Income tax (TDS)", amount: 6850 },
  ],
  employerPf: 5400,
};

export const netPay =
  salary.monthlyWage - salary.deductions.reduce((s, d) => s + d.amount, 0);

export const payslips = [
  { month: "July 2026", net: netPay, status: "Paid", credited: "31 Jul 2026" },
  { month: "June 2026", net: netPay, status: "Paid", credited: "30 Jun 2026" },
  { month: "May 2026", net: netPay - 1200, status: "Paid", credited: "31 May 2026" },
  { month: "April 2026", net: netPay - 1200, status: "Paid", credited: "30 Apr 2026" },
];

export const attendanceSummary = {
  present: 18,
  absent: 1,
  leave: 2,
  wfh: 2,
  halfDay: 1,
  lateMarks: 2,
  avgHours: "8h 24m",
  monthLabel: "August 2026",
};

export const attendanceLog = [
  { date: "21 Aug 2026", day: "Friday", in: "09:26", out: "18:41", hours: "9h 15m", status: "Present" },
  { date: "20 Aug 2026", day: "Thursday", in: "09:48", out: "18:32", hours: "8h 44m", status: "Late" },
  { date: "19 Aug 2026", day: "Wednesday", in: "09:21", out: "13:30", hours: "4h 09m", status: "Half-day" },
  { date: "18 Aug 2026", day: "Tuesday", in: "—", out: "—", hours: "—", status: "On leave" },
  { date: "17 Aug 2026", day: "Monday", in: "09:29", out: "18:28", hours: "8h 59m", status: "Present" },
  { date: "14 Aug 2026", day: "Friday", in: "09:33", out: "18:05", hours: "8h 32m", status: "Present" },
  { date: "13 Aug 2026", day: "Thursday", in: "—", out: "—", hours: "—", status: "Absent" },
];

export const leaveBalances = [
  { type: "Casual leave", used: 4, total: 12, tone: "info" as const },
  { type: "Sick leave", used: 2, total: 8, tone: "warning" as const },
  { type: "Earned leave", used: 5, total: 18, tone: "success" as const },
  { type: "Comp-off", used: 0, total: 3, tone: "pending" as const },
];

export const leaveRequests: {
  id: string;
  type: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
}[] = [
  {
    id: "LV-3391",
    type: "Casual leave",
    from: "18 Aug 2026",
    to: "18 Aug 2026",
    days: 1,
    reason: "Family function at home",
    status: "approved",
    appliedOn: "12 Aug 2026",
  },
  {
    id: "LV-3402",
    type: "Earned leave",
    from: "02 Sep 2026",
    to: "05 Sep 2026",
    days: 4,
    reason: "Planned vacation to Coorg",
    status: "pending",
    appliedOn: "19 Aug 2026",
  },
  {
    id: "LV-3288",
    type: "Sick leave",
    from: "29 Jul 2026",
    to: "30 Jul 2026",
    days: 2,
    reason: "Viral fever, doctor advised rest",
    status: "approved",
    appliedOn: "29 Jul 2026",
  },
  {
    id: "LV-3204",
    type: "Casual leave",
    from: "11 Jul 2026",
    to: "12 Jul 2026",
    days: 2,
    reason: "Personal work",
    status: "rejected",
    appliedOn: "08 Jul 2026",
  },
];

export const activity = [
  { title: "Payslip for July 2026 is ready", time: "2 days ago", tone: "info" as const },
  { title: "Leave request LV-3391 approved by Rohit Menon", time: "6 days ago", tone: "success" as const },
  { title: "You were marked late on 20 Aug", time: "1 day ago", tone: "warning" as const },
  { title: "Performance review cycle opens 01 Sep", time: "3 days ago", tone: "pending" as const },
];

export const notifications = [
  {
    id: 1,
    title: "Leave request pending approval",
    body: "LV-3402 (02–05 Sep) is awaiting action from Rohit Menon.",
    time: "Today, 08:15",
    tone: "pending" as const,
    unread: true,
  },
  {
    id: 2,
    title: "Payslip available",
    body: "Your July 2026 payslip has been published and credited.",
    time: "Yesterday, 18:02",
    tone: "info" as const,
    unread: true,
  },
  {
    id: 3,
    title: "Attendance regularisation needed",
    body: "Check-out missing for 13 Aug 2026. Submit a correction request.",
    time: "18 Aug, 10:41",
    tone: "warning" as const,
    unread: false,
  },
  {
    id: 4,
    title: "Policy update",
    body: "Work-from-home policy revised — up to 6 days per month.",
    time: "12 Aug, 09:00",
    tone: "success" as const,
    unread: false,
  },
];

export const documents = [
  { name: "Offer letter.pdf", size: "218 KB", uploaded: "10 Feb 2022", type: "Onboarding" },
  { name: "Aadhaar card.pdf", size: "440 KB", uploaded: "14 Feb 2022", type: "Identity" },
  { name: "PAN card.pdf", size: "180 KB", uploaded: "14 Feb 2022", type: "Identity" },
  { name: "Form 16 — FY 2025-26.pdf", size: "512 KB", uploaded: "22 Jun 2026", type: "Tax" },
];

export const money = (n: number) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
