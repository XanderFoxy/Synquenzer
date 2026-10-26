## MK3 — Zwei Timbres, Split, Stimmung · App 4.11.0 (`APP_CODE` 4 011 000) · Format bleibt 5

**Vorgänger-Stand** für alle Gleichheits-Abnahmen: **4.10.0** (MK2 = `synq-snapshots/MK2.html`, 2 797 302 B).
Parallel-Bau im Zweig `mk-br-MK3` (Kopie von MK2). Geändert nur: AM-Zweig des Worklets (`/*MK{*/ … /*}MK*/`, W-43 in `MKW`),
Block `sq-mk-src` (Bedienfeld), `SQMK.normMk` (2 Zeilen: `usc`), AM-Helfer im Hauptfaden (`mkSetP`, `mkwFeed`, `mkWaveOf`, `mkRelSec`,
`mkRender` mit `o.solo`), drei Einhänge-Zeilen außerhalb (`inputDown` → Split ← nächste Note, LCD-Zeile → `UI.lcdX`/`UI.mkSplitTap`,
`closeEditor` → `MKUI.leave`), ⋯-Menü (3 Zeilen), Hilfe (3 Zeilen), `VERSION`.
**Neustart-Hinweis:** Ein erster Lauf wurde nach ≈ 25 min unterbrochen (Container); sein halbfertiger Stand (Worklet, Bedienfeld) wurde
nicht verworfen, sondern geprüft, vervollständigt und mit allen Abnahmen neu getestet.

### Gebaut
1. **Programm-Ebene im Worklet** (`MkCore` hält jetzt zwei `MkTim`): Single (nur T1, bitgleich zu 4.10.0), Dual (= Schicht: beide je
   Note), Split (Note < `split` → T1, sonst T2). Stimmen-Teilung nach `tv` 1+3 │ 2+2 │ 3+1; ein Timbre mit 1 Stimme spielt mono;
   **Mono-Regel**: ein Mono-Timbre belegt 1 Stimme, daneben Poly 3 bzw. Unison 2, beide Mono 1 + 1; Unison nutzt die Stimmen seines
   Timbres; Priorität/Rückgabe je Timbre (MK1). Begrenzer-Stufe 2: Dual/Split 1 + 1, Stufe 1: Unison ≤ 2 (nur neue Noten).
   Zufall je Note = hash(Seed, Timbre, Zähler dieses Timbres), globales S/H je Timbre eigener Zähler (B.4 Nr. 3) → Dual = Summe.
2. **Umschalten** von MODUS, STIMMEN, SPLIT und Zuweisung bei klingenden Noten: `engXf`-artig (alte Stimmen 40 ms als Geister
   mit cos-Blende, gehaltene Tasten unter der neuen Regel neu verteilt, gleiche Taste im gleichen Timbre erbt den Zustand, Einblendung
   sin über 40 ms bzw. den Attack).
3. **Stimmung (W-43)**: 10 Stimmungen + Grundton, je Note vor der Tonhöhe (gestimmte Tonhöhe `tp` ist Ziel, Portamento-Start und
   Keytrack-Grundlage KT); Eigene Stimmung `usc` (12 × −100…+100 ct, Bruchwerte während der Geste); Wechsel bei gehaltenen Noten
   stimmt die klingenden Stimmen um (ohne Klick). Tabelle genau einmal in `MKW.SCL` (der Hauptfaden liest dieselbe Quelle).
4. **Solo** (`{mkSolo}`, nicht gespeichert): nur das gewählte Timbre klingt, 5-ms-Rampen; ein stilles Timbre übernimmt die
   Solo-Verstärkung sofort (keine Rampe ins erste Anschlag-Stück).
