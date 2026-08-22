"use server";
// lib/actions/checkout.ts
//
// Runs entirely server-side. Uses the ADMIN client (service_role) because:
//   1. It needs to read current prices/stock authoritatively (never trust
//      prices sent from the client).
//   2. Inserting order_items triggers the `deduct_stock_on_order_item`
//      trigger in Postgres, which needs to bypass RLS to update products.
//
// Flow: validate cart -> recompute totals server-side -> create order
// (status 'pending') -> create order_items (stock deducted automatically
// by DB trigger) -> clear cart -> return order for redirect to payment.

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

interface CheckoutInput {
  shippingAddressId: string;
  billingAddressId: string;
  contactEmail: string;
  contactPhone?: string;
  paymentMethod: "cod" | "stripe";
  couponCode?: string;
  customerNote?: string;
}

const SHIPPING_FLAT_RATE = 250; // PKR — replace with real shipping calc
const TAX_RATE = 0; // set if applicable

export async function placeOrder(input: CheckoutInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in to check out");

  const admin = createAdminClient();

  // 1. Load the cart + items with authoritative current prices/stock
  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("customer_id", user.id)
    .single();
  if (!cart) throw new Error("Cart not found");

  const { data: items, error: itemsError } = await admin
    .from("cart_items")
    .select(
      `id, quantity, product_id, variant_id,
       product:products ( id, name, price, stock_quantity, has_variants, track_inventory, allow_backorder, images ),
       variant:product_variants ( id, name, price, stock_quantity )`
    )
    .eq("cart_id", cart.id);

  if (itemsError) throw itemsError;
  if (!items || items.length === 0) throw new Error("Cart is empty");

  // 2. Validate stock + compute line totals from DB prices (never trust client)
  let subtotal = 0;
  const lineItems = items.map((item: any) => {
    const source = item.variant ?? item.product;
    const availableStock = item.variant
      ? item.variant.stock_quantity
      : item.product.stock_quantity;
    const trackInventory = item.variant ? true : item.product.track_inventory;
    const allowBackorder = item.product.allow_backorder;

    if (trackInventory && availableStock < item.quantity && !allowBackorder) {
      throw new Error(`"${item.product.name}" only has ${availableStock} left in stock`);
    }

    const unitPrice = Number(source.price);
    const lineSubtotal = unitPrice * item.quantity;
    subtotal += lineSubtotal;

    return {
      product_id: item.product.id,
      variant_id: item.variant?.id ?? null,
      product_name: item.product.name,
      variant_name: item.variant?.name ?? null,
      image_url: item.product.images?.[0]?.url ?? null,
      unit_price: unitPrice,
      quantity: item.quantity,
      subtotal: lineSubtotal,
    };
  });

  // 3. Apply coupon (validated via the SECURITY DEFINER function so we
  // don't need a public read policy on the coupons table)
  let discountAmount = 0;
  let couponId: string | null = null;
  if (input.couponCode) {
    const { data: result, error: couponError } = await admin.rpc("validate_coupon", {
      coupon_code: input.couponCode,
      order_amount: subtotal,
    });
    if (couponError) throw couponError;
    const validation = result?.[0];
    if (!validation?.valid) {
      throw new Error(validation?.message ?? "Invalid coupon");
    }
    discountAmount =
      validation.discount_type === "percentage"
        ? subtotal * (Number(validation.discount_value) / 100)
        : Number(validation.discount_value);

    const { data: couponRow } = await admin
      .from("coupons")
      .select("id")
      .eq("code", input.couponCode)
      .single();
    couponId = couponRow?.id ?? null;
  }

  const taxAmount = subtotal * TAX_RATE;
  const shippingCost = SHIPPING_FLAT_RATE;
  const total = subtotal + shippingCost + taxAmount - discountAmount;

  // 4. Snapshot the chosen addresses
  const { data: shippingAddress } = await admin
    .from("addresses")
    .select("*")
    .eq("id", input.shippingAddressId)
    .single();
  const { data: billingAddress } = await admin
    .from("addresses")
    .select("*")
    .eq("id", input.billingAddressId)
    .single();

  // 5. Create the order
  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      customer_id: user.id,
      status: "pending",
      payment_status: "pending",
      payment_method: input.paymentMethod,
      shipping_address_id: input.shippingAddressId,
      billing_address_id: input.billingAddressId,
      shipping_address: shippingAddress,
      billing_address: billingAddress,
      contact_email: input.contactEmail,
      contact_phone: input.contactPhone ?? null,
      subtotal,
      shipping_cost: shippingCost,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      total,
      coupon_id: couponId,
      customer_note: input.customerNote ?? null,
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // 6. Insert order items — the DB trigger `deduct_stock_on_order_item`
  // automatically decrements product/variant stock for each row inserted.
  const { error: lineItemsError } = await admin
    .from("order_items")
    .insert(lineItems.map((li) => ({ ...li, order_id: order.id })));

  if (lineItemsError) throw lineItemsError;

  // 7. Bump coupon usage count
  if (couponId) {
    await admin
      .from("coupons")
      .update({
        used_count:
          (await admin.from("coupons").select("used_count").eq("id", couponId).single())
            .data!.used_count + 1,
      })
      .eq("id", couponId);
  }

  // 8. Clear the cart
  await admin.from("cart_items").delete().eq("cart_id", cart.id);

  // 9. Branch on payment method
  if (input.paymentMethod === "cod") {
    // Cash on delivery: mark straight to processing
    await admin.from("orders").update({ status: "processing" }).eq("id", order.id);
    redirect(`/orders/${order.id}/confirmation`);
  }

  // For card payments, redirect to your payment route which creates a
  // Stripe Checkout Session (or similar) referencing order.id, then a
  // webhook flips payment_status to 'paid' and status to 'processing'.
  redirect(`/checkout/pay?orderId=${order.id}`);
}