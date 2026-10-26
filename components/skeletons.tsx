export function TombstoneSkeleton() {
  return (
    <div
      aria-hidden
      className="tombstone h-80 animate-pulse bg-white/5"
    />
  );
}

export function GraveyardSkeleton({ label }: { label: string }) {
  return (
    <div aria-busy="true" aria-live="polite" className="mt-6">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <TombstoneSkeleton />
        <TombstoneSkeleton />
        <TombstoneSkeleton />
      </div>
    </div>
  );
}
