// Price history per group: one point per day and shop (the lowest unit price seen that day).
// history = { version: 2, gruppen: { [gruppe]: { basis, punkte: [{ tag, p, shop }], tiefst: { p, tag, shop } } } }
// Version 2 (31.10.2026): Packungsgrößen werden richtig gelesen. Version-1-Verläufe enthalten falsche Punkte
// (z. B. Knoppers 0,07 €/Stück aus „1 kg“) und werden deshalb einmal verworfen.

export const HISTORIE_VERSION = 2;
export const leereHistorie = () => ({ version: HISTORIE_VERSION, gruppen: {} });

/** Gültiger Verlauf oder ein neuer leerer (alte Version, kaputt, fehlt). */
export function pruefeHistorie(h) {
  if (h && h.version === HISTORIE_VERSION && h.gruppen && typeof h.gruppen === 'object') return { historie: h, neu: false };
  return { historie: leereHistorie(), neu: !!h };
}

export const tagVon = d => new Date(d).toISOString().slice(0, 10);

export function eintragen(hist, gruppe, basis, punkt, jetzt) {
  const g = (hist.gruppen[gruppe] ||= { basis, punkte: [], tiefst: null });
  g.basis = basis;
  const tag = tagVon(jetzt);
  const alt = g.punkte.find(x => x.tag === tag && x.shop === punkt.shop);
  if (alt) { if (punkt.p < alt.p) alt.p = punkt.p; }
  else g.punkte.push({ tag, p: punkt.p, shop: punkt.shop });
  if (!g.tiefst || punkt.p < g.tiefst.p) g.tiefst = { p: punkt.p, tag, shop: punkt.shop };
}

export function aufraeumen(hist, behaltenTage, jetzt) {
  const grenze = tagVon(new Date(jetzt).getTime() - behaltenTage * 864e5);
  for (const g of Object.values(hist.gruppen)) g.punkte = g.punkte.filter(x => x.tag >= grenze);
}

export function median(arr) {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Stats: normal = median of the last `fensterTage` (per day the lowest price -> robust against shop count),
// tiefst = all-time low, tage = number of days with data.
export function statistik(hist, gruppe, fensterTage, jetzt) {
  const g = hist.gruppen[gruppe];
  if (!g) return { normal: null, tiefst: null, tage: 0, punkte: 0 };
  const grenze = tagVon(new Date(jetzt).getTime() - fensterTage * 864e5);
  const proTag = new Map();
  for (const x of g.punkte) if (x.tag >= grenze) proTag.set(x.tag, Math.min(proTag.get(x.tag) ?? Infinity, x.p));
  const werte = [...proTag.values()];
  return {
    normal: median(werte),
    tiefst: g.tiefst,
    tage: proTag.size,
    punkte: g.punkte.length,
  };
}

// Niedrigster Punkt der letzten `tage` Tage (inkl. heute): { p, tag, shop } oder null
export function tiefstSeit(hist, gruppe, tage, jetzt) {
  const g = hist.gruppen[gruppe];
  if (!g) return null;
  const grenze = tagVon(new Date(jetzt).getTime() - tage * 864e5);
  let t = null;
  for (const x of g.punkte) if (x.tag >= grenze && (!t || x.p < t.p || (x.p === t.p && x.tag > t.tag))) t = x;
  return t ? { ...t } : null;
}
