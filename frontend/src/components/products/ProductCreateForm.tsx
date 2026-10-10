"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError, clientApi } from "@/src/lib/api/client";
import { notify } from "@/src/lib/notifications";
import type { Category, Product } from "@/src/types/product";

interface ProductCreateFormProps {
  categories: Category[];
}

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ProductCreateForm({
  categories,
}: ProductCreateFormProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setImageError("");
    setFieldErrors({});

    const form = event.currentTarget;
    const formData = new FormData(form);
    const image = formData.get("image");

    if (image instanceof File && image.size > 0) {
      if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
        setImageError("Select a JPEG, PNG, or WebP image.");
        return;
      }
      if (image.size > MAX_IMAGE_SIZE) {
        setImageError("Image size must not exceed 2 MB.");
        return;
      }
    }

    setSubmitting(true);

    try {
      const product = await clientApi<Product | { data: Product }>(
        "/api/products",
        {
          method: "POST",
          body: formData,
        },
      );
      const createdProduct = "data" in product ? product.data : product;

      notify.success("Product created successfully.");
      router.push(`/products/${createdProduct.id}`);
      router.refresh();
    } catch (submissionError) {
      if (submissionError instanceof ApiClientError) {
        notify.error(submissionError.message);
        setFieldErrors(submissionError.errors ?? {});
      } else {
        notify.error(
          submissionError instanceof Error
            ? submissionError.message
            : "Unable to create the product.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  function fieldError(name: string) {
    return fieldErrors[name]?.[0];
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_36px_-20px_rgba(15,23,42,0.25)] sm:p-8"
    >
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">
          Product name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          maxLength={255}
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          aria-invalid={Boolean(fieldError("name"))}
          aria-describedby={fieldError("name") ? "name-error" : undefined}
        />
        {fieldError("name") && (
          <p id="name-error" className="mt-1 text-sm text-red-600">
            {fieldError("name")}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="category_id" className="mb-2 block text-sm font-semibold text-slate-700">
            Category
          </label>
          <select
            id="category_id"
            name="category_id"
            required
            defaultValue=""
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            aria-invalid={Boolean(fieldError("category_id"))}
            aria-describedby={
              fieldError("category_id") ? "category-error" : undefined
            }
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {fieldError("category_id") && (
            <p id="category-error" className="mt-1 text-sm text-red-600">
              {fieldError("category_id")}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="price" className="mb-2 block text-sm font-semibold text-slate-700">
            Price (LKR)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            max="9999999999.99"
            step="0.01"
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            aria-invalid={Boolean(fieldError("price"))}
            aria-describedby={fieldError("price") ? "price-error" : undefined}
          />
          {fieldError("price") && (
            <p id="price-error" className="mt-1 text-sm text-red-600">
              {fieldError("price")}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="rating" className="mb-2 block text-sm font-semibold text-slate-700">
          Rating (optional)
        </label>
        <input
          id="rating"
          name="rating"
          type="number"
          min="0"
          max="5"
          step="0.1"
          placeholder="0–5"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 sm:max-w-xs"
          aria-invalid={Boolean(fieldError("rating"))}
          aria-describedby={fieldError("rating") ? "rating-error" : undefined}
        />
        {fieldError("rating") && (
          <p id="rating-error" className="mt-1 text-sm text-red-600">
            {fieldError("rating")}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="image" className="mb-2 block text-sm font-semibold text-slate-700">
          Product image (optional)
        </label>
        <p className="mb-2 text-xs text-slate-500">
          JPEG, PNG, or WebP. Maximum size: 2 MB.
        </p>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={() => setImageError("")}
          className="block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-100 file:px-4 file:py-2 file:font-semibold file:text-indigo-700 hover:file:bg-indigo-200"
          aria-invalid={Boolean(imageError || fieldError("image"))}
          aria-describedby={
            imageError || fieldError("image") ? "image-error" : undefined
          }
        />
        {(imageError || fieldError("image")) && (
          <p id="image-error" className="mt-1 text-sm text-red-600">
            {imageError || fieldError("image")}
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={() => router.push("/products")}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/15 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create product"}
        </button>
      </div>
    </form>
  );
}
