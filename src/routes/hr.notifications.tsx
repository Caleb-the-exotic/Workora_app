import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  CalendarCheck2,
  CalendarClock,
  CheckCheck,
  Clock3,
  FileSpreadsheet,
  Filter,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

import { EmptyState, Panel, Pill } from "@/components/employee/primitives";
import { HRLayout } from "@/components/hr/HRLayout";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type NotificationCategory = "all" | "approval" | "leave" | "attendance" | "payroll" | "system";

type HRNotificationItem = {
  id: string;
  category: "approval" | "leave" | "attendance" | "payroll" | "system";
  title: string;
  body: string;
  time: string;
  timestamp: string;
  unread: boolean;
  actionUrl?: string;
  actionLabel?: string;
  actor?: string;
};

const initialNotifications: HRNotificationItem[] = [
  {
    id: "HRN-101",
    category: "approval",
    title: "4 leave requests awaiting decision",
    body: "Ananya Sharma, Sanjay Pillai and 2 others have pending leave requests. Oldest request was submitted 2 days ago.",
    time: "10 min ago",
    timestamp: "22 Aug 2026, 10:15 AM",
    unread: true,
    actionUrl: "/hr/approvals",
    actionLabel: "Review queue",
    actor: "System",
  },
  {
    id: "HRN-102",
    category: "payroll",
    title: "August payroll cycle cut-off in 3 days",
    body: "Payroll locks on 25 Aug at 18:00 IST. 2 flagged items need employee salary structure reconciliation.",
    time: "1 hour ago",
    timestamp: "22 Aug 2026, 09:30 AM",
    unread: true,
    actionUrl: "/hr/payroll",
    actionLabel: "Check payroll",
    actor: "Payroll Bot",
  },
  {
    id: "HRN-103",
    category: "attendance",
    title: "14 unregularised attendance marks",
    body: "Missing check-outs recorded for Friday shift across Engineering and Sales departments.",
    time: "3 hours ago",
    timestamp: "22 Aug 2026, 07:45 AM",
    unread: true,
    actionUrl: "/hr/attendance",
    actionLabel: "View attendance",
    actor: "Biometrics Sync",
  },
  {
    id: "HRN-104",
    category: "leave",
    title: "Medical certificate uploaded by Sanjay Pillai",
    body: "Attached document for sick leave request LV-3407 (21–23 Aug) is ready for verification.",
    time: "Yesterday, 16:40",
    timestamp: "21 Aug 2026, 04:40 PM",
    unread: false,
    actionUrl: "/hr/approvals",
    actionLabel: "Open attachment",
    actor: "Sanjay Pillai",
  },
  {
    id: "HRN-105",
    category: "system",
    title: "New employee onboarding completed",
    body: "Ritika Sen (Growth Marketer) submitted all statutory identity and tax documents.",
    time: "20 Aug, 15:22",
    timestamp: "20 Aug 2026, 03:22 PM",
    unread: false,
    actionUrl: "/hr/employees",
    actionLabel: "View profile",
    actor: "Ritika Sen",
  },
  {
    id: "HRN-106",
    category: "payroll",
    title: "July 2026 statutory PF & TDS compliance report",
    body: "Statutory deposit confirmation receipt generated for EPFO portal reference #EPF-99412.",
    time: "18 Aug, 11:10",
    timestamp: "18 Aug 2026, 11:10 AM",
    unread: false,
    actionUrl: "/hr/reports",
    actionLabel: "View report",
    actor: "Finance Ops",
  },
];

export const Route = createFileRoute("/hr/notifications")({
  head: () => ({
    meta: [
      { title: "Notification Centre — Workora HRMS" },
      {
        name: "description",
        content:
          "HR notifications: leave approvals, attendance alerts, payroll cycles and organization updates.",
      },
      { property: "og:title", content: "Notification Centre — Workora HRMS" },
      { property: "og:description", content: "Stay on top of all HR operations in Workora." },
    ],
  }),
  component: HRNotificationsPage,
});

const categoryConfig = {
  approval: { label: "Approval", icon: CalendarCheck2, tone: "pending" as const },
  leave: { label: "Leave", icon: CalendarClock, tone: "info" as const },
  attendance: { label: "Attendance", icon: Clock3, tone: "warning" as const },
  payroll: { label: "Payroll", icon: FileSpreadsheet, tone: "success" as const },
  system: { label: "System", icon: ShieldCheck, tone: "muted" as const },
};

