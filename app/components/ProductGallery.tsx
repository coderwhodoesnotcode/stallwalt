"use client";
// components/ProductGallery.tsx
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductImage } from "@/types/database.types";

const AUTO_ADVANCE_MS = 4500;

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const sorted = [...images].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const [index, setIndex] = useState(0);

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % sorted.length) + sorted.length) % sorted.length);
    },
    [sorted.length]
  );

  // Auto-advance to the next image. Restarts whenever `index` changes, so a
  // manual click/tap resets the timer instead of jumping right after.
  useEffect(() => {
    if (sorted.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % sorted.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [sorted.length, index]);

  if (sorted.length === 0) {
    return (
      <div
        className="relative aspect-square overflow-hidden rounded-2xl"
        style={{ background: "var(--bg-subtle)" }}
      >
        <div className="flex h-full items-center justify-center text-sm text-[var(--text-soft)]">
          No image
        </div>
      </div>
    );
  }

  const current = sorted[index];

  return (
    <div
      className="relative aspect-square overflow-hidden rounded-2xl"
      style={{ background: "var(--bg-subtle)" }}
    >
      <Image
        key={current.url}
        src={current.url}
        alt={current.alt ?? productName}
        fill
        sizes="(min-width: 640px) 50vw, 100vw"
        className="object-cover"
        priority={index === 0}
      />

      {sorted.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur transition-transform hover:scale-105"
            style={{ background: "color-mix(in srgb, var(--bg) 80%, transparent)", color: "var(--text)" }}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next image"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur transition-transform hover:scale-105"
            style={{ background: "color-mix(in srgb, var(--bg) 80%, transparent)", color: "var(--text)" }}
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {sorted.map((img, i) => (
              <button
                key={img.url + i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show image ${i + 1}`}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === index ? "18px" : "6px",
                  background:
                    i === index
                      ? "var(--bg)"
                      : "color-mix(in srgb, var(--bg) 55%, transparent)",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}