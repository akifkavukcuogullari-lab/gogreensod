# Launch checklist — gogreensod.com

Everything that must be true before DNS points at this site. Work top to
bottom; the blockers gate the rest.

**Status:** Release 1 (site + CMS + blog) is built and deployed to a preview
host. Cart, Stripe checkout and order recording are built and switch on from
environment variables; order emails are not built yet. The site is currently
`noindex` on every host except gogreensod.com, so nothing is public yet.

---

## 0. Blocked on the client — chase these first

Nothing below can finish without these, and they move slower than the code.

- [ ] **Delivery fee table.** How does he charge — flat fee, by ZIP, by
      mileage, or free over N pallets? Checkout cannot quote a total without
      it. The schema is already built; he edits zones and ZIPs himself in
      Studio → Site settings.
- [ ] **Stripe account in HIS name.** His bank account, his tax reporting.
      It cannot be created on his behalf. ~10 minutes on the phone with him.
- [ ] **Is sod taxable in Georgia? Get the answer in writing.** If it is and
      we are not collecting, he eats the liability on every order. This is a
      legal exposure, not a code bug.
- [ ] **DNS access** for gogreensod.com. Blocks both the domain cutover and
      Resend's email verification.
- [ ] **Street address** for LocalBusiness JSON-LD. Must match the Google
      Business Profile byte for byte.
- [ ] **Order minimum interpretation.** "Three pallet minimum" — total across
      the cart, or three of each variety? Currently implemented as the cart
      total. One function to flip: `meetsMinimum()` in `src/lib/pricing.ts`.
- [ ] **Real farm photography.** The turf close-ups are open-license stock.
      Stock grass on a sod farm's own site is a credibility problem and
      possibly a licensing one. He drags replacements into the same Studio
      documents; no code change.
- [ ] **Google Business Profile** claimed and complete, with correct hours
      and named service areas. Free, ten minutes, and the single highest
      leverage action for being recommended by AI assistants.
- [ ] **Confirm the order notification email address** (currently
      gogreensod123@gmail.com) and a mobile number for order alerts.

---

## 1. Vercel

- [ ] **Two Vercel projects are deploying this repo — delete one.** Found
      2026-09-12 from GitHub commit statuses:
      - `gogreensod-k6oy` — **builds successfully** on every commit since
        `e43c21b`. This is the working one.
      - `gogreensod` — **has failed on every commit since `19be758`** (the Sanity
        commit), before any of the SEO/content work.

      Likely cause, *not verified* (its build log is outside what the Vercel
      connector can read): that project never got the Sanity environment
      variables below, and `19be758` is the commit that started requiring them.
      Either way, two projects on one repo means double builds and a permanently
      red commit status. Keep the working project, attach the domain to it, and
      delete the other. Check that the one you keep is the one with the env vars.
- [ ] **Know which URL is public.** The working project's Production alias is
      **https://gogreensod-k6oy-ten.vercel.app** — public, serving the latest
      `main`, and correctly `noindex, nofollow` with canonicals and the sitemap
      pointing at gogreensod.com. The per-deployment URLs
      (`gogreensod-k6oy-<hash>-…vercel.app`) are behind Vercel Deployment
      Protection and answer 302 to a login, so use the alias for any external
      test. At cutover, confirm protection stays **off** for Production on the
      real domain.
- [x] **AI crawlers are not blocked by Vercel's firewall** — verified
      2026-09-12 against the Production alias. OAI-SearchBot, GPTBot,
      ChatGPT-User, PerplexityBot, ClaudeBot, Googlebot, bingbot and Applebot
      all received 200 with the full HTML, fact sentences included. Re-run the
      §5 check once on the real domain, since firewall rules can differ per
      domain.
- [ ] **Upgrade to Pro.** Vercel's Hobby plan is restricted to
      non-commercial personal use; taking payments and being paid to build
      the site both count as commercial. ~$20/month, the client's operating
      cost. Required before the site takes a single order.
- [ ] Confirm the project is connected to `akifkavukcuogullari-lab/gogreensod`
      under **Settings → Git**. Pushes must auto-deploy.
- [ ] Add domains **gogreensod.com** and **www.gogreensod.com**, and pick one
      as primary (apex recommended, with www redirecting to it).
