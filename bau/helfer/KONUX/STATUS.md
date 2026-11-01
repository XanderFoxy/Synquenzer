# KON-UX – Stand

**Fertig gebaut und getestet – wartet auf Xanders Okay** (ohne Okay nicht fertig).
Basis `bau/snapshots/R-4300.html` (4.30.0) → `bau/helfer/KONUX/index.html`, VERSION bleibt '4.30.0'. Diff: `patch.diff`.

## Tests (`bash bau/helfer/KONUX/tests/alle.sh`)

| Test | Fälle | Ergebnis |
|---|---|---|
| Regeln: `  live: true,` 1×, „MS 2000“ 1×, verbotene Wörter 0, VERSION 4.30.0, CSS-Marken, kein Netz/DB im KONUX-Block | 1 | grün |
| Wege per Finger → Song + Teile tief gleich wie die alte Funktion in 4.30.0; genau 1 Undo; Undo = Undo in 4.30.0; kein zweites Namens-Blatt; Hinweis mit [Rückgängig] — Bereich: Teil (Chip / eigener Name / Vorschlag), Block (Vorschlag / Name); Marke: Teil, Block, Zurückholen; Block: Teil, Umbenennen, Auflösen, Zurückholen, Hineingehen | 13 | 13/13 grün |
| Vorschau: da beim Öffnen, tönt nur den Bereich (Pixel), wechselt mit der Karte, folgt dem Namen; ✕ und Tipp daneben → weg, nichts bearbeitet; Block-Umbenennen ohne neuen Namen → Hauptknopf aus | 11 | 11/11 grün |
| Layout 428×926, 926×428, 428×650, 375×667 × (Bereich, Marke, Block, Block-Umbenennen): ganz im Bild, nichts abgeschnitten/überlaufend, Treffer ≥ 44 px, Karten ≥ 64 px, Song darüber ≥ 90 px sichtbar und bedienbar (pass), Vorschau da | 16 | 16/16 grün |
| Animation: ≤ 250 ms (240), nur transform/opacity, Haptik „snap“, keine Aufgabe > 50 ms (gemessen: 0 ms; mit 4-facher CPU-Bremse ~60 ms, nur Info), keine Reste | 3 (+3 Info) | 3/3 grün |
| Format 5; Projekt mit Marken, Blöcken, konsolidierten Teilen: 4.30.0 und KONUX schreiben es Zeichen für Zeichen gleich | 3 | 3/3 grün |
| Rauchtests `smoke`, `v3-mk8-smoke`, `v3-mk8b-smoke`, `v3-qa-mk5reg-smoke` (keine Konsolen-Fehler) | 4 | 4/4 grün |

Vorhandene KON-Tests: im Repo gibt es keine (`bau/helfer/KON*` und `bau/tests/kon-*` existieren nicht) – nichts anzupassen. Die
Wege-Tests vergleichen stattdessen jeden Finger-Weg direkt mit den alten Funktionen in R-4300.

Bildschirmfotos: `tests/bilder/vorher-*.png` (4.30.0) und `nachher-*.png` (KONUX; `node tests/vorher.mjs`, `node tests/nachher.mjs`;
Layout-Fotos aus `konux-layout.mjs`). Kritisch angesehen: In 3 Sekunden klar? Kopf stellt die Frage, jede Karte hat Bild + Titel +
eine Zeile, der Satz über dem Hauptknopf sagt das Ergebnis mit Namen, der Hauptknopf sagt die Tat („Teil „Hook 2“ anlegen“), und
im Song darüber steht der Geister-Rahmen mit Schild. Vorher: Großbuchstaben-Titel, Text-Knöpfe ohne Bild, danach ein zweites Blatt.

## Bewusst geändert

- „Zusammenfassen“ ist kein eigener Knopf mehr (Ergebnis = „Zu einem Teil machen“ = Konsolidieren mit Ursprung). Daten wie bisher
  „Als neuen Teil konsolidieren“ (mit `song.kons`); `s2Sum` und Test-API `sumRange`/`sumMark` unverändert.
- Marken-Blatt: statt [Zusammenfassen] + [Als neuen Teil konsolidieren] + [Zurückholen] ein Bild-Knopf „Zu Teil / Block …“
  (+ „Zurückholen …“). Neu aus der Marke: „Als Block gruppieren“.
- Block-Tipp öffnet das geführte Blatt (vorher Block-Blatt + Block-Namens-Blatt + Namens-Blatt).

## Beobachtungen (nicht KONUX, schon in 4.30.0)

- Querformat 926×428: das TAKT-Feld oben ragt ~5 px über die Block-Zeile des Song-Fensters – ein Tipp ganz oben auf einen Block
  trifft das TAKT-Feld. (Test tippt etwas tiefer.)
- `song.mel[t].len` (abgeleitet) steht nach Undo anders als davor (13 statt 12) – in 4.30.0 genauso; die Tests vergleichen Undo
  deshalb gegen das Undo der alten Funktion.
- Bereich-Leiste: „❖ Als Teil …“ (Teil-Vorlage + Marke) liegt begrifflich nah an „Zu einem Teil machen“ – nicht angefasst, ggf.
  später zusammenführen (Entscheidung Xander).

## Bitte prüfen (iPhone 12 Pro Max, Safari)

1. Song: Takte wählen → ⋯ Mehr → „Zu Teil / Block …“: Versteht man in 3 Sekunden, was die zwei Karten tun?
2. Karte antippen: Erscheint im Song darüber sofort der gestrichelte Rahmen mit Schild? Wechselt er mit der Karte?
3. Namen im selben Blatt wählen (Chip oder eigenes Feld – Tastatur schiebt das Blatt nach oben) → Hauptknopf → fliegt die Kachel
   ins Lineal / in die Teile-Leiste (Querformat), kommt der Haptik-Tick, steht [Rückgängig] da?
4. Marke antippen → „Zu Teil / Block …“ bzw. bei konsolidierten Teilen „Zurückholen …“: richtig vorgewählt?
5. Block antippen: Karte „Zu einem Teil machen“, Werkzeuge Umbenennen (jetziger Name im Feld) / Hineingehen / Auflösen – ruhig genug?
6. Querformat und kleines Telefon: alles im Bild, Song darüber noch gut zu sehen?
7. Fühlt sich die Animation flüssig an (≤ ¼ s), oder zu schwach / zu stark?
