# CHANGES – MS 2000 (Nachtrag 3, Pakete MK0–MK13)

## MK0 — Vorab-Schutz: Klänge neuerer Engines bleiben erhalten · App 4.8.1 (`APP_CODE` 4 008 001) · Format bleibt 4

**Vorgänger-Stand** für alle „bitgleich/deep-equal“-Abnahmen: **4.7.0** (V2e-fix = `scratchpad/mk-base.html`, 2 523 180 B).
Parallel-Bau: Diese Kopie startet bei 4.7.0; V2e′ (4.8.0) entsteht gleichzeitig in `dirigent-wt` und wird später zusammengeführt.
Berührt wurden nur `SQStore` (Daten), Projekt-Laden/-Parken, Cloud-Speichern, Bibliothek, Synth-/Drum-Editor-Seite, Browser-Zeile,
Hilfe, CSS (`#nvBan`, `.nvp`), `VERSION`. Kein Song-/Drag-&-Drop-Code. Worklet unverändert (byte-gleich).

### Gebaut
1. **Undurchsichtige Sounds** (`SQStore.normalizeSound`): Engine-Kennung, die diese Version nicht kennt (`/^[a-z][a-z0-9_-]{0,23}$/`,
   nicht in `ENGINES`) → der Sound bleibt **wie er kam** (alle Felder, auch `p`, `mods`, `fx`, `bank`, `slot`, `loc` …; nur eine
   ungültige `id` wird `null`, ein unsauberer Name gesäubert; Grenze 256 KB je Sound). Neu exportiert: `NV_NAME`, `isForeign`, `nvOf`, `verCode`.
   `soundHash` rechnet über das Original.
2. **Spur spielt INIT mit Hinweis** (`nvWrap`): Auf der Spur liegt INIT VA (Drum-Spur: INIT Drums) mit dem Namen
   „Klang aus neuerer Version“; das Original hängt unsichtbar daran (`_nv`) und **jede JSON-Kopie** (Autosave, Datei, Undo,
   Server, `getSound`) ist das Original (`toJSON`). Gilt in `normTrack`, `applySound`, `applyDrumSound`, Vorhören.
   Editor: statt der Regler eine Hinweis-Seite („… spielt hier als INIT und bleibt, wie er ist“, [Anderer Sound] [Neu laden],
   Treffer 44 px); Engine-Wahl und 🎲 werden mit Toast abgelehnt. Bibliothek: eigene Sounds neuerer Engines stehen in jeder
   Engine-Auswahl unter „Eigene/Alle“ mit „Klang aus neuerer Version“ und Kürzel NEU; Laden in eine Spur behält das Original;
   Löschen wird abgelehnt (würde sonst über `save_library` online verschwinden).
3. **Überschreib-Sperre** (`NV.lock`): Ein geöffnetes Projekt gilt als „aus neuerer Version“, wenn sein Format über 4 liegt
   oder es einen Sound unbekannter Engine enthält und der Schreiber neuer/unbekannt ist (Schreiber = `appVersion` der Datei bzw.
   neues Feld `app` im Autosave-Schnappschuss; ein selbst geschriebenes Projekt mit solchem Sound sperrt nicht). Dann:
   - Autosave schreibt nicht (`Autosave({hold})`), auch keine Rettungskopie (pagehide), kein Verlauf;
   - beim Verlassen wird die KV-Kopie **unverändert** nach `proj:<id>` geparkt (`nvPark`), nie unsere Fassung; eine geparkte,
     Cloud- oder Raum-Kopie bleibt, wo sie ist; „Ältere Version“ und „Zurückholen“ werden abgelehnt (würden darüberschreiben);
   - kein `save_project` für dieses Projekt, und überhaupt keins für einen neueren Stand (KV oder geparkt, `cloudFileText`);
   - Server-Stände einer neueren Version, die geparkt werden (Start-Abgleich, Pull, „Beide behalten“), werden **wie geliefert**
     geparkt (`nvFo`), nicht in unserer Fassung;
   - Hinweis-Leiste unter dem Kopf (L9): „Aus einer neueren SYNQUENZER-Version: Damit nichts verloren geht, speichert diese
     Version das Projekt nicht.“ [Neu laden] [✕].
4. **Bibliothek online**: kein `save_library`, wenn die Online-Bibliothek ein höheres `SOUNDS_FORMAT` hat oder ein Sound
   unbekannter Engine aus ihr hier fehlt (Toast). `save_project` (VO-R1) unverändert.
5. Alle Lade-Wege: Datei-Import (`parseFile` merkt Format + Schreiber), `projFromFile` (Cloud, Projektwechsel), `Autosave.load`,
   `Library.load`, `cloudLibMerge`, Paar-Raum (Pull ins offene Projekt).
6. Hilfe-Zeile „NEUERE VERSION …“ (L10). Test-API `nvState()`.

### Abnahme (Playwright, Chromium 1243)
`dirigent-test/v3-mk0-schutz.mjs` (App unter der Pages-Adresse per `context.route`, Fake-Supabase im Browser + Node-Speicher,
`save_project`/`save_library` als echte `fetch` an die geroutete Adresse; nichts verlässt die Maschine): **47/47**.
`v3-mk0-gleich.mjs` (4.7.0 gegen 4.8.1): **10/11** (rot nur Budget). `v3-mk0-layout.mjs`: **24/24**. `v3-mk0-perf.mjs`: **10/10**.

| ID | Ergebnis |
|---|---|
| MK0-01 | ✓ Projekt: Sound `xyz` (mit fremden Feldern) über `setSound` → `getSound` deep-equal; Spur spielt INIT (Analyser-Spitze 0,12; im ECO 0,73), Name/Label „Klang aus neuerer Version“; Speichern → Neuladen deep-equal; Datei-Rundweg deep-equal; Ersetzen + Undo deep-equal; Engine-Wechsel/🎲 abgelehnt; Editor-Hinweisseite. Bibliothek: Import → Neuladen deep-equal, Zeile mit Hinweis + NEU, Vorhören läuft, Laden in Spur behält Original, Löschen abgelehnt. Cloud-Bibliothek (Fake): zusammengeführt deep-equal, `save_library` trägt den Sound deep-equal, Neuladen deep-equal. Keine Konsolenfehler. |
| MK0-02 | ✓ KV Format 5 (mit `mkIn`, fremdem Sound, neuem Feld): Sperre, Leiste (Knöpfe 44 px); Bearbeiten + `save()` + pagehide → KV-Kopie deep-equal, keine Rettungskopie; Neues Projekt → Kopie unverändert unter Projekte (Format 5), Sperre/Leiste weg; erneut geöffnet → gesperrt, geparkte Kopie bleibt. Format 4 + `xyz`: Schreiber unbekannt bzw. 4.9.0 → gesperrt, KV unverändert; Schreiber 4.8.1 → frei, geschrieben, Sound deep-equal. Cloud (Fake, 4.9.0, Format 5): geöffnet → gesperrt + Leiste; zweites Server-Projekt roh geparkt (Format 5, neues Feld da); 0 `save_project`, KV nicht damit beschrieben, Server unverändert. Paar-Raum: Partner-Stand (4.9.0) ins offene Raum-Projekt → gesperrt + Leiste, Sound erhalten; 0 `save_project`, KV-Kopie deep-equal. Bibliothek: Sound fehlt hier → `newer`, kein `save_library`, Toast; Online-Format 2 → kein `save_library`. |
| MK0-03 | ✓ deep-equal gegen 4.7.0: Demo-Datei, `normalizeSound` (9 schräge Eingaben, alle Engines, `p.mk` an VA, fm2, NaN …), 66 Werks-/INIT-Sounds, Projektdatei mit schrägen Sounds (Projekt, Warnungen, Sounds), `normalizeProject`, Bibliothek (Inhalt + Hash), KV-Schnappschuss (nur Feld `app` neu). **65 Synth-Sounds offline durch das Worklet gerendert: bitgleich** (FNV über die Float-Bits; feste Rausch-Saat für das Worklet-`Math.random`, gleich für beide Stände). Worklet-Quelle byte-gleich. **Budget ✗: +6 933 B statt ≤ +4 096 B** (s. Abweichungen). |

DoD: keine Konsolenfehler (Laden, 60 s Demo mit `xyz`-Sound auf der spielenden Spur); PE1 P1 mit offenem Editor: 59,9 fps,
0 longtasks, tickErrors 0 (4.7.0 / 4.8.1 / 4.8.1 + `xyz` / + ECO gleich); Worklet-ASCII unverändert (byte-gleich); M-PLATZ
für Leiste, Hinweisseite und Bibliotheks-Zeile in P1, P2, P3, L1, L2, W (kein Überlauf, Treffer ≥ 44 × 44); Smoke-Test ohne Fehler.
Regression gegen 4.7.0 (Kopien der V2e-QA-Skripte `v3-mk0reg-{files,api,core,boot,audio}.mjs`): Dateien (DIRIGENT v2, Format 3,
Sichern/Wiederöffnen) gleich bis auf `appVersion`; API-Liste gleich (+`nvState`); MIDI/Log gleich; Audio-Pegel gleich (±0,5 dB);
Start 4.7.0 Median ≈ 577 ms, 4.8.1 ≈ 551 ms.
Bildschirmfotos: `dirigent-test/v3-mk0-shots/mk0-{banner,editor,browser}-{P1,P2,P3,L1,L2,W}.png`.

### Fach-Prüfung (N3 Teil F: FP-SICHER ● Haupt, FP-DSP Zweit; selbst durchgeführt vor der Abnahme)
- **FP-SICHER:** keine DB-Änderung, keine neue RPC/Policy, kein SECURITY DEFINER; kein `sb_secret_` (0); Herkunft/Token-Speicher
  unverändert; Versions-Wächter: `save_project` unverändert, zusätzlich lädt der Client nie einen neueren Stand hoch; `save_library`
  geschützt. Fremde Daten nur als Daten: undurchsichtige Sounds werden nur per `esc()`/Text angezeigt (Name gesäubert, Engine-Kennung
  per Regex begrenzt), nie ausgeführt; Größe je Sound ≤ 256 KB; `_nv`/`toJSON`-Schlüssel aus fremdem JSON werden entfernt (kein
  Vortäuschen einer Hülle). Markenwort-Prüfung B.6 Nr. 9: ganze Datei `micro ?korg|radias|dwgs` = 0, `ms[ -]?2000` = 0 (die eine
  erlaubte Fundstelle `MK_LABEL` kommt erst mit MK1), keine neue `@font-face`, keine Bild-Daten. Upload-Wege geprüft: Server-Autosave,
  `save_library`, Parken, Teilen/Paar-Raum (Pull). `mkLocalStrip` entfällt (MK9 zurückgestellt). **Befunde: 3, alle behoben**
  (1. ✕ der Leiste nur 41 px breit → 44 px; 2. Löschen eines fremden Bibliotheks-Sounds hätte ihn per `save_library` online
  entfernt → abgelehnt; 3. „Ältere Version“/„Zurückholen“ bei gesperrtem Projekt hätten die neuere KV-Kopie überschrieben → abgelehnt).
- **FP-DSP:** kein DSP-Code berührt; „Aus = bitgleich“ per Offline-Render aller 65 Synth-Sounds bestätigt; Worklet byte-gleich (ASCII-Prüfung
  unverändert); nativer Rückfall: die INIT-Hülle spielt im ECO hörbar; Klangwechsel auf/von einer Hülle laufen über den vorhandenen
  `applySound`-Weg (gleiche Blenden wie jedes Preset-Laden). **Befunde: 0.**

### Abweichungen
- **Budget +6,8 KB statt +4 KB (+69 %).** Grund: Neben der Sperre selbst brauchen alle Wege eine Wache, die die Spec nennt (KV,
  Rettungskopie, Parken beim Wechsel, Cloud-Push, geparkte Pulls, Bibliothek mit Format- und Hash-Wache), dazu Hinweis-Leiste,
  Editor-Hinweisseite, Bibliotheks-Zeile und Hilfe-Zeile. **Schlankheits-Vorschlag:** (a) Die Ausnahme „selbst geschriebenes Projekt
  mit fremdem Sound sperrt nicht“ (Feld `app`, ≈ 0,4 KB) und die Formatwache der Bibliothek (≈ 0,2 KB) könnten entfallen; (b) SL1
  (E.3a) packt den Hauptteil ohnehin.
- **Schreiber-Ausnahme (eigene Festlegung):** Ein Projekt mit Sound unbekannter Engine, das diese Version selbst geschrieben hat
  (z. B. nach Laden eines fremden Bibliotheks-Sounds), sperrt nicht – unser Schreiben ist für solche Sounds verlustfrei. Schreiber
  unbekannt (alte Schnappschüsse, Dateien ohne `appVersion`) = gesperrt.
- **Manueller Datei-Import** eines neueren Projekts sperrt ebenfalls (die Datei bleibt die Quelle; Leiste sagt es).
- `NV.lock` hängt am geöffneten Projekt; eine Cloud-/Raum-Kopie bleibt auf dem Server; lokal liegt dann keine Kopie davon (die
  App öffnet nach dem Neuladen das vorher offene Projekt).

### Lücken
- Änderungen an der INIT-Hülle außerhalb des Editors (z. B. Lautstärke/Pan der Spur über Regler, die `sound.fx` ändern) wirken
  hörbar, werden aber nicht gespeichert (das Original bleibt). Der Editor zeigt statt der Regler die Hinweisseite.
- Unbekannte **Felder** in Sounds bekannter Engines (z. B. `p.mk` an einem VA-Sound, `bank`/`slot` aus MK8) fallen wie bisher weg
  (MK0-03 verlangt Gleichheit mit dem Vorgänger). Projekte im Format 5 sind gesperrt; die Online-Bibliothek im neueren Format wird
  nicht überschrieben.
- Stände vor 4.8.1 verwerfen weiter (Risiko laut Spec): `max_format` 5 erst nach Auslieferung von MK0 (E.5 Nr. 2).

### Datenbank
Keine Änderung nötig (Wächter `max_app` 4 021 000 / `max_format` 5 laut Orchestrator gesetzt).

### iPhone-Prüfpunkte (Xander)
1. Nichts ändert sich sichtbar, solange kein Projekt aus einer neueren Version geöffnet ist (Start, Projekte, Online).
2. Später, wenn MK1 (4.9.0) ein MS-2000-Projekt gespeichert hat und die Seite aus Versehen den alten Stand zeigt: oben steht die
   orange Leiste; [Neu laden] holt die neue Version; danach ist das Projekt unverändert da.
3. Menü → Hilfe zeigt die Zeile „NEUERE VERSION …“.

### Geräte-Abgleich
Entfällt (kein Klang).

## MK0-fix — Überschreib-Sperre auf allen Wegen · App bleibt 4.8.1 · Format bleibt 4

### Behoben (5 bestätigte Fehler aus der Abnahme/Fach-Prüfung)
1. **Kritisch – Partner-/Server-Stand ins offene Projekt (cloudPull, Paar-Raum „Laden“, Realtime, cloudResolve „Übernehmen“):**
   Bisher wurde gesperrt angezeigt, aber nichts gespeichert, und trotzdem rückte `meta.base` vor. Nach einem Neustart ging dann
   die alte Kopie entsperrt auf, und 4.9.0 (nach [Neu laden]) überschrieb mit `p_base 2` den neueren Stand. Jetzt landet das
   Original des neueren Stands unverändert im Autosave-Platz (`nvStoreKv`). KV und Meta nennen also dieselbe Version, und nach
   einem Neustart ist das Projekt wieder gesperrt, mit Leiste. `cloudApply` meldet, ob gespeichert wurde. Nur dann ziehen
   `done()`/`fin()` die Meta nach; sonst bleibt `base` stehen und der Stand wird später neu geholt.
2. **Neueres Cloud-Projekt auf einem frischen Gerät:** Das Projekt liegt jetzt im Autosave (Sperre `kv:true`). [Neu], [Neu laden]
   und Neustart verlieren es nicht mehr: Beim Verlassen wird es unverändert unter Projekte geparkt. Lässt es sich nicht
   speichern, wird seine Meta gelöscht, damit der Abgleich es als „fehlt“ wieder holt.
3. **Projekte → Umbenennen** eines geparkten neueren Projekts ändert nur noch den Namen im gespeicherten Original (Format 5, neue
   Felder und Sperre bleiben). Beim offenen gesperrten Projekt geht der Name ebenfalls nur ins Original.
4. **Datei-/Sicherungswege:** Als Datei sichern, `serialize`, Alles sichern, Sicherung öffnen, Export aus Projekte, Kopie (Projekte),
   „Kopie in Nur ich“ und Viewer→Safari geben ein neueres Projekt **so weiter, wie es kam**: eigenes Format, Felder und
   Versionsstempel, nur id/Name angepasst, Prüfsumme neu berechnet. Wieder geöffnet ist es gesperrt, mit Leiste.
5. Geparkte neuere Projekte lösen kein `cloudOnPark` mehr aus (keine Hochlade-Markierung, die nie hochgehen darf).

Technik: `SQStore.parseFile` und `Autosave.load` hängen das Original nicht aufzählbar an `_newer.fo`. `normalizeProject` reicht es
weiter, und `applyProject` legt es als `NV.raw` ab. `projectFileObj(S)`, `nvPark`, `nvFo`, `renameProject`, `duplicateProject`,
`exportProjectById` und `importBackup` benutzen es. Eigene Projekte (nicht neuer) laufen unverändert über den alten Weg.

### Proben
- `v3-qa-mk0-acc.mjs` 20/20, `v3-mk0-schutz.mjs` 47/47. Drei Prüfungen dort beschrieben die alte, fehlerhafte Erwartung
  („KV nicht geschrieben“, `kv:false`); sie prüfen jetzt „KV = Original unverändert, Meta nennt diese Version“. Die alte Datei
  liegt als `v3-mk0-schutz.pre-fix.mjs` daneben.
- `v3-mk0qa/t1-pull.mjs` mit `emu490-fix.html` (aus diesem Stand: nur VERSION 4.9.0 und Format 5): T1a, T1d, T1e und T1f PASS.
  T1b/T1c prüfen die verworfene Variante „Meta bleibt stehen“. Hier gilt die andere erlaubte Variante: KV hält den Stand,
  den die Meta nennt (bpm 133, base 2).
- `t2-missing` 3/3, `t4-paths` T4b/T4b2 PASS (T4a = eigener Befund Verlauf, offen), `t5-backup` 1/1, `t6-drum` 5/5;
  `t3-crafted` gleich wie vorher (eigene Befunde).
- `v3-repro-mk0base` (A/B), `v3-repro-nvcloud-indep` (T3/T7/Reload), `v3-repro-nvrename-indep`, `v3-verify-t1-direct` 2/2,
  `v3-mk0repro-nvpaths` 8/8; neu `v3-mk0qa/v3-mk0fix-take.mjs` 9/9 (Übernehmen + misslungenes Speichern → base bleibt).
- Regression `v3-mk0rg2-cloud/store/nostore/legacy/files/flow`: gleich wie vorher (nur zufällige ids und Zeitrauschen). Smoke ohne Fehler.
- Größe +4,7 KB gegenüber MK0.

### Am Server offen
- Nichts. Kein Supabase-Aufruf, keine Datenbank-Änderung.

## MK1 — Kern-Engine „MS 2000“ (eng 3), Bedienfeld, Räder · App 4.9.0 (`APP_CODE` 4 009 000) · Format 4 → 5 · `SOUNDS_FORMAT` 1 → 2

**Vorgänger-Stand** für alle Gleichheits-Abnahmen: **4.8.1** (MK0-fix = `synq-snapshots/MK0-fix.html`, 2 534 778 B).
Parallel-Bau in `mk-wt` (nicht `dirigent-wt`); kein Song-/Drag-&-Drop-Code berührt. Neu bzw. geändert: Worklet `dirigent-analog`
(neue Klasse `MkCore` zwischen `/*MK{*/ … /*}MK*/`, W-Tabelle `MKW` zwischen `/*MKW{*/ … /*}MKW*/`, Weiche in `AnalogCore`),
`SQMK` (Daten, immer geladen), Haupt-Faden-Helfer (Räder, ECO-Bild, `mkRender`, Laden des Blocks), Block `sq-mk-src` (Bedienfeld,
Leistungs-Probe; erst bei Bedarf ausgewertet), Synth-Blatt (Reiter, Kopf), Hilfe, Test-API. Quellen der Bausteine:
`scratchpad/mk1work/{mkcore,sqmk,mkmain,mkui}.js`, Einbau `build.sh` (`integrate1.py`, `patch-main.py`, `patch-ui.py`).

### Gebaut
1. **Daten (B.1):** Engine `mk`, `p.mk` mit `SQMK.normMk` (klemmt, rundet, feste Schlüssel-Reihenfolge, EQ in 0,5er-Stufen, `usc` nur
   bei Stimmung 9, `vmax` 4│8), Format 5, `SOUNDS_FORMAT` 2, **INIT MS 2000** (`f-init-am`, Pegel wie INIT Analog), `setEngineOf`
   (Engine-Wechsel behält `p.mk`; ein unberührtes INIT-`p.mk` wird beim Wechsel weg aufgeräumt), `ENGINE_LABEL.mk = MK_LABEL`,
   Engine-Listen im Browser, MIDI-Spurname. `MK_LABEL = 'MS 2000'` ist die **einzige** Fundstelle in der Datei.
2. **Klangerzeugung `eng 3` (Worklet, B.2/B.4, W-01 … W-26):** 2 Oszillatoren (Säge mit Form `saw(2φ)`, Puls mit Breite/PWM, Dreieck
   mit Form `tri(3φ)`; polyBLEP/polyBLAMP), OSZ 2 Säge/Rechteck/Dreieck mit Halbton und Fein-Kurve W-14, OSC MOD aus/Ring/Sync/
   Ring+Sync (Sync über den vorhandenen Slave-Weg mit einem Takt Versatz), Rauschen (eigener Generator je Note), Mixer, Ladder
   (Abgriffe 24LPF/12LPF/12BPF/12HPF, Eingang × 0,25, winziger Rausch-Keim für die Selbstoszillation), Verzerrung nach dem Filter
   mit ADAA (Stammfunktion der App-eigenen tanh-Näherung), Verstärker mit HK │ GATE (1 ms / 3 ms), Pegel/Pan/Anschlag/Keytrack,
   EG1/EG2 mit NEUSTART, LFO1/LFO2 (Säge, Rechteck bzw. Rechteck(+), Dreieck/Sinus, S/H; Key Sync aus/Timbre/Stimme; Tempo Sync an
   der Song-Position), Vibrato × MOD-Rad, BEND, Portamento (t90 = W-13), Stimmen: Poly 4 (Begrenzer-Stufe 2: 2), Mono, Unison 4
   (W-15), Priorität Last/Low/High mit zurückgestellten Tasten, Auslösung Single/Multi, Stehlen mit 5-ms-Blende.
   Umschalten: stetige Werte 5 ms geglättet und als **Bruchwerte** während der Geste (EN3-03); Struktur-Schlüssel (Wellen, OSC MOD,
   Filtertyp, HK │ GATE) per 30-ms-Überblendung mit Pegelausgleich (Port von `sxMix`); Zuweisung/Priorität/Auslösung per
   `engXf`-artiger Neuverteilung; Engine-Wechsel zu/von eng 3 mit Übergabe gehaltener Tasten (`mkEng`, `handOver`/`adopt`).
   Zufall je Note = Hash(Seed, Timbre, Zähler); der Seed wird erst bei der ersten AM-Note gezogen (VA bleibt bitgleich).
   Protokoll `{mk}`, `{mkSet}`, `{mkWheel}`, `{mkSeed}`, `{mkScope}`, `{mkTap}` (Test), `processorOptions.mk`; VA-/FM-Nachrichten unverändert.
