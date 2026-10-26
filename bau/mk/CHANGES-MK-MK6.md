# CHANGES – MS 2000, Paket MK6 (Zweig-Kopie `mk-br-MK6`)

## MK6 — Mod-Sequenzer 3×16 und „Bewegung aufnehmen“ · App 4.14.0 (`APP_CODE` 4 014 000) · Format bleibt 5

**Vorgänger-Stand** für alle „bitgleich“-Abnahmen: **4.12.0** (Start dieser Kopie, MK0–MK4 zusammengeführt; Kopie
`scratchpad/mk6-base-4.12.0.html`, 2 874 742 B). MK5 (Arp) und MK7 (Vocoder) entstehen gleichzeitig in `mk-br-MK5` / `mk-br-MK7`;
der Orchestrator führt zusammen und setzt die VERSION-Zeile. Server: keine Änderung nötig (`max_app` 4 021 000 ≥ 4 014 000, Format 5).
Kein Supabase-Aufruf in diesem Lauf. Neustart-Prüfung: kein `MK6.html` und keine halbe MK6-Arbeit vorhanden → neu gebaut.

### Gebaut
1. **Seq-Kern im AM-Zweig des Worklets** (zwischen `/*MK{*/ … /*}MK*/`, ASCII): je Timbre drei Sequenzen à 16 Schritte mit
   gemeinsamer Position (`MkSqP`). KEY SYNC **Timbre** = eine Position je Timbre (Neustart bei der ersten Note nach „alle los“, an derselben
   Stelle wie der LFO-Key-Sync), **Stimme** = eine Position je Stimme (Neustart bei Neuanschlag, nicht bei Legato), **aus** = Song-Raster:
   Zyklus C = Summe der Schrittlängen, Schritt bei (Song-Schlag mod C); ohne laufenden Song frei weiterlaufend. Einmal + KEY SYNC aus
   startet bei Schlag 0 und hält nach C. Tempo-Wechsel behält die Schlag-Lage (wie der Sync-LFO).
   - LETZTER SCHRITT 1–16, TYP Vorwärts / Rückwärts / Wechsel 1 (1…16, 15…2) / Wechsel 2 (1…16, 16…1), LAUF Einmal (hält den letzten Wert) /
     Schleife, AUFLÖSUNG W-10 (16 Werte × 4 Schläge) im Song-Tempo.
   - BEWEGUNG **Glatt** = linear zwischen den Schrittwerten (Bruchwerte); **Stufe** = halten, jeder Sprung als lineare **1-ms-Rampe ab der
     Blockgrenze** (B.6 Nr. 2 b).
   - **31 ZIELE** (0 keins … 30): Tonhöhe ±24 HT (wirkt auf KT, also auch auf Keytrack und Patch-Quelle Keytrack), Schrittlänge ±6
     (verschiebt den Auflösungs-Index je Schritt), Portamento, OSZ1-Steuer 1/2, OSZ2-Halbton ±24, OSZ2-Fein, Mixer OSZ1/OSZ2/Rauschen,
     Cutoff, Resonanz, HK-INT, Keytrack, Amp-Pegel, Pan, EG1 A/D/S/R, EG2 A/D/S/R, LFO1/2-Freq, Patch 1–4 Intensität. Schrittwert +
     gespeicherter Wert, geklemmt; Vorrang SEQ 3 > SEQ 2 > SEQ 1. LFO-Freq bei TEMPO SYNC an wirkungslos (bitgleich). Steuer 2 bei der
     Speicherwelle = **Wellenfolge** (Stufe springt direkt zur Welle des Schritts, 2-ms-Blende aus MK2; keine Zwischenwellen).
     EG-Zeiten wirken ab der nächsten Stufe (je Stimme beim Stufenwechsel eingerastet; SUSTAIN folgt in der Sustain-Stufe).
   - **Bewegung aufnehmen** im Worklet (`{mkRec}` → `{mkRecDone}`): der Live-Wert des Reglers minus seinem Startwert landet ab dem laufenden
     Schritt bis LETZTER SCHRITT; währenddessen vorwärts als Schleife (auch bei Rückwärts/Einmal); die aufgenommene Sequenz ist dabei stumm.
   - Neutral: Seq aus und Seq an mit lauter 0 rechnen bitgleich zum Vorgänger (Offsets werden nur angewandt, wenn ≠ 0).
   - `mkScope`: je Stimme `seqStep` (die seit dem letzten Bericht betretenen Schritte), dazu `seq[ti] = {on, run, step, done, rec, vals}`.
   - Test-Abgriff `'gain'` (Verstärkung je Sample ohne Signal).
