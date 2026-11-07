# VD4 – Regie-Vorschau live beim Komponieren

## Für Xander
- Neu: ein kleines Fenster (Bild im Bild) über Matrix bzw. Song. Es zeigt beim Abspielen live, was dein Video an dieser Stelle filmt, mit denselben Ansichten und Schnitten wie das fertige Video (Auto-Regie, deine Wahl in der Video-Spur, deine Regeln).
- Einschalten: Video-Blatt › Extras › „Live-Vorschau beim Komponieren“ (oder im Guide „Live-Vorschau“ suchen). Ausschalten: ✕ im Fenster.
- Oben links im Fenster schaltest du zwischen „Regie“ (was gefilmt wird) und „App“ (das Bild der Original-App im Video) um.
- Wenn du aufs Bild tippst, öffnet sich die Ansichtswahl der Video-Spur für genau diese Stelle (Klavier, Gerät, Noten …). Wenn du es ziehst, dockt es an der nächsten Ecke an. Die Ecke wird gemerkt, hochkant und quer getrennt.
- Ist das Fenster aus, kostet es nichts. Ist es an, zeichnet es höchstens 10 Bilder pro Sekunde, und nur, wenn es sichtbar ist.

## Technik
- Eigener Block `/* VD4-BEGIN … VD4-END */` direkt nach VD3-END (Zeilen 77683–77952), Präfix `vd4`/`VD4`. Die Einhänge-Zeilen (je 1 Zeile):
  1. `uiFrame()`, Ende: `if (VD4 && VD4.on) vd4Frame();` (aus = nur diese Prüfung, `var VD4` → keine Zeitfalle beim Start)
  2. `vvOpen()` nach `vd3VvRow(...)`: `vd4VvRow(VD3 && VD3.ui);`
  3. `ui1Entries()` nach `makingof`: Guide-Eintrag `vd4live`
  4. `Object.assign(SYNQUENZER, {vd4: VD4_API});` (Test-API) nach der VD3-Zeile
- VERSION/CHANGES nicht angefasst. Nichts im Projekt: Die Geräte-Einstellungen sind `uiPrefs().vd4on`, `vd4m` ('regie'|'app') und `vd4pos` ({p, l}: 'tl'|'tr'|'bl'|'br').
- Keine doppelte Funktion: Das Bild kommt aus der vorhandenen Video-Engine. Regie = `vvRun({view, range: 0..bars})` (`vvCuts` mit VD3-Schnitt-Spur und VR1-Regeln) + `vvDraw` (wie das ▶ Vorschau des Blatts und der Encoder). App = `vvDrawApp(..., {rt})` mit eigenem Lauf. Live-Zustand `vvLiveState()`. Standbild wie `vvStill` an `songStartBar()`, 2 Schläge + Blende in den Takt hinein (also nicht der kurze Fokus/die Überblendung des Schnitts). Format, Bild und 9:16-Art kommen aus dem Video-Blatt. Tippen = `vd3ChipPop` (VD3-Menü) mit dem Chip der Stelle.
- Fenster: `div.vd4w` in `#gridArea` (absolut, z-index 7; über Matrix/Song, unter Einzähler, Blättern, Menü, Fenstern, Toasts). Größe: 9:16 = 110×196 hochkant und 88×156 quer, 16:9 gedreht. Leinwand höchstens 2× Pixel.
- Ankerfläche: Matrix zwischen Spurköpfen (.th), Stopp-Spalte (.stp), Szenen-Kopf (.scn) und Teil-Leiste. Song unter der Taktleiste (inklusive Video-Spur/Streifen) und rechts der Spaltennamen. Neu ausgelegt wird, wenn sich Fenster, #gridArea, SV.w/h, rulerH, Spurzahl oder Format ändern. ✕ und Umschalter sind 44×44 Trefferfläche, die Pillen nur Optik. Die Beschriftung unten folgt den Video-Spur-Chips: voll = deine Wahl, gestrichelt = Auto.
- Kosten: Zeichnen nur bei Wiedergabe (10/s, beim Aufnehmen 5/s) oder bei Änderung (Signatur alle 250 ms: Song-Version, Regeln, Position, Wahl, Spur). Kein Bild, wenn ein Blatt, R.editor, das Menü, ein hohes Fenster (UI.pop.sheet) oder das Video-Blatt offen ist, gerendert wird oder die Seite verdeckt ist. Dazu prüft ein Treffertest alle 250 ms die Fenstermitte. Aus = Element und Leinwand weg (Breite 0 → iOS gibt den Speicher frei).
- Video-Blatt: Hochkant ist „Live-Vorschau beim Komponieren · an/aus“ eine eigene Zeile im Extras-Kasten. Die Bühne gibt dafür 48 px ab, [Vorschau]/[Video erstellen] bleiben an derselben Stelle. Quer liegt die Zeile „Extras“ unter dem Vorschaubild (wie Abspann/Ausblenden, eigene grid-row 4). Die rechte Bedienspalte bleibt dadurch unverändert, [Video erstellen] ist auch bei 926×370 ohne Rollen erreichbar.

