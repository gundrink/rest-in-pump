import assert from "node:assert/strict";
import test from "node:test";
import { EPITAPH_TEMPLATES, epitaphCount, epitaphFor } from "../lib/epitaphs";

const BANNED = [/airdrop/i, /refund/i, /seed phrase/i, /guaranteed/i, /profit/i, /ngmi/i, /sucker/i, /idiot/i];

test("there are at least 30 epitaph templates", () => {
  assert.ok(epitaphCount() >= 30);
  for (const pool of Object.values(EPITAPH_TEMPLATES)) {
    assert.ok(pool.length >= 8);
    for (const line of pool) {
      assert.ok(line.trim().length > 12);
      for (const pattern of BANNED) {
        assert.equal(pattern.test(line), false, line);
      }
    }
  }
});

test("epitaph selection is deterministic and keyed by the bucket", () => {
  const first = epitaphFor({ ticker: "MOONCAT", name: "Mooncat on a Stick", bucket: "dust" });
  const second = epitaphFor({ ticker: "MOONCAT", name: "Mooncat on a Stick", bucket: "dust" });
  const otherBucket = epitaphFor({ ticker: "MOONCAT", name: "Mooncat on a Stick", bucket: "silent" });
  assert.equal(first, second);
  assert.notEqual(first, otherBucket);
  assert.match(first, /MOONCAT|Mooncat on a Stick/);
});
