"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-store";

export function CartLink() {
  const { lines } = useCart();
  return (
    <Link
      href="/cart"
      className="inline-flex items-center gap-2 rounded-full px-3 py-2 font-medium hover:bg-black/5"
    >
      Cart
      <span
        className={`min-w-6 rounded-sm px-1.5 text-center text-sm tabular-nums ${
          lines.length > 0 ? "bg-focus text-white" : "bg-line text-muted"
        }`}
        aria-label={`${lines.length} items in cart`}
      >
        {lines.length}
      </span>
    </Link>
  );
}
