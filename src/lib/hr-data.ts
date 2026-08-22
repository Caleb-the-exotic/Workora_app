export type AttendanceState = "Present" | "Absent" | "Half-day" | "On leave" | "Late" | "Work from home";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export type HREmployee = {
  id: string;
  name: string;
  initials: string;
  email: string;
  department: string;
  role: string;
  jobType: "Full-time" | "Part-time" | "Contract" | "Intern";
  location: string;
  manager: string;
  joined: string;
  phone: string;
  status: AttendanceState;
  leaveStatus: "None" | "On leave" | "Requested";
  checkIn: string;
  checkOut: string;
  hours: string;
  extra: string;
  monthlyWage: number;
  leaveBalance: { paid: number; sick: number; unpaid: number };
};

const mk = (
  id: string,
  name: string,
  department: string,
  role: string,
  status: AttendanceState,
  extras: Partial<HREmployee> = {},
): HREmployee => ({
  id,
  name,
  initials: name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase(),
  email: `${name.toLowerCase().replace(/\s+/g, ".")}@workora.io`,
  department,
  role,
  jobType: "Full-time",
  location: "Bengaluru",
  manager: "Rohit Menon",
  joined: "12 Feb 2022",
  phone: "+91 98450 22113",
  status,
  leaveStatus: status === "On leave" ? "On leave" : "None",
  checkIn: status === "Absent" || status === "On leave" ? "—" : "09:32",
  checkOut: status === "Absent" || status === "On leave" ? "—" : "18:41",
  hours: status === "Absent" || status === "On leave" ? "—" : "09:09",
  extra: status === "Absent" || status === "On leave" ? "—" : "01:09",
  monthlyWage: 90000,
  leaveBalance: { paid: 24, sick: 7, unpaid: 5 },
  ...extras,
});

export const hrEmployees: HREmployee[] = [
  mk("DF-2041", "Ananya Sharma", "Design", "Senior Product Designer", "Present"),
  mk("DF-2042", "Rohit Menon", "Engineering", "Engineering Manager", "Present", {
    manager: "Kavya Iyer",
    checkIn: "09:11",
    checkOut: "19:02",
    hours: "09:51",
    extra: "01:51",
  }),
  mk("DF-2043", "Kavya Iyer", "Leadership", "VP Engineering", "Work from home", {
    manager: "Board",
    checkIn: "09:45",
    checkOut: "18:20",
    hours: "08:35",
    extra: "00:35",
  }),
  mk("DF-2044", "Arjun Nair", "Engineering", "Senior Backend Engineer", "Late", {
    checkIn: "10:22",
    checkOut: "19:10",
    hours: "08:48",
    extra: "00:48",
  }),
  mk("DF-2045", "Priya Raghavan", "Finance", "Payroll Analyst", "Present"),
  mk("DF-2046", "Vikram Desai", "Sales", "Account Executive", "On leave", {
    leaveStatus: "On leave",
  }),
  mk("DF-2047", "Neha Kulkarni", "Marketing", "Content Lead", "Present"),
  mk("DF-2048", "Sanjay Pillai", "Engineering", "QA Engineer", "Absent"),
  mk("DF-2049", "Meera Joshi", "HR", "HR Officer", "Present", { manager: "Kavya Iyer" }),
  mk("DF-2050", "Tanvi Rao", "Design", "Product Designer", "Present", { jobType: "Contract" }),
  mk("DF-2051", "Imran Sheikh", "Engineering", "Frontend Engineer", "Half-day", {
    checkIn: "09:52",
    checkOut: "13:30",
    hours: "03:38",
    extra: "00:00",
  }),
  mk("DF-2052", "Divya Menon", "Support", "Customer Success Lead", "Present"),
  mk("DF-2053", "Karan Bhatia", "Sales", "Sales Development Rep", "On leave", {
    leaveStatus: "On leave",
  }),
  mk("DF-2054", "Ritika Sen", "Marketing", "Growth Marketer", "Present", { jobType: "Intern" }),
  mk("DF-2055", "Aditya Verma", "Finance", "Financial Controller", "Present"),
  mk("DF-2056", "Sneha Kapoor", "Support", "Support Specialist", "Late", {
    checkIn: "10:05",
    checkOut: "18:48",
    hours: "08:43",
    extra: "00:43",
  }),
];

export const departments = Array.from(new Set(hrEmployees.map((e) => e.department))).sort();
export const jobTypes = ["Full-time", "Part-time", "Contract", "Intern"] as const;

export type LeaveApproval = {
  id: string;
  employeeId: string;
  employee: string;
  initials: string;
  department: string;
  role: string;
  type: "Paid time off" | "Sick leave" | "Unpaid leave";
  from: string;
  to: string;
  days: number;
  remarks: string;
  appliedOn: string;
  status: ApprovalStatus;
  attachment?: string;
  balanceAfter: string;
};

