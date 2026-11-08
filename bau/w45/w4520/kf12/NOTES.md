# KF12 – Basis 4.51.0 + KF1 + KF2 vereint

Datei: `…/w4520/kf12/index.html` (nach der Prüfung md5 `3b22ace6b205294d17edaed53515971f`, 7 380 952 Byte; vor der Prüfung
`04870eff7a7c6b2a3c87f700ff8b2a98`, 7 378 864 Byte, aufbewahrt als `kf12/pruef1/index-vor-pruefung.html`). Gebaut aus
`git merge-file --diff3 -p kf1/index.html basis.html kf2/index.html` (10 Konflikte), jeder Konflikt von Hand vereint mit
`…/w4520/kf12tools/resolve.py` (jede Auflösung ausdrücklich, mit Prüfungen). Roh-Ergebnisse: `…/w4520/kf12tools/merge-raw.html`,
`…/w4520/kf12tools/merge-diff3.html`. VERSION (4.51.0) und CHANGES nicht angefasst.

## Für Xander

- Alles aus beiden Paketen ist jetzt in einer Fassung: Rauschfarben, Ring, Körnung, „Anschl. ±“, S&H in der Tonart, Arp „Treppe“
  (KF1) und Saite, Vokal-Filter, Oszilloskop mit den drei Saiten-Klängen (KF2).
- Neu durch das Zusammenführen: Wenn ein Oszillator „Saite“ spielt und der Ring-Fader offen ist, klingt im Ring wirklich die Saite
  (sie zupft und klingt aus) – vorher hätte der Ring dort einen gleichbleibenden Sinus genommen.
- Alte Songs und Klänge klingen genau wie vorher und werden auch wieder Zeichen für Zeichen so gespeichert wie vorher (Prüfung,
  Regel 28); nichts an Aussehen, Größe oder Bedienung ist anders als in KF1 und KF2.

## Konflikte → wie vereint

| # | Stelle | KF1 | KF2 | vereint |
|---|---|---|---|---|
| 1 | Worklet-Grundwerte `defaults()` | `kfNc kfRm kfSh1 kfSh2: 0` | `strDmp .4, strHel .6, strAnr 0` | beide Zeilen (KF1, dann KF2) |
| 2 | `PVA` (Platz-Liste im Worklet) | `kfNc kfRm` nach `fmx.trans` (Stimmen-Teil, Plätze 270/271, `PV_A` 270 → 272) + `kfSh1 kfSh2` hinten | `strDmp strHel strAnr` hinten | Basis + `kfNc kfRm` nach `fmx.trans` + hinten `kfSh1 kfSh2 strDmp strHel strAnr` (476 Plätze); Skript prüft, dass beide Seiten genau das waren |
| 3 | `Voice`-Konstruktor | `this.kfN = Float64Array(20); this.kfRL = 0` | `this.kfV = Float64Array(32)` | beide (eigene Felder, kein Namenskonflikt) |
| 4 | SQStore `AN` / `AN_DEF` | Bereiche `kfNc [0,3,1] kfRm [0,1] kfSh1/2 [0,1,1]`, `AN_DEF` + 4 neutrale Werte | Kommentar an `};` (die Bereiche `o?w 0…4`, `ftype 0…6` liegen außerhalb des Konflikts und kamen automatisch) | KF1-Zeile + KF2-Kommentarzeile + KF1-`AN_DEF` (keine doppelte `const`) |
| 5 | `kf1Pd()` / `WAVE_NAME` / `FTYPE_LBL` | `kf1Pd();` davor | `+ 'Saite'` (SVG-Symbol), `+ 'VOKAL'` | `kf1Pd();` + KF2s zwei Listen (nicht doppelt deklariert) |
| 6 | `PV_LAYOUT` (`/*PVL{*/…`) | A wie PVA (KF1) | A wie PVA (KF2) | JSON neu: `A` = vereinte PVA (476), `M` unverändert (92); Skript prüft `A === PVA` |
| 7 | `lktBuild` `VA_S/VA_R/VA_B` | `VA_R + kfSh1 kfSh2`, `VA_B + kfRm` | `VA_R + strDmp strHel strAnr` | `VA_R` mit beiden (Reihen wie LFO), `VA_B` mit `kfRm` |
| 8 | Ende von `pageFilter` | `kf1PageFilter(pg, i)` (Regler „Anschl. ±“) | `kf2FiltPage(pg, i)` (Typ VOKAL ↔ andere baut die Seite neu) | erst KF1 (hängt den Regler an), dann KF2 (Refresher; der Neubau ruft `pageFilter` und damit wieder beide) |
| 9 | Guide `ui1Entries` | `kf1Guide(UI1.ents)` | `kf2Guide(UI1.ents)` | beide; Einträge `kf1nc … kf1trp` und `kf2saite kf2vokal kf2scope` – keine gleiche Kennung |
| 10 | Hauptblöcke nach `SND1-END` | Block KF1 (Pd, Seiten, Körnung, Tonart, Guide, Test-API `kf1`) | Block KF2 (Saite-Seite, Vokal, Oszilloskop, `KF2_SND`, Test-API `kf2`) | beide hintereinander; topdefs: 0 doppelte Namen |

