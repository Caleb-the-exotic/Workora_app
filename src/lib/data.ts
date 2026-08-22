import { getInitials, getNameFromEmail } from "./auth";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface EmployeeRecord {
  employeeId: string;
  name: string;
  firstName: string;
  initials: string;
  email: string;
  designation: string;
  department: string;
  manager: string;
  location: string;
  jobType: "Full-time" | "Part-time" | "Contract" | "Intern";
  phone: string;
  joined: string;
  status: "Present" | "Absent" | "Half-day" | "On leave" | "Late" | "Work from home";
  leaveStatus: "None" | "On leave" | "Requested";
  checkIn: string;
  checkOut: string;
  hours: string;
  extra: string;
  monthlyWage: number;
  leaveBalance: { paid: number; sick: number; unpaid: number };
}

export interface AttendanceRecord {
  employeeId: string;
  date: string;
  day: string;
  checkIn: string;
  checkOut: string;
  hours: string;
  status: string;
}

export interface LeaveRequestRecord {
  id: string;
  employeeId: string;
  type: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: "approved" | "pending" | "rejected";
  appliedOn: string;
}

export interface LeaveBalanceRecord {
  employeeId: string;
  paid: { used: number; total: number };
  sick: { used: number; total: number };
  unpaid: { used: number; total: number };
}

export interface PayrollRecord {
  employeeId: string;
  month: number;
  year: number;
  monthlyWage: number;
  basic: number;
  hra: number;
  allowances: number;
  deductions: number;
  net: number;
  status: "Processed" | "Pending" | "Paid";
  creditedOn?: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  category: "approval" | "leave" | "attendance" | "payroll" | "system";
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

export interface DocumentRecord {
  id: string;
  employeeId: string;
  name: string;
  size: string;
  uploaded: string;
  type: string;
}

export interface HolidayRecord {
  date: string;
  name: string;
}

export interface OrgSettings {
  name: string;
  cin: string;
  gst: string;
  address: string;
  supportEmail: string;
  currency: string;
  timezone: string;
  fiscalYearStart: string;
  leavePolicy: {
    paid: number;
    sick: number;
    unpaid: number;
    maxCarryForward: number;
    minGapDays: number;
  };
  payrollConfig: {
    payday: string;
    cutoffDay: string;
    autoProcess: boolean;
    multiLocation: boolean;
  };
}

// ─── Keys ────────────────────────────────────────────────────────────────────

const KEYS = {
  employees: "workora-db-employees",
  attendance: "workora-db-attendance",
  leaveRequests: "workora-db-leave-requests",
  leaveBalances: "workora-db-leave-balances",
  payroll: "workora-db-payroll",
  notifications: "workora-db-notifications",
  documents: "workora-db-documents",
  holidays: "workora-db-holidays",
  orgSettings: "workora-db-org-settings",
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function load<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as T[];
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadOne<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") as T | null;
  } catch {
    return null;
  }
}

function saveOne<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

