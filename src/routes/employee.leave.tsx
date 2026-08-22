import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarCheck2,
  CalendarDays,
  Paperclip,
  Plus,
  Stethoscope,
  Wallet2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { EmployeeLayout } from "@/components/employee/EmployeeLayout";
import { EmptyState, Panel, Pill, type Tone } from "@/components/employee/primitives";
import { YearCalendar } from "@/components/employee/YearCalendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getEmployee, getLeaveRequestsData, type LeaveStatus } from "@/lib/employee-data";
import { addLeaveRequest, getLeaveBalance } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/employee/leave")({
  head: () => ({
    meta: [
      { title: "Leave & Time-Off — Workora HRMS" },
      {
        name: "description",
        content: "Check leave balances, submit time-off requests and track approval statuses in Workora.",
      },
      { property: "og:title", content: "Leave & Time-Off — Workora HRMS" },
      { property: "og:description", content: "Request time off and track leave balances on Workora." },
    ],
  }),
  component: LeavePage,
});

type Request = {
  id: string;
  type: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  attachment?: string;
};

const statusTone: Record<LeaveStatus, Tone> = {
  approved: "success",
  pending: "pending",
  rejected: "warning",
};

const statusLabel: Record<LeaveStatus, string> = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
};

const leaveTypes = ["Paid time off", "Sick leave", "Unpaid leave"] as const;

function getBalances() {
  const user = getCurrentUser();
  if (!user) return [];
  const bal = getLeaveBalance(user.employeeId);
  if (!bal) {
    return [
      { type: "Paid time off", available: 24, used: 6, total: 30, tone: "success" as Tone, icon: CalendarCheck2 },
      { type: "Sick leave", available: 7, used: 3, total: 10, tone: "info" as Tone, icon: Stethoscope },
      { type: "Unpaid leave", available: 5, used: 0, total: 5, tone: "muted" as Tone, icon: Wallet2 },
    ];
  }
  return [
    { type: "Paid time off", available: bal.paid.total - bal.paid.used, used: bal.paid.used, total: bal.paid.total, tone: "success" as Tone, icon: CalendarCheck2 },
    { type: "Sick leave", available: bal.sick.total - bal.sick.used, used: bal.sick.used, total: bal.sick.total, tone: "info" as Tone, icon: Stethoscope },
    { type: "Unpaid leave", available: bal.unpaid.total - bal.unpaid.used, used: bal.unpaid.used, total: bal.unpaid.total, tone: "muted" as Tone, icon: Wallet2 },
  ];
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });

function daysBetween(from: string, to: string) {
  if (!from || !to) return 0;
  const diff = new Date(to).getTime() - new Date(from).getTime();
  if (diff < 0) return 0;
  return Math.round(diff / 86400000) + 1;
}

