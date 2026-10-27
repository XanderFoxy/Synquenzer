## VS4 — Säubern (Echo-Abzug, Nachfilter, Wiener-Entrauschen, HP 80 Hz, Regler SÄUBERN je Take, A/B Roh │ Sauber, Noten-Weg „1E“) · App 4.19.0

Grundlage: Nachtrag 2 Teil C (C.2 Nr. 4–6, Paket-Zeile VS4, C.4), `r7/stimme.md` §6, §7, §8, §11 Skizze 4, §12 VS4, §13 N7V-21 … N7V-25 und
N7V-35, N2-VS1-02; DSP-Kern `vs-dsp/clean.mjs` (getestet, 101/101 grün, unverändert übernommen). **Version 4.19.0** (`APP_CODE` 4 019 000,
Auftrag: VS4 = 4.19.0 statt 4.16.0). **Format bleibt 5**, alles additiv (K2-31). Keine Server-Änderung (Wächter `max_app` 4 021 000 deckt
4.19.0; kein Supabase-Aufruf in diesem Lauf). Zweig-Kopie `vs-br-VS4`, gestartet von VS3-fix (4.18.0).

**Was neu ist**
1. **Kern in der App:** `vsCleanMake()` = `clean.mjs` ohne Kommentare/Einrückung (20,7 KB), läuft im **Worker** (Blob), Rückfall
   Hauptfaden. Im Browser **bitgleich** zum getesteten Modul (`srcText()` im selben Browser); gegen den Node-Lauf max. 6·10⁻¹¹
   (nur Rundung der Math-Funktionen der JS-Maschine).
2. **Daten (additiv, ein Projekt ohne VS4-Felder bleibt Zeichen für Zeichen gleich):** `take.rf` = Vorlauf der Referenz in Samples (20 ms),
   `take.cl` = SÄUBERN in % (fehlt = 0 = Roh-Take). Audio-Store: Referenz-Stücke `<id>:r<k>` (nur Lautsprecher-Weg), gesäuberte Fassung
   als Cache `<id>:c<%>:<k>` + Info `<id>:ci<%>`; ältere Stärken eines Takes werden beim Neurechnen gelöscht; [Aufräumen] (VS3) behandelt
   alles über die Take-ID. Der Kern ist deterministisch: fehlt der Cache (anderes Gerät, ZIP), wird aus Roh + Referenz gleich neu gerechnet.
3. **Neuer Take (Mikro):** Lautsprecher-Weg → die App schreibt ihr eigenes Playback (Referenz, um 20 ms vorgezogen, damit das Echo sicher
   hinter der Referenz liegt) mit und setzt **SÄUBERN 60 %** (Skizze 4); Kopfhörer/Bluetooth → Roh-Take (0 %), Regler frei.
   Gesäubert wird nach dem Speichern im Worker; bis dahin spielt der Roh-Take, danach wird ohne Knacken umgeblendet.
4. **Hör-Weg** = Echo-Abzug (MDF, 2 Läufe, langsames Nachlernen, Doppelsprech-Bremse) + Nachfilter + Wiener (Rauschprofil aus den leisen
   Stellen) + HP 80 Hz phasenfrei; Boden −6 … −24 dB, **nie stumm (kein Gate)**. **0 % = Roh-Puffer selbst (bitgleich).**
5. **Takes-Blatt** (unter der Take-Liste): **SÄUBERN** 0–100 % (Regler, Schritt 5, ein Undo „Säubern n %“ beim Loslassen, Blatt folgt ↶/↷),
   **Vergleich [Roh] [Sauber]** (A/B, klingt sofort, Blatt zu → wieder „Sauber“), Zustand („säubert … (Netz pausiert)“, „Echo-Abzug ✓ ·
   Musik im Mikro 4 dB über der Stimme · Rauschen ↓ · kein Gate“, „ohne Echo-Abzug (Kopfhörer)“, „0 % = Original (bitgleich)“) und der
   Hinweis **„Viel Übersprechen – Kopfhörer oder leiser spielen“** (Übersprechen > 0 dB rel. Stimme; einmal je Take auch als Toast).
   In der Claude-App: Regler und A/B gesperrt, „Audio nur auf der eigenen Seite“, kein Worker, Daten bleiben deep-equal.
