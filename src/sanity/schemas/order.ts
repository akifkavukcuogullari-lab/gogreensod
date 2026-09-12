import { BasketIcon } from "@sanity/icons/Basket";
import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * A paid online order, written by the Stripe webhook.
 *
 * Stripe stays the source of truth for money — refunds happen in the Stripe
 * Dashboard. This document exists so the client can see what he has to cut and
 * deliver, sorted by delivery date, in the Studio he already uses: the order
 * list LAUNCH.md flagged as missing.
 *
 * Everything the customer paid for is read-only. `status` is the one field
 * meant for the client, to move an order from new to delivered.
 *
 * The document id is derived from the Stripe Checkout Session id, so a webhook
 * Stripe retries — which it does — can never create a second copy of an order.
 */
export const order = defineType({
  name: "order",
  title: "Order",
  type: "document",
  icon: BasketIcon,
  fields: [
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "new",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Scheduled", value: "scheduled" },
          { title: "Delivered", value: "delivered" },
          { title: "Cancelled / refunded", value: "cancelled" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "needsReview",
      title: "Check before delivering",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      readOnly: true,
      description:
        "Anything the website could not confirm automatically — for example a delivery address in a different ZIP from the one the delivery fee was priced for.",
    }),
    defineField({
      name: "deliveryDate",
      title: "Delivery date",
      type: "date",
      readOnly: true,
    }),
    defineField({
      name: "customerName",
      title: "Customer",
      type: "string",
      readOnly: true,
    }),
    defineField({ name: "email", title: "Email", type: "string", readOnly: true }),
    defineField({ name: "phone", title: "Phone", type: "string", readOnly: true }),
    defineField({
      name: "deliveryAddress",
      title: "Delivery address",
      type: "text",
      rows: 3,
      readOnly: true,
    }),
    defineField({
      name: "zip",
      title: "ZIP the delivery fee was priced for",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "zoneName",
      title: "Delivery zone",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "items",
      title: "Pallets",
      type: "array",
      readOnly: true,
      of: [
        defineArrayMember({
          type: "object",
          name: "orderLine",
          fields: [
            defineField({ name: "varietyKey", title: "Variety key", type: "string" }),
            defineField({ name: "name", title: "Grass", type: "string" }),
            defineField({ name: "pallets", title: "Pallets", type: "number" }),
            defineField({
              name: "unitPrice",
              title: "Price per pallet (US dollars)",
              type: "number",
            }),
          ],
          preview: {
            select: { title: "name", pallets: "pallets", unit: "unitPrice" },
            prepare: ({ title, pallets, unit }) => ({
              title: `${pallets ?? 0} × ${title ?? "Unknown grass"}`,
              subtitle: typeof unit === "number" ? `$${unit} per pallet` : undefined,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: "totalPallets",
      title: "Total pallets",
      type: "number",
      readOnly: true,
    }),
    defineField({
      name: "sodSubtotal",
      title: "Sod (US dollars)",
      type: "number",
      readOnly: true,
    }),
    defineField({
      name: "deliveryFee",
      title: "Delivery (US dollars)",
      type: "number",
      readOnly: true,
    }),
    defineField({
      name: "total",
      title: "Paid (US dollars)",
      type: "number",
      readOnly: true,
    }),
    defineField({
      name: "stripePaymentIntentId",
      title: "Stripe payment",
      type: "string",
      readOnly: true,
      description:
        "Search for this in the Stripe Dashboard to see the payment or issue a refund.",
    }),
    defineField({
      name: "stripeSessionId",
      title: "Stripe Checkout Session",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "livemode",
      title: "Real payment",
      type: "boolean",
      readOnly: true,
      description: "Off means a Stripe test-mode order. No money moved.",
    }),
    defineField({
      name: "paidAt",
      title: "Paid at",
      type: "datetime",
      readOnly: true,
    }),
  ],
  orderings: [
    {
      title: "Delivery date",
      name: "deliveryDateAsc",
      by: [{ field: "deliveryDate", direction: "asc" }],
    },
    {
      title: "Newest first",
      name: "paidAtDesc",
      by: [{ field: "paidAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      name: "customerName",
      date: "deliveryDate",
      pallets: "totalPallets",
      status: "status",
      live: "livemode",
    },
    prepare: ({ name, date, pallets, status, live }) => ({
      title: `${live === false ? "TEST · " : ""}${name ?? "Unknown customer"}`,
      subtitle: [
        date,
        typeof pallets === "number" ? `${pallets} pallets` : null,
        status,
      ]
        .filter(Boolean)
        .join(" · "),
    }),
  },
});