const SEED_EMPLOYEES: EmployeeRecord[] = [
  { employeeId: "DF-2041", name: "Ananya Sharma", firstName: "Ananya", initials: "AS", email: "ananya.sharma@workora.io", designation: "Senior Product Designer", department: "Design", manager: "Rohit Menon", location: "Bengaluru", jobType: "Full-time", phone: "+91 98450 22113", joined: "12 Feb 2022", status: "Present", leaveStatus: "None", checkIn: "09:26", checkOut: "18:41", hours: "9h 15m", extra: "0h 15m", monthlyWage: 90000, leaveBalance: { paid: 20, sick: 6, unpaid: 5 } },
  { employeeId: "DF-2042", name: "Rohit Menon", firstName: "Rohit", initials: "RM", email: "rohit.menon@workora.io", designation: "Engineering Manager", department: "Engineering", manager: "Kavya Iyer", location: "Bengaluru", jobType: "Full-time", phone: "+91 98450 22114", joined: "05 Jan 2021", status: "Present", leaveStatus: "None", checkIn: "09:12", checkOut: "18:50", hours: "9h 38m", extra: "0h 38m", monthlyWage: 180000, leaveBalance: { paid: 18, sick: 5, unpaid: 4 } },
  { employeeId: "DF-2043", name: "Kavya Iyer", firstName: "Kavya", initials: "KI", email: "kavya.iyer@workora.io", designation: "VP Engineering", department: "Leadership", manager: "CEO", location: "Bengaluru", jobType: "Full-time", phone: "+91 98450 22115", joined: "01 Mar 2020", status: "Work from home", leaveStatus: "None", checkIn: "—", checkOut: "—", hours: "—", extra: "—", monthlyWage: 320000, leaveBalance: { paid: 15, sick: 4, unpaid: 3 } },
  { employeeId: "DF-2044", name: "Arjun Nair", firstName: "Arjun", initials: "AN", email: "arjun.nair@workora.io", designation: "Senior Backend Engineer", department: "Engineering", manager: "Rohit Menon", location: "Bengaluru", jobType: "Full-time", phone: "+91 98450 22116", joined: "15 Jun 2022", status: "Late", leaveStatus: "None", checkIn: "10:15", checkOut: "19:02", hours: "8h 47m", extra: "0h", monthlyWage: 140000, leaveBalance: { paid: 22, sick: 7, unpaid: 5 } },
  { employeeId: "DF-2045", name: "Priya Raghavan", firstName: "Priya", initials: "PR", email: "priya.raghavan@workora.io", designation: "Payroll Analyst", department: "Finance", manager: "Aditya Verma", location: "Mumbai", jobType: "Full-time", phone: "+91 98450 22117", joined: "20 Sep 2023", status: "Present", leaveStatus: "None", checkIn: "09:30", checkOut: "18:30", hours: "9h 00m", extra: "0h", monthlyWage: 75000, leaveBalance: { paid: 24, sick: 8, unpaid: 5 } },
  { employeeId: "DF-2046", name: "Vikram Desai", firstName: "Vikram", initials: "VD", email: "vikram.desai@workora.io", designation: "Account Executive", department: "Sales", manager: "Neha Kulkarni", location: "Mumbai", jobType: "Full-time", phone: "+91 98450 22118", joined: "08 Jan 2024", status: "On leave", leaveStatus: "On leave", checkIn: "—", checkOut: "—", hours: "—", extra: "—", monthlyWage: 65000, leaveBalance: { paid: 21, sick: 9, unpaid: 5 } },
  { employeeId: "DF-2047", name: "Neha Kulkarni", firstName: "Neha", initials: "NK", email: "neha.kulkarni@workora.io", designation: "Content Lead", department: "Marketing", manager: "CEO", location: "Bengaluru", jobType: "Full-time", phone: "+91 98450 22119", joined: "12 Apr 2022", status: "Present", leaveStatus: "None", checkIn: "09:45", checkOut: "18:20", hours: "8h 35m", extra: "0h", monthlyWage: 85000, leaveBalance: { paid: 19, sick: 6, unpaid: 4 } },
  { employeeId: "DF-2048", name: "Sanjay Pillai", firstName: "Sanjay", initials: "SP", email: "sanjay.pillai@workora.io", designation: "QA Engineer", department: "Engineering", manager: "Rohit Menon", location: "Bengaluru", jobType: "Full-time", phone: "+91 98450 22120", joined: "03 Jul 2023", status: "Absent", leaveStatus: "None", checkIn: "—", checkOut: "—", hours: "—", extra: "—", monthlyWage: 70000, leaveBalance: { paid: 23, sick: 7, unpaid: 5 } },
  { employeeId: "DF-2049", name: "Meera Joshi", firstName: "Meera", initials: "MJ", email: "meera.joshi@workora.io", designation: "HR Officer", department: "HR", manager: "CEO", location: "Bengaluru", jobType: "Full-time", phone: "+91 98450 22121", joined: "18 Feb 2022", status: "Present", leaveStatus: "None", checkIn: "09:00", checkOut: "18:15", hours: "9h 15m", extra: "0h 15m", monthlyWage: 80000, leaveBalance: { paid: 20, sick: 6, unpaid: 4 } },
  { employeeId: "DF-2050", name: "Tanvi Rao", firstName: "Tanvi", initials: "TR", email: "tanvi.rao@workora.io", designation: "Product Designer", department: "Design", manager: "Ananya Sharma", location: "Bengaluru", jobType: "Full-time", phone: "+91 98450 22122", joined: "10 Aug 2023", status: "Present", leaveStatus: "None", checkIn: "09:33", checkOut: "18:05", hours: "8h 32m", extra: "0h", monthlyWage: 72000, leaveBalance: { paid: 22, sick: 8, unpaid: 5 } },
  { employeeId: "DF-2051", name: "Imran Sheikh", firstName: "Imran", initials: "IS", email: "imran.sheikh@workora.io", designation: "Frontend Engineer", department: "Engineering", manager: "Rohit Menon", location: "Bengaluru", jobType: "Full-time", phone: "+91 98450 22123", joined: "22 Nov 2022", status: "Half-day", leaveStatus: "None", checkIn: "09:21", checkOut: "13:30", hours: "4h 09m", extra: "0h", monthlyWage: 95000, leaveBalance: { paid: 21, sick: 7, unpaid: 5 } },
  { employeeId: "DF-2052", name: "Divya Menon", firstName: "Divya", initials: "DM", email: "divya.menon@workora.io", designation: "Customer Success Lead", department: "Support", manager: "CEO", location: "Hyderabad", jobType: "Full-time", phone: "+91 98450 22124", joined: "05 May 2022", status: "Present", leaveStatus: "None", checkIn: "09:18", checkOut: "18:42", hours: "9h 24m", extra: "0h 24m", monthlyWage: 88000, leaveBalance: { paid: 20, sick: 6, unpaid: 4 } },
  { employeeId: "DF-2053", name: "Karan Bhatia", firstName: "Karan", initials: "KB", email: "karan.bhatia@workora.io", designation: "Sales Development Rep", department: "Sales", manager: "Neha Kulkarni", location: "Mumbai", jobType: "Full-time", phone: "+91 98450 22125", joined: "14 Sep 2023", status: "On leave", leaveStatus: "On leave", checkIn: "—", checkOut: "—", hours: "—", extra: "—", monthlyWage: 55000, leaveBalance: { paid: 24, sick: 9, unpaid: 5 } },
  { employeeId: "DF-2054", name: "Ritika Sen", firstName: "Ritika", initials: "RS", email: "ritika.sen@workora.io", designation: "Growth Marketer", department: "Marketing", manager: "Neha Kulkarni", location: "Bengaluru", jobType: "Full-time", phone: "+91 98450 22126", joined: "01 Aug 2024", status: "Present", leaveStatus: "None", checkIn: "09:55", checkOut: "18:10", hours: "8h 15m", extra: "0h", monthlyWage: 68000, leaveBalance: { paid: 25, sick: 10, unpaid: 5 } },
  { employeeId: "DF-2055", name: "Aditya Verma", firstName: "Aditya", initials: "AV", email: "aditya.verma@workora.io", designation: "Financial Controller", department: "Finance", manager: "CEO", location: "Mumbai", jobType: "Full-time", phone: "+91 98450 22127", joined: "20 Mar 2021", status: "Present", leaveStatus: "None", checkIn: "09:05", checkOut: "18:55", hours: "9h 50m", extra: "0h 50m", monthlyWage: 160000, leaveBalance: { paid: 16, sick: 5, unpaid: 3 } },
  { employeeId: "DF-2056", name: "Sneha Kapoor", firstName: "Sneha", initials: "SK", email: "sneha.kapoor@workora.io", designation: "Support Specialist", department: "Support", manager: "Divya Menon", location: "Hyderabad", jobType: "Full-time", phone: "+91 98450 22128", joined: "12 Jun 2024", status: "Late", leaveStatus: "None", checkIn: "10:05", checkOut: "19:10", hours: "9h 05m", extra: "0h 05m", monthlyWage: 52000, leaveBalance: { paid: 24, sick: 8, unpaid: 5 } },
];

