import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, MapPin, ShieldCheck, Search, ArrowRight,
  Globe, Phone, Mail, Loader2, AlertCircle, RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/instalateri")({
  head: () => ({
    meta: [
      { title: "Provjereni solarni instalateri — Prosumer.ba" },
      { name: "description", content: "Pregledaj provjerene instalatere solarnih elektrana u BiH. Ocjene, certifikati, recenzije." },
    ],
  }),
  component: InstalateriPage,
});

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

type Partner = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  city: string | null;
  country: string | null;
  description: string | null;
  rating: number | null;
  projectCount: number | null;
  badge: string | null;
  tags: string[] | null;
  isActive: boolean;
};

function InstalateriPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"sve" | "BiH">("sve");
  const [q, setQ] = useState("");

  async function fetchPartners() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/partners`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Partner[] = await res.json();
      setPartners(data);
    } catch {
      setError("Greška pri dohvatu instalatera. Provjeri da li je backend pokrenut.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchPartners(); }, []);

  const list = partners.filter((p) => {
    const countryMatch = filter === "sve" || p.country === filter;
    const searchMatch = p.name.toLowerCase().includes(q.toLowerCase()) ||
      (p.city ?? "").toLowerCase().includes(q.toLowerCase());
    return countryMatch && searchMatch;
  });

  return (
    <SiteLayout>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto max-w-7xl px-5 pt-16 pb-10 lg:px-8 lg:pt-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-eco/30 bg-eco-soft px-3 py-1 text-xs font-semibold text-eco">
              <ShieldCheck className="h-3.5 w-3.5" /> Marketplace
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-navy sm:text-5xl">Pronađi pravog instalatera</h1>
            <p className="mt-4 text-lg text-muted-foreground">Provjereni, ocijenjeni i certificirani instalateri u BiH.</p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Pretraži instalatere ili grad..."
                className="w-full rounded-full border border-border bg-card pl-11 pr-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-solar"
              />
            </div>
            <div className="flex gap-2 rounded-full border border-border bg-card p-1">
              {(["sve", "BiH"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition-all ${filter === k ? "bg-navy text-primary-foreground" : "text-navy hover:bg-secondary"}`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-navy" />
            <span className="text-sm">Učitavam instalatere…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-4 py-24">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={fetchPartners}
              className="flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <RefreshCw className="h-4 w-4" /> Pokušaj ponovo
            </button>
          </div>
        )}

        {/* Cards */}
        {!loading && !error && (
          <>
            <AnimatePresence mode="popLayout">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((partner, i) => (
                  <PartnerCard key={partner.id} partner={partner} index={i} />
                ))}
              </div>
            </AnimatePresence>

            {list.length === 0 && (
              <div className="py-16 text-center text-muted-foreground">
                {partners.length === 0
                  ? "Nema instalatera u bazi. Dodaj partnere putem API-ja."
                  : "Nema rezultata za odabrane filtere."}
              </div>
            )}

            {!loading && !error && partners.length > 0 && (
              <p className="mt-8 text-center text-xs text-muted-foreground">
                Prikazano {list.length} od {partners.length} instalatera
              </p>
            )}
          </>
        )}
      </section>
    </SiteLayout>
  );
}

function PartnerCard({ partner, index }: { partner: Partner; index: number }) {
  const badge = partner.badge ?? "Verified";
  const tags: string[] = Array.isArray(partner.tags)
    ? partner.tags
    : typeof partner.tags === "string"
      ? (partner.tags as string).split(",").map((t) => t.trim()).filter(Boolean)
      : [];

  return (
    <motion.article
      key={partner.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group rounded-3xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-elevated flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-navy to-navy-soft text-solar font-display text-xl font-bold shrink-0">
          {partner.name[0]}
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${badge === "Premium" ? "bg-solar-soft text-navy" : "bg-eco-soft text-eco"}`}>
          {badge}
        </span>
      </div>

      {/* Name + location */}
      <h3 className="mt-5 font-display text-xl font-semibold text-navy">{partner.name}</h3>
      {(partner.city || partner.country) && (
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          {[partner.city, partner.country].filter(Boolean).join(", ")}
        </div>
      )}

      {/* Description */}
      {partner.description && (
        <p className="mt-4 text-sm text-muted-foreground">{partner.description}</p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span key={t} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-navy">{t}</span>
          ))}
        </div>
      )}

      {/* Contact row */}
      <div className="mt-5 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {partner.phone && (
          <a href={`tel:${partner.phone}`} className="flex items-center gap-1 hover:text-navy transition-colors">
            <Phone className="h-3 w-3" /> {partner.phone}
          </a>
        )}
        {partner.email && (
          <a href={`mailto:${partner.email}`} className="flex items-center gap-1 hover:text-navy transition-colors">
            <Mail className="h-3 w-3" /> {partner.email}
          </a>
        )}
        {partner.website && (
          <a href={partner.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-navy transition-colors">
            <Globe className="h-3 w-3" /> Web
          </a>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Rating + project count */}
      <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
        {partner.rating != null ? (
          <span className="inline-flex items-center gap-1 font-semibold text-navy">
            <Star className="h-4 w-4 fill-solar text-solar" />
            {Number(partner.rating).toFixed(1)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Bez ocjene</span>
        )}
        {partner.projectCount != null && (
          <span className="text-xs text-muted-foreground">{partner.projectCount} projekata</span>
        )}
      </div>

      {/* CTA */}
      <Link
        to="/kalkulator"
        className="mt-5 flex items-center justify-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
      >
        Zatraži ponudu <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.article>
  );
}
