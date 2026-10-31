# CHANGES – Zweig K (Nachtrag 5, K1)

## K1 — Klang-Prüfung: Synth stabil, nichts Verstecktes, gleicher Klang nach Speichern · App 4.25.0 (`APP_CODE` 4 025 000) · Format bleibt 5 · keine Server-Änderung

Zweig `n5-br-K` ab 4.23.0 (`vs-base-B.html`). Am Server offen: **max_app ≥ 4025000** (Xander hebt den Wächter selbst an; kein Supabase-Aufruf in diesem Zweig).

### Was neu ist

**Gefundene Fehler und Ursachen (gemessen, dann behoben)**

1. **„Gleiche Werte – klingt plötzlich anders“ beim MS 2000 (behoben).** Die 5-ms-Glättung der stufenlosen Werte (Cutoff, Resonanz, EG-Int, Mixer, Tune, Pan, Pegel …) lief nur, solange eine Stimme klang. Wer einen Regler drehte oder ein Programm lud, **während nichts klang**, behielt im Worklet den alten Glättungsstand: die nächste Note glitt dann vom *vorigen* Wert zum neuen. Wie stark, hing davon ab, welchen Weg die Regler vorher gegangen waren. Gemessen in 4.23.0: gleiche Endeinstellung, zwei Reglerwege, danach dieselbe Note → nur **−4,5 dB** Abstand, also klar hörbar. Einzeln: CUTOFF −27,6 dB, OSC 2 SEMITONE −9,3 dB, RESONANZ −31,7 dB. Jetzt springt die Glättung auf den eingestellten Wert, sobald das Timbre nichts mehr spielt. Dann gibt es nichts zu glätten und nichts knackt. Ergebnis: **−331 dB** (bitgleich) für jeden Reglerweg. Klingende Noten gleiten weiter wie bisher. Frisch geladene Klänge und alle Werksklänge rendern unverändert (Golden-Render).
2. **„Ein paar Cent“ im neuen Projekt (Ursache belegt, für INIT behoben).** Die Ursache ist der Regler **Analog** (MIX-Seite, Vorbelegung 15 %). Er gibt jeder Note eine zufällige Verstimmung: Tonhöhe ±analog·8 ct, jeder Oszillator ±analog·5 ct, Cutoff ±analog·1,5 HT. Bei INIT Analog sind das bis ±1,95 ct je Oszillator. Gemessen in 4.23.0 (INIT, 8 Noten A3): −1,18 … +1,12 ct. Dazu kam die Vorbelegung **Osz 2 Fein +7 ct**: Wer Osz 2 aufdrehte, hatte sofort 7 ct Schwebung. Ein Fehler in der Engine ist das nicht, aber eine Vorbelegung. **INIT Analog** hat jetzt Analog 0 und Osz 2 Fein 0. Gemessen über 8 Noten: **±0,003 ct**. Das neue Projekt mit [Leer (Init)] steht auf 0 Cent. INIT des MS 2000 war schon frei von Modulation und misst ±0,009 ct. Bei den MS-2000-Programmen kommt die Tonhöhen-Bewegung aus dem **Vibrato über die gespeicherte Mod-Rad-Stellung**: 12 von 256 Programmen, z. B. Hauchlead VIB 20 × Mod-Rad 31 % = ±40 ct. Dazu kommen PATCH → Tonhöhe (28 Programme) und Mod-Sequenz → Tonhöhe (10). Bei den VA-Werksklängen haben 39 von 64 Drift und 16 eine LFO → Tonhöhe-Route. Alles das ist gewollte Klanggestaltung und steht jetzt in der Mod-Übersicht. Alte Projekte mit INIT Analog behalten ihre gespeicherten 15 %/+7 ct und klingen wie vorher. Sie gelten nicht als „geändert“, weil der INIT-Stand vor 4.25.0 mit anerkannt wird.
3. **LFO „hält an“ nach dem Hintergrund (behoben).** Steht die App 30 s versteckt und ohne Wiedergabe, hält sie den Audio-Kontext an, um Strom zu sparen (§14.4.8). Danach liefen LFOs, LFO-Punkt und Mod-Anzeigen erst nach dem nächsten Tipp weiter. Jetzt läuft der Kontext an, sobald die Seite wieder sichtbar ist. Gemessen: suspended → running, die Zeit läuft 0,41 s in 0,4 s weiter. In 4.23.0 blieb er stehen.
4. **„Bewegt sich, aber ich komme nicht rein“ (behoben).** Im MOD-Reiter liefen die Pegelbalken der Quellen-Chips (LFO 1, LFO 2, Tonhöhe …) **immer**, auch ohne eine einzige Route. Es sah aus, als moduliere etwas die Tonhöhe, aber es gab keinen Eintrag, den man hätte öffnen oder löschen können. Jetzt bewegt sich ein Chip nur noch, wenn der Klang eine Route von dieser Quelle hat. Gemessen bei INIT ohne Route: kein Chip bewegt sich. Mit LFO 1 → Cutoff bewegt sich nur LFO 1.

