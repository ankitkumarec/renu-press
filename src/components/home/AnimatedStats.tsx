"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Award, Package, Layers, Heart, Headphones, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Stat = {
  value: number;
  suffix: string;
  label: string;
  desc: string;
  icon: typeof Award;
  gradient: string;
};

const STATS: Stat[] = [
  {
    value: 12,
    suffix: "+",
    label: "Years of Excellence",
    desc: "Trusted press craft in Saharsa",
    icon: Award,
    gradient: "from-orange-500 to-pink-500",
  },
  {
    value: 50000,
    suffix: "+",
    label: "Orders Delivered",
    desc: "Cards, flex, gifts & branding",
    icon: Package,
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    value: 70,
    suffix: "+",
    label: "Printing Services",
    desc: "One floor, full production stack",
    icon: Layers,
    gradient: "from-violet-500 to-fuchsia-500",
  },
  {
    value: 10000,
    suffix: "+",
    label: "Happy Customers",
    desc: "Shops, schools, families & brands",
    icon: Heart,
    gradient: "from-rose-500 to-orange-400",
  },
  {
    value: 24,
    suffix: "h",
    label: "Support Window",
    desc: "Quotes & updates on busy days",
    icon: Headphones,
    gradient: "from-cyan-400 to-blue-600",
  },
  {
    value: 99,
    suffix: "%",
    label: "Customer Satisfaction",
    desc: "Proof-first quality checks",
    icon: BadgeCheck,
    gradient: "from-emerald-400 to-teal-500",
  },
];

function useCountUp(target: number, active: boolean, duration = 1800) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    let raf = 0;
    const step = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.floor(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
      else setN(target);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return n;
}

function StatCard({ stat, delay }: { stat: Stat; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const count = useCountUp(stat.value, inView);
  const Icon = stat.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <div className={cn("absolute -inset-px rounded-[1.6rem] bg-gradient-to-br opacity-70 blur-[1px] transition group-hover:opacity-100", stat.gradient)} />
      <div className="relative h-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0c1428]/90 p-5 shadow-xl shadow-black/30 backdrop-blur-xl transition duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl sm:p-6">
        <div className={cn("mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg", stat.gradient)}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="font-display text-3xl font-black tracking-tight text-white tabular-nums sm:text-4xl">
          {count.toLocaleString("en-IN")}
          <span className="bg-gradient-to-r from-orange-300 to-cyan-300 bg-clip-text text-transparent">{stat.suffix}</span>
        </div>
        <div className="mt-2 text-sm font-bold text-white">{stat.label}</div>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">{stat.desc}</p>
        <div className={cn("pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition group-hover:opacity-40", stat.gradient)} />
      </div>
    </motion.div>
  );
}

export function AnimatedStats({ experienceYears = 12 }: { experienceYears?: number }) {
  const stats = STATS.map((s) => (s.label.includes("Years") ? { ...s, value: experienceYears } : s));

  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div className="blob top-10 left-10 h-40 w-40 bg-orange-500/40" />
      <div className="blob right-10 bottom-10 h-48 w-48 bg-blue-600/30" style={{ animationDelay: "2s" }} />
      <div className="container-wide relative">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-bold tracking-[0.25em] text-orange-400 uppercase">Achievements</p>
          <h2 className="font-display mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
            Numbers that <span className="grad-text">print trust</span>
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s, i) => (
            <StatCard key={s.label} stat={s} delay={i * 0.07} />
          ))}
        </div>
      </div>
    </section>
  );
}
