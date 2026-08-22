// components/ProductCard.tsx
import Link from "next/link";
import Image from "next/image";
import type { ProductCatalogRow } from "@/types/database.types";

function formatPrice(amount: number, currency = "PKR") {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProductCard({
  product,
  index,
}: {
  product: ProductCatalogRow;
  index: number;
}) {
  const image = product.images?.[0];
  const onSale =
    product.compare_at_price && product.compare_at_price > product.price;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block border-t"
      style={{ borderColor: "var(--hairline)" }}
    >
      <div className="flex items-baseline justify-between py-2">
        <span
          className="font-utility text-[11px] tracking-wider"
          style={{ color: "var(--ink-soft)" }}
        >
          ITEM {String(index + 1).padStart(3, "0")}
        </span>
        {!product.in_stock && (
          <span
            className="font-utility text-[11px] tracking-wider"
            style={{ color: "var(--rust)" }}
          >
            SOLD OUT
          </span>
        )}
      </div>

      <div
        className="relative aspect-[4/5] overflow-hidden"
        style={{ background: "var(--paper-raised)" }}
      >
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="flex h-full items-center justify-center font-utility text-xs"
            style={{ color: "var(--ink-soft)" }}
          >
            NO IMAGE
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-3 py-3">
        <div>
          <h3 className="font-display text-[17px] leading-snug">
            {product.name}
          </h3>
          {product.category_name && (
            <p
              className="font-utility text-[11px] mt-0.5"
              style={{ color: "var(--ink-soft)" }}
            >
              {product.category_name.toUpperCase()}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="font-utility text-sm">{formatPrice(product.price)}</p>
          {onSale && (
            <p
              className="font-utility text-xs line-through"
              style={{ color: "var(--ink-soft)" }}
            >
              {formatPrice(product.compare_at_price!)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}