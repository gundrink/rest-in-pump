import assert from "node:assert/strict";
import test from "node:test";
import { isSolanaAddress } from "../lib/address";
import { shareText } from "../lib/share";
import { mockWalletReport } from "../lib/wallet-report";

test("accepts a 32-byte base58 address and rejects junk", () => {
  assert.equal(isSolanaAddress("11111111111111111111111111111111"), true);
  assert.equal(isSolanaAddress("  11111111111111111111111111111111  "), true);
  assert.equal(isSolanaAddress("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"), true);
  assert.equal(isSolanaAddress("not-an-address"), false);
  assert.equal(isSolanaAddress("0OIl111111111111111111111111111111"), false);
  assert.equal(isSolanaAddress(""), false);
  assert.equal(isSolanaAddress("example:mooncat"), false);
});

test("share text names the tombstone count", () => {
  assert.match(shareText(14, "mine"), /My graveyard has 14 tombstones/);
  assert.match(shareText(1, "mine"), /1 tombstone/);
  assert.match(shareText(12, "public"), /example/);
  assert.doesNotMatch(shareText(3, "mine"), /airdrop|refund|profit/i);
});

test("mock mode labels example graves and does not depend on an API key", () => {
  const report = mockWalletReport("11111111111111111111111111111111", false);
  assert.equal(report.mode, "mock");
  assert.ok(report.tombstones.length >= 4);
  assert.ok(report.tombstones.every((stone) => stone.isExample && stone.dead));
  assert.match(report.notice, /EXAMPLE/);
  assert.deepEqual(
    mockWalletReport("11111111111111111111111111111111", false).tombstones.map((stone) => stone.ticker),
    report.tombstones.map((stone) => stone.ticker),
  );
});
