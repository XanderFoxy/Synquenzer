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


# CHANGES – MS 2000, Paket MK5 (Zweig-Kopie `mk-br-MK5`)

## MK5 — Step-Arpeggiator · App 4.13.0 · Format bleibt 5

**Vorgänger-Stand** für alle „bitgleich“-/Regressions-Vergleiche: **4.12.0** (Startstand dieser Kopie, MK0–MK4 gemischt;
gesichert als `scratchpad/mk5-base-4.12.0.html`, 2 874 742 B).
Zweig-Bau: MK6 (`mk-br-MK6`) und MK7 (`mk-br-MK7`) entstehen gleichzeitig; der Orchestrator führt zusammen und setzt die VERSION-Zeile.
Server: keine Änderung nötig (`max_app` 4 021 000 ≥ 4 013 000, `max_format` 5). Kein Supabase-Aufruf in diesem Lauf.
Neustart-Prüfung: kein `synq-snapshots/MK5.html`, keine MK5-Spuren in der Kopie → frischer Bau.

### Gebaut
1. **Arp-Kern im Hauptfaden** (`ARPC`, Block `sq-mk-src`, EN3-11/EN3-14). Alle Notenquellen einer AM-Spur mit `arp.on` gehen in den
   **gehaltenen Satz** (Intervalle {Quellnote, an, aus} in Audio-Zeit) statt an `spawnVoice`: Tastatur/MIDI/API (`inputDown`, Zeit + `LIVE_LEAD`),
   Clip-Noten (`scheduleTrack`, mit ihren künftigen Zeitstempeln; auch eigene Song-Clips und Aufnahmen beim Abspielen) und die MELODIE-Spur
   des Songs (wie gehört, nicht abgebildet).
   - Jeder Schritt fragt den Satz **zu seiner eigenen Zeit** ab und bildet die Quellnoten dann über `outPitch` ab (Harmonie, ⇅, „Eine Skala“,
     FOLGT). Gruppen: Tasten ohne „alle los“-Lücke gehören zu einem Akkord; Noten, die sich nur berühren (aus = an), gelten als neuer Akkord.
   - **Planer** in `tick()`: bei stehendem Transport **vor** `if (!R.playing) return`, bei laufendem nach dem Einplanen der Clips desselben
     Fensters (sonst sähe ein Schritt die Clip-Noten seines Fensters nicht); Horizont `LOOKAHEAD`. Eine neue Taste plant sofort
     (erste Note ≤ 10 ms, nie ein zu später Schritt).
   - **Raster:** Transport läuft = Song-Raster (Schlag · Auflösung W-11); Transport steht = Raster ab dem ersten Tastendruck. Start des
     Transports bei laufendem Arp: Wechsel aufs Song-Raster. Tempo- oder Auflösungswechsel: die schon geplanten Schritte hinter „jetzt“
     werden neu gemacht, der nächste Schritt liegt im neuen Tempo (kein doppelter, kein fehlender Schlag).
   - **Muster** (`arpPattern`, engine-frei für VI2a): Auf, Ab, Wechsel 1 (U + U rückwärts ohne Ränder), Wechsel 2 (U + U rückwärts), Zufall
     (Startwert aus Projekt-`id` + Spur-`uid` + Schritt-Zähler, 32-bit-Hash), Akkord (alle gehaltenen; mehr Tasten als Stimmen → die tiefsten;
     Stimmenzahl nach Timbre Voice / Mono-Regel aus MK3). OKTAVEN 1–4.
   - **KEY SYNC** an: Zähler 0 beim ersten Schritt eines neuen Akkords; aus: Zähler = Rasterschritt, gezählt ab dem Taktstrich, in dem der
     Akkord begann (MK5-fix; Transport steht: Rasterschritt ab der ersten Taste).
   - **Step-Arp:** LÄNGE 1–8 und Maske `steps`; ein aus-geschalteter Schritt ist eine Pause, der Notenzeiger rückt trotzdem weiter.
   - **GATE** W-34: max(3 ms, gate/100 · Schritt); 100 % = bis zum nächsten Einsatz (mit Swing). **SWING** W-35 auf die geraden Schritte;
     W-35 = 0 → der Song-Swing wie bei den Clip-16teln (`swingOffset`), W-35 ≠ 0 ersetzt ihn (kein doppelter Swing).
   - **Latch:** Loslassen hält den Akkord, neue Tasten nach „alle los“ ersetzen, eine weitere Taste beim Halten ergänzt; Latch aus → Stopp
     ≤ 1 Schritt. Ein Szenen-/Teilwechsel dieser Spur beendet einen gehaltenen (gelatchten) Akkord (Umfang 8).
   - **Ziel** (Schicht/Split): Arp-Noten tragen beim ON die Timbre-Maske `d`; in Schicht hält das andere Timbre die Tasten als normale Noten
     (Gegenmaske), in Split bestimmt die **gehaltene Taste** das Timbre (auch wenn OKTAVEN über `split` hebt); Tasten des nicht arpeggierten
     Split-Timbres spielen normal.
   - **Aufräumen:** Stopp, Panik, `fadeAll` (Projektwechsel), Szenen-/Teilwechsel (`cutTrackAt`, `cancelTrackFrom`, ■■), Engine-Wechsel,
     Arp aus und Spur stumm beenden alle Arp-Noten (geplante abgebrochen, klingende normal losgelassen).
   - **Träger-Wechsel** (`applyCarrierChange`) und ⇅ (`xpSet`/`xpReset`): die geplanten Schritte dahinter werden neu gemacht; eine klingende
     Arp-Note über den Wechsel folgt wie eine Clip-Stimme (`retune`, außer `onChange 'hold'`; bei ⇅ behalten klingende Noten ihre Höhe wie Clip-Noten).
   - **Akkord-Fenster 30 ms:** Eine Taste, die bis 30 ms nach dem ersten Schritt eines Akkords kommt, und dieser Schritt hat noch nicht geklungen,
     wird in ihn aufgenommen (ein Akkord wird nie in genau einem Augenblick gegriffen).
   - **ECO** (`forceNative`): der Arp läuft weiter über NativeVoice (Timbre-1-Bild); Noten nur für T2 (Maske 2) klingen dort nicht (B.5).
   - `noteLog` bekommt `src: 'arp'` mit `step`; `arpLog(t)` (B.7) mit {t, note, vel, dur, step, c}. Abgebrochene Schritte verschwinden aus beiden.
   - **Aufnahme** (H-8): ●, FANG, Overdub und MELODIE nehmen weiter die **gedrückten Tasten** auf (unverändert). Der MIDI-Mitschnitt (`PERF`,
     `buildMidiLog`) enthält die klingenden Arp-Noten, der Szenen-/Song-Export nur die Clip-Noten.
2. **Worklet** (AM-Zweig, ASCII): Note-On mit 7. Element `d` (0 = Modus entscheidet, 1 T1, 2 T2, 3 beide; alte 6-Element-Ereignisse = 0),
   `MkCore.routes(note, k, d)` auch bei Neuverteilung (MODUS/SPLIT); **KEYS** Typ 9 (erste Taste nach „alle los“) und 10 (alle los) mit
   Zeitstempel. Solange `arp.on`, setzen LFO 1/2 mit Key Sync „Timbre“ nur bei KEYS 9 zurück (`MkTim.keyReset`, dort hängt MK6 SEQ an);
   „Stimme“ setzt wie bisher je Note (= je Arp-Note) zurück. Host: `E.on(…, d)`, `E.keys(ty, t)`; `mkRender` versteht `[t, 'keys', 9|10]`.
3. **Bedienfeld** (wie am Original):
   - **ARP-Taste** (Z2): Arp an/aus (LED, ein Undo); kleine **Tempo-LED** blinkt im Song-Tempo (jedes Bild, nur Klassenwechsel). SHIFT + ARP: „gibt es in der App nicht“.
   - **EDIT-WAHL 2 ARP A:** TEMPO (Song-Tempo) · AUFLÖSUNG (Liste 1/24 … 1/4, LCD mit ms) · GATE (%, ms) · TYP (Liste Auf, Ab, Wechsel 1,
     Wechsel 2, Zufall, Akkord) · OKTAVEN (rastet 1–4). **ARP B:** LATCH · SWING (−100…+100 %) · KEY SYNC · LÄNGE (rastet 1–8) · ZIEL
     (Liste Beide, Timbre 1, Timbre 2). Auswahl-Liste und Matrix-Zeile mit Klartext-Zusammenfassung; ◎ markiert ARP A/B bei Abweichung von INIT.
   - **Schritt-Tasten:** bei ARP A/B (ohne SHIFT) sind die Nummerntasten die Schritte 1–8 am selben Platz: leuchtet = an, blinkt 1 Hz
     (CSS-Animation) = Pause, dunkel = über LÄNGE; der laufende Schritt hell (Wechsel ≤ 30/s, ≤ 1 Bild Verzug). Programm-Zeile „SCHRITTE · n“.
   - Hilfe: zwei neue Zeilen (ARP-Taste/ARP A, ARP B/Schritte/Aufnahme). Erster Tipp auf ARP und erste ARP-A/B-Wahl: LCD-Hinweis (L10).
4. **Leistungs-Probe:** neuer Fall **„+Arp“** (4 Engines, 1/24 im Song-Tempo, Auf über 2 Oktaven, GATE 75 %, KEYS je Akkord).
5. **Laden des Kerns:** `ARPC` liegt in `sq-mk-src`; ein Sound mit Arp an (Sound laden, `arp.on` setzen) lädt den Block gleich danach
   (`arpLoadSoon`), ein Tastendruck notfalls sofort; der Planer selbst lädt nie (sonst liefe `tickAhead` im `tick`).
6. Version **4.13.0**. Größe 2 907 221 B (**+31,7 KB**, Budget +33 KB).

### Abnahme MK5 (Chromium `v3-mk5-arp.mjs` 79 ✔, `v3-mk5-arp-audio.mjs` 11 ✔, `v3-mk5-ui.mjs` 80 ✔, `v3-mk5-perf.mjs`, `v3-mk5-fp.mjs` 10 ✔, `smoke.mjs`)
| ID | Ergebnis |
|---|---|
| MK5-01 | ✔ C-E-G, Auf/Ab/Wechsel 1/Wechsel 2 × OKTAVEN 1–4 deep-equal zur Tabelle (2 Durchläufe), Akkord je Schritt C E G (OKTAVEN ignoriert); Beispiel Range 1: Wechsel 1 = C E G E, Wechsel 2 = C E G G E C. |
| MK5-02 | ✔ 4 Töne, 2000 Schritte: 24,1 / 24,7 / 25,9 / 25,3 %. Gleicher Startwert → gleiche Folge, anderer → andere; live zweimal = dieselbe Folge = Muster ab Zähler 0. |
| MK5-03 | ✔ 1/16 bei 120 BPM: Abstand 125,000 ms; Einsätze im Song-Raster max. 0,00003 Schlag (`noteLog`) für 1/24, 1/16, 1/12, 1/8, 1/6, 1/4. Audio offline (App-Worklet, Hüllkurven-Abgriff): jeder Einsatz 0,000 ms Fehler (≤ 1 ms). |
| MK5-04 | ✔ GATE 50 % = 62,500 ms (`arpLog`), im Audio 62,3 ms bis zum Beginn des Loslassens; 100 % = bis zum nächsten Einsatz, Sustain 127: M-EINBRUCH −1,67 dB (Akkord) / −1,66 dB (dieselbe Taste, Stimme startet neu), M-KLICK +0,7 / +3,1 dB; 0 % = 3,00 ms. |
| MK5-05 | ✔ SWING +50 (1/8): gerade Noten +62,50 ms, −50: −62,50 ms, 0: gerade (± 0,00 ms). |
| MK5-06 | ✔ LÄNGE 4, Schritt 2 aus: Schritte 1 3 4 1 3 4 …, Noten C G C E C E … (Zeiger rückt bei der Pause weiter). Alle Schritte aus: 0 Noten, 0 Stimmen, keine Fehler. |
| MK5-07 | ✔ KEY SYNC an: neuer Akkord D-F-A nach „alle los“ beginnt mit D bei Schritt 1 (Zähler 0). Aus: zwei Läufe mit Anschlag nach 130 bzw. 460 ms = dasselbe Muster im 2. Takt. |
| MK5-08 | ✔ Latch hält, ersetzt nach „alle los“, ergänzt beim Halten; Latch aus → 0 Noten nach 1 Schritt, 0 Stimmen. |
| MK5-09 | ✔ Transport steht: erste Arp-Note 10,00 ms nach dem Tastendruck (Audio-Uhr in `inputDown`; 5 Läufe). |
| MK5-10 | ✔ 120 → 90 BPM im Lauf: alle Abstände ¼ Schlag (kein doppelter/fehlender Schlag), danach 166,67 ms. |
| MK5-11 | ✔ Schicht + Ziel T1 (STIMMEN 1+3): T1 eine Arp-Note, T2 hält C E G; Ziel Beide: beide Timbres spielen die Arp-Note; Split + Ziel T1 + OKTAVEN 3: keine Arp-Note auf T2 (Arp bis 79 über `split` 60), T2 hält 72/76; Split + Beide: das G (T1-Taste) bleibt oktaviert auf T1. |
| MK5-12 | ✔ Akkord mit 6 Tasten bei 4 Stimmen: 48 55 60 64 (die 4 tiefsten). |
| MK5-13 | ✔ 4-Takt-Akkord-Clip zwei Durchläufe identisch (64 Noten): KEY SYNC an (Wechsel 2, 2 Okt.) und KEY SYNC aus (Wechsel 1, Musterlänge 4). Spur stoppt am Taktstrich: 0 Proxies, 0 Worklet-Stimmen; Szenenwechsel: ab dem Strich nur der neue Akkord, keine Note über den Strich. |
| MK5-14 | ✔ ● mit Arp: Clip = die gedrückten Tasten (60 62 64 65 67 69), ein Undo; Abspielen = dieselbe Zufallsfolge je Akkord; Mitschnitt = 17 Arp-Noten = `arpLog` (MIDI 17); Szenen-MIDI-Export 6 Note-On = 6 Clip-Noten. |
| MK5-15 | ✔ Stopp, Panik, Szenenwechsel, Engine-Wechsel, Arp aus, Spur stumm, Spur stoppt am Taktstrich: nach 1 Schritt + Release 0 Worklet-Stimmen, kein Arp-Schritt danach, keine nicht losgelassene Arp-Stimme (siehe „Befund aus früheren Paketen“). |
| MK5-16 | ✔ 4 Arp-Spuren 1/24, Arp-Anteil je `tick` p95 0,2–0,3 ms (Auflösung von `performance.now` 0,1 ms; max 1,1–2,5 ms), ganzer `tick` p95 0,8 ms (4.12.0 ohne Arp 0,6–1,3 ms); PE1: rAF-Median 60 fps, keine longtask, keine Fehler. Probe „+Arp“: `load_med` 0,031 (Kern 0,083, +FX 0,096), `frames_ok`, 0 Netzaufrufe. |
| MK5-17 | ✔ ARP-Taste und Schritt-Tasten ≥ 44 × 44 (P1 8 × 44, P2 2 × 4 à 80 × 44, P3 2 × 4 à 68 × 44, L1 46 × 46 bei Maßstab 1,05); M-PLATZ in P1, P2, P3, L1, L2, W, L1-SA, 926 × 428-SA, L1-HB (je Hälfte) für SPIEL, ARP an, ARP A, ARP A + SHIFT, ARP B, Schritte mit Pausen/LÄNGE 6, laufender Schritt; M-ANSICHT 0,00 px; M-SKIZZE (`v3-mk1-look.mjs` 88 ✔). LED-Zustände an │ Pause (Animation `mkbl1`, 1 Hz) │ dunkel laut Einstellung; Tempo-LED 0 falsche Bilder in 3 s (12 Wechsel); laufender Schritt 22–24 Wechsel/s bei 24 Schritten/s, 0 Bilder > 1 Bild Verzug. Listen AUFLÖSUNG/TYP/ZIEL Zeilen ≥ 44 px. |
| MK5-18 | ✔ `v3-v2d2-rec.mjs` 65/65, `v3-v2d-fang.mjs` 39/39, `v3-v2d2-regcore.mjs` 28 gleich (die „log“-Abweichungen sind Live-Zeit-Jitter, dieselben gegen 4.12.0 wie 4.12.0 gegen V2c′), `v3-mk3-ui.mjs` 37 ✔, `v3-mk4-ui.mjs` 63 ✔ (1 erwartete Abweichung: der Test verlangt ARP A/B noch dunkel), `v3-mk4-fx.mjs` 61 ✔ (bitgleich gegen 4.12.0). Clip-Wiedergabe Drums/VA/AM mit Arp aus: 149 = 149 Noten gleich 4.12.0. Budget +31,7 KB. |
| MK5-19 | ✔ 4-Takt-Akkord-Clip, Träger C → Am in Takt 3 (gesetzt 60 ms vor dem Strich, Planer schaut schon hinein): ab Takt 3 nur 57/60/64; ebenso mit „Eine Skala“; ⇅ +2 in Takt 3: nur 62/66/69; keine hängende Note. |
| MK5-20 | ✔ Song-Swing 30 %, Arp 1/16, SWING 0: Arp-Einsätze = Clip-16tel (137,5 ms); SWING +50: nur W-35 (+31,25 ms); Transport steht: 4,25 s ohne Lücke; Clip-Note bei Schlag 4,5 → erste Arp-Note 4,5. |
| MK5-21 | ✔ Hauptfaden: KEYS 9,10,9,10 bei 2 Akkorden/10 Schritten. Worklet (Abgriff LFO 1, Säge, Key Sync Timbre, Arp an, GATE 50 %): Phase läuft über die Schritte (0,01 0,43 0,84 −0,75 …), neuer Akkord = 0,014 wie Akkord 1; ohne Arp setzt jede Note zurück; Key Sync Stimme je Arp-Note. **SEQ** (MK6) ist in dieser Kopie nicht gebaut: `MkTim.keyReset` ist der Haken, MK5-21 für SEQ ist **am Merge offen**. |
| MK5-22 | ✔ `forceNative`: `arpLog` wie im Worklet-Klang (60 64 67 72 76 79 …), Schicht + Ziel T2 im ECO: nur der gehaltene Akkord (T1), keine Fehler. |

### Fach-Prüfung (vor der Abnahme, an mir selbst): FP-SONG ● (Haupt-Blick), FP-TOUCH (Zweit-Blick)
`v3-mk5-fp.mjs` 10 ✔, dazu Durchsicht des Diffs, der Testausgaben und der Bildschirmfotos. **9 Befunde, alle behoben:**
1. FP-SONG — `inputDown`: `if (!inp.arp …)` war bei Spur 0 falsch (Index 0), die Taste klang zusätzlich als normale Stimme → `inp.arp == null`.
2. FP-SONG — abgebrochene (neu geplante) Schritte blieben in `arpLog` → werden mit dem Schritt entfernt (Mitschnitt = `arpLog`, MK5-14).
3. FP-SONG — `arpOn` hätte im Planer `mkLoad` aufgerufen (darin `tickAhead` → `tick` im `tick`, doppelte Noten möglich) → Laden nur außerhalb des Planers (`arpLoadSoon`, Tastendruck).
4. FP-SONG — ein neu geplanter erster Schritt schickte KEYS 9 ein zweites Mal → KEYS gleicher Zeit nur einmal.
5. FP-SONG — Latch hielt einen Akkord über einen Szenen-/Teilwechsel → der Wechsel beendet das Halten (Umfang 8).
6. FP-SONG — ⇅-Wechsel kurz vor dem Strich: schon geplante Schritte hatten die alte Höhe → `xpSet`/`xpReset` planen hinter dem Wechsel neu.
7. FP-SONG — eine zweite Akkordtaste nach dem schon geplanten (nicht klingenden) ersten Schritt wurde nicht aufgenommen → Neuplanung auch bei `on` = letzter geplanter Schritt, Akkord-Fenster 30 ms.
8. FP-TOUCH — Programm-Zeile in P3 LINKS lief über („SCHRITTE · LÄNGE 8“) → „SCHRITTE · 8“ / „an │ Pause“.
9. FP-TOUCH — erster Tipp auf ARP: der Hinweis überschrieb die Rückmeldung „ARP AN“ → beim ersten Mal ein gemeinsamer Text.
FP-SONG-Punkte ohne Befund: M-ZEIT (MK5-03/-10/-20), `S.tracks[].clips` und Song deep-equal nach Wiedergabe mit Arp, Undo-Gruppen (ARP, Schritt, Regler je ein Undo), Rundweg Speichern/Laden aller Arp-Felder, `normMk` klemmt, Taktstrich-Regel (MK5-13/-15), Harmonie-Kern (`Transposer`, `Harmony`, `mapOut`, `outPitch`) bytegleich zu 4.12.0, MIDI-Export (MK5-14).
FP-TOUCH ohne Befund: Treffer ≥ 44, keine Überlappung, M-ANSICHT 0 px, ein Undo je Geste, Haptik (ARP, Schritt, rastende Regler), keine neuen Gesten (nur Tipp, Ziehen wie bisher), Beschriftungen deutsch (TYP-Namen Auf/Ab/Wechsel/Zufall/Akkord; LATCH, SWING, KEY SYNC, GATE wie am Gerät, im LCD erklärt).

### Abweichungen / Entscheidungen (eK)
- **Chromium:** Die Tests starten `/opt/pw-browsers/chromium-1243/chrome-linux64/chrome` (der vorgegebene Pfad `chromium-1194` existiert in diesem Container nicht; wie alle MK-Tests).
- **KEY SYNC aus + Clip-Schleife** (ersetzt durch MK5-fix, s. u.): Der Zähler zählt ab dem Taktstrich, in dem der Akkord begann; jede Schleife aus ganzen Takten und jede Aufnahme klingt bei jedem Durchlauf gleich, auch mit Zufall.
- **KEYS 9** kommt zum Zeitpunkt der ersten Arp-Note des Akkords (bei stehendem Transport = Tastendruck + 10 ms, bei laufendem der nächste Rasterpunkt), damit die LFO-Phase genau mit dem ersten Ton beginnt. KEYS 10 beim ersten leeren Schritt.
- **Akkord-Fenster 30 ms** (s. o.): Kommt eine Taste erst, nachdem der erste Schritt schon klingt (> ≈ 8 ms auseinander auf dem iPhone, ≈ 10 ms im Test-Chromium), ist dieser erste Schritt unvollständig; danach stimmt das Muster.
- **Split + Ziel:** Ob eine Taste arpeggiert oder normal spielt, entscheidet ihre Höhe beim Anschlag (nicht neu bei einem späteren Träger-Wechsel).
- **Aufräumen bei Szenen-/Teilwechsel** beendet auch einen gelatchten Live-Akkord dieser Spur (Umfang 8 „beenden alle Arp-Noten“); physisch gehaltene Tasten spielen weiter.
- **Noten gleicher Höhe** im Satz (zwei Tasten, eine Höhe nach der Abbildung) zählen einmal.
- **`noteLog`:** Eine Taste auf einer Arp-Spur erzeugt keinen `live`-Eintrag mehr (es klingt keine eigene Stimme), nur die `arp`-Noten; ● REC, FANG und MELODIE bekommen die Taste wie bisher.
- `arp.tempo` wird nur gespeichert (EN3-10); TEMPO in ARP A ist das Song-Tempo.

### Befund aus früheren Paketen (auf der Hauptlinie beheben, hier nicht geändert)
- **MK1/MK3 `MkTim.polyOn`:** Startet eine losgelassene Stimme derselben Note neu (gleiche Note, neue Taste), wird die alte Kennung nie mit
  `endCheck` gemeldet. Ihr Proxy bleibt bis zum GC-Netz (`stopAt` + 1 s ≈ 1,3 s) in `VOICES` (Zustand `released`, klingt nicht). Mit dem Arp
  (gleiche Note in jedem Durchlauf) kommt das ständig vor; `voices()` zeigt dann bis zu einige losgelassene Proxies. Vorschlag:
  `const old = v.id; this.start(v, k, …); if (old !== k.id) this.endCheck(old);` im Zweig „the same note releasing“.
- `v3-mk4-ui.mjs` prüft, dass ARP A/B in der EDIT-WAHL-2-Liste noch dunkel sind; ab MK5 nicht mehr (Test anpassen).

### Merge-Hinweise (für den Orchestrator)
- Block `sq-mk-src`: neues `ARPC` direkt nach `/*}MKT*/`; im Bedienfeld: Listen `ares/atyp/atgt`, `KN.arp*`, `arpTxt`, `arpView`, `SEC2` ARP A/B
  aktiv, `arpKey`, `stepKey`, `numKey`, `render` (Nummerntasten/Programm-Zeile/ARP-LED), `setWahl`, `rotList`, `wiaPos2`, Regler-Geste (`stp`),
  `arpFrame`, Probe-Fall `arp`, CSS (`marp`, `mpause`, `mover`, `mcur`), `MKUI`-Export, `panelInfo().arp`.
- Worklet (AM-Zweig): `MkTim.noteOn` (Reset nur ohne Arp) + `keyReset`, `MkCore` (`arp`, `top`, `set` `arp.on`, `routes(…, d)`, `keysEv`,
  `noteOn(…, d)`, `after`), `AnalogCore.runEvents` (Typ 1 mit `e[6]`, Typ 9/10), `enqueue` (7. Element). **MK6** hängt den SEQ-Reset „Timbre“ an `keyReset`.
- Hauptfaden: `SynthHost` (`E.on` mit `d`, `E.keys`), `spawnWkVoice` (Maske), `spawnVoice` (ECO Maske 2), `spawnClipVoice(…, mask)`,
  `applyCarrierChange`, `xpSet`/`xpReset`, Hilfsfunktionen `arpOn`/`arpLoadSoon`/`arpK`/`arpTick`/`arpEndAll` vor `swingOffset`, `tick`,
  `scheduleTrack`, `cutTrackAt`, `cancelTrackFrom`, `stopTrackNow`, Song-MELODIE in `songTick`, `inputDown`/`inputUp`, `stop`, `fadeAll`, `panic`,
  `applySound`, `mkSetP`, `mkRender` (KEYS), `noteLog` (`step`), `uiFrame` (`arpFrame`), Test-API `arpLog`/`arpClear`/`arpInfo`, Hilfe-Zeilen, VERSION.

### Leistung / FP-IPHONE (Information)
- Node-Offline: der Arp sitzt im Hauptfaden; die Stimmen sind dieselben wie bei Clip-Noten (keine neue DSP).
- Chromium ×4 gedrosselt (`v3-mk5-perf.mjs 4`): Arp-Anteil je `tick` p95 1,2–1,3 ms, ganzer `tick` p95 3,8–3,9 ms (4.12.0 ohne Arp 2,9–3,2 ms), rAF 60 fps, keine longtask.
- Leistungs-Probe am iPhone: neuer Fall „+Arp“ (Menü → Info → Leistungs-Probe; jetzt drei Fälle à 10 s).

