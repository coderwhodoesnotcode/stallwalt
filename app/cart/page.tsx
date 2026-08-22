"use client";
// app/cart/page.tsx
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getCartWithItems,
  updateCartItemQuantity,
  removeFromCart,
} from "@/lib/actions/cart";

function formatPrice(amount: number, currency = "PKR") {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CartPage() {
  const [cart, setCart] = useState<Awaited<ReturnType<typeof getCartWithItems>>>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  async function refresh() {
    const data = await getCartWithItems();
    setCart(data);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <p className="text-sm text-[var(--text-soft)]">Loading cart…</p>
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <h1 className="font-display text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-[var(--text-soft)]">
          Browse the catalogue and add something you like.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full px-6 py-3 text-sm font-semibold"
          style={{ background: "var(--text)", color: "var(--bg)" }}
        >
          Shop the catalogue
        </Link>
      </main>
    );
  }

  const subtotal = cart.items.reduce((sum: number, item: any) => {
    const price = item.variant?.price ?? item.product?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <h1 className="font-display text-2xl font-semibold">Your cart</h1>

      <div className="mt-6 flex flex-col divide-y" style={{ borderColor: "var(--border)" }}>
        {cart.items.map((item: any) => {
          const product = item.product;
          const variant = item.variant;
          const price = variant?.price ?? product?.price ?? 0;
          const image = variant?.image_url ?? product?.images?.[0]?.url;

          return (
            <div key={item.id} className="flex gap-4 py-5" style={{ borderColor: "var(--border)" }}>
              <div
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl"
                style={{ background: "var(--bg-subtle)" }}
              >
                {image && (
                  <Image src={image} alt={product?.name ?? ""} fill className="object-cover" />
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-display text-sm font-medium">{product?.name}</p>
                    {variant && (
                      <p className="text-xs text-[var(--text-soft)]">{variant.name}</p>
                    )}
                  </div>
                  <p className="font-utility text-sm font-semibold">
                    {formatPrice(price * item.quantity)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center rounded-full border"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <button
                      onClick={() =>
                        startTransition(async () => {
                          await updateCartItemQuantity(item.id, item.quantity - 1);
                          await refresh();
                        })
                      }
                      className="h-8 w-8 text-base"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-utility text-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        startTransition(async () => {
                          await updateCartItemQuantity(item.id, item.quantity + 1);
                          await refresh();
                        })
                      }
                      className="h-8 w-8 text-base"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      startTransition(async () => {
                        await removeFromCart(item.id);
                        await refresh();
                      })
                    }
                    className="text-xs text-[var(--text-soft)] underline-offset-2 hover:underline"
                    disabled={isPending}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between border-t pt-6" style={{ borderColor: "var(--border)" }}>
        <span className="text-sm text-[var(--text-soft)]">Subtotal</span>
        <span className="font-utility text-lg font-semibold">{formatPrice(subtotal)}</span>
      </div>

      <Link
        href="/checkout"
        className="mt-6 block rounded-full py-3.5 text-center text-sm font-semibold transition-transform hover:-translate-y-0.5"
        style={{ background: "var(--text)", color: "var(--bg)" }}
      >
        Proceed to checkout
      </Link>
    </main>
  );
}