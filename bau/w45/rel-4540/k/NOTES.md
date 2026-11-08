# 4.54.0-Kandidat – 4.53-Kandidat + JAM3 + CHQ + BEG1 + KF12, Zusammenspiel INT54

Kandidat: `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/rel-4540/k/index.html`
(md5 `413d33112916b787e87bb7fd26eb2221`, 8 020 297 Byte, 97 514 Zeilen).
Grundlage: `…/rel-4540/k/basis53.html` = Kopie von `…/rel-4530/m3/index.html` (4.53-Kandidat, md5 `9dccd08f…`).
VERSION (`4.52.0`, wie im 4.53-Kandidaten) und CHANGES sind nicht angefasst.

Gebaut in vier Schritten mit `git merge-file -p <aktuell> <Paket-Basis> <Paket>/index.html` (Rohstände und Zwischenstände in
`…/rel-4540/k/merge/`: `raw1…raw4.html` = Ausgabe von merge-file, `step1…step4.html` = nach der Auflösung), danach die INT54-Stellen
mit `…/rel-4540/k/tools/int54.py` (aus `step4.html`, jede Ersetzung wird genau einmal getroffen, sonst bricht das Skript ab).
Die Auflösungen stehen ausdrücklich in `tools/resolve3.py` (BEG1) und `tools/resolve4.py` (KF12), jede mit Prüfung, dass ihre Seiten
genau das Erwartete enthalten.

| Schritt | Paket | Basis des Pakets | Konflikte | Ergebnis |
|---|---|---|---|---|
| 1 | JAM3 `w4530/jam3` | `w4530/basis.html` (4.52.0) | 0 | `step1.html` = `raw1.html` |
| 2 | CHQ `w4530/chq` | `w4530/basis.html` (4.52.0) | 0 | `step2.html` = `raw2.html` |
| 3 | BEG1 `w4540/beg1` | `w4540/basis.html` (4.52.0, md5 gleich) | 2 | `step3.html` |
| 4 | KF12 `w4520/kf12` | `w4520/basis.html` (4.51.0) | 1 | `step4.html` |
| INT54 | – | – | – | `index.html` (8 Zeilen mit „INT54“) |

## Konflikte → Auflösung

1. **BEG1, `openMenu` (≡ › Bedienung, Zeilen am Ende):** 4.53 hat hinter `jam2MenuRow` die Zeilen `mtxMenuRow(s6, row)` und
   `oriMenuHook(m, s6, row, goto)`, BEG1 hat dort `beg1MenuRow(s6, row)`. **Auflösung:** `jam2MenuRow` → `mtxMenuRow` → **`beg1MenuRow`** →
   `oriMenuHook`. `beg1MenuRow` steht vor `oriMenuHook` (wie `jam2MenuRow`/`mtxMenuRow`): ORI hängt „Mehr ▾“ und den eingeklappten
   Kasten ans Ende des Abschnitts; käme der Begleiter danach, stünde er hinter „Mehr ▾“. Geprüft (INT54-Test C): „Begleiter An │ Aus“
   steht vor „Mehr ▾“, nicht eingeklappt (Begleiter gehört nicht zu `ORI_RARE['Bedienung']`). Die Probe-Zusammenführung `rel-4540/p2`
   hatte die Zeile noch hinter `oriMenuHook`.
2. **BEG1, Blöcke hinter `SND1-END`:** 4.53 hat dort GEN4, INT53-RX, VOX2, MTX, ORI, VID5, INT53C; BEG1 hat dort seinen Block. **Auflösung:**
   beide, BEG1 hinter `INT53C-END` (vor `NO_SYNC`, wie im Paket). Damit umhüllt BEG1 `T.onCommit`, `T.tick` und `songRecEnd` als
   Letzter – die Hüllen rufen das Vorige unverändert. Geprüft: der BEG1-Block steht Zeichen für Zeichen wie im Paket (63 215 Zeichen).
3. **KF12, Blöcke hinter `SND1-END`:** 4.53 + BEG1 dort, KF12 hat dort KF1- und KF2-Block. **Auflösung:** beide, KF1 + KF2 hinter
   `BEG1-END`. Geprüft: KF1+KF2-Block Zeichen für Zeichen wie im Paket (45 682 Zeichen).

