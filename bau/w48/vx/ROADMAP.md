# ROADMAP – alles Offene in Xanders Apps (Stand 23.11.2026)

Grundlage: Synquenzer **4.85.0** (main 14f0459, 23.11.2026), Zweig `arbeitsstand` (bba9d5b, 23.11. 14:31 UTC),
Übersicht `uebersicht/apps.json` (Stand 23.11.), `spec/` (v3, Nachtrag 2 Teil E, Nachträge 5/8, `xander-liste-0711.md`,
`roadmap-nachtrag-5-entwurf.md`), Bau-Notizen `bau/w45/vx/*/NOTES.md|KURZ.md`, `bau/STAND.md`, `bau/HELFER.md`;
für „Deutsch mit Xander“ `MODULE-PLAN.md` und `KLASSENZIMMER-LISTE.md` (nur gelesen).
Abgehakt (nicht mehr aufgeführt): alles, was in `bau/CHANGES-V3.md` bis 4.85.0 steht – u. a. V0a–V0d, V4a/b/f/c, VO1, VO2,
VS0–VS5b, V2a–V2f, V2c′, Video (VV1–VV4, Regie, Klavier, Mäusekino), Gesang G1–G9, S0–S2, Mix & Master, North, Bit Mask,
Spektral, Import, DAW-Projekt, 16 Spuren, Arpeggiator, Klangschule, Klang erkennen, Gesang-Auftakt, Retro- und Kompakt-Platte,
Video-Takt im Projekt. Die in `bau/STAND.md` genannten Bauten ENT1A–D, KMP1, MLG3, VL3 sind in 4.84/4.85 ausgeliefert.

**Legende** · Größe **S** ≤ 2 h · **M** ½–1 Tag · **L** mehrere Tage · **Xander:** „—“ = nichts nötig, sonst „wartet auf Xander: …“
· **Sichtbar:** „nein“ = darf sofort gebaut werden; „ja → Funk“ = ändert Aussehen/Bedienung, laut Regel 3 erst im Funk vorschlagen.

---

## Die nächsten 10 – sofort baubar, ohne Xander (unsichtbar), nach seiner Rangfolge

Rang (1) schnelle Seite, flüssiger Chat, stabile Verbindung → (2) Ladezeiten → (3) Spiel-Logik/Spielgefühl → (4) Profi-Techniken.

