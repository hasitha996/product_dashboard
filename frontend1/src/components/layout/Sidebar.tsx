"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/products", icon: Package },
];

export default function Sidebar({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      className={
        mobile
          ? "flex items-center gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2 lg:hidden"
          : "sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-slate-800/70 bg-slate-950 text-white"
      }
    >
      {!mobile && (
        <div className="flex h-[76px] items-center gap-3 border-b border-white/10 px-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-950/40">
            <ShoppingBag className="h-5 w-5 text-white" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">
            Product<span className="text-indigo-300">Hub</span>
          </span>
        </div>
      )}

      {!mobile && (
        <div className="px-6 pb-2 pt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Workspace
        </div>
      )}
      <nav
        className={
          mobile
            ? "flex min-w-max flex-1 gap-2"
            : "flex-1 space-y-1 px-3 py-2"
        }
      >
        {navigation.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={`group relative flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                mobile
                  ? active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  : active
                    ? "bg-indigo-500/15 text-indigo-200 shadow-inner shadow-indigo-300/5"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {!mobile && active && (
                <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-indigo-400" />
              )}
              <Icon
                className={`h-[18px] w-[18px] ${
                  active
                    ? mobile
                      ? "text-indigo-600"
                      : "text-indigo-300"
                    : mobile
                      ? "text-slate-400"
                      : "text-slate-500 group-hover:text-slate-300"
                }`}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {!mobile && (
        <div className="border-t border-white/10 p-5">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
            <p className="text-xs font-medium text-slate-300">Product workspace</p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              Keep your catalogue organized and up to date.
            </p>
          </div>
          <p className="mt-4 px-1 text-[10px] text-slate-600">
            ProductHub · Business dashboard
          </p>
        </div>
      )}
    </aside>
  );
}