Alle übrigen Änderungen beider Pakete kamen ohne Konflikt; geprüft: jede Zeile, die KF1 oder KF2 gegenüber der Basis hinzufügt, steht
in KF12 (außer den drei vereinten Zeilen PVA / PV_LAYOUT / VA_R und KF1s `};`, das KF2s kommentiertes `};` ersetzt), und jede neue
Zeile in KF12 kommt wörtlich aus KF1 oder KF2 oder ist als KF12 markiert (16 Zeilen; mit der Prüfung 27).

### Plätze (PVA / pv-layout / Speicherform)

- Gespeichert werden Locks, Reihen und Klang-Locks mit dem **Pfad** (`note.lk.v`, `clip.ln[].p`, `clip.kl`), nicht mit der Platz-Nummer;
  die Nummern (`LKT[p].wi`) entstehen beim Start aus `PV_LAYOUT` und gehen nur an das Worklet (dieselbe Liste `PVA`). Alte Projekte
  und Werksklänge hängen also an keinem Platz.
- Doppelt belegt waren die Plätze hinten: KF1 `kfSh1 kfSh2` = 471/472 (nach KF1s Einschub), KF2 `strDmp strHel strAnr` = 469–471 in KF2
  allein. Vereint: KF1 behält 270/271 (Stimmen-Werte, `PV_A` 272) und 471/472; **KF2 rückt auf 473–475**. Stellen, die die Position
  benutzen: `PV_LAYOUT.A` (neu geschrieben), `KF_UI` im Worklet (`PVA.indexOf('o?uni')`, unverändert gültig), `LKT.strDmp.wi` (aus der
  Liste) – keine feste Platz-Zahl im Code (gesucht nach 270…273 und 469…473 in beiden Diffs und beiden Tests). kf2-test prüft „die letzten drei
  Plätze = strDmp strHel strAnr“ → darum KF2 hinter KF1 (OK, Reihe „Saite Dämpfung“ auf Platz 473 wirkt im Worklet).
- Neue Werte nur angehängt bzw. im Stimmen-Teil eingefügt wie von KF1 geprüft; `M` (Platte) unverändert.

## Zusammenspiel geprüft (Stellen ohne Konflikt)

- **Ring × Saite (KF12, einzige inhaltliche Ergänzung):** KF1s `kf1Osc`/`kf1Wave` kennen nur Welle 0…3; Welle 4 (Saite) fiel dort in den
  Sinus-Zweig – der Ring hätte mit einer Saite einen stehenden Sinus multipliziert. Jetzt: zwei markierte Zeilen in `kf1Ring` und der
  Block `KF12-WK-BEGIN … END` (`kf12Str`): ist Osz 1 bzw. Osz 2 eine Saite, nimmt der Ring die Abtastwerte dieser Saite aus diesem Block
  (Zwischenspeicher `ln.c` der mittleren Unison-Stimme); ist der Saiten-Oszillator stumm (Anteil 0, `renderOsc` übersprungen), wird
  die Saite dort mit Pegel 0 gerechnet, damit der Ring trotzdem zupft. Keine Allokation, nur ASCII; wirkt nur bei Ring > 0 und Welle 4
  (alte, KF1- und KF2-Klänge bit-gleich wie vorher). Kosten: Ring über Saite +3,6 / +3,9 % (gegen Saite ohne Ring), so viel wie Ring über Säge.