6. **Noten-Weg (VS2, N7V-25):** beim Lautsprecher-Weg rechnet die Auswertung von Stimme-FANG/● REC auf dem Echo-Abzug **„1E“** (ohne
   Nachfilter/Wiener/HP; 8 s Vorlauf zum Lernen; gleiche 3:1-Dezimierung wie das Worklet, gegen `d16` geprüft), aber nur, wenn der Abzug
   die Musik im Mikro spürbar senkt (≥ 1,5 dB), sonst bleibt alles wie in VS2. Die Übersprech-Probe (VS2-fix) prüft danach gegen den Rest
   (Kopplung −15 dB = Schwelle N7V-21). Beim Lautsprecher reicht das FANG-Fenster 3 Takte vor den live gehörten Anfang (live hört die
   Stimme unter lauter Musik oft erst später; offline entscheidet der Noten-Weg).
7. **Datenschutz (N7V-35, N2-VS1-02):** jedes Säubern (Take und Noten-Weg) hält die Netz-Ruhe (`tkQ('clean')` → `stQuiet`, SYNC hält,
   Realtime getrennt) ab dem ersten Schritt bis zum Speichern; Zähler fetch/XHR/Beacon/WS danach 0. Audio verlässt das Gerät nie.
8. **ZIP:** zusätzlich `takes/<id>.ref.wav` (Referenz) → nach dem Import klingt der Take gleich gesäubert (bitgleich nachgerechnet).
9. **Abspielen (FP-DSP):** Roh und gesäubert sind zeitgleich; laufende Stücke werden an derselben Stelle linear überblendet (6 ms,
   Summe konstant), geplante Stücke bekommen den anderen Puffer. `tkStartSrc` merkt sich dafür den Plan (`r.o`).
10. **Test-API:** `clInfo`, `clSet`, `clAB`, `clWait`, `clEnsure`, `clCore` (Kern über den Worker-Weg), `clPlayRange`, `clPlayHash`,
    `clRefRange`, `clNotesInfo`, `clNotesOff`, `clResK`, `clDecCheck`.
11. **Haken in VS2/VS3-Code (je eine Zeile):** `tkMakeTake` (`clNewTake`, Referenz + Säubern nach dem Speichern), `tkStartSrc` (`o` am
    Stück), `tkSheet` (`onClose`), `tkSheetPaint` (`clSheet`), `undoApply` (Art `takes` → `clSync`), `tkZipBytes`/`tkImportZip`
    (Referenz-WAV), `vsAnalyse` (Noten-Weg, Probe gegen den Rest), `vsFang` (Fenster beim Lautsprecher). MK-Motor/Platte unberührt.

**Abnahme** (Chromium 1243 headless; Skripte in `dirigent-test/`; Ausgaben `v3-vs4-core.out`, `v3-vs4-accept.out` (26/26),
`v3-vs4-lay.out`, `v3-vs4-fakewav.out`, `v3-vs4-click.out`, `v3-vs4-perf.out`)

