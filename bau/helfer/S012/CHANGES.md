# S012 — Teil bearbeiten (S0), Teil überarbeiten im Lauf (S1), Zusammenfassen (S2) · Basis App 4.23.0 (VERSION unverändert)

Grundlage: `spec/dirigent-spec-v3-nachtrag-5.md` Abschnitte S0, S1, S2; `spec/typische-fehler.md` (alle Punkte geprüft, siehe unten).
Datei: `bau/helfer/S012/index.html` (Kopie von `bau/werkzeug/vs-base-B.html`). Tests: `bau/helfer/S012/tests/` (Chromium, Touch).

## S0 — Teil bearbeiten (Fehler „Strophe ersetzen“)

### Fehler nachgestellt (`tests/repro-s0.mjs`, gegen die Basis)
Song Strophe (T1–2) · Refrain (T3–4) · Strophe (T5–6), beide Strophen = derselbe Teil. FANG TEIL fängt eine Strophe ohne Drums,
Name-Chip „Strophe ▾“ → „⟳ Strophe ersetzen“ → **beide** Stellen und die Teil-Vorlage wurden ersetzt (`markReplaceAll` über alle
Marken), obwohl nur die zweite gemeint war. Bei zwei Teilen „Strophe“ und „Strophe 2“ traf „⟳ Strophe ersetzen“ immer den Teil
„Strophe“ (Suche nach dem ersten passenden Namen) – „Strophe 2“ ließ sich so gar nicht ersetzen. Ergebnis Basis:
„1. Strophe (Takt 1) unverändert? false · Vorlage Strophe unverändert? false“.

### Was neu ist
1. **Ersetzen trifft genau die gewählte Stelle.** Kann „⟳ Strophe ersetzen“ mehr als eine Stelle meinen (Marken „Strophe“, „Strophe 2“ …
   im Song, gleichnamige Teile ohne Marke), zeigt das FANG-Blatt statt der Zeile „＋ Strophe 2 │ ⟳ Strophe ersetzen“ die Zeile
   **„Welche: [⟳ Strophe 1 (Takt 1)] [⟳ Strophe 2 (Takt 5)] [‹]“** (Song-Reihenfolge; gleiche Namen nummeriert, ein Teil ohne Marke
   „(nicht im Song)“). Die gewählte Stelle ist im Song markiert (weißer Rand der Marke). [ALS TEIL ✓] ohne Wahl ersetzt nichts
   (Hinweis „Welche Strophe? Bitte die Stelle wählen“). Ersetzt wird:
   - eine Marke, deren Teil nur dort steht (oder ein Teil ohne Marke): Teil-Vorlage + diese Stelle (wie bisher);
   - eine Marke eines Teils, der öfter im Song steht: **nur diese Stelle** (Melodie und eigene Clips dort bleiben wie bei
     „Auf alle übertragen“), Vorlage und die anderen Stellen bleiben deep-equal; die Marke behält ihren Namen und zeigt „′“.
   Eine Stelle = genau eine mögliche Bedeutung → wie bisher ohne Rückfrage. Ein Undo (`group` [part, song]).
2. **Marken-Blatt → [Bearbeiten]** (Tipp auf die gelbe Kopfzeile = Marke im Song; der Knopf steht in der Zeile von „● Neu aufnehmen …“):
   dasselbe Blatt zeigt „STROPHE · Bearbeiten · Takt 5–6 [‹]“, [✎ Name: Strophe] (das bestehende Namens-Blatt: Teil überall │ nur
   hier) und die **Liste der Spuren/Clips dieser Stelle über ihre Länge** (je Spur eine Zeile, je Clip-Abschnitt ein Knopf „Sz1“,
   „Sz2 T7–8“, „Eigener“ mit „an/aus“). Tipp = **an │ aus für diese Stelle**: „aus“ = die Spur schweigt in diesem Abschnitt, danach
   geht der Song phasengleich weiter; was dort lag, wird an der Marke gemerkt (`mark.off`) und kommt mit „an“ unverändert zurück
   (auch eigene Clips). Je Tipp ein Undo (`song`), Toast mit [Rückgängig]. Die Liste rollt per Finger.