Alles andere kam ohne Konflikt. Nachgeprüft, wo ein Paket in der Nähe (± 25–40 Zeilen) einer 4.52/4.53-Änderung eingreift
(`tools/near.py`): JAM3 `songTick` (VOX2-Zeile daneben), `vvSwapOut`/`vvRenderAudio0` (INT53/INT53C daneben), CHQ `svLayout`/`svDraw`
(JAM3-Zeilen daneben), BEG1 `scheduleTrack` (VOX2-Zeile darunter), KF12 `liveUpdate`, `tick` (`kf1Tick`/`kf1Plan`), Guide – jeweils
eigenständige Zeilen, die Reihenfolge in der Datei ist die der Pakete. Pflicht danach: topdefs 0/0, dupkeys 0.

## Was ein Paket benutzt, das es im 4.53-Kandidaten anders gibt (INT54)

### INT54-1 · BEG1 × GEN4: Begleiter-Stil nur in seiner Taktart (1 Zeile, `beg1StOk`)

- **Befund:** BEG1 ließ einen Stil zu, wenn sein Takt **gleich viele Schläge** hat wie der des Projekts (`tsBeats(st.ts) = t1SceneBB()`).
  In 4.52 gab es außer 4/4 nur den Walzer (3/4) – mit GEN4 kommen 57 Stile, darunter 3/4 (4), 6/8 (3), 12/8 (2), 5/4, 7/8, 2/4 (3).
  6/8 und 3/4 haben beide 3 Schläge: im 3/4-Projekt waren die 6/8-Stile wählbar, im **6/8-Projekt wählte der Begleiter von selbst den
  Walzer** (3/4-Muster gegen das 6/8-Metronom und die 6/8-Clips). Gemessen im Gegenlauf (Stand `merge/step4.html`):
  3/4-Projekt → `ballade68, irish68, afro68` wählbar; 6/8-Projekt → `walzer, wiener, ballade34, jazzwalzer` wählbar, Start mit `walzer`.
- **Änderung:** `beg1StOk` vergleicht die Taktart selbst: `(st.ts || '4/4') === (tkPlain() ? '4/4' : S.ts || '4/4')` – dieselbe Regel,
  die GEN4 für seine Grundmuster nimmt (`gen4GmStyles`: `x.ts === c.ts`). Die Stil-Liste zeigt die anderen wie bisher grau mit
  „braucht 6/8-Takt“ (die Beschriftung kam schon aus BEG1). Kein neues Bedienelement.
- **Beleg:** INT54-Test A – in **jeder** Taktart (4/4, 3/4, 2/4, 5/4, 6/8, 7/8, 12/8) sind genau die Stile dieser Taktart wählbar
  (43 · 4 · 3 · 1 · 3 · 1 · 2 von 57), der erste Akkord startet die Band, Takt = 4 · 3 · 2 · 5 · 3 · 3,5 · 6 Schläge, Drums spielen, Bass
  auf beiden Einsen. BEG1s Muster lesen die GEN4-Stile mit derselben Rechnung wie GEN4 (`gr2N`, `gr2T`, `st.d`, `st.b`) – 7/8 mit
  14 Sechzehnteln, 12/8 mit 24.
- **Folge für BEG1s eigenen Test:** „Prüfung 5 – 5/4 ohne passenden Stil …“ schlägt an, weil es mit GEN4 einen 5/4-Stil gibt
  (`fuenf`); BEG1s NOTES sagten genau das voraus („Sobald GEN4 Stile für diese Taktarten bringt, erscheinen sie über gr2Order, und
  alles startet normal“). Den Weg „kein Stil“ gibt es mit GEN4 in keiner Taktart der App mehr.

### INT54-2 · CHQ × JAM3: Fenster der Chor-Gruppe rechnet mit der Zeile PERFORM (4 Zeilen in `chqSvW`, 3 in JAM3)

