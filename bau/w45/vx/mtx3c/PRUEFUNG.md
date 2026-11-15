# PRÜFUNG MTX3C (unabhängig, 15.11.2026) – nichts repariert

Geprüft: `index.html` md5 97c7758e gegen `basis.html` (rel-4700, 4.70.0, md5 9aa77532). Eigene Sonden in
`/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/pruef-mx3c-spkfix/` (`p-mtx3c.mjs`, `p-mtx3c-a.mjs`), je Datei nacheinander.

## Pflicht (selbst gelaufen)
topdefs 26 Skripte / 0 doppelt / 0 Syntax · dupkeys 0 · smoke errors [] · „MS 2000“ 1× · „^  live: true,“ 1× · VERSION 4.70.0 ·
diff basis→index 0 `<` (nur Block + 15 Ein-Zeilen-Haken mit typeof-Schutz).

## Wirksam (eigene Messung, basis → index)
| Punkt | basis | index |
|---|---|---|
| ECO bei aktiver Einzelspur (mit Audio-Kontext) | `trackEco(HH ZU)` true | false; DRUMS false wie vorher |
| HH ZU auf Synth-Klang umgestellt | – | `mtx3Is` false, normale ECO-Logik (false, analog) |
| Matrix-Remix aus Szene 2 (dort kein HH-ZU-Clip), italo | alles auf DRUMS: clap2/hatC16/hatO4/kick4/snare2 | DRUMS clap2/hatO4/kick4 · HH ZU hatC16 · SNARE snare2; Saat HH ZU = DRUMS; 1 ↶, ↶ leert alle |
| Song-Remix Stil 60 % (Variation, nicht Muster) nach dem Aufteilen | DRUMS snare 2 + SNARE-Spur 2 | SNARE-Spur 4, DRUMS 0; Summen je Pad gleich (kick 8, hatC 6, snare 4 …); 1 ↶, ↶ leert |

## Keine Nebenwirkung ohne Aufteilen
Ohne Einzelspuren: Projekt-JSON nach Song-Remix und nach Matrix-Remix gleich wie basis (verglichen ohne zufällige id/uid/seed/Zeit).
Zählung je Pad in `song.own` und im Matrix-Ziel identisch.

## Code-Durchsicht
- Sorge geprüft und verworfen: `mtx3cBegSched` ruft `cutTrackAt` für die Einzelspur – das bricht nur klingende Stimmen ab, keine geplanten
  Schläge; die Band-Schläge (src `mtx3`, `b3c`) räumt nur `mtx3cCancel` von DRUMS. Kein Verlust von Band-Schlägen.
- `melCommit`-Haken kehrt erst nach `MEL.open.delete(id)` zurück → keine hängende Taste.

## Befunde
1. (niedrig) `mtx3cMelC`: beim Zusammenlegen eines Doppelgriffs wird nur `UI.dirty.song` gesetzt, nicht `markDirty()` – die geänderte
   Lautstärke des schon abgelegten Schlags markiert das Projekt nicht als geändert (Sichern-Hinweis/Autosave sehen sie erst mit der nächsten Änderung).
2. (niedrig) `mtx3cBegSched` macht den Schnitt am Band-Ende (`run.tEnd`, `cutE`) nicht wie DRUMS. Für kurze Drum-Töne praktisch ohne Wirkung.
3. (bekannt) beg1-Herkunftsprüfung zählt die MTX3C-Zeilen mit (kein Fehler).

## Nicht selbst gemessen (Zeit)
Begleiter live/● Aufnahme, FANG, Melodie-Spur (brauchen laufende Wiedergabe) – nur Code gelesen, Messung des Paket-Tests nicht nachgestellt.

**Urteil:** Die gemessenen Fixes wirken. Ohne Aufteilen keine Nebenwirkung gefunden. Kein Befund blockiert.
