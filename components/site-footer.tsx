import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground">
        <p>
          Rest In Pump is a Halloween memorial for dead coins. It is not financial advice, not a trading
          app, and not a promise of profit, an airdrop, or a refund. There is no token and no smart contract
          here.
        </p>
        <p>
          A wallet connect, when you choose it, is read-only. We never ask for a signature, a transaction,
          or a seed phrase. If a popup does, close it. That is not this site.
        </p>
        <p>
          <Link href="/graveyard" className="underline-offset-4 hover:underline">
            Public graveyard
          </Link>
          {" · "}
          <Link href="/mine" className="underline-offset-4 hover:underline">
            My graveyard
          </Link>
          {" · "}
          <Link href="/mine?demo=1" className="underline-offset-4 hover:underline">
            Example plot
          </Link>
        </p>
      </div>
    </footer>
  );
}
