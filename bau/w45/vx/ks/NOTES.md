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

## KS2 – Kapitel 3–5 (L5–L10), Messen am Spur-Ausgang (L6–L8), E1

Stand 17.11.2026, ~00:05 UTC. `index.html` md5 **c6f0b4eaba2bb3d77202c60dfc655a6a** (Sicherung davor: `index.vor-ks2.html` = Ergebnis KS1,
md5 a70b7fb9). Gebaut mit `src/apply-ks2.py` aus `index.vor-ks2.html` + `src/ks-block.js` + `src/ks-main.js`. VERSION bleibt '4.78.0'.
KS2 lief in drei Anläufen (zwei Neustarts des Rechners); der dritte Lauf hat den Stand geprüft, ergänzt und getestet.

### Änderung

- **Stiller Block `sq-ks-src`**: 52 KB → **99,6 KB** (686 → 1175 Zeilen), weiter nur eine oberste Größe `KSX`, ausgewertet erst beim ersten Öffnen.
  - **Kapitel 3–5 mit L5–L10** (Blatt: 10 Lektionen in 5 Kapiteln). Je Aufgabe Startklang (eigene Werte auf INIT VA, kein Werksklang-Name),
    1–3 Rahmen, Hör-Vergleich, Aufgabe, Prüfung mit Zahl, 2 Tipps, Lösung, Merksatz:
    - **L5 „Vom Waah zum Tock“**: Filter-DECAY : Amp-DECAY 1 : 2 … 1 : 4, Filter-SUSTAIN ≤ 10 %, Hüllk.-Menge ≥ +25 %, nach 80 ms mehr als halb zu.
      Zweite Hör-Reihe **LP24 gegen LP12**. Bonus **Stab** (Amp-SUSTAIN 0, Hall ≤ 20 %).
    - **L6 „Nass ohne Matsch“**: Rechnen (Typ BP/HP, Echo oder Hall ≥ 30 %) + **Messen** (Pegel unter 150 Hz ≥ 18 dB unter dem lautesten Oktavband).
    - **L7 „Das Filter pfeift“**: Rechnen (Resonanz ≥ 100 %, Keytrack 100 %) + **Messen** (Pfeifton je Note C4/G4/C5 ±15 ct). Graph: Cent je Note
      (○ Rechnung, ● gemessen).
    - **L8 „Flöte: Atem ja, Fernseher nein“**: Rechnen (LP24/LP12, Resonanz ≥ 100 %) + **Messen** (über 3 kHz ≤ −50 dB, erster Ton steht nach
      ≤ 60 ms). **Bonus „Bauch“** (neu in diesem Lauf): Wind (Rauschen 60 % durch BP12 523 Hz, LFO 0,35 Hz ±12 HT) + Sinus auf Osz 1;
      Messen: Sinus 8–18 dB unter dem Rauschen (GRUNDLAGEN E: −10 … −15 dB). Lösung Osz 1 Anteil 18 % = 12 dB darunter.
    - **L9 „Saubere Fahrten: der Laser“**: Hüllk. 2 → Tonhöhe 90–100 %, DECAY 120–250 ms, SUSTAIN 0; Graph: Tonhöhe in HT. Bonus **Riser über
      4 Takte** (unter 96 BPM 2 Takte, weil eine Hüllkurve höchstens 10 s kann): Aufgabe, Prüfung und Lösung rechnen mit dem Song-Tempo.
    - **L10 „Treppen: Zufall mit Absicht“**: S&H, TAKT 1/16 oder 1/8, „S&H in der Tonart“ an, Menge Tonhöhe 10–50 % (≤ ±12 HT); Graph: die
      gespielte Treppe (E1) mit den Tönen der Tonart. Bonus **Blubbern** (S&H auf den Cutoff ≥ 15 %, Resonanz 85–95 %).
  - **Rechnen** auch für Hüllk. 2 → Tonhöhe (Σ Routen × 24 HT × Hk2, Block-Rate wie die Engine). Werte über Schlüssel: Klang-Parameter,
    Spur-Effekte (`fx.rev`, `fx.dly`) und Mod-Routen (`menv:pitch`, `lfo1:pitch`, `lfo1:cutoff`) – auch für Rahmen, „Zeig es mir“ und Übernehmen.
  - **Rahmen** auch an Mod-Routen (Reiter MOD) und an Reglern mit zwei Gesichtern (LFO 1 FREI/TAKT).
  - **Messen (nur L6–L8)**: Knopf **▶ Prüfen** in der Rückmeldung, erst wenn die Rechnung passt (und zum Nachmessen). Die Lektion spielt ihre
    Phrase (2 s) auf der Lektionsspur; der vorhandene Mitschnitt-Prozessor des Mix-Assistenten (`synq-mx3-cap`) hört samplegenau am
    Spur-Ausgang mit (`AU.tracks[t].post`, derselbe Abgriff wie das Oszilloskop, vor dem Hall-/Echo-Bus) und wird danach abgeklemmt.
    Läuft der Song, ist Aufnahme oder ist der Ton aus: dieselbe Phrase offline mit demselben Worklet, ohne Ton („misst ohne Ton (Song läuft)“).
    Ausgewertet: mittleres Spektrum (Hann 8192, halb überlappend) → Oktavbänder, Pegel unter 150 Hz, Anteil über 3 kHz; Pfeifton je Note
    (Hann 16384, 4× aufgefüllt, Spitze parabolisch); Einschwingzeit (Goertzel 20 ms); Sinus gegen Rauschen (ein langes Fenster, Spitze ±50 ct).
    Eine Messung gilt nur für den gemessenen Klang (jeder Dreh → wieder ▶ Prüfen); eine misslungene Messung zählt als Versuch (Tipps).
    „Zeig es mir“ misst danach selbst. Nach dem Messen zeigt der Graph die Bänder (L6, L8, Bonus) bzw. die Cent je Note (L7).
  - **E1 im Graph**: der Punkt nimmt Cutoff, Pegel, Tonhöhe und das **Alter der Stimme** aus derselben Scope-Meldung – er sitzt damit genau
    auf der Kurve (gemessen ±0,03 Oktaven), auch mit Modulation auf dem Cutoff (S&H). Ohne E1 (ECO-Weg) wie in KS1 aus den Quellen.
  - Blatt aus ⋯: FILTER → Kapitel 2–4, OSZ → 4, FX → 3, LFO/MOD → 5, HÜLLK. → 1. Das Kapitel rollt nur nach oben, wenn es unten im Blatt
    liegt (sonst wäre „Los geht’s“ verdeckt; im KS1-Test quer aufgefallen).
  - Test-API: `measSnd` (Klang der Lektion offline messen), `ana` (die Mess-Rechnung auf fremdem Ton, für die Sonden).
