# NOTES Paket KS (Klangschule im Synquenzer)

Basis: `rel-4780/index.html` (Synquenzer 4.78.0, md5 68e92c03…), VERSION bleibt '4.78.0'. Grundlage: `klangschule/KONZEPT-KLANGSCHULE.md`.
Nur Scratchpad, nichts veröffentlicht, keine Datenbank, kein Netzabruf, keine Audiodateien in der App.

## KS1 – Gerüst, E2, E3, Zugänge, Fortschritt, Lektionen L1–L4

Stand 16.11.2026, ~22:40 UTC. `index.html` md5 **a70b7fb9b78fbf9801fa2780b134777b** (Sicherung davor: `index.vor-ks1.html` = Basis).

### Änderung

- **Stiller Block `sq-ks-src`** (52 KB, 686 Zeilen, `/* KS-BEGIN */ … /* KS-END */`, eine oberste Größe `KSX`) vor `sq-md-src`.
  Wird erst beim ersten Öffnen ausgewertet (`ksLoad`, Muster `mkLoad`, gemessen 1,8 ms). Inhalt:
  - **Klangschule-Blatt** (Popup-Blatt mit Kopf): Einleitung, „Los geht’s / Weiter mit n …“, Kapitel 1–2, je Lektion eine Zeile mit ✓.
    Aus dem ⋯-Blatt: Kapitel der Seite „zu dieser Seite“ markiert (HÜLLK. → Kapitel 1, FILTER → Kapitel 2).
  - **Lektionskarte** (einklappbar ▾/▴ auf eine Kopfzeile mit „offen“/✓): Kopf ◀ Titel ▶ ▾ ✕; „Hör mal“ (zwei Beispiele + „im Wechsel“);
    Vorhör-Zeile („Klangschule · du hörst: …“); Aufgabe; Rückmeldung ✓/✗ mit Zahl (+ „Bonus ▶“); Tipp/Merksatz; Graph (Cutoff amber
    20 Hz–20 kHz, Lautstärke weiß −48…0 dB, grau = Ziel, gestrichelt = Taste los, Punkt = gerade gespielt); feste Knopfzeile
    [Tipp] [Zeig es mir] [▶ Dein Stand] [Übernehmen]. Knöpfe ≥ 44 px.
  - **Platz der Karte:** größtes freies Band zwischen den Rahmen (hochkant über die ganze Breite, quer linke/rechte Spalte 400 px);
    passt sie nicht ganz hinein, rollt nur ihr Inhalt, Kopf und Knopfzeile bleiben. Sie liegt nie über einem Rahmen (getestet).
  - **E3 – bis zu 3 nummerierte Rahmen**: Regler über `data-key` des Parameters gefunden; liegt er auf einer anderen Seite, leuchtet
    der Reiter („3 Filter-ATTACK › FILTER“). Etiketten, die sich überdecken, rutschen unter den Rahmen. Nachführen alle 200 ms.
  - **Rechnen** mit den Formeln der Engine: `envCoefs`, Amp je Probe (inkl. Halte-Glättung 0,002, Stimmen-Ende), Filter-Hüllkurve je
    Steuerblock (16 Proben, Halte-Glättung 0,2), Cutoff = Grundwert + Keytrack × (Note − 60) + Menge × 72 HT × Hk × Anschlag-Faktor.
    Testnote C3, Anschlag 100, je Aufgabe Halten/Dauer. ~0,4 ms je Rechnung.
  - **Mitlaufen:** Scope-Meldung der gespielten Stimme (läuft ohnehin, solange der Klang-Editor offen ist) → Punkt auf beiden Kurven.
  - **Hör mal, pegelgleich über die echte Engine:** Wiedergabe wie das Vorhören im Klang-Browser (`previewStart`, eigene Kette mit den
    Spur-Effekten, über einem laufenden Song). Pegel vorher offline mit demselben Worklet (`SynthHost.track` im OfflineAudioContext,
    BS.1770-Lautheit mit K-Filter und Gates); Ziel = das leisere Beispiel (es wird nur leiser gemacht, `p.level`). „▶ Dein Stand“
    wird auf dasselbe Ziel gebracht. Halt bei 20 ms + Quittung (`i53ping`), damit die Noten unter Last nicht zu spät ankommen.
  - **Tipps** nach 2/4 Fehlversuchen (ein Versuch = ein neuer ↶-Schritt der Lektion auf ihrer Spur), [Tipp] auch von Hand.
  - **„Zeig es mir“**: dreht die Lösungsregler in 0,6 s (S-Kurve) auf den Wert, spielt dabei C3 an, ein ↶ „Klangschule: Zeig es mir“.
  - **Übernehmen**: Auswahl der Spur (diese Spur zuerst); Original + ↶-Stapel wie vor der Lektion, dann der Lektionsklang
    („Schule: …“, ohne Herkunft) auf die Zielspur als **ein** ↶ „Klangschule: …“. Andere Spur: Lektionsspur bleibt wie vorher.
  - **Lektionen L1–L4** (Kapitel 1–2) mit Startklang, Rahmen, Hör-Vergleich, Aufgabe, Prüfung, 2 Tipps, Lösung, Merksatz;
    L2 mit Bonus-Aufgabe (Sinus-Sub ohne Klick), L3 mit Hinweis „Release-Falle“ nach ✓.
