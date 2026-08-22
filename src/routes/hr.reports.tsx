import { createFileRoute } from "@tanstack/react-router";
import { Download, TrendingUp, Users, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Panel, StatCard } from "@/components/employee/primitives";
import { HRLayout } from "@/components/hr/HRLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { money } from "@/lib/hr-data";
import { getDepartments, getLeaveTrend } from "@/lib/data";
import {
  attendanceDistribution,
  headcountTrend,
  leaveTypeDistribution,
  monthlyAttendance,
  payrollOverview,
  payrollTotals,
  salaryStats,
} from "@/lib/hr-payroll";

export const Route = createFileRoute("/hr/reports")({
  head: () => ({
    meta: [
      { title: "Reports & Analytics — Workora HRMS" },
      {
        name: "description",
        content:
          "Attendance trends, leave analytics, payroll overview, salary statistics and headcount growth.",
      },
      { property: "og:title", content: "Reports & Analytics — Workora HRMS" },
      { property: "og:description", content: "People analytics for data-driven HR decisions on Workora." },
    ],
  }),
  component: ReportsPage,
});

const axis = {
  stroke: "var(--muted-foreground)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  fontSize: "12px",
  color: "var(--foreground)",
};

function ReportsPage() {
  const departments = getDepartments();
  const leaveTrend = getLeaveTrend();
  const [range, setRange] = useState("6m");
  const [dept, setDept] = useState("all");

  return (
    <HRLayout
      title="Reports & Analytics"
      subtitle="People, attendance and payroll insights"
      actions={
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={() => toast.success("Analytics pack exported as PDF")}
        >
          <Download className="h-4 w-4" /> <span className="hidden sm:inline">Export</span>
        </Button>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="h-9 w-[170px]" aria-label="Date range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">Last 30 days</SelectItem>
            <SelectItem value="3m">Last 3 months</SelectItem>
            <SelectItem value="6m">Last 6 months</SelectItem>
            <SelectItem value="12m">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dept} onValueChange={setDept}>
          <SelectTrigger className="h-9 w-[180px]" aria-label="Department filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Avg. attendance"
          value="93%"
          hint="+1.4 pts vs last period"
          tone="success"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label="Leave utilisation"
          value="62%"
          hint="231 days consumed"
          tone="pending"
        />
        <StatCard
          label="Monthly payroll"
          value={money(payrollTotals.gross)}
          hint="Gross across all departments"
          tone="info"
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatCard
          label="Headcount"
          value="248"
          hint="+4 joiners this month"
          tone="info"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel title="Attendance trends" description="Monthly present / late / absent share">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyAttendance}>
                <defs>
                  <linearGradient id="gPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--success)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--success)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" {...axis} />
                <YAxis {...axis} />
                <RTooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="present"
                  stroke="var(--success)"
                  fill="url(#gPresent)"
                  strokeWidth={2}
                />
                <Line type="monotone" dataKey="late" stroke="var(--warning)" strokeWidth={2} dot={false} />
                <Line
                  type="monotone"
                  dataKey="absent"
                  stroke="var(--destructive)"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Attendance distribution" description="Today across the organisation">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={3}
                >
                  {attendanceDistribution.map((d) => (
                    <Cell key={d.name} fill={d.tone} />
                  ))}
                </Pie>
                <RTooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Leave trends" description="Requests vs approvals">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaveTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" {...axis} />
                <YAxis {...axis} />
                <RTooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="requests" fill="var(--info)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="approved" fill="var(--success)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Leave type distribution" description="Days consumed this year">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leaveTypeDistribution}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={92}
                  paddingAngle={3}
                >
                  {leaveTypeDistribution.map((d) => (
                    <Cell key={d.name} fill={d.tone} />
                  ))}
                </Pie>
                <RTooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Payroll overview" description="Gross vs net payout (₹ crore)">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={payrollOverview}>
                <defs>
                  <linearGradient id="gGross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--info)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--info)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" {...axis} />
                <YAxis {...axis} />
                <RTooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="gross"
                  stroke="var(--info)"
                  fill="url(#gGross)"
                  strokeWidth={2}
                />
                <Line type="monotone" dataKey="net" stroke="var(--pending)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Salary statistics" description="Across all active employees">
          <dl className="grid gap-3 sm:grid-cols-2">
            {[
              ["Median salary", money(salaryStats.median)],
              ["Average salary", money(salaryStats.average)],
              ["Highest", money(salaryStats.highest)],
              ["Lowest", money(salaryStats.lowest)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-border p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {k}
                </dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">Salary band: {salaryStats.band}</p>
        </Panel>
      </div>

      <Panel className="mt-6" title="Employee count trends" description="Headcount, joiners and exits">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={headcountTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" {...axis} />
              <YAxis {...axis} />
              <RTooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="employees"
                stroke="var(--primary)"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
              <Line type="monotone" dataKey="joiners" stroke="var(--success)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="exits" stroke="var(--warning)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </HRLayout>
  );
}
