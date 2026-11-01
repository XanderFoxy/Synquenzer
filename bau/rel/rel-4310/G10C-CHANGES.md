# G10c – Takes-Verwaltung (Nachtrag 9 §2.3, Punkt 9)

Basis: `bau/snapshots/R-4300.html` (App 4.30.0). VERSION unverändert. Patch: `patch.diff`. Alle neuen Namen mit Präfix `g10c…`
(JS, CSS-Klassen `g10c-…`, CSS-Block zwischen `G10C-CSS-BEGIN`/`G10C-CSS-END`), damit der Merge mit Hotfix 4.30.1 leicht bleibt.

## Xanders Klage
„Was sind die 7 Takes? Ich will Wellenform sehen, Namen und Tags vergeben, sehen welcher aktiv ist.“

## Bedienung (iPhone)
STIMME-Clip antippen → Takes-Blatt:
- **Kopf (bleibt stehen, rollt nicht mit):** „STIMME · Szene 3“, darunter „7 Aufnahmen in Szene 3 · oben = hörbar · neu oben“, rechts **✕** (44 px).
  Der Rest des Blatts rollt darunter. Das Blatt ist höchstens Bildschirmhöhe – ✕ ist immer sichtbar (auch 428 × 650, 926 × 428, 320 × 568).
- **Jede Zeile:** Status-Marke **HÖRBAR** (farbig) bzw. **STUMM** (grau), „Take 3“, Name, Farbpunkt, ★ –
  darunter die **Mini-Welle** über die volle Breite (64 Punkte, 20 px), darunter „REC · Runde 2 · 0:32 · 23:14 · Kabel“, darunter die
  **Status-Chips** („Q 1/16“ bzw. „Dehnen 1/16“, „Säubern 60“, „♪“, „⇅“, „Text“, „Chor“/„Chor-Gruppe“; nichts davon = grau „roh“;
  zu viele = „+2“). Farbe zusätzlich als Streifen links an der Zeile.
- **Rechts je Zeile vier Knöpfe (je 44 px):** ▶ Vorhören (■ stoppt), ✕ Löschen, ✎ Bearbeiten, ☆/★ Favorit (ein Tipp).
- **Tipp** auf die Zeile = hörbar machen (wie bisher). **Halten** (450 ms) oder **✎** = Bearbeiten unter der Zeile: Name (≤ 24 Zeichen, [Fertig]/Eingabe/
  Verlassen übernimmt), 5 Farben + keine (grün „gut“, gelb „vielleicht“, rot „raus“, blau, grau), [★ Favorit], [✕ Löschen].
  **Wisch nach links** (> 80 px) löscht ebenfalls (die Zeile wandert mit und färbt sich rot), ✕ bleibt.
- **Löschen** zeigt „Take 3 gelöscht“ mit [Rückgängig]; ↶ ↷ wie überall.
- **Unten:** [Andere Takes löschen (★ bleiben)] (ein Undo; der hörbare und alle ★ bleiben) und [Aufräumen · 12 MB] (Größe, die wirklich frei
  wird). Aufräumen fragt nach: „Gelöschte Takes endgültig entfernen (12 MB)? Der Verlauf (↶) wird dabei geleert.“ [Abbrechen] [Endgültig löschen].
- **Vorhören** spielt einen Take allein durch die STIMME-Spur (gleicher Klang, gleicher Auto-Pegel), mit Lauflinie auf der Mini-Welle; der hörbare Take
  ändert sich nicht. Läuft der Transport, sagt ein Hinweis „Läuft gerade – ein Tipp auf den Take macht ihn hörbar“ (dann ist der Tipp das A/B im Zusammenhang).
- Weiter im Blatt (unverändert erreichbar): SÄUBERN, ✎ Marken · Quantisieren, In Melodie umwandeln, folgt Transponieren, ♪ Tonhöhe · Noten, Chor,
  **Als Chor-Stimme duplizieren**, A/B, WAV, ZIP + Projekt, **Mit GarageBand aufnehmen** (G-GB).
- **Mikro-Blatt → „Durchgänge als Takes [An] [Aus]“** (Geräte-Einstellung, Standard An): ● REC über n Loop-Runden eines Clips mit **fester Länge** →
  n Takes („Runde 1…n“, die letzte oben). Länge AUTO: wie bisher (VS-L, der Clip wächst, ein Take). Aus: wie 4.30.0.

