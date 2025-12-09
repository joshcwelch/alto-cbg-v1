export type FactionId = "VOIDBORN" | "EMBER" | "CELESTIAL" | "SYLVAN" | "GEARCOG" | string | undefined;

const normalize = (f: FactionId) => (f ?? "").toString().toUpperCase();

export function factionClass(f: FactionId) {
  const key = normalize(f);
  if (key.includes("VOID")) return "glow-voidborn";
  if (key.includes("EMBER")) return "glow-ember";
  if (key.includes("CELEST")) return "glow-celestial";
  if (key.includes("SYLV")) return "glow-sylvan";
  if (key.includes("GEAR") || key.includes("COG")) return "glow-gearcog";
  return "glow-neutral";
}
