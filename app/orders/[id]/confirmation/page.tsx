// app/orders/[id]/confirmation/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface Order {
  id: string;
  order_number: string;
  contact_email: string;
  total: number;
  [key: string]: unknown;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  variant_name?: string | null;
  quantity: number;
  subtotal: number;
  [key: string]: unknown;
}

function formatPrice(amount: number, currency = "PKR") {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = (await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single()) as { data: Order | null };
  if (!order) notFound();

  const { data: items } = (await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id)) as { data: OrderItem[] | null };

  return (
    <main className="mx-auto max-w-2xl px-5 py-16 text-center sm:px-8">
      <span
        className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl"
        style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
      >
        ✓
      </span>
      <h1 className="font-display text-2xl font-semibold">Order placed</h1>
      <p className="mt-2 text-sm text-[var(--text-soft)]">
        Order <span className="font-utility">{order.order_number}</span> is
        confirmed. We&apos;ve sent details to {order.contact_email}.
      </p>

      <div
        className="mt-8 rounded-2xl border p-5 text-left"
        style={{ borderColor: "var(--border)" }}
      >
        {items?.map((item) => (
          <div key={item.id} className="flex justify-between py-2 text-sm">
            <span>
              {item.product_name}
              {item.variant_name ? ` — ${item.variant_name}` : ""} × {item.quantity}
            </span>
            <span className="font-utility">{formatPrice(item.subtotal)}</span>
          </div>
        ))}
        <div
          className="mt-3 flex justify-between border-t pt-3 text-sm font-semibold"
          style={{ borderColor: "var(--border)" }}
        >
          <span>Total</span>
          <span className="font-utility">{formatPrice(order.total)}</span>
        </div>
      </div>

      <Link
        href="/products"
        className="mt-8 inline-block rounded-full px-6 py-3 text-sm font-semibold"
        style={{ background: "var(--text)", color: "var(--bg)" }}
      >
        Continue shopping
      </Link>
    </main>
  );
}