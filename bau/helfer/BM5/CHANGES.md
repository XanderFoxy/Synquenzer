# CHANGES – Bit Mask, Paket BM5 (Bedienfeld wie das Gerät) · Zweig `helfer-bm5`

Grundlage: Kopie von `bau/werkzeug/vs-base-B.html` (App 4.23.0) → `bau/helfer/BM5/index.html` (Merge-Basis).
Spec: `spec/dirigent-spec-v3-nachtrag-7-bitmask.md` Rev. 2, §3, §6 BM5. VERSION-Zeile und CLOUD-Zeile `  live: true,` unverändert,
kein Supabase-Aufruf, „MS 2000“ genau 1×, Anzeigename nur aus `BM_NAME`.

## Gebaut

1. **Block `sq-bm-src`** (wird erst bei Bedarf ausgewertet, `bmLoad`, 3–5 ms): eigene Zeichnung des Bedienfelds, kein Logo, kein Name auf der Platte.
   - 23 quadratische Tasten (gezeichnet 40 × 40 in 44 × 44 Trefferzone) mit warmweiß leuchtender Fläche, 2 runde Drehgeber (Vol, Value),
     rote 4-stellige 7-Segment-Anzeige (eigene SVG-Segmente), Seq-Linie (Seq ── ● Rec ── ▶/■ über den Octave-Tasten, quer mit Linie zur
     Seq/Env-Taste), Env-Linie über Osc1 … Filter, Masken-Übersicht 007 · 008 · 015 · 028 · 031 · 047 / 056 · 063 · 072 · 079 · 095 · 120
     als Linienzeichnung **aus der Masken-Regel §1.2** gerechnet (dreistellige Nummern).
   - Beschriftung wie §3.1: Vol, Octave, Voice, Layer, Split, Init, Write, Global, Param, Seq/Env, Osc1, Osc2, Noise, Filter, LFO1, LFO2, FX, Arp,
     Pitch, Mod, General, Value, Compare.
   - **Quer** (926×428, 844×390, 667×375): ganzes Feld in zwei Reihen, Anzeige zwischen Global und « » Param, Value zwischen General und Compare,
     Vol links über Seq/Env, Masken-Übersicht rechts (entfällt in 667×375). Mit Safe-Area (47 px links/rechts, 21 px unten) eng gedruckt (8,5 px).
   - **Hoch** (428×926 … 320×568): gefaltet A1 │ A2 │ B1 │ B2 nach §3.2, höchstens 7 Zonen je Zeile, Masken-Übersicht als 5. Zeile in 428×926
     und 390×844, in 375×667/320×568 entfällt sie; in 320×568 Rand 6 px (308 px nutzbar).
   - Editor-Reiter für Bit-Mask-Spuren: **[GERÄT] [FX]** (FX = die bisherige FX-Seite der App).
2. **Bedienung wie am Gerät (§3.3):** Modus-Taste → erster Parameter; dieselbe Taste erneut bzw. « Param » blättern; Ein-Parameter-Modi
   (Noise ohne Env, Voice, Init, Write): « Param » ändern den Wert. Value kreisend oder senkrecht, langsam 1 Schritt je 8 px, schnell bis × 8,
   seitlich weg (> 40 px) = Fein (× ¼), Doppeltipp = INIT-Wert. Eine Geste = ein Undo, „geändert“-Punkt und A/B sofort.
   - Anzeige: Namen ≤ 4 Zeichen direkt (0,6 s), längere laufen einmal mit 6 Zeichen/s durch, danach steht der Wert; Masken dreistellig.
   - **LCD-Zeile wie MS 2000:** Sektion · Gerätename · Gerätewert · Klartext (z. B. „OSC1 · MASK · 007 · Maske 7“, „FILTER · CUTF · 37 · 264 Hz“).
   - **Seq/Env** (Schalter): an → « = ● (gleiche Funktion wie ● im App-Kopf), » = ▶/■; Osc1/Osc2/Noise/Filter → L A D S R LOOP. Aus → Octave ±2.
   - **Mehrfach-Bearbeitung:** Taste halten + zweite tippen → beide leuchten, jede Änderung an beiden, ein Undo; Einzel-Tipp beendet.
   - **Voice** (P00 … rechts, U00 … links; Wechsel = Laden, ein Undo, gehaltene Tasten klingen neu an), **Layer/Split** (zeigt B, Value wählt,
     « Param » → SEMI BAL PAN TUNE; Voice einmal = Grundklang, Layer/Split blinkt; Voice zweimal = aus; Split halten + Taste = Splitpunkt, ein Undo),
     **Init** (1OSC/2OSC/VEL/RAND, Init bestätigt, zweimal = Säge), **Write** (Write → U-Platz, Write → Namensfeld im Bedienfeld über den unteren
     Tasten, Write → „DONE“; jede andere Taste schließt das Feld ohne Sichern), **Global**, **Compare** („COMP“, A/B der App, nur mit gespeichertem
     Bit-Mask-Stand; im Vergleich ändert Value nichts; Compare oder Voice beendet), **Arp** 1 s halten → `window.BMARP.stop` (kommt mit BM4).
   - Ziel-Plätze 2–4 erscheinen erst, wenn der vorige eine Menge ≠ 0 hat (LFO und Mod).
   - LEDs §3.1: Modus-Taste, Mehrfach, Layer/Split blinken (aktiv, nicht gezeigt), Arp blinkt (Muster an und Taste gehalten oder HOLD),
     Seq/Env und Compare als Schalter. Octave-Tasten ohne eigene LED (§3.1 nennt keine).
   - Werte mit mehr als 4 Zeichen laufen einmal durch, danach steht eine eindeutige Kurzform: POLY RETRIG → PRTG, MONO PORTA → MPRT,
     MONO RETRIG → MRTG, PARA SLUR → PSLR, NOTCH → NTCH.
   - Arp bzw. Split in ihrem eigenen Modus: der nächste Parameter kommt erst beim Loslassen (1 s halten = Arp stoppen, Split halten + Taste = Splitpunkt, ohne Weiterblättern).
