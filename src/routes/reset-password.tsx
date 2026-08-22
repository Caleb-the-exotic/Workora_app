import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";

import { AuthLayout } from "@/components/auth/AuthLayout";
import {
  Field,
  FormError,
  PasswordField,
  PasswordStrength,
  scorePassword,
} from "@/components/auth/fields";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Workora HRMS" },
      { name: "description", content: "Choose a new strong password for your Workora account." },
      { property: "og:title", content: "Reset password — Workora HRMS" },
      { property: "og:description", content: "Choose a new password for Workora." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errs, setErrs] = useState<{ password?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: { password?: string; confirm?: string } = {};
    if (scorePassword(password) < 3) next.password = "Choose a stronger password.";
    if (confirm !== password) next.confirm = "Passwords don't match.";
    setErrs(next);
    setError(Object.keys(next).length ? "Please fix the highlighted fields." : null);
    if (Object.keys(next).length) return;

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      navigate({ to: "/" });
    }, 900);
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Your new password must be different from previously used passwords."
      footer={
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {error && <FormError>{error}</FormError>}

        <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/50 p-3.5 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary" />
          <span>Signing in on other devices will require the new password.</span>
        </div>

        <Field label="New password" htmlFor="new-password" error={errs.password}>
          <PasswordField
            id="new-password"
            autoComplete="new-password"
            placeholder="Enter new password"
            value={password}
            invalid={!!errs.password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <PasswordStrength value={password} />

        <Field label="Confirm password" htmlFor="confirm-password" error={errs.confirm}>
          <PasswordField
            id="confirm-password"
            autoComplete="new-password"
            placeholder="Re-enter new password"
            value={confirm}
            invalid={!!errs.confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>

        <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl text-sm">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Updating password…" : "Update password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