const SEED_ATTENDANCE: AttendanceRecord[] = [
  { employeeId: "DF-2041", date: "21 Aug 2026", day: "Friday", checkIn: "09:26", checkOut: "18:41", hours: "9h 15m", status: "Present" },
  { employeeId: "DF-2041", date: "20 Aug 2026", day: "Thursday", checkIn: "09:48", checkOut: "18:32", hours: "8h 44m", status: "Late" },
  { employeeId: "DF-2041", date: "19 Aug 2026", day: "Wednesday", checkIn: "09:21", checkOut: "13:30", hours: "4h 09m", status: "Half-day" },
  { employeeId: "DF-2041", date: "18 Aug 2026", day: "Tuesday", checkIn: "—", checkOut: "—", hours: "—", status: "On leave" },
  { employeeId: "DF-2041", date: "17 Aug 2026", day: "Monday", checkIn: "09:29", checkOut: "18:28", hours: "8h 59m", status: "Present" },
  { employeeId: "DF-2041", date: "14 Aug 2026", day: "Friday", checkIn: "09:33", checkOut: "18:05", hours: "8h 32m", status: "Present" },
  { employeeId: "DF-2041", date: "13 Aug 2026", day: "Thursday", checkIn: "—", checkOut: "—", hours: "—", status: "Absent" },
];