3. **Räder** BEND/MOD links der Tasten in `#kbArea` (Bauweise des MK1-Bauteils, eigene Kopie im Block, damit der MS-2000-Block nicht geladen
   werden muss): BEND federt in 80 ms zurück, MOD bleibt; senden `{t:'ctl', list:[{k:'bd'|'mw', v}]}`.
4. **Druck-Geste (§3.4, F3):** Finger auf gehaltener Taste nach oben: 6 px tote Zone, 0 → 1 über 60 px, AT CURVE formt (1–5, 6, NONE),
   Kanal-Druck = Höchstwert aller gehaltenen Tasten, waagrecht > 20 px = bisherige Tastatur-Bedienung (Druck dieser Taste 0), Loslassen = 0,
   schmaler Balken an der Taste. Sendet `{t:'ctl', list:[{k:'at', v}]}`. Aufnahme in den Clip = BM8.
5. **Test-API** `SYNQUENZER.bmPanel()` (Modus, Parameter, Pfad, Wert, Folge, Anzeige-Text, LEDs, Seq/Env, Mehrfach, Zonen, Druck).

### Platzhalter (klar markiert `BM6-PLATZHALTER` / `BM7-PLATZHALTER`, werden beim Zusammenführen ersetzt)
- `BM_NAME`, `SQBM` (INIT nach §5.1, minimales `normBm` ohne Klemmung), Engine `'bm'` in den Engine-Listen (`SYNTH_ENGINES`, `ENGINE_LABEL`,
  `ENG_OF`, `setEngineOf`, `setEngine`, Engine-Knopf/Chip), `normSynthP` behält `p.bm`.
- Prozessor `'synq-bm'` (Block `sq-bm-ph-src`): spielt nur Maske 31 (Sinus) mit OSC1-Pegel/Attack/Release, VOL, SEMI/TUNE, Global SEMI/TUNE,
  Bend; Nachrichten nach §2.1 (+ `id` an den Noten). `bmHost` (ein Knoten je Spur am Spureingang), Haken in `spawnVoice`.
- Voice-Plätze: P00 = INIT bis BM7 (`window.BMFAC.list()`); U-Plätze = eigene Bit-Mask-Klänge in Sicher-Reihenfolge (`ct`);
  Write sichert über das bestehende `saveSound` (BM6-09 übernimmt den U-Platz-Speicher). INIT-Varianten nach §4 (BM7).

### Geänderte Stellen im bestehenden Code (wenige, je eine Zeile)
`buildSynthEd` (Reiter GERÄT/FX für 'bm'), `fillSynthTab` (Bedienfeld), Tastatur-Handler (3 Haken für die Druck-Geste, nur bei Bit-Mask-Spur
aktiv), `bmWheelFrame()` neben `mkWheelFrame()`, `spawnVoice` (Platzhalter-Weg nur für 'bm'), Test-API `bmPanel`. Neue Blöcke zusammenhängend
vor `sq-mk-src` bzw. nach `mkWheelFrame`.

## Abnahme BM5 (Chromium, Playwright, CDP-Touch; Skripte `tests/`)

