# ND4 + ND2 – Drum-Engine „North“: Einbindung und Editor (Helfer-Zweig `helfer-nd42`)

Basis: `bau/werkzeug/vs-base-B.html` (App 4.23.0, VERSION unverändert). Ergebnis: `bau/helfer/ND42/index.html`.
Spec: `spec/dirigent-spec-v3-nachtrag-6-drum.md` (§ND4, §ND2). Die Engine selbst (ND1) baut ein anderer Helfer; hier spielt ein
**Platzhalter** (`/* ND-STUB */`, Konstante `MD_WK`), der nur TONE A1 kann.

## Was neu ist

**ND4 – Einbindung**
- **Quelle je Pad:** Drum-Editor SOUND, Zeile B: **[Quelle ▾]** → [Drum-Stimme │ North]. Wechsel = ein Undo. Zurück auf Drum = alle
  Drum-Felder unverändert; die North-Werte bleiben im Slot gemerkt und kommen beim nächsten Wechsel zurück.
- **Schlag-Weg:** `drumHit` verzweigt bei Quelle North auf `mdHit` → Nachricht `hit` (gebündelt je Planungs-Tick) mit Akzent
  (`accentAmt`), Locks TUNE/DECAY, Anschlag. Log, Mitschnitt, Pad-Blitz, VS2-Maske, Pumpen bei der Kick wie bei Drum-Schlägen.
- **Lädt nur bei Bedarf:** Modul und Knoten `synq-md` entstehen erst, wenn ein Pad North wird oder ein Projekt eines hat
  (`mdBoot` in `ensureAudio`, `applyProject`, `applyDrumSound`). Bis das Modul bereit ist, werden Schläge gepuffert. Ohne North-Pad
  wird nichts geladen.
- **Ohne AudioWorklet** (`?engine=native`): North-Pads spielen ihre Drum-Stimme; Hinweis „North braucht AudioWorklet“.
- **Stopp/Panik:** ■ → Stimmen klingen mit derselben τ aus (`stop`), noch nicht begonnene Schläge fallen weg (`cancel`);
  ■■ und Panik → `panic` (auch Hall-/Echo-Fahnen). Szenen-Umschalten mitten im Takt verwirft geplante North-Schläge.
- **Daten (Format 5, additiv):** Slot-Felder `src` + flache `m*`-Werte, Kit-Block `p.md`; `normDrum` prüft Bereiche/Codes
  (Fehlendes = INIT, Unbekanntes bleibt). Speichern/Laden, Kits, eigene Kits, Kopien tragen alles mit.
- **Bibliothek:** eigene Programme `engine:'mdp'` (erscheinen nur unter Programm ▾ → Eigene, nicht im Synth-Browser).
- **CPU:** Engine-Last zählt in `cpuLoad()`; Begrenzer-Stufe geht als `{t:'lim'}` an die Engine.
- **Hilfe:** 7 Zeilen (Quelle, Programm, ALLE KANÄLE, SOLO PART, MONO-GRUPPE, SCL PRE, HALL & ECHO).
- **Test-API:** `SYNQUENZER.setPadSource`, `padSource`, `mdRender`, `mdInfo`, `mdQuery`, `mdName`.

**ND2 – Editor (North-Pad)**
- SOUND: Zeile A Instrument-Chips (kurze Schirme: [■ KICK ▾]) · Zeile B [Quelle ▾][Programm ▾] · Unter-Reiter
  **TONE │ NOISE │ CLICK │ MIX │ FX** · Zellen in Geräte-Paaren (Name, Wert groß in Geräte-Schreibweise, Unterzeile) ·
  Zeile E **[ALLE KANÄLE][SOLO PART][▶][⋯]**. Querformat: Zeilen B+E in einer Zeile, alle Zellen in einer Reihe.
- Zellen: senkrecht ziehen = Wert, seitlich = fein (PITCH 0.1, sonst 1 HT), Doppeltipp = INIT, Tipp = LCD (Wert + deutsche
  Bedeutung). Listen (WAVE, MODE, FILT TYPE, TYPE, DIST TYPE, SCL PRE) gehen beim Ziehen Stufe für Stufe und öffnen beim Tipp eine
  Liste. Zweipolige (BEND, NOISE DYN FILTER, EQ GAIN, PAN) mit Mittelraste. Graue Zellen „–“ (SPECTRA bei A1/t1, FREQ/DYN FILTER bei
  A1, EQ FREQ bei GAIN 0). Vorhören beim Ziehen höchstens alle 300 ms und einmal beim Loslassen (nicht bei laufendem Transport).