5. **Bedienfeld** (B.3): STIMME Ebene 1 EINZELN/SCHICHT (Einzeln │ Schicht │ Split, Liste per Tipp), Ebene 2 STIMMEN (1+3 │ 2+2 │ 3+1)
   und SPLIT (C-1…G9; LCD „darunter T1, ab hier T2“); EDIT-WAHL 2 Stellung **STIMMUNG** (STIMMUNG, GRUNDTON; ◎-Punkt bei Abweichung).
   **TIMBRE-Taste** aktiv: Tipp T1 → T2 → beide → T1 (LEDs 10/01/11), bei EINZELN T2 gesperrt mit LCD-Hinweis; „beide“ = jede Geste
   ändert T1 und T2 um denselben Schritt (Anzeige und Startwert T1; Listen: gleicher Wert; ein Undo); **SHIFT + TIMBRE** = Solo
   (LED blinkt, Tipp beendet; Wechsel/Schließen des Editors beendet ebenfalls). Alle Sektionen bearbeiten das gewählte Timbre, die
   LCD-Zeile trägt „T1 ·“/„T2 ·“/„T1+2 ·“ (nur bei Schicht/Split). ORIGINAL-LED und ◎ kennen die Timbre- und Programm-Pfade.
6. **Werkzeuge** SHIFT + 1 Timbre kopieren ▸ (Liste: dieser Sound und alle gesicherten MS-2000-Sounds der Bibliothek, je [T1] [T2],
   Zeilen 44 px), SHIFT + 2 tauschen, SHIFT + 4 Timbre neu (das gewählte Timbre = INIT); je ein Undo; auch unter ⋯ im Blatt.
7. **[Split ← nächste Note]** in der LCD-Zeile (STIMME, Split): die ganze LCD-Zeile ist die Taste (wie FEST); auch ein Tipp auf den
   SPLIT-Regler (EB2) macht sie scharf; die nächste gespielte Note wird `split` (ein Undo), die Note klingt dabei.
8. **Zusatz-Ansicht EIGENE** (Tipp auf die Matrix-Zeile STIMMUNG bei „Eigene“, die Zeile trägt „EIGENE ▸“): 12 Regler (Stufe ab dem
   Grundton, Notenname als Aufschrift), [◂ GERÄT] 96 × 44; P1 2 × 6 à 60 (360 px), L1/W 12 × 56 + 3 px (705), L2 12 × 50 + 3 px (633),
   P2 2 × 6 à 57, P3 2 × 6 à 48.
9. **Haupt-Faden:** Speicherwelle von T2 wird bei Schicht/Split mitgeladen; `mkRelSec` nimmt das längere Timbre; `mkRender(…, {solo})`;
   Version 4.11.0; 3 Hilfe-Zeilen (Namen aus `MK_LABEL`).

### Fach-Prüfung (N3 Teil F: FP-DSP ● Haupt, FP-TOUCH Zweit; selbst vor der Abnahme, ohne zweiten Agenten)
- **FP-DSP** (`v3-mk3-fpdsp.mjs`, `v3-mk3-timbre.mjs`, `v3-mk3-scale.mjs`): W-43 eine Quelle (`MKW.SCL`), unabhängig im Test aus der Spec
  abgeschrieben und gegengeprüft; „Aus = bitgleich“: Single 33 Fälle, VA, Gleichstufig mit 4 Grundtönen = 0; Extremwerte beider Timbres
  (Resonanz 127, alle Mixer 127, Unison 99 ct, PATCH ±63, Pelog/Eigene ±100) mit 20-s-Sturm aus 177 Noten (C-1…G9) und 80 Programm-
  wechseln (MODUS/STIMMEN/SPLIT/STIMMUNG/GRUNDTON/Zuweisung/Solo/EIGENE): kein NaN/Inf, Spitze −5,9 dBFS, danach keine Stimme an;
  Denormale: Dual mit stummem T2 (Solo) nach Vollaussteuerung 60 s, kein Fenster > 1,1 ×; M-KLICK/M-EINBRUCH aller Umschaltungen;
  CPU je Quantum; Worklet-ASCII (0 Nicht-ASCII-Zeichen). Neue IIR-Zustände gibt es in MK3 nicht.
  **Befunde: 3, alle behoben:** (1) Solo, vor der Note gesetzt, ließ das stumme Timbre 5 ms anklingen (Rampe von 1 auf 0 im ersten
  Block: Split-Gegenseite nur −56,7 dB statt ≤ −60, Solo-Rest −64,5 dB statt ≤ −90) → ein stilles Timbre übernimmt die Solo-Verstärkung
  sofort (Setter + Block), jetzt −600 dB; (2) M-EINBRUCH mit einem Akkord aus nicht verwandten Noten schwankt schon ohne Umschalten
  ±4 dB je 5-ms-Fenster (Schwebungen) → Messung mit Oktav-Akkord 69/81/93 (s. Abweichungen), der Akkord bleibt für M-KLICK; (3) ein
  fehlender Ende-Bericht (`end`) einer Note in der Sturm-Prüfung → Ursache liegt in MK1 (s. Lücken), nicht im MK3-Code.
