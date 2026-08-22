import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "@tanstack/react-router";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";

import { getCurrentUser, getAccount } from "@/lib/auth";
import { getEmployeeByEmail, addEmployee } from "@/lib/data";
import { getInitials, getNameFromEmail } from "@/lib/auth";
import { Button } from "@/components/ui/button";
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
  const { email, name, sub } = payload;

  // Check if account already exists
  let account = getAccount(email);

  if (!account && mode === "signup") {
    // Create new account
    const employeeId = "EMP" + String(Math.floor(1000 + Math.random() * 9000));
    const accounts = JSON.parse(localStorage.getItem("workora-accounts") || "[]");
    const newAccount = {
      employeeId,
      email,
      password: "google-oauth",
      role: "employee" as const,
      verified: true,
    };
    accounts.push(newAccount);
    localStorage.setItem("workora-accounts", JSON.stringify(accounts));
    account = newAccount;

    // Also add to employee DB
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

  if (!account) {
    // Account doesn't exist and mode is login — still allow login
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

  // Set session
  localStorage.setItem(
    "workora-session",
    JSON.stringify({ email, role: account.role, loggedInAt: Date.now() }),
  );

  navigate({ to: account.role === "hr" ? "/hr" : "/employee" });
}

function GoogleSignInButton({
  mode,
  onError,
}: {
  mode: "login" | "signup";
  onError?: (msg: string) => void;
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-surface px-2 text-muted-foreground">or continue with</span>
        </div>
      </div>

      <div className="flex justify-center">
        {loading ? (
          <Button variant="outline" className="h-11 w-full rounded-xl text-sm" disabled>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Signing in with Google…
          </Button>
        ) : (
          <GoogleLogin
            onSuccess={(cr) => {
              setLoading(true);
              handleGoogleSuccess(cr, navigate, mode);
            }}
            onError={() => {
              if (onError) onError("Google sign-in failed. Please try again.");
              else alert("Google sign-in failed. Please try again.");
            }}
            use-fedcm-for-buttons
            theme="outline"
            shape="rectangular"
            width="100%"
            text={mode === "login" ? "signin_with" : "signup_with"}
          />
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export { GoogleSignInButton };