### iPhone-Prüfpunkte (Xander)
1. ARP-Taste an (LED), einen Akkord halten: die Töne kommen nacheinander, die kleine LED blinkt im Takt.
2. EDIT-WAHL 2 auf ARP A: TYP (Regler 4) auf Wechsel 2, OKTAVEN (Regler 5) auf 2.
3. ARP B: LÄNGE (Regler 4) auf 6, zwei Nummerntasten antippen – sie blinken (Pause), 7 und 8 sind dunkel; der laufende Schritt leuchtet hell.
4. Mit laufendem Song spielen, dann ● aufnehmen: Der Clip enthält die gedrückten Akkorde, beim Abspielen arpeggiert er wieder.

### Geräte-Abgleich (microKORG, nach Gehör; blockiert nicht)
Step-Arp „Schritt aus“ (rückt die Note weiter?) · Swing +50 · Gate 0 · Key Sync aus bei laufendem Takt (nur Muster-Neustart vergleichen) ·
Arp 1/16, Gate 50 %, LFO 1 Key Sync Timbre: startet der LFO je Akkord oder je Schritt neu? · Auslösung Single mit Arp.

### Lücken
- Arp-Noten im Song-MIDI-Export (bewusst nicht, H-8; der Mitschnitt hat sie). Arp mit eigenem Tempo (nicht im Umfang). Arp für VA/FM/WT (VI2a).
- MK5-21 für den Mod-Sequenzer erst nach dem Merge mit MK6 prüfbar (am Merge offen).
- Am Server offen: nichts (keine Server-Änderung).

### Tests und Bilder
`dirigent-test/v3-mk5-arp.mjs` (+ `.out`), `v3-mk5-arp-audio.mjs` (+ `.out`), `v3-mk5-ui.mjs` (+ `.out`), `v3-mk5-perf.mjs` (+ `v3-mk5-perf4.out`),
`v3-mk5-fp.mjs`, `v3-mk5-shot.mjs` → `dirigent-test/v3-mk5-shots/` (P1, P2 L/R, P3 L/R, L1, L2 L/R, W; ARP B, Schritte 2/5 Pause, LÄNGE 6,
laufender Schritt), `v3-mk5-look-shots/` (M-SKIZZE), Regression `dirigent-test/v3-mk5-reg/`, `v3-mk5-smoke.png`.

## MK5-fix — Befunde der Abnahme (App bleibt 4.13.0, Format 5; nur `ARPC` im MK-Block plus ein Feld in `noteLog`)

Neustart-Prüfung: kein `synq-snapshots/MK5-fix.html` → alle drei Befunde neu behoben.

1. **KEY SYNC aus (INIT) – Schleife und Aufnahme klangen bei jedem Durchlauf anders** (zwei Befunde, acceptance + specialist).
   Ursache: Mit KEY SYNC aus war der Muster-Zähler der absolute Song-Rasterschritt (`c = idx`). Ein Dreiklang in einem Takt (16 Schritte)
   wanderte je Durchlauf um eine Note; bei Zufall stand der absolute Schritt im Startwert, so wiederholte sich nie etwas.
   Behebung: Mit KEY SYNC aus zählt der Zähler auf dem Song-Raster **ab dem Taktstrich, in dem der Akkord begann** (`s.gb`, beim Zurückspulen
   wiederhergestellt) und läuft über gehaltene Takte weiter. Damit gilt MK5-07 weiter (zwei Anschläge im selben Takt = dasselbe Muster ab dem
   Takt), und MK5-13/MK5-14 gelten auch mit den INIT-Werten; Zufall bleibt innerhalb eines gehaltenen Akkords zufällig (keine 1-Takt-Wiederholung).
   **Entscheidung (eK, Spec-Konflikt Umfang 3 / MK5-07 gegen MK5-13/-14):** Am Gerät läuft der Zähler mit KEY SYNC aus frei weiter; hier richtet
   er sich nach dem Takt, in dem der Akkord begann, damit Schleifen und Aufnahmen gleich klingen (Umfang 2 „damit Wiederholungen gleich bleiben“).
   Sichtbar ändert sich nichts (LCD-Text „aus · das Muster läuft mit dem Takt“ bleibt richtig). Wenn Xander lieber den frei laufenden Zähler
   des Geräts will, ist das eine Zeile (Vorschlag für den Funk, nicht umgesetzt).
2. **FP-SONG: Akkord auf dem gehörten Schlag startete den Arp einen ganzen Schritt zu spät** (bei 1/4 ein ganzer Schlag), während ● REC/FANG
   die Taste auf dem Schlag speichern → Aufnahme und Abspielen wichen ab.
   Ursache: Der erste Schritt war der erste Rasterpunkt nach Tastendruck + `LIVE_LEAD` (Audio-Zeit); REC/FANG speichern `t2b(Druck − outLat)`.
   Behebung (`lateIdx`, `s.late`): Jede Live-Taste trägt `ref` = Druck wie gehört (`now − outLat`, genau wie REC/FANG). Liegt ein Rasterpunkt
   bis `LATE` = min(60 ms, 0,4 Schritt) vor (oder nach) diesem gehörten Druck und würde der normale Weg ihn verpassen, ist er **Schritt 1 des
   neuen Akkords** (Zähler dieses Rasterpunkts, KEYS 9 dort). Er klingt sofort: liegt der Rasterpunkt noch vor „jetzt“, genau auf dem Raster,
   sonst 20 ms (`LATEW`, damit die übrigen Tasten eines Akkords aus mehreren Berührungen dazukommen) nach dem Klang der Taste, spätestens
   10 ms vor dem nächsten Schritt; seine Länge endet spätestens beim nächsten Schritt. Ab Schritt 2 liegt alles wieder auf dem Raster.
   Nur für einen **neuen** Akkord (nichts gehalten, auch kein gelatchter Akkord) und nie, wenn dort schon ein Schritt klingt.
   Clip-Noten bekommen dieselbe Regel mit `ref = an`: eine ungequantelte Aufnahme (Note 1.012) beginnt beim Abspielen ebenfalls auf Schlag 1
   (klingt zur Notenzeit, nie früher) – so sind Spielen, ● REC mit Q AUTO und mit Q aus gleich.
   `arpLog`/`noteLog` markieren diesen ersten Schritt mit `late` (Test-API; MK5-03/-05 messen das Raster ohne ihn).
   **Abweichung (eK):** Dieser eine erste Schritt liegt nicht auf dem Raster (M-ZEIT ± 0,002 Schlag gilt ab Schritt 2); er kann nicht in der
   Vergangenheit klingen. Vorher kam stattdessen ein ganzer Schritt Verspätung und eine verschobene Folge.
   Grenzfall: Ein Akkord, der vor dem ersten Schlag einer ● Aufnahme ohne Einzähler gedrückt wird, startet live auf dem gehörten Schritt
   davor, während die Aufnahme ihn auf ihren Anfang legt (dort ein Schritt Versatz, unverändert vom Aufnahme-Weg).

**Belege** (Chromium 1243, `mk-br-MK5/index.html`):
- Neu `dirigent-test/v3-mk5-fix.mjs`: 17/17 PASS – MK5-13 INIT (KEY SYNC 0) 1 und 4 Takte, Auf und Zufall, drei Durchläufe gleich; MK5-07 aus;
  MK5-14 KEY SYNC 0/1 × Q auto/aus × Auf/Zufall (Abspielen = Spielen, erste Note sofort und `late`, zweite auf B + 0,25 ± 0,002);
  FP-SONG 1/16 und 1/4 bei −20/0/+20 ms zum gehörten Schlag: Zähler 0,1,2, C zuerst, Schritt 2 auf dem Raster.
- Repro-Skripte der Abnahme: `v3-qa-mk5-a.mjs` 3/3 PASS (MK5-13 INIT Auf/Zufall, MK5-14 Zufall INIT); `v3-repro-mk5-ks0loop.mjs` alle
  `same12/same23: true`; `v3-verify-mk5-ks0.mjs` 6/6 PASS; `v3-qa-mk5-rectake.mjs` Spielen = Abspielen in allen 4 Fällen;
  `v3-qa-mk5-onbeat.mjs`/`v3-repro-mk5-14onbeat.mjs`: erster Arp-Ton mit dem Zähler des gehörten Schlags (vorher immer ein Schritt danach).
- `v3-mk5-arp.mjs` 79/79 (MK5-03/-05 messen das Raster ohne den `late`-Schritt), `v3-mk5-arp-audio.mjs` alle, `v3-mk5-ui.mjs` 80/80,
  `v3-mk5-perf.mjs` (Arp-Anteil p95 0,2–0,3 ms, PE1), `v3-qa-mk5-stress.mjs` (0 Fehler, keine hängende Stimme), Smoke ohne Fehler.
- Bekannt wackelig, auch im Stand vor dem Fix (nicht Teil der Befunde): MK5-02 „live zweimal“ (Akkord-Fenster bei der 10-ms-Uhr von
  Headless-Chromium; vorher 3/6, jetzt 1/6 Fehlläufe) und MK5-16 `frames_ok` der Leistungs-Probe (Quantum-Spitzen der Testumgebung).

## G-MK5-Fix (Gruppe): Akkord auf dem Schlag mit normaler Finger-Spreizung verlor Schritt 1 (4.13.0, Version unverändert)

**Befund (major):** Drei Tasten 15–20 ms auseinander (30–40 ms erste bis letzte, typisch für drei Finger auf dem Bildschirm) auf dem
gehörten Taktstrich: der `late`-Schritt 1 (C) fiel weg, der Schlag blieb stumm, der erste Arp-Ton war E auf B + 0,25 (KEY SYNC an: C eine
Sechzehntel zu spät, ganzes Muster verschoben; 1/8: erste Achtel stumm). Live ≠ ● Aufnahme. Ursache (`ARPC.plan`): Der späte Schritt
galt nur, solange die **erste** Taste des Akkords jünger als 20 ms war (`s.late.x.on >= now − .02`); jede weitere Taste plant ihn neu,
die dritte kam 30–40 ms nach der ersten → der Neuplan verwarf ihn und Schritt 0 lief stumm. Das 30-ms-Akkordfenster wurde nur von der
ersten Taste aus gemessen (`lx.on + CHW`).

**Behebung (nur `ARPC.plan`, eine Stelle):** Die übrigen Tasten eines gespreizten Akkords schließen sich als **Kette** an (jede höchstens
`CHW` = 30 ms nach der vorigen, vor dem nächsten Schritt); der späte Schritt bleibt gültig, solange die **letzte** Taste dieser Kette frisch
ist. Er klingt wie bisher `LATEW` (20 ms) nach der letzten Taste, spätestens 10 ms vor dem nächsten Schritt, und liest den Akkord mit allen
Tasten der Kette. Ein bereits klingender Schritt wird nie geschnitten (unverändert); keine anderen Wege berührt.

**Belege** (Chromium 1243, `mk-br-MK5/index.html`):
- `v3-qa-gmk5-x8.mjs` (Spreizung 12–40 ms, −10/0 ms): vorher 9/16, jetzt **16/16** PASS (C als `late`-Schritt vor der 2. Sechzehntel).
- `v3-qa-gmk5-x8b.mjs` (KEY SYNC an / 1/8): **6/6** PASS. `v3-qa-gmk5-x6.mjs` (CDP-Touch, 3 Finger): **10/10** PASS.
- Neu `dirigent-test/v3-gfix-mk5-x6r.mjs` (CDP-Touch, Wiederholungen, Fenster-bewusst, Stimmen geplant/abgesagt protokolliert):
  1/16 16/16, 1/8 8/8, KEY SYNC an 8/8 PASS.
- Klang (nicht noteLog): `v3-verify-mk5-spread.mjs` (AudioWorklet-Abgriff, Tonhöhe per Autokorrelation): **0/15** verlorene C
  (vorher 9/15); C klingt bei B + 94–110 ms, E auf der 2. Sechzehntel – wie das Abspielen der Aufnahme (C auf B, E auf B + 0,25).
- Regression: `v3-mk5-arp.mjs` 78/79 (einziger Fehler MK5-02 „live zweimal“, bekannt wackelig, transport-gestoppt/freies Raster, vom Fix
  nicht berührt; derselbe Test schlägt auch auf `synq-snapshots/MK5-fix.html` 1 von 3 Läufen fehl), `v3-mk5-fix.mjs` 17/17,
  `v3-mk5-arp-audio.mjs` 11/11, `v3-qa-mk5-a.mjs` 3/3, `v3-verify-mk5-ks0.mjs` 6/6, `v3-qa-mk5-rectake.mjs` Spielen = Abspielen (4 Fälle),
  `v3-qa-mk5-onbeat.mjs` erster Ton C mit dem Zähler des gehörten Schlags, `v3-qa-mk5-stress.mjs` 0 Fehler, Smoke ohne Fehler.
- Keine Layout-/Aussehens-Änderung, keine Datenbank-Änderung.


# CHANGES – MS 2000, Paket MK6 (Zweig-Kopie `mk-br-MK6`)

## MK6 — Mod-Sequenzer 3×16 und „Bewegung aufnehmen“ · App 4.14.0 (`APP_CODE` 4 014 000) · Format bleibt 5

**Vorgänger-Stand** für alle „bitgleich“-Abnahmen: **4.12.0** (Start dieser Kopie, MK0–MK4 zusammengeführt; Kopie
`scratchpad/mk6-base-4.12.0.html`, 2 874 742 B). MK5 (Arp) und MK7 (Vocoder) entstehen gleichzeitig in `mk-br-MK5` / `mk-br-MK7`;
der Orchestrator führt zusammen und setzt die VERSION-Zeile. Server: keine Änderung nötig (`max_app` 4 021 000 ≥ 4 014 000, Format 5).
Kein Supabase-Aufruf in diesem Lauf. Neustart-Prüfung: kein `MK6.html` und keine halbe MK6-Arbeit vorhanden → neu gebaut.

### Gebaut
1. **Seq-Kern im AM-Zweig des Worklets** (zwischen `/*MK{*/ … /*}MK*/`, ASCII): je Timbre drei Sequenzen à 16 Schritte mit
   gemeinsamer Position (`MkSqP`). KEY SYNC **Timbre** = eine Position je Timbre (Neustart bei der ersten Note nach „alle los“, an derselben
   Stelle wie der LFO-Key-Sync), **Stimme** = eine Position je Stimme (Neustart bei Neuanschlag, nicht bei Legato), **aus** = Song-Raster:
   Zyklus C = Summe der Schrittlängen, Schritt bei (Song-Schlag mod C); ohne laufenden Song frei weiterlaufend. Einmal + KEY SYNC aus
   startet bei Schlag 0 und hält nach C. Tempo-Wechsel behält die Schlag-Lage (wie der Sync-LFO).
   - LETZTER SCHRITT 1–16, TYP Vorwärts / Rückwärts / Wechsel 1 (1…16, 15…2) / Wechsel 2 (1…16, 16…1), LAUF Einmal (hält den letzten Wert) /
     Schleife, AUFLÖSUNG W-10 (16 Werte × 4 Schläge) im Song-Tempo.
   - BEWEGUNG **Glatt** = linear zwischen den Schrittwerten (Bruchwerte); **Stufe** = halten, jeder Sprung als lineare **1-ms-Rampe ab der
     Blockgrenze** (B.6 Nr. 2 b).
   - **31 ZIELE** (0 keins … 30): Tonhöhe ±24 HT (wirkt auf KT, also auch auf Keytrack und Patch-Quelle Keytrack), Schrittlänge ±6
     (verschiebt den Auflösungs-Index je Schritt), Portamento, OSZ1-Steuer 1/2, OSZ2-Halbton ±24, OSZ2-Fein, Mixer OSZ1/OSZ2/Rauschen,
     Cutoff, Resonanz, HK-INT, Keytrack, Amp-Pegel, Pan, EG1 A/D/S/R, EG2 A/D/S/R, LFO1/2-Freq, Patch 1–4 Intensität. Schrittwert +
     gespeicherter Wert, geklemmt; Vorrang SEQ 3 > SEQ 2 > SEQ 1. LFO-Freq bei TEMPO SYNC an wirkungslos (bitgleich). Steuer 2 bei der
     Speicherwelle = **Wellenfolge** (Stufe springt direkt zur Welle des Schritts, 2-ms-Blende aus MK2; keine Zwischenwellen).
     EG-Zeiten wirken ab der nächsten Stufe (je Stimme beim Stufenwechsel eingerastet; SUSTAIN folgt in der Sustain-Stufe).
   - **Bewegung aufnehmen** im Worklet (`{mkRec}` → `{mkRecDone}`): der Live-Wert des Reglers minus seinem Startwert landet ab dem laufenden
     Schritt bis LETZTER SCHRITT; währenddessen vorwärts als Schleife (auch bei Rückwärts/Einmal); die aufgenommene Sequenz ist dabei stumm.
   - Neutral: Seq aus und Seq an mit lauter 0 rechnen bitgleich zum Vorgänger (Offsets werden nur angewandt, wenn ≠ 0).
   - `mkScope`: je Stimme `seqStep` (die seit dem letzten Bericht betretenen Schritte), dazu `seq[ti] = {on, run, step, done, rec, vals}`.
   - Test-Abgriff `'gain'` (Verstärkung je Sample ohne Signal).
2. **Bedienfeld** (`sq-mk-src`): EDIT-WAHL 2 Stellung 11 **SEQ** aktiv (vorher „kommt mit MK6“). Ebene 1 SEQ AN · SEQUENZ (1│2│3, Ansicht)
   · ZIEL (31 Einträge, stetiger Regler mit Rundung, alle in < 200 px; Tipp = scrollende Liste) · BEWEGUNG · LÄNGE; **Ebene 2 (SHIFT)**
   TYP · LAUF · KEY SYNC · AUFLÖSUNG (Matrix „EB2“). Matrix-Zeile „SEQ ●“ (an) und „SCHRITTE ▸“; LCD-„*“, wenn eine höhere Sequenz
   dasselbe Ziel hat; ◎ markiert SEQ; Auswahl-Liste der EDIT-WAHL 2 zeigt eine SEQ-Zeile.
   - **Zusatz-Ansicht SCHRITTE** (Tipp auf die Matrix-Zeile): [◂ GERÄT] [SEQ 1][SEQ 2][SEQ 3] [● AUFN.] (je ≥ 44 × 44) und 16 Säulen in
     **einem Canvas** (P1 2×8 à 41×88/4 px = 356×232, P2 39×88 = 340, P3 36×88 ohne Abstand = 288, L1 16×41×90/3 px = 701×136,
     L2/Halb-Ansicht quer 16×36×74 = 621×120). Senkrecht ziehen = Wert über die volle Säulenhöhe in Ziel-Einheiten (±6/±24/±63), Tipp
     über/unter dem Balken ±1, waagrecht > 8 px malt, ein Undo je Geste, zweiter Finger ignoriert, laufender Schritt hell (≤ 30 Hz, nur
     sichtbar und nur während er läuft).
   - **● AUFN.**: wählt die Sequenz, springt zu GERÄT in SPIEL (CUTOFF/RESONANZ unter den Fingern), Matrix-Zeile „● AUFN.“ blinkt. Der erste
     bewegte Regler einer EDIT-WAHL-1-Sektion, einer PATCH-Stellung oder SPIEL-CUTOFF/-RESONANZ wird das ZIEL (ARP-/Effekt-Regler und
     Schalter nehmen nicht auf, LCD sagt es). Am Ende: Regler zurück auf seinen Startwert, SEQ an, **ein Undo** für alles.
   - **SHIFT + 5 Sequenz-Werkzeuge** (auch unter ⋯): Neu (S1/S2/S3/ALLE), Tauschen (1⇄2, 2⇄3, 1⇄3), Kopieren aus diesem oder einem
     gesicherten MS-2000-Sound (T1/T2 × S1/S2/S3 → gewählte Sequenz, ALLE = alle drei samt Einstellungen); je ein Undo.
   - Hilfe: zwei neue Zeilen (SEQ, ● AUFN./Werkzeuge); LCD-Hinweis beim ersten Antippen.
3. **Hauptfaden**: `mkRange` kennt die Seq-Pfade (`t.X.seq.on|last|type|run|ks|res`, `t.X.seq.q.K.k|m`, `t.X.seq.q.K.v.S`); `normMk`
   Ziel-Bereich 0…30 (vorher 0…40, ungenutzt); Wellen einer Wellenfolge werden vorab gebaut/geschickt (`mkSeqWaves`, auch in `mkRender`);
   `{mkRecDone}` an das Bedienfeld.
4. **Leistungs-Probe** (Menü → Info): Fälle „Kern“, „+FX“, **„+Seq“** (= „+FX“ mit drei Sequenzen je Sound bei KEY SYNC Stimme).
5. **Test-API**: `MKUI.knobSim(path, werte)` (Reglergeste durch die Bedienfeld-Logik, auch für die Aufnahme), `MKUI.stepsInfo()`,
   `MKUI.seqInit/seqSwap/seqCopy/seqToolsPop/recArm/recCancel`, `mkPanel()` mit `sq`, `rec`, `steps`.

### Abnahme MK6 (Node `v3-mk6-seq.mjs` 36/36, `v3-mk6-cpu.mjs`, `v3-mk6-fp.mjs` 16/16; Chromium `v3-mk6-ui.mjs` 28/28, `v3-mk6-pe1.mjs`, `v3-mk1-look.mjs` 88/88, `smoke.mjs`)
| ID | Ergebnis |
|---|---|
| MK6-01 | ✔ 1/16 bei 120 BPM, Ziel Amp-Pegel, Stufe: Rampenbeginn bei −16 Samples (genau ein Steuerblock vor dem 125-ms-Raster, ≤ 1 Block), Rampe 48 Samples = 1 ms; alle 16 Auflösungen (1/48 = 41,7 ms … 1/1 = 2 s) je 3 Schritte im Raster; M-KLICK Pegel-Stufe ±63: Säge C5 2,5 dB, Rauschen 2,3 dB. |
| MK6-02 | ✔ Glatt: Schrittmitte gemessen = erwartet (Abweichung 0,000 Einheiten = 0 % des Hubs); jede Steuerblock-Grenze bewegt sich. |
| MK6-03 | ✔ `seqStep` deep-equal für Vorwärts, Rückwärts, Wechsel 1, Wechsel 2 (L 16, zwei Zyklen); LETZTER SCHRITT 5 = Länge 5; Wechsel bei 5: 1,2,3,4,5,4,3,2 bzw. 1,2,3,4,5,5,4,3,2,1. |
| MK6-04 | ✔ Einmal: nach dem 5. Schritt bis 2,5 s Abweichung 0 (Wert von Schritt 5); Schleife: Zyklus 2 und 3 = Zyklus 1 (max \|Δ\| 0). |
| MK6-05 | ✔ Timbre: zweite Note bleibt im Raster, neue Note nach „alle los“ setzt zurück. Stimme: zwei Noten 0,3 s versetzt auf Schritt 5 bzw. 3. Aus: Schritt = (Song-Schlag mod C) mit Schrittlänge ±2 (C = 4,083 Schläge), zwei Starts aus Takt 2 und 3 zeigen am selben Schlag denselben Schritt (55/55). **Mit Arp (MK5-21) nicht prüfbar:** MK5 fehlt in diesem Zweig (s. Zusammenführen). |
| MK6-06 | ✔ Tonhöhe +12 an Schritt 3: +1199,98 ct, sonst ≤ 0,05 ct · Cutoff 40+63 → W-01(103), 100+63 → geklemmt 127 · Schrittlänge +2 an Schritt 1: 8992 Samples (187,5 ms ± 1 Block) · OSZ2-Halbton +2400 / −2400,09 / 0,03 ct · EG: DECAY-Schritt mitten im Decay bitgleich, RELEASE +63 wirkt ab dem Release · Patch-Intensität wirkt (Cutoff-Bereich ×4,7·10⁵ statt ×1) · LFO1-Freq bei Tempo Sync bitgleich wirkungslos (Kontrolle Sync aus 0,32). |
| MK6-07 | ✔ SEQ 1 + SEQ 3 auf Cutoff = nur SEQ 3 (max \|Δ\| 0); LCD „ZIEL *“ mit „SEQ 3 hat dasselbe ZIEL und Vorrang“. |
| MK6-08 | ✔ Wellen 1, 11, 21, 31, 41, 51 je Schritt: Spektrum = Einzel-Render (Abstand 0); M-KLICK 5,2 dB gegen den lauteren stehenden Zustand (Verfahren MK2, `mKlickSw`). |
| MK6-09 | ✔ Worklet: Schritte 3…8 (Start im 3. Schritt, LETZTER SCHRITT 8), Ziel CUTOFF, nur der erste Regler zählt. App (P1, echter Zug am FILTER-CUTOFF): ZIEL CUTOFF, SEQ an, Schritte 1–12 geschrieben, CUTOFF zurück auf 40, **ein Undo** stellt alles deep-equal her; MOD-FX TIEFE nimmt nicht auf; L1: SPIEL-CUTOFF nach ● AUFN. bei KEY SYNC Stimme in SEQ 2. |
| MK6-10 | ✔ Seq aus: 4 Timbres max \|Δ\| 0 gegen 4.12.0; Seq an mit lauter 0: 120 Renders (alle 29 Ziele außer Schrittlänge, KEY SYNC aus/Timbre/Stimme, alle TYP/LAUF/AUFLÖSUNG) max \|Δ\| 0; VA/FM6 0. |
| MK6-11 | ✔ Ziehen ¼ Säulenhöhe = +31,5 → +32 Einheiten (29 → 61), Malen über 4 Säulen, Tipp ±1 — je ein Undo; zweiter Finger ändert nichts; TONHÖHE ganz oben = +24; alle 31 ZIEL-Einträge in 200 px; ZIEL-Liste 31 Zeilen ≥ 44 px, scrollt. M-PLATZ in P1, P2, P3, L1, L2, W, L1 + Safe-Area, 926×428 + Safe-Area, L1 + Home-Balken (Halb-Ansicht): SEQ Ebene 1 und 2 und SCHRITTE — alle Treffer ≥ 44×44, keine Überlappung, nichts abgeschnitten, kein Scrollen; M-ANSICHT Ebene 1↔2 und GERÄT↔SCHRITTE ≤ 2 px (Rahmen, LCD, Seite, Räder, Tastatur stehen). M-SKIZZE (`v3-mk1-look.mjs`) 88/88. |
| MK6-12 | ✔ Node-Offline, Median aus 5 je Fall, je eigener Prozess: 3 Sequenzen KEY SYNC Stimme (Cutoff glatt, Tonhöhe Stufe, Pan glatt) **+0,08 … +0,26 × VA-Stimme** in 4 Läufen; KEY SYNC Timbre +0,07 … +0,30; Zusatzfall A-HK DECAY + PATCH 1 + LFO 1 FREQ +0,22 … +0,55 (Maschine stark ausgelastet, Geschwister-Builds liefen; Spitze je Quantum 99,9 % ≤ 1,4 ms in allen Fällen inkl. VA). PE1 (Demo spielt, zwei MS-2000-Spuren mit je 3 Sequenzen, SCHRITTE offen, Werte werden bei gehaltener Taste editiert, 120 → 90 → 120 BPM): rAF-Median 60 / 59,7 fps, 0 longtasks > 50 ms, laufender Schritt sichtbar. Leistungs-Probe „+Seq“ in Chromium: load_med 0,107, frames_ok, 59,9 fps, 0 longtasks, 0 Netz. |
| MK6-13 | ✔ Tauschen, Neu (eine/alle), Kopieren (eine aus T2 eines anderen Sounds, alle) deep-equal, je genau ein Undo, Rücknahme deep-equal; SHIFT + 5 öffnet die Werkzeuge (15 Tasten ≥ 44 px). Regression s. unten. **Budget +42 111 B (41,1 KiB) > 36 KB** (s. Abweichungen). |
| MK6-14 | ✔ Seq-Tonhöhe +12 mit KEYTRACK +48 hebt den Cutoff um +12,000 HT; während ● AUFN. läuft die Sequenz vorwärts als Schleife (TYP Rückwärts, LAUF Einmal: 3,4,5,6,7,8). |

