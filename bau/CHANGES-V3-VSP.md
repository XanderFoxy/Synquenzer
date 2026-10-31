# VS-P — Stimme im Mix (Nachtrag 4, Paket VS-P) · App 4.24.0

Grundlage: Zweig-Kopie `vs-br-VSP/index.html` ab App 4.23.0 (`vs-base-B.html`). Spec: `v3-ideen/dirigent-spec-v3-nachtrag-4-gesang.md`,
Abschnitt „Paket VS-P“. Auftrag Xander 27.10. mittags: „… sie sind im Kontext zu den Synthesizern oder anderen Spuren … meistens viel zu
leise. Kann man da noch irgendwie was machen, dass die Stimme lauter ist oder dass das in besserem Verhältnis zueinander funktioniert?“
`VERSION` 4.24.0 (`APP_CODE` 4 024 000). Format bleibt 5, **kein neues Feld** (der Ausgleich steht nicht im Projekt). `live: true` in CLOUD
unverändert. Kein Supabase-Aufruf. **Am Server offen: `max_app` ≥ 4024000** (Xander per SQL).

## Ursache (erst gemessen, unveränderte App 4.23.0)

Gemessen mit echten Läufen (Mikro-Attrappe im selben AudioContext, Kabel-Weg ohne Pegel-Automatik wie `MIC_ASK`; Mitschnitt an den
Knoten der App; Lautheit ITU-R BS.1770-4, wahre Spitze 4×; `n4-vs-p-m1.mjs`, `n4-vs-p-accept.mjs 02`).

| Stelle | −36 dBFS RMS | −28 dBFS RMS | −20 dBFS RMS |
|---|---|---|---|
| Mikro → Ringpuffer → Take (PCM) | −36,55 LUFS | −28,55 LUFS | −20,55 LUFS |
| Take → `tkStartSrc` → Eingang STIMME-Spur (stereo L = R, +3,01) | −33,6 | −25,6 | −17,6 |
| Ausgang STIMME-Spur (Pegel-Standard 0,8 → 0,8² = −3,88 dB, Pan Mitte) | **−37,5** | **−29,5** | **−21,5** |

- Unterwegs geht **nichts verloren**: Ringpuffer und Take sind verlustfrei (0,0 dB), `tkStartSrc` spielt mit Verstärkung 1, die Kette der
  STIMME-Spur hat dieselbe Pegel-Stellung 0,8 wie jede Synth-Spur. Säubern (VS4) senkt die Stimme kaum: in diesem Lauf (Lautsprecher-Weg,
  60 %) −28,58 → −28,59 LUFS (−0,01 dB); VS4 hat mit echtem Echo −0,4 … −0,7 dB gemessen (Legato mit Echo ≈ −1 dB).
- Die Synth-Spuren dagegen sind kalibriert: Demo-Projekt am Spur-Ausgang Moog-Bass **−22,3**, FM-Pluck **−21,1**, Rom-Fläche **−22,0**,
  Drums **−15,6**, Summe −14,6 LUFS. Die MS-2000-Programme sind auf −18 LUFS **am Klangerzeuger** kalibriert (`mkRender`, vor dem
  Pegel) – am Spur-Ausgang also ≈ −21,9 LUFS, gleich den Demo-Synths.
- Demo-Projekt mit Gesangs-Take (Mikro −28 dBFS RMS): Stimme **−30,2 LUFS** = **9,1 LU unter** der lautesten Synth-Spur und **14,6 LU unter**
  den Drums.
- **Ursache:** Der Gesang kommt mit dem Pegel des Mikrofons in den Mix. Die App schaltet die Pegel-Automatik des Mikrofons bewusst aus
  (Timing, Säubern, Tonhöhe); ein iPhone-Mikro liefert beim Singen etwa −36 … −20 dBFS RMS. Es gab keine Stelle, die den Take auf das
  Niveau der kalibrierten Synths bringt → 8 … 16 LU zu leise, je nach Abstand zum Mikro und Lautstärke des Sängers.