- **FP-TOUCH** (`v3-mk3-ui.mjs`, `v3-mk3-shot.mjs`, Regression `v3-mk1-look.mjs`): M-SKIZZE (IoU 1,000, 88/88), M-PLATZ und Treffer
  ≥ 44 × 44 ohne Überlappung in 9 Formaten (P1, P2 A/B, P3 A/B, L1, L2 A/B, W, L1 und 926 × 428 mit Safe-Area, L1 + Home-Balken A/B)
  × 11 Zuständen mit echter App-Schrift = 143 Fälle; M-ANSICHT beim Timbre-Wechsel 0 px; ein Undo je Geste/Werkzeug; Haptik `tick`
  an TIMBRE, Solo und Split-Taste. **Befunde: 4, alle behoben:** (1) die LCD-Taste [Split ← nächste Note] war nur das 10-px-Schild →
  die ganze LCD-Zeile ist die Taste (Höhe der Zeile s. Abweichungen), der SPLIT-Regler (44 × 44) macht sie ebenso scharf; (2) Fachwort
  „Edit Sync“ in LCD und Hilfe → „beide zugleich“; (3) nach einem Wechsel auf EINZELN von außen (Undo, API) meldete die Taste noch T2
  → Tipp setzt T1, `mkPanel().timbre` = 1 bei EINZELN; (4) Liste EDIT-WAHL 2 rief für STIMMUNG den PATCH-Text (TypeError im
  unterbrochenen Lauf) → eigene Zeile „Stimmung · Grundton“. Dazu FP-SICHER-Teilprüfung B.6 Nr. 9: ein Kommentar enthielt die
  Zeichenfolge des Engine-Namens (zweiter Treffer) → umformuliert, ganze Datei wieder genau 1 Treffer (`MK_LABEL`).

### Abnahme (Skripte in `dirigent-test/`: `v3-mk3-timbre.mjs` 30/30, `v3-mk3-scale.mjs` 6/6, `v3-mk3-ui.mjs` 37/37, `v3-mk3-fpdsp.mjs` 6/6; Node 22 bzw. Chromium 1243)

