// app/products/page.tsx
import { getProducts, getCategories } from "@/lib/data/products";
import { ProductCard } from "../components/ProductCard";
import Link from "next/link";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts({ categorySlug: category }),
    getCategories(),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <h1 className="font-display text-3xl font-semibold">
        {category
          ? categories.find((c) => c.slug === category)?.name ?? "Shop"
          : "All products"}
      </h1>

      {/* Category filter pills */}
      {categories.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/products"
            className="rounded-full border px-4 py-1.5 text-sm transition-colors"
            style={{
              borderColor: "var(--border)",
              background: !category ? "var(--text)" : "transparent",
              color: !category ? "var(--bg)" : "var(--text)",
            }}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className="rounded-full border px-4 py-1.5 text-sm transition-colors"
              style={{
                borderColor: "var(--border)",
                background: category === c.slug ? "var(--text)" : "transparent",
                color: category === c.slug ? "var(--bg)" : "var(--text)",
              }}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <p className="mt-16 text-sm text-[var(--text-soft)]">
          No products found{category ? " in this category" : ""}.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </main>
  );
}