- Filter-Seite: „Anschl. ±“ (KF1) steht auch bei VOKAL (die Route Anschlag → Cutoff verschiebt dann den Vokal); Regler „Vokal“ + „Anschl. ±“
  hochkant / quer / 926 × 370 in der Seite, ohne Überlappung (Foto unten).
- OSZ-Seite (KF2 Zeile SAITE) und MIX-Seite (KF1 Ring, Rausch-Farbe) sind verschiedene Unterseiten; beide mit dem Kombi-Klang in der Seite.
- Körnung (KF1, Spur-Einschub) liegt vor dem Ausgang `post`, den KF2s Oszilloskop abgreift – das Bild zeigt den gekörnten Klang.
- KF2s `kf2Msg` liest auch KF1s Tonart-Nachrichten `{kfKey, kfT}` (findet keine Welle 4, nichts passiert).
- „Was ist anders?“: KF1 zählt `kfNc kfRm` (OSZ) und `kfSh1/2` (LFO); KF2 hat dort nichts eingetragen (unverändert, siehe Offen).

## Tests (nacheinander, je mit `timeout`)

Stand **vor der Prüfung** – die Läufe danach (kf1 71/73 mit den zwei bekannten Wacklern, kf2 61/61, kombi 26/26) stehen unter „Prüfung“.

| Prüfung | Aufruf / Ausgabe | Ergebnis |
|---|---|---|
| topdefs | `NODE_PATH=… node …/rel-4271/tools/topdefs.cjs kf12/index.html` | Skripte 26, Namen 6269, **doppelt 0, Syntaxfehler 0** |
| dupkeys | `… tools2/dupkeys.cjs` | **0 doppelte Schlüssel** |
| Rauchtest | `node …/dirigent-test/smoke.mjs kf12/index.html kf12/smoke.png` | **errors []** |
| Markenwörter / Pflicht-Zeichen | Korg … Genos (+ Kompakt, Moog, Roland aus kf1-test) | keine Zählung gestiegen; „MS 2000“ 1×, „  live: true,“ 1×; Worklet nur ASCII; VERSION 4.51.0 |
| kf1-test Lauf 1 | `out/kf1/test-lauf.txt` (Basis über `out/basis.html` → `../basis.html`) | **70/73** – 3 siehe unten |
| kf1-test Lauf 2 | `out/kf1b/test-lauf.txt` | **71/73** – CPU jetzt OK (Ring +4,1 %, alles +6,6 %); 2 siehe unten |
| kf2-test | `out/kf2/test-lauf.txt` | **58/61** – 3 siehe unten |
| kombi.mjs | `node kf12/kombi.mjs kf12/index.html kf12/out/kombi` → `out/kombi-lauf.txt` | **19/19** |
| Probe S&H-Zeit | `kf12tools/probe-sh.mjs 8 kf1 kf12` → `out/probe-sh.txt` | KF1 allein 5/8, KF12 6/8 mit Grenze ≤ 1 ms; alle Stufen in der Tonart |
| Probe CPU | `kf12tools/probe-cpu.mjs 11 basis kf1 kf12` → `out/probe-cpu.txt` (2 Läufe) | Ring über neutral: KF1 +3,4 / +4,4 %, KF12 +3,2 / +2,9 % |

### Die nicht bestandenen Einzel-Prüfungen – nachgeprüft, keine kommt vom Zusammenführen

