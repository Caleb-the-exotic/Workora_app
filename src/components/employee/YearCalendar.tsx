import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { getHolidays } from "@/lib/data";
import { cn } from "@/lib/utils";

export type DayKind = "holiday" | "leave" | "pending" | "weekoff" | "workday";

export function getHolidayMap(): Record<string, string> {
  const holidays = getHolidays();
  const map: Record<string, string> = {};
  holidays.forEach((h) => { map[h.date] = h.name; });
  return map;
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const legend: { kind: DayKind; label: string; className: string }[] = [
  { kind: "holiday", label: "Public holiday", className: "bg-destructive/15 text-destructive" },
  { kind: "leave", label: "Approved leave", className: "bg-success/18 text-success" },
  { kind: "pending", label: "Pending leave", className: "bg-pending/18 text-pending" },
  { kind: "weekoff", label: "Week off", className: "bg-muted text-muted-foreground" },
  { kind: "workday", label: "Working day", className: "bg-surface text-foreground border border-border" },
];

const kindClass: Record<DayKind, string> = {
  holiday: "bg-destructive/15 text-destructive font-semibold",
  leave: "bg-success/18 text-success font-semibold",
  pending: "bg-pending/18 text-pending font-semibold",
  weekoff: "text-muted-foreground",
  workday: "text-foreground",
};

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export function YearCalendar({
  defaultYear = 2026,
  approved = [],
  pending = [],
}: {
  defaultYear?: number;
  /** ISO date strings */
  approved?: string[];
  pending?: string[];
}) {
  const [year, setYear] = useState(defaultYear);
  const approvedSet = useMemo(() => new Set(approved), [approved]);
  const pendingSet = useMemo(() => new Set(pending), [pending]);
  const holidayMap = useMemo(() => getHolidayMap(), []);

  const kindOf = (date: string, weekday: number): DayKind => {
    if (holidayMap[date] && date.startsWith(String(year))) return "holiday";
    if (approvedSet.has(date)) return "leave";
    if (pendingSet.has(date)) return "pending";
    if (weekday === 0 || weekday === 6) return "weekoff";
    return "workday";
  };

  const yearHolidays = Object.entries(holidayMap).filter(([d]) => d.startsWith(String(year)));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setYear((y) => y - 1)}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous year</span>
          </Button>
          <span className="min-w-[64px] text-center text-sm font-semibold tabular-nums text-foreground">
            {year}
          </span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setYear((y) => y + 1)}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next year</span>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {legend.map((l) => (
            <span key={l.kind} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={cn("h-3.5 w-3.5 rounded-[5px]", l.className)} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {monthNames.map((name, m) => {
          const first = new Date(year, m, 1).getDay();
          const total = new Date(year, m + 1, 0).getDate();
          const cells: (number | null)[] = [
            ...Array.from({ length: first }, () => null),
            ...Array.from({ length: total }, (_, i) => i + 1),
          ];

          return (
            <div key={name} className="rounded-xl border border-border bg-surface p-3">
              <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-foreground">
                {name}
              </p>
              <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium text-muted-foreground">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <span key={i} className="py-1">
                    {d}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {cells.map((d, i) => {
                  if (d === null) return <span key={i} className="py-1" />;
                  const date = iso(year, m, d);
                  const kind = kindOf(date, new Date(year, m, d).getDay());
                  const holidayName = holidayMap[date];
                  return (
                    <span
                      key={i}
                      title={holidayName ?? date}
                      className={cn(
                        "rounded-[5px] py-1 text-[11px] tabular-nums",
                        kindClass[kind],
                      )}
                    >
                      {d}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {yearHolidays.length > 0 && (
        <div className="rounded-xl border border-border bg-secondary/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Holiday list {year}
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {yearHolidays.map(([d, label]) => (
              <li key={d} className="flex items-center justify-between gap-3 text-xs">
                <span className="text-foreground">{label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {new Date(d).toLocaleDateString(undefined, {
                    day: "2-digit",
                    month: "short",
                    weekday: "short",
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
