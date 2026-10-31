## VS-L — Gesang mindestens 16 Takte + Schalter „Melodieerkennung“ (Nachtrag 4, Paket VS-L) · App 4.24.0 · Format 5

Grundlage: `v3-ideen/dirigent-spec-v3-nachtrag-4-gesang.md`, Paket VS-L (L.1, L.2, VS-L-01 … -11). Zweig-Kopie `vs-br-VSL/index.html`
aus App 4.23.0 (`vs-base-B.html`). **Version 4.24.0** (`APP_CODE` 4 024 000), **Format bleibt 5** (kein neues Projektfeld; der Schalter
liegt im Geräteprofil). `live: true` in CLOUD unverändert. Kein Supabase-Aufruf – **am Server offen: max_app ≥ 4024000** (Xander per SQL).
Größe: 3 370 195 → 3 377 061 B (+6,9 KB).

### Ursache (im unveränderten 4.23.0 nachgemessen, echte Läufe mit Mikro-Attrappe)

Skripte `dirigent-test/n4-vs-l-repro.mjs`, `n4-vs-l-repro2.mjs` (Ausgaben `n4-vs-l-repro-*.out`, `n4-vs-l-repro2-mel4.out`):

| Weg (4.23.0) | gesungen | Ergebnis | Befund |
|---|---|---|---|
| ● REC 🎤 leerer Platz, AUTO, 120 BPM | 16 Takte | STIMME 16 Takte, Take 32,25 s, MELODIE 16 Takte / 32 Noten | in Ordnung |
| ● REC 🎤 leerer Platz, AUTO, **40 BPM** | 16 Takte | Take 96,25 s, `late` 0 | Ringpuffer (120 s) reicht |
| Stimme-FANG, 16-Takt-Phrase | 16 Takte | MELODIE + STIMME je 16 Takte | in Ordnung |
| ● SONG 🎤 Überschreiben | 16 Takte | `song.vox` 16 Takte, 32 s | in Ordnung |
| ● REC 🎤 über 4-Takt-MELODIE-Clip (MELODIE gewählt) | 16 Takte | STIMME 16 Takte; MELODIE bleibt 4 Takte, 33 Noten übereinander gefaltet | STIMME in Ordnung |
| **● REC 🎤 auf einen Platz mit 4-Takt-STIMME-Clip (Overdub)** | 16 Takte | **STIMME bleibt 4 Takte, neuer Take 8,25 s von 32 s** | **Ursache 1** |
| **Länge 16** (`setRecOptions({length:16})`, Laden einer Datei mit 16) | – | **wird zu AUTO** (`recLength` nimmt nur 1, 2, 4, 8) | **Ursache 2** |

**Ursache 1 (die, die Xander getroffen hat):** Liegt in der Szene schon ein STIMME-Clip (z. B. aus einem ersten FANG oder einem ersten
● mit 4 Takten), ist jede weitere Gesangsaufnahme dort ein Overdub. `tkVoiceTake` rechnete mit `L = old.len` und nahm nur den jüngsten
vollen Durchgang des alten Clips: 16 gesungene Takte → 4-Takt-Take (8,25 s von 32,25 s), der Rest ging verloren.
**Ursache 2:** „Länge“ kennt höchstens 8 Takte; 16 wurde beim Wählen und beim Laden zu AUTO.
Zusätzlich gesehen (nicht die Ursache, Spec-Liste): über einem vorhandenen MELODIE-Clip behält die MELODIE ihre Länge (Noten werden in den
Clip gefaltet, wie ein Tasten-Overdub) – die STIMME ist dort schon 16 Takte lang (siehe Fragen).

### Was neu ist