| Test | Prüfung | Ursache | Nachweis |
|---|---|---|---|
| kf1 | „Eigener Block … jede neue Zeile außerhalb ist als KF1 markiert“ (beide Läufe) | die Zeilen von KF2 tragen die Marke KF2 (z. B. `strDmp: .4 …  // KF2`) – in einer vereinten Datei zwangsläufig | kombi: jede neue Zeile kommt wörtlich aus KF1 oder KF2 oder ist KF12 (16 Zeilen) – OK |
| kf1 | „Tonart mit Zeit … Wechsel genau bei 2,0 s (≤ 1 ms)“ (1,85 / 1,58 ms) | wackelt auch in KF1 allein: der Test nutzt den freien Zufall des Worklets (S&H nicht fest), die Grenze wird aus Nulldurchgängen geschätzt | `probe-sh.mjs`: KF1 allein 3 von 8 Läufen > 1 ms (1,32 … 1,62), KF12 2 von 8; in allen Läufen jede Stufe vor 2,0 s in C-Dur, danach in Fis-Dur |
| kf1 | CPU „jede Funktion ≤ +5 %“ – nur Lauf 1 (Ring +6,6 %) | Last-Streuung (4 Kerne, andere Tests) | Lauf 2: Ring +4,1 %, alles +6,6 % (≤ 8) – OK; Probe im selben Prozess: Ring kostet in KF12 so viel wie in KF1 (s. o.) |
| kf2 | „Gespeicherte Form alter Klänge byte-gleich (normalizeSound) und Nachricht ans Worklet byte-gleich“ | KF1 legt in jedem VA/FM-Klang die vier neutralen Werte `kfNc kfRm kfSh1 kfSh2 = 0` an (wie der Bestand `fmAmp fmBright …` über `AN_DEF`; von KF1s Test verlangt: altes Projekt lädt mit `[0,0,0,0]`) | kombi: alle 86 alten Werksklänge – Form und Worklet-Nachricht gleich der Basis bis auf genau diese vier Schlüssel; Klang bit-gleich (kf2-test selbst: 81 + 7 Werksklänge bit-gleich, Demo-Song gleich) |
| kf2 | „CPU alte Klänge … gleiche Nachrichten an den Worklet“ | dieselben vier Schlüssel in der Nachricht | im selben Ergebnis: gleicher Ton (Energie gleich), CPU +2,8 % (≤ 5) |
| kf2 | „Prüfer 2: CPU schlimmster Fall … NOTES nennt …“ | der Test liest `NOTES.md` im Ausgabe-Ordner (`out/kf2/`), dort liegt keine | alle Messwerte unter den Grenzen: Dämpfung 20 % +18,5 % (≤ 25), Dämpfung 0 % +16 % (≤ 25), Unison 7 +50,7 % (≤ 60), Unison 7 + Dämpfung 0 % +52,4 % (≤ 80), Vibrato +20,4 % (≤ 35); diese NOTES nennen Dämpfung 0 %, Unison 7 und Vibrato |

Alle anderen Prüfungen beider Tests sind grün, u. a.: Lock-Tabelle ohne fehlende Plätze (KF1 `kfNc` n / `kfRm` b / `kfSh1/2` r; KF2
pv-layout = Worklet-Liste, Saiten-Reihen Platz 473–475), alle Werksklänge bit-gleich zur Basis, altes Projekt lädt neutral und rendert
bit-gleich, Körnung an/aus, Rauschfarben (−0,1 / −3,1 / −6,0 / +2,8 dB je Oktave), Ringmod, S&H in der Tonart (C-Dur, e-Moll, Takt,
Song live), Arp Treppe (Platte, BM, live, Clip), Saite gestimmt (0 ct A2…A5), Abklingzeit, Vokal-Formanten (a 738/1078 Hz, i 270/2297 Hz),
Oszilloskop (richtige Spur, ≤ 1 ms je Bild, aus = 0 Kosten), drei Saiten-Klänge, Touch hochkant/quer (je ein ↶-Schritt, ✕ sichtbar,
Regler ≥ 44 px, Mixer-Fader 53,3 / 47 / 46,5 / 44 px), 926 × 370, Guide (alle 9 Einträge), Speichern/Laden, Morph, MIDI, SND1, keine Konsolenfehler.

### kombi.mjs (19/19 vor der Prüfung; jetzt 26/26, siehe „Prüfung“)

- Node (Worklet von KF12): Kombi-Klang Saite + VOKAL „a“ + Rauschen rosa + Ring 60 % – kein NaN/Inf, keine Subnormalen, −18,7 dB RMS,
  Spitze 0,75; jede der vier Funktionen weg → anderer Klang.
- Node (KF12-Ergänzung): Ring mit Saite auf Osz 1 (Anteil 0): −35,6 dB beim Anzupfen → ausgeklungen; Saite auf Osz 2: −34,2 dB →
  ausgeklungen; Gegenprobe Sinus × Sinus bleibt stehen (−23,5 / −23,7 dB). Saite hörbar + Ring: anders als ohne Ring.
- Node: 7 Patches bit-gleich – alte Klänge wie in der Basis, KF1-Klänge (Ring + braun, Ring + Sync) wie in KF1, KF2-Klänge (Saite
  Unison 3, VOKAL i, Saite auf Osz 2 mit Sync) wie in KF2.