**Hörbarkeit (H-1/H-3, Spec §0.3):** jeder Seq-Regler ändert den Klang messbar: SEQ AN (Pegel-Stufen ±50 an/aus), ZIEL (Cutoff → Pegel → Pan),
BEWEGUNG (Glatt/Stufe, MK6-02 gegen MK6-01), LÄNGE / TYP / LAUF (Schrittfolgen MK6-03/04), KEY SYNC (MK6-05), AUFLÖSUNG (16 Raster, MK6-01),
Schrittwerte (App-Pfad `mkRender`: Höhen-Anteil −21,8 / −35,3 dB bei Cutoff 64 ± 50). Speichern → Neuladen: `p.mk` deep-equal.

### Fach-Prüfung (vor der Abnahme, selbst ausgeführt): FP-DSP (Haupt-Blick), FP-SONG (Zweit-Blick) — 6 Befunde, 5 behoben, 1 begründet
1. **FP-DSP / Umschalten (behoben):** Ein Wechsel der wirkenden Ziele (SEQ AN, ZIEL, Vorrang, Aufnahmebeginn) bei klingender Note sprang
   hart (ZIEL Cutoff → Pegel: M-KLICK 5,4 dB, knapp unter der Grenze). Jetzt blenden alte Offsets in 5 ms aus und neue in 5 ms ein (L3); reine
   Werte-Änderungen behalten Rampe/Gleiten. Danach `v3-mk6-fp.mjs`: 12 Umschalt-Fälle M-KLICK ≤ 3,8 dB, kein Einbruch unter den leiseren
   stehenden Zustand (≥ −0,1 dB). Nach dem Ausblenden ist „aus“ wieder bitgleich.
2. **FP-DSP / Wellenfolge (behoben):** Die 1-ms-Stufenrampe lief bei Steuer 2 durch alle Zwischenwellen (0 → 20 = Wellen 1…11, fehlende
   Tabellen → Platzhalter-Säge, M-KLICK 41,5 dB). Jetzt springt die Welle direkt (2-ms-Wellenblende), die Rampe bleibt für die WFM-Tiefe.
3. **FP-DSP / Fuzz (geprüft):** 300 Zufalls-Sequenzen über alle Ziele, Typen, KEY SYNC, Extremwerte, mit Patches/Resonanz: 0 NaN, Spitze 0,62.
4. **FP-SONG / Takt (geprüft):** KEY SYNC aus folgt dem Song-Schlag auch über 120 → 90 BPM (0 Abweichungen in 116 Berichten); Einmal ab
   Schlag 0 hält nach 4 Schlägen; KEY SYNC Timbre läuft über den Tempo-Wechsel stetig.
5. **FP-SONG / Anzeige (behoben):** Der Schrittbericht einer ruhenden Spur war veraltet (Seq-Zustand erst beim nächsten Ton neu berechnet) und
   der laufende Schritt leuchtete auch ohne Ton. Jetzt rechnet der Bericht nach, und hell ist nur ein laufender Schritt.
6. **FP-DSP / CPU (begründet):** Node-Zeiten streuen auf dieser Maschine stark (Geschwister-Builds); Kernfall ≤ 0,26 × VA in allen Läufen,
   der eigene Zusatzfall (EG + Patch + LFO-Freq) einmal 0,55. Die Leistungs-Probe „+Seq“ misst am iPhone.
- Undo-Gruppen und Rundweg (FP-SONG): je Geste/Werkzeug/Aufnahme genau ein Undo, Speichern → Laden deep-equal; Clips/Song unberührt
  (Seq lebt im Sound, `p.mk.t[].seq`). Worklet-ASCII ✓; ECO-Rückfall ohne Seq (B.5) unverändert.

### Abweichungen von der Spec (bewusst)
- **Budget +41,1 KiB statt ≤ +36 KB (×1,14).** Zusätzlich zum Plan: 5-ms-Zielblenden (FP-Befund 1), Wellenfolge ohne Zwischenwellen,
  scrollende Langlisten, Kurz-Namen für schmale Formate, Test-Hilfen (`knobSim`, `stepsInfo`, Abgriff `gain`, ≈ 1,5 KB). Kommentare
  wurden schon gekürzt (−6,7 KB gegenüber dem ersten Stand).
- **Schrittwerte werden mit ±63 gespeichert** und erst dort, wo sie wirken, auf den Bereich des Ziels geklemmt (±24 Tonhöhe/Halbton, ±6
  Schrittlänge). So geht beim Durchdrehen von ZIEL nichts verloren; der Editor schreibt nur Werte im Zielbereich.
- **Bewegung aufnehmen** schreibt die Reglerbewegung **relativ zum Startwert** des Reglers und setzt den Regler danach zurück (sonst
  doppelte Wirkung beim Abspielen). Tonhöhe nimmt über TRANSP. auf. Nach ● AUFN. steht das Bedienfeld in SPIEL (CUTOFF/RESONANZ dort nehmen auch auf).
- **EG-Ziele**: Zeiten rasten je Stimme beim Stufenbeginn ein; SUSTAIN folgt in der Sustain-Stufe.
- **Globale LFOs bei KEY SYNC Stimme** nehmen den LFO-Freq-Wert der jüngsten Stimme (wie der Patch auf LFO2-Freq).
- **Glatt + KEY SYNC Timbre-Neustart** bei noch ausklingenden Stimmen springt auf Schritt 1 (keine Rampe); Stufe rampt.
- **Verzerrer-Tiefe** (W-23, aus den Mixer-Pegeln) folgt den Mixer-Zielen der Sequenz nicht.
- **SCHRITTE bei TIMBRE „beide“** bearbeitet T1 (die angezeigte Spalte).
- Abnahme MK6-12 in Node gemessen; der iPhone-Faktor ist weiter unbelegt (Leistungs-Probe „+Seq“).

### Zusammenführen (für den Orchestrator)
- **MK5 (Arp, KEYS 9/10):** Der Seq-Neustart bei KEY SYNC Timbre steht in `MkTim.noteOn` direkt neben dem LFO-Key-Sync-Timbre
  (`if (Math.round(this.T.seq.ks) !== 0) …`). Wenn MK5 diese Stelle auf den KEYS-Tastensatz umstellt, muss die Seq-Zeile mitwandern;
  danach MK6-05 „mit Arp an (Gate 50 %): Reset nur je Akkord“ prüfen. Probe: „+Seq“ baut auf „+FX“ (MK5 bringt „+Arp“).
- **MK7 (Vocoder):** SEQ ist im Vocoder dunkel/„–“ (SEC2[10][1] = '–'); `build()` schließt SCHRITTE bei `mode` 3. MK7 muss die Stellung im
  Vocoder dunkel zeichnen.
- Berührt außerhalb der MK-Blöcke: `onMsg` (`m.mkRec`), Scope-Meldung (`seq: this.mk.sqScope()`), `SynthHost.track` (`mkRecDone`),
  `mkSetP` (Seq-Pfade → `mkwFeed`), `mkwFeed`/`mkSeqWaves`, `mkRender` (Wellen der Wellenfolge), `openEdMore` (⋯ → Sequenz-Werkzeuge),
  Hilfe (2 Zeilen), `VERSION`. Im immer geladenen Teil: `SEQK` 30, `mkRange` (Seq-Pfade). Worklet: `mkT()`/`MkTim.load/set` (seq),
  `start`/`monoSel`/`polyOn` (Seq-Position, Gleiten `v.gl`), `voice()` (Offsets), `prep` (`vc1`/`vc2`/`vw2`), `inherit`, `mkClone`, `MkCore.recMsg/sqScope`.
  Bedienfeld: `L_`, `KN`, `SEC2[10]` (+ Ebene 2 in `s[5]`), `kOf`, `knobs()`, `get`/`setv` (`sqsel`), `lcdOf`, `setWahl`, Matrix-`render`,
  `wiaPos2`, `numKey` (SHIFT + 5), `listPop` (Langlisten), `knobGesture` (Aufnahme-Haken, `d.px`), `build` (Ansicht 'schritte'), `timReset`, Probe, CSS.

### Regression
- Node: `v3-mk1-dsp` 64/64, `v3-mk4-fx` 61/61, `v3-mk3-scale` 6/6, `v3-mk2-osc` 31/31, `v3-mk4fix-kill` 30/30.
- Chromium: `v3-mk1-look` 88/88 (M-SKIZZE), `v3-mk3-ui` 37/37, `v3-mk4-ui` 63/64, `v3-mk1-ui` 32/33, `v3-mk2-ui` 22/24. Smoke ohne Fehler (`dirigent-test/v3-mk6-smoke.png`).
- **Nicht aus MK6 (schon im Vorgänger 4.12.0, gehören in den Hauptstrang):** `v3-mk4-ui` MK4-12 erwartet STIMMUNG/SEQ dunkel (veraltet seit MK3;
  scheitert auch auf 4.12.0); `v3-mk2-ui` MK2-10 erwartet MOD-FX … SEQ dunkel (veraltet); `v3-mk3-timbre` MK3-07 Stimmwelle gegen 4.10.0
  (scheitert auch auf 4.12.0, Folge von MK2-fix); `v3-mk2-ui` MK2-08 (Wellen-Zeit 30,2 ms, schwankt) und `v3-mk1-ui` MK1-31 (🎲 1 stummer Wurf
  von 100) wie in CHANGES-MK-MK4 beschrieben; `v3-mk1-fpdsp`/`v3-mk3-fpdsp` „Denormale Filtertyp 0“ ist eine Zeitmessung, die auf 4.12.0
  ebenso scheitert (15–19/58 Fenster) und hier zwischen 0/58 und 16/58 schwankt.
- Markenwörter (B.6 Nr. 9): AM-Teil 0, ganze Datei genau 1× `MS 2000` (MK_LABEL). Worklet ASCII. Keine Konsolenfehler in allen Läufen.

### iPhone-Prüfpunkte (Spec MK6)
1. MS-2000-Spur, EDIT-WAHL 2 auf **SEQ** (letzte Stellung): SEQ AN, ZIEL CUTOFF. Tipp auf die Matrix-Zeile → **SCHRITTE**: Säulen malen,
   Song starten → der Klang „läuft“ im Takt, der laufende Schritt leuchtet.
2. **● AUFN.** tippen → GERÄT (SPIEL), eine Taste halten und den **CUTOFF**-Regler langsam drehen → die Bewegung steht danach in den Säulen,
   der Regler springt zurück, ↶ nimmt alles zurück.
3. SHIFT: TYP Rückwärts / Wechsel, LAUF Einmal, KEY SYNC Stimme (zwei Töne nacheinander laufen versetzt).

### Geräte-Abgleich
Entfällt (der microKORG hat keinen Mod-Sequenzer); die Kurven bleiben eK.

### Tests und Dateien
- `dirigent-test/v3-mk6-seq.mjs` (Node, `v3-mk6-seq.out`), `v3-mk6-cpu.mjs` (`v3-mk6-cpu.out`), `v3-mk6-fp.mjs` (Fach-Prüfung, `v3-mk6-fp.out`),
  `v3-mk6-ui.mjs` (Chromium, `v3-mk6-ui.out`), `v3-mk6-pe1.mjs` (`v3-mk6-pe1.out`), Hilfen `v3-mk6-q0.mjs`, `v3-mk6-dbg*.mjs`, `v3-mk6-look0.mjs`.
- Bildschirmfotos `dirigent-test/v3-mk6-shots/`: je Format P1, P2, P3, L1, L2, W, L1-SA, L0-SA, L1-HB: `-seq`, `-seq-eb2`, `-schritte`; dazu `P1-schritte-edit.png`.
- Schnappschuss: `synq-snapshots/MK6.html`.

## MK6-fix — 4 bestätigte Befunde der Abnahme (App bleibt 4.14.0, Format 5, keine Datenbank-Änderung)

### Behoben
1. **● AUFN. endete nie bei LÄNGE 1 oder nach einem abgelaufenen LAUF Einmal** (MK6-09, MK6-14). Worklet:
   - `recMsg` setzt `done` der Timbre- und aller Stimmen-Positionen zurück: während der Aufnahme läuft die Sequenz als Schleife weiter,
     auch nach dem Auslaufen von Einmal (vorher stand die Position auf dem letzten Schritt fest).
   - Neuer Durchlauf-Zähler `MkSqP.wr` (in `sqAdv`, Schleife und Song-Raster). `recStep` endet, wenn ein neuer Durchlauf beginnt
     (`r.H.wr !== r.w`) oder der Schritt kleiner wird. Damit endet die Aufnahme auch bei LÄNGE 1, wo der Schritt immer 1 bleibt.
   - Nachweis: `v3-qa6-acc.mjs` Q9a–e 5/5 (vorher Q9a/b/d FAIL). `v3-qa6-ui.mjs` ONLY=REC 3/3 in Chromium mit dem echten ● AUFN.-Knopf:
     ZIEL 11, SEQ an, CUTOFF zurück auf 40, ein Undo. `v3-vrf-mk6rec.mjs` A, B, B2, C, D enden alle (vorher A, B, B2 hingen).
2. **FP-SONG: Bei KEY SYNC aus folgte die Sequenz dem Transport-Schlag statt dem Song-Schlag** (MK6 Umfang 1, MK6-05).
   - Hauptthread: `mkSongSync()` (neben `songBeatOf`) schickt `{mkSong: {off, prev, wrap}}` an die Engines, nur wenn sich etwas ändert.
     Aufgerufen im Scheduler direkt nach `songTick`, also auch bei ▶ SONG ab Takt n, ⟲-Schleife und Teil-Sprung. Der Scheduler läuft
     voraus, deshalb kommt ein Sprung vor dem hörbaren Zeitpunkt an.
   - Worklet: `sqTick` rechnet Song-Schlag = Transport-Schlag − off (vor `wrap`: − prev), genau wie `songBeatOf`. Einmal wartet vor
     Song-Schlag 0 auf Schritt 1 und hält nach C.
   - Zwischen den Noten läuft das Song-Raster jetzt weiter (`idle(n, fr)` bekommt den Block-Frame). Vorher stand die Position still,
     bis eine Note kam, und der erste Bericht nach einer Note zeigte einen alten Schritt.
   - Nachweis: `v3-fp6q-song.mjs` ab Takt 2 58/58 und ab Takt 4 58/58 auf dem Song-Raster (vorher 0/60 bzw. 0/59).
     `v3-fp6q-loop.mjs` 158/158 (vorher 86/161). `v3-fp6q-indep.mjs` 60/60, 61/61 und 60/60 (vorher 0/60 und 0/61).
     `v3-fp6q-indep2.mjs` (Einmal ab Takt 2) hält ab Song-Schlag 4 auf Schritt 5 (done).
3. **MK6-12 Leistung mit teuren Zielen** (beide Befunde: LFO1/2-FREQ bei LFO KEY SYNC Stimme; EG2 SUSTAIN, RESONANZ, Wellenfolge).
   - LFO-Frequenz als Tabelle `MK_LHZ`/`mkLHz` in 1/16-Einheiten, linear dazwischen. Ganze Werte sind bitgleich zu `MKW.lfoHz`,
     Bruchwerte weichen < 2e-6 relativ ab. Sie gilt nur auf den Seq-Wegen; ohne Seq bleibt alles wie vorher (MK6-10 bitgleich).
   - Die Arbeit je Stimme (Position, Werte, EG-Latch, LFO-Raten `v.qr1`/`v.qr2`) läuft in `sqPreAll`/`sqPre` vor den Stimmen, in einer
     eigenen Funktion. `voice()` liest nur noch `v.qso`/`v.qE1`/`v.qE2`/`v.qr1`/`v.qr2`.
   - SUSTAIN bewegt sich innerhalb der Sustain-Stufe: nur `Ev.s`/`Ev.dT` werden neu gesetzt statt `mkEnvC` (kein exp/log je Block;
     Stufe 3 liest nur `E.s`, der Rest wird an der nächsten Stufe neu gebaut). Ergebnis bitgleich.
   - `Ev` hat jetzt dieselbe Form wie `E1`/`E2`: Das Feld `.on` fällt weg, an seiner Stelle stehen `v.sqO1`/`v.sqO2`.
   - Schrittwerte werden einmal je Änderung in `sqPrep` geklemmt (`q.c`, Float64Array), nicht mehr je Stimme und Block.
   - Nachweis (Node, eigener Prozess je Fall, verschachtelt):
     - `v3-qa6-cpu.mjs`: LFO1+LFO2+RES 0,38 × (vorher 0,78–0,80), LFO1 allein 0,28 (0,80), LFO2 allein 0,29 (0,51), RES 0,22.
     - `v3-fp6q-cpu2.mjs` N=9: egs 0,39 × (vorher 0,62–0,88), wv 0,33 × (vorher 0,65–0,80).
     - `v3-mk6fix-cpu.mjs` (CPU-Uhr, alle Zielsätze, N=5–7): egs 0,32–0,47, egsStufe 0,38–0,41, wv 0,32–0,45, lfo 0,38–0,48,
       cheap 0,16–0,32. „nul“ (alle Werte 0, nur der Mechanismus) kostet 0,22.
     - `v3-mk6-cpu.mjs` (Builder) 0,20 / 0,12 / 0,37.
   - Die Streuung auf der geteilten Maschine liegt bei ±0,1. Der Schätzer „cpu“ aus `v3-rv-mk6cpu-indep.mjs` zählt die ganze
     Prozess-CPU, also auch JIT-Übersetzung, GC-Threads und das Lesen der Datei. Er ist keine Block-Messung und streut stark
     (VA-Stimme 8,7 statt 4,8 ms/s). q25 und das beste Fenster bestehen dort (egs 0,41–0,53, wv 0,32–0,37).
4. **Zusätzlich (gefunden mit `v3-qa6-ui.mjs`, Q-FIRST, scheiterte schon in MK6.html):** Bei der ersten Note nach dem Laden wurden die
   Seq-Werte 5 ms eingeblendet. Ein EG-Ziel rastete dadurch mit fast 0 ein, und SEQ ATTACK +63 wirkte auf diese erste Note nicht.
   `sqPrep` blendet jetzt nur ein, wenn es vorher schon einen Zielsatz gab (`this.sqSig != null`). Q-FIRST besteht: −36,3 dB wie das
   gespeicherte ATTACK 63.

### Regression (alle auf `mk-br-MK6/index.html`)
- Node:
  - `v3-mk6-seq.mjs` alle bestanden, MK6-10 bitgleich gegen 4.12.0 (MK4-fix.html).
  - `v3-mk6-fp.mjs` alle bestanden.
  - `v3-qa6-acc.mjs` 15/16. Q6 scheitert auch in MK6.html: Der Bericht bei t = 0,62 s liegt schon im Schritt ab 0,625 s; die Prüfung
    ist zu grob gerastert und zeigt keinen Fehler.
  - `v3-mk4-fx.mjs`, `v3-mk2-osc.mjs`, `v3-mk1-dsp.mjs`: Die einzigen Ausfälle sind die bekannten Zeitmessungen (Denormale,
    MK1-24). Sie bestehen im zweiten Lauf und scheitern ebenso in MK6.html.
  - `v3-mk3-scale.mjs` bestanden. `v3-mk4fix-kill.mjs` unverändert.
  - `v3-fp6q-bit/ks/rec/rec2/t3.mjs` liefern dieselben Werte wie MK6.html (siehe „Offen“).
- Chromium:
  - `v3-mk6-ui.mjs` 28/28, auch mit den echten Schriften: `v3-mk6fix-ui-font.mjs` lädt `cloudPagesExtras()` mit `fonts/` neben einer
    Kopie in `mk6fix-fonttest/`, alle 5 Schnitte geladen. Damit bestehen M-PLATZ, M-ANSICHT und die Leistungs-Probe „+Seq“
    (fps 59,9, 0 longtasks).
  - `v3-qa6-ui.mjs` alle bestanden.
  - Smoke ohne Fehler (`dirigent-test/v3-mk6fix-smoke.png`).
- Worklet weiter ASCII. Größe +4,1 KB (2 920 943 B).

### Zusammenführen (zusätzlich zu oben)
- Außerhalb der MK-Blöcke berührt:
  - Scheduler (eine Zeile `mkSongSync()` nach `songTick`).
  - `mkSongSync()` neben `songBeatOf`.
  - Prozessor `onMsg` (`m.mkSong` → `this.sqSong`) und Konstruktor (`sqSong`).
  - `MkCore.idle(n, fr)` und die zwei Aufrufer im Prozessor (`idle(CR, f0 + off)`, `idle(N, f0)`).
- Wenn MK5/MK7 `MkCore.idle` oder `MkTim.idle` ändern, muss der zweite Parameter `fr` mitwandern.

### Offen (nicht in der Befundliste, schon in MK6.html genauso; für den Orchestrator)
- `v3-fp6q-rec2.mjs`: KEY SYNC Stimme. Endet die jüngste Stimme mitten in der Aufnahme, springt die Aufnahme auf die Timbre-Position,
  und es bleiben Schritte ungeschrieben (4–6).
- `v3-fp6q-t3.mjs`: Den Wert des laufenden Schritts bei Glatt + CUTOFF ändern (SCHRITTE malen) ergibt M-KLICK 24–27 dB (Stufe ≤ 2,5 dB).
- `v3-fp6q-bit.mjs`: Gegen 4.12.0 weichen „patch 5/7“ auch bei Seq aus ab (max |Δ| 0,21 / 0,89). Ursache wohl vor MK6, gehört in den
  Hauptstrang.
- Hauptstrang (MK1, nicht hier behoben):
  - `voice()` erzeugt auch ohne Seq ≈ 13 MB/s Müll. Gemessen mit `dirigent-test/v3-mk6fix-alloc.mjs`, wahrscheinlich doppelte Werte in
    getaggten Feldern.
  - Ein ruhendes Timbre ruft in `MkTim.idle` je Block zweimal `lfoRate` (Math.pow) auf statt `lfoRateC`.
  - Beides kostet bei jedem AM-Klang.
- Neue Hilfen in `dirigent-test/`: `v3-mk6fix-cpu.mjs`, `v3-mk6fix-alloc.mjs`, `v3-mk6fix-font.mjs`, `v3-mk6fix-ui-font.mjs`,
  `v3-mk6fix-indep-dbg.mjs`, `v3-mk6fix-q6.mjs`.
- Schnappschuss: `synq-snapshots/MK6-fix.html`.

## G-MK6-gruppe-fix (4.14.0, Befunde der Gruppen-QA G-MK6, 26.10.)

Version bleibt 4.14.0 (Fix im Paket MK6), Format 5, keine Server-Änderung. Nur der Seq-Kern im AM-Zweig des Worklets
(`MkSqP`, `MkTim.sqPrep/sqAdv/sqVal/recMsg/recStep`, die zwei `recStep`-Aufrufe in `idle`/`block`) ist geändert. Größe +2,4 KB
(2 923 384 B), Worklet weiter ASCII, Markenwort-Prüfung unverändert (1 × `MS 2000`).

### Behoben
1. **● AUFN. endete nach 1–3 Schritten bei abgesetzten Noten (KEY SYNC Timbre/Stimme).** Eine neue Note nach „alle los“ setzte
   die Position auf Schritt 1 zurück, `recStep` las das als Ende der Aufnahme.
   - Neu: Bei KEY SYNC Timbre und Stimme hat die Aufnahme eine eigene Position. Sie startet beim laufenden Schritt (Index wie bisher,
     in der Vorwärts-Folge) und läuft vorwärts als Schleife bis LETZTER SCHRITT, unabhängig von Key-Sync-Neustarts (Umfang 4,
     MK6-09/-14). KEY SYNC aus bleibt auf Timbre- bzw. Song-Raster-Position.
   - Damit ist auch der offene Punkt `v3-fp6q-rec2.mjs` behoben (jüngste Stimme endet mitten in der Aufnahme: jetzt keine Lücken).
   - Nachweis: `v3-qa-gmk6-rec2.mjs` 3/3 (Timbre und Stimme staccato: Schritte 2–16), `v3-qa-gmk6-rec.mjs` 4/4 im Song (Bass
     Timbre/Stimme: 1–16, keine Lücken), `v3-repro-mk6-recks.mjs` (staccato Timbre/Stimme 1–16 in ≈ 2 s statt 1–2 in 0,18 s),
     `v3-repro-mk6-recks2.mjs` (Touch: nach 1 s läuft die Aufnahme noch, Ende „Schritte 1–16“), `v3-fp6q-rec2.mjs` (keine Lücke).
2. **Glatt sprang ohne Rampe bei TYP, LÄNGE, KEY SYNC, AUFLÖSUNG während einer Note.**
   - Neu: Springt die Glatt-Linie (Positionssprung durch eine Einstellung, Key-Sync-Neustart bei klingenden Stimmen, Song-Sprung bei
     KEY SYNC aus), gleitet der Wert vom letzten Wert mit τ = 5 ms zur neuen Linie (B.6 Nr. 2). Ohne Sprung bleibt die Linie exakt
     linear (MK6-02, MK6-10 bitgleich).
   - KEY SYNC Timbre ↔ Stimme bei klingender Note: Die Stimmen laufen an ihrer bisherigen Position (und mit ihren Werten) weiter,
     kein Sprung. (Bei Stimme → Timbre übernimmt die Timbre-Position die der jüngsten Stimme.)
   - Gain-Tap (`v3-qa-gmk6-gain.mjs`): TYP 6,2 ms, LÄNGE 5,7 ms, AUFLÖSUNG 6,4 ms (vorher je 0,3 ms), KEY SYNC → Stimme ohne Sprung
     (vorher 0,53 → 0,06 in 0,3 ms). Bezug Regler-Änderung 5,8 ms.