- **Hauptskript, KS-Block**: 6 Such-Einträge (L5–L10), Kopf-Kommentar. Zeilen sonst wie KS1.
- **E1 (Engine)**, je eine Zeile mit Kennung „KS E1“:
  - Worklet `control()`: für die Fokus-Stimme (`fv`, gibt es nur bei offenem Scope) Cutoff in Hz (aus `cutN` mit allen Routen), Amp-Pegel,
    Tonhöhe mit Routen, Note und Alter der Stimme (`v.t0`) in ein `Float64Array(5)`.
  - Worklet Scope-Meldung (2 Zeilen, mit/ohne `dst`): Feld `ks` dazu.
  - Hauptthread `modScopeSync`: `MLIVE.ks = m.ks`.
  Ohne offenes Scope läuft nichts davon (getestet: Klang-Editor zu → keine Meldung).
- **Haken insgesamt**: KS1 13 + KS2 4 (3 Worklet, 1 Hauptthread). Aussehen und Bedienung der Regler und Seiten unverändert, kein neuer Knopf.

**Abweichungen vom Konzept (am echten Synquenzer nachgemessen):**
- L5/L6/L7: eigene Startwerte statt der Werksklänge (Pop-Pluck, Nass & Quietsch, Pfeif-Lead) – gleiche Machart, kein Werksklang-Name.
- L6: kein eigener Knopf „im Song“: läuft der Song, spielt „Hör mal“ ohnehin über dem Song (Vorhör-Zeile „· über dem Song“).
- L7: eigene Messung statt der Perioden-Erkennung des Oszilloskops (genauer: Ladder-Zug wie im Python-Nachbau auf 0,7 ct).
- L8: Startklang **Rauschen 50 %** statt 35 % – mit 35 % misst die App −48,9 dB über 3 kHz, zu knapp an der Grenze −50.
- L8 Bonus „Bauch“: im Konzept ohne Prüfung; hier mit Messung (Sinus 8–18 dB unter dem Rauschen). Der Wind steht auf BP12 523 Hz ohne
  Keytrack: mit dem Filter auf der Note (BP12 auf C3) lag schon das Rauschen allein bei −15 dB im Mess-Fenster – nicht unterscheidbar.
- L9: Hör-Vergleich **ohne Echo** („Richtig: 180 ms, Kurve 50 %“); mit Echo lag „richtig“ am Master 1,2–1,6 dB leiser (die Echo-Fahne
  verlängert den Klang, der Lautheits-Mittelwert sinkt). Das Echo steht im Profi-Tipp nach ✓. Die Reihe „linear in Hz / in Halbtönen“ (F1)
  fehlt: Hüllk. 2 fährt immer in Halbtönen, „linear in Hz“ kann die Engine nicht.
