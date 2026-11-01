# VV-LOGO – Abspann-Logo am Ende jedes Videos (Basis: App 4.26.1, `bau/snapshots/R-4261.html`)

VERSION bleibt `4.26.1` (nicht geändert). „MS 2000“ genau 1×, `  live: true,` genau 1×, keine neuen Markennamen, keine Emojis als Grafik.
Keine Datenbank-Zugriffe (nur IndexedDB im Browser für die eigene Datei). Keine Datei in `medien/` angelegt.

## Was Xander sieht
- **Blatt „Video“, neue Zeile „Abspann“:** Schalter **[Abspann-Logo]** (zweite Zeile im Knopf: `an` / `aus` / `Logo fehlt` / `lädt …`,
  bei eigener Datei `an · eigene Datei`) und **[Andere Datei wählen …]**. Hochkant liegt die Zeile nach „Bereich“, quer unter der
  Vorschau (so passt die Bedienspalte rechts weiter ohne Rollen in 375 px Höhe, wie seit VV2). Alle Ziele 44 px hoch.
- **Vorgabe an**, wenn ein Logo da ist; die Wahl wird gemerkt (Geräte-Einstellung `uiPrefs.vv.logo`, wie Format/Bild).
- **Logo fehlt** (Datei nicht auf der Seite, nicht abspielbar, Vorschau ohne Zugriff/`file://`, offline): Schalter ausgegraut mit
  „Logo fehlt“, das Video entsteht wie bisher ohne Abspann, keine Fehlermeldung.

## Quelle
1. eigene Datei aus IndexedDB (eigene kleine Datenbank `synquenzer-abspann`, Eintrag `logo` = {name, type, buf}) – hat Vorrang;
2. sonst `medien/abspann-logo.mp4`, dann `medien/abspann-logo.mov`, relativ zur App-URL (gleiche Herkunft, `fetch` nur über http/https).

Geladen wird erst beim Öffnen des Blatts „Video“ bzw. beim ersten Export (kein Netz beim App-Start). Geprüft wird jede Datei mit
einem stummen Inline-Video (Länge endlich, Bildgröße > 0). [Andere Datei wählen …] öffnet `input type=file accept=video/*`;
eine Datei, die sich nicht abspielen lässt, wird abgelehnt („Diese Datei lässt sich hier nicht abspielen“), das alte Logo bleibt.

## Ablauf am Videoende (alle Formate, beide Kodierwege)
| Abschnitt | Länge | Bild | Ton |
|---|---|---|---|
| Song (samt Ausklang, wie bisher) | r.dur | wie bisher | wie bisher (klingt bis < −60 dBFS aus) |
| Abblende | 1 s | letztes Bild dunkelt flächendeckend linear auf Schwarz ab | still (Song ist ausgeklungen) |
| Logo | Logo-Länge | Schwarz, Logo mittig, 0,5 s Einblenden, läuft ganz; 60 % der kürzeren Bildseite (Seitenverhältnis bleibt); `globalCompositeOperation = 'screen'` über Schwarz → kein Kasten | still (Logo stumm) |
| Schluss | 0,5 s | Schwarz | still |

**Videolänge = Song + 1 s + Logo-Länge + 0,5 s** (`VV.res.dur` ist jetzt die ganze Länge; `VV.res.logo = {name, own, at, fade, len, end}`;
ohne Abspann `logo: null` und alles wie bisher).

- **WebCodecs:** Logo-Bilder per Suchen (`currentTime` → `seeked`) Bild für Bild; Bilder hinter dem Song-Ende warten mit Abspann auf
  die getrimmte Länge (sonst würde ein Song-Bild statt der Abblende kodiert); Tonspur bekommt Stille bis zum Ende.
- **Aufnahme in Echtzeit (iPhone):** Logo läuft als stummes Video mit und wird nach Pausen (Sperrbildschirm) neu auf die richtige
  Stelle gesetzt; eine stille ConstantSource hält die Tonspur bis zum Ende offen (sonst endet sie in Chromium beim Song-Ende).
- Abbrechen im Abspann: Logo stoppt, Job frei, nächster Export normal.

