import Image from "next/image";

import { ButtonLink } from "@/components/ui/Button";
import { Shell } from "@/components/ui/Shell";
import { BUSINESS } from "@/lib/business";

export function CtaBand() {
  return (
    <section className="relative overflow-hidden py-[clamp(72px,11vh,140px)]">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/img/stripes.jpg"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div className="from-ink via-ink/85 to-ink absolute inset-0 bg-gradient-to-b" />
      </div>

      <Shell>
        <h2 className="rv text-[clamp(2.2rem,5.6vw,4.2rem)]" style={{ maxWidth: "16ch" }}>
          Tell us the date. We will cut for it.
        </h2>
        <p className="rv rv-d1 text-muted mt-6 max-w-[50ch]">
          Give us your address, your square footage and the evening you want it
          there. Three pallets and up, anywhere in Metro Atlanta.
        </p>
        <div className="rv rv-d2 mt-9 flex flex-wrap gap-3">
          <ButtonLink href={BUSINESS.phoneHref}>{BUSINESS.phone}</ButtonLink>
          <ButtonLink href={BUSINESS.emailHref} variant="ghost">
            {BUSINESS.email}
          </ButtonLink>
        </div>
      </Shell>
    </section>
  );
}