| # | Rang | App | Was | Größe | Quelle |
|---|---|---|---|---|---|
| 1 | (1) | Deutsch mit Xander | **Schritt 7 „Klassenzimmer A“:** `livechat.js` 1:1 als Modul (gleicher Code, Brücke), davor Schritt 6 `spiel.js → src/spiel/`; Voraussetzung Schritt 5 ist mit Fassung 888 erfüllt. | M | `MODULE-PLAN.md` §4 |
| 2 | (1) | Deutsch mit Xander | **Schritt 8 „Klassenzimmer B“:** Raum-Code (lc/livechat/kz) in dünnen Scheiben nach `src/raum/` – kein `eval` und kein synchrones Nachladen mehr im Raum (laut Plan der zweite spürbare Gewinn im Chat). | L | `MODULE-PLAN.md` §4 |
| 3 | (1) | Synquenzer | **Erster Ton nach dem Laden nie mehr still:** laufende Stimmen im Worklet nachfüttern, sobald das Audio aus dem Gerätespeicher da ist (heute fehlt der Ton in den ersten Zehntelsekunden). | M | `vx/spk7` Offen 2, `vx/spkfix` Offen 5 |
| 4 | (1) | Synquenzer | **Spektral: Fokus umschalten ohne Ruckler** (> 50 ms Long Task beim Vollbild mit Tönung) – Tönung in eine eigene, kleinere Textur. | M | `vx/lt2` Offen |
| 5 | (1) | Synquenzer | **Zerlegen bitgleich schneller:** Rand-Rahmen auch im Tiefband weiterreichen (≈ 100 ms je 3 min), zPrep ohne log10 (≈ 200 ms), nach Noten-Änderung nur die geänderten Streifen neu rechnen. | M | `vx/zrl2` Offen 1, `vx/spkfix` Offen 1 |
| 6 | (2) | Synquenzer | **Auslieferung schlanker:** die `text/plain`-Blöcke (`sq-spk-src`, `sq-mk-src`, `sq-g9-src` …) beim Ausliefern wie Skripte entschlacken (≈ −52 KB + ≈ −20 KB gzip), Worklet-Vorlagen neu escapen (≈ −2 KB). | S–M | `vx/perf2` Offen/Folgen 1–2, `vx/komm` Offen 1 |
| 7 | (2) | Deutsch mit Xander | **„Runde starten“ ohne den ganzen Wortschatz:** Wort-Niveau je Aufgabe beim Bau vorberechnen (mit Gleichlauf-Prüfer) – 3G −11 s, 4G −1,7 s beim Tipp; löst auch den Karten-Tipp auf 3G (+1,3 s). | M | `MODULE-PLAN.md` M3 „Offen/Vorschläge“ 1–2 |
| 8 | (2) | Deutsch mit Xander | **Schritte 10–11:** Startpfad (core, quiz, backend … 1:1) und Rest von `app.js` als Module; Update lädt danach nur noch echte Änderungen (heute ≈ 1 MB je Fassung). | L | `MODULE-PLAN.md` §4 |
| 9 | (3) | Synquenzer | **Arp- und Lauf-Feinheiten:** Key Sync „aus“ zählt in 3/4 und 6/8 richtig (heute fest 4 Schläge); nach „Arp aus“ klingen gehaltene Töne sofort; ◆-Morph trifft während einer Lektion nicht mehr die Lektionsspur; Band-Drumziel mitten im Lauf ohne doppelte HH; erste Note an der Clip-Schleifengrenze in richtiger Reihenfolge. | M | `vx/arp1` Grenzen, `vx/ks` Offen, `vx/mtx3c` Offen, `vx/nst1` Grenzen |
| 10 | (3) | Synquenzer | **Gesang sitzt genauer:** Gleiten mit Vibrato vor der Stufensuche glätten, Konsonant-Anlauf auch über 1–2 stimmhafte Einschwing-Rahmen, Anlauf lagefest statt im 10-ms-Raster, Marken nur bei echtem Einsatz (weniger Übersegmentierung). | M–L | `vx/spk9`, `vx/vx2`, `vx/vxr2`, `vx/real` |

Danach Rang (4) Profi-Techniken: Spektral „genau fertig“ über einen zweiten Worker bzw. `texSubImage2D` in die vorhandene
Textur (`vx/fok3`), Zeichnen im Worker mit OffscreenCanvas (`vx/lt2`), Real-FFT/Radix-4 (kleine Ergebnis-Änderung → erst
Freigabe, `vx/zrl1`/`zrl2`), WebGPU für die KI-Trennung (nur auf dem Gerät messbar, `vx/ki`).

---

## Synquenzer (4.85.0)

### A. Aus der Übersicht („brauche“)
- **Synth-Klänge aus der DAW mit allen Effekten genau ausmessen** – Hall, Echo und Effekt-Ketten der DAW-Spuren klanggleich übernehmen.
  Quelle: `uebersicht/apps.json` brauche 1 · M · **wartet auf Xander: Fotos seiner Effekt-Listen in der DAW** · Sichtbar: nein.
- **Song als DAW-Projekt (.cbp) speichern** – Export zurück in die DAW, mit Automation.
  Quelle: `apps.json` brauche 2 · L · **wartet auf Xander: kleine .cbp mit einer Automations-Kurve** · Sichtbar: ja → Funk (neuer Export-Eintrag).

