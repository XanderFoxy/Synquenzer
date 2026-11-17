# LAGE1 – Lage teilen · Oktave falten ohne Doppelnoten · Filter je Note · Basis 4.78.0 (md5 68e92c03…)

## Für Xander
- Im Noten-Editor einer Synth-Spur gibt es in der unteren Leiste den Knopf **Lage ▾**. Er steht gleich hinter **Auslagern ▾**. Er öffnet unten das Blatt **LAGE**. Die Rolle darüber bleibt bedienbar: Du kannst dort Noten wählen, scrollen und Tasten antippen.
- Alle drei Reiter nutzen einen gemeinsamen **Trennton**.
  - Der Vorschlag ist das obere Drittel der Tonhöhen, also deiner Auswahl oder sonst des ganzen Clips.
  - Ändern kannst du ihn mit − und +, durch Ziehen in der kleinen Vorschau (je 6 px ein Halbton) oder durch Antippen einer Taste links in der Rolle.
  - Die Noten, die es trifft, sind in der Rolle und in der Vorschau gelb. Die gestrichelte Linie ist der Trennton.
- **Lage teilen**:
  - **Obere** (oder **Untere**) Noten wandern auf eine neue Spur direkt darunter, „Synth 1 · oben“. Das Timing bleibt gleich.
  - Klang: **Gleich │ Heller │ Weicher │ Anderer …**. Heller und Weicher sind derselbe Klang mit Cutoff eine Oktave höher oder tiefer. Anderer … öffnet den Klang-Browser der neuen Spur.
  - Mit **Ziel ▾** wählst du stattdessen eine vorhandene Spur. Deren Klang bleibt.
  - Ist der Clip dort kürzer, wandern nur die Noten, die hineinpassen. Die anderen bleiben hier. Das Blatt sagt es vorher („2 liegen hinter dem Ende von Synth 3 und bleiben hier“), die Meldung danach auch.
  - Steht der Filter schon ganz offen (oft bei FM), sagt das Blatt: „Heller“ ändert hier nichts.
  - Ein ↶ nimmt alles zurück.
- **Oktave falten**:
  - **Obere ↓ −12** (oder **Untere ↑ +12**).
  - Entsteht dabei zweimal derselbe Ton hintereinander (z. B. zweimal C), gibt es drei Wege:
    - **Kontur halten**: Die Note wird der nächste Ton der Tonart in die alte Richtung. Der Lauf bleibt also ein Lauf. Sie baut dabei keine neue Doppelnote und springt nicht zurück über den Trennton; dann nimmt sie den nächsten Ton weiter oder den in die andere Richtung.
    - **Zusammenziehen**: Gleiche Töne werden ein langer Ton (auch C3 · C4 · C3 → ein langes C3).
    - **Weglassen**: Die Doppelnote fällt weg. Liegt derselbe Ton davor und danach, bleibt dazwischen eine Pause.
  - Gleiche Töne genau übereinander werden ein Ton.
  - **▶ Vorher / ▶ Nachher** spielt es dir vor. Ein ↶ nimmt es zurück.
- **Filter je Note**:
  - Der Schalter **Filter-Zeile unter den Noten** macht aus der Zeile VEL eine Zeile **FILT**. Das Blatt geht dabei zu, damit die Zeile frei ist. **Lage ▾** holt es zurück.
  - Dort ziehst du je Note: hoch = heller, runter = dunkler. Wischen malt mehrere Noten auf einmal. Nahe der Mitte rastet die Zeile auf 0 ein.
  - Ein Tipp auf das Schild FILT/VEL wechselt hin und her. Mit dem Werkzeug ⇕ siehst du immer VEL.
  - **Oben heller** wirkt wie Key-Tracking, aber nur über dem Trennton: Unten bleibt es, wie es ist. **Alle auf 0** setzt alles zurück.
  - Es wirkt beim Abspielen je Stimme ab Notenbeginn, bei VA, FM, WT und der Platte. Hat der Clip einen Klangzustand ◆, ist dessen Filter die Mitte.
  - Der MIDI-Export schreibt es als **CC74**-Kurve mit (Wert vor jeder Note), damit es in der DAW als Automation ankommt.
- Im Guide („Wo finde ich …?“) stehen drei neue Einträge. Bei „Filter je Note“ steht der Hinweis zu Key-Tracking.

