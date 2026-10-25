# SYNQUENZER v3 — Nachtrag 3 zur Bau-Spezifikation: MS2000-Klangerzeuger (Pakete MK1–MK13)

Stand 25.10.2026, **Rev. 1** nach dem Review (Protokoll am Ende) · Status: **Entwurf zur Freigabe.** Er gilt für den Bau, sobald der Orchestrator ihn Xander gezeigt hat. Bis Xander die offenen Fragen (Teil H) beantwortet, gilt jeweils die genannte **Vorgabe**. Builder und Tester lesen Spec v3, Nachtrag 1, Nachtrag 2 **und** diesen Nachtrag. **Vorrang für die MK-Pakete: Nachtrag 3 vor Nachtrag 2 vor Nachtrag 1 vor Spec v3.** Alles, was hier nicht geändert wird, bleibt gültig: L1–L10, M-Messverfahren und DoD der Spec, Teil J (Fach-Prüfung), EN2-28 (Größe), E.5 (Bau-Regeln).

## Überblick (für den Orchestrator)

- **14 Pakete** MK0–MK13, zusammen **≈ 95–110 h** reine Bauzeit. Dazu kommt die Fach-Prüfung mit 1–2 h je Paket. Die Datei wächst nach Budget um **≈ +463 KB** (dazu ≈ +12 KB in V5d, V6a, V5c, V1d und VC4, H-9); mit dem gemessenen Überzug der gebauten Pakete (×1,5, E.3) um ≈ +0,7 MB. App-Version **4.8.1 (MK0), dann 4.9.0 → 4.21.0**. Das **Speicherformat** steigt nur einmal, mit MK1 (4 → 5). **MK0** sorgt vorher dafür, dass kein ausgelieferter Stand Klänge einer neueren Engine verwirft oder überschreibt (EN3-04).
- **Kern (MS2000 komplett):** MK1–MK7 bauen die Klangerzeugung, die Effekte, den Arpeggiator, den Mod-Sequenzer und den Vocoder. MK8 bringt eigene Werksklänge in 8 Genre-Bänken.
- **MK9** importiert eigene .syx/.prg-Dateien, nur lokal. Tor: ein Formatbeleg.
- **MK10** baut die Speicherwellen aus Xanders Aufnahmen. Tor: die Aufnahmen nach Teil D.
- **MK11–MK13** bringen die RADIAS-Teile ohne Samples: zweites Filter, Verzerrer, dritte Hüllkurve, Formant-Oszillator, mehr Stimmen.
- **Größe (wichtig, H-1):** Nach Budget endet der Restplan ohne MK bei ≈ 4,98 MB, mit MK bei ≈ 5,46 MB. Die gebauten Pakete lagen aber im Mittel bei ×1,5 ihres Budgets (E.3). Mit diesem Faktor endet der Plan bei ≈ 7,0 MB, und die Grenze von 5,0 MB (EN2-28) fällt **mitten im Plan**: 4,5 MB bei ≈ V6a, 5,0 MB bei ≈ V8b. Die MK-Pakete selbst passen (nach MK13 ≈ 3,1–3,4 MB). Lösungswege stehen in H-1, das Schlankheits-Paket SL1 in E.3a.
- **Was wiederverwendet wird:** der Stimmenpool von AnalogCore mit Ereignisprotokoll, Tempo, 30-ms-Stimmenblende, 40-ms-Engine-Blende und Lastbericht. Dazu Ladder-Filter mit 4 der 6 Abgriffe, polyBLEP-Säge/-Puls/-Sync, Hüllkurven-Kern, LFO-Formen und Mod-Matrix. Außerdem das Mipmap-Verfahren aus V4a (für AM als gemeinsamer, DOM-freier Tabellen-Bau nach Spec §10.1 neu gebaut, MK2), `MIC_ASK` und die Wege-Erkennung aus VS1 (mit einem gemeinsamen Mikrofon-Abgriff, MK7), der MIDI-Eingang, der .syx-Dateiweg, sowie Bibliothek, Undo, Blatt-Rahmen und Regler. Neu ist alles, was A.12 nennt (Teil A).

---

## N3.0 Grundlagen

### N3.0.1 Xanders Plan (24.10.2026, verbindlich, Kurzfassung des Auftrags)

1. **Kern = kompletter MS2000-Klangerzeuger.** Dazu gehört die microKORG-Engine: 2 Oszillatoren mit allen Wellenformen und Modi inkl. Ring/Sync, Rauschen, Mixer, Filter mit allen Typen, 2 Hüllkurven, 2 LFOs, 4 virtuelle Patches, Timbres/Layer/Split, Stimmen-Modi, Mod-FX, Delay, EQ. Dazu kommen Mod-Sequenzer 3×16, 16-Band-Vocoder und Step-Arpeggiator.
2. **Oberfläche wiedererkennbar wie microKORG:** Bedien-Logik, Regler-Gruppen, Preset-Bänke nach Genres. **Kein Korg-Name, kein Logo, keine Werksdaten von Korg im Werk.** Die Presets sind eigene Klänge nach Kategorien. Eigene .prg/.syx-Dateien werden nur lokal im Browser importiert: nie hochladen, nie mitliefern.
3. **DWGS-Wellen kommen später aus Xanders eigenen microKORG-Aufnahmen** (Filter offen, OSC2 aus, Effekte aus, mehrere Oktaven). Das ist ein eigenes, späteres Paket mit Aufnahme-Anleitung. Bis dahin gibt es additiv nachgebildete Platzhalter, klar als Platzhalter markiert.
4. **Danach die RADIAS-Teile ohne Samples:** 2. Filter (seriell/parallel/individuell), Verzerrer/Drive, 3. Hüllkurve, Formant-Oszillator, mehr Stimmen. Kein 1:1-RADIAS.
5. **Muss auf dem iPhone 12 Pro Max flüssig laufen.** Dazu gehören ein Stimmen-Budget, CPU-Messung und AudioWorklet, wo nötig. WebGL nur, wo es wirklich etwas bringt. Dateigrenze 5,0 MB gesamt (EN2-28).
6. **Reihenfolge** (Nachtrag 2, „Korrektur 24.10.“): G-P1b → G-P2 (V2d′ ✓, V2e, V2e′, VS3) → **microKORG** → V2a′, V2c′ ✓, V2f, VL, V7a, VC2a, VS4 …

### N3.0.2 Quellen und Kürzel

| Kürzel | Quelle | Seitenangabe |
|---|---|---|
| **HB-MS** | `scratchpad/manuals/ms2000.txt`, MS2000/MS2000R Owner's Manual (83 S.) | gedruckte Seitenzahl „S. 39“. PDF-Seite = S. + 6 |
| **HB-MK** | `scratchpad/manuals/microkorg.txt`, microKORG Owner's Manual | gedruckte Seitenzahl. PDF-Seite = S. + 6. Die Listen am Ende (Voice Name List, Parameter List) haben keine Seitenzahl: „PDF 77/78“ |
| **KF** | `/home/user/synquenzer/forschung/r9/korg-familien.md` (Recherche 24.10.) | Kennungen [B]/[W]/[U] wie dort |
| **N2** | `v3-ideen/dirigent-spec-v3-nachtrag-2.md` | Teil J, EN2-28, E.4, E.5, „Nachtrag zur Reihenfolge“, Synth-Plan |
| **App** | `scratchpad/dirigent-wt/index.html`, Stand V2d′ = **4.6.0**, 2 473 307 Byte, gelesen am 25.10. | Zeilennummern „Z. 3887“ beziehen sich auf diese Datei |

- **Urheberrecht:** Aus den Handbüchern sind nur Fakten übernommen: Parameternamen, Wertebereiche, Tabellenwerte, Reihenfolgen. Es gibt keine Textpassagen. Die Handbücher bleiben privat: nicht im Repo, nicht in der App, nicht in Hilfe-Texten.
- **Kennzeichen:** **[B]** belegt (Handbuch mit Seite) · **[W]** wahrscheinlich · **[U]** unbelegt · **eK** eigene Festlegung. Jede eK-Kurve steht genau einmal in der W-Tabelle (B.2). Ein späterer Abgleich ändert dann nur diese Tabelle.
- **Nicht möglich:** Es gibt kein RADIAS-Handbuch (Xander: „nicht nötig“, `fragen-xander-9.md`). Es gibt keinen Korg-Formatbeleg für SysEx-Programmdaten: HB-MS S. 64 verweist auf eine eigene „MIDI Implementation“, die nicht im Handbuch steht. Daraus folgt das Tor für MK9. Kein Klang wurde angehört, nichts wurde am iPhone gemessen.

### N3.0.3 Neue Entscheidungen

| # | Entscheidung | Begründung |
|---|---|---|
| **EN3-01** | **Geltung.** Dieser Nachtrag regelt die Pakete MK1–MK13 und ihre Reihenfolge. Bei Widerspruch gilt er vor N2, N1 und Spec. Die bestehenden Pakete werden nur in Teil G berührt, und zwar nur als Hinweis oder als Versionsnummer. | Auftrag „Bau-Spezifikation MS2000“. |
| **EN3-02** | **Eigene Engine `mk` als Zweig `eng 3` in AnalogCore**, nicht als Erweiterung der VA-Engine. `eng 2` ist schon für die Tabellen-Engine von V8a vergeben (Spec §10.1, V8a); AM nimmt deshalb die nächste freie Nummer. Der Stimmenpool (`POOL` 12), das Ereignisprotokoll, das Tempo, die Stimmenblende (SXF, V4a), die Engine-Blende (`engXf`), die Last-Berichte und der Ladder werden mitbenutzt. Die VA-Klänge bleiben bitgleich. | Die MS2000-Logik weicht von VA ab: zwei Timbres, Wellen-Algorithmen mit CONTROL 1/2, Ganzzahl-Einheiten, Unison als Stimmenstapel. Ein Umbau von VA würde gespeicherte Klänge gefährden (I-10, L7). |
| **EN3-03** | **Daten in Geräte-Einheiten.** `p.mk` speichert Ganzzahlen genau in den Bereichen der Handbücher (000…127, ±63, Listen-Indizes). Die Umrechnung in Hz, s und ct macht nur die W-Tabelle (B.2). **Während einer Geste** geht der ungerundete Reglerwert (Bruchteil einer Geräte-Einheit) an das Worklet; gerundet wird erst beim Abschluss der Geste und für Undo (B.6 Nr. 2). | Import 1:1 (MK9), prüfbare Bereiche, ein Ort für Kurven-Abgleich. Ganzzahlen allein gäben beim Drehen Stufen von ≈ 0,94 HT (Cutoff), die bei hoher Resonanz als Tonleiter hörbar sind. |
| **EN3-04** | **Speicherformat 5 mit MK1, Vorab-Schutz mit MK0.** `PROJECT_FORMAT` 4 → 5 und `SOUNDS_FORMAT` 1 → 2 kommen mit MK1. Heute verwirft `normalizeSound` (Z. 7918, `if (!engine) return null`) eine unbekannte Engine. Ein 4.x-Stand (Paar-Raum-Partner, alter `sw.js`-Cache, Rückfall) ersetzt AM-Sounds deshalb stillschweigend und speichert danach per Autosave Format 4 über das Projekt, lokal und online. Die Meldung „Projekt aus einer neueren Version“ (Z. 8163) kommt nur beim Datei-Import von Hand. **MK0** (4.8.1, vor MK1) behebt das: Ein Sound mit unbekannter Engine bleibt **undurchsichtig erhalten** (`engine`, `p`, `mods`, `fx` unverändert), die Spur spielt INIT mit Hinweis „Klang aus neuerer Version“. Enthält das KV-Projekt, die Bibliothek oder die Cloud-Bibliothek eine unbekannte Engine oder ein Format über `PROJECT_FORMAT`, überschreibt Autosave die KV-Kopie nicht, und die App schickt kein `cloudLibPush` einer Liste ohne diese Sounds. Damit brauchen auch die später geplanten Engines (`mask`, `add`, `body`, `resyn`; V8a, V9a, V9b, V9d′) **keinen weiteren Formatsprung**. Neue Schlüssel sind neutral (I-10). `save_project` bleibt unverändert (VO-R1 lehnt ein kleineres `p_format` schon ab: `outdated` + `keep_conflict`); `save_library` hat keinen solchen Wächter und ist durch MK0 geschützt. Online braucht es `max_format` 5 und `max_app` je Version, jeweils nur mit Xanders Okay (N2 G.8), und erst nach MK0. | Daten-Sicherheit (L7) und Versions-Wächter VO-R1. Der Server-Wächter `max_app` ist nur eine Obergrenze (`greatest(max_app, 4005002)`) und hält ältere Stände nicht auf. Restrisiko: Stände vor 4.8.1 verwerfen weiter; darum der Rollout erst nach MK0 (E.5 Nr. 2). |
| **EN3-05** | **Keine Marken im AM-Teil.** Der AM-Teil der ausgelieferten Datei (Block `sq-mk-src`, AM-Zweig des Worklets zwischen festen Marken, AM-Hilfe- und LCD-Zeilen, AM-Werksnamen) enthält keines dieser Wörter: Korg, microKORG, MS2000, MS 2000, MS-2000, RADIAS, DWGS, DW-6000, DW-8000, VOX. Das gilt auch für Kommentare. In der **ganzen** Datei gilt das für die Gerätenamen dieses Plans (microKORG, MS2000, RADIAS, DWGS). Andere Pakete dürfen nach ihren eigenen Regeln Geräte im ⓘ nennen (N2 D.1 Nr. 4; V10P, V10d, VI3). Die Engine heißt sichtbar nach **H-4** (Vorgabe „DUO“). Dieser Nachtrag nennt sie weiter **AM** (Arbeitsname, intern `mk`); wo hier sichtbare Texte „AM“ zeigen, steht in der App der Name nach H-4. Wellen, Sektionen und Funktionen tragen eigene deutsche Namen, zum Beispiel „Speicherwelle“, „Stimmwelle“, „Formant halten“ und „Bewegung aufnehmen“. Genre-Namen der Bänke sind allgemeine Stilwörter. | Xanders Plan Punkt 2. Die App enthält heute 0 Treffer (geprüft). Eine Sperre aller Wörter über die ganze Datei würde spätere Pakete mit Geräte-ⓘ scheitern lassen. |
| **EN3-06** | **Handbuch-Fakten nur in der Spec, nicht in der App.** Hilfe-Zeilen (L10) und ⓘ-Texte sind eigene Sätze. | Urheberrecht. |
| **EN3-07** | **Werksklänge = eigene Rezepte.** Eine Namensprüfung läuft gegen die Werks-Programmlisten (HB-MK PDF 77, HB-MS S. 68–70). Diese Listen stehen nur in einer privaten Datei neben den Handbüchern (`scratchpad/manuals/werksnamen.local.json`), nie im Testskript, im Repo oder in der App (E.5 Nr. 5). | Plan Punkt 2. Die Testskripte werden ins öffentliche Repo kopiert (`wip-push.sh` → `bau/tests/`). |
| **EN3-08** | **Import nur lokal.** Importierte Klänge tragen 🔒 (`loc: 1`); `normalizeSound` behält `loc` und `locRef` (MK9). Eine einzige Funktion `mkLocalStrip()` ist die **einzige Ausgangs-Schleuse**: Sie ersetzt 🔒-Sounds durch einen Platzhalter in **allen** Wegen, auf denen Daten den Speicher-Ursprung verlassen. Das sind Server-Autosave, `save_library`, Paar-Raum/Realtime, Mitmach-Link, Teilen und später VO3, VO4a–c, VC2b/VC2c, VC3/VC3b und VC4 (auch `sample` und `room.sendToClaudeSession`), Regel MK-R2 (EN3-19). Ausgenommen ist nur die eigene Übergabe Claude-App → Safari (`#import` aus `cloudHandoffUrl`), weil das Fragment nie einen Server erreicht (MK9 Umfang 5). Die Tests verwenden nur synthetische Dumps aus einem eigenen Schreiber. | Plan Punkt 2: „nie hochladen, nie mitliefern“. |
| **EN3-08a** | **🔒 steckt an.** Jede Sound- oder Spur-Kopie, die irgendwelche Daten aus einem `loc: 1`-Sound übernimmt, bekommt `loc: 1` und behält dessen `origin`: Timbre kopieren (MK3), Sequenz kopieren (MK6), A/B, Speichern als, Duplizieren, Laden in eine Spur, Kopieren aus der Bibliothek. `saveSound` löscht `loc`/`locRef` nie. | Sonst ginge ein abgeleiteter Sound über Autosave und `save_library` hinaus, obwohl jede Abnahme besteht. |
| **EN3-09** | **Speicherwellen:** Bis MK10 gibt es 64 additive Platzhalter mit „≈“. Was MK10 aus Xanders Aufnahmen gewinnt, bleibt **lokal auf seinem Gerät**, bis Xander anders entscheidet. Andere Geräte hören die Platzhalter. | Wie EN2-11 (DX7-ROM): Die Wellen sind Korg-Daten aus seinem Gerät, die Lizenz ist ungeklärt → H-2. |
| **EN3-10** | **Ein Tempo.** Arp, LFO-Sync, Delay-Sync und Mod-Seq folgen dem Song-Tempo `S.bpm`. Das Feld `arp.tempo` (20…300) wird nur gespeichert, für Import und Anzeige. Es verhält sich wie am Gerät mit „Clock = External“ (HB-MS S. 45, HB-MK S. 44). | In einem Sequencer gibt es eine Uhr. Zwei Tempi würden auseinanderlaufen. |
| **EN3-11** | **Arp im Hauptfaden, Mod-Seq und Vocoder im Worklet.** Der Arp setzt zwischen Notenquelle und `spawnVoice` an (Z. 12610). Sein Planer läuft in `tick()` **vor** der Prüfung `R.playing` (Z. 13137), mit dem vorhandenen Vorlauf (`LOOKAHEAD` 0,1 s, Z. 12917), und schreibt `noteLog`. Er schickt dem Worklet zusätzlich den **Tastensatz** als eigenes Ereignis KEYS (Typ 9 = erste Taste gedrückt, Typ 10 = alle Tasten los, je mit Zeitstempel). Aufnahmen (● REC) speichern die **gespielten Tasten**, nicht die Arp-Noten (Vorgabe, H-8). Der Arp läuft auch im ECO-Klang (B.5). | M-ZEIT-Prüfung über `noteLog`. Die Ereignisse sind sampelgenau (16-Sample-Blöcke). Seq und Vocoder brauchen Stimmen- bzw. Audiotakt. Ohne KEYS sähe das Worklet nur Arp-Noten und setzte Key Sync „Timbre“ bei jedem Arp-Schritt zurück; das Gerät unterscheidet gespielte Tasten von Arp-Wiederholungen (HB-MS S. 43, S. 63). |
| **EN3-12** | **Stimmen-Budget:** 4 Stimmen je AM-Spur wie MS2000 (HB-MS S. 2). MK13 erlaubt 8. Der CPU-Begrenzer ändert nie Gespeichertes (I-08), Stufen in B.4. | Plan Punkt 5. |
| **EN3-13** | **Kein WebGL im AM-Bedienfeld.** Die Regler bleiben DOM. Schritt- und Bandanzeigen (≤ 16 Säulen, ≤ 30 Hz, nur sichtbar) zeichnet Canvas 2D. | WebGL lohnt erst bei Tausenden Elementen. Ein zusätzlicher GL-Kontext kostet Speicher und Startzeit auf dem iPhone. PE1 (rAF ≥ 55 fps) ist die Prüfung. |
| **EN3-14** | **AM-Code nachladen, Kern immer da.** Der Worklet-Teil steht im vorhandenen Worklet-Quelltext (ASCII). Im Hauptfaden gibt es zwei Teile. **(1) Immer geladen, klein, im oder vor `SQStore`** (wie FMX, CHANGES-V3): Engine-Eintrag `mk`, `normMk`, INIT AM, `mkToFlat`, `mkLocalStrip`, die `loc`/`locRef`-Behandlung und EN3-08a. **(2) Nachgeladen** als `<script type="text/plain" id="sq-mk-src">`: Bedienfeld, Arp, Import-Parser, Werksdaten, Tabellen-Bau (`mkTables`, B.4). Ausgewertet wird (2) beim ersten Bedarf: AM-Sound im geöffneten Projekt (dann **schon während des Ladens**, bevor der Transport starten kann), Engine-Knopf AM, Bibliothek mit AM-Filter oder Leistungs-Probe. Vor der Auswertung und vor jedem Entpack-Schub ruft die App `tickAhead(.3)` (Z. 13125); zwischen zwei Tabellen-Häppchen ≤ 8 ms liegt mindestens ein Scheduler-Tick. | Ladezeiten haben Vorrang (CLAUDE.md, Punkt 2). Projekte ohne AM starten wie bisher. Teil (1) muss beim Start und in jedem Upload wirken: Ein Engine-Block überlebt nur, wenn sein Modul da ist (Z. 7873), und `Library.load`/`Autosave.load` normalisieren jeden Sound beim Start (Z. 8247, 8340). Der Scheduler plant nur 100 ms voraus (Z. 12917): Ein Stillstand > 75 ms macht Noten auf allen Spuren spät, > 200 ms fallen sie aus. Block (2) lässt sich später als Ganzes packen (H-1). |
| **EN3-15** | **Zwei Eingänge je AM-Spur.** **E1** heißt „Instrument“ (MS2000 AUDIO IN 1), **E2** heißt „Stimme“ (AUDIO IN 2, Vocoder-Modulator). Der microKORG nummeriert seine Buchsen andersherum (dort IN 1 = Mikrofon ≙ E2, IN 2 = Line ≙ E1; A.11 Nr. 5). Jeder Eingang ist wählbar: Mikrofon (nur auf der Pages-Seite, über den gemeinsamen Mikrofon-Abgriff aus MK7, Start nur auf Tipp), eine andere Spur (Abgriff **vor** ihrem Fader, MK7) oder aus. Die Wahl gehört zur Spur (`tr.mkIn`), nicht zum Sound. | HB-MS S. 4, S. 38, S. 49; HB-MK S. 31, S. 33. Das Mikrofon geht nur außerhalb der Claude-App (EN2-06). |
| **EN3-16** | **Geräte-Abgleich.** Xander besitzt einen microKORG. Jedes Paket nennt Punkte, die er nach Gehör am Gerät vergleicht. Das blockiert nicht. Ergebnisse ändern nur die W-Tabelle, mit Wert und Grund in CHANGES. | Viele Kurven sind eK. Das Gerät ist die beste Referenz, die wir haben. |
| **EN3-17** | **Zwischenstände.** Artifact und Pages bekommen je einen Stand nach MK1, MK4, MK7, MK8, MK10 und MK13 (EN2-15 sinngemäß; die Untergruppen stehen in E.1). | Xander will früh hören. Der Vocoder mit Mikrofon geht nur auf Pages. |
| **EN3-18** | **Regel MK-R1:** Jeder neue stetige AM-Regler ist automatisch ein Ziel des Mod-Sequenzers (ab MK6) und ein Patch-Ziel, wenn A.5 es nennt. In das App-Mod-System (Halten → Mod-Picker, `MODT`) kommen AM-Regler erst mit V5d (MOD-R1). Als Pad-Quelle kommt AM erst mit V1d (PAD-R1). Weil MK jetzt **vor** V5d, V6a, V5b/c und V1d gebaut wird, werden die AM-Regler (2 Timbres mit je ≈ 60 stetigen Werten, dazu Seq und Vocoder) dort Pflicht-Ziele. Vorgabe **H-9 = ja** (Xanders Wunsch I4 „jeder Regler modulierbar“): Umfang, Abnahme, Stunden und KB dieser Pakete steigen (Teil G Nr. 4). | Die MS2000-Modulation (PATCH, SEQ) ist Teil des Plans. Das App-Mod-System ist es noch nicht (N1 EN-21). Die Pakete V5d ff. wurden ohne AM geplant. |
| **EN3-19** | **Regel MK-R2:** Jedes spätere Paket mit einem Weg vom Gerät weg (VO3, VO4a–c, VC2b/VC2c, VC3, VC3b, VC4 inkl. `sample` und `room.sendToClaudeSession`) ruft `mkLocalStrip` auf. Seine FP-SICHER-Prüfung prüft das (Teil G Nr. 10). | Die Liste in EN3-08 wäre sonst nur für heute vollständig. |

### N3.0.4 Was die App schon hat (Wiederverwendung)

