# CHANGES MK8: Programm-Speicher A–H × 16 mit eigenen Werksklängen (App 4.17.0)

Zweig-Kopie `scratchpad/mk-br-MK8/index.html`, gebaut auf 4.15.0 (MK0–MK7, 3 017 704 B). Vorgänger für alle
„bitgleich/unverändert“-Prüfungen: **4.15.0** (`dirigent-test/v3-mk8-base-4150.html`). Snapshot `synq-snapshots/MK8.html`.
Weg nach Teil G Nr. 18 **„Kommt MK8 zuerst“**: Programm-Wahl über Bibliothek (Bank ▾) und ‹ › im Blattkopf, das alte Bedienfeld
bekam keine neuen Teile. Für MK-P gibt es das API-Objekt `window.mkProg`.

## Gebaut

- **128 Plätze A01–H16** (Umfang 1–3): 127 eigene Programme + H16 = INIT MS 2000 (derselbe Eintrag `f-init-am`). Ordnung je
  Platz nach der Rollen-Tabelle (A–G: 01 hart, 02 Arp, 03 Fläche, 04 Bass, 05 Lead, 06 Sequenz, 07 Glocke/Perkussion,
  08 Tasten, 09 Bass, 10 Bewegung, 11 Streicher/Chor, 12 Lead, 13 Bläser/weich, 14 Wellen-Sequenz, 15 Bass, 16 Effekt;
  H01–H08 nach den Rollen, H02/H07 Effekt, H09–H14 Vocoder, H15 Eingang, H16 INIT). Bänke mit eigenem Charakter:
  A klassisch warm, B hell/gläsern (Ring, Sync, Sinus×), C dunkel/resonant, D Wellen (Speicherwellen, Stimmwelle),
  E Bewegung (LFO, Mod-Seq), F Schichten (Dual/Split), G Raum (Phaser, Echo, Ensemble), H gemischt + Vocoder.
- **Vocoder H09–H14** mit `hold`-Spektren aus den eigenen Vokalen a/e/i/o/u (Vokal-Quelle W-44 aus MK7 als Modulator,
  gemessen von der Analyse des App-Worklets über `E.mkHoldGet` im OfflineAudioContext, `dirigent-test/v3-mk8-hold.mjs`).
  Alle DIREKT 0, HPF-PEGEL 0. Sie klingen ohne Mikrofon (live geprüft).
- **Daten** (Umfang 4, EN3-14): Block `/*MKF{*/ SQ_MK_FACTORY /*}MKF*/` im nachgeladenen `sq-mk-src`; je Programm nur die
  geänderten Felder gegen INIT (Lücke + Zickzack-Wert als Varint, feste Feld-Reihenfolge = INIT-Baum), je Bank ein
  Base64-Teil mit Salz-Byte (Bau-Skript prüft die Markenwort-Regel B.6 Nr. 9 und wechselt das Salz). Namen und ⓘ-Texte als
  Klartext. Entpackt wird je Bank beim ersten Bedarf, vorher `tickAhead(.3)`. Bau: `dirigent-test/v3-mk8-bau.mjs`
  (Rezepte `v3-mk8-rezepte.mjs` + Kalibrierung `v3-mk8-cal.json` → Block).
- **Felder `bank`/`slot`** (1…8, 1…16): `normalizeSound` behält sie nur bei Engine `mk` mit gültigen Werten; nicht im
  `soundHash`. Nur Bibliotheks-Einträge tragen einen Platz (Spur-Kopien nicht: `soundCopy` und `saveSound` entfernen ihn).
  `Library.save(overwrite)` behält den Platz, `duplicate` nimmt ihn nicht mit, `importMany`/`restore` lassen ihn weg,
  wenn der Platz inzwischen belegt ist; neu `Library.put(id, rec|null)` für das Undo. Kein neues Format.
- **Programm-Speicher** (Umfang 5–6, Modul `MKF` im Block): Platz = eigener Klang mit diesem `bank`/`slot`, sonst
  Werksklang. Laden = ein Undo + Toast [Rückgängig] + LCD „A01:Name“; ‹ › im Blattkopf einer MS-2000-Spur = Programm −/+
  (A01 … H16, bleibt an den Enden stehen, LCD „Anfang · A01“ / „Ende · H16“). H15 zeigt „Eingang wählen: GLOBAL 1A“.
