"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Upload, X } from "lucide-react";
import { clientApi } from "@/src/lib/api/client";
import { notify } from "@/src/lib/notifications";

interface ProductImageUploadProps {
  productId: number;
  currentImageUrl?: string | null;
  onUploaded?: (imageUrl: string) => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ProductImageUpload({
  productId,
  currentImageUrl,
  onUploaded,
}: ProductImageUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl ?? null,
  );
  const [uploading, setUploading] = useState(false);

  useEffect(
    () => () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    },
    [previewUrl],
  );

  function handleFileChange(selectedFile: File | undefined) {
    if (!selectedFile) {
      setFile(null);
      setPreviewUrl(currentImageUrl ?? null);
      return;
    }

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      notify.error("Select a JPEG, PNG, or WebP image.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      notify.error("Image size must not exceed 2 MB.");
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  }

  async function handleUpload() {
    if (!file) {
      notify.error("Please select an image first.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const result = await clientApi<{
        message?: string;
        data?: { image_url?: string; image?: string };
        image_url?: string;
      }>(`/api/products/${productId}/image`, {
        method: "POST",
        body: formData,
      });

      const uploadedUrl =
        result.data?.image_url ??
        result.data?.image ??
        result.image_url;

      notify.success(result.message ?? "Image uploaded successfully.");
      setFile(null);

      if (uploadedUrl) {
        setPreviewUrl(uploadedUrl);
        onUploaded?.(uploadedUrl);
      }
    } catch (err) {
      notify.error(
        err instanceof Error ? err.message : "Image upload failed.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_-12px_rgba(15,23,42,0.2)] sm:p-6">
      <div>
        <h2 className="font-semibold text-slate-900">Product image</h2>
        <p className="mt-1 text-sm text-slate-500">
          JPEG, PNG, or WebP. Maximum size: 2 MB.
        </p>
      </div>

      {previewUrl ? (
        <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/70">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Product preview"
            className="h-full max-w-full object-contain"
          />

          {file && (
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPreviewUrl(currentImageUrl ?? null);
              }}
              aria-label="Remove selected image"
              className="absolute right-3 top-3 rounded-full bg-white p-2 text-slate-600 shadow-md transition hover:bg-red-50 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 px-4 py-12 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40">
          <ImagePlus className="mb-3 h-9 w-9 text-indigo-400" />
          <span className="text-sm font-semibold text-slate-700">
            Choose an image
          </span>
          <span className="mt-1 text-xs text-slate-500">
            JPEG, PNG, or WebP
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) =>
              handleFileChange(event.target.files?.[0])
            }
          />
        </label>
      )}

      {previewUrl && (
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
          <Upload className="h-4 w-4" />
          Choose another image
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) =>
              handleFileChange(event.target.files?.[0])
            }
          />
        </label>
      )}

      {file && (
        <p className="text-sm text-slate-600">
          Selected: {file.name}
        </p>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || uploading}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/15 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Upload className="h-4 w-4" />
        {uploading ? "Uploading..." : "Upload image"}
      </button>
    </section>
  );
}