const SEED_LEAVE_REQUESTS: LeaveRequestRecord[] = [
  { id: "LV-3391", employeeId: "DF-2041", type: "Casual leave", from: "18 Aug 2026", to: "18 Aug 2026", days: 1, reason: "Family function at home", status: "approved", appliedOn: "12 Aug 2026" },
  { id: "LV-3402", employeeId: "DF-2041", type: "Earned leave", from: "02 Sep 2026", to: "05 Sep 2026", days: 4, reason: "Planned vacation to Coorg", status: "pending", appliedOn: "19 Aug 2026" },
  { id: "LV-3288", employeeId: "DF-2041", type: "Sick leave", from: "29 Jul 2026", to: "30 Jul 2026", days: 2, reason: "Viral fever, doctor advised rest", status: "approved", appliedOn: "29 Jul 2026" },
  { id: "LV-3204", employeeId: "DF-2041", type: "Casual leave", from: "11 Jul 2026", to: "12 Jul 2026", days: 2, reason: "Personal work", status: "rejected", appliedOn: "08 Jul 2026" },
  { id: "LV-3407", employeeId: "DF-2048", type: "Sick leave", from: "22 Aug 2026", to: "24 Aug 2026", days: 3, reason: "High fever and cold", status: "pending", appliedOn: "22 Aug 2026" },
  { id: "LV-3409", employeeId: "DF-2044", type: "Unpaid leave", from: "25 Aug 2026", to: "25 Aug 2026", days: 1, reason: "Personal errand", status: "pending", appliedOn: "22 Aug 2026" },
  { id: "LV-3411", employeeId: "DF-2050", type: "Casual leave", from: "26 Aug 2026", to: "28 Aug 2026", days: 3, reason: "Family wedding", status: "pending", appliedOn: "21 Aug 2026" },
  { id: "LV-3396", employeeId: "DF-2046", type: "Paid time off", from: "15 Aug 2026", to: "17 Aug 2026", days: 3, reason: "Weekend getaway", status: "approved", appliedOn: "10 Aug 2026" },
  { id: "LV-3381", employeeId: "DF-2054", type: "Casual leave", from: "01 Aug 2026", to: "05 Aug 2026", days: 5, reason: "Vacation", status: "rejected", appliedOn: "25 Jul 2026" },
];

const SEED_PAYROLL: PayrollRecord[] = [
  { employeeId: "DF-2041", month: 7, year: 2026, monthlyWage: 90000, basic: 45000, hra: 18000, allowances: 27000, deductions: 12450, net: 77550, status: "Paid", creditedOn: "31 Jul 2026" },
  { employeeId: "DF-2041", month: 6, year: 2026, monthlyWage: 90000, basic: 45000, hra: 18000, allowances: 27000, deductions: 12450, net: 77550, status: "Paid", creditedOn: "30 Jun 2026" },
  { employeeId: "DF-2041", month: 5, year: 2026, monthlyWage: 90000, basic: 45000, hra: 18000, allowances: 27000, deductions: 13650, net: 76350, status: "Paid", creditedOn: "31 May 2026" },
  { employeeId: "DF-2041", month: 4, year: 2026, monthlyWage: 90000, basic: 45000, hra: 18000, allowances: 27000, deductions: 13650, net: 76350, status: "Paid", creditedOn: "30 Apr 2026" },
];

