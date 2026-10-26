# SYNQUENZER v3 — Nachtrag 3 zur Bau-Spezifikation: MS2000-Klangerzeuger (Pakete MK1–MK13)

Stand 25.10.2026, **Rev. 2** nach Xanders Entscheidungen vom 25.10. (Rev. 1 = Review; beide Protokolle am Ende) · **26.10.2026: Paket MK-P (Bedienfeld wie der MS2000) ergänzt; es ersetzt B.3; danach unabhängig gegen die Zeichnung geprüft (Prot. 60–68)** · Status: **Entwurf zur Freigabe.** Er gilt für den Bau, sobald der Orchestrator ihn Xander gezeigt hat. Xanders Entscheidungen zu H-1 … H-11 stehen in Teil H und sind verbindlich; für die neuen Fragen H-13 … H-16 gilt bis zu seiner Antwort die genannte **Vorgabe**. Builder und Tester lesen Spec v3, Nachtrag 1, Nachtrag 2 **und** diesen Nachtrag. **Vorrang für die MK-Pakete: Nachtrag 3 vor Nachtrag 2 vor Nachtrag 1 vor Spec v3.** Alles, was hier nicht geändert wird, bleibt gültig: L1–L10, M-Messverfahren und DoD der Spec, Teil J (Fach-Prüfung), EN2-28 (Größe), E.5 (Bau-Regeln).

## Überblick (für den Orchestrator)

- **13 Pakete im Plan** (MK0–MK8, MK10–MK13), zusammen **≈ 100–116 h** reine Bauzeit; **MK9 (Import) ist zurückgestellt** (Xander, 25.10.: kein Rechner, kein MIDI, keine .syx/.prg-Dateien) und steht außerhalb der Versionsfolge. Dazu kommt die Fach-Prüfung mit 1–2 h je Paket. Die Datei wächst nach Budget um **≈ +517 KB** (dazu ≈ +12 KB in V5d, V6a, V5c, V1d und VC4, H-9); mit dem gemessenen Überzug der gebauten Pakete (×1,5, E.3) um ≈ +0,8 MB. App-Version **4.8.1 (MK0), dann 4.9.0 → 4.20.0**; der Einbau der Speicherwellen (MK10, Bau-Abschnitt 2) bekommt die nächste freie Zwischennummer. Das **Speicherformat** steigt nur einmal, mit MK1 (4 → 5). **MK0** sorgt vorher dafür, dass kein ausgelieferter Stand Klänge einer neueren Engine verwirft oder überschreibt (EN3-04).
- **Name und Aussehen (Xander, 25.10.):** Die neue Klangerzeugung heißt in der App **„MS 2000“** (Knopf neben VA │ FM │ WT; H-4). Ihr Bedienfeld sieht aus wie die **Vorderseite des Originals**, „genau so“: gleiche Anordnung, Drehschalter-Logik EDIT-WAHL 1/2, 5 Regler, Wert-Anzeige, BEND- und MOD-Rad links der Tasten, Oktav- und Arp-Tasten, dunkles Bedienfeld mit Holzwangen, aber ohne Korg-Name, Logo oder Korg-Schrift (EN3-20, B.3). **Ersetzt am 26.10. durch MK-P:** Vorlage ist jetzt die Vorderseite des **MS2000** (HB-MS S. 5): hell blau-silbernes Metall, jeder Wert mit eigenem Regler bzw. eigener Taste wie am Gerät, am iPhone Übersicht, Zoom-Ansicht und Spiel-Ansicht.
- **MK-P (Xander, 26.10.):** Das Bedienfeld wird nach der Zeichnung des MS2000 neu gebaut (Lage-Tabelle aus HB-MS S. 5 vermessen). Es ist ein reines Oberflächen-Paket: Klang, Daten und Format bleiben gleich. Dauer 19–22,5 h, +25 KB, Version 4.21.0, bei früherer Auslieferung die nächste freie Zwischennummer (z. B. 4.15.1; E.1 „Tore“). Es kommt nach dem Zusammenführen von MK5–MK7 (4.15.0) und darf parallel zu MK8 und MK10–MK13 laufen. Mit MK-P sind es 14 Pakete, ≈ 119–138,5 h und ≈ +542 KB; die Pakete nach der MK-Gruppe beginnen in jedem Fall bei 4.22.0.
- **Nur iPhone (Xander, 25.10.):** Kein Paket verlangt einen Rechner, MIDI oder eine Datei vom Rechner (EN3-21). Xander arbeitet nur am iPhone 12 Pro Max.
- **Kern (MS2000 komplett):** MK1–MK7 bauen die Klangerzeugung, die Effekte, den Arpeggiator, den Mod-Sequenzer und den Vocoder. MK8 bringt eigene Werksklänge in 8 Genre-Bänken.
- **MK10** bringt die Speicherwellen aus Xanders Aufnahmen: Er nimmt **in der App** auf (microKORG → AG06 → iPhone, Teil D), die App rechnet die Wellen aus, und der Bau **baut sie in die App ein** (H-2 = eingebaut), sodass alle sie hören. Tor nur für den Einbau: das Wellen-Paket aus der App.
- **MK11–MK13** bringen die RADIAS-Teile ohne Samples: zweites Filter, Verzerrer, dritte Hüllkurve, Formant-Oszillator, mehr Stimmen.
- **Größe (wichtig, H-1):** Nach Budget endet der Restplan ohne MK bei ≈ 4,98 MB, mit MK bei ≈ 5,52 MB. Die gebauten Pakete lagen aber im Mittel bei ×1,5 ihres Budgets (E.3). Mit diesem Faktor endet der Plan bei ≈ 7,0 MB, und die Grenze von 5,0 MB (EN2-28) fällt **mitten im Plan**: 4,5 MB bei ≈ V5d, 5,0 MB bei ≈ V8a. Die MK-Pakete selbst passen (nach MK13 ≈ 3,1–3,5 MB). Lösung nach H-1 (b): das Schlankheits-Paket SL1 (E.3a).
- **Was wiederverwendet wird:** der Stimmenpool von AnalogCore mit Ereignisprotokoll, Tempo, 30-ms-Stimmenblende, 40-ms-Engine-Blende und Lastbericht. Dazu Ladder-Filter mit 4 der 6 Abgriffe, polyBLEP-Säge/-Puls/-Sync, Hüllkurven-Kern, LFO-Formen und Mod-Matrix. Außerdem das Mipmap-Verfahren aus V4a (für AM als gemeinsamer, DOM-freier Tabellen-Bau nach Spec §10.1 neu gebaut, MK2), `MIC_ASK` und die Wege-Erkennung aus VS1 (mit einem gemeinsamen Mikrofon-Abgriff, MK7; auch für die Aufnahme-Seite in MK10), die Oktav-Wahl der Tastatur (`tr.kbOct`), der MIDI-Eingang (nur als freiwillige Zugabe am Desktop), sowie Bibliothek, Undo, Blatt-Rahmen und Regler-Gesten. Neu ist alles, was A.12 nennt (Teil A).

---

## N3.0 Grundlagen

### N3.0.1 Xanders Plan (24.10.2026, verbindlich, Kurzfassung des Auftrags)

1. **Kern = kompletter MS2000-Klangerzeuger.** Dazu gehört die microKORG-Engine: 2 Oszillatoren mit allen Wellenformen und Modi inkl. Ring/Sync, Rauschen, Mixer, Filter mit allen Typen, 2 Hüllkurven, 2 LFOs, 4 virtuelle Patches, Timbres/Layer/Split, Stimmen-Modi, Mod-FX, Delay, EQ. Dazu kommen Mod-Sequenzer 3×16, 16-Band-Vocoder und Step-Arpeggiator.
2. **Oberfläche wiedererkennbar wie microKORG:** Bedien-Logik, Regler-Gruppen, Preset-Bänke nach Genres. **Kein Korg-Name, kein Logo, keine Werksdaten von Korg im Werk.** Die Presets sind eigene Klänge nach Kategorien. Eigene .prg/.syx-Dateien werden nur lokal im Browser importiert: nie hochladen, nie mitliefern (MK9, **zurückgestellt** am 25.10., EN3-21). **Präzisiert am 25.10. (Xander):** Das Bedienfeld sieht aus wie die Vorderseite des Originals, „genau so“ (EN3-20, B.3); die Engine heißt sichtbar „MS 2000“ (H-4); die aus seinen eigenen Aufnahmen gerechneten Speicherwellen dürfen eingebaut werden (H-2, Ausnahme von „keine Werksdaten“, nur für diese Wellen).
3. **DWGS-Wellen kommen später aus Xanders eigenen microKORG-Aufnahmen** (Filter offen, OSC2 aus, Effekte aus, mehrere Oktaven). Das ist ein eigenes, späteres Paket mit Aufnahme-Anleitung. Bis dahin gibt es additiv nachgebildete Platzhalter, klar als Platzhalter markiert. **25.10.:** Aufgenommen wird am iPhone direkt in der App (Teil D); die Wellen werden danach eingebaut (H-2).
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
- **Nicht möglich:** Es gibt kein RADIAS-Handbuch (Xander: „nicht nötig“, `fragen-xander-9.md`). Es gibt keinen Korg-Formatbeleg für SysEx-Programmdaten: HB-MS S. 64 verweist auf eine eigene „MIDI Implementation“, die nicht im Handbuch steht. Daraus folgt das Tor für MK9 (zurückgestellt). Kein Klang wurde angehört, nichts wurde am iPhone gemessen. Es gibt kein Foto der Vorderseite: Die Referenz-Skizze in B.3 ist eine eigene Zeichnung. Die Anordnung der Gruppen folgt der Strichzeichnung in HB-MK S. 2–3 (PDF 8–9), die Belegung HB-MK S. 8–14 und der Parameter-Liste (PDF 78); Maße und genaue Lage gleicht Xander an seinem Gerät ab. **Nachtrag 26.10.:** HB-MS S. 5 (PDF 11) enthält die Strichzeichnung der MS2000-Vorderseite, S. 6–9 erklären die Elemente; sie ist die Vorlage von MK-P, das B.3 ersetzt.

### N3.0.3 Neue Entscheidungen

| # | Entscheidung | Begründung |
|---|---|---|
| **EN3-01** | **Geltung.** Dieser Nachtrag regelt die Pakete MK1–MK13 und ihre Reihenfolge. Bei Widerspruch gilt er vor N2, N1 und Spec. Die bestehenden Pakete werden nur in Teil G berührt, und zwar nur als Hinweis oder als Versionsnummer. | Auftrag „Bau-Spezifikation MS2000“. |
| **EN3-02** | **Eigene Engine `mk` als Zweig `eng 3` in AnalogCore**, nicht als Erweiterung der VA-Engine. `eng 2` ist schon für die Tabellen-Engine von V8a vergeben (Spec §10.1, V8a); AM nimmt deshalb die nächste freie Nummer. Der Stimmenpool (`POOL` 12), das Ereignisprotokoll, das Tempo, die Stimmenblende (SXF, V4a), die Engine-Blende (`engXf`), die Last-Berichte und der Ladder werden mitbenutzt. Die VA-Klänge bleiben bitgleich. | Die MS2000-Logik weicht von VA ab: zwei Timbres, Wellen-Algorithmen mit CONTROL 1/2, Ganzzahl-Einheiten, Unison als Stimmenstapel. Ein Umbau von VA würde gespeicherte Klänge gefährden (I-10, L7). |
| **EN3-03** | **Daten in Geräte-Einheiten.** `p.mk` speichert Ganzzahlen genau in den Bereichen der Handbücher (000…127, ±63, Listen-Indizes). Die Umrechnung in Hz, s und ct macht nur die W-Tabelle (B.2). **Während einer Geste** geht der ungerundete Reglerwert (Bruchteil einer Geräte-Einheit) an das Worklet; gerundet wird erst beim Abschluss der Geste und für Undo (B.6 Nr. 2). | Import 1:1 (MK9), prüfbare Bereiche, ein Ort für Kurven-Abgleich. Ganzzahlen allein gäben beim Drehen Stufen von ≈ 0,94 HT (Cutoff), die bei hoher Resonanz als Tonleiter hörbar sind. |
| **EN3-04** | **Speicherformat 5 mit MK1, Vorab-Schutz mit MK0.** `PROJECT_FORMAT` 4 → 5 und `SOUNDS_FORMAT` 1 → 2 kommen mit MK1. Heute verwirft `normalizeSound` (Z. 7918, `if (!engine) return null`) eine unbekannte Engine. Ein 4.x-Stand (Paar-Raum-Partner, alter `sw.js`-Cache, Rückfall) ersetzt AM-Sounds deshalb stillschweigend und speichert danach per Autosave Format 4 über das Projekt, lokal und online. Die Meldung „Projekt aus einer neueren Version“ (Z. 8163) kommt nur beim Datei-Import von Hand. **MK0** (4.8.1, vor MK1) behebt das: Ein Sound mit unbekannter Engine bleibt **undurchsichtig erhalten** (`engine`, `p`, `mods`, `fx` unverändert), die Spur spielt INIT mit Hinweis „Klang aus neuerer Version“. Enthält das KV-Projekt, die Bibliothek oder die Cloud-Bibliothek eine unbekannte Engine oder ein Format über `PROJECT_FORMAT`, überschreibt Autosave die KV-Kopie nicht, und die App schickt kein `cloudLibPush` einer Liste ohne diese Sounds. Damit brauchen auch die später geplanten Engines (`mask`, `add`, `body`, `resyn`; V8a, V9a, V9b, V9d′) **keinen weiteren Formatsprung**. Neue Schlüssel sind neutral (I-10). `save_project` bleibt unverändert (VO-R1 lehnt ein kleineres `p_format` schon ab: `outdated` + `keep_conflict`); `save_library` hat keinen solchen Wächter und ist durch MK0 geschützt. Online braucht es `max_format` 5 und `max_app` je Version, jeweils nur mit Xanders Okay (N2 G.8), und erst nach MK0. | Daten-Sicherheit (L7) und Versions-Wächter VO-R1. Der Server-Wächter `max_app` ist nur eine Obergrenze (`greatest(max_app, 4005002)`) und hält ältere Stände nicht auf. Restrisiko: Stände vor 4.8.1 verwerfen weiter; darum der Rollout erst nach MK0 (E.5 Nr. 2). |
| **EN3-05** | **Keine Marken im AM-Teil, eine erlaubte Beschriftung.** Die Engine heißt sichtbar **„MS 2000“** (H-4, Xander 25.10.; Ersatz wäre „MS 2K“ gewesen). Genau diese Zeichenfolge (Großbuchstaben, ein normales Leerzeichen) steht **einmal** als Konstante `MK_LABEL = 'MS 2000'` im immer geladenen Teil (EN3-14); Engine-Knopf, `ENGINE_LABEL.mk`, Bibliotheks-Filter, LCD- und Hilfe-Zeilen setzen sie daraus zusammen. Sonst enthält der AM-Teil der ausgelieferten Datei (Block `sq-mk-src`, Block `sq-mkrec-src` aus MK10, AM-Zweig des Worklets zwischen festen Marken, AM-Hilfe- und LCD-Zeilen, AM-Werksnamen) keines dieser Wörter: Korg, microKORG, MS2000, MS-2000 und jede andere Schreibung von „MS 2000“, RADIAS, DWGS, DW-6000, DW-8000, VOX. Das gilt auch für Kommentare. In der **ganzen** Datei gilt das für die Gerätenamen dieses Plans (microKORG, RADIAS, DWGS; „MS 2000“ nur als die eine Konstante). **Kein Logo, keine Korg-Schrift** (B.3, B.6 Nr. 9 c). Andere Pakete dürfen nach ihren eigenen Regeln Geräte im ⓘ nennen (N2 D.1 Nr. 4; V10P, V10d, VI3). Dieser Nachtrag nennt die Engine im Fließtext weiter **AM** (Arbeitsname, intern bleibt die Kennung `mk`); überall, wo ein sichtbarer Text, eine Beschriftung oder ein Prüf-Erwartungswert den Namen zeigt, steht **„MS 2000“**. Wellen, Sektionen und Funktionen tragen eigene deutsche Namen, zum Beispiel „Speicherwelle“, „Stimmwelle“, „Formant halten“ und „Bewegung aufnehmen“. Genre-Namen der Bänke sind allgemeine Stilwörter. | Xanders Plan Punkt 2 und seine Wahl vom 25.10. Ihm wurde gesagt, dass MS2000 ein Modellname von Korg ist; ein Risiko entstünde erst, wenn die App verkauft würde. Die App enthält heute 0 Treffer (geprüft). Eine Sperre aller Wörter über die ganze Datei würde spätere Pakete mit Geräte-ⓘ scheitern lassen. Eine einzige Fundstelle macht die Ausnahme prüfbar. |
| **EN3-06** | **Handbuch-Fakten nur in der Spec, nicht in der App.** Hilfe-Zeilen (L10) und ⓘ-Texte sind eigene Sätze. | Urheberrecht. |
| **EN3-07** | **Werksklänge = eigene Rezepte.** Eine Namensprüfung läuft gegen die Werks-Programmlisten (HB-MK PDF 77, HB-MS S. 68–70). Diese Listen stehen nur in einer privaten Datei neben den Handbüchern (`scratchpad/manuals/werksnamen.local.json`), nie im Testskript, im Repo oder in der App (E.5 Nr. 5). | Plan Punkt 2. Die Testskripte werden ins öffentliche Repo kopiert (`wip-push.sh` → `bau/tests/`). |
| **EN3-08** | **Import nur lokal** (gilt ab dem Bau von MK9; MK9 ist am 25.10. zurückgestellt, bis dahin gibt es keine 🔒-Sounds und keine Pflicht aus EN3-08/08a/19). Importierte Klänge tragen 🔒 (`loc: 1`); `normalizeSound` behält `loc` und `locRef` (MK9). Eine einzige Funktion `mkLocalStrip()` ist die **einzige Ausgangs-Schleuse**: Sie ersetzt 🔒-Sounds durch einen Platzhalter in **allen** Wegen, auf denen Daten den Speicher-Ursprung verlassen. Das sind Server-Autosave, `save_library`, Paar-Raum/Realtime, Mitmach-Link, Teilen und später VO3, VO4a–c, VC2b/VC2c, VC3/VC3b und VC4 (auch `sample` und `room.sendToClaudeSession`), Regel MK-R2 (EN3-19). Ausgenommen ist nur die eigene Übergabe Claude-App → Safari (`#import` aus `cloudHandoffUrl`), weil das Fragment nie einen Server erreicht (MK9 Umfang 5). Die Tests verwenden nur synthetische Dumps aus einem eigenen Schreiber. | Plan Punkt 2: „nie hochladen, nie mitliefern“. |
| **EN3-08a** | **🔒 steckt an.** Jede Sound- oder Spur-Kopie, die irgendwelche Daten aus einem `loc: 1`-Sound übernimmt, bekommt `loc: 1` und behält dessen `origin`: Timbre kopieren (MK3), Sequenz kopieren (MK6), A/B, Speichern als, Duplizieren, Laden in eine Spur, Kopieren aus der Bibliothek. `saveSound` löscht `loc`/`locRef` nie. | Sonst ginge ein abgeleiteter Sound über Autosave und `save_library` hinaus, obwohl jede Abnahme besteht. |
| **EN3-09** | **Speicherwellen:** Bis MK10 gibt es 64 additive Platzhalter mit „≈“, nachgezeichnet aus einer Bild-Referenz (MK2; eingebaut werden nur selbst gerechnete Teiltonwerte, nie die Bilder). Was MK10 aus Xanders Aufnahmen gewinnt, wird **in die App eingebaut** (H-2, Xander 25.10.): ein kompakter Datenblock im Block `sq-mk-src`, den alle hören, auch Freunde im Paar-Raum. Erlaubt sind nur die **gerechneten Wellen** (Teiltonpegel und Phasen); Roh-Aufnahmen kommen weder in die App noch ins Repo. Die Marken-Regel EN3-05 bleibt: kein Korg-Name, kein Logo, keine Korg-Wörter, auch nicht im Datenblock (Salz-Byte, B.6 Nr. 9). Bis zum Einbau hört nur Xanders Gerät seine Aufnahmen (lokal, MK10). | Xanders Entscheidung. Ihm wurde gesagt, dass die Lizenz ungeklärt ist (wie EN2-11, DX7-ROM: die Wellen sind Daten aus seinem Korg-Gerät); er hat trotzdem „eingebaut“ gewählt. Das Risiko steht in MK10 Risiken. |
| **EN3-10** | **Ein Tempo.** Arp, LFO-Sync, Delay-Sync und Mod-Seq folgen dem Song-Tempo `S.bpm`. Das Feld `arp.tempo` (20…300) wird nur gespeichert, für Import und Anzeige. Es verhält sich wie am Gerät mit „Clock = External“ (HB-MS S. 45, HB-MK S. 44). | In einem Sequencer gibt es eine Uhr. Zwei Tempi würden auseinanderlaufen. |
| **EN3-11** | **Arp im Hauptfaden, Mod-Seq und Vocoder im Worklet.** Der Arp setzt zwischen Notenquelle und `spawnVoice` an (Z. 12610). Sein Planer läuft in `tick()` **vor** der Prüfung `R.playing` (Z. 13137), mit dem vorhandenen Vorlauf (`LOOKAHEAD` 0,1 s, Z. 12917), und schreibt `noteLog`. Er schickt dem Worklet zusätzlich den **Tastensatz** als eigenes Ereignis KEYS (Typ 9 = erste Taste gedrückt, Typ 10 = alle Tasten los, je mit Zeitstempel). Aufnahmen (● REC) speichern die **gespielten Tasten**, nicht die Arp-Noten (H-8, entschieden). Der Arp läuft auch im ECO-Klang (B.5). | M-ZEIT-Prüfung über `noteLog`. Die Ereignisse sind sampelgenau (16-Sample-Blöcke). Seq und Vocoder brauchen Stimmen- bzw. Audiotakt. Ohne KEYS sähe das Worklet nur Arp-Noten und setzte Key Sync „Timbre“ bei jedem Arp-Schritt zurück; das Gerät unterscheidet gespielte Tasten von Arp-Wiederholungen (HB-MS S. 43, S. 63). |
| **EN3-12** | **Stimmen-Budget:** 4 Stimmen je AM-Spur wie MS2000 (HB-MS S. 2). MK13 erlaubt 8. Der CPU-Begrenzer ändert nie Gespeichertes (I-08), Stufen in B.4. | Plan Punkt 5. |
| **EN3-13** | **Kein WebGL im AM-Bedienfeld.** Die Regler, Drehschalter, Tasten, LEDs, die Anzeige, die Räder und die Holzwangen sind DOM mit CSS (Verläufe, Schatten, eigene kleine SVG-Formen), **ohne Bild-Dateien** (B.3). Schritt- und Bandanzeigen sowie die Pegelanzeige der Aufnahme-Seite (≤ 16 Säulen, ≤ 30 Hz, nur sichtbar) zeichnet Canvas 2D. | WebGL lohnt erst bei Tausenden Elementen. Ein zusätzlicher GL-Kontext kostet Speicher und Startzeit auf dem iPhone. PE1 (rAF ≥ 55 fps) ist die Prüfung. |
| **EN3-14** | **AM-Code nachladen, Kern immer da.** Der Worklet-Teil steht im vorhandenen Worklet-Quelltext (ASCII). Im Hauptfaden gibt es zwei Teile. **(1) Immer geladen, klein, im oder vor `SQStore`** (wie FMX, CHANGES-V3): Engine-Eintrag `mk`, `MK_LABEL` (EN3-05), `normMk`, INIT AM, `mkToFlat`, ab MK9 `mkLocalStrip`, die `loc`/`locRef`-Behandlung und EN3-08a. **(2) Nachgeladen** als `<script type="text/plain" id="sq-mk-src">`: Bedienfeld, Räder, Arp, Werksdaten, eingebaute Speicherwellen (MK10), Tabellen-Bau (`mkTables`, B.4), später der Import-Parser (MK9). **(3) Nachgeladen** als `<script type="text/plain" id="sq-mkrec-src">` (MK10): Aufnahme-Seite, WAV/AIFF-Leser und Wellen-Analyse; ausgewertet nur beim Öffnen von „Wellen aufnehmen“. Ausgewertet wird (2) beim ersten Bedarf: AM-Sound im geöffneten Projekt (dann **schon während des Ladens**, bevor der Transport starten kann), Engine-Knopf „MS 2000“, Bibliothek mit dem Filter „MS 2000“ oder Leistungs-Probe. Vor der Auswertung und vor jedem Entpack-Schub ruft die App `tickAhead(.3)` (Z. 13125); zwischen zwei Tabellen-Häppchen ≤ 8 ms liegt mindestens ein Scheduler-Tick. | Ladezeiten haben Vorrang (CLAUDE.md, Punkt 2). Projekte ohne AM starten wie bisher. Teil (1) muss beim Start und in jedem Upload wirken: Ein Engine-Block überlebt nur, wenn sein Modul da ist (Z. 7873), und `Library.load`/`Autosave.load` normalisieren jeden Sound beim Start (Z. 8247, 8340). Der Scheduler plant nur 100 ms voraus (Z. 12917): Ein Stillstand > 75 ms macht Noten auf allen Spuren spät, > 200 ms fallen sie aus. Block (2) lässt sich später als Ganzes packen (H-1). |
| **EN3-15** | **Zwei Eingänge je AM-Spur.** **E1** heißt „Instrument“ (MS2000 AUDIO IN 1), **E2** heißt „Stimme“ (AUDIO IN 2, Vocoder-Modulator). Der microKORG nummeriert seine Buchsen andersherum (dort IN 1 = Mikrofon ≙ E2, IN 2 = Line ≙ E1; A.11 Nr. 5). Jeder Eingang ist wählbar: Mikrofon (nur auf der Pages-Seite, über den gemeinsamen Mikrofon-Abgriff aus MK7, Start nur auf Tipp), eine andere Spur (Abgriff **vor** ihrem Fader, MK7) oder aus. Die Wahl gehört zur Spur (`tr.mkIn`), nicht zum Sound. | HB-MS S. 4, S. 38, S. 49; HB-MK S. 31, S. 33. Das Mikrofon geht nur außerhalb der Claude-App (EN2-06). |
| **EN3-16** | **Geräte-Abgleich.** Xander besitzt einen microKORG. Jedes Paket nennt Punkte, die er nach Gehör am Gerät vergleicht. Das blockiert nicht. Ergebnisse ändern nur die W-Tabelle, mit Wert und Grund in CHANGES. | Viele Kurven sind eK. Das Gerät ist die beste Referenz, die wir haben. |
| **EN3-17** | **Zwischenstände.** Artifact und Pages bekommen je einen Stand nach MK1, MK4, MK7, MK8, MK10 (Bau-Abschnitt 1: Aufnahme-Seite, damit Xander aufnehmen kann), nach dem MK10-Einbau und nach MK13 (EN2-15 sinngemäß; die Untergruppen stehen in E.1). | Xander will früh hören. Vocoder mit Mikrofon und Aufnahme-Seite gehen nur auf Pages (Safari), nicht in der Claude-App. |
| **EN3-18** | **Regel MK-R1:** Jeder neue stetige AM-Regler ist automatisch ein Ziel des Mod-Sequenzers (ab MK6) und ein Patch-Ziel, wenn A.5 es nennt. In das App-Mod-System (Halten → Mod-Picker, `MODT`) kommen AM-Regler erst mit V5d (MOD-R1). Als Pad-Quelle kommt AM erst mit V1d (PAD-R1). Weil MK jetzt **vor** V5d, V6a, V5b/c und V1d gebaut wird, werden die AM-Regler (2 Timbres mit je ≈ 60 stetigen Werten, dazu Seq und Vocoder) dort Pflicht-Ziele. **H-9 = ja** (entschieden 25.10.; Xanders Wunsch I4 „jeder Regler modulierbar“): Umfang, Abnahme, Stunden und KB dieser Pakete steigen (Teil G Nr. 4). | Die MS2000-Modulation (PATCH, SEQ) ist Teil des Plans. Das App-Mod-System ist es noch nicht (N1 EN-21). Die Pakete V5d ff. wurden ohne AM geplant. |
| **EN3-19** | **Regel MK-R2** (gilt erst, wenn MK9 gebaut ist): Jedes Paket, das **nach** MK9 einen Weg vom Gerät weg baut (VO3, VO4a–c, VC2b/VC2c, VC3, VC3b, VC4 inkl. `sample` und `room.sendToClaudeSession`), ruft `mkLocalStrip` auf. Seine FP-SICHER-Prüfung prüft das (Teil G Nr. 10). Wird MK9 später gebaut, rüstet MK9 selbst alle dann vorhandenen Wege nach (MK9 Umfang 5). | Die Liste in EN3-08 wäre sonst nur für heute vollständig. Solange MK9 zurückgestellt ist, gibt es keine 🔒-Sounds, also nichts zu strippen. |
| **EN3-20** | **Bedienfeld wie die Vorderseite des Originals** (Xander, 25.10.: „genau so“). Anordnung der Sektionen und Regler, die Drehschalter-Logik EDIT-WAHL 1/2 mit der Sektions-Matrix, die 5 Regler, die Wert-Anzeige, BEND- und MOD-Rad links der Tasten, Oktav-Tasten, Arp-Taste, Nummerntasten, Farben und Material (dunkles Bedienfeld, Holzwangen) folgen dem Original (B.3, Referenz-Skizze). Nicht übernommen werden Name, Logo und Schrift von Korg. Ebene 1 der Regler ist genau die Belegung des Originals (Parameter-Liste HB-MK PDF 78); was der MS2000 oder die RADIAS-Teile zusätzlich haben, liegt auf der SHIFT-Ebene 2 (bzw. 3) und an den zwei Stellungen, die am Original GLOBAL und MIDI heißen (beide entfallen in der App, A.10). Alle Trefferflächen ≥ 44 × 44 px. **Ab MK-P (26.10.)** ist die Vorlage die Vorderseite des MS2000 (HB-MS S. 5). Jeder Wert hat seinen eigenen Regler bzw. seine Taste wie am MS2000, die Zusätze liegen auf den LCD-Seiten (EDIT, Seitenplan). Die Platte ist hell blau-silbernes Metall ohne Holzwangen; Trefferflächen ≥ 44 × 44 gibt es über die Zoom-Ansicht. | Xanders Wunsch. Die Zusatz-Ebenen lassen Ebene 1 unverändert und brauchen keinen 6. Regler. Ob die Zusätze so liegen dürfen, ist Frage H-14 (sichtbar, CLAUDE.md Nr. 3). |
| **EN3-21** | **Nur iPhone, kein Rechner, kein MIDI.** Xander arbeitet nur am iPhone 12 Pro Max und kennt MIDI nicht; iOS Safari hat kein Web MIDI. Kein Paket darf einen Rechner, MIDI oder eine Datei vom Rechner verlangen. Darum ist **MK9 (Import .syx/.prg) zurückgestellt** (außerhalb der Versionsfolge, E.1), und Teil D beschreibt nur iPhone-Schritte. Der MIDI-Eingang für Bend/Mod-Rad bleibt eine **freiwillige Zugabe für Desktop-Browser**, nie nötig (MK1 Umfang 8); BEND und MOD sind Touch-Räder (H-5). | Xander, 25.10. Auch die Bau- und Prüfschritte, die Xander selbst macht (iPhone-Prüfpunkte, Geräte-Abgleich, Aufnahmen), gehen am iPhone. |

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
| Tabellen-Wellen mit einer Mipmap je Oktave, Überblendung je Steuerblock (V4a, K2-40) | Worklet „Wave 0 … 11“ (Z. 3631–3673; beim Laden des Moduls gebaut) | Nur das **Verfahren**: AM bekommt einen eigenen, DOM-freien Bau `mkTables` im Hauptfaden (MK2, B.4), der zugleich der gemeinsame Tabellen-Bau nach Spec §10.1 ist. `waveTab` von V4a bleibt unverändert im Worklet. Nutzung: Speicherwellen, Endlos, MK10 (lokal und eingebaut; die Stimmwelle wird live gerechnet, W-28) |
| Spur-Kette (Drive, Chorus, Trem, Duck, Vol, Pan, Hall-/Echo-Send) | `buildChain` Z. 12013 | unverändert **hinter** dem AM-Ausgang (Reiter FX). Abgriff für AM-Eingänge vor Vol/Pan (MK7) |
| ECO-Rückfall (NativeVoice), Badge | `trackEco`, Z. 12215 | AM → VA-Näherung (B.5) |
| Klang-Datenmodell, `normalizeSound`, `soundHash`, Bibliothek, INIT je Engine; Engine-Listen `ENGINE_LABEL`, Browser, `setEngineOf` | Z. 7739–8000, Z. 11060 ff.; Z. 11162, 24409, 24509, 20343 | Engine `mk`, `normMk`, INIT AM; `mk` in allen Engine-Listen (MK1); Feld-Listen für `bank`/`slot` (MK8), `loc`/`locRef` (MK9), `tr.mkIn` (MK7) |
| Undo je Geste `soundEdit`/`commitSound` | Z. 20327 | jede AM-Geste |
| Blatt-Rahmen `sheetFrame` (Kopf, LCD-Zeile, Reiter), Regler-Geste `sKnob`, `lcdShow`, `openPop`, fit-Klassen | Z. 20260, 20725, 20175, 19579 | Rahmen um das AM-Bedienfeld; die Bedienfeld-Bausteine (Kappen-Regler, Drehschalter, LED-Tasten, Anzeige, Holzwangen) sind neu (B.3), die Ziehgeste der Regler kommt aus `sKnob` |
| Tastatur-Bereich `#kbArea`, Oktav-Wahl je Spur `tr.kbOct` (1…7) | Z. 3494, Z. 11491, Z. 18917 | OKT ▼/▲ des Bedienfelds ändern `tr.kbOct`; BEND- und MOD-Rad sitzen bei AM-Spuren links im `#kbArea` (MK1) |
| Mikrofon-Zugang (VS1: `MIC_ASK`, `getUserMedia` nur auf Tipp, play-and-record, Wege-Erkennung) | Z. 29401, Z. 29500 ff., Z. 30007 ff. | Eingang „Mikrofon“ über einen gemeinsamen, referenzgezählten Mikrofon-Abgriff ohne Stimm-Analyse (MK7); derselbe Abgriff speist die Aufnahme-Seite „Wellen aufnehmen“ (MK10, Eingang = AG06). Die VS1-Sitzung (`stStart`, MPM, Ringpuffer) wird nicht mitbenutzt |
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
| Bend Range | −12…+12 HT | S. 36 | S. 17 | kein Bend-Rad | ✗ (MK1 bringt das Touch-Rad BEND, H-5; MIDI-Bend nur freiwillig am Desktop) | MK1 |
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