| Baustein | Ort in der App (4.6.0) | Nutzung durch AM |
|---|---|---|
| Worklet-Prozessor AnalogCore, `eng` 0 VA / 1 FM6, Stimmenpool `POOL` 12, Steuerblock `CR` 16 | Z. 3517–5226 | `eng 3` = AM (`eng 2` gehört V8a). Die Pool-Plätze 5–12 fangen wie bisher die Stehl-Blenden ab. Heute rechnet der Prozessor nur `if (any)` (Z. 5143); der Vocoder-Pfad läuft auch ohne Stimme (MK7) |
| Ereignisprotokoll `{ev: [[t, typ, id, a, b, c]]}`, `{tempo}`, `{load}`, `{end}` | Kopf Z. 3527–3543 | Die bestehenden Ereignisse bleiben byte-gleich. AM ergänzt: `{mk: p.mk}` (strukturierte Kopie bei Laden oder Engine-Wechsel; dazu `processorOptions.mk` beim Anlegen des Knotens, `SynthHost.track` Z. 9384), `{mkSet: {Pfad: Wert}}` (Gesten; gesammelt wie WKSET/WKFM und in `spawnWkVoice` vor jeder Note abgegeben, Z. 12571), `{mkw}` (Tabellen, B.4), `{mkIn}` (Eingänge), KEYS Typ 9/10 (EN3-11) und beim ON ein 7. Element `d` = Timbre-Maske (0 = Modus entscheidet, 1 = T1, 2 = T2, 3 = beide; alte 6-Element-Ereignisse gelten als 0; MK5). `wkFlat` reicht nur flache Zahlen weiter (Z. 12217) und genügt für `p.mk` nicht |
| Stimmenblende bei Strukturwechsel (SXF 30 ms, V4a/V4a-fix), Engine-Blende 40 ms (`engXf`) | Z. 3566–3579; `structXf` Z. 4046, `engXf` Z. 4104 | SXF: Welle, OSC MOD, Filtertyp, HK │ GATE, ROUTING (MK11). `engXf` (alte Stimmen als Geister ausblenden, gehaltene Tasten neu verteilen): Zuweisung, Priorität, Auslösung, MODUS, STIMMEN, `vmax` (B.6 Nr. 2) |
| polyBLEP-Säge/-Puls, Hard-Sync-Pfad | Z. 4474 ff. | OSC1 Säge/Puls, OSC2, Sync, RingSync |
| Ladder mit Abgriffen `FMIX` (LP24, LP12, BP24, BP12, HP24, HP12) | Z. 3557, `ladder()` Z. 5086 | MS2000-Typen 24LPF = 0, 12LPF = 1, 12BPF = 3, 12HPF = 5. Cutoff = Polfrequenz der Stufen (W-01); die Ladder wird nicht verändert |
| Hüllkurven-Kern `envCoefs`/`envBlock` | Z. 3866–3886 | EG1, EG2 (MK12: EG3) |
| LFO-Formen `lfoVal` (Sinus, Dreieck, Säge, Rechteck, S&H), globale/je Stimme-Phase | Z. 4338 | LFO1/LFO2. Neu: Squ(+) unipolar, Key Sync „Timbre“ |
| Mod-Matrix (8 Plätze, Quellen/Ziele) | Z. 3559–3562 | PATCH 1–4 mit AM-eigenen Zielen |
| Tabellen-Wellen mit einer Mipmap je Oktave, Überblendung je Steuerblock (V4a, K2-40) | Worklet „Wave 0 … 11“ (Z. 3631–3673; beim Laden des Moduls gebaut) | Nur das **Verfahren**: AM bekommt einen eigenen, DOM-freien Bau `mkTables` im Hauptfaden (MK2, B.4), der zugleich der gemeinsame Tabellen-Bau nach Spec §10.1 ist. `waveTab` von V4a bleibt unverändert im Worklet. Nutzung: Speicherwellen, Endlos, MK10 (die Stimmwelle wird live gerechnet, W-28) |
| Spur-Kette (Drive, Chorus, Trem, Duck, Vol, Pan, Hall-/Echo-Send) | `buildChain` Z. 12013 | unverändert **hinter** dem AM-Ausgang (Reiter FX). Abgriff für AM-Eingänge vor Vol/Pan (MK7) |
| ECO-Rückfall (NativeVoice), Badge | `trackEco`, Z. 12215 | AM → VA-Näherung (B.5) |
| Klang-Datenmodell, `normalizeSound`, `soundHash`, Bibliothek, INIT je Engine; Engine-Listen `ENGINE_LABEL`, Browser, `setEngineOf` | Z. 7739–8000, Z. 11060 ff.; Z. 11162, 24409, 24509, 20343 | Engine `mk`, `normMk`, INIT AM; `mk` in allen Engine-Listen (MK1); Feld-Listen für `bank`/`slot` (MK8), `loc`/`locRef` (MK9), `tr.mkIn` (MK7) |
| Undo je Geste `soundEdit`/`commitSound` | Z. 20327 | jede AM-Geste |
| Blatt-Rahmen `sheetFrame`, `sKnob`, `knobRow` mit Klasse `k5`, `lcdShow`, `openPop`, fit-Klassen | Z. 20260, 20725, 20175, 19579 | AM-Bedienfeld |
| Mikrofon-Zugang (VS1: `MIC_ASK`, `getUserMedia` nur auf Tipp, play-and-record, Wege-Erkennung) | Z. 29401, Z. 29500 ff., Z. 30007 ff. | Eingang „Mikrofon“ über einen gemeinsamen, referenzgezählten Mikrofon-Abgriff ohne Stimm-Analyse (MK7). Die VS1-Sitzung (`stStart`, MPM, Ringpuffer) wird nicht mitbenutzt |
| MIDI-Eingang `connectMidi`/`onMidiMsg` (nur Note an/aus → `inputDown`/`inputUp`) | Z. 26587, Z. 29030–29047 | Notenquelle des Arp (MK5); Bend (0xE0) und CC1 nach H-5 (c) (MK1) |
| .syx-Dateiwahl ohne `accept` (iOS), lokale Verarbeitung | `importSyx` Z. 24724, Z. 26513 | MK9 |
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
| Timbre Select (Taste) | 1, 2 | S. 35 | S. 14 (dort auch Edit Sync: beide Timbres zugleich bearbeiten, und Solo; S. 64) | – | ✗ | MK3 (Edit Sync/Solo nach H-11) |
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
| Bend Range | −12…+12 HT | S. 36 | S. 17 | kein Bend-Rad; MIDI-Bend nur nach H-5 (c) | ✗ (gespeichert; wirkt nur mit MIDI-Bend, H-5) | MK1 |
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
| Last Step + Schritte an/aus (Step-Arp) | 1…8, 8 Schalter | – | S. 11, S. 45 (nur microKORG) | – | ✗ | MK5 |

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
| Formant Hold | Taste; der gehaltene Zustand wird im Programm gespeichert | – | S. 10, S. 35 | – | ✗ | MK7 |
| InitProgram im Vocoder | Voice Mode bleibt Vocoder | S. 51 | – | – | ✗ | MK7 |
| Performance-Regler im Vocoder | Regler 1/2 = Träger-Bandpässe (Cutoff/Resonance), 3/4 nur Amp-EG | – | S. 10 | – | ✗ | MK7 |

### A.10 Nicht übernommen (mit Grund)

- **Global** (Mst.Tune 430–450 Hz, Transpose, Vel.Curve, Position, AudioInThru, Protect, MIDI-Kanal, MIDI1/MIDI2-Zuweisung, Local, Clock, Filter, Dump, Pedal/Switch; HB-MS S. 53–57, HB-MK S. 47–51): Das regelt die App auf Projekt- und Geräte-Ebene (Tempo, Tastatur FEST/POSITION). Die App hat einen MIDI-Eingang, der heute nur Note an/aus verarbeitet (Z. 29030–29047); Bend und CC1 kommen nur nach H-5 (c) dazu. MIDI 1/MIDI 2 gelten fest als Bend/Mod-Rad (Werksbelegung, A.5).
- **CC/NRPN-Tabellen** (HB-MS S. 60–65): Sie dienen nur als Hilfe beim Import (Wertzuordnung), nicht als Funktion.
- **Demos, Write/Protect, Program-Banks A–H mit je 16** (HB-MS S. 2): Das übernimmt die Bibliothek. Die Bänke folgen dem microKORG-Muster (A.11).

### A.11 microKORG ↔ MS2000 (die Oberfläche zeigt den microKORG; die Fähigkeiten folgen dem MS2000)

1. Layer (microKORG) = Dual (MS2000). Split gibt es nur beim MS2000 → übernommen.
2. Vocoder: microKORG 8 Kanäle (16 Filter paarweise, S. 35), MS2000 16 Kanäle → 16. Der Import ordnet Kanal k den Bändern 2k−1 und 2k zu.
3. Step-Arp (Last Step 1–8, Schritt-Tasten) gibt es nur beim microKORG → übernommen.
4. Mod-Seq, Scale, Priority, Filter/Amp Vel Sense, Amp Sw und Split gibt es nur beim MS2000 → übernommen, als 6. Regler bzw. eigene Sektion (B.3).
5. Audio-In-Balance: Nach Funktion haben beide Geräte dieselbe Richtung (127 = nur der Mikrofon-Eingang). MS2000: 0 = nur IN 1 (Instrument, Träger), 127 = nur IN 2 (Mikrofon, Modulator) (HB-MS S. 38, S. 4, S. 17, S. 49). microKORG: 127 = nur AUDIO IN 1, 0 = nur AUDIO IN 2 (HB-MK S. 21); dort ist IN 1 die Mikrofon-Buchse (Modulator) und IN 2 LINE (Träger, INST LEVEL) (HB-MK S. 4, 10, 31, 33, 34). Der Import ordnet deshalb nach Funktion zu: **microKORG IN 1 → E2, IN 2 → E1; der Balance-Wert wird unverändert übernommen.**
6. Die Patch-Quellen heißen am microKORG FILTER EG, AMP EG, …, Pitch Bend, MOD.Wheel (S. 30). Das entspricht EG 1, EG 2, …, MIDI 1, MIDI 2 beim MS2000 (S. 42). FC-Mod-Quellen hat der microKORG ohne EG 1: 7 Einträge ab AMP EG (HB-MK S. 36 gegen HB-MS S. 50); der Import bildet sie nach Namen ab (MK9).
7. **Programme:** Der microKORG hat 8 Genre-Bänke × 2 Seiten × 8 Nummern = 128 (S. 8). Die Bänke heißen TRANCE, TECHNO/HOUSE, ELECTRONICA, D&B/BREAKS, HIPHOP/VINTAGE, RETRO, S.E./HIT und VOCODER (PDF 77). Das wird **übernommen als Bedien-Logik**: Genre-Bank ▾, Seite A│B, Tasten 1–8, Anzeige „A.24“.
8. **Performance Edit** (S. 8–9): Ist keine Sektion gewählt, steuern die Regler 1–5 Cutoff, Resonance, EG Attack (Filter- + Amp-EG), EG Release (Filter- + Amp-EG) und Tempo → Seite **SPIEL**. Im Vocoder-Programm wirken Regler 1/2 auf die Bandpässe des Trägers und 3/4 nur auf die Amp-EG (S. 10; B.3 SPIEL).
9. **Oktavlage:** Der microKORG speichert den Zustand OCTAVE SHIFT im Programm (HB-MK S. 58), der MS2000 nicht (HB-MS S. 36) → der Import rechnet ihn in Transpose um (MK9).

### A.12 Zusammenfassung — was dem SYNQUENZER-Synth fehlt

1. **Struktur:** zwei Timbres (Dual/Split), Timbre-Stimmenteilung, Programm-Effekte, Vocoder-Modus, Eingänge in die Klangerzeugung.
2. **Oszillator:** 6 von 8 OSC1-Algorithmen (Form-Säge, Form-Dreieck, Kreuzmodulation, Stimmwelle, 64 Speicherwellen, Rauschen mit Filter, Eingang). Dazu Ring und RingSync, OSC2-Tune-Kurve über ±2 Oktaven, Halbton bis −24.
3. **Hüllkurven/Amp:** EG2/Gate, EG Reset, bipolare Anschlag- und Keytrack-Werte, Amp-Keytrack, Distortion abhängig von den Mixer-Pegeln, Pan je Timbre.
4. **Stimmen:** Unison als Stimmenstapel, Priorität Last/Low/High für jede Zuweisung, MS2000-Trigger.
5. **Modulation:** LFO Squ(+), Key Sync „Timbre“, MS2000-Sync-Noten, Patch-Ziele OSC1 C1 und LFO2 Freq, Mod-Sequenzer 3×16 mit Motion Rec.
6. **Stimmung:** 10 Skalen, Grundton, eigene Stimmung.
7. **Effekte:** Cho/Flg, Ensemble, Phaser, 3 Delay-Typen und 2-Band-EQ, je Klang und mit Tempo.
8. **Spielhilfen:** Step-Arpeggiator.
9. **Vocoder:** 16 Bänder, Halten, Kanal-Pegel und -Pan.
10. **Bedienung/Bibliothek:** Bedienfeld nach microKORG-Logik, Genre-Bänke, Import, Speicherwellen aus Aufnahmen.
11. **RADIAS-Teile:** Filter 2 mit Routing, Verzerrer, EG3, Formant-Oszillator, 8 Stimmen.

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
  mode: 0,        // 0 Single, 1 Dual (= Layer), 2 Split, 3 Vocoder              HB-MS S. 34        (MK3, MK7)
  tv: 1,          // Timbre Voice: 0 = 1+3, 1 = 2+2, 2 = 3+1 (MK13 bei 8 Stimmen: 2+6, 4+4, 6+2); gilt nicht für ein Mono-Timbre (MK3)
  split: 60,      // Split Point 0…127 (MIDI-Note, C-1…G9); Noten < split → T1, ≥ split → T2 [W]
  scale: 0,       // 0 Gleichstufig … 9 Eigene (Reihenfolge HB-MS S. 34–35)        (MK3)
  skey: 0,        // Grundton 0…11 (C…B)
  usc: null,      // Eigene Stimmung: 12 × −100…+100 ct, nur bei scale 9 (Abweichung: HB-MS hat sie global, S. 57)
  vmax: 4,        // 4 | 8                                                          (MK13)
  t: [T, T],      // Timbre 1, Timbre 2 (T2 wird immer gespeichert, klingt nur bei mode 1/2)
  mfx: {type: 0, spd: 64, dep: 0},                       // Cho/Flg, Ensemble, Phaser; dep 0 = aus   (MK4)
  dly: {type: 0, sync: 0, time: 64, note: 8, dep: 0},    // Stereo, Cross, L/R; note = Index W-12  (MK4)
  eq:  {lf: 320, lg: 0, hf: 6000, hg: 0},                // Hz, Hz, dB (Schritt 0,5)               (MK4)
  arp: {on: 0, latch: 0, type: 0, range: 1, gate: 75, tgt: 0, ks: 0, res: 1, swing: 0,
        last: 8, steps: 255, tempo: 120},                // res = Index W-11; steps = Bitmaske 1…8 (MK5)
  voc: {gs: 0, th: 0, hpl: 0, hpg: 1, ins: 0, fs: 0, cut: 0, res: 0, msrc: 1, mint: 0,
        efs: 64, hold: null, lvl: 127, dir: 0, dist: 0, vel: 0, kbd: 0,
        chl: [127 ×16], chp: [0 ×16]}                    // hold = 16 × 0…127 oder null          (MK7)
}
T = {
  asg: 1, prio: 0, trig: 1, udet: 10,     // Assign 0 Mono 1 Poly 2 Unison · Priority 0 Last 1 Low 2 High · Trigger 0 Single 1 Multi
  trans: 0, tune: 0, vib: 0, bend: 2, porta: 0,
  o1: {w: 0, c1: 0, c2: 0},               // w: 0 Säge 1 Puls 2 Dreieck 3 Sinus× 4 Stimmwelle 5 Speicherwelle 6 Rauschen 7 Eingang (8 Formant, MK12)
  o2: {w: 0, mod: 0, semi: 0, tune: 0},   // w: 0 Säge 1 Rechteck 2 Dreieck · mod: 0 aus 1 Ring 2 Sync 3 Ring+Sync
  mix: {o1: 127, o2: 0, n: 0},
  f: {type: 0, cut: 127, res: 0, eg: 0, vel: 0, kbd: 0},   // type: 0 24LPF 1 12LPF 2 12BPF 3 12HPF
  a: {lvl: 127, pan: 0, gate: 0, dist: 0, vel: 0, kbd: 0}, // gate: 0 EG2 1 Gate
  e1: {a: 0, d: 64, s: 0, r: 0, rst: 1},
  e2: {a: 0, d: 64, s: 127, r: 8, rst: 1},
  l1: {w: 2, ks: 0, sync: 0, f: 64, note: 6},  // LFO1 w: 0 Säge 1 Rechteck 2 Dreieck 3 S/H
  l2: {w: 2, ks: 0, sync: 0, f: 64, note: 6},  // LFO2 w: 0 Säge 1 Rechteck(+) 2 Sinus 3 S/H · ks: 0 aus 1 Timbre 2 Stimme · note = Index W-09
  p: [{s: 0, d: 0, i: 0}, {s: 2, d: 4, i: 0}, {s: 3, d: 0, i: 0}, {s: 4, d: 5, i: 0}],
        // s: 0 EG1 1 EG2 2 LFO1 3 LFO2 4 Anschlag 5 Keytrack 6 Bend (MIDI 1) 7 Mod-Rad (MIDI 2) (8 EG3, MK12)
        // d: 0 Tonhöhe 1 OSZ2-Tonhöhe 2 OSZ1-Steuer 1 3 Rauschen 4 Cutoff 5 Amp 6 Pan 7 LFO2-Freq (8 Cutoff 2, 9 Verzerrer, MK11)
  seq: {on: 0, last: 16, type: 0, run: 1, ks: 1, res: 3, q: [{k: 0, m: 1, v: [0 ×16]} ×3]}  // res = Index W-10 (MK6)
  // MK11: f2 {type, cut, res, eg, kbd, vel, egs}, fr, fbal, drv {typ, amt} · MK12: e3 {a, d, s, r, rst}
}
```

- **Mod-Rad:** Für AM gilt der vorhandene flache Wert `p.mw` (0…1, „Mod-Rad“, Z. 11203). Er ist die Quelle „Mod-Rad“ (MIDI 2) und skaliert das Vibrato. Ein CC1 vom MIDI-Eingang überschreibt ihn live, solange er anliegt (H-5 (c)); das wird nicht gespeichert und macht keinen Undo-Schritt. Ebenso ein MIDI-Bend für die Quelle „Bend“ (MIDI 1).
- **Eingänge** (EN3-15) gehören zur Spur: `tr.mkIn = {e1: null | 'mic' | 't:<uid>', e2: …, e1Dry: 1, e2Dry: 1}`. `eDry` 0 = „Quelle nur als Eingang“ (H-10, MK7). Das Format bleibt 5, die Felder sind neutral. `normTrack`/`normalizeProject` behalten `tr.mkIn` (Z. 11490–11500).
- **`normMk(p)`** klemmt jedes Feld auf die Bereiche aus Teil A (Listen: Index 0…n−1, auf ganze Zahlen gerundet). Fehlende Felder bekommen die INIT-Werte, unbekannte Felder fallen weg. `normSynthP` ruft `normMk` auf, wenn `p.mk` existiert oder `engine === 'mk'`. Der Block bleibt bei jedem Engine-Wechsel erhalten (wie `p.fmx`, Z. 7872). `normMk` gehört zum immer geladenen Teil (EN3-14), sonst fiele `p.mk` beim ersten Laden der Bibliothek weg.
- **Feld-Listen:** `normalizeSound` behält nur aufgezählte Felder (Z. 7920–7928). Neu aufgenommen werden `bank`/`slot` (MK8) und `loc`/`locRef` (MK9). `ENGINE_LABEL` bekommt `mk` (Z. 11162; sonst zeigen `soundLabel`, Browser und MIDI-Spurname „VA“), die Engine-Listen des Browsers (Z. 24409, 24509) und die `setEngineOf`-Liste mit Aufräumen (Z. 20343, 20352) nehmen `mk` auf (MK1).
- **`soundHash`** bleibt (Z. 7765). `p.mk` ist Teil von `p` und zählt also mit.
- **Format 5** (EN3-04): `PROJECT_FORMAT` 5, `SOUNDS_FORMAT` 2. Format 3 und 4 laden unverändert. Die Meldung „Projekt aus einer neueren Version“ (Z. 8163) erscheint nur beim Datei-Import von Hand (`parseFile`, Z. 24623). `projFromFile` (Z. 26988; Wege Cloud und Projektwechsel), `Autosave.load` (Z. 8340), `Library.load` (Z. 8247) und `cloudLibMerge` verwerfen ohne Meldung; den Schutz bringt MK0. Online: `p_format` 5 wird erst nach dem Rollout `max_format` 5 angenommen. Bis dahin speichert die App lokal und meldet `bad_version` wie bisher.
- **INIT AM** (`f-init-am`, cat `init`, `INIT_IDS.mk`): genau die Vorgaben oben (Säge, Filter offen, EG2 Sustain 127, Release 8). Pegel wie MK1-20. Im Vocoder-Modus lädt ⋯ → Init INIT AM mit `mode` 3 und den Vocoder-Vorgaben (HB-MS S. 51).

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
| **W-15** | Unison-Verstimmung (d ct) | 4 Stimmen: −d/2, −d/6, +d/6, +d/2 · 3: −d/2, 0, +d/2 · 2: ±d/2 · 8 (MK13): gleichmäßig über ±d/2 | eK |
| **W-16** | Vibrato | Spitzenhub = v/63 · 200 ct · Mod-Rad (0…1), Quelle LFO2 | eK; Verdrahtung [B] S. 36 |
| **W-17** | Bend | Bereich v HT. Die App hat kein Rad → Wert 0. Kommt ein MIDI-Bend (0xE0) über den Eingang, wirkt er live über ± v HT (H-5 (c)) | [B] S. 36 |
| **W-18** | Patch-Intensität i | Ziel = i/63 · volle Spanne: Tonhöhe ±24 HT · OSZ2-Tonhöhe ±63 Fein-Einheiten (über W-14) · OSZ1-Steuer 1 ±127 · Rauschen ±127 · Cutoff ±127 Cutoff-Einheiten · Amp ±127 Pegel-Einheiten · Pan voller Weg L63↔R63 · LFO2-Freq ±127 (über W-08). **LFO2-Freq wirkt nicht, solange `l2.sync` = 1.** Quellen: EG 0…1, LFO −1…+1 (LFO2 Rechteck(+) 0…1), Anschlag vel, Keytrack (KT − 60)/60, Bend (MIDI-Bend −1…+1, sonst 0), Mod-Rad `p.mw` (bzw. live CC1). Rechnung in Bruchwerten (B.6 Nr. 2) | eK; Liste [B] S. 42; Tempo-Sync-Regel [B] HB-MS S. 41/42, HB-MK S. 29/30; MIDI 1/2 = Werksbelegung (A.5) |
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
| **W-44** | Formant-Oszillator (MK12) | Glottis-Puls + 4 parallele Resonatoren F1–F4. Vokale (Hz): a 730/1090/2440/3400 · e 530/1840/2480/3500 · i 270/2290/3010/3700 · o 570/840/2410/3300 · u 300/870/2240/3300. C1 morpht a → e → i → o → u über 0…127, C2 = LFO1-Tiefe. Glottis wie W-28, Resonatoren als TPT-SVF (B.6 Nr. 10). Die **Vokal-Quelle** (Glottis + F1–F4) baut MK7 (Probe-Modulator, `hold`-Spektren der MK8-Bank); MK12 macht daraus OSZ 1 Welle 8 | Werte nach Peterson & Barney (1952, Männer, gerundet), eK |
| **W-45** | Verzerrer (MK11) | Typ 1 weich: tanh(g·x)/tanh(g). Typ 2 hart: Klemme ±1/g' mit Pegelausgleich. Typ 3 Falter: Sinus-Falter sin(g·x). g = 1 + 15 · amt/127. 2× Überabtastung **und** ADAA 1. Ordnung (Stammfunktionen: log cosh, die der Klemme, −cos(g·x)/g) | eK |

### B.3 Bedienfeld („wiedererkennbar wie microKORG“, ohne Marke)

**Logik** (HB-MK S. 8–9, S. 13–15): Man wählt eine Sektion und dreht die Regler. Ohne Sektion greift die Spiel-Belegung (SPIEL). Programme wählt man über Genre-Bank, Seite A/B und Nummer 1–8. Beim Arpeggiator werden die Nummerntasten zu Schritt-Tasten.

**Maße:** Alle Breiten gelten für den Inhalt des Seitenrahmens `.pg` der Synth-Blätter (`.sh-body` 8 px, `.pg` 6 px + 1 px Rand je Seite; Z. 1981–1982, 2201–2202), nicht für den Bildschirm: **P1 360 px, P2 345, P3 290, L1 814, L2 637.** Im Querformat nimmt die Safe-Area am iPhone noch ≈ 47 px je Seite (`viewport-fit=cover`, Z. 5, 58–59): L1 hat am iPhone 12/13 real ≈ 720 px, am 12 Pro Max (926 × 428) ≈ 802 px. Die Querformat-Maße unten passen in 720 px.

**Rahmen:** Der vorhandene Synth-Blattkopf bleibt (`sheetFrame`):
- Zeile 1: Spurname, **Engine-Wahl VA │ FM │ WT │ AM** (Name nach H-4), ECO-Badge, ↶ ↷ ✕. **Breiten-Budget je Format** (MK1 misst es bei 320/375/390 px mit Spur-Chip und trägt die Werte hier und in CHANGES ein): Die Engine-Knöpfe bekommen ihre 44-px-Trefferhöhe senkrecht über `::after` (wie `.hb.edmL`, Z. 1006), nicht in der Breite. Sie müssen das dichte Raster erfüllen (≥ 36 px breit, 4 px Abstand), und der Spurname bleibt sichtbar. Heute sind sie je nach Breite und Spur-Chip schon 28–40 px breit und 34 px hoch (Z. 715, 721, 2290, 2342, 2350), und das ECO-Badge sitzt in P schon im VA-Knopf (Z. 20845). Passt ein 4. Knopf in P2/P3 nicht, gilt dort die Vorgabe zu H-4: **ein Engine-Chip** „VA ▾“ (zeigt die aktive Engine) mit `openPop` (4 Zeilen ≥ 44 px). Das ändert auch VA/FM/WT sichtbar und kommt nur mit Xanders Okay (CLAUDE.md Nr. 3).
- Zeile 2: ‹ Name ›, A/B, Sichern, 🎲, ◎, ⋯, ▶ Hören.
- LCD-Zeile.

Für AM sind die Reiter **[SPIEL] [EDIT 1] [EDIT 2] [SEQ] [FX]**:
- EDIT 2 kommt mit MK2, SEQ kommt mit MK6. Bis dahin sind diese Reiter ausgeblendet.
- FX ist die vorhandene App-Seite (SPUR, CHORUS, HALL, ECHO, MASTER) und bleibt unverändert.

**SPIEL** (P1, Körper ≤ 305 px):
1. Programmzeile a (44 px): [Bank ▾ ≤ 96 px] [A] [B] [Anzeige „A.24“ 56 px] [T1] [T2], zusammen 348 px. T1/T2 werden mit MK3 aktiv.
2. Nummern 1–8 (8 × 41 × 44, dichtes Raster mit 4 px Abstand, 356 px).
3. 5 Regler 72 × 92: CUTOFF, RESONANZ, ATTACK, RELEASE, TEMPO. ATTACK und RELEASE verschieben EG1 und EG2 gemeinsam um dasselbe Δ und klemmen jeweils. TEMPO = Song-Tempo, ein Undo, LCD „Tempo 120 · Song“. **Im Vocoder-Modus** (HB-MK S. 10): CUTOFF → `voc.cut` (−63…+63), RESONANZ → `voc.res`, ATTACK und RELEASE nur EG2; die LCD zeigt die Vocoder-Werte.
4. Schalterzeile (44 px): [ARP ●] [LATCH ●] (MK5), [SEQ ●] (MK6), [HALTEN ●] (nur Vocoder, MK7), [T1+2] [◐ SOLO] (MK3, nach H-11); 6 × 44 + 5 · 4 = 284 px. Die Plätze sind reserviert, nichts rückt nach.

Summe ≈ 244 px.

**EDIT 1 / EDIT 2** (P1): Sektionsraster **2 × 7 Zellen à 48 × 44** (7 · 48 + 6 · 4 = 360 px). Die Zellen bleiben an festen Plätzen, leere Zellen sind unsichtbar, aber reserviert (M-ANSICHT). Darunter liegt die Reglerzeile der gewählten Sektion:
- 1–5 Regler: 72 × 92, Klasse `k5`.
- 6 Regler: neue Klasse `k6` = `repeat(6, minmax(0, 60px))` mit `space-between` wie `k5` (P1 6 × 60, P2 je 57,5, P3 6 × 48).

Bei ARP A/B kommt die Schritt-Zeile dazu (8 × 41 × 44). Summe ≤ 244 px.

**Beschriftung:** In Zellen < 48 px (P3, L2) stehen Kurzformen (FLT 2, K-PEG, K-PAN) oder die 9-px-Klasse `.lg`. An Reglern ≤ 60 px (k6, P3) gilt dasselbe bzw. zwei Zeilen (`.mixk`, Z. 2012). M-PLATZ prüft für jede Zelle und jedes `.kl`: scrollWidth ≤ clientWidth (L6, nichts abgeschnitten).

| Raster | Zellen (Reihe 1 │ Reihe 2) |
|---|---|
| EDIT 1, Synth | PROG · STIMME · TONH. · OSZ 1 · OSZ 2 · MIXER · FILTER │ F-HK · AMP · A-HK · LFO 1 · LFO 2 · (FILTER 2, MK11) · (DRIVE, MK11) |
| EDIT 2, Synth | PATCH 1 · PATCH 2 · PATCH 3 · PATCH 4 · MOD-FX · DELAY · EQ │ ARP A · ARP B · (HK 3, MK12) |
| EDIT 1, Vocoder | PROG · STIMME · TONH. · OSZ 1 · EING. · MIXER · FILTER │ FC-MOD · AMP · F-HK · A-HK · LFO 1 · LFO 2 |
| EDIT 2, Vocoder | K-PEGEL · K-PAN · MOD-FX · DELAY · EQ │ ARP A · ARP B |

**Regler je Sektion** (Reihenfolge nach HB-MK „knob 1–5“; die MS2000-Werte kommen immer **nach** den microKORG-Reglern, als 6. Regler oder als eigene Sektion):

| Sektion | Regler (Beschriftung) | Quelle |
|---|---|---|
| PROG | MODUS · STIMMEN (1+3 │ 2+2 │ 3+1) · SPLIT · STIMMUNG · GRUNDTON | HB-MS S. 34–35 |
| STIMME | ZUWEISUNG (Mono │ Poly │ Unison) · AUSLÖSUNG (Single │ Multi) · UNI-VERST. · PRIORITÄT | S. 35–36; HB-MK S. 16 |
| TONH. | TRANSP. · FEIN · PORTAM. · BEND · VIBRATO · MOD-RAD (k6) | S. 36; HB-MK S. 17 |
| OSZ 1 | WELLE · STEUER 1 · STEUER 2. Die Beschriftung folgt der Welle: Säge FORM/WFM · Puls BREITE/PWM · Dreieck FORM/WFM · Sinus× X-MOD/X-LFO · Stimmwelle FORM/WFM · Speicherwelle –/WELLE · Rauschen CUTOFF/RESO. · Eingang BALANCE/BAL-LFO. Im Vocoder-Modus: Sinus FORM/WFM (W-27b) | S. 36–38, S. 49; HB-MK S. 18–21 |
| OSZ 2 | WELLE · MOD (aus │ Ring │ Sync │ Ring+Sync) · HALBTON · FEIN | S. 38; HB-MK S. 22 |
| MIXER | OSZ 1 · OSZ 2 · RAUSCHEN (Vocoder: OSZ 1 · EINGANG 1 · RAUSCHEN · QUELLE 1 ▾) | S. 38, S. 50 |
| FILTER | TYP · CUTOFF · RESONANZ · HK-INT · KEYTRACK · ANSCHLAG (k6) | S. 39; HB-MK S. 24–25 |
| F-HK, A-HK | ATTACK · DECAY · SUSTAIN · RELEASE · NEUSTART | S. 40–41; HB-MK S. 26, S. 28 |
| AMP | PEGEL · PAN · VERZERR. · KEYTRACK · HK │ GATE · ANSCHLAG (k6) | S. 40; HB-MK S. 27 |
| LFO 1, LFO 2 | WELLE · KEY SYNC (aus │ Timbre │ Stimme) · TEMPO SYNC · FREQ │ NOTE | S. 41; HB-MK S. 29 |
| PATCH n | QUELLE · ZIEL · INTENSITÄT | S. 42; HB-MK S. 30 |
| MOD-FX | TYP · TEMPO · TIEFE | S. 44; HB-MK S. 40 |
| DELAY | TYP · TEMPO SYNC · ZEIT │ NOTE · TIEFE | S. 44; HB-MK S. 41 |
| EQ | TIEF-FREQ · TIEF-GAIN · HOCH-FREQ · HOCH-GAIN | S. 44–45; HB-MK S. 42 |
| ARP A | TEMPO (Song) · AUFLÖSUNG · GATE · TYP · OKTAVEN | S. 45–46; HB-MK S. 44 |
| ARP B | LATCH · SWING · KEY SYNC · LÄNGE (letzter Schritt) · ZIEL | HB-MK S. 45 |
| EING. (Vocoder) | GATE · SCHWELLE · HPF-PEGEL · HPF-GATE · QUELLE 2 ▾ | S. 49; HB-MK S. 33 |
| FILTER (Vocoder) | FORMANT · CUTOFF · RESONANZ · FOLGER (127 = HALTEN) | S. 50; HB-MK S. 35 |
| FC-MOD | QUELLE · INTENSITÄT | S. 50; HB-MK S. 36 |
| AMP (Vocoder) | PEGEL · DIREKT · VERZERR. · KEYTRACK · ANSCHLAG | S. 50–51; HB-MK S. 37 |
| K-PEGEL, K-PAN | 16 Säulen mit Live-Bandpegel: P1 2 × 8 à 41 × 88 (4 px), P2 2 × 8 à 39 × 88, P3 2 × 8 à 36 × 88 als ein Canvas-Feld ohne Zwischenraum (288 px), L1 16 × 41 × 92 (3 px, 701 px), L2 16 × 36 × 92 (3 px, 621 px) | S. 51; HB-MK S. 38 |
| FILTER 2, DRIVE (MK11) · HK 3 (MK12) | siehe Pakete | KF [B] |

**Regler-Verhalten:**
- Jeder Platz ist ein `sKnob` (senkrecht ziehen). Stufenwerte rasten ein. **Listen mit mehr als 12 Einträgen** (64 Speicherwellen, ≈ 30 SEQ-Ziele) sind stetige Regler mit Rundung (200 px Weg, `haptic('tick')` und LCD je Stufe), dazu die Tipp-Liste; die App verlangt sonst je Stufe ≥ 18 px Weg (Z. 19979), bei 64 Wellen 1134 px.
- **Tipp auf einen Listen-Regler** öffnet eine Auswahl (`openPop`, Zeilen ≥ 44 px). Das gilt für WELLE, TYP, MODUS, QUELLE, ZIEL und STIMMUNG.
- Die LCD-Zeile zeigt Sektion, Name, Geräte-Wert und Klartext, z. B. „FILTER · CUTOFF 064 · 652 Hz“ oder „OSZ 1 · WELLE Speicherwelle 12 ≈“.
- Eine Geste = ein Undo. Während der Geste geht der ungerundete Wert an das Worklet, gerundet wird beim Abschluss (EN3-03). Halten hat im AM-Bedienfeld keine eigene Bedeutung bis V5d (EN3-18, L4).
- Bearbeitet wird immer das gewählte Timbre. Die LCD zeigt „T2“, wenn T2 gewählt ist. Mit [T1+2] (MK3, H-11) gehen Gesten an beide Timbres; Anzeige und Startwert kommen von T1.

**Kopf-Knöpfe:**
- 🎲 würfelt die EDIT-1-Werte von T1 (Wellen, C1/C2, OSZ2-Halbton aus {0, +7, +12, −12}, Mixer, Filter, Hüllkurven). Danach gilt: Mixer OSZ 1 oder OSZ 2 ≥ 64 und Sustain + Decay hörbar. FX, Arp, Seq und Vocoder werden nicht gewürfelt.
- ◎ setzt einen Punkt in jede Sektions-Zelle, deren Werte von INIT AM abweichen.
- ⋯ → Init lädt INIT AM; im Vocoder-Modus INIT AM mit `mode` 3 (Vocoder-Vorgaben, HB-MS S. 51).

**Querformat L1 (844 × 390, Körper ≤ 140 px, Breite ≤ 720 px nach Safe-Area):**
- Reihe 1: die 14 Zellen in einer Reihe à 48 × 36 (14 · 48 + 13 · 3 = 711).
- Reihe 2: Regler links (≤ 360 px: 5 × 72 bzw. 6 × 60, Höhe wie die VA-Seiten in L), rechts Programmblock (SPIEL) bzw. Schritt-Tasten (ARP, 8 × 40 × 36 mit 3 px = 341). Zusammen ≤ 711 px.
- Summe ≤ 132 px Höhe.

**Weitere Formate:**
- **L2 (667 × 375):** Zellen 41 × 36 mit 4 px Abstand (14 · 41 + 13 · 4 = 626). Die Nummern- bzw. Schritt-Tasten stehen nur im SPIEL- bzw. ARP-Körper unter den Reglern (fit-Klassen wie `#drumSheet`).
- **P2:** Programmzeile einzeilig (Bank ▾ · A │ B · Anzeige). Zellen 7 × 46 × 44 mit 3 px (340 px), Nummern- und Schritt-Tasten 8 × 39 mit 4 px (340 px).
- **P3:** Programmzeile einzeilig. Die 8 Tasten erscheinen nur in den ARP-Sektionen, als Schritt-Tasten in 2 Reihen × 4 (68 × 36, 4 px). Die Programmwahl geht dort über ‹ › und die Bibliothek. Zellen 7 × 38 × 44 mit 4 px (290 px, dichtes Raster), k6 = 6 × 48.
- **W (844 × 1180):** wie P1, nur M-PLATZ.
- **M-PLATZ mit Safe-Area:** Die AM-Durchgänge laufen in L1 zusätzlich mit 47 px Innenabstand links und rechts (Test-Stil für das `#app`-Padding), bei 844 × 390 und bei 926 × 428 (12 Pro Max). L2 läuft ohne Rand.

