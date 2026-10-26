# CHANGES – MS 2000, Paket MK-P (Zweig-Kopie `mk-br-MKP`)

## MK-P — Bedienfeld wie der MS2000: Platte, Gesamtansicht, Zoom-Halte, Lauflicht · App **4.16.0** (`APP_CODE` 4 016 000) · Format bleibt 5

**Vorgänger-Stand** für alle „bitgleich / unverändert“-Abnahmen und das Budget: **4.15.0** (MK0–MK7 zusammengeführt,
3 017 704 B, Kopie `dirigent-test/v3-mkp-vorg.html`). Gebaut nach Nachtrag 3 Rev. 3 („reiner MS 2000“, kein microKORG-
Bedienfeld, keine RADIAS-Teile), Teil MK-P, B.3, B.6, B.7, EN3-05/13/14/20, H-16/H-17/H-18 (Vorgaben gebaut, nicht gewartet).
MK8 entsteht parallel in `mk-br-MK8`; der Orchestrator führt zusammen und setzt die VERSION-Zeile. Kein Supabase-Aufruf
(nicht nötig: Format 5, App 4 016 000 ≤ `max_app` 4 021 000). Nichts committet.

Dieser Lauf hat einen unterbrochenen Bau-Versuch übernommen (Platte, Ansichten, Gesten und Tests standen, Abnahme,
Changelog und Snapshot fehlten), ihn geprüft, die Befunde unten behoben und die ganze Abnahme neu gefahren.

### Gebaut

1. **Die Platte** (`sq-mk-src`, Abschnitt „MK-P“): Vorderseite nach HB-MS S. 5 als Daten (Lage-Tabelle `SEC`, `EL_`, `HALTE`
   in % der Platte, Seitenverhältnis 1,95 : 1, 16-Spalten-Raster xₙ = 14,1 + (n − 1)·5,52), gebaut als DOM + CSS + **ein**
   SVG für die gedruckten Linien und **ein** gemeinsames Skalen-Symbol (`<use>`), ohne Bild-Daten, ohne `@font-face`, ohne
   WebGL (EN3-13). Hell blau-silbernes gebürstetes Metall (nur Verläufe), dunkler Druck, inverse weiße Vocoder-Namen auf
   Schwarz genau an den Tabellenstellen, schwarze Kappen mit weißem Zeiger, Mittelmarke nur an EG 1 INT / KBD TRACK /
   SEMITONE / TUNE / PAN, AUDIO IN 1 ohne Skala, VOLUME 0…10, hellgraue Tasten mit LED-Fenster, runde rote LEDs (OCTAVE
   grün/rot/rot blinkend), Anzeige 2 × 16 dunkel auf gelbgrün aus `--mkp-lcd-fg/-bg`. Namensfeld = nur `MK_LABEL`.
   Englischer Aufdruck wie am Gerät (H-16), VOX WAVE → STIMMWELLE, DWGS → SPEICHERWELLE.
2. **Bindung aller Elemente** (Synth-Spalte und Vocoder-Spalte, „grau“ mit Grund in der LCD-Zeile), 16 Regler mit
   SEQ EDIT (Regler n = Schritt n der gewählten Sequenz, Kappen zeigen Schrittwerte, ORIGINAL VALUE am gespeicherten
   Schrittwert) und CH PARAM (Kanal-Pegel/-Pan im Vocoder), MOD/DELAY für Regler 11/12, PATCH SELECT/SOURCE/DESTINATION,
   TIMBRE SELECT nur T1 ↔ T2 (Single gesperrt mit Grund), KBD TRACK │ E.F.SENSE 127 = HOLD.
3. **Anzeige mit Modi** SPIEL („A01:Name“/„---:Name“, Modus, ♩=Tempo, beim Drehen 1 s Name + Geräte-Wert), **EDIT**
   (Seitenplan 01–26 Synth bzw. 01–20 Vocoder, Schritt-Taste n = Seite, PAGE −/+, CURSOR, −/NO +/YES je eine Stufe mit
   Klemmen, Seiten-Sprung, Tipp auf die Anzeige = Liste bzw. Zusatz-Ansicht ▸), **GLOBAL** (1A/1B Eingänge, 1C Oktave,
   1D Seiten-Sprung), **COMPARE** (EDIT halten + EXIT), UTILITY-Werkzeuge (ersetzen die SHIFT-Werkzeuge).