3. **ECO (B.5):** `SQMK.mkToFlat` bildet einen AM-Sound auf die flache VA-Fassung ab (NativeVoice); Badge wie bisher.
4. **Bedienfeld (B.3, Block `sq-mk-src`):** Zonen Z1–Z13 nach der Referenz-Skizze, Holzwangen (CSS), Kappen-Regler, Drehschalter
   EDIT-WAHL 1/2 (11 Stellungen, Ziehen rastet je 18 px, Tipp = Matrix-Liste), Matrix-Zeilen, LED-Tasten, 3-stellige 7-Segment-Anzeige
   (eigene SVG-Zeichnung), SHIFT-Ebene 2, SHIFT-Funktionen (OKT ±1 Wert, SEITE = andere Wahl, 3 = Init), OKT ▼/▲ (`tr.kbOct`),
   ORIGINAL-LED, Nummerntasten (Programme der Seite B = eigene AM-Sounds A–Z), WRITE = Sichern, 🎲 (hörbar, Mixer ≥ 64), ◎.
   EDIT-WAHL 2 und die Ebene-2-Plätze späterer Pakete sind dunkel mit Paketnamen. Formate: L1 ganz (720 × 136, ×1,0 … ×1,1, W ×1,13),
   P1 zwei Hälften (360 × 280), Halb-Ansicht quer (L2, iPhone 12/13 mit Home-Balken) und hoch (P2, P3) mit Reitern [LINKS] [RECHTS] [FX].
5. **Räder (B.3, H-5):** BEND (federt in 80 ms zurück) und MOD links in `#kbArea`, nur bei AM-Spuren, eigener Zeiger je Rad,
   nichts gespeichert, kein Undo.
6. **Kopf (B.3 Zeile 1, H-4, H-13 Vorgabe):** vierter Knopf „MS 2000“ (einzeilig wo Platz, sonst zweizeilig), 36 px breit, 4 px
   Abstand, Treffer 44 px senkrecht über `::before`; wo der Spurname sonst unter 40 px fiele (P1, P2, P3), der Engine-Chip
   „VA ▾“/„MS 2000 ▾“ mit Liste (4 Zeilen à 44 px). Querformat: wenn die 40-px-Kopfzeile nicht reicht, erst „MS 2000“ zweizeilig,
   dann (Safe-Area am iPhone) „▶ Hören“ ohne Wort – wie die schon bestehende Regel unter 760 px.
7. **Leistungs-Probe (B.4):** Menü → Info → [Leistungs-Probe]: 4 Probe-Engines × 4 Stimmen hinter einem 0-Gain-Anschluss, 10 s, JSON
   (Kopieren / Als Datei über `deliverNow`), [Abbrechen]. Test-API `perfProbe`.
8. **Start (EN3-14):** `sq-mk-src` wird erst bei Bedarf ausgewertet (AM-Sound im Projekt beim Laden, Engine-Knopf, Probe), vorher
   `tickAhead(.3)`.
9. **Hilfe** (6 Zeilen), **Test-API** `mkGet`, `mkSet`, `mkRender`, `mkScope`, `mkInfo`, `mkWheel`, `mkPanel`, `perfProbe`.

### Fach-Prüfung (N3 Teil F: FP-DSP ● Haupt, FP-TOUCH und FP-IPHONE Zweit; selbst vor der Abnahme)
- **FP-DSP** (`v3-mk1-fpdsp.mjs`, `v3-mk1-dsp.mjs`, `v3-mk1-gleich.mjs`): W-Tabelle eine Quelle (nur im Worklet-Text, der
  Hauptfaden wertet genau diesen Text aus); „Aus = bitgleich“: alle 65 VA/FM/WT-Werks-Sounds offline bitgleich zu 4.8.1;
  Extremwerte (alle Regler max bzw. min, je Filtertyp, 4-Stimmen-Akkord C8 bzw. Unison, Räder bewegt) 20 s ohne NaN/Inf;
  Denormale: 60 s Stille nach Vollaussteuerung je Filterweg (gehaltene Note, Mixer 0) – Fensterlast nicht über der ersten Sekunde;
  Worklet-ASCII; M-KLICK/M-EINBRUCH bei allen Umschaltungen (MK1-18); CPU je Stimme (MK1-24); nativer Rückfall (MK1-23).
  **Befunde: 4, alle behoben:** (1) **ADAA-Startwert**: `dF` begann bei 0 statt F(0) → beim ersten Sample mancher Noten mit
  VERZERR. ein Spike bis +68 dBFS (nur bei starkem Eingang im ersten Sample, z. B. 12HPF/12BPF) → Startpaar (0, F(0));
  (2) **S/H-Zähler** stand versehentlich in einem Kommentar (`lctr` undefiniert → S/H lieferte immer denselben Wert) → behoben, MK1-15
  1280 Werte; (3) Glättung `smStep` lief jeden Block über alle Werte (for…in, Allokation) → feste Felder, ruht, sobald alle Werte am
  Ziel sind; LFO-Raten einmal je Block → AM-Stimme von ≈ 1,4–2,0 × auf ≈ 1,0–1,2 × der VA-Stimme; (4) Ring+Sync-Ausrichtung
  geprüft (Gleichtakt der Master- und Slave-Sprünge verschlechtert die Faltung auf −30 dB, deshalb bleibt der Versatz; Rest siehe Lücken).
- **FP-TOUCH** (`v3-mk1-look.mjs`, `v3-mk1-ui.mjs`): M-SKIZZE (IoU je Zone = 1,000 in L1 mit Safe-Area 844 × 390 und 926 × 428),
  M-PLATZ und M-ANSICHT in 9 Formaten × 45 Zuständen, Trefferflächen, Kontrast 12,6 : 1, ein Undo je Geste, zweiter Finger, Zoom/
  Pinch/Textauswahl aus, Haptik `tick` beim Rasten. **Befunde: 7, alle behoben:** Klassen-Kollision `.dk` (globale App-Klasse,
  Matrix-Zellen 336 px breit) → `mdk`; SHIFT-Kurznamen auf den Nummerntasten liefen über („TIMBRE KOP.“) → „T-KOPIE“, „T-TAUSCH“,
  „T-NEU“; Beschriftung „EDIT-WAHL 2“ ragte in P/Halb-Ansicht 1–2 px aus dem Drehschalter → `box-sizing`; Kopfzeile quer mit
  Safe-Area lief über (✕ außerhalb, Namensfeld < 72 px) → zweistufige Verdichtung (s. Gebaut 6); Engine-Knöpfe quer nur 42 px
  Treffer (die obere Leiste liegt darüber) → Trefferfläche reicht 2 px in den Rand der LCD-Leiste; Holzwangen zu dunkel (L 9 %) →
  Holzton L 35–37 %, S 43–45 %, 24°; der Chip-Treffer (z-index) nahm Zeile 2 die oberen Pixel → Zeile 2 behält ihre Fläche.
- **FP-IPHONE** (`v3-mk1-perf.mjs`, `v3-mk1-probe.mjs`): Start, Dateigröße, PE1 mit offenem Bedienfeld, Probe ohne Netz und unhörbar,
  Abbrechen ohne hängende Stimme. **Befunde: 1, begründet:** Budget überschritten (s. Abweichungen). iPhone-CPU unbekannt → Probe.

### Abnahme (Node 22 Offline-Worklet bzw. Playwright/Chromium 1243)
Skripte in `dirigent-test/`: `v3-mk1-dsp.mjs` (MK1-04 … 18, 24) **63/64**, `v3-mk1-hear.mjs` (MK1-19) **53/53**,
`v3-mk1-format.mjs` (MK1-01, 01b, 02, 02b, 03, 28, 29, 30) **21/21**, `v3-mk1-ui.mjs` (MK1-20, 22, 31, 33, 34) **33/33**,
`v3-mk1-look.mjs` (MK1-21, 32) **88/88**, `v3-mk1-eco.mjs` (MK1-23) **6/6**, `v3-mk1-probe.mjs` (MK1-25) **7/7**,
`v3-mk1-perf.mjs` (MK1-26, 27) **6/7 (rot nur das Budget)**, `v3-mk1-proto.mjs` (MK1-18 Protokoll) **2/2**, `v3-mk1-fpdsp.mjs` (FP-DSP) **14/14**,
`v3-mk1-gleich.mjs` (MK0-03 gegen 4.8.1, Vergleich je Sound-ID) – Klänge bitgleich, Unterschiede nur durch Format 5 / `p.mk` / INIT AM.

| ID | Ergebnis |
|---|---|
| MK1-01 | ✓ normMk: 1000 Zufalls-Patches geklemmt/ganzzahlig, Fremdschlüssel weg; Speichern → Laden deep-equal, `soundHash` stabil; VA → AM → VA: Hash gleich, VA bitgleich, ein Undo; „MS 2000“ in Blattkopf, Label, Browser, MIDI-Spurname |
| MK1-01b | ✓ Kalt-Start: `p.mk` deep-equal, Block nicht ausgewertet (`mkInfo().loaded` false) |
| MK1-02 | ✓ neue Projekte Format 5; Format 3/4 laden deep-equal; 64 Demo-/Werks-Sounds offline bitgleich (max \|Δ\| 0) |
| MK1-02b | ✓ Engine „xyz“ in Projekt, Bibliothek, Cloud-Bibliothek deep-equal (MK0-Schutz bleibt) |
| MK1-03 | ✓ AM-Teil 0 Markenwörter; ganze Datei `micro ?korg\|radias\|dwgs` 0, `ms[ -]?2000` genau 1 (`MK_LABEL`); keine neue Schrift, keine Bild-Daten |
| MK1-04 | ✓ Säge Teiltöne 1–20 ± 0,11 dB; C7 gefaltet −50,9 dB; STEUER 1 = 127: ungerade −121 dB; = 64: 1. Teilton −6,09 dB |
| MK1-05 | ✓ Puls: gerade −122 dB; 64 → 25,1 %; 127 → −111 dBFS; PWM wandert (Klick 2,7 dB); C7 −50,9 dB |
| MK1-06 | ✓ Dreieck: 3. Teilton −19,08 dB; 127 → stärkster bei 3·f; C7 −68,6 / −63 dB |
| MK1-07 | ✓ +12 HT = 1200,03 ct; Fein +1/+24/+48/+63 = 0,59/299,95/1200,03/2399,98 ct; Wellen OSZ 2 |
| MK1-08 | ✓ Ring: Spitzen 182,3 / 1062,3 Hz; 440 Hz und f₂ ≤ −137 dB |
| MK1-09 | ✓ Sync-Periode 1/f₁ (nicht-harmonisch −59,6 dB); M-SP +0,46 Okt; Ring+Sync = Sync × OSZ 1 (6,9e-8). **✗ C6 gefaltet:** Sync −48,1 … −53,2 dB (schlechtester +17), Ring+Sync −38,6 … −51,9 dB (schlechtester +19) – siehe Lücken |
| MK1-10 | ✓ Rauschen flach ± 0,8 dB (Terzen 100 Hz…16 kHz) |
| MK1-11 | ✓ Steilheit 24,4 / 12,2 / 11,4 / 5,8–5,9 dB/Okt; an W-01 −12,0/−6,1/−6,1 dB; Resonanzspitze 36,5 dB; Selbstoszillation 638,5 Hz (W-01 649,9), −23,4 dBFS ab 200 ms; Keytrack 2,4/4,6 ct; 20 s ohne NaN, ≤ 0 dBFS |
| MK1-12 | ✓ Keytrack 3/0/−3 Okt; HK-INT +59,8 HT; ANSCHLAG 24 HT; TRANSP. +12 HT |
| MK1-13 | ✓ Pegel 0 stumm; Pan −93 dB; GATE 0,9/2,4 ms; VERZERR. −17,6/−37,7 dB, Alias −50,9 dB; ANSCHLAG −12 dB; KEYTRACK +3,59 dB |
| MK1-14 | ✓ Stufenzeiten 0…127 nach W-06 ± 10 % (A127 16,4 s, D127 16,0 s); NEUSTART an −48,6 dB, aus ± 0,03 dB |
| MK1-15 | ✓ LFO-Frequenzen; Rechteck(+) Mittel 0,57 (174 Werte, Toleranz nach Stichprobe); S/H 1280 Werte, Mittel −0,008; Tempo Sync 2,000 Hz, Nulldurchgang 0 ms; Key Sync Stimme/Timbre |
| MK1-16 | ✓ TRANSP./FEIN; Vibrato ±200 ct; Portamento t90 150,7 ms (W-13 132 ms ± 10 % nach t90-Lesart, s. Abweichungen); BEND +200 ct, zurück in ≤ 100 ms; Räder per Zeiger: MK1-33 |
| MK1-17 | ✓ Poly 4, Stehlen (Klick 2,6 dB), Low/High, Rückgabe, Mono-Folgen, Unison −10/−3,3/+3,3/+10 ct, Single/Multi |
| MK1-18 | ✓ Struktur-Wechsel (SXF) M-KLICK ≤ 4,8 dB, M-EINBRUCH ≥ −0,37 dB; Zuweisung/Priorität/Auslösung; 23 Regler je 1 s; Bruchwerte 289 Werte, ≤ 23,9 ct je Ereignis; **Protokoll**: Geste wirkt im nächsten Steuerblock; VA/FM-Nachrichten byte-gleich zu 4.8.1 (inkl. `processorOptions`) |
| MK1-19 | ✓ H-1/H-3 für jeden Regler von SPIEL und jeder EDIT-WAHL-1-Sektion (Ebene 1, 2) und VOLUME; Ausnahmen im Skript benannt (gesperrt/dunkel bis MK3/MK7/MK11–13; BEND über das Rad) |
| MK1-20 | ✓ INIT MS 2000 −18,77 LUFS gegen INIT Analog −18,75; ⋯ → Init und SHIFT + 3: je ein Undo |
| MK1-21 | ✓ M-PLATZ und M-ANSICHT (0,00 px) in P1, P2, P3, L1, L2, W, 844 × 390 und 926 × 428 mit 47-px-Safe-Area, 844 × 390 mit Safe-Area + 21-px-Home-Balken (→ Halb-Ansicht quer), je SPIEL + 44 Stellungen/Ebenen, Halb-Ansicht LINKS und RECHTS, offene Liste (11 × 44 px); Treffer ≥ 44 × 44, keine Überlappung, keine Beschriftung läuft über, keine Seite scrollt; L1: Körper 720 × 136 (Regler 44 × 44, Drehschalter 52 bzw. 64 × 44, Matrix-Zeile 244 × 44); Kopfzeile quer: nichts läuft über, Namensfeld ≥ 72 px, Engine-Knöpfe 36 px, 4 px, Treffer 44 px; hoch: Chip (s. Breiten-Budget); Zoom/Pinch/Textauswahl aus |
| MK1-22 | ✓ LCD für alle 70 Regler: Sektion · Name · Gerätewert · Klartext; 7 Hilfe-Zeilen |
| MK1-23 | ✓ ECO (NativeVoice): INIT +1,1 dB/+0,10 Okt, Puls+Säge +0,9/+0,11, Dreieck +1,4/0,00, Sync-Säge +1,2/+0,01; Badge da |
| MK1-24 | ✓ eine AM-Stimme 1,02 × VA-Stimme, 4 Stimmen 2,85 × (Xeon, Node, Mediane aus 9 verschachtelten Läufen, je 2 s Aufwärmen verworfen; VA-Stimme 1,07 % Echtzeit, AM 1,09 %, 4 AM 3,04 %). Die Maschine wird mit anderen Läufen geteilt: einzelne Läufe streuen 0,9–1,5 ×. Chromium (Probe): Σ 4 Engines × 4 Stimmen `load_med` 0,147, je Engine 0,035–0,048 |
| MK1-25 | ✓ JSON mit allen Feldern; Σ-Last 0,147; 0-Gain: −∞ dBFS; 0 Netzaufrufe; [Abbrechen] → alle 4 Engines entsorgt nach 0,6 s; `quantum_max_ms` null (s. Lücken) |
| MK1-26 | ✓ ohne AM: Median aus 5 −20 ms gegen 4.8.1 (ein früherer Lauf +28 ms; Einzelwerte 297–360 ms, die Maschine ist geteilt); mit AM-Sound: +38 ms bzw. −5 ms gegen ohne AM, Block beim Laden ausgewertet (1,1–2,3 ms); erste Auswertung 3,1 ms, bei CPU ×4 14,6–18,8 ms, keine longtask; Engine-Knopf während der Demo: späteste Note 16,7 ms *vor* Plan, 14 Schläge je Takt durchgehend |
| MK1-27 | ✓ PE1 L1 und P1 mit offenem Bedienfeld, BEND- und Drehschalter-Zug: 59,9 fps, 0 longtasks, tick-p95 0,6–0,7 ms, tickErrors 0. **✗ Budget +130,3 KB** (s. Abweichungen). Keine Konsolenfehler; Smoke-Test ohne Fehler; Worklet-ASCII |
| MK1-28 | ✓ `APP_CODE` 4 009 000; `save_project` mit Format 5 / App 4009000 (Fake-Server); kein Klassenzimmer-Projekt |
| MK1-29 | ✓ 4.8.1 öffnet Format 5 gesperrt, KV/Server/Bibliothek unverändert; zurück auf 4.9.0 deep-equal |
| MK1-30 | ✓ VA-Zustand ruht (kein `fx.rev`-LFO, keine VA-Mods, kein `glideFrom`), zurück auf VA wirkt die Route |
| MK1-31 | ✓ 🎲 100 Würfe hörbar (4 × 100 im Lauf geprüft), Mixer ≥ 64; ◎ genau FILTER/A-HK; Seite B A–Z |
| MK1-32 | ✓ M-SKIZZE: IoU aller Zonen und Holzwangen 1,000 (844 × 390 und 926 × 428 mit Safe-Area); Räder links der ersten Taste in `#kbArea`; Anordnung in allen 9 Formaten (Bänder, Spalte TIMBRE/EDIT-WAHL 1/2, Z13 2 px unter Z12, Matrix-Zeile auf Höhe ihres Drehschalters, Holzwangen, Hälften A/B); Material aus dem Bildschirmfoto: Feld L* 15,3, Holz 24°/44 %/36 %, Kappe L* 5,5, Kontrast 12,6 : 1, Vocoder-Grün 138°, LED 10°; Matrix Ebene 1 = Belegungs-Tabelle B.3 (11 Stellungen) |
| MK1-33 | ✓ P1 und L1: Räder links der ersten Taste (44 × 146 bzw. 44 × 86 px), BEND oben = +1, zweiter Finger ignoriert, Feder 62–70 ms, 3 Tasten bei gehaltenem Rad, MOD bleibt, nichts gespeichert, VA ohne Räder |
| MK1-34 | ✓ LEDs, Rasten je 18 px, Liste 11 × 44 px, keine Sound-Änderung/kein Undo durch die Wahl, SHIFT (EB2), SHIFT + OKT ▲ = +1 (ein Undo), SHIFT + SEITE, OKT 1…7, ORIGINAL-LED, Nummerntaste lädt (ein Undo, Toast) und zurück zu SPIEL |

**Filter, −3-dB-Punkte** (Res 0, Rauschen; MK1-11): Cutoff 32 (W-01 114 Hz): 24LPF 49 Hz · 12LPF 72 Hz · 12BPF 48–273 Hz · 12HPF 181 Hz;
Cutoff 64 (650 Hz): 277 · 410 · 270–1554 · 1032 Hz; Cutoff 96 (3705 Hz): 1609 · 2374 · 1562–8180 · 5712 Hz.

**Breiten-Budget Kopfzeile** (B.3 Zeile 1, mit Spur-Chip „Synth 1“): P1 390 px: Chip 83 × 34 px (Treffer 43 px = ganze Zeile 1),
Spurname 60 px; P2 375 px: Chip 83 px (Treffer 40 px), Spurname 53 px; P3 320 px: Chip 77 px (Treffer 34 px), Spurname 53 px; vier
Knöpfe hätten dort 36/36/36/40 px + 3 × 4 px gebraucht und den Spurnamen unter 40 px gedrückt. L1 844 px: 36/36/36/65 px (einzeilig),
Namensfeld 120 px; L2 667 px: 36/36/36/38 (zweizeilig), Namensfeld 78 px; L1 mit Safe-Area (750 px): zweizeilig + „▶“ ohne Wort,
Namensfeld 95 px; 926 × 428 mit Safe-Area: einzeilig, Namensfeld 108 px; W: 36/36/36/38 px, Treffer 46 px.

**Bildschirmfotos:** `dirigent-test/v3-mk1-shots/mk1-look-<Format>[-A|-B]-{spiel,filter}.png` für P1, P2, P3, L1, L2, W, L1-SA,
L0-SA (926 × 428), L1-HB (Halb-Ansicht mit Home-Balken); dazu `mk1-{spiel,filter}-<Format>.png` (DPR 2). Ein Vocoder-FILTER-Foto
gibt es erst mit MK7 (SYNTH/VOC. ist bis dahin gesperrt).

### Abweichungen
- **Budget +130,3 KB statt +115 KB** (2 534 778 → 2 668 186 B). Davon ≈ 19 KB Kommentare (Bezüge auf W-/B-/EN3-Nummern, Begründungen
  der DSP-Stellen); ohne sie ≈ +111 KB. Ich habe sie nicht entfernt, weil die nächsten Pakete direkt in dieser Datei weiterbauen.
  Gespart wurde: Ausrichtungs-Leerzeichen, doppelte Zonen-Listen. Vorschlag: SL1 packt den Block `sq-mk-src` (≈ 62 KB, erst bei Bedarf
  ausgewertet), oder Kommentare im Block kürzen (≈ 4 KB).
- **P1 zeigt den Engine-Chip** statt vier Knöpfen (H-13-Vorgabe „Chip nur dort, wo nicht“: der Spurname fiele unter 40 px). Der Chip
  ändert VA/FM/WT sichtbar – der Orchestrator wollte ihn Xander vorher zeigen. Treffer-Höhe des Chips = Zeile 1 (P1 43, P2 40, P3 34 px;
  oben liegt die Kopfleiste, unten Zeile 2; die alten VA/FM/WT-Knöpfe hatten 34 px).
- **Querformat mit Safe-Area:** „▶ Hören“ verliert sein Wort, wenn die 40-px-Kopfzeile sonst überläuft (gleiche Regel wie schon unter 760 px).
- **ECO-Badge** sitzt auf dem VA-Knopf (vorhandener Mechanismus: ECO = VA-Fassung des Sounds).
- **Prüf-Lesarten:** W-13 als Zeit bis 90 % (t90); M-EINBRUCH gegen min(vorher, nachher); M-SP-Bedingung „C4, Cutoff 80“ für Sync
  (ein offenes Filter bis Nyquist verdeckt die Verschiebung); CPU im eingeschwungenen Zustand (je Render 2 s JIT-Aufwärmen verworfen,
  verschachtelte Mediane); Denormal-Fenster aus dem Median der Quanten (geteilte Maschine).
- **🎲:** Amp-Attack ≤ 72, 12HPF/12BPF mit Cutoff 35–80 (sonst bei C3 unter −60 dB → nicht hörbar).
- **Ebene 3 (SHIFT zweimal)** wird erst mit MK11/MK12 belegt; in MK1 schaltet der zweite Tipp SHIFT aus.

