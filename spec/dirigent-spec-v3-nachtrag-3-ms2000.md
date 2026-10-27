# SYNQUENZER v3 — Nachtrag 3 zur Bau-Spezifikation: MS2000-Klangerzeuger (Pakete MK0–MK8 und MK-P)

Stand 26.10.2026, **Rev. 3 „reiner MS 2000“** (Xander, 26.10.: „Wir bauen den MS 2000, nicht den microKORG … ich möchte kein Hybrid haben“), nach Rev. 2 vom 25.10. und dem Paket MK-P vom 26.10.; alle Protokolle am Ende. Status: **gilt für den Bau** (Xander will, dass der Bau nie auf seine Freigabe wartet; er sieht das Ergebnis danach). Xanders Entscheidungen stehen in Teil H und sind verbindlich; für die offenen Fragen H-13, H-17 und H-18 gilt bis zu seiner Antwort die genannte **Vorgabe**. Builder und Tester lesen Spec v3, Nachtrag 1, Nachtrag 2 **und** diesen Nachtrag. **Vorrang für die MK-Pakete: Nachtrag 3 vor Nachtrag 2 vor Nachtrag 1 vor Spec v3.** Alles, was hier nicht geändert wird, bleibt gültig: L1–L10, M-Messverfahren und DoD der Spec, Teil J (Fach-Prüfung), EN2-28 (Größe), E.5 (Bau-Regeln).

## Überblick (für den Orchestrator)

- **Auftrag (Xander, 26.10.):** „Wir bauen den MS 2000, nicht den microKORG … ich möchte kein Hybrid haben, ich möchte nur den reinen MS 2000 haben. Wir können die Presets vom microKORG gerne nachrüsten … aber der Bau soll der MS 2000 sein.“ Rev. 3 macht diesen Nachtrag deshalb zu einem reinen MS2000-Plan. Grundlage ist nur noch HB-MS. Gestrichen sind das Bedienfeld nach der alten Vorlage samt Drehschalter-, Fünf-Regler- und SHIFT-Logik, die Genre-Bänke und die RADIAS-Pakete MK11–MK13 (nie gebaut). microKORG-Programme passen auf dieselbe Engine und kommen höchstens später als Import (MK9, A.11).
- **Stand:** MK0–MK7 sind gebaut und ausgeliefert: MK0 4.8.1, MK1–MK7 4.9.0–4.15.0. MK5–MK7 sind in **4.15.0** zusammengeführt (3 017 704 B). Offen sind zwei Pakete, die parallel gebaut werden: **MK-P** (Bedienfeld wie der MS2000) und **MK8** (Programm-Speicher A–H × 16). Ihre Versionen folgen der Lieferreihenfolge, **4.16.0** und **4.17.0** (Vorgabe: MK-P zuerst; E.1). Danach kommen die übrigen Pakete ab 4.18.0.
- **Zurückgestellt:** MK9 (Import; kein Rechner, kein MIDI, EN3-21) und MK10 (eigene Wellen-Aufnahmen; es gibt kein Gerät, Xander 26.10.). Die 64 in MK2 nachgezeichneten Speicherwellen sind die eingebauten Wellen.
- **Plan:** 10 Pakete (MK0–MK8, MK-P), zusammen ≈ 101–117 h Bauzeit und +428 KB Budget. Offen sind davon MK-P mit 21–25 h und +28 KB und MK8 mit 13–15 h und +60 KB, mit Fach-Prüfung ≈ 36–44 h. Das Speicherformat stieg einmal, mit MK1 (4 → 5). MK0 sorgt dafür, dass kein ausgelieferter Stand Klänge einer neueren Engine verwirft oder überschreibt (EN3-04).
- **Name und Aussehen:** Die Klangerzeugung heißt in der App **„MS 2000“** (H-4). Ihr Bedienfeld ist die Vorderseite des MS2000 nach der Zeichnung HB-MS S. 5 (MK-P): hell blau-silbernes Metall, jeder Wert mit eigenem Regler bzw. eigener Taste, die übrigen Werte auf den LCD-Seiten wie am Gerät. Der Aufdruck ist englisch wie am Gerät (H-16, entschieden 26.10.), die Anzeige hat dunkle Zeichen auf gelbgrünem Licht. Kein Korg-Name, kein Logo, keine Korg-Schrift (EN3-05).
- **Bedienung am iPhone 12 Pro Max (Xander, 26.10.):** Quer ist die ganze Platte auf einmal zu sehen (≈ 708 × 363 px) und direkt spielbar: Ein Finger trifft das nächste Bedienelement. Ein Tipp auf eine Sektion zoomt weich hinein. Der Zoom rastet ein und bleibt, bis Xander oben die kleine Karte der ganzen Platte antippt. ◀ ▶ und Wischen gehen den Signalfluss entlang wie bei Cubasis Micrologue (OSC 1 → OSC 2 → MIXER → FILTER → AMP → EG 1/EG 2 → LFO 1/2 → EFFECTS → ARPEGGIATOR → MOD SEQUENCE → VIRTUAL PATCH). Gezoomt wird immer die echte Platte in derselben Optik und nur innerhalb eines festen Rahmens; die Seite springt nie und wächst nie nach unten. Läuft der Mod-Sequenzer, leuchten die SELECT-Tasten 1–16 nacheinander, und in SEQ EDIT setzen die 16 Regler die Schrittwerte, wie am Gerät (MK-P).
- **Programme:** 128 Programme in den Bänken A–H mit je 16, wie am MS2000, alle mit eigenen Werksklängen (keine Korg-Daten) und geordnet wie am Gerät (MK8).
- **Nur iPhone (Xander, 25.10.):** Kein Paket verlangt einen Rechner, MIDI oder eine Datei vom Rechner (EN3-21). Xander arbeitet nur am iPhone 12 Pro Max.
- **Größe (H-1):** 4.15.0 hat 3 017 704 B. Die Pakete V2e … MK7 lagen zusammen bei ×1,22 ihres Budgets. Nach MK-P und MK8 sind es ≈ 3,11–3,15 MB. Der ganze Restplan endet nach Budget bei ≈ 5,5 MB, mit ×1,5 bei ≈ 6,8 MB. Die Grenze von 5,0 MB (EN2-28) fällt mit ×1,5 bei ≈ V4e, 4,5 MB bei ≈ V7c. Lösung nach H-1 (b): das Schlankheits-Paket SL1 (E.3a).
- **Was wiederverwendet wird:** der Stimmenpool von AnalogCore mit Ereignisprotokoll, Tempo, 30-ms-Stimmenblende, 40-ms-Engine-Blende und Lastbericht. Dazu Ladder-Filter mit 4 der 6 Abgriffe, polyBLEP-Säge/-Puls/-Sync, Hüllkurven-Kern, LFO-Formen und Mod-Matrix. Außerdem das Mipmap-Verfahren aus V4a (für AM als gemeinsamer, DOM-freier Tabellen-Bau nach Spec §10.1 neu gebaut, MK2), `MIC_ASK` und die Wege-Erkennung aus VS1 (mit einem gemeinsamen Mikrofon-Abgriff, MK7), die Oktav-Wahl der Tastatur (`tr.kbOct`), der MIDI-Eingang (nur als freiwillige Zugabe am Desktop), sowie Bibliothek, Undo, Blatt-Rahmen und Regler-Gesten. Neu ist alles, was A.12 nennt (Teil A).

---

## N3.0 Grundlagen

### N3.0.1 Xanders Plan (24.10.2026; Stand 26.10., verbindlich)

**26.10. (Xander, wörtlich):** „Wir bauen den MS 2000, nicht den microKORG … ich möchte kein Hybrid haben, ich möchte nur den reinen MS 2000 haben. Wir können die Presets vom microKORG gerne nachrüsten … aber der Bau soll der MS 2000 sein.“ Kurz danach: Eine microKORG-Oberfläche oder RADIAS-Teile hat er nie gewollt. Grundlage ist deshalb nur noch das MS2000-Handbuch (HB-MS).

1. **Kern = kompletter MS2000-Klangerzeuger:** 2 Oszillatoren mit allen Wellenformen und Modi inkl. Ring/Sync, Rauschen, Mixer, Filter mit allen Typen, 2 Hüllkurven, 2 LFOs, 4 virtuelle Patches, 2 Timbres (Dual/Split), Stimmen-Modi, Mod-FX, Delay, EQ, Mod-Sequenzer 3×16, 16-Band-Vocoder und Arpeggiator. Gebaut in MK1–MK7.
2. **Oberfläche und Programme wie am MS2000** (26.10.; ersetzt „wiedererkennbar wie microKORG, Preset-Bänke nach Genres“): Das Bedienfeld folgt der Vorderseite des MS2000 und wird bedient wie am Gerät, mit einem Regler bzw. einer Taste je Wert, LCD-Seiten und SELECT 1–16 (MK-P). Es gibt 128 Programme A–H × 16 mit eigenen Klängen (MK8). **Kein Korg-Name, kein Logo, keine Werksdaten von Korg im Werk**; sichtbar heißt die Engine „MS 2000“ (H-4). microKORG-Programme passen auf dieselbe Engine und kommen höchstens später als lokaler Import eigener Dateien (MK9, zurückgestellt; nie hochladen, nie mitliefern, EN3-08).
3. **Speicherwellen:** Die 64 aus Bildern nachgezeichneten Wellen (MK2, „≈“) sind eingebaut. Eigene Aufnahmen (MK10) ruhen, weil es kein Gerät gibt (26.10.).
4. **Gestrichen (26.10.):** die RADIAS-Teile (früher MK11–MK13: 2. Filter, Verzerrer, 3. Hüllkurve, Formant-Oszillator, 8 Stimmen).
5. **Muss auf dem iPhone 12 Pro Max flüssig laufen.** Dazu gehören ein Stimmen-Budget, CPU-Messung und AudioWorklet, wo nötig. WebGL nur, wo es wirklich etwas bringt. Dateigrenze 5,0 MB gesamt (EN2-28).
6. **Reihenfolge** (Nachtrag 2, „Korrektur 24.10.“, fortgeschrieben): G-P1b → G-P2 (V2d′ ✓, V2e ✓, V2e′ ✓; VS3 wartet auf das Tor N7V-12) → **MS 2000** (MK0–MK7 ✓, dann MK-P und MK8 parallel) → V2a′, V2c′ ✓, V2f, VL, V7a, VC2a, VS4 …

### N3.0.2 Quellen und Kürzel

| Kürzel | Quelle | Seitenangabe |
|---|---|---|
| **HB-MS** | `scratchpad/manuals/ms2000.txt`, MS2000/MS2000R Owner's Manual (83 S.) | gedruckte Seitenzahl „S. 39“. PDF-Seite = S. + 6 |
| **HB-MK** | `scratchpad/manuals/microkorg.txt`, microKORG Owner's Manual (nur für die Namensprüfung, EN3-07, und einen späteren Import, A.11, MK9) | gedruckte Seitenzahl. PDF-Seite = S. + 6. Die Listen am Ende (Voice Name List, Parameter List) haben keine Seitenzahl: „PDF 77/78“ |
| **KF** | `/home/user/synquenzer/forschung/r9/korg-familien.md` (Recherche 24.10.) | Kennungen [B]/[W]/[U] wie dort |
| **N2** | `v3-ideen/dirigent-spec-v3-nachtrag-2.md` | Teil J, EN2-28, E.4, E.5, „Nachtrag zur Reihenfolge“, Synth-Plan |
| **App** | `scratchpad/dirigent-wt/index.html`, Stand V2d′ = **4.6.0**, 2 473 307 Byte, gelesen am 25.10. | Zeilennummern „Z. 3887“ beziehen sich auf diese Datei |
| **App 4.15.0** | `scratchpad/mk-wt/index.html`, MK0–MK7 gebaut, 3 017 704 Byte, gelesen am 26.10. | Grundlage für MK-P und MK8 |

- **Urheberrecht:** Aus den Handbüchern sind nur Fakten übernommen: Parameternamen, Wertebereiche, Tabellenwerte, Reihenfolgen. Es gibt keine Textpassagen. Die Handbücher bleiben privat: nicht im Repo, nicht in der App, nicht in Hilfe-Texten.
- **Kennzeichen:** **[B]** belegt (Handbuch mit Seite) · **[W]** wahrscheinlich · **[U]** unbelegt · **eK** eigene Festlegung. Jede eK-Kurve steht genau einmal in der W-Tabelle (B.2). Ein späterer Abgleich ändert dann nur diese Tabelle.
- **Nicht möglich:** Es gibt keinen Korg-Formatbeleg für SysEx-Programmdaten: HB-MS S. 64 verweist auf eine eigene „MIDI Implementation“, die nicht im Handbuch steht. Daraus folgt das Tor für MK9 (zurückgestellt). Kein Klang wurde angehört, nichts wurde am iPhone gemessen. Es gibt weder ein Gerät noch ein Foto (Xander, 26.10.). Vorlage des Bedienfelds ist die Strichzeichnung der Vorderseite in HB-MS S. 5 (PDF 11); S. 6–9 erklären die Elemente (MK-P).

### N3.0.3 Neue Entscheidungen

| # | Entscheidung | Begründung |
|---|---|---|
| **EN3-01** | **Geltung.** Dieser Nachtrag regelt die Pakete MK0–MK8 und MK-P (MK9 und MK10 zurückgestellt) und ihre Reihenfolge. Bei Widerspruch gilt er vor N2, N1 und Spec. Die bestehenden Pakete werden nur in Teil G berührt, und zwar nur als Hinweis oder als Versionsnummer. | Auftrag „Bau-Spezifikation MS2000“. |
| **EN3-02** | **Eigene Engine `mk` als Zweig `eng 3` in AnalogCore**, nicht als Erweiterung der VA-Engine. `eng 2` ist schon für die Tabellen-Engine von V8a vergeben (Spec §10.1, V8a); AM nimmt deshalb die nächste freie Nummer. Der Stimmenpool (`POOL` 12), das Ereignisprotokoll, das Tempo, die Stimmenblende (SXF, V4a), die Engine-Blende (`engXf`), die Last-Berichte und der Ladder werden mitbenutzt. Die VA-Klänge bleiben bitgleich. | Die MS2000-Logik weicht von VA ab: zwei Timbres, Wellen-Algorithmen mit CONTROL 1/2, Ganzzahl-Einheiten, Unison als Stimmenstapel. Ein Umbau von VA würde gespeicherte Klänge gefährden (I-10, L7). |
| **EN3-03** | **Daten in Geräte-Einheiten.** `p.mk` speichert Ganzzahlen genau in den Bereichen der Handbücher (000…127, ±63, Listen-Indizes). Die Umrechnung in Hz, s und ct macht nur die W-Tabelle (B.2). **Während einer Geste** geht der ungerundete Reglerwert (Bruchteil einer Geräte-Einheit) an das Worklet; gerundet wird erst beim Abschluss der Geste und für Undo (B.6 Nr. 2). | Import 1:1 (MK9), prüfbare Bereiche, ein Ort für Kurven-Abgleich. Ganzzahlen allein gäben beim Drehen Stufen von ≈ 0,94 HT (Cutoff), die bei hoher Resonanz als Tonleiter hörbar sind. |
| **EN3-04** | **Speicherformat 5 mit MK1, Vorab-Schutz mit MK0.** `PROJECT_FORMAT` 4 → 5 und `SOUNDS_FORMAT` 1 → 2 kommen mit MK1. Heute verwirft `normalizeSound` (Z. 7918, `if (!engine) return null`) eine unbekannte Engine. Ein 4.x-Stand (Paar-Raum-Partner, alter `sw.js`-Cache, Rückfall) ersetzt AM-Sounds deshalb stillschweigend und speichert danach per Autosave Format 4 über das Projekt, lokal und online. Die Meldung „Projekt aus einer neueren Version“ (Z. 8163) kommt nur beim Datei-Import von Hand. **MK0** (4.8.1, vor MK1) behebt das: Ein Sound mit unbekannter Engine bleibt **undurchsichtig erhalten** (`engine`, `p`, `mods`, `fx` unverändert), die Spur spielt INIT mit Hinweis „Klang aus neuerer Version“. Enthält das KV-Projekt, die Bibliothek oder die Cloud-Bibliothek eine unbekannte Engine oder ein Format über `PROJECT_FORMAT`, überschreibt Autosave die KV-Kopie nicht, und die App schickt kein `cloudLibPush` einer Liste ohne diese Sounds. Damit brauchen auch die später geplanten Engines (`mask`, `add`, `body`, `resyn`; V8a, V9a, V9b, V9d′) **keinen weiteren Formatsprung**. Neue Schlüssel sind neutral (I-10). `save_project` bleibt unverändert (VO-R1 lehnt ein kleineres `p_format` schon ab: `outdated` + `keep_conflict`); `save_library` hat keinen solchen Wächter und ist durch MK0 geschützt. Online braucht es `max_format` 5 und `max_app` je Version, jeweils nur mit Xanders Okay (N2 G.8), und erst nach MK0. | Daten-Sicherheit (L7) und Versions-Wächter VO-R1. Der Server-Wächter `max_app` ist nur eine Obergrenze (`greatest(max_app, 4005002)`) und hält ältere Stände nicht auf. Restrisiko: Stände vor 4.8.1 verwerfen weiter; darum der Rollout erst nach MK0 (E.5 Nr. 2). |
| **EN3-05** | **Keine Marken im AM-Teil, eine erlaubte Beschriftung.** Die Engine heißt sichtbar **„MS 2000“** (H-4, Xander 25.10.; Ersatz wäre „MS 2K“ gewesen). Genau diese Zeichenfolge (Großbuchstaben, ein normales Leerzeichen) steht **einmal** als Konstante `MK_LABEL = 'MS 2000'` im immer geladenen Teil (EN3-14); Engine-Knopf, `ENGINE_LABEL.mk`, Bibliotheks-Filter, LCD- und Hilfe-Zeilen setzen sie daraus zusammen. Sonst enthält der AM-Teil der ausgelieferten Datei (Block `sq-mk-src`, Block `sq-mkrec-src`, falls MK10 gebaut wird, AM-Zweig des Worklets zwischen festen Marken, AM-Hilfe- und LCD-Zeilen, AM-Werksnamen) keines dieser Wörter: Korg, microKORG, MS2000, MS-2000 und jede andere Schreibung von „MS 2000“, RADIAS, DWGS, DW-6000, DW-8000, VOX. Das gilt auch für Kommentare. In der **ganzen** Datei gilt das für die Korg-Gerätenamen microKORG, RADIAS und DWGS („MS 2000“ nur als die eine Konstante). **Kein Logo, keine Korg-Schrift** (MK-P, B.6 Nr. 9 c). Andere Pakete dürfen nach ihren eigenen Regeln Geräte im ⓘ nennen (N2 D.1 Nr. 4; V10P, V10d, VI3). Dieser Nachtrag nennt die Engine im Fließtext weiter **AM** (Arbeitsname, intern bleibt die Kennung `mk`); überall, wo ein sichtbarer Text, eine Beschriftung oder ein Prüf-Erwartungswert den Namen zeigt, steht **„MS 2000“**. Texte der App (LCD, Hilfe) tragen eigene deutsche Namen, zum Beispiel „Speicherwelle“, „Stimmwelle“ und „Bewegung aufnehmen“. Der Aufdruck der Platte ist englisch wie am Gerät (H-16) und nennt die zwei Markenwörter als STIMMWELLE und SPEICHERWELLE. Die Werksklänge tragen eigene Namen (EN3-07). | Xanders Plan Punkt 2 und seine Wahl vom 25.10. Ihm wurde gesagt, dass MS2000 ein Modellname von Korg ist; ein Risiko entstünde erst, wenn die App verkauft würde. Die App enthält heute 0 Treffer (geprüft). Eine Sperre aller Wörter über die ganze Datei würde spätere Pakete mit Geräte-ⓘ scheitern lassen. Eine einzige Fundstelle macht die Ausnahme prüfbar. |
| **EN3-06** | **Handbuch-Fakten nur in der Spec, nicht in der App.** Hilfe-Zeilen (L10) und ⓘ-Texte sind eigene Sätze. | Urheberrecht. |
| **EN3-07** | **Werksklänge = eigene Rezepte.** Eine Namensprüfung läuft gegen die Werks-Programmlisten (HB-MK PDF 77, HB-MS S. 67–69). Diese Listen stehen nur in einer privaten Datei neben den Handbüchern (`scratchpad/manuals/werksnamen.local.json`), nie im Testskript, im Repo oder in der App (E.5 Nr. 5). | Plan Punkt 2. Die Testskripte werden ins öffentliche Repo kopiert (`wip-push.sh` → `bau/tests/`). |
| **EN3-08** | **Import nur lokal** (gilt ab dem Bau von MK9; MK9 ist am 25.10. zurückgestellt, bis dahin gibt es keine 🔒-Sounds und keine Pflicht aus EN3-08/08a/19). Importierte Klänge tragen 🔒 (`loc: 1`); `normalizeSound` behält `loc` und `locRef` (MK9). Eine einzige Funktion `mkLocalStrip()` ist die **einzige Ausgangs-Schleuse**: Sie ersetzt 🔒-Sounds durch einen Platzhalter in **allen** Wegen, auf denen Daten den Speicher-Ursprung verlassen. Das sind Server-Autosave, `save_library`, Paar-Raum/Realtime, Mitmach-Link, Teilen und später VO3, VO4a–c, VC2b/VC2c, VC3/VC3b und VC4 (auch `sample` und `room.sendToClaudeSession`), Regel MK-R2 (EN3-19). Ausgenommen ist nur die eigene Übergabe Claude-App → Safari (`#import` aus `cloudHandoffUrl`), weil das Fragment nie einen Server erreicht (MK9 Umfang 5). Die Tests verwenden nur synthetische Dumps aus einem eigenen Schreiber. | Plan Punkt 2: „nie hochladen, nie mitliefern“. |
| **EN3-08a** | **🔒 steckt an.** Jede Sound- oder Spur-Kopie, die irgendwelche Daten aus einem `loc: 1`-Sound übernimmt, bekommt `loc: 1` und behält dessen `origin`: Timbre kopieren (MK3), Sequenz kopieren (MK6), A/B, Speichern als, Duplizieren, Laden in eine Spur, Kopieren aus der Bibliothek. `saveSound` löscht `loc`/`locRef` nie. | Sonst ginge ein abgeleiteter Sound über Autosave und `save_library` hinaus, obwohl jede Abnahme besteht. |
| **EN3-09** | **Speicherwellen:** Eingebaut sind die 64 in MK2 nachgezeichneten Wellen (additiv, mit „≈“ in der LCD; eingebaut sind nur selbst gerechnete Teiltonwerte, nie die Bilder). Eigene Aufnahmen (MK10) ruhen (26.10., kein Gerät). Wird MK10 später gebaut, gilt H-2: Eingebaut werden nur die **gerechneten Wellen** (Teiltonpegel und Phasen), nie Roh-Aufnahmen, und die Marken-Regel EN3-05 gilt auch im Datenblock (Salz-Byte, B.6 Nr. 9). | Xanders Entscheidungen vom 25.10. (H-2) und 26.10. Ihm wurde gesagt, dass die Lizenz der Wellen-Daten ungeklärt ist (wie EN2-11, DX7-ROM); das gilt auch für die Nachzeichnung. |
| **EN3-10** | **Ein Tempo.** Arp, LFO-Sync, Delay-Sync und Mod-Seq folgen dem Song-Tempo `S.bpm`. Das Feld `arp.tempo` (20…300) wird nur gespeichert, für Import und Anzeige. Es verhält sich wie am Gerät mit „Clock = External“ (HB-MS S. 45, HB-MK S. 44). | In einem Sequencer gibt es eine Uhr. Zwei Tempi würden auseinanderlaufen. |
| **EN3-11** | **Arp im Hauptfaden, Mod-Seq und Vocoder im Worklet.** Der Arp setzt zwischen Notenquelle und `spawnVoice` an (Z. 12610). Sein Planer läuft in `tick()` **vor** der Prüfung `R.playing` (Z. 13137), mit dem vorhandenen Vorlauf (`LOOKAHEAD` 0,1 s, Z. 12917), und schreibt `noteLog`. Er schickt dem Worklet zusätzlich den **Tastensatz** als eigenes Ereignis KEYS (Typ 9 = erste Taste gedrückt, Typ 10 = alle Tasten los, je mit Zeitstempel). Aufnahmen (● REC) speichern die **gespielten Tasten**, nicht die Arp-Noten (H-8, entschieden). Der Arp läuft auch im ECO-Klang (B.5). | M-ZEIT-Prüfung über `noteLog`. Die Ereignisse sind sampelgenau (16-Sample-Blöcke). Seq und Vocoder brauchen Stimmen- bzw. Audiotakt. Ohne KEYS sähe das Worklet nur Arp-Noten und setzte Key Sync „Timbre“ bei jedem Arp-Schritt zurück; das Gerät unterscheidet gespielte Tasten von Arp-Wiederholungen (HB-MS S. 43, S. 63). |
| **EN3-12** | **Stimmen-Budget:** 4 Stimmen je AM-Spur wie MS2000 (HB-MS S. 2). `vmax` bleibt fest 4; die 8-Stimmen-Erweiterung ist gestrichen. Der CPU-Begrenzer ändert nie Gespeichertes (I-08), Stufen in B.4. | Plan Punkt 5. |
| **EN3-13** | **Kein WebGL im AM-Bedienfeld.** Platte, Regler, Tasten, LEDs, die Anzeige und die Räder sind DOM mit CSS (Verläufe, Schatten, eigene kleine SVG-Formen), **ohne Bild-Dateien** (MK-P). Schritt- und Bandanzeigen der Zusatz-Ansichten (≤ 16 Säulen, ≤ 30 Hz, nur sichtbar) und die Karte (einmal je Format) zeichnet Canvas 2D. | WebGL lohnt erst bei Tausenden Elementen; bei ≈ 400 Elementen ist DOM mit Compositor-Transform am schnellsten (MK-P „Leistung“). Ein zusätzlicher GL-Kontext kostet Speicher und Startzeit auf dem iPhone. PE1 (rAF ≥ 55 fps) ist die Prüfung. |
| **EN3-14** | **AM-Code nachladen, Kern immer da.** Der Worklet-Teil steht im vorhandenen Worklet-Quelltext (ASCII). Im Hauptfaden gibt es zwei Teile. **(1) Immer geladen, klein, im oder vor `SQStore`** (wie FMX, CHANGES-V3): Engine-Eintrag `mk`, `MK_LABEL` (EN3-05), `normMk`, INIT AM, `mkToFlat`, ab MK9 `mkLocalStrip`, die `loc`/`locRef`-Behandlung und EN3-08a. **(2) Nachgeladen** als `<script type="text/plain" id="sq-mk-src">`: Bedienfeld, Räder, Arp, Werksdaten (MK8), Datenblock der Speicherwellen (MK2), Tabellen-Bau (`mkTables`, B.4), später der Import-Parser (MK9). **(3) Nur wenn MK10 gebaut wird:** nachgeladen als `<script type="text/plain" id="sq-mkrec-src">`: Aufnahme-Seite, WAV/AIFF-Leser und Wellen-Analyse; ausgewertet nur beim Öffnen von „Wellen aufnehmen“. Ausgewertet wird (2) beim ersten Bedarf: AM-Sound im geöffneten Projekt (dann **schon während des Ladens**, bevor der Transport starten kann), Engine-Knopf „MS 2000“, Bibliothek mit dem Filter „MS 2000“ oder Leistungs-Probe. Vor der Auswertung und vor jedem Entpack-Schub ruft die App `tickAhead(.3)` (Z. 13125); zwischen zwei Tabellen-Häppchen ≤ 8 ms liegt mindestens ein Scheduler-Tick. | Ladezeiten haben Vorrang (CLAUDE.md, Punkt 2). Projekte ohne AM starten wie bisher. Teil (1) muss beim Start und in jedem Upload wirken: Ein Engine-Block überlebt nur, wenn sein Modul da ist (Z. 7873), und `Library.load`/`Autosave.load` normalisieren jeden Sound beim Start (Z. 8247, 8340). Der Scheduler plant nur 100 ms voraus (Z. 12917): Ein Stillstand > 75 ms macht Noten auf allen Spuren spät, > 200 ms fallen sie aus. Block (2) lässt sich später als Ganzes packen (H-1). |
| **EN3-15** | **Zwei Eingänge je AM-Spur.** **E1** heißt „Instrument“ (MS2000 AUDIO IN 1), **E2** heißt „Stimme“ (AUDIO IN 2, Vocoder-Modulator). (Für den späteren Import von microKORG-Programmen: A.11 Nr. 4.) Jeder Eingang ist wählbar: Mikrofon (nur auf der Pages-Seite, über den gemeinsamen Mikrofon-Abgriff aus MK7, Start nur auf Tipp), eine andere Spur (Abgriff **vor** ihrem Fader, MK7) oder aus. Die Wahl gehört zur Spur (`tr.mkIn`), nicht zum Sound. | HB-MS S. 4, S. 38, S. 49. Das Mikrofon geht nur außerhalb der Claude-App (EN2-06). |
| **EN3-16** | **Geräte-Abgleich entfällt.** Xander hat kein Gerät (26.10.). Die eK-Kurven bleiben, wie sie sind; die Abgleich-Punkte der gebauten Pakete MK1–MK7 sind gegenstandslos. Kommt später ein Gerät dazu, ändert ein Abgleich nur die W-Tabelle, mit Wert und Grund in CHANGES (`MKn-fix`). | Ohne Gerät gibt es keine Referenz. Die Zeichnung HB-MS S. 5 belegt nur Lage und Aufdruck. |
| **EN3-17** | **Zwischenstände.** Artifact und Pages bekamen je einen Stand nach MK1, MK4 und MK7; dazu kommen je einer nach MK-P und nach MK8 (EN2-15 sinngemäß). | Xander will früh sehen und hören. Der Vocoder mit Mikrofon geht nur auf Pages (Safari), nicht in der Claude-App. |
| **EN3-18** | **Regel MK-R1:** Jeder neue stetige AM-Regler ist automatisch ein Ziel des Mod-Sequenzers (ab MK6) und ein Patch-Ziel, wenn A.5 es nennt. In das App-Mod-System (Halten → Mod-Picker, `MODT`) kommen AM-Regler erst mit V5d (MOD-R1). Als Pad-Quelle kommt AM erst mit V1d (PAD-R1). Weil MK jetzt **vor** V5d, V6a, V5b/c und V1d gebaut wird, werden die AM-Regler (2 Timbres mit je ≈ 60 stetigen Werten, dazu Seq und Vocoder) dort Pflicht-Ziele. **H-9 = ja** (entschieden 25.10.; Xanders Wunsch I4 „jeder Regler modulierbar“): Umfang, Abnahme, Stunden und KB dieser Pakete steigen (Teil G Nr. 4). | Die MS2000-Modulation (PATCH, SEQ) ist Teil des Plans. Das App-Mod-System ist es noch nicht (N1 EN-21). Die Pakete V5d ff. wurden ohne AM geplant. |
| **EN3-19** | **Regel MK-R2** (gilt erst, wenn MK9 gebaut ist): Jedes Paket, das **nach** MK9 einen Weg vom Gerät weg baut (VO3, VO4a–c, VC2b/VC2c, VC3, VC3b, VC4 inkl. `sample` und `room.sendToClaudeSession`), ruft `mkLocalStrip` auf. Seine FP-SICHER-Prüfung prüft das (Teil G Nr. 10). Wird MK9 später gebaut, rüstet MK9 selbst alle dann vorhandenen Wege nach (MK9 Umfang 5). | Die Liste in EN3-08 wäre sonst nur für heute vollständig. Solange MK9 zurückgestellt ist, gibt es keine 🔒-Sounds, also nichts zu strippen. |
| **EN3-20** | **Bedienfeld wie die Vorderseite des MS2000** (Xander, 25.10.: „genau so“; 26.10.: „genauso wie der MS 2000“, „kein Hybrid“). Vorlage ist die Strichzeichnung HB-MS S. 5 (MK-P): hell blau-silbernes Metall, jeder Wert mit eigenem Regler bzw. eigener Taste wie am MS2000, alle übrigen Werte auf den LCD-Seiten wie am Gerät (Seitenplan MK-P), Aufdruck englisch wie am Gerät (H-16). Nicht übernommen werden Name, Logo und Schrift von Korg (EN3-05). **Treffer:** Auf der Platte trifft ein Finger das nächste Bedienelement (MK-P „Treffer“); alles außerhalb der Platte hat Trefferflächen ≥ 44 × 44. Das Bedienfeld, das MK1–MK7 nach einer anderen Vorlage gebaut haben, ersetzt MK-P. | Xanders Wunsch: der reine MS 2000, quer die ganze Platte auf einmal sichtbar und direkt spielbar. Darum gilt auf der Platte das Nächstes-Element-Maß statt fester 44 px; der Zoom bringt größere Treffer. |
| **EN3-21** | **Nur iPhone, kein Rechner, kein MIDI.** Xander arbeitet nur am iPhone 12 Pro Max und kennt MIDI nicht; iOS Safari hat kein Web MIDI. Kein Paket darf einen Rechner, MIDI oder eine Datei vom Rechner verlangen. Darum ist **MK9 (Import .syx/.prg) zurückgestellt** (außerhalb der Versionsfolge, E.1), und Teil D beschreibt nur iPhone-Schritte. Der MIDI-Eingang für Bend/Mod-Rad bleibt eine **freiwillige Zugabe für Desktop-Browser**, nie nötig (MK1 Umfang 8); PITCH und MOD sind Touch-Räder (H-5). | Xander, 25.10. Auch die Prüfschritte, die Xander selbst macht (iPhone-Prüfpunkte), gehen am iPhone. |

### N3.0.4 Was die App schon hat (Wiederverwendung)

| Baustein | Ort in der App (4.6.0) | Nutzung durch AM |
|---|---|---|
| Worklet-Prozessor AnalogCore, `eng` 0 VA / 1 FM6, Stimmenpool `POOL` 12, Steuerblock `CR` 16 | Z. 3517–5226 | `eng 3` = AM (`eng 2` gehört V8a). Die Pool-Plätze 5–12 fangen wie bisher die Stehl-Blenden ab. Heute rechnet der Prozessor nur `if (any)` (Z. 5143); der Vocoder-Pfad läuft auch ohne Stimme (MK7) |
| Ereignisprotokoll `{ev: [[t, typ, id, a, b, c]]}`, `{tempo}`, `{load}`, `{end}` | Kopf Z. 3527–3543 | Die bestehenden Ereignisse bleiben byte-gleich. AM ergänzt: `{mk: p.mk}` (strukturierte Kopie bei Laden oder Engine-Wechsel; dazu `processorOptions.mk` beim Anlegen des Knotens, `SynthHost.track` Z. 9384), `{mkSet: {Pfad: Wert}}` (Gesten; gesammelt wie WKSET/WKFM und in `spawnWkVoice` vor jeder Note abgegeben, Z. 12571), `{mkw}` (Tabellen, B.4), `{mkIn}` (Eingänge), KEYS Typ 9/10 (EN3-11) und beim ON ein 7. Element `d` = Timbre-Maske (0 = Modus entscheidet, 1 = T1, 2 = T2, 3 = beide; alte 6-Element-Ereignisse gelten als 0; MK5). `wkFlat` reicht nur flache Zahlen weiter (Z. 12217) und genügt für `p.mk` nicht |
| Stimmenblende bei Strukturwechsel (SXF 30 ms, V4a/V4a-fix), Engine-Blende 40 ms (`engXf`) | Z. 3566–3579; `structXf` Z. 4046, `engXf` Z. 4104 | SXF: Welle, OSC MOD, Filtertyp, HK │ GATE. `engXf` (alte Stimmen als Geister ausblenden, gehaltene Tasten neu verteilen): Zuweisung, Priorität, Auslösung, MODUS, STIMMEN (B.6 Nr. 2) |
| polyBLEP-Säge/-Puls, Hard-Sync-Pfad | Z. 4474 ff. | OSC1 Säge/Puls, OSC2, Sync, RingSync |
| Ladder mit Abgriffen `FMIX` (LP24, LP12, BP24, BP12, HP24, HP12) | Z. 3557, `ladder()` Z. 5086 | MS2000-Typen 24LPF = 0, 12LPF = 1, 12BPF = 3, 12HPF = 5. Cutoff = Polfrequenz der Stufen (W-01); die Ladder wird nicht verändert |
| Hüllkurven-Kern `envCoefs`/`envBlock` | Z. 3866–3886 | EG1, EG2 |
| LFO-Formen `lfoVal` (Sinus, Dreieck, Säge, Rechteck, S&H), globale/je Stimme-Phase | Z. 4338 | LFO1/LFO2. Neu: Squ(+) unipolar, Key Sync „Timbre“ |
| Mod-Matrix (8 Plätze, Quellen/Ziele) | Z. 3559–3562 | PATCH 1–4 mit AM-eigenen Zielen |
| Tabellen-Wellen mit einer Mipmap je Oktave, Überblendung je Steuerblock (V4a, K2-40) | Worklet „Wave 0 … 11“ (Z. 3631–3673; beim Laden des Moduls gebaut) | Nur das **Verfahren**: AM bekommt einen eigenen, DOM-freien Bau `mkTables` im Hauptfaden (MK2, B.4), der zugleich der gemeinsame Tabellen-Bau nach Spec §10.1 ist. `waveTab` von V4a bleibt unverändert im Worklet. Nutzung: Speicherwellen und Endlos (die Stimmwelle wird live gerechnet, W-28) |
| Spur-Kette (Drive, Chorus, Trem, Duck, Vol, Pan, Hall-/Echo-Send) | `buildChain` Z. 12013 | unverändert **hinter** dem AM-Ausgang (Reiter FX). Abgriff für AM-Eingänge vor Vol/Pan (MK7) |
| ECO-Rückfall (NativeVoice), Badge | `trackEco`, Z. 12215 | AM → VA-Näherung (B.5) |
| Klang-Datenmodell, `normalizeSound`, `soundHash`, Bibliothek, INIT je Engine; Engine-Listen `ENGINE_LABEL`, Browser, `setEngineOf` | Z. 7739–8000, Z. 11060 ff.; Z. 11162, 24409, 24509, 20343 | Engine `mk`, `normMk`, INIT AM; `mk` in allen Engine-Listen (MK1); Feld-Listen für `bank`/`slot` (MK8), `loc`/`locRef` (MK9), `tr.mkIn` (MK7) |
| Undo je Geste `soundEdit`/`commitSound` | Z. 20327 | jede AM-Geste |
| Blatt-Rahmen `sheetFrame` (Kopf, LCD-Zeile, Reiter), Regler-Geste `sKnob`, `lcdShow`, `openPop`, fit-Klassen | Z. 20260, 20725, 20175, 19579 | Rahmen um das AM-Bedienfeld; die Bausteine der Platte sind neu (MK-P), die Ziehgeste der Regler kommt aus `sKnob` |
| Tastatur-Bereich `#kbArea`, Oktav-Wahl je Spur `tr.kbOct` (1…7) | Z. 3494, Z. 11491, Z. 18917 | OCTAVE DOWN/UP der Platte ändern `tr.kbOct`; PITCH- und MOD-Rad sitzen bei AM-Spuren links im `#kbArea` (MK1) |
| Mikrofon-Zugang (VS1: `MIC_ASK`, `getUserMedia` nur auf Tipp, play-and-record, Wege-Erkennung) | Z. 29401, Z. 29500 ff., Z. 30007 ff. | Eingang „Mikrofon“ über einen gemeinsamen, referenzgezählten Mikrofon-Abgriff ohne Stimm-Analyse (MK7); derselbe Abgriff würde die Aufnahme-Seite von MK10 speisen (zurückgestellt). Die VS1-Sitzung (`stStart`, MPM, Ringpuffer) wird nicht mitbenutzt |
| MIDI-Eingang `connectMidi`/`onMidiMsg` (nur Note an/aus → `inputDown`/`inputUp`) | Z. 26587, Z. 29030–29047 | Notenquelle des Arp (MK5); Bend (0xE0) und CC1 nur als freiwillige Zugabe am Desktop (MK1 Umfang 8, EN3-21) |
| .syx-Dateiwahl ohne `accept` (iOS), lokale Verarbeitung | `importSyx` Z. 24724, Z. 26513 | MK9 (zurückgestellt) |
| Verstecktes Testblatt mit JSON-Ergebnis (VS0 Mikro-Check) | CHANGES VS0 | Leistungs-Probe (MK1) |
| Test-API `engineInfo().perTrack[i].load`, `noteLog`, `viewState` | Z. 31579 | Abnahmen |

---

## Teil A — Abgleich MS2000 ↔ SYNQUENZER-Synth (heute 4.6.0)

Spalten: Parameter wie im Handbuch · Wertebereich · Seite HB-MS · Seite HB-MK · was die App heute hat (VA-Engine) · Status (✓ vorhanden · ≈ teilweise · ✗ fehlt · – entfällt) · Paket.

### A.1 Programm (COMMON, NAME, UTILITY)

| Parameter | Bereich | HB-MS | HB-MK | App heute | St. | Paket |
|---|---|---|---|---|---|---|
| Mode | Single, Dual, Split, Vocoder | S. 34 | S. 16 (Synth/Vocoder, Single/Layer) | eine Klangerzeugung je Spur | ✗ | MK3, MK7 |
| Timbre Voice | 1+3, 2+2, 3+1 | S. 34 | S. 16 (aus VOICE ASSIGN abgeleitet) | – | ✗ | MK3 |
| Split Point | C-1…G9 | S. 34 | – | – | ✗ | MK3 |
| Scale | Equal Temp, Pure Major, Pure Minor, Arabic, Pythagorea, Werckmeist, Kirnberger, Slendro, Pelog, User Scale | S. 34–35 | – | gleichstufig | ✗ | MK3 |
| Scale Key | C…B | S. 35 | – | – | ✗ | MK3 |
| User Scale (Global) | Key C…B, Detune −100…+100 ct | S. 57 | – | – | ✗ | MK3 (je Sound, Abweichung) |
| Name | Zeichensatz S. 35 | S. 35 | – | Sound-Name ≤ 32 | ✓ | – |
| Timbre Select (Taste) | 1, 2 | S. 35 | S. 14 (dort auch Edit Sync: beide Timbres zugleich bearbeiten, und Solo; S. 64) | – | ✗ | MK3 (Edit Sync und Solo gibt es nur am microKORG: in der Engine gebaut, auf dem Bedienfeld nach H-18) |
| Utility InitProgram, InitTimbre, CopyTimbre, SwapTimbre | – | S. 46–47 | S. 59–64 (SHIFT) | ⋯ → Init | ≈ | MK1, MK3 |
| Utility InitSeq, CopySeq, CopySeqAll, SwapSeq | SEQ1…ALL, S1…S3 | S. 47–48 | – | – | ✗ | MK6 |

### A.2 Stimme und Tonhöhe

| Parameter | Bereich | HB-MS | HB-MK | App heute | St. | Paket |
|---|---|---|---|---|---|---|
| Assign | Mono, Poly, Unison (4 Stimmen) | S. 35 | S. 16 | `mode` poly/mono/legato, `poly` 1–8 | ≈ (Unison als Stapel fehlt) | MK1 |
| Priority | Last, Low, High (gilt für jede Zuweisung, sobald mehr Tasten als Stimmen) | S. 35 | – (immer letzte Taste, S. 16) | nur „letzte“ | ✗ | MK1 |
| Trigger | Single, Multi | S. 35 | S. 16 | legato ≈ Single | ≈ | MK1 |
| Detune (Unison) | 0…99 ct | S. 36 | S. 16 | `uniDet` je Oszillator | ≈ | MK1 |
| MIDI ch | GLB, 01…16 | S. 35 | – | MIDI-Eingang nur für Note an/aus (Z. 29030), ohne Kanalwahl | – | – |
| Transpose | −24…+24 HT | S. 36 | S. 17 | Fußlage/HT je Oszillator | ≈ | MK1 |
| Tune | −50…+50 ct | S. 36 | S. 17 | `o*fine` | ✓ | MK1 |
| Vibrato Int | −63…+63 (LFO2, Mod-Rad) | S. 36 | S. 17 | Route `mw` → pitch | ≈ | MK1 |
| Bend Range | −12…+12 HT | S. 36 | S. 17 | kein Bend-Rad | ✗ (MK1 bringt das Touch-Rad PITCH, H-5; MIDI-Bend nur freiwillig am Desktop) | MK1 |
| Portamento | 0…127 | S. 36 | S. 17 | `glide` 0–2 s | ✓ (Kurve W-13) | MK1 |

### A.3 Oszillatoren und Mixer

| Parameter | Bereich | HB-MS | HB-MK | App heute | St. | Paket |
|---|---|---|---|---|---|---|
| OSC1 Wave | Saw, Pulse, Tri, Sin (Cross), Vox Wave, DWGS, Noise, Audio In | S. 36–38, S. 65 | S. 18–21 | Säge, Puls, Dreieck, Sinus (polyBLEP) | ≈ | MK1 (Saw/Pulse/Tri), MK2 (Sin/Vox/DWGS/Noise), MK7 (Audio In) |
| Saw: C1 Form (0 = Säge, 127 = Säge eine Oktave höher), C2 = LFO1-WFM | 0…127 | S. 36 | S. 18 | – | ✗ | MK1 |
| Pulse: C1 Pulsbreite (0 = 50 %, 127 = 0 % stumm), C2 = PWM durch LFO1 | 0…127 | S. 36 | S. 18 | `o1pw` + Route | ≈ | MK1 |
| Tri: C1 Form (127 = Oktave + Quinte höher), C2 = WFM | 0…127 | S. 37 | S. 19 | – | ✗ | MK1 |
| Sin: C1 Kreuzmodulation durch OSC2, C2 = LFO1 auf die Tiefe | 0…127 | S. 37 | S. 19 | – (VK plant `ofm`) | ✗ | MK2 |
| Vox Wave: C1 Form, C2 = LFO1 (Spektrum bleibt bei Tonhöhenwechsel) | 0…127 | S. 37 | S. 19 | – | ✗ | MK2 |
| DWGS: C1 ohne Wirkung, C2 = Welle 1…64 (Werte 2n−2, 2n−1 → Welle n) | 1…64 | S. 37, S. 66 | S. 20 | FM-Werkswellen 0–11 + Mipmaps (Technik) | ✗ | MK2 (Platzhalter), MK10 |
| Noise (OSC1): C1 LPF-Cutoff, C2 Resonanz (C1 24 = Bezugstonhöhe) | 0…127 | S. 37 | S. 20 | Rauschen nur als Pegel | ✗ | MK2 |
| Audio In: C1 Balance IN1/IN2, C2 = LFO1 auf die Balance; Tonhöhe ohne Wirkung | 0…127 | S. 38, S. 17 | S. 21 (gleiche Richtung nach Funktion; nur die Buchsen-Nummern sind vertauscht: mK IN 1 = Mikro ≙ E2, IN 2 = Line ≙ E1) | Mikrofon nur in VS | ✗ | MK7 |
| OSC2 Wave | Saw, Squ, Tri | S. 38 | S. 22 | Säge, Puls, Dreieck | ✓ | MK1 |
| OSC Mod | OFF, Ring, Sync, RingSync | S. 38 | S. 22 | Sync ✓ (`o2sync`), Ring ✗ (VK plant `p.ring`) | ≈ | MK1 |
| Semitone | −24…+24 | S. 38, S. 66 | S. 22 | `o2semi` −12…+24 | ≈ | MK1 |
| Tune (OSC2) | −63…+63 (±48 = ±1 Okt, ±63 = ±2 Okt, nahe 0 fein) | S. 38 | S. 22 | `o2fine` ±50 ct | ≈ | MK1 |
| Mixer OSC1, OSC2, Noise Level | 0…127 | S. 38 | S. 23 | `o1lvl`, `o2lvl`, `noise` | ✓ | MK1 |

### A.4 Filter, Verstärker, Hüllkurven, LFOs

| Parameter | Bereich | HB-MS | HB-MK | App heute | St. | Paket |
|---|---|---|---|---|---|---|
| Filter Type | 24LPF, 12LPF, 12BPF, 12HPF | S. 39, S. 65 | S. 24 | Ladder LP24, LP12, BP12, HP12 (+ BP24, HP24) | ✓ | MK1 |
| Cutoff, Resonance | 0…127 | S. 39 | S. 24 | `cutoff` Hz, `res` | ✓ (Kurven W-01, W-02) | MK1 |
| EG1 Int | −63…+63 | S. 39 | S. 24 | `fenv` ±1 | ✓ | MK1 |
| Vel Sense (Filter) | −63…+63 | S. 39 | – (nur über PATCH) | `fvel` 0…1 | ≈ (negativ fehlt) | MK1 |
| KBD Track (Filter) | −63…+63 (+48 = 1:1 ab C4) | S. 39 | S. 25 | `kt` 0…1 | ≈ (negativ fehlt) | MK1 |
| Amp Level | 0…127 | S. 40 | S. 27 | `level` | ✓ | MK1 |
| Panpot | L63…CNT…R63 | S. 40 | S. 27 | Spur-Pan | ≈ (je Timbre fehlt) | MK1 |
| Amp Sw | EG 2, Gate | S. 40 | – | – | ✗ | MK1 |
| Distortion | ON, OFF (Tiefe über die Mixer-Pegel) | S. 40 | S. 27 | Spur-Drive (eigener Regler, nach der Stimme) | ≈ | MK1 |
| Vel Sense (Amp) | −63…+63 | S. 40 | – | `ampVel` 0…1 | ≈ | MK1 |
| KBD Track (Amp) | −63…+63 (um C4) | S. 40 | S. 27 | – | ✗ | MK1 |
| EG1/EG2 Attack, Decay, Sustain, Release | 0…127 | S. 40 | S. 26, S. 28 | `fA…fR`, `aA…aR` in s | ✓ (Kurve W-06) | MK1 |
| EG Reset | ON, OFF | S. 41 | S. 26, S. 28 | – | ✗ | MK1 |
| LFO1 Wave / LFO2 Wave | Saw, Squ, Tri, S/H / Saw, Squ(+), Sin, S/H | S. 41 | S. 29 | Sinus, Dreieck, Säge, Rechteck, S&H | ≈ (Squ(+) fehlt) | MK1 |
| Key Sync (LFO) | OFF, Timbre, Voice | S. 41 | S. 29 | `retrig` 0/1 | ≈ (Timbre fehlt) | MK1 |
| Tempo Sync, Frequency, Sync Note | ON/OFF · 0…127 · 1/32…1/1 (15 Werte) | S. 41, S. 66 | S. 29 (1.1…1.32) | `l*sync` Schläge, `l*rate` Hz | ≈ | MK1 |
| feste Verdrahtung | LFO1 → OSC1 C1 (über C2), LFO2 → Tonhöhe (Vibrato × Mod-Rad), EG1 → Cutoff, EG2 → Amp | S. 3, S. 40–41 | S. 18, S. 17 | Routen frei | ≈ | MK1 |

### A.5 Virtual Patch (4 je Timbre)

| Parameter | Bereich | HB-MS | HB-MK | App heute | St. | Paket |
|---|---|---|---|---|---|---|
| Source | EG 1, EG 2, LFO 1, LFO 2, Velocity, KBD Trk, MIDI 1, MIDI 2 | S. 42 (MIDI 1/2 sind global belegbar, Global 3D/3E, S. 54–55; übernommen wird die Werksbelegung P.Bend/CC#01 = Bend/Mod-Rad) | S. 30 (MIDI 1/2 = Pitch Bend, MOD.Wheel) | `fenv`, `aenv`, `lfo1`, `lfo2`, `vel`, `key`, `mw` | ≈ (Bend fehlt) | MK2 |
| Destination | Pitch, OSC2Ptch, OSC1Ctr1, NoiseLvl, Cutoff, Amp, Pan, LFO2Freq (ohne Wirkung bei LFO2 Tempo Sync ON) | S. 41–42 | S. 29–30 | pitch, o2pitch, cutoff, noise, amp, pan | ≈ (OSC1 C1, LFO2 Freq fehlen) | MK2 |
| Intensity | −63…+63 | S. 42 | S. 30 | `amt` ±1 | ✓ | MK2 |

### A.6 Mod Sequence (nur MS2000; je Timbre)

| Parameter | Bereich | HB-MS | App heute | St. | Paket |
|---|---|---|---|---|---|
| ON/OFF | – | S. 16, S. 65 (CC 89) | – | ✗ | MK6 |
| Last Step | 01…16 | S. 42 | – | ✗ | MK6 |
| Seq Type | Forward, Reverse, Alt 1, Alt 2 | S. 42 | – | ✗ | MK6 |
| Run Mode | 1Shot, Loop | S. 43 | – | ✗ | MK6 |
| Key Sync | OFF, Timbre, Voice | S. 43 | – | ✗ | MK6 |
| Resolution | 1/48…1/1 (16 Werte) | S. 43, S. 66 | – | ✗ | MK6 |
| Knob (SEQ 1–3) | None, Pitch, Step Length, die Bedienfeld-Regler (Vorrang SEQ3 > SEQ2 > SEQ1) | S. 43 | – | ✗ | MK6 |
| Motion | Smooth, Step | S. 43 | – | ✗ | MK6 |
| Step Value | 16 × (±6 Step Length · ±24 Pitch/OSC2 Semi · ±63 sonst) | S. 43–44, S. 62 | – | ✗ | MK6 |
| Motion Rec | Regler-Bewegung in Echtzeit in die Schritte | S. 26 | – | ✗ | MK6 |

### A.7 Effekte (je Programm)

| Parameter | Bereich | HB-MS | HB-MK | App heute | St. | Paket |
|---|---|---|---|---|---|---|
| Mod FX Type | Cho/Flg, Ensemble, Phaser | S. 44 | S. 40 | Spur-Chorus (I, II, I+II, ENS, BREIT); Phaser/Flanger erst VK2 | ≈ | MK4 |
| LFO Speed, Depth | 0…127, 0…127 (Depth 0 = aus) | S. 44 | S. 40 | – | ✗ | MK4 |
| Delay Type | StereoDelay, CrossDelay, L/R Delay | S. 44 | S. 41 | Echo-Bus (Send, Tempo) | ≈ | MK4 |
| Tempo Sync, Delay Time, Sync Note, Depth | ON/OFF · 0…127 · 1/32…1/1 · 0…127 | S. 44, S. 66 | S. 41 | – | ✗ | MK4 |
| EQ | LowEQFreq 40 Hz…1000 Hz, LowEQGain −12,0…+12,0, HiEQFreq 1,00…18,0 kHz, HiEQGain −12,0…+12,0 | S. 44–45 | S. 42 | – | ✗ | MK4 |
| Reihenfolge | Mod FX → Delay → EQ | [W] | S. 31 [B] | – | – | MK4 |

### A.8 Arpeggiator

| Parameter | Bereich | HB-MS | HB-MK | App heute | St. | Paket |
|---|---|---|---|---|---|---|
| ON/OFF, LATCH | ON, OFF | S. 45 | S. 11, S. 45 | – | ✗ | MK5 |
| Type | Up, Down, Alt 1, Alt 2, Random, Trigger | S. 45, S. 60 | S. 44 | – | ✗ | MK5 |
| Range | 1…4 Oktaven | S. 45 | S. 44 | – | ✗ | MK5 |
| Tempo | 20…300 | S. 45 | S. 44 | Song-Tempo | ≈ (EN3-10) | MK5 |
| Gate Time | 0…100 % | S. 45, S. 60 | S. 44 | – | ✗ | MK5 |
| Target | Both, Timbre 1, Timbre 2 | S. 45 | S. 45 | – | ✗ | MK5 |
| Key Sync | ON, OFF | S. 46 | S. 45 | – | ✗ | MK5 |
| Resolution | 1/24, 1/16, 1/12, 1/8, 1/6, 1/4 | S. 46, S. 66 | S. 44 | – | ✗ | MK5 |
| Swing | −100…+100 % | S. 46 | S. 45 | – | ✗ | MK5 |
| Last Step + Schritte an/aus (Step-Arp) | 1…8, 8 Schalter | – | S. 11, S. 45 (nur microKORG) | – | ✗ | MK5 (Engine; nur für microKORG-Programme, A.11; auf dem Bedienfeld nach H-18) |

### A.9 Vocoder

| Parameter | Bereich | HB-MS | HB-MK | App heute | St. | Paket |
|---|---|---|---|---|---|---|
| Aufbau | 2 × 16 Bandpässe (Analyse, Synthese) + Hüllkurvenfolger, 4 Stimmen | S. 2, S. 4 | S. 31 (8 Kanäle aus 16 Filtern in Paaren) | – | ✗ | MK7 |
| Bandmitten (16 Filter, Formant Shift 0) | 125, 185, 270, 350, 430, 530, 630, 780, 950, 1150, 1380, 1680, 2070, 2780, 3800, 5000 Hz; Raster für Shift/Cutoff 39 … 12 600 Hz | – | S. 35 (Tab. 6-1) [B]; für MS2000 gleich [W] | – | ✗ | MK7 |
| Träger OSC1 | Saw, Pulse, Tri, Sin (ohne Kreuzmod.; C1 verformt die Welle, C2 = LFO1-WFM, W-27b), VoxWave, DWGS, Noise, Audio In | S. 49 | S. 19, S. 32 | – | ✗ | MK7 |
| AUDIO IN 2 (Modulator) | Gate Sense 0…127, Threshold 0…127, HPF Level 0…127, HPF Gate ENA/DIS | S. 49 | S. 33 (dort AUDIO IN 1) | – | ✗ | MK7 |
| Mixer | OSC 1 Level, Inst Level (AUDIO IN 1), Noise Level, je 0…127 | S. 50 | S. 34 | – | ✗ | MK7 |
| Filter | Formant Shift −2…+2, Cutoff −63…+63, Resonance 0…127, Mod Src (EG 1…MIDI 2), Mod Int −63…+63, E.F.Sense 0…127 (127 = Halten) | S. 50 | S. 35–36 (E.F.Sense 0…126, Hold) | – | ✗ | MK7 |
| Amp | Level 0…127, Direct Level 0…127, Distortion ON/OFF, Vel Sense ±63, KBD Track ±63 | S. 50–51 | S. 37 | – | ✗ | MK7 |
| EG 1/2, LFO 1/2, Effekte, Arp | wie Synth | S. 51 | S. 37, S. 39–45 | – | – | MK7 |
| CH Level, CH Pan | 16 × 0…127, 16 × L63…R63; Init 127 bzw. CNT als zwei getrennte Funktionen | S. 51–52 | S. 38 (8 Kanäle), S. 59–60 | – | ✗ | MK7 |
| Formant Hold | E.F.SENSE 127 = Halten; der gehaltene Zustand wird im Programm gespeichert | S. 50 | S. 10, S. 35 (dort eigene Taste) | – | ✗ | MK7 |
| InitProgram im Vocoder | Voice Mode bleibt Vocoder | S. 51 | – | – | ✗ | MK7 |

### A.10 Nicht übernommen (mit Grund)

- **Global** (Mst.Tune 430–450 Hz, Transpose, Vel.Curve, Position, AudioInThru, Protect, MIDI-Kanal, MIDI1/MIDI2-Zuweisung, Local, Clock, Filter, Dump, Pedal/Switch; HB-MS S. 53–57, HB-MK S. 47–51): Das regelt die App auf Projekt- und Geräte-Ebene (Tempo, Tastatur FEST/POSITION). Die App hat einen MIDI-Eingang, der heute nur Note an/aus verarbeitet (Z. 29030–29047); BEND- und MOD-Rad kommen als Touch-Räder (MK1, H-5), Bend und CC1 vom MIDI-Eingang nur als freiwillige Zugabe am Desktop (EN3-21). MIDI 1/MIDI 2 gelten fest als Bend/Mod-Rad (Werksbelegung, A.5). Die Taste GLOBAL der Platte führt in der App zu den Spur-Einstellungen (Eingänge, Oktave, Seiten-Sprung; MK-P Umfang 4).
- **CC/NRPN-Tabellen** (HB-MS S. 60–65): Sie dienen nur als Hilfe beim Import (Wertzuordnung), nicht als Funktion.
- **Demos, Write-Protect:** entfallen. Der **Programm-Speicher A–H mit je 16** (HB-MS S. 2) wird übernommen, mit eigenen Werksklängen (MK8).

### A.11 microKORG-Programme auf derselben Engine (nur für den späteren Import MK9)

Das Bedienfeld zeigt nur den MS2000 (MK-P). Die Engine kann aber alles, was ein microKORG-Programm braucht. Ein später gebauter Import (MK9) bildet es so ab; HB-MK dient dabei nur als Faktenquelle:
1. **Layer** (microKORG) = **Dual** (MS2000). Die Stimmen-Teilung folgt der Zuweisung beider Timbres (HB-MK S. 16).
2. **Vocoder:** microKORG 8 Kanäle (16 Filter paarweise, S. 35) → 16 Bänder; Kanal k → Bänder 2k−1 und 2k.
3. **Step-Arp** (Last Step 1–8, Schritte an/aus; nur microKORG, S. 11, S. 45) → `arp.last`, `arp.steps` (MK5, in der Engine gebaut). Für MS2000-Programme stehen sie neutral auf 8 und 255. Auf dem MS-2000-Bedienfeld nach H-18.
4. **Audio-In-Balance:** Nach Funktion haben beide Geräte dieselbe Richtung (127 = nur der Mikrofon-Eingang). MS2000: 0 = nur IN 1 (Instrument, Träger), 127 = nur IN 2 (Mikrofon, Modulator) (HB-MS S. 38, S. 4, S. 17, S. 49). microKORG: 127 = nur AUDIO IN 1, 0 = nur AUDIO IN 2 (HB-MK S. 21); dort ist IN 1 die Mikrofon-Buchse (Modulator) und IN 2 LINE (Träger, INST LEVEL) (HB-MK S. 4, 10, 31, 33, 34). Der Import ordnet deshalb nach Funktion zu: **microKORG IN 1 → E2, IN 2 → E1; der Balance-Wert wird unverändert übernommen.**
5. **Patch- und FC-MOD-Quellen:** Am microKORG heißen sie FILTER EG, AMP EG, …, Pitch Bend, MOD.Wheel (S. 30). Das entspricht EG 1, EG 2, …, MIDI 1, MIDI 2 beim MS2000 (S. 42). FC-MOD-Quellen hat der microKORG ohne EG 1: 7 Einträge ab AMP EG (HB-MK S. 36 gegen HB-MS S. 50); der Import bildet sie nach Namen ab.
6. **Oktavlage:** Der microKORG speichert den Zustand OCTAVE SHIFT im Programm (HB-MK S. 58), der MS2000 nicht (HB-MS S. 36) → der Import rechnet ihn in Transpose um.
7. **Edit Sync und Solo** (HB-MK S. 14) sind Bedienfunktionen, kein Programm-Inhalt; der Import braucht sie nicht.
8. **Werksprogramme von Korg** kommen nie in die App oder ins Netz (EN3-07). „Presets vom microKORG nachrüsten“ (Xander, 26.10.) heißt deshalb: eigene Programm-Dateien lokal laden (EN3-08), sobald es dafür einen Weg ohne Rechner gibt (MK9).

### A.12 Zusammenfassung — was dem SYNQUENZER-Synth fehlt

1. **Struktur:** zwei Timbres (Dual/Split), Timbre-Stimmenteilung, Programm-Effekte, Vocoder-Modus, Eingänge in die Klangerzeugung.
2. **Oszillator:** 6 von 8 OSC1-Algorithmen (Form-Säge, Form-Dreieck, Kreuzmodulation, Stimmwelle, 64 Speicherwellen, Rauschen mit Filter, Eingang). Dazu Ring und RingSync, OSC2-Tune-Kurve über ±2 Oktaven, Halbton bis −24.
3. **Hüllkurven/Amp:** EG2/Gate, EG Reset, bipolare Anschlag- und Keytrack-Werte, Amp-Keytrack, Distortion abhängig von den Mixer-Pegeln, Pan je Timbre.
4. **Stimmen:** Unison als Stimmenstapel, Priorität Last/Low/High für jede Zuweisung, MS2000-Trigger.
5. **Modulation:** LFO Squ(+), Key Sync „Timbre“, MS2000-Sync-Noten, Patch-Ziele OSC1 C1 und LFO2 Freq, Mod-Sequenzer 3×16 mit Motion Rec.
6. **Stimmung:** 10 Skalen, Grundton, eigene Stimmung.
7. **Effekte:** Cho/Flg, Ensemble, Phaser, 3 Delay-Typen und 2-Band-EQ, je Klang und mit Tempo.
8. **Spielhilfen:** Arpeggiator (6 Typen, Latch, Swing, Tempo-Sync).
9. **Vocoder:** 16 Bänder, Halten, Kanal-Pegel und -Pan.
10. **Bedienung und Programme:** Bedienfeld wie die Vorderseite des MS2000 (MK-P), PITCH- und MOD-Rad, Programm-Speicher A–H × 16 mit eigenen Werksklängen (MK8); Import und eigene Wellen-Aufnahmen (zurückgestellt).

---
## Teil B — Bauweise (gilt für alle MK-Pakete)

### B.1 Engine, Datenmodell, Format

**Engine.** `engine: 'mk'` kommt in `SYNTH_ENGINES` (Z. 7794). Sie läuft im Worklet `dirigent-analog` als `eng 3` (`wkFlat`: `o.eng = 3`, `isWkEngine` um `'mk'` erweitert). Der flache VA-Patch bleibt im Sound wie bei jeder Synth-Engine erhalten (verlustfreier Engine-Wechsel, §5.2). Dazu kommt der Block **`p.mk`**. Beim ersten Wechsel einer Spur zu AM entsteht `p.mk` aus INIT AM. Eine Umrechnung VA → AM gibt es nicht (bewusst; L7 bleibt erfüllt, weil der VA-Block bleibt). Nach dem Wechsel stellt **ein** Undo den alten Sound deep-equal her. Wird ohne Geste zurück auf VA geschaltet, räumt `setEngineOf` ein unberührtes INIT-`p.mk` wieder weg (gleicher `soundHash`, kein „geändert“).

**Weg zum Worklet.** `p.mk` geht als `{mk}` (strukturierte Kopie bei Laden oder Engine-Wechsel) und als `processorOptions.mk` an den Knoten, Gesten als `{mkSet: {Pfad: Wert}}` (N3.0.4). `wkFlat` reicht nur flache Zahlen weiter und genügt dafür nicht.

**Der flache VA-Zustand ruht bei AM.** Für Engine `mk` schickt die App `wkMods = []`, setzt `glideFrom = −1` (AM gleitet nur über `t.porta` im Worklet; `spawnWkVoice` Z. 12568) und überspringt in `rebuildNativeLfos` (Z. 12113) die nativen `fx.*`-Routen. Gespeichert bleibt alles, damit VA → AM → VA verlustfrei ist (MK1-01, MK1-30).

**`p.mk` (Ganzzahlen in Geräte-Einheiten, EN3-03; Vorgaben = INIT AM).** Die Paketnummern in Klammern sagen, wann ein Feld wirkt. Gespeichert wird das Feld ab MK1 mit seinem neutralen Wert.

```
p.mk = {
  v: 1,
  mode: 0,        // 0 Single, 1 Dual, 2 Split, 3 Vocoder                         HB-MS S. 34        (MK3, MK7)
  tv: 1,          // Timbre Voice: 0 = 1+3, 1 = 2+2, 2 = 3+1; gilt nicht für ein Mono-Timbre (MK3)
  split: 60,      // Split Point 0…127 (MIDI-Note, C-1…G9); Noten < split → T1, ≥ split → T2 [W]
  scale: 0,       // 0 Gleichstufig … 9 Eigene (Reihenfolge HB-MS S. 34–35)        (MK3)
  skey: 0,        // Grundton 0…11 (C…B)
  usc: null,      // Eigene Stimmung: 12 × −100…+100 ct, nur bei scale 9 (Abweichung: HB-MS hat sie global, S. 57)
  vmax: 4,        // fest 4 wie am MS2000 (das Feld bleibt aus MK1 gespeichert, ohne Bedienung)
  t: [T, T],      // Timbre 1, Timbre 2 (T2 wird immer gespeichert, klingt nur bei mode 1/2)
  mfx: {type: 0, spd: 64, dep: 0},                       // Cho/Flg, Ensemble, Phaser; dep 0 = aus   (MK4)
  dly: {type: 0, sync: 0, time: 64, note: 8, dep: 0},    // Stereo, Cross, L/R; note = Index W-12  (MK4)
  eq:  {lf: 320, lg: 0, hf: 6000, hg: 0},                // Hz, Hz, dB (Schritt 0,5)               (MK4)
  arp: {on: 0, latch: 0, type: 0, range: 1, gate: 75, tgt: 0, ks: 0, res: 1, swing: 0,
        last: 8, steps: 255, tempo: 120},                // res = Index W-11; last/steps (Bitmaske 1…8) nur für microKORG-Programme, A.11 (MK5)
  voc: {gs: 0, th: 0, hpl: 0, hpg: 1, ins: 0, fs: 0, cut: 0, res: 0, msrc: 1, mint: 0,
        efs: 64, hold: null, lvl: 127, dir: 0, dist: 0, vel: 0, kbd: 0,
        chl: [127 ×16], chp: [0 ×16]}                    // hold = 16 × 0…127 oder null          (MK7)
}
T = {
  asg: 1, prio: 0, trig: 1, udet: 10,     // Assign 0 Mono 1 Poly 2 Unison · Priority 0 Last 1 Low 2 High · Trigger 0 Single 1 Multi
  trans: 0, tune: 0, vib: 0, bend: 2, porta: 0,
  o1: {w: 0, c1: 0, c2: 0},               // w: 0 Säge 1 Puls 2 Dreieck 3 Sinus× 4 Stimmwelle 5 Speicherwelle 6 Rauschen 7 Eingang
  o2: {w: 0, mod: 0, semi: 0, tune: 0},   // w: 0 Säge 1 Rechteck 2 Dreieck · mod: 0 aus 1 Ring 2 Sync 3 Ring+Sync
  mix: {o1: 127, o2: 0, n: 0},
  f: {type: 0, cut: 127, res: 0, eg: 0, vel: 0, kbd: 0},   // type: 0 24LPF 1 12LPF 2 12BPF 3 12HPF
  a: {lvl: 127, pan: 0, gate: 0, dist: 0, vel: 0, kbd: 0}, // gate: 0 EG2 1 Gate
  e1: {a: 0, d: 64, s: 0, r: 0, rst: 1},
  e2: {a: 0, d: 64, s: 127, r: 8, rst: 1},
  l1: {w: 2, ks: 0, sync: 0, f: 64, note: 6},  // LFO1 w: 0 Säge 1 Rechteck 2 Dreieck 3 S/H
  l2: {w: 2, ks: 0, sync: 0, f: 64, note: 6},  // LFO2 w: 0 Säge 1 Rechteck(+) 2 Sinus 3 S/H · ks: 0 aus 1 Timbre 2 Stimme · note = Index W-09
  p: [{s: 0, d: 0, i: 0}, {s: 2, d: 4, i: 0}, {s: 3, d: 0, i: 0}, {s: 4, d: 5, i: 0}],
        // s: 0 EG1 1 EG2 2 LFO1 3 LFO2 4 Anschlag 5 Keytrack 6 Bend (MIDI 1) 7 Mod-Rad (MIDI 2)
        // d: 0 Tonhöhe 1 OSZ2-Tonhöhe 2 OSZ1-Steuer 1 3 Rauschen 4 Cutoff 5 Amp 6 Pan 7 LFO2-Freq
  seq: {on: 0, last: 16, type: 0, run: 1, ks: 1, res: 3, q: [{k: 0, m: 1, v: [0 ×16]} ×3]}  // res = Index W-10 (MK6)
}
```

- **Räder (H-5, entschieden 25.10.):** PITCH- und MOD-Rad sind Touch-Räder links der Tasten (B.3, MK1; MK1 beschriftete das PITCH-Rad „BEND“, MK-P beschriftet es wie am Gerät). Ihre Stellung ist ein **Live-Wert je Spur** (`R.mkWheel[uid] = {bend: −1…+1, mod: 0…1}`), wird **nicht gespeichert** und macht keinen Undo-Schritt, wie am Gerät. Das MOD-Rad startet beim Laden des Sounds und beim Spurwechsel auf dem vorhandenen flachen Wert `p.mw` (0…1, „Mod-Rad“, Z. 11203; ab MK-P auf der LCD-Seite 04 PITCH) und ersetzt ihn live, sobald es bewegt wird. Es ist die Quelle „Mod-Rad“ (MIDI 2) und skaliert das Vibrato. Das PITCH-Rad federt beim Loslassen zur Mitte und ist die Quelle „Bend“ (MIDI 1). Freiwillig am Desktop: Bend (0xE0) und CC1 vom MIDI-Eingang setzen dieselben Live-Werte (EN3-21).
- **Eingänge** (EN3-15) gehören zur Spur: `tr.mkIn = {e1: null | 'mic' | 't:<uid>', e2: …, e1Dry: 1, e2Dry: 1}`. `eDry` 0 = „Quelle nur als Eingang“ (H-10, MK7). Das Format bleibt 5, die Felder sind neutral. `normTrack`/`normalizeProject` behalten `tr.mkIn` (Z. 11490–11500).
- **`normMk(p)`** klemmt jedes Feld auf die Bereiche aus Teil A (Listen: Index 0…n−1, auf ganze Zahlen gerundet). Fehlende Felder bekommen die INIT-Werte, unbekannte Felder fallen weg. `normSynthP` ruft `normMk` auf, wenn `p.mk` existiert oder `engine === 'mk'`. Der Block bleibt bei jedem Engine-Wechsel erhalten (wie `p.fmx`, Z. 7872). `normMk` gehört zum immer geladenen Teil (EN3-14), sonst fiele `p.mk` beim ersten Laden der Bibliothek weg.
- **Feld-Listen:** `normalizeSound` behält nur aufgezählte Felder (Z. 7920–7928). Neu aufgenommen werden `bank`/`slot` (MK8) und `loc`/`locRef` (MK9). `ENGINE_LABEL` bekommt `mk: MK_LABEL`, also „MS 2000“ (Z. 11162; sonst zeigen `soundLabel`, Browser und MIDI-Spurname „VA“), die Engine-Listen des Browsers (Z. 24409, 24509) und die `setEngineOf`-Liste mit Aufräumen (Z. 20343, 20352) nehmen `mk` auf (MK1).
- **`soundHash`** bleibt (Z. 7765). `p.mk` ist Teil von `p` und zählt also mit.
- **Format 5** (EN3-04): `PROJECT_FORMAT` 5, `SOUNDS_FORMAT` 2. Format 3 und 4 laden unverändert. Die Meldung „Projekt aus einer neueren Version“ (Z. 8163) erscheint nur beim Datei-Import von Hand (`parseFile`, Z. 24623). `projFromFile` (Z. 26988; Wege Cloud und Projektwechsel), `Autosave.load` (Z. 8340), `Library.load` (Z. 8247) und `cloudLibMerge` verwerfen ohne Meldung; den Schutz bringt MK0. Online: `p_format` 5 wird erst nach dem Rollout `max_format` 5 angenommen. Bis dahin speichert die App lokal und meldet `bad_version` wie bisher.
- **INIT AM** (`f-init-am`, cat `init`, `INIT_IDS.mk`; sichtbarer Name **„INIT MS 2000“**, aus `MK_LABEL` gebildet): genau die Vorgaben oben (Säge, Filter offen, EG2 Sustain 127, Release 8). Pegel wie MK1-20. Im Vocoder-Modus laden ⋯ → Init und UTILITY → INIT (MK-P) INIT AM mit `mode` 3 und den Vocoder-Vorgaben (HB-MS S. 51).

### B.2 Werte-Kurven (W-Tabelle; alle eK, außer wo [B] steht)

Notation: v = gespeicherter Wert. Note = MIDI-Note (C4 = 60). vel = Anschlag 0…1. HT = Halbton. **KT = Keytrack-Tonhöhe** = Note + TRANSP. + Bend + Seq-Tonhöhe (+ Stimmung, MK3), ohne Vibrato und ohne Patch-Tonhöhe ([B] HB-MS S. 39, S. 40, S. 42; HB-MK S. 25, S. 27, S. 30 für Bend und Transpose). Portamento-Zwischenwerte [U]. KT gilt für W-03, W-22 und die Patch-Quelle Keytrack (W-18).

| ID | Größe | Formel / Liste | Herkunft |
|---|---|---|---|
| **W-01** | Cutoff | f = 20 Hz · 1000^(v/127) (20 Hz … 20 kHz; v 64 ≈ 652 Hz; ≈ 0,94 HT je Schritt; während einer Geste mit Bruchwerten, EN3-03). f ist die **Polfrequenz der Ladder-Stufen** (Resonanzspitze bei f). Bei Resonanz 0 liegt die Antwort bei f für 12LPF und 12HPF bei −6 dB, für 24LPF bei −12 dB (−3 dB: 12LPF 0,644 · f, 24LPF 0,435 · f, 12HPF 1,554 · f) | eK |
| **W-02** | Resonanz (Ladder) | `res` = 1,1 · v/127 im vorhandenen Ladder-Bereich. Die Ladder überschreitet die Schwingschwelle nahe am Ende (ab ≈ v 116; genauer Einsatz eK) und pfeift dann als Sinus bei W-01; CUTOFF stellt die Tonhöhe. tanh-Sättigung, Ausgangsbegrenzer und NaN-Schutz bleiben | [B] HB-MK S. 25 (Selbstoszillation als Klangquelle); Einsatzpunkt und Pegel eK (Abgleich EN3-16) |
| **W-03** | Filter-Keytrack | Cutoff + (KT − 60) · v/48 HT (+48 = 1:1) | [B] S. 39 (+48 = proportional, ab C4) |
| **W-04** | EG1 Int | Cutoff + EG1 · v/63 · 60 HT | eK |
| **W-05** | Filter-Anschlag | Cutoff + v/63 · 24 · (2·vel − 1) HT | eK |
| **W-06** | Hüllkurvenzeiten | Attack: 0,5 ms · 2^(15·v/127) (0,5 ms … 16,4 s). Decay/Release: 2 ms · 2^(13·v/127) (2 ms … 16,4 s). Stufenzeit nach `envCoefs` mit Kurve 0,5. **Messung der Stufenzeit:** Attack von 0 bis 90 % der Spitze; Decay von der Spitze bis 90 % des Wegs zum Sustain; Release vom Pegel beim Loslassen bis −20 dB darunter (M-AUS) | eK |
| **W-07** | Sustain | Pegel v/127 (linear) | eK |
| **W-08** | LFO-Frequenz | 0,05 Hz · 2^(10·v/127) (0,05 … 51,2 Hz) | eK |
| **W-09** | LFO-Sync-Note (15) | 1/1, 3/4, 2/3, 1/2, 3/8, 1/3, 1/4, 3/16, 1/6, 1/8, 3/32, 1/12, 1/16, 1/24, 1/32. Periode = Wert × 4 Schläge | [B] S. 41, S. 66 |
| **W-10** | Seq-Auflösung (16) | 1/48, 1/32, 1/24, 1/16, 1/12, 3/32, 1/8, 1/6, 3/16, 1/4, 1/3, 3/8, 1/2, 2/3, 3/4, 1/1. Schritt = Wert × 4 Schläge | [B] S. 43, S. 66 |
| **W-11** | Arp-Auflösung (6) | 1/24, 1/16, 1/12, 1/8, 1/6, 1/4 | [B] S. 46 |
| **W-12** | Delay-Sync-Note (15) | 1/32, 1/24, 1/16, 1/12, 3/32, 1/8, 1/6, 3/16, 1/4, 1/3, 3/8, 1/2, 2/3, 3/4, 1/1. Zeit = Wert × 4 Schläge. Jeder Wert gilt im ganzen App-Tempobereich 40–240 BPM ohne Kürzung (bis 6,0 s, Puffer W-32) | [B] S. 66 |
| **W-13** | Portamento | v 0 = aus, sonst exponentielles Gleiten mit τ = 2 ms · 2^(12·v/127) (… 8,2 s). Bei Mono/Unison + Single nicht auf die erste Note | eK; Regel [B] S. 36 |
| **W-14** | OSZ2-Fein | ct = sign(v) · 1200 · (|v|/48)² für |v| ≤ 48, sonst sign(v) · (1200 + 80 · (|v| − 48)) | Eckwerte [B] S. 38, Verlauf eK |
| **W-15** | Unison-Verstimmung (d ct) | 4 Stimmen: −d/2, −d/6, +d/6, +d/2 · 3: −d/2, 0, +d/2 · 2: ±d/2 | eK |
| **W-16** | Vibrato | Spitzenhub = v/63 · 200 ct · Mod-Rad (0…1), Quelle LFO2 | eK; Verdrahtung [B] S. 36 |
| **W-17** | Bend | Bereich v HT. Das Touch-Rad PITCH (MK1, B.3) wirkt live über ± v HT: Tonhöhe = Rad (−1…+1) · v HT, linear, Totzone ± 2 % um die Mitte, beim Loslassen zurück zur Mitte in 80 ms (geglättet, τ 5 ms). Ein MIDI-Bend (0xE0, freiwillig am Desktop) setzt denselben Wert | [B] S. 36; Verlauf und Totzone eK |
| **W-18** | Patch-Intensität i | Ziel = i/63 · volle Spanne: Tonhöhe ±24 HT · OSZ2-Tonhöhe ±63 Fein-Einheiten (über W-14) · OSZ1-Steuer 1 ±127 · Rauschen ±127 · Cutoff ±127 Cutoff-Einheiten · Amp ±127 Pegel-Einheiten · Pan voller Weg L63↔R63 · LFO2-Freq ±127 (über W-08). **LFO2-Freq wirkt nicht, solange `l2.sync` = 1.** Quellen: EG 0…1, LFO −1…+1 (LFO2 Rechteck(+) 0…1), Anschlag vel, Keytrack (KT − 60)/60, Bend (PITCH-Rad −1…+1, in Ruhe 0), Mod-Rad (MOD-Rad 0…1, Startwert `p.mw`; B.1 „Räder“). Rechnung in Bruchwerten (B.6 Nr. 2) | eK; Liste [B] S. 42; Tempo-Sync-Regel [B] HB-MS S. 41/42, HB-MK S. 29/30; MIDI 1/2 = Werksbelegung (A.5) |
| **W-19** | Amp-Pegel | Gain = K · (v/127)². K so gewählt, dass INIT AM bei C3, vel 0,8 so laut ist wie INIT Analog (±1 dB, MK1-20) | eK |
| **W-20** | Pan | Equal-Power, −63…+63 | eK |
| **W-21** | Amp-Anschlag | v ≥ 0: dB = 24 · (v/63) · (vel − 1). v < 0: dB = 24 · (|v|/63) · (−vel) | eK |
| **W-22** | Amp-Keytrack | dB = (v/63) · 0,3 · (KT − 60) | eK; „um C4“ [B] S. 40 |
| **W-23** | Distortion | Sitzt im AMP **nach dem Filter**. y = tanh(g·x) / tanh(g), g = 1 + 8 · (mix.o1 + mix.o2 + mix.n)/381, gerechnet mit ADAA 1. Ordnung (Stammfunktion log cosh) bei 1×; in der Qualität „Analog“ wahlweise 2× | eK; „Tiefe über die Mixer-Pegel“ und Lage nach dem Filter [B] S. 40 |
| **W-24** | Säge, Form | y = (1 − m) · Säge(φ) + m · Säge(2φ), m = (C1 + LFO1 · C2)/127 geklemmt 0…1 | eK; Endpunkte [B] S. 36 |
| **W-25** | Puls | Breite = 50 % · (1 − (C1 + LFO1 · C2)/127), geklemmt 0…50 % | eK; Endpunkte [B] S. 36 |
| **W-26** | Dreieck, Form | y = (1 − m) · Dreieck(φ) + m · Dreieck(3φ) (bandbegrenzt, polyBLAMP), m wie W-24 | eK; „127 = Oktave + Quinte“ [B] S. 37 |
| **W-27** | Sinus× (Kreuzmod.) | Phasenmodulation durch OSZ 2 **nach Sync, vor Ring** (der Ring-Ausgang enthielte OSZ 1 selbst, eine algebraische Schleife). Index β = 4 · (C1 + LFO1 · C2)/127 rad. C1 0 = reiner Sinus | eK; [B] S. 37 |
| **W-27b** | Sinus im Vocoder | Keine Kreuzmodulation. STEUER 1 verformt die Welle (Sinus → Falte/Dreieck, m wie W-24), STEUER 2 = LFO1-WFM auf diese Verformung | [B] HB-MS S. 49, HB-MK S. 19; Verformung eK |
| **W-28** | Stimmwelle | Rosenberg-Puls, **live gerechnet** (stückweise Polynom/Kosinus, polyBLAMP an der Schließecke), keine Tabellen. Öffnungsquotient 0,3 + 0,5 · m (m wie W-24, stetig auch mit LFO1). Feste Spektralhülle in Hz als festes IIR je Abtastrate (−12 dB/Okt oberhalb 300 Hz = zwei 1-Pol-Tiefpässe bei 300 Hz) | eK; „Spektrum bleibt“ [B] S. 37 |
| **W-29** | Rauschen (OSZ1) | Weißes Rauschen → 2-Pol-Tiefpass als TPT-SVF (B.6 Nr. 10), Cutoff = f(Note) · 2^((C1 − 24)/12), geklemmt 20 Hz … 0,45 · SR; Res = 0,98 · C2/127 | eK; „C1 24 = Bezugstonhöhe“ [B] S. 37 |
| **W-30** | Eingang (OSZ1) | Ausgang = (1 − b) · E1 + b · E2, b = (C1 + LFO1 · C2)/127. Tonhöhe ohne Wirkung | Richtung [B] S. 38; [B] S. 17 |
| **W-31** | Mod-FX | Tempo: 0,02 Hz · 2^(9·spd/127). **Cho/Flg:** Verzögerung 1 ms + Hub dep/127 · 4 ms, Rückkopplung max(0, (dep − 64)/63) · 0,85, L/R-LFO 90° versetzt. **Ensemble:** 3 Abgriffe um 120° versetzt, Basis 8 ms, Hub dep/127 · 3 ms, ohne Rückkopplung. **Phaser:** 6 Allpass-Stufen, Hub dep/127 über 200 Hz…4 kHz, Rückkopplung dep/127 · 0,7. **Mischung** für alle Typen: out = trocken · (1 − w) + nass · w mit w = min(0,5; 0,6 · dep/127); dep 0 = trocken bitgleich. Probe Cho/Flg: dep 40 → Kerbtiefe ≈ 4,1 dB, dep 100 → ≈ 16,8 dB. **Ensemble-Stereo:** L = Abgriff 1 + ½ · Abgriff 2, R = Abgriff 3 + ½ · Abgriff 2 | eK; Typen [B] S. 44 |
| **W-32** | Delay | Zeit (Sync aus): 1 ms · 2^(10,45·time/127) (1 ms … 1,4 s). **Puffer 6 s** je AM-Spur wie der Echo-Bus der App (Z. 11924): 1/1 bei 40 BPM passt, jede Sync-Note gilt ohne Kürzung. ≈ 2,3 MB bei 48 kHz stereo Float32, angelegt erst beim ersten `dly.dep` > 0 im Nachrichten-Weg, nie in `process()` (B.4). Pegel dep/127, Rückkopplung 0,8 · dep/127, dep 0 = trocken bitgleich. **Stereo:** L→L, R→R. **Cross:** Rückkopplung L↔R vertauscht. **L/R:** Mono-Summe, Echos abwechselnd L, R | eK; Typen [B] S. 44 |
| **W-33** | EQ | Tiefen- und Höhen-Kuhschwanz 2. Ordnung (Q 0,707). Frequenz in Hz (40…1000 bzw. 1000…18 000), Gain ±12 dB in 0,5-dB-Schritten | eK; Bereiche [B] S. 44–45 |
| **W-34** | Arp-Gate | Notenlänge = max(3 ms, gate/100 · Schritt). 100 = bis zum nächsten Schritt | eK; [B] S. 45 |
| **W-35** | Arp-Swing | gerade Schritte (2., 4., …) um swing/100 · ½ Schritt später (negativ: früher) | eK; [B] S. 46 |
| **W-36** | Vocoder-Bänder | Raster R[0…23] = 39, 50, 65, 80, 125, 185, 270, 350, 430, 530, 630, 780, 950, 1150, 1380, 1680, 2070, 2780, 3800, 5000, 6400, 8100, 10 510, 12 600 Hz. Analyseband k (1…16) = R[k+3]. Syntheseband k = R an der Stelle k + 3 + fs + 2 · (cut + mint · Quelle)/63 (Quelle = FC-MOD-Quelle −1…+1 bzw. 0…1; stetig, logarithmisch interpoliert, geklemmt 0…23). Eine Synthese-Bank je Timbre auf dem summierten Träger; Stimmen-Quellen (EG, Anschlag, Keytrack) von der neuesten gegateten Stimme, LFOs mit der globalen Timbre-Phase (eK). Probe: Shift +2 → Band 1 = 270 Hz, Shift −2 → 65 Hz, ±2 Stufen Cutoff an den Rändern → 39 Hz bzw. 12 600 Hz (Tab. 6-1) | [B] HB-MK S. 35, Tab. 6-1; Interpolation eK |
| **W-37** | Vocoder-Resonanz | Bandgüte Q = 3 + 9 · res/127, je Band 2 TPT-SVF-Bandpässe in Kaskade (4. Ordnung, B.6 Nr. 10). g aus `GTAN`, neu gerechnet nur bei Änderung von FORMANT, CUTOFF oder FC-MOD-Wert; g/R je Sample über den 16er-Block interpoliert | eK |
| **W-38** | E.F.Sense | Abfall-τ = 5 ms · 2^(9·efs/126) (5 ms … 2,56 s), Anstieg = τ/4 (≥ 1 ms). 127 = Halten | eK; Halten [B] S. 50 |
| **W-39** | Gate, Schwelle | th = 0 → Gate aus (Modulator ungegated, bitgleich zu „ohne Gate“). th ≥ 1: Schwelle = −72 dBFS + th/127 · 60 dB. Schließzeit 2 ms · 2^(10·gs/127) | eK; th 0 = keine Wirkung [B] HB-MK S. 33, HB-MS S. 49 |
| **W-40** | HPF-Pegel | Modulator → Hochpass 4. Ordnung 6 kHz → Ausgang mit Pegel hpl/127. hpg 1 (ENA) = nur bei klingender Trägerstimme | eK; [B] S. 49 |
| **W-41** | Direkt-Pegel | Modulator direkt, Gain (dir/127)² | eK |
| **W-42** | Kanal-Pegel/-Pan | Gain (chl/127)², Pan Equal-Power | eK |
| **W-43** | Stimmungen (ct gegenüber gleichstufig, Stufe 0…11 ab Grundton) | **Reine Dur:** 0, +11,73, +3,91, +15,64, −13,69, −1,96, −9,78, +1,96, +13,69, −15,64, −3,91, −11,73 · **Reine Moll:** wie Dur, aber Stufe 10 = +17,60 · **Pythagoreisch:** 0, +13,69, +3,91, −5,87, +7,82, −1,96, +11,73, +1,96, +15,64, +5,87, −3,91, +9,78 · **Werckmeister III:** 0, −9,78, −7,82, −5,87, −9,78, −1,96, −11,73, −3,91, −7,82, −11,73, −3,91, −7,82 · **Kirnberger III:** 0, −9,78, −6,84, −5,87, −13,69, −1,96, −9,78, −3,42, −7,82, −10,26, −3,91, −11,73 · **Arabisch:** Stufe 4 und 11 −50, sonst 0 · **Slendro:** Stufen 0, 2, 5, 7, 9 = 0, +40, −20, +20, +60, sonst 0 · **Pelog:** Stufen 0, 2, 4, 5, 7, 9, 11 = 0, −80, −130, +40, −30, −115, −150, sonst 0 · **Eigene:** `usc` | Bedingungen [B] S. 34–35 (z. B. „Dur-Akkorde der Tonart rein“, Slendro/Pelog-Tasten); Zahlen aus der Stimmungslehre, eK |
| **W-44** | Vokal-Quelle (MK7) | Glottis-Puls + 4 parallele Resonatoren F1–F4. Vokale (Hz): a 730/1090/2440/3400 · e 530/1840/2480/3500 · i 270/2290/3010/3700 · o 570/840/2410/3300 · u 300/870/2240/3300. Glottis wie W-28, Resonatoren als TPT-SVF (B.6 Nr. 10). Gebaut in MK7 (Probe-Modulator); MK8 rechnet daraus die `hold`-Spektren der Vocoder-Programme | Werte nach Peterson & Barney (1952, Männer, gerundet), eK |

### B.3 Rahmen, Räder und gemeinsame Bedienregeln (das Bedienfeld selbst: MK-P)

> **Rev. 3 (26.10.):** Die frühere Fassung von B.3 beschrieb ein Bedienfeld nach einer anderen Vorlage: zwei Drehschalter mit Sektions-Matrix, fünf Regler mit SHIFT-Ebenen, BANK-Drehschalter mit Nummerntasten, Holzwangen und Halb-Ansicht. MK1–MK7 haben es gebaut. Bis MK-P ausgeliefert ist, bleibt es die laufende Oberfläche; danach ist es entfernt (MK-P Umfang 5 und 6). Der alte Text steht nur noch in der Sicherung `scratchpad/rev1-tools/n3-vor-pure.md.bak`; Verweise auf „B.3“ in MK1–MK7 meinen diese alte Fassung. Hier steht, was auch mit MK-P gilt.

**Rahmen** (vorhandener Synth-Blattkopf `sheetFrame`):
- Zeile 1: Spurname, **Engine-Wahl VA │ FM │ WT │ MS 2000** (H-4, Beschriftung aus `MK_LABEL`), ECO-Badge, ↶ ↷ ✕. **Breiten-Budget je Format** (in MK1 gemessen, CHANGES-MK): Die Engine-Knöpfe bekommen ihre 44-px-Trefferhöhe senkrecht über `::after`, sind ≥ 36 px breit mit 4 px Abstand, und der Spurname bleibt sichtbar. „MS 2000“ steht einzeilig, wo ≥ 52 px frei sind, sonst zweizeilig „MS“ │ „2000“ (Umbruch an der Leerstelle per CSS, kein `<br>`; der Text bleibt genau „MS 2000“). Passt auch das nicht, gilt **H-13**: ein Engine-Chip mit der aktiven Engine („VA ▾“ bzw. „MS 2000 ▾“) und `openPop` (4 Zeilen ≥ 44 px).
- Zeile 2: ‹ Name ›, A/B, Sichern, 🎲, ◎, ⋯, ▶ Hören.
- LCD-Zeile mit dem Klartext (z. B. „FILTER · CUTOFF 064 · 652 Hz“).
- Reiter **[GERÄT] [SPIEL] [FX]**, rechts daneben **◀ Karte ▶** (MK-P „Ansichten“). FX ist die vorhandene App-Seite (SPUR, CHORUS, HALL, ECHO, MASTER) und bleibt unverändert.
- **Querformat** (MK-P „Fester Rahmen“, H-17): Das MS-2000-Blatt belegt die ganze Fläche innerhalb der Safe-Area. Zeile 1, Zeile 2, LCD-Zeile und Reiter werden zu einer Kopfzeile von 44 px. Im Hochformat bleibt der Blattkopf wie oben.

**Räder** (H-5, entschieden; B.1 „Räder“, W-17, W-18):
- **Platz:** links in der Tastatur-Zeile (`#kbArea`), PITCH links, MOD rechts daneben, je ≥ 44 px breit (sichtbares Rad 32 px in einer Mulde), 4 px Abstand, volle Höhe der Tastatur-Zeile. Nur solange die gewählte Spur eine AM-Spur ist; bei allen anderen Engines bleibt die Tastatur unverändert (Layout deep-equal). Die Tastatur wird bei AM um ≈ 96 px schmaler. Im Querformat liegen Räder und Tastatur im Reiter SPIEL des MS-2000-Blatts (MK-P). Mulde und Rahmen im Metallton, Aufschrift PITCH und MOD (HB-MS S. 9; MK1 baute „BEND“ im Holzton).
- **Bedienung:** senkrecht ziehen, voller Weg = Radhöhe − 8 px. PITCH federt beim Loslassen in 80 ms zur Mitte, die Mittel-Rast ist sichtbar; MOD bleibt stehen. Jedes Rad hat seinen eigenen Zeiger (`setPointerCapture`), Rad und Tasten gehen gleichzeitig; ein zweiter Finger auf demselben Rad wird ignoriert.
- **Wirkung** live, nicht gespeichert, kein Undo. Während des Zugs zeigt die Anzeige den Wert (PITCH −63…+63, MOD 0…127). Die Rillen-Optik (CSS) wandert mit dem Wert. Die Aufnahme ● zeichnet die Räder nicht auf (Lücke in CHANGES).

**Regler-Verhalten:**
- Jeder Regler zieht senkrecht (Geste aus `sKnob`, Fein-Regel nach MK-P „Gesten“). Stufenwerte rasten ein. **Listen mit mehr als 12 Einträgen** (64 Speicherwellen über CONTROL 2, ≈ 30 SEQ-Ziele) sind stetige Regler mit Rundung (200 px Weg, `haptic('tick')` und LCD je Stufe); die App verlangt sonst je Stufe ≥ 18 px Weg (Z. 19979), bei 64 Wellen 1134 px. Die Auswahl-Liste eines Werts (`openPop`, Zeilen ≥ 44 px) öffnet ein Tipp auf die Anzeige der Platte (MK-P Umfang 4).
- Die LCD-Zeile zeigt Sektion, Name, Geräte-Wert und Klartext, z. B. „FILTER · CUTOFF 064 · 652 Hz“ oder „OSZ 1 · STEUER 2 (WELLE) Speicherwelle 12 ≈“.
- Eine Geste = ein Undo. Während der Geste geht der ungerundete Wert an das Worklet, gerundet wird beim Abschluss (EN3-03). Halten hat im AM-Bedienfeld keine eigene Bedeutung bis V5d (EN3-18, L4).
- Bearbeitet wird immer das gewählte Timbre (TIMBRE SELECT). Die LCD zeigt „T2“, wenn T2 gewählt ist.

**Kopf-Knöpfe:**
- 🎲 würfelt Wellen, CONTROL 1/2, OSZ2-Halbton aus {0, +7, +12, −12}, Mixer, Filter und Hüllkurven von T1. Danach gilt: Mixer OSZ 1 oder OSZ 2 ≥ 64 und Sustain + Decay hörbar. FX, Arp, Seq und Vocoder werden nicht gewürfelt.
- ◎ setzt einen Punkt auf jede SELECT-Taste, deren Seite von INIT AM abweicht (im EDIT-Modus), und an jeden Regler, dessen Wert abweicht (MK-P Umfang 5).
- ⋯ → Init lädt INIT AM; im Vocoder-Modus INIT AM mit `mode` 3 (Vocoder-Vorgaben, HB-MS S. 51).

**Zusatz-Ansichten** (MS2000-Werte, die viele Säulen brauchen): **SCHRITTE** (SEQ, MK6), **16 BÄNDER** (CH LEVEL/CH PAN, MK7), **EIGENE** (eigene Stimmung, MK3). Sie öffnen mit einem Tipp auf die Anzeige der Platte, wenn deren Zeile 2 „▸“ trägt (MK-P), und ersetzen die Platte im selben Rahmen; oben steht [◂ GERÄT] (44 px). Maße wie in MK3, MK6 und MK7 gebaut; im größeren Quer-Rahmen von MK-P werden die Säulen höher (Rahmenhöhe − 46 px), nicht breiter.

**Maße der Rahmen.** Hochkant gelten die Maße für den Inhalt des Seitenrahmens `.pg` der Synth-Blätter (`.sh-body` 8 px, `.pg` 6 px + 1 px Rand je Seite; Z. 1981–1982, 2201–2202): **Breite** P1 360 px, P2 345, P3 290, 12 Pro Max hoch ≈ 398, W 814; **Höhe** mit Safe-Area P1 ≈ 300 px, P2 ≈ 231, P3 ≈ 203, 12 Pro Max hoch ≈ 380. Quer gilt der Vollrahmen aus MK-P (12 Pro Max ≈ 832 × 363 px, L1 ≈ 750 × 325, L2 ≈ 667 × 331; Safe-Area 47 px je Seite und 21 px Home-Balken bei iPhones mit Notch). MK-P misst die echten Werte und trägt sie in CHANGES ein.
- Browser-Zoom (Doppeltipp-Zoom, Pinch) und Textauswahl bleiben aus; keine Seite scrollt.
- **Treffer:** Auf der Platte trifft ein Finger das nächste Bedienelement (MK-P „Treffer“). Alles außerhalb der Platte (Kopfzeile, Reiter, Karte, Pfeile, Listenzeilen, Räder, Tasten der Spiel-Ansicht, Zusatz-Ansichten) hat Trefferflächen ≥ 44 × 44 px; die Trefferfläche darf größer sein als das Bild (`::after`), Trefferflächen überlappen nicht.
- **Beschriftung:** M-PLATZ prüft für jedes Element scrollWidth ≤ clientWidth (L6, nichts abgeschnitten).
- Ansicht, Halt, Hälfte, Modus, Seite und alle anderen Zustände der Platte sind Ansichtszustand (`viewState`), nicht Teil des Sounds.

Jede neue Bedienfläche bekommt eine Hilfe-Zeile (Menü → Hilfe) und beim ersten Antippen einen LCD-Hinweis (L10). Die Texte sind eigene Sätze ohne Marken; den Engine-Namen setzen sie aus `MK_LABEL` ein.

### B.4 Leistung: Stimmen-Budget, CPU-Messung, Begrenzer, WebGL

- **Budget je AM-Spur:** höchstens 4 klingende Stimmen. Dazu Programm-Effekte und ggf. Vocoder. Ziel (Node-Offline), jede Grenze als Vielfaches **einer VA-Stimme aus demselben Lauf**: 4 Stimmen „Vollast MK1“ ≤ 4,8 × VA, mit FX + Seq + Arp ≤ 6,5 ×, Vocoder-Spur ≤ 8 ×. Die absoluten Xeon-Werte (VA ≈ 0,62 % Echtzeit, Spec §15.1) stehen nur zur Information in CHANGES; bei einem Widerspruch gilt das Verhältnis. Das iPhone-Verhältnis ist unbelegt (Spec §15.1: Faktor 2–2,5). Darum misst die **Leistungs-Probe** am Gerät.
- **Messverfahren:**
  1. **Node-Offline** `mk-node.mjs`: Es zieht den Worklet-Quelltext aus `index.html` (wie `fm-node.mjs`) und rendert 10 s Audio. Gemessen wird die Zeit je 128er-Quantum, Median aus 5 Läufen. Jede Grenze ist **relativ** zu einer VA-Stimme aus demselben Lauf angegeben, das gleicht Maschinenschwankung aus.
  2. **Chromium** `engineInfo().perTrack[i].load` als Gegenprobe in CHANGES (±40 % Streuung, keine Abnahmegrenze).
  3. **OfflineAudioContext** in Chromium mit dem App-Worklet für alle Klangmessungen (deterministisch, Rausch-Seed fest). Für `eng 3` zieht jede Note Rauschen und S&H je Stimme aus einem eigenen Zufallsgenerator = hash(seed, Timbre, Notenzähler dieses Timbres); das globale S&H nimmt hash(seed, LFO-Umlaufzähler). So ist ein Dual-Render gleich der Summe der Einzel-Renders, auch mit Rauschen. VA bleibt bitgleich (dort weiter Pool-Platz-Seed und `Math.random`).
- **Leistungs-Probe** (MK1, jedes MK-Paket ergänzt einen Fall): Menü → Info → **[Leistungs-Probe]**. Sie läuft auch in der Claude-App, weil sie kein Mikrofon braucht.
  - Sie legt 4 vorübergehende AM-Engines an (nicht im Projekt) und spielt je 4 Stimmen 10 s lang (Akkorde, Neuanschlag alle 0,5 s). Fälle: MK1 „Kern“, MK4 „+FX“, MK5 „+Arp“, MK6 „+Seq“, MK7 „Vocoder (synthetischer Modulator)“, MK-P „Bedienfeld“ (MK-P-09 g).
  - Jede Probe-Engine hängt über einen 0-Gain-Knoten am Ausgang (VS1-Muster, Z. 30372), damit sie sicher gerechnet wird und unhörbar bleibt. Die Probe zählt ihre `load`-Berichte selbst zusammen, weil `cpuLoad()` nur `AU.synth` sieht (Z. 12309).
  - Gemessen werden: **`load_med`** = Median über die 1-s-Berichte von **Σ load der 4 Probe-Engines** (dieselbe Größe, die der Begrenzer vergleicht), dazu `load_per_engine[]` und `load_max`. Aus dem Worklet je Sekunde die gerechneten Frames gegen `Date.now` (`frames_ok` = false unter 0,995 · sampleRate) und die längste Einzel-Quantum-Zeit (`quantum_max_ms`). rAF-Median. In Chromium die Zahl der `longtask` > 50 ms; auf iOS (Safari kennt `longtask` nicht) stattdessen die Zahl der rAF-Lücken > 50 ms und ob rAF bei ≈ 30 Hz gedeckelt ist (Stromsparmodus). Dazu `baseLatency`, `sampleRate`, `userAgent`.
  - Ergebnis als JSON mit [Ergebnis kopieren] [Als Datei]. Keine Netzaufrufe. [Abbrechen] jederzeit.
- **Grenze am iPhone (Gerät, Xander):** Fall „Kern“: `load_med` (Σ) ≤ 0,30 und `frames_ok`. Das lässt neben den Probe-Spuren Platz für Drums, Hall und Master eines echten Projekts; die Begrenzer-Stufe 1 beginnt schon bei 0,45 über alles. Liegt der Wert darüber, gilt bis zur Lösung: AM höchstens 2 Stimmen je Spur, sobald mehr als 2 AM-Spuren klingen (Klartext im Kopf, L9). CHANGES nennt Wert und Regel.
- **CPU-Begrenzer** (erweitert Spec §15.2, ändert nie Gespeichertes):
  - Stufe 1 (> 0,45): AM-Vocoder-Bänder auf 2. Ordnung, umgeschaltet mit 30-ms-Überblendung zwischen beiden Bänken und Pegelausgleich (Bandenergie ± 1 dB zur 4. Ordnung); AM-Unison ≤ 2 Stimmen für neue Noten.
  - Stufe 2 (> 0,60): AM-Spuren ≤ 2 Stimmen für neue Noten (Dual/Split: 1 + 1; Unison: 2 gestapelte); Mod-FX Ensemble → 1 Abgriff. Ab Stufe 2 ersetzt der vorhandene Begrenzer die 30-ms-SXF durch die WP4-Senke (`xfLite`, Z. 12331). Die M-EINBRUCH-Zusagen der MK-Abnahmen gelten deshalb nur bis Stufe 1.
  - Stufe 3 wie v2.
- **WebGL:** keiner (EN3-13). Canvas 2D für Seq-Säulen, Band-Pegel und die Karte (MK-P), gezeichnet ≤ 30 Hz und nur bei sichtbarer Seite. Das Bedienfeld (MK-P) ist DOM mit CSS ohne Bild-Dateien; LEDs und Anzeige ändern nur Klassen bzw. Text, höchstens einmal je Bild; die Tempo-LED schaltet per CSS-Klasse im Takt, nicht per Zeichnen. PE1 prüft das.
- **Tabellen (gemeinsamer Bau nach Spec §10.1):** Ein **DOM-freier** Bau `mkTables(spec) → Float32Array[]` (kein `window`/`document`; die Häppchen steuert der Aufrufer) ist der Tabellen-Bau, den §10.1 für V8a plant und den V4e mitnutzt. Er portiert das Verfahren von V4a (Mip-Kette je Oktave); `waveTab` bleibt unverändert im Worklet. Weicht MK2 bei den Größen von §10.1 ab, gilt die MK2-Festlegung als neue gemeinsame Definition (Teil G Nr. 9). Die App wertet ihn bei Bedarf aus; `mk-node.mjs` lädt denselben Text.
  - **Hauptfaden:** Häppchen ≤ 8 ms (`requestIdleCallback`, Rückfall `setTimeout`), vorher `tickAhead(.3)`, zwischen zwei Häppchen mindestens ein Scheduler-Tick.
  - **Worklet:** eine **MKW-Tabelle auf Modul-Ebene** im `AudioWorkletGlobalScope`, die alle Prozessoren eines Kontexts teilen. Der Hauptfaden schickt jede Tabelle **einmal je Kontext** an irgendeinen AM-Knoten (`{mkw}`, Transfer); die Stimmen greifen über die Tabellen-Nummer zu. Zeigt sich, dass ein Kontext die Tabelle nicht teilt, wird je Knoten kopiert (wie §10.1).
  - Bis eine Tabelle da ist, spielt die Stimme die Platzhalter-Säge (LCD „≈“) und wechselt dann mit der 2-ms-Blende.
  - Das Worklet rechnet keine Tabellen im Audio-Takt (ein kalter Bau im Quantum kostete 29 ms, Z. 3671). Delay- und Chorus-Puffer entstehen beim ersten Bedarf im Konstruktor bzw. im Nachrichten-Weg, nie in `process()`.

### B.5 ECO-Rückfall (Worklet nicht verfügbar oder `forceNative`)

`mkToFlat(p.mk)` (immer geladener Teil, EN3-14) bildet Timbre 1 auf den flachen VA-Patch ab, den NativeVoice spielt:
- Wellen: Säge → 0, Puls → 1 mit `pw` aus W-25, Dreieck → 2, Sinus× → 3, alle anderen → 0. OSZ2 Säge/Rechteck/Dreieck → 0/1/2.
- Halbton/Fein → `o2semi`/`o2fine`, Sync → `o2sync`. Mixer → Pegel/127.
- Filtertyp → 0/1/3/5. Cutoff, Res, EG1 Int, Keytrack, Hüllkurven und LFOs über die W-Tabelle.

Ohne T2, FX, Seq und Vocoder. Der **Arp läuft auch im ECO-Klang** (er sitzt im Hauptfaden; nur T1-Noten, derselbe Planer). Ein **Vocoder-Programm** (`mode` 3) spielt im ECO-Klang nicht den rohen Träger, sondern bleibt stumm mit LCD „Vocoder braucht den Worklet-Klang“. Die Selbstoszillation (W-02) nutzt das vorhandene Ersatz-Pfeifen des ECO-Klangs. Badge „ECO-Klang“. Hinweis im LCD „MS 2000 im ECO-Klang: nur Grundklang“ (Name aus `MK_LABEL`).

### B.6 Gemeinsame Regeln und Prüfverfahren

1. **Neutral und bitgleich (I-10):** Jedes neue Feld hat einen neutralen Wert. Vorhandene Klänge aller Engines und die AM-Klänge des Vorgänger-Pakets rendern bitgleich (Node-Offline, max |Δ| ≤ 1e-6), außer ein Paket nennt es anders. **„Vorgänger“** heißt in allen Abnahmen: der zuletzt ausgelieferte Stand, dessen Version CHANGES nennt, keine feste Nummer (MK-P und MK8 bekommen ihre Nummern erst in Lieferreihenfolge, E.1).
2. **Glätten und Blenden (L3):** Stetige Werte werden mit τ ≥ 5 ms geglättet. **Bruchwerte:** Während einer Geste geht der ungerundete Reglerwert an das Worklet (EN3-03); das Worklet rechnet Bruchteile über die W-Tabelle, SEQ „Glatt“ und die Patches ebenso. Strukturwechsel bei klingender Note gehen über die vorhandene **30-ms-Stimmenblende (SXF)**: Welle, OSC MOD, Filtertyp, HK │ GATE. **Umverteilende Wechsel** (Zuweisung, Priorität, Auslösung, MODUS, STIMMEN) gehen über die **Engine-Blende `engXf`** (Z. 4104): alte Stimmen 40 ms als Geister ausblenden, gehaltene Tasten unter der neuen Regel neu verteilen, Einblendung über den Attack (≤ 0,5 s); SXF kann keine Stimmen neu verteilen (Z. 4046). **Abweichungen von L3** (ausdrücklich): (a) Mono ↔ Poly ist hier ein umverteilender Wechsel über `engXf`; L3 behandelt ihn sonst als Grundklang-Einstellung, die gehaltene Stimmen loslässt. (b) SEQ-Stufen: „Stufe“ = lineare 1-ms-Rampe ab der Blockgrenze (Amplitude, Pan, Cutoff). (c) Tabellen-Wellen wechseln mit 2-ms-Gleichleistungs-Blende bei phasenstetigem Lesen statt 30–50 ms. Jede Abnahme mit Umschalten prüft **M-KLICK und M-EINBRUCH** (bis Begrenzer-Stufe 1, B.4).
3. **Hörbarkeit:** Jeder Regler einer AM-Sektion erfüllt H-1 und H-3 (Spec §0.3). Die Ausnahmen sind benannt: BEND nur mit bewegtem PITCH-Rad, TEMPO nur mit Sync/Arp/Seq, NEUSTART nur bei Neuanschlag, Werte ohne Wirkung in der gerade gewählten Welle.
4. **Undo:** eine Geste = ein Undo (`soundEdit`/`commitSound`). Laden eines Programms = ein Undo mit Toast [Rückgängig].
5. **Layout:** M-PLATZ in P1, P2, P3, L1, L2, W, 428 × 926 und 926 × 428 für jeden neuen Zustand (Gesamtansicht, jeder Halt, Spiel-Ansicht, EDIT, GLOBAL, Zusatz-Ansichten, Vocoder), mit den Rahmen-Maßen aus B.3 und MK-P, den Safe-Area-Durchgängen (47 px links und rechts, 21 px Home-Balken) und scrollWidth ≤ clientWidth für jede Beschriftung. **M-RAHMEN** (neu, MK-P-13): Kein Zustandswechsel ändert das Rechteck des Rahmens, die Blatt-Höhe oder die Seitenhöhe (± 0 px), 0 `layout-shift`; gezoomt wird nur per `transform` innerhalb des Rahmens. **M-ANSICHT:** Ein Zustandswechsel verschiebt kein Element außerhalb der Platte um mehr als 2 px. **M-VORLAGE** (MK-P-01): Lage der Platte gegen die Lage-Tabelle aus HB-MS S. 5. Treffer nach B.3 „Maße der Rahmen“. Die Bildschirmfotos aller Formate kommen in CHANGES (für Xanders Sicht-Abgleich). Die Zonen-Prüfung M-SKIZZE der Pakete MK1–MK7 gilt nur bis MK-P.
6. **Oktav-Tabellen:** Für Wellen, deren Spektrum in Hz fest sein soll (Endlos, Gruppe 61–64, später Aufnahmen aus MK10; die Stimmwelle wird live gerechnet, W-28), gibt es je Oktave (C1…C8) eine eigene Tabelle mit eigenen Mipmaps. Die Stimme blendet zwischen den zwei Nachbaroktaven nach der gespielten Tonhöhe (je Steuerblock, wie K2-40). Speicher je Welle ≤ 8 × Mipmap-Satz. Gebaut wird nur, was ein geladener Sound braucht.
7. **Worklet-ASCII** und Quelltext-Grenzen wie bisher (`check-worklet`).
8. **Geräte-Abgleich:** entfällt, weil es kein Gerät gibt (EN3-16). Kommt später eins dazu, ist eine Änderung der W-Tabelle ein eigener kleiner Fix-Schritt (`MKn-fix`) mit Messwert vorher und nachher.
9. **Kein Markenwort, genau eine erlaubte Beschriftung** (EN3-05), in jedem MK-Paket:
   - (a) **AM-Teil** (Block `sq-mk-src`, Block `sq-mkrec-src` falls MK10 gebaut wird, AM-Zweig des Worklets zwischen den Marken `/*MK{*/` … `/*}MK*/`, AM-Hilfe- und LCD-Zeilen, AM-Werksnamen): `grep -ciE 'korg|micro ?korg|ms[ -]?2000|radias|dwgs|dw[ -]?[68]000|\bvox\b'` = 0. Der immer geladene Teil zählt mit, außer der einen Zeile mit `MK_LABEL`.
   - (b) **Ganze `index.html`:** `grep -ciE 'micro ?korg|radias|dwgs'` = 0. `grep -oiE 'ms[ -]?2000'` ergibt **genau 1** Treffer, und der ist wörtlich `MS 2000` (Großbuchstaben, U+0020) in der Zeile `MK_LABEL = 'MS 2000'`. Im laufenden DOM steht „MS 2000“ nur als Text von Engine-Knopf bzw. -Chip, `ENGINE_LABEL`-Ausgaben (Blattkopf, Browser, MIDI-Spurname), Bibliotheks-Filter und daraus gebildeten LCD-/Hilfe-Zeilen; das Bedienfeld selbst zeigt es bis MK-P nicht, ab MK-P genau einmal im Namensfeld (Text aus `MK_LABEL`, App-Schrift).
   - (c) **Kein Logo, keine Korg-Schrift:** Das Bedienfeld lädt keine neue Schrift (`@font-face` = 0 neue Einträge), enthält keine Bild-Daten (`data:image`, `<img>`) und keine Fläche, die einen Schriftzug nachbildet; FP-SICHER prüft die Bildschirmfotos aus MK-P-02 und MK-P-07 zusätzlich mit dem Auge.
   - Trifft ein Base64-Datenblock (Nachzeichnung MK2, Werksdaten MK8; Speicherwellen MK10, falls gebaut) zufällig ein Wort (≈ 4,6 % je 24 KB), ändert das Bau-Skript die Kodierung (ein Salz-Byte) und prüft neu. Datenblöcke werden nicht ausgenommen.
   - Spätere Pakete, die nach ihren Regeln Geräte im ⓘ nennen (V10P, V10d, VI3), lässt die Prüfung nicht scheitern.
10. **Filter-Bauform:** Neue 2-Pol-Filter und Resonatoren (W-29, Analyse- und Synthese-Bänder des Vocoders, Formant-Resonatoren der Vokal-Quelle W-44) sind **TPT-SVF** (Zero-Delay) mit g aus `GTAN` (gleiche Klemme 0,45 · SR, Z. 3836) und g/R je Sample über den 16er-Block interpoliert (wie die Ladder, Z. 5090). Keine Direktform-Biquads mit Koeffizientensprüngen, kein Chamberlin-SVF (instabil über ≈ fs/6).
11. **Denormale:** Jeder neue IIR- oder Rückkopplungs-Zustand (Vocoder-Bänder und Folger, Phaser, EQ, Formant-Resonatoren, W-29, Delay) bekommt den wechselnden ±1e-20-Versatz (wie Z. 5332) oder wird am Blockende unter 1e-15 auf 0 gesetzt.
12. **Gefaltete Energie** (eine Definition für alle MK-Alias-Grenzen): Gleichanteil entfernen, Bins unter f0/2 nicht werten; Blackman-Fenster, ≥ 2^15 Punkte, sr 48 kHz; harmonische Bins = k·f0 ± 6 Bins. Gemessen wird die nicht-harmonische Energie von 20 Hz bis 10 kHz relativ zur harmonischen Energie im selben Band. Der Vollband-Wert steht nur in CHANGES (Säge C7 mit dem wiederverwendeten polyBLEP ≈ −28 dB). Ring und Sinus× haben keine Grenze; ihre Werte stehen als gewollter Charakter in CHANGES.

### B.7 Test-API (ergänzt Spec §16; Rückgaben sind tiefe Kopien, ändernde Aufrufe = ein Undo)

```ts
mkGet(t: number): MkPatch                                  // p.mk der Spur t
mkSet(t: number, path: string, v: number | number[]): void  // z. B. 't.0.f.cut', 'mfx.dep' – über normMk geklemmt
mkRender(sound: Sound, ev: [t: number, typ: 'on'|'off', note: number, vel: number][], o?: {sec?: number, sr?: number,
         seed?: number, bpm?: number, inputs?: {e1?: Float32Array, e2?: Float32Array}}): Promise<{l: Float32Array, r: Float32Array}>
                                                            // seed = Zufall je Note (B.4 Nr. 3)
mkScope(t: number): {voices: {note, t, eg1, eg2, lfo1, lfo2, cutHz, seqStep?: number[]}[], seq?, vocBands?: number[]}
mkInfo(): {loaded: boolean, tables: number, tableBytes: number, blockMs: number, waves: 'platzhalter'|'lokal'|'eingebaut'}
mkWheel(t: number, w: 'bend'|'mod', v?: number): number   // setzt (Test) bzw. liest den Live-Wert des Rads; nicht gespeichert, kein Undo
mkPanel(): {fmt: string, rahmen: {x, y, w, h}, z: number, ansicht: 'ganz'|'zoom'|'spiel', haelfte?: 'links'|'rechts', halt?: number,
            halte: {nr: number, station: string, x: number, y: number, w: number, h: number, z: number}[],
            modus: 'spiel'|'edit'|'global', seite: string, cursor: number, timbre: 1|2, fxSel: 0|1, patchSel: 0|1|2|3,
            seqSel: 0|1|2|3, lauf?: number,
            elements: {id, art, x, y, w, h, zone?: {x, y, w, h}, bind?, grau, led?}[]}   // ab MK-P (MK-P Umfang 6); bis MK-P die Form aus MK1 (Zonen)
mkView(o: {ansicht?, haelfte?, halt?, modus?, seite?}): void                         // ab MK-P, nur für Tests, kein Undo
arpLog(t: number): {t: number, note: number, vel: number, dur: number, step: number}[]   // ab MK5
perfProbe(cases?: string[]): Promise<object>                                              // die Leistungs-Probe
mkRecInfo(): {step: number, steps: number, input: {label: string, ec: boolean, ns: boolean, agc: boolean, ch: number, sr: number},
             peakDb: number, rmsDb: number, notes: number, ok: boolean[]}                // Aufnahme-Seite, nur mit MK10
```


---
## Teil C — Pakete

Jedes Paket ist einzeln auslieferbar und hörbar prüfbar. Zu jedem Paket gehören:
- „Regression und DoD“ nach Spec §1.3: keine Konsolenfehler, M-PLATZ, Worklet-ASCII, PE1, Budget, CHANGES, Snapshot.
- die Fach-Prüfung nach N2 Teil J (Zeile „Fach-Prüfung“; ● = blockierend).
- die Regeln B.6.

Testskripte liegen in `dirigent-test/` (Chromium-Pfad wie in CHANGES V2d′: `chromium-1243`). Sie enthalten nie Werksnamen-Listen (EN3-07).

**Stand 26.10. (Rev. 3):** MK0–MK7 sind gebaut und ausgeliefert (4.8.1, 4.9.0–4.15.0). Ihre Abschnitte bleiben als Bau-Beleg stehen; Klang, Daten, Format und ihre Klang- und Daten-Tests gelten weiter. Was sie zur Oberfläche sagen (Bedienfeld nach der alten Vorlage: Drehschalter EDIT-WAHL 1/2, fünf Regler mit Matrix und SHIFT-Ebenen, BANK/SEITE/Nummerntasten, Holzwangen, Halb-Ansicht, M-SKIZZE, die iPhone-Punkte dazu), bleibt bis zur Auslieferung von MK-P die laufende Oberfläche und Regression; dann ersetzt MK-P es (Umfang 5 und 6). Ihr Geräte-Abgleich entfällt (EN3-16). Offen sind **MK-P** und **MK8**, zurückgestellt sind **MK9** und **MK10**, die RADIAS-Pakete MK11–MK13 sind gestrichen.

### MK0 — Vorab-Schutz: Klänge neuerer Engines bleiben erhalten (4.8.x)

> **Gebaut, 4.8.1.** Bau-Beleg (Teil C, Kopf).

**Ziel.** Bevor es AM-Sounds gibt, verliert kein ausgelieferter Stand mehr Klänge einer neueren Engine. Ein Partner im Paar-Raum, ein alter Cache oder ein Rückfall auf 4.8.x überschreibt nichts (EN3-04).

**Umfang.**
1. **`normalizeSound`:** Ein Sound mit unbekannter Engine bleibt **undurchsichtig** erhalten (`engine`, `p`, `mods`, `fx` unverändert kopiert). Die Spur spielt INIT, LCD und Bibliothek zeigen „Klang aus neuerer Version“.
2. **Überschreib-Sperre:** Enthält das KV-Projekt, die Bibliothek oder die Cloud-Bibliothek eine unbekannte Engine oder ein Format über `PROJECT_FORMAT`, überschreibt Autosave die KV-Kopie nicht, und die App schickt kein `cloudLibPush` einer Liste ohne diese Sounds. Hinweis im Kopf (L9).
3. **Alle Lade-Wege:** `projFromFile` (Cloud und Projektwechsel, Z. 27450, 27481, 27648, 27819, 27858), `Autosave.load` (Z. 8340), `Library.load` (Z. 8247), `cloudLibMerge`, Datei-Import (`parseFile`).
4. `save_project` bleibt, wie es ist (VO-R1). `save_library` ist der Weg ohne Server-Wächter; Umfang 2 schützt ihn.

**Nicht-Umfang.** AM selbst. Der Formatsprung (kommt mit MK1).

**Daten.** Kein neues Feld, Format bleibt 4.

**Dauer** 2–3 h · **Version 4.8.1** (`APP_CODE` 4 008 001; ist V2e′ noch nicht ausgeliefert, als Teil von V2e′; kommt VS3 vorher, die nächste freie Zwischennummer) · **Budget** +4 KB · Format bleibt 4.

**Abnahme-Checkliste**
- [ ] **MK0-01 Undurchsichtig:** Ein Sound mit Engine `'xyz'` übersteht Laden → Speichern → Laden deep-equal, im Projekt, in der Bibliothek und in der Cloud-Bibliothek (Fake-Supabase). Die Spur spielt INIT mit Hinweis, keine Konsolenfehler.
- [ ] **MK0-02 Keine Überschreibung:** Projekt mit Format 5 bzw. mit unbekannter Engine aus KV, Cloud und Paar-Raum: Autosave schreibt nicht über die KV-Kopie, kein `save_library` ohne diese Sounds, Hinweis sichtbar.
- [ ] **MK0-03 Unverändert:** Projekte und Bibliotheken ohne unbekannte Engine verhalten sich deep-equal wie beim Vorgänger-Stand; alle Klänge bitgleich. Budget ≤ +4 KB.

**Tests.** `mk0-schutz.mjs` (Fake-Supabase, `online.md` §7.7).

**Fach-Prüfung:** **FP-SICHER ●** Haupt-, **FP-DSP** Zweit-Blick.

**Risiken.** Stände vor 4.8.1 verwerfen weiter. Darum geht `max_format` 5 erst online, wenn MK0 ausgeliefert ist (E.5 Nr. 2).

---

### MK1 — Klangkern (Timbre 1), erstes Bedienfeld, Räder, Leistungs-Probe

> **Gebaut, 4.9.0.** Bau-Beleg; die Bedienfeld-Teile dieses Abschnitts gehören zur alten Vorlage und werden durch MK-P ersetzt, der Geräte-Abgleich entfällt (Teil C, Kopf).

**Ziel.** Xander wählt auf einer Synth-Spur die neue Klangerzeugung **„MS 2000“** und spielt einen vollständigen MS2000-Grundklang. Dazu gehören Säge, Puls und Dreieck mit ihren Form-Reglern, OSZ 2 mit Ring/Sync/Ring+Sync, Mixer, alle vier Filtertypen, Verstärker mit Verzerrung und Gate, zwei Hüllkurven, zwei LFOs, Tonhöhe sowie Mono/Poly/Unison. Er bedient das auf einem Bedienfeld, das aussieht wie die Vorderseite seines microKORG (ohne Marke, B.3), spielt BEND- und MOD-Rad links der Tasten und kann am iPhone messen, ob es flüssig läuft.

**Umfang.**
1. **Daten und Format:** Engine `mk`, `p.mk` mit `normMk` (B.1), Format 5 (EN3-04; der Schutz für unbekannte Engines kommt aus MK0), INIT AM, `setEngineOf` für `mk` (Liste und Aufräumen eines unberührten INIT-`p.mk`), `ENGINE_LABEL.mk`, Engine-Listen des Browsers, Engine-Wahl im Kopf mit „MS 2000“ (B.3 Zeile 1; `MK_LABEL`, EN3-05; Chip nach H-13).
2. **Worklet `eng 3`:** Es rechnet nur Timbre 1 (`mode` 0; Dual/Split ab MK3).
   - **Weg dorthin:** `{mk}`, `processorOptions.mk` und `{mkSet}` (N3.0.4, B.1). Der flache VA-Zustand ruht: `wkMods = []`, `glideFrom = −1`, keine nativen `fx.*`-LFO-Routen (B.1).
   - **OSZ 1:** Säge (W-24, polyBLEP für beide Sägen), Puls (W-25, polyBLEP), Dreieck (W-26, polyBLAMP). LFO1 wirkt über STEUER 2 (WFM/PWM). Die Wellen 3–7 klingen bis MK2 bzw. MK7 als Säge, das LCD sagt „ab MK2“. Die Werte werden trotzdem gespeichert.
   - **OSZ 2:** Säge, Rechteck, Dreieck. Halbton ±24, Fein W-14.
   - **OSC MOD:** Ring = OSZ 1 × OSZ 2 als OSZ-2-Ausgang (HB-MS S. 38). Sync = OSZ 2 wird von OSZ 1 zurückgesetzt, über den vorhandenen Sync-Pfad mit polyBLEP. Ring+Sync = beides.
   - **Mixer, Rauschen:** weißes Rauschen im Mixer.
   - **Filter:** Ladder-Abgriffe 0/1/3/5, W-01 … W-05, Selbstoszillation nach W-02.
   - **Verstärker:** W-19 … W-23 (Verzerrung nach dem Filter, mit ADAA); HK │ GATE (Gate: Anstieg 1 ms, Abfall 3 ms).
   - **Hüllkurven:** EG1, EG2 (W-06, W-07). NEUSTART aus = Neuanschlag ab dem aktuellen Pegel. Das gilt bei Poly und bei Mono/Unison mit Multi (HB-MS S. 41).
   - **LFOs:** LFO1/LFO2 mit allen Wellen; Rechteck(+) unipolar. Key Sync aus / Timbre (Phase setzt bei der ersten Note nach „alle los“ zurück; mit Arp gilt der Tastensatz aus KEYS, MK5) / Stimme. Tempo Sync W-09.
   - **Feste Wege:** LFO1 → OSZ1-Steuer, LFO2 → Tonhöhe über VIBRATO × Mod-Rad, EG1 → Cutoff, EG2 → Amp.
   - **Tonhöhe:** Transponieren, Fein, Portamento W-13, Bend W-17 über das BEND-Rad.
   - **Stimmen:** höchstens 4.
     - **Priorität gilt für jede Zuweisung**, sobald mehr Tasten gehalten werden, als das Timbre Stimmen hat (Poly 4 bzw. `tv`-Anteil; Mono/Unison 1 Note): Last = die älteste wird gestohlen, Low = die n tiefsten klingen, High = die n höchsten klingen. Frei werdende Stimmen gehen an zurückgestellte Tasten zurück [U] (HB-MS S. 35; der microKORG kennt nur Last, HB-MK S. 16).
     - Mono hat einen Notenstapel nach dieser Priorität.
     - Unison legt alle 4 Stimmen auf eine Note (W-15).
     - Auslösung Single: Legato startet Hüllkurven und LFO nicht neu. Portamento wirkt bei Mono/Unison + Single nicht auf die erste Note (HB-MS S. 36).
   - **Strukturwechsel** (Welle, OSC MOD, Filtertyp, HK │ GATE) bei klingender Note laufen über die SXF-Blende; Zuweisung, Priorität und Auslösung über `engXf` (B.6 Nr. 2).
   - **Zufall** je Note aus eigenem Generator (B.4 Nr. 3). **Denormale** und **gefaltete Energie** nach B.6 Nr. 11 und Nr. 12.
3. **Bedienfeld** (B.3, Referenz-Skizze): Reiter [GERÄT] [FX]. Das ganze Bedienfeld wird gebaut, mit allen Zonen Z1–Z13, Holzwangen und Material; was erst spätere Pakete füllen, ist dunkel mit „–“ (die Plätze bleiben, M-ANSICHT).
   - **Aktiv ab MK1:** VOLUME; BANK und SEITE (Seite A bleibt bis MK8 leer, Tasten dunkel „–“; Seite B listet die eigenen AM-Sounds der Bibliothek, sortiert A–Z, B.11 … B.88); Nummerntasten 1–8; SPIEL (beide LEDs); EDIT-WAHL 1 mit allen 11 Stellungen (STIMME bis MK3 nur Synth/Einzeln, die übrigen Werte gesperrt mit Hinweis); Regler 1–5 mit Ebene 2 über SHIFT; Matrix (beide Zeilen) und Programm-Zeile; Anzeige; ORIGINAL-LED; WRITE; SHIFT mit SHIFT + 3 (Init), SHIFT + SEITE und SHIFT + OKT ▲/▼; OKT ▼/▲ an `tr.kbOct`.
   - **Dunkel bis zu ihrem Paket:** EDIT-WAHL 2 (PATCH ab MK2, MOD-FX/DELAY/EQ ab MK4, ARP A/B ab MK5, STIMMUNG ab MK3, SEQ ab MK6), TIMBRE (MK3), ARP (MK5), E1/E2 (MK7), SHIFT + 1/2/4/5.
   - **Hochformat** in zwei Hälften (P1); Halb-Ansicht über die Reiter [LINKS] [RECHTS] in P2, P3, L2 und im Querformat mit Home-Balken (B.3 Maße).
   - Kopfzeile 1 nach B.3 (Breiten-Budget je Format, „MS 2000“ ein- oder zweizeilig; Chip in P2/P3 nach H-13).
   - Dazu LCD-Texte, Hilfe-Zeilen, 🎲, ◎ und ⋯ Init.
4. **ECO-Rückfall** (B.5).
5. **Leistungs-Probe** (B.4), Fall „Kern“, mit 0-Gain-Anschluss und Σ-Messung.
6. **Code-Ort** nach EN3-14: immer geladener Teil (`normMk`, INIT AM, `mkToFlat`, `loc`-Behandlung; `mkLocalStrip` kommt mit MK9 dazu) im oder vor `SQStore`; `sq-mk-src` bei Bedarf, beim Öffnen eines AM-Projekts schon während des Ladens, vorher `tickAhead(.3)`.
7. **Test-API** `mkGet`, `mkSet`, `mkRender`, `mkScope`, `mkInfo`, `perfProbe`.
8. **Räder** (H-5, entschieden): BEND- und MOD-Rad als Touch-Räder links in `#kbArea`, nur bei AM-Spuren (B.3 „Räder“, B.1 „Räder“, W-17). Live-Werte je Spur, nicht gespeichert, kein Undo; Rad und Tasten gleichzeitig. **Freiwillige Zugabe, nie nötig** (EN3-21): Am Desktop setzt `onMidiMsg` mit 0xE0 und CC1 dieselben Live-Werte; iOS Safari hat kein Web MIDI. Fehlt die Zugabe, fehlt nichts.

**Nicht-Umfang.**
- Sinus×, Stimmwelle, Speicherwellen, Rauschen-Oszillator und Patches (MK2).
- Timbre 2, Split und Stimmung (MK3). Effekte (MK4), Arp (MK5), Seq (MK6), Eingänge und Vocoder (MK7).
- Werksklänge (MK8).
- App-Mod-Picker und Morph für AM-Regler (V5d/V6a). AM als Pad-Quelle (V1d).

**Daten.** Siehe B.1 (alle Felder werden ab MK1 gespeichert). Spur: kein neues Feld (`mkIn` erst mit MK7).

**Oberfläche.** Siehe B.3. Neu sind das Bedienfeld nach der Referenz-Skizze (Drehschalter, Kappen-Regler, LED-Tasten, Anzeige, Holzwangen, SHIFT-Ebenen, Halb-Ansicht) und die Räder an der Tastatur. Der Kopf bleibt; die Engine-Wahl bekommt „MS 2000“ (4. Knopf bzw. Chip nach H-13). Alle Maße gelten vom `.pg`-Inhalt aus (B.3).

**Berührungspunkte.**
- **Wiederverwendet:** AnalogCore mit Pool, Ereignissen, Tempo, SXF und Lastbericht; `envCoefs`, `lfoVal`, Ladder `FMIX`, polyBLEP/Sync; `normalizeSound`, `soundHash`, Bibliothek, `INIT_IDS`; `sheetFrame`, `sKnob`, `knobRow`, `lcdShow`, `openPop`, fit-Klassen; `soundEdit`/`commitSound`; NativeVoice; Muster des VS0-Testblatts; `engineInfo`.
- **Neu:** `eng 3` mit Form-Säge, Form-Dreieck, Ring/Ring+Sync, Gate, Neustart, Priorität für alle Zuweisungen, Stapel-Unison, Rechteck(+), Key Sync Timbre, Selbstoszillation, ADAA-Verzerrung, Zufall je Note; Protokoll `{mk}`/`{mkSet}`; `normMk`, `mkToFlat`, `MK_LABEL`, W-Tabelle als eine Datenstruktur, Bedienfeld-Bausteine (Kappen-Regler, Drehschalter mit Auswahl-Liste, LED-Tasten, 7-Segment-Anzeige, Holzwangen), SHIFT-Ebenen, Räder, Leistungs-Probe, Block `sq-mk-src`, freiwillig MIDI-Bend/CC1.
- **Anzupassen:** `ENGINE_LABEL` (Z. 11162; sonst zeigen `soundLabel` Z. 20359, Browser Z. 24555 und MIDI-Spurname Z. 28737 „VA“), Browser-Engine-Listen (Z. 24409, 24509; sonst fehlt AM unter „Alle Engines“), `setEngineOf` (Z. 20343) mit Aufräumen (Z. 20352), `rebuildNativeLfos` (Z. 12113), `spawnWkVoice` (Glide Z. 12568, Flush Z. 12571), `SynthHost.track` (Z. 9384), `#kbArea` (Räder links, nur bei AM-Spuren; Z. 3494), Oktav-Wahl `tr.kbOct` (Z. 18917), freiwillig `onMidiMsg` (Z. 29030).

**Dauer** 19–22 h in drei Bau-Abschnitten (Rev. 1: +3 h für Protokoll, Priorität, `engXf`, Bruchwerte, MIDI-Rad, Probe-Messung, Engine-Listen und Kopfzeile; Rev. 2: +4–4,5 h für das Bedienfeld wie das Original mit Halb-Ansicht hoch und quer und M-SKIZZE, +1–1,5 h für die Räder):
1. Daten, Format, Protokoll, Worklet, DSP-Tests.
2. Bedienfeld nach der Referenz-Skizze, Räder, UI- und Aussehens-Tests.
3. ECO, Probe, freiwillig MIDI-Bend/CC1, Regression.

Eine Version: **4.9.0** · **Budget** +115 KB (Rev. 2: +15 KB für Bedienfeld-Material und Räder) · **Format 4 → 5.** Rollout `max_format` 5 und `max_app` 4 009 000 nur mit Xanders Okay (N2 G.8) und erst nach MK0. Vorher speichert die App lokal.

**Abnahme-Checkliste**
- [ ] **MK1-01 Daten:** Ein Prüfskript setzt 1000 Zufalls-Patches mit Werten außerhalb der Bereiche. `normMk` klemmt jeden Wert auf Teil A, Listenwerte sind ganzzahlig. Unbekannte Schlüssel fallen weg. Speichern → Laden ist deep-equal, `soundHash` ist stabil. VA → AM → VA stellt den VA-Klang bitgleich her; ohne Geste dazwischen ist der `soundHash` gleich und der Sound nicht „geändert“. Ein Undo nach dem Wechsel stellt den Sound deep-equal her. AM-Sounds heißen in Blattkopf, Browser und MIDI-Spurname „MS 2000“ (`MK_LABEL`) und stehen im Browser unter „Alle Engines“.
- [ ] **MK1-01b Kalt-Start:** Bibliothek mit AM-Sound, Kalt-Start, ohne AM zu öffnen, dann Neuladen: `p.mk` deep-equal, `mkInfo().loaded === false`.
- [ ] **MK1-02 Format:** Neue Projekte haben `format` 5. Projekte mit Format 3 und 4 laden deep-equal (nach `normalize`). Demo und alle Werks-Sounds (VA, FM, WT, Kits) klingen offline bitgleich zum Vorgänger-Stand (B.6 Nr. 1; max |Δ| ≤ 1e-6).
- [ ] **MK1-02b Fremde Engine:** Ein Sound mit Engine `'xyz'` übersteht Laden → Speichern → Laden deep-equal, auch in der Bibliothek und der Cloud-Bibliothek (MK0 bleibt erfüllt).
- [ ] **MK1-03 Kein Markenwort** (B.6 Nr. 9 a, b und c): 0 Treffer; „MS 2000“ genau einmal (`MK_LABEL`); keine neue Schrift, keine Bild-Daten im Bedienfeld.
- [ ] **MK1-04 Säge** (24LPF Cutoff 127, Gate, C3):
  - Teiltöne 1–20 liegen innerhalb ±0,5 dB von 1/n.
  - C7: gefaltete Energie (B.6 Nr. 12) ≤ −50 dB (gerechnet mit dem polyBLEP der App: −53,2 dB).
  - STEUER 1 = 127: die ungeraden Teiltöne von f liegen ≤ −40 dB unter dem 2. Teilton.
  - STEUER 1 = 64: der 1. Teilton liegt 6 ± 1 dB unter dem Wert bei 0.
- [ ] **MK1-05 Puls:**
  - STEUER 1 = 0: gerade Teiltöne ≤ −40 dB.
  - STEUER 1 = 64: Tastverhältnis 24,8 ± 1 % (aus dem Signal gemessen).
  - STEUER 1 = 127: RMS ≤ −60 dBFS.
  - STEUER 2 = 127 mit LFO1 Dreieck: Das Tastverhältnis wandert nach W-25, ohne Knacken (M-KLICK).
  - C7: gefaltete Energie (B.6 Nr. 12) ≤ −50 dB.
- [ ] **MK1-06 Dreieck:**
  - STEUER 1 = 0: 3. Teilton −19,1 ± 0,5 dB.
  - STEUER 1 = 127: Der stärkste Teilton liegt bei 3·f (± 1 FFT-Bin).
  - C7: gefaltete Energie (B.6 Nr. 12) ≤ −50 dB.
- [ ] **MK1-07 OSZ 2:**
  - Halbton +12 ergibt f₂ = 2·f₁ ± 1 ct.
  - Fein +1 / +24 / +48 / +63 ergibt +0,5 / +300 / +1200 / +2400 ct, jeweils ± 0,5 / 2 / 2 / 3 ct (W-14).
  - Wellen wie MK1-04 bis MK1-06.
- [ ] **MK1-08 Ring** (OSZ 1 Dreieck 440 Hz, OSZ 2 Dreieck Halbton +6, Mixer OSZ 1 = 0, OSZ 2 = 127; bei +7 läge das Produkt 3·f₁ − f₂ nur 1,5 Hz neben f₂):
  - Die zwei stärksten Spitzen liegen bei f₂ − f₁ und f₁ + f₂ (± 1 Bin).
  - 440 Hz und f₂ liegen ≥ 30 dB unter der stärksten Spitze.
- [ ] **MK1-09 Sync und Ring+Sync:**
  - Sync mit OSZ 2 Säge, Halbton +7: Die Periode des OSZ-2-Ausgangs ist 1/f₁ (± 1 ct).
  - Halbton 0 → +12 hebt M-SP um ≥ ⅓ Okt.
  - C6: gefaltete Energie (B.6 Nr. 12) ≤ −50 dB für Sync und Ring+Sync, Halbton +1 … +19 (gerechnet −52 … −55 dB).
  - Ring+Sync gleicht dem Produkt aus Sync-Ausgang und OSZ 1 aus getrennten Renders (max |Δ| ≤ 1e-4).
- [ ] **MK1-10 Rauschen:** Die Leistungsdichte ist in Terzbändern 100 Hz…16 kHz flach (± 2 dB nach Normierung auf die Bandbreite).
- [ ] **MK1-11 Filter** (Rauschen, Res 0, Cutoff 64; Cutoff = Polfrequenz, W-01; die Ladder bleibt unverändert):
  - Steilheit zwischen 4× und 8× bzw. ¼ und ⅛ des Cutoffs: 24LPF 22–26 dB/Okt, 12LPF und 12HPF 11–13 dB/Okt, 12BPF je Seite 5–7 dB/Okt (gerechnet: 23,3 / 11,7 / 5,6).
  - Bei Cutoff 32/64/96 liegt die Antwort an W-01 ± 5 % bei −6,0 ± 0,5 dB (12LPF, 12HPF) bzw. −12,0 ± 0,5 dB (24LPF). Die −3-dB-Punkte stehen in CHANGES.
  - Resonanz 127 (24LPF) mit Rauschen: Spitze ≥ 18 dB über dem Durchlass.
  - **Selbstoszillation:** Res 127, 24LPF, Mixer alle 0, Taste gehalten: nach ≤ 200 ms Anschwingen (ein kleiner Rausch-Keim im Filter ist erlaubt) ein Sinus bei W-01(Cutoff) ± 5 %, ≥ −30 dBFS. Mit KEYTRACK +48 folgt die Tonhöhe der Taste C3 … C5 ± 10 ct. Nach 20 s kein NaN/Inf, Spitze ≤ 0 dBFS.
- [ ] **MK1-12 Filter-Modulation** (Messung über `mkScope().cutHz`):
  - Keytrack +48: C2 → C5 verschiebt den Cutoff um 3 Okt ± 3 %. Bei 0 bleibt er ± 1 %, bei −48 sinkt er um 3 Okt.
  - HK-INT +63 (F-HK A 0, D 64, S 0): Spitze +60 ± 1 HT.
  - ANSCHLAG +63: vel 1,0 gegen 0,5 ergibt +24 ± 1 HT.
  - Keytrack-Tonhöhe (B.2): TRANSP. +12 mit KEYTRACK +48 hebt den Cutoff um +12 HT ± 1 %. Patch LFO → Tonhöhe und VIBRATO bewegen ihn nicht.
- [ ] **MK1-13 Verstärker:**
  - Pegel 0 ergibt ≤ −90 dBFS.
  - Pan L63: R ≤ −40 dB. Mitte: L = R ± 0,1 dB.
  - GATE: Anstieg ≤ 2 ms, Abfall ≤ 5 ms, M-KLICK besteht.
  - VERZERR. an: Dreieck C3 durch 24LPF mit einem Cutoff, bei dem sein 3. Teilton ≤ −40 dB liegt; Mixer OSZ 1 = 127: 3. Teilton ≥ −25 dB relativ zum Grundton (die Verzerrung sitzt nach dem Filter, W-23). Bei Mixer 32 ist er kleiner als bei 127 (H-3).
  - Alias der Verzerrung: Säge C5, Mixer OSZ 1 = 127, VERZERR. an: gefaltete Energie (B.6 Nr. 12) ≤ −35 dB.
  - ANSCHLAG +63: vel 0,5 liegt −12 ± 1 dB unter vel 1,0.
  - KEYTRACK +63: C5 gegen C4 ergibt +3,6 ± 0,3 dB.
- [ ] **MK1-14 Hüllkurven:**
  - Stufenzeiten für Werte 0/32/64/96/127 nach W-06 ± 10 %, gemessen nach der Messdefinition in W-06.
  - NEUSTART an: Der Neuanschlag beginnt bei 0. Die ersten 1 ms liegen ≥ 40 dB unter dem vorherigen Pegel.
  - NEUSTART aus: Der Neuanschlag beginnt beim aktuellen Pegel ± 1 dB, M-KLICK besteht.
- [ ] **MK1-15 LFOs:**
  - Frequenz bei f = 0/64/127 nach W-08 ± 2 %.
  - Rechteck(+) liegt im Mittel bei 0,5 ± 0,01 und nur bei ≥ 0.
  - S/H: neuer Wert je Periode, Mittel über 1000 Perioden 0 ± 0,05.
  - Tempo Sync 1/4 bei 120 BPM ergibt 2,000 Hz ± 0,1 %. Bei laufendem Transport und Key Sync aus liegt der Nulldurchgang ± 1 ms am Schlag.
  - Key Sync „Stimme“ (2 Noten, 0,3 s versetzt): Phasen verschieden ≥ 0,2 Periode. „Timbre“: gleiche Phase ± 0,01.
- [ ] **MK1-16 Tonhöhe:**
  - Transponieren +12 ergibt +1200 ± 1 ct. Fein +50 ergibt +50 ± 0,5 ct.
  - VIBRATO +63 bei Mod-Rad 1 ergibt einen Hub ±200 ± 10 ct mit der LFO2-Frequenz. Bei Mod-Rad 0 ergibt es 0.
  - Portamento 64 (Mono, Multi): C3 → C4 erreicht 90 % in W-13 ± 10 %. Bei Mono + Single gleitet die erste Note nicht.
  - BEND 2 mit BEND-Rad oben (`mkWheel(t, 'bend', 1)` und als Zeiger-Zug am Rad): +200 ± 2 ct; Rad in Ruhe 0 ct. Nach dem Loslassen ist die Tonhöhe nach ≤ 100 ms wieder 0 ± 1 ct, ohne Knacken (M-KLICK).
  - MOD-Rad: Beim Laden steht es auf `p.mw`; ein Zug auf 127 ersetzt `p.mw` live (Vibrato nach W-16), nichts gespeichert (`soundHash` unverändert), kein Undo.
  - Nur wenn die freiwillige MIDI-Zugabe gebaut ist (Test ruft `onMidiMsg` direkt): 0xE0 8191 = Rad oben, CC1 127 = MOD 127.
- [ ] **MK1-17 Stimmen:**
  - Poly mit 5 Tasten: genau 4 Stimmen klingen. Last: die älteste wird mit Blende gestohlen (M-KLICK). Low: die 4 tiefsten klingen, High: die 4 höchsten (je eine Folge mit der tiefsten bzw. höchsten Taste zuletzt). Lässt man eine klingende Taste los, bekommt die zurückgestellte Taste die Stimme zurück.
  - Mono Last/Low/High: Die Tastenfolgen aus der Testtabelle ergeben die erwarteten Tonhöhen.
  - Unison mit 1 Taste: 4 Stimmen mit −10/−3,3/+3,3/+10 ct bei Verstimmung 20 (± 0,5 ct, Spektrum).
  - Auslösung Single: Die Legato-Note startet EG2 nicht neu (M-EINBRUCH). Multi: neu.
- [ ] **MK1-18 Umschalten** (bis Begrenzer-Stufe 1):
  - Welle OSZ 1/2, OSC MOD, Filtertyp und HK │ GATE bei klingender Note bestehen M-KLICK und M-EINBRUCH (SXF).
  - Zuweisung, Priorität und Auslösung: M-KLICK immer, M-EINBRUCH nach der `engXf`-Regel (B.6 Nr. 2).
  - Jeder stetige Regler, in 1 s von 0 → 127 gedreht, besteht M-KLICK.
  - **Bruchwerte:** Ein CUTOFF-Zug 0 → 127 über 10 s (≈ 0,2 Einheiten je Zeiger-Ereignis) bei RESONANZ 120 erreicht das Worklet mit > 127 verschiedenen Werten; die verfolgte Resonanzspitze springt zwischen zwei Zeiger-Ereignissen um ≤ 25 ct (keine Stufen von 0,94 HT).
  - **Protokoll:** Eine Geste während einer klingenden Note kommt im nächsten Steuerblock an. VA- und FM-Nachrichten bleiben byte-gleich.
- [ ] **MK1-19 Hörbar:** H-1 und H-3 für jeden Regler von SPIEL und jeder EDIT-WAHL-1-Sektion, Ebene 1 und 2, und für VOLUME (Ausnahmen B.6 Nr. 3, im Skript benannt).
- [ ] **MK1-20 INIT AM:** C3, vel 0,8, 2 s: M-LUFS ± 1 dB gegen INIT Analog. ⋯ → Init und SHIFT + 3 laden INIT AM (Name „INIT MS 2000“), je ein Undo (der Vocoder-Fall mit `mode` 3 wird in MK7-07 geprüft).
- [ ] **MK1-21 Bedienfeld:**
  - M-PLATZ in P1, P2, P3, L1, L2, W für SPIEL, für jede Stellung beider EDIT-WAHL (Ebene 1 und 2), für die offene Auswahl-Liste und für die Halb-Ansicht (LINKS und RECHTS; P2, P3, L2 und L1 mit Home-Balken).
  - Ein Sektions- oder Ebenenwechsel bewegt kein Element > 2 px (M-ANSICHT).
  - **Trefferflächen ≥ 44 × 44 px** für jedes Bedienelement in allen Formaten (Regler, Drehschalter, Tasten, Chips, Listenzeilen, Räder), ohne Überlappung; L1: Körper 720 × 136 in drei Bändern, Regler 44 × 44, Drehschalter 52 × 44, Tasten 44 × 44, Matrix-Zeile ≥ 220 × 44.
  - M-PLATZ zusätzlich mit 47 px Safe-Area-Rand links und rechts bei 844 × 390 und 926 × 428, dazu 844 × 390 mit 21 px unterem Rand (Home-Balken): Halb-Ansicht quer, nichts abgeschnitten. Jede Beschriftung: scrollWidth ≤ clientWidth.
  - Kopfzeile in L1 und L2 (eine 40-px-Zeile) mit „MS 2000“: kein Kopf-Element läuft über (scrollWidth), das Namensfeld ‹ › ist ≥ 72 px breit.
  - Kopfzeile 1 in P1, P2 und P3 mit Spur-Chip: Engine-Trefferflächen ≥ 36 × 44 (senkrecht über `::after`) mit 4 px Abstand, „MS 2000“ ganz lesbar (ein- oder zweizeilig), der Spurname bleibt sichtbar; sonst der Chip nach H-13 mit Zeilen ≥ 44 px.
  - Keine Seite scrollt. Eine Geste = ein Undo. Ein zweiter Finger auf demselben Bedienelement wird ignoriert.
  - Doppeltipp-Zoom, Pinch und Textauswahl sind in der iOS-Emulation aus.
- [ ] **MK1-22 Anzeige:** Die LCD zeigt bei jedem Zug Sektion, Name, Geräte-Wert (000…127, ±63 oder Listenname) und Klartext (Hz, ms, ct), laut Prüfliste für alle Regler. Die Hilfe-Zeilen sind da (L10).
- [ ] **MK1-23 ECO:** Mit `forceNative` spielt ein AM-Sound über NativeVoice. Das Badge erscheint. Pegel ± 3 dB und M-SP ± ½ Okt gegen das Worklet für INIT und 3 Prüfklänge. Keine Konsolenfehler.
- [ ] **MK1-24 CPU** (Node-Offline, Xeon):
  - Eine AM-Stimme (Säge + Puls mit Sync, Rauschen, 24LPF Res 100, Verzerrung mit ADAA, LFO1/2 aktiv) ≤ 1,2 × einer VA-Stimme (3 Osz + Ladder) aus demselben Lauf.
  - 4 Stimmen ≤ 4,8 × VA-Stimme (gleicher Lauf).
  - Der absolute Xeon-Wert und der Chromium-Wert stehen in CHANGES.
- [ ] **MK1-25 Leistungs-Probe:**
  - Läuft in der Claude-App und auf Pages, 10 s je Fall.
  - Das JSON enthält `app`, `ua`, `sr`, `baseLatency`, `load_med` (Σ der 4 Engines), `load_per_engine`, `load_max`, `frames_ok`, `quantum_max_ms`, `fps_med`, `longtasks` bzw. auf iOS `raf_gaps` und `raf_capped`, `voices`, `fall`.
  - Die Probe-Engines hängen über 0-Gain am Ausgang: gerechnet, aber unhörbar (Pegel am Ausgang ≤ −120 dBFS).
  - 0 Netzaufrufe (Zähler wie N7V-35). [Abbrechen] beendet ohne hängende Stimme.
- [ ] **MK1-26 Startzeit (EN3-14):**
  - Projekt ohne AM: Zuwachs ≤ +20 ms gegen den Vorgänger-Stand (Median aus 5).
  - Projekt mit AM-Sound: ≤ +150 ms (§15.3); der Block wird beim Laden ausgewertet, bevor der Transport starten kann.
  - Erste Auswertung des Blocks ≤ 150 ms bei CPU-Drosselung ×4, ohne Drosselung keine `longtask` > 50 ms.
  - **Bei laufender Demo:** Engine-Knopf „MS 2000“ während der Demo-Wiedergabe (Block noch nicht ausgewertet): In `noteLog` startet keine Note > 5 ms nach ihrem Plan, kein Schlag fällt aus.
- [ ] **MK1-27 Regression und DoD:**
  - PE1 mit offenem AM-Bedienfeld (L1 und P1) während 10 s Demo, dabei ein BEND-Zug und ein Drehschalter-Zug: rAF ≥ 55 fps, keine `longtask` > 50 ms, `tick`-p95 ≤ 4 ms.
  - Budget ≤ +115 KB.
- [ ] **MK1-28 Versions-Wächter:** `APP_CODE` 4 009 000. Online-Speichern mit Format 5 erst nach dem Rollout, vorher `bad_version`-Hinweis und lokales Speichern. Kein Aufruf nennt das Klassenzimmer-Projekt.
- [ ] **MK1-29 Älterer Stand:** 4.8.1 (MK0) öffnet ein Format-5-Projekt bzw. eine Bibliothek mit AM-Sounds aus KV, Cloud und Paar-Raum: Nichts wird überschrieben, die Server-Bibliothek enthält die AM-Sounds weiter. Nach der Rückkehr zu 4.9.0 sind sie deep-equal.
- [ ] **MK1-30 VA-Zustand ruht:** Ein VA-Sound mit LFO1 → `fx.rev` wird auf AM geschaltet: Der Hall-Send bleibt unmoduliert, das Worklet bekommt keine VA-Mods und kein `glideFrom`. Zurück auf VA wirkt die Route wieder.
- [ ] **MK1-31 Kopf-Knöpfe:** 🎲 100 Würfe: jeder hörbar (H-1), Mixer OSZ 1 oder OSZ 2 ≥ 64. ◎ markiert genau die Stellungen und Listenzeilen, deren Sektion von INIT AM abweicht. Seite B ist A–Z sortiert.
- [ ] **MK1-32 Aussehen wie die Referenz-Skizze** (M-SKIZZE, B.6 Nr. 5):
  - L1 bei 844 × 390 und 926 × 428 (mit Safe-Area-Rand): jede Zone Z1–Z13 und jede Holzwange hat IoU ≥ 0,7 mit ihrem Rechteck aus der Zonen-Tabelle (in Anteilen des Körpers 720 × 136); die Räder liegen links der ersten Taste in `#kbArea`.
  - Alle Formate: im obersten Band links → rechts Z1 < Z2 < Z4 < Z5 < Z6 < Z7 und Z11 < Z12; Z3 unter Z1/Z2, Z8 unter Z7, Z9 unter Z4–Z6, Z10 im untersten Band von A links; Z11 als Spalte TIMBRE über EDIT-WAHL 1 über EDIT-WAHL 2; Z13 direkt unter Z12 (≤ 4 px), in L1, W und P1 jede Matrix-Zeile auf Höhe ihres Drehschalters (± 4 px); Holzwangen an beiden Rändern. In P1 und in der Halb-Ansicht je Hälfte: A (LINKS) = Z1–Z10, B (RECHTS) = Z11–Z13 (in der Halb-Ansicht dazu SHIFT).
  - Material (aus dem Bildschirmfoto gemessen): Feld L* ≤ 20, Holzwangen Farbton 15–40°, Sättigung 35–75 %, Helligkeit 20–45 %; Kappen L* ≤ 15; Beschriftung Kontrast ≥ 4,5 : 1; Vocoder-Beschriftung Farbton 100–150°; LED an Farbton 0–35°.
  - Matrix: Ebene 1 jeder Stellung gleicht der Belegungs-Tabelle in B.3 (Prüfskript gegen die Tabelle; die Tabelle steht nur in Spec und Test, nicht als Handbuch-Text in der App).
  - Bildschirmfotos aller Formate (SPIEL, FILTER, Vocoder-FILTER, Halb-Ansicht) stehen in CHANGES.
- [ ] **MK1-33 Räder:**
  - Sichtbar nur bei AM-Spuren; bei VA/FM/WT/KIT ist das Layout von `#kbArea` deep-equal zum Vorgänger-Stand.
  - BEND ganz oben/unten = ± `bend` HT ± 2 ct; Loslassen → Mitte in ≤ 100 ms. MOD ganz oben = 1,0, bleibt stehen.
  - Zwei Finger: Rad ziehen und gleichzeitig 3 Tasten spielen: alle 3 Noten klingen, das Rad wirkt (`noteLog`, Spektrum). Ein zweiter Finger auf dem Rad ändert nichts.
  - Nichts gespeichert (`soundHash`, Projekt deep-equal), kein Undo-Eintrag; Trefferflächen ≥ 44 × 44.
- [ ] **MK1-34 Bedien-Logik wie am Original:**
  - Nach dem Laden eines Programms: beide LEDs an, Regler = SPIEL. EDIT-WAHL 1 auf FILTER: LED 1 an, LED 2 aus, Regler 1–5 = TYP · CUTOFF · RESONANZ · HK-INT · KEYTRACK. Tipp auf die leuchtende Nummerntaste: wieder SPIEL.
  - Ziehen am Drehschalter rastet je Stellung (≥ 18 px), Tipp öffnet die Matrix-Liste mit 11 Zeilen ≥ 44 px; die Wahl ändert den Sound nicht (`soundHash` gleich) und macht kein Undo.
  - SHIFT: Regler auf Ebene 2 (FILTER: ANSCHLAG), SHIFT leuchtet, die Matrix-Zeile zeigt „EB2“ vor dem Sektionsnamen und die Namen der Ebene 2; zweiter Tipp ohne Ebene 3 bzw. Sektionswechsel: aus. SHIFT + OKT ▲ hebt den zuletzt bewegten Wert um 1 (ein Undo). SHIFT + SEITE springt zur letzten Sektion der anderen Wahl.
  - OKT ▼/▲ ändern `tr.kbOct` im Bereich 1…7, LED wie in B.3. ORIGINAL-LED: an, wenn der Wert gleich dem gespeicherten ist (Zug weg und zurück).

**Tests.** `mk1-dsp.mjs` (Node-Offline: 04–18, 24, 30), `mk1-format.mjs` (01, 01b, 02, 02b, 03, 28, 29), `mk1-ui.mjs` (Playwright: 16 Räder, 19–22, 26, 31, 33, 34), `mk1-look.mjs` (Playwright: 32, Bildschirmfotos, Farbmessung), `mk1-eco.mjs`, `mk1-probe.mjs`.

**Fach-Prüfung** (Teil J): **FP-DSP ●** Haupt-, **FP-TOUCH** (auch Aussehen gegen die Referenz-Skizze) und **FP-IPHONE** Zweit-Blick.

**iPhone-Prüfpunkte (Xander, ≈ 7 min):**
1. Synth-Spur → Engine **MS 2000**. iPhone quer halten: Sieht das Bedienfeld aus wie dein microKORG? Dann hochkant: Sind die zwei Hälften klar? Abweichungen kurz nennen.
2. Akkord spielen, CUTOFF und RESONANZ drehen. Mit dem linken Daumen das BEND-Rad ziehen, mit der anderen Hand weiterspielen; das MOD-Rad hochschieben (Vibrato, wenn TONH. → VIBRATO gesetzt ist).
3. EDIT-WAHL 1 auf OSZ 2 drehen → Regler 2 (MOD) „Sync“, dann Regler 3 (HALBTON) drehen.
4. EDIT-WAHL 1 auf AMP → Regler 3 (VERZERR.) an, dann MIXER hochdrehen.
5. Menü → Info → **Leistungs-Probe**, Ergebnis kopieren und schicken.

**Geräte-Abgleich (microKORG, nach Gehör):**
- Säge STEUER 1 von 0 → 127 (klingt es wie „Oktave dazu“?).
- Puls STEUER 1 = 64.
- Dreieck STEUER 1 = 127.
- Resonanz 127: Einsatzpunkt und Pegel des Pfeifens gegen die App (W-02; dass das Filter pfeift, ist belegt, HB-MK S. 25).
- Attack 64 und Release 64 im Vergleich zur App.
- LFO Frequenz 64.
- **Bedienfeld (nur Sicht):** Lage der Zonen, der LEDs und der Räder gegen dein Gerät; Abweichungen ändern die Referenz-Skizze in einem `MK1-fix` (B.3).

**Risiken.** Die Kurven sind eK. Die iPhone-CPU ist unbekannt. Die Anordnung der Gruppen folgt der Strichzeichnung in HB-MK S. 2–3; Reihenfolge innerhalb der Gruppen und Maße sind [W]/eK, bis Xander sie am Gerät bestätigt. Wegen der 44-px-Trefferflächen sind die Bilder kleiner als am Gerät (Kappe 32 px). Die Räder machen die Tastatur bei AM-Spuren ≈ 96 px schmaler. Das Paket ist groß, deshalb gibt es drei Bau-Abschnitte. Der Rollout (Format 5) braucht Xanders Okay.

---

### MK2 — Alle Oszillator-Arten und PATCH 1–4

> **Gebaut, 4.10.0.** Bau-Beleg; die Bedienfeld-Teile dieses Abschnitts gehören zur alten Vorlage und werden durch MK-P ersetzt, der Geräte-Abgleich entfällt (Teil C, Kopf).

**Ziel.** OSZ 1 kann alles, was der MS2000 kann, außer „Eingang“ (MK7): Sinus mit Kreuzmodulation, Stimmwelle, 64 Speicherwellen (nachgezeichnete Platzhalter, klar markiert), Rauschen mit Filter. Die vier virtuellen Patches verbinden Hüllkurven, LFOs, Anschlag, Keytrack und Mod-Rad mit acht Zielen.

**Umfang.**
1. **Sinus×** (W-27). Der Modulator ist OSZ 2 nach Sync, vor Ring (W-27).
2. **Stimmwelle** (W-28), live gerechnet, ohne Tabellen.
3. **Speicherwellen 1–64** (Platzhalter, nachgezeichnet; Prot. 57):
   - **Quelle:** eine eigene Nachzeichnung (25.10.) der 64 Oszilloskop-Bilder einer frei verfügbaren Wellen-Referenzliste (PDF, eine Welle je Seite, alle auf derselben Note A3 = 220,3 Hz, je 10 ms). Gerechnet sind je Welle Teiltonpegel und Phasen, geprüft gegen eine zweite, unabhängige Spur: `scratchpad/dwgs-trace/dwgs-64-compact.json`, Volldatei `dwgs-64.json`, Prüfbericht `PRUEFUNG.md` (35 ok, 28 korrigiert, 1 zweifelhaft). Familien nach HB-MS S. 37 (Nummer → Gruppe): 1–7 Sinus-artig, 8–14 Bass, 15–23 Welle, 24–26 Quinte, 27–34 Digital, 35 Endlos, 36–39 E-Piano, 40–46 Orgel, 47–48 Clavi, 49–51 Gitarre, 52–56 Bass 2, 57–60 Glocke, 61–64 Stimme. Freie Rezepte des Builders entfallen.
   - **Eingebaut** werden je Welle **alle** Teiltöne der Kompaktdatei (je Welle 32, 48, 64, 96 oder 128; bei 23 obertonreichen Wellen also auch k 33–64 des Notenbands), mit Pegel und Phase (Datenblock unter **Daten**, dadurch ≈ 3 KB mehr). Grund (Orchestrator, Rev. 58): Die oberen Teiltöne sind aus dem Bild zwar nur grob, senken den Formfehler aber deutlich (z. B. SynWave7 12,3 → 3,2 %, Voice4 10,9 → 1,7 %, PRUEFUNG.md); zu schwach geschätzt (Strichdicke) ist hörbar besser als fehlend. Darüber setzt der Tabellen-Bau einen sanften, gruppentypischen Abfall (Tabelle unten). Nicht übernommen werden `mv` (Pegel im Bild bei unbekannter Aufnahme-Verstärkung) und die Namen. Jede Welle wird nach dem Bau auf Spitze 1 normiert (ein Faktor je Welle aus Mip-Stufe 0, für alle Stufen gleich), Gleichanteil 0.
   - **Tonlage r:** Fünf Bilder wiederholen sich erst nach mehr als einer Notenperiode: 3, 34 und 35 nach 2 (r = 2), 28 und 59 nach einer temperierten Quinte (r = 2^(7/12) = 1,49831). Die Stimme liest jede Tabelle mit f/r (Phasen-Inkrement und Mip-Wahl). So klingt sie wie im Bild, und die starken Teiltöne liegen auf der Note. Beim Wechsel zwischen Wellen mit verschiedenem r läuft der Lese-Zeiger weiter, nur das Inkrement ändert sich. Ob das Gerät diese Wellen so spielt oder dort eine andere Taste gedrückt war, ist [U] bis MK10.
   - **Abfall über Teilton 32** (eK): Ā = Effektivwert der Teiltöne 17–32 des Notenbands (Tabelle k = 16·r + 1 … 32·r). Für k > 32·r gilt A_k = Ā · (k / (22,6·r))^(s/6,02) bis zur Grenze der Mip-Stufe, s nach Gruppe (Tabelle unten). Phasen nach Schroeder, φ_k = −π·k·(k − 1)/1024, in allen Mip-Stufen gleich. Liegt Ā unter −50 dB (bezogen auf den stärksten Teilton), entfällt der Abfall; dort zeigt das Bild nur Rauschen.
   - **35 Endlos** bleibt ein Shepard-Ton aus Oktav-Tabellen, jetzt mit der nachgezeichneten Hülle in Hz: nur Oktav-Teiltöne (f/2) · 2^j, Stützstellen 110 Hz · 2^j (j = 0 … 6, bis 7 kHz) mit −2,0 / −1,7 / −0,1 / 0 / −0,6 / −0,7 / −4,1 dB, dazwischen linear in dB über log f, darunter −6 dB/Okt, darüber −8 dB/Okt (das Bild zeigt bei 14 kHz −11,7 dB). Die übrigen Teiltöne der Nachzeichnung (≤ −26 dB) entfallen.
   - **Gruppe 61–64** behält die feste Hülle in Hz (Oktav-Tabellen, [U] bis MK10): Stützstellen sind die nachgezeichneten Teiltöne bei k · 220,27 Hz, dazwischen linear in dB über log f, unter dem 1. Teilton −12 dB/Okt, über Teilton 32 der Abfall der Gruppe. Die Phasen bleiben je Teilton-Nummer k. Bei 220,27 Hz ergibt das genau die Nachzeichnung.
   - Mipmaps über den gemeinsamen, DOM-freien Tabellen-Bau `mkTables` (B.4, Spec §10.1), im Hauptfaden in Häppchen; Übergabe einmal je Kontext in die MKW-Tabelle. Bis die Tabelle da ist, spielt die Platzhalter-Säge mit „≈“.
   - Wahl über STEUER 2 (1…64; Import: Werte 2n−2, 2n−1 → n, HB-MS S. 66), als stetiger Regler mit Rundung (B.3).
   - Wellenwechsel bei klingender Note mit 2-ms-Gleichleistungs-Blende, phasenstetig (B.6 Nr. 2).
   - **Abfall je Gruppe** (eK, gilt für MK2-03; s = Pegel je Teilton in dB je Oktave über Teilton 32 des Notenbands):

     | Gruppe | s | Hinweis aus der Nachzeichnung |
     |---|---|---|
     | 1–7 Sinus-artig | −12 dB/Okt | meist ohne Abfall (Ā < −50 dB); 3 mit r = 2 |
     | 8–14 Bass, 52–56 Bass 2 | −9 dB/Okt | 56: Form nur grob |
     | 15–23 Welle | −9 dB/Okt | 20, 21: Form nur grob |
     | 24–26 Quinte | −9 dB/Okt | 24, 25 ohne Teilton 1 (wie im Bild) |
     | 27–34 Digital | −6 dB/Okt | 28 mit r = 1,49831, 34 mit r = 2; 28, 32: Form nur grob |
     | 35 Endlos | −8 dB/Okt, nur Oktav-Teiltöne | Hülle in Hz (oben) |
     | 36–39 E-Piano | −12 dB/Okt | |
     | 40–46 Orgel | −12 dB/Okt | |
     | 47–48 Clavi | −9 dB/Okt | 48 nur gerade Teiltöne (klingt eine Oktave höher, wie im Bild) |
     | 49–51 Gitarre | −9 dB/Okt | |
     | 57–60 Glocke | −9 dB/Okt | 59 mit r = 1,49831, Form nur grob; 60 zweifelhaft (MK2-12) |
     | 61–64 Stimme | −12 dB/Okt | Hülle in Hz (oben); 64: Form nur grob |

   - LCD: „Speicherwelle 12 · Bass 5 ≈ Platzhalter“. Hilfe: „Originalwellen folgen später aus Aufnahmen“.
4. **Rauschen-Oszillator** (W-29).
5. **PATCH 1–4** (A.5, W-18). Je Timbre 4 Wege mit Quelle, Ziel und Intensität. „Bend“ wirkt mit dem BEND-Rad (in Ruhe 0), „Mod-Rad“ mit dem MOD-Rad (B.1 „Räder“). Das Ziel LFO2-Freq wirkt nicht, solange LFO2 Tempo Sync an ist (W-18). Intensität 0 kostet nichts.
6. **EDIT-WAHL 2:** Die Stellungen PATCH 1–4 werden aktiv (die übrigen folgen ab MK3–MK6).
7. **Leistungs-Probe:** Der Fall „Kern“ nutzt jetzt Speicherwelle + Sinus×.

**Nicht-Umfang.** „Eingang“ (MK7). Originalwellen (MK10). Teiltöne über 32 aus dem Bild, Pegel zwischen den Wellen (`mv`) und die Wellennamen der Bild-Referenz. Mehr als 4 Patches.

**Daten.** `t[].o1.w` 3…6 wirken jetzt. `t[].p[]` wirkt jetzt. Kein neues Speicherfeld: Ein Sound speichert weiter nur die Wellen-Nummer (STEUER 2).
- **Datenblock der Nachzeichnung** (Prot. 57), eine Base64-Konstante im Block `sq-mk-src`: 1 Salz-Byte (B.6 Nr. 9), dann je Welle 1…64 ein Byte r-Kennung (0: r = 1, 1: r = 2, 2: r = 1,49831) und K = 32·r Teiltöne mit je 3 Byte: 12 Bit Pegel (0 = still, sonst −(4095 − c) · 0,025 dB bezogen auf den stärksten Teilton) und 12 Bit Phase (c · 2π/4096; x(θ) = Σ a_k · sin(kθ + φ_k), Bezug wie in der Kompaktdatei).
- **Größe:** 59 × 32 + 2 × 48 + 3 × 64 = 2 176 Teiltöne = 6 593 Byte, Base64 ≈ 8,6 KB.
- **Bau:** Das Bau-Skript `mk2-wellen.mjs` (Node) schreibt den Block aus `dwgs-64-compact.json` am Bau-Ort (E.5 Nr. 1). Gleiche Quelle ergibt einen bitgleichen Block; Namen und `mv` übernimmt es nicht. Nachgerechnet am 25.10.: Kodierfehler ≤ 0,0125 dB und ≤ 0,0008 rad, der Formfehler wächst dadurch um ≤ 0,001 Prozentpunkte, 0 Markenwörter schon ohne Salz.

**Oberfläche.** EDIT-WAHL 2 mit PATCH 1–4 (B.3). OSZ 1: Die Matrix-Zeile zeigt WELLE · STEUER 1 · STEUER 2 wie am Original, die LCD-Zeile die Bedeutung je Welle. Die Auswahl-Liste der Speicherwellen hat 64 Zeilen mit Gruppenköpfen (Liste scrollt, L4) und „≈“.

**Berührungspunkte.**
- **Wiederverwendet:** das Mipmap-Verfahren (V4a, K2-40; portiert, `waveTab` bleibt im Worklet), Mod-Matrix-Plätze.
- **Neu:** PM-Pfad Sinus×, Glottis-Puls (live), Oktav-Tabellen, Datenblock der 64 nachgezeichneten Wellen mit Bau-Skript `mk2-wellen.mjs`, Abfall über Teilton 32, Tonlage r, gemeinsamer Tabellen-Bau `mkTables` (DOM-frei; später von V8a, V4e und V9a genutzt, Teil G Nr. 9), MKW-Tabelle im `AudioWorkletGlobalScope`, Übergabe `{mkw}`, Patch-Ziele OSZ1-Steuer und LFO2-Freq.

**Dauer** 7–8 h (Prot. 57: +0,5 h für Bau-Skript, Tonlage r, Hüllen aus der Nachzeichnung und MK2-12; die freien Rezepte entfallen) · **Version 4.10.0** · **Budget** +42 KB (Prot. 57: +7 KB, weil der Datenblock ≈ 8,6 KB hat statt ≈ 2–3 KB Rezept-Bytes) · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK2-01 Sinus×:**
  - X-MOD 0: Klirr ≤ −60 dB.
  - X-MOD 64 mit OSZ 2 Dreieck Halbton +12: Seitenbänder bei f₁ ± n·f₂ (n = 1 ≥ −20 dB relativ zum Träger). M-SP steigt ≥ ⅓ Okt gegenüber 0.
  - X-LFO 127: Die Tiefe schwankt mit LFO1 (Seitenband-Pegel ändert sich ≥ 10 dB über eine Periode).
  - Mit OSC MOD Ring und Ring+Sync ist Sinus× deterministisch, ohne NaN, und gleicht einem Referenz-Render der Definition W-27 (max |Δ| ≤ 1e-4).
- [ ] **MK2-02 Stimmwelle:**
  - Die Spektralhülle in Hz ist bei C2 und C4 gleich: ± 3 dB in Terzbändern 400–4000 Hz, normiert auf den Gesamtpegel.
  - FORM 0 → 127 ändert M-SP ≥ ⅓ Okt.
  - C7: gefaltete Energie (B.6 Nr. 12) ≤ −50 dB.
- [ ] **MK2-03 Speicherwellen:**
  - 64 Wellen, Spitze 1, kein Gleichanteil.
  - Jede Welle unterscheidet sich von jeder anderen: RMS-Abstand ≥ 1 dB über die Teiltöne 1–16 (Nachzeichnung: kleinster Abstand ≈ 4 dB).
  - Über Teilton 32 folgt jede Welle dem Abfall nach Umfang 3 (Pegel je Oktave ± 0,5 dB gegen die Formel, FFT der Mip-Stufe 0). Mit Ā < −50 dB hat sie dort keine Teiltöne; 35 hat nur Oktav-Teiltöne.
  - C7: gefaltete Energie (B.6 Nr. 12) ≤ −50 dB.
  - Wellenwechsel bei klingender Note besteht M-KLICK.
  - Jede Welle trägt „≈“ in LCD und Liste.
- [ ] **MK2-04 Endlos:** Die Teiltöne von C3 und C4 sind in Hz deckungsgleich (± 1 dB), ebenso Fis3/Fis4. Eine chromatische Tonleiter über 2 Okt hat keinen Pegelsprung > 1,5 dB (M-PEGEL).
- [ ] **MK2-05 Rauschen-Osz.:**
  - RESO. 127, CUTOFF 24: Spitze bei der Notenfrequenz ± 20 ct für C3 und C5. CUTOFF 36 ergibt eine Oktave höher ± 20 ct.
  - RESO. 0: Tiefpass ohne Spitze, 11–13 dB/Okt.
- [ ] **MK2-06 Patches:**
  - Tonhöhe +63 mit LFO1 Rechteck: ±24 HT ± 10 ct.
  - Cutoff +63 mit EG2: +127 Cutoff-Einheiten am Gipfel (über `mkScope`).
  - Pan +63 mit LFO2: voller Weg L ↔ R.
  - LFO2-Freq +63 mit EG1: LFO2-Frequenz nach W-08 am Gipfel ± 5 %. Mit LFO2 Tempo Sync an ist derselbe Patch bitgleich wirkungslos.
  - OSZ1-Steuer mit Keytrack: Pulsbreite ändert sich mit der Tonhöhe.
  - Amp mit Anschlag, Rauschen mit LFO1 und OSZ2-Tonhöhe mit EG1 zeigen je die Wirkung nach W-18.
  - Intensität 0 = bitgleich zu „kein Patch“.
  - Vier Patches auf dasselbe Ziel addieren sich.
- [ ] **MK2-07 Bitgleich:** MK1-Klänge (Wellen 0–2, Intensität 0) klingen bitgleich zum Vorgänger-Stand (MK1).
- [ ] **MK2-08 Tabellen-Bau:**
  - Laden aller 64 Wellen: keine `longtask` > 50 ms (Chromium, ohne Drosselung).
  - Die Welle eines eben geladenen Sounds klingt ≤ 30 ms nach dem Laden. Davor spielt ein neuer AM-Knoten die Platzhalter-Säge mit „≈“; der Wechsel besteht M-KLICK.
  - Tabellenspeicher laut `mkInfo().tableBytes` ≤ 16 MB **je Kontext**, einmal gezählt. Eine zweite AM-Spur überträgt 0 Byte Tabellen.
  - `mk-node.mjs` baut mit demselben `mkTables` bitgleiche Tabellen.
- [ ] **MK2-09 CPU** (Node-Offline): Speicherwelle ≤ 1,1 × Säge, Stimmwelle (live, mit polyBLAMP und Hüllen-IIR) ≤ 1,3 ×, Sinus× ≤ 1,2 ×, 4 aktive Patches ≤ +5 %.
- [ ] **MK2-10 Oberfläche:**
  - EDIT-WAHL 2 mit PATCH 1–4, LCD z. B. „PATCH 2 · LFO 1 → CUTOFF · +32“; M-SKIZZE besteht weiter.
  - Listen mit ≥ 44-px-Zeilen.
  - M-PLATZ in P1–P3, L1, L2, W. H-1/H-3 für alle neuen Regler.
- [ ] **MK2-11 Regression und DoD**, Budget ≤ +42 KB, kein Markenwort.
- [ ] **MK2-12 Nachzeichnung** (`mk2-wellen.mjs`; Bezug am Bau-Ort, E.5 Nr. 1):
  - Datenblock: gleiche Quelle → bitgleicher Block, ≤ 9 KB, 0 Markenwörter (B.6 Nr. 9), keine Wellennamen. Dekodiert gleicht er der Kompaktdatei: Pegel ± 0,02 dB (Teiltöne ≥ −100 dB), Phase ± 0,001 rad, r genau 1, 2 oder 1,49831.
  - Form: Je Welle wird eine Periode aus `mkTables` genommen (Mip-Stufe 0; für 35 und 61–64 die Tabelle für genau 220,27 Hz) und per FFT auf die Teiltöne ≤ 32·r begrenzt. Bezugskurve ist die Volldatei `dwgs-64.json` (Teiltöne ≤ 64·r, Spitze 1), gleiche Phasenlage ohne Verschieben, Verstärkung nach kleinsten Quadraten. Der RMS-Abstand in % der Spitze ist ≤ „rms32 %“ der Welle in `PRUEFUNG.md` + 0,1 Prozentpunkte. Am 25.10. mit dieser Kodierung nachgerechnet: höchstens +0,001; 35 mit nur Oktav-Teiltönen 4,6 % (Grenze 5,7 %).
  - Gespielt: `mkRender` bei 187,5 Hz (Filter offen, Amp-HK gehalten), Mittel über 8 Perioden. Der Grundton der Tabelle liegt bei f/r ± 1 ct (3, 34, 35: 93,75 Hz; 28, 59: 125,14 Hz). Die Teiltöne 1–16 weichen je ≤ 1 dB von der Quelle ab (Teiltöne ≥ −40 dB; bei 35 und 61–64 von der Hülle in Hz).
  - Zweifelhaft und in CHANGES benannt: **60** (Glocke 4: keine Periode im Bild, unharmonische Teiltöne, 30 % des Bilds nicht darstellbar, nur grobe Näherung). Mit Vorbehalt: **3, 28, 34, 35, 59** (Tonlage r ungeklärt) und **20, 21, 28, 32, 56, 59, 64** (Form gröber; mit allen Teiltönen der Kompaktdatei Rest laut PRUEFUNG.md, Prüfmaß MK2-12 = dortiger Wert der vollen Tabelle + 0,1 Prozentpunkte). Alle tragen „≈“ wie die übrigen.
  - Fehlt der Bezug am Bau-Ort, ist MK2-12 offen, nicht bestanden.

**Tests.** `mk2-osc.mjs`, `mk2-patch.mjs`, `mk2-ui.mjs`, `mk2-wellen.mjs` (Bau-Skript des Datenblocks und Prüfung MK2-12; liest die Nachzeichnung vom Bau-Ort und enthält selbst keine Wellennamen).

**Fach-Prüfung:** **FP-DSP** Haupt-, **FP-KLANG** und **FP-SICHER** Zweit-Blick (FP-SICHER: Datenblock nur aus gerechneten Werten, ohne Namen und Markenwörter; Bild-Referenz und Nachzeichnung nicht im Repo).

**iPhone:** EDIT-WAHL 1 auf OSZ 1 → WELLE Speicherwelle, STEUER 2 durchdrehen. EDIT-WAHL 2 auf PATCH 1: LFO 2 → Cutoff, +40.

**Geräte-Abgleich:** Stimmwelle FORM 0/64/127. Sinus× X-MOD 64. Rauschen CUTOFF 24 mit RESO. 127 (gleiche Tonhöhe wie die Taste?). Klang einzelner Speicherwellen (nur als Vorgeschmack, die Originale kommen mit MK10). Dabei 3, 28 und 59 auf A3: Liegt der Grundton am Gerät auch eine Oktave (3) bzw. eine Quinte (28, 59) unter der Taste? Das klärt r schon vor MK10.

**Risiken.** Die Platzhalter sind Nachzeichnungen, nicht die Originale, und bleiben darum mit „≈“ markiert. Das Bild zeigt eine Note und 10 ms ohne Verlauf. Teiltöne über 32 sind geschätzt (Abfall). Filter, Verstärker und Aufnahmekette färben die Werte, und die Pegel zwischen den Wellen sind unbekannt (jede Welle hat Spitze 1). 60 ist nur eine grobe Näherung, r von 3, 28, 34, 35 und 59 ist [U]. **Lizenz:** Eingebaut werden nur selbst gerechnete Teiltonwerte, nie die Bilder oder das PDF; beide bleiben privat am Bau-Ort (E.5 Nr. 5). Die Lizenzlage ist dieselbe offene wie bei MK10 (Wellen eines Korg-Geräts), und Xander hat sich fürs Einbauen entschieden (H-2). Für 23 Wellen enthält die Kompaktdatei auch Teiltöne 33–64 (grob). Sie einzubauen kostete ≈ +3,5 KB und wäre ein eigener Fix-Schritt. Der Tabellenspeicher auf dem iPhone ist ungemessen; er wird mit dem V8a-Pool zusammen geprüft (Teil G Nr. 9).

---

### MK3 — Zwei Timbres, Split, Stimmung

> **Gebaut, 4.11.0.** Bau-Beleg; die Bedienfeld-Teile dieses Abschnitts gehören zur alten Vorlage und werden durch MK-P ersetzt, der Geräte-Abgleich entfällt (Teil C, Kopf).

**Ziel.** Ein AM-Sound spielt zwei Timbres übereinander (Dual = Layer) oder geteilt (Split). Die Stimmen werden wie am MS2000 aufgeteilt. Die zehn Stimmungen mit Grundton sind wählbar.

**Umfang.**
1. **STIMME und STIMMUNG** (B.3): STIMME Regler 2 EINZELN/SCHICHT = Single │ Layer (= Dual) │ Split (Regler 1 SYNTH/VOC. Vocoder ab MK7); Ebene 2: STIMMEN 1+3 │ 2+2 │ 3+1, SPLIT (C-1…G9). EDIT-WAHL 2 Stellung STIMMUNG (am Original GLOBAL): STIMMUNG, GRUNDTON, Zusatz-Ansicht EIGENE. Am Gerät setzt man den Split per Halten + Taste (HB-MS S. 34). Hier gibt es dafür die Taste [Split ← nächste Note] in der LCD-Zeile, weil Halten im Editor keine neue Bedeutung bekommt (L4).
2. **Worklet:** Je Note spielen die Timbres nach Modus:
   - Dual: beide.
   - Split: Note < `split` → T1, sonst T2 [W].
   - Die Stimmen werden nach `tv` geteilt. Ist ein Timbre nach `tv` auf 1 Stimme begrenzt, spielt es mono, unabhängig von der Zuweisung (HB-MS S. 35).
   - **Ist ein Timbre auf Mono, gilt `tv` nicht** (HB-MS S. 34): Es belegt 1 Stimme. Ein Poly-Timbre daneben bekommt 3 (HB-MK S. 16: Mono/Poly = 1/3). Ein Unison-Timbre daneben bekommt 2 (HB-MK S. 16: Unison/Mono = 2/1; für MS2000 [W]). Beide Mono: 1 + 1.
   - Hat ein Timbre weniger Stimmen als gehaltene Tasten, entscheidet seine Priorität (MK1).
   - Unison in Dual/Split nutzt die Stimmenzahl des Timbres.
   - Mono bei T1 und Poly bei T2 ist erlaubt.
   - AMP PEGEL/PAN je Timbre wirken als Balance (S. 40).
3. **TIMBRE-Taste** wie am Original (B.3, Zone Z11 oben über den Drehschaltern; HB-MK S. 14): Tipp T1 → T2 → beide → T1, die LEDs 1/2 zeigen die Wahl. Alle Sektionen bearbeiten das gewählte Timbre. Die LCD zeigt „T2“. Bei Single ist T2 gesperrt (Hinweis), die Taste bleibt auf T1.
   - Nach **H-11** (entschieden: ja): **Edit Sync** = dritter Tipp (beide LEDs): Gesten gehen an beide Timbres (Anzeige und Startwert von T1; nicht gespeichert). Am Original hält man die Taste 2 s; der dritte Tipp ersetzt das Halten, weil Halten hier keine Bedeutung bekommt (L4). **Solo** = SHIFT + TIMBRE: nur das gewählte Timbre klingt, seine LED blinkt; ein Tipp auf TIMBRE beendet Solo (nicht gespeichert; HB-MK S. 14, PDF 78). Eigene Chips [T1+2]/[◐ SOLO] der Rev. 1 entfallen.
4. **Werkzeuge** über SHIFT + Nummerntaste wie am Original (B.3; auch unter ⋯ im Blatt):
   - SHIFT + 4 Timbre neu (INIT), SHIFT + 2 Timbre tauschen.
   - SHIFT + 1 Timbre kopieren aus einem beliebigen AM-Sound der Bibliothek (Timbre 1 oder 2 als Quelle; ab MK9 steckt 🔒 an, EN3-08a).
   - Je ein Undo (HB-MS S. 46–47).
5. **Stimmung** (W-43): je Note und Timbre, vor der Tonhöhenrechnung. Eigene Stimmung mit 12 Werten (Zusatz-Ansicht EIGENE mit 12 Reglern −100…+100 ct). Keytrack rechnet mit der gestimmten Tonhöhe (KT, B.2; HB-MS S. 39).
6. **Umschalten** von MODUS und STIMMEN bei klingenden Noten über `engXf` (B.6 Nr. 2).

**Nicht-Umfang.** Mehr als 2 Timbres. Globale Stimmung (die Abweichung steht in B.1). Arp-Ziel (MK5).

**Daten.** `mode` 0–2, `tv`, `split`, `scale`, `skey`, `usc`, `t[1]` wirken jetzt.

**Oberfläche.** STIMME (Ebene 1 und 2) und die Stellung STIMMUNG sind offen. Die TIMBRE-Taste ist aktiv (T1 │ T2 │ beide, Solo mit SHIFT). SHIFT + 1/2/4 sind aktiv. Zusätzlich die Zusatz-Ansicht EIGENE (Tipp auf die Matrix-Zeile STIMMUNG, wenn STIMMUNG = Eigene; 12 Regler, P1 2 × 6 à 60, L1 12 × 56 mit 3 px = 705 px, L2 12 × 50 mit 3 px).

**Berührungspunkte.**
- **Wiederverwendet:** Stimmenpool, Notenstapel aus MK1, Bibliothek für die Quellwahl.
- **Neu:** Timbre-Verteilung (mit der Mono-Regel), Stimmungs-Tabellen, Timbre-Werkzeuge über SHIFT, TIMBRE-Taste mit Edit Sync und Solo.

**Dauer** 7,5–8,5 h (Rev. 1: +1 h für Edit Sync und Solo; Rev. 2: +0,5 h für TIMBRE-Taste, SHIFT-Werkzeuge und Zusatz-Ansicht) · **Version 4.11.0** · **Budget** +33 KB · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK3-01 Dual:** Der Render ist die Summe der einzeln gerenderten Timbres (max |Δ| ≤ 1e-4, gleicher Seed; Zufall je Note nach B.4 Nr. 3, auch mit Rauschen und S&H).
- [ ] **MK3-02 Stimmen-Teilung:**
  - 1+3 mit Dreiklang: T1 spielt nur die letzte Note (mono), T2 alle drei.
  - 2+2 mit Vierklang: je 2 nach Priorität.
  - 3+1 spiegelbildlich.
  - Unison in Dual 2+2 (T1 Unison) ergibt 2 gestapelte Stimmen.
  - `tv` 2+2, T1 Mono, T2 Poly, 4 Tasten: T2 spielt 3 Noten.
  - T1 Unison, T2 Mono: T1 spielt 2 gestapelte Stimmen, T2 eine.
- [ ] **MK3-03 Split** bei C4: C3 nur T1, C4 nur T2 (die jeweils anderen ≤ −60 dB). Die Taste „Split ← nächste Note“ setzt `split` auf die nächste gespielte Note, ein Undo.
- [ ] **MK3-04 Timbre-Wahl:** Tipps auf TIMBRE ergeben T1 → T2 → beide → T1 (LEDs nach B.3). Eine Bearbeitung mit T2 lässt T1 deep-equal. Bei Single ist T2 gesperrt (Hinweis im LCD).
- [ ] **MK3-05 Werkzeuge** (SHIFT + 1, 2, 4 und ⋯):
  - Kopieren aus einem anderen Sound ergibt das Ziel-Timbre deep-equal zur Quelle.
  - Tauschen zweimal = Ausgang.
  - INIT-Timbre = INIT-Werte.
  - Je ein Undo.
- [ ] **MK3-06 Stimmungen:**
  - Für alle 10 Stimmungen und Grundton C sowie A liegt jede der 12 Tonklassen bei W-43 ± 0,5 ct (Spektral-Messung bei C4 bis B4).
  - Eigene Stimmung: 12 Werte wirken ± 0,5 ct.
  - Gleichstufig ist bitgleich zum Vorgänger-Stand.
- [ ] **MK3-07 Bitgleich:** Single-Klänge aus MK1/MK2 klingen bitgleich zum Vorgänger-Stand (MK2).
- [ ] **MK3-08 CPU:** Dual 2+2 kostet ≤ 1,05 × Single mit 4 Stimmen (Node-Offline). Es klingen nie mehr als 4 Stimmen.
- [ ] **MK3-09 Umschalten** von MODUS und STIMMEN bei klingenden Noten: M-KLICK immer, M-EINBRUCH nach der `engXf`-Regel (B.6 Nr. 2); gilt bis Begrenzer-Stufe 1.
- [ ] **MK3-10 Oberfläche:** STIMME (Ebene 1 und 2), STIMMUNG, TIMBRE-Taste mit LEDs, SHIFT-Funktionen, Zusatz-Ansicht EIGENE: M-PLATZ in P1–P3, L1, L2, W, M-SKIZZE besteht weiter. M-ANSICHT beim Timbre-Wechsel (nichts springt). Trefferflächen ≥ 44 × 44.
- [ ] **MK3-11 Regression und DoD**, Budget ≤ +33 KB.
- [ ] **MK3-12 Balance und Stimmung:** AMP PEGEL/PAN je Timbre stellen die Balance (PEGEL T1 = 0 → T1-Anteil ≤ −60 dB; PAN T1 L63 / T2 R63 → Trennung ≥ 30 dB). KEYTRACK +48 mit Werckmeister III folgt der gestimmten Tonhöhe (Cutoff-Abweichung = W-43-Wert ± 2 ct).
- [ ] **MK3-13 Beide und Solo** (H-11): TIMBRE auf „beide“: ein CUTOFF-Zug ändert T1 und T2 um dasselbe Δ, ein Undo; nach dem Weiterschalten ist nichts gespeichert (`soundHash` unverändert durch die Taste). SHIFT + TIMBRE: nur das gewählte Timbre klingt (das andere ≤ −90 dB), seine LED blinkt; Tipp auf TIMBRE beendet Solo; nicht gespeichert.

**Tests.** `mk3-timbre.mjs`, `mk3-scale.mjs`, `mk3-ui.mjs`.

**Fach-Prüfung:** **FP-DSP ●** Haupt-, **FP-TOUCH** Zweit-Blick. Blockierend, weil MK5–MK8 auf der Timbre-Struktur aufbauen.

**iPhone:** EDIT-WAHL 1 auf STIMME → Regler 2 „Split“, SHIFT → SPLIT C4. Mit der TIMBRE-Taste unten Bass (T1), oben Fläche (T2) bauen. EDIT-WAHL 2 auf STIMMUNG: „Werckmeister III“ mit Akkorden.

**Geräte-Abgleich:** Layer am microKORG mit 2 Stimmen je Timbre (HB-MK S. 16) gegen Dual 2+2. Das Verhalten bei mehr Tasten als Stimmen. Mono/Poly-Layer (1/3). Edit Sync und Solo (HB-MK S. 14).

**Risiken.** Welche Seite der Split-Grenze T1 ist, ist [W]. Die Stimmungstabellen sind Lehrbuchwerte, keine Gerätewerte.

---

### MK4 — Effekte: Mod-FX, Delay, EQ (je Sound)

> **Gebaut, 4.12.0.** Bau-Beleg; die Bedienfeld-Teile dieses Abschnitts gehören zur alten Vorlage und werden durch MK-P ersetzt, der Geräte-Abgleich entfällt (Teil C, Kopf).

**Ziel.** Jeder AM-Sound bringt seine Programm-Effekte mit, wie am Gerät, in der Reihenfolge Mod-FX → Delay → EQ.

**Umfang.**
1. **Im Worklet nach der Stimmensumme** (stereo, je Spur): Mod-FX Cho/Flg │ Ensemble │ Phaser (W-31), Delay Stereo │ Cross │ L/R (W-32, Puffer 6 s, angelegt beim ersten Einschalten) mit Tempo Sync (W-12, Song-Tempo, jede Note im ganzen Tempobereich), EQ (W-33). TIEFE 0 ist jeweils bitgleich trocken. Alle Rückkopplungs- und IIR-Zustände nach B.6 Nr. 11.
2. **Zeitwechsel** des Delays bei laufendem Echo: Lesekopf gleitet (≤ 50 ms), kein Sprung. Tempo-Wechsel: Sync-Zeit folgt am nächsten Block mit Gleiten.
3. **Stellungen** MOD-FX, DELAY, EQ der EDIT-WAHL 2 (5–7, wie am Original). ZEIT │ NOTE wechselt mit TEMPO SYNC.
4. Die **Spur-Kette bleibt unverändert dahinter** (Drive, Chorus, Hall-/Echo-Send, Pump, Vol, Pan).
5. **Leistungs-Probe:** Fall „+FX“.

**Nicht-Umfang.** Weitere Effekttypen. Effekte für andere Engines (VK2 nutzt nur Formeln und Prüfskripte, Teil G Nr. 2).

**Daten.** `mfx`, `dly`, `eq` wirken jetzt.

**Oberfläche.** Drei Stellungen der EDIT-WAHL 2. LCD z. B. „DELAY · NOTE 1/8 · 250 ms“, Anzeige „1.8“ wie am Original.

**Berührungspunkte.**
- **Wiederverwendet:** Worklet-Tempo (`{tempo}` mit `at`), Glättung.
- **Neu:** Effektkern im AM-Zweig (Verzögerungsleitungen mit 6 s, außerhalb von `process()` angelegt; Allpass-Kette, Kuhschwanz-Biquads).

**Dauer** 5–6 h · **Version 4.12.0** · **Budget** +25 KB · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK4-01 Aus = bitgleich:** TIEFE 0 bei Mod-FX und Delay sowie EQ 0 dB sind bitgleich zum Vorgänger-Stand, für alle drei Mod-FX-Typen.
- [ ] **MK4-02 Cho/Flg** auf weißem Rauschen, LFO über die Test-API eingefroren (oder aus der Impulsantwort), Fenster 20 ms: TIEFE 100 ergibt Kerbtiefe ≥ 12 dB. Der Kammabstand wandert mit dem LFO, Periode nach W-31 ± 5 % (TEMPO 64). TIEFE 40: Kerbtiefe ≤ 6 dB, der Kammabstand wandert ≥ 30 % (Chorus).
- [ ] **MK4-03 Ensemble** TIEFE 127, weißes Rauschen mono: Kreuzkorrelation der **nassen** Signale L/R ≤ 0,5 (Abgriffe nach W-31); Pegel ± 1 dB gegenüber trocken.
- [ ] **MK4-04 Phaser** TIEFE 127: ≥ 3 Kerben ≥ 12 dB. Die tiefste Kerbe wandert über ≥ 2 Okt.
- [ ] **MK4-05 Stereo-Delay** Sync 1/8 bei 120 BPM:
  - Erstes Echo nach 250 ms ± 1 Sample in L und R.
  - TIEFE 64: Echo-Pegel nach W-32 ± 0,5 dB.
  - TIEFE 127: jede Wiederholung ≥ 1,9 dB leiser, kein Überlauf (Spitze ≤ 0 dBFS).
- [ ] **MK4-06 Cross/L-R:** Cross-Delay mit Impuls nur links: Echos abwechselnd L, R, L (Energie je Echo ≥ 20 dB über dem anderen Kanal). L/R-Delay mit Mono-Impuls: abwechselnd L, R.
- [ ] **MK4-07 Zeit:** Sync aus, ZEIT 0/64/127 nach W-32 ± 1 %. ZEIT-Wechsel bei laufendem Echo besteht M-KLICK.
- [ ] **MK4-08 Tempo:** 120 → 90 BPM während des Echos: Die Sync-Zeit folgt ≤ 1 Takt, ohne Knacken.
- [ ] **MK4-09 EQ:**
  - Tiefen-Kuhschwanz 100 Hz +12 dB: bei 25 Hz +12 ± 0,5 dB, bei 400 Hz ± 1 dB, bei 1 kHz ± 0,3 dB.
  - Höhen-Kuhschwanz 8 kHz −12 dB: bei 16 kHz −12 ± 1 dB, bei 2 kHz ± 0,5 dB.
- [ ] **MK4-10 Reihenfolge:** Das Echo trägt die Phaser-Kerben. Der EQ wirkt auf das Echo (Kuhschwanz-Messung im Echo).
- [ ] **MK4-11 CPU:** Alle drei Effekte an kosten ≤ +1,0 × VA-Stimme je Spur (Node-Offline, gleicher Lauf). Die Leistungs-Probe läuft mit „+FX“.
- [ ] **MK4-12 Oberfläche:** M-PLATZ in P1–P3, L1, L2, W. H-1/H-3 für alle Effekt-Regler. ZEIT │ NOTE wechselt ohne Sprung der Elemente (M-ANSICHT).
- [ ] **MK4-13 Regression und DoD** (Spur-Effekte unverändert), Budget ≤ +25 KB.
- [ ] **MK4-14 Lange Sync-Noten:** 1/1 und 3/4 bei 120 BPM (2,0 s und 1,5 s), bei 60 BPM (4,0 s und 3,0 s) und bei 40 BPM (6,0 s und 4,5 s): erstes Echo genau nach dem Notenwert ± 1 Sample. Ein Tempo-Wechsel 120 → 40 BPM während des Echos besteht M-KLICK. Vor dem ersten TIEFE > 0 belegt der Puffer 0 Byte; danach ≈ 2,3 MB je Spur (in CHANGES).

**Tests.** `mk4-fx.mjs` (Node-Offline), `mk4-ui.mjs`.

**Fach-Prüfung:** **FP-DSP** Haupt-, **FP-IPHONE** Zweit-Blick.

**Zwischenstand** nach MK4 (EN3-17): Artifact + Pages.

**iPhone:** EDIT-WAHL 2 auf DELAY: TEMPO SYNC an, NOTE 1/8, TIEFE 60, mit laufendem Song. MOD-FX Ensemble auf einer Fläche.

**Geräte-Abgleich:** Cho/Flg TIEFE 40 und 100. Ensemble. Phaser TEMPO 30. Delay TIEFE 64 (wie viele Wiederholungen?).

**Risiken.** Die Effekt-Kurven sind eK. Der Delay-Puffer hat 6 s, wie der Echo-Bus der App: ≈ 2,3 MB je AM-Spur mit Delay an (48 kHz stereo Float32). Viele AM-Spuren mit Delay brauchen entsprechend Speicher; die Leistungs-Probe nennt Tabellen- und Puffer-Speicher.

---
### MK5 — Arpeggiator

> **Gebaut, 4.13.0.** Bau-Beleg; die Bedienfeld-Teile dieses Abschnitts gehören zur alten Vorlage und werden durch MK-P ersetzt, der Geräte-Abgleich entfällt (Teil C, Kopf).

**Ziel.** Gehaltene Akkorde werden arpeggiert, wie am microKORG: sechs Typen, 1–4 Oktaven, Gate, Swing, Latch, Key Sync und acht Schritt-Tasten zum Ein- und Ausschalten. Alles liegt taktgenau im Song-Tempo, live und aus Clips.

**Umfang.**
1. **Arp-Kern im Hauptfaden** (EN3-11), je AM-Spur.
   - Alle Notenquellen der Spur gehen bei `arp.on` in den „gehaltenen Satz“ statt direkt an `spawnVoice`: Tastatur, Akkordtasten, MIDI-Eingang (`inputDown`), Clip-Noten, MELODIE-Weg und Aufnahme-Wiedergabe.
   - **Gehaltener Satz** = Liste von Intervallen {Quellnote, an, aus} in Audio-Zeit. Sie wird gefüllt aus dem Live-Spiel (Zeit + `LIVE_LEAD`) und aus `scheduleTrack` (Clip-Noten mit ihren künftigen Zeitstempeln). Jeder Schritt fragt die Liste zu seiner eigenen Zeit ab. So beginnt kein Schritt bis zu einem Vorlauf zu früh oder in falscher Folge.
   - Der Satz speichert die **Quellnoten** (`clipNote`/`clipKey` bzw. die rohe Taste). Jeder Arp-Schritt wird zu seiner Zeit über `outPitch` abgebildet, mit Harmonie, Transponieren (⇅), „Eine Skala“ und FOLGT. `applyCarrierChange` (Z. 13080) plant auch die schon geplanten Arp-Schritte hinter dem Wechsel neu (`src 'arp'`: abbrechen und neu erzeugen, wie bei Clip-Stimmen).
   - Der Planer läuft in `tick()` **vor** `if (!R.playing) return;` (Z. 13137), mit dem Horizont `LOOKAHEAD`, und ruft `spawnWkVoice` mit Zeitstempel auf. Er schickt dem Worklet KEYS (Typ 9 erste Taste, Typ 10 alle Tasten los).
   - `noteLog` bekommt `src: 'arp'` mit Schritt-Nummer.
   - Im ECO-Klang läuft der Arp mit NativeVoice weiter (nur T1-Noten, B.5).
2. **Muster** (HB-MS S. 45): Gehaltene Noten aufsteigend N₁…Nₖ (nach der Abbildung zur Schrittzeit), Range R, U = [N₁…Nₖ, N₁+12…Nₖ+12, …] über R Oktaven.
   - Up = U, Down = U rückwärts.
   - Alt 1 = U + (U rückwärts ohne erstes und letztes).
   - Alt 2 = U + U rückwärts.
   - Random = gleichverteilt aus U. Startwert = Projekt-`id` + Spur-`uid` + Schritt-Zähler, damit Wiederholungen gleich bleiben.
   - Trigger = alle gehaltenen Noten je Schritt, Range wird ignoriert. Sind mehr Tasten als Stimmen gedrückt, spielen die tiefsten.
3. **Zeit:**
   - Schritt = Auflösung W-11 bei Song-Tempo.
   - Transport läuft: Raster = Song-Takt.
   - Transport steht: Raster ab dem ersten Tastendruck, die erste Note sofort (wie Live-Spiel, `LIVE_LEAD`).
   - Gate W-34.
   - **Swing:** Arp-Schritte bekommen `swingOffset` wie Clip-Noten (nach ihrer Lage im 16tel-Raster, Z. 13124). Ist W-35 ≠ 0, ersetzt es für diese Spur den globalen Swing (kein doppelter Swing).
   - KEY SYNC an: Das Muster beginnt mit dem ersten Tastendruck nach „alle los“ bei Schritt 1. Die Einsätze bleiben auf dem Raster.
   - KEY SYNC aus: Der Muster-Zähler läuft mit dem Raster weiter.
4. **Step-Arp** (HB-MK S. 11, S. 45): LETZTER SCHRITT 1–8 und Schritt-Maske `steps`. Ein ausgeschalteter Schritt ist eine Pause. Der Notenzeiger rückt trotzdem weiter (eK, Geräte-Abgleich).
5. **Latch:** Loslassen hält den Satz. Neue Tasten nach „alle los“ ersetzen ihn, eine weitere Taste beim Halten ergänzt. Latch aus → Stopp ≤ 1 Schritt.
6. **Ziel** (Dual/Split): Both │ T1 │ T2. Das nicht arpeggierte Timbre spielt die gehaltenen Noten normal. Die Arp-Noten tragen beim ON die Timbre-Maske `d` (N3.0.4), die gehaltenen Noten des anderen Timbres die Gegenmaske. **In Split bestimmt die gehaltene Taste das Timbre, nicht die Arp-Note**, auch wenn OKTAVEN die Note über `split` hebt.
7. **Aufnahme** (● REC, FANG, Overdub): Aufgezeichnet werden die **gespielten Tasten**. Der Arp entsteht beim Abspielen neu (H-8, entschieden). Song-MIDI-Export: wie bisher die Clip-Noten, ohne Arp-Noten (Lücke in CHANGES). Der **MIDI-Mitschnitt** (`PERF`, `buildMidiLog`) enthält dagegen bewusst die klingenden Arp-Noten, wie bei der Clip-Wiedergabe (`spawnWkVoice` schreibt `perfAdd`, Z. 12574).
8. **Aufräumen:** Stopp, Panik, Szenen- oder Teilwechsel, Engine-Wechsel, Arp aus und Spur stumm beenden alle Arp-Noten ≤ 1 Schritt. Keine hängende Note.
9. **Oberfläche** (wie am Original, B.3):
   - ARP-Taste (Zone Z2, neben VOLUME) schaltet den Arp; ihre LED zeigt an/aus, die Tempo-LED blinkt im Song-Tempo. LATCH ist ARP B Regler 1 (keine eigene Taste, wie am Original).
   - EDIT-WAHL 2: ARP A (TEMPO zeigt das Song-Tempo, AUFLÖSUNG, GATE, TYP, OKTAVEN) und ARP B (LATCH, SWING, KEY SYNC, LÄNGE = letzter Schritt, ZIEL).
   - Bei ARP A/B werden die Nummerntasten zu **Schritt-Tasten** 1–8 (HB-MK S. 11): leuchtend = an, blinkend (1 Hz) = Pause, dunkel = über LÄNGE. Der laufende Schritt ist zusätzlich hell markiert (≤ 1 Bild Verzug).
10. **Leistungs-Probe:** Fall „+Arp“ (4 Spuren, 1/24).
11. **Key Sync mit Arp:** Solange `arp.on`, setzen LFO1/2 und SEQ mit Key Sync „Timbre“ nur bei KEYS Typ 9 zurück (erste Taste nach „alle Tasten los“ = Akkordwechsel; HB-MS S. 41, S. 43, S. 63). Key Sync „Stimme“ setzt je Arp-Note zurück. Auslösung Single und die Portamento-Regel für die erste Note bleiben auf Stimmen-Ebene; ihre Wirkung mit Arp ist [U] (Geräte-Abgleich).

**Nicht-Umfang.** Arp für VA/FM/WT. Der Kern ist aber engine-frei gebaut (Teil G, VI2a). Arp-Noten im Song-MIDI-Export (der Mitschnitt hat sie, Umfang 7). Arp mit eigenem Tempo.

**Daten.** `arp` wirkt jetzt. `arp.tempo` wird nur gespeichert (EN3-10).

**Berührungspunkte.**
- **Wiederverwendet:** `tick`/`LOOKAHEAD`, `spawnWkVoice`, `noteLog`, `outPitch`, `applyCarrierChange`, `swingOffset`, `inputDown`, FANG/REC-Wege (unverändert für Nicht-AM-Spuren), `silenceAll`.
- **Neu:** Arp-Kern mit Intervall-Satz, KEYS-Ereignisse, Timbre-Maske `d`, Schritt-Tasten, Muster-Tabelle, Seed.

**Dauer** 7,5–8,5 h (Rev. 1: +1,5 h für Intervall-Satz, Abbildung je Schritt, KEYS, Timbre-Maske und ECO; Rev. 2: ARP-Taste und Schritt-Tasten nach dem Original ohne Mehraufwand, die Schalterzeile entfällt) · **Version 4.13.0** · **Budget** +33 KB · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK5-01 Muster:** C-E-G gehalten. Die Folgen Up, Down, Alt 1, Alt 2 und Trigger für Range 1–4 sind in `arpLog` deep-equal zur Testtabelle (Beispiel Range 1: Alt 1 = C E G E, Alt 2 = C E G G E C).
- [ ] **MK5-02 Random:** 4 Töne, 2000 Schritte: jeder Ton 25 % ± 4 %. Gleicher Seed → gleiche Folge (deep-equal).
- [ ] **MK5-03 Zeit** (M-ZEIT): Auflösung 1/16 bei 120 BPM ergibt Abstände von 125 ms. Einsätze auf dem Song-Raster ± 0,002 Schlag (`noteLog`), Audio-Einsatz offline ± 1 ms. Die Triolen 1/24, 1/12, 1/6 sowie 1/8 und 1/4 ebenso.
- [ ] **MK5-04 Gate:** 50 % ergibt eine Notenlänge von ½ Schritt ± 1 ms. Bei 100 % gibt es keine Lücke (M-EINBRUCH, Sustain 127). Bei 0 % sind es 3 ms.
- [ ] **MK5-05 Swing** +50 (1/8): Die geraden Noten kommen 62,5 ± 1 ms später. Bei −50 kommen sie früher, bei 0 gerade.
- [ ] **MK5-06 Step-Arp:**
  - LETZTER SCHRITT 4 mit Schritt 2 aus ergibt Note, Pause, Note, Note und wiederholt sich alle 4 Schritte. Der Notenzeiger rückt bei der Pause weiter.
  - Alle Schritte aus ergibt Stille ohne Fehler.
- [ ] **MK5-07 Key Sync:** An: Ein neuer Akkord nach „alle los“ beginnt bei Schritt 1 mit N₁. Aus: Die Position folgt dem Song-Raster (zwei Läufe mit unterschiedlichem Anschlagzeitpunkt ergeben dasselbe Muster ab dem Takt).
- [ ] **MK5-08 Latch:** Das Verhalten nach Umfang 5 stimmt, in `arpLog` geprüft.
- [ ] **MK5-09 Transport steht:** Die erste Arp-Note kommt ≤ 10 ms nach dem Tastendruck (gemessen am geplanten Zeitstempel).
- [ ] **MK5-10 Tempo:** Ein Tempo-Wechsel mitten im Lauf hat den nächsten Schritt im neuen Tempo. Kein doppelter und kein fehlender Schlag.
- [ ] **MK5-11 Ziel:** Dual mit Ziel T1: nur T1 arpeggiert, T2 hält den Akkord. Both und Split + Ziel ebenso. Split + Ziel T1 + OKTAVEN 3: keine Arp-Note auf T2, auch oberhalb von `split`.
- [ ] **MK5-12 Trigger** mit 6 Tasten bei 4 Stimmen: Die 4 tiefsten spielen (HB-MS S. 45).
- [ ] **MK5-13 Clips:** Ein 4-Takt-Akkord-Clip durch den Arp ergibt in zwei Durchläufen dieselbe `arpLog`-Folge. Szenen- oder Teilwechsel am Taktstrich lassen keine Note hängen.
- [ ] **MK5-14 Aufnahme:** ● mit Arp nimmt die Tasten auf (Clip-Noten = gespielte Akkorde), ein Undo. Beim Abspielen entsteht dieselbe Arp-Folge wie beim Spielen (Random mit gleichem Seed). `buildMidiLog` mit Arp an enthält genau die Arp-Noten aus `arpLog`; der Song-MIDI-Export enthält nur die Clip-Noten.
- [ ] **MK5-15 Aufräumen:** Für jede Aktion aus Umfang 8 gilt: nach ≤ 1 Schritt plus Release 0 klingende Stimmen (`voicesInfo`).
- [ ] **MK5-16 Leistung:** 4 Arp-Spuren mit 1/24 kosten ≤ 0,3 ms je `tick` (p95, Xeon). PE1 besteht. Die Leistungs-Probe läuft mit „+Arp“.
- [ ] **MK5-17 Oberfläche:**
  - ARP-Taste und Schritt-Tasten ≥ 44 × 44 in allen Formaten (P1 8 × 44, P2 2 × 4 à 80 × 44, P3 2 × 4 à 68 × 44, L1 44 × 44).
  - M-PLATZ in P1–P3, L1, L2, W, M-SKIZZE besteht weiter. Die Schritt-Tasten sind die Nummerntasten am selben Platz (M-ANSICHT, kein Sprung).
  - LED-Zustände an │ Pause (blinkt) │ über LÄNGE (dunkel) laut `arpLog`; die Tempo-LED blinkt im Song-Tempo (± 1 Bild).
  - Die Anzeige des laufenden Schritts ≤ 30 Hz.
- [ ] **MK5-18 Regression:** FANG, ● REC, MELODIE, Song-Ablauf und Teile sind für Nicht-AM-Spuren und für AM mit Arp aus unverändert (die Abnahmen von V2b–V2d′ bestehen). Budget ≤ +33 KB.
- [ ] **MK5-19 Akkordwechsel:** 4-Takt-Akkord-Clip mit Träger-Wechsel in Takt 3: Ab Takt 3 gehört jede Arp-Note zum neuen Akkord (`noteLog`, ± 0 HT), keine hängende Note. Ebenso mit „Eine Skala“ und ⇅ FOLGT.
- [ ] **MK5-20 Swing und Transport:** Globaler Swing 30 %, Arp 1/16, W-35 = 0: Die geraden Arp-Schritte liegen wie die Clip-16tel (± 1 ms). W-35 = +50: nur W-35 wirkt. Transport steht: Ein gehaltener Akkord läuft ≥ 4 s ohne Lücke weiter (Planer vor `R.playing`). Clip-Noten mit künftigen Zeitstempeln starten keinen Arp-Schritt zu früh.
- [ ] **MK5-21 Key Sync mit Arp:** Arp an, Gate 50 %, LFO1 und SEQ auf Key Sync „Timbre“: Die Phase läuft über die Arp-Schritte weiter und setzt nur bei einem neuen Akkord nach „alle Tasten los“ zurück (einmal je gehaltenem Akkord). Auf „Stimme“ setzt sie bei jeder Arp-Note zurück.
- [ ] **MK5-22 ECO:** Mit `forceNative` arpeggiert ein AM-Sound weiter (T1-Noten, `arpLog` wie im Worklet-Klang), keine Konsolenfehler.

**Tests.** `mk5-arp.mjs` (`arpLog`, `noteLog`), `mk5-arp-audio.mjs` (OfflineAudioContext, Einsätze), `mk5-ui.mjs`.

**Fach-Prüfung:** **FP-SONG ●** Haupt-, **FP-TOUCH** Zweit-Blick.

**iPhone:** ARP-Taste an, Akkord halten. EDIT-WAHL 2 auf ARP A: TYP (Regler 4) Alt 2, OKTAVEN (Regler 5) 2. ARP B: LÄNGE (Regler 4) 6, zwei Nummerntasten antippen (blinken = Pause). Mit laufendem Song spielen.

**Geräte-Abgleich:** Step-Arp „Schritt aus“ (rückt die Note weiter?). Swing +50. Gate 0. Key Sync aus bei laufendem Takt (microKORG ohne MIDI-Clock: nur Muster-Neustart vergleichen). Arp 1/16, Gate 50 %, LFO1 Key Sync Timbre: Startet der LFO je Akkord oder je Schritt neu? Auslösung Single mit Arp.

**Risiken.** Die Pausen-Regel ist [U]. Das Arp-Verhalten bei sehr kurzen Clip-Noten (< 1 Schritt) hängt von der Länge ab: Eine Note zählt, solange sie gehalten ist.

---

### MK6 — Mod-Sequenzer 3×16 und „Bewegung aufnehmen“

> **Gebaut, 4.14.0.** Bau-Beleg; die Bedienfeld-Teile dieses Abschnitts gehören zur alten Vorlage und werden durch MK-P ersetzt, der Geräte-Abgleich entfällt (Teil C, Kopf).

**Ziel.** Je Timbre verändern drei 16-Schritt-Sequenzen beliebige Regler im Takt, wie beim MS2000, mit Glatt oder Stufe, vier Laufrichtungen, Einmal oder Schleife und Neustart je Timbre oder je Stimme. Reglerbewegungen lassen sich in Echtzeit in die Schritte aufnehmen.

**Umfang.**
1. **Worklet**, je Timbre und je Stimme bei Key Sync „Stimme“.
   - SEQ AN/AUS, LETZTER SCHRITT 1–16, TYP (Vorwärts, Rückwärts, Wechsel 1 = 1…16, 15…2, Wechsel 2 = 1…16, 16…1), LAUF (Einmal hält den letzten Wert, Schleife), KEY SYNC (aus = Song-Raster bzw. freilaufend, Timbre, Stimme), AUFLÖSUNG W-10 bei Song-Tempo.
   - **KEY SYNC aus:** Zyklus C = Summe aller Schrittlängen in Schlägen (nach Schrittlänge). Der laufende Schritt ist dort, wo (Song-Schlag mod C) in den aufsummierten Längen liegt. Einmal mit KEY SYNC aus startet bei Song-Schlag 0 und hält nach C. Ein Tempo-Wechsel behält die Schlag-Lage (wie der synchrone LFO, Worklet Z. 4351–4355). **Timbre:** mit Arp gilt KEYS (MK5 Umfang 11).
   - Je Sequenz: ZIEL, BEWEGUNG (Glatt = linear zwischen den Schrittwerten, in Bruchwerten; Stufe = halten, jeder Sprung als lineare 1-ms-Rampe ab der Blockgrenze, B.6 Nr. 2), 16 Werte.
2. **Ziele:** keins, Tonhöhe (±24 HT), Schrittlänge (±6), Portamento, OSZ1-Steuer 1, OSZ1-Steuer 2, OSZ2-Halbton (±24), OSZ2-Fein, Mixer OSZ 1/OSZ 2/Rauschen, Cutoff, Resonanz, HK-INT, Keytrack, Amp-Pegel, Pan, EG1 A/D/S/R, EG2 A/D/S/R, LFO1-Freq, LFO2-Freq, Patch 1–4 Intensität.
   - Abgeleitet aus HB-MS S. 43 („Regler des Bedienfelds, ±63“) und S. 65 (Regler-Liste). Schalter sind keine Ziele [U].
   - Der Schrittwert wird zum gespeicherten Reglerwert addiert und geklemmt.
   - Schrittlänge verschiebt den Auflösungs-Index des Schritts um den Wert (eK; HB-MS S. 43 „±6“).
   - Steuer 2 mit Speicherwelle ergibt eine Wellenfolge (2-ms-Gleichleistungs-Blende).
   - Tonhöhe wirkt auf den Keytrack (KT, B.2; HB-MS S. 39).
   - Ziel LFO1/2-Freq bei Tempo Sync an: ohne Wirkung [U] (wie der Patch, W-18; kein Geräte-Abgleich möglich, der microKORG hat keinen Seq; eK).
3. **Vorrang:** Zielen zwei Sequenzen auf denselben Regler, gilt SEQ 3 vor SEQ 2 vor SEQ 1. Die LCD zeigt „*“ (HB-MS S. 43).
4. **Bewegung aufnehmen** (HB-MS S. 26):
   - [● AUFN.] (Zusatz-Ansicht SCHRITTE) bei gewählter Sequenz; danach springt die Ansicht zu GERÄT, und die Matrix-Zeile zeigt „● AUFN.“ blinkend. Die Aufnahme beginnt mit dem ersten bewegten Regler einer Sektion der EDIT-WAHL 1 bzw. der PATCH-Stellungen.
   - Das Ziel der Sequenz wird dieser Regler. Werte werden ab dem laufenden Schritt bis LETZTER SCHRITT geschrieben, dann endet die Aufnahme selbst.
   - Nur der zuerst bewegte Regler zählt. ARP- und Effekt-Regler nehmen nicht auf.
   - Ein Undo für die ganze Aufnahme.
   - Während der Aufnahme läuft die Sequenz immer vorwärts und als Schleife (S. 42–43).
5. **Werkzeuge:** Sequenz neu (eine oder alle), kopieren (aus einem anderen AM-Sound, Timbre und Sequenz wählbar; ab MK9 steckt 🔒 an, EN3-08a), alles kopieren, tauschen. Je ein Undo (HB-MS S. 47–48).
6. **Stellung SEQ** der EDIT-WAHL 2 (am Original MIDI; B.3):
   - Ebene 1: SEQ AN · SEQUENZ (1 │ 2 │ 3) · ZIEL (Tipp-Liste; als Regler stetig mit Rundung, B.3) · BEWEGUNG (Glatt │ Stufe) · LÄNGE. Ebene 2 (SHIFT): TYP · LAUF · KEY SYNC · AUFLÖSUNG. In der Matrix-Zeile zeigt „●“ hinter SEQ, dass die Sequenz läuft.
   - SHIFT + 5: Sequenz-Werkzeuge (Umfang 5).
   - **Zusatz-Ansicht SCHRITTE** (Tipp auf die Matrix-Zeile SEQ, die dann „SCHRITTE ▸“ trägt; oben [◂ GERÄT] [SEQ 1][SEQ 2][SEQ 3] [● AUFN.], je ≥ 44 × 44): 16 Säulen nach B.3 (volle `.pg`-Breite ohne Holzwangen): P1 2 × 8 à 41 × 88 (4 px), P2 2 × 8 à 39 × 88 (4 px), P3 2 × 8 à 36 × 88 als ein Canvas-Feld ohne Zwischenraum, L1 16 × 41 × 90 (3 px, 701 px), L2 und Halb-Ansicht quer 16 × 36 × 74 (3 px). Senkrecht ziehen ändert den Wert über die **volle Säulenhöhe** in Ziel-Einheiten (±6/±24/±63), ohne Feinmodus über den Waagrecht-Abstand. Ein Tipp über bzw. unter dem Balken ändert ±1 (je ein Undo). Waagrecht > 8 px malt über mehrere Säulen. Eine Geste = ein Undo, ein zweiter Finger wird ignoriert. Der laufende Schritt ist hell (Canvas 2D, ≤ 30 Hz, nur sichtbar).
   - L1: Die Kopfreihe der Ansicht (44 px), 2 px, darunter die 16 Säulen (90 px): 136 px. Quer mit Halb-Ansicht: 44 + 2 + 74 = 120 px.
   - P1: 44 + 8 + 2 × 88 + 4 = 232 px.
7. **Leistungs-Probe:** Fall „+Seq“.

**Nicht-Umfang.** Seq im Vocoder-Modus (HB-MS hat dort keine Seq, S. 49–52). Mehr als 16 Schritte.

**Daten.** `t[].seq` wirkt jetzt.

**Berührungspunkte.**
- **Wiederverwendet:** Worklet-Tempo und Phase (`songStart`), Stimmen-Zustand, Undo, Canvas-Muster der vorhandenen Anzeigen.
- **Neu:** Seq-Kern (mit der Song-Raster-Regel), Säulen-Editor mit Tipp ±1, Aufnahme-Logik.

**Dauer** 8–9 h (Rev. 1: +0,5 h; Rev. 2: +0,5 h für Stellung SEQ mit Ebene 2 und die Zusatz-Ansicht) · **Version 4.14.0** · **Budget** +36 KB · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK6-01 Zeit:** Auflösung 1/16, 120 BPM, Ziel Amp-Pegel, Stufe: Beginn der 1-ms-Rampe alle 125 ms ± 1 Steuerblock (16 Samples), am Pegel gemessen. Alle 16 Auflösungen nach W-10. Amp-Pegel-Stufe ±63 besteht M-KLICK.
- [ ] **MK6-02 Glatt:** Lineare Rampe. In der Schrittmitte weicht der Wert ≤ 1 % des Hubs ab.
- [ ] **MK6-03 Typen:** Bei LETZTER SCHRITT 16 sind die Schrittfolgen (`mkScope().seqStep`) für Vorwärts, Rückwärts, Wechsel 1 und Wechsel 2 deep-equal zur Tabelle. LETZTER SCHRITT 5 ergibt die Länge 5.
- [ ] **MK6-04 Lauf:** Bei Einmal bleibt der Wert nach dem letzten Schritt genau stehen. Bei Schleife wiederholt er sich.
- [ ] **MK6-05 Key Sync:**
  - Timbre: Reset bei der ersten Note nach „alle los“, weitere Noten in derselben Phase. Mit Arp an (Gate 50 %): Reset nur je Akkord (MK5-21).
  - Stimme: zwei Noten 0,3 s versetzt stehen auf verschiedenen Schritten.
  - Aus: Schritt = Song-Rasterposition bei laufendem Transport. Mit Schrittlänge ±2 ergeben zwei Starts aus verschiedenen Takten denselben Schritt am selben Song-Schlag.
- [ ] **MK6-06 Ziele:**
  - Tonhöhe +12 an Schritt 3 ergibt +1200 ± 1 ct nur in Schritt 3.
  - Cutoff +63 ergibt +63 Einheiten, geklemmt bei 127.
  - Schrittlänge +2 an Schritt 1 (1/16) lässt Schritt 1 so lange dauern wie Auflösungs-Index + 2 (3/32 = 187,5 ms ± 1 Block).
  - OSZ2-Halbton ±24 ± 1 ct.
  - EG-Zeiten wirken ab der nächsten Stufe.
  - Patch-Intensität wirkt.
  - Ziel LFO1-Freq bei Tempo Sync an: bitgleich wirkungslos.
- [ ] **MK6-07 Vorrang:** SEQ 1 und SEQ 3 auf Cutoff → nur SEQ 3 wirkt, die LCD zeigt „*“.
- [ ] **MK6-08 Wellenfolge:** Speicherwelle, SEQ 1 → Steuer 2, Stufe: je Schritt die erwartete Welle (Spektrum-Vergleich mit dem Einzel-Render), M-KLICK besteht.
- [ ] **MK6-09 Bewegung aufnehmen** (Test-API simuliert den Reglerzug bei laufender Note):
  - Die Werte landen ab dem Schritt des ersten Zugs bis LETZTER SCHRITT. Danach endet die Aufnahme.
  - Das Ziel ist der bewegte Regler, nur der erste zählt.
  - Ein Undo stellt alles her. ARP- und Effekt-Regler schreiben nichts.
- [ ] **MK6-10 Neutral:** Seq aus = bitgleich zum Vorgänger-Stand. Seq an mit allen Werten 0 (Ziel ≠ Schrittlänge) = bitgleich.
- [ ] **MK6-11 Säulen-Editor:**
  - Ziehen ändert einen Schritt, waagrecht malen ändert mehrere, je ein Undo. Ein zweiter Finger ändert nichts.
  - Werte in Ziel-Einheiten (±6/±24/±63) über die volle Säulenhöhe; Tipp über/unter dem Balken ±1, je ein Undo. Alle ≈ 30 ZIEL-Einträge sind mit ≤ 200 px Zug erreichbar.
  - M-PLATZ in P1–P3, L1, L2, W für die Stellung SEQ (Ebene 1 und 2) und die Zusatz-Ansicht; M-SKIZZE besteht weiter. M-ANSICHT bei GERÄT ↔ SCHRITTE (Rahmen und Räder bleiben stehen). Kopf-Tasten der Ansicht ≥ 44 × 44.
- [ ] **MK6-12 Leistung:** 3 Sequenzen je Timbre mit 4 Stimmen bei Key Sync „Stimme“ kosten ≤ +0,5 × VA-Stimme (Node-Offline, gleicher Lauf). Die Anzeige hat keine `longtask`, rAF ≥ 55 fps. Die Leistungs-Probe läuft mit „+Seq“.
- [ ] **MK6-13 Werkzeuge:** Kopieren, Tauschen und Neu ergeben deep-equal-Ergebnisse, je ein Undo. Regression und DoD, Budget ≤ +36 KB.
- [ ] **MK6-14 Keytrack und Aufnahme:** Seq-Tonhöhe +12 mit KEYTRACK +48 hebt den Cutoff um +12 HT ± 1 %. Während [● AUFN.] läuft die Sequenz vorwärts als Schleife, auch bei TYP Rückwärts und LAUF Einmal.

**Tests.** `mk6-seq.mjs` (Node-Offline), `mk6-rec.mjs`, `mk6-ui.mjs`.

**Fach-Prüfung:** **FP-DSP** Haupt-, **FP-SONG** Zweit-Blick (Taktgenauigkeit).

**iPhone:** EDIT-WAHL 2 auf SEQ: SEQ AN, ZIEL Cutoff; SCHRITTE ▸ Säulen malen, Song starten. [● AUFN.], zurück zu GERÄT und den CUTOFF-Regler drehen.

**Geräte-Abgleich:** entfällt, der microKORG hat keinen Mod-Sequenzer. Die Kurven bleiben eK.

**Risiken.** „Schrittlänge“ ist eine Auslegung [U]. Ohne Gerät gibt es keinen Abgleich.

---

### MK7 — Vocoder mit 16 Bändern und Eingänge

> **Gebaut, 4.15.0.** Bau-Beleg; die Bedienfeld-Teile dieses Abschnitts gehören zur alten Vorlage und werden durch MK-P ersetzt, der Geräte-Abgleich entfällt (Teil C, Kopf).

**Ziel.** Ein AM-Sound wird zum Vocoder: Die Stimme (Mikrofon oder eine andere Spur) formt einen Akkord aus vier Stimmen. Mit „Formant halten“ klingt ein gespeicherter Vokal auch ohne Mikrofon, also auch in der Claude-App. Synth-Programme können einen Eingang wie einen Oszillator filtern.

**Umfang.**
1. **Eingänge** (EN3-15):
   - `tr.mkIn.e1/e2` = Mikrofon (nur Pages und nur auf Tipp, über den gemeinsamen Mikrofon-Abgriff) │ Spur k (Abgriff vor ihrem Fader) │ aus. Gewählt wird über QUELLE 1 ▾ (MIXER, Ebene 2) bzw. QUELLE 2 ▾ (EING. 1, Ebene 2); die LEDs E1/E2 (Zone Z6, links neben der Anzeige) leuchten bei Signal, rot bei Übersteuerung (≥ −1 dBFS).
   - **Gemeinsamer Mikrofon-Abgriff** (neu, referenzgezählt): ein Strom mit `MIC_ASK` (Echo-Unterdrückung, Rauschunterdrückung und AGC aus, Z. 29401; so bleibt es), play-and-record, ein GainNode zum Anschließen, Freigabe, wenn der letzte Nutzer stoppt. **Ohne Stimm-Analyse:** Kalibrierung, 2-min-Ringpuffer und MPM-Worklet der VS1-Sitzung (`stStart`, Z. 30333) laufen für den Vocoder nicht an. 🎤-Stimme und Vocoder nutzen den Abgriff gemeinsam; das Stoppen des einen schneidet den anderen nicht ab. Die Wege-Erkennung (`route`, Z. 30255) wird nur gelesen: Kopfhörer-Hinweis, bei `bt` LCD „Kabel-Kopfhörer empfohlen“.
   - **Spur k:** Abgriff **vor dem Fader** (nach Drive/Chorus/Trem, vor Vol/Pan; `buildChain` Z. 12026). Je Eingang ein Schalter **„Quelle nur als Eingang“** (`eDry` 0, H-10): Solange er an ist und die Quelle einen AM-Eingang speist, trennt die App den `post` der Quelle von `masterSum` und beiden Sends; die Quelle wird weiter geplant und gerechnet. `tr.mute` wird dafür nicht benutzt; Stummschalten der Quelle bleibt wie bisher (dann schweigt auch der Eingang).
   - Der Worklet-Knoten **jeder Synth-Spur** hat ab MK7 **1 Eingang mit 2 Kanälen** (E1, E2; `channelCountMode 'explicit'`, `interpretation 'discrete'`). Das gilt auch bei VA/FM, damit der Engine-Wechsel ohne neuen Knoten geht (Kosten: MK7-12). Dazu kommt ein `ChannelMergerNode` je Spur, das nur bei einer gewählten Quelle verbunden ist.
   - Spuren, die einen Kreis bilden würden (eigene Spur, Spuren mit dieser Spur als Eingang), sind nicht wählbar.
   - In der Claude-App gibt es kein Mikrofon: kein Eintrag, kein `getUserMedia`.
2. **Welle „Eingang“** (OSZ 1, W-30) in Synth-Programmen.
3. **Vocoder-Modus** (`mode` 3):
   - Der Träger ist Timbre 1: OSZ 1 (alle Wellen; Sinus ohne Kreuzmod., STEUER 1/2 nach W-27b, HB-MS S. 49) + Rauschen + E1 (EINGANG 1), 4 Stimmen. Die Stimmen werden **zuerst summiert**; die 16 Synthese-Bänder laufen **einmal je Timbre** auf dem summierten Träger, stereo über K-PAN (HB-MK S. 31).
   - FC-MOD-Quellen je Stimme (EG, Anschlag, Keytrack) kommen von der **neuesten gegateten Stimme** (Fokus-Regel der App, Worklet-Kopf); LFOs nutzen die globale Phase des Timbres (eK, in CHANGES).
   - Bänder als TPT-SVF (W-37, B.6 Nr. 10). Koeffizienten nur bei Änderung neu, je Sample interpoliert.
   - Im `mode` 3 laufen Analyse, Folger, DIREKT und HPF in **jedem** Quantum, solange ein Eingang verbunden ist, auch ohne klingende Stimme (heute rechnet das Worklet nur `if (any)`, Z. 5143).
   - Der Modulator ist E2.
   - 16 Analyse-Bänder (feste Mitten W-36), Hüllkurvenfolger (W-38), 16 Synthese-Bänder (Verschiebung FORMANT, CUTOFF, FC-MOD), Resonanz W-37, Gate/Schwelle W-39, HPF W-40, Direkt W-41, Verzerrer, Anschlag, Keytrack, Kanal-Pegel und -Pan W-42.
   - EG/LFO wie Synth, Effekte und Arp wie Synth.
4. **Formant halten:**
   - FOLGER = 127 oder die Taste **TIMBRE/HALTEN** (im Vocoder-Programm, wie am Original; LED 1 leuchtet) friert die 16 Folgerwerte ein und speichert sie als `voc.hold` im Sound (HB-MK S. 3, S. 35).
   - Ein Sound mit `hold` klingt ohne Quelle.
   - Erneuter Tipp auf TIMBRE/HALTEN = Folger läuft wieder (der Wert vor Halten wird zurückgesetzt).
5. **Oberfläche** (wie am Original, B.3):
   - STIMME Regler 1 SYNTH/VOC. schaltet auf Vocoder; die Drehschalter tragen dann die grünen Vocoder-Stellungen (EDIT-WAHL 1: EING. 1, FC-MOD; EDIT-WAHL 2: K-PEGEL A/B, K-PAN A/B), die LEDs ●1/●2 werden grün. EING. 1 und MIXER haben auf Ebene 2 [QUELLE 2 ▾] bzw. [QUELLE 1 ▾]; in beiden Listen der Schalter „Quelle nur als Eingang“ (H-10).
   - K-PEGEL A/B, K-PAN A/B: Regler 1–4 = Kanäle (je 2 Bänder, B.3). Zusatz-Ansicht **16 BÄNDER** (Tipp auf die Matrix-Zeile K-PEGEL bzw. K-PAN) mit 16 Säulen und Live-Bandpegeln (Canvas 2D, ≤ 30 Hz, nur sichtbar) für jedes Band einzeln.
   - Zwei Werkzeuge wie am Original: SHIFT + 1 Pegel zurücksetzen (alle 127), SHIFT + 2 Pan zurücksetzen (alle Mitte), je ein Undo (HB-MS S. 52, HB-MK S. 60, PDF 78).
   - SPIEL im Vocoder-Modus nach B.3 (CUTOFF/RESONANZ → Vocoder-Filter, ATTACK/RELEASE nur EG2). ⋯ → Init und SHIFT + 3 behalten `mode` 3 (HB-MS S. 51).
6. **Datenschutz:** Der Vocoder nimmt nichts auf. Das Mikrofon im Vocoder zählt wie 🎤-Hören (N2-VS1-02 (1)): SYNC und Realtime laufen weiter, das Audio verlässt das Gerät nie. Stopp gibt das Mikrofon frei.
7. **Leistungs-Probe:** Fall „Vocoder“ (synthetischer Modulator: Vokal-Folge aus der Vokal-Quelle, Umfang 8).
8. **Vokal-Quelle** (W-44: Glottis wie W-28 + F1–F4 als TPT-Resonatoren, Vokale a e i o u) als App-Code. MK8 rechnet daraus die `hold`-Spektren.
9. **Begrenzer Stufe 1:** Umschalten auf 2. Ordnung mit 30-ms-Überblendung und Pegelausgleich (B.4).
10. **ECO:** Ein Vocoder-Programm bleibt im ECO-Klang stumm, mit LCD-Hinweis (B.5).

**Nicht-Umfang.** Speichern des Modulators als Take (VS3). Vocoder für andere Engines (bleibt Spec §18, Teil G Nr. 11).

**Daten.** `mode` 3, `voc` und `tr.mkIn` (Spur, neutral `null`; `e1Dry`/`e2Dry` neutral 1).

**Berührungspunkte.**
- **Wiederverwendet:** aus VS1 `MIC_ASK`, `micAvail`, play-and-record und die Wege-Erkennung (nicht die VS1-Sitzung), Spur-Kette (Abgriff vor Vol/Pan, Trennung von `post`), Effektkern MK4, Arp MK5, Oktav-Tabellen (Träger), Fokus-Stimmen-Regel.
- **Neu:** gemeinsamer Mikrofon-Abgriff, Worklet-Eingang, Filterbank (TPT, eine Bank je Timbre), Folger, Halten, Kanal-Seiten, Kreis-Schutz, Schalter „Quelle nur als Eingang“, Vokal-Quelle.
- **Anzupassen:** `normTrack`/`normalizeProject` behalten `tr.mkIn` (Z. 11490–11500).

**Dauer** 11–12 h (Rev. 1: +2,5 h für Mikrofon-Abgriff, Abgriff vor dem Fader mit Schalter, Vokal-Quelle, Vocoder-Regeln aus dem Handbuch; Rev. 2: +0,5 h für die Vocoder-Stellungen der Drehschalter, Kanal-Paare, E1/E2-LEDs und HALTEN über TIMBRE) · **Version 4.15.0** · **Budget** +52 KB · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK7-01 Bandtrennung:** Modulator = Sinus in der Mitte von Band k (k = 1…16). Träger = Rauschen (Mixer Rauschen 127), FORMANT 0, CUTOFF 0, RESONANZ 64. Die Ausgangsenergie im Band k liegt ≥ 12 dB über k ± 1 und ≥ 30 dB über k ± 3.
- [ ] **MK7-02 Bandmitten:**
  - Synthese-Spitzen bei W-36 ± 3 % (FORMANT 0).
  - FORMANT +1 bzw. −2 verschiebt jede Spitze um +1 bzw. −2 Rasterstufen ± 3 %.
  - CUTOFF +63 = +2 Stufen. CUTOFF +32 liegt zwischen +1 Stufe ± 5 % (log).
  - FC-MOD EG2 +63 verschiebt am Gipfel um +2 Stufen.
  - SPIEL-CUTOFF im Vocoder-Modus verschiebt die Synthese-Bänder wie EDIT-CUTOFF; SPIEL-ATTACK lässt EG1 deep-equal.
- [ ] **MK7-03 Folger und Halten:**
  - FOLGER 0/64/126: Abfallzeit (−20 dB) nach W-38 ± 10 %.
  - 127 bzw. TIMBRE/HALTEN (LED 1 an): Verstummt der Modulator, bleibt der Ausgang über 5 s ± 0,5 dB.
  - `hold` wird gespeichert und geladen (deep-equal). Ein Sound mit `hold` klingt ohne jede Quelle (Claude-App-Test).
- [ ] **MK7-04 Gate:** SCHWELLE 64 und Modulator darunter: Ausgang ≤ −60 dB nach der Gate-Zeit (W-39) ± 10 %. SCHWELLE 0: Der Ausgang folgt dem Modulator bis −90 dB, keine Gate-Schließung, bitgleich zu Gate aus.
- [ ] **MK7-05 HPF:**
  - HPF-PEGEL 127: Modulator-Anteile > 6 kHz erscheinen im Ausgang (≥ −20 dB relativ zum Modulator-HF).
  - HPF-GATE ENA: nur bei klingender Trägerstimme. DIS: immer.
- [ ] **MK7-06 Direkt:** DIREKT 127 bei stummem Träger (keine klingende Stimme): Ausgang korreliert ≥ 0,95 mit dem Modulator. DIREKT 0 = nichts.
- [ ] **MK7-07 Kanäle und Init:** K-PEGEL k = 0 ergibt Band k ≤ −40 dB. K-PAN k = L63 ergibt rechts ≤ −30 dB. SHIFT + 1 (Pegel zurücksetzen) setzt alle Pegel auf 127 und lässt Pan deep-equal; SHIFT + 2 (Pan zurücksetzen) setzt alle Pan auf Mitte und lässt die Pegel deep-equal; je ein Undo. K-PEGEL A Regler 1 verschiebt die Bänder 1 und 2 um dasselbe Δ. ⋯ → Init und SHIFT + 3 auf einem Vocoder-Sound behalten `mode` 3.
- [ ] **MK7-08 Träger:**
  - Jede OSZ-1-Welle (Säge, Puls, Dreieck, Sinus, Stimmwelle, Speicherwelle, Rauschen, Eingang) ist als Träger hörbar.
  - Akkord C-E-G-H ergibt 4 Tonhöhen im Ausgang (Spektrum).
  - Der Mixer EINGANG 1 mischt E1 in den Träger.
  - Sinus-Träger: STEUER 1 0 → 127 hebt M-SP um ≥ ⅓ Okt; STEUER 2 127 mit LFO1 lässt M-SP mit dem LFO wandern. Beschriftung FORM/WFM.
- [ ] **MK7-09 Welle „Eingang“** (Synth):
  - Quelle Spur mit Sinus 440 Hz, Filter 24LPF Cutoff 40: der Pegel fällt nach Filterkurve.
  - BALANCE 0/127 ergibt nur E1 bzw. nur E2 (≥ 40 dB Trennung).
  - Transponieren und Fein wirken nicht (HB-MS S. 17).
- [ ] **MK7-10 Eingänge und Sicherheit:**
  - Ein Kreis ist nicht wählbar (Graph-Prüfung über alle Spuren).
  - Spur → AM-Eingang ≤ 1 Block Latenz.
  - In der Claude-App: `getUserMedia`-Zähler 0, kein Mikrofon-Eintrag.
  - Auf Pages: `getUserMedia` nur nach Tipp. Stopp ergibt `readyState 'ended'`. `track.getSettings().echoCancellation === false`.
  - 🎤-Stimme und Vocoder gleichzeitig: Das Stoppen des einen lässt den anderen laufen; erst nach dem letzten Stopp `readyState 'ended'`. Für den Vocoder laufen kein MPM-Worklet und kein Ringpuffer.
  - „Quelle nur als Eingang“: Die Quelle ist im Master ≤ −90 dBFS, der Vocoder wird weiter moduliert. Der Fader der Quelle auf 0 ändert den Eingang nicht (Abgriff vor dem Fader). Stummschalten der Quelle schweigt beide wie bisher.
  - Der Vocoder macht 0 Netzaufrufe.
- [ ] **MK7-11 CPU:**
  - Eine Vocoder-Spur (16 Bänder, 4 Stimmen Säge) kostet ≤ +2,4 × VA-Stimme gegenüber dem Synth-Programm (Node-Offline, gleicher Lauf), gemessen mit FC-MOD von einem LFO.
  - Begrenzer Stufe 1 halbiert die Filterordnung, die Nachbarband-Dämpfung bleibt dann ≥ 8 dB. Das Umschalten besteht M-KLICK und M-PEGEL (± 1 dB).
  - Die Leistungs-Probe läuft mit „Vocoder“.
- [ ] **MK7-12 Bitgleich:** Synth-Programme ohne Eingang klingen bitgleich zum Vorgänger-Stand. Der unverbundene Eingang kostet ≤ +0,16 × VA-Stimme.
- [ ] **MK7-13 Oberfläche:** M-PLATZ der Vocoder-Stellungen (Ebene 1 und 2) und der Zusatz-Ansicht 16 BÄNDER in P1–P3, L1, L2, W; M-SKIZZE besteht im Vocoder-Modus (grüne Beschriftung Farbton 100–150°). Der Wechsel Synth ↔ Vocoder lässt alle Bedienelemente an festen Plätzen (M-ANSICHT). LEDs E1/E2 folgen dem Eingangspegel (an ab −50 dBFS, rot ab −1 dBFS, ± 1 Bild). Bandpegel ≤ 30 Hz, rAF ≥ 55 fps.
- [ ] **MK7-14 Regression:** Die Abnahmen von VS0, VS1, VS2 und (wenn gebaut) VS3 bestehen, die Mikro-Wege sind unverändert bzw. laufen über den gemeinsamen Abgriff. Budget ≤ +52 KB.
- [ ] **MK7-15 ECO:** Mit `forceNative` bleibt ein `hold`-Sound der Vocoder-Bank stumm mit LCD-Hinweis (Pegel ≤ Worklet-Render), keine Konsolenfehler.
- [ ] **MK7-16 Vokal-Quelle:** Für C2 und C3 und alle 5 Vokale liegen F1/F2 der Spektralhülle bei W-44 ± 7 %. `tr.mkIn` übersteht Speichern → Laden deep-equal.

**Tests.** `mk7-voc.mjs` (Node-Offline mit `inputs`), `mk7-inputs.mjs` (Chromium, Fake-Mikrofon `--use-fake-device-for-media-stream`), `mk7-ui.mjs`.

**Fach-Prüfung:** **FP-DSP ●** Haupt-, **FP-IPHONE** und **FP-SICHER** Zweit-Blick (Mikrofon, N7V-35, Kreis-Schutz).

**Zwischenstand** nach MK7 (EN3-17) auf Pages, wegen des Mikrofons.

**iPhone** (Pages, mit Kopfhörer):
1. MS 2000 → EDIT-WAHL 1 auf STIMME → Regler 1 „Vocoder“. EDIT-WAHL 1 auf EING. 1 → SHIFT → QUELLE 2 = Mikrofon. Sprechen und Akkord spielen.
2. Taste TIMBRE/HALTEN (LED 1 leuchtet), Mikrofon aus, weiterspielen.
3. In der Claude-App den gehaltenen Sound öffnen und spielen.
4. Für CHANGES: `ST.latMs` je Weg (Lautsprecher, Kabel, Bluetooth) ablesen und übernehmen.

**Geräte-Abgleich:** microKORG-Vocoder mit FORMANT +1/−1, FOLGER Halten, HPF-PEGEL hoch (Zischlaute?).

**Risiken.** iOS legt bei play-and-record den Ton auf den Hörer (VS0-Befund). Darum der Kopfhörer-Hinweis. Mikrofon → Ausgang dauert ≈ 70–75 ms (Lautsprecher oder Kabel): Der Rundlauf Ausgang → Raum → Mikrofon aus VS1 (69,9 / 75,2 ms, `fragen-xander-9.md`) ist Eingangs- plus Ausgangslatenz, also derselbe Weg; dazu iOS-Puffersprünge von 256/384 Samples. DIREKT und HPF-PEGEL geben deshalb ein hörbares Echo der eigenen Stimme in den Kopfhörer, und der Vocoder wirkt verzögert. Alle MK8-Vocoder-Klänge haben DIREKT 0 und HPF-PEGEL ≤ 40 (INIT erfüllt das). Die Hilfe-Zeile nennt die Latenz. Bei Bluetooth-Kopfhörern schaltet iOS bei offenem Mikrofon voraussichtlich auf das Freisprech-Profil (mono, schmalbandig; am Gerät prüfen); darum der Hinweis „Kabel-Kopfhörer empfohlen“ bei `bt`.

---

### MK8 — Programm-Speicher A–H × 16 mit eigenen Werksklängen

**Ziel.** Wie am MS2000 hat die Engine „MS 2000“ einen Programm-Speicher mit **128 Plätzen in den Bänken A–H zu je 16** (HB-MS S. 2, S. 13). Alle 128 Plätze tragen eigene Werksklänge (keine Korg-Daten, EN3-07), geordnet wie am Gerät. Xander wählt sie mit BANK ▼ ▲ und den SELECT-Tasten 1–16 (MK-P), sieht „A01:Name“ in der Anzeige und legt eigene Klänge mit WRITE auf einen Platz. Jeder Klang zeigt, was die Klangerzeugung kann (Arp, Seq, Vocoder, Dual/Split, Speicherwellen).

**Umfang.**
1. **128 Werksklänge** auf A01 … H16 (Xander, 26.10.: Programm-Speicher wie am MS2000; ersetzt H-3 = 64 Klänge in acht Genre-Bänken).
2. **Ordnung wie am MS2000** [B: Voice Name List HB-MS S. 67–69, ausgewertet nur Kategorie und Modus je Platz, keine Namen]. In den Bänken A–G hat jeder Platz dieselbe Rolle; Bank H trägt die Vocoder-Programme. Die eigenen Klänge folgen diesem Raster:

   | Platz | Rolle in A–G | Platz | Rolle in A–G |
   |---|---|---|---|
   | 01 | Synth, hart | 09 | Bass |
   | 02 | Arpeggio (Arp an) | 10 | Sequenz/Bewegung (Mod-Seq) |
   | 03 | Fläche | 11 | Streicher/Chor/Fläche |
   | 04 | Bass | 12 | Lead |
   | 05 | Lead | 13 | Bläser bzw. weicher Synth |
   | 06 | Sequenz (Mod-Seq oder Arp) | 14 | Wellen-Sequenz (Speicherwellen, Seq auf CONTROL 2) |
   | 07 | Glocke/Perkussion | 15 | Bass |
   | 08 | Tasten (Orgel, E-Piano) | 16 | Effekt |

   **Bank H:** H01–H08 nach den Rollen 01–08, aber H02 und H07 als Effekt; **H09–H14 Vocoder** (6 Programme); **H15 Eingangs-Programm** (OSZ 1 = Eingang E1, klingt mit gewähltem Eingang; LCD-Hinweis „Eingang wählen: GLOBAL 1A“); **H16 = INIT MS 2000**.
3. **Rezepte frei entworfen** (EN3-07). Namen höchstens 12 Zeichen, wie das Gerät sie zeigt (HB-MS S. 35).
   - Die Vocoder-Programme haben `hold`-Spektren aus **eigenen** synthetischen Vokalen (Vokal-Quelle aus MK7, W-44, als Modulator; offline beim Bau oder zur Laufzeit gerechnet). Sie klingen ohne Mikrofon. Alle haben DIREKT 0 und HPF-PEGEL ≤ 40 (Latenz, MK7 Risiken).
   - Jeder Klang hat `role`, `bank` (1…8 = A…H), `slot` (1…16) und ⓘ (eigene Worte, keine Marken, keine Geräte, keine Künstler).
4. **Kompakt kodiert:** Ganzzahl-Bytes je Feld in fester Reihenfolge, Base64, im Block `sq-mk-src`, **je Bank ein Teil**. Entpackt wird je Bank erst bei Bedarf, vorher `tickAhead(.3)`. Trifft die Kodierung zufällig ein Markenwort, ändert das Bau-Skript das Salz-Byte (B.6 Nr. 9).
5. **Programm-Wahl** (mit MK-P; Teil G Nr. 18): BANK ▼ ▲ wählt A…H und bleibt an den Enden stehen, SELECT n lädt Programm n der Bank, −/NO +/YES gehen ein Programm zurück bzw. weiter (A01 … H16, an den Enden stehen bleiben). Ein Laden = ein Undo, Toast [Rückgängig]. Die LED der Taste des geladenen Programms leuchtet (außer während des Lauflichts, MK-P Umfang 4a); die Anzeige zeigt „A01:Name“.
6. **WRITE wie am Gerät:** WRITE (Platte) bzw. Sichern (Blattkopf) fragt nach dem Platz (Vorgabe: der zuletzt geladene) und legt den Klang dort ab: Er steht als eigener Klang in der Bibliothek, mit `bank`/`slot`, und **überdeckt** den Werksklang dieses Platzes. Gibt es schon einen eigenen Klang auf dem Platz, verliert der ältere nur `bank`/`slot` und bleibt in der Bibliothek. **WERKSKLANG ZURÜCK** (Seite 26 bzw. 20 UTILITY, MK-P) gibt den Platz frei; ein Werksklang geht nie verloren. Je Aktion ein Undo.
7. **Bibliothek:** Engine-Filter „MS 2000“ plus Chip „Bank ▾“ (A–H), ▶ Vorhören mit der vorhandenen Vorhör-Stimme, „INIT MS 2000“ unter „Init“.

**Nicht-Umfang.** Hörproben nach EN2-09 (das gilt für Vorbild-Sounds, V10P). Vorbild-Tags. Demo-Songs und Write-Protect des Geräts. microKORG-Programme (MK9). Werksdaten von Korg (EN3-07).

**Daten.** Werksdaten `SQ_MK_FACTORY` (kompakt, je Bank). Sound-Felder `bank` (1…8), `slot` (1…16): `normalizeSound` nimmt sie in seine Feld-Liste auf (Z. 7920–7928, neu); sie zählen nicht zum `soundHash` (dieselbe Regel, die V10P-10 später für `aud`/`role` festlegt). Welcher Klang auf einem Platz liegt, ergibt sich beim Laden: eigener Klang mit diesem `bank`/`slot`, sonst der Werksklang. Kein neues Format.

**Berührungspunkte.**
- **Wiederverwendet:** `SQ_FACTORY`-Muster, Bibliothek und Filter (N0b-01), Vorhören (V0b), Sichern, Pegel-Messung aus V10P (`v10p-pegel.mjs`-Verfahren), Vokal-Quelle (MK7).
- **Neu:** Programm-Speicher (Platz-Auflösung Werksklang/eigener Klang), Werksdaten, Felder `bank`/`slot` in `normalizeSound`, Platzwahl bei WRITE, WERKSKLANG ZURÜCK.
- **Parallel zu MK-P** (Teil G Nr. 18): Kommt MK-P zuerst, bindet MK8 die Wahl direkt an BANK, SELECT, −/+ und WRITE der Platte. Kommt MK8 zuerst, wählt es Programme bis MK-P nur über die Bibliothek und ‹ › im Blattkopf; das alte Bedienfeld bekommt keine neuen Teile.

**Dauer** 13–15 h in drei Bau-Abschnitten:
1. Datenform, Programm-Speicher mit WRITE und WERKSKLANG ZURÜCK, Bibliothek, Prüfskripte (4–4,5 h).
2. Bänke A–D, 64 Klänge (4,5–5 h).
3. Bänke E–H mit Vocoder-, Eingangs- und INIT-Programm, Pegel-Lauf (4,5–5,5 h).

**Version 4.17.0** (Lieferreihenfolge, E.1; wird MK8 vor MK-P ausgeliefert, 4.16.0) · **Budget** +60 KB · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK8-01 Vollständig:** 128 Klänge A01–H16, je mit Name (≤ 12 Zeichen), Rolle, Bank, Platz und ⓘ. Jeder lädt über die Programm-Wahl (Umfang 5) und über die Bibliothek, je ein Undo. `bank`/`slot` überstehen Speichern → Laden deep-equal.
- [ ] **MK8-02 Namen:**
  - Die E9-Prüfliste (A.13 der Spec) besteht.
  - Kein Name ist gleich oder ähnlich einem Werksnamen der Programmlisten HB-MS (S. 67–69) und HB-MK (PDF 77). Ähnlich heißt: Levenshtein ≤ 2, ohne Groß- und Kleinschreibung, Ziffern und Leerzeichen.
  - Die Listen liegen nur in der privaten Datei `scratchpad/manuals/werksnamen.local.json` (EN3-07). `mk8-daten.mjs` liest sie und scheitert, wenn sie fehlt. Eine Prüfung sucht 3 Werksnamen als Stichprobe in `bau/tests/` und im Repo: 0 Treffer.
  - Kein Markenwort (B.6 Nr. 9).
- [ ] **MK8-03 Herkunft:** CHANGES vermerkt je Klang „eigenes Rezept“. Das Prüfskript liest aus der Voice Name List nur Kategorie und Modus je Platz; keine Programmdaten von Korg.
- [ ] **MK8-04 Pegel:**
  - Prüfphrase je Rolle: Bass 8 Achtel C2, Lead C4–C5, Fläche 4 Takte Akkord, Arp/Seq Akkord mit Arp bzw. Seq an, Vocoder gehaltene Akkorde.
  - Ergebnis −18 ± 3 LUFS, True Peak ≤ −1 dBTP. Ausgenommen mit Grund in CHANGES: H15 (Eingang) und H16 (INIT).
  - Bässe: M-HANDYrel bei C2 ≥ −20 dB (wie V10P-07).
  - Wer eine Grenze verfehlt, wird nachgestimmt, nicht die Grenze. Gemessen wird mit den eingebauten (nachgezeichneten) Speicherwellen.
- [ ] **MK8-05 Ordnung und Merkmale** (Prüfskript zählt):
  - Jeder Platz 01–16 in A–G hat seine Rolle aus der Tabelle; H09–H14 sind Vocoder-Programme (`mode` 3), H15 nutzt OSZ 1 = Eingang, H16 gleicht INIT MS 2000 deep-equal.
  - ≥ 10 Klänge mit Arp an, ≥ 14 mit Mod-Seq, ≥ 10 mit Speicherwellen (zeigen „≈“), ≥ 12 mit Dual oder Split, ≥ 8 mit Delay-Sync.
  - Alle 6 Vocoder-Programme mit `hold`, DIREKT 0 und HPF-PEGEL ≤ 40.
- [ ] **MK8-06 Keine Doppel:** Innerhalb jeder Bank und zwischen gleichen Plätzen verschiedener Bänke (z. B. A04 gegen B04) unterscheiden sich alle Paare um ≥ 3 dB in mindestens einem relevanten M-BAND.
- [ ] **MK8-07 Bibliothek:** Der Filter „MS 2000“ + Bank X liefert genau die 16 Plätze der Bank (eigene Klänge auf einem Platz statt des Werksklangs). N0b-01 bleibt erfüllt. ▶ Vorhören funktioniert.
- [ ] **MK8-08 Größe und Zeit:** Die Werksdaten im Block sind ≤ 44 KB. Eine Bank entpackt in ≤ 5 ms (Xeon), alle 128 in Häppchen ≤ 8 ms mit einem Scheduler-Tick dazwischen. Ein Laden dauert ≤ 50 ms ohne `longtask`. Die Startzeit ohne AM bleibt unverändert.
- [ ] **MK8-09 Programm-Wahl und WRITE:** Mit MK-P: BANK ▼ ▲, SELECT 1–16 und −/NO +/YES nach Umfang 5 (Enden, LED, Anzeige „A01:Name“). WRITE legt einen geänderten Klang auf einen gewählten Platz; dieser Platz lädt danach den eigenen Klang, alle anderen Plätze bleiben deep-equal; WERKSKLANG ZURÜCK stellt den Werksklang her; je ein Undo, Undo stellt deep-equal her. Ohne MK-P (MK8 zuerst): dieselben Prüfungen über Bibliothek und ‹ ›. M-PLATZ für die Platzwahl in P1–P3, L1, L2, W, Zeilen ≥ 44 px.
- [ ] **MK8-10 Regression und DoD**, Budget ≤ +60 KB.

**Tests.** `mk8-daten.mjs` (Namen, Herkunft, Ordnung, Merkmale), `mk8-pegel.mjs`, `mk8-ui.mjs` (Programm-Wahl, WRITE, Bibliothek).

**Fach-Prüfung:** **FP-KLANG ●** Haupt-, **FP-TOUCH** Zweit-Blick.

**Zwischenstand** nach MK8 (EN3-17).

**iPhone:** Mit BANK ▼ ▲ und den SELECT-Tasten jede Bank einmal durchtippen, einmal über den Lautsprecher, einmal mit Kopfhörer. Ausreißer melden (zu leise, zu laut, langweilig). Einen Klang ändern, mit WRITE auf einen Platz legen und mit WERKSKLANG ZURÜCK den Werksklang wiederholen.

**Geräte-Abgleich:** entfällt (kein Gerät, EN3-16).

**Risiken.** Nichts ist angehört. 128 Klänge sind viel Klangarbeit, deshalb drei Bau-Abschnitte. Die Rollen-Ordnung folgt dem Gerät; die Klänge selbst sind eigene Rezepte.

---
### MK8b — Kompakt-Bibliothek: 128 eigene Klänge im Stil der kleinen Schwester (Genres) — aktiv (Xander 27.10.)

**Anlass** (Xander, 27.10.2026): „Du hast am Anfang auch gesagt, dass du die Bibliothek von MicroCork reinmachst. Dann mach es auch.“ Wie bei MK8 (eigene MS2000-Werksklänge) gilt: **keine Korg-Daten** – keine Werte, keine Namen aus einer Werksliste (EN3-07). Es sind eigene Rezepte, die so klingen, wie man es von der kleinen Schwester des MS2000 kennt.

**Ziel.** Xander findet in der Bibliothek eine Sammlung **„Kompakt“** mit **128 eigenen Klängen** für die Engine „MS 2000“, geordnet in **8 Genres zu je 16** (Reiter wie an der kleinen Schwester: TRANCE · TECHNO/HOUSE · ELECTRONICA · D&B/BREAKS · HIPHOP/VINTAGE · RETRO · S.E./HIT · VOCODER). Antippen = Vorhören, [Laden] = auf die Spur (ein Undo), [Auf Platz schreiben] = WRITE auf einen Platz A01–H16 (wie MK8, der Werksklang des Platzes bleibt erhalten).

**Umfang.**
1. **Rezepte** mit dem MK8-Generator (kompakt kodiert, kein Rohdaten-Block): je Genre typische Rollen (Lead, Pad, Bass, Arp, Sequenz, Chord, FX/Hit, Drum-artig), mindestens 6 Klänge pro Genre mit laufendem Arp oder Mod-Sequenz, 2-Timbre-Klänge (Dual/Split) wo passend; Genre VOCODER: 16 Vocoder-Klänge mit E2 = Mikrofon (MK-P/G-MKP8-Regel), 8 davon mit Kanal-Paaren wie bei 8 Bändern (Pegel/Pan paarweise gleich).
2. **Pegel** wie MK8 kalibriert (gleiche LUFS-Spanne und Spitzen-Grenze).
3. **Namen** eigene, kurze englische Klangnamen (≤ 12 Zeichen); Abgleich gegen die private Namensliste wie MK8-02 (Levenshtein ≤ 2 = verboten).
4. **Oberfläche** in der Bibliothek: Sammlung „Kompakt“, 8 Genre-Reiter, Liste per Finger scrollbar, Trefferflächen ≥ 44 px, kein Layout-Sprung; im Claude-Fenster gilt der Vocoder-Hinweis wie in 4.17.0.
5. **Marken-Regel:** In der App steht nirgends ein Korg- oder Modellname der kleinen Schwester; die Sammlung heißt „Kompakt“.

**Version 4.23.0** (nach F1 = 4.22.0; die Zusammenführung setzt die Nummer) · **Budget** ≤ +45 KB · Format bleibt 5.

**Abnahme**
- [ ] **MK8b-01** 128 Klänge, 8 Genres × 16, alle laden ohne Fehler, jeder Klang hörbar (rms > −40 dBFS bei C3 gehalten bzw. mit Mikro-Attrappe für Vocoder).
- [ ] **MK8b-02** Namen: kein Treffer gegen die private Werksnamen-Liste (Levenshtein ≤ 2), keine doppelten Namen.
- [ ] **MK8b-03** Pegel: LUFS-Spanne und Spitzen wie MK8-Pegelprüfung.
- [ ] **MK8b-04** Genre-Merkmale: ≥ 6 Arp/Seq-Klänge je Genre, VOCODER-Genre 16 Vocoder mit E2 = Mikro.
- [ ] **MK8b-05** Laden = 1 Undo, Undo stellt deep-equal her; WRITE auf Platz wie MK8-09; Speichern → Laden deep-equal.
- [ ] **MK8b-06** Layout P1, P2, P3, L1, L2, 926×428: nichts abgeschnitten, ≥ 44 px, Liste per Finger scrollbar, 0 px Layout-Sprung.
- [ ] **MK8b-07** Marken-Regel: kein Korg-/Modellname im ausgelieferten Code (grep).

### MK9 — Späterer Import eigener Programme (MS2000 und microKORG, nur lokal) — zurückgestellt

**Status (25.10., Xander; EN3-21): zurückgestellt.** Xander hat keinen Rechner, kein Editor-Programm und keine .syx/.prg-Dateien; er arbeitet nur am iPhone und kennt MIDI nicht, und iOS Safari hat kein Web MIDI. Ohne Rechner und MIDI-Interface entstehen keine Dumps. MK9 steht deshalb **außerhalb der Versionsfolge** (E.1), wird nicht gebaut und hält kein anderes Paket auf. Der Text bleibt als Vorlage stehen. Wird MK9 später doch gebaut (nur auf Xanders Wunsch), bekommt es die nächste freie Nummer in Bau-Reihenfolge (E.4), rüstet `mkLocalStrip` in alle dann vorhandenen Wege vom Gerät weg nach (EN3-08, EN3-19) und braucht vorher den Nachweis, dass der Weg ohne Rechner geht (zum Beispiel Dateien, die Xander am iPhone bekommt). **Rev. 3 (26.10.):** Über diesen Weg kann Xanders Wunsch „Presets vom microKORG nachrüsten“ später gehen: microKORG-Programme passen auf dieselbe Engine (A.11), die Engine braucht dafür nichts Neues. Werksprogramme von Korg kommen nie in die App (EN3-07).

**Ziel.** Xander holt seine eigenen microKORG- und MS2000-Programme in die App. Sie bleiben auf seinem Gerät und gehen nie ins Netz.

**Tor MK9-T** (vor dem ersten Bau-Schritt in CHANGES protokolliert). Es gilt eines von beiden:
- (a) Am Bau-Ort liegt ein Formatbeleg für die Programmdaten von MS2000 und microKORG. Das ist das Korg-Dokument „MIDI Implementation“ mit der Program-Data-Tabelle und der 7-Bit-Paketierung. Es ist nicht Teil der Handbücher (HB-MS S. 64). Vorgabe der Rev. 1 (ruht mit dem Paket): Der Orchestrator holt das öffentliche Dokument und legt es privat neben die Handbücher (nur Fakten übernehmen, wie bei den Handbüchern).
- (b) Xander liefert **drei Test-Dumps** mit notierten Werten (Blatt D.7 der Rev. 1; entfällt in Rev. 2, weil es USB-MIDI und einen Rechner bräuchte, EN3-21). Dann wird die Zuordnung daran erarbeitet und geprüft. (b) reicht nur für die Felder, die die Test-Dumps abdecken. Die übrigen Felder bleiben bis (a) auf INIT, mit Hinweis.

Ohne Tor wird das Paket nicht gebaut; es hält nichts auf (E.1 „Tore“).

**Umfang.**
1. **Datei-Wahl** über den vorhandenen .syx-Weg (Menü → Sounds → [Programme importieren (.syx/.prg)], ohne `accept`-Attribut wegen iOS, wie Z. 26513).
2. **Erkennen:** Gerät (MS2000/microKORG), Einzelprogramm oder Bank, .prg. Entschlüsseln laut Formatbeleg. Jedes Feld wird auf `p.mk` abgebildet, über eine Zuordnungstabelle im Code mit Seitenangabe des Belegs in einem Kommentar ohne Markennamen.
3. **microKORG-Besonderheiten** (A.11):
   - Layer → Dual. Die Stimmen-Teilung folgt der Zuweisung beider Timbres (HB-MK S. 16, Tabelle).
   - 8 Vocoder-Kanäle → 16 Bänder (Pegel und Pan doppelt).
   - Eingänge nach Funktion zugeordnet (mK IN 1 → E2, IN 2 → E1), Balance unverändert (A.11 Nr. 4).
   - Oktavlage n (−3…+3, im microKORG-Programm gespeichert, HB-MK S. 58) → `t[].trans` = clamp(trans + 12 · n, −24, +24) für beide Timbres. Wird geklemmt, steht ein Hinweis in der Vorschau-Liste. Steht das Feld nur im Formatbeleg, gilt es ab Tor (a).
   - FC-MOD-Quelle nach Namen abbilden: mK AMP EG → `msrc` 1, LFO 1 → 2, LFO 2 → 3, Velocity → 4, KBD Track → 5, Pitch Bend → 6, MOD.Wheel → 7 (Indexlage laut Beleg).
   - Step-Arp übernommen. Kein Mod-Seq (aus).
   - **MS2000:** MIDI 1/MIDI 2 werden als Werksbelegung (Bend/Mod-Rad) angenommen (A.5). Eine andere Global-Belegung am Gerät kennt der Import nicht.
4. **Vorschau-Liste:** Namen nur als Text (`textContent`), Mehrfachauswahl. [Übernehmen] → Bibliothek „Eigene“ mit 🔒 (`loc: 1`, `origin: 'imp-…'`). Ein Undo je Übernahme. Jede Kopie daraus bleibt 🔒 (EN3-08a).
5. **Nur lokal** (EN3-08):
   - `mkLocalStrip(project | sound[])` ist die einzige Ausgangs-Schleuse. Sie ersetzt jeden 🔒-Sound durch den Platzhalter `{engine: 'mk', p: INIT, locRef: <soundHash>, name: 'Importierter Klang'}`. Der echte Name bleibt nur in der lokalen Bibliothek.
   - Die Funktion läuft in **jedem** Weg nach EN3-08: Server-Autosave, `save_library`, Paar-Raum und Realtime, Mitmach-Link, Teilen, später die Pakete nach MK-R2 (EN3-19).
   - **„Gerät“ heißt Speicher-Ursprung** (Claude-App, Pages, githack-Spiegel; jeder hat eigenen Speicher). Die eigene Übergabe Claude-App → Safari (`#import` aus `cloudHandoffUrl`, Z. 28263) darf 🔒-Sounds tragen, weil das Fragment nie einen Server erreicht; Hinweis „Link nicht weitergeben“. Der Mitmach-Link und jeder Server-Weg strippen weiter.
   - Derselbe Ursprung stellt 🔒-Sounds per `locRef` aus der lokalen Bibliothek wieder her. Andere Ursprünge und Konten spielen INIT mit dem Hinweis „Klang nur dort, wo er importiert wurde“.
   - `normalizeSound` behält `loc` und `locRef` (Z. 7920–7928; `Library.save` Z. 8251 und `importMany` Z. 8266 laufen darüber). `saveSound` löscht sie nie.
   - Export als Projektdatei auf das eigene Gerät ist erlaubt.
6. **Kennzeichnung:** 🔒 in Bibliothek, Blattkopf und Spur. ⓘ „Importiert – bleibt auf diesem Gerät“.
7. **Testdaten:** nur aus einem eigenen Test-Schreiber (synthetische Dumps). Im Repo liegt keine .syx/.prg-Datei von Korg. Xanders Dateien bleiben bei ihm.

**Nicht-Umfang.** Export zum Gerät (.syx schreiben). Werksbänke einlesen und in die App aufnehmen (verboten, EN3-07). MIDI-Übertragung.

**Daten.** Sound-Felder `loc` und `locRef` (neutral). Kein Formatsprung.

**Berührungspunkte.**
- **Wiederverwendet:** `importSyx`-Dateiweg, Bibliothek, `normalizeSound`, SYNC-Postausgang (Strip davor), `cloudHandoffUrl`, Fake-Supabase-Testgerüst (`online.md` §7.7, `__synqFakeSupa`, WebSocket-Mitschnitt).
- **Neu:** Parser, Zuordnung (mit Oktavlage und FC-MOD-Namen), Strip-Funktion im immer geladenen Teil (EN3-14), Ansteck-Regel EN3-08a, Wiederherstellung über `locRef`.

**Dauer** 6–7 h (Rev. 1: +1 h; nicht in den Summen) · **Version** – (zurückgestellt; bei späterem Bau die nächste freie Nummer) · **Budget** +27 KB (nicht in den Summen) · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK9-01 Tor:** Das Protokoll MK9-T steht in CHANGES (Beleg mit Datum oder die 3 Dumps mit Werteblatt).
- [ ] **MK9-02 Rundweg:** Der Test-Schreiber erzeugt Dumps aus 200 Zufalls-`p.mk` (im Rahmen der Beleg-Felder). Der Import liefert sie deep-equal zurück.
- [ ] **MK9-03 Xanders Dumps** (nur wenn Tor (b) gilt oder Dumps vorliegen): Jedes notierte Feld der 3 Test-Programme stimmt. Das Protokoll steht in CHANGES. Sonst gelten MK9-02 und ein Rundweg über den eigenen Test-Schreiber.
- [ ] **MK9-04 Robust:**
  - 10 000 Zufallsdateien und abgeschnittene Dumps lösen keine Ausnahme aus und ergeben eine klare deutsche Meldung.
  - Dateien > 2 MB werden abgelehnt.
  - Namen erscheinen nur als Text, `innerHTML` wird nicht benutzt.
- [ ] **MK9-05 microKORG-Zuordnung:** Layer, 8 → 16 Kanäle, Eingänge und Step-Arp laut Umfang 3. Ein Prüf-Dump je Fall. Ein microKORG-Dump mit OSC1 Audio In C1 = 127 spielt nur E2, einer mit C1 = 0 nur E1. Je ein Prüf-Dump für Oktave +1, für Oktave +3 mit Transpose +12 (Klemme und Hinweis) und für FC-MOD-Quelle AMP EG (→ `msrc` 1).
- [ ] **MK9-06 Nie hochladen:**
  - Lauf mit Fake-Supabase: Projekt mit 🔒-Sound speichern, Bibliothek abgleichen, Paar-Raum öffnen, Mitmach-Link erzeugen.
  - Kein Request-Körper und kein gesendeter WebSocket-Frame enthält das Marker-Muster des 🔒-Sounds (seltene Feldwerte und Name). Die Platzhalter sind da und heißen „Importierter Klang“.
  - Während des Imports gibt es 0 Netzaufrufe.
- [ ] **MK9-07 Wiederherstellen** (je Speicher-Ursprung):
  - Gleicher Ursprung, Projekt aus der Cloud: Der 🔒-Sound ist deep-equal da.
  - Claude-App → Safari über die eigene `#import`-Übergabe: Der 🔒-Sound kommt mit.
  - Anderes Konto oder anderer Ursprung (Test-Profil): INIT mit Hinweis, Name „Importierter Klang“, keine Fehlermeldung, keine Konsolenfehler.
- [ ] **MK9-08 Kennzeichnung:** 🔒 und ⓘ an allen drei Orten.
- [ ] **MK9-09 Oberfläche:** Import-Blatt mit M-PLATZ in P1–P3, L1, L2, W. Listen-Zeilen ≥ 44 px.
- [ ] **MK9-10 Regression:** Der DX7-.syx-Import ist unverändert (V4c-Abnahmen). Budget ≤ +27 KB.
- [ ] **MK9-11 🔒 steckt an:** T1 und SEQ 1 eines 🔒-Sounds in einen offenen Sound kopieren, unter neuem Namen sichern, dann Autosave und Bibliotheks-Abgleich gegen Fake-Supabase: Kein Request-Körper und kein WebSocket-Frame enthält die Marker-Werte; der neue Sound trägt `loc: 1` und das `origin` der Quelle. Ebenso für A/B, Speichern als, Duplizieren und Laden in eine Spur. Speichern → Laden ergibt `loc` = 1 und `locRef` deep-equal.
- [ ] **MK9-12 Ohne AM geladen:** Bibliothek mit 🔒-Sound, Projekt ohne AM, `mkInfo().loaded === false`: `save_library` und Autosave tragen keinen Marker, und der Block `sq-mk-src` bleibt unausgewertet.

**Tests.** `mk9-parse.mjs`, `mk9-fuzz.mjs`, `mk9-lokal.mjs` (Fake-Supabase, WebSocket-Mitschnitt), `mk9-ui.mjs`.

**Fach-Prüfung:** **FP-SICHER ●** Haupt-, **FP-DSP** Zweit-Blick.

**iPhone:** eine eigene .syx- oder .prg-Datei aus „Dateien“ wählen, zwei Programme übernehmen und spielen. In einem zweiten Browser bzw. Konto prüfen: der Hinweis statt des Klangs.

**Geräte-Abgleich:** Ein importiertes Programm in der App gegen dasselbe am Gerät. Die Abweichungen sagen, welche W-Kurven nachzustellen sind (EN3-16).

**Risiken.** Ohne Beleg (a) ist die Zuordnung nur so gut wie die Test-Dumps. Die .prg-Form ist [U]. Zum Benutzen braucht Xander eine USB-MIDI-Verbindung und ein Editor- oder Librarian-Programm am Rechner (der microKORG hat nur 5-polige MIDI-Buchsen; iOS Safari hat kein Web MIDI), H-7.

---

### MK10 — Speicherwellen: Aufnahme in der App und Einbau — zurückgestellt

**Status (26.10., Xander): zurückgestellt.** Es gibt kein Gerät für die Aufnahmen, und der Bau ist der reine MS 2000. Die 64 in MK2 nachgezeichneten Wellen sind die eingebauten Speicherwellen (mit „≈“, EN3-09). MK10 steht außerhalb der Versionsfolge (E.1), wird nicht gebaut und hält nichts auf. Der Text bleibt als Vorlage stehen; die Aufnahme-Anleitung (Teil D) steht nur noch in der Sicherung `scratchpad/rev1-tools/n3-vor-pure.md.bak`. Wird MK10 später gebaut (nur auf Xanders Wunsch und mit Gerät), bekommt es die nächste freie Nummer, und Teil D wird vorher wieder eingesetzt und am Gerät geprüft.

**Ziel.** Die 64 nachgezeichneten Platzhalter aus MK2 werden durch Wellen ersetzt, die aus Xanders eigenen Aufnahmen am Gerät gewonnen sind (ein Gerät mit denselben Speicherwellen, MS2000 oder microKORG; nur als Quelle), und **in die App eingebaut**, sodass alle sie hören, auch Freunde im Paar-Raum (H-2, Xander 25.10.). Xander nimmt **am iPhone direkt in der App** auf (Gerät → AG06 → iPhone, Teil D), ohne Rechner und ohne Dateien hin- und herzuschieben (EN3-21). Damit klingt die Klangerzeugung „original“ (KF §3–4).

**Warum MK10 trotz der Nachzeichnung nötig bleibt** (Prot. 57): Die Nachzeichnung stammt aus Bildern einer fremden Aufnahme (eine Note, 10 ms). Erst Xanders Aufnahmen geben (1) den genauen Klang, weil die Bezugs-Säge die Aufnahmekette herausrechnet; (2) die oberen Teiltöne bis N = min(64, Nyquist/f₀) statt des geschätzten Abfalls über Teilton 32; (3) das Verhalten je Oktave statt einer einzigen Note; (4) die Pegel zwischen den Wellen statt Spitze 1 je Welle; (5) die Tonlage r von 3, 28, 34, 35 und 59 und eine echte Periode für 60.

**Zwei Bau-Abschnitte:**
- **Abschnitt 1:** Aufnahme-Seite, Ersatzweg über Dateien, Analyse, sofort hörbar auf Xanders Gerät, Wellen-Paket für den Bau. Kein Tor (H-2 ist entschieden).
- **Abschnitt 2 (Einbau):** Das Wellen-Paket wird ein Datenblock in der App. Version: die nächste freie Nummer in Bau-Reihenfolge (E.4; EN2-14). **Tor MK10-T:** Das Wellen-Paket aus Abschnitt 1 liegt am Bau-Ort, sein Güte-Bericht hat keine rote Zeile.

**Umfang Abschnitt 1.**
1. **Seite „Wellen aufnehmen“** (Menü → Sounds; Block `sq-mkrec-src`, EN3-14). Nur auf Pages in Safari: In der Claude-App gibt es kein Mikrofon (EN2-06); dort zeigt die Seite nur den Ersatzweg [Dateien laden] und den Hinweis „Aufnehmen geht in Safari“.
   - **Eingang:** über den gemeinsamen Mikrofon-Abgriff aus MK7, nur nach Tipp. Die Seite fordert `MIC_ASK` (Z. 29401: Echo-Unterdrückung, Rauschunterdrückung und AGC aus) plus `channelCount: 2` und die `deviceId` des USB-Geräts an, also `getUserMedia({audio: {deviceId, echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 2}})`; hält ein anderer Nutzer (🎤, Vocoder) den Abgriff mit anderen Vorgaben, wird er für die Seite neu geöffnet und danach wiederhergestellt. Der Abgriff reicht beide Kanäle getrennt weiter (kein Abmischen auf mono). Ist ein USB-Gerät angeschlossen, nimmt iOS es als Eingang; die Seite zeigt den Gerätenamen aus `enumerateDevices` (nach der Freigabe; das AG06 meldet sich als USB-Audiogerät) und die Werte aus `getSettings()`. Meldet `getSettings()` eine der drei Verarbeitungen als an, zeigt die Seite rot „Sprach-Filter aktiv – so nicht aufnehmen“ und nimmt nicht auf.
   - **Kanal:** Kommen 2 Kanäle, nimmt die Seite den Kanal mit Signal (AG06 mit TO PC = DRY CH 1-2: Kanal 1 links, Kanal 2 rechts); kommt 1 Kanal, diesen.
   - **Die Seite spielt nichts:** Solange sie offen ist, steht der Transport, alle Spuren schweigen, und am Ausgang hängt nur ein 0-Gain-Halter (kein Echo, keine Rückkopplung). Mithören geht über den Kopfhörer am AG06 (Teil D).
   - **Geführter Ablauf, 67 Schritte in fester Reihenfolge** (Liste in Teil D.3): Pegel-Test (C4, 2 s), Bezugs-Säge, Speicherwelle 1 … 64, Stille (10 s). Je Schritt zeigt die Seite in großer Schrift, was am Gerät einzustellen ist (z. B. „OSC1 WAVE: 6. Stellung (Speicherwellen)“, „OSC1 CONTROL 2 auf 12“, „OCTAVE −2“), und [● Aufnehmen] (≥ 88 × 44). Die Hinweise sind eigene Sätze ohne Marken- und Gerätenamen (B.6 Nr. 9 a/b): „am Gerät“ statt des Gerätenamens, die Wellen-Stellung von OSC1 WAVE als „6. Stellung (Speicherwellen)“, nie mit ihrem Namen am Gerät (Teil D.3 nennt ihn Xander). In den Wellen-Schritten (2–66) erkennt die Seite die 7 Töne selbst (Einsatz-Erkennung) und stoppt 1 s nach dem 7. Ton von selbst; der Pegel-Test braucht einen Ton, die Stille läuft 10 s nach Uhr ([■] jederzeit). Danach schneidet sie die Stille vorn und hinten ab, teilt in die Töne, analysiert sofort und zeigt ✓ oder den Grund („zu leise“, „übersteuert“, „nur 6 Töne erkannt“, „Ton zu kurz“) mit [Nochmal]. [Weiter] geht zum nächsten Schritt; die Schritt-Liste erlaubt jede Wiederholung.
   - **Pegel-Anzeige** live (Canvas 2D, ≤ 30 Hz): Spitze und RMS in dBFS, Zielbereich −12 … −6 dBFS grün, ab −1 dBFS rot.
   - **Fortschritt** bleibt in der Datenbank `synq-mkwaves` (Umfang 4): Xander kann aufhören und später weitermachen.
   - **Roh-Audio** liegt nur für den laufenden Schritt im Speicher (für [Nochmal]); nach ✓ bleibt nur das Analyse-Ergebnis. Nichts wird hochgeladen.
2. **Ersatzweg Dateien** (Teil D.4, GarageBand am iPhone): [Dateien laden] wählt WAV- oder AIFF-Dateien aus „Dateien“ (ohne `accept`-Attribut, wie Z. 26513) mit den Namen aus Teil D.4 (`ref-saege`, `sw-01` … `sw-64` oder die Sammel-Dateien `sw-01-08` … `sw-57-64`, `stille`; Endung .wav, .aif oder .aiff); bei falschem Namen ist die Zuordnung von Hand wählbar. Zuerst [Testdatei prüfen] mit `test` (Pegel, Stille, Kanal; klare Meldung). Fortschritt sichtbar, [Abbrechen].
3. **Analyse im Browser** (für beide Wege gleich), in Häppchen ≤ 8 ms bzw. im Worker, wenn vorhanden:
   - Sammel-Datei (8 Wellen, getrennt durch ≥ 3 s Stille): an der Stille teilen und nach Reihenfolge zuordnen.
   - Kanal: bei Stereo der lautere bzw. nicht stille Kanal.
   - Einsatz-Erkennung je Ton (dieselbe wie beim Zuschnitt auf der Aufnahme-Seite). Die Tonhöhe wird gemessen, nicht angenommen.
   - **Periode:** Gesucht wird die Wiederholung bis zu 2 Notenperioden, nicht nur die Notenperiode (in MK2 wiederholen sich 3, 34 und 35 erst nach 2, 28 und 59 nach 1,4983 Perioden). Das gemessene r geht ins Paket. Ohne klare Wiederholung (in MK2: 60) wird über die Notenperiode gemittelt, und der Bericht zeigt die Welle gelb.
   - Stabilen Abschnitt wählen (0,5–1,5 s nach dem Einsatz).
   - Periodensynchrone Mittelung über ≥ 0,5 s ergibt eine Periode.
   - DFT ergibt die Teiltöne 1…N (N = min(64, Nyquist/f₀)), Pegel und Phase.
   - **Korrektur** mit der Bezugs-Säge: H(f) = gemessene Säge / ideale 1/n, über Frequenz geglättet. Alle Wellen werden durch H geteilt.
   - **Pegel-Eichung:** Der RMS der Bezugs-Säge entspricht der AM-Säge bei Mixer 127.
   - Eine Tabelle je aufgenommener Oktave (C1…C7) als Oktav-Tabellen (B.6 Nr. 6). Fehlt eine Oktave, gilt die Nachbaroktave, mit Hinweis.
4. **Speicher:** eine **eigene IndexedDB-Datenbank `synq-mkwaves`** (Version 1), wie `synq-miccheck` (Z. 29790). Die Datenbank `synquenzer` bleibt unberührt und ohne Versionserhöhung: Ein neuer Store dort zwänge ältere Stände und offene Tabs in den localStorage-Rückfall bzw. `onversionchange` (Z. 8195–8198, 8222). MK10 ruft `navigator.storage.persist()` selbst auf und zeigt das Ergebnis. Die Wellen gehen nie in einen Upload, nie in Projekt, Sound oder Bibliothek. **Sofort hörbar:** Auf Xanders Gerät nimmt die Engine die eigenen Wellen statt der Platzhalter, das „≈“ verschwindet für diese Wellen; [Platzhalter benutzen] schaltet zurück. Bis zum Einbau hören andere Geräte die Platzhalter.
5. **Wellen-Paket für den Bau:** [Wellen an den Bau geben] baut `mkwaves-paket.json` (nur Analyse-Ergebnisse: Teiltonpegel und Phasen je Welle und Oktave, Güte, Datum, App-Version, Prüfsumme; **kein Roh-Audio**, ≤ 200 KB) und öffnet das iOS-Teilen-Blatt (`navigator.share({files})`; ohne Teilen-Blatt ein Download nach „Dateien“). Den Weg zum Bau klärt der Orchestrator, wenn MK10 gebaut wird (frühere Frage H-15). Kein Rechner nötig.
6. **Bericht** je Welle: Güte (Stabilität der Periode, Klirr der Mittelung, Clipping, Rauschabstand gegen die Stille-Aufnahme) und die Pegel-Abweichung von ihrem Platzhalter. Dazu die Abweichung von der Nachzeichnung (M-BAND, Teiltöne 1–16) und das gemessene r, gelb, wenn es vom MK2-Wert abweicht.

**Umfang Abschnitt 2 (Einbau).**
7. **Bau-Skript `mk10-einbau.mjs`** (Node) liest das Paket, prüft Prüfsumme, Vollständigkeit (Bezug und 64 Wellen, jede aufgenommene Oktave) und Güte und schreibt einen kompakten **Datenblock** (Teiltonpegel als Bytes je Oktave, Phasen als 6 Bit, Base64) in `sq-mk-src`, ≤ 45 KB. Der Datenblock der Nachzeichnung aus MK2 fällt dabei weg (≈ −8,6 KB, netto ≈ +36 KB). Gleiches Paket ergibt einen bitgleichen Block. Trifft der Block ein Markenwort, ändert das Skript das Salz-Byte (B.6 Nr. 9). Das Paket liegt privat am Bau-Ort (neben den Handbüchern), nie im Repo; Roh-Aufnahmen gibt es dort nicht.
8. **Alle hören die Wellen:** Die Engine nimmt die eingebauten Wellen statt der Platzhalter, auf jedem Gerät und im Paar-Raum; das „≈“ verschwindet überall (`mkInfo().waves === 'eingebaut'`). Eine spätere lokale Neu-Aufnahme bleibt auf Xanders Gerät eine Wahl [Eigene Aufnahme │ Eingebaut].
9. **Pegel:** MK8-04 läuft mit den eingebauten Wellen erneut; Ausreißer werden im Einbau-Schritt nachgestimmt.

**Nicht-Umfang.** Aufnahmen anderer Gerätewellen. Eich-Kurven für Filter und Hüllkurven (H-6 = nein). Ein eigener Upload-Weg der App für das Paket (die Übergabe läuft über das iOS-Teilen-Blatt). [Wellen exportieren]/[Wellen importieren] zwischen Speicher-Ursprüngen (Rev. 1; entfällt, weil die Wellen eingebaut werden).

**Berührungspunkte.**
- **Wiederverwendet:** gemeinsamer Mikrofon-Abgriff aus MK7 mit `MIC_ASK`, Oktav-Tabellen und Mipmaps (MK2, `mkTables`), Datei-Wahl, eigene IndexedDB-Datenbank nach dem Muster `synq-miccheck`, Fake-Supabase-Gerüst (`online.md` §7.7, `__synqFakeSupa`, WebSocket-Mitschnitt), Salz-Byte-Regel (MK8).
- **Neu:** Aufnahme-Seite mit geführtem Ablauf, Einsatz-Erkennung und Zuschnitt, Pegel-Anzeige, WAV-Lesen (PCM 16/24 Bit und 32-Bit-Float, 44,1/48 kHz, mono/stereo), AIFF-Lesen, Kanalwahl, Teilen an der Stille, Testdatei-Prüfung, Analyse, Datenbank `synq-mkwaves`, Wellen-Paket mit Teilen-Blatt, Einbau-Skript, Datenblock. V9d nutzt WAV-Leser und lokalen Speicher später mit (Teil G Nr. 12).

**Dauer** 10,5–12 h (Rev. 1: 6,5–7,5 h für Einlesen und Analyse; Rev. 2: +3–3,5 h Aufnahme-Seite, +1,5 h Einbau mit Pegel-Nachlauf, −0,5 h ohne Export/Import zwischen Ursprüngen) · **Version** beim Bau je Abschnitt die nächste freie Nummer (zurückgestellt) · **Budget** +80 KB (Abschnitt 1: +35 KB Code, Abschnitt 2: +45 KB Datenblock) · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK10-01 Tor (Abschnitt 2):** Prüfsumme, Datum und Güte-Bericht des Pakets stehen in CHANGES. Kein Paket und keine Aufnahme im Repo oder in der Auslieferung (Prüfung über die Dateiliste).
- [ ] **MK10-02 Nachbau:** Für jede eingelesene Welle und jede aufgenommene Oktave wird die Neu-Synthese (Speicherwelle, Filter offen) mit der Aufnahme verglichen:
  - M-BAND-Abstand ≤ 1,5 dB je relevantem Band.
  - Teiltöne 1–16 ≤ 2 dB, Median ≤ 1 dB.
- [ ] **MK10-03 Bezug:** Die Säge-Aufnahme liegt nach der Korrektur bei 1/n ± 0,5 dB (Teiltöne 1–20).
- [ ] **MK10-04 Zwischen den Oktaven:** Eine Tonleiter C2–C6 hat keinen Pegelsprung > 1,5 dB (M-PEGEL) und keinen M-SP-Sprung > ⅙ Okt.
- [ ] **MK10-05 Endlos:** Welle 35 erfüllt MK2-04 auch mit den Aufnahmen.
- [ ] **MK10-06 Lokal bis zum Einbau:** Beim Aufnehmen, Einlesen und Analysieren gibt es 0 Netzaufrufe. Inhalte von `synq-mkwaves` fehlen in jedem Upload (Fake-Supabase-Gerüst `online.md` §7.7 mit WebSocket-Mitschnitt). Vor dem Einbau hört ein anderer Speicher-Ursprung Platzhalter mit „≈“. Das Wellen-Paket enthält nur die Felder der Liste im Test, kein Roh-Audio, ≤ 200 KB.
- [ ] **MK10-07 Analyse-Zeit:** Ersatzweg: 66 Dateien à ≈ 25 s in ≤ 60 s (Xeon), keine `longtask` > 50 ms, Fortschritt sichtbar, abbrechbar ohne halbe Daten (atomar je Welle). Aufnahme-Seite: Analyse eines Schritts ≤ 1 s nach dem Stopp (Xeon; der iPhone-Wert steht in CHANGES).
- [ ] **MK10-08 Fehlerpfade:**
  - 44,1 kHz wird umgerechnet. Bei Stereo wird der lautere bzw. nicht stille Kanal genutzt (ein Kabel in Kanal 2 ergibt keine stille Welle).
  - 32-Bit-Float-WAV und AIFF werden gelesen. Andere Formate (z. B. M4A aus Sprachmemos oder AAC aus GarageBand) bekommen eine klare Meldung mit dem Export-Weg aus Teil D.4.
  - [Testdatei prüfen] meldet „zu leise“ (Spitze < −30 dBFS), „übersteuert“ (≥ −1 dBFS) und „stille Datei“.
  - Eine Sammel-Datei mit 8 Wellen wird richtig geteilt und zugeordnet.
  - Clipping wird erkannt („bitte neu aufnehmen“).
  - Eine fehlende Oktave nimmt den Nachbarn, mit Hinweis.
  - Falscher Dateiname: Die Zuordnung ist von Hand wählbar.
- [ ] **MK10-09 Oberfläche und Budget:** M-PLATZ der Aufnahme-Seite und des Datei-Blatts in P1–P3, L1, L2, W; Trefferflächen ≥ 44 × 44; die Geräte-Hinweise je Schritt sind ganz lesbar (scrollWidth ≤ clientWidth). Budget Abschnitt 1 ≤ +35 KB, Abschnitt 2 ≤ +45 KB.
- [ ] **MK10-10 Datenbank getrennt:** Nach dem Einlesen öffnet ein Tab des Vorgänger-Stands (der zuletzt ausgelieferte) Projekt und Bibliothek aus IndexedDB: kein localStorage-Rückfall, kein `versionchange`, alles intakt.
- [ ] **MK10-11 Pegel-Bericht:** Der Bericht zeigt je Welle die Pegel-Abweichung vom Platzhalter. Nach dem Einbau besteht MK8-04 mit den eingebauten Wellen.
- [ ] **MK10-12 Aufnahme-Seite** (Chromium mit Fake-Gerät: `--use-fake-device-for-media-stream --use-file-for-fake-audio-capture=` mit einer synthetischen Aufnahme):
  - `getUserMedia` erst nach Tipp; `getSettings()` meldet `echoCancellation`, `noiseSuppression` und `autoGainControl` = false. Ist eine an (Test-Stub), nimmt die Seite nicht auf und zeigt die rote Warnung.
  - Solange die Seite offen ist: Ausgang ≤ −120 dBFS, am Ausgang nur der 0-Gain-Halter, der Transport steht.
  - In jedem Wellen-Schritt (2–66) werden die 7 Töne erkannt (Zahl genau, Einsatz ± 10 ms); Auto-Stopp 1 s nach dem 7. Ton; nach dem Zuschnitt ≤ 50 ms Stille vorn und hinten. Pegel-Test mit einem Ton, Stille-Schritt 10 s ± 0,1 s.
  - Die Schritt-Hinweise enthalten 0 Markenwörter (B.6 Nr. 9 a/b; die Wellen-Stellung heißt „6. Stellung (Speicherwellen)“). Mit 2 Kanälen (Signal nur auf Kanal 1) nimmt die Seite Kanal 1, ohne Pegelverlust durch Abmischen.
  - Pegel-Anzeige ± 0,5 dB gegen das bekannte Signal; grün und rot nach den Grenzen.
  - Reihenfolge der 67 Schritte und die Geräte-Hinweise gleichen der Liste in Teil D.3; [Nochmal] ersetzt nur diesen Schritt.
  - Neuladen mitten im Ablauf: Fortschritt deep-equal, weiter beim nächsten offenen Schritt.
  - Test-Profil ohne Mikrofon (wie die Claude-App): `getUserMedia`-Zähler 0, nur der Ersatzweg sichtbar.
  - Dieselbe synthetische Aufnahme über [Dateien laden] ergibt dieselben Tabellen (Teiltonpegel max |Δ| ≤ 0,1 dB).
- [ ] **MK10-13 Wellen-Paket:** [Wellen an den Bau geben] ruft `navigator.share` mit genau einer Datei (Stub) bzw. lädt sie herunter; Inhalt nach Feldliste, Prüfsumme stimmt, kein Roh-Audio, ≤ 200 KB.
- [ ] **MK10-14 Einbau:** `mk10-einbau.mjs` ist deterministisch (gleiches Paket → bitgleicher Block), Block ≤ 45 KB, 0 Markenwörter (B.6 Nr. 9). Die eingebauten Wellen gleichen den lokalen (Teiltonpegel ± 0,5 dB nach der Byte-Kodierung, M-BAND ≤ 0,5 dB). Ein frischer Speicher-Ursprung (Test-Profil) und ein Paar-Raum-Partner hören die eingebauten Wellen ohne „≈“ (`mkInfo().waves === 'eingebaut'`). Sounds ohne Speicherwelle klingen bitgleich zum Vorgänger-Stand. Der Datenblock aus MK2 ist entfernt, r kommt aus dem Paket.

**Tests.** `mk10-analyse.mjs` (mit synthetischen „Aufnahmen“ aus bekannten Wellen, eigenem Filter-Abfall und Rauschen), `mk10-rec.mjs` (Chromium, Fake-Gerät), `mk10-lokal.mjs`, `mk10-einbau.mjs` (Bau-Skript und Prüfung), `mk10-ui.mjs`.

**Fach-Prüfung:** **FP-DSP** Haupt-, **FP-IPHONE** und **FP-SICHER** Zweit-Blick (Aufnahme-Weg am iPhone; nichts verlässt das Gerät außer dem Paket über das Teilen-Blatt).

**Zwischenstand** nach Abschnitt 1 (damit Xander aufnehmen kann) und nach dem Einbau (EN3-17).

**iPhone (Xander):**
1. Aufbau nach Teil D.1. In Safari: Menü → Sounds → **Wellen aufnehmen**. Zeigt die Seite das AG06 und keine rote Warnung?
2. Pegel-Test: C4 halten, am AG06 den Regler von Kanal 1 drehen, bis die Anzeige grün ist.
3. Die Schritte nacheinander aufnehmen (≈ 75 min, Pausen erlaubt). Bei ✗ einfach [Nochmal].
4. OSZ 1 → Speicherwelle in der App mit dem Gerät vergleichen, dann [Wellen an den Bau geben] und die Datei schicken.

**Geräte-Abgleich:** Einzelne Speicherwellen in der App gegen dieselbe Welle am Gerät (C2, C4, C6), sobald eines da ist.

**Risiken.** **Lizenz:** Die Wellen sind Daten aus Xanders Korg-Gerät; die Lizenz ist ungeklärt. Xander weiß das und hat „eingebaut“ gewählt (H-2). Dieselbe offene Lage gilt schon für die Nachzeichnung in MK2 (nur gerechnete Werte, keine Bilder). Ein Risiko entstünde vor allem, wenn die App verkauft würde; dann wäre der Einbau neu zu prüfen. Ob iOS Safari die Sprach-Verarbeitung bei einem USB-Gerät wirklich abschaltet, zeigt erst das Gerät (darum `getSettings()` und die rote Warnung). Ob sich die DWGS-Wellen je Oktave ändern, ist [U], deshalb mehrere Oktaven. Raumgeräusche fallen weg, weil die Line-Aufnahme Pflicht ist. Die Übergabe des Pakets braucht einen Weg vom iPhone zum Bau (frühere Frage H-15, beim Bau zu klären).

---

### MK-P — Bedienfeld wie der MS2000: Platte, Gesamtansicht, Zoom-Halte, Lauflicht

**Anlass** (Xander, 26.10.2026): Das MS 2000 in der App soll aussehen und sich bedienen lassen wie das echte Gerät: die hell blau-silberne Metallplatte und alle Elemente in derselben Anordnung von oben nach unten („dachte, das wäre von Anfang an klar“), nur der reine MS 2000, kein Hybrid. Dazu am iPhone 12 Pro Max quer der ganze Synthesizer auf einmal, direkt spielbar, mit einem Zoom auf Sektionen, der einrastet und bleibt, Navigation im Signalfluss wie bei Cubasis Micrologue, ein fester Rahmen ohne Layout-Sprung und das Lauflicht des Mod-Sequenzers auf den SELECT-Tasten. Vorlage ist **HB-MS S. 5 (PDF 11)**, die Strichzeichnung der Vorderseite des MS2000; S. 6–9 (PDF 12–15) erklären jedes Element. Die Lage-Tabelle unten ist aus dieser Zeichnung **vermessen**, nicht aus der Erinnerung genommen: Rahmenlinien per Linien-Suche, Element-Mitten über ein Prozent-Raster, Ausschnitt `scratchpad/ms2000-panel/ms2000-front.png`, Skripte `scratchpad/mkp-tools/lines.py` und `grid.py` (privat wie die Handbücher, E.5 Nr. 5). Die Zeichnung ist schwarz-weiß; Farben und Material sind deshalb eK. MK1–MK7 haben ein Bedienfeld nach einer anderen Vorlage gebaut; MK-P ersetzt es.

**Ziel.** Xander öffnet eine MS-2000-Spur und sieht die Vorderseite des MS2000: hell blau-silbernes, gebürstetes Metall, dieselben Sektionen in derselben Reihenfolge, jeder Regler und jede Taste an ihrem Platz, die 16 Regler über den 16 SELECT-Tasten und die weißen Vocoder-Namen auf Schwarz. Quer sieht er die ganze Platte auf einmal und spielt sie direkt; der Finger trifft das nächste Bedienelement. Ein Tipp auf eine Sektion zoomt weich hinein. Der Zoom rastet ein und bleibt, bis Xander oben die kleine Karte der ganzen Platte antippt. Mit ◀ ▶ oder Wischen geht er die Sektionen im Signalfluss durch. Hochkant sieht er eine Hälfte der Platte auf einmal. Gezoomt wird immer die echte Platte, nur innerhalb eines festen Rahmens; die Seite springt nie. Läuft der Mod-Sequenzer, leuchten die SELECT-Tasten nacheinander, und in SEQ EDIT setzen die 16 Regler die Schrittwerte. Zum Spielen mit der Tastatur gibt es die **Spiel-Ansicht**. Klang, Daten und Speicherformat bleiben unverändert; das Paket ändert nur die Oberfläche.

**Umfang.**

**1. Vorlage, Platte und Raster.**
- Die Platte ist das Rechteck innerhalb des äußeren Rahmens der Zeichnung, Seitenverhältnis **1,95 : 1** (1400 × 718 px in der Vorlage). Alle Lagen stehen in **% der Plattenbreite (x)** und **% der Plattenhöhe (y)**, Ursprung oben links, Werte = Mitte des Elements.
- **16-Spalten-Raster** [B, gemessen]: Die 16 Regler der unteren Reihe, die 16 Schritt-Tasten und fast alle Elemente darüber stehen auf denselben Spalten **xₙ = 14,1 + (n − 1) · 5,52** (n = 1…16; Abweichung ≤ 0,3). Beispiele: CONTROL 1 = Spalte 1, SEMITONE = 3, MIXER = 5, CUTOFF = 6, RESONANCE = 7, AMP = 8, TEMPO = 9, GATE = 10, VIRTUAL-PATCH-Tasten = 13–15. Die Sektionsgrenzen liegen zwischen zwei Spalten. Links davor liegt die **Randspalte** x 0,5–11,1 (AUDIO IN, POWER/VOLUME, OCTAVE, SEQ EDIT, BANK).
- Zwischen zwei Spalten stehen: WAVE (OSZ 1), TIMBRE SELECT, MOD SEQUENCE ON/OFF und REC, der PORTAMENTO-Regler und MOD/DELAY. Die Viererreihen im Arpeggiator und im Anzeige-Feld und die Paare OCTAVE und BANK haben ihr eigenes Raster mit 4,3 % Abstand (die Zeichnung streut 4,2–4,4 %; gebaut wird genau der Tabellenwert, nicht enger). Das ist der kleinste Abstand zwischen zwei Bedienelementen auf der Platte; er bestimmt die kleinsten Trefferzonen („Treffer“, Tabelle „Formate“).
- Die Kreisziffern ①–⑳ der Zeichnung, ihre Hinweislinien und die Klammer unter den Schritt-Tasten sind Handbuch-Hinweise und werden nicht gebaut; der Bildvergleich (MK-P-02) wertet sie nicht.
- **Aufdruck wie am Gerät** (H-16, entschieden 26.10.): englische Großbuchstaben in der App-Schrift, genau wie gedruckt (CUTOFF, RESONANCE, EG 1 INT, KBD TRACK …), darunter die weißen Vocoder-Namen auf schwarzem Feld, genau dort, wo die Zeichnung sie zeigt. Zwei Aufdrucke verbietet die Marken-Regel (EN3-05): **VOX WAVE → STIMMWELLE**, **DWGS → SPEICHERWELLE**. Die Marke wird nicht nachgebildet: Im Namensfeld steht nur `MK_LABEL`. Was außerhalb der Platte liegt (Kopfzeile, Reiter, LCD-Zeile des Blattrahmens, Listen, Hilfe), bleibt deutsch (L5); die Anzeige der Platte zeigt deutsche Klartexte mit den Seitennummern und Seitennamen des Geräts (Umfang 4).

**2. Lage-Tabelle: Sektionen** (Rahmen x von–bis · y von–bis; Titel = Mitte des Sektionsnamens über dem Rahmen).

| Zeile | Sektion | Titel x / y | Rahmen x | Rahmen y | Inhalt (oben → unten) |
|---|---|---|---|---|---|
| A | AUDIO IN | 5,8 / 1,8 | 0,5–11,1 | 3,3–18,5 | 2 LEDs, 2 Regler |
| A | POWER/VOLUME | 5,8 / 20,3 | 0,5–11,1 | 22,0–32,9 | 1 Regler mit Skala |
| A | Legende „■ : VOCODER PARAMETER“ | – | 0,5–11,0 | 48,3 (Zeile) | Aufdruck |
| A | OSCILLATOR 1 | 16,9 / 1,8 | 11,6–22,1 | 3,3–50,0 | 8 Wellen-LEDs, WAVE, CONTROL 1/2 |
| A | OSCILLATOR 2 | 27,8 / 1,8 | 22,6–33,1 | 3,3–50,0 | 3 Wellen-LEDs, RING/SYNC, WAVE, OSC MOD, „OSC 2 PITCH“, SEMITONE, TUNE |
| A | MIXER | 36,2 / 1,8 | 33,6–38,7 | 3,3–50,0 | OSC 1, OSC 2, NOISE |
| A | FILTER | 44,5 / 1,8 | 39,1–49,8 | 3,3–50,0 | CUTOFF, RESONANCE, EG 1 INT, KBD TRACK, FILTER TYPE + 4 LEDs |
| A–B | AMP | 52,8 / 1,8 | 50,2–55,3 | 3,3–66,6 | LEVEL, PAN, EG 2/GATE, DISTORTION |
| A | Namensfeld (am Gerät die Marke) | – | 55,8–67,0 | 3,4–14,0, kein Rahmen | nur `MK_LABEL` |
| A | ORIGINAL VALUE | Aufdruck im Kasten 75,6 / 10,2 | 73,8–77,4 | 7,8–14,8 | 1 LED |
| A | ARPEGGIATOR | 66,4 / 17,4 | 55,8–77,4 | 19,1–45,5 | TEMPO-Kasten 55,8–60,8 · 19,1–34,3; Listen-Kasten 67,4–75,9 · 25,9–36,9 (Trennstrich x 71,6); 4 Tasten |
| A | Anzeige-Feld | – | 77,9–99,4 | 1,0–45,5 | LCD 80,9–96,4 · 7,2–15,7; 10 Tasten in 3 Reihen |
| B | OCTAVE | 5,8 / 51,7 | 0,5–11,1 | 53,3–66,6 | DOWN, UP |
| B | TIMBRE SELECT | 16,9 / 51,7 | 11,6–22,1 | 53,3–66,6 | SELECT, LEDs 1, 2 |
| B | MOD SEQUENCE | 30,6 / 51,7 | 22,6–38,7 | 53,3–66,6 | ON/OFF, REC |
| B | PORTAMENTO | 44,5 / 51,7 | 39,1–49,8 | 53,3–66,6 | TIME |
| B–C | LFO 1 | 58,3 / 47,3 | 55,8–60,8 | 48,9–77,3 | 4 LEDs, SELECT, FREQUENCY (Regler 9) |
| B–C | LFO 2 | 63,8 / 47,3 | 61,3–66,3 | 48,9–77,3 | 4 LEDs, SELECT, FREQUENCY (Regler 10) |
| B–C | EFFECTS | 72,1 / 47,3 | 66,8–77,4 | 48,9–77,3 | LED-Legende, MOD/DELAY, Regler 11, 12 |
| B–C | VIRTUAL PATCH | 88,6 / 47,3 | 77,9–99,5 | 48,9–77,3 | Quellen-Kasten 78,1–88,4 · 49,3–61,1 (Fuß 83,4–88,4 bis 68,9), Ziel-Kasten 89,0–99,3 · 49,3–61,1 (Fuß 89,0–93,9 bis 68,9), 3 Tasten, 4 PATCH-LEDs, Regler 13–16 |
| C | SEQ EDIT / CH PARAM (CH PARAM invers) | 5,8 / 68,5 | 0,5–11,1 | 70,1–82,7 | SELECT, LEDs SEQ 1–3 |
| C | EG 1 (FILTER) | 22,4 / 68,5 | 11,6–32,4 | 70,1–77,7 | Regler 1–4 |
| C | EG 2 (AMP) | 44,5 / 68,5 | 34,9–55,3 | 70,1–77,7 | Regler 5–8 |
| C | Reglerleiste | – | 0,5–99,5 | Unterkante 82,7 | die Rahmen darüber enden in Höhe der Reglermitten (77,3–77,7) |
| D | BANK | 5,8 / 84,7 | 0,5–11,1 | 86,2–99,0 | DOWN, UP |
| D | Schritt-Tasten 1–16 | Nummern y 84,7 | 12,2–98,9 | Tasten 87,5–94,6 | 16 Tasten mit LED, zwei Aufdruck-Zeilen |
| – | PITCH- und MOD-Rad | – | links der Tastatur | – | HB-MS S. 9; in der App in `#kbArea` (MK1) |

Reihenfolge links → rechts, wie sie M-VORLAGE prüft: **Zeile A** AUDIO IN/POWER/VOLUME │ OSCILLATOR 1 │ OSCILLATOR 2 │ MIXER │ FILTER │ AMP │ Namensfeld über ARPEGGIATOR, ORIGINAL VALUE rechts im Namensband │ Anzeige-Feld. **Zeile B** OCTAVE │ TIMBRE SELECT │ MOD SEQUENCE │ PORTAMENTO │ (AMP: DISTORTION) │ LFO 1 │ LFO 2 │ EFFECTS │ VIRTUAL PATCH. **Zeile C** SEQ EDIT │ Regler 1–16. **Zeile D** BANK │ Schritt-Tasten 1–16.

**3. Lage-Tabelle: Elemente und Belegung.** `t.T.` = gewähltes Timbre (TIMBRE SELECT: T1 oder T2, MK3). Vocoder-Pfade gelten bei `mode` 3 (MK7); „grau“ = im Vocoder ohne Wirkung, bedienbar mit Grund in der LCD-Zeile (L2). Aufdruck „oben │ invers“. Alle Pfade gibt es schon (Paket in der letzten Spalte), außer den zwei Eingangs-Pegeln, die MK-P als Live-Wert hinzufügt.

| ID | Element | Art | x | y | Aufdruck | Synth | Vocoder | ab |
|---|---|---|---|---|---|---|---|---|
| `ain.l` | 2 Eingangs-LEDs | LED | 3,0 · 8,6 | 6,1 | – | Signal an E1 bzw. E2, rot ab −1 dBFS | gleich | MK7 |
| `ain.1` | Regler 1 (ohne Skala wie in der Zeichnung) | Regler | 3,0 | 12,9 | 1 / │ INST | **E1-Pegel** (Live-Wert, siehe Daten) | gleich | MK-P |
| `ain.2` | Regler 2 | Regler | 8,6 | 12,9 | 2 / │ VOICE | **E2-Pegel** (Live-Wert) | gleich | MK-P |
| `vol` | POWER/VOLUME | Regler, Skala | 5,8 | 28,4 | Skala 1…10; „0“ an der Stelle von POWER OFF | Spur-Lautstärke (derselbe Wert wie FX → SPUR, Vol) | gleich | MK1 |
| `o1.led` | 8 Wellen-LEDs mit Wellensymbol | LED | links 12,5, rechts 18,0 | je 11,7 · 14,1 · 16,6 · 19,1 | links Säge, Puls „PWM“, Dreieck, Sinus „CROSS“; rechts STIMMWELLE, SPEICHERWELLE, NOISE, AUDIO IN | `t.T.o1.w` 0…7 | Trägerwelle, gleich | MK1/2/7 |
| `o1.wave` | WAVE | Taste | 16,9 | 28,9 | WAVE │ WAVE | Welle +1 im Kreis 0…7 | gleich | MK1 |
| `o1.c1` | CONTROL 1 | Regler | 14,1 | 44,0 | CONTROL 1 │ CONTROL 1 | `o1.c1` | gleich | MK1 |
| `o1.c2` | CONTROL 2 | Regler | 19,6 | 44,0 | CONTROL 2 │ CONTROL 2 | `o1.c2` (Speicherwelle: Welle 1…64, gerundet, B.3 Listen > 12) | gleich | MK1 |
| `o2.led` | 3 Wellen-LEDs | LED | 23,5 | 11,7 · 14,1 · 16,6 | Säge, Rechteck, Dreieck | `o2.w` | dunkel | MK1 |
| `o2.ms` | RING, SYNC | LED | 29,0 | 11,7 · 14,1 | RING, SYNC | `o2.mod`: aus = beide dunkel, Ring+Sync = beide | dunkel | MK1 |
| `o2.wave` | WAVE | Taste | 25,1 | 28,9 | WAVE | `o2.w` +1 im Kreis | grau | MK1 |
| `o2.mod` | OSC MOD | Taste | 30,6 | 28,9 | OSC MOD | `o2.mod` +1 im Kreis | grau | MK1 |
| – | „OSC 2 PITCH“ | Aufdruck | 27,8 | 36,1 | – | – | – | – |
| `o2.semi` | SEMITONE | Regler, Mittelmarke | 25,1 | 44,0 | SEMITONE │ HPF LEVEL | `o2.semi` | `voc.hpl` | MK1/7 |
| `o2.tune` | TUNE | Regler, Mittelmarke | 30,6 | 44,0 | TUNE │ THRESHOLD | `o2.tune` | `voc.th` | MK1/7 |
| `mix.o1` | OSC 1 | Regler | 36,2 | 12,9 | OSC 1 │ OSC 1 | `mix.o1` | `t.0.mix.o1` | MK1 |
| `mix.o2` | OSC 2 | Regler | 36,2 | 28,4 | OSC 2 │ INST | `mix.o2` | `voc.ins` | MK1/7 |
| `mix.n` | NOISE | Regler | 36,2 | 44,0 | NOISE │ NOISE | `mix.n` | `t.0.mix.n` | MK1 |
| `f.cut` | CUTOFF | Regler | 41,7 | 12,9 | CUTOFF │ CUTOFF | `f.cut` | `voc.cut` | MK1/7 |
| `f.res` | RESONANCE | Regler | 47,3 | 12,9 | RESONANCE │ RESONANCE | `f.res` | `voc.res` | MK1/7 |
| `f.eg` | EG 1 INT | Regler, Mittelmarke | 41,7 | 28,4 | EG 1 INT │ FC MOD INT | `f.eg` | `voc.mint` | MK1/7 |
| `f.kbd` | KBD TRACK | Regler, Mittelmarke | 47,3 | 28,4 | KBD TRACK │ E.F.SENSE; rechts darunter │HOLD│ bei 48,2 / 32,3 | `f.kbd` | `voc.efs` (127 = HALTEN, friert `voc.hold` ein wie MK7) | MK1/7 |
| `f.type` | FILTER TYPE | Taste | 41,7 | 44,4 | FILTER TYPE │ FORMANT SHIFT | `f.type` +1 im Kreis | `voc.fs` 0 → +1 → +2 → −1 → −2 → 0 | MK1/7 |
| `f.led` | 4 LEDs | LED | 45,6 | 36,2 · 38,6 · 41,1 · 43,6 | 24LPF │+1│, 12LPF │+2│, 12BPF │−1│, 12HPF │−2│ (invers bei x 49,0) | Typ 0…3 | Formant +1, +2, −1, −2; 0 = alle dunkel | MK1/7 |
| `a.lvl` | LEVEL | Regler | 52,8 | 12,9 | LEVEL │ LEVEL | `a.lvl` | `voc.lvl` | MK1/7 |
| `a.pan` | PAN | Regler, Mittelmarke | 52,8 | 28,4 | PAN │ DIRECT LEVEL | `a.pan` | `voc.dir` | MK1/7 |
| `a.gate` | EG 2/GATE mit LED; Legende ○ 51,7 / ☀ 53,7 bei y 39,3 | Taste | 52,8 | 44,6 | EG 2 / GATE | `a.gate` (LED aus = EG 2, an = Gate) | grau | MK1 |
| `a.dist` | DISTORTION mit LED | Taste | 52,8 | 61,4 | DISTORTION │ DISTORTION | `a.dist` | `voc.dist` | MK1/7 |
| `name` | Namensfeld | Text | ab 56,4 linksbündig | 8,5 | `MK_LABEL` | – | – | MK-P |
| `orig` | ORIGINAL VALUE | LED | 75,6 | 13,2 | ORIGINAL VALUE | leuchtet, wenn der zuletzt bewegte Regler den gespeicherten Wert erreicht (in SEQ EDIT den gespeicherten Schrittwert, HB-MS S. 16) | gleich | MK1 |
| `arp.led` | TEMPO-LED | LED | 58,3 | 21,7 | – | blinkt in Vierteln des Song-Tempos | gleich | MK5 |
| `arp.tempo` | TEMPO | Regler | 58,3 | 28,6 | TEMPO | Song-Tempo `S.bpm` (EN3-10, wie bisher ARP A TEMPO) | gleich | MK5 |
| `arp.gate` | GATE | Regler | 63,8 | 28,6 | GATE | `arp.gate` | gleich | MK5 |
| – | Listen-Kasten | Aufdruck | 67,4–75,9 | 25,9–36,9 | 1 OCTAVE … 4 OCTAVE │ UP, DOWN, ALT 1, ALT 2, RANDOM, TRIGGER | – | – | – |
| `arp.on` | ON/OFF mit LED | Taste | 60,8 | 42,2 | ON / OFF | `arp.on` | gleich | MK5 |
| `arp.latch` | LATCH mit LED | Taste | 65,1 | 42,2 | LATCH | `arp.latch` | gleich | MK5 |
| `arp.range` | RANGE | Taste | 69,4 | 42,2 | RANGE | `arp.range` 1 → 2 → 3 → 4 → 1, LCD zeigt den Wert (HB-MS S. 15) | gleich | MK5 |
| `arp.type` | TYPE | Taste | 73,8 | 42,2 | TYPE | `arp.type` +1 im Kreis | gleich | MK5 |
| `lcd` | Anzeige 2 × 16 Zeichen | LCD | 80,9–96,4 | 7,2–15,7 | – | Umfang 4 | gleich | MK-P |
| `cur.l`, `cur.r` | CURSOR ◀ ▶ | Taste | 82,1 · 86,4 | 24,5 | CURSOR ◀ ▶ | Wert auf der Seite wählen | gleich | MK-P |
| `no`, `yes` | −/NO, +/YES | Taste | 90,7 · 95,0 | 24,5 | – / NO, + / YES | SPIEL: Programm −1/+1 (ab MK8); EDIT/GLOBAL: Wert −1/+1 | gleich | MK-P |
| `pg.m`, `pg.p` | PAGE −, + | Taste | 82,1 · 86,4 | 33,3 | PAGE – + | Seite zurück/vor | gleich | MK-P |
| `write` | WRITE | Taste | 95,0 | 33,3 | WRITE | Sichern (vorhandener Weg) | gleich | MK1 |
| – | Klammer COMPARE, „DEMO“ | Aufdruck | 82,3–95,0 | 37,0 · 40,1 | – | – | – | – |
| `edit` | EDIT | Taste | 82,1 | 42,2 | EDIT | EDIT-Modus | gleich | MK-P |
| `global` | GLOBAL | Taste | 86,4 | 42,2 | GLOBAL | GLOBAL-Seiten | gleich | MK-P |
| `exit` | EXIT | Taste | 95,0 | 42,2 | EXIT | zurück zu SPIEL; bei gehaltenem EDIT: COMPARE | gleich | MK-P |
| `oct.d`, `oct.u` | OCTAVE DOWN, UP mit LED | Taste | 3,6 · 7,9 | 61,4 | DOWN, UP | `tr.kbOct` −1/+1; LED grün = ±1, rot = ±2 (HB-MS S. 13), rot blinkend = ±3 | gleich | MK1 |
| `tim` | TIMBRE SELECT | Taste | 16,8 | 61,4 | SELECT ─ (Linie zur LED 1) | T1 ↔ T2 wie am Gerät (HB-MS S. 7, S. 19; bei Single gesperrt mit Grund; Edit Sync nach H-18) | grau | MK3 |
| `tim.led` | LEDs 1, 2 | LED | 20,4 | 57,9 · 60,4 | 1, 2 | gewähltes Timbre | dunkel | MK3 |
| `seq.on` | MOD SEQUENCE ON/OFF mit LED | Taste | 27,9 | 61,4 | ON / OFF | `t.T.seq.on` | grau | MK6 |
| `seq.rec` | REC mit LED | Taste | 33,4 | 61,4 | REC | Bewegung aufnehmen (MK6): blinkt = bereit, an = nimmt auf | grau | MK6 |
| `porta` | TIME | Regler | 44,5 | 61,0 | TIME │ TIME | `porta` | `t.0.porta` | MK1 |
| `l1.led` | 4 LEDs | LED | 56,7 | 51,6 · 54,0 · 56,5 · 58,9 | Säge, Rechteck, Dreieck, S / H | `l1.w` | gleich | MK1 |
| `l1.sel` | SELECT | Taste | 58,3 | 66,1 | SELECT │ SELECT | `l1.w` +1 im Kreis | gleich | MK1 |
| `l2.led` | 4 LEDs | LED | 62,2 | wie LFO 1 | Säge, Rechteck(+), Sinus, S / H | `l2.w` | gleich | MK1 |
| `l2.sel` | SELECT | Taste | 63,8 | 66,1 | SELECT │ SELECT | `l2.w` +1 im Kreis | gleich | MK1 |
| `fx.sel` | MOD/DELAY mit LED; Legende ○ 70,8 / ☀ 73,2 bei y 59,1 | Taste | 72,1 | 66,1 | MOD / DELAY │ MOD / DELAY | wählt, was Regler 11 und 12 bearbeiten: LED aus = Mod-FX, an = Delay (Ansicht, HB-MS S. 7) | gleich | MK4 |
| `vp.src` | 8 Quellen-LEDs | LED | 78,8 · 84,3 | je 51,6 · 54,0 · 56,5 · 58,9 | EG 1, EG 2, LFO 1, LFO 2 │ VELOCITY, KBD TRACK, MIDI 1, MIDI 2 | `p[P].s` des gewählten Patch P | `voc.msrc` | MK2/7 |
| `vp.dst` | 8 Ziel-LEDs | LED | 89,8 · 95,4 | wie Quellen | PITCH, OSC 2 PITCH, OSC 1 CTRL 1, NOISE LEVEL │ CUTOFF, AMP, PAN, LFO 2 FREQ | `p[P].d` | dunkel | MK2 |
| – | Pfeil ▷ | Aufdruck | 88,6 | 57,7 | – | – | – | – |
| `vp.sel` | SELECT | Taste | 80,4 | 66,1 | SELECT (Strich zur PATCH-1-LED) | P = 1 → 2 → 3 → 4 → 1 (Ansicht) | grau | MK2 |
| `vp.s` | SOURCE | Taste | 85,9 | 66,1 | SOURCE │ FC MOD SOURCE | `p[P].s` +1 im Kreis 0…7 | `voc.msrc` +1 | MK2/7 |
| `vp.d` | DESTINATION | Taste | 91,5 | 66,1 | DESTINATION | `p[P].d` +1 im Kreis 0…7 | grau | MK2 |
| `vp.led` | PATCH-LEDs 1–4, durch eine Linie verbunden | LED | 80,4 · 85,9 · 91,5 · 97,0 | 71,4 | – | gewählter Patch P | dunkel | MK2 |
| `sq.sel` | SEQ EDIT / CH PARAM: SELECT | Taste | 3,6 | 76,9 | SELECT │ SELECT | aus → SEQ 1 → SEQ 2 → SEQ 3 → aus (Ansicht; LCD „SEQ1:Cutoff“, HB-MS S. 16) | aus → LEVEL → PAN → aus | MK6/7 |
| `sq.led` | 3 LEDs mit Klammer | LED | 7,1 | 74,4 · 77,0 · 79,4 | SEQ 1 │LEVEL│, SEQ 2 │PAN│, SEQ 3 | gewählte Sequenz | LEVEL, PAN | MK6/7 |
| `k1`…`k16` | 16 Regler | Regler | xₙ | 77,7 | Tabelle unten | | | |
| `bank.d`, `bank.u` | BANK DOWN, UP | Taste | 3,6 · 7,9 | 92,3 | DOWN, UP | Bank A…H (MK8; vorher dunkel) | gleich | MK8 |
| `s1`…`s16` | 16 Schritt-Tasten mit LED | Taste | xₙ | 91,0; Nummer 84,7; Aufdruck 96,5 │ 98,7 | Liste unten | SPIEL: Programm n der Bank (MK8); EDIT: Seite n; Lauflicht bei laufender Sequenz (Umfang 4a) | gleich | MK-P |

**Die 16 Regler** (y 77,7; Aufdruck darüber bei 71,5 │ 73,3, bei PATCH 1–4 nur eine Zeile bei 73,5 unter den PATCH-LEDs). Wie am Gerät (HB-MS S. 16): Ist mit SEQ EDIT eine Sequenz gewählt (LED SEQ 1, 2 oder 3), bearbeitet Regler n den Schritt n dieser Sequenz `t.T.seq.q[s].v[n−1]` (Bereich nach Ziel, A.6), in jeder Ansicht. Die Kappen zeigen dann die Schrittwerte, die ORIGINAL-VALUE-LED leuchtet, wenn ein Regler den gespeicherten Schrittwert erreicht, und die Anzeige nennt Sequenz, Schritt und Wert („SEQ1 S05 +12“). Sind alle SEQ-LEDs dunkel, bearbeiten die Regler wieder ihre aufgedruckten Werte. Bei CH PARAM (Vocoder) bearbeitet Regler n Kanal n mit `voc.chl[n−1]` bzw. `voc.chp[n−1]` (HB-MS S. 8). Der Aufdruck bleibt dabei stehen.

| n | x | Aufdruck | Synth | Vocoder |
|---|---|---|---|---|
| 1–4 | 14,1 · 19,6 · 25,1 · 30,6 | ATTACK · DECAY · SUSTAIN · RELEASE (EG 1), oben wie invers | `e1.a` · `e1.d` · `e1.s` · `e1.r` | gleich |
| 5–8 | 36,2 · 41,7 · 47,3 · 52,8 | ATTACK · DECAY · SUSTAIN · RELEASE (EG 2) | `e2.a` · `e2.d` · `e2.s` · `e2.r` | gleich |
| 9, 10 | 58,3 · 63,8 | FREQUENCY │ FREQUENCY (LFO 1, LFO 2) | `l1.f` bzw. `l1.note` bei TEMPO SYNC; `l2.f`/`l2.note` | gleich |
| 11 | 69,4 | SPEED / TIME │ SPEED / TIME | Mod-FX `mfx.spd` bzw. Delay `dly.time`/`dly.note` (nach MOD/DELAY) | gleich |
| 12 | 74,9 | DEPTH / FEEDBACK │ DEPTH / FEEDBACK | `mfx.dep` bzw. `dly.dep` | gleich |
| 13–16 | 80,4 · 85,9 · 91,5 · 97,0 | PATCH 1 … PATCH 4 (nur oben) | `p[0…3].i` | grau |

**Schritt-Tasten** (oben │ invers): 1 COMMON │ COMMON · 2 VOICE │ VOICE · 3 PITCH │ PITCH · 4 OSC 1 │ OSC 1 · 5 OSC 2 │ AUDIO IN 2 · 6 FILTER │ FILTER · 7 AMP │ AMP · 8 EG │ EG · 9 LFO │ LFO · 10 PATCH │ CH LEVEL · 11 SEQ │ CH PAN · 12 MOD FX │ MOD FX · 13 DELAY FX │ DELAY FX · 14 EQ │ EQ · 15 ARPEGGIO │ ARPEGGIO · 16 UTILITY │ UTILITY. Programm-Wahl ab MK8: BANK ▼ ▲ wählt A…H, SELECT n lädt Programm n der Bank (A01 … H16). Lauflicht: Umfang 4a.

**Räder:** PITCH (links) und MOD links der Tastatur in `#kbArea`, Funktion unverändert (MK1, W-17, W-18). Mulde und Rahmen bekommen den Metallton statt Holz, Aufschrift PITCH und MOD (HB-MS S. 9). Quer liegen sie mit der Tastatur im Reiter SPIEL („Ansichten“).

**4. Anzeige, Modi und Seiten** (wie HB-MS S. 2, S. 13, S. 18–19; Modi, Seite, Cursor und Auswahl sind Ansichtszustand, nicht Teil des Sounds).
- **SPIEL** (am Gerät Program Play): Zeile 1 „A01:Name“ (Bank A…H, Nummer 01…16, die ersten 12 Zeichen des Namens; ohne Programmplatz „---:Name“). Zeile 2 Modus (EINZELN, DUAL, SPLIT, VOCODER) und rechts „♩=120“ (Song-Tempo). Ist T2 gewählt, steht „T2“ in Zeile 2; ist eine Sequenz gewählt, steht dort „SEQ1:Cutoff“. Beim Drehen zeigt Zeile 2 eine Sekunde lang Name und Geräte-Wert („CUTOFF      064“). Die LCD-Zeile des Blattrahmens zeigt weiter den Klartext mit Einheit (B.3 Rahmen).
- **EDIT** (Taste EDIT; am Gerät LCD Edit):
  - Zeile 1 zeigt Seitennummer und -name („08A FILTER“), Zeile 2 Name und Wert; der Cursor blinkt am Wert.
  - Schritt-Taste n springt auf die Seite aus dem Seitenplan, ihre LED leuchtet. PAGE −/+ blättert durch alle Seiten, auch durch die ohne eigene Taste. CURSOR ◀ ▶ wählt den Wert auf der Seite, −/NO und +/YES ändern ihn um eine Stufe.
  - Die Regler der Platte wirken weiter, und die Anzeige springt zu ihrem Wert (am Gerät „Page Jump“, Vorgabe an).
  - Ein Tipp auf die Anzeige (Trefferfläche = LCD) öffnet die Auswahl-Liste des Werts unter dem Cursor (`openPop`, Zeilen ≥ 44 px). Trägt Zeile 2 „▸“, öffnet er die Zusatz-Ansicht (SCHRITTE, 16 BÄNDER, EIGENE; B.3).
  - EXIT führt zurück zu SPIEL.
- **GLOBAL** (Taste GLOBAL): Spur-Einstellungen, die nicht zum Sound gehören. 1A EINGANG 1 ▾ und 1B EINGANG 2 ▾ (`tr.mkIn` mit „Quelle nur als Eingang“, MK7), 1C OKTAVE (`tr.kbOct`), 1D SEITEN-SPRUNG an/aus. EXIT führt zurück zu SPIEL.
- **COMPARE:** EDIT halten und EXIT tippen (zwei Finger, HB-MS S. 19). Das schaltet zwischen bearbeitetem und gespeichertem Stand wie der vorhandene A/B-Weg im Blattkopf; Zeile 2 zeigt „== COMPARE ==“, EXIT beendet. Es gibt keinen Lang-Druck (L4).
- **Seitenplan** (Nummern und Reihenfolge wie am Gerät, HB-MS S. 18, S. 34–52; App-Zusätze mit Paket; die Seiten ohne eigene Taste erreicht man mit PAGE):

| Taste | Synth-Seite: Werte | Vocoder-Seite: Werte |
|---|---|---|
| 1 | 01 COMMON: MODUS `mode`; bei Dual/Split STIMMEN `tv`, SPLIT `split`; STIMMUNG `scale`, GRUNDTON `skey`, EIGENE ▸ (`usc`, MK3) | 01 COMMON: MODUS, STIMMUNG, GRUNDTON |
| – | 02 NAME: Name (vorhandenes Umbenennen) | 02 NAME |
| 2 | 03 VOICE: ZUWEISUNG `asg`, PRIORITÄT `prio`, AUSLÖSUNG `trig`, UNI-VERST. `udet` | 03 VOICE |
| 3 | 04 PITCH: TRANSP. `trans`, FEIN `tune`, BEND `bend`, VIBRATO `vib`, PORTAM. `porta`, MOD-RAD `p.mw` | 04 PITCH |
| 4 | 05 OSC 1: WELLE `o1.w`, STEUER 1, STEUER 2 | 05 OSC 1 |
| 5 | 06 OSC 2: WELLE `o2.w`, MOD `o2.mod`, HALBTON `o2.semi`, FEIN `o2.tune` | 06 AUDIO IN 2: GATE `voc.gs`, SCHWELLE `voc.th`, HPF-PEGEL `voc.hpl`, HPF-GATE `voc.hpg` |
| – | 07 MIXER: OSZ 1, OSZ 2, RAUSCHEN | 07 MIXER: OSZ 1, EINGANG 1 `voc.ins`, RAUSCHEN |
| 6 | 08 FILTER: TYP, CUTOFF, RESONANZ, HK-INT, ANSCHLAG `f.vel`, KEYTRACK | 08 FILTER: FORMANT `voc.fs`, CUTOFF, RESONANZ, FC-QUELLE `voc.msrc`, FC-INT `voc.mint`, FOLGER `voc.efs` (127 = HALTEN) |
| 7 | 09 AMP: PEGEL, PAN, HK │ GATE `a.gate`, VERZERR. `a.dist`, ANSCHLAG `a.vel`, KEYTRACK `a.kbd` | 09 AMP: PEGEL `voc.lvl`, DIREKT `voc.dir`, VERZERR. `voc.dist`, ANSCHLAG `voc.vel`, KEYTRACK `voc.kbd` |
| 8 | 10 EG 1: ATTACK, DECAY, SUSTAIN, RELEASE, NEUSTART `e1.*`; dahinter 11 EG 2 `e2.*` | gleich |
| 9 | 12 LFO 1: WELLE, KEY SYNC, TEMPO SYNC, FREQ │ NOTE `l1.*`; dahinter 13 LFO 2 `l2.*` | gleich |
| 10 | 14–17 PATCH 1–4: QUELLE `p[k].s`, ZIEL `p[k].d`, INTENSITÄT `p[k].i` | 14 CH LEVEL: Kanal 1–16 `voc.chl`, 16 BÄNDER ▸ |
| 11 | 18 SEQ COMMON: AN, LÄNGE, TYP, LAUF, KEY SYNC, AUFLÖSUNG `seq.*`; dahinter 19–21 SEQ 1–3: ZIEL `q[s].k`, BEWEGUNG `q[s].m`, SCHRITTE ▸ (MK6) | 15 CH PAN: `voc.chp`, 16 BÄNDER ▸ |
| 12 | 22 MOD FX: TYP, TEMPO, TIEFE `mfx.*` | 16 MOD FX |
| 13 | 23 DELAY FX: TYP, TEMPO SYNC, ZEIT │ NOTE, TIEFE `dly.*` | 17 DELAY FX |
| 14 | 24 EQ: TIEF-FREQ, TIEF-GAIN, HOCH-FREQ, HOCH-GAIN `eq.*` | 18 EQ |
| 15 | 25 ARPEGGIO: AN, LATCH, TYP, OKTAVEN, GATE, ZIEL `tgt`, KEY SYNC, AUFLÖSUNG, SWING; TEMPO = Song (EN3-10). Die Step-Arp-Felder `last`/`steps` (nur microKORG) zeigt die Seite nicht (H-18) | 19 ARPEGGIO |
| 16 | 26 UTILITY: INIT, TIMBRE NEU, TIMBRE KOPIEREN ▸, TIMBRE TAUSCHEN (MK3), SEQ-INIT, SEQ KOPIEREN ▸, SEQ TAUSCHEN (MK6), WERKSKLANG ZURÜCK (MK8). Jede Ausführung mit +/YES, je ein Undo | 20 UTILITY: INIT (behält den Vocoder), PEGEL ZURÜCK, PAN ZURÜCK (MK7), WERKSKLANG ZURÜCK (MK8) |

Jeder Pfad, den `normMk` kennt, ist über ein Element der Platte oder über eine Seite erreichbar (MK-P-05), außer `v`, `vmax` (fest 4, EN3-12) und den Step-Arp-Feldern `arp.last`/`arp.steps` (nur für microKORG-Programme, A.11, H-18).

**4a. Lauflicht und SEQ EDIT** (wie am Gerät, HB-MS S. 16, S. 26):
- **Lauflicht:** Solange eine Sequenz des gewählten Timbres läuft (MOD SEQUENCE ON und eine Stimme klingt) und solange REC bereit ist, leuchten die SELECT-Tasten 1–16 nacheinander: immer genau die Taste des Schritts, der gerade klingt. Bei KEY SYNC „Stimme“ zeigt sie den Schritt der zuletzt angeschlagenen klingenden Stimme, bei Dual/Split das gewählte Timbre. Schritte über LAST STEP leuchten nie. Der Schritt kommt aus dem Worklet (je Steuerblock, wie `mkScope().voices[].seqStep`) und wird um die Ausgabe-Latenz (`outputLatency`, sonst `baseLatency`) verzögert angezeigt, damit Licht und Klang zusammenfallen. Solange das Lauflicht läuft, überdeckt es die Programm- bzw. Seiten-LED; danach kehren diese zurück. Dasselbe Lauflicht zeigen die Schritt-Tasten der Spiel-Ansicht; wo nur ein Teil der Tasten zu sehen ist, läuft es dort, wo es sichtbar ist.
- **SEQ EDIT:** siehe „Die 16 Regler“. SEQ EDIT SELECT schaltet aus → SEQ 1 → SEQ 2 → SEQ 3 → aus (Ansichtszustand, LCD „SEQ1:Cutoff“). Die Wahl ändert weder den Sound noch den Zoom: Ein eingerasteter Halt bleibt stehen.
- **Zeichnen:** Die Lauflicht-LEDs wechseln nur eine Klasse, höchstens einmal je Bild, im rAF nach der Audio-Uhr, ohne `setInterval` („Leistung“).

**5. Umzug der bisherigen Bedienung** (altes Bedienfeld aus MK1–MK7 → MK-P; die Funktionen bleiben, nur der Weg ändert sich):

| bisher (alte Vorlage) | ab MK-P (MS2000) |
|---|---|
| zwei Drehschalter mit Sektions-Matrix, Regler 1–5, SPIEL-Belegung | ein eigener Regler bzw. eine eigene Taste je Wert (Lage-Tabelle); alles andere auf den Seiten |
| SHIFT-Ebene 2 (MS2000-Zusätze) | Seiten nach dem Seitenplan |
| SHIFT + 1 … 5, Vocoder SHIFT + 1/2 | 26 UTILITY bzw. 20 UTILITY |
| SHIFT + OKT ▲/▼ (Wert ±1) | +/YES, −/NO |
| SHIFT + SEITE | entfällt |
| TIMBRE: T1 → T2 → beide (Edit Sync); SHIFT + TIMBRE (Solo) | TIMBRE SELECT: T1 ↔ T2 wie am Gerät; Edit Sync und Solo nach H-18 (Vorgabe: nicht auf dem Bedienfeld) |
| BANK-Drehschalter, SEITE, Nummerntasten 1–8, Anzeige „A.24“ | BANK ▼ ▲, SELECT 1–16, LCD „A01:Name“ (MK8) |
| ARP-Taste mit Tempo-LED | ARPEGGIATOR ON/OFF, TEMPO-LED, LATCH, RANGE, TYPE, TEMPO, GATE |
| ARP B: Nummerntasten als Schritt-Tasten (Step-Arp) | nach H-18 (Vorgabe: nicht auf dem Bedienfeld; `last`/`steps` bleiben gespeichert) |
| TIMBRE/HALTEN im Vocoder | KBD TRACK │ E.F.SENSE auf 127 = HOLD (wie am MS2000) bzw. 08 FILTER FOLGER |
| Tipp auf die Matrix-Zeile (SCHRITTE, 16 BÄNDER, EIGENE) | Tipp auf die Anzeige, wenn Zeile 2 „▸“ trägt |
| E1/E2-LEDs neben der Anzeige | AUDIO-IN-LEDs links oben |
| Quellen QUELLE 1/2 auf Ebene 2 | GLOBAL 1A/1B |
| ◎ Punkte an Drehschalter-Stellungen | ◎ Punkt auf jeder SELECT-Taste, deren Seite von INIT abweicht (EDIT), und an jedem Regler, dessen Wert abweicht |
| 🎲 würfelt die Sektionen von T1 | 🎲 würfelt dieselben Werte (OSZ, Mixer, Filter, Hüllkurven von T1), unverändert |
| Reiter [GERÄT] [FX] bzw. [LINKS] [RECHTS] [FX] | Reiter **[GERÄT] [SPIEL] [FX]** mit ◀ Karte ▶ („Ansichten“) |
| BEND-Rad im Holzton | PITCH-Rad und MOD-Rad im Metallton |

**6. Abbau, Test-API, Hilfe.**
- Das alte Bedienfeld aus MK1–MK7 wird entfernt: Drehschalter, 7-Segment-Anzeige, Matrix, Holzwangen, Halb-Ansicht, Zonen Z1–Z13, Nummerntasten, SHIFT-Ebenen-Oberfläche und, nach der Vorgabe zu H-18, die Bedienwege für Edit Sync, Solo und Step-Arp-Schritte (die Engine-Funktionen bleiben unverändert). Kein toter Code bleibt im Block `sq-mk-src` (Ladezeit).
- `mkPanel()` und `mkView(o)` nach B.7. Element-Rechtecke stehen in % der Platte, `zone` (Trefferzone) in px im Bild (nur aktive Elemente), `bind` ist der Pfad (`'t.0.f.cut'`) bzw. `'view:fxSel'`. Die Bedienfeld-Tests aus MK1–MK7 werden auf die neue Bedienung umgestellt; Klang-, Daten- und Leistungs-Tests bleiben unverändert.
- Jedes neue Element bekommt eine Hilfe-Zeile und beim ersten Antippen einen LCD-Hinweis (L10): eigene Sätze ohne Marke, den Namen aus `MK_LABEL`. Die Hilfe-Zeilen des alten Bedienfelds fallen weg.

**Oberfläche.**

**Aussehen** (eK; die Zeichnung belegt nur Lage und Aufdruck):
> **Änderung 26.10. abends (Xander, mit 7 Gerätefotos: „der MS 2000 ist viel blauer“, „Regler … nur Kreise“) – geht allem Folgenden vor:**
> Platte **blau-metallic**, gemessen aus den Fotos (Farbton 199–210°, Sättigung ≈ 0,7): Verlauf hsl(205 58 % 31 %) → hsl(208 62 % 20 %), Rand hsl(209 58 % 12 %), **keine Bürstung**. Aufdruck und Linien **weiß** (#e8eef3), inverse Felder **hell** (#e8eef3) mit **blauer** Schrift (#123a57). Regler: schwarze Kappe mit **geriffeltem Rand**, Fase, fester Glanzpunkt (dreht nicht mit), weißer Strich, Schlagschatten; Kappen-Helligkeit darf durch Glanz/Fase bis L* ≈ 30 gehen (Grundton der Kappe bleibt schwarz). Tasten mit Schatten. MK-P-11 wird an diesen Werten gemessen; die alten Zahlen unten (hell blau-silbern, dunkler Druck, Bürstung, L* ≤ 15) sind überholt.

- **Platte:** hell blau-silbern gebürstetes Metall, nur aus CSS-Verläufen. Grund ist ein senkrechter Verlauf hsl(208 30 % 82 %) → hsl(210 26 % 72 %). Darüber liegt ein `repeating-linear-gradient` mit waagrechten 1-px-Linien (±3 % Helligkeit) und ein schwacher schräger Glanz. Gemessener Mittelwert: Farbton 195–225°, Sättigung 10–35 %, Helligkeit 65–85 %. Außen eine dunkelgraue Kante (0,6 % der Breite). Keine Holzwangen, keine Bild-Dateien, keine Bitmaps aus Korg-Material.
- **Druck:** Sektionsrahmen und Beschriftung dunkelgrau (Helligkeit ≤ 30 %, Kontrast zur Platte ≥ 4,5 : 1), Rahmenlinien max(1 px, 0,1 % der Breite), Titel über dem Rahmen wie in der Zeichnung. Inverse Felder sind weiße Schrift auf Schwarz (Kontrast ≥ 7 : 1), genau dort, wo die Tabelle sie nennt. App-Schrift in Großbuchstaben, Gewicht 600–700. Schriftgrößen in % der Plattenbreite: Titel 1,1, Beschriftung 0,9, kleine Listen 0,82.
- **Regler:** schwarze Kappen (L* ≤ 15, `radial-gradient`) mit weißer Zeigerlinie. Darum eine aufgedruckte Skala, ein gemeinsames SVG-Symbol, das jeder Regler mit `<use>` nutzt (eigene Form, EN3-13). Die Mittelmarke oben tragen genau die Regler, an denen die Zeichnung sie zeigt: EG 1 INT, KBD TRACK, SEMITONE, TUNE und PAN. PATCH 1–4 sind auch bipolar, haben in der Zeichnung aber keine Marke und bekommen keine (die Mitte nennt die LCD). AUDIO IN 1 hat in der Zeichnung keine Skala und bekommt keine. Kappe 2,1 %, Skala 3,3 % der Breite. VOLUME bekommt die Ziffern 0…10.
- **Tasten:** hellgraue Rechtecke (Helligkeit 75–90 %) mit dunklerer Kante und innerer Doppellinie wie in der Zeichnung. Tasten mit LED zeigen oben in der Mitte das LED-Fenster. Gedrückt wird die Taste dunkler, ohne Versatz.
- **LEDs:** klein und rund (0,75 % der Breite). Aus = dunkelrot, an = rot bis orange (Farbton 0–35°) mit kleinem Schein (≤ 4 px, nur an). OCTAVE grün (±1) bzw. rot (±2).
- **Anzeige:** 2 × 16 Zeichen in `ui-monospace`, ohne Umbruch und mit fester Breite, wie das beleuchtete LCD-Modul des Geräts (16 Zeichen × 2 Zeilen mit Hintergrundbeleuchtung, HB-MS technische Daten): **dunkle Zeichen auf gelbgrün beleuchtetem Grund**, typisch für Geräte dieser Zeit (eK, Xander 26.10.). Ein Variablenpaar `--mkp-lcd-fg` (≈ hsl(85 45 % 14 %)) und `--mkp-lcd-bg` (≈ hsl(78 60 % 58 %)), dazu ein leichter innerer Verlauf zum Rand. Ein späterer Abgleich ändert nur diese zwei Werte.
- **Namensfeld:** nur der Text aus `MK_LABEL` in der App-Schrift, Gewicht ≤ 600, normale Breite, Größe 3 % der Plattenbreite, Druckfarbe, linksbündig ab x 56,4. Ohne Unterzeile; „ANALOG MODELING SYNTHESIZER“ ist Teil der Herstellerbeschriftung und entfällt. Kein Logo, keine nachgebildete Schriftform (EN3-05, B.6 Nr. 9 c).

**Fester Rahmen** (Xander, 26.10.: Das Layout darf nie springen oder nach unten überlaufen):
- Platte und Ansichten liegen in einem **Rahmen mit fester Größe**: hochkant der `.pg`-Körper des Blatts (B.3 „Maße der Rahmen“; die Tastatur bleibt darunter wie bisher), quer die Fläche des MS-2000-Blatts unter seiner Kopfzeile (unten). Der Rahmen ist in allen Reitern, Ansichten, Halten, Modi und im Vocoder gleich groß und gleich gelegen und hat `overflow: hidden` und `contain: strict`.
- Zoomen, Wischen und Halt-Wechsel ändern nur `transform` eines Hüllelements im Rahmen. Nichts davon ändert eine Höhe im Dokument; die Seite wächst nie nach unten und springt nie (MK-P-13).
- **Querformat:** Das MS-2000-Blatt belegt die ganze Fläche innerhalb der Safe-Area (12 Pro Max 926 × 428: ≈ 832 × 407 px; App-Kopfzeile und Tastatur-Zeile liegen darunter verdeckt). Oben steht **eine Kopfzeile von 44 px**: ✕ · ↶ ↷ · ▶/■ (Song, derselbe Weg wie in der App-Kopfzeile) · ‹ Name › (zeigt beim Drehen 1,5 s lang den Klartext der LCD-Zeile) · Reiter GERÄT │ SPIEL │ FX · ◀ Karte ▶ · ⋯ (Engine-Wahl, A/B, Sichern, 🎲, ◎, Init, ▶ Hören). Darunter liegt der Rahmen: 12 Pro Max ≈ 832 × 363 px. Das ist eine sichtbare Änderung des Blattkopfs quer (H-17; Vorgabe so, gebaut wird ohne Warten; der Orchestrator zeigt Xander das Ergebnis danach).
- **Hochformat:** Blattkopf wie bisher (B.3); ◀ Karte ▶ stehen rechts in der Reiter-Zeile.

**Ansichten** (Reiter **[GERÄT] [SPIEL] [FX]**; FX unverändert). Ansicht, Hälfte, Halt und Modus sind Ansichtszustand. Beim ersten Öffnen erscheint die Gesamtansicht, danach in der Sitzung die zuletzt gewählte Ansicht.
- **Gesamtansicht** (Reiter GERÄT):
  - **Quer** die ganze Platte, eingepasst (contain) und mittig im Rahmen: 12 Pro Max ≈ 708 × 363 px mit ≈ 39 px Spaltenabstand (Tabelle „Formate“).
  - **Hochkant** eine **Hälfte** auf einmal: LINKS = x 0–55,6 (AUDIO IN bis AMP, OCTAVE bis PORTAMENTO, SEQ EDIT, EG 1/EG 2, BANK, Regler und SELECT 1–8), RECHTS = x 55,5–100 (ARPEGGIATOR, Anzeige-Feld, LFO 1/2, EFFECTS, VIRTUAL PATCH, Regler und SELECT 9–16). Beide Hälften haben denselben Maßstab z = min(Rahmenbreite ÷ 0,556; Rahmenhöhe · 1,95), auf dem 12 Pro Max hochkant 716 px (≈ 40 px Spaltenabstand). Die andere Hälfte erreicht man mit waagrechtem Wischen oder einem Tipp auf ihre Seite der Karte. W zeigt bei einem Körper ≥ 418 px Höhe die ganze Platte wie quer.
  - **Direkt spielbar** (Xander, 26.10.): Regler drehen und Tasten schalten, ohne vorher zu zoomen; Treffer nach „Treffer“.
  - **Tipp zoomt:** Ein Tipp (≤ 8 px Bewegung, ≤ 300 ms) auf einen Regler, auf einen Sektionstitel oder auf freie Fläche einer Sektion gleitet in den Halt ihrer Station (Tabelle „Halte“). Tasten schalten beim Tipp wie am Gerät und zoomen nicht. Ein Doppeltipp hat in der Gesamtansicht keine Bedeutung, weil schon der erste Tipp zoomt.
- **Zoom-Ansicht** (rastet ein, bleibt):
  - Der Zoom gleitet in 250 ms (ease-out, nur `transform`) auf den **Halt** der Station und **rastet dort ein**: Maßstab und Lage stehen fest; es gibt kein freies Verschieben und keinen Zwischenstand.
  - Er **bleibt**, bis Xander die **Karte** antippt; dann kommt die Gesamtansicht (hochkant die Hälfte mit der Station). Reiterwechsel, Wechsel zu einer anderen MS-2000-Spur, Schließen und Öffnen des Blatts in der Sitzung, Drehen des iPhones, EDIT, GLOBAL, SEQ EDIT, Vocoder und Programmwechsel lassen ihn stehen. Nach dem Drehen wird derselbe Halt für das neue Format gerechnet.
  - **Halt** = die Station eingepasst (contain) und mittig im Rahmen, mit z = min(1320; Einpass-Maßstab), nie kleiner als in der Gesamtansicht. Am Plattenrand wird der Rahmengrund sichtbar, wie wenn das Gerät dort endet; die Station wird nicht an den Rand geschoben, damit jeder Schritt sichtbar wandert.
  - **Dieselbe Platte, dieselbe Optik:** keine Abdeckung, kein zusätzlicher Rahmen, keine Hervorhebung auf der Platte. Was um die Station herum im Rahmen liegt, ist sichtbar und bedienbar wie in der Gesamtansicht. Wo man steht, zeigen die Karte und 1 s lang die LCD-Zeile („FILTER · 4/13“).
  - **◀ ▶ und Wischen** gehen zum vorigen bzw. nächsten Halt der Reihenfolge (Gleiten 250 ms). Am Anfang und am Ende ist der Pfeil gedimmt, und die Platte federt beim Wischen zurück; es gibt keinen Umlauf. In der Gesamtansicht öffnen ◀ und ▶ den zuletzt benutzten Halt (beim ersten Mal OSC 1).
  - Ein Tipp auf freie Fläche einer anderen sichtbaren Station gleitet zu deren Halt.
- **Halte** (Signalfluss wie bei Cubasis Micrologue, Xander 26.10.; Rechtecke in % der Platte; jedes Element liegt in mindestens einem Halt ganz):

| Nr. | Station | zeigt ganz | x | y |
|---|---|---|---|---|
| 1 | OSC 1 | OSCILLATOR 1, links davon AUDIO IN und POWER/VOLUME | 0–22,4 | 0,5–50,5 |
| 2 | OSC 2 | OSCILLATOR 2 | 22,3–33,4 | 0,5–50,5 |
| 3 | MIXER | MIXER | 33,3–39,0 | 0,5–50,5 |
| 4 | FILTER | FILTER | 38,9–50,0 | 0,5–50,5 |
| 5 | AMP | AMP mit EG 2/GATE und DISTORTION | 49,9–55,6 | 0,5–67,0 |
| 6 | EG 1/EG 2 | EG 1 (FILTER), EG 2 (AMP), Regler 1–8 | 11,1–55,8 | 67,0–83,0 |
| 7 | LFO 1/2 | LFO 1, LFO 2, Regler 9–10 | 55,5–66,6 | 46,5–83,0 |
| 8 | EFFECTS | EFFECTS, Regler 11–12 | 66,5–77,7 | 46,5–83,0 |
| 9 | ARPEGGIATOR | ARPEGGIATOR, darüber Namensfeld und ORIGINAL VALUE | 55,3–77,7 | 0,5–46,0 |
| 10 | MOD SEQUENCE 1–8 | MOD SEQUENCE ON/OFF und REC, SEQ EDIT, OCTAVE, TIMBRE SELECT, PORTAMENTO, BANK, Regler und SELECT 1–8 | 0–55,6 | 47,0–100 |
| 11 | MOD SEQUENCE 9–16 | Regler und SELECT 9–16 mit den unteren Teilen von LFO, EFFECTS und VIRTUAL PATCH | 55,5–100 | 47,0–100 |
| 12 | VIRTUAL PATCH | VIRTUAL PATCH, Regler 13–16 | 77,6–100 | 46,5–83,0 |
| 13 | ANZEIGE | Anzeige-Feld: LCD, CURSOR, −/NO, +/YES, PAGE, WRITE, EDIT, GLOBAL, EXIT | 77,6–100 | 0,5–46,0 |

  - Halte 1–12 folgen Xanders Reihenfolge; MOD SEQUENCE hat zwei Halte, weil die 16 Regler und SELECT-Tasten in einem Halt kaum größer wären als in der Gesamtansicht. ANZEIGE ist angehängt, damit auch das Anzeige-Feld gezoomt erreichbar ist.
  - Sektionen außerhalb von Xanders Liste gehören zu dem Halt, der sie ganz zeigt: AUDIO IN und POWER/VOLUME zu 1; OCTAVE, TIMBRE SELECT, PORTAMENTO, SEQ EDIT und BANK zu 10; Namensfeld und ORIGINAL VALUE zu 9; die Schritt-Tasten 1–8 zu 10, 9–16 zu 11.
- **Karte** (oben; Xander, 26.10.: kleine Karte des ganzen Panels mit markiertem Bereich):
  - Ein verkleinertes Bild der ganzen Platte (64 × 33 px, Treffer 64 × 44) mit einem hellen Rechteck um den sichtbaren Ausschnitt (Hälfte bzw. Halt). Quer steht sie in der Kopfzeile, hochkant rechts in der Reiter-Zeile, mit ◀ links und ▶ rechts daneben (je 44 × 44).
  - **Tipp auf die Karte = Gesamtansicht.** Das ist der einzige Weg aus dem Zoom. Hochkant in der Gesamtansicht wählt ein Tipp auf die linke bzw. rechte Kartenhälfte die Hälfte.
  - Gezeichnet einmal je Format in ein Canvas 2D (eigene Zeichnung aus der Lage-Tabelle: Rahmen, Regler als Punkte, Tasten als Rechtecke); das Rechteck wandert per `transform`.
- **Treffer** (Xander, 26.10., bestätigt: Treffer = nächstes Bedienelement):
  - Eine Berührung auf der Platte gehört zum **nächsten aktiven Element**. Gemessen wird der Abstand vom Finger zum Bild-Rechteck des Elements (0 innerhalb); bei Gleichstand gewinnt die nähere Mitte. Liegt kein aktives Element näher als 1,8 % der Plattenbreite, ist die Stelle **frei** (Sektionstitel, Rahmen, Ränder, LED-Felder ohne Taste).
  - So sind die Trefferzonen so groß, wie die Platte es erlaubt, und überlappen nie. Ihre Größe folgt dem Maßstab (Tabelle „Formate“). Die 44-px-Regel gilt deshalb auf der Platte nicht, außerhalb der Platte schon (B.3).
  - Ein Finger behält sein Element, bis er loslässt (`setPointerCapture`); ein zweiter Finger auf demselben Element wird ignoriert.
  - Gesucht wird über ein beim Aufbau gerechnetes Raster (Zellen 0,5 % der Plattenbreite → Element-ID), ohne Layout zu lesen.
- **Spiel-Ansicht** (Reiter SPIEL): Eine Metall-Leiste aus denselben Bausteinen, Reihenfolge wie am Gerät von links nach rechts. Darunter Räder und Tastatur: hochkant wie bisher in `#kbArea`, quer innerhalb des Rahmens unten, die Tastatur mit der restlichen Rahmenhöhe (12 Pro Max ≈ 230 px).
  - **Band 1 (44 px)** ab 604 px Rahmenbreite (quer und W) in einer Reihe: OCTAVE ▼ ▲ · BANK ▼ ▲ · TIMBRE SELECT mit LEDs · MOD SEQ ON/OFF · REC · ARP ON/OFF mit TEMPO-LED · LATCH · Anzeige (2 × 16, ≥ 160 px breit). **Schmaler (hochkant)** ist Band 1 = OCTAVE ▼ ▲ · BANK ▼ ▲ · Anzeige (≥ 160 px, in P3 106 px), und die fünf Tasten TIMBRE SELECT · MOD SEQ ON/OFF · REC · ARP ON/OFF · LATCH stehen als Band 2 darunter; in P3 entfällt Band 2 (§0.4, P3 darf vereinfachen; die Tasten bleiben auf der Platte).
  - **Schritt-Tasten** mit Nummer, Aufdruck und Lauflicht: eine Reihe à 16, wenn der Rahmen ≥ 704 px breit ist (12 Pro Max quer, L1, W); sonst quer eine Hälfte à 8 (L2), hochkant 2 × 8 bei ≥ 352 px Breite (P1, 12 Pro Max) bzw. eine Hälfte 2 × 4 (P2, P3). Die Hälften 1–8 │ 9–16 wechseln mit Wischen; ein Hälften-Zeiger zeigt auch das Lauflicht der anderen Hälfte als Punkt.
  - **Aufdruck der Schritt-Tasten in der Spiel-Ansicht:** nur die Zeile des aktiven Modus (Synth: obere Zeile, Vocoder: inverse Zeile), in der 9-px-Klasse `.lg`, höchstens zwei Zeilen (22 px), umbrochen nur an Leerzeichen (AUDIO IN 2, DELAY FX). Ein Wort, das auch dann nicht in die Tastenbreite passt (ARPEGGIO bei 44–45 px), bekommt 8 px. So halten alle Formate scrollWidth ≤ clientWidth. Die Platte selbst zeigt beide Zeilen wie die Zeichnung.
- **Formate** (gerechnet mit `scratchpad/rev1-tools/pure/stations2.py`; MK-P misst die echten Rahmen und trägt sie hier und in CHANGES ein; Spaltenabstand = 5,52 % von z, Tastenabstand der Paare = 4,3 % von z):

| Format | Rahmen (px) | Gesamtansicht | z | Spalten- / Tastenabstand | Halte: z | Spiel-Ansicht |
|---|---|---|---|---|---|---|
| 12 Pro Max quer 926 × 428 | ≈ 832 × 363 | ganze Platte ≈ 708 × 363 | 707 | 39 / 30 px | 1064–1320 | Band 1, 16 Schritt-Tasten in einer Reihe, Tastatur ≈ 230 px |
| L1 844 × 390 | ≈ 750 × 325 | ganze Platte ≈ 634 × 325 | 633 | 35 / 27 px | 953–1320 | wie 12 Pro Max quer |
| L2 667 × 375 | ≈ 667 × 331 | ganze Platte ≈ 645 × 331 | 645 | 36 / 28 px | 970–1320 | Band 1, Hälfte 1 × 8 |
| 12 Pro Max hoch 428 × 926 | ≈ 398 × 380 | Hälfte | 716 | 40 / 31 px | 716–1320 | Band 1, Band 2, Schritt-Tasten 2 × 8 |
| P1 390 × 844 | 360 × ≈ 300 | Hälfte | 585 | 32 / 25 px | 647–1320 | wie 12 Pro Max hoch |
| P2 375 × 667 | 345 × ≈ 231 | Hälfte | 450 | 25 / 19 px | 620–1234 | Band 1, Band 2, Hälfte 2 × 4 |
| P3 320 × 568 | 290 × ≈ 203 | Hälfte | 395 | 22 / 17 px | 521–1084 | Band 1, Hälfte 2 × 4 |
| W 844 × 1180 | 814 × Körper | ganze Platte bei Körper ≥ 418 px, sonst Hälfte | ≤ 814 | ≤ 45 / 35 px | bis 1320 | wie L1 |

- **Drehen des iPhones:** Das neue Format rechnet denselben Halt bzw. in der Gesamtansicht die Hälfte mit der zuletzt bedienten Sektion. Nichts wird abgeschnitten: Jede Beschriftung erfüllt scrollWidth ≤ clientWidth, und die Seite scrollt nie waagrecht.

**Gesten** (L4; Regler-Geste aus `sKnob`, Fein-Regel `ctlPrecision`):
- **Regler:** senkrecht ziehen = Wert. **Fein:** seitlich ≥ 64 px vom Aufsetzpunkt = × ¼, ≥ 140 px = × 1⁄16, oder ein ruhender zweiter Finger auf freier Fläche = × ¼ (LCD „FEIN ×¼“). Im Halt ist der Doppeltipp = Standard, wie überall; in der Gesamtansicht zoomt der Tipp. Eine Geste ergibt ein Undo; während der Geste geht der Bruchwert an das Worklet (EN3-03).
- **Tasten:** Tipp. Bewegt sich der Finger mehr als 8 px, wird der Tipp verworfen.
- **Wischen:** ein Finger, Start auf freier Fläche, Beschriftung oder einer Taste, **nie auf einem Regler** (dort bleibt seitlich = fein). Im Zoom folgt die Platte dem Finger 1 : 1 waagrecht; beim Loslassen ab 40 px oder 0,3 px/ms rastet sie in den nächsten Halt in Wischrichtung ein (≤ 250 ms), sonst zurück in den alten. Hochkant in der Gesamtansicht wechselt Wischen die Hälfte; quer in der Gesamtansicht hat Wischen keine Bedeutung.
- **Kein Pinch**, kein Browser-Zoom (`touch-action`): Der Zoom rastet nur über Tipp, ◀ ▶ und Wischen ein und endet nur über die Karte.
- **Zwei Regler zugleich** mit zwei Fingern ergeben zwei Gesten und zwei Undos. Räder, Tasten und Regler gehen gleichzeitig (MK1-33).
- **Bewegungen:** Zoom und Halt-Wechsel gleiten 250 ms; bei `prefers-reduced-motion` springen sie ohne Animation.

**Leistung** (CLAUDE.md: schnelle Seite und stabile Verbindung zuerst):
- **Feste Geometrie:** Die Platte ist ein Baum mit absoluten Lagen in Platten-Einheiten (`--u` = z ÷ 1000 px) und hat `contain: strict`. Kein Text ändert die Größe seines Kastens (LCD feste 16 Zeichen).
- **Ansichtswechsel nur über `transform`:** Gesamtansicht ↔ Halt, Hälften, ◀ ▶ und Wischen ändern nur `transform` eines Hüllelements und lösen kein Layout aus. Die Platte wird im Maßstab des größten Halts des Formats (≤ 1320 px) aufgebaut und für kleinere Maßstäbe verkleinert, damit die Schrift scharf bleibt. `will-change: transform` gilt nur während Gleiten und Wischen; danach zeichnet Safari scharf neu, und kein dauerhafter großer Layer belegt Speicher.
- **Aktualisieren:** Regler drehen per `transform: rotate()` nur die Kappe. LEDs und Tasten wechseln nur Klassen, höchstens einmal je Bild und gesammelt in einem rAF. Lauflicht und TEMPO-LED folgen der Audio-Uhr im rAF, ohne `setInterval`. In Gesten wird nach dem Aufsetzen kein Layout gelesen; Treffer kommen aus dem Raster.
- **Aufbau:** Der Baum entsteht beim ersten Öffnen aus der Lage-Tabelle als Datenblock in `sq-mk-src`, in Häppchen ≤ 8 ms, das sichtbare Stück zuerst. Vorher läuft `tickAhead(.3)`, zwischen zwei Häppchen mindestens ein Scheduler-Tick (EN3-14). Projekte ohne MS-2000-Spur laden nichts davon.
- **Kein WebGL** (EN3-13 bleibt): Bei ≈ 400 Elementen ist DOM mit Compositor-Transform die schnellste Lösung. Canvas oder WebGL lohnt erst bei Tausenden bewegter Elemente und müsste Text, Treffer und Bedienhilfen neu bauen. Keine `filter`, kein `backdrop-filter`, keine weichen Schatten auf mehr als 10 Elementen.

**Nicht-Umfang.**
- Neue Klang-Werte und DSP-Änderungen; einzige Ausnahme sind die zwei Eingangs-Pegel als Live-Wert. Kein neues Speicherformat.
- MS2000R (Rack: KEYBOARD-Taste, PHONES), DEMO (EXIT + GLOBAL), Global-Werte des Geräts (A.10).
- Pinch-Zoom und freies Verschieben (der Zoom rastet ein, Xander 26.10.).
- microKORG-Bedienfunktionen auf Platte und Seiten (Edit Sync, Solo, Step-Arp-Schritte; Vorgabe H-18).
- Fotorealistische Texturen und Bild-Dateien, der Herstellername, die Gerätebezeichnung als Schriftzug.

**Daten.**
- Kein neues Feld in Sound oder Projekt; Format bleibt 5 (`PROJECT_FORMAT` 5, `SOUNDS_FORMAT` 2).
- **Ansichtszustand** (nur Sitzung): `{ansicht, haelfte, halt, letzterHalt, modus, seite, cursor, fxSel, patchSel, seqSel, spielHaelfte, seitenSprung}` (`seitenSprung` = GLOBAL 1D, Vorgabe an).
- **Live-Wert** wie die Räder (B.1): `R.mkInTrim[uid] = {e1, e2}` 0…127; 0 = stumm, 1…100 = −40…0 dB, 100…127 = 0…+6 dB (je linear in dB), Vorgabe 100. Nicht gespeichert, kein Undo. Umgesetzt als je ein GainNode vor dem Worklet-Eingang; bei 0 dB (Faktor genau 1) bitgleich.

**Berührungspunkte und Reihenfolge.**
- **Wiederverwendet:** `sKnob`/`ctlPrecision`, `openPop`, `sheetFrame` mit Reitern und LCD-Zeile, die Zusatz-Ansichten (SCHRITTE MK6, 16 BÄNDER MK7, EIGENE MK3), die Räder (MK1), die ORIGINAL-Logik, alle Bindungen von MK1–MK7, `mkScope` (Seq-Schritt), `MK_LABEL`.
- **Neu:** Platte, Lage-Tabelle als Datenblock, LCD 2 × 16 mit Modi und Seiten, fester Rahmen mit Kopfzeile quer, Gesamtansicht mit Treffer-Raster, Hälften, 13 Halte, Karte, ◀ ▶, Lauflicht, Spiel-Ansicht, E1/E2-Pegel.
- **Entfernt:** das alte Bedienfeld (Umfang 6).
- **Braucht** MK5–MK7 zusammengeführt (4.15.0 ✓), weil Arp-, Seq- und Vocoder-Elemente gebunden und ihre Oberflächen-Tests umgestellt werden.
- **Darf parallel** zu MK8 gebaut werden. Wer später zusammenführt, passt an (Teil G Nr. 18).

**Dauer** 21–25 h in drei Bau-Abschnitten:
1. Platte, Lage-Tabelle, Aussehen, Bindung aller Elemente samt Vocoder (8–9,5 h).
2. Anzeige mit Modi und Seitenplan, Umzug der Funktionen, Abbau und Umstellung der Tests (6–7 h).
3. Fester Rahmen mit Kopfzeile quer, Gesamtansicht mit Treffer-Raster, Hälften, Halte, Karte, ◀ ▶, Lauflicht, Spiel-Ansicht, Gesten, Formate, Leistung, Abnahme (7–8,5 h).

Dazu 1–2 h Fach-Prüfung. **Version 4.16.0** (Lieferreihenfolge, E.1; wird MK8 zuerst ausgeliefert, bekommt MK-P 4.17.0). **Budget** +28 KB netto (neu ≈ +53 KB, entfernt ≈ −25 KB) · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK-P-01 Vorlage (M-VORLAGE**, ersetzt M-SKIZZE, B.6 Nr. 5): `mkPanel().elements` gegen die Lage-Tabelle.
  - Jede ID ist da; jede Mitte liegt innerhalb ± 0,8 % der Breite und ± 1,2 % der Höhe. Die Abstände in den Paaren OCTAVE, BANK, PAGE und in den Viererreihen (Arpeggiator, Anzeige-Feld) sind 4,3 % ± 0,05.
  - Jeder Sektionsrahmen erreicht IoU ≥ 0,9; die 16-Spalten-Regel hält ± 0,3 %; das Seitenverhältnis ist 1,95 ± 0,01.
  - Je Zeile A–D stimmt die Reihenfolge links → rechts, je Sektion oben → unten.
  - Gesamtansicht, Hälften und alle Halte zeigen in allen Formaten dieselben relativen Lagen (± 1 px; reine Skalierung).
- [ ] **MK-P-02 Bildvergleich:**
  - Bildschirmfoto der ganzen Platte, gerendert in 1400 × 718 px. Dasselbe Linien-Verfahren wie bei der Vermessung findet die Sektionsrahmen in Foto und Zeichnung. Jeder Rahmen liegt ≤ 0,8 % der Breite bzw. ≤ 1,2 % der Höhe neben seinem Gegenstück; ein fehlender oder zusätzlicher Rahmen ist ein Fehler.
  - Dazu ein Überlagerungsbild (Zeichnung zu 50 % über dem Foto) für FP-TOUCH und Xanders Blick. Es bleibt **privat** im Scratchpad bzw. im Chat, nie im Repo oder in CHANGES (Handbuch-Bild, E.5 Nr. 5).
- [ ] **MK-P-03 Jedes Element wirkt:** Für jedes Element mit `bind` gibt es eine CDP-Touch-Geste in einem Halt und, quer, in der Gesamtansicht (Ziehen 60 px bzw. Tipp auf die Element-Mitte).
  - Der gebundene Wert in `mkGet` bzw. `mkPanel()` ändert sich. Klang-Werte ändern den Klang messbar (H-1, H-3; Ausnahmen nach B.6 Nr. 3).
  - Eine Geste ergibt ein Undo, und Undo stellt deep-equal her.
  - Die E1/E2-Pegel ändern den Eingangspegel (Spur als Quelle wie in MK7, gemessen am Worklet-Eingang) zwischen 64 und 127 um ≥ 6 dB.
  - Ausnahmen mit Grund in CHANGES: BANK und Programm-Tasten vor MK8; COMPARE nur mit geändertem Sound.
- [ ] **MK-P-04 Vocoder:** Bei `mode` 3 wirkt jedes Element nach der Vocoder-Spalte.
  - Inverse Namen = gebundener `voc.*`-Pfad.
  - Graue Elemente ändern hörbar nichts und nennen den Grund (L2).
  - CH PARAM LEVEL/PAN: Regler n ändert genau Band n (`voc.chl`/`voc.chp`; Bandpegel ± nach W-42, andere Bänder ± 0,1 dB).
  - KBD TRACK │ E.F.SENSE auf 127 hält den Formant wie MK7-03 (Folger und Halten).
- [ ] **MK-P-05 Seiten:**
  - Jeder `normMk`-Pfad außer `v`, `vmax`, `arp.last` und `arp.steps` ist über Platte oder Seite erreichbar (Liste aus INIT AM).
  - EDIT + Taste n öffnet die Seite des Seitenplans, für Synth und Vocoder. PAGE läuft alle Seiten vor und zurück. CURSOR wählt, −/+ ändern um eine Geräte-Stufe und klemmen. Seiten-Sprung, Tipp auf die Anzeige (Liste bzw. Zusatz-Ansicht), EXIT und WRITE wirken.
  - COMPARE (EDIT + EXIT) zeigt den gespeicherten Stand und kehrt zurück.
  - Die UTILITY-Werkzeuge liefern dieselben Ergebnisse wie die alten SHIFT-Werkzeuge: Die Tests aus MK3, MK6 und MK7 laufen über den neuen Weg (Solo nach H-18).
  - GLOBAL 1A/1B bestehen die MK7-Eingangs-Tests, 1C ändert `tr.kbOct`.
- [ ] **MK-P-06 Marke** (EN3-05, B.6 Nr. 9):
  - Die Datei-Prüfungen sind unverändert (genau 1 × „MS 2000“ in der Datei).
  - Im Text des Bedienfelds steht „MS 2000“ genau einmal, im Namensfeld, gebildet aus `MK_LABEL` (ein Test-Build mit anderer Konstante ändert das Feld).
  - Kein Korg, microKORG, RADIAS, DWGS, VOX, „ANALOG MODELING“ in Aufdruck, `aria-label`, Hilfe- und LCD-Zeilen.
  - 0 neue `@font-face`, kein `data:image`, kein `<img>`.
  - Namensfeld: berechnete Schrift = App-Schrift, Gewicht ≤ 600, `font-stretch` normal, keine Verzerrung.
  - FP-SICHER prüft die Bildschirmfotos mit dem Auge.
- [ ] **MK-P-07 Treffer und Platz:**
  - M-PLATZ (B.6 Nr. 5, mit Safe-Area- und Home-Balken-Durchgang) in P1, P2, P3, L1, L2, W, 428 × 926 und 926 × 428 für die Gesamtansicht (quer ganz, hochkant beide Hälften), jeden der 13 Halte, die Spiel-Ansicht (beide Hälften), EDIT, GLOBAL und den Vocoder. Jede Beschriftung erfüllt scrollWidth ≤ clientWidth; die Seite scrollt nicht waagrecht.
  - Maßstab: z der Gesamtansicht und jedes Halts gleicht der Regel bzw. der Tabelle „Formate“ (± 1 px). Jedes Element liegt in mindestens einem Halt ganz.
  - Treffer: Prüfpunkte alle 4 px über die sichtbare Platte ergeben in jeder Ansicht genau das nächste aktive Element nach der Regel „Treffer“ bzw. „frei“. Jede Zone deckt ihr Element ganz ab, Zonen überlappen nicht, und Elemente außerhalb des Rahmens werden nie getroffen. Quer auf 926 × 428 sind in der Gesamtansicht die Regler-Zonen der 16-Spalten-Reihen ≥ 36 px breit (gerechnet 39 px) und die Zonen der Tastenpaare ≥ 28 px (gerechnet 30 px). Die kleinste Zone je Format und Ansicht steht in CHANGES.
  - Außerhalb der Platte (Kopfzeile, Reiter, Karte, ◀ ▶, Listen, Räder, Spiel-Ansicht) ist jede Trefferfläche ≥ 44 × 44, ohne Überlappung.
- [ ] **MK-P-08 Gesten** (CDP-Touch):
  - Regler: senkrecht = Wert; Fein × ¼ ab 64 px, × 1⁄16 ab 140 px, × ¼ mit ruhendem zweiten Finger; im Halt Doppeltipp = Standard.
  - Gesamtansicht: Ein Tipp auf einen Regler, einen Sektionstitel oder freie Fläche gleitet in den Halt dieser Station (Zuordnung aller Sektionen nach der Tabelle „Halte“). Ein Tipp auf eine Taste schaltet sie und zoomt nicht. Ziehen an einem Regler ändert den Wert ohne Zoom.
  - Zoom: ◀ ▶ und Wischen von freier Fläche oder einer Taste gehen genau einen Halt weiter in der Reihenfolge 1 … 13 (Einrasten ≤ 250 ms); an den Enden ist der Pfeil gedimmt bzw. federt die Platte zurück. Wischen ab einem Regler verschiebt nie. Ein Tasten-Tipp mit > 8 px Bewegung wird verworfen. Ein Tipp auf freie Fläche einer anderen sichtbaren Station gleitet dorthin.
  - Der Zoom bleibt bei Reiterwechsel, Spurwechsel, Schließen und Öffnen, Drehen, EDIT, GLOBAL, SEQ EDIT, Vocoder und Programmwechsel. Nur die Karte führt zur Gesamtansicht (hochkant in die Hälfte mit der Station). Hochkant wählt ein Tipp auf eine Kartenhälfte bzw. Wischen die Hälfte.
  - Zwei Regler mit zwei Fingern geben zwei Undos. Räder, Tastatur und ein Regler gehen gleichzeitig. Kein Lang-Druck mit Bedeutung, kein Pinch; bei `prefers-reduced-motion` keine Animation.
- [ ] **MK-P-09 Leistung.** Referenz = Chromium mit CPU-Drosselung × 4, DPR 3, 390 × 844 und 844 × 390, ein Projekt mit 4 Spuren spielt (2 MS-2000-Spuren mit Arp und Seq).
  - (a) **Aufbau** beim ersten Öffnen: Häppchen ≤ 16 ms, fertig ≤ 150 ms, kein `longtask` > 50 ms.
  - (b) **Bilder:** Eine Skript-Sitzung von 10 s (Gesamtansicht → 4 Regler drehen → Tipp-Zoom → alle 13 Halte mit ▶ und Wischen → Karte → EDIT-Seiten → Spiel-Ansicht) braucht laut Trace ≤ 16 ms Hauptfaden-Arbeit je Bild in ≥ 99 % der Bilder, keines > 33 ms; rAF-Intervall p95 ≤ 17,5 ms.
  - (c) **Layout:** 0 Layout-Ereignisse während Gleiten und Wischen; beim Drehen eines Reglers höchstens 1 Layout je Bild, begrenzt auf die Anzeige; das Lauflicht löst kein Layout aus.
  - (d) **Kein Layout-Sprung:** 0 `layout-shift`-Einträge über alle Zustandswechsel (MK-P-13).
  - (e) **Speicher:** Bedienfeld-Layer (CDP LayerTree) ≤ 48 MB bei z ≤ 1320 und DPR 3; außerhalb von Übergängen ≤ 2 eigene Layer.
  - (f) **Ton und Verbindung:** Keine Note später als beim Vorgänger-Stand (`noteLog`, M-ZEIT), `frames_ok`, kein Scheduler-Abstand > 50 ms; Paar-Raum-Ereignisse kommen während der Sitzung ohne zusätzliche Verzögerung an (Mitschnitt, ± 20 ms zum Vorgänger).
  - (g) **iPhone:** neuer Fall „Bedienfeld“ der Leistungs-Probe (dieselbe Skript-Sitzung über dem Fall „Kern“): rAF-Median ≥ 58 fps, 0 Lücken > 50 ms, `frames_ok`; Werte in CHANGES (FP-IPHONE).
  - Startzeit: Projekte ohne MS-2000-Spur ≤ +20 ms (EN3-14), mit MS-2000-Spur §15.3.
- [ ] **MK-P-10 Daten unverändert:**
  - Dieselben Änderungen über die Platte und über `mkSet` im Vorgänger-Stand ergeben deep-equal Sounds und Projekte.
  - `normalizeSound`, `normMk` und die Formate sind unverändert (Quelltext-Vergleich dieser Funktionen = 0).
  - Projekte und Bibliotheken des Vorgängers laden deep-equal. Alle Klang- und DSP-Tests aus MK1–MK7 bestehen unverändert, alle Klänge rendern bitgleich (B.6 Nr. 1).
  - Reine Ansichtswechsel ändern weder `soundHash` noch lösen sie Autosave aus. E1/E2-Pegel und Räder werden nicht gespeichert; bei 0 dB bitgleich.
- [ ] **MK-P-11 Aussehen** (gemessen am Bildschirmfoto):
  - Platte: Mittelwert Farbton 195–225°, Sättigung 10–35 %, Helligkeit 65–85 %. Bürstung sichtbar: Zeilen-Helligkeit streut 0,5–3 %.
  - Druck: Helligkeit ≤ 30 %, Kontrast ≥ 4,5 : 1. Inverse Felder weiß auf schwarz mit ≥ 7 : 1, an jeder Stelle der Tabelle und sonst nirgends.
  - Regler: Kappen L* ≤ 15 mit weißer Zeigerlinie und Skala (außer AUDIO IN 1); Mittelmarke genau an EG 1 INT, KBD TRACK, SEMITONE, TUNE und PAN.
  - Tasten hellgrau. LEDs rund, an im Farbton 0–35° (OCTAVE ±1 grün).
  - Anzeige 2 × 16 ohne Umbruch: Grund gelbgrün (Farbton 60–100°, Helligkeit 45–70 %), Zeichen dunkel (Helligkeit ≤ 25 %), Kontrast ≥ 4,5 : 1; beide Farben kommen nur aus `--mkp-lcd-fg/-bg`. Keine Holzwangen.
- [ ] **MK-P-12 Abbau und Umstellung:**
  - Kein DOM-Knoten und kein Quelltext des alten Bedienfelds bleibt übrig (Drehschalter, 7-Segment, Matrix, Holzwangen, Halb-Ansicht, Nummerntasten, SHIFT-Ebenen; Prüfung über Klassennamen).
  - CHANGES nennt jeden umgestellten Oberflächen-Test aus MK1–MK7 mit altem und neuem Weg. Alle Abnahmen aus MK1–MK7, die nicht die Oberfläche betreffen, bestehen unverändert.
  - B.6 Nr. 5 nutzt für das MS-2000-Bedienfeld M-VORLAGE und M-RAHMEN. Hilfe-Zeilen (L10) sind vollständig. Budget ≤ +28 KB netto.
- [ ] **MK-P-13 Fester Rahmen, kein Layout-Sprung** (M-RAHMEN; Xander 26.10.): In allen Formaten der Liste und über alle Zustandswechsel (Gesamtansicht ↔ Halt, ◀ ▶, Wischen, Karte, Hälften, Reiter GERÄT │ SPIEL │ FX, EDIT, GLOBAL, COMPARE, SEQ EDIT, Vocoder an/aus, Programmwechsel, Zusatz-Ansichten, Lauflicht an/aus, Wechsel zwischen zwei MS-2000-Spuren):
  - Das Rechteck des Rahmens und das des Blatts bleiben deep-equal (± 0 px); quer liegt der Rahmen in allen drei Reitern an derselben Stelle.
  - `document.scrollingElement.scrollHeight` und `scrollWidth` bleiben gleich; die Seite scrollt nie.
  - 0 `layout-shift`-Einträge (PerformanceObserver).
  - Nichts von der Platte zeichnet außerhalb des Rahmens (Bildvergleich der Fläche um den Rahmen vor und nach jedem Wechsel).
  - Hochkant bleiben Tastatur und Räder an ihrem Platz (0 px; strenger als die 2 px von M-ANSICHT).
- [ ] **MK-P-14 Lauflicht und SEQ EDIT** (HB-MS S. 16):
  - Programm mit SEQ ON, Taste gehalten, 120 BPM, Auflösung 1/16, LAST STEP 16: Die SELECT-LEDs leuchten 1 → 16 nacheinander, immer genau eine. Die leuchtende Taste gleicht in ≥ 99 % der Bilder dem klingenden Schritt (`mkScope().voices[].seqStep`, um die Ausgabe-Latenz versetzt), Abweichung höchstens 1 Bild. LAST STEP 8: nur 1–8. Typ Reverse, Alt 1, Alt 2: Reihenfolge nach A.6. REC bereit: das Lauflicht läuft. Ohne klingende Stimme bzw. bei SEQ OFF: wieder die Programm- bzw. Seiten-LED.
  - KEY SYNC „Stimme“ mit zwei versetzten Noten: Das Licht folgt der zuletzt angeschlagenen. Dual: das gewählte Timbre.
  - SEQ EDIT auf SEQ 1: Regler n ändert genau Schritt n (`mkGet`, ein Undo je Geste), in der Gesamtansicht und in den Halten 6, 7, 8, 10, 11 und 12. Die Kappen zeigen die Schrittwerte, ORIGINAL VALUE leuchtet am gespeicherten Schrittwert, die Anzeige zeigt „SEQ1 S05 …“. Mit dunklen SEQ-LEDs bearbeiten die Regler wieder ihre aufgedruckten Werte. Die Wahl ändert weder `soundHash` noch den Zoom.
  - Die Spiel-Ansicht zeigt dasselbe Lauflicht auf ihren Schritt-Tasten.
- [ ] **MK-P-15 Rein MS 2000** (Xander 26.10.):
  - TIMBRE SELECT schaltet nur T1 ↔ T2 (bei Single gesperrt mit Grund). Auf Platte und Seiten gibt es kein Edit Sync, kein Solo und keine Step-Arp-Schritte (Vorgabe H-18). Ein Testklang mit `arp.last`/`arp.steps` ≠ neutral spielt unverändert (bitgleich zum Vorgänger-Stand, B.6 Nr. 1).
  - Seitenplan, Tasten 1–16 und Aufdruck gleichen den Tabellen dieses Pakets (Prüfskript). Keine Bezeichnung des alten Bedienfelds steht in DOM, Hilfe oder LCD-Texten: EDIT-WAHL, SHIFT als eigenes Wort, die Taste SEITE, Matrix, Nummerntaste. Erlaubt bleiben der Geräte-Aufdruck FORMANT SHIFT und die LCD-Seiten samt SEITEN-SPRUNG (GLOBAL 1D); das Prüfskript nimmt genau diese aus.

**Tests.** `mkp-vorlage.mjs`, `mkp-bindung.mjs`, `mkp-seiten.mjs`, `mkp-ansicht.mjs` (Gesamtansicht, Hälften, Halte, Karte, Treffer), `mkp-rahmen.mjs`, `mkp-lauflicht.mjs`, `mkp-leistung.mjs`, `mkp-daten.mjs`, `mkp-marke.mjs`. Privat, nur im Scratchpad und nie in `bau/tests/` oder im Repo: der Bildvergleich `mkp-bildvergleich.py`, weil er die Zeichnung aus dem Handbuch liest (E.5 Nr. 5). Die Lage-Tabelle und die Halte-Tabelle enthalten nur Lagen und Aufdruck-Wörter (Fakten) und dürfen in die öffentlichen Tests.

**Fach-Prüfung:** **FP-TOUCH ●** Haupt-, **FP-IPHONE** und **FP-SICHER** Zweit-Blick.

**Zwischenstand** nach MK-P (Artifact und Pages, EN3-17), damit Xander das Gerät sieht.

**iPhone** (Xander, 12 Pro Max):
1. Eine MS-2000-Spur öffnen und das iPhone quer halten: Ist das dein Gerät (Anordnung, Farbe, Anzeige)? Ohne zu zoomen CUTOFF drehen und ARP ON/OFF tippen.
2. Den Titel FILTER antippen: Der Zoom gleitet hinein und bleibt. Mit ▶ oder Wischen weiter zu AMP, EG 1/EG 2 … bis VIRTUAL PATCH, dann oben die Karte antippen: wieder die ganze Platte. Springt irgendwo die Seite?
3. Hochkant: die Hälften wechseln (Wischen oder Karte), CUTOFF fein drehen (seitlich wegziehen).
4. Reiter SPIEL: PITCH- und MOD-Rad und Tastatur spielen, OCTAVE, ARP ON/OFF, LATCH; ab MK8 mit BANK und den SELECT-Tasten Programme wählen.
5. EDIT, dann SELECT 6 (FILTER): mit PAGE, CURSOR und −/+ durch die Seiten, EXIT.
6. MOD SEQUENCE ON/OFF, eine Taste halten: Laufen die SELECT-Tasten mit? Dann SEQ EDIT SELECT: Die 16 Regler setzen die Schritte.
7. Leistungs-Probe „Bedienfeld“ schicken.

**Geräte-Abgleich:** entfällt (kein Gerät, EN3-16). Lage und Aufdruck belegt die Zeichnung HB-MS S. 5. Farben, Material und Anzeige-Farbe sind eK und liegen in Variablen; eine Änderung nach Xanders Blick ist ein `MK-P-fix`.

**Risiken.**
- **Farben ohne Beleg:** Die Zeichnung ist schwarz-weiß. Platte und Anzeige-Farbe sind eK und liegen deshalb gesammelt in Variablen.
- **Kleine iPhones:** Die Gesamtansicht hat auf P2 und P3 nur 25 bzw. 22 px Spaltenabstand; dort ist der Zoom der Arbeitsweg. Auf dem 12 Pro Max sind es quer 39 px, hochkant 40 px.
- **Kopfzeile quer:** Das MS-2000-Blatt verdeckt quer die App-Kopfzeile und die Tastatur. Der Song-Start bleibt über ▶/■ in der Kopfzeile, die Tastatur über den Reiter SPIEL (H-17).
- **Halte am Plattenrand:** Halte an den Rändern der Platte (z. B. 1, 12 und 13) zeigen neben der Platte Rahmengrund, weil die Station mittig bleibt.
- **iOS-Safari:** Verkleinerte Schrift kann unscharf werden, und große Layer kosten Speicher. Abhilfe: Aufbau im größten Maßstab, `will-change` nur im Übergang (MK-P-09 e).
- **Paralleler Bau:** MK8 ändert die Programm-Wahl. Die Regel in Teil G Nr. 18 legt fest, wer anpasst; das Zusammenführen kostet ≈ 0,5–1 h.
- **Umstellung der Tests:** Die Oberflächen-Tests aus MK1–MK7 werden umgestellt; eingeplant sind 2,5–3 h im Bau-Abschnitt 2.
- **Größe:** Mit dem üblichen Überzug (× 1,22 bis × 1,5) kostet das Paket ≈ +34 bis +42 KB.

---

## Teil D — Aufnahme-Anleitung für die Speicherwellen (ruht mit MK10)

Die Anleitung für Xander (Gerät → AG06 → iPhone, Aufnahme in der App, Ersatzweg GarageBand, Abgabe des Wellen-Pakets) gehört zu MK10 und ruht mit ihm: Es gibt kein Gerät (Xander, 26.10.). Sie steht vollständig in der Sicherung `scratchpad/rev1-tools/n3-vor-pure.md.bak` (Teil D.1–D.7) und wird erst wieder eingesetzt und am dann vorhandenen Gerät geprüft, wenn MK10 gebaut wird.

---

## Teil E — Reihenfolge, Versionen, Budgets, Größe

### E.1 Pakete (verbindlich; ergänzt N2 Teil E und den „Nachtrag zur Reihenfolge“)

Lage: Die MK-Gruppe begann nach V2e′ (4.8.0) mit MK0 (4.8.1); MK1–MK7 folgten als 4.9.0–4.15.0, und MK5–MK7 sind in 4.15.0 zusammengeführt (3 017 704 B). VS3 wartet weiter auf das Tor N7V-12 (`fragen-xander-9.md`). **Rev. 3 (26.10.):** MK11–MK13 sind gestrichen, MK10 ist zurückgestellt, MK8 ist neu der Programm-Speicher A–H × 16, und MK-P bringt Gesamtansicht, Halte, Karte, festen Rahmen und Lauflicht. MK-P und MK8 werden parallel gebaut; ihre Versionen folgen der Lieferreihenfolge.

| Paket | Titel | Version | KB | h | braucht | Format | Stand / Zwischenstand |
|---|---|---|---|---|---|---|---|
| MK0 | Vorab-Schutz: Klänge neuerer Engines bleiben | 4.8.1 | +4 | 2–3 | V2e′ | 4 | ✓ gebaut |
| MK1 | Klangkern T1, erstes Bedienfeld, Räder, Leistungs-Probe | 4.9.0 | +115 | 19–22 | MK0, V4a (SXF) | **4 → 5** | ✓ gebaut · Stand |
| MK2 | Alle Oszillator-Arten, PATCH 1–4, 64 nachgezeichnete Speicherwellen | 4.10.0 | +42 | 7–8 | MK1 | 5 | ✓ gebaut |
| MK3 | Zwei Timbres, Split, Stimmung | 4.11.0 | +33 | 7,5–8,5 | MK2 | 5 | ✓ gebaut |
| MK4 | Mod-FX, Delay, EQ | 4.12.0 | +25 | 5–6 | MK2 | 5 | ✓ gebaut · Stand |
| MK5 | Arpeggiator | 4.13.0 | +33 | 7,5–8,5 | MK3 | 5 | ✓ gebaut |
| MK6 | Mod-Sequenzer 3×16 | 4.14.0 | +36 | 8–9 | MK2, MK3 | 5 | ✓ gebaut |
| MK7 | Vocoder 16 Bänder, Eingänge | 4.15.0 | +52 | 11–12 | MK2, MK3, MK4, VS1 ✓ | 5 | ✓ gebaut, MK5–MK7 zusammengeführt · Stand (Pages) |
| **MK-P** | Bedienfeld wie der MS2000: Platte, Gesamtansicht, Halte, Karte, fester Rahmen, Lauflicht | **4.16.0** | +28 | 21–25 | 4.15.0 ✓ | 5 | offen · **Stand** |
| **MK8** | Programm-Speicher A–H × 16, 128 eigene Werksklänge | **4.17.0** | +60 | 13–15 | 4.15.0 ✓; Programm-Wahl an MK-P (Teil G Nr. 18) | 5 | offen · **Stand** |
| ~~MK9~~ | Import eigener Programme (MS2000, microKORG; lokal) — **zurückgestellt** (EN3-21) | – | (+27) | (6–7) | MK7 | 5 | Tor MK9-T; außerhalb der Folge, nicht in der Summe |
| ~~MK10~~ | Eigene Wellen-Aufnahmen — **zurückgestellt** (kein Gerät) | – | (+80) | (10,5–12) | MK2, MK7, MK8 | 5 | außerhalb der Folge, nicht in der Summe |
| **Summe** | 10 Pakete (MK9, MK10 zurückgestellt; MK11–MK13 gestrichen) | 4.8.1, 4.9.0–4.17.0 | **+428** (offen +88) | **≈ 101–117** (offen 34–40) | | einmal | |

- **Versionen:** Von MK-P und MK8 bekommt das zuerst ausgelieferte Paket 4.16.0, das andere 4.17.0 (Vorgabe MK-P zuerst, E.2 Nr. 2). Die Versionen steigen streng (EN2-14); der Orchestrator trägt die vergebenen Nummern hier und in CHANGES ein. Der Supabase-Wächter (`max_app` 4 021 000, `max_format` 5; von Xander am 25.10. gesetzt) deckt beide ab, es braucht keinen Server-Schritt.
- **Rev. 3 gegenüber dem Stand mit MK-P (26.10. vormittags):** MK11–MK13 gestrichen (−57 KB, −14,5–17,5 h), MK10 zurückgestellt (−80 KB, −10,5–12 h), MK8 mit 128 statt 64 Klängen und Programm-Speicher (+20 KB, +5–6 h), MK-P mit festem Rahmen quer, Gesamtansicht, Halten, Karte und Lauflicht (+3 KB, +2–2,5 h). Summe 10 statt 14 Pakete, +428 statt +542 KB, ≈ 101–117 statt 119–138 h (dort stand 138,5; die Paketzeilen ergaben 138). Frühere Stände: Rev. 1 +463 KB, Rev. 2 +510 KB, mit Nachzeichnung +517 KB (Protokolle am Ende).
- **Tore** (E.5 Nr. 3 sinngemäß): MK9 und MK10 sind zurückgestellt, nicht nur verschoben; sie halten nichts auf. Werden sie später gebaut, bekommen sie die nächste freie Nummer in Bau-Reihenfolge; MK9 braucht vorher sein Tor MK9-T, MK10 ein Gerät und Teil D aus der Sicherung.
- **Fach-Prüfung:** 1–2 h je Paket (EN2-29); offen 2 × 1–2 h.
- **Gesamtdauer** ≈ 111–137 h inkl. Fach-Prüfung (10 × 1–2 h); offen ≈ 36–44 h (MK-P 22–27 h, MK8 14–17 h).

### E.2 Begründung der Reihenfolge

1. **MK0–MK7 sind gebaut:** Klangkern, alle Oszillatoren, zwei Timbres, Effekte, Arpeggiator, Mod-Sequenzer und Vocoder. MK0 lief vor MK1, damit beim ersten Format-5-Speichern jeder neuere ausgelieferte Stand AM-Sounds unverändert lässt.
2. **MK-P zuerst** (Vorgabe): Xander will das Gerät sehen und bedienen, und MK8 wählt seine Programme über BANK ▼ ▲, SELECT 1–16 und WRITE der Platte. MK-P berührt keinen Klang und darf parallel zu MK8 laufen; wer später zusammenführt, passt nach Teil G Nr. 18 an.
3. **MK8** steht nach allen Klang-Bausteinen, damit kein Werksklang eine „Annäherung“ braucht. Gleiches Prinzip wie V10P (N2 EN2-10).
4. **Zurückgestellt:** MK9 (kein Rechner, kein MIDI, keine Dateien; EN3-21) und MK10 (kein Gerät, 26.10.). **Gestrichen:** die RADIAS-Pakete (Xander, 26.10.: nie gewollt).

### E.3 Größe und Startzeit (EN2-28)

Grundlage: **4.15.0 = 3 017 704 B** (gemessen, `scratchpad/mk-wt/index.html`), danach die Budgets von MK-P (+28 KB) und MK8 (+60 KB), dann VS3 und der Restplan aus N2 E.4 mit den +12 KB aus H-9. MB = 10⁶ B, KB = 1024 B. Rechnung `scratchpad/rev1-tools/pure/size4.py` (Restplan wie `size2.py` und `size3.py`); das Skript trägt MK-P noch mit +27 KB, die Tabelle ist mit +28 KB gerechnet (Unterschied nur bei ×1,22: 4,5 MB bei V8b statt V9a).

**Ist-Faktor:** V2e, V2e′ und MK0–MK7 hatten zusammen 435 KB Budget; die Datei wuchs von 4.6.0 (2 473 307 B) bis 4.15.0 um 532 KB, mit allen Fix-Schritten (**×1,22**). Die frühere Planungsgrundlage ×1,5 (aus V0b … V2d′) bleibt die vorsichtige Spalte, weil sie die Grenze schützt; ×1,22 ist die Schätzung aus der MK-Gruppe.

| Stand | nach Budget | ×1,22 | ×1,5 |
|---|---|---|---|
| 4.15.0 (gemessen) | 3,02 MB | 3,02 MB | 3,02 MB |
| nach MK-P | ≈ 3,05 MB | ≈ 3,05 MB | ≈ 3,06 MB |
| nach MK8 | ≈ 3,11 MB | ≈ 3,13 MB | ≈ 3,15 MB |
| nach VS3 | ≈ 3,14 MB | ≈ 3,17 MB | ≈ 3,21 MB |
| 4,5 MB erreicht bei | V9e | V8b | V7c |
| 5,0 MB erreicht bei | V10f | V10a | V4e |
| **Planende** (alle übrigen Pakete aus N2 E.4) | **≈ 5,53 MB** | **≈ 6,08 MB** | **≈ 6,78 MB** |
| dazu MK9 (+27 KB), falls später gebaut | +0,03 MB | +0,03 MB | +0,04 MB |
| dazu MK10 (+80 KB), falls später gebaut | +0,08 MB | +0,10 MB | +0,12 MB |

- Die MS-2000-Pakete selbst bleiben weit unter der Grenze (nach MK8 ≈ 3,1–3,2 MB). Die Grenze von 5,0 MB fällt aber mitten im Restplan: nach Budget bei V10f, mit ×1,5 bei V4e. Gegenüber Rev. 2 (Planende 7,04 MB mit ×1,5) sind es ≈ 0,26 MB weniger, weil MK10–MK13 entfallen und der gemessene Stand unter der ×1,5-Prognose liegt.
- **Startzeit:** Projekte ohne AM bleiben bei ≤ +20 ms (EN3-14, MK1-26). Je Paket gilt §15.3 (≤ +150 ms gegen das Vorgänger-Paket, absolut ≤ 1,5 s ohne bzw. ≤ 4 s mit Drosselung ×4). MK8 entpackt seine Werksdaten je Bank erst bei Bedarf (MK8-08).
- **Ab 4,5 MB** nennt jedes Paket Größe und Startzeit (EN2-28); mit ×1,5 ist das ab ≈ V7c. Lösung nach **H-1** (entschieden: b) = SL1 (E.3a).

### E.3a SL1 — Schlankheits-Paket (H-1 (b), entschieden 25.10.; kein MK-Paket, gehört in N2 E.4)

- **Auslöser:** wie EN2-28 die gescheiterte Startzeit-Abnahme, zusätzlich spätestens, wenn ein Stand 4,5 MB erreicht (mit ×1,5 ≈ V7c, nach Budget ≈ V9e). Der Orchestrator trägt das in N2 (EN2-28, E.5 Nr. 8) nach.
- **Umfang:** Das Sparziel wird an der dann aktuellen Datei gemessen und in CHANGES festgelegt. Die `text/plain`-Blöcke (Worklet, `sq-mk-src` mit Werksdaten und Wellen-Datenblock) gepackt ausliefern und bei Bedarf entpacken; das Worklet spart so heute ≈ 78 KB. Für ≥ −1 MB braucht es den Haupt-Skriptteil als gzip + Base64 mit kleinem Start-Lader (`DecompressionStream`, dann `eval`).
- **Abnahme:** Verhalten bitgleich (alle Regressionen der gebauten Pakete), Startzeit nach §15.3 am iPhone gemessen (Median aus 5) nicht schlechter als vorher, Dateigröße ≤ Sparziel, keine Konsolenfehler, Worklet-ASCII.
- **Dauer** 5–7 h · **Version** die nächste freie Nummer beim Bau · **Budget** negativ (Sparziel).

### E.4 Versionsnummern der Pakete danach

Die Pakete nach der MK-Gruppe (V2a′, V2f, VL, V7a, VC2a, VS4 …) bekommen ihre Nummern **ab 4.18.0** in Bau-Reihenfolge (Rev. 3: MK10–MK13 entfallen, MK-P und MK8 sind 4.16.0 und 4.17.0). Ein später doch gebautes MK9 oder MK10 nimmt die nächste freie Nummer in Bau-Reihenfolge. Die Tabelle N2 E.4 schreibt der Orchestrator dort fort; das ist keine Änderung des Umfangs.

**VS3** (Tor N7V-12): Wird VS3 gebaut, bevor MK-P und MK8 ausgeliefert sind, bekommt es eine Zwischennummer nach dem zuletzt ausgelieferten Stand (z. B. 4.15.1), damit MK-P und MK8 bei 4.16.0 und 4.17.0 bleiben. Später gebaut, bekommt es die nächste freie Nummer.

### E.5 Regeln für den Bau (ergänzt N2 E.5)

1. **Bau-Ort** (wie EN2-17): Dieser Nachtrag, HB-MS (privat, nur lesen), für MK-P die Zeichnung `scratchpad/ms2000-panel/ms2000-front.png` und die Mess-Skripte `scratchpad/mkp-tools/` (privat wie die Handbücher), KF, `fragen-xander-9.md` und die Fehler-Liste `v3-ideen/typische-fehler.md` (jeder Punkt wird vor „fertig“ selbst geprüft). HB-MK nur für die Namensprüfung (EN3-07) und einen späteren Import (MK9). Fehlt etwas, wird das Paket bzw. der Abschnitt nicht begonnen.
2. **Rollout** (N2 G.8): `max_format` 5 und `max_app` 4 021 000 sind online (Xander, 25.10.) und decken 4.16.0 und 4.17.0 ab. Weitere Server-Schritte nur mit Xanders ausdrücklichem Okay je Schritt, nie im Klassenzimmer-Projekt, nie am Webseiten-Repo (EN2-32).
3. **Zwischenstände** nach EN3-17 (nach MK-P und nach MK8) auf die Artifact-Adresse, die Pages-Seite und den githack-Spiegel (EN2-15).
4. **CHANGES** je Paket: Messwerte der Abnahme, Node- und Chromium-CPU (als Vielfaches der VA-Stimme, dazu absolut), Größe, Startzeit (ab 4,5 MB Pflicht), Fach-Prüfung, iPhone-Punkte, Lücken, der Vorgänger-Stand (Version) für alle „bitgleich“-Abnahmen. Liegt ein MK-Paket > 50 % über seinem Budget, nennt CHANGES das mit einem Schlankheits-Vorschlag (N2 §15.3-Regel).
5. **Werksnamen privat:** Die Werksnamen-Listen (EN3-07) liegen nur in `scratchpad/manuals/werksnamen.local.json`. `wip-push.sh` und die Auslieferung kopieren sie nie. Eine Prüfung sucht 3 Werksnamen als Stichprobe in `bau/tests/` und im Repo (0 Treffer). Ebenso privat bleiben die Zeichnung und das Überlagerungsbild aus MK-P, die Bild-Referenz (PDF) und die Dateien der Nachzeichnung (sie tragen die Wellennamen); in die App kommt nur der Datenblock aus MK2, ohne Namen. Wird MK10 gebaut, gilt dasselbe für das Wellen-Paket und alle Aufnahmen. **Diese Spec** bleibt im Repo gesichert, wie bisher in `origin/arbeitsstand` (Xanders Regel „nie Arbeit verlieren“, 25.10.; frühere Frage H-12 entfällt): Sie enthält nur Parameter-Fakten (Namen, Bereiche, Seitenangaben), keine Textpassagen aus den Handbüchern.

---

## Teil F — Fach-Prüfung (ergänzt N2 Teil J, J.3; ● = blockierend)

| Gruppe | Paket | Haupt-Blick | Zweit-Blick | Stand |
|---|---|---|---|---|
| G-MK1 | MK0 ● | FP-SICHER | FP-DSP | ✓ |
| G-MK1 | MK1 ● | FP-DSP | FP-TOUCH, FP-IPHONE | ✓ |
| G-MK1 | MK2 | FP-DSP | FP-KLANG, FP-SICHER | ✓ |
| G-MK1 | MK3 ● | FP-DSP | FP-TOUCH | ✓ |
| G-MK1 | MK4 | FP-DSP | FP-IPHONE | ✓ |
| G-MK2 | MK5 ● | FP-SONG | FP-TOUCH | ✓ |
| G-MK2 | MK6 | FP-DSP | FP-SONG | ✓ |
| G-MK2 | MK7 ● | FP-DSP | FP-IPHONE, FP-SICHER | ✓ |
| G-MKP | MK-P ● | FP-TOUCH | FP-IPHONE, FP-SICHER | offen |
| G-MKP | MK8 ● | FP-KLANG | FP-TOUCH | offen |
| – | MK9 ● (zurückgestellt) | FP-SICHER | FP-DSP | erst beim Bau |
| – | MK10 (zurückgestellt) | FP-DSP | FP-IPHONE, FP-SICHER | erst beim Bau |

Zusätzlich prüft **FP-DSP in jedem MK-Paket mit Klang-Änderung**:
- die W-Tabelle gegen den Code (eine Quelle, keine Schatten-Kurven);
- „Aus = bitgleich“ gegen den Vorgänger-Stand (B.6 Nr. 1);
- NaN/Inf bei Extremwerten (alle Regler auf Anschlag, Resonanz 127, Rückkopplung 127, 20 s);
- **Filter-Stabilität** (B.6 Nr. 10): W-29 mit C1 127 / C2 127 bei C8 und der Vocoder mit FC-MOD von einem 50-Hz-LFO voller Tiefe, je 20 s mit −6-dBFS-Rauschen: kein NaN/Inf, Spitze ≤ +6 dBFS;
- **Denormale** (B.6 Nr. 11): 60 s Stille nach Vollaussteuerung durch jeden neuen Filterweg; jedes 1-s-Lastfenster ≤ 1,1 × der ersten stillen Sekunde (Node, x86);
- gefaltete Energie nur nach B.6 Nr. 12;
- Worklet-ASCII.

In MK-P und MK8 prüft FP-DSP nur „Klang unverändert“ (MK-P-10) bzw. die Pegel (MK8-04).

**FP-SICHER** prüft in MK0, MK1, MK2, MK7 und MK-P (und in MK9 bzw. MK10, falls sie gebaut werden) das Markenwort-Verbot (B.6 Nr. 9 a, b und c: genau eine Fundstelle „MS 2000“, kein Logo, keine Korg-Schrift) und die Upload-Wege; in MK2 zusätzlich, dass der Datenblock nur gerechnete Teiltonwerte ohne Namen enthält und weder Bild noch PDF in Repo oder App kommt; in MK-P, dass Zeichnung und Überlagerungsbild privat bleiben; ab MK9 auch EN3-08a und MK-R2.

**FP-TOUCH** prüft ab MK-P M-VORLAGE gegen die Lage-Tabelle, M-RAHMEN, die Treffer-Regel, die Halte und den Bildvergleich MK-P-02; in MK8 die Programm-Wahl und die Platzwahl bei WRITE.

---

## Teil G — Hinweise und Pflichten für andere Pakete (wo sich Umfang oder Abnahme ändert, steht es beim Punkt)

1. **VK** (N1 A.10), Punkte 5–6 (Osz.-FM, Ringmod): dürfen den AM-Code (PM-Pfad aus MK2, Ringmodulator aus MK1) mitbenutzen, statt neu zu bauen. Die Abnahmen VK-06, VK-07 bleiben.
2. **VK2** (N2 D.6.4), Punkte 1–2 (Phaser, Flanger als Spur-Effekt): dürfen die Formeln (W-31) und die Prüfskripte aus MK4 mitnutzen. Der Effektkern von MK4 sitzt aber im AM-Zweig des Worklets. VK2 braucht einen eigenen nativen oder Spur-Worklet-Einschub (`fx.phaser`, `fx.flanger`, `fx.crush`), der auch für Drums und ohne AudioWorklet geht (FX-Block „native Web Audio nodes only“, Z. 9423; `buildChain` Z. 12013). Die Abnahme bleibt.
3. **VI2a** („Arp mit ZUFALL“): Der Arp-Kern aus MK5 ist engine-frei gebaut. VI2a entscheidet, ob es ihn für andere Engines nutzt.
4. **MOD-R1/PAD-R1: V5d, V5b/c, V6a, V1d, VC4** (H-9 = ja, entschieden 25.10.; EN3-18). **Umfang und Abnahme ändern sich:** V5d-01 deckt auch die `mk`-Pfade beider Timbres mit neuen DST-Nummern ab (heute fest bis `NDST` 22, Z. 3560–3561); V5b/c nehmen die AM-Pfade in Stränge und LOCK auf; V6a interpoliert Ganzzahl-Pfade und schaltet Listen am Ende des Bereichs (Nr. 5); V1d-02 nimmt AM als Pad-Quelle auf; VC4-02 nimmt das AM-Schema auf (Eingabe „Pfade aus MODT“). Mehrbedarf in N2 E.4 (Schätzung): V5d +2 h/+6 KB, V6a +1 h/+2 KB, V5b/c +0,5 h/+1 KB, V1d +1 h/+2 KB, VC4 +0,5 h/+1 KB, zusammen ≈ +5 h und +12 KB.
5. **V6a** (Klangzustände/Morph; H-9 = ja): AM-Werte werden als Ganzzahlen interpoliert. Listen und Schalter wechseln am Ende des Bereichs (KZ3).
6. **V7a** (Mix): Der Eingangs-Abgriff der AM-Spuren (vor Vol/Pan, MK7) behält nach dem Umzug des Faders in `track.mix` seine Bedeutung; „Quelle nur als Eingang“ trennt weiter `post` von Master und Sends.
7. **VS3, VS4**: Version nach E.4. Der Vocoder (MK7) speichert keine Takes. VS3 und VS4 nutzen den gemeinsamen Mikrofon-Abgriff aus MK7; ist VS3 vorher gebaut, stellt MK7 es darauf um (MK7-14). Mit VS3 kann der Modulator später ein Take sein, das ist nicht im Plan.
8. **N2 E.4**: MK0 = 4.8.1, MK1–MK7 = 4.9.0–4.15.0 (gebaut), MK-P und MK8 = 4.16.0 und 4.17.0 (Lieferreihenfolge), danach ab 4.18.0 (E.4); MK9 und MK10 zurückgestellt, MK11–MK13 gestrichen. Die Größen-Prognose ändert sich nach E.3; SL1 (E.3a) kommt als Paket dazu (H-1 = b).
9. **Tabellen-Bau (Spec §10.1; V8a, V4e, V9a):** Der gemeinsame, DOM-freie Tabellen-Bau `mkTables` aus MK2 (Häppchen ≤ 8 ms, MKW-Tabelle im `AudioWorkletGlobalScope`, Kopie je Knoten als Rückfall) ist der Bau nach §10.1. V8a, V4e (statt „aus dem Tabellen-Bau von V8a“, N2 K2-40) und V9a nutzen ihn. Der Tabellenspeicher wird zusammen geprüft: MK2-08 ≤ 16 MB plus der V8a-Pool ≈ 8 MB. `eng 2` bleibt die Tabellen-Engine von V8a; AM ist `eng 3`.
10. **MK-R2 (EN3-19): VO3, VO4a–c, VC2b, VC2c, VC3, VC3b, VC4** (auch `sample` und `room.sendToClaudeSession`): **nur, wenn sie nach einem gebauten MK9 kommen** (MK9 ist zurückgestellt), rufen sie in jedem Weg vom Gerät weg `mkLocalStrip` auf, mit der Abnahme-Zeile (FP-SICHER): Ein 🔒-Sound mit Marker-Werten ergibt 0 Treffer im Mitschnitt aller Requests und Frames. Vor MK9 gibt es keine 🔒-Sounds und keine Pflicht; ein später gebautes MK9 rüstet die dann vorhandenen Wege selbst nach.
11. **Vocoder und Formant (Spec §18, N2 EN2-26, D.9):** MK7 liefert den Vocoder der VI-Stufe E; §18 behält nur „Vocoder für andere Engines“. Der Formant VOKAL aus §18 und der FM-FORMANT-Operator nutzen W-44 (Vokal-Quelle aus MK7).
12. **V9d** (Resynthese, Quellen DATEI, Original lokal): Ist MK10 vorher gebaut, nutzt V9d dessen WAV/AIFF-Leser und den lokalen Speicher (eigene IndexedDB-Datenbank). Solange MK10 ruht, baut V9d beides selbst, wie in N2 geplant (kein Mehrbedarf gegenüber N2).
13. **VI1a** (Instrument-Vorlagen, Front-Rahmen): nutzt die Bausteine von MK-P (Metallplatte, Kappen-Regler mit Skala, LED-Tasten, LCD 2 × 16, Gesamtansicht mit Treffer-Raster, Halte, Karte, fester Rahmen) und baut fehlende Elemente selbst, keine zweite Bauart derselben Elemente. Die Bausteine des alten Bedienfelds (Drehschalter, 7-Segment-Anzeige, Holzwangen) gibt es nach MK-P nicht mehr.
14. **V8a, V9a, V9b, V9d′** (Engines `mask`, `add`, `body`, `resyn`): brauchen keinen Formatsprung; MK0 hält unbekannte Engines undurchsichtig (EN3-04).
15. **V10P, V10d, VI3** (Geräte im ⓘ nach N2 D.1 Nr. 4): Die Markenwort-Prüfung B.6 Nr. 9 (a) gilt nur im AM-Teil, (b) über die ganze Datei nur für microKORG, RADIAS, DWGS und jede Schreibung von „MS 2000“ außer der einen Konstante `MK_LABEL`. Diese Pakete scheitern daran nicht, dürfen aber den Modellnamen MS2000 nicht im ⓘ nennen.
16. **Tastatur und Spielfeld (`#kbArea`):** Bei AM-Spuren sitzen PITCH- und MOD-Rad links in der Tastatur-Zeile (MK1; quer im MS-2000-Blatt im Reiter SPIEL, MK-P). Jedes spätere Paket, das `#kbArea` umbaut (z. B. Pads, Akkord-Tasten, Instrument-Vorlagen), behält diesen Platz und die Regel „nur bei AM-Spuren“; seine M-PLATZ-Prüfung läuft auch mit einer AM-Spur.
17. **Engine-Kopf (alle Pakete mit Blattkopf):** Die Engine-Wahl zeigt „MS 2000“ aus `MK_LABEL`; wer den Kopf ändert, prüft das Breiten-Budget aus B.3 „Rahmen“ mit dieser Beschriftung. Quer im MS-2000-Blatt liegt die Engine-Wahl unter ⋯ (MK-P, H-17).
18. **MK-P und MK8 (parallel):** Wer nach dem anderen zusammenführt, passt an.
    - Kommt **MK-P zuerst** (Vorgabe), bindet MK8 die Programm-Wahl direkt an BANK ▼ ▲, SELECT 1–16, −/NO +/YES und WRITE der Platte und ergänzt WERKSKLANG ZURÜCK auf den Seiten 26 und 20 UTILITY.
    - Kommt **MK8 zuerst**, wählt es Programme bis MK-P nur über die Bibliothek (Filter „MS 2000“, Chip „Bank ▾“) und ‹ › im Blattkopf; das alte Bedienfeld bekommt keine neuen Teile. MK-P bindet die Programm-Wahl dann an die Platte und stellt die Wahl-Tests von MK8 um (≈ 0,5–1 h).
    - `bank` (1…8 = A…H) und `slot` (1…16) bleiben in beiden Fällen unverändert.

---

## Quellen

**Gelesen für diesen Nachtrag (25.10.2026):**
- HB-MS, `scratchpad/manuals/ms2000.txt`:
  - S. 2–4 (Aufbau), S. 16–17 und S. 25–26 (Mod Sequence, Motion Rec, externer Eingang, Vocoder)
  - S. 34–52 (alle Programm-Parameter einschließlich Vocoder und Utility), S. 53–57 (Global)
  - S. 60–66 (NRPN-, CC- und Werte-Tabellen: Gate, Step Length, Sync Note, Resolution, DWGS-Control-2, OSC2 Semitone), S. 67–69 (Programmliste, nur für die Namensprüfung)
- HB-MK, `scratchpad/manuals/microkorg.txt`:
  - S. 8–11 (Programme, Bänke, Performance Edit, Vocoder, Step-Arp), S. 16–30 (Synth-Parameter)
  - S. 31–38 (Vocoder, Tab. 6-1), S. 39–45 (Effekte, Arpeggiator), S. 47 (Global), PDF 77 (Voice Name List, nur für die Namensprüfung)
- KF `/home/user/synquenzer/forschung/r9/korg-familien.md` (vollständig).
- N2: Kopf und N2.0.3 (EN2-01 … EN2-32), A.6, D.5, D.6.4, D.9, E.4, E.5, Teil J, Revisions- und Review-Protokolle, „Nachtrag zur Reihenfolge“ mit Synth-Plan. N1: A.10 (VK), EN-21 (MOD-R1). Spec v3: L1–L10, §0.3/§0.4, §1.3, §15, Anhang C.
- `v3-ideen/fragen-xander-9.md`. `CHANGES-V3.md` (Stand bis V2d′ 4.6.0, VS0, VS1, Größe, Rollout).
- App 4.6.0 (`dirigent-wt/index.html`), gezielt gelesen:
  - Worklet-Kopf, Konstanten, `defaults`, `envCoefs`, `class Voice`, `lfoVal`
  - `normSynthP`, `normalizeSound`, `AN`, `SRC`/`DST`, `CHORUS`, `ENGINES`
  - `buildChain`, `buildTrack`, `syncEngine`, `wkFlat`, `newEngine`, `newSynthTrack`
  - `buildSynthEd`, `sheetFrame`, `fillSynthTab`, `pageOsc`, `PD`
  - `importProject`-Warnungen, `APP_CODE`, `spawnVoice`, `LOOKAHEAD`, `importSyx`, Mikrofon-Worklets
  - Suche nach Markenwörtern (0 Treffer)

**Zusätzlich gelesen für Rev. 2 (25.10.2026):** HB-MK S. 2–3 (Vorderseite, Bedienelemente; in der Nachprüfung auch die Strichzeichnung der Vorderseite, PDF 8–9, im Speicher als Text-Raster ausgewertet, ohne Bild-Datei), S. 8–14 (Programme, Performance Edit, Step-Arp, Edit Sync, Solo), Parameter-Liste und SHIFT-Funktionsliste (PDF 78). App 4.6.0: Raster `#app` je Ausrichtung (Z. 57–90), Blattkopf und Leiste quer (Z. 1426–1441), `#kbArea` (Z. 3494), `MIC_ASK` (Z. 29401), `tr.kbOct` (Z. 11491, 18917), `ENGINE_LABEL` (Z. 11162), `sheetFrame` (Z. 20260).

**Eigene Rechnungen:** Größen-Prognose E.3 (Python über die Budgets aus N2 E.4 und die Dateigröße 4.6.0; Rev. 1 neu mit Reihenfolge N3.0.1 Nr. 6 und den Faktoren ×1,3/×1,5, `scratchpad/rev1-tools/size2.py`). Seitenzuordnung der Handbuch-Texte (Seitenumbrüche im Text gezählt, gedruckte Seite = PDF − 6; Hilfsdateien danach gelöscht).

**Gelesen für MK-P (26.10.2026):** HB-MS S. 5 (PDF 11, Strichzeichnung der Vorderseite, vermessen mit `scratchpad/mkp-tools/lines.py` und `grid.py` am Ausschnitt `scratchpad/ms2000-panel/ms2000-front.png`), S. 6–9 (PDF 12–15, Bedienelemente, Räder), S. 13 (Programm-Wahl, OCTAVE-LEDs), S. 15 (Arp-Tasten), S. 16 (SEQ EDIT und die 16 Regler), S. 18–19 (LCD Edit, Seiten zu den Tasten 1–16, Compare). App-Hauptlinie `scratchpad/mk-wt/index.html` (4.12.0): Block `sq-mk-src` (Bedienfeld-Code MK1–MK4), `MKUI.panelInfo`, `MK_LABEL`, `ctlPrecision` (Fein-Regel).

**Gelesen für Rev. 3 (26.10.2026):** HB-MS S. 2 und S. 13 (128 Programme, Bänke A–H × 16, BANK und OCTAVE), S. 15–16 (Mod Sequence: Lauflicht der SELECT-Tasten, SEQ EDIT mit den 16 Reglern, ORIGINAL VALUE), S. 7 und S. 19 (TIMBRE SELECT schaltet zwischen den zwei Timbres), S. 25–26 (Sequenz einstellen und aufnehmen), Voice Name List (nur Kategorie und Modus je Platz, keine Namen), technische Daten (LCD 16 × 2 Zeichen mit Hintergrundbeleuchtung). `fragen-xander-9.md` (Xanders Aussagen vom 26.10.), `v3-ideen/typische-fehler.md`. App 4.15.0 (`scratchpad/mk-wt/index.html`): Größe, `#app`-Raster quer (Kopf 44 px, Tastatur 110 px bei offenem Blatt), Blattkopf quer (40 px), `vmax` in `normMk`, Solo im Bedienfeld. **Eigene Rechnungen:** Halte und Maßstäbe je Format (`scratchpad/rev1-tools/pure/stations2.py`), Größen-Prognose ab 4.15.0 (`scratchpad/rev1-tools/pure/size4.py`).

**Nicht möglich:** Korg „MIDI Implementation“ (nicht im Handbuch; Tor MK9-T). Kein Gerät und kein Foto (Xander, 26.10.); Vorlage des Bedienfelds ist die Strichzeichnung HB-MS S. 5. Kein AG06-Handbuch und keine Prüfung der GarageBand-Menünamen (Teil D, ruht). Kein Klang angehört, nichts am iPhone gemessen, kein Web-Abruf. Im Supabase-Projekt und auf GitHub wurde nichts gelesen oder geändert.

---

## Teil H — Fragen an Xander: Entscheidungen und offene Fragen

### H.1 Entschieden (verbindlich)

- **H-1 Größe → (b).** Das Schlankheits-Paket **SL1** (E.3a) kommt, sobald die Startzeit-Prüfung scheitert, spätestens bei 4,5 MB (mit ×1,5 etwa bei V7c). Rev. 3 endet bei ≈ 6,8 MB (×1,5), nach Plan bei ≈ 5,5 MB (E.3).
- **H-2 Deine Wellen-Aufnahmen → eingebaut** (25.10.). *Ruht mit MK10 (26.10.: kein Gerät).* Eingebaut sind jetzt die 64 nachgezeichneten Wellen aus MK2 (nur selbst gerechnete Werte, mit „≈“). Dir wurde gesagt, dass die Lizenz der Wellen-Daten ungeklärt ist.
- **H-3 Werksklänge** (25.10.: 64 in acht Genre-Bänken) → **ersetzt am 26.10.:** 128 eigene Programme in den Bänken A–H × 16, geordnet wie am MS2000 (MK8). Eigene Klänge legst du mit WRITE auf einen Platz; den Werksklang holst du mit WERKSKLANG ZURÜCK wieder.
- **H-4 Name → „MS 2000“** auf dem Knopf neben VA │ FM │ WT (Ersatz wäre „MS 2K“ gewesen). Dir wurde gesagt, dass MS2000 ein Modellname von Korg ist (ein Risiko nur, wenn die App verkauft würde). Genau diese Beschriftung ist erlaubt; Korg, microKORG, RADIAS, DWGS, ein Korg-Logo oder Korg-Schrift bleiben verboten (EN3-05). Intern bleibt die Kennung `mk`. Den Platz im schmalen Hochformat regelt H-13.
- **H-5 Räder → sichtbare Räder.** PITCH und MOD sitzen links der Tasten, mit dem Finger spielbar wie am Gerät (MK1; quer im Reiter SPIEL). Über MIDI nur als freiwillige Zugabe am Desktop, nie nötig (EN3-21).
- **H-6 Eich-Aufnahmen → nein.** Abgleich nach Gehör (entfällt ohnehin, EN3-16).
- **H-7 Import → zurückgestellt.** Du hast keinen Rechner, kein Editor-Programm und keine .syx/.prg-Dateien und arbeitest nur am iPhone; Safari auf dem iPhone hat kein Web MIDI. MK9 steht außerhalb der Versionsfolge (EN3-21). microKORG-Programme passen auf dieselbe Engine (A.11); Werksprogramme von Korg kommen nie in die App, nur deine eigenen Dateien und nur lokal.
- **H-8 Aufnehmen mit Arpeggiator → gedrückte Tasten.** Der Arp spielt beim Abspielen neu; der MIDI-Mitschnitt enthält die klingenden Arp-Noten (MK5 Umfang 7).
- **H-9 MS-2000-Regler im App-Mod-System → ja** (≈ +5 h und +12 KB in V5d, V6a, V5c, V1d und VC4; Teil G Nr. 4).
- **H-10 Spur als Vocoder-Quelle, ohne sie zu hören → mit Schalter** „Quelle nur als Eingang“ (MK7).
- **H-11 Beide Timbres zugleich bearbeiten, Solo → ja** (25.10., damals über die TIMBRE-Taste des alten Bedienfelds; gebaut in MK3). Am reinen MS2000 gibt es beides nicht → offene Frage **H-18**.
- **H-16 Beschriftung des Bedienfelds → englisch wie am Gerät** (26.10.): Der Aufdruck der Platte steht genau wie gedruckt da (CUTOFF, RESONANCE, EG 1 INT, KBD TRACK …), weil das MS 2000 genau wie das Original aussehen soll; nur VOX WAVE heißt STIMMWELLE und DWGS SPEICHERWELLE (Marken-Regel). Menüs, Kopfzeile, Listen, Klartext und Hilfe außerhalb der Platte bleiben deutsch. Die Anzeige hat dunkle Zeichen auf gelbgrün beleuchtetem Grund (MK-P).
- **Reiner MS 2000 (26.10.):** kein microKORG-Bedienfeld, keine Genre-Bänke, keine RADIAS-Pakete (MK11–MK13 gestrichen), eigene Aufnahmen (MK10) zurückgestellt. Quer siehst du die ganze Platte und spielst sie direkt; der Zoom rastet ein und bleibt bis zum Tipp auf die Karte; ◀ ▶ und Wischen folgen dem Signalfluss; alles in einem festen Rahmen; Lauflicht und SEQ EDIT wie am Gerät (MK-P).
- **Entfallen:** H-12 (die Spec bleibt im Repo gesichert, E.5 Nr. 5), H-14 (gehörte zum alten Bedienfeld), H-15 (Übergabe des Wellen-Pakets; ruht mit MK10).

### H.2 Offen (die Vorgabe gilt, bis du antwortest)

- **H-13 Engine-Wahl im schmalen Hochformat.** Mit „MS 2000“ passen vier Knöpfe auf schmalen iPhones nicht neben den Spurnamen. Gebaut ist in MK1 die Vorgabe: Knöpfe, wo sie passen („MS 2000“ notfalls zweizeilig), sonst ein Engine-Chip „MS 2000 ▾“ bzw. „VA ▾“ mit Auswahl-Liste (z. B. in P1). *Vorgabe: so lassen.*
- **H-17 Querformat: das MS-2000-Blatt über den ganzen Bildschirm.** Damit du quer die ganze Platte groß genug siehst (≈ 708 × 363 px, Regler-Abstand ≈ 39 px statt ≈ 17 px im bisherigen Blattrahmen), belegt das MS-2000-Blatt quer den ganzen Bildschirm; die App-Kopfzeile und die Tastatur liegen dann darunter. Oben bleibt eine Zeile mit ✕, ↶ ↷, ▶/■ (Song), Name, den Reitern GERÄT │ SPIEL │ FX, ◀ Karte ▶ und ⋯ (dort Engine-Wahl, A/B, Sichern, 🎲, ◎, Init, ▶ Hören). Gespielt wird mit der Tastatur im Reiter SPIEL. *Vorgabe: so; gebaut wird ohne Warten, du siehst es danach und kannst es ändern lassen.*
- **H-18 Drei microKORG-Extras, die schon gebaut sind.** Beide Timbres zugleich bearbeiten und Solo (H-11, du hast am 25.10. ja gesagt) sowie die An/Aus-Schritte des Arpeggiators gibt es nur am microKORG, nicht am MS2000. *Vorgabe (reiner MS 2000): Auf Platte und Seiten gibt es sie nicht mehr; TIMBRE SELECT schaltet nur Timbre 1 ↔ 2 wie am Gerät. Die Klangerzeugung behält die Arp-Schritte, damit spätere microKORG-Programme richtig klingen.* Willst du sie behalten, kommen sie auf die LCD-Seiten 03 VOICE, 26 UTILITY und 25 ARPEGGIO (≈ +1 h in MK-P).

---

## Review-Protokoll (Rev. 1, 25.10.)

87 bestätigte Befunde aus vier Blickwinkeln (manual = Handbuch-Abgleich, app = App-Code, perf = Leistung und Messung, build = Bau und Abnahme), alle eingearbeitet. Neue Abnahme-Nummern: MK0-01…03 (neues Paket), MK1-01b, MK1-02b, MK1-29 (Befund 17), MK1-30 (Befund 21), MK1-31 (Befund 86, dort als MK1-29 vorgeschlagen), MK3-12, MK3-13, MK4-14, MK5-19…22, MK6-14, MK7-15, MK7-16, MK9-11, MK9-12, MK10-10 (Befunde 29/82), MK10-11 (Befund 86, dort als MK10-10 vorgeschlagen). Neue Fragen H-9 bis H-12; geändert H-1, H-4, H-5, H-7, H-8. Summen: 14 Pakete, +463 KB, 95–110 h.

- **1** · manual/major · A.3, A.11 Nr. 5, EN3-15, MK9 Umfang 3, MK9-05: Balance wird nicht mehr gedreht; Eingänge nach Funktion (mK IN 1 → E2, IN 2 → E1); Prüf-Dumps C1 = 127 → nur E2, C1 = 0 → nur E1.
- **2** · manual/major · W-02, MK1-11, MK1 Geräte-Abgleich, B.5: Selbstoszillation (res = 1,1 · v/127, ab ≈ v 116); MK1-11 prüft den Sinus statt Stille; Abgleich nur noch Einsatz und Pegel; ECO mit dem Ersatz-Pfeifen.
- **3** · manual/major · MK1 Umfang 2, MK1-17, A.2, A.12: Priorität gilt für jede Zuweisung (Last/Low/High, Rückgabe [U]); MK1-17 mit Low/High bei Poly; MK3-02 bleibt.
- **4** · manual/major · EN3-11, MK1 LFO, MK5 Umfang 1 und 11, MK6 Umfang 1, MK6-05, MK5-21: Tastensatz als KEYS-Ereignis; Key Sync Timbre nur je Akkord, Stimme je Arp-Note; Trigger Single bleibt auf Stimmen-Ebene [U] (Abwägung bei 46).
- **5** · manual/major · W-12, W-32, MK4 Umfang 1, MK4-14, MK4 Risiken, B.4: Puffer 6 s wie der Echo-Bus, jede Sync-Note bei 40–240 BPM; MK4-14 mit 1/1 und 3/4 bei 120/60/40 BPM; Wahl (a), Begründung bei 32.
- **6** · manual/minor · W-18, A.5, MK2 Umfang 5, MK2-06, MK6 Umfang 2, MK6-06: LFO2-Freq wirkungslos bei Tempo Sync; Seq-Ziel LFO-Freq bei Sync [U]/eK; Prüffälle.
- **7** · manual/minor · MK3 Umfang 2, MK3-02: Mono-Timbre ignoriert `tv` (1 Stimme; Poly daneben 3, Unison daneben 2); zwei Prüffälle.
- **8** · manual/minor · B.2 (KT), W-03, W-22, W-18, MK3 Umfang 5, MK6 Umfang 2, MK1-12: Keytrack-Tonhöhe KT definiert und benutzt; Prüfung TRANSP. +12 gegen Vibrato und Patch-Tonhöhe.
- **9** · manual/minor · W-27b neu, A.9, B.3 OSZ 1, MK7 Umfang 3, MK7-08: Sinus-Träger mit STEUER 1 = Verformung, STEUER 2 = LFO1-WFM, Beschriftung FORM/WFM, Prüffall.
- **10** · manual/minor · B.3 SPIEL, A.9, A.11 Nr. 8, MK7 Umfang 5, MK7-02: SPIEL im Vocoder (`voc.cut`/`voc.res`, ATTACK/RELEASE nur EG2), Prüffall.
- **11** · manual/minor · W-39, MK7-04: Schwelle 0 = Gate aus; Prüffall bitgleich zu „ohne Gate“.
- **12** · manual/minor · B.1 INIT AM, B.3 Kopf-Knöpfe, A.9, MK7 Umfang 5, MK7-07, MK1-20: Init im Vocoder behält `mode` 3; zwei getrennte Werkzeuge Pegel/Pan zurücksetzen; Prüfung in MK7-07.
- **13** · manual/minor · A.11 Nr. 6 und Nr. 9, MK9 Umfang 3, MK9-05: Oktavlage → Transpose (geklemmt, Hinweis); FC-MOD-Quelle nach Namen; drei Prüf-Dumps.
- **14** · manual/minor · A.5, A.10, B.1 `p[].s`, MK9 Umfang 3: MIDI 1/2 global belegbar, Werksbelegung angenommen; Zuweisung in die A.10-Liste.
- **15** · manual/minor · B.3 Regler je Sektion: STIMME „… UNI-VERST. · PRIORITÄT“, AMP (Vocoder) „… KEYTRACK · ANSCHLAG“; Regel „MS2000-Regler immer danach“.
- **16** · manual/minor · A.1, A.9, B.3, MK3 Umfang 3, MK3-13, H-11: Seiten korrigiert (HB-MK S. 14; S. 37, S. 39–45); [T1+2] und ◐ SOLO als sichtbarer Vorschlag (H-11, Vorgabe ja, +1 h, +2 KB).
- **17** · app/critical · EN3-04, B.1 Format 5, MK0 neu, MK1-29, E.1, E.2 Nr. 6, E.5 Nr. 2: Vorab-Paket MK0 (4.8.1, 2–3 h, +4 KB) mit undurchsichtigen Sounds und Überschreib-Sperre; B.1 korrigiert (Meldung nur beim Datei-Import); `save_library` als ungeschützter Weg benannt; Rollout erst nach MK0.
- **18** · app/major · EN3-02, N3.0.4, B.1, B.4, MK2, Teil G Nr. 9: AM = `eng 3`; `mkTables` als gemeinsamer Bau nach §10.1 („aus V4a“ gestrichen); V8a, V4e und V9a nutzen ihn; Tabellenspeicher gemeinsam geprüft.
- **19** · app/major · EN3-14, B.1 `normMk`, MK1 Umfang 6, MK1-01b: Kern (Engine-Eintrag, `normMk`, INIT AM, `mkToFlat`, `mkLocalStrip`, `loc`) immer geladen im oder vor `SQStore`; Kalt-Start-Prüfung.
- **20** · app/major · N3.0.4, B.1, MK1 Umfang 2, MK1-18: `{mk}`, `processorOptions.mk`, `{mkSet}` mit Abgabe vor jeder Note; Prüfung „nächster Steuerblock“ und byte-gleiche VA/FM-Nachrichten.
- **21** · app/major · B.1, MK1 Umfang 2, MK1-30: Der VA-Zustand ruht bei AM (`wkMods` leer, `glideFrom` −1, keine `fx.*`-LFO-Routen) und bleibt gespeichert; Prüffall.
- **22** · app/major · EN3-08, EN3-19 (MK-R2) neu, MK9 Umfang 5, Teil G Nr. 10: `mkLocalStrip` als einzige Ausgangs-Schleuse; Liste um VO4a–c, VC2b/c, VC3/VC3b, VC4 (`sample`, `sendToClaudeSession`) ergänzt; `normalizeSound` behält `loc`/`locRef`.
- **23** · app/major · Überblick, E.3, H-1, E.5 Nr. 4: drei Spalten (Budget, ×1,3, ×1,5) mit den Stellen für 4,5 und 5,0 MB; Grenze mitten im Plan; Varianten MK10 „eingebaut“ und H-3 = 128; Überzug > 50 % in CHANGES. Faktor-Wahl bei 68.
- **24** · app/major · EN3-04, MK0, MK1-02b, Teil G Nr. 14: unbekannte Engines bleiben undurchsichtig, damit V8a/V9a/V9b/V9d′ ohne Formatsprung auskommen; Prüffall.
- **25** · app/major · MK5 Umfang 1, MK5-19: Der Satz speichert Quellnoten, Abbildung je Schritt über `outPitch`, `applyCarrierChange` plant geplante Arp-Schritte neu; Prüffall Träger-Wechsel.
- **26** · app/major · EN3-18, Teil G Kopf und Nr. 4–5, E.1, H-9: AM gehört zu MOD-R1/PAD-R1 (Vorgabe ja, wie EN3-18 schon vorsah und Xanders Wunsch I4); Mehrbedarf ≈ +5 h/+12 KB in V5d, V6a, V5b/c, V1d, VC4 mit geänderten Abnahmen; Kopfsatz „kein neuer Umfang“ gestrichen; Nein = benannte Ausnahme.
- **27** · app/major · EN3-05, B.6 Nr. 9, Teil F, Teil G Nr. 15: Prüfung (a) im AM-Teil mit allen Wörtern, (b) über die ganze Datei nur die vier Gerätenamen dieses Plans; spätere ⓘ-Pakete scheitern nicht. Gegen „ganze Datei“ aus 79 entschieden, weil N2 D.1/D.2/D.9 Geräte im ⓘ vorschreiben.
- **28** · app/major · A.2, A.10, W-17, B.1, MK1 Umfang 8, MK1-16, MK5 Umfang 1, H-5: MIDI-Eingang vorhanden (nur Noten); Option (c) Bend/CC1 live, nicht gespeichert; MIDI als Arp-Quelle; zusammen mit 80, Vorgabe (b) + (c), +0,5 h in MK1.
- **29** · app/major · MK10 Umfang 3 und Berührungspunkte, MK10-10: eigene Datenbank `synq-mkwaves`, `persist()` in MK10, keine VS3-Abhängigkeit; Prüffall Vorgänger-Tab. Name nach dem `synq-…`-Muster (`synq-miccheck`) statt „synquenzer-mkwaves“ aus 82.
- **30** · app/minor · EN3-15, B.1, MK7 Umfang 1, MK7-10, Teil G Nr. 6, H-10: Abgriff vor dem Fader; Schalter „Quelle nur als Eingang“ (`eDry`) als sichtbarer Vorschlag H-10; Hinweis für V7a; zusammen mit 78.
- **31** · app/minor · EN3-15, N3.0.4, MK7 Umfang 1, MK7-10, MK7-14, Teil G Nr. 7: gemeinsamer, referenzgezählter Mikrofon-Abgriff ohne Stimm-Analyse; VS3 in MK7-14; VS3/VS4 nutzen ihn.
- **32** · app/minor · W-32, MK4-14, MK4 Risiken: wie 5. Gewählt 6 s (wie der Echo-Bus, keine Sonderregel, Speicher nur bei Delay an, nicht in `process()` angelegt) statt Falten auf kürzere Noten, weil Xanders Plan das ganze MS2000-Verhalten will; Speicher ≈ 2,3 MB je AM-Spur mit Delay.
- **33** · app/minor · B.3 Zeile 1, MK1 Umfang 3, MK1-21, H-4: Breiten-Budget je Format; Chip „VA ▾“ in P2/P3 als sichtbarer Vorschlag (H-4); Prüfung der Kopfzeile mit Spur-Chip; zusammen mit 62.
- **34** · app/minor · B.1 Feld-Listen, N3.0.4, MK1 Umfang 1 und Berührungspunkte, MK1-01, MK7, MK7-16, MK8 Daten, MK8-01, MK9 Umfang 5: `ENGINE_LABEL`, Browser-Listen, `setEngineOf` mit Aufräumen, `bank`/`slot`, `loc`/`locRef`, `tr.mkIn`; Prüffälle.
- **35** · app/minor · Teil G Nr. 2, 11, 12, 13: Vocoder der Stufe E aus MK7, Formant/FORMANT-Operator auf W-44, V9d nutzt Leser und Speicher aus MK10, VI1a auf dem MK1-Raster; VK2 nur Formeln und Prüfskripte, eigener Einschub für Drums und ohne Worklet.
- **36** · app/minor · B.6 Nr. 1, alle „bitgleich zu 4.x.0“, E.3, E.5 Nr. 4: Vorgänger = zuletzt ausgelieferter Stand laut CHANGES; VS3-Zeile in E.3.
- **37** · app/minor · B.4 Budget, MK1-24: alle Grenzen als Vielfache der VA-Stimme (4 Stimmen ≤ 4,8 ×), absolute Werte nur Information, das Verhältnis entscheidet; siehe 69.
- **38** · app/minor · MK5 Umfang 7 und Nicht-Umfang, MK5-14, H-8: Der Mitschnitt enthält bewusst die klingenden Arp-Noten (wie bei der Clip-Wiedergabe, ohne Zusatz-Code), Song-MIDI nur Clip-Noten; Prüfung mit `buildMidiLog`.
- **39** · perf/critical · B.6 Nr. 12 neu, MK1-04/05/06/09, MK2-02/03, MK11-06, MK12-05: eine Definition der gefalteten Energie (20 Hz–10 kHz, Blackman, ≥ 2^15); Puls C7 ergänzt; Sync C6 ≤ −50 dB; Vollband-Wert in CHANGES; Ring und Sinus× ohne Grenze.
- **40** · perf/critical · W-01, MK1-11, MK11-02/03, N3.0.4: Steilheit zwischen 4× und 8×; −6/−12 dB an W-01 statt −3-dB-Ecke; MK11-03 nach derselben Regel; Ladder unverändert; zusammen mit 70.
- **41** · perf/critical · B.3 Maße, SPIEL, EDIT, L1, L2, P2, P3, K-Säulen, MK1-21, MK3 Oberfläche, MK5-17, MK6 Umfang 6: alle Maße vom `.pg`-Inhalt (360/345/290/814/637), L1 ≤ 720 px; Safe-Area-Durchgänge 844 × 390 und 926 × 428; P3-Säulen als Canvas-Feld 8 × 36 ohne Zwischenraum (eigene Ergänzung, der Befund nannte P3-Säulen nicht). Gegen 83 entschieden: dessen 726/734 px passen nicht in 720 px.
- **42** · perf/major · B.4 Leistungs-Probe, MK1-25, MK13-05: 0-Gain-Anschluss, Σ-Messung, `frames_ok`, `quantum_max_ms`, rAF-Lücken statt `longtask` auf iOS; Grenze „Kern“ Σ ≤ 0,30, MK13 > 0,40. Schwelle gegen 69 (0,45/0,60) entschieden, weil schnelle Leistung oberste Priorität hat und 0,45 keinen Platz für Drums, Hall und Master lässt.
- **43** · perf/major · W-36, W-37, MK7 Umfang 3, MK7-06, MK7-11: eine Synthese-Bank je Timbre auf dem summierten Träger; FC-MOD von der neuesten gegateten Stimme; TPT-Bänder mit seltener Koeffizienten-Rechnung; Vocoder-Pfad läuft ohne Stimme; MK7-11 mit LFO-FC-MOD.
- **44** · perf/major · EN3-14, B.4, MK8 Umfang 3, MK1-26: `tickAhead(.3)` vor Auswertung und Entpacken; Auswertung beim Laden eines AM-Projekts; Tick zwischen Häppchen; Prüfung bei laufender Demo.
- **45** · perf/major · EN3-11, MK5 Umfang 1 und 3, MK5-20: Planer vor `R.playing`; Intervall-Satz; Swing-Regel festgelegt (W-35 ≠ 0 ersetzt den globalen Swing, sonst `swingOffset` wie Clips; kein doppelter Swing); Prüffall Swing 30 %.
- **46** · perf/major · EN3-11, N3.0.4, MK5 Umfang 11, MK5-21, MK6-05: KEYS Typ 9/10 mit Zeitstempel übernommen. Abweichung: Auslösung Single und Portamento-Regel bleiben auf Stimmen-Ebene ([U], Geräte-Abgleich) wie in 4, weil der Arp sonst bei Single keine Hüllkurve mehr neu startet und das Geräteverhalten unbelegt ist.
- **47** · perf/major · N3.0.4, B.6 Nr. 2, MK1 Umfang 2, MK1-18, MK3 Umfang 6, MK3-09, MK13-01: umverteilende Wechsel über `engXf`; L3-Abweichung (a) ausdrücklich genannt.
- **48** · perf/major · EN3-03, W-01, B.3, B.6 Nr. 2, W-18, MK6 Umfang 1, MK1-18: Bruchwerte während der Geste, auch für SEQ „Glatt“ und Patches; Prüfung > 127 Werte und ≤ 25 ct je Ereignis.
- **49** · perf/major · W-23, W-45, MK1-13, MK11 Umfang 3, MK11-06, B.6 Nr. 12: ADAA für die AMP-Verzerrung (1×, optional 2×) und den Verzerrer (2× + ADAA); Grenzen Säge C5 ≤ −35 dB, Hart ≤ −40, Falter ≤ −30; Ring/Sinus× als Charakter in CHANGES; zusammen mit 72.
- **50** · perf/major · MK7 Risiken, MK7 iPhone, MK7-10, MK8 Umfang 2, MK8-05: Latenz ≈ 70–75 ms benannt; DIREKT 0 und HPF ≤ 40 in der Vocoder-Bank; „Kabel-Kopfhörer empfohlen“ bei `bt`; `ST.latMs` in CHANGES; `echoCancellation`-Prüfung.
- **51** · perf/major · B.4 Tabellen, MK2 Umfang 3, MK2-08, W-32: MKW-Tabelle im `AudioWorkletGlobalScope`, einmal je Kontext; Platzhalter bis zur Tabelle; Speicher je Kontext gezählt; Puffer nie in `process()`.
- **52** · perf/major · W-27, MK2 Umfang 1, MK2-01: Sinus×-Modulator = OSZ 2 nach Sync, vor Ring; Prüfung gegen einen Referenz-Render.
- **53** · perf/minor · B.6 Nr. 2 (b)(c), MK6 Umfang 1, MK6-01, MK2 Umfang 3: „Stufe“ = 1-ms-Rampe; Wellen mit 2-ms-Gleichleistungs-Blende; L3-Ausnahme; MK6-01 misst den Rampenbeginn, M-KLICK für Amp ±63.
- **54** · perf/minor · MK6 Umfang 1, MK6-05: Song-Raster-Regel für KEY SYNC aus (Zyklus C, Einmal ab Schlag 0, Tempo behält die Schlag-Lage); Prüffall Schrittlänge ±2.
- **55** · perf/minor · B.6 Nr. 11 neu, Teil F, MK4 Umfang 1: Denormal-Regel; 60-s-Stille-Prüfung in FP-DSP.
- **56** · perf/minor · B.6 Nr. 10 neu, W-29, W-37, W-44, MK12 Umfang 2, Teil F: TPT-SVF für neue 2-Pol-Filter und Resonatoren; Stabilitätsprüfung C8 und 50-Hz-FC-MOD.
- **57** · perf/minor · W-28, B.6 Nr. 6, MK2 Umfang 2, MK2-09, N3.0.4: Stimmwelle live gerechnet (Option 1, ohne Tabellen); Liste der Oktav-Tabellen angepasst.
- **58** · perf/minor · B.4 Nr. 3, B.7, MK1 Umfang 2, MK3-01: Zufall je Note für `eng 3` (hash aus Seed, Timbre, Notenzähler); VA unverändert.
- **59** · perf/minor · B.5, EN3-11, MK5 Umfang 1, MK5-22, MK7 Umfang 10, MK7-15: Arp auch im ECO-Klang; Vocoder im ECO stumm mit Hinweis (die freiwillige Bandpass-Näherung wird nicht gebaut); Prüffälle.
- **60** · perf/minor · B.4 Begrenzer, MK7 Umfang 9, MK7-11, MK1-18, MK3-09: Ordnungswechsel mit 30-ms-Überblendung und Pegelausgleich (M-PEGEL); Stufe 2 = 1 + 1 bzw. Unison 2; M-EINBRUCH nur bis Stufe 1.
- **61** · perf/minor · B.3 SPIEL und Beschriftung, ARP B, MK5 Umfang 9, MK6 Umfang 6, B.6 Nr. 5: LETZTER SCHRITT → LÄNGE, HK-ATTACK/-RELEASE → ATTACK/RELEASE, Kurzformen FLT 2/K-PEG/K-PAN, `.lg` oder zweizeilig; scrollWidth-Prüfung in M-PLATZ.
- **62** · perf/minor · B.3 Zeile 1, MK1-21: senkrechte Trefferhöhe über `::after`, ≥ 36 px Breite mit 4 px, Test mit Spur-Chip; sonst Chip (H-4); zusammen mit 33.
- **63** · perf/minor · B.3 Regler-Verhalten, MK2 Umfang 3, MK6 Umfang 6, MK6-11: Listen > 12 Einträge als stetige Regler mit Rundung; SEQ-Säulen mit Tipp ±1 und voller Höhe, ohne Waagrecht-Feinmodus.
- **64** · build/critical · EN3-08a neu, MK3 Umfang 4, MK6 Umfang 5, MK9 Umfang 4 und 5, MK9-11: 🔒 steckt an (alle Kopierwege); `saveSound`/`normalizeSound` behalten `loc`/`locRef`; Prüffall mit Fake-Supabase.
- **65** · build/major · MK9 Umfang 5, MK9-06, MK9-07: Platzhalter heißt „Importierter Klang“; der echte Name bleibt lokal.
- **66** · build/major · EN3-07, Teil C Kopf, MK8-02, E.5 Nr. 5, H-12: Werksnamen nur in `scratchpad/manuals/werksnamen.local.json`, nie in Tests oder Repo; Stichproben-Prüfung; Frage H-12 zur Spec im öffentlichen Repo.
- **67** · build/major · EN3-14, MK1 Umfang 6, MK9 Berührungspunkte, MK9-12: wie 19 (immer geladener Teil mit `mkLocalStrip`); Prüffall „ohne AM geladen“.
- **68** · build/major · E.3, E.3a SL1 neu, H-1: ×1,3 als untere Spalte; SL1 als bestimmtes Paket (Auslöser wie EN2-28, spätestens 4,5 MB; Sparziel gemessen; gzip+Base64-Lader für ≥ −1 MB; Abnahme; 5–7 h). Planungsgrundlage bleibt ×1,5 aus 23 (Datei-Wachstum mit allen Fix-Schritten, schützt die 5,0-MB-Grenze); H-1 (a) braucht ≥ 7,1 MB bzw. ≥ 6,5 MB.
- **69** · build/major · B.4, MK1-24, MK1-25, MK4-11, MK6-12, MK7-11, MK7-12, MK13-05: `load_med` = Σ der 4 Probe-Engines, dazu `load_per_engine`; alle Node-Grenzen als Vielfache der VA-Stimme (4,8 ×, +1,0 ×, +0,5 ×, +2,4 ×, +0,16 ×). Schwellen siehe 42.
- **70** · build/major · W-01, MK1-11, MK11-02/03: Cutoff = Polfrequenz; −6 dB bei W-01 für 12LPF; Steilheit 4×–8×. Für MK11-03 die Form aus 40 genommen (gleiche Regel wie MK1-11, runde Cutoffs) statt der umgerechneten Werte 87/34.
- **71** · build/major · W-31, MK4-02, MK4-03: ein Mischgesetz w = min(0,5; 0,6 · dep/127); Ensemble-Stereo-Abgriffe; Messung auf Rauschen mit eingefrorenem LFO; Korrelation der nassen Signale.
- **72** · build/major · W-23, MK1-13, MK11-06: Verzerrung nach dem Filter festgeschrieben; MK1-13 mit gefiltertem Dreieck (≥ −25 dB), MK11-06 mit Sinus× (aus ≤ −50, weich ≥ −30); zusammen mit 49.
- **73** · build/major · MK1-08: Halbton +6 statt +7; keine FFT-Länge nötig.
- **74** · build/major · Teil D (D.1, D.2b neu, D.3, D.4, D.5), MK10 Umfang 1–2, MK10-08: Interface + GarageBand-Schritte, WAV-Export 24 Bit, Testdatei, Oktaven −2/+1, Variante B mit Stille-Trennung; MK10 liest Float-WAV/AIFF und nimmt den Kanal mit Signal. Gerätekasten erst nach Bestätigung des Interface-Modells (Hinweis an den Orchestrator in D.1).
- **75** · build/major · H-7, MK9-T, MK9-03, D.7, MK9 Risiken: Vorgabe Tor (a) über das öffentliche Dokument; MK9-03 nur bei Tor (b) oder vorhandenen Dumps; D.7 freiwillig mit Voraussetzungen.
- **76** · build/minor · N3.0.4, MK5 Umfang 6, MK5-11: ON-Element `d` = Timbre-Maske; in Split entscheidet die gehaltene Taste; Prüffall OKTAVEN 3.
- **77** · build/minor · W-44, MK7 Umfang 7–8, MK7-16, MK8 Umfang 2, MK12 Umfang 2, E.1: Vokal-Quelle in MK7 (+1 h); MK8 und MK12 nutzen sie (MK12 −0,5 h, −3 KB).
- **78** · build/minor · MK7 Umfang 1, MK7-10, B.1: „Quelle im Mix stumm“ als `eDry`, `tr.mute` nicht benutzt, Prüfung ≤ −90 dBFS; zusammen mit 30 (Abgriff vor dem Fader plus Schalter).
- **79** · build/minor · B.6 Nr. 9, EN3-05: Muster um „MS 2000“, „DW 6000/8000“ mit Leerzeichen und `\bvox\b` ergänzt; Salz-Byte statt Ausnahme der Datenblöcke. Geltungsbereich nach 27.
- **80** · build/minor · A.2, A.10, H-5, W-17, W-18: wie 28.
- **81** · build/minor · EN3-08, MK9 Umfang 5, MK9-07, MK10 Umfang 3, D.5: „Gerät“ = Speicher-Ursprung; die eigene `#import`-Übergabe darf 🔒 tragen; Prüfung je Ursprung; Wellen-Export und -Import.
- **82** · build/minor · MK10 Umfang 3, MK10-10: wie 29 (eigene Datenbank, `synquenzer` ohne Versionserhöhung).
- **83** · build/minor · B.3 L1, MK1-21: Safe-Area-Durchgang übernommen; Maße nach 41 (711/701 px) statt 726/734 px.
- **84** · build/minor · E.1 (MK4 braucht MK2), MK10-06, B.6 Nr. 1: Abhängigkeit korrigiert; MK10-06 direkt auf das Fake-Supabase-Gerüst; Vorgänger-Regel wie 36.
- **85** · build/minor · B.4 Tabellen, MK2, MK2-08: `mkTables` DOM-frei als eine Quelle für App und `mk-node.mjs`; portiert das V4a-Verfahren, teilt keinen Code mit `waveTab`.
- **86** · build/minor · MK1-31, MK3-12, MK6-14, W-18, MK2-06, MK2 Umfang 3 (Gruppen-Tabelle), W-06 (Messung), MK1-14, MK10-11, MK8-04: fehlende Abnahmen ergänzt; Kriterien stehen jetzt in der Spec statt beim Builder.
- **87** · build/minor · EN3-05, H-4: Namenskonflikt „AM“ benannt; Vorgabe „DUO“, Möglichkeiten „XA“, „ANA“, „AM“; „AM“ bleibt Arbeitsname im Text.

---

## Review-Protokoll (Rev. 2, 25.10., Xanders Entscheidungen)

Grundlage: Xanders Antworten vom 25.10. auf Teil H (H-1 … H-12), verbindlich. Ausgangsstand ist die saubere Rev. 1 (`scratchpad/rev1-tools/n3-ms2000-vor-rev2.md.bak`, unverändert). Das Rev.-1-Protokoll oben bleibt als Geschichte stehen; wo es H-12, Variante „lokal“, `k6`, das Sektionsraster oder die Chips [T1+2]/[◐ SOLO] nennt, gilt jetzt diese Rev. 2. Summen: 13 Pakete im Plan (MK9 zurückgestellt), +510 KB, ≈ 100–115 h, Versionen 4.8.1 und 4.9.0–4.20.0 (MK10-Einbau mit Zwischennummer).

- **1** · Kopf · Rev. 2; die Entscheidungen zu H-1 … H-11 sind verbindlich, für H-13 … H-15 gilt die Vorgabe.
- **2** · Überblick · 13 Pakete + MK9 zurückgestellt, +510 KB, ≈ 100–115 h, Versionen bis 4.20.0; neue Punkte „Name und Aussehen“, „Nur iPhone“; MK10 mit Aufnahme in der App und Einbau; Größen nach E.3 neu.
- **3** · N3.0.1 Nr. 2 und 3 · Präzisierung 25.10.: Bedienfeld „genau so“ wie das Original, Name „MS 2000“, eingebaute Wellen als Ausnahme von „keine Werksdaten“, Aufnahme am iPhone in der App.
- **4** · N3.0.2 · kein Foto der Vorderseite; die Referenz-Skizze ist eine eigene Zeichnung nach HB-MK S. 2–3, S. 8–14 und PDF 78, Lage [W].
- **5** · EN3-05 (Entscheidung 5, H-4) · „MS 2000“ als einzige erlaubte Beschriftung, genau einmal als `MK_LABEL`; Korg, microKORG, RADIAS, DWGS, jede andere Schreibung von MS 2000, Logo und Korg-Schrift verboten; interne Kennung bleibt `mk`; Hinweis auf den Korg-Modellnamen (Risiko nur bei Verkauf).
- **6** · EN3-08, EN3-19 (Entscheidung 2) · gelten erst ab dem Bau von MK9; ein später gebautes MK9 rüstet alle dann vorhandenen Wege nach.
- **7** · EN3-09 (Entscheidung 1, H-2) · Speicherwellen werden eingebaut; nur gerechnete Wellen, nie Roh-Aufnahmen; Lizenz ungeklärt, Xander entschied trotzdem.
- **8** · EN3-13 · Bedienfeld als DOM/CSS ohne Bild-Dateien; Canvas 2D auch für die Pegelanzeige der Aufnahme-Seite.
- **9** · EN3-14 · `MK_LABEL` im immer geladenen Teil; eingebaute Wellen in `sq-mk-src`; neuer Block `sq-mkrec-src` (Aufnahme-Seite, Leser, Analyse); Engine-Knopf und Filter heißen „MS 2000“.
- **10** · EN3-17 · Zwischenstände nach MK10 Abschnitt 1 (damit Xander aufnehmen kann) und nach dem Einbau.
- **11** · EN3-20 neu (Entscheidung 4) · Bedienfeld wie die Vorderseite des Originals; Ebene 1 = Belegung des Originals, Zusätze auf SHIFT-Ebene 2/3 und an den Stellungen GLOBAL/MIDI; Trefferflächen ≥ 44 × 44.
- **12** · EN3-21 neu (Entscheidung 2, H-7) · nur iPhone, kein Rechner, kein MIDI, keine Datei vom Rechner; MK9 zurückgestellt; MIDI-Bend/CC1 nur freiwillig am Desktop.
- **13** · EN3-11, EN3-18 (Entscheidung 6) · H-8 und H-9 von „Vorgabe“ auf „entschieden“.
- **14** · N3.0.4 · Zeile Blatt-Rahmen (Bedienfeld-Bausteine neu), neue Zeile `#kbArea`/`tr.kbOct`, Mikrofon-Abgriff auch für MK10, MIDI-Eingang freiwillig, .syx-Weg zurückgestellt.
- **15** · A.2, A.10, A.11 Nr. 4/7/8, A.12 Nr. 10 · Touch-Rad BEND, Räder statt MIDI, MS2000-Werte auf Ebene 2 bzw. STIMMUNG/SEQ, Programm-Wahl und SPIEL wie am Original, Import zurückgestellt.
- **16** · B.1 (Entscheidung 4, H-5) · neuer Punkt „Räder“: Live-Werte je Spur, nicht gespeichert, MOD startet bei `p.mw`; `ENGINE_LABEL.mk = MK_LABEL`; INIT-Name „INIT MS 2000“; SHIFT + 3 = Init.
- **17** · W-17, W-18 · Bend über das Touch-Rad (linear, Totzone ± 2 %, Rückfederung 80 ms), Mod-Rad als Rad-Wert mit Startwert `p.mw`.
- **18** · B.3 neu geschrieben (Entscheidung 4) · Grundsatz, Logik, Rahmen mit Reitern [GERÄT] [FX], Referenz-Skizze, Zonen-Tabelle (L1 720 × 146 px), Bedienelemente-Tabelle, Drehschalter-Stellungen (11 + 11, Synth/Vocoder), Regler-Belegung Ebene 1 nach PDF 78 mit Ebene 2/3, SHIFT-Funktionen wie am Original, Zusatz-Ansichten (SCHRITTE, 16 BÄNDER, EIGENE), Räder, Material und Farben, Maße je Format (L1 ein Stück, P1 zwei Hälften, Halb-Ansicht auf kleinen iPhones), „MS 2000“ ein- oder zweizeilig, Chip nach H-13. (Anordnung, Zonen, Maße und Halb-Ansicht ersetzt durch Nr. 43–47.)
- **19** · B.4 · Bedienfeld ohne Bilder, LEDs per Klasse, Tempo-LED ohne Zeichnen; Canvas für die Pegelanzeige.
- **20** · B.5 · LCD-Hinweis mit „MS 2000“ aus `MK_LABEL`.
- **21** · B.6 Nr. 3, Nr. 5, Nr. 9 · BEND-Ausnahme nur ohne bewegtes Rad; Trefferflächen ≥ 44 × 44 überall; neue Prüfung M-SKIZZE (Zonen-IoU ≥ 0,7, Reihenfolge, Bildschirmfotos); Markenprüfung (a) mit `sq-mkrec-src`, (b) genau 1 Treffer „MS 2000“, (c) kein Logo, keine neue Schrift, keine Bild-Daten.
- **22** · B.7 · neue Test-Aufrufe `mkWheel`, `mkPanel`, `mkRecInfo`; `mkInfo().waves`.
- **23** · MK1 (Entscheidungen 2, 4, 5) · Titel und Ziel mit „MS 2000“ und Bedienfeld wie das Original; Umfang 3 neu (alle Zonen, aktiv bzw. dunkel je Paket, Hochformat-Hälften); Umfang 8 Touch-Räder, MIDI freiwillig; Dauer 19–22 h in drei Abschnitten; +115 KB; MK1-01/03/16/19/20/21/26/27/31 angepasst; neu MK1-32 (Aussehen gegen die Referenz-Skizze), MK1-33 (Räder), MK1-34 (Bedien-Logik); Test `mk1-look.mjs`; iPhone-Punkte mit Sicht-Abgleich; Geräte-Abgleich des Bedienfelds; Risiken.
- **24** · MK2 · Bend/Mod über die Räder; Stellungen PATCH 1–4 der EDIT-WAHL 2; OSZ-1-Matrix STEUER 1/2 wie am Original, Bedeutung in der LCD; MK2-10; iPhone.
- **25** · MK3 (Entscheidungen 4, 6, H-11) · STIMME/STIMMUNG statt PROG; TIMBRE-Taste T1 → T2 → beide, SHIFT + TIMBRE = Solo, statt eigener Chips; Werkzeuge über SHIFT + 1/2/4; Zusatz-Ansicht EIGENE; 7,5–8,5 h, +33 KB; MK3-04/05/10/13; iPhone.
- **26** · MK4 · Stellungen 5–7 der EDIT-WAHL 2; Anzeige wie am Original; iPhone.
- **27** · MK5 · ARP-Taste mit Tempo-LED, LATCH als ARP-B-Regler, Schritt-Tasten an/blinkend/dunkel wie am Original; Schalterzeile entfällt; MK5-17; iPhone.
- **28** · MK6 · Stellung SEQ (am Original MIDI) mit Ebene 2, Zusatz-Ansicht SCHRITTE, Ablauf von [● AUFN.]; 8–9 h, +36 KB; MK6-11; iPhone; 🔒 erst ab MK9.
- **29** · MK7 · Quellen auf Ebene 2, LEDs E1/E2, Formant halten über TIMBRE/HALTEN, grüne Vocoder-Stellungen, Kanal-Paare und Zusatz-Ansicht 16 BÄNDER, SHIFT + 1/2 zum Zurücksetzen; 11–12 h, +52 KB; MK7-03/07/13; iPhone.
- **30** · MK8 · Programm-Wahl über BANK, SEITE und Nummerntasten; Filter „MS 2000“; MK8-04 läuft nach dem Einbau neu; MK8-07/09; iPhone.
- **31** · MK9 (Entscheidung 2, H-7) · zurückgestellt, außerhalb der Versionsfolge, nicht in den Summen; Status-Absatz; Tor (b) und Blatt D.7 entfallen.
- **32** · MK10 neu geschrieben (Entscheidungen 1, 3) · Aufnahme-Seite in der App (AG06 über `getUserMedia`, Echo-/Rauschunterdrückung und AGC aus, spielt nichts, 67 geführte Schritte, Pegel-Anzeige, Auto-Stopp, Zuschnitt, Fortschritt gespeichert), Ersatzweg GarageBand-Dateien, sofort lokal hörbar, Wellen-Paket über das Teilen-Blatt, Einbau-Skript mit Datenblock ≤ 45 KB, zwei Bau-Abschnitte, Tor nur für den Einbau; 10,5–12 h, +80 KB; MK10-01/06/07/09/10/11 angepasst, neu MK10-12 (Aufnahme-Seite), MK10-13 (Paket), MK10-14 (Einbau); Export/Import zwischen Ursprüngen entfällt; Lizenz-Risiko benannt.
- **33** · MK11, MK12, MK13 · Bedienung über MIXER/FILTER/F-HK/STIMME-Ebenen statt Rasterplätzen; Versionen 4.18.0, 4.19.0, 4.20.0; MK11-10, MK12-08, MK13-06; iPhone-Punkte.
- **34** · Teil D neu (Entscheidung 3) · nur iPhone: microKORG L/MONO → AG06 Kanal 1 (Line) → USB → Kamera-Adapter mit Strom → iPhone; AG06-Schalter mit „Schalterlage am Gerät prüfen“; Aufnahme in der App als Vorgabe, GarageBand am iPhone als Ersatz; Abgabe über das Teilen-Blatt; alle Mac-/Rechner-Schritte gestrichen; D.6 und D.7 entfallen.
- **35** · E.1 · Tabelle neu (MK9 zurückgestellt, MK10–MK13 vorgerückt, neue Stunden und KB), Summe 13 Pakete, +510 KB, ≈ 100–115 h; Zeile „Rev. 2 gegenüber Rev. 1“; Tore; Fach-Prüfung 13 ×; Gesamt ≈ 113–141 h.
- **36** · E.2 Nr. 4 · Import zurückgestellt; MK10 Abschnitt 1 darf direkt nach MK7 vorgezogen werden.
- **37** · E.3 · neu gerechnet: Planende 5,51 / 6,42 / 7,03 MB, nach MK13 3,13 / 3,33 / 3,46 MB, 4,5 MB bei V9e / V7d / V5d, 5,0 MB bei V10f / V9d′ / V8a; MK10 eingebaut mitgerechnet; Zeile „MK9, falls später“.
- **38** · E.3a, E.4, E.5 (Entscheidung 6) · SL1 entschieden (H-1 = b), Auslöser ≈ V5d; Versionen nach der MK-Gruppe ab 4.21.0; Bau-Ort mit Wellen-Paket; die Spec bleibt im Repo gesichert, H-12 entfällt; Paket und Aufnahmen bleiben privat.
- **39** · Teil F · MK9 nur, falls gebaut; MK10 mit FP-IPHONE; FP-SICHER mit „MS 2000“-Regel und Wellen-Einbau; FP-TOUCH prüft M-SKIZZE.
- **40** · Teil G · Nr. 4/5 entschieden, Nr. 7 (Aufnahme-Seite nutzt den Abgriff), Nr. 8 (ab 4.21.0), Nr. 10 (MK-R2 erst nach MK9), Nr. 13 (VI1a nutzt die Bedienfeld-Bausteine), Nr. 15 (Markenprüfung mit „MS 2000“), neu Nr. 16 (Räder in `#kbArea`) und Nr. 17 (Engine-Kopf mit „MS 2000“).
- **41** · Quellen · Rev.-2-Lektüre (HB-MK S. 2–3, S. 8–14, PDF 78; App-Raster, `#kbArea`, `tr.kbOct`) und Grenzen (kein Foto, kein AG06-Handbuch, GarageBand-Namen ungeprüft).
- **42** · Teil H · H.1 mit den Entscheidungen H-1 … H-11 und dem Wegfall von H-12; H.2 neue Fragen H-13 (Engine-Chip im Hochformat), H-14 (wohin mit den MS2000-Zusätzen: SHIFT-Ebenen, Stellungen GLOBAL/MIDI, VOLUME, Halb-Ansicht), H-15 (Übergabeweg des Wellen-Pakets).

**Nachprüfung (unabhängig, 25.10.):** ganze Spec gegen Xanders sechs Entscheidungen, die Handbücher und die App 4.6.0 geprüft; die folgenden Befunde sind eingearbeitet.

- **43** · B.3 Anordnung (Entscheidung 4, „genau so“) · Die Zonen der Rev. 2 wichen vom Original ab (Anzeige ganz rechts, Nummerntasten unter den Reglern, beide Drehschalter nebeneinander). Neu nach der Strichzeichnung der Vorderseite in HB-MK S. 2–3 (PDF 8–9): links VOLUME, ARP, OKT; Mitte BANK, SEITE, Eingangs-LEDs, Anzeige, darunter WRITE und SHIFT, unten die Nummerntasten; rechts die Spalte TIMBRE über EDIT-WAHL 1 über EDIT-WAHL 2, daneben ORIGINAL-LED, die 5 Regler und die Matrix in zwei Zeilen (eine je Drehschalter, wie die zwei Blöcke am Original). Neue Zonen Z1–Z13 mit HL/HR, neue Skizze und Bedienelemente-Zeile „Matrix“; Anordnung der Gruppen [B], Reihenfolge darin [W], Maße eK.
- **44** · B.3 Höhe L1 · Körper 720 × 146 passte nicht in den Querformat-Körper (`.pg`-Inhalt ≈ 141 px bei 844 × 390; N1 misst `.pg` außen 150 px; Rev. 1 hatte ≤ 140). Neu drei Bänder à 44 px = 720 × 136, Beschriftung oben in der Trefferfläche, Bilder kleiner (Kappe 32 px). MK1-21 (Regler 44 × 44, Drehschalter 52 × 44, Matrix-Zeile ≥ 220 × 44), MK1-32 und B.6 Nr. 5 angepasst.
- **45** · B.3 L2 und Home-Balken · L2 (Körper ≈ 126 px; die untere Tastenreihe der Rev. 2 brauchte ≈ 704 px > 637 px) und iPhone 12/13 quer mit Home-Balken (≈ 120 px) bekommen die Halb-Ansicht quer (zwei Bänder, 90 px). Neuer Durchgang 844 × 390 mit 21 px unterem Rand (B.6 Nr. 5, MK1-21). Xanders 12 Pro Max zeigt quer das ganze Bedienfeld (× 1,1: 792 × 150 px bei ≈ 158 px Körper).
- **46** · B.3 Halb-Ansicht · Der 44-px-Umschalter im Körper passte in P3 nicht in die Höhe (Körper ≈ 203 px). Neu schalten die Reiter [LINKS] [RECHTS] [FX] (Blattrahmen); EDIT-WAHL, Regler und Matrix liegen zusammen in RECHTS, darum entfallen das Springen nach RECHTS und der Chip „Sektion ▾“; SHIFT erscheint in der Halb-Ansicht in beiden Hälften. P1 zeigt beide Hälften (136 + 8 + 136 = 280 px ≤ ≈ 300 px), P2 und P3 je eine (182 px ≤ 231 bzw. 203 px); Bandbreiten nachgerechnet (innen P1 352, P2 337, P3 282 px). P1 skaliert hochkant auf dem 12 Pro Max bis × 1,1.
- **47** · B.3 Zusatz-Ansichten · öffnen per Tipp auf die Matrix-Zeile ihrer Sektion (für Chips ≥ 44 × 44 ist in der Matrix-Zeile kein Platz mehr); volle `.pg`-Breite ohne Holzwangen, weil die Säulen sonst in P1 (356 > 352 px), P3 (288 > 282 px) und L1 (701 > 700 px) nicht passten; L1-Säulen 90 px hoch (44 + 2 + 90 = 136 px), quer in der Halb-Ansicht 74 px; EIGENE in L2 12 × 50. MK3 Oberfläche, MK6 Umfang 6 und MK7 Umfang 5 angepasst.
- **48** · Zonen-Bezüge in den Paketen · MK1 Umfang 3 (Z1–Z13, Halb-Ansicht hoch und quer), MK3 TIMBRE Zone Z8 → Z11, MK5 ARP Zone Z7 → Z2, MK7 E1/E2 Zone Z10 → Z6; SHIFT-Kurznamen auf den Tasten statt „Matrix-Zeile über den Tasten“; „EB2“/„EB3“ vor dem Sektionsnamen der Matrix-Zeile (MK1-34, MK11-10).
- **49** · B.3 Zeile 1, MK1-21 · Breiten-Prüfung auch für die eine 40-px-Kopfzeile im Querformat (Z. 1426–1437) mit „MS 2000“; das Namensfeld darf bis 72 px schrumpfen, nichts läuft über.
- **50** · MK10, Teil D.3, B.6 Nr. 9 (Entscheidungen 1, 5) · Die Schritt-Hinweise der Aufnahme-Seite hätten „DWGS“ und „microKORG“ in die App gebracht, B.6 Nr. 9 (a) und (b) verlangen dort 0 Treffer. Neu „am Gerät“ und „6. Stellung (Speicherwellen)“; MK10-12 prüft 0 Markenwörter; Teil D.3 sagt Xander, dass das am Gerät die Stellung DWGS ist.
- **51** · MK10 Eingang (Entscheidung 3) · `MIC_ASK` (Z. 29401) enthält weder `deviceId` noch `channelCount`: Die Seite fordert beides zusätzlich an, öffnet den gemeinsamen Abgriff bei anderen Vorgaben neu und reicht beide Kanäle ungemischt weiter. Die 7-Ton-Erkennung gilt nur für die Wellen-Schritte 2–66 (Pegel-Test ein Ton, Stille 10 s nach Uhr). MK10-12 ergänzt.
- **52** · Budgets der Abnahmen an die Paketköpfe angeglichen: MK3-11 ≤ +33 KB (war 32), MK6-13 ≤ +36 KB (war 35), MK7-14 ≤ +52 KB (war 50).
- **53** · Dauer-Aufschlüsselung an die Spannen angeglichen, Summen unverändert: MK1 Rev. 2 = +4–4,5 h Bedienfeld + 1–1,5 h Räder = +5–6 h (war +4–5 h); MK10 = +3–3,5 h + 1,5 h − 0,5 h = +4–4,5 h (Einbau war +1,5–2 h).
- **54** · Nachgerechnet und unverändert: 13 Pakete, +510 KB, 99,5–115 h (≈ 100–115 h), mit Fach-Prüfung ≈ 113–141 h; E.3 mit `size.py`-Restplan und Rev.-2-Budgets: Planende 5,51 / 6,42 / 7,03 MB, nach MK13 3,13 / 3,33 / 3,46 MB, 4,5 MB bei V9e / V7d / V5d, 5,0 MB bei V10f / V9d′ / V8a; Versionen 4.8.1 und 4.9.0–4.20.0, danach ab 4.21.0, MK10-Einbau und ein späteres MK9 mit Zwischennummer. Keine Rechner-, Mac-, MIDI- oder Datei-vom-Rechner-Pflicht außerhalb des zurückgestellten MK9; „MS 2000“ nur als `MK_LABEL`; H-12 steht nur noch als „entfällt“.
- **55** · H-14 · Frage um die Matrix-Zeilen, die Halb-Ansicht über die Reiter und SHIFT in beiden Hälften ergänzt; die Vorgabe bleibt „so“.
- **56** · N3.0.2, Quellen · Strichzeichnung HB-MK S. 2–3 als Beleg der Anordnung (im Speicher als Text-Raster ausgewertet, keine Bild-Datei); App-Raster und Kopf quer (Z. 72–85, 1426–1441) und `MIC_ASK` (Z. 29401) gelesen.
- **57** · Nachzeichnung (25.10., von Xander geschicktes PDF mit 64 Wellen-Bildern) · MK2 Umfang 3, Daten, Dauer, MK2-03/11, neu MK2-12, Tests, Geräte-Abgleich, Risiken; MK10 Ziel, Umfang 3/6/7, MK10-14, Risiken; EN3-09, B.6 Nr. 9, E.1, E.3, E.5 Nr. 1/5, Teil F, H-1 · Die freien „64 Rezepte“ sind ersetzt durch die geprüfte Nachzeichnung (`dwgs-64-compact.json`, `PRUEFUNG.md`): Datenblock mit Teiltönen 1–32 des Notenbands (12 Bit Pegel und Phase, ≈ 8,6 KB), darüber ein gruppentypischer Abfall, Tonlage r für 3, 28, 34, 35 und 59, Hüllen in Hz für 35 und 61–64 aus der Nachzeichnung; Gruppen-Merkmale → Abfall-Tabelle; MK2-12 prüft die Form gegen die Nachzeichnung (≤ rms32 + 0,1 Prozentpunkte) und nennt 60 als zweifelhaft; weiter „≈“ bis MK10. Lizenz: nur selbst gerechnete Werte, nie die Bilder, dieselbe offene Lage wie MK10, Xander hat eingebaut gewählt. MK10 bleibt nötig (genauer Klang, obere Teiltöne, Oktav-Verhalten, Pegel, r) und entfernt den MK2-Block beim Einbau. MK2 +42 KB (+7), 7–8 h (+0,5); Summe +517 KB, ≈ 100–116 h, mit Fach-Prüfung ≈ 113–142 h; E.3 neu gerechnet (`scratchpad/dwgs-trace/spec-mk2/size3.py`): Planende 5,52 / 6,43 / 7,04 MB, 4,5 MB bei V9e / V7c / V5d.
- **58** · Orchestrator 25.10. · MK2 Umfang 3 · Alle Teiltöne der geprüften Kompaktdatei werden eingebaut (nicht nur 1–32), weil sie den Formfehler der obertonreichen Wellen stark senken; MK2 ≈ +45 KB statt +42.
- **59** · Xander 26.10. („der MS 2000 soll genauso aussehen“) · Überblick, N3.0.2, EN3-20, A.11, B.3 (ersetzt), B.6 Nr. 5 und 9 b, B.7, neues Paket **MK-P** (Lage-Tabelle aus HB-MS S. 5 vermessen, Belegung Synth/Vocoder, Seitenplan, Umzug der SHIFT-Funktionen, Übersicht/Zoom/Spiel-Ansicht, MK-P-01…12), E.1–E.4, Teil F, Teil G Nr. 8, 13, 18, Quellen, H-14, neue Frage H-16 · 14 Pakete, +542 KB, ≈ 119–138,5 h; MK-P = 4.21.0, danach ab 4.22.0.

**Prüfung MK-P (unabhängig, 26.10.):** MK-P Element für Element gegen die Zeichnung HB-MS S. 5 geprüft (Ausschnitt `ms2000-front.png`; Linien-Suche, Text- und Tastenkanten neu gemessen), dazu gegen HB-MS S. 6–9, 13 und 18–19, gegen `normMk` der App-Hauptlinie und gegen Teil E. Bestätigt: Alle Sektionen und Elemente der Zeichnung sind da, jeweils in der richtigen Sektion und Reihenfolge, und die Element-Mitten treffen. Aufdruck und Vocoder-Namen stimmen. Jeder Regler und jede Taste hat einen vorhandenen Pfad (`normMk`, `S.bpm`, `tr.kbOct`, Spur-Lautstärke) oder den neuen Live-Wert E1/E2. Seitenplan und Tasten 1–16 entsprechen HB-MS S. 18. Die Summen sind nachgerechnet. Die folgenden Befunde sind eingearbeitet.

- **60** · MK-P Umfang 3 (Lage) · Der Aufdruck über den 16 Reglern lag 1,3–1,4 % der Höhe zu tief: 72,9 │ 74,6 statt gemessen 71,5 │ 73,3; die untere Zeile hätte die Skala berührt. PATCH 1–4 haben nur eine Zeile (73,5). Weitere Korrekturen: die inverse Zeile unter den Schritt-Tasten 98,3 → 98,7, HOLD 47,8 / 32,4 → 48,2 / 32,3. Vier Sektionstitel waren aus der Rahmenmitte statt aus der Schrift genommen: EG 1 (FILTER) 22,0 → 22,4, EG 2 (AMP) 45,1 → 44,5, LFO 1 58,0 → 58,3, LFO 2 63,4 → 63,8.
- **61** · MK-P Aussehen, MK-P-11 · Die Mittelmarke zeigt die Zeichnung an EG 1 INT, KBD TRACK, SEMITONE, TUNE und PAN, nicht an PATCH 1–4. AUDIO IN 1 ist ohne Skala gezeichnet. Spec und Abnahme folgen jetzt der Zeichnung.
- **62** · MK-P Umfang 1 · „Tasten zwischen zwei Spalten“ nannte den PORTAMENTO-Regler eine Taste und ließ REC aus; korrigiert. Die Tastenabstände der Paare und Viererreihen messen 4,2–4,4 %. Gebaut wird der Tabellenwert 4,3 %, MK-P-01 prüft ihn (± 0,05). Kreisziffern, Hinweislinien und die Klammer der Zeichnung werden ausdrücklich nicht gebaut.
- **63** · MK-P Zoom-Ansicht, MK-P-07 · Mit k ≥ 0,93 kam der 4,3-%-Abstand auf 43,99 px. Neu gilt k ≥ 0,931 (z ≥ 1024 px); daraus ergeben sich die vorhandenen Schwellen 570, 281 und 197 px. Die Tasten bei y 66,1 (LFO SELECT, MOD/DELAY, VIRTUAL PATCH) passen mit 44-px-Treffer nicht ganz in Z4 bzw. D2, in P3 ragen sie bis 9 px über den Rand. Neu werden Trefferflächen am Feldrand ins Feld verschoben, nie verkleinert. Ergänzt ist auch ein Rückfall für Körper unter den Mindestmaßen der Gruppen.
- **64** · MK-P Zoom-Felder · Der Titel EG 1 (FILTER) (x 19,6–25,1) liegt bei schmalen Spalten in keinem Feld ganz. Er ist jetzt als einzige Ausnahme der Regel „Felder schneiden keine Beschriftung“ benannt. Alle anderen Element- und Beschriftungsgrenzen sind gegen H1–H4, G-L/G-R, O/U, D1–D3 und Z1–Z6 nachgerechnet; es gibt keinen weiteren Schnitt.
- **65** · MK-P Spiel-Ansicht:
  - **Reihenfolge:** Band 1 hieß „Reihenfolge wie am Gerät“, stand aber nicht so (Anzeige an 2. Stelle, ARP vor MOD SEQ). Quer gilt jetzt OCTAVE · BANK · TIMBRE · MOD SEQ ON/OFF · REC · ARP ON/OFF · LATCH · Anzeige. Hochkant ist Band 1 OCTAVE · BANK · Anzeige (P1 344 ≤ 360 px, P3 290 px), und die fünf Tasten bilden Band 2.
  - **Schritt-Tasten:** Die Regel nennt jetzt je Format, was gilt; die alte Fassung ließ offen, ob L2 (637 px, quer) 2 × 8 bekommt. Band 1 steht ab 604 px Körperbreite in einer Reihe (L1, L2, W).
  - **Aufdruck:** Zwei Zeilen à 9 px passten bei 45 px je Taste (L1, P1) nicht (ARPEGGIO, AUDIO IN 2). Die Spiel-Ansicht zeigt darum nur die Zeile des aktiven Modus, mit Umbruch an Leerzeichen; ARPEGGIO bekommt 8 px.
- **66** · Überblick, MK-P, E.1, E.2 Nr. 7, E.4, Teil G Nr. 8 · Versionen: Die Spec empfahl die Auslieferung bald nach 4.15.0, gab MK-P aber 4.21.0 und verlangte bei früherer Auslieferung eine „Verschiebung“ der übrigen Nummern. Neu bekommt MK-P bei Auslieferung vor MK13 die nächste freie Zwischennummer (z. B. 4.15.1). Alle anderen Nummern bleiben, 4.21.0 bleibt dann frei, und die Folge ab 4.22.0 ändert sich nicht (EN2-14 verlangt nur streng steigende Nummern). Damit ist die offene Versionsfrage aus dem Paket-Entwurf erledigt.
- **67** · Überblick, MK-P, E.1, E.2 Nr. 7, Risiken · In der Liste der parallelen Pakete fehlte MK12, obwohl Teil G Nr. 18 und der Seitenplan es abdecken (11+ HK 3, F2-HK, Welle 8, Quelle EG 3). Jetzt heißt es überall „MK8 und MK10–MK13“.
- **68** · MK-P Daten, B.6 Nr. 9 (c) · `seitenSprung` (GLOBAL 1D) hatte keinen Ort und gehört jetzt zum Ansichtszustand. FP-SICHER prüft ab MK-P die Bildschirmfotos aus MK-P-02 und MK-P-07 statt aus M-SKIZZE. Unverändert und bestätigt: Es braucht kein Korg-Wort, kein Logo und keine Korg-Schrift, und das Namensfeld zeigt nur `MK_LABEL`. Paketzeile MK-P: 4.21.0 (bzw. Zwischennummer), 19–22,5 h, +25 KB. Summe: 14 Pakete, +542 KB, ≈ 119–138,5 h.

---

## Review-Protokoll (Rev. 3, 26.10., reiner MS 2000)

Grundlage: Xanders Aussagen vom 26.10. (`fragen-xander-9.md`): „Wir bauen den MS 2000, nicht den microKORG … kein Hybrid“; RADIAS nie gewollt; kein Gerät; quer die ganze Platte direkt spielbar; Tipp-Zoom, der einrastet und bis zur Karte bleibt; ◀ ▶ und Wischen im Signalfluss; fester Rahmen ohne Layout-Sprung; Lauflicht und SEQ EDIT wie am Gerät; H-16 englisch, LCD dunkel auf gelbgrün. Ausgangsstand ist die Fassung mit MK-P (`scratchpad/rev1-tools/n3-vor-pure.md.bak`, unverändert). Die Protokolle Rev. 1 und Rev. 2 bleiben als Geschichte stehen; wo sie die alte B.3, EDIT-WAHL, SHIFT-Ebenen, Genre-Bänke, MK10–MK13, H-14, H-15, Übersicht/Felder/Lagekarte oder Versionen ab 4.16.0 nennen, gilt jetzt Rev. 3. Summen: 10 Pakete (MK0–MK7 gebaut, MK-P und MK8 offen), +428 KB, ≈ 101–117 h (offen 34–40 h, mit Fach-Prüfung 36–44 h); MK9 und MK10 zurückgestellt; MK11–MK13 gestrichen; MK-P und MK8 = 4.16.0 und 4.17.0 in Lieferreihenfolge, danach ab 4.18.0.

- **69** · Kopf, Überblick, N3.0.1, N3.0.2, EN3-01/05/09/12/13/14/15/16/17/20/21, N3.0.4 · reiner MS2000-Plan nach Xanders Wortlaut; HB-MK nur noch für Namensprüfung und späteren Import; kein Gerät, darum entfällt der Geräte-Abgleich (EN3-16); Treffer auf der Platte = nächstes Element (EN3-20).
- **70** · Teil A (A.1, A.2, A.8, A.9, A.10, A.11 neu, A.12), B.1, B.2 (W-15, W-17, W-18, W-44; W-45 gestrichen), B.4, B.6 Nr. 2/3/5/6/8/9/10/11, B.7 · microKORG-Bedienung und RADIAS-Felder gestrichen; `vmax` fest 4; Step-Arp-Felder nur für microKORG-Programme; A.11 als Import-Abbildung auf dieselbe Engine; M-SKIZZE → M-VORLAGE und neu M-RAHMEN; `mkPanel` mit Ansicht, Hälfte, Halten und Lauflicht, dazu `mkView`.
- **71** · B.3 · alte Fassung gestrichen (nur in der Sicherung); es bleiben Rahmen (mit Kopfzeile quer), Räder (PITCH/MOD), Regler-Verhalten, Kopf-Knöpfe, Zusatz-Ansichten, Maße der Rahmen und die Treffer-Regel.
- **72** · Teil C Kopf, MK0–MK7 · als gebaut markiert (4.8.1, 4.9.0–4.15.0); ihre Bedienfeld-Teile bleiben bis MK-P die laufende Oberfläche und werden dann ersetzt; Titel MK1/MK5 angepasst; RADIAS-Bezüge in MK6 und MK7 gestrichen.
- **73** · MK8 neu · Programm-Speicher A–H × 16 mit 128 eigenen Werksklängen; Platz-Raster wie am MS2000 (aus der Voice Name List nur Kategorie und Modus); Bank H mit 6 Vocoder-Programmen, Eingangs-Programm H15 und INIT H16; WRITE auf einen Platz, WERKSKLANG ZURÜCK; Werksdaten je Bank entpackt; 13–15 h, +60 KB; ersetzt H-3.
- **74** · MK9 · Titel „späterer Import“; microKORG-Programme auf derselben Engine; Werksprogramme von Korg nie in der App; A.11-Verweis angepasst.
- **75** · MK10, Teil D · MK10 zurückgestellt (kein Gerät); Teil D nur noch in der Sicherung; die nachgezeichneten Wellen aus MK2 sind die eingebauten.
- **76** · MK11–MK13 · gestrichen mit allen Bezügen (Überblick, N3.0.1, EN3-01/12, N3.0.4, A.12, B.1, B.2, B.4, B.6, MK6, MK7, MK-P, E, F, G, H).
- **77** · MK-P Anlass, Ziel, Fester Rahmen, Ansichten, Gesten, Leistung, Daten · fester Rahmen (quer das ganze Blatt mit einer Kopfzeile von 44 px, H-17); Gesamtansicht direkt spielbar mit „Treffer = nächstes Element“ (quer die ganze Platte, ≈ 708 × 363 px auf dem 12 Pro Max; hochkant zwei Hälften); Tipp-Zoom, der einrastet und bis zur Karte bleibt; 13 Halte im Signalfluss (Xanders 11 Stationen, MOD SEQUENCE in zwei Halten, ANZEIGE angehängt); ◀ ▶ und Wischen ohne Umlauf; Karte oben; keine Abdeckung, kein Pinch; Formate neu gerechnet (`stations2.py`). Ersetzt Übersicht, Zoom-Felder und Lagekarte.
- **78** · MK-P Umfang 1, 3, 4, 4a, 5, 6 · H-16 entschieden; Lauflicht der SELECT-Tasten und SEQ EDIT mit den 16 Reglern wie am Gerät (HB-MS S. 16); Seitenplan ohne RADIAS- und microKORG-Einträge; TIMBRE SELECT T1 ↔ T2; Edit Sync, Solo und Step-Arp-Schritte nach H-18; WERKSKLANG ZURÜCK; Programm-Wahl A01 … H16.
- **79** · MK-P Aussehen, MK-P-11 · Anzeige mit dunklen Zeichen auf gelbgrün beleuchtetem Grund (ein Variablenpaar, Messgrenzen in MK-P-11).
- **80** · MK-P Abnahme · MK-P-01/03/05/07/08/09/12 angepasst, neu MK-P-13 (fester Rahmen, kein Layout-Sprung), MK-P-14 (Lauflicht, SEQ EDIT) und MK-P-15 (rein MS 2000); MK-P 21–25 h, +28 KB, Version 4.16.0.
- **81** · Teil E · Liste MK0–MK8 und MK-P, Versionen in Lieferreihenfolge 4.16.0/4.17.0, danach ab 4.18.0; Summen +428 KB, ≈ 101–117 h; E.3 neu ab gemessenem 4.15.0 (3 017 704 B) mit Ist-Faktor ×1,22 (`size4.py`): Planende 5,53 / 6,08 / 6,78 MB, 4,5 MB bei V9e / V9a / V7c, 5,0 MB bei V10f / V10a / V4e; SL1-Auslöser ≈ V7c.
- **82** · Teil F, G, Quellen · Fach-Prüfung für MK-P und MK8 (G-MKP), MK9 und MK10 erst beim Bau; Teil G Nr. 4, 7, 8, 11, 12, 13, 16, 17, 18 angepasst; Rev.-3-Lektüre und eigene Rechnungen.
- **83** · Teil H · H-16 entschieden; H-2 ruht, H-3 und H-11 durch den 26.10. überholt; H-12, H-14 und H-15 entfallen; offen bleiben H-13 und neu H-17 (Quer-Blatt über den ganzen Bildschirm) und H-18 (microKORG-Extras).

**Nachprüfung zu Rev. 3 (26.10., unabhängig; Sicherung davor `scratchpad/rev1-tools/n3-vor-pure-review.md.bak`).** Gesucht über die ganze Spec nach microKORG, EDIT-WAHL, RADIAS, MK11–MK13, Genre, H-14, SHIFT, Holzwangen, Halb-Ansicht, M-SKIZZE; Versionen und Summen in E–G gegen die Paketabschnitte; MK-P-Navigation gegen Xanders Wünsche vom 26.10.; MK8 gegen HB-MS.

- **84** · E.3 · Gegenrechnung mit MK-P +28 KB (`size4.py` trägt noch +27 KB): Bei ×1,22 erreicht der Plan 4,5 MB schon bei **V8b** statt V9a. Tabelle und Hinweis zum Skript angepasst. Bestätigt: 3,05 / 3,11 / 3,14 MB nach MK-P, MK8, VS3 (nach Budget), Planende 5,53 / 6,08 / 6,78 MB, 5,0 MB bei V10f / V10a / V4e, 4,5 MB bei V9e (Budget) und V7c (×1,5). Prot. 81 nennt noch V9a.
- **85** · E.1 · Die Vergleichszeile nannte für den Stand mit MK-P 119–138,5 h; dessen Paketzeilen ergaben 138 h (Rechenfehler seit Prot. 68). Jetzt „119–138 h“; die Differenz zu 101–117 h geht genau auf (−14,5–17,5, −10,5–12, +5–6, +2–2,5). Geprüft und gleich in Überblick, Teil C, E.1, E.4, G Nr. 8, H und Rev.-3-Kopf: +428 KB (offen +88), ≈ 101–117 h (offen 34–40), mit Fach-Prüfung 111–137 h (offen 36–44); MK0 4.8.1, MK1–MK7 4.9.0–4.15.0, MK-P 4.16.0 und MK8 4.17.0 in Lieferreihenfolge, danach ab 4.18.0.
- **86** · EN3-07, MK8 Umfang 2, MK8-02, Quellen · Die Voice Name List steht in HB-MS auf **S. 67–69** (Inhaltsverzeichnis 67, Bank H auf S. 69), nicht S. 68–70. MK8 gegen die Liste geprüft (nur Kategorie und Modus): 128 Plätze A–H × 16 wie HB-MS S. 13, Rollen 01–16 stimmen, H09–H14 Vocoder, H15 Eingang, H16 INIT. BANK ▼ ▲ mit SELECT 1–16 und −/NO +/YES als Programm-Wahl stimmen mit HB-MS S. 13.
- **87** · B.6 Nr. 1, MK9, MK10 · „Pakete können nach E.1/E.2 Nr. 4 rücken“ zeigte nach Rev. 3 ins Leere (E.2 Nr. 4 = zurückgestellt) → MK-P und MK8 bekommen ihre Nummern in Lieferreihenfolge (E.1). MK9 und MK10 sagten noch „Zwischennummer“ (MK10 mit dem Beispiel 4.17.1) → die nächste freie Nummer in Bau-Reihenfolge (E.4), wie E.1 „Tore“.
- **88** · MK10 Ziel und Umfang 1 · „Xanders eigene microKORG-Aufnahmen“, „microKORG → AG06“ und „OCTAVE SHIFT“ waren microKORG-Reste im ruhenden MS2000-Paket → „Aufnahmen am Gerät“ (microKORG nur noch als mögliche Quelle derselben Wellen), „Gerät → AG06“, „OCTAVE −2“.
- **89** · MK-P-15, MK-P-13 · Die Prüfung „kein SHIFT, kein SEITE in DOM, Hilfe und LCD“ wäre am echten Aufdruck FORMANT SHIFT (FILTER TYPE im Vocoder) und an GLOBAL 1D SEITEN-SPRUNG gescheitert; jetzt mit genau diesen Ausnahmen. „Bitgleich zu 4.15.0“ → zum Vorgänger-Stand (B.6 Nr. 1), weil MK8 vor MK-P ausgeliefert sein kann. „M-ANSICHT 0 px“ als strengere Grenze kenntlich gemacht (M-ANSICHT erlaubt sonst 2 px).
- **90** · ganze Spec · Ergebnis der Suche: microKORG steht nur noch als Quelle bzw. späterer Import (HB-MK-Spalten in Teil A, A.11, EN3-15, MK9, H-7, H-18), als verbotenes Wort (EN3-05, B.6 Nr. 9, MK-P-06, H-4) und in den gebauten Abschnitten MK1–MK7, die Teil C (Kopf) als Bau-Beleg der alten Oberfläche ausweist. EDIT-WAHL, Holzwangen, Halb-Ansicht und M-SKIZZE stehen nur dort, im Hinweis von B.3, in B.6 Nr. 5 (gilt bis MK-P) und als Abbau-Prüfung in MK-P. RADIAS, MK11–MK13, Genre-Bänke und H-14 stehen nur als „gestrichen“ bzw. „entfallen“. SHIFT steht auf der Platte nur im Aufdruck FORMANT SHIFT; sonst nur als HB-MK-Quelle und als Umzug/Abbau in MK-P. MK-P-Navigation stimmt mit Xanders Wünschen: quer die ganze Platte direkt spielbar (≈ 708 × 363 px); ein Tipp auf eine Sektion gleitet in 250 ms in ihren Halt, der einrastet und bis zum Tipp auf die Karte bleibt (der einzige Weg zurück); ◀ ▶ und Wischen folgen OSC 1 → … → VIRTUAL PATCH (13 Halte: MOD SEQUENCE in zwei Hälften, ANZEIGE angehängt); dieselbe Platte ohne Abdeckung; fester Rahmen ohne Layout-Sprung (MK-P-13); Lauflicht auf SELECT 1–16 und SEQ EDIT mit den 16 Reglern nach HB-MS S. 16 (MK-P-14). Die Maßstäbe der Tabelle „Formate“ sind mit `stations2.py` nachgerechnet und stimmen.
