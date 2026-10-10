import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ProductHub",
    template: "%s | ProductHub",
  },
  description: "Product management dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          expand
          toastOptions={{
            classNames: {
              toast: "rounded-xl border shadow-lg",
              title: "font-semibold",
              description: "text-sm",
            },
          }}
        />
      </body>
    </html>
  );
}