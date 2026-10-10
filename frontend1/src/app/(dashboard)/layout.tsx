import { redirect } from "next/navigation";
import { Suspense } from "react";
import { serverApi } from "@/src/lib/api/server";
import { getAccessToken } from "@/src/lib/auth/session";
import Sidebar from "@/src/components/layout/Sidebar";
import Header from "@/src/components/layout/Header";
import type { User } from "@/src/types/auth";

function DashboardLayoutLoading() {
  return (
    <div className="min-h-screen animate-pulse lg:flex">
      <div className="hidden w-64 border-r bg-white lg:block" />
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="h-14 rounded-lg bg-gray-200" />
        <div className="mt-8 h-48 rounded-xl border bg-white" />
      </main>
    </div>
  );
}

async function DashboardLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getAccessToken();

  if (!token) {
    redirect("/login");
  }

  let user: User;

  try {
    const result = await serverApi<User | { user: User }>("auth/user");
    user = "user" in result ? result.user : result;
  } catch {
    redirect("/api/auth/logout?redirect=/login");
  }

  return (
    <div className="min-h-screen lg:flex">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="min-w-0 flex-1">
        <Header
          title="Product Dashboard"
          userName={user.name}
          userEmail={user.email}
        />

        <div className="lg:hidden">
          <Sidebar mobile />
        </div>
        <main className="page-enter mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-9">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<DashboardLayoutLoading />}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}