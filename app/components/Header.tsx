// components/Header.tsx
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { getCartWithItems } from "@/lib/actions/cart";

export async function Header() {
  let itemCount = 0;
  try {
    const cart = await getCartWithItems();
    itemCount =
      cart?.items.reduce((sum, item: any) => sum + item.quantity, 0) ?? 0;
  } catch {
    // not logged in — show an empty cart badge
  }

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur"
      style={{ background: "color-mix(in srgb, var(--bg) 85%, transparent)", borderColor: "var(--border)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          STALLWALT
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          <Link href="/products" className="text-sm text-[var(--text-soft)] transition-colors hover:text-[var(--text)]">
            Shop
          </Link>
          <Link href="/orders" className="text-sm text-[var(--text-soft)] transition-colors hover:text-[var(--text)]">
            Orders
          </Link>
        </nav>

        <Link
          href="/cart"
          className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[var(--bg-subtle)]"
          aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
        >
          <ShoppingBag size={20} strokeWidth={1.75} />
          {itemCount > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1 font-utility text-[10px] font-semibold"
              style={{ background: "var(--accent)", color: "var(--accent-contrast)" }}
            >
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}