## Technik
- Alles steht im Block `/* LAGE1-BEGIN … LAGE1-END */` direkt hinter `MTX3-END`. Er wird gebaut aus `lage1-block.js` mit `bau.py` (Basis + Block + Haken, jede Stelle muss genau einmal passen).
- Außerhalb des Blocks gibt es 13 einzeilige Haken, alle mit „LAGE1“ markiert:
  - Daten:
    - `NOTE_X` (+ 'fc') und SQStore `NOTE_EXTRA` (+ 'fc'). Das Speicherformat packt die Noten mit eigener Feldliste; ohne diesen Haken ging fc beim Speichern verloren.
    - `normNoteExtras` → `lage1NoteNorm` (ganzzahlig −64 … 63; 0 und ungültige Werte fallen weg).
  - Wiedergabe:
    - `lkNoteX` → `lage1LkAdd`: der Filter-Wert wird ein Cutoff-Paar je Stimme auf dem vorhandenen I2b-Weg der Noten-Locks.
      - VA/FM: Platz `cutoff` (wi 35, Hz).
      - WT: nativ über `lkP.cutoff`.
      - Platte (MK_LABEL): `mk.t.0/1.f.cut`, Schritte = Halbtöne · 127 / (12 · log2 1000).
      - Ein Cutoff-Lock der Note ist die Basis. Die Mod-Routen (KF1 „Anschl. ±“ = vel→cutoff) bleiben unberührt und wirken obendrauf.
    - `scheduleTrack`: Bedingung `(e.nt.lk || e.nt.fc)`.
  - Rolle: `buildRoll` mit `onRender`-Option (PianoRoll ruft sie am Ende jedes Bilds) und `lage1RollHook` nach MTX3B.
  - MIDI: Notenschleifen in `buildMidi` (Szene/alle), `buildMidiSong`, `int54MidiClips`, `va1MidiSong`, `va1MidiClip` → `lage1MidiNote`; `assembleMidi` → `lage1MidiCc`.
- Wiederverwendet:
  - Lage teilen = `mtx3Out` (MTX3 „Noten auslagern“, ein ↶ als Gruppe). Danach im selben Schritt: Name „· oben/unten“, Klang über `applySound`.
  - Das ↶ der Gruppe entfernt die Spur; ↷ holt den Schnappschuss mit Klang und Namen.
  - Blatt-Stil wie das Harmonie-Blatt (unten angedockt, Durchgriff zur Rolle wie bei [♪ greifen]).
  - Vorhören wie im Harmonie-Blatt (`spawnVoice`, `src: 'audition'`).
  - Undo über `pushUndo`/`afterClipEdit`.
- Neue Daten: nur `note.fc` (fehlt = 0) und `uiPrefs.lage1` (Reiter, Obere/Untere, Modus, Klang, Zeile an). Ältere Fassungen laden die Noten ohne fc.
- Ladezeit: Beim Start läuft nur das Eintragen der drei Guide-Zeilen. CSS, Blatt, Zeile und Rechnung kommen erst mit dem ersten Öffnen eines Noten-Editors bzw. des Blatts.
- Gefunden und im eigenen Block umgangen: Der Größen-Wächter `gl1PopWatch` → `popFit` schiebt angedockte Blätter 8 px nach rechts und 8 px nach oben (rechts ragen sie dann 8 px aus dem Bild). Das trifft auch das Harmonie-Blatt. LAGE hält sich per CSS fest; das Harmonie-Blatt ist unverändert (siehe Offen).

