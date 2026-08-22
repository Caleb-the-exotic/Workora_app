import { Link } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

import { Logo } from "@/components/auth/AuthLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tone = "success" | "info" | "warning" | "pending";

const toneClass: Record<Tone, string> = {
  success: "bg-success/12 text-success",
  info: "bg-info/12 text-info",
  warning: "bg-warning/15 text-warning",
  pending: "bg-pending/12 text-pending",
};

export function DashboardShell({
  role,
  title,
  description,
  cards,
}: {
  role: string;
  title: string;
  description: string;
  cards: { label: string; value: string; tone: Tone }[];
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Logo compact />
            <Badge variant="secondary" className="shrink-0 rounded-full">
              {role}
            </Badge>
          </div>
          <Button asChild variant="ghost" size="sm" className="rounded-lg">
            <Link to="/">
              <LogOut className="h-4 w-4" /> Sign out
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <div key={c.label} className="rounded-2xl border border-border bg-surface p-5 shadow-card">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{c.value}</p>
              <span
                className={cn(
                  "mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                  toneClass[c.tone],
                )}
              >
                {c.tone}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
