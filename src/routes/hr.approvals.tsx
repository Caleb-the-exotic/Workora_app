import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck2, Check, FileText, Search, X } from "lucide-react";
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
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getLeaveApprovals, type ApprovalStatus, type LeaveApproval } from "@/lib/hr-data";
import { updateLeaveRequest, addNotification, getEmployeeById } from "@/lib/data";

export const Route = createFileRoute("/hr/approvals")({
  head: () => ({
    meta: [
      { title: "Leave Approvals — Workora HRMS" },
      {
        name: "description",
        content:
          "Review leave requests, open request details and approve or reject with a comment in one click.",
      },
      { property: "og:title", content: "Leave Approvals — Workora HRMS" },
      { property: "og:description", content: "Clear your approval queue in minutes on Workora." },
    ],
  }),
  component: ApprovalsPage,
});

const tone = (s: ApprovalStatus) =>
  s === "approved" ? "success" : s === "rejected" ? "warning" : "pending";

function ApprovalsPage() {
  const [items, setItems] = useState<LeaveApproval[]>(getLeaveApprovals());
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | ApprovalStatus>("pending");
  const [active, setActive] = useState<LeaveApproval | null>(null);
  const [comment, setComment] = useState("");
  const [rejectingItem, setRejectingItem] = useState<LeaveApproval | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (r) =>
        (filter === "all" || r.status === filter) &&
        (!q || r.employee.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)),
    );
  }, [items, query, filter]);

  function decide(row: LeaveApproval, status: ApprovalStatus) {
    setItems((prev) => prev.map((r) => (r.id === row.id ? { ...r, status } : r)));
    updateLeaveRequest(row.id, { status });
    const emp = getEmployeeById(row.employeeId);
    const empName = emp?.name ?? row.employee;
    addNotification({
      id: `NTF-${Date.now()}`,
      userId: row.employeeId,
      category: "leave",
      title: `Leave request ${row.id} ${status}`,
      body: status === "approved"
        ? `Your ${row.type.toLowerCase()} from ${row.from} to ${row.to} has been approved by HR.`
        : `Your ${row.type.toLowerCase()} from ${row.from} to ${row.to} has been rejected by HR.${comment ? ` Reason: ${comment}` : ""}`,
      time: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
      unread: true,
    });
    if (active?.id === row.id) setActive(null);
    setComment("");
    if (status === "approved") toast.success(`${row.id} approved · ${empName} notified`);
    else toast.error(`${row.id} rejected · ${empName} notified`);
  }

  const pending = items.filter((r) => r.status === "pending").length;

  return (
    <HRLayout title="Leave Approvals" subtitle="Requests awaiting a decision from HR">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pending"
          value={String(pending)}
          hint="Oldest is 2 days old"
          tone="pending"
          icon={<CalendarCheck2 className="h-4 w-4" />}
        />
        <StatCard
          label="Approved"
          value={String(items.filter((r) => r.status === "approved").length)}
          hint="This month"
          tone="success"
        />
        <StatCard
          label="Rejected"
          value={String(items.filter((r) => r.status === "rejected").length)}
          hint="This month"
          tone="warning"
        />
        <StatCard label="Avg. decision time" value="6h 12m" hint="Target under 24h" tone="info" />
      </div>

      <Panel
        className="mt-6"
        title="Approval queue"
        description={`${filtered.length} requests`}
      >
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by employee or request ID…"
              className="h-10 pl-9"
              aria-label="Search requests"
            />
          </div>
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="h-10" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="all">All requests</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <EmptyState
              title="Queue is clear"
              description="There are no requests matching this filter. Nice work."
            />
          ) : (
            filtered.map((r) => (
              <article
                key={r.id}
                className="grid gap-3 rounded-xl border border-border p-4 transition-all hover:bg-secondary/40 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-brand-gradient text-xs font-semibold text-primary-foreground">
                      {r.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">{r.employee}</p>
                      <Pill tone={tone(r.status)}>{r.status}</Pill>
                      <span className="text-[11px] tabular-nums text-muted-foreground">{r.id}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {r.type} · {r.from} → {r.to} · {r.days} day{r.days > 1 ? "s" : ""}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{r.remarks}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <Button variant="outline" size="sm" onClick={() => setActive(r)}>
                    Details
                  </Button>
                  {r.status === "pending" && (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" className="gap-1.5" onClick={() => decide(r, "approved")}>
                            <Check className="h-3.5 w-3.5" /> Approve
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Approve request and notify employee</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setRejectingItem(r)}
                          >
                            <X className="h-3.5 w-3.5" /> Reject
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reject request</TooltipContent>
                      </Tooltip>
                    </>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </Panel>

      <Sheet
        open={!!active}
        onOpenChange={(o) => {
          if (!o) {
            setActive(null);
            setComment("");
          }
        }}
      >
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetTitle className="sr-only">Leave request details</SheetTitle>
          {active && (
            <div className="space-y-6 p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-brand-gradient text-sm font-semibold text-primary-foreground">
                    {active.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold tracking-tight text-foreground">
                    {active.employee}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {active.role} · {active.department}
                  </p>
                </div>
              </div>

              <dl className="rounded-xl border border-border">
                {[
                  ["Request ID", active.id],
                  ["Leave type", active.type],
                  ["From", active.from],
                  ["To", active.to],
                  ["Duration", `${active.days} day${active.days > 1 ? "s" : ""}`],
                  ["Applied on", active.appliedOn],
                  ["Balance after", active.balanceAfter],
                  ["Reason", active.remarks],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="grid grid-cols-[minmax(0,130px)_minmax(0,1fr)] gap-3 border-b border-border/70 px-4 py-3 last:border-0"
                  >
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {k}
                    </dt>
                    <dd className="text-sm text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>

              {active.attachment && (
                <button
                  onClick={() => toast.success("Attachment opened")}
                  className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <FileText className="h-4 w-4" /> {active.attachment}
                </button>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="approval-comment"
                  className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  Comment to employee
                </label>
                <Textarea
                  id="approval-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add an optional note that will be sent with your decision…"
                  rows={3}
                />
              </div>

              {active.status === "pending" ? (
                <div className="flex flex-wrap gap-2">
                  <Button className="gap-1.5" onClick={() => decide(active, "approved")}>
                    <Check className="h-4 w-4" /> Approve request
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      setRejectingItem(active);
                    }}
                  >
                    <X className="h-4 w-4" /> Reject request
                  </Button>
                </div>
              ) : (
                <Pill tone={tone(active.status)}>Already {active.status}</Pill>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialog for Rejecting Request */}
      <AlertDialog open={!!rejectingItem} onOpenChange={(o) => !o && setRejectingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject leave request?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject request{" "}
              <span className="font-semibold text-foreground">{rejectingItem?.id}</span> for{" "}
              <span className="font-semibold text-foreground">{rejectingItem?.employee}</span>? An
              update notification will be sent to the employee.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (rejectingItem) {
                  decide(rejectingItem, "rejected");
                  setRejectingItem(null);
                }
              }}
            >
              Confirm Rejection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </HRLayout>
  );
}