3. Test-API: `fangReplaceWhich()`, `fangReplacePick(j|'back')`, `markSegs(id)`, `markSeg(id, t, b0, on)`, `markEdit(id)`.

### Daten (Format 5, nur additiv)
`song.marks[].off = [{t, b0, b1, e:[Lane-Einträge relativ], own?:{id: Clip}}]` – nur vorhanden, wenn an dieser Stelle etwas aus ist;
`marksNorm` übernimmt das Feld (sonst unverändert). Ältere Projekte: kein Feld, nichts ändert sich.

### Abnahme S0 (`tests/s0-acc.mjs` → ALL OK 38/38)
| ID | Ergebnis |
|---|---|
| S0-01 | ✓ ein Teil, zwei Marken: Blatt fragt „⟳ Strophe 1 (Takt 1) · ⟳ Strophe 2 (Takt 5)“ (Knöpfe 163 × 44); ohne Wahl nichts ersetzt; gewählte Marke im Song markiert; nach [ALS TEIL ✓] nur T5–6 geändert (Drums aus), T1–4 und die Vorlage deep-equal, Marke „Strophe′“; ein Undo = alles zurück. Teile „Strophe“/„Strophe 2“: „Strophe 2“ gewählt → nur Strophe 2 (Vorlage + Stelle), „Strophe“ deep-equal |
| S0-02 | ✓ Bearbeiten → ✎ Name → „Vers“ (Teil überall, alle Marken), Undo → „Strophe“ |
| S0-03 | ✓ DR aus in T5–6 per Touch: Lanes der anderen Spuren/Takte deep-equal; hörbar (Master-Mitschnitt): Drums T5 −64,5 dB (nur Ausklang des letzten Refrain-Schlags), T6 −84,9 dB, vorher −14 dB; Mischung T1–4 ±0,2 dB gleich; Speichern/Laden (serialize → importProject) deep-equal mit `mark.off`; „an“ → Lanes deep-equal zum Anfang; je Tipp ein Undo |
| S0-04 | ✓ Bearbeiten-Blatt und Marken-Blatt mit [Bearbeiten] in 390×844, 375×667, 320×568, 844×390, 667×375, 926×428: alle Knöpfe ≥ 44 × 44 (‹ wie ✕: 44 × 32 sichtbar + 12 px Trefferzone = 44 × 44), nichts abgeschnitten, im Bild, kein waagrechtes Rollen; Bilder `s0-04-*.png` |

Smoke (`tests/smoke.mjs`): keine Fehler.

## S1 — Teil überarbeiten im Lauf (unverbindlich, mit FANG)

### Was neu ist
1. Läuft ein Teil, den man auf der Teil-Leiste angetippt hat, wird im Lauf **nichts überschrieben**: Clips/Spuren an/aus,
   Szenenwechsel und Dazuspielen landen wie bisher nur im Song-Gedächtnis bzw. im FANG-Puffer (der Teil bleibt deep-equal).
2. **FANG bzw. FANG TEIL** fängt dann den **letzten vollständigen Durchlauf** des Teils mit allen Änderungen als **neue Fassung**:
   Spuren, die man angefasst hat, bekommen ihre Lane aus dem Gedächtnis (z. B. „DR Sz1, aus T3–4“), unberührte behalten ihre
   Lane; hat der Teil eine Akkord-Zeile, kommt sie aus dem, was wirklich klang; **dazugespielte Noten** (Synth-Spuren, wie gehört)
   kommen als `Part.mel` in die Fassung und spielen ab dann im Teil mit (auch im Song, wenn der Teil eingesetzt wird).
