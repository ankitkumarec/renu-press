"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        password: fd.get("password"),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message || "Signup failed");
      return;
    }
    router.push("/account");
    router.refresh();
  }

  const field =
    "mt-1.5 w-full rounded-xl border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-ink)]";

  return (
    <div className="border-b border-[var(--color-line)]">
      <div className="container-narrow py-16">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Create customer account</h1>
        <form onSubmit={onSubmit} className="mt-8 max-w-md space-y-4 rounded-2xl border border-[var(--color-line)] bg-white p-6">
          <label className="block text-xs font-semibold text-[var(--color-muted)]">
            Name
            <input name="name" required className={field} />
          </label>
          <label className="block text-xs font-semibold text-[var(--color-muted)]">
            Email
            <input name="email" type="email" required className={field} />
          </label>
          <label className="block text-xs font-semibold text-[var(--color-muted)]">
            Phone
            <input name="phone" required className={field} />
          </label>
          <label className="block text-xs font-semibold text-[var(--color-muted)]">
            Password
            <input name="password" type="password" required minLength={8} className={field} />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-[var(--color-ink)] py-3 text-sm font-semibold text-white">
            {loading ? "Creating…" : "Sign up"}
          </button>
        </form>
        <p className="mt-4 text-sm">
          Have an account?{" "}
          <Link href="/login" className="font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