| ID | Ergebnis | Messung / Skript |
|---|---|---|
| N7V-21 | ✓ Kern der App (Worker) mit dem `bleed`-Szenario (0 dB, Einmessen 2 s, Raum 80 ms, RT60 0,3 s): **SDR 24,3 dB** (≥ 15), **Minderung in Pausen 31,8 dB** (≥ 15), **RPA 100 %** über 223 Fenster (≥ 99 %; ohne Säubern 74,4 %). In der App-Kette (Loopback App-Ausgang → Mikro, Musik so laut wie die Stimme, Stimme-FANG-Take): Musik in den Gesangspausen **−39,8 dB** bei 60 %, **−46,8 dB** bei 100 %, Stimme −0,4 … −0,7 dB | `v3-vs4-core`, `v3-vs4-accept B` |
| N7V-22 | ✓ +6 dB mit Sättigung (tanh): **SDR 13,2 dB** (≥ 10), RPA 99 %; **Noten-F in der App-Kette 1,000** (8/8, Musik im Mikro +4,8 dB über der Stimme, Lautsprecher-Loopback, Noten-Weg „1E“; ohne Säubern 0 Noten) | `v3-vs4-core`, `v3-vs4-accept B` |
| N7V-23 | ✓ kein Gate (SNR 40, 100 %): SDR 39,3 dB, längste Lücke < −40 dB in Noten 0 ms; **am echten Mikro-Weg** (getUserMedia mit `--use-file-for-fake-audio-capture` = gesungene WAV, ● REC): 0 ms, gesäubert gegen roh 44,3 dB in den gesungenen Stellen, Rauschen in den Pausen −19,7 dB | `v3-vs4-core`, `v3-vs4-fakewav` |
| N7V-24 | ✓ Kern: 0 % → bitgleiche Kopie; Take-Weg: bei 0 % spielt der Roh-Puffer selbst (Hash gleich), Regler per Finger auf 0 % → ein Undo, Undo → wieder die gesäuberte Fassung bitgleich | `v3-vs4-core`, `-accept B`, `-fakewav` |
| N7V-25 | ✓ Test-API meldet „1E“ (Kern und App-Kette `clNotesInfo`) | `v3-vs4-core`, `-accept B` |
| N7V-35 / N2-VS1-02 | ✓ während des Säuberns `quiet` enthält „clean“ und `stQuiet > 0`; danach Ruhe beendet, Zähler fetch/XHR/Beacon/WS = 0 | `-accept B` |
| hörbar | ✓ STIMME allein, Ausgang in den Gesangspausen: Roh −24,6 dB, Sauber −70 dB (Δ 45 dB); laute Stellen gleich | `-accept B` |
| Speichern/Laden | ✓ Neuladen: Takes deep-equal (cl, rf), gesäuberte Fassung aus dem Store ohne neues Rechnen, bitgleich; ZIP mit `.ref.wav` → frische Seite rechnet bitgleich nach | `-accept B` |
| Claude-App | ✓ Import deep-equal (cl bleibt), kein Säubern, kein Worker, Regler/A/B gesperrt | `v3-vs4-lay` |
| M-PLATZ | ✓ P1, P2, P3, L1, L2, 926×428: Blatt im Bild, Inhalt nicht höher als das Blatt, Regler und Knöpfe ≥ 44 × 44, nichts abgeschnitten, kein Layout-Sprung; Tipp „Roh“ und Regler-Ziehen mit dem Finger (Touch) wirken | `v3-vs4-lay`, Bilder `v3-vs4-{P1,P2,P3,L1,L2,XL}-takes.png`, `v3-vs4-claude-takes.png` |
| M-KLICK | ✓ A/B viermal und neue Stärke während des Spielens: 2. Differenz 1,09 × Krümmung des 440-Hz-Tons (≤ 1,5), 4 von 4 Läufen | `v3-vs4-click` |
| Regression | ✓ `v3-vs2-accept` ALLE OK (49), `v3-vs3-accept` 72/72, `v3-vs3-lay` grün, `v3-vs3-click` grün, `gmkp8-voc-mic` 8/8, `gmkp8-mk8-platz-quer` 9/9, Rauchtest ohne Fehler (`v3-vs4-smoke.png`) | `dirigent-test/vs4reg/r-*.out` |

**Fach-Prüfung (Teil J, Gruppe 7: FP-DSP ● Haupt, FP-IPHONE)** – eigener zweiter Durchgang über Diff, Messungen und Bilder (kein getrennter
Agent). **7 Befunde, alle behoben:**
- *FP-DSP 1:* Puffer-Tausch über `tkVoxResync` (Ausblenden exponentiell, Einblenden linear) gab einen Knick: 1,75–2,1 × Krümmung. → Tausch
  an derselben Stelle mit gleich langer linearer Überblendung (Summe konstant): 1,09 ×.