## Was neu ist

1. **Auto-Pegel je Take** (`vpStep`): Die Fassung, die klingt (Roh, gesäubert oder gedehnt – je Puffer einmal), wird nach ITU-R BS.1770-4
   gemessen (K-Filter, 400-ms-Blöcke mit 75 % Überlappung, Gate −70 LUFS / −10 LU; damit zählt der gesungene Teil, Pausen fallen heraus).
   Der Take spielt mit dem Ausgleich, der am Ausgang der STIMME-Spur bei Pegel-Standard (0,8, Pan Mitte) **−16 LUFS** ergibt; Grenzen
   −12 … +24 dB; ein stiller Take bekommt 0 dB. Gilt für Szene-Clips und `song.vox` (beide über `tkStartSrc`) und für vorhandene Takes:
   gemessen, sobald ihr Audio geladen ist (`tkLoad`). Der Wert entsteht nur aus dem Audio (auf jedem Gerät gleich), steht **nicht** im
   Projekt; WAV/ZIP bleiben der Roh-Take (bitgleich).
2. **Spitzen-Schutz** (`vpLim`): Aus demselben Puffer eine Hüllkurve (alle 16 Samples): wahre Spitze (4× Überabtastung) des
   ausgeglichenen Takes ≤ −1,3 dBTP **vor** dem Pegel-Regler (damit ≤ −1 dBTP am Ausgang in jeder Regler-Stellung), 2 ms Vorlauf,
   100 ms Freigabe. Weil der Take vorher bekannt ist, rechnet der Begrenzer offline voraus – **keine Verzögerung** gegen die anderen
   Spuren. Er wirkt als eigener GainNode nur in Abspiel-Stücken, die eine Spitze enthalten; ohne Spitze und ohne STIMME-Spur gibt es
   keinen zusätzlichen Knoten.
3. **Pegel-Regler, Pan, Mute, Sends** der STIMME-Spur wirken wie bisher zusätzlich (relativ).
4. **Leistung:** Gemessen wird in Häppchen im Hauptfaden (6 ms, wenn etwas darauf wartet 20 ms; kein langer Task). Eine Neu-Planung
   (Take fertig, gewählt, gesäubert, gedehnt) wartet, bis die neue Fassung gemessen ist – bis dahin spielt das Alte weiter. Ein Stück mit
   noch ungemessenem Puffer setzt danach ein, wie ein Take, der noch lädt.
5. Kein neuer Regler, kein neuer Knopf, kein neuer Text, kein neues Projektfeld. Test-API: `vpInfo()`, `vpEnv(id)`, `vpWait()`.

## Abnahme

