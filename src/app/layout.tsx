import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppProvider } from "@/store/AppStore";
import { Toasts } from "@/components/ui";

export const metadata: Metadata = {
  title: "مارک‌شاپ | سامانه مدیریت فروشگاه",
  description:
    "سامانه مدیریت محصولات آرایشی و بهداشتی مارک‌شاپ — سفارش‌ها، محصولات، مشتریان و گزارش‌ها",
};

export const viewport: Viewport = {
  themeColor: "#312E81",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-800 antialiased">
        <AppProvider>
          {children}
          <Toasts />
        </AppProvider>
      </body>
    </html>
  );
}