- **Global** (Mst.Tune 430–450 Hz, Transpose, Vel.Curve, Position, AudioInThru, Protect, MIDI-Kanal, MIDI1/MIDI2-Zuweisung, Local, Clock, Filter, Dump, Pedal/Switch; HB-MS S. 53–57, HB-MK S. 47–51): Das regelt die App auf Projekt- und Geräte-Ebene (Tempo, Tastatur FEST/POSITION). Die App hat einen MIDI-Eingang, der heute nur Note an/aus verarbeitet (Z. 29030–29047); BEND- und MOD-Rad kommen als Touch-Räder (MK1, H-5), Bend und CC1 vom MIDI-Eingang nur als freiwillige Zugabe am Desktop (EN3-21). MIDI 1/MIDI 2 gelten fest als Bend/Mod-Rad (Werksbelegung, A.5). Die Stellungen GLOBAL und MIDI der EDIT-WAHL 2 tragen in der App die MS2000-Teile STIMMUNG und SEQ (B.3).
- **CC/NRPN-Tabellen** (HB-MS S. 60–65): Sie dienen nur als Hilfe beim Import (Wertzuordnung), nicht als Funktion.
- **Demos, Write/Protect, Program-Banks A–H mit je 16** (HB-MS S. 2): Das übernimmt die Bibliothek. Die Bänke folgen dem microKORG-Muster (A.11).

### A.11 microKORG ↔ MS2000 (die Oberfläche zeigt den microKORG; die Fähigkeiten folgen dem MS2000)

Ab MK-P zeigt die Oberfläche den MS2000. Nr. 4, 7 und 8 beschreiben die Bedienung bis dahin; den Umzug regelt MK-P Umfang 5.

1. Layer (microKORG) = Dual (MS2000). Split gibt es nur beim MS2000 → übernommen.
2. Vocoder: microKORG 8 Kanäle (16 Filter paarweise, S. 35), MS2000 16 Kanäle → 16. Der Import ordnet Kanal k den Bändern 2k−1 und 2k zu.
3. Step-Arp (Last Step 1–8, Schritt-Tasten) gibt es nur beim microKORG → übernommen.
4. Mod-Seq, Scale, Priority, Filter/Amp Vel Sense, Amp Sw und Split gibt es nur beim MS2000 → übernommen, auf der SHIFT-Ebene 2 der passenden Sektion bzw. an den Stellungen STIMMUNG und SEQ der EDIT-WAHL 2 (am Original GLOBAL und MIDI; B.3, EN3-20).
5. Audio-In-Balance: Nach Funktion haben beide Geräte dieselbe Richtung (127 = nur der Mikrofon-Eingang). MS2000: 0 = nur IN 1 (Instrument, Träger), 127 = nur IN 2 (Mikrofon, Modulator) (HB-MS S. 38, S. 4, S. 17, S. 49). microKORG: 127 = nur AUDIO IN 1, 0 = nur AUDIO IN 2 (HB-MK S. 21); dort ist IN 1 die Mikrofon-Buchse (Modulator) und IN 2 LINE (Träger, INST LEVEL) (HB-MK S. 4, 10, 31, 33, 34). Der Import ordnet deshalb nach Funktion zu: **microKORG IN 1 → E2, IN 2 → E1; der Balance-Wert wird unverändert übernommen.**
6. Die Patch-Quellen heißen am microKORG FILTER EG, AMP EG, …, Pitch Bend, MOD.Wheel (S. 30). Das entspricht EG 1, EG 2, …, MIDI 1, MIDI 2 beim MS2000 (S. 42). FC-Mod-Quellen hat der microKORG ohne EG 1: 7 Einträge ab AMP EG (HB-MK S. 36 gegen HB-MS S. 50); der Import bildet sie nach Namen ab (MK9).
7. **Programme:** Der microKORG hat 8 Genre-Bänke × 2 Seiten × 8 Nummern = 128 (S. 8). Die Bänke heißen TRANCE, TECHNO/HOUSE, ELECTRONICA, D&B/BREAKS, HIPHOP/VINTAGE, RETRO, S.E./HIT und VOCODER (PDF 77). Das wird **übernommen als Bedien-Logik und Aussehen**: BANK-Drehschalter (8 Genres), Taste SEITE (A│B), Nummerntasten 1–8, Anzeige „A.24“ (B.3).
8. **Performance Edit** (S. 8–9): Ist keine Sektion gewählt (beide LEDs an den Drehschaltern leuchten), steuern die Regler 1–5 Cutoff, Resonance, EG Attack (Filter- + Amp-EG), EG Release (Filter- + Amp-EG) und Tempo → Zustand **SPIEL**. Im Vocoder-Programm wirken Regler 1/2 auf die Bandpässe des Trägers und 3/4 nur auf die Amp-EG (S. 10; B.3 SPIEL).
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
10. **Bedienung/Bibliothek:** Bedienfeld wie die Vorderseite des Originals (ohne Marke), BEND- und MOD-Rad, Genre-Bänke, Speicherwellen aus Aufnahmen in der App (eingebaut); Import (zurückgestellt).
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

- **Räder (H-5, entschieden 25.10.):** BEND- und MOD-Rad sind Touch-Räder links der Tasten (B.3, MK1). Ihre Stellung ist ein **Live-Wert je Spur** (`R.mkWheel[uid] = {bend: −1…+1, mod: 0…1}`), wird **nicht gespeichert** und macht keinen Undo-Schritt, wie am Gerät. Das MOD-Rad startet beim Laden des Sounds und beim Spurwechsel auf dem vorhandenen flachen Wert `p.mw` (0…1, „Mod-Rad“, Z. 11203; in der App der Regler MOD-RAD, TONH. Ebene 2) und ersetzt ihn live, sobald es bewegt wird. Es ist die Quelle „Mod-Rad“ (MIDI 2) und skaliert das Vibrato. Das BEND-Rad federt beim Loslassen zur Mitte und ist die Quelle „Bend“ (MIDI 1). Freiwillig am Desktop: Bend (0xE0) und CC1 vom MIDI-Eingang setzen dieselben Live-Werte (EN3-21).
- **Eingänge** (EN3-15) gehören zur Spur: `tr.mkIn = {e1: null | 'mic' | 't:<uid>', e2: …, e1Dry: 1, e2Dry: 1}`. `eDry` 0 = „Quelle nur als Eingang“ (H-10, MK7). Das Format bleibt 5, die Felder sind neutral. `normTrack`/`normalizeProject` behalten `tr.mkIn` (Z. 11490–11500).
- **`normMk(p)`** klemmt jedes Feld auf die Bereiche aus Teil A (Listen: Index 0…n−1, auf ganze Zahlen gerundet). Fehlende Felder bekommen die INIT-Werte, unbekannte Felder fallen weg. `normSynthP` ruft `normMk` auf, wenn `p.mk` existiert oder `engine === 'mk'`. Der Block bleibt bei jedem Engine-Wechsel erhalten (wie `p.fmx`, Z. 7872). `normMk` gehört zum immer geladenen Teil (EN3-14), sonst fiele `p.mk` beim ersten Laden der Bibliothek weg.
- **Feld-Listen:** `normalizeSound` behält nur aufgezählte Felder (Z. 7920–7928). Neu aufgenommen werden `bank`/`slot` (MK8) und `loc`/`locRef` (MK9). `ENGINE_LABEL` bekommt `mk: MK_LABEL`, also „MS 2000“ (Z. 11162; sonst zeigen `soundLabel`, Browser und MIDI-Spurname „VA“), die Engine-Listen des Browsers (Z. 24409, 24509) und die `setEngineOf`-Liste mit Aufräumen (Z. 20343, 20352) nehmen `mk` auf (MK1).
- **`soundHash`** bleibt (Z. 7765). `p.mk` ist Teil von `p` und zählt also mit.
- **Format 5** (EN3-04): `PROJECT_FORMAT` 5, `SOUNDS_FORMAT` 2. Format 3 und 4 laden unverändert. Die Meldung „Projekt aus einer neueren Version“ (Z. 8163) erscheint nur beim Datei-Import von Hand (`parseFile`, Z. 24623). `projFromFile` (Z. 26988; Wege Cloud und Projektwechsel), `Autosave.load` (Z. 8340), `Library.load` (Z. 8247) und `cloudLibMerge` verwerfen ohne Meldung; den Schutz bringt MK0. Online: `p_format` 5 wird erst nach dem Rollout `max_format` 5 angenommen. Bis dahin speichert die App lokal und meldet `bad_version` wie bisher.
- **INIT AM** (`f-init-am`, cat `init`, `INIT_IDS.mk`; sichtbarer Name **„INIT MS 2000“**, aus `MK_LABEL` gebildet): genau die Vorgaben oben (Säge, Filter offen, EG2 Sustain 127, Release 8). Pegel wie MK1-20. Im Vocoder-Modus lädt ⋯ → Init bzw. SHIFT + 3 INIT AM mit `mode` 3 und den Vocoder-Vorgaben (HB-MS S. 51).

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
| **W-17** | Bend | Bereich v HT. Das Touch-Rad BEND (MK1, B.3) wirkt live über ± v HT: Tonhöhe = Rad (−1…+1) · v HT, linear, Totzone ± 2 % um die Mitte, beim Loslassen zurück zur Mitte in 80 ms (geglättet, τ 5 ms). Ein MIDI-Bend (0xE0, freiwillig am Desktop) setzt denselben Wert | [B] S. 36; Verlauf und Totzone eK |
| **W-18** | Patch-Intensität i | Ziel = i/63 · volle Spanne: Tonhöhe ±24 HT · OSZ2-Tonhöhe ±63 Fein-Einheiten (über W-14) · OSZ1-Steuer 1 ±127 · Rauschen ±127 · Cutoff ±127 Cutoff-Einheiten · Amp ±127 Pegel-Einheiten · Pan voller Weg L63↔R63 · LFO2-Freq ±127 (über W-08). **LFO2-Freq wirkt nicht, solange `l2.sync` = 1.** Quellen: EG 0…1, LFO −1…+1 (LFO2 Rechteck(+) 0…1), Anschlag vel, Keytrack (KT − 60)/60, Bend (BEND-Rad −1…+1, in Ruhe 0), Mod-Rad (MOD-Rad 0…1, Startwert `p.mw`; B.1 „Räder“). Rechnung in Bruchwerten (B.6 Nr. 2) | eK; Liste [B] S. 42; Tempo-Sync-Regel [B] HB-MS S. 41/42, HB-MK S. 29/30; MIDI 1/2 = Werksbelegung (A.5) |
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

### B.3 Bedienfeld: die Vorderseite des Originals, ohne Marke (EN3-20) — ersetzt durch MK-P

> **Ersetzt durch MK-P (26.10.2026).** B.3 beschreibt das Bedienfeld nach der **microKORG**-Vorlage (HB-MK S. 2–3), wie MK1–MK7 es gebaut haben. Es gilt bis zur Auslieferung von MK-P und für Pakete, die vorher zusammengeführt werden; danach gilt MK-P (Vorlage HB-MS S. 5, Vorderseite des MS2000). Aus B.3 bleiben gültig: Rahmen (Zeile 1 und 2, LCD-Zeile; Reiter neu [GERÄT] [SPIEL] [FX]), Räder (Rahmen im Metallton), Regler-Verhalten, Kopf-Knöpfe (◎ nach MK-P Umfang 5), Zusatz-Ansichten (Einstieg über die Anzeige) und die Maße des `.pg`-Körpers.

**Grundsatz** (Xander, 25.10.: „genau so“): Das AM-Bedienfeld sieht aus und funktioniert wie die Vorderseite des microKORG: dieselbe Anordnung der Sektionen und Bedienelemente, die Drehschalter EDIT-WAHL 1 und 2 mit der Sektions-Matrix, die 5 Regler, die Wert-Anzeige, BEND- und MOD-Rad links der Tasten, Oktav-Tasten, Arp-Taste und Nummerntasten, dazu das dunkle Bedienfeld mit Holzwangen links und rechts. **Nicht übernommen:** der Name Korg bzw. microKORG, das Logo und die Schrift von Korg. Die Beschriftungen sind eigene deutsche Wörter in der App-Schrift (Großbuchstaben); die Vocoder-Beschriftungen sind grün wie am Original. Marke und Modellname des Originals werden nicht nachgebildet; an ihrer Stelle steht nichts, auch nicht „MS 2000“. Quelle der Zuordnung: HB-MK S. 2–3 (Bedienelemente; dort steht eine Strichzeichnung der Vorderseite über beide Seiten, PDF 8–9), S. 8–15 (Bedien-Logik), Parameter-Liste und SHIFT-Liste (PDF 78). Es gibt kein Foto. Aus der Strichzeichnung ist die **Anordnung der Gruppen** übernommen [B]: links VOLUME, darunter ARPEGGIATOR ON/OFF mit TEMPO-LED und OCTAVE SHIFT, unter ihnen die Räder links der Tasten; in der Mitte BANK SELECT, BANK SIDE, die AUDIO-IN-LEDs und die Anzeige, darunter WRITE und SHIFT, ganz unten die Nummerntasten 1–8; rechts eine Spalte mit TIMBRE SELECT über EDIT SELECT 1 über EDIT SELECT 2 (mit den SYNTH/VOCODER-LEDs), daneben ORIGINAL VALUE und die 5 Regler, unter den Reglern die Parameter-Matrix (oberer Block zu EDIT SELECT 1, unterer zu EDIT SELECT 2). Die Reihenfolge innerhalb der Gruppen ist [W], Maße und genaue Lage sind eK, weil jede Trefferfläche ≥ 44 px groß sein muss. Die **Referenz-Skizze** unten ist eine eigene Zeichnung und für Bau und Abnahme verbindlich. Xander gleicht sie an seinem Gerät ab (Geräte-Abgleich MK1); eine Abweichung ändert nur Skizze und Bedienfeld, als eigener Schritt `MK1-fix`.

**Logik** (HB-MK S. 8–15): Nach dem Laden eines Programms leuchten beide LEDs an den Drehschaltern, die Regler haben die Spiel-Belegung (**SPIEL**). Dreht man EDIT-WAHL 1 oder 2, wählt man eine Sektion; die Regler 1–5 bearbeiten sie. Ihre Belegung steht in der **Matrix** unter den Reglern, wie am Original in zwei Teilen: obere Zeile = Sektion der EDIT-WAHL 1, untere Zeile = Sektion der EDIT-WAHL 2. Die Zeile der aktiven Wahl ist hell (**Matrix-Zeile**), die andere gedimmt. Programme wählt man über BANK, SEITE und die Nummerntasten 1–8. Bei ARP A/B werden die Nummerntasten zu Schritt-Tasten.

**Rahmen:** Der vorhandene Synth-Blattkopf bleibt (`sheetFrame`):
- Zeile 1: Spurname, **Engine-Wahl VA │ FM │ WT │ MS 2000** (H-4, Beschriftung aus `MK_LABEL`), ECO-Badge, ↶ ↷ ✕. **Breiten-Budget je Format** (MK1 misst es bei 320/375/390 px mit Spur-Chip und trägt die Werte hier und in CHANGES ein): Die Engine-Knöpfe bekommen ihre 44-px-Trefferhöhe senkrecht über `::after` (wie `.hb.edmL`, Z. 1006), nicht in der Breite. Sie müssen das dichte Raster erfüllen (≥ 36 px breit, 4 px Abstand), und der Spurname bleibt sichtbar. Heute sind sie je nach Breite und Spur-Chip schon 28–40 px breit und 34 px hoch (Z. 715, 721, 2290, 2342, 2350), und das ECO-Badge sitzt in P schon im VA-Knopf (Z. 20845). „MS 2000“ steht einzeilig, wo ≥ 52 px frei sind, sonst zweizeilig „MS“ │ „2000“ (Umbruch an der Leerstelle per CSS, kein `<br>`; der Text bleibt genau „MS 2000“). Passt auch das nicht (P2/P3), gilt die Vorgabe zu **H-13**: **ein Engine-Chip** mit der aktiven Engine („VA ▾“ bzw. „MS 2000 ▾“) und `openPop` (4 Zeilen ≥ 44 px). Das ändert auch VA/FM/WT sichtbar und kommt nur mit Xanders Okay (CLAUDE.md Nr. 3). Im Querformat liegen Zeile 1 und 2 in einer 40-px-Kopfzeile (Z. 1426–1437): Dort muss der vierte Knopf ebenfalls passen, ohne dass ein Kopf-Element überläuft; das Namensfeld ‹ › darf dafür bis auf seine Mindestbreite (72 px) schrumpfen (MK1-21).
- Zeile 2: ‹ Name ›, A/B, Sichern, 🎲, ◎, ⋯, ▶ Hören.
- LCD-Zeile mit dem Klartext (z. B. „FILTER · CUTOFF 064 · 652 Hz“).
- Reiter **[GERÄT] [FX]**: GERÄT ist das Bedienfeld; FX ist die vorhandene App-Seite (SPUR, CHORUS, HALL, ECHO, MASTER) und bleibt unverändert. Die Reiter SPIEL, EDIT 1, EDIT 2 und SEQ der Rev. 1 entfallen; ihre Inhalte liegen auf dem Bedienfeld. In der **Halb-Ansicht** (Maße unten) heißen die Reiter **[LINKS] [RECHTS] [FX]**; sie behalten die Maße des Blattrahmens wie heute [FX] (L4).

**Referenz-Skizze** (L1, Querformat, ein Stück, drei Bänder à 44 px; eigene Zeichnung, Anordnung nach HB-MK S. 2–3):

```
┌──┬──────────────────────────────────────────────────┬────────────┬──────────────────────────────────────────┬──┐
│  │Z1   Z2     Z4    Z5       Z6    Z7               │Z11         │Z12                                       │  │
│HL│(O)  [ARP*]  (@)   [SEITE*]  *E1   [ 8.8.8 ]      │ [TIMBRE]** │ *ORIG CUTOFF RESO. ATTACK RELEAS TEMPO   │HR│
│  │VOL.         BANK            *E2                  │            │       (O)    (O)   (O)    (O)    (O)     │  │
│  │Z3            Z9                  Z8              │ (@) *1     │ Z13  FILTER       (Zeile EDIT-WAHL 1)    │  │
│  │[OKT▼][OKT▲]  TRANCE · A.24 ·     [WRITE][SHIFT*] │  WAHL 1    │       TYP    CUTOFF RESO. HK-INT KEYTR.  │  │
│  │              Programmname                        │            │                                          │  │
│  │Z10                                               │ (@) *2     │      MOD-FX       (Zeile EDIT-WAHL 2)    │  │
│  │[1][2][3][4][5][6][7][8]                          │  WAHL 2    │       TYP    TEMPO  TIEFE  –      –      │  │
└──┴──────────────────────────────────────────────────┴────────────┴──────────────────────────────────────────┴──┘
┌──────┬──────┬─────────────────────── Tastatur der App (#kbArea) ───────────────────────┐
│ BEND │ MOD  │                                                                          │
│ (Rad)│ (Rad)│                                                                          │
└──────┴──────┴──────────────────────────────────────────────────────────────────────────┘
(O) Regler · (@) Drehschalter · [ ] Taste · * LED · HL/HR Holzwangen · Z13 = Matrix (oben die Zeile der EDIT-WAHL 1,
unten die der EDIT-WAHL 2; die Zeile der aktiven Wahl hell) · Band 1 = Zeile 1–3, Band 2 = Zeile 4–6, Band 3 = Zeile 7–8
```

**Zonen** (Bezug L1: Körper 720 × 136 px = drei Bänder à 44 px mit 2 px Abstand, y 0 / 46 / 92; Ursprung oben links; die Abnahme rechnet in Anteilen dieses Rechtecks, MK1-32):

| Zone | Inhalt | x | y | Breite | Höhe |
|---|---|---|---|---|---|
| HL, HR | Holzwange links, rechts | 0 bzw. 710 | 0 | 10 | 136 |
| Z1 | VOLUME (Regler) | 14 | 0 | 44 | 44 |
| Z2 | ARP (Taste mit Tempo-LED) | 62 | 0 | 44 | 44 |
| Z3 | OKT ▼, OKT ▲ (je 44, Abstand 4, LED je Richtung) | 14 | 46 | 92 | 44 |
| Z4 | BANK (Drehschalter, 8 Stellungen) | 112 | 0 | 52 | 44 |
| Z5 | SEITE (Taste mit LED) | 176 | 0 | 44 | 44 |
| Z6 | Eingangs-LEDs E1, E2 übereinander (ab MK7; keine Trefferfläche) | 270 | 0 | 16 | 44 |
| Z7 | Anzeige (3 Stellen 7-Segment; keine Trefferfläche) | 294 | 0 | 92 | 44 |
| Z8 | WRITE, SHIFT (je 44, Abstand 4), unter der Anzeige | 294 | 46 | 92 | 44 |
| Z9 | Programm-Zeile (nur Anzeige): Bankname, Seite und Nummer „A.24“, Programmname; bei leuchtendem SHIFT „SHIFT“ | 112 | 46 | 176 | 44 |
| Z10 | Nummerntasten 1–8 (je 44 ohne Abstand, Bild 40) | 14 | 92 | 352 | 44 |
| Z11 | Spalte: TIMBRE (LEDs 1, 2) in Band 1, EDIT-WAHL 1 mit LED ●1 in Band 2, EDIT-WAHL 2 mit LED ●2 in Band 3 (Drehschalter 52, LED 10) | 392 | 0 | 64 | 136 |
| Z12 | ORIGINAL-LED (10) und Regler 1–5 (je 44, Abstand 2) mit fester Aufschrift der Spiel-Belegung | 462 | 0 | 240 | 44 |
| Z13 | Matrix: Zeile der EDIT-WAHL 1 (Band 2) und der EDIT-WAHL 2 (Band 3), je Sektionsname und die 5 Belegungen unter den Reglern | 462 | 46 | 244 | 90 |
| Räder | BEND, MOD links in `#kbArea` (je ≥ 44 breit, Abstand 4), volle Höhe der Tastatur-Zeile | links | – | 92 | Tastatur |

Rechnung Band 1: 14 + 44 + 4 + 44 + 6 + 52 + 12 + 44 + 50 + 16 + 8 + 92 + 6 + 64 + 6 + 240 = 702 ≤ 710 (Holzwange rechts). Band 3: Nummerntasten 14…366, Abstand 26 zur Spalte Z11. Höhe 3 × 44 + 2 × 2 = 136 px.

**Bedienelemente:**

