# MLG2 – Klänge aus der DAW übernehmen (DAW-Projekt-Import) + „↳ EQ wie in der DAW“

Basis: R-4790 (Synquenzer 4.79.0, md5 d29d696f), VERSION bleibt 4.79.0. Bau: `python3 apply.py` → `index.html` (md5 8d16875a, bitgleich wiederholbar).
Blöcke `/* MLG1-BEGIN … MLG1-END */` (MLG1 portiert) und `/* MLG2-BEGIN … MLG2-END */` nach XLA-END, dazu einzeilige Haken (Kennung MLG1 / MLG2,
`mlg2-hooks.py`). Keine Songdaten, keine Songtitel, keine Markennamen im Code: Effekte werden über Kennzahl + Anzahl der Werte erkannt.

## 1. Was gebaut ist

| Teil | Wo | Was |
|---|---|---|
| MLG1 auf 4.79 | `mlg1-block.js` | unverändert bis auf: `.cbp`-Leser gibt je Synth-Spur zusätzlich `id` (Bus) und `fx` (Effekte: Kennzahl, an, Werte) zurück; Blatt-Zeile zeigt „· EQ“ / „· Amp (kein EQ)“; nach dem Laden `mlg2Hint` |
| EQ-Modell | `mlg2Core().curve(fx)` | Kurve (28 Terzen) der eingeschalteten EQ-Effekte der DAW-Spur: 4-Band-EQ (Cut / Shelf / Glocke), Shelf-EQ, Filter (TP/HP/BP). Amp-Simulation an → kein EQ (nicht linear, MLG1-Regel) |
| EQ-Fit | `mlg2Core().fit(db)` / `eqOf(fx)` | Spur-EQ der App (`track.mix`: Low-Cut ≤ 500 Hz, Bass 150 Hz, Glocke, Höhen 6 kHz) mit der echten Kennlinie (dieselben Biquads wie `mx1Core().eqDb`), Nelder-Mead, 6 Starts, Form ohne Pegel; Bänder > 30 dB unter der Spitze zählen nur, wenn die App dort lauter ist. ≈ 10 ms je Spur |
| Import-Wahl | Blatt „DAW-Projekt öffnen“ › **Klang**: „Klänge aus der DAW übernehmen“ \| „Werksklänge“ | vorgewählt an, wenn die Datei Spuren des analogen DAW-Synths mit lesbaren Werten hat (sonst kein Abschnitt). „Passt“: jede importierte Synth-Spur dieses Synths bekommt den Klang des Übersetzers (`mlToVa`), dazu `track.mix` aus ihren EQ-Effekten; Projekt-Echo vom Delay der ersten Spur (st, links X / rechts X/2). Alles im selben ↶ wie der Import (Eintrag `xla`); „Werksklänge“ = Import wie bisher (bitgleich, getestet) |
| Klang-Browser | „Aus DAW-Datei“ → Zeile → **„↳ EQ wie in der DAW“** | Knopf neben „↳ Hall/Echo wie im Preset“, nur wenn die geladene Spur einen EQ hat; setzt nur die EQ-Felder (Kompressor/Make-up der Spur bleiben), eigener ↶ (Eintrag `mixa`) |

Ablauf im Import: die Datei wird vor der Übergabe an den Worker kopiert (`mlg2Keep`), nach dem Lesen im Hauptfaden mit dem MLG1-Leser
ausgewertet (`mlg2Open`, nach einem Yield); „Passt“ rechnet Klänge + EQs vorab, eine Spur je Aufgabe (`mlg2Prep`, keine Long Task), dann
setzt `xlaProject` sie ein (`mlg2Track`, `mlg2Echo`). Danach greift die CPU-Regel der Spuren 6–8 (Stimmenzahl) wie bisher.

Haken (je eine Zeile, Kennung MLG2): `xlaFile` (Kopie + Lesen), `xlaHtml` (Abschnitt Klang), `xlaTap` (Wahl), `xlaApply` (vorab rechnen),
`xlaProject` (Klang/EQ je Spur, Echo), `buildBrowser` (Knopf). Sichtbar neu: der Abschnitt „Klang“ im Import-Blatt und der Knopf
„↳ EQ wie in der DAW“ – beide verlangt (Aufgabe MLG2), sonst ändert sich nichts an Aussehen oder Bedienung.

## 2. EQ-Modell (Einheiten, geprüft gegen die gemessenen Effekt-Kurven K4a)

- 4-Band-EQ: Frequenz **13·4200^n Hz** (besser als die Kandidat-Formel 20·1000^n: mittlere Abweichung 0,96 statt 1,40 dB über 16 Kurven),
  Gain −24 + 48·n dB, Güte 0,5 + 9,5·n; Band 1/4 Typ 3 = Cut 12 dB/Okt (−6 dB bei f), Typ 2 = Shelf, sonst Glocke.