**Mod-Übersicht (Punkt 3, die einzige neue Gestaltung)**

- Zu erreichen über **⋯ → „Modulationen (n)“** in jedem Synth-Editor (VA, FM, WT, MS 2000 hochkant) und im Querformat des MS 2000 über **⋯ (mkqmore) → „Modulationen (n)“**.
- Eine Zeile je aktiver Modulation, in der Form **Quelle → Ziel** und darunter die **Menge** in echten Einheiten:
  - **VA/FM/WT:** jede Route der Matrix mit Tiefe und Bereich (z. B. „+4 % · 380 Hz … 501 Hz“), auch Spur-FX-Routen. Dazu die fest eingebauten: Filter-Hüllk. → Cutoff, Anschlag → Filter-Hüllk.-Menge (nur mit Hüllkurve), Keytrack → Cutoff, Analog (Zufall je Note) → Tonhöhe · Cutoff („bis ±1,6 ct · ±0,18 HT“).
  - **MS 2000 (je Timbre, bei Dual „T1 ·“/„T2 ·“):** LFO 2 × Mod-Rad → Tonhöhe (VIBRATO, „±40,2 ct (Mod-Rad 31 %, Tiefe 20)“), PATCH 1–4 (Quelle → Ziel, Intensität), EG 1 / Keytrack / Anschlag → Cutoff, Keytrack → Amp, Mod-Sequenz n → Ziel (Anzahl der Schritte).
- **Tipp auf die Zeile** öffnet den Ziel-Regler: VA/FM öffnen Seite und Unterseite, der Regler leuchtet 1,6 s. Ein Ziel ohne eigenen Regler (Tonhöhe, Amp, Pan, OP n) öffnet den MOD-Reiter, die Route ist dort markiert. Beim MS 2000 öffnet sich GERÄT mit dem Zoom auf die Sektion des Knopfes (wenn es einen gibt) und der EDIT-Seite des Werts. Der Wert steht im LCD.
- **[✕]** (44 × 44) löscht die Modulation in **einem Undo-Schritt**, mit Toast [Rückgängig]. Bei einer Route fällt die Route weg. Bei einem fest eingebauten Wert wird der Regler 0 (Hüllk.-Menge, Keytrack, Analog, VIB INT, PATCH-Intensität, EG-Int …). Bei der Mod-Sequenz wird das Ziel der Spur „keins“.
- Die Liste ist ruhig und bewegt sich nicht. Was sich anderswo bewegt, hat in der Liste eine Zeile (siehe Punkt 4 oben).
- Ohne Modulation steht dort: „Keine Modulation – die Tonhöhe steht auf 0 Cent.“
- Lange Listen scrollen mit dem Finger (`pan-y`). Das Blatt bleibt in allen sechs Formaten innerhalb des Bildschirms.

**Geprüft und ohne Fehler (nichts geändert)**

