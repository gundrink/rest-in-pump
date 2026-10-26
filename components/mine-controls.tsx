"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isSolanaAddress } from "@/lib/address";

const WalletGate = dynamic(
  () => import("@/components/wallet-gate").then((mod) => mod.WalletGate),
  {
    ssr: false,
    loading: () => <p className="text-sm text-muted-foreground">Loading the read-only wallet picker…</p>,
  },
);

export function MineControls() {
  const params = useSearchParams();
  const address = params.get("address") ?? "";
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const value = String(data.get("address") ?? "");
    if (!isSolanaAddress(value)) {
      event.preventDefault();
      setError("That does not look like a Solana address.");
      return;
    }
    setError(null);
  }

  return (
    <div className="mt-6 flex flex-col gap-6">
      <WalletGate activeAddress={address || null} />
      <form action="/mine" method="get" onSubmit={onSubmit} className="flex flex-col gap-3">
        <Label htmlFor="wallet-address">Or paste any wallet address</Label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            id="wallet-address"
            name="address"
            key={address}
            defaultValue={address}
            autoComplete="off"
            spellCheck={false}
            placeholder="Solana address"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "address-error" : "address-help"}
            className="h-11"
          />
          <Button type="submit" className="h-11 rounded-full px-5">
            View this graveyard
          </Button>
        </div>
        <p id="address-help" className="text-sm text-muted-foreground">
          Public chain data only. Pasting does not connect a wallet and does not ask you to sign.
        </p>
        {error ? (
          <p id="address-error" role="alert" className="text-sm text-[#ffb4c8]">
            {error}
          </p>
        ) : null}
      </form>
      <p className="text-sm">
        <Link href="/mine?demo=1" className="font-semibold underline-offset-4 hover:underline">
          Peek at an example graveyard
        </Link>
        <span className="text-muted-foreground">
          {" "}
          if you want the joke before you paste anything. It is labelled EXAMPLE.
        </span>
      </p>
    </div>
  );
}
