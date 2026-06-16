import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sun, Mail, Lock, Loader2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin prijava — Prosumer.ba" }] }),
  component: AdminLoginPage,
});

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as any).message ?? "Pogrešan email ili lozinka.");
      }
      const { accessToken, user } = await res.json();
      localStorage.setItem("adminToken", accessToken);
      localStorage.setItem("adminUser", JSON.stringify(user));
      navigate({ to: "/admin/dashboard" });
    } catch (err: any) {
      setError(err?.message ?? "Greška pri prijavi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy/5 to-eco/5 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-navy shadow-lg">
            <Sun className="h-7 w-7 text-solar" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-navy">Prosumer.ba</h1>
            <p className="text-sm text-muted-foreground">Admin panel</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="rounded-3xl border border-border bg-card p-8 shadow-elevated space-y-5">
          <h2 className="font-display text-xl font-semibold text-navy">Prijava</h2>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-navy">Email adresa</label>
            <div className="relative mt-2">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required placeholder="admin@prosumer.ba"
                className="w-full rounded-xl border border-border bg-background pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-solar"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-navy">Lozinka</label>
            <div className="relative mt-2">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                required placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-background pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-solar"
              />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Prijavljujem…</> : "Prijavi se"}
          </button>
        </form>

      </div>
    </div>
  );
}
