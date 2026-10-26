"use client";

import { useId, useState, useSyncExternalStore } from "react";
import { Label } from "@/components/ui/label";

const STORAGE_KEY = "rest-in-pump:hide-numbers:v1";
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readHidden() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function useHideNumbers() {
  const stored = useSyncExternalStore(subscribe, readHidden, () => false);
  const [live, setLive] = useState<boolean | null>(null);
  const hideNumbers = live ?? stored;

  function setHideNumbers(next: boolean) {
    setLive(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      // This visit still hides the figures if storage is blocked.
    }
    emit();
  }

  return { hideNumbers, setHideNumbers };
}

export function HideNumbersToggle({
  hideNumbers,
  onChange,
}: {
  hideNumbers: boolean;
  onChange: (next: boolean) => void;
}) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1">
      <div className="flex h-11 items-center gap-3">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={hideNumbers}
          onChange={(event) => onChange(event.currentTarget.checked)}
          className="size-5 shrink-0 accent-[#ff7a18]"
        />
        <Label htmlFor={id} className="cursor-pointer text-base">
          Hide the numbers
        </Label>
      </div>
      <p className="text-sm text-muted-foreground">
        Tucks prices, peaks, and drawdowns under the dirt. The epitaph stays. This is for sharing a joke,
        not for hiding from yourself.
      </p>
    </div>
  );
}