3. **Undo/Redo und Malen des laufenden Schritts in Glatt sprangen hart.** Dieselbe Gleit-Regel greift bei jeder Wert-Änderung
   (`sqPrep` zählt Änderungen, `sqVal` gleitet ab dem letzten Wert).
   - Gain-Tap: ↶ 7,1 ms, ↷ 5,7 ms, Malen 6,6 ms (vorher je 0,32 ms); Bezug Regler-↶ 7,1 ms.
   - Spur-Ausgang, HF-Burst gegen den lauteren stehenden Pegel (`v3-repro-gmk6-undoglatt.mjs`, Cutoff 64, Touch): ↶ +2,7 dB, ↷ +0,9 dB
     (vorher +32,6 / +36,2), Malen über den laufenden Schritt +2,5–2,7 dB (vorher +31), Ziehen 4,4–4,7 dB (vorher 14); Bezug Regler-↶ 2,0 dB.
   - Damit ist auch der offene Punkt `v3-fp6q-t3.mjs` behoben: Glatt CUTOFF −4,7…−5,5 dB, Glatt A-PEGEL −1,1 dB (vorher 24–27 / 6,3 dB).
   - Ein Wechsel BEWEGUNG Glatt → Stufe rampt ab dem Glatt-Wert (1 ms) statt zu springen.

### Messhinweis (für die Abnahme)
- `v3-qa-gmk6-click.mjs` misst M-KLICK gegen den Median ±20 ms. Ein großer CUTOFF-Wechsel öffnet die Höhen in wenigen ms; das wertet
  dieses Maß auch beim gewöhnlichen Regler (5-ms-Glättung) als Knack: „Stored knob change under a seq (CUTOFF 40 → 90)“ 27–29 dB.
  Glatt-CUTOFF-Fälle (TYP 38,8 dB) liegen deshalb dort weiter über 6 dB, obwohl sie jetzt wie der Regler gleiten.
- `dirigent-test/v3-gmk6g-click.mjs` (Kopie mit HF-Burst gegen den lauteren stehenden Pegel, wie im Befund 3): alle Glatt-Fälle
  ≤ 6 dB (TYP CUTOFF 10,8 dB bei 11,1 dB Eigen-Schwankung der laufenden CUTOFF-Rampe ohne Änderung). Die verbleibenden Ausfälle
  dort sind Stufe (1-ms-Rampe nach B.6 Nr. 2 b, gewollt) und M-EINBRUCH bei echten Pegel-Änderungen (LÄNGE 16 → 4 macht die
  Sequenz leiser; ebenso der Bezug „AMP PEGEL 127 → 60“).

### Regression (alle auf `mk-br-MK6/index.html`)
- Node: `v3-mk6-seq.mjs` 36/36 (MK6-09 Start bei Schritt 3, MK6-10 bitgleich gegen MK4-fix), `v3-mk6-fp.mjs` 16/16,
  `v3-qa6-acc.mjs` 14/15 (Q6 wie bisher, siehe oben), `v3-fp6q-ks.mjs` alle 0 dB (vorher Stufe Timbre → Stimme −5,1 dB),
  `v3-fp6q-rec.mjs` unverändert, `v3-fp6q-bit.mjs` gleich wie MK6-fix.
- Neu `dirigent-test/v3-gmk6g-bit.mjs`: 26 Seq-Läufe (KEY SYNC 0/1/2 × Glatt/Stufe × 4 TYPEN, Einmal, Schrittlänge, Akkord + Pause)
  bitgleich zu MK6-fix (`dirigent-test/v3-gmk6g-base.html`).
- `v3-mk6-cpu.mjs` (MK6-12) besteht: 0,26–0,36 / 0,14–0,21 / 0,42–0,46 × VA-Stimme (MK6-fix im selben Lauf 0,35 / 0,14 / 0,46).
- Chromium: `v3-fp6q-song.mjs` (FP-SONG) wie vorher; `v3-mk6fix-ui-font.mjs` mit den echten Schriften (`mk6fix-fonttest/`)
  28/28 inkl. M-PLATZ/M-ANSICHT und Probe „+Seq“ (fps 60,2, 0 longtasks); `v3-qa6-ui.mjs` bestanden; `v3-qa-gmk6-undo.mjs` 7/7;
  Smoke ohne Fehler (`dirigent-test/v3-gmk6g-smoke.png`).
- Hinweis Testumgebung: `/opt/pw-browsers/chromium-1194` gibt es auf dieser Maschine nicht; alle Läufe nutzen wie bisher
  `chromium-1243`.

### Offen (nicht behoben, für den Orchestrator)
- KEY SYNC Stimme → Timbre bei mehreren klingenden Stimmen an verschiedenen Positionen: die älteren Stimmen springen auf die Position
  der jüngsten (eine geteilte Position kann nicht je Stimme gleiten). Selten (Einstellung während eines Akkords).
- Stufe-Sprünge (Malen, Undo, TYP) bleiben bei 1-ms-Rampe nach B.6 Nr. 2 b; bei CUTOFF/AMP großer Hub hörbar hart, aber so verlangt.
- `v3-fp6q-bit.mjs` „patch 5/7“ und die Hauptstrang-Punkte (MK1) wie oben.
- Schnappschuss: `synq-snapshots/G-MK6-gruppe-fix.html`.


# CHANGES – MS 2000, Paket MK7 (Zweig-Kopie `mk-br-MK7`)

## MK7 — Vocoder mit 16 Bändern und Eingänge E1/E2 · App 4.15.0 (`APP_CODE` 4 015 000) · Format bleibt 5

**Vorgänger-Stand** für alle „bitgleich“-Abnahmen und das Budget: **4.12.0** (MK0–MK4 zusammengeführt =
`synq-snapshots/G-MK34-merge.html`, 2 874 742 B). Diese Kopie startet dort; MK5/MK6 entstehen in eigenen Zweigen.
Der Orchestrator führt zusammen und setzt die VERSION-Zeile endgültig. Server: keine Änderung nötig
(`max_app` 4 021 000 ≥ 4 015 000, Format 5). Kein Supabase-Aufruf in diesem Lauf. Nichts committet.

**Größe:** 2 927 671 B = **+52 929 B** (Budget MK7-14 ≤ +52 KB = 53 248 B) — eingehalten.
Davon grob: Worklet (MkVoc, Eingänge, Eingang-Welle) ≈ +20 KB, Bedienfeld `sq-mk-src` ≈ +22 KB, Hauptteil (Eingänge,
gemeinsamer Mikrofon-Abgriff, Undo, ECO, Probe, Test-API, Hilfe) ≈ +11 KB. Kommentare wurden dafür gekürzt.

### Gebaut
1. **Vocoder im Worklet** (`class MkVoc` im AM-Teil `/*MK{*/ … /*}MK*/`, ASCII), nur Timbre 1, MODUS 3:
   - **16 Analyse-Bänder** auf E2 (je 2 TPT-SVF-Bandpässe = 4. Ordnung, Güte fest 10), Mitten W-36-Raster,
     **Folger** je Band (W-38-Zeitkonstante, Anstieg τ/4), FOLGER 127 = Halten.
   - **16 Synthese-Bänder** auf dem summierten Träger (4. Ordnung, Q = 3 + 9·RESO/127), Lage aus W-36 mit
     FORMANT-SHIFT, CUTOFF, FC-MOD (Quelle + Intensität, W-37), Zwischenwerte log. in Noten interpoliert.
   - **Gate** (W-39, 3-ms-Spitzenfenster, exponentielles Schließen bis −60 dB in der Gate-Zeit), **HPF** 4. Ordnung
     Butterworth 6 kHz mit HPF-PEGEL und HPF-GATE (W-40), **DIREKT** (W-41), **K-PEGEL / K-PAN** je Band (W-42).
   - **Halten** (`voc.hold`, 16 × 0…127, 0,5-dB-Schritte): TIMBRE-Taste (LED „HALTEN“) friert die Folger ein und
     speichert sie mit dem Sound; nochmal = aus; FOLGER ganz auf hält ebenso. Ein gehaltener Sound klingt ohne Eingang.
   - **Begrenzer Stufe 1** (CPU): ~~statt 2 Bandpässen einer mit Q × 2 (+ Ausgleich 0,91)~~ – **ersetzt in MK7-fix:**
     dieselben Bänder 4. Ordnung bei halber Abtastrate. Wechsel 60 ms Vorlauf + 30 ms Blende je Sample. Ausgang mit weichem Knie über ±1 (Spitze ≤ +6 dBFS).
   - **Ruhe-Sparen:** stille Analyse wird übersprungen (keine Denormale), unbenutzter Eingang kostet nichts im Kern.
   - **Träger-Stimmen** (4 Säge im INIT „Vocoder“): OSZ 1 (alle Wellen, auch Sinus mit STEUER 1/2) + Rauschen + E1
     (W-19-Kurve), × EG2 × Pegel/Anschlag/KEYTR., Verzerrung (W-23), mono in die Trägersumme.
2. **Eingänge E1/E2** (EN3-15): Worklet-Knoten mit einem Stereo-Eingang (discrete), je AM-Spur ein ChannelMerger.
   `tr.mkIn = {e1, e2, e1Dry, e2Dry}` mit Quelle `null | 'mic' | 't:<uid>'` (Spur **vor dem Fader**, Abgriff an der
   `duck`-Stufe). **„Quelle nur als Eingang“** nimmt die Quelle über einen neuen Knoten `N.cut` (20-ms-Rampe) aus Master
   und Sends. **Kreis-Schutz** über alle Spuren (nicht wählbare Zeile „nicht möglich (Kreis)“). Ein Undo je Änderung
   (Art `mkin`), übersteht Speichern/Laden.
3. **Gemeinsamer Mikrofon-Abgriff** `MICTAP` (ref-gezählt, Nutzer `voc` und `st`): ein `getUserMedia` mit MIC_ASK
   (echoCancellation/noiseSuppression/autoGainControl aus), nur nach Tipp; der letzte Nutzer stoppt die Spuren.
   VS1 🎤 Stimme nutzt ihn jetzt ebenfalls (`stStart`/`stRelease`). Für den Vocoder laufen kein MPM und kein Ringpuffer.
   In der Claude-App gibt es keinen Mikrofon-Eintrag. Versteckte Seite = Vocoder-Mikrofon aus.
4. **Welle „Eingang“ (OSZ 1 = 7, W-30)** im Synth: (1 − BALANCE)·E1 + BALANCE·E2 durch Filter/Amp; TRANSP./FEIN wirkungslos.
5. **Bedienfeld:** Vocoder-Zeilen in EDIT-WAHL 1/2 (grüne Namen, Farbton 138°), SPIEL-Belegung im Vocoder,
   QUELLE 1/2 ▾ (Listen aus | Mikrofon | Spuren, „Quelle nur als Eingang“, „Mikrofon stoppen“), TIMBRE = HALTEN,
   SHIFT + 1/+ 2 = Pegel/Pan zurück (ein Undo), Zusatz-Ansicht **16 BÄNDER** (Canvas 2D, K-PEGEL oder K-PAN je Band
   ziehen, Bandpegel live ≤ 30 Hz, nur solange sichtbar), LEDs E1/E2 (an ab −50 dBFS, rot ab −1 dBFS).
   Modus Synth ↔ Vocoder startet die Tasten von T1 in der anderen Art neu; alle Elemente bleiben an ihrem Platz.
6. **Vokal-Quelle** `mkVowel` (W-44, DOM-frei, im `sq-mk-src` zwischen `/*MKV{*/ … /*}MKV*/`): Glottis (W-28) →
   F1–F4-Kaskade → Abstrahlung. Für Probe, Tests und später MK8/MK12.
7. **ECO:** Vocoder-Sound bleibt ohne Worklet stumm (keine Stimme), LCD „Vocoder braucht den Worklet-Klang – im ECO-Klang stumm“.
8. **Leistungs-Probe** mit drittem Fall „Vocoder“ (Vokalfolge in E2). **Hilfe:** 3 kurze MS-2000-Zeilen (Vocoder,
   Formant halten, Eingänge mit Latenz-/Kabel-Kopfhörer-Hinweis).
9. **Test-API:** `mkIn`, `mkInInfo`, `mkVocMic`, `mkHold`, `mkVowel`; `mkRender` mit `inputs {e1, e2}` und `at`.

### Abnahme MK7-01 … MK7-16
Tests: `dirigent-test/v3-mk7-voc.mjs` (Node-Offline, 37/37), `v3-mk7-inputs.mjs` (Chromium, Fake-Mikrofon, 24/24),
`v3-mk7-ui.mjs` (Chromium, 102/102), `v3-mk7-cpu.mjs`, Bilder `v3-mk7-shot.mjs` → `dirigent-test/v3-mk7-shots/`.

| Nr. | Ergebnis |
|---|---|
| MK7-01 | ✓ Bandtrennung k±1 ≥ 13,1 dB (≥ 12), k±3 ≥ 30,5 dB (≥ 30) |
| MK7-02 | ✓ Bandmitten W-36 (FORMANT 0/+1/−2, CUTOFF +63) max. 0,07 %; CUTOFF +32 0,4 % einer Stufe; FC-MOD EG2 +63 = +2 Stufen (0,39 %); SPIEL-Belegung im Bedienfeld |
| MK7-03 | ✓ FOLGER 0/64/126: 11,6 / 274,5 / 5 895 ms gegen W-38 11,5 / 273,7 / 5 894,6 ms; Halten (FOLGER 127 und TIMBRE) 5 s: 0,04 dB; gehaltener Sound ohne Eingang −19,8 dBFS; hold Speichern → Laden deep-equal |
| MK7-04 | ✓ Gate 64: −60 dB nach 68,0 ms (W-39 65,8); Gate 100: 452 ms (469,2); SCHWELLE 0: Ausgang folgt bis −90 dB |
| MK7-05 | ✓ HPF-PEGEL 127: Modulator > 6 kHz −3,1 dB; HPF-GATE: ohne Trägerstimme still, mit Stimme −3,1 dB |
| MK7-06 | ✓ DIREKT 127 ohne Stimme: Korrelation 0,9996; DIREKT 0 still |
| MK7-07 | ✓ K-PEGEL 0: −∞ dB; K-PAN L63: rechts −∞ dB; SHIFT + 1/+ 2, Init und SHIFT + 3 behalten den Vocoder |
| MK7-08 | ✓ jede OSZ-1-Welle als Träger hörbar; Akkord C-E-G-H 54–86 dB über der Lücke; EINGANG 1 im Träger; Sinus STEUER 1 +1,72 Okt., STEUER 2 mit LFO 1 |
| MK7-09 | ✓ Eingang durch 24LPF −34,4 dB = Ladder-Kurve; BALANCE ≥ 113 dB Trennung; TRANSP./FEIN Δ = 0; QUELLE 1/2 an Regler 4/5 |
| MK7-10 | ✓ Kreis abgelehnt (auch 3er-Kette), Graph kreisfrei; Spur → Eingang 0 Samples; Claude-App: 0 getUserMedia, kein Mikrofon-Eintrag; getUserMedia erst nach Tipp, MIC_ASK-Flags, Stopp → `ended`; Stimme + Vocoder: Stoppen des einen lässt den anderen laufen, erst der letzte → `ended`; „Quelle nur als Eingang“ Master −∞, Eingang weiter −17,1 dBFS; Fader 0 ändert den Eingang nicht; Stummschalten wie bisher; 0 Netzaufrufe |
| MK7-11 | ✓ Vocoder-Spur 1,92–2,15 × VA-Stimme (≤ 2,4, drei Läufe); Stufe 1: Nachbarband 8,1 dB (≥ 8), M-PEGEL Rauschen −0,76 dB, M-KLICK/M-EINBRUCH bestanden; Probe „Vocoder“ läuft (load_med 0,17, frames_ok) |
| MK7-12 | ✓ bitgleich (max \|Δ\| = 0) für AM Säge, AM Dual+FX, AM Split Rauschen, VA gegen 4.12.0. Unverbundener Eingang: 0,07 / 0,09 / 0,15 / 0,17 × VA in vier Läufen — **an der Grenze 0,16 und vom Mess-Rauschen bestimmt** (Differenz < 1 ms je s Audio; der Kern tut bei stillem Eingang nichts, der Rest ist Chromium-Graph-Arbeit) |
| MK7-13 | ✓ M-PLATZ Vocoder-Stellungen (Ebene 1/2) und 16 BÄNDER in P1–P3, L1, L2, W, mit Safe-Area/Home-Balken; M-SKIZZE grün 120–138°; M-ANSICHT Synth ↔ Vocoder; LEDs (E2 −26 dBFS an; +1,6 dBFS rot; −46 an; −54 aus); Bandpegel 28,6 Hz, rAF 59,9 fps |
| MK7-14 | ✓ Budget +52 929 B; VS2-Abnahme (`v3-mk7-vsacc.mjs`): alles grün bis auf „Stimme rechtzeitig geplant“ (−9 ms), das **auch auf 4.12.0** fehlschlägt (Zeitmessung im Test-Browser, nicht MK7); Mikro-Wege laufen über den gemeinsamen Abgriff |
| MK7-15 | ✓ ECO: Worklet −18,1 dBFS, ECO −∞ dBFS mit LCD-Hinweis, keine Konsolenfehler |
| MK7-16 | ✓ Vokal-Quelle F1/F2 für C2/C3 × a e i o u: größte Abweichung 0,5 % (≤ 7); `tr.mkIn` Speichern → Laden deep-equal |

Regression auf dieser Datei: Rauchtest ohne Fehler (`dirigent-test/v3-mk7-smoke.png`); `v3-mk1-look.mjs` 88/88;
`v3-mk2-marke.mjs` alles PASS (Markenwörter 0, „MS 2000“ genau 1, keine neue Schrift/Bild-Daten, Worklet ASCII);
`v3-mk4-ui.mjs` 63/64 — MK4-12 schlägt genauso auf 4.12.0 fehl (Test erwartet eine ältere Liste);
`v3-mk3-ui.mjs` MK3-10: einziger Befund ist die neue LED-Leiste `ein` (16 × 44), die der alte Test als Trefferfläche zählt —
sie ist nur Anzeige (kein Tipp), der MK7-Test prüft sie richtig. Testanpassung beim Zusammenführen.

### Fach-Prüfung
- **FP-DSP ● (Haupt):** Extremwerte 20 s (Resonanz 127, FC-MOD 50 Hz voll, alle Pegel 127): 0 NaN/Inf, Spitze +3,4 dBFS
  (vorher 7,5 dBFS → weiches Knie eingebaut). 60 s Stille nach Vollaussteuerung: keine Denormal-Spitzen (Analyse wird bei
  Stille übersprungen). Bandtrennung zuerst nur 29 dB bei k±3 → Analyse-Güte von 7,5 auf 10 gehoben. Stufe 1 mit zwei
  Filtern 2. Ordnung dämpfte das Nachbarband nur 3,5 dB → ein Bandpass mit Q × 2 (8,1 dB). Pegel abgeglichen: Vokal
  −20 dBFS auf 4 Säge-Stimmen ≈ Synth-Pegel (−15 dBFS). Koeffizienten je 16-Sample-Block, Glättung aller Sprünge.
- **FP-IPHONE (Zweit-Blick):** keine neuen Dauer-Timer; Bandansicht malt nur sichtbar (~30 Hz); Bandpegel-Meldungen nur
  solange die Ansicht offen ist; Mikrofon aus bei versteckter Seite; Touch-Ziele ≥ 44 (Ausnahme unten).
  Latenz ≈ 70–75 ms laut VS1-Messung → Hilfe und Hinweis „Kabel-Kopfhörer“; INIT hat DIREKT 0 und HPF-PEGEL ≤ 40.
- **FP-SICHER (Zweit-Blick):** Mikrofon nur nach Tipp, nie in der Claude-App, nichts wird aufgenommen oder gesendet
  (0 Netzaufrufe); ein gemeinsamer Abgriff, der letzte Nutzer stoppt die Spuren (`ended`); N7V-35 eingehalten
  (Quelle `t:<uid>` geprüft gegen UID_RE, `normMkIn` verwirft alles andere); Kreis-Schutz über alle Spuren, auch bei
  Laden/Undo (`mkInRoute` verbindet nie einen Kreis). B.6 Nr. 9: keine Markenwörter (Vokal-Tabelle heißt `VOW`, nicht
  `VOX`), „MS 2000“ genau einmal, keine Schrift/Bilder.

### Abweichungen von der Spec
- Analyse-Güte fest 10 (Spec nannte keinen Wert, 7,5 erreichte MK7-01 nicht).
- ~~Begrenzer Stufe 1 = ein Bandpass mit Q × 2 und Ausgleich 0,91~~ – ersetzt in MK7-fix (halbe Rate statt halber Ordnung, siehe unten).
- MK7-03 Folger gemessen als Abfall −6 → −26 dB (die Spitze am Anfang verfälscht den 0-dB-Bezug).
- MK7-04 Gate-Zeit mit langsamen Folgern und festem Säge-Träger gemessen (sonst überdeckt der Folger das Gate).
- MK7-16 F1/F2 über Vibrato-Hüllkurve (max-hold Vokal/roh), weil LPC auf 4 Formanten unzuverlässig war; dafür Vokal-Quelle
  als Kaskade + Abstrahlung, Bandbreiten 70/80/120/150 Hz.
- QUELLE 1/2 bei Synth-Welle „Eingang“ an OSZ-1-Reglern 4/5; im Vocoder an MIXER / EING. 1 mit SHIFT.
- HALTEN = Array `voc.hold`; FOLGER 127 hält ebenfalls. INST-PEGEL folgt der W-19-Kurve. DIREKT/HPF in der Mitte −3 dB.
- Vocoder-Ausgang mit weichem Knie. ECO-Vocoder startet keine Stimme (statt leiser Stimme).
- Bandsäulen in P2/P3 schmaler als 44 px (16 Säulen bei der Spec-Breite, keine Überlappung); gegriffen wird über die ganze
  Säulenhöhe (≥ 44 hoch), der Wert folgt dem senkrechten Ziehen.
- `getSettings().echoCancellation === false` nur am Gerät prüfbar (die Fake-Kamera liefert keine Settings); getestet ist die Anfrage.

### Bekannte Lücken
- **MK7-12** Leerlauf-Kosten des verbundenen, stillen Eingangs liegen im Rauschen um die Grenze 0,16 × VA (0,07–0,17).
- **iPhone-Punkte** (Pages, Kopfhörer) offen: 1) STIMME → Vocoder, QUELLE 2 = Mikrofon, sprechen + Akkord; 2) TIMBRE/HALTEN,
  Mikrofon aus, weiterspielen; 3) gehaltenen Sound in der Claude-App spielen; 4) `ST.latMs` je Weg (Lautsprecher, Kabel,
  Bluetooth) ablesen und hier eintragen.
- **Geräte-Abgleich** offen: Vocoder mit FORMANT +1/−1, FOLGER Halten, HPF-PEGEL hoch (Zischlaute).
- Bluetooth-Hinweis „Kabel-Kopfhörer empfohlen“ kommt über den bestehenden Mikrofon-Weg (`bt`); der Vocoder nennt ihn in
  Hinweiszeile und Hilfe immer.
- Vocoder-Werksklänge folgen mit MK8 (hier nur INIT „Vocoder“).
- Alte Tests MK3-10 (LED-Leiste) und MK4-12 (Liste) beim Zusammenführen anpassen; VS2 „Stimme rechtzeitig geplant“ ist
  im Test-Browser auch auf 4.12.0 wackelig.

### Hinweise zum Zusammenführen (berührte Stellen)
- Worklet: MKW-Tabelle (VR, vocPos/vocQ/vocTau/vocThDb/vocGate/vocHpf/vocDir/vocChl/vocK, holdQ/holdA, VOW/vowB/vowG/vowOQ),
  `MkVoice` (vm), `MkTim.voice`/`block` (Eingang-Welle, Träger-Stimmen), neue Klasse `MkVoc` vor `MkCore`, `MkCore`
  (inE1/inE2/io/vc, load/set mit voc.*, inSet, vocHot, vmOn, block), `AnalogCore.process` (inputs, vocHot, mkLv,
  mkHoldGet, mkLed), Knoten `numberOfInputs 1`, `channelCount 2`.
- Hauptteil: `SynthHost.track` (Eingänge, mkLv, mkHoldGet), `buildChain` (`N.cut`, `N.dryCut`), neuer Block vor
  „sq-mk-src: evaluated on first need“ (normMkIn … mkInSet, MICTAP), `stStart`/`stGot`/`stRelease` (gemeinsamer Abgriff),
  `normTrack` (mkIn), Undo-Art `mkin`, `syncEngine`/`cpuTick` → `mkInRoute`, `mkEco`/`spawnVoice`/`ecoMsg`, `initSound`,
  `mkRange`/`mkSetP` (voc.hold), `mkRender` (inputs, at), Probe-Fall `voc`, Hilfe-Zeilen, Test-API, NO_SYNC.
- `sq-mk-src`: `mkVowel`, KN-Vocoder-Regler, SEC1 [4]/[5], SEC2 [5], SPIELV, srcPop/holdToggle/chReset/paintEin,
  16-BÄNDER-Ansicht, render/timbreKey/numKey/knobGesture, CSS.
- Keine Datenbank-Änderung.

---

## MK7-fix — fünf Prüf-Befunde behoben · App bleibt 4.15.0 · Format 5 · keine Server-Änderung

Ausgangsstand: `mk-br-MK7/index.html` 4.15.0 (2 927 671 B). Neuer Stand 2 931 675 B, Schnappschuss
`synq-snapshots/MK7-fix.html`. Nur MK7-Code berührt (MkVoc im Worklet, `mkInRoute`/`mkInLink`, `setMute`, `paintEin`).
Nichts committet, kein Supabase-Aufruf.

### 1. Stumme Vocoder-Spur ließ DIREKT und HPF (und das Mikrofon) in den Master
- **Ursache:** `setMute` beendet nur Clip-Stimmen; DIREKT und HPF brauchen keine Note.
- **Fix:** Der Eingang einer AM-Spur läuft jetzt Merger → **Tor-Gain** → Knoten. `mkInRoute` setzt das Tor auf 0, solange
  die Spur stumm ist (20-ms-Rampe wie `mkDryCut`), `setMute` ruft `mkInRoute` sofort. Eine stumme AM-Spur hört also keinen
  Eingang mehr: kein DIREKT, kein HPF, keine Analyse. Live-Tasten auf einer stummen Spur klingen wie bisher (ohne Eingang).
- **Belege** (Chromium, Live-Kontext): `v3-qa7-mute2.mjs` 2/2 (stumm −300 dB statt −46,7 / −30,2 dBFS);
  `v3-repro-mk7-mutevoc.mjs`: DIREKT 127 stumm −300 dB, HPF stumm −300 dB, Mikrofon (Fake) stumm −300 dB, nach dem
  Entstummen wieder −46,8 dBFS; `v3-repro-mk7-mutevoc-clip.mjs` (Clip-Fall, echter M-Knopf): −29,8 → −300 dB.