1. **Overdub wird länger (L.1.2, `tkVoiceTake`):** Ist die neue Aufnahme länger als der alte STIMME-Clip (ganze Takte ab dem Takt ihres
   Anfangs, gerundet, höchstens 16), wird der Clip so lang wie die Aufnahme, der neue Take ist die ganze Aufnahme (oben), der alte geht wie
   heute stumm in `alt`. Ist sie nicht länger, läuft alles wie 4.23.0 (jüngster voller Durchgang – deep-equal geprüft). Läuft die Szene,
   gilt die neue Phase (Anfang der Aufnahme) sofort; der alte Take klingt weiter, bis der neue gelesen ist, dann Überblendung (3/5 ms) –
   keine Lücke (`tkGrowPhase`). Ein Undo-Schritt wie bisher.
2. **Länge 16 (L.1.3):** „Länge“ AUTO, 1, 2, 4, 8, **16** im Aufnahme-Blatt (● lang drücken / Chip) und in den Einstellungen;
   `recLength` (Laden) und `setRecOptions` nehmen 16. Die Länge-Knöpfe sind jetzt in allen Formaten ≥ 44 × 44 (vorher 32–40 px hoch, quer
   40 px breit; Spec VS-L-04). AUTO wie bisher bis ●, spätestens 16 Takte.
3. **Schalter „Melodieerkennung“ [An] [Aus] (L.2)** im Mikro-Blatt, Abschnitt „Stimme → Noten“, erste Zeile. Standard **An** (Verhalten
   4.23.0). Gespeichert im Geräteprofil `synq-stimme-v1` → `vs.mel` (fehlt = An), **nicht im Projekt**. Bei **Aus** steht darunter
   „Aufnahme nur als Gesang auf der STIMME-Spur – keine Noten.“ und:
   - **● REC mit 🎤:** nur STIMME-Take/-Clip wie heute, kein MELODIE-Clip, keine Noten, kein Ergebnis-Blatt, keine Tonhöhen-Auswertung
     (`vsRecVoice`); Meldung „Gesang aufgenommen · n Takte“; ein Undo.
   - **Stimme-FANG:** der gesungene Abschnitt aus dem **Pegel der Stimme** (20-ms-Fenster, beim Lautsprecher nach dem Echo-Abzug wie der
     Noten-Weg „1E“, Schwelle aus Grundrauschen/Spitze), dann **dieselbe Pausen-Regel** (`vsPhrase`: Pause ≥ 1 Takt, Länge als
     Zweierpotenz ≤ 16) → nur STIMME-Take im selben Platz wie heute (`vsMelFree`); Meldung, ein Undo (`vsFangVoice`, `vsLevelNotes`).
   - **● SONG mit 🎤:** nimmt schon in 4.23.0 nur `song.vox` auf (keine Noten aus der Stimme) – unverändert.
   - Das Mikro-Blatt rollt jetzt mit dem Finger (`pan-y`), damit [Einmessen]/[Mikro aus] quer erreichbar bleiben (siehe Abweichungen).
4. **Kein Aussetzer beim Take-Wechsel, wenn der Hauptfaden den Planungs-Vorlauf verpasst (`tkTrackResync`, eine Zeile):** nach dem Lesen
   eines langen Takes (16 Takte ≈ 50 ms Rechenzeit) lag der Neuplan-Anfang hinter `R.schedBeat` → das neue Stück kam erst beim nächsten
   Tick (gemessen 31–63 ms Lücke). Jetzt wird mindestens 50 ms voraus geplant (Stück-Schlüssel verhindern Doppelte).
5. **Ringpuffer (L.1.1/L.1.5):** bleibt **120 s** (reicht beim langsamsten Tempo 40 BPM: 16 Takte = 96 s + 0,25 s Vorlauf + Latenz).
   Speicher am iPhone (48 kHz) unverändert: Mikro + Referenz 2 × 11,52 MB + 3:1-Signal 3,84 MB ≈ **26,9 MB**. **Grenze ● SONG mit 🎤:
   ≈ 119,6 s** am Stück (120 s minus Latenz, 30 ms Rand und 0,25 s Vorlauf) = 59 Takte bei 120 BPM, ≈ 19,9 Takte bei 40 BPM; darüber
   beginnt der Take später (gemessen: 21 Takte bei 40 BPM = 126 s → `late` 6,36 s).
