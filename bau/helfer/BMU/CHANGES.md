# BM6 – Bit Mask: Einbindung (Helfer-Zweig `helfer-bmu`, Zweig B „Oberfläche“)

Basis: `bau/werkzeug/vs-base-B.html` (App 4.23.0, VERSION-Zeile und `  live: true,` unverändert). Ergebnis: `bau/helfer/BMU/index.html`.
Spec: `spec/dirigent-spec-v3-nachtrag-7-bitmask.md` §2.1, §5, §6 BM6. Der Klang-Prozessor (BM1–BM3) entsteht parallel im Zweig
`helfer-bmk`; hier spielt ein **Platzhalter** (`/* BM-STUB */`, Konstante `BM_WK`), der nur **Maske 031 (Sinus)** kann, aber alle
Nachrichten aus §2.1 versteht. Der Editor BM5 ist **nicht** gebaut (Fragen F1/F2 offen).

## Was neu ist
- **Daten (Format 5, additiv):** `Sound.engine = 'bm'`, `p.bm = {v:1, ly, a, b}` genau nach §5.1. `SQBM.normBm` klemmt/rundet jeden Wert
  auf §1, prüft alle Kennungen gegen die Listen, Fehlendes = INIT, feste Schlüssel-Reihenfolge, **unbekannte Schlüssel bleiben**
  (jede Ebene). `p.bm` bleibt bei jedem Engine-Wechsel erhalten (wie `p.mk`); ein unberührtes INIT-`p.bm` wird beim Wechsel weg aufgeräumt.
  `BM_NAME = 'Bit Mask'` einmal definiert, alle Anzeigen lesen es. `SOUNDS_FORMAT` bleibt 2, `PROJECT_FORMAT` bleibt 5.
- **Engine-Wahl:** fünfter Knopf **Bit Mask** im Synth-Kopf (zweizeilig wie MS 2000), wo er nicht passt, Eintrag im Engine-Chip
  (dort zweizeilig, damit das Namensfeld Platz behält). Auch in „Andere Engine ansehen“ der Bibliothek. Wechsel = ein Undo.
- **Laden bei Bedarf:** Datenteil (`SQBM`, ≈ 10 KB) und ein kleiner Haken-Teil sind immer da. Host, Platzhalter-Prozessor, nativer
  Rückfall, Probe, Render, Platzhalter-Seite liegen im Block **`sq-bm-src`** (wie `sq-mk-src`) und werden erst ausgewertet, wenn eine
  Spur Bit Mask wählt, ein geladenes Projekt einen Bit-Mask-Klang hat (dann auch `addModule('synq-bm')`, vor dem ersten ▶, mit
  `tickAhead(.3)`) oder eine Bit-Mask-Zeile der Bibliothek angehört wird. Ohne Bit-Mask-Klang: kein Block, kein `addModule`, kein Worker.
- **BmHost:** ein `AudioWorkletNode 'synq-bm'` je Bit-Mask-Spur → Eingang der Spur-Kette (Spur-FX, Sends, Mute/Solo wie VA). Das Objekt
  in `AU.synth[i]` bietet dieselben Aufrufe wie der Synth-Host; `spawnVoice`, `scheduleTrack`, `inputDown`, MELODIE, „Eine Skala“, ⇅,
  FANG und ● laufen unverändert darüber. Nachrichten nach §2.1, je Aufgabe gebündelt (eine `on`- und eine `off`-Liste).
- **Engine-Wechsel auf klingender Spur:** gehaltene und vorausgeplante Noten wandern in den neuen Knoten; Bit-Mask-Knoten blendet
  gleichleistungsgemäß über 30 ms (Sinus/Kosinus), die Stimmen des Worklet-Knotens mit τ 10 ms. Bit Mask → Bit Mask (Klang laden,
  Undo, Wert ändern) bleibt im Knoten (`prog`/`set`), ohne Neuanschlag.
- **Stopp/Panik:** ■ → `{t:'stop', at, tau}` (Stimmen mit der τ der App, FX-Fahnen klingen aus); ■■ und Panik → `{t:'panic'}`.
- **Ohne AudioWorklet** (`?engine=native`): NativeVoice mit `PeriodicWave` aus den ersten 64 Teiltönen der Start-Masken von O1/O2
  (Regel §1.2, Fläche abgetastet), Pegel, SEMI/TUNE, natives Filter (NOTCH offen), Hülle der lauteren Quelle. ECO-Zeichen am
  Bit-Mask-Knopf + Toast „Bit Mask braucht AudioWorklet – vereinfacht“.