- **Befund:** CHQ wählt im Song das Fenster der Chor-Gruppe so, dass jede Zeile ≥ 22 px bleibt – gerechnet mit der ganzen Höhe.
  JAM3 zieht danach die Zeile PERFORM ab (18–22 px, zwei Bahnen 30 px). Mit Perform-Spur fielen die Chor-Zeilen darum unter 22 px,
  obwohl ein kleineres Fenster 22 px gehabt hätte: 926×428, 8 Chor-Spuren (GL1-Projekt) → eine Bahn 22,05 px, **zwei Bahnen 20,72 px**
  (Fenster 4). Dasselbe zeigt JAM3s Test „Befund 6“ (926×370: Zeilen 18,53 px bei offener Chor-Gruppe).
- **Änderung:**
  - JAM3: die Rechnung von `jam3SvSet` steht jetzt in `jam3SvH(avail, nR)` (ohne Nebenwirkung, dieselbe Formel); `jam3SvSet` ruft sie
    und setzt `SV.pfH/pfN/pfL` wie bisher.
  - CHQ `chqSvW`: „passt“ heißt jetzt `(T − Höhe PERFORM bei dieser Zeilenzahl) / Zeilen ≥ 22` (ohne Perform-Spur genau wie bisher
    `T / Zeilen ≥ 22`). Ist 22 px mit Perform-Spur gar nicht erreichbar (die anderen Spur-Seiten bestimmen die Zeilenzahl), bleibt das
    Fenster so groß, wie es ohne Verlust an Zeilenhöhe geht – es fällt keine Chor-Spur für nichts weg.
- **Beleg (INT54-Test B, je eine und zwei Bahnen):** 926×428 → eine Bahn 22,05 px (Fenster 4, wie vorher), zwei Bahnen **23,31 px**
  (Fenster 3, vorher 20,72 px). 926×370 → 20,03 / 18,53 px wie vorher, Fenster 3 (22 px dort nicht erreichbar; JAM3s Regel „Spur-Zeilen
  ≥ 17 px“ gilt). 428×926 → kein Fenster, wie vorher. **Ohne Perform-Spur** sind Zeilenhöhe, Fenster und GL1-Scanner in allen drei Lagen
  genau wie vor INT54. GL1-Scanner 0 Befunde in allen Zuständen. Sichtbar anders nur in dieser Kombination (viele Chor-Spuren + Perform-Spur,
  quer): eine Chor-Spur weniger im Fenster, dafür hält die Gruppe CHQs zugesagte Mindesthöhe.

### Geprüft, ohne Eingriff

- **JAM3 × INT53/INT53C (Video-Weg):** `vvRenderAudio` → `int53cRender` → `vvRenderAudio0`; JAM3 lädt dort den Perform-Prozessor
  (`mixaAddModule`), `vvSwapIn/-Out` sichern und holen den Live-Zustand (`jam3VvIn/-Out`). Die Quittungen hängen sich in Reihe:
  `int53WkSync` (Synth-Engines vor dem Start) und `bmVvSync` umhüllen `startRendering` in `vvSwapIn`, JAM3 (`jam3OffNodes`, beim ersten
  Song-Schritt im Offline-Kontext) umhüllt `startRendering` und `resume` danach – jede Hülle wartet auf ihre Quittung und ruft die vorige.
  Der Fingerabdruck (`int53cHash`/`vid5Sig`) enthält `song.pf` über `projectFileObj`. JAM3s Video-Prüfungen (zwei Videos gleich, Ton
  gegen „ohne Spur“: DRUMS aus, Filter, Stottern) sind im vereinten Stand grün.
- **KF12 × SND1/GEN4 (PVA/PV_LAYOUT):** Keine Zeile aus 4.52/4.53 spricht Plätze der Worklet-Liste an (`PV_A`, feste Nummern); Locks und
  Reihen hängen am Pfad (`LKT[p]`). SND1 setzt Klangwerte nach Namen: Cutoff nur beim Tiefpass (`ftype ≤ 1`, VOKAL = 6 bleibt), sonst nur
  `SND1_AK` (res, drive, fenv, Hüllkurven, glide, uniDet). GEN4 ändert keine Klänge (Stil-Klang ist SND1). INT54-Test E: SND1-Profile
  (EBM, House, GEN4-Walzer, 6/8-Ballade, Afro 6/8) auf die drei Saiten-Klänge mit VOKAL bzw. LP24 und Ring/Rauschfarbe – nur SND1-Schlüssel
  ändern sich, keine neuen, kein NaN, VOKAL-Cutoff unberührt, KF1/KF2-Werte und Welle Saite unberührt; `PV_LAYOUT.A` 476 Plätze.
  snd1-test und gen4-test grün (Tabelle).