### B. Offen aus den Bau-Notizen – unsichtbar, sofort baubar
- Erster Ton nach dem Laden nicht still (Top 3). Quelle `vx/spk7`, `vx/spkfix` · M · — · nein.
- Spektral-Fokus ohne Long Task (Top 4). `vx/lt2` · M · — · nein.
- Zerlegen bitgleich schneller, nur geänderte Streifen neu rechnen (Top 5). `vx/zrl2`, `vx/spkfix` · M · — · nein.
- Auslieferung: Kommentare aus `text/plain`- und Worklet-Blöcken (Top 6). `vx/perf2`, `vx/komm` · S–M · — · nein.
- Arp-/Lauf-Feinheiten (Top 9). `vx/arp1`, `vx/ks`, `vx/mtx3c`, `vx/nst1` · M · — · nein.
- Gesang-Erkennung und Gesang-Editor genauer (Top 10). `vx/spk9`, `vx/vx2`, `vx/vxr2`, `vx/real` · M–L · — · nein.
- **Gesang reinigen besser:** Plopps (Ziel ≥ 9/10, heute 8/10), Klicks in lauten tiefen Vokalen (17/20, puls-synchroner Vergleich), Raumton-Farbe in langen Lücken. `vx/voxr1c`, `voxr1d`, `voxr1f` · M · — · nein.
- **Drum-Erkennung im Zerlegen:** Kick/Snare-Vorlagen aus dem Lied selbst lernen (heute 26 Zusatz-Kicks, Snare 42/64). `vx/spk11`, `vx/imp2b` · M · — · nein.
- **Spektral „Verfeinern“** verbessert Bass/Drums im Demo-Song noch nicht (Kick-Erkennung über Anschläge im Takt-Raster). `vx/spk` Offen 1 · M · — · nein.
- **Chor-Stimmen:** Formant-Abweichung bei großen Verschiebungen (6–9 %) – erst Ziele/Maße neu festlegen, dann Kern-Hülle. `vx/chr5` · M · — · nein.
- **Klang erkennen genauer:** Welle aus dem Anschlag schätzen, bevor der Filter zugeht; Gewissheit nach ECE eichen. `vx/ke1` Nächste Schritte · M · — · nein.
- **DAW-Import Kleinigkeiten:** zwei gleichzeitige Schläge auf dasselbe Pad = lauter wie in der DAW (36 Clap-Schläge); Delay je Spur statt ein Echo für alle; Import-Bericht beschreibt den übernommenen Klang. `vx/cmd2`, `vx/mlg2` · S–M · — · nein (Bericht: nur Text).
- **Import ohne digitale Stille vorn:** Stück-Wahl unabhängig vom Raster. `vx/vxr2` Offen 6 · M · — · nein.
- **Transponieren „Stufen-Teil“:** Song-Aufnahme, gehaltene Noten an der Teil-Grenze und Konsolidieren behalten `trs`. `vx/trp1` Offen · M · — · nein.
- **Filter je Note auch für Bit Mask** (Cutoff-Platz je Stimme im Bit-Mask-Kern). `vx/lage1` Offen · M · — · nein.
- **Import-Dehnen:** Audio passend dehnen, wenn das Projekt schon Audio hat und das Tempo abweicht; echte MP3 mit schwankendem Tempo. `vx/imp` Offen, `vx/nach` · M · — · nein.

