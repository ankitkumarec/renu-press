import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || !post.published) notFound();

  return (
    <article className="border-b border-[var(--color-line)]">
      <div className="container-narrow py-14 sm:py-20">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl text-balance">{post.title}</h1>
        <p className="mt-4 text-[var(--color-muted)]">{post.excerpt}</p>
        {post.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverUrl} alt="" className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover" />
        ) : null}
        <div className="prose mt-10 max-w-none text-base leading-relaxed text-[var(--color-ink)]">
          {post.body.split("\n").map((para, i) => (
            <p key={i} className="mb-4 text-[var(--color-muted)]">
              {para}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}