2. **Bedienfeld** (`sq-mk-src`): EDIT-WAHL 2 Stellung 11 **SEQ** aktiv (vorher „kommt mit MK6“). Ebene 1 SEQ AN · SEQUENZ (1│2│3, Ansicht)
   · ZIEL (31 Einträge, stetiger Regler mit Rundung, alle in < 200 px; Tipp = scrollende Liste) · BEWEGUNG · LÄNGE; **Ebene 2 (SHIFT)**
   TYP · LAUF · KEY SYNC · AUFLÖSUNG (Matrix „EB2“). Matrix-Zeile „SEQ ●“ (an) und „SCHRITTE ▸“; LCD-„*“, wenn eine höhere Sequenz
   dasselbe Ziel hat; ◎ markiert SEQ; Auswahl-Liste der EDIT-WAHL 2 zeigt eine SEQ-Zeile.
   - **Zusatz-Ansicht SCHRITTE** (Tipp auf die Matrix-Zeile): [◂ GERÄT] [SEQ 1][SEQ 2][SEQ 3] [● AUFN.] (je ≥ 44 × 44) und 16 Säulen in
     **einem Canvas** (P1 2×8 à 41×88/4 px = 356×232, P2 39×88 = 340, P3 36×88 ohne Abstand = 288, L1 16×41×90/3 px = 701×136,
     L2/Halb-Ansicht quer 16×36×74 = 621×120). Senkrecht ziehen = Wert über die volle Säulenhöhe in Ziel-Einheiten (±6/±24/±63), Tipp
     über/unter dem Balken ±1, waagrecht > 8 px malt, ein Undo je Geste, zweiter Finger ignoriert, laufender Schritt hell (≤ 30 Hz, nur
     sichtbar und nur während er läuft).
   - **● AUFN.**: wählt die Sequenz, springt zu GERÄT in SPIEL (CUTOFF/RESONANZ unter den Fingern), Matrix-Zeile „● AUFN.“ blinkt. Der erste
     bewegte Regler einer EDIT-WAHL-1-Sektion, einer PATCH-Stellung oder SPIEL-CUTOFF/-RESONANZ wird das ZIEL (ARP-/Effekt-Regler und
     Schalter nehmen nicht auf, LCD sagt es). Am Ende: Regler zurück auf seinen Startwert, SEQ an, **ein Undo** für alles.
   - **SHIFT + 5 Sequenz-Werkzeuge** (auch unter ⋯): Neu (S1/S2/S3/ALLE), Tauschen (1⇄2, 2⇄3, 1⇄3), Kopieren aus diesem oder einem
     gesicherten MS-2000-Sound (T1/T2 × S1/S2/S3 → gewählte Sequenz, ALLE = alle drei samt Einstellungen); je ein Undo.
   - Hilfe: zwei neue Zeilen (SEQ, ● AUFN./Werkzeuge); LCD-Hinweis beim ersten Antippen.
3. **Hauptfaden**: `mkRange` kennt die Seq-Pfade (`t.X.seq.on|last|type|run|ks|res`, `t.X.seq.q.K.k|m`, `t.X.seq.q.K.v.S`); `normMk`
   Ziel-Bereich 0…30 (vorher 0…40, ungenutzt); Wellen einer Wellenfolge werden vorab gebaut/geschickt (`mkSeqWaves`, auch in `mkRender`);
   `{mkRecDone}` an das Bedienfeld.
4. **Leistungs-Probe** (Menü → Info): Fälle „Kern“, „+FX“, **„+Seq“** (= „+FX“ mit drei Sequenzen je Sound bei KEY SYNC Stimme).
5. **Test-API**: `MKUI.knobSim(path, werte)` (Reglergeste durch die Bedienfeld-Logik, auch für die Aufnahme), `MKUI.stepsInfo()`,
   `MKUI.seqInit/seqSwap/seqCopy/seqToolsPop/recArm/recCancel`, `mkPanel()` mit `sq`, `rec`, `steps`.

