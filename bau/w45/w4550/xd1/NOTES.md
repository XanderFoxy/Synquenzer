# XD1 – Stand nach Schritt 1 (Punkte 1–4)

Datei: `w4550/xd1/index.html` (Basis `w4550/basis.html` = R-4530 = 4.53.0). Ein Block `XD1-BEGIN … XD1-END` direkt nach `INT53D-END`,
drei Einhänge-Zeilen außerhalb (alle mit „XD1“ markiert): `stSheetFill` (xd1MicHtml), `bindStSheet` (xd1MicTap), `vvSwapIn` (MIX-A, Punkt 7).
VERSION/CHANGES unverändert. Quelle der Wahrheit ist `index.html`; `dev/block.js` ist ein Abzug des Blocks (nach Schritt 1 neu gezogen).

## Vorgeschichte
Der erste Bau-Lauf (abgebrochen) hatte alle acht Punkte als Hüllen gebaut, dazu `xd1-test.mjs` und angepasste Paket-Tests in `tests/`
(vox2, mtx, vd4, ori). Übernommen; in Schritt 1 nur die Punkte 1–4 fertig gemacht und geprüft. Punkte 5–8 liegen unverändert aus dem
ersten Lauf im Block (nicht angefasst, nicht nachgeprüft) – siehe „Offen für Schritt 2“.

## Punkt 1 – Gesang im Mikrofon-Blatt + Mich selbst hören (fertig)
- „Beim Singen hören“ [Begleitung │ + Melodie │ nur Klick] und darunter „Mich selbst hören“ [An │ Aus] stehen oben in der Spalte
  „Stimme → Noten“ des Mikrofon-Blatts (ORI-Schritt „1 Aufnehmen“). Hochkant: direkt unter Weg/Verzögerung; quer: rechts oben –
  die linke Spalte mit [Einmessen] [Mikro an] [● REC] bleibt genau wie in der Basis (kein Rollen nötig, um sie zu erreichen).
- Geändert gegenüber Lauf 1: dort war „Mich selbst hören“ ein eigenes Label + zwei breite Tasten + 2–3 Zeilen Hinweis (185 px) –
  quer rollte das Blatt, quer 370 lag [Mikro an] unter der Kante. Jetzt ist „Mich selbst hören“ eine Zeile wie „Melodieerkennung“
  (Text links, [An │ Aus] rechts, 50 px), der Zustand steht klein darunter wie „geschätzt“ unter der Verzögerung:
  aus „Standard · nur mit Kopfhörer sinnvoll“; an + Lautsprecher (gelb) „Lautsprecher: bleibt stumm, sonst pfeift es“; an + Bluetooth
  (gelb) „Bluetooth: kommt hörbar verzögert“; beim Einmessen „beim Einmessen stumm“; sonst „mit dem Hall der STIMME auf dem Kopfhörer“
  bzw. „sobald das Mikro an ist“. An/Aus groß geschrieben wie die beiden anderen Schalter im Blatt.
- Maße (s1/p1.mjs): hochkant Blatt 646 → 774 px (passt, 926); quer 428 Blatt 342 → 410 px, rollt nicht (scrollHeight = clientHeight);
  quer 370 rollt die rechte Spalte ~60 px (Basis: 0/5 px), [Mikro an] links sichtbar. Alle Tasten ≥ 44 px, ✕ sichtbar.
- Mithören (wie in jeder DAW): Mikro → eigener Pegel → direkt `destination` (am Master vorbei = kleinste Verzögerung, kein
  Kompressor-Vorlauf), Pegel = vol² der STIMME-Spur, Hall-Send = Pegel × Hall der STIMME in den Hall der App. Still bei Lautsprecher,
  beim Einmessen, außerhalb „live“, im Offline-Render; im Echtzeit-Mitschnitt ohne Hall-Send (die Aufnahme bleibt trocken).
  Neu in Schritt 1: still auch, wenn die STIMME stumm ist oder eine andere Spur Solo hat (wie DAW). Standard aus; gemerkt im Gerät
  (uiPrefs xd1Mon), nie im Projekt. Takt 400 ms nur, solange Mikro und Mithören an sind.
- Ein Zustand: Tipp im Mikrofon-Blatt ↔ Zeile „Beim Singen“ im Blatt von ● halten (bleibt dort, vox2Sm). Takes-Blatt: nur „Hören“
  + Verweis-Satz „Beim Singen hörst du „…“ – einstellen unter 1 Aufnehmen (Mikrofon)“. Guide: vox2sing springt zu `.xd1sing`, neu xd1mon.

