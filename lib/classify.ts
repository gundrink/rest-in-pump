import { epitaphFor } from "@/lib/epitaphs";
import type {
  DeadReason,
  DeadThresholds,
  EpitaphBucket,
  MarketSnapshot,
  Tombstone,
} from "@/lib/types";

export function drawdownOf(athUsd: number | null, priceUsd: number | null): number | null {
  if (athUsd == null || priceUsd == null) return null;
  if (!Number.isFinite(athUsd) || !Number.isFinite(priceUsd) || athUsd <= 0 || priceUsd < 0) {
    return null;
  }
  const dropped = athUsd - priceUsd;
  if (dropped <= 0) return 0;
  return dropped / athUsd;
}

function basisPoints(value: number): number {
  return Math.round(value * 10_000);
}

/** Strictly greater than the configured drawdown. Exactly 90% stays alive. */
export function drawdownIsFatal(drawdown: number, threshold: number): boolean {
  return basisPoints(drawdown) > basisPoints(threshold);
}

export function epitaphBucket(drawdown: number | null, threshold: number): EpitaphBucket {
  if (drawdown == null) return "silent";
  const points = basisPoints(drawdown);
  if (points >= 9900) return "dust";
  if (points >= 9500) return "buried";
  if (points > basisPoints(threshold)) return "faded";
  return "silent";
}

export function causeOfDeath(
  drawdown: number | null,
  reasons: DeadReason[],
): string {
  const points = drawdown == null ? 0 : basisPoints(drawdown);
  if (reasons.includes("drawdown") && reasons.includes("volume") && points < 9500) {
    return "A quiet chart after a long fall";
  }
  if (points >= 9900) return "Buried by a block-0 bundle";
  if (points >= 9700) return "Liquidity caught the last flight out";
  if (points >= 9500) return "The dev waved, then the chart did";
  if (reasons.includes("drawdown")) return "Gravity, applied with enthusiasm";
  return "Volume went to touch grass and stayed there";
}

export function classify(snapshot: MarketSnapshot, thresholds: DeadThresholds): Tombstone {
  const drawdown = drawdownOf(snapshot.athUsd, snapshot.priceUsd);
  const deadBecause: DeadReason[] = [];

  if (drawdown != null && drawdownIsFatal(drawdown, thresholds.drawdownAbove)) {
    deadBecause.push("drawdown");
  }

  if (
    snapshot.volume24hUsd != null &&
    snapshot.volume24hUsd <= thresholds.nearZeroVolumeUsd &&
    snapshot.lowVolumeDays >= thresholds.lowVolumeDays
  ) {
    deadBecause.push("volume");
  }

  const bucket = epitaphBucket(drawdown, thresholds.drawdownAbove);

  return {
    ...snapshot,
    drawdown,
    dead: deadBecause.length > 0,
    deadBecause,
    causeOfDeath: causeOfDeath(drawdown, deadBecause),
    epitaph: epitaphFor({
      ticker: snapshot.ticker,
      name: snapshot.name,
      bucket,
    }),
    bucket,
  };
}