| ID | Ergebnis | Messung/Skript |
|---|---|---|
| VS-P-01 | ✓ Mikro-Weg (● REC mit 🎤, Kabel), gesungener Vokal −36 / −28 / −20 dBFS RMS → Take −37,1 / −29,1 / −21,1 LUFS, Ausgleich +21,97 / +13,97 / +5,97 dB → **Ausgang STIMME −16,04 / −16,04 / −16,04 LUFS** (wahre Spitze −7,4 … −7,6 dBTP). Zweite Stimme (Korpus-Gesang VS2): −16,06 / −16,06 / −16,06 LUFS, auch über den Lautsprecher-Weg mit Säubern 60 % −16,06 | `n4-vs-p-accept.mjs 01`, `n4-vs-p-m1.mjs` |
| VS-P-02 | ✗ **wie geschrieben nicht erfüllbar zusammen mit VS-P-01** (siehe Abweichungen 1). Demo-Projekt + Take (−28 dBFS RMS), alle Regler Standard, je Spur-Ausgang: Moog-Bass −22,29, FM-Pluck −21,11, Rom-Fläche −22,17, Drums −15,63, **Stimme −16,02 LUFS** (4.23.0: −30,16). Stimme gegen lauteste Synth-Spur **+5,09 LU** (Soll ≤ +3), gegen die lauteste Spur (Drums) **−0,39 LU** | `n4-vs-p-accept.mjs 02` |
| VS-P-03 | ✓ (a) leiser Gesang −30 dBFS RMS mit Plosiven bei 0 dBFS roh (nach Ausgleich +13,6 dBFS): wahre Spitze am STIMME-Ausgang **−5,18 dBTP** (Pegel-Standard), **−1,30 dBTP** (Pegel ganz auf); (b) Spitzen genau 0,9 dBFS nach dem Ausgleich: −5,18 / −1,30 dBTP. Natürlicher Gesang, Anteil stimmhafter 20-ms-Frames mit ≤ 3 dB Pegelminderung: Vokal −28 / −20 / −36 (+22 dB) **100 %**, Korpus-Stimme −28 / tief −20 **100 %** (Hüllkurve nicht nötig), Vokal mit Konsonanten (Plosive +14 … +20 dB über RMS, Zischlaute) **96,9 %** (größte 8,2 dB am Plosiv). Verschiebung gegen einen Synth-Ton im selben Mitschnitt: 0,204 ms (4.23.0) / 0,204 ms (VS-P) → **0,000 ms**, begrenzte Plosiv-Spitze 0,632 → 0,551 | `n4-vs-p-accept.mjs 03` |
| VS-P-04 | ✓ Take in 4.23.0 aufgenommen und gespeichert, VS-P im selben Browser geöffnet: gemessen nach dem Laden, **bevor** er spielt (−31,32 LUFS, +16,19 dB); spielt mit **−16,10 LUFS** am Ausgang (4.23.0: −32,2); Projekt mit Take gespeichert in 4.23.0 = geladen in VS-P Zeichen für Zeichen (12 059 Zeichen); WAV-Export bitgleich zum Roh-Take und zu 4.23.0 (`e0a3828d:705600`), ZIP mit Roh-WAV; Projekt ohne Takes (Demo 13 864, INIT 10 312 Zeichen) Zeichen für Zeichen gleich zu 4.23.0 (nur appVersion/Prüfsumme/ID ausgenommen) | `n4-vs-p-p04.mjs` |
| VS-P-05 | ✓ M-KLICK (2. Differenz ≤ 1,5 × Krümmung, Mitschnitt aller Ausgänge, Aussetzer der Test-Umgebung über einen Bezugston erkannt und ausgenommen): Schleife + Take-Wechsel + Stopp Faktor 1,04; A/B Roh│Sauber ×4 + Säubern 100 → 40 % beim Spielen + Stopp Faktor 1,11 / 1,25 (zwei Läufe); arbeitender Spitzen-Schutz (−9,6 dB) mit Schleife + Stopp Faktor 1,17; neuer, ungemessener 16-Takt-Take beim Spielen: Stille 25 ms (4.23.0 auf demselben Weg 270 … 960 ms), Faktor 1,31 (4.23.0 1,55) | `n4-vs-p-click.mjs` |
| VS-P-06 | ✓ lange Tasks: 16 Takte bei 120 BPM (32 s) und 40 BPM (96 s, langsamstes Tempo), Fertigwerden während des Spielens und Laden: **keine** Aufgabe > 50 ms (4.23.0 ebenso keine); längstes Mess-Häppchen 11,9 … 43,4 ms (unter Last der Nachbar-Builds, Lastmittel 4–8 auf 4 Kernen), Rechenzeit gesamt 133 ms (32 s) / 156 ms (96 s). **CPU 3 min** (Demo + Gesangs-Take mit arbeitendem Spitzen-Schutz, Renderer-Prozess, je 2 Läufe abwechselnd): 4.23.0 64,51 / 60,99 % → Mittel 62,75 %; VS-P 64,57 / 55,68 % → 60,13 % = **−2,6 Prozentpunkte** (≤ +2; die Streuung der Umgebung ist größer als der Unterschied) | `n4-vs-p-perf.mjs lt`, `n4-vs-p-perf.mjs cpu` |
| Punkt 4 | ✓ `song.vox` (● SONG mit 🎤, Punch Takt 1–8, Mikro −32 dBFS RMS): Take −33,34 LUFS, Ausgleich +18,2 dB → Ausgang STIMME **−16,03 LUFS**; Pegel-Regler 0,8 → 0,4 = −12,01 dB (Soll −12,04, relativ wie bisher); Mute → still | `n4-vs-p-vox.mjs` |
| Layout | ✓ keine sichtbare Änderung: P1, P2, XL pixelgleich zu 4.23.0, P3, L1, L2 optisch gleich (nur der Toast „STIMME-Spur angelegt“ blendet zeitabhängig ein); Seite in allen sechs Formaten = Fenster (kein Überlauf, kein Sprung) | `n4-vs-p-lay.mjs` |