- **WAVE-Liste:** 34 Felder in 8 Familienzeilen, Code groß + ein Wort, Tipp = wählen + hören, ein Undo.
- **ALLE KANÄLE:** jede Änderung für alle North-Pads (ein Undo), PITCH relativ mit Gruppen-Grenze; Pads zeigen Rahmen.
  Endet mit Editor schließen, ■, Szenenwechsel. **SCL PRE** (h1–bL) setzt die Tonhöhen ab dem tiefsten Kanal, schaltet ALLE KANÄLE
  an, wird nicht gespeichert.
- **SOLO PART:** nur der Teil des offenen Unter-Reiters (bei MIX/FX der ganze Kanal), andere North-Pads stumm; „SOLO PART“ im Kopf.
- **⋯:** Kopieren, Einfügen (mit ALLE KANÄLE an alle), Tauschen mit …, Init, Programm sichern (Name ≤ 16 + Kategorie).
- **Programm ▾:** Kategorie-Chips bd Sn to HH Cy Pc Be Tu Ef + Eigene; Tipp = laden + hören, ein Undo.
- **TIEF = KANAL:** DYNAMICS (Li L1 L2 L3 O1 O2), MONO-GRUPPE, Übersicht der 12 Pads (Quelle, Programm, Mono ●).
- **KIT:** mit mindestens einem North-Pad Unter-Reiter **[KIT │ North · HALL & ECHO]**: REVERB TYPE, COLOR, ECHO [RATE│BPM], RATE
  bzw. BPM („120 ♩“, „150 ♪“, „200 ♬“, „0.050 s“), FEEDBACK, [TAP] (Schläge 1–3, ab dem 4. das Tempo).

## Abnahme-Tabelle

Tests in `bau/helfer/ND42/tests/` (Aufruf: `NODE_PATH=<playwright> node <test> <index.html> [vs-base-B.html]`).

| ID | Ergebnis | Nachweis |
|---|---|---|
| ND4-01 Regel 28 | ✓ (≤ −90 dB, s. Abweichungen) | `md4-golden.mjs`: Demo, INIT, 7 Werks-Kits: Daten + slotParams gleich; Render alt/neu −123…−155 dB (= Grundrauschen alt/alt); ohne North-Pad kein `synq-md`-Modul |
| ND4-02 Quelle hin/zurück | ✓ | `md4-store.mjs`, alle 12 Pads, je ein Undo |
| ND4-03 Zeit | ✓ | `md4-int.mjs`: Einsatz ±0 Samples, live `late` 0 (2,3 s statt 32 Takte) |
| ND4-04 Lanes | ✓ (mit Stub) | VEL 0,5 → −6,02 dB, Akzent +3,67 dB, TUNE +1200 Cent, DECAY ×2 → T60 ×1,999 |
| ND4-05 Stopp/Panik | ✓ (mit Stub) | 200 ms nach ■ keine Stimme; Panik nach 50 ms < −90 dBFS |
| ND4-06 Speichern/Laden | ✓ | deep-equal inkl. `p.md`; 4.23.0 lädt ohne Fehler, Drum-Stimme spielt |
| ND4-07 Undo/Redo | ✓ teilweise | `historyCheck()` gibt es in der Basis nicht |
| ND4-08 Offline = live | offen | Video-Render VV1 nicht in der Basis; Haken `mdOffline(oc, dest)` vorhanden |
| ND4-09 ohne Worklet | ✓ Code | `?engine=native` → Drum-Stimme + Hinweis; DoD-Lauf nicht wiederholt |
| ND4-10 CPU-Begrenzer | ✓ Nachricht | `{t:'lim'}`; Moden-Begrenzung ist Sache von ND1 |
| ND4-11 Marke | ✓ | kein „Nord“ mehr im HTML (7 alte Stellen bereinigt, s. Zusammenführen); `nOrd` ist ein FM-Variablenname; `MD_NAME` einmal |
| ND4-12 Regression | ✓ Smoke, Golden | DR*/T1–T18-Suiten liegen nur auf dem Dirigenten-Rechner |
| ND2-01, 03, 05–11, 13 | ✓ | `md2-ui.mjs` (echte Touch-Eingabe, P 390×844 + L 844×390): 368 Prüfungen; ND2-10-Fund (RATE/BPM-Umschalter zeigte die alte Zelle) behoben |
| ND2-02 Layout | ✓ | `md2-shots.mjs`: 6 Formate × SOUND (5 Reiter), KANAL, KIT, North-Block: kein Überlauf, kein waagrechtes Scrollen, eigene Bedienelemente ≥ 44 px |
| ND2-12 Marke | ✓ bis auf `nOrd` | kein Gerätename; `grep -i nord` trifft nur noch den alten FM-Variablennamen `nOrd` (6×, schon in 4.23.0) – Umbenennen wäre fremder Code, s. Fragen |
| ND2-04, ND2-07 Klang | nur mit Stub (TONE) | Messung der übrigen Teile nach dem Zusammenführen mit ND1 |

