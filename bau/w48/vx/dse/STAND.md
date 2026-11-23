# DSE – Stand (fertig)
Bau: `python3 apply.py <eingang> <ausgang>` (Eingang 4.88.0 md5 695af0504463a6385e21dc94e55b00c9, Ausgang hier `index.html`, md5 c52c7093241d6e85a349b7d088dfb828).
Block `block.js` (/* DSE-BEGIN/-END */ direkt hinter `Object.assign(SYNQUENZER,{mtx3b:MTX3B_API});`), 9 Haken mit `/*DSE*/` bzw. tg.dse:
- mtx3bDrumView: FOLGEN-Chip vor ✕ (`folChip('steps')`, gleiche Einstellung wie DRUMS › SCHRITTE), `reg:folReg('steps')` (Finger hält),
  `pl1Deco` in decorate (Lock-Punkt/Bedingung), `dseView` (Länge-Knopf ┃n vor [Pad-Klang], Lock-Halten 480 ms, Blättern = „von Hand“, Edit = „bearbeitet“).
- mtx3bFrame: `dseFrame` – FOLGEN blättert (Seite der Abspielmarke bzw. der D1-Position), Lauflicht auf der eigenen Länge (jam1D1Pos wie DRUMS).
- PL1 (3 Anker): Ziel mit `tg.dse` = Drum-Locks des Pads (pl1Eng → 'drum', Pfad drum.<pad>.<p>, Basis slotParams). Nur das neue Lock-Blatt setzt tg.dse;
  ROLLE/LAUF/DRUMS unverändert. „Alle Regler ›“ im Einzelspur-Lock-Blatt ausgeblendet (Lock-Modus gibt es für Einzelspuren nicht).
- Länge/Richtung = vorhandene D1-Spur (`clip.lanes[gm]`, scheduleDrums/d1Sched spielten sie schon); Blatt wie d1Pop, ×2 wie d1Double, je ein ↶.

## Tests
- **Kern-Test-Datei: `test/kern-dse.cjs`** – `node test/kern-dse.cjs <port> neu basis` (Server-Wurzel `srv/` mit basis/ = 4.88.0 und neu/, je version.json
  {"version":"4.88.0"}; python3 -m http.server <port> in srv/). Gegen andere Fassung: deren index.html nach `srv/<ordner>/` legen und
  `node test/kern-dse.cjs <port> <ordner> basis`. Ausgabe `test/kern-dse.out`: **ALLE OK (23/23)**.
  Touch über CDP, 428×926 und 926×428: Schritte 1/5 per Tipp (GM 42), Chip HÄLT 3 s nach Edit → FOLGT, ×2 per Tipp (2 Takte, 2 Seiten),
  FOLGEN beim Spielen Seite 1↔2 (0 falsch von ~320 Proben), Länge 12 per Regler-Ziehen (lanes {42:{len:12}}, Zellen 13–16 gedimmt),
  Wiedergabe HH ZU Schritte 0,4,12,16,24,28… gegen Kick 0,16,32…, Lauflicht max. Schritt 12 auf Seite 1, lange drücken → Lock-Blatt
  (Tune/Decay/Pegel/Drive), Tune +7 per Ziehen → nur Schritt 1, Punkt an der Zelle, Wiedergabe Schritt 1 tune 7 / Schritt 5 tune 0,
  Offline-Render (vvRenderAudio) mit ↔ ohne Lock −29 dB, mit ↔ mit −140 dB. Ohne Bedienung (Basis ↔ neu): Clips gleich, Schläge
  (Spur/Pad/Schritt) gleich, S.ui gleich, keine Seitenfehler.
- `test/erkunde.cjs` (Fotos), `test/pop.cjs` (Fotos Lock-Blatt). Fotos: foto-vorher(.png/-quer), foto-nachher(.png/-quer), foto-nachher-lock(-quer).
- Pflicht (`pflicht.out`): doppelt.js neu [], „MS 2000“ 1×, „  live: true,“ 1×, verbotene Zahlen 0×.

## Offen / Grenzen
- Länge bis zur Clip-Länge (1 Takt = 16, mit ×2 bis 64 Schritte bei 4 Takten) – wie bei DRUMS; längere Spur als der Clip gibt es nicht.
- Kein Lock-Modus „Alle Regler ›“ für Einzelspuren (Knopf im Blatt ausgeblendet); Euklid/Muster für die Einzelspur nicht gebaut.
- FOLGEN-Einstellung ist dieselbe wie DRUMS › SCHRITTE (ein Schalter für beide).
