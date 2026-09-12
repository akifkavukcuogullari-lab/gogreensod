# Go Green Sod

Website for [Go Green Sod](https://gogreensod.com), a farm-direct sod supplier
serving Metro Atlanta. Next.js App Router, TypeScript, Tailwind v4.

Built by NEXTLYN. Not affiliated with or endorsed by Go Green Sod.

## Run it

    pnpm install
    pnpm dev          # http://localhost:3000

    pnpm build        # production build
    pnpm start        # serve the production build
    pnpm lint

## Structure

    src/app/(site)/         marketing routes — nav, footer and page chrome
    src/app/llms.txt/       plain-text brief for AI assistants
    src/app/robots.ts       crawler policy, AI crawlers allowed explicitly
    src/app/sitemap.ts
    src/components/ui/      Shell, Section, Button, Accordion, Reveal, JsonLd
    src/components/site/    Nav, MobileNav, Footer, Hero, Process, Estimator
    src/components/varieties/
    src/lib/                data and logic — see below
    public/img/             photography
    reference/index.html    the original approved single-page concept

## Single sources of truth

Each of these is the only place its facts are written. The original concept
duplicated variety data across four locations and they had already drifted;
don't reintroduce that.

| File | Owns |
|---|---|
| `src/lib/catalog.ts` | the four varieties — prices, specs, images, slugs |
| `src/lib/pricing.ts` | pallet math, order minimum, area validation |
| `src/lib/business.ts` | name, phone, email, address, service area, policies |
| `src/lib/faq.ts` | FAQ copy — renders the accordion *and* the FAQPage JSON-LD |
| `src/lib/nav.ts` | navigation — desktop nav, mobile menu and footer |

Prices are stored in **integer cents** (`pricePerPalletCents: 33000`). Never
floating-point dollars.

`src/lib/catalog.server.ts` resolves the live catalog. Sanity will supply it so
the client can edit prices; `FALLBACK_VARIETIES` in `catalog.ts` is the
compiled safety net for when Sanity is unreachable. Checkout re-derives every
amount from this resolver and ignores anything a browser sends.

## Changing a price

Until Sanity is wired up, edit `pricePerPalletCents` in `src/lib/catalog.ts`
and push. Vercel deploys in about a minute. The change propagates to the
variety pages, the estimator, the comparison table, the JSON-LD and
`/llms.txt` automatically.

## Business rules encoded in the app

- One pallet covers **450 sq ft**
- **Three pallet minimum**, applied to the cart total (`meetsMinimum()`)
- **Delivery only**, no pickup — a delivery address is required
- Delivery window **6pm to 8am**, the night of harvest
- Pallets can change up to **48 hours** before delivery
- Refund requests within **two days** of purchase
- Online estimates cap at **500,000 sq ft**

## SEO and GEO

The original concept shipped no structured data, no favicon, no canonical and
no Open Graph tags. This app emits `LocalBusiness`, `Product`/`Offer` per
variety, `FAQPage` and `BreadcrumbList` JSON-LD, all derived from the constants
above so the markup can't contradict the page.

`robots.ts` allows AI crawlers **explicitly** — `OAI-SearchBot` feeds ChatGPT's
search results and `Google-Extended` governs Google's AI Overviews separately
from Googlebot. A host-level firewall can still block them before robots.txt is
read, so verify after deploy by requesting the site with each user-agent.

The variety tab widget keeps all four panels in the DOM (inactive ones carry
the `hidden` attribute) so crawlers that never run JavaScript read every
variety.

## Environment

See `.env.example`. Nothing secret may carry a `NEXT_PUBLIC_` prefix — that
inlines it into the JavaScript every visitor downloads.

## Before going live

See [LAUNCH.md](LAUNCH.md) — the pre-launch checklist. It covers what is
blocked on the client, the Vercel and Sanity cutover steps, what to verify
once the real domain resolves, and the known gaps to disclose in writing.

See [CLIENT-ACTIONS.md](CLIENT-ACTIONS.md) for the half of the work that is not
code: the Google Business Profile, reviews, the other platforms, and the turf
facts only the client can supply. For a local delivery business the profile and
the reviews outrank every on-page change in this repo.

## Not yet built

Cart, Stripe checkout, delivery-fee zones and transactional email. Delivery
pricing is still an open question with the client, and checkout cannot quote a
total without it.

Also outstanding from the content plan: a sod prices page, a standalone
calculator route, contractor and comparison pages, a buying guide, and
delivery-area pages. The area pages are deliberately last — they need the real
fee table, and thin duplicate city pages would do more harm than good.

## Legacy

`render.yaml`, `scripts/build-artifact.py` and `assets/` belong to the previous
static single-page site. They stay until DNS moves to Vercel, then go.
