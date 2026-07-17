"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
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
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message || "Login failed");
      return;
    }
    if (["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(data.role)) {
      router.push("/admin");
    } else if (data.role === "EMPLOYEE" || data.role === "DESIGNER") {
      router.push("/employee");
    } else {
      router.push("/account");
    }
    router.refresh();
  }

  const field =
    "mt-1.5 w-full rounded-xl border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-ink)]";

  return (
    <div className="border-b border-[var(--color-line)]">
      <div className="container-narrow py-16 sm:py-20">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">Customers, staff and admin use this portal.</p>
        <form onSubmit={onSubmit} className="mt-8 max-w-md space-y-4 rounded-2xl border border-[var(--color-line)] bg-white p-6">
          <label className="block text-xs font-semibold text-[var(--color-muted)]">
            Email or phone
            <input name="emailOrPhone" required className={field} placeholder="admin@renupress.in" />
          </label>
          <label className="block text-xs font-semibold text-[var(--color-muted)]">
            Password
            <input name="password" type="password" required className={field} />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-[var(--color-ink)] py-3 text-sm font-semibold text-white disabled:opacity-60">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-sm text-[var(--color-muted)]">
          New customer?{" "}
          <Link href="/signup" className="font-semibold text-[var(--color-ink)]">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