## Daten (nur additiv, Format bleibt)
Segment-Felder am Stück `{take, in, out, at, …}` – oben am Audio und in `alt`:
`no` (feste Nummer 1…9999), `name` (≤ 24), `tag` (1…5: grün, gelb, rot, blau, grau), `fav` (true), `r` (Runde).
- Neuer Haken `tkExt().seg` in `tkNormSeg` (gilt oben und in `alt`).
- `tkSegs` gibt die Felder des obersten Stücks mit; `tkPick` tauscht sie mit dem Stück (Felder gehören zum Stück, nicht zum Platz).
- `tkVoiceTake`, Test-API `tkInject`, `tkSongCommit` (Overdub-Rest), G-GB-Import (`ggbPlace`) kopieren die Felder mit; ein neues Stück bekommt keine
  Felder vom alten (vorher blieben sie am Platz hängen).
- `no` wird beim Anlegen vergeben (1 + größte Nummer im Clip/Stück). **Alte Takes ohne `no`:** Anzeige nach K4 (Take 1 = älteste Aufnahme). Erst eine
  Änderung (neuer Take, Löschen, Name/Farbe/★) schreibt die angezeigten Nummern fest – im Undo dieser Änderung. Bloßes Laden ändert nichts (Regel 28).
- Nummern bleiben nach dem Löschen stehen: Take 3 gelöscht → 1, 2, 4, 5, 6, 7. Neuer Take danach = Take 8.
- Durchgänge als Takes: **kein neues Audio** – ein Take über alle Runden, je Runde ein Segment `{take: gleiche id, in, out, at, r}` (Runden lückenlos, je
  genau ein Clip-Durchgang). `alt` bleibt auf 16 begrenzt.
- WAV-Dateiname enthält den Namen des gewählten Stücks (`…-0937-bbc9-Strophe-gut.wav`).
- G6+f „aus Take n“ zeigt die feste Nummer.

## Mini-Wellen (Leistung)
- Aus dem PCM16 im Audio-Store, **Stück für Stück** gelesen (kein AudioBuffer, kein ganzer Take im Speicher), Spitze je Punkt, √-Skala, absolut (leise Takes
  sehen leise aus). 64 Byte je Welle, Cache `pk:<id>:<in>:<out>[:<Zeitkarte>]` im Speicher (nicht im Projekt, höchstens 512).
- Im Hintergrund nacheinander, gibt den Haupt-Faden nach jedem Stück frei (`requestIdleCallback`), keine Aufgabe > 50 ms gemessen.
- Bearbeitete Takes: Zeitachse über die Zeitkarte (`take.warp.map`) – Dehnen linear, Scheiben (Quantisieren) je Scheibe verschoben mit Lücke wie die
  gerenderte Fassung. Tonhöhe, G4 und VS-P werden für die Mini-Welle nicht gerechnet (Spec).

## Abnahme (Spec G10-20 … G10-26) – Ergebnisse siehe STATUS.md
Tests in `tests/` (Playwright + Chromium, Touch, `sh tests/alle.sh`).

## Absichtlich überholte Erwartungen (Regel 26)
- **K-10 (K4, 4.25.2), zweiter Teil:** „Take 3 gelöscht → 4…7 heißen danach 3…6“ gilt nicht mehr; mit G10c bleiben die Nummern fest (1, 2, 4…7).
  Der erste Teil (nach oben geholt → heißt weiter Take 3) bleibt grün.
- Zeilentext: Der Knopf `.tk-pick b` enthält jetzt nur „Take 3“ (vorher „● Take 3“). Hörbar/stumm steht in der eigenen Marke `.g10c-st`.
- Der [Aufräumen]-Knopf ist aus der Reihe A/B · WAV · ZIP nach unten zu „Andere Takes löschen“ gewandert (gleiches `data-a="gc"`). Er löscht jetzt nach
  Rückfrage auch Takes, die das Projekt nicht mehr nennt (vorher nur verwaiste Stücke) und leert dabei den Verlauf.
- Nach einer neuen Aufnahme, einem Löschen oder einer Bearbeitung tragen die Stücke `no` (auch alte). Tests, die `clip.audio` nach so einer Geste mit
  genau `{take, in, out, at, …}` vergleichen, sehen das zusätzliche Feld.
- Länge fest + ● REC-Overdub über mehrere Runden: Der Clip wächst nicht mehr (VS-L-Wachsen gilt bei AUTO); bei „Durchgänge als Takes: Aus“ wie 4.30.0.

## Fragen an Xander
- Aufräumen leert den Verlauf (↶), weil ↶ sonst gelöschte Audio-Stücke zurückholen würde, die es nicht mehr gibt. Passt das, oder lieber nur Takes
  entfernen, die auch im Verlauf nicht mehr vorkommen (dann wird oft 0 MB frei)?
- Vorhören bei laufendem Transport: Heute nur Hinweis (Tipp = hörbar machen im Zusammenhang). Soll ▶ stattdessen den Take im laufenden Song solo
  einblenden?
