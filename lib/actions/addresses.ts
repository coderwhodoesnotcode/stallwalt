"use server";
// lib/actions/addresses.ts
import { createClient } from "@/lib/supabase/server";

export interface AddressInput {
  full_name: string;
  phone?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

export interface Address extends AddressInput {
  id: string;
  customer_id: string;
  type: string;
  is_default?: boolean;
  created_at?: string;
}

export async function createAddress(input: AddressInput): Promise<Address> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in to save an address");

  const payload = {
    ...input,
    customer_id: user.id,
    type: "shipping",
  };

  // NOTE: casting the query builder to `any` here as a workaround for a
  // broken .insert() type inference chain in the current supabase-js /
  // @supabase/ssr version combo (produces false "never[]" errors even
  // though the actual request is correct). Runtime behavior is unaffected.
  // TODO: revisit once supabase-js type inference is fixed upstream, or
  // once types are regenerated via `supabase gen types`.
  const { data, error } = await (supabase.from("addresses") as any)
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as Address;
}

export async function getAddresses(): Promise<Address[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("customer_id", user.id)
    .order("is_default", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Address[];
}