## Tests
`node vd4-test.mjs <index.html> <ordner>` → **27/27 OK** (Fotos und `vd4-cpu.json` in `fotos/`):
- 01/02: Aus (Grundstand): kein Element und kein Stil, beim Abspielen 0 Bilder. Matrix-Bild und Song-Fläche sind pixelgleich mit 4.48.1, alle Flächen liegen gleich.
- 03/04: Video-Blatt hochkant und quer (428 und 370): Die Zeile hat 44 px. Die VD3-Tasten und [Vorschau]/[Video erstellen] liegen wie vorher, die Bedienspalte quer ist identisch (scrollHeight/clientHeight).
- 05/06: Guide („live vorschau“ findet den Eintrag, der Sprung zeigt die Taste). Fingertipp schaltet ein. Unter dem Blatt entsteht kein Bild, nach ✕ des Blatts zeichnet das Fenster.
- 07–10: Hochkant Matrix und Song (auch mit Video-Spur): Es überlappt keines von Kopf, Spurköpfen, Stopp-Spalte, Szenen-Kopf, Teil-Leiste, Spur-Zeile, Träger, Modusleiste, Tastatur, Song-Tasten, Taktleiste und Spaltennamen. ✕ und Umschalter ≥ 44, nichts verschiebt sich.
- 11: Live = Video-Render, an 3 Stellen (Teil-Anfang „App“, neuer Clip „Noten · SYN 2“, deine Wahl „Klavier“). Ein Messfühler um `vvDrawRun` liest `rt.cur` (Ansicht, Spur, Schnitt-Nr.) für den echten Render (vvMake/WebCodecs, 846 Bilder) und für die Live-Wiedergabe. Je Stelle stimmen 23 Live-Bilder mit dem Render-Bild desselben Song-Schlags überein (±0,03 Schläge). Fotos: `vd4-live-takt{1,5,9}-fenster.png` neben `…-video.png`.
- 12/13: Regie ⇄ App per Finger: Das Bild wechselt und ist beim Zurückschalten wieder gleich, die Wahl wird gemerkt. App läuft live mit der Matrix (≈ 10/s), Regie steht dabei (0 Bilder).
- 14: Tippen öffnet das VD3-Menü „Video · Takt 5–6“. Wählst du „Klavier“, zeigt das Fenster sofort Klavier (volles Schild), ↶ führt zurück zu Auto (gestrichelt).
- 15/16: Ziehen per CDP-Touch: Das Fenster folgt dem Finger, dockt beim Loslassen oben links an, öffnet kein Menü, das Projekt bleibt gleich. Nach Neuladen liegt es an derselben Ecke.
- 17–19: Kosten (Headless, Song spielt, je 5 s, 2 Läufe). An: 10 Bilder/s, 1,6–1,9 ms/Bild (max 6–7 ms), also etwa 1,6–1,9 % eines Kerns fürs Zeichnen. Hauptfaden gesamt: an 175 ms/s, aus 131 ms/s (inklusive Rasterung/Übergabe der Leinwand, Software-GL im Test). Verdeckt (Klang-Editor bzw. Mix & Master): 0 Bilder. Stillstand ohne Änderung: 0 Bilder. Aus per ✕: 0 Bilder, kein Element.
- 20/25: Nichts von VD4 steht im Projekt. Ein altes Projekt aus 4.48.1 lädt gleich, auch mit Fenster an (Projekt-Datei identisch bis auf zufällige uid/id).
- 21–24: Quer 926×428 und 926×370 (Matrix und Song, live) mit 88×156 frei, ✕ sichtbar. Quer und hochkant haben je ihre eigene Ecke. 16:9 ergibt 196×110.
- 26/27: Pflichtwörter (keine verbotenen Namen, „MS 2000“ 1×, „  live: true,“ 1×, keine Emojis im Block), keine Konsolenfehler.
- Pflichtprüfungen: topdefs 0/0 (5767 Namen), dupkeys 0, smoke `errors []`.

## Offen / Hinweise
- Das Fenster verdeckt notwendigerweise ein Stück Inhalt (unten rechts: hintere Szenen bzw. hintere Takte). Ziehen oder ✕ helfen. Eine kleinere Größe wäre möglich, wenn Xander das möchte.
- Die Regie im Fenster gilt immer für den ganzen Song. Ist im Video-Blatt nur eine Auswahl eingestellt, kann der erste Schnitt dieser Auswahl im Video anders beginnen (Teil-Anfang = App).
- Spielt nur die Matrix (ohne Song), zeigt „Regie“ ein Standbild der Song-Stelle, „App“ läuft live mit.
- Lauflichter-Schalter (PL1, parallel): Das Fenster richtet sich noch nicht danach. Es lässt sich aber mit ✕ ganz abschalten.
- Die CPU-Werte stammen aus headless Chromium mit Software-Rasterung. Auf dem iPhone 12 Pro Max bitte einmal mit Wiedergabe gegenprüfen (Gefühl/Akku).
- Das VD3-Menü bietet auch „Video-Spur ausblenden“. Vom Fenster aus geöffnet, schaltet das nur die Video-Spur im Song aus (wie gehabt), nicht das Fenster.