- *FP-DSP 2:* `cancelAndHoldAtTime` + `linearRampToValueAtTime` sprang in Chromium sofort auf 0 (Einbruch 0,3 → 0,01). → feste Werte
  (`cancelScheduledValues`, `setValueAtTime(G)`, Rampe); in Blenden wird nicht getauscht.
- *FP-DSP 3:* Noten-Weg ohne Probe: Musik allein (Lautsprecher) ergab 35 falsche tiefe Noten aus Bass-Resten. → Probe gegen den Rest
  (−15 dB): 0 Noten; mit Gesang 8/8.
- *FP-DSP 4:* Klick im Mikro, der nicht vom Lautsprecher kommt (VS2-Test G), teilte nach dem Abzug eine Note (7 statt 5). → Abzug nur,
  wenn er ≥ 1,5 dB senkt (dort 0,1 dB → VS2-Weg, 5/5).
- *FP-DSP 5:* Bei lauter Musik hörte die Live-Erkennung die Stimme erst ab Takt 2 → FANG-Fenster begann zu spät (erster Takt fehlte).
  → Lautsprecher: 3 Takte vor dem live gehörten Anfang.
- *FP-IPHONE 6:* Takes-Blatt ragte in 926 × 428 unten 5 px aus dem Bild und rollte nicht mit dem Finger. → `popFit`, Blatt `pan-y`, quer
  (≤ 440 px hoch) kürzer (Hilfetext aus, engere Abstände).
- *FP-IPHONE 7:* Ging Säubern schief (Roh-Take fehlt), hätte jede Planung es neu gestartet. → Fehler-Merker je Take und Stärke.
- Geprüft ohne Befund: 60-s-Take im Worker 3,8 s (6,3 % Echtzeit, Xeon), Hauptfaden 60 fps, längster Frame 25 ms, keine lange Aufgabe
  (`v3-vs4-perf`); NaN-/Denormal-Schutz und Allokationsfreiheit im Kern (vs-dsp-Tests); Worker-Fehler → Toast, Roh-Take spielt.

**Abweichungen (begründet)**
- **Version 4.19.0** statt 4.16.0 (Auftrag). **Format 5** bleibt (additiv).
- **Standard SÄUBERN:** neue Lautsprecher-Takes 60 % (Wert aus Skizze 4), Kopfhörer-Takes 0 % – sonst ändert sich der Klang einer
  Aufnahme, bei der es nichts abzuziehen gibt. Alte Takes bleiben 0 % (bitgleich).
- **A/B** heißt im Blatt „Vergleich [Roh] [Sauber]“, weil das Takes-Blatt schon einen [A/B]-Knopf für zwei Takes hat (VS3).
- **Säubern im Worker** offline nach dem Speichern (Spec: „Worker“); der Block-Verarbeiter `Cleaner` für live (Worklet) ist eingebettet,
  aber nicht verdrahtet (live = nur Hören, C.2 Nr. 5).
- **Speicher:** Lautsprecher-Takes belegen etwa das Dreifache (Roh + Referenz + gesäuberte Fassung), Kopfhörer-Takes mit Säubern das
  Doppelte; Worker-Spitze bei einem 2-min-Take ≈ 90 MB (Int16-Kopien + 3 Float-Felder) – am iPhone ungemessen.
- **VS2-Verhalten beim Lautsprecher** geändert (Noten-Weg „1E“, Probe gegen den Rest, FANG-Fenster 3 Takte); VS2-Abnahme bleibt grün.
- **Budget:** +25 KB geplant, gebaut **+43,7 KB roh / +14,9 KB gzip** (3 187 354 → 3 231 078 B): der Kern allein 20,7 KB, dazu
  Worker/Cache/Blatt/ZIP/Noten-Weg und Test-API. Weit unter 5,0 MB; Startzeit unverändert (der Block tut beim Laden nichts).