3. Ergebnis-Blatt **„TEIL ÜBERARBEITET“** (Platz und Form wie das FANG-Blatt: P über der Tastatur, quer im Seitenfeld): Teil-Chip,
   „Letzter Durchlauf eingefangen · n Noten dazugespielt“, Zeilen **Neu** / **Bisher**, **[Verwerfen] [Als neuen Teil] [Teil ersetzen]**.
   Der alte Teil bleibt unverändert bis [Teil ersetzen]. [Als neuen Teil] = nächster freier Platz, Name „Strophe 2“ (N7-R2-Nummer).
   ✕ / daneben = Verwerfen. Je Aktion ein Undo (`part`).
4. Noch kein vollständiger Durchlauf seit dem Tipp → FANG/FANG TEIL machen das Bisherige (kein Blatt). Ein mit FANG TEIL gefangener
   Kreis, der als Teil weiterläuft, ist kein „angetippter“ Teil → FANG TEIL fängt dort wie bisher eine neue Phrase (sonst wäre der
   zweite Fang aus V2d/V2e′ weg; Regression `v3-qa-v2e2reg-fangui` gleich wie Basis).
5. Test-API: `s1Fang({beat?})`, `s1Info()`, `s1Accept('replace'|'new')`, `s1Discard()`, `s1Active()`.

### Daten (Format 5, additiv)
`Part.mel = {Spur: [{t (Schläge ab Teil-Anfang), d, n (gehört), v}]}` – nur wenn Noten dazugespielt wurden. `normPart` liest es
verlustfrei, `partChunk` schreibt es beim Einsetzen in den Song nach `song.mel` (wie jede Song-Melodie).

### Abnahme S1 (`tests/s1-acc.mjs` → ALL OK 28/28)
| ID | Ergebnis |
|---|---|
| S1-01 | ✓ Teil (4 Takte) per Touch auf der Teil-Leiste gestartet; im 2. Durchlauf Drums am Taktstrich 3 aus → Teil während des Laufs deep-equal; FANG (Touch `#bFang`) → Fassung DR `[{bar 0, Sz1}, {bar 2, aus}]`, andere Spuren wie der Teil; alter Teil unverändert bis [Teil ersetzen]; danach neu gestartet: Drums in T1–2, ab T3 still (noteLog) |
| S1-02 | ✓ Noten 72 (T1) und 76 (T2) dazugespielt → `mel[3]` t = 1,06 / 5,02; im neu gestarteten Teil erklingen sie an denselben Stellen (±0,01 Schlag) |
| S1-03 | ✓ [Teil ersetzen] / [Als neuen Teil] je ein Undo → deep-equal; Speichern/Laden deep-equal mit `Part.mel`; [Verwerfen] ändert nichts |
| Blatt | ✓ 390×844, 375×667, 320×568, 844×390, 667×375, 926×428: im Bild, Knöpfe ≥ 44 px, nichts abgeschnitten (Kopf quer 11 px) |

## S2 — Zusammenfassen (Teil konsolidieren, Teile verketten)

### Was neu ist
1. **Marken-Blatt → [Zusammenfassen]** (neben [Bearbeiten]): alles im Bereich der Marke wird **ein neuer Teil** – Lanes (mit
   Phasen und **eigenen Clips**), Akkorde/Träger, die **im Song dazu aufgenommene Melodie** (`song.mel` aller Spuren) und die
   **Song-Stimme** (`song.vox`). Der Song selbst bleibt, wie er ist (er klingt unverändert); nur die Marke zeigt jetzt den neuen Teil.
2. **Gelbe Auswahl über zwei oder mehr Teile → Bereich-Leiste ⋯ → „Zusammenfassen“**: die gewählten Takte werden ein Teil
   (Länge = Summe), eine Marke ersetzt die bisherigen. Höchstens 16 Takte (Grenze eines Teils, wie „Als Teil …“).
3. Name wie bei „Als Teil …“ (Namens-Chips N7-R2, ✎ eigener Text); Vorschlag bei einer Marke ihr Name mit Nummer („Strophe 2“),
   sonst der nächste freie Name. Ein Undo (`group` [part, song]).
