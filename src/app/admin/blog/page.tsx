import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">Blog</h1>
      <ul className="space-y-2">
        {posts.map((p) => (
          <li key={p.id} className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-sm">
            <span className="font-medium">{p.title}</span>
            <span className="text-zinc-500">{p.published ? "Published" : "Draft"}</span>
          </li>
        ))}
      </ul>
      <Link href="/blog" className="text-sm text-amber-500">
        View public journal →
      </Link>
    </div>
  );
}
