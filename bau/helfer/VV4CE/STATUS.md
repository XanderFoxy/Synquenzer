# STATUS VV4CE (VV4-C + VV4-E) — fertig zur Prüfung durch Xander

Datei: `bau/helfer/VV4CE/index.html` (Basis R-4261, App 4.26.1, VERSION unverändert). Patch: `patch.diff` (536 Zeilen).
Geprüft in Chromium (Playwright, headless). **Auf dem iPhone noch nicht gesehen** – nicht fertig ohne Xanders Okay.

## Testzahlen
| Lauf | Ergebnis |
|---|---|
| `tests/vv4ce-abn.mjs` (Song mit Melodie-Clip, FM-Clip ohne Modulation, Drum-Clips; Render; Einzelbilder; fertiges Video) | **19/19** |
| `tests/vv4ce-mk.mjs` (Geräte-Engine ohne/mit Patch, Platte + K1, Zeichenzeit) | **6/6** |
| `tests/vv4ce-ui.mjs` (Spur-Blatt → [Modulation], 428×926 und 926×428, Undo, Speichern/Laden, Live-Vorschau) | **14/14** |
| `bau/tests/smoke.mjs` | ohne Fehler |
| `bau/tests/orch-mk-check.mjs` | bestanden (4.26.1, initAm gleich wie R-4261) |
| `bau/tests/v3-mk2-wellen.mjs` | OFFEN (Bezug `dwgs-trace` fehlt hier am Bau-Ort – auch bei R-4261) |
| VV2 `n5-v-vv2-01` 16:9 und 9:16, `-02` (Vergleichsdatei = R-4261), `-03`, `-04z` (Kamera ≤ 4,5 %: 3,39 %), `-05` (alle 6 Formate) | bestanden |
| VV1 `n5-v-a1` | bestanden |
| VV1 `n5-v-abn-01/-04/-07/-10b` | hier nicht lauffähig (Schriften/Bibliothek unter fremdem Pfad; R-4261 genauso) |

Gemessen (Auszug):
- VV4-08: Noten = `clip.notes` (Anzahl, Lage ±1 px) an 10/10 Zeitpunkten; umrandet = klingend laut Notenlog 10/10.
- VV4-09 (4 Takte, 120 BPM, Bild für Bild): leuchtender Schritt = Schritt im Notenlog 56/56 Treffer; Kick/Snare-Wechsel nur bei
  Treffer, ≤ 1 je Schlag; Hi-Hat-Zeile leuchtet bei 24/24 Treffern im Bild des Treffers.
- VV4-01: FM-Spur ohne Modulation → kein Regler im Bild (8/8); `vvDirSet(…, 'mod', Spur ohne Modulation)` = abgelehnt.
- VV4-02: LFO 1 → Cutoff: Live-Punkt = LFO-Phase aus der VV3-Rechnung, Abweichung 0° (Grenze 2°), 18 verschiedene Lagen.
- VV4-03: Sonde – 19 Elementarten, jede mit App-Gegenstück; kein Oszilloskop/Filterkurve/PEGEL-Folger.
- Ton: Render-Spitze −1,2 dBFS; fertiges Video über den **Aufnahme-Weg (MediaRecorder, Echtzeit – wie iPhone ohne AudioEncoder)**
  hat Ton (max −1,1 dB); WebCodecs-Weg (Opus, Test) ebenso; Bildvergleich Video ↔ `vvShot('mod:2')` passt.
- Zeichenzeit je Bild bei 1080×1920: Roll 0,24 ms, Drum 0,62 ms, Modulation 0,47 ms, Modulation Geräte-Platte 0,27 ms (Erstbild der Platte ~9 ms, dann zwischengespeichert).
- Keine Konsolenfehler in allen Läufen.

## Beispiel-Bilder (`bilder/`)
- `roll-16x9.png` – Piano-Roll Synth 3 (klingende Noten umrandet, Laufstrich)
- `drum-16x9.png`, `drum-9x16.png` – Drum-Sequenzer (KICK gezeigt, Hi-Hat-Zeile mit Treffer-Ring)
- `spur-fm-16x9.png` – Spur ohne Modulation: nur Roll
- `spur-mod-9x16.png` – Spur mit Modulation: Roll + CUTOFF-Regler mit Mod-Ring + K1-Übersicht
- `mod-16x9.png` – Modulations-Bild; `mod-mk-16x9.png` – Geräte-Engine (Platte + K1)
- `video-t5.png` – Bild aus dem fertigen Video (Takt 3–4 = [Modulation] Synth 3)
- `ui-P-spurblatt.png` – Spur-Blatt mit neuer Zeile [Modulation]; `ui-P-vorschau.png` – Live-Vorschau 9:16

## Bitte prüfen (iPhone 12 Pro Max, Safari)
1. Song mit Melodie und Drums → Menü → Video → Video erstellen (Auto): wo die Regie eine Spur zeigt, kommt die Piano-Roll mit
   den echten Noten (klingende umrandet) bzw. der Drum-Sequenzer (Kick/Snare wechseln mit den Treffern, Hi-Hat darunter).
2. Song-Ansicht: Takte markieren → ⋯ → Video → [Spur …] → unter „Modulation“ eine Spur antippen → Video: dort Regler mit
   Mod-Ring und die Modulations-Liste. Eine Spur ohne Modulation steht dort nicht.
3. Das Video hat Ton.

## Offene Punkte
- iPhone-Sicht durch Xander fehlt (Schrift, Schärfe, Tempo des Aufnahme-Wegs).
- Eigene Bild-Wahl [Piano-Roll] / [Drum-Sequenzer] und „erster Auftritt eines Clips → Roll“ sind VV4-B / VV4-D (andere Pakete).
- Die K1-Liste zeigt wie die App alle Einträge (auch Keytrack/Analog); was nicht in den Platz passt, fällt unten weg (die App rollt).
- `v3-mk2-wellen` und die VV1-abn-Läufe brauchen Dateien vom Bau-Ort des Dirigenten.
