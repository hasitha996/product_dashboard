"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { ApiClientError, clientApi } from "@/src/lib/api/client";
import { notify } from "@/src/lib/notifications";
import type { User } from "@/src/types/auth";

export default function RegisterForm() {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await clientApi<{ user: User }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
          password_confirmation: formData.get("password_confirmation"),
        }),
      });
      notify.success(`Welcome to ProductHub, ${result.user.name}!`);
      router.replace("/dashboard");
      router.refresh();
    } catch (submitError) {
      if (submitError instanceof ApiClientError) {
        notify.error(submitError.message);
        setFieldErrors(submitError.errors ?? {});
      } else {
        notify.error(
          submitError instanceof Error
            ? submitError.message
            : "Unable to create your account.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  function fieldError(name: string) {
    return fieldErrors[name]?.[0];
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold text-indigo-600">GET STARTED</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Create your account
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Set up your workspace in just a few steps.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
            Full name
          </label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={255}
              required
              placeholder="Your name"
              className={inputClass}
              aria-invalid={Boolean(fieldError("name"))}
            />
          </div>
          {fieldError("name") && <p className="mt-1 text-xs text-red-600">{fieldError("name")}</p>}
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={255}
              required
              placeholder="you@example.com"
              className={inputClass}
              aria-invalid={Boolean(fieldError("email"))}
            />
          </div>
          {fieldError("email") && <p className="mt-1 text-xs text-red-600">{fieldError("email")}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
            Password
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              required
              placeholder="At least 8 characters"
              className={`${inputClass} pr-12`}
              aria-invalid={Boolean(fieldError("password"))}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldError("password") && <p className="mt-1 text-xs text-red-600">{fieldError("password")}</p>}
        </div>

        <div>
          <label htmlFor="password_confirmation" className="mb-1.5 block text-sm font-medium text-slate-700">
            Confirm password
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="password_confirmation"
              name="password_confirmation"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              required
              placeholder="Enter your password again"
              className={inputClass}
              aria-invalid={Boolean(fieldError("password_confirmation"))}
            />
          </div>
          {fieldError("password_confirmation") && <p className="mt-1 text-xs text-red-600">{fieldError("password_confirmation")}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creating account..." : "Create account"}
          {!submitting && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
