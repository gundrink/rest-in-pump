import type { DeadThresholds } from "@/lib/types";

function readNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export function getThresholds(): DeadThresholds {
  const drawdownAbove = readNumber("DEAD_DRAWDOWN", 0.9);
  const nearZeroVolumeUsd = readNumber("DEAD_NEAR_ZERO_VOLUME_USD", 500);
  const lowVolumeDays = readNumber("DEAD_LOW_VOLUME_DAYS", 3);

  return {
    drawdownAbove: Math.min(0.999, Math.max(0, drawdownAbove)),
    nearZeroVolumeUsd: Math.max(0, nearZeroVolumeUsd),
    lowVolumeDays: Math.max(1, Math.round(lowVolumeDays)),
  };
}

export function getCacheTtlMs(): number {
  return Math.max(30, readNumber("CACHE_TTL_SECONDS", 600)) * 1000;
}

export function getHeliusTxLimit(): number {
  return Math.min(100, Math.max(1, Math.round(readNumber("HELIUS_TX_LIMIT", 100))));
}

export function getMintCap(): number {
  return Math.min(30, Math.max(1, Math.round(readNumber("WALLET_MINT_CAP", 30))));
}

export function getWalletRateLimit(): number {
  return Math.max(1, Math.round(readNumber("WALLET_RATE_LIMIT_PER_MINUTE", 10)));
}

export function heliusApiKey(): string | null {
  const key = process.env.HELIUS_API_KEY?.trim();
  return key ? key : null;
}
