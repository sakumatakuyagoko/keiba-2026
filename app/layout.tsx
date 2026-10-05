import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import clsx from "clsx";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "鶯谷杯 京都2026 | Realtime Tracker",
  description: "第5回 鶯谷杯 京都2026 リアルタイム戦績トラッカー",
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
