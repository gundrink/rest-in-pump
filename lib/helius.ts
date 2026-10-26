import { getHeliusTxLimit } from "@/lib/config";
import { cleanLabel } from "@/lib/format";
import { readJson, UpstreamError } from "@/lib/upstream";

const DENY_MINTS = new Set([
  "So11111111111111111111111111111111111111112",
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
]);

const DENY_SYMBOLS = new Set(["SOL", "WSOL", "USDC", "USDT"]);

export type WalletMint = {
  mint: string;
  name: string;
  ticker: string;
  bagStatus: "still-holding" | "already-empty";
};

type Asset = {
  id?: string;
  interface?: string;
  content?: { metadata?: { name?: string; symbol?: string } };
  token_info?: { balance?: number; decimals?: number; symbol?: string };
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function heliusFailure(response: Response, body: unknown): UpstreamError {
  if (response.status === 401 || response.status === 403) {
    return new UpstreamError(
      "Helius rejected the API key. Check HELIUS_API_KEY, or remove it to use mock mode.",
      502,
    );
  }
  if (response.status === 429) {
    return new UpstreamError("Helius is rate limiting this app. Give it a minute and try again.", 429);
  }
  const record = asRecord(body);
  const message = typeof record?.message === "string" ? record.message : "";
  if (message.toLowerCase().includes("invalid address") || response.status === 400) {
    return new UpstreamError("That address was not accepted by the chain index.", 400);
  }
  return new UpstreamError("Helius did not answer. Nothing was buried on a guess.", 502);
}

function isFungible(asset: Asset): boolean {
  const iface = asset.interface ?? "";
  if (iface === "Native") return false;
  if (iface.includes("NonFungible") || iface.includes("NFT")) return false;
  if (iface === "FungibleToken" || iface === "FungibleAsset") return true;
  return typeof asset.token_info?.decimals === "number" && asset.token_info.decimals > 0;
}

function symbolOf(asset: Asset): string {
  return asset.token_info?.symbol || asset.content?.metadata?.symbol || "";
}

function nameOf(asset: Asset, ticker: string): string {
  return cleanLabel(asset.content?.metadata?.name || ticker, 48, ticker);
}

async function fetchAssets(address: string, apiKey: string): Promise<{ mints: WalletMint[]; truncated: boolean }> {
  let response: Response;
  try {
    response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "rest-in-pump",
        method: "getAssetsByOwner",
        params: {
          ownerAddress: address,
          page: 1,
          limit: 100,
          displayOptions: { showFungible: true, showNativeBalance: false },
        },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    throw new UpstreamError("Helius did not answer. Nothing was buried on a guess.", 502);
  }

  const body = await readJson(response);
  if (!response.ok) throw heliusFailure(response, body);

  const record = asRecord(body);
  const error = asRecord(record?.error);
  if (error) throw heliusFailure(response, error);

  const result = asRecord(record?.result);
  const items = Array.isArray(result?.items) ? result.items : [];
  const total = typeof result?.total === "number" ? result.total : items.length;
  const mints: WalletMint[] = [];

  for (const item of items) {
    const asset = item as Asset;
    const mint = asset.id;
    if (!mint || DENY_MINTS.has(mint) || !isFungible(asset)) continue;
    const ticker = cleanLabel(symbolOf(asset), 16, mint.slice(0, 4).toUpperCase());
    if (DENY_SYMBOLS.has(ticker.toUpperCase())) continue;
    const rawBalance = asset.token_info?.balance ?? 0;
    if (rawBalance <= 0) continue;
    mints.push({
      mint,
      ticker,
      name: nameOf(asset, ticker),
      bagStatus: "still-holding",
    });
  }

  return { mints, truncated: total > items.length };
}

async function fetchHistoryMints(address: string, apiKey: string): Promise<string[]> {
  const limit = getHeliusTxLimit();
  let response: Response;
  try {
    response = await fetch(
      `https://api.helius.xyz/v0/addresses/${encodeURIComponent(address)}/transactions?api-key=${encodeURIComponent(apiKey)}&limit=${limit}`,
      {
        headers: { accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(12_000),
      },
    );
  } catch {
    throw new UpstreamError("Helius did not answer. Nothing was buried on a guess.", 502);
  }

  const body = await readJson(response);
  if (!response.ok) throw heliusFailure(response, body);
  if (!Array.isArray(body)) return [];

  const mints = new Set<string>();
  for (const tx of body) {
    const record = asRecord(tx);
    const transfers = record?.tokenTransfers;
    if (!Array.isArray(transfers)) continue;
    for (const transfer of transfers) {
      const row = asRecord(transfer);
      const mint = row?.mint;
      const from = row?.fromUserAccount;
      const to = row?.toUserAccount;
      if (typeof mint !== "string" || DENY_MINTS.has(mint)) continue;
      if (from === address || to === address) mints.add(mint);
    }
  }
  return [...mints];
}

export async function fetchWalletMints(
  address: string,
  apiKey: string,
): Promise<{ mints: WalletMint[]; holdings: number; historyMints: number; truncated: boolean }> {
  const [assets, history] = await Promise.all([
    fetchAssets(address, apiKey),
    fetchHistoryMints(address, apiKey),
  ]);

  const byMint = new Map<string, WalletMint>();
  for (const mint of assets.mints) byMint.set(mint.mint, mint);

  for (const mint of history) {
    if (byMint.has(mint)) continue;
    byMint.set(mint, {
      mint,
      name: "Unnamed coin",
      ticker: mint.slice(0, 4).toUpperCase(),
      bagStatus: "already-empty",
    });
  }

  return {
    mints: [...byMint.values()],
    holdings: assets.mints.length,
    historyMints: history.length,
    truncated: assets.truncated || history.length >= getHeliusTxLimit(),
  };
}
