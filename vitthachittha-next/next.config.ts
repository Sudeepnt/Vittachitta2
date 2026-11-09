import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Set by the root vercel.json: every route is prerendered, so Vercel serves the
  // exported files straight from its CDN. Local `next dev` / `next start` are unaffected.
  output: process.env.STATIC_EXPORT ? 'export' : undefined,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