| ID | Ergebnis |
|---|---|
| BM5-01 M-SKIZZE | ✓ Anordnung quer: Reihen, Reihenfolge, Gruppen, Anzeige zwischen Global und Param, Value zwischen General und Compare, Vol links, Masken-Übersicht rechts; hoch: Faltung §3.2. IoU je Zone ≥ 0,95 gegen `tests/bm-skizze.json` (feste Referenz aus §3.1/§3.2, Raster an die gemessenen Außenzonen angepasst). **Offen:** Vergleich mit der Handbuch-Zeichnung selbst (private Seitenbilder `S/mask1-render/` nicht in dieser Sitzung) – beim Merge durch den Dirigenten |
| BM5-02 M-PLATZ | ✓ 428×926, 926×428 (+ Safe-Area), 390×844, 375×667, 320×568, 844×390 (+ Safe-Area), 667×375: 23 Tasten, 2 Drehgeber, 2 Räder ≥ 44 × 44 (elementFromPoint), keine Überlappung, nichts außerhalb des Rahmens, Beschriftungen überlappen weder sich noch Tasten, kein Scrollen, kein Layout-Sprung über 14 Modus-/Seq-Env-/Layer-/Split-/Init-Wechsel, layout-shift im Bedienfeld 0; Drehen hoch → quer → hoch = gleiche Lage |
| BM5-03 Bedienlogik | ✓ alle Parameterfolgen §3.3, « Param » und erneutes Tippen, Ein-Parameter-Modi, Laufschrift (STAR → TART → Wert), Masken „007“ (`bm5-ui.mjs`) |
| BM5-04 Seq/Env | ✓ » = ▶/■, « = ●, Osc1–Filter = L A D S R LOOP, LEDs; aus = Octave ±1 |
| BM5-05 Mehrfach | ✓ Osc1+Osc2 (Env aus), Noise+Filter (Env an): beide leuchten, beide geändert, ein Undo, Einzel-Tipp beendet |
| BM5-06 Abläufe | ✓ Voice P00/U00, Layer (B wählen, SEMI…TUNE, Edit wirkt auf B, Voice einmal/zweimal, Blinken), Split + Splitpunkt (ein Undo), Init 2OSC/zweimal Säge, Write U00 → „DONE“, Global, Compare an/aus/Voice beendet |
| BM5-07 Value | ✓ 80 px langsam = 10 Schritte, schnell beschleunigt (≤ × 8), Fein 32 px = 1 Schritt, kreisend, Doppeltipp = INIT, ein Undo je Geste; Vol = Spurpegel (`fx.vol`) |
| BM5-08 Druck | ✓ 6/36/66 px → 0 / 0,5 / 1 (AT CURVE 4), Kurven 1, 2, 5, 6, NONE nach Formel, Höchstwert, waagrecht > 20 px = alte Bedienung, Loslassen 0, Balken sichtbar |
| BM5-09 LCD/Undo | ✓ LCD-Zeile je Parameter, „geändert“-Punkt sofort, je Geste ein Undo |
| BM5-10 Leistung | ✓ (Test-Browser) Öffnen ohne Long-Task (Block 3–5 ms), Anzeige in Ruhe 0 Änderungen in 1,5 s, 60 Bilder/s mit offenem Feld. iPhone am Gerät offen |
| BM5-11 Marke | ✓ DOM, CSS, Datei-Zusätze: kein Hersteller-/Gerätename, „MS 2000“ genau 1×, `BM_NAME` nie vor Ziffer; Kopie mit anderem `BM_NAME` → alle Anzeigen folgen (`bm5-regel.mjs`) |
| BM5-12 Bilder | ✓ `bm5-shots/`: alle Formate je Voice, Osc1, Env, Mod, Global (45 Bilder) |
| Unabhängige Prüfung | eigener Prüf-Agent ohne Builder-Kontext: 16 Befunde. Behoben: Compare wechselte bei VA-Ursprung die Engine (hoch); dreimal Write sicherte nicht (hoch); Änderungen im Compare gingen still verloren; Skizzen-Prüfung war zirkulär (jetzt feste Referenz `tests/bm-skizze.json` aus §3.1/§3.2, IoU je Zone ≥ 0,95); lange Werte nicht unterscheidbar; Undo-Text „Bit Mask 1BAL“ (Name vor Ziffer); SPD-Klartext ≥ 37 falsch; `getParam(engine)` = va; Halte-Gesten blätterten weiter; Octave-LEDs und stiller Wechsel TRANSP.→SPIELEN; Compare endete mit jeder Modus-Taste; Hinweistexte in der LCD-Zeile; Vol-Doppeltipp; Neuanschlag mit fester Stärke 0,8. Offen (Info): P3 hat keine LCD-Zeile (App-Regel, bestehend); L2 Lücken 1 px statt 2 px (rechnerisch kein Platz); Noten während das Modul lädt gehen verloren (Pufferung = BM6) |
| Regel 28 | ✓ gegen 4.23.0: alle Werksklänge normalisieren gleich, neues Projekt gleich, VA- und MS-2000-Render bitgleich, keine zusätzlichen Netz-Aufrufe |