- [ ] Point DNS at Vercel and wait for the certificate to issue.
- [ ] **Do NOT set `NEXT_PUBLIC_SITE_URL`.** With it unset, canonical URLs,
      the sitemap, JSON-LD and /llms.txt all resolve to gogreensod.com
      automatically. It exists only as a deliberate override.
- [ ] Environment variables (Production + Preview + Development):

      NEXT_PUBLIC_SANITY_PROJECT_ID    ixnkx4fr
      NEXT_PUBLIC_SANITY_DATASET       production
      NEXT_PUBLIC_SANITY_API_VERSION   2026-06-01
      SANITY_REVALIDATE_SECRET         (the value already in Vercel)

- [ ] **Once Stripe exists:** exclude `/api/stripe/webhook` from Deployment
      Protection, or Stripe gets a 401 before the handler ever runs.
- [ ] **Once Stripe exists:** Production and Preview need SEPARATE Stripe
      webhook endpoints with separate signing secrets. Preview uses test
      keys, Production live.

---

## 2. Sanity

CORS is already configured for gogreensod.com, www.gogreensod.com,
localhost:3000 and the preview host. Nothing to do there.

- [ ] **Repoint the revalidate webhook to the real domain.** Currently it must
      target a host that resolves, so it points at the preview URL. At cutover
      change it to `https://gogreensod.com/api/revalidate`.
      **This is the one setting that does not self-correct** — if it is
      forgotten, publishing silently stops going live within seconds and falls
      back to the 60-second refresh.
- [ ] Invite the client as **Administrator** (not Editor) so he is never
      locked out of his own content if this working relationship ends.
- [ ] Fill in **Site settings**: delivery zones, minimum lead time, blackout
      dates, and leave `orderingEnabled` off until checkout is live.
- [ ] Replace the four variety photos with real farm photography.
- [ ] Publish at least 2–3 blog posts before launch so the Journal is not
      empty on day one. Seed questions that customers actually ask:
      *How much sod do I need for my yard?* ·
      *Zoysia vs Bermuda in Georgia — which should I pick?* ·
      *When is the best time to lay sod in Atlanta?* ·
      *How do I water new sod?* · *Will zoysia grow in shade?*

---

## 3. Stripe

Cart, checkout and the order webhook are built. **Everything switches on from
environment variables** — when the client's credentials arrive, set them in
Vercel → Settings → Environment Variables and redeploy. No code changes.

| Variable | Production | Preview / Development | Without it |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | `rk_live_…` restricted key | `sk_test_…` | Cart works; checkout shows "call to order" |
| `STRIPE_WEBHOOK_SECRET` | secret of the **live** endpoint | secret of the **test** endpoint | Payments work; orders not recorded in Studio |
| `SANITY_API_WRITE_TOKEN` | Editor token | same token | Orders visible in Stripe only |

- [ ] **Stripe account in the client's name** (§0) — keys come from his account.
- [ ] **Restricted key permissions:** Checkout Sessions → Write. Nothing else is
      called, so a leaked key cannot refund, pay out or read customers.
- [ ] **Webhook endpoint** — Stripe → Developers → Webhooks → Add endpoint:
      `https://gogreensod.com/api/stripe/webhook`, events
      `checkout.session.completed` and `checkout.session.async_payment_succeeded`.
      Copy its signing secret into `STRIPE_WEBHOOK_SECRET`.
- [ ] **A separate endpoint per mode.** Test mode points at the public alias
      (`https://gogreensod-k6oy-ten.vercel.app/api/stripe/webhook`), live mode at
      the real domain. Each has its own secret. Never point a webhook at a
      per-deployment URL — Deployment Protection rejects Stripe before the
      handler runs.
- [ ] **Sanity Editor token** for `SANITY_API_WRITE_TOKEN`, so paid orders show
      in Studio → Orders, soonest delivery first.
- [ ] **Replace the TEST delivery zones** in Studio → Site settings → Delivery
      with the real fee table. Checkout refuses a live key while an order is
      priced by a zone named "TEST…", and every such order is flagged in Studio.
- [ ] **Turn on customer receipts:** Stripe → Settings → Customer emails →
      Successful payments. Stripe sends no receipts in test mode.