**Bekannte Lücken**
- Wellenform in Matrix/Song zeigt den Roh-Take (Skizze 4: gesäubert).
- Ein Take ohne ruhige Stelle in den ersten 20 s hat kein Rest-Echo-Profil (Rückfall Leck-Schätzung, vs-dsp README).
- Echo-Abzug ist linear: sehr lauter Handy-Lautsprecher nah am Mikro (Sättigung) lässt etwa SDR 13 dB – der Hinweis rät dann zu
  Kopfhörern.
- Alles synthetisch bzw. mit Loopback gemessen; echte Stimme/Raum/iPhone-CPU fehlen (Geräte-Punkte unten).

**Befunde an VS3 oder früher (nur gemeldet)**
- VS2: Bei lauter Musik über den Lautsprecher (Musik ≥ Stimme) fand Stimme-FANG ohne Säubern 0 Noten (Live-Start zu spät, Übersprech-Probe
  verwirft alles) – mit VS4 behoben (siehe Punkt 6); Kopfhörer-Weg unverändert.
- VS3: `tkFadeAt` nutzt `cancelAndHoldAtTime` + `setTargetAtTime`; mit linearer Rampe danach springt Chromium auf 0 (siehe FP-DSP 2) –
  `tkFadeAt` selbst ist davon nicht betroffen (VS3-Klicktest grün), nur als Warnung für spätere Pakete.

**Für Xander am iPhone (Pages-Seite)**
1. **Ohne Kopfhörer**, Musik normal laut: 🎤 an, ▶, 4 Takte singen, **FANG 🎤** → OK. Nach ein paar Sekunden ist der Take gesäubert.
   ✎ auf dem STIMME-Clip → im Blatt **SÄUBERN 60 %** und **Vergleich [Roh] [Sauber]**: hörst du bei „Sauber“ die Musik in deinen
   Gesangspausen fast nicht mehr? Klingt deine Stimme gleich (nicht dumpf, nicht „blubbernd“)?
2. Regler auf 100 % und auf 30 % ziehen, jeweils vergleichen. ↶ holt den alten Wert zurück.
3. Mit Kopfhörern: der Take bleibt roh (0 %); Regler hoch → nur Rauschen ↓.
4. Bitte melden: ab wie viel % klingt es für dich am besten (Standard 60 %)? Knackt es beim Umschalten? Steht der Hinweis „Viel
   Übersprechen“, wenn die Musik sehr laut war?

## VS4-fix (27.10.) · App bleibt 4.19.0 · Format 5 · keine Server-Änderung

**Behoben (beide QA-Befunde nachgestellt, dann behoben und erneut gemessen)**
1. **SÄUBERN machte gehaltene Töne/Legato leiser** (N7V-23; Sinus −17/−24 dB, Legato SDR 6–8 dB). Ursache wie gemeldet: Rauschprofil =
   „leiseste 10 % der Rahmen“ = ohne Pause die Stimme selbst. Fix im Kern (`noisePsd`): Profil je Frequenz nach oben begrenzt
   (20-%-Quantil über die Zeit, Minimum über ±6 Bins, ×9). Echtes Rauschen bleibt darunter (Rauschboden-Test 23,6 dB unverändert).
   Dazu: **Lautsprecher-Weg ohne Echo** bildete das Echo-Filter gehaltene Töne der Stimme aus der Begleitung derselben Tonart nach
   (Stimme −3,5 … −5 dB). Fix: Echo-Abzug nur bei klarem Echo-Weg (GCC-PHAT-Spitze ≥ 15 × Effektivwert; gemessen ohne Echo 3,8–11,
   mit Echo ab −10 dB rel. Stimme 27–143); sonst `info.aec = 'aus'`, Säubern = nur Entrauschen.
   Gemessen in der App (echte Mikro-Attrappe, gleiche Aufnahme alt/neu verglichen, `qa-vs4/takecmp.mjs`):
   Kopfhörer-Legato 100 % SDR 6,7 → **27,8 dB**, Stimme −3,7 → **−0,11 dB**; 60 % 7,8 → **28,3 dB**. Lautsprecher-Legato 60 %
   6,1 → **28,3 dB**, −4,7 → −0,11 dB. Sinus 440/220 Hz bei 60/100 %: **0 / −0,2 dB** (vorher −17/−24). Szene mit 440-Hz-Take:
   `v3-qa-vs4-reg` alles grün.
