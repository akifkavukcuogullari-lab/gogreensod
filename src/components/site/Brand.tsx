import Link from "next/link";

import { BUSINESS } from "@/lib/business";

export function Brand({ showEst = true }: { showEst?: boolean }) {
  return (
    <Link href="/" className="mr-auto flex items-baseline gap-[9px]">
      <span className="font-[family-name:var(--font-display)] text-[1.06rem] font-extrabold tracking-[-.02em] uppercase">
        {BUSINESS.name}
      </span>
      {showEst && (
        <span className="text-muted text-[0.66rem] tracking-[.16em] uppercase">
          {`Est. ${BUSINESS.foundingDate}`}
        </span>
      )}
    </Link>
  );
}
