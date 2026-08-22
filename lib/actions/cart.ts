"use server";
// lib/actions/cart.ts
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Gets (or creates) the current user's cart. Assumes the user is logged in;
// for guest carts, generate a UUID session_id, store it in a cookie, and
// pass it through instead of relying on auth.uid().
async function getOrCreateCart() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Must be logged in to use the cart");

  const { data: existing } = await supabase
    .from("carts")
    .select("id")
    .eq("customer_id", user.id)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("carts")
    .insert({ customer_id: user.id })
    .select("id")
    .single();

  if (error) throw error;
  return created.id;
}

export async function addToCart(
  productId: string,
  quantity: number,
  variantId?: string
) {
  const supabase = await createClient();
  const cartId = await getOrCreateCart();

  // upsert: if the same product/variant is already in the cart, bump the qty.
  // IMPORTANT: PostgREST's .eq(col, null) does NOT match NULL rows — you
  // must use .is(col, null) for that. Using .eq() here meant products
  // without a variant (variant_id = NULL) never matched an existing row,
  // so every re-add created a duplicate cart_items row instead of bumping
  // the quantity (Postgres also doesn't treat NULL = NULL as a conflict
  // for the unique constraint, so the duplicate insert succeeded silently).
  let existingQuery = supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("product_id", productId);

  existingQuery = variantId
    ? existingQuery.eq("variant_id", variantId)
    : existingQuery.is("variant_id", null);

  const { data: existing } = await existingQuery.maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("cart_items").insert({
      cart_id: cartId,
      product_id: productId,
      variant_id: variantId ?? null,
      quantity,
    });
    if (error) throw error;
  }

  revalidatePath("/cart");
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const supabase = await createClient();

  if (quantity <= 0) {
    const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", itemId);
    if (error) throw error;
  }

  revalidatePath("/cart");
}

export async function removeFromCart(itemId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
  if (error) throw error;
  revalidatePath("/cart");
}

export async function getCartWithItems() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("customer_id", user.id)
    .maybeSingle();

  if (!cart) return { id: null, items: [] };

  const { data: items, error } = await supabase
    .from("cart_items")
    .select(
      `id, quantity, product_id, variant_id,
       product:products ( id, name, slug, price, images, stock_quantity, has_variants ),
       variant:product_variants ( id, name, price, image_url, stock_quantity )`
    )
    .eq("cart_id", cart.id);

  if (error) throw error;
  return { id: cart.id, items: items ?? [] };
}