# Weburate launch checklist

## Required owner and Vercel actions

- [ ] Confirm `https://weburate.online/` is the final primary production domain.
- [ ] Add both apex and `www` domains in Vercel; choose one primary and redirect the alternative to it without a loop.
- [ ] Confirm the Vercel preview domain is never used as a canonical URL.
- [ ] Confirm HTTPS, HSTS and every production redirect.
- [ ] Set `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` in Vercel; redeploy and test delivery.
- [ ] Set up and verify a domain email before publishing it anywhere.
- [ ] Verify the property in Google Search Console.
- [ ] Submit `https://weburate.online/sitemap.xml`.
- [ ] Inspect and request indexing for the homepage, core service pages and industry pages.
- [ ] Configure GA4 only after confirming the measurement and consent plan.
- [ ] Configure Microsoft Clarity only after confirming the measurement and consent plan.
- [ ] Create or update a Google Business Profile only when the real business is eligible.
- [ ] Create consistent real LinkedIn, Instagram and other profiles; do not create fake profiles.
- [ ] Replace concept work with genuine projects only after evidence and display permission are available.
- [ ] Request genuine client reviews without incentives or scripted outcomes.
- [ ] Build links through real work, partnerships, directories and useful content—not purchased or fabricated links.
- [ ] Monitor Search Console coverage, security issues and Core Web Vitals after launch.

## Content and legal

- [ ] Complete `CONTENT_TODO.md`.
- [ ] Owner or qualified adviser reviews the Privacy Policy and Terms for the actual business and applicable law.
- [ ] Review pricing and scope; confirm that all public claims remain accurate.
- [ ] Review editorial drafts, verify any time-sensitive facts or prices, then remove `noindex` and add approved articles to the sitemap.

## Browser and accessibility release pass

- [ ] Test at 320, 375, 390, 768, 1024 and 1440 CSS pixels.
- [ ] Confirm no horizontal scroll, overlap, clipped focus or unreadable headings.
- [ ] Test menu open/close, link selection, outside click, Escape and returned focus.
- [ ] Navigate every page using keyboard only; verify visible focus and logical order.
- [ ] Test FAQ details using Enter and Space.
- [ ] Test form validation, error focus, loading, success, duplicate-submit prevention and provider failure.
- [ ] Test WhatsApp, phone, email and all internal links on production.
- [ ] Check the browser console for errors and unhandled rejections.
- [ ] Run Lighthouse on representative mobile and desktop pages; review field data after enough real traffic exists.
- [ ] Validate structured data using Google’s Rich Results Test or Schema.org validator.
- [ ] Confirm sitemap URLs return 200, an unknown URL returns 404, and no mixed content exists.

## Analytics verification, if enabled

- [ ] Confirm empty IDs load no analytics requests.
- [ ] Verify configured IDs in GA4 DebugView and Clarity.
- [ ] Confirm conversion events fire once and contain no form values.
- [ ] Update the Privacy Policy if actual collection or providers change.
