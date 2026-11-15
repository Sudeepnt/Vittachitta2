import fs from "node:fs/promises";
import path from "node:path";

const PROJECT_ROOT = process.cwd();
const CLONE_PAGES_ROOT = path.join(PROJECT_ROOT, ".clone", "pages");
const PUBLIC_ROOT = path.join(PROJECT_ROOT, "public");

const SOURCE_HOST = process.env.SNAPSHOT_SOURCE_HOST?.trim();
if (!SOURCE_HOST) {
  throw new Error(
    "SNAPSHOT_SOURCE_HOST is required. Local-only mode is enabled and no default remote host is configured."
  );
}
const SOURCE_HOST_WWW = `www.${SOURCE_HOST}`;
const SOURCE_WPE_HOST = `${SOURCE_HOST.replace(/\.com$/, "")}.wpenginepowered.com`;
const SOURCE_WP_HOST = `${SOURCE_HOST.replace(/\.com$/, "")}.wpengine.com`;

const ORIGIN = `https://${SOURCE_HOST}`;
const TARGET_HOSTS = new Set([SOURCE_HOST, SOURCE_HOST_WWW, SOURCE_WPE_HOST, SOURCE_WP_HOST]);

const MAX_PAGES = 200;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";

const SEED_PATHS = [
  "/",
  "/story/",
  "/expertise/",
  "/leadership/",
  "/affiliations/",
  "/news-and-insights/",
  "/careers/",
  "/leadership/agnes-tang/",
  "/news/1q25-quarterly-update/",
];

const ORIGIN_LITERALS = [SOURCE_HOST, SOURCE_HOST_WWW, SOURCE_WPE_HOST, SOURCE_WP_HOST].flatMap(
  (host) => [`https://${host}`, `http://${host}`, `//${host}`]
);

function ensureTrailingSlash(pathnameValue) {
  if (!pathnameValue || pathnameValue === "/") {
    return "/";
  }
  return pathnameValue.endsWith("/") ? pathnameValue : `${pathnameValue}/`;
}

function safeJoin(root, pathnameValue) {
  const clean = pathnameValue.replace(/^\/+/, "");
  const absolutePath = path.join(root, clean);
  const relative = path.relative(root, absolutePath);
  if (relative.startsWith("..")) {
    throw new Error(`Unsafe path: ${pathnameValue}`);
  }
  return absolutePath;
}

function isCrawlablePage(urlObject) {
  if (!TARGET_HOSTS.has(urlObject.hostname)) {
    return false;
  }

  if (path.extname(urlObject.pathname)) {
    return false;
  }

  if (
    urlObject.pathname.startsWith("/wp-") ||
    urlObject.pathname.startsWith("/xmlrpc") ||
    urlObject.pathname.startsWith("/feed") ||
    urlObject.pathname.startsWith("/author")
  ) {
    return false;
  }

  return true;
}

function isTargetAsset(urlObject) {
  if (!TARGET_HOSTS.has(urlObject.hostname)) {
    return false;
  }

  if (urlObject.pathname.startsWith("/wp-content/") || urlObject.pathname.startsWith("/wp-includes/")) {
    return true;
  }

  return false;
}