Regression (Kopien mit Pfad auf diese App, Präfix `n4-vs-p-reg-`): `v3-vs3-accept` **72 ✓, alles grün**; `gs7-v3-vs4-click` 6 ✓;
`gs7-v3-vs4-accept` 25 ✓, 1 ✗ (siehe Abweichungen 5, auch in 4.23.0); `gs7-v3-vs5a-t1/t3/t4/t5` alle grün, `-t2` 20 ✓ / 1 ✗ (auch in
4.23.0) und gelegentlich ein Zeit-Messpunkt (auch in 4.23.0); `gs7-v3-vs5b-t1 … t5` **alle grün** (32 / 51 / 5 / 6 / 9 ✓).
Smoke `smoke.mjs` ohne Fehler.

## Abweichungen

1. **VS-P-01 und VS-P-02 widersprechen sich im Demo-Projekt.** Die Spec setzt −16 LUFS „2 dB über einem einzelnen kalibrierten
   Synth-Programm“ an. Die −18 LUFS der Programme sind aber am Klangerzeuger gemessen, **vor** dem Pegel 0,8 (−3,88 dB); am Spur-Ausgang
   liegen die Synths bei −21 … −22 LUFS. −16 LUFS am Ausgang der STIMME-Spur (VS-P-01, Punkt 2 der Spec) ist deshalb +5,1 LU über der
   lautesten Synth-Spur (VS-P-02 verlangt ≤ +3) – und etwa so laut wie die Drums (−0,4 LU). Gebaut ist die Zahl der Spec (−16 LUFS am
   Ausgang). Eine einzige Konstante (`VP_LUFS`) legt das Ziel fest; −20 LUFS würde VS-P-02 erfüllen (+0,9 LU über FM-Pluck, −4,4 LU unter
   den Drums) und VS-P-01 verfehlen. → Frage an Xander 1.
2. Jede Fassung wird für sich gemessen: Roh und gesäubert (und gedehnt) klingen gleich laut. Das A/B Roh│Sauber vergleicht damit bei
   gleicher Lautheit (Unterschied im Test 0,01 dB). Folgt aus „auf der Fassung, die klingt“.
3. Der Clip-Pegel `audio.gain` (0 … 4, in der Oberfläche nicht einstellbar, immer 1) wirkt weiter als Faktor; der Spitzen-Schutz ist für
   Clip-Pegel ≤ 1 bemessen.
4. Neu-Planung wartet auf die Messung: ein frisch fertiger oder neu gewählter Take setzt um die Messzeit später ein (gemessen:
   Stille 25 ms im Test-Weg; Rechenzeit 32 s Take ≈ 60 … 130 ms in Häppchen). Das Alte spielt bis dahin weiter.