4. **Fester Rahmen** (`.mkfr`, `contain: strict`, `overflow: hidden`): Gesamtansicht (quer ganze Platte, hochkant Hälften),
   13 Halte im Signalfluss, Tipp-Zoom 250 ms (nur `transform`, `prefers-reduced-motion` ohne Animation), ◀ ▶, Wischen mit
   Federn an den Enden, Karte (Canvas 2D einmal je Format, Rechteck per `transform`; Tipp = Gesamtansicht, hochkant
   Kartenhälfte = Hälfte). Treffer = nächstes aktives Element über ein beim Aufbau gerechnetes Raster (Radius 1,8 %),
   `setPointerCapture`, zweiter Finger auf demselben Element ignoriert, Fein ×¼ / ×1⁄16 / ruhender zweiter Finger.
   Quer: das Blatt über den ganzen Bildschirm mit **einer 44-px-Kopfzeile** (✕ ↶ ↷ ▶/■ ‹ Name › Reiter ◀ Karte ▶ ⋯; H-17).
5. **Lauflicht** auf SELECT 1–16 aus dem Worklet-Takt (Scope mit Rest-Zeit und Folgeschritt), um die Ausgabe-Latenz
   versetzt, im rAF, nur Klassenwechsel; dasselbe in der Spiel-Ansicht (Hälften-Zeiger mit Punkt für die andere Hälfte).
6. **Spiel-Ansicht** (Reiter SPIEL): Band 1/Band 2 nach Rahmenbreite, Schritt-Tasten 16 / 8 / 2 × 8 / 2 × 4, Aufdruck nur
   der Zeile des Modus, Räder PITCH/MOD im Metallton; quer Tastatur und Räder im Rahmen.
7. **E1/E2-Pegel** (AUDIO IN 1/2) als Live-Wert `R.mkInTrim[uid]` (0 = stumm, 100 = 0 dB, 127 = +6 dB), je ein GainNode vor
   dem Worklet-Eingang (`mkInLink`, `mkTrimF`, `mkInTrimApply`), nicht gespeichert, kein Undo, bei 100 Faktor genau 1.
8. **Abbau** des alten Bedienfelds aus MK1–MK7 (Drehschalter, 7-Segment, Matrix, Holzwangen, Halb-Ansicht/`mkHalfWanted`,
   Zonen, Nummerntasten, SHIFT-Ebenen-Oberfläche, Edit-Sync-/Solo-/Step-Arp-Bedienwege nach H-18; die Engine-Funktionen
   bleiben). Hilfe-Zeilen neu geschrieben (19 MS-2000-Zeilen, eigene Sätze, Name aus `MK_LABEL`).
9. **Test-API** `mkPanel()` (Elemente mit Rechteck in %, Bild-Rechteck, Trefferzone, `bind`, Wert, LED; Halte, Sektionen,
   Modus/Seite/Cursor/LCD, Lauflicht, Spiel-Ansicht) und `mkView(o)` (`MKUI.view`), Leistungs-Probe Fall **„Bedienfeld“**.
10. **Naht zu MK8 (Teil G Nr. 18)**: eine Dispatch-Funktion `mkPanelProg(action, arg)` für BANK ▼ ▲, SELECT 1–16 (SPIEL),
    −/NO +/YES (SPIEL), WRITE, WERKSKLANG ZURÜCK, LCD-Zeile 1 und die Programm-LED. Sie nimmt **beide** Formen:
    `window.mkProg` als Funktion oder als das **Objekt von MK8** (`select(bank, slot)`, `step(dir)`, `bank(dir)`,
    `restore(bank, slot)`, `current()`; so in CHANGES-MK-MK8 beschrieben). Ohne `mkProg` gilt der alte Weg (eigene Sounds der
    Engine je Bank à 16, ‹ › bzw. `stepSound`, Sichern). Geprüft mit einem MK8-Attrappen-Objekt (`v3-mkp-prog.mjs`).
    Beim Zusammenführen ist damit nichts mehr zu verdrahten; nur die MK8-Wahl-Tests (‹ ›) auf die Platte umstellen.

### In diesem Lauf behoben (Prüfung des übernommenen Stands, Fach-Prüfung)

