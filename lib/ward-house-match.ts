/** Shared house-number matching (client + server safe — no Node deps). */

export function normalizeHouseKey(house: string): string {
  return String(house || "")
    .trim()
    .toLowerCase()
    .replace(/^\.+/, "")
    .replace(/[,.\s]+$/g, "")
    .replace(/[/\\~]/g, "-")
    .replace(/\s+/g, "");
}

export function houseNumbersMatch(routeHouse: string, voterHouse: string): boolean {
  const a = normalizeHouseKey(routeHouse);
  const b = normalizeHouseKey(voterHouse);
  if (!a || !b) return false;
  if (a === b) return true;

  const ca = a.replace(/-/g, "");
  const cb = b.replace(/-/g, "");
  if (ca.length <= 8 && cb.length <= 8 && ca === cb) return true;

  // "462" on route list vs voter "1/462" when route is the plot suffix only
  if (/^\d+$/.test(a) && (b.endsWith(`-${a}`) || b.endsWith(`/${a}`) || b === `1-${a}`)) {
    return true;
  }
  if (/^\d+$/.test(b) && (a.endsWith(`-${b}`) || a.endsWith(`/${b}`))) {
    return true;
  }

  return false;
}
