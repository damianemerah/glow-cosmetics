import type { NextConfig } from "next";
import withPWA from "next-pwa";

const isProd = process.env.NODE_ENV === "production";

const baseNextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nqzcokqdvmmlysnyaclc.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "54321",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/storage/v1/object/public/category-images/**",
      },
    ],
  },
  poweredByHeader: false,
};

const nextConfig = withPWA({
  dest: "public",
  disable: !isProd,
  register: true,
  skipWaiting: true,
})(baseNextConfig);

export default nextConfig;
