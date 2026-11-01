## 4.30.0 — North (Drum-Synth)

App: `rel-4300/index.html`, 4 665 281 B. Das sind **+174 623 B** gegenüber 4.29.0 (4 490 658 B), genau der Zuwachs von North
(in `rel-north` gegenüber 4.28.0 ebenfalls +174 623 B). `VERSION = '4.30.0'` (APP_CODE 4030000), md5 `9fb9a9b3…`.
Die Datei ist bei der Prüfung **unverändert** geblieben (`index-vor-pruef.html` ist bytegleich). Die rohe Merge-Fassung mit den
Konflikt-Markern liegt als `merged-roh.html` daneben (`56bd813a…`).
Die Zeile `  live: true,` steht 1× da, „MS 2000“ genau 1×, keine Markennamen (auch nicht in Kommentaren).

Grundlage ist jetzt **4.29.0** (online). Alles daraus bleibt: Video zeigt die echte App (Piano-Roll, Drum-Sequenzer, Modulation,
[Ganze App], Auto-Regie 2), Pegel je Spur und Master, Abspann-Logo, der Chor-Fix nach dem Laden, dazu Chor-Gruppe, Mitlese-Zeile,
GarageBand-Umweg, Songtext-Erkennung, Block/Konsolidieren, Magic Scale und Melodie-Pinsel. Neu kommt die Drum-Synthese **North**
dazu (Stage NORTH, geprüft als `rel-north` auf 4.28.0).

- Merge: `git merge-file` mit ours = 4.29.0 (`R-4290`), base = 4.28.0 (`R-4280`), theirs = `rel-north/index.html`.
- 3 Konflikte, alle nur „beide behalten“:
  - CSS: die Pegel-Balken (VV4-F) und die North-Editor-Regeln (ND2) stehen jetzt untereinander.
  - `VERSION` → `'4.30.0'`.
  - Liste der Test-Schnittstellen: `mtrInfo` (Pegel) und `mdInfo`/`mdRender`/`mdTest` (North) zusammen.
- Gegenprobe: Was 4.30.0 gegenüber 4.29.0 ändert, ist Zeile für Zeile genau das, was North gegenüber 4.28.0 ändert
  (2 113 neue, 30 ersetzte Zeilen), bis auf die eine zusammengeführte Listen-Zeile.
- Doppelte Namen (acorn): 22 Skripte, 3 770 Namen, **0 doppelt**, 0 Syntaxfehler.

### Was du siehst

- **Drum-Editor → SOUND → [Quelle ▾]**: Jedes Pad spielt entweder „Drum“ (der bisherige Klang) oder **North**.
  Zurück auf „Drum“ gibt genau den alten Klang, die North-Werte bleiben gemerkt.
- Ein North-Pad hat die Unter-Reiter **TONE · NOISE · CLICK · MIX · FX**. Dazu kommen:
  - große Wert-Zellen mit Unterzeile und Listen für WAVE
  - **Programm ▾** mit 45 Werks-Klängen, nach Kategorie sortiert
  - das Menü ⋯ (Programm sichern, Init, Einfügen, Tauschen)
  - **ALLE KANÄLE**, **SOLO PART** und ▶ zum Vorhören
- **KIT → North · HALL & ECHO**: gemeinsamer Hall und gemeinsames Echo der North-Pads, mit TAP für die Echozeit.
- Vier neue Kits in der Kit-Liste: **Fell & Holz, Modell-Analog, Gestimmt, Schräg**.
- Alle Tasten der North-Seiten sind mindestens 44 × 44 px groß. In 7 Formaten gibt es kein waagrechtes Scrollen.
- Die Pegel-Balken aus 4.29.0 bleiben, wo sie waren. Nichts verschiebt sich durch North.

### Was du hörst und im Video siehst

- North-Pads laufen über die Drum-Spur: Spur-FX, Sends, Mute/Solo und der Pegel-Balken der Drum-Spur wirken wie bei jedem Pad.
- **Im Song-Video klingen North-Pads wie live.** Zwei Videos desselben Songs sind bitgleich (ohne Chor), 0 verspätete Schläge.
- **Das Drum-Sequenzer-Bild im Video zeigt die North-Drums**: Die Auto-Regie schaltet beim neuen Drum-Clip auf den Drum-Sequenzer,
  dort leuchten die Schritte, die Treffer blitzen und Kick/Snare wechseln wie mit dem alten Kit. Wie auf der SCHRITTE-Seite der App
  steht dort kein eigenes „North“-Zeichen – die Pads heißen weiter KICK, SNARE …
