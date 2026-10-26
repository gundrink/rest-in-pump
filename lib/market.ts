import type { AthKind } from "@/lib/types";

export type PriceWindows = {
  h1?: number;
  h6?: number;
  h24?: number;
};

export type VolumeWindows = {
  h1: number;
  h6: number;
  h24: number;
};

/**
 * DexScreener gives price change over hours, not a stored all-time high.
 * Reconstruct the highest price implied by those windows. If nothing sits
 * above the spot price, the peak is unknown and the volume rule does the work.
 */
export function estimatePeak(
  priceUsd: number,
  change: PriceWindows,
): { peak: number; kind: AthKind } {
  if (!Number.isFinite(priceUsd) || priceUsd < 0) {
    return { peak: 0, kind: "unknown" };
  }

  let peak = priceUsd;
  let sawHigher = false;

  for (const pct of [change.h1, change.h6, change.h24]) {
    if (typeof pct !== "number" || !Number.isFinite(pct) || pct <= -99.99) continue;
    const past = priceUsd / (1 + pct / 100);
    if (!Number.isFinite(past) || past <= 0) continue;
    if (past > peak * 1.001) {
      peak = past;
      sawHigher = true;
    }
  }

  if (!sawHigher) return { peak: priceUsd, kind: "unknown" };
  return { peak, kind: "window-estimate" };
}

/**
 * Live mode has no stored daily volume. If the 24h, 6h, and 1h windows are
 * all near zero, treat that as the configured streak. A quiet 24h with a
 * busier shorter window counts as a single day, which is not enough to bury.
 */
export function lowVolumeStreak(
  volume: VolumeWindows,
  thresholdUsd: number,
  requiredDays: number,
): number {
  if (volume.h24 > thresholdUsd) return 0;
  if (volume.h6 <= thresholdUsd && volume.h1 <= thresholdUsd) return requiredDays;
  return 1;
}
