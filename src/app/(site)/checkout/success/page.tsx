import type { Metadata } from "next";

import { ClearCartOnSuccess } from "@/components/cart/ClearCartOnSuccess";
import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { BUSINESS } from "@/lib/business";
import { formatDeliveryDate } from "@/lib/delivery";
import { isStripeConfigured } from "@/lib/env";
import { centsToDollars } from "@/lib/pricing";
import { getStripe } from "@/lib/stripe.server";

export const metadata: Metadata = {
  title: "Order confirmation",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]+$/;

type Summary = {
  paid: boolean;
  email: string | null;
  deliveryDate: string | null;
  totalPallets: string | null;
  totalCents: number | null;
  livemode: boolean;
};

/**
 * Reads the session straight from Stripe rather than trusting the URL.
 *
 * Anyone can visit /checkout/success. Only a session id Stripe confirms as
 * complete produces a confirmation, and only a paid one clears the cart. The
 * order record itself comes from the webhook, never from this page — a customer
 * who closes the tab before the redirect still gets their order recorded.
 */
async function loadSummary(sessionId: string | undefined): Promise<Summary | null> {
  if (!sessionId || !SESSION_ID.test(sessionId) || !isStripeConfigured()) return null;

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.status !== "complete") return null;

    return {
      paid: session.payment_status === "paid",
      email: session.customer_details?.email ?? null,
      deliveryDate: session.metadata?.deliveryDate ?? null,
      totalPallets: session.metadata?.totalPallets ?? null,
      totalCents: session.amount_total,
      livemode: session.livemode,
    };
  } catch (error) {
    console.error("[checkout/success] could not retrieve session", error);
    return null;
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const summary = await loadSummary(session_id);

  if (!summary) {
    return (
      <Section>
        <h1 className="text-[clamp(2.1rem,5.2vw,3.4rem)]">We could not find that order</h1>
        <p className="text-muted mt-4 max-w-[56ch]">
          {`If you completed payment, your order is safe and Stripe has your receipt. Call ${BUSINESS.phone} and we will confirm it.`}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href={BUSINESS.phoneHref}>{`Call ${BUSINESS.phone}`}</ButtonLink>
          <ButtonLink href="/cart" variant="ghost">
            Back to your cart
          </ButtonLink>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      {summary.paid ? <ClearCartOnSuccess /> : null}

      {!summary.livemode ? (
        <p className="border-accent/30 bg-accent/10 mb-6 inline-block rounded-[var(--radius-sm)] border px-3 py-1.5 text-[0.8rem]">
          Test mode. No money moved.
        </p>
      ) : null}

      <h1 className="text-[clamp(2.1rem,5.2vw,3.4rem)]">
        {summary.paid ? "Order confirmed" : "Payment processing"}
      </h1>
      <p className="text-muted mt-4 max-w-[58ch] text-[clamp(1rem,1.5vw,1.125rem)]">
        {summary.paid
          ? `Thank you. ${summary.email ? `A receipt is on its way to ${summary.email}.` : "Your receipt is on its way."}`
          : "Your order is placed. Some payment methods take a few days to clear; we cut your sod once the payment lands, and we will call if anything holds it up."}
      </p>

      <dl className="border-line bg-surface-2 mt-10 grid max-w-[640px] gap-x-8 gap-y-5 rounded-[var(--radius-md)] border p-[clamp(24px,3.5vw,40px)] sm:grid-cols-3">
        <Item
          label="Delivery"
          value={summary.deliveryDate ? formatDeliveryDate(summary.deliveryDate) : "To be confirmed"}
        />
        <Item label="Pallets" value={summary.totalPallets ?? "—"} />
        <Item
          label="Total"
          value={summary.totalCents !== null ? centsToDollars(summary.totalCents) : "—"}
        />
      </dl>

      <h2 className="mt-12 text-[clamp(1.4rem,2.6vw,1.8rem)]">What happens next</h2>
      <ul className="text-bone/85 mt-5 max-w-[62ch] list-disc space-y-2 pl-6">
        <li>
          {`Your sod is cut the day it ships and delivered overnight, from ${BUSINESS.deliveryWindow}.`}
        </li>
        <li>
          {`Need to add pallets or move the date? Call ${BUSINESS.phone} up to ${BUSINESS.policy.changeCutoffHours} hours before delivery.`}
        </li>
        <li>
          {`Refund requests are accepted within ${BUSINESS.policy.refundWindowDays} days of purchase.`}
        </li>
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/atlanta-sod-guide">Read the Atlanta sod guide</ButtonLink>
        <ButtonLink href={BUSINESS.phoneHref} variant="ghost">
          {`Call ${BUSINESS.phone}`}
        </ButtonLink>
      </div>
    </Section>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted text-[0.68rem] font-semibold tracking-[.16em] uppercase">
        {label}
      </dt>
      <dd className="mt-2 font-[family-name:var(--font-display)] text-[1.1rem] font-bold">
        {value}
      </dd>
    </div>
  );
}