- Pegel im Video und das Abspann-Logo laufen mit North genauso wie ohne. Der Abspann bleibt still.
- Im GarageBand-Instrumental sind die North-Drums drin, der Chor nicht (wie bisher).
- Projekte ohne North-Pad klingen und laden wie in 4.29.0. Das North-Modul wird dann gar nicht geladen.

### So prüfst du am iPhone (Safari)

1. **Version:** Seite neu laden. ≡ (Menü) → Info zeigt „SYNQUENZER 4.30.0“.
2. **Alte Projekte:** Ein altes Projekt mit Chor-Gruppe und Songtext öffnen und abspielen. Es soll klingen wie gestern.
   Die Pegel-Balken in Matrix und Song bewegen sich wie in 4.29.0.
3. **Kit „Schräg“:** Drum-Spur → **KIT** → Kit **„Schräg“** laden → ▶. Die Drums klingen jetzt nach North.
   Der Pegel-Balken der Drum-Spur schlägt mit aus.
4. **Quelle umschalten:** Drum-Editor → ein Pad (z. B. KICK) → **SOUND** → **[Quelle ▾]** → „Drum“. Es kommt der alte Kick.
   Dann wieder „North“: Der North-Klang ist unverändert wieder da.
5. **Reiter:** Auf einem North-Pad die Reiter **TONE, NOISE, CLICK, MIX, FX** antippen und eine Zelle senkrecht ziehen.
   Jede Taste muss bequem mit dem Daumen gehen, nichts darf abgeschnitten sein, hochkant und quer.
6. **Programme:** **Programm ▾** → ein paar der 45 Klänge durchhören (▶).
7. **Hall & Echo:** **KIT → North · HALL & ECHO** → Hall hochziehen, dann TAP 4× im Takt tippen. Das Echo folgt.
8. **3 Minuten:** Song mit Stimme, Chor-Gruppe und Kit „Schräg“ **mindestens 3 Minuten** laufen lassen.
   Achte auf Knackser, Aussetzer und ob das Handy heiß wird.
9. **Video mit North:** In diesem Song **≡ → Video → 16:9 → Auto → Video erstellen.** Achte auf:
   - Die North-Drums sind im Video zu hören, der Chor auch.
   - Beim Drum-Teil kommt das Drum-Sequenzer-Bild, die Schritte leuchten im Takt.
   - Am Ende: Bild dunkelt ab, dein Logo einmal in der Mitte, kein Ton im Abspann.
10. **9:16 → [Ganze App]:** dasselbe Video hochkant, mit Pegel-Balken.
11. **Konsolidieren mit North:** Takte mit Chor-Stelle und Drums als Block markieren (Taktleiste → ⋯ Mehr → [▣ Als Block]).
    Dann Block antippen → [Als neuen Teil konsolidieren] → abspielen. Klingt der Song genau wie vorher? Danach [Zurückholen].
12. **GarageBand:** [Instrumental als Datei] → in GarageBand öffnen. Die North-Drums sind zu hören, der Chor nicht.
13. **Speichern:** Speichern, App ganz schließen, wieder öffnen, Projekt laden → Video erstellen.
    North-Pads, Kit, Block und Chor sind wie vorher, der Chor ist im Video, das Video startet ohne lange Pause.

### Tests (Chromium headless, 4 Kerne, gegen `rel-4300/index.html`, „alt“ = 4.29.0 `R-4290`)

Alle Läufe einzeln, je höchstens 5 min. Start: `rel-4300/tests/alle.sh` (North + Hauptlinie), die EDIT-Tests liegen angepasst
unter `rel-4300/tests-edit/` (Kopie von `rel-4290/tests`, zeigen über `../index.html` auf 4.30.0).
Last auf der Maschine während der Prüfung: 0,1 … 2,4 (ruhig).

