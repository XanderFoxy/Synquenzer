# KI1 – Profi-Trennung (Spektral-Seite) · NOTES (Auftrag 3/3, 14.11.2026)

Basis 4.58.1 (`vx/basis3.html`) + Block `KI1-BEGIN … KI1-END` direkt nach `/* MTX-END */` + 9 Einhänge-Zeilen mit „KI1“.
`index.html` entsteht reproduzierbar: `cp ../basis3.html index.html && python3 einbau.py index.html ki1-block.js` (geprüft: bitgleich).
VERSION/CHANGES nicht angefasst.

## Was der Nutzer sieht
- Hochkant: neben „Zerlegen“ ein schmaler Teil „▾“ (44 × 44) → Klappfenster: „Zerlegen (schnell, ohne Download)“ ·
  „Profi-Trennung laden (~86 MB, einmalig)“ bzw. „Profi-Trennung (genauer, ≈ 10 s)“ / „fortsetzen (25 %)“ / „weiter laden (noch x MB)“ ·
  Hinweiszeile · „Profi-Trennung vom Gerät löschen (86 MB)“. „Zerlegen“ selbst rechnet wie bisher sofort klassisch.
- Quer (926 × 428 / 926 × 370): Zelle zu schmal für „▾“ → Knopf heißt „Zerlegen ▾“ und öffnet dasselbe Klappfenster
  (1. Eintrag = Zerlegen wie bisher). **Bedienung quer = ein Tipp mehr → im Funk ansagen.**
- Fortschritt in der Statuszeile („lädt … x/86 MB · %“, „Stück 3/31 · %“), „■ Abbrechen“ und ✕ halten an (Stücke bleiben).
- Neu im Guide: „Profi-Trennung (Drums, Bass, Gesang, Rest)“ (Suche „profi“, „gesang trennen“). Kein Modell-/Firmenname im
  sichtbaren Text; der Ablage-Pfad steht nur in der Download-Adresse im Code.
- Die Zeitangabe im Klappfenster rechnet mit der Länge des offenen Stücks und – nach dem ersten vollen Lauf – mit der auf
  diesem Gerät gemessenen Geschwindigkeit (`localStorage synq-ki1-sps`; vorher 0,35 s je Sekunde Audio).

## Test `ki1-test.mjs` – ALLES OK (19 Prüfungen, 46 s)
Aufruf: `node ki1-test.mjs <abs index.html> <abs modell/> <abs ki-ort/web/> [<abs Gesang.wav 44,1 kHz mono>]`
(Modell-Ablage + CDN werden per Route aus lokalen Kopien bedient, Inhalt = Original, Prüfsummen echt, Abrufe gezählt.)
start-laedt-nichts (kein Worker, kein Cache, G9 nicht ausgewertet, 0 Abrufe) · split-knopf-und-eintrag (▾ 44×44, Eintrag mit
Größe) · laden-und-erstes-stueck (7 Abrufe, Fortschritt sichtbar) · nach-neuladen-fortsetzen-angeboten (25 %) ·
fortgesetzt-ohne-neuen-download · ebenen-summe-gleich-original (147,1 dB, Überlauf 0) · profi-sdr · abbrechen-nichts-geaendert ·
ein-undo (↶ / ↷) · x-sichtbar · speichern-laden (gleiche Masken + angefangener Lauf übersteht Speichern) · container-zip
(doc.json + p0/p1.wav + 3 Masken, keine Zwischenstücke; Analyse gelöscht → ZIP gelesen → gleiche Masken) · quer-428 · quer-370 ·
hochkant-layout (keine Taste < 44 px, nichts außerhalb, ✕ sichtbar) · besser-als-klassisch-demo · gesang-besser-als-klassisch ·
guide-eintrag · keine-fehler.
Außerdem grün: `ki1-test48.mjs` (48 kHz, quer 428 + 370) aus Auftrag 2.

## Messung: SDR je Ebene (dB, Browser, WASM)
| Stück | Weg | Drums | Bass | Gesang | Rest | Tonales | Summe = Original |
|---|---|---|---|---|---|---|---|
| Demo 19,6 s (ohne Stimme) | klassisch | 5,99 | 0,77 | 0,71 (gg. Synth-Lead) | 2,69 (gg. Fläche) | 8,16 | 147 |
| Demo 19,6 s (ohne Stimme) | **Profi** | **9,71** | **4,59** | 0,00 (gg. Synth-Lead) | 0,82 (gg. Fläche) | **11,81** | 147 |
| Demo + echter Solo-Gesang 17,3 s | klassisch | 4,29 | −0,25 | 1,15 | 3,69 | 6,76 | 147 |
| Demo + echter Solo-Gesang 17,3 s | **Profi** | **8,99** | **3,75** | **7,51** | **8,30** | **11,65** | 147 |

Gesang +6,4 dB, Bass +4,0 dB, Drums +4,7 dB, Rest +4,6 dB gegenüber klassisch. Im Demo ohne Stimme legt Profi den Synth-Lead
(richtig) in „Rest“, darum ist dort „Gesang gegen Lead“ kein Maßstab. Gesang-Testdatei: freier Solo-Gesang-Datensatz
(CC BY 4.0), nur im Test, nicht in der App. 48 kHz: ≤ 0,22 dB unter 44,1 kHz.

