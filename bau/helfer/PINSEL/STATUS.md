# STATUS – PINSEL (Melodie-Pinsel)

**Stand: gebaut und mit Playwright/Chromium (Touch-Emulation) getestet. Noch nicht von Xander auf dem iPhone geprüft → nicht fertig, bis Xander Okay sagt.**

Zweig `melodie-pinsel` · Basis `bau/snapshots/R-4261.html` (4.26.1) · VERSION unverändert 4.26.1.

## Tests (`tests/alle.sh`; Playwright aus `/opt/node22/lib/node_modules`, dafür `bau/node_modules` dorthin verlinken)
| Test | Inhalt | Ergebnis |
|---|---|---|
| `t-pinsel.mjs` | Pinselpunkt je Breite: Note unter dem Finger = Fingerhöhe, außerhalb R unverändert, Abfall zum Rand, alles in Tonart, = alt + w·(Finger − alt) gerastet; Breite wirkt (5 < 7 < 15 Noten); Zug quer: überstrichene Noten = Fingerhöhe, Raster, 1 Undo, Undo/Redo exakt; Zacke live (Nachbarn ziehen mit, Ende zählt); Tonart der Stelle (a-Moll-Clip) und manuell (D-Dur), Clip-Tonart bleibt; zweiter Finger verwirft den Zug | 39/39 ✓ |
| `t-bloecke.mjs` | Umkehren (1. Note, Mitte, gerastet, a-Moll), eigene Umkehrung; Krebs Takt / ganzer Clip / Auswahl, eigene Umkehrung; Tauschen 1↔2, 1–2↔3–4, 2↔3; je 1 Undo, Undo/Redo; Speichern→Laden deep-equal | 20/20 ✓ |
| `t-mithoeren.mjs` | Chips je Spur, eigene fest an; Alle ab / drei an / Ohne Drums → Pegel 0/1 genau so; Song-JSON, tr.mute, Undo unverändert; Fertig; Schließen = alle 1; Wiederöffnen gemerkt; anderer Clip eigene Wahl; Melodie-Editor; Projekt ohne Mithören; Speichern→Laden | 20/20 ✓ |
| `t-layout.mjs` | 428×926 hoch und 926×428 quer: alle mp-Knöpfe ≥ 44 px Trefferfläche, nicht abgeschnitten, keine Emoji-Grafik, keine Seitenhöhen-/Notenfeld-Änderung in Grundzustand/Pinsel/Tonart-/Mithören-Leiste; Kopf-Titel quer = 108 px wie R-4261; Bildrate beim Malen (64 Noten) | 47/47 ✓ |
| `t-alt.mjs` | alte Aktionen in R-4261 und PINSEL gleich (15 Aktionen + Undo-Zähler) | 18/18 ✓ |
| `bau/tests/smoke.mjs`, `v3-mk8-smoke`, `v3-mk8b-smoke`, `v3-qa-mk5reg-smoke`, `v3-qmkp-smoke` (8 Formate) | Rauchtests | alle ✓, keine Fehler |

Bildrate beim Malen (Chromium headless, 4 Takte 1/16): CPU ×2 gedrosselt **59,5 fps** (hoch und quer), Pinsel-Rechnung je Bewegung
Median 1,1–1,2 ms. Mit ×4-Drossel 50–55 fps: Grenze ist das Neuzeichnen der Rolle selbst (R-4261 ebenso ≈ 19 ms je Bild bei ×4).

Markenregeln: Korg/microKORG/RADIAS/DWGS/Mask1/Kompakt 0×, Kodamo 1× und Nord 7× wie in R-4261 (nichts neu), „MS 2000“ 1×,
`  live: true,` 1×. Keine Netzzugriffe, keine Datenbank. Bildschirmfotos: `tests/shots/`.

## Bitte prüfen (iPhone 12 Pro Max, Safari)
1. Clip öffnen (✎), [Pinsel], mit einem Finger über einen Lauf malen: folgen die Noten weich? [schmal] / [mittel] / [breit] ausprobieren.
2. An einer Stelle hoch und runter wischen („Zacke“): ziehen die Nachbarn mit? Leises Vorhören angenehm?
3. Im Lineal Takte antippen → [Umkehren ↕], [Krebs ↔], [Tauschen ⇆]; [↶] nimmt jeweils genau einen Schritt zurück.
4. Song laufen lassen, im Editor [Mithören] → [Alle ab], drei Spuren antippen, [Ohne Drums]; Editor schließen → alles wieder zu hören.
5. Querformat: Kopfzeile und Werkzeugleiste (scrollt) in Ordnung?
6. Fragen an Xander: siehe CHANGES.md.
