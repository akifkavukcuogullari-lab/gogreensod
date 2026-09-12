import { CogIcon } from "@sanity/icons/Cog";
import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Operational settings — a singleton.
 *
 * Delivery fees live here rather than in code because they move with fuel
 * prices and the client already quotes them by phone. Unlike a pallet price,
 * a wrong value here affects a fee the client negotiates anyway, so the
 * tradeoff favours letting them edit it.
 */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "delivery", title: "Delivery", default: true },
    { name: "ordering", title: "Online ordering" },
    { name: "contact", title: "Contact" },
  ],
  fields: [
    defineField({
      name: "orderingEnabled",
      title: "Accept online orders",
      type: "boolean",
      group: "ordering",
      initialValue: true,
      description:
        "Turn this off to stop taking online orders — during a drought, a shutdown, or a backlog. The website stays up and tells customers to call.",
    }),
    defineField({
      name: "minLeadTimeDays",
      title: "Earliest delivery, in days from today",
      type: "number",
      group: "ordering",
      initialValue: 2,
      validation: (rule) => rule.required().integer().min(0).max(30),
    }),
    defineField({
      name: "deliveryBlackoutDates",
      title: "Dates you cannot deliver",
      type: "array",
      group: "ordering",
      of: [defineArrayMember({ type: "date" })],
      description: "Holidays and closures. Customers cannot pick these dates.",
    }),
    defineField({
      name: "deliveryZones",
      title: "Delivery zones",
      type: "array",
      group: "delivery",
      description:
        "Each zone is a delivery price and the ZIP codes it covers. A customer's ZIP decides what they are charged.",
      of: [
        defineArrayMember({
          type: "object",
          name: "zone",
          fields: [
            defineField({
              name: "name",
              title: "Zone name",
              type: "string",
              validation: (rule) => rule.required().max(30),
            }),
            defineField({
              name: "fee",
              title: "Delivery fee (US dollars)",
              type: "number",
              description: "Whole dollars. Use 0 for free delivery in this zone.",
              validation: (rule) => rule.required().integer().min(0).max(2000),
            }),
            defineField({
              name: "zips",
              title: "ZIP codes",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
              options: { layout: "tags" },
              description: "Five digit ZIPs. Type one and press enter.",
              validation: (rule) =>
                rule.required().min(1).custom((zips) => {
                  const bad = (zips ?? []).filter(
                    (z) => !/^\d{5}$/.test(String(z).trim()),
                  );
                  return bad.length
                    ? `Not valid five digit ZIP codes: ${bad.join(", ")}`
                    : true;
                }),
            }),
          ],
          preview: {
            select: { title: "name", fee: "fee", zips: "zips" },
            prepare({ title, fee, zips }) {
              const count = Array.isArray(zips) ? zips.length : 0;
              return {
                title: title ?? "Unnamed zone",
                subtitle: `$${fee ?? 0} · ${count} ZIP${count === 1 ? "" : "s"}`,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "unknownZipBehavior",
      title: "When a ZIP is not in any zone",
      type: "string",
      group: "delivery",
      initialValue: "quote",
      options: {
        list: [
          { title: "Ask the customer to call for a quote", value: "quote" },
          { title: "Charge the fallback fee below", value: "charge" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "fallbackFee",
      title: "Fallback delivery fee (US dollars)",
      type: "number",
      group: "delivery",
      hidden: ({ document }) => document?.unknownZipBehavior !== "charge",
      validation: (rule) => rule.integer().min(0).max(2000),
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "announcement",
      title: "Announcement bar",
      type: "string",
      group: "contact",
      description:
        "Shows across the top of every page. Leave empty for none. Good for a delay or a seasonal note.",
      validation: (rule) => rule.max(120),
    }),
  ],
  preview: {
    prepare() {
      return { title: "Site settings" };
    },
  },
});