- [ ] **Sales tax is still not collected** — the §0 blocker stands.
- [ ] Place one real order with a real card. Confirm it appears in Studio →
      Orders, refund it in Stripe, then set its status to Cancelled.
- [ ] Confirm the 3-pallet minimum blocks checkout and an out-of-zone ZIP shows
      "call for a quote".

**Testing locally with test keys:** set `STRIPE_SECRET_KEY=sk_test_…` in
`.env.local`, install the Stripe CLI, run
`stripe listen --forward-to localhost:3000/api/stripe/webhook`, and copy the
`whsec_…` it prints into `STRIPE_WEBHOOK_SECRET`. Pay with card
`4242 4242 4242 4242`, any future expiry, any CVC.

---

## 4. Email — only once Release 2 is built

- [ ] Verify the sending domain in Resend: **SPF + DKIM + DMARC**. Needs DNS,
      so start it early.
- [ ] Test with mail-tester; aim for 9+.
- [ ] **Send a real order email to the client's Gmail and confirm it is not in
      spam.** Order notifications silently landing in spam is the worst
      possible failure — the site looks like it is working.
- [ ] Have the client star the first real one so Gmail learns it.

---

## 5. Verify after the domain is live

- [ ] `https://gogreensod.com` loads; `www` redirects to it.
- [ ] **`noindex` is gone on the real domain** and still present on the
      `.vercel.app` host. Check the `X-Robots-Tag` response header on both.
- [ ] Canonical URLs, sitemap and /llms.txt all name gogreensod.com.
- [ ] AI crawlers get 200 plus full HTML. Test with real user agents, not by
      assumption — Vercel's firewall can block them before robots.txt is read:

      curl -A "OAI-SearchBot/1.0" https://gogreensod.com/varieties -o /dev/null -w "%{http_code} %{size_download}\n"

      Repeat for GPTBot, PerplexityBot, ClaudeBot, Googlebot, bingbot.
- [ ] Google Rich Results Test passes for LocalBusiness, Product, FAQPage,
      BlogPosting, Article, ItemList, Service and BreadcrumbList. Test at least
      `/`, a variety page, `/sod-prices-atlanta`, a `/compare/…` page and
      `/atlanta-sod-guide`. Every required and recommended property was checked
      locally on 2026-09-12 with no gaps; this is the confirmation against Google
      itself, which needs a publicly reachable URL.
- [ ] Lighthouse ≥95 on the home page and a blog post.
- [ ] Submit the sitemap in Google Search Console.
- [ ] Studio loads at /studio and the client can log in and publish.
- [ ] Check the site on a real phone, not just a narrow browser window.

---

## Verifying a CMS edit locally

`pnpm build` alone does **not** show a change just made in Studio. The fetch
cache in `.next/cache` survives rebuilds for the 60-second revalidate window, so
a rebuild can serve the previous price and look like the edit failed. Clear it
first:

    rm -rf .next/cache && pnpm build

In production this does not arise — the revalidate webhook invalidates the cache
tag on publish.

---

## 6. Tell the client in writing before launch

Not optional. These are known gaps, and they are far cheaper to disclose now
than to explain in week three.

- [ ] **No delivery capacity control.** Nothing prevents 40 pallets being
      booked for the same night across separate orders. This is the gap most
      likely to hurt operationally. A `deliveryCapacity` document in Sanity is
      the natural v1.1.
- [ ] **Orders live in Stripe, with a copy in Studio.** Once
      `SANITY_API_WRITE_TOKEN` is set, each paid order appears in Studio →
      Orders, sorted by delivery date, with a status he can update. There is
      still no calendar view, no daily capacity limit, and refunds are done in
      the Stripe Dashboard, not in Studio.
- [ ] **Stripe is not a CRM.** No notes on a customer, no follow-up
      reminders, no tags, no segments.
- [ ] **Repeat customers may create duplicate Stripe records** unless
      checkout looks up the existing customer first.
- [ ] The turf photos are stock until he reshoots them.

---

## 7. Day-one rollback

- [ ] Keep the old host reachable until DNS has fully propagated.
- [ ] Know how to revert: `git revert <sha> && git push` redeploys the
      previous version in about a minute.
- [ ] `orderingEnabled` in Site settings is the kill switch — the client can
      stop taking online orders himself without calling anyone.
