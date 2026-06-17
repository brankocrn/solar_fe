import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Sun, Users, TrendingUp, Leaf, Banknote, Clock,
  LogOut, Search, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, MapPin, Mail, Phone,
  AlertCircle, Loader2, BarChart2, RefreshCw, Globe, Calculator,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin dashboard — Prosumer.ba" }] }),
  component: AdminDashboard,
});

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

// ─── Types ────────────────────────────────────────────────────────────────────
type Metrics = {
  total: number;
  byStatus: Record<string, number>;
  leadsLast30Days: { day: string; count: number }[];
  avgSystemKw: number;
  avgPaybackYears: number;
  totalSavingsKm: number;
  totalSystemValue: number;
  topCities: { city: string; count: number }[];
  // visitor stats
  totalSiteVisits: number;
  totalKalkulatorVisits: number;
  uniqueSiteVisitors: number;
  uniqueKalkulatorVisitors: number;
  visitorsLast30Days: { day: string; siteCount: number; kalkulatorCount: number }[];
};

type Lead = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  locationCity: string | null;
  locationLabel: string | null;
  latitude: number | null;
  longitude: number | null;
  monthlyBillKm: number;
  roofAreaSqm: number;
  roofType: string | null;
  meterType: string | null;
  recommendedSystemKw: number;
  estimatedSystemCostKm: number;
  estimatedPaybackYears: number;
  estimatedAnnualSavingsKm: number;
  dataSource: string;
  status: "new" | "contacted" | "closed";
  createdAt: string;
};

type PageMeta = { total: number; page: number; limit: number; totalPages: number };

const STATUS_LABELS: Record<string, string> = {
  new: "Novi", contacted: "Kontaktiran", closed: "Zatvoren",
};
const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  closed: "bg-green-100 text-green-700",
};