- **Sichern = WRITE** bei MS-2000-Spuren: Platzwahl (Bank A–H, Platz 1–16; Vorgabe = zuletzt geladenes Programm), Infozeile
  („Werksklang „X“ wird überdeckt“ bzw. „trägt „Y“ – er bleibt in Eigene“), Name, [Auf A01 schreiben], [Ohne Platz]
  (wie bisher Eigene), [Überschreiben] (eigener Klang), [Werksklang zurück] (wenn der Platz einen eigenen Klang trägt).
  Ein älterer eigener Klang auf dem Platz verliert nur `bank`/`slot`. WRITE und WERKSKLANG ZURÜCK sind je **ein** Undo
  (Gruppe aus Bibliotheks-Einträgen `mkslot` + Spur-Klang), Undo/Redo deep-equal.
- **Bibliothek** (Umfang 7): im Filter „MS 2000“ der Chip **„Bank ▾“** (A–H, „Alle MS 2000“). Bank X = genau die 16 Plätze
  in Reihenfolge (eigener Klang statt Werksklang, Zeile „B05 · eigener Klang“), Werkszeilen „C04 · Bass“. Eine Spur mit
  einem Programm öffnet ihre Bank. Rollen-Chips wie bisher (Rollen nach EN-18 je Platz). ⋯ eines eigenen Platz-Klangs:
  „Werksklang zurück“. ▶ Vorhören: Arp-Programme spielen einen gehaltenen Akkord durch das Arp-Muster des Programms
  (der Arp-Kern läuft sonst nur für Spuren), Sequenz-Programme gehaltene Akkorde (damit KEY SYNC die Folge laufen lässt).
  Filter „MS 2000“ und „Alle Engines“ werten den Block aus (EN3-14).
- **API für MK-P:** `window.mkProg = {select(bank, slot), step(dir), bank(dir), write(bank, slot, name?), restore(bank, slot),
  current()}` auf die gewählte Spur (`R.selT`); `current()` → `{bank, slot, label: 'A01', name, text: 'A01:Name', own, edited}`.
  `bank(dir)` stellt nur die Bank (LCD; `bank(0)` liest sie), SELECT n lädt dann über `select(bank, n)` (wie am Gerät, HB-MS S. 13).
- Hilfe-Zeile „Programm-Speicher“, Version **4.17.0**. `mkRender`-Ereignisse nehmen als 6. Element die Timbre-Maske (Test-API,
  für den Arp-Ziel-Timbre im Pegel-Lauf).

## Abnahme MK8 (Chromium 1243, `dirigent-test/`)

