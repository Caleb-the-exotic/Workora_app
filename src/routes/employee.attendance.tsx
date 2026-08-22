import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  LogIn,
  LogOut,
  Timer,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { EmployeeLayout } from "@/components/employee/EmployeeLayout";
import { EmptyState, Panel, Pill, StatCard, type Tone } from "@/components/employee/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { attendanceLog, attendanceSummary } from "@/lib/employee-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/employee/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance — Workora HRMS" },
      {
        name: "description",
        content: "Track daily check-in, check-out, working hours and monthly attendance summary.",
      },
      { property: "og:title", content: "Attendance — Workora HRMS" },
      { property: "og:description", content: "Track your attendance on Workora." },
    ],
  }),
  component: AttendancePage,
});

const statusTone: Record<string, Tone> = {
  Present: "success",
  Late: "warning",
  "Half-day": "warning",
  "Half day": "warning",
  "Work from home": "info",
  "On leave": "pending",
  Absent: "warning",
};

const filters = ["All", "Present", "Late", "Half-day", "On leave", "Absent"] as const;

const timeline = [
  { label: "Shift starts", time: "09:30", done: true },
  { label: "Checked in", time: "09:24", done: true },
  { label: "Break", time: "13:10 – 13:45", done: true },
  { label: "Back from break", time: "13:45", done: true },
  { label: "Shift ends", time: "18:30", done: false },
];