const SEED_DOCUMENTS: DocumentRecord[] = [
  { id: "DOC-001", employeeId: "DF-2041", name: "Offer letter.pdf", size: "218 KB", uploaded: "10 Feb 2022", type: "Onboarding" },
  { id: "DOC-002", employeeId: "DF-2041", name: "Aadhaar card.pdf", size: "440 KB", uploaded: "14 Feb 2022", type: "Identity" },
  { id: "DOC-003", employeeId: "DF-2041", name: "PAN card.pdf", size: "180 KB", uploaded: "14 Feb 2022", type: "Identity" },
  { id: "DOC-004", employeeId: "DF-2041", name: "Form 16 — FY 2025-26.pdf", size: "512 KB", uploaded: "22 Jun 2026", type: "Tax" },
];

const SEED_HOLIDAYS: HolidayRecord[] = [
  { date: "2026-01-01", name: "New Year's Day" },
  { date: "2026-01-26", name: "Republic Day" },
  { date: "2026-03-10", name: "Holi" },
  { date: "2026-04-03", name: "Good Friday" },
  { date: "2026-05-01", name: "May Day" },
  { date: "2026-08-15", name: "Independence Day" },
  { date: "2026-10-02", name: "Gandhi Jayanti" },
  { date: "2026-10-20", name: "Dussehra" },
  { date: "2026-11-08", name: "Diwali" },
  { date: "2026-12-25", name: "Christmas Day" },
];

const SEED_ORG_SETTINGS: OrgSettings = {
  name: "Workora Technologies Pvt. Ltd.",
  cin: "U72200KA2022PTC158492",
  gst: "29AABCU9603R1ZX",
  address: "Tower 4, 6th Floor, Prestige Tech Park, Outer Ring Road, Bellandur, Bengaluru 560103",
  supportEmail: "hr@workora.io",
  currency: "INR (₹)",
  timezone: "Asia/Kolkata (GMT+5:30)",
  fiscalYearStart: "April",
  leavePolicy: { paid: 24, sick: 10, unpaid: 12, maxCarryForward: 90, minGapDays: 2 },
  payrollConfig: { payday: "30", cutoffDay: "25", autoProcess: true, multiLocation: true },
};

// ─── Initialize ──────────────────────────────────────────────────────────────

export function seedDatabase() {
  if (!localStorage.getItem(KEYS.employees)) save(KEYS.employees, SEED_EMPLOYEES);
  if (!localStorage.getItem(KEYS.attendance)) save(KEYS.attendance, SEED_ATTENDANCE);
  if (!localStorage.getItem(KEYS.leaveRequests)) save(KEYS.leaveRequests, SEED_LEAVE_REQUESTS);
  if (!localStorage.getItem(KEYS.payroll)) save(KEYS.payroll, SEED_PAYROLL);
  if (!localStorage.getItem(KEYS.documents)) save(KEYS.documents, SEED_DOCUMENTS);
  if (!localStorage.getItem(KEYS.holidays)) save(KEYS.holidays, SEED_HOLIDAYS);
  if (!localStorage.getItem(KEYS.orgSettings)) saveOne(KEYS.orgSettings, SEED_ORG_SETTINGS);
  if (!localStorage.getItem(KEYS.leaveBalances)) {
    const balances: LeaveBalanceRecord[] = SEED_EMPLOYEES.map((e) => ({
      employeeId: e.employeeId,
      paid: { used: 30 - e.leaveBalance.paid, total: 30 },
      sick: { used: 10 - e.leaveBalance.sick, total: 10 },
      unpaid: { used: 5 - e.leaveBalance.unpaid, total: 5 },
    }));
    save(KEYS.leaveBalances, balances);
  }
  if (!localStorage.getItem(KEYS.notifications)) {
    const notifs: NotificationRecord[] = [
      { id: "N-001", userId: "DF-2041", category: "leave", title: "Leave request pending approval", body: "LV-3402 (02–05 Sep) is awaiting action from Rohit Menon.", time: "Today, 08:15", unread: true },
      { id: "N-002", userId: "DF-2041", category: "payroll", title: "Payslip available", body: "Your July 2026 payslip has been published and credited.", time: "Yesterday, 18:02", unread: true },
      { id: "N-003", userId: "DF-2041", category: "attendance", title: "Attendance regularisation needed", body: "Check-out missing for 13 Aug 2026. Submit a correction request.", time: "18 Aug, 10:41", unread: false },
      { id: "N-004", userId: "DF-2041", category: "system", title: "Policy update", body: "Work-from-home policy revised — up to 6 days per month.", time: "12 Aug, 09:00", unread: false },
    ];
    save(KEYS.notifications, notifs);
  }
}