## Abweichungen
1. **Drei Feldnamen** kollidieren mit Feldern der Drum-Stimme (Metall-Schicht `mDec`, `mLvl`, `mCrv` im selben Slot). Gespeichert als
   **`mTdec`** (TONE DECAY), **`mChlv`** (CH LEVEL), **`mDcrv`** (Dynamik-Kurve). Die Nachricht `{t:'ch', p}` an die Engine trägt die
   Spec-Namen (`MDN.spec`); Programme mit Spec-Namen (ND3, Bibliothek) gehen über `MDN.fromSpec`. Ohne diese Abweichung würde ein
   North-Pad den Klang seiner Drum-Stimme verstellen.
2. **Nachrichten additiv:** Schlag-Feld `id`, `{t:'cancel', ids}` (geplante Schläge verwerfen, z. B. Szenenwechsel), `{t:'lim', level}`,
   `{t:'info'}` → `{t:'info', modes, …}` (Test-API ND4-10). SOLO aus = `{t:'mute', ch:-1, solo:''}`. `stop` verwirft zusätzlich
   Schläge mit `at` > `stop.at`.
3. **KIT:** der Block HALL & ECHO liegt in einem eigenen Unter-Reiter (KIT │ North · HALL & ECHO) statt unter dem Kit-Block, sonst
   passt er in 375×667, 320×568 und im Querformat nicht (die alte KIT-Seite bleibt damit unverändert).
4. **Unter-Reiter TONE … FX** nutzen die Unter-Reiter-Zeile von `sheetFrame` mit ihrer App-Höhe (28–32 px, wie überall in der App);
   alle neuen Bedienelemente im Seitenfeld sind ≥ 44 × 44. Auch die Instrument-Chips (Zeile A) bleiben in App-Größe.
5. **375×667:** Zeile A als [■ KICK ▾] (wie 320×568), sonst passen Chips + Zeilen B/E (44 px) + zwei Zellreihen (56 px) nicht.
6. **[Quelle ▾]** steht auch auf der SOUND-Seite der Drum-Stimme (sonst lässt sich kein Pad umschalten) – die einzige DOM-Änderung
   dort (ND2-01).
7. **Programm/Init/Einfügen/Tauschen** behalten MONO-GRUPPE und DYNAMICS am Kanal (Kit-Einstellungen, §1.11/§1.12).
8. Größe +68 KB gegenüber der Basis (Budget ND4 10 + ND2 30 KB); davon ≈ 6 KB Stub, der beim Zusammenführen ersetzt wird.
9. Hinweis „North braucht AudioWorklet“ als Toast und in Zeile B der SOUND-Seite (nicht im Sheet-Kopf).

## Unabhängige Nachprüfung (Fixes)
Ein zweiter, unabhängiger Prüflauf fand 11 Punkte, alle behoben und mit `md2-fix.mjs` nachgetestet: SOLO PART folgt dem gewählten
Pad (und endet auf einem Drum-Pad); ALLE KANÄLE / SOLO PART enden auch über ≡, Browser, Projektwechsel (`closeSheets`); SCL PRE
zeigt ALLE KANÄLE sofort an; TAP geht von 60 ♩ bis in die ♪/♬-Stellungen; ■■ auf der Drum-Spur stoppt klingende North-Stimmen;
Stub: `stop` dämpft keine danach gestarteten Schläge; Programm sichern speichert nur gültige Kategorien; „0.050 s“ mit Punkt;
SOLO wird nach dem Laden des Moduls nachgesendet; Modul-Laden fällt bei „schon registriert“ nicht auf „ohne Worklet“ zurück;
North-Programme lassen sich nicht per Name auf Synth-Spuren laden.