- **Räder:** BEND/MOD (Bauteil MK1) auch auf Bit-Mask-Spuren → `{t:'ctl', bend, mw}`; nichts gespeichert, kein Undo, MOD startet bei 0.
- **Bibliothek:** Engine-Chip „Bit Mask“, Kategorien Bass · Lead · Pad · Keys · Blech/Streicher · Pluck/Glocke · Orgel/Chor · FX/Arp
  (als Rollen; ein Chip erscheint, sobald die Engine Werks-Klänge dieser Rolle hat – BM7 liefert sie mit `role`), Werk + Eigene,
  INIT-Liste: **INIT Bit Mask** (= 1 OSZ), **· 2 OSZ**, **· ANSCHLAG**.
- **K1-Mod-Übersicht:** `SQBM.routes(bm)` liefert jede Route aus §1.9 genau einmal (V, MW, AT, LFO1, LFO2, Masken-Δ je Osz., Tonhöhen-Δ,
  Filter-Hk, PANS; bei SCHICHT/SPLIT auch Programm B); `bmRouteClear(t, k)` setzt die Menge auf 0 (ein Undo).
- **Hilfe:** 8 Zeilen mit `BM_NAME` (Masken, Bits/Karte, Masken-Hüllkurve, Spielweisen, Schicht/Split, Arp, Effekte, VERKNÜPFT).
- **perfProbe:** Fall `'bm'` (10 Stimmen + FX1 CH4 + FX2 RV3 auf einem Knoten): `voices, fx, load_med, load_max, reports, frames_ok, fps_med`.
- **Test-API:** `bmGet, bmSet, bmRender, bmScope, bmInfo, bmMask, bmVoices, bmReady, perfProbe(['bm'])`, dazu `bmRoutes, bmRouteClear,
  bmInit, bmName`.
- **Platzhalter-Seite** (bis BM5): Reiter „Bit Mask │ FX“; die Seite zeigt nur Name, Masken von OSC1/OSC2, Filter und die Routen.

## Abnahme BM6 (mit Platzhalter-Prozessor)
Tests in `bau/helfer/BMU/tests/` (Aufruf `node <test> [index.html] [vs-base-B.html]`), Ergebnisse in `*.out.json`.

| ID | Ergebnis | Nachweis |
|---|---|---|
| BM6-01 Regel 28 | ✓ | `bm6-golden`: Worklet-Quelle `sq-worklet-src` byte-gleich (305 467 Zeichen); 71 Werks-Klänge + Kits normiert deep-equal; Demo-Datei und Rundreise gleich; Offline-Render aller 59 Werks-Klänge VA/FM/MS 2000: 58 bitgleich, 1 schwankt alt-gegen-alt genauso (Zufallsphase); ohne Bit-Mask-Klang 0 × `synq-bm`, 0 Worker, Block nicht ausgewertet; Start 509 ms neu / 513 ms alt (Median 9); Seite +23,0 KB beim Start (+22,7 KB Block bei Bedarf, gesamt +45,7 KB) |
| BM6-02 Engine-Wahl | ✓ | `bm6-shots` (7 Formate, Kopf ohne Überlauf, Treffer 44, Namensfeld wie VA) · `bm6-store`: VA → BM → VA je 1 Undo, VA-Felder deep-equal, `p.bm` gemerkt, unberührtes INIT weg · `bm6-int`: Wechsel mit gehaltener Taste → Stimme im neuen Knoten, M-KLICK (HF-Fenster) −0,2 dB |
| BM6-03 normBm, Speichern/Laden | ✓ | 1000 Zufalls-Programme: 0 Bereichsfehler, 7267/7267 unbekannte Schlüssel erhalten, idempotent; Projektdatei, Projektwechsel, Spur-Kopie, Bibliothek sichern/duplizieren/laden, Klang-Datei: deep-equal |
| BM6-04 Zeit | ✓ | offline 16 × 1/16: Einsatz ±0 Samples; live 32 Takte (240 BPM): `late` 0, 278 Noten; Notenplan, Tasten, ●, FANG, Eine Skala gleich wie VA |
| BM6-05 Stopp/Panik, Mute | ✓ | Panik: nach 50 ms −300 dB (still); ■: weicher Ausklang, nach 300 ms still; Mute: keine Clip-Note, Knoten still |
| BM6-06 Offline = live | ✓ teilweise | `bmRender` zweimal bitgleich; Echtzeit-Mitschnitt gegen Offline Korrelation 1,000. **Video-Render (VV)** gibt es in der Basis nicht → beim Zusammenführen mit VV erneut |
| BM6-07 ohne Worklet | ✓ | `?engine=native`: −32 dBFS, ECO-Zeichen + Toast, kein Knoten, keine Konsolenfehler. DoD-Suite liegt nicht im Repo |
| BM6-08 ältere Version | ✓ | 4.23.0 öffnet ein Bit-Mask-Projekt: gesperrt, Leiste sichtbar, Spur spielt INIT; zurück deep-equal (s. Abweichung 6) |
| BM6-09 Bibliothek | ✓ | Engine-Chip, Kategorien (mit Probe-Zeilen je Rolle), Werk nicht löschbar, eigener Klang nach Neuladen da |
| BM6-10 Mod-Übersicht | ✓ Daten | INIT 0 Routen; 10 Quellen je genau einmal; [✕] = 1 Undo, Undo stellt her; Programm B mitgelistet. Die Übersicht selbst (K1) ist nicht in der Basis, „hörbar“ erst mit dem echten Prozessor |
| BM6-11 perfProbe | ✓ | Fall `bm` mit allen Feldern, 10 Berichte; Last 0 (Platzhalter meldet keine Last) |
| BM6-12 Supabase, Hilfe, Regression | ✓ | 0 Supabase-Anfragen; 8 Hilfe-Zeilen; „MS 2000“ 1×; Smoke ohne Fehler; Regression bestehender Suiten s. unten |

