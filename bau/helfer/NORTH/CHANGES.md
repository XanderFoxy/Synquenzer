# North auf 4.26.1 – was neu ist (bau/helfer/NORTH)

Basis: `bau/snapshots/R-4261.html` (App 4.26.1, VERSION unverändert). Alles aus 4.26.1 bleibt: Gesang, Songtext, Video, Interface-Wahl.

## Was Xander sieht

- **Drum-Editor → SOUND → [Quelle ▾]**: je Pad „Drum“ (der alte Klang) oder **North** (die neue Drum-Synthese).
  Zurück auf Drum = genau der alte Klang; die North-Werte bleiben gemerkt.
- North-Pad: Unter-Reiter **TONE · NOISE · CLICK · MIX · FX**, große Wert-Zellen mit Unterzeile, Listen für WAVE, Programm ▾ (45 Werks-Klänge
  nach Kategorie), ⋯-Menü (Programm sichern, Init, Einfügen, Tauschen), **ALLE KANÄLE**, **SOLO PART**, ▶ zum Vorhören.
- **KIT → North · HALL & ECHO**: gemeinsamer Hall und Echo der North-Pads, TAP für die Echozeit.
- 4 North-Kits in der Kit-Liste: **Fell & Holz, Modell-Analog, Gestimmt, Schräg**.
- Alle Tasten der North-Seiten ≥ 44 × 44 px (auch Unter-Reiter und Instrument-Chips), in 7 Formaten ohne waagrechtes Scrollen.
- BEND-Unterzeile kurz („+15,1 HT“ statt „Start +15,1 HT“) – passte in 320×568 und quer 667×375 nicht.
- Hilfe: 7 neue Zeilen zu North (Quelle, Programm, Alle Kanäle, Solo Part, Mono-Gruppe, SCL PRE, Hall & Echo).
- Kein Gerätename/Markenname sichtbar (auch „Kodamo“ im ⓘ Vorbild des FM-Felds ist jetzt neutral formuliert).

## Was Xander hört

- North-Pads klingen über die Drum-Spur (Spur-FX, Sends, Mute/Solo wie jedes Pad), zeitgenau (0 verspätete Schläge).
- **F2 (FM mit Selbst-Rückkopplung) ist zahmer** (Entscheidung Q7: β = 0,6 in Radiant statt in Perioden) – weniger Rauschen, musikalisch nutzbar.
- **Song-Video**: North-Pads klingen im Video wie live (Korrelation 1,00 im Median der 1-s-Fenster); zwei Videos desselben Songs
  haben bitgleichen Ton; nach dem Video spielt live alles weiter wie vorher (das Staging kannte den Video-Render von 4.26.1 noch nicht).
- Projekte ohne North-Pad: **alles klingt und lädt wie in 4.26.1** (Regel 28) – das North-Modul wird dann gar nicht geladen.

## Technik (kurz, für den Dirigenten)

- 3-Wege-Merge `git merge-file` (Basis `bau/werkzeug/vs-base-B.html`, ours R-4261, theirs NDSTAGE): 50 Stücke sauber, 3 Konflikte –
  CSS-Block (G-MK8b-Trefferflächen + ND2-Stile), `stop()` (G9-39 + ND2), Hilfe-Liste (TEXT (STIMME) + North-Zeilen): jeweils **beide** behalten.
- Neue Haken für den Video-Render VV1 (in 4.26.1 neu): `mdVvSave` / `mdVvBoot` / `mdVvRest` / `mdVvFlush` – im Offline-Durchlauf
  bekommt die Engine einen eigenen Knoten mit den Programmen als `processorOptions.init`; vor jedem `resume` gehen die gebündelten
  Schläge raus (sonst kamen sie zu spät → nicht reproduzierbar); der Live-Knoten wird nicht berührt. `MDX.node(ctx, dest, init)` (optional).
- Q5: lokaler FM-Bezeichner `nOrd` → `nTopo` (nur in der Vorschau-Rechnung des FM-Felds); `grep -i nord` = 0.
- Tests umgestellt auf R-4261 als „alt“; `md4-store` wartet auf das (in 4.26.1 vorhandene, asynchrone) `historyCheck()`.
- Neue Tests: `north-video.mjs` (ND4-08), `north-songs.mjs` (alte Songs), `play3min-basis.mjs` (Vergleichslauf ohne North).