### C. Gebaut oder skizziert, aber sichtbar – erst im Funk vorschlagen
- **Eigene Klangkorn-Seite im Klang-Editor** (heute zeigt er die Wavetable-Seite). `vx/spk7` Offen 1 · M · Xander: Ja nötig · ja → Funk.
- **Knopf „Als Klangkorn“** als 3. Zeile im Aktionsfeld (fertig hinter `SPK7_ROW = false`). `vx/spk7` Offen 5 · S · Ja nötig · ja → Funk.
- **Eigene Farben für die Spuren 9–16** (heute wiederholen sie 1–8). `vx/xlb` Offen 1 · S · Ja nötig · ja → Funk.
- **Mehr als 16 Spuren (bis 24) / 32 Szenen live** – erst nach Messung am iPhone (`messung.html`). `vx/xlb` Offen 2 · M · **wartet auf Xander: iPhone-Messung** · ja → Funk.
- **Szenen-Namen im Matrix-Kopf** (klein unter der Nummer). `vx/imp2b` B6 · S · Ja nötig · ja → Funk.
- **Quer besser erreichbar:** „Szenen anlegen …“ und „Klang nachbauen“ weiter oben. `vx/imp2b` B13 · S · Ja nötig · ja → Funk.
- **Loop-Zeile quer:** nur den Teil-Namen zeigen statt „Lo…“. `vx/teil1` Offen · S · Ja nötig · ja → Funk.
- **Gesang reinigen:** Regler 0–100 % als Gesamtstärke, dazu 1–2 Regler je Schritt. `vx/voxr1` Offen · M · Ja nötig · ja → Funk.
- **Transponieren:** Kennzeichen „nur“ für Teile in der Taktleiste. `vx/trp1` Offen · S · Ja nötig · ja → Funk.
- **Drum-Schritt-Editor der Einzelspur** mit FOLGEN, Locks und Länge je Spur. `vx/mtx3c` Offen · M · Ja nötig · ja → Funk.
- **Arp Gate über 100 % (Legato-Arp).** `vx/arp1` Grenzen · S–M · Ja nötig · ja → Funk (Reglerbereich).
- **Klangschul-Regler modulierbar/lockbar:** TAKT, LFO-Raster, Filter 2, Tonh.-Hk. als Mod-Ziel und Lock; LFO-Vorschau zeigt das Raster. `vx/ks` Offen · M · Ja nötig · ja → Funk.
- **Import-Blatt:** „Beginnt bei Takt 1“, Gesang an den Songteilen teilen, Tempo aus MIDI, leeres Projekt + [Neues Projekt dafür]. `vx/chorb` (Konzept D.3) · M · Ja nötig · ja → Funk.
- **Loop → Matrix (Audio)** wählt die Audio-Spur statt immer der ersten. `vx/spk11` B11 · S · Ja nötig · ja → Funk.

