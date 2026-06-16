import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  beforeLoad: () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    throw redirect({ to: token ? "/admin/dashboard" : "/admin/login" });
  },
  component: () => null,
});
