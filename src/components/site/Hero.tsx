import Image from "next/image";

import { ButtonLink } from "@/components/ui/Button";
import { Shell } from "@/components/ui/Shell";

export function Hero() {
  return (
    <section
      id="top"
      className="relative pt-[clamp(36px,6vh,72px)] pb-[clamp(56px,8vh,96px)] lg:flex lg:min-h-[calc(100dvh-72px)] lg:items-center"
    >
      <Shell>
        <div className="grid w-full items-center gap-[clamp(36px,5vw,64px)] lg:grid-cols-[1.04fr_.96fr] lg:items-stretch">
          <div className="lg:self-center">
            <span className="text-muted inline-flex items-center gap-2.5 text-[0.72rem] tracking-[.18em] uppercase">
              <span aria-hidden="true" className="bg-accent h-px w-[26px] opacity-90" />
              Metro Atlanta &middot; Farm direct
            </span>
            <h1 className="rv mt-6 text-[clamp(2.5rem,5.2vw,4.2rem)]">
              Harvested tonight.
              <br />
              <em className="text-accent not-italic">Delivered by dawn.</em>
            </h1>
            <p className="rv rv-d1 text-muted mt-6 max-w-[46ch] text-[clamp(1rem,1.5vw,1.15rem)]">
              Fresh cut zoysia and bermuda sod, delivered across Metro
              Atlanta. Loaded straight off the harvester and rolling to your job
              site overnight.
            </p>
            <div className="rv rv-d2 mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/#estimate">Estimate my order</ButtonLink>
              <ButtonLink href="/varieties" variant="ghost">
                Compare varieties
              </ButtonLink>
            </div>
          </div>

          <div className="rv rv-d2 border-line relative overflow-hidden rounded-[var(--radius-lg)] border lg:min-h-[460px] lg:max-h-[74vh]">
            <Image
              src="/img/hero-lay.jpg"
              alt="Hands pressing a fresh seam of sod into soil on a new lawn"
              width={1800}
              height={1200}
              priority
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="h-full w-full object-cover"
            />
            <span className="bg-ink/75 absolute bottom-4 left-4 rounded-full px-4 py-2 text-[0.7rem] font-semibold tracking-[.14em] uppercase backdrop-blur">
              Harvest to job site in under 14 hours
            </span>
          </div>
        </div>
      </Shell>
    </section>
  );
}