## Laufzeit + Speicher (Prüf-Rechner) und Schätzung iPhone 12 Pro Max
Prüf-Rechner: Xeon 2,1 GHz (Cloud-Kern), Chromium, WASM SIMD, 1 Faden im Worker, ohne Isolation (`ki1-lang.mjs`, `ki1-lang.json`):
- Demo 19,6 s: 3,2–3,8 s gesamt (4 Stücke, Modell ≈ 2,8 s).
- 3-min-Stück (176,5 s): **38,5 s** gesamt (Modell 33,8 s), 30 Stücke à 1,26 s, 218 ms je Sekunde Audio.
- Speicher: +111 MB im Browser während der Rechnung (Worker mit 4 Modellen); Zwischenstücke in IDB 1,6 MB je Stück
  (3 min ≈ 47 MB, nach Fertig gelöscht); Modell-Cache 86 MB (einmalig, bleibt bis „vom Gerät löschen“).
- Erstes Laden: 86 MB (WASM-Satz) bzw. ≈ 98 MB (WebGPU-Satz); liegt die Laufzeit schon von der Spracherkennung im Cache, ≈ 71 MB.

Schätzung iPhone 12 Pro Max (A14, Safari iOS 26), WASM ein Faden: A14-Einzelkern ≈ 1,3–1,6× schneller als der Prüf-Kern,
Safari-WASM ≈ 0,7–1,0× so schnell wie Chromium → Faktor ≈ 0,8–1,5 auf die Prüf-Zahlen:
| | Prüf-Rechner | iPhone (geschätzt) |
|---|---|---|
| 20-s-Stück | 3,5 s | ≈ 3–6 s |
| 3-min-Song 44,1 kHz | 38,5 s | **≈ 30–60 s** (+ ≈ 1–2 s Start der 4 Modelle) |
| 3-min-Song 48 kHz (iPhone-Aufnahme) | – | ≈ 35–70 s (Umrechnen je Stück) |
| Erstes Laden 86 MB | – | WLAN 50 Mbit/s ≈ 15 s, Mobilfunk deutlich länger |
| Speicher | +111 MB | ähnlich; Safari-Grenze je Tab weit darüber |
Ein Kern unter Volllast für ≤ 1 min: Akku/Wärme unkritisch; Oberfläche bleibt frei (alles in Workern, Wiedergabe läuft weiter).

## WebGPU (offen, nur auf dem Gerät messbar)
- Wahl wie G9A: WebGPU nur mit Adapter **und** `shader-f16`, sonst WASM; Fehler beim Laden/Rechnen → WASM, gemerkt.
  Im Container hat der Adapter kein `shader-f16` → WebGPU-Weg hier nie gerechnet.
- Befund: Die Laufzeit hat für LSTM nur einen CPU-Kern (im WebGPU-Bündel steckt nur `DeepCpuLstmOp`). Das LSTM ist der
  Großteil der Rechnung → auf WebGPU läuft es trotzdem auf der CPU (mit Kopien GPU↔CPU). Das WebGPU-Bündel (asyncify)
  rechnet die CPU-Teile gleich schnell wie das normale (307 vs 259–295 ms je Stück und Modell, `asy-test.mjs`).
  Erwartung: WebGPU kaum schneller, aber +12 MB Download und ungetesteter Weg.
- **Empfehlung:** auf dem iPhone einmal `?ki1how=wasm` und `?ki1how=webgpu` vergleichen (Zeit steht in der Statuszeile
  „Profi-getrennt … · x s“). Ist WebGPU nicht klar schneller → Standard auf WASM stellen (eine Zeile in `ki1How`).

## Regression
- `spk1-test.mjs` (mess/ neben der Datei): 17 OK, 1 FEHL `verfeinern-verbessert-ziel` (0,77 → −0,46 dB) – identisch auf
  `basis3.html`, vorbestehend, nicht KI1.
- Pflicht: topdefs doppelt 0 / Syntaxfehler 0 · dupkeys 0 · smoke errors [] (`smoke-a3.png`) · „MS 2000“ 1× · „  live: true,“ 1×.

## Fotos
`fotos/ki1-01-klappfenster.png` (hochkant, ▾ offen) · `fotos/ki1-02-profi-getrennt.png` (Ebenen nach Profi-Trennung) ·
`fotos/ki1-04-quer-926x428.png`, `fotos/ki1-04-quer-926x370.png` („Zerlegen ▾“ offen) · `fotos/ki1-03-quer-*.png` (48 kHz).

## Offen / Hinweise
1. Funk: Split-„▾“ hochkant, „Zerlegen ▾“ quer (ein Tipp mehr) ansagen; Größe „~86 MB, einmalig“.
2. WebGPU-Nutzen auf dem Gerät messen (s. o.), ggf. WASM als Standard.
3. jsDelivr war aus dem Container nur über das npm-Paket prüfbar (Proxy 403) – Hashes = G9A-Satz + npm-Paket.
4. Die Modell-Ablage hat auf `main` nur noch eine Spur; die App lädt aus dem festen Commit (funktioniert). Fällt die Ablage
   weg, zeigt die App beim Laden einen Fehler, Zerlegen klassisch bleibt. Eigener Spiegel wäre die sichere Lösung.
5. `SPK1_T2.ki` („KI-Trennung … kommt in Teil 2“) wird nirgends mehr angezeigt (nur Test-Zugang `__spk.teil2`), Text belassen.
6. Ein Container-Import über eine schon vorhandene Analyse mit derselben Kennung löscht alte Masken-Streifen nicht vorher
   (SPK1-Verhalten, nicht KI1; im Test wird vorher gelöscht).
