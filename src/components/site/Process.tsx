import Image from "next/image";

import { Section, SectionHead } from "@/components/ui/Section";

const STEPS = [
  {
    n: "STEP 01",
    title: "Cut the day it ships",
    body: "Your order is harvested the afternoon of your delivery date, not pulled from a lot where it has been drying out for a week.",
    image: {
      src: "/img/harvest.jpg",
      alt: "A sod harvester cutting turf from the field onto pallets",
    },
  },
  {
    n: "STEP 02",
    title: "Loaded in the field",
    body: "Drivers load straight off the harvester onto the trailer. One handling, which is the difference you can see in the roll.",
    image: {
      src: "/img/load.jpg",
      alt: "A forklift loading rolls of fresh sod onto a flatbed trailer",
    },
  },
] as const;

export function Process() {
  return (
    <Section id="process">
      <SectionHead
        title="Nothing sits in a yard."
        lede="Sod is a perishable product. Ours is standing in the field the morning of the day it reaches you."
      />

      {STEPS.map((step, i) => (
        <div
          key={step.n}
          className="rv mb-[clamp(40px,6vw,80px)] grid items-center gap-[clamp(24px,4vw,64px)] md:grid-cols-2"
        >
          <div
            className={`border-line overflow-hidden rounded-[var(--radius-lg)] border ${
              i % 2 === 1 ? "md:order-2" : ""
            }`}
          >
            <Image
              src={step.image.src}
              alt={step.image.alt}
              width={1600}
              height={1200}
              sizes="(min-width: 768px) 48vw, 100vw"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <span className="text-accent text-[0.7rem] font-semibold tracking-[.18em] uppercase">
              {step.n}
            </span>
            <h3 className="mt-4 text-[clamp(1.5rem,3vw,2.2rem)]">{step.title}</h3>
            <p className="text-muted mt-4 max-w-[46ch]">{step.body}</p>
          </div>
        </div>
      ))}

      <div className="rv border-line bg-surface-2 rounded-[var(--radius-md)] border p-[clamp(28px,4vw,56px)]">
        <span className="text-accent text-[0.7rem] font-semibold tracking-[.18em] uppercase">
          STEP 03
        </span>
        <h3 className="mt-4 text-[clamp(1.7rem,3.6vw,2.6rem)]">
          On site between 6pm and 8am
        </h3>
        <p className="text-muted mt-4 max-w-[52ch]">
          We run overnight so the pallets are waiting when your crew shows up.
          Add or drop pallets any time up to 48 hours before delivery.
        </p>
      </div>
    </Section>
  );
}