### D. Geplante große Pakete, noch nicht gebaut (Spec + Xanders Listen)
- **VO3 Anwesenheit („René ist da“) und Sounds im Raum** – Verbindung zu den anderen (Rang 1). Nachtrag 2 G.5, Gruppe 18 · L · **wartet auf Xander: Okay je Online-Schritt (G.8)**; Bau mit Online „aus“ geht vorher · ja → Funk.
- **VO4a–c gleichzeitig am selben Song** (jede Speicherung eine Version, nie still überschreiben, Übernehmen mit A/B). Nachtrag 2 G.6 · L · wartet auf Xander: Online-Okay · ja → Funk.
- **VC3/VC3b zwei Geräte live, Jam, Fern-Einspielen.** Nachtrag 2 G.7, Gruppe 19 · L · wartet auf Xander: Online-Okay · ja → Funk.
- **VC4 KI-Helfer.** Nachtrag 2 E.0/F.2 · M · **wartet auf Xander: Antwort auf F.2 VC4 (Tor, ohne Ja kein Bau)** · ja.
- **VS6 Beatbox → Drums** (+ VS7 optional). Nachtrag 2 E.1 Gruppe 8 · M · — · ja → Funk.
- **Aufbau-Video im Zeitraffer wie Procreate** (VC2b/VC2c; „Making-of“ 4.48 ist nur ein geraffter Vorlauf). Nachtrag 2 E.1 Gruppe 19, Roadmap-Entwurf N5 „VV4“ · M · — · ja → Funk.
- **Additiv und KLANGKÖRPER (V9a/V9b).** Nachtrag 2 Gruppe 13 · L · — · ja → Funk.
- **Eigene FM-Wellen zeichnen (V4e).** Nachtrag 2 Gruppe 13 · M · — · ja → Funk.
- **Klassiker-Bausteine VK/VK2** (Phaser, Flanger, Hochpass, Bitcrusher als eigene Bausteine; Teile stehen schon im Code – erst prüfen). Nachtrag 2 Gruppe 12 · M · — · ja → Funk.
- **Mod-Stränge V5a–d** (jeder Regler modulierbar, Bitwig-Wunsch; Locks und Mod-Übersicht gibt es schon). Nachtrag 2 Gruppe 10 · L · — · ja → Funk.
- **Resynthese-Rest V9d′/V9e** („verwandeln“, Naturklänge mit Ampel; Klang nachbauen/Klangkorn/Klang erkennen sind da). Nachtrag 2 Teil I · L · — · ja → Funk.
- **Bibliothek V10P + V10a–f:** 45 Vorbild-Sounds, Lieblinge zuerst, mit Hörproben, Industrial/EBM-Bassmuster, 10 Genre-Demos. Nachtrag 2 Teil D, Gruppen 15–16 · L · **wartet auf Xander: Hörproben-Dateien/Hörtest PO-1 (D.4, D.8); Tor PR-V** · ja → Funk.
- **Instrument-Vorlagen VI1a–VI3** (Moog-, Prophet-, Synthex-, Juno-, Oberheim-, Jupiter-, PPG-, K1-, Sampler-Charakter; Retro, Kompakt und MS 2000 sind da). Nachtrag 2 D.9, Gruppe 17 · L · — · ja → Funk.
- **MS 2000: DWGS-Wellen aus Xanders eigenen Samples.** Nachtrag 2 „Nachtrag zur Reihenfolge“ 24.10. · M · **wartet auf Xander: Samples (Filter offen, OSC 2 aus, Effekte aus, mehrere Oktaven)** · nein (Klang).
- **Songwriting-Helfer aus der Liste 07.11.:** Variationen per Knopfdruck (Refrain 2 ≠ Refrain 1), A/B-Vergleich von Songteilen, Arrangement-Assistent mit Spannungsbogen (Dichte, Spuren, Lautstärke je Takt). `spec/xander-liste-0711.md` D 4/6/8 · je M–L · — · ja → Funk.
- **Tipp-Summen (I4)** – in CHANGES nicht gefunden, erst prüfen; die Extras warten auf Xanders Wort. Nachtrag 8 · M · wartet auf Xander: Extras · ja.
- **Lip-Sync-Video (Song + Foto an Hedra/Kling).** `xander-liste-0711.md` E 14 · M · **wartet auf Xander: Dienst und Zugang (nur mit Schnittstelle)** · ja.

---

## Mischpult (0.2)
- Keine offenen Punkte in Übersicht und Notizen gefunden.

## The Wall – Ablage (v11)
- **Master-Presets aus Xanders Beispiel-Preset.** Quelle `apps.json` in_arbeit/brauche · M · **wartet auf Xander: Preset aus seinem Master-Effekt (Presets › Save › Share › Ton-Post)** · ja (neue Preset-Liste, von Xander gewünscht).

## Meine Songs
- **The Wall v11 eintragen** – v11 ist seit 22./23.11. fertig (main c6be1eb), steht in der Übersicht aber noch als „in Arbeit“. `apps.json` in_arbeit · S · — · ja (neuer Eintrag, bereits zugesagt).
- **Instrumental-Master eintragen**, sobald er fertig ist. `apps.json` in_arbeit · S · wartet auf den fertigen Master · ja (zugesagt).
- **„So schön ist die Weihnacht“ mastern.** `apps.json` brauche · M · **wartet auf Xander: Spuren trocken über die Ton-Post + Cubasis-Datei (.cbp)** · ja (neuer Song).