- Quelltext: neue Zeilen nur aus KF1 / KF2 / KF12; PVA = pv-layout, 476 Plätze, keine doppelt, `PV_A` 272, hinten
  `kfSh1 kfSh2 strDmp strHel strAnr`; beide Worklet-Erweiterungen eingehängt.
- Browser: Kombi-Klang durch das App-Worklet −18,1 dB RMS, Spitze 1,09 (Rohpegel des Kerns vor der Spur-Kette – derselbe Akkord mit LP12
  statt VOKAL 1,13, ohne Ring 0,93; Werksklang „Saite hell“ 0,99); jede Funktion wirkt.
- Projekt mit Kombi-Klang + Körnung 6 Bit · 1/4 (Song-Render der ganzen Spur-Kette): −22,0 dB, Spitze 0,54, kein NaN; Körnung aus → anderer Render.
- Speichern/Laden: Datei Zeichen für Zeichen gleich (13 136 Zeichen; nach der Prüfung 12 964 – die zwei S&H-Nullen fallen weg), Klang gleich,
  Song-Render nach dem Laden = Hash davor (`a1475245`, auch nach der Prüfung).
- Altes 4.51-Projekt (in der Basis gebaut: Säge + Puls + Rauschen + LP24): lädt neutral, Render bit-gleich (`1fe3806d` in Basis und KF12),
  neu gespeichert gleich der Basis bis auf die vier neutralen KF1-Werte (nach der Prüfung: gleich der Basis, ohne Abzug). Demo-Song aus der Basis: die Basis rendert ihn selbst nicht
  gleich (4 Hashes), RMS −18,34 dB in beiden.
- Alte Werksklänge (86): Form + Worklet-Nachricht wie Basis bis auf die vier KF1-Schlüssel (nach der Prüfung: byte-gleich); die drei Saiten-Klänge sind da.
- Bedienung mit dem Kombi-Klang hochkant 428 × 926, quer 926 × 428, quer 926 × 370: Zeile SAITE, Ring-Fader, Rausch-Farbe, „Vokal“ +
  „Anschl. ±“, Körnung – in der Seite, ✕ sichtbar, nichts überlappt, ≥ 44 px (kleinstes 53 px), kein waagerechtes Rollen; keine Konsolenfehler.
- Fotos: `…/w4520/kf12/out/kombi/fotos/kf12-{hochkant,quer,quer370}-{osc-o1,osc-mix,filter-ctl,fx-korn}.png`; dazu die Fotos der
  Paket-Tests in `out/kf1/fotos`, `out/kf1b/fotos`, `out/kf2/fotos`.

## Offen

- ~~KF1 legt in jedem Klang vier neutrale Werte an (Regel 28)~~ – in der Prüfung behoben (KF1-Werte nur ≠ 0, siehe „Prüfung“). KF1s
  eigener Test `kf1/kf1-test.mjs` (unverändert) hat in der vereinten Datei darum zwei Prüfungen, die nicht passen können („altes Projekt
  lädt `[0,0,0,0]`“ und „jede neue Zeile als KF1 markiert“); dafür läuft `kf12/kf1-test-kf12.mjs` (genau diese zwei angepasst).
- KF1s Test „Tonart mit Zeit ≤ 1 ms“ wackelt (freier Zufall, auch in KF1 allein 3/8) – der Test sollte den Zufall des Worklets fest setzen.
  Ebenso KF1s CPU-Grenze „Ring ≤ +5 %“ unter Last (4 Kerne, andere Tests): Ring kostet +4 … +5 %, der Lauf streut ±1,5 %.
- Ring mit Saite nimmt die mittlere Unison-Stimme der Saite (wie KF1 beim Ring überhaupt); mit Hard-Sync wird eine Saite auf Osz 2 nicht
  synchronisiert (wie KF2), der Ring folgt dem.
- Ohne Worklet (ECO / nativer Rückfall) weiter: Saite = Säge, VOKAL = Bandpass, Ring / Rauschfarbe / S&H Tonart grau (wie in den Paketen).
- „Was ist anders?“ zählt die Saiten-Regler nicht beim Reiter OSZ (in KF2 schon so; nicht im Auftrag).
- CPU alles zugleich (Ring + rosa + S&H Tonart) +6,6 % (KF1-Ziel 5 %, Grenze 8 %); Saite wie in KF2 (+9 … +13 % Werks-Dämpfung, bis
  +50 … +55 % mit Unison 7).

