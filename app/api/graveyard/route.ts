import { getPublicGraveyard } from "@/lib/public-graveyard";

export function GET() {
  try {
    const graveyard = getPublicGraveyard();
    return Response.json(
      { ...graveyard, fetchedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "public, max-age=300" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "The public hill could not be loaded.";
    return Response.json({ error: message }, { status: 500 });
  }
}