### Lücken
- **Faltung Ring+Sync / Sync bei C6** (MK1-09): Ring+Sync bis −38,6 dB (+19 HT), Sync bis −48,1 dB (+17 HT); Ziel −50 dB (gerechnet
  −52 … −55). Das Produkt zweier polyBLEP-Signale bei 1× Abtastrate faltet; ein 2×-Überabtasten nur des Ring-Wegs widerspräche der
  Gleichheit „Ring+Sync = Sync × OSZ 1 (≤ 1e-4)“ derselben Abnahme. Vorschlag MK1-fix: beide Oszillatoren in den Ring-Modi 2× rechnen
  und die Gleichheits-Regel auf „gleiche Teiltöne ± 0,5 dB“ ändern, oder den Wert wie bei Ring/Sinus× als Charakter führen (B.6 Nr. 12).
- `quantum_max_ms` der Probe ist `null` (das Worklet meldet nur die Mittellast je Sekunde); `frames_ok` = Berichte kamen an.
- MIDI-Bend/CC1 (freiwillig) nicht gebaut. Die Aufnahme ● zeichnet die Räder nicht auf (laut Spec).
- Zusatz-Ansichten (SCHRITTE, 16 BÄNDER, EIGENE) und Vocoder-Beschriftung im Feld kommen mit MK3/MK6/MK7 (in MK1 nur die Plätze).

### Datenbank
Keine Änderung. Laut Orchestrator gilt am Server `max_app` 4 021 000 und `max_format` 5 – 4.9.0 mit Format 5 ist damit zugelassen.
**Am Server offen:** nichts (keine Supabase-Abfrage in diesem Lauf; Format-5-Speichern nur gegen den Fake-Server geprüft).

### iPhone-Prüfpunkte (Xander, ≈ 7 min)
1. Synth-Spur → Kopf: „MS 2000“ (hochkant über den Chip „VA ▾“). Quer halten: Sieht das Bedienfeld aus wie dein Gerät? Hochkant:
   sind die zwei Hälften klar? Abweichungen kurz nennen.
2. Akkord spielen, CUTOFF und RESO. drehen. Mit dem linken Daumen BEND ziehen, mit der anderen Hand weiterspielen; MOD hochschieben
   (Vibrato, wenn TONH. → VIBRATO gesetzt ist).
3. EDIT-WAHL 1 auf OSZ 2 → Regler 2 (MOD) auf „Sync“, dann Regler 3 (HALBT.) drehen.
4. EDIT-WAHL 1 auf AMP → Regler 3 (VERZ.) an, dann MIXER hochdrehen.
5. Menü → Info → **Leistungs-Probe**, Ergebnis kopieren und schicken.

### Geräte-Abgleich (nach Gehör, an deinem Gerät)
Säge STEUER 1 0 → 127 („Oktave dazu“?); Puls STEUER 1 = 64; Dreieck STEUER 1 = 127; Resonanz 127 (Einsatz und Pegel des Pfeifens);
Attack 64 / Release 64; LFO-Frequenz 64; **Bedienfeld (nur Sicht):** Lage der Zonen, LEDs und Räder – Abweichungen ändern die
Referenz-Skizze in einem `MK1-fix`.

## MK1-fix — Kopf, ECO-Badge, Sync-Faltung, CPU, Leistungs-Probe · App bleibt 4.9.0 · Format bleibt 5

### Behoben (9 bestätigte Befunde aus Abnahme, Fach-Prüfung und Regression, 6 Ursachen; dazu Nr. 8 aus dem eigenen Lauf)
1. **Kopf: ✕ ↶ ↷ aus dem Bild (L1 mit Safe-Area, L2, 812 × 375) nach der ersten Änderung** (MK1-21). Die Verdichtung lief vor
   `edHeadRefresh()`, also ohne [A/B] und ohne ●. Neu misst `edHeadFit()` im **breitesten Zustand** von Zeile 2: [A/B] sichtbar, ein
   Sound-Name länger als das Feld, ● dazu, und mit dem App-Layout `sheet-open`. Der Kopf ist darum vor und nach der ersten Änderung,
   beim Öffnen, nach jedem Reiter-Wechsel und bei jedem Sound gleich (M-ANSICHT). Das Namensfeld behält in L wieder seine 72 px wie in
   4.8.1, ‹ › behalten ihre Breite (28–32 px statt 13–15 px), und der Gruppe ‹ Name › gibt `edHeadFit` ihr Minimum. Die Schritte im
   Querformat: (1) „MS 2000“ zweizeilig, (2) ▶ ohne Wort (wie unter 760 px), (3) **⋯ wandert in die LCD-Zeile links neben ◎** (sein Platz im
   Hochformat), (4) erst dann der Engine-Chip (H-13), danach wieder 2/3; der Spurname wird nur als letzter Ausweg gekürzt (≥ 40 px), ‹ ›
   gehen nur als letzter Ausweg bis 15 px. Ergebnis (echte Schrift Barlow Semi Condensed): L1 844 × 390 und 926 × 428 + Safe-Area vier
   Knöpfe einzeilig; L1 mit Safe-Area 844 × 390 und L2 667 × 375 vier Knöpfe, Schritte 1–3; 812 × 375 mit Safe-Area (iPhone mini quer) und
   568 × 320 der Chip; überall ✕ im Bild und antippbar, nichts läuft über, Namensfeld ≥ 72 px, Spurname ganz. Weil gemessen wird, passt
   sich der Kopf auch an eine Ersatzschrift an (Claude-App ohne `fonts/`): mit ihr zeigen L2 und L1 + Safe-Area den Chip, ohne Überlauf.
2. **Kopf im Hochformat 414/428 px (Xanders 12 Pro Max) und W: Chip nur beim ersten Öffnen** (H-13, M-ANSICHT). Die Messung lief, solange
   das Blatt noch `display:none` war (Breite 0 → immer Chip). `edHeadFit()` läuft jetzt nach `sh.classList.add('open')`. 414/428 px und W
   zeigen die vier Knöpfe bei jedem Öffnen, 320–390 px den Chip bei jedem Öffnen. **Drehen** bei offenem Editor passt den Kopf neu an
   (neue Breite oder Ausrichtung → Neuaufbau).
3. **Querformat-Verdichtung beim ersten Öffnen übersprungen** (L2, 844 × 390 mit Safe-Area: ‹ › 13–15 px, Name „Mi…“, Sprung beim ersten
   Reiter-Tipp bis 27 px): dieselbe Ursache wie Nr. 2, mit Nr. 1 behoben (Lage aller Kopf-Elemente in allen Zuständen gleich, ≤ 0,1 px).
4. **ECO-Badge im Hochformat weg** (MK1-23, Regression): Die Trefferflächen-Regel `::before` der Engine-Knöpfe hatte den Inhalt „ECO“
   überschrieben. Das Badge sitzt jetzt im selben `::before` (Text 3 px über der Unterkante wie 4.8.1, Trefferfläche bleibt 44–46 px);
   quer zeigt weiter die Pille „ECO-Klang“. Bei einer AM-Spur trägt der aktive Knopf „MS 2000“ das Badge (vorher der VA-Knopf), beim Chip
   der Chip.
5. **MK1-09 Faltung Sync / Ring+Sync bei C6** (bis −38,6 dB): Ab Taste + TRANSP. + TUNE ≥ D4 (`MK_OSN` 62, 294 Hz; entschieden beim
   Notenstart, kein Umschalten mitten in der Note) rechnen Sync und Ring+Sync **beide Oszillatoren 2×** (`osc2x`) und gehen über ein
   polyphasiges IIR-Halbband (4 Allpässe, eben bis 20 kHz, ≥ 72 dB ab 30 kHz) zurück. Für Ring+Sync nimmt der Ring OSZ 1 einen Takt später
   (wie den Slave), so liegen beide Sprünge des Master-Wraps im selben Sample, und der Kreuzterm der zwei polyBLEPs wird abgezogen
   (`mkXt`: je Slave-Sprung im selben Sample, auch Wrap und Rechteck-Flanken). Unterhalb D4 bleibt der 1×-Weg bitgleich (dort faltet
   es ≤ −52 dB, und „Ring+Sync = Sync × OSZ 1“ gilt exakt: 6,9e-8). Ergebnis C6, Halbton +1 … +19 (alle, auch die geraden): **Sync
   −59,6 … −63,8 dB, Ring+Sync −58,5 … −66,0 dB** (vorher −46,9 bzw. −38,6). Andere Wellen (Puls/Dreieck als OSZ 1 oder 2) ebenfalls
   deutlich besser (z. B. Dreieck-Slave +19: −41,8 → −54,5 dB).
6. **MK1-24 CPU** (eine AM-Stimme 1,5–1,7 × VA, 4 Stimmen 5,1–5,9 ×): (a) Die ADAA-Verzerrung rechnet die geteilte Differenz von F
   innerhalb |u|, |x| < 3 geschlossen ohne Logarithmus (ln(A/B) = 2 atanh(s), Padé 5/4, eine Division je Sample, Fehler ≤ 1,5e-5) und im
   flachen Teil (beide ≥ 3 bzw. ≤ −3) gar nicht; (b) **Boxen von Zahlen** in V8 abgestellt: eine Schleifen-Variable, die bei einem
   Parameter beginnt (`mm`), und der Seed-Zähler als uint32 boxten **jedes Sample** (80 MB Speicher je 10 s Klang, Müllabfuhr) – jetzt
   ohne Allokation in den Sample-Schleifen; (c) Cutoff-Grundwert, Resonanz, Pegel und Pan einmal je Block für alle Stimmen und nur, wenn
   sich der geglättete Wert bewegt; LFO-Raten nur bei Änderung; `cutHz` nur für den Scope; (d) Verzerrung als eigener Durchlauf.
   Klänge dabei bitgleich (alle 66 Synth-Sounds gegen MK1.html, inkl. INIT MS 2000).
7. **MK1-25 Leistungs-Probe: `frames_ok` immer wahr, `quantum_max_ms` immer null** (B.4): Das Worklet meldet je Bericht die gerechneten
   Frames, `Date.now()` (dieselbe Uhr wie der Hauptfaden) und die längste Einzel-Quantum-Zeit. Die Probe setzt `frames_ok` falsch, sobald
   eine Probe-Engine seit ihrem ersten Bericht unter 0,995 · sampleRate liegt (Spielraum ein 2048-Frame-Gerätepuffer) oder ihre Berichte
   > 1,6 s ausbleiben; `quantum_max_ms` = Maximum über alle Engines (in Chromium ohne `performance` im Worklet auf 1 ms gerastert).
8. **🎲 (MK1-31) konnte stumm würfeln:** Puls mit STEUER 1 + 2 > 100 und Ring/Ring+Sync gab −61 dB. Der Puls bleibt jetzt ≥ 10 % breit
   (STEUER 1 + STEUER 2 ≤ 100). Vorher und nachher gleich laut gerendert (−61,0 dB), also kein Fehler dieses Fixes, nur ein Loch im Würfel.

### Proben (Node 22 bzw. Chromium 1243; der Pfad chromium-1194 aus dem Auftrag existiert hier nicht)
- **Neu, mit der echten App-Schrift** (Barlow Semi Condensed / JetBrains Mono aus `dirigent-wt/fonts`, geprüft `document.fonts`):
  `v3-mk1fix-hdr.mjs` **48/48** (12 Formate × VA/MS 2000/FM/WT; echte Tipps: Öffnen, Ändern, Reiter, ✕, wieder Öffnen; kein Element über
  dem Rand, keine Beschriftung läuft über, ✕ getroffen und schließt, Namensfeld ≥ 72 px quer, Spurname ganz, Lage gleich ≤ 2 px),
  `v3-mk1fix-hdr60.mjs` **4/4** (alle 60 VA/FM/WT-Werks-Sounds + INIT MS 2000 nach einer Änderung in 844 × 390 + SA, 812 × 375 + SA,
  667 × 375, 926 × 428 + SA: 0 von 61 über dem Rand; vorher 60 von 60), `v3-mk1fix-rot-eco.mjs` **15/15** (Drehen P1 ↔ L1, 428 ↔ 926;
  ECO-Badge P1/P2/P3/W/428 für VA und MS 2000, Farbe Bernstein, Treffer ≥ 44 px; L1 Pille).
- **QA-Repros erneut** (dort mit Ersatzschrift): `v3-repro-mk1-hdrx.mjs` – L1 + SA, L2, 812 + SA, L1: ✕ nach der Änderung im Kopf,
  Tipp schließt (`R.editor` null); `v3-qa-mk1-hdr9.mjs` 0 von 60 über dem Rand (vorher 60); `v3-rp-mk1-chipfirst.mjs` – 428/414 px vier
  Knöpfe in allen vier Zuständen, ≤ 390 px Chip in allen; `v3-repro-hdrflip.mjs`/`-rot.mjs` – gleiche Lage in allen Zuständen, Drehen
  P1 → L1 ergibt die Knöpfe; `v3-rp-mk1-ecobadge.mjs`/`v3-qareg-mk1-eco2.mjs` – „ECO“ in P1/P2/P3/W, bei AM auf „MS 2000“;
  `v3-rp2-mk109-alias.mjs`/`v3-sp-mk1-alias.mjs` – kein Halbton +1…+19 über −50 dB; `v3-sp-mk1-probe.mjs` – `frames_ok` false.
- `v3-mk1-look.mjs` lädt jetzt die echte Schrift (wie Pages; `NOFONT=1` misst mit der Ersatzschrift; alte Fassung
  `v3-mk1-look.pre-mk1fix.mjs`): **88/88**. Mit Ersatzschrift fällt nur „L2 ohne Chip“ (dort zeigt der Kopf den Chip, nichts läuft über).
- `v3-mk1-dsp.mjs` **64/64** (MK1-09 jetzt grün: schlechtester Ring+Sync +1 −58,5 dB; MK1-24 in zwei Läufen 1,05 × / 2,94 × und
  0,79 × / 2,60 ×), eigene Sweeps
  `v3-mkfix-alias-probe.mjs` (C4/D4/C5/C6/C7), `v3-mkfix-alias-var.mjs` (Wellen-Kombinationen alt/neu).
- **CPU robust gemessen:** `v3-qa2-mk1-cpu-shared.mjs` (eine Scope, verschachtelt, 60 s): 1 AM-Stimme **0,99–1,11 ×**, 4 Stimmen
  **3,45–3,70 ×** VA; `v3-rp-mk1-cpu-node.mjs` (echtes `Math`, 5 Prozesse, Mediane): **1,08 × / 3,81 ×** (ohne VERZERR. 0,99 × / 3,46 ×);
  `v3-rp-mk1-cpu-chromium.mjs` (App-Worklet im OfflineAudioContext, 5 Runden): Median **1,03 × / 3,45 ×**. Information: hohe Noten mit
  dem 2×-Weg (Sync bzw. Ring+Sync, C5–C6, 4 Stimmen) 1,23–1,30 × / 4,2–4,5 ×. Speicher: 0 Allokationen in den Sample-Schleifen
  (`v3-mkfix-alloc2.mjs`, Heap-Sampling).
- `v3-mk1-probe.mjs` 7/7 (`frames_ok` true, `quantum_max_ms` 5); QA-Repro `v3-sp-mk1-probe.mjs` mit 2,5 s angehaltenem Audio:
  `frames_ok` **false** (vorher true).
- Regression: `v3-mk1-hear.mjs` 53/53, `v3-mk1-format.mjs` alles, `v3-mk1-proto.mjs` alles (VA/FM-Nachrichten byte-gleich),
  `v3-mk1-eco.mjs` alles, `v3-mk1-gleich.mjs` gegen MK1.html: alle Daten deep-equal, **alle 66 Synth-Sounds bitgleich** (die zwei
  MK0-Regeln „Worklet unverändert“ / „≤ +4 KB“ gelten für MK0, nicht hier); `v3-mk1-ui.mjs` alles (MK1-31 mit dem 🎲-Schutz),
  `v3-mk1-fpdsp.mjs` alles (Denormale, NaN, Extremwerte), `v3-mk1-perf.mjs` 6/7 (rot nur das Budget, s. Abweichungen); Worklet-ASCII;
  Smoke ohne Fehler (`v3-mk1fix-smoke.png`).

### Abweichungen
- **812 × 375 mit Safe-Area** (iPhone mini quer) und 568 × 320 zeigen quer den Engine-Chip: vier Knöpfe fehlen dort 1–40 px, auch mit
  allen drei Schritten (der Spurname bliebe sonst nicht ganz). Das ist die H-13-Regel („Chip nur dort, wo die Knöpfe nicht passen“) und
  kein Format der MK1-21-Liste.
- **⋯ in der LCD-Zeile** (Schritt 3, L1 mit Safe-Area und L2): sichtbar anders als in 4.8.1, aber nur dort, wo der vierte Knopf sonst
  den Kopf sprengt; es ist der Platz, den ⋯ im Hochformat schon hat. Bitte beim iPhone-Test ansehen (Punkt 1 unten).
- **2×-Weg ab D4** nur für Sync und Ring+Sync: Ring+Sync oberhalb D4 ist nicht mehr exakt „Sync × OSZ 1 aus getrennten Renders“ (die
  entfernte Faltung fehlt); die Abnahme MK1-09 prüft die Gleichheit bei A3 und hält dort exakt.
- **Größe +13,8 KB** gegenüber MK1 (2 668 186 → 2 681 936 B; davon ≈ 6 KB Kommentare); MK1 insgesamt damit +143,7 KB statt +115 KB
  (Vorschlag aus MK1 bleibt: SL1 packt `sq-mk-src`).

### Lücken
- Puls als OSZ 1 mit Ring+Sync bei Halbton +12 faltet bei C6 noch −46,7 dB (die Puls-Flanke von OSZ 1 fällt dort auf den Slave-Wrap; der
  Kreuzterm dafür ist nicht abgezogen). Nicht Teil von MK1-09 (Säge/Säge), vorher −40,4 dB.
- MIDI-Bend/CC1 (freiwillig) weiter nicht gebaut.

### Datenbank / Am Server offen
- Nichts. Kein Supabase-Aufruf, keine Datenbank-Änderung.

### iPhone-Prüfpunkte (Xander, ≈ 3 min)
1. iPhone quer, Synth-Editor öffnen, einen Regler drehen: ✕, ↶, ↷ bleiben sichtbar, „MS 2000“ zweizeilig, ⋯ jetzt rechts in der
   LCD-Zeile neben ◎. Passt das so?
2. Hochkant auf deinem 12 Pro Max: Engine-Wahl zeigt beim Öffnen immer die vier Knöpfe VA │ FM │ WT │ MS 2000 (kein Chip mehr).
3. MS 2000: OSZ 2 auf Sync oder Ring+Sync, hohe Töne (C5–C6) mit Halbton-Fahrt: kein „Kratzen“ mehr zwischen den Tönen.
4. Menü → Info → Leistungs-Probe: `frames_ok` und `quantum_max_ms` haben jetzt echte Werte – Ergebnis bitte schicken.

## G-MK1-gruppe-fix — MS-2000-Editor schließt wieder, Weg zurück zu SPIEL · App bleibt 4.9.0 · Format bleibt 5

### Behoben (2 bestätigte Befunde der Gruppen-QA G-MK1)
1. **critical – ✕ schloss den Editor einer MS-2000-Spur nicht.** `closeSheets()` nahm `open` weg, die Bedienfeld-Seite maß
   0 × 0, und der ResizeObserver des Bedienfelds sowie der Halb/Voll-Abgleich (`setTimeout`) riefen `buildSynthEd` auf, das
   `open` wieder setzte, obwohl `R.editor` schon `null` war. Das Blatt blieb stehen; Tipps auf ▶1–▶4 trafen FM, MS 2000, ↶, ↷
   (im 3-Minuten-Lauf: ▶4 → „Wiederholt: Init“). Derselbe Kreis baute das Bedienfeld beim Öffnen 9-mal und beim Schließen
   10-mal (51-ms-longtask beim Öffnen während der Wiedergabe). Nicht erst seit MK1-fix: `MK1.html` hat denselben Fehler, nur
   ohne Kopf-Taste „MS 2000“.
   - `buildSynthEd` baut nur bei offenem Synth-Editor (`R.editor === 'synth'`): kein späterer Neubau (Timer, Observer,
     Gesten-Ende) öffnet ein geschlossenes Blatt wieder – das galt auch für den Sound-Browser über einem MS-2000-Editor.
   - Bedienfeld (`MKUI.build`): späte Neubauten nur, solange genau dieses Bedienfeld zu sehen ist (`panelLive`); eine
     verborgene Seite (0 × 0) entscheidet nichts; Größenänderungen werden gesammelt und 90 ms nach der letzten einmal
     umgebaut, nur wenn die Seite wirklich eine andere Größe hat.
   - Ein Bau je Öffnen: Für das AM-Bedienfeld ist das Blatt beim Bau schon sichtbar, und gemessen wird die Größe am Ende der
     Öffnungs-Animation des App-Rasters (`grid-template-rows` .15 s: Animation auf ihr Ende gesetzt, gemessen, zurückgesetzt –
     nichts wird dazwischen gezeichnet; die Animation läuft unverändert).
2. **major – kein Weg zurück zu SPIEL ohne eigenes Seite-B-Programm.** Am Gerät führt die leuchtende Nummerntaste zurück; ein
   noch nicht gesicherter Sound (INIT nach dem Engine-Wechsel, 🎲, ⋯ Init, VA/Demo-Grundlage) hat keine.
   - Tipp auf eine **leere Nummerntaste** oder auf die **Anzeige** = zurück zu SPIEL, der Sound bleibt (kein Undo-Schritt);
     in SPIEL zeigt die leere Taste wie bisher nur den Hinweis „Platz leer“. Aussehen unverändert.
   - Eine **andere Spur** (anderer Sound) beginnt in SPIEL; Schließen und Wieder-Öffnen derselben Spur behält die Sektion.
   - **Laden eines Programms** (Bibliothek, ‹ ›, `loadPreset`, auch derselbe Name) → SPIEL, beide LEDs (MK1-34).
   - **Nach WRITE** sofort Programmnummer „b.11“ in der Anzeige, die Taste leuchtet, ORIGINAL-Bezug = geschriebener Stand.

### Proben (Chromium 1243, echte Schrift Barlow Semi Condensed aus `dirigent-wt/fonts`, CDP-Touch)
- `v3-fixgmk1-verify.mjs` P **13/13**, L **13/13** (VA/FM/WT ✕ wie vorher; MS 2000: ✕, zweites ✕, `closeEditor()`,
  Wieder-Öffnen-✕ schließen; 150 ms und 2 s danach ▶1–▶4 frei; Tipp ▶4 startet Szene 4 ohne Undo/Redo; 1 Bau beim Öffnen
  während der Wiedergabe, keine longtask; Bau für die Endgröße; Browser hält das Blatt zu; Drehen 1 Neubau). Gleiches
  Skript auf dem Stand davor: D1c–D1g rot.
- `v3-fixgmk1-spiel.mjs` P **11/11**, L **11/11** (vorher 3/11); `v3-fixgmk1-half.mjs` **5/5** (375 × 667, 320 × 568,
  667 × 375, 844 × 390, 390 × 844: je 1 Bau); `v3-fixgmk1-anim.mjs` Öffnungs-Animation läuft wie vorher.
- QA-Repros: `v3-qa-gmk1-close.mjs` P/L **1/1** (vorher 0/1), `v3-qa-gmk1-hitthru.mjs mk` alle „scene“, `v3-qa-gmk1-builds2.mjs`
  1 Bau beim Öffnen / 0 beim Schließen (vorher 9 / 10), `v3-qa-gmk1-spiel.mjs` **3/3** (vorher 0/3; P2/P3 mit behoben),
  `v3-qa-gmk1-long3.mjs` keine longtask (vorher 51 ms), `v3-qa-gmk1-long2.mjs` Takt 46: ▶4 ohne „Wiederholt“.
