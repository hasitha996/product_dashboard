import Link from "next/link";
import { Eye, Star } from "lucide-react";
import type { Product } from "@/src/types/product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl =
    product.image_url ??
    (typeof product.image === "string"
      ? product.image
      : product.image?.url);

  const categoryName =
    typeof product.category === "string"
      ? product.category
      : product.category?.name ?? "Uncategorized";

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_-12px_rgba(15,23,42,0.2)] transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-indigo-50/70">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-400">No image available</span>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-600">
            {categoryName}
          </p>
          <h2 className="mt-1.5 line-clamp-2 font-semibold leading-6 text-slate-900">
            {product.name}
          </h2>
        </div>

        {product.description && (
          <p className="line-clamp-2 text-sm leading-6 text-slate-500">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-slate-950">
            {Number(product.price).toLocaleString("en-LK", {
              style: "currency",
              currency: "LKR",
            })}
          </p>

          {product.rating != null && (
            <span className="inline-flex items-center gap-1 text-sm text-amber-600">
              <Star className="h-4 w-4 fill-current" />
              {product.rating}
            </span>
          )}
        </div>

        <Link
          href={`/products/${product.id}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition group-hover:bg-indigo-600"
        >
          <Eye className="h-4 w-4" />
          View product
        </Link>
      </div>
    </article>
  );
}