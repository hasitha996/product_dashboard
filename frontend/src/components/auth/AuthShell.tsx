import Link from "next/link";
import { ArrowUpRight, Boxes, ShieldCheck, Sparkles } from "lucide-react";

interface AuthShellProps {
  children: React.ReactNode;
  mode: "login" | "register";
}

export default function AuthShell({ children, mode }: AuthShellProps) {
  return (
    <main className="auth-background flex min-h-screen items-center justify-center p-4 sm:p-8">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_30px_100px_-40px_rgba(15,23,42,0.35)] lg:min-h-[680px] lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="auth-art relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex xl:p-14">
          <div className="absolute -right-28 -top-24 h-96 w-96 rounded-full border border-white/10" />
          <div className="absolute -bottom-40 -left-36 h-[32rem] w-[32rem] rounded-full border border-white/10" />
          <div className="absolute right-16 top-44 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl" />

          <Link href="/" className="relative inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
              <Boxes className="h-6 w-6" />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              ProductHub
            </span>
          </Link>

          <div className="relative max-w-md">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-100">
              <Sparkles className="h-3.5 w-3.5" />
              Your catalogue, beautifully organized
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
              {mode === "login"
                ? "Everything your products need, in one place."
                : "A better home for your product catalogue."}
            </h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-indigo-100/75">
              Manage products, keep details organized, and get a clearer view
              of your business.
            </p>

            <div className="mt-9 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-200">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium">A secure workspace</p>
                <p className="mt-0.5 text-xs text-indigo-100/65">
                  Your account stays protected.
                </p>
              </div>
              <ArrowUpRight className="ml-auto h-4 w-4 text-indigo-100/60" />
            </div>
          </div>

          <p className="relative text-xs text-indigo-100/55">
            ProductHub · Product management workspace
          </p>
        </aside>

        <section className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-14 xl:px-20">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-9 inline-flex items-center gap-2 lg:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <Boxes className="h-5 w-5" />
              </span>
              <span className="font-semibold text-slate-900">ProductHub</span>
            </Link>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
