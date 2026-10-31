# CHANGES – VIDSTAGE (Staging Video-Paket) · App 4.25.0 · Format 5 · keine Server-Änderung

`index.html` = `bau/vs/n5-br-V/index.html` (VV1 + VV2 + Fixes) + VV3 aus `helfer-vv3` (Basis `bau/snapshots/VV1.html`)
+ VC2a aus `bau/vs/n5-br-H/index.html` (Basis `bau/werkzeug/vs-base-B.html`).

## 1. Zusammenführung – Fehler, die dabei entstanden und behoben sind

| Fehler | Behebung |
|---|---|
| Syntaxfehler: beim Auflösen eines Konflikts war eine Kommentarzeile abgeschnitten | Konflikt neu und verankert aufgelöst (`a878da8`) |
| VC2a × VV1: der Verlauf-Rekorder lief während des Offline-Renderns mit (Song ist dabei ausgetauscht, `loop.on` aus) | `histBusy()` ist während `UI.vvOff` wahr – kein Durchlauf, kein Keyframe (`90936b0`) |
| VV2 × VV3: der Test-Schalter `VV.test.spur` hatte Vorrang vor dem Spur-Schnitt der Regie | der Spur-Schnitt der Regie (`view 'spur'`, `st.spur`) geht vor, Test-Schalter nur ohne Schnitt (wie VV3) (`90936b0`) |
| Tests: feste Pfade auf die Zweige | alle Test-Bibliotheken nehmen `APP` aus der Umgebung (Standard = Staging-Datei), Gegenprobe gegen Zweige mit `APP=…` |

## 2. Zusatz (Xander 31.10.)

- **Video immer in voller Klangqualität:** beim Offline-Rendern (WebCodecs und Rückfall-Weg, beide nutzen den Offline-Ton) steht der
  CPU-Begrenzer auf Stufe 0 – auch wenn live gerade Stufe 1–3 oder „Eco“ gilt. Nach dem Rendern kommt die Live-Stufe unverändert zurück
  (`vvSwapIn` setzt `LIM.level = 0`, `vvSwapOut` stellt `LIM` wieder her). Der Klang alter Projekte ändert sich nicht (live nichts geändert).
- **Bereich [Ganzer Song] / [Auswahl]:** gibt es eine gelbe Auswahl, zeigt die Zeile „Bereich“ im Video-Blatt die Wahl als zwei Knöpfe
  (44 px hoch); vorgewählt ist [Auswahl] (bisheriges Verhalten). Ohne Auswahl bleibt der Text „ganzer Song“. Vorschau, Standbild und
  Video erstellen folgen der Wahl. In niedriger Queransicht (≤ 400 px hoch) mit Auswahl rücken die Zeilen von 4 auf 2 px Abstand, damit
  die Bedienung nicht rollt.
- **Ausklang auch bei Auswahl:** war schon so (die Auswahl endet wie ein Song-Ende, Hall/Echo klingen bis < −60 dBFS, ≤ 10 s, aus) –
  jetzt mit eigenem Nachweis (Z3).
- **Teilname klebt im Song-Bild:** der gelbe Teil-Kopf zeigt seinen Namen am linken Rand der Ansicht, solange der Teil im Bild ist –
  nie links vom Teilanfang, nie über sein Ende hinaus; Stellung „3/16“ rechts wie bisher.

## 3. Abnahme (Staging-Datei, Ausgaben in `tests/out/`, `tests/n5-v-out/`)

Rechner: 4 Kerne, Läufe zu dritt parallel; lastempfindliche Läufe allein wiederholt.

