"use client";

import { Search, X } from "lucide-react";
import type { Category, ProductFilters as Filters } from "@/src/types/product";

interface ProductFiltersProps {
  filters: Filters;
  categories: Category[];
  onChange: (filters: Filters) => void;
}

export default function ProductFilters({
  filters,
  categories,
  onChange,
}: ProductFiltersProps) {
  function update<K extends keyof Filters>(
    key: K,
    value: Filters[K],
  ) {
    onChange({
      ...filters,
      [key]: value,
      page: 1,
    });
  }

  function clearFilters() {
    onChange({
      search: "",
      category_id: "",
      min_price: "",
      max_price: "",
      sort_by: "created_at",
      sort_order: "desc",
      page: 1,
      per_page: filters.per_page ?? 10,
    });
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_-12px_rgba(15,23,42,0.2)]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

        <input
          type="search"
          value={filters.search ?? ""}
          onChange={(event) => update("search", event.target.value)}
          placeholder="Search products..."
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <select
          value={filters.category_id ?? ""}
          onChange={(event) =>
            update(
              "category_id",
              event.target.value ? Number(event.target.value) : "",
            )
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="0"
          value={filters.min_price ?? ""}
          onChange={(event) =>
            update(
              "min_price",
              event.target.value === "" ? "" : Number(event.target.value),
            )
          }
          placeholder="Minimum price"
          aria-label="Minimum price"
          className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        />

        <input
          type="number"
          min="0"
          value={filters.max_price ?? ""}
          onChange={(event) =>
            update(
              "max_price",
              event.target.value === "" ? "" : Number(event.target.value),
            )
          }
          placeholder="Maximum price"
          aria-label="Maximum price"
          className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        />

        <select
          value={filters.sort_by ?? "created_at"}
          onChange={(event) =>
            update("sort_by", event.target.value as Filters["sort_by"])
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          aria-label="Sort products by"
        >
          <option value="created_at">Date added</option>
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="rating">Rating</option>
        </select>

        <select
          value={filters.sort_order ?? "desc"}
          onChange={(event) =>
            update("sort_order", event.target.value as Filters["sort_order"])
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          aria-label="Sort direction"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <X className="h-4 w-4" />
          Clear filters
        </button>
      </div>
    </section>
  );
}