import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ArrowRight, Info } from "lucide-react";

export const Route = createFileRoute("/subvencije")({
  head: () => ({
    meta: [
      { title: "Subvencije — Prosumer.ba" },
      { name: "description", content: "Pregled aktivnih državnih subvencija za solarne elektrane u BiH." },
    ],
  }),
  component: () => (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-5 py-24 lg:px-8 lg:py-32 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-eco-soft text-eco">
          <Info className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-navy sm:text-4xl">Trenutno nema aktivnih subvencija</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Čim se otvori novi poticajni program za solarne elektrane u BiH, informacije će biti objavljene ovdje.
        </p>

        <Link to="/kalkulator" className="mt-10 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]">
          Izračunaj uštedu bez subvencije <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </SiteLayout>
  ),
});
