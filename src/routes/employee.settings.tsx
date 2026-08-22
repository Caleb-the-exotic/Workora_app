import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { EmployeeLayout } from "@/components/employee/EmployeeLayout";
import { Panel } from "@/components/employee/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getEmployee } from "@/lib/employee-data";

export const Route = createFileRoute("/employee/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Workora HRMS" },
      {
        name: "description",
        content: "Manage your Workora account details, notification preferences and security.",
      },
      { property: "og:title", content: "Settings — Workora HRMS" },
      { property: "og:description", content: "Account, notification and security preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const employee = getEmployee();
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({ email: true, push: true, weekly: false });

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    toast.success("Settings saved");
  };

  return (
    <EmployeeLayout title="Settings" subtitle="Account, notifications and security">
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Account" description="Basic details used across Workora">
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" defaultValue={employee.name} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" defaultValue={employee.workEmail} readOnly className="bg-muted" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" defaultValue={employee.phone} />
            </div>
            <Button className="w-fit rounded-lg" disabled={saving} onClick={save}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </Panel>

        <div className="grid gap-5">
          <Panel title="Notifications" description="Choose what reaches you">
            <div className="space-y-4">
              {(
                [
                  ["email", "Email alerts", "Approvals, payslips and policy updates"],
                  ["push", "In-app notifications", "Realtime updates inside Workora"],
                  ["weekly", "Weekly digest", "A Monday summary of attendance and leave"],
                ] as const
              ).map(([key, label, desc]) => (
                <div key={key} className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    checked={prefs[key]}
                    onCheckedChange={(v) => {
                      setPrefs((p) => ({ ...p, [key]: v }));
                      toast.success(`${label} ${v ? "enabled" : "disabled"}`);
                    }}
                  />
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Security" description="Keep your account safe">
            <div className="grid gap-3">
              <Button
                variant="outline"
                className="w-fit rounded-lg"
                onClick={() => toast("Password reset link sent to your work email")}
              >
                Change password
              </Button>
              <Button
                variant="outline"
                className="w-fit rounded-lg"
                onClick={() => toast.success("Signed out of all other devices")}
              >
                Sign out other devices
              </Button>
            </div>
          </Panel>
        </div>
      </div>
    </EmployeeLayout>
  );
}
