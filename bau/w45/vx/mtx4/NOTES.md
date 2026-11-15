# MTX4 Teil 1+2 – Mehrere Clips zugleich (Notizen, 15.11.2026)

index.html = basis.html (4.68.0, rel-4680) + Block `/* MTX4-BEGIN … MTX4-END */` direkt hinter `/* MTX3-END */` + 3 Haken-Zeilen.
`block.js` im Ordner = der Block allein (identisch mit dem Block in index.html). Keine vorhandene Zeile geändert (diff: nur `a`-Zeilen).
VERSION unverändert 4.68.0.

## Haken (je eine Zeile, Kommentar `/* MTX4 … */`, `typeof`-Schutz) – unverändert seit Teil 1
| Stelle | Haken |
|---|---|
| scheduleTrack (nach `if (to <= from) return;`) | `mtx4Sched(i, from, to, late)` – läuft ein geänderter Clip, plant er bis zum nächsten Taktstrich den alten Inhalt, danach den neuen |
| renderGrid (vor „the bank switches“) | `mtx4Grid()` – Markierung der gewählten Clips (Klassen-Wechsel, gecacht) |
| openClipSheet (nach `wegeClipSheet`) | `mtx4ClipSheet(g, B, t, s, clip)` – Knopf [Mehrere wählen] |

Dazu im Block selbst: Zeiger-Erfassung auf `window` (Capture, nur solange der Modus an ist und nur für Clip-Zellen / Szenen-Köpfe),
Guide-Eintrag (`ui1Entries().push`), Test-API `SYNQUENZER.mtx4`.

## Gebaut (Plan §5 P2, Schritte 1–3)
1. **Auswahl:** Clip-Blatt › [Mehrere wählen] → dieser Clip gewählt, weitere Clips antippen (Tipp = dazu / weg). Szenen-Kopf-Tipp =
   alle Noten-Clips der Szene dazu (noch einmal = weg). Im Modus startet nichts (wie die Matrix-Auswahl der Teile). [SZ]/[▲▼] blättern.
   Markierung im vorhandenen Stil der Matrix-Auswahl (`#clipGrid.picking`): übrige Clips blass (0,5), gewählte mit 3-px-Rahmen, Farbe
   Bernstein wie die Spuren-Gruppe. ✕ / Esc beendet. Die Auswahl lebt nur zur Laufzeit (Speicherstand bit-gleich, getestet).
2. **Leiste** nach dem Muster der Spuren-Gruppe (`.ui1gb`: Rahmen, Verlauf, 44-px-Knöpfe, Platz über der TEILE-Leiste):
   hochkant 2 Zeilen ab der TEILE-Leiste nach unten (deckt solange AKKORD/TRÄGER), quer 4 Zeilen in der rechten Spalte bis zur
   Unterkante der TEILE-Leiste – die Matrix bleibt in allen 3 Größen frei (gemessen: 0 Zellen verdeckt).
   Inhalt: Zähler („3 Clips · 2 Szenen“), [Drums fest │ Drums ±] (nur mit Drum-Clips), Tonart ▾, Quant. ▾, ✕, −12 −1 +1 +12, ▲ Stufe, ▼ Stufe.
3. **Transponieren / Stufe:** ±1/±12 Halbtöne; eine feste Tonart (Fest/Aufnahme) rückt mit (neues Schlüssel-Objekt, damit schon
   geplante Töne ihren Bezug behalten), eine automatische erkennt die App wie immer neu. Stufe ▲▼ wie im Noten-Editor (Tonart des Clips,
   fremde Töne zum nächsten Leiterton). Clips, die über 0…127 hinaus müssten, bleiben (Hinweis „am Rand“).
4. **In Tonart einpassen ▾** (Dur, Moll, Dorisch, Mixolydisch, Phrygisch, Pentatonik) mit den vorhandenen Tabellen `Harmony.SCALES` und
   `G10G_SCALES`: Grundton = Tonart des Clips; leitereigene Töne Stufe für Stufe (C-Dur → C-Dorisch: E→E♭, H→B, A bleibt), fremde Töne
   per `Harmony.snapToScale` (Spielrichtung). Pentatonik: Dur-Pentatonik bei großer Terz, sonst Moll-Pentatonik, über die vorhandene
   Ein-Skala-Abbildung `Harmony.oneScaleMap` (Kontur bleibt, Doppel werden vermieden). Rhythmus/Anschlag bleiben; gleicher Ton zur
   gleichen Zeit (nur möglich bei Pentatonik/fremden Tönen) wird eine Note (längste Dauer, lautester Anschlag). Der Clip bekommt die
   Tonart fest (z. B. „Fest: C Dorisch“), bei Pentatonik bleibt sie.
