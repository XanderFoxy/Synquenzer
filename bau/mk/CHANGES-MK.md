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