// ─── Employee API ────────────────────────────────────────────────────────────

export function getEmployees(): EmployeeRecord[] {
  return load<EmployeeRecord>(KEYS.employees);
}

export function getEmployeeById(id: string): EmployeeRecord | undefined {
  return getEmployees().find((e) => e.employeeId === id);
}

export function getEmployeeByEmail(email: string): EmployeeRecord | undefined {
  return getEmployees().find((e) => e.email.toLowerCase() === email.toLowerCase());
}

export function addEmployee(emp: EmployeeRecord) {
  const all = getEmployees();
  all.push(emp);
  save(KEYS.employees, all);
}

export function updateEmployee(id: string, updates: Partial<EmployeeRecord>) {
  const all = getEmployees();
  const idx = all.findIndex((e) => e.employeeId === id);
  if (idx !== -1) {
    all[idx] = { ...all[idx], ...updates };
    save(KEYS.employees, all);
  }
}

// ─── Attendance API ──────────────────────────────────────────────────────────

export function getAttendance(employeeId: string): AttendanceRecord[] {
  return load<AttendanceRecord>(KEYS.attendance).filter((a) => a.employeeId === employeeId);
}

export function getAllAttendance(): AttendanceRecord[] {
  return load<AttendanceRecord>(KEYS.attendance);
}

export function addAttendance(rec: AttendanceRecord) {
  const all = load<AttendanceRecord>(KEYS.attendance);
  all.push(rec);
  save(KEYS.attendance, all);
}

// ─── Leave API ───────────────────────────────────────────────────────────────

export function getLeaveRequests(employeeId?: string): LeaveRequestRecord[] {
  const all = load<LeaveRequestRecord>(KEYS.leaveRequests);
  return employeeId ? all.filter((l) => l.employeeId === employeeId) : all;
}

export function addLeaveRequest(req: LeaveRequestRecord) {
  const all = load<LeaveRequestRecord>(KEYS.leaveRequests);
  all.push(req);
  save(KEYS.leaveRequests, all);
}

export function updateLeaveRequest(id: string, updates: Partial<LeaveRequestRecord>) {
  const all = load<LeaveRequestRecord>(KEYS.leaveRequests);
  const idx = all.findIndex((l) => l.id === id);
  if (idx !== -1) {
    all[idx] = { ...all[idx], ...updates };
    save(KEYS.leaveRequests, all);
  }
}

export function getLeaveBalance(employeeId: string): LeaveBalanceRecord | undefined {
  return load<LeaveBalanceRecord>(KEYS.leaveBalances).find((b) => b.employeeId === employeeId);
}

export function updateLeaveBalance(employeeId: string, updates: Partial<LeaveBalanceRecord>) {
  const all = load<LeaveBalanceRecord>(KEYS.leaveBalances);
  const idx = all.findIndex((b) => b.employeeId === employeeId);
  if (idx !== -1) {
    all[idx] = { ...all[idx], ...updates };
    save(KEYS.leaveBalances, all);
  }
}

export function addNotification(rec: NotificationRecord) {
  const all = load<NotificationRecord>(KEYS.notifications);
  all.push(rec);
  save(KEYS.notifications, all);
}

// ─── Payroll API ─────────────────────────────────────────────────────────────

export function getPayroll(employeeId: string): PayrollRecord[] {
  return load<PayrollRecord>(KEYS.payroll).filter((p) => p.employeeId === employeeId);
}

export function getAllPayroll(): PayrollRecord[] {
  return load<PayrollRecord>(KEYS.payroll);
}

// ─── Notifications API ───────────────────────────────────────────────────────

