"use client";

import Link from "next/link";
import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, UserRound, HardHat, ArrowRight } from "lucide-react";

type Portal = "customer" | "staff" | "admin";

const PORTALS: {
  id: Portal;
  label: string;
  hint: string;
  icon: typeof UserRound;
  grad: string;
}[] = [
  {
    id: "customer",
    label: "Customer",
    hint: "Orders · invoices · wallet",
    icon: UserRound,
    grad: "from-cyan-500 to-blue-600",
  },
  {
    id: "staff",
    label: "Staff",
    hint: "Jobs · attendance · salary",
    icon: HardHat,
    grad: "from-amber-500 to-orange-600",
  },
  {
    id: "admin",
    label: "Admin ERP",
    hint: "Full business control",
    icon: Building2,
    grad: "from-violet-500 to-fuchsia-600",
  },
];

export default function LoginHubPage() {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-slate-400">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const initial = (sp.get("as") as Portal) || "admin";
  const [portal, setPortal] = useState<Portal>(
    PORTALS.some((p) => p.id === initial) ? initial : "admin",
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        emailOrPhone: fd.get("emailOrPhone"),
        password: fd.get("password"),
        expected: portal,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message || "Login failed");
      return;
    }
    router.push(data.redirect || "/");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-16 h-72 w-72 animate-pulse rounded-full bg-orange-500/25 blur-3xl" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_transparent,_#050814_70%)]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 via-rose-500 to-purple-600 text-sm font-black shadow-lg shadow-orange-500/30">
            RP
          </div>
          <h1 className="mt-4 font-display text-2xl font-black tracking-tight sm:text-3xl">RENU PRESS</h1>
          <p className="mt-1 text-sm text-slate-400">Secure access · Saharsa ERP</p>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-2">
          {PORTALS.map((p) => {
            const Icon = p.icon;
            const active = portal === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPortal(p.id)}
                className={`rounded-2xl border p-3 text-left transition ${
                  active
                    ? "border-white/25 bg-white/10 shadow-lg"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                }`}
              >
                <div className={`mb-2 grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${p.grad} text-white`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-xs font-bold text-white">{p.label}</div>
                <div className="mt-0.5 text-[10px] leading-snug text-slate-500">{p.hint}</div>
              </button>
            );
          })}
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-white/15 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl sm:p-7"
        >
          <div className="mb-4 text-sm font-semibold text-slate-300">
            Sign in as <span className="text-white">{PORTALS.find((p) => p.id === portal)?.label}</span>
          </div>
          <label className="block text-xs font-bold text-slate-400">
            Email or phone
            <input
              name="emailOrPhone"
              required
              autoComplete="username"
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-3 text-sm text-white outline-none focus:border-orange-400/50"
              placeholder={
                portal === "admin"
                  ? "admin@renupress.in"
                  : portal === "staff"
                    ? "staff@renupress.in"
                    : "customer@example.com"
              }
            />
          </label>
          <label className="mt-3 block text-xs font-bold text-slate-400">
            Password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-3 text-sm text-white outline-none focus:border-orange-400/50"
            />
          </label>
          {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 py-3.5 text-sm font-bold text-white shadow-lg disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          <Link href="/" className="text-slate-400 underline-offset-2 hover:text-white hover:underline">
            ← Back to public website
          </Link>
        </p>
      </div>
    </div>
  );
}
