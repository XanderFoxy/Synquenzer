// Wie ich ticke – Rechen-Hilfen für Bänder (ARCH.md §3.3, §4). Ohne DOM: Module können in Node testen (import { mass } from '../../mass.js').
// Wörter nur für die Skala 'T' (Vergleich mit anderen). Bei 'pomp' (ohne Vergleichswerte) bringt jedes Band sein eigenes `wort` mit.
export const WORTE = { '-2': 'deutlich niedriger als die meisten', '-1': 'eher niedriger als die meisten', '0': 'im Mittelfeld', '1': 'eher höher als die meisten', '2': 'deutlich höher als die meisten' };
export const mass = {
  // 95-%-Band um einen T-Wert (Mittel 50, Streuung 10) aus der Zuverlässigkeit r: ±1,96·10·√(1−r). r=.80 → ±8,8; r=.64 → ±11,8.
  bandT(t, r) { const h = 1.96 * 10 * Math.sqrt(Math.max(0, 1 - r)); return { wert: t, unten: t - h, oben: t + h }; },
  tAusRoh(roh, mittel, sd) { return 50 + 10 * ((roh - mittel) / sd); },
  stufeT(t) { return t < 35 ? -2 : t < 45 ? -1 : t <= 55 ? 0 : t <= 65 ? 1 : 2; },
  wort(stufe) { return WORTE[String(stufe)] || WORTE['0']; },
  // Liegt das GANZE Band außerhalb des Mittelfelds 45–55? -1 darunter, 1 darüber, 0 sonst (Regel für Profil-Namen, KONZEPT §2.3).
  klar(b) { return b.oben < 45 ? -1 : b.unten > 55 ? 1 : 0; },
  // Mittelwert einer Skala mit Umpolung: items [{id, umgepolt}], antworten {id: 1..max}. Gibt {mittel, n} (n = beantwortet).
  mittel(items, antworten, max = 5) {
    let s = 0, n = 0;
    for (const it of items) { const a = antworten[it.id]; if (typeof a === 'number') { s += it.umgepolt ? max + 1 - a : a; n++; } }
    return { mittel: n ? s / n : null, n };
  },
  pomp(mittel, min = 1, max = 5) { return ((mittel - min) / (max - min)) * 100; }   // Prozent des möglichen Bereichs
};
