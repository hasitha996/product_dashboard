
import type { Metadata } from "next";
import { Suspense } from "react";
import { Package, Layers3, Tags } from "lucide-react";
import { serverApi } from "@/src/lib/api/server";
import type {
  Category,
  Product,
  PaginatedResponse,
} from "@/src/types/product";

export const metadata: Metadata = {
  title: "Dashboard",
};

async function getProducts(): Promise<Product[]> {
  const result = await serverApi<
    PaginatedResponse<Product> | Product[]
  >("products?per_page=5");

  return Array.isArray(result) ? result : result.data;
}

async function getCategories(): Promise<Category[]> {
  const result = await serverApi<Category[] | { data: Category[] }>(
    "categories",
  );

  return Array.isArray(result) ? result : result.data;
}

function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-56 rounded bg-gray-200" />
        <div className="mt-2 h-4 w-72 rounded bg-gray-100" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-32 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="h-4 w-28 rounded bg-gray-200" />
            <div className="mt-5 h-7 w-20 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      <div className="h-48 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="h-5 w-48 rounded bg-gray-200" />
      </div>
    </div>
  );
}

async function DashboardContent() {
  let products: Product[] = [];
  let categories: Category[] = [];
  let loadError = false;
  let categoriesLoadError = false;

  try {
    products = await getProducts();
  } catch {
    loadError = true;
  }

  try {
    categories = await getCategories();
  } catch {
    categoriesLoadError = true;
  }

  const cards = [
    {
      label: "Products loaded",
      value: loadError ? "—" : products.length.toString(),
      icon: Package,
    },
    {
      label: "Product catalogue",
      value: loadError ? "—" : "Available",
      icon: Layers3,
    },
    {
      label: "Categories",
      value: categoriesLoadError ? "—" : categories.length.toString(),
      icon: Tags,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">OVERVIEW</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Good to see you</h1>
          <p className="mt-2 text-sm text-slate-500">
            Here’s what’s happening with your product catalogue.
          </p>
        </div>
        <p className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          Workspace active
        </p>
      </div>

      {loadError && (
        <p
          role="alert"
          className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
        >
          Could not retrieve products from the  API.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <section key={label} className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_20px_-12px_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
            <p className="mt-1 text-xs text-slate-400">
              {label === "Categories"
                ? "In your catalogue"
                : label === "Products loaded"
                  ? "Recently returned"
                  : "Product catalogue"}
            </p>
          </section>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_-12px_rgba(15,23,42,0.2)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">CATALOGUE</p>
            <h2 className="mt-1 font-semibold text-slate-900">Recently returned products</h2>
          </div>
          <Package className="h-5 w-5 text-slate-300" />
        </div>

        {products.length === 0 ? (
          <p className="px-6 py-8 text-sm text-slate-500">
            {loadError
              ? "Products could not be loaded."
              : "No products found."}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 px-6">
            {products.map((product) => (
              <li
                key={product.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <span className="font-medium text-slate-800">{product.name}</span>
                <span className="text-sm font-semibold text-slate-600">
                  {Number(product.price).toLocaleString("en-LK", {
                    style: "currency",
                    currency: "LKR",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