- **Hauptskript, Block `/* KS-BEGIN */ … /* KS-END */` hinter UI1** (59 Zeilen): Lader, `KS_L` (die offene Lektion, `var`), Zugänge,
  Such-Einträge, Speicher-Schutz `ksSub`, Test-API `SYNQUENZER.ks`.
- **E2 – Lern-Vorhör-Zustand:** die Lektion leiht die gewählte Synth-Spur (sonst die erste VA/FM/WT). Original = dasselbe Objekt,
  ↶/↷-Stapel als Kopie. Ihre Drehs sind normale ↶-Schritte. ✕/Weiter/Projektwechsel: Original zurück, Stapel wie vorher.
  Making-of (VD3) schweigt während der Lektion; ◆-Zustände der Clips ruhen auf der Lektionsspur.
- **Haken außerhalb (je eine Zeile, Kennung KS):** `SQStore.stripRuntime` und `stripReplacer` (Speicher-Schutz: Autosave, Datei,
  Abgleich, Verlauf schreiben das Original), `v6aCurSt` + `ak1Ref` (◆ ruht), `undo`/`redo` (↶ endet am Anfang der Lektion),
  `applyProject` (Projektwechsel beendet die Lektion), `ui1MenuHook` (Menüzeile), `openEdMore` (⋯-Zeile + Tipp), `ui1Entries`
  (5 Such-Einträge), `SYNQUENZER.ks`. In der Basis geändert: 5 Zeilen (die ersten vier + `guardTouch(p); ksMoreTap(p);`).
- **Fortschritt** in den Geräte-Einstellungen `uiPrefs().ks = {d: {L1: Zeit, …}, last}` – kein neues Projektfeld.
- **Sichtbar neu** (wie freigegeben, kein neuer Knopf): Menüzeile „Klangschule – Sounddesign mit echtem Klang“ unter den
  Kurz-Anleitungen, ⋯-Zeile „Klangschule zu dieser Seite“, Blatt, Karte, Rahmen. Aussehen/Bedienung der Regler und Seiten unverändert.

**Abweichungen vom Konzept (am echten Synquenzer nachgerechnet):**
- L1: Startklang bei zwei Dritteln der Filteröffnung (0,32 s) **stumm** (Stimme schon zu Ende), nicht −35 dB. Tipp 2 mit
  gemessenen Schwellen: Amp-SUSTAIN ab ~30 % (−10,5 dB), Amp-DECAY ab ~1,5 s (−9,7 dB) oder Filter-ATTACK kürzer.
- L2: Prüfung bei 0,1 s **≤ −18 dB** statt −20 dB (Attack 1,5 s mit Kurve 50 % ergibt −19,6 dB – sonst wäre „etwa 1,5 s“ falsch);
  Lösung Attack 1,6 s (−20,1 dB / −0,3 dB). Startklang mit eigenen Werten (Fläche, Chorus I), kein Werksklang-Name.
  Bonus: Attack 2–5 ms, Release 20–30 ms (Toleranz 1,8–5,5 / 18–32 ms wegen Reglerraster).
- L3: Prüfung zusätzlich „Tiefpunkt ≥ 1 Oktave unter dem Ruhepunkt“ – sonst bestünde ein Plus-Klang mit hohem Sustain.
- L4: Startklang Cutoff **1,5 kHz** (statt 66 Hz), Filter-ATTACK 0,3 s, Sustain 100 %; Rahmen Typ · Hüllk.-Menge · **Filter-ATTACK**
  (statt -DECAY). Mit 66 Hz ginge die Aufgabe nur mit Plus – das widerspräche dem Merksatz „Minus ist beim Hochpass der Normalfall“.
- Reglernamen wie in der App: „Hüllk.-Menge“ statt „HK-INT“.

### Tests (`ks1-test.mjs`, Ausgabe `ks1-test.out`): **75/75**

Hochkant 390×844 und quer 844×390, Chromium, Berührung:
- stiller Block beim Start nicht ausgewertet (kein `KSX`, kein CSS) – je Ausrichtung ✓
- Zugänge: Menüzeile antippen → Blatt (4 Lektionen); ⋯ auf HÜLLK. → Blatt mit Kapitel 1 „zu dieser Seite“ → Lektion 1;
  Suche „Polarität“/„Tutorial“/„Sounddesign“ findet die Klangschule, Sprung öffnet Lektion 3 – je Ausrichtung ✓
- L1–L4 (+ Bonus): lädt, 3 Rahmen auf sichtbaren Zielen (Rahmen ±2 px um das Ziel), Karte verdeckt keinen Rahmen und liegt im Bild,
  **Startklang ✗, Lösungswerte ✓** – je Ausrichtung ✓
