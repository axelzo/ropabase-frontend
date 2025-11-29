import type { NextConfig } from "next";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const apiUrl = new URL(rawApiUrl.replace(/\/+$/, ""));
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: apiUrl.protocol.replace(":", ""),
        hostname: apiUrl.hostname,
        port: apiUrl.port,
        pathname: "/uploads/**",
      } as any,
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3000",
        pathname: "/uploads/**",
      },
    ],
  },
};


export default nextConfig;
