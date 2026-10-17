# SYNQUENZER v3 — Nachtrag 1 zur Bau-Spezifikation (verbindlich)

Stand 14.10.2026, überarbeitet nach der Kritik-Runde N6 (19 Punkte; Zuordnung in Anhang N6). Status: **verbindlich**. Builder und Tester lesen `dirigent-spec-v3.md` **und** diesen Nachtrag. **Bei Widerspruch gilt der Nachtrag.**

Grundlage:
- Xanders Runde 6: `v3-ideen/fragen-xander-6.md`.
- R6-Audit FM, Song-Modus und Modulation am Snapshot WP7-fix1, gemessen: `v3-ideen/r6/` (`fm-*.mjs/.out`, `ui-*.mjs/.out`, `mod-cpu.out`, `shots/`).
- **R6-Recherche „Bibliothek nach Vorbildern“ als Datei: `v3-ideen/r6/bibliothek-recherche.md`** (Bericht §0–§10 mit R6-Tabellen A–G und R6-Tabelle Tags, §5 Rechtliches, §7 Demo-Songs; neu §11 Tabelle VORBILD, §12 Parameterform, §13 Doppelten-Check). Parameterform aller 76 Rezepte: `v3-ideen/r6/n6/rezepte76.json`. Messungen: `v3-ideen/r6/mess/` und `v3-ideen/r6/n6/`.
- R6-Recherche „Plattform“, gemessen: `v3-ideen/r6/i7/`.
- Typdateien der Artifact-Fähigkeiten 0.2.75: `db.d.ts`, `user.d.ts`, `room.d.ts`, `sample.d.ts`, `assets.d.ts`, `downloads.d.ts`, dazu `claude.d.ts` (direkt gelesen).
- Eigene Gegenproben dieses Nachtrags: `v3-ideen/r6/nachtrag/` (N0.2) und `v3-ideen/r6/n6/` (N0.2b, Kritik-Runde N6).

**Tabellen-Namen:** „R6-Tabelle A–G“ und „R6-Tabelle Tags“ meinen die Preset-Tabellen in `r6/bibliothek-recherche.md`. Anhang A.1 der Spec hat ebenfalls Tabellen A–F (dort ist F = „Kits und moderne Rollen“); „Tabelle F“ ohne „R6-“ meint immer Anhang A.1.

**So liest man den Nachtrag**
- **Kennzeichen** wie in der Spec:
  - **(SE)** = Fakt nur aus einem Suchauszug.
  - **eK** = eigene Kenntnis, ungeprüft.
  - **gemessen** = Chromium oder Node auf der Xeon-VM, **nie am iPhone**, kein WebKit.
  - **unsicher** = nicht belegt.
  - *(P1)* = optional im Paket.
- **IDs:**
  - Zusätzliche Abnahmepunkte zu einem bestehenden Paket heißen `N<Paket ohne „V“>-NN`, z. B. `N0b-03` (zu V0b) oder `N10a-02` (zu V10a). Sie gelten **zusätzlich** zur Checkliste des Pakets in §17.
  - Neue Pakete sind hier vollständig definiert: V0d, V1d, V5d, VK, V10d, V10e, VC1, VC2a, VC2b, VC2c, VC3, VC4 und VS. Ihre Punkte heißen wie in der Spec `<Paket>-NN`.
  - Neue Entscheidungen heißen `EN-NN`. Neue Regeln heißen `TA9`, `VL-R1`, `MOD-R1` und `PAD-R1`.
- **Bau-Reihenfolge:** Teil C ersetzt die Reihenfolge in §17.0, die App-Versionen der §17-Tabelle und die Budgets in §15.3.
- **Basis-Build:** der jeweils neueste Stand der Arbeitskopie, auch nach der laufenden v2-Abschlussrunde.
  - Jeder R6-Befund wird **vor** dem Bau am aktuellen Stand nachgestellt (wie §2, Satz 3).
  - Ist ein Befund schon behoben, steht das in CHANGES, und der Abnahmepunkt prüft nur noch das Soll.
- **Zeilenangaben** „Z. n“ beziehen sich hier auf `synq-snapshots/WP7-fix1.html`. Diese Datei ist byte-gleich mit `r6/app.html` (mit `cmp` geprüft). Builder suchen über den Funktionsnamen.
- **Build-Umgebung:** Der Satz „allowed extensions include json zip txt, NOT mid/wav/m4a -> pack into a store-only .zip“ in der Build-Umgebung ist **veraltet**. Es gilt EN-12.

**Inhalt**
- N0 Grundlagen: Runde 6 → Ort, Gegenproben, Plattform-Fakten, Messgrößen, Entscheidungen
- Teil A: Änderungen an bestehenden Paketen und neue Klang-Pakete (V0a–V0d, V1c/V1d, V2, V4, V5d, V6, VK, V8a/V9b, V10a–V10e, Anhänge)
- Teil B: neue Plattform-Pakete (VC1, VC2a–c, VC3, VC4, VS)
- Teil C: Bau-Reihenfolge in Gruppen, Begründung, Versionen, Budgets
- Teil D: Test-API-Ergänzungen
- Teil E: Fragen an Xander
- Quellen
- Anhang N6: Kritik-Runde N6 → Ort der Änderung

---

## N0 Grundlagen

### N0.1 Runde 6 → wo es steht

| Xander, Runde 6 (gekürzt) | Befund am WP7-fix1 (gemessen, wo nicht anders gesagt) | Lösung | Paket |
|---|---|---|---|
| I1 „Algorithmus 1 und 2 wirken gleich“ | Die Tabelle ist richtig (gleich msfa/Dexed). Der einzige Unterschied ist der Ort des Feedbacks (OP 6 bzw. OP 2). Bei der INIT-Stimme sind beide bitgleich. Hörbar ist der Unterschied erst ab FB ≥ 5 und nur, wenn der FB-Operator klingt. Das Diagramm zeichnet die Schleife nur bei FB > 0. | Schleife immer zeichnen, Etikett „FEEDBACK · OP n“, grau mit Grund, LCD-Hinweis beim Wechsel | V0d |
| I1 „Mini-Wellenformen unten abgeschnitten“ | In Chromium wird kein Element abgeschnitten. Die Bodenlinie der Hüllkurven-Bildchen liegt aber auf der Kastenkante (1,5 von 20 Einheiten Rand, 12 px hoch). In 320×568 und 844×340 sind die Bildchen ausgeblendet. WebKit ist ungeprüft. | Pfad in Pixeln mit Innenrand, Mindesthöhe, Kompaktfassung statt Ausblenden | V0d |
| I1 „Bibliothek springt in VA zurück“ | Der Chip kommt aus der Kategorie des Ursprungs-Presets. Es gibt keinen Engine-Filter. ‹ › lädt VA-Sounds auf eine FM-Spur. | Die Engine der Spur ist der Standardfilter, „Alle Engines“ nur auf Wunsch (EN-04) | V0b |
| I1 „FM-Ordner braucht eigene Sounds“ | 12 Werks-FM-Sounds (7 „FM“, 5 „Glocken“). Unter „Bass“ fehlen die FM-Bässe. | FM-Rollen und 7 neue FM-Sounds | V0b (Ordner), V0d (Sounds) |
| I1 „keine tiefen DX-Bässe, unten passiert nichts, alles dünn“ | Die Engine rechnet gleich wie msfa. Der OL-Fader ist aber linear in OL, deshalb wirkt das untere Drittel bis zur Hälfte des Wegs kaum. **„Erst ab ~5 hörbar, 0–2 nichts“ passt zur Anzeige der MAKRO-Helligkeit („+5 dB“, Z. 13802) und zu FEEDBACK 0–7, nicht zum OL-Fader** (der zeigt „I x,x“). Gemessen an DX-Tines: Helligkeit +2 dB → +0,04 Okt, +5 dB → +0,18 Okt, +12 dB → +1,56 Okt (`r6/fm-measure-a.out`). Pop-Bass DX liegt 2 Oktaven zu tief (16,4 Hz bei C2), seine Modulatoren klingen auf 0 aus. M-HANDYrel liegt bei −78 dB, das Ziel ist ≥ −20 dB. | Fader-Kurve für OL **und** für die Helligkeit, Index-Anzeige, Bässe in notierter Lage, schnappende Modulatoren, Tastaturskalierung für tiefe Lagen, neue „Monster“-Bässe (EN-02, EN-03); Rückfrage, welcher Regler gemeint war (E.12) | V0d |
| I1 „Bedienung sperrig; Kodamo-Feld muss sitzen; DX-Modus bleibt“ | – | Hüllkurve „auf alle“, Unterseite DX bleibt, Mehrfachauswahl, V4 vor V3 | V0d, V4b, Teil C |
| I2 „Ansicht springt beim Melodie-Editieren“ | `PianoRoll.playhead` (Z. 4614) prüft nur die Größe der Auswahl. Die Seiten sind nicht taktbündig (x0 = 3,01 / 6,02 / 9,04 Schläge). 3 von 13 Tipps trafen eine verschobene Ansicht. | FOLGEN nach §5.1 und taktbündige Seiten (EN-07) | V0b |
| I2 „Nach ■ oben und ▶ oben spielen die Szenen“ | Bestätigt (Gegenprobe N0.2). | ▶ oben in der Song-Ansicht = ▶ SONG (EN-06) | V0c |
| I2 „Transposition aus dem Song spielt weiter“ | Bestätigt: Die Bass-Clip-Noten 36/48/43/40 klingen nach dem Song als 41/53/48/45. Das gilt nach ■ (N0.2) **und auf Xanders Weg ohne ■**: leerer Song, Szene läuft, ● SONG, F als Hand-Träger, ● beenden → `song.play:false`, `playing:true`, Träger F, Szenen spielen 36 → 41 (N0.2b). | Regel TA9 „Träger gehören dem Song“, mit Auslöser „Aufnahme-Ende ohne weiterlaufende Song-Wiedergabe“ | V0c, V2d |
| I3 „Instrumenttypische Bausteine schon drin?“ | In WP7 noch nicht: Jedes Pad nutzt dieselbe universelle Stimme. | V1a und V1b wie spezifiziert (Gruppe 2) | V1a, V1b |
| I3 „Jede Engine als Drum-Stimme wie OP-Z; eigene Effektklänge als Pad“ | V1c erlaubt höchstens 2 Synth-Pads. Gemessen: ein leerer Worklet-Knoten kostet ≈ 0,1 %. | Alle 12 Pads wählen [DRUM │ VA │ FM │ WT], dazu „Als Drum-Pad ▸“ (EN-08) | V1d |
| I4 „Jeder Regler modulierbar wie Bitwig“ | Je Synth-Spur sind 23 von 140 stetigen Reglern modulierbar (16 %). Bei WT, Global und Drums ist es keiner. | Ziel-Pfade in 4 Klassen mit CPU-Regel (EN-09) | V5d |
| I5 Vorbild-Filter, Genre-Demos, Brot-und-Butter, C64, Wassertropfen, Klassiker, Effekte, Tutorials | Der „Tropfen“ ist falsch gebaut: Seine Tonhöhe folgt der Taste nicht (G5/C5 = 0,75 statt 1,498), die Richtung hängt von der Note ab (C5 steigt von +18,9 auf +24 HT, G5 fällt auf G6 = 1568 Hz), und er klingt 105–235 ms nach (`r6/mess/tropfen.out`). Der Filter-Drive raut nicht auf. Die Drift ist nur ein fester Versatz je Anschlag. | Tropfen sofort (V0d), Vorbild-Tags (V10a), Vorbild-Paket mit 76 Presets (V10d), Klassiker-Bausteine (VK), 9 Demos und 6 Helden-Lektionen (V10e); Rezepte, VORBILD und Tags in `r6/bibliothek-recherche.md` | V0d, V10a, V10d, VK, V10e |
| I6 Resynthese; „Wer baute das FM-Klavier?“ | Belegt ist nur Manny Fernandez (SE). Xanders Dokument fehlt noch. | V9b/V9c wie spezifiziert; Klavier-Vorlage nach Teiltongruppen (N9b-01); Rückfrage E.2/E.3 | V9b |
| I7 Gemeinschafts-Bibliothek | Machbar mit `db` + `user`, aber nur für Eingeladene mit „Can edit“. Ein von außen eingeladener Editor (David, René bei Pro/Max) schreibt, hat aber eventuell keine `id` (`user.d.ts`). | VC1 mit Eingang für Editoren ohne `id` | VC1 |
| I7 Verlauf wie Procreate, Zeitraffer, Video | Ereignisse statt Bildschirm-Video. Ein Video geht nur über eine Canvas-Bühne mit MediaRecorder. | VC2a (früh), VC2b, VC2c | VC2a–c |
| I7 Stimme, Mikrofon, Wort-Marken | Die Claude-App bietet kein Mikrofon. | Nur in der eigenständigen Safari-Version | VS (später) |
| I7 „Wie weit sind wir?“, „nächstes Update schicken“ | v2 = WP1–WP7 gebaut (Stand WP7-fix1), Abschlussrunde läuft; v3: 0 von 51 Paketen | Statuszeile C.0; in Gruppe V0 je ein Zwischenstand nach V0c und nach V0d (C.5 Punkt 3) | – |

### N0.2 Gegenproben dieses Nachtrags (gemessen)

**(1) Träger-Leck und ▶ oben.** Skript `r6/nachtrag/traeger-check.mjs`, Ausgabe `.out`. Gemessen in Chromium, P1, mit CDP-Touch auf `#bPlay`, am Snapshot WP7-fix1.
- **Ablauf A (Träger):**
  - Song mit Träger F aufgenommen, dann ■ → `runtime().carrier` = F, angewandte Verschiebung +5.
  - Zurück in den Szenen, dann ▶ → Synth-1-Clip 48/36/43/40 ergibt im `noteLog` `out` 53/41/48/45.
- **Ablauf B (▶ oben):** ▶ SONG, dann ■ oben, dann ▶ oben → `playing:true`, `song.play:false`. Es spielen also die Szenen.
- Damit sind beide R6-Befunde bestätigt.
- Die ältere Datei `r6/ui-song.out` zeigt für die Szenen `out = clip`. Sie ist älter als ihr Skript (21:34 gegen 21:35) und gilt nicht. Den Zustand nach ● SONG-Ende ohne ■ (dort `song.play:false`, `playing:true`, Träger F) misst N0.2b #1 neu.

**(2) Grundlast von Worklet-Knoten.** Skript `r6/nachtrag/node-overhead.mjs`, Ausgabe `.out`.
- Gemessen mit OfflineAudioContext, 48 kHz, 20 s Audio, Prozessor `dirigent-analog` aus WP7-fix1. Angabe in Prozent Echtzeit.

| Knoten | Last |
|---|---|
| 0 Knoten | 0,04–0,05 % |
| 1 leerer Knoten | 0,17–0,21 % |
| 4 leere Knoten | 0,48 % |
| 12 leere Knoten | 1,23–1,36 % (≈ 0,1 % je Knoten) |
| 12 Knoten mit je 1 VA-Stimme | 7,98 % (≈ 0,66 % je Knoten mit Stimme) |

- **Folgerung:** Die Kosten treibt die Zahl der Stimmen, nicht die Zahl der Knoten (EN-08).
- Die Lesart „≈ 9 % je Knoten“ aus den Risiken von V1c trifft für leere Knoten nicht zu. Die Zahl in §v2 (Z. 913) bezog sich auf 32 Knoten zusammen mit Stimmen.
- **Einschränkung:** Gemessen wurde offline, nicht in Echtzeit, und nicht am iPhone.

**(3) Fader-Kurve, gerechnet.** Abbildung `OL = round(99 · p^0,45)`, Index `I = 4π · 2^((OL − 99)/8)` (Formel wie `FMH.modIndex`).

| Weg p | 0,05 | 0,13 | 0,25 | 0,35 | 0,4 | 0,5 | 0,68 | 0,75 | 1 |
|---|---|---|---|---|---|---|---|---|---|
| OL | 26 | 40 | 53 | 62 | 66 | 72 | 83 | 87 | 99 |
| I (rad) | 0,02 | 0,08 | 0,23 | 0,51 | 0,7 | 1,21 | 3,14 | 4,44 | 12,57 |

Zum Vergleich mit dem R6-Audit:
- Der 2. Teilton erreicht −30 dB bei OL 39, also bei p ≈ 0,13.
- Das H-1-Kriterium (⅓ Oktave) ist ab OL 62 erfüllt, also ab p ≈ 0,35.
- Heute (linear) liegen diese Punkte erst bei 39 % bzw. 63 % des Wegs.

### N0.2b Gegenproben der Kritik-Runde N6 (gemessen bzw. gerechnet, `v3-ideen/r6/n6/`)

| # | Frage | Skript → Ausgabe | Ergebnis |
|---|---|---|---|
| 1 | Träger-Leck auf Xanders Weg (● SONG beenden ohne ■) | `traeger-rec-check.mjs` → `.out` (Chromium, WP7-fix1) | Leerer Song, Szene 1 läuft, ● SONG, F als Hand-Träger, ● beenden: `playing:true`, `song.play:false`, `song.rec:false`, Träger F (+5). Die Szenen spielen ab dem nächsten Takt 36/48/43/40 als 41/53/48/45. Die Song-Daten enthalten den Träger-Eintrag F. **Bestätigt.** |
| 2 | MAKRO-Helligkeit je dB | `hell-kurve.mjs` → `.out` (Node, Worklet) | M-SP-Verschiebung bei +2 / +6 / +12 / +24 dB: DX-Tines +0,04 / +0,32 / +1,56 / +3,86 Okt; Pop-Bass DX (Werk) +0,02 / +0,06 / +0,15 / +0,85; R6-B1 +0,17 / +0,41 / +1,20 / +2,93; R6-B2 +0,29 / +1,11 / +4,09 / +6,84. Die Kurve dB = 24·sgn(v)·\|v\|^0,5 ergibt bei v = 1/16 / ¼ / ½ / 1: 6,0 / 12,0 / 17,0 / 24,0 dB. |
| 3 | N71 mit Rauschen 6 %, Res 1,1 und Rampe | `pfeif-n71.mjs` → `.out` (Node, Worklet) | Erstes 10-ms-Fenster ≥ −40 dBFS bei 0,27 s, ≥ −30 dBFS bei 0,38 s. Grundfrequenz ab dort 87 Hz → 1030 Hz bei 4 s (C3, Hk 2 A 4 s → Cutoff +48 HT). Pegel danach −15,6 … −15,9 dBFS. Zum Vergleich Rauschen 1 %, Res 1,03: ≥ −30 dBFS erst bei 1,05 s. |
| 4 | Uhrabgleich mit Asymmetrie (VC3) | `clock-resid.mjs` → `.out` (Simulation wie `r6/kritik-n1/clock-sim.mjs`, 20 000 Läufe) | 10 Pings, Schwankung ±15 ms: \|Fehler − Asymmetrie/2\| Median 2,2–2,3 ms, p95 7,3–7,4 ms, p99 9,7–10,0 ms, Anteil > 5 ms 18–19 %. Ohne Asymmetrie \|Fehler\| Median 2,3 ms, p95 7,3 ms, > 10 ms 0,8 %. Mit 20 Pings p95 5,6–5,8 ms. Eine Einzellauf-Grenze von 5 ms ist also ebenfalls nicht sicher. |
| 5 | FM-Bässe gegen V0d-11 | `fm-bass-tune*.mjs` → `.out` (Node, Worklet) | Siehe `r6/bibliothek-recherche.md` §12.3: Stapel-Bass FM, N63, N64 und Pop-Bass DX erreichen V0d-11 mit den dort genannten Startwerten; ohne Tastaturskalierung links verfehlen sie meist E1. Solid-Bass verfehlt E1 ≥ −20 dB in 21 Varianten (bestes −23,2 dB). |
| 6 | .syx-Hinweis alt gegen neu (V0d Punkt 7) | `syx-hinweis.mjs` → `.out` (gerechnet) | ROM1A (32 Stimmen) plus R6-B1/B2: Hinweis nach alter Regel bei 16 von 34, nach neuer Regel bei 8 von 34. R6-B2 bekommt keinen Hinweis mehr, BASS 1 (`trans` −12, Ausgang ×0,5) weiter „2 Okt.“. |
| 7 | Namen und Doppelte | `doppel-check.mjs` → `.out` | Siehe `r6/bibliothek-recherche.md` §13: keine gleichen Namen; neuer Ganzwort-Treffer A.1 #13 „Synthex-Streicher“; Teilwort-Fallen „Ensemble“ ⊃ SEM, „Nordlicht“ ⊃ Nord; N38 hat dasselbe `fm6` wie das Werks-E-Piano. |
| 8 | Alle 76 Rezepte in Parameterform | `rezepte76.mjs` → `.json`, `.out` | 51 VA, 11 WT, 10 FM6, 4 Kits; VA und FM6 offline gerendert ohne NaN. |

### N0.3 Plattform-Fakten (Typdateien 0.2.75, direkt gelesen)

**`downloads`**
- Erlaubte Endungen: `gif png jpg jpeg webp mp4 webm txt json md`, dazu eine zweite Liste `docx pptx epub csv ttf html svg pdf xlsx zip`.
- Die zweite Liste kann die Plattform abschalten (Fehler `extension_not_enabled`). Dann „Format hier nicht verfügbar“ melden und aufhören, ohne Wiederholung und ohne Ersatzformat.
- **`mid`, `syx`, `wav` und `m4a` sind nicht erlaubt.**
- Der MIME-Typ folgt aus der Endung. Ein Blob wird unverändert übergeben.

**`db`**
- Es gibt eine Datenbank je Artifact. Sie überlebt Neuveröffentlichungen und wird **mit dem Artifact gelöscht**.
- Schreiben dürfen nur:
  - der Besitzer;
  - per E-Mail eingeladene Editoren, solange kein öffentlicher Link besteht;
  - Mitglieder einer Organisation ab Stufe Contributor.
- Wer über einen öffentlichen Link kommt, liest nur, und das nur angemeldet. Abgemeldete sehen keine Daten.
- Pfadregeln je Stufe `view`, `interact`, `admin`, `owner`. Ein Teilbaum `…/{self}` gehört dem jeweiligen Betrachter. Eine Regel auf dem Präfix von `{self}` muss `read` **und** `write` setzen.
- Grenzen:
  - höchstens 64 Regeln;
  - ein Dokument höchstens 256 KiB;
  - höchstens 25 000 Dokumente je Artifact;
  - höchstens 64 Abos je Ansicht.

**`user`**
- `id()` liefert `null` ohne Identität: bei Abgemeldeten, bei Gästen ohne ID und ohne Deklaration.
- **Ein von außen eingeladener Editor schreibt, hat aber eventuell keine `id`** („an editor invited from outside the organization writes and may have none“).
- Ob jemand gemeinsame Dokumente schreiben darf, sagt `can('data.write')`. `null` heißt „die Plattform sagt nichts“ (z. B. Gast von außen, Seite ohne Rahmen): dann das Bedienelement behalten und die Ablehnung des Schreibens entscheiden lassen.
- **Nur IDs speichern**, nie Namen, E-Mail oder Avatar. Namen beim Anzeigen über `profiles()` holen.

**`db` – Fehlercodes** (`db.d.ts`): `invalid_argument` (Wiederholen kann nicht gelingen; bei einem korrekt gebauten Schreibaufruf heißt er „keine Schreibrechte“ → für den Rest des Besuchs nur lesen), `resource_exhausted` (Aufrufrate je Betrachter, 64 Abos, zu viele gleichzeitige Schreibzugriffe → langsamer werden), `quota_exceeded` (voll, Wiederholen kann nicht gelingen → melden), `unavailable` (vorübergehend → einmal nach kurzer Zufallspause wiederholen), `revoked` (Zugriff entzogen, endgültig für diesen Seitenaufruf). Unbekannte Codes wie `unavailable` behandeln. Zähler per Lesen-Ändern-Schreiben sind ausdrücklich nicht vorgesehen; je Dokument immer nur ein Schreibzugriff zur Zeit.

**`window.claude` ohne Rahmen** (`claude.d.ts`, `sample.d.ts`): Läuft die Seite ohne Rahmen auf der eigenen Adresse des Artifacts, gibt es `window.claude.use`, aber jedes `use()` liefert `null`. Nur eine Kopie auf einem anderen Host (oder eine gespeicherte Datei) hat gar kein `window.claude`.

**`room`**
- Abgemeldete und Besucher über einen öffentlichen Link kommen nicht in den Raum.
- `emit`: höchstens 4 KiB je Nachricht. `emit` und `presence` teilen sich etwa 40 Nachrichten pro Sekunde (Burst 80).
- Ein Thema ist nur für `admin` offen, es sei denn, eine `topics`-Regel öffnet es für `interact`.

**`sample`**
- Die Kosten gehen auf die Claude-Nutzung des Betrachters.
- Die erste Anfrage je Ansicht fragt um Erlaubnis. Ein Nein gilt bis zum Neuladen (`not_granted`).
- Antworten werden standardmäßig zwischengespeichert. Es gibt die Stufen quick, default und complex.
- Höchstens 256 KiB Text je Anfrage.
- Es gibt **keine Systemanweisung**, die die Seite steuert, und keine Rolle `system`. Dauerhafte Regeln stehen im `input` (als Text bzw. als erste `user`-Runde, die die Seite immer mitschickt).
- Laut Claude-Hilfe (R6-I7, direkt abgerufen, über eine Zusammenfassung) ist mit `sample` kein öffentlicher Link möglich. Bei Eingeladenen von außerhalb funktioniert es nicht.

**`assets`**
- Kein `audio/*`. Nur Editoren dürfen hochladen.
- 0.2.75: „A declaring artifact … cannot be shared publicly.“

### N0.4 Neue und präzisierte Messgrößen

| Kürzel | Definition |
|---|---|
| **M-HANDYrel** | `10·log10(E_HP / E_voll)`, HP = 220 Hz, 24 dB/Okt (Butterworth, 2 Biquads), Fenster 30–330 ms nach Anschlag, Einzelnote mit Anschlag 0,8, trocken. Verfahren wie `r6/fm-measure-d.mjs`. Die absolute M-HANDY aus §0.3 bleibt für die Drums. |
| **M-BISS** | Pegel über 400 Hz (HP 24 dB/Okt) im Fenster 0–40 ms minus im Fenster 150–330 ms, in dB, Einzelnote |
| **M-TIEFSTER** | tiefster Teilton, der höchstens 20 dB unter dem stärksten liegt (FFT 16384, ab 30 ms), in Hz. „Grundton = notierte Note“ heißt M-TIEFSTER = f(Note) ± 3 %. |
| **M-TONVERLAUF** | Spitzenfrequenz in den Fenstern 0–4 / 4–10 / 10–20 / 20–40 / 40–80 / 80–160 ms, in Halbtönen zur Note. Verfahren wie `r6/mess/tropfen.mjs`. |
| **M-SEITE** | `viewState(kind).x0` in jedem Bild. Im Zustand FOLGT ist jedes x0 ein Vielfaches der Seitenbreite. Seitenbreite = sichtbare Schläge, abgerundet auf ganze Takte, mindestens 1 Takt; ist weniger als 1 Takt sichtbar, ganze Schläge. Gewechselt wird nur am Taktstrich (±1 Bild). |
| **M-REKON** | Keyframe plus Ereignisse ergibt das aktuelle Projekt, deep-equal über `serializeProject` **ohne Laufzeit- und Ansichtsfelder**. Die Liste dieser Felder führt der Rekorder (`HIST.volatile`); Startinhalt: `ui` (heute `S.ui = {selT, selS}`, von `syncUi()` beim Serialisieren geschrieben, Z. 16269–16270). Jedes Paket, das ein weiteres Ansichts- oder Laufzeitfeld ins Projekt schreibt (z. B. `S.ui.follow`, die FELD/DX-Wahl aus N4b-01), trägt es dort ein; der Eintrag steht in CHANGES. |

### N0.5 Neue Entscheidungen

| # | Entscheidung | Begründung, Herkunft |
|---|---|---|
| **EN-01** | Gebaut wird in **Gruppen** (Teil C). Das ersetzt in §17.0 Reihenfolge, Abhängigkeitsbild und Summen, die App-Versionen der §17-Tabelle und die Budgets in §15.3. | Auftrag Runde 6; Begründung der Abweichungen in C.2 |
| **EN-02** | Die **FM-Engine bleibt gleich wie msfa/Dexed.** Geändert werden nur die Bedienkurve (Fader-Weg → OL), die Anzeige und die Presets. | Gleich msfa sind `scaleOL`, die Pegelformel, `2^(lvl/256−14)` und das Feedback `2^(fb−8)` mit 2-Sample-Mittel (R6-Audit gegen die lokalen Dexed-Quellen). 1 OL-Schritt ≈ 0,753 dB (eigene Rechnung aus dem Code, im Web nicht belegt). ROM1A BASS 1 erreicht in unserer Engine M-HANDYrel −8,7 dB bei C2. Eine andere Formel ließe .syx-Importe und gespeicherte Sounds anders klingen (I-10). |
| **EN-03** | **FM-Werks-Sounds klingen in notierter Lage:** Transponieren 0, Ausgänge ×1. Ein ×0,5-Paar ist nur als zusätzliches Sub neben einem ×1-Ausgang erlaubt. Die Modulatoren von Bässen halten (L3 ≥ 70). .syx-Importe behalten die DX-Transposition und bekommen einen Hinweis (V0d). | Pop-Bass DX: Transponieren −12 mit ×0,5 ergibt 16,4 Hz bei C2. Clips stehen in der App in echter Lage (R6-Audit). Auch A.1 #4 hat diese Falle. |
| **EN-04** | **Bibliothek „aktive Engine zuerst“:** Der Standardfilter ist die Engine der Spur bzw. des Synth-Pads. Rollen-Chips gelten innerhalb dieser Engine. „Alle Engines“ gibt es nur auf Wunsch; dann steht die aktive Engine zuerst, und jede Zeile hat ein Engine-Kennzeichen. ‹ › im Editor-Kopf bleibt in der Engine. Ein Sound aus einer fremden Engine lässt sich nur aus „Alle Engines“ laden, mit Toast „wechselt zu VA“ und [Rückgängig]. | Xander I1 („Bibliothek der aktiven Engine hat Vorrang“). Ändert §12.2: Die Rolle bleibt erste Ordnung **innerhalb** der Engine. |
| **EN-05** | **TA9 Träger gehören dem Song** (V0c, Regel in A.3). | gemessenes Leck (N0.2) |
| **EN-06** | **▶ oben in der Song-Ansicht = ▶ SONG** ab der Positionsmarke | gemessener Fehler (N0.2) |
| **EN-07** | **FOLGEN ist taktbündig:** ROLLE und Melodie-Rolle blättern in ganzen Seiten am Taktstrich (M-SEITE). Das gilt auch für die Song-Ansicht (WP6 und V2e). Die 85-%-Regel in §5.1 entfällt. | R6-Audit: Seitenstarts bei 3,01 / 6,02 Schlägen, Notenziele springen |
| **EN-08** | **Engine je Pad:**<ul><li>Alle 12 Pads wählen [DRUM │ VA │ FM │ WT].</li><li>VA und FM bekommen je Synth-Pad einen Worklet-Knoten, WT läuft nativ.</li><li>Zusammen höchstens 8 Synth-Pad-Stimmen.</li><li>Ersetzt E3-15.</li></ul> | Xander I3. Gemessen: ein leerer Knoten ≈ 0,1 % (N0.2). |
| **EN-09** | **Jeder stetige Klang-, Effekt- und Misch-Regler ist ein Mod-Ziel**, in 4 Klassen mit Budget und CPU-Begrenzer (V5d). | Xander I4. Bitwig: jeder Geräteparameter modulierbar, Modulatoren modulieren Modulatoren (SE). |
| **EN-10** | **Klang-Feinschliff teilweise vorgezogen (VK):** wandernde Drift, Haifischzahn und gebogene Säge, Sättigung nach dem Filter, Filtertyp „SVF 12“, Osz.-FM, Ringmod, *(P1)* Bitcrusher. Der Rest von §18 „Klang“ bleibt später. | Xander I5 („klingt unser Moog wie Moog?“). Gemessen: Der Filter-Drive raut nicht auf, die Drift ist nur je Anschlag. |
| **EN-11** | **Bibliothek wächst:**<ul><li>76 Vorbild-Presets N01–N76 (`r6/bibliothek-recherche.md`, Parameterform `r6/n6/rezepte76.json`); N63–N70 schon in V0d.</li><li>9 Genre-Demos als Projekte.</li><li>Das Vorbild steht nur als Tag und im ⓘ-Text, mit Pflichtsatz.</li><li>Eigene Melodien und Muster, keine Samples.</li></ul> | Xander I5. Nach E9 und § 23 MarkenG (SE). Melodien sind geschützt (eK). |
| **EN-12** | **Auslieferung über `downloads`:**<ul><li>Audio direkt als `.webm` bzw. `.mp4`.</li><li>MIDI und `.syx` im ZIP.</li><li>JSON und TXT direkt.</li><li>Ist `zip` abgeschaltet, klare Meldung und keine Ersatzkette.</li><li>Ersetzt den Satz in der Build-Umgebung und den Kommentar in `deliverNow`.</li></ul> | `downloads.d.ts` (N0.3). Heute (Z. 16811) wird Audio unnötig in ein ZIP gepackt. |
| **EN-13** | **Plattform-Fähigkeiten nur, wo ein Paket sie braucht:**<ul><li>Die App läuft ohne jede Fähigkeit (`use()` → `null`).</li><li>`assets` wird nicht deklariert.</li><li>`sample` nur nach Xanders Ja.</li><li>Jede Version geht an **dieselbe** Artifact-Adresse.</li></ul> | Sonst wird die Gemeinschafts-Datenbank leer, und der öffentliche Link wird blockiert (N0.3). |
| **EN-14** | **Der Verlauf-Rekorder (VC2a) kommt früh**, am Ende der Gruppe V4 direkt nach V2. Regel VL-R1 gilt für alle Folgepakete. | Aufgezeichnet wird erst ab dem Einbau. Format 4 und Undo-Gruppen (V2a) müssen vorher stehen. |
| **EN-15** | **Stimme und Mikrofon nur in der eigenständigen Safari-Version (VS).** VS gehört zu keiner Bau-Gruppe. | Die Claude-App hat kein Mikrofon (Fähigkeitenliste) |
| **EN-16** | **Werks-„Tropfen“ (`f-tropfen`) = Rezept N69**, der Name bleibt, die Rolle wird „Effekt“ (EN-18). Neu ist „Tropfen-Ping“ (N70). Gespeicherte Projekte bleiben unverändert, weil sie volle Kopien enthalten. | Gemessen (`r6/mess/tropfen.out`): Die Tonhöhe des alten Tropfens folgt der Taste nicht (G5/C5 = 0,75 statt 1,498), die Richtung ist je Note verschieden (C5 steigt von +18,9 auf +24 HT, G5 fällt auf G6), Ausklang 105–235 ms. |
| **EN-17** | **Dateigrenze ≤ 4,0 MB** statt 3,0 MB (E3-03). Die Startzeit-Abnahme in §15.3 bleibt unverändert (absolut, und höchstens +150 ms je Paket). | Die Summe der Budgets ergibt ≈ 3,47 MB (C.4). Der Viewer erlaubt 16 MB. |
| **EN-18** | **Rollenliste der Bibliothek:** Bass · Sequenz · Lead · Akkord · Fläche · Keys · Atmo · **Effekt** · **Glocke** (nur FM) · Drums · Init. „Effekt“ = Riser, Sweeps, Tropfen, Pfeif-Rampen, Ladegeräusche (R6-Tabelle G: N69, N71–N74, N76 und der Werks-„Tropfen“; N70 bleibt Sequenz, N75 Fläche). Der Chip [Alle] heißt im Engine-Filter „Alle <Engine>“ (z. B. „Alle FM“), in „Alle Engines“ nur „Alle“. Ein Rollen-Chip erscheint nur, wenn die gezeigte Engine Sounds dieser Rolle hat. | Xander I5 (Effekt-Sounds), N0b Punkt 2 (Glocke). Ergänzt §12.2 (A.13). |
| **EN-19** | **Fähigkeiten immer als Summe:** Jede Veröffentlichung lässt `capabilities` weg (die vorhandene Deklaration bleibt) oder übergibt die vollständige Summe aller bisher deklarierten Fähigkeiten. Die Summe steht wörtlich in `CHANGES-V3.md` und wird je Paket fortgeschrieben (B.0). | Beschreibung des Artifact-Werkzeugs: Feld weglassen = behalten, `{}` = alles löschen. Dass eine Teilangabe die ganze Deklaration ersetzt, ist die naheliegende Lesart, **nicht getestet**. |
| **EN-20** | **Zwischenstände in Gruppe V0:** Nach V0c (Song-Fehler) und nach V0d (FM) geht je ein Stand an dieselbe Artifact-Adresse, mit 2–3 iPhone-Prüfpunkten. | Xander: „schick mir das nächste Update“; sonst käme der erste Stand erst nach ≈ 22 h Bauzeit plus Korrekturen. |
| **EN-21** | **MOD-R1 und PAD-R1** (Regeln wie VL-R1, ab V5d bzw. V1d für jedes spätere Paket): neue stetige Regler werden Mod-Ziele, neue Engines werden Pad-Quellen (V5d, V1d). | Xander I3 („jede Engine als Drum-Stimme“) und I4 („jeder Regler“); V4, V8a, V9a, V9b kommen nach V1d bzw. V5d oder davor ohne diese Regel. |

---
## Teil A — Änderungen an bestehenden Paketen und neue Klang-Pakete

### A.1 V0a — Ergänzung (N0a): Auslieferung nach EN-12

**Umfang (zusätzlich):** `deliverNow` (Z. 16807) nach EN-12.
- `kind:'webm'` geht als `<name>.webm`, `kind:'m4a'` als `<name>.mp4`, jeweils direkt.
- `kind:'mid'` und `kind:'syx'` gehen als `<name>.zip` mit der Datei darin.
- JSON bleibt `.json`.
- Den Kommentar „the viewer allows json / zip / txt“ und die Toast-Texte anpassen: „Audio gespeichert“, „MIDI gespeichert (ZIP)“, „DX7-Bank gespeichert (ZIP)“.
- Der Safari-Pfad ohne `window.claude` bleibt; `syx` bekommt dort `application/octet-stream`.
- **Seite ohne Rahmen:** Liefert `use('downloads')` `null` und läuft die Seite ohne Rahmen (`window.top === window`), nimmt `deliverNow` den Safari-Weg (Teilen bzw. `<a download>`), auch wenn `window.claude.use` existiert. Heute bricht `deliverNow` dort ab (Z. 16822: „Export hier nicht verfügbar“). Die Meldung „Export hier nicht verfügbar“ erscheint nur noch **in einem Rahmen** mit `null`. Grund: Auf der eigenen Adresse des Artifacts gibt es `window.claude`, aber jedes `use()` liefert `null` (N0.3).

