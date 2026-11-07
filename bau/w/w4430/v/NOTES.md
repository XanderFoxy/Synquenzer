# GP-VIDEO – Gegenprüfung Klavier (VK3) und Mäusekino (VK2), Basis 4.42.0

## Für Xander

- Klavier zeichnet jetzt etwa dreimal so schnell: Die Tastatur wurde bisher in jedem Bild neu gebaut, obwohl sie vorgezeichnet sein sollte. Das macht die Vorschau auf dem iPhone ruhiger und das Video schneller fertig.
- Klavier zeigt jetzt auch ganz hohe Töne (bis zur obersten MIDI-Note). In 7/8 und anderen ungeraden Takten stehen die feinen Schlaglinien jetzt genau auf dem Taktstrich.
- Mäusekino zeigt bei Clips mit ◆-Klangzustand (durch den Auto-Klanganker jetzt fast überall) wieder den echten Filterwert, auch wenn eine Note einen Lock hat. Bei Bit-Mask-Spuren zeigt es keine erfundene Filterkurve mehr.
- Im Menü „…“ eines markierten Bereichs war [Mäusekino] abgeschnitten („Mäusekin“). Jetzt ist jede Taste so breit wie ihr Wort, alle mindestens 44 px. Das Teil-Blatt sieht aus wie vorher.

## Technische Änderungen (nur `v/index.html`, 27 Diff-Zeilen, alle markiert mit VK3-GP / VK2-GP)

**VK3 (Klavier)**

1. **`vvkLayout`: Cache-Fehler.** Der Cache-Blick `let c = VVK.lay.get(g); if (c && c.key === key) return c;` stand hinter dem `//`-Kommentar der `key`-Zeile. Das ist dasselbe Muster wie der G10a-5-Fund.
   - Folgen: Jedes Bild baute die ganze Tastatur in einer **neuen Leinwand** von etwa 1920×300 px neu. Außerdem wurde `c` zu einer globalen Variable (`window.c`).
   - Gemessen mit `gp-lay.mjs`, je 60 Bilder:

     | Format | vorher | nachher |
     |---|---|---|
     | 16:9 | 9,9 ms, 1 Leinwand/Bild | 2,8 ms, 0 Leinwände |
     | 9:16 | 6,2 ms, 1 Leinwand/Bild | 2,1 ms, 0 Leinwände |

   - Das globale `c` ist weg.
   - Auf iOS Safari war das zusätzlich ein Speicher-Risiko: Safari begrenzt den Leinwand-Speicher, und Leinwände werden dort nur spät freigegeben.
2. **`vvkRange`:** Die Tastatur reicht jetzt bis MIDI 127, vorher endete sie bei 119 (H8).
   - Vorher fehlten Noten ab 120 einfach. Getestet mit Note 124: Sie leuchtet jetzt.
   - Die Regel „ganze Oktaven“ gilt weiter bis C9. Darüber endet die Tastatur bei G9 (MIDI-Ende).
3. **Schlaglinien in `vvkDraw`:** Sie werden jetzt ab jedem Taktstrich gezählt (`barBeat`).
   - Vorher lagen sie auf ganzen Song-Schlägen. In 7/8 waren sie deshalb in jedem zweiten Takt einen halben Schlag versetzt.
   - In 4/4 und 3/4 ändert sich nichts. Gemessen wurden die Pixelzeilen vorher und nachher.

**VK2 (Mäusekino)**

4. **Noten-Locks unter einem Zustand (`vk2Lk`, neu, 10 Zeilen).**
   - Unter einem ◆-Zustand rechnete `vk2Syn` mit `vv3VaState0` bzw. `vv3MkState0` ohne die Locks der klingenden Note. Im Worklet gilt aber „Lock schlägt Reihe schlägt Grundwert“.
   - Seit AK1 tragen die meisten Clips einen Zustand. Damit ist das der übliche Weg.
   - Beispiel: Ein Lock auf Cutoff (56 Hz) zeigte 1345 Hz. Jetzt zeigt er 108 Hz, wie erwartet (`gp-ak1.mjs`).
   - MK wird genauso behandelt wie in `vv3MkState`, über `mk.t.0.*` und `SQMK.mkPathSet`.
5. **Bit Mask (`engine 'bm'`):** Die Engine hat eigene Filter und Hüllkurven. Das Mäusekino zeigte trotzdem VA-Cutoff, -Resonanz und -Hüllkurven aus `p`.
   - Jetzt gibt es für BM keine Filterkurve und keine Hüllkurve mehr.
   - Das Lauflicht zeigt die gehaltenen Noten mit voller Helligkeit.
6. **Regie-Zeile, Bereich-Menü (`openRangeMore`, Klasse `vvdb`):**
   - Das Menü ist 315 px breit. Fünf gleich breite Tasten waren je 50 px. Dabei wurde „Mäusekino“ um 11 px abgeschnitten und „Tastatur“ um 1 px.
   - Neu: Nur dort gilt `flex:1 1 auto; min-width:44px`. Gemessen: Spur 44,3 · Tastatur 51,1 · Fokus 50,5 · Klavier 44 · Mäusekino 61,5 px, alle 44 px hoch, nichts abgeschnitten.
   - Teil-Blatt (hoch und quer) und erste Zeile sind unverändert.
   - Zusätzlich heißt das Label `Mäuse&shy;kino` (mit `white-space:normal` nur für diese Taste). Wird es noch enger, bricht das Wort, statt abgeschnitten zu werden. Das `aria-label` bleibt „Video hier: Mäusekino“.

Nicht angefasst: VERSION, CHANGES, Auto-Regie-Logik, Aussehen der Bilder.