- **BEG1 × Video/Export (INT53C):** `beg1Sched` tut im Offline-Durchlauf nichts (`UI.vvOff`) – Video/WAV rechnen die Clips wie bisher.
  BEG1 hat keinen Vorher/Nachher-Zustand, den INT53C einsetzen müsste.
- **BEG1 × JAM2/JAM3:** BEG1-Leiste über Spur-Leiste + Träger-Zeile (quer: Seitenfeld), Perform-Leiste über der Tastatur – verschiedene
  Flächen. `songRecEnd`: JAM3 ändert den Rumpf, BEG1 umhüllt die Funktion; BEG1 nimmt die Band nur bei einem neuen Song mit (`!sr.over`).
- **KF2-Oszilloskop × ORI-Kopf-Farbe:** INT54-Test D – Kopf-Farbe „klang“ an der Oberkante mit gleichem Anteil wie im 4.53-Kandidaten
  (hochkant 0,90/0,90, quer 0,74/0,74), Kopf-Tasten an derselben Stelle, das Oszilloskop liegt unter dem Kopf, ✕ sichtbar.
- **Neue Blätter/Popups × ORI-Farbcode:** BEG1-Blatt, JAM3-Block-Menü und KF-Seiten stehen nicht in `ORI_POP`; sie bekommen den
  Bereich der Ebene darunter (Matrix/Song/Klang) – so, wie ORI es für unbekannte Popups vorsieht.
- **Guide:** 164 Einträge, keine Kennung doppelt (BEG1 `beg1`, JAM3 `jam3pf`, KF1/KF2 9 Einträge) – INT54-Test C.

## Tests

Alle Läufe nacheinander, je mit `timeout`, gegen `k/index.html` (md5 `413d3311…`) über den Läufer
`/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/rel-4540/k/run.sh` (`bash run.sh all`; einzelne
Namen gehen auch). Ausgaben: `k/out/<test>.log` und `k/out/<test>/` (Fotos, JSON), Übersicht `k/out/summary.txt` (Lauf 12:13–13:51, dazu
13:51–13:55 `jam2b`/`jam2-453`). Der Läufer kopiert vor jedem Lauf `index.html` in die Prüf-Ordner, deren `basis.html` die jeweilige
Paket-Basis ist (Kopf von `run.sh`):

| Ordner | basis.html | für |
|---|---|---|
| `t-52/x/index.html` | 4.52.0 (`w4530/basis.html`) | jam3, chq, beg1 (`../basis.html` = Paket-Basis), gl1 (wie `fz-g` in 4.53) |
| `t-53/x/index.html` | 4.53-Kandidat (`basis53.html`) | Gegenprobe jam3-53, chq-53, beg1-53 (Bildvergleiche gegen 4.53 statt 4.52) |
| `t-p/x/index.html` | `w4500/basis.html` | gen4, vox2, mixg, mtx, snd1, int53, int53p (wie `fz-p`) |
| `t-j/x/index.html` | `w4510/basis.html` | jam1, jam2, jam2b (wie `fz-j`) |
| `t-v/x/index.html` | `w4500/basis.html` | vd4 (wie `fz-v`) |
| `out/basis.html` | 4.51.0 (`w4520/basis.html`) | kf2, kf1 (`<ordner>/../basis.html` = KF12-Basis); `out/kf2/NOTES.md` = `kf12/NOTES.md` (wie im KF12-Lauf) |
| `t-kf/kf12/index.html` + `t-kf/kf2/index.html` (= `w4520/kf2`) | – | kf1 (liest `<index>/../../kf2/index.html` für die Zeilen-Herkunft) |
| `out/b53/basis.html` | 4.53-Kandidat | Gegenprobe kf1-53; kombi-53 bekommt `basis53.html` als Basis-Argument |
| `t-jx/x53/index.html` | `w4510/basis.html` | jam2-453: JAM2-Prüfung auf dem 4.53-Kandidaten selbst |
| ori / vid5 / int53c | Argument | ori gegen `rel-4530/m3/vor-ori-vid5.html`, vid5 gegen `w4500/basis.html` (wie in 4.53) |