| Paket | Ergebnis | Läufe |
|---|---|---|
| VC2a-01/02/09 | bestanden | `n5-h-01` ALLE BESTANDEN |
| VC2a-03/04 | bestanden | `n5-h-03` ALLE BESTANDEN (1000 Ereignisse 19,6 KB gzip) |
| VC2a-06/07/08 | bestanden | `n5-h-06`, `n5-h-07`, `n5-h-08` ALLE BESTANDEN |
| VC2a-10 | bestanden | `n5-h-10`, `n5-h-menu` (6 Größen) ALLE BESTANDEN, `n5-h-views` 0 Daten-Ereignisse |
| VC2a-fix | bestanden | `n5-h-ab-02gate`, `-ab-08mk`, `-ab-race`, `-ab-race2`, `-ab-roll2`, `-ab-key`, `-fx-keystate`: wie im Zweig |
| VV1-01/08 | bestanden | `n5-v-abn-01`, `n5-v-a1` (16:9/9:16 1920×1080/1080×1920, 30/1, Soll 19,474 s; Rückfall webm; ohne beides grau) |
| VV1-02 | bestanden | `n5-v-a1` Ausklang 4,98 s, Ende < −55 dBFS |
| VV1-03/06 | bestanden (allein) | `n5-v-a3`: Live/Offline −14,35/−14,36 LUFS, Noten 254 = 254, Solo-Spuren ok, Projekt/Knoten/Werte gleich |
| VV1-04 | bestanden | `n5-v-abn-04` Laufband Takt 2/6 auf < 1 Bild; „matrixRange“ s. Abweichungen |
| VV1-07 | bestanden | `n5-v-abn-07` P1 P2 P3 L1 L2 926×428: 0 Knöpfe < 44, nichts abgeschnitten, Bedienung rollt nicht |
| VV1-fix | bestanden | `n5-v-abn-10b`, `-10c`, `-10d`, `n5-v-fx-keys`, `n5-v-qm-bank`, `-bank2`, `-metro` wie im Zweig |
| VV2-01/02/04/05 | bestanden | `n5-v-vv2-01` (alle Bilder erkannt), `-vv2-02` (alle Schritte), `-vv2-04z`, `n5-v-qa2-cam` (0 über 5 %), `-vv2-05` |
| VV2-03 | bestanden (s. Abweichungen) | `n5-v-vv2-03` 9:16: Schnitte, Hash 2× `44b13e35`, Kamera gleich in 1967 Bildern; Blenden fertig nach 6–8 Bildern |
| VV2-fix | bestanden | `n5-v-qa2-stimme`, `-q2-save`, `-q2-save2`, `-qa2-cuts2`, `-q2-auto`, `-q2-auto2`, `-vv2fix`, `-q2-edit`, `-q2-ui2`, `-vv2fix-undo`, `-q2-toast` wie im Zweig |
| VV3-01/01b/02 | bestanden | `vv3/vv3-01`, `-01b`, `-02` (Video: 550 Bilder, 128 Noten, 0 Abweichungen) |
| VV3-03 | bestanden | `vv3/vv3-03`: Spur-Bild ändert nichts, 3-min-Song 9:16 2,39 × schneller als Echtzeit |
| Zusatz Z1–Z4 | bestanden | `n5-v-vs-zusatz`: Z1 Render mit Stufe 0, danach live wieder 3 · Z2 Wahl ohne/mit Auswahl, 2 Knöpfe 98×44 / 72×44, Tipp [Ganzer Song] → Takte 1–8 · Z3 Auswahl 1–4: Ausklang 5,64 s, Ende −58,7 dB · Z4 Teilname bei Takt 2…16,5 immer im Bild (hoch und quer). Gegenprobe mit der Datei davor: Z1, Z2, Z4 scheitern, Z3 besteht (war schon so). |
| Smoke | ohne Fehler | `vv3/smoke` |

### Abweichungen
- **VV2-03 Blende „monoton“** (Schnitt Takt 9 auf Spur 2): Abweichung 9,1 → 10,6 im 5. Bild. Die Einzelbilder (Bild 515–522) zeigen
  eine saubere Überblendung ohne Flackern; im ausgeblendeten Spur-Bild schlägt währenddessen eine Note an (VV3 umrandet klingende
  Noten), das Vergleichsbild des Skripts enthält nur das neue Bild. Im Zweig n5-br-V (ohne VV3-Spur-Bild) monoton. Messartefakt aus
  VV2-Test × VV3-Bild, kein Fehler.
- **Überholte Test-Erwartung (Regel 26):** `n5-v-abn-07` las mit Auswahl den Text „gelbe Auswahl“; jetzt steht dort die Wahl
  [Ganzer Song]/[Auswahl] – das Skript liest den gewählten Knopf („Auswahl“). Es meldet „Layout-Sprung“ im Zustand „fertig“, weil es die
  Auswahl bei offenem Blatt setzt (Zeile 32 → 44 px); in der App liegt das Blatt über allem, die Auswahl ändert sich bei offenem Blatt nicht.
- Unter Last (3 Läufe parallel): `n5-v-a1` Rückfall webm 11,44 s gegen 11,26 s und `n5-v-a3` Live-Noten 253/254 – allein wiederholt
  beide bestanden (11,40 s; 254 = 254). „offlineBitEqual“ false wie im Zweig (VV1-fix Abweichungen).
- `n5-v-abn-04` „matrixRange“ Takt 4 und `n5-v-q2-save2` „Datei in frischer Seite“ (Skript gibt Text statt Objekt): wie im Zweig dokumentiert.
- `n5-v-q2-edit`, `n5-v-vv2fix` „undoEq/redoEq false“ an denselben Stellen wie mit `APP=bau/vs/n5-br-V/index.html` (Gegenprobe) – Skript-Vergleich, kein Fehler der Zusammenführung.
- `n5-v-abn-01` Rückfall webm unter Last nur 22 Bilder – wie im Zweig dokumentiert.
- VC2a-05 (Leistung) und VV1-05 (3-min-Tempo) hier nicht neu gemessen (Rechner geteilt); VV3-03 misst das Tempo mit Spur-Bild (2,39 ×).

### Fragen an Xander
- keine.

### iPhone (Xander)
- Song mit gelber Auswahl → Menü → Video: [Ganzer Song] / [Auswahl] tippen, ▶ Vorschau und Video erstellen folgen der Wahl.
- Video erstellen, während die CPU-Anzeige „CPU 2/3“ zeigt: das Video klingt voll (wie bei ruhigem Gerät).
- Song-Bild (Bild: Song) mit langem Teil: der Teilname bleibt links stehen, solange der Teil läuft.