5. **Quantisieren ▾** (Auto, 1/4, 1/8, 1/8T, 1/16, 1/16T, 1/32; Stärke 100 %) über `quantizeClip` (Vorschau-Weg ohne eigenen ↶),
   danach ein gemeinsamer Schritt.
6. **↶:** jede Aktion = ein Eintrag (`group` aus Clip-Schritten; bei einem Clip ein Clip-Schritt). `undoRedoCheck()` = true.
7. **Am nächsten Takt:** läuft ein gewählter Clip, wird beim Tipp der alte Inhalt gemerkt (`M4.hold`); `mtx4Sched` teilt jedes
   Planungs-Fenster am Taktstrich (`nextBarFromAudible`): davor alter Inhalt, danach neuer. Ein ↶ vor dem Takt oder ein anderer Clip im
   Platz hebt das sofort auf (Objekt-Vergleich).

## Entscheidungen
- **Drum-Clips nur auf ausdrückliche Wahl:** Szenen-Kopf nimmt sie nie mit, nur ein eigener Tipp. ± wirkt auf sie nur mit
  [Drums ±] (Standard „Drums fest“, Begriff wie „fest“ am Spurkopf); Stufe und Tonart nie (Pad-Töne haben keine Leiter); Quantisieren immer.
  Drum-artig = DRUMS, Perkussions-Spur (`percIs`), MTX3-Einzelspur (`tr.dvx`).
- **Gesang/Audio** (STIMME, Original, `clip.audio`) nicht wählbar – Hinweis „einzeln im Takes-Blatt“ (Plan K11: dort nur Halbtöne).
- Bei laufender Wiedergabe kein Neustart, keine Lücke: getestet jede Achtel genau einmal über den Taktstrich.
- Leiste z-index 71 (eine über der Spuren-Gruppe); die Blätter Tonart/Quant. liegen neben der Leiste (quer links daneben, hochkant
  darüber) – Fund aus der Foto-Prüfung, im Test jetzt gemessen. Die Spuren-Gruppe wird beim Einstieg aufgelöst; wird sie im Modus
  neu gebildet, weicht die MTX4-Leiste solange.

## Messung (mtx4-test.mjs, 58/58; Ausgabe in test-ergebnis.txt)
- 3 Clips in 2 Szenen +1: alle Noten +1 (Zeit/Dauer/Anschlag gleich), 45 andere Clips bit-gleich, ein ↶ (Gruppe aus 3) → alles bit-gleich.
- Dorisch auf C-Dur-Clip (16 Noten): jede Note in C-Dorisch, Zeit/Dauer/Anschlag/Anzahl gleich. Dur/Moll/Mixolydisch/Phrygisch/Pentatonik: jede Note in der Leiter.
- Wiedergabe: Tipp > 1,6 Schläge vor dem Takt → auch das nach dem Tipp Geplante bis zum Takt nur alter Ton (60), ab dem Takt nur neuer (61),
  0 fehlende/doppelte Achtel, Aktion ≈ 3 ms.
- 8 Spuren × 8 Szenen, alle 64 Clips gewählt, Wiedergabe läuft: renderGrid ohne Zwischenspeicher Median 1,8 ms, max 11,6 ms (≤ 16 ms);
  ±1 / Dorisch / Quantisieren über 64 Clips 11 / 3 / 7 ms (Lauf davor 13 / 13 / 17 ms); 0 Long Tasks ab den Aktionen (Kopflos-Browser, 4 Kerne geteilt;
  die Frame-Abstände P95 ≈ 22 ms spiegeln die Test-Schleife und die geteilte CPU, nicht die Matrix).
- Pflicht: topdefs 0 doppelt / 0 Syntaxfehler, dupkeys 0, smoke errors [], „MS 2000“ 1×, „^  live: true,“ 1×, VERSION 4.68.0.
- Fotos: fotos/mtx4-clipblatt-hochkant, -auswahl-hochkant/-926x428/-926x370, -drums-hochkant, -tonart-hochkant/-926x428/-926x370.