**Dauer** +0,5 h (V0a gesamt 5–6 h) · **Budget** +5 KB.

- [ ] N0a-01 Viewer-Pfad mit gemocktem `downloads`: „Song als Audio“ ruft `save` mit `….webm` (Chromium-Rekorder) bzw. `….mp4` (Rekorder liefert `audio/mp4`). Die Daten sind nicht leer, es gibt **kein** ZIP. Toast „Audio gespeichert“.
- [ ] N0a-02 Der MIDI-Export liefert `….zip` mit `….mid` darin. Wirft der Mock `extension_not_enabled` oder `rejected_extension`, kommt der Toast „Dieses Format ist hier nicht verfügbar – App in Safari öffnen“. Dabei gibt es genau einen `save`-Aufruf: keine Wiederholung, kein anderes Format.
- [ ] N0a-03 `deliverNow(base, bytes, 'syx')` legt `base.syx` in `base.zip`. Ohne `window.claude` entsteht direkt `.syx` mit `application/octet-stream`.
- [ ] N0a-04 Die Projektdatei wird weiter direkt als `.json` gespeichert; die Prüfsumme ist unverändert.
- [ ] N0a-05 Mock `window.claude = {use: async () => null}`, Seite ohne Rahmen:
  - MIDI-Export und Projektdatei lösen den Download-Link aus (Playwright-`download`-Ereignis mit `….mid` bzw. `….json`) bzw. `navigator.share` (gemockt, `pointer:coarse`).
  - Kein Toast „Export hier nicht verfügbar“, Rückgabe nicht `'unavailable'`.
  - Gegenprobe: dieselbe Seite in einem `<iframe>` mit demselben Mock → Toast „Export hier nicht verfügbar“, kein Download.

### A.2 V0b — Ergänzung (N0b): Bibliothek „aktive Engine zuerst“, taktbündiges FOLGEN

**Umfang (zusätzlich):**
1. **EN-04 in der heutigen Bibliothek.**
   - Kopf: „SOUNDS · SYNTH 2 · FM“.
   - Erste Chip-Zeile: [FM ▾ │ Alle Engines], danach die Rollen-Chips der Engine.
   - In der Ansicht „Alle Engines“ trägt jede Zeile ein Kennzeichen VA, FM oder WT, und die Sounds der aktiven Engine stehen zuerst.
   - Auf der Drum-Spur bleibt es bei den Kits.
2. **Rollen der 12 FM-Werks-Sounds**, abgeleitet aus der Phrasen-Art in `SQ_FACTORY`:

   | Phrasen-Art | Rolle | Sounds |
   |---|---|---|
   | `bass` | Bass | Pop-Bass DX, Solid-Bass |
   | `keys` | Keys | DX-Tines E-Piano, Glas-EP, FM-Orgel |
   | `arp` | Sequenz | FM-Pluck, Marimba-Holz, Kalimba |
   | `chord` | Akkord | DX-Brass |
   | `bell` | Glocke | Röhrenglocke, Kristallglocke |
   | `pad` | Fläche | Glocken-Fläche |

   - Den Chip „Glocke“ gibt es nur in FM (EN-18).
   - VA- und WT-Werks-Sounds behalten ihre Kategorie als Rolle (Abbildung wie §12.2); Ausnahme: der Werks-„Tropfen“ bekommt die Rolle „Effekt“ (EN-16, EN-18).
   - Der erste Chip der Rollen-Zeile heißt „Alle <Engine>“, z. B. „Alle FM“ (EN-18).
3. **EN-07** für ROLLE, die Melodie-Rolle der WP6-Song-Ansicht und die Song-Ansicht selbst (`svAutoScroll`):
   - Im Zustand FOLGT blättert die Ansicht am Taktstrich in ganzen Seiten. Neue Seite: `x0 = floor(beat / Seitenbreite) · Seitenbreite`.
   - HÄLT-Gründe (a)–(e) wie §5.1. Die Song-Ansicht hält zusätzlich bei offener Akkord-Auswahl und bei markierter Zelle.

**Berührungspunkte:**
- `openBrowser` (Z. 14386; Chip aus der Engine statt aus der Ursprungs-Kategorie)
- `brItems` (Z. 14449; Engine-Filter, Sortierung)
- `soundList` / `stepSound` (Z. 14040 / 14046; nur innerhalb der Engine und der gezeigten Liste)
- `loadPreset` (Z. 12871; Engine-Wechsel nur mit Toast)
- `PianoRoll.playhead` (Seitenregel)
- Anlage der Melodie-Rolle (`follow:true`)
- `svAutoScroll`
- `viewState`

**Dauer** +1–1,5 h (V0b gesamt 5–6 h) · **Budget** +10 KB.

- [ ] N0b-01 FM-Spur (Synth 2): Die Bibliothek öffnet mit Filter FM. Jede sichtbare Zeile hat `engine === 'fm6'` (DOM `data-engine`), auch nach dem Wechsel jedes Rollen-Chips. Eine VA-Spur zeigt nur VA, eine WT-Spur nur WT, die Drum-Spur Kits.
- [ ] N0b-02 Synth 1 (VA-Bass) → [FM] → Bibliothek: Filter ist FM. Der Chip „Bass“ zeigt Pop-Bass DX und Solid-Bass (ab V0d auch die neuen FM-Bässe), aber **keinen** VA-Bass. Ein Tipp auf die erste Zeile ergibt `getSound(0).engine === 'fm6'`.
- [ ] N0b-03 ‹ › im Editor-Kopf, je 20× vor und zurück auf der FM-Spur: Nach jedem Schritt gilt `engine === 'fm6'`. Die Folge läuft im Kreis durch die gezeigte Liste.
- [ ] N0b-04 [Alle Engines]:
  - Es erscheinen ≥ 46 Werks-Zeilen, jede mit Kennzeichen; die aktive Engine steht zuerst.
  - Ein Tipp auf einen VA-Sound auf der FM-Spur bringt den Toast „wechselt zu VA“ mit [Rückgängig].
  - [Rückgängig] stellt den FM-Sound deep-equal wieder her.
- [ ] N0b-05 Wechsel von Filter oder Chip spielt nichts (U-01 bleibt: Master-RMS < −70 dBFS) und ändert keinen Sound.
- [ ] N0b-06 M-SEITE:
  - ROLLE, 4-Takt-Clip, 1 Takt sichtbar: Im Zustand FOLGT ist jedes `x0` ein Vielfaches von 4 Schlägen.
  - Wechsel nur am Taktstrich (±1 Bild).
  - Sind 2 Takte sichtbar, sind es Vielfache von 8 Schlägen.
  - Gleiches gilt für die Melodie-Rolle während ▶ SONG (112 BPM, `viewState('mel')`).
- [ ] N0b-07 Tipp-Test in der Melodie-Rolle während ▶ SONG (CDP-Touch):
  - 13 Tipps an **derselben x-Position**, je Tipp **eine Tonhöhenreihe tiefer**, im Abstand von 1 s. (Ein Tipp auf eine vorhandene Note setzt keine neue Note; deshalb wechselt die Reihe.)
  - Es entstehen 13 Noten mit identischem Schlag im selben Takt.
  - `viewState('mel').x0` bleibt über alle 13 Tipps unverändert (HÄLT nach (b)/(d)).
  - Gegenprobe am Ausgangsstand WP7-fix1: Die Noten liegen in ≥ 2 verschiedenen Takten (R6-Audit: 13 Tipps auf denselben Punkt ergaben 5 Noten auf den Schlägen 2,25 / 5,25 / 8,25 / 11,25 / 14,25).
- [ ] N0b-08 WP6-Song-Ansicht, 16-Takt-Song, 8 Takte sichtbar:
  - Im Zustand FOLGT gilt `viewState('song').x0` ∈ {0, 8} Takte.
  - Die Ansicht bleibt stehen, solange die Akkord-Auswahl offen ist, bis 3 s nach einer Änderung und nach Wischen von Hand.

### A.3 V0c — Ergänzung (N0c): ▶ oben im Song, Träger gehören dem Song

