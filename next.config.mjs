/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // The page is one document; hash links (#/operating etc.) are handled by public/assets/js/site.js.
  trailingSlash: false,
  async headers() {
    return [
      {
        // CSS and JS are requested with ?v=<ASSET_VERSION> (see app/layout.js and content/body.html),
        // so a new version is always a new URL and these can be cached for a year.
        source: '/assets/:kind(css|js)/:file*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        // Logos are not versioned, so cache for a day.
        source: '/assets/brand/:file*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
    ];
  },
};
export default nextConfig;
