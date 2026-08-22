import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type Tone = "success" | "info" | "warning" | "pending" | "muted";

export const toneClass: Record<Tone, string> = {
  success: "bg-success/12 text-success",
  info: "bg-info/12 text-info",
  warning: "bg-warning/18 text-warning",
  pending: "bg-pending/12 text-pending",
  muted: "bg-muted text-muted-foreground",
};

export const toneDot: Record<Tone, string> = {
  success: "bg-success",
  info: "bg-info",
  warning: "bg-warning",
  pending: "bg-pending",
  muted: "bg-muted-foreground",
};

export function Pill({ tone = "muted", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        toneClass[tone],
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({ tone }: { tone: Tone }) {
  return <span className={cn("h-2 w-2 shrink-0 rounded-full", toneDot[tone])} />;
}

export function Panel({
  title,
  description,
  action,
  className,
  children,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn("rounded-2xl border border-border bg-surface shadow-card", className)}
    >
      {(title || action) && (
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            {title && (
              <h2 className="truncate text-sm font-semibold tracking-tight text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function InfoRow({
  label,
  value,
  editable = false,
}: {
  label: string;
  value: ReactNode;
  editable?: boolean;
}) {
  return (
    <div className="grid gap-1 border-b border-border/70 py-3 last:border-0 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)] sm:gap-4">
      <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
        {editable ? (
          <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-normal text-accent-foreground">
            Editable
          </span>
        ) : (
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">
            Read-only
          </span>
        )}
      </dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-secondary text-muted-foreground">
        <Inbox className="h-5 w-5" />
      </span>
      <p className="mt-3 text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "muted",
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: Tone;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {icon && (
          <span className={cn("grid h-8 w-8 place-items-center rounded-lg", toneClass[tone])}>
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