## Abweichungen / Ergänzungen
1. **Nachrichten additiv** (ein Prozessor ohne sie funktioniert weiter): `id` in `on`/`off` (der Platzhalter gibt es in `end` zurück;
   ohne `id` nimmt der Host die älteste losgelassene Stimme der Note), `tau` (schnelles Lösen einer Stimme, Klau/■) und `kill`
   (noch nicht begonnene Note; `at` = ihr Start, also nie hängend) in `off`; `{t:'rt', list:[{n, to, at, tau, id}]}` (⇅/Eine Skala auf
   klingenden Noten); `{t:'lim', level}` (Begrenzer §2.6); `{t:'bpm', bpm}` (Tempo ohne LFO-Neustart; `tr` trägt zusätzlich `bpm`).
   **Für helfer-bmk:** diese sechs Felder bitte im echten Prozessor verstehen.
2. **Worker** (`synq-bm-tab`) gehört zu BM1 und ist hier nicht gebaut; `bmInfo().worker` zählt ihn, sobald BM1 ihn startet.
   `bmMask` rechnet bis dahin im Haupt-Faden aus der Regel §1.2 (gleiche Felder).
3. **Seitengröße:** gemessen wie beim MS 2000: was beim Start gelesen wird, +23,0 KB (Budget 25); der Block `sq-bm-src` (+22,7 KB, davon
   ≈ 5,4 KB Platzhalter) zählt als „bei Bedarf“. Gesamt +45,7 KB. Das BM6-Budget „+10 KB“ in §6/§7 ist damit überschritten (Datenteil
   mit allen Listen ≈ 10 KB, Haken + Host ≈ 12 KB, Hilfe/INIT ≈ 3 KB).
4. **Räder** auf Bit-Mask-Spuren laden den Block `sq-mk-src` (dort liegt das Rad-Bauteil aus MK1).
5. **🎲 Zufall** auf einer Bit-Mask-Spur ändert nichts (LCD „ZUFALL kommt mit dem Editor“), damit keine unhörbaren VA-Werte verstellt werden.
6. **Sperre in der älteren Version** greift nur, wenn die Datei eine neuere `appVersion` trägt. In diesem Zweig bleibt VERSION 4.23.0;
   der Test stellt die Veröffentlichung mit `appVersion 4.30.0` nach. Bei gleicher Nummer behandelt 4.23.0 `bm` als entfernte Engine
   (spielt INIT, Klang bleibt in der Datei erhalten, aber ohne Sperre) – **der Dirigent muss beim Zusammenführen eine neue VERSION vergeben**.
7. **Fremder Marken-Text:** Der alte FM-FELD-Hinweis nannte „EssenceFM von Kodamo“ → jetzt „eines FM-Geräts mit Operator-Raster“
   (einzige Text-Änderung außerhalb der Pakete; Marken-Regel).
8. **Name nach Engine-Wechsel** bleibt der des Klangs (wie beim Wechsel zu MS 2000); „INIT Bit Mask“ heißt ein Klang über Init/Bibliothek.
9. **Layer-Bereiche [A]:** `ly.semi` −48…+48, `ly.pan` 0…100, `ly.tune` −50…+50 Cent, `ly.sp` 0…127 (Spec nennt nur die Felder).

## Regression bestehender Suiten (alt 4.23.0 gegen neu, unabhängiger Lauf)
Jede Suite besteht in NEU genau dieselben Fälle wie in ALT, mit denselben Meldungen; keine Konsolenfehler nur in NEU:
gmk8b-reg 18/18 · gmk8b-panik 14/14 · gmk8b-cross 12/12 · gmk567-keysync 4/4 · gs7-v3-qa-vs4-reg 15/15 · gs7-v3-qa-vs5a-reg 13/13 ·
gs7-v3-vs5b-reg-t2 21/21 · gs7-v3-qab5b-song 3/3 · v3-mk8b-smoke ohne Fehler · gmk8b-daten (128 Micro-Klänge) byte-gleich.
Schon in ALT rot und in NEU gleich: gs7-v3-qab5b-fang 5/7, v3-qa-gmk7-undo 10/15, gmk567-cross (passt nicht zu 4.23.0).
(Lauf vor den 4 Prüfer-Fixes; diese ändern nur Bit-Mask-Pfade.)

