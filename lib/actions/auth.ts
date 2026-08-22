"use server";
// lib/actions/auth.ts
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface SignInInput {
  email: string;
  password: string;
  redirectTo?: string;
}

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
  redirectTo?: string;
}

// Only allow same-site, path-relative redirects. Blocks both absolute URLs
// ("https://evil.com") and protocol-relative URLs ("//evil.com"), which
// browsers treat as off-site even though "//evil.com".startsWith("/") is true.
function safeRedirectTarget(redirectTo: string | undefined): string {
  if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    return redirectTo;
  }
  return "/";
}

// Returns an error message on failure. On success it redirects, so it
// never "returns" in the success case.
export async function signIn(
  input: SignInInput
): Promise<{ error: string }> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: input.email.trim(),
    password: input.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(safeRedirectTarget(input.redirectTo));
}

export async function signUp(
  input: SignUpInput
): Promise<{ error: string } | { confirmationRequired: true }> {
  const supabase = await createClient();

  const fullName = input.fullName.trim();
  const email = input.email.trim();

  if (!fullName) {
    return { error: "Please enter your full name." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      // Confirmation emails (if enabled in your Supabase Auth settings)
      // link back here, which exchanges the code for a session.
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/callback`,
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If email confirmation is required, there's no session yet — ask the
  // person to check their inbox instead of redirecting straight in.
  if (data.user && !data.session) {
    return { confirmationRequired: true };
  }

  // A `customers` row keyed on auth.users.id is expected to be created by
  // a Postgres trigger (e.g. `handle_new_user`) — do not create it here,
  // or you'll get duplicate-row errors when the trigger also fires.
  redirect(safeRedirectTarget(input.redirectTo));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}