- Regression: `v3-mk1-look.mjs` 88/88, `v3-mk1fix-hdr.mjs` 48/48, `v3-mk1fix-rot-eco.mjs` 15/15, `v3-mk1-ui.mjs` 33/33,
  `v3-mk1-format.mjs` alles, `v3-mk1-eco.mjs` 6/6, `v3-mk1-perf.mjs` 6/7 (rot wie bisher nur das Budget, +147 KB),
  `v3-qa-gmk1-flow.mjs` 20/20, Smoke ohne Fehler.

### Abweichungen / offen
- M-KLICK in `long2`/`long3` bleibt rot wie vor diesem Fix (auch im Lauf `base` ohne Bearbeitung) – Detektor gegen
  AM-Klang, nicht Teil dieses Pakets.
- `v3-qa-gmk1-undo.mjs`: U1/U3/S1 rot wie vorher. U4 jetzt rot nur beim Schritt „Synth 3 → MS 2000 → WT“ (2 Undo-Schritte für
  zwei Engine-Wechsel – richtig). Vorher stand dort 1, weil der Schritt davor („SPIEL TEMPO“, Tipp auf leere Taste 8) die
  EDIT-WAHL-Liste offen ließ und den ersten Tipp verschluckte; jetzt führt die leere Taste zurück zu SPIEL.
- Kein Datenbank-Bedarf.

### iPhone-Prüfpunkt (Xander, ≈ 1 min)
1. Synth 1 → „MS 2000“ → ✕: der Editor geht zu, ▶1–▶4 reagieren normal.
2. EDIT-WAHL 1 auf FILTER, dann auf die Anzeige oder eine leere Nummerntaste tippen: die Regler sind wieder CUTOFF · RESONANZ ·
   ATTACK · RELEASE · TEMPO, dein Sound bleibt.

## MK2 — Alle Oszillator-Arten und PATCH 1–4 · App 4.10.0 (`APP_CODE` 4 010 000) · Format bleibt 5

Vorgänger für alle „bitgleich“-Abnahmen: **4.9.0** (MK1 + MK1-fix + G-MK1-gruppe-fix), Stand von `mk-wt/index.html` vor diesem Paket
(Kopie `mk2work/index.mk1base.html`, 2 742 396 B). Kein Datenbank-Bedarf (Format 5, `max_app` 4 021 000 deckt 4 010 000).

### Gebaut
- **OSZ 1, alle Wellen des Originals außer „Eingang“ (MK7):**
  - **Sinus×** (W-27): Phasenmodulation durch OSZ 2 *nach* Sync, *vor* Ring, Index 4 · (STEUER 1 + LFO 1 · STEUER 2) / 127 rad. OSZ 2 läuft als
    Modulator auch bei Mixer 0. Sinus aus der Sinustabelle (Klirr −145 dB).
  - **Stimmwelle** (W-28): Rosenberg-Puls live (Öffnen 0,714, Schließen 0,286 der Offenzeit), polyBLAMP an der Schließecke, Gleichanteil
    abgezogen, festes IIR = zwei 1-Pol-Tiefpässe bei 300 Hz. Form je 16er-Block (keine Division je Sample).
  - **Speicherwellen 1–64** (Platzhalter „≈“): Datenblock `MK_WD` (Base64, 9 473 B → 12 632 Zeichen, Salz 0, 0 Markenwörter) aus
    `dwgs-trace/dwgs-64-compact.json` mit dem Bau-Skript `dirigent-test/v3-mk2-wellen.mjs` (`--write`; enthält keine Wellennamen). Alle
    Teiltöne der Kompaktdatei (Prot. 58), darüber der Gruppen-Abfall, Schroeder-Phasen, Tonlage r (3, 34, 35: r 2; 28, 59: r 1,49831),
    35 als Shepard-Ton mit der Hülle in Hz, 61–64 mit fester Hülle in Hz (Oktav-Sätze C1 … C8, B.6 Nr. 6). Wahl über STEUER 2
    (Werte 2n − 2, 2n − 1 → n). Wellenwechsel = 2-ms-Gleichleistungs-Blende (sin/cos über Smoothstep) am selben Lesezeiger.
  - **Rauschen** (W-29): weißes Rauschen (eigener Generator je Note) → TPT-SVF-Tiefpass, Cutoff = Note · 2^((C1 − 24)/12), Res 0,98 · C2/127,
    Pegel über √(k/g) gehalten.
- **Gemeinsamer Tabellen-Bau `mkTables`** (Block `MKT` in `sq-mk-src`, DOM-frei; Spec §10.1, Teil G Nr. 9): Mip-Kette mit 11 Stufen,
  Stufe L hält k ≤ 512 >> L, schrittweiser Bauer (eine Stufe je Schritt), Übergabe `{mkw: {n, r, o, d, L, R}}` einmal je Kontext in die
  **MKW-Tabelle im `AudioWorkletGlobalScope`** (alle Prozessoren eines Kontexts teilen sie; ein Prozessor ohne Welle fragt `{mkwNeed}`, ein
  zweites Fragen bekommt eine Kopie für diesen Knoten = Rückfall „je Knoten kopieren“). Die Welle eines Sounds wird sofort gebaut und
  geschickt (Einzelwelle synchron ≈ 2 ms, Oktav-Welle in Häppchen ≤ 6,5 ms über `MessageChannel`, vorher `tickAhead(.3)`), danach die
  übrigen 59 Einzelwellen in Leerlauf-Häppchen; Oktav-Wellen nur, wenn ein Sound sie braucht oder die Wellen-Liste offen ist.
  Bis eine Welle da ist: Platzhalter-Säge, dann 2-ms-Blende. `mkRender` schickt die Welle vor dem Rendern.
- **PATCH 1–4** (A.5, W-18) je Timbre: Quellen EG 1, EG 2, LFO 1, LFO 2 (Rechteck(+) 0…1), Anschlag, Keytrack (KT − 60)/60, BEND-Rad,
  MOD-Rad; Ziele Tonhöhe ±24 HT, OSZ 2-Tonhöhe ±63 Fein-Einheiten (auf den Wert vor W-14), OSZ 1-Steuer 1 ±127, Rauschen ±127,
  Cutoff ±127 Einheiten, Amp ±127, Pan (aus der Mitte voller Weg), LFO 2-Freq ±127 (W-08; wirkungslos bei TEMPO SYNC). Intensität
  5 ms geglättet; Intensität 0 wird gar nicht gerechnet; ein Wechsel von Quelle/Ziel blendet den alten Weg aus und den neuen ein.
- **Bedienfeld:** EDIT-WAHL 2 mit PATCH 1–4 aktiv (QUELLE · ZIEL · INTENSITÄT, Listen mit 8 Zeilen, LCD „PATCH 2 · LFO 1 → CUTOFF · +32“,
  Hinweis „wirkt nicht: LFO 2 TEMPO SYNC an“), Liste der EDIT-WAHL 2 mit dem Weg je PATCH, ◎ auch an EDIT-WAHL 2. OSZ 1: STEUER 2 wird
  bei der Speicherwelle zum Wellen-Regler (stetig mit Rundung, 200 px für 64, Haptik je Stufe), Tipp = Liste mit 64 Zeilen (≥ 44 px,
  13 Gruppenköpfe mit eigenen Namen: Sinus, Bass, Welle, Quinte, Digital, Endlos, E-Piano, Orgel, Clavi, Gitarre, Bass II, Glocke,
  Stimme), jede Zeile und jede LCD-Anzeige mit „≈“; LCD „Speicherwelle 12 · Bass 5 ≈ Platzhalter“, STEUER 1 dort „ohne Wirkung“.
  4 neue Hilfe-Zeilen, LCD-Hinweis beim ersten Antippen (L10). 🎲 würfelt auch die neuen Wellen.
- **Leistungs-Probe** Fall „Kern“: Engines 1/3 Speicherwelle 23, 2/4 Sinus× (X-MOD 64, OSZ 2 Sync), je zwei aktive Patches.
- Test-API: `mkInfo()` mit `tables`, `tableBytes` (je Kontext), `built`, `posts`; Test-Abgriffe `mkTap` 'sx' und 'lfo2'.

### Abnahme (Skripte in `dirigent-test/`, Chromium 1243)
| ID | Ergebnis |
|---|---|
| MK2-01 | ✓ X-MOD 0 Klirr −145 dB; X-MOD 64 (OSZ 2 Dreieck +12) Seitenband +3,3 dB zum Träger, M-SP 221 → 918 Hz (+2,06 Okt); X-LFO 127 Seitenband schwankt 105 dB; Ring / Ring+Sync deterministisch, 0 NaN, = Referenz W-27 aus den Abgriffen (max \|Δ\| 4e-7) |
| MK2-02 | ✓ Hülle C2/C4 in Terzbändern 400–4000 Hz: max 1,1 / 1,6 / 2,5 dB (FORM 0/64/127); FORM 0 → 127: M-SP 335 → 220 Hz (0,6 Okt); C7 gefaltet −68,9 dB |
| MK2-03 | ✓ 64 Wellen Spitze 1, \|DC\| ≤ 7e-10; kleinster Abstand 3,95 dB (14/23); Abfall je Oktave exakt nach Formel (FFT Stufe 0), Wellen mit Ā < −50 dB ohne Teiltöne darüber, 35 nur Oktaven (Rest ≤ −100 dB); C7 am Oszillator ≤ −53,9 dB (alle 64); Wellenwechsel (Sprünge, Oktav-Wellen, Zug mit Bruchwerten, Akkord) Wechsel-Klick ≤ 3,9 dB, Einbruch ≥ −2 dB; Platzhalter → Tabelle 1,2 dB / −2,3 dB; „≈“ in LCD (64) und Liste (64) |
| MK2-04 | ✓ C3/C4 und Fis3/Fis4 deckungsgleich ≤ 0,04 dB (13 Teiltöne); chromatisch 2 Okt größter Sprung 0,09 dB |
| MK2-05 | ✓ RESO 127 / CUTOFF 24: Spitze +12 ct (C3), −12,4 ct (C5); CUTOFF 36: +7,5 ct zur Oktave; RESO 0: 11,65 dB/Okt, keine Spitze |
| MK2-06 | ✓ Tonhöhe ±2400 ct; Cutoff +127,0 Einheiten (mkScope 20 Hz → 20 kHz); Pan 0 … 1; LFO 2-Freq 51,19 Hz, mit Sync bitgleich wirkungslos; Pulsbreite C4 49,9 % / C6 31 %; Amp/Anschlag +6,1 dB, Rauschen/LFO 1 86,8 dB Hub, OSZ 2/EG 1 618 → 220 Hz; Intensität 0 bitgleich; 4 × 10 = 1 × 40 (1523,8 ct) |
| MK2-07 | ✓ MK1-Klänge (20 Renders, alle Wellen 0–2, Sync/Ring, Unison, Filter, Verzerrer, LFOs, Vibrato) sowie VA und FM6: max \|Δ\| = 0 gegen 4.9.0 |
| MK2-08 | ✓ eben geladener Sound: Einzelwelle 13,0 ms, Oktav-Welle 28,7 ms vom Laden (inkl. ≈ 10 ms UI von `setSound`) bis zur Übergabe; alle 64 Wellen in 483 ms ohne longtask > 50 ms; 5,42 MB je Kontext (alle 64), zweite/dritte AM-Spur 0 Byte; Node baut bitgleiche Tabellen (64/64, FNV-Hash) |
| MK2-09 | ✗ bis MK2-fix (Oktav-Wellen ×1,27 ohne Ausnahme in der Spec; behoben in MK2-fix) – damals gemeldet: ✓ (`v3-mk2-cpu.mjs`, jeder Fall in eigenem Node-Prozess, Median aus 5 Paaren): Speicherwelle ×1,070, Stimmwelle ×1,040, Sinus× ×1,109, 4 Patches ×1,023 gegen die Säge (13,95 ms je s Audio, 4 Stimmen); Oktav-Welle ×1,27 (ohne Grenze); AM-Säge = 0,76 × VA-Stimme |
| MK2-10 | ✓ PATCH 1–4 per Drehschalter und Geste (ein Undo), LCD wie gefordert, Listen ≥ 44 px; M-PLATZ/M-ANSICHT/M-SKIZZE für alle 44 Stellungen/Ebenen in P1–P3, L1, L0, L1 mit Safe-Area und Home-Balken, W (`v3-mk1-look.mjs` 88/88); H-1 für 14 neue Regler, H-3 für 5 stetige |
| MK2-11 | ✓ Regression: `v3-mk1-dsp` 64/64, `v3-mk1-ui` alles, `v3-mk1-eco` alles, `v3-mk1-fpdsp` alles, `v3-mk1-probe` alles, `v3-mk1-perf` alles (ohne AM −14 ms, mit AM +3 ms, PE1 59,9 fps, 0 longtasks), `v3-fixgmk1-verify` 13/13 P + L, `v3-fixgmk1-spiel` 11/11 P + L, `v3-mk1-format` alles außer der festen Erwartung `APP_CODE` 4 009 000 (jetzt 4 010 000, gewollt); Smoke ohne Fehler; Markenwörter 0, „MS 2000“ genau 1; Worklet-ASCII. **Budget ✗ +53,6 KB** (s. Abweichungen) |
| MK2-12 | ✗ bis MK2-fix („gespielt“ für 61–64 bis 19 dB daneben; behoben in MK2-fix) – damals gemeldet: ✓ Block bitgleich, 0 Markenwörter, keine Namen, dekodiert ≤ 0,0125 dB / 0,00077 rad, r exakt; Form je Welle ≤ rms32 + 0,1 pp (knappste 60: −0,098 pp; 35: 4,57 % ≤ 5,7 %); gespielt bei 187,5 Hz: Grundton bei f/r ± 1 ct (alle 64), Teiltöne 1–16 ≤ 0,63 dB (1–60 und 35), **61–64 nur an den Oktav-Stützpunkten ≤ 0,31 dB** (s. Lücken) |

Skripte: `v3-mk2-wellen.mjs` (Bau + MK2-12), `v3-mk2-osc.mjs` (MK2-01 … 07, H-1/H-3, SXF, FP-DSP; Ausgabe `v3-mk2-osc.out`),
`v3-mk2-cpu.mjs` (MK2-09), `v3-mk2-ui.mjs` (MK2-03-UI, 08, 10, 12 gespielt, Probe; `v3-mk2-ui.out`), `v3-mk2-marke.mjs`,
`v3-mk2-pegel.mjs`, `v3-mk2-node.mjs` (Hilfen), `v3-mk2-shot.mjs` → `v3-mk2-shots/` (P1, P2, P3, L1, L2, W: OSZ 1 Speicherwelle,
PATCH 2, Wellen-Liste).

### Fach-Prüfung (selbst, ohne zweiten Agenten; FP-DSP Haupt-, FP-KLANG und FP-SICHER Zweit-Blick)
- **FP-DSP** (8 Befunde, alle behoben): (1) Mip-Größen nach §10.1 (bis 64 Punkte) falteten Welle 27 bei C7 um −29 dB (Bilder der
  linearen Interpolation, (k/N)²) → Stufen ≥ 1024 Punkte. (2) Gleichleistungs-Blende mit Knick in der Gain-Kurve → Smoothstep.
  (3) Speicherwelle ×1,2 CPU → schneller Pfad ohne Wrap-Positionen, Index in Tabellen-Samples. (4) Pan-Patch mit cos/sin je Block →
  Sinustabelle; Patch-Glättung nur solange sich etwas bewegt. (5) Stimmwelle mit drei Divisionen je Sample → Form je Block.
  (6) 35 nicht auf Spitze 1 bei 220,27 Hz → Faktor aus diesem Satz. (7) Oktav-Welle 36–40 ms bis zur Übergabe → schrittweiser Bau,
  nur die Mip-Stufen des Tonbereichs je Oktav-Satz, `MessageChannel`. (8) Einzelwelle im ersten (kalten) Bau 18 ms in einem Stück →
  Bau stufenweise; synchron bleibt nur die Einzelwelle eines eben geladenen Sounds (warm ≈ 2 ms). Geprüft: eine W-Quelle (neue
  Konstanten nur im Worklet), aus = bitgleich, NaN/Inf, Filter-Stabilität W-29 (C8, C1/C2 127: −34 dBFS), Denormale (letzte 10 s ≤
  erste 10 s, Wellen 3–6), Worklet-ASCII, ECO (`v3-mk1-eco` alles; Wellen 4–6 → Säge, Sinus× → Sinus wie B.5).
- **FP-KLANG** (3 Befunde, begründet): (1) Die Speicherwellen haben je Spitze 1, ihr RMS liegt daher zwischen −14,2 dBFS (30) und
  −1,8 dBFS (17), Spanne 12,4 dB – so verlangt (B.6, MK2 Umfang 3), Pegel zwischen den Wellen sind unbekannt; Vorschlag: Pegel-Faktor
  je Welle mit MK8/MK10 (Pegel-Nachlauf). (2) Stimmwelle ist mit zwei Tiefpässen bei 300 Hz sehr dunkel (M-SP 220–335 Hz bei C3) →
  Geräte-Abgleich. (3) 61–64 zwischen den Oktav-Stützpunkten (Lücken).
- **FP-SICHER** (0 Befunde): Datenblock nur Base64-Zahlen, keine Namen (64 Namen in `index.html` und in den Testskripten 0 Treffer;
  `v3-mk2-wellen.mjs` liest sie nur zur Prüfung aus der privaten Datei), Bild-Referenz/PDF/Nachzeichnung bleiben in
  `scratchpad/dwgs-trace` (nicht im Repo, nicht in der App); AM-Teil 0 Markenwörter, ganze Datei 0 × microKORG/RADIAS/DWGS, „MS 2000“
  genau einmal; keine Bild-Daten, keine neue Schrift; kein neuer Weg vom Gerät weg.

### Abweichungen
- **Datenblock 12,3 KB statt ≤ 9 KB** (MK2-12): Prot. 58 baut alle 3 136 Teiltöne der Kompaktdatei ein (die Daten-Zeile „K = 32 · r“
  ist dadurch überholt); Kopfbyte je Welle trägt zusätzlich K/32 − 1 (Bits 2–3).
- **Abfall über dem letzten Teilton der Kompaktdatei** (K = 32 · r oder 64 · r), nicht über Teilton 32 – Folge von Prot. 58. Ā bleibt der
  Effektivwert der Teiltöne 16r + 1 … 32r.
- **Mip-Größen 2048, 2048, 2048, 1024 × 8** statt §10.1 (2048 … 64): nötig für B.6 Nr. 12 bei C7 mit linearer Interpolation; laut Teil G
  Nr. 9 gilt die MK2-Festlegung als gemeinsame Definition (V8a, V4e, V9a). Speicher 57 KB je Satz.
- **Stimmwelle (W-28):** Die Offenzeit ist **in ms fest** (OQ = 0,3 + 0,5 · m gilt bei C4, höchstens 0,9 der Periode); nur so bleibt
  die Hülle in Hz bei Tonhöhenwechsel (MK2-02; mit relativem OQ wichen C2/C4 um 8–14 dB ab). Pegel je Note: 1 / √OQ_eff · 1 / |H(f₀)|
  der Tiefpässe (RMS C2–C7 je FORM innerhalb 2,6 dB, C3 ≈ Säge − 1,6 dB). MK2-02 misst die Hülle als Leistung je Hz an den Terzmitten, bezogen auf den
  Gesamtpegel der Hülle in 400–4000 Hz (der Gesamtpegel aller Teiltöne hängt bei C4 vom 1. Teilton bei 262 Hz ab).
- **Normierung der Oktav-Wellen:** 35 ein Faktor aus dem 220,27-Hz-Satz; 61–64 ein Faktor je Oktav-Satz (die feste Hülle hält bei C1
  ≈ 12 dB mehr Teiltöne als bei C4).
- **M-KLICK bei Wellenwechseln** gegen den lauteren der beiden stehenden Zustände (Median 2 ms-Fenster vor/nach dem Wechsel): das
  reine M-KLICK (Median ± 20 ms) meldet jeden Wechsel von einer hellen zu einer dunklen Welle (z. B. 37 → 36: +4 dB Höhen = 6,4 dB),
  auch ohne Knack.
- **C7-Faltung am Oszillator gemessen** (Abgriff 'mix'): mit offenem Filter faltet Welle 27 (Energie bei 12–15 kHz) durch die
  Sättigung der Ladder −39,4 dB (MK1-Pfad, nicht die Tabellen); alle anderen ≤ −50 dB.
- **H-3 Sinus× X-MOD** mit OSZ 2 Dreieck im Band 400–1200 Hz geprüft; mit der Säge als Modulator fällt M-SP oberhalb X-MOD ≈ 96 wieder
  (Phasenmodulation, Bessel-Verlauf) – gewollter Charakter.
- **MK2-09** in getrennten Node-Prozessen (25-%-Quantil der 1-s-Fenster nach 5 s, Median aus 5 Paaren): in einem Prozess streuten die
  Zeiten durch die JIT-Zustände der Fälle ×2.
- **Pan-Patch:** ±63 aus der Mitte (voller Weg L ↔ R bei Intensität 63), nicht ±126.
- **Budget +53,6 KB** (2 742 396 → 2 797 302 B) gegen +42 KB (Prot. 58 ≈ +45 KB): +19 %; davon Datenblock 12,3 KB und ≈ 21 KB
  Kommentare. Unter der 50-%-Schwelle; Vorschlag wie MK1: SL1 packt `sq-mk-src`.

### Lücken
- **61–64 zwischen den Oktav-Stützpunkten** (MK2-12 gespielt): Die Stimme mischt zwei Oktav-Sätze; bei 187,5 Hz (zwischen C3 und C4)
  weichen einzelne Teiltöne bis 12–20 dB von der Hülle in Hz ab (formantreiche Hülle mit Tälern), an C3/C4 ≤ 0,31 dB. Mit ≤ 8 Sätzen
  je Welle (B.6 Nr. 6) nicht genauer; die echten Wellen (MK10) klären, ob das Gerät hier überhaupt eine feste Hülle hat ([U]).
- Oktav-Welle bis zur Übergabe 28,7 ms in Chromium; am iPhone (× 2–2,5 unbelegt) eher 40–60 ms – solange spielt die Platzhalter-Säge
  und blendet dann in 2 ms über. Öffnen der Wellen-Liste baut alle Wellen vorab.
- Leistungs-Probe `quantum_max_ms` 7–9 ms in Chromium headless (wie 4.9.0: 6–8 ms; Date.now-Raster, erste Quanten), `frames_ok` wahr.

### Datenbank / Am Server offen
- Nichts. Kein Supabase-Aufruf. `save_project` mit Format 5 und App 4 010 000 ≤ `max_app` 4 021 000.

### iPhone-Prüfpunkte (Xander, ≈ 4 min)
1. MS 2000 → EDIT-WAHL 1 auf OSZ 1 → WELLE „Speicherwelle“, dann STEUER 2 langsam durchdrehen: jede Welle klingt anders, kein Knacken,
   im LCD „Speicherwelle n · Gruppe ≈“. Tipp auf STEUER 2 = Liste mit 64 Wellen.
2. EDIT-WAHL 2 auf PATCH 1: QUELLE LFO 2, ZIEL CUTOFF, INTENSITÄT +40 → der Klang „wabert“ im LFO-Takt.
3. WELLE Sinus× (STEUER 1 hoch), Stimmwelle (STEUER 1 0 / 64 / 127), Rauschen (STEUER 1 = 24, STEUER 2 = 127: das Rauschen pfeift auf
   der gespielten Note).
