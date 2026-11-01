# STATUS · EDIT 4.29.0 (KON + MAGIC + PINSEL auf 4.27.0)

**Stand: zusammengeführt und im Test-Browser (Playwright/Chromium, Touch-Emulation) grün. Noch nicht von Xander auf dem
iPhone geprüft → nicht fertig, bis Xander Okay sagt.**

- `index.html` – App 4.29.0 (4 323 095 B, +82 KB gegen 4.27.0), `VERSION = '4.29.0'`
- `stage.diff` – `diff -u bau/snapshots/R-4270.html bau/stage/EDIT/index.html` (+1102 / −28 Zeilen)
- `tests/` – Tests der drei Pakete (auf die Stage-Datei umgebogen), `zusammen.mjs` (Zusammenspiel), `alle.sh`, `shots/`
- Pakete liegen unverändert unter `bau/helfer/KON|MAGIC|PINSEL/` (von den Zweigen `kon-block`, `magic-scale`, `melodie-pinsel`).

## Vorgehen
`git merge-file -p` nacheinander auf R-4270 (Basis R-4261): KON → MAGIC → PINSEL. Alle eigenen Eingriffe tragen `EDIT 4.29`.

## Konflikte und Lösungen
| # | Stelle | Konflikt | Lösung |
|---|---|---|---|
| 1 | PianoRoll `draw()` nach den Noten | 4.27.0 Silben unter den Noten (G9e) ↔ MAGIC `MS.draw` ↔ PINSEL `mpDraw` | alle drei hintereinander: Silben, dann Magic-Schilder, dann Pinsel-Band |
| 2 | `mainDrag` | `case 'ms'` (MAGIC) ↔ `case 'mpBrush'` (PINSEL) | beide Fälle |
| 3 | `mainUp` | MAGIC `MS.up` + Undo-Name ↔ PINSEL `MB = null` | eine Zeile mit MAGIC-Ende, danach `gst = null; MB = null;` |
| 4 | `tap()` | MAGIC `MS.tap` ↔ PINSEL Pinselpunkt | beide (getrennte Werkzeuge) |
| 5 | Clip-Editor `PianoRoll.create` | 4.27.0 `syl:` ↔ MAGIC `msKey…` | beide Optionen |
| 6 | Melodie-Editor `PianoRoll.create` | 4.27.0 `syl:` ↔ MAGIC `msKey…` | beide Optionen |
| – | KON | kein Konflikt | – |

Doppelte Top-Level-Definitionen: keine neuen (Vergleich je Script-Block gegen R-4270: gleich).

## Zusammenführung der zwei Werkzeug-Pakete (nicht doppelt)
- **Tonart der Stelle:** eine Funktion in der PianoRoll (`mpAutoKey`, Handwahl `MPK` je Clip). Magic Scale holt Tonart und
  Handwahl darüber (`K.keyAuto`, `K.keyManual`); die App gibt beiden dieselbe Funktion (`kAt` je Editor).
  Wählt man die Tonart im Pinsel ([Tonart: Auto]), gilt sie auch fürs Wischen und umgekehrt.
- **Tonleitern:** Magic nimmt die Tabelle der PianoRoll (`K.SC`). **Raster:** beide `GRID` der PianoRoll.
- **Vorhören:** ein `prHear` in der PianoRoll für Pinsel und Wischen.
- **Werkzeugleiste:** ✎ ⬚ ⌫ | Pinsel · Magic · Mithören | Raster … (Magic stand vorher hinten bei ⌨). Pinsel und Magic schließen sich
  aus: [Pinsel] schließt die Magic-Zeile, [Magic] setzt Wischen. So liegen Pinsel-Optionen (Aktionsleiste) und Magic-Zeile nie
  gleichzeitig offen. [Magic] hat jetzt die gleiche 44-px-Trefferfläche wie [Pinsel].
- **Querformat:** der Kopf-Titel blieb mit beiden Gruppen 3 px schmaler (105 statt 108 px). Jetzt gibt die (scrollende) Leiste
  zuerst nach (`flex-shrink:1000`), der Titel hat wieder 108 px wie in 4.27.0.

