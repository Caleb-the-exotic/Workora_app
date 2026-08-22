import { Link } from "@tanstack/react-router";
import { CalendarCheck2, ShieldCheck, Users, Clock } from "lucide-react";
import { Suspense, lazy, useEffect, useState, type ReactNode } from "react";

const Scanner = lazy(() => import("@/components/auth/Scanner"));

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-gradient text-primary-foreground">
        <CalendarCheck2 className="h-5 w-5" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-lg font-montserrat-bold tracking-tight text-foreground">Workora</span>
        {!compact && (
          <span className="mt-1 text-[11px] font-medium text-muted-foreground">
            Human Resource Management
          </span>
        )}
      </span>
    </Link>
  );
}

const highlights = [
  { icon: Users, title: "One place for every employee", text: "Profiles, roles and org structure kept in sync." },
  { icon: Clock, title: "Attendance & leave, simplified", text: "Approvals that take seconds, not days." },
  { icon: ShieldCheck, title: "Enterprise-grade security", text: "Role-based access for HR and employees." },
];

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  showScanner = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  showScanner?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[1fr_minmax(0,560px)]">
      <aside className="relative hidden overflow-hidden bg-black p-12 lg:flex lg:flex-col lg:justify-between text-white">
        {showScanner && (
          <div className="pointer-events-none absolute inset-0 z-0">
            {mounted && (
              <Suspense fallback={null}>
                <Scanner
                color1="#ff002c"
                color2="#FF7A6B"
                color3="#FFFFFF"
                speed={0.5}
                sweepSpeed={0.25}
                sweepWidth={1.6}
                sweepFalloff={6}
                scale={1.5}
                frequency={2}
                ripple={0.22}
                bandDensity={11}
                lineSharpness={5.5}
                glow={0.22}
                scanDirection="vertical"
                colorSpread={0.7}
                brightness={1}
                contrast={1.15}
                softness={1.4}
                vignette={0.45}
                scanline
                grain
                grainIntensity={0.05}
                opacity={1}
                mouseInteraction
                mouseRadius={0.5}
                mouseStrength={0.5}
              />
            </Suspense>
          )}
        </div>
        )}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2.5 text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/20 text-white">
              <CalendarCheck2 className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-montserrat-bold tracking-tight text-white">Workora</span>
          </div>
        </div>
        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-montserrat-bold leading-tight tracking-tight text-white">
            Every workday, perfectly aligned.
          </h2>
          <ul className="mt-10 space-y-6">
            {highlights.map((h) => (
              <li key={h.title} className="flex gap-4">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/20 text-white">
                  <h.icon className="h-4.5 w-4.5 text-white" />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-white">{h.title}</p>
                  <p className="text-sm text-white/85">{h.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 text-xs font-montserrat-bold text-white/80">
          © {new Date().getFullYear()} Workora HRMS
        </p>
        </aside>

      <main className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
          {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