4. Menü → Info → Leistungs-Probe (Fall „Kern“ mit Speicherwelle und Sinus×): Ergebnis bitte schicken.

### Geräte-Abgleich (microKORG, nach Gehör; ändert nur die W-Tabelle in einem MK2-fix)
- Stimmwelle FORM 0 / 64 / 127 – ist unsere viel dunkler?
- Sinus× X-MOD 64 (OSZ 2 Dreieck, +12).
- Rauschen CUTOFF 24, RESO 127: gleiche Tonhöhe wie die Taste?
- Einzelne Speicherwellen als Vorgeschmack; 3, 28, 59 auf A3: liegt der Grundton am Gerät eine Oktave (3) bzw. Quinte (28, 59) tiefer?

## MK2-fix — Stimme-Wellen mit fester Hülle, CPU der Oktav-Wellen, Stimmwelle oben, Wellen-Liste per Finger · App bleibt 4.10.0 · Format bleibt 5

Vorgänger für alle Vergleiche: **4.10.0 (MK2)** = `synq-snapshots/MK2.html` (2 797 302 B). Neu: 2 811 352 B (+13,7 KB, davon ≈ 6 KB Kommentare).
Kein Datenbank-Bedarf, kein Supabase-Aufruf (`max_app` 4 021 000 deckt 4 010 000).

### Behobene Befunde
1. **MK2-12 „gespielt“ für 61–64 (zwei Meldungen, major).** Vorher: bei 187,5 Hz einzelne Teiltöne 11–19 dB neben der Hülle in Hz, auch bei
   220,27 Hz (A3, der Ton der Nachzeichnung) 13–17 dB; genau nur an C3/C4. Ursache: die Stimme mischte die Oktav-Sätze C(j)/C(j+1) je
   Teilton-Nummer, das verwischt jede Formant-Hülle. **Neu: Notentabellen.** Jede Stimme spielt bei 35 und 61–64 eine Tabelle, die für
   ihre eigene Tonhöhe gebaut ist (Taste + TRANSP. + TUNE + Unisono-Verstimmung; Vibrato, Bend und PATCH-Tonhöhe lesen sie wie ein Sampler):
   Teilton k = Hülle(k · f / r) aus denselben Daten und derselben Formel wie `MKTAB.harm` (neu `MKTAB.env/envA/envMsg`, im Worklet
   `mkEnvA`, gleicher Text), Phasen je Teilton-Nummer wie bisher, Pegel = die Faktoren der Oktav-Sätze, linear in dB über log f
   interpoliert. Die Hüll-Daten gehen mit der Welle ins Worklet (`{mkw}.e`, ≈ 9 KB je Welle). Gebaut wird im Worklet in Scheiben (inverse
   FFT wie MKTAB, je Quantum und Kontext 512 Schmetterlinge, solange der Code kalt ist ≈ 0,25 ms, danach eine ganze Stufe ≈ 0,05 ms), nur
   die Mip-Stufen für die Tonhöhe ± 7 HT, die letzten 48 Tabellen bleiben im Kontext (≤ 1,6 MB, zusätzlich zu `mkInfo().tableBytes`).
   Bis die Tabelle da ist (warm ≈ 3 Quanten, ganz kalt ≈ 0,1–0,2 s) und weiter als 7 HT von ihrer Tonhöhe spielt die Stimme den
   Oktav-Mix wie bisher; dazwischen 60 ms lineare Überblendung am selben Lesezeiger. Die Oktav-Sätze selbst sind bitgleich zu 4.10.0.
   - Nachher (`v3-qa-mk2-a4.mjs`, Chromium 1243, `mkRender`): 187,5 Hz: **keine** Welle über 1 dB (61–64 ≤ 0,1 dB; 1–60 wie vorher ≤ 0,59 dB);
     61–64 bei 130,8 / 155,6 / 187,5 / 220,27 / 261,6 / 311,1 / 440 Hz ≤ 1,0 dB (Teilton 15 von 61 bei 311 Hz, −40-dB-Rand), sonst ≤ 0,6 dB.
     `v3-mk2fix-k12chr.mjs` (= `v3-sp-mk2-k12chr.mjs` auf dem neuen Stand): 187,5 Hz 0,1/0,1/0,0/0,0 dB, 220,27 Hz 0,1/0,2/0,2/0,0 dB
     (vorher 18,4/16,2/19,4/11,1 und 17,4/15,9/17,3/13,4). `v3-sp-mk2-k12.mjs` (Node): 61–64 ≤ 0,02 dB bei 130,8 … 261,6 Hz.
     `v3-rp-mk2k12-indep.mjs`: ≤ 0,3 dB; Formant-Lage von 63 folgt der Hülle in Hz (1048–1176 Hz statt 784–1572 Hz).
     `v3-rep-mk2-61env.mjs`: gegen `harm(n, F)` und gegen die Nachzeichnung bei 220,27 Hz ≤ 0,8 dB.
2. **MK2-09 CPU der Oktav-Wellen (major).** Vorher ×1,27–1,35 der Säge (4 Lesungen je Sample im allgemeinen Weg). Jetzt lesen 35/61–64
   ihre Notentabelle im schnellen Weg der Einzelwellen. Dazu: (a) der schnelle Weg kann jetzt auch Stufe a mit 2048 und a + 1 mit 1024
   Punkten (vorher allgemeiner Weg je Sample, betraf z. B. 34 und alle Töne unter ≈ G3), (b) Mip-Lage nur neu, wenn sich die Tonhöhe
   bewegt (kein log2 je Block), (c) die Mischwege (Wellenwechsel, Oktav-Mix, Überblendung) in eigener Methode `osc1g`, (d) eine
   unveränderte Notentabelle prüft je Block nur 4 Werte. Nachher (`v3-qa-mk2-cpu.mjs`, Median aus 5 Paaren, eigene Prozesse):
   INIT tab23 1,055 · tab34 1,076 · **oct61 1,071 · oct35 1,082** · Stimmwelle 1,049 · Sinus× 1,125 · 4 Patches 1,03;
   voll tab23 1,066 · tab34 1,069 · **oct61 1,070 · oct35 1,063** · Stimmwelle 1,061 · Sinus× 1,082 · Patches 1,037.
   `v3-rep-mk209.mjs` (7 bzw. 5 Paare): 61 q25 1,055–1,076, 62 1,012, 63 1,079, 64 1,072, 35 1,083–1,089 (Streuung der Maschine ±4 %).
3. **Stimmwelle FORM/WFM ohne Wirkung ab ≈ G5 (major).** Die Offenzeit war in ms fest bis 0,9 der Periode. Jetzt OQ = 0,3 + 0,5 · m
   der Periode ab C4 (W-28 wörtlich), darunter dieselbe Offenzeit in ms wie bisher (die Hülle in Hz C2/C4 bleibt, MK2-02 1,12/1,61/2,48 dB).
   Nachher (`v3-rep-mk2-voxform.mjs`): FORM 0 → 127 ändert M-SP um 0,68 / 0,61 / 0,43 / 0,36 / 0,33 / 0,30 Okt bei C2 … C7 (vorher C6/C7
   bitgleich, 0 Okt); WFM-Hub 0,58 / 0,42 / 0,34 / 0,32 / 0,30 Okt bei C3 … C7 (vorher 0 bei C6/C7). C7 gefaltet −59,9/−67,7/−68,7 dB.
4. **Stimmwelle: Plopp bei jedem Anschlag ab ≈ C6, Ausfall über E8 (major).** (a) Der Mittelwert des polyBLAMP-Terms (jb/2 je Periode)
   steht jetzt im Gleichanteil; mit dem Pegelausgleich 1/|H(f₀)| (bis ×260 bei C8) trieb er die Ladder in die Sättigung. Gleichanteil am
   Oszillator jetzt −70 … −91 dB (vorher −48 / −24 / 0 / +24 dB bei C6 / C7 / C8 / Note 120). (b) Im ersten Block der Stimmwelle einer Stimme
   laufen die beiden 300-Hz-Tiefpässe 10 ms ein (gleiche Form und Pegel, Phase 10 ms vorher), statt bei 0 zu starten. Nachher
   (`v3-sp-mk2-thump.mjs`, Node): Anschlag-Klumpen C5 −53,8 · C6 −54,3 · C7 −57,3 · C8 −70,9 dBFS (Säge −51,7 / −59,9 / −62,3 / −76,2; vorher
   −37,3 / −33,5 / −27,2 / −15,7). Grundton bis Note 120 bei −17,5 … −18,1 dBFS (vorher −35,6 bei 116, −119 bei 120). `v3-rp-mk2vox/chr.mjs`
   (Chromium): unter f₀/2 C5 … C8 −41,8 / −38,2 / −35,7 / −38,4 dBFS (Säge −42,6 / −41,9 / −40,9 / −43,8; vorher −28,9 … −7,7); C7-1/16-Folge
   Sub-RMS −64,7 dBFS (Säge −67, vorher −36,9).
5. **Wellen-Liste ließ sich nicht mit dem Finger scrollen (major).** `guardTouch` auf dem Pop brach jedes `touchstart` ab. Die Liste hält
   das `touchstart` jetzt bei sich (passiver Listener mit `stopPropagation`, nur in `wavePop`; `guardTouch` selbst unverändert); Tipps
   wirken weiter über `pointerup`, die Geister-Klick-Sperre bleibt. Nachher: `v3-sp-mk2/dbg-scroll.mjs` wie gebaut 214 px (P1) / 126 px (L1)
   (vorher 0); `v3-repro-wvscroll/run.mjs`: P1 erreicht Zeile 64, L1 1069 px nach 7 Wischern; `v3-mk2fix-touch.mjs` (CDP-Touch, DPR 3,
   P1 + L1) **18/18**: ein Wischer scrollt und wählt nichts, Zeile 61 und 64 per Finger erreichbar, Tipp wählt 120 bzw. 126. (Hinweis:
   `v3-sp-mk2-touch.mjs` meldet weiter c2 0, weil es Zeile 61 antippt, wenn sie im Fenster, aber unter dem Listenrand liegt – y 774 bei
   Listen-Unterkante 442; Skript-Grenze, kein App-Fehler.)

### Neue Prüfungen (Skripte in `dirigent-test/`)
- `v3-mk2fix-nt.mjs` (Node, App-Worklet) **15/15**: Notentabelle = `MKTAB.harm(n, F)` (35, 61–64, 6 Tonhöhen, max 0,00 dB); neue Tonhöhen
  (Mix → Tabelle) M-KLICK ≤ 4,7 dB; TUNE-Sprünge und -Zug M-KLICK ≤ Vorgänger + 1, M-EINBRUCH ≥ −0,3 dB; PATCH-Tonhöhe ±24 HT, Glide über
  2 Okt, Unisono endlich und nicht schlechter als vorher; längstes Quantum mit 4 neuen Tabellen (kalter Code) 1,02 ms gegen Einzelwelle
  1,02 ms; 72 Tonhöhen nacheinander; gefaltete Energie am Oszillator (35, 61, 63; C2 … C7) ≤ Vorgänger + 0,73 dB, alle ≤ −51 dB.
- `v3-mk2fix-touch.mjs` (Chromium, Touch) 18/18; `v3-mk2fix-k12chr.mjs`, `v3-mk2fix-voxchr.mjs` (QA-Skripte auf den neuen Stand gezeigt).
- Hilfen in `dirigent-test/v3-mk2fix/` (Bench, Debug).

### Regression
`v3-mk2-osc.mjs` alles PASS (MK2-01 … 07, FP-DSP, H-1/H-3; MK2-07 bitgleich zu 4.9.0, max |Δ| 0); `v3-mk2-wellen.mjs` alles PASS (Block
bitgleich, Form); `v3-mk2-marke.mjs` alles PASS (0 Markenwörter, „MS 2000“ einmal, Worklet-ASCII); `v3-mk2-pegel.mjs` wie vorher;
`v3-mk2-ui.mjs` 23/24 – MK2-08 „≤ 30 ms nach dem Laden“ schwankt auf dieser Maschine bei beiden Ständen (4.10.0: 28,5 / 41,5 / 28,3 ms,
neu: 28,1 / 23,3 / 24,8 ms Oktav-Welle; Einzelwelle einmal 37 ms), keine Verschlechterung; `v3-mk1-dsp` 64/64, `v3-mk1-ui`, `v3-mk1-eco`,
`v3-mk1-fpdsp`, `v3-mk1-probe` alles bestanden; `v3-mk1-look.mjs` 88/88 (echte Schrift aus `dirigent-wt/fonts`); `v3-fixgmk1-verify` 13/13,
`v3-fixgmk1-spiel` 11/11; QA-Skripte `v3-qa-mk2-*` (a1–a4, bit, e35, form, h, hash, lcd, load, pat, ph, probe, ring, sw–sw4, ui, ui2) wie
vorher oder besser; Oktav-Sätze bitgleich zu 4.10.0 (`v3-mk2fix/tabeq.mjs`, 64/64); Smoke ohne Fehler.

### Abweichungen (bitte im Spec-Abgleich bestätigen)
- **B.6 Nr. 6 / MK2-12:** Die Stimme blendet nicht mehr dauerhaft zwischen zwei Oktav-Sätzen, sondern spielt eine eigene Notentabelle; die
  Oktav-Sätze bleiben (bitgleich) als Übergang und für große Tonhöhen-Sprünge. Mit ≤ 8 Sätzen allein war MK2-12 (≤ 1 dB bei 187,5 Hz)
  nicht erreichbar – die Spec widersprach sich dort.
- **B.4 „Das Worklet rechnet keine Tabellen im Audio-Takt“:** Die Notentabellen entstehen im Worklet, aber in Scheiben (≤ ≈ 0,25 ms je
  Quantum kalt, ≈ 0,05 ms warm, gemessen x86 Node) statt eines kalten Baus (29 ms). Nur so hören sie auch `mkRender`, der Paar-Raum und
  `mk-node.mjs` ohne neuen Nachrichtenweg. Am iPhone (× 2–2,5) ≈ 0,6 ms im schlechtesten Quantum.
- **W-28:** OQ = 0,3 + 0,5 · m gilt ab C4; darunter bleibt die Offenzeit in ms (sonst Hülle C2/C4 8–14 dB daneben, MK2-02).
- Pegel der Notentabellen: Faktor der Oktav-Sätze interpoliert (keine eigene Spitze 1 je Tonhöhe); MK2-03 misst weiter die Sätze.

### Lücken
- Eine ganz neue Tonhöhe einer Stimme-Welle klingt die ersten ≈ 10 ms (warm) bzw. 0,1–0,2 s (erster Ton nach dem Laden der Seite) mit dem
  alten Oktav-Mix und blendet dann in 60 ms auf die genaue Hülle; Vibrato/Bend verschieben die Formanten mit (wie ein Sampler).
- Gefaltete Energie C8 der Stimmwelle: ein Rest-Gleichanteil-Schwanken aus den polyBLAMP-Lagen (−54,5 dBFS unter f₀/2 bei C8 in Chromium,
  33 dB unter dem Ton) – unhörbar, nur notiert.
- MK2-09 bleibt auf dieser Maschine knapp (Median 1,06–1,09 bei ±4 % Streuung); MK2-08 schwankt wie vor dem Fix.

### iPhone-Prüfpunkte (Xander, ≈ 2 min)
1. MS 2000 → OSZ 1 → WELLE Speicherwelle → Tipp auf STEUER 2: die Liste mit dem Finger bis „64 Stimme 4“ schieben, antippen.
2. Mit Welle 63 (Stimme 3) eine Tonleiter spielen: der Vokal bleibt gleich (vorher wanderte er innerhalb jeder Oktave).
3. WELLE Stimmwelle, OKTAVE dreimal hoch (LCD „Tastatur C6“): STEUER 1 von 0 nach 127 drehen – der Klang ändert sich; kein „Plopp“ beim Anschlag.

## G-MK2a-gruppe-fix — Kopfzeile „geändert“ und [A/B] sofort nach jeder MS 2000-Änderung · App bleibt 4.10.0 · Format bleibt 5

### Behobener Befund
- **Kopfzeile blieb nach einer Änderung im MS 2000-Panel „sauber“** (seit MK1, betrifft jede MK2-Wellen-/PATCH-Änderung): Knopf (z. B. SPIEL
  CUTOFF), WELLE-Liste, Speicherwellen-Liste (STEUER 2), PATCH 1–4 QUELLE/ZIEL/INTENSITÄT setzten `soundEdited` = true, aber der Punkt
  „geändert“ und [A/B] erschienen erst nach einem Spurwechsel. Ursache: `mkSetP` setzte `UI.dirty.edHead` nicht (der VA-/FM-Weg setzt es in
  `edParamChanged`). Jetzt setzt `mkSetP` das Flag bei jeder echten Wertänderung (eine Zeile, ~l.14634); `edHeadRefresh` läuft im nächsten
  Bild wie bei VA. Rückgängig/A/B laufen weiter über `applySound` (setzte das Flag schon).

### Prüfungen (`dirigent-test/`)
- `v3-qa-gmk2a-hdr.mjs` (P: 2/2; L: MS 2000-Prüfung PASS – die VA-Kontrolle findet im Querformat keinen Knopf unter y > 250 im Skript-Selektor,
  kein App-Fehler), `v3-rp-mkhdr-indep.mjs` P 6/6, `v3-rp-mkhdr-indep2.mjs` L 3/3 (A/B-Tipp wechselt auf B), neu `v3-gmk2afix-patch.mjs`
  (PATCH 1 INTENSITÄT per Finger → Punkt + [A/B] sofort, 2/2). Smoke ohne Fehler.

### iPhone-Prüfpunkt (Xander, ≈ 30 s)
1. MS 2000-Sound speichern, dann einen Knopf drehen oder eine Speicherwelle wählen: neben dem Namen erscheint sofort der Punkt und [A/B].

## MK3 — Zwei Timbres, Split, Stimmung · App 4.11.0 (`APP_CODE` 4 011 000) · Format bleibt 5

**Vorgänger-Stand** für alle Gleichheits-Abnahmen: **4.10.0** (MK2 = `synq-snapshots/MK2.html`, 2 797 302 B).
Parallel-Bau im Zweig `mk-br-MK3` (Kopie von MK2). Geändert nur: AM-Zweig des Worklets (`/*MK{*/ … /*}MK*/`, W-43 in `MKW`),
Block `sq-mk-src` (Bedienfeld), `SQMK.normMk` (2 Zeilen: `usc`), AM-Helfer im Hauptfaden (`mkSetP`, `mkwFeed`, `mkWaveOf`, `mkRelSec`,
`mkRender` mit `o.solo`), drei Einhänge-Zeilen außerhalb (`inputDown` → Split ← nächste Note, LCD-Zeile → `UI.lcdX`/`UI.mkSplitTap`,
`closeEditor` → `MKUI.leave`), ⋯-Menü (3 Zeilen), Hilfe (3 Zeilen), `VERSION`.
**Neustart-Hinweis:** Ein erster Lauf wurde nach ≈ 25 min unterbrochen (Container); sein halbfertiger Stand (Worklet, Bedienfeld) wurde
nicht verworfen, sondern geprüft, vervollständigt und mit allen Abnahmen neu getestet.

### Gebaut
1. **Programm-Ebene im Worklet** (`MkCore` hält jetzt zwei `MkTim`): Single (nur T1, bitgleich zu 4.10.0), Dual (= Schicht: beide je
   Note), Split (Note < `split` → T1, sonst T2). Stimmen-Teilung nach `tv` 1+3 │ 2+2 │ 3+1; ein Timbre mit 1 Stimme spielt mono;
   **Mono-Regel**: ein Mono-Timbre belegt 1 Stimme, daneben Poly 3 bzw. Unison 2, beide Mono 1 + 1; Unison nutzt die Stimmen seines
   Timbres; Priorität/Rückgabe je Timbre (MK1). Begrenzer-Stufe 2: Dual/Split 1 + 1, Stufe 1: Unison ≤ 2 (nur neue Noten).
   Zufall je Note = hash(Seed, Timbre, Zähler dieses Timbres), globales S/H je Timbre eigener Zähler (B.4 Nr. 3) → Dual = Summe.
2. **Umschalten** von MODUS, STIMMEN, SPLIT und Zuweisung bei klingenden Noten: `engXf`-artig (alte Stimmen 40 ms als Geister
   mit cos-Blende, gehaltene Tasten unter der neuen Regel neu verteilt, gleiche Taste im gleichen Timbre erbt den Zustand, Einblendung
   sin über 40 ms bzw. den Attack).
3. **Stimmung (W-43)**: 10 Stimmungen + Grundton, je Note vor der Tonhöhe (gestimmte Tonhöhe `tp` ist Ziel, Portamento-Start und
   Keytrack-Grundlage KT); Eigene Stimmung `usc` (12 × −100…+100 ct, Bruchwerte während der Geste); Wechsel bei gehaltenen Noten
   stimmt die klingenden Stimmen um (ohne Klick). Tabelle genau einmal in `MKW.SCL` (der Hauptfaden liest dieselbe Quelle).
4. **Solo** (`{mkSolo}`, nicht gespeichert): nur das gewählte Timbre klingt, 5-ms-Rampen; ein stilles Timbre übernimmt die
   Solo-Verstärkung sofort (keine Rampe ins erste Anschlag-Stück).
5. **Bedienfeld** (B.3): STIMME Ebene 1 EINZELN/SCHICHT (Einzeln │ Schicht │ Split, Liste per Tipp), Ebene 2 STIMMEN (1+3 │ 2+2 │ 3+1)
   und SPLIT (C-1…G9; LCD „darunter T1, ab hier T2“); EDIT-WAHL 2 Stellung **STIMMUNG** (STIMMUNG, GRUNDTON; ◎-Punkt bei Abweichung).
   **TIMBRE-Taste** aktiv: Tipp T1 → T2 → beide → T1 (LEDs 10/01/11), bei EINZELN T2 gesperrt mit LCD-Hinweis; „beide“ = jede Geste
   ändert T1 und T2 um denselben Schritt (Anzeige und Startwert T1; Listen: gleicher Wert; ein Undo); **SHIFT + TIMBRE** = Solo
   (LED blinkt, Tipp beendet; Wechsel/Schließen des Editors beendet ebenfalls). Alle Sektionen bearbeiten das gewählte Timbre, die
   LCD-Zeile trägt „T1 ·“/„T2 ·“/„T1+2 ·“ (nur bei Schicht/Split). ORIGINAL-LED und ◎ kennen die Timbre- und Programm-Pfade.
6. **Werkzeuge** SHIFT + 1 Timbre kopieren ▸ (Liste: dieser Sound und alle gesicherten MS-2000-Sounds der Bibliothek, je [T1] [T2],
   Zeilen 44 px), SHIFT + 2 tauschen, SHIFT + 4 Timbre neu (das gewählte Timbre = INIT); je ein Undo; auch unter ⋯ im Blatt.
7. **[Split ← nächste Note]** in der LCD-Zeile (STIMME, Split): die ganze LCD-Zeile ist die Taste (wie FEST); auch ein Tipp auf den
   SPLIT-Regler (EB2) macht sie scharf; die nächste gespielte Note wird `split` (ein Undo), die Note klingt dabei.
8. **Zusatz-Ansicht EIGENE** (Tipp auf die Matrix-Zeile STIMMUNG bei „Eigene“, die Zeile trägt „EIGENE ▸“): 12 Regler (Stufe ab dem
   Grundton, Notenname als Aufschrift), [◂ GERÄT] 96 × 44; P1 2 × 6 à 60 (360 px), L1/W 12 × 56 + 3 px (705), L2 12 × 50 + 3 px (633),
   P2 2 × 6 à 57, P3 2 × 6 à 48.
