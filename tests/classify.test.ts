import assert from "node:assert/strict";
import test from "node:test";
import { classify, drawdownIsFatal, drawdownOf } from "../lib/classify";
import { getThresholds } from "../lib/config";
import { estimatePeak, lowVolumeStreak } from "../lib/market";
import { EXAMPLE_ALIVE, EXAMPLE_DEAD } from "../lib/samples";
import type { MarketSnapshot } from "../lib/types";

const thresholds = {
  drawdownAbove: 0.9,
  nearZeroVolumeUsd: 500,
  lowVolumeDays: 3,
};

function snapshot(overrides: Partial<MarketSnapshot> = {}): MarketSnapshot {
  return {
    id: "t",
    name: "Test Coin",
    ticker: "TEST",
    mint: "example:test",
    bornAt: "2026-01-01T00:00:00.000Z",
    diedAt: null,
    athUsd: 100,
    athKind: "recorded",
    priceUsd: 50,
    volume24hUsd: 10_000,
    lowVolumeDays: 0,
    held: false,
    bagStatus: "unknown",
    isExample: true,
    chartUrl: null,
    ...overrides,
  };
}

test("exactly 90% off the peak is still alive", () => {
  const drawdown = drawdownOf(1000, 100);
  assert.equal(drawdown, 0.9);
  assert.equal(drawdownIsFatal(0.9, 0.9), false);
  const stone = classify(snapshot({ athUsd: 1000, priceUsd: 100, volume24hUsd: 10_000, lowVolumeDays: 0 }), thresholds);
  assert.equal(stone.dead, false);
});

test("more than 90% off the peak is dead even with volume", () => {
  const stone = classify(
    snapshot({ athUsd: 1000, priceUsd: 99, volume24hUsd: 50_000, lowVolumeDays: 0 }),
    thresholds,
  );
  assert.equal(stone.dead, true);
  assert.deepEqual(stone.deadBecause, ["drawdown"]);
  assert.equal(stone.causeOfDeath, "Gravity, applied with enthusiasm");
});

test("a 99% fall is buried by a block-0 bundle", () => {
  const stone = classify(snapshot({ athUsd: 100, priceUsd: 0.5, volume24hUsd: 9_000, lowVolumeDays: 0 }), thresholds);
  assert.equal(stone.bucket, "dust");
  assert.equal(stone.causeOfDeath, "Buried by a block-0 bundle");
});

test("near-zero volume for the required streak is dead without a crash", () => {
  const stone = classify(
    snapshot({ athUsd: 10, priceUsd: 8, volume24hUsd: 20, lowVolumeDays: 3 }),
    thresholds,
  );
  assert.equal(stone.dead, true);
  assert.deepEqual(stone.deadBecause, ["volume"]);
  assert.equal(stone.causeOfDeath, "Volume went to touch grass and stayed there");
});

test("one quiet day is not enough when price is fine", () => {
  const stone = classify(
    snapshot({ athUsd: 10, priceUsd: 8, volume24hUsd: 20, lowVolumeDays: 1 }),
    thresholds,
  );
  assert.equal(stone.dead, false);
});

test("volume above the near-zero bar keeps a quiet streak alive", () => {
  const stone = classify(
    snapshot({ athUsd: 10, priceUsd: 8, volume24hUsd: 600, lowVolumeDays: 9 }),
    thresholds,
  );
  assert.equal(stone.dead, false);
});

test("missing price and volume is not declared dead", () => {
  const stone = classify(
    snapshot({ athUsd: null, athKind: "unknown", priceUsd: null, volume24hUsd: null, lowVolumeDays: 0 }),
    thresholds,
  );
  assert.equal(stone.dead, false);
  assert.equal(stone.epitaph.length > 0, true);
});

test("the same stats always carve the same epitaph", () => {
  const input = snapshot({ ticker: "MOONCAT", name: "Mooncat on a Stick", athUsd: 1, priceUsd: 0.001 });
  assert.equal(classify(input, thresholds).epitaph, classify(input, thresholds).epitaph);
});

test("example hill is all dead, and the alive fixtures stay alive", () => {
  const defaults = getThresholds();
  for (const coin of EXAMPLE_DEAD) {
    assert.equal(classify(coin, defaults).dead, true, coin.ticker);
    assert.equal(coin.isExample, true);
  }
  for (const coin of EXAMPLE_ALIVE) {
    assert.equal(classify(coin, defaults).dead, false, coin.ticker);
  }
  const moon = classify(EXAMPLE_DEAD[0]!, defaults);
  assert.equal(moon.causeOfDeath, "Buried by a block-0 bundle");
});

test("24h windows estimate a peak, and a flat chart stays unknown", () => {
  const higher = estimatePeak(1, { h24: -50 });
  assert.equal(higher.kind, "window-estimate");
  assert.ok(higher.peak > 1.9 && higher.peak < 2.1);

  const flat = estimatePeak(1, { h24: 0, h6: 0, h1: 0 });
  assert.equal(flat.kind, "unknown");
});

test("all three quiet DexScreener windows count as the configured streak", () => {
  assert.equal(lowVolumeStreak({ h24: 10, h6: 0, h1: 0 }, 500, 3), 3);
  assert.equal(lowVolumeStreak({ h24: 10, h6: 800, h1: 0 }, 500, 3), 1);
  assert.equal(lowVolumeStreak({ h24: 900, h6: 0, h1: 0 }, 500, 3), 0);
});
