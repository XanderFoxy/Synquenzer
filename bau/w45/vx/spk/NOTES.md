# SPK1 – Spektral-Seite Teil 1 · NOTES (Stand Schritt 4/4)

Datei: `vx/spk/index.html` (Basis 4.54.1 + Block `SPK1-BEGIN … SPK1-END` direkt nach `/* BEG1-END */`, Einhänge-Zeilen mit „SPK1“).
Quelle des Blocks: `vx/spk/spk1-block.js`, Einbau: `python3 einbau.py`. VERSION/CHANGES unberührt.

## Was Schritt 4 gebaut hat
- **Zerlegen** (Knopf „Zerlegen“, im Worker): ganzes Stück → Ebenen Drums, Bass, Gesang + Rest.
  - HPSS (Median 17 Rahmen zeitlich / 17 Bins spektral) bei FFT 4096; Tiefband (< 500 Hz, Übergang 320–500 Hz) mit FFT 8192:
    Bass = Kamm des verfolgten Grundtons (30–260 Hz, Obertonsumme, Stetigkeit), nur wenn sicher (Treffer-Güte und
    Obertöne/Grundton – ein Kick-Ausklang ist fast ein Sinus und fällt so heraus); was daneben tief und kurz ist → Drums.
  - Gesang = harmonischer Vordergrund (REPET-SIM: je 4 Rahmen die 10 ähnlichsten Stellen ≥ 1 s entfernt, Median-Modell),
    Stimmband 100 Hz–10 kHz. Rest fängt alles auf → Summe aller Ebenen = Original (gemessen 147 dB Abstand, d. h. bitnah).
  - Wiener-artig: Anteile 3×3 geglättet, dann in die Masken-Kacheln. Eigene Ebenen bleiben unberührt (verteilt wird nur der freie
    Teil); ein zweites Zerlegen füllt die früheren Zerlegen-Ebenen neu.
  - Fortschritt in der festen Statuszeile („Zerlegen · Ähnlichkeit 12 %“ / „Trennen 70 %“), der Knopf wird zu „■ Abbrechen“:
    Abbrechen nimmt alles zurück („nichts geändert“). Ein Undo-Schritt für alles. Während der Rechnung sind ↶/↷, In Ebene und
    Verfeinern gesperrt (der Kern lehnt solche Aufträge ebenfalls ab).
  - Zwischenstände: dB-Bytes bis 10 kHz + Ähnlichkeits-Tabelle in IDB (`spk:<id>:zq`, `spk:<id>:zn`), Fortschritt je Streifen in
    `doc.jobs.zerlegen.k` → nach Neuladen rechnet ein neues Zerlegen ab dem letzten Streifen weiter.
- **Verfeinern** (Knopf „Verfeinern …“, braucht eine Auswahl): Frage „Was steckt hier?“ Bass │ Gesang │ Drums │ Lead │ Pads │ Rest.
  FFT je Ziel: Bass 8192 (Kamm ohne Zweifel-Schranke, der Nutzer hat ja „Bass“ gesagt), Drums 1024 (Hop 256) + tief 8192,
  Gesang/Lead 4096 (Grundton-Kamm, Lead = lautester Verlauf), Pads 8192 (lange Zeit-Glättung), Rest = alles in der Auswahl.
  Ergebnis in die Ziel-Ebene (gibt es keine, wird sie angelegt), die anderen Ebenen geben anteilig ab → Summe bleibt.
  Danach Klappfenster „Verfeinert: …“ mit [Vorher │ Nachher] (Bild = Ebenen-Farben, Ton = ▶ Hören der Ziel-Ebene in der
  Auswahl), [Übernehmen], [Verwerfen]. Ein Undo-Schritt; Patch-Eintrag in `doc.patches`.
- Teil 2 nur Schnittstellen: `__spk.teil2('notes'|'learn'|'find'|'matrix'|'recipe'|'ki')` → „kommt in Teil 2“; Daten liegen schon
  im Dokument (`teil2.notes/tmpl/loops`, `patches`, Grundton-Spuren rechnet `lowSplit`). Takt-Raster: `spk1Grid` nimmt das
  Projekt-Tempo, falls `imp1Analyse` da ist, dessen Ergebnis (einzige Stelle). Audio in die Matrix: Teil 2 nach IMP1.
- Kleiner Fehler behoben: Kern ohne IDB (Rückfall Speicher) lieferte `{result}` statt des Werts.

## Messung (Demo-Song, offline aus der App gerendert)
Demo-Projekt (112 BPM, 8 Takte, 19,6 s, 44,1 kHz): je Spur einzeln wie „Export › Einzelspuren“ (Synth 1 = Bass, Synth 2 = Pluck/Lead,
Synth 3 = Fläche, Drums) und einmal gemischt. Das echte Gemisch weicht durch die Summen-Kette um −11 dB von der Summe der Spuren ab,
darum wird die **Summe der Spuren** zerlegt (genaue Wahrheit). Rohdaten: `vx/spk/mess/*.f32`, Skripte `mess/stems.mjs`,
`mess/node-zr.mjs` (Kern in Node), `mess/oracle.mjs` (ideale Masken).