## Geprüft ohne Befund

**Klavier**
- Noten kommen aus dem Durchlauf-Log. Die Transposition +2 ist sichtbar (Akkorde D–F♯–A ab Takt 11).
- Anschlag-Farben und Drum-Leiste stimmen.
- Getestete Fälle: leerer Song, ohne Song, nur Drums, Tempo 60 und 200, 3/4 und 7/8. Taktlinien, `TAKT n` und der Kopf stimmen.
- 9:16 geht.
- Deterministisch:
  - Echtes Video 9:16, Takt 3–10 (App → Klavier → App): 0 von 595 Bildern verschieden.
  - 16:9, Takt 3–7: 0 von 406.

**Mäusekino**
- Morph: Ist-Cutoff = Formel. FM6 log: 4000/2669/1095/450/300 Hz. MK linear: 4605/786/134 Hz.
- AK1-Zustände per echter Regler-Geste (`setP`, `mkSetP` → `ak1End`) landen im Clip, ohne `x`.
  - Im Video gleiten sie „flow“ einen Schlag vor dem Taktstrich.
  - Das Mäusekino zeigt sie mit derselben Dauer und Kurve, `kv1RunV` = Anzeige an 7 Zeitpunkten, Text z. B. „CUTOFF 2,6 kHz → 350 Hz · 50 % · 1,0 Schläge“.
- Alle Werte außer dem Pegel sind bei zwei Renders gleich. Der Pegel schwankt schon in der Basis.
- Getestete Engines: VA, WT, FM6, MK, BM und Perkussion. Dazu STIMME- und Drum-Zeilen. Keine NaN-Werte, keine Fehler.

**Allgemein**
- Live-Vorschau beider Ansichten ohne Fehler.
- Auto-Regie maßvoll: In einem 32-Takt-Song mit 8 Melodie-Teilen ist Klavier 12 von 32 Takten zu sehen, immer abwechselnd mit App. Den Anfang zeigt es nie.

## Tests (Headless-Chromium, file://)

**Pflicht-Prüfungen**
- `topdefs`: Skripte 26, doppelt 0, Syntaxfehler 0. Es gibt 4952 Namen, einer mehr als die Basis (`vk2Lk`).
- `smoke`: errors [] → `v/smoke.png`.
- Markenwörter 0. `MS 2000` = 1, `^  live: true,` = 1.

**Tests der Bauer, auf die neue Kopie angewendet**
- `vk3-test.mjs full`: **ALLE OK**, 0 Seitenfehler. Klavier-Zeichenzeit je Bild:

  | Format | vorher | nachher |
  |---|---|---|
  | 1920×1080 | 11,7 ms | 3,0 ms |
  | 1080×1920 | 6,0 ms | 1,8 ms |

  Ausgabe in `v/t3neu/`, Basis zum Vergleich in `v/t3base/`.
- `vk2-test.mjs`: Regie, Formel FM6/MK, Akzent, Determinismus (Fahrten, Werte, Bilder ohne Meter gleich), echtes Video 275 Bilder H.264 + Opus, Live: alles wie erwartet, errs []. Ausgabe in `v/t2neu/`.
- `vk3-det.mjs`: 0/595 (9:16) und 0/406 (16:9) Bilder verschieden.
- `vk3-zeit.mjs`: Der Rechner war stark ausgelastet (Last 6–8). 16:9 Auto, Median: Basis 9,0 s, neu 6,6 s. Song ohne Klavier ist gleich (Rauschen).

**Eigene Skripte in `v/tests/`** (Aufruf: `node <skript> <index.html> <out-dir> <tag>`)
- `gp-lay.mjs`: Leinwände je Bild und globales `c`.
- `gp-row.mjs`: Regie-Zeile hoch und quer, Teil-Blatt und Bereich-Menü, Maße und Abschneiden. Bilder: `v/gp/row-*.png`.
- `gp-edge.mjs`: Grenzfälle. Bilder: `v/gp/e2-*.png`.
- `gp-ak1.mjs`: AK1, Locks, Live, Determinismus. Bilder: `v/gp/a2-*`.
- `gp-eng.mjs`: Engines. Bilder: `v/gp/g2-eng-*.png`.
- `gp-auto.mjs`: Auto-Regie-Anteil.

## Hinweise (nicht behoben, außerhalb VK2/VK3 bzw. nur Randfall)

- **G10j, außerhalb des Auftrags:** In Zeile ~63402 (`g6Arm`) steht `if (G6.sheet) g6SheetPaint();` ebenfalls im Kommentar `// G10j …`. Das ist dasselbe Muster.
  - Folge: Das Chor-Blatt malt sich nach „Selbst singen“ vermutlich nicht neu.
  - Das gehört dem G10j/G6-Bereich und sollte dort geprüft werden.
- **`vvRenderAudio0`:** Die VK3-Zeile `if (!r.nt) Object.assign(…)` ist seit der VK2-Korrektur derselben Zeile wirkungslos, aber harmlos. Sie kann beim nächsten Aufräumen weg.
- **Mäusekino live:** Ändert man den Grundklang während einer laufenden ▶ Vorschau, zeigt die Zeile bis zum nächsten Zustandswechsel den Wert vom Vorschau-Start.
  - Der Grund: `r.b` der ▶-Fahrt.
  - Bei geöffnetem Video-Blatt kommt man an die Regler kaum heran. Das betrifft nur die Vorschau, nicht das Video.
- **Klavier-Vorschau ohne Durchlauf:** Sie zeigt die Song-Noten. Arp-Noten erscheinen erst im Video. So ist es dokumentiert, kein Fehler.
