const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const productionOrigin = "https://weburate.online";
const errors = [];
const requiredFiles = [
  "index.html", "privacy.html", "terms.html", "404.html", "robots.txt",
  "sitemap.xml", "site.webmanifest", "vercel.json", "api/contact.js",
  "assets/css/site.20260717-2.css", "assets/js/site.20260717-2.js",
  "assets/js/analytics-config.js", "assets/social/weburate-social-1200x630.png",
];

function fail(message) { errors.push(message); }
function read(relativePath) { return fs.readFileSync(path.join(root, relativePath), "utf8"); }
function count(source, regex) { return [...source.matchAll(regex)].length; }
function attribute(source, regex) { return source.match(regex)?.[1] || ""; }
function fileForCleanPath(urlPath) {
  if (urlPath === "/") return path.join(root, "index.html");
  const clean = decodeURIComponent(urlPath).replace(/^\/+|\/+$/g, "");
  const direct = path.join(root, clean);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  if (fs.existsSync(`${direct}.html`)) return `${direct}.html`;
  if (fs.existsSync(path.join(direct, "index.html"))) return path.join(direct, "index.html");
  return direct;
}
function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if ([".git", "node_modules", ".vercel"].includes(entry.name)) return [];
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

for (const file of requiredFiles) if (!fs.existsSync(path.join(root, file))) fail(`Missing required file: ${file}`);

const sitemap = read("sitemap.xml");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (!sitemapUrls.length) fail("Sitemap has no URLs");
if (new Set(sitemapUrls).size !== sitemapUrls.length) fail("Sitemap contains duplicate URLs");

const titles = new Map();
const descriptions = new Map();
for (const url of sitemapUrls) {
  let parsed;
  try { parsed = new URL(url); } catch { fail(`Invalid sitemap URL: ${url}`); continue; }
  if (parsed.origin !== productionOrigin || parsed.protocol !== "https:") fail(`Wrong sitemap origin: ${url}`);
  if (parsed.search || parsed.hash) fail(`Sitemap URL has a query or fragment: ${url}`);
  if (parsed.pathname.endsWith(".html")) fail(`Sitemap URL is not the clean production URL: ${url}`);
  const file = fileForCleanPath(parsed.pathname);
  if (!fs.existsSync(file)) { fail(`Sitemap URL has no file: ${url}`); continue; }
  const html = fs.readFileSync(file, "utf8");
  const relative = path.relative(root, file).replaceAll("\\", "/");
  const title = attribute(html, /<title>([^<]+)<\/title>/i);
  const description = attribute(html, /<meta name="description" content="([^"]+)"/i);
  const canonical = attribute(html, /<link rel="canonical" href="([^"]+)"/i);
  if (count(html, /<h1\b/gi) !== 1) fail(`${relative}: expected exactly one H1`);
  if (!title) fail(`${relative}: missing title`);
  if (!description) fail(`${relative}: missing meta description`);
  if (canonical !== url) fail(`${relative}: canonical ${canonical || "missing"} does not match ${url}`);
  if (/name="robots" content="[^"]*noindex/i.test(html)) fail(`${relative}: sitemap page is noindex`);
  if (titles.has(title)) fail(`${relative}: duplicate title with ${titles.get(title)}`); else titles.set(title, relative);
  if (descriptions.has(description)) fail(`${relative}: duplicate description with ${descriptions.get(description)}`); else descriptions.set(description, relative);
  for (const required of ["og:title", "og:description", "og:url", "og:image"]) if (!html.includes(`property="${required}"`)) fail(`${relative}: missing ${required}`);
  for (const required of ["twitter:card", "twitter:title", "twitter:description", "twitter:image"]) if (!html.includes(`name="${required}"`)) fail(`${relative}: missing ${required}`);
}

const htmlFiles = walk(root).filter((file) => file.endsWith(".html"));
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const relative = path.relative(root, file).replaceAll("\\", "/");
  const canonical = attribute(html, /<link rel="canonical" href="([^"]+)"/i) || `${productionOrigin}/`;
  if (/[âÃÂ]|ï¿½|�/.test(html)) fail(`${relative}: possible mojibake remains`);
  try {
    const canonicalUrl = new URL(canonical);
    if (canonicalUrl.pathname.endsWith(".html") || (canonicalUrl.pathname !== "/" && canonicalUrl.pathname.endsWith("/"))) fail(`${relative}: canonical URL would redirect`);
  } catch { fail(`${relative}: invalid canonical URL`); }
  for (const block of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    try { const data = JSON.parse(block[1]); if (data["@context"] !== "https://schema.org") fail(`${relative}: wrong JSON-LD context`); }
    catch { fail(`${relative}: invalid JSON-LD`); }
  }
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const href = match[1];
    if (/^(mailto:|tel:|https:\/\/wa\.me\/|https:\/\/www\.instagram\.com\/)/.test(href)) continue;
    let resolved;
    try { resolved = new URL(href, canonical); } catch { fail(`${relative}: invalid link ${href}`); continue; }
    if (resolved.origin !== productionOrigin) continue;
    if (resolved.pathname.endsWith(".html")) fail(`${relative}: internal link uses a redirected .html URL: ${href}`);
    const target = fileForCleanPath(resolved.pathname);
    if (!fs.existsSync(target)) { fail(`${relative}: broken internal link ${href}`); continue; }
    if (resolved.hash) {
      const targetHtml = fs.readFileSync(target, "utf8");
      const id = decodeURIComponent(resolved.hash.slice(1));
      if (id && !new RegExp(`\\sid=["']${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`).test(targetHtml)) fail(`${relative}: missing anchor ${href}`);
    }
  }
  for (const match of html.matchAll(/<img[^>]+src="([^"]+)"/g)) {
    const src = match[1];
    const target = src.startsWith("/") ? path.join(root, src.slice(1)) : path.resolve(path.dirname(file), src);
    if (!fs.existsSync(target)) fail(`${relative}: missing image ${src}`);
  }
}

const productionTextFiles = ["index.html", "privacy.html", "terms.html", "404.html", "robots.txt", "sitemap.xml", "vercel.json", "assets/css/site.20260717-2.css", "assets/js/site.20260717-2.js", "assets/js/analytics-config.js"];
const productionText = productionTextFiles.map(read).join("\n");
if (/weburate\.com(?![a-z])/i.test(productionText)) fail("Old weburate.com reference remains in production files");
if (/WebUrate/.test(productionText)) fail("Inconsistent WebUrate spelling remains");
if (/https?:\/\/(?:localhost|127\.0\.0\.1)/i.test(productionText)) fail("Development URL remains in production files");
if (/\.vercel\.app/i.test(productionText)) fail("Vercel preview URL remains in production files");
const analyticsConfig = read("assets/js/analytics-config.js");
const ga4Id = attribute(analyticsConfig, /ga4Id:\s*"([^"]*)"/);
const clarityId = attribute(analyticsConfig, /clarityId:\s*"([^"]*)"/);
if (ga4Id && !/^G-[A-Z0-9]+$/.test(ga4Id)) fail("Invalid or placeholder GA4 ID remains");
if (clarityId && !/^[a-z0-9]+$/i.test(clarityId)) fail("Invalid or placeholder Clarity ID remains");

const robots = read("robots.txt");
if (!robots.includes(`Sitemap: ${productionOrigin}/sitemap.xml`)) fail("robots.txt has the wrong sitemap URL");
if (/Disallow:\s*\//i.test(robots)) fail("robots.txt blocks crawling");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`PASS: ${sitemapUrls.length} sitemap URLs and ${htmlFiles.length} HTML files audited with no errors.`);
