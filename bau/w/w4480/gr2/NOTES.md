# GR2 – Genres echt & Remix übersetzt deine Noten

## 1. Für Xander

- **REMIX ist jetzt in der Song-Leiste** (neben ◆ ÜBERG., quer in der Spalte daneben). Kacheln mit 17 Stilen, darunter **Stärke 0–100 %**, dann **▶ Hören**. Das erzeugt den Remix und spielt ab dem Anfang des Bereichs. Läuft der Song, wechselt jeder Tipp auf eine Kachel den Stil ab dem nächsten Takt. **A Original / B Remix**, ↶ geht wie immer. Bereich: ganzer Song oder der Teil an der Abspielmarke.
- **Deine Noten** (Standard): Bass, Sequenzen, Akkorde und Drums behalten deine Töne und Motive. Sie rücken ins Raster, in den Swing und auf die Betonungen des Stils, ähnlich wie die Tonhöhen-Quantisierung. Je stärker, desto mehr Noten auf schwachen Stellen fallen weg. Lange Töne werden im Stil neu angeschlagen (Italo-Galopp, Reggae-Skank auf 2 und 4). Die Drums nehmen deine Pads, ab 50 % kommen die Kern-Schläge des Stils dazu, z. B. Four-to-the-floor oder One Drop auf der Drei. **Stil-Muster** ist der alte Remix: Drums und Bass spielen das Muster des Stils.
- Neue Stile: Italo-Disco, Italo-Dance, Hi-NRG, Minimal Techno, Industrial/EBM, Dark Wave, Reggae One Drop, Country Train-Beat, Country Shuffle und **Walzer 3/4**. Der Walzer stellt die Teile auf 3/4, A stellt sie zurück. Deine Musik in Blue-System-Art heißt **Euro-Disco**. **„Detroit Pop“ gab es als Stil nicht.** Das Muster ist der Detroit-Soul-Pop der 60er und heißt jetzt **„Soul-Pop 60er“** (vorher „Detroit Pop“, alte Remixe bleiben).
- **Genre-Fills:** In ◆ ÜBERGÄNGE (Reiter Übergänge) zeigt der neue Knopf **Genre** nur die Fills eines Stils, je Stil einer. Im Werkzeugkasten stehen sie unter Drums-Füller.

## 2. Technik

Block `/* GR2-BEGIN … GR2-END */` vor `const NO_SYNC = new Set([`. Einhänge-Zeilen (je 1, Kürzel GR2):
- `gr1ClipNorm`: `gr2GrNorm(g, o);` (clip.gr.u)
- `gr1RemixOpen`: `if (gr2RemixOpen(scope)) return;` (≡ › Song › Remix … und Marken-Blatt › Remix … öffnen das neue Blatt)
- `buildSongView`: `gr2SongBtn(top, bUe);` (Knopf [⇋ REMIX])
- `uePaintBar`: `gr2UeBarPaint(bar);` (Knopf „Genre“)

Daten (nur ergänzt, ohne Remix byte-gleich): `clip.gr.u` = Stärke der Übersetzung (0–100) an Remix-Versionen (SX9), ohne `u` = Stil-Muster wie GR1. `mark.ts` (T1) wird vom Walzer gesetzt bzw. zurückgesetzt. Keine neuen Projekt-Felder.
Stile: `GR2_NEW` (8 Stile) per `push` ans Ende von `GR1_STYLES`, damit sie auch unter Grundmuster ▾ und für den Swing im Werkzeugkasten gelten. `GR2_ONLY` (Shuffle mit Achtel-Triolen, Walzer 3/4) gibt es nur im Remix. `GR2_X` liefert comp/seq/gate/tip für die 7 GR1-Stile. Umbenannt wird beim Laden: 'euro' → „Euro-Disco“, 'detroit' → „Soul-Pop 60er“ (ids bleiben).
Kern: `gr2W` (Gewichte je Rolle), `gr2Best` (Präferenz = Gewicht − λ·Abstand, λ = 0,2 + 0,5·(1 − Stärke), höchstens ½ Schlag), `gr2Melo`, `gr2Drums` (Pad-Rollen, Kern-Schläge ab 50 %), `gr2Translate` (4/4 ↔ 3/4 je Takt anteilig), `gr2Role`, `gr2RemixDo`/`gr2Remix`, `gr2AB`, `gr2TsSync` (t1Pins/t1Unpin, `gr2Restart` an den Teilgrenzen), `gr2VerPut` (im offenen Blatt neu angelegte Versionen werden beim Stil-Durchprobieren wiederverwendet: `GR2.ses`).
UI: `gr2RemixOpen`/`gr2Paint`/`gr2Act`/`gr2Go`. CSS `#gr2-css`: hochkant ab 420 px ohne [▲▼] rückt die Leiste enger (wie mit [▲▼], ◆ zeigt „ÜBERG.“), quer teilen sich ◆ ÜBERG. und REMIX eine Zeile. Grundmuster ▾ wird ein Raster (15 Stile passen quer).
Fills: `GR2_FILLS` (17, `ueLibAdd`, Feld `gs` = Stil), dazu 9 neue Genres in `BB1_GEN` und 16 Figuren `gr2b-*` in `BB1_FIG` (ohne Walzer). Test-API `SYNQUENZER.gr2` (Objekt, wird nicht umhüllt).

