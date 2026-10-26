import { classify } from "@/lib/classify";
import {
  getCacheTtlMs,
  getHeliusTxLimit,
  getMintCap,
  getThresholds,
  heliusApiKey,
} from "@/lib/config";
import { cached } from "@/lib/cache";
import { hashString } from "@/lib/hash";
import { fetchDexSnapshots } from "@/lib/dexscreener";
import { fetchWalletMints } from "@/lib/helius";
import { EXAMPLE_ALIVE, EXAMPLE_DEAD } from "@/lib/samples";
import type { BagStatus, MarketSnapshot, Tombstone, WalletReport } from "@/lib/types";

const MOCK_NOTICE =
  "Mock mode. These are EXAMPLE tombstones, not this wallet's real coins. No chain was read. Add HELIUS_API_KEY on the server when you want live holdings and history.";

const DEMO_NOTICE =
  "EXAMPLE graveyard, opened on purpose. These coins are fictional. Connect a wallet or paste an address, and without an API key you will still see labelled examples.";

function emptyScan(truncated = false): WalletReport["scan"] {
  return {
    holdings: 0,
    historyMints: 0,
    priced: 0,
    truncated,
    transactionCap: 0,
    mintCap: 0,
  };
}

function withBag(snapshot: MarketSnapshot, bagStatus: BagStatus): MarketSnapshot {
  return { ...snapshot, held: true, bagStatus };
}

export function mockWalletReport(address: string | null, demo: boolean): WalletReport {
  const thresholds = getThresholds();
  const dead = EXAMPLE_DEAD.map((snapshot) => classify(snapshot, thresholds)).filter((stone) => stone.dead);
  const alive = EXAMPLE_ALIVE.map((snapshot) => classify(snapshot, thresholds)).filter((stone) => !stone.dead);

  const hash = hashString(address ?? "demo");
  const count = demo ? Math.min(8, dead.length) : 4 + (hash % 8);
  const start = demo ? 0 : hash % dead.length;
  const picked: Tombstone[] = [];
  for (let index = 0; index < Math.min(count, dead.length); index += 1) {
    const stone = dead[(start + index) % dead.length];
    if (!stone) continue;
    const bagStatus: BagStatus = (hash + index) % 2 === 0 ? "still-holding" : "already-empty";
    picked.push({ ...stone, ...withBag(stone, bagStatus), held: true });
  }

  return {
    mode: "mock",
    demo,
    address,
    updatedAt: new Date().toISOString(),
    sourceLabel: "EXAMPLE dataset",
    notice: demo ? DEMO_NOTICE : MOCK_NOTICE,
    scan: emptyScan(false),
    tombstones: picked,
    leftOutAlive: alive.map((stone) => stone.ticker),
    unpriced: 0,
    thresholds,
  };
}

async function liveWalletReport(address: string, apiKey: string): Promise<WalletReport> {
  const thresholds = getThresholds();
  const mintCap = getMintCap();
  const found = await fetchWalletMints(address, apiKey);
  const limited = found.mints.slice(0, mintCap);
  const priced = await fetchDexSnapshots(limited);

  const tombstones: Tombstone[] = [];
  const leftOutAlive: string[] = [];

  for (const snapshot of priced.snapshots) {
    const stone = classify(snapshot, thresholds);
    if (stone.dead) tombstones.push(stone);
    else leftOutAlive.push(stone.ticker);
  }

  tombstones.sort((a, b) => (b.drawdown ?? -1) - (a.drawdown ?? -1));

  return {
    mode: "live",
    demo: false,
    address,
    updatedAt: new Date().toISOString(),
    sourceLabel: "Helius wallet history + DexScreener price and volume",
    notice:
      "Live read. The wallet connection, if you used one, only shared the public address. Peak on live coins is estimated from DexScreener's recent price windows, not a full all-time high. Coins that went quiet before that window are buried when volume is near zero. History is capped, so an older bag can still be underground.",
    scan: {
      holdings: found.holdings,
      historyMints: found.historyMints,
      priced: priced.snapshots.length,
      truncated: found.truncated || found.mints.length > mintCap,
      transactionCap: getHeliusTxLimit(),
      mintCap,
    },
    tombstones,
    leftOutAlive: leftOutAlive.slice(0, 8),
    unpriced: priced.unpriced + Math.max(0, found.mints.length - mintCap),
    thresholds,
  };
}

export async function getWalletReport(address: string): Promise<WalletReport> {
  const apiKey = heliusApiKey();
  if (!apiKey) return mockWalletReport(address, false);

  const thresholds = getThresholds();
  const key = [
    "wallet",
    address,
    thresholds.drawdownAbove,
    thresholds.nearZeroVolumeUsd,
    thresholds.lowVolumeDays,
    getMintCap(),
  ].join(":");

  return cached(key, getCacheTtlMs(), () => liveWalletReport(address, apiKey));
}