## Tests (alle grün)
- `node lage1-test.mjs <index.html> <basis.html>` → **OK LAGE1: 112/112 bestanden** nach der Prüfung (vorher 94/94; 56 je Ansicht, Einzelheiten unter „Prüfung“) (47 je Ansicht, iPhone 12 Pro Max 428×926 hochkant und 926×428 quer, Touch über CDP). Protokoll: `lage1-test-lauf.log`, Ergebnis: `lage1-test-ergebnis.json`.
  - L0 Aus:
    - Die Rolle ohne Blatt ist pixelgleich zur Basis.
    - Der MIDI-Export ohne Filter-Werte (Szene und Export-Spur) ist bitgleich zur Basis.
  - L1 Blatt:
    - [Lage ▾] steht gleich hinter [Auslagern ▾]; die Trefferfläche ist so hoch wie die Leiste, wie bei Auslagern.
    - Das Blatt ist unten angedockt, im Bild, und die Rolle dahinter bleibt bedienbar.
    - Alle Knöpfe sind ≥ 44×44 px; kein Text ist abgeschnitten.
  - L2 Trennton:
    - Vorschlag A4 (oberes Drittel von C2–C6).
    - +/− ändern um je einen Halbton.
    - Ziehen in der Vorschau: 60 px ergeben +10, Linie greifen und 24 px ziehen ergibt −4.
    - Tipp auf eine Taste links setzt den Trennton.
    - Die betroffenen Noten sind in der Rolle gelb getönt, die anderen nicht.
  - L3 Teilen (Touch):
    - 5 obere Noten gehen auf die neue Spur „Synth 1 · oben“ direkt darunter. Timing, Länge, Tonart und Anschlag bleiben gleich.
    - „Heller“ ergibt Cutoff × 2.
    - Ein Undo-Eintrag. ↶ stellt den Stand JSON-gleich wieder her, ↷ holt Klang und Namen zurück.
    - Umgekehrt: Untere Noten in die vorhandene Spur Synth 3; deren Klang bleibt.
  - L4 Falten (Testfolge mit Wiederholung, Akkord-Doppel und alter Wiederholung):
    - Kontur, Zusammenziehen und Weglassen liefern genau die erwarteten Folgen.
    - Das Blatt zeigt „5 Noten … · 3 Doppelnoten gelöst“.
    - ▶ Vorher und ▶ Nachher spielen auf der Spur; Nachher enthält keine Note ≥ C4.
    - Nach Stopp hängt keine Stimme.
    - [Falten] per Touch ergibt ein ↶ / ↷. „Untere ↑“ funktioniert.
  - L5 Filter-Zeile:
    - Der Schalter zeigt FILT.
    - Wischen malt ≈ +40 auf 4 Noten; ein Tipp unten ergibt −48.
    - ↶↶ / ↷↷ wirken.
    - Das Schild wechselt FILT ↔ VEL; mit dem Werkzeug ⇕ steht dort VEL.
    - [Oben heller] gibt (n − Trennton) · 4/3; [Alle auf 0] wirkt, ein ↶ holt es zurück.
  - L6 Wiedergabe (Worklet-Messung je Stimme, `lkProbe`):
    - VA 380 → 1520 / 95 / 24 Hz (fc +32 / −32 / −64).
    - FM 20000 → 20000 / 5000 / 1250.
    - Platte Timbre-Cutoff 127 → 127 / 102 / 76.
    - KF1-Route vel→cutoff: Klang und Mod-Matrix im Worklet sind vorher und nachher gleich.
    - Nach ■ sind 0 Stimmen übrig (Haupt-Thread und Worklet).
  - L7 MIDI:
    - CC74 = 64 / 96 / 32 / 0 an jedem Notenbeginn, jeweils vor dem Note-an.
    - Die FM-Spur ebenso, ebenso das Export-Blatt „Spur“.
    - Eine Spur ohne Werte bekommt keine CC.
  - L8 Speichern/Laden:
    - fc, die Zeilen-Einstellung und die geteilte Spur (Name, Klang „weicher“, Note mit fc) sind nach dem Neuladen gleich.
    - Laden normt fc (99,4 → 63; Text und 0 → weg; −12,6 → −13).
  - L9 Guide: drei Einträge. „Zeig es mir“ öffnet Rolle und Blatt mit dem richtigen Reiter; der Key-Tracking-Hinweis steht da.
  - L10: keine Konsolenfehler.
- Pflicht:
  - `topdefs.cjs`: Skripte 26, doppelt 0, Syntaxfehler 0.
  - `dupkeys.cjs`: 0 doppelte Schlüssel.
  - `smoke.mjs`: errors [] (`smoke.png`).
  - „MS 2000“ 1×; `^  live: true,` 1×.
  - Markenwörter wie in der Basis (Cubasis 2, Roland 8, Yamaha 1, Moog 6, Ableton 2; Korg/DWGS/Kodamo/Mask1/Nord/Kompakt/Clavia/Steinberg 0).
  - Keine Emojis als Grafik. basis.html unverändert (md5 68e92c03…).
- Fotos in `fotos/` (je hochkant und quer): Blatt Teilen, nach dem Teilen, Blatt Falten, Blatt Filter, FILT-Zeile, Guide → Filter.

