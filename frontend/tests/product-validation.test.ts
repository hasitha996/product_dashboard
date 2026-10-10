import { describe, expect, it } from "vitest";
import {
  productImageSchema,
  productSchema,
} from "../src/lib/validations/product";

describe("productSchema", () => {
  it("accepts valid product details and coerces numeric form values", () => {
    const result = productSchema.safeParse({
      name: "  Desk lamp ",
      description: "  Adjustable LED lamp ",
      price: "29.99",
      rating: "4.5",
      category_id: "2",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data).toMatchObject({
      name: "Desk lamp",
      description: "Adjustable LED lamp",
      price: 29.99,
      rating: 4.5,
      category_id: 2,
    });
  });

  it("rejects short names, negative prices, invalid ratings, and missing categories", () => {
    const result = productSchema.safeParse({
      name: "x",
      price: "-1",
      rating: "6",
      category_id: "0",
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.issues.map((issue) => issue.path[0])).toEqual(
      expect.arrayContaining(["name", "price", "rating", "category_id"]),
    );
  });

  it("allows blank optional descriptions and ratings", () => {
    const result = productSchema.safeParse({
      name: "Desk lamp",
      description: "",
      price: "0",
      rating: "",
      category_id: "1",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.rating).toBeUndefined();
    expect(result.data.price).toBe(0);
  });
});

describe("productImageSchema", () => {
  it("accepts supported image types within the 2 MB limit", () => {
    const image = new File(["image"], "lamp.webp", { type: "image/webp" });

    expect(productImageSchema.safeParse({ image }).success).toBe(true);
  });

  it("rejects unsupported formats and images larger than 2 MB", () => {
    const unsupported = new File(["image"], "lamp.gif", { type: "image/gif" });
    const oversized = new File([new Uint8Array(2 * 1024 * 1024 + 1)], "lamp.png", {
      type: "image/png",
    });

    expect(productImageSchema.safeParse({ image: unsupported }).success).toBe(
      false,
    );
    expect(productImageSchema.safeParse({ image: oversized }).success).toBe(
      false,
    );
  });
});