Jede neue Bedienfläche bekommt eine Hilfe-Zeile (Menü → Hilfe) und beim ersten Antippen einen LCD-Hinweis (L10). Die Texte sind eigene Sätze ohne Marken.

### B.4 Leistung: Stimmen-Budget, CPU-Messung, Begrenzer, WebGL

- **Budget je AM-Spur:** höchstens 4 klingende Stimmen (MK13: 8). Dazu Programm-Effekte und ggf. Vocoder. Ziel (Node-Offline), jede Grenze als Vielfaches **einer VA-Stimme aus demselben Lauf**: 4 Stimmen „Vollast MK1“ ≤ 4,8 × VA, mit FX + Seq + Arp ≤ 6,5 ×, Vocoder-Spur ≤ 8 ×. Die absoluten Xeon-Werte (VA ≈ 0,62 % Echtzeit, Spec §15.1) stehen nur zur Information in CHANGES; bei einem Widerspruch gilt das Verhältnis. Das iPhone-Verhältnis ist unbelegt (Spec §15.1: Faktor 2–2,5). Darum misst die **Leistungs-Probe** am Gerät.
- **Messverfahren:**
  1. **Node-Offline** `mk-node.mjs`: Es zieht den Worklet-Quelltext aus `index.html` (wie `fm-node.mjs`) und rendert 10 s Audio. Gemessen wird die Zeit je 128er-Quantum, Median aus 5 Läufen. Jede Grenze ist **relativ** zu einer VA-Stimme aus demselben Lauf angegeben, das gleicht Maschinenschwankung aus.
  2. **Chromium** `engineInfo().perTrack[i].load` als Gegenprobe in CHANGES (±40 % Streuung, keine Abnahmegrenze).
  3. **OfflineAudioContext** in Chromium mit dem App-Worklet für alle Klangmessungen (deterministisch, Rausch-Seed fest). Für `eng 3` zieht jede Note Rauschen und S&H je Stimme aus einem eigenen Zufallsgenerator = hash(seed, Timbre, Notenzähler dieses Timbres); das globale S&H nimmt hash(seed, LFO-Umlaufzähler). So ist ein Dual-Render gleich der Summe der Einzel-Renders, auch mit Rauschen. VA bleibt bitgleich (dort weiter Pool-Platz-Seed und `Math.random`).
- **Leistungs-Probe** (MK1, jedes MK-Paket ergänzt einen Fall): Menü → Info → **[Leistungs-Probe]**. Sie läuft auch in der Claude-App, weil sie kein Mikrofon braucht.
  - Sie legt 4 vorübergehende AM-Engines an (nicht im Projekt) und spielt je 4 Stimmen 10 s lang (Akkorde, Neuanschlag alle 0,5 s). Fälle: MK1 „Kern“, MK4 „+FX“, MK5 „+Arp“, MK6 „+Seq“, MK7 „Vocoder (synthetischer Modulator)“, MK11 „+Filter 2/Drive“, MK13 „8 Stimmen“.
  - Jede Probe-Engine hängt über einen 0-Gain-Knoten am Ausgang (VS1-Muster, Z. 30372), damit sie sicher gerechnet wird und unhörbar bleibt. Die Probe zählt ihre `load`-Berichte selbst zusammen, weil `cpuLoad()` nur `AU.synth` sieht (Z. 12309).
  - Gemessen werden: **`load_med`** = Median über die 1-s-Berichte von **Σ load der 4 Probe-Engines** (dieselbe Größe, die der Begrenzer vergleicht), dazu `load_per_engine[]` und `load_max`. Aus dem Worklet je Sekunde die gerechneten Frames gegen `Date.now` (`frames_ok` = false unter 0,995 · sampleRate) und die längste Einzel-Quantum-Zeit (`quantum_max_ms`). rAF-Median. In Chromium die Zahl der `longtask` > 50 ms; auf iOS (Safari kennt `longtask` nicht) stattdessen die Zahl der rAF-Lücken > 50 ms und ob rAF bei ≈ 30 Hz gedeckelt ist (Stromsparmodus). Dazu `baseLatency`, `sampleRate`, `userAgent`.
  - Ergebnis als JSON mit [Ergebnis kopieren] [Als Datei]. Keine Netzaufrufe. [Abbrechen] jederzeit.
- **Grenze am iPhone (Gerät, Xander):** Fall „Kern“: `load_med` (Σ) ≤ 0,30 und `frames_ok`. Das lässt neben den Probe-Spuren Platz für Drums, Hall und Master eines echten Projekts; die Begrenzer-Stufe 1 beginnt schon bei 0,45 über alles. Liegt der Wert darüber, gilt bis zur Lösung: AM höchstens 2 Stimmen je Spur, sobald mehr als 2 AM-Spuren klingen (Klartext im Kopf, L9). CHANGES nennt Wert und Regel.
- **CPU-Begrenzer** (erweitert Spec §15.2, ändert nie Gespeichertes):
  - Stufe 1 (> 0,45): AM-Vocoder-Bänder auf 2. Ordnung, umgeschaltet mit 30-ms-Überblendung zwischen beiden Bänken und Pegelausgleich (Bandenergie ± 1 dB zur 4. Ordnung); AM-Unison ≤ 2 Stimmen für neue Noten; MK13 `vmax` 8 → 4 für neue Noten.
  - Stufe 2 (> 0,60): AM-Spuren ≤ 2 Stimmen für neue Noten (Dual/Split: 1 + 1; Unison: 2 gestapelte); Mod-FX Ensemble → 1 Abgriff. Ab Stufe 2 ersetzt der vorhandene Begrenzer die 30-ms-SXF durch die WP4-Senke (`xfLite`, Z. 12331). Die M-EINBRUCH-Zusagen der MK-Abnahmen gelten deshalb nur bis Stufe 1.
  - Stufe 3 wie v2.
- **WebGL:** keiner (EN3-13). Canvas 2D für Seq-Säulen und Band-Pegel, gezeichnet ≤ 30 Hz und nur bei sichtbarer Seite. PE1 prüft das.
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

Ohne T2, FX, Seq und Vocoder. Der **Arp läuft auch im ECO-Klang** (er sitzt im Hauptfaden; nur T1-Noten, derselbe Planer). Ein **Vocoder-Programm** (`mode` 3) spielt im ECO-Klang nicht den rohen Träger, sondern bleibt stumm mit LCD „Vocoder braucht den Worklet-Klang“. Die Selbstoszillation (W-02) nutzt das vorhandene Ersatz-Pfeifen des ECO-Klangs. Badge „ECO-Klang“. Hinweis im LCD „AM im ECO-Klang: nur Grundklang“.

### B.6 Gemeinsame Regeln und Prüfverfahren

1. **Neutral und bitgleich (I-10):** Jedes neue Feld hat einen neutralen Wert. Vorhandene Klänge aller Engines und die AM-Klänge des Vorgänger-Pakets rendern bitgleich (Node-Offline, max |Δ| ≤ 1e-6), außer ein Paket nennt es anders. **„Vorgänger“** heißt in allen Abnahmen: der zuletzt ausgelieferte Stand, dessen Version CHANGES nennt, keine feste Nummer (Pakete können nach E.1/E.2 Nr. 4 rücken).
2. **Glätten und Blenden (L3):** Stetige Werte werden mit τ ≥ 5 ms geglättet. **Bruchwerte:** Während einer Geste geht der ungerundete Reglerwert an das Worklet (EN3-03); das Worklet rechnet Bruchteile über die W-Tabelle, SEQ „Glatt“ und die Patches ebenso. Strukturwechsel bei klingender Note gehen über die vorhandene **30-ms-Stimmenblende (SXF)**: Welle, OSC MOD, Filtertyp, HK │ GATE, ROUTING. **Umverteilende Wechsel** (Zuweisung, Priorität, Auslösung, MODUS, STIMMEN, `vmax`) gehen über die **Engine-Blende `engXf`** (Z. 4104): alte Stimmen 40 ms als Geister ausblenden, gehaltene Tasten unter der neuen Regel neu verteilen, Einblendung über den Attack (≤ 0,5 s); SXF kann keine Stimmen neu verteilen (Z. 4046). **Abweichungen von L3** (ausdrücklich): (a) Mono ↔ Poly ist hier ein umverteilender Wechsel über `engXf`; L3 behandelt ihn sonst als Grundklang-Einstellung, die gehaltene Stimmen loslässt. (b) SEQ-Stufen: „Stufe“ = lineare 1-ms-Rampe ab der Blockgrenze (Amplitude, Pan, Cutoff). (c) Tabellen-Wellen wechseln mit 2-ms-Gleichleistungs-Blende bei phasenstetigem Lesen statt 30–50 ms. Jede Abnahme mit Umschalten prüft **M-KLICK und M-EINBRUCH** (bis Begrenzer-Stufe 1, B.4).
3. **Hörbarkeit:** Jeder Regler einer AM-Sektion erfüllt H-1 und H-3 (Spec §0.3). Die Ausnahmen sind benannt: Bend ohne Rad, TEMPO nur mit Sync/Arp/Seq, NEUSTART nur bei Neuanschlag, Werte ohne Wirkung in der gerade gewählten Welle.
4. **Undo:** eine Geste = ein Undo (`soundEdit`/`commitSound`). Laden eines Programms = ein Undo mit Toast [Rückgängig].
5. **Layout:** M-PLATZ in P1, P2, P3, L1, L2, W für jeden neuen Zustand, mit den Maßen vom `.pg`-Inhalt (B.3), dem Safe-Area-Durchgang für L1 und scrollWidth ≤ clientWidth für jede Beschriftung. M-ANSICHT: Ein Sektions- oder Zustandswechsel verschiebt kein Bedienelement um mehr als 2 px. Treffer nach L4: Hochformat ≥ 44 × 44, dichte Raster ≥ 36 × 34 mit 4 px; Querformat ≥ 40 × 36.
6. **Oktav-Tabellen:** Für Wellen, deren Spektrum in Hz fest sein soll (Endlos, Gruppe 61–64, Aufnahmen aus MK10; die Stimmwelle wird live gerechnet, W-28), gibt es je Oktave (C1…C8) eine eigene Tabelle mit eigenen Mipmaps. Die Stimme blendet zwischen den zwei Nachbaroktaven nach der gespielten Tonhöhe (je Steuerblock, wie K2-40). Speicher je Welle ≤ 8 × Mipmap-Satz. Gebaut wird nur, was ein geladener Sound braucht.
7. **Worklet-ASCII** und Quelltext-Grenzen wie bisher (`check-worklet`).
8. **Geräte-Abgleich (EN3-16):** Jedes Paket nennt 3–6 Punkte, die Xander am eigenen microKORG nach Gehör vergleicht. Sein Ergebnis kommt mit Datum in CHANGES. Eine Änderung der W-Tabelle ist ein eigener kleiner Fix-Schritt (`MKn-fix`) mit Messwert vorher und nachher.
9. **Kein Markenwort** (EN3-05), in jedem MK-Paket:
   - (a) **AM-Teil** (Block `sq-mk-src`, AM-Zweig des Worklets zwischen den Marken `/*MK{*/` … `/*}MK*/`, AM-Hilfe- und LCD-Zeilen, AM-Werksnamen): `grep -ciE 'korg|micro ?korg|ms[ -]?2000|radias|dwgs|dw[ -]?[68]000|\bvox\b'` = 0.
   - (b) **Ganze `index.html`:** `grep -ciE 'micro ?korg|ms[ -]?2000|radias|dwgs'` = 0.
   - Trifft ein Base64-Datenblock zufällig ein Wort (≈ 4,6 % je 24 KB), ändert das Bau-Skript die Kodierung (ein Salz-Byte) und prüft neu. Datenblöcke werden nicht ausgenommen.
   - Spätere Pakete, die nach ihren Regeln Geräte im ⓘ nennen (V10P, V10d, VI3), lässt die Prüfung nicht scheitern.
10. **Filter-Bauform:** Neue 2-Pol-Filter und Resonatoren (W-29, Analyse- und Synthese-Bänder des Vocoders, Formant-Resonatoren) sind **TPT-SVF** (Zero-Delay) mit g aus `GTAN` (gleiche Klemme 0,45 · SR, Z. 3836) und g/R je Sample über den 16er-Block interpoliert (wie die Ladder, Z. 5090). Keine Direktform-Biquads mit Koeffizientensprüngen, kein Chamberlin-SVF (instabil über ≈ fs/6). Filter 2 (MK11) ist eine zweite Ladder.
11. **Denormale:** Jeder neue IIR- oder Rückkopplungs-Zustand (Vocoder-Bänder und Folger, Phaser, EQ, Filter 2, Formant-Resonatoren, W-29, Delay) bekommt den wechselnden ±1e-20-Versatz (wie Z. 5332) oder wird am Blockende unter 1e-15 auf 0 gesetzt.
12. **Gefaltete Energie** (eine Definition für alle MK-Alias-Grenzen): Gleichanteil entfernen, Bins unter f0/2 nicht werten; Blackman-Fenster, ≥ 2^15 Punkte, sr 48 kHz; harmonische Bins = k·f0 ± 6 Bins. Gemessen wird die nicht-harmonische Energie von 20 Hz bis 10 kHz relativ zur harmonischen Energie im selben Band. Der Vollband-Wert steht nur in CHANGES (Säge C7 mit dem wiederverwendeten polyBLEP ≈ −28 dB). Ring und Sinus× haben keine Grenze; ihre Werte stehen als gewollter Charakter in CHANGES.

