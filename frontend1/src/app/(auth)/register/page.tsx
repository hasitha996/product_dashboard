import type { Metadata } from "next";
import AuthShell from "@/src/components/auth/AuthShell";
import RegisterForm from "./register-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <AuthShell mode="register">
      <RegisterForm />
    </AuthShell>
  );
}