- `v3-qa7-mute.mjs` stummte für seine Messung die Vocoder-Spur selbst (hing am Fehler). Ersatz `v3-mk7fix-mute-src.mjs`
  (Träger still statt stumm): „Stummschalten der Quelle schweigt den Eingang“ besteht (−24,6 → −168,5 dB).

### 2. 16 BÄNDER zeigte keine Live-Bandpegel
- **Ursache:** `paintEin()` brach ab, weil die Ansicht keine E1/E2-LEDs hat; `bandsLive()` wurde nie erreicht.
- **Fix:** `bandsLive(m.b)` steht vor der LED-Prüfung.
- **Belege:** `v3-qa7-bands.mjs` 2/2; `v3-mk7fix-bands6.mjs` 6/6 (P1, P2, P3, L1, L2, W: 561–726 grüne Pixel);
  `v3-mk7fix-bandsrate.mjs`: Zeichnen 28 Hz (≤ 30), rAF 58–60 fps. Bild `dirigent-test/qa-mk7/bands-live-fix-P1.png`.

### 3./5. Begrenzer Stufe 1 änderte den Vocoder-Pegel um −4,5 … +21,5 dB (MK7-11 M-PEGEL ± 1 dB, B.4)
- **Ursache:** Ein Bandpass 2. Ordnung mit fester Ausgleichszahl 0,91 trifft die Bandenergie nur bei Rauschen; Teiltöne
  zwischen den Bandmitten gehen viel stärker durch. Kein fester Ausgleich kann das lösen.
- **Fix (Abweichung von der Spec-Formulierung „halbiert die Filterordnung“, Ziel von B.4 erfüllt):** Stufe 1 rechnet
  **dieselben Bänder 4. Ordnung bei halber Abtastrate** (halbe Filterarbeit). Halbband-Filter: polyphasiges IIR
  (2 + 2 Allpass-Koeffizienten, elliptisch, Übergang 0,06 fs, Alias ≤ −57 dB) für E2 und Träger hinunter, für L/R hinauf.
  Bandmitten bei halber Rate enden bei 0,21 fs (nur FORMANT/CUTOFF ganz oben betroffen). Die Dämpfung je Band wird so
  angepasst, dass die Bandbreite in Hz der vollen Rate entspricht (bilineare Verengung). Der Weg mit voller Rate bekommt
  3 Samples Verzögerung (= Laufzeit der Halbband-Kette), damit die Blende keine Phasenlöcher hat. Blende jetzt je Sample
  (vorher 10-%-Stufen je Block), 60 ms Vorlauf, 30 ms Blende; das Abschalten der alten Bank erst nach dem letzten Blendblock.
  Halbraten-Koeffizienten nur aus Tabellen (keine `Math.tan`/`pow` je Block) und nur, solange Stufe 1 läuft.
- **Belege:** `v3-qa-mk7-lim2.mjs` 0 von 35 außerhalb ± 1 dB (größter Sprung −0,04 dB; vorher 17 von 35, bis +21,5 dB);
  `v3-qa-mk7-lim.mjs` 8/8 ok; `v3-qa7-pegel.mjs` (App-`mkRender`) max |Δ| 0,00 dB; `v3-rep-mk7-limchr.mjs` alle Fälle
  ≤ 0,03 dB; live `v3-qa7-lim-live.mjs` (cpuInject) −0,02 dB statt −2,86 dB; `v3-mk7fix-lvl.mjs` (24 Fälle: Rauschen/Säge,
  RESO 0/64/127, Halten, Vokale) schlechtester −0,30 dB; `v3-mk7fix-lvl2.mjs` (FORMANT ± 2 + CUTOFF ± 63, FC-MOD LFO,
  Rauschen, 48 und 44,1 kHz) M-PEGEL ≤ 0,02 dB, M-KLICK beim Umschalten = Klang der Stufe 1 selbst.
  Builder-Suite `v3-mk7-voc.mjs` 37/37 (Stufe 1 Nachbarband jetzt 13,1 dB statt 8,1; M-PEGEL Rauschen −0,03 dB).
- **CPU** (`v3-mk7-cpu.mjs`, Median aus 5): Vocoder-Spur 1,94 × VA-Stimme (≤ 2,4, unverändert), Stufe 1 1,48 × (vorher
  1,55 ×), unbenutzter Eingang −0,02 × (≤ 0,16).
- **Info:** `v3-mk7fix-lvl2.mjs` Fall „FC-MOD LFO 63, RESO 127“ bei 48 kHz: M-EINBRUCH beim Zurückschalten −4,03 dB,
  der Klang ohne Umschalten selbst −3,47 dB (LFO-Schwankung); Grenze „Klang − 0,5 dB“ um 0,06 dB verfehlt. Der alte Stand
  hatte hier −7,24 dB.

### 4. Gehaltener Formant verstummte bei SCHWELLE ≥ 1 (MK7-03)
- **Ursache:** Die Synthese rechnete `env × Gate`; ohne oder mit leiser Quelle schloss das Gate den gehaltenen Klang.
- **Fix:** Das Gate wirkt auf den Modulator (W-39). Bei HALTEN, FOLGER 127 oder gespeichertem `hold` blendet `hw` die
  Synthese in 5 ms auf „offen“; ohne Halten bleibt alles bitgleich (`hw` = 0). Die 16-BÄNDER-Pegel folgen demselben Wert.
- **Belege:** `v3-qa-mk7-hold.mjs`: gespeichertes `hold` ohne Eingang bei SCHWELLE 0/1/20/40/64/100 je +1,9 dBFS
  (vorher −240 ab SCHWELLE 1); TIMBRE/HALTEN live bei SCHWELLE 30/64 bleibt −19,7 dBFS; FOLGER 127 mit −70-dBFS-Rauschboden
  bleibt −19,7 dBFS. `v3-rep-mk7-holdgate.mjs` alle −5,2 dBFS. Chromium `v3-qa-mk7-holdbr.mjs`: Render SCHWELLE 0…64 je
  −1,8 dBFS, live Spitze −4,7 dBFS bei SCHWELLE 0 und 30; `v3-rep-mk7-holdgate-br.mjs` alle −7,7 dB.

### Regression
- `v3-mk7-voc.mjs` 37/37 (MK7-12 bitgleich gegen G-MK34 für AM Säge, Dual+FX, Split, VA), `v3-mk7-inputs.mjs` 24/24,
  `v3-mk7-ui.mjs` 102/102, `v3-qa7-bit.mjs` 7/7, `v3-qa7-live` 11/11, `v3-qa7-mic` 6/6, `v3-qa7-amp` 5/5, `v3-qa7-w30`,
  `v3-qa-mk7reg-sends.mjs` (Stumm/Entstumm wie vorher). Smoke: keine Fehler (`dirigent-test/v3-mk7fix-smoke.png`).
- Der Vocoder-Ausgang im normalen Betrieb ist um 3 Samples (62 µs) später als vor dem Fix (Verzögerungs-Ausgleich); sonst
  gleich. Synth-Programme bitgleich.
- Wackelig auch auf dem alten Stand: Leistungs-Probe „Vocoder“ in `v3-mk7-ui.mjs` meldet im Test-Browser gelegentlich
  `frames_ok: false` (alt 1 von 4, neu 1 von 4 Läufen). `v3-qa7-pegel.mjs` lieferte einmal einen stillen Render (+288 dB);
  in 3 Wiederholungen und 36 weiteren Renders nicht wieder aufgetreten.
- Unverändert offen (QA-Skripte, schon vor dem Fix gleich, nicht Teil dieses Auftrags): `v3-qa7-dsp1/sep` k±3 = 29,9–30,0 dB,
  `v3-qa7-dsp2` FOLGER 0 / FOLGER 127 / K-PEGEL 0 mit strengerer Messung, `v3-qa7-dsp4` Stufe-1-M-KLICK +6,3 dB (alt +6,4),
  `v3-qa7-vowel` F1/F2 9,3 %.

### Budget
- **MK7-14 Budget überschritten:** 2 931 675 B = **+56 933 B** gegen G-MK34 (≤ +52 KB = 53 248 B; vor dem Fix +52 929 B).
  Die +4,0 KB sind Halbband-Weg, Band-Hilfsfunktion und das Tor für stumme Spuren. Kommentare sind schon gekürzt; weiteres
  Sparen ginge nur über Minifizieren. Entscheidung beim Orchestrator (Datei-Grenze 5,0 MB weit entfernt).

### Für den Hauptstrang / Zusammenführen
- Berührt: Worklet `MK_VXF`-Zeile, neue Helfer vor `class MkVoc` (`MK_VHB`, `MK_VH`, `MK_VD`, `mkVgH`, `mkAp`, `mkHbDown`,
  `mkHbUp`, `mkB4`), `MkVoc` (Konstruktor, `settle`, `block`, `bands`), MKW ohne `vocC2`; Hauptteil `mkInRoute`/`mkInLink`/
  neues `mkInMute`, `setMute`; `sq-mk-src` `paintEin`.
- Nichts aus MK4 oder früher geändert.
- iPhone offen (Pages): Stufe 1 am Gerät hören (Vocoder-Akkord, viele Spuren bis LIM 1), Stummschalten einer Vocoder-Spur
  mit Mikrofon.


## G-MK567-merge — Zusammenführung · App 4.15.0 (`APP_CODE` 4 015 000) · Format bleibt 5

Echter 3-Wege-Merge (`git merge-file`, Basis `mk-base-C.html` = 4.12.0 = G-MK34-merge) der Zweige **MK5** (Step-Arpeggiator, 4.13.0),
**MK6** (Mod-Sequenzer 3×16 + „Bewegung aufnehmen“, 4.14.0) und **MK7** (Vocoder 16 Bänder + Eingänge E1/E2, 4.15.0) in die
Hauptlinie `mk-wt/index.html`, in dieser Reihenfolge. Sicherung vorher: `mk-wt/index.html.vor-merge-G-MK567-merge.html`.
VERSION = höchste aller Seiten = **4.15.0** (`APP_CODE` 4 015 000 ≤ Wächter 4 021 000). Kein Supabase-Aufruf, nichts committet.
Größe 3 017 704 B (+142 962 B gegen 4.12.0; Summe der Zweige +142 450 B, Rest = zusammengelegte Stellen).

### Konflikte und Auflösung
- **MK5:** ohne Konflikt.
- **MK6 (14 Stellen):**
  1. KN-Regler (Bedienfeld): ARP A/B-Regler (MK5) **und** SEQ-Regler (MK6) beide eingetragen.
  2. `SEC2`: ARP A/B aktiv mit ihren Reglern (MK5) und SEQ aktiv mit Ebene 1 + SHIFT-Ebene (MK6) in derselben Liste.
  3. Matrix-Zeile: MK6-Zeile (● AUFN., EB2, ●, SCHRITTE ▸) + MK5-Titel `arpTxt` für ARP A/B.
  4./5. Nummerntasten: `SHIFT + 5` wirkt (MK6, `mshd` ab k > 4) und die Schritt-Tasten-Anzeige des Arp (MK5: SCHRITTE · LÄNGE, ARP-LED) bleibt.
  6. `wiaPos2` (Punkt „geändert“): STIMMUNG/FX + SEQ (10, MK6) + ARP A/B (7/8, MK5).
  7. Wertliste: `stp`-Listen (MK5: OKTAVEN, LÄNGE) und `d.px` (MK6: ZIEL 31 Einträge in 176 px) zusammen.
  8. EDIT-WAHL-2-Liste: Unterzeile für ARP A/B (`arpTxt`) und SEQ (`seqTxt`).
  9./10. Leistungs-Probe: Fälle „+Arp“ und „+Seq“ beide (Fortschritt durch die Fallzahl).
  11. `panelInfo` (sq, rec, steps **und** arp), `arpFrame` bleibt; `window.MKUI` = Vereinigung beider Exporte.
  12. Worklet Key Sync „Timbre“: MK5 hatte den Rücksetzer in `keyReset()` ausgelagert (beim Arp nur über KEYS 9), MK6 setzte die
      Seq-Position im alten Block zurück. Gelöst: MK5-Zeile bleibt, der MK6-Rücksetzer (`sq.reset()`/`sq.init()`) sitzt jetzt in
      `keyReset()` — damit startet die Sequenz auch bei laufendem Arp mit jedem neuen Akkord (KEYS 9) neu (vorher wäre der Arp-Fall
      verloren gegangen). Nachweis `dirigent-test/gmk567-keysync.mjs` 4/4.
  13. VERSION (vorläufig 4.14.0, s. MK7). 14. Hilfe: Arp-Zeilen (MK5) und SEQ/AUFN.-Zeilen (MK6) beide.
- **MK7 (38 Stellen):**
  1. `ARPC` (MK5) und `mkVowel` (MK7, `/*MKV{*/`-Block) beide. 2. Listen `ares/atyp/atgt` und `hpg` beide. 3. KN: Arp + Seq + Vocoder-Regler.
  4. `SEC2` PATCH 1–4: MK7 hängt als Index 5 die Vocoder-Kanal-Zeilen an — MK6 nutzt Index 5 als SHIFT-Ebene. Gelöst in `knobs()`
     und der Matrix-Zeile: Vocoder → Index 5 = Kanäle (wie MK7); sonst gilt Index 5 als SHIFT-Ebene **nur** bei SEQ (Stellung 11).
     Ohne diese Wache hätte SHIFT bei PATCH 1–4 im Synth die Vocoder-Kanäle gezeigt.
  5. SPIEL/SPIELV beide. 6. Kurznamen: MK7-Liste + AUFL./LAUF (MK6). 7. `knobs()`: Vocoder-Wege (SPIELV, Kanäle, SEQ im Vocoder leer,
     EDIT-WAHL-1-Vocoder-Zeilen, Eingang-Welle) + MK6 (SHIFT-Ebene SEQ, SEQUENZ-Wahl `P.sq`) + Delay-Schalter.
  8. LCD: `seqLcd` (MK6) vor der MK7-Zeile mit QUELLE (`d.src`). 9. `setWahl`: Vocoder-Kanäle, „im Vocoder kein Mod-Sequenzer“, FX, ARP A/B.
  10.–12. Ansichten SCHRITTE (MK6) und 16 BÄNDER (MK7) nebeneinander (Bauen, Zeichnen, Schließen).
  13. Matrix-Zeile: MK7-Aufbau (Namen über `knobs()`, grüne Vocoder-Namen, 16 BÄNDER ▸) + MK6 (EB2 nur bei SEQ, ● AUFN., ●, SCHRITTE ▸
      — im Vocoder nicht) + MK5-Titel ARP A/B.
  14./15. SHIFT-Werkzeuge: Vocoder PEG/PAN INIT (MK7, ab k > 2 dunkel), sonst T-KOPIE … SEQ ▸ (MK6, ab k > 4 dunkel); Arp-Anzeige bleibt.
  16. ORIG-Vergleich: Pfade `arp.*` (MK5) und `voc.*` (MK7). 17. `wiaPos2`: Vocoder-Kanäle (MK7) + SEQ (nicht im Vocoder) + ARP A/B.
  18. Tipp auf die Matrix-Zeile: Vocoder PATCH → 16 BÄNDER (MK7), SEQ → SCHRITTE nur ohne Vocoder (MK6).
  19. Wertliste: QUELLE-Hinweis (MK7) + `stp`/`px` (MK5/MK6). 20. Wellenliste: ZIEL-Spannen (MK6) + „E1/E2 … statt eines Oszillators“ (MK7).
  21. `leave()`: `einOn(false)` (MK7) + `P.rec = null` (MK6).
  22.–24. Probe: „+Seq“-Aufbau (MK6) und „Vocoder“-Aufbau mit Vokal-Quelle (MK7); Fälle Kern, +FX, +Arp, +Seq, Vocoder (5, wie Nachtrag 3 B.4).
  25. CSS beider Zweige. 26. `panelInfo` (MK5/MK6) + `mkVowel`-Export (MK7).
  27. Worklet-Tabellen: SEQ (`SRES`, `SQT`, `sqR`) und Vocoder (`VR`, `voc*`, `VOW`, `hold*`) beide. 28. `MkVoice`: Seq-Felder + `vm/vaA/vaB`.
  29. Block-Schleife: `sqPreAll` (MK6-fix) und `VC` (MK7) beide. 30. Patches: Vocoder-Stimme ohne Patches (MK7), Seq-Patchwerte (MK6).
  31. Stimme: Welle 7 = Eingang (MK7, ohne Säge-Ersatz) + Seq-Mixer-Werte (MK6) + `vocAudio` (MK7).
  32. Nachrichten `mkRec`/`mkSong` (MK6) + `mkHoldGet`/`mkLed` (MK7). 33. `process`: `vocHot()` (MK7) + `idle(CR, f0 + off)` (MK6-fix Song-Schlag).
  34. `mkScope`: `seq` (MK6) + `vocBands` (MK7) und die Pegel-Meldung `mkLv`. 35. Hauptfaden: `mkRecDone` + `mkLv`/`mkHold`.
  36. VERSION 4.15.0. 37. ECO: T2-Noten stumm (MK5) und Vocoder-Programm stumm (MK7). 38. Test-API: Arp (MK5) + Eingänge/Vokal (MK7).

### Abnahme (Chromium 1243, der Pfad 1194 fehlt hier; Ausgaben `scratchpad/gmk567/out/`)
- Smoke ohne Fehler (`dirigent-test/g-mk567-smoke.png`); keine Konfliktmarken; Worklet-AM-Teil ASCII; `v3-mk2-marke.mjs` alles PASS.
- MK5: `v3-mk5-arp.mjs` 77/79 im ersten Lauf (MK5-01 „Trigger Range 2“ einmalig, im Wiederholungslauf PASS; MK5-02 „live zweimal“ bekannt
  wackelig — 4 Wiederholungen: Merge 4/4 PASS, MK5-Zweig 1/4 PASS), `v3-mk5-arp-audio.mjs` alle, `v3-mk5-fix.mjs` 17/17, `v3-mk5-ui.mjs` 80/80,
  `gmk567-mk5-fp.mjs` (Kopie von `v3-mk5-fp.mjs`, Pfad mk-wt) 10/10, `gmk567-mk5-perf.mjs` bestanden (ein Lauf mit einem 57-ms-longtask der
  geteilten Maschine, Wiederholung 0).
- MK6: `v3-mk6-seq.mjs` 36/36 (MK6-10 bitgleich gegen 4.12.0), `v3-mk6-fp.mjs` alle, `v3-mk6-cpu.mjs` alle (0,21 / 0,14 / 0,39 × VA),
  `v3-mk6-ui.mjs` 28/28, `gmk567-mk6-pe1.mjs` (Kopie, Pfad mk-wt) bestanden.
- MK7: `v3-mk7-voc.mjs` 37/37 (MK7-12 bitgleich gegen 4.12.0), `v3-mk7-inputs.mjs` 24/24, `v3-mk7-ui.mjs` 101/102 — die Probe „Vocoder“
  meldete einmal `frames_ok: false` (bekannt wackelig, s. MK7-fix); 3 Wiederholungen Merge und Zweig je 3/3 PASS.
  `v3-mk7-cpu.mjs` MK7-11 (Vocoder − Synth ≤ 2,4 × VA): Merge 2,85 / 2,63 ×, **MK7-Zweig im selben Lauf ebenso 2,82 ×** — kein Merge-Effekt.
- Hauptlinie: `v3-mk4-fx.mjs` alles, `gmk34-merge-fx.mjs` alles, `gmk34-merge-nt.mjs` alles, `v3-mk1-look.mjs` 88/88,
  `gmk34-mk4-ui.mjs` 63/64 (MK4-12 erwartet ARP A/B noch dunkel — seit MK5 aktiv, erwartet), `v3-mk3-ui.mjs` 36/37 (MK3-10 nur die
  neue Eingangs-LED-Leiste `ein` 16 × 44, wie im MK7-Changelog beschrieben).
- Neu für den Merge: `gmk567-keysync.mjs` 4/4 (Node: KEYS 9 des Arp setzt die Seq-Position bei KEY SYNC Timbre zurück, ohne KEYS 9 und bei
  KEY SYNC aus nicht), `gmk567-cross.mjs` 20/20 (Chromium: PATCH + SHIFT im Synth ohne Kanäle, SEQ-Ebenen, Vocoder-Kanäle mit/ohne SHIFT,
  SEQ im Vocoder leer und ohne SCHRITTE, ARP A im Vocoder, SPIELV, Probe mit 5 Fällen, Hilfe-Zeilen, Arp + Seq + Vocoder ohne Konsolenfehler).

### Offen
- `v3-mk7-cpu.mjs` MK7-11 liegt schon im MK7-Zweig über der Grenze 2,4 × (2,6–2,9 × auf dieser Maschine; Vocoder-Spur gesamt 5,7–5,9 × VA,
  B.4-Grenze ≤ 8 eingehalten) — gehört zum MK7-Paket, nicht zum Merge.
- `gmk34-mk4-ui.mjs` MK4-12 und `v3-mk3-ui.mjs` MK3-10 erwarten ältere Zustände (Tests anpassen).
- MK5-02 „live zweimal“ bleibt eine wackelige Live-Zeitmessung (auch im Zweig).

### Datenbank / Am Server offen
- Nichts (Format 5, `APP_CODE` 4 015 000 ≤ Wächter 4 021 000).

## G-MK567-merge-fix — zwei Befunde nach der Zusammenführung · App bleibt 4.15.0 · Format 5 · keine Server-Änderung

1. **Mod-Sequenzer im Vocoder (MK6 × MK7, major).** Ein gespeicherter SEQ lief im Vocoder-Modus weiter (z. B. TONHÖHE 0/+12 →
   Oktavsprünge im Träger), obwohl das Bedienfeld „nicht im Vocoder“ zeigt. Jetzt:
   - Worklet `sqPrep`: `on = (S.on ≥ .5 || rec) && mode ≠ 3` – im Vocoder hat der SEQ keine Wirkung (Nachtrag 3 MK6: außerhalb des Umfangs);
     `recMsg` nimmt im Vocoder keine AUFN. an.
   - `MkCore.sqMode()`: Synth ↔ Vocoder (Regler und Laden) setzt beide Timbres auf neu vorbereiten; eine laufende AUFN. endet; der
     Wechsel blendet in 5 ms (die vorhandene L3-Blende), beim Zurück auf Synth wirkt der gespeicherte SEQ wieder.
   - Bedienfeld: SYNTH/VOC. → Vocoder bricht eine laufende AUFN. ab („abgebrochen (Vocoder hat keinen Mod-Sequenzer)“); die
     EDIT-WAHL-2-Liste zeigt Zeile 11 im Vocoder dunkel „SEQ – nicht im Vocoder“ statt „an · SEQ 1 → …“.
   - Probe: `vg567-seqvoc.mjs` Modus 3 TONHÖHE / AMP PEGEL / MIXER OSZ 1: max |Δ| 0 (vorher 0,28); Modus 0 unverändert.
     `vg567-seqvoc2.mjs`: `mkScope(2).seq[0]` = `{on: 0, vals: [0,0,0]}` bei gehaltener Taste. `vg567-seqvoc3.mjs`: Liste,
     Vocoder → Synth (SEQ wirkt wieder, Werte 12/0) → Vocoder (wieder aus). `v3-mk6-seq.mjs`: 0 FAIL.
2. **MK7-11 Vocoder-CPU (major).** Die 16 Bänder liefen je Band und Block über `mkB4` + Pufferschleife. Jetzt im Normalfall
   (4. Ordnung, kein Umschalten) Analyse-Band + Hüllkurvenfolger in einer Schleife (feste Koeffizienten) und Synthese-Band
   (Koeffizienten-Rampe) + Kanal-Pegel/Pan direkt in den Ausgang – dieselbe Rechnung, kein Zwischenpuffer.
   - Bitgleich: `vg567-vocbit.mjs` (Vokal-Modulator, FC-MOD LFO, K-PAN, Begrenzer-Umschalten 1 → 0) gegen `mk-br-MK7`: max |Δ| 0.
   - `v3-mk7-cpu.mjs` (zweimal): **PASS MK7-11 1,69 × und 1,62 × VA-Stimme** (≤ 2,4; vorher 2,60 / 2,69); Vocoder-Spur gesamt
     4,71–4,73 × VA (B.4 ≤ 8); MK7-12 PASS. `v3-mk7-voc.mjs`: alles PASS (inkl. MK7-12 bitgleich gegen G-MK34-merge).
   - Info: der Begrenzer Stufe 1 (2. Ordnung, unverändert) misst jetzt 1,95 × und ist damit nicht mehr billiger als die volle Bank.
3. Smoke-Test ohne Fehler. Schnappschuss `synq-snapshots/G-MK567-merge-fix.html`.


# CHANGES – MS 2000, Paket MK-P (Zweig-Kopie `mk-br-MKP`)

## MK-P — Bedienfeld wie der MS2000: Platte, Gesamtansicht, Zoom-Halte, Lauflicht · App **4.16.0** (`APP_CODE` 4 016 000) · Format bleibt 5

**Vorgänger-Stand** für alle „bitgleich / unverändert“-Abnahmen und das Budget: **4.15.0** (MK0–MK7 zusammengeführt,
3 017 704 B, Kopie `dirigent-test/v3-mkp-vorg.html`). Gebaut nach Nachtrag 3 Rev. 3 („reiner MS 2000“, kein microKORG-
Bedienfeld, keine RADIAS-Teile), Teil MK-P, B.3, B.6, B.7, EN3-05/13/14/20, H-16/H-17/H-18 (Vorgaben gebaut, nicht gewartet).
MK8 entsteht parallel in `mk-br-MK8`; der Orchestrator führt zusammen und setzt die VERSION-Zeile. Kein Supabase-Aufruf
(nicht nötig: Format 5, App 4 016 000 ≤ `max_app` 4 021 000). Nichts committet.

Dieser Lauf hat einen unterbrochenen Bau-Versuch übernommen (Platte, Ansichten, Gesten und Tests standen, Abnahme,
Changelog und Snapshot fehlten), ihn geprüft, die Befunde unten behoben und die ganze Abnahme neu gefahren.

### Gebaut

1. **Die Platte** (`sq-mk-src`, Abschnitt „MK-P“): Vorderseite nach HB-MS S. 5 als Daten (Lage-Tabelle `SEC`, `EL_`, `HALTE`
   in % der Platte, Seitenverhältnis 1,95 : 1, 16-Spalten-Raster xₙ = 14,1 + (n − 1)·5,52), gebaut als DOM + CSS + **ein**
   SVG für die gedruckten Linien und **ein** gemeinsames Skalen-Symbol (`<use>`), ohne Bild-Daten, ohne `@font-face`, ohne
   WebGL (EN3-13). Hell blau-silbernes gebürstetes Metall (nur Verläufe), dunkler Druck, inverse weiße Vocoder-Namen auf
   Schwarz genau an den Tabellenstellen, schwarze Kappen mit weißem Zeiger, Mittelmarke nur an EG 1 INT / KBD TRACK /
   SEMITONE / TUNE / PAN, AUDIO IN 1 ohne Skala, VOLUME 0…10, hellgraue Tasten mit LED-Fenster, runde rote LEDs (OCTAVE
   grün/rot/rot blinkend), Anzeige 2 × 16 dunkel auf gelbgrün aus `--mkp-lcd-fg/-bg`. Namensfeld = nur `MK_LABEL`.
   Englischer Aufdruck wie am Gerät (H-16), VOX WAVE → STIMMWELLE, DWGS → SPEICHERWELLE.
