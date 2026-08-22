// components/CategoryTile.tsx
import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types/database.types";

export function CategoryTile({
  category,
  index,
}: {
  category: Category;
  index: number;
}) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden p-5"
      style={{ background: "var(--paper-raised)" }}
    >
      {category.image_url && (
        <Image
          src={category.image_url}
          alt={category.name}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover opacity-90 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0) 55%)",
        }}
      />
      <div className="relative">
        <span className="font-utility text-[11px] tracking-wider text-white/70">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="font-display text-xl text-white">{category.name}</h3>
      </div>
    </Link>
  );
}