## Tests (alle gegen `bau/stage/EDIT/index.html`)
| Test | Ergebnis |
|---|---|
| KON: kon-block 41, kon-konsol 42, kon-save 11, kon-layout 24 | **118/118** |
| MAGIC: ms-funktion, ms-layout (4 Formate, Bildrate), ms-regress (alt = neu gegen **R-4270**) | **83/83** |
| PINSEL: t-pinsel 39, t-bloecke 20, t-mithoeren 20, t-layout 47, t-alt 18 (alt = neu gegen **R-4270**) | **144/144** |
| Zusammenspiel `zusammen.mjs`: Chor-Gruppe konsolidieren + zurückholen (Chor bleibt, exakt), Wischen + Pinsel im konsolidierten Teil (echte Touch-Gesten), Undo/Redo über alle drei, Speichern/Laden + Neuladen, Werkzeugleiste hoch/quer (≥ 44 px, nichts überdeckt, kein Überlauf, Umschalten) | **48/48** |
| Rauchtests `smoke.mjs`, `v3-mk8-smoke`, `v3-mk8b-smoke`, `v3-qa-mk5reg-smoke` | grün, keine Fehler |
| `v3-qmkp-smoke` (8 Formate) | grün, Werte gleich wie 4.27.0 |
| `orch-mk-check.mjs` | grün, Klangwerte gleich wie 4.27.0 (Regel 28) |
| `v3-mk2-wellen.mjs` | **OFFEN** – der Prüfbezug `bau/dwgs-trace` fehlt im Repo (bei 4.27.0 ebenso), Prüfung nicht ausführbar |

Regeln: „MS 2000“ 1×, `  live: true,` 1×, Korg/microKORG/RADIAS/DWGS/Kodamo/Mask1/Nord/„Kompakt“ 0×, keine Emoji-Grafik
(die Pakete nutzen Zeichen ↕ ↔ ⇆ ▲ ▼ als Schrift), keine Netz- und Datenbankzugriffe.

## Offene Punkte / Fragen an Xander
1. **Tonart im eigenen Song-Clip:** Magic allein nahm dort die Clip-Tonart, der Pinsel die Tonart des Song-Takts. Mit der gemeinsamen
   Funktion gilt jetzt für beide die **Tonart des Song-Takts**. Passt das?
2. Dreimal „Tonart“ im Editor: [Tonart] (nur Tonart-Töne zeigen), Magic-Modus [Tonart], Pinsel [Tonart: Auto]. Umbenennen
   (z. B. Magic-Modus „Leiter“)?
3. Die Tonart-Wahl gibt es zweimal mit gleichem Inhalt: Magic ([Auto ▾]: Grundton + Dur/Moll) und Pinsel (Grundton + 7 Modi).
   Reicht eine (die vom Pinsel)?
4. Aus KON (unverändert offen): die Block-Zeile ist 14 px (quer 12 px) hoch, unter 44 px wie die Marken-Chips; ein Teil mit
   Transpositions-Wechsel in der Mitte, live aus der Teil-Leiste gestartet, nimmt nur die Transposition vom Anfang.
5. Die Fragen aus `bau/helfer/*/CHANGES.md` gelten weiter.

## Sichtbare Änderungen für Xanders Funk
- **Neu: Block** über der Taktleiste (▣), hineingehen, **[Als neuen Teil konsolidieren]**, **[Zurückholen]** – klingt identisch, auch mit Chor.
- **Noten-Editor:** neue Gruppe **Pinsel · Magic · Mithören** hinter ✎ ⬚ ⌫.
- **[Magic]** → Zeile unten: Wischen, Pause, Pause +, Akkorde, Tonart / Terzen / Terz+Quinte, Tonart-Wahl, Umk. ▲ ▼, Glatt.
- **[Pinsel]** → vorn in der Aktionsleiste: schmal / mittel / breit, Tonart: Auto; dazu Umkehren ↕, Achse, Krebs ↔, Tauschen ⇆.
- **[Mithören]** → Spur-Chips, Ohne Drums, Alle ab, Fertig.
- Version im Menü: **SYNQUENZER 4.29.0**.
