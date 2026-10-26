"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-16">
      <h1 className="font-display text-4xl">The lantern went out</h1>
      <p className="text-muted-foreground">
        Something broke while rendering this page. Your keys were not involved, because this app never asks
        for them. Try once more.
      </p>
      <Button type="button" className="h-11 w-fit rounded-full px-5" onClick={() => reset()}>
        Try again
      </Button>
    </main>
  );
}