| # | Blick | Befund | Behebung |
|---|---|---|---|
| 1 | FP-TOUCH | Die AUDIO-IN-LEDs leuchteten nie: `paintEin` las `P.el.led` (gibt es nicht), die LEDs liegen in `PL.ui.led` | über `setLed('ain.l.k', on/red)`; an ab −50 dBFS, rot ab −1 dBFS (MK7-13-LED-Test über die Platte grün) |
| 2 | FP-IPHONE | Reiter GERÄT ↔ SPIEL baute das ganze Blatt neu (Long-Task, die Platte mit ≈ 1000 Knoten neu eingehängt) | `MKUI.tabFast`: nur der Inhalt des festen Rahmens wechselt; die Platte bleibt gelegt und wird per `transform` aus dem Rahmen geschoben, die Spiel-Leiste bleibt gebaut und wird nur gezeigt/versteckt. FX und alle anderen Wege bauen wie bisher neu |
| 3 | FP-IPHONE | `spielSteps` las `clientWidth` je Taste nach einem Schreiben (16 erzwungene Layouts) | eine Messung für alle Tasten (gleich breite Spalten), danach nur Schreiben |
| 4 | FP-IPHONE | Die Platte wurde mit einem Häppchen je Bild gebaut (fertig erst nach ≥ 20 Bildern) | ein Task je Häppchen ≤ 6 ms (`setTimeout`), Scheduler-Tick davor (EN3-14): fertig nach 74–107 ms (×1) |
| 5 | FP-IPHONE | `render()` fragte die Programm-LED 16 × je Bild ab (`ownList()` = Bibliothek filtern + sortieren) | einmal je Zeichnen (`litOf`) |
| 6 | FP-IPHONE | `wiaPaint` baute je Bild `SQMK.init()` neu, auch ohne ◎ | nur bei ◎ (und einmal beim Ausschalten) |
| 7 | FP-IPHONE | Platte und Anzeige ohne Eingrenzung (jede Textänderung prüfte das Layout der Platte) | `.mkplate`/Anzeige `contain: strict`, Regler `contain: size layout style` (Spec „Leistung“) |
| 8 | FP-TOUCH | Kappen L* bis 16,5 am Glanzpunkt (Grenze 15) | dunklerer Verlauf (`#2f3236 → #111214 → #050506`): L* ≤ 11,1 |
| 9 | FP-SICHER | Der Bildvergleich (liest die Handbuch-Zeichnung) lag in `dirigent-test/`, das `wip-push.sh` ins öffentliche Repo kopiert | verschoben nach `scratchpad/mkp-tools/mkp-bildvergleich.mjs` (privat, E.5 Nr. 5); Überlagerungsbild bleibt in `scratchpad/ms2000-panel/` |
| 10 | MK8-Naht | `mkPanelProg` erwartete `window.mkProg` als Funktion, MK8 liefert ein Objekt | beide Formen (Punkt 10 oben) |
| 11 | Test | Lauflicht-Test verglich mit einer eigenen, späteren Uhr-Ablesung (1-Bild-Versatz an Schrittgrenzen, 97,9–98,5 %) | die App legt die Audio-Zeit ihres Bildes ab (`P.runTA`), der Test vergleicht damit und meldet den Uhr-Abstand (≤ 11,6 ms < 1 Bild) und „über 1 Bild daneben“ (0) |

Fach-Prüfung: **FP-TOUCH ●** (Haupt-), **FP-IPHONE**, **FP-SICHER** (Zweit-Blick) selbst gefahren, 11 Befunde, alle behoben
bzw. (Größe, ×4-Leistung) unten begründet. Ein eigener Agent ohne Builder-Kontext hat nicht geprüft (J.1 Nr. 2) — das ist
offen für den Orchestrator.

### Abnahme MK-P-01 … MK-P-15 (Chromium 1243, Playwright, CDP-Touch; Skripte `dirigent-test/v3-mkp-*.mjs`)

