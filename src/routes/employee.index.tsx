import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck2,
  Clock,
  LogIn,
  LogOut,
  Timer,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { EmployeeLayout } from "@/components/employee/EmployeeLayout";
import {
  EmptyState,
  LoadingRows,
  Panel,
  Pill,
  StatCard,
  StatusDot,
  type Tone,
} from "@/components/employee/primitives";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getActivity,
  getAttendanceSummary,
  getEmployee,
  getLeaveBalances,
  getLeaveRequestsData,
  getNetPay,
  getSalary,
  money,
} from "@/lib/employee-data";

export const Route = createFileRoute("/employee/")({
  head: () => ({
    meta: [
      { title: "Employee Dashboard — Workora HRMS" },
      {
        name: "description",
        content: "Track attendance, view salary, check leave balance and manage daily work.",
      },
      { property: "og:title", content: "Employee Dashboard — Workora HRMS" },
      { property: "og:description", content: "Your daily work hub on Workora." },
    ],
  }),
  component: EmployeeDashboard,
});

const statusTone: Record<string, Tone> = {
  approved: "success",
  pending: "pending",
  rejected: "warning",
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function EmployeeDashboard() {
  const employee = getEmployee();
  const activity = getActivity();
  const salary = getSalary();
  const netPay = getNetPay();
  const attendanceSummary = getAttendanceSummary();
  const leaveBalances = getLeaveBalances();
  const leaveRequests = getLeaveRequestsData();
  const [loading, setLoading] = useState(true);
  const [checkedIn, setCheckedIn] = useState(() => {
    const stored = localStorage.getItem("workora-checkin");
    if (stored) {
      const d = new Date(stored);
      return d.toDateString() === new Date().toDateString();
    }
    return false;
  });
  const [checkedOut, setCheckedOut] = useState(() => localStorage.getItem("workora-checkout") === "true");
  const [checkInTime, setCheckInTime] = useState<Date | null>(() => {
    const stored = localStorage.getItem("workora-checkin");
    if (stored) {
      const d = new Date(stored);
      if (d.toDateString() === new Date().toDateString()) return d;
    }
    return null;
  });
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    setNow(new Date());
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearTimeout(t);
      clearInterval(i);
    };
  }, []);

  const clock = now
    ? now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "--:--:--";

  const statusTonePresent: Tone = checkedOut ? "info" : checkedIn ? "success" : "warning";
  const statusLabel = checkedOut ? "Checked out" : checkedIn ? "Present in office" : "Not checked in";

  return (
    <EmployeeLayout
      title={`${greeting()}, ${employee.firstName}`}
      subtitle={`${employee.designation} · ${employee.department} · ${employee.id}`}
      actions={
        <Button asChild size="sm" className="hidden rounded-lg sm:inline-flex">
          <Link to="/employee/leave">Request leave</Link>
        </Button>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          {/* Today's status + check in/out */}
          <section className="overflow-hidden rounded-2xl border border-border bg-brand-gradient p-5 text-primary-foreground shadow-lift sm:p-6">
            <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="min-w-0">
                <p className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium">
                  <span
                    className={`h-2 w-2 rounded-full ${checkedOut ? "bg-info" : checkedIn ? "bg-success" : "bg-warning"}`}
                  />
                  {statusLabel}
                </p>
                <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">{clock}</p>
                <p className="mt-1 text-sm text-primary-foreground/80">
                  {now
                    ? now.toLocaleDateString("en-IN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Loading date…"}{" "}
                  · Shift {employee.shift}
                </p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <span>
                    <span className="text-primary-foreground/70">Check-in </span>
                    {checkedIn && checkInTime
                      ? checkInTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </span>
                  <span>
                    <span className="text-primary-foreground/70">Check-out </span>
                    {checkedOut ? new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                  </span>
                  <span>
                    <span className="text-primary-foreground/70">Worked </span>
                    {checkedIn && checkInTime
                      ? (() => {
                          const ms = Date.now() - checkInTime.getTime();
                          const h = Math.floor(ms / 3600000);
                          const m = Math.floor((ms % 3600000) / 60000);
                          return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
                        })()
                      : "00h 00m"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 sm:flex-col">
                <Button
                  variant="secondary"
                  className="flex-1 rounded-xl"
                  disabled={checkedIn}
                  onClick={() => {
                    const now = new Date();
                    setCheckedIn(true);
                    setCheckInTime(now);
                    localStorage.setItem("workora-checkin", now.toISOString());
                    toast.success(`Checked in at ${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`, {
                      description: `Have a productive day, ${employee.firstName}.`,
                    });
                  }}
                >
                  <LogIn className="h-4 w-4" /> Check In
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 rounded-xl"
                  disabled={!checkedIn || checkedOut}
                  onClick={() => {
                    setCheckedOut(true);
                    localStorage.setItem("workora-checkout", "true");
                    toast.success(`Checked out at ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`, {
                      description: "Total hours logged today.",
                    });
                  }}
                >
                  <LogOut className="h-4 w-4" /> Check Out
                </Button>
              </div>
            </div>
          </section>

          {/* Working hours + attendance summary */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[118px] rounded-2xl" />
              ))
            ) : (
              <>
                <StatCard
                  label="Hours this week"
                  value="38h 40m"
                  hint="Target 45h"
                  tone="info"
                  icon={<Timer className="h-4 w-4" />}
                />
                <StatCard
                  label="Avg. daily hours"
                  value={attendanceSummary.avgHours}
                  hint={attendanceSummary.monthLabel}
                  tone="success"
                  icon={<Clock className="h-4 w-4" />}
                />
                <StatCard
                  label="Days present"
                  value={`${attendanceSummary.present}/${attendanceSummary.present + attendanceSummary.absent + attendanceSummary.leave}`}
                  hint={`${attendanceSummary.lateMarks} late marks`}
                  tone="pending"
                  icon={<TrendingUp className="h-4 w-4" />}
                />
                <StatCard
                  label="Net pay (Jul)"
                  value={money(netPay)}
                  hint="Credited 31 Jul 2026"
                  tone="warning"
                  icon={<Wallet className="h-4 w-4" />}
                />
              </>
            )}
          </div>

          <Panel
            title="Attendance summary"
            description={attendanceSummary.monthLabel}
            action={
              <Button asChild variant="ghost" size="sm" className="rounded-lg">
                <Link to="/employee/attendance">
                  View <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            }
          >
            {loading ? (
              <LoadingRows rows={2} />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { k: "Present", v: attendanceSummary.present, tone: "success" as Tone },
                  { k: "Work from home", v: attendanceSummary.wfh, tone: "info" as Tone },
                  { k: "On leave", v: attendanceSummary.leave, tone: "pending" as Tone },
                  { k: "Absent", v: attendanceSummary.absent, tone: "warning" as Tone },
                ].map((s) => (
                  <div key={s.k} className="rounded-xl border border-border p-4">
                    <div className="flex items-center gap-2">
                      <StatusDot tone={s.tone} />
                      <span className="truncate text-xs text-muted-foreground">{s.k}</span>
                    </div>
                    <p className="mt-2 text-xl font-semibold text-foreground">{s.v}</p>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel
            title="Recent leave requests"
            action={
              <Button asChild variant="ghost" size="sm" className="rounded-lg">
                <Link to="/employee/leave">
                  All requests <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            }
          >
            {loading ? (
              <LoadingRows rows={3} />
            ) : leaveRequests.length === 0 ? (
              <EmptyState
                title="No leave requests yet"
                description="When you apply for time off, your requests will show up here."
              />
            ) : (
              <ul className="divide-y divide-border">
                {leaveRequests.slice(0, 3).map((r) => (
                  <li
                    key={r.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {r.type} · {r.days} day{r.days > 1 ? "s" : ""}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {r.from} → {r.to} · {r.id}
                      </p>
                    </div>
                    <Pill tone={statusTone[r.status] ?? "muted"}>{r.status}</Pill>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* Right rail */}
        <div className="space-y-5">
          <Panel title="Quick actions">
            <div className="grid gap-2">
              {[
                { label: "Update my profile", to: "/employee/profile", icon: User },
                { label: "View attendance log", to: "/employee/attendance", icon: Clock },
                { label: "Apply for leave", to: "/employee/leave", icon: CalendarCheck2 },
              ].map((a) => (
                <Link
                  key={a.to}
                  to={a.to}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
                >
                  <a.icon className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate">{a.label}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="Leave balance" description="Financial year 2026-27">
            {loading ? (
              <LoadingRows rows={3} />
            ) : (
              <div className="space-y-4">
                {leaveBalances.map((b) => (
                  <div key={b.type}>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 text-sm">
                      <span className="truncate text-foreground">{b.type}</span>
                      <span className="text-muted-foreground">
                        {b.total - b.used}/{b.total} left
                      </span>
                    </div>
                    <Progress value={(b.used / b.total) * 100} className="mt-2 h-1.5" />
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel
            title="Salary summary"
            description="July 2026"
            action={
              <Button asChild variant="ghost" size="sm" className="rounded-lg">
                <Link to="/employee/payroll">Payslips</Link>
              </Button>
            }
          >
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Gross monthly</span>
                <span className="font-medium text-foreground">{money(salary.monthlyWage)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Deductions</span>
                <span className="font-medium text-foreground">
                  −{money(salary.deductions.reduce((s, d) => s + d.amount, 0))}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="font-medium text-foreground">Net pay</span>
                <span className="text-lg font-semibold text-success">{money(netPay)}</span>
              </div>
              <Pill tone="success">Credited on 31 Jul 2026</Pill>
            </div>
          </Panel>

          <Panel title="Recent activity & alerts">
            {loading ? (
              <LoadingRows rows={3} />
            ) : (
              <ul className="space-y-4">
                {activity.map((a) => (
                  <li key={a.title} className="flex gap-3">
                    <span className="mt-1.5">
                      <StatusDot tone={a.tone} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-foreground">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </EmployeeLayout>
  );
}
