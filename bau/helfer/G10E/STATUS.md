# G10e — Status

**Stand:** 123 Prüfungen grün (Abschlusslauf `tests/alle.sh`). Gebaut und in Chromium (Playwright, Touch über CDP) getestet. **Nicht auf dem iPhone geprüft** – Abnahme durch Xander steht aus.
Basis `bau/snapshots/R-4300.html` (4.30.0), VERSION unverändert. Zweig `g10e-warp`.

## Abgabe

| Datei | Inhalt |
|---|---|
| `index.html` | App 4.30.0 + G10e (gebaut mit `bau.py`) |
| `patch.diff` | `diff -u` gegen `bau/snapshots/R-4300.html` |
| `bau.py`, `src/g10e.js`, `src/g10e.css` | Bau: Basis + eigener Block + 25 Haken (jeder muss genau 1× passen) |
| `CHANGES.md` | was neu ist, gefundene Fehler, überholte Test-Erwartungen, Fragen an Xander |
| `tests/` | `alle.sh`, `g10e-a…e-*.mjs`, `h.mjs` (Hilfen), `probe0.mjs`, `probe-gross.mjs`; Ausgaben in `tests/out/` (nicht eingecheckt) |

## Abnahme (Spec §2.5) – Ergebnis Chromium

| Nr. | Prüfung | Ergebnis |
|---|---|---|
| G10-35 | Pinch: Punkt unter den Fingern ±2 px | 0,00 px (auch mit wandernder Mitte) |
| G10-35 | Zoombereich ganzer Take ↔ 0,25 ms/px | 4,600 s ↔ 0,2500 ms/px |
| G10-35 | Bildzeit beim Pinch/Schwenken, 32-s-Take, 4× CPU-Bremse, p95 ≤ 16,7 ms | p95 14,2 ms, Median 8,8 ms, max 16,8 ms (Zeichenzeit je Bild, 336 Bilder). Hinweis: rAF-Abstand in Chromium headless unter Bremse p95 33 ms (schließt die CDP-Eingabe ein) – auf dem Gerät prüfen |
| G10-36 | 1000 Ein-Finger-Gesten (Wischen/Tippen/Halten) in 6 Zoomstufen | 0 bewegt, 0 neu, 0 Undo |
| G10-36 | 200 Zwei-Finger-Gesten (auch erster Finger auf einem Strich) | 0 bewegt, 0 Undo |
| G10-37 | Doppeltipp: Silbe 70 ± 5 % / zurück ±1 px | 70,0 % / 0,000 px |
| G10-38 | [▶] = next − mark + 80 ms ±5 ms; Klick auf der Rasterlinie ±1 ms | 0,0 ms Abweichung (geplante Wiedergabe gemessen am AudioBufferSource) / 0 ms |
| G10-39 | Versatz-Zahlen = wpGeom ±1 ms, Farben nach Schwelle | 0,000 ms; Farben aus den Pixeln geprüft |
| G10-40 | Nur Wortanfänge: Wörter auf dem Raster ±1 ms, Silben im Verhältnis ±2 % | 0,000 ms / 0,006 % |
| G10-41 | Q-Bereich 15 ms: nahe Einsätze bitgleich an ihrer Stelle | 4/4 (Ziel = Quelle, gerendert bitgleich zur gehörten Original-Fassung) |
| G10-42 | Alte Takes ohne src/wo/qr: dieselbe Karte, bitgleiches Abspielen wie 4.30.0 | 4 Raster/Modi deep-equal, Prüfsummen gleich (R-4300 und G10e nebeneinander gerechnet) |
| G10-43 | Layout / Mini-Karte / Griff-Leiste / kein Sprung | 428×926, 926×428, 428×650, 390×844, 375×667, 320×568: ✕ ganz treffbar, Ziele ≥ 44 px, nichts abgeschnitten, kein Sprung |

Außerdem grün: K-05/K-06 (K2), Halten 450 ms = neue Marke (1 Undo, Einrast-Klick), [+] bewaffnet/endet, Tipp ins Leere setzt nichts,
Schließen per ✕ / Tipp außerhalb / Kopf wischen, Strich-Blatt [▶] bleibt offen, Abspielmarke (▶, Prüf-Lauf, Szene abspielen) + Folgen,
Einrasten sichtbar (Linie, Blase „Takt · Schlag · Raster“, Klick je neuer Linie), Lupe, Prüf-Lauf, Undo/Redo je Geste deep-equal,
Speichern → Laden deep-equal (src, wo, qr), **Chor folgt dem bearbeiteten Lead** (Hüllkurven-Versatz 0 ms, nach ↶ wieder gleich),
**Silben je Strich** an ihrer Stelle (0 px) und **Mitlese-Zeile** zur gehörten Zeit (< 1 ms), Tonwechsel-Marken folgen anteilig,
Regeln: „MS 2000“ 1×, `  live: true,` 1×, keine verbotenen Namen, VERSION 4.30.0, kein Datenbank-/Netz-Zugriff, keine Konsolen-Fehler.

**Rauchtests `bau/tests`:** `smoke`, `v3-mk8-smoke`, `v3-mk8b-smoke`, `v3-qa-mk5reg-smoke` – Basis und G10e gleich, 0 Fehler.
**Alte Marken-Editor-Tests** (`n4-vs-p-reg-gs7-v3-vs5a-t1/-t3/-t4`, `…-vs5b-t1`) auf R-4300 und G10e: **gleiche Ergebnisse**
(die dort schon in 4.30.0 roten Prüfungen sind Erwartungen älterer Stände, z. B. Standard-Stärke 70 %, nicht G10e).

## Bekannte Grenzen / bitte auf dem Gerät prüfen

1. **Haptik:** Labels nach G9-Muster eingebaut; ob der Tick auf Raster/A/B/Modus/[+]/[⋯]/Zoom kommt, nur am iPhone prüfbar.
2. **Kopf wischen:** Liegt eine angedockte „Rückgängig“-Meldung über dem Kopf, bricht Chromium den Zug ab (Zeiger und Touch).
   ✕ und Tipp außerhalb schließen trotzdem. Der Hotfix 4.30.1 bringt den [Ablegen]-Griff – G10e fasst den Kopf sonst nicht an.
3. **Bildrate** auf dem Gerät messen (32-s-Take, Pinch).
4. Sehr kleine Geräte (≤ 600 px hoch, hochkant): ohne Mini-Karte (Welle ginge sonst unter 40 px); Pinch/Schwenken gehen dort wie sonst.
5. Welle hochkant 108 px statt 114 px (Mini-Karte); die Studio-Ansicht (Schalter, aus) gibt 212 px – Frage an Xander in CHANGES.md.

## Bitte prüfen (Xander)

Takes-Blatt → [✎ Marken · Quantisieren]:
1. Mit einem Finger über die Welle wischen, tippen, halten → nichts verschiebt sich, nichts wird quantisiert.
2. Zwei Finger auseinander → zoomt um die Fingermitte; Doppeltipp zwischen zwei Strichen → genau die Silbe; nochmal Doppeltipp → zurück.
3. Einen Strich oben am Dreieck ziehen (Take vorher auf 1/16) → Lupe, die Ziel-Linie leuchtet, Blase „Takt …“, leiser Klick beim Einrasten.
4. Tipp auf ein Dreieck → [▶] hören; [⋯] → „Klick auf der Rasterlinie“ an → [▶] mit Klick; [⋯] → Prüf-Lauf.
5. Schließen: ✕, Tipp oben ins Raster, Kopf nach unten wischen.
