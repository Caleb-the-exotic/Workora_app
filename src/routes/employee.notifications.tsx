import { createFileRoute } from "@tanstack/react-router";
import { BellRing, CheckCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmployeeLayout } from "@/components/employee/EmployeeLayout";
import { EmptyState, Panel, StatusDot } from "@/components/employee/primitives";
import { Button } from "@/components/ui/button";
import { getNotifications } from "@/lib/employee-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/employee/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Workora HRMS" },
      {
        name: "description",
        content: "Approvals, payslip alerts and policy updates from your HR team.",
      },
      { property: "og:title", content: "Notifications — Workora HRMS" },
      { property: "og:description", content: "Everything that needs your attention on Workora." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const [items, setItems] = useState(() => getNotifications().map((n) => ({ ...n })));
  const unread = items.filter((i) => i.unread).length;

  return (
    <EmployeeLayout
      title="Notifications"
      subtitle={unread ? `${unread} unread updates` : "You're all caught up"}
      actions={
        <Button
          size="sm"
          variant="outline"
          className="rounded-lg"
          disabled={!unread}
          onClick={() => {
            setItems((p) => p.map((n) => ({ ...n, unread: false })));
            toast.success("All notifications marked as read");
          }}
        >
          <CheckCheck className="h-4 w-4" /> Mark all read
        </Button>
      }
    >
      <Panel title="Inbox" description="Latest first">
        {items.length === 0 ? (
          <EmptyState title="Nothing here" description="New updates will appear in this inbox." />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((n) => (
              <li
                key={n.id}
                className={cn(
                  "flex items-start gap-3 py-4 first:pt-0 last:pb-0",
                  n.unread && "cursor-pointer",
                )}
                onClick={() =>
                  setItems((p) => p.map((x) => (x.id === n.id ? { ...x, unread: false } : x)))
                }
              >
                <span className="mt-1">
                  <StatusDot tone={n.tone} />
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm text-foreground",
                      n.unread ? "font-semibold" : "font-medium",
                    )}
                  >
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{n.time}</p>
                </div>
                {n.unread && (
                  <span className="mt-1 shrink-0 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase text-accent-foreground">
                    New
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Preferences" description="Where we send alerts" className="mt-5">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <BellRing className="h-4 w-4" />
          Email and in-app notifications are enabled. Change them in Settings.
        </div>
      </Panel>
    </EmployeeLayout>
  );
}