6. Test-API: `vsSet({mel})`, `vsInfo().cfg.mel`, neu `vsVoiceOnly()` (Schalter, letzte Pegel-Phrase, letzter Gesang-Take).

### Abnahme (Chromium headless, Mikro-Attrappe im selben AudioContext; Skripte in `dirigent-test/`)

| ID | Ergebnis | Messung / Skript |
|---|---|---|
| VS-L-01 | ✓ 120 BPM leerer Platz: STIMME 16 Takte, Take 32,25 s (`late` 0); Take Takt 1 −21,4 dBFS, Takt 16 −21,2 dBFS; **am Ausgang** (Szene allein) Takt 1 −21,5 dB, Takt 16 −18,5 dB, nach der Schleife Takt 1 −21,4 dB; MELODIE 16 Takte, 32 Noten (t = 0 … 62); Wellenform 64 Spalten über die ganze Länge (L.1.6) | `n4-vs-l-accept.mjs 01` |
| VS-L-02 | ✓ 4-Takt-STIMME-Clip + 16 Takte: Clip **16 Takte**, neuer Take oben (32,000 s), alter in `alt[0]` (0,25 … 8,25 s); Take Takt 1 −18,8, Takt 16 −22,5 dBFS; Phase = Takt der Aufnahme; hörbar Takt 1/16 −17,9/−18,2 dB. **3 Takte auf 4-Takt-Clip:** Clip 4 Takte, STIMME-Spur + Takes deep-equal zu 4.23.0, MELODIE deep-equal bis auf Messrauschen der Tonhöhen-Auswertung zwischen zwei Läufen (o/d ≤ 0,02 Schlag; 4.23.0 gegen sich selbst 0,010/0,010) | `n4-vs-l-accept.mjs 02` |
| VS-L-03 | ✓ Demo, 4-Takt-MELODIE-Clip, MELODIE gewählt, ● 16 Takte → STIMME-Take **16 Takte** (32,000 s), Takt 16 −21,2 dBFS; MELODIE bleibt 4 Takte (wie 4.23.0) | `n4-vs-l-accept.mjs 03` |
| VS-L-04 | ✓ Länge 16: Schlag 67,5 noch `recording`, 68,3 `off` (Start 4) – endet nach genau 16 Takten; Take genau 32,0000 s bei 18 gesungenen Takten; Speichern/Laden: Datei 16, geladen 16; Auswahl in P1, P2, P3, L1, L2, 926 × 428: 6 Knöpfe, alle ≥ 44 × 44, im Bild, nichts abgeschnitten (Aufnahme-Blatt und Einstellungen) | `n4-vs-l-accept.mjs 04`, `n4-vs-l-lay.mjs` (93/93), Bilder `n4-vs-l-neu-*-laenge.png`, `-menu.png` |
| VS-L-05 | ✓ 40 BPM: ● REC Take 96,25 s, Vorlauf 0,25 s, `late` 0, Takt 16 −23,8 dBFS; Stimme-FANG MELODIE/STIMME 16 Takte, 96,25 s, `late` 0; Overdub 4 → 16 Takte, 96,00 s, `late` 0; ● SONG 16 Takte, 96,00 s, `late` 0; Grenze: 21 Takte (126 s) → `late` 6,36 s | `n4-vs-l-accept.mjs 05 05g 05o 05s 05x` |
| VS-L-06 | ✓ FANG 16-Takt-Phrase: MELODIE 16 Takte (32 Noten), STIMME 16 Takte (32,000 s, gleiche take-ID), Takt 16 −21,2 dBFS | `n4-vs-l-accept.mjs 06` |
| VS-L-07 | ✓ ● SONG 16 Takte: `song.vox` 16 Takte (32,000 s), letzter Takt −21,2 dBFS; am Ausgang in Takt 16 (STIMME allein) −20 … −27 dB | `n4-vs-l-accept.mjs 07` |
| VS-L-08 | ✓ **Aus:** ● REC → STIMME 4 Takte, kein MELODIE-Clip, MELODIE-Spur deep-equal, Zähler `runs` 0, kein Ergebnis-Blatt, Meldung „Gesang aufgenommen · 4 Takte“; Stimme-FANG (2 Takte, Pause 2 Takte, 4 Takte) → STIMME 4 Takte ab Takt 6, MELODIE deep-equal, Zähler 0, Meldung; ● SONG → `song.vox` 4 Takte, MELODIE deep-equal, Zähler 0. Pausen-Regel Aus (Pegel) = An (Noten): Anfang Takt 6, 4 Takte. **An:** ● REC, FANG, SONG deep-equal zu 4.23.0 (Noten o/d ≤ 0,01 Schlag Messrauschen) | `n4-vs-l-accept.mjs 08` |
| VS-L-09 | ✓ Standard An; Tipp „Aus“ → `vs.mel = false` im Geräteprofil; Projekt-JSON vor/nach Zeichen für Zeichen gleich (14 080 Zeichen); nach Neuladen Aus; Profil aus 4.23.0 (ohne Feld) → An; Claude-App (iframe, Speicher wirft): 4.24.0 läuft, kein Mikro, kein Mikro-Blatt, keine Seitenfehler | `n4-vs-l-accept.mjs 09` |
| VS-L-10 | ✓ P1, P2, P3, L1, L2, 926 × 428: Zeile „Melodieerkennung“ [An] [Aus] 56 × 44 je Knopf, im Bild, Beschriftung ganz; Satz bei Aus ganz; Seitenhöhe unverändert (kein Layout-Sprung), kein waagrechtes Rollen; hochkant passt das Blatt ganz (454 bzw. 474 px), quer rollt es mit dem Finger bis [Mikro aus] (L1 80, L2 95, XL 42 px) | `n4-vs-l-lay.mjs`, Bilder `n4-vs-l-neu-{P1,P2,P3,L1,L2,XL}-mikro(-aus).png` |
| VS-L-11 | ✓ je genau ein Undo-Schritt, Undo/Redo deep-equal: Overdub wird länger, Länge-16-Aufnahme, ● REC Aus, FANG Aus | in 02, 04, 08 |
| FP-DSP (Wechsel zum längeren Clip) | ✓ 3 Läufe, Mitschnitt im Audio-Faden (AudioWorklet): vorher 330 Hz (alter Take), danach 440 Hz (neuer), **längste Lücke 0 ms**; größte 2. Differenz am Wechsel 0,00115/0,00117/0,00115 = 0,0052–0,0054 je Pegel (Maßstab VS3-Take-Wechsel A/B 0,0032–0,0044 bei Spitze 0,49 → ≤ 0,009 je Pegel); keine Klick-Spitze | `n4-vs-l-click.mjs` (`n4-vs-l-click.out`) |
| Regression | ✓ Rauchtest ohne Fehler (`n4-vs-l-smoke.png`); `v3-vs3-accept` 71/72 – der eine Punkt (G: A/B 54 Hz) danach 2 × grün auf 4.24.0 und 2 × auf 4.23.0 (Zufall der Messung); `v3-vs3-click` 3 × grün (0,0032/0,0044/0,0032, wie 4.23.0 0,0032); `gs7-v3-vs4-accept` 24/26 → „Audio-Store …“ schlägt auch auf 4.23.0 fehl (alte Erwartung), „Stimme bleibt im Pegel (100 %)“ hängt am Einsatz-Versatz des Testlaufs (offMs 209–221 → −1,05 … −1,34 dB; offMs 189 → −0,66 … −0,89 dB, 4.23.0 bei 189 ebenso grün), danach 3 × grün; `gs7-v3-vs5a-t1/t3`, `gs7-v3-vs5b-t1/t3` grün | `n4-vs-l-reg-*.mjs`, Ausgaben `n4-vs-l-reg-*.out` |
| Fehlerliste | ✓ Marken-Regel (kein Korg-Wort, „MS 2000“ 1 ×), `live: true` 1 ×, keine alert/confirm/prompt, Texte deutsch, Knöpfe ≥ 44 | grep |

