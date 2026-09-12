const PHRASES = [
  "Zeon Zoysia",
  "Emerald Zoysia",
  "Tifway 419 Bermuda",
  "Meyers Zoysia",
  "Loaded in the field",
  "Three pallet minimum",
  "No pickup, delivery only",
  "All of Metro Atlanta",
];

/** Decorative marquee. Duplicated once so the loop is seamless. */
export function Ticker() {
  const run = [...PHRASES, ...PHRASES];

  return (
    <div
      aria-hidden="true"
      className="border-line-soft bg-surface overflow-hidden border-y py-4"
    >
      <div className="ticker-track flex w-max gap-10 whitespace-nowrap">
        {run.map((phrase, i) => (
          <span
            key={`${phrase}-${i}`}
            className={
              i % 2 === 0
                ? "text-bone text-[0.78rem] font-semibold tracking-[.16em] uppercase"
                : "text-muted text-[0.78rem] tracking-[.16em] uppercase"
            }
          >
            {phrase}
          </span>
        ))}
      </div>
    </div>
  );
}
