export type DataMode = "mock" | "live";

export type AthKind = "recorded" | "window-estimate" | "unknown";

export type BagStatus = "still-holding" | "already-empty" | "unknown";

export type DeadReason = "drawdown" | "volume";

export type EpitaphBucket = "dust" | "buried" | "faded" | "silent";

/** Market facts before the epitaph and the dead/alive call. */
export type MarketSnapshot = {
  id: string;
  name: string;
  ticker: string;
  mint: string;
  bornAt: string | null;
  /** A known death date. Live visits leave this empty and say "observed this visit". */
  diedAt: string | null;
  athUsd: number | null;
  athKind: AthKind;
  priceUsd: number | null;
  volume24hUsd: number | null;
  lowVolumeDays: number;
  held: boolean;
  bagStatus: BagStatus;
  isExample: boolean;
  chartUrl: string | null;
};

export type Tombstone = MarketSnapshot & {
  drawdown: number | null;
  dead: boolean;
  deadBecause: DeadReason[];
  causeOfDeath: string;
  epitaph: string;
  bucket: EpitaphBucket;
};

export type DeadThresholds = {
  /** Dead by price when drawdown is strictly greater than this. 0.9 means more than 90%. */
  drawdownAbove: number;
  /** 24h volume at or under this USD amount counts as near-zero. */
  nearZeroVolumeUsd: number;
  /** Consecutive near-zero days required for the volume rule. */
  lowVolumeDays: number;
};

export type PublicGraveyard = {
  sourceId: string;
  label: string;
  notice: string;
  thresholds: DeadThresholds;
  tombstones: Tombstone[];
};

export type WalletScan = {
  holdings: number;
  historyMints: number;
  priced: number;
  truncated: boolean;
  transactionCap: number;
  mintCap: number;
};

export type WalletReport = {
  mode: DataMode;
  demo: boolean;
  address: string | null;
  updatedAt: string;
  sourceLabel: string;
  notice: string;
  scan: WalletScan;
  tombstones: Tombstone[];
  leftOutAlive: string[];
  unpriced: number;
  thresholds: DeadThresholds;
};