- nach 4 Lektionen + Bonus und ✕: Projekt **bitgleich** (`serialize()`, mit und ohne Ansicht) – je Ausrichtung ✓
- Tipps: Fehlversuche/Tipp = 1/0, 2/1, 3/1, 4/2 ✓; ↶ in der Lektion geht, endet am Anfang (5. ↶ = false, Wert wieder 300 ms) ✓
- „Zeig es mir“ → ✓ und genau ein ↶ ✓; Fortschritt in `uiPrefs`, nicht im Projekt ✓
- **Autosave während der Lektion** (`saveNow` + `autosave.load`) und `serializeProject` = Original, Projektdatei trägt das Original ✓
- **✕ bitgleich, auch gespeichert/geladen** ✓
- **Übernehmen = genau ein ↶** (diese Spur), ↶ danach = Projekt bitgleich wie vorher ✓; andere Spur: ein ↶, Lektionsspur unverändert ✓
- ◆ ruht (kein Clip-Zustand, Regler im Grundklang) ✓; Projektwechsel beendet die Lektion, Projekt = Original ✓; einklappen (56 px) ✓
- **A/B am Master pegelgleich**: L1 −41,16 / −41,33 LUFS (**0,18 dB**; ungeregelt 15,4 dB auseinander), L3 −26,53 / −26,48 (**0,04 dB**) ✓
- Vorhör-Zeile „du hörst: Minus: 2,4 kHz, −50 % (pegelgleich)“ ✓; Mitlaufen: Punkt bei 0,5 s, 397 Hz, −0,9 dB ✓
- keine Fehler in der Konsole (beide Ausrichtungen) ✓

### Pflichtprüfungen

- `topdefs.cjs`: Skripte 26, Namen 8066 (+14), doppelt 0, Syntaxfehler 0; `blockcheck.cjs` (stiller Block): Syntax ok, oberste Namen
  `KSX`, Kollision 0, doppelte Schlüssel 0; `dupkeys.cjs`: 0
- Rauchtest `dirigent-test/smoke.mjs`: Titel SYNQUENZER, Fehler [] (`fotos/smoke.png`)
- „MS 2000“ 1×, `^  live: true,` 1×, VERSION '4.78.0'
- Markenwörter (`src/marken.sh`, 29 Gerätenamen/Produkte): Basis 123, neu 123, neuer Code 0

### Messungen

- **Startzeit** (`startzeit.mjs`, je Lauf frischer Kontext, 428×926, 3 Läufe abwechselnd): App bereit Basis 639/630/690 ms
  (Median 639), neu 714/621/617 ms (Median 621); DOMContentLoaded Median 546 → 543 ms. Unverändert (Rauschen, Rechner ausgelastet).
- Größe: +60 KB roh, gzip 3 157 033 → 3 178 278 B (**+21 KB, +0,7 %**).
- Block auswerten beim ersten Öffnen 1,8 ms; Rechnen ~0,4 ms je Dreh; Pegel offline 300–500 ms je Aufgabe (einmal, 0,9 s nach dem
  Öffnen vorab); während der Lektion ein 100-ms-Takt (Prüfen nur nach Änderung, Graph nur bei Änderung oder klingender Stimme).
- Paketordner 31 MB.

### Offen

- „Hör mal“ spielt bei laufendem Song **über** dem Song (Vorhören), nicht als Klang **im** Song; der Lektionsklang selbst klingt im Song.
- Startet während einer Lektion im laufenden Song ein Clip mit ◆-Zustand, schickt dessen Morph die Zustandswerte noch an die Engine
  der Lektionsspur (v6aGo); im Stillstand und beim Drehen ruht ◆ (getestet).
- Der lange Verlauf (VC2a) bekommt für Lektionsschritte Einträge ohne Änderung (Speicher-Schutz ersetzt den Klang auch dort).
- Making-of (VD3) schweigt während der Lektion für alle Spuren.
- Ohne Synth-Spur nur ein Hinweis („erst eine Synth-Spur wählen“), noch kein „Spur anlegen“.
- Hochkant liegt die Karte oft über der Tastatur (dann ▾ oder „▶ Dein Stand“); bei wenig Platz (L1) rollt der Graph in der Karte.
- Erste Sekunden nach dem App-Start (Worklet noch nicht bereit) spielt „Hör mal“ über den ECO-Weg – dann nicht exakt pegelgleich.
- Nächste Schritte laut Konzept: KS2 (L5–L10, Messen, E1), KS3 (Werkstatt W1/W2 + 19 Rezept-Karten), KS4 (E4–E7).

### Dateien

`index.html` (Ergebnis), `basis.html`, `index.vor-ks1.html`, `src/ks-block.js`, `src/ks-main.js`, `src/apply-ks1.py` (baut aus
`index.vor-ks1.html` + Quellen), `src/blockcheck.cjs`, `src/marken.sh`, `src/core-probe.mjs` (Rechnen in Node), `src/probe-*.mjs`,
`ks1-test.mjs` + `ks1-test.out`, `startzeit.mjs` + `startzeit.out`, `fotos/` (Blatt und L1–L4 hochkant/quer, Rauchtest).
