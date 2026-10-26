import Link from "next/link";
import { GraveyardBrowser } from "@/components/graveyard-browser";
import { SharePanel } from "@/components/share-panel";
import { formatTimestamp } from "@/lib/format";
import { shortAddress } from "@/lib/address";
import type { WalletReport } from "@/lib/types";

export function MineReport({ report }: { report: WalletReport }) {
  const count = report.tombstones.length;

  return (
    <div className="mt-8 flex flex-col gap-4">
      <div
        data-testid="mock-banner"
        className={
          report.mode === "mock"
            ? "rounded-2xl border border-[#ff7a18] bg-[#ff7a18]/15 p-4"
            : "rounded-2xl border border-[#8fd18a]/40 bg-[#8fd18a]/10 p-4"
        }
      >
        <p className="text-sm font-semibold tracking-wide">
          {report.mode === "mock" ? "MOCK MODE · EXAMPLE DATA" : "LIVE READ"}
        </p>
        <p className="mt-1 text-sm leading-6 text-foreground/90">{report.notice}</p>
      </div>

      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
        <p>
          {report.address ? (
            <>
              Viewing <span className="text-foreground">{shortAddress(report.address)}</span>
              <span className="sr-only"> {report.address}</span>
            </>
          ) : (
            "Viewing the example plot"
          )}
          {" · "}
          {report.sourceLabel}
          {" · Updated "}
          <time dateTime={report.updatedAt}>{formatTimestamp(report.updatedAt)}</time>
        </p>
        {report.mode === "live" ? (
          <p>
            Scanned {report.scan.holdings} current fungible balances and {report.scan.historyMints} mints from
            recent history. Priced {report.scan.priced}. Cap is {report.scan.mintCap} mints and{" "}
            {report.scan.transactionCap} transactions.
            {report.scan.truncated ? " This wallet was truncated, so older coins may be missing." : ""}
          </p>
        ) : null}
        <p>
          A coin is buried when it is down more than {Math.round(report.thresholds.drawdownAbove * 100)}% from
          its peak, or when 24h volume is at or under ${report.thresholds.nearZeroVolumeUsd} for{" "}
          {report.thresholds.lowVolumeDays} low-volume days.
        </p>
      </div>

      {count === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/20 p-6">
          <h2 className="font-display text-3xl">No tombstones</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Nothing here cleared the dead-coin rules. Either the bags are still twitching, the history cap
            missed an older trade, or this wallet already touched grass. We do not invent funerals.
          </p>
          <p className="mt-4">
            <Link href="/graveyard" className="font-semibold underline-offset-4 hover:underline">
              Walk the public hill instead
            </Link>
          </p>
        </div>
      ) : (
        <GraveyardBrowser tombstones={report.tombstones} shareKind="mine" shareMode={report.mode} />
      )}

      {count === 0 ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">Share still works for an empty plot. Zero is a kind of flex.</p>
          <SharePanel count={0} kind="mine" mode={report.mode} />
        </div>
      ) : null}

      {report.leftOutAlive.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          Left above ground, still moving: {report.leftOutAlive.join(", ")}. No tombstone until they qualify.
        </p>
      ) : null}
      {report.unpriced > 0 ? (
        <p className="text-sm text-muted-foreground">
          {report.unpriced} {report.unpriced === 1 ? "token had" : "tokens had"} no public DexScreener market,
          so {report.unpriced === 1 ? "it was" : "they were"} left unburied. No chart, no funeral.
        </p>
      ) : null}
    </div>
  );
}