### Abnahme MK6 (Node `v3-mk6-seq.mjs` 36/36, `v3-mk6-cpu.mjs`, `v3-mk6-fp.mjs` 16/16; Chromium `v3-mk6-ui.mjs` 28/28, `v3-mk6-pe1.mjs`, `v3-mk1-look.mjs` 88/88, `smoke.mjs`)
| ID | Ergebnis |
|---|---|
| MK6-01 | ✔ 1/16 bei 120 BPM, Ziel Amp-Pegel, Stufe: Rampenbeginn bei −16 Samples (genau ein Steuerblock vor dem 125-ms-Raster, ≤ 1 Block), Rampe 48 Samples = 1 ms; alle 16 Auflösungen (1/48 = 41,7 ms … 1/1 = 2 s) je 3 Schritte im Raster; M-KLICK Pegel-Stufe ±63: Säge C5 2,5 dB, Rauschen 2,3 dB. |
| MK6-02 | ✔ Glatt: Schrittmitte gemessen = erwartet (Abweichung 0,000 Einheiten = 0 % des Hubs); jede Steuerblock-Grenze bewegt sich. |
| MK6-03 | ✔ `seqStep` deep-equal für Vorwärts, Rückwärts, Wechsel 1, Wechsel 2 (L 16, zwei Zyklen); LETZTER SCHRITT 5 = Länge 5; Wechsel bei 5: 1,2,3,4,5,4,3,2 bzw. 1,2,3,4,5,5,4,3,2,1. |
| MK6-04 | ✔ Einmal: nach dem 5. Schritt bis 2,5 s Abweichung 0 (Wert von Schritt 5); Schleife: Zyklus 2 und 3 = Zyklus 1 (max \|Δ\| 0). |
| MK6-05 | ✔ Timbre: zweite Note bleibt im Raster, neue Note nach „alle los“ setzt zurück. Stimme: zwei Noten 0,3 s versetzt auf Schritt 5 bzw. 3. Aus: Schritt = (Song-Schlag mod C) mit Schrittlänge ±2 (C = 4,083 Schläge), zwei Starts aus Takt 2 und 3 zeigen am selben Schlag denselben Schritt (55/55). **Mit Arp (MK5-21) nicht prüfbar:** MK5 fehlt in diesem Zweig (s. Zusammenführen). |
| MK6-06 | ✔ Tonhöhe +12 an Schritt 3: +1199,98 ct, sonst ≤ 0,05 ct · Cutoff 40+63 → W-01(103), 100+63 → geklemmt 127 · Schrittlänge +2 an Schritt 1: 8992 Samples (187,5 ms ± 1 Block) · OSZ2-Halbton +2400 / −2400,09 / 0,03 ct · EG: DECAY-Schritt mitten im Decay bitgleich, RELEASE +63 wirkt ab dem Release · Patch-Intensität wirkt (Cutoff-Bereich ×4,7·10⁵ statt ×1) · LFO1-Freq bei Tempo Sync bitgleich wirkungslos (Kontrolle Sync aus 0,32). |
| MK6-07 | ✔ SEQ 1 + SEQ 3 auf Cutoff = nur SEQ 3 (max \|Δ\| 0); LCD „ZIEL *“ mit „SEQ 3 hat dasselbe ZIEL und Vorrang“. |
| MK6-08 | ✔ Wellen 1, 11, 21, 31, 41, 51 je Schritt: Spektrum = Einzel-Render (Abstand 0); M-KLICK 5,2 dB gegen den lauteren stehenden Zustand (Verfahren MK2, `mKlickSw`). |
| MK6-09 | ✔ Worklet: Schritte 3…8 (Start im 3. Schritt, LETZTER SCHRITT 8), Ziel CUTOFF, nur der erste Regler zählt. App (P1, echter Zug am FILTER-CUTOFF): ZIEL CUTOFF, SEQ an, Schritte 1–12 geschrieben, CUTOFF zurück auf 40, **ein Undo** stellt alles deep-equal her; MOD-FX TIEFE nimmt nicht auf; L1: SPIEL-CUTOFF nach ● AUFN. bei KEY SYNC Stimme in SEQ 2. |
| MK6-10 | ✔ Seq aus: 4 Timbres max \|Δ\| 0 gegen 4.12.0; Seq an mit lauter 0: 120 Renders (alle 29 Ziele außer Schrittlänge, KEY SYNC aus/Timbre/Stimme, alle TYP/LAUF/AUFLÖSUNG) max \|Δ\| 0; VA/FM6 0. |
| MK6-11 | ✔ Ziehen ¼ Säulenhöhe = +31,5 → +32 Einheiten (29 → 61), Malen über 4 Säulen, Tipp ±1 — je ein Undo; zweiter Finger ändert nichts; TONHÖHE ganz oben = +24; alle 31 ZIEL-Einträge in 200 px; ZIEL-Liste 31 Zeilen ≥ 44 px, scrollt. M-PLATZ in P1, P2, P3, L1, L2, W, L1 + Safe-Area, 926×428 + Safe-Area, L1 + Home-Balken (Halb-Ansicht): SEQ Ebene 1 und 2 und SCHRITTE — alle Treffer ≥ 44×44, keine Überlappung, nichts abgeschnitten, kein Scrollen; M-ANSICHT Ebene 1↔2 und GERÄT↔SCHRITTE ≤ 2 px (Rahmen, LCD, Seite, Räder, Tastatur stehen). M-SKIZZE (`v3-mk1-look.mjs`) 88/88. |
| MK6-12 | ✔ Node-Offline, Median aus 5 je Fall, je eigener Prozess: 3 Sequenzen KEY SYNC Stimme (Cutoff glatt, Tonhöhe Stufe, Pan glatt) **+0,08 … +0,26 × VA-Stimme** in 4 Läufen; KEY SYNC Timbre +0,07 … +0,30; Zusatzfall A-HK DECAY + PATCH 1 + LFO 1 FREQ +0,22 … +0,55 (Maschine stark ausgelastet, Geschwister-Builds liefen; Spitze je Quantum 99,9 % ≤ 1,4 ms in allen Fällen inkl. VA). PE1 (Demo spielt, zwei MS-2000-Spuren mit je 3 Sequenzen, SCHRITTE offen, Werte werden bei gehaltener Taste editiert, 120 → 90 → 120 BPM): rAF-Median 60 / 59,7 fps, 0 longtasks > 50 ms, laufender Schritt sichtbar. Leistungs-Probe „+Seq“ in Chromium: load_med 0,107, frames_ok, 59,9 fps, 0 longtasks, 0 Netz. |
| MK6-13 | ✔ Tauschen, Neu (eine/alle), Kopieren (eine aus T2 eines anderen Sounds, alle) deep-equal, je genau ein Undo, Rücknahme deep-equal; SHIFT + 5 öffnet die Werkzeuge (15 Tasten ≥ 44 px). Regression s. unten. **Budget +42 111 B (41,1 KiB) > 36 KB** (s. Abweichungen). |
| MK6-14 | ✔ Seq-Tonhöhe +12 mit KEYTRACK +48 hebt den Cutoff um +12,000 HT; während ● AUFN. läuft die Sequenz vorwärts als Schleife (TYP Rückwärts, LAUF Einmal: 3,4,5,6,7,8). |

**Hörbarkeit (H-1/H-3, Spec §0.3):** jeder Seq-Regler ändert den Klang messbar: SEQ AN (Pegel-Stufen ±50 an/aus), ZIEL (Cutoff → Pegel → Pan),
BEWEGUNG (Glatt/Stufe, MK6-02 gegen MK6-01), LÄNGE / TYP / LAUF (Schrittfolgen MK6-03/04), KEY SYNC (MK6-05), AUFLÖSUNG (16 Raster, MK6-01),
Schrittwerte (App-Pfad `mkRender`: Höhen-Anteil −21,8 / −35,3 dB bei Cutoff 64 ± 50). Speichern → Neuladen: `p.mk` deep-equal.

### Fach-Prüfung (vor der Abnahme, selbst ausgeführt): FP-DSP (Haupt-Blick), FP-SONG (Zweit-Blick) — 6 Befunde, 5 behoben, 1 begründet
1. **FP-DSP / Umschalten (behoben):** Ein Wechsel der wirkenden Ziele (SEQ AN, ZIEL, Vorrang, Aufnahmebeginn) bei klingender Note sprang
   hart (ZIEL Cutoff → Pegel: M-KLICK 5,4 dB, knapp unter der Grenze). Jetzt blenden alte Offsets in 5 ms aus und neue in 5 ms ein (L3); reine
   Werte-Änderungen behalten Rampe/Gleiten. Danach `v3-mk6-fp.mjs`: 12 Umschalt-Fälle M-KLICK ≤ 3,8 dB, kein Einbruch unter den leiseren
   stehenden Zustand (≥ −0,1 dB). Nach dem Ausblenden ist „aus“ wieder bitgleich.
2. **FP-DSP / Wellenfolge (behoben):** Die 1-ms-Stufenrampe lief bei Steuer 2 durch alle Zwischenwellen (0 → 20 = Wellen 1…11, fehlende
   Tabellen → Platzhalter-Säge, M-KLICK 41,5 dB). Jetzt springt die Welle direkt (2-ms-Wellenblende), die Rampe bleibt für die WFM-Tiefe.
