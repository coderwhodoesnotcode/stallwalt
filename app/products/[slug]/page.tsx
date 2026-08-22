// app/products/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/data/products";
import { AddToCartForm } from "../../components/AddToCartForm";
import { ProductGallery } from "../../components/ProductGallery";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product, variants;
  try {
    ({ product, variants } = await getProductBySlug(slug));
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <div className="grid gap-10 sm:grid-cols-2">
        {/* Image carousel */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Details */}
        <div>
          {product.category_name && (
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--text-soft)]">
              {product.category_name}
            </p>
          )}
          <h1 className="font-display text-3xl font-semibold">{product.name}</h1>

          {product.review_count > 0 && (
            <p className="mt-2 text-sm text-[var(--text-soft)]">
              ★ {product.avg_rating} ({product.review_count} review
              {product.review_count === 1 ? "" : "s"})
            </p>
          )}

          <div className="my-6 h-px" style={{ background: "var(--border)" }} />

          <AddToCartForm
            productId={product.id}
            basePrice={product.price}
            variants={variants}
            stockQuantity={product.stock_quantity}
            trackInventory={product.track_inventory}
            allowBackorder={product.allow_backorder}
          />

          {product.description && (
            <div className="mt-10">
              <h2 className="mb-2 font-display text-lg font-medium">
                Description
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--text-soft)]">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}