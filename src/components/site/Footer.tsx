import { Link } from "@tanstack/react-router";
import { Sun } from "lucide-react";
import { EuFlag } from "./EuFlag";

export function Footer() {
  return (
    <footer className="mt-32 bg-navy text-primary-foreground">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-solar text-navy"><Sun className="h-5 w-5" strokeWidth={2.5} /></span>
              <span className="font-display text-lg font-semibold">Prosumer.ba</span>
            </div>
            <div className="mt-5 flex max-w-sm flex-wrap gap-2">
              {["solarne elektrane", "BiH", "prosumer", "ušteda struje", "instalateri"].map((kw) => (
                <span key={kw} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-primary-foreground/70">{kw}</span>
              ))}
            </div>
          </div>
          <FooterCol title="Platforma" links={[
            { to: "/kalkulator", label: "Kalkulator uštede" },
            { to: "/kako-funkcionira", label: "Kako funkcionira" },
          ]} />
          <FooterCol title="Resursi" links={[
            { to: "/blog", label: "Blog & vodiči" },
            { to: "/subvencije", label: "Subvencije" },
            { to: "/blog", label: "ROI kalkulator" },
          ]} />
          <FooterCol title="Kompanija" links={[
            { to: "/o-nama", label: "O nama" },
            { to: "/kontakt", label: "Kontakt" },
            { to: "/faq", label: "FAQ" },
          ]} />
        </div>
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-xs text-primary-foreground/60 md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} Prosumer.ba — Sva prava pridržana.</span>
          <div className="flex items-center gap-2">
            <EuFlag className="h-12 w-[72px] rounded-sm shadow-sm" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="font-display text-sm font-semibold text-solar">{title}</h4>
      <ul className="mt-4 space-y-3">
        {links.map((l, i) => (
          <li key={i}><Link to={l.to} className="text-sm text-primary-foreground/70 hover:text-primary-foreground">{l.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
