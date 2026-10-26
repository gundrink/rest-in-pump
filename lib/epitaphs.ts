import { hashString } from "@/lib/hash";
import type { EpitaphBucket } from "@/lib/types";

/**
 * Number-free on purpose, so "hide the numbers" still leaves a real epitaph.
 * The joke points at the coin and at us, never at a person who got hurt.
 */
export const EPITAPH_TEMPLATES: Record<EpitaphBucket, readonly string[]> = {
  dust: [
    "{ticker} left the block so fast the candle is still looking for it.",
    "Here lies {name}. The welcome message arrived after the funeral.",
    "Born, bundled, buried. We have all seen this episode.",
    "A peak so brief it qualifies as folklore.",
    "The chart did not bleed out. It teleported.",
    "{name} wanted a community. It got a timestamp.",
    "We lit a pumpkin, not a leverage. Goodnight, {ticker}.",
    "If speed were a love language, this one ghosted.",
    "Rest in pump, {ticker}. The screenshot survives.",
  ],
  buried: [
    "Liquidity was a visiting professor. Class dismissed.",
    "{ticker} taught us that early is a spectrum.",
    "The dev said soon. Soon became a season.",
    "Holders wanted a story. They got a candlestick.",
    "Not a villain origin. Just a coin that ran out of music.",
    "May the next ticker be kinder, or at least slower.",
    "We do not blame the ghost. We were holding the candle.",
    "In memory of a short bull run and a longer lesson.",
    "The group chat said this one was different. The group chat means well.",
  ],
  faded: [
    "Down bad, spirit intact. That is the whole religion.",
    "A slow fade, which is its own kind of jump scare.",
    "{name} did not explode. It exhaled, for weeks.",
    "The ATH was a guest star. It did not renew.",
    "Still on the chart, mostly as a memory with decimals.",
    "We checked the price so the price would not feel lonely.",
    "Gravity, but polite about it. Still gravity.",
    "A memorial for everyone who refreshed the chart at 3 a.m.",
    "It pumped in our hearts. The chart declined to cosign.",
  ],
  silent: [
    "Volume left the chat. The holders stayed for the bit.",
    "Flat candles, full memories. A fair trade, somehow.",
    "The order book is a library now. Please whisper.",
    "{ticker} achieved permanent gm.",
    "No drama on the way out. Just a very quiet chart.",
    "If copium were a candle, this grave would still be lit.",
    "The market moved on. We kept the sticker.",
    "Here rests a ticker that outlived its roadmap by several memes.",
    "Touch grass was the only roadmap that shipped.",
  ],
};

export function epitaphCount(): number {
  return Object.values(EPITAPH_TEMPLATES).reduce((sum, pool) => sum + pool.length, 0);
}

export function epitaphFor(input: {
  ticker: string;
  name: string;
  bucket: EpitaphBucket;
}): string {
  const pool = EPITAPH_TEMPLATES[input.bucket];
  const index = hashString(`${input.bucket}|${input.ticker}|${input.name}`) % pool.length;
  const template = pool[index] ?? pool[0] ?? "Rest in pump.";
  return template.replaceAll("{ticker}", input.ticker).replaceAll("{name}", input.name);
}
