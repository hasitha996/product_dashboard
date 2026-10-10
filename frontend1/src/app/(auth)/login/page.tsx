import { Suspense } from "react";
import AuthShell from "@/src/components/auth/AuthShell";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <AuthShell mode="login">
      <Suspense
        fallback={
          <div role="status" className="py-12 text-center text-sm text-slate-500">
            Loading sign in...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
