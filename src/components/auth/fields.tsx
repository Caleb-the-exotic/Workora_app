import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useState, type ComponentProps, type ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  action,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | undefined;
  hint?: string | undefined;
  action?: ReactNode | undefined;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
          {label}
        </Label>
        {action}
      </div>
      {children}
      {error ? (
        <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextField({
  invalid,
  className,
  ...props
}: ComponentProps<typeof Input> & { invalid?: boolean | undefined }) {
  return (
    <Input
      {...props}
      aria-invalid={invalid || undefined}
      className={cn(
        "h-11 rounded-xl bg-surface",
        invalid && "border-destructive focus-visible:ring-destructive/30",
        className,
      )}
    />
  );
}

export function PasswordField({
  invalid,
  ...props
}: ComponentProps<typeof Input> & { invalid?: boolean | undefined }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <TextField {...props} invalid={invalid} type={show ? "text" : "password"} className="pr-11" />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function scorePassword(value: string) {
  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  return score;
}

const levels = [
  { label: "Too weak", bar: "bg-destructive", text: "text-destructive" },
  { label: "Weak", bar: "bg-destructive", text: "text-destructive" },
  { label: "Fair", bar: "bg-warning", text: "text-warning" },
  { label: "Good", bar: "bg-info", text: "text-info" },
  { label: "Strong", bar: "bg-success", text: "text-success" },
];

export function PasswordStrength({ value }: { value: string }) {
  const score = scorePassword(value);
  const level = levels[score]!;
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              value && i < score ? level.bar : "bg-muted",
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Strength:{" "}
        <span className={cn("font-medium", value ? level.text : "text-muted-foreground")}>
          {value ? level.label : "—"}
        </span>{" "}
        · 8+ characters, mixed case, number & symbol
      </p>
    </div>
  );
}

export function FormError({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/8 p-3 text-sm text-destructive"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
