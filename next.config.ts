import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  // The pages are plain HTML files read from disk by src/lib/local-clone.ts at request time,
  // so make sure the serverless bundle ships them.
  outputFileTracingIncludes: {
    "/*": ["./.clone/**/*"],
    "/[...slug]": ["./.clone/**/*"],
  },
};

export default nextConfig;