- L9 Bonus: Riser über 4 Takte nur bis 10 s (ab 96 BPM), darunter 2 Takte; Lösung = ATTACK auf die Taktlänge (±10 %).
- L10: Menge zusätzlich ≥ 10 % (sonst keine Treppe mehr).

### Tests

`ks2-test.mjs` (Ausgabe `ks2-test.out`): **149/149**, hochkant 390×844 und quer 844×390, Chromium, Berührung.
- je Ausrichtung: stiller Block beim Start nicht ausgewertet; Blatt 10 Lektionen/5 Kapitel; ⋯ auf FILTER → L3–L8, auf LFO → L9–L10; Suche
  (Eigenschwingung, S&H Treppe, sample hold, Laser, nass, Flöte, Pluck); Sprung aus der Suche; Messen nur in L6–L8 (+ Bonus);
  **10 Aufgaben** (L5–L10 + 4 Bonus): lädt, 2–3 Rahmen auf sichtbaren Zielen (±2 px), Karte im Bild ohne Rahmen zu verdecken,
  Startklang ✗ (L8: gemessen), ohne passende Rechnung kein ▶ Prüfen, Lösung ✓ (L6–L8 erst nach dem Messen); ✕ danach Projekt **bitgleich**
  (mit und ohne Ansicht); Fortschritt L5–L10 in `uiPrefs`, nicht im Projekt; keine Fehler in der Konsole.
- hochkant zusätzlich:
  - **▶ Prüfen per Fingertipp** (L6): live gemessen ✓ in **2,6 s**, Vorhör-Zeile „misst 2 s am Spur-Ausgang …“, Mitschnitt-Prozessor danach
    abgeklemmt (1 angelegt, 0 Verbindungen); ein Dreh danach → wieder ▶ Prüfen.
  - **live = offline**: L6 −21,7 / −21,6 dB; L7 −0,9/+0,7/+2,0 gegen +0,2/+0,1/0 ct; L8 über 3 kHz −99,9 / −99,6 dB, Einschwingen 30 / 30 ms.
  - Song läuft → Messung ohne Ton (offline) ✓; misslungene Messung = Versuch (Tipp 1 nach 2); „Zeig es mir“ L7 → misst → ✓, ein ↶.
  - **E1**: L7 Start 525,4 Hz exakt (Rechnung 525,4); Punkt auf der Kurve L3 ±0,03 Oktaven (8 Proben); S&H auf den Cutoff: Scope zeigt
    11 Stufen (113 … 1977 Hz), die Rechnung allein bliebe bei 495 Hz; Klang-Editor zu → keine Meldung; L9 Tonhöhe +10,7 → 0 HT in ~160 ms.
  - **L10 Treppe**: 9 Stufen, alle in C-Dur, alle ±12 HT um C4, Graph „Treppe“.
  - **A/B am Master** (±1 dB): L5 0,08 dB, L5 LP24/LP12 0,16 dB, L5 Bonus (Hall 45/15 %) 0,53 dB, L8 Bonus 0,05 dB, L9 0,41 dB.
  - Übernehmen L9 mit Route Hüllk. 2 → Tonhöhe = ein ↶, ↶ = bitgleich; L10 auf andere Spur (TAKT, Tonart, Route dabei), Lektionsspur
    unverändert; ✕ nach Drehs an Route und Echo bitgleich; Riser 120 BPM → 4 Takte 8 s, 90 BPM → 2 Takte 5,3 s, Lösung ✓.
- `ks1-test.mjs` auf dieser Fassung: **75/75** (Ausgabe `ks1-test.ks2.out`).

### Messungen (Sonde gegen den Python-Nachbau)