## Mein Vorteil (Fassung 13)
- **Push-Link bei schwachem Netz öffnet nicht mehr die Synquenzer-Kopie** (Ein-Zeilen-Lösung im Synquenzer-Worker: nur `''`/`index.html` als Seite behandeln) – Rang (1) stabile Verbindung. `mein-vorteil/README.md` „Bleibt offen“ · S · **wartet auf Xander: OK** · nein.
- **Preis-Daten ergänzen:** `standardMl` für Ben & Jerry's, Supermarktcheck-ID für Haribo Colorado (erst prüfen, ob im Zweig `mv-preise` schon erledigt). `schnaeppchen/PREISKONTEXT-ENTWURF.md` · S · — · nein.

## Atem (0.2.2)
- **Einzählen 3-2-1 behalten oder ändern.** `apps.json` brauche · S · **wartet auf Xander: kurze Antwort** · ja.

## Bildwerk (0.5.0) · Wie ich ticke (0.2.1) · Kaninchenbau (0.2.1) · Ton-Post
- Keine offenen Punkte in Übersicht und Notizen gefunden.

## TikTok-Ideenbuch
- **Neue Ideen aus dem Chat laufend eintragen.** `apps.json` in_arbeit · S (laufend) · wartet auf neue Ideen von Xander · ja (Inhalt).

## Feinschliff (0.6.0)
- **Nächste Runde, sobald neue Wünsche da sind.** `apps.json` in_arbeit · M · wartet auf Xander: neue Wünsche · offen.

## Deutsch mit Xander (Fassung 888)
Eigene Werkstatt und Sonden; diese Liste nur zur Übersicht (Quelle `MODULE-PLAN.md`, Stand 888 = M1–M5 gebaut).
- **Schritt 6 `spiel.js → src/spiel/`** (Raum-Takt-Kern + Inhalte als dynamische Stücke). §4 · M · — · nein. (Top 1)
- **Schritt 7 Klassenzimmer A: `livechat.js` als Modul.** §4 · M · — · nein. (Top 1)
- **Schritt 8 Klassenzimmer B: Raum-Code nach `src/raum/`, kein `eval`/synchrones Nachladen.** §4 · L · — · nein. (Top 2)
- **Schritt 9 Klassenzimmer C: Chat-Effekte als eigene dynamische Stücke.** §4 · M · — · nein.
- **Schritte 10–11 Startpfad und Rest als Module, `min/` stilllegen.** §4 · L · — · nein. (Top 8)
- **Schritt 12 Brücke abbauen.** §4 · M · — · nein.
- **„Runde starten“ ohne ganzen Wortschatz (Niveau vorberechnen).** M3 Offen 1–2 · M · — · nein. (Top 7)
- **Vor der nächsten Auslieferung nachholen:** 4G-A/A-Messung des Stands und Vergleichslauf gegen d9637a22; Sonden 833/817/809 wiederholen, alte Stadt-`.min.js` löschen. M4/M5 „Offen“ · S–M · — · nein.
- **Kritisches CSS nach Bereichen** (vorher Pixelvergleich je Ansicht). §4 „parallel“ · M · — · nein.
- **Platz auf Pages fast voll (≈ 954 von 1 000 MB):** `werkzeug/backup` (234 MB) aus der Veröffentlichung nehmen. §6 Nr. 6, M3 Offen 3 · S · **wartet auf Xander: Ja** · nein. **Dringend.**
- **Vorschläge §6 (brauchen Xanders Ja):** ältere Chatzeilen erst beim Hochrollen laden · Deko-Animationen im Klassenzimmer pausieren · halb so große Auto-Blätter für Telefone · keine Vollbild-Unschärfe auf schwachen Geräten · Sprechring mit Mindesthaltezeit. §6 Nr. 1–5 · je S–M · **wartet auf Xander: Ja** · teils ja → Funk.