### Ergebnisse

| Lauf | Ergebnis | 4.53 / Paket allein | Abweichung – Begründung |
|---|---|---|---|
| Pflicht topdefs | Skripte 26, Namen 6922, **doppelt 0, Syntaxfehler 0** | – | – |
| Pflicht dupkeys | **0 doppelte Schlüssel** | – | – |
| Pflicht Wörter (`tools/pflicht.py`) | „MS 2000“ 1×, „  live: true,“ 1×, Konfliktmarker 0; Korg … Genos nicht häufiger als im 4.53-Kandidaten (Elektron 3/3, Yamaha 1/1, sonst 0/0) | – | – |
| Herkunft (`tools/herkunft.py`) | **OK**: 0 Zeilen ohne Herkunft, 0 Paket-Zeilen unerwartet weg, 0 Zeilen des 4.53-Kandidaten unerwartet weg (108 fehlende hat ein Paket gegenüber seiner Basis geändert), INT54 8 Zeilen | – | ersetzt die „jede neue Zeile trägt <PAKET>“-Prüfungen der Pakete (unten) |
| Rauchtest `smoke.mjs` | Titel SYNQUENZER, **errors []** (`out/smoke.png`) | – | – |
| **int54** (`k/int54-test.mjs`, neu) | **23/23** | Gegenlauf auf `merge/step4.html` eingebaut | A, B, C, D, E siehe oben |
| jam3 | 63/67 | JAM3 allein 67/67 | 2× „Song ohne Perform-Daten pixelgleich zur Basis“ (hochkant/quer): **ORI** (Farbkante + Wo-bin-ich) – gegen 4.53 (`jam3-53`) beide grün. „Befund 6 – zwei Bahnen 926×370 … PERFORM < 30 px“: mit **CHQ** zeigt die Chor-Gruppe ein Fenster (3 statt alle Spuren), darum hat die Zeile PERFORM ihre vollen 30 px, Spur-Zeilen 18,53 px ≥ 17 (MELODIE „S4 ▾ · ⇅ fest“ lesbar) – die 25 px galten für die Lage ohne CHQ. „Befund 7 – Einhänge-Zeilen tragen JAM3“: vereinte Datei (Zeilen von CHQ, BEG1, KF12, 4.53) → Herkunft OK; JAM2_PROC_SRC 0 Nicht-ASCII, Worklet 0 |
| jam3-53 (Basis 4.53) | 65/67 | – | nur Befund 6 und 7 wie oben – **Bilder pixelgleich zum 4.53-Kandidaten** |
| chq | 50/52 | CHQ allein 52/52 | 2 Pixelvergleiche (≤ 3 Spuren / wo nichts rollt): je 856 px hochkant, 904 px quer = **ORI** (dieselben Zahlen wie gl1/jam1 im 4.53-Lauf) |
| chq-53 (Basis 4.53) | **52/52** | – | – |
| beg1 | 53/59 | BEG1 allein 59/59 | 4 Pixelvergleiche (aus / nach ✕, hochkant/quer): **ORI** – gegen 4.53 (`beg1-53`) grün. „Prüfung 5 – 5/4 ohne passenden Stil“: **GEN4** bringt den 5/4-Stil `fuenf`, der Begleiter startet (INT54-Test A, von BEG1s NOTES so angekündigt). „Jede Zeile außerhalb trägt BEG1“: vereinte Datei → Herkunft OK |
| beg1-53 (Basis 4.53) | 57/59 | – | nur Prüfung 5 und Zeilen-Herkunft wie oben |
| kf2 | **61/61** | KF12 61/61 | – |
| kf1 (`kf1-test-kf12.mjs`) | 68/73 | KF12 73/73 (3. Lauf), 71/73 | „Altes Projekt: Song-Render bit-gleich zur Basis (4.51)“ und „Körnung … wieder aus → Render wieder bit-gleich“: Hash 4.51 `2bc3c7a5` ≠ `a4c4de1d` – der Render-Weg von **4.52/4.53** ist anders (INT53: Engines quittieren vor dem Start, sonst fehlten die ersten Noten u. a.); gegen 4.53 (`kf1-53`) **beide grün, Hash gleich `a4c4de1d`**. „VERSION unverändert (4.52.0)“: Basis 4.51.0 – die Datei trägt die VERSION des 4.53-Kandidaten (nicht angefasst), gegen 4.53 grün. „Tonart mit Zeit … ≤ 1 ms“ (2,17 ms): bekannter Wackler (KF12 NOTES: freier Zufall, auch in KF1 allein 3/8), jede Stufe in der richtigen Tonart. „Jede neue Zeile als KF1 markiert“: vereinte Datei → Herkunft OK |
| kf1-53 (Basis 4.53) | 71/73 | – | nur Tonart-Wackler (2,85 ms) und Zeilen-Herkunft |
| kombi | 24/26 | KF12 26/26 | „Altes 4.51-Projekt: Song-Render bit-gleich“ (`1fe3806d` ≠ `4c2d9379`): Render-Weg 4.52/4.53, gegen 4.53 (`kombi-53`) grün, Hash gleich. „Quelltext: jede neue Zeile aus KF1/KF2/KF12“: vereinte Datei → Herkunft OK |
| kombi-53 (Basis 4.53) | 25/26 | – | nur Zeilen-Herkunft; altes Projekt rendert bit-gleich zum 4.53-Kandidaten, neu gespeichert gleich der Basis |
| gen4 | **72/72** („alles grün“) | 4.53 72/72 | – |
| vox2 | **111/111** | 4.53 111 | – |
| mixg (Kopie `rel-4530/fix/tests`) | **48/48** | 4.53 48/48 | – |
| mtx | **92/92** („alles grün“) | 4.53 92 | – |
| snd1 (Kopie `rel-4530/fix/tests`) | **67/67** | 4.53 67/67 | – |
| jam1 | 50/52 | 4.53 50/52 | 2 Pixelvergleiche **wie im 4.53-Lauf, gleiche Zahlen** (Matrix 856/904, LAUF 2020/3366, SCHRITTE 2758/4821): ORI |
| jam2 | 101/105 | 4.53 103/105 | 2 Pixelvergleiche wie 4.53 (gleiche Bytes 311264/311248, 273903/273923): ORI. „P3 Rückung: eine Spur mit ⇅ fest rückt nicht mit“: **JAM3** will das Gegenteil (feste Spuren rücken mit, „alles außer Drums“), so in JAM3s NOTES. „Stottern live … Korrelation > 0,9999“ (0,99428): Last-Wackler – 2. Lauf `jam2b` **1,00000** (102/105, nur ORI + P3), und derselbe Test auf dem **4.53-Kandidaten** (`jam2-453`) schlug im selben Zeitraum ebenso an (0,99639) |
| jam2b (2. Lauf) | 102/105 | – | nur 2× ORI + P3 (JAM3) |
| jam2-453 (4.53 selbst) | 102/105 | – | 2× ORI + Stottern-live-Wackler (0,99639) – P3 dort grün (ohne JAM3) |
| gl1 | 44/45 | 4.53 44/45 | 1 Pixelvergleich, gleiche Zahlen wie 4.53 (856/904): ORI |
| vd4 | 30/31 | 4.53 30/31 | VD4-02 Matrix-Bild wie 4.48.1: ORI (wie im 4.53-Lauf) |
| ori (gegen `vor-ori-vid5.html`) | 86/87 | 4.53 87/87 | „Guide: alle 164 Sprünge grün“ – 2 neue Einträge ohne Rahmen: `kf1trp` (**KF1**: braucht eine MS-2000-/Bit-Mask-Spur, sonst Hinweis „Erst eine Spur auf MS 2000 oder Bit Mask stellen …“) und `jam3pf` (**JAM3**: die Zeile PERFORM gibt es erst mit Daten, sonst Hinweis „Noch keine Perform-Spur …“). Beide verhalten sich in ihrem Paket allein genau so (`probe/guide2.mjs`: KF12 und JAM3 allein, leer und mit ORI-Projekt – gleiche Ergebnisse); kein Fehler der Zusammenführung. Alle 162 alten Sprünge landen wie in der Basis („jeder Sprung der Basis landet auf derselben Stelle“ grün). Vorschlag unten |
| vid5 | **56/56** | 4.53 56/56 | – |
| int53 | **9/9** | 4.53 9/9 | – |
| int53p | **52/52** | 4.53 52/52 | – |
| int53c | **56/56** | 4.53 56/56 | – |

