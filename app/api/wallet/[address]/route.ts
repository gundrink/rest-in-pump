import { isSolanaAddress } from "@/lib/address";
import { getWalletRateLimit } from "@/lib/config";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { UpstreamError } from "@/lib/upstream";
import { getWalletReport } from "@/lib/wallet-report";

export async function GET(request: Request, ctx: RouteContext<"/api/wallet/[address]">) {
  const { address } = await ctx.params;
  if (!isSolanaAddress(address)) {
    return Response.json({ error: "That does not look like a Solana address." }, { status: 400 });
  }

  const limit = rateLimit(`wallet:${clientIp(request)}`, getWalletRateLimit(), 60_000);
  if (!limit.ok) {
    return Response.json(
      { error: "The graveyard is busy. Try again in a minute." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  try {
    const report = await getWalletReport(address);
    return Response.json(report, {
      headers: { "Cache-Control": "private, max-age=60" },
    });
  } catch (error) {
    console.error("wallet route failed", {
      addressPrefix: address.slice(0, 4),
      name: error instanceof Error ? error.name : "unknown",
    });
    const message =
      error instanceof UpstreamError
        ? error.message
        : "The spirits could not reach the chain. Try again in a moment.";
    const status = error instanceof UpstreamError ? error.status : 502;
    return Response.json({ error: message }, { status });
  }
}