- **Osz 3:** Pegel, Grundton und Pegelstufen sind bitgleich zu Osz 1/2 (je solo −20,30 dB, Grundton −19,38 dB, Stufen 0,25/0,5/1 identisch). HT +7 trifft 329,6 Hz (−15,5 dB), bei 220 Hz liegt −138 dB. Eine Änderung an Osz 3 wirkt auf Osz 1/2 nur über die gemeinsame (nichtlineare) Ladder: −31 … −43 dB. Osz 2 wirkt mit denselben Änderungen genauso (−30 … −41 dB). Im linearen Bereich ist die Wirkung ≤ −81 dB. Das *Gefühl* „Osz 3 hört man kaum / er verändert die anderen“ hat eine messbare Ursache. Osz 3 steht mit Fein 0 auf **genau derselben Tonhöhe wie Osz 1**, beide laufen phasenstarr mit zufälliger Startphase je Note. Der Pegelgewinn liegt deshalb je Note zwischen **0 und +5,5 dB** (16 Noten gemessen), und die Klangfarbe von Osz 1 ändert sich mit, statt dass eine Schwebung entsteht. Osz 2 hat ab Werk +7 ct und schwebt hörbar. Die Vorbelegung von Osz 3 ist außerdem Puls 16′. Das Verhalten ist Physik und keine Kopplung in der Engine. Ob Osz 3 eine Vorbelegung wie Osz 2 bekommen soll, steht unter Fragen.
- **LFOs:** Dauerlauf je 10 min Audiozeit (VA und MS 2000) mit 1 081 bzw. 1 055 Wechseln (Notenwechsel, ganze Szenen-Klänge, Tempo, Start/Stopp, Sync, Neustart, Hintergrund-Lücken). Die LFO-Phase stand in **0 von 212 792** bzw. **0 von 209 577** Blöcken still (global und je Note). Kein NaN.
- **Sample & Hold:** ein neuer Zufallswert je LFO-Takt, gehalten bis zum nächsten. Gemessene Stufen 14–15 von 15 Scope-Takten (VA, global und je Note) und 23 456–23 472 von 23 467 Samples (MS 2000, Key Sync aus/Stimme). Der Klang ist bitgleich zu 4.23.0 (VA −328 dB, MS 2000 −320 dB).
- **Ladder (VA, 96 Fälle):** alle 6 Typen × ECO/ANALOG × Resonanz 1/1,15 × Drive 0/1 × leise/voll (21 Unison-Stimmen + Sub + Rauschen), Cutoff alle 10 ms gedreht, LFO 40 Hz auf Cutoff/Resonanz. **0 NaN, 0 Inf**, kein Aussetzer bei LP/HP. Die Spitze bleibt begrenzt (max 4,97 = Eingangsstapel plus Resonanzspitze bei HP24 unter ±10-Oktaven-Sweep). Ein 2,7-ms-Tal bei BP24/ECO, wenn der 40-Hz-LFO den Cutoff ±120 HT fegt: Ein Bandpass bei 20 Hz lässt nichts durch, das ist kein Abbruch. **MS 2000** (16 Fälle, RESONANZ 127, 4 Filtertypen, DIST, CUTOFF als Bruchwerte alle 10 ms): 0 NaN/Inf, 0 Aussetzer, Spitze 1,83.
- **Zustandsfreiheit:** zwei Reglerwege zur gleichen Einstellung, danach dieselbe Note. VA −331,9 dB, FM −324,6 dB, MS 2000 −331,1 dB (vorher −4,5 dB, siehe Fehler 1).
- **Regler kommen vollständig an:** Nach 120 zufälligen VA-Reglerwerten und Routen, FM-Operator- und Makro-Änderungen und 60 MS-2000-Gesten mit Bruchwerten (dann Endwert, Dual, Mod-Sequenz) spielt das Worklet exakt die gespeicherten Werte. Abweichungen: 0 Parameter, 0 Routen, 0 Timbre-Felder.
- **Alte Klänge:** Alle 320 Werksklänge (64 VA/FM/WT, 256 MS-2000-Programme) rendern bitgleich zu 4.23.0, außer INIT Analog (gewollt, Fehler 2). Gegen 4.22.0 (F1-fix), 4.17.0 (MK8-fix) und 4.9.0 (MK1-fix) sind 192 bzw. 65 Klänge bitgleich. Das Worklet ist für alle 64 VA/FM/WT-Klänge seit 4.3.0 (V2c-fix, V2e′-fix, MK0-fix) bitgleich. „Früher optimierte Sounds klingen heute anders“ kommt also **nicht** aus einer Engine-Änderung. Die gemessenen Ursachen sind Fehler 1 (MS 2000, je nach Reglerweg) und die Auto-Qualität (siehe Fragen).

### Abnahme

