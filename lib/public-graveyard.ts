import { classify } from "@/lib/classify";
import { getThresholds } from "@/lib/config";
import { EXAMPLE_DEAD } from "@/lib/samples";
import type { MarketSnapshot, PublicGraveyard } from "@/lib/types";

/**
 * Swap the public hill by adding a source here and setting GRAVEYARD_SOURCE.
 * Wallet lookups are a separate path (Helius + DexScreener, or mock).
 */
export interface PublicGraveyardSource {
  id: string;
  label: string;
  notice: string;
  loadSnapshots(): MarketSnapshot[];
}

const exampleSource: PublicGraveyardSource = {
  id: "example",
  label: "EXAMPLE",
  notice:
    "Every stone on this hill is fictional EXAMPLE data, labelled so it cannot pretend to be a live market. Names are made up. If a real ticker matches, that is a spooky coincidence, not a verdict.",
  loadSnapshots: () => EXAMPLE_DEAD,
};

const SOURCES: Record<string, PublicGraveyardSource> = {
  example: exampleSource,
};

export function listPublicSources(): string[] {
  return Object.keys(SOURCES);
}

export function getPublicSource(): PublicGraveyardSource {
  const requested = process.env.GRAVEYARD_SOURCE?.trim() || "example";
  const source = SOURCES[requested];
  if (!source) {
    throw new Error(
      `Unknown GRAVEYARD_SOURCE "${requested}". Available: ${listPublicSources().join(", ")}.`,
    );
  }
  return source;
}

export function getPublicGraveyard(): PublicGraveyard {
  const source = getPublicSource();
  const thresholds = getThresholds();
  const tombstones = source
    .loadSnapshots()
    .map((snapshot) => classify(snapshot, thresholds))
    .filter((stone) => stone.dead);

  return {
    sourceId: source.id,
    label: source.label,
    notice: source.notice,
    thresholds,
    tombstones,
  };
}
