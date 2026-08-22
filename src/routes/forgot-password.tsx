import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Field, TextField } from "@/components/auth/fields";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password — Workora HRMS" },
      { name: "description", content: "Reset your Workora account password securely." },
      { property: "og:title", content: "Forgot password — Workora HRMS" },
      { property: "og:description", content: "Reset your Workora account password." },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter the work email linked to your account.");
      return;
    }
    setError(undefined);
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 900);
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your work email and we'll send you a reset link."
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      }
    >
      {done ? (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/8 p-3.5 text-sm text-foreground">
            <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-success" />
            <span>
              If an account exists for <span className="font-medium">{email}</span>, a reset link is
              on its way.
            </span>
          </div>
          <Button asChild variant="outline" className="h-11 w-full rounded-xl text-sm">
            <Link to="/reset-password">Open reset link</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <Field label="Work email" htmlFor="forgot-email" error={error}>
            <TextField
              id="forgot-email"
              type="email"
              placeholder="you@company.com"
              value={email}
              invalid={!!error}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl text-sm">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Sending link…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