| ID | Ergebnis | Messung/Skript |
|---|---|---|
| K1-01 Osz 3 solo/Mix messbar, keine Wirkung auf Osz 1/2 | bestanden | solo −20,30/−20,30/−20,30 dB, Grundton −19,38 dB je Osz, Stufen identisch; HT +7: 329,6 Hz −15,5 dB / 220 Hz −138 dB; Rest-Wirkung auf Osz 1/2 −31…−43 dB = wie Osz 2 (−30…−41 dB), linear ≤ −81 dB; gleiche Tonhöhe: 0…+5,5 dB je Note (Phase) — `n5-k-osc3.mjs` → `n5-k-01.out` |
| K1-02 LFO-Dauerlauf 10 min ohne Stillstand | bestanden | VA 1 081 Wechsel, 0/212 792 Blöcke ohne Phasenfortschritt; MS 2000 1 055 Wechsel, 0/209 577 — `n5-k-lfo.mjs`, `n5-k-lfo-mk.mjs` (Argument `"" 10`) |
| K1-02 Hintergrund | bestanden (4.23.0: nicht) | suspended → running beim Sichtbarwerden, +0,41 s in 0,4 s — `n5-k-02b.mjs` |
| K1-02 S&H-Stufen = Zufall je Takt, Klang = 4.23.0 | bestanden | Stufenlänge 14–15/15 (VA), 23 456–23 472/23 467 (MS 2000), je Takt neu; gegen 4.23.0 −328/−320 dB — `n5-k-sh.mjs` |
| K1-03 Mod-Übersicht vollständig gegen die Engine | bestanden | 315 Klänge (alle VA/FM-Werksklänge und 256 Programme) gegen den Worklet-Zustand (`k1Dump`): 434 Einträge, 0 Abweichungen — `n5-k-03.mjs` (complete) |
| K1-03 Löschen hörbar, Undo | bestanden | VA-Route LFO 1 → Tonhöhe: Engine 1 → 0 → 1 Route, 1 Undo-Schritt, Schwankung 32,5 ct → 0 ct, Werksklang nach ✕ +2,5 dB anders, nach Undo −324 dB; MS-2000-Vibrato: VIB 20 → 0 → 20, 40,2 ct → 3,2 ct, 1 Undo-Schritt — `n5-k-03.mjs` (delVA, delMk) |
| K1-03 Tipp springt zum Ziel | bestanden | Filter-Hüllk. → FILTER/REGLER, Regler leuchtet; Route vel → Cutoff → Cutoff-Regler; MS 2000 VIB → EDIT Seite 4 (PITCH), LCD „PITCH · VIBRATO +20“ — `n5-k-03.mjs` (jump), per Finger `n5-k-06.mjs` |
| K1-03 was sich bewegt, hat einen Eintrag | bestanden | INIT im MOD-Reiter, Note hält: 0 von 8 Chips bewegen sich (4.23.0: alle); mit LFO 1 → Cutoff: nur LFO 1 (20 Werte in 1,2 s) — `n5-k-03.mjs` (move) |
| K1-03 INIT/neues Projekt ohne Modulation, 0 Cent | bestanden | 0 Einträge; Tonhöhe 8 Noten ±0,003 ct (4.23.0: −1,18…+1,12 ct); INIT MS 2000 0 Einträge, ±0,009 ct; altes INIT nicht „geändert“ — `n5-k-03.mjs` (init) |
| K1-04 Ladder Res max, schnelles Drehen | bestanden | VA 96 Fälle: 0 NaN/Inf, Spitze ≤ 4,97, LP/HP ohne Aussetzer (BP24-ECO-Tal bei ±10-Okt.-Sweep erklärt); MS 2000 16 Fälle: 0 NaN/Inf/Aussetzer, Spitze 1,83 — `n5-k-ladder.mjs`, `n5-k-ladder-mk.mjs` |
| K1-04 Zustandsfreiheit (zwei Wege → Render gleich) | bestanden | VA −331,9 dB, FM −324,6 dB, MS 2000 −331,1 dB (4.23.0: −4,5 dB) — `n5-k-path.mjs`, `n5-k-path-fm.mjs`, Einzelregler `n5-k-path2.mjs` |
| K1-05 Speichern/Laden bitgleich je Engine | bestanden | Worklet = gespeicherte Werte (0 Abweichungen); Projekttext → normalisieren: VA −337,7 / FM −319,2 / MS 2000 −318,9 dB, Daten gleich (auch WT, Drums); Speichern → Seite neu laden: gleiche Werte, gleiche Daten — `n5-k-05.mjs` |
| K1-05 alte Projekte gegen ihre Snapshots | bestanden | Demo und Leer (Init) aus 4.23.0, 4.22.0, 4.17.0, 4.9.0 in 4.25.0 geöffnet: jede Synth-Spur ≤ −324 dB gegen den Render in ihrer Version, „geändert“ wie dort — `n5-k-05old.mjs`; Werksklänge `n5-k-golden.mjs` (320 gegen 4.23.0, 1 gewollt anders), `n5-k-golden-node.mjs` (bis 4.3.0) |
| K1-06 Übersicht ≥ 44 px, alle Formate | bestanden | 390×844, 375×667, 320×568, 844×390, 667×375, 926×428, VA und MS 2000, per Finger über ⋯: Blatt im Bildschirm, Zeilen ≥ 48 px, ✕ 44 × 44, nichts abgeschnitten, Seitenhöhe unverändert, Liste scrollt mit dem Finger, ✕ = 1 Undo, Tipp springt — `n5-k-06.mjs`, Bilder `n5-k-06-*.png` |
| K1-06 CPU ≤ 4.23.0 | bestanden | Worklet in Node, 9 Läufe abwechselnd: VA 8 Stimmen 1,005 ×, MS 2000 4 Stimmen 0,959 × (Messrauschen gleiche Datei gegen sich: bis 1,11 ×) — `n5-k-cpu.mjs` |
| Rauchtest | bestanden | `smoke.mjs` ohne Fehler, `n5-k-smoke.png` |
| Regression MS 2000 (Node) | wie 4.23.0 | `v3-mk1-dsp` 64/64, `v3-mk1-fpdsp` 14/14, `v3-mk3-fpdsp` 6/6 (beim 2. Lauf; Zeitfenster-Messung schwankt auch bei 4.23.0), `v3-mk3-scale` 6/6, `v3-mk4-fx` 61/61, `v3-mk6-fp` 16/16, `v3-mk3-timbre` 29/30 und `v3-mk6-seq` 33/34 (gleicher Fehler auch bei 4.23.0) — `n5-k-reg-*.out`, `n5-k-regbase-*.out` |
| Regression MS 2000 Querformat-Wege | wie 4.23.0 | `n5-k-reg-spielq.mjs` (Kopie von `v3-qmkp-spielq.mjs` auf diesen Zweig) |