**Größe:** +72 054 B gegen 4.23.0. Davon Block `sq-bm-src` 59 981 B (nur bei Bedarf; Budget +40 KB → ×1,5, Grund: Klartext der LCD-Zeile
für alle Parameter, Tabellen, CSS, Räder, Druck), Platzhalter-Prozessor 3 997 B und `SQBM` ≈ 2 KB (fallen beim Merge weg), Hauptteil ≈ 6 KB.

## Fragen an Xander (Annahmen, die die Spec offen lässt – so gebaut, leicht änderbar)
1. Reiter des Editors: **[GERÄT] [FX]** (FX = bisherige FX-Seite der App). Recht so?
2. Kurznamen der Mod-Ziele in der 4-stelligen Anzeige: FREQ VOL FILT/FLT MASK PAN 1FRQ 1VOL 1MSK 2FRQ 2VOL 2MSK NFRQ NVOL 1TYP 2TYP 1BAL 2BAL L1A L1S L2A L2S FEG PEG ATK (Klartext in der LCD-Zeile).
3. Reihenfolge der Ziel-Plätze 2–4: Mod je Quelle direkt hinter ihrem Platz 1 (V-DEST V-AMT V-DEST2 V-AMT2 … M-DEST …), LFO hinter DCAY (DEST2 AMT2 …).
4. Mehrfach-Bearbeitung setzt in allen leuchtenden Tasten **denselben Wert** (nicht denselben Abstand). Erlaubt: Env an = beliebige von Osc1/Osc2/Noise/Filter; Env aus = Osc1 + Osc2.
5. Octave: Mitte = Tastatur-Oktave 4 wie beim MS 2000 (Spur 1 steht ab Werk auf −2), ±2; « leuchtet unter, » über der Mitte.
6. Bereiche Layer/Split (nicht in der Spec): SEMI ±24, BAL 0–100, PAN ±99, TUNE ±50 ct. VEL CURVE als 1–6 (6 = MAX), AT CURVE 1–6 und 0 = NONE gespeichert (für BM6 `normBm`).
7. Layer/Split ohne gewählten Klang B zeigt „----“; bis Value einen Klang wählt, wirken Änderungen auf A.
8. Write: das Namensfeld liegt im Bedienfeld über den unteren Tasten (Write-Taste bleibt frei); jede andere Taste bricht ab.
13. Kurzformen langer Werte in der Anzeige: PRTG, MPRT, MRTG, PSLR, NTCH.
14. Octave ±2 um die Mitte 4 (App erlaubt 1–7): außerhalb von 2…6 tut die Taste nichts.
9. Compare ohne gespeicherten Bit-Mask-Stand: „COMP“ kurz, LCD „kein gespeicherter Stand zum Vergleichen“.
10. Value: × 1 unter 0,25 px/ms, × 8 ab ≈ 1,25 px/ms; Fein ab 40 px seitlich; kreisend ab 60° um die Mitte.
11. Räder-Beschriftung BEND / MOD, MOD startet bei 0. Druck-Balken an der Fingerstelle.
12. Farben: weiß lackiertes Blech, schwarze Schrift, warmweiß leuchtende Tastenflächen, rote Segmente – Fotos würden helfen.

## Bitte prüfen (Xander, am iPhone 12 Pro Max)
1. Bit-Mask-Spur wählen (Engine-Knopf „Bit Mask“), Editor öffnen: quer das ganze Feld in zwei Reihen, hoch gefaltet – sieht es aus wie das Gerät?
2. Osc1 tippen → Anzeige „MASK“, dann „007“; Value drehen (langsam/schnell, kreisend), Doppeltipp = 007.
3. Osc1 halten + Osc2 tippen → beide leuchten, Value ändert beide Masken.
4. Seq/Env an → Osc1 zeigt L A D S R LOOP; « = Aufnahme, » = Start/Stopp.
5. Layer → Value wählt P00, « Param » → SEMI…; Voice einmal (Layer blinkt), zweimal (aus).
6. Split halten + Taste auf der Tastatur = Splitpunkt (LCD zeigt die Note).
7. Init → 1OSC/2OSC/VEL/RAND mit Value, Init bestätigt; Write → U00, Write → Name tippen, Write → „DONE“.
8. Taste halten und Finger nach oben schieben → oranger Balken (Druck), seitlich weg → normales Gleiten.
9. BEND- und MOD-Rad links der Tasten.
10. Klang ist nur ein Platzhalter (Sinus = Maske 31) – der echte Klang kommt mit BM1–BM4.
