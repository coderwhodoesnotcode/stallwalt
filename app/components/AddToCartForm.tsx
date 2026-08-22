"use client";
// components/AddToCartForm.tsx
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/actions/cart";
import type { ProductVariant } from "@/types/database.types";

function formatPrice(amount: number, currency = "PKR") {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function AddToCartForm({
  productId,
  basePrice,
  variants,
  stockQuantity,
  trackInventory,
  allowBackorder,
}: {
  productId: string;
  basePrice: number;
  variants: ProductVariant[];
  stockQuantity: number;
  trackInventory: boolean;
  allowBackorder: boolean;
}) {
  const router = useRouter();
  const [selectedVariantId, setSelectedVariantId] = useState(
    variants[0]?.id ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const availableStock = selectedVariant
    ? selectedVariant.stock_quantity
    : stockQuantity;
  const inStock = !trackInventory || availableStock > 0 || allowBackorder;
  const price = selectedVariant?.price ?? basePrice;

  function handleAdd() {
    setError(null);
    setAdded(false);
    startTransition(async () => {
      try {
        await addToCart(productId, quantity, selectedVariant?.id);
        setAdded(true);
        router.refresh();
      } catch (e: any) {
        if (e?.message === "Must be logged in to use the cart") {
          router.push("/login?redirect=/products");
          return;
        }
        setError(e?.message ?? "Something went wrong");
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="font-utility text-2xl font-semibold">
        {formatPrice(price)}
      </p>

      {variants.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Size / option</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariantId(v.id)}
                disabled={v.stock_quantity <= 0 && !allowBackorder}
                className="rounded-full border px-4 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  borderColor: "var(--border)",
                  background:
                    selectedVariantId === v.id ? "var(--text)" : "transparent",
                  color: selectedVariantId === v.id ? "var(--bg)" : "var(--text)",
                }}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <p className="text-sm font-medium">Quantity</p>
        <div
          className="flex items-center rounded-full border"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-9 w-9 text-lg"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-8 text-center font-utility text-sm">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="h-9 w-9 text-lg"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!inStock || isPending}
        className="w-full rounded-full py-3.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ background: "var(--text)", color: "var(--bg)" }}
      >
        {!inStock
          ? "Out of stock"
          : isPending
          ? "Adding…"
          : added
          ? "Added to cart ✓"
          : "Add to cart"}
      </button>

      {error && (
        <p className="text-sm" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}