| ID | Ergebnis |
|---|---|
| MK8-01 | ✓ 128 Plätze je Name ≤ 12, Rolle, Bank, Platz, ⓘ; Entpacken = Rezept deep-equal (128); jedes Programm lädt über `mkProg.select` und über die Bibliothek mit je einem Undo, Undo deep-equal; `bank`/`slot` überstehen Speichern → Laden (Projektdatei in eine frische Seite importiert) |
| MK8-02 | ✓ E9/A.4/A.13-Liste auf ganzen Wörtern (Namen und ⓘ) 0; Levenshtein gegen 256 Werksnamen beider Handbücher (nur aus `manuals/werksnamen.local.json`, erzeugt von `v3-mk8-namen.mjs`), kleinster Abstand 3; Stichprobe 3 Werksnamen in `dirigent-test/`, `synquenzer/bau`, Repo-`index.html` und App: 0; Markenwörter Block 0, „MS 2000“ genau 1×. Umbenannt im Bau (Abstand ≤ 2): drei Namen |
| MK8-03 | ✓ jedes Programm „eigenes Rezept“ (Tabelle unten); das Prüfskript liest aus der privaten Datei nur Kategorie und Modus je Platz |
| MK8-04 | ✓ alle −20,9 … −17,5 LUFS, True Peak ≤ −2,2 dBTP, Bässe M-HANDYrel bei C2 −19,0 … −7,2 dB (22 Bässe); H15 (Eingang, ohne Quelle stumm) und H16 (INIT, −18,9) ausgenommen. Prüfphrasen: Bass 8 Achtel C2, Lead C4–C5, Fläche/Chor 4 Takte Akkord, Arp/Seq/Bewegung/Wellen-Seq Akkord 2 Takte (Arp-Schritte aus dem Arp-Muster), Vocoder gehaltene Akkorde; nicht vorgegebene Rollen: hart/Tasten/Bläser Akkord-Viertel, Glocke Melodie C5–C6, Effekt eine lange Note |
| MK8-05 | ✓ Rollen A–G 112/112; Arp 11 (≥ 10), Mod-Seq 24 (≥ 14), Speicherwellen 20 (≥ 10), Dual/Split 23 (≥ 12), Delay-Sync 60 (≥ 8); H09–H14 `mode` 3 mit `hold`, DIREKT 0, HPF 0; H15 OSZ 1 = Eingang; H16 = INIT deep-equal |
| MK8-06 | ✓ 1386 Paare (in jeder Bank, gleiche Plätze über Bänke), kleinster Unterschied 3,9 dB in einem relevanten M-BAND |
| MK8-07 | ✓ Bank A–H je genau 16 Plätze in Reihenfolge, eigener Klang statt Werksklang; N0b-01 über alle 10 Rollen-Chips; VA-Spur nur VA, ohne Bank-Chip; ▶ Arp-Programm 32 Arp-Noten, Fläche 5 Noten, Stimmen klingen |
| MK8-08 | ✓ Werksdaten im Block 22,4 KB (≤ 44; Parameter-Base64 9,4 KB); eine Bank 1,2–2,8 ms (≤ 5); alle 128 in 8 Häppchen 0,7–1,9 ms mit 30-ms-Pause; Laden 1,3–5,7 ms, 0 longtask; Block wird ohne AM-Projekt nicht ausgewertet (bei Bedarf 16,6 ms); Startzeit ohne AM 381 → 383 ms (Median aus 5) |
| MK8-09 | ✓ ‹ › mit Enden; Sichern → D07 schreibt, D07 lädt danach den eigenen Klang, 0 andere Plätze geändert; Undo deep-equal, Redo; zweites WRITE: älterer Klang verliert nur den Platz; WERKSKLANG ZURÜCK (Bibliothek ⋯) stellt `f-mk-d07` her, Undo deep-equal; M-PLATZ Platzwahl und Bank ▾ in P1, P2, P3, L1, L2, W: alle Tasten ≥ 44 × 44, im Bild, nichts abgeschnitten, keine Überlappung, Zeilen 45–49 px |
| MK8-10 | ✓ Regression (unten), keine Konsolenfehler, Budget **+44 996 B** (≤ +60 KB = 61 440 B), Worklet unverändert (bytegleich) |

Zusätzlich live (Echtzeit-Kontext): A04, A07, A03, H09 (Vocoder ohne Mikrofon), A02 (Arp 5 Schritte) klingen
(−31 … −21 dB RMS im Analyser) und unterscheiden sich im Schwerpunkt (269 … 1237 Hz).

Skripte: `v3-mk8-daten.mjs` (MK8-01/02/03/05/08), `v3-mk8-pegel.mjs` (MK8-04, `--bands` MK8-06, `--cal N` Kalibrierung),
`v3-mk8-ui.mjs` (MK8-01/07/08/09, live), `v3-mk8-mess.js` (LUFS BS.1770, True Peak 4×, M-HANDYrel, M-BAND, Phrasen),
`v3-mk8-hold.mjs`, `v3-mk8-bau.mjs`, `v3-mk8-namen.mjs` (schreibt nur die private Datei). Ausgaben `v3-mk8-*.out`,
Bilder `v3-mk8-shots/` (P1, P2, P3, L1, L2, W: `*-sichern.png`, `*-bank.png`; dazu Blatt und Bibliothek in P1/P3/L2).

## Regression

