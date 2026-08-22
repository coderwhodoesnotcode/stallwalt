"use client";
// app/checkout/page.tsx
import { useEffect, useState, useTransition } from "react";
import { getAddresses, createAddress, type Address } from "@/lib/actions/addresses";
import { placeOrder } from "@/lib/actions/checkout";
import { getCartWithItems } from "@/lib/actions/cart";

function formatPrice(amount: number, currency = "PKR") {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CheckoutPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [cart, setCart] = useState<Awaited<ReturnType<typeof getCartWithItems>>>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "stripe">("cod");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "PK",
    contact_email: "",
  });

  async function loadData() {
    const [addr, cartData] = await Promise.all([getAddresses(), getCartWithItems()]);
    setAddresses(addr);
    setCart(cartData);
    if (addr.length > 0) setSelectedAddressId(addr[0].id);
    else setShowNewAddressForm(true);
  }

  useEffect(() => {
    loadData();
  }, []);

  const subtotal =
    cart?.items.reduce((sum: number, item: any) => {
      const price = item.variant?.price ?? item.product?.price ?? 0;
      return sum + price * item.quantity;
    }, 0) ?? 0;

  function handleSaveAddress() {
    setError(null);
    startTransition(async () => {
      try {
        const created = await createAddress({
          full_name: form.full_name,
          phone: form.phone || undefined,
          address_line1: form.address_line1,
          address_line2: form.address_line2 || undefined,
          city: form.city,
          state: form.state || undefined,
          postal_code: form.postal_code,
          country: form.country,
        });
        setAddresses((prev) => [created, ...prev]);
        setSelectedAddressId(created.id);
        setShowNewAddressForm(false);
      } catch (e: any) {
        setError(e?.message ?? "Could not save address");
      }
    });
  }

  function handlePlaceOrder() {
    setError(null);
    if (!selectedAddressId) {
      setError("Add a shipping address first");
      return;
    }
    if (!form.contact_email) {
      setError("Enter a contact email");
      return;
    }
    startTransition(async () => {
      try {
        await placeOrder({
          shippingAddressId: selectedAddressId,
          billingAddressId: selectedAddressId,
          contactEmail: form.contact_email,
          contactPhone: form.phone || undefined,
          paymentMethod,
        });
        // placeOrder redirects on success
      } catch (e: any) {
        setError(e?.message ?? "Could not place order");
      }
    });
  }

  if (!cart) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <p className="text-sm text-[var(--text-soft)]">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <h1 className="font-display text-2xl font-semibold">Checkout</h1>

      {/* Contact email */}
      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-medium">Contact</h2>
        <input
          type="email"
          placeholder="Email for order updates"
          value={form.contact_email}
          onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
          className="w-full rounded-xl border px-4 py-2.5 text-sm"
          style={{ borderColor: "var(--border)" }}
        />
      </section>

      {/* Address selection */}
      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-medium">Shipping address</h2>

        {addresses.length > 0 && !showNewAddressForm && (
          <div className="flex flex-col gap-2">
            {addresses.map((addr) => (
              <label
                key={addr.id}
                className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm"
                style={{
                  borderColor:
                    selectedAddressId === addr.id ? "var(--accent)" : "var(--border)",
                }}
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddressId === addr.id}
                  onChange={() => setSelectedAddressId(addr.id)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium">{addr.full_name}</p>
                  <p className="text-[var(--text-soft)]">
                    {addr.address_line1}, {addr.city}, {addr.postal_code}
                  </p>
                </div>
              </label>
            ))}
            <button
              type="button"
              onClick={() => setShowNewAddressForm(true)}
              className="mt-1 self-start text-sm font-medium text-[var(--accent)] hover:underline"
            >
              + Add a new address
            </button>
          </div>
        )}

        {showNewAddressForm && (
          <div className="flex flex-col gap-3">
            <input
              placeholder="Full name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="rounded-xl border px-4 py-2.5 text-sm"
              style={{ borderColor: "var(--border)" }}
            />
            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="rounded-xl border px-4 py-2.5 text-sm"
              style={{ borderColor: "var(--border)" }}
            />
            <input
              placeholder="Address line 1"
              value={form.address_line1}
              onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
              className="rounded-xl border px-4 py-2.5 text-sm"
              style={{ borderColor: "var(--border)" }}
            />
            <input
              placeholder="Address line 2 (optional)"
              value={form.address_line2}
              onChange={(e) => setForm({ ...form, address_line2: e.target.value })}
              className="rounded-xl border px-4 py-2.5 text-sm"
              style={{ borderColor: "var(--border)" }}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="rounded-xl border px-4 py-2.5 text-sm"
                style={{ borderColor: "var(--border)" }}
              />
              <input
                placeholder="Postal code"
                value={form.postal_code}
                onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                className="rounded-xl border px-4 py-2.5 text-sm"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
            <button
              type="button"
              onClick={handleSaveAddress}
              disabled={isPending}
              className="self-start rounded-full px-5 py-2 text-sm font-semibold"
              style={{ background: "var(--text)", color: "var(--bg)" }}
            >
              Save address
            </button>
          </div>
        )}
      </section>

      {/* Payment method */}
      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-medium">Payment</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPaymentMethod("cod")}
            className="rounded-full border px-4 py-1.5 text-sm"
            style={{
              borderColor: "var(--border)",
              background: paymentMethod === "cod" ? "var(--text)" : "transparent",
              color: paymentMethod === "cod" ? "var(--bg)" : "var(--text)",
            }}
          >
            Cash on delivery
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("stripe")}
            className="rounded-full border px-4 py-1.5 text-sm"
            style={{
              borderColor: "var(--border)",
              background: paymentMethod === "stripe" ? "var(--text)" : "transparent",
              color: paymentMethod === "stripe" ? "var(--bg)" : "var(--text)",
            }}
          >
            Card
          </button>
        </div>
      </section>

      {/* Summary */}
      <section className="mt-8 rounded-2xl border p-5" style={{ borderColor: "var(--border)" }}>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-soft)]">Subtotal</span>
          <span className="font-utility">{formatPrice(subtotal)}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm">
          <span className="text-[var(--text-soft)]">Shipping</span>
          <span className="font-utility">Calculated at order</span>
        </div>
      </section>

      {error && (
        <p className="mt-4 text-sm" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handlePlaceOrder}
        disabled={isPending}
        className="mt-6 w-full rounded-full py-3.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        style={{ background: "var(--accent)", color: "var(--accent-contrast)" }}
      >
        {isPending ? "Placing order…" : "Place order"}
      </button>
    </main>
  );
}