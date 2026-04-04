import { readFile } from "node:fs/promises";
import path from "node:path";

const PROJECT_ROOT = process.cwd();
const PAGES_ROOT = path.join(PROJECT_ROOT, ".clone", "pages");
const PUBLIC_ROOT = path.join(PROJECT_ROOT, "public");
const UPLOADS_PREFIX = "/wp-content/uploads/";
const SINGLE_UPLOAD_VIDEO_PATH = "/wp-content/uploads/2020/07/200730_Cera3d_Investing_BG.mp4";
const SINGLE_LOGO_PATH = "/wp-content/themes/accupress/assets/media/Menu_CeraLogo.png";

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

const TEXT_ASSET_EXTENSIONS = new Set([
  ".css",
  ".js",
  ".json",
  ".map",
  ".txt",
  ".xml",
]);

const LOCAL_ONLY_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self' data: blob:",
  "connect-src 'self'",
  "frame-src 'self'",
  "worker-src 'self' blob:",
  "navigate-to 'self'",
].join("; ");

function securityHeaders() {
  return {
    "content-security-policy": LOCAL_ONLY_CSP,
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
  };
}

function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url) || /^\/\//.test(url);
}

function neutralizeExternalSrcset(srcsetValue: string) {
  const kept = srcsetValue
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .filter((entry) => {
      const [url] = entry.split(/\s+/, 1);
      return !isExternalUrl(url ?? "");
    });
  return kept.join(", ");
}

function sanitizeHtmlForLocalOnly(html: string) {
  let sanitized = html;

  // Ensure the top logo/wordmark always routes to homepage.
  sanitized = sanitized.replace(
    /<a([^>]*class=["'][^"']*header__logo[^"']*["'][^>]*?)href=["'][^"']*["']([^>]*)>/gi,
    '<a$1href="/"$2>'
  );

  // UI-only clone mode: collapse all upload videos to one shared local video.
  sanitized = sanitized.replace(
    /\/wp-content\/uploads\/[A-Za-z0-9@%_./+-]+\.(mp4|webm|mov|m4v)/gi,
    SINGLE_UPLOAD_VIDEO_PATH
  );
  // Non-video upload assets (images/pdfs/etc.) use one static local logo.
  sanitized = sanitized.replace(
    /\/wp-content\/uploads\/[A-Za-z0-9@%_./+-]+\.(?!mp4|webm|mov|m4v)[A-Za-z0-9]+/gi,
    SINGLE_LOGO_PATH
  );

  sanitized = sanitized.replace(
    /<script\b[^>]*\bsrc\s*=\s*["'](?:https?:\/\/|\/\/)[^"']*["'][^>]*>\s*<\/script>/gi,
    ""
  );

  sanitized = sanitized.replace(
    /\b(href|src|action|poster|data-src)\s*=\s*(["'])(https?:\/\/|\/\/)([^"']*)\2/gi,
    (_match, attributeName: string, quote: string) => {
      const fallback = attributeName.toLowerCase() === "href" ? "#" : "";
      return `${attributeName}=${quote}${fallback}${quote}`;
    }
  );

  sanitized = sanitized.replace(/\b(href|action)\s*=\s*(["'])(mailto:|tel:)[^"']*\2/gi, (_match, attributeName: string, quote: string) => {
    return `${attributeName}=${quote}#${quote}`;
  });

  sanitized = sanitized.replace(/\bsrcset\s*=\s*(["'])([^"']*)\1/gi, (_match, quote: string, value: string) => {
    const localOnly = neutralizeExternalSrcset(value);
    return `srcset=${quote}${localOnly}${quote}`;
  });

  return sanitized;
}

function sanitizeTextAssetForLocalOnly(text: string) {
  let sanitized = text;

  sanitized = sanitized.replace(
    /\/wp-content\/uploads\/[A-Za-z0-9@%_./+-]+\.(mp4|webm|mov|m4v)/gi,
    SINGLE_UPLOAD_VIDEO_PATH
  );
  sanitized = sanitized.replace(
    /\/wp-content\/uploads\/[A-Za-z0-9@%_./+-]+\.(?!mp4|webm|mov|m4v)[A-Za-z0-9]+/gi,
    SINGLE_LOGO_PATH
  );
  sanitized = sanitized.replace(/@import\s+(?:url\()?["']?(?:https?:\/\/|\/\/)[^"')]+["']?\)?\s*;?/gi, "");
  sanitized = sanitized.replace(/url\(\s*["']?(?:https?:\/\/|\/\/)[^"')]+["']?\s*\)/gi, 'url("")');

  return sanitized;
}

function isUploadsAssetPath(pathnameValue: string) {
  return pathnameValue.startsWith(UPLOADS_PREFIX);
}

function isVideoExtension(pathnameValue: string) {
  return [".mp4", ".webm", ".mov", ".m4v"].includes(path.extname(pathnameValue).toLowerCase());
}

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
      if (isUploadsAssetPath(pathnameValue)) {
        if (isVideoExtension(pathnameValue)) {
          const sharedVideoAsset = await readFile(filePathForPublicAsset(SINGLE_UPLOAD_VIDEO_PATH));
          return new Response(sharedVideoAsset, {
            headers: {
              ...securityHeaders(),
              "cache-control": "public, max-age=31536000, immutable",
              "content-type": "video/mp4",
            },
            status: 200,
          });
        }

        const logoAsset = await readFile(filePathForPublicAsset(SINGLE_LOGO_PATH));
        return new Response(logoAsset, {
          headers: {
            ...securityHeaders(),
            "cache-control": "public, max-age=31536000, immutable",
            "content-type": "image/png",
          },
          status: 200,
        });
      }

      const assetFilePath = filePathForPublicAsset(pathnameValue);
      const extension = path.extname(pathnameValue).toLowerCase();
      const headers = {
        ...securityHeaders(),
        "cache-control": "public, max-age=31536000, immutable",
        "content-type": contentTypeForAsset(pathnameValue),
      };

      if (TEXT_ASSET_EXTENSIONS.has(extension)) {
        const textAsset = await readFile(assetFilePath, "utf8");
        const sanitizedAsset = sanitizeTextAssetForLocalOnly(textAsset);
        return new Response(sanitizedAsset, {
          headers,
          status: 200,
        });
      }

      const asset = await readFile(assetFilePath);
      return new Response(asset, {
        headers,
        status: 200,
      });
    } catch {
      return new Response("Not Found", {
        headers: {
          ...securityHeaders(),
          "content-type": "text/plain; charset=UTF-8",
        },
        status: 404,
      });
    }
  }

  try {
    const htmlFilePath = htmlFilePathForRoute(pathnameValue);
    const html = await readFile(htmlFilePath, "utf8");
    const sanitizedHtml = sanitizeHtmlForLocalOnly(html);
    return new Response(sanitizedHtml, {
      headers: {
        ...securityHeaders(),
        "cache-control": "no-store",
        "content-type": "text/html; charset=UTF-8",
      },
      status: 200,
    });
  } catch {
    return new Response("Not Found", {
      headers: {
        ...securityHeaders(),
        "content-type": "text/plain; charset=UTF-8",
      },
      status: 404,
    });
  }
}