| ID | Ergebnis |
|---|---|
| MK3-01 | ✓ Dual 2+2 / 1+3 / 3+1 = Summe der Einzel-Renders (Solo T1 + Solo T2) mit Rauschen, S/H, PATCH: max \|Δ\| 2,6e-8; ebenso T1 allein (T2 PEGEL 0) + T2 allein: 2,4e-8; gleicher Seed gleich, anderer Seed anders |
| MK3-02 | ✓ 1+3 Dreiklang: T1 [67], T2 [60 64 67]; 2+2 Vierklang: je [67 72] (Letzte), T1 Tiefste [60 64] / T2 Höchste [67 72]; 3+1 spiegelbildlich; T1 Unison in 2+2: 2 gestapelte Stimmen, T2 eine; T1 Mono + T2 Poly, 4 Tasten: T2 [64 67 72]; T1 Unison + T2 Mono: 2 + 1; beide Mono 1 + 1; Rückgabe der gehaltenen Taste |
| MK3-03 | ✓ Split C4: C3 und H3 nur T1, C4 und C5 nur T2 (Gegenseite −600 dB); [Split ← nächste Note]: E4 → `split` 64, ein Undo, danach nicht mehr scharf, ↶ = 60; Tipp auf SPLIT (EB2) ebenso (C5 → 72); Ziehen ändert, LCD „darunter T1, ab hier T2“ |
| MK3-04 | ✓ TIMBRE T1 → T2 → beide → T1, LEDs 01/11/10; Bearbeitung mit T2 (CUTOFF 127 → 98) lässt T1 deep-equal, ein Undo, LCD „T2 · FILTER · …“; EINZELN: T2 gesperrt mit LCD-Hinweis, Taste bleibt T1 |
| MK3-05 | ✓ SHIFT + 1: Liste (dieser Sound + Bibliothek, [T1] [T2] je 52 × 44), Quelle T2 → T2 und T1 → T1 deep-equal; SHIFT + 2 zweimal = Ausgang; SHIFT + 4 = INIT-Werte, T2 unverändert; je ein Undo; ⋯ zeigt die drei Werkzeuge (48 px) |
| MK3-06 | ✓ alle 10 Stimmungen × Grundton C und A × C4…H4: Abweichung zu W-43 höchstens 0,068 ct (Spektrum, Blackman 2¹⁵) bzw. 0,011 ct (Nulldurchgänge); Eigene (Grundton E) 0,057 ct; Gleichstufig mit Grundton C/E/A/H bitgleich zu 4.10.0; T2 gestimmt (Pelog E4 −130,0 ct); Wechsel bei gehaltener Note ohne Klick (2,9 dB) |
| MK3-07 | ✓ 11 Single-Patches × 3 Programm-Varianten (mit T2-Inhalt, Grundton, `tv`/`split`) bitgleich zu 4.10.0 (max \|Δ\| 0); VA bitgleich |
| MK3-08 | ✓ Dual 2+2 gegen Single 4 Stimmen: 0,99 × (Quantum, Minimum aus 7 verschachtelten Läufen, auf einen Kern gebunden 1,008 ×; CPU-Zeit 0,93 ×); nie mehr als 4 klingende Stimmen (4 Modi × 5 Zuweisungs-Paare × 12 Tasten; eine gestohlene Stimme in ihrer 5-ms-Blende zählt nicht, wie MK1) |
| MK3-09 | ✓ Einzeln↔Schicht, Schicht↔Split, Einzeln→Split, STIMMEN 2+2→1+3, 1+3→3+1, SPLIT 60→62, T2 Poly→Mono bei klingenden Noten: M-KLICK ≤ 5,0 dB, M-EINBRUCH ≥ −0,24 dB; danach keine hängende Note |
| MK3-10 | ✓ M-PLATZ/Treffer 143 Fälle (s. FP-TOUCH), M-SKIZZE 88/88 (Regression `v3-mk1-look.mjs`), M-ANSICHT 0 px; EIGENE-Maße wie Spec (P1 360, L1 705, L2 633), Regler ändert `usc`, ein Undo, [◂ GERÄT] zurück |
| MK3-11 | ✓ Regression s. unten; Budget **+28,7 KB** (2 797 302 → 2 826 651 B) ≤ +33 KB; Startzeit ohne AM +4 ms, mit AM +17 ms (Median aus 5); PE1 L1/P1 59,9 fps, 0 longtasks; Smoke-Test ohne Fehler; Hilfe 3 Zeilen; Worklet-ASCII |
| MK3-12 | ✓ PEGEL T1 0 → T1-Anteil −600 dB; PAN T1 L63/T2 R63: Trennung 76 bzw. 78 dB; KEYTRACK +48 mit Werckmeister III: Cutoff-Abweichung = W-43 ± 0 ct (C4…H4) |
| MK3-13 | ✓ „beide“: CUTOFF-Zug Δ 23/23, ein Undo, ↶ stellt beide her; SPIEL RELEASE ebenso; Taste ändert `soundHash` nicht; SHIFT + TIMBRE: Solo T1 (LED blinkt), T2-Anteil −600 dB (Node und Chromium-OfflineAudioContext), Tipp beendet, nichts gespeichert; Editor schließen beendet Solo |
| Hörbar | ✓ (Spec §0.3 H-1/H-3, B.6 Nr. 3) EINZELN → SCHICHT +4,5 dB; STIMMEN 1+3 ↔ 3+1 Band um 659 Hz 111 dB; SPLIT 0 ↔ 127 Band 2–8 kHz 75 dB; STIMMUNG/GRUNDTON/EIGENE über MK3-06 (ct-genau) |