- Rauchtest ohne Fehler (`dirigent-test/v3-mk8-smoke.png`; `smoke.mjs` startet das Standard-Chromium, das hier fehlt –
  gleiche Prüfung als `v3-mk8-smoke.mjs` mit Chromium 1243).
- `v3-mk2-marke.mjs` alles PASS; `v3-mk1-look.mjs` 88/88; `v3-mk7-ui.mjs` 102/102.
- `v3-mk1-format.mjs` gegen 4.15.0: VA/FM/WT-Werks-Sounds und Demo **bitgleich (64, max |Δ| 0)**, Format 3/4 deep-equal,
  normMk, Speichern → Laden, VA → AM → VA, Kalt-Start ✓. Die drei Fehlschläge vergleichen mit 4.8.1 (Format 4 → 5,
  APP_CODE 4 009 000, Sperre in 4.8.1) und sind durch den Vorgänger 4.15.0 überholt (gleich auf 4.15.0).
- `v3-mk0-schutz.mjs` 33/47 – genau wie auf 4.15.0 (der Test nimmt Format 5 als „neuere Version“; überholt seit MK1).

## Fach-Prüfung (selbst, vor der Abnahme; Teil F: FP-KLANG ● Haupt-, FP-TOUCH Zweit-Blick)

7 Befunde, alle behoben:
1. FP-KLANG: 108 von 126 Programmen erreichen −18 LUFS mit AMP LEVEL 127 nicht (die AM-Engine ist auf INIT = INIT Analog
   kalibriert, ein gefilterter Klang liegt 5–15 dB darunter). Lösung: Pegel-Ausgleich im Programm über den EQ – LOW- und
   HIGH-Kuhschwanz beide bei 1000 Hz mit gleichem Gewinn (= flache Anhebung, W-33), höchstens +12 dB (Median +7,3 dB,
   20 Programme am Anschlag). Unter 0 dB regelt AMP LEVEL. Wer auch mit +12 dB zu leise war, wurde im Rezept nachgestimmt
   (heller, mehr Sustain/Gate, zweiter Oszillator: C06, C15, D06, D07, D16, E02, E06, G02, G06, G16, H07).
2. FP-KLANG: Bässe A09, C04, C15 unter M-HANDYrel −20 dB → Cutoff/Resonanz angehoben.
3. FP-KLANG: Die Vokal-Quelle (MK7) fällt oberhalb F1 mit ≈ 20 dB/Okt; F2/F3 lagen unter der Halte-Untergrenze. Für die
   `hold`-Spektren wird der Vokal vor der Analyse dreimal entzerrt (+18 dB/Okt ab ≈ 400 Hz), danach zeigen a/e/i/o/u ihre
   Formanten (z. B. „i“ F2/F3 in Band 13/14).
4. FP-KLANG: ⓘ von H09/H14 nannten einen zweiten Oszillator, den der Vocoder-Träger nicht hat → Rezepte und Texte bereinigt.
5. FP-KLANG: Vorhören der Sequenz-Programme lief mit 16tel-Noten, KEY SYNC startete die Folge bei jeder Note neu →
   Rollen 06/10/14 hören mit gehaltenen Akkorden; Arp-Programme mit dem Arp-Muster.
6. FP-TOUCH: Der Lade-Toast lag in L1/L2 über den Platz-Tasten 1–8 der Platzwahl → Platzwahl und Bank ▾ schließen den Toast.
7. FP-TOUCH: LCD/Undo hießen „WRITE“ → deutsch „Gesichert auf Platz“ / „Sichern auf A01“ (außerhalb der Platte deutsch, H-16).

## Abweichungen und Lücken

- **Pegel-Ausgleich über den EQ** (Befund 1): Auf der EQ-Seite sieht man bei vielen Programmen LOW/HIGH 1000 Hz +x dB.
  Alternative für später: ein Ausgangs-Pegel je Programm (neues Feld, nicht in HB-MS) oder ein höheres `ampK` (ändert INIT
  und MK1-20) – Entscheidung Xander/Orchestrator.
