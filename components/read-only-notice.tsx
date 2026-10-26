export function ReadOnlyNotice() {
  return (
    <aside
      data-testid="readonly-notice"
      className="rounded-2xl border border-[#ff7a18]/50 bg-[#ff7a18]/10 p-4 text-sm leading-6"
    >
      <p className="font-semibold text-foreground">This connect is read-only.</p>
      <p className="mt-1 text-muted-foreground">
        Connecting a wallet shares the public address and nothing else. Rest In Pump never requests a
        signature, never sends a transaction, and will never ask for a seed phrase. You can also paste any
        address and skip the wallet entirely. Wallet data is not stored past a short server cache.
      </p>
    </aside>
  );
}