function HRNotificationsPage() {
  const [items, setItems] = useState<HRNotificationItem[]>(initialNotifications);
  const [tab, setTab] = useState<NotificationCategory>("all");
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (tab !== "all" && n.category !== tab) return false;
      if (filterUnreadOnly && !n.unread) return false;
      return true;
    });
  }, [items, tab, filterUnreadOnly]);

  const unreadCount = items.filter((i) => i.unread).length;

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast.success("All notifications marked as read");
  };

  const toggleRead = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n)),
    );
  };

  const deleteNotification = (id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notification removed");
  };

  const clearAll = () => {
    setItems([]);
    setClearDialogOpen(false);
    toast.success("Notification inbox cleared");
  };

  return (
    <HRLayout
      title="Notification Centre"
      subtitle={
        unreadCount > 0
          ? `${unreadCount} unread operational alerts requiring attention`
          : "All operational alerts caught up"
      }
      actions={
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 rounded-lg"
              disabled={unreadCount === 0}
              onClick={markAllRead}
            >
              <CheckCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Mark all read</span>
            </Button>
          )}
          {items.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setClearDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden md:inline">Clear all</span>
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={tab} onValueChange={(v) => setTab(v as NotificationCategory)}>
            <TabsList className="h-10 rounded-xl bg-secondary/80 p-1">
              <TabsTrigger value="all" className="rounded-lg text-xs">
                All ({items.length})
              </TabsTrigger>
              <TabsTrigger value="approval" className="rounded-lg text-xs">
                Approvals
              </TabsTrigger>
              <TabsTrigger value="leave" className="rounded-lg text-xs">
                Leave
              </TabsTrigger>
              <TabsTrigger value="attendance" className="rounded-lg text-xs">
                Attendance
              </TabsTrigger>
              <TabsTrigger value="payroll" className="rounded-lg text-xs">
                Payroll
              </TabsTrigger>
              <TabsTrigger value="system" className="rounded-lg text-xs">
                System
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            size="sm"
            variant={filterUnreadOnly ? "default" : "outline"}
            className="w-fit gap-1.5 rounded-lg text-xs"
            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
          >
            <Filter className="h-3.5 w-3.5" />
            {filterUnreadOnly ? "Showing unread only" : "Filter unread"}
          </Button>
        </div>

        <Panel
          title="Operational Stream"
          description={`${filtered.length} notification${filtered.length === 1 ? "" : "s"}`}
        >
          {filtered.length === 0 ? (
            <EmptyState
              title="No notifications in this view"
              description={
                filterUnreadOnly
                  ? "You have read all notifications for this filter."
                  : "New operation alerts will appear here as team activities happen."
              }
              action={
                filterUnreadOnly ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setFilterUnreadOnly(false);
                      setTab("all");
                    }}
                  >
                    Reset filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((n) => {
                const conf = categoryConfig[n.category] || categoryConfig.system;
                const Icon = conf.icon;

                return (
                  <li
                    key={n.id}
                    onClick={() => toggleRead(n.id)}
                    className={cn(
                      "group relative flex flex-col gap-3 p-4 transition-all hover:bg-secondary/40 sm:flex-row sm:items-start sm:gap-4 rounded-xl my-1",
                      n.unread ? "bg-accent/40 border-l-4 border-l-primary" : "opacity-90",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-105",
                        n.unread ? "bg-primary text-primary-foreground shadow-xs" : "bg-secondary text-muted-foreground",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={cn(
                            "text-sm tracking-tight text-foreground",
                            n.unread ? "font-bold text-foreground" : "font-medium",
                          )}
                        >
                          {n.title}
                        </p>
                        <Pill tone={conf.tone}>{conf.label}</Pill>
                        {n.unread && (
                          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                            Unread
                          </span>
                        )}
                      </div>

                      <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        {n.body}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-muted-foreground">
                        <span className="font-medium text-foreground/80">{n.actor}</span>
                        <span>·</span>
                        <span>{n.time}</span>
                        <span>·</span>
                        <span className="tabular-nums">{n.timestamp}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 sm:self-center" onClick={(e) => e.stopPropagation()}>
                      {n.actionUrl && (
                        <Button size="sm" variant="outline" className="rounded-lg text-xs" asChild>
                          <Link to={n.actionUrl}>{n.actionLabel || "View"}</Link>
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title={n.unread ? "Mark as read" : "Mark as unread"}
                        onClick={(e) => toggleRead(n.id, e)}
                      >
                        <span className={cn("h-2.5 w-2.5 rounded-full border border-foreground/40", n.unread ? "bg-primary border-primary" : "bg-transparent")} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        title="Delete notification"
                        onClick={() => deleteNotification(n.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all operational alerts in your notification stream. You cannot undo this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={clearAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </HRLayout>
  );
}