| Ebene | SDR Zerlegen | ideale Maske (Obergrenze, FFT 4096) | Anteil der eigenen Spur |
|---|---|---|---|
| Drums | **6,0 dB** | 12,1 dB | 75 % der Drums in „Drums“ (19,5 % in „Bass“) |
| Bass | **0,8 dB** | 6,9 dB | 28 % des Basses in „Bass“, 60 % in „Drums“ |
| Tonales (Gesang + Rest gegen Lead + Fläche) | **8,2 dB** | – | Lead 52 % / Fläche 58 % im Rest |
| Summe aller Ebenen = Original | 147 dB | | |

Vor dem Tiefband mit FFT 8192 lag Drums bei 2,2 dB und Bass bei −3,2 dB (56 % der Drums im Bass). Zeit: Zerlegen 19,6 s
Stück = 2,1 s im Browser-Container (Worker) → 3 min ≈ 20 s, iPhone geschätzt ≈ 40 s (< 60 s Ziel).

Verfeinern (Auswahl ganze Länge, 20–300 Hz, Ziel Bass): Bass-Ebene 0,8 → −0,5 dB (Anteil 14 → 15 %) – **keine Verbesserung**.
Drums (ganze Länge): 6,0 → 5,7 dB. Lead neu: 0,5 dB. Pads: 2,5 dB (Rest vorher 2,7). Ursache: der harte Anschlag des Basses
(Filter-Hüllkurve) wirkt perkussiv, und der Kick hat einen tonalen Ausklang bei ≈ 49 Hz, den die Grundton-Verfolgung im Gemisch
manchmal als Bass-Ton nimmt.

## Test `spk1-test.mjs` (Browser, Touch, 428×926 → 926×428 → 926×370) – 17 OK, 1 FEHLER
OK: Start lädt nichts (kein Blatt/CSS/Worker) · ≡-Menü → Spektral → Datei laden (WAV des Demo-Gemischs) → WebGL2 · Rekonstruktion
N 1024/4096/16384 ≤ −151 dB · Werkzeuge Rechteck/Zeit/Frequenz/Pinsel per Touch · Transfer „In Ebene kopieren → + Lead“ + Undo ·
Zerlegen per Knopf, Abbrechen per Knopf („nichts geändert“) · Summe = Original · Drums/Bass getrennt (Drums ≥ 4 dB, jede Ebene
gleicht ihrer Spur mehr als der anderen, Bass > 0 dB) · Verfeinern Vorher/Nachher (Umschalten bitgleich zurück, Klappfenster) ·
Undo Zerlegen = ein Schritt, Redo · Speichern/Neu öffnen gleiche Masken · hochkant ohne Überlappung, ✕ 44×44 sichtbar · ✕ schließt
(zurück ins Menü) · quer 428 und 370 ohne Überlappung, ✕ sichtbar, 3 Ebenen · keine Konsolen-Fehler.
FEHLER: `verfeinern-verbessert-ziel` (Bass 0,77 → −0,46 dB) – ehrlich offen, s. o.
Regression: `spk1-kern-test.mjs` ALLE OK, `spk1-seite-test.mjs` ALLE OK.

## Pflicht
topdefs: doppelt 0, Syntaxfehler 0 · dupkeys: 0 · smoke: errors [] (`smoke-schritt4.png`) · „MS 2000“ 1× · „  live: true,“ 1× ·
Markenwörter wie Basis · VERSION gleich, CHANGES nicht angefasst.

## Fotos
`fotos/20-zerlegt-hochkant.png` (Ebenen-Farben nach Zerlegen), `fotos/21-verfeinern-vorher-nachher.png` (Klappfenster),
`fotos/22-quer-428.png`, `fotos/22-quer-370.png`; ältere 01–13 aus Schritt 3 (neu erzeugt).

## Offen
1. Verfeinern verbessert auf dem Demo-Song noch nicht (Bass/Drums). Nächster Versuch: Kick-Erkennung über Anschläge im Takt-Raster
   (Tempo bekannt) + Bass-Grundton über die ganze Note (Viterbi statt Rahmen für Rahmen), Vorlagen (NMF) aus „das ist Bass“.
2. Bass im Zerlegen nur 0,8 dB (Obergrenze 6,9): Bass-Anschlag landet in Drums.
3. Gesang nicht mit echtem Gesang gemessen (Demo hat keine Stimme); Vibrato-/Formant-Hinweise fehlen noch.
4. Weiterrechnen nach Neuladen nur im Kern geprüft (kein Browser-Test mit Neuladen mitten im Zerlegen).
5. Aus Schritt 3 noch offen: Ansicht im Dokument merken, Lineal-Anfang ziehen, H8, Take-Einstieg mit echtem Take, Startzeit-Messung.
