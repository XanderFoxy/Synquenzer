# G10J – Status: fertig (wartet auf Xanders Okay)

Basis `bau/snapshots/R-4310.html` (4.31.0) → `index.html`, VERSION bleibt '4.31.0'. Diff: `patch.diff`. Markierung `// G10j`, Block `/* G10J-BEGIN */ … /* G10J-END */`, CSS `/* G10J-CSS-BEGIN */ … /* G10J-CSS-END */`.

## Was gebaut ist
- Je Spur eigener Knoten `guide` (Wert 1) zwischen `post` und `cut` (`buildChain`), vor den Post-Fader-Sends. Nicht `vol`, nicht `cut`. `mpTick` (Mithören im Noten-Editor) hängt seinen Knoten jetzt hinter `guide` ein.
- Chorstimmen über die vorhandenen Führungs-Faktoren `g6pGuide` (nichts doppelt gebaut).
- Steuerung `g10jSync`: aktiv nur bei laufendem Take mit 🎤 (Szene `rec.vox`, Song `R.songRec.vox`); Prüfung je Bild (`uiFrame`), je Planungs-Schritt (`recTick`, auch bei gesperrtem Bildschirm) und in `stop()`. Rampe 30 ms, danach exakt 1.
- Zeile in `popRecOpts` (Szene) und `openRecStart` (Song; ersetzt dort mit 🎤 die H7-Zeile „Alte Stimme“, gleiche Bedeutung über `UI.recGuide`).
- `g6Arm` nimmt Song-Stimmen; Haken `g10jSongTook` in `tkSongCommit`; beim Song-Selbst-singen bleibt der Lead-Weg offen (`sr.guide`), sonst gäbe es keine Führungsstimme.
- Live-Punkt: Worklet „synq-stimme“ meldet die MPM-Tonhöhe (Median 3 Hops) nur, wenn die Leiste offen ist (`cfg.pp`).
- „Schläge je Takt“: `g10jBpb()` (heute `grid().beatsPerBar`).
- Format 5 unverändert, keine Projekt-Felder, keine Datenbank/Netz.

## Tests (schlank)
- `tests/g10j-abnahme.mjs` – ein Lauf, ≈ 13 s, Fake-Mikro (Sinus 440/460 Hz), Touch, 428×926: **22/22 grün**
  - G10-87: im Take Vorlage +6,00 dB, Rest −10,00 dB; nach natürlichem Take-Ende und nach ■ jeder Knoten = 1 (exakt).
  - G10-88: Render mit eingestellter Vorlage: alle 7 Offline-Ketten `guide` = 1, Chor-Faktor = 1, Pegel gleich (−19,34 dBFS).
    Hinweis: Der Video/WAV-Render ist schon in R-4310 von Lauf zu Lauf nicht bitgleich (Rauschen/Phasen frei) – ein Hash-Vergleich zweier Läufe beweist darum nichts; geprüft ist, dass die Vorlage im Render-Weg nirgends wirkt.
  - G10-89: 440 Hz gegen A4 → grün (0 ct); 460 Hz → gelb mit ↓ (+77 ct); Verzögerung Median ≈ 23–29 ms (≤ 60).
  - G10-90: Song-Stimme selbst gesungen → Chorstimme bekommt den neuen Take, Lead bleibt, „scharf“ aus (Funktion direkt geprüft, nicht mit echtem Song-Chor).
  - G10-91: alle Knöpfe der Zeile/Leiste ≥ 44 px; Leiste `position:fixed`, Layout von Kopf und Tastatur unverändert.
- `tests/smoke.mjs` (Kopie von bau/tests/smoke.mjs, Import-Pfad angepasst): keine Fehler.
- `tests/acorn-check.cjs`: 20 Skripte ohne Syntaxfehler, `  live: true,` 1×, „MS 2000“ 1×, verbotene Wörter 0.
- Bilder: `tests/g10j-szene-blatt.png`, `tests/g10j-song-blatt.png`, `tests/g10j-leiste.png`.

## Bitte prüfen (iPhone, Kopfhörer)
1. ● halten → Vorlage „Spur ▾“ → Bass, „Vorlage lauter“ + „Rest leiser“ → ● mit 🎤: Bass deutlich vorn, Rest leise; nach dem Take / nach ■ klingt alles wieder normal.
2. ● SONG halten mit 🎤 GESANG, Takte markiert → Vorlage „alte Stimme“: Modus heißt „Ersetzen (Vorlage hörbar)“, die alte Stimme ist beim Singen hörbar; danach im Takes-Blatt A/B tauschen.
3. Chor-Blatt einer **Song-Stimme** → „Selbst singen“ → ● SONG (Ersetzen, 🎤): Vorlage-Leiste erscheint über der Modus-Zeile, Zielstimme farbig, Lead grau, Punkt grün/gelb/rot mit Pfeil; danach ist deine Aufnahme die Chorstimme, der Lead bleibt.
4. In der Leiste „Vorlage-Pegel“ schieben und „Lead leise“ an/aus – hörbar, ohne Knacken.
5. Ohne Kopfhörer: Hinweis in der Zeile wird gelb („Gerade: Lautsprecher“), beim Start kommt ein kurzer Hinweis.