| ID | Ergebnis |
|---|---|
| MK-P-01 Vorlage | ✓ 205 Prüfungen (`v3-mkp-funk.mjs`): jede ID da, größte Mitten-Abweichung 0,003 %, Paare/Viererreihen 4,30 (RANGE→TYPE 4,40 = Tabellenwert 69,4/73,8), 16-Spalten-Regel ± 0,3, IoU ≥ 0,9, 1,95 ± 0,01, Reihenfolge je Zeile, reine Skalierung (≤ 0,02 px) |
| MK-P-02 Bildvergleich | ✓ privat (`scratchpad/mkp-tools/mkp-bildvergleich.mjs`): alle 21 Sektionsrahmen je Kante ≤ 0,8 % / 1,2 % (größte 0,42 %), kein fehlender/zusätzlicher Rahmen; Überlagerung `scratchpad/ms2000-panel/mkp-overlay.png` (nur Scratchpad) |
| MK-P-03 Jedes Element wirkt | ✓ 297 Prüfungen: CDP-Geste je gebundenem Element im Halt und quer in der Gesamtansicht, Wert ändert sich, ein Undo, Undo deep-equal, Klangwerte hörbar (Spektral-Differenz; ARP GATE ohne laufenden Arp = −240 dB, nach B.6 Nr. 3 ausgenommen). E1/E2 64 → 127: **+20,6 dB** am Worklet-Eingang (`v3-mkp-trim.mjs`), 0 = stumm, 100 = Faktor 1. Ausnahmen: BANK/Programm-Tasten ohne MK8 (alter Weg), COMPARE nur mit geändertem Sound |
| MK-P-04 Vocoder | ✓ 20: inverse Namen = `voc.*`-Pfad, graue Elemente 0 dB Unterschied + Grund, CH PARAM Regler n = Band n, E.F.SENSE 127 = HOLD |
| MK-P-05 Seiten | ✓ 43: jeder `normMk`-Pfad erreichbar (123; `arp.tempo` nur gespeichert, EN3-10), Tasten 1–16 Synth/Vocoder = Seitenplan, PAGE, CURSOR klemmt, ±1, Seiten-Sprung, Anzeige-Tipp, EXIT, WRITE, COMPARE, UTILITY (= alte SHIFT-Werkzeuge), GLOBAL 1A/1B (MK7-Eingangs-Tests über GLOBAL 1B **24/24**, `v3-mkp-mk7inputs.mjs`), 1C ändert `tr.kbOct` |
| MK-P-06 Marke | ✓ Datei: microKORG/RADIAS/DWGS 0, „MS 2000“ genau 1 (`v3-mk2-marke.mjs` alles PASS); Bedienfeld-Text „MS 2000“ genau 1 (Namensfeld aus `MK_LABEL`), kein `<img>`/`data:image`/`@font-face`, Namensfeld App-Schrift 600, normal, unverzerrt |
| MK-P-07 Treffer und Platz | ✓ (`v3-mkp-platz.mjs`) P1, P2, P3, L1, L2, W, 428 × 926, 926 × 428: alle Zustände ohne Abschneiden, keine waagrechte Seite; z = Regel; Treffer-Prüfpunkte alle 4 px = nächstes Element (Abweichung ≤ 5 von 21 836 Punkten, Rundung der px-Rechtecke auf 0,01 an der 1,8-%-Grenze); quer 926 × 428 Regler-Zonen **41 px**, Tastenpaare **30 px**; außerhalb der Platte ≥ 44 × 44 |
| MK-P-08 Gesten | ✓ (`v3-mkp-gesten.mjs`): senkrecht = Wert, Fein ×¼ ab 64 px / ×1⁄16 ab 140 px / ruhender Finger, Doppeltipp = Standard im Halt, Tipp-Zoom auf Regler/Titel/Fläche, Taste schaltet ohne Zoom, ◀ ▶ und Wischen genau ein Halt, Federn an den Enden, Wischen ab Regler verschiebt nie, > 8 px verwirft den Tipp, Zoom bleibt bei 12 Wechseln (EDIT, GLOBAL, EXIT, SEQ EDIT, Vocoder, Synth, Reiter ×3, Programm, zu/auf, Spurwechsel) und beim Drehen, Karte → Gesamtansicht, zwei Regler = zwei Undos |
| MK-P-09 Leistung | **teilweise** – siehe „Leistung“ unten (×1 alles grün; Referenz ×4 im Test-Container nicht erreicht) |
| MK-P-10 Daten | ✓ (`v3-mkp-daten.mjs` gegen 4.15.0): 12 Klänge (INIT, 6 × Zufall, Arp+Seq, Dual, Split, Vocoder mit Eingang, FX) **bitgleich** (max \|Δ\| 0); `normalizeSound`, `normMk`, `normSynthP`, `normMkIn`, `PROJECT_FORMAT` 5, `SOUNDS_FORMAT` 2 im Quelltext gleich; 95 Werte über Platte + Seiten = `mkSet` im Vorgänger deep-equal; Projekt des Vorgängers lädt deep-equal; Ansichtswechsel: `soundHash` gleich, 0 Autosave; E1/E2 nicht gespeichert |
| MK-P-11 Aussehen | ✓ (`v3-mkp-aussehen.mjs`, Pixel): Platte H 208°, S 26 %, L 78–79 %, Bürstung 2,25 %; Druck L 16,7 %, Kontrast 8,7 : 1; 60 inverse Felder (= Tabelle: 52 Elemente + CH PARAM, HOLD, +1/+2/−1/−2, LEVEL, PAN) 19,2 : 1; Kappen L* ≤ 11,1, Zeiger weiß; Tasten L 82–83 %; LEDs rund, an 12°, OCTAVE grün; Anzeige Grund 78°/58 %, Zeichen 14 %, 7,8 : 1, 2 × 16 ohne Umbruch, Farben nur aus den Variablen; keine Holzwangen |
| MK-P-12 Abbau | ✓ kein Knoten/Quelltext des alten Bedienfelds (Klassennamen), Hilfe-Zeilen vollständig; **Budget überschritten** (unten); umgestellte Tests: Tabelle unten |
| MK-P-13 Fester Rahmen | ✓ in allen Formaten über 32 Zustandswechsel (Halte 1–13, Karte, Hälften, Reiter GERÄT/SPIEL/FX, EDIT, GLOBAL, COMPARE an/aus, SEQ EDIT, Vocoder, Programm, SCHRITTE/EIGENE/16 BÄNDER, Lauflicht an/aus, Spur 2 ↔ 1): Rahmen- und Blatt-Rechteck ± 0 px, `scrollHeight`/`scrollWidth` gleich, **0 `layout-shift`**, nichts außerhalb des Rahmens, hochkant Tastatur/Räder 0 px |
| MK-P-14 Lauflicht / SEQ EDIT | ✓ (`v3-mkp-lauf.mjs`, 3 Läufe): vorwärts 1 → 16, LAST STEP 8, Rückwärts, Alt 1, Alt 2, REC bereit, KEY SYNC Stimme, Dual T2, Spiel-Ansicht: je **100 %** der Bilder gleich dem Worklet-Schritt zur Audio-Zeit des Bildes, 0 Bilder über 1 Bild daneben, nie zwei LEDs; SEQ EDIT Regler n = Schritt n in der Gesamtansicht und den Halten 6, 7, 8, 10, 11, 12, ein Undo je Geste, ORIGINAL VALUE am Schrittwert, LCD „SEQ1 S05 +21“; `soundHash` und Zoom unverändert |
| MK-P-15 Rein MS 2000 | ✓ TIMBRE SELECT nur T1 ↔ T2 (Single gesperrt), kein Edit Sync/Solo/Step-Arp auf Platte und Seiten, Seitenplan/Tasten/Aufdruck = Tabellen, keine alten Bezeichnungen (EDIT-WAHL, SHIFT als Wort, SEITE, Matrix, Nummerntaste) in DOM, Hilfe, LCD; Klänge mit `arp.last/steps` bitgleich (MK-P-10) |