- Filter: 97,1·82,3^n Hz (Kalibrierung), Güte 0,71 + 3,5·Resonanz; Typ 0 Tiefpass, 1 Hochpass, 2 Bandpass.
- Shelf-EQ: Bass 200 Hz / Höhen 12 kHz, −24…+24 dB (nur eine Einstellung im Projekt gemessen – angenähert).
- Modell gegen die 16 gemessenen Kurven: Mittel 0,96 dB Formfehler (Einzelwerte 0,3–2,1 dB).

## 3. Messung mit der echten Projektdatei (nur lokal; Tabelle je Spur privat unter `cubasis/nachbau/mlg2/KLANG-EQ-MLG2.md`)

- Import auf dem echten Weg (Wahl an, Fassung A in Gruppen zu 7 Spuren): **15 von 15 Synth-Spuren mit Noten haben den Klang**, 7 bekommen
  einen Spur-EQ, 3 mit Amp-Simulation keinen. „Passt“ rechnet 43–105 ms je Gruppe, in Aufgaben je Spur.
- Terzband-Abweichung gegen die Stems, Fenster B (wie Kalibrierung MLG1, n = 14):
  **nur Klang 6,6 dB (3 Spuren ≤ 3 dB) → Klang + EQ aus der DAW 5,0 dB (5 Spuren ≤ 3 dB)**; nur die 6 Spuren mit EQ: 7,3 → 3,6 dB.
  Zum Vergleich MLG1: Inserts mit gemessenen Kurven 5,1 dB, gelernter EQ mit Stems 3,4 dB – MLG2 braucht weder Stems noch Messkurven.

## 4. Tests

- `node mlg2-test.mjs index.html` – Playwright, Touch per CDP, echter Datei-Wähler, 428×926 + 926×428, Fotos DPR 2: **42 OK, 0 FEHLER**
  (Abschnitt Klang vorgewählt, Tippflächen ≥ 44 px, im Bild; Wahl per Touch; „Passt“ → Klang = Übersetzer, Spur-EQ = Modell, Amp-Spur ohne EQ,
  Echo st 1/4. | 1/8. 12 %; genau EIN ↶; ↶ → voriges Projekt unverändert, ↷ bitgleich; Speichern/Laden bitgleich; „Werksklänge“ = XLA wie bisher;
  kaputte Datei → „Die Datei ist unvollständig oder beschädigt …“; Klang-Browser: Zeilen „EQ“/„Amp (kein EQ)“, „↳ EQ wie in der DAW“ mit eigenem ↶/↷,
  Amp-Spur ohne Knopf; EQ-Fit ≈ 10 ms je Spur; keine Konsolenfehler). Ausgabe `mlg2-test.out`.
- MLG1 auf der neuen Basis: `mlg1-core-test.mjs` **33/33**, `mlg1-test.mjs` **33/33**.
- Testdatei `tests/mlg2-song.cbp` (+ `-kaputt.cbp`) aus `tests/gen_mlg2.mjs` (synthetische XLA-Testdatei + eigene Werte/Effekte, neutrale Namen).
- Pflicht (`pflicht.sh` → `pflicht.out`): topdefs 0 doppelt / 0 Syntaxfehler, dupkeys 0, Rauchtest ohne Fehler, „MS 2000“ 1×, „live: true,“ 1×,
  VERSION 4.79.0, Markenwörter nicht mehr als Basis, keine Emojis; Größe +43,8 KB roh / +15,3 KB gzip (MLG1 + MLG2).
- Startzeit (3 Läufe je Fassung, frischer Kontext, abwechselnd): „App bereit“ Median Basis 551 / neu 574 ms, DOMContentLoaded 482 / 503 ms
  (`startzeit.out`; bei MLG1 lag der Unterschied im Rauschen, hier nur 3 Läufe).

Fotos: `fotos/mlg2-{p,l}-blatt.png`, `-importiert.png`, `-liste.png`, `-eqknopf.png` (+ MLG1-Fotos, `smoke-end.png`).

## 5. Offen / Merge-Hinweise

- Der „Bericht je Spur (Klang)“ im Import-Blatt kommt aus dem Worker und beschreibt weiter den XLA-Klang, nicht den übernommenen.
- Fassung A: höchstens 7 Synth-Spuren je Import (MAX_T 8) – mit Fassung B (XLB) gilt dieselbe Wahl für alle Spuren.
- Ein Echo für alle Spuren (erste Spur mit Delay); verschiedene Delay-Werte brauchen „Delay je Spur“.
- Shelf-EQ-Einheiten nur aus einer Einstellung; Kanalzug (Cut-Filter, Kompressor) und Kompressor werden nicht übertragen.
- Merge mit CMD2: beide hängen an `xlaProject`/`xlaApply` – Haken-Zeilen sind getrennt (MLG2 nur Synth-Spuren, CMD2 Drums).