| Am Original | In der App | Verhalten | ab |
|---|---|---|---|
| VOLUME | VOLUME | Spur-Lautstärke (derselbe Wert wie FX → SPUR, Vol); eine Geste = ein Undo | MK1 |
| BANK SELECT (8 Stellungen) | BANK | 8 Genre-Bänke (Namen nach MK8). Ziehen rastet je Stellung, Tipp öffnet die Liste (Zeilen ≥ 44 px) | MK1 (Bänke leer bis MK8) |
| BANK SIDE mit LED | SEITE | A (LED aus) │ B (LED an); SHIFT + SEITE wechselt zur zuletzt gewählten Sektion der anderen EDIT-WAHL | MK1 |
| PROGRAM NUMBER 1–8 mit LEDs | 1 … 8 | Tipp lädt Bank/Seite/Nummer in die Spur (ein Undo, Toast [Rückgängig]); Tipp auf die leuchtende Taste = zurück zu SPIEL. Bei EDIT-WAHL 2 auf ARP A/B Schritt-Tasten (MK5). Mit SHIFT Werkzeuge (Tabelle unten) | MK1 |
| EDIT SELECT 1, EDIT SELECT 2 (je 11 Stellungen) | EDIT-WAHL 1, EDIT-WAHL 2 | Ziehen (≥ 18 px je Stellung, `haptic('tick')`) oder Tipp → **Auswahl-Liste = die Matrix dieser Wahl** (11 Zeilen ≥ 44 px, je Zeile Sektionsname und die 5 Belegungen, Vocoder grün). Die zuletzt bewegte Wahl ist aktiv | MK1 |
| SYNTH/VOCODER-LEDs 1, 2 | ●1, ●2 | leuchtet = diese Wahl ist aktiv, beide = SPIEL; Synth-Programm rot, Vocoder-Programm grün (eK) | MK1 |
| EDIT CONTROLS 1–5 | Regler 1–5 | Kappen-Regler, senkrecht ziehen (Geste aus `sKnob`); feste Aufschrift = Spiel-Belegung, Belegung je Sektion in der Matrix-Zeile | MK1 |
| ORIGINAL VALUE LED | ORIG | leuchtet, wenn der Wert des zuletzt bewegten Reglers dem gespeicherten Wert des Sounds gleicht (Stand beim Laden bzw. Sichern); in SPIEL aus (HB-MK S. 3) | MK1 |
| Parameter-Matrix (aufgedruckt, oberer und unterer Block) | Matrix (Z13) | zwei Zeilen mit Sektionsname und den 5 Belegungen der Sektion, auf der EDIT-WAHL 1 bzw. 2 gerade steht; die Zeile der aktiven Wahl ist hell (Matrix-Zeile), die andere gedimmt, in SPIEL beide gedimmt; auf Ebene 2/3 steht „EB2“/„EB3“ vor dem Sektionsnamen. Tipp auf die Matrix-Zeile öffnet die Zusatz-Ansicht ihrer Sektion, wenn es eine gibt (die Zeile trägt dann „SCHRITTE ▸“, „16 BÄNDER ▸“ bzw. „EIGENE ▸“), sonst ohne Wirkung; Trefferfläche = die ganze Zeile (≥ 220 × 44) | MK1 |
| Display (3 Stellen) | Anzeige | 3 Stellen 7-Segment (eigene Zeichnung): Wert (−63…127, Listen als Kurzwort ≤ 3 Zeichen), 1 s nach der Geste wieder die Programmnummer „A.24“ | MK1 |
| WRITE | WRITE | = Sichern (vorhandener Weg) | MK1 |
| SHIFT | SHIFT | Tipp: leuchtet; die Regler 1–5 stehen auf **Ebene 2** (zweiter Tipp: Ebene 3, SHIFT blinkt, nur wo es sie gibt), die Nummern- und anderen Tasten haben ihre SHIFT-Funktion. Nächster Tipp, Sektionswechsel oder ausgeführte Tasten-Funktion: aus | MK1 |
| TIMBRE SELECT / FORMANT HOLD mit LEDs 1, 2 | TIMBRE | Synth: Tipp T1 → T2 → beide (Edit Sync, beide LEDs) → T1; SHIFT + TIMBRE = Solo des gewählten Timbres (LED blinkt), Tipp beendet Solo (HB-MK S. 14; das Halten 2 s des Originals ersetzt der dritte Tipp, L4). Vocoder: Formant halten (LED 1) | MK3, MK7 |
| ARPEGGIATOR ON/OFF, TEMPO-LED | ARP | Arp an/aus (LED); die Tempo-LED blinkt im Song-Tempo | MK5 |
| OCTAVE SHIFT DOWN/UP mit LEDs | OKT ▼, OKT ▲ | `tr.kbOct` ±1 (1…7; 4 = Mitte, also ±3 wie am Gerät); die LED der Richtung leuchtet, solange verschoben. SHIFT + OKT ▲/▼ = Wert des zuletzt bewegten Reglers ±1 | MK1 |
| AUDIO IN 1/2-LEDs | E1, E2 | leuchten bei Signal am Eingang, rot bei Übersteuerung | MK7 |
| PITCH-Rad, MOD-Rad | BEND, MOD | Touch-Räder links der Tasten (unten) | MK1 |
| Holzseiten | Holzwangen | CSS-Verlauf, keine Bild-Datei | MK1 |

**Drehschalter-Stellungen** (Reihenfolge wie am Original; Synth │ *Vocoder*; Stellungen, deren Paket noch fehlt, sind dunkel mit „–“, ihre Plätze bleiben):

| Stellung | EDIT-WAHL 1 | EDIT-WAHL 2 |
|---|---|---|
| 1 | STIMME │ *STIMME* | PATCH 1 │ *K-PEGEL A* |
| 2 | TONH. │ *TONH.* | PATCH 2 │ *K-PEGEL B* |
| 3 | OSZ 1 │ *OSZ 1* | PATCH 3 │ *K-PAN A* |
| 4 | OSZ 2 │ *EING. 1* | PATCH 4 │ *K-PAN B* |
| 5 | MIXER │ *MIXER* | MOD-FX │ *MOD-FX* |
| 6 | FILTER │ *FILTER* | DELAY │ *DELAY* |
| 7 | F-HK │ *FC-MOD* | EQ │ *EQ* |
| 8 | AMP │ *AMP* | ARP A │ *ARP A* |
| 9 | A-HK │ *A-HK* | ARP B │ *ARP B* |
| 10 | LFO 1 │ *LFO 1* | STIMMUNG │ *STIMMUNG* (am Original GLOBAL) |
| 11 | LFO 2 │ *LFO 2* | SEQ │ *–* (am Original MIDI; im Vocoder kein Seq, HB-MS S. 49–52) |

**Regler-Belegung.** Ebene 1 ist genau die Belegung des Originals (Parameter-Liste HB-MK PDF 78; „–“ = am Original leer). Was der MS2000 und die RADIAS-Teile zusätzlich haben, liegt auf **Ebene 2** (SHIFT) bzw. **Ebene 3** (SHIFT zweimal). Die Reihenfolge der MS2000-Werte folgt HB-MS.

| Sektion | Ebene 1: Regler 1 · 2 · 3 · 4 · 5 | Ebene 2 (bzw. 3) | Quelle |
|---|---|---|---|
| SPIEL | CUTOFF · RESONANZ · ATTACK · RELEASE · TEMPO (Vocoder: CUTOFF/RESONANZ der Träger-Bänder, ATTACK/RELEASE nur EG2) | – | HB-MK S. 8–10 |
| STIMME | SYNTH/VOC. (Synth │ Vocoder, MK7) · EINZELN/SCHICHT (Single │ Layer │ Split; Layer und Split ab MK3) · ZUWEISUNG · AUSLÖSUNG · UNI-VERST. | PRIORITÄT · STIMMEN (1+3 │ 2+2 │ 3+1, MK3) · SPLIT (MK3; dazu [Split ← nächste Note] in der LCD-Zeile) · STIMMEN-ZAHL (MK13) · – | HB-MS S. 34–36; HB-MK S. 16 |
| TONH. | TRANSP. · FEIN · PORTAM. · BEND · VIBRATO | MOD-RAD (Startwert `p.mw`) · – | S. 36; HB-MK S. 17 |
| OSZ 1 | WELLE · STEUER 1 · STEUER 2 · – · – (die LCD-Zeile nennt die Bedeutung je Welle: Säge FORM/WFM · Puls BREITE/PWM · Dreieck FORM/WFM · Sinus× X-MOD/X-LFO · Stimmwelle FORM/WFM · Speicherwelle –/WELLE · Rauschen CUTOFF/RESO. · Eingang BALANCE/BAL-LFO; im Vocoder Sinus FORM/WFM, W-27b) | – | S. 36–38, S. 49; HB-MK S. 18–21 |
| OSZ 2 | WELLE · MOD (aus │ Ring │ Sync │ Ring+Sync) · HALBTON · FEIN · – | – | S. 38; HB-MK S. 22 |
| EING. 1 (Vocoder) | GATE · SCHWELLE · HPF-PEGEL · HPF-GATE · – | QUELLE 2 ▾ (MK7) | S. 49; HB-MK S. 33 |
| MIXER | OSZ 1 · OSZ 2 · RAUSCHEN · – · – (Vocoder: OSZ 1 · EINGANG 1 · RAUSCHEN) | Synth: DRIVE-TYP · DRIVE · ROUTING · F-BALANCE · – (MK11); Vocoder: QUELLE 1 ▾ (MK7) | S. 38, S. 50; HB-MK S. 23, S. 34 |
| FILTER | TYP · CUTOFF · RESONANZ · HK-INT · KEYTRACK (Vocoder: FORMANT · CUTOFF · RESONANZ · FOLGER (127 = HALTEN) · –) | Synth: ANSCHLAG · F2-TYP · F2-CUTOFF · F2-RESO. · F2-HK-INT (F2 ab MK11); **Ebene 3** (MK11/MK12): F2-KEYTR. · F2-ANSCHL. · F2-HK (EG1 │ EG3) · – · – | S. 39, S. 50; HB-MK S. 24–25, S. 35 |
| F-HK | ATTACK · DECAY · SUSTAIN · RELEASE · NEUSTART | HK 3: ATTACK · DECAY · SUSTAIN · RELEASE · NEUSTART (MK12) | S. 40–41; HB-MK S. 26 |
| FC-MOD (Vocoder) | QUELLE · INTENSITÄT · – · – · – | F-HK (MS2000-EG1): ATTACK · DECAY · SUSTAIN · RELEASE · NEUSTART | S. 50; HB-MK S. 36 |
| AMP | PEGEL · PAN · VERZERR. · KEYTRACK · – (Vocoder: PEGEL · DIREKT · VERZERR. · KEYTRACK) | HK │ GATE · ANSCHLAG (Vocoder: ANSCHLAG) | S. 40, S. 50–51; HB-MK S. 27, S. 37 |
| A-HK | ATTACK · DECAY · SUSTAIN · RELEASE · NEUSTART | – | S. 40–41; HB-MK S. 28 |
| LFO 1, LFO 2 | WELLE · KEY SYNC (aus │ Timbre │ Stimme) · TEMPO SYNC · FREQ │ NOTE · – | – | S. 41; HB-MK S. 29 |
| PATCH 1–4 | QUELLE · ZIEL · INTENSITÄT · – · – | – | S. 42; HB-MK S. 30 |
| K-PEGEL A/B, K-PAN A/B (Vocoder) | Kanal 1–4 bzw. 5–8 · – (Kanal k = Bänder 2k−1 und 2k; ein Zug verschiebt beide Bänder um dasselbe Δ, je geklemmt, wie ATTACK/RELEASE in SPIEL) | Zusatz-Ansicht „16 BÄNDER ▸“ | S. 51; HB-MK S. 38 |
| MOD-FX | TYP · TEMPO · TIEFE · – · – | – | S. 44; HB-MK S. 40 |
| DELAY | TYP · TEMPO SYNC · ZEIT │ NOTE · TIEFE · – | – | S. 44; HB-MK S. 41 |
| EQ | TIEF-FREQ · TIEF-GAIN · HOCH-FREQ · HOCH-GAIN · – | – | S. 44–45; HB-MK S. 42 |
| ARP A | TEMPO (Song) · AUFLÖSUNG · GATE · TYP · OKTAVEN | – | S. 45–46; HB-MK S. 44 |
| ARP B | LATCH · SWING · KEY SYNC · LÄNGE (letzter Schritt) · ZIEL | – | HB-MK S. 45 |
| STIMMUNG | STIMMUNG · GRUNDTON · – · – · – | Zusatz-Ansicht „EIGENE ▸“ (bei STIMMUNG = Eigene) | HB-MS S. 34–35 |
| SEQ | SEQ AN · SEQUENZ (1 │ 2 │ 3) · ZIEL · BEWEGUNG (Glatt │ Stufe) · LÄNGE | TYP · LAUF · KEY SYNC · AUFLÖSUNG · –; Zusatz-Ansicht „SCHRITTE ▸“ | HB-MS S. 42–44 |

**SHIFT-Funktionen der Tasten** (wie am Original, HB-MK PDF 78; was es in der App nicht gibt, bleibt dunkel). Solange SHIFT leuchtet, tragen die Tasten ihre SHIFT-Kurznamen als zweite Zeile auf der Taste, und die Programm-Zeile (Z9) zeigt „SHIFT“:

| Taste | Synth | Vocoder | am Original |
|---|---|---|---|
| SHIFT + 1 | Timbre kopieren ▸ (Quelle aus der Bibliothek, MK3) | Pegel zurücksetzen (MK7) | COPY TIMBRE │ INIT LEVEL |
| SHIFT + 2 | Timbre tauschen (MK3) | Pan zurücksetzen (MK7) | SWAP TIMBRE │ INIT PAN |
| SHIFT + 3 | Init (INIT MS 2000) | Init, behält den Vocoder (`mode` 3) | INIT PROGRAM |
| SHIFT + 4 | Timbre neu (MK3; MS2000 InitTimbre) | – | MIDI FILTER (entfällt) |
| SHIFT + 5 | Sequenz-Werkzeuge ▸ (MK6) | – | CONTROL CHANGE (entfällt) |
| SHIFT + 6 … 8 | – | – | DUMP, PRELOAD, WRITE PROTECT (entfallen) |
| SHIFT + TIMBRE | Solo (MK3) | – | TIMBRE SOLO |
| SHIFT + SEITE | andere EDIT-WAHL | ebenso | SWITCH EDIT SELECT |
| SHIFT + OKT ▲/▼ | Wert ±1 | ebenso | INC/DEC PARAM VALUE |
| SHIFT + ARP | – | – | DEMO (entfällt) |

**Zusatz-Ansichten** (MS2000-Teile ohne Platz am Original): **SCHRITTE** (SEQ, MK6), **16 BÄNDER** (K-PEGEL/K-PAN, MK7), **EIGENE** (Stimmung, MK3). Sie öffnen mit einem Tipp auf die Matrix-Zeile ihrer Sektion (Bedienelemente, Matrix) und ersetzen den Bedienfeld-Körper in voller `.pg`-Breite, ohne Holzwangen; Rahmen und Räder bleiben, oben steht [◂ GERÄT] (44 px). Säulen: P1 2 × 8 à 41 × 88 (4 px, 356 px), P2 2 × 8 à 39 × 88 (4 px, 340 px), P3 2 × 8 à 36 × 88 als ein Canvas-Feld ohne Zwischenraum (288 px), L1 16 × 41 × 90 (3 px, 701 px; Kopfreihe 44 + 2 + 90 = 136 px), L2 und Halb-Ansicht quer 16 × 36 × 74 (3 px, 621 px; 44 + 2 + 74 = 120 px). EIGENE: 12 Regler (P1 2 × 6 à 60 ohne Abstand, L1 12 × 56 mit 3 px = 705 px, L2 12 × 50 mit 3 px = 633 px).

**Räder** (H-5, entschieden; B.1 „Räder“, W-17, W-18):
- **Platz:** links in der Tastatur-Zeile (`#kbArea`), BEND links, MOD rechts daneben, je ≥ 44 px breit (sichtbares Rad 32 px in einer Mulde), 4 px Abstand, volle Höhe der Tastatur-Zeile. Nur solange die gewählte Spur eine AM-Spur ist; bei allen anderen Engines bleibt die Tastatur unverändert (Layout deep-equal). Die Tastatur wird bei AM um ≈ 96 px schmaler.
- **Bedienung:** senkrecht ziehen, voller Weg = Radhöhe − 8 px. BEND federt beim Loslassen in 80 ms zur Mitte, die Mittel-Rast ist sichtbar; MOD bleibt stehen. Jedes Rad hat seinen eigenen Zeiger (`setPointerCapture`), Rad und Tasten gehen gleichzeitig; ein zweiter Finger auf demselben Rad wird ignoriert.
- **Wirkung** live, nicht gespeichert, kein Undo. Während des Zugs zeigt die Anzeige den Wert (BEND −63…+63, MOD 0…127). Die Rillen-Optik (CSS) wandert mit dem Wert. Die Aufnahme ● zeichnet die Räder nicht auf (Lücke in CHANGES).

**Aussehen und Material** (eK, geprüft in MK1-32):
- Bedienfeld dunkles Anthrazit mit feinem Verlauf (mittlere Helligkeit L* ≤ 20), matt.
- Holzwangen warmes Braun mit Maserung aus wiederholten Verläufen (Farbton 15–40°, Sättigung 35–75 %, Helligkeit 20–45 %), in L1 und W 10 px breit, in L2 und der Halb-Ansicht quer 6 px, in P 4 px; der Rahmen der Räder nimmt den Holzton auf.
- Regler: schwarze Kappen (L* ≤ 15) mit heller Zeigerlinie. Drehschalter mit einem Skalenstrich je Stellung und Zeiger; ◎ setzt einen Punkt an jede Stellung, deren Werte von INIT abweichen.
- Tasten: dunkle, flache Rechtecke mit LED (an Rot/Orange, Farbton 0–35°; aus dunkel).
- Beschriftung hell (Kontrast ≥ 4,5 : 1 zum Feld), Großbuchstaben in der App-Schrift; Vocoder-Beschriftung grün (Farbton 100–150°).
- Anzeige: 3 Stellen 7-Segment, Rot auf Schwarz (eigene Zeichnung, CSS/SVG).
- Keine neue Schrift (`@font-face`), keine Bild-Daten (`data:image`, `<img>`) im Bedienfeld, keine Logo-Fläche (B.6 Nr. 9 c).

**Maße und Formate.** Alle Maße gelten für den Inhalt des Seitenrahmens `.pg` der Synth-Blätter (`.sh-body` 8 px, `.pg` 6 px + 1 px Rand je Seite; Z. 1981–1982, 2201–2202), nicht für den Bildschirm. **Breite:** P1 360 px, P2 345, P3 290, L1 814, L2 637. Im Querformat nimmt die Safe-Area am iPhone noch ≈ 47 px je Seite (`viewport-fit=cover`, Z. 5, 58–59): L1 hat am iPhone 12/13 (844 × 390) real ≈ 720 px, am 12 Pro Max (926 × 428) ≈ 802 px. **Höhe des Körpers** (Raster `#app.sheet-open` Z. 72–85, Kopf 40 + Leiste 34 px quer, Z. 1426–1441): L1 ≈ 141 px (N1 misst `.pg` außen 150 px), L2 ≈ 126 px (N1: 135 px), 12 Pro Max quer ≈ 179 px. Der untere Safe-Area-Rand (Home-Balken, quer ≈ 21 px) nimmt davon noch einmal so viel: iPhone 12/13 quer ≈ 120 px, 12 Pro Max quer ≈ 158 px. Hochformat mit Safe-Area: P1 ≈ 300 px, P2 ≈ 231, P3 ≈ 203.
- **Bänder:** Jedes Format baut das Bedienfeld aus Bändern à 44 px (2 px Abstand). Regler, Drehschalter und Tasten haben je eine Trefferfläche von mindestens 44 × 44; die Beschriftung (9-px-Klasse `.lg`) steht oben in der Trefferfläche, das Bild darunter (Kappe 32 px, Drehschalter 36 px, Taste 40 × 30).
- **L1 (Bezug 844 × 390): das ganze Bedienfeld in einem Stück** nach der Zonen-Tabelle (Körper 720 × 136 px, drei Bänder). Breiter (12 Pro Max ≈ 802 px, Körper ≥ 158 px): gleichmäßig skaliert bis × 1,1 (792 × 150 px; Trefferflächen wachsen mit), Rest zentriert.
- **Halb-Ansicht quer** (L2 immer; L1, wenn der Körper < 136 px ist, z. B. iPhone 12/13 mit Home-Balken): eine Hälfte auf einmal, umgeschaltet über die Reiter [LINKS] [RECHTS] (B.3 Rahmen), zwei Bänder (90 px), Holzwangen 6 px. LINKS: Band 1 = Z1, Z2, Z4, Z5, Z6, Z7, Z8 nebeneinander (L2 ≈ 408 px); Band 2 = Z3, Z10, Z9 (92 + 352 + Rest). RECHTS: Band 1 = TIMBRE, EDIT-WAHL 1 mit ●1, ORIGINAL-LED, Regler 1–5 (L2 je 48, L1 je 56; Abstand 4); Band 2 = SHIFT (unter TIMBRE), EDIT-WAHL 2 mit ●2 (unter EDIT-WAHL 1) und unter den Reglern nur die Matrix-Zeile der aktiven Wahl (44 px hoch).
- **P1 (Bezug 390 × 844, 360 px, Körper ≈ 300 px): zwei Hälften übereinander**, je drei Bänder, Holzwangen 4 px (innen 352 px), Trenner 8 px:
  - Hälfte A = linker und mittlerer Teil des Geräts: Band 1 = Z1, Z2, Z4, Z5, Z6, Z7 (Anzeige 56) = 272 px; Band 2 = Z3, Z9, Z8 = 352 px; Band 3 = Z10 (8 × 44, Bild 40) = 352 px.
  - Hälfte B = rechter Teil: Spalte Z11 (62 px: TIMBRE, EDIT-WAHL 1, EDIT-WAHL 2), daneben in Band 1 ORIGINAL-LED und Regler 1–5 à 50 (Abstand 2) = 336 px, in Band 2 und 3 die zwei Matrix-Zeilen unter den Reglern.
  - Höhe 136 + 8 + 136 = 280 px. Breiter (12 Pro Max hochkant ≈ 398 px, Körper ≈ 380 px): gleichmäßig skaliert bis × 1,1 (≈ 308 px hoch), Rest zentriert.
- **Halb-Ansicht hoch** (P2 und P3 immer; P1, wenn der Körper < 280 px ist, z. B. bei eingeblendeten Safari-Leisten; das iPhone mini hat mit 375 px die P2-Breite): eine Hälfte auf einmal über die Reiter [LINKS] [RECHTS]. Nummerntasten 2 Reihen × 4 (P2 à 80 × 44 mit 4 px, P3 à 68 × 44 mit 3 px), Hälfte A also 4 Bänder = 182 px; Hälfte B bekommt ein 4. Band mit SHIFT (unter EDIT-WAHL 2), 182 px. P2: Band 1 von A mit BANK 48 und Anzeige 52 (264 px), Regler à 48 (Abstand 2). P3 (innen 282 px): Band 1 von A = Z1, Z2, BANK 48, Z5, LEDs 10, Anzeige 48 (258 px), Band 2 = Z3, Z9 (90), Z8 (282 px); Spalte Z11 52 px (Drehschalter 44 + LED 8; ORIGINAL-LED neben TIMBRE), Regler 5 × 44 ohne Abstand (220 px) → 276 px.
- **Umschalten der Hälften:** Die gewählte Hälfte ist Ansichtszustand (Vorgabe RECHTS, dort liegen Drehschalter, Regler und SHIFT). EDIT-WAHL und Regler liegen in derselben Hälfte, darum springt beim Bearbeiten nichts. SHIFT ist in der Halb-Ansicht in beiden Hälften zu sehen (eine Taste, ein Zustand).
- **W (844 × 1180):** das ganze Bedienfeld in einem Stück wie L1 (× ≤ 1,13 → 814 px).
- Kein Zoom (Doppeltipp-Zoom und Pinch bleiben aus), keine Seite scrollt. **Trefferflächen ≥ 44 × 44 px in allen Formaten** (Regler, Drehschalter, Tasten, Räder, Chips, Matrix-Zeilen, Listenzeilen); die Trefferfläche darf größer sein als das Bild (`::after`), Trefferflächen überlappen nicht. Die Reiter folgen dem Blattrahmen (B.3 Rahmen).
- **Beschriftung:** Die Plätze sind meist 44–56 px breit; dort stehen Kurzformen (RESO., KEYTR., F2-RESO., K-PEG) oder die 9-px-Klasse `.lg` bzw. zwei Zeilen (`.mixk`, Z. 2012). M-PLATZ prüft für jedes Element scrollWidth ≤ clientWidth (L6, nichts abgeschnitten).
- Drehschalter-Stellungen, SHIFT-Ebene und Halb-Ansicht sind Ansichtszustand (`viewState`), nicht Teil des Sounds.

**Regler-Verhalten:**
- Jeder Regler zieht senkrecht (Geste aus `sKnob`). Stufenwerte rasten ein. **Listen mit mehr als 12 Einträgen** (64 Speicherwellen, ≈ 30 SEQ-Ziele) sind stetige Regler mit Rundung (200 px Weg, `haptic('tick')` und LCD je Stufe), dazu die Tipp-Liste; die App verlangt sonst je Stufe ≥ 18 px Weg (Z. 19979), bei 64 Wellen 1134 px.
- **Tipp auf einen Listen-Regler** öffnet eine Auswahl (`openPop`, Zeilen ≥ 44 px). Das gilt für WELLE, TYP, SYNTH/VOC., EINZELN/SCHICHT, QUELLE, ZIEL und STIMMUNG.
- Die LCD-Zeile zeigt Sektion, Name, Geräte-Wert und Klartext, z. B. „FILTER · CUTOFF 064 · 652 Hz“ oder „OSZ 1 · STEUER 2 (WELLE) Speicherwelle 12 ≈“; die Anzeige zeigt den Geräte-Wert.
- Eine Geste = ein Undo. Während der Geste geht der ungerundete Wert an das Worklet, gerundet wird beim Abschluss (EN3-03). Halten hat im AM-Bedienfeld keine eigene Bedeutung bis V5d (EN3-18, L4).
- Bearbeitet wird immer das gewählte Timbre. Die LCD zeigt „T2“, wenn T2 gewählt ist. Mit Edit Sync (TIMBRE, beide LEDs; MK3, H-11) gehen Gesten an beide Timbres; Anzeige und Startwert kommen von T1.

**Kopf-Knöpfe:**
- 🎲 würfelt die Werte der EDIT-WAHL-1-Sektionen von T1 (Wellen, STEUER 1/2, OSZ2-Halbton aus {0, +7, +12, −12}, Mixer, Filter, Hüllkurven). Danach gilt: Mixer OSZ 1 oder OSZ 2 ≥ 64 und Sustain + Decay hörbar. FX, Arp, Seq und Vocoder werden nicht gewürfelt.
- ◎ setzt einen Punkt an jede Drehschalter-Stellung und in jede Zeile der Auswahl-Liste, deren Werte von INIT AM abweichen.
- ⋯ → Init (wie SHIFT + 3) lädt INIT AM; im Vocoder-Modus INIT AM mit `mode` 3 (Vocoder-Vorgaben, HB-MS S. 51).

Jede neue Bedienfläche bekommt eine Hilfe-Zeile (Menü → Hilfe) und beim ersten Antippen einen LCD-Hinweis (L10). Die Texte sind eigene Sätze ohne Marken; den Engine-Namen setzen sie aus `MK_LABEL` ein.

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
- **WebGL:** keiner (EN3-13). Canvas 2D für Seq-Säulen, Band-Pegel und die Pegelanzeige der Aufnahme-Seite, gezeichnet ≤ 30 Hz und nur bei sichtbarer Seite. Das Bedienfeld (B.3) ist DOM mit CSS ohne Bild-Dateien; LEDs und Anzeige ändern nur Klassen bzw. Text, höchstens einmal je Bild; die Tempo-LED schaltet per CSS-Klasse im Takt, nicht per Zeichnen. PE1 prüft das.
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