**Regel TA9 (neu, ergänzt §4.6): Träger gehören dem Song.**
- **Beim Start:** Wenn ▶ SONG oder ● SONG startet, merkt sich die App den Träger-Stand: Ziel, Latch, Modus und angewandte Verschiebung.
- **Beim Ende:** Endet die Song-Wiedergabe, stellt die App diesen Stand **im selben Moment** wieder her, auch ORIGINAL (`null`). Die Song-Wiedergabe endet bei:
  - Song-Ende ohne Schleife;
  - ■;
  - einem Szenen- oder Clip-Start, der den Song beendet;
  - Verlassen des Song-Modus;
  - Ende einer Aufnahme bei stehendem Transport;
  - **Ende einer Aufnahme, nach der keine Song-Wiedergabe weiterläuft, auch bei laufendem Transport** (Xanders Weg I2: ● SONG bei laufenden Szenen, ● beenden, die Szenen laufen weiter; gemessen in N0.2b #1). Der Stand wird im selben Moment zurückgesetzt, in dem `songRecEnd` die Aufnahme schließt.
  - Kurz: Sobald nach einem Ereignis weder ▶ SONG noch ● SONG läuft, gilt wieder der gesicherte Stand.
- **Toast:** „Träger zurück auf <Stand vorher, z. B. ORIGINAL>“ mit [<zuletzt gehört, z. B. F> behalten].
  - [behalten] setzt diesen Träger wie einen gelatchten Hand-Träger.
  - Das ist kein Projekt-Undo, denn Träger sind Laufzeit-Zustand.
- **Daten:** Die Träger-Einträge im Song bleiben unverändert.
- **Während der Wiedergabe** gilt weiter TA1 (Hand > Song).
- **I-01:** Nur der Stand wird gesichert und zurückgesetzt. Die Abbildung (`Harmony`/`Transposer`) bleibt unverändert.

**EN-06: ▶ oben in der Song-Ansicht.**
- Ist die Song-Ansicht offen, startet ▶ in der Kopfleiste `songPlayStart` statt der Szenen. Die Taste zeigt dann „SONG“ (klein unter dem Zeichen; Breite unverändert, L3).
- **Startpunkt:** die Lineal-Marke. Ist keine gesetzt, der Takt, an dem zuletzt gestoppt wurde (abgerundet auf den Taktanfang). [⏮] in der Song-Transportzeile setzt auf Takt 1.
- Ist die Song-Ansicht zu, startet ▶ die Szenen wie bisher.

**Berührungspunkte:**
- `stop` (Z. 9762), `togglePlay` (Z. 9832), ▶ in der Kopfleiste (Z. 16952)
- `songPlayStart` (Z. 9546), `songPlayEnd` (Z. 9570), `songRecEnd` (Z. 9522)
- Träger-Modul `T` (Stand sichern und wiederherstellen), Toast
- `runtime().song` (neues Feld `posBar`)

**Dauer** +1–1,5 h (V0c gesamt 5–6 h) · **Budget** +6 KB.

- [ ] N0c-01 Song-Ansicht offen, ▶ SONG läuft in Takt 2. ■ oben, dann ▶ oben (CDP-Touch auf `#bPlay`):
  - `runtime().song.play === true`;
  - im `noteLog` kein Szenen-Start;
  - die Taste zeigt „SONG“.
- [ ] N0c-02 Fortsetzen:
  - ■ in Takt 5, dann ▶ oben → die Wiedergabe setzt in Takt 5 fort; das erste Song-Ereignis liegt bei Schlag 16 ± 0,002 (M-ZEIT).
  - [⏮] setzt auf Takt 1.
  - Eine gesetzte Lineal-Marke (Takt 3) hat Vorrang.
- [ ] N0c-03 Song-Ansicht zu: ▶ oben startet die Szenen wie in WP7; die alten Tests bestehen unverändert.
- [ ] N0c-04 TA9 nach ▶ SONG:
  - Vorher ist der Träger ORIGINAL (`runtime().carrier === null`).
  - Song mit Träger F (+5) bis Schlag 8, dann ■ → im selben Moment `runtime().carrier === null`.
  - Danach ▶ in den Szenen: Der Synth-1-Clip 36/48/43/40 ergibt `out` 36/48/43/40 (`noteLog`).
  - Der Toast bietet [F behalten]. Nach dem Tipp gilt `carrier.name === 'F'`, und der nächste Durchlauf ergibt `out` 41/53/48/45.
- [ ] N0c-05 TA9 nach ● SONG (Ablauf wie in der Gegenprobe N0.2): Ergebnis wie N0c-04. Die aufgenommenen Träger-Einträge stehen unverändert im Song (`song().carrier` deep-equal).
- [ ] N0c-06 Vorher gelatchter Hand-Träger Am: Nach Song-Ende ohne Schleife, nach ■ und nach Verlassen des Song-Modus ist jeweils wieder Am gesetzt (Ziel deep-equal, ohne `pendingAt`/`pendingBeat`).
- [ ] N0c-07 Hand-Träger während des Songs ([↩ SONG] sichtbar), dann ■: Es gilt der Stand von vor dem Song, und der Toast bietet den zuletzt gehörten Träger an.
- [ ] N0c-08 Xanders Weg I2 **ohne ■** (Ablauf wie `r6/n6/traeger-rec-check.mjs`):
  - Leerer Song (`songDelete`), Träger vorher ORIGINAL. Szene 1 läuft, ● SONG, bei Schlag ≈ 4,6 F als Hand-Träger, bei Schlag ≈ 12,4 ● beenden, **kein ■**.
  - Im selben Moment (nächster `runtime()`-Aufruf nach dem Tipp, höchstens 1 Bild) gilt `runtime().carrier` = Stand vorher (`null`), `playing === true`, `song.play === false`.
  - Ab dem nächsten Takt spielen die Szenen `out` = `clip` (Synth 1: 36/48/43/40, `noteLog`).
  - Der Toast bietet [F behalten]; nach dem Tipp gilt `carrier.name === 'F'`, und Synth 1 spielt wieder 41/53/48/45.
  - Der aufgenommene Träger-Eintrag F steht unverändert im Song (`song().carrier`).
  - Gegenprobe am Ausgangsstand WP7-fix1: Träger bleibt F, Szenen spielen 41/53/48/45 (N0.2b #1).

### A.4 NEU V0d — FM-Sofort

**Ziel.** FM klingt und lässt sich bedienen, wie Xander es erwartet:
- Algorithmus 1 und 2 sind unterscheidbar.
- Die Bildchen sind ganz sichtbar.
- Modulatoren wirken schon im unteren Fader-Weg.
- Bässe drücken auf dem Handy.
- Der FM-Ordner hat eigene Klänge.
- Der Tropfen tropft.

Ein FM-Feld ist dafür nicht nötig (EN-02).

**Umfang.**

1. **Algorithmus-Diagramm und FEEDBACK** (`algSvg` Z. 7331, ALGO-Seite, FEEDBACK-Regler):
   - Die Feedback-Schleife wird immer gezeichnet: bei FB 0 grau gestrichelt mit 1 px, bei FB > 0 orange mit der heutigen Dicke. DOM-Attribut `data-fbop` = Nummer des FB-Operators.
   - Etikett „FEEDBACK · OP n“ aus `alg.fbSrc`; bei Alg 4 „FEEDBACK · OP 6→4“, bei Alg 6 „FEEDBACK · OP 6→5“.
   - Der Regler ist grau mit Grund (L2), wenn der FB-Operator aus ist, Pegel 0 hat oder sein Weg zu einem Ausgang über einen Operator mit Pegel 0 führt. Text: „wirkt erst, wenn OP n klingt“ bzw. „Weg über OP m stumm“.
   - Beim Wechsel zwischen zwei Algorithmen, deren Kanten ohne Feedback gleich sind, erscheint die LCD-Zeile „Unterschied nur: Feedback auf OP 2 statt OP 6 – hörbar ab FB ≈ 5“. Die Paare werden aus der Tabelle berechnet, nicht von Hand gelistet.
   - Hilfe-Zeile: „Feedback hörst du ab ≈ 3, wenn sein Operator ein Ausgang ist, als Modulator ab ≈ 5.“
2. **Hüllkurven-Bildchen** `.fmspk` (`fmSparkD` Z. 13531):
   - Den Pfad in Gerätepixeln rechnen, ohne `preserveAspectRatio="none"` mit `vector-effect:non-scaling-stroke`.
   - Innenrand ≥ 3 px unten und ≥ 2 px oben. Fläche unter der Kurve mit Deckkraft 0,2, Grundlinie 2 px über dem Boden.
   - Höhe ≥ 16 px. Die Passstufen, die heute `display:none` setzen (fit3: 320×568, 844×340), zeigen stattdessen eine 10-px-Fassung.
   - Höhen nicht aus der Schriftmetrik ableiten, weil WebKit anders rendert.
3. **Modulator-Fader** (ALGO-Streifen, OP-Seite „Pegel“, später FELD):
   - Weg p ∈ [0, 1] → `OL = round(99 · p^0,45)`, Rückweg `p = (OL/99)^(1/0,45)`.
   - Das gilt nur für Operatoren, die im aktuellen Algorithmus Modulatoren sind. Ausgänge bleiben linear in OL (≈ 0,75 dB je Schritt).
   - Unverändert bleiben die Daten (`ol` ganzzahlig 0–99), .syx und die Mod-Ziele `op1…op6`.
   - Anzeige: Index unter 1 mit 2 Nachkommastellen („I 0,08“), darüber mit 1. Daneben klein die OL-Zahl („OL 40“). Ab OL 20 nie „I 0,0“.
3b. **MAKRO-Helligkeit mit Kurve** (`pageFmMakro` Z. 13801, `pd('fmBright')` Z. 7741):
   - Reglerweg v ∈ [−1, 1] ab der Mitte → `fmBright` = 24·sgn(v)·|v|^0,5 dB, Rückweg v = sgn(dB)·(|dB|/24)². Bei v = 1/16 / ¼ / ½ / 1 sind das 6,0 / 12,0 / 17,0 / 24,0 dB.
   - Daten, Bereich (−24 … +24 dB), Mod-Ziel `fmbright` (1,0 = 24 dB) und .syx bleiben unverändert; nur der Weg des Reglers ändert sich.
   - Anzeige weiter in dB („+12 dB“).
   - Grund: Xanders „0–2 nichts, ab ~5 hörbar“ passt zu dieser Anzeige (N0.1). Gemessen bewegt +2 dB an DX-Tines den Schwerpunkt nur um 0,04 Okt, +6 dB um 0,32 Okt, +12 dB um 1,56 Okt (N0.2b #2).
   - FEEDBACK bleibt in V0d ganzzahlig 0–7 (DX-tauglich); Bruchteile kommen mit `fmx.fbAmt` (N4a-01). Der Hilfe-Satz aus Punkt 1 erklärt die Schwelle.
4. **Hüllkurve auf mehrere:** OP › HÜLLK. bekommt neben [Auf alle Ausgänge] die Knöpfe [Auf alle Modulatoren] und [Auf alle], je ein Undo.
5. **Bässe in notierter Lage (EN-03):** Pop-Bass DX und Solid-Bass werden nachgestimmt. Jeder behält seinen Algorithmus und seinen Charakter; R6-B1/R6-B2 sind **keine** Vorlagen für diese beiden (sonst entstünden Doppel zu Stapel-Bass FM und N64).
   - Regeln: alle Verhältnisse so, dass der Grundton in notierter Lage klingt (Pop-Bass DX: alle Verhältnisse ×2 und `trans` −12 → 0); ein ×0,5-Paar nur als Sub neben einem ×1-Ausgang.
   - Modulator-L3 ≥ 70. Modulator-R2 70–75 ergibt das „Schnappen“ (Absturz um 20 dB in 38 ms bzw. 19 ms, R6-Audit).
   - **Tastaturskalierung links** (+LIN, Breakpoint bei C2 = `bp` 19, `ld` 35–50) an den Modulatoren für die Lage E1. Ohne sie verfehlen die gemessenen Bässe meist E1 ≥ −20 dB (N0.2b #5).
   - Gemessene Startwerte (`r6/bibliothek-recherche.md` §12.3): **Pop-Bass DX** = Regeln + Modulator-OL +14 + KS `ld` 50 → C2 64,5 Hz, M-HANDYrel −11,6 dB, E1 −15,8 dB, M-BISS 28,6 dB. **Solid-Bass**: in 21 Varianten E1 bestes −23,2 dB, Startwerte im Bau suchen (Regel in V0d-11).
   - IDs und Namen bleiben; umbenannt wird erst in V10b.
6. **FM-Ordner: 7 neue Werks-Sounds.** Rezepte aus `r6/bibliothek-recherche.md`, **R6-Tabelle F**; Parameter wörtlich aus `r6/n6/rezepte76.json` (bzw. R6-B1 aus `r6/fm-measure-d.out`); Namen nach E9.

   | Name | Herkunft (Parameterform) | V0d-11 gemessen |
   |---|---|---|
   | Stapel-Bass FM | R6-B1 + Tastaturskalierung links `ld` 35 an OP 2/4 | ja (E1 −16,2 dB) |
   | N63 Abgrund-Bass FM | R6-Tabelle F; N6-Startwerte aus `rezepte76.json` (die wörtliche Übersetzung verfehlt V0d-11) | ja (C2 −11,2, E1 −12,6 dB) |
   | N64 Knurr-Bass FM | R6-Tabelle F wörtlich (`rezepte76.json`); R6-B2 nur Messbezug | ja (C2 −14,8, E1 −17,9 dB) |
   | N65 Kristall-Lead FM | R6-Tabelle F (`rezepte76.json`, `gain` −6 dB) | – |
   | N66 **Funk-Stich FM** (bisher „Klavinett-Stich FM“) | R6-Tabelle F (`rezepte76.json`) | – |
   | N67 Atem-Orgelfläche FM | R6-Tabelle F (`rezepte76.json`) | – |
   | N68 FM-Flügel | R6-Tabelle F (`rezepte76.json`), Annäherung; ⓘ „Prinzip: Teiltongruppen getrennt bauen, wie Manny Fernandez' FM-X-Klavier (SE); hier mit 6 Operatoren“ | – |

   - Jeder Sound bekommt eine Rolle (Zuordnung N0b, EN-18) und eine Kategorie-Phrase. Pegel werden auf −18 ± 3 LUFS kalibriert (die Werte in `rezepte76.json` sind unkalibriert).
   - N66 heißt neu „Funk-Stich FM“: „Klavinett“ liegt nah an „Clavinet“, nach eK eine Marke von Hohner (unsicher; `r6/bibliothek-recherche.md` §13).
7. **Hinweis nach .syx-Import:**
   - **Bezug ist nicht der tiefste Teilton**, sondern das höchste Verhältnis unter den Ausgängen, deren OL höchstens 12 Schritte (≈ 9 dB) unter dem lautesten Ausgang liegt. Ausgänge mit fester Frequenz zählen nicht.
   - Liegt dieser Bezug bei C2 (65,41 Hz · Verhältnis · 2^(`trans`/12)) unter 40 Hz, erscheint „klingt n Okt. unter notiert“ mit n = round(log2(65,41 Hz / Bezug)).
   - Dazu der Knopf [An Spur anpassen]: `trans` + 12·n, innerhalb ±24, ein Undo.
   - Grund: EN-03 erlaubt ein ×0,5-Sub-Paar neben einem ×1-Ausgang. Nach der alten Regel bekäme ein solcher Import (wie R6-B2: tiefster Teilton 32,2 Hz) fälschlich „1 Okt.“, und [An Spur anpassen] verschöbe ihn eine Oktave zu hoch. Gerechnet für ROM1A und R6-B1/B2: alte Regel 16 von 34 Hinweisen, neue Regel 8 von 34 (N0.2b #6).
8. **Tropfen (EN-16):**
   - `f-tropfen` = Rezept „N69 Tropfen-Plopp“; die Werte stehen in `r6/mess/tropfen.mjs` (wörtlich auch in `rezepte76.json`). Rolle „Effekt“ (EN-18).
   - Neu: „Tropfen-Ping“ (Rezept N70, ebenda), Rolle Sequenz.
   - Die Rezepte sind mit dem Worklet aus WP7-fix1 gemessen, trocken.
9. *(P1)* **Effekt-Sounds N71–N76** mit der **Rolle „Effekt“** (EN-18; R6-Tabelle G nennt dort „Atmo“). Parameter aus `rezepte76.json` (N71 und N73 wörtlich aus `r6/mess/effekte.mjs` bzw. `pfeifstart.mjs`, N71 mit Rauschen 6 % und Res 1,1). Sonst kommen sie in V10d.

**Nicht-Umfang.** FM-Feld (V4); Feedback in Bruchteilen (kommt mit `fmx.fbAmt`, N4a-01); weitere Vorbild-Presets (V10d); Umbenennung von „Pop-Bass DX“ (V10b). Aus Runde 9 (A.4b Punkt 11): FM-X-Extras der Hüllkurven (Hold Time und Pitch-EG je Operator, Anschlag ±, Time/Key ±, Zeit-Format), DX-LFO mit AMS je Operator, Key-Sync-Schalter und ECO mit echter PM (alle V4a/V4b); Mehrpunkt-Hüllkurven mit Schleife und Spektralformen (§18).

**Berührungspunkte.**
- `algSvg`, ALGO-Seite (Etikett, LCD), FEEDBACK-Regler
- `fmSparkD`, CSS von `.fmspk` und die Passstufen
- `fmOpCtl` und `fmOlTxt` (Fader-Kurve, Anzeige), Hüllkurven-Knöpfe der OP-Seite
- `pageFmMakro` / `sKnob('fmBright')` (Helligkeits-Kurve, Punkt 3b)
- `SQ_FACTORY` (F-Einträge, Rollen), `importSyx` (Hinweis), Hilfe
- Anpassung der Tests FM1–FM10 und PR8

**Dauer** 5,5–6,5 h, mit A.4b 10,5–12,5 h · **App-Version** 3.4.0 · **Budget** +35 KB, mit A.4b +65 KB.

**Abnahme-Checkliste**
- [ ] V0d-01 Die Feedback-Schleife ist bei FB 0 und FB 5 vorhanden (`[data-fbop]`): Alg 1 → `6`, Alg 2 → `2`. Der Bildvergleich Alg 1 gegen Alg 2 bei FB 0 zeigt im Schleifenbereich eine Pixel-Differenz > 0.
- [ ] V0d-02 Für alle 32 Algorithmen lautet das Etikett „FEEDBACK · OP “ + `fbSrc` laut Tabelle (Alg 4 „6→4“, Alg 6 „6→5“).
- [ ] V0d-03 Graustufen des FEEDBACK-Reglers:
  - INIT FM → grau mit Grund.
  - Alg 2, OP 2 auf OL 80 → nicht grau.
  - Alg 1, OP 6 auf OL 80, OP 5 auf OL 0 → grau mit „Weg über OP 5 stumm“.
- [ ] V0d-04 Für jedes Paar mit gleichen Kanten ohne Feedback (aus der Tabelle berechnet, mindestens 1↔2) erscheint beim Wechsel die LCD-Zeile mit beiden OP-Nummern.
- [ ] V0d-05 Testpatch mit allen 6 Operatoren an, Modulatoren OL 80, Note C3:
  - Alg 1 gegen Alg 2 bei FB 0: RMS-Differenz ≤ −60 dB.
  - Bei FB 7: M-SP-Unterschied ≥ ⅓ Okt (R6-Audit: 12,7 HT).
  - CHANGES hält fest: Der Unterschied ist nur das Feedback.
- [ ] V0d-06 Bildchen in P1, P2, P3, L1, L2, 390×664, 430×780 und 844×340:
  - sichtbar, also kein `display:none`;
  - Höhe ≥ 16 px (Kompaktfassung ≥ 10 px);
  - Strich-Unterkante ≥ 2 px über der Kastenunterkante (Rechteck des Pfads plus halbe Strichbreite).
- [ ] V0d-07 Fader-Abbildung an Modulatoren (CDP-Touch-Zug, Wert über `getFm`): p 0 / 0,13 / 0,35 / 0,5 / 0,68 / 1 → OL 0 / 40 / 62 / 72 / 83 / 99 (± 1). Ausgangs-Fader bleiben linear. Export und Import über .syx ergeben dieselben `ol`.
- [ ] V0d-08 Hörbar schon unten. Aufbau: Alg 1, OP 1 Ausgang, OP 2 ×1 Modulator, OP 3–6 OL 0, Note C3, Anschlag 0,8.
  - Bei p = 0,15 liegt der 2. Teilton ≥ −30 dB zum Grundton.
  - p 0 → 0,4 verschiebt M-SP um ≥ ⅓ Okt.
  - Über p = 0, ¼, ½, ¾, 1 steigt M-SP ohne Rückgang > 0,05 Okt.
- [ ] V0d-09 Anzeige: OL 40 → „I 0,08“, OL 83 → „I 3,1“. Die OL-Zahl ist sichtbar. Ab OL 20 erscheint nie „I 0,0“.
- [ ] V0d-10 [Auf alle Modulatoren] und [Auf alle]: R1–R4 und L1–L4 aller Ziel-Operatoren sind gleich der Quelle (deep-equal). Ein Undo stellt den alten Stand her.
- [ ] V0d-11 Bässe (Pop-Bass DX, Solid-Bass, Stapel-Bass FM, Abgrund-Bass FM, Knurr-Bass FM):
  - M-TIEFSTER bei C2 = 65,4 Hz ± 3 %. Ein Sub-Paar darf zusätzlich 32,7 Hz liefern, wenn der 65-Hz-Teilton höchstens 6 dB unter dem stärksten liegt.
  - M-HANDYrel bei C2 zwischen −16 und −8 dB, bei E1 ≥ −20 dB.
  - M-BISS ≥ 15 dB (C2 und E1).
  - Phrase −18 ± 3 LUFS (trocken).
  - PR1 und PR8 bestanden.
  - Messverfahren und Startwerte: `r6/n6/rezepte76.mjs` bzw. `fm-bass-tune2.mjs`; die Tabelle in `r6/bibliothek-recherche.md` §12.3 gilt als Ausgangsstand.
  - **Solid-Bass:** Erreicht er nach dem Nachstimmen E1 ≥ −20 dB nicht, gilt für ihn bei E1 ≥ −24 dB. CHANGES nennt dann den Messwert und die geprüften Varianten (Grund: 21 Varianten in N0.2b #5 kamen auf höchstens −23,2 dB). Alle anderen Grenzen gelten unverändert.
- [ ] V0d-12 MAKRO-Helligkeit mit Kurve (Punkt 3b):
  - Bei v = +¼ des Wegs (Kurve: +12 dB) M-SP ≥ ⅓ Okt an DX-Tines und an allen fünf Bässen (Note C3 bzw. C2, Anschlag 0,8). Gemessen mit +12 dB: DX-Tines 1,56 Okt, R6-B1 1,20 Okt, R6-B2 4,09 Okt (N0.2b #2).
  - H-3 stetig über v = 0, ¼, ½, ¾, 1 (Zielmaß M-SP; kein Rückgang > 0,05 Okt).
  - Fader-Abbildung per CDP-Touch-Zug: v 1/16 / ¼ / ½ / 1 → `fmBright` 6,0 / 12,0 / 17,0 / 24,0 dB (± 0,5).
  - Zur Einordnung: Minimum → Maximum (−24 → +24 dB) erfüllt H-1 schon heute (Pop-Bass DX −0,04 → +0,85 Okt). Der frühere Satz „heute nur +0,15 Okt“ galt für 0 → +12 dB.
- [ ] V0d-13 Die 7 neuen FM-Sounds:
  - PR1/PR8 bestanden, −18 ± 3 LUFS, Rolle gesetzt.
  - Der FM-Ordner (Filter FM, Chip „Alle FM“, EN-18) zeigt ≥ 19 Werks-Sounds.
  - Kein Name enthält einen Marken- oder Personennamen (Prüfliste A.4 plus A.13, Prüfung auf ganzen Wörtern).
  - Kein `fm6` gleicht einem anderen Werks-`fm6` (deep-equal über `alg`, `fb`, `ops`); insbesondere sind Pop-Bass DX, Solid-Bass, Stapel-Bass FM und N64 verschieden.
- [ ] V0d-14 .syx-Hinweis (Regel aus Punkt 7):
  - Import von „BASS 1“ aus `scratchpad/fmresearch/proto/rom1a.json` mit `trans` −12 → Hinweis „2 Okt.“.
  - [An Spur anpassen] → `trans` +12 und M-TIEFSTER bei C2 = 65 Hz ± 3 %; ein Undo.
  - Ein Import nach Art von R6-B2 (Ausgang ×1 OL 99 und Sub-Ausgang ×0,5 OL 88, `trans` 0; tiefster Teilton 32,2 Hz) bekommt **keinen** Hinweis.
  - Die Zahl der Hinweise über alle 32 ROM1A-Stimmen ist 8 (wie `r6/n6/syx-hinweis.out`, dort mit R6-B1/B2 gezählt: 8 von 34).
- [ ] V0d-15 Tropfen, gemessen bei C5 und G5:
  - **Tropfen (N69):**
    - M-TONVERLAUF im Fenster 0–4 ms ≤ −3 HT, im Fenster 40–80 ms 0 ± 0,5 HT (der Ton steigt zur Note).
    - Verhältnis der Grundfrequenzen G5/C5 = 1,498 ± 0,02.
    - M-AUS ≤ 60 ms.
  - **Tropfen-Ping (N70):**
    - 0–4 ms +16 bis +20 HT, 40–80 ms +24 ± 0,5 HT.
    - Verhältnis 1,50 ± 0,02.
    - M-AUS ≤ 40 ms.
  - Ein gespeichertes Projekt mit dem alten Tropfen rendert je Band höchstens 0,5 dB anders (L7).
- [ ] V0d-16 *(P1)* Effekt-Sounds:
  - N71 (Rauschen 6 %, Res 1,1, Note C3): Die Grundfrequenz zählt erst ab dem ersten 10-ms-Fenster ≥ −40 dBFS. Dieses Fenster liegt bei 0,27 ± 0,1 s; die Grundfrequenz steigt von dort 87 Hz (± 10 %) auf 1030 Hz (± 5 %) bei 4 s; Anschwingen bis −30 dBFS ≤ 0,5 s (gemessen 0,38 s, N0.2b #3).
  - N73: M-SP ≤ 200 Hz bei 0,25 s und ≥ 2,5 kHz bei 4 s.
  - N75: M-SP-Spanne ≥ 3 Okt.
  - N72, N74, N76: PR1/PR8 bestanden, Messwerte in CHANGES.
- [ ] V0d-17 Regression:
  - FM1–FM10, PR1 und PR8 (WP7) bestehen. Abweichungen nur über `v0d-adapt-*.mjs` mit Verweis auf EN-03 bzw. EN-16.
  - M-PLATZ für ALGO, OP und Bibliothek.
  - DoD.

**Tests.** `v0d-fm-ui.mjs` (CDP-Touch), `v0d-fm-sound.mjs` (Node-Offline wie `r6/fm-measure-d.mjs` bzw. `r6/n6/rezepte76.mjs`), `v0d-tropfen.mjs`.

**Risiken.**
- Die Fader-Kurven (OL und Helligkeit) treffen alte Tests, die Pixel in Werte umrechnen (Adaption).
- Die Bässe sind nur gemessen, nicht angehört → Xanders Hörtest (Frage E.11).
- Solid-Bass erreicht E1 ≥ −20 dB mit den einfachen Regeln nicht (N0.2b #5); Ausweichregel in V0d-11.
- Ob Xander mit „Reglerwert ~5“ die Helligkeit, FEEDBACK oder den OL-Fader meinte, ist offen (E.12). V0d ändert OL-Fader und Helligkeit; FEEDBACK bekommt in V0d nur den Hinweis, Bruchteile kommen mit N4a-01.
- Die Darstellung der Bildchen in WebKit ist ungeprüft (iPhone-Prüfpunkt in CHANGES).

### A.4b V0d — Ergänzung N0d-2 (Runde 9, 17.10.): FM-Hüllkurven wie DX7/FM-X

Stand 17.10.2026. **Verbindlich für V0d**, zusätzlich zu A.4; bei Widerspruch gilt A.4b. Anlass: Xander, Runde 9, „FM-Hüllkurven – Katastrophe“ (`v3-ideen/fragen-xander-9.md` Z. 14–18; vorher I1 in `fragen-xander-6.md`).

**Grundlage:**
- Diagnose mit Messungen gegen msfa/Dexed: `v3-ideen/r8/fm-diagnose.md`.
- Stand der Technik: `v3-ideen/r8/fm-huellkurven-recherche.md`. **Achtung:** Deren Raten-Zeit-Tabelle (§1.3) gibt etwa 4,5-mal zu hohe dB/s an, die Zeiten sind also etwa 4,5-mal zu kurz (z. B. R 80 bis −20 dB: dort 2,5 ms, msfa 11 ms). Maßgeblich ist Tabelle T1 unten, gegen das msfa-Hüllkurvenprotokoll geprüft.
- Gegenproben und Prototyp dieser Ergänzung: `v3-ideen/r8/a4b/`.
  - Skripte `tools/*.mjs`, Ausgaben `out/*.out`.
  - `tools/a4b-lib.mjs` lädt den Worklet-Quelltext aus V0a und setzt zwei Prototyp-Patches ein: `HOLD` (Punkt 2) und `PEG` (Punkt 3). Der Builder kann sie als Vorlage nehmen.
  - Referenz: `v3-ideen/r8/ref/bin/dx7render` = Dexed-msfa mit `ACCURATE_ENVELOPE` (Quelle `r8/ref/dx7render.cc`, `r8/ref/src/msfa/`). Aufruf wie `refSR` in `a4b-lib.mjs`.
- **Zeilenangaben „Z. n“ beziehen sich in A.4b auf `synq-snapshots/V0a.html`** (= Xanders Stand 3.1.0; Worklet und FM-Code laut Diagnose gleich der Arbeitskopie). Builder suchen über den Funktionsnamen.
- Quellenangaben „Dexed …“ meinen `asb2m10/dexed`, Commit `fea2f0f` (lokal `r8/src/dexed-repo/`, `source/msfa/` gleich `r8/ref/src/msfa/`, per `diff` geprüft).

**Befund (gemessen, Diagnose §0):**
- Der Klangmotor rechnet wie Dexed/msfa und schneidet nie ab. Fällt ein Modulator auf 0, klingt der Träger in voller Höhe als Sinus weiter, in allen drei Motoren.
- Die „Katastrophe“ entsteht in der Bedienung, siehe Tabelle.
- Echte DX7-Lücken der Engine: Die **Pitch-EG fehlt** (der .syx-Import verwirft sie, Z. 15041), und die **Haltephase bei gleichen Pegeln fehlt**.

| Xander (Runde 9) | Ursache (gemessen) | Punkt |
|---|---|---|
| „Zieht man die Hüllkurve zusammen, schneidet sie den Sound total ab“ | Die OP-Seite öffnet auf OP 1, und OP 1 ist in allen 32 Algorithmen ein Ausgang. Zusammenziehen kürzt dort die Lautstärke (−15 dB bei 100 ms). Ganz links in den Spuren gibt es nur Phasen von 2–3 ms. Dazu kommen das Init mit R4 99 und das MAKRO „Länge“, das auch Träger kürzt. | 1, 4g, 7, 8 |
| „… weil sie in irgendeinem Raster hängt“ | Jede Phase hat eine eigene 78-px-Spur (1 ms … 40 s). Der ganze Snap-Bereich liegt auf 16 px. Der erste Zug springt um ×2. Bei gleichen Pegeln fällt die Rate stumm auf 0 (D1 = 32,7 s). | 4a–4c |
| „… weniger scharf: sperrig“ | 1 px = ×1,15 Zeit. Der Fein-Modus braucht 64 px Querweg. Es gibt keine Ziffern-Eingabe, und Pegelzüge verschieben die Zeit. | 4d–4h |
| „Modulator darf den Gesamtklang nicht abschneiden“ | Er tut es nicht (Engine). Man landet aber auf OP 1, in der wirkungslosen VA-ADSR des Reiters HÜLLK. oder beim MAKRO. | 1, 5, 7 |
| „Exponentielle Yamaha-Hüllkurven, ±-Hüllkurven, Pitch-Hüllkurve wie State of the Art?“ | Die Operator-EG ist DX7-genau (Abfall linear in dB, Angriff mit Sprung). Es fehlen die Haltephase und die Pitch-EG (±). | 2, 3, 6 |
| „FM-Effekte viel schwächer als am Montage, Werte extrem hochdrehen“ | Für hörbare FM braucht V0a dieselben OL-Werte wie der DX7 (Tabelle T3). Der lineare OL-Fader verschenkt 62 % seines Wegs; das behebt A.4 Punkt 3. Für eine höhere Index-Skala bei FM-X gibt es keinen Beleg (Recherche §3.5). | 10 |

**Ziel.**
- Ein Modulator wird so schnell „snappy“ wie am DX7, ohne dass der Ton abreißt: Editor › OP öffnet auf dem Modulator in HÜLLK., dann [Snap] (drei Gesten), danach Feinschliff mit dem Finger. Jede Änderung wird sofort vorgehört (Punkt 4o). Ab Init FM führt [+ Modulator] in einer Geste zu einem Snap-Modulator (Punkt 1).
- Die Hüllkurven rechnen wie Dexed/msfa, jetzt **mit Haltephase** und **Pitch-EG (±4 Okt.)**.
- Der Editor hat eine echte logarithmische Zeitachse ohne Grob-Raster und einen Fein-Modus. Er zeigt ms **und** DX-Rate.
- Der kürzeste Wert, den ein einfacher Zug erreicht, knackt nicht. DX-Extremwerte bleiben über die DX-Zeile erreichbar.

**Leitsatz.** EN-02 bleibt gültig: Formeln und Daten bleiben die von msfa/Dexed (R/L 0–99, `fm6`, .syx). Haltephase und Pitch-EG sind Teile von msfa/Dexed (Quellen bei Punkt 2 und 3); die Engine wird dadurch **gleicher**, nicht anders. Neu sind nur Bedienung, Anzeige, Vorlagen und ein Makro.

**Tabelle T1 — Rate → Zeit**, Abfall ab L 99 bei OL 99:
- Berechnet mit der msfa-Formel `LVL_PER_SEC` (Z. 2582) im 44,1-kHz-Raster von msfa, Dexed und V0a.
- Gegen das msfa-Hüllkurvenprotokoll geprüft: Abweichung ≤ 1 Block (1,45 ms), siehe `r8/a4b/out/e8-ratetab.out`.

| R | 99 | 95 | 90 | 85 | 80 | 75 | 70 | 65 | 60 | 55 | 50 | 40 | 30 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| bis −20 dB | 1,4 ms | 2,4 | 3,9 | 6,4 | 11 | 19 | 39 | 62 | 103 | 176 | 309 ms | 0,99 s | 2,8 s |
| bis −40 dB | 2,8 ms | 4,8 | 7,7 | 12,9 | 22 | 39 | 77 | 123 | 206 | 353 | 617 ms | 1,97 s | 5,6 s |

- Der echte DX7 läuft laut msfa-Wiki mit 49 096 Hz (`Dx7Hardware.wiki` Z. 9), ist also etwa 11 % schneller. msfa, Dexed und V0a nutzen das 44,1-kHz-Raster. Das bleibt so: Dexed-gleich, .syx-Importe klingen wie in Dexed.
- Ein Anstieg springt zuerst auf −50 dB und nähert sich dann im log-Bereich (msfa `env.cc`, Dexed Z. 84–88; msfa-Wiki `Dx7Envelope.wiki` Z. 44). Deshalb knacken DX-Angriffe mit R1 99 nicht.

**Umfang.**

1. **OP-Seite öffnet auf dem Modulator, die Rolle steht groß da** (`pageFmOp` Z. 14208, `subTabsFor` Z. 13627–13629, `fmSelect` Z. 14017, `fmStripCol` Z. 14082, `fmRole` Z. 13964)
   - Heute ist `ED.fmOp` beim ersten Öffnen undefiniert. `ED.fmOp | 0` ergibt OP 1, und OP 1 ist ein Ausgang (Diagnose 4a).
   - Neu `fmDefaultOp(fm)`: der Operator mit der kleinsten Nummer, der im Algorithmus **kein Ausgang** ist, an ist und OL > 0 hat. Gibt es keinen, der erste Ausgang.
     - Gesetzt wird `ED.fmOp = fmDefaultOp(fm)` **beim Öffnen des Editors** und nach jedem Laden eines anderen Sounds auf diese Spur, nicht erst beim Öffnen der OP-Seite. Ist die Wahl ein Modulator, setzt derselbe Schritt `ED.fmSub = 'env'`. Heute öffnet `pageFmOp` auf FREQ (Z. 14210: `if (!['freq','env','scale'].includes(ED.fmSub)) ED.fmSub = 'freq'`), der Weg zu [Snap] hätte also 4 Tipps.
     - Die letzte Wahl je Spur merkt sich `ED.fmOpT[i]`: Laufzeit-Zustand, nicht im Sound und nicht in `S.ui`.
     - **Rückfall auf einen Ausgang** (kein aktiver Modulator, z. B. Init FM: `FM_INIT_OP` Z. 13931 gibt nur OP 1 OL 99, OP 2–6 haben OL 0): Die Vorlagen-Zeile zeigt vorn den Chip **[+ Modulator]**. Er setzt den ersten Nicht-Ausgang des Algorithmus (Alg 1: OP 2) auf an, ×1, OL 95, gibt ihm die Modulator-Vorlage Snap (T2) und springt auf diesen Operator; ein Undo. Ab Init FM erfüllt das bei C2 und E1 die Schwellen von V0d-2-05 (gemessen M-HANDYrel −10,1 / −21,6 dB, M-BISS 25,6 / 33,5 dB, M-SP-Fall 0,82 / 0,75 Okt., `r8/rev-dsp/out/apply-check3.out`).
     - **Zu wenig Pegel für Biss:** Hat ein Modulator nach [Snap] OL < 90, zeigt die Vorlagen-Zeile vorn den Chip **[Pegel 95]** (setzt OL 95, ein Undo), und die Anzeige im Graphen meldet „Biss braucht OL ≥ 90“. Die Vorlage selbst setzt weiter nur R und L (Punkt 4i).
   - Kopfzeile, Schrift ≥ 15 px, fett, in der Farbe der Rolle wie im ALGO-Diagramm (Ausgang gefüllt in Spurfarbe, Modulator umrandet):
     - „MODULATOR → OP 1 · Klangfarbe“ bzw. „AUSGANG · Lautstärke“.
     - Bei aktivem [Solo] zusätzlich in Bernstein: „Solo: OP 2 klingt als Ausgang“.
   - Ein Tipp auf die Mini-Hüllkurve `.fmspk` im ALGO-Streifen ruft `fmSelect(i, k)` auf und öffnet OP › HÜLLK. Das ist ein **Zusatzweg, kein Hauptweg**: Die Trefferfläche ist nur 56×22 px (P1), 53×14 (P2) bzw. 54×16 (L1) groß und liegt 3 px unter dem OL-Fader (`r8/ux-a4b/m3-spark.mjs`). Die Ziele und Prüfpunkte zählen ihn nicht.
2. **Haltephase wie Dexed (`ACCURATE_ENVELOPE`)** (Worklet `fmAdvance` Z. 3191–3199 und `fmEnvStep` Z. 3200–3213; nativ `envPlan` Z. 7415–7428 und `levelAt` Z. 7429; Anzeige `FMH.segTime`/`envTimes`/`rateForTime` Z. 7519–7536)
   - Quelle: Dexed `source/msfa/env.h` Z. 25 (`#define ACCURATE_ENVELOPE`) und `env.cc`:
     - Z. 32–45: Tabelle `statics[]` mit 77 Werten („empirically gathered using 2 TF1s“);
     - Z. 69–77: Abzählen;
     - Z. 134–151: Bedingung.
   - **Bedingung** (wie Dexed Z. 135): Das neue Ziel ist gleich dem aktuellen Pegel (in inneren Einheiten), **oder** Stufe 1 hat L1 = 0.
     - Innen gleich sind auch die Paare L 98/99, 96/97 usw., weil die EG `(28 + L) >> 1` rechnet.
   - **Dauer:** `rr = min(99, R + rs)`; `rs` ist die Raten-Skalierung in qrate-Einheiten, wie Dexed Z. 139–141.
     - **R ist die wirksame Rate der Stufe nach dem Makro-Versatz** (fmAtk/fmDec/fmRel, geklemmt 0–99, wie `r` in `fmAdvance` Z. 3195), nicht der gespeicherte Wert `op.r[ix]`. BISS wirkt als Zeitfaktor auch auf die Haltezeit (Punkt 7). Dieselbe Regel gilt in Worklet, `envPlan` (nach `fm6Macro`) und `FMH.envTimes`, damit Anzeige und Klang gleich sind.
     - `n = rr < 77 ? statics[rr] : 20 · (99 − rr)`.
     - Bei Stufe 1 mit L1 = 0 und rr < 77 gilt `n / 20`.
     - Haltezeit = **n / 44 100 Sekunden**. Danach folgt die nächste Stufe.
   - **Die Haltezeit gilt in Sekunden, nicht in Samples.**
     - Dexed skaliert `staticcount_` mit 44 100/sr (Z. 51–53, 146). Bei 48 kHz hält Dexed deshalb nur 0,84-mal so lang.
     - Gemessen bei R2 50: 127 statt 150 ms (`out/e1b-hold-48k.out`).
     - V0d hält bei jeder Abtastrate die 44,1-kHz-Zeit.
   - **Live-Änderung während einer Haltephase:** V0a schickt bei jeder Reglerbewegung `fmVoicePatch(v, true)` an alle klingenden Stimmen (Z. 3153, ≈ 60 Nachrichten/s; dazu `setParams` bei Makros Z. 2762), und beide rufen `fmAdvance` in derselben Stufe auf. Würde die Haltephase dabei neu starten (so der Prototyp `HOLD`), endete sie beim Ziehen nie.
     - Regel: Je Operator wird der Startzeitpunkt der Haltephase gemerkt. Eine Neuausrichtung **in dieselbe Stufe** setzt die Rest-Haltezeit auf max(0, neue Haltezeit − bereits gehaltene Zeit); die Haltephase startet nicht neu.
     - Das ist eine eigene Regel von V0d. Dexed verhält sich anders: `Env::update` springt bei gedrückter Taste auf Stufe 3 (`env.cc` Z. 158–172, `advance(2)`).
   - Prototyp `HOLD`, bei 44,1 kHz gegen msfa:
     - R2 95 … 20: höchstens 1,5 ms Abweichung;
     - verzögerter Angriff (L1 = 0): höchstens 0,7 ms (`out/e1b-hold-44k.out`, `out/e1c-delay-44k.out`).
   - **Wirkung:**
     - ROM1A BRASS 2 hat L1 99 und L2 98 (innen gleich) mit R2 39. Die Stimme hält deshalb 625 ms Vollpegel, statt sofort abzufallen.
     - Ohne Haltephase liegt V0a dort bis 4,9 dB neben msfa.
   - **L7:**
     - Werks-FM-Sounds: In den 12 FM-Sounds von V0a liegen alle Halte-Fälle (in 7 Sounds) auf Pegel 0 → 0 und sind unhörbar. Der Render bleibt gleich (`out/e9-factory.out`).
     - Die 7 neuen FM-Sounds und die nachgestimmten Bässe aus A.4 Punkt 5 und 6 werden mit Haltephase und PEG gemessen: V0d-11 und V0d-13 laufen nach Bau-Abschnitt 1.
     - Importierte und eigene Sounds mit gleichen inneren Pegeln klingen ab V0d DX-richtig. Das ist ausdrücklich erlaubt; CHANGES nennt es.
3. **Pitch-EG (PEG) wie beim DX7** (Format `normOp`/`normFm6` Z. 5092–5105; Worklet `fmNoteOn` Z. 3155, `fmRetrig` Z. 3162 und `fmControl` Z. 3215–3218; nativ `DXN.voice` Z. 7448–7496; Import `parseSyxBank` Z. 15052 und `syxVoiceSound` Z. 15075)
   - Quellen:
     - msfa/Dexed `pitchenv.cc` Z. 20–89: Raten-Tabelle `pitchenv_rate`, Pegel-Tabelle `pitchenv_tab`, `unit_ = N·2^24/(21,3·sr)`.
     - `dx7note.cc` Z. 199–203 (Start bei L4), Z. 231 (Summe in die Tonhöhe), Z. 302–303 und 322 (nur Operatoren im Verhältnis-Modus; feste Frequenz ohne PEG), Z. 344 (Loslassen → Stufe 4).
     - Byte-Lage: VCED 126–133, gepackte Bank 102–109 (Dexed `doc/sysex-format.txt` Z. 148–155 und 259–266).
   - **Daten:** `fm6.peg = {r: [4], l: [4]}`, Werte 0–99, **L 50 = 0 HT**.
     - Fehlt `peg` oder sind alle L = 50: keine Wirkung, kein Feld gespeichert. Alte Sounds bleiben deep-equal.
     - `normFm6` behält `peg`; heute verwirft es unbekannte Felder.
   - **Rechnung:**
     - Pegel in Oktaven = `pitchenv_tab[L] / 32`, also −4,0 … +3,97 Okt. Um die Mitte sind es 0,375 HT je Schritt.
     - Geschwindigkeit = `pitchenv_rate[R] / 21,3` Okt./s: R 99 ≈ 12, R 50 ≈ 1,9, R 0 ≈ 0,05 Okt./s. Der Verlauf ist linear in Oktaven, ohne Sprung.
     - Ablauf: Start bei L4, dann L1 → L2 → L3, L3 halten; Loslassen → L4.
     - Je Steuerblock (16 Samples) fortschreiben und als `+ pegOkt · 12` HT in die Tonhöhe von `f0` geben (Z. 3218). Damit wirkt die PEG nur auf Verhältnis-Operatoren.
   - MONO-Neuanschlag (`fmRetrig`): Die PEG startet ab dem aktuellen Wert neu bei Stufe 1, ohne Sprung auf L4.
   - Der .syx-Import übernimmt die 8 Bytes, statt sie zu verwerfen (Kommentar Z. 15041 anpassen). Der Export in V4c schreibt sie zurück (Rundlauf V4c-05).
   - **Nativ:** je Stimme ein `ConstantSourceNode` in Cent auf `detune` jedes Verhältnis-Oszillators (wie `cvOut`, Z. 7469).
     - **Nur über `detune`.** Den 2π·f-Gain der Modulatoren und den `mul`-Knoten der Stapel-Mitten (Z. 7471–7477) nicht anfassen. Nach Web Audio (OscillatorNode: computedOscFrequency = frequency · 2^(detune/1200)) skaliert `detune` auch die über `frequency` eingespeiste FM-Abweichung; der Index bleibt also gleich. Gemessen in Chromium (Träger und Modulator 200 Hz, I = 2): H2/H3/H4 zu H1 ohne detune +7,75/+1,71/−6,21 dB, mit detune +1200 an beiden +7,55/+1,55/−6,39 dB (`r8/rev-dsp/detune-fm.cjs`, `out/detune-fm.out`).
     - Stufen als `linearRampToValueAtTime`: exakt, weil die PEG linear in Oktaven läuft.
     - Loslassen: `cancelScheduledValues(t)`, `setValueAtTime(aktueller Wert)`, dann Rampe zu L4.
   - Prototyp `PEG`: gleich msfa ±0,10 HT ab 30 ms, geprüft an 5 Test-Hüllkurven und den Vorlagen aus Punkt 6 (`out/e2-peg.out`, `out/e11-pegpre.out`). ROM1A TAKE OFF beginnt mit PEG ≈ 40 HT höher als ohne.
4. **Neuer Hüllkurven-Editor `fmEnvEditor(i, k)`**
   - Er ersetzt `fmEnvGraph` (Z. 14139–14206). `fmEnvPts`, `fmLaneX`, `FM_TLO`, `FM_THI` (Z. 14007–14014) bleiben nur für die Mini-Bildchen (A.4 Punkt 2).
   - Er ist ein Bauteil und wird an zwei Orten verwendet: OP › HÜLLK. und HÜLLK. › OPERATOREN (Punkt 5).
   - **(a) Eine logarithmische Zeitachse statt vier 78-px-Spuren:**
     - Links 32 px Innenrand, damit der 0,5-ms-Punkt ≥ 40 px vom Bildschirmrand liegt (iOS-Safari: Wischen vom linken Rand = „Zurück“; `touch-action:none` schützt davor nicht verlässlich). Rechts 8 px Innenrand, unten 8 px (der R-Punkt bei L 0 liegt nicht auf der Kante).
     - Dann „Halten“: Zeit seit Anschlag, 0,5 ms … 10 s.
     - Dann eine Lücke mit gestrichelter Linie „Loslassen“.
     - Rechts „Release“: Zeit seit dem Loslassen, **5 ms … 12 s** (passend zur 12-s-Kappe Z. 2592). Unter 5 ms liegt beim Ausgang ohnehin die Klick-Grenze; kürzere Werte gibt es über die DX-Zeile oder den Neuansatz an der Grenze (g).
     - Die Punkte stehen an der echten kumulierten Zeit (A, A+D1, A+D1+D2; R ab dem Loslassen). Haltephasen erscheinen als Plateau.
     - **Auffächern:** Liegen Punkte enger als 16 px beieinander (z. B. bei Init und [Orgel]: A, D1 und D2 bei 0,5 ms, `out/e12-design.out`), wird jeder folgende Punkt der Gruppe um 16 px nach rechts versetzt gezeichnet, mit einer Haarlinie zur echten Lage und kleinen Etiketten A/D1/D2. Das gilt nur für die Darstellung und das Treffen; die Werte ändern sich nicht.
     - Lineal mit Strichen bei 1 ms · 10 ms · 100 ms · 1 s · 10 s. Längere Zeiten kleben am rechten Rand mit „→ 12 s“.
     - Geometrie (verbindlich, `r8/a4b/out/e12b-design.out`; Breiten aus der Zeilentabelle unter den Mockups):

       | Viewport | Graph | Rand l. | Halten | Lücke | Release | Rand r. | Halten px/Okt. · Dekade | Release px/qrate |
       |---|---|---|---|---|---|---|---|---|
       | P1 | 374 | 32 | 211 | 18 | 105 | 8 | 14,8 · 49,1 | 2,3 |
       | P2 | 359 | 32 | 201 | 18 | 100 | 8 | 14,1 · 46,7 | 2,2 |
       | P3 | 304 | 32 | 168 | 12 | 84 | 8 | 11,8 · 39,1 | 1,9 |
       | L1 | 492 | 32 | 301 | 16 | 135 | 8 | 21,1 · 70,0 | 3,0 |
       | L2 | 315 | 32 | 173 | 12 | 90 | 8 | 12,1 · 40,2 | 2,0 |

       - Der Snap-Bereich (eine Dekade, z. B. 10–100 ms) ist in P1 **49 px** breit; heute sind es 16 px für die Raten 87–67. Ein qrate-Schritt ist in P1 2,8–4,8 px breit.
       - Der Rand links und die längere Release-Achse kosten gegenüber dem ersten Entwurf (P1: 56,7 px je Dekade) rund 13 %. Das ist der Preis für die Rand-Geste und für die Release, die bei kurzen Sequenzer-Gates entscheidet, ob der Ton „abgeschnitten“ klingt (vorher 7,2 px je Oktave, also ±1 R4 bei ±2 px Zittern).
     - **Bezugsnote:** Die Zeiten gelten für eine Bezugsnote: die zuletzt auf dieser Spur gespielte Note, sonst C4. Das Lineal zeigt sie an („bei C2“), damit die Raten-Skalierung `rs` sichtbar wirkt.
       - Gewechselt wird sie nur, solange kein Zug läuft und frühestens 600 ms nach der letzten Geste im Editor. Der Wechsel ist animiert (150 ms), damit ein Punkt nicht unbemerkt wegspringt, wenn Xander zwischen zwei Zügen eine andere Taste spielt.
       - Ein Tipp auf „bei C2“ im Lineal hält die Bezugsnote fest (Schloss-Symbol); ein zweiter Tipp löst sie.
   - **(b) Kein Grob-Raster.** Waagrecht ziehen ändert die Zeit der gefassten Stufe:
     - Finger-x → Zielzeit aus der Achse → `rateForTime`, also die Rate mit der nächsten Zeit, Haltephasen eingerechnet.
     - Der Punkt springt auf die exakte Zeit dieser Rate, höchstens 1 qrate-Schritt je px.
     - Totzone 6 px. Nach 6 px wird die Achse gewählt (Zeit oder Pegel), und **der Weg der Totzone wird geschluckt** wie im VA-Editor (Z. 6398–6403). Heute springt der erste Zug um ×2.
   - **(c) `FMH.rateForTime` korrigieren** (Z. 7531–7536):
     - Zielzeit ≤ kürzeste mögliche Zeit → die schnellste erlaubte Rate (R 99 oder die Klick-Grenze aus (g)). Heute wird der Angriff ganz links **langsamer** (R1 99 → 82).
     - Mehrere Raten mit gleicher Zeit (gleiche qrate) → die Rate, die der bisherigen am nächsten liegt.
     - Gleiche Pegel → Haltezeit nach Punkt 2. Heute fällt R stumm auf 0, und D1 dauert 32,7 s.
     - Den Angriff ab Pegel 0 rechnen (msfa `Env::init`, Dexed `env.cc` Z. 63), nicht ab L4. Heute steht dort `prev[0] = lvlOf(L4)` (Z. 7527).
   - **(d) Senkrecht ziehen ändert den Pegel, die Zeiten bleiben.**
     - Beim Pegelzug von L_i werden R_i und R_{i+1} nachgeführt. Die Dauer beider Stufen bleibt so nah wie möglich an der Dauer bei Gestenbeginn.
     - Das ist die FM-X-Logik „Zeit statt Rate“ (Forum „MODX vs. DX7 envelopes“, (SE)).
     - Die DX-Zeile zeigt die neuen Raten. Heute wandert der Punkt beim Pegelzug schräg (Diagnose 4b).
     - Reicht der Bereich 0–99 nicht, um die Zeit zu halten (sehr kleiner Pegelabstand), meldet das LCD „Zeit nicht haltbar“.
     - **Klick-Grenze auch beim Pegelzug:** Liegt die gehaltene Dauer nach dem Pegelzug unter der Klick-Grenze der Rolle aus (g) (bei der Bezugsnote), wird R auf `limitR` gesetzt; die Dauer wächst dann auf die Grenzzeit (Modulator ≈ 8 ms bis −20 dB). Die Anzeige im Graphen meldet „Zeit auf Klick-Grenze angehoben“.
       - Beispiel: Bei Init und [Orgel] ist R2 99 und D1 dauert 0 ms. Zieht man D1 eines Modulators von L2 99 auf 50, bliebe R2 99, und der Abfall um ≈ 36 dB dauerte ≈ 2,5 ms (≈ 14 dB/ms bei einer Grenze von 2,5 dB/ms). Mit der Regel wird R2 ≤ 82.
   - **(e) Fein-Modus:**
     - Chip [FEIN] (rastet ein) oder ein zweiter Finger → ×¼ für Zeit und Pegel.
     - **Zweiter Finger:** `RESTPTR` reicht hier nicht. Es zählt nur Ziele mit der Klasse `.rest` (Z. 17504); im Graphen trifft der Finger ein SVG-Kind, und rund um den Graphen liegen nur Bedienelemente. Deshalb gilt im Editor: Ein zweiter Finger **irgendwo im Editor-Körper, auch auf dem Graphen**, schaltet FEIN ein, solange er liegt und ein Zug läuft. Er fasst keinen zweiten Punkt.
     - Ist [FEIN] eingerastet, zeigt der Graph oben rechts das Abzeichen „FEIN ×¼“. [FEIN] springt beim Verlassen der Seite und beim Wechsel des Operators zurück.
     - Die Querabstand-Regel von `ctlPrecision` (Z. 12505) gilt im Graphen nicht mehr, weil beide Achsen belegt sind.
   - **(f) Ablesung:**
     - Die volle Ablesung passt in keinem Viewport ins LCD: Das Wertfeld `.lv` braucht dafür 231 px und hat in P1 198, in P2 183, in L1 35 und in L2 0 px; in P3 ist das LCD ausgeblendet (`r8/ux-a4b/m2-lcd.mjs`).
     - **Anzeige im Graphen** beim Fassen und Ziehen, 2 Zeilen à 11 px: Zeile 1 „D1 70 ms · R2 60“, Zeile 2 „L2 80 · −13,5 dB · I 1,9“. Bei einem Ausgang ohne „I“. Sie steht an der oberen Kante, ≥ 48 px über dem Finger, auf der dem Finger abgewandten Seite.
     - **LCD:** nur die gerade gezogene Achse, Kopf „D1 · OP 2“, Wert beim Zeitzug „70 ms · R2 60“, beim Pegelzug „L2 80 = −13,5 dB · I 1,9“. Beides passt in 183 px.
     - Zeitformat: unter 10 ms mit einer Nachkommastelle („6,4 ms“), unter 1 s ganze ms („43 ms“), ab 1 s zwei gültige Ziffern („2,3 s“, „13 s“).
     - Zeiten-Zeile „A 0,5 ms · D1 70 ms · D2 124 ms · R 358 ms“: in P1 unter dem Graphen, in P2/P3 und L als Beschriftung im Graphen. Sie ist **reine Anzeige** (`pointer-events:none`): Die Einträge wären nur ≈ 85×16 px groß und lägen direkt unter dem R-Punkt. Gewählt wird über die Punkte und die DX-Felder.
   - **(g) Klick-Grenze statt Abschneiden.** Ein Zug endet bei fallenden Stufen an der Grenze:
     - Ausgang, Abfall ≥ 20 dB: höchstens 8 dB/ms (≈ 5 ms bis −40 dB, R ≤ 93 beim vollen Abfall).
     - Modulator, Abfall ≥ 12 dB: höchstens 2,5 dB/ms (≈ 8 ms bis −20 dB, R ≤ 82). Schneller bleibt vom Snap nur ein Knack (`out/e10-snaptest.out`).
     - Die Grenze gilt für die effektive qrate, also mit Raten-Skalierung bei der Bezugsnote.
     - Die Zone links davon ist schraffiert und heißt „Klick“.
     - **Im Moment des Anschlags** (der Finger zieht weiter, der Punkt bleibt stehen): Der Punkt bekommt einen Rand in Bernstein, `haptic('tick')`, und die Anzeige im Graphen zeigt „Klick-Grenze 8 ms · nochmal ziehen = schneller“ (Ausgang: „5 ms“), bis der Finger loslässt.
     - Ein **neuer** Zug, der an der Grenze beginnt, darf darüber hinaus bis R 99. Das LCD meldet dann „Klick-Bereich: Ausgang knackt unter 5 ms“.
     - Die DX-Zeile kennt keine Grenze.
     - **Steigende Stufen:** Frei ist nur der Anstieg aus der Stille. Der Sprung auf 1716 Einheiten greift nur, solange der Pegel darunter liegt (Dexed `env.cc` Z. 84–88); deshalb knacken DX-Angriffe mit R1 99 nicht, und M-KLICK nimmt die ersten 3 ms nach einem Anschlag ohnehin aus.
       - Eine steigende Stufe **mitten im Ton** (z. B. L2 < L3 bei einem Ausgang) steigt bei R 99 um ≈ 30 dB in rund 1 ms. Gemessen (Ausgang L 60 57 99 0, D2 steigend, HF-KNALL bezogen auf die 20 ms danach, `r8/rev-dsp/rise.mjs`, `out/rise.out`): Sinus C2 bei R3 99/95/93/90 → −41/−47/−51/−57 dB.
       - Regel: Bei einem Ausgang gilt die Ausgangs-Grenze auch für steigende Stufen, die nicht beim Anschlag aus einem Pegel < 1716 beginnen und um ≥ 20 dB steigen: höchstens R 93 bzw. effektive qrate ≤ 59 bei der Bezugsnote. Zweiter Zug und DX-Zeile bleiben frei.
   - **(h) DX-Zeile:** 8 Felder R1 R2 R3 R4 · L1 L2 L3 L4.
     - P: 8 × 40 + 7 × 4 = 348 px, Felder 40×34 (dichtes Raster nach L4). L: 8 × 37 + 7 × 4 = 324 px in einer Reihe.
     - Ein Tipp wählt das Feld und die zugehörige Stufe im Graphen.
     - Senkrecht wischen = ±1 je 10 px (FEIN: je 40 px).
     - [−1] und [+1] = ±1 am gewählten Feld; aria-label nach dem Feld („R2 −1“, „R2 +1“). Nicht ‹ ›: Die Kopfzeile wechselt mit [‹] [›] den Operator, ein Fehltipp landete sonst auf dem falschen Operator. In P2/P3 entfallen die Knöpfe; dort gilt der Wisch auf dem DX-Feld.
     - Jeder Wert 0–99 ist so in 1er-Schritten erreichbar, auch ohne Graph.
   - **(i) Vorlagen je Rolle:** [Snap] [Pluck] [Pad] [Orgel], Werte in Tabelle T2.
     - Ein Tipp setzt R1–R4 und L1–L4 des gewählten Operators, ein Undo.
     - Der Operator bekommt die Werte seiner Rolle (Modulator oder Ausgang).
   - **(j) Auf mehrere Operatoren:**
     - Direkt sichtbar: [Auf alle Mod.], bei einem Ausgang [Auf alle Ausg.], dazu [Auf alle].
     - [⋯] enthält: die andere Rolle, „Kopieren“, „Einfügen“, „Init“, „Vorhören“ (4o), in L1/L2 auch [Solo]. In P2/P3 liegen dort zusätzlich [Auf alle Mod.], [Auf alle] und [Solo] (Zeilentabelle unter den Mockups).
     - Je ein Undo; V0d-10 gilt weiter. Vorbild: Dexed „Copy Operator Values“ / „Paste Envelope Values“ (`source/ui/OperatorEditor.cpp` Z. 36–41).
   - **(k) Undo:** Jede Geste ist genau ein Undo-Schritt (`commitSound`, L4): ein Zug, eine Vorlage, eine Kopie, ein Wisch auf einem DX-Feld, ein Tipp auf [−1] oder [+1].
     - **Abbruch über das Gesten-Register** (`blur`, `pagehide`, `visibilitychange`; unter iOS etwa Mitteilung, Anruf oder Kontrollzentrum während des Ziehens): Das heutige Muster `gestBegin(e.pointerId, () => { G = null; draw(); })` (`fmEnvGraph`, Z. 14166) verliert den Undo-Schritt. Gemessen: Zug L2 40 → 5, `blur`, Finger hoch → der Sound bleibt bei L2 5, `UNDO.length` 0 (`r8/ux-a4b/m4-abort.mjs`).
     - Neu in `fmEnvEditor`, `fmPegEditor` und beim DX-Feld-Wisch: `abort: () => { if (G && G.moved) commitSound(i, G.before, label); G = null; draw(); }`.
   - **(l) Doppeltipp** auf einen Punkt setzt die Stufe auf den Init-Wert, wie heute (Init-Werte siehe Punkt 8).
   - **(m) Treffen:**
     - Der nächste Punkt gewinnt, gemessen an der gezeichneten (ggf. aufgefächerten) Lage; die Trefferfläche ist ≥ 44×44 px.
     - Liegt die **gewählte Stufe** (per DX-Feld, letztem Zug oder Tipp gewählt) im Trefferbereich, gewinnt sie.
     - Erst danach gilt: Liegen zwei Punkte näher als 12 px beieinander, gewinnt der Punkt in Zugrichtung (nach links: der frühere).
     - Die DX-Felder wählen eine Stufe auch ohne Treffer im Graphen.
   - **(n) Nativer Pfad:** Der Hinweis „Kompatibel: Änderungen ab der nächsten Note“ bleibt (`fmNativeHint` Z. 14106).
   - **(o) Vorhören nach der Geste:** Der Biss liegt in den ersten 20–70 ms; eine Änderung an einem gehaltenen Ton hört man erst ab der nächsten Note (im ECO-Pfad ohnehin). Ohne Vorhören kostete jeder Feinschliff-Schritt zwei Gesten.
     - Bei gestopptem Transport und ohne gehaltene Taste spielt jedes `commitSound` aus dem Editor (Zug, Vorlage, [+ Modulator], [Pegel 95], ±1, DX-Wisch) die Bezugsnote mit Anschlag 0,8 und Gate 0,5 s über `auditionStart` (Z. 9381) und `release`. Eine noch klingende Vorhör-Note wird vorher losgelassen.
     - Schalter „Vorhören“ in [⋯], Standard an (Laufzeit-Zustand).
5. **Reiter HÜLLK. bei FM** (`subTabsFor` Z. 13627–13633, `pageEnv` Z. 13813)
   - Bei fmAmp 0 (DX-HÜLLKURVEN) hat der Reiter die Unterreiter **OPERATOREN · TONHÖHE · FILTER · MOD-HK**:
     - OPERATOREN: oben eine Wahl-Zeile mit 6 Chips (52×44, Mini-Kurve, D1-Zeit, Rollenfarbe). Links stehen die Ausgänge unter „AUSGÄNGE · Lautstärke“, rechts die Modulatoren unter „MODULATOREN · Klangfarbe“. Darunter derselbe Editor wie OP › HÜLLK.
     - TONHÖHE: PEG-Editor (Punkt 6).
     - FILTER: VA-Filterhüllkurve wie bisher. Solange `fmBypass` greift (Z. 6161), ist sie grau mit „wirkt erst, wenn der Filter schließt (Cutoff < 18 kHz)“ (L2).
     - MOD-HK: bisher „MOD“. Solange keine Route die Quelle `menv` nutzt, ist sie grau mit „wirkt nur über eine Route (MOD)“.
   - **Standard-Unterreiter bei FM ist immer OPERATOREN**, vorgewählt `fmDefaultOp` (Punkt 1). Heute steht `ED.sub.env` auf 'amp', und ein undefiniertes `ED.fmOp` wird über `| 0` zu OP 1, einem Ausgang; bei fmAmp 1 stünde vorn LAUTST. (ADSR). Das ist die Falle aus der Diagnose (Zusammenziehen kürzt die Lautstärke).
   - Bei fmAmp 1 (ADSR) steht zusätzlich vorn **LAUTST. (ADSR)**, erreichbar nur per Tipp:
     - Band „ADSR liegt über dem ganzen FM-Klang“.
     - Knopf [DX-Hüllkurven] setzt fmAmp 0, ein Undo.
   - Die heutige Form „Pluck“ der VA-LAUTST. ist bei fmAmp 0 nicht mehr erreichbar. Heute ist sie dort bitgleich wirkungslos (Diagnose 4c).
   - Die Migration FM2 → FM6 (`migrateFm2` Z. 5191) bleibt unverändert (L7). Das Band erklärt fmAmp 1.
6. **PEG-Editor (HÜLLK. › TONHÖHE)**
   - Gleicher Aufbau wie Punkt 4. Die senkrechte Achse ist **bipolar** in Halbtönen (Mitte = 0 HT = L 50).
     - Sichtbar sind ±12 HT. Der Chip [±12│±48] in der Vorlagen-Zeile schaltet auf ±48 HT um. Kein Doppeltipp auf die Skala: Der liegt wenige px neben dem Startpunkt, dessen Doppeltipp die Stufe zurücksetzt (4l).
     - Zeitachse wie Punkt 4a, ohne Klick-Grenze.
     - **Startpunkt:** Die PEG startet bei L4 und endet dort. Der Start (t = 0) wird als hohler Zwilling von L4 mit dem Etikett „= L4“ gezeichnet und bewegt sich beim Ziehen des R-Punkts sichtbar mit.
   - Ablesung: „L1 +7,5 HT (L 70) · R1 70 = 3,7 Okt./s“, für L4 „L4 +7,5 HT (Start und Ende)“. Die DX-Zeile zeigt L als HT („+7,5“); gespeichert bleibt 0–99.
   - Kopf: „wirkt auf alle Operatoren mit Verhältnis; feste Frequenz bleibt“.
   - Vorlagen, je ein Undo (gemessen in `out/e11-pegpre.out`):

     | Vorlage | R1–R4 / L1–L4 | Wirkung |
     |---|---|---|
     | [Aus] | 99 99 99 99 / 50 50 50 50 | keine |
     | [Ruck] | 99 99 99 0 / 50 50 50 56 | Start +2,25 HT, nach 15 ms auf 0 |
     | [Fall] | 70 99 99 0 / 50 50 50 70 | Start +7,5 HT, fällt in 170 ms auf 0 |
     | [Anstieg] | 70 99 99 0 / 50 50 50 38 | Start −4,5 HT, steigt in 120 ms auf 0 |

   - R4 0 bedeutet: Beim Loslassen gibt es kaum einen Rückweg (≈ 0,6 HT/s). Die DX-PEG startet bei L4 und kehrt beim Loslassen dorthin zurück (`pitchenv.cc` Z. 50, 74–78).
7. **MAKRO: BISS für Modulatoren, LÄNGE für Ausgänge** (`fmAdvance` Z. 3195, `setParams` Z. 2761, `fm6Macro` Z. 6154–6159, `pageFmMakro` Z. 14285, `pd('fmAtk fmDec fmRel')` Z. 7991–7992)
   - Neu ist `fmBite` „BISS“ (−20 … +20, Standard 0): ein **Zeitfaktor** auf D1 und D2 (Stufen 2 und 3), **nur bei Operatoren, die kein Ausgang sind**. Plus heißt kürzer, also knackiger: t' = t · 2^(−BISS/10), also ×4 bei −20 und ÷4 bei +20.
     - Rechnung im Worklet (je Stimme, mit der Raten-Skalierung der gespielten Note): Pegelschritt je Block ·2^(BISS/10), Haltezeit ·2^(−BISS/10). Das entspricht `rateForTime` ohne Raten-Raster.
     - **Klemmung** an der Modulator-Klick-Grenze aus 4g (Abfall ≥ 12 dB: höchstens die Geschwindigkeit von R 82 bei derselben Raten-Skalierung). Ist die gespeicherte Rate schon schneller, macht BISS sie nicht noch schneller. Erreicht ein Operator bei der Bezugsnote die Grenze, meldet das LCD „Biss am Klick-Limit“.
     - Nativ (`fm6Macro`/`envPlan`) dieselbe Rechnung auf die Segmentdauern.
     - Warum kein Raten-Versatz: Als Versatz −20 … +20 auf R2/R3 war die Plus-Hälfte großenteils toter Weg und überschritt die eigene Klick-Grenze. SNAP-TEST alt (C2): M-SP im Fenster ab 0 ms bei BISS 0/+5/+10/+15/+20 = 157/117/89/85/90 Hz, R2 dabei 68…88 (`r8/rev-dsp/out/biss.out`); Pop-Bass DX: +5 → +20 nur 0,16 Okt. (`out/biss-pop.out`).
     - LCD: „Biss +10 · D1 OP 2: 70 → 35 ms“.
   - `fmDec` „LÄNGE“ wirkt nur noch auf R2 und R3 der **Ausgänge** (Raten-Versatz wie bisher).
     - **Migration (L7):** Auslöser ist allein, dass das gespeicherte `p` **kein Feld `fmBite`** hat; geprüft wird vor dem Auffüllen mit Standardwerten (`AN_DEF` Z. 5061, `normAnalog` Z. 5077). Ein Auslöser „`fmDec ≠ 0`“ wäre nicht idempotent: Ein V0d-Sound mit LÄNGE −10 und BISS 0 bekäme beim nächsten Laden BISS +10.
     - Die Migration **brennt den alten Versatz in die Modulatoren ein**: Für jeden Operator, der im Algorithmus kein Ausgang ist, gilt R2/R3 := clamp(R − round(fmDec), 0, 99), genau wie `fmAdvance` (Z. 3195) es rechnet. Danach `fmBite = 0`; `fmDec` bleibt für die Ausgänge. Das ist bitgleich für den ganzen Bereich ±30 (`fmDec` hat −30 … +30, Z. 5059 und 7991). Ein Übertrag `fmBite = −fmDec` ginge nicht: BISS hat ±20 und ist jetzt ein Zeitfaktor.
   - HÄRTE (`fmAtk`, R1) und RELEASE (`fmRel`, R4) wirken weiter auf alle Operatoren, wie „FM Attack“ bei FM-X ((SE), Recherche §3.3).
   - MAKRO-Reihe 1: Helligkeit · BISS · Härte · Länge · Release (5 große Regler, L1).
   - `fmBite` ist ein stetiger Regler; MOD-R1 nimmt ihn in V5d als Mod-Ziel auf.
   - Gemessen am Prototyp (SNAP-TEST neu, C2, BISS über `rateForTime` nachgebildet, `r8/rev-dsp/out/apply-check.out`): M-SP im Fenster ab 0 ms bei BISS −20/−10/0/+10/+20 = 379/309/283/194/173 Hz, also je 10er-Schritt 0,29/0,13/0,54/0,17 Okt. und gesamt 1,13 Okt.; R2 bleibt ≤ 72. M-PEGEL bei 90–110 ms ändert sich um höchstens 0,95 dB (`out/apply-check2.out`).
8. **Init ohne Knack** (`FM_INIT_OP` Z. 13931): R4 99 → **80**.
   - Damit fällt der Pegel in 22 ms statt in 2,8 ms auf −40 dB. Der HF-Knall bei FM 1:1 C3 sinkt von −46 auf −62 dB (`out/e6-click.out`).
   - LCD: „Init (R 99 99 99 80 · L 99 99 99 0)“.
   - Das weicht bewusst vom DX7-Init ab (Dexed `source/core/Program.cpp` Z. 106–113: R4 99). .syx bleibt unberührt.
9. **Nativer Rückfall (ECO, `DXN`) wird mitgezogen:**
   - Haltephase in `envPlan` als Ereignis `hold` (konstanter Pegel für die Haltezeit); `levelAt` und `releaseTime` (Z. 7499) kennen es.
   - PEG über `detune`, wie in Punkt 3.
   - BISS und LÄNGE in `fm6Macro` nach Rolle (Punkt 7).
   - Editor-Änderungen wirken erst ab der nächsten Note, wie heute; der Hinweis bleibt.
   - Bekannte ECO-Grenzen bleiben bestehen und werden angezeigt:
     - Bei hohem Index stimmt die Klangfarbe nicht, weil der Pfad FM statt PM rechnet (1:1, C3, OL 90: H2 +12,6 statt −6,3 dB, Diagnose 3d).
     - Das Feedback ist statisch.
     - (Die PEG ändert den Index im ECO-Pfad **nicht**, siehe Punkt 3 „Nativ“.)
     - Hat ein Modulator OL ≥ 75, zeigen OP-Seite und HÜLLK. im ECO-Fall „ECO: Klangfarbe bei hohem Pegel angenähert“.
10. **Hörbarkeit und OL:** keine Formeländerung (EN-02).
    - Das Worklet braucht für hörbare FM genau die OL-Werte des DX7 (Tabelle T3, gemessen).
    - Den toten Fader-Weg behebt A.4 Punkt 3. Mit `OL = round(99 · p^0,45)` liegt die Schwelle „M-SP +⅓ Okt.“ (OL 64) bei 38 % des Wegs statt bei 65 %.
11. **Was nach V4 wandert (nicht in V0d):**
    - FM-X-Erweiterungen → `fmx` (V4a/V4b), weil `fm6` und .syx sie nicht tragen:
      - Hold Time je Operator (Key-On-Verzögerung);
      - Pitch-EG **je Operator**;
      - Anschlag ± (Level/Vel −7 … +7);
      - Time/Key ±;
      - Zeit-Format „Time“ als Datenformat.
      - FM-X-Angaben nur als (SE): MONTAGE-M-Handbuch `manual.yamaha.com/mi/synth/montage_m/en/om02screenparameters0150.html`, Yamaha „FM 101, Part Four“, Forum „MODX vs. DX7 envelopes“ (URLs in Recherche §8).
    - DX-LFO mit AMS je Operator (auch auf Modulatoren) und ein Key-Sync-Schalter → V4a. Der Worklet-FM-Block wird dort ohnehin umgebaut. Heute gehen beim Import AMS auf Modulatoren (12 % der Bank-Stimmen) und „Key-Sync aus“ (32 %) verloren (Diagnose 3h).
    - ECO mit echter PM statt FM (z. B. Verzögerungs-Modulation) und Feedback je Note → V4a (nativer Rückfall).
    - Hüllkurven-Wahl und dieser Editor aus der FELD-Kontextzeile → V4b. N4b-04 nutzt dafür `fmEnvEditor`.
    - Nicht V4, sondern §18 (FM-Feld-Ausbau F5–F7):
      - Mehrpunkt-Hüllkurven mit Schleife (Kodamo EssenceFM: 6 Punkte, Sustain-Punkt, Loop; `r7/kodamo-handbuch.md` §2.9, (SE));
      - Spektralformen (FM-X);
      - Hüllkurven als Mod-Quelle.

**Tabelle T2 — Hüllkurven-Vorlagen**
- Zeiten bei C4 und `rs` 0, Modulator mit OL 90, Ausgang mit OL 99; Release ab max(L2, L3), wie die Anzeige rechnet (`out/e12-design.out`).
- Grundlage:
  - das gemessene Snap-Fenster: Modulator-R2 60–72 lässt die Obertöne in 20–40 ms um 20 dB fallen (Recherche §6.2);
  - ROM1A BASS 1/2 (Recherche §1.8);
  - SNAP-TEST unten.
- **Snap-Modulator (Review-Runde):** Der erste Entwurf (99 68 35 60 / 99 72 70 0) ließ nach dem Biss fast nur einen Sinus stehen: Körper-Index bei L3 70 und OL 90 ≈ 0,5 rad. Im SNAP-TEST (Anschlag 0,8) lag M-HANDYrel bei −24,9 dB (C2) und −41,7 dB (E1); A.4 verlangt für Bässe −16 … −8 bzw. ≥ −20 dB. Über 220 Hz fiel der Pegel bei C2 von −12,9 dBFS (0–20 ms) auf −40,7 dBFS (100–300 ms), am Handy also „abgeschnitten“ (`r8/rev-dsp/out/handy.out`, `out/phonedrop.out`). Neu: L2/L3 80/78 (Körper-Index ≈ 1,9 bei OL 95) und R2 60. Gemessen siehe V0d-2-05 (`out/cand.out`). Zum Vergleich: ROM1A BASS 1 hat M-BISS 10,8 dB (`out/rombass.out`).
- Die Vorlage setzt nur R und L. Der Biss braucht OL ≥ 90 (Punkt 1: [Pegel 95]).

| Vorlage | Modulator (Klangfarbe): R / L | Zeiten | Ausgang (Lautstärke): R / L | Zeiten |
|---|---|---|---|---|
| **Snap** | 99 60 35 60 / 99 80 78 0 | A 0,5 ms · D1 70 ms (−13,5 dB) · D2 124 ms · R 358 ms | 99 50 35 65 / 99 92 88 0 | A 0,6 ms · D1 70 ms (−4,5 dB) · D2 248 ms · R 264 ms |
| **Pluck** | 99 58 40 60 / 99 50 0 0 | A 0,5 ms · D1 223 ms (−36 dB) · D2 2,3 s · R 242 ms | 99 60 45 62 / 99 80 0 0 | A 0,6 ms · D1 70 ms (−13,5 dB) · D2 2,4 s · R 337 ms |
| **Pad** | 45 40 35 50 / 80 99 90 0 | A 113 ms · D1 143 ms (steigt) · D2 495 ms · R 1,3 s | 52 45 35 50 / 99 96 92 0 | A 108 ms · D1 46 ms · D2 248 ms · R 1,4 s |
| **Orgel** | 99 99 99 75 / 99 99 99 0 | A 0,5 ms · R 80 ms | 99 99 99 80 / 99 99 99 0 | A 0,6 ms · R 50 ms |

**Tabelle T3 — OL für hörbare FM**
- Messaufbau: gehaltener 2-Op-Ton (alg 1; OP1 ×1 OL 99; OP2 R 99 99 99 60 / L 99 99 99 0), Anschlag 100.
- Je Zelle: kleinstes OL für Worklet / msfa / nativ (Daten `r8/data-m9-olmatch.json`, Skript `r8/tools/m9-olmatch.mjs`).

| Modulator, Note | M-SP +⅓ Okt. | M-SP +1 Okt. | erster Seitenteilton ≥ −20 dB (×1: H2, ×2: H3, ×0,5: H2) |
|---|---|---|---|
| ×1, C2 / C3 | 64 / 64 / 64 · 64 / 64 / 64 | 75 / 75 / 77 · 75 / 75 / 78 | 52 / 52 / 52 · 52 / 52 / 52 |
| ×2, C2 / C3 | 60 / 60 / 60 · 61 / 61 / 60 | 74 / 74 / 72 · 74 / 74 / 71 | 56 / 56 / 55 · 53 / 53 / 53 |
| ×0,5, C2 / C3 | 76 / 76 / 76 · 76 / 76 / 77 | 89 / 89 / 87 · 89 / 89 / 89 | 68 / 68 / 68 · 68 / 68 / 68 |

- Fader-Weg nach A.4 Punkt 3: OL 52 bei p = 0,24, OL 64 bei p = 0,38, OL 75 bei p = 0,54.
- Nativ weicht die Klangfarbe bei ×2 stärker ab: H3 ≥ −10 dB erreicht nativ OL 70 statt 82 (C2) bzw. 66 statt 73 (C3). Das ist bekannt und wandert nach V4a (Punkt 11).

**Mockups.** Maße aus der Zeilentabelle darunter; .pg-Höhen gemessen in V0a (`r8/ux-a4b/m1-geom.mjs`, `m2-lcd.mjs`).

```
P1 390×844 · Synth-Blatt · OSZ › OP 2 › HÜLLK. (FM)      .pg 365 px hoch, 374 px breit
┌──────────────────────────────────────────────┐
│ ● SYNTH 2 · FM · Pop-Bass DX       ↶  ↷  ✕   │ Blatt-Kopf, Reiter, Unterreiter wie heute
│ LCD  D1 · OP 2   70 ms · R2 60               │ nur die gezogene Achse (4f)
├──────────────────────────────────────────────┤
│ [‹] OP 2 [›]  [FREQ│HÜLLK.│SKAL.]   [Solo]   │ 44  ‹ › 44×44 = Operator wechseln
│ MODULATOR → OP 1 · Klangfarbe                │ 24  Rollenfarbe, 15 px fett
│ [Snap] [Pluck] [Pad] [Orgel]         [FEIN]  │ 36  davor ggf. [+ Modulator] / [Pegel 95]
│   ,5 1ms 10  100  1s  10s ┊ 5ms 100 1s 12s   │     Lineal 12 (im Graphen), „bei C2“
│   D1 70 ms · R2 60          FEIN ×¼          │     Anzeige im Graphen beim Ziehen (2 × 11)
│   ●╲                      ┊                  │ 147 Graph inkl. Lineal, Rand l. 32 / r. 8 / u. 8
│   │ ●━━━━━●━━━━━━━━━━━━━━━┊╲                 │     ░ = Klick-Zone (Modulator > 2,5 dB/ms)
│   │░░                     ┊ ╲●               │
│ A 0,5 ms · D1 70 ms · D2 124 ms · R 358 ms   │ 16  reine Anzeige
│ R1 │ R2 │ R3 │ R4 │ L1 │ L2 │ L3 │ L4        │ 36  DX-Zeile 8 × 40 + 7 × 4 = 348 px
│ 99 │ 60 │ 35 │ 60 │ 99 │ 80 │ 78 │  0        │
│ [−1] [+1]  [Auf alle Mod.] [Auf alle]  [⋯]   │ 44  ±1 am gewählten Feld
└──────────────────────────────────────────────┘ 44+24+36+147+16+36+44 + 6 × 3 = 365 px
│ Tastatur                                     │
```

```
P3 320×568 · OSZ › OP 2 › HÜLLK. (FM)      .pg 215 px hoch, 304 px breit, kein LCD
┌────────────────────────────────────┐
│ [‹] OP 2 [›] [FREQ│HÜLLK│SKAL] [⋯] │ 36  ‹ › 36×36; [⋯] mit Auf alle Mod., Auf alle, Solo
│ MODULATOR → OP 1 · Klangfarbe      │ 20
│ [Snap][Pluck][Pad][Orgel][FEIN]    │ 34  bis 6 Chips à 48 px
│ A 0,5 · D1 70 · D2 124 · R 358 ms  │     Zeiten als Beschriftung im Graphen (beim Ziehen: Anzeige)
│ ●╲            ┊                    │ 79  Graph inkl. Lineal 12
│  ●━━━━●━━━━━━━┊╲●                  │
│ [R│L] R1 99 │ R2 60 │ R3 35 │ R4 60│ 34  P3: Umschalter R/L 52 + 4 Felder à 59
└────────────────────────────────────┘ 36+20+34+79+34 + 4 × 3 = 215 px
P2 375×667: wie P3, .pg 243 px, Graph 107 px, DX-Zeile mit allen 8 Feldern (8 × 40 + 7 × 4 = 348)
```

```
L1 844×390 · OSZ › OP 2 › HÜLLK. (FM)      .pg 150 px hoch, 828 px breit
┌──────────────── Graph 492 px ──────────────────┬──────────────── 324 px ────────────────┐
│ ,5 1ms 10 100 1s 10s ┊ 5ms 100 1s 12s  bei C2  │ [‹] OP 2 · MOD.→1 [›]  FREQ│HÜLLK│SKAL  │ 34
│ A 0,5 · D1 70 · D2 124 · R 358 ms              │ R1│R2│R3│R4│L1│L2│L3│L4  8 × 37 + 7 × 4  │ 34
│ ●╲                   ┊                         │ 99│60│35│60│99│80│78│ 0                 │
│  ●━━━━━●━━━━━━━━━━━━━┊╲●                       │ [−1][+1][FEIN][Auf alle Mod.][⋯]      │ 36
│ [Snap] [Pluck] [Pad] [Orgel]                   │                                        │ 36 links
└────────────────────────────────────────────────┴────────────────────────────────────────┘
links: Graph 111 + 3 + Vorlagen 36 = 150 px · rechts: 34 + 34 + 36 + 2 × 4 = 112 px
L2 667×375: .pg 135 px; Graph 315 px breit, 96 px hoch; rechte Spalte gleich.
[Solo] und die andere Rolle liegen in [⋯]; die Rolle steht in der Kopfzeile („MOD.→1“).
```

```
P1 · HÜLLK. (FM, Lautstärke-Form DX) · Unterreiter OPERATOREN │ TONHÖHE │ FILTER │ MOD-HK
┌──────────────────────────────────────────────┐ .pg 365 px
│ AUSGÄNGE·Lautst.  MODULATOREN · Klangfarbe   │ 14
│ [1 ⌒][3 ⌒]  [2 ⌒][4 ⌒][5 ⌒][6 ⌒]             │ 44  Chips 52×44 in Rollenfarbe, darunter die D1-Zeit
│ [Snap] [Pluck] [Pad] [Orgel]         [FEIN]  │ 36
│ Graph inkl. Lineal, wie OP › HÜLLK.          │ 157
│ A 0,5 ms · D1 70 ms · D2 124 ms · R 358 ms   │ 16
│ R1 │ R2 │ R3 │ R4 │ L1 │ L2 │ L3 │ L4        │ 36
│ [−1] [+1]  [Auf alle Mod.] [Auf alle]  [⋯]   │ 44
└──────────────────────────────────────────────┘ 14+44+36+157+16+36+44 + 6 × 3 = 365 px

P1 · HÜLLK. › TONHÖHE
┌──────────────────────────────────────────────┐
│ TONHÖHE · alle OP mit Verhältnis             │ 20  (feste Frequenz bleibt)
│ [Aus] [Ruck] [Fall] [Anstieg] [±12│±48][FEIN]│ 36
│ +12 ○= L4                ┊                   │
│   0 ┼─╲●━━━━━━━━━━━━━━━━━┊━━━━━━━━━          │ 198 bipolar, Mitte = L 50, Lineal 12 im Graphen
│ −12 ┤                    ┊                   │
│ A 170 ms · D1 0 · D2 0 · R 13 s              │ 16
│ R1 │ R2 │ R3 │ R4 │ L1  │ L2  │ L3  │ L4     │ 36  L als HT: 0,0 · 0,0 · 0,0 · +7,5
│ [−1] [+1]                                    │ 44
└──────────────────────────────────────────────┘ 20+36+198+16+36+44 + 5 × 3 = 365 px
```

**Zeilentabelle (verbindlich).** Für `.pg-fmop-env` und die HÜLLK.-Seiten bei FM gelten Innenrand 0 und senkrechter Abstand 3 px (L: Spaltenabstand 12 px, Abstand in der rechten Spalte 4 px). Gemessene .pg-Höhen in V0a: P1 365, P2 243, P3 215, L1 150, L2 135 px. Der Graph bekommt den Rest; in jedem Fall ≥ 70 px (P) bzw. ≥ 90 px (L). Das Lineal (12 px) liegt oben im Graphen.

| Seite | P1 | P2 / P3 | L1 / L2 |
|---|---|---|---|
| OP › HÜLLK. | Kopf 44 · Rolle 24 · Vorlagen 36 · Graph 147 · Zeiten 16 · DX 36 · Knöpfe 44 | Kopf 36 · Rolle 20 · Vorlagen 34 · Graph 107 / 79 · DX 34 | links: Graph 111 / 96 · Vorlagen 36; rechts (324 px): Kopf 34 · DX 34 · Knöpfe 36 |
| HÜLLK. › OPERATOREN | Gruppen 14 · Chips 44 · Vorlagen 36 · Graph 157 · Zeiten 16 · DX 36 · Knöpfe 44 | Gruppen 14 · Chips 44 · Vorlagen 34 · Graph 105 / 77 · DX 34 | wie OP › HÜLLK.; Kopf rechts = 6 Chips 50×34 (6 × 50 + 5 × 4 = 320) |
| HÜLLK. › TONHÖHE | Kopf 20 · Vorlagen 36 · Graph 198 · Zeiten 16 · DX 36 · Knöpfe 44 | Kopf 20 · Vorlagen 34 · Graph 146 / 118 · DX 34 | wie OP › HÜLLK. |

- P2/P3: Die Zeiten-Zeile wird zur Beschriftung im Graphen (oben; beim Ziehen ersetzt sie die Anzeige aus 4f). Die untere Knopfzeile entfällt: ±1 per Wisch auf dem DX-Feld; [Auf alle Mod.], [Auf alle] und [Solo] liegen in [⋯] in der Kopfzeile.
- P3 ist 304 px breit; 8 DX-Felder mit 4 px Abstand bräuchten ≥ 316 px. Deshalb zeigt P3 einen Umschalter [R│L] (52 px) und 4 Felder à 59 px.
- Kopf in P1 44 px mit [‹] [›] 44×44. In P2/P3 und L sind [‹] [›] 36×36 bzw. 40×34 (dichtes Raster nach L4).
- Zum Vergleich der erste Entwurf: In P1 ergaben die Zeilen mit 7 Abständen à 8 px 360 px bei 355 px Inhalt (.pg 365 minus Innenrand 6 + 4); P2/P3 hatten kein Layout. In L1 ergaben 4 Reihen à 34 px mit 4 px Abstand 148 px bei 143 px verfügbar.

**Berührungspunkte.**
- Worklet: `fmAdvance`, `fmEnvStep`, `fmNoteOn`, `fmRetrig`, `fmControl`, `fmVoicePatch` (live), `setParams` (`fmBite` wie `fmAtk`, Z. 2761), Stimmen-Felder (Z. 2664–2672).
- Nativ: `DXN.envPlan`, `levelAt`, `voice` (PEG über `detune`), `releaseTime`, `fm6Macro`.
- `FMH`: `segTime`, `envTimes`, `rateForTime` (Haltephase, Grenzen, gleich lange Raten, Angriff ab 0).
- Oberfläche: `pageFmOp`, `fmSelect`, `fmStripCol`, `subTabsFor`, `pageEnv` (FM-Zweig), neu `fmEnvEditor` und `fmPegEditor`, `pageFmMakro`, `FM_INIT_OP`, `fmRole`, LCD-Texte, Hilfe-Zeilen (L10).
- Daten: `normOp`/`normFm6` (`peg`), `pd('fmBite')`, Migration beim Laden (fehlendes `fmBite` → alten `fmDec`-Versatz in Modulator-R2/R3 einbrennen, vor `normAnalog`), `parseSyxBank`/`syxVoiceSound` (PEG).
- Bedienung zusätzlich: Editor-Öffnen (`fmDefaultOp`, `ED.fmSub`), `auditionStart` (Vorhören 4o), Gesten-Abbruch (`gestBegin`, 4k), zweiter Finger (4e).
- Test-API (unten); Anpassung der Tests FM1–FM10 und PR8.

**Test-API (ergänzt Teil D):**
```ts
// V0d A.4b
fmDefaultOp(t: number): number                                     // Punkt 1
fmEnvView(t?: number): {op: number, role: 'out'|'mod', target: 'op'|'peg', refNote: number, fine: boolean,
  stage: 0|1|2|3|null, axis: {x0: number, xGap: number, xRel: number, x1: number, tMin: number, tMax: number,
  tRelMin: number, tRelMax: number}, dots: {stage: number, x: number, y: number, xTrue: number, fanned: boolean,
  sec: number, r: number, l: number}[], times: number[], limitR: number|null, refLocked: boolean,
  readout: string[]}                                               // Geometrie und Werte des offenen Editors; readout = Anzeige im Graphen (4f)
fmAuditions(): number                                              // Zähler der Vorhör-Noten aus dem Editor (4o)
fmEnvPreset(t: number, op: number|'peg', name: 'Snap'|'Pluck'|'Pad'|'Orgel'|'Aus'|'Ruck'|'Fall'|'Anstieg'): void   // ein Undo
setFmPeg(t: number, peg: {r: number[], l: number[]} | null): void  // ein Undo; null = flach
```

**Bau-Abschnitte** (ein Paket, eine Version 3.4.0):
1. Engine: Punkte 2, 3 und 9 sowie `FMH`. Danach V0d-2-02 bis V0d-2-05, V0d-2-14, V0d-2-17 und V0d-2-18.
2. Bedienung: Punkte 1, 4–8. Danach V0d-2-01, V0d-2-06 bis V0d-2-13, V0d-2-15, V0d-2-16 und V0d-2-19.
3. Regression V0d-2-20 und die übrigen V0d-Punkte.

**Dauer** +5–6 h (V0d gesamt 10,5–12,5 h) · **App-Version** 3.4.0 (unverändert) · **Budget** +30 KB (V0d gesamt +65 KB).

**Messgrößen dieser Ergänzung.**
- **SNAP-TEST:** alg 1, fb 0.
  - OP1: Ausgang ×1, OL 99, Vorlage Ausgang-Snap (R 99 50 35 65 / L 99 92 88 0).
  - OP2: Modulator, Vorlage Modulator-Snap (R 99 60 35 60 / L 99 80 78 0), in zwei Fällen: **×1 mit OL 95** (Standard) und **×2 mit OL 90** (Xanders Verhältnis).
  - OP3–6 mit OL 0. Noten C2 und E1, Anschlag 100/127 (M-HANDYrel: 0,8), Gate 0,6 s, trocken.
  - Vergleich „ohne Modulator“ = derselbe Patch mit OP2 OL 0.
  - **M-PEGEL gegen msfa:** je 20-ms-Fenster von 10–500 ms die Differenz (mit Modulator − ohne Modulator) im Worklet minus dieselbe Differenz in msfa. Eine feste Schranke gegen „ohne Modulator“ taugt nicht: Bei 1:1-PM liegt das RMS physikalisch je nach Index unter oder über dem Sinus, msfa zeigt beim neuen Snap −4,0 … +0,6 dB (`r8/rev-dsp/out/apply-check.out`). Das Nicht-Abschneiden prüft V0d-2-02.
- **M-EG-SCHLAUCH:**
  - Jeder Punkt des msfa-Hüllkurvenprotokolls (64-Sample-Blöcke) eines Operators wird geprüft, wenn sein Pegel ≥ 1800 Einheiten (1/256-Verdopplungen, oberhalb des Angriffssprungs auf 1716) und ≥ Maximum − 60 dB ist.
  - Bedingung: Er liegt höchstens 0,5 dB neben der V0d-Kurve, innerhalb ±(2 ms + 2 % von t).
  - Das Gate liegt auf einer 64-Sample-Grenze (689 · 64 / 44 100 s). Die Referenz rechnet mit AMS 0, weil msfa bei AMS ≠ 0 den Pegel pauschal um 1,2 % senkt (`dx7note.cc` Z. 326–333) und V0d AMS nicht übernimmt.
  - Verfahren: `r8/a4b/tools/e3-rom.mjs`.
- **HF-KNALL:**
  - Hochpass 5 kHz (Butterworth 4. Ordnung), höchster RMS in 2-ms-Fenstern von −2 bis +12 ms um das Ereignis.
  - Bezug: Vollband-RMS der 20 ms davor, in dB.
  - M-KLICK (§0.3) taugt bei Sinus-Trägern nicht, weil dort der Median der Hochpass-Energie bei −130 dB liegt.
  - Verfahren: `r8/a4b/tools/e6-click.mjs`.
- **TONHÖHENSPUR:**
  - Nulldurchgänge eines Sinus-Trägers, Fenster 10 bzw. 30 ms, Schritt 5 ms, in HT zur Note.
  - Gewertet werden nur Fenster, in denen beide Signale über Spitze − 40 dB liegen.
  - Verfahren: `pitchTrack` in `a4b-lib.mjs`.
- Alle Engine-Prüfungen laufen im Node-Shim des Worklets (wie `r8/tools/lib.mjs`). Gegen msfa wird mit derselben Abtastrate gemessen. Wo nichts anderes steht, sind das 44,1 kHz, weil Dexed bei 48 kHz die Haltephase falsch skaliert.

**Abnahme-Checkliste** (zusätzlich zu V0d-01 bis V0d-17)
- [ ] V0d-2-01 Startoperator und Rolle:
  - Gilt für jeden Werks-FM-Sound, frisch geladen: FM › OP öffnet `fmDefaultOp` (FM-Pluck: OP 2), und `fmUi().op` ist dieser Index.
  - Die Kopfzeile enthält „MODULATOR → OP“ bzw. bei Sounds ohne Modulator „AUSGANG“, ohne Scrollen sichtbar in P1–P3, L1 und L2.
  - Ein Tipp auf `.fmspk` von OP 4 im ALGO-Streifen ergibt `fmUi()` = {op: 3, sub: 'env'}.
  - Ein neu geladener Sound setzt die Wahl zurück.
  - Frisch geöffneter Editor, Werks-FM-Sound mit Modulator: Editor › OP zeigt `fmUi().sub === 'env'`, Editor › HÜLLK. zeigt OPERATOREN mit `fmUi().op === fmDefaultOp(t)`, auch bei fmAmp 1.
  - Init FM › Editor › OP zeigt [+ Modulator]; ein Tipp ergibt OP 2 an, ×1, OL 95, Modulator-Snap, `fmUi().op === 1`, ein Undo. Der SNAP-TEST-Aufbau mit diesem Operator (Träger bleibt Init) erfüllt bei C2 und E1 die Schwellen aus V0d-2-05 für M-HANDYrel, M-SP-Fall und M-BISS (gemessen −10,1 / −21,6 dB; 0,82 / 0,75 Okt.; 25,6 / 33,5 dB).
  - [Snap] auf einem Modulator mit OL 60 zeigt [Pegel 95] und „Biss braucht OL ≥ 90“.
- [ ] V0d-2-02 Ein Modulator schneidet nie ab (Engine), siehe `out/e4-modcut.out`.
  - Aufbau: alg 1; OP1 Ausgang ×1 OL 99 (R 99 99 99 60 / L 99 99 99 0); OP2 mit OL 99/90/80 und Verhältnis 1, 2, 0,5, 3.
  - Modulator-Hüllkurven: R 99 R2 99 60 / L 99 L2 L2 0 mit R2 ∈ {99, 80, 70, 60, 50} und L2 ∈ {0, 50, 70}.
  - Noten E1, C2, C3; Gate 1 s.
  - RMS in Fenstern von max(20 ms, 4 Perioden) gegen „ohne Modulator“:
    - nach dem Modulator-Ende (L2 = 0, Fenster 0,65–0,95 s): |Δ| ≤ 0,3 dB (gemessen ≤ 0,17 dB);
    - während der Modulation: −3,0 dB ≤ Δ ≤ +2,5 dB (gemessen −2,83 … +1,98 dB);
    - Minimum und Maximum je Fall gleich msfa ±0,3 dB. msfa zeigt dasselbe (−2,83 dB bei 1:1): Bei ganzzahligen Verhältnissen fallen gespiegelte Seitenbänder auf vorhandene Teiltöne und löschen sich teilweise aus. Ein reiner 1:1-PM-Ton liegt je nach Index −2,0 … +0,9 dB neben dem Sinus (gerechnet). Das ist Physik der PM, kein Abschneiden.
  - Nativ (`forceNative(true)`): nach dem Modulator-Ende |Δ| ≤ 0,5 dB.
- [ ] V0d-2-03 EG-Zeitkurve gegen msfa, alle 32 ROM1A-Stimmen.
  - Aufbau: 44,1 kHz; C4, Bässe C2, Glocken und Mallets C5; Anschlag 100; Gate 689 · 64 / 44 100 s; LFO aus; PEG wie gespeichert.
  - M-EG-SCHLAUCH ≤ 0,5 dB bei ±(2 ms + 2 % t). Prototyp: höchstens 0,29 dB. V0a ohne Haltephase: 4,9 dB (BRASS 2), 4,5 dB (PIPES 1), 1,5 dB (E.ORGAN 1).
  - Ausgangs-RMS in 5-ms-Fenstern (Referenz > Spitze − 60 dB, msfa auf 0,5/√nCar skaliert): |Δ| ≤ 2 dB. Prototyp: höchstens 1,71 dB, V0a: 9,1 dB (`out/e3-rom-proto-44k.out`, `out/e3-rom-stock-44k.out`).
- [ ] V0d-2-04 Haltephase:
  - Träger L 99 99 0 0, R 99 R2 60 60, C4: Zeit bis −6 dB (EG) für R2 95/90/80/70/60/50/40/30/20 gleich msfa ± max(2 ms, 3 %) bei 44,1 kHz (Prototyp ≤ 1,5 ms).
  - Verzögerter Angriff L 0 99 99 0 mit R1 70/60/50/40/30/20: Einsatz gleich msfa ±1,5 ms (Prototyp ≤ 0,7 ms).
  - Bei 48 kHz gelten dieselben Zeiten wie bei 44,1 kHz ±2 ms; Dexed käme dort auf das 0,84-Fache.
  - `FMH.envTimes` zeigt die Haltezeit ±1 ms.
  - ROM1A BRASS 2: OP1 bleibt bis ≥ 600 ms auf Vollpegel ±0,1 dB.
  - Live-Änderung: Träger L 99 99 0 0, R 99 40 60 60 (Haltezeit 500 ms), C4. Während des Haltens 30 Live-Änderungen an OP 2 im Abstand von 16 ms: −6 dB wird nach 531 ± 5 ms erreicht, wie ohne Änderungen (gerechnet 531 ms, `r8/a4b/out/e12b-design.out`).
  - Makro in der Haltezeit: Träger L 99 99 0 0, R 99 50 50 60, LÄNGE −10 (wirksam R2 = R3 = 60): −6 dB nach 82 ± 3 ms (msfa mit R 99 60 60 60; ohne Makro wären es 243 ms), in Worklet und nativ; `FMH.envTimes` zeigt die Haltezeit von R 60 (51 ms) ±1 ms.
- [ ] V0d-2-05 Snap-Bass (Klang), SNAP-TEST in beiden Fällen (`r8/rev-dsp/cand.mjs`, `out/cand.out`, `out/apply-check.out`):
  - M-HANDYrel (Anschlag 0,8) bei C2 −16 … −8 dB und bei E1 ≥ −22 dB (gemessen ×1: −8,8 / −19,9; ×2: −10,7 / −15,6). Das ist die Handy-Probe auf „schneidet den Sound ab“; der erste Entwurf lag bei −24,9 / −41,7 dB.
  - M-SP (Hann 2048, Fensterbeginn) fällt vom Fenster ab 0 ms zum Fenster ab 80 ms um ≥ 0,75 Okt. bei C2 und ≥ 0,6 Okt. bei E1 (gemessen ×1: 0,83 / 0,74, msfa 0,84 / 0,77; ×2: 1,45 / 1,45, msfa 1,47 / 1,47). |Δ zu msfa| ≤ 0,1 Okt.
  - M-BISS ≥ 20 dB bei C2 und ≥ 30 dB bei E1 (gemessen ×1: 31,3 / 39,8; ×2: 24,1 / 33,6), gleich msfa ±2 dB.
  - M-PEGEL gegen msfa (Messgrößen): ≤ 0,5 dB in jedem Fenster (gemessen ≤ 0,19 dB). Zur Einordnung: gegen „ohne Modulator“ −4,5 … +0,7 dB (×1) bzw. −1,0 … +2,6 dB (×2), genau wie msfa.
- [ ] V0d-2-06 Der kürzeste Zug knackt nicht und schneidet nicht ab (CDP-Touch, P1):
  - Ausgang: Testtöne Sinus C3, Sinus C2 und FM 1:1 OL 80 C3, gehalten, Gate 0,5 s. Den R-Punkt in einer Geste bis an den linken Graph-Rand ziehen:
    - Ergebnis R4 ≤ 93 und HF-KNALL ≤ −50 dB (gemessen bei R4 93: −60 / −55 / −51 dB; bei R4 99: −55 / −50 / −46 dB, `out/e6-click.out`).
    - Ein zweiter Zug, der an der Grenze beginnt, erreicht R4 99; das LCD zeigt „Klick-Bereich“.
    - Solange der Finger beim ersten Zug hinter der Grenze steht, enthält `fmEnvView().readout` „Klick-Grenze“, und der Punkt hat den Bernstein-Rand.
  - Steigende Stufe: Ausgang L 60 57 99 0, R 99 40 60 70, Sinus C2. Den D2-Punkt ganz nach links ziehen ergibt R3 ≤ 93 und HF-KNALL (bezogen auf die 20 ms nach dem Stufenbeginn) ≤ −50 dB (gemessen bei R3 93: −51 dB, bei R3 99: −41 dB, `r8/rev-dsp/out/rise.out`).
  - Modulator: Den D1-Punkt von OP 2 im SNAP-TEST (×1) in einer Geste ganz nach links ziehen:
    - Ergebnis R2 ≤ 82;
    - M-PEGEL gegen msfa ≤ 0,5 dB je Fenster (gemessen gegen „ohne Modulator“ −4,0 … 0,0 dB, wie msfa);
    - M-BISS ≥ 18 dB bei C2 und ≥ 30 dB bei E1 (gemessen bei R2 82: 21,5 / 34,2 dB, `r8/rev-dsp/out/apply-check2.out`).
  - Pegelzug: Ab Init FM mit OP 2 an, ×1, OL 90: D1 von OP 2 senkrecht auf L2 50 ziehen ergibt R2 ≤ 82, und `readout` enthält „Zeit auf Klick-Grenze angehoben“.
  - Den A-Punkt ganz nach links ziehen ergibt R1 = 99 (heute 82).
- [ ] V0d-2-07 Log-Zeitachse ohne Grob-Raster (CDP-Touch, P1 und L1; SNAP-TEST OP 2, Stufe D1):
  - Lineal-Striche bei 1 ms / 10 ms / 100 ms / 1 s / 10 s mit gleichem Abstand ±1 px (P1: 49,1 px je Dekade, L1: 70,0 px; Tabelle in 4a).
  - Der 0,5-ms-Punkt liegt bei x ≥ 40 px vom Bildschirmrand (P1–P3, L1, L2).
  - Jeder nicht aufgefächerte Punkt liegt bei x = Achse(kumulierte Zeit nach `FMH.envTimes` mit Haltephase) ±1 px (`fmEnvView().dots`, `xTrue`). Aufgefächerte Punkte (`fanned`) sind davon ausgenommen; sie liegen ≥ 16 px auseinander.
  - Ab Init: D1 eines Modulators lässt sich in P1 mit einer Geste fassen und senkrecht ziehen; währenddessen `fmEnvView().stage === 1`.
  - Zug in 1-px-Schritten über 120 px nach links:
    - die erste Änderung kommt nach ≤ 7 px und ist höchstens 1 qrate-Schritt groß;
    - jeder weitere px ändert höchstens 1 qrate-Schritt;
    - jede qrate zwischen Start und Ende kommt mindestens einmal vor (keine übersprungen).
  - Gleiche Pegel L1 = L2 = 99: Ein waagrechter Zug ändert R2, und die angezeigte Zeit ist die Haltezeit (Punkt 2) ±1 ms. R2 = 0 entsteht nur, wenn ganz nach rechts gezogen wird.
  - Der Bereich 10–100 ms ist in P1 ≥ 48 px breit, in L1 ≥ 68 px. Die Release-Achse (5 ms … 12 s) hat in P1 ≥ 9 px je Oktave.
- [ ] V0d-2-08 Fein-Modus (P1):
  - Ein waagrechter 60-px-Zug ändert R2 ohne FEIN um ≥ 15, mit [FEIN] um ≤ 7.
  - Ein senkrechter 40-px-Zug ändert L2 ohne FEIN um ≥ 30 Schritte, mit [FEIN] um ≤ 12.
  - Ein ruhender zweiter Finger wirkt wie [FEIN], auch wenn er auf dem Graphen oder auf einem DX-Feld liegt; er fasst keinen zweiten Punkt.
  - Eingerastetes [FEIN] zeigt „FEIN ×¼“ im Graphen; nach Operator-Wechsel und nach Verlassen der Seite ist `fmEnvView().fine === false`.
  - Ein Querweg von 64 px schaltet im Graphen **keinen** Fein-Modus.
- [ ] V0d-2-09 Ablesung in ms und DX-Rate:
  - Während des Ziehens zeigt die Anzeige im Graphen (`fmEnvView().readout`) Zeile 1 „<Stufe> <Zeit> · R<i> <R>“ und Zeile 2 „L<i> <L> · <dB>“, bei Modulatoren zusätzlich „· I <Index>“. Das LCD zeigt nur die gezogene Achse.
  - Die Anzeige im Graphen hat in P1–P3, L1 und L2 `scrollWidth ≤ clientWidth` (nichts abgeschnitten); das LCD-Wertfeld ebenso in P1, P2, L1.
  - <Zeit> ist gleich `FMH.envTimes` des aktuellen Operators, formatiert nach Punkt 4f.
  - Die Zeiten-Zeile reagiert nicht auf Tipps (`pointer-events: none`).
  - Die DX-Zeile zeigt nach jedem Bewegungs-Ereignis die gespeicherten Werte (deep-equal mit `getSound(t).p.fm6.ops[k]`).
- [ ] V0d-2-10 Ein Pegelzug hält die Zeiten:
  - L2 von OP 2 im SNAP-TEST in einer senkrechten Geste von 80 auf 68 ziehen.
  - Danach liegen die Zeiten von D1 und D2 je ±15 % bei ihren Startwerten; R2 und R3 haben sich geändert (DX-Zeile).
- [ ] V0d-2-11 Vorlagen:
  - [Snap] [Pluck] [Pad] [Orgel] auf einem Modulator und auf einem Ausgang ergeben genau Tabelle T2 (`r`/`l` deep-equal), je ein Undo.
  - Die angezeigten Zeiten stimmen mit T2 bis auf ±1 in der letzten Stelle.
  - Die PEG-Vorlagen ergeben genau die Tabelle in Punkt 6.
- [ ] V0d-2-12 Auf mehrere und Undo:
  - V0d-10 gilt auch aus dem neuen Editor, in P1 und L1 (über [⋯]).
  - 12 verschiedene Gesten (Zug, Vorlage, Kopie, DX-Feld, [−1] [+1]) ergeben 12 Undo-Schritte; 12 × Undo stellt den Ausgangs-Sound deep-equal her.
  - Abbruch: Zug, dann `window.dispatchEvent(new Event('blur'))`, dann Finger hoch. Danach ist `UNDO.length` um 1 gestiegen, und ein Undo stellt den Startwert deep-equal her (heute: 0, `r8/ux-a4b/m4-abort.mjs`). Ebenso für `fmPegEditor` und den DX-Feld-Wisch.
  - Vorhören: Bei gestopptem Transport ist nach [Snap] und nach einem Zug `fmAuditions()` um genau 1 gestiegen; bei laufendem Transport oder mit Schalter „Vorhören“ aus um 0.
- [ ] V0d-2-13 Reiter HÜLLK. bei FM:
  - Bei fmAmp 0 heißen die Unterreiter OPERATOREN / TONHÖHE / FILTER / MOD-HK. Bei fmAmp 1 steht LAUTST. (ADSR) vorn, mit Band und [DX-Hüllkurven].
  - FILTER ist grau mit Grund, solange `fmBypass` greift; MOD-HK ist grau ohne Route.
  - Auf OPERATOREN wählt ein Tipp auf den Chip „4“ OP 4, und ein Zug wirkt wie auf OP › HÜLLK. (gleiche Werte in `fmEnvView`).
  - Bei fmAmp 0 lässt sich die VA-Form „Pluck“ nicht mehr antippen.
- [ ] V0d-2-14 Pitch-EG ± vorhanden und hörbar:
  - (a) Import ROM1A: Die 5 Stimmen mit nicht flacher PEG (KOTO, TIMPANI, REFS WHISL, VOICE 1, TAKE OFF) haben `fm6.peg` gleich den Bytes 102–109; die übrigen 27 haben kein `peg`.
  - (b) Sinus-Träger C4, Worklet gegen msfa: Die 5 Test-Hüllkurven aus `out/e2-peg.out` und die 3 Vorlagen ergeben eine TONHÖHENSPUR mit |Δ| ≤ 0,15 HT ab 30 ms (Prototyp ≤ 0,10 HT).
  - (c) Hörbar, Fenster 10 ms:
    - [Ruck] ≥ +1,2 HT im ersten Fenster und 0 ± 0,1 HT ab 15 ms;
    - [Fall] ≥ +6,5 HT bei 0 ms und ≤ +0,3 HT bei 200 ms;
    - [Anstieg] ≤ −3,5 HT bei 0 ms.
  - (d) Ein Operator mit fester Frequenz bleibt mit und ohne PEG gleich (TONHÖHENSPUR ±0,02 HT).
  - (e) TAKE OFF liegt mit PEG von 0 bis 200 ms ≥ 30 HT über der Fassung ohne PEG und gleich msfa ±1 HT (Nulldurchgangs-Rate).
  - (f) Sounds ohne `peg` rendern bitgleich zu V0a.
- [ ] V0d-2-15 BISS und LÄNGE (SNAP-TEST ×1, C2):
  - BISS −20/−10/0/+10/+20: M-SP im Fenster ab 0 ms fällt streng, je 10er-Schritt um ≥ 0,1 Okt., gesamt ≥ 1 Okt. (nachgebildet 379/309/283/194/173 Hz, Schritte 0,29/0,13/0,54/0,17 Okt., `r8/rev-dsp/out/apply-check.out`). Keine wirksame Modulator-Rate liegt dabei über der Klick-Grenze (R 82 bei der Bezugsnote). M-PEGEL bei 90–110 ms ändert sich um ≤ 2 dB (nachgebildet 0,95 dB).
  - LÄNGE ±30: Der M-SP-Verlauf von 0 bis 120 ms bleibt gleich (±0,05 Okt.), M-PEGEL bei 200 ms ändert sich um ≥ 3 dB.
  - Migration (a): Ein V0a-Sound ohne `fmBite` mit `fmDec` −30 bzw. +30 rendert nach dem Laden bitgleich zu V0a (Differenz-RMS ≤ −90 dB); danach `fmBite === 0`, und die Modulatoren tragen die eingebrannten R2/R3.
  - Migration (b): Laden → Speichern → Laden eines V0d-Sounds mit LÄNGE −10 und BISS 0 ergibt deep-equal dieselben Parameter.
  - Nativ: BISS ±20 wirkt ab der nächsten Note (ΔM-SP ab 0 ms ≥ ⅓ Okt.).
- [ ] V0d-2-16 Init:
  - [Init FM], Hüllkurven-Init und Doppeltipp auf den R-Punkt setzen R4 80 und L4 0.
  - Nach dem Loslassen eines Init-Tons (FM 1:1 C3) ist der HF-KNALL ≤ −55 dB (gemessen −62 dB).
- [ ] V0d-2-17 OL für hörbare FM gleich DX (Aufbau wie Tabelle T3):
  - Worklet gleich msfa ±1 OL für alle drei Schwellen und alle sechs Zeilen (gemessen: 0).
  - Nativ ±3 OL für die drei Schwellen der Tabelle (gemessen ≤ 3).
  - Der Fader aus A.4 Punkt 3 erreicht OL 64 bei p = 0,38 ±0,02 (CDP-Touch).
- [ ] V0d-2-18 Nativer Rückfall (`forceNative(true)`, Chromium-Offline mit `DXN.voice`):
  - Haltephase: Träger L 99 99 0 0 mit R2 50 erreicht −6 dB zur selben Zeit wie das Worklet ±3 ms.
  - PEG: [Ruck] und [Fall] ergeben dieselbe TONHÖHENSPUR wie das Worklet ±0,3 HT.
  - PEG ändert den Index nicht: 1:1-Ton C3, Modulator OL 70, PEG konstant +7,5 HT (alle L 70): H2/H1 bei 200–400 ms (bezogen auf die verschobene Grundfrequenz) ±1 dB beim selben Ton ohne PEG.
  - SNAP-TEST ×1: M-BISS ≥ 25 dB bei C2 und E1; M-PEGEL bleibt in −3,5 … +3,0 dB zu „ohne Modulator“ (gemessen 30,9 / 38,3 dB und −2,2 … +2,2 dB, `r8/rev-dsp/out/apply-check2.out`). Gegen msfa wird nativ nicht geprüft, weil ECO FM statt PM rechnet.
  - Der ECO-Hinweis ist sichtbar, sobald ein Modulator OL ≥ 75 hat.
- [ ] V0d-2-19 Layout:
  - M-PLATZ für OP › HÜLLK., HÜLLK. › OPERATOREN, HÜLLK. › TONHÖHE und MAKRO in P1–P3, L1 und L2.
  - Zeilenhöhen und Abstände wie in der Zeilentabelle unter den Mockups ±1 px; Graph ≥ 70 px (P) bzw. ≥ 90 px (L) hoch.
  - Trefferflächen nach L4: Punkte ≥ 44×44 px (P) bzw. 40×36 px (L), DX-Felder ≥ 36×34 px mit 4 px Abstand, [‹] [›] der Kopfzeile in P1 44×44 px, in P2/P3 und L ≥ 36×34 px.
  - Der Körper scrollt nicht senkrecht.
- [ ] V0d-2-20 Regression:
  - V0d-01 … V0d-17, FM1–FM10, PR1 und PR8 bestehen. Abweichungen nur über `v0d-adapt-*.mjs` mit Verweis auf A.4b Punkt 4, 7 oder 8.
  - Die 10 Werks-FM-Sounds aus V0a, die A.4 nicht ändert (alle außer Pop-Bass DX und Solid-Bass), rendern je Band höchstens 0,5 dB anders als in V0a (M-BAND, L7).
  - Alle 32 ROM1A-Stimmen lassen sich importieren und spielen.
  - DoD und Worklet-ASCII-Prüfung bestehen.

**Tests.**
- `v0d2-engine.mjs`: Node-Shim gegen `r8/ref/bin/dx7render`; Verfahren wie `r8/a4b/tools/e1b-hold`, `e1c-delay`, `e2-peg`, `e3-rom`, `e4-modcut`, `e6-click`, `e10-snaptest`, `e11-pegpre`; für den neuen SNAP-TEST, BISS und steigende Stufen `r8/rev-dsp/cand.mjs`, `apply-check.mjs`, `apply-check3.mjs`, `rise.mjs`.
- `v0d2-env-ui.mjs`: CDP-Touch in P1–P3, L1 und L2 (Geometrie wie `r8/ux-a4b/m1-geom.mjs`, Abbruch wie `m4-abort.mjs`).
- `v0d2-native.mjs`: Chromium-Offline mit `DXN.voice`, wie `r8/tools/m3-native.mjs`.

**Risiken.**
- V0d wird mit ≈ 11,5 h das größte Paket der Gruppe V0 (Notiz in C.4). Die Bau-Abschnitte halten die Engine-Abnahme vor der Bedienung.
- Die Haltephase ändert importierte und eigene Sounds mit gleichen inneren Pegeln. Das ist gewollt und DX-richtig; die Werks-Sounds bleiben gleich.
- „Zeit halten“ beim Pegelzug kann bei sehr kleinen Pegelabständen nicht greifen (Raten 0–99 reichen nicht). Dann wandert der Punkt, und das LCD sagt es.
- Die 12-s-Kappe für Releases (Z. 2592) bleibt; längere DX-Releases enden dort.
- Gemessen ist alles in Node bzw. Chromium, **nicht am iPhone** und nicht angehört.
- iPhone-Prüfpunkte für den V0d-Stand (EN-20, in CHANGES):
  1. FM-Pluck → Editor › OP öffnet „OP 2 · MODULATOR“ direkt auf HÜLLK. Nach [Snap] (dritte Geste) erklingt die Vorhör-Note; der Ton bleibt am iPhone-Lautsprecher hörbar stehen, nur der Anfang bellt.
  2. Den D1-Punkt langsam nach links und rechts ziehen: Der Biss wird kürzer bzw. länger, ohne Sprung. Ganz links stoppt der Punkt an der Klick-Grenze, mit Bernstein-Rand, Tick und Hinweis im Graphen.
  3. HÜLLK. › TONHÖHE › [Ruck] und [Fall] sind hörbar.
  4. Den A-Punkt in Safari nach rechts ziehen: Die Seite bleibt (keine „Zurück“-Geste vom Rand).

**Review-Protokoll (Review-Runde zu A.4b, 17.10.).** 23 Befunde, jeder nachgemessen bzw. am Quelltext geprüft (`r8/rev-dsp/`, Ausgaben in `r8/rev-dsp/out/`; `r8/ux-a4b/`; `r8/a4b/out/e12b-design.out`). Stand vor dem Review: `r8/a4b/nachtrag-1.vor-review.md`.

| Befund | Ergebnis | Ort |
|---|---|---|
| Snap-Vorlage und SNAP-TEST: Bass am Handy fast weg | bestätigt (−24,9 / −41,7 dB), übernommen; statt „OL = max(OL, 90)“ der Chip [Pegel 95] mit Hinweis | T2, Punkt 1, SNAP-TEST, V0d-2-05/-06/-18 |
| BISS als Raten-Versatz: tote Plus-Hälfte, über der Klick-Grenze | bestätigt, übernommen; Zeitfaktor stetig statt über das Raten-Raster (gleiche Wirkung, je Stimme ohne Tabellensuche) | Punkt 7, V0d-2-15 |
| Migration `fmDec` → `fmBite` | Problem bestätigt (±30 gegen ±20; Auslöser nicht idempotent). **Fix teilweise abgelehnt:** `fmBite = −fmDec` mit ±30 wäre mit dem Zeitfaktor aus dem BISS-Befund nicht bitgleich. Ersatz: alten Versatz in R2/R3 der Modulatoren einbrennen; Auslöser nur das fehlende Feld (die Sound-Version ist dann überflüssig) | Punkt 7, V0d-2-15 |
| Steigende Stufe mitten im Ton knackt | bestätigt (−41 dB bei R3 99), übernommen | 4g, V0d-2-06 |
| ECO: PEG ändere den Index | bestätigt falsch (≤ 0,2 dB), übernommen. **Prüfung geändert:** statt [Fall] im Fenster 0–40 ms eine konstante PEG, weil eine gleitende Tonhöhe die Teilton-Messung verschmiert | Punkt 3, 9, Risiken, V0d-2-18 |
| Haltephase startet bei Live-Änderungen neu | bestätigt (Z. 3153, 3186; Dexed `env.cc` Z. 158–172), übernommen; Prüfton mit R3 60 festgelegt, gerechnet 531 ms | Punkt 2, V0d-2-04 |
| Welches R gilt für die Haltezeit | bestätigt, übernommen; da LÄNGE auf R2 **und** R3 wirkt, Prüfton R 99 50 50 60 → 82 ms (gerechnet) | Punkt 2, V0d-2-04 |
| Layout P2/P3/L passt nicht | bestätigt (m1/m2), übernommen; zusätzlich gefunden: 8 DX-Felder mit 4 px Abstand passen nicht in P3 (304 px) → [R│L] | Mockups, Zeilentabelle, V0d-2-19 |
| Weg zu [Snap] zu lang, HÜLLK. öffnet falsch | bestätigt (Z. 14210, m3), übernommen; `.fmspk` bleibt Zusatzweg | Punkt 1, 5, Ziel, V0d-2-01 |
| Ab Init FM kein Snap-Bass | bestätigt (Z. 13931), übernommen mit **OL 95 statt 85** (passend zu T2 und „Biss braucht OL ≥ 90“) und [Pegel 95] ab OL < 90 statt [Pegel 85] ab OL < 75 | Punkt 1, V0d-2-01 |
| Punkte in einer Ecke, D1 nicht greifbar | bestätigt (`e12-design.out`), übernommen | 4a, 4m, V0d-2-07 |
| Pegelzug ignoriert die Klick-Grenze | bestätigt, Regel übernommen. **Abnahme „M-BISS ≥ 25 dB“ abgelehnt:** Bei gehaltener D2-Dauer (R3 99, L3 99) steigt der Modulator sofort wieder an; gemessen M-BISS −2,5 dB (C2). Ein Pegelzug an D1 allein erzeugt eine Delle, keinen Biss. Geprüft werden R2 ≤ 82 und der Hinweis | 4d, V0d-2-06 |
| Ablesung passt nicht ins LCD | bestätigt (m2), übernommen | 4f, V0d-2-09 |
| Klick-Grenze ohne Rückmeldung | übernommen | 4g, V0d-2-06 |
| Abbruch verliert Undo | bestätigt (m4), übernommen | 4k, V0d-2-12 |
| Kein Vorhören | übernommen | 4o, V0d-2-12 |
| Zweiter Finger / FEIN | bestätigt (Z. 17504), übernommen | 4e, V0d-2-08 |
| Zeiten-Zeile als Tipp-Ziel | übernommen | 4f |
| ‹ › doppelt belegt | übernommen | 4h, Mockups |
| Release-Achse zu grob | übernommen; mit dem Rand aus dem nächsten Befund 9,4 px je Oktave in P1 | 4a, V0d-2-07 |
| Rand-Geste in iOS Safari | übernommen; Rand 32 px, weil der Innenrand der Seite jetzt 0 ist (Graph ab x = 8) | 4a, iPhone-Prüfpunkt 4 |
| Bezugsnote springt | übernommen (Verzögerung und Schloss) | 4a |
| PEG-Doppeltipp und Startpunkt | übernommen | Punkt 6, Mockup |

Kein Befund wurde ganz abgelehnt; abgelehnt sind nur die oben genannten Teile.

### A.5 V1c verkleinert und NEU V1d — Engine je Pad

**V1c** behält §3.6 und Anhang B.4 (Kits „im Stil von“).
- §3.7 (Synth-Pad) und die Punkte V1c-05 bis V1c-11 wandern geändert nach V1d.
- V1c-12 prüft nur die Kits, ohne Synth-Pad-Seiten.
- Dauer 3–4 h, App-Version 3.7.0, Budget +25 KB.

**V1d — Engine je Pad und eigene Klänge als Pad**

**Ziel.**
- Jedes der 12 Pads kann eine Drum-Stimme oder ein Synth-Klang sein (VA, FM, WT), so wie man beim OP-Z je Spur eine Klang-Engine wählt (eK, nicht geprüft).
- Selbst gebaute Effektklänge (Riser, Tropfen, Rausch-Sweeps) landen mit einem Griff auf einem Pad.

**Umfang.** §3.7 mit diesen Änderungen (EN-08):
- **Quelle je Pad:**
  - Chip „Quelle ▾“ im Kopf (P: rechts in der Unterzeile; L: anstelle der Unterzeile; ≥ 44×32 px). Er öffnet ein Mini-Blatt mit [DRUM │ VA │ FM │ WT] (später um jede neue Engine ergänzt, PAD-R1) und ersetzt das Segment [DRUM │ SYNTH].
  - Jeder Wechsel ist ein Undo.
  - Zurück auf DRUM stellt den Drum-Slot deep-equal her; die Drum-Werte bleiben im Slot erhalten.
- **Pad-Start:**
  - Der erste Wechsel auf eine Engine lädt deren INIT (Anhang A.2) mit Lautst.-Hk. A 1 ms, D 0,3 s, S 0, R 0,1 s.
  - `syn.mem[engine]` merkt je Pad den letzten Klang jeder Engine (L7).
- **Sound ▾** öffnet die Bibliothek im Pad-Modus, gefiltert auf die Engine des Pads (EN-04). Ein Tipp kopiert den Sound in das Pad, nicht in eine Spur.
- **Als Drum-Pad ▸:** im Kopf des Synth-Editors unter ⋯ und in Bibliothek-Zeilen unter ⋯.
  - Öffnet eine Pad-Liste (12) und kopiert den Klang.
  - NOTE = die zuletzt gespielte Note der Spur, sonst C3. HALTEN = „wie Klang“.
  - Ein Undo (`group`).
- **KLANG-Seite eines Synth-Pads:** vorne 6 Regler (L1): NOTE, HALTEN, AUSKLANG und drei Engine-Makros.

  | Engine | Makros |
  |---|---|
  | VA | Cutoff, Hüllk.-Menge, Decay |
  | FM | Helligkeit, Härte, Länge |
  | WT | Position, Cutoff, Decay |

  Dazu [Klang öffnen ›] wie §3.7.
- **HALTEN:** 10 ms bis 8 s, oder „wie Klang“ = A + D bei S = 0, sonst A + D + 0,25 s, höchstens 8 s. AUSKLANG wie §3.7.
- **Grenzen:**
  - Alle 12 Pads dürfen Synth-Pads sein.
  - Zusammen höchstens **8** Synth-Pad-Stimmen. Jedes Pad ist einstimmig mit 3-ms-Blende; Option „Poly 2“.
  - Stimmenraub: der älteste Schlag desselben Pads, sonst der älteste überhaupt.
  - CPU-Begrenzer Stufe 1: höchstens 4 Synth-Pad-Stimmen (ersetzt „Synth-Pads Poly 1“ in §15.2).
  - Anzeige im Kopf: „Synth-Pads 5 · Stimmen 3/8“.
- **Engine:**
  - VA und FM: ein Synth-Worklet-Knoten je Synth-Pad. Er wird beim Umschalten bzw. beim Laden des Projekts angelegt, nicht beim ersten Schlag.
  - Schlafen ist nicht nötig, weil ein leerer Knoten nur ≈ 0,1 % kostet (N0.2).
  - WT läuft nativ (`NativeVoice`).
  - Rückfall ohne Worklet: `NativeVoice` bzw. `DXN` mit Hinweis „ECO“.
- **Lanes, Folgen (nie) und Stopp** wie §3.7.
- **Regel PAD-R1 (EN-21, gilt ab V1d für jedes spätere Paket):** Jede neue Synth-Engine erscheint im Quelle-Blatt (die Liste wird aus der Engine-Tabelle erzeugt, nicht von Hand geführt), bekommt dort INIT und drei Makros für die KLANG-Seite, und V1d-02 läuft für sie mit. Betroffen sind `mask` (V8a), `add` (V9a) und `body` (V9b). Das FM-Feld (V4) ist keine eigene Engine (`p.fmx` im Sound mit `engine:'fm6'`): Ein FM-Pad spielt auch einen Klang mit `p.fmx`, und seine drei Makros wirken darauf. Abnahme in V4b, V8a, V9a und V9b: V1d-02 für die neue Engine bzw. für einen FM-Klang mit `p.fmx` besteht, `setPadSource(slot, 'synth', {engine})` nimmt sie an.

**Daten.**
```js
slots[id] += { src: 'drum'|'synth',
  syn?: { sound, note, gate /* s | 'auto' */, rel, poly, mem: { [engine]: sound } } }   // offene Liste: analog, fm6, wt, später mask, add, body …
```
- Die Engine ist `syn.sound.engine`.
- `normDrum` erhält alle Felder, auch `mem`-Einträge unbekannter Engines (für ältere App-Versionen). Alte V1c-Daten (`src:'synth'`) gelten unverändert.

**Nicht-Umfang.** Drum-Locks über Makros (V5b); Abbildung Synth → Drum (§18).

**Berührungspunkte.** Kopf-Chip, `drumHit` (Synth-Zweig), `SynthHost` (Knoten je Pad), `NativeVoice`, Bibliothek im Pad-Modus, ⋯ im Synth-Editor, CPU-Begrenzer, `normDrum`, `panic`/`stop`.

**Dauer** 4–5 h · **App-Version** 3.8.0 · **Budget** +40 KB.

**Abnahme-Checkliste**
- [ ] V1d-01 Jedes der 12 Pads durchläuft die Quellen DRUM → VA → FM → WT → DRUM (CDP-Touch):
  - Nach der Rückkehr sind die Drum-Felder (alles außer `src` und `syn`) deep-equal zum Anfang.
  - `syn.mem` enthält danach `analog`, `fm6` und `wt`.
  - Ein erneuter Wechsel auf VA lädt `mem.analog` deep-equal.
  - Jeder Wechsel ist ein Undo; Undo bis vor den ersten Wechsel stellt den Slot vollständig deep-equal her (einschließlich Fehlen von `syn`).
- [ ] V1d-02 Pad-Start je Engine: RMS > −40 dBFS, M-AUS ≤ 400 ms (perkussiv).
- [ ] V1d-03 Sound ▾ auf einem FM-Pad zeigt nur FM-Sounds. Ein Tipp ändert das Pad; `getSound(t)` aller Spuren bleibt deep-equal.
- [ ] V1d-04 Als Drum-Pad ▸:
  - Ein Riser auf Pad PERC klingt je Schlag ≥ 3,5 s (M-AUS). **Der Prüfklang wird im Test aus dem Rezept gebaut** (N73 aus `r6/mess/effekte.mjs`, wörtlich auch in `r6/n6/rezepte76.json`: Amp A 2,5 s, Hk 2 A 4 s → Cutoff +60 HT und Tonhöhe +12 HT), über `setSound` auf eine Spur gelegt und von dort mit „Als Drum-Pad ▸“ kopiert. Er hängt nicht davon ab, ob V0d Punkt 9 (P1) gebaut wurde; eine Werks-„Pfeif-Rampe“ gibt es in WP7 nicht (nur Pfeif-Lead und Pfeif-Sequenz).
  - Der Tropfen auf Pad RIM klingt im Schritt.
  - Ein Undo entfernt jeweils.
- [ ] V1d-05 (vorher V1c-05) SNARE-Pad auf FM (FM-Pluck, C3): Der Schritt löst aus, RMS > −40 dBFS. Pad-Pan ±1 ergibt eine L/R-Differenz ≥ 6 dB.
- [ ] V1d-06 Grenzen:
  - 12 Synth-Pads mit Poly 2, 16tel-Wirbel auf allen über 4 Takte → nie mehr als 8 aktive Synth-Pad-Stimmen (`voices()`).
  - Der Stimmenraub besteht M-KLICK.
  - Mit `cpuInject(.5, 3)` nie mehr als 4.
- [ ] V1d-07 (vorher V1c-07) 200 ms nach ■ bzw. Panik ist keine Synth-Pad-Stimme aktiv.
- [ ] V1d-08 (vorher V1c-08) TUNE-Lock +12 → C4 im `noteLog` (`src:'synpad'`). DECAY-Lock ×2 → HALTEN ×2 (M-AUS ×2 ± 20 %).
- [ ] V1d-09 (vorher V1c-09) Synth-Pads folgen nie dem Träger.
- [ ] V1d-10 (vorher V1c-10) Speichern und Laden ergeben deep-equal Daten, einschließlich `syn.mem`. Eine Änderung am Quell-Sound ändert das Pad nicht.
- [ ] V1d-11 CPU (Xeon, M-CPU als Summe aus Drums und Pad-Knoten):
  - 4 Synth-Pads (2 FM, 2 VA, Poly 1) plus dichter Groove ≤ 12 %.
  - 12 Synth-Pads (je 4 VA, FM, WT), 16tel mit CHANCE 50 %, HALTEN 80 ms, 8 Takte ≤ 15 %.
- [ ] V1d-12 KLANG-Seite eines Synth-Pads:
  - 6 Regler, jeder erfüllt H-1 (NOTE: Tonhöhe; HALTEN und AUSKLANG: M-AUS ×2; Makros je Engine).
  - Der Kopf zeigt den Quelle-Chip.
  - M-PLATZ in P1–P3, L1, L2, W.
- [ ] V1d-13 Regression (DR*, T1–T18, V1a–V1c) und DoD.

**Tests.** `v1d-pads.mjs`, `v1d-cpu.mjs`.

**Risiken.**
- Viele Synth-Pads legen beim Laden viele Knoten an; das kostet Zeit im Hauptthread. Messen und die Startzeit-Abnahme (§15.3) prüfen.
- Das Stimmenbudget am iPhone ist ungemessen.

### A.6 V2 — Ergänzungen (N2b, N2d, N2e)

- [ ] N2b-01 Die MELODIE-Rolle (V2b) folgt EN-07 (M-SEITE wie N0b-06) und besteht den Tipp-Test N0b-07.
- [ ] N2d-01 TA9 mit Kette:
  - Eine Kette mit Teil-Akkorden läuft, dann ■ → `runtime().carrier` = Stand vor dem Song.
  - Ein folgender Szenen-Start startet die Akkord-Zeile der Szene (Regel „Szenen-Wechsel per ▶n“, §4.6) bzw. ORIGINAL, nie den letzten Ketten-Akkord (`noteLog`).
- [ ] N2e-01 Die neue Song-Ansicht behält EN-06: ▶ oben = ▶ SONG ab der Positionsmarke, die Taste zeigt „SONG“.
- [ ] N2e-02 Die neue Song-Ansicht folgt EN-07: taktbündig in ganzen Seiten. Sie HÄLT bei markiertem Block, offener Akkord-Auswahl, Bearbeitung vor weniger als 3 s und nach Wischen von Hand (`viewState('song')`).

### A.7 V4 — Ergänzungen (N4a, N4b, N4c)

V4 wird **vor** V3 gebaut (C.2). Die ZIP-Auslieferung für `.syx` in V4c kommt aus N0a-03.

- **N4a-01 Feedback in Bruchteilen:**
  - `fmx.ops[].fbAmt` ist stetig in 0,1-Schritten (0–7). Das Worklet rechnet `2^(fbAmt−8)` ohne Rundung auf ganze Zahlen.
  - DX-tauglich ist nur ein ganzzahliger Wert; sonst Badge „kein DX: FB 4,5“.
  - [ ] Abnahme: fbAmt 4,5 liegt im M-SP zwischen 4 und 5 (monoton).
- **N4b-01 Unterseiten FELD · DX · OP n · MAKRO · STIMME.**
  - DX ist die WP7-ALGO-Seite mit den V0d-Korrekturen. Damit bleibt der klassische DX-Modus erhalten (Xander I1).
  - Neue Sounds öffnen FELD (E3-20). .syx-Importe und DX-taugliche FM-Werks-Sounds öffnen DX. Die letzte Wahl je Sound merkt sich `S.ui`, nicht der Sound.
  - Ist ein Graph nicht DX-tauglich, zeigt DX das Diagramm des nächsten DX-Algorithmus mit „kein DX-Alg. · nächster: n“ und [DX-tauglich machen]. Bearbeiten ist dort gesperrt.
  - [ ] Abnahme: Umschalten FELD ↔ DX ändert weder `p.fm6` noch `p.fmx` (deep-equal). M-PLATZ der 5 Reiter in P1–P3, L1, L2.
- **N4b-02 Mehrfachauswahl:**
  - Die Kontextzeile bekommt [Mehrere]. Ein Tipp auf Kacheln wählt mehrere aus (Rahmen).
  - Ein Pegel-Zug wirkt relativ (+ΔOL je Kachel, geklemmt). Verhältnis-Raster und Hüllkurve wirken absolut auf alle.
  - Ein Undo je Geste.
  - [ ] Abnahme: 3 Modulatoren gewählt, Pegel +10 → alle drei +10 (geklemmt). Ein Undo stellt alle drei her.
- **N4b-03** Der FELD-Pegel (Kachelring und Kontextzeile) nutzt die Modulator-Fader-Kurve aus V0d.
  - [ ] Abnahme: wie V0d-07.
- **N4b-04** Die Hüllkurven-Wahl „auf [diesen │ alle Modulatoren │ alle Ausgänge │ alle]“ ist auch aus der FELD-Kontextzeile erreichbar.
  - [ ] Abnahme: wie V0d-10.
- **N4c-01** V4c-05 nutzt die ZIP-Auslieferung aus N0a-03; es gibt keine Abhängigkeit von V3a.

**Dauer** V4b +1 h (6–7 h) · **Budget** V4b +5 KB (75 KB).

### A.8 NEU V5d — Jeder stetige Regler modulierbar

**Ziel.** Jeder stetige Regler lässt sich modulieren: Klang, Effekte, Mischung und Drums. Vorbild ist Bitwig: Dort ist jeder Geräteparameter modulierbar, Modulatoren steuern auch andere Modulatoren, und es gibt beliebig viele Modulatoren je Gerät (SE, Bitwig-Handbuch).

**Befund (gemessen, R6-Audit):**
- Je Synth-Spur sind 23 von 140 stetigen Reglern modulierbar (16 %).
- WT: 0 von 3. FM6: 6 von 79.
- Spur-FX: 4 von 9.
- Hall (9), Echo (7) und Master (8): keiner.
- Drums: 0 Routen.
- Höchstens 8 Routen je Sound (Z. 2516); eine Mod-Tiefe lässt sich nicht modulieren.
- CPU, 8 Stimmen, 0 → 8 Routen: VA 3,3 → 3,5 %, FM6 4,4 → 4,9 % (`r6/mod-cpu.out`).
- Hüllkurven-Koeffizienten je Block neu rechnen: 19 ns je Aufruf (`r6/envcoef-bench.mjs`).

**Umfang.**
1. **Ziel-Pfad statt fester Nummer.**
   - `m.dst` bleibt für die 22 heutigen Ziele gültig (Zahl). Neu ist `m.path` (Text). Pfade:
     - `p.<PD-Schlüssel>`
     - `wt.<pos|scan|mix>`
     - `fm.<1–6>.<fine|ol|r1…r4|l1…l4|bp|ld|rd>` und `fm.fb` (DX-Ansicht, `p.fm6`)
     - `fmx.<A–H>.<ol|fine|det|r1…r4|l1…l4|bp|ld|rd|fbAmt>` und `fmx.edge.<von>-<nach>.amt` (FM-Feld aus V4, `p.fmx`; bis 8 Operatoren, Feedback je Operator in Bruchteilen nach N4a-01, Kantentiefen)
     - `fx.<Schlüssel>`, `bus.hall.<…>`, `bus.echo.<…>`, `master.<…>`
     - `mix.<Spur>.<vol|pan|sendH|sendE>`
     - `drum.<Slot>.<Schlüssel>`, `kit.<…>`
     - `mod.<n>.amt`
   - Die Tabelle `MODT` nennt je Pfad: Bereich, Skala (linear, logarithmisch oder Halbton), Klasse, Anzeige-Name und ob der Rückfall ihn kann.
2. **Vier Klassen:**

   | Klasse | Ziele | Wirkung | Quellen |
   |---|---|---|---|
   | **Block** | alle stetigen Synth-Klangwerte: VA und gemeinsame, WT, FM je Operator und FB (DX-Seite und FELD mit `fbAmt` und Kantentiefen), VK-Werte, später nach MOD-R1 auch `mask`, `add`, `body` | je 16-Sample-Block im Worklet, je Stimme; Hüllkurven-Koeffizienten werden je Block neu gerechnet | alle Synth-Quellen |
   | **Anschlag** | stufige Synth-Werte (Welle, Fußlage, Unison-Zahl, Filtertyp); alle Drum-Werte je Slot und Kit | Wert beim Note-On bzw. Schlag; gilt für die ganze Note | Synth: Anschlag, Note, Zufall, Mod-Rad, LFO- oder Hüllkurven-Wert beim Anschlag.<br>Drums: Anschlag, Zufall je Schlag, Kit-LFO 1/2 (frei oder zum Takt, beim Schlag abgetastet), Schritt-Nummer |
   | **Global** | Spur-FX, MIX-Werte, Hall, Echo, Master | AudioParam-Kette (Quelle → GainNode als Tiefe → AudioParam); sonst Werte je Block im Bus-Worklet. **Nie** `setValueCurveAtTime` (L3). | Spur-FX und MIX: LFO 1/2 der Spur (wie heute).<br>Hall, Echo, Master: G-LFO 1/2 (Projekt), Zufall je Takt, MAKRO 1/2 (zwei Projekt-Regler im MIX-Kopf) |
   | **Mod-Tiefe** | `mod.<n>.amt` jeder Route | multipliziert die Tiefe der Ziel-Route | die Quellen der Klasse der Ziel-Route |

3. **Bedienung.**
   - Halten (450 ms) öffnet auf **jedem** stetigen Regler den Picker (L4). Das gilt für Synth- und Drum-Editor, FX, HALL, ECHO, MASTER und MIX. Der Picker zeigt nur die Quellen, die die Klasse erlaubt.
   - Ausgenommen sind: Tempo, Swing, Lineal und Längen, App- und Projekt-Einstellungen, Regler in Bibliothek und Lektionen.
   - Mod-Tiefe: Halten auf dem Tiefe-Schieber der Strang-Leiste (V5a).
   - Strang und Liste zeigen Pfad-Namen, z. B. „Hall · Decay“, „OP 3 · R2“, „Tiefe: LFO 1 → Cutoff“.
4. **Budget (EN-09):**
   - Je Sound höchstens 8 Block- und Mod-Tiefe-Routen (wie heute) plus höchstens 8 Anschlag-Routen.
   - Je Kit höchstens 8 Routen.
   - Je Projekt höchstens 8 Global-Routen (je Route eine GainNode).
   - Kopf: „Routen 5/8 · Anschlag 2/8“. Die 9. Route wird abgewiesen, das LCD nennt den Grund.
5. **CPU-Begrenzer (ergänzt §15.2):**
   - Stufe 1: Block-Ziele außer Tonhöhe, Cutoff und Lautstärke nur jeden 2. Block.
   - Stufe 2: nur jeden 4. Block; Global-Ziele ohne AudioParam mit 30 Hz.
   - Stufe 3: Routen über 4 je Sound pausieren; sie werden grau mit „CPU“ markiert, die Daten bleiben (I-08, L9).
6. **Nativer Rückfall:**
   - Wie heute klingen nur Tonhöhe, Cutoff, Lautstärke und Pan. Alle anderen Routen sind schraffiert „nur mit Worklet“ (`routeActive`).
   - Global-Routen über AudioParams wirken auch nativ.
7. **Locks** (V5b/V5c) dürfen jeden Block- und Anschlag-Pfad als Ziel nehmen (Lock-Liste [mehr ▾]).
8. **Regel MOD-R1 (EN-21, gilt ab V5d für jedes spätere Paket):** Jedes spätere Paket trägt seine neuen stetigen Regler in `MODT` ein (Pfad, Bereich, Skala, Klasse, Anzeige-Name, Rückfall). Das Abdeckungs-Skript aus V5d-01 läuft in jedem Folgepaket mit und muss 100 % ergeben; neue Ausnahmen nur benannt und mit Grund. Betroffen sind mindestens VK, V6, V7b–V7d (Master-Regler), V8a/V8b (`mask.*`), V9a–V9c (`add.*`, `body.*`) und V10.
   - V4 liegt vor V5d: V5d nimmt die `fmx`-Pfade aus Punkt 1 gleich mit auf.

**Nicht-Umfang.** Lockbare Mod-Tiefe, Spur-Locks (§18). Modulation von Tempo und Swing. Neue Quellen außer G-LFO, Kit-LFO, MAKRO und Zufall je Takt.

**Berührungspunkte.**
- Worklet: Ziel-Tabelle, Summe je Block für alle Block-Ziele, Neuberechnung der Koeffizienten, Mod-Tiefe
- `MOD_DST` bzw. `MODT`, `setMod`, `normalizeSound` (`m.path`)
- Picker (Filter nach Klasse), `pageMod` und Stränge
- Drum-Schlag-Pfad (`DrumSeq.lockParams`, `drumHit`: Anschlag-Routen)
- Bus-Graph (GainNode-Ketten), MIX-Kopf (MAKRO 1/2)
- CPU-Begrenzer, `routeActive`

**Dauer** 5 h · **App-Version** 4.20.0 · **Budget** +45 KB.

**Abnahme-Checkliste**
- [ ] V5d-01 Halte-Abdeckung: Ein Skript zählt alle stetigen Regler (DOM `data-key`, laut `MODT` stetig) in Synth-Editor (VA, FM mit DX-Seite **und FELD**, WT), Drum-Editor (KLANG, TIEFE, KLANG-Seite eines Synth-Pads), FX, HALL, ECHO, MASTER und MIX. Jeder öffnet nach 450 ms den Picker (100 %). Die Ausnahmen stehen benannt im Skript. Das Skript ist so gebaut, dass Folgepakete es unverändert mitlaufen lassen (MOD-R1).
  - Ein FM-Klang mit 8 Operatoren im FELD: `modTargets(t)` enthält für jeden Operator A–H `ol`, `r1…r4`, `l1…l4` und `fbAmt` sowie für jede Kante `fmx.edge.<von>-<nach>.amt`.
- [ ] V5d-02 H-1 je Ziel.
  - **Testklang „Alles an“:** VA mit allen Oszillatoren hörbar, Unison 3, Rauschen 10 %, Filter-Hk 24 HT, Drive 20 %; FM mit allen 6 Operatoren hörbar; WT mit Scan 0,5.
  - **Vergleich:** LFO 1 Dreieck 2 Hz, Tiefe 100 %, gegen dieselbe Messung ohne Route.

  | Klasse | Messung |
  |---|---|
  | Block | H-1 innerhalb einer 2-s-Note. Hüllkurven-Zeiten: über 8 Noten verteilt auf eine LFO-Periode, Spanne der M-AUS ×2. |
  | Anschlag | über 8 Anschläge mit Zufall 100 % |
  | Global | über 2 Takte mit G-LFO 0,5 Hz |

  - **Ausnahmen:** nur mit Grund in CHANGES und für höchstens 10 % der Ziele (z. B. Breakpoint nur mit Noten auf beiden Seiten).
- [ ] V5d-03 M-CPU: 4 Spuren × 8 Block-Routen (zufällige Ziele, LFO 5 Hz, Tiefe 50 %), 8 Stimmen je Spur → höchstens Last ohne Routen + 3 Prozentpunkte (Xeon).
- [ ] V5d-04 M-KLICK besteht für LFO 8 Hz mit Tiefe 100 % auf Amp-Attack, Amp-Decay, FM R1–R4, Hall-Decay und Echo-Feedback.
- [ ] V5d-05 Global:
  - G-LFO 1 → Hall-Decay ist hörbar (M-AUS der Fahne über 2 Takte ×1,5).
  - Die 9. Global-Route wird abgewiesen.
  - Nach ■ und Projektwechsel bleibt keine GainNode-Kette zurück (gleiche Knotenzahl vorher und nachher).
- [ ] V5d-06 Mod-Tiefe: Hk 2 (D 1 s) → Tiefe von LFO 1 → Cutoff. Die Schwankung von M-SP in 0–200 ms ist ≥ 2× so groß wie in 1,0–1,2 s.
- [ ] V5d-07 Drums:
  - Kit-LFO 1 (1/4) → KICK TON, Anschlag-Klasse: 8 Schläge zeigen ≥ 4 verschiedene Grundfrequenzen.
  - Zufall je Schlag → HH DECAY: Spanne der M-AUS ×2.
  - Mehrlast im Drum-Groove ≤ +0,5 Prozentpunkte.
- [ ] V5d-08 CPU-Begrenzer:
  - `cpuInject(.65, 3)` → Block-Ziele außer Tonhöhe, Cutoff und Lautstärke nur jeden 4. Block (`__modProbe`).
  - `cpuInject(.8)` → Routen über 4 sind grau mit „CPU“.
  - Die Sound-Daten bleiben deep-equal.
- [ ] V5d-09 `forceNative(true)`: Alle Ziele außer Tonhöhe, Cutoff, Lautstärke und Pan sind schraffiert. Global-Routen wirken.
- [ ] V5d-10 Speichern und Laden ergeben deep-equal Daten (`m.path`). Alte Sounds mit `m.dst` klingen bitgleich (Render-Vergleich ≤ 1e-6). MO1–MO49 bestehen.
- [ ] V5d-11 Stränge und Liste zeigen Pfad-Namen. 8 Block- plus 8 Anschlag-Routen passen in P1 und L1 ohne Scrollen (Liste zweigeteilt).
- [ ] V5d-12 Regression und DoD.

**Tests.** `v5d-targets.mjs` (Abdeckung, H-1-Durchlauf, Offline-Render parallel), `v5d-cpu.mjs`, `v5d-global.mjs`.

**Risiken.**
- Der H-1-Durchlauf über ≈ 300 Ziele dauert lange.
- Global-Ziele im Hall-Worklet haben keine AudioParams; Werte je Block müssen nachgerüstet werden.
- Die Ziel-Tabelle vergrößert das Worklet (ASCII-Prüfung).

### A.9 V6 — Ergänzung (N6a)

- [ ] N6a-01 Klangzustände und Morph erfassen alle stetigen Block-Ziele aus `MODT`, auch FM je Operator, WT und VK-Werte. Stufige Werte gelten nach KZ3 ab dem Anschlag. Abnahme: Ein Zustand mit FM OP 2 R2 und WT-Position morpht stetig; `__morphProbe` zeigt Zwischenwerte in ≥ 8 Blöcken.

### A.10 NEU VK — Klassiker-Bausteine

**Ziel.** Die Klassiker-Vorlagen klingen nach ihrem Vorbild statt nur ungefähr: lebendige Analog-Drift, Minimoog-Wellen, raue Sättigung, Zweipol-Filter mit Notch, Osz.-FM und Ringmod.

**Befund (gemessen, R6-Bibliothek, Node-Offline mit dem App-Worklet):**
- Der Ladder verliert Bass, wenn die Resonanz steigt. Ohne Bass-Ausgleich fällt das Band 45–180 Hz bei Res 0,5 / 0,8 / 0,95 um 8,7 / 11,7 / 12,9 dB. Das ist moogtypisch und bleibt so.
- Der Oszillator ist eine ideale polyBLEP-Rampe.
- Die Drift ist nur ein fester Versatz je Anschlag:
  - ANALOG 0,12 streut 0,57 ct;
  - innerhalb einer Note wandert die Tonhöhe nicht (0,00 ct).
- Der Filter-Drive macht den Klang dunkler und 2–3 dB leiser, aber nicht rau.

**Vorbilder:**
- Minimoog (Moog-Forum, SE):
  - Osz. 1/2 mit Dreieck, Haifischzahn, Säge, Rechteck und zwei Pulsbreiten.
  - Die Säge früher Platinen ist „in der Mitte leicht gebogen“.
- Oberheim SEM (MusicRadar, SE): 2-Pol-Zustandsvariablen-Filter mit stufenloser Blende LP ↔ Notch ↔ HP.
- Nord Lead (eK): Osz.-FM und Ringmod.
- Virus (eK): Sättigung zwischen den Filtern.

**Umfang.** Alle neuen Schlüssel sind neutral bzw. aus, damit Gespeichertes gleich klingt (I-10).
1. **Drift wandernd** `p.walk` 0–1: je Oszillator ein Zufallsweg (Tiefpass 0,05–0,5 Hz) mit Hub ±1 bis ±6 ct. Unabhängig von ANALOG; der Versatz je Anschlag bleibt.
2. **Wellen** „Haifischzahn“ (Mischform Dreieck → Säge) und „Säge gebogen“ (Säge mit leichter S-Krümmung) in der Wellenliste von Osz. 1–3, bandbegrenzt (polyBLEP bzw. BLAMP).
3. **Sättigung nach dem Filter** `p.sat` 0–1 mit Pegelausgleich, auf der DRIVE-Seite.
4. **Filtertyp „SVF 12“:**
   - 2-Pol-Zustandsvariablen-Filter. Regler `p.svfMix` 0–1 blendet LP → Notch → HP.
   - Resonanz bis knapp vor die Selbstoszillation.
   - ⓘ: „Prinzip wie im Oberheim SEM – Marken gehören ihren Inhabern, keine Verbindung.“
   - Der Name enthält bewusst keinen Gerätenamen (E9).
5. **Osz.-FM** `p.ofm` 0–1: Phasenmodulation Osz. 2 → Osz. 1, Index bis 3.
6. **Ringmod** `p.ring` 0–1 als eigener ANTEIL (Osz. 1 × Osz. 2).
7. *(P1)* **Bitcrusher** `p.crush`: Bits 16 → 4, Rate ÷1 bis ÷16, nach dem Filter.
8. Alle neuen stetigen Werte sind Mod-Ziele (`MODT`, V5d, MOD-R1) und können morphen (N6a-01). Nativ steht „nur mit Worklet“ (I-07).
9. *(verschoben nach V10d)* N61/N62 mit `walk` bzw. Haifischzahn: Die Presets gibt es erst in V10d (Gruppe 11), VK liegt in Gruppe 9. Geprüft wird das in V10d-03.

**Nicht-Umfang.** Zweites Filter je Stimme (Virus; kostet CPU), Formant, Kamm/Karplus, Rauschfarben (§18).

**Berührungspunkte.** Worklet (Oszillator-Kern, Filter-Zweig, Stufe nach dem Filter), `PD` und `normalizeSound`, OSZ-, FILTER- und DRIVE-Seiten (neue Regler nur in der Tiefe, L1), `MODT`, Hilfe.

**Dauer** 5 h · **App-Version** 4.27.0 · **Budget** +30 KB.

**Abnahme-Checkliste**
- [ ] VK-01 Alte Sounds klingen bitgleich: Demo und alle Werks-VA-Sounds offline gerendert, max |Δ| ≤ 1e-6 gegen das Vorgänger-Paket.
- [ ] VK-02 Drift:
  - `walk` 0,5, Note 2 s gehalten: Die Standardabweichung der Tonhöhe innerhalb der Note liegt bei 1–6 ct (Nulldurchgänge in 50-ms-Fenstern).
  - `walk` 0 → 0,00 ct.
- [ ] VK-03 Wellen:
  - Haifischzahn bei C3: 2. und 3. Harmonische je −20 bis −8 dB unter dem Grundton, also zwischen Dreieck und Säge.
  - Aliasing bei C7: kein Anteil unterhalb des Grundtons über −60 dB.
  - Säge gebogen: Die 2. Harmonische weicht von der Säge um ≥ 1 dB ab, der Pegel um höchstens ±1 dB.
- [ ] VK-04 Sättigung:
  - Sinus C3 mit `sat` 0 → 1: 3. Harmonische ≥ −30 dB.
  - Säge über LP24 bei 400 Hz: M-SP steigt um ≥ ⅓ Okt.
  - M-PEGEL ändert sich um höchstens ±2 dB.
- [ ] VK-05 SVF 12:
  - LP-Steilheit 11–13 dB je Oktave, gemessen bei 2× und 4× Cutoff **mit Res 0 (Q = 0,707)**. (Die Steilheit hängt von der Resonanz ab: nachgerechnet für einen 2-Pol-Tiefpass 1/(s² + s/Q + 1): Q 0,5 → 10,6, Q 0,707 → 11,8, Q 2 → 13,6 dB/Okt.)
  - `svfMix` 0,5: Pegel bei Cutoff ≥ 20 dB unter dem Durchlassbereich.
  - `svfMix` 1: Hochpass.
  - Res maximal ohne Selbstoszillation: ohne Eingang nach 1 s < −80 dBFS.
  - CPU je Stimme ≤ Ladder.
- [ ] VK-06 Osz.-FM 1:1, `ofm` 0 → 1: M-SP ≥ ⅓ Okt (H-1).
- [ ] VK-07 Ringmod 440 Hz × 660 Hz, **Osz. 1 und Osz. 2 Sinus** (Ringmod allein): Spitzen bei 220 und 1100 Hz höchstens 6 dB unter der stärksten Spitze; 440 und 660 Hz ≥ 20 dB darunter. (Mit Sägen entstehen 440 und 660 Hz aus Obertönen nur etwa 10–12 dB unter 220 Hz; die Grenze wäre dann nicht erfüllbar.)
- [ ] VK-08 *(P1)* Bitcrusher mit 4 Bit: Signal-Rausch-Abstand ≤ 30 dB. Aus = bitgleich.
- [ ] VK-09 CPU (Xeon): VA-Stimme mit allen Bausteinen an ≤ 1,3× der Stimme ohne; alle aus ≤ 1,03×.
- [ ] VK-10 Jeder neue Regler erfüllt H-1 und H-3. Umschalten von Welle und Filtertyp bei klingender Note besteht M-KLICK (Stimmen-Überblendung aus V4a). M-PLATZ der betroffenen Seiten.
- [ ] VK-11 Modulation und Morph:
  - LFO → `svfMix`, `sat` und `ofm` ist hörbar (H-1).
  - Ein Klangzustand fährt `walk` und `sat` stetig.
- [ ] VK-12 Regression und DoD (Worklet-ASCII).

**Tests.** `vk-bausteine.mjs` (Node-Offline), `vk-ui.mjs`.

**Risiken.** Mehr Code im Worklet-Kern (ASCII, Größe); die CPU am iPhone ist ungemessen.

### A.11 V8a und V9b — Ergänzungen

- **N8a-01 Schalter „Stufen │ Glatt“** am Tabellen-Oszillator (`osc.step`):
  - „Stufen“ = keine Überblendung zwischen Nachbar-Tabellen (Charakter der PPG-Stufen). Gewechselt wird am Periodenanfang.
  - [ ] Abnahme: Positionsfahrt 0 → 1 über 2 s.
    - „Stufen“: ≥ 8 getrennte M-SP-Plateaus (Sprünge ≥ 0,05 Okt, dazwischen ≤ 0,01 Okt).
    - „Glatt“: kein Sprung > 0,05 Okt.
    - M-KLICK besteht in beiden Stellungen.
- **N9b-01 KLANGKÖRPER-Vorlage „Klavier“** nach dem Prinzip getrennter Teiltongruppen. Vorbild: Manny Fernandez, FM-X-Klavier, Artikelreihe „FM-Xpert“ (SE).
  - Vier benannte Gruppen in `p.body`: Körper, Obertöne, Hammer, Anschlaggeräusch. Jede hat eine eigene Hüllkurve.
  - [ ] Abnahme: Das Stummschalten einer Gruppe ändert ihr Band (M-BAND) um ≥ 3 dB.
  - Xanders Resynthese-Dokument (I6) fehlt noch. Änderungen daraus kommen erst nach Eingang (Frage E.2).

### A.12 V10 — Ergänzungen, NEU V10d und V10e

**N10a (zu V10a)**
- **Ansicht nach EN-04:**
  - Kopf [FM ▾ │ Alle Engines], darunter die Rollen-Chips der Engine.
  - Tiefe-Zeile: `Stil ▾ Vorbild ▾`. Der Engine-Filter steht vorn, nicht in der Tiefe.
- **Daten:**
  - `info.tags = [{k:'vorbild'|'geraet'|'genre', id, beleg:'b'|'s'|'e'|'u'}]`
  - Eine Tabelle `VORBILD` mit den Anzeigenamen, **wörtlich aus `r6/bibliothek-recherche.md` §11**: Gruppe 1 = Xanders 16 Namen (Depeche Mode, a-ha, Alphaville, OMD, The Human League, New Order, Kirlian Camera, And One, Second Decay, Project Pitchfork, Spock, Elegant Machinery, Welle:Erdball, The Frozen Autumn, Static Movement, The Midnight), Gruppe 2 = 6 weitere Retrowave-Vertreter (Kavinsky, Timecop1983, Gunship, FM-84, Carpenter Brut, Perturbator), Gruppe 3 = 5 Vorbilder aus Werks-Texten und A.1 (Erasure, Giorgio Moroder, Vangelis, Jean-Michel Jarre, Enigma). **„I Hate Berlin“ und „proWIN“ sind ausdrücklich ausgenommen** (E.1).
- **Vorbilder** stehen nur im ⓘ-Text und im Filter, nie im Namen (E9). Jeder ⓘ-Text mit Vorbild trägt:
  - den Satz „Marken gehören ihren Inhabern, keine Verbindung.“;
  - den Belegstatus: „belegt (Quelle)“, „schwach belegt“, „Einschätzung“ oder „unbelegt“.
- **Tags für die vorhandenen Werks-Sounds** laut **R6-Tabelle Tags** (`r6/bibliothek-recherche.md` §6) und Anhang A.1; Vorbild-Kennungen nach §11.
- [ ] N10a-01 Die Rollen-Chips gelten innerhalb der Spur-Engine; N0b-01 bleibt erfüllt. [Alle Engines] zeigt alle Sounds mit Kennzeichen.
- [ ] N10a-02 Der Vorbild-Filter „Depeche Mode“ liefert genau die Sounds mit diesem Tag (Vergleich mit den Daten). Jeder gefilterte Sound zeigt im ⓘ den Pflichtsatz und den Belegstatus.
- [ ] N10a-03 Kein Sound- oder Kit-Name enthält einen Künstler-, Titel- oder Gerätenamen (Prüfliste A.4 plus A.13, geprüft auf **ganzen Wörtern** wie `r6/n6/doppel-check.mjs`; „Ensemble-Streicher“ und „Nordlicht-Wellen“ sind keine Treffer).

**N10b (zu V10b)**
- [ ] N10b-01 A.1 #4 „Fjord-Bass“ ohne 16-Hz-Falle (EN-03): M-TIEFSTER bei C2 ≥ 60 Hz, M-HANDYrel bei C2 ≥ −16 dB.
- [ ] N10b-02 Die Umbenennung „Pop-Bass DX“ → „Pop-Bass FM“ (A.4) übernimmt die in V0d nachgestimmten Werte; `loadPreset(t, 'Pop-Bass DX')` lädt „Pop-Bass FM“.

**N10c (zu V10c):** Menü → Lernen bekommt die Gruppe „Helden-Sounds nachbauen“; gefüllt wird sie in V10e. Sonst ändert sich nichts.

#### NEU V10d — Vorbild-Paket

**Ziel.** Die Bibliothek bietet die Klänge von Xanders Vorbildern als eigene, markenfreie Presets, filterbar nach Vorbild: 80er-Synthpop, Dunkel und kalt, Retrowave, Brot und Butter, Klassiker-Charakter, Effekte.

**Umfang.**
- **Die 76 Presets N01–N76** aus `r6/bibliothek-recherche.md`, **R6-Tabellen A–G**. Parameter wörtlich aus `r6/n6/rezepte76.json` (VA, WT, FM6; Ergänzungsregel dort §12.2); die vier Kits auf Makro-Ebene, Rohwerte nach V1a/Anhang B.4. Zuordnung N71–N76 laut R6-Tabelle G, Rollen nach EN-18.
  - Ausgenommen sind die schon in V0d gebauten: N63–N70, ggf. auch N71–N76.
  - Rezepte, gemessen [g]: `r6/mess/rezepte.out`, `effekte.out`, `tropfen.out`, `pfeifstart.out`, `drive-gate.out`, `r6/n6/pfeif-n71.out`.
- **N61 und N62 mit den VK-Bausteinen** (aus VK Punkt 9 hierher verschoben): N61 „Haifisch-Lead“ nutzt Osz. 1 „Haifischzahn“ statt Dreieck + Säge, N62 „Kaskaden-Bass roh“ zusätzlich `walk` 0,3. Ihr ⓘ-Vermerk „Annäherung“ entfällt.
- **N66 heißt „Funk-Stich FM“** (falls nicht schon in V0d gebaut). A.1 #13 „Synthex-Streicher“ wird in V10b umbenannt (A.13).
- **Je Preset:** Rolle, Stil, `info.tags` mit Belegstatus und eine eigene Hörprobe (§12.3; ≤ 8 s, eigene Melodie).
- **N27** bringt einen ⧉-Clip mit (1/32-Muster, Start NOTE).
- **Vier Drum-Kits** als ev3-Kits: N09, N14, N42, N43. Das Pad 9 in N43 ist ein Synth-Pad nach V1d.
- **Klassiker-Gruppe E** (N55–N62) mit den VK-Bausteinen. N59 nutzt SVF 12.
- **Korrekturen:**
  - N39: Filter-Drive 10 %, Spur-Drive 70 % [g].
  - N49: LFO auf Lautstärke −100 % [g].

**Nicht-Umfang.** Original-Riffs oder Samples (§12; Rechtliches in `r6/bibliothek-recherche.md` §5); Demo-Songs (V10e).

**Berührungspunkte.** `SQ_FACTORY` (kompakt kodiert), `info.tags`, Phrasen, Kits, ⧉.

**Dauer** 5 h · **App-Version** 4.36.0 · **Budget** +110 KB.

**Abnahme-Checkliste**
- [ ] V10d-01 Alle Presets sind vorhanden (Anzahl = 76 minus die in V0d gebauten), jedes mit `role`, `style`, `aud` (≤ 8 s) und `info.tags` mit `beleg`.
- [ ] V10d-02 Phrase −18 ± 3 LUFS (trocken), PR1 und PR8 bestanden. Kits: DR1 und PR8, Spitzenwerte wie V1c-02.
- [ ] V10d-03 Die gemessenen Rezepte [g] zeigen ihre Trick-Wirkung im Vergleich an gegen aus. Gemeint sind u. a. N01, N02, N07, N13, N34, N39, N49, N62, N71, N73, N75. Die Werte weichen höchstens 25 % von `r6/mess/*.out` bzw. `r6/n6/*.out` ab, gemessen auf der App-Kette. Dazu die VK-Tricks (aus VK Punkt 9):
  - N61 mit Haifischzahn gegen Dreieck + Säge: 2. und 3. Harmonische liegen je −20 bis −8 dB unter dem Grundton (wie VK-03).
  - N62 `walk` 0,3 gegen 0: Standardabweichung der Tonhöhe innerhalb einer 2-s-Note 1–6 ct gegen 0,00 ct (wie VK-02).
- [ ] V10d-04 Der Vorbild-Filter (N10a) findet für **jedes Vorbild der Tabelle VORBILD** (`r6/bibliothek-recherche.md` §11, Gruppen 1–3) ≥ 1 Sound. Rund 170 Sounds tragen Tags.
- [ ] V10d-05 Die Namensprüfung nach A.4 und A.13 besteht. CHANGES vermerkt je Hörprobe „eigene Melodie“.
- [ ] V10d-06 Budget ≤ +110 KB; Startzeit-Abnahme bestanden.
- [ ] V10d-07 Regression und DoD.
- [ ] V10d-08 Doppelten-Check gegen Werk und Anhang A.1 (`r6/n6/doppel-check.mjs`, auf den Stand nach V10d angepasst):
  - keine zwei gleichen Namen über Werk, A.1 und N01–N76;
  - kein Ganzwort-Treffer der Prüfliste (A.4 + A.13 + VORBILD);
  - Paare mit VA-Rezept-Distanz < 0,05 oder gleichem `fm6` (heute: N22/N45, N36/Zweipol-Brass, N62/Kaskaden-Bass, N13/N19, N38/Zinken-Piano) sowie die inhaltlich nahen Paare N27/A.1 #35, N26/A.1 #26, N08/A.1 #22 bleiben nur, wenn ihre Trick-Messung einen Unterschied zeigt (V10d-03, ≥ 1 Maß aus H-1); sonst wird eines gestrichen oder als Variante gekennzeichnet. CHANGES listet die Entscheidung je Paar.

**Risiken.**
- Die Presets sind nicht angehört; Xanders Hörtest einplanen.
- Manche Vorbild-Belege sind schwach; das zeigt die Kennzeichnung.

#### NEU V10e — Genre-Demos und Helden-Lektionen

**Ziel.** Neun fertige Demo-Songs zeigen, wie die App in jedem Genre klingt. Sechs Lektionen bauen Helden-Klänge Schritt für Schritt nach. So wird die App zum Lerninstrument (Xander I5).

**Umfang.**
1. **9 Demo-Songs** nach `r6/bibliothek-recherche.md` §7 (Instrumente, Drum-Muster, Akkorde A/B, Aufbau je Genre):

   | Genre | Tempo | Tonart |
   |---|---|---|
   | Industrial | 112 BPM | d-Moll |
   | Electro/EBM | 126 BPM | a-Moll |
   | Cold Wave | 128 BPM | e-Moll |
   | New Wave | 136 BPM | D-Dur |
   | Synthpop | 118 BPM | a-Moll |
   | Electropop | 122 BPM | f-Moll |
   | Future Pop | 136 BPM | d-Moll |
   | Darkwave | 104 BPM | h-Moll |
   | Retrowave | 104 BPM | a-Moll |

   - Jeder Song hat Teil A und Teil B mit je 4 Takten und die Kette A A B B.
   - Instrumente, Muster und Aufbau laut Recherche. Alles sind eigene Melodien und Muster mit Allerwelts-Akkordfolgen (eK).
   - Einstieg: Menü → Projekt → Neu ▾ → [Demo-Song ▸], mit Liste (Genre, Tempo, Tonart).
   - Laden legt ein **neues** Projekt an. Das offene Projekt wird vorher gesichert und nie überschrieben.
2. **6 Helden-Lektionen** mit dem Motor aus V10c (Menü → Lernen → „Helden-Sounds nachbauen“):

   | Lektion | Trick |
   |---|---|
   | Wanderer-Lead | Mod-Rad |
   | Sequenzer-Bass 83 | Filter-Hüllkurve |
   | Weitblick-Fläche | Aufblühen |
   | Tropfen-Plopp | Tonhöhen-Hüllkurve |
   | Torgitter-Fläche | LFO auf Lautstärke |
   | Pfeif-Rampe | Selbstoszillation |

   - Jede beginnt bei INIT Analog. Das Ziel ist das Rezept aus V10d bzw. V0d.
   - ⓘ mit Vorbild-Pflichtsatz. Die Ziel-Phrase ist eine eigene Melodie.

**Dauer** 5 h · **App-Version** 5.0.0 · **Budget** +60 KB.

**Abnahme-Checkliste**
- [ ] V10e-01 Die Liste zeigt 9 Demos. Jedes lädt als neues Projekt; das vorige Projekt bleibt gespeichert und deep-equal.
- [ ] V10e-02 Jedes Demo:
  - Die Kette A A B B spielt 16 Takte ohne Konsolenfehler.
  - `songKey()` ergibt die angegebene Tonart, das Tempo stimmt.
  - Jede Spur hat RMS > −40 dBFS in dem Teil, in dem sie spielt.
- [ ] V10e-03 Jedes Demo liegt nach [MASTERN] (V7) bei −14 ± 2 LUFS integriert, True Peak ≤ −1 dBTP.
- [ ] V10e-04 Jedes Demo ist kompakt kodiert höchstens 5 KB groß.
- [ ] V10e-05 Die 6 Lektionen lassen sich per Skript durchspielen (wie V10c-02). [Ziel] und [Meins] liegen innerhalb ±1 LU.
- [ ] V10e-06 Das Ergebnis jeder Lektion erfüllt die Trick-Messung ihres Ziel-Rezepts, z. B.:
  - Wanderer-Lead: M-SP mit Mod-Rad an gegen aus ≥ 1 Okt;
  - Tropfen: wie V0d-15.
- [ ] V10e-07 Die Karte überdeckt keinen Regler (V10c-06) in P1–P3, L1, L2. Regression und DoD.

### A.13 Korrekturen an Anhängen, §15, §17, §18, §19

- **A.1 #4 „Fjord-Bass“:** „Ausgang ×0,5 + Transponieren −12“ wird zu „Ausgang ×1, Transponieren 0“ (EN-03).
- **A.1 #13 „Synthex-Streicher“** heißt neu „Eiszeit-Streicher“ (Umbenennung in V10b, Alias bleibt). Grund: „Synthex“ steht ab jetzt auf der Prüfliste (gefunden mit `r6/n6/doppel-check.mjs`).
- **A.4, Prüfliste V10b-04, ergänzt um:**
  - Gerätenamen: „Microwave“, „Blofeld“, „Waldorf“, „Access“, „Clavia“, „Oberheim“, „SEM“, „Source“, „DMX“, „Emulator“, „Synthex“, „PPG“, „Kawai“, „Solina“, „Mellotron“, „Minimoog“, „Kodamo“, „EssenceFM“, „Montage“, „FM-X“;
  - alle Anzeigenamen der Tabelle `VORBILD` (`r6/bibliothek-recherche.md` §11).
  - **Geprüft wird auf ganzen Wörtern** (Trenner Leerzeichen und Bindestrich, „OB-“ als Wortanfang). Eine reine Teilstring-Prüfung meldet fälschlich „Ensemble-Streicher“ (⊃ „SEM“) und „Nordlicht-Wellen“ (⊃ „Nord“).
  - Nähe zu Marken außerhalb der Liste wird im Bau mitgeprüft; heute betroffen: „Klavinett“ (nach eK nahe der Hohner-Marke „Clavinet“, unsicher) → N66 heißt „Funk-Stich FM“.
- **E3-15** (höchstens 2 Synth-Pads) wird ersetzt durch EN-08.
- **§12.2** (Engine nur als Filter in der Tiefe) wird ersetzt durch EN-04.
- **§12.2 Rollenliste** wird ersetzt durch EN-18: Bass · Sequenz · Lead · Akkord · Fläche · Keys · Atmo · Effekt · Glocke (nur FM) · Drums · Init. Der Chip [Alle] heißt im Engine-Filter „Alle <Engine>“. Abbildung der heutigen Kategorien wie §12.2, dazu: `glocke` → Glocke (FM), der Werks-„Tropfen“ → Effekt. Prüfungen in V10a (V10a-Tests mit der Rollenliste) nehmen diese Liste.
- **§5.1 85-%-Regel** wird ersetzt durch EN-07.
- **§15.2 CPU-Begrenzer:**
  - „Synth-Pads Poly 1“ wird zu „≤ 4 Synth-Pad-Stimmen“ (V1d).
  - Dazu kommen die Mod-Stufen aus V5d.
- **§15.3** Grenze 3,0 MB → 4,0 MB (EN-17); die Budgets stehen in C.4.
- **§17, Regeln für alle Folgepakete:** VL-R1 (ab VC2a), MOD-R1 (ab V5d), PAD-R1 (ab V1d) gelten wie Abnahmepunkte des jeweiligen Pakets (EN-21).
- **§17.0** Reihenfolge, Abhängigkeitsbild, Versionstabelle und Summen → Teil C.
- **§18 „Nicht in v3“, gestrichen, weil jetzt in v3:**
  - „Klang“: Ringmod, *(P1)* Bitcrusher, wandernde Drift, Sättigung nach dem Filter, SVF-Filter, Osz.-FM (VK); „Klassiker-Instrument-Vorlagen“ als Presets (V10d);
  - „Plattform“: „Zusammenarbeit über `db`“ (VC1, VC3).
  - Alles andere in §18 bleibt.
- **§13 Stimme:** Ort und Tor stehen in VS (Teil B).
- **§19:** neue Fragen in Teil E.

---
## Teil B — Neue Plattform-Pakete

### B.0 Gemeinsame Regeln für VC1–VC4

- **Fähigkeiten deklariert der Orchestrator beim Veröffentlichen.**

  | Paket | kommt hinzu |
  |---|---|
  | VC1 | `user:{scopes:['profile']}` und `db:{rules:[…]}` (Regeln wörtlich in VC1) |
  | VC3 | `room:{topics:{…}}` und die `db`-Regel `{ path:'live', read:'view', write:'admin' }` |
  | VC4 | `sample` |
  | alle | `downloads` wie bisher |

  - **Regel EN-19 (Summe):** Jede Veröffentlichung **lässt `capabilities` weg** (die vorhandene Deklaration bleibt) **oder übergibt die vollständige Summe** aller bisher deklarierten Fähigkeiten. Eine Teilangabe wie nur `{room:…}` oder nur `{sample:{}}` ersetzt sehr wahrscheinlich die ganze Deklaration (Lesart der Beschreibung des Artifact-Werkzeugs: „omit the field to keep what the page has, and {} clears it“; nicht getestet). Dann wären `user`, die `db`-Regeln und `downloads` weg, und die Gemeinschaft erschiene leer.
  - Die Summe steht **wörtlich** in `CHANGES-V3.md` und wird je Paket fortgeschrieben. `downloads` wird in der Form der letzten v2-Veröffentlichung übernommen (die Form ist in den CHANGES-Dateien nicht festgehalten; vor VC1 nachsehen und eintragen).
  - **Summe ab VC3** (mit der Form von `downloads` aus der letzten Veröffentlichung):
    ```js
    capabilities: {
      downloads: { /* wie bisher */ },
      user: { scopes: ['profile'] },
      db: { rules: [
        { path: 'sounds',        read: 'view', write: 'owner' },
        { path: 'sounds/{self}', write: 'interact' },
        { path: 'eingang',       read: 'view', write: 'admin' },
        { path: 'kur',           read: 'view', write: 'owner' },
        { path: 'live',          read: 'view', write: 'admin' },
      ] },
      room: { topics: { takt: 'interact', start: 'interact', traeger: 'interact', zeit: 'interact' } },
      // VC4 zusätzlich: sample: {}
    }
    ```
  - **Nach jeder Veröffentlichung prüfen** (Prüfpunkt in CHANGES, am iPhone oder im Viewer): Die Bibliothek zeigt die Gemeinschaft weiter (gleiche Zahl an Einträgen wie vorher), und `use('db')`/`use('user')` liefern nicht `null`.
  - `assets` wird nicht deklariert (EN-13).
- **Abwesenheit:**
  - `claude.use(x)` liefert `null` oder wirft → die Funktion ist ausgeblendet oder grau mit einer Zeile Grund.
  - Nichts sonst bricht: weder in der Safari-Version noch über einen öffentlichen Link noch abgemeldet noch auf der eigenen Adresse des Artifacts ohne Rahmen (dort gibt es `window.claude`, aber jedes `use()` liefert `null`; Speichern läuft dann über den Safari-Weg, N0a).
  - Jeder Aufruf steht in try/catch.
- **Feste Adresse:**
  - Jede neue Version geht an **dieselbe** Artifact-Adresse.
  - `db` überlebt Neuveröffentlichungen und wird mit dem Artifact gelöscht (`db.d.ts`).
- **Fremde Daten sind Daten:**
  - Fremde Sounds laufen immer durch `SQStore.normalizeSound`.
  - Texte werden nur per `textContent` gesetzt.
  - Gespeichert werden nur IDs, nie Namen, E-Mail-Adressen oder Avatare (`user.d.ts`).
- **Tests:**
  - Playwright erreicht `db`, `room` und `sample` nicht. Jede VC-Suite bringt daher einen Mock für `window.claude.use` mit, eingesetzt per `addInitScript`.
  - Der Mock hat dieselbe Logik wie die Plattform: Pfadregeln einschließlich `{self}`, Fehlercodes laut Typdatei, Laufzeit, Erlaubnis.
  - Die Geräteprüfung durch Xander steht als Prüfpunkt in CHANGES.
- **Info-Seite:** Menü → Info erklärt in 2–3 Zeilen, was geteilt wird und wer es sieht.

### VC1 — Gemeinschafts-Bibliothek (`db` + `user`)

**Ziel.**
- Freunde laden eigene Sounds mit Namen hoch („von David“, „von René“).
- Die Sounds liegen zentral im Artifact. Alle Eingeladenen sehen und laden sie.
- Xander moderiert.

**Machbarkeit (`db.d.ts`, `user.d.ts`):**
- Schreiben dürfen nur der Besitzer und per E-Mail eingeladene Editoren (solange es keinen öffentlichen Link gibt).
- Wer über einen öffentlichen Link kommt, liest nur, und das nur angemeldet.
- Freunde brauchen deshalb eine Einladung mit „Can edit“ (Frage E.6). Laut Claude-Hilfe ist die E-Mail-Einladung auf Pro/Max eine Beta (R6-Recherche Plattform, `r6/i7/`).
- **Ein von außen eingeladener Editor schreibt, hat aber eventuell keine `id`** (`user.d.ts`). Genau das sind David und René bei einem Pro/Max-Konto. Ohne `id` gibt es keinen Teilbaum `sounds/{self}`. Für sie gibt es den **Eingang** (unten).
  - `db.d.ts` rät bei `id` null, eine Funktion für den eigenen Teilbaum abzuschalten, statt ihre Daten an einen gemeinsamen Pfad zu verlegen. Der Rat zielt auf private Daten je Person. Geteilte Sounds sind ohnehin für alle bestimmt; was fehlt, ist nur die prüfbare Autorschaft. Deshalb tragen Eingangs-Sounds die Kennzeichnung „unbestätigt“.

**Regeln und Daten** (Teil der Summe nach EN-19, B.0)
```js
capabilities: { user: { scopes: ['profile'] }, db: { rules: [
  { path: 'sounds',        read: 'view', write: 'owner' },   // alle Zugelassenen lesen; nur Xander ändert Fremdes
  { path: 'sounds/{self}', write: 'interact' },              // jeder mit id schreibt nur seinen eigenen Teilbaum
  { path: 'eingang',       read: 'view', write: 'admin' },   // Eingang für Editoren ohne id()
  { path: 'kur',           read: 'view', write: 'owner' }    // Xanders Kuratierung (Ausblenden, Empfehlen)
] } }
```
- **Autor `sounds/<uid>`:** `{anzeige, upd, items:[{id, name, engine, role, tags, erstellt}]}`.
  - `anzeige` ist ein selbst eingegebener Spitzname mit höchstens 24 Zeichen.
  - `items` ist der **Index** der eigenen Sounds (≈ 150 B je Eintrag; höchstens 500 Einträge ≈ 75 KB, also unter 256 KiB). Die Bibliothek baut ihre Liste allein aus den Autor-Dokumenten.
  - **Kein Zähler** (das frühere Feld `n` entfällt): Zähler per Lesen-Ändern-Schreiben sind laut `db.d.ts` unzuverlässig (letzter Schreiber gewinnt, doppelte Anwendung bei Wiederholung).
- **Sound `sounds/<uid>/s/<id>`:** `{name, engine, role, tags[], json, probe:{bpm, notes ≤ 64}, kurz ≤ 140, fmt:4, erstellt}`; nach [Übernehmen] aus dem Eingang zusätzlich `von` (Spitzname) und `unbest:true`.
- **Eingang `eingang/<zufalls-id>`** (die `id` vergibt `collection('eingang').doc()`): `{anzeige, name, engine, role, tags[], json, probe?, kurz?, fmt:4, erstellt}`. Höchstens 8 KB.
- **Kuratierung `kur/liste`:** `{aus:[Pfad…], tipp:[Pfad…]}`.
- Wer der Autor ist, ergibt sich aus dem **Pfad** (bei `sounds`). Im Eingang ist der Autor nur der selbst eingegebene Spitzname. Profilnamen werden nie gespeichert.
- **Größen:**
  - ein Sound 1,3–2,6 KB roh, gemessen (R6-I7);
  - Grenzen: 256 KiB je Dokument, 25 000 Dokumente je Artifact, dazu eine nicht bezifferte Gesamtgröße (`quota_exceeded`).
- **Lesen:**
  - Ein Abo auf die Sammlung `sounds` (Autor-Dokumente mit `items`) und ein Abo auf `kur/liste`: **2 Abos**.
  - Beim Öffnen der Bibliothek dazu **eine** Abfrage `collection('eingang').orderBy('erstellt','desc').limit(100).get()`.
  - Der volle Sound kommt erst beim Tipp: **ein** `get` auf `sounds/<uid>/s/<id>` bzw. `eingang/<id>`.
  - Höchstens 64 Abos je Ansicht sind erlaubt; zu viele Aufrufe je Betrachter ergeben `resource_exhausted`.
- **Anzeige „von <Name>“:** bei `sounds/<uid>`: `user.profiles(uids)` → `name`; sonst `anzeige`; sonst „Jemand“. Bei Eingang und `unbest`: nur `anzeige`, mit dem Zusatz „unbestätigt“.

**Bedienung**
- **Bibliothek:** neuer Quelle-Filter [Meine │ Werk │ Gemeinschaft]; der Engine-Filter (EN-04) gilt weiter.
  - Zeile: `[▶] Name … von David · FM ⓘ [⋯]`; Eingangs-Zeilen: `… von David · unbestätigt`.
  - Tipp lädt stumm (E3-23). ▶ spielt die Hörprobe lokal (JSON und Phrase).
  - ⋯ → [In meine Sounds] kopiert den Sound mit Herkunft `von`. Xander hat zusätzlich [Ausblenden] und [Löschen], bei Eingangs-Zeilen [Übernehmen].
- **[Übernehmen] (nur Xander, `isOwner()`):** kopiert `eingang/<id>` nach `sounds/<ownerUid>/s/<id>` mit `von: anzeige` und `unbest:true`, ergänzt danach seinen Index `items`, löscht danach `eingang/<id>`. Die drei Schreibzugriffe laufen **nacheinander** (jeweils `await`). Dieselbe `id` macht den Vorgang wiederholbar: Eine Eingangs-Zeile, deren `id` schon in Xanders `items` steht, wird nicht mehr gezeigt.
- **Teilen:** eigener Sound → ⋯ → [Teilen ▸]. Das Blatt enthält:
  - Name;
  - Rolle (vorgeschlagen);
  - Chips für Stil und Vorbild;
  - Hörprobe (der aktuelle Clip, optional);
  - Häkchen „Alle Eingeladenen sehen und nutzen diesen Sound“;
  - [Hochladen].
- **Freischaltung:** `user.can('data.write')` → `false`: [Teilen] grau mit „nur lesen“. `null` (Gast von außen, Seite ohne Rahmen): [Teilen] bleibt, die Antwort auf den Schreibversuch entscheidet. `id()` vorhanden → Ziel `sounds/<id>`; `id()` `null` → Ziel Eingang.
- **Hochladen** (mit `id`): `set` auf `sounds/<id>/s/<sid>`, danach das Autor-Dokument: frisch lesen, `items` nach `id` zusammenführen, `set`. **Je Dokument immer nur ein Schreibzugriff zur Zeit**; die zwei Schritte laufen nacheinander. Beim Öffnen von „Meine geteilten“ gleicht die App den Index einmal mit `sounds/<id>/s` ab (eine Abfrage) und repariert ihn bei Abweichung (z. B. nach zwei offenen Tabs).
- **Hochladen** (ohne `id`): ein `set` auf `eingang/<neue id>`.
- **Fehler beim Schreiben** (Codes laut `db.d.ts`; unbekannte wie `unavailable`):

  | Code | Verhalten |
  |---|---|
  | `unavailable` | einmal nach 0,5–2 s (zufällig) wiederholen; scheitert auch das, in die lokale Warteschlange (IndexedDB) |
  | `resource_exhausted` | zurückstellen: Warteschlange, nächster Versuch frühestens nach 30 s bzw. beim nächsten Öffnen der Bibliothek; keine Schleife |
  | `invalid_argument` (bei korrekt gebautem Aufruf), `revoked` | „nur lesen“ für den Rest des Besuchs; **nicht** in die Warteschlange |
  | `quota_exceeded` | Meldung „Gemeinschaft ist voll – Xander muss aufräumen“ (Text aus der Fehlermeldung, welche Grenze); **nicht** in die Warteschlange |
  | `not_granted`, `capability_disabled`, `capability_removed` | wie `db` abwesend: Quelle „Gemeinschaft“ grau mit Grund |
  | `transform_error` | wie `invalid_argument` |

  In der Warteschlange behält ein Sound seine `id`; ein später gelungener Versuch ergibt kein Doppel.
- **Ohne `db` oder ohne Anmeldung:**
  - [Als Datei teilen] speichert ein Sound-JSON über `downloads` bzw. das Teilen-Menü.
  - Beim Import gibt es ein Feld „von …“.
- **Sicherung:** Xander als Besitzer hat [Gemeinschaft sichern]; es exportiert alle Gemeinschafts-Dokumente (`sounds`, `eingang`, `kur`) als JSON (Schutz, falls das Artifact gelöscht wird).

**Nicht-Umfang.** Textsuche, Bewertungen, Favoriten (später); Kommentare.

**Berührungspunkte.** Bibliothek (Quelle-Filter, Zeilen), Sichern- und Teilen-Blatt, `SQStore.normalizeSound`, IndexedDB-Warteschlange, Menü → Info, Hilfe.

**Dauer** 5,5 h · **App-Version** 5.1.0 · **Budget** +45 KB.

**Abnahme-Checkliste** (Mock für `db` und `user` mit Regel-Logik einschließlich `{self}`, Stufen `view`/`interact`/`admin`/`owner`, `id` null, `can()` true/false/null, Fehlercodes, Größengrenze 256 KiB, Zählung der Aufrufe)
- [ ] VC1-01 Ohne `window.claude` oder mit `use('db') → null`:
  - Die Quelle „Gemeinschaft“ ist grau mit Grund.
  - [Als Datei teilen] erzeugt ein gültiges Sound-JSON.
  - Sonst ändert sich nichts.
- [ ] VC1-02 Hochladen als Nutzer A (mit `id`):
  - Es entsteht genau ein Dokument `sounds/<A>/s/<id>`; das Autor-Dokument enthält in `items` genau einen passenden Eintrag und **kein** Feld `n`.
  - Die Felder folgen dem Schema; Größe ≤ 8 KB.
  - Das Dokument enthält weder Profilnamen noch E-Mail-Adresse (Textsuche).
  - Der Mock sieht nie zwei gleichzeitig offene Schreibzugriffe auf dasselbe Dokument.
- [ ] VC1-03 Nutzer B schreibt nach `sounds/<A>/…`:
  - Der Mock weist ab (`invalid_argument`).
  - Die App zeigt „nur lesen“, stürzt nicht ab, wiederholt nicht und legt nichts in die Warteschlange.
- [ ] VC1-04 Liste mit 3 Autoren × 5 Sounds:
  - 15 Zeilen mit „von <Name>“.
  - Leerer Profilname → `anzeige`; fehlt beides → „Jemand“.
- [ ] VC1-05 Feindliche Daten:
  - Ein Dokument im Mock mit Werten außerhalb der Bereiche, unbekannten Schlüsseln, einem **250-KB-Text** (unter der Grenze von 256 KiB) und dem Namen `<img src=x onerror=…>`.
  - Dazu der **Import einer 300-KB-Sound-Datei** (dort gilt die Grenze des Speichers nicht).
  - Beides wird normalisiert bzw. abgewiesen. Der Name erscheint wörtlich. Beim Abspielen gilt PR1 (kein NaN).
- [ ] VC1-06 Ausblenden und Löschen:
  - Der Besitzer sieht bei fremden Einträgen [Ausblenden] und [Löschen], andere nicht.
  - Ausblenden wirkt für alle (Eintrag in `kur/liste`).
- [ ] VC1-07 Fehlerzuordnung (je Code ein Lauf):
  - `unavailable` beim ersten Versuch → genau eine Wiederholung nach 0,5–2 s; gelingt sie, entsteht genau ein Dokument.
  - `unavailable` zweimal → Warteschlange; der nächste Versuch beim Öffnen der Bibliothek gelingt → genau ein Dokument.
  - `resource_exhausted` → Warteschlange, kein weiterer Versuch innerhalb von 30 s.
  - `invalid_argument` und `revoked` → „nur lesen“, Warteschlange leer, kein weiterer Schreibaufruf in diesem Besuch.
  - `quota_exceeded` → Meldung, Warteschlange leer.
- [ ] VC1-08 Öffnen der Bibliothek mit 50 Autoren und je 10 Sounds: **≤ 2 Abos und ≤ 2 Leseaufrufe** (Zählung im Mock); die Liste zeigt 500 Zeilen. Ein Tipp auf eine Zeile: genau ein weiteres `get`.
- [ ] VC1-09 Tipp auf einen Gemeinschafts-Sound lädt stumm (U-01). [In meine Sounds] kopiert mit `von`.
- [ ] VC1-10 [Gemeinschaft sichern] als Besitzer: Das JSON enthält alle Dokumente aus `sounds`, `eingang` und `kur` (gleiche Anzahl wie im Mock).
- [ ] VC1-11 M-PLATZ für Bibliothek mit Quelle-Filter und Teilen-Blatt in P1–P3, L1, L2.
- [ ] VC1-12 Regression und DoD. CHANGES nennt:
  - die deklarierte **Summe** der Fähigkeiten (EN-19);
  - 3–5 iPhone-Prüfpunkte, darunter ein zweites Konto mit „Can edit“ und, falls möglich, ein Editor von außen.
- [ ] VC1-13 Editor ohne `id` (Mock: `id()` → null, Stufe `admin`, `can('data.write')` → null):
  - [Teilen] ist bedienbar; Hochladen legt genau ein Dokument `eingang/<id>` nach Schema an (Spitzname aus dem Blatt).
  - Ein Schreibversuch nach `sounds/…` findet nicht statt.
  - Alle Betrachter sehen die Zeile „… von <Spitzname> · unbestätigt“.
  - Xander (`isOwner`): [Übernehmen] → `sounds/<owner>/s/<id>` mit `von` und `unbest:true`, Eintrag in seinen `items`, `eingang/<id>` gelöscht; die Schritte nacheinander; die Zeile erscheint genau einmal.
  - Ein Nicht-Besitzer sieht kein [Übernehmen].
- [ ] VC1-14 Freischaltung: `can('data.write')` → false: [Teilen] grau mit „nur lesen“, kein Schreibaufruf. → null: [Teilen] bedienbar; lehnt der Mock mit `invalid_argument` ab, gilt VC1-03.

**Risiken.**
- Eine neue Artifact-Adresse ergibt eine leere Gemeinschaft.
- Eine Veröffentlichung mit nur einem Teil der Fähigkeiten löscht sehr wahrscheinlich die übrigen (EN-19).
- „Can edit“ erlaubt Freunden auch Änderungen am Artifact selbst; das ist Vertrauenssache. Jeder Editor kann auch fremde Eingangs-Einträge ändern oder löschen; deshalb gelten sie als „unbestätigt“, bis Xander sie übernimmt.
- Die Gesamtgröße der Datenbank ist begrenzt (`quota_exceeded`), der Wert ist nicht dokumentiert; belegt ist die Grenze von 25 000 Dokumenten.
- Ob David und René als Editoren von außen eine `id` bekommen, ist erst am Gerät zu sehen (iPhone-Prüfpunkt).

### VC2a — Verlauf-Rekorder (früh, Gruppe V4)

**Ziel.** Die App merkt sich jeden Schritt eines Projekts, damit ein Zeitraffer später zeigt, wie Sound und Song entstanden sind. Aufgezeichnet wird erst ab dem Einbau, deshalb kommt das Paket früh (EN-14).

**Grundsatz:** Ereignisse statt Video. Procreate nimmt dagegen Video auf, spielt es mit 30 fps ab und bietet „Volle Länge“ oder „30 Sekunden“; die kurze Fassung behält die wichtigen Bilder (Procreate-Handbuch, SE).

**Umfang.**
- **Abgriff an `undoPush`, `undo` und `redo`.**
  - Eine Geste ergibt ein Ereignis. Undo und Redo werden als angewendetes Ergebnis aufgezeichnet.
  - Ereignis: `{t, u, z, d, c?, l}`.

    | Feld | Inhalt |
    |---|---|
    | `t` | ms seit Sitzungsbeginn |
    | `u` | Undo-Art |
    | `z` | Ziel (Spur, Slot, Teil …) |
    | `d` | JSON-Patch des betroffenen Teilbaums nach der Geste |
    | `c` | Reglerkurve, 10 Hz, ≤ 50 Werte |
    | `l` | kurze Beschriftung |

  - Dazu kommen Kontext-Ereignisse ohne Datenänderung (`u:'ctx'`): Szenen- und Clip-Starts, Transport, Hand-Träger. Damit weiß der Zeitraffer, was gerade klang.
- **Keyframe** = das ganze Projekt mit `format` und `appVersion`. Geschrieben wird er:
  - nach je 200 Ereignissen;
  - beim Öffnen;
  - nach Import, Migration und Neu.
- **Ablage:**
  - IndexedDB je Projekt (`hist2:<projektId>:<n>`) in Stücken von 30 Minuten.
  - Komprimiert über `CompressionStream('gzip')`, wo vorhanden (iOS ab 16.4, laut MDN-Daten); sonst unkomprimiert.
  - Grenze 20 MB je Projekt. Darüber werden zuerst die Reglerkurven ausgedünnt, dann Ereignisse zwischen Keyframes; Keyframes bleiben.
  - Geschrieben wird gebündelt, höchstens alle 2 s, über `setTimeout` (kein `requestIdleCallback`, I-06).
- **Regel VL-R1 (gilt ab VC2a für jedes spätere Paket):**
  - Jede neue Undo-Art und jede datenändernde Geste ohne Undo-Eintrag meldet ihren Teilbaum beim Rekorder an: `HIST.kind(name, getSubtree)`.
  - Jedes neue Ansichts- oder Laufzeitfeld, das ins Projekt geschrieben wird, aber keine Undo-Geste ist (wie heute `S.ui`), kommt in `HIST.volatile` (N0.4, M-REKON).
  - Abnahme in jedem Folgepaket: Nach dessen Test-Skript ergibt `historyCheck()` den Wert true.
- **Menü → Projekt → Verlauf:**
  - an/aus (Standard an);
  - Größe;
  - [Verlauf dieses Projekts löschen].
- **Projektdatei:** Option [mit Verlauf], Standard aus. Der Import übernimmt einen mitgelieferten Verlauf.
- **Datenmenge** (simuliert, R6-I7):
  - 1 h mit 600–1200 Ereignissen: 16–31 KB gzip, mit Keyframes 27–51 KB.
  - Großes Projekt: 1 h ≈ 182 KB, 10 h ≈ 1,4 MB.

**Nicht-Umfang.** Wiedergabe (VC2b), Video (VC2c), Sicherung in `db`.

**Berührungspunkte.**
- `undoPush`, `undo`, `redo` und alle Undo-Arten (`clip`, `sound`, `song`, `part`, `chain`, `proj`, `group`, Drum, Mix …)
- Transport und Launch (Kontext)
- `SQStore` und IndexedDB
- Hülle der Projektdatei (optionales Feld `history`)
- Menü

**Dauer** 4–5 h · **App-Version** 4.13.0 · **Budget** +30 KB.

**Abnahme-Checkliste**
- [ ] VC2a-01 Skript mit 100 Gesten über alle vorhandenen Undo-Arten (einschließlich `group`), dazu 10× Undo und 5× Redo, **und zwischen den Gesten Spur- und Szenenwahl** (mindestens 20 Wechsel von `selT`/`selS`): Es entstehen genau 115 Daten-Ereignisse, jedes mit `u` und `z`; die Auswahlwechsel erzeugen kein Daten-Ereignis.
- [ ] VC2a-02 M-REKON (ohne die Felder aus `HIST.volatile`, N0.4): `historyCheck() === true`, auch direkt nach einem Auswahlwechsel. Das gilt auch nach Neuladen und nach dem Import eines Format-3-Projekts (Migration → neuer Keyframe). Gegenprobe: Ein Vergleich über das volle `serializeProject` schlägt nach einem Spurwechsel fehl (`S.ui.selT` weicht ab).
- [ ] VC2a-03 Nach 450 Ereignissen gibt es ≥ 3 Keyframes, jeder mit `format` und `appVersion`.
- [ ] VC2a-04 1000 typische Ereignisse (Simulation wie `r6/i7/verlauf-sim.mjs`) belegen ≤ 40 KB (gzip).
- [ ] VC2a-05 Aufzeichnen kostet je Geste ≤ 2 ms im Hauptthread (Median, Xeon). PE1 (§1.3) ist unverändert. Der Rekorder erzeugt keine `longtask` über 50 ms.
- [ ] VC2a-06 IndexedDB wirft oder fehlt: Die App arbeitet normal, das Menü zeigt „Verlauf aus (Speicher nicht verfügbar)“.
- [ ] VC2a-07 Projektdatei:
  - Ohne Verlauf bleibt sie unverändert (Format, Prüfsumme).
  - Mit Verlauf → Import → `historyCheck()` ergibt true.
- [ ] VC2a-08 Ein 2-s-Reglerzug ergibt genau ein Ereignis mit einer Kurve von ≤ 50 Werten.
- [ ] VC2a-09 VL-R1: Die Liste der Undo-Arten der App ist gleich der Liste der beim Rekorder angemeldeten Arten.
- [ ] VC2a-10 Regression und DoD.

**Risiken.** Ein Undo-Weg, der am Rekorder vorbeigeht, bricht M-REKON. Deshalb VL-R1 und der Test in jedem Folgepaket.

### VC2b — Zeitraffer in der App

**Ziel.** Antwort auf „Wie ist mein Song entstanden?“, in 30 s oder in voller Länge, und zwar musikalisch: Der Loop läuft weiter, und die Geschichte springt mit.

**Umfang.**
- **Einstieg:** Menü → Projekt → Verlauf → [▶ Zeitraffer].
  - Wahl [30 s │ 60 s │ voll].
  - Schiebeleiste zum Scrubben, wie bei Procreate.
- **Zeitraffer-Modus:**
  - Er arbeitet auf einer Kopie (Sandkasten).
  - Bearbeiten ist gesperrt; Banner „ZEITRAFFER · Tippen = beenden“. Autosave pausiert.
  - Ende per Tipp, ■ oder Ablauf stellt das echte Projekt deep-equal wieder her. Vorher wird es gesichert (Absturzschutz).
- **Musikalisch:**
  - Es gilt das Tempo des jeweiligen Stands.
  - Der Stand rückt nur am Taktstrich um N Ereignisse vor (L8), nie mitten im Takt.
  - Gewichtung: Struktur-Ereignisse (Clip, Teil, Kette, Song) zählen 4, Noten 2, Reglerbewegungen 1.
  - Bei 30 s wird N so gewählt, dass das Ende nach 30 s erreicht ist; bei 120 BPM sind das 15 Takte.
  - Es klingt, was laut Kontext-Ereignissen zuletzt lief (Szene bzw. Kette), sonst Szene 1.
- **Untertitel (LCD):** die Beschriftung `l` des letzten Ereignisses („Synth 2 · Cutoff 1,2 kHz“) sowie Datum und Uhrzeit des Stands.
- **[Ab hier weiterarbeiten]** legt aus dem gezeigten Stand ein **neues** Projekt an; nichts wird überschrieben.

**Dauer** 4 h · **App-Version** 5.2.0 · **Budget** +30 KB.

**Abnahme-Checkliste**
- [ ] VC2b-01 Ein 30-s-Zeitraffer über einen Verlauf mit 600 Ereignissen endet nach 30 ± 2 s im Endstand (deep-equal mit dem Projekt, ohne `HIST.volatile` wie M-REKON).
- [ ] VC2b-02 Abbruch an beliebiger Stelle: Das echte Projekt ist deep-equal, der Undo-Stapel unverändert.
- [ ] VC2b-03 Scrubben auf 50 %: Der Stand entspricht `historyState(k)`, der Rekonstruktion der ersten k Ereignisse (deep-equal ohne `HIST.volatile`). Bei 10 000 Ereignissen dauert die Suche ≤ 300 ms (Xeon).
- [ ] VC2b-04 Der Stand wechselt nur am Taktstrich (Ereigniszeiten gegen `noteLog`). M-KLICK besteht über den ganzen Zeitraffer.
- [ ] VC2b-05 [Ab hier weiterarbeiten] ergibt ein neues Projekt mit diesem Stand; das alte bleibt unverändert.
- [ ] VC2b-06 M-PLATZ für Verlauf-Blatt und Banner in P1–P3, L1, L2. Regression und DoD.

### VC2c — Zeitraffer als Video (falls machbar)

**Machbarkeit:**
- Die DOM-Oberfläche lässt sich unter iOS nicht filmen, weil `getDisplayMedia` fehlt (MDN-Daten).
- Möglich ist eine eigene Canvas-Bühne:
  - `canvas.captureStream(30)` liefert das Bild;
  - `createMediaStreamDestination` am Master liefert den Ton;
  - beides geht in einen `MediaRecorder`.
- **iOS-WebView** laut MDN-Daten 8.1.5: MediaRecorder ab iOS 14, captureStream ab iOS 11.
- **Formate:** Safari nimmt mp4 auf. WebM erst ab Safari 18.4; das ist nur über eine Drittquelle belegt (SE).
- **Gemessen in Chromium (R6-I7):**
  - 8 s webm (vp8/opus) = 331 KB;
  - Zeichnen 0,5 ms je Bild;
  - Worklet-Last 2,7 → 3,9 %.
- Die Aufnahme läuft in Echtzeit: 30 s Video brauchen 30 s.
- **In der Claude-App ist das ungetestet.** Daher gilt ein Tor: Fehlt dort eine Voraussetzung, bleibt der Knopf mit Grund grau. Das Paket gilt trotzdem als fertig, wenn die Chromium-Punkte bestehen.

**Umfang.**
- **Tor-Prüfung:**
  - Vorhanden sein müssen `MediaRecorder`, `HTMLCanvasElement.prototype.captureStream` und `createMediaStreamDestination`.
  - `MediaRecorder.isTypeSupported` muss einen dieser Typen bejahen; geprüft wird in dieser Reihenfolge: `video/mp4;codecs=avc1,mp4a`, dann `video/webm;codecs=vp8,opus`, dann **`video/mp4` ohne Codecs**.
  - Gemessen in Chromium 141 (`r6/kritik-n1/mr-check.out`): `video/mp4;codecs=avc1,mp4a` = false, `video/webm;codecs=vp8,opus` = true, `video/mp4` = true. Ob WebKit die Kurzform „avc1,mp4a“ annimmt, ist unsicher (kein WebKit hier); ohne die dritte Stufe bliebe der Knopf am iPhone womöglich grundlos grau.
  - Der gewählte Typ steht in CHANGES und im iPhone-Prüfpunkt (VC2c-07); `timelapseVideo()` liefert ihn als `mime`.
  - Sonst ist der Knopf grau: „Video hier nicht möglich“.
- **Bühne 720×1280 (Hochformat):**
  - Kopf mit Projektname und Datum des Stands;
  - Matrix bzw. Kettenblöcke mit den laufenden Slots;
  - die Rolle des zuletzt bearbeiteten Clips; Noten erscheinen, wenn sie entstehen;
  - Reglerringe der geänderten Werte mit Name und Wert;
  - 32 Spektralbalken vom Master-Analyser;
  - Untertitel;
  - Logo (I-03).
- **Speichern** direkt als `.mp4` oder `.webm` über `downloads` (EN-12), in Safari über Teilen bzw. Download. Dateiname „Zeitraffer <Projekt> <TT.MM.>.mp4“.

**Dauer** 4–5 h · **App-Version** 5.3.0 · **Budget** +40 KB.

**Abnahme-Checkliste** (Chromium)
- [ ] VC2c-01 Ein 30-s-Zeitraffer ergibt eine Datei `video/webm` mit 30 ± 2 s Dauer (Container geparst), Bild 720×1280, Ton- und Bildspur vorhanden.
- [ ] VC2c-02 Zeichnen ≤ 4 ms je Bild (Median); ≥ 25 Bilder/s im Rekorder (Bildzähler).
- [ ] VC2c-03 Die Worklet-Last steigt während der Aufnahme um höchstens 3 Prozentpunkte. Am Master gibt es keinen Aussetzer (M-EINBRUCH).
- [ ] VC2c-04 Ton im Video:
  - RMS > −40 dBFS.
  - Versatz Ton/Bild ≤ 100 ms (Klick-Marke am Anfang gegen einen Bild-Blitz).
- [ ] VC2c-05 Viewer-Pfad mit gemocktem `downloads`:
  - `save` mit `.webm` bzw. `.mp4`, nicht `.zip`.
  - Abbruch beendet Rekorder und Spuren; kein `MediaStreamTrack` bleibt offen.
- [ ] VC2c-06 Tor: Ohne `MediaRecorder` (im Test gelöscht) ist der Knopf grau mit Grund. Mit gemocktem `isTypeSupported`, das nur `video/mp4` bejaht, ist der Knopf aktiv und der gewählte Typ `video/mp4`.
- [ ] VC2c-07 Regression und DoD. CHANGES nennt den iPhone-Prüfpunkt: Video in der Claude-App und in Safari, jeweils mit dem gewählten Typ.

### VC3 — Zwei Geräte / Jam (`room`) *(optional)*

**Tor:** Gebaut wird nur, wenn Xander es will (Frage E.7). Zuerst R0, dann R1.

**Grundsatz (E11 der Vision):**
- Es werden Ereignisse ausgetauscht, kein Audio; jedes Gerät erzeugt den Klang selbst.
- Abgemeldete und Besucher über einen öffentlichen Link kommen nicht in den Raum (`room.d.ts`).
- Zwei eigene Geräte mit Xanders Konto funktionieren ohne Einrichtung; das andere Gerät erkennt man an `isMe && !sameTab`.

**Umfang.**
- **R0 Raum-Check** (Menü → Zusammen spielen → Raum-Check):
  - Ping/Pong über das Thema `zeit`, 20 Runden.
  - Anzeige: Rundlauf (Median, p95), Uhr-Abweichung, Schwankung.
  - Weiter zu R1 nur bei einem Median ≤ 150 ms und p95 ≤ 250 ms.
- **R1 Taktsynchron.**
  - **Rollen:** genau ein TAKTGEBER, die anderen sind MITSPIELER. Wünsche eines MITSPIELERs gehen als Nachricht an den TAKTGEBER.
  - **Uhrabgleich:** Der kürzeste Rundlauf zählt.
  - **Zuordnung zur Audio-Zeit:** über `getOutputTimestamp` (iOS 14.5) und `outputLatency` (iOS 18.4), laut MDN-Daten. Dazu ein Regler „Versatz ±50 ms“ und Einklopfen nach Gehör.
  - **Synchronisiert werden:**
    - Transport;
    - Tempo und Taktanker `{bpm, beat, zeitMs}`;
    - Starts von Szenen, Clips und Teilen;
    - Kette;
    - Träger (Rangfolge E3-10);
    - Stumm und Solo.
  - **Starts** gelten immer am nächsten Takt mit ≥ 300 ms Vorlauf, sonst am übernächsten.
  - **Spur-Zuteilung** „Dieses Gerät spielt: …“; die übrigen Spuren sind lokal stumm.
  - **Spätkommer:** Der Stand liegt im `db`-Dokument `live/stand`, geschrieben nur bei Änderung und nur vom TAKTGEBER. Regel `{ path:'live', read:'view', write:'admin' }` (Teil der Summe nach EN-19, B.0). Ein TAKTGEBER unter Stufe `admin` schreibt nicht; Spätkommer warten dann auf den nächsten `takt`-Anker (≤ 2 Takte).
  - **Statusleiste:** „JAM · Taktgeber · 2 Geräte · Versatz 12 ms“.
- **Kanäle:**
  - `room:{topics:{takt:'interact', start:'interact', traeger:'interact', zeit:'interact'}}`.
  - Im Mittel ≤ 10 Nachrichten/s; das Budget von ≈ 40/s teilen sich `emit` und `presence`.
  - Eine Nachricht ist höchstens 4 KiB groß.

**Nicht-Umfang.** Live-Noten aus der Ferne; Projekt-Abgleich (R2, später); Audio-Übertragung.

**Dauer** 5–6 h · **App-Version** 5.4.0 · **Budget** +45 KB.

**Abnahme-Checkliste**

Aufbau: Mock-Raum mit zwei Seiten über BroadcastChannel; Laufzeit (Rundlauf) 30–150 ms einstellbar, Asymmetrie einstellbar (0, fest +20 ms, gleichverteilt ±20 ms; der Mock kennt den Wert), Schwankung ±15 ms je Richtung. Statistische Punkte laufen über 200 Läufe mit festen Startwerten des Zufallsgenerators.

Grundsatz: Eine feste Asymmetrie lässt sich über den Rundlauf nicht erkennen; der Fehler liegt bei etwa Asymmetrie/2, egal welches Verfahren (`r6/kritik-n1/clock-sim.out`). Auch nach Abzug von Asymmetrie/2 bleibt mit 10 Pings und ±15 ms Schwankung ein Rest mit Median 2,2–2,3 ms und p95 7,3–7,4 ms (N0.2b #4). Grenzen für einen Einzellauf wären deshalb Glückssache.

- [ ] VC3-01 Uhrabgleich nach 10 Pings, 200 Läufe je Einstellung:
  - Asymmetrie 0: |Fehler| Median ≤ 3,5 ms, p95 ≤ 9 ms (Simulation: 2,3 / 7,3 ms).
  - Asymmetrie fest +20 ms und gleichverteilt ±20 ms: |Fehler − Asymmetrie/2| Median ≤ 3,5 ms, p95 ≤ 9 ms (Simulation: 2,2–2,3 / 7,4 ms).
- [ ] VC3-02 Szenenstart am TAKTGEBER, **Asymmetrie 0**, 50 Starts über verschiedene Läufe: Beide Seiten starten immer im selben Takt. Die Startzeiten liegen, auf die gemeinsame Wanduhr umgerechnet, im p95 höchstens 10 ms auseinander, im Median höchstens 4 ms.
- [ ] VC3-03 Ein Startwunsch weniger als 300 ms vor dem Taktstrich gilt auf beiden Seiten am übernächsten Takt.
- [ ] VC3-04 Tempowechsel: Beide Seiten haben ab dem nächsten Takt das neue Tempo; Phasenfehler ≤ 10 ms über 8 Takte.
- [ ] VC3-05 Ein Träger am TAKTGEBER ergibt ab dem nächsten Takt auf beiden Seiten denselben `runtime().carrier`.
- [ ] VC3-06 Spur-Zuteilung: Die Spuren des anderen Geräts sind lokal stumm (RMS < −70 dBFS) und in der Matrix markiert.
- [ ] VC3-07 Ein Spätkommer liest `live/stand` und ist innerhalb von 2 Takten synchron.
- [ ] VC3-08 Der TAKTGEBER geht: Der MITSPIELER spielt weiter und bekommt einen Hinweis mit [Taktgeber werden].
- [ ] VC3-09 Über 60 s ≤ 10 Nachrichten/s im Mittel; keine Nachricht über 4 KiB.
- [ ] VC3-10 Ohne `room` ist der Menüpunkt grau mit Grund.
- [ ] VC3-11 Regression und DoD. iPhone-Prüfpunkte:
  - zwei eigene Geräte;
  - Kopfhörer mit Kabel;
  - Flam-Test mit der Kick: Ein Versatz über 15–20 ms klingt wie ein Flam (eK).

- [ ] VC3-12 Versatz-Regler: Mit bekannter Asymmetrie fest +20 ms und dem Regler „Versatz ±50 ms“ auf 10 ms in Gegenrichtung (gleicht Asymmetrie/2 aus) gilt über 200 Läufe |Fehler| Median ≤ 3,5 ms, p95 ≤ 9 ms (wie bei Asymmetrie 0). Der Regler wirkt ab dem nächsten Takt, ohne Klick (M-KLICK).
**Risiken.**
- Die echte Latenz in der iOS-App ist unbekannt; 30–150 ms Rundlauf sind eine Annahme (eK).
- Die Bildschirmsperre pausiert die App.
- Eine neue Version heißt Neuladen, und der Raum leert sich.
- Bluetooth-Kopfhörer bringen +150–250 ms (eK).

### VC4 — KI-Helfer (`sample`) *(optional)*

**Tor:** Xander stimmt zu, dass
- Anfragen über **seine** Claude-Nutzung laufen;
- ein Artifact mit `sample` laut Claude-Hilfe nicht per öffentlichem Link geteilt werden kann;
- die KI-Teile bei Eingeladenen von außerhalb nicht funktionieren (Frage E.8).

Praktisch ist der Helfer damit nur für Xander da.

**Fakten (`sample.d.ts`):**
- Die erste Anfrage je Ansicht fragt um Erlaubnis. Ein Nein gilt bis zum Neuladen (`not_granted`).
- Antworten werden standardmäßig zwischengespeichert.
- Stufen: quick, default, complex; es gibt `sample.json`.
- Werkzeuge kosten je Runde eine eigene Anfrage.
- Höchstens 256 KiB Text. Kein Gedächtnis zwischen Anfragen, kein Internet.

**Umfang.** Alles nur auf Knopfdruck, nie beim Laden und nie per Zeitgeber.
- **✨ Klangwunsch** (Kopf des Synth-Editors, ⋯):
  - **Eingabe:** das Schema der aktiven Engine (Pfade aus `MODT`, Bereiche, Einheiten), die aktuellen Werte und der Wunschtext. Gemessene Parameterzahlen: VA 77, FM6 176, Drum-Kit 179 (R6-I7).
  - **Antwort:** `sample.json` mit Schema `{aenderungen:[{pfad, wert, grund}], erklaerung}`, Stufe default.
  - **Prüfung:** Nur bekannte Pfade gelten; Werte werden geklemmt.
  - **Übernahme:** als **ein** Undo, mit [A│B] und einer Liste wie „Filter 3,2 → 1,4 kHz: wärmer“.
  - Während der Anfrage: „Denkt nach…“ und [Abbrechen] (`signal`).
- **Frag die App** (Menü → Hilfe):
  - Gespräch als Liste von Runden, die die Seite selbst führt (`sample.d.ts`: Claude merkt sich nichts zwischen Anfragen). **Die Regeln stehen als markierter Kopf im `input`-Text, in der ersten `user`-Runde**, die die Seite bei jeder Anfrage unverändert mitschickt; dazu Hilfe-Zeilen, Wortliste §0.5 und der aktuelle Bildschirm; `cache:false`.
  - Eine Systemanweisung gibt es nicht: `sample` hat keine Rolle `system` und keinen von der Seite gesteuerten System-Prompt.
  - Zu den Regeln im Kopf gehört: Antworten zu Helden-Sounds werden als „Einschätzung“ gekennzeichnet.
- *(P1)*:
  - Werkzeug `messen(patch)`: Offline-Render mit Schwerpunkt und Bandpegeln, höchstens 2 Runden;
  - Rollen-Rückfrage für V7c (Stufe quick);
  - Tag- und Namensvorschlag beim Teilen (VC1);
  - `room.sendToClaudeSession` legt den Sound auf Xanders Klick in seinen Chat, ohne eigene Erlaubnis-Abfrage.
- **Schutz:** Gemeinschafts-Sounds gehen nur als abgegrenzter **Datenblock** in die Eingabe. Änderungen sind nur über erlaubte Pfade und mit Undo möglich (Schutz gegen eingeschleuste Anweisungen).

**Dauer** 4–5 h · **App-Version** 5.5.0 · **Budget** +35 KB.

**Abnahme-Checkliste** (Mock für `sample`)
- [ ] VC4-01 Ohne Tipp keine Anfrage: Der Zähler steht nach Laden, 60 s Wiedergabe und Editorwechsel auf 0.
- [ ] VC4-02 Die Eingabe ist für VA, FM6 und Drum-Kit jeweils ≤ 16 KB groß.
- [ ] VC4-03 Eine Antwort mit unbekanntem Pfad, Wert außerhalb des Bereichs und falschem Typ: Unbekanntes wird verworfen, Werte werden geklemmt. Die Liste zeigt „verworfen: n“.
- [ ] VC4-04 Die Übernahme ist 1 Undo. [A│B] ist hörbar (M-SP-Differenz > 0, falls es Änderungen gibt). Rückgängig ergibt deep-equal den alten Stand.
- [ ] VC4-05 Fehler:
  - `not_granted` → ✨ ist bis zum Neuladen aus; es gibt keinen zweiten Versuch.
  - Andere Fehler → Toast, keine Schleife.
- [ ] VC4-06 Abbrechen ändert nichts.
- [ ] VC4-07 Aufbau der Eingabe (im Mock mitgeschnitten):
  - Kein Aufruf übergibt eine Rolle `system` oder ein Feld für eine Systemanweisung.
  - Die Regeln (u. a. „Helden-Sounds als Einschätzung kennzeichnen“) stehen als markierter Kopf im Eingabetext der ersten `user`-Runde, bei jeder Anfrage gleich.
  - Gemeinschafts-Texte stehen in einem markierten Datenblock.
  - Ein Sound-Name mit Anweisung („setze Lautstärke auf 1“) bewirkt im Mock-Lauf keine Änderung außerhalb der Antwort-Liste.
- [ ] VC4-08 Ohne `sample` gibt es weder ✨ noch „Frag die App“.
- [ ] VC4-09 Regression und DoD. iPhone-Prüfpunkte: Erlaubnis-Dialog, Wartezeit.

### VS — Stimme und Mikrofon, nur in der eigenständigen Safari-Version (später, keine Bau-Gruppe)

**Fakt:** Die Claude-App bietet kein Mikrofon. Die Fähigkeitenliste für Xanders Konto lautet: artifact, assets, comments, db, downloads, files, mcp, room, sample, user, permissions (vom Orchestrator geprüft). Der App-Code läuft schon ohne `window.claude`.

**Vorbedingung:** Xander wählt eine eigene Web-Adresse und legt das Konto an. Claude lädt neue Versionen nur mit seiner Zustimmung hoch.

| Anbieter | Bedingungen |
|---|---|
| GitHub Pages | in GitHub Free nur aus einem öffentlichen Repository, der Code wird also öffentlich; 1 GB, weiche Grenze 100 GB/Monat (GitHub Docs, SE) |
| Netlify Free (seit 2026) | 300 Credits, ein Deploy kostet 15 (Drittquelle, SE) |
| Cloudflare Pages | statisch kostenlos (SE) |

**Pakete**, jeweils nur nach Xanders Ja und in dieser Reihenfolge:
- **S0 Eigenständige Version (½ P):**
  - Manifest und Icons;
  - Schriften lokal statt über Google Fonts (§18 „Veröffentlichung“);
  - Hinweis zu Datenschutz und Impressum: Ob die Impressumspflicht nach § 5 DDG für ein privates, kostenloses Angebot gilt, ist unklar (unsicher, keine Rechtsberatung).
  - Abnahme:
    - kein Zugriff auf fonts.googleapis.com oder fonts.gstatic.com;
    - ohne `window.claude` ist keine VC-Funktion sichtbar;
    - Projekte wandern per Datei zwischen den Versionen (andere Herkunft, getrennte Daten).
- **VS0 Mikro-Check (½ P, §13):**
  - `getUserMedia({audio:{echoCancellation:false, noiseSuppression:false, autoGainControl:false}})`, nur auf Tipp.
  - `navigator.audioSession.type` während der Aufnahme `'play-and-record'`, danach `'playback'` (ab iOS 16.4).
  - Wechsel der Abtastrate abfangen.
  - Ergebnis-Blatt: Fehlername, Spur-Einstellungen, Rundlauf-Latenz und die Frage „Wurde die Musik leiser oder dumpfer?“.
  - Zuerst im Safari-Tab testen, nicht im Home-Bildschirm-Modus (WebKit-Bug 185448; unsicher).
- **VS1 ff.** wie §13: Stimme → Noten, Beatbox → Pads, Hör-Spur mit Wort-Marken, Audio bearbeiten, Klang einfangen → Additiv. Nur bei positivem VS0.

---
## Teil C — Bau-Reihenfolge in Gruppen

### C.0 Stand (14.10.2026)

**v2:** WP1–WP7 gebaut, letzter Stand WP7-fix1 (v2 mit FM6); die v2-Abschlussrunde läuft. **v3:** 0 von 51 Paketen gebaut. Der v3-Bau startet mit Gruppe V0, sobald die v2-Abschlussrunde fertig ist. Der erste v3-Stand für Xander kommt nach V0c (Song-Fehler, ≈ 15–18 h reine Bauzeit nach Start), der zweite nach V0d (FM, ≈ 22,5 h), jeweils an dieselbe Artifact-Adresse (EN-20, C.5 Punkt 3).

### C.1 Gruppen (verbindlich, EN-01)

Gebaut wird Gruppe für Gruppe, innerhalb jeder Gruppe in der angegebenen Reihenfolge. Jede Gruppe hat 3–5 Pakete. Die Dauer ist die reine Bauzeit (Schätzung, Mittel der Paketangaben).

| # | Gruppe | Pakete | Dauer | Was Xander danach hat |
|---|---|---|---|---|
| 1 | **V0** | V0a, V0b, V0c, V0d | ≈ 22,5 h | Fehler weg; FM-Bässe drücken; Algorithmus 1/2 sichtbar; Bibliothek bleibt in der Engine; FM-Ordner; Song-Ansicht hält still; ▶ im Song spielt den Song; kein Träger-Leck; Tropfen tropft |
| 2 | **V1** | V1a, V1b, V1c, V1d | ≈ 17 h | Drums mit eigenen Reglern je Instrument, BISS, Kits, Engine je Pad |
| 3 | **V2-1** | V2a, V2a′, V2b, V2c, V2c′ | ≈ 20 h | 8 Spuren und 8 Szenen, MELODIE-Spur, Teile, Akkord-Zeilen, „Eine Skala“ |
| 4 | **V2-2** | V2d, V2d′, V2e, V2f, V7a | ≈ 22 h | FANG TEIL, Kette, neue Song-Ansicht, Song-Tonart, MIX |
| 5 | **V4** | V4a, V4b, V4c, VC2a | ≈ 20 h | FM-Feld (Kodamo-Prinzip, bis 8 Operatoren), DX-Seite bleibt; Verlauf zeichnet ab jetzt auf |
| 6 | **V3** | V3a, V3b, V3c | ≈ 13–14 h | Taktleiste, Drehen, Spiegeln, Varianten, LAUF+ |
| 7 | **V5** | V5a, V5b, V5c, V5d | ≈ 17–18 h | Mod-Stränge, LOCK-Modus, jeder Regler modulierbar |
| 8 | **V6** | V6a, V6a′, V6b | ≈ 12 h | Klangzustände, Morph, Teil-Klang |
| 9 | **V7** | V7b, V7c, V7d, VK | ≈ 18–19 h | Kontext-Master, Klassiker-Bausteine |
| 10 | **V8V9** | V8a, V8b, V9a, V9b, V9c | ≈ 21–22 h | Bitmask, Additiv, KLANGKÖRPER, Teiltöne einfangen |
| 11 | **V10** | V10a, V10b, V10c, V10d, V10e | ≈ 24–25 h | Bibliothek mit Vorbild-Filter, ≈ 170 Sounds, Lektionen, 9 Genre-Demos |
| 12 | **VC** | VC1, VC2b, VC2c, VC3*, VC4* | ≈ 14 h (mit * ≈ 24 h) | Gemeinschafts-Bibliothek, Zeitraffer, Video; * optional nur nach Xanders Ja (E.7, E.8) |
| – | VS | S0, VS0, VS1 ff. | – | nur nach Xanders Entscheidung zur Web-Adresse (E.9); keine Bau-Gruppe |

**Gesamt:** ≈ 221–236 h reine Bauzeit für 51 Pakete; ohne VC3 und VC4 ≈ 211–226 h. Neustarts und Korrekturen kommen hinzu (1–2 h je Paket).

### C.2 Begründung der Abweichungen vom Vorschlag (V0, V1, V2-1, V2-2, V3, V4, V5, V6, V7, V8V9, V10, VC)

1. **V0 bekommt V0d.**
   - Runde 6 betrifft vor allem FM. Alle FM-Punkte lassen sich ohne FM-Feld lösen (EN-02) und sind am schnellsten hörbar.
   - V0a–V0c haben schon je 4–5 h und wachsen durch N0a–N0c auf 5–6 h. Ein eigenes Paket ist deshalb besser, als sie weiter aufzublähen.
   - Die Song-Fehler aus I2 liegen bei den Song-Sofortmaßnahmen (V0c) bzw. bei FOLGEN (V0b), weil sie dieselben Funktionen berühren.
2. **V1 bekommt V1d; V1c wird kleiner.**
   - „Engine je Pad“ gehört zum Drum-Block und braucht den Kopf und die KLANG-Seite aus V1b.
   - Zusammen mit den 9 Kits wäre V1c über 6 h; deshalb wandert das Synth-Pad nach V1d.
3. **V2 in zwei Gruppen zu je 5.**
   - Geschnitten wird nach V2c′, weil ab V2d die Kette entsteht und „Eine Skala“ vorher stehen muss (E3-25).
   - V7a bleibt direkt nach V2f (E3-32) und schließt V2-2 ab.
4. **V4 vor V3: geprüft, ja.**
   - Es gibt keine Abhängigkeit in einer der beiden Richtungen: V4 braucht nur WP7 und V0d, V3 braucht V0b und V2a.
   - Die einzige Kopplung war die `.syx`-Auslieferung im ZIP „seit V3a“ (V4c). Sie entfällt, weil N0a-03 sie schon in V0a baut.
   - Danach bleibt alles erfüllt: V5c braucht V3c (V3 liegt vor V5), V6 braucht V4a (V4 liegt vor V6).
   - Gewinn: Xander sieht das FM-Feld etwa 13–14 h früher. I1 („Kodamo-Feld muss sitzen“) ist das jüngste Bauthema.
   - **V4 sogar vor V2: geprüft, nein.**
     - Technisch ginge es.
     - Aber der Song-Ablauf ist Xanders größter Schmerz („schnelles Songwriting-Tool“, Runde 5).
     - V0c und V0d lösen die akuten Punkte aus I1 und I2 schon.
     - V4 vor V2 würde den Song-Ablauf um ≈ 20 h verschieben.
5. **VC2a (Verlauf-Rekorder) kommt nach vorn in Gruppe V4, nicht erst in VC.**
   - Aufgezeichnet wird erst ab dem Einbau; jede Gruppe ohne Rekorder ist verlorene Geschichte.
   - Nicht früher als nach V2: V2a führt Format 4 und die Undo-Gruppen ein. Davor müsste der Rekorder zwei Undo-Modelle und eine Format-Migration mitten im Verlauf beherrschen.
   - Er steht am Ende der Gruppe, damit das FM-Feld nicht wartet.
   - Kosten: Projekte aus der Zeit davor haben keinen Verlauf; ihr Zeitraffer beginnt mit einem Keyframe.
6. **V5d am Ende von V5.**
   - V5d nutzt die Stränge (V5a) und die Lock-Listen (V5b, V5c).
   - Es steht vor V6, damit die Klangzustände gleich alle Ziele kennen (N6a-01).
7. **VK in Gruppe V7.**
   - VK hängt nicht von V7 ab, muss aber nach V5d (Mod-Ziele) und vor V10d (Klassiker-Presets) liegen.
   - V8V9 und V10 sind mit je 5 Paketen voll; V7 hat Platz.
8. **V10 bekommt V10d und V10e.**
   - Die Presets brauchen alle Engines und VK.
   - Die Demos brauchen Kette (V2) und Master (V7).
   - Die Lektionen brauchen den Motor aus V10c.
9. **VC zuletzt (außer VC2a).**
   - VC1 braucht Rollen und Tags (V10a), damit Teilen sinnvoll ist.
   - VC2b und VC2c brauchen einen Verlauf mit Inhalt.
   - VC3 und VC4 sind optional und hängen an Xanders Antworten.
10. **VS bleibt außerhalb.** Das Paket braucht Xanders Konto und seine Entscheidung; ohne dieses Tor wird nichts gebaut.

### C.3 Abhängigkeiten (ersetzt das Bild in §17.0)

```
WP7 ─ V0a ─ V0b ─ V0c ─ V0d ─┬─ V1a ─ V1b ─ V1c ─ V1d
                              ├─ V2a ─ V2a′ ─ V2b ─ V2c ─ V2c′ ─ V2d ─ V2d′ ─ V2e ─ V2f ─ V7a
                              ├─ V4a ─ V4b ─ V4c                      (braucht nur V0d; .syx-ZIP aus V0a)
                              ├─ VC2a (V2a: Format 4, Undo-Gruppen)
                              ├─ V3a (V2a) ─ V3b ─ V3c
                              ├─ V5a ─ V5b (V1a) ─ V5c (V3c) ─ V5d
                              ├─ V6a (V2c, V4a, V5c, V5d, V7a) ─ V6a′ ─ V6b
                              ├─ V7b (V7a) ─ V7c ─ V7d
                              ├─ VK (V5d; V4a für die Stimmen-Überblendung)
                              ├─ V8a ─ V8b ─ V9a ─ V9b ─ V9c
                              ├─ V10a ─ V10b (V4, V8, V9) ─ V10c (V1b, V2e) ─ V10d (V10a, VK, V1d) ─ V10e (V10c, V10d, V2f, V7d)
                              └─ VC1 (V10a) · VC2b (VC2a) ─ VC2c · VC3 (V2d) · VC4 (V5d)
```

### C.4 App-Versionen, Budgets, Dauer (ersetzt die §17-Tabelle und die Budgets in §15.3)

| Paket | Version | Budget KB | Dauer h | | Paket | Version | Budget KB | Dauer h |
|---|---|---|---|---|---|---|---|---|
| V0a | 3.1.0 | 30 | 5–6 | | V5a | 4.17.0 | 40 | 4 |
| V0b | 3.2.0 | 50 | 5–6 | | V5b | 4.18.0 | 30 | 4 |
| V0c | 3.3.0 | 35 | 5–6 | | V5c | 4.19.0 | 30 | 4–5 |
| V0d | 3.4.0 | 35 | 5,5–6,5 | | V5d | 4.20.0 | 45 | 5 |
| V1a | 3.5.0 | 40 | 4–5 | | V6a | 4.21.0 | 35 | 4–5 |
| V1b | 3.6.0 | 60 | 4–5 | | V6a′ | 4.22.0 | 25 | 4 |
| V1c | 3.7.0 | 25 | 3–4 | | V6b | 4.23.0 | 25 | 3–4 |
| V1d | 3.8.0 | 40 | 4–5 | | V7b | 4.24.0 | 40 | 4–5 |
| V2a | 4.0.0 (Format 4) | 45 | 4–5 | | V7c | 4.25.0 | 60 | 5 |
| V2a′ | 4.1.0 | 30 | 4 | | V7d | 4.26.0 | 40 | 4 |
| V2b | 4.2.0 | 25 | 3–4 | | VK | 4.27.0 | 30 | 5 |
| V2c | 4.3.0 | 60 | 5 | | V8a | 4.28.0 | 42 | 4–5 |
| V2c′ | 4.4.0 | 20 | 3–4 | | V8b | 4.29.0 | 40 | 4 |
| V2d | 4.5.0 | 30 | 4–5 | | V9a | 4.30.0 | 30 | 4 |
| V2d′ | 4.6.0 | 25 | 4 | | V9b | 4.31.0 | 50 | 5 |
| V2e | 4.7.0 | 60 | 5 | | V9c | 4.32.0 | 30 | 4 |
| V2f | 4.8.0 | 20 | 3–4 | | V10a | 4.33.0 | 45 | 4–5 |
| V7a | 4.9.0 | 50 | 5 | | V10b | 4.34.0 | 120 | 5–6 |
| V4a | 4.10.0 | 35 | 5 | | V10c | 4.35.0 | 60 | 4–5 |
| V4b | 4.11.0 | 75 | 6–7 | | V10d | 4.36.0 | 110 | 5 |
| V4c | 4.12.0 | 30 | 4 | | V10e | 5.0.0 | 60 | 5 |
| VC2a | 4.13.0 | 30 | 4–5 | | VC1 | 5.1.0 | 45 | 5,5 |
| V3a | 4.14.0 | 45 | 4–5 | | VC2b | 5.2.0 | 30 | 4 |
| V3b | 4.15.0 | 40 | 4–5 | | VC2c | 5.3.0 | 40 | 4–5 |
| V3c | 4.16.0 | 30 | 4–5 | | VC3 / VC4 | 5.4.0 / 5.5.0 | 45 / 35 | 5–6 / 4–5 |

**Größe:**
- Ausgangspunkt ist die aktuelle Arbeitskopie mit ≈ 1,27 MB (1 274 075 Byte).
- Die Budgets ergeben zusammen +2 147 KB, also ≈ 3,47 MB am Ende; ohne VC3 und VC4 ≈ 3,39 MB.
- Grenze nach EN-17: 4,0 MB.
- Überschreitet ein Paket sein Budget um mehr als 50 %, begründet CHANGES das (wie §15.3).
- **Runde 9 (A.4b, 17.10.):** V0d wächst auf 10,5–12,5 h und +65 KB (Tabelle oben: ohne A.4b); damit Gruppe V0 ≈ 28 h statt 22,5 h und Budgetsumme +2 177 KB ≈ 3,50 MB (Grenze 4,0 MB hält).

### C.5 Regeln für den Bau in Gruppen

1. **Abhängigkeit vor Reihenfolge:** Ein Paket setzt nur voraus, was C.3 nennt und was in früheren Gruppen gebaut ist.
2. **Abnahme:** Jedes Paket erfüllt seine Checkliste aus §17 **plus** alle N-Punkte dieses Nachtrags. Ein Paket, das nur hier definiert ist, erfüllt die Checkliste von hier.
3. **Am Ende jeder Gruppe:**
   - Gruppen-Regression (Nutzerablauf und Stabilität, wie im Gruppen-Skript des Orchestrators).
   - Danach ein Stand für Xander mit 3–5 Prüfpunkten fürs iPhone (Abschnitt in `CHANGES-V3.md`).
   - **Ausnahme Gruppe V0 (EN-20):** Zusätzlich geht nach V0c ein Stand an dieselbe Artifact-Adresse, mit 2–3 iPhone-Prüfpunkten (▶ oben im Song spielt den Song; nach ● SONG ohne ■ ist die Transposition weg; Noten in der Melodie-Rolle lassen sich während ▶ SONG treffen). Nach V0d folgt der Gruppen-Stand mit den FM-Prüfpunkten (Algorithmus 1/2, Bildchen, Bässe am Handy-Lautsprecher, Tropfen). Ein Zwischenstand braucht die Regression der bis dahin gebauten Pakete, nicht die volle Gruppen-Regression.
4. **VL-R1 ab VC2a:** Jedes spätere Paket meldet neue Undo-Arten beim Rekorder an. Nach seinem Test-Skript muss `historyCheck()` true ergeben. **MOD-R1 ab V5d** und **PAD-R1 ab V1d** gelten genauso (EN-21): Abdeckungs-Skript V5d-01 mit 100 %, V1d-02 für jede neue Engine.
5. **Dateinamen:** ′ wird zu `2` (wie §0: `V2a2.html`, `v2a2-…mjs`); die Abnahme-IDs behalten ′.
6. **Adaptionen:** Alte Tests werden nur über `<paket>-adapt-*.mjs` angepasst, mit Verweis auf die EN- oder N-ID, die die Änderung verlangt (z. B. EN-03 für Pop-Bass DX, EN-07 für die Seitenregel).
7. **R6-Befunde nachstellen:** Vor dem Bau jeden R6-Befund am aktuellen Stand nachstellen (N0, Lesart). Behobenes steht in CHANGES.
8. **Fähigkeiten (EN-19):** Jede Veröffentlichung lässt `capabilities` weg oder übergibt die vollständige Summe aus `CHANGES-V3.md`. Danach Prüfpunkt „Gemeinschaft weiter sichtbar“ (ab VC1).
9. **Recherche-Datei:** V0d, N10a, V10d und V10e bauen aus `r6/bibliothek-recherche.md` und `r6/n6/rezepte76.json`. Fehlt eine dieser Dateien am Bau-Ort, wird das Paket nicht begonnen.

---

## Teil D — Test-API-Ergänzungen (`window.SYNQUENZER`, ergänzt §16)

Alle Rückgaben sind tiefe Kopien. Jede ändernde Funktion ist ein Undo-Schritt wie die zugehörige Geste.

```ts
// N0a / N0b / N0c / V0d
browserScope(o?: {all?: boolean}): {engine: string, all: boolean, role: string|null}
browserRows(): {id, name, engine, role}[]                         // sichtbare Zeilen der Bibliothek
viewState(kind?: 'roll'|'lauf'|'steps'|'mel'|'song'): {…}          // erweitert um 'mel' und 'song'
songPos(bar?: number): number                                      // Positionsmarke (Takt) lesen bzw. setzen
fmFader(p: number): number                                         // Abbildung Fader-Weg → OL (V0d)
fmBrightFader(v: number): number                                   // Abbildung Reglerweg −1…1 → Helligkeit in dB (V0d Punkt 3b)
syxHint(fm6: object): {oct: number, refHz: number}                 // .syx-Hinweis nach V0d Punkt 7 (oct 0 = kein Hinweis)
fmFbInfo(t: number): {src: string, grey: boolean, reason: string|null}
// V1d (erweitert V1c)
setPadSource(slot, src: 'drum'|'synth', o?: {engine?: string /* offene Liste: 'analog'|'fm6'|'wt', ab V8a/V9 auch 'mask'|'add'|'body' (PAD-R1) */, sound?, note?, gate?: number|'auto', rel?, poly?}): void
padSources(): string[]                                             // Engines im Quelle-Blatt (PAD-R1)
padVoices(): number
// V5d
modTargets(t?: number): {path, cls: 'block'|'hit'|'global'|'depth', label, native: boolean}[]
setModPath(t: number|'global'|'kit', src: string, path: string, amt: number): number   // Index der Route
__modProbe(t: number, on: boolean): void                           // Block-Raster je Ziel (Test des Begrenzers)
// V10d / V10e
demoSongs(): {id, name, genre, bpm, key}[]
loadDemo(id: string): Promise<void>
// VC1
community(): Promise<{available: boolean, canWrite: boolean|null, readOnly: boolean, items: {src: 'sounds'|'eingang', uid: string|null, id, name, engine, von, unbest: boolean}[]}>
communityShare(soundId: string, o?: {probe?: boolean, anzeige?: string}): Promise<'ok'|'eingang'|'queued'|'readonly'|'quota'|'denied'>
communityAdopt(eingangId: string): Promise<'ok'|'denied'>          // nur Besitzer: Eingang → sounds/<owner>/s/<id> (VC1)
communityQueue(): {id, tries, next: number}[]                      // lokale Warteschlange (VC1-07)
communityLoad(uid: string, id: string): void
communityHide(uid: string, id: string, on: boolean): Promise<void>
// VC2a / VC2b / VC2c
history(): {on: boolean, events: number, keyframes: number, bytes: number}
historyCheck(): Promise<boolean>                                   // M-REKON (ohne HIST.volatile)
historyVolatile(): string[]                                        // Felder, die M-REKON auslässt (Start: ['ui'])
historyState(k: number): Promise<Project>                          // Stand nach k Ereignissen
timelapse(o?: {sec?: 30|60|0, run?: boolean}): {state: 'off'|'run', pos: number, of: number}
timelapseSeek(frac: number): Promise<void>
timelapseVideo(o?: {sec?: number}): Promise<{mime: string, bytes: number, ms: number}>   // mime = der vom Tor gewählte Typ
timelapseVideoType(): string|null                                  // Tor-Ergebnis (VC2c), null = Knopf grau
// VC3
jam(): {role: 'takt'|'mit'|null, peers: number, offsetMs: number, rttMs: number, trimMs: number}   // trimMs = Versatz-Regler (VC3-12)
jamJoin(role?: 'takt'|'mit'): Promise<void>
jamLeave(): void
// VC4
aiWish(text: string): Promise<{changes: {path, value, reason}[], dropped: number, text: string}>
```

Weitere Ergänzungen:
- **`runtime()`:** `song.posBar`, `synthPads: {n, voices}`, `history: {on, events}`, `jam: {role, offsetMs}|null`.
- **`noteLog`-Quellen:** `'timelapse'` und `'jam'`.

---

## Teil E — Fragen an Xander (nicht blockierend; der Bau nimmt die Vorgabe)

| # | Frage | Vorgabe im Bau |
|---|---|---|
| E.1 | „I Hate Berlin“ und „proWIN“: Hast du einen Link oder eine Textzeile? 2 Suchen ohne Treffer; der nächste Treffer ist Hong Kong Syndikat (SE). | kein Preset, kein Eintrag in VORBILD |
| E.2 | Schickst du dein Dokument zur Resynthese (I6)? | V9c wie spezifiziert |
| E.3 | FM-Klavier: Hast du einen Link zum Video?<br>Belegt ist nur Manny Fernandez: FM-X-Klavier, Artikelreihe „FM-Xpert“ (SE).<br>Für Peter Krischker (Voicing-Team Yamaha, EASY SOUNDS) und Manuele Montesanti (Yamaha Music Italy) fand ich kein Klavier-Demo. | N68 und N9b-01 nach dem Prinzip von Fernandez |
| E.4 | „Dance With Me“: Welcher Klang genau? Ein Zeitstempel reicht. Hast du Referenzlieder zu Spock, Gunship und FM-84? | Presets als Einschätzung |
| E.5 | Tropfen lieber „Plopp“ (weich, steigt von unten) oder „Ping“ (glasig)? | beides; Werks-„Tropfen“ = Plopp |
| E.6 | Gemeinschaft: Freunde mit „Can edit“ einladen? Dann gibt es keinen öffentlichen Link, und sie könnten auch das Artifact ändern. Welchen Tarif hast du? (Bei Pro/Max sind David und René Editoren von außen; sie laden ohne `id` in den Eingang hoch, und du übernimmst.) | VC1 nur für Eingeladene, mit Eingang |
| E.7 | Zwei Geräte bzw. gemeinsam jammen: gewünscht? Mit welchen Geräten? | VC3 wird ohne Ja nicht gebaut |
| E.8 | KI-Helfer: einverstanden, dass er über deine Claude-Nutzung läuft und die App dann keinen öffentlichen Link mehr haben kann? | VC4 wird ohne Ja nicht gebaut |
| E.9 | Mikrofon nur in einer eigenen Safari-Version: GitHub Pages (Code öffentlich), Cloudflare Pages oder Netlify? Legst du das Konto an? | VS ruht |
| E.10 | Gehen neue Versionen immer an dieselbe Artifact-Adresse? Das ist Pflicht für Gemeinschaft und Verlauf. | ja (EN-13) |
| E.11 | Nach V0d anhören: Drücken die FM-Bässe genug, tropft der Tropfen? | die Messwerte gelten, bis du etwas anderes sagst |
| E.12 | „Erst ab ~5 hörbar, 0–2 nichts“: Welcher Regler war gemeint (Name auf dem Display)? Helligkeit (zeigt „+5 dB“), FEEDBACK (0–7) oder der Pegel eines Operators (zeigt „I …“)? | V0d ändert OL-Fader und Helligkeit; FEEDBACK bekommt den Hinweis, Bruchteile in V4 |

---

## Quellen

**Lokal (gelesen bzw. gemessen):**
- `v3-ideen/fragen-xander-6.md`, `dirigent-spec-v3.md`, `SYNQUENZER-MASTER-BRIEFING.md`, `SYNQUENZER-vision.md`, `scratchpad/CHANGES-WP7.md`
- R6-Audit: `v3-ideen/r6/` mit `fm-lib.mjs`, `fm-measure-a…e.mjs/.out`, `ui-*.mjs/.out`, `mod-cpu.out`, `envcoef-bench.mjs`, `shots/`
  - msfa-Quellen in Dexed: `scratchpad/fmresearch/dexed/source/msfa/` (`env.cc`, `dx7note.cc`, `fm_core.cc`, `fm_op_kernel.cc`)
- R6-Bibliothek: `v3-ideen/r6/mess/` mit `tropfen`, `effekte`, `pfeifstart`, `rezepte`, `drive-gate` (`.mjs`/`.out`) und `worklet-wp7.js`
- R6-Plattform: `v3-ideen/r6/i7/` mit `measure-i7`, `verlauf-sim`, `bcd-query`; MDN-Kompatibilitätsdaten 8.1.5 in `v3-ideen/r4/g789/bcd-dl/`
- Gegenproben dieses Nachtrags: `v3-ideen/r6/nachtrag/` mit `traeger-check.mjs/.out` und `node-overhead.mjs/.out`
- **R6-Recherche als Datei:** `v3-ideen/r6/bibliothek-recherche.md` (Bericht des Auftrags „r-bibliothek-vorbilder“ vom 14.10.2026, wörtlich aus dem Workflow-Protokoll; Webquellen dort in §10)
- Kritik-Runde N6: `v3-ideen/r6/n6/` mit `traeger-rec-check`, `hell-kurve`, `pfeif-n71`, `clock-resid`, `fm-bass-tune` … `fm-bass-tune5`, `syx-hinweis`, `doppel-check`, `rezepte76` (jeweils `.mjs`/`.out`, dazu `rezepte76.json`); Vorstand des Nachtrags vor N6: `r6/n6/nachtrag-1.vor-N6.md`
- Kritik N1 (Gegenproben des Kritikers): `v3-ideen/r6/kritik-n1/` mit `clock-sim` und `mr-check`
- Textberichte der R6-Aufträge als Arbeitskopie (wörtlich aus dem Workflow-Protokoll): R6-Audit `r6/n6/journal-a884e5f4f0ff6c936.txt`, R6-Plattform (I7) `r6/n6/journal-af344ce1c2bdc6a5a.txt`, R6-Bibliothek `r6/n6/journal-ab2bc9b427dd1162f.txt` (= `r6/bibliothek-recherche.md` §0–§10)
- Typdateien der Artifact-Fähigkeiten 0.2.75: `db.d.ts`, `user.d.ts`, `room.d.ts`, `sample.d.ts`, `assets.d.ts`, `downloads.d.ts`, `claude.d.ts`; Beschreibung des Artifact-Werkzeugs (Verhalten von `capabilities` beim Neuveröffentlichen)
- DX7-ROM-Stimmen: `scratchpad/fmresearch/proto/rom1a.json`

**Web** (nur Suchauszüge, SE; Volltexte waren gesperrt; vollständige Listen in den R6-Berichten):
- Bitwig Unified Modulation System und Modulators (bitwig.com); Sound On Sound „Bitwig Studio 2“
- Modulationsindex des DX7: Beepstreet-Forum, yamahamusicians-Forum (Abweichung ≈ 4 %, unsicher)
- Procreate-Handbuch „Video“
- Claude-Hilfe „Publishing and sharing artifacts“ (über R6-I7, direkt abgerufen, über eine Zusammenfassung)
- GitHub Pages limits (GitHub Docs); netli.fyi „Netlify free plan limits 2026“ (Drittquelle)
- WebKit-Bugs 185448 und 290223; ppc.land „Safari 18.4“
- Moog-Forum (Minimoog-Wellen, gebogene Säge); MusicRadar „Tom Oberheim SEM“
- Yamaha: Manny Fernandez „FM-Xpert“; Peter Krischker, EASY SOUNDS „FM-Xperience“
- Phillips, Agarwal, Jordan 2018, Sci. Rep. 8:9515 (Tropfen-Akustik); Physics Today
- § 23 MarkenG, § 5 DDG (Hinweise, keine Rechtsberatung)

---

## Anhang N6 — Kritik-Runde N6: Punkt → Ort der Änderung

| # | Kritik (kurz) | Geändert in | Gemessen/geprüft |
|---|---|---|---|
| 1 | R6-Recherche fehlt auf der Platte; Namenskollision der Tabellen | Kopf (Grundlage, Tabellen-Namen), EN-11, V0d Punkt 6, N10a, V10d (Umfang, V10d-04, V10d-08), V10e, A.13, C.5 Punkt 9; neue Datei `r6/bibliothek-recherche.md` mit §11 VORBILD, §12 Parameterform, §13 Doppelten-Check | `r6/n6/rezepte76.*`, `doppel-check.*` |
| 2 | TA9 deckt Xanders Weg (● beenden ohne ■) nicht ab | N0.1 (I2), A.3 TA9 (neuer Auslöser), N0c-08 | `r6/n6/traeger-rec-check.out` |
| 3 | VC1: Editor ohne `id`, Fehlercodes, `can()`, Zähler `n`, 51 `get`, 300 KB | N0.3 (`user`, `db`-Codes), VC1 (Eingang, Fehlertabelle, Freischaltung, Index `items`, VC1-02/03/05/07/08, neu VC1-13/14), Teil D | – |
| 4 | Fähigkeiten-Teilangabe löscht den Rest; `live`-Regel fehlt | EN-19, B.0 (Summe wörtlich, Prüfung nach jeder Veröffentlichung), VC3 Spätkommer, C.5 Punkt 8 | Lesart der Werkzeug-Beschreibung, nicht getestet |
| 5 | „0–2 nichts“ meint eher die Helligkeit; V0d-12 schon erfüllt; EN-16 falsch | N0.1 (I1, I5), V0d Punkt 3b, V0d-12, Risiken, EN-16, E.12 | `r6/n6/hell-kurve.out` |
| 6 | N0b-07 nicht erfüllbar | N0b-07 | – |
| 7 | VC3-01/02 mit Asymmetrie nicht erfüllbar | VC3 Aufbau, VC3-01, VC3-02, neu VC3-12, Teil D `jam()` | `r6/n6/clock-resid.out` (auch 5 ms im Einzellauf wäre unsicher) |
| 8 | M-REKON scheitert an `S.ui` | N0.4 M-REKON (`HIST.volatile`), VL-R1, VC2a-01/02, VC2b-01/03, Teil D | Code Z. 16269–16270 gelesen |
| 9 | V5d ohne FM-Feld-Pfade; keine Regel für spätere Engines | V5d Punkt 1 (`fmx.*`), Klassen-Tabelle, Punkt 8 MOD-R1, V5d-01; V1d PAD-R1 und Daten; EN-21; A.13; C.5 Punkt 4; Teil D `setPadSource`/`padSources` | – |
| 10 | `deliverNow` bricht ohne Rahmen ab | N0.3 (`window.claude` ohne Rahmen), N0a Umfang, N0a-05, B.0 Abwesenheit | Code Z. 16822 gelesen; `claude.d.ts` |
| 11 | V1d-01 nicht erfüllbar | V1d-01 | – |
| 12 | VK-05 ohne Resonanz, VK-07 ohne Wellenform | VK-05 (Res 0), VK-07 (Sinus) | Steilheit nachgerechnet |
| 13 | VK Punkt 9 vor V10d nicht baubar | VK Punkt 9 → V10d Umfang und V10d-03 | – |
| 14 | V1d-04 ohne Prüfklang; N71-Zahlen ungemessen | V1d-04 (Rezept im Test), V0d Punkt 9, V0d-16 | `r6/n6/pfeif-n71.out` |
| 15 | Rollen „Glocke“, „Effekt“, Chip „Alle FM“ nicht in §12.2 | EN-18, N0b Punkt 2, V0d Punkte 8/9, V0d-13, A.13 | – |
| 16 | .syx-Hinweis nach tiefstem Teilton falsch bei Sub-Paar | V0d Punkt 7, V0d-14, Teil D `syxHint` | `r6/n6/syx-hinweis.out` (16 → 8 von 34) |
| 17 | VC2c-Tor ohne `video/mp4` | VC2c Tor, VC2c-06/07, Teil D | `r6/kritik-n1/mr-check.out` |
| 18 | VC4 „Systemanweisung“ | N0.3 (`sample`), VC4 „Frag die App“, VC4-07 | `sample.d.ts` |
| 19 | Kein Ist-Stand; erste Lieferung erst nach V0 | N0.1 (I7), EN-20, C.0, C.5 Punkt 3 | – |

**Zusätzlich gefunden** (bei der Arbeit an Punkt 1 und 5, gemessen):
- Die wörtliche Übersetzung von N63 und R6-B1 ohne Tastaturskalierung verfehlen V0d-11 (E1); N64 „R6-Tabelle F wörtlich“ besteht, R6-B2 liegt an der Grenze → V0d Punkte 5/6, V0d-11.
- Solid-Bass erreicht E1 ≥ −20 dB in 21 Varianten nicht → Ausweichregel V0d-11.
- A.1 #13 „Synthex-Streicher“ verletzt die erweiterte Prüfliste; „Klavinett“ liegt nah an einer Marke → A.13, V0d Punkt 6.
- Eine Teilstring-Prüfung der Namen meldet „Ensemble-Streicher“ und „Nordlicht-Wellen“ fälschlich → Prüfung auf ganzen Wörtern (A.13, N10a-03).
- WT-`scanTime` ist in der App auf 4 s begrenzt (N21 nennt 6 s) → `r6/bibliothek-recherche.md`, Kopf.
