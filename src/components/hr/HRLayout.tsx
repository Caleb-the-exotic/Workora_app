import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  CalendarClock,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { DynamicBreadcrumbs } from "@/components/ui/dynamic-breadcrumbs";
import { cn } from "@/lib/utils";

export const hrNav = [
  { label: "Dashboard", to: "/hr", icon: LayoutDashboard },
  { label: "Employees", to: "/hr/employees", icon: Users },
  { label: "Attendance", to: "/hr/attendance", icon: CalendarClock },
  { label: "Leave Approvals", to: "/hr/approvals", icon: CalendarCheck2, badge: 4 },
  { label: "Payroll", to: "/hr/payroll", icon: Wallet },
  { label: "Reports & Analytics", to: "/hr/reports", icon: BarChart3 },
  { label: "Notifications", to: "/hr/notifications", icon: Bell, badge: 3 },
  { label: "Settings", to: "/hr/settings", icon: Settings },
] as const;

function NavList({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean | undefined;
  onNavigate?: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-1 flex-col gap-1 p-2.5">
      {!collapsed && (
        <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          HR Management
        </p>
      )}
      {hrNav.map((item) => {
        const active = pathname === item.to;
        const link = (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              collapsed ? "justify-center px-2" : "",
              active
                ? "bg-accent text-accent-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <item.icon className={cn("h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-105", active && "text-primary")} />
            {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
            {"badge" in item && item.badge ? (
              collapsed ? (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
              ) : (
                <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-destructive-foreground">
                  {item.badge}
                </span>
              )
            ) : null}
          </Link>
        );

        if (collapsed) {
          return (
            <Tooltip key={item.to} delayDuration={100}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-2">
                <span>{item.label}</span>
                {"badge" in item && item.badge ? (
                  <span className="rounded-full bg-destructive px-1.5 py-0.2 text-[9px] text-destructive-foreground">
                    {item.badge}
                  </span>
                ) : null}
              </TooltipContent>
            </Tooltip>
          );
        }

        return link;
      })}
    </nav>
  );
}

function LogoutButton({ collapsed }: { collapsed?: boolean | undefined }) {
  const navigate = useNavigate();
  function handleLogout() {
    localStorage.removeItem("workora-session");
    navigate({ to: "/" });
  }
  return (
    <button
      type="button"
      onClick={handleLogout}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
        collapsed ? "justify-center px-2" : "px-3",
      )}
    >
      <LogOut className="h-4.5 w-4.5 shrink-0" />
      {!collapsed && <span>Logout</span>}
    </button>
  );
}

function SidebarInner({
  collapsed,
  onNavigate,
  onToggleCollapse,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
}) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className={cn("flex items-center gap-2.5 border-b border-sidebar-border py-4 transition-all", collapsed ? "justify-center px-2" : "px-5")}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-gradient text-primary-foreground shadow-xs">
            <ShieldCheck className="h-5 w-5" />
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-base font-bold tracking-tight text-foreground">
                Workora
              </span>
              <span className="block text-[11px] font-medium text-muted-foreground">
                Admin / HR console
              </span>
            </span>
          )}
        </div>

        <NavList collapsed={collapsed} {...(onNavigate ? { onNavigate } : {})} />
      </div>

      <div className="border-t border-sidebar-border p-2.5">
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className={cn("hidden w-full items-center gap-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground lg:flex mb-1", collapsed ? "justify-center px-2" : "justify-start px-3")}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span>Collapse sidebar</span>}
          </Button>
        )}
        <LogoutButton collapsed={collapsed} />
      </div>
    </div>
  );
}

export function HRLayout({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("workora-hr-sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("workora-hr-sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <div
      className={cn(
        "min-h-screen bg-background transition-all duration-300",
        collapsed
          ? "lg:grid lg:grid-cols-[72px_minmax(0,1fr)]"
          : "lg:grid lg:grid-cols-[256px_minmax(0,1fr)]",
      )}
    >
      <aside className="sticky top-0 hidden h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300 lg:block z-20">
        <SidebarInner collapsed={collapsed} onToggleCollapse={handleToggleCollapse} />
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur-md">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0 lg:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open navigation</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[272px] bg-sidebar p-0">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <SidebarInner onNavigate={() => setOpen(false)} />
                </SheetContent>
              </Sheet>

              <div className="min-w-0 space-y-0.5">
                <DynamicBreadcrumbs root="HR" />
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-lg font-bold tracking-tight text-foreground sm:text-xl">
                    {title}
                  </h1>
                </div>
                {subtitle && (
                  <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="relative hidden xl:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search employees, requests…"
                  className="h-9 w-60 pl-9 transition-all focus:w-72"
                  onFocus={() => navigate({ to: "/hr/employees" })}
                />
              </div>

              {actions}

              <ThemeToggle />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-lg"
                    onClick={() => navigate({ to: "/hr/notifications" })}
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-surface animate-pulse" />
                    <span className="sr-only">Notifications</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>HR Notifications (3 pending)</TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative rounded-full outline-none ring-offset-2 ring-offset-background transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarFallback className="bg-brand-gradient text-sm font-semibold text-primary-foreground">
                        MJ
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success ring-2 ring-surface" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-card">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-semibold text-foreground">Meera Joshi</p>
                    <p className="text-xs text-muted-foreground">HR Officer · Admin access</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => navigate({ to: "/hr/settings" })}>
                    <Settings className="h-4 w-4 mr-2" /> Settings & Policy
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate({ to: "/employee" })}>
                    <Users className="h-4 w-4 mr-2" /> Switch to employee view
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() => navigate({ to: "/" })}
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 sm:py-7">
          {children}
        </main>
      </div>
    </div>
  );
}
