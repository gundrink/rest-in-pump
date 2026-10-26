import { getThresholds } from "@/lib/config";
import { cleanLabel } from "@/lib/format";
import { estimatePeak, lowVolumeStreak } from "@/lib/market";
import type { MarketSnapshot } from "@/lib/types";
import { readJson, UpstreamError } from "@/lib/upstream";
import type { WalletMint } from "@/lib/helius";

type DexPair = {
  url?: string;
  baseToken?: { address?: string; name?: string; symbol?: string };
  priceUsd?: string;
  volume?: { h24?: number; h6?: number; h1?: number };
  priceChange?: { h24?: number; h6?: number; h1?: number };
  liquidity?: { usd?: number };
  pairCreatedAt?: number;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function pairsFrom(body: unknown): DexPair[] {
  if (Array.isArray(body)) return body as DexPair[];
  const record = asRecord(body);
  if (Array.isArray(record?.pairs)) return record.pairs as DexPair[];
  return [];
}

function safeChartUrl(url: unknown): string | null {
  if (typeof url !== "string") return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    const allowed = host === "dexscreener.com" || host.endsWith(".dexscreener.com");
    if (parsed.protocol !== "https:" || !allowed) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function bestPairs(pairs: DexPair[]): Map<string, DexPair> {
  const best = new Map<string, DexPair>();
  for (const pair of pairs) {
    const mint = pair.baseToken?.address;
    if (!mint) continue;
    const current = best.get(mint);
    const liquidity = pair.liquidity?.usd ?? 0;
    const previous = current?.liquidity?.usd ?? -1;
    if (!current || liquidity > previous) best.set(mint, pair);
  }
  return best;
}

export function snapshotFromPair(mint: WalletMint, pair: DexPair | undefined): MarketSnapshot | null {
  if (!pair) return null;
  const price = Number(pair.priceUsd);
  if (!Number.isFinite(price) || price < 0) return null;

  const thresholds = getThresholds();
  const volume = {
    h1: pair.volume?.h1 ?? 0,
    h6: pair.volume?.h6 ?? 0,
    h24: pair.volume?.h24 ?? 0,
  };
  const peak = estimatePeak(price, pair.priceChange ?? {});
  const ticker = cleanLabel(pair.baseToken?.symbol || mint.ticker, 16, mint.ticker);
  const name = cleanLabel(pair.baseToken?.name || mint.name, 48, ticker);
  const bornAt =
    typeof pair.pairCreatedAt === "number" && pair.pairCreatedAt > 0
      ? new Date(pair.pairCreatedAt).toISOString()
      : null;

  return {
    id: mint.mint,
    mint: mint.mint,
    name,
    ticker,
    bornAt,
    diedAt: null,
    athUsd: peak.kind === "unknown" ? null : peak.peak,
    athKind: peak.kind,
    priceUsd: price,
    volume24hUsd: volume.h24,
    lowVolumeDays: lowVolumeStreak(volume, thresholds.nearZeroVolumeUsd, thresholds.lowVolumeDays),
    held: true,
    bagStatus: mint.bagStatus,
    isExample: false,
    chartUrl: safeChartUrl(pair.url),
  };
}

export async function fetchDexSnapshots(mints: WalletMint[]): Promise<{
  snapshots: MarketSnapshot[];
  unpriced: number;
}> {
  if (mints.length === 0) return { snapshots: [], unpriced: 0 };

  let response: Response;
  try {
    response = await fetch(
      `https://api.dexscreener.com/tokens/v1/solana/${mints.map((mint) => mint.mint).join(",")}`,
      {
        headers: { accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(12_000),
      },
    );
  } catch {
    throw new UpstreamError("DexScreener did not answer, so nothing was priced and nothing was buried.", 502);
  }

  const body = await readJson(response);
  if (!response.ok) {
    if (response.status === 429) {
      throw new UpstreamError("DexScreener is rate limiting this app. Try again in a minute.", 429);
    }
    throw new UpstreamError("DexScreener did not answer, so nothing was priced and nothing was buried.", 502);
  }

  const byMint = bestPairs(pairsFrom(body));
  const snapshots: MarketSnapshot[] = [];
  let unpriced = 0;

  for (const mint of mints) {
    const snapshot = snapshotFromPair(mint, byMint.get(mint.mint));
    if (!snapshot) {
      unpriced += 1;
      continue;
    }
    snapshots.push(snapshot);
  }

  return { snapshots, unpriced };
}