1. **Neutral und bitgleich (I-10):** Jedes neue Feld hat einen neutralen Wert. Vorhandene Klänge aller Engines und die AM-Klänge des Vorgänger-Pakets rendern bitgleich (Node-Offline, max |Δ| ≤ 1e-6), außer ein Paket nennt es anders. **„Vorgänger“** heißt in allen Abnahmen: der zuletzt ausgelieferte Stand, dessen Version CHANGES nennt, keine feste Nummer (Pakete können nach E.1/E.2 Nr. 4 rücken).
2. **Glätten und Blenden (L3):** Stetige Werte werden mit τ ≥ 5 ms geglättet. **Bruchwerte:** Während einer Geste geht der ungerundete Reglerwert an das Worklet (EN3-03); das Worklet rechnet Bruchteile über die W-Tabelle, SEQ „Glatt“ und die Patches ebenso. Strukturwechsel bei klingender Note gehen über die vorhandene **30-ms-Stimmenblende (SXF)**: Welle, OSC MOD, Filtertyp, HK │ GATE, ROUTING. **Umverteilende Wechsel** (Zuweisung, Priorität, Auslösung, MODUS, STIMMEN, `vmax`) gehen über die **Engine-Blende `engXf`** (Z. 4104): alte Stimmen 40 ms als Geister ausblenden, gehaltene Tasten unter der neuen Regel neu verteilen, Einblendung über den Attack (≤ 0,5 s); SXF kann keine Stimmen neu verteilen (Z. 4046). **Abweichungen von L3** (ausdrücklich): (a) Mono ↔ Poly ist hier ein umverteilender Wechsel über `engXf`; L3 behandelt ihn sonst als Grundklang-Einstellung, die gehaltene Stimmen loslässt. (b) SEQ-Stufen: „Stufe“ = lineare 1-ms-Rampe ab der Blockgrenze (Amplitude, Pan, Cutoff). (c) Tabellen-Wellen wechseln mit 2-ms-Gleichleistungs-Blende bei phasenstetigem Lesen statt 30–50 ms. Jede Abnahme mit Umschalten prüft **M-KLICK und M-EINBRUCH** (bis Begrenzer-Stufe 1, B.4).
3. **Hörbarkeit:** Jeder Regler einer AM-Sektion erfüllt H-1 und H-3 (Spec §0.3). Die Ausnahmen sind benannt: BEND nur mit bewegtem BEND-Rad, TEMPO nur mit Sync/Arp/Seq, NEUSTART nur bei Neuanschlag, Werte ohne Wirkung in der gerade gewählten Welle.
4. **Undo:** eine Geste = ein Undo (`soundEdit`/`commitSound`). Laden eines Programms = ein Undo mit Toast [Rückgängig].
5. **Layout:** M-PLATZ in P1, P2, P3, L1, L2, W für jeden neuen Zustand (auch Halb-Ansicht, SHIFT-Ebenen und Zusatz-Ansichten), mit den Maßen vom `.pg`-Inhalt (B.3), dem Safe-Area-Durchgang für L1 (47 px links und rechts; dazu ein Durchgang 844 × 390 mit 21 px unterem Rand für den Home-Balken, in dem die Halb-Ansicht quer greift) und scrollWidth ≤ clientWidth für jede Beschriftung. M-ANSICHT: Ein Sektions-, Ebenen- oder Zustandswechsel verschiebt kein Bedienelement um mehr als 2 px. Treffer im AM-Bedienfeld und an den Rädern: **≥ 44 × 44 px in allen Formaten** (EN3-20; strenger als L4), ohne Überlappung. **M-SKIZZE** (neu, für jedes Paket mit Bedienfeld-Änderung): Die Zonen Z1–Z13, die Holzwangen HL/HR und die Räder werden über `mkPanel().zones` (Rechtecke im Bedienfeld-Körper) gegen die Zonen-Tabelle in B.3 geprüft: in L1 (844 × 390 und 926 × 428) je Zone Überdeckung (IoU) ≥ 0,7 der Anteile; in allen Formaten die Reihenfolge links → rechts und oben → unten wie in der Skizze (in P und in der Halb-Ansicht je Hälfte), die Räder links der ersten Taste. Die Bildschirmfotos aller Formate kommen in CHANGES (für Xanders Sicht-Abgleich). **Ab MK-P** ersetzt M-VORLAGE (MK-P-01, gegen die Lage-Tabelle aus HB-MS S. 5) die Zonen-Prüfung M-SKIZZE. Die Halb-Ansicht entfällt; an ihre Stelle treten Übersicht, Zoom-Felder und Spiel-Ansicht (MK-P-07).
6. **Oktav-Tabellen:** Für Wellen, deren Spektrum in Hz fest sein soll (Endlos, Gruppe 61–64, Aufnahmen aus MK10; die Stimmwelle wird live gerechnet, W-28), gibt es je Oktave (C1…C8) eine eigene Tabelle mit eigenen Mipmaps. Die Stimme blendet zwischen den zwei Nachbaroktaven nach der gespielten Tonhöhe (je Steuerblock, wie K2-40). Speicher je Welle ≤ 8 × Mipmap-Satz. Gebaut wird nur, was ein geladener Sound braucht.
7. **Worklet-ASCII** und Quelltext-Grenzen wie bisher (`check-worklet`).
8. **Geräte-Abgleich (EN3-16):** Jedes Paket nennt 3–6 Punkte, die Xander am eigenen microKORG nach Gehör vergleicht. Sein Ergebnis kommt mit Datum in CHANGES. Eine Änderung der W-Tabelle ist ein eigener kleiner Fix-Schritt (`MKn-fix`) mit Messwert vorher und nachher.
9. **Kein Markenwort, genau eine erlaubte Beschriftung** (EN3-05), in jedem MK-Paket:
   - (a) **AM-Teil** (Block `sq-mk-src`, Block `sq-mkrec-src`, AM-Zweig des Worklets zwischen den Marken `/*MK{*/` … `/*}MK*/`, AM-Hilfe- und LCD-Zeilen, AM-Werksnamen): `grep -ciE 'korg|micro ?korg|ms[ -]?2000|radias|dwgs|dw[ -]?[68]000|\bvox\b'` = 0. Der immer geladene Teil zählt mit, außer der einen Zeile mit `MK_LABEL`.
   - (b) **Ganze `index.html`:** `grep -ciE 'micro ?korg|radias|dwgs'` = 0. `grep -oiE 'ms[ -]?2000'` ergibt **genau 1** Treffer, und der ist wörtlich `MS 2000` (Großbuchstaben, U+0020) in der Zeile `MK_LABEL = 'MS 2000'`. Im laufenden DOM steht „MS 2000“ nur als Text von Engine-Knopf bzw. -Chip, `ENGINE_LABEL`-Ausgaben (Blattkopf, Browser, MIDI-Spurname), Bibliotheks-Filter und daraus gebildeten LCD-/Hilfe-Zeilen; das Bedienfeld selbst zeigt es bis MK-P nicht, ab MK-P genau einmal im Namensfeld (Text aus `MK_LABEL`, App-Schrift).
   - (c) **Kein Logo, keine Korg-Schrift:** Das Bedienfeld lädt keine neue Schrift (`@font-face` = 0 neue Einträge), enthält keine Bild-Daten (`data:image`, `<img>`) und keine Fläche, die einen Schriftzug nachbildet; FP-SICHER prüft die Bildschirmfotos aus M-SKIZZE (ab MK-P aus MK-P-02 und MK-P-07) zusätzlich mit dem Auge.
   - Trifft ein Base64-Datenblock (Nachzeichnung MK2, Werksdaten MK8, Speicherwellen MK10) zufällig ein Wort (≈ 4,6 % je 24 KB), ändert das Bau-Skript die Kodierung (ein Salz-Byte) und prüft neu. Datenblöcke werden nicht ausgenommen.
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
mkInfo(): {loaded: boolean, tables: number, tableBytes: number, blockMs: number, waves: 'platzhalter'|'lokal'|'eingebaut'}
mkWheel(t: number, w: 'bend'|'mod', v?: number): number   // setzt (Test) bzw. liest den Live-Wert des Rads; nicht gespeichert, kein Undo
mkPanel(): {fmt: string, half?: 'A'|'B'|'beide', sel: {wahl: 0|1|2, pos: number}, shift: 0|2|3, timbre: 1|2|'beide', solo?: 1|2,
            zones: {id: string, x: number, y: number, w: number, h: number}[]}   // Rechtecke relativ zum Bedienfeld-Körper (M-SKIZZE)
arpLog(t: number): {t: number, note: number, vel: number, dur: number, step: number}[]   // ab MK5
perfProbe(cases?: string[]): Promise<object>                                              // die Leistungs-Probe
mkRecInfo(): {step: number, steps: number, input: {label: string, ec: boolean, ns: boolean, agc: boolean, ch: number, sr: number},
             peakDb: number, rmsDb: number, notes: number, ok: boolean[]}                // Aufnahme-Seite, ab MK10