3. **FP-DSP / Fuzz (geprüft):** 300 Zufalls-Sequenzen über alle Ziele, Typen, KEY SYNC, Extremwerte, mit Patches/Resonanz: 0 NaN, Spitze 0,62.
4. **FP-SONG / Takt (geprüft):** KEY SYNC aus folgt dem Song-Schlag auch über 120 → 90 BPM (0 Abweichungen in 116 Berichten); Einmal ab
   Schlag 0 hält nach 4 Schlägen; KEY SYNC Timbre läuft über den Tempo-Wechsel stetig.
5. **FP-SONG / Anzeige (behoben):** Der Schrittbericht einer ruhenden Spur war veraltet (Seq-Zustand erst beim nächsten Ton neu berechnet) und
   der laufende Schritt leuchtete auch ohne Ton. Jetzt rechnet der Bericht nach, und hell ist nur ein laufender Schritt.
6. **FP-DSP / CPU (begründet):** Node-Zeiten streuen auf dieser Maschine stark (Geschwister-Builds); Kernfall ≤ 0,26 × VA in allen Läufen,
   der eigene Zusatzfall (EG + Patch + LFO-Freq) einmal 0,55. Die Leistungs-Probe „+Seq“ misst am iPhone.
- Undo-Gruppen und Rundweg (FP-SONG): je Geste/Werkzeug/Aufnahme genau ein Undo, Speichern → Laden deep-equal; Clips/Song unberührt
  (Seq lebt im Sound, `p.mk.t[].seq`). Worklet-ASCII ✓; ECO-Rückfall ohne Seq (B.5) unverändert.

### Abweichungen von der Spec (bewusst)
- **Budget +41,1 KiB statt ≤ +36 KB (×1,14).** Zusätzlich zum Plan: 5-ms-Zielblenden (FP-Befund 1), Wellenfolge ohne Zwischenwellen,
  scrollende Langlisten, Kurz-Namen für schmale Formate, Test-Hilfen (`knobSim`, `stepsInfo`, Abgriff `gain`, ≈ 1,5 KB). Kommentare
  wurden schon gekürzt (−6,7 KB gegenüber dem ersten Stand).
- **Schrittwerte werden mit ±63 gespeichert** und erst dort, wo sie wirken, auf den Bereich des Ziels geklemmt (±24 Tonhöhe/Halbton, ±6
  Schrittlänge). So geht beim Durchdrehen von ZIEL nichts verloren; der Editor schreibt nur Werte im Zielbereich.
- **Bewegung aufnehmen** schreibt die Reglerbewegung **relativ zum Startwert** des Reglers und setzt den Regler danach zurück (sonst
  doppelte Wirkung beim Abspielen). Tonhöhe nimmt über TRANSP. auf. Nach ● AUFN. steht das Bedienfeld in SPIEL (CUTOFF/RESONANZ dort nehmen auch auf).
- **EG-Ziele**: Zeiten rasten je Stimme beim Stufenbeginn ein; SUSTAIN folgt in der Sustain-Stufe.
- **Globale LFOs bei KEY SYNC Stimme** nehmen den LFO-Freq-Wert der jüngsten Stimme (wie der Patch auf LFO2-Freq).
- **Glatt + KEY SYNC Timbre-Neustart** bei noch ausklingenden Stimmen springt auf Schritt 1 (keine Rampe); Stufe rampt.
- **Verzerrer-Tiefe** (W-23, aus den Mixer-Pegeln) folgt den Mixer-Zielen der Sequenz nicht.
- **SCHRITTE bei TIMBRE „beide“** bearbeitet T1 (die angezeigte Spalte).
- Abnahme MK6-12 in Node gemessen; der iPhone-Faktor ist weiter unbelegt (Leistungs-Probe „+Seq“).

### Zusammenführen (für den Orchestrator)
- **MK5 (Arp, KEYS 9/10):** Der Seq-Neustart bei KEY SYNC Timbre steht in `MkTim.noteOn` direkt neben dem LFO-Key-Sync-Timbre
  (`if (Math.round(this.T.seq.ks) !== 0) …`). Wenn MK5 diese Stelle auf den KEYS-Tastensatz umstellt, muss die Seq-Zeile mitwandern;
  danach MK6-05 „mit Arp an (Gate 50 %): Reset nur je Akkord“ prüfen. Probe: „+Seq“ baut auf „+FX“ (MK5 bringt „+Arp“).
- **MK7 (Vocoder):** SEQ ist im Vocoder dunkel/„–“ (SEC2[10][1] = '–'); `build()` schließt SCHRITTE bei `mode` 3. MK7 muss die Stellung im
  Vocoder dunkel zeichnen.
- Berührt außerhalb der MK-Blöcke: `onMsg` (`m.mkRec`), Scope-Meldung (`seq: this.mk.sqScope()`), `SynthHost.track` (`mkRecDone`),
  `mkSetP` (Seq-Pfade → `mkwFeed`), `mkwFeed`/`mkSeqWaves`, `mkRender` (Wellen der Wellenfolge), `openEdMore` (⋯ → Sequenz-Werkzeuge),
  Hilfe (2 Zeilen), `VERSION`. Im immer geladenen Teil: `SEQK` 30, `mkRange` (Seq-Pfade). Worklet: `mkT()`/`MkTim.load/set` (seq),
  `start`/`monoSel`/`polyOn` (Seq-Position, Gleiten `v.gl`), `voice()` (Offsets), `prep` (`vc1`/`vc2`/`vw2`), `inherit`, `mkClone`, `MkCore.recMsg/sqScope`.
  Bedienfeld: `L_`, `KN`, `SEC2[10]` (+ Ebene 2 in `s[5]`), `kOf`, `knobs()`, `get`/`setv` (`sqsel`), `lcdOf`, `setWahl`, Matrix-`render`,
  `wiaPos2`, `numKey` (SHIFT + 5), `listPop` (Langlisten), `knobGesture` (Aufnahme-Haken, `d.px`), `build` (Ansicht 'schritte'), `timReset`, Probe, CSS.