**Regression** (Neubau gegen MK2 bzw. 4.8.1): `v3-mk1-dsp.mjs` 64/64, `v3-mk1-hear.mjs` 53/53, `v3-mk1-look.mjs` 88/88, `v3-mk1-ui.mjs` alle,
`v3-mk1-eco.mjs` alle, `v3-mk2-osc.mjs` alle, `v3-mk2-ui.mjs` alle bis auf die erwartete Zeile „MOD-FX … SEQ dunkel“ (STIMMUNG ist jetzt
aktiv), `v3-mk1-format.mjs` alle bis auf die erwarteten Zeilen „APP_CODE 4 009 000“ (jetzt 4 011 000) und – einmal von drei Läufen –
„64 Werks-Sounds bitgleich“ (1 Abweichung in einem Lauf, zwei Wiederholungen 0; Zeitfenster des Test-`flush` auf der geteilten Maschine),
`v3-mk1-fpdsp.mjs` alle bis auf die Denormal-Zeiten (schwanken auf der geteilten Maschine; derselbe Lauf mit 4.10.0 scheitert ebenso
5/58, Mediane gleich 7,5/4,3 ms). Markenwort-Prüfung B.6 Nr. 9 (a) AM-Teil 0, (b) ganze Datei 0 / genau 1 „MS 2000“.

**Bildschirmfotos:** `dirigent-test/v3-mk3-shots/<Format>-{stimme-split, stimme-eb2, filter-t2, filter-beide, solo, stimmung, eigene,
kopieren}.png` für P1, P2, P3, L1, L2, W (für Xanders Sicht-Abgleich).

### Abweichungen
- **LCD-Taste [Split ← nächste Note]:** Die ganze LCD-Zeile ist die Trefferfläche (wie das FEST-Schild). Sie ist so hoch wie die Zeile
  des Blattrahmens (L1 26 px, P1 36 px), nicht 44 px; der vollwertige 44 × 44-Weg ist der Tipp auf den SPLIT-Regler (SHIFT → STIMME).
  In P3 zeigt der Blattrahmen keine LCD-Zeile (Stand MK1); dort nur der Regler-Weg.
- **Solo bei „beide“:** SHIFT + TIMBRE schaltet T1 solo; ein zweites SHIFT + TIMBRE wechselt zum anderen Timbre (am Gerät Halten). „beide“
  bleibt dabei die Bearbeitungs-Wahl.
- **Prüf-Lesarten:** M-EINBRUCH (MK3-09) mit Oktav-Akkord 69/81/93 und zwei verschiedenen Timbres (gleiche Timbres löschen sich je nach
  Zufallsphase aus); M-KLICK mit dem Akkord 57/61/64. CPU (MK3-08) als Minimum über 7 verschachtelte Läufe (Median-Werte streuen auf der
  geteilten Maschine 0,7–1,8 ×; Messung ohne Fremdlast, auf einen Kern gebunden: 1,008 ×). Stimmenzahl ohne gestohlene Stimmen in ihrer
  5-ms-Blende.
