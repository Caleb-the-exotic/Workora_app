import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Clock3, Download, LogIn, LogOut, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState, Panel, Pill, StatCard } from "@/components/employee/primitives";
import { HRLayout } from "@/components/hr/HRLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { attendanceTrend, departments, hrEmployees, type HREmployee } from "@/lib/hr-data";

export const Route = createFileRoute("/hr/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance — Workora HRMS" },
      {
        name: "description",
        content:
          "Organisation-wide daily and weekly attendance with check-in, check-out, working hours and summaries.",
      },
      { property: "og:title", content: "Attendance — Workora HRMS" },
      { property: "og:description", content: "Track org-wide attendance in real time on Workora." },
    ],
  }),
  component: AttendancePage,
});

const statusTone = (s: HREmployee["status"]) =>
  s === "Present"
    ? "success"
    : s === "On leave"
      ? "pending"
      : s === "Half-day"
        ? "warning"
        : s === "Work from home"
          ? "info"
          : "warning";

function AttendancePage() {
  const [view, setView] = useState<"daily" | "weekly">("daily");
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("all");
  const [status, setStatus] = useState("all");
  const [marks, setMarks] = useState<Record<string, "in" | "out">>({});

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return hrEmployees.filter(
      (e) =>
        (dept === "all" || e.department === dept) &&
        (status === "all" || e.status === status) &&
        (!q || e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)),
    );
  }, [query, dept, status]);

  const summary = {
    present: hrEmployees.filter((e) => e.status === "Present").length,
    late: hrEmployees.filter((e) => e.status === "Late").length,
    leave: hrEmployees.filter((e) => e.status === "On leave").length,
    absent: hrEmployees.filter((e) => e.status === "Absent").length,
  };

  return (
    <HRLayout
      title="Attendance"
      subtitle="Friday, 21 August 2026 · organisation-wide"
      actions={
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={() => toast.success("Attendance report exported")}
        >
          <Download className="h-4 w-4" /> <span className="hidden sm:inline">Export</span>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Present"
          value={String(summary.present)}
          hint="Including work from home"
          tone="success"
          icon={<Clock3 className="h-4 w-4" />}
        />
        <StatCard label="Late marks" value={String(summary.late)} hint="After 10:00" tone="warning" />
        <StatCard label="On leave" value={String(summary.leave)} hint="Approved" tone="pending" />
        <StatCard
          label="Absent"
          value={String(summary.absent)}
          hint="No check-in recorded"
          tone="info"
          icon={<CalendarClock className="h-4 w-4" />}
        />
      </div>

      <Panel className="mt-6" title="Weekly attendance pattern" description="Last 7 days">
        <div className="grid gap-3 sm:grid-cols-7">
          {attendanceTrend.map((d) => {
            const total = d.present + d.absent + d.leave;
            return (
              <div key={d.day} className="rounded-xl border border-border p-3">
                <p className="text-xs font-semibold text-foreground">{d.day}</p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                  {Math.round((d.present / total) * 100)}%
                </p>
                <p className="text-[11px] text-muted-foreground">{d.present} present</p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-success"
                    style={{ width: `${(d.present / total) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel
        className="mt-6"
        title="Attendance register"
        description={`${rows.length} employees`}
        action={
          <Tabs value={view} onValueChange={(v) => setView(v as "daily" | "weekly")}>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      >
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px_170px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search employee or ID…"
              className="h-10 pl-9"
              aria-label="Search attendance"
            />
          </div>
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="h-10" aria-label="Filter by department">
              <SelectValue placeholder="Department" />
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
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-10" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {["all", "Present", "Late", "Half-day", "Work from home", "On leave", "Absent"].map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "all" ? "All statuses" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 overflow-x-auto">
          {rows.length === 0 ? (
            <EmptyState
              title="No attendance records"
              description="No employee matches the current filters for this period."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Check-in</TableHead>
                  <TableHead className="hidden md:table-cell">Check-out</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    {view === "daily" ? "Hours" : "Weekly hours"}
                  </TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-brand-gradient text-[11px] font-semibold text-primary-foreground">
                            {e.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{e.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{e.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Pill tone={statusTone(e.status)}>{e.status}</Pill>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm tabular-nums text-muted-foreground">
                      {marks[e.id] ? "09:00" : e.checkIn}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm tabular-nums text-muted-foreground">
                      {marks[e.id] === "out" ? "18:00" : e.checkOut}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm tabular-nums text-foreground">
                      {view === "daily"
                        ? e.hours
                        : e.hours === "—"
                          ? "—"
                          : `${(parseFloat(e.hours) * 5).toFixed(0)}h`}
                    </TableCell>
                    <TableCell className="text-right">
                      {marks[e.id] === "in" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => {
                            setMarks((m) => ({ ...m, [e.id]: "out" }));
                            toast.success(`${e.name} checked out at 18:00`);
                          }}
                        >
                          <LogOut className="h-3.5 w-3.5" /> Check out
                        </Button>
                      ) : marks[e.id] === "out" ? (
                        <span className="text-xs text-muted-foreground">Day closed</span>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1.5"
                          onClick={() => {
                            setMarks((m) => ({ ...m, [e.id]: "in" }));
                            toast.success(`${e.name} checked in at 09:00`);
                          }}
                        >
                          <LogIn className="h-3.5 w-3.5" /> Check in
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Panel>
    </HRLayout>
  );
}