### Regression
- Node: `v3-mk1-dsp` 64/64, `v3-mk4-fx` 61/61, `v3-mk3-scale` 6/6, `v3-mk2-osc` 31/31, `v3-mk4fix-kill` 30/30.
- Chromium: `v3-mk1-look` 88/88 (M-SKIZZE), `v3-mk3-ui` 37/37, `v3-mk4-ui` 63/64, `v3-mk1-ui` 32/33, `v3-mk2-ui` 22/24. Smoke ohne Fehler (`dirigent-test/v3-mk6-smoke.png`).
- **Nicht aus MK6 (schon im Vorgänger 4.12.0, gehören in den Hauptstrang):** `v3-mk4-ui` MK4-12 erwartet STIMMUNG/SEQ dunkel (veraltet seit MK3;
  scheitert auch auf 4.12.0); `v3-mk2-ui` MK2-10 erwartet MOD-FX … SEQ dunkel (veraltet); `v3-mk3-timbre` MK3-07 Stimmwelle gegen 4.10.0
  (scheitert auch auf 4.12.0, Folge von MK2-fix); `v3-mk2-ui` MK2-08 (Wellen-Zeit 30,2 ms, schwankt) und `v3-mk1-ui` MK1-31 (🎲 1 stummer Wurf
  von 100) wie in CHANGES-MK-MK4 beschrieben; `v3-mk1-fpdsp`/`v3-mk3-fpdsp` „Denormale Filtertyp 0“ ist eine Zeitmessung, die auf 4.12.0
  ebenso scheitert (15–19/58 Fenster) und hier zwischen 0/58 und 16/58 schwankt.
- Markenwörter (B.6 Nr. 9): AM-Teil 0, ganze Datei genau 1× `MS 2000` (MK_LABEL). Worklet ASCII. Keine Konsolenfehler in allen Läufen.

### iPhone-Prüfpunkte (Spec MK6)
1. MS-2000-Spur, EDIT-WAHL 2 auf **SEQ** (letzte Stellung): SEQ AN, ZIEL CUTOFF. Tipp auf die Matrix-Zeile → **SCHRITTE**: Säulen malen,
   Song starten → der Klang „läuft“ im Takt, der laufende Schritt leuchtet.
2. **● AUFN.** tippen → GERÄT (SPIEL), eine Taste halten und den **CUTOFF**-Regler langsam drehen → die Bewegung steht danach in den Säulen,
   der Regler springt zurück, ↶ nimmt alles zurück.
3. SHIFT: TYP Rückwärts / Wechsel, LAUF Einmal, KEY SYNC Stimme (zwei Töne nacheinander laufen versetzt).

### Geräte-Abgleich
Entfällt (der microKORG hat keinen Mod-Sequenzer); die Kurven bleiben eK.

### Tests und Dateien
- `dirigent-test/v3-mk6-seq.mjs` (Node, `v3-mk6-seq.out`), `v3-mk6-cpu.mjs` (`v3-mk6-cpu.out`), `v3-mk6-fp.mjs` (Fach-Prüfung, `v3-mk6-fp.out`),
  `v3-mk6-ui.mjs` (Chromium, `v3-mk6-ui.out`), `v3-mk6-pe1.mjs` (`v3-mk6-pe1.out`), Hilfen `v3-mk6-q0.mjs`, `v3-mk6-dbg*.mjs`, `v3-mk6-look0.mjs`.
- Bildschirmfotos `dirigent-test/v3-mk6-shots/`: je Format P1, P2, P3, L1, L2, W, L1-SA, L0-SA, L1-HB: `-seq`, `-seq-eb2`, `-schritte`; dazu `P1-schritte-edit.png`.
- Schnappschuss: `synq-snapshots/MK6.html`.

## MK6-fix — 4 bestätigte Befunde der Abnahme (App bleibt 4.14.0, Format 5, keine Datenbank-Änderung)

### Behoben
1. **● AUFN. endete nie bei LÄNGE 1 oder nach einem abgelaufenen LAUF Einmal** (MK6-09, MK6-14). Worklet:
   - `recMsg` setzt `done` der Timbre- und aller Stimmen-Positionen zurück: während der Aufnahme läuft die Sequenz als Schleife weiter,
     auch nach dem Auslaufen von Einmal (vorher stand die Position auf dem letzten Schritt fest).
   - Neuer Durchlauf-Zähler `MkSqP.wr` (in `sqAdv`, Schleife und Song-Raster). `recStep` endet, wenn ein neuer Durchlauf beginnt
     (`r.H.wr !== r.w`) oder der Schritt kleiner wird. Damit endet die Aufnahme auch bei LÄNGE 1, wo der Schritt immer 1 bleibt.
   - Nachweis: `v3-qa6-acc.mjs` Q9a–e 5/5 (vorher Q9a/b/d FAIL). `v3-qa6-ui.mjs` ONLY=REC 3/3 in Chromium mit dem echten ● AUFN.-Knopf:
     ZIEL 11, SEQ an, CUTOFF zurück auf 40, ein Undo. `v3-vrf-mk6rec.mjs` A, B, B2, C, D enden alle (vorher A, B, B2 hingen).
