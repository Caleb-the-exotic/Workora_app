import { createFileRoute } from "@tanstack/react-router";
import {
  BellRing,
  Building2,
  CalendarCheck,
  Check,
  CreditCard,
  Globe2,
  Lock,
  Mail,
  Save,
  Shield,
  Sliders,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Panel } from "@/components/employee/primitives";
import { HRLayout } from "@/components/hr/HRLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/hr/settings")({
  head: () => ({
    meta: [
      { title: "Settings & HR Policies — Workora HRMS" },
      {
        name: "description",
        content:
          "Manage organization profile, leave policies, payroll cycle settings, and HR notification preferences.",
      },
      { property: "og:title", content: "Settings & HR Policies — Workora HRMS" },
      { property: "og:description", content: "HR operations configuration on Workora." },
    ],
  }),
  component: HRSettingsPage,
});

export function HRSettingsPage() {
  const [saving, setSaving] = useState(false);

  // Org Settings State
  const [org, setOrg] = useState({
    name: "Workora Technologies Pvt. Ltd.",
    cin: "U72200KA2022PTC158492",
    gst: "29AABCU9603R1ZX",
    address: "Tower 4, 6th Floor, Prestige Tech Park, Marathahalli-Sarjapur Ring Rd, Bengaluru 560103",
    supportEmail: "hr@workora.io",
    currency: "INR (₹)",
    timezone: "Asia/Kolkata (GMT+5:30)",
    fiscalYearStart: "April",
  });

  // Leave Policy State
  const [leavePolicy, setLeavePolicy] = useState({
    annualPaidDays: "24",
    annualSickDays: "10",
    maxCarryForward: "12",
    probationDays: "90",
    allowNegativeBalance: false,
    requireDoctorNoteDays: "2",
    countWeekendsInLeave: false,
  });

  // Payroll Cycle State
  const [payrollConfig, setPayrollConfig] = useState({
    payday: "30",
    cutoffDay: "25",
    pfEnabled: true,
    pfEmployerContribution: "12",
    esiEnabled: true,
    ptaxEnabled: true,
    autoLockCycle: true,
  });

  // Notifications State
  const [notifPrefs, setNotifPrefs] = useState({
    urgentLeaveRequests: true,
    attendanceMissingCheckout: true,
    payrollCutoffAlert: true,
    newEmployeeDocs: true,
    dailyHrDigest: false,
    smsAlerts: false,
  });

  const handleSave = async (section: string) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success(`${section} settings saved successfully`);
  };

  return (
    <HRLayout
      title="HR Settings & Policies"
      subtitle="Configure organisation defaults, statutory quotas, payroll dates and alerts"
      actions={
        <Button
          size="sm"
          className="gap-2 rounded-lg"
          disabled={saving}
          onClick={() => handleSave("All")}
        >
          {saving ? <Save className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span className="hidden sm:inline">Save changes</span>
        </Button>
      }
    >
      <Tabs defaultValue="org" className="space-y-6">
        <TabsList className="h-11 w-full justify-start overflow-x-auto rounded-xl bg-secondary/80 p-1">
          <TabsTrigger value="org" className="gap-2 rounded-lg text-xs sm:text-sm">
            <Building2 className="h-4 w-4" /> Organisation
          </TabsTrigger>
          <TabsTrigger value="leave" className="gap-2 rounded-lg text-xs sm:text-sm">
            <CalendarCheck className="h-4 w-4" /> Leave Policy
          </TabsTrigger>
          <TabsTrigger value="payroll" className="gap-2 rounded-lg text-xs sm:text-sm">
            <CreditCard className="h-4 w-4" /> Payroll Cycle
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 rounded-lg text-xs sm:text-sm">
            <BellRing className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 rounded-lg text-xs sm:text-sm">
            <Shield className="h-4 w-4" /> Roles & Security
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Organisation Profile */}
        <TabsContent value="org" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Panel
              title="Organisation Profile"
              description="Official company legal and registration information"
            >
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="orgName">Legal Entity Name</Label>
                  <Input
                    id="orgName"
                    value={org.name}
                    onChange={(e) => setOrg({ ...org, name: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="cin">CIN / Registration No.</Label>
                    <Input
                      id="cin"
                      value={org.cin}
                      onChange={(e) => setOrg({ ...org, cin: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="gst">GSTIN / Tax ID</Label>
                    <Input
                      id="gst"
                      value={org.gst}
                      onChange={(e) => setOrg({ ...org, gst: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="orgAddress">Registered Head Office Address</Label>
                  <Textarea
                    id="orgAddress"
                    rows={3}
                    value={org.address}
                    onChange={(e) => setOrg({ ...org, address: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="supportEmail">HR Helpdesk Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={org.supportEmail}
                      onChange={(e) => setOrg({ ...org, supportEmail: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="fiscalYear">Fiscal Year Cycle</Label>
                    <Select
                      value={org.fiscalYearStart}
                      onValueChange={(v) => setOrg({ ...org, fiscalYearStart: v })}
                    >
                      <SelectTrigger id="fiscalYear">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="April">April – March (Indian Standard)</SelectItem>
                        <SelectItem value="January">January – December (Calendar Year)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  className="rounded-lg"
                  disabled={saving}
                  onClick={() => handleSave("Organisation")}
                >
                  Save Organisation Profile
                </Button>
              </div>
            </Panel>

            <div className="space-y-6">
              <Panel
                title="Regional Preferences"
                description="Timezone, currency and localization defaults"
              >
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Default Currency</Label>
                    <Select
                      value={org.currency}
                      onValueChange={(v) => setOrg({ ...org, currency: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR (₹)">INR (₹) — Indian Rupee</SelectItem>
                        <SelectItem value="USD ($)">USD ($) — US Dollar</SelectItem>
                        <SelectItem value="EUR (€)">EUR (€) — Euro</SelectItem>
                        <SelectItem value="GBP (£)">GBP (£) — British Pound</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Operating Timezone</Label>
                    <Select
                      value={org.timezone}
                      onValueChange={(v) => setOrg({ ...org, timezone: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata (GMT+5:30)">
                          Asia/Kolkata (GMT+5:30)
                        </SelectItem>
                        <SelectItem value="America/New_York (GMT-4:00)">
                          America/New_York (GMT-4:00)
                        </SelectItem>
                        <SelectItem value="Europe/London (GMT+1:00)">
                          Europe/London (GMT+1:00)
                        </SelectItem>
                        <SelectItem value="Asia/Singapore (GMT+8:00)">
                          Asia/Singapore (GMT+8:00)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/40 p-4 text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground">Timezone Sync Active</p>
                    <p className="mt-1">
                      Check-in/out timestamps and automatic late marks are calculated according to the selected timezone.
                    </p>
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Leave Policy */}
        <TabsContent value="leave" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Panel
              title="Statutory Leave Allocations"
              description="Define annual quotas for employees on standard full-time contracts"
            >
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="paidDays">Annual Paid Time-Off (PTO)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="paidDays"
                        type="number"
                        value={leavePolicy.annualPaidDays}
                        onChange={(e) =>
                          setLeavePolicy({ ...leavePolicy, annualPaidDays: e.target.value })
                        }
                      />
                      <span className="text-xs text-muted-foreground">days/yr</span>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="sickDays">Annual Sick Leave Quota</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="sickDays"
                        type="number"
                        value={leavePolicy.annualSickDays}
                        onChange={(e) =>
                          setLeavePolicy({ ...leavePolicy, annualSickDays: e.target.value })
                        }
                      />
                      <span className="text-xs text-muted-foreground">days/yr</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="carryOver">Max Annual Carry-Over</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="carryOver"
                        type="number"
                        value={leavePolicy.maxCarryForward}
                        onChange={(e) =>
                          setLeavePolicy({ ...leavePolicy, maxCarryForward: e.target.value })
                        }
                      />
                      <span className="text-xs text-muted-foreground">days</span>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="probation">Probationary Period</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="probation"
                        type="number"
                        value={leavePolicy.probationDays}
                        onChange={(e) =>
                          setLeavePolicy({ ...leavePolicy, probationDays: e.target.value })
                        }
                      />
                      <span className="text-xs text-muted-foreground">days</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Require Medical Certificate for Sick Leave
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Mandatory certificate upload if sick leave exceeds 2 consecutive days.
                      </p>
                    </div>
                    <Switch
                      checked={Number(leavePolicy.requireDoctorNoteDays) > 0}
                      onCheckedChange={(c) =>
                        setLeavePolicy({
                          ...leavePolicy,
                          requireDoctorNoteDays: c ? "2" : "0",
                        })
                      }
                    />
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Count Weekends as Leave Days
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Sandwich rule: if an employee takes Friday and Monday, count Saturday/Sunday as leave days.
                      </p>
                    </div>
                    <Switch
                      checked={leavePolicy.countWeekendsInLeave}
                      onCheckedChange={(c) =>
                        setLeavePolicy({ ...leavePolicy, countWeekendsInLeave: c })
                      }
                    />
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Allow Negative Leave Balance
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Permit employees to advance-borrow paid leave against upcoming accrual cycles.
                      </p>
                    </div>
                    <Switch
                      checked={leavePolicy.allowNegativeBalance}
                      onCheckedChange={(c) =>
                        setLeavePolicy({ ...leavePolicy, allowNegativeBalance: c })
                      }
                    />
                  </div>
                </div>

                <Button
                  className="rounded-lg"
                  disabled={saving}
                  onClick={() => handleSave("Leave Policy")}
                >
                  Save Leave Policies
                </Button>
              </div>
            </Panel>

            <Panel title="Leave Types Overview" description="Standard categories configured">
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between rounded-xl border border-border p-3">
                  <div>
                    <p className="font-semibold text-foreground">Paid Time Off (PTO)</p>
                    <p className="text-xs text-muted-foreground">Accrues 2 days / month</p>
                  </div>
                  <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                    Active
                  </span>
                </li>
                <li className="flex items-center justify-between rounded-xl border border-border p-3">
                  <div>
                    <p className="font-semibold text-foreground">Sick Leave</p>
                    <p className="text-xs text-muted-foreground">10 days credited annually</p>
                  </div>
                  <span className="rounded-full bg-info/15 px-2.5 py-1 text-xs font-semibold text-info">
                    Active
                  </span>
                </li>
                <li className="flex items-center justify-between rounded-xl border border-border p-3">
                  <div>
                    <p className="font-semibold text-foreground">Maternity / Paternity</p>
                    <p className="text-xs text-muted-foreground">Statutory 26 weeks / 2 weeks</p>
                  </div>
                  <span className="rounded-full bg-pending/15 px-2.5 py-1 text-xs font-semibold text-pending">
                    Active
                  </span>
                </li>
                <li className="flex items-center justify-between rounded-xl border border-border p-3">
                  <div>
                    <p className="font-semibold text-foreground">Compensatory Off</p>
                    <p className="text-xs text-muted-foreground">Credited on holiday shifts</p>
                  </div>
                  <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                    Active
                  </span>
                </li>
              </ul>
            </Panel>
          </div>
        </TabsContent>

        {/* Tab 3: Payroll Cycle */}
        <TabsContent value="payroll" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Panel
              title="Payroll Schedules & Deadlines"
              description="Monthly cycle locks, salary computation windows and disbursal dates"
            >
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="payday">Salary Disbursal Day</Label>
                    <Select
                      value={payrollConfig.payday}
                      onValueChange={(v) => setPayrollConfig({ ...payrollConfig, payday: v })}
                    >
                      <SelectTrigger id="payday">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="28">28th of every month</SelectItem>
                        <SelectItem value="30">Last working day of month (30th/31st)</SelectItem>
                        <SelectItem value="1">1st of following month</SelectItem>
                        <SelectItem value="5">5th of following month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="cutoff">Attendance & Data Cut-Off Day</Label>
                    <Select
                      value={payrollConfig.cutoffDay}
                      onValueChange={(v) => setPayrollConfig({ ...payrollConfig, cutoffDay: v })}
                    >
                      <SelectTrigger id="cutoff">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20">20th of the month</SelectItem>
                        <SelectItem value="25">25th of the month</SelectItem>
                        <SelectItem value="27">27th of the month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Statutory Deductions & Contributions
                  </p>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Provident Fund (EPF) Deduction
                      </p>
                      <p className="text-xs text-muted-foreground">
                        12% employee deduction + 12% matching employer contribution
                      </p>
                    </div>
                    <Switch
                      checked={payrollConfig.pfEnabled}
                      onCheckedChange={(c) => setPayrollConfig({ ...payrollConfig, pfEnabled: c })}
                    />
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Professional Tax (PT)</p>
                      <p className="text-xs text-muted-foreground">
                        State statutory slabs (e.g. ₹200/mo Karnataka standard)
                      </p>
                    </div>
                    <Switch
                      checked={payrollConfig.ptaxEnabled}
                      onCheckedChange={(c) =>
                        setPayrollConfig({ ...payrollConfig, ptaxEnabled: c })
                      }
                    />
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Auto-Lock Cycle on Cut-off Date
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Prevent modification to salary records after 18:00 on the 25th of the month.
                      </p>
                    </div>
                    <Switch
                      checked={payrollConfig.autoLockCycle}
                      onCheckedChange={(c) =>
                        setPayrollConfig({ ...payrollConfig, autoLockCycle: c })
                      }
                    />
                  </div>
                </div>

                <Button
                  className="rounded-lg"
                  disabled={saving}
                  onClick={() => handleSave("Payroll Cycle")}
                >
                  Save Payroll Settings
                </Button>
              </div>
            </Panel>

            <Panel
              title="Next Payroll Schedule"
              description="August 2026 active cycle milestones"
            >
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-warning/15 text-warning font-bold">
                    25
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Attendance & Expense Cut-Off</p>
                    <p className="text-muted-foreground">25 Aug 2026 · 18:00 IST</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-info/15 text-info font-bold">
                    27
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Audit & Reconciliation Review</p>
                    <p className="text-muted-foreground">27 Aug 2026 · 14:00 IST</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-success/15 text-success font-bold">
                    30
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Bank Disbursal & Payslips</p>
                    <p className="text-muted-foreground">30 Aug 2026 · Direct NEFT/IMPS</p>
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        </TabsContent>

        {/* Tab 4: Notification Preferences */}
        <TabsContent value="notifications" className="space-y-6">
          <Panel
            title="HR Notification Preferences"
            description="Control which operational triggers dispatch alerts to your HR inbox and email"
          >
            <div className="space-y-4 max-w-2xl">
              {[
                {
                  key: "urgentLeaveRequests",
                  title: "Urgent Leave Requests",
                  desc: "Instant notification when leave starting within 48 hours is requested.",
                },
                {
                  key: "attendanceMissingCheckout",
                  title: "Missing Check-Outs & Anomaly Alerts",
                  desc: "Daily morning digest of employees who did not punch out the prior evening.",
                },
                {
                  key: "payrollCutoffAlert",
                  title: "Payroll Cut-Off Reminders",
                  desc: "3-day, 1-day, and same-day countdown notifications before the cycle locks.",
                },
                {
                  key: "newEmployeeDocs",
                  title: "Employee Document Uploads",
                  desc: "Notify when a new hire submits Aadhaar, PAN, or bank credentials for verification.",
                },
                {
                  key: "dailyHrDigest",
                  title: "Daily 09:00 AM Headcount Digest",
                  desc: "Summary email containing today's attendance forecast and on-leave list.",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-start justify-between gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-secondary/40"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifPrefs[item.key as keyof typeof notifPrefs]}
                    onCheckedChange={(c) =>
                      setNotifPrefs({ ...notifPrefs, [item.key]: c })
                    }
                  />
                </div>
              ))}

              <Button
                className="rounded-lg mt-2"
                disabled={saving}
                onClick={() => handleSave("Notification Preferences")}
              >
                Save Preferences
              </Button>
            </div>
          </Panel>
        </TabsContent>

        {/* Tab 5: Security */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Panel title="Role-Based Access Control" description="Permission matrix for HR and Admins">
              <div className="space-y-3">
                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Super Administrator</p>
                      <p className="text-xs text-muted-foreground">
                        Full access to salary structures, bank details, policy rules, and employee records
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
                      2 users
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">HR Officer / Operations</p>
                      <p className="text-xs text-muted-foreground">
                        Manage approvals, attendance regularisation, and employee profiles
                      </p>
                    </div>
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-foreground">
                      4 users
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Payroll Specialist</p>
                      <p className="text-xs text-muted-foreground">
                        Process payroll runs, configure deductions, and issue payslips
                      </p>
                    </div>
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-foreground">
                      2 users
                    </span>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel title="Security Actions" description="Session management and audit">
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-lg"
                  onClick={() => toast.success("Password reset instructions dispatched to your email")}
                >
                  <Lock className="mr-2 h-4 w-4" /> Change Admin Password
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-lg"
                  onClick={() => toast.success("Audit trail log downloaded")}
                >
                  <Shield className="mr-2 h-4 w-4" /> Download Security Audit Log
                </Button>
              </div>
            </Panel>
          </div>
        </TabsContent>
      </Tabs>
    </HRLayout>
  );
}
