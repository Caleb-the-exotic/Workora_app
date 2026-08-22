export interface Session {
  email: string;
  role: "employee" | "hr";
  loggedInAt: number;
}

export interface Account {
  employeeId: string;
  email: string;
  password: string;
  role: "employee" | "hr";
  verified: boolean;
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem("workora-session");
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function getAccount(email: string): Account | null {
  try {
    const accounts = JSON.parse(localStorage.getItem("workora-accounts") || "[]") as Account[];
    return accounts.find((a) => a.email.toLowerCase() === email.toLowerCase()) || null;
  } catch {
    return null;
  }
}

export function getCurrentUser(): Account | null {
  const session = getSession();
  if (!session) return null;
  return getAccount(session.email);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getNameFromEmail(email: string): string {
  const local = email.split("@")[0];
  return local
    .split(/[.\-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
