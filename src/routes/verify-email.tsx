import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Loader2, MailCheck } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const verifyEmailSearchSchema = z.object({
  email: z.string().optional(),
});

export const Route = createFileRoute("/verify-email")({
  head: () => ({
    meta: [
      { title: "Verify your email — Workora HRMS" },
      { name: "description", content: "Enter the verification code sent to your inbox to activate Workora." },
      { property: "og:title", content: "Verify your email — Workora HRMS" },
      { property: "og:description", content: "Verify your email to continue to Workora." },
    ],
  }),
  validateSearch: verifyEmailSearchSchema,
  component: VerifyEmail,
});

function VerifyEmail() {
  const navigate = useNavigate();
  const { email } = useSearch({ from: "/verify-email" }) as { email?: string };
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleVerify() {
    setLoading(true);
    setError(null);

    const stored = JSON.parse(localStorage.getItem("workora-verify") || "null");
    if (!stored || !email || stored.email !== email) {
      setError("No verification pending. Please sign up again.");
      setLoading(false);
      return;
    }

    if (Date.now() - stored.ts > 10 * 60 * 1000) {
      setError("Verification code expired. Please sign up again.");
      setLoading(false);
      return;
    }

    if (code !== stored.code) {
      setError("Incorrect code. Please try again.");
      setLoading(false);
      return;
    }

    localStorage.removeItem("workora-verify");
    setLoading(false);
    navigate({ to: "/login" });
  }

  async function handleResend() {
    if (!email) return;
    const newCode = String(Math.floor(100000 + Math.random() * 900000));
    localStorage.setItem("workora-verify", JSON.stringify({ email, code: newCode, ts: Date.now() }));
    try {
      await fetch("https://formspree.io/f/mdapedkq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _subject: `Workora Verification Code: ${newCode}`,
          email,
          verificationCode: newCode,
          message: `Your Workora verification code is ${newCode}. It expires in 10 minutes.`,
        }),
      });
    } catch {
      // proceed even if fetch fails
    }
    setSent(true);
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`We sent a 6-digit verification code to ${email || "your work email address"}.`}
      showScanner
      footer={
        <>
          Wrong address?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Go back to sign up
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex items-start gap-3 rounded-xl border border-info/30 bg-info/8 p-3.5 text-sm text-foreground">
          <MailCheck className="mt-0.5 h-4.5 w-4.5 shrink-0 text-info" />
          <span>
            The code expires in 10 minutes. Check your spam folder if it hasn't arrived.
          </span>
        </div>

        {error && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/8 p-3.5 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex justify-center">
          <InputOTP maxLength={6} value={code} onChange={(v) => { setCode(v); setError(null); }}>
            <InputOTPGroup className="gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="h-12 w-11 rounded-xl border border-border bg-surface text-base"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          className="h-11 w-full rounded-xl text-sm"
          disabled={code.length < 6 || loading}
          onClick={handleVerify}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Verifying…" : "Verify email"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {sent ? (
            <span className="font-medium text-success">A new code is on its way.</span>
          ) : (
            <>
              Didn't get a code?{" "}
              <button
                type="button"
                onClick={handleResend}
                className="font-medium text-primary hover:underline"
              >
                Resend
              </button>
            </>
          )}
        </p>
      </div>
    </AuthLayout>
  );
}
