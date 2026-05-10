import type { NextConfig } from "next";
import path from "path";

console.log('🔍 DEBUG next.config: EGDESK_BASE_PATH env var =', process.env.EGDESK_BASE_PATH);

const nextConfig: NextConfig = {
  // Only use basePath in production mode, not in dev mode
  basePath: process.env.NODE_ENV === 'development' ? '' : (process.env.EGDESK_BASE_PATH || ''),
  assetPrefix: process.env.NODE_ENV === 'development' ? '' : (process.env.EGDESK_BASE_PATH || ''),
  typescript: {
    // Always skip TypeScript errors to prevent blocking on auto-generated files
    ignoreBuildErrors: true,
  },
  eslint: {
    // Always skip ESLint errors to prevent blocking on auto-generated files
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@shared": path.resolve(__dirname, "shared"),
      "@server": path.resolve(__dirname, "server"),
    };

console.log('🔍 DEBUG next.config: Final config basePath =', nextConfig.basePath);
console.log('🔍 DEBUG next.config: Final config assetPrefix =', nextConfig.assetPrefix);

    return config;
  },
  turbopack: {
    resolveAlias: {
      "@/pages/": "./client/src/pages/",
      "@/contexts/": "./client/src/contexts/",
      "@/lib/": "./client/src/lib/",
      "@/components/": "./client/src/components/",
      "@/hooks/": "./client/src/hooks/",
      "@/types/": "./client/src/types/",
      "@/data/": "./client/src/data/",
      "@/admin/": "./client/src/admin/",
      "@/_core/": "./client/src/_core/",
      "@/const": "./client/src/const",
      "@/": ["./src/", "./client/src/"],
      "@shared": "./shared",
      "@server": "./server",
    },
  },
  // server/db.ts uses mysql2 which has native bindings – mark as external
  serverExternalPackages: ["mysql2"],
};

export default nextConfig;