### B.7 Test-API (ergänzt Spec §16; Rückgaben sind tiefe Kopien, ändernde Aufrufe = ein Undo)

```ts
mkGet(t: number): MkPatch                                  // p.mk der Spur t
mkSet(t: number, path: string, v: number | number[]): void  // z. B. 't.0.f.cut', 'mfx.dep' – über normMk geklemmt
mkRender(sound: Sound, ev: [t: number, typ: 'on'|'off', note: number, vel: number][], o?: {sec?: number, sr?: number,
         seed?: number, bpm?: number, inputs?: {e1?: Float32Array, e2?: Float32Array}}): Promise<{l: Float32Array, r: Float32Array}>
                                                            // seed = Zufall je Note (B.4 Nr. 3)
mkScope(t: number): {voices: {note, t, eg1, eg2, lfo1, lfo2, cutHz, seqStep?: number[]}[], seq?, vocBands?: number[]}
mkInfo(): {loaded: boolean, tables: number, tableBytes: number, blockMs: number}
arpLog(t: number): {t: number, note: number, vel: number, dur: number, step: number}[]   // ab MK5
perfProbe(cases?: string[]): Promise<object>                                              // die Leistungs-Probe
```

---
## Teil C — Pakete

Jedes Paket ist einzeln auslieferbar und hörbar prüfbar. Zu jedem Paket gehören:
- „Regression und DoD“ nach Spec §1.3: keine Konsolenfehler, M-PLATZ, Worklet-ASCII, PE1, Budget, CHANGES, Snapshot.
- die Fach-Prüfung nach N2 Teil J (Zeile „Fach-Prüfung“; ● = blockierend).
- die Regeln B.6.

Testskripte liegen in `dirigent-test/` (Chromium-Pfad wie in CHANGES V2d′: `chromium-1243`). Sie enthalten nie Werksnamen-Listen (EN3-07).

### MK0 — Vorab-Schutz: Klänge neuerer Engines bleiben erhalten (4.8.x)

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

### MK1 — Klangkern (Timbre 1), Bedienfeld SPIEL/EDIT 1, Leistungs-Probe

**Ziel.** Xander wählt auf einer Synth-Spur die neue Klangerzeugung AM und spielt einen vollständigen MS2000-Grundklang. Dazu gehören Säge, Puls und Dreieck mit ihren Form-Reglern, OSZ 2 mit Ring/Sync/Ring+Sync, Mixer, alle vier Filtertypen, Verstärker mit Verzerrung und Gate, zwei Hüllkurven, zwei LFOs, Tonhöhe sowie Mono/Poly/Unison. Er bedient das wie am microKORG und kann am iPhone messen, ob es flüssig läuft.

**Umfang.**
1. **Daten und Format:** Engine `mk`, `p.mk` mit `normMk` (B.1), Format 5 (EN3-04; der Schutz für unbekannte Engines kommt aus MK0), INIT AM, `setEngineOf` für `mk` (Liste und Aufräumen eines unberührten INIT-`p.mk`), `ENGINE_LABEL.mk`, Engine-Listen des Browsers, Engine-Wahl im Kopf (B.3 Zeile 1; Name und Chip nach H-4).
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
   - **Tonhöhe:** Transponieren, Fein, Portamento W-13, Bend W-17 (MIDI-Bend nach H-5 (c)).
   - **Stimmen:** höchstens 4.
     - **Priorität gilt für jede Zuweisung**, sobald mehr Tasten gehalten werden, als das Timbre Stimmen hat (Poly 4 bzw. `tv`-Anteil; Mono/Unison 1 Note): Last = die älteste wird gestohlen, Low = die n tiefsten klingen, High = die n höchsten klingen. Frei werdende Stimmen gehen an zurückgestellte Tasten zurück [U] (HB-MS S. 35; der microKORG kennt nur Last, HB-MK S. 16).
     - Mono hat einen Notenstapel nach dieser Priorität.
     - Unison legt alle 4 Stimmen auf eine Note (W-15).
     - Auslösung Single: Legato startet Hüllkurven und LFO nicht neu. Portamento wirkt bei Mono/Unison + Single nicht auf die erste Note (HB-MS S. 36).
   - **Strukturwechsel** (Welle, OSC MOD, Filtertyp, HK │ GATE) bei klingender Note laufen über die SXF-Blende; Zuweisung, Priorität und Auslösung über `engXf` (B.6 Nr. 2).
   - **Zufall** je Note aus eigenem Generator (B.4 Nr. 3). **Denormale** und **gefaltete Energie** nach B.6 Nr. 11 und Nr. 12.
3. **Bedienfeld** (B.3): Reiter SPIEL, EDIT 1, FX.
   - SPIEL hat die 5 Spiel-Regler und die Programmzeile mit Bank ▾ (8 Genre-Bänke, Namen nach MK8). Seite A bleibt bis MK8 leer (Tasten grau „–“). Seite B listet die eigenen AM-Sounds der Bibliothek, sortiert A–Z, B.11 … B.88. Die Schalterzeile ist reserviert.
   - EDIT 1 hat das 2 × 7-Raster. PROG zeigt bis MK3 nur „Single“ (gesperrt). Die anderen Sektionen sind voll bedienbar.
   - Kopfzeile 1 nach B.3 (Breiten-Budget je Format; Chip in P2/P3 nach H-4).
   - Dazu LCD-Texte, Hilfe-Zeilen, 🎲, ◎ und ⋯ Init.
4. **ECO-Rückfall** (B.5).
5. **Leistungs-Probe** (B.4), Fall „Kern“, mit 0-Gain-Anschluss und Σ-Messung.
6. **Code-Ort** nach EN3-14: immer geladener Teil (`normMk`, INIT AM, `mkToFlat`, `loc`-Behandlung; `mkLocalStrip` kommt mit MK9 dazu) im oder vor `SQStore`; `sq-mk-src` bei Bedarf, beim Öffnen eines AM-Projekts schon während des Ladens, vorher `tickAhead(.3)`.
7. **Test-API** `mkGet`, `mkSet`, `mkRender`, `mkScope`, `mkInfo`, `perfProbe`.
8. **MIDI-Rad** (Vorgabe H-5 (c)): `onMidiMsg` bildet 0xE0 auf einen Live-Bend (± `bend` HT) und CC1 auf einen Live-Mod-Rad-Wert ab, der `p.mw` überschreibt, solange er anliegt. Nichts davon wird gespeichert, kein Undo-Eintrag. Nur Desktop-Chrome/Android; iOS Safari hat kein Web MIDI.

**Nicht-Umfang.**
- Sinus×, Stimmwelle, Speicherwellen, Rauschen-Oszillator und Patches (MK2).
- Timbre 2, Split und Stimmung (MK3). Effekte (MK4), Arp (MK5), Seq (MK6), Eingänge und Vocoder (MK7).
- Werksklänge (MK8).
- App-Mod-Picker und Morph für AM-Regler (V5d/V6a). AM als Pad-Quelle (V1d).

**Daten.** Siehe B.1 (alle Felder werden ab MK1 gespeichert). Spur: kein neues Feld (`mkIn` erst mit MK7).

**Oberfläche.** Siehe B.3. Neu sind die Klasse `k6`, das Sektionsraster und die Programmzeile. Der Kopf bleibt; die Engine-Wahl bekommt AM (4. Knopf bzw. Chip nach H-4). Alle Maße gelten vom `.pg`-Inhalt aus (B.3).

**Berührungspunkte.**
- **Wiederverwendet:** AnalogCore mit Pool, Ereignissen, Tempo, SXF und Lastbericht; `envCoefs`, `lfoVal`, Ladder `FMIX`, polyBLEP/Sync; `normalizeSound`, `soundHash`, Bibliothek, `INIT_IDS`; `sheetFrame`, `sKnob`, `knobRow`, `lcdShow`, `openPop`, fit-Klassen; `soundEdit`/`commitSound`; NativeVoice; Muster des VS0-Testblatts; `engineInfo`.
- **Neu:** `eng 3` mit Form-Säge, Form-Dreieck, Ring/Ring+Sync, Gate, Neustart, Priorität für alle Zuweisungen, Stapel-Unison, Rechteck(+), Key Sync Timbre, Selbstoszillation, ADAA-Verzerrung, Zufall je Note; Protokoll `{mk}`/`{mkSet}`; `normMk`, `mkToFlat`, W-Tabelle als eine Datenstruktur, Bedienfeld, Leistungs-Probe, Klasse `k6`, Block `sq-mk-src`, MIDI-Rad.
- **Anzupassen:** `ENGINE_LABEL` (Z. 11162; sonst zeigen `soundLabel` Z. 20359, Browser Z. 24555 und MIDI-Spurname Z. 28737 „VA“), Browser-Engine-Listen (Z. 24409, 24509; sonst fehlt AM unter „Alle Engines“), `setEngineOf` (Z. 20343) mit Aufräumen (Z. 20352), `rebuildNativeLfos` (Z. 12113), `spawnWkVoice` (Glide Z. 12568, Flush Z. 12571), `SynthHost.track` (Z. 9384), `onMidiMsg` (Z. 29030).

**Dauer** 14–16 h in zwei Bau-Abschnitten (Rev. 1: +3 h für Protokoll, Priorität, `engXf`, Bruchwerte, MIDI-Rad, Probe-Messung, Engine-Listen und Kopfzeile):
1. Daten, Format, Protokoll, Worklet, DSP-Tests.
2. Bedienfeld, ECO, Probe, MIDI-Rad, UI-Tests.

Eine Version: **4.9.0** · **Budget** +100 KB · **Format 4 → 5.** Rollout `max_format` 5 und `max_app` 4 009 000 nur mit Xanders Okay (N2 G.8) und erst nach MK0. Vorher speichert die App lokal.

**Abnahme-Checkliste**
- [ ] **MK1-01 Daten:** Ein Prüfskript setzt 1000 Zufalls-Patches mit Werten außerhalb der Bereiche. `normMk` klemmt jeden Wert auf Teil A, Listenwerte sind ganzzahlig. Unbekannte Schlüssel fallen weg. Speichern → Laden ist deep-equal, `soundHash` ist stabil. VA → AM → VA stellt den VA-Klang bitgleich her; ohne Geste dazwischen ist der `soundHash` gleich und der Sound nicht „geändert“. Ein Undo nach dem Wechsel stellt den Sound deep-equal her. AM-Sounds heißen in Blattkopf, Browser und MIDI-Spurname „AM“ (Name nach H-4) und stehen im Browser unter „Alle Engines“.
- [ ] **MK1-01b Kalt-Start:** Bibliothek mit AM-Sound, Kalt-Start, ohne AM zu öffnen, dann Neuladen: `p.mk` deep-equal, `mkInfo().loaded === false`.
- [ ] **MK1-02 Format:** Neue Projekte haben `format` 5. Projekte mit Format 3 und 4 laden deep-equal (nach `normalize`). Demo und alle Werks-Sounds (VA, FM, WT, Kits) klingen offline bitgleich zum Vorgänger-Stand (B.6 Nr. 1; max |Δ| ≤ 1e-6).
- [ ] **MK1-02b Fremde Engine:** Ein Sound mit Engine `'xyz'` übersteht Laden → Speichern → Laden deep-equal, auch in der Bibliothek und der Cloud-Bibliothek (MK0 bleibt erfüllt).
- [ ] **MK1-03 Kein Markenwort** (B.6 Nr. 9 a und b): 0 Treffer.
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
  - BEND 2 mit MIDI-Bend 8191 (Test ruft `onMidiMsg` direkt): +200 ± 2 ct; ohne MIDI 0. CC1 127 ersetzt `p.mw` live; nach dem Loslassen gilt wieder `p.mw`, nichts gespeichert, kein Undo.
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
- [ ] **MK1-19 Hörbar:** H-1 und H-3 für jeden Regler von SPIEL und EDIT 1 (Ausnahmen B.6 Nr. 3, im Skript benannt).
- [ ] **MK1-20 INIT AM:** C3, vel 0,8, 2 s: M-LUFS ± 1 dB gegen INIT Analog. ⋯ → Init lädt INIT AM, ein Undo (der Vocoder-Fall mit `mode` 3 wird in MK7-07 geprüft).
- [ ] **MK1-21 Bedienfeld:**
  - M-PLATZ in P1, P2, P3, L1, L2, W für SPIEL, für EDIT 1 mit jeder Sektion und für die offene Auswahl-Liste.
  - Ein Sektionswechsel bewegt kein Element > 2 px (M-ANSICHT).
  - Trefferflächen P1: Zellen 48 × 44, Regler 72 × 92 bzw. 60 × 92, Nummern 41 × 44. L1: Zellen 48 × 36.
  - M-PLATZ zusätzlich mit 47 px Safe-Area-Rand links und rechts bei 844 × 390 und 926 × 428. Jede Beschriftung: scrollWidth ≤ clientWidth.
  - Kopfzeile 1 in P1, P2 und P3 mit Spur-Chip: Engine-Trefferflächen ≥ 36 × 44 (senkrecht über `::after`) mit 4 px Abstand, der Spurname bleibt sichtbar; sonst der Chip nach H-4 mit Zeilen ≥ 44 px.
  - Keine Seite scrollt senkrecht. Eine Geste = ein Undo. Ein zweiter Finger wird ignoriert.
  - Doppeltipp-Zoom und Textauswahl sind in der iOS-Emulation aus.
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
  - **Bei laufender Demo:** Engine-Knopf AM während der Demo-Wiedergabe (Block noch nicht ausgewertet): In `noteLog` startet keine Note > 5 ms nach ihrem Plan, kein Schlag fällt aus.
- [ ] **MK1-27 Regression und DoD:**
  - PE1 mit offenem AM-Bedienfeld während 10 s Demo: rAF ≥ 55 fps, keine `longtask` > 50 ms, `tick`-p95 ≤ 4 ms.
  - Budget ≤ +95 KB.
- [ ] **MK1-28 Versions-Wächter:** `APP_CODE` 4 009 000. Online-Speichern mit Format 5 erst nach dem Rollout, vorher `bad_version`-Hinweis und lokales Speichern. Kein Aufruf nennt das Klassenzimmer-Projekt.
- [ ] **MK1-29 Älterer Stand:** 4.8.1 (MK0) öffnet ein Format-5-Projekt bzw. eine Bibliothek mit AM-Sounds aus KV, Cloud und Paar-Raum: Nichts wird überschrieben, die Server-Bibliothek enthält die AM-Sounds weiter. Nach der Rückkehr zu 4.9.0 sind sie deep-equal.
- [ ] **MK1-30 VA-Zustand ruht:** Ein VA-Sound mit LFO1 → `fx.rev` wird auf AM geschaltet: Der Hall-Send bleibt unmoduliert, das Worklet bekommt keine VA-Mods und kein `glideFrom`. Zurück auf VA wirkt die Route wieder.
- [ ] **MK1-31 Kopf-Knöpfe:** 🎲 100 Würfe: jeder hörbar (H-1), Mixer OSZ 1 oder OSZ 2 ≥ 64. ◎ markiert genau die Sektionen, die von INIT AM abweichen. Seite B ist A–Z sortiert.

**Tests.** `mk1-dsp.mjs` (Node-Offline: 04–18, 24, 30), `mk1-format.mjs` (01, 01b, 02, 02b, 03, 28, 29), `mk1-ui.mjs` (Playwright: 19–22, 26, 31), `mk1-eco.mjs`, `mk1-probe.mjs`.

**Fach-Prüfung** (Teil J): **FP-DSP ●** Haupt-, **FP-TOUCH** und **FP-IPHONE** Zweit-Blick.

**iPhone-Prüfpunkte (Xander, ≈ 5 min):**
1. Synth-Spur → Engine **AM** → SPIEL: Akkord spielen, CUTOFF und RESONANZ drehen.
2. EDIT 1 → OSZ 2 → MOD „Sync“, dann HALBTON drehen.
3. AMP → VERZERR. an, MIXER hochdrehen.
4. Menü → Info → **Leistungs-Probe**, Ergebnis kopieren und schicken.

**Geräte-Abgleich (microKORG, nach Gehör):**
- Säge STEUER 1 von 0 → 127 (klingt es wie „Oktave dazu“?).
- Puls STEUER 1 = 64.
- Dreieck STEUER 1 = 127.
- Resonanz 127: Einsatzpunkt und Pegel des Pfeifens gegen die App (W-02; dass das Filter pfeift, ist belegt, HB-MK S. 25).
- Attack 64 und Release 64 im Vergleich zur App.
- LFO Frequenz 64.

**Risiken.** Die Kurven sind eK. Die iPhone-CPU ist unbekannt. Das Paket ist groß, deshalb gibt es zwei Bau-Abschnitte. Der Rollout (Format 5) braucht Xanders Okay.

---

### MK2 — Alle Oszillator-Arten und PATCH 1–4

**Ziel.** OSZ 1 kann alles, was der MS2000 kann, außer „Eingang“ (MK7): Sinus mit Kreuzmodulation, Stimmwelle, 64 Speicherwellen (Platzhalter, klar markiert), Rauschen mit Filter. Die vier virtuellen Patches verbinden Hüllkurven, LFOs, Anschlag, Keytrack und Mod-Rad mit acht Zielen.

**Umfang.**
1. **Sinus×** (W-27). Der Modulator ist OSZ 2 nach Sync, vor Ring (W-27).
2. **Stimmwelle** (W-28), live gerechnet, ohne Tabellen.
3. **Speicherwellen 1–64** (Platzhalter):
   - Additive Rezepte mit ≤ 32 Teiltönen (Pegel in dB, als Bytes kodiert) und Familien nach HB-MS S. 37 (Nummer → Gruppe): 1–7 Sinus-artig, 8–14 Bass, 15–23 Welle, 24–26 Quinte, 27–34 Digital, 35 Endlos, 36–39 E-Piano, 40–46 Orgel, 47–48 Clavi, 49–51 Gitarre, 52–56 Bass 2, 57–60 Glocke, 61–64 Stimme.
   - Die Teiltonvektoren entwirft der Builder selbst. Ziel ist der Charakter der Gruppe, nicht eine Kopie.
   - **35 Endlos** ist ein Shepard-Ton: nur Oktav-Teiltöne 2^j mit Glockengewicht über log f (Mitte 440 Hz, σ 1,5 Okt) als Oktav-Tabellen.
   - Gruppe 61–64 bekommt eine feste Hülle in Hz (Oktav-Tabellen).
   - Mipmaps über den gemeinsamen, DOM-freien Tabellen-Bau `mkTables` (B.4, Spec §10.1), im Hauptfaden in Häppchen; Übergabe einmal je Kontext in die MKW-Tabelle. Bis die Tabelle da ist, spielt die Platzhalter-Säge mit „≈“.
   - Wahl über STEUER 2 (1…64; Import: Werte 2n−2, 2n−1 → n, HB-MS S. 66), als stetiger Regler mit Rundung (B.3).
   - Wellenwechsel bei klingender Note mit 2-ms-Gleichleistungs-Blende, phasenstetig (B.6 Nr. 2).
   - **Gruppen-Merkmale** (eK, gelten für MK2-03; Teiltöne 1–32, dB relativ zum stärksten):

     | Gruppe | Merkmal |
     |---|---|
     | 1–7 Sinus-artig | Teilton 1 ist der stärkste, alle anderen ≤ −12 dB |
     | 8–14 Bass, 52–56 Bass 2 | Teiltöne 1–4 tragen ≥ 80 % der Energie |
     | 15–23 Welle | ≥ 12 Teiltöne ≥ −40 dB |
     | 24–26 Quinte | Teilton 3 ≥ Teilton 2 |
     | 27–34 Digital | mindestens ein Teilton ≥ 9 liegt ≥ −12 dB |
     | 35 Endlos | nur Oktav-Teiltöne (MK2-04) |
     | 36–39 E-Piano | Teilton 1 ist der stärkste, alle Teiltöne ≥ 6 ≤ −24 dB |
     | 40–46 Orgel | nur Zugriegel-Teiltöne 1, 2, 3, 4, 6, 8 ≥ −40 dB |
     | 47–48 Clavi | Teilton 2 oder 3 ≥ Teilton 1; ≥ 10 Teiltöne ≥ −40 dB |
     | 49–51 Gitarre | Teiltöne 2–5 je ≥ −20 dB |
     | 57–60 Glocke | der stärkste Teilton ist ≥ 3 |
     | 61–64 Stimme | Hülle in Hz mit dem Maximum zwischen 400 und 1200 Hz, bei C2 und C4 gleich ± 3 dB |
   - LCD: „Speicherwelle 12 · Bass 5 ≈ Platzhalter“. Hilfe: „Originalwellen folgen später aus Aufnahmen“.
4. **Rauschen-Oszillator** (W-29).
5. **PATCH 1–4** (A.5, W-18). Je Timbre 4 Wege mit Quelle, Ziel und Intensität. „Bend“ wirkt nur mit MIDI-Bend (H-5 (c)), sonst LCD „kein Bend-Rad“. Das Ziel LFO2-Freq wirkt nicht, solange LFO2 Tempo Sync an ist (W-18). Intensität 0 kostet nichts.
6. **Reiter EDIT 2** mit PATCH 1–4 (die übrigen Zellen folgen ab MK4/MK5).
7. **Leistungs-Probe:** Der Fall „Kern“ nutzt jetzt Speicherwelle + Sinus×.

**Nicht-Umfang.** „Eingang“ (MK7). Originalwellen (MK10). Mehr als 4 Patches.

**Daten.** `t[].o1.w` 3…6 wirken jetzt. `t[].p[]` wirkt jetzt.

**Oberfläche.** EDIT 2 (Raster wie B.3). OSZ 1 mit Beschriftung je Welle. Die Auswahl-Liste der Speicherwellen hat 64 Zeilen mit Gruppenköpfen (Liste scrollt, L4) und „≈“.

**Berührungspunkte.**
- **Wiederverwendet:** das Mipmap-Verfahren (V4a, K2-40; portiert, `waveTab` bleibt im Worklet), Mod-Matrix-Plätze.
- **Neu:** PM-Pfad Sinus×, Glottis-Puls (live), Oktav-Tabellen, 64 Rezepte, gemeinsamer Tabellen-Bau `mkTables` (DOM-frei; später von V8a, V4e und V9a genutzt, Teil G Nr. 9), MKW-Tabelle im `AudioWorkletGlobalScope`, Übergabe `{mkw}`, Patch-Ziele OSZ1-Steuer und LFO2-Freq.

**Dauer** 6,5–7,5 h · **Version 4.10.0** · **Budget** +35 KB · Format bleibt 5.

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
  - Jede Welle unterscheidet sich von jeder anderen: RMS-Abstand ≥ 1 dB über die Teiltöne 1–16.
  - Die Gruppen-Merkmale der Tabelle in Umfang 3 sind erfüllt.
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
  - EDIT 2 mit PATCH 1–4, LCD z. B. „PATCH 2 · LFO 1 → CUTOFF · +32“.
  - Listen mit ≥ 44-px-Zeilen.
  - M-PLATZ in P1–P3, L1, L2, W. H-1/H-3 für alle neuen Regler.
- [ ] **MK2-11 Regression und DoD**, Budget ≤ +35 KB, kein Markenwort.

**Tests.** `mk2-osc.mjs`, `mk2-patch.mjs`, `mk2-ui.mjs`.

**Fach-Prüfung:** **FP-DSP** Haupt-, **FP-KLANG** Zweit-Blick.

**iPhone:** OSZ 1 → Speicherwelle, STEUER 2 durchdrehen. PATCH 1 LFO 2 → Cutoff, +40.

**Geräte-Abgleich:** Stimmwelle FORM 0/64/127. Sinus× X-MOD 64. Rauschen CUTOFF 24 mit RESO. 127 (gleiche Tonhöhe wie die Taste?). Klang einzelner Speicherwellen (nur als Vorgeschmack, die Originale kommen mit MK10).

**Risiken.** Die Platzhalter klingen anders als die Originale, das ist gewollt und markiert. Der Tabellenspeicher auf dem iPhone ist ungemessen; er wird mit dem V8a-Pool zusammen geprüft (Teil G Nr. 9).

---

### MK3 — Zwei Timbres, Split, Stimmung

**Ziel.** Ein AM-Sound spielt zwei Timbres übereinander (Dual = Layer) oder geteilt (Split). Die Stimmen werden wie am MS2000 aufgeteilt. Die zehn Stimmungen mit Grundton sind wählbar.

**Umfang.**
1. **PROG-Sektion:** MODUS Single │ Dual │ Split (Vocoder ab MK7), STIMMEN 1+3 │ 2+2 │ 3+1, SPLIT (C-1…G9), STIMMUNG, GRUNDTON. Am Gerät setzt man den Split per Halten + Taste (HB-MS S. 34). Hier gibt es dafür die Taste [Split ← nächste Note] in der LCD-Zeile, weil Halten im Editor keine neue Bedeutung bekommt (L4).
2. **Worklet:** Je Note spielen die Timbres nach Modus:
   - Dual: beide.
   - Split: Note < `split` → T1, sonst T2 [W].
   - Die Stimmen werden nach `tv` geteilt. Ist ein Timbre nach `tv` auf 1 Stimme begrenzt, spielt es mono, unabhängig von der Zuweisung (HB-MS S. 35).
   - **Ist ein Timbre auf Mono, gilt `tv` nicht** (HB-MS S. 34): Es belegt 1 Stimme. Ein Poly-Timbre daneben bekommt 3 (HB-MK S. 16: Mono/Poly = 1/3). Ein Unison-Timbre daneben bekommt 2 (HB-MK S. 16: Unison/Mono = 2/1; für MS2000 [W]). Beide Mono: 1 + 1.
   - Hat ein Timbre weniger Stimmen als gehaltene Tasten, entscheidet seine Priorität (MK1).
   - Unison in Dual/Split nutzt die Stimmenzahl des Timbres.
   - Mono bei T1 und Poly bei T2 ist erlaubt.
   - AMP PEGEL/PAN je Timbre wirken als Balance (S. 40).
