import { getCurrentUser, getNameFromEmail, getInitials } from "./auth";
import {
  getEmployeeByEmail,
  getAttendance,
  getLeaveRequests,
  getLeaveBalance,
  getPayroll,
  getNotifications as dbGetNotifications,
  getDocuments,
  type EmployeeRecord,
  type AttendanceRecord,
  type LeaveRequestRecord,
  type PayrollRecord,
  type NotificationRecord,
  type DocumentRecord,
} from "./data";

export type LeaveStatus = "approved" | "pending" | "rejected";

// ─── Employee ────────────────────────────────────────────────────────────────

export function getEmployee() {
  const user = getCurrentUser();
  if (!user) {
    return {
      id: "EMP0000", name: "User", firstName: "User", initials: "U",
      designation: "Employee", department: "General", manager: "—",
      location: "Remote", employmentType: "Full-time",
      dateOfJoining: "—", workEmail: "", loginId: "",
      personalEmail: "", phone: "—", address: "—",
      dateOfBirth: "—", gender: "—", maritalStatus: "—",
      nationality: "—", emergencyContact: "—", bankName: "—",
      accountNumber: "XXXX XXXX 0000", ifsc: "—", pan: "—", uan: "—",
      shift: "General — 09:30 to 18:30", workingDays: 5,
    };
  }

  const dbEmp = getEmployeeByEmail(user.email);

  if (dbEmp) {
    return {
      id: dbEmp.employeeId,
      name: dbEmp.name,
      firstName: dbEmp.firstName,
      initials: dbEmp.initials,
      designation: dbEmp.designation,
      department: dbEmp.department,
      manager: dbEmp.manager,
      location: dbEmp.location,
      employmentType: dbEmp.jobType,
      dateOfJoining: dbEmp.joined,
      workEmail: dbEmp.email,
      loginId: dbEmp.email.split("@")[0],
      personalEmail: dbEmp.email,
      phone: dbEmp.phone,
      address: "—",
      dateOfBirth: "—",
      gender: "—",
      maritalStatus: "—",
      nationality: "—",
      emergencyContact: "—",
      bankName: "—",
      accountNumber: "XXXX XXXX 0000",
      ifsc: "—",
      pan: "—",
      uan: "—",
      shift: "General — 09:30 to 18:30",
      workingDays: 5,
    };
  }

  // Fallback: user registered but not in employee DB
  const name = getNameFromEmail(user.email);
  return {
    id: user.employeeId,
    name,
    firstName: name.split(" ")[0],
    initials: getInitials(name),
    designation: "Employee",
    department: "General",
    manager: "—",
    location: "Remote",
    employmentType: "Full-time",
    dateOfJoining: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    workEmail: user.email,
    loginId: user.email.split("@")[0],
    personalEmail: user.email,
    phone: "—",
    address: "—",
    dateOfBirth: "—",
    gender: "—",
    maritalStatus: "—",
    nationality: "—",
    emergencyContact: "—",
    bankName: "—",
    accountNumber: "XXXX XXXX 0000",
    ifsc: "—",
    pan: "—",
    uan: "—",
    shift: "General — 09:30 to 18:30",
    workingDays: 5,
  };
}

// ─── Salary ──────────────────────────────────────────────────────────────────

export function getSalary() {
  const emp = getEmployee();
  const dbEmp = getCurrentUser() ? getEmployeeByEmail(getCurrentUser()!.email) : null;
  const wage = dbEmp?.monthlyWage || 90000;

  return {
    monthlyWage: wage,
    yearlyWage: wage * 12,
    currency: "₹",
    components: [
      { label: "Basic salary", pct: 50, amount: Math.round(wage * 0.5), note: "50% of monthly wage" },
      { label: "House rent allowance", pct: 20, amount: Math.round(wage * 0.2), note: "20% of monthly wage" },
      { label: "Standard allowance", pct: 16.67, amount: Math.round(wage * 0.1667), note: "Fixed statutory allowance" },
      { label: "Performance bonus", pct: 8.33, amount: Math.round(wage * 0.0833), note: "Variable, paid quarterly" },
      { label: "Leave travel allowance", pct: 3, amount: Math.round(wage * 0.03), note: "Annual, paid on claim" },
      { label: "Fixed allowance", pct: 2, amount: Math.round(wage * 0.02), note: "Balancing component" },
    ],
    deductions: [
      { label: "Provident fund — employee (12%)", amount: Math.round(wage * 0.12) },
      { label: "Professional tax", amount: 200 },
      { label: "Income tax (TDS)", amount: Math.round(wage * 0.076) },
    ],
    employerPf: Math.round(wage * 0.12),
  };
}