- **Eigene Stimmung:** `usc` wird wie in MK1 (`normMk`, B.1 „nur bei scale 9“) beim Wechsel auf eine andere Stimmung verworfen; ↶ holt
  die Werte zurück. Beim Einschalten von „Eigene“ beginnt sie mit 12 × 0 ct.
- **Edit Sync bei Listen** (WELLE, TYP …): T2 bekommt denselben Listenwert wie T1 (kein „Δ“ bei Listen).

### Lücken
- **MK1-Fehler (Hauptlinie, hier nicht behoben):** Wird dieselbe Note wieder angeschlagen, während ihre vorige Stimme noch ausklingt
  (`polyOn`: „the same note releasing: the voice restarts“), übernimmt die Stimme die neue Kennung, ohne für die alte `end` zu melden
  (Probe: C4 an/aus/an/aus → nur die zweite Kennung endet, auch in 4.10.0). Der Proxy in `VOICES` bleibt dann bis zum Aufräumen
  1 s nach `stopAt` stehen. Vorschlag für die Hauptlinie: in `start()` bei `v.id !== k.id` vorher `endCheck(alte Kennung)`.
- Leistungs-Probe: MK3 bringt keinen eigenen Fall (Nachtrag 3 nennt ihn nicht); Chromium-Gegenprobe der Last nicht eigens gemessen.
- Am iPhone ungeprüft (Gerät): Solo-LED-Blinken, Haptik, Lesbarkeit der LCD-Zeile mit „T1 ·“.

### Datenbank / Am Server offen
Keine Änderung, keine Supabase-Abfrage. 4.11.0 = `p_app` 4 011 000 ≤ `max_app` 4 021 000, Format 5 ≤ `max_format` 5.

### iPhone-Prüfpunkte (Xander, ≈ 4 min)
1. MS-2000-Spur öffnen, EDIT-WAHL 1 auf STIMME, Regler 2 (EINZELN) antippen und in der Liste „Split“ wählen. SHIFT, dann Regler 3 (SPLIT) antippen und C4
   auf der Tastatur spielen → LCD „SPLIT · C4“.
2. TIMBRE einmal tippen (LED 2): FILTER CUTOFF hochdrehen → nur die obere Hälfte wird heller. TIMBRE noch einmal (beide LEDs) und
   RELEASE drehen → beide Hälften ändern sich gleich. Noch ein Tipp → LED 1.
3. Unten Bass (T1), oben Fläche (T2) bauen; SHIFT + TIMBRE → nur T1 klingt, LED blinkt; Tipp auf TIMBRE → wieder beide.
4. EDIT-WAHL 2 auf STIMMUNG, Regler 1 → „Werckmeister III“, Akkorde spielen; dann „Eigene“, Tipp auf die Zeile „STIMMUNG EIGENE ▸“
   → 12 Regler, einen Ton verstimmen, [◂ GERÄT].
5. SHIFT + 2 (Timbres tauschen) → oben und unten vertauscht; ↶ → zurück.

### Geräte-Abgleich (microKORG, nach Gehör; ändert nur Werte in einem MK3-fix)
Layer mit 2 Stimmen je Timbre (2+2) gegen „Schicht“; mehr Tasten als Stimmen (welche Note fällt weg); Mono/Poly-Layer (1/3);
Edit Sync und Solo (TIMBRE-Taste); welche Seite der Split-Grenze T1 ist.

## MK3-fix — Kopier-Liste per Finger, ⋯-Werkzeuge auf der offenen Spur, SPLIT ohne Abriss, Timbres in Phase, Solo/Split-Taste enden auf jedem Weg · App bleibt 4.11.0 · Format bleibt 5