## Messung
- Startzeit (`startzeit.mjs`, 3 Läufe je Datei, abwechselnd, Rechner mit Last 5–6, Median): Basis DCL 629 / load 688 / bereit 748 ms; neu 633 / 701 / 742 ms. Das ist im Rauschen, ohne messbare Verschlechterung.
  - Einzelwerte Basis: 629/688/748, 866/918/986, 604/653/710.
  - Einzelwerte neu: 765/824/877, 630/683/741, 633/701/742.
- Datei: 9 543 731 → 9 601 680 Byte (+58 KB, davon ~44 KB Block).
- In der Rolle kostet der onRender-Haken bei geschlossenem Blatt und VEL-Zeile nur eine Abfrage der (zwischengespeicherten) Einstellungen je Bild. Gelbe Vorschau und Falt-Rechnung laufen nur bei offenem Blatt. Das Falt-Ergebnis wird gemerkt (Fingerabdruck aus Noten, Auswahl, Trennton und Modus).

## Offen
- Bit Mask (45 Werksklänge), North-Perkussion und Drums: Filter je Note wirkt dort nicht. Die Noten-Locks (I2b) kennen diese Engines nicht; das Blatt sagt es.
  - Für Bit Mask bräuchte es einen Cutoff-Platz je Stimme im Bit-Mask-Kern.
- Wirkung „ab Notenbeginn je Stimme“: Der Wert ersetzt für diese Stimme die Cutoff-Basis.
  - Dreht man während einer klingenden Note mit Filter-Wert am Cutoff, folgt sie erst ab der nächsten Note.
  - Basis ist der Klang, den der Clip spielt: Grundklang mit dem Klangzustand ◆ des Clips (Prüfung). Während einer ◆-Gleitfahrt gilt für Noten mit Filter-Wert schon der Zielwert; ein Super-Regler-Stand wird nicht eingerechnet.
- Worklet-Messung: Eine neu belegte Stimme meldet im ersten Bericht kurz einen alten Cutoff (z. B. 475 → 95 Hz). Das ist in der Basis mit vorhandenen Noten-Locks genauso, also nicht durch LAGE1. Ob es hörbar ist (ein Kontrollblock), ist offen → Sache des I2b-Kerns.
- Gefunden, nicht geändert (anderes Teil): `gl1PopWatch` → `popFit` schiebt unten angedockte Blätter (Harmonie, Konux …) 8 px nach rechts und 8 px hoch; rechts ragen sie 8 px aus dem Bild, das ✕ des Harmonie-Blatts ist angeschnitten. Vorschlag: `popFit` für `.dock` überspringen. LAGE hält sich per CSS selbst fest.
- MIDI:
  - Der Mitschnitt-Export (Log) hat kein CC74.
  - Song-Melodie-Noten (`song.mel`) bekommen keinen eigenen CC74-Wert.
  - Gleichzeitige Noten mit verschiedenen Werten: Es zählt der Mittelwert, weil CC für den ganzen Kanal gilt.
  - Der MIDI-Import liest CC74 noch nicht zurück in fc.
- Lage teilen: Den neuen Klang kann man vor dem Teilen nicht vorhören (danach anhören, ↶).
- Oktave falten, Weglassen: Liegt derselbe Ton vor und nach der weggelassenen Note (C3 · C4 · C3), bleiben zwei gleiche Töne mit einer Pause dazwischen. Wer das nicht will, nimmt Zusammenziehen (ein Ton) oder Kontur.
- Quer: Mit offenem Blatt sieht man nur die oberen Tasten der Rolle; tiefe Tasten unter dem Blatt lassen sich dann nicht antippen (Trennton dann mit − / + oder der Vorschau).
- Quer deckt das Blatt den Großteil der Rolle ab, wie das Harmonie-Blatt. Der Tasten-Tipp geht dann nur für die oben sichtbaren Tasten; sonst Regler oder −/+.
- Das Schild FILT/VEL ist 40 × 56 px groß: das vorhandene Feld, schmaler als 44. Der Weg über den Schalter im Blatt hat 44 px.
- Echt-iPhone (Safari) nicht geprüft, nur Chromium (Playwright).