## Prüfung (unabhängiger Prüfer, 1 Befund)

Sonst geprüft und ohne Befund (Pflicht, Vollständigkeit, Klang, Bedienung, Werksklänge/Projekte) – dort ist nichts geändert.

### Befund 1 – Regel 28: KF1 legte in jedem VA/FM-Klang `kfNc kfRm kfSh1 kfSh2 = 0` an → **bestätigt, behoben**

- **Nachgeprüft** (Fassung vor der Prüfung, `pruef1/index-vor-pruefung.html`): `AN_DEF` (Zeile 24089) ist Zeichen für Zeichen KF1, `normAnalog`
  schreibt die vier Werte in jeden Klang. Folge wie vom Prüfer belegt: kf2-test rot bei „Gespeicherte Form … byte-gleich (Regel 28)“ und
  „CPU alte Klänge … gleiche Nachrichten“; alle alten Werksklänge weichen genau in diesen vier Schlüsseln ab; ein altes Projekt wird neu
  gespeichert länger. Der Klang war bit-gleich.
- **Entscheidung:** Regel 28 gilt (alte Projekte: Datei ohne neue Felder, jede Nachricht byte-gleich) – KF2 hält sie mit `strDmp strHel strAnr`
  schon so ein. Also der erste Weg des Prüfers: **KF1 speichert die vier Werte nur, wenn sie ≠ 0 sind; ein fehlender Wert ist neutral.** Am Klang,
  am Aussehen und an der Bedienung ändert sich nichts.
- **Wo „fehlt = neutral“ gebraucht wird** – 11 Zeilen, jede mit `KF12` markiert (`pruef1/pruefung.diff`, Skript `kf12tools/pruef-r28.py`):
  1. SQStore `normAnalog`: nach der AN-Schleife fallen die vier Werte weg, wenn sie 0 sind (`AN_DEF` bleibt KF1-Text).
  2. `sndGet`: ein fehlender KF1-Wert liest sich als 0 – damit zeigen Regler, Lock-Grundwert (`lkBase`), Super-Regler (`srGet`) und
     „Was ist anders?“ neutral.
  3. `sndSet` → `kf12Put`: ein KF1-Wert 0 nimmt den Schlüssel weg (der Klang im Speicher hat so immer die Form wie nach dem Laden: „geändert“-
     Merker, „Geste zurück auf den Anfang = kein ↶-Schritt“ und Speichern bleiben richtig). Ein neuer Wert steht hinter `fmBite`, wie
     `normAnalog` ihn setzt – sonst hätte ein Saite- oder FM-Klang (Schlüssel hinten: `str…`, `fm6`) nach dem Laden eine andere Reihenfolge und
     Speichern → Laden → Speichern wäre nicht mehr Zeichen für Zeichen gleich.
  4. `liveUpdate`: geht ein KF1-Wert auf 0 (Schlüssel weg), geht 0 an den Worklet.
  5. Worklet `onMsg` (+ `KF12_Z` im Block KF12-WK, nur ASCII): ein ganzer Klang (`set` mit `eng`) ohne KF1-Schlüssel setzt sie auf 0, vor
     `srSetIn` / `setReq` – im Worklet also genau wie vorher die mitgeschickten Nullen; die Nachricht selbst bleibt byte-gleich zur Basis.
  6. Klangzustand (V6A): `v6aGet` (Morph-Ziel, KV1-Anzeige) liest fehlend als 0; `v6aApply` setzt einen KF1-Wert auch auf einem Grundklang
     ohne Schlüssel; `v6aDiff` vergleicht mit fehlend = 0 auf beiden Seiten (sonst würde „Ring 80 %“ auf neutralem Grundklang weder
     aufgenommen noch nach dem Laden angewendet).
  7. `srKeysOf` (Lernen des Super-Reglers): die vier Werte gehören auch ohne Schlüssel dazu (in KF1 waren sie immer da).
