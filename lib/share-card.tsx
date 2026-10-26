import { tombstoneWord } from "@/lib/share";

export function ShareCard({
  count,
  kind,
  mode,
}: {
  count: number;
  kind: "mine" | "public";
  mode: "mock" | "live" | "example";
}) {
  const noun = tombstoneWord(count);
  const headline =
    kind === "public"
      ? `The public graveyard has ${count} example ${noun}`
      : `My graveyard has ${count} ${noun}`;
  const stamp = mode === "live" ? "LIVE READ" : "EXAMPLE";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: "#140818",
        color: "#f6edd9",
        padding: "56px",
        fontFamily: "Georgia, serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          border: "2px solid rgba(246,237,217,0.35)",
          borderRadius: "36px",
          padding: "48px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 28, letterSpacing: "0.14em" }}>REST IN PUMP</div>
          <div
            style={{
              display: "flex",
              backgroundColor: "#ff7a18",
              color: "#2a1206",
              borderRadius: "999px",
              padding: "8px 16px",
              fontSize: 22,
              fontFamily: "sans-serif",
            }}
          >
            {stamp}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "36px" }}>
          <div
            style={{
              display: "flex",
              width: 148,
              height: 168,
              backgroundColor: "#3c2d4a",
              borderRadius: "80px 80px 18px 18px",
              alignItems: "center",
              justifyContent: "center",
              color: "#f6edd9",
              fontSize: 42,
            }}
          >
            RIP
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: 760 }}>
            <div style={{ display: "flex", fontSize: 46, lineHeight: 1.15 }}>{headline}</div>
            <div style={{ display: "flex", fontSize: 28, color: "#d9fff6", fontFamily: "sans-serif" }}>
              We have all been rugged.
            </div>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 22, fontFamily: "sans-serif" }}>
          A read-only memorial. Not advice, not an airdrop, not a refund.
        </div>
      </div>
    </div>
  );
}
