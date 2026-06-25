import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Često postavljana pitanja — Prosumer.ba" },
      { name: "description", content: "Odgovori na najčešća pitanja o procesu, kalkulatoru i solarnim elektranama u BiH." },
    ],
  }),
  component: FaqPage,
});

const faqs = [
  {
    q: "Kako funkcionira Prosumer.ba?",
    a: "Unesete osnovne podatke o nekretnini (lokaciju, potrošnju, površinu krova), naš kalkulator izračuna preporučenu veličinu sustava i procijenjenu uštedu, a zatim vas povezujemo s provjerenim instalaterom koji vam šalje konkretnu ponudu.",
  },
  {
    q: "Koliko traje proces od upita do montaže?",
    a: "Ponuda od instalatera obično stigne u roku od 24 sata od popunjavanja kalkulatora. Sama montaža sustava, nakon prihvatanja ponude, traje u prosjeku 1-3 dana, ovisno o veličini sustava i dostupnosti opreme.",
  },
  {
    q: "Je li korištenje kalkulatora i platforme besplatno?",
    a: "Da, korištenje kalkulatora i dobivanje ponude od instalatera je u potpunosti besplatno za korisnike. Naknadu od instalatera naplaćujemo samo ako dođe do realizacije projekta.",
  },
  {
    q: "Koliko mogu uštedjeti sa solarnom elektranom?",
    a: "Ušteda ovisi o veličini sustava, potrošnji i orijentaciji krova, ali većina korisnika u BiH uštedi između 50% i 90% na računu za struju. Kalkulator daje personaliziranu procjenu za tvoju lokaciju.",
  },
  {
    q: "Koliki je period povrata investicije?",
    a: "Prosječan period povrata investicije za solarnu elektranu u BiH je između 6 i 9 godina, ovisno o veličini sustava i potrošnji. Sustav ima vijek trajanja od 25+ godina, pa je ušteda nakon povrata investicije čista zarada.",
  },
  {
    q: "Treba li mi baterija uz solarnu elektranu?",
    a: "Baterija nije obavezna, ali je preporučena ako želiš veću energetsku samodostatnost ili imaš česte prekide napajanja. Kalkulator daje preporuku veličine baterije na temelju tvoje potrošnje i veličine sustava.",
  },
  {
    q: "Mogu li postati prosumer i prodavati višak struje?",
    a: "Da. Kao prosumer, višak proizvedene struje koju ne potrošiš možeš predati u distribucijsku mrežu, u skladu s važećim propisima i ugovorom s elektrodistribucijom u tvom entitetu/kantonu.",
  },
  {
    q: "Koja vrsta krova je pogodna za solarne panele?",
    a: "Solarni paneli se mogu postaviti na ravne krovove, krovove pod crijepom i krovove s limenim pokrivačem. Orijentacija prema jugu daje najveću proizvodnju, ali i istok-zapad orijentacija je solidna opcija.",
  },
  {
    q: "Koliko prostora na krovu je potrebno?",
    a: "Standardni panel snage 400 W zauzima oko 1.7 m². Za prosječno kućanstvo (sustav 5-8 kWp) potrebno je između 25 i 45 m² slobodne, neosjenčane površine krova.",
  },
];

function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <SiteLayout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto max-w-3xl px-5 pt-16 pb-12 text-center lg:px-8 lg:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-eco/30 bg-eco-soft px-3 py-1 text-xs font-semibold text-eco">
            <HelpCircle className="h-3.5 w-3.5" /> FAQ
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-navy sm:text-5xl">Često postavljana pitanja</h1>
          <p className="mt-4 text-lg text-muted-foreground">Sve što treba da znaš o procesu, kalkulatoru i solarnim elektranama.</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-24 lg:px-8 lg:pb-32">
        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-display text-base font-semibold text-navy">{f.q}</span>
                  <ChevronDown className={`h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
    </SiteLayout>
  );
}