| Prüfung | App | Python-Nachbau / Konzept |
|---|---|---|
| L7 Ladder-Zug bei Resonanz 100 / 102 / 105 / 110 % (Cutoff 523,25 Hz) | −0,3 / −7,3 / −16,4 / −29,3 ct | −1 / −7,3 / −16,3 / −29,8 ct |
| L7 App-Messung auf D2.flac (11 Töne) | alle ±2,1 ct | alle ±4 ct |
| L7 Startklang falsch gestimmt (Cutoff 500 Hz) | −87 / −85 / −86 ct ✗ | – |
| L8 App-Messung über 3 kHz auf D3.flac / D4.flac | −38,5 dB ✗ / −82,8 dB ✓ | −34 … −39 / −55 … −70 dB¹ |
| L8 Startklang / Lösung (App-Engine) | −44,7 dB ✗ / −99,6 dB ✓ | D3 ✗ / D4 ✓ |
| L8 Einschwingen ohne / mit Zünder | 215 / 30 ms | ≈ 200 ms / ≤ 60 ms |
| L6 unter 150 Hz – Python rendert, Python misst | −2,8 / −21,3 / −21,3 / −10,5 dB | (Start LP24 / Lösung BP12 / HP12 700 Hz / BP12 300 Hz) |
| L6 – Python rendert, App misst | −2,4 / −21,0 / −21,0 / −10,2 dB | Mess-Rechnung gleich auf 0,4 dB |
| L6 – App rendert, App misst | −3,6 / −21,6 / −22,7 / −11,2 dB | Engine gleich auf 1,4 dB |
| L8 Bonus Sinus gegen Rauschen, Osz 1 Anteil 0 / 10 / 15 / 20 / 30 % | −42 / −17 / −14 / −11 / −8 dB | Ziel −8 … −18, gut −10 … −15 |

¹ Der Python-Wert für D4 ist höher, weil sein Hochpass 4. Ordnung den Grundton durchsickern lässt; beide liegen klar unter −50 dB.

- Größe: roh 9 604 098 → 9 655 059 B; gzip KS1 3 178 286 → **3 195 011 B (+16,7 KB)**, KS1+KS2 zusammen **+38,0 KB (+1,2 %)** gegenüber der Basis
  (Konzept schätzte ≈ 30 KB für KS1–KS3 – schon jetzt etwas mehr).
- Block auswerten beim ersten Öffnen 4–12 ms (Rechner ausgelastet; KS1 1,8 ms). Messen 2,6 s (Phrase 2 s + Vorlauf), Auswerten < 0,1 s.
- **Startzeit** (`startzeit.mjs`, 3 Läufe abwechselnd, frischer Kontext): App bereit Basis 856/838/741 ms (Median 838), neu 786/684/748 ms
  (Median 748); DOMContentLoaded Median 724 → 597 ms. Unverändert (Rauschen, Last 6,6–7,4); der stille Block wird beim Start nicht ausgewertet.
- Paketordner 47 MB.

### Pflichtprüfungen

- `topdefs.cjs`: Skripte 26, Namen 8066, doppelt 0, Syntaxfehler 0; `blockcheck.cjs`: sq-ks-src 99,6 KB, oberste Namen `KSX`, Kollision 0,
  doppelte Schlüssel 0; `undef.cjs`: nur die bekannten Globalen `SQStore`/`SynthHost` (stehen nicht als `const` oben, laufen); `dupkeys.cjs` 0.
- Rauchtest `dirigent-test/smoke.mjs`: Titel SYNQUENZER, Fehler [] (`fotos/smoke.png`).
- „MS 2000“ 1×, `^  live: true,` 1×, VERSION '4.78.0'; Markenwörter Basis 123, neu 123, neuer Code 0; keine Emojis als Grafik.

### Offen

- L8: Rauschen 50 % mit LP24 besteht auch (über 3 kHz −72 dB, Ton steht nach 45 ms) – das LP24 nimmt das Zischen weg; das leichte
  Wackeln der Tonhöhe (±6 ct) prüft die Lektion nicht. Tipp und Lösung sagen „Rauschen etwa 4 %“.
- Messen hört vor dem Hall-/Echo-Bus: „nass“ prüft die Rechnung (Echo/Hall ≥ 30 %), der Pegel unter 150 Hz ist der trockene Klang.
- Pegelgleich heißt: gleicher Trockenpegel. Unterscheiden sich zwei Beispiele im Hall/Echo, zählt deren Fahne nicht mit (L5 Bonus 0,5 dB).
- L9 ohne Hör-Reihe „linear in Hz“ (Engine kann das nicht); weitere Hörbeispiele aus dem Konzept (F2, R06–R08, F3) nicht als Knöpfe.
- Die Treppe in L10 zeigt der Graph nur beim Spielen (E1), die Rechnung kennt den Zufall nicht.
- Offene Punkte aus KS1 bleiben (Hör mal über dem Song, ◆-Morph im laufenden Song, leere Verlaufseinträge, Making-of schweigt, kein
  „Spur anlegen“).
- Nächste Schritte laut Konzept: KS3 (Werkstatt W1/W2 + 19 Rezept-Karten), KS4 (E4–E7).

### Dateien (neu in KS2)