Zusätzlich: TEMPO-LED blinkt in Vierteln (120 BPM: Abstand 500 ± 1 ms), Leistungs-Probe „Bedienfeld“ läuft
(`v3-mkp-extra.mjs`); Reiter-Schnellweg behält Zoom, Platten-DOM und Rahmen; quer SPIEL-Tastatur endet auf jedem Weg
(✕, andere Spur, GERÄT, FX; `v3-mkp-close.mjs`); Räder quer im Reiter SPIEL (MK1-33 P1/L1 alle grün, `v3-mkp-mk1ui.mjs`).
Rauchtest ohne Fehler (`dirigent-test/v3-mkp-smoke.png`).

### Leistung (MK-P-09)

Chromium im Test-Container (4 Kerne, SwiftShader), Projekt mit 4 Spuren, 2 MS-2000-Spuren mit Arp und Seq, Skript-Sitzung
10 s (`panelScript`: 4 Regler, Tipp-Zoom, 13 Halte, Karte, 6 EDIT-Seiten, EXIT, Spiel-Ansicht), `v3-mkp-perf.mjs`:

| | ×1 P1 / L1 | ×4, DPR 3 P1 / L1 | Vorgänger 4.15.0 ×4 (nur Abspielen, Editor offen) |
|---|---|---|---|
| (a) Aufbau: Häppchen max / Arbeit / fertig | 6,7 / 19,9 / **107 ms** · 6,3 / 23,3 / **74 ms**, kein longtask | 10 / 75 / 500 ms · 8,4 / 83 / 529 ms | – (das Öffnen des Blatts selbst ist ein Long-Task von ≈ 305 ms ×4, im Vorgänger ≈ 322 ms) |
| (b) rAF p95 / > 50 ms | 16,8 ms / 0 · 16,8 ms / 0 | 33,4 / 4 · 49,9 / 11 | 16,8 / 1 · 16,8 / 0 |
| (f) Scheduler-Abstand max / > 50 ms | 31,6 / 0 · 33,5 / 0 | 79 / 31 · 125 / 45 | 73 / 4 · 53 / 2 |
| Noten gegen das Raster | 0 ms (beide) | 0 ms (beide) | 0 ms |
| (e) Layer | 1 eigener (Karten-Rechteck 0,7–1,3 MB), keiner für die Platte außerhalb von Übergängen | gleich | – |

