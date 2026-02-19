import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import clsx from "clsx";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sapporo Keiba 2026",
  description: "Realtime Horse Racing Tracker",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={clsx(inter.className, "antialiased selection:bg-yellow-500 selection:text-black bg-gray-900 text-white")}>
        <main className="min-h-screen max-w-md mx-auto relative pb-24 bg-gray-800 shadow-2xl">
          {children}
        </main>
      </body>
    </html>
  );
}