## Unabhängige Nachprüfung (Fixes)
Ein zweiter, unabhängiger Prüflauf fand 4 Punkte, alle behoben und mit seinen Skripten nachgetestet: (1) beim Engine-Wechsel verloren
vorausgeplante Clip-Noten ihr Ende (klangen bis zum GC-Netz) → das geplante `off` geht mit in den neuen Knoten; (2) der **erste**
Wechsel auf Bit Mask (Modul noch nicht geladen) schnitt gehaltene Tasten ab → der alte Knoten bleibt, bis das Modul da ist (≈ 10–50 ms),
dann wandern die Tasten; (3) `end` mit `id` erklärt keinen fremden Proxy mehr für tot; (4) `perfProbe` wertet `sq-bm-src` nur für den Fall `'bm'` aus.

## Fragen an Xander
1. Bit-Mask-Knopf im Kopf: zweizeilig „Bit / Mask“ wie „MS / 2000“ – so in Ordnung?
2. Platzhalter-Seite bis zum Editor (Name, Masken, Filter, Routen) – reicht das, oder lieber ganz leer?
3. 🎲 auf Bit-Mask-Spuren bis zum Editor: nichts tun (so gebaut) oder ausblenden?
4. Die Bereiche von SCHICHT/SPLIT (SEMI ±48, PAN 0–100, TUNE ±50 ct) – passt das?

## Für das Zusammenführen
- **Blöcke:** `<script>` mit `BM_NAME` + `G.SQBM` (direkt nach `G.SQMK`) · `/* ---------- BM6 … Bit Mask on the main thread` (vor dem MK1-Haupt-Faden-Block)
  · `<script type="text/plain" id="sq-bm-src">` (nach `sq-mk-src`) · CSS-Zeile `button.bm2`.
- **helfer-bmk ersetzt** im Block `sq-bm-src` den Teil `/* BM-STUB … */ … /* Ende BM-STUB */` (Konstante `BM_WK`, ASCII, `registerProcessor('synq-bm')`);
  Worker/Tabellen: Start in `bmEnsure` (BMX.workers zählen), `bmMask`/`bmInfo` auf die Worker-Werte umstellen.
- **BM5** ersetzt `bmPage` (im Block `sq-bm-src`) und den Reiter-Satz `[['bm', BM_NAME], ['fx', 'FX']]` in `buildSynthEd`.
- **BM7** hängt Werks-Programme mit `engine:'bm'` und `role` (bass, lead, pad, keys, brass, pluckg, organ, fxarp) an die Werksliste.
- **Einzeilige Haken** in: `normSynthP`, `SYNTH_ENGINES`, `ENGINE_LABEL`, `ENG_OF/ENG_API`, `setEngineOf`, `setEngine`, `randomize`,
  `INIT_SYNTH`/`INIT_IDS`, `BROLES`/`brRoles`, `brPool`, `brScope`, `engChip`, `buildSynthEd` (Knopf, ECO, Reiter), `edHeadFit`, `fillSynthTab`,
  `ecoMsg`, `trackEco`, `syncEngine`, `rebuildNativeLfos`, `spawnVoice`, `spawnWkVoice`, `applySound`, `ensureAudio`, `applyProject`,
  `silenceAll`, `tailKill`, `pvChain`, `mkWheelFrame/Val/Sync/Set`, `NativeVoice.source`, Hilfe-Liste, `SYNQUENZER`.
- Tests: `bm6-golden.mjs`, `bm6-store.mjs`, `bm6-int.mjs`, `bm6-shots.mjs` (+ Bilder `bm6-shots/`), `smoke.mjs`.

## Bitte prüfen (Xander, iPhone)
1. Synth-Spur öffnen → Kopf: Knopf **Bit Mask** (bzw. Chip ▾ → Bit Mask). Taste spielen: Sinus (Platzhalter). Zurück auf VA: alter Klang.
2. Während eine Taste gehalten wird, Engine wechseln: der Ton reißt nicht ab, kein Knacks.
3. ▶ mit einer Bit-Mask-Spur, ■ (weicher Ausklang), ■■ (sofort still).
4. Bibliothek: „Bit Mask ▾“, INIT-Liste (INIT, 2 OSZ, ANSCHLAG), eigenen Klang sichern und wieder laden.
5. Ein altes Projekt öffnen: klingt wie vorher; Seite startet so schnell wie vorher.