### Behoben (7 bestätigte Befunde, 5 Ursachen)
1. **SHIFT + 1 „Timbre kopieren“: die Liste ließ sich nicht mit dem Finger scrollen (major).** `guardTouch(p)` auf dem Pop brach jedes
   `touchstart` ab. Wie MK2-fix bei `wavePop`: Die Liste `.plist.mkcp` hält ihr `touchstart` bei sich (passiver Listener mit
   `stopPropagation`); `guardTouch` selbst unverändert. Tipps wirken weiter über `pointerup`, ein Wischer kopiert nichts.
2. **⋯ → „Timbre kopieren ▸“ kopierte in die zuletzt gebaute Spur (P.i) statt in die offene (major).** `timCopyPop(anchor, t)` bekommt
   die Spur vom ⋯-Menü; `timCopy`/`timInit`/die Liste („dieser Sound“) arbeiten auf dieser Spur. `tDst(i)` nimmt die Timbre-Wahl nur aus
   dem Bedienfeld, wenn es zu dieser Spur gehört, sonst T1 (wie ein frisch gebautes Bedienfeld).
3. **SPLIT bei gehaltener Taste schnitt fremde Ausklänge ab (major).** `MkCore.after(route)` lässt ein Timbre, dessen gehaltene Tasten
   und Regel gleich bleiben, unberührt. `MkTim.reassign(list, keep, from)`: bei reinem Umleiten (poly) klingen Ausklänge nicht
   gehaltener Tasten weiter (außer auf derselben Note wie eine neu verteilte Taste).
4. **M-EINBRUCH bis −22 dB, wenn eine gehaltene Taste das Timbre wechselt (major).** Vor dem Umverteilen merkt sich `after()` die
   Oszillator- und LFO-Phasen jeder gehaltenen Taste (t1, t2, sp, l1, l2, tw/wn); die neue Stimme im anderen Timbre setzt sie fort
   (`inheritPh`). Gleiche Timbres löschen sich in der 40-ms-Blende nicht mehr aus.
5. **Schicht mit gleichen Timbres: Lautstärke je Note zufällig, einzelne Noten fast stumm (major).** Startphasen je Taste für beide
   Timbres gleich (`MkCore.notePh`): wer zuerst eine Stimme für die Taste startet, zieht sie wie bisher (Single unverändert,
   bitgleich), das andere Timbre übernimmt sie. Rauschen und S/H bleiben je Timbre zufällig (B.4 Nr. 3). Liste wird bei Ende der
   Kennung und bei `panic` geleert.
6. + 7. **Solo und [Split ← nächste Note] blieben nach ≡ (Menü) bzw. Projektwechsel aktiv (major, 2 Befunde).** `closeSheets()` ruft
   `MKUI.leave()`, wenn das Synth-Blatt offen war: jeder Weg aus dem Editor (✕, ≡, Browser, Projektwechsel …) beendet Solo und die
   scharfe Split-Taste. Zusätzlich nimmt `splitNote` eine Note nur an, solange genau dieser Editor offen ist.

### Proben (Node 22 bzw. Chromium 1243; der Pfad chromium-1194 aus dem Auftrag existiert hier nicht)
- Scroll: `v3-fpq-mk3-scroll.mjs` P1 0 → 152 px, L1 0 → 152 px (vorher 0), Liste bleibt offen, nichts kopiert; `v3-rep-mk3-cpscroll.mjs`
  ebenso; neu `v3-mk3fix-cpreach.mjs`: nach Wischern Ende erreicht (P1 388/388, L1 522/522), Tipp auf [T1] der letzten Zeile „Src 15“
  kopiert (CUTOFF 90), Pop zu, 0 Fehler.
- ⋯-Kopie: `v3-fpq-mk3-more.mjs` und `v3-rep-mk3-tcopy-stale.mjs` (P1 + L1, echte Tipps): Zeile „FM-Pluck (dieser Sound)“ = Spur 1,
  CUTOFF Spur 0/1 127/90 → 127/50 (vorher 50/90), Undo auf Spur 1.
