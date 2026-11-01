# SX126 – Status

Datei: `bau/helfer/SX126/index.html` (Basis R-4300, App 4.30.0, VERSION unverändert). Patch: `patch.diff` (341 + / 2 −).
Tests: `tests/alle.sh` (einmal im Repo-Wurzelordner `ln -s "$(npm root -g)" node_modules`, weil die Tests ESM-`import` nutzen).

## Testtabelle (letzter Lauf: 12 OK, 0 FEHLER)

| Test | Prüft | Ergebnis |
|---|---|---|
| t0-regeln | 1× `  live: true,`, verbotene Wörter 0, „MS 2000“ 1×, VERSION 4.30.0, kein Netz/Datenbank im SX126-Code, jede neue Altzeile mit `SX126`, kein ✂-Zeichen, kein „×4/÷4“ für Schläge | OK (2 Altzeilen geändert, 18 neue Zeilen außerhalb der Blöcke, alle markiert) |
| t1-sx1-render | Rampe exakt (Offline, Konstante 1): monoton, −60 dB 0,05–0,08 Schlag vor dem Ende; Video-Render 2/4 Takte: monoton, vorher unverändert (±0,5 dB), Ausklang 0, −60 dBFS 0,62 Schlag vor Ende; WAV-Export (GarageBand) 0,63 Schlag vor Ende | OK |
| t2-sx1-live | ohne Wert Knoten immer genau 1; Live 2 Takte: Dauer 3,200 s = 2 Takte, monoton, am Ende 0, danach wieder 1; ■ mitten drin: still, dann 1; Neustart in der Pause sofort 1; Schleife an: kein Ausblenden | OK |
| t3-sx1-abspann | fertiges MP4 mit Abspann-Logo: letzter Schlag −75 dBFS, Abspann still, Länge = Song + Abspann (20,16 s soll 20,14 s); Auswahl Takt 1–6 endet am Auswahl-Ende; ohne Ausblenden wie bisher mit Ausklang | OK |
| t4-format | altes Projekt aus R-4300 lädt/speichert Zeichen für Zeichen gleich, Format 5; Master-Kette bitgleich zu R-4300 (Hash gleich); song.fade: 1 Undo, Speichern/Laden, R-4300 liest die Datei; ganzer Song R-4300 vs SX126: gleiche Noten (254), gleiche Länge, Pegel je Schlag ≤ 0,04 dB | OK |
| t5-sx2 | Messer per Tipp (44 × 44), nicht an der Teilkante; „Refrain A \| Refrain B“; Noten-Log vorher = nachher, Pegel ≤ 0,05 dB; 1 Undo = exakt vorher; „Refrain B“ → „B \| C“; [Bei Takt …] → Takte (44 px) → teilt | OK |
| t6-sx6 | 4 Vorlagen; [Aus Vorlage …] → Synthpop 84 = 8 Marken, 52 Takte, keine Clips, still; 1 Undo zurück; mit Inhalt keine Vorlage | OK |
| t7-bilder | 428×926, 926×428, 428×650: Marken-Blatt letzter Teil, Messer, Blatt „Video“, leerer Song, Vorlagen; alle neuen Tasten ≥ 44 px, nichts ragt hinaus, Bedienspalte rollt nicht | OK |
| smoke, v3-mk8-smoke, v3-mk8b-smoke, v3-qa-mk5reg-smoke | Laden ohne Fehler | OK |

Hinweis: Ganze Song-Renders sind schon in R-4300 nicht bitgleich zwischen zwei Durchläufen (Zufall im Klang). Darum ist
„Renders bitgleich“ an der Master-Kette mit festem Eingang bewiesen und am ganzen Song über Noten-Log + Pegel je Schlag.

## Abnahme

- **SX1:** Pegel fällt monoton, liegt am Ende ±1 Schlag unter −60 dB (Live, Video, WAV); ohne Wert Datei byte-gleich. ✔ (gemessen)
- **SX1 + Abspann:** Musik ist am Abspann-Beginn ausgeblendet, Abspann still, Länge stimmt. ✔ (gemessen) – Deutung siehe CHANGES Frage 1.
- **SX2:** Tipp auf Taktstrich → Messer → teilt; Blatt [Bei Takt …]; klingt gleich; 1 Undo. ✔
- **SX6:** Vorlage legt leere, benannte Marken an; 1 Undo. ✔
- Ob es **gut klingt und sich gut anfühlt**, ist erst mit Xanders Okay fertig.

## Bitte prüfen (iPhone)
1. Song mit Ausblenden „4“ im letzten Teil abspielen: Klingt das Ausblenden natürlich? Ist am Ende nichts mehr vom Hall zu hören?
2. Video (30 s, Auswahl) mit Ausblenden „2“ + Abspann-Logo erstellen und anhören: Ende sauber? (Beispiel: `tests/ergebnis/abspann-2takte.mp4`, mit Test-Logo)
3. Refrain öffnen (zweimal antippen), dann genau auf einen Taktstrich tippen: Ist das Messer gut zu treffen (±12 px)? Bild: `tests/bilder/sx2-messer-428x926.png`.
4. Marken-Blatt: [Bei Takt …] neben „Als neuen Teil konsolidieren“ – passt der Platz? Bild: `tests/bilder/sx1-markenblatt-428x926.png`.
5. Leerer Song → [Aus Vorlage …]: passen die 4 Vorlagen und Namen?
6. Blatt „Video“ hochkant bei kleiner Höhe: Vorschau ist eine Zeile niedriger – ok?
