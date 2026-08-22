import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  Download,
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  UserPlus,
  Users,
  UserX,
  Edit,
  Save,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState, LoadingRows, Panel, Pill, StatCard } from "@/components/employee/primitives";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { departments, hrEmployees, jobTypes, money, type HREmployee } from "@/lib/hr-data";

export const Route = createFileRoute("/hr/employees")({
  head: () => ({
    meta: [
      { title: "Employee Directory — Workora HRMS" },
      {
        name: "description",
        content:
          "Search the organisation directory, filter by department or job type and open full employee profiles.",
      },
      { property: "og:title", content: "Employee Directory — Workora HRMS" },
      {
        property: "og:description",
        content: "Every employee, attendance state and leave status in one place on Workora.",
      },
    ],
  }),
  component: EmployeesPage,
});

const statusTone = (s: HREmployee["status"]) =>
  s === "Present"
    ? "success"
    : s === "Absent"
      ? "warning"
      : s === "On leave"
        ? "pending"
        : s === "Half-day"
          ? "warning"
          : s === "Late"
            ? "warning"
            : "info";

const PAGE_SIZE = 8;

function EmployeesPage() {
  const [employeesList, setEmployeesList] = useState<HREmployee[]>(hrEmployees);
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("all");
  const [job, setJob] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<HREmployee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<HREmployee | null>(null);
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [deactivatingEmployee, setDeactivatingEmployee] = useState<HREmployee | null>(null);

  // New employee form state
  const [newEmp, setNewEmp] = useState({
    id: `DF-${Math.floor(2060 + Math.random() * 100)}`,
    name: "",
    email: "",
    department: "Engineering",
    role: "",
    jobType: "Full-time" as const,
    location: "Bengaluru",
    manager: "Rohit Menon",
    phone: "+91 98450 00000",
    monthlyWage: "85000",
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return employeesList.filter(
      (e) =>
        (dept === "all" || e.department === dept) &&
        (job === "all" || e.jobType === job) &&
        (!q ||
          e.name.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q)),
    );
  }, [employeesList, query, dept, job]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const handleDeactivate = (emp: HREmployee) => {
    setEmployeesList((prev) =>
      prev.map((e) => (e.id === emp.id ? { ...e, status: "Absent" } : e)),
    );
    setDeactivatingEmployee(null);
    toast.error(`${emp.name} has been marked inactive on payroll.`);
  };

  const handleSaveProfile = (updated: HREmployee) => {
    setEmployeesList((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    if (selected?.id === updated.id) setSelected(updated);
    setEditingEmployee(null);
    toast.success(`Profile updated for ${updated.name}`);
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.name.trim() || !newEmp.role.trim()) {
      toast.error("Please provide both name and role.");
      return;
    }
    const empEmail = newEmp.email.trim() || `${newEmp.name.toLowerCase().replace(/\s+/g, ".")}@workora.io`;
    const created: HREmployee = {
      id: newEmp.id,
      name: newEmp.name,
      initials: newEmp.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase(),
      email: empEmail,
      department: newEmp.department,
      role: newEmp.role,
      jobType: newEmp.jobType,
      location: newEmp.location,
      manager: newEmp.manager,
      joined: "22 Aug 2026",
      phone: newEmp.phone,
      status: "Present",
      leaveStatus: "None",
      checkIn: "09:30",
      checkOut: "—",
      hours: "00:00",
      extra: "00:00",
      monthlyWage: Number(newEmp.monthlyWage) || 85000,
      leaveBalance: { paid: 24, sick: 10, unpaid: 5 },
    };
    setEmployeesList([created, ...employeesList]);
    setAddEmployeeOpen(false);
    setNewEmp({
      id: `DF-${Math.floor(2060 + Math.random() * 100)}`,
      name: "",
      email: "",
      department: "Engineering",
      role: "",
      jobType: "Full-time",
      location: "Bengaluru",
      manager: "Rohit Menon",
      phone: "+91 98450 00000",
      monthlyWage: "85000",
    });
    toast.success(`${created.name} added to employee directory.`);
  };

  return (
    <HRLayout
      title="Employees"
      subtitle="Organisation-wide directory with attendance and leave state"
      actions={
        <Button size="sm" className="gap-2 rounded-lg" onClick={() => setAddEmployeeOpen(true)}>
          <UserPlus className="h-4 w-4" /> <span className="hidden sm:inline">Add employee</span>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total employees"
          value={String(employeesList.length)}
          hint="Active on payroll"
          tone="info"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Departments"
          value={String(departments.length)}
          hint="Across 3 locations"
          tone="pending"
          icon={<Building2 className="h-4 w-4" />}
        />
        <StatCard
          label="Present today"
          value={String(employeesList.filter((e) => e.status === "Present").length)}
          hint="Checked in before 10:00"
          tone="success"
        />
        <StatCard
          label="On leave"
          value={String(employeesList.filter((e) => e.leaveStatus === "On leave").length)}
          hint="Approved absences"
          tone="warning"
        />
      </div>

      <Panel
        className="mt-6"
        title={`Directory · ${filtered.length} ${filtered.length === 1 ? "person" : "people"}`}
        description="Search by name, ID, role or email"
        action={
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-lg"
            onClick={() => toast.success("Directory exported as CSV")}
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
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search employees…"
              className="h-10 pl-9"
              aria-label="Search employees"
            />
          </div>
          <Select
            value={dept}
            onValueChange={(v) => {
              setDept(v);
              setPage(1);
            }}
          >
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
          <Select
            value={job}
            onValueChange={(v) => {
              setJob(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-10" aria-label="Filter by job type">
              <SelectValue placeholder="Job type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All job types</SelectItem>
              {jobTypes.map((j) => (
                <SelectItem key={j} value={j}>
                  {j}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 overflow-x-auto">
          {rows.length === 0 ? (
            <EmptyState
              title="No employees match those filters"
              description="Try a different search term, department or job type."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuery("");
                    setDept("all");
                    setJob("all");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead className="hidden md:table-cell">ID</TableHead>
                  <TableHead className="hidden lg:table-cell">Role</TableHead>
                  <TableHead className="hidden sm:table-cell">Attendance</TableHead>
                  <TableHead className="hidden xl:table-cell">Leave</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((e) => (
                  <TableRow
                    key={e.id}
                    tabIndex={0}
                    onClick={() => setSelected(e)}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter") setSelected(e);
                    }}
                    className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-brand-gradient text-xs font-semibold text-primary-foreground">
                            {e.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{e.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{e.department}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs tabular-nums text-muted-foreground">
                      {e.id}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {e.role}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Pill tone={statusTone(e.status)}>{e.status}</Pill>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <span className="text-xs text-muted-foreground">{e.leaveStatus}</span>
                    </TableCell>
                    <TableCell className="text-right" onClick={(ev) => ev.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={`Actions for ${e.name}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-card">
                          <DropdownMenuItem onSelect={() => setSelected(e)}>
                            View full profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setEditingEmployee(e)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => toast.success(`Email drafted to ${e.name}`)}
                          >
                            <Mail className="h-4 w-4 mr-2" /> Send email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => setDeactivatingEmployee(e)}
                          >
                            <UserX className="h-4 w-4 mr-2" /> Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {filtered.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Showing {(current - 1) * PAGE_SIZE + 1}–
              {Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                disabled={current === 1}
                onClick={() => setPage(current - 1)}
              >
                Previous
              </Button>
              <span className="text-xs tabular-nums text-muted-foreground">
                Page {current} of {pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                disabled={current === pages}
                onClick={() => setPage(current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Panel>

      <ProfileSheet
        employee={selected}
        onClose={() => setSelected(null)}
        onEdit={(emp) => setEditingEmployee(emp)}
      />

      {/* Admin Edit Employee Profile Modal */}
      {editingEmployee && (
        <EditProfileDialog
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSave={handleSaveProfile}
        />
      )}

      {/* Admin Add Employee Modal */}
      <Dialog open={addEmployeeOpen} onOpenChange={setAddEmployeeOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Register a new employee into the Workora HR directory and payroll system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="add-id">Employee ID</Label>
                <Input
                  id="add-id"
                  value={newEmp.id}
                  onChange={(e) => setNewEmp({ ...newEmp, id: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="add-name">Full Name</Label>
                <Input
                  id="add-name"
                  placeholder="e.g. Maya Sunder"
                  value={newEmp.name}
                  onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="add-dept">Department</Label>
                <Select
                  value={newEmp.department}
                  onValueChange={(v) => setNewEmp({ ...newEmp, department: v })}
                >
                  <SelectTrigger id="add-dept">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="add-role">Designation / Role</Label>
                <Input
                  id="add-role"
                  placeholder="e.g. QA Specialist"
                  value={newEmp.role}
                  onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="add-job">Employment Type</Label>
                <Select
                  value={newEmp.jobType}
                  onValueChange={(v) => setNewEmp({ ...newEmp, jobType: v as typeof newEmp.jobType })}
                >
                  <SelectTrigger id="add-job">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypes.map((j) => (
                      <SelectItem key={j} value={j}>
                        {j}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="add-wage">Monthly Wage (₹)</Label>
                <Input
                  id="add-wage"
                  type="number"
                  value={newEmp.monthlyWage}
                  onChange={(e) => setNewEmp({ ...newEmp, monthlyWage: e.target.value })}
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setAddEmployeeOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Employee</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Deactivating Employee */}
      <AlertDialog
        open={!!deactivatingEmployee}
        onOpenChange={(o) => !o && setDeactivatingEmployee(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate employee account?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark{" "}
              <span className="font-semibold text-foreground">{deactivatingEmployee?.name}</span> (
              {deactivatingEmployee?.id}) as inactive? This will revoke login access and flag their
              payroll status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deactivatingEmployee) handleDeactivate(deactivatingEmployee);
              }}
            >
              Confirm Deactivation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </HRLayout>
  );
}

function EditProfileDialog({
  employee,
  onClose,
  onSave,
}: {
  employee: HREmployee;
  onClose: () => void;
  onSave: (updated: HREmployee) => void;
}) {
  const [form, setForm] = useState<HREmployee>({ ...employee });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Employee Details</DialogTitle>
          <DialogDescription>
            Admin privileges: Update personal, operational and statutory details for {employee.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-email">Work Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-dept">Department</Label>
              <Select
                value={form.department}
                onValueChange={(v) => setForm({ ...form, department: v })}
              >
                <SelectTrigger id="edit-dept">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-role">Designation / Role</Label>
              <Input
                id="edit-role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-manager">Reporting Manager</Label>
              <Input
                id="edit-manager"
                value={form.manager}
                onChange={(e) => setForm({ ...form, manager: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-phone">Contact Phone</Label>
              <Input
                id="edit-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-jobType">Employment Type</Label>
              <Select
                value={form.jobType}
                onValueChange={(v) => setForm({ ...form, jobType: v as typeof form.jobType })}
              >
                <SelectTrigger id="edit-jobType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map((j) => (
                    <SelectItem key={j} value={j}>
                      {j}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-status">Attendance State</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as typeof form.status })}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Present", "Late", "Half-day", "Work from home", "On leave", "Absent"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-wage">Monthly Wage (₹)</Label>
              <Input
                id="edit-wage"
                type="number"
                value={form.monthlyWage}
                onChange={(e) => setForm({ ...form, monthlyWage: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-location">Work Location</Label>
              <Input
                id="edit-location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="gap-1.5">
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProfileSheet({
  employee,
  onClose,
  onEdit,
}: {
  employee: HREmployee | null;
  onClose: () => void;
  onEdit: (emp: HREmployee) => void;
}) {
  return (
    <Sheet open={!!employee} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetTitle className="sr-only">Employee profile</SheetTitle>
        {!employee ? (
          <div className="p-6">
            <LoadingRows rows={5} />
          </div>
        ) : (
          <div className="space-y-6 p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-brand-gradient text-lg font-semibold text-primary-foreground">
                  {employee.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold tracking-tight text-foreground">
                  {employee.name}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {employee.role} · {employee.department}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Pill tone={statusTone(employee.status)}>{employee.status}</Pill>
                  <Pill tone="muted">{employee.jobType}</Pill>
                </div>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={`mailto:${employee.email}`}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{employee.email}</span>
                  </a>
                </TooltipTrigger>
                <TooltipContent>Send work email</TooltipContent>
              </Tooltip>
              <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span className="truncate">{employee.phone}</span>
              </div>
            </div>

            <dl className="rounded-xl border border-border">
              {[
                ["Employee ID", employee.id],
                ["Department", employee.department],
                ["Reporting manager", employee.manager],
                ["Location", employee.location],
                ["Date of joining", employee.joined],
                ["Employment type", employee.jobType],
                ["Monthly wage", money(employee.monthlyWage)],
                [
                  "Leave balance",
                  `${employee.leaveBalance.paid} paid · ${employee.leaveBalance.sick} sick · ${employee.leaveBalance.unpaid} unpaid`,
                ],
                ["Today's hours", employee.hours],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)] gap-3 border-b border-border/70 px-4 py-3 last:border-0"
                >
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {k}
                  </dt>
                  <dd className="text-sm text-foreground">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="rounded-lg gap-1.5"
                onClick={() => {
                  onEdit(employee);
                }}
              >
                <Edit className="h-3.5 w-3.5" /> Edit profile
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg"
                onClick={() => toast.success(`Payslip dispatched to ${employee.email}`)}
              >
                Send payslip
              </Button>
              <Button size="sm" variant="ghost" className="rounded-lg" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
