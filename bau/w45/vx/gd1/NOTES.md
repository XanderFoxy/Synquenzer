# GD1 – drei offene Vorschläge aus rel-4540/k/NOTES.md („Offen / Vorschläge“)

Arbeitskopie `vx/gd1/index.html` = Kandidat 4.59.0 (`vx/basis4.html`) + **ein** Block `GD1-BEGIN … GD1-END` direkt nach `/* VID5-END */`.
Sonst keine Zeile geändert (geprüft: Datei ohne den Block = basis4 byte-gleich). VERSION/CHANGES unberührt, „MS 2000“ 1×, „  live: true,“ 1×.

## (1) Guide-Sprung ohne Voraussetzung – Rahmen dort, wo es entsteht
- **Arp Treppe (kf1trp)** ohne Spur auf MS-Platte / Bit Mask: vorher nur Toast, `ok:false`, kein Rahmen. Jetzt: Klang-Editor einer Synth-Spur
  (gewählte, sonst erste), Rahmen um die Klangerzeugung (`.sh-head .seg.eng`, wie der Eintrag „Klangerzeugung“; hochkant mit ▾, quer mit
  MS 2000 / Bit Mask direkt). Mit MS-/Bit-Mask-Spur: alter Weg (Rahmen an ARP › TYPE) unverändert.
- **Perform-Spur im Song (jam3pf)** ohne Perform-Spur: vorher Toast, kein Rahmen. Jetzt Rahmen um **● SONG** (dort entsteht sie; falls nicht
  sichtbar: die Zeile MELODIE). Mit Perform-Spur: Rahmen an der Zeile PERFORM wie bisher.
- Mechanik wie die vorhandenen Ersatz-Sprünge („Song transponieren“): `go` setzt `UI1.alt`, `q` fragt es zuerst.
- **Entscheidung Hinweis:** Die Fotos zeigten, dass der Toast (fest oben, 58 px) hochkant genau über der Klangerzeugung bzw. teils über
  ● SONG liegt – der Hinweis würde das Ziel verdecken. Darum steht der kurze Hinweis im vorhandenen gelben Etikett am Rahmen (`.ui1rl`):
  „Arp Treppe: erst MS 2000 / Bit Mask“, „Perform-Spur: ● SONG + Perform-Leiste“ (passen ganz, keine Ellipse, alle 3 Größen). Dazu ist
  `ui1Ring` umhüllt: das Etikett wird nur ersetzt, wenn der letzte Sprung genau dieser Eintrag ist **und** der Rahmen auf sein Ersatz-Ziel geht
  (Test A4: danach behält „Song transponieren“ sein Etikett); der Ersatz gilt nur einmal je Sprung.

## (2) Menü quer: Trefferfläche ≥ 44 × 44 ohne sichtbare Änderung
- Quer sind alle Menü-Zeilen mit Segment-Tasten 38 px hoch, Tasten 32 px hoch, ≥ 40 px breit (`@media (orientation:landscape) .seg button`).
- Umfang: alle `#menu .mrow > .seg` mit 2–3 Tasten (An │ Aus: Lauflichter, Perform-Leiste, Begleiter, Clip ablegen, Haptik … ; Dur │ Moll,
  Modus, Einzähler, Split, Qualität … – mit allen „Mehr ▾“ offen 59 Tasten). Zeilen mit mehr Tasten (Projekt-Tonart 12, Quantisieren 8)
  brechen um – dort würde jede Erweiterung die nächste Tastenreihe überdecken; nicht angefasst.
- Umsetzung: unsichtbares `::before` (kein Inhalt, keine Farbe; `.seg button` ist schon `position:relative`, `::before` war dort frei):
  44 px hoch mittig; erste Taste 4 px nach links, letzte 4 px nach rechts; mittlere Taste nur wenn < 44 px breit, dann mittig auf 44 px
  (`min(0px, 50% − 22px)` = höchstens in die gemessenen 2,00-px-Fugen). Zwischen zwei Zeilen bleiben 2 px frei (8 px Abstand − 2 × 3 px).
- Hochkant unverändert (Trefferfläche = Taste, gemessen 59 Tasten).

## (3) KF2-Oszilloskop während Video-/Audio-Export
- Ursache: `vvRenderAudio0` tauscht `AU.ctx` gegen den Offline-Kontext (`UI.vvOff`). Bei offenem Klang-Editor legte `kf2ScDraw` dann einen
  eigenen Analyser im Offline-Kontext an und hängte die Offline-Spur daran (Basis gemessen: 57 von 57 Proben während des Renders).
- Jetzt: `kf2ScFrame` umhüllt – solange `gd1Off()` (UI.vvOff oder AU.ctx ist ein OfflineAudioContext): `kf2ScStop('export')` (Analyser
  abgekoppelt, Bild steht), alle 250 ms nachsehen; danach `kf2ScArm()` → wieder am Live-Kontext (gemessen: 0 Proben offline, danach
  vis/live/src wieder an). Kein neues Projekt-Feld, keine Optik.

## Prüfungen
- `gd1-test.mjs` (Touch, 428×926 / 926×428 / 926×370): **26/26 OK** – `out/gd1-run.log`, `out/gd1-result.json`, Fotos `out/A1-*`, `out/A2-*`,
  Menü-Bilder `out/B-menu-*-{basis,gd1}.png` (pixelgleich, Byte-gleich), Touch-Tipp 4 px über „Aus“ / 3 px links neben „An“ trifft.
- Pflicht: topdefs 0/0 (Skripte 26, Namen 7281), dupkeys 0, smoke errors [] (`out/smoke/smoke.png`).
- Regression xd1 (endgültige Datei): siehe LOG.md, letzte Zeile. Die 3 FEHLER in (2) Video quer/quer-370 hat basis4 selbst genauso
  (`out/xd1-basis-video.log`); „(5) Gegenprobe Basis“ erwartet einen Fehler, den basis4 schon behoben hat.

## Offen
- Echt-iPhone (Safari) nicht angefasst; gemessen in Chromium (Playwright, Touch). `::before`-Treffer gelten in WebKit genauso
  (Pseudo-Elemente sind Teil der Taste); `min()` in CSS ab iOS 11.3.