## Teil 2/2 (Plan-Schritte 4–5) – gebaut
Alles im selben Block `/* MTX4-BEGIN … MTX4-END */` (block.js = Block, identisch geprüft). **Keine neuen Haken**, keine vorhandene Zeile
geändert (diff zu basis.html: nur `a`-Zeilen an 4 Stellen = 3 Haken + Block).
1. **Länge ÷2 / ×2** in der Leiste (hochkant Zeile 2 rechts neben ▲▼ Stufe, quer Zeile 3 neben ▲▼ Stufe). Damit 8 Knöpfe in eine Zeile
   passen (je 46,5 px breit, ≥ 44), tragen ▲ ▼ ÷2 ×2 ihr Wort klein darunter („Stufe“, „Länge“) – gleiche Höhe 44 px, gleicher Rahmen.
   Weg = das vorhandene `clipLength` (wie ½ / ×2 im Clip-Blatt: ×2 verdoppelt den Inhalt inkl. Kurven/KL1, ÷2 behält die erste Hälfte;
   1…64 Takte). Dessen eigener ↶-Schritt wird während des Aufrufs ausgesetzt (`pushUndo` kurz durch eine leere Funktion ersetzt,
   `finally` stellt ihn wieder her); `mtx4Run` legt den gemeinsamen Schritt an. Gilt für alle gewählten Clips, auch Drums. Clips, die
   nicht können (÷2 bei 1 Takt, ×2 über 64), bleiben – Hinweis „n am Rand (1–64 Takte)“.
2. **Neue Clip-Versionen** (Plan: „Alle Änderungen erzeugen neue Clip-Versionen“) über die vorhandenen Versionen (SX9, `song.own` mit
   `ver`/`from`): Spielt ein geänderter Clip irgendwo im Song (`sx9At` findet ihn), wird sein Inhalt **von vorher** eine neue Version
   (nächste freie Nummer, wie ＋ bei den Versionen; höchstens v8 / `OWN_MAX`). Einmal je Clip und Auswahl-Sitzung (5× +1 = eine Version,
   die Fassung vor der Sitzung); eine neue Sitzung legt die nächste an. Der Song-Ablauf bleibt unverändert (spielt v1 = den geänderten
   Clip, wie bei jeder Clip-Bearbeitung); Clip-Blatt › VERSIONEN IM SONG zeigt dann [v1][v2] – [v2] holt die alte Fassung überall
   zurück (vorhandener Weg). Clips, die im Song nicht spielen, bekommen keine Version. Toast: „… · vorher = v2“.
3. **Ein ↶ für alles:** Clip-Schritte + der Song-Schritt der Versionen werden mit dem vorhandenen `undoMergeSince` eine Gruppe
   (`clip,clip,clip,song`). Nach ↶ kann eine Nummer neu vergeben werden – die Sitzung prüft darum Herkunft (`from.t/from.s`) mit.
4. **Am nächsten Takt** gilt auch für die Länge (derselbe `mtx4Sched`-Weg): ÷2 im Lauf → bis zum Taktstrich der alte Takt, ab dem
   Taktstrich der 1-Takt-Clip; danach ×2 → lückenlos weiter.
5. Guide-Eintrag erweitert (Name „… Länge“, Text mit ÷2 ×2 und Versionen, Suchwörter länge/doppelt/halb/version/vorher).
   Test-API: `SYNQUENZER.mtx4.len(f)`, `.vers()`.

## Messung Teil 2 (mtx4-test.mjs 81/81, test-ergebnis.txt; Touch über CDP, 428×926 / 926×428 / 926×370)
- ×2 per Touch auf 3 Clips in 2 Szenen: Länge doppelt, Inhalt verdoppelt, 45 andere Clips bit-gleich, ein ↶ (Gruppe aus 3);
  danach ÷2 = wieder bit-gleich; ÷2 mit 1-Takt-Clips: diese bleiben (Hinweis), längere halb so lang; undoRedoCheck = true.
- Versionen (Test-Song: 0:0 und 1:1 spielen im Song, 2:1 nicht): +1 → je eine v2 mit exakt dem alten Inhalt, keine für 2:1, Song-Einträge
  gleich, ein ↶-Schritt `clip,clip,clip,song`; zweite Aktion = keine weitere Version; Speichern/Laden bit-gleich (own und ganze Datei);
  zwei ↶ = ganzer Speicherstand bit-gleich; Clip-Blatt zeigt „v1 v2“ (Foto); neue Sitzung + ×2 → v3.
