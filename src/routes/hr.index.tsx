import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CalendarCheck2,
  CalendarPlus,
  ClipboardList,
  Clock3,
  FileSpreadsheet,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Panel, Pill, StatCard } from "@/components/employee/primitives";
import { HRLayout } from "@/components/hr/HRLayout";
import { Button } from "@/components/ui/button";
import {
  leaveApprovals,
  recentActivity,
} from "@/lib/hr-data";
import { getOrgStats, getDepartmentHeadcount, getAttendanceTrend, getLeaveTrend } from "@/lib/data";

export const Route = createFileRoute("/hr/")({
  head: () => ({
    meta: [
      { title: "HR Dashboard — Workora HRMS" },
      {
        name: "description",
        content:
          "Headcount, attendance, leave approvals and payroll insights for admins and HR officers.",
      },
      { property: "og:title", content: "HR Dashboard — Workora HRMS" },
      { property: "og:description", content: "People operations command centre on Workora." },
    ],
  }),
  component: HRDashboard,
});

const quickActions = [
  { label: "Add employee", icon: UserPlus, to: "/hr/employees" as const },
  { label: "Mark attendance", icon: Clock3, to: "/hr/attendance" as const },
  { label: "Review leave", icon: CalendarPlus, to: "/hr/approvals" as const },
  { label: "Run payroll", icon: FileSpreadsheet, to: "/hr/payroll" as const },
];

function HRDashboard() {
  const orgStats = getOrgStats();
  const departmentHeadcount = getDepartmentHeadcount();
  const attendanceTrend = getAttendanceTrend();
  const leaveTrend = getLeaveTrend();
  const pending = leaveApprovals.filter((r) => r.status === "pending");

  return (
    <HRLayout
      title="People operations overview"
      subtitle="Saturday, 22 August 2026 · All locations"
      actions={
        <Button size="sm" className="rounded-lg" asChild>
          <Link to="/hr/approvals">
            <ClipboardList className="h-4 w-4" /> Review approvals
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total employees" value={String(orgStats.total)} hint="+6 this month" tone="info" icon={<Users className="h-4 w-4" />} />
        <StatCard label="Present today" value={String(orgStats.present)} hint="85.5% attendance" tone="success" icon={<Clock3 className="h-4 w-4" />} />
        <StatCard label="Absent today" value={String(orgStats.absent)} hint="3 unapproved" tone="warning" icon={<Users className="h-4 w-4" />} />
        <StatCard label="On leave" value={String(orgStats.onLeave)} hint="14 paid · 8 sick" tone="pending" icon={<CalendarCheck2 className="h-4 w-4" />} />
        <StatCard label="Pending approvals" value={String(pending.length)} hint="Oldest 2 days" tone="warning" icon={<ClipboardList className="h-4 w-4" />} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title="Attendance overview" description="Present, absent and leave counts this week">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceTrend} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={34} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                    fontSize: 12,
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="present" name="Present" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="leave" name="On leave" fill="var(--color-pending)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Quick actions" description="Frequent HR tasks">
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="flex flex-col items-start gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-secondary/60"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <a.icon className="h-4.5 w-4.5" />
                </span>
                <span className="text-sm font-medium text-foreground">{a.label}</span>
              </Link>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-border bg-secondary/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Payroll cut-off
            </p>
            <p className="mt-1.5 text-sm text-foreground">
              August payroll locks on <span className="font-semibold">25 Aug 2026</span>. 248
              employees included.
            </p>
            <Button variant="outline" size="sm" className="mt-3 rounded-lg" asChild>
              <Link to="/hr/payroll">
                Open payroll <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title="Leave request trend" description="Requests vs approvals over 6 months">
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={leaveTrend}>
                <defs>
                  <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-info)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-info)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={34} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                    fontSize: 12,
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="requests" name="Requests" stroke="var(--color-info)" fill="url(#reqGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="approved" name="Approved" stroke="var(--color-success)" fill="url(#appGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Recent employee activity" description="Last 24 hours across the organisation">
          <ul className="space-y-3">
            {recentActivity.map((a, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-border p-3">
                <Pill tone={a.tone}>{a.who.split(" ")[0]}</Pill>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{a.who}</span> {a.what}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel
        title="Pending approval queue"
        description="Requests waiting on admin or HR action"
        className="mt-4"
        action={
          <Button variant="outline" size="sm" className="rounded-lg" asChild>
            <Link to="/hr/approvals">Open queue</Link>
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 font-medium">Request</th>
                <th className="pb-2 font-medium">Employee</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Dates</th>
                <th className="pb-2 font-medium">Days</th>
                <th className="pb-2 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pending.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-secondary/60">
                  <td className="py-3 font-medium text-foreground">{r.id}</td>
                  <td className="py-3 text-foreground">
                    {r.employee}
                    <span className="block text-xs text-muted-foreground">{r.department}</span>
                  </td>
                  <td className="py-3 text-muted-foreground">{r.type}</td>
                  <td className="py-3 text-foreground">
                    {r.from} → {r.to}
                  </td>
                  <td className="py-3 tabular-nums text-foreground">{r.days}</td>
                  <td className="py-3 text-right">
                    <Button variant="outline" size="sm" className="rounded-lg" asChild>
                      <Link to="/hr/approvals">Review</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </HRLayout>
  );
}
