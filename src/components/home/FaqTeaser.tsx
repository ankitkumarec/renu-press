"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function FaqTeaser({
  faqs,
}: {
  faqs: { id: string; question: string; answer: string }[];
}) {
  return (
    <section className="section-light py-16 sm:py-20">
      <div className="container-wide grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="text-xs font-bold tracking-[0.25em] text-orange-600 uppercase">FAQ</p>
          <h2 className="font-display mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Answers before you call</h2>
          <Link href="/faq" className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white">
            Full FAQ →
          </Link>
        </div>
        <div className="space-y-3 lg:col-span-8">
          {faqs.map((f, i) => (
            <motion.details
              key={f.id}
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-md open:shadow-lg"
            >
              <summary className="cursor-pointer list-none font-bold text-slate-900 marker:content-none">
                {f.question}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.answer}</p>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  );
}
