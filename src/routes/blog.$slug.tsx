import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ArrowLeft } from "lucide-react";
import { blogPosts } from "@/content/blog-posts";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = blogPosts.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Prosumer.ba` },
          { name: "description", content: loaderData.description },
        ]
      : [],
  }),
  component: BlogPostPage,
});

function BlogPostPage() {
  const post = Route.useLoaderData();

  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-24">
        <Link to="/blog" className="flex w-fit items-center gap-2 text-sm font-semibold text-navy hover:text-eco">
          <ArrowLeft className="h-4 w-4" /> Sve objave
        </Link>

        <span className="mt-8 block w-fit text-[11px] font-semibold uppercase tracking-wider text-eco">{post.category}</span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">{post.title}</h1>

        <div className="mt-8 aspect-[16/9] overflow-hidden rounded-3xl">
          <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
        </div>

        <div className="mt-10 space-y-5 text-base leading-relaxed text-foreground">
          {post.content.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <Link to="/kalkulator" className="mt-12 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]">
          Izračunaj svoju uštedu
        </Link>
      </article>
    </SiteLayout>
  );
}
