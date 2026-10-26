import type { Metadata } from "next";
import { Suspense } from "react";
import { MineControls } from "@/components/mine-controls";
import { MineResults } from "@/components/mine-results";
import { ReadOnlyNotice } from "@/components/read-only-notice";
import { GraveyardSkeleton } from "@/components/skeletons";

export const metadata: Metadata = {
  title: "My graveyard",
  description:
    "See dead Solana memecoins for a public wallet. Read-only connect or paste an address. No signatures.",
};

export default function MinePage({ searchParams }: PageProps<"/mine">) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="font-display text-5xl leading-none">My graveyard</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Coins this wallet held that are now dead. The joke is on the chart, and on all of us. It is not a
        scoreboard for people.
      </p>
      <div className="mt-6">
        <ReadOnlyNotice />
      </div>
      <Suspense fallback={<p className="mt-6 text-sm text-muted-foreground">Loading the address form…</p>}>
        <MineControls />
      </Suspense>
      <Suspense fallback={<GraveyardSkeleton label="Checking which coins already had their Halloween…" />}>
        <MineResults searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