9. **Haupt-Faden:** Speicherwelle von T2 wird bei Schicht/Split mitgeladen; `mkRelSec` nimmt das längere Timbre; `mkRender(…, {solo})`;
   Version 4.11.0; 3 Hilfe-Zeilen (Namen aus `MK_LABEL`).

### Fach-Prüfung (N3 Teil F: FP-DSP ● Haupt, FP-TOUCH Zweit; selbst vor der Abnahme, ohne zweiten Agenten)
- **FP-DSP** (`v3-mk3-fpdsp.mjs`, `v3-mk3-timbre.mjs`, `v3-mk3-scale.mjs`): W-43 eine Quelle (`MKW.SCL`), unabhängig im Test aus der Spec
  abgeschrieben und gegengeprüft; „Aus = bitgleich“: Single 33 Fälle, VA, Gleichstufig mit 4 Grundtönen = 0; Extremwerte beider Timbres
  (Resonanz 127, alle Mixer 127, Unison 99 ct, PATCH ±63, Pelog/Eigene ±100) mit 20-s-Sturm aus 177 Noten (C-1…G9) und 80 Programm-
  wechseln (MODUS/STIMMEN/SPLIT/STIMMUNG/GRUNDTON/Zuweisung/Solo/EIGENE): kein NaN/Inf, Spitze −5,9 dBFS, danach keine Stimme an;
  Denormale: Dual mit stummem T2 (Solo) nach Vollaussteuerung 60 s, kein Fenster > 1,1 ×; M-KLICK/M-EINBRUCH aller Umschaltungen;
  CPU je Quantum; Worklet-ASCII (0 Nicht-ASCII-Zeichen). Neue IIR-Zustände gibt es in MK3 nicht.
  **Befunde: 3, alle behoben:** (1) Solo, vor der Note gesetzt, ließ das stumme Timbre 5 ms anklingen (Rampe von 1 auf 0 im ersten
  Block: Split-Gegenseite nur −56,7 dB statt ≤ −60, Solo-Rest −64,5 dB statt ≤ −90) → ein stilles Timbre übernimmt die Solo-Verstärkung
  sofort (Setter + Block), jetzt −600 dB; (2) M-EINBRUCH mit einem Akkord aus nicht verwandten Noten schwankt schon ohne Umschalten
  ±4 dB je 5-ms-Fenster (Schwebungen) → Messung mit Oktav-Akkord 69/81/93 (s. Abweichungen), der Akkord bleibt für M-KLICK; (3) ein
  fehlender Ende-Bericht (`end`) einer Note in der Sturm-Prüfung → Ursache liegt in MK1 (s. Lücken), nicht im MK3-Code.
- **FP-TOUCH** (`v3-mk3-ui.mjs`, `v3-mk3-shot.mjs`, Regression `v3-mk1-look.mjs`): M-SKIZZE (IoU 1,000, 88/88), M-PLATZ und Treffer
  ≥ 44 × 44 ohne Überlappung in 9 Formaten (P1, P2 A/B, P3 A/B, L1, L2 A/B, W, L1 und 926 × 428 mit Safe-Area, L1 + Home-Balken A/B)
  × 11 Zuständen mit echter App-Schrift = 143 Fälle; M-ANSICHT beim Timbre-Wechsel 0 px; ein Undo je Geste/Werkzeug; Haptik `tick`
  an TIMBRE, Solo und Split-Taste. **Befunde: 4, alle behoben:** (1) die LCD-Taste [Split ← nächste Note] war nur das 10-px-Schild →
  die ganze LCD-Zeile ist die Taste (Höhe der Zeile s. Abweichungen), der SPLIT-Regler (44 × 44) macht sie ebenso scharf; (2) Fachwort
  „Edit Sync“ in LCD und Hilfe → „beide zugleich“; (3) nach einem Wechsel auf EINZELN von außen (Undo, API) meldete die Taste noch T2
  → Tipp setzt T1, `mkPanel().timbre` = 1 bei EINZELN; (4) Liste EDIT-WAHL 2 rief für STIMMUNG den PATCH-Text (TypeError im
  unterbrochenen Lauf) → eigene Zeile „Stimmung · Grundton“. Dazu FP-SICHER-Teilprüfung B.6 Nr. 9: ein Kommentar enthielt die
  Zeichenfolge des Engine-Namens (zweiter Treffer) → umformuliert, ganze Datei wieder genau 1 Treffer (`MK_LABEL`).

### Abnahme (Skripte in `dirigent-test/`: `v3-mk3-timbre.mjs` 30/30, `v3-mk3-scale.mjs` 6/6, `v3-mk3-ui.mjs` 37/37, `v3-mk3-fpdsp.mjs` 6/6; Node 22 bzw. Chromium 1243)

| ID | Ergebnis |
|---|---|
| MK3-01 | ✓ Dual 2+2 / 1+3 / 3+1 = Summe der Einzel-Renders (Solo T1 + Solo T2) mit Rauschen, S/H, PATCH: max \|Δ\| 2,6e-8; ebenso T1 allein (T2 PEGEL 0) + T2 allein: 2,4e-8; gleicher Seed gleich, anderer Seed anders |
| MK3-02 | ✓ 1+3 Dreiklang: T1 [67], T2 [60 64 67]; 2+2 Vierklang: je [67 72] (Letzte), T1 Tiefste [60 64] / T2 Höchste [67 72]; 3+1 spiegelbildlich; T1 Unison in 2+2: 2 gestapelte Stimmen, T2 eine; T1 Mono + T2 Poly, 4 Tasten: T2 [64 67 72]; T1 Unison + T2 Mono: 2 + 1; beide Mono 1 + 1; Rückgabe der gehaltenen Taste |
| MK3-03 | ✓ Split C4: C3 und H3 nur T1, C4 und C5 nur T2 (Gegenseite −600 dB); [Split ← nächste Note]: E4 → `split` 64, ein Undo, danach nicht mehr scharf, ↶ = 60; Tipp auf SPLIT (EB2) ebenso (C5 → 72); Ziehen ändert, LCD „darunter T1, ab hier T2“ |
| MK3-04 | ✓ TIMBRE T1 → T2 → beide → T1, LEDs 01/11/10; Bearbeitung mit T2 (CUTOFF 127 → 98) lässt T1 deep-equal, ein Undo, LCD „T2 · FILTER · …“; EINZELN: T2 gesperrt mit LCD-Hinweis, Taste bleibt T1 |
| MK3-05 | ✓ SHIFT + 1: Liste (dieser Sound + Bibliothek, [T1] [T2] je 52 × 44), Quelle T2 → T2 und T1 → T1 deep-equal; SHIFT + 2 zweimal = Ausgang; SHIFT + 4 = INIT-Werte, T2 unverändert; je ein Undo; ⋯ zeigt die drei Werkzeuge (48 px) |
| MK3-06 | ✓ alle 10 Stimmungen × Grundton C und A × C4…H4: Abweichung zu W-43 höchstens 0,068 ct (Spektrum, Blackman 2¹⁵) bzw. 0,011 ct (Nulldurchgänge); Eigene (Grundton E) 0,057 ct; Gleichstufig mit Grundton C/E/A/H bitgleich zu 4.10.0; T2 gestimmt (Pelog E4 −130,0 ct); Wechsel bei gehaltener Note ohne Klick (2,9 dB) |
| MK3-07 | ✓ 11 Single-Patches × 3 Programm-Varianten (mit T2-Inhalt, Grundton, `tv`/`split`) bitgleich zu 4.10.0 (max \|Δ\| 0); VA bitgleich |
| MK3-08 | ✓ Dual 2+2 gegen Single 4 Stimmen: 0,99 × (Quantum, Minimum aus 7 verschachtelten Läufen, auf einen Kern gebunden 1,008 ×; CPU-Zeit 0,93 ×); nie mehr als 4 klingende Stimmen (4 Modi × 5 Zuweisungs-Paare × 12 Tasten; eine gestohlene Stimme in ihrer 5-ms-Blende zählt nicht, wie MK1) |
| MK3-09 | ✓ Einzeln↔Schicht, Schicht↔Split, Einzeln→Split, STIMMEN 2+2→1+3, 1+3→3+1, SPLIT 60→62, T2 Poly→Mono bei klingenden Noten: M-KLICK ≤ 5,0 dB, M-EINBRUCH ≥ −0,24 dB; danach keine hängende Note |
| MK3-10 | ✓ M-PLATZ/Treffer 143 Fälle (s. FP-TOUCH), M-SKIZZE 88/88 (Regression `v3-mk1-look.mjs`), M-ANSICHT 0 px; EIGENE-Maße wie Spec (P1 360, L1 705, L2 633), Regler ändert `usc`, ein Undo, [◂ GERÄT] zurück |
| MK3-11 | ✓ Regression s. unten; Budget **+28,7 KB** (2 797 302 → 2 826 651 B) ≤ +33 KB; Startzeit ohne AM +4 ms, mit AM +17 ms (Median aus 5); PE1 L1/P1 59,9 fps, 0 longtasks; Smoke-Test ohne Fehler; Hilfe 3 Zeilen; Worklet-ASCII |
| MK3-12 | ✓ PEGEL T1 0 → T1-Anteil −600 dB; PAN T1 L63/T2 R63: Trennung 76 bzw. 78 dB; KEYTRACK +48 mit Werckmeister III: Cutoff-Abweichung = W-43 ± 0 ct (C4…H4) |
| MK3-13 | ✓ „beide“: CUTOFF-Zug Δ 23/23, ein Undo, ↶ stellt beide her; SPIEL RELEASE ebenso; Taste ändert `soundHash` nicht; SHIFT + TIMBRE: Solo T1 (LED blinkt), T2-Anteil −600 dB (Node und Chromium-OfflineAudioContext), Tipp beendet, nichts gespeichert; Editor schließen beendet Solo |
| Hörbar | ✓ (Spec §0.3 H-1/H-3, B.6 Nr. 3) EINZELN → SCHICHT +4,5 dB; STIMMEN 1+3 ↔ 3+1 Band um 659 Hz 111 dB; SPLIT 0 ↔ 127 Band 2–8 kHz 75 dB; STIMMUNG/GRUNDTON/EIGENE über MK3-06 (ct-genau) |

**Regression** (Neubau gegen MK2 bzw. 4.8.1): `v3-mk1-dsp.mjs` 64/64, `v3-mk1-hear.mjs` 53/53, `v3-mk1-look.mjs` 88/88, `v3-mk1-ui.mjs` alle,
`v3-mk1-eco.mjs` alle, `v3-mk2-osc.mjs` alle, `v3-mk2-ui.mjs` alle bis auf die erwartete Zeile „MOD-FX … SEQ dunkel“ (STIMMUNG ist jetzt
aktiv), `v3-mk1-format.mjs` alle bis auf die erwarteten Zeilen „APP_CODE 4 009 000“ (jetzt 4 011 000) und – einmal von drei Läufen –
„64 Werks-Sounds bitgleich“ (1 Abweichung in einem Lauf, zwei Wiederholungen 0; Zeitfenster des Test-`flush` auf der geteilten Maschine),
`v3-mk1-fpdsp.mjs` alle bis auf die Denormal-Zeiten (schwanken auf der geteilten Maschine; derselbe Lauf mit 4.10.0 scheitert ebenso
5/58, Mediane gleich 7,5/4,3 ms). Markenwort-Prüfung B.6 Nr. 9 (a) AM-Teil 0, (b) ganze Datei 0 / genau 1 „MS 2000“.

**Bildschirmfotos:** `dirigent-test/v3-mk3-shots/<Format>-{stimme-split, stimme-eb2, filter-t2, filter-beide, solo, stimmung, eigene,
kopieren}.png` für P1, P2, P3, L1, L2, W (für Xanders Sicht-Abgleich).

### Abweichungen
- **LCD-Taste [Split ← nächste Note]:** Die ganze LCD-Zeile ist die Trefferfläche (wie das FEST-Schild). Sie ist so hoch wie die Zeile
  des Blattrahmens (L1 26 px, P1 36 px), nicht 44 px; der vollwertige 44 × 44-Weg ist der Tipp auf den SPLIT-Regler (SHIFT → STIMME).
  In P3 zeigt der Blattrahmen keine LCD-Zeile (Stand MK1); dort nur der Regler-Weg.
- **Solo bei „beide“:** SHIFT + TIMBRE schaltet T1 solo; ein zweites SHIFT + TIMBRE wechselt zum anderen Timbre (am Gerät Halten). „beide“
  bleibt dabei die Bearbeitungs-Wahl.
- **Prüf-Lesarten:** M-EINBRUCH (MK3-09) mit Oktav-Akkord 69/81/93 und zwei verschiedenen Timbres (gleiche Timbres löschen sich je nach
  Zufallsphase aus); M-KLICK mit dem Akkord 57/61/64. CPU (MK3-08) als Minimum über 7 verschachtelte Läufe (Median-Werte streuen auf der
  geteilten Maschine 0,7–1,8 ×; Messung ohne Fremdlast, auf einen Kern gebunden: 1,008 ×). Stimmenzahl ohne gestohlene Stimmen in ihrer
  5-ms-Blende.
- **Eigene Stimmung:** `usc` wird wie in MK1 (`normMk`, B.1 „nur bei scale 9“) beim Wechsel auf eine andere Stimmung verworfen; ↶ holt
  die Werte zurück. Beim Einschalten von „Eigene“ beginnt sie mit 12 × 0 ct.
- **Edit Sync bei Listen** (WELLE, TYP …): T2 bekommt denselben Listenwert wie T1 (kein „Δ“ bei Listen).

### Lücken
- **MK1-Fehler (Hauptlinie, hier nicht behoben):** Wird dieselbe Note wieder angeschlagen, während ihre vorige Stimme noch ausklingt
  (`polyOn`: „the same note releasing: the voice restarts“), übernimmt die Stimme die neue Kennung, ohne für die alte `end` zu melden
  (Probe: C4 an/aus/an/aus → nur die zweite Kennung endet, auch in 4.10.0). Der Proxy in `VOICES` bleibt dann bis zum Aufräumen
  1 s nach `stopAt` stehen. Vorschlag für die Hauptlinie: in `start()` bei `v.id !== k.id` vorher `endCheck(alte Kennung)`.
- Leistungs-Probe: MK3 bringt keinen eigenen Fall (Nachtrag 3 nennt ihn nicht); Chromium-Gegenprobe der Last nicht eigens gemessen.
- Am iPhone ungeprüft (Gerät): Solo-LED-Blinken, Haptik, Lesbarkeit der LCD-Zeile mit „T1 ·“.

### Datenbank / Am Server offen
Keine Änderung, keine Supabase-Abfrage. 4.11.0 = `p_app` 4 011 000 ≤ `max_app` 4 021 000, Format 5 ≤ `max_format` 5.

### iPhone-Prüfpunkte (Xander, ≈ 4 min)
1. MS-2000-Spur öffnen, EDIT-WAHL 1 auf STIMME, Regler 2 (EINZELN) antippen und in der Liste „Split“ wählen. SHIFT, dann Regler 3 (SPLIT) antippen und C4
   auf der Tastatur spielen → LCD „SPLIT · C4“.
2. TIMBRE einmal tippen (LED 2): FILTER CUTOFF hochdrehen → nur die obere Hälfte wird heller. TIMBRE noch einmal (beide LEDs) und
   RELEASE drehen → beide Hälften ändern sich gleich. Noch ein Tipp → LED 1.
3. Unten Bass (T1), oben Fläche (T2) bauen; SHIFT + TIMBRE → nur T1 klingt, LED blinkt; Tipp auf TIMBRE → wieder beide.
4. EDIT-WAHL 2 auf STIMMUNG, Regler 1 → „Werckmeister III“, Akkorde spielen; dann „Eigene“, Tipp auf die Zeile „STIMMUNG EIGENE ▸“
   → 12 Regler, einen Ton verstimmen, [◂ GERÄT].
5. SHIFT + 2 (Timbres tauschen) → oben und unten vertauscht; ↶ → zurück.

### Geräte-Abgleich (microKORG, nach Gehör; ändert nur Werte in einem MK3-fix)
Layer mit 2 Stimmen je Timbre (2+2) gegen „Schicht“; mehr Tasten als Stimmen (welche Note fällt weg); Mono/Poly-Layer (1/3);
Edit Sync und Solo (TIMBRE-Taste); welche Seite der Split-Grenze T1 ist.

## MK3-fix — Kopier-Liste per Finger, ⋯-Werkzeuge auf der offenen Spur, SPLIT ohne Abriss, Timbres in Phase, Solo/Split-Taste enden auf jedem Weg · App bleibt 4.11.0 · Format bleibt 5

### Behoben (7 bestätigte Befunde, 5 Ursachen)
1. **SHIFT + 1 „Timbre kopieren“: die Liste ließ sich nicht mit dem Finger scrollen (major).** `guardTouch(p)` auf dem Pop brach jedes
   `touchstart` ab. Wie MK2-fix bei `wavePop`: Die Liste `.plist.mkcp` hält ihr `touchstart` bei sich (passiver Listener mit
   `stopPropagation`); `guardTouch` selbst unverändert. Tipps wirken weiter über `pointerup`, ein Wischer kopiert nichts.
2. **⋯ → „Timbre kopieren ▸“ kopierte in die zuletzt gebaute Spur (P.i) statt in die offene (major).** `timCopyPop(anchor, t)` bekommt
   die Spur vom ⋯-Menü; `timCopy`/`timInit`/die Liste („dieser Sound“) arbeiten auf dieser Spur. `tDst(i)` nimmt die Timbre-Wahl nur aus
   dem Bedienfeld, wenn es zu dieser Spur gehört, sonst T1 (wie ein frisch gebautes Bedienfeld).
3. **SPLIT bei gehaltener Taste schnitt fremde Ausklänge ab (major).** `MkCore.after(route)` lässt ein Timbre, dessen gehaltene Tasten
   und Regel gleich bleiben, unberührt. `MkTim.reassign(list, keep, from)`: bei reinem Umleiten (poly) klingen Ausklänge nicht
   gehaltener Tasten weiter (außer auf derselben Note wie eine neu verteilte Taste).
4. **M-EINBRUCH bis −22 dB, wenn eine gehaltene Taste das Timbre wechselt (major).** Vor dem Umverteilen merkt sich `after()` die
   Oszillator- und LFO-Phasen jeder gehaltenen Taste (t1, t2, sp, l1, l2, tw/wn); die neue Stimme im anderen Timbre setzt sie fort
   (`inheritPh`). Gleiche Timbres löschen sich in der 40-ms-Blende nicht mehr aus.
5. **Schicht mit gleichen Timbres: Lautstärke je Note zufällig, einzelne Noten fast stumm (major).** Startphasen je Taste für beide
   Timbres gleich (`MkCore.notePh`): wer zuerst eine Stimme für die Taste startet, zieht sie wie bisher (Single unverändert,
   bitgleich), das andere Timbre übernimmt sie. Rauschen und S/H bleiben je Timbre zufällig (B.4 Nr. 3). Liste wird bei Ende der
   Kennung und bei `panic` geleert.
6. + 7. **Solo und [Split ← nächste Note] blieben nach ≡ (Menü) bzw. Projektwechsel aktiv (major, 2 Befunde).** `closeSheets()` ruft
   `MKUI.leave()`, wenn das Synth-Blatt offen war: jeder Weg aus dem Editor (✕, ≡, Browser, Projektwechsel …) beendet Solo und die
   scharfe Split-Taste. Zusätzlich nimmt `splitNote` eine Note nur an, solange genau dieser Editor offen ist.

### Proben (Node 22 bzw. Chromium 1243; der Pfad chromium-1194 aus dem Auftrag existiert hier nicht)
- Scroll: `v3-fpq-mk3-scroll.mjs` P1 0 → 152 px, L1 0 → 152 px (vorher 0), Liste bleibt offen, nichts kopiert; `v3-rep-mk3-cpscroll.mjs`
  ebenso; neu `v3-mk3fix-cpreach.mjs`: nach Wischern Ende erreicht (P1 388/388, L1 522/522), Tipp auf [T1] der letzten Zeile „Src 15“
  kopiert (CUTOFF 90), Pop zu, 0 Fehler.
- ⋯-Kopie: `v3-fpq-mk3-more.mjs` und `v3-rep-mk3-tcopy-stale.mjs` (P1 + L1, echte Tipps): Zeile „FM-Pluck (dieser Sound)“ = Spur 1,
  CUTOFF Spur 0/1 127/90 → 127/50 (vorher 50/90), Undo auf Spur 1.
- SPLIT-Ausklang: `v3-fpq-mk3-tail2.mjs` 0,6–0,9 s −19,4 / −19,4 dB (vorher −98,6), Zug 60→66 −19,4 (vorher −99,8);
  `v3-rp-mk3-splittail.mjs` T1-Ausklang und gehaltenes T2 unverändert (L −22,4/−22,4; R −18,1/−18,1).
- Loch: `v3-fpq-mk3-hole.mjs` alle Fälle 0/24 Seeds < −3 dB (schlechtester −1,4 dB, vorher bis −14,2); `v3-rep-mk3-hole.mjs`
  (strenge §16-Lesart) schlechtester −1,3 dB (vorher −22,4); `v3-rep-mk3-hole2.mjs` −0,5 dB (vorher −18,9);
  `v3-rep-mk3-hole-br.mjs` (Chromium-Worklet) −1,3 dB, Sanity-Fall weiter −28 dB. M-KLICK höchstens 5,1 dB (≤ +6).
- Phase: `v3-fpq-mk3-phase.mjs`/`-phase2.mjs` Schicht gegen Einzeln jede Note +6,0 dB (Sinus vorher −56,8 … +6,0);
  `v3-rv-mk3-phase-oac.mjs` (App-`mkRender`) Sinus/Dreieck/Säge 6,0–6,1 dB, 0 Fehler.
- Solo/Split-Taste: `v3-qa-mk3reg-leak4.mjs` P + L, ≡: −19,1 dB nach dem Menü (vorher −200); `v3-verify-solo-menu.mjs` P + L
  inkl. „Neu ▾“: −19,1; `v3-qa-mk3reg-leak2.mjs` ok; `v3-qa-mk3reg-arm.mjs` P + L und `v3-rep-mk3-armmenu.mjs` (Spur 1 und 4):
  split bleibt 60, Undo 1 → 1 (vorher 40/65/67, Undo 2).
- Regression: `v3-mk3-timbre.mjs` alle Fälle (MK3-01 Dual = Summe 2,6e-8; MK3-07 Single bitgleich zu 4.10.0 max |Δ| 0; MK3-09
  M-EINBRUCH ≥ −1,03 dB), `v3-mk3-scale.mjs` 6/6, `v3-mk3-fpdsp.mjs` 6/6, `v3-mk3-ui.mjs` 37/37, Smoke-Test ohne Fehler.
  MK3-08 CPU streut auf der geteilten Maschine (1,00–1,15 ×); A/B gegen `MK3.html` auf einem Kern: alt 1,046/1,034 ×, neu 1,001/0,952 ×
  (der Fix berührt nur den Notenstart). Worklet bleibt ASCII. Größe 2 829 915 B (+3,3 KB; MK3 gesamt +32,6 KB ≤ +33 KB).

### Abweichungen
- **MK3-13 M-KLICK-Lesart:** Säge (T1) + Rechteck (T2) derselben Noten starten jetzt in Phase; ihre Flanken fallen zusammen, und der
  Render **ganz ohne Solo** erreicht schon 6,1 dB bei 1,174 s (Eigenschaft des stehenden Klangs, kein Knack). Die Probe misst darum
  ±30 ms um die beiden Umschaltpunkte (mit 100 ms Umgebung): 3,4 dB (`v3-mk3fix-solo.mjs` zeigt die Gegenprobe für 6 Seeds).