export function getNotifications(userId: string): NotificationRecord[] {
  return load<NotificationRecord>(KEYS.notifications).filter((n) => n.userId === userId);
}

export function getHRNotifications(): NotificationRecord[] {
  return load<NotificationRecord>(KEYS.notifications).filter((n) => n.category === "approval" || n.category === "system");
}

export function markNotificationRead(id: string) {
  const all = load<NotificationRecord>(KEYS.notifications);
  const idx = all.findIndex((n) => n.id === id);
  if (idx !== -1) {
    all[idx].unread = false;
    save(KEYS.notifications, all);
  }
}

export function markAllRead(userId: string) {
  const all = load<NotificationRecord>(KEYS.notifications);
  all.forEach((n) => { if (n.userId === userId) n.unread = false; });
  save(KEYS.notifications, all);
}

// ─── Documents API ───────────────────────────────────────────────────────────

export function getDocuments(employeeId: string): DocumentRecord[] {
  return load<DocumentRecord>(KEYS.documents).filter((d) => d.employeeId === employeeId);
}

// ─── Holidays API ────────────────────────────────────────────────────────────

export function getHolidays(): HolidayRecord[] {
  return load<HolidayRecord>(KEYS.holidays);
}

// ─── Org Settings API ────────────────────────────────────────────────────────

export function getOrgSettings(): OrgSettings {
  return loadOne<OrgSettings>(KEYS.orgSettings) || SEED_ORG_SETTINGS;
}

export function updateOrgSettings(settings: OrgSettings) {
  saveOne(KEYS.orgSettings, settings);
}

// ─── Stats Helpers ───────────────────────────────────────────────────────────

export function getOrgStats() {
  const employees = getEmployees();
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const todayAtt = load<AttendanceRecord>(KEYS.attendance).filter((a) => a.date === today);
  const pendingLeaves = load<LeaveRequestRecord>(KEYS.leaveRequests).filter((l) => l.status === "pending");

  return {
    total: employees.length,
    present: todayAtt.filter((a) => a.status === "Present" || a.status === "Late").length,
    absent: todayAtt.filter((a) => a.status === "Absent").length,
    onLeave: todayAtt.filter((a) => a.status === "On leave").length,
    pending: pendingLeaves.length,
  };
}

export function getDepartments(): string[] {
  return [...new Set(getEmployees().map((e) => e.department))];
}

export function getDepartmentHeadcount() {
  const depts: Record<string, number> = {};
  getEmployees().forEach((e) => { depts[e.department] = (depts[e.department] || 0) + 1; });
  return Object.entries(depts).map(([department, count]) => ({ department, count }));
}

export function getAttendanceTrend() {
  const all = load<AttendanceRecord>(KEYS.attendance);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day) => {
    const dayRecs = all.filter((a) => a.day === day);
    return {
      day,
      present: dayRecs.filter((a) => a.status === "Present" || a.status === "Late").length,
      absent: dayRecs.filter((a) => a.status === "Absent").length,
      leave: dayRecs.filter((a) => a.status === "On leave").length,
    };
  });
}

export function getLeaveTrend() {
  const all = load<LeaveRequestRecord>(KEYS.leaveRequests);
  const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  return months.map((month) => ({
    month,
    requests: all.length,
    approved: all.filter((l) => l.status === "approved").length,
  }));
}

export function getPayrollRows() {
  const employees = getEmployees();
  const allPayroll = load<PayrollRecord>(KEYS.payroll);
  return employees.map((emp) => {
    const pay = allPayroll.find((p) => p.employeeId === emp.employeeId && p.month === 8 && p.year === 2026);
    return {
      id: emp.employeeId,
      name: emp.name,
      initials: emp.initials,
      department: emp.department,
      role: emp.designation,
      monthlyWage: emp.monthlyWage,
      basic: emp.monthlyWage * 0.5,
      hra: emp.monthlyWage * 0.2,
      allowances: emp.monthlyWage * 0.3,
      deductions: Math.round(emp.monthlyWage * 0.14),
      net: Math.round(emp.monthlyWage * 0.86),
      status: (pay?.status || "Pending") as "Processed" | "Pending" | "Paid",
      accuracy: 98 + Math.round(Math.random() * 2),
      issues: [] as string[],
    };
  });
}