Die Test-Skripte planen den Gesang vorab im AudioContext (sonst verschiebt Rechenlast des Test-Rechners den Einsatz); wo Startzeit und
Abläufe gleich sind, sind die Ergebnisse deterministisch.

### Abweichungen (begründet)

- **Mikro-Blatt quer:** In L1/L2 rollte das Blatt schon in 4.23.0 (396 px Inhalt bei 372/357 px), mit der neuen Zeile jetzt 452 px; in
  926 × 428 passte es vorher (396/410), jetzt rollt es dort 42 px. Weil das Blatt in 4.23.0 **nicht mit dem Finger rollte** (Touch wurde
  abgefangen; gemessen 0 px), wären [Einmessen]/[Mikro aus] quer nicht mehr erreichbar gewesen → Blatt bekommt `pan-y` (Finger rollt,
  Tippen bleibt Tippen). Hochkant (P1–P3) passt es ganz. Andere Gestaltung zum Verkleinern habe ich nicht gebaut (Regel 27, Frage 1).
- **Länge-Knöpfe 44 px hoch** (vorher 32–40 px, quer 40 px breit) – nur die Zeile „Länge“, weil VS-L-04 es verlangt; „Quantisieren“ und
  „Einzähler“ daneben sind weiter so klein wie in 4.23.0 (Frage 2).