- Wiedergabe: ÷2 auf 2-Takt-Clip (Takt 2 = andere Tonhöhe) im 1. Takt getippt → bis zum Taktstrich 60, ab dem Taktstrich 8× 60 (nicht 62),
  danach ×2; jede Achtel genau einmal, Aktion ≈ 3–4 ms.
- 8×8, alle 64 gewählt, Wiedergabe läuft: renderGrid ohne Zwischenspeicher Median 2,0 / max 10,5 ms; nach ×2 (doppelte Noten) Median 3,2 /
  max 11 ms (≤ 16). ±1 / Dorisch / Quant / ×2 / ÷2 je 6–13 ms, 0 Long Tasks.
  (Lauf 4 zeigte einmal 60 ms: der Test rief damals alle 6 Sammel-Aktionen ohne Pause in EINER Aufgabe auf. Nachmessung t/lt.mjs 3×:
  0 Long Tasks; der Test ruft jetzt jede Aktion als eigene Aufgabe auf wie ein echter Tipp.)
- Pflicht: topdefs 0 doppelt / 0 Syntaxfehler (mit NODE_PATH=/opt/node-tools/node_modules), dupkeys 0 (ebenso), smoke errors [],
  „MS 2000“ 1×, „^  live: true,“ 1×, VERSION 4.68.0.
- Fotos neu: alle 8 aus Teil 1 (Leiste mit ÷2 ×2) + `mtx4-versionen-hochkant.png` (Clip-Blatt mit VERSIONEN IM SONG v1 v2).

## Offen
- **Lieferung (Plan-Schritt 5, außerhalb dieses Ordners):** Sonden, SPIELSYSTEM.md, Werkstatt, Funk-Antwort – Sache der Hauptsitzung.
- **Funk-Vorschlag (sichtbar neu, Plan: „Funk: Vorschlag“), Entwurf:**
  „Mehrere Clips zugleich: Clip halten › [Mehrere wählen], dann weitere Clips antippen (Szenen-Kopf = ganze Szene). Unten erscheint eine
  Leiste: −12 −1 +1 +12, Stufe ▲▼, Länge ÷2 ×2, Tonart ▾ (Dur, Moll, Dorisch, Mixolydisch, Phrygisch, Pentatonik), Quant. ▾. Jeder Knopf
  = ein ↶. Läuft die Musik, hörst du die Änderung ab dem nächsten Takt. Hochkant deckt die Leiste solange AKKORD/TRÄGER, quer die rechte
  Spalte. Spielt ein Clip im Song, bleibt die alte Fassung als v2 (Clip-Blatt › Versionen). Passt das so – oder lieber anders einsteigen
  (z. B. Halten + zweiter Finger wie bei den Spuren)?“
- **Entscheidung zur Prüfung:** Versionen = „alte Fassung wird vN, Song spielt die neue (v1)“. Alternative: der Song behält automatisch die
  alte Fassung (vN überall im Song) und nur die Matrix ändert sich – wäre ein Satz im Funk-Vorschlag, Umbau klein (`sx9SetAll`).
- Hochkant trägt die Leiste jetzt 8 Knöpfe in Zeile 2 (je ≈ 46 px); ▲ ▼ ÷2 ×2 mit kleinem Wort darunter. Auf dem iPhone ansehen.
- Gesang-Takes in Halbtönen mit transponieren (vorhandener G7-Weg) – bewusst ausgelassen (nicht wählbar).
- Pentatonik nutzt die Ein-Skala-Abbildung; bei sehr dichten 7-Ton-Melodien kann sie einzelne Töne um eine Oktave weiter setzen
  (Kontur bleibt) – an echten Clips anhören.
- Ein Clip mit falsch erkannter Tonart (z. B. a-Moll statt C-Dur) wird auf den erkannten Grundton eingepasst; Grundton-Wahl im Blatt wäre
  eine Erweiterung.
- Versionen während ▶ SONG: der Song-Schritt läuft über `songEdit` (mit `songResync` wie jede Song-Bearbeitung) – nicht eigens getestet,
  da sich die Spuren-Einträge nicht ändern.
