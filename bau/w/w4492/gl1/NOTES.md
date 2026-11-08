# GL1 – Background-Zeilen ohne Überschneidung, Glitch-Suche, LAUF wie gespielt

Basis: Stand 4.49 ohne Paket WEGE (`../basis.html`). VERSION/CHANGES unverändert. Eigener Block `/* GL1-BEGIN */ … /* GL1-END */`
(nach `/* /A2 */`) und `/* GL1-CSS-BEGIN */ … /* GL1-CSS-END */` (nach `CHS-CSS-END`), dazu kurze Einhänge-Zeilen (alle mit „GL1“ markiert).

## Für Xander

- **Background-Zeilen** überschneiden sich nicht mehr. Quer wurden die Chor-Spurköpfe so flach, dass Name und Pegel ineinanderlagen.
  Im Song fielen mit Video-Spur AKKORDE und MELODIE unten aus dem Bild. Weit herausgezoomt wurden Gesang und Chor über die Teil-Blöcke
  gemalt. Das ist alles behoben. Im Song zeigen die Background-Zeilen jetzt auch den Chor aus deinen Teilen (Szenen-Clips). Ein Tipp darauf
  öffnet die Stimme.
- **Glitch-Suche:** 19 Ansichten und Blätter, jeweils hochkant und quer (428×926, 926×428, 926×370), alle gemessen: vorher 42 Befunde, jetzt 0.
  Außerdem behoben: Schleifen-Knopf abgeschnitten, Mikro-Blatt quer unten aus dem Bild, ✕ lag auf der obersten Taste, „Ganze App“ im
  Video-Blatt abgeschnitten, „VIDEO“-Beschriftung zu groß.
- **LAUF:** Matrix-Clip, Song-Kachel und ROLLE zeigen jetzt die Noten in der Reihenfolge, in der sie wirklich gespielt werden. Die
  notierten Noten sind blass dahinter zu sehen. Am Clip steht ein Zeichen für die Richtung (◀ ⇄ ? ↑ ↓). In der ROLLE schaltet
  [wie gespielt │ wie notiert] um. Neu sind die Richtungen „aufwärts/abwärts (Tonhöhe)“: Der Rhythmus bleibt, die Töne kommen der
  Höhe nach. Die Wiedergabe spielt genau die gezeigte Folge (geprüft).

## Technik

1. **Matrix flach** (`gl1MxFlat`, Haken am Ende von `mxApply`): Die Zeilenhöhe wird aus `gridTemplateRows` gemessen.
   - Unter 32 px bekommt das Raster `gl1flat`. Der Chor-Spurkopf ist dann einzeilig: Name ohne „Chor “, der Pegel steht im Mischpult.
     „▼ BACKGROUND“ steht in einer Zeile (9 px).
   - Unter 26 px bekommt es `gl1flat2`: [▲▼ 2/2] steht nebeneinander.
   - `gl1ChsNm` legt „Chor “ in ein eigenes `<span class="gl1pre">`. Hochkant und bei normaler Zeilenhöhe bleibt alles wie bisher.
2. **Song-Seiten** (`svLayout`): Die Seiten zählen die STIMME mit ihren Background-Zeilen, wie die Matrix (`gl1SvPages` = `chsPages`).
   Jede Seite hat gleich viele Zeilen (`gl1SvFill`). Die Zeilenhöhe hat jetzt mindestens 9 px statt 14 px: vorher fielen
   AKKORDE/MELODIE bis 21,8 px aus dem Bild, jetzt nie mehr. Flache Beschriftung kommt über `gl1SvFlat` (unter 21 bzw. 17 px). Chor-Namen
   enden mit „…“.
3. **Weit draußen** (`sx8Blocks`): `gl1SvClip` schneidet beim Zeichnen von `tkSvDraw`/`chsSvDraw` die Teil-Blöcke aus (evenodd). In den
   Blöcken liegen dann 0 von 18 Messpunkten fremd, vorher 9 bis 12.
4. **Chor im Teil** (`gl1ChsSvParts`, `gl1ChsRuns`): `laneOriginAt` der STIMME-Spur ohne Song-Gesang darüber ergibt Läufe desselben
   Szenen-Clips. Die Stimmen werden in Farbe mit Noten gezeichnet. Ein Tipp (`chsSvTap` → `gl1ChsSvTap`) öffnet `chsOpenVoice({t, s}, Spur)`
   bzw. das Chor-Blatt.
5. **Weitere Glitches**:
   - `vd3LblSync` ruft `vd3Css()` auf. Vorher war „VIDEO“ ohne CSS 14 px groß, wenn der Schnitt-Modus gemerkt war.
   - `gl1FitV`: Der Schleifenwert wird erst ohne Leerzeichen, dann eine Spur kleiner gesetzt, und nur, wenn er mehr als 4 px zu breit ist.
   - `gl1PopWatch`: Ein ResizeObserver im `openPop` ruft `popFit` auf, wenn ein Blatt nach dem Öffnen wächst.
   - Hochkant hat `h4.ux1-h` jetzt mindestens 32 px. Vorher lag das ✕ samt Trefferrand bis 7 px auf der obersten Taste: ein Tipp oben
     rechts auf „rückwärts“ schloss das Menü.
   - Video quer: Die 9:16-Reihe darf schrumpfen und umbrechen.