2. **Stimme-FANG über Lautsprecher bei +6 dB mit Sättigung fand Bass-Noten** (N7V-22, Noten-F 0,55–0,67). Zwei Ursachen:
   (a) Die Übersprech-Probe rechnete ohne Einmessen mit −20 dB Kopplung; tatsächlich −1 … −7 dB. Jetzt misst `clNotes` die Kopplung
   aus dem abgezogenen Echo (Mikro − Ergebnis gegen Referenz, `CL.notes.coupDb`); die Probe nimmt die höhere von eingemessen und
   gemessen (`vsBleedPow(m, gm)`). (b) Änderte sich der Echo-Weg im 8-s-Vorlauf (erst ohne, dann mit Echo), lernte das Filter zu
   langsam. Kern-Option `o.from`: das Ergebnis zählt erst ab dem ausgewerteten Stück; zweiter Versuch, der nur die letzten 8 s lernt,
   gilt, wenn er dort weniger Rest-Energie lässt (`info.learn 'neu'`). Gemessen (HPC 1,35, je Lauf): sat6 **F 0,941** (5 Läufe),
   fang6 0,941, fang0 0,941, fangN 0,941 – vorher 0,55–0,67 / 0,67 / 0,80.
- Der Noten-Weg meldet ohne Echo-Weg jetzt `way 'roh'` (mit `pk`, `aec 'aus'`) statt „1E“: es gibt nichts abzuziehen (VS2-Verhalten).
  N7V-25 („1E“) gilt, sobald ein Echo da ist (sat6/fang6/fang0/Abnahme: „1E“).
- Kern `vs-dsp/clean.mjs` + Tests (`node run-tests.mjs`: **107 Prüfungen grün**, neu: Legato ohne Pause, gehaltener Sinus, Legato mit
  Referenz ohne Echo, `o.from` mit/ohne Wechsel des Echo-Wegs); eingebettet per `dirigent-test/v3-vs4fix-embed.mjs` (Kommentare raus),
  App-Kern im Worker bitgleich zum Modul (`v3-vs4-core.mjs` ALLE OK). Builder-Abnahme `v3-vs4-accept.mjs` ALLE OK, Smoke ohne Fehler.
- Größe: 3 231 078 → 3 233 663 B (+2,6 KB roh, +1,0 KB gzip). Rechenzeit Kern unverändert (alt/neu im selben Lauf gleich schnell);
  der Noten-Weg rechnet bei `from` bis zu zwei Lern-Läufe (In-App 2,5–3,2 s für 13 s statt 1,9–2,4 s, Xeon, unter Last).

**Bekannte Lücken / beobachtet**
- Legato **mit** Echo (Lautsprecher, Begleitung in derselben Tonart): das Echo-Filter kostet die Stimme weiter ≈ 1 dB, SDR ≈ 14 dB
  (synthetisch); mit Pausen 19–25 dB. Echtes Gerät ungemessen.
- Test-Umgebung: unter CPU-Last (Nachbar-Builds) lieferte die Fake-Mikro-Aufnahme mehrmals einen schon kaputten Roh-Take (Roh-SDR
  18,8 / 18,1 / 1,4 / −16 dB statt 36,5) – dann ist jede Messung danach wertlos; alt/neu auf derselben Aufnahme verglichen.
  Ebenso schwankt der Take-SDR bei sat6 (9,6–15,7 dB) und echo0 (100 %: 13,3–14,8 dB) von Lauf zu Lauf – alter und neuer Kern auf
  derselben Aufnahme bitgleich bzw. ±0,1 dB, also kein Effekt dieses Fixes (echo0 100 % knapp unter 15 dB: Befund an VS4, offen).
