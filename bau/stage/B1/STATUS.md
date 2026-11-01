# Stufe B1 – Status

`bau/stage/B1/index.html` = 4.30.0 + T1 + SX11 + N8I134 + B1-Lösungen (CHANGES.md), VERSION `'4.30.0'`, Diff `stage.diff` gegen
`bau/snapshots/R-4300.html`. **Tests grün, Xander hat nichts davon gesehen – nicht fertig ohne sein Okay.**

## Tests (`sh bau/stage/B1/tests/alle.sh`, Playwright + Chromium, Touch; alle gegen `../index.html`)
| Satz | Test | Ergebnis |
|---|---|---|
| T1 | `t1/t1-taktarten.mjs` (T1-01 … T1-07) | 45/45 |
| T1 | `t1/t1-bitgleich.mjs R-4300 index` (alte Songs: JSON + jedes Ereignis gleich) | 10/10 |
| T1 | `t1/t1-layout.mjs` | 30/30 |
| SX11 | `sx11/sx-fassung.mjs` | 54/54 |
| SX11 | `sx11/sx-live.mjs` | 24/24 |
| SX11 | `sx11/sx-kon.mjs` | 25/25 (vor B1-Lösung 2 Absturz: `tkInfo` überschrieben) |
| SX11 | `sx11/sx-layout.mjs` | 36/36 |
| N8I134 | `n8/i1f-math-node.mjs` | 15/15 |
| N8I134 | `n8/i1f-neigen.mjs` | 33/33 (I1-62 Sensor-Klemme flackert gelegentlich – auch im Paket allein) |
| N8I134 | `n8/i3-korpus.mjs` | **9/14 – wie im Paket** (Befund 1: Korpus 56 % statt ≥ 90 %; prüft nur `src/formclean.js`, unabhängig vom Zusammenführen) |
| N8I134 | `n8/i3c-ui.mjs` | 43/43 |
| N8I134 | `n8/i4c-tapnotes.mjs` | 11/11 (I4-32 Zeitgrenze 15 ms liegt knapp: unter Last 15–19 ms, auch im Paket allein) |
| N8I134 | `n8/n8-core.mjs` | 44/44 |
| N8I134 | `n8/n8-layout.mjs` (Start, Synth, Menü pixelgleich 4.30.0) | 12/12 |
| N8I134 | `n8/n8-regel28.mjs` (alte Projekte: Nachrichten, JSON, Renders) | 13/13 |
| B1 | `b1/b1-regeln.mjs` (acorn: 21 klassische Blöcke, 0 Syntaxfehler, 0 doppelte Top-Level-Namen, 0 neue überschriebene Test-API-Schlüssel, Regeln) | 10/10 |
| B1 | `b1/b1-zusammen.mjs` (leicht/voll × 3/4 und 7/8, Konsolidieren im 3/4-Song, Morph/LFO bei ≠ 4/4, Speichern/Laden alle Felder) | 31/31 |
| B1 | `b1/b1-lfoleiste.mjs` (LFO-Form-Leiste trifft 44 × 44, Höhen wie 4.30.0, Finger-Tipp) | 36/36 |
| B1 | `b1/b1-shots.mjs` (Maße + Überdeckung + Bilder `shots/`) | 33/33 |
| Bestand | `bau/tests/smoke`, `v3-mk8-smoke`, `v3-mk8b-smoke`, `v3-qa-mk5reg-smoke` | grün, keine Fehler |
| Bestand | `bau/tests/orch-mk-check.mjs` | grün (4.30.0, initAm rms 0.0705 wie Basis) |

Test-Anpassungen: nur `t1/t1-taktarten.mjs` `Q.tkInfo(7)` → `Q.taktInfo(7)` (B1-Lösung 2). Pfade der Testsätze auf `bau/stage/B1` umgestellt
(`../../index.html`, N8 `src/` liegt unter `tests/n8/src`). `alle.sh` legt für ESM-Importe vorübergehend `node_modules` → `$(npm root -g)` an
und räumt es wieder weg.

Gegenprobe der neuen B1-Tests an den Einzelpaketen: `b1-regeln` findet in T1 den überschriebenen Schlüssel `tkInfo`, in N8I134 das doppelte
`stStart`; `b1-zusammen` ohne die Taktkarten-Lösung 5 → „7/8: [Voll] = exakt vorher“ rot.

## Regeln geprüft
- `  live: true,` genau 1× · „MS 2000“ genau 1× · verbotene Wörter 0 (auch in Kommentaren und in `bau/stage/B1/**`) · VERSION `'4.30.0'`.
- Keine neuen Netz-/Datenbank-Zugriffe (Treffer wie 4.30.0), keine neuen Emoji (✎ ist ein Text-Zeichen wie in N8I134).
- Touch-Ziele der neuen Stellen ≥ 44 px (Tempo-Fenster, Marken-Blatt inkl. Taktart aufgeklappt, LFO-Form-Leiste, Form-Blatt) in 428×926, 926×428, 428×650.
- Alte Projekte laden/speichern zeichengleich (t1-bitgleich, n8-regel28, sx-fassung „alte 4.30.0-Datei“); neues Projekt ohne neue Felder = Format 5 ohne `need`.

## Bildschirmfotos (`shots/`, selbst angesehen)
`b1-1-tempo-*` Taktart im Tempo-Fenster · `b1-2-marke-*` Marken-Blatt mit [Taktart ▾] + [Leicht][Voll][⧉ Variante][Einfügen] ·
`b1-3-marke-taktart-*` Taktart aufgeklappt (quer jetzt eine Zeile, nichts überdeckt) · `b1-4-lfo-*` LFO-Seite mit ✎ · `b1-5-form-*` Form-Blatt –
je 428x926, 926x428, 428x650.

## Bitte prüfen (Xander am iPhone)
1. BPM antippen → Taktart 3/4 → [Clips umrechnen] → Song: Refrain-Marke → [Leicht]. Hi-Hat im Refrain in Achteln, Kick/Snare wie vorher? [Voll] → alles wieder da?
2. Marken-Blatt **quer**: [Taktart ▾] aufklappen – 8 Knöpfe in einer Zeile, darunter Leicht/Voll gut zu treffen?
3. Leichten Refrain im 3/4-Song [Als neuen Teil konsolidieren] und hinten einsetzen: klingt wie der leichte Refrain?
4. Synth → LFO: die sechs Form-Felder (jetzt 44 px breit) – gut zu treffen, „S&H“ wieder klein wie früher? ✎ öffnet das Form-Blatt.
5. „● Singen“ einmal starten (B1-Lösung 3: der Name `stStart` war doppelt belegt).
6. Ein altes Projekt öffnen, abspielen, speichern: klingt und bleibt wie vorher.