2. **FP-SONG: Bei KEY SYNC aus folgte die Sequenz dem Transport-Schlag statt dem Song-Schlag** (MK6 Umfang 1, MK6-05).
   - Hauptthread: `mkSongSync()` (neben `songBeatOf`) schickt `{mkSong: {off, prev, wrap}}` an die Engines, nur wenn sich etwas ändert.
     Aufgerufen im Scheduler direkt nach `songTick`, also auch bei ▶ SONG ab Takt n, ⟲-Schleife und Teil-Sprung. Der Scheduler läuft
     voraus, deshalb kommt ein Sprung vor dem hörbaren Zeitpunkt an.
   - Worklet: `sqTick` rechnet Song-Schlag = Transport-Schlag − off (vor `wrap`: − prev), genau wie `songBeatOf`. Einmal wartet vor
     Song-Schlag 0 auf Schritt 1 und hält nach C.
   - Zwischen den Noten läuft das Song-Raster jetzt weiter (`idle(n, fr)` bekommt den Block-Frame). Vorher stand die Position still,
     bis eine Note kam, und der erste Bericht nach einer Note zeigte einen alten Schritt.
   - Nachweis: `v3-fp6q-song.mjs` ab Takt 2 58/58 und ab Takt 4 58/58 auf dem Song-Raster (vorher 0/60 bzw. 0/59).
     `v3-fp6q-loop.mjs` 158/158 (vorher 86/161). `v3-fp6q-indep.mjs` 60/60, 61/61 und 60/60 (vorher 0/60 und 0/61).
     `v3-fp6q-indep2.mjs` (Einmal ab Takt 2) hält ab Song-Schlag 4 auf Schritt 5 (done).
3. **MK6-12 Leistung mit teuren Zielen** (beide Befunde: LFO1/2-FREQ bei LFO KEY SYNC Stimme; EG2 SUSTAIN, RESONANZ, Wellenfolge).
   - LFO-Frequenz als Tabelle `MK_LHZ`/`mkLHz` in 1/16-Einheiten, linear dazwischen. Ganze Werte sind bitgleich zu `MKW.lfoHz`,
     Bruchwerte weichen < 2e-6 relativ ab. Sie gilt nur auf den Seq-Wegen; ohne Seq bleibt alles wie vorher (MK6-10 bitgleich).
   - Die Arbeit je Stimme (Position, Werte, EG-Latch, LFO-Raten `v.qr1`/`v.qr2`) läuft in `sqPreAll`/`sqPre` vor den Stimmen, in einer
     eigenen Funktion. `voice()` liest nur noch `v.qso`/`v.qE1`/`v.qE2`/`v.qr1`/`v.qr2`.
   - SUSTAIN bewegt sich innerhalb der Sustain-Stufe: nur `Ev.s`/`Ev.dT` werden neu gesetzt statt `mkEnvC` (kein exp/log je Block;
     Stufe 3 liest nur `E.s`, der Rest wird an der nächsten Stufe neu gebaut). Ergebnis bitgleich.
   - `Ev` hat jetzt dieselbe Form wie `E1`/`E2`: Das Feld `.on` fällt weg, an seiner Stelle stehen `v.sqO1`/`v.sqO2`.
   - Schrittwerte werden einmal je Änderung in `sqPrep` geklemmt (`q.c`, Float64Array), nicht mehr je Stimme und Block.
   - Nachweis (Node, eigener Prozess je Fall, verschachtelt):
     - `v3-qa6-cpu.mjs`: LFO1+LFO2+RES 0,38 × (vorher 0,78–0,80), LFO1 allein 0,28 (0,80), LFO2 allein 0,29 (0,51), RES 0,22.
     - `v3-fp6q-cpu2.mjs` N=9: egs 0,39 × (vorher 0,62–0,88), wv 0,33 × (vorher 0,65–0,80).
     - `v3-mk6fix-cpu.mjs` (CPU-Uhr, alle Zielsätze, N=5–7): egs 0,32–0,47, egsStufe 0,38–0,41, wv 0,32–0,45, lfo 0,38–0,48,
       cheap 0,16–0,32. „nul“ (alle Werte 0, nur der Mechanismus) kostet 0,22.
     - `v3-mk6-cpu.mjs` (Builder) 0,20 / 0,12 / 0,37.
   - Die Streuung auf der geteilten Maschine liegt bei ±0,1. Der Schätzer „cpu“ aus `v3-rv-mk6cpu-indep.mjs` zählt die ganze
     Prozess-CPU, also auch JIT-Übersetzung, GC-Threads und das Lesen der Datei. Er ist keine Block-Messung und streut stark
     (VA-Stimme 8,7 statt 4,8 ms/s). q25 und das beste Fenster bestehen dort (egs 0,41–0,53, wv 0,32–0,37).
4. **Zusätzlich (gefunden mit `v3-qa6-ui.mjs`, Q-FIRST, scheiterte schon in MK6.html):** Bei der ersten Note nach dem Laden wurden die
   Seq-Werte 5 ms eingeblendet. Ein EG-Ziel rastete dadurch mit fast 0 ein, und SEQ ATTACK +63 wirkte auf diese erste Note nicht.
   `sqPrep` blendet jetzt nur ein, wenn es vorher schon einen Zielsatz gab (`this.sqSig != null`). Q-FIRST besteht: −36,3 dB wie das
   gespeicherte ATTACK 63.

### Regression (alle auf `mk-br-MK6/index.html`)
- Node:
  - `v3-mk6-seq.mjs` alle bestanden, MK6-10 bitgleich gegen 4.12.0 (MK4-fix.html).
  - `v3-mk6-fp.mjs` alle bestanden.
  - `v3-qa6-acc.mjs` 15/16. Q6 scheitert auch in MK6.html: Der Bericht bei t = 0,62 s liegt schon im Schritt ab 0,625 s; die Prüfung
    ist zu grob gerastert und zeigt keinen Fehler.
  - `v3-mk4-fx.mjs`, `v3-mk2-osc.mjs`, `v3-mk1-dsp.mjs`: Die einzigen Ausfälle sind die bekannten Zeitmessungen (Denormale,
    MK1-24). Sie bestehen im zweiten Lauf und scheitern ebenso in MK6.html.
  - `v3-mk3-scale.mjs` bestanden. `v3-mk4fix-kill.mjs` unverändert.
  - `v3-fp6q-bit/ks/rec/rec2/t3.mjs` liefern dieselben Werte wie MK6.html (siehe „Offen“).
