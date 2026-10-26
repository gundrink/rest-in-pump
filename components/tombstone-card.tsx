import { formatDay, formatDrawdown, formatUsd } from "@/lib/format";
import type { Tombstone } from "@/lib/types";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[0.7rem] uppercase tracking-[0.14em] text-[#d9fff6]/80">{label}</dt>
      <dd className="truncate text-sm text-foreground">{value}</dd>
    </div>
  );
}

export function TombstoneCard({
  stone,
  hideNumbers,
}: {
  stone: Tombstone;
  hideNumbers: boolean;
}) {
  const hidden = "buried";
  const peakLabel =
    stone.athKind === "window-estimate"
      ? "Peak (24h estimate)"
      : stone.athKind === "recorded"
        ? "All-time high"
        : "Peak";

  return (
    <article
      data-testid="tombstone"
      aria-labelledby={`${stone.id}-ticker`}
      className="tombstone relative flex h-full flex-col px-5 pb-6 pt-8 text-center"
    >
      {stone.isExample ? (
        <p className="absolute top-3 right-4 rounded-full bg-[#ff7a18] px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-[#2a1206]">
          EXAMPLE
        </p>
      ) : null}
      <p className="font-display text-sm tracking-[0.35em] text-[#d9fff6]">R.I.P.</p>
      <h2 id={`${stone.id}-ticker`} className="font-display mt-1 text-3xl leading-none text-foreground">
        {stone.ticker}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{stone.name}</p>
      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 text-left">
        <Stat label="Born" value={stone.bornAt ? formatDay(stone.bornAt) : "Unknown"} />
        <Stat
          label="Died"
          value={
            stone.diedAt
              ? formatDay(stone.diedAt)
              : "Observed this visit"
          }
        />
        <Stat
          label={peakLabel}
          value={hideNumbers ? hidden : stone.athUsd == null ? "Unknown" : formatUsd(stone.athUsd)}
        />
        <Stat
          label="From the peak"
          value={hideNumbers ? hidden : stone.drawdown == null ? "Unknown" : formatDrawdown(stone.drawdown)}
        />
        <Stat
          label="Price now"
          value={hideNumbers ? hidden : stone.priceUsd == null ? "Unknown" : formatUsd(stone.priceUsd)}
        />
        <Stat
          label="24h volume"
          value={
            hideNumbers ? hidden : stone.volume24hUsd == null ? "Unknown" : formatUsd(stone.volume24hUsd)
          }
        />
      </dl>
      <p className="mt-4 text-sm font-semibold text-[#ffb07a]">{stone.causeOfDeath}</p>
      {stone.bagStatus === "unknown" ? null : (
        <p className="mt-2 text-xs tracking-wide text-[#d9fff6]/90 uppercase">
          {stone.bagStatus === "still-holding" ? "Still in this wallet" : "Bag already empty"}
        </p>
      )}
      <blockquote className="mt-4 border-t border-white/10 pt-4 text-sm leading-6 text-foreground/90">
        {stone.epitaph}
      </blockquote>
      {stone.chartUrl ? (
        <p className="mt-4">
          <a
            href={stone.chartUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline-offset-4 hover:underline"
          >
            See the chart
          </a>
        </p>
      ) : null}
    </article>
  );
}