3. **TIMBRE-Wahl** T1 │ T2 in der SPIEL-Programmzeile. Alle Sektionen bearbeiten das gewählte Timbre. Die LCD zeigt „T2“. Bei Single ist T2 gesperrt.
   - Nach **H-11** (Vorgabe ja): [T1+2] bearbeitet beide Timbres zugleich (Anzeige und Startwert von T1; nicht gespeichert), [◐ SOLO] spielt nur das gewählte Timbre (nicht gespeichert); HB-MK S. 14, S. 64. Chips statt Halten, weil Halten hier keine Bedeutung bekommt (L4). Plätze in der Schalterzeile (B.3).
4. **Werkzeuge** (⋯ im Blatt):
   - Timbre neu (INIT), Timbre tauschen.
   - Timbre kopieren aus einem beliebigen AM-Sound der Bibliothek (Timbre 1 oder 2 als Quelle; 🔒 steckt an, EN3-08a).
   - Je ein Undo (HB-MS S. 46–47).
5. **Stimmung** (W-43): je Note und Timbre, vor der Tonhöhenrechnung. Eigene Stimmung mit 12 Werten (Blatt mit 12 Reglern −100…+100 ct). Keytrack rechnet mit der gestimmten Tonhöhe (KT, B.2; HB-MS S. 39).
6. **Umschalten** von MODUS und STIMMEN bei klingenden Noten über `engXf` (B.6 Nr. 2).

**Nicht-Umfang.** Mehr als 2 Timbres. Globale Stimmung (die Abweichung steht in B.1). Arp-Ziel (MK5).

**Daten.** `mode` 0–2, `tv`, `split`, `scale`, `skey`, `usc`, `t[1]` wirken jetzt.

**Oberfläche.** PROG ist offen. T1/T2 in SPIEL aktiv, dazu [T1+2] und [◐ SOLO] nach H-11. Zusätzlich das Blatt „Eigene Stimmung“ (12 Regler, P1: 2 × 6 nach `k6`; L1: 12 × 56 mit 3 px = 705 px).

**Berührungspunkte.**
- **Wiederverwendet:** Stimmenpool, Notenstapel aus MK1, Bibliothek für die Quellwahl.
- **Neu:** Timbre-Verteilung (mit der Mono-Regel), Stimmungs-Tabellen, Timbre-Werkzeuge, [T1+2] und Solo.

**Dauer** 7–8 h (Rev. 1: +1 h für [T1+2] und Solo) · **Version 4.11.0** · **Budget** +32 KB · Format bleibt 5.

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
- [ ] **MK3-04 Timbre-Wahl:** Eine Bearbeitung mit T2 lässt T1 deep-equal. Bei Single ist T2 gesperrt (Hinweis im LCD).
- [ ] **MK3-05 Werkzeuge:**
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
- [ ] **MK3-10 Oberfläche:** PROG, T1/T2, [T1+2], [◐ SOLO], Blatt „Eigene Stimmung“: M-PLATZ in P1–P3, L1, L2, W. M-ANSICHT beim Timbre-Wechsel (nichts springt).
- [ ] **MK3-11 Regression und DoD**, Budget ≤ +32 KB.
- [ ] **MK3-12 Balance und Stimmung:** AMP PEGEL/PAN je Timbre stellen die Balance (PEGEL T1 = 0 → T1-Anteil ≤ −60 dB; PAN T1 L63 / T2 R63 → Trennung ≥ 30 dB). KEYTRACK +48 mit Werckmeister III folgt der gestimmten Tonhöhe (Cutoff-Abweichung = W-43-Wert ± 2 ct).
- [ ] **MK3-13 Beide und Solo** (nach H-11): [T1+2]: ein CUTOFF-Zug ändert T1 und T2 um dasselbe Δ, ein Undo; nach dem Ausschalten ist nichts gespeichert (`soundHash` unverändert durch den Schalter). [◐ SOLO]: nur das gewählte Timbre klingt (das andere ≤ −90 dB), nicht gespeichert.

**Tests.** `mk3-timbre.mjs`, `mk3-scale.mjs`, `mk3-ui.mjs`.

**Fach-Prüfung:** **FP-DSP ●** Haupt-, **FP-TOUCH** Zweit-Blick. Blockierend, weil MK5–MK8 auf der Timbre-Struktur aufbauen.

**iPhone:** PROG → MODUS Split, SPLIT C4. Unten Bass (T1), oben Fläche (T2) bauen. STIMMUNG „Werckmeister III“ mit Akkorden.

**Geräte-Abgleich:** Layer am microKORG mit 2 Stimmen je Timbre (HB-MK S. 16) gegen Dual 2+2. Das Verhalten bei mehr Tasten als Stimmen. Mono/Poly-Layer (1/3). Edit Sync und Solo (HB-MK S. 14).

**Risiken.** Welche Seite der Split-Grenze T1 ist, ist [W]. Die Stimmungstabellen sind Lehrbuchwerte, keine Gerätewerte.

---

### MK4 — Effekte: Mod-FX, Delay, EQ (je Sound)

**Ziel.** Jeder AM-Sound bringt seine Programm-Effekte mit, wie am Gerät, in der Reihenfolge Mod-FX → Delay → EQ.

**Umfang.**
1. **Im Worklet nach der Stimmensumme** (stereo, je Spur): Mod-FX Cho/Flg │ Ensemble │ Phaser (W-31), Delay Stereo │ Cross │ L/R (W-32, Puffer 6 s, angelegt beim ersten Einschalten) mit Tempo Sync (W-12, Song-Tempo, jede Note im ganzen Tempobereich), EQ (W-33). TIEFE 0 ist jeweils bitgleich trocken. Alle Rückkopplungs- und IIR-Zustände nach B.6 Nr. 11.
2. **Zeitwechsel** des Delays bei laufendem Echo: Lesekopf gleitet (≤ 50 ms), kein Sprung. Tempo-Wechsel: Sync-Zeit folgt am nächsten Block mit Gleiten.
3. **Sektionen** MOD-FX, DELAY, EQ in EDIT 2. ZEIT │ NOTE wechselt mit TEMPO SYNC.
4. Die **Spur-Kette bleibt unverändert dahinter** (Drive, Chorus, Hall-/Echo-Send, Pump, Vol, Pan).
5. **Leistungs-Probe:** Fall „+FX“.

**Nicht-Umfang.** Weitere Effekttypen. Effekte für andere Engines (VK2 nutzt nur Formeln und Prüfskripte, Teil G Nr. 2).

**Daten.** `mfx`, `dly`, `eq` wirken jetzt.

**Oberfläche.** Drei Sektionen in EDIT 2. LCD z. B. „DELAY · NOTE 1/8 · 250 ms“.

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

**iPhone:** DELAY Sync 1/8, TIEFE 60, mit laufendem Song. MOD-FX Ensemble auf einer Fläche.

**Geräte-Abgleich:** Cho/Flg TIEFE 40 und 100. Ensemble. Phaser TEMPO 30. Delay TIEFE 64 (wie viele Wiederholungen?).

**Risiken.** Die Effekt-Kurven sind eK. Der Delay-Puffer hat 6 s, wie der Echo-Bus der App: ≈ 2,3 MB je AM-Spur mit Delay an (48 kHz stereo Float32). Viele AM-Spuren mit Delay brauchen entsprechend Speicher; die Leistungs-Probe nennt Tabellen- und Puffer-Speicher.

---
### MK5 — Step-Arpeggiator

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
7. **Aufnahme** (● REC, FANG, Overdub): Aufgezeichnet werden die **gespielten Tasten**. Der Arp entsteht beim Abspielen neu (Vorgabe, H-8). Song-MIDI-Export: wie bisher die Clip-Noten, ohne Arp-Noten (Lücke in CHANGES). Der **MIDI-Mitschnitt** (`PERF`, `buildMidiLog`) enthält dagegen bewusst die klingenden Arp-Noten, wie bei der Clip-Wiedergabe (`spawnWkVoice` schreibt `perfAdd`, Z. 12574).
8. **Aufräumen:** Stopp, Panik, Szenen- oder Teilwechsel, Engine-Wechsel, Arp aus und Spur stumm beenden alle Arp-Noten ≤ 1 Schritt. Keine hängende Note.
9. **Oberfläche:**
   - SPIEL: [ARP ●] und [LATCH ●].
   - EDIT 2: ARP A (TEMPO zeigt das Song-Tempo, AUFLÖSUNG, GATE, TYP, OKTAVEN) und ARP B (LATCH, SWING, KEY SYNC, LÄNGE = letzter Schritt, ZIEL).
   - Bei ARP A/B werden die Nummerntasten zu **Schritt-Tasten** 1–8. Leuchtend = an. Der laufende Schritt ist markiert (≤ 1 Bild Verzug). Schritte über LÄNGE sind dunkel.
10. **Leistungs-Probe:** Fall „+Arp“ (4 Spuren, 1/24).
11. **Key Sync mit Arp:** Solange `arp.on`, setzen LFO1/2 und SEQ mit Key Sync „Timbre“ nur bei KEYS Typ 9 zurück (erste Taste nach „alle Tasten los“ = Akkordwechsel; HB-MS S. 41, S. 43, S. 63). Key Sync „Stimme“ setzt je Arp-Note zurück. Auslösung Single und die Portamento-Regel für die erste Note bleiben auf Stimmen-Ebene; ihre Wirkung mit Arp ist [U] (Geräte-Abgleich).

**Nicht-Umfang.** Arp für VA/FM/WT. Der Kern ist aber engine-frei gebaut (Teil G, VI2a). Arp-Noten im Song-MIDI-Export (der Mitschnitt hat sie, Umfang 7). Arp mit eigenem Tempo.

**Daten.** `arp` wirkt jetzt. `arp.tempo` wird nur gespeichert (EN3-10).

**Berührungspunkte.**
- **Wiederverwendet:** `tick`/`LOOKAHEAD`, `spawnWkVoice`, `noteLog`, `outPitch`, `applyCarrierChange`, `swingOffset`, `inputDown`, FANG/REC-Wege (unverändert für Nicht-AM-Spuren), `silenceAll`.
- **Neu:** Arp-Kern mit Intervall-Satz, KEYS-Ereignisse, Timbre-Maske `d`, Schritt-Tasten, Muster-Tabelle, Seed.

**Dauer** 7,5–8,5 h (Rev. 1: +1,5 h für Intervall-Satz, Abbildung je Schritt, KEYS, Timbre-Maske und ECO) · **Version 4.13.0** · **Budget** +33 KB · Format bleibt 5.

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
  - P1: [ARP ●]/[LATCH ●] 44 × 44, Schritt-Tasten 41 × 44. P3: Schritt-Tasten 2 × 4 à 68 × 36. L1: ≥ 40 × 36.
  - M-PLATZ in P1–P3, L1, L2, W. Die Schritt-Tasten ersetzen die Nummern ohne Sprung (M-ANSICHT).
  - Die Anzeige des laufenden Schritts ≤ 30 Hz.
- [ ] **MK5-18 Regression:** FANG, ● REC, MELODIE, Song-Ablauf und Teile sind für Nicht-AM-Spuren und für AM mit Arp aus unverändert (die Abnahmen von V2b–V2d′ bestehen). Budget ≤ +33 KB.
- [ ] **MK5-19 Akkordwechsel:** 4-Takt-Akkord-Clip mit Träger-Wechsel in Takt 3: Ab Takt 3 gehört jede Arp-Note zum neuen Akkord (`noteLog`, ± 0 HT), keine hängende Note. Ebenso mit „Eine Skala“ und ⇅ FOLGT.
- [ ] **MK5-20 Swing und Transport:** Globaler Swing 30 %, Arp 1/16, W-35 = 0: Die geraden Arp-Schritte liegen wie die Clip-16tel (± 1 ms). W-35 = +50: nur W-35 wirkt. Transport steht: Ein gehaltener Akkord läuft ≥ 4 s ohne Lücke weiter (Planer vor `R.playing`). Clip-Noten mit künftigen Zeitstempeln starten keinen Arp-Schritt zu früh.
- [ ] **MK5-21 Key Sync mit Arp:** Arp an, Gate 50 %, LFO1 und SEQ auf Key Sync „Timbre“: Die Phase läuft über die Arp-Schritte weiter und setzt nur bei einem neuen Akkord nach „alle Tasten los“ zurück (einmal je gehaltenem Akkord). Auf „Stimme“ setzt sie bei jeder Arp-Note zurück.
- [ ] **MK5-22 ECO:** Mit `forceNative` arpeggiert ein AM-Sound weiter (T1-Noten, `arpLog` wie im Worklet-Klang), keine Konsolenfehler.

**Tests.** `mk5-arp.mjs` (`arpLog`, `noteLog`), `mk5-arp-audio.mjs` (OfflineAudioContext, Einsätze), `mk5-ui.mjs`.

**Fach-Prüfung:** **FP-SONG ●** Haupt-, **FP-TOUCH** Zweit-Blick.

**iPhone:** [ARP ●], Akkord halten, ARP A TYP Alt 2, OKTAVEN 2. ARP B LÄNGE 6, zwei Schritt-Tasten aus. Mit laufendem Song spielen.

**Geräte-Abgleich:** Step-Arp „Schritt aus“ (rückt die Note weiter?). Swing +50. Gate 0. Key Sync aus bei laufendem Takt (microKORG ohne MIDI-Clock: nur Muster-Neustart vergleichen). Arp 1/16, Gate 50 %, LFO1 Key Sync Timbre: Startet der LFO je Akkord oder je Schritt neu? Auslösung Single mit Arp.

**Risiken.** Die Pausen-Regel ist [U]. Das Arp-Verhalten bei sehr kurzen Clip-Noten (< 1 Schritt) hängt von der Länge ab: Eine Note zählt, solange sie gehalten ist.

---

### MK6 — Mod-Sequenzer 3×16 und „Bewegung aufnehmen“

**Ziel.** Je Timbre verändern drei 16-Schritt-Sequenzen beliebige Regler im Takt, wie beim MS2000, mit Glatt oder Stufe, vier Laufrichtungen, Einmal oder Schleife und Neustart je Timbre oder je Stimme. Reglerbewegungen lassen sich in Echtzeit in die Schritte aufnehmen.

**Umfang.**
1. **Worklet**, je Timbre und je Stimme bei Key Sync „Stimme“.
   - SEQ AN/AUS, LETZTER SCHRITT 1–16, TYP (Vorwärts, Rückwärts, Wechsel 1 = 1…16, 15…2, Wechsel 2 = 1…16, 16…1), LAUF (Einmal hält den letzten Wert, Schleife), KEY SYNC (aus = Song-Raster bzw. freilaufend, Timbre, Stimme), AUFLÖSUNG W-10 bei Song-Tempo.
   - **KEY SYNC aus:** Zyklus C = Summe aller Schrittlängen in Schlägen (nach Schrittlänge). Der laufende Schritt ist dort, wo (Song-Schlag mod C) in den aufsummierten Längen liegt. Einmal mit KEY SYNC aus startet bei Song-Schlag 0 und hält nach C. Ein Tempo-Wechsel behält die Schlag-Lage (wie der synchrone LFO, Worklet Z. 4351–4355). **Timbre:** mit Arp gilt KEYS (MK5 Umfang 11).
   - Je Sequenz: ZIEL, BEWEGUNG (Glatt = linear zwischen den Schrittwerten, in Bruchwerten; Stufe = halten, jeder Sprung als lineare 1-ms-Rampe ab der Blockgrenze, B.6 Nr. 2), 16 Werte.
2. **Ziele:** keins, Tonhöhe (±24 HT), Schrittlänge (±6), Portamento, OSZ1-Steuer 1, OSZ1-Steuer 2, OSZ2-Halbton (±24), OSZ2-Fein, Mixer OSZ 1/OSZ 2/Rauschen, Cutoff, Resonanz, HK-INT, Keytrack, Amp-Pegel, Pan, EG1 A/D/S/R, EG2 A/D/S/R, LFO1-Freq, LFO2-Freq, Patch 1–4 Intensität. Ab MK11 nach MK-R1 auch die neuen Regler.
   - Abgeleitet aus HB-MS S. 43 („Regler des Bedienfelds, ±63“) und S. 65 (Regler-Liste). Schalter sind keine Ziele [U].
   - Der Schrittwert wird zum gespeicherten Reglerwert addiert und geklemmt.
   - Schrittlänge verschiebt den Auflösungs-Index des Schritts um den Wert (eK; HB-MS S. 43 „±6“).
   - Steuer 2 mit Speicherwelle ergibt eine Wellenfolge (2-ms-Gleichleistungs-Blende).
   - Tonhöhe wirkt auf den Keytrack (KT, B.2; HB-MS S. 39).
   - Ziel LFO1/2-Freq bei Tempo Sync an: ohne Wirkung [U] (wie der Patch, W-18; kein Geräte-Abgleich möglich, der microKORG hat keinen Seq; eK).
3. **Vorrang:** Zielen zwei Sequenzen auf denselben Regler, gilt SEQ 3 vor SEQ 2 vor SEQ 1. Die LCD zeigt „*“ (HB-MS S. 43).
4. **Bewegung aufnehmen** (HB-MS S. 26):
   - [● AUFN.] bei gewählter Sequenz. Die Aufnahme beginnt mit dem ersten bewegten Regler einer EDIT-Sektion.
   - Das Ziel der Sequenz wird dieser Regler. Werte werden ab dem laufenden Schritt bis LETZTER SCHRITT geschrieben, dann endet die Aufnahme selbst.
   - Nur der zuerst bewegte Regler zählt. ARP- und Effekt-Regler nehmen nicht auf.
   - Ein Undo für die ganze Aufnahme.
   - Während der Aufnahme läuft die Sequenz immer vorwärts und als Schleife (S. 42–43).
5. **Werkzeuge:** Sequenz neu (eine oder alle), kopieren (aus einem anderen AM-Sound, Timbre und Sequenz wählbar; 🔒 steckt an, EN3-08a), alles kopieren, tauschen. Je ein Undo (HB-MS S. 47–48).
6. **Reiter SEQ** (B.3):
   - Reihe 1: [SEQ 1][SEQ 2][SEQ 3] [ZIEL ▾] [● AUFN.] (ZIEL: Tipp-Liste; als Regler stetig mit Rundung, B.3)
   - Reihe 2: [SCHRITTE │ ALLGEMEIN] [GLATT │ STUFE] [SEQ ●]
   - SCHRITTE: 16 Säulen. P1 2 × 8 à 41 × 88 (4 px), P2 2 × 8 à 39 × 88, P3 2 × 8 à 36 × 88 als ein Canvas-Feld ohne Zwischenraum, L1 16 × 41 × 92 (3 px, 701 px), L2 16 × 36 × 92 (3 px). Senkrecht ziehen ändert den Wert über die **volle Säulenhöhe** in Ziel-Einheiten (±6/±24/±63), ohne Feinmodus über den Waagrecht-Abstand. Ein Tipp über bzw. unter dem Balken ändert ±1 (je ein Undo). Waagrecht > 8 px malt über mehrere Säulen. Eine Geste = ein Undo, ein zweiter Finger wird ignoriert. Der laufende Schritt ist hell (Canvas 2D, ≤ 30 Hz, nur sichtbar).
   - ALLGEMEIN: 5 Regler LÄNGE (letzter Schritt), TYP, LAUF, KEY SYNC, AUFLÖSUNG.
   - L1: Die beiden Kopfreihen stehen in einer Reihe (36 px), darunter die 16 Säulen (Summe 132 px).
   - P1: 44 + 4 + 44 + 8 + 2 × 88 + 4 = 280 px.
   - SPIEL: [SEQ ●].
7. **Leistungs-Probe:** Fall „+Seq“.

**Nicht-Umfang.** Seq im Vocoder-Modus (HB-MS hat dort keine Seq, S. 49–52). Mehr als 16 Schritte.

**Daten.** `t[].seq` wirkt jetzt.

**Berührungspunkte.**
- **Wiederverwendet:** Worklet-Tempo und Phase (`songStart`), Stimmen-Zustand, Undo, Canvas-Muster der vorhandenen Anzeigen.
- **Neu:** Seq-Kern (mit der Song-Raster-Regel), Säulen-Editor mit Tipp ±1, Aufnahme-Logik.

**Dauer** 7,5–8,5 h (Rev. 1: +0,5 h) · **Version 4.14.0** · **Budget** +35 KB · Format bleibt 5.

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
  - M-PLATZ in P1–P3, L1, L2, W. M-ANSICHT bei SCHRITTE ↔ ALLGEMEIN.
- [ ] **MK6-12 Leistung:** 3 Sequenzen je Timbre mit 4 Stimmen bei Key Sync „Stimme“ kosten ≤ +0,5 × VA-Stimme (Node-Offline, gleicher Lauf). Die Anzeige hat keine `longtask`, rAF ≥ 55 fps. Die Leistungs-Probe läuft mit „+Seq“.
- [ ] **MK6-13 Werkzeuge:** Kopieren, Tauschen und Neu ergeben deep-equal-Ergebnisse, je ein Undo. Regression und DoD, Budget ≤ +35 KB.
- [ ] **MK6-14 Keytrack und Aufnahme:** Seq-Tonhöhe +12 mit KEYTRACK +48 hebt den Cutoff um +12 HT ± 1 %. Während [● AUFN.] läuft die Sequenz vorwärts als Schleife, auch bei TYP Rückwärts und LAUF Einmal.

**Tests.** `mk6-seq.mjs` (Node-Offline), `mk6-rec.mjs`, `mk6-ui.mjs`.

**Fach-Prüfung:** **FP-DSP** Haupt-, **FP-SONG** Zweit-Blick (Taktgenauigkeit).

**iPhone:** SEQ → SEQ 1 ZIEL Cutoff, Säulen malen, Song starten. [● AUFN.] und Cutoff-Regler drehen.

**Geräte-Abgleich:** entfällt, der microKORG hat keinen Mod-Sequenzer. Die Kurven bleiben eK.

**Risiken.** „Schrittlänge“ ist eine Auslegung [U]. Ohne Gerät gibt es keinen Abgleich.

---

### MK7 — Vocoder mit 16 Bändern und Eingänge

**Ziel.** Ein AM-Sound wird zum Vocoder: Die Stimme (Mikrofon oder eine andere Spur) formt einen Akkord aus vier Stimmen. Mit „Formant halten“ klingt ein gespeicherter Vokal auch ohne Mikrofon, also auch in der Claude-App. Synth-Programme können einen Eingang wie einen Oszillator filtern.

**Umfang.**
1. **Eingänge** (EN3-15):
   - `tr.mkIn.e1/e2` = Mikrofon (nur Pages und nur auf Tipp, über den gemeinsamen Mikrofon-Abgriff) │ Spur k (Abgriff vor ihrem Fader) │ aus.
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
   - FOLGER = 127 oder [HALTEN ●] (SPIEL) friert die 16 Folgerwerte ein und speichert sie als `voc.hold` im Sound (HB-MK S. 35).
   - Ein Sound mit `hold` klingt ohne Quelle.
   - [HALTEN ●] aus = Folger läuft wieder (der Wert vor Halten wird zurückgesetzt).
5. **Oberfläche:**
   - EDIT 1 und EDIT 2 mit den Vocoder-Rastern (B.3), EING. mit [QUELLE 2 ▾], MIXER mit [QUELLE 1 ▾]; in beiden Listen der Schalter „Quelle nur als Eingang“ (H-10).
   - K-PEGEL/K-PAN mit 16 Säulen und Live-Bandpegeln (Canvas 2D, ≤ 30 Hz, nur sichtbar).
   - Zwei Werkzeuge: [Pegel zurücksetzen] (alle 127) und [Pan zurücksetzen] (alle Mitte), je ein Undo (HB-MS S. 52, HB-MK S. 60).
   - SPIEL im Vocoder-Modus nach B.3 (CUTOFF/RESONANZ → Vocoder-Filter, ATTACK/RELEASE nur EG2). ⋯ → Init behält `mode` 3 (HB-MS S. 51).
6. **Datenschutz:** Der Vocoder nimmt nichts auf. Das Mikrofon im Vocoder zählt wie 🎤-Hören (N2-VS1-02 (1)): SYNC und Realtime laufen weiter, das Audio verlässt das Gerät nie. Stopp gibt das Mikrofon frei.
7. **Leistungs-Probe:** Fall „Vocoder“ (synthetischer Modulator: Vokal-Folge aus der Vokal-Quelle, Umfang 8).
8. **Vokal-Quelle** (W-44: Glottis wie W-28 + F1–F4 als TPT-Resonatoren, Vokale a e i o u) als App-Code. MK8 rechnet daraus die `hold`-Spektren, MK12 macht daraus OSZ 1 Welle 8.
9. **Begrenzer Stufe 1:** Umschalten auf 2. Ordnung mit 30-ms-Überblendung und Pegelausgleich (B.4).
10. **ECO:** Ein Vocoder-Programm bleibt im ECO-Klang stumm, mit LCD-Hinweis (B.5).

**Nicht-Umfang.** Speichern des Modulators als Take (VS3). Vocoder für andere Engines (bleibt Spec §18, Teil G Nr. 11). Formant-Bewegung aufnehmen (RADIAS, nicht im Plan).

