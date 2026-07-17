# Performance audit

## Likely Largest Contentful Paint element

The homepage H1 is the likely LCP element. The adjacent interface artwork is CSS-generated and does not require an image download. The only above-the-fold image is the 7.5 KB WebP logo with explicit width and height.

## Main risks reviewed

- A large desktop heading could push actions below the fold; the responsive type scale was reduced and checked at required widths.
- Long-lived immutable caching requires versioned filenames; production CSS now uses `site.20260717-3.css`.
- A floating WhatsApp control can cover content on small screens; it now returns to normal document flow below 980 px.
- Optional analytics creates third-party work only when a valid ID is configured.
- The social image and manifest icons are not loaded by the visible homepage layout.

## Changes retained or made

- Local system fonts; no font downloads or blocking font CSS.
- Local WebP logo and CSS artwork; no Unsplash or unversioned CDN scripts.
- Explicit logo dimensions and small production asset sizes.
- Content visible before JavaScript and when JavaScript fails.
- Reduced-motion handling and lightweight reveal transitions.
- Immutable caching for versioned assets and revalidation for HTML.
- Removed unused legacy CSS, JavaScript and duplicate favicon files.

## Verification

The content and conversion phase was re-audited against the final local clean-URL preview with Lighthouse 12.8.2 on 17 July 2026:

- Performance: 100
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- Largest Contentful Paint: 0.9 s
- Cumulative Layout Shift: 0
- Total Blocking Time: 0 ms
- Interaction to Next Paint: not measured by this navigation-only lab run

The expanded homepage was also checked at 320, 360, 375, 390, 430, 768, 1024, 1280 and 1440 CSS pixels. The final layout produced no horizontal overflow, out-of-bounds visible controls or missing images. Process, portfolio and pricing grids collapse at their intended breakpoints.

Run Lighthouse and PageSpeed Insights again after deployment. Field Core Web Vitals remain required because a local lab test cannot measure real-user INP, network conditions or serverless cold starts.