## Prüfung (17.11., Nachbesserung nach dem Prüfer)
Sicherung vor der Nachbesserung: `index.vor-pruef.html` (b5c3a645…), `lage1-block.vor-pruef.js`, `lage1-test.vor-pruef.mjs`. Alle Änderungen stehen im Block LAGE1 (Kommentar „Prüfung“). Außerhalb des Blocks hat sich nur der Haken in `lkNoteX` geändert: er gibt jetzt auch `clip` weiter. Es sind weiter 13 einzeilige Haken, alle mit LAGE1 markiert.

Der Prüfbericht kam abgeschnitten an: lesbar waren die Zusammenfassung und die Befunde 1–4. Die drei kleinen Befunde habe ich aus den Prüfer-Skripten (`pruef/probe*.mjs`) nachgefahren; was ich dort und selbst gefunden habe, steht unter 5–9.

| # | Befund | Nachgeprüft | Behoben | Test |
|---|---|---|---|---|
| 1 hoch | Teilen in eine vorhandene Spur mit kürzerem Clip: Noten hinter dem Clip-Ende verschwanden, die Meldung zählte falsch | ja, probe2 E1: 4 angesagt, 2 kamen an, 2 weg | `lage1SplitPlan`: Noten ab dem Ende des Ziel-Clips bleiben in der Quelle. Blatt vorher („2 Noten wandern · 2 liegen hinter dem Ende von Synth 3 (1 Takt) und bleiben hier“, am Ende gekürzte Noten werden genannt), Meldung zählt die wirklich verschobenen Noten und nimmt die MTX3-Hinweise mit (z. B. Song). Gelb markiert ist nur, was wirklich wandert. Wandert nichts, ist [Teilen] aus. | L3 „Ziel-Clip kürzer“ (Blatt, Ergebnis, Meldung, ein ↶) |
| 2 mittel | „Kontur halten“ baute neue Tonwiederholungen (G3 F4 F3 → G3 G3 F3) | ja: 5 in 300 Zufallsläufen | Der neue Ton wird gegen den Ton davor, danach und zeitgleich geprüft (`clash`). Bis zu drei Leitertöne in die alte Richtung, dann in die andere. G3 F4 F3 → G3 A3 F3. | L4 Fälle + 300 Zufallsläufe: 0 neue Wiederholungen |
| 2b | Dabei gefunden: Kontur hob gefaltete Noten zurück über den Trennton (B2 B3, Trennton C3 → B2 C3), in 300 Läufen 25-mal | ja (probe A: f3, „above“) | Der Ersatzton bleibt auf der Seite des Trenntons, auf der die gefaltete Note liegt (B2 B3 → B2 A2; Untere ↑ C4 C3 D4 → C4 E4 D4) | L4: 0-mal über den Trennton |
| 3 mittel | Filter je Note richtete sich nach dem Grundklang statt nach dem Klangzustand ◆ des Clips (−16 klang heller als ohne Wert) | ja, probe3: 95 / 760 / 190 / 95 Hz | `lage1StSnd`: Basis = Grundklang mit `clip.st` (v6aApply, nur eigene Engine; im ◆-Editor wie bisher). Jetzt 95 / 190 / 48 / 95 Hz. | L6 ◆ (VA): 95 / 380 / 24 / 95 Hz; Platte mit ◆: 60 → 73 |
| 4 mittel | Die FILT-Zeile lag unter dem eigenen Blatt (hochkant Zeile 604–660, Blatt ab 515; quer 348–392, Blatt ab 137) | ja, probe B2 | Der Schalter „Filter-Zeile“ macht das Blatt zu (Meldung: „FILT-Zeile ist an … ‚Lage ▾‘ holt das Blatt zurück“). Ist die Zeile schon an, sagt das Blatt: „Die Zeile liegt unter diesem Blatt: zum Ziehen ✕ tippen.“ | L5: Zeile per Touch frei (3 von 3 Punkten treffen die Zeile), [Lage ▾] holt das Blatt mit Reiter Filter |
| 5 | FM mit ganz offenem Filter (20 kHz): „Heller“ meldete „Klang heller“, änderte aber nichts | ja, probe2 E2 | `lage1SndRoom`: das Blatt sagt vorher „Der Filter ist schon ganz offen – „Heller“ ändert hier nichts“, die Meldung „gleicher Klang – Filter schon ganz offen“ (ebenso „ganz zu“ bei Weicher) | L3 FM |
| 6 | Dabei gefunden: Zusammenziehen ließ bei C3 · C4 · C3 eine neue Wiederholung C3 C3 stehen; die Erkennung „war schon vorher gleich“ irrte nach einem Zusammenziehen | ja, eigener Zufallslauf: 5 Fälle | Der Ton danach wird mit eingezogen; je Note merkt sich die Rechnung den Ursprungston des ersten und letzten Teils (`na`/`ne`) | L4 Zusammenziehen (neue Erwartung `0:48:2.9 …`), Zufallslauf: nie mehr Wiederholungen als vorher |
| 7 | Dabei gefunden: Mit langem Hinweistext wurde der Knopf „Teilen → Synth 3“ abgeschnitten („n → Sy“) | ja, Foto | Der Knopf behält seine Breite, der Text daneben bricht um | L3: Knopf ganz lesbar, 112 × 44 px |
| 8 | Filter je Note bei WT war ungeprüft | gemessen | – (wirkt: WT-Stimme 2000 → 1000 Hz bei −16) | L6 WT |
| 9 | Toast nach dem Falten: „1 Doppelnoten“ | – | Einzahl | – |