**Daten.** `mode` 3, `voc` und `tr.mkIn` (Spur, neutral `null`; `e1Dry`/`e2Dry` neutral 1).

**Berührungspunkte.**
- **Wiederverwendet:** aus VS1 `MIC_ASK`, `micAvail`, play-and-record und die Wege-Erkennung (nicht die VS1-Sitzung), Spur-Kette (Abgriff vor Vol/Pan, Trennung von `post`), Effektkern MK4, Arp MK5, Oktav-Tabellen (Träger), Fokus-Stimmen-Regel.
- **Neu:** gemeinsamer Mikrofon-Abgriff, Worklet-Eingang, Filterbank (TPT, eine Bank je Timbre), Folger, Halten, Kanal-Seiten, Kreis-Schutz, Schalter „Quelle nur als Eingang“, Vokal-Quelle.
- **Anzupassen:** `normTrack`/`normalizeProject` behalten `tr.mkIn` (Z. 11490–11500).

**Dauer** 10,5–11,5 h (Rev. 1: +2,5 h für Mikrofon-Abgriff, Abgriff vor dem Fader mit Schalter, Vokal-Quelle, Vocoder-Regeln aus dem Handbuch) · **Version 4.15.0** · **Budget** +50 KB · Format bleibt 5.

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
  - 127 bzw. [HALTEN ●]: Verstummt der Modulator, bleibt der Ausgang über 5 s ± 0,5 dB.
  - `hold` wird gespeichert und geladen (deep-equal). Ein Sound mit `hold` klingt ohne jede Quelle (Claude-App-Test).
- [ ] **MK7-04 Gate:** SCHWELLE 64 und Modulator darunter: Ausgang ≤ −60 dB nach der Gate-Zeit (W-39) ± 10 %. SCHWELLE 0: Der Ausgang folgt dem Modulator bis −90 dB, keine Gate-Schließung, bitgleich zu Gate aus.
- [ ] **MK7-05 HPF:**
  - HPF-PEGEL 127: Modulator-Anteile > 6 kHz erscheinen im Ausgang (≥ −20 dB relativ zum Modulator-HF).
  - HPF-GATE ENA: nur bei klingender Trägerstimme. DIS: immer.
- [ ] **MK7-06 Direkt:** DIREKT 127 bei stummem Träger (keine klingende Stimme): Ausgang korreliert ≥ 0,95 mit dem Modulator. DIREKT 0 = nichts.
- [ ] **MK7-07 Kanäle und Init:** K-PEGEL k = 0 ergibt Band k ≤ −40 dB. K-PAN k = L63 ergibt rechts ≤ −30 dB. [Pegel zurücksetzen] setzt alle Pegel auf 127 und lässt Pan deep-equal; [Pan zurücksetzen] setzt alle Pan auf Mitte und lässt die Pegel deep-equal; je ein Undo. ⋯ → Init auf einem Vocoder-Sound behält `mode` 3.
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
- [ ] **MK7-13 Oberfläche:** M-PLATZ der Vocoder-Raster und Kanal-Seiten in P1–P3, L1, L2, W. Der Wechsel Synth ↔ Vocoder lässt die Zellen an festen Plätzen (2 × 7). Bandpegel ≤ 30 Hz, rAF ≥ 55 fps.
- [ ] **MK7-14 Regression:** Die Abnahmen von VS0, VS1, VS2 und (wenn gebaut) VS3 bestehen, die Mikro-Wege sind unverändert bzw. laufen über den gemeinsamen Abgriff. Budget ≤ +50 KB.
- [ ] **MK7-15 ECO:** Mit `forceNative` bleibt ein `hold`-Sound der Vocoder-Bank stumm mit LCD-Hinweis (Pegel ≤ Worklet-Render), keine Konsolenfehler.
- [ ] **MK7-16 Vokal-Quelle:** Für C2 und C3 und alle 5 Vokale liegen F1/F2 der Spektralhülle bei W-44 ± 7 %. `tr.mkIn` übersteht Speichern → Laden deep-equal.

**Tests.** `mk7-voc.mjs` (Node-Offline mit `inputs`), `mk7-inputs.mjs` (Chromium, Fake-Mikrofon `--use-fake-device-for-media-stream`), `mk7-ui.mjs`.

**Fach-Prüfung:** **FP-DSP ●** Haupt-, **FP-IPHONE** und **FP-SICHER** Zweit-Blick (Mikrofon, N7V-35, Kreis-Schutz).

**Zwischenstand** nach MK7 (EN3-17) auf Pages, wegen des Mikrofons.

**iPhone** (Pages, mit Kopfhörer):
1. AM → PROG MODUS Vocoder → EING. QUELLE 2 Mikrofon. Sprechen und Akkord spielen.
2. [HALTEN ●], Mikrofon aus, weiterspielen.
3. In der Claude-App den gehaltenen Sound öffnen und spielen.
4. Für CHANGES: `ST.latMs` je Weg (Lautsprecher, Kabel, Bluetooth) ablesen und übernehmen.

**Geräte-Abgleich:** microKORG-Vocoder mit FORMANT +1/−1, FOLGER Halten, HPF-PEGEL hoch (Zischlaute?).

**Risiken.** iOS legt bei play-and-record den Ton auf den Hörer (VS0-Befund). Darum der Kopfhörer-Hinweis. Mikrofon → Ausgang dauert ≈ 70–75 ms (Lautsprecher oder Kabel): Der Rundlauf Ausgang → Raum → Mikrofon aus VS1 (69,9 / 75,2 ms, `fragen-xander-9.md`) ist Eingangs- plus Ausgangslatenz, also derselbe Weg; dazu iOS-Puffersprünge von 256/384 Samples. DIREKT und HPF-PEGEL geben deshalb ein hörbares Echo der eigenen Stimme in den Kopfhörer, und der Vocoder wirkt verzögert. Alle MK8-Vocoder-Klänge haben DIREKT 0 und HPF-PEGEL ≤ 40 (INIT erfüllt das). Die Hilfe-Zeile nennt die Latenz. Bei Bluetooth-Kopfhörern schaltet iOS bei offenem Mikrofon voraussichtlich auf das Freisprech-Profil (mono, schmalbandig; am Gerät prüfen); darum der Hinweis „Kabel-Kopfhörer empfohlen“ bei `bt`.

---

### MK8 — Werksklänge in acht Genre-Bänken

**Ziel.** Xander findet seine Klänge wie am microKORG nach Genre: acht Bänke mit je acht eigenen Klängen. Jeder Klang zeigt, was die Klangerzeugung kann (Arp, Seq, Vocoder, Split, Speicherwellen).

**Umfang.**
1. **64 Klänge** (Vorgabe H-3) auf Seite A, A.11…A.88. Bänke:
   1. Trance
   2. Techno/House
   3. Electronica
   4. D&B/Breaks
   5. HipHop/Vintage
   6. Retro
   7. Effekte/Hits
   8. Vocoder

   Seite B bleibt den eigenen AM-Sounds.
2. **Rezepte frei entworfen** (EN3-07). Je Bank eine Mischung der Rollen (Bass, Lead, Fläche, Sequenz/Arp, Akkord, Effekt).
   - Die Vocoder-Bank hat 8 Klänge mit `hold`-Spektren aus **eigenen** synthetischen Vokalen (Vokal-Quelle aus MK7, W-44, als Modulator; offline beim Bau oder zur Laufzeit gerechnet). Sie klingen ohne Mikrofon. Alle haben DIREKT 0 und HPF-PEGEL ≤ 40 (Latenz, MK7 Risiken).
   - Jeder Klang hat `role`, `bank` (1…8), `slot` (1…8) und ⓘ (eigene Worte, keine Marken, keine Geräte, keine Künstler).
3. **Kompakt kodiert:** Ganzzahl-Bytes je Feld in fester Reihenfolge, Base64, im Block `sq-mk-src`. Entpackt wird erst bei Bedarf, vorher `tickAhead(.3)`. Trifft die Kodierung zufällig ein Markenwort, ändert das Bau-Skript das Salz-Byte (B.6 Nr. 9).
4. **Programm-Wähler** (SPIEL): Bank ▾ (8 Namen), A │ B, Anzeige „A.24“, Tasten 1–8. Ein Tipp lädt in die Spur, ein Undo, Toast [Rückgängig]. ‹ › im Kopf blättert in der Bank.
5. **Bibliothek:** Engine-Filter „AM“ plus Chip „Bank ▾“, ▶ Vorhören mit der vorhandenen Vorhör-Stimme, INIT AM unter „Init“.

**Nicht-Umfang.** Hörproben nach EN2-09 (das gilt für Vorbild-Sounds, V10P). Vorbild-Tags. Seite B mit Werksklängen (nur bei H-3 = 128).

**Daten.** Werksdaten `SQ_MK_FACTORY` (kompakt). Sound-Felder `bank`, `slot`: `normalizeSound` nimmt sie in seine Feld-Liste auf (Z. 7920–7928, neu); sie zählen nicht zum `soundHash` (dieselbe Regel, die V10P-10 später für `aud`/`role` festlegt; diese Felder gibt es heute noch nicht).

**Berührungspunkte.**
- **Wiederverwendet:** `SQ_FACTORY`-Muster, Bibliothek und Filter (N0b-01), Vorhören (V0b), Pegel-Messung aus V10P (`v10p-pegel.mjs`-Verfahren), Vokal-Quelle (MK7).
- **Neu:** Bank-Wähler, Werksdaten, Felder `bank`/`slot` in `normalizeSound`.

**Dauer** 8–9 h in zwei Bau-Abschnitten:
1. Datenform, Wähler, Bänke 1–4.
2. Bänke 5–8, Bibliothek, Prüfskripte.

**Version 4.16.0** · **Budget** +40 KB · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK8-01 Vollständig:** 64 Klänge, je Bank 8, jeder mit Name, Rolle, Bank, Platz und ⓘ. Jeder lädt über die Taste und über die Bibliothek, ein Undo. `bank`/`slot` überstehen Speichern → Laden deep-equal.
- [ ] **MK8-02 Namen:**
  - Die E9-Prüfliste (A.13 der Spec) besteht.
  - Kein Name ist gleich oder ähnlich einem Werksnamen der Programmlisten HB-MK (PDF 77) und HB-MS (S. 68–70). Ähnlich heißt: Levenshtein ≤ 2, ohne Groß- und Kleinschreibung, Ziffern und Leerzeichen.
  - Die Listen liegen nur in der privaten Datei `scratchpad/manuals/werksnamen.local.json` (EN3-07). `mk8-daten.mjs` liest sie und scheitert, wenn sie fehlt. Eine Prüfung sucht 3 Werksnamen als Stichprobe in `bau/tests/` und im Repo: 0 Treffer.
  - Kein Markenwort (B.6 Nr. 9).
- [ ] **MK8-03 Herkunft:** CHANGES vermerkt je Klang „eigenes Rezept“. Kein Werksklang ist mit einem Import-Testdump identisch (Prüfskript).
- [ ] **MK8-04 Pegel:**
  - Prüfphrase je Rolle: Bass 8 Achtel C2, Lead C4–C5, Fläche 4 Takte Akkord, Arp/Seq Akkord mit Arp an, Vocoder gehaltene Akkorde.
  - Ergebnis −18 ± 3 LUFS, True Peak ≤ −1 dBTP.
  - Bässe: M-HANDYrel bei C2 ≥ −20 dB (wie V10P-07).
  - Wer eine Grenze verfehlt, wird nachgestimmt, nicht die Grenze.
  - Gemessen wird mit den Platzhalter-Wellen. Nach MK10 zeigt der Bericht die Pegel-Abweichung der eingelesenen Wellen (MK10-11); MK8-04 läuft nur bei Variante „eingebaut“ erneut.
- [ ] **MK8-05 Merkmale** (Prüfskript zählt):
  - ≥ 8 Klänge mit Arp an (Bänke 1, 2, 3, 6 zusammen).
  - ≥ 4 mit Mod-Seq.
  - Alle 8 Vocoder-Klänge mit `hold`, DIREKT 0 und HPF-PEGEL ≤ 40.
  - ≥ 6 mit Speicherwellen (zeigen „≈“).
  - ≥ 4 mit Dual oder Split.
  - ≥ 4 mit Delay-Sync.
- [ ] **MK8-06 Keine Doppel:** Innerhalb jeder Bank unterscheiden sich alle Paare um ≥ 3 dB in mindestens einem relevanten M-BAND.
- [ ] **MK8-07 Bibliothek:** Der Filter „AM“ + Bank n liefert genau die 8 Klänge. N0b-01 bleibt erfüllt. ▶ Vorhören funktioniert.
- [ ] **MK8-08 Größe und Zeit:** Die Werksdaten im Block sind ≤ 24 KB. Alle 64 entpacken in ≤ 20 ms (Xeon). Ein Tipp lädt in ≤ 50 ms ohne `longtask`. Die Startzeit ohne AM bleibt unverändert.
- [ ] **MK8-09 Oberfläche:** Programmzeile und Bank-Liste: M-PLATZ in P1–P3, L1, L2, W.
- [ ] **MK8-10 Regression und DoD**, Budget ≤ +40 KB.

**Tests.** `mk8-daten.mjs` (Namen, Herkunft, Merkmale), `mk8-pegel.mjs`, `mk8-ui.mjs`.

**Fach-Prüfung:** **FP-KLANG ●** Haupt-, **FP-TOUCH** Zweit-Blick.

**Zwischenstand** nach MK8 (EN3-17).

**iPhone:** Jede Bank einmal durchtippen, einmal über den Lautsprecher, einmal mit Kopfhörer. Ausreißer melden (zu leise, zu laut, langweilig).

**Geräte-Abgleich:** Xander sagt je Bank, ob die Klangwelt zur Bank seines microKORG passt. Das ist ein Urteil über das Genre, kein Kopie-Vergleich.

**Risiken.** Nichts ist angehört. 64 Klänge sind viel Klangarbeit, deshalb zwei Bau-Abschnitte.

---
### MK9 — Import eigener .syx/.prg-Dateien (nur lokal)

**Ziel.** Xander holt seine eigenen microKORG- und MS2000-Programme in die App. Sie bleiben auf seinem Gerät und gehen nie ins Netz.

**Tor MK9-T** (vor dem ersten Bau-Schritt in CHANGES protokolliert). Es gilt eines von beiden:
- (a) Am Bau-Ort liegt ein Formatbeleg für die Programmdaten von MS2000 und microKORG. Das ist das Korg-Dokument „MIDI Implementation“ mit der Program-Data-Tabelle und der 7-Bit-Paketierung. Es ist nicht Teil der Handbücher (HB-MS S. 64). **Vorgabe (H-7):** Der Orchestrator holt das öffentliche Dokument und legt es privat neben die Handbücher (nur Fakten übernehmen, wie bei den Handbüchern).
- (b) Xander liefert **drei Test-Dumps** mit notierten Werten nach dem Blatt in Teil D.7 (freiwillig; braucht USB-MIDI und ein Editor- oder Librarian-Programm). Dann wird die Zuordnung daran erarbeitet und geprüft. (b) reicht nur für die Felder, die die Test-Dumps abdecken. Die übrigen Felder bleiben bis (a) auf INIT, mit Hinweis.

Ohne Tor wird das Paket nicht gebaut. MK10–MK13 laufen dann weiter (E.5 Nr. 3).

**Umfang.**
1. **Datei-Wahl** über den vorhandenen .syx-Weg (Menü → Sounds → [Programme importieren (.syx/.prg)], ohne `accept`-Attribut wegen iOS, wie Z. 26513).
2. **Erkennen:** Gerät (MS2000/microKORG), Einzelprogramm oder Bank, .prg. Entschlüsseln laut Formatbeleg. Jedes Feld wird auf `p.mk` abgebildet, über eine Zuordnungstabelle im Code mit Seitenangabe des Belegs in einem Kommentar ohne Markennamen.
3. **microKORG-Besonderheiten** (A.11):
   - Layer → Dual. Die Stimmen-Teilung folgt der Zuweisung beider Timbres (HB-MK S. 16, Tabelle).
   - 8 Vocoder-Kanäle → 16 Bänder (Pegel und Pan doppelt).
   - Eingänge nach Funktion zugeordnet (mK IN 1 → E2, IN 2 → E1), Balance unverändert (A.11 Nr. 5).
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

**Dauer** 6–7 h (Rev. 1: +1 h) · **Version 4.17.0** · **Budget** +27 KB · Format bleibt 5.

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

### MK10 — Speicherwellen aus Xanders Aufnahmen

**Ziel.** Die 64 Platzhalter werden durch Wellen ersetzt, die aus Xanders eigenen microKORG-Aufnahmen gewonnen sind. Damit klingt die Klangerzeugung „original“ (KF §3–4).

**Tor MK10-T:** Die Aufnahmen nach Teil D liegen vor (Prüfliste D.4 erfüllt). Die Antwort auf H-2 liegt vor (Vorgabe: lokal).

**Umfang (Vorgabe „lokal“).**
1. **Blatt „Wellen einlesen“** (Menü → Sounds): zuerst **[Testdatei prüfen]** mit `test.wav` (Pegel, Stille, Kanal; klare Meldung). Dann mehrere WAV- oder AIFF-Dateien wählen (`ref-saege.wav`, `sw-01.wav` … `sw-64.wav` oder die Sammel-Dateien `sw-01-08.wav` … `sw-57-64.wav`, `stille.wav`), Fortschritt anzeigen, [Abbrechen].
2. **Analyse im Browser**, in Häppchen ≤ 8 ms bzw. im Worker, wenn vorhanden:
   - Sammel-Datei (8 Wellen, getrennt durch ≥ 3 s Stille): an der Stille teilen und nach Reihenfolge zuordnen.
   - Kanal: bei Stereo der lautere bzw. nicht stille Kanal.
   - Einsatz-Erkennung je Ton. Die Tonhöhe wird gemessen, nicht angenommen.
   - Stabilen Abschnitt wählen (0,5–1,5 s nach dem Einsatz).
   - Periodensynchrone Mittelung über ≥ 0,5 s ergibt eine Periode.
   - DFT ergibt die Teiltöne 1…N (N = min(64, Nyquist/f₀)), Pegel und Phase.
   - **Korrektur** mit der Bezugs-Säge: H(f) = gemessene Säge / ideale 1/n, über Frequenz geglättet. Alle Wellen werden durch H geteilt.
   - **Pegel-Eichung:** Der RMS der Bezugs-Säge entspricht der AM-Säge bei Mixer 127.
   - Eine Tabelle je aufgenommener Oktave (C1…C7) als Oktav-Tabellen (B.6 Nr. 6). Fehlt eine Oktave, gilt die Nachbaroktave, mit Hinweis.
3. **Speicher:** eine **eigene IndexedDB-Datenbank `synq-mkwaves`** (Version 1), wie `synq-miccheck` (Z. 29790). Die Datenbank `synquenzer` bleibt unberührt und ohne Versionserhöhung: Ein neuer Store dort zwänge ältere Stände und offene Tabs in den localStorage-Rückfall bzw. `onversionchange` (Z. 8195–8198, 8222). MK10 ruft `navigator.storage.persist()` selbst auf und zeigt das Ergebnis. Die Wellen gehen nie in einen Upload, nie in Projekt, Sound oder Bibliothek. Die Engine nimmt eingelesene Wellen statt der Platzhalter. Das „≈“ verschwindet nur für diese Wellen. [Platzhalter benutzen] schaltet zurück. [Wellen exportieren] und [Wellen importieren] als lokale Datei, für einen anderen Speicher-Ursprung (MK9 Umfang 5).
4. **Bericht** je Welle: Güte (Stabilität der Periode, Klirr der Mittelung, Clipping, Rauschabstand gegen `stille.wav`) und die Pegel-Abweichung von ihrem Platzhalter.

**Variante „eingebaut“ (nur wenn H-2 = ja).** Dieselbe Analyse läuft offline (Node) beim Bau. Das Ergebnis ist ein kompakter Datenblock (Teiltonpegel als Bytes je Oktave, Phasen als 6 Bit) in der App, ≤ 45 KB. Das Blatt „Wellen einlesen“ entfällt. Die Rohdateien kommen nicht ins Repo.

**Nicht-Umfang.** Aufnahmen anderer Gerätewellen. Eich-Kurven für Filter und Hüllkurven (nur bei H-6 = ja, dann +2 h; Kurven nach D.6).

**Berührungspunkte.**
- **Wiederverwendet:** Oktav-Tabellen und Mipmaps (MK2, `mkTables`), Datei-Wahl, eigene IndexedDB-Datenbank nach dem Muster `synq-miccheck`, Fake-Supabase-Gerüst (`online.md` §7.7, `__synqFakeSupa`, WebSocket-Mitschnitt).
- **Neu:** WAV-Lesen (PCM 16/24 Bit und 32-Bit-Float, 44,1/48 kHz, mono/stereo), AIFF-Lesen, Kanalwahl, Teilen an der Stille, Testdatei-Prüfung, Analyse, Datenbank `synq-mkwaves`, Export/Import der Wellen. V9d nutzt WAV-Leser und lokalen Speicher später mit (Teil G Nr. 12).

**Dauer** 6,5–7,5 h (Rev. 1: +1,5 h) · **Version 4.18.0** · **Budget** +25 KB (Variante eingebaut: +65 KB, ohne Wellen-Leser) · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK10-01 Tor:** Dateiliste und Prüfsummen (lokal) in CHANGES. Keine Aufnahme-Datei im Repo.
- [ ] **MK10-02 Nachbau:** Für jede eingelesene Welle und jede aufgenommene Oktave wird die Neu-Synthese (Speicherwelle, Filter offen) mit der Aufnahme verglichen:
  - M-BAND-Abstand ≤ 1,5 dB je relevantem Band.
  - Teiltöne 1–16 ≤ 2 dB, Median ≤ 1 dB.
- [ ] **MK10-03 Bezug:** Die Säge-Aufnahme liegt nach der Korrektur bei 1/n ± 0,5 dB (Teiltöne 1–20).
- [ ] **MK10-04 Zwischen den Oktaven:** Eine Tonleiter C2–C6 hat keinen Pegelsprung > 1,5 dB (M-PEGEL) und keinen M-SP-Sprung > ⅙ Okt.
- [ ] **MK10-05 Endlos:** Welle 35 erfüllt MK2-04 auch mit den Aufnahmen.
- [ ] **MK10-06 Lokal:** Beim Einlesen gibt es 0 Netzaufrufe. Die Tabellen fehlen in jedem Upload (Fake-Supabase-Gerüst `online.md` §7.7 mit WebSocket-Mitschnitt; hängt nicht an MK9). Ein anderer Speicher-Ursprung hört Platzhalter mit „≈“, bis die Wellen dort importiert sind.
- [ ] **MK10-07 Analyse-Zeit:** 66 Dateien à ≈ 25 s in ≤ 60 s (Xeon), keine `longtask` > 50 ms, Fortschritt sichtbar, abbrechbar ohne halbe Daten (atomar je Welle).
- [ ] **MK10-08 Fehlerpfade:**
  - 44,1 kHz wird umgerechnet. Bei Stereo wird der lautere bzw. nicht stille Kanal genutzt (ein Kabel in Kanal 2 ergibt keine stille Welle).
  - 32-Bit-Float-WAV und AIFF werden gelesen. Andere Formate (z. B. M4A) bekommen eine klare Meldung mit dem Export-Weg aus Teil D.
  - [Testdatei prüfen] meldet „zu leise“ (Spitze < −30 dBFS), „übersteuert“ (≥ −1 dBFS) und „stille Datei“.
  - Eine Sammel-Datei mit 8 Wellen wird richtig geteilt und zugeordnet.
  - Clipping wird erkannt („bitte neu aufnehmen“).
  - Eine fehlende Oktave nimmt den Nachbarn, mit Hinweis.
  - Falscher Dateiname: Die Zuordnung ist von Hand wählbar.
- [ ] **MK10-09 Oberfläche und Budget:** M-PLATZ des Blatts in P1–P3, L1, L2, W. Budget ≤ +25 KB (bzw. +65 KB).
- [ ] **MK10-10 Datenbank getrennt:** Nach dem Einlesen öffnet ein Tab des Vorgänger-Stands (4.17.0 oder der zuletzt ausgelieferte) Projekt und Bibliothek aus IndexedDB: kein localStorage-Rückfall, kein `versionchange`, alles intakt.
- [ ] **MK10-11 Pegel-Bericht:** Der Bericht zeigt je eingelesener Welle die Pegel-Abweichung vom Platzhalter. MK8-04 läuft nur bei Variante „eingebaut“ erneut.

**Tests.** `mk10-analyse.mjs` (mit synthetischen „Aufnahmen“ aus bekannten Wellen, eigenem Filter-Abfall und Rauschen), `mk10-lokal.mjs`, `mk10-ui.mjs`.

**Fach-Prüfung:** **FP-DSP** Haupt-, **FP-SICHER** Zweit-Blick (lokal).

**Zwischenstand** nach MK10 (EN3-17).

**iPhone:** Wellen einlesen (Dateien aus „Dateien“ oder iCloud), dann OSZ 1 → Speicherwelle und mit dem Gerät vergleichen.

**Risiken.** Die Lizenzfrage ist offen (H-2). Ob sich die DWGS-Wellen je Oktave ändern, ist [U], deshalb mehrere Oktaven. Raumgeräusche fallen weg, weil Line-Aufnahme Pflicht ist. Die eingelesenen Wellen gelten je Speicher-Ursprung; für einen anderen dient Export/Import.

---

### MK11 — RADIAS-Teil 1: zweites Filter und Verzerrer

