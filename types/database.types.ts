// ============================================================================
// Hand-authored types matching 01_schema.sql.
// Once your schema is live, prefer generating this automatically with:
//   npx supabase gen types typescript --project-id <your-project-id> > types/database.types.ts
// ============================================================================

export type ProductStatus = "draft" | "active" | "archived";
export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "partially_refunded";
export type AddressType = "shipping" | "billing";
export type DiscountType = "percentage" | "fixed_amount";

export interface ProductImage {
  url: string;
  alt?: string;
  position?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  position: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;

  sku: string | null;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;

  track_inventory: boolean;
  stock_quantity: number;
  allow_backorder: boolean;

  has_variants: boolean;

  weight_grams: number | null;
  status: ProductStatus;
  is_featured: boolean;

  images: ProductImage[];
  attributes: Record<string, string>;
  seo_title: string | null;
  seo_description: string | null;

  avg_rating: number;
  review_count: number;

  created_at: string;
  updated_at: string;
}

// Row shape returned by the `product_catalog` view (products + category + in_stock)
export interface ProductCatalogRow extends Product {
  category_name: string | null;
  category_slug: string | null;
  in_stock: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string | null;
  name: string;
  options: Record<string, string>; // e.g. { Color: "Red", Size: "M" }
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  image_url: string | null;
  position: number;
  created_at: string;
}

export interface Customer {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  customer_id: string;
  type: AddressType;
  full_name: string;
  phone: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string | null;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export interface Cart {
  id: string;
  customer_id: string | null;
  session_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  created_at: string;
}

// Convenience shape for the frontend cart page (joined data)
export interface CartItemWithProduct extends CartItem {
  product: Pick<Product, "id" | "name" | "slug" | "price" | "images">;
  variant: Pick<ProductVariant, "id" | "name" | "price" | "image_url"> | null;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;

  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string | null;

  shipping_address_id: string | null;
  billing_address_id: string | null;
  shipping_address: Address | null;
  billing_address: Address | null;

  contact_email: string;
  contact_phone: string | null;

  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  currency: string;

  coupon_id: string | null;
  customer_note: string | null;
  admin_note: string | null;

  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;

  product_name: string;
  variant_name: string | null;
  sku: string | null;
  image_url: string | null;

  unit_price: number;
  quantity: number;
  subtotal: number;

  created_at: string;
}

export interface OrderStatusHistoryRow {
  id: string;
  order_id: string;
  status: OrderStatus;
  note: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  provider: string;
  provider_payment_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  raw_response: Record<string, unknown> | null;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  customer_id: string;
  order_item_id: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified_purchase: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount: number;
  usage_limit: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

// ----------------------------------------------------------------------------
// Minimal Database interface for the supabase-js client generic.
// Extend this with the full generated types when you run `supabase gen types`.
//
// NOTE: `Relationships: []` is required on every Table/View entry — the
// Supabase client's internal generic types (GenericTable / GenericView)
// require this field to correctly resolve .insert()/.update() overloads.
// Without it, TypeScript silently falls back to `never` on those calls
// even though .select() still appears to work fine.
// ----------------------------------------------------------------------------
export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Partial<Product>;
        Update: Partial<Product>;
        Relationships: [];
      };
      product_variants: {
        Row: ProductVariant;
        Insert: Partial<ProductVariant>;
        Update: Partial<ProductVariant>;
        Relationships: [];
      };
      categories: {
        Row: Category;
        Insert: Partial<Category>;
        Update: Partial<Category>;
        Relationships: [];
      };
      customers: {
        Row: Customer;
        Insert: Partial<Customer>;
        Update: Partial<Customer>;
        Relationships: [];
      };
      addresses: {
        Row: Address;
        Insert: Partial<Address>;
        Update: Partial<Address>;
        Relationships: [];
      };
      carts: {
        Row: Cart;
        Insert: Partial<Cart>;
        Update: Partial<Cart>;
        Relationships: [];
      };
      cart_items: {
        Row: CartItem;
        Insert: Partial<CartItem>;
        Update: Partial<CartItem>;
        Relationships: [];
      };
      orders: {
        Row: Order;
        Insert: Partial<Order>;
        Update: Partial<Order>;
        Relationships: [];
      };
      order_items: {
        Row: OrderItem;
        Insert: Partial<OrderItem>;
        Update: Partial<OrderItem>;
        Relationships: [];
      };
      payments: {
        Row: Payment;
        Insert: Partial<Payment>;
        Update: Partial<Payment>;
        Relationships: [];
      };
      reviews: {
        Row: Review;
        Insert: Partial<Review>;
        Update: Partial<Review>;
        Relationships: [];
      };
      coupons: {
        Row: Coupon;
        Insert: Partial<Coupon>;
        Update: Partial<Coupon>;
        Relationships: [];
      };
    };
    Views: {
      product_catalog: {
        Row: ProductCatalogRow;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}