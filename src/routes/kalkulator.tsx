import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, Battery, Leaf, TrendingUp, Calculator,
  MapPin, Building2, ChevronDown, Loader2, ArrowRight,
  User, Mail, Phone, CheckCircle2, Home, Zap,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/kalkulator")({
  head: () => ({
    meta: [
      { title: "Solarni kalkulator — Prosumer.ba" },
      { name: "description", content: "Izračunaj uštedu, ROI i veličinu solarne elektrane za tvoju lokaciju u BiH ili Hrvatskoj." },
    ],
  }),
  component: KalkulatorPage,
});

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

const BIH_CITIES = [
  { name: "Sarajevo",   lat: 43.8563, lon: 18.4131 },
  { name: "Banja Luka", lat: 44.7722, lon: 17.1910 },
  { name: "Tuzla",      lat: 44.5384, lon: 18.6734 },
  { name: "Zenica",     lat: 44.2031, lon: 17.9078 },
  { name: "Mostar",     lat: 43.3438, lon: 17.8078 },
];

const ORIENTATION_AZIMUTH: Record<string, number> = {
  jug: 0, "istok-zapad": 90, sjever: 180,
};

type CalcResult = {
  id: number;
  dataSource: "pvgis" | "fallback";
  recommendedSystemKw: number;
  estimatedAnnualProductionKwh: number;
  numberOfPanels: number;
  roofCoveragePercent: number;
  selfSufficiencyPercent: number;
  estimatedAnnualSavingsKm: number;
  estimatedMonthlySavingsKm: number;
  estimatedPaybackYears: number;
  estimatedSystemCostKm: number;
  peakSunHoursPerDay: number;
  co2SavedKgPerYear: number;
  co2SavedTonsPerYear: number;
  batteryRecommendation: string;
};