6. **LAUF wie gespielt**:
   - `miniSvg` zeigt für Clips mit LAUF die Noten von `lf1Pass(c, 0)` als Rechtecke. Die notierten liegen davor mit `class="g1g"`; die
     Klasse steht zuerst, damit `vk4MiniRects` (Video) nur die gespielten liest.
   - `clipSig` enthält jetzt `lf` und die Schritt-Effekte. Bei Clips ohne LAUF ist die Signatur zeichengleich zur Basis.
   - `svTileNotes` → `gl1TileNotes` nutzt `a2Sound`.
   - PianoRoll hat die Option `opts.gl1` mit `played`, `ghost` und `draw` (3 Haken im Zeichnen). Der Umschalter sitzt gleich hinter
     [LAUF] (`gl1RollPlace`) und ist nur mit LAUF zu sehen.
   - Neue Richtungen `up`/`down`: `lf1NormLf` nimmt sie an. `lf1Build` erzeugt `P.perm` (`gl1Perm`: besetzte Schritte behalten ihren Platz,
     die Töne kommen nach `n + tp` sortiert), `lf1Pos` liest `P.perm`. Wiedergabe, MIDI, Video und Konsolidieren (A2) nehmen das ohne
     weitere Änderung mit.
   - Die Einträge stehen in `LF1_DIRS` und `LF1_ICON`.
7. **Test-API**: `gl1Info`, `gl1Tag`, `gl1Mini`, `gl1RollMode`, `gl1SvTap`.

## Tests

- `node gl1-test.mjs <index.html> <ordner>`: Ergebnis im Ordner `test/` mit `gl1-ergebnis.json`, `glitch-liste.txt` und
  `glitch-vorher.json`/`glitch-nachher.json`. Dazu kommen Fotos vorher/nachher: `chor-matrix-*`, `chor-song-*`, `chor-song-video-*`,
  `chor-song-weit-*`, `lauf-*` und `glitch-*`. Laufzeit etwa 6 Minuten.
- Pflicht:
  - `topdefs` 0/0, `dupkeys` 0, `smoke` errors [] (Bild `smoke.png`).
  - Verbotene Wörter: 0. „MS 2000“ kommt 1×, „  live: true,“ 1× vor.
  - Keine Emojis im neuen Block. ◀ steht mit U+FE0E.
  - ✕ ist in allen Blättern ganz zu sehen.
- Gemessen:
  - Background-Gruppe in Matrix und Song, hochkant und quer, mit und ohne Video-Spur, Teil-Marken, Block-Zeile, Fill-Chip und Schleife:
    0 Überschneidungen (vorher 4, 13, 5 und 6 Befunde je Bildgröße).
  - Glitch-Umfrage: vorher 42, nachher 0.
  - LAUF rückwärts, hin und her, Zufall, auf- und abwärts: Die Vorschau-Rechtecke und die ROLLE-Rechtecke stimmen mit `lf1Pass` überein,
    der noteLog der Wiedergabe ebenso.
  - Speichern/Laden ist geprüft.
  - Ohne Chor und ohne LAUF sind Matrix und Song pixelgleich zur Basis (6 Bilder).

## Offen

- Viele Chor-Spuren (bis 8) quer 926×370: Die Zeilen werden sehr flach (etwa 12 px). Sie sind lesbar und überschneiden sich nicht, sind
  aber klein zum Tippen. Vorschlag für den Funk: die Background-Spuren quer auf einer eigenen Seite oder rollbar. Das wäre sichtbar
  anders, deshalb ist es nicht gebaut.
- Die Song-Beschriftungsspalte ist schmal, Chor-Namen stehen dort gekürzt („Unis…“, „Okta…“). Die Ziffer und die Farbe unterscheiden
  sie. Kürzere Rollen-Namen wären ein Vorschlag.
- ROLLE-Werkzeugleiste: Ihre Tasten sind hochkant 36 px und quer 30 px hoch, das ist der bisherige Stand. Der neue Umschalter trifft
  hochkant auf 43 von 44 px; die Leiste ist 44 px hoch inklusive 1 px Rand. Quer ist er so hoch wie die Leiste.
- Bewusst nicht geändert:
  - Der Master-Pegel liegt als 14 px schmale Leiste im [SONG ⇄]-Eck (VV4-F).
  - Fill-Chips liegen weit draußen über den Teil-Blöcken; sie sind bedienbar.
  - Das LAUF-Richtungsmenü hat quer kein ✕ (UIX1: Tipp außerhalb schließt).
- Eigene Clips im Song (`song.own`) mit Chor erscheinen in den Background-Zeilen noch nicht, nur Szenen-Clips und Song-Gesang.
- Bei Chor-Spuren, die neu dazukommen, legt der Song die Zeilen einen Frame später neu an (rAF in `chsSvDraw`); das bleibt wie bisher.
- Auf dem iPhone noch prüfen:
  - ob ◀︎ als Zeichen erscheint und nicht als Emoji;
  - ob der Hinweis in der ROLLE (einmal je Sitzung) gut lesbar ist.
