# Structured data testing map

Test the deployed clean URLs with both Google Rich Results Test and Schema.org Validator. Confirm that each result matches the visible page and final canonical source.

| Page | Expected schema types |
| --- | --- |
| `https://weburate.online/` | `WebSite`, `Organization` in an `@graph` |
| `https://weburate.online/services/website-development` | `Service`, `BreadcrumbList` |
| `https://weburate.online/services/landing-page-design` | `Service`, `BreadcrumbList` |
| `https://weburate.online/services/ecommerce-development` | `Service`, `BreadcrumbList` |
| `https://weburate.online/services/website-redesign` | `Service`, `BreadcrumbList` |
| `https://weburate.online/services/website-maintenance` | `Service`, `BreadcrumbList` |
| `https://weburate.online/industries/restaurant-websites` | `BreadcrumbList` |
| `https://weburate.online/industries/clinic-websites` | `BreadcrumbList` |
| `https://weburate.online/industries/gym-websites` | `BreadcrumbList` |
| `https://weburate.online/insights` | `BreadcrumbList` — currently `noindex` pending owner review |
| `https://weburate.online/insights/small-business-website-cost-india` | `Article`, `BreadcrumbList` — draft and `noindex` |
| `https://weburate.online/insights/website-vs-instagram-local-business` | `Article`, `BreadcrumbList` — draft and `noindex` |
| `https://weburate.online/insights/prepare-before-hiring-website-developer` | `Article`, `BreadcrumbList` — draft and `noindex` |

Privacy, Terms, the 404 page and the unpublished `portfolio/case-study-template` intentionally have no structured data. No Review, AggregateRating, LocalBusiness or address schema is used.