## 3. Tests

- `gr2-test.mjs` → **36/36 OK**, keine Seiten- oder Konsolenfehler. Geprüft:
  - Song mit eigenem, eingespieltem Bass-Lauf und eigenen Drums → Italo-Disco 70 %: Tonhöhen bleiben (nur eigene Töne, gleiche Reihenfolge der Tonwechsel), Anfänge vorher nicht, nachher ganz im 16tel-Raster, Galopp, kurze Längen. Drums Four-to-the-floor aus den eigenen Kicks, nur eigene Pads.
  - Stärke 30 % anteilig gegen 70 % ganz. Swing NJS 0,62 gemessen. Reggae One Drop (Kick nur auf der Drei, Skank kurz auf 2/4).
  - Versionen mit gr.u, v1 unverändert, 1 Undo-Schritt, A/B, ↶/↷.
  - Walzer: 2 Teile 3/4, Song 12 Schläge, Versionen 3/4, Kick nur auf der Eins, Snare auf 2/3. A zurück auf 16 Schläge, B wieder 12, keine Phasenverschiebung. Wiedergabe ohne Tick-Fehler.
  - Stil-Muster-Art. Speichern/Laden gleich (gr.u, 3/4-Teile).
  - Leiste hochkant 428 (alle Tasten ≥ 44 px, nichts abgeschnitten). Blatt hochkant und quer 926×428/926×370 passt, ✕ sichtbar. Echte Tipps: Kachel, Regler, ▶ Hören, Stilwechsel beim Abspielen ohne neue Versionen, A → B, ■.
  - Einstiege ≡ und Marken-Blatt (Teil). Genre-Fills: Filter, frei setzen, Werkzeugkasten. Grundmuster ▾ quer.
- Fotos: `gr2-remix-hochkant.png`, `gr2-fills-hochkant.png`, `gr2-remix-quer.png`, `gr2-grundmuster-quer.png`.
- Pflichtprüfungen: topdefs 0 doppelt / 0 Syntaxfehler, doppelte Schlüssel 0, Rauchtest `errors []` (`smoke.png`), Markenwörter 0, „MS 2000“ 1, `  live: true,` 1. basis.html unverändert.
- Alte Tests:
  - `w4440/groove/gr1-test.mjs` bricht beim Remix-Blatt ab (`.gr1sheet` gibt es nicht mehr, gewollt) und erwartet „Euro Disco“.
  - `w4450/bb/bb1-test.mjs` zählt Genres und Figuren fest (jetzt 17 Genres, 22 Drums-Füller).
  - Der dortige Pegel-Ausreißer „Gate-Fläche −999“ ließ sich nicht wiederholen: Kopie und Basis rendern bitgleich (0,407). Dasselbe Skript bleibt auch mit der Basis am Ende hängen (waitForFunction-Timeout).

## 4. Offen / Risiken

- **Sichtbar geändert:** Die Song-Leiste hochkant ist enger. ◆ zeigt dort „ÜBERG.“ statt „ÜBERGÄNGE“, quer ebenso. Unter 420 px Breite und mit [▲▼] passt REMIX nicht in die Leiste. Dann geht es über ≡ › Song oder das Marken-Blatt, nichts schwebt über dem Song. Bitte im Funk bestätigen lassen.
- Das alte GR1-Blatt ist ersetzt. Zwingen-% steckt jetzt in „Stärke“ (Stil-Muster: Stärke der übrigen Spuren).
- Walzer nur für ganze Teile ohne eigene Clips oder Audio. Gesang und Audio laufen im alten Takt weiter (Hinweis im Toast). Melodie-Noten der Song-Zeile auf Schlag 4 fallen beim Wechsel auf 3/4 weg, wie bei T1; ↶ bringt sie zurück. Ein Song, der als Ganzes auf 3/4 steht, kann keine 4/4-Stile.
- Wechsel der Taktart beim Abspielen startet den Song am Bereichsanfang neu (wie T1).
- Durchprobieren im offenen Blatt überschreibt die dort angelegte Version: Zwei Remixe nebeneinander braucht ein erneutes Öffnen. Es gibt höchstens 8 Versionen je Clip.
- Rollen-Erkennung (Bass/Akkorde/Fläche/Sequenz/Melodie) über Klang-Kategorie und Noten. Melodien werden nur leicht ins Raster gezogen, ohne Weglassen.
- Stil-Daten sind ein erster Satz nach gängigen Mustern. Feinschliff nach Gehör, z. B. Gate-Längen und Reggae-Bass. Grundmuster ▾ kennt Walzer und Shuffle nicht.
- Andere Pakete (UI1: „globale Zugänge … Remix“) sollen `gr1RemixOpen`/`gr2RemixOpen` aufrufen und keinen zweiten REMIX-Knopf bauen.
