import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      // 既存のパターンをそのまま残す
      { protocol: "https", hostname: "w1980.blob.core.windows.net" },
      { protocol: "https", hostname: "placehold.jp" },
      { protocol: "https", hostname: "images.microcms-assets.io" },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      // ゲームカバー画像用に汎用ドメインを許可
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
