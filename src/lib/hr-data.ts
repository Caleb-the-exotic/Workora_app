import { getEmployees, getAllAttendance, getLeaveRequests, getOrgStats, getDepartmentHeadcount, getAttendanceTrend, getLeaveTrend } from "./data";

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

export const jobTypes = ["Full-time", "Part-time", "Contract", "Intern"] as const;

export function getHREmployees(): HREmployee[] {
  return getEmployees().map((e) => ({
    id: e.employeeId,
    name: e.name,
    initials: e.initials,
    email: e.email,
    department: e.department,
    role: e.designation,
    jobType: e.jobType,
    location: e.location,
    manager: e.manager,
    joined: e.joined,
    phone: e.phone,
    status: e.status,
    leaveStatus: e.leaveStatus,
    checkIn: e.checkIn,
    checkOut: e.checkOut,
    hours: e.hours,
    extra: e.extra,
    monthlyWage: e.monthlyWage,
    leaveBalance: e.leaveBalance,
  }));
}

export const hrEmployees: HREmployee[] = getHREmployees();

export const departments = Array.from(new Set(hrEmployees.map((e) => e.department))).sort();

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

function mapLeaveType(type: string): "Paid time off" | "Sick leave" | "Unpaid leave" {
  if (type.toLowerCase().includes("sick")) return "Sick leave";
  if (type.toLowerCase().includes("unpaid")) return "Unpaid leave";
  return "Paid time off";
}

export const leaveApprovals: LeaveApproval[] = (() => {
  const employees = getEmployees();
  const requests = getLeaveRequests();
  return requests.map((r) => {
    const emp = employees.find((e) => e.employeeId === r.employeeId);
    const balance = emp?.leaveBalance ?? { paid: 0, sick: 0, unpaid: 0 };
    const remaining = r.type.toLowerCase().includes("sick")
      ? balance.sick
      : r.type.toLowerCase().includes("unpaid")
        ? balance.unpaid
        : balance.paid;
    return {
      id: r.id,
      employeeId: r.employeeId,
      employee: emp?.name ?? "Unknown",
      initials: emp?.initials ?? "??",
      department: emp?.department ?? "—",
      role: emp?.designation ?? "—",
      type: mapLeaveType(r.type),
      from: r.from,
      to: r.to,
      days: r.days,
      remarks: r.reason,
      appliedOn: r.appliedOn,
      status: r.status as ApprovalStatus,
      balanceAfter: `${remaining} of 30 days`,
    };
  });
})();

export const attendanceTrend = getAttendanceTrend();

export const leaveTrend = getLeaveTrend();

export const departmentHeadcount = getDepartmentHeadcount();

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

export const orgStats = getOrgStats();
