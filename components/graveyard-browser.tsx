"use client";

import { useMemo, useState } from "react";
import { HideNumbersToggle, useHideNumbers } from "@/components/hide-numbers";
import { SharePanel } from "@/components/share-panel";
import { TombstoneCard } from "@/components/tombstone-card";
import { Label } from "@/components/ui/label";
import type { Tombstone } from "@/lib/types";

const SORTS = [
  { id: "steepest", label: "Steepest fall" },
  { id: "quietest", label: "Quietest volume" },
  { id: "newest", label: "Newest death" },
  { id: "alpha", label: "Ticker A to Z" },
] as const;

type SortId = (typeof SORTS)[number]["id"];

function compare(sort: SortId, a: Tombstone, b: Tombstone): number {
  if (sort === "alpha") return a.ticker.localeCompare(b.ticker);
  if (sort === "newest") {
    const aTime = a.diedAt ? Date.parse(a.diedAt) : 0;
    const bTime = b.diedAt ? Date.parse(b.diedAt) : 0;
    return bTime - aTime;
  }
  if (sort === "quietest") {
    return (a.volume24hUsd ?? Number.POSITIVE_INFINITY) - (b.volume24hUsd ?? Number.POSITIVE_INFINITY);
  }
  return (b.drawdown ?? -1) - (a.drawdown ?? -1);
}

export function GraveyardBrowser({
  tombstones,
  shareKind,
  shareMode,
}: {
  tombstones: Tombstone[];
  shareKind: "mine" | "public";
  shareMode: "mock" | "live" | "example";
}) {
  const { hideNumbers, setHideNumbers } = useHideNumbers();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortId>("steepest");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? tombstones.filter((stone) =>
          [stone.ticker, stone.name, stone.causeOfDeath, stone.epitaph].join(" ").toLowerCase().includes(needle),
        )
      : tombstones;
    return [...filtered].sort((a, b) => compare(sort, a, b));
  }, [query, sort, tombstones]);

  return (
    <div className="mt-6 flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="grave-search">Search the hill</Label>
          <input
            id="grave-search"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Ticker, name, or a few words of an epitaph"
            className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="grave-sort">Sort</Label>
          <select
            id="grave-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortId)}
            className="h-11 rounded-lg border border-input bg-background/40 px-3 text-sm"
          >
            {SORTS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <HideNumbersToggle hideNumbers={hideNumbers} onChange={setHideNumbers} />
      </div>

      <p aria-live="polite" data-query={query} data-hidden={hideNumbers ? "1" : "0"} className="text-sm text-muted-foreground">
        {visible.length === tombstones.length
          ? `${tombstones.length} ${tombstones.length === 1 ? "tombstone" : "tombstones"}`
          : `${visible.length} of ${tombstones.length} match`}
      </p>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 p-6 text-muted-foreground">
          No stone matches that. Try a shorter ticker. The coins are dead, not hidden.
        </p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((stone) => (
            <li key={stone.id}>
              <TombstoneCard stone={stone} hideNumbers={hideNumbers} />
            </li>
          ))}
        </ul>
      )}

      <SharePanel count={tombstones.length} kind={shareKind} mode={shareMode} />
    </div>
  );
}