const week = [
  { day: "Mon", date: "17", hours: 8.9, status: "Present" },
  { day: "Tue", date: "18", hours: 0, status: "On leave" },
  { day: "Wed", date: "19", hours: 8.8, status: "Work from home" },
  { day: "Thu", date: "20", hours: 8.7, status: "Late" },
  { day: "Fri", date: "21", hours: 9.2, status: "Present" },
  { day: "Sat", date: "22", hours: 0, status: "Today" },
  { day: "Sun", date: "23", hours: 0, status: "Weekend" },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [checkedInAt, setCheckedInAt] = useState<Date | null>(null);
  const [checkedOut, setCheckedOut] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  const duration = useMemo(() => {
    if (!checkedInAt) return "00:00:00";
    const ms = now.getTime() - checkedInAt.getTime();
    const s = Math.max(0, Math.floor(ms / 1000));
    return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  }, [checkedInAt, now]);

  const parse = (label: string) => new Date(label).getTime();

  const rows = attendanceLog
    .filter((r) => (filter === "All" ? true : r.status === filter))
    .filter((r) => (dateFrom ? parse(r.date) >= new Date(dateFrom).getTime() : true))
    .filter((r) => (dateTo ? parse(r.date) <= new Date(dateTo).getTime() : true));

  const handleCheckIn = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    setCheckedInAt(new Date());
    setBusy(false);
    toast.success("Checked in", { description: `Your day started at ${new Date().toLocaleTimeString()}` });
  };

  const handleCheckOut = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    setCheckedOut(true);
    setBusy(false);
    toast.success("Checked out", { description: `Total working duration ${duration}` });
  };

  return (
    <EmployeeLayout
      title="Attendance"
      subtitle={`${attendanceSummary.monthLabel} · shift 09:30 – 18:30`}
      actions={
        <Button
          size="sm"
          variant="outline"
          className="rounded-lg"
          onClick={() => toast.success("Attendance report exported as CSV")}
        >
          <Download className="h-4 w-4" /> Export
        </Button>
      }
    >
      {/* Today card — visually prominent */}
      <section className="rounded-2xl border-2 border-primary/30 bg-brand-gradient/5 p-5 shadow-card">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="info">Today</Pill>
              <span className="text-sm font-medium text-foreground">
                {now.toLocaleDateString(undefined, {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <Pill tone={checkedOut ? "success" : checkedInAt ? "info" : "muted"}>
                {checkedOut ? "Day completed" : checkedInAt ? "Working" : "Not checked in"}
              </Pill>
            </div>

            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Current working duration
            </p>
            <p className="mt-1 text-4xl font-semibold tabular-nums tracking-tight text-foreground">
              {checkedOut ? "08:57:12" : duration}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {checkedInAt
                ? `Checked in at ${checkedInAt.toLocaleTimeString()}`
                : "Check in to start tracking your working hours."}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                className="rounded-lg"
                disabled={!!checkedInAt || busy}
                onClick={handleCheckIn}
              >
                <LogIn className="h-4 w-4" /> {busy && !checkedInAt ? "Checking in…" : "Check in"}
              </Button>
              <Button
                variant="outline"
                className="rounded-lg"
                disabled={!checkedInAt || checkedOut || busy}
                onClick={handleCheckOut}
              >
                <LogOut className="h-4 w-4" /> {checkedOut ? "Checked out" : "Check out"}
              </Button>
            </div>
          </div>

          {/* Daily timeline */}
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Daily timeline
            </p>
            <ol className="mt-3 space-y-3">
              {timeline.map((t) => (
                <li key={t.label} className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                      t.done ? "bg-success" : "bg-muted-foreground/40",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{t.label}</p>
                    <p className="text-xs tabular-nums text-muted-foreground">{t.time}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[118px] rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard
              label="Days present"
              value={String(attendanceSummary.present)}
              hint="Includes work from home"
              tone="success"
              icon={<CalendarClock className="h-4 w-4" />}
            />
            <StatCard
              label="Avg. hours / day"
              value={attendanceSummary.avgHours}
              hint="Target 8h 30m"
              tone="info"
              icon={<Timer className="h-4 w-4" />}
            />
            <StatCard
              label="Late marks"
              value={String(attendanceSummary.lateMarks)}
              hint="3 allowed per month"
              tone="warning"
              icon={<Clock className="h-4 w-4" />}
            />
            <StatCard
              label="Attendance rate"
              value="94%"
              hint="+2% vs last month"
              tone="pending"
              icon={<TrendingUp className="h-4 w-4" />}
            />
          </>
        )}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        {/* Weekly view */}
        <Panel title="This week" description="17 – 23 August 2026">
          <div className="grid grid-cols-7 gap-2">
            {week.map((d) => {
              const today = d.status === "Today";
              return (
                <div
                  key={d.day}
                  className={cn(
                    "rounded-xl border p-2 text-center",
                    today ? "border-primary bg-accent" : "border-border bg-surface",
                  )}
                >
                  <p className="text-[11px] font-medium uppercase text-muted-foreground">{d.day}</p>
                  <p
                    className={cn(
                      "mt-0.5 text-sm font-semibold tabular-nums",
                      today ? "text-accent-foreground" : "text-foreground",
                    )}
                  >
                    {d.date}
                  </p>
                  <div className="mt-2 flex h-16 items-end justify-center">
                    <span
                      className={cn(
                        "w-2.5 rounded-full",
                        d.hours > 0 ? "bg-success" : "bg-muted",
                      )}
                      style={{ height: `${Math.max(6, (d.hours / 10) * 64)}px` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] tabular-nums text-muted-foreground">
                    {d.hours > 0 ? `${d.hours}h` : "—"}
                  </p>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Monthly summary */}
        <Panel title="Monthly summary" description={attendanceSummary.monthLabel}>
          <ul className="space-y-3 text-sm">
            {[
              { label: "Present", value: attendanceSummary.present, tone: "success" as Tone },
              { label: "Work from home", value: attendanceSummary.wfh, tone: "info" as Tone },
              { label: "On leave", value: attendanceSummary.leave, tone: "pending" as Tone },
              { label: "Absent", value: attendanceSummary.absent, tone: "warning" as Tone },
              { label: "Half day", value: 1, tone: "muted" as Tone },
            ].map((s) => (
              <li key={s.label} className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">{s.label}</span>
                <Pill tone={s.tone}>{s.value} days</Pill>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* History */}
      <Panel
        title="Attendance history"
        description="Filter by status or date range"
        className="mt-5"
        action={
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => toast("Showing previous month")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium text-muted-foreground">
              {attendanceSummary.monthLabel}
            </span>
            <Button variant="ghost" size="icon" onClick={() => toast("Showing next month")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        }
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex gap-1 overflow-x-auto">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                  filter === f
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-secondary",
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-8 w-[145px] rounded-lg text-xs"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-8 w-[145px] rounded-lg text-xs"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="No attendance records"
            description="Try a different status or widen the date range."
            action={
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={() => {
                  setFilter("All");
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Check in</th>
                  <th className="pb-2 font-medium">Check out</th>
                  <th className="pb-2 font-medium">Work hours</th>
                  <th className="pb-2 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.date}>
                    <td className="py-3">
                      <p className="font-medium text-foreground">{r.date}</p>
                      <p className="text-xs text-muted-foreground">{r.day}</p>
                    </td>
                    <td className="py-3 tabular-nums text-foreground">{r.in}</td>
                    <td className="py-3 tabular-nums text-foreground">{r.out}</td>
                    <td className="py-3 tabular-nums text-muted-foreground">{r.hours}</td>
                    <td className="py-3 text-right">
                      <Pill tone={statusTone[r.status] ?? "muted"}>{r.status}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </EmployeeLayout>
  );
}
