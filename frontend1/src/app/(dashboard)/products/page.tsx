import type { Metadata } from "next";
import Link from "next/link";
import { serverApi } from "@/src/lib/api/server";
import ProductTable from "@/src/components/products/ProductTable";
import ProductSearchInput from "@/src/components/products/ProductSearchInput";
import type {
  Category,
  PaginatedResponse,
  Product,
  ProductFilters,
} from "@/src/types/product";

export const metadata: Metadata = {
  title: "Products",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getValue(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return typeof value === "string" ? value : "";
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const filters: ProductFilters = {
    search: getValue(params, "search"),
    category_id: getValue(params, "category_id")
      ? Number(getValue(params, "category_id"))
      : "",
    min_price: getValue(params, "min_price")
      ? Number(getValue(params, "min_price"))
      : "",
    max_price: getValue(params, "max_price")
      ? Number(getValue(params, "max_price"))
      : "",
    sort_by: (getValue(params, "sort_by") || "created_at") as ProductFilters["sort_by"],
    sort_order: (getValue(params, "sort_order") || "desc") as ProductFilters["sort_order"],
    page: Math.max(1, Number(getValue(params, "page")) || 1),
    per_page: 10,
  };
  const currentPage = filters.page ?? 1;

  const query = new URLSearchParams();

  if (filters.search) query.set("search", filters.search);
  if (filters.category_id) query.set("category_id", String(filters.category_id));
  if (filters.min_price !== "") query.set("min_price", String(filters.min_price));
  if (filters.max_price !== "") query.set("max_price", String(filters.max_price));
  if (filters.sort_by) query.set("sort_by", filters.sort_by);
  if (filters.sort_order) query.set("sort_order", filters.sort_order);
  query.set("page", String(currentPage));
  query.set("per_page", String(filters.per_page));

  let products: Product[] = [];
  let categories: Category[] = [];
  let totalPages = 1;
  let error = "";

  try {
    const [productResponse, categoryResponse] = await Promise.all([
      serverApi<PaginatedResponse<Product> | Product[]>(
        `products?${query.toString()}`,
      ),
      serverApi<Category[] | { data: Category[] }>("categories"),
    ]);

    products = Array.isArray(productResponse)
      ? productResponse
      : productResponse.data;

    totalPages = Array.isArray(productResponse)
      ? 1
      : productResponse.meta?.last_page ?? 1;

    categories = Array.isArray(categoryResponse)
      ? categoryResponse
      : categoryResponse.data;
  } catch {
    error = "Unable to load products. Check the Laravel API and endpoint paths.";
  }

  function pageUrl(page: number) {
    const next = new URLSearchParams(query);
    next.set("page", String(page));
    return `/products?${next.toString()}`;
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">CATALOGUE</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Products</h1>
          <p className="mt-2 text-sm text-slate-500">
            Search, review, and manage your product catalogue.
          </p>
        </div>

        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700"
        >
          <span className="text-lg leading-none">+</span>
          Add product
        </Link>
      </div>

      <form className="grid gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_-12px_rgba(15,23,42,0.2)] sm:grid-cols-2 xl:grid-cols-5">
        <ProductSearchInput initialValue={filters.search ?? ""} />

        <select
          name="category_id"
          defaultValue={filters.category_id}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <input
          name="min_price"
          type="number"
          min="0"
          defaultValue={filters.min_price}
          placeholder="Minimum price"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        />

        <input
          name="max_price"
          type="number"
          min="0"
          defaultValue={filters.max_price}
          placeholder="Maximum price"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        />

        <div className="flex gap-2">
          <select
            name="sort_by"
            defaultValue={filters.sort_by}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          >
            <option value="created_at">Date</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
          </select>

          <select
            name="sort_order"
            defaultValue={filters.sort_order}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          >
            <option value="asc">ASC</option>
            <option value="desc">DESC</option>
          </select>
        </div>

        <div className="flex gap-2 sm:col-span-2 xl:col-span-5">
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Apply filters
          </button>
          <Link
            href="/products"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Clear
          </Link>
        </div>
      </form>

      {error ? (
        <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <>
          <ProductTable products={products} />

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Page {currentPage} of {totalPages}
            </p>

            <div className="flex gap-2">
              <Link
                aria-disabled={currentPage <= 1}
                tabIndex={currentPage <= 1 ? -1 : 0}
                className={`rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium transition ${
                  currentPage <= 1
                    ? "pointer-events-none opacity-40"
                    : "text-slate-600 hover:border-indigo-200 hover:bg-white hover:text-indigo-700"
                }`}
                href={pageUrl(Math.max(1, currentPage - 1))}
              >
                Previous
              </Link>

              <Link
                aria-disabled={currentPage >= totalPages}
                tabIndex={currentPage >= totalPages ? -1 : 0}
                className={`rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium transition ${
                  currentPage >= totalPages
                    ? "pointer-events-none opacity-40"
                    : "text-slate-600 hover:border-indigo-200 hover:bg-white hover:text-indigo-700"
                }`}
                href={pageUrl(Math.min(totalPages, currentPage + 1))}
              >
                Next
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}