- Messung über `mkRender` (Engine mit Programm-Effekten, ohne Spurkette/Hall); `fx.vol` der Werksprogramme 0,8 wie INIT.
- Die Rollen-Kennung der Bibliothek folgt EN-18 (z. B. 01 hart → Akkord, 07 Glocke/Perkussion → Keys, weil „Glocke“ nur FM).
- MK8-09 „Mit MK-P“-Teil (BANK ▼ ▲, SELECT, LED, LCD „A01:Name“ auf der Platte) folgt mit MK-P über `window.mkProg`;
  WERKSKLANG ZURÜCK auf den Seiten 26/20 UTILITY ebenfalls (heute: Bibliothek ⋯ und Platzwahl).
- Das alte Bedienfeld zeigt weiter seine eigene BANK/SEITE-Wahl (Seite A leer, Seite B eigene Klänge) – laut Auftrag
  unverändert, MK-P ersetzt es.
- Lade-Hinweis H15 nennt „GLOBAL 1A“ (MK-P); bis dahin wählt man den Eingang im alten Bedienfeld.
- Vorhören eines Arp-Programms: eigene Arp-Ausspielung (Typ, Oktaven, Auflösung, Gate; ohne Swing/Latch).
- Kein Gerät, kein Hören durch einen Menschen: alle Klänge sind gemessen, nicht angehört (EN3-16) → iPhone-Punkte.
- Chromium-Pfad: `/opt/pw-browsers/chromium-1194/…` gibt es in diesem Container nicht; benutzt wurde `chromium-1243/chrome-linux64/chrome` (wie die MK-Tests seit V2d′).

## Fehler früherer Pakete (nur gemeldet, nicht in diesem Zweig behoben)

- MK7: Vokal-Quelle W-44 fällt oberhalb F1 sehr steil (Glottis-Tiefpass + vier Tiefpass-Resonatoren in Reihe; „a“ bei
  2 kHz −60 dB unter F1). Als Probe-Modulator klingt sie dumpf.
- MK1/MK7: `mkRender` lieferte im Serien-Lauf einmal einen stillen Render (bekannt aus MK7, `v3-qa7-pegel`); der
  Pegel-Lauf rendert dann einmal neu.
- `smoke.mjs` ruft `chromium.launch()` ohne Pfad (fehlt im Container).

## Für das Zusammenführen (Teil G Nr. 18)

- Berührt im Hauptteil: `normalizeSound` (bank/slot), `Library.save/duplicate/put/restore/importMany`, `soundCopy`,
  `saveSound`, `originRec` (lädt den Block bei `f-mk-*`), `undoState/undoApply` (`mkslot`), `stepSound`, `openSavePop`,
  `factoryNames`, Browser (`BR.bank`, `brList`, `openBrowser`, `brScope`, `brChipsHTML`, `brRefresh`, `brTap`),
  `previewStart`, `mkRender` (Maske), neue Helfer `mkSlotSnap`/`mkSlotPut`/`window.mkProg` vor `mkWaveOf`, CSS `.pop.mk8w`,
  eine Hilfe-Zeile, VERSION. Im Block `sq-mk-src` nur ein eigener Abschnitt am Ende (`/*MKF{*/ … */` + IIFE `window.MKF`).
  Worklet unverändert.
- MK-P bindet: BANK ▼ ▲ → `mkProg.bank(±1)`, SELECT n → `mkProg.select(mkProg.bank(0), n)` (`bank(0)` liest die gewählte Bank),
  −/NO +/YES → `mkProg.step(∓1)`, WRITE → `MKF.savePop(anker, spur)` oder `mkProg.write(b, s)`, LCD-Zeile 1 aus
  `mkProg.current().text`, LED aus `current().slot`; WERKSKLANG ZURÜCK auf 26/20 UTILITY → `mkProg.restore(b, s)`.
  Die Wahl-Tests von `v3-mk8-ui.mjs` (‹ ›) dann auf die Platte umstellen (≈ 0,5–1 h laut Teil G).
- Kein Supabase-Schritt (Format 5, App 4 017 000 ≤ max_app 4 021 000).

## iPhone (Xander)

