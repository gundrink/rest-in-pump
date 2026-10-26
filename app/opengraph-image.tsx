import { ImageResponse } from "next/og";
import { ShareCard } from "@/lib/share-card";
import { getPublicGraveyard } from "@/lib/public-graveyard";

export const alt = "Rest In Pump, a graveyard for dead Solana memecoins";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const graveyard = getPublicGraveyard();
  return new ImageResponse(
    <ShareCard count={graveyard.tombstones.length} kind="public" mode="example" />,
    { ...size },
  );
}