`ks2-test.mjs` + `ks2-test.out`, `ks1-test.ks2.out`, `src/apply-ks2.py`, `src/ks-block.ks1.js`/`src/ks-main.ks1.js` (Stand KS1, für apply-ks2),
`src/ks2-lessons.js` (Entwurf, eingearbeitet), `src/sonde-l6.py` + `sonde/` (WAVs + `sonde-l6.json`), `src/probe-ks2.mjs`, `src/probe-live.mjs`,
`src/probe-rings.mjs`, `src/probe-var2.mjs`, `src/probe-sonde.mjs`, `src/probe-bauch.mjs`, `src/probe-ab.mjs`, `src/probe-ab2.mjs`,
`src/probe-search.mjs`, `src/probe-sheet.mjs`, `fotos/ks2-*.png` (Blatt, je Aufgabe hochkant/quer, gemessen, Messen, Treppe).

## KS3 – Kapitel 6 „Werkstatt“: W1 Aufreißen, W2 Monster-Swell, 19 Rezept-Karten

Stand 17.11.2026, ~01:02 UTC. `index.html` md5 **639c421dc7f10b92c5de67a7da318115** (Sicherung davor: `index.vor-ks3.html` = Ergebnis KS2,
md5 c6f0b4ea). Gebaut mit `src/apply-ks3.py` aus `index.vor-ks3.html` + `src/ks-block.js` + `src/ks-main.js` (alte Stände
`src/ks-block.ks2.js`, `src/ks-main.ks2.js`). VERSION bleibt '4.78.0'. Basis rel-4780 unverändert (68e92c03).

### Änderung

- **Stiller Block `sq-ks-src`**: 99,6 → **148,2 KB** (1176 → 1532 Zeilen), weiter nur `KSX`, ausgewertet erst beim ersten Öffnen.
  - **Blatt**: Kapitel 6 „Werkstatt: zerlegt und Rezepte“ mit W1, W2 (je „4 Schichten“), darunter „Rezepte – 19 Klänge zum Laden“
    (kompakte Zeilen, ✓ wie bei den Lektionen). „Weiter mit …“ läuft nach L10 in W1, W2, R01 … weiter.
  - **W1 „Aufreißen zerlegt“** (werkzeug/machart.py `aufreissen_evt`, MACHART „Nachbau Synquenzer“): Säge Es1 −8/+8 ct + Säge +1 Okt.
    je 80 %, Rauschen 60 %, LP24, MONO. Schicht 1 Filterfahrt 100 Hz → 4,85 kHz in 2 s (Hör-Vergleich gleichmäßig gegen spät öffnend:
    Hüllk. 2 → Hüllk.-Menge 0,93 bei Hüllk.-Menge 0 = Produkt zweier Rampen ≈ x²); 2 Resonanz wandert (Hüllk. 2 → Resonanz 0 → 75 %);
    3 lauter und breiter (Hüllk. 2 → Lautstärke +100 %, → Uni-Verstimm. 0,4, Osz 1 Unison 3); 4 komplett (Drive FX 30 %, Hall 18 %).
  - **W2 „Monster-Swell zerlegt“** (`swell_evt`): Säge + Säge +9 ct, Sub Rechteck 30 %, Rauschen rosa 85 %. Schicht 1 aus dem Nichts
    (Amp-ATTACK 0 gegen 1,8 s; LP24 120 Hz → 4,4 kHz); 2 VOKAL u → a (Cutoff 5,06 kHz = u, Hüllk.-Menge −100 %); 3 Tonhöhenbogen
    (Hüllk. 2 → Tonhöhe +4 HT, alle Osz −3 HT: −3 → +1 → −1,8 HT) und Kehle (LFO 1 Sinus 28 Hz → Lautstärke ±35 %); 4 komplett
    (Drive 30 %, Chorus I, Hall 20 %).
  - **Werkstatt-Karte**: Kopf „Werkstatt · Schicht k/4“ + Titel der Schicht; ◀ ▶ wechseln zuerst die Schicht (an den Enden die
    Nachbar-Lektion), in der Rückmeldung zusätzlich „Schicht n ▶“. „Neu“ (was dazukommt), Zahlen aus dem Klang (Cutoff nach 1/1,5/2 s,
    Resonanz am Ende, Lautstärke-Zuwachs, Vokal je Zeitpunkt, Tonhöhenbogen – neu gerechnet bei jedem Dreh), „Warum“, Hör-Vergleich
    vorige gegen diese Schicht (pegelgleich), Graph, 2–3 Rahmen an den neuen Reglern. Jede Schicht lädt ihren Klang; die Drehs der
    vorigen Schicht fallen weg (↶ beginnt je Schicht am Anfang der Lektion). Letzte Schicht erreicht = erledigt.
  - **19 Rezept-Karten R01–R19** (REZEPTBUCH Abschnitt „Synquenzer“, werkzeug/rezepte.py): ladbarer Startklang = der „richtige“ Klang;
    Kopf „Rezept r/19“; Hör-Vergleich billig gegen richtig (bzw. zwei Varianten); „Wofür“; Werte-Zeile aus dem Klang („Werte: Typ BP12 ·
    Cutoff 700 Hz · LFO 1 → Cutoff +15 % …“, ändert sich beim Drehen); „Prinzip“ und „Klingt billig, wenn …“; 2–3 Rahmen; Knöpfe
    [◎ Was ist anders?] [Lade: …] [▶ Dein Stand] [Übernehmen]. Keine Aufgabe, keine Gerätenamen, keine Werksklang-Namen.
  - **Zweite Schicht laden** („Lade: …“, ein ↶, noch einmal = wieder der Startklang): R03 Sirene Yelp, R05 Gischt (HP12, 7 dB unter dem
    Körper), R09 Impact-Körper (3 dB unter dem Sub, mit Hall 45 %), R10 Rauschfahne, R11 Wasserblasen, R19 Brüllen VOKAL.
  - **Übernehmen**: Name „Schule: <Karte>“ bzw. der geladenen Schicht („Schule: Gischt“), ein ↶ „Klangschule: …“; Rezept = erledigt.
  - **◎ Was ist anders?** ist die vorhandene Funktion (`wiaToggle`): weiße Punkte an den Reglern, die den Klang machen. ✕ / Übernehmen
    stellen den Zustand von vorher wieder her.
  - **Fortschritt**: Werkstatt = letzte Schicht erreicht; Rezept = „Richtig“ gehört oder übernommen (`uiPrefs().ks`, nicht im Projekt).
  - **Rechnen**: Hüllk. 2 jetzt auch → Hüllk.-Menge (clamp wie control()), → Cutoff (× 120 HT), → Lautstärke (× (1 + Menge)); L1–L10
    unverändert (ks1/ks2-Test).
  - **Pegel**: jeder Startklang (8 Schichten, 19 Rezepte) auf **−24 LUFS** geeicht (offline, dasselbe Worklet, über die Phrase der Karte;
    Tabelle `LV`). Beim Pegelabgleich (Hör-Vergleich, Eichung) rechnet die Karte jetzt den **Spur-Drive** (tanh-Kennlinie wie
    `driveCurve`, Ausgleich 1/(1 + 1,5 · Drive)) und die Spur-Lautstärke auf den Offline-Render; vorher klang W1 Schicht 4 am Master
    6 dB lauter. Klänge mit Drive: Pegel vor dem Drive wie ohne, Eichung über die Spur-Lautstärke dahinter (die Verzerrung bleibt wie
    gedacht). Zufall (S&H, R11/R12): Mittel aus 3 Renderläufen.
  - Rahmen-Etiketten, die rechts aus dem Bild ragen würden, rücken nach links (betrifft auch L1–L10, nur wenn es eng ist).
  - Werte in den Einheiten des Rezeptbuchs: Hz, s, Anteile; Mod-Mengen als Engine-Menge (Tonhöhe 1 = 24 HT, Cutoff `kc(Anzeige-%)`,
    Hüllk.-Menge-Route 0,93 = Anzeige 47 %, Resonanz-Route in Resonanz-Einheiten).