- ×1: alle Grenzen eingehalten, auch (a) „fertig ≤ 150 ms“ und „kein Scheduler-Abstand > 50 ms“ (der Vorgänger hatte im
  selben Lauf ohne Sitzung 2 Abstände > 50 ms).
- ×4: **nicht erreicht.** Der Vergleich mit dem Vorgänger ist nicht gleich (dort keine Sitzung möglich). Gleiche Last in beiden
  Ständen (`v3-mkp-phase.mjs`, je 3 s): Ruhe mit offenem Bedienfeld neu 0–1 / alt 0 Abstände > 50 ms; **Regler drehen**
  (derselbe Weg `mkSetP` → `soundEdited` → `soundHash` je Bild) neu rAF p95 33,3, 4–6 Abstände, alt rAF p95 33,3, 3–8 — gleich
  teuer. Zoom/Halte/Seiten/Spiel-Ansicht ×4 nach den Behebungen 0–2 Abstände > 50 ms je 3 s. Größter Einzelposten in der
  Sitzung ist das Neuzeichnen beim Drehen (Hash des ganzen Sounds je Bild im Hauptstrang-Code, siehe „Für den Hauptstrang“).
- Der Trace-Zähler (b „Hauptfaden-Arbeit je Bild“) liefert im Container nur 11–24 Bilder je 10 s (Trace-Ereignisse fehlen) und
  ist deshalb nicht aussagekräftig; gewertet sind rAF-Abstände, Long-Tasks und Scheduler-Abstände.
- (c) 0 Layouts während Gleiten/Wischen; beim Drehen ≤ 1 Layout je Bild (LCD-Zeile des Blatts, `lcdFit`). (d) 0 `layout-shift`.
- (g) iPhone: **am Gerät offen** — Leistungs-Probe Fall „Bedienfeld“ (Menü → Info) über dem Fall „Kern“; im Test-Browser
  frames_ok wackelt bei „Kern“ und „Bedienfeld“ gleich (je 1 von 3), wie schon in MK7 beschrieben.

### Formate (gemessen, Test-Browser ohne Safe-Area; z der Gesamtansicht · Halte)

| Format | Rahmen | z ganz | Halte z | kleinste Zone (ganz) |
|---|---|---|---|---|
| P1 390 × 844 | 372 × 386 | 669 (Hälfte) | 669–1320 | 27 px (Hälfte rechts), 33 px links |
| P2 375 × 667 | 357 × 265 | 517 (Hälfte) | 642–1320 | 8 px (am Rahmenrand angeschnittenes Element; Treffer = Zoom) |
| P3 320 × 568 | 302 × 233 | 454 (Hälfte) | 543–1245 | 16 px |
| L1 844 × 390 | 842 × 344 | 671 (ganz) | 1009–1320 | 26–27 px, Regler 37 px, Paare 27 px |
| L2 667 × 375 | 665 × 329 | 642 (ganz) | 965–1320 | 26 px, Regler 35 px |
| W 844 × 1180 | 826 × 722 | 826 (ganz) | 1320 | 33 px, Regler 45 px |
| 926 × 428 | 924 × 382 | 745 (ganz) | 1120–1320 | 30 px, **Regler 41 px, Paare 30 px** |
| 428 × 926 | 410 × 468 | 737 (Hälfte) | 737–1320 | 30–37 px |

Safe-Area-Durchgang (`SAFE=47,0` und `SAFE=47,21`, 926 × 428 und L1, alle Zustände, 0 Befunde): 926 × 428 mit
Notch und Home-Balken → Rahmen **830 × 361, z 704** (Spec ≈ 832 × 363, z 707); L1 → 748 × 323, z 630.

### Größe (MK-P-12)

3 058 080 B = **+40 376 B** gegen 4.15.0 (Budget +28 KB = 28 672 B, **×1,40**; die Spec erwartet unter „Risiken“ +34 bis
+42 KB). `sq-mk-src` +39 336 B (neue Platte, Lage-Tabelle, Seitenplan, Ansichten, Gesten, Spiel-Ansicht; alter Teil
entfernt), Worklet +233 B (nur `sqInfo` meldet Rest-Zeit und Folgeschritt für das Lauflicht; Klang bitgleich), Hauptteil
≈ +700 B (E1/E2-Pegel, Reiter-Haken, Hilfe-Zeilen neu). Projekte ohne MS-2000-Spur laden nichts davon (EN3-14).
Entscheidung beim Orchestrator (5,0-MB-Grenze weit entfernt; SL1 ist geplant).