```

Ab MK-P liefert `mkPanel()` Ansicht, Felder, Modus, Seite und Elemente statt Zonen; dazu kommt `mkView(o)` (MK-P Umfang 6).

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

### MK1 — Klangkern (Timbre 1), Bedienfeld wie das Original, Räder, Leistungs-Probe

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
8. **Vokal-Quelle** (W-44: Glottis wie W-28 + F1–F4 als TPT-Resonatoren, Vokale a e i o u) als App-Code. MK8 rechnet daraus die `hold`-Spektren, MK12 macht daraus OSZ 1 Welle 8.
9. **Begrenzer Stufe 1:** Umschalten auf 2. Ordnung mit 30-ms-Überblendung und Pegelausgleich (B.4).
10. **ECO:** Ein Vocoder-Programm bleibt im ECO-Klang stumm, mit LCD-Hinweis (B.5).

**Nicht-Umfang.** Speichern des Modulators als Take (VS3). Vocoder für andere Engines (bleibt Spec §18, Teil G Nr. 11). Formant-Bewegung aufnehmen (RADIAS, nicht im Plan).

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

### MK8 — Werksklänge in acht Genre-Bänken

**Ziel.** Xander findet seine Klänge wie am microKORG nach Genre: acht Bänke mit je acht eigenen Klängen. Jeder Klang zeigt, was die Klangerzeugung kann (Arp, Seq, Vocoder, Split, Speicherwellen).

**Umfang.**
1. **64 Klänge** (H-3, entschieden: 64) auf Seite A, A.11…A.88. Bänke:
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
4. **Programm-Wahl wie am Original** (B.3): BANK-Drehschalter (8 Genres), SEITE (A │ B), Nummerntasten 1–8, Anzeige „A.24“. Ein Tipp lädt in die Spur, ein Undo, Toast [Rückgängig], danach SPIEL. ‹ › im Kopf blättert in der Bank.
5. **Bibliothek:** Engine-Filter „MS 2000“ plus Chip „Bank ▾“, ▶ Vorhören mit der vorhandenen Vorhör-Stimme, „INIT MS 2000“ unter „Init“.

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
  - Gemessen wird mit den Platzhalter-Wellen. Mit dem MK10-Einbau (H-2 = eingebaut) läuft MK8-04 mit den eingebauten Wellen erneut; wer dann eine Grenze verfehlt, wird im Einbau-Schritt nachgestimmt (MK10-11).
- [ ] **MK8-05 Merkmale** (Prüfskript zählt):
  - ≥ 8 Klänge mit Arp an (Bänke 1, 2, 3, 6 zusammen).
  - ≥ 4 mit Mod-Seq.
  - Alle 8 Vocoder-Klänge mit `hold`, DIREKT 0 und HPF-PEGEL ≤ 40.
  - ≥ 6 mit Speicherwellen (zeigen „≈“).
  - ≥ 4 mit Dual oder Split.
  - ≥ 4 mit Delay-Sync.
- [ ] **MK8-06 Keine Doppel:** Innerhalb jeder Bank unterscheiden sich alle Paare um ≥ 3 dB in mindestens einem relevanten M-BAND.
- [ ] **MK8-07 Bibliothek:** Der Filter „MS 2000“ + Bank n liefert genau die 8 Klänge. N0b-01 bleibt erfüllt. ▶ Vorhören funktioniert.
- [ ] **MK8-08 Größe und Zeit:** Die Werksdaten im Block sind ≤ 24 KB. Alle 64 entpacken in ≤ 20 ms (Xeon). Ein Tipp lädt in ≤ 50 ms ohne `longtask`. Die Startzeit ohne AM bleibt unverändert.
- [ ] **MK8-09 Oberfläche:** BANK-Drehschalter, SEITE, Nummerntasten und Bank-Liste: M-PLATZ in P1–P3, L1, L2, W, M-SKIZZE; die Nummerntaste des geladenen Programms leuchtet, Seite B lässt die LED von SEITE leuchten.
- [ ] **MK8-10 Regression und DoD**, Budget ≤ +40 KB.

**Tests.** `mk8-daten.mjs` (Namen, Herkunft, Merkmale), `mk8-pegel.mjs`, `mk8-ui.mjs`.

**Fach-Prüfung:** **FP-KLANG ●** Haupt-, **FP-TOUCH** Zweit-Blick.

**Zwischenstand** nach MK8 (EN3-17).

**iPhone:** BANK durchdrehen und jede Bank einmal mit den Nummerntasten durchtippen, einmal über den Lautsprecher, einmal mit Kopfhörer. Ausreißer melden (zu leise, zu laut, langweilig).

**Geräte-Abgleich:** Xander sagt je Bank, ob die Klangwelt zur Bank seines microKORG passt. Das ist ein Urteil über das Genre, kein Kopie-Vergleich.

**Risiken.** Nichts ist angehört. 64 Klänge sind viel Klangarbeit, deshalb zwei Bau-Abschnitte.

---
### MK9 — Import eigener .syx/.prg-Dateien (nur lokal) — zurückgestellt

**Status (25.10., Xander; EN3-21): zurückgestellt.** Xander hat keinen Rechner, kein Editor-Programm und keine .syx/.prg-Dateien; er arbeitet nur am iPhone und kennt MIDI nicht, und iOS Safari hat kein Web MIDI. Ohne Rechner und MIDI-Interface entstehen keine Dumps. MK9 steht deshalb **außerhalb der Versionsfolge** (E.1), wird nicht gebaut und hält kein anderes Paket auf. Der Text bleibt als Vorlage stehen. Wird MK9 später doch gebaut (nur auf Xanders Wunsch), bekommt es die nächste freie Zwischennummer, rüstet `mkLocalStrip` in alle dann vorhandenen Wege vom Gerät weg nach (EN3-08, EN3-19) und braucht vorher den Nachweis, dass der Weg ohne Rechner geht (zum Beispiel Dateien, die Xander am iPhone bekommt).

**Ziel.** Xander holt seine eigenen microKORG- und MS2000-Programme in die App. Sie bleiben auf seinem Gerät und gehen nie ins Netz.

**Tor MK9-T** (vor dem ersten Bau-Schritt in CHANGES protokolliert). Es gilt eines von beiden:
- (a) Am Bau-Ort liegt ein Formatbeleg für die Programmdaten von MS2000 und microKORG. Das ist das Korg-Dokument „MIDI Implementation“ mit der Program-Data-Tabelle und der 7-Bit-Paketierung. Es ist nicht Teil der Handbücher (HB-MS S. 64). Vorgabe der Rev. 1 (ruht mit dem Paket): Der Orchestrator holt das öffentliche Dokument und legt es privat neben die Handbücher (nur Fakten übernehmen, wie bei den Handbüchern).
- (b) Xander liefert **drei Test-Dumps** mit notierten Werten (Blatt D.7 der Rev. 1; entfällt in Rev. 2, weil es USB-MIDI und einen Rechner bräuchte, EN3-21). Dann wird die Zuordnung daran erarbeitet und geprüft. (b) reicht nur für die Felder, die die Test-Dumps abdecken. Die übrigen Felder bleiben bis (a) auf INIT, mit Hinweis.

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

**Dauer** 6–7 h (Rev. 1: +1 h; nicht in den Summen) · **Version** – (zurückgestellt; bei späterem Bau die nächste freie Zwischennummer) · **Budget** +27 KB (nicht in den Summen) · Format bleibt 5.

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

### MK10 — Speicherwellen: Aufnahme in der App und Einbau

**Ziel.** Die 64 nachgezeichneten Platzhalter aus MK2 werden durch Wellen ersetzt, die aus Xanders eigenen microKORG-Aufnahmen gewonnen sind, und **in die App eingebaut**, sodass alle sie hören, auch Freunde im Paar-Raum (H-2, Xander 25.10.). Xander nimmt **am iPhone direkt in der App** auf (microKORG → AG06 → iPhone, Teil D), ohne Rechner und ohne Dateien hin- und herzuschieben (EN3-21). Damit klingt die Klangerzeugung „original“ (KF §3–4).

**Warum MK10 trotz der Nachzeichnung nötig bleibt** (Prot. 57): Die Nachzeichnung stammt aus Bildern einer fremden Aufnahme (eine Note, 10 ms). Erst Xanders Aufnahmen geben (1) den genauen Klang, weil die Bezugs-Säge die Aufnahmekette herausrechnet; (2) die oberen Teiltöne bis N = min(64, Nyquist/f₀) statt des geschätzten Abfalls über Teilton 32; (3) das Verhalten je Oktave statt einer einzigen Note; (4) die Pegel zwischen den Wellen statt Spitze 1 je Welle; (5) die Tonlage r von 3, 28, 34, 35 und 59 und eine echte Periode für 60.

**Zwei Bau-Abschnitte:**
- **Abschnitt 1 (4.17.0):** Aufnahme-Seite, Ersatzweg über Dateien, Analyse, sofort hörbar auf Xanders Gerät, Wellen-Paket für den Bau. Kein Tor (H-2 ist entschieden).
- **Abschnitt 2 (Einbau):** Das Wellen-Paket wird ein Datenblock in der App. Version: die nächste freie Zwischennummer beim Bau (z. B. 4.17.1, sonst nach dem zuletzt gebauten Paket; EN2-14). **Tor MK10-T:** Das Wellen-Paket aus Abschnitt 1 liegt am Bau-Ort, sein Güte-Bericht hat keine rote Zeile.

**Umfang Abschnitt 1.**
1. **Seite „Wellen aufnehmen“** (Menü → Sounds; Block `sq-mkrec-src`, EN3-14). Nur auf Pages in Safari: In der Claude-App gibt es kein Mikrofon (EN2-06); dort zeigt die Seite nur den Ersatzweg [Dateien laden] und den Hinweis „Aufnehmen geht in Safari“.
   - **Eingang:** über den gemeinsamen Mikrofon-Abgriff aus MK7, nur nach Tipp. Die Seite fordert `MIC_ASK` (Z. 29401: Echo-Unterdrückung, Rauschunterdrückung und AGC aus) plus `channelCount: 2` und die `deviceId` des USB-Geräts an, also `getUserMedia({audio: {deviceId, echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 2}})`; hält ein anderer Nutzer (🎤, Vocoder) den Abgriff mit anderen Vorgaben, wird er für die Seite neu geöffnet und danach wiederhergestellt. Der Abgriff reicht beide Kanäle getrennt weiter (kein Abmischen auf mono). Ist ein USB-Gerät angeschlossen, nimmt iOS es als Eingang; die Seite zeigt den Gerätenamen aus `enumerateDevices` (nach der Freigabe; das AG06 meldet sich als USB-Audiogerät) und die Werte aus `getSettings()`. Meldet `getSettings()` eine der drei Verarbeitungen als an, zeigt die Seite rot „Sprach-Filter aktiv – so nicht aufnehmen“ und nimmt nicht auf.
   - **Kanal:** Kommen 2 Kanäle, nimmt die Seite den Kanal mit Signal (AG06 mit TO PC = DRY CH 1-2: Kanal 1 links, Kanal 2 rechts); kommt 1 Kanal, diesen.
   - **Die Seite spielt nichts:** Solange sie offen ist, steht der Transport, alle Spuren schweigen, und am Ausgang hängt nur ein 0-Gain-Halter (kein Echo, keine Rückkopplung). Mithören geht über den Kopfhörer am AG06 (Teil D).
   - **Geführter Ablauf, 67 Schritte in fester Reihenfolge** (Liste in Teil D.3): Pegel-Test (C4, 2 s), Bezugs-Säge, Speicherwelle 1 … 64, Stille (10 s). Je Schritt zeigt die Seite in großer Schrift, was am Gerät einzustellen ist (z. B. „OSC1 WAVE: 6. Stellung (Speicherwellen)“, „OSC1 CONTROL 2 auf 12“, „OCTAVE SHIFT −2“), und [● Aufnehmen] (≥ 88 × 44). Die Hinweise sind eigene Sätze ohne Marken- und Gerätenamen (B.6 Nr. 9 a/b): „am Gerät“ statt des Gerätenamens, die Wellen-Stellung von OSC1 WAVE als „6. Stellung (Speicherwellen)“, nie mit ihrem Namen am Gerät (Teil D.3 nennt ihn Xander). In den Wellen-Schritten (2–66) erkennt die Seite die 7 Töne selbst (Einsatz-Erkennung) und stoppt 1 s nach dem 7. Ton von selbst; der Pegel-Test braucht einen Ton, die Stille läuft 10 s nach Uhr ([■] jederzeit). Danach schneidet sie die Stille vorn und hinten ab, teilt in die Töne, analysiert sofort und zeigt ✓ oder den Grund („zu leise“, „übersteuert“, „nur 6 Töne erkannt“, „Ton zu kurz“) mit [Nochmal]. [Weiter] geht zum nächsten Schritt; die Schritt-Liste erlaubt jede Wiederholung.
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
5. **Wellen-Paket für den Bau:** [Wellen an den Bau geben] baut `mkwaves-paket.json` (nur Analyse-Ergebnisse: Teiltonpegel und Phasen je Welle und Oktave, Güte, Datum, App-Version, Prüfsumme; **kein Roh-Audio**, ≤ 200 KB) und öffnet das iOS-Teilen-Blatt (`navigator.share({files})`; ohne Teilen-Blatt ein Download nach „Dateien“). Xander gibt die Datei auf dem Weg nach **H-15** weiter. Kein Rechner nötig.
6. **Bericht** je Welle: Güte (Stabilität der Periode, Klirr der Mittelung, Clipping, Rauschabstand gegen die Stille-Aufnahme) und die Pegel-Abweichung von ihrem Platzhalter. Dazu die Abweichung von der Nachzeichnung (M-BAND, Teiltöne 1–16) und das gemessene r, gelb, wenn es vom MK2-Wert abweicht.

**Umfang Abschnitt 2 (Einbau).**
7. **Bau-Skript `mk10-einbau.mjs`** (Node) liest das Paket, prüft Prüfsumme, Vollständigkeit (Bezug und 64 Wellen, jede aufgenommene Oktave) und Güte und schreibt einen kompakten **Datenblock** (Teiltonpegel als Bytes je Oktave, Phasen als 6 Bit, Base64) in `sq-mk-src`, ≤ 45 KB. Der Datenblock der Nachzeichnung aus MK2 fällt dabei weg (≈ −8,6 KB, netto ≈ +36 KB). Gleiches Paket ergibt einen bitgleichen Block. Trifft der Block ein Markenwort, ändert das Skript das Salz-Byte (B.6 Nr. 9). Das Paket liegt privat am Bau-Ort (neben den Handbüchern), nie im Repo; Roh-Aufnahmen gibt es dort nicht.
8. **Alle hören die Wellen:** Die Engine nimmt die eingebauten Wellen statt der Platzhalter, auf jedem Gerät und im Paar-Raum; das „≈“ verschwindet überall (`mkInfo().waves === 'eingebaut'`). Eine spätere lokale Neu-Aufnahme bleibt auf Xanders Gerät eine Wahl [Eigene Aufnahme │ Eingebaut].
9. **Pegel:** MK8-04 läuft mit den eingebauten Wellen erneut; Ausreißer werden im Einbau-Schritt nachgestimmt.

**Nicht-Umfang.** Aufnahmen anderer Gerätewellen. Eich-Kurven für Filter und Hüllkurven (H-6 = nein). Ein eigener Upload-Weg der App für das Paket (die Übergabe läuft über das iOS-Teilen-Blatt). [Wellen exportieren]/[Wellen importieren] zwischen Speicher-Ursprüngen (Rev. 1; entfällt, weil die Wellen eingebaut werden).

**Berührungspunkte.**
- **Wiederverwendet:** gemeinsamer Mikrofon-Abgriff aus MK7 mit `MIC_ASK`, Oktav-Tabellen und Mipmaps (MK2, `mkTables`), Datei-Wahl, eigene IndexedDB-Datenbank nach dem Muster `synq-miccheck`, Fake-Supabase-Gerüst (`online.md` §7.7, `__synqFakeSupa`, WebSocket-Mitschnitt), Salz-Byte-Regel (MK8).
- **Neu:** Aufnahme-Seite mit geführtem Ablauf, Einsatz-Erkennung und Zuschnitt, Pegel-Anzeige, WAV-Lesen (PCM 16/24 Bit und 32-Bit-Float, 44,1/48 kHz, mono/stereo), AIFF-Lesen, Kanalwahl, Teilen an der Stille, Testdatei-Prüfung, Analyse, Datenbank `synq-mkwaves`, Wellen-Paket mit Teilen-Blatt, Einbau-Skript, Datenblock. V9d nutzt WAV-Leser und lokalen Speicher später mit (Teil G Nr. 12).

**Dauer** 10,5–12 h (Rev. 1: 6,5–7,5 h für Einlesen und Analyse; Rev. 2: +3–3,5 h Aufnahme-Seite, +1,5 h Einbau mit Pegel-Nachlauf, −0,5 h ohne Export/Import zwischen Ursprüngen) · **Version** Abschnitt 1 **4.17.0**, Abschnitt 2 die nächste freie Zwischennummer · **Budget** +80 KB (Abschnitt 1: +35 KB Code, Abschnitt 2: +45 KB Datenblock) · Format bleibt 5.

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
- [ ] **MK10-10 Datenbank getrennt:** Nach dem Einlesen öffnet ein Tab des Vorgänger-Stands (4.16.0 oder der zuletzt ausgelieferte) Projekt und Bibliothek aus IndexedDB: kein localStorage-Rückfall, kein `versionchange`, alles intakt.
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

**Geräte-Abgleich:** Einzelne Speicherwellen in der App gegen dieselbe Welle am microKORG (C2, C4, C6).

**Risiken.** **Lizenz:** Die Wellen sind Daten aus Xanders Korg-Gerät; die Lizenz ist ungeklärt. Xander weiß das und hat „eingebaut“ gewählt (H-2). Dieselbe offene Lage gilt schon für die Nachzeichnung in MK2 (nur gerechnete Werte, keine Bilder). Ein Risiko entstünde vor allem, wenn die App verkauft würde; dann wäre der Einbau neu zu prüfen. Ob iOS Safari die Sprach-Verarbeitung bei einem USB-Gerät wirklich abschaltet, zeigt erst das Gerät (darum `getSettings()` und die rote Warnung). Ob sich die DWGS-Wellen je Oktave ändern, ist [U], deshalb mehrere Oktaven. Raumgeräusche fallen weg, weil die Line-Aufnahme Pflicht ist. Die Übergabe des Pakets braucht einen Weg vom iPhone zum Bau (H-15).

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
5. **Bedienfeld** (B.3, ohne neue Stellung): MIXER Ebene 2 = DRIVE-TYP · DRIVE · ROUTING · F-BALANCE; FILTER Ebene 2 = ANSCHLAG · F2-TYP · F2-CUTOFF · F2-RESO. · F2-HK-INT, Ebene 3 (SHIFT zweimal) = F2-KEYTR. · F2-ANSCHL. · F2-HK.
6. **Leistungs-Probe:** Fall „+Filter 2/Drive“.

**Nicht-Umfang.** Kammfilter, Filter-Morph, 11 Verzerrer-Typen (RADIAS), Effekt-Typen des RADIAS.

**Daten.** `t[].f2`, `t[].fr`, `t[].fbal`, `t[].drv` (neutral: TYP aus, `fr` 0).

**Berührungspunkte.** Ladder-Kern (zweite Instanz je Stimme), Patch- und Seq-Ziellisten.

**Dauer** 6–7 h · **Version 4.18.0** · **Budget** +25 KB · Format bleibt 5.

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
- [ ] **MK11-10 Oberfläche:** M-PLATZ in P1–P3, L1, L2, W für MIXER Ebene 2 und FILTER Ebene 2/3; SHIFT schaltet bei FILTER Ebene 2 → 3 → aus (Matrix-Zeile mit „EB2“/„EB3“ vor dem Sektionsnamen, SHIFT blinkt bei Ebene 3); M-SKIZZE besteht weiter, nichts rückt. H-1/H-3. Regression, Budget ≤ +25 KB.

**Tests.** `mk11-filter2.mjs`, `mk11-drive.mjs`, `mk11-ui.mjs`.

**Fach-Prüfung:** **FP-DSP** Haupt-, **FP-IPHONE** Zweit-Blick.

**iPhone:** EDIT-WAHL 1 auf MIXER, SHIFT: ROUTING seriell, DRIVE-TYP „Falter“, DRIVE langsam aufdrehen. FILTER, SHIFT: F2-TYP Hochpass hinter einer Säge.

**Geräte-Abgleich:** entfällt (kein RADIAS vorhanden).

**Risiken.** Die doppelte Filterlast trifft das iPhone. Der Begrenzer bekommt keine neue Stufe. Liegt die Probe über der Grenze, gilt B.4 (CHANGES).

---

### MK12 — RADIAS-Teil 2: dritte Hüllkurve und Formant-Oszillator

**Ziel.** Eine frei verwendbare dritte Hüllkurve und ein Vokal-Oszillator, bei dem man die Mundform regelt (KF [B]).

**Umfang.**
1. **EG3** `e3` je Timbre (ADSR + NEUSTART, W-06). Patch-Quelle „EG 3“ (s 8), Seq-Ziele (MK-R1). Als Hüllkurve für Filter 2 wählbar (`f2.egs` 1 │ 3; FILTER Ebene 3). Bedienung: F-HK Ebene 2 (SHIFT) = HK 3 (B.3).
2. **Formant-Oszillator** (OSZ 1 Welle 8, W-44):
   - Er nutzt die Vokal-Quelle aus MK7: bandbegrenzter Glottis-Puls (W-28) in die Resonatoren F1–F4 (TPT-SVF, parallel, Bandbreiten 80/90/120/150 Hz). Neu ist hier die Welle 8 mit Morph und LFO.
   - STEUER 1 = Vokal-Morph a → e → i → o → u, stetig, Frequenzen logarithmisch interpoliert. STEUER 2 = LFO1-Tiefe.
   - Er ist auch Vocoder-Träger.
   - Das LCD zeigt den nächsten Vokal: „FORMANT · VOKAL e→i 72“.

**Nicht-Umfang.** Formant-Bewegung aufnehmen, mehr Patches (RADIAS hat 6), weitere Vokale oder Sprachen.

**Daten.** `t[].e3`, `o1.w` 8, `f2.egs`.

**Berührungspunkte.** Hüllkurven-Kern, Patch-Quellen, Vokal-Quelle aus MK7, Oktav-Tabellen (nicht nötig: die Resonatoren arbeiten in Hz).

**Dauer** 5,5–6,5 h (Rev. 1: −0,5 h, die Vokal-Quelle kommt aus MK7) · **Version 4.19.0** · **Budget** +22 KB · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK12-01 Neutral:** EG3 ohne Route und ohne Wahl als Filter-2-Hüllkurve ist bitgleich zum Vorgänger-Stand.
- [ ] **MK12-02 EG3:** Die Zeiten nach W-06 ± 10 %. Als Patch-Quelle wirkt sie nach W-18. Filter 2 folgt EG3 bei `egs` 3.
- [ ] **MK12-03 Vokale:** Für C2 und C3 und alle 5 Vokale liegen die Spitzen der Spektralhülle bei F1/F2 der Tabelle ± 7 %, F3 ± 10 %.
- [ ] **MK12-04 Morph:** Ein Zug über STEUER 1 in 1 s besteht M-KLICK. Der F2-Verlauf ist stetig (kein Sprung > 5 % je Block).
- [ ] **MK12-05 Alias:** C6 hat gefaltete Energie (B.6 Nr. 12) ≤ −50 dB.
- [ ] **MK12-06 Träger:** Der Formant-Oszillator als Vocoder-Träger besteht MK7-08.
- [ ] **MK12-07 CPU:** Formant ≤ 1,5 × Säge. EG3 ≤ +2 % (Node-Offline).
- [ ] **MK12-08 Oberfläche:** HK 3 auf F-HK Ebene 2, F2-HK auf FILTER Ebene 3. M-PLATZ in P1–P3, L1, L2, W, M-SKIZZE. H-1/H-3. Regression, Budget ≤ +22 KB.

**Tests.** `mk12-eg3.mjs`, `mk12-formant.mjs`, `mk12-ui.mjs`.

**Fach-Prüfung:** **FP-DSP** Haupt-, **FP-KLANG** Zweit-Blick.

**iPhone:** OSZ 1 → WELLE Formant, STEUER 1 langsam von 0 nach 127 („a-e-i-o-u“). PATCH 1: EG 3 → OSZ1-Steuer; HK 3 unter F-HK mit SHIFT einstellen.

**Risiken.** Die Vokal-Tabelle stammt aus der Sprachforschung, nicht vom RADIAS.

---

### MK13 — RADIAS-Teil 3: mehr Stimmen

**Ziel.** Bis zu 8 Stimmen je AM-Spur, wo das iPhone es trägt (KF [B]: RADIAS 24 statt 4 Stimmen; hier begrenzt durch Plan Punkt 5).

**Umfang.**
1. **STIMMEN-ZAHL** `vmax` 4 │ 8 auf STIMME Ebene 2, Regler 4 (Vorgabe 4 = MS2000).
2. Bei 8 ist die Timbre-Teilung 2+6 │ 4+4 │ 6+2. Unison bei 8 nach W-15. Der Vocoder ist bei 8 erlaubt.
3. **Begrenzer** (B.4): Stufe 1 setzt `vmax` 8 → 4 für neue Noten.
4. **Kopf-Anzeige** (L9): „8 St“ bzw. „4 St (Begrenzer)“.
5. **Leistungs-Probe:** Fall „8 Stimmen“ (4 Spuren × 8).

**Nicht-Umfang.** Mehr als 2 Timbres (RADIAS 4), mehr als 8 Stimmen.

**Daten.** `vmax`.

**Berührungspunkte.** `POOL` bleibt 12 (8 Stimmen + 4 Stehl-Blenden). Begrenzer.

**Dauer** 3–4 h · **Version 4.20.0** · **Budget** +10 KB · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK13-01 Stimmen:** 8 Tasten ergeben 8 Stimmen, die 9. stiehlt (M-KLICK). `vmax` 4 ist bitgleich zum Vorgänger-Stand. Umschalten von `vmax` bei klingenden Noten über `engXf` (B.6 Nr. 2).
- [ ] **MK13-02 Teilung:** 2+6, 4+4 und 6+2 verhalten sich wie MK3-02 sinngemäß.
- [ ] **MK13-03 CPU:** 8 Stimmen ≤ 2,1 × 4 Stimmen (Node-Offline).
- [ ] **MK13-04 Begrenzer:** Bei simulierter Last > 0,45 bekommen neue Noten höchstens 4 Stimmen. Gespeichertes bleibt deep-equal (I-08). Die Anzeige erscheint.
- [ ] **MK13-05 iPhone-Grenze:** Xanders Probe „8 Stimmen“ steht in CHANGES. Liegt `load_med` (Σ der 4 Probe-Engines, B.4) > 0,40 oder ist `frames_ok` falsch, gilt ab dann: `vmax` 8 klingt nur auf höchstens 2 AM-Spuren gleichzeitig, weitere fallen auf 4 (Regel und Wert in CHANGES). Die Schwelle lässt wie beim Fall „Kern“ Platz für den Rest des Projekts.
- [ ] **MK13-06 Oberfläche:** STIMME Ebene 2 mit STIMMEN-ZAHL, M-PLATZ in P1–P3, L1, L2, W, M-SKIZZE. Regression, Budget ≤ +10 KB.

**Tests.** `mk13-voices.mjs`, `mk13-limit.mjs`.

**Fach-Prüfung:** **FP-IPHONE ●** Haupt-, **FP-DSP** Zweit-Blick.

**Zwischenstand** nach MK13 (EN3-17).

**iPhone:** Leistungs-Probe „8 Stimmen“ schicken. Eine Fläche mit 8 Stimmen und vollen Akkorden spielen.

**Risiken.** Ob das iPhone 4 × 8 Stimmen trägt, ist offen. Die Regel MK13-05 fängt das ab.

---

### MK-P — Bedienfeld wie der MS2000 (ersetzt B.3)

**Anlass** (Xander, 26.10.2026, sinngemäß): Das MS 2000 in der App soll aussehen wie das echte Gerät: die hell blau-silberne Metallplatte und alle Elemente in derselben Anordnung von oben nach unten. Für ihn war das von Anfang an klar. Bisher (B.3, MK1) folgte das Bedienfeld der Strichzeichnung des **microKORG** (HB-MK S. 2–3), weil Rev. 2 annahm, es gebe keine Vorlage für den MS2000. Die gibt es: **HB-MS S. 5 (PDF 11)** zeigt die Vorderseite des MS2000 als Strichzeichnung, S. 6–9 (PDF 12–15) erklären jedes Element. MK-P baut das Bedienfeld danach neu. Die Lage-Tabelle unten ist aus dieser Zeichnung **vermessen**, nicht aus der Erinnerung genommen: Rahmenlinien per Linien-Suche, Element-Mitten über ein Prozent-Raster, Ausschnitt `scratchpad/ms2000-panel/ms2000-front.png`, Skripte `scratchpad/mkp-tools/lines.py` und `grid.py` (privat wie die Handbücher, E.5 Nr. 5). Die Zeichnung ist schwarz-weiß. Farben und Material kommen deshalb aus Xanders Beschreibung („blau, Metalloberfläche“) und sind eK.

**Ziel.** Xander öffnet eine MS-2000-Spur und sieht die Vorderseite des MS2000: hell blau-silbernes, gebürstetes Metall, dieselben Sektionen in derselben Reihenfolge, jeder Regler und jede Taste an ihrem Platz, die 16 Regler über den 16 Schritt-Tasten und die weißen Vocoder-Namen auf Schwarz. Am iPhone sieht er zuerst die **Übersicht**. Tippt er eine Sektion an, erscheint die **Zoom-Ansicht** mit Trefferflächen ≥ 44 px, und mit Wischen kommt er zur Nachbar-Sektion. Zum Spielen gibt es die **Spiel-Ansicht** (PITCH- und MOD-Rad, Tastatur, Schritt-Tasten). Klang, Daten und Speicherformat bleiben unverändert; das Paket ändert nur die Oberfläche.

**Umfang.**

**1. Vorlage, Platte und Raster.**
- Die Platte ist das Rechteck innerhalb des äußeren Rahmens der Zeichnung, Seitenverhältnis **1,95 : 1** (1400 × 718 px in der Vorlage). Alle Lagen stehen in **% der Plattenbreite (x)** und **% der Plattenhöhe (y)**, Ursprung oben links, Werte = Mitte des Elements.
- **16-Spalten-Raster** [B, gemessen]: Die 16 Regler der unteren Reihe, die 16 Schritt-Tasten und fast alle Elemente darüber stehen auf denselben Spalten **xₙ = 14,1 + (n − 1) · 5,52** (n = 1…16; Abweichung ≤ 0,3). Beispiele: CONTROL 1 = Spalte 1, SEMITONE = 3, MIXER = 5, CUTOFF = 6, RESONANCE = 7, AMP = 8, TEMPO = 9, GATE = 10, VIRTUAL-PATCH-Tasten = 13–15. Die Sektionsgrenzen liegen zwischen zwei Spalten. Links davor liegt die **Randspalte** x 0,5–11,1 (AUDIO IN, POWER/VOLUME, OCTAVE, SEQ EDIT, BANK).
- Zwischen zwei Spalten stehen: WAVE (OSZ 1), TIMBRE SELECT, MOD SEQUENCE ON/OFF und REC, der PORTAMENTO-Regler und MOD/DELAY. Die Viererreihen im Arpeggiator und im Anzeige-Feld und die Paare OCTAVE und BANK haben ihr eigenes Raster mit 4,3 % Abstand (die Zeichnung streut 4,2–4,4 %; gebaut wird genau der Tabellenwert, nicht enger). Das ist der kleinste Abstand zwischen zwei Bedienelementen auf der Platte, er bestimmt den Zoom (Oberfläche, Zoom-Ansicht).
- Die Kreisziffern ①–⑳ der Zeichnung, ihre Hinweislinien und die Klammer unter den Schritt-Tasten sind Handbuch-Hinweise und werden nicht gebaut; der Bildvergleich (MK-P-02) wertet sie nicht.
- **Aufdruck wie am Gerät** (H-16, Vorgabe): englische Großbuchstaben in der App-Schrift, darunter die weißen Vocoder-Namen auf schwarzem Feld, genau dort, wo die Zeichnung sie zeigt. Zwei Aufdrucke verbietet die Marken-Regel (EN3-05): **VOX WAVE → STIMMWELLE**, **DWGS → SPEICHERWELLE**. Die Marke wird nicht nachgebildet: Im Namensfeld steht nur `MK_LABEL`. Anzeige, LCD-Zeile des Blattrahmens und Hilfe bleiben deutsch (L5).

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

**3. Lage-Tabelle: Elemente und Belegung.** `t.T.` = gewähltes Timbre (TIMBRE SELECT; bei „beide“ gehen Gesten an beide, MK3). Vocoder-Pfade gelten bei `mode` 3 (MK7); „grau“ = im Vocoder ohne Wirkung, bedienbar mit Grund in der LCD-Zeile (L2). Aufdruck „oben │ invers“. Alle Pfade gibt es schon (Paket in der letzten Spalte), außer den zwei Eingangs-Pegeln, die MK-P als Live-Wert hinzufügt.

| ID | Element | Art | x | y | Aufdruck | Synth | Vocoder | ab |
|---|---|---|---|---|---|---|---|---|
| `ain.l` | 2 Eingangs-LEDs | LED | 3,0 · 8,6 | 6,1 | – | Signal an E1 bzw. E2, rot ab −1 dBFS | gleich | MK7 |
| `ain.1` | Regler 1 (ohne Skala wie in der Zeichnung) | Regler | 3,0 | 12,9 | 1 / │ INST | **E1-Pegel** (Live-Wert, siehe Daten) | gleich | MK-P |
| `ain.2` | Regler 2 | Regler | 8,6 | 12,9 | 2 / │ VOICE | **E2-Pegel** (Live-Wert) | gleich | MK-P |
| `vol` | POWER/VOLUME | Regler, Skala | 5,8 | 28,4 | Skala 1…10; „0“ an der Stelle von POWER OFF | Spur-Lautstärke (derselbe Wert wie FX → SPUR, Vol) | gleich | MK1 |
| `o1.led` | 8 Wellen-LEDs mit Wellensymbol | LED | links 12,5, rechts 18,0 | je 11,7 · 14,1 · 16,6 · 19,1 | links Säge, Puls „PWM“, Dreieck, Sinus „CROSS“; rechts STIMMWELLE, SPEICHERWELLE, NOISE, AUDIO IN | `t.T.o1.w` 0…7 (Formant, Welle 8 ab MK12: alle dunkel, die LCD nennt sie) | Trägerwelle, gleich | MK1/2/7 |
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
| `orig` | ORIGINAL VALUE | LED | 75,6 | 13,2 | ORIGINAL VALUE | wie bisher (B.3 ORIG; bei SEQ-Schritten der aufgenommene Wert, HB-MS S. 16) | gleich | MK1 |
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
| `tim` | TIMBRE SELECT | Taste | 16,8 | 61,4 | SELECT ─ (Linie zur LED 1) | T1 → T2 → beide → T1 (MK3) | grau | MK3 |
| `tim.led` | LEDs 1, 2 | LED | 20,4 | 57,9 · 60,4 | 1, 2 | gewähltes Timbre; beide = Edit Sync | dunkel | MK3 |
| `seq.on` | MOD SEQUENCE ON/OFF mit LED | Taste | 27,9 | 61,4 | ON / OFF | `t.T.seq.on` | grau | MK6 |
| `seq.rec` | REC mit LED | Taste | 33,4 | 61,4 | REC | Bewegung aufnehmen (MK6): blinkt = bereit, an = nimmt auf | grau | MK6 |
| `porta` | TIME | Regler | 44,5 | 61,0 | TIME │ TIME | `porta` | `t.0.porta` | MK1 |
| `l1.led` | 4 LEDs | LED | 56,7 | 51,6 · 54,0 · 56,5 · 58,9 | Säge, Rechteck, Dreieck, S / H | `l1.w` | gleich | MK1 |
| `l1.sel` | SELECT | Taste | 58,3 | 66,1 | SELECT │ SELECT | `l1.w` +1 im Kreis | gleich | MK1 |
| `l2.led` | 4 LEDs | LED | 62,2 | wie LFO 1 | Säge, Rechteck(+), Sinus, S / H | `l2.w` | gleich | MK1 |
| `l2.sel` | SELECT | Taste | 63,8 | 66,1 | SELECT │ SELECT | `l2.w` +1 im Kreis | gleich | MK1 |
| `fx.sel` | MOD/DELAY mit LED; Legende ○ 70,8 / ☀ 73,2 bei y 59,1 | Taste | 72,1 | 66,1 | MOD / DELAY │ MOD / DELAY | wählt, was Regler 11 und 12 bearbeiten: LED aus = Mod-FX, an = Delay (Ansicht, HB-MS S. 7) | gleich | MK4 |
| `vp.src` | 8 Quellen-LEDs | LED | 78,8 · 84,3 | je 51,6 · 54,0 · 56,5 · 58,9 | EG 1, EG 2, LFO 1, LFO 2 │ VELOCITY, KBD TRACK, MIDI 1, MIDI 2 | `p[P].s` des gewählten Patch P (EG 3 ab MK12: alle dunkel) | `voc.msrc` | MK2/7 |
| `vp.dst` | 8 Ziel-LEDs | LED | 89,8 · 95,4 | wie Quellen | PITCH, OSC 2 PITCH, OSC 1 CTRL 1, NOISE LEVEL │ CUTOFF, AMP, PAN, LFO 2 FREQ | `p[P].d` (Ziele 8/9 ab MK11: alle dunkel) | dunkel | MK2 |
| – | Pfeil ▷ | Aufdruck | 88,6 | 57,7 | – | – | – | – |
| `vp.sel` | SELECT | Taste | 80,4 | 66,1 | SELECT (Strich zur PATCH-1-LED) | P = 1 → 2 → 3 → 4 → 1 (Ansicht) | grau | MK2 |
| `vp.s` | SOURCE | Taste | 85,9 | 66,1 | SOURCE │ FC MOD SOURCE | `p[P].s` +1 im Kreis 0…7 | `voc.msrc` +1 | MK2/7 |
| `vp.d` | DESTINATION | Taste | 91,5 | 66,1 | DESTINATION | `p[P].d` +1 im Kreis 0…7 | grau | MK2 |
| `vp.led` | PATCH-LEDs 1–4, durch eine Linie verbunden | LED | 80,4 · 85,9 · 91,5 · 97,0 | 71,4 | – | gewählter Patch P | dunkel | MK2 |
| `sq.sel` | SEQ EDIT / CH PARAM: SELECT | Taste | 3,6 | 76,9 | SELECT │ SELECT | aus → SEQ 1 → SEQ 2 → SEQ 3 → aus (Ansicht; LCD „SEQ1:Cutoff“, HB-MS S. 16) | aus → LEVEL → PAN → aus | MK6/7 |
| `sq.led` | 3 LEDs mit Klammer | LED | 7,1 | 74,4 · 77,0 · 79,4 | SEQ 1 │LEVEL│, SEQ 2 │PAN│, SEQ 3 | gewählte Sequenz | LEVEL, PAN | MK6/7 |
| `k1`…`k16` | 16 Regler | Regler | xₙ | 77,7 | Tabelle unten | | | |
| `bank.d`, `bank.u` | BANK DOWN, UP | Taste | 3,6 · 7,9 | 92,3 | DOWN, UP | Bank A…H = Genre-Bank 1…8 (vor MK8 dunkel) | gleich | MK8 |
| `s1`…`s16` | 16 Schritt-Tasten mit LED | Taste | xₙ | 91,0; Nummer 84,7; Aufdruck 96,5 │ 98,7 | Liste unten | SPIEL: Programm n (ab MK8); EDIT: Seite n; Lauflicht bei laufender Sequenz; Seite ARP-SCHRITTE: Schritt n an/aus | gleich | MK-P |

**Die 16 Regler** (y 77,7; Aufdruck darüber bei 71,5 │ 73,3, bei PATCH 1–4 nur eine Zeile bei 73,5 unter den PATCH-LEDs). Ist eine Sequenz gewählt (SEQ EDIT), bearbeitet Regler n den Schritt n dieser Sequenz `t.T.seq.q[s].v[n−1]` (Bereich nach Ziel, A.6). Bei CH PARAM bearbeitet er Kanal n mit `voc.chl[n−1]` bzw. `voc.chp[n−1]` (HB-MS S. 8). Die Aufschrift bleibt dabei stehen, die LCD nennt Schritt bzw. Kanal.

| n | x | Aufdruck | Synth | Vocoder |
|---|---|---|---|---|
| 1–4 | 14,1 · 19,6 · 25,1 · 30,6 | ATTACK · DECAY · SUSTAIN · RELEASE (EG 1), oben wie invers | `e1.a` · `e1.d` · `e1.s` · `e1.r` | gleich |
| 5–8 | 36,2 · 41,7 · 47,3 · 52,8 | ATTACK · DECAY · SUSTAIN · RELEASE (EG 2) | `e2.a` · `e2.d` · `e2.s` · `e2.r` | gleich |
| 9, 10 | 58,3 · 63,8 | FREQUENCY │ FREQUENCY (LFO 1, LFO 2) | `l1.f` bzw. `l1.note` bei TEMPO SYNC; `l2.f`/`l2.note` | gleich |
| 11 | 69,4 | SPEED / TIME │ SPEED / TIME | Mod-FX `mfx.spd` bzw. Delay `dly.time`/`dly.note` (nach MOD/DELAY) | gleich |
| 12 | 74,9 | DEPTH / FEEDBACK │ DEPTH / FEEDBACK | `mfx.dep` bzw. `dly.dep` | gleich |
| 13–16 | 80,4 · 85,9 · 91,5 · 97,0 | PATCH 1 … PATCH 4 (nur oben) | `p[0…3].i` | grau |

**Schritt-Tasten** (oben │ invers): 1 COMMON │ COMMON · 2 VOICE │ VOICE · 3 PITCH │ PITCH · 4 OSC 1 │ OSC 1 · 5 OSC 2 │ AUDIO IN 2 · 6 FILTER │ FILTER · 7 AMP │ AMP · 8 EG │ EG · 9 LFO │ LFO · 10 PATCH │ CH LEVEL · 11 SEQ │ CH PAN · 12 MOD FX │ MOD FX · 13 DELAY FX │ DELAY FX · 14 EQ │ EQ · 15 ARPEGGIO │ ARPEGGIO · 16 UTILITY │ UTILITY. Programm-Wahl ab MK8: Bank A…H = Genre-Bank 1…8, Taste 1–8 = Werksklang Platz 1–8 (Seite A), Taste 9–16 = eigener Klang Platz 1–8 (Seite B). `bank`/`slot` bleiben, wie MK8 sie festlegt.

**Räder:** PITCH (links) und MOD links der Tastatur in `#kbArea`, Funktion unverändert (MK1, W-17, W-18). Mulde und Rahmen bekommen den Metallton statt Holz, Aufschrift PITCH und MOD (HB-MS S. 9).

**4. Anzeige, Modi und Seiten** (wie HB-MS S. 2, S. 13, S. 18–19; Modi, Seite, Cursor und Auswahl sind Ansichtszustand, nicht Teil des Sounds).
- **SPIEL** (am Gerät Program Play): Zeile 1 „A01:Name“ (Bank A…H, Nummer 01…16, die ersten 12 Zeichen des Namens; ohne Programmplatz „---:Name“). Zeile 2 Modus (EINZELN, DUAL, SPLIT, VOCODER) und rechts „♩=120“ (Song-Tempo). Ist T2 gewählt, steht „T2“ in Zeile 2; ist eine Sequenz gewählt, steht dort „SEQ1:Cutoff“. Beim Drehen zeigt Zeile 2 eine Sekunde lang Name und Geräte-Wert („CUTOFF      064“). Die LCD-Zeile des Blattrahmens zeigt weiter den Klartext mit Einheit (B.3 Rahmen).
- **EDIT** (Taste EDIT; am Gerät LCD Edit):
  - Zeile 1 zeigt Seitennummer und -name („08A FILTER“), Zeile 2 Name und Wert; der Cursor blinkt am Wert.
  - Schritt-Taste n springt auf die Seite aus dem Seitenplan, ihre LED leuchtet. PAGE −/+ blättert durch alle Seiten, auch durch die ohne eigene Taste. CURSOR ◀ ▶ wählt den Wert auf der Seite, −/NO und +/YES ändern ihn um eine Stufe (ersetzt SHIFT + OKT ▲/▼).
  - Die Regler der Platte wirken weiter, und die Anzeige springt zu ihrem Wert (am Gerät „Page Jump“, Vorgabe an).
  - Ein Tipp auf die Anzeige (Trefferfläche = LCD) öffnet die Auswahl-Liste des Werts unter dem Cursor (`openPop`, Zeilen ≥ 44 px). Trägt Zeile 2 „▸“, öffnet er die Zusatz-Ansicht (SCHRITTE, 16 BÄNDER, EIGENE; B.3, unverändert).
  - EXIT führt zurück zu SPIEL.
- **GLOBAL** (Taste GLOBAL): Spur-Einstellungen, die nicht zum Sound gehören. 1A EINGANG 1 ▾ und 1B EINGANG 2 ▾ (`tr.mkIn` mit „Quelle nur als Eingang“, MK7), 1C OKTAVE (`tr.kbOct`), 1D SEITEN-SPRUNG an/aus. EXIT führt zurück zu SPIEL.
- **COMPARE:** EDIT halten und EXIT tippen (zwei Finger, HB-MS S. 19). Das schaltet zwischen bearbeitetem und gespeichertem Stand wie der vorhandene A/B-Weg im Blattkopf; Zeile 2 zeigt „== COMPARE ==“, EXIT beendet. Es gibt keinen Lang-Druck (L4).
- **Seitenplan** (Nummern und Reihenfolge wie am Gerät, HB-MS S. 18, S. 34–52; App-Zusätze mit Paket; die Seiten ohne eigene Taste erreicht man mit PAGE):

