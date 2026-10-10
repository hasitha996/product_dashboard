import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { serverApi } from "@/src/lib/api/server";
import ProductImageUpload from "@/src/components/products/ProductImageUpload";
import ProductEditForm from "@/src/components/products/ProductEditForm";
import type { Category, Product } from "@/src/types/product";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: "Product details",
};

export default async function ProductDetailPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const query = await searchParams;
  const editMode = query.edit === "true";

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  let product: Product;

  try {
    const result = await serverApi<Product | { data: Product }>(
      `products/${id}`,
    );

    product = "data" in result ? result.data : result;
  } catch {
    notFound();
  }

  const imageUrl =
    product.image_url ??
    (typeof product.image === "string"
      ? product.image
      : product.image?.url);

  const category =
    typeof product.category === "string"
      ? product.category
      : product.category?.name ?? "Uncategorized";

  if (editMode) {
    let categories: Category[];

    try {
      const result = await serverApi<Category[] | { data: Category[] }>(
        "categories",
      );
      categories = Array.isArray(result) ? result : result.data;
    } catch {
      return (
        <div className="space-y-5">
          <p role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
            Unable to load categories. The product cannot be edited until categories are available.
          </p>
          <Link href={`/products/${product.id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
            Return to product details
          </Link>
        </div>
      );
    }

    return (
      <div className="w-full space-y-6">
        <Link href={`/products`} className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition hover:text-indigo-800">
          <span aria-hidden="true">←</span> Back to products
        </Link>
        {categories.length === 0 ? (
          <p role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            No categories are available. Add a category before editing this product.
          </p>
        ) : (
          <ProductEditForm product={product} categories={categories} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/products" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition hover:text-indigo-800">
          <span aria-hidden="true">←</span> Back to products
        </Link>
        <Link
          href={`/products/${product.id}?edit=true`}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/15 transition hover:bg-indigo-700"
        >
          Edit product
        </Link>
      </div>

      <section className="grid gap-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_36px_-20px_rgba(15,23,42,0.25)] md:grid-cols-2 md:p-8">
        <div className="flex min-h-72 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/70 p-4">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={product.name}
              className="max-h-[28rem] max-w-full object-contain transition duration-500 hover:scale-[1.02]"
            />
          ) : (
            <p className="text-sm text-gray-400">No product image</p>
          )}
        </div>

        <div className="flex flex-col items-start justify-center space-y-5 py-2">
          <p className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-indigo-700">{category}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{product.name}</h1>

          <p className="text-3xl font-semibold tracking-tight text-slate-900">
            {Number(product.price).toLocaleString("en-LK", {
              style: "currency",
              currency: "LKR",
            })}
          </p>

          {product.rating != null && (
            <p className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700">
              Rating: {product.rating} / 5
            </p>
          )}

          <p className="max-w-prose whitespace-pre-line leading-7 text-slate-500">
            {product.description || "No description available."}
          </p>

          <p className="border-t border-slate-100 pt-4 text-xs text-slate-400">Product ID: {product.id}</p>
        </div>
      </section>

      <ProductImageUpload
        productId={product.id}
        currentImageUrl={imageUrl}
      />
    </div>
  );
}