**Ziel.** Ein zweites Filter je Timbre, seriell, parallel oder individuell verschaltbar (KF [B] „2 Filter, die man verschalten kann“), dazu ein Verzerrer vor dem Filter. Kein 1:1-RADIAS.

**Umfang.**
1. **Filter 2** `f2` je Timbre:
   - TYP: aus, 24LPF, 12LPF, 12BPF, 12HPF. CUTOFF, RESONANZ, HK-INT (Quelle EG1; ab MK12 wählbar EG3), KEYTRACK, ANSCHLAG (W-01 … W-05).
   - Der Kammfilter des RADIAS ist nicht im Plan.
2. **ROUTING** `fr`:
   - 0 einzeln (wie MS2000)
   - 1 seriell (F1 → F2)
   - 2 parallel (Mixer → F1 und F2, Balance `fbal` 0…127)
   - 3 individuell (OSZ 1 → F1, OSZ 2 + Rauschen → F2) [eK]
3. **Verzerrer** `drv` {TYP aus │ weich │ hart │ Falter, STÄRKE 0…127} zwischen Mixer und Filter 1 [W] (W-45, 2× Überabtastung + ADAA). Die MS2000-Verzerrung im AMP bleibt.
4. **Neue Patch-Ziele** „Cutoff 2“ (d 8) und „Verzerrer“ (d 9). Die neuen Regler sind Seq-Ziele (MK-R1).
5. **Sektionen** FILTER 2 und DRIVE (EDIT 1, Reihe 2, Plätze 6 und 7).
6. **Leistungs-Probe:** Fall „+Filter 2/Drive“.

**Nicht-Umfang.** Kammfilter, Filter-Morph, 11 Verzerrer-Typen (RADIAS), Effekt-Typen des RADIAS.

**Daten.** `t[].f2`, `t[].fr`, `t[].fbal`, `t[].drv` (neutral: TYP aus, `fr` 0).

**Berührungspunkte.** Ladder-Kern (zweite Instanz je Stimme), Patch- und Seq-Ziellisten.

**Dauer** 6–7 h · **Version 4.19.0** · **Budget** +25 KB · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK11-01 Aus = bitgleich:** TYP aus und `drv` aus sind bitgleich zum Vorgänger-Stand.
- [ ] **MK11-02 Filter 2 allein:** Steilheiten und Werte an W-01 wie MK1-11.
- [ ] **MK11-03 Seriell:** F1 24LPF Cutoff 1 kHz + F2 12HPF Cutoff 200 Hz (Polfrequenzen, W-01): Die Antwort liegt bei 1 kHz ± 5 % bei −12 ± 0,5 dB (F1) und bei 200 Hz ± 5 % bei −6 ± 0,5 dB (F2), dazwischen ein Durchlass.
- [ ] **MK11-04 Parallel:** Die Summe gleicht den Einzel-Renders (max |Δ| ≤ 1e-4). Balance 0/127 ergibt nur F1 bzw. nur F2 (≥ 40 dB).
- [ ] **MK11-05 Individuell:** OSZ 1 läuft nur durch F1 (F2 zu → OSZ 1 bleibt ± 0,5 dB), OSZ 2 nur durch F2.
- [ ] **MK11-06 Verzerrer** (Eingang Sinus× mit X-MOD 0, Filter offen):
  - Verzerrer aus: 3. Teilton ≤ −50 dB.
  - Weich bei STÄRKE 64: 3. Teilton ≥ −30 dB.
  - Hart: die Klemmgrenze nach W-45.
  - Falter: M-SP steigt über die STÄRKE monoton (H-3).
  - Pegel ± 2 dB gegen aus.
  - Alias mit Säge C5 als Eingang (B.6 Nr. 12): Hart ≤ −40 dB, Falter ≤ −30 dB.
- [ ] **MK11-07 Ziele:** Patch → Cutoff 2 und → Verzerrer wirken nach W-18. Seq → FILTER-2-Cutoff wirkt.
- [ ] **MK11-08 Umschalten:** ROUTING und TYP bei klingender Note bestehen M-KLICK und M-EINBRUCH.
- [ ] **MK11-09 CPU:** Filter 2 an kostet ≤ +40 % je Stimme, Verzerrer ≤ +10 % (Node-Offline). Die Leistungs-Probe läuft mit dem neuen Fall.
- [ ] **MK11-10 Oberfläche:** M-PLATZ in P1–P3, L1, L2, W. Das Raster ist jetzt voll (14), nichts rückt. H-1/H-3. Regression, Budget ≤ +25 KB.

**Tests.** `mk11-filter2.mjs`, `mk11-drive.mjs`, `mk11-ui.mjs`.

**Fach-Prüfung:** **FP-DSP** Haupt-, **FP-IPHONE** Zweit-Blick.

**iPhone:** FILTER 2 seriell als Hochpass hinter einer Säge, DRIVE „Falter“ langsam aufdrehen.

**Geräte-Abgleich:** entfällt (kein RADIAS vorhanden).

**Risiken.** Die doppelte Filterlast trifft das iPhone. Der Begrenzer bekommt keine neue Stufe. Liegt die Probe über der Grenze, gilt B.4 (CHANGES).

---

### MK12 — RADIAS-Teil 2: dritte Hüllkurve und Formant-Oszillator

**Ziel.** Eine frei verwendbare dritte Hüllkurve und ein Vokal-Oszillator, bei dem man die Mundform regelt (KF [B]).

**Umfang.**
1. **EG3** `e3` je Timbre (ADSR + NEUSTART, W-06). Patch-Quelle „EG 3“ (s 8), Seq-Ziele (MK-R1). Als Hüllkurve für Filter 2 wählbar (`f2.egs` 1 │ 3). Sektion HK 3 in EDIT 2.
2. **Formant-Oszillator** (OSZ 1 Welle 8, W-44):
   - Er nutzt die Vokal-Quelle aus MK7: bandbegrenzter Glottis-Puls (W-28) in die Resonatoren F1–F4 (TPT-SVF, parallel, Bandbreiten 80/90/120/150 Hz). Neu ist hier die Welle 8 mit Morph und LFO.
   - STEUER 1 = Vokal-Morph a → e → i → o → u, stetig, Frequenzen logarithmisch interpoliert. STEUER 2 = LFO1-Tiefe.
   - Er ist auch Vocoder-Träger.
   - Das LCD zeigt den nächsten Vokal: „FORMANT · VOKAL e→i 72“.

**Nicht-Umfang.** Formant-Bewegung aufnehmen, mehr Patches (RADIAS hat 6), weitere Vokale oder Sprachen.

**Daten.** `t[].e3`, `o1.w` 8, `f2.egs`.

**Berührungspunkte.** Hüllkurven-Kern, Patch-Quellen, Vokal-Quelle aus MK7, Oktav-Tabellen (nicht nötig: die Resonatoren arbeiten in Hz).

**Dauer** 5,5–6,5 h (Rev. 1: −0,5 h, die Vokal-Quelle kommt aus MK7) · **Version 4.20.0** · **Budget** +22 KB · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK12-01 Neutral:** EG3 ohne Route und ohne Wahl als Filter-2-Hüllkurve ist bitgleich zum Vorgänger-Stand.
- [ ] **MK12-02 EG3:** Die Zeiten nach W-06 ± 10 %. Als Patch-Quelle wirkt sie nach W-18. Filter 2 folgt EG3 bei `egs` 3.
- [ ] **MK12-03 Vokale:** Für C2 und C3 und alle 5 Vokale liegen die Spitzen der Spektralhülle bei F1/F2 der Tabelle ± 7 %, F3 ± 10 %.
- [ ] **MK12-04 Morph:** Ein Zug über STEUER 1 in 1 s besteht M-KLICK. Der F2-Verlauf ist stetig (kein Sprung > 5 % je Block).
- [ ] **MK12-05 Alias:** C6 hat gefaltete Energie (B.6 Nr. 12) ≤ −50 dB.
- [ ] **MK12-06 Träger:** Der Formant-Oszillator als Vocoder-Träger besteht MK7-08.
- [ ] **MK12-07 CPU:** Formant ≤ 1,5 × Säge. EG3 ≤ +2 % (Node-Offline).
- [ ] **MK12-08 Oberfläche:** HK 3 in EDIT 2. M-PLATZ in P1–P3, L1, L2, W. H-1/H-3. Regression, Budget ≤ +22 KB.

**Tests.** `mk12-eg3.mjs`, `mk12-formant.mjs`, `mk12-ui.mjs`.

**Fach-Prüfung:** **FP-DSP** Haupt-, **FP-KLANG** Zweit-Blick.

**iPhone:** OSZ 1 → Formant, STEUER 1 langsam von 0 nach 127 („a-e-i-o-u“). PATCH: EG 3 → OSZ1-Steuer.

**Risiken.** Die Vokal-Tabelle stammt aus der Sprachforschung, nicht vom RADIAS.

---

### MK13 — RADIAS-Teil 3: mehr Stimmen

**Ziel.** Bis zu 8 Stimmen je AM-Spur, wo das iPhone es trägt (KF [B]: RADIAS 24 statt 4 Stimmen; hier begrenzt durch Plan Punkt 5).

**Umfang.**
1. **STIMMEN-ZAHL** `vmax` 4 │ 8 in PROG (Vorgabe 4 = MS2000).
2. Bei 8 ist die Timbre-Teilung 2+6 │ 4+4 │ 6+2. Unison bei 8 nach W-15. Der Vocoder ist bei 8 erlaubt.
3. **Begrenzer** (B.4): Stufe 1 setzt `vmax` 8 → 4 für neue Noten.
4. **Kopf-Anzeige** (L9): „8 St“ bzw. „4 St (Begrenzer)“.
5. **Leistungs-Probe:** Fall „8 Stimmen“ (4 Spuren × 8).

**Nicht-Umfang.** Mehr als 2 Timbres (RADIAS 4), mehr als 8 Stimmen.

**Daten.** `vmax`.

**Berührungspunkte.** `POOL` bleibt 12 (8 Stimmen + 4 Stehl-Blenden). Begrenzer.

**Dauer** 3–4 h · **Version 4.21.0** · **Budget** +10 KB · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK13-01 Stimmen:** 8 Tasten ergeben 8 Stimmen, die 9. stiehlt (M-KLICK). `vmax` 4 ist bitgleich zum Vorgänger-Stand. Umschalten von `vmax` bei klingenden Noten über `engXf` (B.6 Nr. 2).
- [ ] **MK13-02 Teilung:** 2+6, 4+4 und 6+2 verhalten sich wie MK3-02 sinngemäß.
- [ ] **MK13-03 CPU:** 8 Stimmen ≤ 2,1 × 4 Stimmen (Node-Offline).
- [ ] **MK13-04 Begrenzer:** Bei simulierter Last > 0,45 bekommen neue Noten höchstens 4 Stimmen. Gespeichertes bleibt deep-equal (I-08). Die Anzeige erscheint.
- [ ] **MK13-05 iPhone-Grenze:** Xanders Probe „8 Stimmen“ steht in CHANGES. Liegt `load_med` (Σ der 4 Probe-Engines, B.4) > 0,40 oder ist `frames_ok` falsch, gilt ab dann: `vmax` 8 klingt nur auf höchstens 2 AM-Spuren gleichzeitig, weitere fallen auf 4 (Regel und Wert in CHANGES). Die Schwelle lässt wie beim Fall „Kern“ Platz für den Rest des Projekts.
- [ ] **MK13-06 Oberfläche:** PROG mit STIMMEN-ZAHL, M-PLATZ in P1–P3, L1, L2, W. Regression, Budget ≤ +10 KB.

**Tests.** `mk13-voices.mjs`, `mk13-limit.mjs`.

**Fach-Prüfung:** **FP-IPHONE ●** Haupt-, **FP-DSP** Zweit-Blick.

**Zwischenstand** nach MK13 (EN3-17).

**iPhone:** Leistungs-Probe „8 Stimmen“ schicken. Eine Fläche mit 8 Stimmen und vollen Akkorden spielen.

**Risiken.** Ob das iPhone 4 × 8 Stimmen trägt, ist offen. Die Regel MK13-05 fängt das ab.

---

## Teil D — Aufnahme-Anleitung für die Speicherwellen (für MK10; an Xander weitergeben)

**Wozu:** Die App bildet die 64 gespeicherten Wellen deines microKORG bisher nur nach. Mit diesen Aufnahmen rechnet sie die echten Wellen aus. Die Dateien bleiben bei dir. Die App liest sie auf deinem Gerät ein, nichts wird hochgeladen (Vorgabe H-2).

**D.1 Was du brauchst (≈ 75 min)**
- microKORG mit Netzteil
- dein Audio-Interface am Mac. Das Interface nimmt nicht selbst auf; das macht ein Programm am Rechner. Hier beschrieben: **GarageBand**.
- Kabel vom Ausgang **L/MONO** des microKORG in den **Kanal 1** des Interfaces (Line-Eingang; kein Mikrofon!)
- Kopfhörer zum Mithören
- Am Interface: Phantomspeisung (+48 V) aus, Kompressor, EQ und Effekte aus. Schickt das Interface stereo an den Rechner, ist das in Ordnung: Die App nimmt den Kanal mit Signal.
- Die App liest WAV (16 Bit, 24 Bit oder 32 Bit Float) und AIFF, mit 44,1 oder 48 kHz, mono oder stereo. M4A (zum Beispiel aus Sprachmemos) liest sie nicht.

*Für den Orchestrator: Interface-Modell und Rechner bei Xander bestätigen (vermutlich das weiße Yamaha AG06). Erst danach einen kleinen Gerätekasten mit den genauen Schaltern ergänzen.*

**D.2 Gerät einmal vorbereiten**
1. **GLOBAL** (HB-MK S. 47):
   - MASTER TUNE 440,0 (Anzeige „40.0“)
   - MASTER TRANSPOSE 0
   - VELOCITY CURVE auf den festen Wert **100**
2. Wähle ein Synth-Programm, das du überschreiben darfst. Stelle es so ein (EDIT SELECT 1/2, Regler 1–5):
   - **VOICE:** SYNTH, SINGLE, VOICE ASSIGN Poly, TRIGGER Multi.
   - **PITCH:** TRANSPOSE 0, TUNE 0, PORTAMENTO 0, VIBRATO INT 0.
   - **OSC1:** WAVE DWGS, CONTROL 2 = 1.
   - **MIXER:** OSC 1 LEVEL 127, OSC 2 LEVEL 0, NOISE LEVEL 0.
   - **FILTER:** TYPE −24 dB LPF, CUTOFF 127, RESONANCE 0, FILTER EG INT 0, KEY TRACK 0.
   - **AMP:** LEVEL 100, PANPOT Mitte, DISTORTION OFF, KBD TRACK 0.
   - **AMP EG:** ATTACK 0, DECAY 0, SUSTAIN 127, RELEASE 10, EG RESET ON.
   - **PATCH 1–4:** MOD INT jeweils 0.
   - **MOD FX:** EFFECT DEPTH 0. **DELAY:** DELAY DEPTH 0. **EQ:** LOW EQ GAIN 0, HI EQ GAIN 0.
   - **Arpeggiator** aus, **MOD-Rad** ganz zu, **PITCH-Rad** in der Mitte.
3. Mit **WRITE** auf diesen Platz speichern. Dann geht nichts verloren, wenn du versehentlich umschaltest.
4. **Pegel:** C4 halten und den Eingang so stellen, dass die Spitze bei −12 bis −6 dBFS liegt. Danach nichts mehr am Pegel und an AMP LEVEL ändern. Der Pegel muss für alle Dateien gleich bleiben. Übersteuert eine Welle trotzdem, senke AMP LEVEL einmal für alles und fange neu an.

**D.2b GarageBand einrichten (einmal)**
1. Neues Projekt → **Audio** („Mikrofon oder Line-Eingang“). Eingang: der Kanal mit dem Kabel (Kanal 1), **mono**. Mithören über Kopfhörer an.
2. Je Datei: Aufnahme starten, die Töne nach D.3 spielen, stoppen.
3. Exportieren: Menü **Teilen** (ältere Versionen: **Bereitstellen**) → **Song auf Festplatte exportieren …** → Format **WAVE**, 24 Bit, Name genau wie unten. 44,1 oder 48 kHz sind beide gut.
4. Danach die Aufnahme löschen (oder ein neues Projekt anlegen) und mit der nächsten Datei weitermachen.
5. **Erst eine Testdatei:** `test.wav` mit C4, 2 s gehalten. In der App (ab MK10) prüft **[Testdatei prüfen]** Pegel, Kanal und Stille, bevor du alles aufnimmst.

**D.3 Aufnehmen** (je Datei die sieben C von C1 bis C7, jedes **2 s halten, 1 s Pause**; die App misst die Tonhöhe selbst):
- Zuerst **OCTAVE SHIFT −2** (Tastatur C1–C4): C1, C2, C3, C4 spielen.
- Dann **OCTAVE SHIFT +1** (Tastatur C4–C7, dreimal UP): C5, C6, C7. Die Pause beim Umschalten darf länger sein.

1. `ref-saege.wav`: OSC1 WAVE **Saw**, CONTROL 1 = 0, CONTROL 2 = 0. Das ist der Bezug.
2. `sw-01.wav` … `sw-64.wav`: OSC1 WAVE **DWGS**, CONTROL 2 = Nummer der Welle (1 … 64).
   - **Kürzer (Variante B):** eine Datei je 8 Wellen, `sw-01-08.wav` … `sw-57-64.wav` (8 Dateien). Zwischen zwei Wellen **mindestens 3 s Stille** lassen, in der Reihenfolge der Nummern. Die App teilt an der Stille.
3. `stille.wav`: 10 s, ohne eine Taste zu drücken. Das ist das Grundrauschen.

**D.4 Prüfen, bevor du fertig bist**
- 67 Dateien (`test.wav`, `ref-saege.wav`, 64 Wellen, `stille.wav`) bzw. bei Variante B 11 Dateien, Namen genau wie oben.
- Keine Datei übersteuert (Spitze unter −1 dBFS).
- In jeder Datei sind 7 Töne (Variante B: 8 × 7).

**D.5 Abgeben**
- Vorgabe: Die Dateien bleiben auf deinem iPhone, deinem Mac oder in iCloud. Ab MK10: Menü → Sounds → **Wellen einlesen** → erst [Testdatei prüfen], dann alle Dateien wählen. Die Wellen gelten dann in diesem Browser-Speicher; für die Claude-App bzw. Safari gibt es [Wellen exportieren]/[Wellen importieren].
- Nur wenn du bei H-2 „einbauen“ sagst: Gib die Dateien dem Bau-Lauf direkt. Sie kommen nicht ins Repo.

**D.6 Nur wenn H-6 = ja: Eich-Aufnahmen (+ ≈ 15 min)** mit derselben Einstellung, OSC1 Saw:
- `eich-cutoff.wav`: C3 halten, CUTOFF 0, 16, 32, … 127, je 1 s (RESONANCE 0).
- `eich-attack.wav`: AMP EG ATTACK 32, 64, 96, je ein Ton mit 4 s Pause.
- `eich-release.wav`: RELEASE 32, 64, 96 (SUSTAIN 127), je ein Ton, 1 s halten, 6 s Pause.
- `eich-lfo.wav`: PATCH 1 LFO 1 → Pitch, MOD INT 20, LFO 1 FREQUENCY 32, 64, 96, je 4 s.

**D.7 Für MK9 (Tor b, freiwillig): drei Test-Programme**

Nur nötig, wenn das Formatdokument fehlt (Tor a ist die Vorgabe, H-7). Dafür brauchst du ein **USB-MIDI-Interface** (der microKORG hat nur 5-polige MIDI-Buchsen) und am Rechner ein **Editor- oder Librarian-Programm**, das .syx-Dumps empfängt bzw. .prg speichert. Das Audio-Interface hat kein MIDI, und am iPhone gibt es im Browser kein Web MIDI.
1. Lege drei Programme an, die sich in möglichst vielen Werten unterscheiden (Werte frei wählen).
2. Schreibe je Programm diese Werte auf: alle Regler von VOICE, PITCH, OSC1, OSC2, MIXER, FILTER, FILTER EG, AMP, AMP EG, LFO1, LFO2, PATCH 1–4, MOD FX, DELAY, EQ, ARPEG A, ARPEG B. Bei einem Vocoder-Programm zusätzlich AUDIO IN, FILTER, FC MOD, CH LEVEL und CH PAN.
3. Sende die Programme als Dump (.syx) bzw. speichere sie mit dem Editor (.prg), und gib die Dateien mit dem Werteblatt ab.

---
## Teil E — Reihenfolge, Versionen, Budgets, Größe

### E.1 Pakete (verbindlich; ergänzt N2 Teil E und den „Nachtrag zur Reihenfolge“)

Lage: Die MK-Gruppe beginnt direkt nach G-P2 (V2d′ ✓ 4.6.0, V2e 4.7.0, V2e′ 4.8.0, VS3). VS3 wartet auf das Tor N7V-12, das noch nicht erreicht ist (`fragen-xander-9.md`). Darum beginnt die Gruppe nach V2e′ mit **MK0 (4.8.1)**, und MK1 bekommt **4.9.0**.

| Paket | Titel | Version | KB | h | braucht | Format | Tor | Untergruppe / Zwischenstand |
|---|---|---|---|---|---|---|---|---|
| MK0 | Vorab-Schutz: Klänge neuerer Engines bleiben | 4.8.1 | +4 | 2–3 | V2e′ | 4 | – | G-MK1 |
| MK1 | Klangkern T1, SPIEL/EDIT 1, Leistungs-Probe | 4.9.0 | +100 | 14–16 | MK0, V2e′ (Reihenfolge), V4a (SXF) | **4 → 5** | Rollout `max_format` 5 (Xanders Okay, nach MK0) | G-MK1 · Stand |
| MK2 | Alle Oszillator-Arten, PATCH 1–4 | 4.10.0 | +35 | 6,5–7,5 | MK1 | 5 | – | G-MK1 |
| MK3 | Zwei Timbres, Split, Stimmung | 4.11.0 | +32 | 7–8 | MK2 | 5 | – | G-MK1 |
| MK4 | Mod-FX, Delay, EQ | 4.12.0 | +25 | 5–6 | MK2 (EDIT 2) | 5 | – | G-MK1 · **Stand** |
| MK5 | Step-Arpeggiator | 4.13.0 | +33 | 7,5–8,5 | MK3 | 5 | – | G-MK2 |
| MK6 | Mod-Sequenzer 3×16 | 4.14.0 | +35 | 7,5–8,5 | MK2, MK3 | 5 | – | G-MK2 |
| MK7 | Vocoder 16 Bänder, Eingänge | 4.15.0 | +50 | 10,5–11,5 | MK2, MK3, MK4, VS1 ✓ | 5 | – | G-MK2 · **Stand (Pages)** |
| MK8 | Werksklänge, 8 Genre-Bänke | 4.16.0 | +40 | 8–9 | MK2–MK7 | 5 | – | G-MK2 · **Stand** |
| MK9 | Import .syx/.prg (lokal) | 4.17.0 | +27 | 6–7 | MK7 | 5 | **MK9-T** | G-MK3 |
| MK10 | Speicherwellen aus Aufnahmen | 4.18.0 | +25 (+65) | 6,5–7,5 | MK2 | 5 | **MK10-T**, H-2 | G-MK3 · **Stand** |
| MK11 | RADIAS 1: Filter 2, Verzerrer | 4.19.0 | +25 | 6–7 | MK3, MK6 | 5 | – | G-MK4 |
| MK12 | RADIAS 2: EG3, Formant-Osz. | 4.20.0 | +22 | 5,5–6,5 | MK11, MK7 (Vokal-Quelle) | 5 | – | G-MK4 |
| MK13 | RADIAS 3: 8 Stimmen | 4.21.0 | +10 | 3–4 | MK3, MK7 | 5 | – | G-MK4 · **Stand** |
| **Summe** | 14 Pakete | 4.8.1, 4.9.0–4.21.0 | **+463** | **95–110** | | einmal | | |

- **Rev. 1 gegenüber der ersten Fassung:** +23 KB und +13–14 h (MK0 neu; Protokoll, Priorität, `engXf`, Bruchwerte, MIDI-Rad und Probe in MK1; [T1+2]/Solo in MK3; Intervall-Satz und KEYS in MK5; Mikrofon-Abgriff, Abgriff vor dem Fader und Vokal-Quelle in MK7; Import-Regeln in MK9; Wellen-Leser und eigene Datenbank in MK10; MK12 −0,5 h). Dazu kommen nach H-9 ≈ +5 h und +12 KB in V5d, V6a, V5c, V1d und VC4 (Teil G Nr. 4).
- **Tore** (E.5 Nr. 3 sinngemäß): Ist MK9-T oder MK10-T geschlossen, rücken nur MK9 bzw. MK10. MK11–MK13 laufen weiter. Ein verschobenes Paket bekommt beim späteren Bau die nächste freie Zwischennummer, z. B. 4.21.1, damit die Versionen streng steigen (EN2-14). Die Abnahmen nennen darum keine feste Vorgänger-Nummer (B.6 Nr. 1).
- **Fach-Prüfung:** 14 × 1–2 h zusätzlich (EN2-29).
- **Gesamtdauer** ≈ 109–138 h inkl. Fach-Prüfung.

### E.2 Begründung der Reihenfolge