1. Spur auf MS 2000, Bibliothek → Bank ▾ → jede Bank einmal durchtippen (Lautsprecher und Kopfhörer); Ausreißer melden
   (zu leise, zu laut, langweilig). Mit ‹ › im Klang-Kopf geht es Programm für Programm weiter.
2. Einen Klang ändern, Sichern → Bank und Platz wählen → „Auf … schreiben“; den Platz wieder laden; dann in der
   Bibliothek ⋯ → „Werksklang zurück“.
3. H09–H14 ohne Mikrofon: halten, hören, ob die Vokale a/o/e/i/u erkennbar sind.

## Herkunft je Programm (MK8-03)

| Platz | Name | Rolle | Modus | Merkmale | Herkunft |
|---|---|---|---|---|---|
| A01 | Sägeblock | hart | Single |  | eigenes Rezept |
| A02 | Kiesel-Arp | arp | Single | Arp, Delay-Sync | eigenes Rezept |
| A03 | Weiches Feld | flaeche | Single |  | eigenes Rezept |
| A04 | Rundbass | bass | Single |  | eigenes Rezept |
| A05 | Klarer Ruf | lead | Single |  | eigenes Rezept |
| A06 | Pulsfolge | seq | Single | Seq, Delay-Sync | eigenes Rezept |
| A07 | Glasglocke | perk | Single | Delay-Sync | eigenes Rezept |
| A08 | Orgelreihe | tasten | Single |  | eigenes Rezept |
| A09 | Tiefgang | bass | Single |  | eigenes Rezept |
| A10 | Wanderfilter | bewegung | Single | Seq | eigenes Rezept |
| A11 | Streichsatz | chor | Single |  | eigenes Rezept |
| A12 | Sync-Sturz | lead | Single | Delay-Sync | eigenes Rezept |
| A13 | Blechsatz | blaeser | Single |  | eigenes Rezept |
| A14 | Wellenband | wseq | Single | Seq, ≈ Welle, Delay-Sync | eigenes Rezept |
| A15 | Knackbass | bass | Single |  | eigenes Rezept |
| A16 | Sturmwind | effekt | Single |  | eigenes Rezept |
| B01 | Ringkante | hart | Single |  | eigenes Rezept |
| B02 | Funkenarp | arp | Single | Arp, Delay-Sync | eigenes Rezept |
| B03 | Eisfläche | flaeche | Single |  | eigenes Rezept |
| B04 | Gummibass | bass | Single |  | eigenes Rezept |
| B05 | Doppelglanz | lead | Dual | Delay-Sync | eigenes Rezept |
| B06 | Stufenglas | seq | Single | Seq, Delay-Sync | eigenes Rezept |
| B07 | Kristallton | perk | Single |  | eigenes Rezept |
| B08 | Zupfklavier | tasten | Single |  | eigenes Rezept |
| B09 | Ringknurrer | bass | Single |  | eigenes Rezept |
| B10 | Funkregen | bewegung | Single | Seq, Delay-Sync | eigenes Rezept |
| B11 | Lichtchor | chor | Single |  | eigenes Rezept |
| B12 | Pfeifkante | lead | Single | Delay-Sync | eigenes Rezept |
| B13 | Glashauch | blaeser | Single |  | eigenes Rezept |
| B14 | Wellenfunk | wseq | Single | Seq, ≈ Welle, Delay-Sync | eigenes Rezept |
| B15 | Glanzbass | bass | Single |  | eigenes Rezept |
| B16 | Funkzirpen | effekt | Single | Delay-Sync | eigenes Rezept |
| C01 | Tiefschlag | hart | Single |  | eigenes Rezept |
| C02 | Nachtarp | arp | Single | Arp, Delay-Sync | eigenes Rezept |
| C03 | Nebelbank | flaeche | Single |  | eigenes Rezept |
| C04 | Brummbass | bass | Single |  | eigenes Rezept |
| C05 | Dunkelruf | lead | Single | Delay-Sync | eigenes Rezept |
| C06 | Kellertakt | seq | Single | Arp, Delay-Sync | eigenes Rezept |
| C07 | Holzschlag | perk | Single | Delay-Sync | eigenes Rezept |
| C08 | Stubenpiano | tasten | Single |  | eigenes Rezept |
| C09 | Grollbass | bass | Single |  | eigenes Rezept |
| C10 | Tropfnacht | bewegung | Single | Seq, Delay-Sync | eigenes Rezept |
| C11 | Mönchschor | chor | Dual |  | eigenes Rezept |
| C12 | Schwerlead | lead | Single | Delay-Sync | eigenes Rezept |
| C13 | Hornsatz | blaeser | Dual |  | eigenes Rezept |
| C14 | Schattenzug | wseq | Single | Seq, ≈ Welle, Delay-Sync | eigenes Rezept |
| C15 | Kellerbass | bass | Single |  | eigenes Rezept |
| C16 | Tiefseeruf | effekt | Single |  | eigenes Rezept |
| D01 | Wellenstoß | hart | Single | ≈ Welle | eigenes Rezept |
| D02 | Wellenarp | arp | Single | Arp, ≈ Welle, Delay-Sync | eigenes Rezept |
| D03 | Wellenmeer | flaeche | Dual | ≈ Welle | eigenes Rezept |
| D04 | Wellenbass | bass | Single | ≈ Welle | eigenes Rezept |
| D05 | Hauchlead | lead | Single | Delay-Sync | eigenes Rezept |
| D06 | Wellenkette | seq | Single | Seq, ≈ Welle, Delay-Sync | eigenes Rezept |
| D07 | Blechtrommel | perk | Single | ≈ Welle, Delay-Sync | eigenes Rezept |
| D08 | Röhrenorgel | tasten | Single | ≈ Welle | eigenes Rezept |
| D09 | Stimmbass | bass | Single |  | eigenes Rezept |
| D10 | Formwandel | bewegung | Single | Seq | eigenes Rezept |
| D11 | Wellenchor | chor | Dual | ≈ Welle | eigenes Rezept |
| D12 | Wellenlead | lead | Single | ≈ Welle, Delay-Sync | eigenes Rezept |
| D13 | Flötenwelle | blaeser | Single | ≈ Welle | eigenes Rezept |
| D14 | Wellenzug | wseq | Single | Seq, ≈ Welle | eigenes Rezept |
| D15 | Wellenpunch | bass | Single | ≈ Welle | eigenes Rezept |
| D16 | Wellenspuk | effekt | Single | ≈ Welle, Delay-Sync | eigenes Rezept |
| E01 | Pumpakkord | hart | Single | Seq | eigenes Rezept |
| E02 | Laufarp | arp | Single | Arp, Delay-Sync | eigenes Rezept |
| E03 | Atemfläche | flaeche | Single |  | eigenes Rezept |
| E04 | Hüpfbass | bass | Single | Seq | eigenes Rezept |
| E05 | Pedalruf | lead | Single | Delay-Sync | eigenes Rezept |
| E06 | Zahnradfolge | seq | Single | Seq, Delay-Sync | eigenes Rezept |
| E07 | Pingtropfen | perk | Single | Delay-Sync | eigenes Rezept |
| E08 | Wackelpiano | tasten | Single |  | eigenes Rezept |
| E09 | Schiebebass | bass | Single |  | eigenes Rezept |
| E10 | Laufband | bewegung | Single | Seq, Delay-Sync | eigenes Rezept |
| E11 | Wogenchor | chor | Single |  | eigenes Rezept |
| E12 | Kurvenlead | lead | Single | Seq, Delay-Sync | eigenes Rezept |
| E13 | Schwellblech | blaeser | Single |  | eigenes Rezept |
| E14 | Wellenrad | wseq | Single | Seq, ≈ Welle, Delay-Sync | eigenes Rezept |
| E15 | Pendelbass | bass | Single |  | eigenes Rezept |
| E16 | Ufo-Landung | effekt | Single | Delay-Sync | eigenes Rezept |
| F01 | Doppelstab | hart | Dual |  | eigenes Rezept |
| F02 | Zwillingsarp | arp | Dual | Arp, Delay-Sync | eigenes Rezept |
| F03 | Schichtfeld | flaeche | Dual |  | eigenes Rezept |
| F04 | Splitbass | bass | Split |  | eigenes Rezept |
| F05 | Zweiklang | lead | Dual | Delay-Sync | eigenes Rezept |
| F06 | Kreuzfolge | seq | Dual | Arp, Seq, Delay-Sync | eigenes Rezept |
| F07 | Spieluhr | perk | Dual | Delay-Sync | eigenes Rezept |
| F08 | Splitpiano | tasten | Split |  | eigenes Rezept |
| F09 | Schichtbass | bass | Dual |  | eigenes Rezept |
| F10 | Splitfolge | bewegung | Split | Seq, Delay-Sync | eigenes Rezept |
| F11 | Doppelchor | chor | Dual |  | eigenes Rezept |
| F12 | Splitlead | lead | Split | Delay-Sync | eigenes Rezept |
| F13 | Bläserpaar | blaeser | Dual |  | eigenes Rezept |
| F14 | Wellenpaar | wseq | Dual | Seq, ≈ Welle, Delay-Sync | eigenes Rezept |
| F15 | Splitkeller | bass | Split |  | eigenes Rezept |
| F16 | Doppelsirene | effekt | Dual | Delay-Sync | eigenes Rezept |
| G01 | Echostab | hart | Single | Delay-Sync | eigenes Rezept |
| G02 | Phasenarp | arp | Single | Arp, Delay-Sync | eigenes Rezept |
| G03 | Raumdecke | flaeche | Single |  | eigenes Rezept |
| G04 | Hallbass | bass | Single |  | eigenes Rezept |
| G05 | Echolead | lead | Single | Delay-Sync | eigenes Rezept |
| G06 | Echofolge | seq | Single | Seq, Delay-Sync | eigenes Rezept |
| G07 | Glockenwurf | perk | Single | Arp, Delay-Sync | eigenes Rezept |
| G08 | Phaserorgel | tasten | Single |  | eigenes Rezept |
| G09 | Tiefzirkel | bass | Single |  | eigenes Rezept |
| G10 | Raumpuls | bewegung | Single | Seq, Delay-Sync | eigenes Rezept |
| G11 | Hallchor | chor | Single |  | eigenes Rezept |
| G12 | Flangerlead | lead | Single | Delay-Sync | eigenes Rezept |
| G13 | Weichwolke | blaeser | Single | Delay-Sync | eigenes Rezept |
| G14 | Wellenhall | wseq | Single | Seq, ≈ Welle, Delay-Sync | eigenes Rezept |
| G15 | Echobass | bass | Single | Delay-Sync | eigenes Rezept |
| G16 | Laserschuss | effekt | Single | Delay-Sync | eigenes Rezept |
| H01 | Polyfarbe | hart | Single |  | eigenes Rezept |
| H02 | Datenstrom | effekt | Dual | Delay-Sync | eigenes Rezept |
| H03 | Sternfläche | flaeche | Single |  | eigenes Rezept |
| H04 | Bassquinte | bass | Split | Delay-Sync | eigenes Rezept |
| H05 | Holzflöte | lead | Single | Delay-Sync | eigenes Rezept |
| H06 | Filterwerk | seq | Single | Seq, Delay-Sync | eigenes Rezept |
| H07 | Zeitsprung | effekt | Single | ≈ Welle, Delay-Sync | eigenes Rezept |
| H08 | Kammerpuls | tasten | Single |  | eigenes Rezept |
| H09 | Vokalchor | vocoder | Vocoder | Halten | eigenes Rezept |
| H10 | Vokal O | vocoder | Vocoder | Halten | eigenes Rezept |
| H11 | Vokalwah | vocoder | Vocoder | Delay-Sync, Halten | eigenes Rezept |
| H12 | Vokalpuls | vocoder | Vocoder | Arp, Halten | eigenes Rezept |
| H13 | Stimmwandel | vocoder | Vocoder | Halten | eigenes Rezept |
| H14 | Robotergruß | vocoder | Vocoder | Delay-Sync, Halten | eigenes Rezept |
| H15 | Eingang | eingang | Single | Delay-Sync | eigenes Rezept |
| H16 | INIT MS 2000 | effekt | Single |  | INIT |
