import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Briefcase, Loader2, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { GoogleSignInButton } from "@/components/auth/GoogleSignIn";
import {
  Field,
  FormError,
  PasswordField,
  PasswordStrength,
  TextField,
  scorePassword,
} from "@/components/auth/fields";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create an account — Workora HRMS" },
      {
        name: "description",
        content: "Get started with Workora. Create your organization HR account in under a minute.",
      },
      { property: "og:title", content: "Create an account — Workora HRMS" },
      { property: "og:description", content: "Get started with Workora HRMS." },
    ],
  }),
  component: SignUp,
});

const roles = [
  { value: "employee", label: "Employee", desc: "Attendance, leave & payslips", icon: UserRound },
  { value: "hr", label: "HR", desc: "Manage people & approvals", icon: Briefcase },
] as const;

function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ employeeId: "", email: "", password: "" });
  const [role, setRole] = useState<"employee" | "hr">("employee");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errs, setErrs] = useState<{ employeeId?: string; email?: string; password?: string }>({});
  const [showCode, setShowCode] = useState<string | null>(null);

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: { employeeId?: string; email?: string; password?: string } = {};
    if (form.employeeId.trim().length < 4) next.employeeId = "Employee ID looks too short.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid work email address.";
    if (scorePassword(form.password) < 3) next.password = "Choose a stronger password.";
    setErrs(next);
    if (!terms) {
      setError("Please accept the Terms of Service and Privacy Policy to continue.");
      return;
    }
    setError(null);
    if (Object.keys(next).length) return;

    setLoading(true);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    localStorage.setItem("workora-verify", JSON.stringify({ email: form.email, code, ts: Date.now() }));
    const accounts = JSON.parse(localStorage.getItem("workora-accounts") || "[]");
    accounts.push({ employeeId: form.employeeId, email: form.email, password: form.password, role, verified: false });
    localStorage.setItem("workora-accounts", JSON.stringify(accounts));
    try {
      await fetch("https://formspree.io/f/mdapedkq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _subject: "Workora Verification Code: " + code,
          email: form.email,
          employeeId: form.employeeId,
          verificationCode: code,
          message: "Your Workora verification code is " + code + ". It expires in 10 minutes.",
        }),
      });
    } catch {
      // proceed even if fetch fails
    }
    setLoading(false);
    setShowCode(code);
  }

  if (showCode) {
    return (
      <AuthLayout
        title="Verify your email"
        subtitle="Enter the code below on the verification page."
        showScanner
        footer={
          <>
            Already verified?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </>
        }
      >
        <div className="space-y-5">
          <div className="rounded-xl border border-success/30 bg-success/8 p-4 text-center">
            <p className="text-sm text-muted-foreground">Your verification code is</p>
            <p className="mt-2 font-montserrat-bold text-4xl tracking-[0.3em] text-foreground">{showCode}</p>
          </div>
          <Button
            className="h-11 w-full rounded-xl text-sm"
            onClick={() => navigate({ to: "/verify-email", search: { email: form.email } })}
          >
            Continue to verification
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Enter your details to register your workspace account."
      showScanner
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {error && <FormError>{error}</FormError>}

        <Field
          label="Employee ID"
          htmlFor="employeeId"
          error={errs.employeeId}
        >
          <TextField
            id="employeeId"
            placeholder="e.g. EMP1001"
            value={form.employeeId}
            invalid={!!errs.employeeId}
            onChange={(e) => set("employeeId", e.target.value.toUpperCase())}
          />
        </Field>

        <Field label="Work email" htmlFor="signup-email" error={errs.email}>
          <TextField
            id="signup-email"
            type="email"
            placeholder="you@company.com"
            value={form.email}
            invalid={!!errs.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </Field>

        <Field label="Password" htmlFor="signup-password" error={errs.password}>
          <PasswordField
            id="signup-password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={form.password}
            invalid={!!errs.password}
            onChange={(e) => set("password", e.target.value)}
          />
        </Field>
        <PasswordStrength value={form.password} />

        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium text-foreground">Role</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {roles.map((r) => (
              <button
                type="button"
                key={r.value}
                onClick={() => setRole(r.value)}
                aria-pressed={role === r.value}
                className={cn(
                  "rounded-xl border p-3.5 text-left transition-all",
                  role === r.value
                    ? "border-primary bg-accent ring-2 ring-primary/20"
                    : "border-border bg-surface hover:border-primary/40",
                )}
              >
                <r.icon
                  className={cn(
                    "h-4.5 w-4.5",
                    role === r.value ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <p className="mt-2 text-sm font-medium text-foreground">{r.label}</p>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex items-start gap-2.5">
          <Checkbox
            id="terms"
            checked={terms}
            onCheckedChange={(v) => setTerms(v === true)}
            className="mt-0.5"
          />
          <Label htmlFor="terms" className="text-sm font-normal leading-relaxed text-muted-foreground">
            I agree to Workora's <span className="font-medium text-primary">Terms of Service</span>{" "}
            and <span className="font-medium text-primary">Privacy Policy</span>.
          </Label>
        </div>

        <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl text-sm">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <GoogleSignInButton mode="signup" />
    </AuthLayout>
  );
}
