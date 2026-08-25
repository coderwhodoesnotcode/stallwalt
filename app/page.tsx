// app/page.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProducts, getCategories } from "@/lib/data/products";
import { ProductCard } from "./components/ProductCard";
import { CategoryTile } from "./components/CategoryTile";
import Hero from "./components/Hero";

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    getProducts({ featuredOnly: true, limit: 8 }),
    getCategories(),
  ]);

  const isEmpty = featured.length === 0 && categories.length === 0;

  return (
    <>
      <Hero />

      <main className="mx-auto max-w-6xl px-5 sm:px-8">
        {isEmpty && (
          <section
            className="my-8 flex flex-col items-start gap-2 rounded-2xl border border-dashed p-10"
            style={{ borderColor: "var(--border)" }}
          >
            <p className="font-display text-lg font-medium">Catalogue is empty</p>
            <p className="max-w-md text-sm text-[var(--text-soft)]">
              Add a category and a few products in Supabase — set{" "}
              <code className="font-utility text-xs">status = &apos;active&apos;</code>{" "}
              and{" "}
              <code className="font-utility text-xs">is_featured = true</code> —
              then refresh this page.
            </p>
          </section>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <section className="py-10">
            <h2 className="mb-5 font-display text-2xl font-semibold">
              Shop by category
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {categories.slice(0, 8).map((category, index) => (
                <CategoryTile key={category.id} category={category} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* Featured products */}
        {featured.length > 0 && (
          <section className="py-10 pb-24">
            <div className="mb-5 flex items-baseline justify-between">
              <h2 className="font-display text-2xl font-semibold">
                Featured items
              </h2>
              <Link
                href="/products"
                className="text-sm font-medium text-[var(--accent)] hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featured.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}