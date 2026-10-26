import { connection } from "next/server";
import { MineReport } from "@/components/mine-report";
import { isSolanaAddress } from "@/lib/address";
import { UpstreamError } from "@/lib/upstream";
import type { WalletReport } from "@/lib/types";
import { getWalletReport, mockWalletReport } from "@/lib/wallet-report";

async function loadReport(
  address: string,
): Promise<{ ok: true; report: WalletReport } | { ok: false; message: string }> {
  try {
    return { ok: true, report: await getWalletReport(address) };
  } catch (error) {
    console.error("wallet report failed", {
      addressPrefix: address.slice(0, 4),
      name: error instanceof Error ? error.name : "unknown",
    });
    return {
      ok: false,
      message:
        error instanceof UpstreamError
          ? error.message
          : "The spirits could not reach the chain. Try again in a moment.",
    };
  }
}

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export async function MineResults({
  searchParams,
}: {
  searchParams: Promise<{ address?: string | string[]; demo?: string | string[] }>;
}) {
  await connection();
  const params = await searchParams;
  const address = first(params.address)?.trim() ?? "";
  const demo = first(params.demo) === "1";

  if (!address && demo) {
    return <MineReport report={mockWalletReport(null, true)} />;
  }

  if (!address) {
    return (
      <p className="mt-8 max-w-xl text-muted-foreground">
        No wallet yet. Connect read-only, paste an address, or peek at the example plot. Until then, this
        page is just a gate and a promise not to touch your keys.
      </p>
    );
  }

  if (!isSolanaAddress(address)) {
    return (
      <p role="alert" className="mt-8 text-[#ffb4c8]">
        That does not look like a Solana address.
      </p>
    );
  }

  const result = await loadReport(address);
  if (!result.ok) {
    return (
      <div role="alert" className="mt-8 rounded-2xl border border-[#ff6b8a]/40 bg-[#ff6b8a]/10 p-4">
        <p className="font-semibold">The lookup stopped</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{result.message}</p>
      </div>
    );
  }

  return <MineReport report={result.report} />;
}
