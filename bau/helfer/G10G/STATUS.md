# G10g – Status

Datei: `bau/helfer/G10G/index.html` (aus R-4300, VERSION 4.30.0) · Diff: `patch.diff` · Änderungen: `CHANGES.md` · Tests: `tests/alle.sh`

## Tests (Playwright + Chromium, alle grün am 01.11.)

| Test | Inhalt | Ergebnis |
|---|---|---|
| `g10g-regeln.mjs` | Version, 1× `  live: true,`, verbotene Wörter 0, „MS 2000“ 1×, CSS-Block, jede geänderte Zeile mit `// G10g`, Präfixe, kein Emoji, keine DB/Netz, Takt nur über `g10gBpb()` | 20/20 |
| `g10g-60-leiter.mjs` | G10-60: 100 Noten C-Dur / A Pent. Moll (Tabelle `ergebnis-g10-60.md`), echter Take Hart 100 %, Speichern der eigenen Leiter | 9/9 |
| `g10g-61-gesang.mjs` | G10-61: 20 Melodien → 18/20 richtig; unsicher → zwei Vorschläge im Chip und in der Leiste, Tausch per Tipp | 7/7 |
| `g10g-62-stufen.mjs` | G10-62 per CDP-Touch: ▲ E→F→G, Ziehen stufenweise, Halten+Ziehen → F♯, Halten → nicht rastern, ohne Quantisieren Halbton, Regler, Leiste; jede Geste 1 Undo; Vorhören | 14/14 |
| `g10g-63-oktav.mjs` | G10-63: Erkennung +12 in einer Note → höchstens 32 ct (ohne v: 1226 ct); Audio-Oktavsprung → höchstens 140 ct | 6/6 |
| `g10g-64-stimmlos.mjs` | G10-64: Hart 100 %, Einrast-Zeit 0: Zischlaute und Pausen bitgleich zum Original (A/B), Vokale verschoben; Schraffur deckt alle 6 Zischlaute | 6/6 |
| `g10g-65-regel28.mjs` | G10-65 gegen R-4300: Laden/Speichern Zeichen für Zeichen gleich, Render alter Take bitgleich (Hash), Plan + Cache-Schlüssel gleich, Editor ändert nichts, Tonart bleibt eingefroren, Harmony/KeyDetect/Szenen-Tonart gleich | 12/12 |
| `g10g-66-platz.mjs` | G10-66: Chip, 25 Leisten-Knöpfe, Regler ≥ 44 × 44, im Bild, nichts abgeschnitten, Seite springt nicht – 428×926, 926×428, 428×650 (+ Bilder) | 27/27 |
| `g10g-quelle.mjs` | G7 mit derselben Tonart wie G2 (neue Takes), alte Takes weiter `g7Key`; Song-Stimme Auto: Tonart je Takt; Auto liest bei Weich neu | 7/7 |
| `bau/tests/smoke.mjs`, `v3-mk8-smoke.mjs`, `v3-mk8b-smoke.mjs`, `v3-qa-mk5reg-smoke.mjs` | Rauchtests gegen `index.html` | `errors []` |

Bilder (selbst angesehen): `tests/bilder/` – `blatt-*`, `leiste-*`, `leiste-amoll-*`, `blatt-amoll-*` je 428×926 / 926×428 / 428×650,
dazu `nq-428x926.png` (nicht rastern) und `schraffur-428x926.png`.

## Abnahme (automatisch geprüft – Xanders Okay fehlt noch)

- [x] **G10-60** 100 Noten C-Dur Hart 100 % → alle in der Leiter; Pent. Moll A → nur A C D E G
- [x] **G10-61** „Aus dem Gesang“ 18/20 = 90 % richtig; unsicher → zwei Vorschläge
- [x] **G10-62** ▲ von E → F (und F → G); Halten + Ziehen → F♯; ohne Quantisieren wie heute
- [x] **G10-63** Oktav-Fehler → Hart zieht ≤ 150 ct (v = 2)
- [x] **G10-64** stimmlose Strecken bitgleich bei Hart 100 %
- [x] **G10-65** alte Takes ohne v bitgleich; Tonart-Erkennung und Leitern anderer Spuren unverändert
- [x] **G10-66** M-PLATZ Chip + Leiste ≥ 44 px, hoch und quer

„Grün“ heißt hier: die Maschine hat es gemessen. Fertig ist es erst mit Xanders Okay auf dem iPhone.

## Bitte prüfen (iPhone, Kopfhörer)

1. Takes-Blatt → [♪ Tonhöhe · Noten] → **Hart**. Oben rechts der Chip „C-Dur · Tonart · Auto ▾“: antippen, **A**, **Moll**, **Fertig** – ziehen die Noten in a-Moll?
2. Eine Note antippen, **▲** zweimal: springt sie Leiterton für Leiterton (nicht Halbton) und **hörst du sie sofort** in der neuen Lage?
3. Eine Note **senkrecht ziehen**: rastet sie auf Leitertöne? Dann **halten (½ s) und ziehen**: geht sie in Halbtönen frei?
4. Eine Note **halten und loslassen**: hellblau gestrichelt = „nicht rastern“. Klingt die Blue Note jetzt wie gesungen?
5. **Einrast-Zeit** auf 0 und auf 100 schieben: hörst du den Unterschied (hart springend ↔ weich gleitend)?
6. Graue **Schraffur** bei s/t/k/Atem: liegt sie an den richtigen Stellen, und klingen die Konsonanten unverändert?
7. Ein **altes Projekt** (vor dem Update) öffnen: klingt der Gesang genau wie vorher? Chip zeigt „fest“.
8. **[Aus dem Gesang]** auf einem echten Take: stimmt die erkannte Tonart?