| Test | Ergebnis |
|---|---|
| North-Rauchtest · `md4-quick` | ✓ `errors []` · ✓ Engine bereit (27 ms), Undo gleich, 0 verspätet |
| `md4-golden` (Regel 28 gegen **4.29.0**) | Kits deep-equal, Render −120 … −155 dB (= alt/alt), ohne North-Pad kein Modul ✓ · ✗ nur **Größe +174 623 B** (Budget 100 KB, Q9) → 5/6 |
| `md4-int` (ND4-03/04/05) | **20/20** |
| `md2-ui` hochkant · quer (gegen 4.29.0, getrennt gelaufen) | **195/195 · 195/195** (auch ND2-10 TAP grün) |
| `ndstage-tap44` | 84 Ansichten, alle Tasten ≥ 44 px, kein waagrechtes Scrollen |
| `north-songs` (9 Projekte aus **4.29.0**) | **6/6**: laden + speichern unverändert, kein North-Modul, Video 356 Noten, −0,07 dB |
| `north-video` (ND4-08, Video-Render 4.29.0 mit Pegel-Meter) | ✓ bitgleich (−300 dB), live ↔ Video 1,00, 0 verspätet, live danach weiter |
| `north-kon-chor-ggb` (North-Kit + 2 Chor-Gruppen, Konsolidieren/Zurückholen/↶, Instrumental) | **17/17** |
| **neu** `north-vv4-e2e.mjs` WebCodecs: Song mit Melodie, 2 Drum-Clips, Transposition, STIMME + Chor-Gruppe, **Kit „Schräg“** → Video 16:9 Auto und 9:16 [Ganze App] mit Pegel und Abspann-Logo | **34/34**: North-Knoten im Offline-Kontext, 0 späte Schläge, 80 Schläge = 80 im Noten-Log; Auto-Regie → Drum-Sequenzer mit North-Schlägen (Blitz 48/121 Bilder, Kick/Snare-Wechsel ≤ 1 je Schlag); Pegel-Fenster vollständig (571/570); Logo mittig, gekeyt, Rot satt; Abspann still; North im Ton (mit Drum-Stimme −1,8 dB anders, Rauschen −62,8 dB); Chor im Ton (−9,6 dB gegen −114,8 dB) |
| **neu** `north-vv4-e2e.mjs` Aufnahme-Weg (MediaRecorder, Echtzeit) | **34/34** (dieselben Prüfungen, Echtzeit-Aufnahme; 121 s) |
| `north-chor-songs` (Song mit Chor-Gruppe aus 4.29.0, Datei in einer **neuen** Browser-Sitzung geladen) | 7/8: Datei, Chor-Gruppe, kein Modul, 48 Noten ✓, **kein Warten mehr** (25 s statt 236 s) · Video-Pegel −2,44 dB ✗ = **genauso 4.29.0 → 4.29.0** (gewollt seit 4.29.0: Takes fehlen dort, Gesang still wie live – siehe unten) |
| `north-startzeit` (12 Läufe je Fassung, ohne North-Pad) | ✓ kein North-Modul, auch nicht nach ▶. Zahlen unten |
| **Hauptlinie** `chor-frisch` (Chor nach dem Laden: neue Seite, neu geladen, ZIP, nur .json) | **16/16** |
| `ggb-video` (Instrumental ohne Video-Zusätze, **bit-gleich mit 4.29.0**; Video-Ton mit/ohne Pegel-Meter bit-gleich) | **9/9** (die Versions-Erwartung der Kopie von 4.29.0/4.28.0 auf 4.30.0/4.29.0 gestellt) |
| KON: kon-block 41, kon-konsol 42, kon-save 11, kon-layout 24 | **118/118** |
| MAGIC: ms-funktion 43, ms-layout 38, ms-regress 2 (alt = 4.29.0) | **83/83** |
| PINSEL: t-pinsel 39, t-bloecke 20, t-mithoeren 20, t-layout 47, t-alt 18 (alt = 4.29.0) | **144/144** |
| EDIT-Zusammenspiel 48 · G-GB × KON 34 | **82/82** |
| G-GB `ggb-h-zusammenspiel` | **16/16** |
| G9b-Rauchtest (4.30.0 / 4030000) | **5/5** |
| Pipeline: `smoke.mjs` · `orch-mk-check.mjs` · `v3-mk2-wellen.mjs` | ✓ `errors []` · ✓ 4.30.0, initAm rms 0,0705 / Spitze 0,177 (wie 4.29.0) · alles PASS (8/8) |
| acorn-Doppelprüfung | 22 Skripte, 3 770 Namen, **0 doppelt** |

**`north-chor-songs` ist kein North-Fehler.** Der Test lädt die gespeicherte .json in einer neuen Browser-Sitzung. Das ist wie ein
anderes Gerät: Das Audio der Takes fehlt dort. Seit 4.29.0 bleibt der Gesang dann im Video still (wie beim Abspielen) und die App
wartet nicht mehr 3,5 min. Deshalb ist das Video leiser als das Original (−2,44 dB). 4.29.0 gegen sich selbst zeigt genau dieselben
Zahlen. Mit Audio (gleiches Gerät, neu geladen, ZIP) ist der Chor im Video: `chor-frisch` 16/16. Die alte Altlast „Offen 3“ aus
`rel-north` ist damit erledigt.