### Umgestellte Oberflächen-Tests aus MK1–MK7 (alter Weg → neuer Weg)

| Test (alt) | prüfte | neuer Weg / Abdeckung |
|---|---|---|
| `v3-mk1-look.mjs` (MK1-21, MK1-32 Skizze) | altes Bedienfeld gegen die alte Skizze | entfällt; M-VORLAGE `v3-mkp-funk.mjs` (MK-P-01), `mkp-bildvergleich` (MK-P-02), `v3-mkp-aussehen.mjs` (MK-P-11) |
| `v3-mk1-ui.mjs` MK1-20/21/22/31/34 | EDIT-WAHL, Regler 1–5, ◎ an Stellungen, LED/LCD | `v3-mkp-funk.mjs` (Bindung, ◎ über `wiaPaint` an Reglern und Seiten), `v3-mkp-gesten.mjs`; Programm lädt in SPIEL: `P.mode = 'spiel'` |
| `v3-mk1-ui.mjs` MK1-33 (Räder) | Räder quer im GERÄT-Reiter | quer liegen Räder und Tastatur im Reiter SPIEL (H-17): `v3-mkp-mk1ui.mjs` (Kopie, quer erst SPIEL) — P1 und L1 alle grün |
| `v3-mk2-ui.mjs` MK2-03-UI / MK2-10 | „≈“ und Fläche über EDIT-WAHL | LCD „≈“ über OSC 1 WAVE / CONTROL 2 (`lcdOf`), Fläche M-PLATZ `v3-mkp-platz.mjs` |
| `v3-mk3-ui.mjs` MK3-03/04/05/10/11/13 | Split ← nächste Note, TIMBRE-Taste T1→T2→beide, SHIFT-Werkzeuge, Fläche, Hilfe, Solo | Split ← nächste Note über Tipp auf die Anzeige (01 COMMON SPLIT); TIMBRE SELECT T1 ↔ T2 (MK-P-15); UTILITY-Werkzeuge (MK-P-05 „05-utility“); Edit Sync und Solo nicht auf dem Bedienfeld (H-18); Hilfe neu |
| `v3-mk4-ui.mjs` MK4-12-PLATZ/-BED | EDIT-WAHL 2 MOD-FX/DELAY/EQ | MOD/DELAY + Regler 11/12, Seiten 22–24 (MK-P-03/05); die übrigen 8 MK4-Prüfungen (mkRender, Puffer, Speichern, Probe „+FX“) bestehen unverändert |
| `v3-mk5-ui.mjs` MK5-17-PLATZ/-BED/-LED, Hilfe | ARP-Taste, ARP A/B, Nummerntasten als Schritte | ARPEGGIATOR ON/OFF, LATCH, RANGE, TYPE, TEMPO, GATE (MK-P-03), TEMPO-LED (`v3-mkp-extra.mjs`), Step-Arp-Schritte nach H-18 nicht auf dem Bedienfeld; Probe „+Arp“ besteht |
| `v3-mk6-ui.mjs` MK6-09/11/13 | SEQ-Stellung, SCHRITTE, AUFN., SHIFT + 5 | SEQ EDIT + 16 Regler (MK-P-14), SCHRITTE ▸ über Seite 19–21, REC-Taste, UTILITY SEQ-Werkzeuge (MK-P-05); die übrigen 5 MK6-Prüfungen bestehen |
| `v3-mk7-ui.mjs` MK7-13-PLATZ/MK7-BED | Vocoder-Stellungen, grüne Namen, SHIFT + 1/2, HALTEN-Taste | Vocoder-Spalte der Platte (MK-P-04), weiße Namen auf Schwarz, UTILITY Pegel/Pan zurück, E.F.SENSE 127 = HOLD |
| `v3-mk7-ui.mjs` MK7-13-LIVE, MK7-15 | Bandpegel, ECO | `v3-mkp-mk7ui.mjs` (Kopie; Vocoder über 01 COMMON MODUS statt SYNTH/VOC.): beide grün |
| `v3-mk7-inputs.mjs` MK7-10/13 | QUELLE 2 über EDIT-WAHL 1 + SHIFT, E1/E2-LEDs neben der Anzeige | `v3-mkp-mk7inputs.mjs` (Kopie; GLOBAL 1B + Tipp auf die Anzeige, AUDIO-IN-LEDs der Platte): **24/24** |

Die alten Skripte bleiben unverändert liegen (typische Fehler Nr. 26); ihre Fehlschläge auf 4.16.0 sind genau die oben
umgestellten Oberflächen-Teile (`MKUI.setWahl`/`toSpiel`/`knobs` gibt es nicht mehr).

