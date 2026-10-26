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