| Taste | Synth-Seite: Werte | Vocoder-Seite: Werte |
|---|---|---|
| 1 | 01 COMMON: MODUS `mode`; bei Dual/Split STIMMEN `tv`, SPLIT `split`; STIMMUNG `scale`, GRUNDTON `skey`, EIGENE ▸ (`usc`, MK3) | 01 COMMON: MODUS, STIMMUNG, GRUNDTON |
| – | 02 NAME: Name (vorhandenes Umbenennen) | 02 NAME |
| 2 | 03 VOICE: ZUWEISUNG `asg`, PRIORITÄT `prio`, AUSLÖSUNG `trig`, UNI-VERST. `udet`; *STIMMEN-ZAHL `vmax` (MK13)* | 03 VOICE |
| 3 | 04 PITCH: TRANSP. `trans`, FEIN `tune`, BEND `bend`, VIBRATO `vib`, PORTAM. `porta`, MOD-RAD `p.mw` | 04 PITCH |
| 4 | 05 OSC 1: WELLE `o1.w` (*Formant, MK12*), STEUER 1, STEUER 2 | 05 OSC 1 |
| 5 | 06 OSC 2: WELLE `o2.w`, MOD `o2.mod`, HALBTON `o2.semi`, FEIN `o2.tune` | 06 AUDIO IN 2: GATE `voc.gs`, SCHWELLE `voc.th`, HPF-PEGEL `voc.hpl`, HPF-GATE `voc.hpg` |
| – | 07 MIXER: OSZ 1, OSZ 2, RAUSCHEN; *DRIVE-TYP, DRIVE, ROUTING, F-BALANCE (MK11)* | 07 MIXER: OSZ 1, EINGANG 1 `voc.ins`, RAUSCHEN |
| 6 | 08 FILTER: TYP, CUTOFF, RESONANZ, HK-INT, ANSCHLAG `f.vel`, KEYTRACK; *F2-TYP, F2-CUTOFF, F2-RESO., F2-HK-INT, F2-KEYTR., F2-ANSCHL. (MK11), F2-HK (MK12)* | 08 FILTER: FORMANT `voc.fs`, CUTOFF, RESONANZ, FC-QUELLE `voc.msrc`, FC-INT `voc.mint`, FOLGER `voc.efs` (127 = HALTEN) |
| 7 | 09 AMP: PEGEL, PAN, HK │ GATE `a.gate`, VERZERR. `a.dist`, ANSCHLAG `a.vel`, KEYTRACK `a.kbd` | 09 AMP: PEGEL `voc.lvl`, DIREKT `voc.dir`, VERZERR. `voc.dist`, ANSCHLAG `voc.vel`, KEYTRACK `voc.kbd` |
| 8 | 10 EG 1: ATTACK, DECAY, SUSTAIN, RELEASE, NEUSTART `e1.*`; dahinter 11 EG 2 `e2.*` und *11+ HK 3 `e3.*` (MK12)* | gleich |
| 9 | 12 LFO 1: WELLE, KEY SYNC, TEMPO SYNC, FREQ │ NOTE `l1.*`; dahinter 13 LFO 2 `l2.*` | gleich |
| 10 | 14–17 PATCH 1–4: QUELLE `p[k].s` (*EG 3, MK12*), ZIEL `p[k].d` (*Cutoff 2, Verzerrer, MK11*), INTENSITÄT `p[k].i` | 14 CH LEVEL: Kanal 1–16 `voc.chl`, 16 BÄNDER ▸ |
| 11 | 18 SEQ COMMON: AN, LÄNGE, TYP, LAUF, KEY SYNC, AUFLÖSUNG `seq.*`; dahinter 19–21 SEQ 1–3: ZIEL `q[s].k`, BEWEGUNG `q[s].m`, SCHRITTE ▸ (MK6) | 15 CH PAN: `voc.chp`, 16 BÄNDER ▸ |
| 12 | 22 MOD FX: TYP, TEMPO, TIEFE `mfx.*` | 16 MOD FX |
| 13 | 23 DELAY FX: TYP, TEMPO SYNC, ZEIT │ NOTE, TIEFE `dly.*` | 17 DELAY FX |
| 14 | 24 EQ: TIEF-FREQ, TIEF-GAIN, HOCH-FREQ, HOCH-GAIN `eq.*` | 18 EQ |
| 15 | 25 ARPEGGIO: AN, LATCH, TYP, OKTAVEN, GATE, ZIEL `tgt`, KEY SYNC, AUFLÖSUNG, SWING, LÄNGE `last`; letzte Unterseite **SCHRITTE**: Solange sie angezeigt wird, schalten die Schritt-Tasten 1–8 die Arp-Schritte (`arp.steps`, LED an = Schritt an, Tasten über `last` gedimmt, 9–16 dunkel); TEMPO = Song (EN3-10) | 19 ARPEGGIO |
| 16 | 26 UTILITY: INIT, TIMBRE NEU, TIMBRE KOPIEREN ▸, TIMBRE TAUSCHEN (MK3), SEQ-INIT, SEQ KOPIEREN ▸, SEQ TAUSCHEN (MK6), SOLO aus │ T1 │ T2 (MK3, nicht gespeichert). Jede Ausführung mit +/YES, je ein Undo | 20 UTILITY: INIT (behält den Vocoder), PEGEL ZURÜCK, PAN ZURÜCK (MK7) |

Jeder Pfad, den `normMk` kennt (außer `v`), ist entweder über ein Element der Platte oder über eine Seite erreichbar (MK-P-05).

**5. Umzug der bisherigen Bedienung** (B.3 → MK-P; die Funktionen bleiben, nur der Weg ändert sich):

| bisher (B.3, microKORG-Vorlage) | ab MK-P (MS2000-Vorlage) |
|---|---|
| EDIT-WAHL 1/2, Regler 1–5, Matrix, SPIEL-Belegung | ein eigener Regler bzw. eine eigene Taste je Wert (Lage-Tabelle); alles andere auf den Seiten |
| SHIFT-Ebene 2/3 (MS2000- und RADIAS-Zusätze) | Seiten nach dem Seitenplan |
| SHIFT + 1 … 5, Vocoder SHIFT + 1/2 | 26 UTILITY bzw. 20 UTILITY |
| SHIFT + TIMBRE (Solo) | 26 UTILITY „SOLO“ |
| SHIFT + OKT ▲/▼ (Wert ±1) | +/YES, −/NO |
| SHIFT + SEITE | entfällt |
| BANK-Drehschalter, SEITE, Nummerntasten 1–8, Anzeige „A.24“ | BANK ▼ ▲, Schritt-Tasten 1–16, LCD „A01:“ |
| ARP-Taste mit Tempo-LED | ARPEGGIATOR ON/OFF, TEMPO-LED, LATCH, RANGE, TYPE, TEMPO, GATE |
| ARP B: Nummerntasten als Schritt-Tasten | 25 ARPEGGIO, Unterseite SCHRITTE |
| TIMBRE/HALTEN im Vocoder | KBD TRACK │ E.F.SENSE auf 127 = HOLD (wie am MS2000) bzw. 08 FILTER FOLGER |
| Tipp auf die Matrix-Zeile (SCHRITTE, 16 BÄNDER, EIGENE) | Tipp auf die Anzeige, wenn Zeile 2 „▸“ trägt |
| E1/E2-LEDs neben der Anzeige | AUDIO-IN-LEDs links oben |
| Quellen QUELLE 1/2 auf MIXER/EING. 1 Ebene 2 | GLOBAL 1A/1B |
| ◎ Punkte an Drehschalter-Stellungen | ◎ Punkt auf jeder Schritt-Taste, deren Seite von INIT abweicht (EDIT), und an jedem Regler, dessen Wert abweicht |
| 🎲 würfelt die EDIT-WAHL-1-Sektionen von T1 | 🎲 würfelt dieselben Werte (OSZ, Mixer, Filter, Hüllkurven von T1), unverändert |
| Reiter [GERÄT] [FX] bzw. [LINKS] [RECHTS] [FX] | Reiter **[GERÄT] [SPIEL] [FX]** (Oberfläche) |

**6. Abbau, Test-API, Hilfe.**
- Das microKORG-Bedienfeld aus MK1–MK7 wird entfernt: Drehschalter, 7-Segment-Anzeige, Matrix, Holzwangen, Halb-Ansicht, Zonen Z1–Z13 und SHIFT-Ebenen-Oberfläche. Seine Funktionen sitzen jetzt nach Umfang 5. Kein toter Code bleibt im Block `sq-mk-src` (Ladezeit).
- `mkPanel()` gibt ab MK-P zurück: `{fmt, z, ansicht: 'uebersicht'|'zoom'|'spiel', feld, felder: [{id, x, y, w, h}], modus: 'spiel'|'edit'|'global', seite, cursor, timbre, fxSel, patchSel, seqSel, elements: [{id, art, x, y, w, h, hit?: {x, y, w, h}, bind?, grau, led?}]}`. Element-Rechtecke stehen in % der Platte, `hit` in px im Bild (nur aktive Elemente), `bind` ist der Pfad (`'t.0.f.cut'`) bzw. `'view:fxSel'`. Neu ist `mkView(o)` (setzt Ansicht, Feld, Modus und Seite; nur für Tests, kein Undo). Die Bedienfeld-Tests aus MK1–MK7 werden auf die neue Bedienung umgestellt; Klang-, Daten- und Leistungs-Tests bleiben unverändert.
- Jedes neue Element bekommt eine Hilfe-Zeile und beim ersten Antippen einen LCD-Hinweis (L10): eigene Sätze ohne Marke, den Namen aus `MK_LABEL`.

**Oberfläche.**

**Aussehen** (eK; die Zeichnung belegt nur Lage und Aufdruck):
- **Platte:** hell blau-silbern gebürstetes Metall, nur aus CSS-Verläufen. Grund ist ein senkrechter Verlauf hsl(208 30 % 82 %) → hsl(210 26 % 72 %). Darüber liegt ein `repeating-linear-gradient` mit waagrechten 1-px-Linien (±3 % Helligkeit) und ein schwacher schräger Glanz. Gemessener Mittelwert: Farbton 195–225°, Sättigung 10–35 %, Helligkeit 65–85 %. Außen eine dunkelgraue Kante (0,6 % der Breite). Keine Holzwangen, keine Bild-Dateien, keine Bitmaps aus Korg-Material.
- **Druck:** Sektionsrahmen und Beschriftung dunkelgrau (Helligkeit ≤ 30 %, Kontrast zur Platte ≥ 4,5 : 1), Rahmenlinien max(1 px, 0,1 % der Breite), Titel über dem Rahmen wie in der Zeichnung. Inverse Felder sind weiße Schrift auf Schwarz (Kontrast ≥ 7 : 1), genau dort, wo die Tabelle sie nennt. App-Schrift in Großbuchstaben, Gewicht 600–700. Schriftgrößen in % der Plattenbreite: Titel 1,1, Beschriftung 0,9, kleine Listen 0,82; bei z = 1100 also ≥ 9 px.
- **Regler:** schwarze Kappen (L* ≤ 15, `radial-gradient`) mit weißer Zeigerlinie. Darum eine aufgedruckte Skala, ein gemeinsames SVG-Symbol, das jeder Regler mit `<use>` nutzt (eigene Form, EN3-13). Die Mittelmarke oben tragen genau die Regler, an denen die Zeichnung sie zeigt: EG 1 INT, KBD TRACK, SEMITONE, TUNE und PAN. PATCH 1–4 sind auch bipolar, haben in der Zeichnung aber keine Marke und bekommen keine (die Mitte nennt die LCD). AUDIO IN 1 hat in der Zeichnung keine Skala und bekommt keine. Kappe 2,1 %, Skala 3,3 % der Breite. VOLUME bekommt die Ziffern 0…10.
- **Tasten:** hellgraue Rechtecke (Helligkeit 75–90 %) mit dunklerer Kante und innerer Doppellinie wie in der Zeichnung. Tasten mit LED zeigen oben in der Mitte das LED-Fenster. Gedrückt wird die Taste dunkler, ohne Versatz.
- **LEDs:** klein und rund (0,75 % der Breite). Aus = dunkelrot, an = rot bis orange (Farbton 0–35°) mit kleinem Schein (≤ 4 px, nur an). OCTAVE grün (±1) bzw. rot (±2).
- **Anzeige:** 2 × 16 Zeichen in `ui-monospace`, ohne Umbruch und mit fester Breite. Farbe nach Auftrag grün auf dunkel, aus einem Variablenpaar `--mkp-lcd-fg/-bg` [U]: Am Gerät könnte es umgekehrt sein (dunkle Zeichen auf beleuchtetem Grün); ein Blick auf ein Foto ändert nur diese zwei Werte.
- **Namensfeld:** nur der Text aus `MK_LABEL` in der App-Schrift, Gewicht ≤ 600, normale Breite, Größe 3 % der Plattenbreite, Druckfarbe, linksbündig ab x 56,4. Ohne Unterzeile; „ANALOG MODELING SYNTHESIZER“ ist Teil der Herstellerbeschriftung und entfällt. Kein Logo, keine nachgebildete Schriftform (EN3-05, B.6 Nr. 9 c).

**Ansichten** (Reiter **[GERÄT] [SPIEL] [FX]**; FX unverändert). Ansicht, Feld und Modus sind Ansichtszustand. Beim ersten Öffnen erscheint die Übersicht, danach die zuletzt gewählte Ansicht der Sitzung.
- **Übersicht:** die ganze Platte, eingepasst (contain) und zentriert, Seitenverhältnis 1,95. Sie ist erkennbar, aber nicht zum Drehen gedacht: Regler und Tasten reagieren hier nicht. Ein Tipp öffnet die Zoom-Ansicht des **Feldes unter dem Finger**; liegt die Stelle näher als 6 px an einer Feldgrenze, gilt das Feld mit dem näheren Mittelpunkt. Die getippte Sektion blinkt 300 ms auf. Die Übersicht ist eine einzige Trefferfläche.
- **Zoom-Ansicht:** dieselbe Platte, vergrößert auf die Plattenbreite **z**, verschoben auf ein **Feld**. Felder sind Rechtecke der Platte, die kein Bedienelement und keine Beschriftung schneiden. Einzige Ausnahme ist der Sektionstitel EG 1 (FILTER) (x 19,6–25,1): Er steht über den Reglern 1–4 und reicht bei schmalen Spalten über H1 und H2; dort erscheint er in beiden Feldern angeschnitten wie ein Rahmen. Jedes Element liegt in mindestens einem Feld ganz.
  - **Spaltengruppen:** **breit** G-L (x 0–55,6) │ G-R (55,5–100), wenn der Körper ≥ 570 px breit ist; sonst **schmal** H1 (0–22,4) │ H2 (22,3–50,1) │ H3 (50,0–77,7) │ H4 (77,6–100).
  - **Zeilengruppen:** **Hälften** O (y 0–50,5) │ U (46,5–100), wenn der Körper ≥ 281 px hoch ist; sonst **Drittel** D1 (0–37,5) │ D2 (35,0–68,5) │ D3 (67,5–100), wenn ≥ 197 px; sonst **Zeilen** Z1 (0–20,5) │ Z2 (19,0–37,5) │ Z3 (35,0–50,5) │ Z4 (46,5–68,5) │ Z5 (67,5–83,5) │ Z6 (83,0–100).
  - **Maßstab:** z = 1100 px · k mit k = min(1,2; Körperbreite ÷ breitestes Feld; Körperhöhe ÷ höchstes Feld), Feldmaße bei z = 1100 gerechnet. Die Gruppenwahl hält k ≥ 0,931, also z ≥ 1024 px; die Schwellen 570, 281 und 197 px sind daraus gerechnet (bei k = 0,93 läge der Tastenabstand bei 43,99 px). Dann liegt der kleinste Tastenabstand (4,3 %) bei ≥ 44 px, und jede Trefferfläche ist ≥ 44 × 44 ohne Überlappung (Regler-Treffer 44 × 44 um die Kappe, Tasten mindestens Tastengröße).
  - **Trefferflächen am Feldrand:** Reicht die 44-px-Trefferfläche eines Elements über sein Feld hinaus (z. B. die Tasten bei y 66,1: LFO SELECT, MOD/DELAY und VIRTUAL PATCH in Z4 und D2), wird sie ins Feld verschoben, nie verkleinert, und deckt das Element weiter ganz ab.
  - **Kleinere Körper** (kein Format der Liste; Zeilen brauchen ≥ 116 px Höhe, schmal ≥ 285 px Breite): z bleibt 1024, das Feld lässt sich innerhalb seiner Grenzen wie beim Wischen verschieben, und CHANGES nennt das Format.
  - **Nachbarn:** Was außerhalb des Feldes im Bild liegt, ist zu 70 % mit der Plattenfarbe abgedeckt und reagiert nicht. Ein Tipp darauf wechselt in dieses Nachbarfeld.
  - **Lagekarte:** rechts in der Reiter-Zeile, 44 × 34 px Bild, 44 × 44 Treffer. Sie zeigt das Feldraster mit dem aktuellen Feld; ein Tipp darauf (oder auf den aktiven Reiter GERÄT) führt zur Übersicht.
- **Spiel-Ansicht** (Reiter SPIEL; Räder und Tastatur darunter wie bisher in `#kbArea`). Eine Metall-Leiste aus denselben Bausteinen, Reihenfolge wie am Gerät von links nach rechts:
  - **Band 1 (44 px)** ab 604 px Körperbreite (quer und W) in einer Reihe: OCTAVE ▼ ▲ · BANK ▼ ▲ · TIMBRE SELECT mit LEDs · MOD SEQ ON/OFF · REC · ARP ON/OFF mit TEMPO-LED · LATCH · Anzeige (2 × 16, ≥ 160 px breit). **Schmaler (hochkant)** ist Band 1 = OCTAVE ▼ ▲ · BANK ▼ ▲ · Anzeige (≥ 160 px, in P3 106 px), und die fünf Tasten TIMBRE SELECT · MOD SEQ ON/OFF · REC · ARP ON/OFF · LATCH stehen als Band 2 darunter; in P3 entfällt Band 2 (§0.4, P3 darf vereinfachen; die Tasten bleiben in der Zoom-Ansicht).
  - **Schritt-Tasten** mit Nummer und Aufdruck: eine Reihe à 16, wenn der Körper ≥ 704 px breit ist (L1, W); sonst quer eine Hälfte à 8 (L2), hochkant 2 × 8 bei ≥ 352 px Breite (P1, 12 Pro Max) bzw. eine Hälfte 2 × 4 (P2, P3). Die Hälften 1–8 │ 9–16 wechseln mit Wischen; ein Hälften-Zeiger zeigt auch das Lauflicht der anderen Hälfte als Punkt.
  - **Aufdruck der Schritt-Tasten in der Spiel-Ansicht:** nur die Zeile des aktiven Modus (Synth: obere Zeile, Vocoder: inverse Zeile), in der 9-px-Klasse `.lg`, höchstens zwei Zeilen (22 px), umbrochen nur an Leerzeichen (AUDIO IN 2, DELAY FX). Ein Wort, das auch dann nicht in die Tastenbreite passt (ARPEGGIO bei 44–45 px), bekommt 8 px. So halten L1 und P1 (je 45 px pro Taste) scrollWidth ≤ clientWidth. Die Platte selbst zeigt beide Zeilen wie die Zeichnung.
- **Formate** (`.pg`-Körper nach B.3 Maße; MK-P misst die echten Werte und trägt sie hier und in CHANGES ein):

| Format | Körper (px) | Übersicht (px) | Felder | z (px) | Spiel-Ansicht |
|---|---|---|---|---|---|
| P1 390 × 844 | 360 × ≈ 300 | 360 × 185 | H1–H4 × O/U = 8 | 1092 | Band 1, Band 2, Schritt-Tasten 2 × 8 (224 px hoch) |
| 12 Pro Max hoch 428 × 926 | ≈ 398 × 380 | 398 × 204 | 8 | 1320 | wie P1, bis × 1,1 |
| L1 844 × 390 | ≈ 720 × 136 | 265 × 136 | G-L/G-R × Z1–Z6 = 12 | 1206 | Band 1 + 16 Schritt-Tasten in einer Reihe (110 px hoch) |
| L1 mit Home-Balken | ≈ 720 × 120 | 234 × 120 | 12 | 1064 | wie L1 |
| 12 Pro Max quer 926 × 428 | ≈ 802 × 158 | 308 × 158 | 12 | 1320 | wie L1, bis × 1,1 |
| P2 375 × 667 | 345 × ≈ 231 | 345 × 177 | H1–H4 × D1–D3 = 12 | 1201 | Band 1, Band 2, Hälfte 2 × 4 |
| P3 320 × 568 | 290 × ≈ 203 | 290 × 149 | 12 | 1043 | Band 1, Hälfte 2 × 4 |
| L2 667 × 375 | 637 × ≈ 126 | 246 × 126 | G-L/G-R × Z1–Z6 = 12 | 1117 | Band 1, Hälfte 1 × 8 |
| W 844 × 1180 | 814 × Körper | eingepasst | G-L/G-R × O/U = 4 (bei Körper ≥ 362 px) | ≤ 1320 | wie L1 |

- **Drehen des iPhones:** Das neue Raster wählt das Feld, das die zuletzt bediente Sektion enthält. Nichts wird abgeschnitten: Jede Beschriftung erfüllt scrollWidth ≤ clientWidth, und die Seite scrollt nie waagrecht.

**Gesten** (L4; Regler-Geste aus `sKnob`, Fein-Regel `ctlPrecision`):
- **Regler:** senkrecht ziehen = Wert. **Fein:** seitlich ≥ 64 px vom Aufsetzpunkt = × ¼, ≥ 140 px = × 1⁄16, oder ein ruhender zweiter Finger auf freier Fläche = × ¼ (LCD „FEIN ×¼“). Doppeltipp = Standard, wie überall. Eine Geste ergibt ein Undo; während der Geste geht der Bruchwert an das Worklet (EN3-03).
- **Tasten:** Tipp. Bewegt sich der Finger mehr als 8 px, wird der Tipp verworfen.
- **Wischen** (Zoom-Ansicht): ein Finger, Start auf freier Fläche, Beschriftung oder einer Taste, **nie auf einem Regler** (dort bleibt seitlich = fein). Die Platte folgt dem Finger 1 : 1 (am Plattenrand gefedert). Beim Loslassen ab 40 px oder 0,3 px/ms rastet sie ins Nachbarfeld in Wischrichtung ein (≤ 250 ms), sonst zurück.
- **Zwei Regler zugleich** mit zwei Fingern ergeben zwei Gesten und zwei Undos. Räder, Tasten und Regler gehen gleichzeitig (MK1-33).
- **Pinch (optional, eK):** nur in der Übersicht und nur, wenn beide Finger auf der Platte beginnen; Spreizen öffnet das Feld unter der Mitte. Der Browser-Zoom bleibt aus (`touch-action`). Wird Pinch nicht gebaut, steht das als Lücke in CHANGES.
- **Bewegungen:** Übergänge dauern 200 ms; bei `prefers-reduced-motion` gibt es keine Animation.

**Leistung** (CLAUDE.md: schnelle Seite und stabile Verbindung zuerst):
- **Feste Geometrie:** Die Platte ist ein Baum mit absoluten Lagen in Platten-Einheiten (`--u` = z ÷ 1000 px) und hat `contain: strict`. Kein Text ändert die Größe seines Kastens (LCD feste 16 Zeichen).
- **Ansichtswechsel nur über `transform`:** Übersicht ↔ Zoom ↔ Feld und Wischen ändern nur `transform` eines Hüllelements und lösen kein Layout aus. Die Platte wird in Zoom-Größe aufgebaut und für die Übersicht verkleinert, damit die Schrift scharf bleibt. `will-change: transform` gilt nur während Übergang und Wischen; danach zeichnet Safari scharf neu, und kein dauerhafter großer Layer belegt Speicher.
- **Aktualisieren:** Regler drehen per `transform: rotate()` nur die Kappe. LEDs und Tasten wechseln nur Klassen, höchstens einmal je Bild und gesammelt in einem rAF. Lauflicht und TEMPO-LED folgen der Audio-Uhr im rAF, ohne `setInterval`. In Gesten wird nach dem Aufsetzen kein Layout gelesen.
- **Aufbau:** Der Baum entsteht beim ersten Öffnen aus der Lage-Tabelle als Datenblock in `sq-mk-src`, in Häppchen ≤ 8 ms, das sichtbare Feld zuerst. Vorher läuft `tickAhead(.3)`, zwischen zwei Häppchen mindestens ein Scheduler-Tick (EN3-14). Projekte ohne MS-2000-Spur laden nichts davon.
- **Kein WebGL** (EN3-13 bleibt): Bei ≈ 400 Elementen ist DOM mit Compositor-Transform die schnellste Lösung. Canvas oder WebGL lohnt erst bei Tausenden bewegter Elemente und müsste Text, Treffer und Bedienhilfen neu bauen. Keine `filter`, kein `backdrop-filter`, keine weichen Schatten auf mehr als 10 Elementen.

**Nicht-Umfang.**
- Neue Klang-Werte und DSP-Änderungen; einzige Ausnahme sind die zwei Eingangs-Pegel als Live-Wert. Kein neues Speicherformat.
- MS2000R (Rack: KEYBOARD-Taste, PHONES), DEMO (EXIT + GLOBAL), Global-Werte des Geräts (A.10).
- Fotorealistische Texturen und Bild-Dateien, der Herstellername, die Gerätebezeichnung als Schriftzug.

**Daten.**
- Kein neues Feld in Sound oder Projekt; Format bleibt 5 (`PROJECT_FORMAT` 5, `SOUNDS_FORMAT` 2).
- **Ansichtszustand** (nur Sitzung): `{ansicht, feld, modus, seite, cursor, fxSel, patchSel, seqSel, spielHaelfte, seitenSprung}` (`seitenSprung` = GLOBAL 1D, Vorgabe an).
- **Live-Wert** wie die Räder (B.1): `R.mkInTrim[uid] = {e1, e2}` 0…127; 0 = stumm, 1…100 = −40…0 dB, 100…127 = 0…+6 dB (je linear in dB), Vorgabe 100. Nicht gespeichert, kein Undo. Umgesetzt als je ein GainNode vor dem Worklet-Eingang; bei 0 dB (Faktor genau 1) bitgleich.

**Berührungspunkte und Reihenfolge.**
- **Wiederverwendet:** `sKnob`/`ctlPrecision`, `openPop`, `sheetFrame` mit Reitern und LCD-Zeile, die Zusatz-Ansichten (SCHRITTE MK6, 16 BÄNDER MK7, EIGENE MK3), die Räder (MK1), die ORIGINAL-Logik, alle Bindungen von MK1–MK7, `MK_LABEL`.
- **Neu:** Platte, Lage-Tabelle als Datenblock, LCD 2 × 16 mit Modi und Seiten, Übersicht, Zoom-Felder, Lagekarte, Spiel-Ansicht, E1/E2-Pegel.
- **Entfernt:** das microKORG-Bedienfeld (Umfang 6).
- **Braucht** MK5–MK7 zusammengeführt (4.15.0), weil Arp-, Seq- und Vocoder-Elemente gebunden und ihre Oberflächen-Tests umgestellt werden.
- **Darf parallel** zu MK8 und MK10–MK13 gebaut werden. Wer später zusammenführt, passt an (Teil G Nr. 18): Programm-Wahl von MK8, Seiten-Einträge von MK11–MK13. MK10 berührt das Bedienfeld nicht (Aufnahme-Seite unter Menü → Sounds).

**Dauer** 19–22,5 h in drei Bau-Abschnitten:
1. Platte, Lage-Tabelle, Aussehen, Bindung aller Elemente samt Vocoder (8–9,5 h).
2. Anzeige mit Modi und Seitenplan, Umzug der Funktionen, Abbau und Umstellung der Tests (6–7 h).
3. Übersicht, Zoom, Spiel-Ansicht, Gesten, Formate, Leistung, Abnahme (5–6 h).

Dazu 1–2 h Fach-Prüfung. **Version 4.21.0**, wenn MK-P nach MK13 ausgeliefert wird. Kommt es früher (wie E.2 Nr. 7 empfiehlt), bekommt es nach der Regel „Tore“ (E.1) die nächste freie Zwischennummer nach dem zuletzt ausgelieferten Paket, z. B. 4.15.1 direkt nach MK7 oder 4.16.1 nach MK8. Die Nummern der anderen Pakete ändern sich dadurch nicht, 4.21.0 bleibt dann frei, und die Pakete nach der MK-Gruppe beginnen weiter bei 4.22.0 (E.4; EN2-14 verlangt nur streng steigende Nummern). **Budget** +25 KB netto (neu ≈ +50 KB, entfernt ≈ −25 KB) · Format bleibt 5.

**Abnahme-Checkliste**
- [ ] **MK-P-01 Vorlage (M-VORLAGE**, ersetzt M-SKIZZE für das MS-2000-Bedienfeld, B.6 Nr. 5): `mkPanel().elements` gegen die Lage-Tabelle.
  - Jede ID ist da; jede Mitte liegt innerhalb ± 0,8 % der Breite und ± 1,2 % der Höhe. Die Abstände in den Paaren OCTAVE, BANK, PAGE und in den Viererreihen (Arpeggiator, Anzeige-Feld) sind 4,3 % ± 0,05.
  - Jeder Sektionsrahmen erreicht IoU ≥ 0,9; die 16-Spalten-Regel hält ± 0,3 %; das Seitenverhältnis ist 1,95 ± 0,01.
  - Je Zeile A–D stimmt die Reihenfolge links → rechts, je Sektion oben → unten.
  - Übersicht und Zoom zeigen in allen Formaten dieselben relativen Lagen (± 1 px; reine Skalierung).
- [ ] **MK-P-02 Bildvergleich:**
  - Bildschirmfoto der ganzen Platte, gerendert in 1400 × 718 px. Dasselbe Linien-Verfahren wie bei der Vermessung findet die Sektionsrahmen in Foto und Zeichnung. Jeder Rahmen liegt ≤ 0,8 % der Breite bzw. ≤ 1,2 % der Höhe neben seinem Gegenstück; ein fehlender oder zusätzlicher Rahmen ist ein Fehler.
  - Dazu ein Überlagerungsbild (Zeichnung zu 50 % über dem Foto) für FP-TOUCH und Xanders Blick. Es bleibt **privat** im Scratchpad bzw. im Chat, nie im Repo oder in CHANGES (Handbuch-Bild, E.5 Nr. 5).
- [ ] **MK-P-03 Jedes Element wirkt:** Für jedes Element mit `bind` gibt es eine CDP-Touch-Geste in der Zoom-Ansicht (Ziehen 60 px bzw. Tipp).
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
  - Jeder `normMk`-Pfad (außer `v`) ist über Platte oder Seite erreichbar (Liste aus INIT AM).
  - EDIT + Taste n öffnet die Seite des Seitenplans, für Synth und Vocoder. PAGE läuft alle Seiten vor und zurück. CURSOR wählt, −/+ ändern um eine Geräte-Stufe und klemmen. Seiten-Sprung, Tipp auf die Anzeige (Liste bzw. Zusatz-Ansicht), EXIT und WRITE wirken.
  - COMPARE (EDIT + EXIT) zeigt den gespeicherten Stand und kehrt zurück.
  - Die UTILITY-Werkzeuge liefern dieselben Ergebnisse wie die alten SHIFT-Werkzeuge: Die Tests aus MK3, MK6 und MK7 laufen über den neuen Weg.
  - GLOBAL 1A/1B bestehen die MK7-Eingangs-Tests, 1C ändert `tr.kbOct`.
  - Seite ARP-SCHRITTE schaltet `arp.steps` wie MK5.
