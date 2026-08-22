// app/orders/page.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total: number;
  currency?: string;
  [key: string]: unknown;
}

function formatPrice(amount: number, currency = "PKR") {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/orders");
  }

  const { data: orders, error } = (await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })) as { data: Order[] | null; error: any };

  if (error) throw error;

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <h1 className="font-display text-2xl font-semibold">Your orders</h1>

      {!orders || orders.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-sm text-[var(--text-soft)]">
            You haven&apos;t placed any orders yet.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-block rounded-full px-6 py-3 text-sm font-semibold"
            style={{ background: "var(--text)", color: "var(--bg)" }}
          >
            Shop the catalogue
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}/confirmation`}
              className="flex items-center justify-between rounded-2xl border p-5 transition-shadow hover:shadow-md"
              style={{ borderColor: "var(--border)" }}
            >
              <div>
                <p className="font-utility text-sm font-semibold">
                  {order.order_number}
                </p>
                <p className="mt-1 text-xs text-[var(--text-soft)]">
                  {formatDate(order.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                >
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
                <span className="font-utility text-sm font-semibold">
                  {formatPrice(order.total, order.currency)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}