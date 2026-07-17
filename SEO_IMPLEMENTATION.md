# SEO and production implementation

## Baseline audit

The original site was a six-file static Vercel project with two large PNG assets. It had a visually premium direction but relied on six remote Unsplash CSS backgrounds and `lucide@latest`, hid reveal content before JavaScript succeeded, used invalid FAQ buttons containing paragraphs and submitted enquiries through `mailto:`. The mobile menu did not handle Escape or focus return. Metadata referenced `weburate.com`, lacked canonical and social metadata on internal pages, and had no sitemap, robots file, 404 page, manifest, social image or structured data.

The original homepage also presented unsupported claims: 40+ sites, a 4.9/5 rating, 6+ years, 15+ industries, four named clients, three testimonials and numerical growth results. It mixed a broad list of services with no focused service architecture. Legal content described the old mailto workflow and omitted several commercial boundaries. Security headers and a real contact endpoint were absent.

## Implemented architecture

- Canonical production domain is `https://weburate.online/` throughout metadata, JSON-LD, robots and sitemap.
- Homepage is the central brand and conversion page.
- Five distinct service pages and three distinct industry pages use unique metadata, H1s, useful content, internal links, breadcrumbs and structured data.
- Insights index is indexable. Three useful editorial drafts have Article data but remain `noindex,follow` pending owner review and are excluded from the sitemap.
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