- Neue Stimme im anderen Timbre übernimmt nur Phasen, nicht Hüllkurven oder Filterzustand (B.6 Nr. 2: sie beginnt mit Einblendung).

### Lücken / Hauptlinie
- `wavePop` (MK2) ist auf der Hauptlinie bereits mit demselben Muster behoben (MK2-fix Nr. 5); hier nicht angefasst.
- Der MK1-Befund zur Kennung beim Neuanschlag einer ausklingenden Note (s. oben) bleibt für die Hauptlinie offen.

### Datenbank / Am Server offen
Keine Änderung, keine Supabase-Abfrage.

## G-MK3-gruppe-fix — LCD-Zeile im Split hochkant lesbar · App bleibt 4.11.0 · Format bleibt 5

### Behoben (1 bestätigter Befund, major)
- **Split hochkant: Wert in der LCD-Zeile 0 px breit, ⋯ verdeckt die Taste.** Ursache: Hochkant hat `#synthSheet .lcd` rechts
  100 px Platz für ◎/⋯; `.lk` und die MK3-Taste `.lx.lsplit` schrumpfen nicht, also drückte die Taste `.lv` auf 0 px, und
  `lcdFit` sprang bei `clientWidth 0` sofort heraus (die Zeile lief 2–27 px in den ◎/⋯-Bereich).
  - Taste [Split ← nächste Note] hochkant zweizeilig („Split ←“ / „nächste Note“, 9,5 px, 59–70 px statt 109 px breit);
    quer unverändert einzeilig. Text und Tipp-Verhalten wie gehabt.
  - `lcdFit` (gemeinsamer LCD-Code, 3 Zeilen): prüft jetzt auch, ob die ganze Zeile überläuft (nicht nur `.lv`), und bricht
    erst bei unsichtbarer Zeile ab. Bleibt im Lauftext-Modus neben der Beschriftung < 48 px, läuft die Beschriftung mit
    (Klasse `mqk`, auch in `pv` zurückgesetzt). Beim Zusammenführen mit der Hauptlinie bitte diese Zeilen in `lcdFit`
    mitnehmen.
  - SPLIT-Wert im Split-Modus ohne „· Tipp = Split ← nächste Note“ (die Taste steht daneben); in Einzeln/Schicht bleibt der Tipp.
  - Scharf-Hinweis kürzer: „SPLIT · eine Taste spielen = Split-Punkt (darunter T1, ab ihr T2)“ (vorher Beschriftung „SPLIT ←
    NÄCHSTE NOTE“ doppelt zur orangen Taste).

### Proben (Chromium 1243; echte App-Schrift Barlow Semi Condensed/JetBrains Mono per @font-face aus `synquenzer/fonts`)
- `v3-gfix-mk3-lcdsplit.mjs` (Touch über CDP, P1 390×844, P2 375×812, P2se 375×667, P3, L1, L2; Schicht, Split, ZUWEISUNG Mono,
  SPLIT ziehen/losgelassen, scharf): **ALL OK** — LCD scrollWidth = clientWidth überall (P1 374/374, P2 359/359), `.lv` sichtbar
  (Split 36 px „Split“, Mono 28 px; SPLIT-Zug zweizeilig „T1 · STIMME · SPLIT 075 / E♭5 · darunter T1, ab hier T2“ 182–197 px),
  Taste endet bei 267 (P2) vor ⋯ (277), `elementFromPoint` am rechten Tastenrand = LCD. Auch mit Ersatzschrift (`NOFONT=1`):
  ALL OK. P3: LCD-Zeile dort absichtlich aus (`.lcd{display:none}`, unverändert; Split per Tipp auf SPLIT).
- Gegenprobe alte Fassung `MK3-fix.html` mit echter Schrift: P2 SPLIT-Zug `.lv` 19 px, scharf 14 px → FAIL.
- Melder-/Nachstell-Skripte `v3-rep-mk3-lcdsplit.mjs`, `v3-qa-gmk3-lcd3.mjs`, `v3-qa-gmk3-lcd5.mjs`: Wert sichtbar, keine
  Überdeckung, 0 Fehler. Bilder: `dirigent-test/v3-gfix-mk3/*.png`.
- Regression: `v3-mk3-ui.mjs` alles bestanden (inkl. MK3-10 M-PLATZ 143 Fälle mit echter Schrift, MK3-03 Split-Taste), Smoke-Test
  ohne Fehler (`v3-gfix-mk3-smoke.png`). Größe 2 830 935 B (+1,0 KB).

### Datenbank / Am Server offen
Keine Änderung, keine Supabase-Abfrage.

# CHANGES – MS 2000, Paket MK4 (Zweig-Kopie `mk-br-MK4`)

## MK4 — Effekte je Sound: MOD-FX, DELAY, EQ · App 4.12.0 (`APP_CODE` 4 012 000) · Format bleibt 5

**Vorgänger-Stand** für alle „bitgleich“-Abnahmen: **4.10.0** (MK2 = `synq-snapshots/MK2.html`, 2 797 302 B).
Zweig-Bau: Diese Kopie startet bei MK2 (4.10.0); MK3 (4.11.0) entsteht gleichzeitig in `mk-br-MK3`, MK2-Prüfungen laufen in `mk-wt`.
Der Orchestrator führt zusammen und setzt die VERSION-Zeile. Server: keine Änderung nötig (`max_app` 4 021 000 ≥ 4 012 000, Format 5).
Kein Supabase-Aufruf in diesem Lauf.

Hinweis zum Neustart: Diese Kopie enthielt schon halb fertige MK4-Arbeit eines abgebrochenen Laufs (Effektkern, Bedienfeld,
Test-Skript ohne grünen Lauf, leeres CHANGES). Sie wurde übernommen, geprüft, an 7 Stellen nachgebessert (siehe Fach-Prüfung) und fertig gebaut.

### Gebaut
1. **Effektkern im AM-Zweig des Worklets** (`class MkFx`, zwischen `/*MK{*/` … `/*}MK*/`, ASCII), stereo je Spur, Reihenfolge
   **MOD-FX → DELAY → EQ**, hinter der Stimmensumme und vor der unveränderten Spur-Kette (Drive, Chorus, Hall-/Echo-Send, Pump, Vol, Pan).
   - **MOD-FX** (W-31): Chorus/Flanger (1 ms + Hub dep/127 · 4 ms, Rückkopplung max(0,(dep−64)/63) · 0,85, L/R-LFO 90° versetzt,
     Catmull-Rom-Abgriff), Ensemble (3 Abgriffe 120° versetzt um 8 ms, Hub dep/127 · 3 ms, L = A1 + ½A2, R = A3 + ½A2),
     Phaser (6 Allpässe je Kanal, 200 Hz … 4 kHz, Rückkopplung dep/127 · 0,7). Tempo 0,02 Hz · 2^(9·spd/127).
     Mischung für alle Typen w = min(0,5; 0,6·dep/127).
   - **DELAY** (W-32, W-12): Stereo, Kreuz (Rückkopplung L↔R), L/R (Mono-Summe, Echos abwechselnd). Pegel dep/127,
     Rückkopplung 0,8·dep/127. ZEIT 1 ms · 2^(10,45·time/127) (1 ms … 1,4 s), TEMPO SYNC mit NOTE 1/32 … 1/1 im Song-Tempo,
     jede Note im ganzen Bereich 40–240 BPM ohne Kürzung (Puffer 6 s). Verzögerung in **ganzen Samples** (keine Interpolation,
     die Wiederholungen werden nicht dumpfer). ZEIT-, NOTE- und Tempo-Wechsel: der Lesekopf blendet in 40 ms gleichleistungsgemäß
     auf die neue Stelle (kein Sprung, kein Tonhöhen-Jaulen).
   - **EQ** (W-33): Tiefen- und Höhen-Kuhschwanz 2. Ordnung (Q 0,707) als TPT-SVF (B.6 Nr. 10), 40 … 1000 Hz bzw. 1 … 18 kHz,
     ±12 dB in 0,5-dB-Schritten. Koeffizienten je Steuerblock (16 Samples) aus geglätteten Werten (5 ms, Frequenz im Log-Maß).
   - **Aus = bitgleich:** Jede Stufe rechnet nur, solange ihre Tiefe/ihr Gain (Ziel oder geglättet) ≠ 0 ist; sind alle aus, gehen die
     Stimmen wie bisher direkt zum Ausgang (bitgleich zu 4.10.0).
   - **Schalten ohne Knacken:** Typ-Wechsel MOD-FX und DELAY bei laufendem Effekt 30 ms Gleichleistungs-Blende (alter Typ aus, neuer ein;
     ein weiterer Wechsel wartet). MOD-FX ein: die Tiefe steht sofort, nur die Mischung blendet mit 20 ms ein; aus: die Tiefe bleibt
     stehen, während die Mischung ausblendet. Stetige Werte 5 ms geglättet, Bruchwerte während der Geste (EN3-03).
   - **Puffer:** 6 s stereo Float32 je AM-Spur (2 304 032 B bei 48 kHz, 2 116 832 B bei 44,1 kHz), angelegt erst beim ersten
     `dly.dep` > 0 im Nachrichten-Weg (oder beim Laden eines Sounds mit Delay), nie in `process()`; vorher 0 Byte. Meldung `{mkFxMem}` an
     den Hauptfaden, `mkInfo().fxBytes` zählt alle Spuren.
   - **Nachklang:** Echo, Chorus-Rückkopplung und Filter klingen ohne Stimme weiter (`fxHot`), bis der Ausgang länger als die längste
     Verzögerung unter −110 dBFS liegt; dann rechnet der Zweig nicht mehr. Denormale: alle Rückkopplungs- und IIR-Zustände werden am
     Blockende bzw. beim Schreiben unter 1e-15 auf 0 gesetzt (B.6 Nr. 11).
   - **Leistung:** Der Effektzweig läuft **einmal je Render-Quantum** (128 Samples, nach den 8 Steuerblöcken der Stimmen; Aufruf
     `this.mk.fxEnd(L, R)` im Prozessor vor der Mono-Halbierung) statt je 16er-Block — das halbiert seine Kosten.
2. **Bedienfeld** (EDIT-WAHL 2, Stellungen 5–7 wie am Original, vorher dunkel „kommt mit MK4“):
   - **MOD-FX:** TYP (Liste Chorus/Flanger · Ensemble · Phaser, Anzeige CHO/EnS/PHA) · TEMPO (Hz des Effekt-LFO) · TIEFE (% Effekt-Anteil, 0 = aus).
   - **DELAY:** TYP (Stereo · Kreuz · L/R; StE/CrO/L-r) · TEMPO SYNC (an/aus) · **ZEIT │ NOTE** am selben Platz (wechselt mit TEMPO SYNC,
     Matrix-Zeile „ZEIT“/„NOTE“) · TIEFE (Echo-Pegel und Wiederholung in dB). NOTE ist ein stetiger Regler mit Rundung auf die 15 Werte
     (Haptik je Stufe), Tipp = Liste mit 15 Zeilen. LCD z. B. „DELAY · NOTE 1/8“ / „250 ms (Song-Tempo 120)“, Anzeige „1.8“ wie am Original.
   - **EQ:** TIEF-FREQ · TIEF-GAIN · HOCH-FREQ · HOCH-GAIN; Frequenzen logarithmisch (gleicher Weg = gleiches Verhältnis), Gains enden auf
     0,5-dB-Schritten, LCD in Hz/kHz und dB („EQ · TIEF-GAIN“ / „+4,5 dB“), Anzeige z. B. „4.5“, „6.00“, „18.0“.
   - Liste der EDIT-WAHL 2 zeigt je Effekt eine Zeile (z. B. „Kreuz · NOTE 1/8 · 250 ms · TIEFE 41“), Auswahl-LCD ebenso; ◎ markiert
     abweichende Effekt-Stellungen; ◎-Vergleich mit dem Original auch für `mfx`/`dly`/`eq`. Eine Geste = ein Undo. SHIFT+OKT ±1 kennt die
     0,5-dB-Schritte. Hilfe: zwei neue Zeilen (MOD-FX/DELAY/EQ, DELAY-Typen und TEMPO SYNC).
3. **Leistungs-Probe** (Menü → Info): Fälle „Kern“ und **„+FX“** (Kern mit allen drei Effekten: Phaser bzw. Cho/Flg, Delay Stereo 1/8
   TIEFE 64, EQ +6/−4 dB).
4. **Test-API:** `mkRender(sound, ev, {fxIn: {l, r}, fxFrz})` (Signal in den Effekteingang, Effekt-LFO eingefroren), Worklet-Nachrichten
   `{mkFxIn}`, `{mkFxFrz}`, Tap `'fx'` (Effektausgang ohne DC-Sperre), `mkInfo().fxBytes`.

### Abnahme MK4 (Node-Offline `v3-mk4-fx.mjs`, `v3-mk4-cpu.mjs`; Chromium `v3-mk4-ui.mjs`, `v3-mk4-pe1.mjs`, `v3-mk1-look.mjs`, `smoke.mjs`)
| ID | Ergebnis |
|---|---|
| MK4-01 | ✔ 32 Renders (3 Timbres × Mod-FX-Typ 0–2 × TEMPO 0/64/127 bei TIEFE 0, Delay alle Typen TIEFE 0, EQ 0 dB, dazu VA und FM6) gegen 4.10.0: max \|Δ\| = 0. Ohne Delay-TIEFE 0 Byte Puffer. |
| MK4-02 | ✔ Cho/Flg auf Rauschen, LFO eingefroren: TIEFE 100 Kerbtiefe 15,6 dB (≥ 12; W-31 ≈ 16,8), TIEFE 40: 4,1 dB (≤ 6). Kammabstand wandert 56 % (erste Kerbe 504 → 223 Hz). LFO-Periode aus der Verzögerung je 20 ms: 2,16 s gegen W-31 2,156 s (TEMPO 64). |
| MK4-03 | ✔ Ensemble TIEFE 127: Korrelation der nassen Signale L/R 0,19 … 0,24 (≤ 0,5) in 7 LFO-Stellungen; nasser Pegel −0,72 … +0,96 dB (± 1). |
| MK4-04 | ✔ Phaser TIEFE 127: 3 Kerben 16,6 / 19 / 20,2 dB (LFO unten) bzw. 20,5 / 22,4 / 18,2 dB (oben); tiefste Kerbe 53 → 1172 Hz = 4,47 Okt. |
| MK4-05 | ✔ Sync 1/8 bei 120 BPM: erstes Echo +12 000 Samples in L und R; TIEFE 64: −5,95 dB (W-32 −5,95); TIEFE 127: jede Wiederholung −1,94 dB, Spitze Impuls −6 dBFS. Info: ein 4-stimmiger Akkord mit Anschlag 1 und TIEFE 127 erreicht am Engine-Ausgang +2,1 dBFS (trocken −3,9; Echos addieren sich); der Nachhall fällt danach stetig; Begrenzer und Soft-Decke der Summe folgen (siehe Abweichungen). |
| MK4-06 | ✔ Kreuz, Impuls nur links: Echos L, R, L (> 250 dB Trennung, also nur ein Kanal); L/R mit Mono-Impuls: L, R, L, R. |
| MK4-07 | ✔ ZEIT 0/64/127: 1,00 / 38,48 / 1398,83 ms = W-32 (Abweichung < 0,1 %). ZEIT-Sprünge (90→110→60→100→30) und Zug 64→120 in 1 s bei laufendem Echo: M-KLICK ≤ 2,3 dB, M-EINBRUCH ≥ −2,1 dB. |
| MK4-08 | ✔ 120 → 90 BPM während des Echos: Impuls 0,5 s nach dem Wechsel echot nach 333,33 ms (genau, also < 1 Takt); M-KLICK 2,3 dB, M-EINBRUCH ≥ −0,6 dB. |
| MK4-09 | ✔ Tiefen-Kuhschwanz 100 Hz +12 dB: 25 Hz +11,94, 400 Hz +0,06, 1 kHz 0,00 dB. Höhen-Kuhschwanz 8 kHz −12 dB: 16 kHz −11,81, 2 kHz −0,04 dB. |
| MK4-10 | ✔ Echo eines Rauschstoßes trägt die Phaser-Kerben (246 / 914 / 4242 Hz, 19–22 dB); EQ 8 kHz −12 dB im Echo: −11,8 dB bei 16 kHz. |
| MK4-11 | ✔ Node-Offline, je Fall eigener Prozess, Median aus 5: alle drei Effekte an = **+0,72 … +0,79 × VA-Stimme** je Spur (Cho/Flg 0,79, Ensemble 0,72, Phaser 0,78; ≤ 1,0). VA-Stimme 4,66 ms je s Audio. Spitze je Quantum (99,9 %): Kern 0,31 ms, +FX 0,35–0,47 ms (Rauschen der Maschine; p50 +0,009 ms). Leistungs-Probe mit „+FX“ läuft (frames_ok, 0 Netzaufrufe). |
| MK4-12 | ✔ M-PLATZ in P1, P2, P3, L1, L2, W, L1 mit Safe-Area, 926 × 428 mit Safe-Area, L1 mit Home-Balken (Halb-Ansicht quer), Halb-Ansichten LINKS/RECHTS: MOD-FX, DELAY ZEIT, DELAY NOTE (Ebene 1 und 2), EQ (Ebene 1 und 2), alle Treffer ≥ 44 × 44, keine Überlappung, nichts abgeschnitten, kein Scrollen. M-ANSICHT ZEIT │ NOTE und Effekt-Stellungen: 0,00 px. Listen TYP (3), NOTE (15), EDIT-WAHL 2 (11): Zeilen ≥ 44 px, im Bild, gewählte sichtbar. H-1 / H-3 aller Effekt-Regler: siehe unten. MK1-21/MK1-32 (`v3-mk1-look.mjs`, 88 Prüfungen, M-SKIZZE) bestehen weiter. |
| MK4-13 | ✔ Spur-Effekte unverändert (Spur-Kette nicht angefasst; VA/FM6 und AM ohne Effekte bitgleich). Worklet ASCII. Markenwörter (B.6 Nr. 9): AM-Teil 0, ganze Datei genau 1× `MS 2000` in `MK_LABEL`. Keine Konsolenfehler (alle Läufe), Smoke-Test ohne Fehler. PE1: rAF-Median 59,9–60 fps, keine longtask > 50 ms, Noten wie Grundstand, 0 Tick-Fehler. **Budget: +24 967 B (24,4 KiB) ≤ 25 KB.** |
| MK4-14 | ✔ 1/1 und 3/4 bei 120/60/40 BPM: erstes Echo nach 96 000 / 72 000 / 192 000 / 144 000 / 288 000 / 216 000 Samples (genau). Tempo 120 → 40 → 120 BPM während des Echos: M-KLICK 2,0 dB. Puffer vor der ersten TIEFE > 0: 0 Byte, danach **2 304 032 B ≈ 2,3 MB je Spur** (48 kHz; Chromium mit 44,1 kHz: 2 116 832 B), einmal angelegt (zweites Einschalten legt nichts neu an). |

**H-1 (min → max)** MOD-FX TYP Cho/Flg → Phaser 10,2 dB (Band) · TIEFE 12,1 dB · TEMPO Periode ×108 (64 → 127; 0 = 50 s wäre zu lang für
einen Render) · DELAY TIEFE +42 dB Echo · ZEIT ×1399 · NOTE ×32 · TEMPO SYNC ×13 · TYP (Kreuz) Kanalwechsel · EQ TIEF-GAIN 24,0 dB ·
TIEF-FREQ 11,9 dB · HOCH-GAIN 23,1 dB · HOCH-FREQ 11,8 dB. **H-3** (0, ¼, ½, ¾, 1, kein Rückgang > 0,5 dB): Cho/Flg-Kerbtiefe
0 → 3,1 → 7,7 → 14,3 → 19,6; Phaser tiefste Kerbe 0 → 3,0 → 7,5 → 15,2 → 20,2; Ensemble L/R-Unterschied −120 → −31,7 → −25,1 → −22,1 → −19,8 dB;
Delay-Echo −48,1 → −17,9 → −12,0 → −8,5 → −6,0 dB; ZEIT, alle EQ-Regler stetig steigend. **Umschalten** (M-KLICK ≤ 6 dB, M-EINBRUCH
≥ −3 dB): Mod-FX-Typ 0→1→2→0 3,9 dB; Mod-FX-TIEFE 0→127→0 als Sprung 4,0 dB; Delay-Typ 2,3 dB; Delay-TIEFE und TEMPO SYNC 2,5 dB;
EQ-Sprünge 2,1 dB; Züge in 1 s (Phaser-TIEFE, Ensemble-TEMPO, Cho/Flg-TIEFE, Delay-TIEFE, NOTE 1/32→1/1, TIEF-FREQ, HOCH-GAIN) ≤ 4,7 dB.
**Im App-Pfad** (mkRender über das echte Worklet): Echo nach 250 ms bei −5,95 dB; EQ 4 kHz −12 dB senkt 8/12 kHz um 11,3/11,9 dB;
Ensemble macht aus Mono Stereo; Sound-Normalisierung (Laden/Speichern) behält alle Effektwerte (auch −3,5 dB).

### Fach-Prüfung (vor der Abnahme, selbst ausgeführt): FP-DSP (Haupt-Blick), FP-IPHONE (Zweit-Blick) — 9 Befunde, 8 behoben, 1 begründet
1. **FP-DSP / CPU (behoben):** Erster Stand mit Effekt je 16er-Block kostete +1,23 … +1,35 × VA-Stimme (MK4-11 verfehlt). Jetzt einmal je Quantum: +0,72 … +0,79.
2. **FP-DSP / Mod-FX-Sprung (behoben):** TIEFE 0 → 127 als Sprung blendete die Mischung nur in 5 ms ein (M-KLICK 6,1 dB). Jetzt Mischung 20 ms,
   Tiefe beim Einschalten sofort, beim Ausschalten gehalten: 4,0 dB.
3. **FP-DSP / Echo-Klang (behoben):** Lineare Interpolation bei gebrochener Verzögerung (z. B. 112 BPM bei 44,1 kHz: 1/8 = 11 812,5 Samples)
   machte jede Wiederholung dumpfer (−2,4 dB bei 10 kHz je Durchlauf). Jetzt ganze Samples; Prüfung: jede Wiederholung liegt ganz in einem Sample.
4. **FP-DSP / Nachklang (behoben):** Die Ruhe-Schwelle 1e-7 (−140 dB) ließ ein Echo 1,4 s / TIEFE 127 über 100 s weiterrechnen. Jetzt −110 dBFS.
5. **FP-DSP / EQ-Bauform (behoben):** Koeffizienten je 32 Samples → je Steuerblock 16 (B.6 Nr. 10). Abweichung: g wird je 16er-Block aus dem
   geglätteten Wert gesetzt, nicht je Sample interpoliert (TPT verträgt das; M-KLICK der EQ-Sprünge 2,1 dB).
6. **FP-DSP / Messung (begründet):** Ein Flanger mit Rückkopplung auf einem harmonischen Akkord schwillt von selbst an, wenn Kammspitzen und
   Teiltöne zusammenfallen (+6,0 dB im 2-ms-Fenster, auch in einem idealen float64-Flanger, `v3-mk4-dbg5.mjs`). M-KLICK auf diesem Akkord wird
   deshalb an den Umschaltpunkten (−5 … +80 ms) und über die Gesten gemessen, auf Rauschen über das ganze Signal.