- **Hauptskript, KS-Block**: 21 Such-Einträge (W1, W2, R01–R19), Kopf-Kommentar. **Keine neuen Haken, Engine unverändert.**
- **Sichtbar neu** nur in der Klangschule (Kapitel 6 im Blatt, Werkstatt- und Rezept-Karten). Kein neuer Knopf, Regler und Seiten unverändert.

**Abweichungen vom Konzept / Rezeptbuch:**
- Kein eigenes **Generator-Skript** (Konzept KS3): die Werte stehen in Rezeptbuch-Einheiten direkt im Block; die Übereinstimmung mit
  den Hörbeispielen prüft der Test gegen `machart.json` und gegen die gemessenen Zahlen von `messen_rezepte.py` (gleiche Messart).
- W2 Schicht 2: VOKAL u → a braucht **Hüllk.-Menge −100 %** (72 HT, die Vokale liegen 18 HT auseinander), nicht −50 % wie in
  MACHART (das reicht nur bis „i“). Der Weg ist u-o-i-e-a; Filter-KURVE 0, damit „o“ früh kommt (0,5 s; Vorbild 0,84 s).
- W2: der „Körper“ des Vorbilds (zweites Filter) fehlt – eine Spur hat ein Filter (E6 „zweites Filter“ = KS4). Schicht 4 sagt das.
- W1: der Einschlag ist eine eigene Spur (Verweis auf Rezept „Impact“); die Breite kommt aus Uni-Verstimm., nicht aus 9 ms Versatz.
- R05, R09: zwei Spuren im Rezept → „Lade: …“ für die zweite Schicht; der Knall von R09 fehlt.
- R02 billig: die Engine fährt die Tonhöhe immer in Halbtönen („linear in Hz“ geht nicht) → billig = Sinus, 450 ms.
- Hör-Vergleiche nur mit Unterschied im Klang, Hall/Echo gleich: R02 billig und R16 Waah mit Echo, R15 billig mit Chorus (sonst 1,6 dB
  am Master). Ausnahme R15 Hall 45/15 % und W1/W2 Schicht 4 (der Unterschied ist dort das Thema).
