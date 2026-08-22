"use client";
// app/signup/page.tsx
import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signUp } from "@/lib/actions/auth";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await signUp({ email, password, fullName, redirectTo });
      if ("error" in result) {
        setError(result.error);
        return;
      }

      if (result.confirmationRequired) {
        // Email confirmation is ON in Supabase — no session yet.
        setCheckEmail(true);
        return;
      }

      // Confirmation is OFF — signUp already redirected server-side.
      // (This branch normally won't be reached since signUp calls
      // redirect() itself on success, but kept here as a safe fallback.)
      router.push(redirectTo);
      router.refresh();
    });
  }

  if (checkEmail) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-5 py-16 text-center sm:px-0">
        <h1 className="font-display text-2xl font-semibold">Check your email</h1>
        <p className="mt-2 text-sm text-[var(--text-soft)]">
          We sent a confirmation link to <strong>{email}</strong>. Click it to
          activate your account, then sign in.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full px-6 py-3 text-sm font-semibold"
          style={{ background: "var(--text)", color: "var(--bg)" }}
        >
          Go to sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-5 py-16 sm:px-0">
      <h1 className="font-display text-2xl font-semibold">Create an account</h1>
      <p className="mt-1 text-sm text-[var(--text-soft)]">
        Sign up to start shopping.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Full name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border px-4 py-2.5 text-sm"
            style={{ borderColor: "var(--border)" }}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border px-4 py-2.5 text-sm"
            style={{ borderColor: "var(--border)" }}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border px-4 py-2.5 text-sm"
            style={{ borderColor: "var(--border)" }}
          />
        </div>

        {error && (
          <p className="text-sm" style={{ color: "var(--danger)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 w-full rounded-full py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: "var(--text)", color: "var(--bg)" }}
        >
          {isPending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-soft)]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[var(--accent)] hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}