## Punkt 2 – Video quer (fertig, aus Lauf 1, nachgeprüft)
- `vd4LvFit` legt die Taste quer wie hochkant in den Extras-Kasten (zweite Reihe unter Titel · Rand · Making-of · Schnitt), die Zeile
  unter der Bühne entfällt. quer 428: Bühne 206 → 256 px, fertiges Video 156 → 206 px; quer 370: Bühne 148 → 198, Video 98 → 148.
- Folge (unvermeidlich, die Taste braucht 44 + 6 px in der rechten Spalte): quer 428 sind [Vorschau]/[Video erstellen] ganz sichtbar,
  [Teilen]/[Sichern] nach dem Erstellen 8 px unter der Kante (Spalte rollt); quer 370 ist [Video erstellen] 26 von 44 px sichtbar
  (antippbar, Spalte rollt – in der Basis rollte sie dort schon für [Teilen]). Die Zeilen der rechten Spalte werden quer 428 je 3 px
  knapper (wie quer 370 in der Basis, flex). Hochkant pixelgleich zur Basis.

## Punkt 3 – Matrix-Szenenkopf im STOPP (fertig)
- Gestoppt: Aufsetzen startet nichts; Loslassen ≤ 12 px vom Aufsetzen (wie jeder Tipp der App, onTap) startet die Szene; Halten
  450 ms (≤ 8 px) öffnet nur „Szene n“, auch nach dem Loslassen startet nichts; weggezogen startet nichts (neu in Schritt 1 – in Lauf 1
  startete auch ein Wischen beim Loslassen). Wiedergabe unverändert wie MTX. Oberer Rand (UX2 Umsortieren) unberührt.

## Punkt 4 – Echtzeit-Mitschnitt mit Nachher (fertig, aus Lauf 1, nachgeprüft)
- Hülle um `songAudioStart`: steht Mix & Master (snap und gain), Klang-Editor/-Browser, Marken · STIMME, Tonhöhe oder Refrain groß /
  Chor sauber auf VORHER, schaltet der Start sichtbar auf NACHHER (die echten Umschalter: mx2AbEnd, toggleAB, WP/G2 + Neuzeichnen,
  ch1AB('B')) und meldet „Song wird aufgenommen – n Takte · Mitschnitt mit Nachher“. Ohne Vergleich wie bisher. Bleibt danach auf NACHHER.

## Prüfungen (Schritt 1)
- xd1-test.mjs (angepasst an das neue Layout von Punkt 1, Wegzieh-Prüfung bei Punkt 3 ergänzt; ONLY=pflicht,gesang,matrix,mitschnitt
  und ONLY=video): alle OK – `out/s1/xd1-a.log`, `out/s1/xd1-video.log`.
- Eigene Touch-Sonden: `s1/p1.mjs` (Mikrofon-Blatt Maße/Tipps p/q/q2, Basis vs XD1), `s1/p2.mjs` (Video-Blatt Spalten), `s1/p4.mjs`
  (Klang-Editor auf Vorher → Mitschnitt). Fotos in `s1/out/`.
- Pflicht: topdefs 0/0 (Skripte 26, Namen 6681, doppelt 0, Syntaxfehler 0), dupkeys 0, Rauchtest errors [] – `out/s1run/`.
- Paket-Tests (angepasste Kopien in `tests/`, `out/s1run/`): vox2 111/111, mtx 92/92, vd4 30/31 (nur VD4-02 – fällt genauso auf der
  Basis, r3b), ori 87/88 (nur „Menü: kürzer“ – Basis hat ORI schon, 2801 = 2801; alle ORI-P-1-Prüfungen zum Mikrofon-Blatt quer grün).

## Offen für Schritt 2 (Punkte 5–8 liegen aus Lauf 1 im Block)
- (5) Klang-Editor endet beim Schließen auf NACHHER: in Lauf 1 (r4) fielen dadurch INT53C 5 und INT53D 9 Prüfungen, die genau
  „Klang-Editor auf Vorher, nach dem Schließen“ voraussetzen – Tests anpassen (Szenario gibt es so nicht mehr) oder Hülle prüfen.
- (6) MIXG ohne Neuaufbau, (7) MIX-A mit Quittung (Einhänge-Zeile in vvSwapIn, XD1.ack; mixg 48/48 in r4), (8) ORI „Wo bin ich“
  (oriFit-Hülle; ori r4 hatte noch die alten Erwartungen) – nicht nachgeprüft.
- ori-test „Menü: kürzer (Seltenes eingeklappt)“ vergleicht Basis (schon mit ORI) gegen ORI → in diesem Paket immer gleich (2801/2801),
  kein XD1-Befund. VD4-02 (Matrix-Bild pixelgleich zu 4.48.1) fällt auch auf der Basis (r3b) – kein XD1-Befund.