2. **Bindung aller Elemente** (Synth-Spalte und Vocoder-Spalte, „grau“ mit Grund in der LCD-Zeile), 16 Regler mit
   SEQ EDIT (Regler n = Schritt n der gewählten Sequenz, Kappen zeigen Schrittwerte, ORIGINAL VALUE am gespeicherten
   Schrittwert) und CH PARAM (Kanal-Pegel/-Pan im Vocoder), MOD/DELAY für Regler 11/12, PATCH SELECT/SOURCE/DESTINATION,
   TIMBRE SELECT nur T1 ↔ T2 (Single gesperrt mit Grund), KBD TRACK │ E.F.SENSE 127 = HOLD.
3. **Anzeige mit Modi** SPIEL („A01:Name“/„---:Name“, Modus, ♩=Tempo, beim Drehen 1 s Name + Geräte-Wert), **EDIT**
   (Seitenplan 01–26 Synth bzw. 01–20 Vocoder, Schritt-Taste n = Seite, PAGE −/+, CURSOR, −/NO +/YES je eine Stufe mit
   Klemmen, Seiten-Sprung, Tipp auf die Anzeige = Liste bzw. Zusatz-Ansicht ▸), **GLOBAL** (1A/1B Eingänge, 1C Oktave,
   1D Seiten-Sprung), **COMPARE** (EDIT halten + EXIT), UTILITY-Werkzeuge (ersetzen die SHIFT-Werkzeuge).
4. **Fester Rahmen** (`.mkfr`, `contain: strict`, `overflow: hidden`): Gesamtansicht (quer ganze Platte, hochkant Hälften),
   13 Halte im Signalfluss, Tipp-Zoom 250 ms (nur `transform`, `prefers-reduced-motion` ohne Animation), ◀ ▶, Wischen mit
   Federn an den Enden, Karte (Canvas 2D einmal je Format, Rechteck per `transform`; Tipp = Gesamtansicht, hochkant
   Kartenhälfte = Hälfte). Treffer = nächstes aktives Element über ein beim Aufbau gerechnetes Raster (Radius 1,8 %),
   `setPointerCapture`, zweiter Finger auf demselben Element ignoriert, Fein ×¼ / ×1⁄16 / ruhender zweiter Finger.
   Quer: das Blatt über den ganzen Bildschirm mit **einer 44-px-Kopfzeile** (✕ ↶ ↷ ▶/■ ‹ Name › Reiter ◀ Karte ▶ ⋯; H-17).
5. **Lauflicht** auf SELECT 1–16 aus dem Worklet-Takt (Scope mit Rest-Zeit und Folgeschritt), um die Ausgabe-Latenz
   versetzt, im rAF, nur Klassenwechsel; dasselbe in der Spiel-Ansicht (Hälften-Zeiger mit Punkt für die andere Hälfte).
6. **Spiel-Ansicht** (Reiter SPIEL): Band 1/Band 2 nach Rahmenbreite, Schritt-Tasten 16 / 8 / 2 × 8 / 2 × 4, Aufdruck nur
   der Zeile des Modus, Räder PITCH/MOD im Metallton; quer Tastatur und Räder im Rahmen.
7. **E1/E2-Pegel** (AUDIO IN 1/2) als Live-Wert `R.mkInTrim[uid]` (0 = stumm, 100 = 0 dB, 127 = +6 dB), je ein GainNode vor
   dem Worklet-Eingang (`mkInLink`, `mkTrimF`, `mkInTrimApply`), nicht gespeichert, kein Undo, bei 100 Faktor genau 1.
8. **Abbau** des alten Bedienfelds aus MK1–MK7 (Drehschalter, 7-Segment, Matrix, Holzwangen, Halb-Ansicht/`mkHalfWanted`,
   Zonen, Nummerntasten, SHIFT-Ebenen-Oberfläche, Edit-Sync-/Solo-/Step-Arp-Bedienwege nach H-18; die Engine-Funktionen
   bleiben). Hilfe-Zeilen neu geschrieben (19 MS-2000-Zeilen, eigene Sätze, Name aus `MK_LABEL`).
9. **Test-API** `mkPanel()` (Elemente mit Rechteck in %, Bild-Rechteck, Trefferzone, `bind`, Wert, LED; Halte, Sektionen,
   Modus/Seite/Cursor/LCD, Lauflicht, Spiel-Ansicht) und `mkView(o)` (`MKUI.view`), Leistungs-Probe Fall **„Bedienfeld“**.
10. **Naht zu MK8 (Teil G Nr. 18)**: eine Dispatch-Funktion `mkPanelProg(action, arg)` für BANK ▼ ▲, SELECT 1–16 (SPIEL),
    −/NO +/YES (SPIEL), WRITE, WERKSKLANG ZURÜCK, LCD-Zeile 1 und die Programm-LED. Sie nimmt **beide** Formen:
    `window.mkProg` als Funktion oder als das **Objekt von MK8** (`select(bank, slot)`, `step(dir)`, `bank(dir)`,
    `restore(bank, slot)`, `current()`; so in CHANGES-MK-MK8 beschrieben). Ohne `mkProg` gilt der alte Weg (eigene Sounds der
    Engine je Bank à 16, ‹ › bzw. `stepSound`, Sichern). Geprüft mit einem MK8-Attrappen-Objekt (`v3-mkp-prog.mjs`).
    Beim Zusammenführen ist damit nichts mehr zu verdrahten; nur die MK8-Wahl-Tests (‹ ›) auf die Platte umstellen.

### In diesem Lauf behoben (Prüfung des übernommenen Stands, Fach-Prüfung)

| # | Blick | Befund | Behebung |
|---|---|---|---|
| 1 | FP-TOUCH | Die AUDIO-IN-LEDs leuchteten nie: `paintEin` las `P.el.led` (gibt es nicht), die LEDs liegen in `PL.ui.led` | über `setLed('ain.l.k', on/red)`; an ab −50 dBFS, rot ab −1 dBFS (MK7-13-LED-Test über die Platte grün) |
| 2 | FP-IPHONE | Reiter GERÄT ↔ SPIEL baute das ganze Blatt neu (Long-Task, die Platte mit ≈ 1000 Knoten neu eingehängt) | `MKUI.tabFast`: nur der Inhalt des festen Rahmens wechselt; die Platte bleibt gelegt und wird per `transform` aus dem Rahmen geschoben, die Spiel-Leiste bleibt gebaut und wird nur gezeigt/versteckt. FX und alle anderen Wege bauen wie bisher neu |
| 3 | FP-IPHONE | `spielSteps` las `clientWidth` je Taste nach einem Schreiben (16 erzwungene Layouts) | eine Messung für alle Tasten (gleich breite Spalten), danach nur Schreiben |
| 4 | FP-IPHONE | Die Platte wurde mit einem Häppchen je Bild gebaut (fertig erst nach ≥ 20 Bildern) | ein Task je Häppchen ≤ 6 ms (`setTimeout`), Scheduler-Tick davor (EN3-14): fertig nach 74–107 ms (×1) |
| 5 | FP-IPHONE | `render()` fragte die Programm-LED 16 × je Bild ab (`ownList()` = Bibliothek filtern + sortieren) | einmal je Zeichnen (`litOf`) |
| 6 | FP-IPHONE | `wiaPaint` baute je Bild `SQMK.init()` neu, auch ohne ◎ | nur bei ◎ (und einmal beim Ausschalten) |
| 7 | FP-IPHONE | Platte und Anzeige ohne Eingrenzung (jede Textänderung prüfte das Layout der Platte) | `.mkplate`/Anzeige `contain: strict`, Regler `contain: size layout style` (Spec „Leistung“) |
| 8 | FP-TOUCH | Kappen L* bis 16,5 am Glanzpunkt (Grenze 15) | dunklerer Verlauf (`#2f3236 → #111214 → #050506`): L* ≤ 11,1 |
| 9 | FP-SICHER | Der Bildvergleich (liest die Handbuch-Zeichnung) lag in `dirigent-test/`, das `wip-push.sh` ins öffentliche Repo kopiert | verschoben nach `scratchpad/mkp-tools/mkp-bildvergleich.mjs` (privat, E.5 Nr. 5); Überlagerungsbild bleibt in `scratchpad/ms2000-panel/` |
| 10 | MK8-Naht | `mkPanelProg` erwartete `window.mkProg` als Funktion, MK8 liefert ein Objekt | beide Formen (Punkt 10 oben) |
| 11 | Test | Lauflicht-Test verglich mit einer eigenen, späteren Uhr-Ablesung (1-Bild-Versatz an Schrittgrenzen, 97,9–98,5 %) | die App legt die Audio-Zeit ihres Bildes ab (`P.runTA`), der Test vergleicht damit und meldet den Uhr-Abstand (≤ 11,6 ms < 1 Bild) und „über 1 Bild daneben“ (0) |

Fach-Prüfung: **FP-TOUCH ●** (Haupt-), **FP-IPHONE**, **FP-SICHER** (Zweit-Blick) selbst gefahren, 11 Befunde, alle behoben
bzw. (Größe, ×4-Leistung) unten begründet. Ein eigener Agent ohne Builder-Kontext hat nicht geprüft (J.1 Nr. 2) — das ist
offen für den Orchestrator.

### Abnahme MK-P-01 … MK-P-15 (Chromium 1243, Playwright, CDP-Touch; Skripte `dirigent-test/v3-mkp-*.mjs`)

| ID | Ergebnis |
|---|---|
| MK-P-01 Vorlage | ✓ 205 Prüfungen (`v3-mkp-funk.mjs`): jede ID da, größte Mitten-Abweichung 0,003 %, Paare/Viererreihen 4,30 (RANGE→TYPE 4,40 = Tabellenwert 69,4/73,8), 16-Spalten-Regel ± 0,3, IoU ≥ 0,9, 1,95 ± 0,01, Reihenfolge je Zeile, reine Skalierung (≤ 0,02 px) |
| MK-P-02 Bildvergleich | ✓ privat (`scratchpad/mkp-tools/mkp-bildvergleich.mjs`): alle 21 Sektionsrahmen je Kante ≤ 0,8 % / 1,2 % (größte 0,42 %), kein fehlender/zusätzlicher Rahmen; Überlagerung `scratchpad/ms2000-panel/mkp-overlay.png` (nur Scratchpad) |
| MK-P-03 Jedes Element wirkt | ✓ 297 Prüfungen: CDP-Geste je gebundenem Element im Halt und quer in der Gesamtansicht, Wert ändert sich, ein Undo, Undo deep-equal, Klangwerte hörbar (Spektral-Differenz; ARP GATE ohne laufenden Arp = −240 dB, nach B.6 Nr. 3 ausgenommen). E1/E2 64 → 127: **+20,6 dB** am Worklet-Eingang (`v3-mkp-trim.mjs`), 0 = stumm, 100 = Faktor 1. Ausnahmen: BANK/Programm-Tasten ohne MK8 (alter Weg), COMPARE nur mit geändertem Sound |
| MK-P-04 Vocoder | ✓ 20: inverse Namen = `voc.*`-Pfad, graue Elemente 0 dB Unterschied + Grund, CH PARAM Regler n = Band n, E.F.SENSE 127 = HOLD |
| MK-P-05 Seiten | ✓ 43: jeder `normMk`-Pfad erreichbar (123; `arp.tempo` nur gespeichert, EN3-10), Tasten 1–16 Synth/Vocoder = Seitenplan, PAGE, CURSOR klemmt, ±1, Seiten-Sprung, Anzeige-Tipp, EXIT, WRITE, COMPARE, UTILITY (= alte SHIFT-Werkzeuge), GLOBAL 1A/1B (MK7-Eingangs-Tests über GLOBAL 1B **24/24**, `v3-mkp-mk7inputs.mjs`), 1C ändert `tr.kbOct` |
| MK-P-06 Marke | ✓ Datei: microKORG/RADIAS/DWGS 0, „MS 2000“ genau 1 (`v3-mk2-marke.mjs` alles PASS); Bedienfeld-Text „MS 2000“ genau 1 (Namensfeld aus `MK_LABEL`), kein `<img>`/`data:image`/`@font-face`, Namensfeld App-Schrift 600, normal, unverzerrt |
| MK-P-07 Treffer und Platz | ✓ (`v3-mkp-platz.mjs`) P1, P2, P3, L1, L2, W, 428 × 926, 926 × 428: alle Zustände ohne Abschneiden, keine waagrechte Seite; z = Regel; Treffer-Prüfpunkte alle 4 px = nächstes Element (Abweichung ≤ 5 von 21 836 Punkten, Rundung der px-Rechtecke auf 0,01 an der 1,8-%-Grenze); quer 926 × 428 Regler-Zonen **41 px**, Tastenpaare **30 px**; außerhalb der Platte ≥ 44 × 44 |
| MK-P-08 Gesten | ✓ (`v3-mkp-gesten.mjs`): senkrecht = Wert, Fein ×¼ ab 64 px / ×1⁄16 ab 140 px / ruhender Finger, Doppeltipp = Standard im Halt, Tipp-Zoom auf Regler/Titel/Fläche, Taste schaltet ohne Zoom, ◀ ▶ und Wischen genau ein Halt, Federn an den Enden, Wischen ab Regler verschiebt nie, > 8 px verwirft den Tipp, Zoom bleibt bei 12 Wechseln (EDIT, GLOBAL, EXIT, SEQ EDIT, Vocoder, Synth, Reiter ×3, Programm, zu/auf, Spurwechsel) und beim Drehen, Karte → Gesamtansicht, zwei Regler = zwei Undos |
| MK-P-09 Leistung | **teilweise** – siehe „Leistung“ unten (×1 alles grün; Referenz ×4 im Test-Container nicht erreicht) |
| MK-P-10 Daten | ✓ (`v3-mkp-daten.mjs` gegen 4.15.0): 12 Klänge (INIT, 6 × Zufall, Arp+Seq, Dual, Split, Vocoder mit Eingang, FX) **bitgleich** (max \|Δ\| 0); `normalizeSound`, `normMk`, `normSynthP`, `normMkIn`, `PROJECT_FORMAT` 5, `SOUNDS_FORMAT` 2 im Quelltext gleich; 95 Werte über Platte + Seiten = `mkSet` im Vorgänger deep-equal; Projekt des Vorgängers lädt deep-equal; Ansichtswechsel: `soundHash` gleich, 0 Autosave; E1/E2 nicht gespeichert |
| MK-P-11 Aussehen | ✓ (`v3-mkp-aussehen.mjs`, Pixel): Platte H 208°, S 26 %, L 78–79 %, Bürstung 2,25 %; Druck L 16,7 %, Kontrast 8,7 : 1; 60 inverse Felder (= Tabelle: 52 Elemente + CH PARAM, HOLD, +1/+2/−1/−2, LEVEL, PAN) 19,2 : 1; Kappen L* ≤ 11,1, Zeiger weiß; Tasten L 82–83 %; LEDs rund, an 12°, OCTAVE grün; Anzeige Grund 78°/58 %, Zeichen 14 %, 7,8 : 1, 2 × 16 ohne Umbruch, Farben nur aus den Variablen; keine Holzwangen |
| MK-P-12 Abbau | ✓ kein Knoten/Quelltext des alten Bedienfelds (Klassennamen), Hilfe-Zeilen vollständig; **Budget überschritten** (unten); umgestellte Tests: Tabelle unten |
| MK-P-13 Fester Rahmen | ✓ in allen Formaten über 32 Zustandswechsel (Halte 1–13, Karte, Hälften, Reiter GERÄT/SPIEL/FX, EDIT, GLOBAL, COMPARE an/aus, SEQ EDIT, Vocoder, Programm, SCHRITTE/EIGENE/16 BÄNDER, Lauflicht an/aus, Spur 2 ↔ 1): Rahmen- und Blatt-Rechteck ± 0 px, `scrollHeight`/`scrollWidth` gleich, **0 `layout-shift`**, nichts außerhalb des Rahmens, hochkant Tastatur/Räder 0 px |
| MK-P-14 Lauflicht / SEQ EDIT | ✓ (`v3-mkp-lauf.mjs`, 3 Läufe): vorwärts 1 → 16, LAST STEP 8, Rückwärts, Alt 1, Alt 2, REC bereit, KEY SYNC Stimme, Dual T2, Spiel-Ansicht: je **100 %** der Bilder gleich dem Worklet-Schritt zur Audio-Zeit des Bildes, 0 Bilder über 1 Bild daneben, nie zwei LEDs; SEQ EDIT Regler n = Schritt n in der Gesamtansicht und den Halten 6, 7, 8, 10, 11, 12, ein Undo je Geste, ORIGINAL VALUE am Schrittwert, LCD „SEQ1 S05 +21“; `soundHash` und Zoom unverändert |
| MK-P-15 Rein MS 2000 | ✓ TIMBRE SELECT nur T1 ↔ T2 (Single gesperrt), kein Edit Sync/Solo/Step-Arp auf Platte und Seiten, Seitenplan/Tasten/Aufdruck = Tabellen, keine alten Bezeichnungen (EDIT-WAHL, SHIFT als Wort, SEITE, Matrix, Nummerntaste) in DOM, Hilfe, LCD; Klänge mit `arp.last/steps` bitgleich (MK-P-10) |

Zusätzlich: TEMPO-LED blinkt in Vierteln (120 BPM: Abstand 500 ± 1 ms), Leistungs-Probe „Bedienfeld“ läuft
(`v3-mkp-extra.mjs`); Reiter-Schnellweg behält Zoom, Platten-DOM und Rahmen; quer SPIEL-Tastatur endet auf jedem Weg
(✕, andere Spur, GERÄT, FX; `v3-mkp-close.mjs`); Räder quer im Reiter SPIEL (MK1-33 P1/L1 alle grün, `v3-mkp-mk1ui.mjs`).
Rauchtest ohne Fehler (`dirigent-test/v3-mkp-smoke.png`).

### Leistung (MK-P-09)

Chromium im Test-Container (4 Kerne, SwiftShader), Projekt mit 4 Spuren, 2 MS-2000-Spuren mit Arp und Seq, Skript-Sitzung
10 s (`panelScript`: 4 Regler, Tipp-Zoom, 13 Halte, Karte, 6 EDIT-Seiten, EXIT, Spiel-Ansicht), `v3-mkp-perf.mjs`:

| | ×1 P1 / L1 | ×4, DPR 3 P1 / L1 | Vorgänger 4.15.0 ×4 (nur Abspielen, Editor offen) |
|---|---|---|---|
| (a) Aufbau: Häppchen max / Arbeit / fertig | 6,7 / 19,9 / **107 ms** · 6,3 / 23,3 / **74 ms**, kein longtask | 10 / 75 / 500 ms · 8,4 / 83 / 529 ms | – (das Öffnen des Blatts selbst ist ein Long-Task von ≈ 305 ms ×4, im Vorgänger ≈ 322 ms) |
| (b) rAF p95 / > 50 ms | 16,8 ms / 0 · 16,8 ms / 0 | 33,4 / 4 · 49,9 / 11 | 16,8 / 1 · 16,8 / 0 |
| (f) Scheduler-Abstand max / > 50 ms | 31,6 / 0 · 33,5 / 0 | 79 / 31 · 125 / 45 | 73 / 4 · 53 / 2 |
| Noten gegen das Raster | 0 ms (beide) | 0 ms (beide) | 0 ms |
| (e) Layer | 1 eigener (Karten-Rechteck 0,7–1,3 MB), keiner für die Platte außerhalb von Übergängen | gleich | – |

- ×1: alle Grenzen eingehalten, auch (a) „fertig ≤ 150 ms“ und „kein Scheduler-Abstand > 50 ms“ (der Vorgänger hatte im
  selben Lauf ohne Sitzung 2 Abstände > 50 ms).
- ×4: **nicht erreicht.** Der Vergleich mit dem Vorgänger ist nicht gleich (dort keine Sitzung möglich). Gleiche Last in beiden
  Ständen (`v3-mkp-phase.mjs`, je 3 s): Ruhe mit offenem Bedienfeld neu 0–1 / alt 0 Abstände > 50 ms; **Regler drehen**
  (derselbe Weg `mkSetP` → `soundEdited` → `soundHash` je Bild) neu rAF p95 33,3, 4–6 Abstände, alt rAF p95 33,3, 3–8 — gleich
  teuer. Zoom/Halte/Seiten/Spiel-Ansicht ×4 nach den Behebungen 0–2 Abstände > 50 ms je 3 s. Größter Einzelposten in der
  Sitzung ist das Neuzeichnen beim Drehen (Hash des ganzen Sounds je Bild im Hauptstrang-Code, siehe „Für den Hauptstrang“).
- Der Trace-Zähler (b „Hauptfaden-Arbeit je Bild“) liefert im Container nur 11–24 Bilder je 10 s (Trace-Ereignisse fehlen) und
  ist deshalb nicht aussagekräftig; gewertet sind rAF-Abstände, Long-Tasks und Scheduler-Abstände.
- (c) 0 Layouts während Gleiten/Wischen; beim Drehen ≤ 1 Layout je Bild (LCD-Zeile des Blatts, `lcdFit`). (d) 0 `layout-shift`.
- (g) iPhone: **am Gerät offen** — Leistungs-Probe Fall „Bedienfeld“ (Menü → Info) über dem Fall „Kern“; im Test-Browser
  frames_ok wackelt bei „Kern“ und „Bedienfeld“ gleich (je 1 von 3), wie schon in MK7 beschrieben.

### Formate (gemessen, Test-Browser ohne Safe-Area; z der Gesamtansicht · Halte)

| Format | Rahmen | z ganz | Halte z | kleinste Zone (ganz) |
|---|---|---|---|---|
| P1 390 × 844 | 372 × 386 | 669 (Hälfte) | 669–1320 | 27 px (Hälfte rechts), 33 px links |
| P2 375 × 667 | 357 × 265 | 517 (Hälfte) | 642–1320 | 8 px (am Rahmenrand angeschnittenes Element; Treffer = Zoom) |
| P3 320 × 568 | 302 × 233 | 454 (Hälfte) | 543–1245 | 16 px |
| L1 844 × 390 | 842 × 344 | 671 (ganz) | 1009–1320 | 26–27 px, Regler 37 px, Paare 27 px |
| L2 667 × 375 | 665 × 329 | 642 (ganz) | 965–1320 | 26 px, Regler 35 px |
| W 844 × 1180 | 826 × 722 | 826 (ganz) | 1320 | 33 px, Regler 45 px |
| 926 × 428 | 924 × 382 | 745 (ganz) | 1120–1320 | 30 px, **Regler 41 px, Paare 30 px** |
| 428 × 926 | 410 × 468 | 737 (Hälfte) | 737–1320 | 30–37 px |

Safe-Area-Durchgang (`SAFE=47,0` und `SAFE=47,21`, 926 × 428 und L1, alle Zustände, 0 Befunde): 926 × 428 mit
Notch und Home-Balken → Rahmen **830 × 361, z 704** (Spec ≈ 832 × 363, z 707); L1 → 748 × 323, z 630.

### Größe (MK-P-12)

3 058 080 B = **+40 376 B** gegen 4.15.0 (Budget +28 KB = 28 672 B, **×1,40**; die Spec erwartet unter „Risiken“ +34 bis
+42 KB). `sq-mk-src` +39 336 B (neue Platte, Lage-Tabelle, Seitenplan, Ansichten, Gesten, Spiel-Ansicht; alter Teil
entfernt), Worklet +233 B (nur `sqInfo` meldet Rest-Zeit und Folgeschritt für das Lauflicht; Klang bitgleich), Hauptteil
≈ +700 B (E1/E2-Pegel, Reiter-Haken, Hilfe-Zeilen neu). Projekte ohne MS-2000-Spur laden nichts davon (EN3-14).
Entscheidung beim Orchestrator (5,0-MB-Grenze weit entfernt; SL1 ist geplant).

### Umgestellte Oberflächen-Tests aus MK1–MK7 (alter Weg → neuer Weg)

| Test (alt) | prüfte | neuer Weg / Abdeckung |
|---|---|---|
| `v3-mk1-look.mjs` (MK1-21, MK1-32 Skizze) | altes Bedienfeld gegen die alte Skizze | entfällt; M-VORLAGE `v3-mkp-funk.mjs` (MK-P-01), `mkp-bildvergleich` (MK-P-02), `v3-mkp-aussehen.mjs` (MK-P-11) |
| `v3-mk1-ui.mjs` MK1-20/21/22/31/34 | EDIT-WAHL, Regler 1–5, ◎ an Stellungen, LED/LCD | `v3-mkp-funk.mjs` (Bindung, ◎ über `wiaPaint` an Reglern und Seiten), `v3-mkp-gesten.mjs`; Programm lädt in SPIEL: `P.mode = 'spiel'` |
| `v3-mk1-ui.mjs` MK1-33 (Räder) | Räder quer im GERÄT-Reiter | quer liegen Räder und Tastatur im Reiter SPIEL (H-17): `v3-mkp-mk1ui.mjs` (Kopie, quer erst SPIEL) — P1 und L1 alle grün |
| `v3-mk2-ui.mjs` MK2-03-UI / MK2-10 | „≈“ und Fläche über EDIT-WAHL | LCD „≈“ über OSC 1 WAVE / CONTROL 2 (`lcdOf`), Fläche M-PLATZ `v3-mkp-platz.mjs` |
| `v3-mk3-ui.mjs` MK3-03/04/05/10/11/13 | Split ← nächste Note, TIMBRE-Taste T1→T2→beide, SHIFT-Werkzeuge, Fläche, Hilfe, Solo | Split ← nächste Note über Tipp auf die Anzeige (01 COMMON SPLIT); TIMBRE SELECT T1 ↔ T2 (MK-P-15); UTILITY-Werkzeuge (MK-P-05 „05-utility“); Edit Sync und Solo nicht auf dem Bedienfeld (H-18); Hilfe neu |
| `v3-mk4-ui.mjs` MK4-12-PLATZ/-BED | EDIT-WAHL 2 MOD-FX/DELAY/EQ | MOD/DELAY + Regler 11/12, Seiten 22–24 (MK-P-03/05); die übrigen 8 MK4-Prüfungen (mkRender, Puffer, Speichern, Probe „+FX“) bestehen unverändert |
| `v3-mk5-ui.mjs` MK5-17-PLATZ/-BED/-LED, Hilfe | ARP-Taste, ARP A/B, Nummerntasten als Schritte | ARPEGGIATOR ON/OFF, LATCH, RANGE, TYPE, TEMPO, GATE (MK-P-03), TEMPO-LED (`v3-mkp-extra.mjs`), Step-Arp-Schritte nach H-18 nicht auf dem Bedienfeld; Probe „+Arp“ besteht |
| `v3-mk6-ui.mjs` MK6-09/11/13 | SEQ-Stellung, SCHRITTE, AUFN., SHIFT + 5 | SEQ EDIT + 16 Regler (MK-P-14), SCHRITTE ▸ über Seite 19–21, REC-Taste, UTILITY SEQ-Werkzeuge (MK-P-05); die übrigen 5 MK6-Prüfungen bestehen |
| `v3-mk7-ui.mjs` MK7-13-PLATZ/MK7-BED | Vocoder-Stellungen, grüne Namen, SHIFT + 1/2, HALTEN-Taste | Vocoder-Spalte der Platte (MK-P-04), weiße Namen auf Schwarz, UTILITY Pegel/Pan zurück, E.F.SENSE 127 = HOLD |
| `v3-mk7-ui.mjs` MK7-13-LIVE, MK7-15 | Bandpegel, ECO | `v3-mkp-mk7ui.mjs` (Kopie; Vocoder über 01 COMMON MODUS statt SYNTH/VOC.): beide grün |
| `v3-mk7-inputs.mjs` MK7-10/13 | QUELLE 2 über EDIT-WAHL 1 + SHIFT, E1/E2-LEDs neben der Anzeige | `v3-mkp-mk7inputs.mjs` (Kopie; GLOBAL 1B + Tipp auf die Anzeige, AUDIO-IN-LEDs der Platte): **24/24** |