Nachgeprüft ohne Befund: Tasten unter dem Blatt (probe B4) – die Rolle geht nur bis C1, `keyAt` liefert dort richtig C1; die tiefen Tasten liegen hochkant/quer unter dem Blatt (steht unter Offen). Laden alter Projekte (probe C) ändert sich durch die Nachbesserung nicht.

Test-Robustheit: L1 misst die Lage des Knopfs [Lage ▾] nach dem Scrollen der Leiste neu (unter Last tippte der Test sonst einmal daneben).

**Tests nach der Prüfung:** `lage1-test.mjs` 112/112 (56 je Ansicht, hochkant 428×926 und quer 926×428, Touch über CDP). Neu: L3 Ziel-Clip kürzer (3), L3 FM, L4 Kontur-Fälle, L4 Zufallsläufe, L5 Zeile frei + Blatt zurück, L6 ◆, L6 WT/Platte. Prüfer-Skripte nachgefahren: probe2 (E1 2 wandern / 2 bleiben, E2 ehrlich), probe3 (95/190/48/95), probe A (Kontur 0 Wiederholungen, 0 über dem Trennton).

**Pflicht (Endfassung):** topdefs 26 Skripte, 0 doppelt, 0 Syntaxfehler · dupkeys 0 · smoke errors [] · „MS 2000“ 1× · `^  live: true,` 1× · Markenwörter wie Basis · keine Emojis als Grafik (nur ✓ ✕ als Zeichen) · VERSION '4.78.0' · basis.html unverändert (68e92c03…).

**Messung:** Startzeit, je Runde 3 Läufe, Median DCL/load/bereit (Rechner mit Last 4–8, Streuung ±150 ms):
- Endfassung: Basis 585/637/714 ms, neu 578/633/743 ms.
- Vorrunden (Stand vor dem letzten CSS-Satz): Basis 604/655/723 – neu 639/698/810; Basis 589/593/695 – neu 624/691/770; umgekehrte Reihenfolge Basis 624/671/716 – neu 592/637/706; vor-pruef 795/848/910 – neu 635/692/760.
- Ergebnis: keine messbare Verschlechterung. Beim Start läuft vom neuen Code nichts; neu sind nur Funktionen, die erst mit dem Blatt laufen.
- Falt-Rechnung 1500 Noten: 12–19 ms (vorher 13 ms, gleiche Streuung). Bildzeit der Rolle mit offenem Blatt: 2,7–5,3 ms (vorher 2,7–4,7 ms).
- Datei: 9 607 964 Byte (+6 KB zur Bauer-Fassung).

**Fotos für Xander:** `fotos/pruef-teilen-kurzer-clip-428x926.png`, `fotos/pruef-teilen-kurzer-clip-926x428.png`, `fotos/pruef-filt-zeile-frei-926x428.png` (Skript `fotos-pruef.mjs`); die Test-Fotos l2–l9 sind neu aufgenommen.

**Offen nach der Prüfung:** echtes iPhone (Safari) ungeprüft; ◆-Gleitfahrt (Noten mit Filter-Wert nehmen schon den Zielwert); Weglassen bei C3 · C4 · C3 (Pause zwischen zwei C3, siehe Offen).