function maybeToAbsoluteUrl(rawValue, baseUrl) {
  const value = rawValue.trim().replace(/^['"]|['"]$/g, "");
  if (!value || value.startsWith("#")) {
    return null;
  }
  if (
    value.startsWith("data:") ||
    value.startsWith("javascript:") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:")
  ) {
    return null;
  }

  try {
    return new URL(value, baseUrl);
  } catch {
    return null;
  }
}

function extractCandidateUrls(text) {
  const found = new Set();

  const attrRegex = /(src|href|poster|data-src)\s*=\s*(["'])(.*?)\2/gi;
  for (const match of text.matchAll(attrRegex)) {
    found.add(match[3]);
  }

  const srcsetRegex = /srcset\s*=\s*(["'])(.*?)\1/gi;
  for (const match of text.matchAll(srcsetRegex)) {
    const candidates = match[2].split(",");
    for (const part of candidates) {
      const firstToken = part.trim().split(/\s+/)[0];
      if (firstToken) {
        found.add(firstToken);
      }
    }
  }

  const cssUrlRegex = /url\(([^)]+)\)/gi;
  for (const match of text.matchAll(cssUrlRegex)) {
    found.add(match[1].trim());
  }

  const importRegex = /@import\s+(?:url\()?(["'])(.*?)\1\)?/gi;
  for (const match of text.matchAll(importRegex)) {
    found.add(match[2]);
  }

  return found;
}

function rewriteToLocal(text) {
  let rewritten = text;
  for (const origin of ORIGIN_LITERALS) {
    rewritten = rewritten.split(origin).join("");
    const escaped = origin.replace(/\//g, "\\/");
    rewritten = rewritten.split(escaped).join("");
  }
  return rewritten;
}

function outputHtmlPath(pathnameValue) {
  const normalized = ensureTrailingSlash(pathnameValue);
  if (normalized === "/") {
    return path.join(CLONE_PAGES_ROOT, "index.html");
  }
  const segment = normalized.replace(/^\/+/, "");
  return path.join(CLONE_PAGES_ROOT, segment, "index.html");
}

function looksLikeTextAsset(contentType, extension) {
  if (
    contentType.startsWith("text/") ||
    contentType.includes("javascript") ||
    contentType.includes("json") ||
    contentType.includes("xml")
  ) {
    return true;
  }

  return [".css", ".js", ".json", ".map", ".svg", ".txt", ".xml"].includes(extension);
}

async function fetchUrl(url) {
  return fetch(url, {
    redirect: "follow",
    headers: {
      "user-agent": USER_AGENT,
      "accept-language": "en-US,en;q=0.9",
    },
  });
}

async function prepareDirectories() {
  await fs.rm(CLONE_PAGES_ROOT, { recursive: true, force: true });
  await fs.rm(path.join(PUBLIC_ROOT, "wp-content"), { recursive: true, force: true });
  await fs.rm(path.join(PUBLIC_ROOT, "wp-includes"), { recursive: true, force: true });
  await fs.mkdir(CLONE_PAGES_ROOT, { recursive: true });
}

async function buildSnapshot() {
  await prepareDirectories();

  const pageQueue = [];
  const seenPages = new Set();
  const assetQueue = [];
  const seenAssets = new Set();

  function enqueuePage(urlObject) {
    const normalizedPathname = ensureTrailingSlash(urlObject.pathname);
    if (seenPages.has(normalizedPathname)) {
      return;
    }
    if (seenPages.size >= MAX_PAGES) {
      return;
    }
    seenPages.add(normalizedPathname);
    pageQueue.push(new URL(normalizedPathname, ORIGIN).toString());
  }

  function enqueueAsset(urlObject) {
    const assetKey = urlObject.pathname;
    if (seenAssets.has(assetKey)) {
      return;
    }
    seenAssets.add(assetKey);
    assetQueue.push(urlObject.toString());
  }

  for (const seedPath of SEED_PATHS) {
    enqueuePage(new URL(seedPath, ORIGIN));
  }

  while (pageQueue.length > 0) {
    const pageUrl = pageQueue.shift();
    const pageResponse = await fetchUrl(pageUrl);
    if (!pageResponse.ok) {
      console.warn(`Failed page: ${pageUrl} (${pageResponse.status})`);
      continue;
    }

    const contentType = (pageResponse.headers.get("content-type") || "").toLowerCase();
    if (!contentType.includes("text/html")) {
      continue;
    }

    const pageHtml = await pageResponse.text();
    const pageHtmlLocal = rewriteToLocal(pageHtml);
    const urlObject = new URL(pageUrl);
    const htmlPath = outputHtmlPath(urlObject.pathname);

    await fs.mkdir(path.dirname(htmlPath), { recursive: true });
    await fs.writeFile(htmlPath, pageHtmlLocal, "utf8");

    for (const raw of extractCandidateUrls(pageHtml)) {
      const absolute = maybeToAbsoluteUrl(raw, pageUrl);
      if (!absolute) {
        continue;
      }

      if (isTargetAsset(absolute)) {
        enqueueAsset(absolute);
        continue;
      }

      if (isCrawlablePage(absolute)) {
        enqueuePage(absolute);
      }
    }
  }

  while (assetQueue.length > 0) {
    const assetUrl = assetQueue.shift();
    const assetResponse = await fetchUrl(assetUrl);
    if (!assetResponse.ok) {
      console.warn(`Failed asset: ${assetUrl} (${assetResponse.status})`);
      continue;
    }

    const urlObject = new URL(assetUrl);
    const extension = path.extname(urlObject.pathname).toLowerCase();
    const contentType = (assetResponse.headers.get("content-type") || "").toLowerCase();
    const outputPath = safeJoin(PUBLIC_ROOT, urlObject.pathname);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    if (looksLikeTextAsset(contentType, extension)) {
      const body = await assetResponse.text();
      const rewritten = rewriteToLocal(body);
      await fs.writeFile(outputPath, rewritten, "utf8");

      if (extension === ".css") {
        for (const raw of extractCandidateUrls(rewritten)) {
          const absolute = maybeToAbsoluteUrl(raw, assetUrl);
          if (absolute && isTargetAsset(absolute)) {
            enqueueAsset(absolute);
          }
        }
      }
      continue;
    }

    const binary = Buffer.from(await assetResponse.arrayBuffer());
    await fs.writeFile(outputPath, binary);
  }

  console.log(`Snapshot complete: ${seenPages.size} pages, ${seenAssets.size} assets`);
}

await buildSnapshot();