## Code (alles im Block `VV-LOGO … VV-LOGO-END` vor `vvEncodeWC`, plus Haken)
- neu: `VVL`, `vvLogoPref`, `vvlInfo`, `vvlDb`, `vvlProbe`, `vvlFree`, `vvlLoad`, `vvlSync`, `vvlToggle`, `vvlPick`, `vvlOwn`,
  `vvlOutro`, `vvlDark`, `vvlLogo`, `vvlSeek`, `vvlFrame` (WebCodecs), `vvlFrameRT` (Echtzeit), `vvlRewind`; CSS `.vvlogo …`, `.vvb.vvlq` (quer).
- Haken: `vvEncodeWC` (Bildzahl, Warten, Abspann-Bilder, Stille), `vvEncodeMR` (Länge, Abspann-Bilder, Pause, stille Quelle),
  `vvMake` (`vvlOutro`, `outro` an beide Wege, `res.dur`/`res.logo`, Test-Haken `VV.test.size`), `vvOpen` (Zeile), `vvSync` (`vvlSync`),
  `vvFit` (Zeile quer/hochkant umhängen), `vvApi` (`vvLogo({reload, pref})`, `vvLogoClear()`).
- Ohne Logo (oder Schalter aus) laufen alle alten Wege unverändert (alle Änderungen hängen an `job.outro`; Ton-Schleife rechnet ohne
  Abspann exakt wie vorher).

## Tests (`tests/`, Ergebnis siehe STATUS.md)
`alle.sh` startet alles. Eigener http-Server bildet `medien/abspann-logo.mp4|.mov` auf die Test-Animation `tests/test-logo.mp4|.mov`
ab (600×600, schwarz, „TEST LOGO“, Bildzähler, wandernder Balken, 3 s; mit ffmpeg erzeugt).
- `vvl-export.mjs WAY FMT [mov]` – Länge, Tonspur, Abblende, Logo mittig/Größe/kein Kasten/läuft, Schluss schwarz, Ton still.
- `vvl-ui.mjs` – an/aus, gemerkt, Logo fehlt (404, kaputte Datei, file://), Reihenfolge .mp4 → .mov, eigene Datei (Vorrang, nach Neuladen,
  kaputte abgelehnt), Screen-Key über hellem Bild, 6 Bildschirmgrößen gegen R-4261.
- `vvl-regress.mjs` – ohne Logo wie R-4261 (beide Wege). `vvl-cancel.mjs` – Abbruch im Abspann.

## Befund aus R-4261 (nicht geändert)
Beim WebCodecs-Weg **ohne** Abspann ist die Bildspur der Datei 2–3 s länger als der Ton (Bilder hinter dem Song-Ende werden kodiert,
bevor die getrimmte Länge bekannt ist; schon in R-4261, schwankt von Lauf zu Lauf). Mit Abspann tritt das nicht auf (Bild = Ton).

## Fragen an Xander
1. **1:1** gibt es im Blatt nicht (nur 9:16 und 16:9). Der Abspann ist formatunabhängig und mit 1080×1080 (Test-Haken) geprüft –
   soll 1:1 als Format dazukommen?
2. **Musik ausblenden:** Der Song klingt wie bisher bis unter −60 dBFS aus, erst dann beginnt die 1-s-Abblende – die Musik ist dort schon
   still. Lieber Bild und Musik gleichzeitig ab Song-Ende 1 s ausblenden (Ausklang würde abgeschnitten)?
3. **Logo-Ende:** harter Schnitt vom letzten Logo-Bild auf die 0,5 s Schwarz. Endet dein Logo nicht auf Schwarz: kurz ausblenden?
4. **Eigene Datei entfernen** (zurück zum Seiten-Logo) ist nicht gebaut – gewünscht?
5. **Offline:** das Seiten-Logo wird nicht vom Service-Worker vorgehalten → offline „Logo fehlt“ (eigene Datei geht). In `sw.js` aufnehmen?
6. **▶ Vorschau** zeigt den Abspann nicht (nur das fertige Video) – so lassen?
7. Hinweis: fehlt die Datei auf GitHub Pages, meldet die Browser-Konsole selbst „404“ für die zwei Anfragen (kein App-Fehler).
