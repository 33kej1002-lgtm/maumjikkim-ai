import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "마음지킴 AI — 민원 응대는 똑똑하게, 내 마음은 단단하게",
  description: "공무원을 위한 민원 응대 학습 및 실전 지원 AI 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSansKR.className}>
      <body className="bg-white text-slate-900">
        <Navigation />
        <main className="pt-0 md:pt-16 pb-16 md:pb-0 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