- SPLIT-Ausklang: `v3-fpq-mk3-tail2.mjs` 0,6–0,9 s −19,4 / −19,4 dB (vorher −98,6), Zug 60→66 −19,4 (vorher −99,8);
  `v3-rp-mk3-splittail.mjs` T1-Ausklang und gehaltenes T2 unverändert (L −22,4/−22,4; R −18,1/−18,1).
- Loch: `v3-fpq-mk3-hole.mjs` alle Fälle 0/24 Seeds < −3 dB (schlechtester −1,4 dB, vorher bis −14,2); `v3-rep-mk3-hole.mjs`
  (strenge §16-Lesart) schlechtester −1,3 dB (vorher −22,4); `v3-rep-mk3-hole2.mjs` −0,5 dB (vorher −18,9);
  `v3-rep-mk3-hole-br.mjs` (Chromium-Worklet) −1,3 dB, Sanity-Fall weiter −28 dB. M-KLICK höchstens 5,1 dB (≤ +6).
- Phase: `v3-fpq-mk3-phase.mjs`/`-phase2.mjs` Schicht gegen Einzeln jede Note +6,0 dB (Sinus vorher −56,8 … +6,0);
  `v3-rv-mk3-phase-oac.mjs` (App-`mkRender`) Sinus/Dreieck/Säge 6,0–6,1 dB, 0 Fehler.
- Solo/Split-Taste: `v3-qa-mk3reg-leak4.mjs` P + L, ≡: −19,1 dB nach dem Menü (vorher −200); `v3-verify-solo-menu.mjs` P + L
  inkl. „Neu ▾“: −19,1; `v3-qa-mk3reg-leak2.mjs` ok; `v3-qa-mk3reg-arm.mjs` P + L und `v3-rep-mk3-armmenu.mjs` (Spur 1 und 4):
  split bleibt 60, Undo 1 → 1 (vorher 40/65/67, Undo 2).
- Regression: `v3-mk3-timbre.mjs` alle Fälle (MK3-01 Dual = Summe 2,6e-8; MK3-07 Single bitgleich zu 4.10.0 max |Δ| 0; MK3-09
  M-EINBRUCH ≥ −1,03 dB), `v3-mk3-scale.mjs` 6/6, `v3-mk3-fpdsp.mjs` 6/6, `v3-mk3-ui.mjs` 37/37, Smoke-Test ohne Fehler.
  MK3-08 CPU streut auf der geteilten Maschine (1,00–1,15 ×); A/B gegen `MK3.html` auf einem Kern: alt 1,046/1,034 ×, neu 1,001/0,952 ×
  (der Fix berührt nur den Notenstart). Worklet bleibt ASCII. Größe 2 829 915 B (+3,3 KB; MK3 gesamt +32,6 KB ≤ +33 KB).

### Abweichungen
- **MK3-13 M-KLICK-Lesart:** Säge (T1) + Rechteck (T2) derselben Noten starten jetzt in Phase; ihre Flanken fallen zusammen, und der
  Render **ganz ohne Solo** erreicht schon 6,1 dB bei 1,174 s (Eigenschaft des stehenden Klangs, kein Knack). Die Probe misst darum
  ±30 ms um die beiden Umschaltpunkte (mit 100 ms Umgebung): 3,4 dB (`v3-mk3fix-solo.mjs` zeigt die Gegenprobe für 6 Seeds).
- Neue Stimme im anderen Timbre übernimmt nur Phasen, nicht Hüllkurven oder Filterzustand (B.6 Nr. 2: sie beginnt mit Einblendung).

### Lücken / Hauptlinie
- `wavePop` (MK2) ist auf der Hauptlinie bereits mit demselben Muster behoben (MK2-fix Nr. 5); hier nicht angefasst.
- Der MK1-Befund zur Kennung beim Neuanschlag einer ausklingenden Note (s. oben) bleibt für die Hauptlinie offen.

### Datenbank / Am Server offen
Keine Änderung, keine Supabase-Abfrage.
