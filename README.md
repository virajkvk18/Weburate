# Weburate static website 

Production-oriented static HTML, CSS and vanilla JavaScript for `https://weburate.online/`, deployed on Vercel. The only server-side component is the contact email function in `api/contact.js`. 

## Local preview

Node.js is required for the audit and API tests. The repository has no installed runtime or development dependencies, so there is no dependency installation step. The preview command downloads `serve` through `npx` when it is not already cached.

```powershell
cd F:\Weburate
npm.cmd run preview
```

Open `http://localhost:4173`. The preview supports the extensionless URLs used in production. A basic static preview cannot execute the Vercel API function.

For the complete local Vercel function workflow, install the Vercel CLI through `npx` and start its development server:

```powershell
cd F:\Weburate
npx.cmd vercel dev
```

## Deploy to Vercel

Import the repository as a Vercel project. The repository has no framework build step and uses the project root as its output directory. Set the environment variables below for Production and Preview as appropriate, deploy, then configure the primary domain and redirects described in `LAUNCH_CHECKLIST.md`.

For an already linked Vercel project, deploy the current checked-out commit with:

```powershell
cd F:\Weburate
npx.cmd vercel deploy --prod
```

## Contact form and Resend

1. Create a Resend account and verify a sending domain you control.
2. Create a Resend API key.
3. Add these Vercel environment variables (never add their values to this repository):
   - `RESEND_API_KEY`: server-side Resend key.
   - `CONTACT_TO_EMAIL`: inbox that receives enquiries.
   - `CONTACT_FROM_EMAIL`: verified sender such as `Weburate Website <forms@your-verified-domain.example>`.
4. Redeploy and submit a real test enquiry. Confirm delivery, reply-to behaviour and the failure fallback.

Until those variables are configured, the form returns a safe setup error and offers the existing Gmail and WhatsApp contact methods.

For safe local testing, copy `.env.example` to `.env.local`, set `CONTACT_DEV_MODE=true`, leave the Resend values empty and run `npx vercel dev`. Development mode validates the request and returns success without sending email. It is ignored when `VERCEL_ENV=production`.

The endpoint uses origin checks, strict field validation, a timing check and a honeypot. Reliable request throttling cannot use an in-memory counter because Vercel functions run across separate instances. Configure a Vercel Firewall rate-limit rule for `/api/contact`, or use a durable external rate-limit store, before high-volume promotion.

## Optional analytics

Edit `assets/js/analytics-config.js` and set a public GA4 measurement ID (`G-...`) and/or a Microsoft Clarity project ID. An empty value loads nothing. The loader records only named conversion events; it never sends form-field values. Before enabling a provider, confirm applicable consent requirements and ensure the Privacy Policy matches the actual configuration.

### Analytics event table

| Event | Trigger | Parameters | Privacy note |
| --- | --- | --- | --- |
| `consultation_header` | Header consultation link | None | No form values |
| `whatsapp_hero` | Hero WhatsApp link | None | No form values |
| `whatsapp_page` | Service or industry WhatsApp link | None | No form values |
| `whatsapp_contact` | Contact-section WhatsApp link | None | No form values |
| `whatsapp_floating` | Floating WhatsApp link | None | No form values |
| `phone_click` | Phone link | None | Phone number is not sent as a parameter |
| `email_click` | Email link | None | Email address is not sent as a parameter |
| `pricing_cta` | Any package enquiry link | None | Package text is not sent |
| `portfolio_click` | Concepts navigation or future verified portfolio link | None | No client data |
| `contact_form_start` | First form input | None | Field values are never collected |
| `contact_form_success` | API confirms delivery or safe development-mode validation | None | Field values are never collected |
| `contact_form_error` | API or network failure | None | Error text and field values are not sent |

Each event is emitted once per user action. Add `data-event="portfolio_click"` to verified case-study links when genuine portfolio content is published.

## Portfolio and case studies

The current homepage shows demonstration concepts because the repository contained no verifiable client evidence. Gather the items in `CONTENT_TODO.md`, copy `portfolio/case-study-template.html`, replace every bracketed field, remove `noindex` only after owner approval, link it from the homepage and add its canonical URL to `sitemap.xml`.

## Sitemap and structured data

Use absolute extensionless `https://weburate.online/` URLs. Vercel redirects `.html` requests because `cleanUrls` is enabled, so `.html` URLs must not appear in canonicals or the sitemap. Add only canonical, indexable production pages; exclude 404s, editorial drafts, templates and thank-you pages. Keep homepage Organization data and each Service/Breadcrumb graph consistent with visible page content.

## Versioned assets

Production pages load dated CSS and JavaScript files. When either changes, create a new versioned filename and update page references. Do not replace a long-cached asset in place. `assets/weburate-logo-transparent.png` is the preserved original logo source; production pages use the smaller WebP display asset.

## Content Security Policy

All visual assets, CSS and primary JavaScript are local. The CSP permits `www.googletagmanager.com` only for optional GA4 loading, `www.clarity.ms` only for optional Clarity loading, and the documented Google Analytics and Clarity collection endpoints in `connect-src`. Empty analytics IDs mean no third-party scripts or connections are created.

## Tests

Run the dependency-free repository audit, contact API tests and JavaScript syntax checks with:

```powershell
cd F:\Weburate
npm.cmd run audit
npm.cmd test
npm.cmd run check:js
```

Run HTML and CSS validators without adding them to the project:

```powershell
cd F:\Weburate
npx.cmd --yes html-validate@10.0.0 "**/*.html"
npx.cmd --yes csstree-validator@4.0.1 assets/css/site.20260717-3.css
```

Complete the browser, keyboard, production contact delivery, analytics and deployment checks in `LAUNCH_CHECKLIST.md` before release.
