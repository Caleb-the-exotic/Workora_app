import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  Briefcase,
  Camera,
  Download,
  FileText,
  Loader2,
  Lock,
  Pencil,
  Save,
  Wallet,
  X,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { EmployeeLayout } from "@/components/employee/EmployeeLayout";
import { InfoRow, Panel, Pill } from "@/components/employee/primitives";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getDocumentsData, getEmployee, getNetPay, getSalary, money } from "@/lib/employee-data";

export const Route = createFileRoute("/employee/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Workora HRMS" },
      {
        name: "description",
        content:
          "View your personal details, job role, salary breakdown and official documents on Workora.",
      },
      { property: "og:title", content: "My Profile — Workora HRMS" },
      { property: "og:description", content: "Your employee profile on Workora HRMS." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const employee = getEmployee();
  const salary = getSalary();
  const netPay = getNetPay();
  const documents = getDocumentsData();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState(employee.phone);
  const [address, setAddress] = useState(employee.address);
  const [errors, setErrors] = useState<{ phone?: string; address?: string }>({});

  function onSave(e: FormEvent) {
    e.preventDefault();
    const errs: { phone?: string; address?: string } = {};
    if (!/^\+?[\d\s-]{10,16}$/.test(phone.trim())) errs.phone = "Enter a valid phone number.";
    if (address.trim().length < 12) errs.address = "Address must be at least 12 characters.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setEditing(false);
      toast.success("Profile updated", {
        description: "Your contact details were sent to HR records.",
      });
    }, 900);
  }

  return (
    <EmployeeLayout
      title="My Profile"
      subtitle="Employee self-service · Only contact details are editable"
      actions={
        editing ? (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg"
            onClick={() => {
              setEditing(false);
              setErrors({});
              setPhone(employee.phone);
              setAddress(employee.address);
            }}
          >
            <X className="h-4 w-4" /> Cancel
          </Button>
        ) : (
          <Button size="sm" className="rounded-lg" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" /> Edit details
          </Button>
        )
      }
    >
      {/* Header card */}
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <div className="grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
          <div className="relative w-fit">
            <Avatar className="h-24 w-24 ring-4 ring-accent">
              <AvatarFallback className="bg-brand-gradient text-2xl font-semibold text-primary-foreground">
                AS
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() =>
                toast.success("Profile picture updated", {
                  description: "It may take a minute to appear across Workora.",
                })
              }
              className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-foreground shadow-card transition-colors hover:bg-accent"
            >
              <Camera className="h-4 w-4" />
              <span className="sr-only">Change profile picture</span>
            </button>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-2xl font-semibold tracking-tight text-foreground">
                {employee.name}
              </h2>
              <Pill tone="success">Active</Pill>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {employee.designation} · {employee.department}
            </p>
            <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Employee ID", employee.id],
                ["Login ID", employee.loginId],
                ["Reporting to", employee.manager],
                ["Location", employee.location],
              ].map(([k, v]) => (
                <div key={k} className="min-w-0">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
                  <dd className="truncate text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <Tabs defaultValue="personal" className="mt-5">
        <TabsList className="w-full justify-start overflow-x-auto rounded-xl">
          <TabsTrigger value="personal">Personal details</TabsTrigger>
          <TabsTrigger value="job">Job details</TabsTrigger>
          <TabsTrigger value="salary">Salary structure</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-4">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Panel
              title="Personal details"
              description="Fields marked editable can be updated by you"
            >
              {editing ? (
                <form onSubmit={onSave} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      aria-invalid={!!errors.phone}
                    />
                    {errors.phone ? (
                      <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                        <AlertCircle className="h-3.5 w-3.5" /> {errors.phone}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Used for payroll and emergency communication.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Residential address</Label>
                    <Textarea
                      id="address"
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      aria-invalid={!!errors.address}
                    />
                    {errors.address && (
                      <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                        <AlertCircle className="h-3.5 w-3.5" /> {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
                    <Lock className="mr-1.5 inline h-3.5 w-3.5" />
                    Name, date of birth and identity details are maintained by HR. Raise a request
                    with your HR partner to change them.
                  </div>

                  <Button type="submit" className="rounded-lg" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" /> Save changes
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <dl>
                  <InfoRow label="Full name" value={employee.name} />
                  <InfoRow label="Date of birth" value={employee.dateOfBirth} />
                  <InfoRow label="Gender" value={employee.gender} />
                  <InfoRow label="Marital status" value={employee.maritalStatus} />
                  <InfoRow label="Nationality" value={employee.nationality} />
                  <InfoRow label="Work email" value={employee.workEmail} />
                  <InfoRow label="Personal email" value={employee.personalEmail} />
                  <InfoRow label="Phone number" value={phone} editable />
                  <InfoRow label="Address" value={address} editable />
                  <InfoRow label="Emergency contact" value={employee.emergencyContact} />
                </dl>
              )}
            </Panel>

            <Panel title="Bank & statutory">
              <dl>
                <InfoRow label="Bank name" value={employee.bankName} />
                <InfoRow label="Account number" value={employee.accountNumber} />
                <InfoRow label="IFSC code" value={employee.ifsc} />
                <InfoRow label="PAN" value={employee.pan} />
                <InfoRow label="UAN" value={employee.uan} />
              </dl>
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="job" className="mt-4">
          <Panel title="Job details" description="Maintained by HR — read only">
            <dl className="sm:grid sm:grid-cols-2 sm:gap-x-8">
              <InfoRow label="Designation" value={employee.designation} />
              <InfoRow label="Department" value={employee.department} />
              <InfoRow label="Employment type" value={employee.employmentType} />
              <InfoRow label="Date of joining" value={employee.dateOfJoining} />
              <InfoRow label="Reporting manager" value={employee.manager} />
              <InfoRow label="Work location" value={employee.location} />
              <InfoRow label="Shift" value={employee.shift} />
              <InfoRow label="Working days / week" value={`${employee.workingDays} days`} />
            </dl>
            <p className="mt-4 flex items-center gap-2 rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5 shrink-0" />
              Job information changes follow an approval workflow through your HR business partner.
            </p>
          </Panel>
        </TabsContent>

        <TabsContent value="salary" className="mt-4">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Panel title="Salary structure" description="Auto-calculated from your monthly wage">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[460px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="pb-2 font-medium">Component</th>
                      <th className="pb-2 text-right font-medium">% of wage</th>
                      <th className="pb-2 text-right font-medium">Monthly</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {salary.components.map((c) => (
                      <tr key={c.label}>
                        <td className="py-3">
                          <p className="font-medium text-foreground">{c.label}</p>
                          <p className="text-xs text-muted-foreground">{c.note}</p>
                        </td>
                        <td className="py-3 text-right tabular-nums text-muted-foreground">
                          {c.pct}%
                        </td>
                        <td className="py-3 text-right font-medium tabular-nums text-foreground">
                          {money(c.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <div className="space-y-5">
              <Panel title="Wage">
                <dl>
                  <InfoRow label="Monthly wage" value={money(salary.monthlyWage)} />
                  <InfoRow label="Yearly wage" value={money(salary.yearlyWage)} />
                  <InfoRow label="Computation" value="Fixed wage · percentage components" />
                </dl>
              </Panel>
              <Panel title="Deductions & net">
                <ul className="space-y-2 text-sm">
                  {salary.deductions.map((d) => (
                    <li key={d.label} className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate text-muted-foreground">{d.label}</span>
                      <span className="tabular-nums text-foreground">−{money(d.amount)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Wallet className="h-4 w-4" /> Net pay
                  </span>
                  <span className="text-lg font-semibold text-success">{money(netPay)}</span>
                </div>
              </Panel>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Panel title="Documents" description="Uploaded and verified by HR">
            <ul className="divide-y divide-border">
              {documents.map((d) => (
                <li
                  key={d.name}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-muted-foreground">
                    <FileText className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{d.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {d.type} · {d.size} · uploaded {d.uploaded}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => toast.success(`Downloading ${d.name}`)}
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only">Download</span>
                  </Button>
                </li>
              ))}
            </ul>
          </Panel>
        </TabsContent>
      </Tabs>
    </EmployeeLayout>
  );
}