Erkundungsläufe vor dem Endstand (nicht maßgeblich, aufbewahrt): `k/out-r1/` (Stand `step4` ohne INT54: jam3 63/67, chq 50/52, beg1 52/59,
kf2 61/61, kf1 64/68 + Abbruch wegen fehlender `../kf2/index.html` – daraufhin `t-kf/` im Läufer), `k/out-r2/` (INT54 erste Fassung: das
Fenster schrumpfte bei 926×370 auf 1 Spur, ohne Höhe zu gewinnen → zweite Fassung mit „keine Spur weniger für nichts“). In `out-r1` hatte
beg1 einmal „Aufnahme = Live 183 zu 185 Töne“ – unter Last eines parallelen Fremd-Tests (zwei Hi-Hat-Schläge im Live-Teil zu spät/verworfen);
im Endlauf grün (wie BEG1 allein).

Fotos: `out/int54/` (A hochkant; B eine/zwei Bahnen in 926×370, 926×428, 428×926 – neu und vor INT54; D Klang-Editor mit Oszilloskop
neu ↔ 4.53), dazu die Fotos der Paket-Tests in `out/<test>/fotos` bzw. `t-52/x/fotos` (chq).

## Offen / Vorschläge (nichts davon gebaut – sichtbar anders, darum nur Vorschlag im Funk)

