"use client";

import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { shortAddress } from "@/lib/address";

import "@solana/wallet-adapter-react-ui/styles.css";

/**
 * Read-only on purpose.
 * `useWallet()` is used for `publicKey`, `connected`, and `disconnect` only.
 * This file never calls signMessage, signTransaction, or sendTransaction.
 * The RPC endpoint is a placeholder for the adapter. Market data is loaded
 * server-side and does not use this connection.
 */
const ENDPOINT = "https://api.mainnet-beta.solana.com";

function ConnectedWallet({ activeAddress }: { activeAddress: string | null }) {
  const { publicKey, connected, disconnect, connecting } = useWallet();
  const router = useRouter();
  const address = publicKey?.toBase58() ?? null;

  useEffect(() => {
    if (!address || address === activeAddress) return;
    router.replace(`/mine?address=${encodeURIComponent(address)}`);
  }, [address, activeAddress, router]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <WalletMultiButton />
        {connected && address ? (
          <Button type="button" variant="outline" className="h-11 rounded-full px-4" onClick={() => disconnect()}>
            Disconnect
          </Button>
        ) : null}
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {connecting
          ? "Waiting for the wallet. The popup should only ask to connect, which shares the public address."
          : connected && address
            ? `Connected, read-only. Public address ${shortAddress(address)}. No signature was requested.`
            : "Phantom, Solflare, and other injected wallets can connect. Or skip this and paste an address."}
      </p>
    </div>
  );
}

export function WalletGate({ activeAddress }: { activeAddress: string | null }) {
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          <ConnectedWallet activeAddress={activeAddress} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
