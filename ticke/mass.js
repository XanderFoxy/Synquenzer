// Wie ich ticke – Rechen-Hilfen (ARCH.md §3.3, §4). Ohne DOM: Module können in Node testen (import { mass } from '../../mass.js').
// Gezeigt wird nie eine Zahl über dich und kein Vergleich mit anderen: Eine Stufe -2…2 wird nur zu einer Richtung in Worten
// (zwei gleichwertige Pole, „klar“ / „leicht“ / „beides gehört zu dir“). Die Zahlen unten bleiben intern (Rechnen, nicht Anzeigen).
export const DEUTLICH = { '-2': 'klar', '-1': 'leicht', '0': 'beides', '1': 'leicht', '2': 'klar' };
export const WORTE = { '-2': 'klar zur einen Seite', '-1': 'leicht zur einen Seite', '0': 'beides gehört zu dir', '1': 'leicht zur anderen Seite', '2': 'klar zur anderen Seite' };
const stufeTxt = (s) => String(Math.max(-2, Math.min(2, Math.round(Number(s) || 0))));
export const mass = {
  // 95-%-Band um einen T-Wert (Mittel 50, Streuung 10) aus der Zuverlässigkeit r: ±1,96·10·√(1−r). r=.80 → ±8,8; r=.64 → ±11,8.
  bandT(t, r) { const h = 1.96 * 10 * Math.sqrt(Math.max(0, 1 - r)); return { wert: t, unten: t - h, oben: t + h }; },
  tAusRoh(roh, mittel, sd) { return 50 + 10 * ((roh - mittel) / sd); },
  stufeT(t) { return t < 35 ? -2 : t < 45 ? -1 : t <= 55 ? 0 : t <= 65 ? 1 : 2; },
  // Stufe → Wort. Mit pole [a, b]: „klar in Richtung a“ … „beides gehört zu dir“ … „klar in Richtung b“.
  wort(stufe, pole = null) {
    const s = stufeTxt(stufe);
    if (!pole || s === '0') return WORTE[s];
    return `${DEUTLICH[s]} in Richtung ${Number(s) < 0 ? pole[0] : pole[1]}`;
  },
  deutlich(stufe) { return DEUTLICH[stufeTxt(stufe)]; },
  // Für ui.richtung(): { deutlich, zu (0 | 1 | null), satz } aus einer Stufe -2…2 und den zwei Polen.
  richtung(stufe, pole) {
    const s = Number(stufeTxt(stufe)), d = DEUTLICH[String(s)];
    if (!s) return { deutlich: d, zu: null, satz: `Beides gehört zu dir: ${pole[0]} und ${pole[1]}.` };
    return { deutlich: d, zu: s < 0 ? 0 : 1, satz: `${d === 'klar' ? 'Klar' : 'Leicht'} in Richtung ${s < 0 ? pole[0] : pole[1]}.` };
  },
  // Liegt das GANZE Band außerhalb des Mittelfelds 45–55? -1 darunter, 1 darüber, 0 sonst (Regel für Profil-Namen, KONZEPT §2.3).
  klar(b) { return b.oben < 45 ? -1 : b.unten > 55 ? 1 : 0; },
  // Mittelwert einer Skala mit Umpolung: items [{id, umgepolt}], antworten {id: 1..max}. Gibt {mittel, n} (n = beantwortet).
  mittel(items, antworten, max = 5) {
    let s = 0, n = 0;
    for (const it of items) { const a = antworten[it.id]; if (typeof a === 'number') { s += it.umgepolt ? max + 1 - a : a; n++; } }
    return { mittel: n ? s / n : null, n };
  },
  pomp(mittel, min = 1, max = 5) { return ((mittel - min) / (max - min)) * 100; }   // Anteil des möglichen Bereichs (nur intern)
};