### Abweichungen

- **Anschlag → Lautstärke** (VA „Anschlag“ auf STIMME, MS 2000 AMP VELO INT) steht **nicht** in der Liste. Das ist Spieldynamik, nichts bewegt sich dabei. Sonst hätte jedes INIT eine „Modulation“ und die Regel „INIT ohne Modulation“ wäre verletzt. Anschlag → Cutoff und → Filter-Hüllk.-Menge stehen in der Liste.
- **Drums** haben keine Einträge: Die Tonhöhen-Hüllkurven der Pads sind Teil der Drum-Stimme und keine Modulation. Für Drums ist das ⋯-Menü ohne Eintrag „Modulationen“.
- **WT** läuft nativ ohne Analog-Drift. Bei WT steht „Analog“ deshalb nicht in der Liste, Routen und Filterwerte schon.
- **Osz 2 Fein** im INIT ist jetzt 0 statt +7 ct. Das gehört zu „Tonhöhe auf 0 Cent genau“ und ist auf dem Fein-Regler von Osz 2 sichtbar.
- Ein Test-Zugang `{k1Dump}` im Worklet (meldet den gespielten Zustand, nur auf Anfrage) und `SYNQUENZER.k1Mods/k1Del/k1Jump/k1Open/k1Dump/k1Expect`.
- Die vorhandene ⋯-Taste im Editor-Kopf misst hochkant 36 × 31 px. Sie war schon so, der Kopf ist von Xander festgelegt, deshalb nicht geändert. Im Querformat des MS 2000 misst sie 44 × 44.

### Fragen an Xander

1. **Osz 3:** Er ist technisch gleich wie Osz 1/2. Mit Fein 0 läuft er aber exakt auf der Tonhöhe von Osz 1, mal lauter, mal fast unhörbar, je nach Phase der Note (0 … +5,5 dB). Soll Osz 3 eine Vorbelegung bekommen wie Osz 2 (+7 ct), z. B. −7 ct? Oder sollen Oszillatoren auf gleicher Tonhöhe mit gleicher Phase starten? Beides ändert den Klang. Darum ist nichts gebaut.
2. **Qualität „Auto“:** Wird das iPhone knapp an Rechenzeit, schaltet die App die Ladder auf ECO und begrenzt Unison und Stimmen. Das ist der Schutz gegen Aussetzer. Gleiche Regler klingen dann anders: Bass mit Res 0,6 −15 dB Unterschied, Lead −25 dB. Das ist eine zweite Ursache für „klingt plötzlich anders“. Soll das so bleiben (Menü → Klang → Qualität „Analog“ hält den Klang fest), soll die App den Wechsel anzeigen, oder etwas anderes?
3. **S&H mit Key Sync (Timbre/Stimme):** Beim Neustart durch eine Taste behält der erste Takt den letzten Wert, der neue Zufallswert kommt erst am Taktende. Unverändert gelassen (Klang = 4.23.0). Soll ein Tastenstart sofort einen neuen Wert ziehen?
4. Ist es richtig, dass Anschlag → Lautstärke nicht als Modulation zählt (siehe Abweichungen)?

