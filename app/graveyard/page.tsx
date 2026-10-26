import type { Metadata } from "next";
import { GraveyardBrowser } from "@/components/graveyard-browser";
import { getPublicGraveyard } from "@/lib/public-graveyard";

export const metadata: Metadata = {
  title: "Graveyard",
  description: "Example tombstones for fictional Solana memecoins that did not make it.",
};

export default function GraveyardPage() {
  const graveyard = getPublicGraveyard();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <p className="text-sm font-semibold tracking-[0.18em] text-[#ffb07a] uppercase">{graveyard.label}</p>
      <h1 className="font-display mt-2 text-5xl leading-none">The public graveyard</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">{graveyard.notice}</p>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        A coin is buried when price is down more than {Math.round(graveyard.thresholds.drawdownAbove * 100)}%
        from its peak, or when 24h volume is at or under ${graveyard.thresholds.nearZeroVolumeUsd} across{" "}
        {graveyard.thresholds.lowVolumeDays} low-volume days. Epitaphs are picked from the stats, so the same
        coin always gets the same line. Source id: {graveyard.sourceId}.
      </p>
      <GraveyardBrowser tombstones={graveyard.tombstones} shareKind="public" shareMode="example" />
    </main>
  );
}