- Chromium:
  - `v3-mk6-ui.mjs` 28/28, auch mit den echten Schriften: `v3-mk6fix-ui-font.mjs` lädt `cloudPagesExtras()` mit `fonts/` neben einer
    Kopie in `mk6fix-fonttest/`, alle 5 Schnitte geladen. Damit bestehen M-PLATZ, M-ANSICHT und die Leistungs-Probe „+Seq“
    (fps 59,9, 0 longtasks).
  - `v3-qa6-ui.mjs` alle bestanden.
  - Smoke ohne Fehler (`dirigent-test/v3-mk6fix-smoke.png`).
- Worklet weiter ASCII. Größe +4,1 KB (2 920 943 B).

### Zusammenführen (zusätzlich zu oben)
- Außerhalb der MK-Blöcke berührt:
  - Scheduler (eine Zeile `mkSongSync()` nach `songTick`).
  - `mkSongSync()` neben `songBeatOf`.
  - Prozessor `onMsg` (`m.mkSong` → `this.sqSong`) und Konstruktor (`sqSong`).
  - `MkCore.idle(n, fr)` und die zwei Aufrufer im Prozessor (`idle(CR, f0 + off)`, `idle(N, f0)`).
- Wenn MK5/MK7 `MkCore.idle` oder `MkTim.idle` ändern, muss der zweite Parameter `fr` mitwandern.

### Offen (nicht in der Befundliste, schon in MK6.html genauso; für den Orchestrator)
- `v3-fp6q-rec2.mjs`: KEY SYNC Stimme. Endet die jüngste Stimme mitten in der Aufnahme, springt die Aufnahme auf die Timbre-Position,
  und es bleiben Schritte ungeschrieben (4–6).
- `v3-fp6q-t3.mjs`: Den Wert des laufenden Schritts bei Glatt + CUTOFF ändern (SCHRITTE malen) ergibt M-KLICK 24–27 dB (Stufe ≤ 2,5 dB).
- `v3-fp6q-bit.mjs`: Gegen 4.12.0 weichen „patch 5/7“ auch bei Seq aus ab (max |Δ| 0,21 / 0,89). Ursache wohl vor MK6, gehört in den
  Hauptstrang.
- Hauptstrang (MK1, nicht hier behoben):
  - `voice()` erzeugt auch ohne Seq ≈ 13 MB/s Müll. Gemessen mit `dirigent-test/v3-mk6fix-alloc.mjs`, wahrscheinlich doppelte Werte in
    getaggten Feldern.
  - Ein ruhendes Timbre ruft in `MkTim.idle` je Block zweimal `lfoRate` (Math.pow) auf statt `lfoRateC`.
  - Beides kostet bei jedem AM-Klang.
- Neue Hilfen in `dirigent-test/`: `v3-mk6fix-cpu.mjs`, `v3-mk6fix-alloc.mjs`, `v3-mk6fix-font.mjs`, `v3-mk6fix-ui-font.mjs`,
  `v3-mk6fix-indep-dbg.mjs`, `v3-mk6fix-q6.mjs`.
- Schnappschuss: `synq-snapshots/MK6-fix.html`.

## G-MK6-gruppe-fix (4.14.0, Befunde der Gruppen-QA G-MK6, 26.10.)

Version bleibt 4.14.0 (Fix im Paket MK6), Format 5, keine Server-Änderung. Nur der Seq-Kern im AM-Zweig des Worklets
(`MkSqP`, `MkTim.sqPrep/sqAdv/sqVal/recMsg/recStep`, die zwei `recStep`-Aufrufe in `idle`/`block`) ist geändert. Größe +2,4 KB
(2 923 384 B), Worklet weiter ASCII, Markenwort-Prüfung unverändert (1 × `MS 2000`).

### Behoben
1. **● AUFN. endete nach 1–3 Schritten bei abgesetzten Noten (KEY SYNC Timbre/Stimme).** Eine neue Note nach „alle los“ setzte
   die Position auf Schritt 1 zurück, `recStep` las das als Ende der Aufnahme.
   - Neu: Bei KEY SYNC Timbre und Stimme hat die Aufnahme eine eigene Position. Sie startet beim laufenden Schritt (Index wie bisher,
     in der Vorwärts-Folge) und läuft vorwärts als Schleife bis LETZTER SCHRITT, unabhängig von Key-Sync-Neustarts (Umfang 4,
     MK6-09/-14). KEY SYNC aus bleibt auf Timbre- bzw. Song-Raster-Position.
   - Damit ist auch der offene Punkt `v3-fp6q-rec2.mjs` behoben (jüngste Stimme endet mitten in der Aufnahme: jetzt keine Lücken).
   - Nachweis: `v3-qa-gmk6-rec2.mjs` 3/3 (Timbre und Stimme staccato: Schritte 2–16), `v3-qa-gmk6-rec.mjs` 4/4 im Song (Bass
     Timbre/Stimme: 1–16, keine Lücken), `v3-repro-mk6-recks.mjs` (staccato Timbre/Stimme 1–16 in ≈ 2 s statt 1–2 in 0,18 s),
     `v3-repro-mk6-recks2.mjs` (Touch: nach 1 s läuft die Aufnahme noch, Ende „Schritte 1–16“), `v3-fp6q-rec2.mjs` (keine Lücke).