Die alten Skripte bleiben unverändert liegen (typische Fehler Nr. 26); ihre Fehlschläge auf 4.16.0 sind genau die oben
umgestellten Oberflächen-Teile (`MKUI.setWahl`/`toSpiel`/`knobs` gibt es nicht mehr).

### Regression (nicht Oberfläche, unverändert bestanden)

`v3-mk7-voc.mjs` 37/37 (gegen 4.15.0), `v3-mk6-seq.mjs` alle, `v3-mk3-timbre.mjs` alle, `v3-mk3-scale.mjs` alle,
`v3-mk2-marke.mjs` alle, `v3-mk1-probe.mjs` 7/7, `v3-mk4-ui.mjs` nicht-Oberfläche 8/8. Gleich auf 4.15.0 (nicht MK-P):
`v3-mk5-arp.mjs` MK5-02 „live zweimal“ (wackelt auch im Vorgänger), `v3-mk2-ui.mjs` MK2-08 Oktav-Welle 36–55 ms > 30 ms
(Vorgänger 38–40 ms), `v3-mk4-fx.mjs` FP-DSP-Denormale (Last-Zeitmessung in Node, Worklet-DSP unverändert),
`v3-mk1-format.mjs` 3 Prüfungen gegen 4.8.1 (überholt, wie in CHANGES-MK-MK8).

### Abweichungen von der Spec

- MK-P-09 (×4) und Budget: siehe oben.
- Trefferzonen am Rahmenrand: ein angeschnittenes Element hat eine kleine sichtbare Zone (P2 8 px); die Regel „nächstes
  Element“ gilt trotzdem, und der Zoom ist dort der Arbeitsweg (Spec „Risiken“).
- COMPARE schaltet über den vorhandenen A/B-Weg; ohne gespeicherten MS-2000-Stand bzw. ohne Änderung nennt die LCD den Grund.
- Ohne MK8 zeigen BANK/SELECT die eigenen Sounds der Engine in Gruppen à 16 (LCD „---:Name“); mit MK8 die Programme A01–H16.

### Für den Hauptstrang / Zusammenführen

- Berührt außerhalb von `sq-mk-src`: Worklet `sqInfo` (Felder `rem`, `nx`), `mkInRoute`/`mkInLink` (+ `mkTrimF`,
  `mkInTrimApply`), Entfernen von `mkHalfWanted`, `buildSynthEd` (Reiter GERÄT/SPIEL/FX, `MKUI.chrome`, Reiter-Haken
  `MKUI.tabFast`, `edHeadFit` nur hochkant), `fillSynthTab`, `closeEditor`/Spurwechsel (`mkq`, `mkqkb`), `lcdShow`
  (`_onShow`), LCD-Ziel quer (`.mkqh .preset`), Programm lädt in SPIEL, ⋯-Texte UTILITY, Hilfe-Zeilen, VERSION.
- **Vorschlag (Leistung, nicht in diesem Zweig geändert):** `mkSetP` setzt bei jeder Live-Geste `UI.dirty.edHead`;
  `edHeadRefresh` → `soundEdited` rechnet dann je Bild `soundHash` des ganzen Sounds (≈ 1,3 ms je Bild bei ×4, der größte
  JS-Posten beim Drehen, alt wie neu). Bei Live-Werten reicht ein Neuberechnen, solange der Punkt noch „unverändert“ zeigt.
- MK8: `window.mkProg`-Objekt wird direkt genutzt (Punkt 10); `v3-mk8-ui.mjs` Wahl-Tests auf die Platte umstellen.
- Defekte aus MK7 oder früher: keine neuen gefunden (die Wackel-Tests oben bestehen auch auf 4.15.0 nicht stabil).

### iPhone (Xander, 12 Pro Max) — wie in der Spec

1. MS-2000-Spur öffnen, quer halten: Ist das dein Gerät? Ohne Zoom CUTOFF drehen, ARP ON/OFF tippen.
2. Titel FILTER antippen → Zoom bleibt; ▶/Wischen bis VIRTUAL PATCH; Karte oben = ganze Platte. Springt etwas?
3. Hochkant: Hälften wechseln (Wischen/Karte), CUTOFF fein (seitlich wegziehen).
4. Reiter SPIEL: PITCH, MOD, Tastatur, OCTAVE, ARP, LATCH.
5. EDIT, SELECT 6 (FILTER): PAGE, CURSOR, −/+ und EXIT.
6. MOD SEQUENCE ON/OFF, eine Taste halten: laufen die SELECT-Tasten mit? SEQ EDIT SELECT: die 16 Regler setzen die Schritte.
7. Menü → Info → Leistungs-Probe „Bedienfeld“ schicken (FP-IPHONE, am Gerät offen).

Snapshot: `synq-snapshots/MK-P.html`.


# CHANGES MK8: Programm-Speicher A–H × 16 mit eigenen Werksklängen (App 4.17.0)

Zweig-Kopie `scratchpad/mk-br-MK8/index.html`, gebaut auf 4.15.0 (MK0–MK7, 3 017 704 B). Vorgänger für alle
„bitgleich/unverändert“-Prüfungen: **4.15.0** (`dirigent-test/v3-mk8-base-4150.html`). Snapshot `synq-snapshots/MK8.html`.
Weg nach Teil G Nr. 18 **„Kommt MK8 zuerst“**: Programm-Wahl über Bibliothek (Bank ▾) und ‹ › im Blattkopf, das alte Bedienfeld
bekam keine neuen Teile. Für MK-P gibt es das API-Objekt `window.mkProg`.

## Gebaut

- **128 Plätze A01–H16** (Umfang 1–3): 127 eigene Programme + H16 = INIT MS 2000 (derselbe Eintrag `f-init-am`). Ordnung je
  Platz nach der Rollen-Tabelle (A–G: 01 hart, 02 Arp, 03 Fläche, 04 Bass, 05 Lead, 06 Sequenz, 07 Glocke/Perkussion,
  08 Tasten, 09 Bass, 10 Bewegung, 11 Streicher/Chor, 12 Lead, 13 Bläser/weich, 14 Wellen-Sequenz, 15 Bass, 16 Effekt;
  H01–H08 nach den Rollen, H02/H07 Effekt, H09–H14 Vocoder, H15 Eingang, H16 INIT). Bänke mit eigenem Charakter:
  A klassisch warm, B hell/gläsern (Ring, Sync, Sinus×), C dunkel/resonant, D Wellen (Speicherwellen, Stimmwelle),
  E Bewegung (LFO, Mod-Seq), F Schichten (Dual/Split), G Raum (Phaser, Echo, Ensemble), H gemischt + Vocoder.
- **Vocoder H09–H14** mit `hold`-Spektren aus den eigenen Vokalen a/e/i/o/u (Vokal-Quelle W-44 aus MK7 als Modulator,
  gemessen von der Analyse des App-Worklets über `E.mkHoldGet` im OfflineAudioContext, `dirigent-test/v3-mk8-hold.mjs`).
  Alle DIREKT 0, HPF-PEGEL 0. Sie klingen ohne Mikrofon (live geprüft).
- **Daten** (Umfang 4, EN3-14): Block `/*MKF{*/ SQ_MK_FACTORY /*}MKF*/` im nachgeladenen `sq-mk-src`; je Programm nur die
  geänderten Felder gegen INIT (Lücke + Zickzack-Wert als Varint, feste Feld-Reihenfolge = INIT-Baum), je Bank ein
  Base64-Teil mit Salz-Byte (Bau-Skript prüft die Markenwort-Regel B.6 Nr. 9 und wechselt das Salz). Namen und ⓘ-Texte als
  Klartext. Entpackt wird je Bank beim ersten Bedarf, vorher `tickAhead(.3)`. Bau: `dirigent-test/v3-mk8-bau.mjs`
  (Rezepte `v3-mk8-rezepte.mjs` + Kalibrierung `v3-mk8-cal.json` → Block).
- **Felder `bank`/`slot`** (1…8, 1…16): `normalizeSound` behält sie nur bei Engine `mk` mit gültigen Werten; nicht im
  `soundHash`. Nur Bibliotheks-Einträge tragen einen Platz (Spur-Kopien nicht: `soundCopy` und `saveSound` entfernen ihn).
  `Library.save(overwrite)` behält den Platz, `duplicate` nimmt ihn nicht mit, `importMany`/`restore` lassen ihn weg,
  wenn der Platz inzwischen belegt ist; neu `Library.put(id, rec|null)` für das Undo. Kein neues Format.
- **Programm-Speicher** (Umfang 5–6, Modul `MKF` im Block): Platz = eigener Klang mit diesem `bank`/`slot`, sonst
  Werksklang. Laden = ein Undo + Toast [Rückgängig] + LCD „A01:Name“; ‹ › im Blattkopf einer MS-2000-Spur = Programm −/+
  (A01 … H16, bleibt an den Enden stehen, LCD „Anfang · A01“ / „Ende · H16“). H15 zeigt „Eingang wählen: GLOBAL 1A“.
- **Sichern = WRITE** bei MS-2000-Spuren: Platzwahl (Bank A–H, Platz 1–16; Vorgabe = zuletzt geladenes Programm), Infozeile
  („Werksklang „X“ wird überdeckt“ bzw. „trägt „Y“ – er bleibt in Eigene“), Name, [Auf A01 schreiben], [Ohne Platz]
  (wie bisher Eigene), [Überschreiben] (eigener Klang), [Werksklang zurück] (wenn der Platz einen eigenen Klang trägt).
  Ein älterer eigener Klang auf dem Platz verliert nur `bank`/`slot`. WRITE und WERKSKLANG ZURÜCK sind je **ein** Undo
  (Gruppe aus Bibliotheks-Einträgen `mkslot` + Spur-Klang), Undo/Redo deep-equal.
- **Bibliothek** (Umfang 7): im Filter „MS 2000“ der Chip **„Bank ▾“** (A–H, „Alle MS 2000“). Bank X = genau die 16 Plätze
  in Reihenfolge (eigener Klang statt Werksklang, Zeile „B05 · eigener Klang“), Werkszeilen „C04 · Bass“. Eine Spur mit
  einem Programm öffnet ihre Bank. Rollen-Chips wie bisher (Rollen nach EN-18 je Platz). ⋯ eines eigenen Platz-Klangs:
  „Werksklang zurück“. ▶ Vorhören: Arp-Programme spielen einen gehaltenen Akkord durch das Arp-Muster des Programms
  (der Arp-Kern läuft sonst nur für Spuren), Sequenz-Programme gehaltene Akkorde (damit KEY SYNC die Folge laufen lässt).
  Filter „MS 2000“ und „Alle Engines“ werten den Block aus (EN3-14).
- **API für MK-P:** `window.mkProg = {select(bank, slot), step(dir), bank(dir), write(bank, slot, name?), restore(bank, slot),
  current()}` auf die gewählte Spur (`R.selT`); `current()` → `{bank, slot, label: 'A01', name, text: 'A01:Name', own, edited}`.
  `bank(dir)` stellt nur die Bank (LCD; `bank(0)` liest sie), SELECT n lädt dann über `select(bank, n)` (wie am Gerät, HB-MS S. 13).
- Hilfe-Zeile „Programm-Speicher“, Version **4.17.0**. `mkRender`-Ereignisse nehmen als 6. Element die Timbre-Maske (Test-API,
  für den Arp-Ziel-Timbre im Pegel-Lauf).

## Abnahme MK8 (Chromium 1243, `dirigent-test/`)

| ID | Ergebnis |
|---|---|
| MK8-01 | ✓ 128 Plätze je Name ≤ 12, Rolle, Bank, Platz, ⓘ; Entpacken = Rezept deep-equal (128); jedes Programm lädt über `mkProg.select` und über die Bibliothek mit je einem Undo, Undo deep-equal; `bank`/`slot` überstehen Speichern → Laden (Projektdatei in eine frische Seite importiert) |
| MK8-02 | ✓ E9/A.4/A.13-Liste auf ganzen Wörtern (Namen und ⓘ) 0; Levenshtein gegen 256 Werksnamen beider Handbücher (nur aus `manuals/werksnamen.local.json`, erzeugt von `v3-mk8-namen.mjs`), kleinster Abstand 3; Stichprobe 3 Werksnamen in `dirigent-test/`, `synquenzer/bau`, Repo-`index.html` und App: 0; Markenwörter Block 0, „MS 2000“ genau 1×. Umbenannt im Bau (Abstand ≤ 2): drei Namen |
| MK8-03 | ✓ jedes Programm „eigenes Rezept“ (Tabelle unten); das Prüfskript liest aus der privaten Datei nur Kategorie und Modus je Platz |
| MK8-04 | ✓ alle −20,9 … −17,5 LUFS, True Peak ≤ −2,2 dBTP, Bässe M-HANDYrel bei C2 −19,0 … −7,2 dB (22 Bässe); H15 (Eingang, ohne Quelle stumm) und H16 (INIT, −18,9) ausgenommen. Prüfphrasen: Bass 8 Achtel C2, Lead C4–C5, Fläche/Chor 4 Takte Akkord, Arp/Seq/Bewegung/Wellen-Seq Akkord 2 Takte (Arp-Schritte aus dem Arp-Muster), Vocoder gehaltene Akkorde; nicht vorgegebene Rollen: hart/Tasten/Bläser Akkord-Viertel, Glocke Melodie C5–C6, Effekt eine lange Note |
| MK8-05 | ✓ Rollen A–G 112/112; Arp 11 (≥ 10), Mod-Seq 24 (≥ 14), Speicherwellen 20 (≥ 10), Dual/Split 23 (≥ 12), Delay-Sync 60 (≥ 8); H09–H14 `mode` 3 mit `hold`, DIREKT 0, HPF 0; H15 OSZ 1 = Eingang; H16 = INIT deep-equal |
| MK8-06 | ✓ 1386 Paare (in jeder Bank, gleiche Plätze über Bänke), kleinster Unterschied 3,9 dB in einem relevanten M-BAND |
| MK8-07 | ✓ Bank A–H je genau 16 Plätze in Reihenfolge, eigener Klang statt Werksklang; N0b-01 über alle 10 Rollen-Chips; VA-Spur nur VA, ohne Bank-Chip; ▶ Arp-Programm 32 Arp-Noten, Fläche 5 Noten, Stimmen klingen |
| MK8-08 | ✓ Werksdaten im Block 22,4 KB (≤ 44; Parameter-Base64 9,4 KB); eine Bank 1,2–2,8 ms (≤ 5); alle 128 in 8 Häppchen 0,7–1,9 ms mit 30-ms-Pause; Laden 1,3–5,7 ms, 0 longtask; Block wird ohne AM-Projekt nicht ausgewertet (bei Bedarf 16,6 ms); Startzeit ohne AM 381 → 383 ms (Median aus 5) |
| MK8-09 | ✓ ‹ › mit Enden; Sichern → D07 schreibt, D07 lädt danach den eigenen Klang, 0 andere Plätze geändert; Undo deep-equal, Redo; zweites WRITE: älterer Klang verliert nur den Platz; WERKSKLANG ZURÜCK (Bibliothek ⋯) stellt `f-mk-d07` her, Undo deep-equal; M-PLATZ Platzwahl und Bank ▾ in P1, P2, P3, L1, L2, W: alle Tasten ≥ 44 × 44, im Bild, nichts abgeschnitten, keine Überlappung, Zeilen 45–49 px |
| MK8-10 | ✓ Regression (unten), keine Konsolenfehler, Budget **+44 996 B** (≤ +60 KB = 61 440 B), Worklet unverändert (bytegleich) |

Zusätzlich live (Echtzeit-Kontext): A04, A07, A03, H09 (Vocoder ohne Mikrofon), A02 (Arp 5 Schritte) klingen
(−31 … −21 dB RMS im Analyser) und unterscheiden sich im Schwerpunkt (269 … 1237 Hz).

Skripte: `v3-mk8-daten.mjs` (MK8-01/02/03/05/08), `v3-mk8-pegel.mjs` (MK8-04, `--bands` MK8-06, `--cal N` Kalibrierung),
`v3-mk8-ui.mjs` (MK8-01/07/08/09, live), `v3-mk8-mess.js` (LUFS BS.1770, True Peak 4×, M-HANDYrel, M-BAND, Phrasen),
`v3-mk8-hold.mjs`, `v3-mk8-bau.mjs`, `v3-mk8-namen.mjs` (schreibt nur die private Datei). Ausgaben `v3-mk8-*.out`,
Bilder `v3-mk8-shots/` (P1, P2, P3, L1, L2, W: `*-sichern.png`, `*-bank.png`; dazu Blatt und Bibliothek in P1/P3/L2).

## Regression

- Rauchtest ohne Fehler (`dirigent-test/v3-mk8-smoke.png`; `smoke.mjs` startet das Standard-Chromium, das hier fehlt –
  gleiche Prüfung als `v3-mk8-smoke.mjs` mit Chromium 1243).
- `v3-mk2-marke.mjs` alles PASS; `v3-mk1-look.mjs` 88/88; `v3-mk7-ui.mjs` 102/102.
- `v3-mk1-format.mjs` gegen 4.15.0: VA/FM/WT-Werks-Sounds und Demo **bitgleich (64, max |Δ| 0)**, Format 3/4 deep-equal,
  normMk, Speichern → Laden, VA → AM → VA, Kalt-Start ✓. Die drei Fehlschläge vergleichen mit 4.8.1 (Format 4 → 5,
  APP_CODE 4 009 000, Sperre in 4.8.1) und sind durch den Vorgänger 4.15.0 überholt (gleich auf 4.15.0).
- `v3-mk0-schutz.mjs` 33/47 – genau wie auf 4.15.0 (der Test nimmt Format 5 als „neuere Version“; überholt seit MK1).

## Fach-Prüfung (selbst, vor der Abnahme; Teil F: FP-KLANG ● Haupt-, FP-TOUCH Zweit-Blick)

7 Befunde, alle behoben:
1. FP-KLANG: 108 von 126 Programmen erreichen −18 LUFS mit AMP LEVEL 127 nicht (die AM-Engine ist auf INIT = INIT Analog
   kalibriert, ein gefilterter Klang liegt 5–15 dB darunter). Lösung: Pegel-Ausgleich im Programm über den EQ – LOW- und
   HIGH-Kuhschwanz beide bei 1000 Hz mit gleichem Gewinn (= flache Anhebung, W-33), höchstens +12 dB (Median +7,3 dB,
   20 Programme am Anschlag). Unter 0 dB regelt AMP LEVEL. Wer auch mit +12 dB zu leise war, wurde im Rezept nachgestimmt
   (heller, mehr Sustain/Gate, zweiter Oszillator: C06, C15, D06, D07, D16, E02, E06, G02, G06, G16, H07).
2. FP-KLANG: Bässe A09, C04, C15 unter M-HANDYrel −20 dB → Cutoff/Resonanz angehoben.
3. FP-KLANG: Die Vokal-Quelle (MK7) fällt oberhalb F1 mit ≈ 20 dB/Okt; F2/F3 lagen unter der Halte-Untergrenze. Für die
   `hold`-Spektren wird der Vokal vor der Analyse dreimal entzerrt (+18 dB/Okt ab ≈ 400 Hz), danach zeigen a/e/i/o/u ihre
   Formanten (z. B. „i“ F2/F3 in Band 13/14).
4. FP-KLANG: ⓘ von H09/H14 nannten einen zweiten Oszillator, den der Vocoder-Träger nicht hat → Rezepte und Texte bereinigt.
5. FP-KLANG: Vorhören der Sequenz-Programme lief mit 16tel-Noten, KEY SYNC startete die Folge bei jeder Note neu →
   Rollen 06/10/14 hören mit gehaltenen Akkorden; Arp-Programme mit dem Arp-Muster.
6. FP-TOUCH: Der Lade-Toast lag in L1/L2 über den Platz-Tasten 1–8 der Platzwahl → Platzwahl und Bank ▾ schließen den Toast.
7. FP-TOUCH: LCD/Undo hießen „WRITE“ → deutsch „Gesichert auf Platz“ / „Sichern auf A01“ (außerhalb der Platte deutsch, H-16).

## Abweichungen und Lücken

- **Pegel-Ausgleich über den EQ** (Befund 1): Auf der EQ-Seite sieht man bei vielen Programmen LOW/HIGH 1000 Hz +x dB.
  Alternative für später: ein Ausgangs-Pegel je Programm (neues Feld, nicht in HB-MS) oder ein höheres `ampK` (ändert INIT
  und MK1-20) – Entscheidung Xander/Orchestrator.
- Messung über `mkRender` (Engine mit Programm-Effekten, ohne Spurkette/Hall); `fx.vol` der Werksprogramme 0,8 wie INIT.
- Die Rollen-Kennung der Bibliothek folgt EN-18 (z. B. 01 hart → Akkord, 07 Glocke/Perkussion → Keys, weil „Glocke“ nur FM).
- MK8-09 „Mit MK-P“-Teil (BANK ▼ ▲, SELECT, LED, LCD „A01:Name“ auf der Platte) folgt mit MK-P über `window.mkProg`;
  WERKSKLANG ZURÜCK auf den Seiten 26/20 UTILITY ebenfalls (heute: Bibliothek ⋯ und Platzwahl).
- Das alte Bedienfeld zeigt weiter seine eigene BANK/SEITE-Wahl (Seite A leer, Seite B eigene Klänge) – laut Auftrag
  unverändert, MK-P ersetzt es.
- Lade-Hinweis H15 nennt „GLOBAL 1A“ (MK-P); bis dahin wählt man den Eingang im alten Bedienfeld.
- Vorhören eines Arp-Programms: eigene Arp-Ausspielung (Typ, Oktaven, Auflösung, Gate; ohne Swing/Latch).
- Kein Gerät, kein Hören durch einen Menschen: alle Klänge sind gemessen, nicht angehört (EN3-16) → iPhone-Punkte.
- Chromium-Pfad: `/opt/pw-browsers/chromium-1194/…` gibt es in diesem Container nicht; benutzt wurde `chromium-1243/chrome-linux64/chrome` (wie die MK-Tests seit V2d′).

## Fehler früherer Pakete (nur gemeldet, nicht in diesem Zweig behoben)

- MK7: Vokal-Quelle W-44 fällt oberhalb F1 sehr steil (Glottis-Tiefpass + vier Tiefpass-Resonatoren in Reihe; „a“ bei
  2 kHz −60 dB unter F1). Als Probe-Modulator klingt sie dumpf.
- MK1/MK7: `mkRender` lieferte im Serien-Lauf einmal einen stillen Render (bekannt aus MK7, `v3-qa7-pegel`); der
  Pegel-Lauf rendert dann einmal neu.
- `smoke.mjs` ruft `chromium.launch()` ohne Pfad (fehlt im Container).

## Für das Zusammenführen (Teil G Nr. 18)

- Berührt im Hauptteil: `normalizeSound` (bank/slot), `Library.save/duplicate/put/restore/importMany`, `soundCopy`,
  `saveSound`, `originRec` (lädt den Block bei `f-mk-*`), `undoState/undoApply` (`mkslot`), `stepSound`, `openSavePop`,
  `factoryNames`, Browser (`BR.bank`, `brList`, `openBrowser`, `brScope`, `brChipsHTML`, `brRefresh`, `brTap`),
  `previewStart`, `mkRender` (Maske), neue Helfer `mkSlotSnap`/`mkSlotPut`/`window.mkProg` vor `mkWaveOf`, CSS `.pop.mk8w`,
  eine Hilfe-Zeile, VERSION. Im Block `sq-mk-src` nur ein eigener Abschnitt am Ende (`/*MKF{*/ … */` + IIFE `window.MKF`).
  Worklet unverändert.
- MK-P bindet: BANK ▼ ▲ → `mkProg.bank(±1)`, SELECT n → `mkProg.select(mkProg.bank(0), n)` (`bank(0)` liest die gewählte Bank),
  −/NO +/YES → `mkProg.step(∓1)`, WRITE → `MKF.savePop(anker, spur)` oder `mkProg.write(b, s)`, LCD-Zeile 1 aus
  `mkProg.current().text`, LED aus `current().slot`; WERKSKLANG ZURÜCK auf 26/20 UTILITY → `mkProg.restore(b, s)`.
  Die Wahl-Tests von `v3-mk8-ui.mjs` (‹ ›) dann auf die Platte umstellen (≈ 0,5–1 h laut Teil G).
- Kein Supabase-Schritt (Format 5, App 4 017 000 ≤ max_app 4 021 000).

## iPhone (Xander)

1. Spur auf MS 2000, Bibliothek → Bank ▾ → jede Bank einmal durchtippen (Lautsprecher und Kopfhörer); Ausreißer melden
   (zu leise, zu laut, langweilig). Mit ‹ › im Klang-Kopf geht es Programm für Programm weiter.
2. Einen Klang ändern, Sichern → Bank und Platz wählen → „Auf … schreiben“; den Platz wieder laden; dann in der
   Bibliothek ⋯ → „Werksklang zurück“.
3. H09–H14 ohne Mikrofon: halten, hören, ob die Vokale a/o/e/i/u erkennbar sind.

## Herkunft je Programm (MK8-03)

