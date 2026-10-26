"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { shareText } from "@/lib/share";

export function SharePanel({
  count,
  kind,
  mode,
}: {
  count: number;
  kind: "mine" | "public";
  mode: "mock" | "live" | "example";
}) {
  const text = shareText(count, kind);
  const imagePath = `/api/share?count=${count}&kind=${kind}&mode=${mode}`;
  const textOnlyHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function download() {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(imagePath);
      if (!response.ok) throw new Error("share image failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPreview(url);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rest-in-pump-${count}-tombstones.png`;
      link.click();
    } catch {
      setMessage("The picture could not be drawn. The words below are still ready to copy.");
    } finally {
      setBusy(false);
    }
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Copied. The post does not promise profit, an airdrop, or a refund.");
    } catch {
      setMessage("Copy was blocked. Select the text in the box instead.");
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5" aria-labelledby="share-heading">
      <h2 id="share-heading" className="font-display text-2xl">
        Share the plot
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        The picture counts tombstones. It does not print a wallet address. The X link does include this
        page, so anyone with the link can open the same public graveyard.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <Label htmlFor="share-text">Post text</Label>
        <textarea
          id="share-text"
          readOnly
          value={text}
          rows={3}
          className="w-full rounded-xl border border-input bg-background/40 px-3 py-2 text-sm"
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={textOnlyHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => {
            const page = window.location.href;
            event.currentTarget.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(page)}`;
          }}
          className="inline-flex h-11 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          Post on X
        </a>
        <Button type="button" variant="outline" className="h-11 rounded-full px-4" onClick={download} disabled={busy}>
          {busy ? "Drawing the stone…" : "Download share image"}
        </Button>
        <Button type="button" variant="ghost" className="h-11 rounded-full px-4" onClick={copyText}>
          Copy text
        </Button>
      </div>
      {message ? (
        <p role="status" className="mt-3 text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}
      {preview ? (
        <>
          {/* Blob previews are generated in the browser, so they are not a remote image to optimize. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={text} className="mt-4 h-auto w-full rounded-2xl border border-white/10" />
        </>
      ) : null}
    </section>
  );
}