- [ ] **MK-P-06 Marke** (EN3-05, B.6 Nr. 9):
  - Die Datei-Prüfungen sind unverändert (genau 1 × „MS 2000“ in der Datei).
  - Im Text des Bedienfelds steht „MS 2000“ genau einmal, im Namensfeld, gebildet aus `MK_LABEL` (ein Test-Build mit anderer Konstante ändert das Feld).
  - Kein Korg, microKORG, RADIAS, DWGS, VOX, „ANALOG MODELING“ in Aufdruck, `aria-label`, Hilfe- und LCD-Zeilen.
  - 0 neue `@font-face`, kein `data:image`, kein `<img>`.
  - Namensfeld: berechnete Schrift = App-Schrift, Gewicht ≤ 600, `font-stretch` normal, keine Verzerrung.
  - FP-SICHER prüft die Bildschirmfotos mit dem Auge.
- [ ] **MK-P-07 Trefferflächen und Platz:** M-PLATZ (B.6 Nr. 5, mit Safe-Area- und Home-Balken-Durchgang) in P1, P2, P3, L1, L2, W, 428 × 926 und 926 × 428, für Übersicht, jedes Zoom-Feld, die Spiel-Ansicht (beide Hälften), EDIT, GLOBAL und den Vocoder.
  - Jede aktive Trefferfläche ist ≥ 44 × 44, ohne Überlappung, ganz im sichtbaren Körper und deckt ihr Element ganz ab (auch am Feldrand, Oberfläche „Trefferflächen am Feldrand“).
  - Elemente außerhalb des Feldes sind abgedeckt und reagieren nicht (`elementFromPoint` trifft die Abdeckung).
  - Jedes Element liegt in mindestens einem Feld ganz.
  - Jede Beschriftung erfüllt scrollWidth ≤ clientWidth; die Seite scrollt nicht waagrecht.
  - Reiter und Lagekarte sind ≥ 44 × 44.
- [ ] **MK-P-08 Gesten** (CDP-Touch):
  - Regler: senkrecht = Wert; Fein × ¼ ab 64 px, × 1⁄16 ab 140 px, × ¼ mit ruhendem zweiten Finger; Doppeltipp = Standard.
  - Wischen von freier Fläche oder Taste wechselt genau ein Feld in Wischrichtung (Einrasten ≤ 250 ms); Wischen ab einem Regler verschiebt nie. Ein Tasten-Tipp mit > 8 px Bewegung wird verworfen.
  - Ein Tipp auf einen Nachbarn wechselt in dessen Feld. Ein Tipp in der Übersicht öffnet das Feld unter dem Finger. Lagekarte bzw. Reiter GERÄT führen zur Übersicht.
  - Drehen behält die zuletzt bediente Sektion. Zwei Regler mit zwei Fingern geben zwei Undos. Räder, Tastatur und ein Regler gehen gleichzeitig.
  - Kein Lang-Druck mit Bedeutung; bei `prefers-reduced-motion` keine Animation. Pinch, falls gebaut, nur aus der Übersicht.
- [ ] **MK-P-09 Leistung.** Referenz = Chromium mit CPU-Drosselung × 4, DPR 3, 390 × 844 und 844 × 390, ein Projekt mit 4 Spuren spielt (2 MS-2000-Spuren mit Arp und Seq).
  - (a) **Aufbau** beim ersten Öffnen: Häppchen ≤ 16 ms, fertig ≤ 150 ms, kein `longtask` > 50 ms.
  - (b) **Bilder:** Eine Skript-Sitzung von 10 s (Übersicht → Zoom → alle Felder wischen → 4 Regler drehen → EDIT-Seiten → Spiel-Ansicht) braucht laut Trace ≤ 16 ms Hauptfaden-Arbeit je Bild in ≥ 99 % der Bilder, keines > 33 ms; rAF-Intervall p95 ≤ 17,5 ms.
  - (c) **Layout:** 0 Layout-Ereignisse während Übergängen und Wischen; beim Drehen höchstens 1 Layout je Bild, begrenzt auf die Anzeige.
  - (d) **Kein Layout-Sprung:** 0 `layout-shift`-Einträge über alle Zustandswechsel; M-ANSICHT ≤ 2 px für Rahmen, Reiter, Räder und Tastatur.
  - (e) **Speicher:** Bedienfeld-Layer (CDP LayerTree) ≤ 48 MB; außerhalb von Übergängen ≤ 2 eigene Layer.
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
  - Anzeige 2 × 16 ohne Umbruch. Keine Holzwangen.
- [ ] **MK-P-12 Abbau und Umstellung:**
  - Kein DOM-Knoten und kein Quelltext des microKORG-Bedienfelds bleibt übrig (Drehschalter, 7-Segment, Matrix, Holzwangen, Halb-Ansicht; Prüfung über Klassennamen).
  - CHANGES nennt jeden umgestellten Oberflächen-Test aus MK1–MK7 mit altem und neuem Weg. Alle Abnahmen aus MK1–MK7, die nicht die Oberfläche betreffen, bestehen unverändert.
  - B.6 Nr. 5 nutzt für das MS-2000-Bedienfeld M-VORLAGE. Hilfe-Zeilen (L10) sind vollständig. Budget ≤ +25 KB netto.

**Tests.** `mkp-vorlage.mjs`, `mkp-bindung.mjs`, `mkp-seiten.mjs`, `mkp-ansicht.mjs`, `mkp-leistung.mjs`, `mkp-daten.mjs`, `mkp-marke.mjs`. Privat, nur im Scratchpad und nie in `bau/tests/` oder im Repo: der Bildvergleich `mkp-bildvergleich.py`, weil er die Zeichnung aus dem Handbuch liest (E.5 Nr. 5). Die Lage-Tabelle selbst enthält nur Lagen und Aufdruck-Wörter (Fakten) und darf in die öffentlichen Tests.

**Fach-Prüfung:** **FP-TOUCH ●** Haupt-, **FP-IPHONE** und **FP-SICHER** Zweit-Blick.

**Zwischenstand** nach MK-P (Artifact und Pages, EN3-17 sinngemäß), damit Xander das Gerät sieht.

**iPhone** (Xander, 12 Pro Max):
1. Eine MS-2000-Spur öffnen und die Übersicht hochkant und quer ansehen: Ist das dein Gerät (Anordnung von oben nach unten, Farbe)?
2. FILTER antippen → Zoom. CUTOFF drehen, dabei seitlich wegziehen (fein). Nach rechts zu AMP und ARPEGGIATOR wischen, nach unten zur Reglerreihe.
3. Reiter SPIEL: PITCH- und MOD-Rad und Tastatur spielen, OCTAVE, ARP ON/OFF, LATCH; ab MK8 mit BANK und den Schritt-Tasten Programme wählen.
4. EDIT, dann Schritt-Taste 6 (FILTER): mit PAGE, CURSOR und −/+ durch die Seiten, EXIT.
5. MOD SEQUENCE ON/OFF, dann SEQ EDIT SELECT: Die 16 Regler bewegen die Schritte, die Schritt-Tasten laufen mit.
6. Leistungs-Probe „Bedienfeld“ schicken.

**Geräte-Abgleich:** entfällt, weil kein MS2000 vorhanden ist (Xander hat einen microKORG). Lage und Aufdruck sind durch die Zeichnung HB-MS S. 5 belegt. Farben, Material und Anzeige-Farbe gleicht Xander nach Blick oder Foto ab; das ändert nur die Farb-Variablen (ein Ort, `MK-P-fix`).

**Risiken.**
- **Farben ohne Beleg:** Die Zeichnung ist schwarz-weiß. Farben und Anzeige-Farbe sind [U] und liegen deshalb gesammelt in Variablen.
- **Kleine Übersicht quer** (L1 ≈ 265 × 136 px): erkennbar, aber nicht lesbar. Gearbeitet wird in Zoom- und Spiel-Ansicht; quer gibt es 12 Felder und damit mehr Wischen als hochkant.
- **iOS-Safari:** Verkleinerte Schrift kann unscharf werden, und große Layer kosten Speicher. Abhilfe: Aufbau in Zoom-Größe, `will-change` nur im Übergang (MK-P-09 e).
- **Paralleler Bau:** MK8 und MK11–MK13 ändern dieselbe Bedienung. Die Regel in Teil G Nr. 18 legt fest, wer anpasst; Zusammenführen kostet dort je ≈ 0,5–1 h.
- **Umstellung der Tests:** Die Oberflächen-Tests aus MK1–MK7 werden umgestellt; eingeplant sind 2,5–3 h im Bau-Abschnitt 2.
- **Größe:** Mit dem üblichen Überzug (× 1,5) kostet das Paket ≈ +37 KB.

---

## Teil D — Aufnahme-Anleitung für die Speicherwellen (für MK10; an Xander weitergeben; nur iPhone)

**Wozu:** Die App bildet die 64 gespeicherten Wellen deines microKORG bisher nur nach. Du nimmst sie einmal auf, **direkt in der App auf deinem iPhone**. Die App rechnet daraus die echten Wellen. Danach werden sie in die App eingebaut, und alle hören sie (du hast „einbauen“ gewählt, H-2). Deine Aufnahmen selbst bleiben auf deinem iPhone; weiter geht nur ein kleines Wellen-Paket. Du brauchst keinen Rechner und kein MIDI.

**D.1 Was du brauchst (≈ 75 min, Pausen gehen)**
- microKORG mit Netzteil.
- Dein weißes **Yamaha AG06** (erste Version).
- Ein **Klinkenkabel** 6,3 mm (wie ein Gitarrenkabel): vom Ausgang **L/MONO** hinten am microKORG in die **Line-Buchse von Kanal 1** am AG06 (den runden Klinken-Teil der Kombi-Buchse). Kein Mikrofon.
- Das **USB-Kabel** des AG06 in den **Apple Lightning-auf-USB-3-Kamera-Adapter**, den Adapter ans iPhone, und das **iPhone-Ladekabel** in die Lightning-Buchse am Adapter (Strom; ohne Strom schaltet das iPhone das AG06 oft ab).
- **Kopfhörer am AG06** (PHONES) zum Mithören. Die App spielt während der Aufnahme nichts.
- **Am AG06** (Schalterlage am Gerät prüfen):
  - **TO PC** auf **DRY CH 1-2**.
  - **COMP/EQ** aus, **EFFECT** aus.
  - **+48V** (Phantomspeisung) aus.
  - **PAD** nur drücken, wenn die **PEAK**-Lampe von Kanal 1 beim Spielen aufleuchtet.
- Am iPhone: die App in **Safari** (Pages-Seite), nicht in der Claude-App (dort gibt es kein Mikrofon). Mitteilungen stumm (Fokus „Nicht stören“).

**D.2 microKORG einmal vorbereiten**
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

**D.3 In der App aufnehmen (so ist es gedacht)**
1. In Safari: Menü → Sounds → **Wellen aufnehmen** → Mikrofon erlauben. Die Seite zeigt das AG06 als Eingang. Steht dort rot „Sprach-Filter aktiv“: nicht aufnehmen, Bescheid sagen.
2. **Pegel-Test:** C4 halten und den **GAIN**-Regler von Kanal 1 am AG06 drehen, bis die Anzeige in der App **grün** ist. Danach nichts mehr am Pegel und an AMP LEVEL ändern. Wird eine spätere Welle rot (übersteuert): AMP LEVEL einmal für alles senken und von vorn anfangen.
3. Die App führt dich Schritt für Schritt. Bei jedem Schritt steht groß da, was du am microKORG einstellst. Dann [● Aufnehmen] und spielen: die sieben C von C1 bis C7, jedes **2 s halten, 1 s Pause**.
   - Zuerst **OCTAVE SHIFT −2** (Tastatur C1–C4): C1, C2, C3, C4.
   - Dann **OCTAVE SHIFT +1** (dreimal UP, Tastatur C4–C7): C5, C6, C7. Die Pause beim Umschalten darf länger sein.
   - Die App hört nach dem 7. Ton selbst auf, schneidet zu und zeigt ✓. Bei ✗ steht der Grund da: [Nochmal].
4. **Die Schritte** (die App zeigt sie in dieser Reihenfolge):
   - Schritt 1, Pegel-Test: C4, 2 s.
   - Schritt 2, Bezug: OSC1 WAVE **Saw**, CONTROL 1 = 0, CONTROL 2 = 0.
   - Schritte 3–66, Speicherwellen: OSC1 WAVE **DWGS**, CONTROL 2 = **1 … 64** (eine Welle je Schritt). Die App schreibt dafür „6. Stellung (Speicherwellen)“: Den Namen DWGS darf sie nicht zeigen (keine Korg-Wörter in der App).
   - Schritt 67, Stille: 10 s, keine Taste drücken (das Grundrauschen).
5. Aufhören und später weitermachen geht; die App merkt sich, wo du warst.

**D.4 Ersatzweg: GarageBand auf dem iPhone** (nur, wenn D.3 nicht geht; Bezeichnungen können je nach GarageBand-Version abweichen)
1. GarageBand → neuer Song → **Audio-Recorder**. Eingang: Kanal 1 des AG06, mono. Mithören in GarageBand aus (du hörst am AG06).
2. Je Datei: Aufnahme starten, die Töne wie in D.3 spielen, stoppen.
3. Teilen → **Song** → Format **AIFF** (oder WAV, wenn angeboten; nicht AAC/M4A) → **In Dateien sichern**. Namen genau so (Endung .wav oder .aif): `test` (C4, 2 s), `ref-saege`, `sw-01` … `sw-64`, `stille` (10 s). Kürzer: eine Datei je 8 Wellen (`sw-01-08` … `sw-57-64`) mit mindestens 3 s Stille zwischen zwei Wellen.
4. In der App: Menü → Sounds → Wellen aufnehmen → **[Dateien laden]**: zuerst `test`, dann alle anderen.

**D.5 Prüfen und abgeben**
- In der Liste der App haben alle 67 Schritte ein ✓ (beim Ersatzweg: alle Dateien geladen, keine rote Zeile).
- Deine Wellen klingen jetzt schon in der App auf deinem iPhone: OSZ 1 → WELLE Speicherwelle, mit dem microKORG vergleichen.
- [**Wellen an den Bau geben**] → im Teilen-Blatt die Datei an den Orchestrator schicken (Weg nach H-15). Die Datei enthält nur die gerechneten Wellen, keine Aufnahme.

**D.6 Eich-Aufnahmen:** entfällt (H-6: nein, Abgleich nach Gehör).

**D.7 Test-Programme für den Import:** entfällt (MK9 zurückgestellt, EN3-21).

---
## Teil E — Reihenfolge, Versionen, Budgets, Größe

### E.1 Pakete (verbindlich; ergänzt N2 Teil E und den „Nachtrag zur Reihenfolge“)

Lage: Die MK-Gruppe beginnt direkt nach G-P2 (V2d′ ✓ 4.6.0, V2e 4.7.0, V2e′ 4.8.0, VS3). VS3 wartet auf das Tor N7V-12, das noch nicht erreicht ist (`fragen-xander-9.md`). Darum beginnt die Gruppe nach V2e′ mit **MK0 (4.8.1)**, und MK1 bekommt **4.9.0**. **Rev. 2:** MK9 ist zurückgestellt und steht außerhalb der Folge; MK10 bis MK13 rücken je eine Nummer vor.

| Paket | Titel | Version | KB | h | braucht | Format | Tor | Untergruppe / Zwischenstand |
|---|---|---|---|---|---|---|---|---|
| MK0 | Vorab-Schutz: Klänge neuerer Engines bleiben | 4.8.1 | +4 | 2–3 | V2e′ | 4 | – | G-MK1 |
| MK1 | Klangkern T1, Bedienfeld wie das Original, Räder, Leistungs-Probe | 4.9.0 | +115 | 19–22 | MK0, V2e′ (Reihenfolge), V4a (SXF) | **4 → 5** | Rollout `max_format` 5 (Xanders Okay, nach MK0) | G-MK1 · Stand |
| MK2 | Alle Oszillator-Arten, PATCH 1–4 (Speicherwellen nachgezeichnet) | 4.10.0 | +42 | 7–8 | MK1 | 5 | – | G-MK1 |
| MK3 | Zwei Timbres, Split, Stimmung | 4.11.0 | +33 | 7,5–8,5 | MK2 | 5 | – | G-MK1 |
| MK4 | Mod-FX, Delay, EQ | 4.12.0 | +25 | 5–6 | MK2 (EDIT-WAHL 2) | 5 | – | G-MK1 · **Stand** |
| MK5 | Step-Arpeggiator | 4.13.0 | +33 | 7,5–8,5 | MK3 | 5 | – | G-MK2 |
| MK6 | Mod-Sequenzer 3×16 | 4.14.0 | +36 | 8–9 | MK2, MK3 | 5 | – | G-MK2 |
| MK7 | Vocoder 16 Bänder, Eingänge | 4.15.0 | +52 | 11–12 | MK2, MK3, MK4, VS1 ✓ | 5 | – | G-MK2 · **Stand (Pages)** |
| MK8 | Werksklänge, 8 Genre-Bänke | 4.16.0 | +40 | 8–9 | MK2–MK7 | 5 | – | G-MK2 · **Stand** |
| ~~MK9~~ | Import .syx/.prg (lokal) — **zurückgestellt** (EN3-21) | – | (+27) | (6–7) | MK7 | 5 | MK9-T | außerhalb der Folge, nicht in der Summe |
| MK10 | Speicherwellen: Aufnahme in der App, Einbau | 4.17.0; Einbau nächste freie Zwischennummer | +80 | 10,5–12 | MK2, MK7 (Mikrofon-Abgriff); Einbau: MK8 (Pegel-Nachlauf) | 5 | Einbau: **MK10-T** (Wellen-Paket) | G-MK3 · **Stand** (Aufnahme-Seite) und **Stand** (Einbau) |
| MK11 | RADIAS 1: Filter 2, Verzerrer | 4.18.0 | +25 | 6–7 | MK3, MK6 | 5 | – | G-MK4 |
| MK12 | RADIAS 2: EG3, Formant-Osz. | 4.19.0 | +22 | 5,5–6,5 | MK11, MK7 (Vokal-Quelle) | 5 | – | G-MK4 |
| MK13 | RADIAS 3: 8 Stimmen | 4.20.0 | +10 | 3–4 | MK3, MK7 | 5 | – | G-MK4 · **Stand** |
| **MK-P** | Bedienfeld wie der MS2000 (ersetzt B.3; nur Oberfläche) | 4.21.0; bei früherer Auslieferung die nächste freie Zwischennummer (Regel „Tore“) | +25 | 19–22,5 | MK5–MK7 zusammengeführt (4.15.0); parallel zu MK8, MK10–MK13 | 5 | – | G-MKP · **Stand** |
| **Summe** | 14 Pakete (MK9 zurückgestellt) | 4.8.1, 4.9.0–4.20.0, MK-P 4.21.0 oder Zwischennummer (+ Einbau-Zwischennummer) | **+542** | **≈ 119–138,5** | | einmal | | |

- **Rev. 1 gegenüber der ersten Fassung:** +23 KB und +13–14 h (MK0 neu; Protokoll, Priorität, `engXf`, Bruchwerte, MIDI-Rad und Probe in MK1; [T1+2]/Solo in MK3; Intervall-Satz und KEYS in MK5; Mikrofon-Abgriff, Abgriff vor dem Fader und Vokal-Quelle in MK7; Import-Regeln in MK9; Wellen-Leser und eigene Datenbank in MK10; MK12 −0,5 h). Dazu kommen nach H-9 ≈ +5 h und +12 KB in V5d, V6a, V5c, V1d und VC4 (Teil G Nr. 4).
- **Rev. 2 gegenüber Rev. 1** (Xanders Entscheidungen 25.10.): +47 KB und ≈ +5 h. MK9 fällt aus der Summe (−27 KB, −6–7 h). MK1 +15 KB und +5–6 h (Bedienfeld wie das Original, Räder), MK3 +1 KB und +0,5 h, MK6 +1 KB und +0,5 h, MK7 +2 KB und +0,5 h (Vocoder-Stellungen, LEDs), MK10 +55 KB und +4–4,5 h (eingebaute Wellen +45 KB, Aufnahme-Seite, Einbau). MK10–MK13 rücken eine Versionsnummer vor.
- **Nachzeichnung (25.10., Prot. 57) gegenüber Rev. 2:** MK2 +7 KB und +0,5 h (Datenblock der nachgezeichneten Wellen statt freier Rezepte). Summe +517 KB, 100–115,5 h.
- **MK-P (26.10., Xander: „genauso wie der MS 2000“):** +25 KB und +19–22,5 h, Version 4.21.0; die Pakete nach der MK-Gruppe rücken auf ab 4.22.0 (E.4). MK-P braucht MK5–MK7 zusammengeführt (4.15.0) und darf parallel zu MK8 und MK10–MK13 gebaut werden. Die Bedienung von MK11–MK13, die der MS2000 nicht hat, liegt auf den LCD-Seiten nach dem Seitenplan von MK-P, nicht mehr auf SHIFT-Ebenen (Teil G Nr. 18). Wird MK-P vor MK13 ausgeliefert, bekommt es nach der Regel „Tore“ die nächste freie Zwischennummer nach dem zuletzt ausgelieferten Paket (z. B. 4.15.1 oder 4.16.1); alle anderen Nummern bleiben, 4.21.0 bleibt frei, und der Orchestrator trägt die vergebene Nummer hier ein. Summe +542 KB, 119–138,5 h.
- **Tore** (E.5 Nr. 3 sinngemäß): MK9 ist zurückgestellt, nicht nur verschoben; es hält nichts auf. Ist MK10-T geschlossen (das Wellen-Paket fehlt noch), wartet nur der Einbau-Abschnitt von MK10; MK11–MK13 laufen weiter. Der Einbau, ein vor MK13 ausgeliefertes MK-P und ein später doch gebautes MK9 bekommen die nächste freie Zwischennummer, z. B. 4.15.1, 4.17.1 oder 4.20.1, damit die Versionen streng steigen (EN2-14). Die Abnahmen nennen darum keine feste Vorgänger-Nummer (B.6 Nr. 1).
- **Fach-Prüfung:** 14 × 1–2 h zusätzlich (EN2-29).
- **Gesamtdauer** ≈ 133–167 h inkl. Fach-Prüfung (mit MK-P; ohne ≈ 113–142 h).

### E.2 Begründung der Reihenfolge

1. Ab MK1 ist etwas hörbar. MK1–MK4 ergeben den kompletten Klang eines MS2000-Timbres mit Effekten, das ist der erste Stand für Xander.
2. MK3 (Timbres) kommt vor Arp, Seq und Vocoder, weil Arp-Ziel, Seq je Timbre und Vocoder-Modus darauf aufsetzen.
3. MK8 (Werksklänge) steht nach allen Bausteinen, damit kein Werksklang eine „Annäherung“ braucht. Gleiches Prinzip wie V10P (N2 EN2-10).
4. Der Import (MK9) ist zurückgestellt: Xander hat keinen Rechner, kein MIDI und keine .syx/.prg-Dateien (EN3-21). Die Speicherwellen (MK10) stehen hinter dem Kern, weil die Aufnahme-Seite den Mikrofon-Abgriff aus MK7 nutzt und der Einbau die Werksklänge aus MK8 nachstimmt. MK10 Abschnitt 1 darf direkt nach MK7 vorgezogen werden, damit Xander früher aufnehmen kann; der Einbau folgt, sobald das Wellen-Paket da ist. Die Versionsnummer folgt dann der Bau-Reihenfolge.
5. Die RADIAS-Teile kommen zuletzt, wie im Plan Punkt 4 („danach“).
6. MK0 kommt vor MK1, damit beim ersten Format-5-Speichern schon jeder neuere ausgelieferte Stand AM-Sounds unverändert lässt.
7. **MK-P** (26.10.) kommt nach dem Zusammenführen von MK5–MK7 (4.15.0), weil es deren Elemente (Arp, Mod-Seq, Vocoder mit den weißen Namen) bindet und ihre Oberflächen-Tests umstellt. Es berührt keinen Klang und darf darum parallel zu MK8 und MK10–MK13 laufen; wer später zusammenführt, passt nach Teil G Nr. 18 an. Weil Xander das Gerät früh sehen will, sollte MK-P möglichst bald nach 4.15.0 ausgeliefert werden; es bekommt dann die nächste freie Zwischennummer (E.1 „Tore“).

### E.3 Größe und Startzeit (EN2-28)

Grundlage: 4.6.0 = 2 473 307 B. Restplan-Budgets aus N2 E.4, Reihenfolge nach N3.0.1 Nr. 6 (VS3 vor MK0), mit den **Rev.-2-Budgets** (MK9 nicht im Plan, MK10 +80 KB, MK1 +115 KB; MK2 +42 KB nach Prot. 57) und den +12 KB aus H-9. MB = 10⁶ B, KB = 1024 B. Rechnung wie Rev. 1 (`scratchpad/rev1-tools/size2.py`), am 25.10. mit den Rev.-2-Budgets neu gerechnet.

**Ist-Faktor:** Die gebauten Pakete V0b…V2d′ hatten zusammen 755 KB Budget; die Datei wuchs um 2 473 307 − 1 316 464 B = 1 130 KB (**×1,5**, ganze Datei mit allen Fix-Schritten). Je Paket laut CHANGES lagen die Überzüge zwischen +23 % und +105 % (V4b +23 %, V4c +69 %, V2d +88 %, VO1 +105 %), über 15 Pakete seit V0a +29 % (**×1,3**). Die Spalte ×1,5 ist die Planungsgrundlage, weil sie die Grenze schützt; ×1,3 ist die untere Schätzung.

| Stand | nach Budget | ×1,3 | ×1,5 |
|---|---|---|---|
| nach V2e′ | ≈ 2,57 MB | ≈ 2,60 MB | ≈ 2,62 MB |
| nach VS3 (vor MK0; ohne VS3 alle MK-Zeilen ≈ −0,04 MB) | ≈ 2,61 MB | ≈ 2,65 MB | ≈ 2,67 MB |
| nach MK4 | ≈ 2,83 MB | ≈ 2,94 MB | ≈ 3,01 MB |
| nach MK8 | ≈ 3,00 MB | ≈ 3,15 MB | ≈ 3,26 MB |
| nach MK13 (mit MK10 eingebaut) | ≈ 3,14 MB | ≈ 3,33 MB | ≈ 3,47 MB |
| 4,5 MB erreicht bei | V9e | V7c | V5d |
| 5,0 MB erreicht bei | V10f | V9d′ | V8a |
| **Planende ohne MK** (alle übrigen Pakete aus N2 E.4) | ≈ 4,98 MB | ≈ 5,73 MB | ≈ 6,23 MB |
| **Planende mit MK** (MK10 eingebaut) | **≈ 5,52 MB** | **≈ 6,43 MB** | **≈ 7,04 MB** |
| dazu H-3 = 128 (+20 KB; nicht gewählt) | +0,02 MB | +0,03 MB | +0,03 MB |
| dazu MK9, falls später gebaut (+27 KB) | +0,03 MB | +0,04 MB | +0,04 MB |

- Die MK-Pakete selbst bleiben unter der Grenze (nach MK13 ≈ 3,1–3,5 MB; die eingebauten Wellen sind mitgerechnet). Die Grenze von 5,0 MB fällt aber **mitten im Plan**, nicht erst am Ende: nach Budget bei V10f, mit Ist-Faktor schon bei V9d′ (×1,3) bzw. V8a (×1,5). Laut Plan wären nach Gruppe 5 ≈ 2,18 MB erreicht gewesen, tatsächlich sind es heute 2,47 MB.
- **Startzeit:** Projekte ohne AM bleiben bei ≤ +20 ms (EN3-14, MK1-26). Je MK-Paket gilt §15.3 (≤ +150 ms gegen das Vorgänger-Paket, absolut ≤ 1,5 s ohne bzw. ≤ 4 s mit Drosselung ×4).
- **Ab 4,5 MB** nennt jedes Paket Größe und Startzeit (EN2-28); mit ×1,5 ist das ab ≈ V5d. Lösung nach **H-1** (entschieden: b) = SL1 (E.3a).
- **MK-P** (+25 KB, 26.10.) ist in der Tabelle noch nicht enthalten. Ab der Zeile „nach MK8“ kommen +0,03 MB nach Budget bzw. +0,04 MB mit ×1,5 dazu. Die Schwellen 4,5 und 5,0 MB können dadurch höchstens ein Paket früher fallen; der Orchestrator rechnet beim nächsten Größen-Stand mit `size2.py` nach.

