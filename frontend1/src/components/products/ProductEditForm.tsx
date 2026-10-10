"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiClientError, clientApi } from "@/src/lib/api/client";
import { notify } from "@/src/lib/notifications";
import type { Category, Product } from "@/src/types/product";

interface ProductEditFormProps {
  product: Product;
  categories: Category[];
}

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function getImageUrl(product: Product) {
  return (
    product.image_url ??
    (typeof product.image === "string"
      ? product.image
      : product.image?.url ?? null)
  );
}

export default function ProductEditForm({
  product,
  categories,
}: ProductEditFormProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [image, setImage] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const existingImageUrl = getImageUrl(product);
  const previewUrl = removeImage ? null : existingImageUrl;
  const categoryId =
    typeof product.category === "object" ? product.category?.id : undefined;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setImageError("");
    setFieldErrors({});

    if (image && !ALLOWED_IMAGE_TYPES.includes(image.type)) {
      setImageError("Select a JPEG, PNG, or WebP image.");
      return;
    }

    if (image && image.size > MAX_IMAGE_SIZE) {
      setImageError("Image size must not exceed 2 MB.");
      return;
    }

    const form = new FormData(event.currentTarget);
    form.delete("image");
    form.append("image", image ?? "");
    form.set("remove_image", String(removeImage));
    setSubmitting(true);

    try {
      await clientApi<{ message: string; data: Product }>(
        `/api/products/${product.id}`,
        { method: "POST", body: form },
      );
      notify.success("Product changes saved.");
      router.replace(`/products/${product.id}`);
      router.refresh();
    } catch (submitError) {
      if (submitError instanceof ApiClientError) {
        notify.error(submitError.message);
        setFieldErrors(submitError.errors ?? {});
      } else {
        notify.error(
          submitError instanceof Error
            ? submitError.message
            : "Unable to update the product.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  function fieldError(name: string) {
    return fieldErrors[name]?.[0];
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_36px_-20px_rgba(15,23,42,0.25)] sm:p-8"
    >
      <div className="border-b border-slate-100 pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-500">
          PRODUCT DETAILS
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          Edit {product.name}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Update the product information and save your changes.
        </p>
      </div>

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
          defaultValue={product.name}
          className={inputClass}
          aria-invalid={Boolean(fieldError("name"))}
          aria-describedby={fieldError("name") ? "name-error" : undefined}
        />
        {fieldError("name") && (
          <p id="name-error" className="mt-1 text-sm text-red-600">{fieldError("name")}</p>
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
            defaultValue={product.category_id ?? categoryId ?? ""}
            className={inputClass}
            aria-invalid={Boolean(fieldError("category_id"))}
            aria-describedby={fieldError("category_id") ? "category-error" : undefined}
          >
            <option value="" disabled>Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          {fieldError("category_id") && (
            <p id="category-error" className="mt-1 text-sm text-red-600">{fieldError("category_id")}</p>
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
            defaultValue={product.price}
            className={inputClass}
            aria-invalid={Boolean(fieldError("price"))}
            aria-describedby={fieldError("price") ? "price-error" : undefined}
          />
          {fieldError("price") && (
            <p id="price-error" className="mt-1 text-sm text-red-600">{fieldError("price")}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="rating" className="mb-2 block text-sm font-semibold text-slate-700">
          Rating
        </label>
        <input
          id="rating"
          name="rating"
          type="number"
          min="0"
          max="5"
          step="0.1"
          required
          defaultValue={product.rating ?? 0}
          className={`${inputClass} sm:max-w-xs`}
          aria-invalid={Boolean(fieldError("rating"))}
          aria-describedby={fieldError("rating") ? "rating-error" : undefined}
        />
        {fieldError("rating") && (
          <p id="rating-error" className="mt-1 text-sm text-red-600">{fieldError("rating")}</p>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="image" className="mb-2 block text-sm font-semibold text-slate-700">
            Product image
          </label>
          <p className="text-xs text-slate-500">JPEG, PNG, or WebP. Maximum size: 2 MB.</p>
        </div>

        {previewUrl ? (
          <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/70 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Product preview" className="h-full max-w-full rounded-xl object-contain" />
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
            No product image
          </div>
        )}

        <input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            const selected = event.target.files?.[0] ?? null;
            setImage(selected);
            if (selected) setRemoveImage(false);
            setImageError("");
          }}
          className="block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-100 file:px-4 file:py-2 file:font-semibold file:text-indigo-700 hover:file:bg-indigo-200"
          aria-invalid={Boolean(imageError || fieldError("image"))}
          aria-describedby={imageError || fieldError("image") ? "image-error" : undefined}
        />
        {(imageError || fieldError("image")) && (
          <p id="image-error" className="text-sm text-red-600">{imageError || fieldError("image")}</p>
        )}

        {existingImageUrl && !removeImage && (
          <button
            type="button"
            onClick={() => {
              setImage(null);
              setRemoveImage(true);
            }}
            className="text-sm font-medium text-red-600 transition hover:text-red-700"
          >
            Remove current image
          </button>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
        <Link
          href={`/products/${product.id}`}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/15 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Saving changes..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
