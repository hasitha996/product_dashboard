"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { notify } from "@/src/lib/notifications";

interface HeaderProps {
  title?: string;
  userName?: string;
  userEmail?: string;
  onMenuClick?: () => void;
}

export default function Header({
  title = "Dashboard",
  userName = "User",
  userEmail,
  onMenuClick,
}: HeaderProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  async function handleLogout() {
    setLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("Logout failed. Please try again.");
      }

      notify.success("You have been logged out.");
      router.replace("/login");
      router.refresh();
    } catch (err) {
      notify.error(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-20 flex min-h-[76px] items-center justify-between gap-4 border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-xl sm:px-8">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div>
          <p className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-500 sm:block">
            ProductHub workspace
          </p>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-800">{userName}</p>
          {userEmail && (
            <p className="mt-0.5 text-xs text-slate-500">{userEmail}</p>
          )}
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 ring-2 ring-white">
          {userName.slice(0, 1).toUpperCase()}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          <span>{loggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </div>

    </header>
  );
}