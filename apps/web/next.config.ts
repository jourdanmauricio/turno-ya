import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    root: path.resolve(__dirname, '../../'),
    resolveAlias: {
      '@turno-ya/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
    },
  },
};

export default nextConfig;
