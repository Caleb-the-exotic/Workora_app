import { createFileRoute } from "@tanstack/react-router";
import { Download, IndianRupee, PiggyBank, Receipt } from "lucide-react";
import { toast } from "sonner";

import { EmployeeLayout } from "@/components/employee/EmployeeLayout";
import { Panel, Pill, StatCard } from "@/components/employee/primitives";
import { Button } from "@/components/ui/button";
import { money, netPay, payslips, salary } from "@/lib/employee-data";

export const Route = createFileRoute("/employee/payroll")({
  head: () => ({
    meta: [
      { title: "Payroll & Payslips — Workora HRMS" },
      {
        name: "description",
        content: "View salary structure, monthly breakdown, deductions and download payslips.",
      },
      { property: "og:title", content: "Payroll & Payslips — Workora HRMS" },
      { property: "og:description", content: "Your salary breakdown and payslips on Workora." },
    ],
  }),
  component: PayrollPage,
});

function PayrollPage() {
  const totalDeductions = salary.deductions.reduce((s, d) => s + d.amount, 0);

  return (
    <EmployeeLayout
      title="Payroll"
      subtitle="Salary structure, deductions and payslips"
      actions={
        <Button
          size="sm"
          variant="outline"
          className="rounded-lg"
          onClick={() => toast.success("Latest payslip downloaded")}
        >
          <Download className="h-4 w-4" /> Payslip
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Monthly gross"
          value={money(salary.monthlyWage)}
          hint="CTC basis"
          tone="info"
          icon={<IndianRupee className="h-4 w-4" />}
        />
        <StatCard
          label="Deductions"
          value={money(totalDeductions)}
          hint="PF, PT and TDS"
          tone="warning"
          icon={<Receipt className="h-4 w-4" />}
        />
        <StatCard
          label="Net take-home"
          value={money(netPay)}
          hint="Credited on the last working day"
          tone="success"
          icon={<PiggyBank className="h-4 w-4" />}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Salary components" description="Monthly breakdown">
          <ul className="divide-y divide-border text-sm">
            {salary.components.map((c) => (
              <li key={c.label} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{c.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.note}</p>
                </div>
                <span className="shrink-0 tabular-nums font-medium text-foreground">
                  {money(c.amount)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Deductions" description="Statutory and tax">
          <ul className="divide-y divide-border text-sm">
            {salary.deductions.map((d) => (
              <li key={d.label} className="flex items-center justify-between gap-4 py-3">
                <span className="text-muted-foreground">{d.label}</span>
                <span className="tabular-nums font-medium text-foreground">-{money(d.amount)}</span>
              </li>
            ))}
            <li className="flex items-center justify-between gap-4 py-3">
              <span className="font-medium text-foreground">Net pay</span>
              <span className="tabular-nums font-semibold text-foreground">{money(netPay)}</span>
            </li>
          </ul>
        </Panel>
      </div>

      <Panel title="Payslips" description="Last 4 months" className="mt-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 font-medium">Month</th>
                <th className="pb-2 font-medium">Net pay</th>
                <th className="pb-2 font-medium">Credited</th>
                <th className="pb-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payslips.map((p) => (
                <tr key={p.month}>
                  <td className="py-3 font-medium text-foreground">{p.month}</td>
                  <td className="py-3 tabular-nums text-foreground">{money(p.net)}</td>
                  <td className="py-3 text-muted-foreground">{p.credited}</td>
                  <td className="py-3 text-right">
                    <Pill tone="success">{p.status}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </EmployeeLayout>
  );
}
