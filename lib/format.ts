export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return "unknown";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  if (abs >= 1) return `${sign}$${abs.toFixed(2)}`;
  if (abs >= 0.01) return `${sign}$${abs.toFixed(4)}`;
  if (abs === 0) return "$0";
  return `${sign}$${abs.toExponential(2)}`;
}

export function formatDrawdown(drawdown: number): string {
  const percent = Math.round(drawdown * 1000) / 10;
  return `${percent.toFixed(1)}% off the peak`;
}

export function formatDay(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(date);
}

export function cleanLabel(value: string, max: number, fallback: string): string {
  const cleaned = value.replace(/[\u0000-\u001F\u007F]/g, "").trim();
  if (!cleaned) return fallback;
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, Math.max(1, max - 1))}…`;
}