- **Guide-Sprung ohne Ziel (KF1 „Arp Treppe“, JAM3 „Perform-Spur“):** Fehlt die Voraussetzung, zeigt der Sprung nur einen Hinweis und
  keinen Rahmen. Vorschlag: den Rahmen dorthin setzen, wo es entsteht (≡ › Klang-Editor › Klangerzeugung bzw. die Zeile MELODIE / ● SONG).
- **Menü-Zeile „Begleiter An │ Aus“ quer 38 px hoch (Tasten 32 px):** genau wie die vorhandenen An │ Aus-Zeilen („Perform-Leiste“,
  „Lauflichter“) – Menü-Maß der App, nicht von BEG1. Hochkant 46 px (Tasten 44 × 40). Wenn Xander quer ≥ 44 px will, wäre das eine Änderung
  aller Menü-Zeilen.
- **CHQ × JAM3 bei 926×370:** Mit 8 Chor-Spuren und Perform-Spur sind 22 px dort nicht erreichbar (die anderen Spur-Seiten bestimmen die
  Zeilenzahl); es bleibt JAM3s Untergrenze 17 px (gemessen 20,03 / 18,53 px).
- **KF2-Oszilloskop während eines Video-Exports:** Ist der Klang-Editor offen, hängt sich das Oszilloskop an den Offline-Kontext (kein
  Fehler, nur ein Analyser mehr im Render). War in KF2 allein schon so; nicht Teil dieser Zusammenführung.
- BEG1s „Offen“-Punkte (● AUTO über einen vorhandenen Song, Etikett `clip` statt `beg` beim Akkordwechsel, Metronom-Klick nach SCHLUSS),
  JAM3s und CHQs „Offen“-Punkte gelten unverändert. Echt-iPhone (Safari) nicht angefasst; gemessen in Chromium (Playwright).

## Dateien

- Kandidat `k/index.html`; Grundlage `k/basis53.html`; Zwischenstände `k/merge/raw1…4.html`, `k/merge/step1…4.html`
- Werkzeuge `k/tools/resolve3.py`, `k/tools/resolve4.py` (Konflikte), `k/tools/int54.py` (INT54 aus `step4.html`), `k/tools/near.py`
  (Paket-Änderungen in der Nähe anderer), `k/tools/herkunft.py`, `k/tools/pflicht.py`; Diffs `k/diffs/*.diff`
- Tests `k/int54-test.mjs` (neu), Läufer `k/run.sh`, Sonden `k/probe/styles.mjs` (Stile je Taktart), `k/probe/guide2.mjs` (Guide-Sprünge)
