# DOPPEL – Stand

**Paket:** doppelte Werkzeuge in der Piano-Rolle zusammenlegen + app-weite Doppel-Suche.
**Basis:** `bau/snapshots/R-4300.html` (App 4.30.0) · **VERSION:** `'4.30.0'` (unverändert) · **Zweig:** `doppel-werkzeuge`
**Abnahme durch Xander: offen** – nicht fertig ohne sein Okay.

## Bitte prüfen (iPhone, Piano-Rolle eines Synth-Clips)
1. Aktionsleiste: nur noch **Spiegeln**, daneben **Achse: Mitte**, dann **Umdrehen**, … **Tauschen** (mit gezeichnetem Symbol). Kein „Umkehren ↕“, kein „Krebs ↔“.
2. **Spiegeln** ohne Auswahl → ganzer Clip wie bisher. Mit Takten im Lineal → nur diese Takte. Mit Auswahl → nur die Auswahl.
3. **Achse** antippen → „Achse: 1. Note“: Spiegeln um die erste Note, Ergebnis in der Tonart.
4. **Umdrehen** wie Spiegeln: Auswahl, sonst Lineal-Takte, sonst ganzer Clip.
5. Jede Geste: einmal ↶ = wieder wie vorher.

## Ergebnisse (Chromium, Playwright)
| Test | Ergebnis |
|---|---|
| `tests/t-doppel.mjs` – Finger: Leiste, Auswahl/Bereich/ganzer Clip, beide Achsen, Tonart der Stelle, Undo, alte API-Namen | 33/33 ✓ |
| `tests/t-gleich.mjs` – alt (R-4300) = neu, 8 Zufalls-Clips × 17 Fälle; Projekt laden/speichern Zeichen für Zeichen | 115/136 gleich + 21 bewusst anders (nur Umkehren Mitte, leiterfremde Töne, CHANGES Nr. 5); 1 Undo je Geste; Projekt Zeichen für Zeichen gleich ✓ |
| `tests/t-bilder.mjs` – Bilder 428×926, 926×428, 428×650 vorher/nachher | 6 Bilder, angesehen ✓ |
| `tests/alt-n1/n1-abnahme.mjs` (unverändert) | 18/18 ✓ |
| `tests/alt-n1/n1-hit.mjs` (unverändert) | 12/12 ✓ |
| `tests/alt-pinsel/*` (t-pinsel, t-bloecke, t-mithoeren, t-layout, t-alt; Anpassungen in CHANGES.md) | alle ✓ |
| Rauchtests `smoke`, `v3-mk8-smoke`, `v3-mk8b-smoke`, `v3-qa-mk5reg-smoke` | errors [] ✓ |

Alles zusammen: `sh tests/alle.sh` (etwa 12 min).

## Regeln
- `  live: true,` genau 1× ✓ · verbotene Wörter 0 ✓ · „MS 2000“ genau 1× ✓
- Touch-Ziele Spiegeln/Umdrehen/Tauschen/Achse ≥ 44 px ✓ · Leistenhöhe ± 0 px (44 / 36 / 40 px) ✓
- Alte Projekte laden/speichern Zeichen für Zeichen gleich ✓ (t-gleich) · keine neuen Datenbank- oder Netz-Zugriffe ✓
- Alle Änderungen mit `DOPPEL` markiert, nur in der Piano-Rolle (`patch.diff`, 152 Zeilen)

## Bilder
`tests/bilder/leiste-<Format>-vorher|nachher.png` (Ausschnitt Aktionsleiste, ab Spiegeln) und `rolle-<Format>-…png` (ganzes Fenster).

## Offen / Vorschläge
- App-weite Doppel-Suche: kein weiteres echtes Doppel in derselben Leiste; 28 weitere Funde als Vorschlag in CHANGES.md (z. B. Song „Als Teil / Zusammenfassen / Konsolidieren“, Drum-Kopf und KIT-Reiter, „Pause“ mit zwei Bedeutungen).
- Tauschen nutzt weiter „Lineal-Takte vor Auswahl“, Spiegeln/Umdrehen „Auswahl vor Lineal-Takten“ – Vorschlag: angleichen.