export const leaveApprovals: LeaveApproval[] = [
  {
    id: "LV-3402",
    employeeId: "DF-2041",
    employee: "Ananya Sharma",
    initials: "AS",
    department: "Design",
    role: "Senior Product Designer",
    type: "Paid time off",
    from: "02 Sep 2026",
    to: "05 Sep 2026",
    days: 4,
    remarks: "Planned vacation to Coorg with family.",
    appliedOn: "19 Aug 2026",
    status: "pending",
    balanceAfter: "20 of 30 days",
  },
  {
    id: "LV-3407",
    employeeId: "DF-2048",
    employee: "Sanjay Pillai",
    initials: "SP",
    department: "Engineering",
    role: "QA Engineer",
    type: "Sick leave",
    from: "21 Aug 2026",
    to: "23 Aug 2026",
    days: 3,
    remarks: "Dengue fever, doctor advised three days rest.",
    appliedOn: "21 Aug 2026",
    status: "pending",
    attachment: "medical-certificate-sanjay.pdf",
    balanceAfter: "4 of 10 days",
  },
  {
    id: "LV-3409",
    employeeId: "DF-2044",
    employee: "Arjun Nair",
    initials: "AN",
    department: "Engineering",
    role: "Senior Backend Engineer",
    type: "Unpaid leave",
    from: "01 Sep 2026",
    to: "01 Sep 2026",
    days: 1,
    remarks: "Visa appointment at the consulate.",
    appliedOn: "20 Aug 2026",
    status: "pending",
    balanceAfter: "4 of 5 days",
  },
  {
    id: "LV-3411",
    employeeId: "DF-2050",
    employee: "Tanvi Rao",
    initials: "TR",
    department: "Design",
    role: "Product Designer",
    type: "Paid time off",
    from: "10 Sep 2026",
    to: "12 Sep 2026",
    days: 3,
    remarks: "Sister's wedding in Pune.",
    appliedOn: "21 Aug 2026",
    status: "pending",
    balanceAfter: "18 of 30 days",
  },
  {
    id: "LV-3396",
    employeeId: "DF-2046",
    employee: "Vikram Desai",
    initials: "VD",
    department: "Sales",
    role: "Account Executive",
    type: "Paid time off",
    from: "20 Aug 2026",
    to: "22 Aug 2026",
    days: 3,
    remarks: "Personal travel.",
    appliedOn: "14 Aug 2026",
    status: "approved",
    balanceAfter: "17 of 30 days",
  },
  {
    id: "LV-3381",
    employeeId: "DF-2054",
    employee: "Ritika Sen",
    initials: "RS",
    department: "Marketing",
    role: "Growth Marketer",
    type: "Unpaid leave",
    from: "05 Aug 2026",
    to: "09 Aug 2026",
    days: 5,
    remarks: "Extended personal break.",
    appliedOn: "28 Jul 2026",
    status: "rejected",
    balanceAfter: "0 of 5 days",
  },
];

export const attendanceTrend = [
  { day: "Mon", present: 224, absent: 9, leave: 15 },
  { day: "Tue", present: 231, absent: 6, leave: 11 },
  { day: "Wed", present: 219, absent: 12, leave: 17 },
  { day: "Thu", present: 228, absent: 8, leave: 12 },
  { day: "Fri", present: 212, absent: 14, leave: 22 },
  { day: "Sat", present: 96, absent: 3, leave: 5 },
  { day: "Sun", present: 12, absent: 0, leave: 1 },
];

export const leaveTrend = [
  { month: "Mar", requests: 34, approved: 29 },
  { month: "Apr", requests: 41, approved: 36 },
  { month: "May", requests: 52, approved: 44 },
  { month: "Jun", requests: 47, approved: 42 },
  { month: "Jul", requests: 61, approved: 51 },
  { month: "Aug", requests: 55, approved: 48 },
];

export const departmentHeadcount = [
  { department: "Engineering", count: 96 },
  { department: "Sales", count: 42 },
  { department: "Design", count: 28 },
  { department: "Marketing", count: 24 },
  { department: "Support", count: 31 },
  { department: "Finance", count: 15 },
  { department: "HR", count: 12 },
];

export const recentActivity = [
  { who: "Meera Joshi", what: "approved LV-3396 for Vikram Desai", time: "18 min ago", tone: "success" as const },
  { who: "Sanjay Pillai", what: "submitted a sick leave request with certificate", time: "42 min ago", tone: "pending" as const },
  { who: "Imran Sheikh", what: "checked in from home at 09:52", time: "1 hr ago", tone: "info" as const },
  { who: "Arjun Nair", what: "was marked late (10:22 check-in)", time: "2 hrs ago", tone: "warning" as const },
  { who: "Ritika Sen", what: "completed onboarding documents", time: "Yesterday", tone: "success" as const },
];

export const hrNotifications = [
  { id: 1, title: "4 leave requests awaiting your action", body: "Oldest request is 2 days old (LV-3402).", time: "Today, 08:05", tone: "pending" as const, unread: true },
  { id: 2, title: "Payroll cut-off in 3 days", body: "August payroll locks on 25 Aug 2026 at 18:00.", time: "Today, 07:30", tone: "warning" as const, unread: true },
  { id: 3, title: "12 employees missing check-out", body: "Attendance regularisation needed for 20 Aug.", time: "Yesterday, 19:10", tone: "info" as const, unread: false },
  { id: 4, title: "Onboarding complete", body: "Ritika Sen finished all onboarding steps.", time: "20 Aug, 15:22", tone: "success" as const, unread: false },
];

export const payrollRuns = [
  { month: "August 2026", employees: 248, gross: 22_320_000, net: 18_640_000, status: "Draft" },
  { month: "July 2026", employees: 246, gross: 22_140_000, net: 18_500_000, status: "Paid" },
  { month: "June 2026", employees: 243, gross: 21_870_000, net: 18_280_000, status: "Paid" },
  { month: "May 2026", employees: 240, gross: 21_600_000, net: 18_050_000, status: "Paid" },
];

export const money = (n: number) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export const orgStats = {
  total: 248,
  present: 212,
  absent: 14,
  onLeave: 22,
  pending: 4,
};
