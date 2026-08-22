"use server";
// lib/actions/addresses.ts
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

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

  // TEMPORARY: explicit cast works around an insert() overload resolution
  // issue with the hand-authored Database type. Remove this cast once
  // types/database.types.ts is regenerated via `supabase gen types`.
  const payload = {
    ...input,
    customer_id: user.id,
    type: "shipping",
  } as Database["public"]["Tables"]["addresses"]["Insert"];

  const { data, error } = await supabase
    .from("addresses")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as Address;
}
//testing

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