export function getNetPay() {
  const s = getSalary();
  return s.monthlyWage - s.deductions.reduce((sum, d) => sum + d.amount, 0);
}

// ─── Payslips ────────────────────────────────────────────────────────────────

export function getPayslips() {
  const user = getCurrentUser();
  if (!user) return [];
  const records = getPayroll(user.employeeId || getEmployee().id);
  if (records.length === 0) {
    const net = getNetPay();
    const months = ["July 2026", "June 2026", "May 2026", "April 2026"];
    const credits = ["31 Jul 2026", "30 Jun 2026", "31 May 2026", "30 Apr 2026"];
    return months.map((month, i) => ({
      month,
      net: i < 2 ? net : net - 1200,
      status: "Paid",
      credited: credits[i],
    }));
  }
  return records.map((r) => ({
    month: new Date(r.year, r.month - 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
    net: r.net,
    status: r.status,
    credited: r.creditedOn || "—",
  }));
}

// ─── Attendance ──────────────────────────────────────────────────────────────

export function getAttendanceSummary() {
  const user = getCurrentUser();
  const logs = user ? getAttendance(user.employeeId || getEmployee().id) : [];
  const present = logs.filter((l) => l.status === "Present" || l.status === "Late").length;
  const absent = logs.filter((l) => l.status === "Absent").length;
  const leave = logs.filter((l) => l.status === "On leave").length;
  const wfh = logs.filter((l) => l.status === "Work from home").length;
  const halfDay = logs.filter((l) => l.status === "Half-day").length;
  const lateMarks = logs.filter((l) => l.status === "Late").length;

  return {
    present: present || 18,
    absent: absent || 1,
    leave: leave || 2,
    wfh: wfh || 2,
    halfDay: halfDay || 1,
    lateMarks: lateMarks || 2,
    avgHours: "8h 24m",
    monthLabel: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
  };
}

export function getAttendanceLog() {
  const user = getCurrentUser();
  if (!user) return [];
  const logs = getAttendance(user.employeeId || getEmployee().id);
  if (logs.length === 0) {
    return [
      { date: "21 Aug 2026", day: "Friday", in: "09:26", out: "18:41", hours: "9h 15m", status: "Present" },
      { date: "20 Aug 2026", day: "Thursday", in: "09:48", out: "18:32", hours: "8h 44m", status: "Late" },
      { date: "19 Aug 2026", day: "Wednesday", in: "09:21", out: "13:30", hours: "4h 09m", status: "Half-day" },
      { date: "18 Aug 2026", day: "Tuesday", in: "—", out: "—", hours: "—", status: "On leave" },
      { date: "17 Aug 2026", day: "Monday", in: "09:29", out: "18:28", hours: "8h 59m", status: "Present" },
      { date: "14 Aug 2026", day: "Friday", in: "09:33", out: "18:05", hours: "8h 32m", status: "Present" },
      { date: "13 Aug 2026", day: "Thursday", in: "—", out: "—", hours: "—", status: "Absent" },
    ];
  }
  return logs.map((l) => ({
    date: l.date,
    day: l.day,
    in: l.checkIn,
    out: l.checkOut,
    hours: l.hours,
    status: l.status,
  }));
}

// ─── Leave ───────────────────────────────────────────────────────────────────

export function getLeaveBalances() {
  const user = getCurrentUser();
  if (!user) return [];
  const bal = getLeaveBalance(user.employeeId || getEmployee().id);
  if (!bal) {
    return [
      { type: "Casual leave", used: 4, total: 12, tone: "info" as const },
      { type: "Sick leave", used: 2, total: 8, tone: "warning" as const },
      { type: "Earned leave", used: 5, total: 18, tone: "success" as const },
      { type: "Comp-off", used: 0, total: 3, tone: "pending" as const },
    ];
  }
  return [
    { type: "Casual leave", used: bal.paid.used, total: bal.paid.total, tone: "info" as const },
    { type: "Sick leave", used: bal.sick.used, total: bal.sick.total, tone: "warning" as const },
    { type: "Earned leave", used: bal.unpaid.used, total: bal.unpaid.total, tone: "success" as const },
    { type: "Comp-off", used: 0, total: 3, tone: "pending" as const },
  ];
}

export function getLeaveRequestsData() {
  const user = getCurrentUser();
  if (!user) return [];
  const reqs = getLeaveRequests(user.employeeId || getEmployee().id);
  if (reqs.length === 0) {
    return [
      { id: "LV-3391", type: "Casual leave", from: "18 Aug 2026", to: "18 Aug 2026", days: 1, reason: "Family function at home", status: "approved" as LeaveStatus, appliedOn: "12 Aug 2026" },
      { id: "LV-3402", type: "Earned leave", from: "02 Sep 2026", to: "05 Sep 2026", days: 4, reason: "Planned vacation to Coorg", status: "pending" as LeaveStatus, appliedOn: "19 Aug 2026" },
      { id: "LV-3288", type: "Sick leave", from: "29 Jul 2026", to: "30 Jul 2026", days: 2, reason: "Viral fever, doctor advised rest", status: "approved" as LeaveStatus, appliedOn: "29 Jul 2026" },
      { id: "LV-3204", type: "Casual leave", from: "11 Jul 2026", to: "12 Jul 2026", days: 2, reason: "Personal work", status: "rejected" as LeaveStatus, appliedOn: "08 Jul 2026" },
    ];
  }
  return reqs.map((r) => ({
    id: r.id,
    type: r.type,
    from: r.from,
    to: r.to,
    days: r.days,
    reason: r.reason,
    status: r.status as LeaveStatus,
    appliedOn: r.appliedOn,
  }));
}

// ─── Activity ────────────────────────────────────────────────────────────────

export function getActivity() {
  const emp = getEmployee();
  return [
    { title: "Payslip for July 2026 is ready", time: "2 days ago", tone: "info" as const },
    { title: `Leave request LV-3391 approved by ${emp.manager}`, time: "6 days ago", tone: "success" as const },
    { title: "You were marked late on 20 Aug", time: "1 day ago", tone: "warning" as const },
    { title: "Performance review cycle opens 01 Sep", time: "3 days ago", tone: "pending" as const },
  ];
}

// ─── Notifications ───────────────────────────────────────────────────────────

export function getNotifications() {
  const user = getCurrentUser();
  if (!user) return [];
  const notifs = dbGetNotifications(user.employeeId || getEmployee().id);
  if (notifs.length === 0) {
    return [
      { id: 1, title: "Leave request pending approval", body: "LV-3402 (02–05 Sep) is awaiting action from Rohit Menon.", time: "Today, 08:15", tone: "pending" as const, unread: true },
      { id: 2, title: "Payslip available", body: "Your July 2026 payslip has been published and credited.", time: "Yesterday, 18:02", tone: "info" as const, unread: true },
      { id: 3, title: "Attendance regularisation needed", body: "Check-out missing for 13 Aug 2026. Submit a correction request.", time: "18 Aug, 10:41", tone: "warning" as const, unread: false },
      { id: 4, title: "Policy update", body: "Work-from-home policy revised — up to 6 days per month.", time: "12 Aug, 09:00", tone: "success" as const, unread: false },
    ];
  }
  return notifs.map((n) => ({
    id: parseInt(n.id.replace(/\D/g, "")) || Math.random(),
    title: n.title,
    body: n.body,
    time: n.time,
    tone: n.category === "leave" ? "pending" as const : n.category === "attendance" ? "warning" as const : n.category === "payroll" ? "info" as const : "success" as const,
    unread: n.unread,
  }));
}

// ─── Documents ───────────────────────────────────────────────────────────────

export function getDocumentsData() {
  const user = getCurrentUser();
  if (!user) return [];
  const docs = getDocuments(user.employeeId || getEmployee().id);
  if (docs.length === 0) {
    return [
      { name: "Offer letter.pdf", size: "218 KB", uploaded: "10 Feb 2022", type: "Onboarding" },
      { name: "Aadhaar card.pdf", size: "440 KB", uploaded: "14 Feb 2022", type: "Identity" },
      { name: "PAN card.pdf", size: "180 KB", uploaded: "14 Feb 2022", type: "Identity" },
      { name: "Form 16 — FY 2025-26.pdf", size: "512 KB", uploaded: "22 Jun 2026", type: "Tax" },
    ];
  }
  return docs.map((d) => ({ name: d.name, size: d.size, uploaded: d.uploaded, type: d.type }));
}

// ─── Money Helper ────────────────────────────────────────────────────────────

export const money = (n: number) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
