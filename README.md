# Weburate static website

Production-oriented static HTML, CSS and vanilla JavaScript for `https://weburate.online/`, deployed on Vercel. The only server-side component is the contact email function in `api/contact.js`.

## Local preview

Use `npm run preview`, then open `http://localhost:4173`. A basic static preview cannot execute the Vercel API function; use `npx vercel dev` when testing email delivery locally.

## Deploy to Vercel

Import the repository as a Vercel project. The repository has no framework build step and uses the project root as its output directory. Set the environment variables below for Production and Preview as appropriate, deploy, then configure the primary domain and redirects described in `LAUNCH_CHECKLIST.md`.

## Contact form and Resend

1. Create a Resend account and verify a sending domain you control.
2. Create a Resend API key.
3. Add these Vercel environment variables (never add their values to this repository):
   - `RESEND_API_KEY`: server-side Resend key.
   - `CONTACT_TO_EMAIL`: inbox that receives enquiries.
   - `CONTACT_FROM_EMAIL`: verified sender such as `Weburate Website <forms@your-verified-domain.example>`.
4. Redeploy and submit a real test enquiry. Confirm delivery, reply-to behaviour and the failure fallback.

Until those variables are configured, the form returns a safe setup error and offers the existing Gmail and WhatsApp contact methods.

## Optional analytics

Edit `assets/js/analytics-config.js` and set a public GA4 measurement ID (`G-...`) and/or a Microsoft Clarity project ID. An empty value loads nothing. The loader records only named conversion events; it never sends form-field values. Before enabling a provider, confirm applicable consent requirements and ensure the Privacy Policy matches the actual configuration.

Tracked events: `whatsapp_header`, `whatsapp_hero`, `whatsapp_floating`, `phone_click`, `email_click`, `pricing_cta`, `portfolio_click`, `contact_form_start`, `contact_form_success`, and `contact_form_error`. Add `data-event="portfolio_click"` to verified portfolio links when genuine case studies are published.

## Portfolio and case studies

The current homepage shows demonstration concepts because the repository contained no verifiable client evidence. Gather the items in `CONTENT_TODO.md`, copy `templates/case-study-template.html`, replace every bracketed field, remove `noindex` only after owner approval, link it from the homepage and add its canonical URL to `sitemap.xml`.

## Sitemap and structured data

Use absolute `https://weburate.online/` URLs. Add only canonical, indexable, production pages to `sitemap.xml`; exclude 404s, editorial drafts, templates and thank-you pages. Keep homepage Organization data and each Service/Breadcrumb graph consistent with visible page content.

## Versioned assets

Production pages load dated CSS and JavaScript files. When either changes, create a new dated filename, update page references and Vercel cache paths if needed. Do not replace a long-cached asset in place.

## Tests

Run `npm test` for repository-wide links, metadata, H1, duplicate ID, sitemap and secret-pattern checks. Run `npm run check:js` for JavaScript syntax. Complete the browser, keyboard, contact delivery, analytics and deployment checks in `LAUNCH_CHECKLIST.md` before release.
