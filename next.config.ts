import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // Hosting con pocos recursos (Hostinger): evita procesos paralelos que se caen.
  experimental: { cpus: 1 },
};

export default nextConfig;