- **Gegenproben** (`node pruef1/r28.mjs <datei>` gegen je eine Kopie ohne die Zeile, gebaut mit `grep -v`; die Kopien sind wieder gelöscht): ohne Zeile 5 blieb der Worklet nach „Ring 60 % + braun, dann
  Werksklang laden“ auf `[2, 0,6, 0, 0]`, nach ↶ ebenso; ohne Zeile 4 blieb er nach „Ring hoch und zurück auf 0“ auf 0,5. Mit allen Zeilen: 0.
- **Kosten:** keine im Ton-Weg (`process` unverändert). CPU im selben Prozess, vor gegen nach der Prüfung (`kf12tools/probe-cpu.mjs`,
  `pruef1/probe-cpu-vor-nach.txt`): neutral +1,0 / +0,4 %, Ring über neutral +4,7 / +4,2 % – gleich.

### Tests nach der Prüfung (nacheinander, je mit `timeout`; Ausgaben in `kf12/out/p1/`)

| Prüfung | Ergebnis |
|---|---|
| topdefs | Skripte 26, Namen 6270 (+ `kf12Put`), **doppelt 0, Syntaxfehler 0** |
| dupkeys | **0** |
| Rauchtest `smoke.mjs kf12/index.html kf12/smoke.png` | **errors []** |
| Pflicht-Zeichen | „MS 2000“ 1×, „  live: true,“ 1×; Markenwörter wie in der Basis (Elektron 3, Yamaha 1, Moog 6, Roland 8, die übrigen 0); VERSION 4.51.0; Worklet nur ASCII |
| kf2-test (`kf2/kf2-test.mjs`, unverändert; NOTES in den Ausgabe-Ordner gelegt wie beim Prüfer) | **61/61** (vorher 59/61) – „Gespeicherte Form … byte-gleich (Regel 28)“ `json [] flat []`, „CPU alte Klänge“ gleiche Nachrichten, gleicher Ton, +3,3 % |
| kf1-test (`kf12/kf1-test-kf12.mjs`) | **73/73** im 3. Lauf (`kf1-lauf.txt`); Lauf 1 / 2: 71/73 (Lauf 1: meine erste Fassung der Zeilen-Prüfung zu eng + CPU; Lauf 2: die zwei bekannten Wackler CPU Ring +5,4 % und Tonart-Grenze 1,58 ms, siehe Offen) |
| kombi.mjs | **26/26** (vorher 19) |

- `kf1-test-kf12.mjs` = `kf1/kf1-test.mjs` mit genau zwei angepassten Prüfungen (mit „KF12:“ markiert, 10 Diff-Zeilen):
  (a) „altes Projekt lädt neutral“: fehlender Wert = neutral **und** neu gespeichert ohne KF1-Werte (statt `[0,0,0,0]`) – Ergebnis
  `werte: fehlt ×4, gespeichert: []`; (b) „jede neue Zeile markiert“: KF1- oder KF12-markiert, im Block oder wörtlich aus `kf2/index.html`
  (KF2s Zeilen tragen KF2s Marke oder keine; kf2-test prüft sie). Alles andere wörtlich.
- kombi.mjs: Teil 5/6 jetzt **ohne Abzug** – altes 4.51-Projekt neu gespeichert gleich der Basis, 0 Spuren mit KF1-Werten; 86 alte Werksklänge
  Form und Worklet-Nachricht byte-gleich. Neuer Teil 8 (7 Prüfungen, im Browser mit dem Worklet-Zustand über `n8q`): alter Klang ohne
  Schlüssel liest 0, Worklet 0 · Ring + braun, dann Werksklang → Worklet 0 · ↶ vom neutralen Klang → Schlüssel weg, Worklet 0, ↷ → 0,7 ·
  Geste hoch und zurück auf 0 → kein ↶-Schritt, kein Schlüssel, Worklet 0 · per Regler gesetzt = Form und Reihenfolge wie nach dem Laden
  (Saite hell, FM, VA), Speichern → Laden → Speichern gleich · Klangzustand auf neutralem Grundklang aufgenommen / angewendet / Morph live
  auf 0,8 und zurück auf 0, Zustand „Ring 0“ auf Ring 0,5 bleibt nach dem Laden · Lernen kennt die vier Werte, „Was ist anders?“ ohne Punkt.
  Kombi-Projekt gespeichert 12 964 Zeichen (vorher 13 136), Render-Hash unverändert `a1475245`.
