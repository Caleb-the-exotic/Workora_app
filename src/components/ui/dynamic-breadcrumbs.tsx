import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const pathMap: Record<string, string> = {
  hr: "HR Portal",
  employees: "Employee Directory",
  attendance: "Attendance",
  approvals: "Leave Approvals",
  payroll: "Payroll Operations",
  reports: "Reports & Analytics",
  notifications: "Notification Centre",
  settings: "Settings",
  employee: "Employee Portal",
  profile: "My Profile",
  leave: "Leave & Time-Off",
};

export function DynamicBreadcrumbs({ root = "HR" }: { root?: "HR" | "Employee" }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) {
    return (
      <Breadcrumb className="hidden sm:block">
        <BreadcrumbList className="text-xs">
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-1 font-medium text-foreground">
              <Home className="h-3.5 w-3.5" />
              <span>{root} Console</span>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb className="hidden sm:block">
      <BreadcrumbList className="text-xs">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to={root === "HR" ? "/hr" : "/employee"} className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <Home className="h-3.5 w-3.5" />
              <span>{root}</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.slice(1).map((seg, idx, arr) => {
          const isLast = idx === arr.length - 1;
          const href = "/" + segments.slice(0, idx + 2).join("/");
          const label = pathMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);

          return (
            <span key={seg} className="inline-flex items-center gap-1.5 sm:gap-2">
              <BreadcrumbSeparator>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-semibold text-foreground">
                    {label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={href} className="text-muted-foreground hover:text-foreground">
                      {label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