5. Test-Erwartungen früherer Pakete, die schon in 4.23.0 nicht mehr stimmen (nicht durch VS-P, nicht angepasst): `gs7-v3-vs4-accept`
   erwartet den Speicher-Schlüssel `…:c100:0`, seit F1 heißt er `…:c100v2stdc:0`; `gs7-v3-vs5a-t2` „↶ → Stärke 100 %“; der Punkt „heard:
   onset intervals …“ desselben Skripts schwankt (2,9 ms gegen 2,5 ms Toleranz) in 4.23.0 und in VS-P gleich – seine feste Schwelle 0,02
   trifft wegen des Ausgleichs (Ausgang 0,54 statt 0,32) andere Stellen.

## Fragen an Xander

1. **Wie laut soll die Stimme sein?** Jetzt: so laut wie die Drums (−16 LUFS, ≈ 5 dB über den Synths). Alternative: 1 … 2 dB über den
   Synths (−20 LUFS), dann ≈ 4 dB unter den Drums. Beides ist eine Zeile.
2. Einen Schalter „Auto-Pegel aus“ halte ich nicht für nötig (der Pegel-Regler der STIMME-Spur wirkt weiter relativ); nicht gebaut.

## iPhone (Xander)

Nur auf der Pages-Seite (Mikrofon):
1. Ein vorhandenes Projekt mit Gesang öffnen und ▶: die Stimme ist jetzt deutlich lauter, etwa so laut wie die Drums – auch bei einem Take,
   der leise aufgenommen wurde (weiter weg vom Mikro gesungen).
2. Neu aufnehmen (● REC mit 🎤), einmal nah und einmal weit weg vom Mikro: beide Takes klingen gleich laut.
3. Laut in das Mikro „P“ / „T“ sagen oder klatschen: kein Knacken, nichts übersteuert, die Stimme bleibt im Takt mit den anderen Spuren.
4. Pegel-Regler der STIMME-Spur: leiser/lauter wie bisher; Mute schaltet stumm.
5. WAV-Export eines Takes: unverändert der Original-Take (nicht lauter).

## Für das Zusammenführen

Neuer Block (VS-P) direkt vor `/* ---------- Abspielen ---------- */`: `VP_*`-Konstanten, `VP`, `vpKco`, `vpTp`, `vpJob`, `vpStep`,
`vpFinish`, `vpPump`, `vpDefer`, `vpTrackBufs`, `vpKick`, `vpHot`, `vpReady`, `vpGet`, `vpLim`, `VP_API`.
Ein-Zeilen-Haken in vorhandenen Funktionen:
- `tkPlayBuf` (2 Zeilen: Rückgabe über `vpKick`) · `tkLoad` (1 Zeile: `TK.buf.set(id, vpKick(b))`)
- `tkStartSrc` (Zeile `const V = …` und `G = … * (V ? V.g : 1)`; Verbindung `s → lim → g` statt `s → g`; `lim` im Stück-Objekt `r`)
- `tkPlace` (1 Zeile: `if (!vpReady(o.buf)) return;` vor `TK.reg.add`)
- `tkTrackResync`, `tkVoxResync` (je 1 Zeile `vpDefer(…)`)
- `clResync` (VS4): Tausch erst mit gemessener Fassung (`|| !vpReady(nb)`), alte Fassung blendet von `r.G` aus (mit Ausgleich)
- `wpSwitch` (VS5): 1 Zeile nach dem Sammeln der Paare (`if (pairs.some(p => !vpReady(p.nb))) return;`)
- `Object.assign(SYNQUENZER, VP_API);` nach der WP_API-Zeile · `VERSION = '4.24.0'`
VS-P fasst `tkVoiceTake`, `vsRecDone`, `vsFangDone`, `recLength`, `tkMakeTake` und das Mikro-Blatt (VS-L) nicht an.
Snapshot: `synq-snapshots/VS-P.html`. Testskripte: `dirigent-test/n4-vs-p-*.mjs` (Ausgaben `dirigent-test/n4vsp/`).
