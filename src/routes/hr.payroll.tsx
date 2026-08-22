import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Download, Search, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState, Panel, Pill, StatCard } from "@/components/employee/primitives";
import { HRLayout } from "@/components/hr/HRLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { money } from "@/lib/hr-data";
import { getDepartments, getPayrollRows } from "@/lib/data";
import { payrollAccuracy, payrollTotals, type PayrollRow } from "@/lib/hr-payroll";

export const Route = createFileRoute("/hr/payroll")({
  head: () => ({
    meta: [
      { title: "Payroll — Workora HRMS" },
      {
        name: "description",
        content:
          "Run organisation payroll: salary structures, statuses, accuracy indicators and per-employee edits.",
      },
      { property: "og:title", content: "Payroll — Workora HRMS" },
      { property: "og:description", content: "Organisation payroll, accurate and on time on Workora." },
    ],
  }),
  component: HRPayrollPage,
});

const tone = (s: PayrollRow["status"]) =>
  s === "Processed" ? "success" : s === "Pending" ? "pending" : "warning";

function HRPayrollPage() {
  const departments = getDepartments();
  const payrollRows = getPayrollRows();
  const [rows, setRows] = useState<PayrollRow[]>(payrollRows);
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("all");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<PayrollRow | null>(null);
  const [wage, setWage] = useState("");
  const [lockRunDialog, setLockRunDialog] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (dept === "all" || r.department === dept) &&
        (status === "all" || r.status === status) &&
        (!q || r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)),
    );
  }, [rows, query, dept, status]);

  function saveStructure() {
    if (!editing) return;
    const value = Number(wage);
    if (!value || value < 10000) {
      toast.error("Enter a monthly wage of at least ₹10,000");
      return;
    }
    setRows((prev) =>
      prev.map((r) =>
        r.id === editing.id
          ? {
              ...r,
              monthlyWage: value,
              basic: Math.round(value * 0.5),
              hra: Math.round(value * 0.2),
              allowances: value - Math.round(value * 0.5) - Math.round(value * 0.2),
              deductions: Math.round(value * 0.14) + 200,
              net: value - (Math.round(value * 0.14) + 200),
            }
          : r,
      ),
    );
    toast.success(`Salary structure updated for ${editing.name}`);
    setEditing(null);
  }

  function handleExecuteRun() {
    setRows((prev) => prev.map((r) => ({ ...r, status: "Processed" })));
    setLockRunDialog(false);
    toast.success("August 2026 payroll locked and generated for 248 employees.");
  }

  return (
    <HRLayout
      title="Payroll"
      subtitle="August 2026 cycle · locks on 25 Aug 2026"
      actions={
        <Button size="sm" className="gap-2 rounded-lg" onClick={() => setLockRunDialog(true)}>
          <Wallet className="h-4 w-4" /> <span className="hidden sm:inline">Run payroll</span>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Gross payout"
          value={money(payrollTotals.gross)}
          hint={`${payrollTotals.headcount} employees`}
          tone="info"
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatCard
          label="Net payout"
          value={money(payrollTotals.net)}
          hint={`${money(payrollTotals.deductions)} deductions`}
          tone="success"
        />
        <StatCard
          label="Processed"
          value={`${payrollTotals.processed}/${payrollTotals.headcount}`}
          hint="Ready for disbursal"
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <StatCard
          label="Needs attention"
          value={String(payrollTotals.flagged)}
          hint="Blocked or incomplete records"
          tone="warning"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      <Panel className="mt-6" title="Payroll accuracy" description="Data completeness across all records">
        <div className="flex flex-wrap items-center gap-4">
          <Progress value={payrollAccuracy} className="h-2 flex-1 min-w-[200px]" />
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {payrollAccuracy}%
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {payrollTotals.flagged} records have missing bank details, tax declarations or unresolved
          attendance. Resolve them before the cycle locks.
        </p>
      </Panel>

      <Panel
        className="mt-6"
        title="Employee payroll"
        description={`${filtered.length} records`}
        action={
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-lg"
            onClick={() => toast.success("Payroll register exported")}
          >
            <Download className="h-4 w-4" /> Export
          </Button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px_160px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search employee or ID…"
              className="h-10 pl-9"
              aria-label="Search payroll"
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
            <SelectTrigger className="h-10" aria-label="Filter by payroll status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {["all", "Processed", "Pending", "On hold"].map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "all" ? "All statuses" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState
              title="No payroll records"
              description="No employee matches these filters for the August cycle."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead className="hidden lg:table-cell">Structure</TableHead>
                  <TableHead className="hidden md:table-cell">Gross</TableHead>
                  <TableHead className="hidden md:table-cell">Net</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-brand-gradient text-[11px] font-semibold text-primary-foreground">
                            {r.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{r.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {r.id} · {r.department}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      Basic {money(r.basic)} · HRA {money(r.hra)} · Other {money(r.allowances)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm tabular-nums text-foreground">
                      {money(r.monthlyWage)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm tabular-nums text-foreground">
                      {money(r.net)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {r.issues.length ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Pill tone={tone(r.status)}>{r.status}</Pill>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{r.issues.join(" · ")}</TooltipContent>
                        </Tooltip>
                      ) : (
                        <Pill tone={tone(r.status)}>{r.status}</Pill>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg text-xs"
                        onClick={() => {
                          setEditing(r);
                          setWage(String(r.monthlyWage));
                        }}
                      >
                        Edit structure
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Panel>

      {/* Edit Structure Modal */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit salary structure</DialogTitle>
            <DialogDescription>
              {editing ? `${editing.name} · ${editing.role}` : ""} — components recalculate
              automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="wage">Monthly wage (₹)</Label>
              <Input
                id="wage"
                inputMode="numeric"
                value={wage}
                onChange={(e) => setWage(e.target.value.replace(/[^\d]/g, ""))}
              />
            </div>
            <div className="rounded-xl border border-border p-4 text-xs text-muted-foreground">
              <p>Basic (50%): {money(Math.round(Number(wage || 0) * 0.5))}</p>
              <p>HRA (20%): {money(Math.round(Number(wage || 0) * 0.2))}</p>
              <p>Deductions (14% + PT): {money(Math.round(Number(wage || 0) * 0.14) + 200)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={saveStructure}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Running Payroll */}
      <AlertDialog open={lockRunDialog} onOpenChange={setLockRunDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Execute and lock August payroll?</AlertDialogTitle>
            <AlertDialogDescription>
              This will lock the current cycle calculation for 248 employees with a gross total of{" "}
              <span className="font-semibold text-foreground">{money(payrollTotals.gross)}</span>.
              Payslips will be generated and made available on the employee portal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleExecuteRun}>
              Confirm & Execute Run
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </HRLayout>
  );
}
