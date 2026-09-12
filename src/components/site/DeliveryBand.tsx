import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { BUSINESS } from "@/lib/business";

export function DeliveryBand() {
  return (
    <Section id="delivery" tinted>
      <h2 className="rv text-[clamp(2rem,5.6vw,4.4rem)]" style={{ maxWidth: "18ch" }}>
        We deliver across <em className="text-accent not-italic">Metro Atlanta</em>
        , and a good bit past where the map stops.
      </h2>
      <div className="rv rv-d1 mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <p className="text-muted max-w-[46ch]">
          If you are sitting close to our delivery line, call or text. We can
          usually work something out. Delivery only, no pickup at the farm.
        </p>
        <ButtonLink href={BUSINESS.phoneHref}>
          {`Call or text ${BUSINESS.phone}`}
        </ButtonLink>
      </div>
    </Section>
  );
}