## Fragen an Xander
1. **SOLO PART** schaltet nur die anderen North-Pads stumm; Pads mit Drum-Stimme spielen weiter. So lassen oder alle Pads stumm?
2. **🎲 (Zufall)** im Kopf wirkt bei einem North-Pad auf seine (unhörbare) Drum-Stimme. Ausblenden, eigener Zufall für North, oder lassen?
3. Die **Unter-Reiter** (TONE … FX) sind 28–32 px hoch wie alle Unter-Reiter der App. Für 44 px müsste die Seite in kleinen Formaten
   Zellen verlieren. So lassen?
4. **Löschen eigener Programme:** geht über die Bibliothek/API; ein ✕ in der Programm-Liste ist nicht in der Spec. Gewünscht?
6. Strenges `grep -i nord`: übrig ist nur die FM-Variable `nOrd` (alter Code, kein Markenname). Soll der Dirigent sie umbenennen?
5. Die alten Texte „FM-Percussion (Nord Drum)“ und „Nord Drum / Waldorf Attack“ (Kit-Vorbilder) und „…, Nord Lead“ (Sync-Lead-Vorbild)
   sind jetzt „FM-Percussion“, „Waldorf Attack“ und ohne „Nord Lead“ (Marken-Regel). In Ordnung?

## Für das Zusammenführen
- **Blöcke:** `<script>` mit `G.MDN` (vor SQStore, Daten/Normalisierung) · `/* ND4 … Einbindung */` + `/* ND-STUB */` (nach `drumHit`) ·
  `/* ND2 … Editor */` (vor `barPager`) · CSS `/* ND2 */` am Ende des ersten `<style>`.
- **ND1 ersetzt** den ganzen Block `/* ND-STUB */ … /* Ende ND-STUB */` (Konstante `MD_WK`, Prozessor `'synq-md'`, ASCII). Die Engine
  muss zusätzlich `cancel`, `lim`, `info`, `id` im Schlag und `mute` mit `ch:-1` verstehen (Abweichung 2). `ch` = Pad-Index 0–11
  (Slot-Reihenfolge KICK … SHAKER).
- **ND3:** `mdFirstProgram(id)` (Pad-Start nach Rolle) ersetzen; Werks-Programme als `window.MD_PROGRAMS = [{name, mCat, …Spec-Werte}]`
  (Programm ▾ liest sie, `MDN.fromSpec` übersetzt). Kits: Slot-Felder mit gespeicherten Namen (`mTdec`, `mChlv`, `mDcrv`) oder vorher
  durch `MDN.fromSpec`.
- **Einzeilige Haken** in: `normDrum`, `drumHit`, `silenceAll`, `tailKill`, `cancelTrackFrom`, `cpuLoad`, `applyLimiter`, `ensureAudio`,
  `drumChanged`, `drumBusApply`, `applyDrumSound`, `applyProject`, `loadSlotSound`, `brPool`, `deleteSound`, `makeCtl` (`o.onTap`),
  `buildDrumEd` (Seitenwahl, Unter-Reiter), `pageDrumSound` (Quelle-Knopf), `closeEditor`, `stop`, `launchScene`, Hilfe-Liste,
  `SYNQUENZER`-Objekt.
- **Marken-Text** außerhalb der Pakete geändert (7 Stellen, nur Text/Kommentare): Sync-Lead-`ref`, Resonanz-Kit-Kommentar und `tip`,
  DrumSynth-Kommentare (2), `KIT_REF` (2).
- Tests: `md4-golden.mjs`, `md4-store.mjs`, `md4-int.mjs`, `md2-ui.mjs`, `md2-shots.mjs`, `smoke.mjs`.

## Bitte prüfen (Xander, iPhone)
1. Drum-Editor → SOUND → [Quelle ▾] → North: Pad klingt (Platzhalter-Sinus), zurück auf Drum = alter Klang.
2. Zellen ziehen, seitlich fein, Doppeltipp; WAVE antippen → Liste.
3. ALLE KANÄLE, SOLO PART, ⋯-Menü, Programm sichern/laden.
4. KIT → North · HALL & ECHO, TAP viermal.
5. Ein altes Projekt öffnen: klingt wie vorher.
