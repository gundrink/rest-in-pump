import Link from "next/link";
import { Mascot } from "@/components/mascot";
import { TombstoneCard } from "@/components/tombstone-card";
import { buttonVariants } from "@/components/ui/button";
import { getPublicGraveyard } from "@/lib/public-graveyard";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const graveyard = getPublicGraveyard();
  const preview = graveyard.tombstones.slice(0, 3);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-10 sm:py-14">
      <section className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="order-2 md:order-1">
          <p className="text-sm font-semibold tracking-[0.22em] text-[#ffb07a] uppercase">Halloween on Solana</p>
          <h1 className="font-display mt-3 text-5xl leading-[0.95] text-foreground sm:text-7xl">Rest in pump.</h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-muted-foreground">
            A small graveyard for Solana memecoins that already had their Halloween. We have all been rugged.
            Bring a public address, or just walk the hill.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/mine"
              className={cn(buttonVariants({ className: "h-11 rounded-full px-5 text-base" }))}
            >
              See my graveyard
            </Link>
            <Link
              href="/graveyard"
              className={cn(
                buttonVariants({ variant: "outline", className: "h-11 rounded-full px-5 text-base" }),
              )}
            >
              Walk the public hill
            </Link>
          </div>
        </div>
        <Mascot className="order-1 mx-auto w-52 md:order-2 md:w-full" />
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-label="How it works">
        {[
          {
            title: "A coin gets a stone",
            body: "Down more than 90% from its peak, or near-zero volume for several days. The bars live in config. Alive coins stay above ground.",
          },
          {
            title: "Your plot is read-only",
            body: "Connect Phantom or another wallet, or paste an address. We read the public key only. No signature, no transaction, no seed phrase.",
          },
          {
            title: "Share the joke, not a promise",
            body: "Each stone gets a deterministic epitaph. Post the count to X. Nothing here is advice, an airdrop, or a refund.",
          },
        ].map((item) => (
          <article key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="font-display text-2xl">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
          </article>
        ))}
      </section>

      <section>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-4xl">Fresh dirt, fake coins</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{graveyard.notice}</p>
          </div>
          <Link href="/graveyard" className="text-sm font-semibold underline-offset-4 hover:underline">
            All {graveyard.tombstones.length} example stones
          </Link>
        </div>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {preview.map((stone) => (
            <li key={stone.id}>
              <TombstoneCard stone={stone} hideNumbers={false} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