7. **FP-DSP / LCD (behoben):** EQ-Gain zeigte „005“ statt „+4,5 dB“; EQ-LCD jetzt nur in Hz/kHz und dB.
8. **FP-IPHONE / PE1 (geprüft):** unbeschränkt rAF 59,9–60 fps, 0 longtasks, Noten wie Grundstand. Mit 4× CPU-Drossel haben Grundstand
   und MK4 gleichermaßen longtasks (Grundstand 1–5, MK4 0–7 je Lauf, beide 47–60 fps) — kein MK4-eigener Befund.
9. **FP-IPHONE / Speicher (geprüft):** 2,3 MB je AM-Spur mit Delay (8 Spuren ≈ 18,4 MB höchstens); der Puffer bleibt bis zum Neubau des
   Spur-Knotens (bewusst, damit ein Wieder-Einschalten nichts anlegt). Anlegen im Nachrichten-Weg des Audio-Fadens (Spec W-32); Chromium
   legt große Float32Arrays als genullte Seiten an (keine Kopierarbeit). Startzeit unverändert (Effekt-UI im nachgeladenen `sq-mk-src`).

### Abweichungen von der Spec (bewusst)
- **MK4-05 „kein Überlauf“** gilt für den Prüf-Impuls (Spitze −6 dBFS) und den stetig fallenden Nachhall; ein voller 4-stimmiger Akkord mit
  Anschlag 1 und TIEFE 127 erreicht am Engine-Ausgang +2,1 dBFS (wie am Gerät addieren sich Echos), danach folgen Begrenzer und Soft-Decke der Summe.
- **M-KLICK auf dem Akkord** an Umschaltpunkten und Gesten (Befund 6).
- **EQ-Koeffizienten je 16er-Block** statt je Sample interpoliert (Befund 5).
- **MK4-11** in Node (V8) gemessen; der iPhone-Faktor ist weiter unbelegt (§15.1).
- **MK4-02 Periode** über die laufende Verzögerung (Kreuzkorrelation je 20 ms) statt aus einer Impulsantwort; H-1 von TEMPO als 64 → 127.

### Bekannte Lücken / für den Hauptstrang
- **ECO-Klang ohne Effekte** (Spec B.5: „ohne T2, FX …“).
- **MK2-Test veraltet:** `v3-mk2-ui.mjs` MK2-10 erwartet MOD-FX … SEQ dunkel; ab MK4 sind MOD-FX/DELAY/EQ aktiv → Erwartung nach dem Zusammenführen anpassen.
- **Schon im MK2-Stand (nicht hier behoben):** `v3-mk2-ui.mjs` MK2-08 „Welle ≤ 30 ms nach dem Laden“ schwankt (MK2.html: 37,7/57,8 ms, MK4: 24,6/36,0 ms);
  `v3-mk1-ui.mjs` MK1-31 „🎲 jeder hörbar“ fällt zufällig (MK2.html: 1 stummer Wurf von 100; hier einmal 1, einmal 0).
- **Zusammenführen:** MK4 berührt `MkCore.block` (Stimmensumme in den Effektpuffer, Zeilen um `this.fx`), `MkCore`-Konstruktor/Laden/`set`/`idle`,
  `process()` des Prozessors (eine Zeile `this.mk.fxEnd(L, R)` vor der Mono-Halbierung, `fxHot()` in den zwei `busy()`-Bedingungen), die
  Nachrichten `{mkFxIn}`/`{mkFxFrz}`, `mkFxMem` im Host, `mkInfo`, `mkRender`, im Bedienfeld `L_`, `KN`, `SEC2` (Stellungen 5–7), `knobs()`,
  `fmtv`, `lcdOf`, `setWahl`, die Matrix-Namen, `paintKnob` (Log-Regler), `wiaPos2`, `knobGesture`, `octBtn`, Probe, Hilfe. MK3 ändert ebenfalls
  `MkCore.block` (Timbre-Verteilung) — dort zusammenführen: die Stimmen beider Timbres summieren in `VL/VR` mit `vo = off`.

### Geräte-Abgleich (für Xander am eigenen Gerät, EN3-16)
1. MOD-FX Chorus/Flanger TIEFE 40 (sanfter Chorus) und TIEFE 100 (deutlicher Flanger mit Pfeifen).
2. MOD-FX Ensemble TIEFE 127 auf einer Fläche: breit, schwebend.
3. MOD-FX Phaser TEMPO 30: langsames Wandern (≈ 0,09 Hz, eine Runde ≈ 11 s).
4. DELAY TIEFE 64, NOTE 1/8: Wie viele Wiederholungen hörst du? Die App: erstes Echo −6 dB, dann je −7,9 dB → ≈ 5 hörbare Wiederholungen.

### iPhone-Prüfpunkte (Pages-Stand nach MK4, EN3-17)
1. MS-2000-Spur, EDIT-WAHL 2 auf **DELAY** (Stellung 6): TEMPO SYNC an, NOTE 1/8, TIEFE 60, Song läuft → Echo im Takt, kein Knacken beim Drehen.
2. BPM während des Songs ändern → Echo folgt sofort, ohne Knacken.
3. **MOD-FX** Ensemble auf einer Fläche (TIEFE hoch) → breiter Stereoklang; TIEFE auf 0 → genau der Klang ohne Effekt.
4. **EQ** TIEF-GAIN +6 dB → mehr Bass; HOCH-GAIN −12 dB → dumpfer.

### Tests und Dateien
- `dirigent-test/v3-mk4-fx.mjs` (Node, 61 Prüfungen, Ausgabe `v3-mk4-fx.out`), `v3-mk4-cpu.mjs` (`v3-mk4-cpu.out`), `v3-mk4-ui.mjs`
  (Chromium, 64 Prüfungen, `v3-mk4-ui.out`), `v3-mk4-pe1.mjs` (`v3-mk4-pe1.out`), `v3-mk4-shot.mjs`, Hilfen `v3-mk4-dbg*.mjs`, `v3-mk4-qpk.mjs`.
- Bildschirmfotos: `dirigent-test/v3-mk4-shots/` — je Format P1, P2, P3, L1, L2, W: `-modfx`, `-delay-zeit`, `-delay-note`, `-eq`; dazu
  `mk1-look-*` (SPIEL/FILTER aller Formate inkl. Safe-Area und Halb-Ansichten). Smoke: `dirigent-test/v3-mk4-smoke.png`.
- Schnappschuss: `synq-snapshots/MK4.html`. Größe 2 822 269 B (MK2 + 24 967 B).

## MK4-fix — zwei Befunde aus der Prüfung behoben · App bleibt 4.12.0 · Format 5 · keine Server-Änderung

### 1. Änderung in der Stille wirkte erst beim nächsten Ton (TIEFE 0 / EQ 0 dB nicht bitgleich trocken)
- **Ursache:** Nur `MkFx.run()` führte die Glätter (`sMd`, `sW`, `sDd`, `sLg/sHg/sLf/sHf`) und die Typ-Überblendungen nach — und `run()` läuft
  nur, solange eine Stimme oder ein Effekt-Nachhall klingt. Außerdem blieb `mOn` nach dem Ausblenden stehen. Folge: Wer zwischen zwei Tönen
  TIEFE auf 0 drehte, ein Programm wechselte (Zifferntasten) oder den TYP umschaltete, hörte am Anschlag des nächsten Tons noch den alten Effekt
  (bis −5 dB in 0–5 ms; Programmwechsel max |d| 0,134 > Tonspitze; Typwechsel +4,5 dB).
- **Behoben:** neue `MkFx.settle()`: Klingt nichts (keine Stimme, kein Effekt-Nachhall — oder die Effekte waren vor der Änderung aus), springen
  alle Glätter, Mischung, Delay-Zeit/-Typ und der Mod-FX-Typ sofort auf ihr Ziel; eine laufende Mod-FX-Stufe startet mit leeren Leitungen und
  frischen Abgriffen (kein Gleiten von der LFO-Stellung vor der Pause), eine abgeschaltete Stufe ist wirklich aus. Aufgerufen von
  `MkCore.load` und `MkCore.set` (nur bei mfx/dly/eq-Pfaden, `fxSettle`) und am Quantums-Ende, sobald der Nachhall still ist (`fxEnd`).
  Zusätzlich fällt `mOn` schon im Durchlauf ab, in dem die Mischung 0 erreicht. Änderungen bei klingendem Ton laufen unverändert geglättet.
  Delay-Länge als `dLen()` ausgelagert (gleiche Rechnung).
- **Nachweis (Node, echter Worklet-Code):** `v3-qa-mk4-idle.mjs` gegen 4.10.0: Programmwechsel, Ensemble TIEFE 127→0, TIEF-GAIN +12→0 jeweils
  max |d| **0** (vorher 0,134 / 0,062 / 0,053), Pegel 0,0 dB in allen Fenstern; Kontrolle (Änderung bei klingendem Ton) unverändert ≤ 2,9e-6.
  `v3-qa-mk4-idle2.mjs` Typwechsel Phaser→Cho/Flg in der Stille gegen „immer Cho/Flg“: max |d| **0** (vorher +4,5 dB). Neu
  `v3-mk4fix-idle3.mjs` (Gegenrichtung: TIEFE 0→127, 40→127, Ensemble→Phaser, EQ 0→+12/−6, DELAY 0→100 in der Stille gegen „immer so“):
  alle ≤ 3,7e-7 (vorher bis 0,13). **Chromium** (`v3-rep-mk4-idle-chrom.mjs`, OfflineAudioContext über SynthHost): alle Stille-Änderungen
  max |d| 0, Kontrollen ≤ 2,9e-6, keine Konsolenfehler. **Live** (`v3-rep-mk4-idle-live.mjs`, Echtzeit, `SYNQUENZER.mkSet`): erster Ton nach der
  Änderung minus späterer Ton 0,39/−0,66/0,30/−0,06 dB — innerhalb des Rauschbodens später-gegen-später (1,45/−1,72/0,70/−0,35 dB; vorher −5,65/−4,72 dB in 0–5 ms).

### 2. Panik und ■■ („Hall und Echo aus“ / „Alle Töne aus“) ließen das MS-2000-DELAY weiterklingen (> 30 s)
- **Ursache:** `tailKill()` leerte nur Bus-Echo und Hall; `MkCore.panic()` blendete nur die Stimmen aus; `MkFx` hatte keinen Löschweg.
- **Behoben:** `MkFx.kill()`: klingt ein Effekt-Nachhall, blenden die Delay-Wiederholungen (Rückkopplung und Ausgang) und die Mod-FX-Mischung
  über `MK_KQ` Quanten (10 ms) linear aus, danach vergisst das Delay seinen Puffer (`dWr = 0`, nur Neues kommt zurück) und die Mod-FX-Stufe
  startet leer neu (Mischung blendet in 20 ms wieder ein); ist alles still, sofort (`wipe()`). Aufgerufen von `MkCore.panic()` (Worklet-Ereignis 6)
  und von der neuen Nachricht `{mkFxKill}` (`E.mkFxKill()` im Host), die `tailKill()` an jede Synth-Spur (und die Vorhör-Kette) schickt.
  Eine neue Note danach bekommt wieder ihr Echo. Alles ASCII im Worklet-Quelltext (btoa-Weg).
- **Nachweis:** `v3-rp-mk4-dlytail.mjs` (Chromium, echte Taps, P1 390×844 und L1 844×390): ■■ mit TIEFE 127: 0–300 ms −97/−87 dB, ab 300 ms
  Stille (vorher −26 … −34 dB über 4 s); panic(): 0–300 ms −90/−124 dB, ab 300 ms Stille bis 10 s (vorher −30 … −55 dB); panic + Stumm genauso;
  Kontrollen TIEFE 0 still; keine Seitenfehler. `v3-qa-mk4reg-tailui.mjs`: Bus-Echo Basis/neu unverändert (−33 dB, dann Stille), MS-2000-Delay
  jetzt −102/−94 dB, dann Stille. `v3-qa-mk4reg-panic.mjs` (ZEIT 127, Akkord): ab 0 s −200 dB, nichts über −60 dB (vorher noch bei 29,3 s).
  Neu `v3-mk4fix-kill.mjs` (Node, 30 Prüfungen, `v3-mk4fix-kill.out`): Delay 127, Delay + Cho/Flg, Phaser, Cross + EQ +12, je Panik und Kill:
  20 ms danach < −80 dB (Rest = Ausschwingen des DC-Blockers), ab 0,5 s < −100 dB, kein Knack (größter Sprung beim Kill ≤ Sprünge des laufenden
  Nachhalls), neue Note hat wieder Echo.

### Regression
- `v3-mk4-fx.mjs` 61/61 PASS (`v3-mk4fix-fx.out`), `v3-mk4-ui.mjs` 64/64 PASS (`v3-mk4fix-ui.out`), `v3-mk1-dsp.mjs` 64 PASS
  (`v3-mk4fix-mk1dsp.out`), Smoke ohne Fehler (`dirigent-test/v3-mk4fix-smoke.png`). Keine sichtbare Änderung (keine Layout-Prüfung nötig).
- Chromium: `/opt/pw-browsers/chromium-1194` gibt es nicht; alle Läufe mit `chromium-1243` (wie die übrigen MK4-Tests).
- **Zusammenführen:** zusätzlich berührt: `MkFx` (`settle`, `kill`, `wipe`, `dLen`, `mFresh`, `kq` in `run`/`hot`/`idle`), `MkCore.load`/`set`/`fxEnd`/
  `fxSettle`/`panic`, `onMsg` (`mkFxKill`), Host `E.mkFxKill`, `tailKill()` im Hauptfaden.
- Offen/Beobachtung: Stummschalten einer Spur schneidet einen laufenden Effekt-Nachhall nicht ab (gilt für das Spur-Ende vor der Stumm-Stufe;
  nicht Teil des Befunds, nicht geändert).
- Schnappschuss: `synq-snapshots/MK4-fix.html`, 2 826 589 B (MK4 + 4 320 B).

## G-MK34-merge — Zusammenführung · App 4.12.0 (`APP_CODE` 4 012 000) · Format bleibt 5

**Zusammengeführt** (echter 3-Wege-Merge, `git merge-file`, Basis = MK2 `mk-base-B.html` 2 797 302 B): Hauptlinie (MK2 + MK2-fix +
G-MK2a-gruppe-fix, 4.10.0) ← **MK3** (inkl. MK3-fix, G-MK3-gruppe-fix, 4.11.0) ← **MK4** (inkl. MK4-fix, 4.12.0). `VERSION` = 4.12.0 (die höchste).
Sicherung vorher: `mk-wt/index.html.vor-merge-G-MK34-merge.html`. Ergebnis 2 874 742 B. Keine Konfliktmarken mehr, Worklet bleibt ASCII,
alle Skript-Blöcke syntaktisch geprüft (`node --check`).

### Konflikte und Auflösung
MK3 → Hauptlinie (2 Konflikte):
1. **Worklet, LFO-2-Phase / Notentabellen-Arbeit** (MK2-fix ruft `mkntWork()` einmal je Quantum im Kern auf; MK3 machte den alten Kern zum
   Timbre `MkTim` und zieht den S/H-Zufall je Timbre): MK3-Zeile (`this.par.seed`, `9 + 10 * ti`) übernommen; `mkntWork()` wandert in
   `MkCore.block` (einmal je Quantum für beide Timbres, nicht doppelt im Schicht-Modus).
2. **`mkSetP`**: MK3s Wellen-Zufuhr für beide Timbres (`t.0|1.o1.w|c2`, `mode`) + G-MK2a-fix `UI.dirty.edHead = true` (Kopfzeile „geändert“
   und [A/B] sofort) — beides behalten.

MK4 → Hauptlinie (16 Konflikte):
3. **Effekte im Worklet** (größter Punkt): MK4 hatte MOD-FX/DELAY/EQ (`MkFx`) in den Ein-Timbre-Kern gebaut, der seit MK3 `MkTim` heißt.
   Die Effekte gehören zum Sound (Programm-Ebene) und laufen jetzt in `MkCore` **nach der Summe beider Timbres**: `this.fx` im
   `MkCore`-Konstruktor, `fx.load` + `fxSettle` in `MkCore.load`, `mfx.*`/`dly.*`/`eq.*` in `MkCore.set` (MK3-Programmpfade bleiben),
   `fxHot`/`fxEnd`/`fxSettle` in `MkCore`, `fx.kill()` in `MkCore.panic`, `fx.idle()` in `MkCore.idle`; `MkCore.block` schreibt beide
   Timbres (auch den Solo-Blendweg) in den Effekt-Eingang, wenn ein Effekt an ist, sonst direkt in den Ausgang (wie vorher).
   Aus `MkTim` entfernt: `new MkFx`, Effekt-Zweig in `load`/`set`/`block`/`idle`/`panic` (MkTim bleibt in MK3-Form: `load(tt)`,
   `set` mit Rückgabe `reas`, Pfad-Filter je Timbre).
4. **Port-Nachrichten**: `mkSolo` (MK3) und `mkFxIn`/`mkFxKill`/`mkFxFrz` (MK4) — beide.
5. **`MKW`-Konstanten**: Stimmungen `SCL`/`sclCt` (MK3) und Effekt-Konstanten W-31…W-33 (MK4) — beide.
6. **EDIT-WAHL-2-Tabelle**: MOD-FX/DELAY/EQ aktiv mit Knöpfen (MK4) und STIMMUNG aktiv mit `scl`/`skey` (MK3).
7. **`patchTxt`**: MK3 (`ct()` = bearbeitetes Timbre) + MK4s neue `fxTxt`.
8. **`lcdOf`-Kopf**: MK4s Einheit (NOTE, EQ in Hz/dB) mit MK3s `ct().o1.w` und `tLab()`-Präfix bei PATCH.
9. **`lcdOf`-Ende**: MK3s Hinweise (SCHICHT/SPLIT/Mono/EIGENE) + MK4s NOTE-Zeile; Präfix T1/T2 entfällt nur bei MOD-FX/DELAY/EQ (gehören
   zum Sound, nicht zu einem Timbre).
10. **LCD bei Abschnittswahl EDIT-WAHL 2**: Effekte (Pos. 4–6) → `fxTxt`, PATCH (0–3) → `patchTxt`, STIMMUNG (9) → Stimmung + Grundton.
    (MK4s Bedingung `pos ≥ 4` hätte sonst STIMMUNG als EQ-Zeile gezeigt.)
11. **Matrix-Zeile**: Namen mit `ct()` (MK3) und ZEIT/NOTE-Umschalter (MK4); „EIGENE ▸“ (MK3); Titel PATCH/Effekt/leer nach Position.
12. **Original-Markierung** (`P.orig`): Regex um `(mfx|dly|eq).*` erweitert, MK3s `tv|split|scale|skey|lay|usc` und `tp()` bleiben.
13. **`wiaPos2`** (Punkte „geändert“ in EDIT-WAHL 2): PATCH des bearbeiteten Timbres (MK3), Effekte 4–6 (MK4), STIMMUNG 9 (MK3).
14. **Gesten-Ende**: MK4s Rundung (`d.step`, NOTE) + MK3s `P.sync0 = null`.
15. **Matrix-Liste**: Zeilentext PATCH (0–3) / Effekt (4–6, `fxTxt`) / STIMMUNG (9).
16. **`normMk`-Bereiche**: `usc` (MK3) + `eq: EQR` (MK4).
17. **`VERSION`**: 4.12.0. 18. **Hilfe**: drei MK3-Zeilen + zwei MK4-Zeilen.
19. Außerhalb der Konflikte: zwei MK4-fix-Kommentare enthielten das Markenwort („the MS 2000 …“) → „the AM …“ (B.6 Nr. 9: genau 1 Treffer).

### Proben (gegen `mk-wt/index.html`; Bitgleich-Vergleiche gegen die Hauptlinie vor dem Merge; Chromium 1243, der Pfad 1194 fehlt hier)
- Smoke ohne Fehler (`dirigent-test/g-mk34-smoke.png`).
- MK3: `v3-mk3-timbre.mjs` 30/30, `v3-mk3-scale.mjs` 6/6, `v3-mk3-fpdsp.mjs` 6/6, `v3-mk3-ui.mjs` 37/37, `v3-mk3fix-solo.mjs` ok,
  `v3-mk3fix-cpreach.mjs` (Kopie `gmk34-mk3fix-cpreach.mjs`, Pfad mk-wt) P1 + L1 ok, `v3-gfix-mk3-lcdsplit.mjs` ALL OK.
- MK4: `v3-mk4-fx.mjs` 61/61, `v3-mk4fix-kill.mjs` 30/30, `v3-mk4-cpu.mjs` 3/3 (≤ 0,76 × VA-Stimme), `v3-mk4-pe1.mjs` (Kopie
  `gmk34-mk4-pe1.mjs`) bestanden (ein Lauf mit einem 72-ms-longtask auf der geteilten Maschine, Wiederholung 0), `v3-mk4-ui.mjs` 63/64 —
  die eine Zeile MK4-12 erwartet STIMMUNG dunkel (seit MK3 aktiv, erwartet); Kopie `gmk34-mk4-ui.mjs` mit STIMMUNG aktiv 65/65.
- Hauptlinie (MK2-fix, G-MK2a): `v3-mk2-osc.mjs` 32/32, `v3-mk2fix-nt.mjs` alles PASS (allein; parallel gestartet 1 Zeitgrenze),
  `v3-gmk2afix-patch.mjs` 2/2, `v3-mk2-ui.mjs` 22/25: MK2-10 erwartet „MOD-FX … SEQ dunkel“ (seit MK3/MK4 aktiv, erwartet); MK2-08
  „Oktav-Welle ≤ 30 ms nach dem Laden“ schwankt 26–32 ms — **ebenso vor dem Merge** (30,3–31,4 ms, MK2-fix-Nutzlast), nicht durch den Merge.
- Regression: `v3-mk1-dsp.mjs` 64/64, `v3-mk1-hear.mjs` 53/53, `v3-mk1-look.mjs` 88/88, `v3-mk1-ui.mjs` 33/33, `v3-mk1-eco.mjs` 6/6,
  `v3-mk1-format.mjs` gegen 4.8.1 (`MK0-fix.html`) 20/21 — nur die fest verdrahtete Erwartung „APP_CODE 4 009 000“ (jetzt 4 012 000, erwartet).
- Neu für den Merge: `gmk34-merge-fx.mjs` 14/14 (Node): Single mit Effekten bitgleich zum MK4-Zweig (5 Effekt-Fälle, max |Δ| 0);
  Schicht: Effekt(T1 + T2) = Effekt(T1) + Effekt(T2) (max |Δ| ≤ 1,2e-7, T2 hat sein Echo); Split: T2-Note mit Echo; Solo T1 + DELAY =
  T2 PEGEL 0 + DELAY (|Δ| 0); Panik in Schicht nimmt beide Echos; DELAY TIEFE → 0 in der Stille = trocken bitgleich.
  `gmk34-merge-nt.mjs` 4/4 (Chromium, App-`mkRender`): Notentabellen-Wellen 35/61/64 auf T2 in Schicht = gleicher Pegel wie T1 Einzeln
  (Δ 0,00 dB), mit DELAY Echo, 0 Konsolenfehler. Ausgaben in `gmk34/`.

### Offen
- `MkTim.inherit` (strukturelle Blende) übernimmt `vpb` nicht: eine Stimmwelle startet beim SXF ihre Tiefpass-Einschwingung neu (so schon
  in der Hauptlinie vor dem Merge, nicht durch den Merge).
- MK2-08-Zeitgrenze (s. oben) knapp, schon vor dem Merge.

### Datenbank / Am Server offen
- Nichts (keine Server-Änderung; Format bleibt 5, `APP_CODE` 4 012 000 ≤ Wächter 4 021 000).