function authHeaders() {
  const token = localStorage.getItem("adminToken") ?? "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

// ─── Main component ───────────────────────────────────────────────────────────
function AdminDashboard() {
  const navigate = useNavigate();
  const adminUser = (() => {
    try { return JSON.parse(localStorage.getItem("adminUser") ?? "{}"); } catch { return {}; }
  })();

  // Metrics
  const [metrics, setMetrics]       = useState<Metrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Leads table state
  const [leads, setLeads]           = useState<Lead[]>([]);
  const [meta, setMeta]             = useState<PageMeta>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [page, setPage]             = useState(1);
  const [sortBy, setSortBy]         = useState("createdAt");
  const [sortDir, setSortDir]       = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch]         = useState("");
  const [searchInput, setSearchInput]   = useState("");

  function logout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate({ to: "/admin/login" });
  }

  // Auth guard
  useEffect(() => {
    if (!localStorage.getItem("adminToken")) navigate({ to: "/admin/login" });
  }, []);

  // Fetch metrics
  async function fetchMetrics() {
    setMetricsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/metrics`, { headers: authHeaders() });
      if (res.status === 401) { logout(); return; }
      setMetrics(await res.json());
    } finally { setMetricsLoading(false); }
  }

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    setLeadsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: "20",
        sortBy, sortDir,
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(search ? { search } : {}),
      });
      const res = await fetch(`${API_BASE}/admin/leads?${params}`, { headers: authHeaders() });
      if (res.status === 401) { logout(); return; }
      const body = await res.json();
      setLeads(body.data);
      setMeta(body.meta);
    } finally { setLeadsLoading(false); }
  }, [page, sortBy, sortDir, statusFilter, search]);

  useEffect(() => { fetchMetrics(); }, []);
  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  async function updateStatus(id: number, status: string) {
    await fetch(`${API_BASE}/admin/leads/${id}/status`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    fetchLeads();
  }

  function toggleSort(col: string) {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
    setPage(1);
  }

  function SortIcon({ col }: { col: string }) {
    if (sortBy !== col) return <ChevronDown className="h-3 w-3 opacity-30" />;
    return sortDir === "asc"
      ? <ChevronUp className="h-3 w-3 text-navy" />
      : <ChevronDown className="h-3 w-3 text-navy" />;
  }

  const locationFor = (l: Lead) =>
    l.locationLabel ?? l.locationCity ?? (l.latitude ? `${Number(l.latitude).toFixed(2)}°, ${Number(l.longitude).toFixed(2)}°` : "—");

  const roofTypeLabel: Record<string, string> = { flat: "Ravni", tile: "Crijep", sheet_metal: "Lim" };
  const meterLabel: Record<string, string>    = { single_phase: "1-fazni", three_phase: "3-fazni" };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── Top nav ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-navy">
                <Sun className="h-4 w-4 text-solar" />
              </div>
              <span className="font-display font-bold text-navy">Prosumer.ba</span>
            </Link>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">{adminUser.email}</span>
            <button onClick={logout} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-navy hover:bg-secondary transition-colors">
              <LogOut className="h-3.5 w-3.5" /> Odjava
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-xl px-6 py-8 space-y-8">

        {/* ── Metric cards ── */}
        {metricsLoading ? (
          <div className="flex items-center gap-3 py-8 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Učitavam metrike…</div>
        ) : metrics && (
          <>
            {/* Visitor stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard icon={Globe}      label="Posjete websiteu"       value={metrics.totalSiteVisits.toLocaleString("hr-HR")}       color="bg-navy text-primary-foreground" />
              <MetricCard icon={Users}      label="Jedinstveni posjetitelji" value={metrics.uniqueSiteVisitors.toLocaleString("hr-HR")}  color="bg-eco-soft text-eco-foreground" />
              <MetricCard icon={Calculator} label="Posjete kalkulatoru"    value={metrics.totalKalkulatorVisits.toLocaleString("hr-HR")} color="bg-solar-soft text-navy" />
              <MetricCard icon={TrendingUp} label="Uniq. kalkulator ses."  value={metrics.uniqueKalkulatorVisitors.toLocaleString("hr-HR")} color="bg-navy text-primary-foreground" />
            </div>

            {/* Lead KPIs */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard icon={Users}     label="Ukupno upita"           value={String(metrics.total)}                         color="bg-eco-soft text-eco-foreground" />
              <MetricCard icon={TrendingUp} label="Prosj. veličina sustava" value={`${metrics.avgSystemKw} kWp`}                color="bg-solar-soft text-navy" />
              <MetricCard icon={Clock}     label="Prosj. povrat inv."       value={`${metrics.avgPaybackYears} god`}             color="bg-navy text-primary-foreground" />
              <MetricCard icon={Banknote}  label="Ukupna vrijednost"         value={`KM ${metrics.totalSystemValue.toLocaleString("hr-HR")}`} color="bg-eco-soft text-eco-foreground" />
            </div>

            {/* Status breakdown */}
            <div className="grid gap-4 sm:grid-cols-3">
              {Object.entries(metrics.byStatus).map(([s, c]) => (
                <div key={s} className="rounded-2xl border border-border bg-white px-5 py-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-navy">{STATUS_LABELS[s] ?? s}</span>
                  <span className={`rounded-full px-3 py-1 text-sm font-bold ${STATUS_COLORS[s] ?? "bg-secondary text-navy"}`}>{c}</span>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Visitors + kalkulator last 30 days */}
              <div className="lg:col-span-2 rounded-2xl border border-border bg-white p-6">
                <h3 className="mb-4 font-display text-sm font-semibold text-navy flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" /> Posjete & kalkulator — zadnjih 30 dana
                </h3>
                {metrics.visitorsLast30Days.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={metrics.visitorsLast30Days}>
                      <defs>
                        <linearGradient id="gradSite" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#1a3a5c" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#1a3a5c" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradKalk" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#4caf82" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#4caf82" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip labelFormatter={(l) => `Datum: ${l}`} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      <Area type="monotone" dataKey="siteCount"      name="Website"     stroke="#1a3a5c" strokeWidth={2} fill="url(#gradSite)" />
                      <Area type="monotone" dataKey="kalkulatorCount" name="Kalkulator"  stroke="#4caf82" strokeWidth={2} fill="url(#gradKalk)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground py-8 text-center">Nema podataka za zadnjih 30 dana.</p>}

                {/* Leads sub-chart */}
                <h3 className="mt-6 mb-3 font-display text-sm font-semibold text-navy flex items-center gap-2">
                  <Users className="h-4 w-4" /> Upiti — zadnjih 30 dana
                </h3>
                {metrics.leadsLast30Days.length > 0 ? (
                  <ResponsiveContainer width="100%" height={120}>
                    <AreaChart data={metrics.leadsLast30Days}>
                      <defs>
                        <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip formatter={(v) => [v, "Upiti"]} labelFormatter={(l) => `Datum: ${l}`} />
                      <Area type="monotone" dataKey="count" name="Upiti" stroke="#f59e0b" strokeWidth={2} fill="url(#gradLeads)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground py-4 text-center">Nema upita za zadnjih 30 dana.</p>}
              </div>

              {/* Top cities */}
              <div className="rounded-2xl border border-border bg-white p-6">
                <h3 className="mb-4 font-display text-sm font-semibold text-navy flex items-center gap-2"><MapPin className="h-4 w-4" /> Top gradovi</h3>
                {metrics.topCities.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={metrics.topCities} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="city" tick={{ fontSize: 10 }} width={80} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#4caf82" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground py-8 text-center">Nema lokacijskih podataka.</p>}
              </div>
            </div>
          </>
        )}

        {/* ── Leads table ── */}
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          {/* Table toolbar */}
          <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-border">
            <h2 className="font-display font-semibold text-navy mr-auto">Upiti korisnika</h2>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
                placeholder="Pretraži…"
                className="rounded-xl border border-border bg-gray-50 pl-9 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-solar w-48"
              />
            </div>

            {/* Status filter */}
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-border bg-gray-50 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-solar">
              <option value="">Svi statusi</option>
              <option value="new">Novi</option>
              <option value="contacted">Kontaktiran</option>
              <option value="closed">Zatvoren</option>
            </select>

            <button onClick={() => { fetchMetrics(); fetchLeads(); }} className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-navy hover:bg-secondary transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> Osvježi
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50 text-left text-xs text-muted-foreground">
                  {[
                    ["#", "id", false],
                    ["Ime", "name", true],
                    ["Kontakt", null, false],
                    ["Lokacija", "locationCity", true],
                    ["Datum", "createdAt", true],
                    ["Sustav", "recommendedSystemKw", true],
                    ["Krov / Priključak", null, false],
                    ["Investicija", "estimatedSystemCostKm", true],
                    ["Povrat", "estimatedPaybackYears", true],
                    ["Status", "status", true],
                  ].map(([label, col, sortable]) => (
                    <th key={String(label)}
                      onClick={() => sortable && col ? toggleSort(String(col)) : undefined}
                      className={`px-4 py-3 font-semibold whitespace-nowrap ${sortable ? "cursor-pointer select-none hover:text-navy" : ""}`}>
                      <span className="flex items-center gap-1">
                        {label}
                        {sortable && col && <SortIcon col={String(col)} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leadsLoading ? (
                  <tr><td colSpan={10} className="px-4 py-10 text-center text-muted-foreground">
                    <Loader2 className="inline h-5 w-5 animate-spin mr-2" />Učitavam…
                  </td></tr>
                ) : leads.length === 0 ? (
                  <tr><td colSpan={10} className="px-4 py-10 text-center text-muted-foreground">
                    <AlertCircle className="inline h-4 w-4 mr-2" />Nema rezultata.
                  </td></tr>
                ) : leads.map((lead, i) => (
                  <motion.tr key={lead.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-border/50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground text-xs">{lead.id}</td>
                    <td className="px-4 py-3 font-semibold text-navy whitespace-nowrap">{lead.name || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-xs text-navy hover:underline">
                          <Mail className="h-3 w-3" />{lead.email}
                        </a>
                        {lead.phone && (
                          <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-navy">
                            <Phone className="h-3 w-3" />{lead.phone}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                        <MapPin className="h-3 w-3 shrink-0" />{locationFor(lead)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString("hr-HR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-navy whitespace-nowrap">{lead.recommendedSystemKw} kWp</td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {lead.roofType && <span className="block rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-navy w-fit">{roofTypeLabel[lead.roofType] ?? lead.roofType}</span>}
                        {lead.meterType && <span className="block rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-navy w-fit">{meterLabel[lead.meterType] ?? lead.meterType}</span>}
                        {!lead.roofType && !lead.meterType && <span className="text-xs text-muted-foreground">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-navy whitespace-nowrap">KM {Number(lead.estimatedSystemCostKm).toLocaleString("hr-HR")}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-eco font-semibold">{lead.estimatedPaybackYears} god</td>
                    <td className="px-4 py-3">
                      <select value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className={`rounded-full border-0 px-3 py-1.5 text-[11px] font-bold cursor-pointer outline-none ${STATUS_COLORS[lead.status] ?? "bg-secondary text-navy"}`}>
                        <option value="new">Novi</option>
                        <option value="contacted">Kontaktiran</option>
                        <option value="closed">Zatvoren</option>
                      </select>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Prikazano {leads.length} od {meta.total} upita
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-40 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-muted-foreground">Str. {page} / {meta.totalPages}</span>
              <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page >= meta.totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-40 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className={`rounded-2xl p-5 ${color}`}>
      <Icon className="h-5 w-5 opacity-80" />
      <div className="mt-3 text-xs uppercase tracking-wider opacity-70">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold">{value}</div>
    </motion.div>
  );
}