| Platz | Name | Rolle | Modus | Merkmale | Herkunft |
|---|---|---|---|---|---|
| A01 | Sägeblock | hart | Single |  | eigenes Rezept |
| A02 | Kiesel-Arp | arp | Single | Arp, Delay-Sync | eigenes Rezept |
| A03 | Weiches Feld | flaeche | Single |  | eigenes Rezept |
| A04 | Rundbass | bass | Single |  | eigenes Rezept |
| A05 | Klarer Ruf | lead | Single |  | eigenes Rezept |
| A06 | Pulsfolge | seq | Single | Seq, Delay-Sync | eigenes Rezept |
| A07 | Glasglocke | perk | Single | Delay-Sync | eigenes Rezept |
| A08 | Orgelreihe | tasten | Single |  | eigenes Rezept |
| A09 | Tiefgang | bass | Single |  | eigenes Rezept |
| A10 | Wanderfilter | bewegung | Single | Seq | eigenes Rezept |
| A11 | Streichsatz | chor | Single |  | eigenes Rezept |
| A12 | Sync-Sturz | lead | Single | Delay-Sync | eigenes Rezept |
| A13 | Blechsatz | blaeser | Single |  | eigenes Rezept |
| A14 | Wellenband | wseq | Single | Seq, ≈ Welle, Delay-Sync | eigenes Rezept |
| A15 | Knackbass | bass | Single |  | eigenes Rezept |
| A16 | Sturmwind | effekt | Single |  | eigenes Rezept |
| B01 | Ringkante | hart | Single |  | eigenes Rezept |
| B02 | Funkenarp | arp | Single | Arp, Delay-Sync | eigenes Rezept |
| B03 | Eisfläche | flaeche | Single |  | eigenes Rezept |
| B04 | Gummibass | bass | Single |  | eigenes Rezept |
| B05 | Doppelglanz | lead | Dual | Delay-Sync | eigenes Rezept |
| B06 | Stufenglas | seq | Single | Seq, Delay-Sync | eigenes Rezept |
| B07 | Kristallton | perk | Single |  | eigenes Rezept |
| B08 | Zupfklavier | tasten | Single |  | eigenes Rezept |
| B09 | Ringknurrer | bass | Single |  | eigenes Rezept |
| B10 | Funkregen | bewegung | Single | Seq, Delay-Sync | eigenes Rezept |
| B11 | Lichtchor | chor | Single |  | eigenes Rezept |
| B12 | Pfeifkante | lead | Single | Delay-Sync | eigenes Rezept |
| B13 | Glashauch | blaeser | Single |  | eigenes Rezept |
| B14 | Wellenfunk | wseq | Single | Seq, ≈ Welle, Delay-Sync | eigenes Rezept |
| B15 | Glanzbass | bass | Single |  | eigenes Rezept |
| B16 | Funkzirpen | effekt | Single | Delay-Sync | eigenes Rezept |
| C01 | Tiefschlag | hart | Single |  | eigenes Rezept |
| C02 | Nachtarp | arp | Single | Arp, Delay-Sync | eigenes Rezept |
| C03 | Nebelbank | flaeche | Single |  | eigenes Rezept |
| C04 | Brummbass | bass | Single |  | eigenes Rezept |
| C05 | Dunkelruf | lead | Single | Delay-Sync | eigenes Rezept |
| C06 | Kellertakt | seq | Single | Arp, Delay-Sync | eigenes Rezept |
| C07 | Holzschlag | perk | Single | Delay-Sync | eigenes Rezept |
| C08 | Stubenpiano | tasten | Single |  | eigenes Rezept |
| C09 | Grollbass | bass | Single |  | eigenes Rezept |
| C10 | Tropfnacht | bewegung | Single | Seq, Delay-Sync | eigenes Rezept |
| C11 | Mönchschor | chor | Dual |  | eigenes Rezept |
| C12 | Schwerlead | lead | Single | Delay-Sync | eigenes Rezept |
| C13 | Hornsatz | blaeser | Dual |  | eigenes Rezept |
| C14 | Schattenzug | wseq | Single | Seq, ≈ Welle, Delay-Sync | eigenes Rezept |
| C15 | Kellerbass | bass | Single |  | eigenes Rezept |
| C16 | Tiefseeruf | effekt | Single |  | eigenes Rezept |
| D01 | Wellenstoß | hart | Single | ≈ Welle | eigenes Rezept |
| D02 | Wellenarp | arp | Single | Arp, ≈ Welle, Delay-Sync | eigenes Rezept |
| D03 | Wellenmeer | flaeche | Dual | ≈ Welle | eigenes Rezept |
| D04 | Wellenbass | bass | Single | ≈ Welle | eigenes Rezept |
| D05 | Hauchlead | lead | Single | Delay-Sync | eigenes Rezept |
| D06 | Wellenkette | seq | Single | Seq, ≈ Welle, Delay-Sync | eigenes Rezept |
| D07 | Blechtrommel | perk | Single | ≈ Welle, Delay-Sync | eigenes Rezept |
| D08 | Röhrenorgel | tasten | Single | ≈ Welle | eigenes Rezept |
| D09 | Stimmbass | bass | Single |  | eigenes Rezept |
| D10 | Formwandel | bewegung | Single | Seq | eigenes Rezept |
| D11 | Wellenchor | chor | Dual | ≈ Welle | eigenes Rezept |
| D12 | Wellenlead | lead | Single | ≈ Welle, Delay-Sync | eigenes Rezept |
| D13 | Flötenwelle | blaeser | Single | ≈ Welle | eigenes Rezept |
| D14 | Wellenzug | wseq | Single | Seq, ≈ Welle | eigenes Rezept |
| D15 | Wellenpunch | bass | Single | ≈ Welle | eigenes Rezept |
| D16 | Wellenspuk | effekt | Single | ≈ Welle, Delay-Sync | eigenes Rezept |
| E01 | Pumpakkord | hart | Single | Seq | eigenes Rezept |
| E02 | Laufarp | arp | Single | Arp, Delay-Sync | eigenes Rezept |
| E03 | Atemfläche | flaeche | Single |  | eigenes Rezept |
| E04 | Hüpfbass | bass | Single | Seq | eigenes Rezept |
| E05 | Pedalruf | lead | Single | Delay-Sync | eigenes Rezept |
| E06 | Zahnradfolge | seq | Single | Seq, Delay-Sync | eigenes Rezept |
| E07 | Pingtropfen | perk | Single | Delay-Sync | eigenes Rezept |
| E08 | Wackelpiano | tasten | Single |  | eigenes Rezept |
| E09 | Schiebebass | bass | Single |  | eigenes Rezept |
| E10 | Laufband | bewegung | Single | Seq, Delay-Sync | eigenes Rezept |
| E11 | Wogenchor | chor | Single |  | eigenes Rezept |
| E12 | Kurvenlead | lead | Single | Seq, Delay-Sync | eigenes Rezept |
| E13 | Schwellblech | blaeser | Single |  | eigenes Rezept |
| E14 | Wellenrad | wseq | Single | Seq, ≈ Welle, Delay-Sync | eigenes Rezept |
| E15 | Pendelbass | bass | Single |  | eigenes Rezept |
| E16 | Ufo-Landung | effekt | Single | Delay-Sync | eigenes Rezept |
| F01 | Doppelstab | hart | Dual |  | eigenes Rezept |
| F02 | Zwillingsarp | arp | Dual | Arp, Delay-Sync | eigenes Rezept |
| F03 | Schichtfeld | flaeche | Dual |  | eigenes Rezept |
| F04 | Splitbass | bass | Split |  | eigenes Rezept |
| F05 | Zweiklang | lead | Dual | Delay-Sync | eigenes Rezept |
| F06 | Kreuzfolge | seq | Dual | Arp, Seq, Delay-Sync | eigenes Rezept |
| F07 | Spieluhr | perk | Dual | Delay-Sync | eigenes Rezept |
| F08 | Splitpiano | tasten | Split |  | eigenes Rezept |
| F09 | Schichtbass | bass | Dual |  | eigenes Rezept |
| F10 | Splitfolge | bewegung | Split | Seq, Delay-Sync | eigenes Rezept |
| F11 | Doppelchor | chor | Dual |  | eigenes Rezept |
| F12 | Splitlead | lead | Split | Delay-Sync | eigenes Rezept |
| F13 | Bläserpaar | blaeser | Dual |  | eigenes Rezept |
| F14 | Wellenpaar | wseq | Dual | Seq, ≈ Welle, Delay-Sync | eigenes Rezept |
| F15 | Splitkeller | bass | Split |  | eigenes Rezept |
| F16 | Doppelsirene | effekt | Dual | Delay-Sync | eigenes Rezept |
| G01 | Echostab | hart | Single | Delay-Sync | eigenes Rezept |
| G02 | Phasenarp | arp | Single | Arp, Delay-Sync | eigenes Rezept |
| G03 | Raumdecke | flaeche | Single |  | eigenes Rezept |
| G04 | Hallbass | bass | Single |  | eigenes Rezept |
| G05 | Echolead | lead | Single | Delay-Sync | eigenes Rezept |
| G06 | Echofolge | seq | Single | Seq, Delay-Sync | eigenes Rezept |
| G07 | Glockenwurf | perk | Single | Arp, Delay-Sync | eigenes Rezept |
| G08 | Phaserorgel | tasten | Single |  | eigenes Rezept |
| G09 | Tiefzirkel | bass | Single |  | eigenes Rezept |
| G10 | Raumpuls | bewegung | Single | Seq, Delay-Sync | eigenes Rezept |
| G11 | Hallchor | chor | Single |  | eigenes Rezept |
| G12 | Flangerlead | lead | Single | Delay-Sync | eigenes Rezept |
| G13 | Weichwolke | blaeser | Single | Delay-Sync | eigenes Rezept |
| G14 | Wellenhall | wseq | Single | Seq, ≈ Welle, Delay-Sync | eigenes Rezept |
| G15 | Echobass | bass | Single | Delay-Sync | eigenes Rezept |
| G16 | Laserschuss | effekt | Single | Delay-Sync | eigenes Rezept |
| H01 | Polyfarbe | hart | Single |  | eigenes Rezept |
| H02 | Datenstrom | effekt | Dual | Delay-Sync | eigenes Rezept |
| H03 | Sternfläche | flaeche | Single |  | eigenes Rezept |
| H04 | Bassquinte | bass | Split | Delay-Sync | eigenes Rezept |
| H05 | Holzflöte | lead | Single | Delay-Sync | eigenes Rezept |
| H06 | Filterwerk | seq | Single | Seq, Delay-Sync | eigenes Rezept |
| H07 | Zeitsprung | effekt | Single | ≈ Welle, Delay-Sync | eigenes Rezept |
| H08 | Kammerpuls | tasten | Single |  | eigenes Rezept |
| H09 | Vokalchor | vocoder | Vocoder | Halten | eigenes Rezept |
| H10 | Vokal O | vocoder | Vocoder | Halten | eigenes Rezept |
| H11 | Vokalwah | vocoder | Vocoder | Delay-Sync, Halten | eigenes Rezept |
| H12 | Vokalpuls | vocoder | Vocoder | Arp, Halten | eigenes Rezept |
| H13 | Stimmwandel | vocoder | Vocoder | Halten | eigenes Rezept |
| H14 | Robotergruß | vocoder | Vocoder | Delay-Sync, Halten | eigenes Rezept |
| H15 | Eingang | eingang | Single | Delay-Sync | eigenes Rezept |
| H16 | INIT MS 2000 | effekt | Single |  | INIT |

## MK8-fix (26.10.) – Namensfeld im Sichern-Fenster per Finger

- Fehler (QA, major): Im MS 2000 „Sichern · Platz wählen“ (`.pop.mk8w`) fing ein Tipp auf das Namensfeld nicht den Fokus –
  `MKF.savePop` hatte `guardTouch(p)` auf dem ganzen Fenster, dessen touchstart-`preventDefault` auch das Eingabefeld traf.
  Auf dem iPhone kam keine Tastatur, der Name blieb „Klarer Ruf“ und das Programm wurde als „A05:Klarer Ruf 2“ geschrieben.
  Nachgestellt mit Touch (page.tap und CDP Input.dispatchTouchEvent) in P1, P3, L1, L2 an MK8.html: 8/8 kein Fokus.
- Behoben: `guardTouch` entfernt (wie beim VA-Sichern-Fenster); Tasten handeln weiter über `onTap` (pointerup), der
  Tap-Schutz von `closePop`/`UI.ghost` schluckt den Folge-Klick nach „Auf … schreiben“. Der erste Fokus markiert den
  vorgegebenen Namen (Tippen ersetzt ihn, wie im VA-Fenster). Nebenbei scrollt das Fenster in P3/L2 jetzt per Finger.
- Nachweis: `dirigent-test/v3-mk8fix-name.mjs` (P1, P3, L1, L2 × page.tap/CDP, echte Schrift Barlow Semi Condensed,
  Feld 16 px = kein iOS-Zoom): Fokus ja, Wert „Mein Lead“, geschrieben als „A05:Mein Lead“, Platz-Tasten per Finger,
  kein Durchklick, 0 Konsolenfehler – 8/8 OK. `v3-qa8-inp.mjs`/`v3-qa8-inp2.mjs` grün, `v3-mk8-ui.mjs` 43 PASS / 0 FAIL,
  Smoke ohne Fehler. Keine Datenbankänderung. Snapshot: `synq-snapshots/MK8-fix.html`.


## G-MKP8-merge — Zusammenführung · App **4.17.0** (`APP_CODE` 4 017 000) · Format 5 · keine Server-Änderung

**Zusammengeführt** (echter 3-Wege-Merge, `git merge-file`, Basis `mk-base-D.html` = 4.15.0): Hauptlinie (4.15.0 mit
G-MK567-merge-fix) ← **MK-P** (`mkp-snap-1627.html`, 4.16.0) ← **MK8** (`mk-br-MK8/index.html`, 4.17.0, mit MK8-fix).
Sicherung vorher: `mk-wt/index.html.vor-merge-G-MKP8-merge.html`. Größe 3 109 877 B (+92 173 B gegen 4.15.0: MK-P +40 376,
MK8 +45 659, G-MK567-fix +2 128, Naht und Vocoder-Behebung ≈ +4 KB). Der Weg ist Teil G Nr. 18 **„Kommt MK-P zuerst“**:
das Ergebnis ist das reine MS-2000-Bedienfeld (kein Knoten, keine Funktion, kein Text des alten Bedienfelds; MK-P-15).

### Konflikte und wie sie gelöst sind
1. **`setv` (MK-P × G-MK567-fix):** MK-P hat `setv` als `switch` neu geschrieben (MODUS = `mode4` auf Seite 01), die
   Hauptlinie hatte im alten Zweig `mode` „Wechsel auf Vocoder bricht eine laufende AUFN. ab“. Gelöst: MK-P-Fassung,
   der AUFN.-Abbruch steckt jetzt in `case 'mode4'` (vor `mkSetP`).
2. **Altes Bedienfeld (MK-P × G-MK567-fix):** MK-P entfernt `rotGesture`/`rotList`/`soloSet`/`timReset`/`leave`/`timbreKey`
   des alten Bedienfelds, die Hauptlinie hatte in `rotList` die dunkle Zeile „SEQ – nicht im Vocoder“. Gelöst: MK-P-Seite
   (Abbau, H-18). Das Verhalten bleibt erhalten: auf der Platte ist im Vocoder SEQ EDIT = CH PARAM, die SEQ-LED aus, und die
   Worklet-Teile des G-MK567-fix (`sqPrep` mode ≠ 3, `sqMode`, keine AUFN. im Vocoder, fusionierte Vocoder-Bänder) sind
   ohne Konflikt übernommen (Worklet = Hauptlinie + nur MK-P `sqInfo`; `vg567-vocbit` max |Δ| 0).
3. **`VERSION` (MK-P × MK8):** 4.16.0 / 4.17.0 → **4.17.0** (die höchste).
4. **Hilfe-Zeilen (MK-P × MK8):** MK-P hat die MS-2000-Hilfe neu geschrieben (19 Zeilen ohne altes Bedienfeld), MK8 hatte
   die alten Zeilen + „Programm-Speicher“. Gelöst: alle MK-P-Zeilen, dazu MK8s Zeile „Programm-Speicher“ auf die Platte
   umgeschrieben (BANK ▼ ▲, SELECT 1–16, −/NO +/YES, ‹ ›, Bank ▾, WRITE, WERKSKLANG ZURÜCK (UTILITY)).

### Naht MK-P ↔ MK8 (Teil G Nr. 18, MK8 Umfang 5/6, MK8-09 mit MK-P)
- `mkPanelProg` (MK-P) nutzt das Objekt `window.mkProg` (MK8): **BANK ▼ ▲** → `mkProg.bank(±1)` (bleibt an A/H stehen,
  Anzeige Zeile 2 „BANK      B“ für 1,2 s), **SELECT 1–16** im Spielen → `mkProg.select(bank, n)`, **−/NO +/YES** im
  Spielen → `mkProg.step(∓1)` (bleibt an A01/H16 stehen, „Anfang · A01“/„Ende · H16“), **WRITE** → `MKF.savePop` (Platzwahl,
  Vorgabe = geladenes Programm), **WERKSKLANG ZURÜCK** auf Seite 26 (Synth) bzw. 20 (Vocoder) UTILITY → `mkProg.restore`.
  Anzeige Zeile 1 „A01:Name“ aus `current().label`, LED der SELECT-Taste des geladenen Programms (nur wenn die gewählte Bank
  die des Programms ist; das Lauflicht hat Vorrang). Je Laden/WRITE/WERKSKLANG ZURÜCK genau ein Undo (wie MK8).
- Ein von außen geladenes Programm (Bibliothek, ‹ ›, Undo) stellt die BANK der Platte auf seine Bank (wie am Gerät).
- `MKF.cur` rechnet `edited` erst beim Lesen (Getter): die Platte fragt `current()` je Zeichnen, ohne `soundHash` je Bild
  (Leistung). `window.mkProg.mk8 = true` kennzeichnet das echte Objekt (Attrappen in `v3-mkp-prog.mjs` bleiben möglich).
- Nach WRITE/WERKSKLANG ZURÜCK zeichnet die Platte sofort neu (`MKUI.progRefresh` in `headRefresh`; vorher stand die LED
  bis zur nächsten Geste auf dem alten Platz – im neuen Test gefunden).

### Behoben: „man hört nichts“ im Vocoder (Xander 26.10., Gerätetest 4.15.0)
- Ursache: Umschalten auf Vocoder ließ E2 leer → kein Modulator → stumm, ohne Hinweis.
- Jetzt wie am Gerät (AUDIO IN 2 = Mikrofon ist der Modulator): `mkVocAutoMic(i)` – wird ein Klang zum Vocoder (01 COMMON
  MODUS über −/NO +/YES oder Liste, oder ein Vocoder-Programm H09–H14 bzw. eine Vocoder-Bibliothekszeile wird geladen) und E2
  ist leer, wird **E2 = Mikrofon** gesetzt und `vocMicStart()` gestartet. Der Eingang gehört zum **selben Undo-Schritt**
  wie der Moduswechsel/das Laden (`commitSound` nimmt `UI.mkInJoin` als Gruppe `sound` + `mkin`; WERKSKLANG ZURÜCK ebenso).
- Ohne Mikrofon (`micAvail()` falsch, z. B. Claude-Vorschau im iframe): kein stilles Umschalten mehr, sondern LCD
  „VOCODER · Mikrofon nur auf der GitHub-Seite“ und auf der Platte „MIKRO NUR GITHUB“ (4 s). Startet das Mikrofon nicht
  (Erlaubnis verweigert), sagt die LCD „Mikrofon nicht verfügbar · E2 in GLOBAL 1B wählen“.
- Nebenbei (MK-P): MODUS über −/NO +/YES war kein Sound-Undo (`mode4` stand in `VIEWP`); jetzt ein Undo wie über die Liste.
- Hilfe-Zeile Vocoder ergänzt („ist E2 leer, wird beim Umschalten das Mikrofon E2“).

### Abnahme (Chromium 1243; der Pfad 1194 fehlt hier; Ausgaben `scratchpad/gm8out/`)
- Rauchtest ohne Fehler (`dirigent-test/g-mkp8-smoke.png`), keine Konfliktmarken, „MS 2000“ genau 1×, kein Korg-Name.
- **MK-P** (alle nach den letzten Änderungen neu gefahren): `v3-mkp-funk` 0 Fehler, `v3-mkp-gesten` 0, `v3-mkp-lauf` 0,
  `v3-mkp-platz` 0, `v3-mkp-aussehen` 0, `v3-mkp-extra` 0, `v3-mkp-close` 0, `v3-mkp-trim` 0, `v3-mkp-prog` 0 (Attrappe),
  `v3-mkp-mk7inputs` 24/24, `v3-mkp-daten` 1 Fehler = **überholt**: „Quelltext `normalizeSound` gleich 4.15.0“ – MK8 nimmt
  absichtlich `bank`/`slot` auf (alle 12 Klänge bitgleich, 95 Plattenwerte gleich, Projekt deep-equal).
  `v3-mkp-mk1ui` (MK1-20/22/31/34) und `v3-mkp-mk7ui` (MK7-13-PLATZ, MK7-BED) scheitern genau wie auf dem MK-P-Zweig selbst
  (alte Bedienfeld-Wege `setWahl`/`toSpiel`; im MK-P-Changelog als umgestellt beschrieben).
- **MK8:** `v3-mk8-daten` 0 Fehler; `v3-mk8-pegel` MK8-04 bestanden, LUFS/True Peak aller 128 Programme **identisch** zum
  MK8-Zweig (`v3-mk8-pegel.json` danach wiederhergestellt); `v3-mk8-ui` 36 PASS / 2 FAIL = **überholt**: M-PLATZ L1/L2 tippt
  „Sichern“ im Blattkopf, den es quer mit MK-P nicht mehr gibt (44-px-Kopfzeile, H-17) → neu `gmkp8-mk8-platz-quer.mjs`
  (WRITE der Platte, Bibliothek über die Anzeige, L1/L2/926×428) **9/9**; `v3-mk8fix-name` aus demselben Grund in L1/L2
  → Kopie `gmkp8-mk8fix-name.mjs` (quer über WRITE der Platte) **8/8 OK**.
- **ABNAHME MK8-09 mit der Platte** (`gmkp8-mk8-09-platte.mjs`, CDP-Touch auf der Gesamtansicht L1): **27/27** – Anzeige
  „A01:Name“, LED, BANK ▲ ▼ mit Enden, SELECT lädt mit einem Undo + Toast [Rückgängig], Undo deep-equal, −/NO +/YES mit
  Enden, WRITE von der Platte (Vorgabe C02 → D07, andere 127 Plätze gleich, ein Undo, Undo deep-equal, D07 lädt danach den
  eigenen Klang), WERKSKLANG ZURÜCK auf Seite 26 und (Vocoder) 20 UTILITY mit einem Undo und deep-equal, EXIT → „H09:Name“.
- **Vocoder mit Mikrofon** (`gmkp8-voc-mic.mjs`, `--use-fake-device-for-media-stream --use-fake-ui-for-media-stream`):
  **8/8** – INIT → EDIT, SELECT 1, Anzeige, „Vocoder“ → Taste halten: **hörbar (bis −17 dBFS)**, E2 = mic, Mikrofon läuft,
  ein Undo (Gruppe sound + mkin), Undo deep-equal (Synth, kein Eingang, Mikrofon aus); H09 bekommt E2 = mic mit einem Undo
  und klingt; im iframe Hinweis statt Stille. Gegenprobe MK-P 4.16.0: derselbe Weg bleibt stumm (−∞ dBFS, E2 leer).
- **Hauptlinie / frühere Pakete:** `v3-mk7-voc` 37/37, `v3-mk6-seq` 36/36, `v3-mk4-fx` 61/61, `v3-mk3-scale` 6/6,
  `v3-mk2-marke` alles PASS, `v3-mk1-probe` bestanden, `vg567-seqvoc` max |Δ| 0, `vg567-seqvoc2` SEQ im Vocoder aus,
  `vg567-seqvoc3` Synth ↔ Vocoder (die Listen-Zeile des alten Bedienfelds gibt es nicht mehr – überholt), `vg567-vocbit` gegen
  die Hauptlinie max |Δ| 0, `gmk567-keysync` 4/4; `v3-mk5-arp` 78/79 (MK5-02 „live zweimal“, bekannt wackelig);
  `v3-mk3-timbre` 29/30 (MK3-07 gegen 4.10.0 – identisch auf 4.15.0 und der Hauptlinie, kein Merge-Effekt);
  `v3-mk1-format` 18/21 (die drei 4.8.1-Prüfungen, überholt wie in MK8 beschrieben). `v3-mk7-cpu` nicht gefahren: das
  Worklet unterscheidet sich von der Hauptlinie nur in `sqInfo` (Lauflicht-Felder), die DSP ist bytegleich.

### Offen
- MK-P-09 Leistung ×4 und das Budget von MK-P (siehe MK-P); iPhone-Punkte von MK-P und MK8 (am Gerät).
- Am Gerät prüfen: Umschalten auf Vocoder fragt jetzt nach dem Mikrofon (Safari-Erlaubnis); Kabel-Kopfhörer gegen Rückkopplung.
- Ohne MK8 gebliebener Rückfallweg in `mkPanelProg` (eigene Sounds in Gruppen à 16) bleibt nur für Attrappen-Tests.

### Datenbank / Am Server offen
- Nichts (Format 5, `APP_CODE` 4 017 000 ≤ Wächter 4 021 000). Kein Supabase-Aufruf.

Snapshot: `synq-snapshots/G-MKP8-merge.html`.

## G-MKP8 Farbe (26.10.) – Blech blau-metallic nach Xanders Fotos

- Xander (Gerätefotos, 7 Stück): „der MS 2000 ist viel blauer“. Gemessen (Median der blauen Fläche je Foto): Farbton H 199–210°,
  Sättigung 0,7; helle Studiofotos #28678f / #2c799c, Sonnenlicht #1a3b5b, Pressefotos dunkler (#11374f … #24384b).
- Blech jetzt `--mkp-metal` = Verlauf hsl(203 55% 38%) → hsl(206 58% 26%), Rand hsl(207 55% 16%), Aufdruck weiß (#e8eef3),
  inverse Felder hell mit blauer Schrift; Streifen-Textur entfernt. SPIEL-Tasten behalten dunkle Schrift auf Hellgrau.
- Nur CSS im Block `sq-mk-src`; Klang und Bedienung unverändert. Smoke X/P1 ohne Fehler.
- Regler wie am Gerät (Xander: „das sind ja nur Kreise“): schwarze Kappe mit geriffeltem Rand (repeating-conic), gewölbte
  Oberseite, fester Glanzpunkt (dreht nicht mit, `.mkpk::after`), weißer Strich auf der Oberseite, Schlagschatten; Tasten mit
  Schatten und heller Kante. Nur CSS; beim Drehen wird weiter nur `transform` der Kappe geändert.
- Nachtrag (Xander: „das Blau wirkt dunkler“): Blech dunkler, hsl(205 58% 31%) → hsl(208 62% 20%) (näher an Sonnenlicht-/Pressefotos
  #1a3b5b … #24384b), Rand hsl(209 58% 12%). Regler: feinere Riffelung, Fase am Rand der Oberseite, Schatten unten, stärkerer
  fester Glanz.