- **Aufnahme-Banner:** Kein Banner nennt MELODIE als Ziel des **Gesangs** (● REC hat keinen Banner; der Song-Banner „MEL“ meint die
  Tasten-Noten der Song-Melodie) → nichts geändert.
- **Overdub wird länger:** der neue Clip beginnt am Takt des Aufnahme-Anfangs (im Raster des laufenden Clips); bei ● mitten im Takt
  liegt der Take mit Versatz `at` in diesem Takt. Über 16 Takte hinaus nimmt er die ersten 16 Takte (wie ein neuer Clip).
- **Stimme-FANG Aus** nimmt denselben Platz wie heute (`vsMelFree`: gewählte Szene, wenn MELODIE dort frei ist) und verlangt weiter einen
  freien MELODIE-Platz, obwohl keine Noten entstehen; die Auswahl bleibt, wo sie war (die Tastatur soll nicht auf die STIMME-Spur springen).
- Meldung bei 1 Takt grammatisch „Gesang aufgenommen · 1 Takt“.
- `tkTrackResync` (VS3) um eine Zeile geändert (Vorlauf ≥ 50 ms) – ohne das gab es beim Wechsel zum 16-Takt-Take 31–63 ms Lücke.

### Befunde (nicht geändert)

- **Overdub ohne Wachsen (wie 4.23.0):** beim Wechsel zum neuen Take ≈ 27–40 ms Stille (alter Take blendet in `tkVoiceTake` sofort aus,
  der neue kommt erst nach dem Lesen) – gemessen mit `n4-vs-l-click.mjs <app> 4`. Der Weg „wird länger“ hat das nicht (0 ms).
- P3 (320 × 568): „🔈 Lautsprecher“ im Mikro-Blatt abgeschnitten – schon in 4.23.0 so.
- Menü-Kopf „SYNQUENZER 4.24“ in P3 rechts abgeschnitten – schon in 4.23.0 so („4.23“).

### Fragen an Xander

1. Das Mikro-Blatt ist quer (und im iPhone 12 Pro Max quer) jetzt etwas höher als der Bildschirm und rollt mit dem Finger. Soll es quer
   zweispaltig werden oder kleiner (z. B. die Zeile „Melodieerkennung“ neben „Stimme → Noten“), damit es wieder ganz passt?
2. Die Länge-Knöpfe sind jetzt 44 px hoch, „Quantisieren“ und „Einzähler“ darunter noch kleiner – sollen die auch 44 px bekommen?
3. ● REC mit 🎤 über einem vorhandenen MELODIE-Clip: die STIMME wird jetzt 16 Takte, der MELODIE-Clip bleibt aber 4 Takte und bekommt die
   Noten aller 16 Takte übereinander (wie ein Tasten-Overdub, 4.23.0). Soll der MELODIE-Clip dann auch auf 16 Takte wachsen?