4. Wird der neue Teil woanders eingesetzt (Ziehen, Teil einsetzen, Ersetzen durch), bringt er Melodie, eigene Clips und Stimme mit.
5. Test-API: `sumMark(id, name?)`, `sumRange(a, b, name?)`, `openSum(a, b)`.

### Daten (Format 5, additiv)
`Part.mel` (wie S1), `Part.own = {id: Clip}` (eigene Clips, Lane-Einträge mit `own`), `Part.vox = [Stimm-Abschnitte, bar relativ]`,
bei `src: 'song'` zusätzlich `ph` an späteren Lane-Einträgen (sonst ginge eine Phase nach einem eigenen Clip verloren). `partChunk`
schreibt alles mit, `songWrite` setzt `vox` an die Stelle. Teile ohne diese Felder: unverändert (FANG-TEIL-Teile behalten ihr
bisheriges Verhalten, geprüft mit `v3-qa-v2e2reg-fangui` und `v3-qa-reg-fang2`).

### Abnahme S2 (`tests/s2-acc.mjs` → ALL OK 25/25)
| ID | Ergebnis |
|---|---|
| S2-01 | ✓ Song Strophe · Refrain · Strophe mit Song-Melodie (S4, 4 Noten in T1–2), eigenem Clip (S1 T2) und Stimme (330-Hz-Take T1–2); Tipp auf die Marke → [Zusammenfassen] (Touch) → „Strophe 2“: Teil mit Lanes, `mel` (4), `own` (1), `vox` (1); Song deep-equal (ohne Marken), Marke ohne „′“. Teil hinter dem Ende eingesetzt (T7–8): je Takt Clip/Phase/eigener Clip/Träger/Melodie/Stimme gleich; **hörbar**: 87 Noten T1–2 = T7–8 (Spur, Schlag auf 0,001, Ton), Pegel −13,4/−13,8 dB = −14,0/−14,2 dB (±0,6), Stimme 330 Hz −24,1 / −24,4 dB (T3 ohne Stimme −47,4) |
| S2-02 | ✓ gelbe Auswahl T1–4 über Strophe + Refrain → ⋯ (Touch) → „Zusammenfassen“ → Chip „Refrain“ → Teil „Refrain 2“ mit 4 Takten (2 + 2), eine Marke T1–4, Song deep-equal; eingesetzt an T7–10 = T1–4 je Takt; hörbar 120 Noten gleich |
| S2-03 | ✓ Undo (Einsetzen, Zusammenfassen) → deep-equal; Speichern/Laden deep-equal mit `Part.mel/own/vox` |
| Formate | ✓ Namens-Blatt in 6 Formaten ≥ 44 px, nichts abgeschnitten; [Zusammenfassen] im Marken-Blatt ≥ 44 × 44 (bricht als „Zusammen-fassen“ um, nie abgeschnitten) |

„Bitgleicher Render“: Die App hat keinen Offline-Render des Songs; geprüft wird (a) der Song-Inhalt selbst bleibt deep-equal
(dort also bitgleich), (b) der eingesetzte Teil erzeugt dieselben Ereignisse (Notenprotokoll, Stimm-Abschnitte, Träger) und
(c) Pegel/330-Hz-Anteil im Master-Mitschnitt gleich. Ein Sample-Vergleich des Echtzeit-Mitschnitts ist wegen freilaufender
Oszillator-/LFO-Phasen nicht bitgleich möglich (auch nicht zwischen zwei Läufen derselben Stelle).

