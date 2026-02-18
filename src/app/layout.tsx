import type { Metadata } from "next";
import "./globals.css";

import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

import Header from "@/app/_components/Header";

export const metadata: Metadata = {
  title: "GameLib - マイゲームライブラリ",
  description: "あなただけのゲームライブラリ。積みゲー管理からプレイ記録まで。",
};

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-900 text-slate-100">
        <Header />
        <div className="mx-4 mt-5 max-w-3xl pb-16 md:mx-auto">{children}</div>
      </body>
    </html>
  );
};

export default RootLayout;