### iPhone (Xander)

- Neues Projekt [Leer (Init)], Synth 1, A gedrückt halten mit Osz 2 auf 100 %: keine Schwebung mehr, kein „paar Cent“. ⋯ → „Modulationen (0)“ zeigt „Keine Modulation – die Tonhöhe steht auf 0 Cent.“
- Einen Werksklang laden (z. B. Moog-Bass), ⋯ → „Modulationen (5)“: Zeile antippen → der Regler leuchtet. ✕ → hörbar weg, [Rückgängig] holt es zurück.
- MS 2000: Programm „Hauchlead“ (D05), ⋯ → Modulationen: „LFO 2 × Mod-Rad → Tonhöhe ±40 ct“. ✕ → das Vibrato ist weg. Im Querformat steht der Eintrag im ⋯ oben rechts.
- MS 2000: Ohne zu spielen CUTOFF drehen, dann die Taste. Die Note beginnt sofort mit dem neuen Cutoff, ohne Wischer vom alten Wert. Mehrmals mit verschiedenen Wegen: immer gleich.
- MOD-Reiter ohne Route: Die Quellen-Chips stehen still. Mit einer Route bewegt sich nur deren Quelle.
- App 30 s in den Hintergrund und zurück: LFO-Punkt und Modulationen laufen ohne Tipp weiter.

### Für das Zusammenführen

Alle Änderungen sind kurze Einhänger in vorhandenen Funktionen oder ein eigener Block. Nichts wurde verschoben oder neu formatiert.

- **Worklet** (`sq-worklet-src`, nur ASCII geprüft): `MkTimbre.idle()` hat eine neue erste Zeile nach der LFO-Zeile (Glättung → Zielwerte, wenn nichts klingt und kein Vocoder tönt). `AnalogCore.onMsg()` hat eine Zeile `{k1Dump}` am Ende.
- `SynthHost.track` / `node.port.onmessage`: eine Zeile `if (m.k1Dump) E.k1Dump = …`.
- `INIT_SYNTH` `f-init-analog`: `p` bekommt `analog: 0, o2fine: 0` (`INIT_VA_P` unverändert, die MS-2000-/Kompakt-Records nutzen es weiter).
- `soundEdited()`: `OHASH.h0` (INIT Analog vor 4.25.0) als zweiter gültiger Hash.
- `modFrame()`: 1 Zeile `k1u`/`k1h`, Chip-Wert 0 ohne Route.
- `openEdMore()`: Eintrag `data-a="k1m"` und Zweig `else if (a === 'k1m') openK1Mods(anchor, t)`.
- MS-2000-Block (`sq-mk-src`): neue Funktion `k1JumpPath()` vor `window.MKUI`, Export `k1: {jump: k1JumpPath}` am Anfang von `window.MKUI = {…}`. `morePop()` hat den Eintrag `k1m` und den Zweig im Tap.
- **Neuer Block** „K1 (Nachtrag 5 K1, Punkt 3): Mod-Übersicht“ direkt vor „Sichern (§11.3)“: `k1Num`, `k1Sgn`, `K1_PG`, `K1_RK`, `K1_PSRC`, `K1_PDST`, `K1_SQT`, `k1Mods()`, `k1Del()`, `k1Jump()`, `openK1Mods()`.
- CSS: Regeln `.pop.k1pop`, `.k1ml`, `.k1mr`, `.k1go`, `.k1x`, `.k1empty`, `.k1hl` direkt nach `.plist.edmore small`.
- Init: `visibilitychange` (sichtbar): `AU.ctx.resume()`, wenn `UI.idleSusp`.
- `SYNQUENZER`: `k1Mods`, `k1Del`, `k1Jump`, `k1Open`, `k1Dump`, `k1Expect` nach `initSound`.
- `VERSION` 4.25.0. Die Zeile `live: true,` ist unverändert.
- Test-Skripte: `dirigent-test/n5-k-*.mjs` (Hilfen `n5-k-lib.mjs` Node, `n5-k-blib.mjs` Browser), Ausgaben `n5-k-*.out`, Bilder `n5-k-06-*.png`, `n5-k-smoke.png`.
- Snapshot: `synq-snapshots/K1.html`.
