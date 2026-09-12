/**
 * FAQ content, carried verbatim from the approved concept
 * (reference/index.html, lines 689–721).
 *
 * One array feeds both the rendered accordion and the FAQPage JSON-LD, so the
 * answers a customer reads and the answers Google and AI assistants quote can
 * never disagree.
 *
 * Answers are written to stand alone: a model lifting a single answer out of
 * context must still get a correct, attributable fact.
 */

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

export const FAQ: readonly FaqEntry[] = [
  {
    id: "pickup",
    question: "Can I pick up pallets of sod?",
    answer:
      "No. Because we are farm direct, the freshest product only works if we cut and run it straight to you. There is also a three pallet minimum on every order.",
  },
  {
    id: "changes",
    question: "Can I change my order later?",
    answer:
      "Yes. Add or drop pallets any time up to 48 hours before delivery, and the same goes for moving your delivery date. We will accommodate what we can.",
  },
  {
    id: "cancellation",
    question: "What is your cancellation policy?",
    answer:
      "You can request a refund within two days of purchase. Contact us and we will process it.",
  },
  {
    id: "billing",
    question: "How does billing work?",
    answer:
      "Pay for your sod on the website, or we can send an invoice you can settle securely from your desktop or phone.",
  },
  {
    id: "pay-on-delivery",
    question: "Can I pay on delivery?",
    answer:
      "No. Orders are paid in full before we harvest, since the grass is cut specifically for you.",
  },
  {
    id: "delivery-time",
    question: "What time of day do you deliver?",
    answer:
      "Sod is always harvested the day of delivery. Drivers load in the field and deliver that evening, anywhere from 6pm until 8am the next morning.",
  },
  {
    id: "coverage",
    question: "How much area does a pallet of sod cover?",
    answer:
      "One pallet of Go Green Sod turf covers 450 square feet. A 2,400 square foot lawn needs 6 pallets, and every order has a three pallet minimum.",
  },
  {
    id: "delivery-area",
    question: "Where does Go Green Sod deliver?",
    answer:
      "We deliver across Metro Atlanta, including Alpharetta, Marietta, Roswell, Sandy Springs, Duluth, Johns Creek, Kennesaw and the surrounding counties, and a good bit past where the map stops. Call 678.237.3111 to confirm your address.",
  },
] as const;
