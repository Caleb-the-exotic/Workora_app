import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "@tanstack/react-router";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";

import { getAccount } from "@/lib/auth";
import { getEmployeeByEmail, addEmployee } from "@/lib/data";
import { getInitials, getNameFromEmail } from "@/lib/auth";
import { Loader2 } from "lucide-react";

const GOOGLE_CLIENT_ID = "325106074189-32tsucc7shvfr2aj205b6jb00fhtm0ht.apps.googleusercontent.com";

interface GoogleCredentialPayload {
  sub: string;
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
}

function handleGoogleSuccess(credentialResponse: { credential?: string }, navigate: ReturnType<typeof useNavigate>, mode: "login" | "signup") {
  if (!credentialResponse.credential) return;

  const payload = jwtDecode<GoogleCredentialPayload>(credentialResponse.credential);
  const { email, name } = payload;

  let account = getAccount(email);

  if (!account) {
    const employeeId = "EMP" + String(Math.floor(1000 + Math.random() * 9000));
    const accounts = JSON.parse(localStorage.getItem("workora-accounts") || "[]");
    account = {
      employeeId,
      email,
      password: "google-oauth",
      role: "employee",
      verified: true,
    };
    accounts.push(account);
    localStorage.setItem("workora-accounts", JSON.stringify(accounts));

    const empName = name || getNameFromEmail(email);
    const firstName = empName.split(" ")[0];
    addEmployee({
      employeeId,
      name: empName,
      firstName,
      initials: getInitials(empName),
      email,
      designation: "Employee",
      department: "General",
      manager: "—",
      location: "Remote",
      jobType: "Full-time",
      phone: "—",
      joined: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Present",
      leaveStatus: "None",
      checkIn: "—",
      checkOut: "—",
      hours: "—",
      extra: "—",
      monthlyWage: 50000,
      leaveBalance: { paid: 24, sick: 10, unpaid: 5 },
    });
  }

  localStorage.setItem(
    "workora-session",
    JSON.stringify({ email, role: account.role, loggedInAt: Date.now() }),
  );

  navigate({ to: account.role === "hr" ? "/hr" : "/employee" });
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function GoogleSignInButtonInner({
  mode,
  onError,
}: {
  mode: "login" | "signup";
  onError?: (msg: string) => void;
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: (response) => {
      setLoading(true);
      // Use the access token to fetch user info
      fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${response.access_token}` },
      })
        .then((res) => res.json())
        .then((userInfo) => {
          const { email, name, sub } = userInfo;

          let account = getAccount(email);

          if (!account) {
            const employeeId = "EMP" + String(Math.floor(1000 + Math.random() * 9000));
            const accounts = JSON.parse(localStorage.getItem("workora-accounts") || "[]");
            account = {
              employeeId,
              email,
              password: "google-oauth",
              role: "employee",
              verified: true,
            };
            accounts.push(account);
            localStorage.setItem("workora-accounts", JSON.stringify(accounts));

            const empName = name || getNameFromEmail(email);
            const firstName = empName.split(" ")[0];
            addEmployee({
              employeeId,
              name: empName,
              firstName,
              initials: getInitials(empName),
              email,
              designation: "Employee",
              department: "General",
              manager: "—",
              location: "Remote",
              jobType: "Full-time",
              phone: "—",
              joined: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
              status: "Present",
              leaveStatus: "None",
              checkIn: "—",
              checkOut: "—",
              hours: "—",
              extra: "—",
              monthlyWage: 50000,
              leaveBalance: { paid: 24, sick: 10, unpaid: 5 },
            });
          }

          localStorage.setItem(
            "workora-session",
            JSON.stringify({ email, role: account.role, loggedInAt: Date.now() }),
          );

          navigate({ to: account.role === "hr" ? "/hr" : "/employee" });
        })
        .catch(() => {
          setLoading(false);
          if (onError) onError("Failed to get user info from Google.");
        });
    },
    onError: () => {
      setLoading(false);
      if (onError) onError("Google sign-in failed. Please try again.");
    },
  });

  return (
    <div className="space-y-4">
      <div className="relative mt-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase pt-1">
          <span className="bg-surface px-2 text-muted-foreground">or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => googleLogin()}
        disabled={loading}
        className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface text-sm font-medium text-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground hover:border-primary/30 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        <span>{loading ? "Signing in…" : mode === "login" ? "Sign in with Google" : "Sign up with Google"}</span>
      </button>
    </div>
  );
}

function GoogleSignInButton({
  mode,
  onError,
}: {
  mode: "login" | "signup";
  onError?: (msg: string) => void;
}) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleSignInButtonInner mode={mode} onError={onError} />
    </GoogleOAuthProvider>
  );
}

export { GoogleSignInButton };
