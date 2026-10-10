import type { Metadata } from "next";
import Link from "next/link";
import { serverApi } from "@/src/lib/api/server";
import ProductCreateForm from "@/src/components/products/ProductCreateForm";
import type { Category } from "@/src/types/product";

export const metadata: Metadata = {
  title: "Add product",
};

export default async function NewProductPage() {
  let categories: Category[];
  let loadError = "";

  try {
    const result = await serverApi<Category[] | { data: Category[] }>(
      "categories",
    );
    categories = Array.isArray(result) ? result : result.data;
  } catch {
    categories = [];
    loadError = "Unable to load categories. Check the Laravel API and try again.";
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <Link href="/products" className="text-sm text-indigo-600 hover:underline">
          ← Back to products
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add product</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a product to your catalogue.
          </p>
        </div>
      </div>

      {loadError ? (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {loadError}
        </p>
      ) : categories.length === 0 ? (
        <p role="alert" className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          No categories are available. Add a category before creating a product.
        </p>
      ) : (
        <ProductCreateForm categories={categories} />
      )}
    </div>
  );
}