## Regression (Basis 4.23.0 gegen S012, `tests/reg/`, Kopien der Skripte aus `bau/tests/` mit lokalen Pfaden)
| Skript | Ergebnis |
|---|---|
| `v3-qa-reg-part`, `-part2`, `-part3` (Teil-Lanes, ＋, Akkord-Zeile) | gleich (Bass-Noten je Schlag identisch, keine Fehler) |
| `v3-qa-reg-loop` (Schleifen-Bereich) | gleich (46 = 46 Noten) |
| `v3-qa-reg-fang2` (FANG → FANG TEIL) | gleich |
| `v3-qa-v2e2reg-song` (Import, Rundweg, 30 Undos, Song nach Undo) | gleich |
| `v3-qa-v2e2reg-fangui` (FANG-Blatt per Touch, ALS TEIL, ＋ Ans Song-Ende, P1/L1) | gleich bis auf die gemessene Tipp-Zeit im Takt (10 % gegen 12 %, Zeitrauschen) – vor dem `caught`-Fix fing der zweite FANG TEIL fälschlich als S1, behoben |
| `v3-qa-reg-song` (● SONG-Mitschnitt in Echtzeit) | zeitabhängig: auch Basis gegen Basis weicht beim aufgenommenen Song ab; die Notenprotokolle folgen dem jeweils aufgenommenen Song – kein Befund |
| `tests/smoke.mjs` | keine Fehler |

## Abweichungen
- S0 „gespeichert im Teil“: an/aus wird **an der Stelle** (Marke) gespeichert, nicht in der Teil-Vorlage – sonst würden alle
  Strophen schweigen, Xanders Beispiel ist aber „im letzten Teil schweigen die Drums“. Siehe Fragen.
- S1 gilt für einen Teil, der auf der Teil-Leiste angetippt wurde. Ein Song, der in einer Schleife über eine Marke läuft, wird
  nicht als „Teil im Lauf“ behandelt (FANG dort wie bisher) – siehe Fragen.
- S1 nimmt dazugespielte **Synth**-Noten in die Fassung; auf den Pads dazugespielte Drums nicht (Song-Melodien gibt es nur für
  Synth-Spuren). Der Name „TEIL ÜBERARBEITET“ des Ergebnis-Blatts folgt dem FANG-Blatt („TEIL GEFANGEN“); die Spec nennt keinen.
- S2: Ein Teil mit eigenen Clips/Stimme, der auf der **Teil-Leiste** angetippt wird, spielt dort die Szenen-Clips der eigenen Clips
  und keine Stimme (die Teil-Leiste spielt nur Szenen-Clips; im Song klingt alles). Song-Melodie spielt auch dort (S1-Weg).
  Eine Teil-Transposition im Song (`song.xp`) innerhalb des Bereichs wird nicht in den Teil übernommen (wie „Als Teil …“).
- S2: Zusammenfassen fragt nach dem Namen (wie „Als Teil …“); die Spec nennt keinen Namen.
- Der ‹-Knopf im Bearbeiten-Kopf hat dieselbe Form wie das bestehende ✕ des Marken-Blatts (44 × 32 sichtbar, Trefferzone 44 × 44).

## Fragen an Xander
1. S0: Soll „aus“ im Bearbeiten-Blatt nur an dieser Stelle gelten (so gebaut) oder für alle Stellen des Teils (dann „Auf alle
   übertragen“ danach)?
2. S0: Früher ersetzte „⟳ Strophe ersetzen“ Vorlage + alle Strophen auf einmal. Jetzt fragt das Blatt nach der einen Stelle. Brauchst du
   zusätzlich „alle Strophen“ als Wahl (bisher über Marken-Blatt → „Auf alle übertragen“ erreichbar)?

3. S1: Soll „Teil ersetzen“ auch die Stellen dieses Teils im Song mitnehmen (wie früher ⟳ ersetzen) – oder nur die Vorlage
   (so gebaut; die Song-Stellen zeigen dann „′“ und lassen sich mit „Auf alle übertragen“ angleichen)?
4. S1: Soll auch ein Song, der in der Schleife über eine Marke läuft („Songteil antippen zum Hören“ über ▶ Ab hier + Schleife Teil),
   so eingefangen werden? Dann würde [Teil ersetzen] diese eine Stelle ersetzen.
