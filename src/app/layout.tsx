import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "线上养老储备测算与缺口唤醒工具",
  description: "模拟您未来的养老方式与花费结构，测算养老资金缺口，把'要不要准备养老钱'转化为'需要补齐多少储备'。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-slate-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
