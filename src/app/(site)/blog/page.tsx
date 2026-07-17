import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Journal" };

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="border-b border-[var(--color-line)]">
      <div className="container-rp py-14">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Journal</h1>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {posts.map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white">
              {p.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.coverUrl} alt="" className="aspect-[16/9] w-full object-cover" />
              ) : null}
              <div className="p-5">
                <h2 className="font-display text-xl font-semibold tracking-tight">{p.title}</h2>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{p.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
