import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const images = await prisma.galleryImage.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="border-b border-[var(--color-line)]">
      <section className="container-rp py-14">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Gallery</h1>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {images.map((img, i) => (
            <figure
              key={img.id}
              className={`overflow-hidden rounded-2xl border border-[var(--color-line)] ${i % 5 === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.imageUrl} alt={img.title} className="h-full min-h-[180px] w-full object-cover" />
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
