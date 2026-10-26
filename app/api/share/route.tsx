import { ImageResponse } from "next/og";
import { ShareCard } from "@/lib/share-card";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = Number(url.searchParams.get("count"));
  const count = Number.isFinite(raw) ? Math.max(0, Math.min(999, Math.floor(raw))) : 0;
  const kind = url.searchParams.get("kind") === "public" ? "public" : "mine";
  const modeParam = url.searchParams.get("mode");
  const mode = modeParam === "live" || modeParam === "example" || modeParam === "mock" ? modeParam : "mock";

  return new ImageResponse(<ShareCard count={count} kind={kind} mode={mode} />, {
    width: 1200,
    height: 630,
  });
}
