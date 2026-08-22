// lib/data/products.ts
// Server-side data fetching helpers — call these from Server Components.
import { createClient } from "@/lib/supabase/server";
import type { Category, ProductCatalogRow, ProductVariant } from "@/types/database.types";

export async function getProducts(options?: {
  categorySlug?: string;
  featuredOnly?: boolean;
  search?: string;
  limit?: number;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("product_catalog")
    .select("*")
    .order("created_at", { ascending: false });

  if (options?.categorySlug) {
    query = query.eq("category_slug", options.categorySlug);
  }
  if (options?.featuredOnly) {
    query = query.eq("is_featured", true);
  }
  if (options?.search) {
    query = query.textSearch("search_vector", options.search);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as ProductCatalogRow[];
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("product_catalog")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw error;

  let variants: ProductVariant[] = [];
  if (product.has_variants) {
    const { data, error: variantError } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", product.id)
      .order("position");
    if (variantError) throw variantError;
    variants = data;
  }

  return { product: product as ProductCatalogRow, variants };
}

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("position");
  if (error) throw error;
  return data as Category[];
}