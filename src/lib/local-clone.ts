import { readFile } from "node:fs/promises";
import path from "node:path";

const PROJECT_ROOT = process.cwd();
const PAGES_ROOT = path.join(PROJECT_ROOT, ".clone", "pages");
const PUBLIC_ROOT = path.join(PROJECT_ROOT, "public");

const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  ".css": "text/css; charset=UTF-8",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "application/javascript; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".mp4": "video/mp4",
  ".otf": "font/otf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=UTF-8",
};

function safePathname(pathnameValue: string) {
  const normalized = pathnameValue.endsWith("/") ? pathnameValue : `${pathnameValue}/`;
  return normalized.replace(/\/{2,}/g, "/");
}

function htmlFilePathForRoute(pathnameValue: string) {
  const normalizedPath = safePathname(pathnameValue).replace(/^\/+/, "");
  if (!normalizedPath) {
    return path.join(PAGES_ROOT, "index.html");
  }

  const htmlFilePath = path.join(PAGES_ROOT, normalizedPath, "index.html");
  const relative = path.relative(PAGES_ROOT, htmlFilePath);
  if (relative.startsWith("..")) {
    throw new Error("Invalid route path");
  }

  return htmlFilePath;
}

function filePathForPublicAsset(pathnameValue: string) {
  const clean = pathnameValue.replace(/^\/+/, "");
  const absolutePath = path.join(PUBLIC_ROOT, clean);
  const relative = path.relative(PUBLIC_ROOT, absolutePath);
  if (relative.startsWith("..")) {
    throw new Error("Invalid asset path");
  }
  return absolutePath;
}

function contentTypeForAsset(pathnameValue: string) {
  const extension = path.extname(pathnameValue).toLowerCase();
  return CONTENT_TYPE_BY_EXTENSION[extension] ?? "application/octet-stream";
}

export async function serveLocalClone(pathnameValue: string) {
  if (path.extname(pathnameValue)) {
    try {
      const assetFilePath = filePathForPublicAsset(pathnameValue);
      const asset = await readFile(assetFilePath);
      return new Response(asset, {
        headers: {
          "cache-control": "public, max-age=31536000, immutable",
          "content-type": contentTypeForAsset(pathnameValue),
        },
        status: 200,
      });
    } catch {
      return new Response("Not Found", {
        headers: {
          "content-type": "text/plain; charset=UTF-8",
        },
        status: 404,
      });
    }
  }

  try {
    const htmlFilePath = htmlFilePathForRoute(pathnameValue);
    const html = await readFile(htmlFilePath, "utf8");
    return new Response(html, {
      headers: {
        "cache-control": "no-store",
        "content-type": "text/html; charset=UTF-8",
      },
      status: 200,
    });
  } catch {
    return new Response("Not Found", {
      headers: {
        "content-type": "text/plain; charset=UTF-8",
      },
      status: 404,
    });
  }
}
