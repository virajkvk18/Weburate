# SEO and production implementation

## Baseline audit

The original site was a six-file static Vercel project with two large PNG assets. It had a visually premium direction but relied on six remote Unsplash CSS backgrounds and `lucide@latest`, hid reveal content before JavaScript succeeded, used invalid FAQ buttons containing paragraphs and submitted enquiries through `mailto:`. The mobile menu did not handle Escape or focus return. Metadata referenced `weburate.com`, lacked canonical and social metadata on internal pages, and had no sitemap, robots file, 404 page, manifest, social image or structured data.

The original homepage also presented unsupported claims: 40+ sites, a 4.9/5 rating, 6+ years, 15+ industries, four named clients, three testimonials and numerical growth results. It mixed a broad list of services with no focused service architecture. Legal content described the old mailto workflow and omitted several commercial boundaries. Security headers and a real contact endpoint were absent.

## Implemented architecture

- Canonical production domain is `https://weburate.online/` throughout metadata, JSON-LD, robots and sitemap.
- Homepage is the central brand and conversion page.
- Five distinct service pages and three distinct industry pages use unique metadata, H1s, useful content, internal links, breadcrumbs and structured data.
- The insights index and three useful editorial drafts remain `noindex,follow` pending owner review and are excluded from the sitemap. Draft articles retain Article data for testing before publication.
- Privacy and Terms are readable, canonical and linked site-wide.
- Concept cards replace unsupported portfolio claims. The case-study template is `noindex,nofollow` and excluded from the sitemap.

## Technical implementation

- Website and Organization JSON-LD use only the existing name, domain, logo, telephone, Gmail and Instagram profile. No address, LocalBusiness, reviews or ratings were added.
- Service pages have Service and BreadcrumbList data. Industry, insight and article pages have BreadcrumbList; draft articles also have Article data.
- `robots.txt` allows normal crawling and declares the production sitemap.
- `sitemap.xml` contains only intended indexable production pages.
- Local optimised logo, favicon, touch, manifest and 1200 × 630 sharing assets replace oversized or external display dependencies.
- Versioned CSS and JavaScript are cacheable for one year; HTML revalidates and the API is no-store.
- CSP, HSTS, MIME sniffing prevention, strict referrer policy, permissions restrictions and frame protection are defined in `vercel.json`.

## Content rules for future changes

Use one canonical URL and one H1 per page. Write a unique title and description. Keep claims visible and supportable. Add a URL to the sitemap only after it is complete, indexable and canonical. Update JSON-LD whenever visible business facts change. Never publish a city page, client result, review, address, credential or ranking promise without verified owner input.

## Post-implementation audit

- Canonicals, internal links, JSON-LD URLs and the sitemap use Vercel's extensionless clean URLs, avoiding redirecting `.html` URLs in search signals.
- The original service charges are retained: Custom Basic INR 6,000, Starter INR 6,999, Growth INR 15,000 and Premium INR 25,000+.
- Pricing now states scope, timelines, revision limits, support boundaries, exclusions and client responsibilities without ranking guarantees.
- The contact endpoint rejects untrusted production origins, strips line breaks from email header inputs, escapes HTML, enforces an input allowlist and keeps recipients server-controlled.
- The automated audit checks sitemap membership, metadata uniqueness, canonical alignment, JSON-LD parsing, internal files and anchors, analytics placeholders and common mojibake patterns.

## Content and conversion phase

- Weburate is positioned as a practical website development service for small businesses, professionals, startups and local service providers.
- Unsupported numerical social proof remains removed. Trust content describes observable working practices and clearly scoped service qualities.
- The homepage concept portfolio identifies every item as a demo or concept and avoids client or outcome claims.
- Service pages separately document intended customers, typical scope, inclusions, exclusions, process, price factors, client inputs and post-launch boundaries.
- Industry pages contain distinct customer needs, recommended sections, features, calls to action, content responsibilities and realistic example scope.
- The case-study template moved to `portfolio/case-study-template.html`; it remains `noindex`, unlinked from public navigation and excluded from the sitemap.
- Insight drafts were expanded for practical owner review but remain `noindex,follow` until approved.
