"use client";

import { useEffect, useState } from "react";

type Product = { id: string; name: string; imageUrl: string | null; basePrice: number; slug: string };
type Gallery = { id: string; title: string; imageUrl: string; album: string };

export function CatalogMediaManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [gallery, setGallery] = useState<Gallery[]>([]);
  const [kind, setKind] = useState<"product" | "gallery" | "portfolio">("product");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(0);
  const [desc, setDesc] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("Gifts");
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/erp/media");
    const data = await res.json();
    setProducts(data.products || []);
    setGallery(data.gallery || []);
  }
  useEffect(() => {
    void load();
  }, []);

  const field =
    "mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none";

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 3_500_000) {
      alert("Image 3.5MB se chhoti rakho");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageUrl(String(reader.result || ""));
    reader.readAsDataURL(f);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!imageUrl) {
      alert("JPG/PNG upload karo");
      return;
    }
    const res = await fetch("/api/erp/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind,
        title,
        imageUrl,
        category,
        description: desc || title,
        basePrice: price,
        album: category,
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      setMsg(data.message || "Fail");
      return;
    }
    setMsg("Saved — website pe dikhega (product/gallery)");
    setTitle("");
    setDesc("");
    setImageUrl("");
    setPrice(0);
    void load();
  }

  async function remove(k: string, id: string) {
    if (!confirm("Delete?")) return;
    await fetch(`/api/erp/media?kind=${k}&id=${id}`, { method: "DELETE" });
    void load();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2 max-w-xl">
        <h2 className="text-sm font-bold">Gift / product / section image upload</h2>
        <select className={field} value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
          <option value="product">Gift / Product (shop catalog)</option>
          <option value="gallery">Gallery image (website album)</option>
          <option value="portfolio">Portfolio / section showcase</option>
        </select>
        <input className={field} placeholder="Title (Trophy Gold / Mug Print…)" required value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className={field} placeholder="Category (Gifts, Trophies, Apparel…)" value={category} onChange={(e) => setCategory(e.target.value)} />
        {kind === "product" && (
          <input className={field} type="number" placeholder="Price ₹" value={price || ""} onChange={(e) => setPrice(Number(e.target.value))} />
        )}
        <textarea className={field} rows={2} placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <input className={field} type="file" accept="image/jpeg,image/png,image/webp,image/jpg" onChange={onFile} />
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="preview" className="h-32 w-32 rounded-xl object-cover border border-white/10" />
        )}
        <button type="submit" className="rounded-full bg-gradient-to-r from-orange-500 to-rose-600 px-6 py-2.5 text-sm font-bold">
          Upload & save
        </button>
        {msg && <p className="text-sm text-emerald-400">{msg}</p>}
      </form>

      <div>
        <h3 className="text-sm font-bold mb-3">Products / Gifts</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <article key={p.id} className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.03]">
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt={p.name} className="h-36 w-full object-cover" />
              ) : (
                <div className="h-36 bg-white/5" />
              )}
              <div className="p-3">
                <div className="font-semibold text-sm">{p.name}</div>
                <div className="text-xs text-orange-300">₹{p.basePrice.toLocaleString("en-IN")}</div>
                <button type="button" className="mt-2 text-[11px] text-rose-400 font-bold" onClick={() => void remove("product", p.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold mb-3">Gallery</h3>
        <div className="grid gap-2 grid-cols-3 sm:grid-cols-5">
          {gallery.map((g) => (
            <div key={g.id} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.imageUrl} alt={g.title} className="aspect-square w-full rounded-xl object-cover" />
              <button
                type="button"
                className="absolute inset-x-1 bottom-1 rounded bg-black/70 text-[10px] py-0.5 opacity-0 group-hover:opacity-100"
                onClick={() => void remove("gallery", g.id)}
              >
                Del
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
