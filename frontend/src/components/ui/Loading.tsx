import { LoaderCircle } from "lucide-react";

interface LoadingProps {
  message?: string;
  fullPage?: boolean;
}

export default function Loading({
  message = "Loading...",
  fullPage = false,
}: LoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 ${
        fullPage ? "min-h-[60vh]" : "min-h-40"
      }`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
        <LoaderCircle className="h-6 w-6 animate-spin text-indigo-600" />
      </span>
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
}