5. S1: Sollen auf den Pads dazugespielte Drums auch in die Fassung (als neuer Drum-Clip)?

6. S2: Soll der zusammengefasste Teil den alten Namen behalten (z. B. „Strophe“ statt „Strophe 2“), wenn nur eine Marke
   zusammengefasst wird? Dann müsste der alte Teil umbenannt oder ersetzt werden.
7. S2: Mehr als 16 Takte zusammenfassen (z. B. drei 8-Takt-Teile) geht wegen der Teil-Grenze nicht – mit G8 (64 Takte) anheben?

## Für das Zusammenführen
- Alles in markierten Blöcken: Code-Block `/* S0 … */ … /* /S0 */` direkt vor `function uiSync()`, CSS nach `.msheet .ms-all{…}`.
- Ein-Zeilen-Haken: `fangAccept` (Zeile `/* S0 */` am Anfang des Ersetzen-Zweigs), `openFangSheet` paint/onTap/onClose (je eine Zeile
  `/* S0 */`, `dupx` ruft `s0FangClear()`), `markReplaceAll(song, p, skipId, onlyId)` (neuer optionaler 4. Parameter), `marksNorm`
  (eine Zeile `mark.off`), `openMarkSheet` paint (eine Zeile `s012MarkSheetPaint(p, m)` nach dem `innerHTML`),
  `Object.assign(SYNQUENZER, S012_API)` nach `WP_API`.
- S1-Haken: `normPart` (eine Zeile `s012PartExtra`), `partChunk` (`mel: s1ChunkMel(p, L)` statt `mel: {}`), `partTick` (eine Zeile
  `s1PartMelTick`), `fangTap` (eine Zeile vorn), `fangAdopt` (`caught: 1` am übernommenen Kreis). Block `/* S1 … */ … /* /S1 */` hinter S0.
- S2-Haken: `partChunk` (Lane-Zeile: `ph`/`own`; Rückgabe `Object.assign(…, s2ChunkExtra(p, L))`), `songWrite` (eine Zeile `vox`),
  `openRangeMore` (Listeneintrag + eine `else if`-Zeile). Block `/* S2 … */ … /* /S2 */` hinter S1; der Knopf im Marken-Blatt kommt
  über denselben `s012MarkSheetPaint`-Haken wie [Bearbeiten].
- VV2 (Video-Zeile im selben Blatt): unser Haken hängt die Knöpfe hinter `.ms-rec` ein und ersetzt in der Bearbeiten-Ansicht das
  ganze `innerHTML` – eine Video-Zeile, die VV2 im paint per `innerHTML` mitbaut, verschwindet in der Bearbeiten-Ansicht und ist nach ‹
  wieder da. Konflikt nur, wenn VV2 dieselbe Zeile `B('rec', …)` umschreibt: dann `s012MarkSheetPaint(p, m);` einfach hinter VV2s
  Zeile stehen lassen.

## Typische Fehler (spec/typische-fehler.md) – geprüft
1/4/5 Formate, ≥ 44 px, kein Sprung: S0-04 · 3 Liste rollt per Finger (`pan-y`, `touch-action:pan-y`) · 6 Blatt schließt mit ✕/neben
das Blatt (bestehendes Marken-Blatt), Bearbeiten → ‹ · 7 geändert-Punkt über `songChanged`/`markDirty` · 8 ein Undo je Aktion ·
9 Speichern/Laden deep-equal · 10 Wahl im FANG-Blatt endet mit ‹, Verwerfen, Schließen (`s0FangClear`) · 12–17 keine DSP-Änderung ·
20 kein Supabase-Aufruf (keine neuen Aufrufe, Netz-Wächter im Test leer) · 24 „MS 2000“ genau einmal, kein Markenname · 26 keine
früheren Tests angepasst · 27 nichts Zusätzliches: offene Punkte unter „Fragen an Xander“.