- R04: billig = ein LFO 0,5 Hz; beide LFOs mit Neustart (gleicher Pegel je Wiedergabe). R10: Whoosh-Gate = A + D (Python: Gate = A).
  R14: Vibrato ±14 ct (0,6 %) statt „+1 %“ (= ±24 ct). R06: Länge 2 Takte minus 1/8 im Song-Tempo (bis 9,5 s), nicht fest 5,75 s.
- Wasserblasen: die Karte spielt den Blubbern-Rhythmus; unregelmäßige Noten spielt man selbst.

### Tests

`ks3-test.mjs` (Ausgabe `ks3-test.out`, Protokoll `ks3-test.log`): **209/209**, hochkant 390×844 und quer 844×390, Chromium, Berührung.
- je Ausrichtung: stiller Block beim Start nicht ausgewertet; Blatt über ≡ › Wo finde ich …? › Klangschule: Kapitel 6 mit W1, W2 und
  19 Rezepten, Antippen „Sirene“ öffnet die Karte; Suche (Hubschrauber, Aufreißen, Monster-Swell, Downlifter, Sirene, Wind, Riser),
  Sprung öffnet W2; W1/W2 je 4 Schichten: lädt, 2–3 Rahmen auf sichtbaren Zielen (±2 px), Karte im Bild ohne Rahmen zu verdecken,
  Zahlen + „Warum“ + Knöpfe, ↶ beginnt je Schicht neu, Weiterschalten per Fingertipp („Schicht 2 ▶“ und Kopf ▶), Kopf ◀ zurück,
  letzte Schicht = erledigt; 19 Rezepte: lädt (Kopf „Rezept r/19“), Rahmen, Karte, Werte-Zeile, Prinzip, „Klingt billig, wenn …“,
  Knöpfe (mit „Lade: …“ genau bei den 6 zweischichtigen); ◎ Was ist anders? per Fingertipp (R16: Punkte an 5 Reglern der sichtbaren Seite), ✕ per Fingertipp
  stellt es zurück; danach Projekt **bitgleich** (mit und ohne Ansicht); keine Fehler in der Konsole.
- hochkant zusätzlich:
  - **Rechnen gegen machart.json**: W1 Cutoff bei 0/1/1,5/1,75/2 s 100/323/1094/2230/4496 Hz gegen 100/305/1010/2184/4524 Hz
    (≤ 0,11 Okt.); Lautstärke-Zuwachs +6,0 dB gegen +6,9 dB; W2 Tonhöhe −3/+1/−1,8 HT gegen −3/+1/−1,7 HT; VOKAL u (5055 Hz) → a (79 Hz).
  - **Pegel**: alle 8 Schichten und 19 Startklänge −24 LUFS ±1 dB (S&H als Mittel aus 3 Läufen); zweite Schichten Gischt −31,
    Impact-Körper −27,5, sonst −23,9 … −24 LUFS.
  - **A/B am Master** (live, hear + Mitschnitt): W1/1 0,2 · W2/1 0,0 · R01 0,1 · R02 0,2 · R08 0,2 · R12 0,8 · R16 0,1 · R18 0,1 dB
    (±1 dB); mit Hall-/Drive-Unterschied R15 1,5 · W1/4 0,6 · W2/4 1,2 dB (≤ 1,5 dB).
  - „Richtig“ gehört = Rezept ✓ (R17), Fortschritt nicht im Projekt.
  - **Übernehmen** aller 19 Rezepte + W1: je genau ein ↶ mit dem Namen der Karte, ↶ danach bitgleich; Fingertipp „Lade: Gischt“
    = ein ↶ (HP12, Knopf zeigt „Lade: Meer“), Übernehmen dann „Schule: Gischt“, ↶ bitgleich.
  - **Sonde gegen den Python-Nachbau** (Messart von `messen_rezepte.py`, App-Klang offline, trocken): R16 Schwerpunkt 10/80/200 ms
    Waah 1457/1267/801, Tock 633/565/448 Hz (Python 2065/1445/624, 747/385/405); R08 Plus 1780 → 270 → 163 Hz fällt, Minus 3236 → 245
    → **2948 Hz** im Release (Python 3245 → 413 → 1423: geht wieder auf); R13 Pfeifton 384/837/1695/2054 Hz (Python 384/795/1700/2200,
    ≤ 1,2 HT); R06 Schwerpunkt 1361 → 2618 → 5172 → 8155 Hz (Python 1,3 → 7,7 kHz); R07 Schwerpunkt 689–724 Hz (Python 770–820 Hz).
