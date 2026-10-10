"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface ProductSearchInputProps {
  initialValue: string;
}

export default function ProductSearchInput({
  initialValue,
}: ProductSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(initialValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  function handleChange(nextValue: string) {
    setValue(nextValue);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const query = new URLSearchParams(window.location.search);
      const search = nextValue.trim();

      if (search) {
        query.set("search", search);
      } else {
        query.delete("search");
      }

      query.delete("page");
      const queryString = query.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    }, 300);
  }

  return (
    <div className="relative sm:col-span-2 xl:col-span-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        name="search"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Search products as you type"
        aria-label="Search products"
        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
      />
    </div>
  );
}