// ─── Step-indicator ────────────────────────────────────────────────────────────
function StepDots({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {[1, 2].map((s) => (
        <div key={s} className="flex items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${step >= s ? "bg-navy text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
            {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
          </div>
          <span className={`text-sm font-medium ${step >= s ? "text-navy" : "text-muted-foreground"}`}>
            {s === 1 ? "Kontakt" : "Kalkulator"}
          </span>
          {s < 2 && <div className={`h-px w-8 transition-all duration-300 ${step > s ? "bg-navy" : "bg-border"}`} />}
        </div>
      ))}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
function KalkulatorPage() {
  const [step, setStep] = useState<1 | 2>(1);

  // Step-1 fields
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailErr, setEmailErr] = useState("");

  // Step-2 calculator inputs
  const [bill, setBill]           = useState(120);
  const [area, setArea]           = useState(40);
  const [orientation, setOrientation] = useState<"jug" | "istok-zapad" | "sjever">("jug");
  const [roofType, setRoofType]   = useState<"" | "flat" | "tile" | "sheet_metal">("");
  const [meterType, setMeterType] = useState<"" | "single_phase" | "three_phase">("");

  // Location
  const [locationMode, setLocationMode] = useState<"detecting" | "gps" | "city">("detecting");
  const [gpsCoords, setGpsCoords]       = useState<{ lat: number; lon: number } | null>(null);
  const [selectedCity, setSelectedCity] = useState(BIH_CITIES[0]);

  // Live preview (step 2 debounced)
  const [preview, setPreview]         = useState<Omit<CalcResult, "id"> | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]         = useState<CalcResult | null>(null);
  const [submitErr, setSubmitErr]   = useState("");

  // ── Geolocation ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) { setLocationMode("city"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setGpsCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }); setLocationMode("gps"); },
      ()    => setLocationMode("city"),
      { timeout: 8000 },
    );
  }, []);

  const coords = locationMode === "gps" && gpsCoords
    ? gpsCoords
    : { lat: selectedCity.lat, lon: selectedCity.lon };

  // ── Live preview while on step 2 ─────────────────────────────────────────────
  useEffect(() => {
    if (step !== 2 || locationMode === "detecting") return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchPreview, 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bill, area, orientation, coords.lat, coords.lon, step, locationMode]);

  async function fetchPreview() {
    setPreviewLoading(true);
    try {
      const res = await fetch(`${API_BASE}/solar-calculator/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: coords.lat, longitude: coords.lon,
          roofAreaSqm: area,
          annualKwh: Math.round((bill * 12) / 0.25),
          roofAzimuthDegrees: ORIENTATION_AZIMUTH[orientation],
          roofTiltDegrees: 30,
        }),
      });
      if (res.ok) setPreview(await res.json());
    } catch { /* silent */ }
    finally { setPreviewLoading(false); }
  }

  // ── Step 1 → 2 ───────────────────────────────────────────────────────────────
  function goToStep2() {
    if (!email.trim()) { setEmailErr("Email adresa je obavezna."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailErr("Unesite ispravnu email adresu."); return; }
    setEmailErr("");
    setStep(2);
  }

  // ── Final submit ─────────────────────────────────────────────────────────────
  async function handleSubmit() {
    setSubmitting(true);
    setSubmitErr("");
    try {
      const res = await fetch(`${API_BASE}/solar-leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          latitude:  locationMode === "gps" ? coords.lat : undefined,
          longitude: locationMode === "gps" ? coords.lon : undefined,
          locationCity: locationMode === "city" ? selectedCity.name : undefined,
          monthlyBillKm: bill,
          roofAreaSqm: area,
          roofAzimuthDegrees: ORIENTATION_AZIMUTH[orientation],
          roofTiltDegrees: 30,
          roofType:   roofType   || undefined,
          meterType:  meterType  || undefined,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setResult(await res.json());
    } catch {
      setSubmitErr("Greška pri slanju podataka. Provjeri konekciju i pokušaj ponovo.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto max-w-7xl px-5 pt-16 pb-12 lg:px-8 lg:pt-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-eco/30 bg-eco-soft px-3 py-1 text-xs font-semibold text-eco">
              <Calculator className="h-3.5 w-3.5" /> Solarni kalkulator
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-navy sm:text-5xl">
              Procjena uštede u realnom vremenu
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">Dva kratka koraka — bez registracije, bez obaveza.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8 lg:pb-32">
        <AnimatePresence mode="wait">

          {/* ════════════════ STEP 1 ════════════════ */}
          {step === 1 && !result && (
            <motion.div key="step1" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }}
              className="mx-auto max-w-xl">
              <StepDots step={1} />

              <div className="rounded-3xl border border-border bg-card p-8 shadow-elevated space-y-5">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-navy">Tvoji kontakt podaci</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Kontaktirat ćemo te s ponudama prilagođenim tvojoj lokaciji.</p>
                </div>

                {/* Name */}
                <div>
                  <label className="text-sm font-semibold text-navy">Ime i prezime</label>
                  <div className="relative mt-2">
                    <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="npr. Marko Marković"
                      className="w-full rounded-xl border border-border bg-background pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-solar" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-semibold text-navy">
                    Email adresa <span className="text-destructive">*</span>
                  </label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={email} onChange={(e) => { setEmail(e.target.value); setEmailErr(""); }}
                      type="email" placeholder="npr. marko@email.ba"
                      className={`w-full rounded-xl border pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-solar bg-background ${emailErr ? "border-destructive" : "border-border"}`} />
                  </div>
                  {emailErr && <p className="mt-1.5 text-xs text-destructive">{emailErr}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-sm font-semibold text-navy">
                    Broj telefona <span className="text-muted-foreground font-normal">(opcionalno)</span>
                  </label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={phone} onChange={(e) => setPhone(e.target.value)}
                      type="tel" placeholder="npr. +387 61 000 000"
                      className="w-full rounded-xl border border-border bg-background pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-solar" />
                  </div>
                </div>

                <button onClick={goToStep2}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]">
                  Dalje — kalkulator <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ════════════════ STEP 2 ════════════════ */}
          {step === 2 && !result && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.35 }}>
              <StepDots step={2} />

              <div className="grid gap-8 lg:grid-cols-5">
                {/* ── Inputs ── */}
                <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-7 shadow-elevated lg:sticky lg:top-24 self-start space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-semibold text-navy">Podaci o objektu</h2>
                    <button onClick={() => setStep(1)} className="text-xs text-muted-foreground underline underline-offset-2">← Nazad</button>
                  </div>

                  {/* Bill slider */}
                  <SliderField label="Mjesečni račun za struju" value={`KM ${bill}`}>
                    <input type="range" min={30} max={500} step={5} value={bill} onChange={(e) => setBill(+e.target.value)} className="range" />
                  </SliderField>

                  {/* Area slider */}
                  <SliderField label="Dostupna površina krova" value={`${area} m²`}>
                    <input type="range" min={10} max={200} step={5} value={area} onChange={(e) => setArea(+e.target.value)} className="range" />
                  </SliderField>

                  {/* Orientation */}
                  <div>
                    <label className="text-sm font-semibold text-navy">Orijentacija krova</label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {([["jug","Jug"],["istok-zapad","I/Z"],["sjever","Sjever"]] as const).map(([k,l]) => (
                        <button key={k} onClick={() => setOrientation(k)}
                          className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${orientation === k ? "border-navy bg-navy text-primary-foreground" : "border-border bg-background text-navy hover:bg-secondary"}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Roof type */}
                  <div>
                    <label className="text-sm font-semibold text-navy">
                      Vrsta krova <span className="text-muted-foreground font-normal">(opcionalno)</span>
                    </label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {([["flat","Ravni"],["tile","Crijep"],["sheet_metal","Lim"]] as const).map(([k,l]) => (
                        <button key={k} onClick={() => setRoofType(roofType === k ? "" : k)}
                          className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all flex flex-col items-center gap-1 ${roofType === k ? "border-navy bg-navy text-primary-foreground" : "border-border bg-background text-navy hover:bg-secondary"}`}>
                          <Home className="h-3.5 w-3.5" />{l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Meter type */}
                  <div>
                    <label className="text-sm font-semibold text-navy">
                      Vrsta priključka <span className="text-muted-foreground font-normal">(opcionalno)</span>
                    </label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {([["single_phase","Jednofazni"],["three_phase","Trofazni"]] as const).map(([k,l]) => (
                        <button key={k} onClick={() => setMeterType(meterType === k ? "" : k)}
                          className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${meterType === k ? "border-navy bg-navy text-primary-foreground" : "border-border bg-background text-navy hover:bg-secondary"}`}>
                          <Zap className="h-3.5 w-3.5" />{l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="text-sm font-semibold text-navy">Lokacija</label>
                    {locationMode === "detecting" && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Detekcija lokacije…
                      </div>
                    )}
                    {locationMode === "gps" && gpsCoords && (
                      <div className="mt-2 flex items-center justify-between rounded-xl border border-eco/40 bg-eco-soft px-4 py-3">
                        <span className="flex items-center gap-2 text-sm font-medium text-eco-foreground">
                          <MapPin className="h-4 w-4" /> GPS lokacija aktivna
                        </span>
                        <button onClick={() => setLocationMode("city")} className="text-xs text-muted-foreground underline underline-offset-2">odaberi grad</button>
                      </div>
                    )}
                    {locationMode === "city" && (
                      <div className="mt-2">
                        <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5" /> 5 najvećih gradova u BiH
                        </p>
                        <div className="relative">
                          <select value={selectedCity.name}
                            onChange={(e) => setSelectedCity(BIH_CITIES.find((c) => c.name === e.target.value) ?? BIH_CITIES[0])}
                            className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 pr-10 text-sm font-medium text-navy outline-none focus:ring-2 focus:ring-solar">
                            {BIH_CITIES.map((c) => <option key={c.name}>{c.name}</option>)}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                        <button onClick={() => { setLocationMode("detecting"); navigator.geolocation?.getCurrentPosition((p) => { setGpsCoords({ lat: p.coords.latitude, lon: p.coords.longitude }); setLocationMode("gps"); }, () => setLocationMode("city")); }}
                          className="mt-2 flex items-center gap-1.5 text-xs text-navy underline underline-offset-2">
                          <MapPin className="h-3 w-3" /> Pokušaj s GPS-om
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  {submitErr && <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">{submitErr}</p>}

                  <button onClick={handleSubmit} disabled={submitting || locationMode === "detecting"}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                    {submitting
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Šaljem zahtjev…</>
                      : <>Dohvati ponude <ArrowRight className="h-4 w-4" /></>}
                  </button>

                  <style>{`.range{appearance:none;width:100%;height:6px;background:linear-gradient(to right,var(--navy),var(--eco));border-radius:9999px;outline:none;margin-top:14px}.range::-webkit-slider-thumb{appearance:none;width:22px;height:22px;border-radius:9999px;background:white;border:3px solid var(--navy);box-shadow:0 4px 12px rgba(0,0,0,.15);cursor:pointer}.range::-moz-range-thumb{width:22px;height:22px;border-radius:9999px;background:white;border:3px solid var(--navy);cursor:pointer}`}</style>
                </div>

                {/* ── Live preview ── */}
                <div className="lg:col-span-3 space-y-5">
                  <div className="rounded-2xl border border-border/60 bg-secondary/40 px-5 py-3 text-sm text-muted-foreground">
                    Prijedlog se ažurira u realnom vremenu dok mijenjaš parametre.
                  </div>

                  {previewLoading && !preview && (
                    <div className="flex items-center gap-3 py-10 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" /> Računam…
                    </div>
                  )}

                  {preview && <ResultCards r={preview} loading={previewLoading} />}
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════════ SUCCESS ════════════════ */}
          {result && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
              {/* Confirmation banner */}
              <div className="mb-8 flex items-start gap-4 rounded-3xl border border-eco/30 bg-eco-soft px-6 py-5">
                <CheckCircle2 className="h-7 w-7 shrink-0 text-eco mt-0.5" />
                <div>
                  <p className="font-display text-lg font-semibold text-navy">Zahtjev primljen!</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Hvala, <strong>{name || "korisniče"}</strong>! Kontaktirat ćemo te na <strong>{email}</strong> s personaliziranim ponudama instalatera u tvojoj blizini.
                  </p>
                </div>
              </div>

              {/* Full results */}
              <ResultCards r={result} loading={false} />

              <button onClick={() => { setStep(1); setResult(null); setPreview(null); setName(""); setEmail(""); setPhone(""); }}
                className="mt-8 flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-navy transition-transform hover:scale-[1.02]">
                Nova procjena
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </section>
    </SiteLayout>
  );
}

// ─── Shared result cards ───────────────────────────────────────────────────────
function ResultCards({ r, loading }: { r: Omit<CalcResult, "id">; loading: boolean }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Stat icon={Sun}        label="Veličina sustava"   value={`${r.recommendedSystemKw} kWp`}                               tone="navy"  loading={loading} />
        <Stat icon={TrendingUp} label="Godišnja proizv."   value={`${r.estimatedAnnualProductionKwh.toLocaleString("hr-HR")} kWh`} tone="eco"   loading={loading} />
        <Stat icon={Calculator} label="Mjesečna ušteda"    value={`KM ${r.estimatedMonthlySavingsKm}`}                           tone="solar" loading={loading} />
        <Stat icon={Leaf}       label="CO₂ ušteda/god"     value={`${r.co2SavedTonsPerYear} t`}                                 tone="eco"   loading={loading} />
      </div>

      <div className="rounded-3xl border border-border bg-card p-7 shadow-elevated">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Procijenjena investicija</div>
            <div className="mt-1 font-display text-4xl font-bold text-navy">KM {r.estimatedSystemCostKm.toLocaleString("hr-HR")}</div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Povrat</div>
            <div className="mt-1 font-display text-4xl font-bold text-eco">{r.estimatedPaybackYears} god</div>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex justify-between text-xs text-muted-foreground"><span>Godina 1</span><span>Godina 25</span></div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-secondary">
            <motion.div key={r.estimatedPaybackYears} initial={{ width: 0 }} animate={{ width: `${Math.min((r.estimatedPaybackYears / 25) * 100, 100)}%` }} transition={{ duration: 0.8 }} className="h-full bg-gradient-to-r from-navy to-eco" />
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Nakon povrata, ušteda je čista zarada. Sustav ima vijek 25+ godina.</div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-5">
          <MiniStat label="Paneli"          value={`${r.numberOfPanels} kom`} />
          <MiniStat label="Pokrivenost"     value={`${r.roofCoveragePercent}%`} />
          <MiniStat label="Samodostatnost"  value={`${r.selfSufficiencyPercent}%`} />
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-7">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-solar-soft text-navy">
            <Battery className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-lg font-semibold text-navy">{r.batteryRecommendation}</div>
            <div className="text-sm text-muted-foreground">Preporuka temeljena na veličini sustava i potrošnji.</div>
          </div>
        </div>
      </div>

      {r.dataSource && (
        <p className="text-right text-[11px] text-muted-foreground">
          Izvor podataka: <span className="font-semibold">{r.dataSource === "pvgis" ? "EU JRC PVGIS (stvarni podaci)" : "Latitude-band model (fallback)"}</span>
        </p>
      )}
    </div>
  );
}

function SliderField({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-semibold text-navy">{label}</label>
        <span className="font-display text-lg font-bold text-navy">{value}</span>
      </div>
      {children}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/50 px-3 py-2.5 text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-bold text-navy">{value}</div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone, loading }: { icon: any; label: string; value: string; tone: "navy" | "eco" | "solar"; loading?: boolean }) {
  const styles    = { navy: "bg-navy text-primary-foreground", eco: "bg-eco-soft text-eco-foreground", solar: "bg-solar-soft text-navy" } as const;
  const iconStyle = { navy: "bg-solar text-navy", eco: "bg-eco text-primary-foreground", solar: "bg-navy text-solar" } as const;
  const labelCls  = tone === "navy" ? "text-primary-foreground/70" : "text-muted-foreground";
  const valueCls  = tone === "navy" ? "text-primary-foreground" : "text-navy";
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: loading ? 0.6 : 1, scale: 1 }} transition={{ duration: 0.4 }}
      className={`rounded-3xl p-5 ${styles[tone]}`}>
      <div className={`grid h-10 w-10 place-items-center rounded-xl ${iconStyle[tone]}`}><Icon className="h-5 w-5" /></div>
      <div className={`mt-4 text-xs uppercase tracking-wider ${labelCls}`}>{label}</div>
      <div className={`mt-1 font-display text-2xl font-bold ${valueCls}`}>{value}</div>
    </motion.div>
  );
}
