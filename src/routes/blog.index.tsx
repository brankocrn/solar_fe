import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ArrowRight } from "lucide-react";
import { blogPosts } from "@/content/blog-posts";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog & vodiči — Prosumer.ba" },
      { name: "description", content: "Vodiči i analize o solarnoj energiji i ROI-u za BiH." },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto max-w-7xl px-5 pt-20 pb-12 lg:px-8 lg:pt-28">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-eco">Resursi</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-navy sm:text-6xl">Vodiči i analize</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">Sve što trebaš znati o solarnoj energiji, baterijama i ROI-u u BiH.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((p, i) => (
            <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }}>
              <motion.article initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 }}
                className="group cursor-pointer rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-elevated">
                <div className="aspect-[16/10] overflow-hidden rounded-2xl">
                  <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                </div>
                <span className="mt-5 inline-block text-[11px] font-semibold uppercase tracking-wider text-eco">{p.category}</span>
                <h3 className="mt-2 font-display text-lg font-semibold text-navy group-hover:text-eco">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-navy">Pročitaj <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></div>
              </motion.article>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