4. Bei „Melodieerkennung Aus“ braucht FANG 🎤 weiter einen freien MELODIE-Platz und legt die STIMME in dieselbe Szene wie heute. Soll er bei
   Aus stattdessen einen freien STIMME-Platz nehmen?
5. Beim normalen Overdub (neue Aufnahme nicht länger als der Clip) gibt es beim Take-Wechsel ≈ 30–40 ms Stille (seit VS3). Soll ich das
   genauso lückenlos machen wie beim Länger-Werden?

### iPhone (Xander, Pages-Seite, Kopfhörer)

1. 🎤 an, ▶, auf eine Szene, in der schon eine kurze STIMME (z. B. 4 Takte) liegt, ● drücken und **16 Takte** singen, ● → der STIMME-Clip
   ist jetzt 16 Takte lang, die Wellenform geht über die ganze Zelle, die Stimme läuft im Takt in Schleife. ✎ → der alte Take liegt darunter.
2. ● lang drücken → **Länge 16** → ● → die Aufnahme hört nach genau 16 Takten von selbst auf.
3. Mikro-Blatt (Tipp auf die rote Mikro-Zeile) → **Melodieerkennung: Aus** → ● singen → nur die STIMME-Spur bekommt den Gesang, keine
   Noten, kein Ergebnis-Blatt, kurz „Gesang aufgenommen · n Takte“. Auch FANG 🎤 nimmt dann nur Gesang. Nach dem Neuladen bleibt „Aus“.
4. Bitte melden: Kommt der ganze Gesang an (Anfang und Ende)? Hörst du beim Übergang auf den längeren Clip ein Knacken oder Loch?
   Quer: lässt sich das Mikro-Blatt mit dem Finger bis „Mikro aus“ rollen?

### Für das Zusammenführen (3-Wege-Merge mit VS-P)

Geändert (nur diese Stellen, sonst nichts umformatiert):
- CSS: neue Regeln nach `.stpop .st-vs button.on{…}` (`.st-mel`, `.st-melx`, `#roLen button,.mrow.rlen .seg button`).
- `VERSION` 4.24.0.
- `normalizeProject` (Zeile `d.recLength = [1, 2, 4, 8, 16]…`), `setRecOptions` (`recLength`), `popRecOpts` (Seg `roLen` + 16),
  `openMenu` (Zeile „Länge“ + 16, `.classList.add('rlen')`).
- `stProf` (Feld `mel`), `stSheet` (Klasse `pan-y`), `stSheetFill` (Ein-Zeilen-Haken `vsMelRowHTML(vc)`), neu `vsMelRowHTML`,
  `bindStSheet` (Zeile `#vsMel`).
- `vsCfg`, `vsCfgSet` (Feld `mel`).
- `vsFang` (Ein-Zeilen-Haken → `vsFangVoice`), `vsRecEnd` (Ein-Zeilen-Haken → `vsRecVoice`); neu `vsVoiceToast`, `vsRecVoice`,
  `vsFangVoice`, `vsLevelNotes` (vor `vsApply`). `vsFangDone`, `vsRecDone`, `vsApply`, `vsPhrase` unverändert.
- `tkTrackResync` (eine Zeile: Planungs-Ende `Math.max(R.schedBeat, t2b(at + .05))`).
- `tkVoiceTake` (Länge `L`, Wachsen `grow`/`gcs`, `clip.len`, Abspiel-Zeile, Rückgabe `len`); neu `tkGrowPhase` (nach `tkVoiceTake`).
- Test-API: neue Zeile `vsVoiceOnly` nach `vsAnalyseRange`.
VS-P (Wiedergabe-Kette, `tkStartSrc`) wird nicht berührt.

Snapshot: `synq-snapshots/VS-L.html`.
