# IMPD – Stand (fertig)
Bau: `python3 apply.py <eingang> <ausgang>` (Eingang 4.87.0 md5 280c5b0b6a9ed1f8ac77868fb8d5d38f, Ausgang hier `index.html`, md5 3bdc49820caa74b8caf8902f4e01c4eb).
Block `block.js` (/* IMPD-BEGIN/-END */ direkt vor `async function nx1ImpStretch`), ein Haken mit `/*IMPD*/` in nx1ImpStretch:
`const W=await impdWarp(c,q,src)` – Anker `W.src`/`W.dst` statt `src`/`src.map(t=>t*q)`.

## Was
- impdWarp (nur wenn: Projekt hat Audio (`!imp1Empty()&&nx1HasAu()`), Tempo = erkanntes Tempo (`c.bpm===c.r.bpm`, keine Vorgabe),
  Quelle nicht 'gesang'): feine Einsatz-Kurve (Energie 0,67-ms-Raster, Anstieg 8 ms vor/nach), je Schlag des erkannten Rasters
  Versatz per Konsens über 5 Schläge (±¼ Schlag, Glättung zum Vorgänger), dann Feinsuche ±18 ms → Quell-Anker = echter Einsatz − 5 ms,
  Ziel-Anker = Raster-Schlag × q − 5 ms. Ende L→L·q wie bisher (Länge und t1·k unverändert). Verhältnis je Abschnitt q/1,5…1,5q.
- Sonst (leeres Projekt, Nutzer-Tempo, Gesang, zweiter Aufrufer ohne c.r bei Zeile ~116290) dieselben Anker wie 4.87 → bitgleich.
- Schalter für Tests: `__impd.on(false)`, `__impd.last()`.

## Tests
- **Kern-Test-Datei: `impd-test.cjs`** (`node impd-test.cjs <port>`, Server-Wurzel `srv/` mit basis/ (4.87.0) und neu/, je version.json),
  428×926 Touch, echte Datei-Wahl. Ausgabe `impd-test.out`, Daten `impd-test.json`: **ALLE OK (10/10)**.
  - Projekt mit Audio (120-BPM-Datei als Spur), dann 112 BPM fest: Einsätze vs. 120er-Raster Basis max 14,61 / Mittel 14,58 ms → neu 0,84 / 0,54 ms.
  - Tempo-Lauf (112 ± 2,5 %, Periode 12 s, ±2 ms Zittern; erkannt 111,6): Basis max 102,26 / Mittel 32,28 ms → neu 0,82 / 0,54 ms.
  - Tonhöhe (DFT-Spitze 400–480 Hz): Eingang 440, Basis 440, neu 440.
  - Bitgleich Basis = neu: leeres Projekt + Tempo-Lauf-Datei (111,6 → 112 gedehnt), leeres Projekt + 111,5 BPM, Projekt mit Audio + Nutzer-Tempo 113.
  - Rechenzeit Anker (27-s-Datei): ~22 ms Hauptfaden, in Stücken (vvYield).
- Pflicht (`pflicht.out`): doppelt.js neu [], „MS 2000“ 1×, „  live: true,“ 1×, verbotene Zahlen 0×, neuer Code nur ASCII + „–“ im Kommentar.

## Offen / Grenzen
- Nur synthetische Dateien geprüft (Kick + 440-Hz-Ton + Hats); echte MP3s mit Live-Schlagzeug nicht geprüft.
- Schwankung muss unter ±¼ Schlag gegen das erkannte Raster bleiben (sonst greift der Konsens den Nachbarschlag – dann wie freie Wahl der Anker).
- Als „Gesang“ erkannte Dateien (kein Bass) und vom Nutzer gesetztes Tempo werden absichtlich wie bisher gleichmäßig gedehnt.
- Ganzer 3-min-Song: Anker-Rechnung grob ~150 ms Hauptfaden, in Stücken ≤ ~30 ms (nicht gemessen).