### Startzeit ohne North-Pad (12 Läufe je Fassung abwechselnd, Median, gegen 4.29.0)

| | 4.29.0 | 4.30.0 | Unterschied |
|---|---|---|---|
| App bereit, CPU ×1 | 351 ms | 368 ms | +17 ms |
| `load`, CPU ×1 | 426 ms | 436 ms | +10 ms |
| Skript-Zeit, CPU ×1 | 60 ms | 68 ms | +8 ms |
| App bereit, CPU ×4 (wie ein langsames Telefon) | 1 769 ms | 1 762 ms | −6 ms |
| `load`, CPU ×4 | 2 199 ms | 2 175 ms | −24 ms |
| JS-Heap | 5,4 MB | 5,7 MB | +0,3 MB |

- Bei ×4 liegt der Unterschied im Rauschen (in `rel-north` waren es +74 ms, die Messung schwankt um ±30–50 ms).
- Was bleibt: einige Prozent mehr Lesen und Übersetzen der größeren Datei (+4 %). North selbst lädt nicht (0 × `addModule`, Zustand `idle`).
- Nicht umgebaut (Q9).

### CPU und Größe (aus `rel-north` übernommen, Engine-Code bitgleich, nicht umgebaut)

- **CPU je Stimme** (`md1-cpu`, offline): schlimmster Fall 9,9–11,5 % (Grenze 8 %). Mit Begrenzer Stufe 2: 6,9–7,5 %.
- **Echtzeit** (`md1-chromium`): schlimmster Fall 16,1 %, typischer Groove 4,9 %, Leerlauf 0,2 %, Modul-Laden 6–17 ms.
- **3-Minuten-Lauf North + Chor** (rel-north): 0 Knackser, 0 verspätete Schläge, Engine-Last je Sekunde max. 15,3 %, Median 6,6 %.
- **Größe:** +174 623 B gegenüber 4.29.0 (Budget 100 KB).

### Bei der Prüfung behoben

- An der App: **nichts.** Kein Test fand einen Fehler aus dem Zusammenspiel North × Video 4.29.0.
- An den Tests: `tests-edit/ggb-video.mjs` erwartete fest „4.29.0“/„4.28.0“; jetzt 4.30.0/4.29.0 (über `WANTV`/`ALTV`).
  `md2-ui` läuft hochkant und quer getrennt, weil es zusammen fast 5 min braucht.

### Offene Punkte

1. **Gerätetest iPhone 12 Pro Max:** Schritte 8–13 oben. Er entscheidet Q3.
2. **Q3 CPU je Stimme:** schlimmster Fall 9,9–11,5 % statt 8 %, mit Begrenzer Stufe 2 knapp darunter. Nur gemessen, nicht umgebaut.
3. **Q9 Größe:** +175 KB (Budget 100 KB). Startzeit am Rechner etwa +10–17 ms ohne North-Pad.
4. **Zwei Video-Renders des ganzen Songs mit Chor-Gruppe** sind nicht ganz bitgleich (hier −62,8 dB; in `rel-north` −43 … −52 dB an den Chor-Einsätzen, dort auch in 4.28.0 ohne Drums). Ohne Chor ist das North-Video bitgleich (−300 dB). Nicht angefasst, weil Chor-/Video-Code.
5. **Synth-Engines im Video unter starker Last:** Sie schicken ihre Noten auf dem Weg, den North vor seinem Fix hatte. Nicht beobachtet, nicht angefasst.
6. **Master-Spitze** vor dem Limiter mit Kit „Schräg“ + Chor ≈ +1,9 dBFS (Q2 Pegelschutz).
7. Aus der Stage weiter offen: Chor-Stile wave/ballade/disco greifen mit dem Test-Gesang nicht (Testaufbau), Q6 E1-Abklingen, ND42-Fragen 1–4.
8. Noch nicht auf dem iPhone geprüft. Fertig ist es erst nach Xanders Okay.

### Fragen an Xander

1. Größe +175 KB und Startzeit etwa +10–20 ms ohne North-Pad. Ist das so okay (Q9)?
2. Q3: Reicht der CPU-Begrenzer, wenn dein iPhone den 3-Minuten-Lauf (Schritt 8) ohne Knackser schafft?
3. Soll das Drum-Sequenzer-Bild im Video bei North-Pads ein eigenes Zeichen bekommen? In der App gibt es keines, darum jetzt auch nicht im Video.
4. ND42-Fragen aus der Stage: SOLO PART nur für North-Pads? Würfel bei North-Pads? Höhe der Unter-Reiter? ✕ zum Löschen eigener Programme?
