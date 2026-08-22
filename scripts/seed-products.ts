// scripts/seed-products.ts
// Run with: npx tsx scripts/seed-products.ts
// Requires SUPABASE_SERVICE_ROLE_KEY in your environment (never expose this
// key to the browser — it bypasses RLS).

// import "dotenv/config"; // loads .env (rename .env.local to .env, or pass path below)
// If you want to keep the filename .env.local, use this instead:
import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.types";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seed() {
  // 1. Create a category
  const { data: category, error: catError } = await supabase
    .from("categories")
    .insert({ name: "Sneakers", slug: "sneakers" })
    .select()
    .single();
  if (catError) throw catError;

  // 2. Create a simple product (no variants)
  const { error: p1Error } = await supabase.from("products").insert({
    name: "Classic Runner",
    slug: "classic-runner",
    description: "A lightweight everyday running shoe.",
    category_id: category.id,
    price: 6999,
    compare_at_price: 8999,
    sku: "RUN-001",
    stock_quantity: 40,
    status: "active",
    is_featured: true,
    images: [{ url: "https://example.com/runner.jpg", alt: "Classic Runner", position: 0 }],
  });
  if (p1Error) throw p1Error;

  // 3. Create a product WITH variants (e.g. sizes)
  const { data: product2, error: p2Error } = await supabase
    .from("products")
    .insert({
      name: "Court Classic",
      slug: "court-classic",
      description: "Retro-inspired court sneaker.",
      category_id: category.id,
      price: 7999, // base display price
      sku: "COURT-001",
      has_variants: true,
      status: "active",
      images: [{ url: "https://example.com/court.jpg", alt: "Court Classic", position: 0 }],
    })
    .select()
    .single();
  if (p2Error) throw p2Error;

  const sizes = ["EU 40", "EU 41", "EU 42", "EU 43", "EU 44"];
  const { error: variantError } = await supabase.from("product_variants").insert(
    sizes.map((size, i) => ({
      product_id: product2.id,
      sku: `COURT-001-${size.replace(/\s/g, "")}`,
      name: size,
      options: { Size: size },
      price: 7999,
      stock_quantity: 15,
      position: i,
    }))
  );
  if (variantError) throw variantError;

  console.log("Seed complete ✅");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});