### Regression (nicht Oberfläche, unverändert bestanden)

`v3-mk7-voc.mjs` 37/37 (gegen 4.15.0), `v3-mk6-seq.mjs` alle, `v3-mk3-timbre.mjs` alle, `v3-mk3-scale.mjs` alle,
`v3-mk2-marke.mjs` alle, `v3-mk1-probe.mjs` 7/7, `v3-mk4-ui.mjs` nicht-Oberfläche 8/8. Gleich auf 4.15.0 (nicht MK-P):
`v3-mk5-arp.mjs` MK5-02 „live zweimal“ (wackelt auch im Vorgänger), `v3-mk2-ui.mjs` MK2-08 Oktav-Welle 36–55 ms > 30 ms
(Vorgänger 38–40 ms), `v3-mk4-fx.mjs` FP-DSP-Denormale (Last-Zeitmessung in Node, Worklet-DSP unverändert),
`v3-mk1-format.mjs` 3 Prüfungen gegen 4.8.1 (überholt, wie in CHANGES-MK-MK8).

### Abweichungen von der Spec

- MK-P-09 (×4) und Budget: siehe oben.
- Trefferzonen am Rahmenrand: ein angeschnittenes Element hat eine kleine sichtbare Zone (P2 8 px); die Regel „nächstes
  Element“ gilt trotzdem, und der Zoom ist dort der Arbeitsweg (Spec „Risiken“).
- COMPARE schaltet über den vorhandenen A/B-Weg; ohne gespeicherten MS-2000-Stand bzw. ohne Änderung nennt die LCD den Grund.
- Ohne MK8 zeigen BANK/SELECT die eigenen Sounds der Engine in Gruppen à 16 (LCD „---:Name“); mit MK8 die Programme A01–H16.

### Für den Hauptstrang / Zusammenführen

- Berührt außerhalb von `sq-mk-src`: Worklet `sqInfo` (Felder `rem`, `nx`), `mkInRoute`/`mkInLink` (+ `mkTrimF`,
  `mkInTrimApply`), Entfernen von `mkHalfWanted`, `buildSynthEd` (Reiter GERÄT/SPIEL/FX, `MKUI.chrome`, Reiter-Haken
  `MKUI.tabFast`, `edHeadFit` nur hochkant), `fillSynthTab`, `closeEditor`/Spurwechsel (`mkq`, `mkqkb`), `lcdShow`
  (`_onShow`), LCD-Ziel quer (`.mkqh .preset`), Programm lädt in SPIEL, ⋯-Texte UTILITY, Hilfe-Zeilen, VERSION.
- **Vorschlag (Leistung, nicht in diesem Zweig geändert):** `mkSetP` setzt bei jeder Live-Geste `UI.dirty.edHead`;
  `edHeadRefresh` → `soundEdited` rechnet dann je Bild `soundHash` des ganzen Sounds (≈ 1,3 ms je Bild bei ×4, der größte
  JS-Posten beim Drehen, alt wie neu). Bei Live-Werten reicht ein Neuberechnen, solange der Punkt noch „unverändert“ zeigt.
- MK8: `window.mkProg`-Objekt wird direkt genutzt (Punkt 10); `v3-mk8-ui.mjs` Wahl-Tests auf die Platte umstellen.
- Defekte aus MK7 oder früher: keine neuen gefunden (die Wackel-Tests oben bestehen auch auf 4.15.0 nicht stabil).

### iPhone (Xander, 12 Pro Max) — wie in der Spec

1. MS-2000-Spur öffnen, quer halten: Ist das dein Gerät? Ohne Zoom CUTOFF drehen, ARP ON/OFF tippen.
2. Titel FILTER antippen → Zoom bleibt; ▶/Wischen bis VIRTUAL PATCH; Karte oben = ganze Platte. Springt etwas?
3. Hochkant: Hälften wechseln (Wischen/Karte), CUTOFF fein (seitlich wegziehen).
4. Reiter SPIEL: PITCH, MOD, Tastatur, OCTAVE, ARP, LATCH.
5. EDIT, SELECT 6 (FILTER): PAGE, CURSOR, −/+ und EXIT.
6. MOD SEQUENCE ON/OFF, eine Taste halten: laufen die SELECT-Tasten mit? SEQ EDIT SELECT: die 16 Regler setzen die Schritte.
7. Menü → Info → Leistungs-Probe „Bedienfeld“ schicken (FP-IPHONE, am Gerät offen).

Snapshot: `synq-snapshots/MK-P.html`.
