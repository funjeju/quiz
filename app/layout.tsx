import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { BottomNav } from "@/components/layout/BottomNav";
import { AuthProvider } from "@/components/common/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "모두의퀴즈 — 뉴스를 퀴즈로 즐기다",
  description: "매일 자동 수집되는 뉴스를 AI가 퀴즈로! 연령별/지역별 랭킹 대결 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <AuthProvider>
          <main className="min-h-screen">
            {children}
          </main>
          <BottomNav />
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
