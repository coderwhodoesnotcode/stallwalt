// components/Footer.tsx
export function Footer() {
  return (
    <footer className="mt-24 border-t" style={{ borderColor: "var(--border)" }}>
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-5 py-10 text-sm text-[var(--text-soft)] sm:flex-row sm:items-center sm:px-8">
        <p>© {new Date().getFullYear()} Store. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="/products" className="hover:text-[var(--text)]">Shop</a>
          <a href="/cart" className="hover:text-[var(--text)]">Cart</a>
        </div>
      </div>
    </footer>
  );
}