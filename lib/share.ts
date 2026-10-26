export function tombstoneWord(count: number): string {
  return count === 1 ? "tombstone" : "tombstones";
}

export function shareText(count: number, kind: "mine" | "public"): string {
  const noun = tombstoneWord(count);
  if (kind === "public") {
    return `The public graveyard has ${count} example ${noun} 💀 Rest in pump. We have all been rugged.`;
  }
  if (count === 0) {
    return "My graveyard has 0 tombstones 💀 Either the coins are still twitching, or I already touched grass. Rest in pump.";
  }
  return `My graveyard has ${count} ${noun} 💀 Rest in pump. We have all been rugged.`;
}
