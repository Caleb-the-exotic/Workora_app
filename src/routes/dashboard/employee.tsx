import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/employee")({
  beforeLoad: () => {
    throw redirect({ to: "/employee" });
  },
});
