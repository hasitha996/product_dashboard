import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import type { Product } from "@/src/types/product";

interface ProductTableProps {
  products: Product[];
  onDelete?: (product: Product) => void;
}

function getCategoryName(product: Product): string {
  if (typeof product.category === "string") {
    return product.category;
  }

  return product.category?.name ?? "Uncategorized";
}

function getImageUrl(product: Product): string | null {
  if (typeof product.image_url === "string") {
    return product.image_url;
  }

  if (typeof product.image === "string") {
    return product.image;
  }

  return product.image?.url ?? null;
}

export default function ProductTable({
  products,
  onDelete,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-500">
        <p className="font-semibold text-slate-800">No products found</p>
        <p className="mt-1 text-sm">Try changing your filters or add a product.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_-12px_rgba(15,23,42,0.2)]">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="bg-slate-50/80 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
          <tr>
            <th className="px-5 py-4">Product</th>
            <th className="px-5 py-4">Category</th>
            <th className="px-5 py-4">Price</th>
            <th className="px-5 py-4">Rating</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {products.map((product) => {
            const imageUrl = getImageUrl(product);

            return (
              <tr key={product.id} className="transition hover:bg-indigo-50/30">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="h-12 w-12 rounded-xl border border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-[10px] font-semibold text-slate-400">
                        N/A
                      </div>
                    )}

                    <div>
                      <p className="font-semibold text-slate-800">
                        {product.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        ID: {product.id}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4 text-slate-500">
                  {getCategoryName(product)}
                </td>

                <td className="px-5 py-4 font-semibold text-slate-800">
                  {Number(product.price).toLocaleString("en-LK", {
                    style: "currency",
                    currency: "LKR",
                  })}
                </td>

                <td className="px-5 py-4 text-slate-500">
                  {product.rating ?? "—"}
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/products/${product.id}`}
                      aria-label={`View ${product.name}`}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>

                    <Link
                      href={`/products/${product.id}?edit=true`}
                      aria-label={`Edit ${product.name}`}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>

                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(product)}
                        aria-label={`Delete ${product.name}`}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}