function LeavePage() {
  const employee = getEmployee();
  const seedRequests = getLeaveRequestsData();
  const balances = useMemo(() => getBalances(), []);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<Request[]>(seedRequests as Request[]);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detail, setDetail] = useState<Request | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | LeaveStatus>("all");

  const [type, setType] = useState<string>(leaveTypes[0]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState<File | null>(null);
  type FieldErrors = {
    type?: string;
    from?: string;
    to?: string;
    remarks?: string;
    file?: string;
  };
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(t);
  }, []);

  const days = useMemo(() => daysBetween(from, to), [from, to]);

  const validate = () => {
    const e: FieldErrors = {};
    if (!type) e.type = "Select a leave type";
    if (!from) e.from = "Start date is required";
    if (!to) e.to = "End date is required";
    if (from && to && new Date(to) < new Date(from)) e.to = "End date must be after the start date";
    if (remarks.trim().length < 5) e.remarks = "Add a short reason (at least 5 characters)";
    if (remarks.length > 300) e.remarks = "Remarks must be under 300 characters";
    if (type === "Sick leave" && days > 2 && !file)
      e.file = "Attach a medical certificate for sick leave longer than 2 days";
    if (file && file.size > 5 * 1024 * 1024) e.file = "File must be under 5 MB";
    const balance = balances.find((b) => b.type === type);
    if (balance && days > balance.available) e.to = `Only ${balance.available} days available`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    const next: Request = {
      id: `LV-${Math.floor(3400 + Math.random() * 500)}`,
      type,
      from: fmt(from),
      to: fmt(to),
      days,
      reason: remarks.trim(),
      status: "pending",
      appliedOn: fmt(new Date().toISOString().slice(0, 10)),
      ...(file ? { attachment: file.name } : {}),
    };
    addLeaveRequest({
      id: next.id,
      employeeId: employee.id,
      type: next.type,
      from: next.from,
      to: next.to,
      days: next.days,
      reason: next.reason,
      status: "pending",
      appliedOn: next.appliedOn,
    });
    setRequests((r) => [next, ...r]);
    setSubmitting(false);
    setConfirm(false);
    setOpen(false);
    setFrom("");
    setTo("");
    setRemarks("");
    setFile(null);
    toast.success(`Leave request ${next.id} submitted`, {
      description: `${next.type} · ${next.days} day(s) · awaiting ${employee.manager}'s approval`,
    });
  };

  const filtered =
    statusFilter === "all" ? requests : requests.filter((r) => r.status === statusFilter);

  return (
    <EmployeeLayout
      title="Leave & Time-Off"
      subtitle="Balances, requests and approvals in one place"
      actions={
        <Button size="sm" className="rounded-lg" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Apply for Leave
        </Button>
      }
    >
      {/* Balances */}
      <div className="grid gap-4 sm:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[140px] rounded-2xl" />
            ))
          : balances.map((b) => (
              <div key={b.type} className="rounded-2xl border border-border bg-surface p-5 shadow-card">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{b.type}</p>
                  <Pill tone={b.tone}>
                    <b.icon className="h-3.5 w-3.5" /> {b.available} left
                  </Pill>
                </div>
                <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                  {b.available}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    of {b.total} days
                  </span>
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      b.tone === "success"
                        ? "bg-success"
                        : b.tone === "info"
                          ? "bg-info"
                          : "bg-muted-foreground",
                    )}
                    style={{ width: `${(b.used / b.total) * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{b.used} days used this year</p>
              </div>
            ))}
      </div>

      {/* Requests */}
      <Panel
        title="Leave request history"
        description="Track the status of every request you've raised"
        className="mt-5"
        action={
          <div className="flex gap-1">
            {(["all", "pending", "approved", "rejected"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-xs font-medium capitalize transition-colors",
                  statusFilter === s
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-secondary",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        }
      >
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No leave requests"
            description="You have no requests with this status yet."
            action={
              <Button size="sm" className="rounded-lg" onClick={() => setOpen(true)}>
                Apply for Leave
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 font-medium">Request</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Date range</th>
                  <th className="pb-2 font-medium">Days</th>
                  <th className="pb-2 font-medium">Remarks</th>
                  <th className="pb-2 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="cursor-pointer transition-colors hover:bg-secondary/60"
                    onClick={() => setDetail(r)}
                  >
                    <td className="py-3 font-medium text-foreground">{r.id}</td>
                    <td className="py-3 text-muted-foreground">{r.type}</td>
                    <td className="py-3 text-foreground">
                      {r.from} → {r.to}
                    </td>
                    <td className="py-3 tabular-nums text-foreground">{r.days}</td>
                    <td className="max-w-[220px] truncate py-3 text-muted-foreground">{r.reason}</td>
                    <td className="py-3 text-right">
                      <Pill tone={statusTone[r.status]}>{statusLabel[r.status]}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Year calendar */}
      <Panel
        title="Leave calendar 2026"
        description="Full-year view of holidays, approved leave and pending requests"
        className="mt-5"
      >
        <YearCalendar
          approved={requests.filter((r) => r.status === "approved").flatMap((r) => {
            const dates: string[] = [];
            const start = new Date(r.from);
            const end = new Date(r.to);
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
              dates.push(d.toISOString().slice(0, 10));
            }
            return dates;
          })}
          pending={requests.filter((r) => r.status === "pending").flatMap((r) => {
            const dates: string[] = [];
            const start = new Date(r.from);
            const end = new Date(r.to);
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
              dates.push(d.toISOString().slice(0, 10));
            }
            return dates;
          })}
        />
      </Panel>

      {/* Apply modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Time off request</DialogTitle>
            <DialogDescription>
              Requests are sent to {employee.manager} for approval.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Employee</Label>
              <Input value={`${employee.name} · ${employee.id}`} readOnly className="bg-muted" />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="leave-type">Time off type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="leave-type">
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="from">Start date</Label>
                <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                {errors.from && <p className="text-xs text-destructive">{errors.from}</p>}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="to">End date</Label>
                <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                {errors.to && <p className="text-xs text-destructive">{errors.to}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/60 px-4 py-3">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-foreground">
                Allocation:{" "}
                <span className="font-semibold tabular-nums">{days.toFixed(2)} days</span>
              </p>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                rows={3}
                maxLength={300}
                placeholder="Reason for your time off"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
              {errors.remarks && <p className="text-xs text-destructive">{errors.remarks}</p>}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="attachment">
                Attachment{" "}
                <span className="font-normal text-muted-foreground">
                  {type === "Sick leave" ? "(medical certificate)" : "(optional)"}
                </span>
              </Label>
              {file ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/60 px-3 py-2.5">
                  <span className="flex min-w-0 items-center gap-2">
                    <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-foreground">{file.name}</span>
                      <span className="block text-[11px] text-muted-foreground">
                        {(file.size / 1024).toFixed(0)} KB
                      </span>
                    </span>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => setFile(null)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove attachment</span>
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="attachment"
                  className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border px-4 py-5 text-center transition-colors hover:bg-secondary/50"
                >
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Upload certificate or document</span>
                  <span className="text-[11px] text-muted-foreground">
                    PDF, PNG or JPG · up to 5 MB
                  </span>
                </label>
              )}
              <input
                id="attachment"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="sr-only"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {errors.file && <p className="text-xs text-destructive">{errors.file}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Discard
            </Button>
            <Button
              onClick={() => {
                if (validate()) setConfirm(true);
                else toast.error("Please fix the highlighted fields");
              }}
            >
              Submit request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation */}
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit this leave request?</AlertDialogTitle>
            <AlertDialogDescription>
              {type} · {days} day(s) from {from && fmt(from)} to {to && fmt(to)}. Once submitted it
              goes to {employee.manager} for approval.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={submitting}
              onClick={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              {submitting ? "Submitting…" : "Confirm & submit"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Request details */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Request {detail?.id}</DialogTitle>
            <DialogDescription>Applied on {detail?.appliedOn}</DialogDescription>
          </DialogHeader>
          {detail && (
            <dl className="grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Leave type</dt>
                <dd className="font-medium text-foreground">{detail.type}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Date range</dt>
                <dd className="font-medium text-foreground">
                  {detail.from} → {detail.to}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Days</dt>
                <dd className="font-medium tabular-nums text-foreground">{detail.days}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <Pill tone={statusTone[detail.status]}>{statusLabel[detail.status]}</Pill>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Remarks</dt>
                <dd className="mt-1 text-foreground">{detail.reason}</dd>
              </div>
              {detail.attachment && (
                <div>
                  <dt className="text-muted-foreground">Attachment</dt>
                  <dd className="mt-1 flex items-center gap-2 text-foreground">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    {detail.attachment}
                  </dd>
                </div>
              )}
            </dl>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetail(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </EmployeeLayout>
  );
}