1. Ab MK1 ist etwas hörbar. MK1–MK4 ergeben den kompletten Klang eines MS2000-Timbres mit Effekten, das ist der erste Stand für Xander.
2. MK3 (Timbres) kommt vor Arp, Seq und Vocoder, weil Arp-Ziel, Seq je Timbre und Vocoder-Modus darauf aufsetzen.
3. MK8 (Werksklänge) steht nach allen Bausteinen, damit kein Werksklang eine „Annäherung“ braucht. Gleiches Prinzip wie V10P (N2 EN2-10).
4. Import und Speicherwellen hängen an Toren (Beleg bzw. Aufnahmen) und stehen deshalb hinter dem Kern. Liegt ein Tor früher offen, darf MK9 bzw. MK10 vorgezogen werden (nach MK7 bzw. MK2). Die Versionsnummer folgt dann der Bau-Reihenfolge.
5. Die RADIAS-Teile kommen zuletzt, wie im Plan Punkt 4 („danach“).
6. MK0 kommt vor MK1, damit beim ersten Format-5-Speichern schon jeder neuere ausgelieferte Stand AM-Sounds unverändert lässt.

### E.3 Größe und Startzeit (EN2-28)

Grundlage: 4.6.0 = 2 473 307 B. Restplan-Budgets aus N2 E.4, Reihenfolge nach N3.0.1 Nr. 6 (VS3 vor MK0), mit den Rev.-1-Budgets und den +12 KB aus H-9. MB = 10⁶ B, KB = 1024 B. Rechnung: `scratchpad/rev1-tools/size2.py`.

**Ist-Faktor:** Die gebauten Pakete V0b…V2d′ hatten zusammen 755 KB Budget; die Datei wuchs um 2 473 307 − 1 316 464 B = 1 130 KB (**×1,5**, ganze Datei mit allen Fix-Schritten). Je Paket laut CHANGES lagen die Überzüge zwischen +23 % und +105 % (V4b +23 %, V4c +69 %, V2d +88 %, VO1 +105 %), über 15 Pakete seit V0a +29 % (**×1,3**). Die Spalte ×1,5 ist die Planungsgrundlage, weil sie die Grenze schützt; ×1,3 ist die untere Schätzung.

| Stand | nach Budget | ×1,3 | ×1,5 |
|---|---|---|---|
| nach V2e′ | ≈ 2,57 MB | ≈ 2,60 MB | ≈ 2,62 MB |
| nach VS3 (vor MK0; ohne VS3 alle MK-Zeilen ≈ −0,04 MB) | ≈ 2,61 MB | ≈ 2,65 MB | ≈ 2,67 MB |
| nach MK4 | ≈ 2,81 MB | ≈ 2,91 MB | ≈ 2,97 MB |
| nach MK8 | ≈ 2,97 MB | ≈ 3,12 MB | ≈ 3,22 MB |
| nach MK13 | ≈ 3,08 MB | ≈ 3,26 MB | ≈ 3,38 MB |
| 4,5 MB erreicht bei | V10P | VK | V6a |
| 5,0 MB erreicht bei | V10e | V9e | V8b |
| **Planende ohne MK** (alle übrigen Pakete aus N2 E.4) | ≈ 4,98 MB | ≈ 5,73 MB | ≈ 6,23 MB |
| **Planende mit MK** | **≈ 5,46 MB** | **≈ 6,36 MB** | **≈ 6,96 MB** |
| dazu MK10 „eingebaut“ (+45 KB) | +0,05 MB | +0,06 MB | +0,07 MB |
| dazu H-3 = 128 (+20 KB) | +0,02 MB | +0,03 MB | +0,03 MB |

- Die MK-Pakete selbst bleiben unter der Grenze (nach MK13 ≈ 3,1–3,4 MB). Die Grenze von 5,0 MB fällt aber **mitten im Plan**, nicht erst am Ende: nach Budget bei V10e, mit Ist-Faktor schon bei V9e (×1,3) bzw. V8b (×1,5). Laut Plan wären nach Gruppe 5 ≈ 2,18 MB erreicht gewesen, tatsächlich sind es heute 2,47 MB.
- **Startzeit:** Projekte ohne AM bleiben bei ≤ +20 ms (EN3-14, MK1-26). Je MK-Paket gilt §15.3 (≤ +150 ms gegen das Vorgänger-Paket, absolut ≤ 1,5 s ohne bzw. ≤ 4 s mit Drosselung ×4).
- **Ab 4,5 MB** nennt jedes Paket Größe und Startzeit (EN2-28); mit ×1,5 ist das ab ≈ V6a. Lösung → **H-1**, Vorgabe (b) = SL1 (E.3a).

### E.3a SL1 — Schlankheits-Paket (Vorgabe zu H-1 (b); kein MK-Paket, gehört in N2 E.4)

- **Auslöser:** wie EN2-28 die gescheiterte Startzeit-Abnahme, zusätzlich spätestens, wenn ein Stand 4,5 MB erreicht (mit ×1,5 ≈ V6a, nach Budget ≈ V10P). Der Orchestrator trägt das in N2 (EN2-28, E.5 Nr. 8) nach.
- **Umfang:** Das Sparziel wird an der dann aktuellen Datei gemessen und in CHANGES festgelegt. Die `text/plain`-Blöcke (Worklet, `sq-mk-src`, Werksdaten) gepackt ausliefern und bei Bedarf entpacken; das Worklet spart so heute ≈ 78 KB. Für ≥ −1 MB braucht es den Haupt-Skriptteil als gzip + Base64 mit kleinem Start-Lader (`DecompressionStream`, dann `eval`).
- **Abnahme:** Verhalten bitgleich (alle Regressionen der gebauten Pakete), Startzeit nach §15.3 am iPhone gemessen (Median aus 5) nicht schlechter als vorher, Dateigröße ≤ Sparziel, keine Konsolenfehler, Worklet-ASCII.
- **Dauer** 5–7 h · **Version** die nächste freie Nummer beim Bau · **Budget** negativ (Sparziel).

### E.4 Versionsnummern der Pakete danach

Die Pakete nach der MK-Gruppe (V2a′, V2f, VL, V7a, VC2a, VS4 …) bekommen ihre Nummern **nach 4.21.0**, also ab 4.22.0, in Bau-Reihenfolge. Die Tabelle N2 E.4 wird dort vom Orchestrator fortgeschrieben, das ist keine Änderung des Umfangs.

**VS3** (Tor N7V-12):
- Wird VS3 nach MK0 und vor MK1 gebaut, bekommt es **4.8.5**. Wird es vor MK0 gebaut, bekommt es 4.8.5 und MK0 die nächste freie Zwischennummer (4.8.6).
- Wird es später gebaut, bekommt es die nächste freie Zwischennummer nach dem zuletzt gebauten Paket.

### E.5 Regeln für den Bau (ergänzt N2 E.5)

1. **Bau-Ort** (wie EN2-17): Dieser Nachtrag, HB-MS und HB-MK (privat, nur lesen), KF, `fragen-xander-9.md`. Für MK9 der Beleg bzw. die Test-Dumps, für MK10 die Aufnahmen. Fehlt etwas, wird das Paket nicht begonnen.
2. **Rollout** (N2 G.8): MK1 `max_format` 5, erst wenn MK0 ausgeliefert ist. Jedes Paket hebt `max_app`. Alles nur mit Xanders ausdrücklichem Okay je Schritt, nie im Klassenzimmer-Projekt, nie am Webseiten-Repo (EN2-32).
3. **Zwischenstände** nach EN3-17 auf die Artifact-Adresse, die Pages-Seite und den githack-Spiegel (EN2-15).
4. **CHANGES** je Paket: Messwerte der Abnahme, Node- und Chromium-CPU (als Vielfaches der VA-Stimme, dazu absolut), Größe, Startzeit (ab 4,5 MB Pflicht), Fach-Prüfung, iPhone-Punkte, Geräte-Abgleich (wenn schon da), Lücken, der Vorgänger-Stand (Version) für alle „bitgleich“-Abnahmen. Liegt ein MK-Paket > 50 % über seinem Budget, nennt CHANGES das mit einem Schlankheits-Vorschlag (N2 §15.3-Regel).
5. **Werksnamen privat:** Die Werksnamen-Listen (EN3-07) liegen nur in `scratchpad/manuals/werksnamen.local.json`. `wip-push.sh` und die Auslieferung kopieren sie nie. Eine Prüfung sucht 3 Werksnamen als Stichprobe in `bau/tests/` und im Repo (0 Treffer). Ob diese Spec selbst (mit Tabellen aus den Handbüchern) im öffentlichen Repo liegen darf, entscheidet **H-12**; sie liegt schon in `origin/arbeitsstand` (Commit e8e8fa1). Bis zur Antwort wird sie nicht neu ins öffentliche Repo kopiert.

---

## Teil F — Fach-Prüfung (ergänzt N2 Teil J, J.3; ● = blockierend)

| Gruppe | Paket | Haupt-Blick | Zweit-Blick |
|---|---|---|---|
| G-MK1 | MK0 ● | FP-SICHER | FP-DSP |
| G-MK1 | MK1 ● | FP-DSP | FP-TOUCH, FP-IPHONE |
| G-MK1 | MK2 | FP-DSP | FP-KLANG |
| G-MK1 | MK3 ● | FP-DSP | FP-TOUCH |
| G-MK1 | MK4 | FP-DSP | FP-IPHONE |
| G-MK2 | MK5 ● | FP-SONG | FP-TOUCH |
| G-MK2 | MK6 | FP-DSP | FP-SONG |
| G-MK2 | MK7 ● | FP-DSP | FP-IPHONE, FP-SICHER |
| G-MK2 | MK8 ● | FP-KLANG | FP-TOUCH |
| G-MK3 | MK9 ● | FP-SICHER | FP-DSP |
| G-MK3 | MK10 | FP-DSP | FP-SICHER |
| G-MK4 | MK11 | FP-DSP | FP-IPHONE |
| G-MK4 | MK12 | FP-DSP | FP-KLANG |
| G-MK4 | MK13 ● | FP-IPHONE | FP-DSP |

Zusätzlich prüft **FP-DSP in jedem MK-Paket**:
- die W-Tabelle gegen den Code (eine Quelle, keine Schatten-Kurven);
- „Aus = bitgleich“ gegen den Vorgänger-Stand (B.6 Nr. 1);
- NaN/Inf bei Extremwerten (alle Regler auf Anschlag, Resonanz 127, Rückkopplung 127, 20 s);
- **Filter-Stabilität** (B.6 Nr. 10): W-29 mit C1 127 / C2 127 bei C8 und der Vocoder mit FC-MOD von einem 50-Hz-LFO voller Tiefe, je 20 s mit −6-dBFS-Rauschen: kein NaN/Inf, Spitze ≤ +6 dBFS;
- **Denormale** (B.6 Nr. 11): 60 s Stille nach Vollaussteuerung durch jeden neuen Filterweg; jedes 1-s-Lastfenster ≤ 1,1 × der ersten stillen Sekunde (Node, x86);
- gefaltete Energie nur nach B.6 Nr. 12;
- Worklet-ASCII.

**FP-SICHER** prüft in MK0, MK1, MK7, MK9 und MK10 das Markenwort-Verbot (B.6 Nr. 9 a und b) und die Upload-Wege, ab MK9 auch EN3-08a und MK-R2.

---

## Teil G — Hinweise und Pflichten für andere Pakete (wo sich Umfang oder Abnahme ändert, steht es beim Punkt)

1. **VK** (N1 A.10), Punkte 5–6 (Osz.-FM, Ringmod): dürfen den AM-Code (PM-Pfad aus MK2, Ringmodulator aus MK1) mitbenutzen, statt neu zu bauen. Die Abnahmen VK-06, VK-07 bleiben.
2. **VK2** (N2 D.6.4), Punkte 1–2 (Phaser, Flanger als Spur-Effekt): dürfen die Formeln (W-31) und die Prüfskripte aus MK4 mitnutzen. Der Effektkern von MK4 sitzt aber im AM-Zweig des Worklets. VK2 braucht einen eigenen nativen oder Spur-Worklet-Einschub (`fx.phaser`, `fx.flanger`, `fx.crush`), der auch für Drums und ohne AudioWorklet geht (FX-Block „native Web Audio nodes only“, Z. 9423; `buildChain` Z. 12013). Die Abnahme bleibt.
3. **VI2a** („Arp mit ZUFALL“): Der Arp-Kern aus MK5 ist engine-frei gebaut. VI2a entscheidet, ob es ihn für andere Engines nutzt.
4. **MOD-R1/PAD-R1: V5d, V5b/c, V6a, V1d, VC4** (Vorgabe H-9 = ja, EN3-18). **Umfang und Abnahme ändern sich:** V5d-01 deckt auch die `mk`-Pfade beider Timbres mit neuen DST-Nummern ab (heute fest bis `NDST` 22, Z. 3560–3561); V5b/c nehmen die AM-Pfade in Stränge und LOCK auf; V6a interpoliert Ganzzahl-Pfade und schaltet Listen am Ende des Bereichs (Nr. 5); V1d-02 nimmt AM als Pad-Quelle auf; VC4-02 nimmt das AM-Schema auf (Eingabe „Pfade aus MODT“). Mehrbedarf in N2 E.4 (Schätzung): V5d +2 h/+6 KB, V6a +1 h/+2 KB, V5b/c +0,5 h/+1 KB, V1d +1 h/+2 KB, VC4 +0,5 h/+1 KB, zusammen ≈ +5 h und +12 KB. Sagt Xander nein, bleibt AM eine benannte Ausnahme zu MOD-R1/PAD-R1 (I4) und moduliert nur über PATCH und SEQ; dann entfällt der Mehrbedarf.
5. **V6a** (Klangzustände/Morph, nur bei H-9 = ja): AM-Werte werden als Ganzzahlen interpoliert. Listen und Schalter wechseln am Ende des Bereichs (KZ3).
6. **V7a** (Mix): Der Eingangs-Abgriff der AM-Spuren (vor Vol/Pan, MK7) behält nach dem Umzug des Faders in `track.mix` seine Bedeutung; „Quelle nur als Eingang“ trennt weiter `post` von Master und Sends.
7. **VS3, VS4**: Version nach E.4. Der Vocoder (MK7) speichert keine Takes. VS3 und VS4 nutzen den gemeinsamen Mikrofon-Abgriff aus MK7; ist VS3 vorher gebaut, stellt MK7 es darauf um (MK7-14). Mit VS3 kann der Modulator später ein Take sein, das ist nicht im Plan.
8. **N2 E.4**: MK0 = 4.8.1; die Versionen nach MK13 ab 4.22.0 (E.4 oben). Die Größen-Prognose ändert sich nach E.3 → H-1; SL1 (E.3a) kommt als Paket dazu.
9. **Tabellen-Bau (Spec §10.1; V8a, V4e, V9a):** Der gemeinsame, DOM-freie Tabellen-Bau `mkTables` aus MK2 (Häppchen ≤ 8 ms, MKW-Tabelle im `AudioWorkletGlobalScope`, Kopie je Knoten als Rückfall) ist der Bau nach §10.1. V8a, V4e (statt „aus dem Tabellen-Bau von V8a“, N2 K2-40) und V9a nutzen ihn. Der Tabellenspeicher wird zusammen geprüft: MK2-08 ≤ 16 MB plus der V8a-Pool ≈ 8 MB. `eng 2` bleibt die Tabellen-Engine von V8a; AM ist `eng 3`.
10. **MK-R2 (EN3-19): VO3, VO4a–c, VC2b, VC2c, VC3, VC3b, VC4** (auch `sample` und `room.sendToClaudeSession`): rufen in jedem Weg vom Gerät weg `mkLocalStrip` auf. **Neue Abnahme-Zeile je Paket** (FP-SICHER): Ein 🔒-Sound mit Marker-Werten ergibt 0 Treffer im Mitschnitt aller Requests und Frames.
11. **Vocoder und Formant (Spec §18, N2 EN2-26, D.9):** MK7 liefert den Vocoder der VI-Stufe E; §18 behält nur „Vocoder für andere Engines“. Der Formant VOKAL aus §18 und der FM-FORMANT-Operator nutzen W-44 (Vokal-Quelle aus MK7, Oszillator aus MK12).
12. **V9d** (Resynthese, Quellen DATEI, Original lokal): nutzt den WAV/AIFF-Leser und den lokalen Speicher (eigene IndexedDB-Datenbank) aus MK10, statt sie neu zu bauen.
13. **VI1a** (Instrument-Vorlagen, Front-Rahmen): baut auf dem Sektionsraster und `k6` aus MK1 auf, keine zweite Rasterform.
14. **V8a, V9a, V9b, V9d′** (Engines `mask`, `add`, `body`, `resyn`): brauchen keinen Formatsprung; MK0 hält unbekannte Engines undurchsichtig (EN3-04).
15. **V10P, V10d, VI3** (Geräte im ⓘ nach N2 D.1 Nr. 4): Die Markenwort-Prüfung B.6 Nr. 9 (a) gilt nur im AM-Teil, (b) über die ganze Datei nur für microKORG, MS2000, RADIAS, DWGS. Diese Pakete scheitern daran nicht.

---

## Quellen

**Gelesen für diesen Nachtrag (25.10.2026):**
- HB-MS, `scratchpad/manuals/ms2000.txt`:
  - S. 2–4 (Aufbau), S. 16–17 und S. 25–26 (Mod Sequence, Motion Rec, externer Eingang, Vocoder)
  - S. 34–52 (alle Programm-Parameter einschließlich Vocoder und Utility), S. 53–57 (Global)
  - S. 60–66 (NRPN-, CC- und Werte-Tabellen: Gate, Step Length, Sync Note, Resolution, DWGS-Control-2, OSC2 Semitone), S. 68–70 (Programmliste, nur für die Namensprüfung)
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

**Eigene Rechnungen:** Größen-Prognose E.3 (Python über die Budgets aus N2 E.4 und die Dateigröße 4.6.0; Rev. 1 neu mit Reihenfolge N3.0.1 Nr. 6 und den Faktoren ×1,3/×1,5, `scratchpad/rev1-tools/size2.py`). Seitenzuordnung der Handbuch-Texte (Seitenumbrüche im Text gezählt, gedruckte Seite = PDF − 6; Hilfsdateien danach gelöscht).

**Nicht möglich:** RADIAS-Handbuch (Xander: nicht nötig). Korg „MIDI Implementation“ (nicht im Handbuch; Tor MK9-T). Kein Klang angehört, nichts am iPhone gemessen, kein Web-Abruf. Im Supabase-Projekt und auf GitHub wurde nichts gelesen oder geändert.

---

## Teil H — Offene Fragen an Xander (nur echte Entscheidungen; die Vorgabe gilt, bis du antwortest)

- **H-1 Größe.** Die gebauten Pakete waren im Mittel 1,5-mal so groß wie geplant. Rechnet man so weiter, wird die App mit dem microKORG-Teil am Ende ≈ 7,0 MB groß (nach Plan ≈ 5,5 MB, untere Schätzung ≈ 6,4 MB; E.3). Die Grenze von 5,0 MB kommt dann nicht erst am Ende, sondern **mitten im Plan**, etwa bei V8b; 4,5 MB schon etwa bei V6a. Die MK-Pakete selbst bringen ≈ +0,46 MB (mit Faktor ≈ +0,7 MB). Zwei Wege:
  - (a) Die Grenze heben, dann auf mindestens 7,1 MB (bei der unteren Schätzung 6,5 MB). Die Startzeit bleibt der Wächter.
  - (b) Das Schlankheits-Paket **SL1** einschieben (E.3a, 5–7 h), sobald die Startzeit-Prüfung scheitert, spätestens bei 4,5 MB (etwa bei V6a). Es liefert selten Gebrauchtes gepackt und entpackt es erst bei Bedarf; für mehr als 1 MB Ersparnis wird auch der Haupt-Code gepackt.

  *Vorgabe: (b).*
- **H-2 Deine Wellen-Aufnahmen.** Sollen die daraus gerechneten Wellen nur auf deinem Gerät bleiben, oder in die App eingebaut werden, sodass alle (auch Freunde im Paar-Raum) sie hören? Eingebaut wären es Korg-Daten in einer öffentlichen App, die Lizenz ist ungeklärt (wie bei den DX7-Werksklängen, EN2-11). *Vorgabe: nur auf deinem Gerät.*
- **H-3 Wie viele Werksklänge?**
  - 64 (8 je Genre auf Seite A; Seite B = deine eigenen Sounds), oder
  - 128 wie am microKORG (16 je Genre). Das kostet +8–9 h und +20 KB.

  *Vorgabe: 64.*
- **H-4 Name und Platz der neuen Klangerzeugung.**
  - **Name** in der Leiste VA │ FM │ WT │ ?. Er darf nicht nach Korg klingen. „AM“ wäre missverständlich: AM heißt sonst Amplitudenmodulation, die App zeigt schon „LFO AM“ beim DX-Import (Z. 7674), und die Engine hat selbst eine Ringmodulation. Vorschläge: „DUO“ (zwei Timbres), „XA“, „ANA“; „AM“ bleibt eine der Möglichkeiten. *Vorgabe: „DUO“.* Oder dein Wunsch.
  - **Platz:** Im schmalen Hochformat (P2/P3) passt ein 4. Knopf nicht mehr neben den Spurnamen (die Knöpfe sind dort schon 28–34 px schmal). Vorschlag: dort ein Engine-Chip „VA ▾“ mit Auswahl-Liste statt der Knöpfe; P1 und Querformat behalten die Knöpfe, wo sie passen. Das ändert auch VA/FM/WT sichtbar. *Vorgabe: Chip nur dort, wo die Knöpfe nicht passen.*
- **H-5 Bend- und Mod-Rad.** Die App hat keine Räder. Möglichkeiten:
  - (a) zwei schmale Rad-Streifen neben der Tastatur (sichtbare Änderung am Spielfeld),
  - (b) der Regler MOD-RAD im Feld; BEND wirkt ohne Rad nicht,
  - (c) zusätzlich zu (b): Bend und Mod-Rad über den vorhandenen MIDI-Eingang, zum Beispiel von deinem microKORG (+0,5 h). Das geht in Chrome am Rechner und auf Android, nicht in Safari auf dem iPhone (dort gibt es kein Web MIDI). Nichts davon wird gespeichert.

  *Vorgabe: (b) + (c).*
- **H-6 Eich-Aufnahmen (freiwillig).** Bei der Wellen-Aufnahme 15 min zusätzlich Filter-, Hüllkurven- und LFO-Töne aufnehmen (Teil D.6)? Dann richten sich diese Kurven nach deinem Gerät statt nach eigenen Annahmen (+2 h Bau). *Vorgabe: nein, Abgleich nach Gehör.*
- **H-7 Import (für MK9).** Für den Bau brauchen wir Korgs Formatbeschreibung („MIDI Implementation“, öffentliches PDF von korg.com) oder drei Test-Programme von dir mit aufgeschriebenen Werten (Teil D.7). *Vorgabe: Der Orchestrator holt die Formatbeschreibung und hält sie privat wie die Handbücher.* Zum Benutzen des Imports brauchst du in jedem Fall .syx- oder .prg-Dateien. Dafür braucht es ein USB-MIDI-Interface und ein Editor- oder Librarian-Programm am Rechner (der microKORG hat nur 5-polige MIDI-Buchsen; das iPhone kann im Browser kein MIDI). Hast du das, oder schon solche Dateien?
- **H-8 Aufnehmen mit Arpeggiator.**
  - ● nimmt die **gedrückten Tasten** auf, und der Arp spielt beim Abspielen neu. Dann lassen sich Arp-Einstellungen später ändern.
  - Oder ● nimmt die **Arp-Noten** fest auf, als einzeln bearbeitbare Noten.

  Der MIDI-Mitschnitt enthält in jedem Fall, was klang, also auch die Arp-Noten (MK5 Umfang 7). *Vorgabe: gedrückte Tasten.*
- **H-9 microKORG-Regler im App-Mod-System.** Später (V5d, V1d) kann man in der App jeden Regler modulieren und jede Engine als Drum-Stimme nutzen (dein Wunsch „jeder Regler modulierbar“). Sollen die ≈ 120 Regler der neuen Klangerzeugung dazugehören? Ja kostet ≈ +5 h und +12 KB in V5d, V6a, V5c, V1d und VC4. Nein: Sie moduliert nur über ihre eigenen PATCH- und SEQ-Wege. *Vorgabe: ja.*
- **H-10 Spur als Vocoder-Quelle, ohne sie zu hören.** Steuert eine Spur (zum Beispiel ein Drum-Loop) den Vocoder, hört man sie sonst auch direkt. Vorschlag: im Eingangs-Menü ein neuer Schalter „Quelle nur als Eingang“ (sichtbar neu). Ohne Schalter geht es auch, indem du den Fader der Quelle auf 0 ziehst, weil der Abgriff vor dem Fader liegt. *Vorgabe: mit Schalter.*
- **H-11 Beide Timbres zugleich bearbeiten, Solo.** Am microKORG bearbeitest du beide Timbres zugleich (TIMBRE SELECT halten) und hörst eins allein (Solo, HB-MK S. 14). Vorschlag: zwei neue Knöpfe in der SPIEL-Schalterzeile, [T1+2] und [◐ SOLO] (sichtbar neu, +1 h). Beides wird nicht gespeichert. *Vorgabe: ja.* Bei Nein fallen beide weg (dann in A.10).
- **H-12 Diese Spec im öffentlichen Repo?** Die Spec enthält Fakten aus den Handbüchern (Parameterlisten, Wertebereiche, Seitenangaben, keine Textpassagen) und liegt schon im öffentlichen Repo (Zweig `arbeitsstand`). Soll sie dort bleiben oder künftig nur privat liegen? *Vorgabe: künftig nur privat; die vorhandene Kopie entfernt der Orchestrator nur mit deinem Okay.*

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
