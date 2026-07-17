# Weburate launch checklist

## Must complete before deployment

- [ ] Confirm `https://weburate.online/` is the final primary domain.
- [ ] Confirm the public phone number: `+91 62644 49774`.
- [ ] Confirm the public email: `weburateinfotech@gmail.com`.
- [ ] Confirm the Instagram URL: `https://www.instagram.com/weburateinfotech/`.
- [ ] Confirm the four indicative package prices, inclusions, revisions and delivery estimates.
- [ ] Confirm that concept projects remain clearly labelled until genuine portfolio permission and evidence are supplied.
- [ ] Confirm the contact-form recipient and verified sender.
- [ ] Add `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` to Vercel.
- [ ] Keep `CONTACT_DEV_MODE` unset or `false` in Production.
- [ ] Configure a Vercel Firewall rate-limit rule for `/api/contact`, or document the durable external limiter selected.
- [ ] Test contact validation, delivery, reply-to behaviour and failure fallback.
- [ ] Test the mobile site at 320, 360, 375, 390, 430, 768, 1024, 1280 and 1440 CSS pixels.
- [ ] Validate every JSON-LD page listed in `STRUCTURED_DATA_TESTING.md`.
- [ ] Validate `sitemap.xml` and confirm every listed URL returns 200 without redirecting.
- [ ] Validate `robots.txt` and its sitemap declaration.
- [ ] Run Lighthouse for Performance, Accessibility, Best Practices and SEO.
- [ ] Complete keyboard-only and screen-reader spot checks.
- [ ] Check every internal, WhatsApp, phone, email and Instagram link.
- [ ] Have the owner or a qualified adviser review the Privacy Policy and Terms.

## Complete after deployment

- [ ] Verify HTTPS on the primary domain.
- [ ] Confirm the apex and `www` domains redirect to one primary URL without a loop.
- [ ] Inspect canonical tags in the deployed source; confirm extensionless production URLs.
- [ ] Open `https://weburate.online/sitemap.xml` and verify all responses.
- [ ] Open `https://weburate.online/robots.txt`.
- [ ] Verify the domain property in Google Search Console.
- [ ] Submit the sitemap in Google Search Console.
- [ ] Inspect and request indexing for the homepage, service pages and industry pages.
- [ ] Configure GA4 only after the measurement and consent decision is approved.
- [ ] Configure Microsoft Clarity only after the measurement and consent decision is approved.
- [ ] Test every analytics event without sending form values or other personal data.
- [ ] Test the contact form on production.
- [ ] Review serverless delivery logs without logging or exposing personal information.
- [ ] Run PageSpeed Insights on the homepage and a representative service page.
- [ ] Monitor Search Console coverage and enhancement reports.
- [ ] Monitor real-user Core Web Vitals.
- [ ] Create consistent real business profiles where appropriate.
- [ ] Ask genuine clients for honest reviews without scripts or incentives.
- [ ] Publish useful content regularly only after owner review.

## Owner content still required

- [ ] Complete `CONTENT_TODO.md`.
- [ ] Supply verified client work and display permission before publishing case studies.
- [ ] Confirm founder or team details and the real service area before adding them.
- [ ] Confirm a domain email before replacing the current Gmail address.
- [ ] Review the noindex insight drafts before deciding whether to publish them.
