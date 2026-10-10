import { z } from "zod";

export const productSchema = z.object({
name: z
.string()
.trim()
.min(2, "Product name must contain at least 2 characters.")
.max(255, "Product name cannot exceed 255 characters."),

description: z
.string()
.trim()
.max(5000, "Description cannot exceed 5000 characters.")
.optional()
.or(z.literal("")),

price: z.coerce
.number()
.finite("Enter a valid price.")
.min(0, "Price cannot be negative."),

rating: z
.union([
z.literal("").transform(() => undefined),
z.coerce.number().min(0).max(5),
])
.optional(),

category_id: z.coerce
.number()
.int("Select a valid category.")
.positive("Please select a category."),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const productImageSchema = z.object({
image: z
.file()
.max(2 * 1024 * 1024, "Image must be 2 MB or smaller.")
.mime(
["image/jpeg", "image/png", "image/webp"],
"Only JPEG, PNG, and WebP images are allowed.",
),
});
