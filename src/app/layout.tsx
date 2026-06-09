import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  PRODUCT_DISPLAY_NAME,
  PRODUCT_META_DESCRIPTION,
} from "@/lib/product-copy";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: PRODUCT_DISPLAY_NAME,
  description: PRODUCT_META_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full antialiased" suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-slate-950 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