### E.3a SL1 — Schlankheits-Paket (H-1 (b), entschieden 25.10.; kein MK-Paket, gehört in N2 E.4)

- **Auslöser:** wie EN2-28 die gescheiterte Startzeit-Abnahme, zusätzlich spätestens, wenn ein Stand 4,5 MB erreicht (mit ×1,5 ≈ V5d, nach Budget ≈ V9e). Der Orchestrator trägt das in N2 (EN2-28, E.5 Nr. 8) nach.
- **Umfang:** Das Sparziel wird an der dann aktuellen Datei gemessen und in CHANGES festgelegt. Die `text/plain`-Blöcke (Worklet, `sq-mk-src` mit Werksdaten und eingebauten Wellen, `sq-mkrec-src`) gepackt ausliefern und bei Bedarf entpacken; das Worklet spart so heute ≈ 78 KB. Für ≥ −1 MB braucht es den Haupt-Skriptteil als gzip + Base64 mit kleinem Start-Lader (`DecompressionStream`, dann `eval`).
- **Abnahme:** Verhalten bitgleich (alle Regressionen der gebauten Pakete), Startzeit nach §15.3 am iPhone gemessen (Median aus 5) nicht schlechter als vorher, Dateigröße ≤ Sparziel, keine Konsolenfehler, Worklet-ASCII.
- **Dauer** 5–7 h · **Version** die nächste freie Nummer beim Bau · **Budget** negativ (Sparziel).

### E.4 Versionsnummern der Pakete danach

Die Pakete nach der MK-Gruppe (V2a′, V2f, VL, V7a, VC2a, VS4 …) bekommen ihre Nummern **nach 4.21.0** (MK-P), also ab 4.22.0, in Bau-Reihenfolge (Rev. 2: eine Nummer früher, weil MK9 zurückgestellt ist; 26.10.: eine Nummer später wegen MK-P). Der MK10-Einbau, ein vor MK13 ausgeliefertes MK-P und ein später doch gebautes MK9 nehmen Zwischennummern (E.1); 4.21.0 bleibt dann frei, und es bleibt bei „ab 4.22.0“. Die Tabelle N2 E.4 wird dort vom Orchestrator fortgeschrieben, das ist keine Änderung des Umfangs.

**VS3** (Tor N7V-12):
- Wird VS3 nach MK0 und vor MK1 gebaut, bekommt es **4.8.5**. Wird es vor MK0 gebaut, bekommt es 4.8.5 und MK0 die nächste freie Zwischennummer (4.8.6).
- Wird es später gebaut, bekommt es die nächste freie Zwischennummer nach dem zuletzt gebauten Paket.

### E.5 Regeln für den Bau (ergänzt N2 E.5)

1. **Bau-Ort** (wie EN2-17): Dieser Nachtrag, HB-MS und HB-MK (privat, nur lesen), KF, `fragen-xander-9.md`. Für den MK10-Einbau das Wellen-Paket aus der App (privat neben den Handbüchern). Für MK2 die Nachzeichnung `scratchpad/dwgs-trace/` (`dwgs-64-compact.json`, `dwgs-64.json`, `PRUEFUNG.md`; privat wie die Handbücher). Fehlt etwas, wird das Paket bzw. der Abschnitt nicht begonnen.
2. **Rollout** (N2 G.8): MK1 `max_format` 5, erst wenn MK0 ausgeliefert ist. Jedes Paket hebt `max_app`. Alles nur mit Xanders ausdrücklichem Okay je Schritt, nie im Klassenzimmer-Projekt, nie am Webseiten-Repo (EN2-32).
3. **Zwischenstände** nach EN3-17 auf die Artifact-Adresse, die Pages-Seite und den githack-Spiegel (EN2-15).
4. **CHANGES** je Paket: Messwerte der Abnahme, Node- und Chromium-CPU (als Vielfaches der VA-Stimme, dazu absolut), Größe, Startzeit (ab 4,5 MB Pflicht), Fach-Prüfung, iPhone-Punkte, Geräte-Abgleich (wenn schon da), Lücken, der Vorgänger-Stand (Version) für alle „bitgleich“-Abnahmen. Liegt ein MK-Paket > 50 % über seinem Budget, nennt CHANGES das mit einem Schlankheits-Vorschlag (N2 §15.3-Regel).
5. **Werksnamen privat:** Die Werksnamen-Listen (EN3-07) liegen nur in `scratchpad/manuals/werksnamen.local.json`. `wip-push.sh` und die Auslieferung kopieren sie nie. Eine Prüfung sucht 3 Werksnamen als Stichprobe in `bau/tests/` und im Repo (0 Treffer). Ebenso privat bleiben das Wellen-Paket aus MK10, alle Aufnahmen, die Bild-Referenz (PDF) und die Dateien der Nachzeichnung (sie tragen die Wellennamen); in die App kommt nur der Datenblock aus MK2, ohne Namen. **Diese Spec** bleibt im Repo gesichert, wie bisher in `origin/arbeitsstand` (Xanders Regel „nie Arbeit verlieren“, 25.10.; frühere Frage H-12 entfällt): Sie enthält nur Parameter-Fakten (Namen, Bereiche, Seitenangaben), keine Textpassagen aus den Handbüchern.

---

## Teil F — Fach-Prüfung (ergänzt N2 Teil J, J.3; ● = blockierend)

| Gruppe | Paket | Haupt-Blick | Zweit-Blick |
|---|---|---|---|
| G-MK1 | MK0 ● | FP-SICHER | FP-DSP |
| G-MK1 | MK1 ● | FP-DSP | FP-TOUCH, FP-IPHONE |
| G-MK1 | MK2 | FP-DSP | FP-KLANG, FP-SICHER |
| G-MK1 | MK3 ● | FP-DSP | FP-TOUCH |
| G-MK1 | MK4 | FP-DSP | FP-IPHONE |
| G-MK2 | MK5 ● | FP-SONG | FP-TOUCH |
| G-MK2 | MK6 | FP-DSP | FP-SONG |
| G-MK2 | MK7 ● | FP-DSP | FP-IPHONE, FP-SICHER |
| G-MK2 | MK8 ● | FP-KLANG | FP-TOUCH |
| – | MK9 ● (zurückgestellt; erst beim Bau) | FP-SICHER | FP-DSP |
| G-MK3 | MK10 | FP-DSP | FP-IPHONE, FP-SICHER |
| G-MK4 | MK11 | FP-DSP | FP-IPHONE |
| G-MK4 | MK12 | FP-DSP | FP-KLANG |
| G-MK4 | MK13 ● | FP-IPHONE | FP-DSP |
| G-MKP | MK-P ● | FP-TOUCH | FP-IPHONE, FP-SICHER |

Zusätzlich prüft **FP-DSP in jedem MK-Paket**:
- die W-Tabelle gegen den Code (eine Quelle, keine Schatten-Kurven);
- „Aus = bitgleich“ gegen den Vorgänger-Stand (B.6 Nr. 1);
- NaN/Inf bei Extremwerten (alle Regler auf Anschlag, Resonanz 127, Rückkopplung 127, 20 s);
- **Filter-Stabilität** (B.6 Nr. 10): W-29 mit C1 127 / C2 127 bei C8 und der Vocoder mit FC-MOD von einem 50-Hz-LFO voller Tiefe, je 20 s mit −6-dBFS-Rauschen: kein NaN/Inf, Spitze ≤ +6 dBFS;
- **Denormale** (B.6 Nr. 11): 60 s Stille nach Vollaussteuerung durch jeden neuen Filterweg; jedes 1-s-Lastfenster ≤ 1,1 × der ersten stillen Sekunde (Node, x86);
- gefaltete Energie nur nach B.6 Nr. 12;
- Worklet-ASCII.

**FP-SICHER** prüft in MK0, MK1, MK2, MK7, MK10 und MK-P (und in MK9, falls es gebaut wird) das Markenwort-Verbot (B.6 Nr. 9 a, b und c: genau eine Fundstelle „MS 2000“, kein Logo, keine Korg-Schrift) und die Upload-Wege; in MK2 zusätzlich, dass der Datenblock nur gerechnete Teiltonwerte ohne Namen enthält und weder Bild noch PDF in Repo oder App kommt; in MK10 zusätzlich, dass nur die gerechneten Wellen eingebaut werden und keine Aufnahme die App verlässt; ab MK9 auch EN3-08a und MK-R2.

**FP-TOUCH** prüft in jedem MK-Paket mit Bedienfeld-Änderung M-SKIZZE (B.6 Nr. 5), die Trefferflächen ≥ 44 × 44 und die Bildschirmfotos gegen die Referenz-Skizze (B.3). Ab MK-P prüft es stattdessen M-VORLAGE gegen die Lage-Tabelle, die Zoom-Felder und den Bildvergleich MK-P-02.

---

## Teil G — Hinweise und Pflichten für andere Pakete (wo sich Umfang oder Abnahme ändert, steht es beim Punkt)

1. **VK** (N1 A.10), Punkte 5–6 (Osz.-FM, Ringmod): dürfen den AM-Code (PM-Pfad aus MK2, Ringmodulator aus MK1) mitbenutzen, statt neu zu bauen. Die Abnahmen VK-06, VK-07 bleiben.
2. **VK2** (N2 D.6.4), Punkte 1–2 (Phaser, Flanger als Spur-Effekt): dürfen die Formeln (W-31) und die Prüfskripte aus MK4 mitnutzen. Der Effektkern von MK4 sitzt aber im AM-Zweig des Worklets. VK2 braucht einen eigenen nativen oder Spur-Worklet-Einschub (`fx.phaser`, `fx.flanger`, `fx.crush`), der auch für Drums und ohne AudioWorklet geht (FX-Block „native Web Audio nodes only“, Z. 9423; `buildChain` Z. 12013). Die Abnahme bleibt.
3. **VI2a** („Arp mit ZUFALL“): Der Arp-Kern aus MK5 ist engine-frei gebaut. VI2a entscheidet, ob es ihn für andere Engines nutzt.
4. **MOD-R1/PAD-R1: V5d, V5b/c, V6a, V1d, VC4** (H-9 = ja, entschieden 25.10.; EN3-18). **Umfang und Abnahme ändern sich:** V5d-01 deckt auch die `mk`-Pfade beider Timbres mit neuen DST-Nummern ab (heute fest bis `NDST` 22, Z. 3560–3561); V5b/c nehmen die AM-Pfade in Stränge und LOCK auf; V6a interpoliert Ganzzahl-Pfade und schaltet Listen am Ende des Bereichs (Nr. 5); V1d-02 nimmt AM als Pad-Quelle auf; VC4-02 nimmt das AM-Schema auf (Eingabe „Pfade aus MODT“). Mehrbedarf in N2 E.4 (Schätzung): V5d +2 h/+6 KB, V6a +1 h/+2 KB, V5b/c +0,5 h/+1 KB, V1d +1 h/+2 KB, VC4 +0,5 h/+1 KB, zusammen ≈ +5 h und +12 KB. (Die Rev.-1-Ausnahme für den Fall „nein“ entfällt, weil Xander ja gesagt hat.)
5. **V6a** (Klangzustände/Morph; H-9 = ja): AM-Werte werden als Ganzzahlen interpoliert. Listen und Schalter wechseln am Ende des Bereichs (KZ3).
6. **V7a** (Mix): Der Eingangs-Abgriff der AM-Spuren (vor Vol/Pan, MK7) behält nach dem Umzug des Faders in `track.mix` seine Bedeutung; „Quelle nur als Eingang“ trennt weiter `post` von Master und Sends.
7. **VS3, VS4**: Version nach E.4. Der Vocoder (MK7) speichert keine Takes. VS3 und VS4 nutzen den gemeinsamen Mikrofon-Abgriff aus MK7 (wie die Aufnahme-Seite aus MK10); ist VS3 vorher gebaut, stellt MK7 es darauf um (MK7-14). Mit VS3 kann der Modulator später ein Take sein, das ist nicht im Plan.
8. **N2 E.4**: MK0 = 4.8.1; MK-P = 4.21.0 (bei Auslieferung vor MK13 die nächste freie Zwischennummer, E.1); die Versionen nach der MK-Gruppe ab 4.22.0 (E.4 oben; MK9 zurückgestellt). Die Größen-Prognose ändert sich nach E.3 → H-1; SL1 (E.3a) kommt als Paket dazu (H-1 = b).
9. **Tabellen-Bau (Spec §10.1; V8a, V4e, V9a):** Der gemeinsame, DOM-freie Tabellen-Bau `mkTables` aus MK2 (Häppchen ≤ 8 ms, MKW-Tabelle im `AudioWorkletGlobalScope`, Kopie je Knoten als Rückfall) ist der Bau nach §10.1. V8a, V4e (statt „aus dem Tabellen-Bau von V8a“, N2 K2-40) und V9a nutzen ihn. Der Tabellenspeicher wird zusammen geprüft: MK2-08 ≤ 16 MB plus der V8a-Pool ≈ 8 MB. `eng 2` bleibt die Tabellen-Engine von V8a; AM ist `eng 3`.
10. **MK-R2 (EN3-19): VO3, VO4a–c, VC2b, VC2c, VC3, VC3b, VC4** (auch `sample` und `room.sendToClaudeSession`): **nur, wenn sie nach einem gebauten MK9 kommen** (MK9 ist zurückgestellt), rufen sie in jedem Weg vom Gerät weg `mkLocalStrip` auf, mit der Abnahme-Zeile (FP-SICHER): Ein 🔒-Sound mit Marker-Werten ergibt 0 Treffer im Mitschnitt aller Requests und Frames. Vor MK9 gibt es keine 🔒-Sounds und keine Pflicht; ein später gebautes MK9 rüstet die dann vorhandenen Wege selbst nach.
11. **Vocoder und Formant (Spec §18, N2 EN2-26, D.9):** MK7 liefert den Vocoder der VI-Stufe E; §18 behält nur „Vocoder für andere Engines“. Der Formant VOKAL aus §18 und der FM-FORMANT-Operator nutzen W-44 (Vokal-Quelle aus MK7, Oszillator aus MK12).
12. **V9d** (Resynthese, Quellen DATEI, Original lokal): nutzt den WAV/AIFF-Leser und den lokalen Speicher (eigene IndexedDB-Datenbank) aus MK10, statt sie neu zu bauen.
13. **VI1a** (Instrument-Vorlagen, Front-Rahmen): nutzt die Bedienfeld-Bausteine aus MK1 (Kappen-Regler, Drehschalter mit Auswahl-Liste, LED-Tasten, 7-Segment-Anzeige, Holzwangen; B.3), keine zweite Bauart derselben Elemente. Das Sektionsraster und `k6` der Rev. 1 gibt es nicht mehr. **Ab MK-P** gibt es Drehschalter, 7-Segment-Anzeige und Holzwangen nicht mehr: VI1a nutzt die MK-P-Bausteine (Metallplatte, Kappen-Regler mit Skala, LED-Tasten, LCD 2 × 16, Übersicht und Zoom) und baut fehlende Elemente selbst.
14. **V8a, V9a, V9b, V9d′** (Engines `mask`, `add`, `body`, `resyn`): brauchen keinen Formatsprung; MK0 hält unbekannte Engines undurchsichtig (EN3-04).
15. **V10P, V10d, VI3** (Geräte im ⓘ nach N2 D.1 Nr. 4): Die Markenwort-Prüfung B.6 Nr. 9 (a) gilt nur im AM-Teil, (b) über die ganze Datei nur für microKORG, RADIAS, DWGS und jede Schreibung von „MS 2000“ außer der einen Konstante `MK_LABEL`. Diese Pakete scheitern daran nicht, dürfen aber den Modellnamen MS2000 nicht im ⓘ nennen.
16. **Tastatur und Spielfeld (`#kbArea`):** Bei AM-Spuren sitzen BEND- und MOD-Rad links in der Tastatur-Zeile (MK1). Jedes spätere Paket, das `#kbArea` umbaut (z. B. Pads, Akkord-Tasten, Instrument-Vorlagen), behält diesen Platz und die Regel „nur bei AM-Spuren“; seine M-PLATZ-Prüfung läuft auch mit einer AM-Spur.
17. **Engine-Kopf (alle Pakete mit Blattkopf):** Die Engine-Wahl zeigt „MS 2000“ aus `MK_LABEL`; wer den Kopf ändert, prüft das Breiten-Budget aus B.3 Zeile 1 mit dieser Beschriftung.
18. **MK-P und parallele Pakete (MK8, MK10, MK11–MK13):** Wer nach dem anderen zusammenführt, passt an.
    - **MK8:** Kommt MK8 zuerst, baut es die Programm-Wahl nach B.3 (BANK-Drehschalter, SEITE, Nummerntasten 1–8, „A.24“), und MK-P verlegt sie auf BANK ▼ ▲ und die Schritt-Tasten. Dabei gilt Bank A…H = Genre-Bank 1…8, Taste 1–8 = Seite A, Taste 9–16 = Seite B, LCD „A01:Name“; die Wahl-Tests von MK8 werden umgestellt. Kommt MK-P zuerst, baut MK8 direkt so. `bank`/`slot` bleiben unverändert.
    - **MK11–MK13:** Ihre Bedienung (B.3 Ebene 2/3 von MIXER, FILTER, F-HK und STIMME) liegt ab MK-P auf den LCD-Seiten nach dem Seitenplan: 07 MIXER (DRIVE-TYP, DRIVE, ROUTING, F-BALANCE), 08 FILTER (F2-Werte, F2-HK), 11+ HK 3, 03 VOICE (STIMMEN-ZAHL). Neue Patch-Quellen und -Ziele gibt es nur auf den Seiten 14–17; ist ein solcher Wert gewählt, bleiben die LEDs der Platte dunkel. Ihre Oberflächen-Abnahmen (MK11-10, MK12-08, MK13-06) prüfen dann M-VORLAGE und MK-P-07 statt M-SKIZZE.
    - **MK10:** Die Aufnahme-Seite (Menü → Sounds) berührt das Bedienfeld nicht; auf der Platte steht nur der Wellenname SPEICHERWELLE.

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

**Zusätzlich gelesen für Rev. 2 (25.10.2026):** HB-MK S. 2–3 (Vorderseite, Bedienelemente; in der Nachprüfung auch die Strichzeichnung der Vorderseite, PDF 8–9, im Speicher als Text-Raster ausgewertet, ohne Bild-Datei), S. 8–14 (Programme, Performance Edit, Step-Arp, Edit Sync, Solo), Parameter-Liste und SHIFT-Funktionsliste (PDF 78). App 4.6.0: Raster `#app` je Ausrichtung (Z. 57–90), Blattkopf und Leiste quer (Z. 1426–1441), `#kbArea` (Z. 3494), `MIC_ASK` (Z. 29401), `tr.kbOct` (Z. 11491, 18917), `ENGINE_LABEL` (Z. 11162), `sheetFrame` (Z. 20260).

**Eigene Rechnungen:** Größen-Prognose E.3 (Python über die Budgets aus N2 E.4 und die Dateigröße 4.6.0; Rev. 1 neu mit Reihenfolge N3.0.1 Nr. 6 und den Faktoren ×1,3/×1,5, `scratchpad/rev1-tools/size2.py`). Seitenzuordnung der Handbuch-Texte (Seitenumbrüche im Text gezählt, gedruckte Seite = PDF − 6; Hilfsdateien danach gelöscht).

**Gelesen für MK-P (26.10.2026):** HB-MS S. 5 (PDF 11, Strichzeichnung der Vorderseite, vermessen mit `scratchpad/mkp-tools/lines.py` und `grid.py` am Ausschnitt `scratchpad/ms2000-panel/ms2000-front.png`), S. 6–9 (PDF 12–15, Bedienelemente, Räder), S. 13 (Programm-Wahl, OCTAVE-LEDs), S. 15 (Arp-Tasten), S. 16 (SEQ EDIT und die 16 Regler), S. 18–19 (LCD Edit, Seiten zu den Tasten 1–16, Compare). App-Hauptlinie `scratchpad/mk-wt/index.html` (4.12.0): Block `sq-mk-src` (Bedienfeld-Code MK1–MK4), `MKUI.panelInfo`, `MK_LABEL`, `ctlPrecision` (Fein-Regel).

**Nicht möglich:** RADIAS-Handbuch (Xander: nicht nötig). Korg „MIDI Implementation“ (nicht im Handbuch; Tor MK9-T). Kein Foto der Vorderseite (die Referenz-Skizze ist eine eigene Zeichnung; Anordnung der Gruppen nach der Strichzeichnung HB-MK S. 2–3, Maße eK). Kein AG06-Handbuch (Schalterlage am Gerät prüfen) und keine Prüfung der GarageBand-Menünamen. Kein Klang angehört, nichts am iPhone gemessen, kein Web-Abruf. Im Supabase-Projekt und auf GitHub wurde nichts gelesen oder geändert.

---

## Teil H — Fragen an Xander: Entscheidungen vom 25.10. und neue Fragen

### H.1 Entschieden (Xander, 25.10.; verbindlich)

- **H-1 Größe → (b).** Das Schlankheits-Paket **SL1** (E.3a) kommt, sobald die Startzeit-Prüfung scheitert, spätestens bei 4,5 MB (mit ×1,5 etwa bei V5d). Mit Rev. 2 endet der Plan bei ≈ 7,0 MB (×1,5), nach Plan ≈ 5,5 MB, untere Schätzung ≈ 6,4 MB (E.3); die 5,0 MB fallen mit ×1,5 etwa bei V8a. Die MK-Pakete selbst bringen ≈ +0,53 MB (mit Faktor ≈ +0,8 MB).
- **H-2 Deine Wellen-Aufnahmen → eingebaut.** Die aus deinen Aufnahmen gerechneten Wellen kommen in die App, alle hören sie, auch im Paar-Raum (MK10, +80 KB mit der Aufnahme-Seite). Dir wurde gesagt, dass die Lizenz ungeklärt ist; du hast trotzdem „einbauen“ gewählt. Kein Korg-Name, kein Logo, keine Korg-Wörter in der App; die Wellen-Daten selbst sind erlaubt (EN3-09). Die Aufnahmen bleiben auf deinem iPhone.
- **H-3 Werksklänge → 64** (8 je Genre auf Seite A; Seite B = deine eigenen Sounds).
- **H-4 Name → „MS 2000“** auf dem Knopf neben VA │ FM │ WT (Ersatz wäre „MS 2K“ gewesen). Dir wurde gesagt, dass MS2000 ein Modellname von Korg ist (ein Risiko nur, wenn die App verkauft würde). Genau diese Beschriftung ist erlaubt; Korg, microKORG, RADIAS, DWGS, ein Korg-Logo oder Korg-Schrift bleiben verboten (EN3-05). Intern bleibt die Kennung `mk`. Der **Platz** im schmalen Hochformat ist nicht eigens beantwortet → neue Frage H-13.
- **H-5 Bend- und Mod-Rad → sichtbare Räder.** BEND und MOD sitzen links der Tasten, sichtbar und mit dem Finger spielbar, wie am Original (B.3, MK1). Bend und Mod-Rad über MIDI gibt es nur als freiwillige Zugabe am Desktop, nie nötig (EN3-21).
- **H-6 Eich-Aufnahmen → nein.** Abgleich nach Gehör.
- **H-7 Import → zurückgestellt.** Du hast keinen Rechner, kein Editor-Programm, keine .syx/.prg-Dateien und arbeitest nur am iPhone; MIDI kennst du nicht, und Safari auf dem iPhone hat kein Web MIDI. MK9 ist zurückgestellt und steht außerhalb der Versionsfolge; kein Paket verlangt einen Rechner, MIDI oder eine Datei vom Rechner (EN3-21). Teil D ist nur fürs iPhone geschrieben.
- **H-8 Aufnehmen mit Arpeggiator → gedrückte Tasten.** Der Arp spielt beim Abspielen neu; der MIDI-Mitschnitt enthält die klingenden Arp-Noten (MK5 Umfang 7).
- **H-9 microKORG-Regler im App-Mod-System → ja** (≈ +5 h und +12 KB in V5d, V6a, V5c, V1d und VC4; Teil G Nr. 4).
- **H-10 Spur als Vocoder-Quelle, ohne sie zu hören → mit Schalter** „Quelle nur als Eingang“ (MK7).
- **H-11 Beide Timbres zugleich bearbeiten, Solo → ja.** Bedient wird beides jetzt wie am Original über die TIMBRE-Taste (Tipp T1 → T2 → beide; SHIFT + TIMBRE = Solo), statt über eigene Knöpfe (MK3); nichts davon wird gespeichert.
- **Frühere Frage H-12 entfällt:** Die Spec bleibt im Repo gesichert, nach deiner Regel „nie Arbeit verlieren“; sie enthält nur Parameter-Fakten (E.5 Nr. 5).

### H.2 Neu aus Rev. 2 (die Vorgabe gilt, bis du antwortest)

- **H-13 Engine-Wahl im schmalen Hochformat.** Mit „MS 2000“ passen vier Knöpfe auf schmalen iPhones (P2/P3) und vielleicht schon auf deinem nicht mehr neben den Spurnamen. Vorschlag: dort ein Engine-Chip „MS 2000 ▾“ bzw. „VA ▾“ mit Auswahl-Liste statt der vier Knöpfe. Das ändert auch VA/FM/WT sichtbar. *Vorgabe: Knöpfe, wo sie passen („MS 2000“ notfalls zweizeilig); der Chip nur dort, wo nicht. Der Orchestrator zeigt dir den Chip vor dem Bau.*
- **H-14 Was der microKORG nicht hat, wohin damit?** *(Mit MK-P gegenstandslos: Am MS2000 hat jeder Wert seinen Regler oder seine Taste, der Rest liegt auf den LCD-Seiten wie am Gerät.)* Das Bedienfeld zeigt genau die Vorderseite des Originals. Der MS2000 hat aber mehr (Priorität, Split, Stimmungen, Mod-Sequenzer, Filter-Anschlag, Gate). Vorschlag (B.3, EN3-20): Diese Werte liegen auf einer zweiten Ebene der 5 Regler, die man mit **SHIFT** einschaltet (wie die SHIFT-Taste am Gerät); STIMMUNG und SEQ kommen an die zwei Stellungen der EDIT-WAHL 2, die am Original GLOBAL und MIDI heißen (beides braucht die App nicht). VOLUME regelt die Lautstärke der Spur. Was am Original nur aufgedruckt ist (Matrix), zeigt die App als zwei Zeilen unter den Reglern; ein Tipp auf die Zeile öffnet bei SEQ, Kanal-Pegel/-Pan und eigener Stimmung eine Zusatz-Ansicht. Wo das ganze Bedienfeld nicht hinpasst (Hochformat auf kleineren iPhones, iPhone SE quer, iPhone 12/13 quer mit dem Home-Balken), zeigt die App eine Hälfte auf einmal: Die Reiter oben heißen dann [LINKS] [RECHTS] [FX], und SHIFT ist in beiden Hälften da. Auf deinem 12 Pro Max passt das ganze Bedienfeld in beiden Richtungen (hochkant als zwei Hälften übereinander). *Vorgabe: so.*
- **H-15 Wie kommt das Wellen-Paket zum Bau?** Nach der Aufnahme teilt die App eine kleine Datei (nur die gerechneten Wellen, ≤ 200 KB) über das Teilen-Blatt des iPhones. *Vorgabe: Du schickst sie als Datei im Chat mit dem Orchestrator in der Claude-App; geht das nicht, „In Dateien sichern“ (iCloud Drive), und du sagst Bescheid.*

### H.3 Neu mit MK-P (26.10.; die Vorgabe gilt, bis du antwortest)

- **H-16 Beschriftung des Bedienfelds.** Am MS2000 ist alles englisch beschriftet (CUTOFF, RESONANCE, EG 1 INT, KBD TRACK …), darunter die weißen Vocoder-Namen. Die App-Regel L5 sagt „alles deutsch“. Vorschlag: Das Bedienfeld trägt die Beschriftung wie am Gerät; die Anzeige, die Textzeile darüber und die Hilfe bleiben deutsch. Zwei Wörter dürfen nicht hinein (Marken-Regel): VOX WAVE heißt STIMMWELLE, DWGS heißt SPEICHERWELLE. *Vorgabe: englisch wie am Gerät.*

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
