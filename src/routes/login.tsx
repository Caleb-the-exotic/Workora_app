import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Field, FormError, PasswordField, TextField } from "@/components/auth/fields";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Workora HRMS" },
      {
        name: "description",
        content:
          "Sign in to Workora, the modern HR management platform. Every workday, perfectly aligned.",
      },
      { property: "og:title", content: "Sign in — Workora HRMS" },
      { property: "og:description", content: "Every workday, perfectly aligned." },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    const accounts = JSON.parse(localStorage.getItem("workora-accounts") || "[]");
    const exists = accounts.some((a: { email: string }) => a.email === "2204caleb2007@gmail.com");
    if (!exists) {
      accounts.push({
        employeeId: "EMP1001",
        email: "2204caleb2007@gmail.com",
        password: "abcdefg1234567",
        role: "employee",
        verified: true,
      });
      localStorage.setItem("workora-accounts", JSON.stringify(accounts));
    }
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const errs: { email?: string; password?: string } = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Enter a valid work email address.";
    if (password.length < 8) errs.password = "Password must be at least 8 characters.";
    setFieldErrors(errs);
    setError(null);
    if (Object.keys(errs).length) return;

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      const accounts = JSON.parse(localStorage.getItem("workora-accounts") || "[]");
      const account = accounts.find(
        (a: { email: string; password: string; verified: boolean }) =>
          a.email.toLowerCase() === email.toLowerCase() && a.password === password,
      );
      if (!account) {
        setError("Incorrect email or password. Please try again.");
        return;
      }
      if (!account.verified) {
        setError("Please verify your email first. Check your inbox for the code.");
        return;
      }
      const role = account.role || "employee";
      localStorage.setItem("workora-session", JSON.stringify({ email, role, loggedInAt: Date.now() }));
      navigate({ to: role === "hr" ? "/hr" : "/employee" });
    }, 900);
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Workora workspace to continue."
      showScanner
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {error && <FormError>{error}</FormError>}

        <Field label="Login ID / Email" htmlFor="email" error={fieldErrors.email}>
          <TextField
            id="email"
            type="email"
            autoComplete="username"
            placeholder="you@company.com"
            value={email}
            invalid={!!fieldErrors.email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          error={fieldErrors.password}
          action={
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          }
        >
          <PasswordField
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            invalid={!!fieldErrors.password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <div className="flex items-center gap-2.5">
          <Checkbox id="remember" />
          <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
            Remember me for 30 days
          </Label>
        </div>

        <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl text-sm">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