- `ks1-test.mjs` auf dieser Fassung **75/75** (`ks1-test.ks3.out`), `ks2-test.mjs` **149/149** (`ks2-test.ks3.out`, mit Sonde). In
  `ks2-test.mjs` eine Zeile angepasst: das Blatt hat jetzt 6 Kapitel (Prüfung „genau 5“ → „mindestens 5“).

### Pflichtprüfungen

- `topdefs.cjs`: Skripte 26, Namen 8066, doppelt 0, Syntaxfehler 0; `dupkeys.cjs` 0; `blockcheck.cjs`: sq-ks-src 143,1 KB (Zeichen),
  oberste Namen `KSX`, Kollision 0, doppelte Schlüssel 0; `undef.cjs`: nur die bekannten `SQStore`/`SynthHost`.
- Rauchtest `dirigent-test/smoke.mjs`: Titel SYNQUENZER, Fehler [] (`fotos/smoke.png`).
- „MS 2000“ 1×, `^  live: true,` 1×, VERSION '4.78.0'; Markenwörter Basis 123, neu 123, neuer Code 0; keine Emojis als Grafik
  (neu nur ◎, das die App schon nutzt).

### Messungen

- **Größe**: roh 9 655 104 → 9 702 863 B; gzip 3 195 019 → **3 210 094 B (+15,1 KB)**; KS1–KS3 zusammen **+53,1 KB gzip (+1,7 %)**
  gegenüber der Basis (Konzept schätzte ≈ 30 KB – vor allem die Texte der 19 Rezepte und 8 Schichten).
- **Startzeit** (`startzeit.mjs`, 3 Läufe abwechselnd, frischer Kontext): auf e1e08493 (Stand vor dem Etiketten-Rand, Unterschied nur
  eine Zeile im stillen Block) bei Last ≈ 6: App bereit Basis 761/890/781 ms (Median 781), neu 929/758/797 ms (Median 797); auf der
  Endfassung bei Last ≈ 10: Basis 2015/2001/829, neu 1111/2493/818 ms (Rauschen). Unverändert im Rahmen des Rauschens; der Block
  wird beim Start nicht ausgewertet (Test).
- Pegel-Eichung offline je Klang 0,2–0,6 s (einmal je Karte, 0,6–0,9 s nach dem Öffnen vorab, wie KS1/KS2).
- Paketordner 60 MB.

### Offen

- Hall-/Echo-Fahnen zählen beim Pegelabgleich nicht mit (R15: 1,5 dB am Master); der Drive wird jetzt mitgerechnet.
- Der Körper (zweites Filter) in W2 und der Knall in R09 fehlen bis E6 (KS4); W1 ohne Einschlag (eigene Spur).
- Die Werkstatt-Schichten tauschen den ganzen Klang: wer in Schicht 2 dreht und dann zu Schicht 3 geht, verliert die Drehs
  (gewollt: jede Schicht ist ein sauberer Vergleich; „Übernehmen“ nimmt die aktuelle Schicht).
- Quer ist die Karte oft nur ~170 px hoch: „Schicht n ▶“ und die Tipps liegen dann im rollenden Teil (Kopf ▶ ist immer sichtbar).
- Hörbeispiele der Rezepte sind nicht angehört (wie in KS1/KS2: nur gemessen).
- Offene Punkte aus KS1/KS2 bleiben. Nächster Schritt laut Konzept: KS4 (E4–E7).

### Dateien (neu in KS3)

`ks3-test.mjs` + `ks3-test.out` + `ks3-test.log`, `ks1-test.ks3.out`, `ks2-test.ks3.out`, `startzeit.ks3.out`, `index.vor-ks3.html`,
`src/apply-ks3.py`, `src/ks-block.ks2.js` / `src/ks-main.ks2.js` (Stand KS2, für apply-ks3), `src/probe-keys.mjs` (Regler je Seite),
`src/probe-ks3.mjs` (Karten + Lautheit, für die Eichung), `src/probe-rnd.mjs` (Streuung der S&H-Klänge), `src/probe-shot.mjs`,
`fotos/ks3-*.png` (Blatt, W1/W2 Schicht 1 und 3, R01/R05/R12/R19, hochkant und quer), `fotos/p-ks3-*.png` (Probe).