2. **Glatt sprang ohne Rampe bei TYP, LÄNGE, KEY SYNC, AUFLÖSUNG während einer Note.**
   - Neu: Springt die Glatt-Linie (Positionssprung durch eine Einstellung, Key-Sync-Neustart bei klingenden Stimmen, Song-Sprung bei
     KEY SYNC aus), gleitet der Wert vom letzten Wert mit τ = 5 ms zur neuen Linie (B.6 Nr. 2). Ohne Sprung bleibt die Linie exakt
     linear (MK6-02, MK6-10 bitgleich).
   - KEY SYNC Timbre ↔ Stimme bei klingender Note: Die Stimmen laufen an ihrer bisherigen Position (und mit ihren Werten) weiter,
     kein Sprung. (Bei Stimme → Timbre übernimmt die Timbre-Position die der jüngsten Stimme.)
   - Gain-Tap (`v3-qa-gmk6-gain.mjs`): TYP 6,2 ms, LÄNGE 5,7 ms, AUFLÖSUNG 6,4 ms (vorher je 0,3 ms), KEY SYNC → Stimme ohne Sprung
     (vorher 0,53 → 0,06 in 0,3 ms). Bezug Regler-Änderung 5,8 ms.
3. **Undo/Redo und Malen des laufenden Schritts in Glatt sprangen hart.** Dieselbe Gleit-Regel greift bei jeder Wert-Änderung
   (`sqPrep` zählt Änderungen, `sqVal` gleitet ab dem letzten Wert).
   - Gain-Tap: ↶ 7,1 ms, ↷ 5,7 ms, Malen 6,6 ms (vorher je 0,32 ms); Bezug Regler-↶ 7,1 ms.
   - Spur-Ausgang, HF-Burst gegen den lauteren stehenden Pegel (`v3-repro-gmk6-undoglatt.mjs`, Cutoff 64, Touch): ↶ +2,7 dB, ↷ +0,9 dB
     (vorher +32,6 / +36,2), Malen über den laufenden Schritt +2,5–2,7 dB (vorher +31), Ziehen 4,4–4,7 dB (vorher 14); Bezug Regler-↶ 2,0 dB.
   - Damit ist auch der offene Punkt `v3-fp6q-t3.mjs` behoben: Glatt CUTOFF −4,7…−5,5 dB, Glatt A-PEGEL −1,1 dB (vorher 24–27 / 6,3 dB).
   - Ein Wechsel BEWEGUNG Glatt → Stufe rampt ab dem Glatt-Wert (1 ms) statt zu springen.

### Messhinweis (für die Abnahme)
- `v3-qa-gmk6-click.mjs` misst M-KLICK gegen den Median ±20 ms. Ein großer CUTOFF-Wechsel öffnet die Höhen in wenigen ms; das wertet
  dieses Maß auch beim gewöhnlichen Regler (5-ms-Glättung) als Knack: „Stored knob change under a seq (CUTOFF 40 → 90)“ 27–29 dB.
  Glatt-CUTOFF-Fälle (TYP 38,8 dB) liegen deshalb dort weiter über 6 dB, obwohl sie jetzt wie der Regler gleiten.
- `dirigent-test/v3-gmk6g-click.mjs` (Kopie mit HF-Burst gegen den lauteren stehenden Pegel, wie im Befund 3): alle Glatt-Fälle
  ≤ 6 dB (TYP CUTOFF 10,8 dB bei 11,1 dB Eigen-Schwankung der laufenden CUTOFF-Rampe ohne Änderung). Die verbleibenden Ausfälle
  dort sind Stufe (1-ms-Rampe nach B.6 Nr. 2 b, gewollt) und M-EINBRUCH bei echten Pegel-Änderungen (LÄNGE 16 → 4 macht die
  Sequenz leiser; ebenso der Bezug „AMP PEGEL 127 → 60“).

### Regression (alle auf `mk-br-MK6/index.html`)
- Node: `v3-mk6-seq.mjs` 36/36 (MK6-09 Start bei Schritt 3, MK6-10 bitgleich gegen MK4-fix), `v3-mk6-fp.mjs` 16/16,
  `v3-qa6-acc.mjs` 14/15 (Q6 wie bisher, siehe oben), `v3-fp6q-ks.mjs` alle 0 dB (vorher Stufe Timbre → Stimme −5,1 dB),
  `v3-fp6q-rec.mjs` unverändert, `v3-fp6q-bit.mjs` gleich wie MK6-fix.
- Neu `dirigent-test/v3-gmk6g-bit.mjs`: 26 Seq-Läufe (KEY SYNC 0/1/2 × Glatt/Stufe × 4 TYPEN, Einmal, Schrittlänge, Akkord + Pause)
  bitgleich zu MK6-fix (`dirigent-test/v3-gmk6g-base.html`).
- `v3-mk6-cpu.mjs` (MK6-12) besteht: 0,26–0,36 / 0,14–0,21 / 0,42–0,46 × VA-Stimme (MK6-fix im selben Lauf 0,35 / 0,14 / 0,46).
- Chromium: `v3-fp6q-song.mjs` (FP-SONG) wie vorher; `v3-mk6fix-ui-font.mjs` mit den echten Schriften (`mk6fix-fonttest/`)
  28/28 inkl. M-PLATZ/M-ANSICHT und Probe „+Seq“ (fps 60,2, 0 longtasks); `v3-qa6-ui.mjs` bestanden; `v3-qa-gmk6-undo.mjs` 7/7;
  Smoke ohne Fehler (`dirigent-test/v3-gmk6g-smoke.png`).
- Hinweis Testumgebung: `/opt/pw-browsers/chromium-1194` gibt es auf dieser Maschine nicht; alle Läufe nutzen wie bisher
  `chromium-1243`.

### Offen (nicht behoben, für den Orchestrator)
- KEY SYNC Stimme → Timbre bei mehreren klingenden Stimmen an verschiedenen Positionen: die älteren Stimmen springen auf die Position
  der jüngsten (eine geteilte Position kann nicht je Stimme gleiten). Selten (Einstellung während eines Akkords).
- Stufe-Sprünge (Malen, Undo, TYP) bleiben bei 1-ms-Rampe nach B.6 Nr. 2 b; bei CUTOFF/AMP großer Hub hörbar hart, aber so verlangt.
- `v3-fp6q-bit.mjs` „patch 5/7“ und die Hauptstrang-Punkte (MK1) wie oben.
- Schnappschuss: `synq-snapshots/G-MK6-gruppe-fix.html`.
