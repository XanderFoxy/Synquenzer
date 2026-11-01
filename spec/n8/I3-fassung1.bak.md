# SYNQUENZER v3 — Nachtrag 8, Paket I3: Mal-LFO (Form malen oder einwischen)

**Kurz für Xander**
1. Beim LFO gibt es neben Sinus, Dreieck, Säge, Rechteck und S&H eine sechste Form **✎ Gemalt**. Du malst sie mit dem Finger in ein Feld,
   das **einen Takt** breit ist. Sie läuft dann im Takt immer wieder ab.
2. Du darfst schnell kritzeln: Beim Abheben **räumt die App auf**. Aus wackeligen Strichen werden gerade Rampen, aus schiefen Stufen saubere
   Treppen auf dem Raster, Kurven bleiben Kurven. Du siehst und spürst (Haptik), wie es einrastet. Stimmt eine Stelle nicht, malst du nur
   über diese Stelle neu.
3. **Einwischen:** Läuft der Loop, fährst du mit dem Finger nur hoch und runter. Die App schreibt die Höhe an die Stelle im Takt, die du gerade
   hörst, und du hörst das Ergebnis schon im nächsten Durchlauf.
4. Eine kleine **Bibliothek** liegt bei: **Pumpen, Gate, Triller**, dazu deine eigenen Formen. Eine Form geht an vier Orte: als **LFO-Welle**,
   in die **MS-2000-Mod-Sequenz**, in eine **Lock-Reihe** (I2) und als **Kurve für den Super-Regler** (I1).
5. Die Form läuft fest am Song-Takt und klingt im Song, im Export und im Video **immer gleich**. Alte Projekte klingen bitgleich.
   Es gibt sieben Unterpakete (I3a–I3g), zusammen **≈ 19–25 h**. Vorher stelle ich dir 3 kurze Fragen (§11), jede mit geplanter Vorgabe.

---

Status: **Entwurf zum Bau nach Xanders Ja** (31.10. ~16:50 UTC: „Ja, die Innovation kannst du gerne umsetzen“; freigegeben sind die
Innovationen 1–4 aus `innovation-vorschlag.md`, dies ist Nr. 3 „Mal-LFO“ samt Frage C). Ideen 5–12 sind **nicht** freigegeben und kommen hier
nicht vor. Quellen im Projekt: `innovation-vorschlag.md` (Frage C und Idee 3), `fragen-xander-9.md` (31.10.), `typische-fehler.md`,
`n8/I1.md` (Super-Regler, Feld `f` in `song.sr` reserviert), `n8/I2.md` (Lock-Reihen, Schnittstelle `lanePut`), Nachtrag 3 MK6 (Mod-Sequenz),
Nachtrag 7 §1.8 (Bit-Mask-LFOs wie am Gerät), Nachtrag 5 VV1–VV3 (Video). Code-Stand: 4.23.0 (`vs-base-B.html`), K1 (`n5-br-K/index.html`),
VV1/VV2 (`n5-br-V/index.html`).

**Kennzeichen:** **[C]** Befund im Code (Zeilennummern 4.23.0, ungefähr) · **[A]** Annahme dieser Spec (der Builder baut genau das) ·
**[V]** sichtbare Neuerung, steht in §12 „Bitte prüfen“ · **[X]** Entscheidung von Xander · **[W]** Fakt aus der Web-Recherche (§13).

**Regeln, die hier besonders gelten** (`typische-fehler.md`, CLAUDE.md):
- **27** Nur bauen, was hier steht. Namen auf Tasten stammen aus dem freigegebenen Vorschlag („Mal-LFO“, „einwischen“, „aufräumen“, „Pumpen“,
  „Gate“, „Triller“). Neue sichtbare Dinge sind mit [V] markiert. **Kein** Punkte-Editor (Knoten ziehen), **kein** Spiegeln/Umdrehen der
  Form, **keine** weiteren Bibliotheksformen. Diese Dinge wurden nicht besprochen.
- **28** Alte Projekte klingen gleich. Ohne `l1shape`/`l2shape` = 5 und ohne `f` in Super-Regler-Fahrten gibt es **keine** neue Nachricht
  an die Worklets, und kein neuer Rechenweg läuft. Golden-Render der Snapshots in `synq-snapshots/` **bitgleich** (I3-01).
- **3 / 4 / 5** Trefferflächen ≥ 44 × 44 px, nichts abgeschnitten, kein Layout-Sprung (Seiten- und Editorhöhe ± 0 px beim Öffnen und
  Schließen des Form-Blatts). **6 / 10** Malen und Einwischen enden auf jedem Weg sauber.
- **7 / 8 / 9** „geändert“-Punkt sofort, ein Strich = ein Undo, Speichern → Laden deep-equal (auch Kopieren, Sound sichern, Klang-Lock).
- **12 / 16 / 17** Kanten der Form werden im Klang geglättet (§4.1). Keine Allokation in `process()`, NaN-Schutz.
- **20** Kein Supabase-Aufruf. `max_app` (heute 4 030 000) muss die I3-Version decken. Das setzt Xander.
- **24 (sinngemäß)** Kein Hersteller- oder Produktname in der App (Oberfläche, Hilfe, Kommentare, Bezeichner, Testnamen). Vergleiche stehen
  nur in dieser Spec. Wo die Oberfläche die MS-2000-Engine nennt, kommt der Name aus `MK_LABEL`.
- **29** Zwei Zweige parallel (§8).
- **CLAUDE.md-Vorrang:** Die Seite bleibt schnell und die Bedienung flüssig. Form-Blatt und Aufräumen liegen im Block `sq-form-src`, der
  **erst beim ersten Öffnen** ausgewertet wird (wie `sq-mk-src`). Ohne gemalte Form rechnet das Worklet keinen einzigen zusätzlichen Befehl.
  **WebGL bringt hier nichts:** Das Feld zeichnet höchstens 768 Punkte mit Canvas 2D in ≤ 2 ms je Bild. Das sage ich gleich jetzt.
- Format bleibt **5** (nur zusätzliche Felder). Die App-Version vergibt der Dirigent.

---

## 0. Befund im Code (4.23.0 und wartende Pakete)

| Stelle | Heute | Folge für I3 |
|---|---|---|
| `AnalogCore.lfoVal(shape, ph, sh)` (Z. 9688) | 5 Formen: 0 Sinus · 1 Dreieck · 2 Säge · 3 Rechteck · `default` = 4 S&H [C] | neuer Fall **5** vor `default`; alte Formen unverändert |
| `AnalogCore.control()` (Z. 9694–9722) | Takt-LFO: `gl1 = ((songT / spb / l1sync) % 1 + 1) % 1`, wenn `songStart ≥ 0`, sonst frei weiter; Start NOTE: Phase je Stimme ab 0 (Z. 9619); Steuer-Takt `CR` = 16 Samples [C] | Takt-Lage gibt es schon; die gemalte Form nutzt sie unverändert |
| FM-FELD (`fmx`, Z. 10246 ff.) | Operator-LFO (lfoAm/lfoFm) liest `this.src[S_LFO1]` [C] | die gemalte Form wirkt dort ohne Zusatzarbeit |
| `wkFlat(snd)` (Z. 17781) | schickt nur Zahlen aus `snd.p` an das Worklet [C] | die Knoten der Form brauchen eine eigene Nachricht `lf` (§4.2); ohne Form bleibt alles byte-gleich |
| `syncEngine(i, full)` (Z. 17798) | Voll-Abgleich `set(wkFlat, true, fp, mods, mk)`, dann `rebuildNativeLfos(i)` [C] | hängt `lf` an, wenn eine Form aktiv ist |
| `FX.lfoShape`, `FX.lfoBuffer` (`CYC` 1024), `FX.TempoLFO` (Z. 14995–15050) | nativer LFO als geschleifter Puffer, Phase über den Startversatz am Song verankert [C] | Puffer aus der Form (§4.4) |
| `syncLfoSet` (Z. 17686), `lfoAnchor` (Z. 17674), `lfoSink` | Schlüssel `Form│Takt│Tempo`; `lfoSink` hält die LFOs am Laufen („LFOs halten an“, K1) [C] | Schlüssel bekommt den Form-Hash; `lfoSink` gilt auch hier |
| `pageLfo(pg, i, n)` (Z. 28331) | Form-Leiste mit 5 Symbolen `LFO_SHAPE_ICO` (Z. 16797), FREI/TAKT, Rate/Takt, Start, Einblenden, Mod-Rad, Vorschau `.lfopv` 120–150 × 56 px (44 px im Querformat) mit Laufpunkt (`lfoPrevFrame`, Z. 28373) [C] | 6. Symbol ✎, Vorschau zeigt die Form, Tipp öffnet das Form-Blatt (§6.2) |
| `lfoNow` (Z. 26994) | Wert der LFOs für die Laufpunkte an den Reglern [C] | rechnet die Form mit derselben Formel |
| `PD['l1shape']` (Z. 16761), Bereich `l1shape: [0, 4, 1]` in `normAnalog` (Z. 13257), `LFO_FX_SHAPE` (Z. 16799) | Werte 0–4 [C] | Werte 0–5; **ältere Versionen klemmen 5 auf 4 (S&H)** → Risiko 7 |
| `normSynthP` (Z. 13341) | übernimmt nur bekannte Blöcke [C] | `l1f`/`l2f` neu übernehmen |
| DX-Export (Z. 32061) | Tabelle `{1: 0, 2: 1, 3: 3, 0: 4, 4: 5}[l1shape]` [C] | für 5 fehlt ein Eintrag → würde `undefined` schreiben; I3a legt die Annäherung fest |
| v2-API `LSH_V2` (Z. 27784), Zufalls-Klang (Z. 29769) | 4 Namen; Zufall wählt 0–2 [C] | `LSH_V2[5]` = `'drawn'` (nur lesen); der Zufall bleibt unverändert |
| MS 2000 `mkLfoV` (Z. 7835), Bedienfeld „wie am Gerät“ | eigene LFO-Wellen [C] | **keine** gemalte Welle auf dem Bedienfeld (Frage F1) |
| MS-2000-Mod-Sequenz `t[].seq` (Z. 13095), `seqToolsPop` (Block `sq-mk-src`, Z. 5887), `timApply` (Z. 4728) | 3 × 16 Werte −63…63, Bewegung `m` (Glatt/Stufe), LÄNGE `last` 1–16; Werkzeuge Neu/Tauschen/Kopieren [C] | Zeile „Aus Form“ im Werkzeug-Blatt (§6.6) |
| Spur-Effekt `fx.pump` „Pumpen“ (Z. 16787, `FX.pump` Z. 15367) | Seitenketten-Ducking auf Kick oder 1/4, 1/8 [C] | **gleicher Name** wie die Bibliotheksform → bleibt unverändert, Hinweis in §12 |
| `haptic(kind)` (Z. 26684) | `tick`/`snap`/`pop`, höchstens 1 je 30 ms, iOS über den Schalter-Trick [C] | Einrasten = `snap`, Viertel-Linie = `tick` |
| `AU.outLat = devLat + graphLat` (`updateOutLat`, Z. 17416) | gemessene Ausgabe-Verzögerung [C] | Latenzausgleich beim Einwischen (§5.5) |
| I1 (`n8/I1.md` §4.2) | `song.sr = [{a, b, x0, x1, f?}]`, `f` „für I3 reserviert“ | I3 legt fest: `f` **enthält die Form selbst** (§3.3) |
| I2 (`n8/I2.md` §7) | Schnittstelle `lanePut(t, s, path, werte[], {len, g})` für freie Reihen (ein Undo) | I3e nutzt sie; für Reihen „An Noten“ kommt `lockPut` dazu (§3.4) |
| VV3 (Nachtrag 5) | „LFO als laufende Welle mit Phasenpunkt“, gerechnet wie die Klangerzeugung | nutzt `FORM.eval` (§4.5) |

---

## 1. Ziel

Xander soll eine Bewegung, die er im Kopf hat, mit dem Finger in einen Takt malen können: ein Pumpen auf der Lautstärke, ein Gate-Rhythmus,
ein Wah-Muster auf dem Filter oder einen Triller auf der Tonhöhe. Er darf dabei schnell und ungenau sein. Beim Abheben räumt die App die Form
auf: Gerade Striche werden gerade Rampen, Stufen landen sauber auf dem Raster, gewollte Kurven bleiben Kurven, und er sieht und spürt, wie es
einrastet. Läuft der Loop, kann er die Form auch „einwischen“: Er bewegt den Finger nur hoch und runter, und die App schreibt die Höhe an die
Stelle des Takts, die er gerade hört. Eine Form wird als LFO-Welle benutzt, kann aber auch in die MS-2000-Mod-Sequenz, in eine Lock-Reihe oder
als Kurve für die Fahrt des Super-Reglers eingesetzt werden. Weil die Form fest am Song-Takt hängt, klingt sie im Song, im Audio-Export und
im Video jedes Mal gleich. Gespeicherte Projekte klingen danach genau wie vorher.

## 2. Umfang und Nicht-Umfang

**Umfang**
1. **Form-Kern (I3a):** Datenmodell der Form (§3), Auswertung `FORM.eval` mit geglätteten Kanten (§4.1), LFO-Form 5 im Worklet (VA, FM DX,
   FM-FELD über LFO 1) und auf dem nativen Weg (WT, ECO, Spur-Effekt-Routen), Takt-Lage, Anzeigen (Vorschau, Laufpunkte, VV3), DX-Export,
   v2-API, Mod-Übersicht.
2. **Aufräumen und Einwischen (I3b):** die Erkennung aus §5 als DOM-freies Modul `FORMCLEAN` mit Korpus-Test.
3. **Form-Blatt (I3c):** Malen, Übermalen, Einwischen, Raster, Schalter „Aufräumen“, Infozeile, Undo; Einstieg von der LFO-Seite; Hoch- und
   Querformat.
4. **Bibliothek (I3d):** Pumpen, Gate, Triller (fest im Code) und „Meine Formen“ (auf dem Gerät).
5. **Einsetzen (I3e):** Form → MS-2000-Mod-Sequenz (SEQ 1–3) und Form → I2-Reihe (frei oder an Noten).
6. **Super-Regler-Kurve (I3f):** Form als Verlauf von [bis zum nächsten Teil fahren] (I1), im Song gemerkt, gleich in Export und Video.
7. **Zusammenführen (I3g):** Regel-28-Golden, Regression, Fach-Prüfung, „Bitte prüfen“.

**Nicht-Umfang** (nicht bauen)
- Gemalte Welle auf dem MS-2000- und dem Bit-Mask-Bedienfeld (Frage F1, Vorgabe nein), auf North (hat keinen LFO).
- Gemalte Form in **FREI** (Hz, nicht am Takt). Der Vorschlag sagt „läuft fest am Song-Takt“ [X über die Freigabe].
- Knoten einzeln ziehen, Punkte-Editor, Spiegeln, Umdrehen, Glätten-Regler, Zufalls-Formen, mehr als drei Bibliotheksformen.
- Überblenden zwischen zwei gemalten Formen (Morph); `l1f` ist „nur im Grundklang“ (kein Klangzustand, kein Lock, vgl. I2 `LKT` Klasse `s`).
- MIDI-Export der Form (LFOs gehen heute auch nicht in den MIDI-Export).

---

## 3. Datenmodell (Format bleibt 5, nur zusätzliche Felder)

### 3.1 Die Form

```js
form = {
  v: 1,                       // Versionsfeld (Regel 28)
  n: 'Pumpen',                // optional: Name, ≤ 24 Zeichen (Bibliothek/Meine Formen); jeder neue Strich löscht ihn → Anzeige „Gemalt“
  k: [ [x, y, t, b], … ]      // Knoten, nach x sortiert
}
// x: ganze Ticks 0…768 eines Zyklus (768 = 4 · 192 → 1/32 = 24, 1/16T = 32, 1/16 = 48, 1/8T = 64 Ticks: alle Raster liegen genau)
//    erster Knoten x = 0, letzter Knoten x = 768; höchstens zwei Knoten mit demselben x (= senkrechte Kante)
// y: ganze Zahl −1000…+1000 (= −1…+1)
// t: Art des Abschnitts bis zum nächsten Knoten: 0 Halten · 1 Gerade · 2 Kurve; beim letzten Knoten 0
// b: Biegung −100…+100, nur bei t = 2 (b = 0 wird zu t = 1)
// höchstens 65 Knoten (64 Abschnitte); nach dem Aufräumen höchstens 33 Knoten (32 Abschnitte)
```
- Größe: 1 Knoten ≈ 18 Zeichen JSON, eine Form ≤ 1,3 KB, typisch 0,2–0,6 KB. Gut für Online-Speichern.
- **Fest im Klang, keine Extra-Daten:** Jede benutzte Form steckt **als Kopie** im Klang bzw. im Song-Eintrag. Damit gilt Xanders Regel vom
  31.10. („fest IM Clip, beim Kopieren immer mit kopiert, keine Extra-Daten wie in vielen DAWs“). Eine Bibliotheksform wird beim Wählen kopiert.
  Ein späteres Ändern der Bibliothek ändert keinen Klang [A].
- `formNorm(f)`: prüft `v`, klemmt `y` und `b`, rundet `x` auf ganze Ticks, sortiert stabil, entfernt einen dritten Knoten mit gleichem `x`,
  setzt den ersten `x` auf 0 und den letzten auf 768 (fehlt einer: Knoten ergänzen mit dem Wert des Nachbarn). Bei mehr als 65 Knoten
  bleiben die ersten 64 plus der Endknoten. Bei weniger als 2 gültigen Knoten ist die Form ungültig. `n`: Steuerzeichen entfernt, ≤ 24 Zeichen.
  Feste Schlüssel-Reihenfolge `v, n, k`.

### 3.2 Klang

```js
sound.p.l1shape = 5      // NEU als erlaubter Wert: 5 = Gemalt (0–4 wie bisher)
sound.p.l1f = form        // NEU, nur vorhanden, wenn je gemalt oder gewählt; bleibt erhalten, wenn man auf Sinus usw. zurückschaltet
sound.p.l2shape, sound.p.l2f   // genauso für LFO 2
```
- `normAnalog`: Bereich `l1shape`/`l2shape` wird `[0, 5, 1]` (Z. 13257). `normSynthP`: `if (p.l1f) { const f = formNorm(p.l1f); if (f) o.l1f = f; }`,
  ebenso `l2f`. **Steht `l1shape` auf 5 ohne gültige `l1f`, wird `l1shape` 1 (Dreieck)** [A] (immer gleich, damit Laden zweimal dasselbe ergibt).
- Bei Takt-Form 5 muss `l1sync > 0` sein. `normAnalog` setzt `l1sync = 4` (1 Takt), wenn `l1shape = 5` und `l1sync = 0` ist [A].
- `soundHash` ändert sich nur für Klänge mit Form (die Form steckt in `p`). Alte Klänge behalten ihren Hash.
- Sound sichern (Bibliothek), Kopieren/Einfügen, Spur duplizieren, Timbre kopieren und Klang-Lock (`clip.kl[].s`, I2) tragen `l1f`/`l2f` als tiefe Kopie mit.

### 3.3 Super-Regler (nur mit I1)

```js
S.sr.f = form                                   // NEU (zu I1 §4.1): Kurve für die nächste Fahrt; fehlt = Gerade (wie I1)
song.sr = [{a, b, x0, x1, f?: form}]            // I1 §4.2: f war „für I3 reserviert“ – I3 legt fest: f enthält die Form selbst
```
- `srNorm`/`srSongNorm` (I1) rufen `formNorm` für `f` auf. Eine ungültige Form entfällt, und die Fahrt ist dann gerade.
- Song-Werkzeuge (I1: `srShift`, `srClear`, `srTidy`, `srCutTo`, `srWrite`): `f` reist unverändert mit. **Kürzt** ein Werkzeug eine Fahrt,
  gilt `f` für die verbleibende Länge (die Form wird auf die neue Länge gedehnt, wie `x0`/`x1` nach I1s Regel bleiben) [A].
- Eine Fahrt ohne `f` ist genau die Gerade aus I1 (bitgleich, I3-30).

### 3.4 Einsetzen: keine neuen Felder

- **MS-2000-Mod-Sequenz:** I3 schreibt einmalig in `p.mk.t[t].seq.q[k].v` (16 Werte) und `.m` (Bewegung) über `timApply`. Der Sound merkt
  sich keine Form (§6.6).
- **I2-Reihe:** I3 schreibt einmalig über `lanePut(t, s, path, werte[], {len, g})` (freie Reihe) bzw. über **`lockPut(t, s, path, werte[], {g})`**
  (Reihe „An Noten“, schreibt `note.lk.v[path]` in die Noten der passenden Schritte). `lockPut` legt **I2a** neben `lanePut` an. Ist I2a
  schon gebaut, ergänzt I3e die Funktion dort (gleiche Undo-Art Clip, ein Undo) [A].

### 3.5 Meine Formen (auf dem Gerät)

- Gespeichert im vorhandenen Geräte-Speicher `KV` unter `'forms'`: `[{id, n, k, at}]`, höchstens 64, neueste zuerst. Nicht im Projekt, nicht
  online (wie die Sound-Bibliothek) [A]. Im Projekt steckt jede benutzte Form ohnehin als Kopie.
- Privates Fenster oder gesperrter Speicher: Liste leer, „Sichern“ grau mit Grund „Speicher nicht verfügbar“. Nichts wirft einen Fehler.

### 3.6 Laufzeit (nicht gespeichert)

`UI.form = {target, raw: Int16Array(769) | null, lastStroke: {before, rawForm, cleanForm} | null, grid, mode: 'malen'|'wischen', clean: true}`.
`lastStroke` erlaubt das Umschalten von „Aufräumen“ für den letzten Strich, solange das Blatt offen ist (§5.4).

### 3.7 Ältere App-Versionen

Eine Version vor I3 klemmt `l1shape = 5` auf 4 (S&H) und verwirft `l1f` beim Speichern. Das Hinweisband VO-R1 („neuere Version“) erscheint
dort schon. `max_app` muss die I3-Version decken (Regel 20).

---

## 4. Klang, DSP und Zeit

### 4.1 Auswerten einer Form

```
FORM.eval(f, ph, e)        ph ∈ [0, 1) = Phase im Zyklus, e = Kantenbreite als Phasenanteil
  u = ph · 768;  Abschnitt i mit x_i ≤ u < x_{i+1};  s = (u − x_i) / (x_{i+1} − x_i)
  t = 0 Halten:  y_i
  t = 1 Gerade:  y_i + (y_{i+1} − y_i) · s
  t = 2 Kurve:   y_i + (y_{i+1} − y_i) · g(s),   g(s) = (e^{κs} − 1) / (e^{κ} − 1),  κ = 0,06 · b   (b = ±100 → κ = ±6)
  Ergebnis / 1000 → −1…+1
Kanten: jeder Sprung (Ende eines Halten-Abschnitts mit y_{i+1} ≠ y_i, Abschnitt der Länge 0, Zyklus-Ende mit y_768 ≠ y_0) wird
  kausal als lineare Rampe der Breite e ab der Sprungstelle gerechnet (wie MK6 „Stufe = 1-ms-Rampe“).
  e = min(0,001 s / Zyklusdauer, ¼ · Länge des folgenden Abschnitts)
```
- **Kurve:** `b < 0` = erst schnell, dann langsam (Pumpen-Erholung). `b > 0` = erst langsam, dann schnell. Bei `|κ| < 1e-4` wird `g(s) = s`
  gerechnet (kein 0/0).
- **Kantenbreite 1 ms** [A]: Bei 120 BPM und Takt 1/32 ist ein Zyklus 62,5 ms lang, die Kante also 1,6 % des Zyklus. Besteht Gate → Lautstärke
  die Klick-Prüfung M-KLICK nicht (I3-06), wird sie 2 ms. Das steht dann im Changelog.
- Dieselbe Funktion gibt es zweimal: im Worklet (ASCII, ohne Objekte) und im Haupt-Faden (`FORM.eval`). Ein Test vergleicht beide (I3-03).

### 4.2 Worklet (`dirigent-analog`, AnalogCore)

- **Nachricht** `{lf: {n: 1 | 2, k: Float32Array | null}}`, `k` = flach `[x/768, y/1000, t, b/100] × N`. Sie wird geschickt:
  (a) von `syncEngine(i, true)` **nur, wenn** `l1shape === 5` bzw. `l2shape === 5` ist (sonst bleibt der Voll-Abgleich byte-gleich, I3-01);
  (b) beim Malen/Einwischen höchstens 30-mal je Sekunde (gesammelt wie `wkSet`/`wkFlush`, Z. 18149);
  (c) beim Laden eines Klang-Locks (I2 `{kl: {…, lf}}`) für den Nebenkern.
- **Speicher:** je LFO zwei vorab angelegte `Float64Array(4 · 65)` (aktiv und alt) und eine Zählvariable. Der Empfang kopiert in die alte
  Tabelle und tauscht dann. In `process()` gibt es keine Allokation.
- **Wechsel ohne Klick:** Kommt eine neue Tabelle, während die Form klingt, blendet `lfoVal` **5 ms** linear von alt nach neu
  (Zähler im Steuer-Takt: 5 ms / (CR/SR) = 15 Steuerblöcke bei 48 kHz).
- **`lfoVal` Fall 5:** `case 5: return this.formVal(n, ph)`. Die Kantenbreite `e` kommt aus der Zyklusdauer `l1sync · 60 / bpm`, die
  `control()` ohnehin kennt (`r1`). Abschnittssuche mit Merker je LFO und je Stimme (die Phase läuft vorwärts → im Mittel O(1)), bei einem
  Rücksprung Binärsuche über ≤ 65 Knoten.
- **Fehlt die Tabelle** (Wettlauf beim Laden), liefert Fall 5 den Wert 0 und zählt `lfMiss`. In allen Abnahmen muss `lfMiss` 0 sein.
- **Ohne Form 5** wird der neue Code nie erreicht (gleicher `switch`, Fall 5 steht vor `default`). Die übrigen Formen bleiben bitgleich.

### 4.3 Takt-Lage (gleich in Song, Export und Video)

- Eine gemalte Form läuft **immer im TAKT** (`l1sync` > 0, Werte aus `LFO_SYNC` 8/1 … 1/32, Vorgabe beim ersten Wählen: **1/1 = ein Takt**).
- Phase wie heute (Z. 9701): `ph = frac((t − songStart) / spb / l1sync)` bei laufendem Transport. Damit gilt:
  - Song-Start an Takt n: Die Phase ist die von Takt n (bei 1/1 genau 0).
  - Tempo-Wechsel: Das Worklet verankert `songStart` neu (`tempoAt`). Die Phase läuft stetig weiter, ohne Sprung (I3-04).
  - Schleifen-Rücksprung: Die Phase springt auf die des Schleifenanfangs. Bei ganzen Takten ist das wieder Zyklusbeginn (wie jeder TAKT-LFO heute).
  - **Start NOTE:** Die Phase beginnt je Stimme bei 0 (Z. 9619). Das ist ebenfalls deterministisch, weil es nur von den Notenzeiten abhängt.
- Ohne laufenden Transport (Vorhören auf der Tastatur) läuft die Phase frei. So ist es heute auch.
- **Offline (Audio-Export, Video VV1):** `vvSwapIn` ruft `syncEngines()`. So bekommt jede Engine die Tabellen vor dem ersten Block. Zwei
  Offline-Render sind bitgleich, und offline klingt wie live (I3-05).

### 4.4 Nativer Weg (WT, ECO-Rückfall, `?engine=native`, Spur-Effekt-Routen `fx.*`)

- `LFO_FX_SHAPE[5] = 'form'`. `FX.lfoBuffer(ctx, 'form', seed, {form, e})` baut **einen** Zyklus aus **2048** Samples:
  `d[i] = FORM.eval(form, i / 2048, e)` mit `e` = 1 ms bezogen auf die Zyklusdauer beim aktuellen Tempo (mindestens 1 Puffer-Sample).
- `syncLfoSet` (Z. 17686): Der Schlüssel `lkey` wird für Form 5 zu `'form:' + hash(form) + '|' + sync + '|' + S.bpm`. Eine Formänderung oder
  ein Tempowechsel baut den Puffer neu und startet ihn **phasengleich** über `L.start(lfoAnchor(), S.bpm, now)`. Der Tausch geht über eine
  Gain-Blende von 5 ms (alt aus, neu ein), damit nichts klickt.
- `lfoSink` hält auch diesen LFO am Laufen (K1-Fix „LFOs halten an“).

### 4.5 Anzeigen (eine Formel für alles)

- `lfoNow(i, P, n, t)` (Laufpunkte an den Reglern), Vorschau `drawShape` und `lfoPrevFrame` (Laufpunkt) rufen für Form 5 `FORM.eval`. Die
  **Vorschau zeigt bei ✎ einen Zyklus** über die ganze Breite (statt zwei). So ist die gemalte Form lesbar [A].
- **VV3 (Video, Innenleben):** Die LFO-Welle mit Phasenpunkt nutzt `FORM.eval` und dieselbe Phase wie §4.3. Das Bild stimmt also mit dem Klang
  (VV3-01: ± 2 % Phase).
- **Mod-Übersicht (K1, `k1Mods`):** Die Quelle heißt bei Form 5 „LFO 1 ✎“ bzw. „LFO 1 ✎ Pumpen“ (mit Namen). Es gibt keine neuen Zeilen, denn
  die Form ist keine Modulation, sondern die Welle einer vorhandenen Quelle.

### 4.6 Super-Regler-Fahrt mit Kurve (I3f, nur mit I1)

```
G(u) = (FORM.eval(f, u, e_r) + 1) / 2   für u ∈ [0, 1)  und  G(1) = (y_768 / 1000 + 1) / 2   (keine Wrap-Kante: die Form gilt einmal)
F̂(u) = G(u) − G(0) · (1 − u) + (1 − G(1)) · u          → F̂(0) = 0 und F̂(1) = 1 genau
x(t) = clamp( x0 + (x1 − x0) · F̂(u), 0, 1 ),   u = (t − t0) / (t1 − t0),   e_r = 0,020 s / (t1 − t0)
```
- Die Form wird **einmal über die ganze Fahrt gedehnt** (Frage F2). Die Korrektur `F̂` sorgt dafür, dass die Fahrt **genau** bei der aktuellen
  Stellung beginnt und genau am Ziel endet (I1 §5.6: „kein Sprung“). Eine Form, die links unten beginnt und rechts oben endet, bleibt unverändert.
- **Kanten der Fahrt** bekommen **20 ms** statt 1 ms. Das ist dieselbe Zeit wie die Glättung der Stellung in I1 §5.3, weil Sprünge der Stellung
  viele Regler zugleich bewegen.
- **Worklet:** I1s Nachricht `{sr: {ramp: {x0, x1, t0, t1}}}` bekommt **`k`** (Knoten wie §4.2). Ohne `k` ist sie die Gerade aus I1, und die
  Nachricht bleibt byte-gleich. Mit `k` rechnet `SRCore` `x(t)` je 128er-Block exakt (keine Glättung, wie die Gerade).
- **Nativ und Drums** (I1 §5.5: Stufen alle 16 ms, `srAt(t)` je Schlag) rechnen `x(t)` mit `FORM.rideAt(entry, t)`, derselben Formel im
  Haupt-Faden.
- **Matrix-Fahrt** (nicht gespeichert) nutzt `S.sr.f`. **Song-Fahrt** nutzt `song.sr[i].f` (beim Merken aus `S.sr.f` kopiert).

### 4.7 Einsetzen: Abtastung

- **Mittelwert je Schritt** `w̄_j` = Mittel von `FORM.eval(f, (j + (m + 0,5)/32)/L, 0)` über m = 0…31 (32 Teilpunkte, ohne Kanten).
- **Wert am Schrittbeginn** `w_j = FORM.eval(f, j/L, 0)`.
- **MS-2000-Mod-Sequenz** (L = LÄNGE `last` der Sequenz, der Zyklus der Form = die ganze Sequenz):
  - Bewegung: **Stufe**, wenn die Form nur aus Halten-Abschnitten besteht, sonst **Glatt** [A].
  - Werte: Stufe → `w̄_j`, Glatt → `w_j` (die Sequenz verbindet dann linear, wie die Form).
  - `v_j = round(w · R · τ)`, `R` = 63 (Tonhöhe und OSZ2-Halbton: 24, Schrittlänge: 6, wie MK6), `τ` = Tiefe 0–100 % (Vorgabe 100 %).
    Die Schritte nach `last` bleiben unverändert.
- **I2-Reihe** (Reihen-Raster `g`, Zyklus der Form = **ein Takt**, `len = 4 Schläge / GRID[g]`, z. B. 1/16 → 16, 1/32 → 32, 1/16T → 24;
  höchstens 64):
  - `x_j = Unten + (w̄_j + 1)/2 · (Oben − Unten)`, im Reglerraum 0…1, auf 1/1000 gerundet. Stufige Ziele (`vals`) werden auf den nächsten
    erlaubten Wert gerundet.
  - Vorgabe `Unten`/`Oben` = Reglerstand des Grundwerts ∓ 0,25, geklemmt auf 0…1 [A].
  - Reihe „An Noten“: nur Schritte mit Note bekommen einen Wert. Vorher erscheint der Hinweis „n Werte ohne Note entfallen“ (wie I2 §6.5).

### 4.8 CPU- und Zeitrahmen (M-CPU: Chromium-Worklet, Median 10 s; iPhone-Faktor 1,5–2,5 × angenommen wie in I2)

| Teil | höchstens |
|---|---|
| ohne Form 5 | **± 0** (gleicher Weg, bitgleich) |
| LFO 1 + 2 gemalt, Start FREI (einmal je Steuerblock) | + 0,02 Prozentpunkte gegenüber Dreieck |
| LFO 1 + 2 gemalt, Start NOTE, 8 Stimmen (je Stimme) | + 0,15 Prozentpunkte gegenüber Dreieck |
| Tabellen-Wechsel (5-ms-Blende) | keine Spitze > + 0,05 Prozentpunkte |
| Speicher im Worklet | 4 × 65 × 4 × 8 Byte ≈ 8 KB je Spur, beim Bau angelegt |
| Haupt-Faden: Zeichnen des Felds | ≤ 2 ms je Bild (Median), ≤ 60 Bilder/s, nur bei offenem Blatt |
| Haupt-Faden: Aufräumen beim Abheben | ≤ 5 ms (Median), ≤ 20 ms mit 4-fach gedrosselter CPU; keine Aufgabe > 50 ms |
| Einwischen: Nachrichten an das Worklet | ≤ 30 je Sekunde, je ≤ 1,1 KB |
| nativer Puffer neu bauen | ≤ 1 ms (2048 Werte) |

**Unter Last** ändert sich nichts am Klang (K1-Antwort 2 [X]). Formen werden nie vereinfacht.

---

## 5. Aufräumen (Erkennung) und Einwischen

### 5.1 Eingabe beim Malen

- Das Feld nutzt Pointer-Ereignisse mit `touch-action: none` und `setPointerCapture`. Gibt es `getCoalescedEvents()` (iOS-Safari ab 18.2 [W]),
  werden alle Zwischenpunkte genommen; deren `pointerId` wird ignoriert (bekannter Fehler der ersten Fassung [W]). Sonst kommt ein Punkt je Bild
  (60 Hz, das Display des iPhone 12 Pro Max hat 60 Hz [W]).
- Koordinaten: `u = clamp((X − links)/Breite · 768, 0, 768)`, `y = clamp((Mitte − Y)/(Höhe/2 − 8 px) · 1000, −1000, 1000)`. Oben und unten
  bleiben 8 px Rand, damit man ±1 sicher trifft.
- **Malpuffer** `raw[0…768]` (eine Zahl je Tick). Zwischen zwei Punkten wird linear gefüllt, und der **letzte Strich gewinnt**: Fährt der Finger
  zurück, überschreibt er. Der **berührte Bereich** `[u_min, u_max]` wird mitgeschrieben.
- **Übermalen:** Nur der berührte Bereich wird ersetzt. Der Rest der Form bleibt Knoten für Knoten gleich (I3-15). Passt der Wert an der Grenze
  nicht zur alten Form, entsteht dort eine Kante. Sie rastet wie jede Kante auf das Raster ein.
- Ein Strich, der kürzer als 4 Ticks und kürzer als 150 ms ist, gilt als Tipp und ändert nichts.

### 5.2 Aufräumen: Schritte und Zahlen

Gerechnet wird nur auf dem berührten Bereich, ± ein Rasterfeld zum Verbinden mit den Nachbarknoten. `y` in Einheiten von 1/1000, volle Höhe = 2000.
`Z` = Rasterfeld in Ticks (1/16 → 48).

1. **Entzittern:** gleitender Median über 5 Ticks.
2. **Grob zerlegen:** Ramer-Douglas-Peucker [W] mit **senkrechtem** Abstand (die Form ist eine Funktion von `u`), ε = 40 (2 % der Höhe).
3. **Kanten:** Ein Abschnitt mit Δu ≤ 6 Ticks (≤ 1/128 Zyklus) und |Δy| ≥ 150 wird eine senkrechte Kante.
4. **Flach:** Ein Abschnitt mit |Δy| ≤ 60 (3 %) und Länge ≥ ½ Z wird „Halten“ auf seinem Mittelwert.
5. **Gerade oder Kurve:** Bei RMS-Abweichung der entzitterten Punkte von der Geraden ≤ 60 (3 %) wird der Abschnitt „Gerade“. Sonst wird `b`
   angepasst (Goldener Schnitt, 24 Schritte, b ∈ [−100, 100]). Bei RMS ≤ 60 wird er „Kurve“, sonst wird er an der größten Abweichung geteilt und neu
   geprüft (höchstens 4 Stufen tief).
6. **Zeit einrasten:** Kanten sowie Anfang und Ende von Geraden und Kurven springen auf die nächste Rasterlinie, wenn sie höchstens ⅓ Z davon
   entfernt sind. Sonst bleiben sie auf ihrem Tick.
7. **Höhe einrasten:** Für Halten-Werte und Rampen-Enden gilt: |y| ≥ 920 → ±1000; |y| ≤ 40 → 0; sonst das nächste Vielfache von 125 (1/16 der
   Höhe), wenn es höchstens 40 entfernt ist; sonst auf 5 gerundet.
8. **Saubere Treppen:** Für ≥ 3 aufeinander folgende Halten-Abschnitte (nur durch Kanten getrennt) prüft die App zwei Dinge: Liegen ihre
   Längen höchstens ±20 % neben ihrem Median? Haben die Höhensprünge dasselbe Vorzeichen und liegen sie höchstens ±25 % neben ihrem Median?
   Dann bekommen alle Stufen die gleiche Länge (Median, auf ganze Z gerundet, ab der ersten Kante) und gleich große Sprünge (gleichmäßig
   vom ersten bis zum letzten Wert).
9. **Zusammenfassen:** Nachbar-Geraden mit Steigungen innerhalb ±10 % werden eins. Nachbar-Halten mit |Δy| ≤ 20 werden eins.
10. **Grenze:** Gibt es mehr als 32 Abschnitte, wiederholt die App ab Schritt 2 mit ε · 1,25 (höchstens 6-mal).
11. **Naht:** Ist |y_768 − y_0| ≤ 60, wird `y_768 = y_0` gesetzt. Dann springt die Form an der Zyklusgrenze nicht.

Ergebnis: neue Knotenliste und Zählung `{rampen, stufen, kanten}` für die Infozeile.

### 5.3 Rückmeldung beim Einrasten [V]

- Beim Abheben gleitet die blasse Rohlinie (40 % Deckkraft) in **150 ms** in die aufgeräumte Form (bei `prefers-reduced-motion` ohne Gleiten).
- **Haptik** `snap` einmal beim Einrasten. Während des Malens gibt es `tick`, wenn der Finger eine **Viertel-Linie** überquert (höchstens 1 je 30 ms,
  vorhandene Drossel).
- Erkannte Treppen und Geraden leuchten 300 ms in der Spurfarbe auf.
- Die Infozeile meldet „Aufgeräumt: 2 Rampen · 8 Stufen“ (Zahlen aus Schritt 11).

### 5.4 Aufräumen aus [V]

- Der Schalter **[Aufräumen ✓]** im Blatt (Vorgabe an, Wahl im Geräteprofil `uiPrefs`) gilt für die nächsten Striche.
- Ist er aus, laufen nur Schritt 1 und ein RDP mit ε = 10 (0,5 %). Alle Abschnitte werden dann „Gerade“, höchstens 64 (ε wächst bei Bedarf).
- **Umschalten direkt nach einem Strich** wendet die neue Wahl auf **diesen** Strich an: `lastStroke`, ein Undo, Bezeichnung „Aufräumen an/aus“.
  Das geht bis zum nächsten Strich oder bis das Blatt schließt. Danach gibt es keine Rohdaten mehr (sie werden nicht gespeichert).

### 5.5 Einwischen

- Geht nur bei **laufendem Transport** (▶). Sonst ist die Taste grau mit dem Grund „Einwischen geht bei laufendem Loop (▶)“.
- Die waagrechte Lage des Fingers zählt nicht. Bei jedem Ereignis (samt Zwischenpunkten) rechnet die App die **gehörte** Zeit:
  `t_h = AU.ctx.currentTime − (performance.now() − e.timeStamp)/1000 − AU.outLat − 0,030 s`
  Dabei ist `AU.outLat` die gemessene Ausgabe-Verzögerung, und 0,030 s sind die Verzögerung vom Finger bis zum Ereignis [A, am Gerät prüfen].
  Daraus folgt die Phase des Ziels (`ph(t_h)` nach §4.3; MS-2000-Sequenz: Zyklus = Summe der Schrittlängen; I2-Reihe: `len · GRID[g]`).
  Die Höhe des Fingers wird bei `u = ph · 768` in den Malpuffer gemalt, linear verbunden mit dem vorigen Punkt. Über die Zyklusgrenze geht es
  bei 0 weiter, und nach einer ganzen Runde überschreibt die neue Runde die alte.
- **Hören während des Wischens:** Alle 33 ms geht der Rohstand (RDP ε 10) an die Engine. Man hört ihn also im nächsten Durchlauf.
  **Beim Abheben** wird aufgeräumt (wenn an), mit `snap`, und die aufgeräumte Form geht an die Engine (5-ms-Blende, §4.2). Das ist ein Undo
  je Wisch-Geste.
- **Anzeige:** Ein senkrechter Laufstrich an der gehörten Stelle läuft über das Feld. Die Fingerhöhe ist ein Punkt auf dem Strich, und der
  überschriebene Bereich ist hell hinterlegt.
- Bei der Super-Regler-Kurve gibt es kein Einwischen, weil eine Fahrt keinen wiederkehrenden Zyklus hat (Taste grau mit Grund) [A].

---

## 6. Bedienung

### 6.1 Überblick: wo was erscheint [V]

| Ort | neu |
|---|---|
| Synth-Editor, Seite LFO 1 / LFO 2 (`pageLfo`) | 6. Form **✎** in der Form-Leiste; Vorschau zeigt die Form; Tipp auf die Vorschau bei ✎ öffnet das **Form-Blatt** |
| Form-Blatt | Malfeld, Malen/Einwischen, Raster, Aufräumen, Bibliothek, Meine Formen, Infozeile, ↶ ↷, je nach Ziel Tiefe bzw. Unten/Oben |
| MS 2000: Sequenz-Werkzeuge (`seqToolsPop`, SHIFT + 5) | Zeile **„Aus Form“** [S1] [S2] [S3] |
| I2: Reihen-Optionen [⋯] | Zeile **„Aus Form …“** |
| I1: Super-Regler-Feld | Chip **Kurve** (Mini-Kurve + ▾) neben [⇥ bis zum nächsten Teil]; Teil-Blatt-Zeile der Fahrt zeigt die Kurve |
| Mod-Übersicht (K1) | Quelle „LFO 1 ✎ (Name)“ |

### 6.2 LFO-Seite [V]

- Die Form-Leiste bekommt das 6. Feld **✎** (`LFO_SHAPE_ICO[5] = '✎'`, `LFO_SHAPE_NAME[5] = 'Gemalt'`, aria-label „LFO n Form Gemalt“), ≥ 44 × 44.
  Das Feld ist immer da, die Höhe der Seite ändert sich also nicht. In P3 (320 px) bricht die Zeile wie heute um, immer gleich.
- Der **erste Tipp auf ✎** (noch keine `l1f`) wählt Form 5, setzt TAKT 1/1, wenn FREI war, und legt als Startform ein **Dreieck** an
  (`[[0, −1000, 1, 0], [384, 1000, 1, 0], [768, −1000, 0, 0]]`, so hört man sofort etwas) [A]. Dann öffnet sich das Form-Blatt. Das ist ein Undo
  („LFO 1 Form Gemalt“). Gibt es schon eine `l1f`, schaltet der Tipp nur auf ✎ (ein Undo), ohne das Blatt zu öffnen.
- Bei ✎ ist **FREI grau** mit dem Grund „Gemalte Formen laufen im Takt“. Der Takt-Regler (Länge 8/1 … 1/32) bleibt bedienbar.
- **Vorschau** (`.lfopv`, ≥ 120 × 44): zeigt einen Zyklus der Form mit Laufpunkt, darunter klein den Namen („Pumpen“/„Gemalt“). Bei ✎ ist die
  Vorschau eine Taste, und ein Tipp öffnet das Form-Blatt. Bei anderen Formen tut ein Tipp wie heute nichts.
- Zurück auf Sinus usw.: `l1f` bleibt gespeichert, und ein späteres ✎ bringt die Form zurück.

### 6.3 Das Form-Blatt [V]

Das Blatt liegt **über dem Editor-Bereich** und lässt die Tastatur frei, damit man Noten spielen und die Form hören kann. Es hat eine feste Höhe
(oben die sichere Zone, unten die Oberkante von `#kbArea`), darum gibt es keinen Layout-Sprung (± 0 px). Es kommt aus dem Block `sq-form-src`.

**Hochformat (428 × 926; innen 396 px breit; Maße in px; alle Tasten ≥ 44 × 44):**
```
│ [◂ Fertig]   Form · LFO 1 · Synth 2                         [↶] [↷] │ 44
│ [Pumpen] [Gate] [Triller] [Meine ▾] [＋ Sichern]  ⟶ (scrollt per Finger)│ 44
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │  Malfeld 396 × Rest (≥ 160; 428×926 mit Tastatur 170: ≈ 300)       │ │
│ │  Rasterlinien, Viertel kräftiger, Mittellinie, Form 2 px Spurfarbe │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│ 1 Takt · 16 Felder · Aufgeräumt: 2 Rampen · 8 Stufen                 │ 24 Infozeile
│ [✎ Malen] [≋ Einwischen]   [Raster 1/16 ▾]   [Aufräumen ✓]           │ 44
│ (nur beim Einsetzen:)  [Tiefe 100 %]  bzw.  [Unten 30 %] [Oben 80 %] │ 56 Regler (senkrecht ziehen, Fein-Modus)
```
**Querformat (926 × 428; mit sicherer Zone ≈ 832 px breit; Blatthöhe ≈ 428 − Tastatur 110…150):**
```
│ [◂ Fertig] Form · LFO 1 · Synth 2   1 Takt · 16 Felder · Aufgeräumt …   [↶][↷] │ 44
│ ┌──────────────────── Malfeld ≈ 648 × Rest (≥ 120) ────────────────┐ ┌────────┐ │
│ │                                                                  │ │Pumpen  │ │ rechte Spalte 168 px:
│ │                                                                  │ │Gate    │ │ Bibliothek als Liste (Zeilen 44,
│ └──────────────────────────────────────────────────────────────────┘ │Triller │ │ scrollt per Finger), Meine Formen,
│ [✎ Malen][≋ Einwischen] [Raster 1/16 ▾] [Aufräumen ✓] [Tiefe …]       │Meine ▾ │ │ ＋ Sichern
```
- In L2 (667 × 375) ist das Malfeld ≈ 470 × 130. In P3 (320 × 568) ist es 288 × ≥ 160. Die Beschriftungen dürfen kürzer werden („Wischen“,
  „Aufr. ✓“), werden aber nie abgeschnitten (M-PLATZ mit echter App-Schrift).
- **Kopfzeile** nennt das Ziel: „Form · LFO 1 · Synth 2“, „Form → SEQ 2 · T1 · Synth 3“, „Form → Reihe ◆ OP 2 Pegel“, „Kurve der Fahrt“.
- **Raster ▾:** 1/4 · 1/8 · 1/16 · 1/32 · 1/8T · 1/16T (Vorgabe 1/16, gemerkt im Geräteprofil). Die Zahl der Felder ist
  Zykluslänge / Raster. Unter 2 Felder wird automatisch das nächstfeinere Raster genommen, über 64 das nächstgröbere. Bei der
  Super-Regler-Kurve heißt die Wahl „4 · 8 · 16 Felder“ (eine Fahrt hat keine feste Taktlänge).
- **Laufanzeige:** Bei ▶ läuft ein senkrechter Strich an der gehörten Stelle durch das Feld (≤ 30 Bilder/s, nur wenn sich etwas ändert).
- **Schließen:** mit [◂ Fertig], mit Editor schließen, Zurück zu SPIEL, Szenenwechsel, ■■/Panik, Projekt laden. Ein laufender Strich wird
  dann wie `pointercancel` verworfen (Regel 6/10), alles andere ist schon gespeichert.
- **Undo:** [↶] [↷] sind der normale Undo-Stapel. Ein Strich, eine Wisch-Geste, eine Bibliothekswahl und ein Umschalten von „Aufräumen“
  sind je ein Schritt. Die Undo-Art hängt vom Ziel ab (§6.9).

### 6.4 Malen und Einwischen

- **[✎ Malen]** (Vorgabe): wie §5.1–5.3. Zwei Finger auf dem Feld tun nichts (kein Zoom).
- **[≋ Einwischen]:** wie §5.5. Die Wahl bleibt, bis man umschaltet. Hält der Transport an, springt sie auf Malen zurück.
- **Rand:** Das Feld beginnt ≥ 16 px vom Bildschirmrand. Ein `pointercancel` (z. B. eine Systemgeste vom Rand) verwirft den laufenden Strich,
  und die Form bleibt, wie sie war.

### 6.5 Bibliothek und Meine Formen [V]

Ein Tipp auf eine Bibliotheksform **kopiert** sie in das Ziel (ein Undo, Name wird übernommen). Feste Knoten [A] (Frage F3):

| Name | Gedacht für | Knoten `[x, y, t, b]` (Zyklus = 1 Takt bei 1/1) |
|---|---|---|
| **Pumpen** | Lautstärke | je Viertel q = 0…3: `[192q, −1000, 2, −60]`, `[192q + 134, 1000, 0, 0]`; Ende `[768, 1000, 0, 0]` (fällt auf jedem Viertel, erholt sich in 70 % des Viertels, schnell zuerst) |
| **Gate** | Lautstärke, Filter | 1/16-Muster **x.xx.xx.x.xx.xx.** (Schritte 1, 3, 4, 6, 7, 9, 11, 12, 14, 15 an): je An-Schritt, i = Schritt − 1: `[48i, 1000, 0, 0]`, `[48i + 41, −1000, 0, 0]` (85 % Länge); Ende `[768, −1000, 0, 0]` |
| **Triller** | Tonhöhe | 32 Abschnitte à 24 Ticks: `[24j, j gerade ? 0 : 1000, 0, 0]` für j = 0…31; Ende `[768, 1000, 0, 0]` (Wechsel alle 1/32 zwischen Grundton und oben; die Höhe des Trillers stellt die Route LFO → Tonhöhe ein) |

- Routen werden **nicht** automatisch angelegt (Regel 27). Man verbindet den LFO wie gewohnt (Regler halten → LFO 1).
- **Meine Formen:** **[＋ Sichern]** fragt nach einem Namen (Vorgabe „Form n“) und speichert eine Kopie auf dem Gerät (§3.5). **[Meine ▾]**
  zeigt die Liste (Zeilen ≥ 44 px, Mini-Kurve links, scrollt per Finger). Ein Tipp setzt die Form ein (Kopie, ein Undo), **[✕]** löscht nach
  Rückfrage. Löschen ist kein Projekt-Undo, denn die Liste gehört dem Gerät.
- In der Super-Regler-Kurve steht zusätzlich **[Gerade]** vorne. Das entfernt die Kurve.

### 6.6 Einsetzen in die MS-2000-Mod-Sequenz [V]

- Im Werkzeug-Blatt der Sequenz (`seqToolsPop`) gibt es eine neue Zeile **„Aus Form“** mit [S1] [S2] [S3] (je ≥ 44 × 44), gleich gebaut wie
  die Zeilen „Neu“ und „Tauschen“. Das Bedienfeld selbst bleibt unverändert („wie am Gerät“).
- Ein Tipp öffnet das Form-Blatt mit dem Ziel „SEQ k · T n“. Die Startform ist die heutige Sequenz, als Form gelesen (Stufe → Halten-Abschnitte,
  Glatt → Geraden durch die Schrittwerte). Unten steht **[Tiefe 100 %]**.
- **Jeder fertige Strich** (bzw. jede Bibliothekswahl) setzt sofort neu ein (§4.7) über `timApply(i, 'SEQ k aus Form', …)`, ein Undo. So
  hört man es im nächsten Durchlauf. Die LCD-Zeile meldet „SEQ 2 ← FORM · STUFE · 16“.
- Nach [Fertig] besteht keine Verbindung mehr. Wer danach die Säulen in der Ansicht SCHRITTE ändert, ändert keine Form, und umgekehrt (I3-28).
- Ziel, LÄNGE, Typ, Lauf, Key Sync und Auflösung der Sequenz bleiben, wie sie sind. Nur Werte und Bewegung ändern sich.

### 6.7 Einsetzen in eine I2-Reihe [V] (nach I2a + I2c)

- In I2s Reihen-Optionen [⋯] gibt es die Zeile **[Aus Form …]** (≥ 44 px). Sie öffnet das Form-Blatt mit dem Ziel „Reihe ◆ ‹Name›“.
  Unten stehen **[Unten]** und **[Oben]** als kleine Regler im Reglerraum des Ziels, mit Anzeige in dessen Einheit (z. B. „800 Hz“).
- Jeder fertige Strich setzt neu ein (§4.7): bei einer **freien** Reihe `lanePut` mit `len` = Schritte eines Takts im Reihen-Raster, bei einer
  Reihe **„An Noten“** `lockPut`. Je Strich gibt es ein Undo (Undo-Art Clip). Bei „An Noten“ steht der Hinweis „n Werte ohne Note entfallen“
  einmal in der Infozeile.

### 6.8 Super-Regler-Kurve [V] (nach I1c + I1e)

- Im Super-Regler-Feld gibt es den Chip **Kurve** (≥ 52 × 44, zeigt eine Mini-Kurve von `S.sr.f`, sonst eine Gerade, dazu ▾).
  - Hochformat: in der unteren Zeile zwischen NEIGEN und [⇥ bis zum nächsten Teil]. NEIGEN wird dafür 56 px schmaler und bleibt ≥ 104 px breit.
  - Querformat: am Ende der Ziel-Chip-Zeile.
  - Mit offenem Editor (170 px Feld): am Ende der Chip-Zeile.
- Ein Tipp öffnet das Form-Blatt „Kurve der Fahrt“. Das Feld zeigt den Weg von unten (Startstellung) nach oben (Ziel), dazu dünn die korrigierte
  Kurve `F̂` (§4.6), so wie sie wirklich gefahren wird. Einwischen ist grau. Änderungen schreiben `S.sr.f` (Undo-Art `'sr'`).
- **Im Song:** Merkt I1 eine Fahrt (`song.sr`), kopiert es `S.sr.f` in den Eintrag. Die Teil-Blatt-Zeile „Super-Regler-Fahrt T. 13–17 [✕]“
  zeigt links die Mini-Kurve. Ein Tipp auf die Zeile öffnet das Form-Blatt für **diesen** Eintrag (Undo-Art `'song'`).
- Der Streifen der Fahrt in der Song-Ansicht (I1: steigender Keil) zeigt bei einer Kurve deren Verlauf statt des Keils (gleiche Höhe 8 px).

### 6.9 Undo, Speichern, Hilfe, Test-API

- **Undo-Arten:** LFO-Form → `'sound'` (`soundSnapshot`/`commitSound`, z. B. „LFO 1 Form gemalt“, „LFO 1 Form Pumpen“); Mod-Sequenz → über
  `timApply` (Sound); I2-Reihe → Clip (I2); Super-Regler-Kurve → `'sr'` bzw. `'song'` (I1). Der „geändert“-Punkt erscheint sofort (Regel 7).
  Der Klang-„geändert“-Punkt und A/B folgen der LFO-Form (sie gehört zum Klang).
- **Hilfe:** drei Sätze (Mal-LFO, Aufräumen/Übermalen, Einwischen) ohne Hersteller- oder Produktnamen.
- **Test-API:** `SYNQUENZER.form = {get(i, n), set(i, n, f), eval(f, ph, e), clean(punkte, {grid, on}) → {f, stats}, wisch(punkte, {latenz}),
  lib(), mine(), put(ziel, f, opts), ride(eintrag, t), info() → {lfMiss, tabs}}`. Dazu kommt der Worklet-Haken **`__lfoProbe(t, on)`**:
  je Steuerblock `{frame, ph1, v1, ph2, v2}` der Spur, ohne Oberfläche.

### 6.10 Formate

Prüf-Formate (M-PLATZ, echte App-Schrift): **428×926** (Xander), **926×428**, P1 390×844, P2 375×667, P3 320×568, L1 844×390, L2 667×375
(sichere Zonen). In allen Formaten gilt: alle Tasten ≥ 44 × 44, Malfeld ≥ 120 px hoch, nichts abgeschnitten, keine waagrechte Seiten-Scrollleiste
(nur die Bibliotheks-Zeile scrollt), Höhe von Seite und Editor beim Öffnen und Schließen ± 0 px. Drehen des Geräts mit offenem Blatt baut das
Blatt in der anderen Anordnung neu, ohne Datenverlust.

---

## 7. Zusammenspiel mit vorhandenen und kommenden Paketen (im Code geprüft)

| Bereich | Stelle | Was I3 tut |
|---|---|---|
| Worklet VA/FM/FELD | `AnalogCore.lfoVal`, `control()` (Phasen `gl1/gl2`, `v.l1/v.l2`, `r1/r2`), `onMsg` (Z. 9297), `tempoAt` | Fall 5, Nachricht `lf`, 5-ms-Blende, `lfMiss`, `__lfoProbe` |
| Engine-Abgleich | `syncEngine`, `syncEngines`, `wkFlat`, `wkSet`/`wkFlush`, `newEngine` | `lf` nur bei Form 5 (Byte-Gleichheit sonst) |
| Nativ | `FX.lfoShape`, `FX.lfoBuffer`, `FX.TempoLFO`, `syncLfoSet`, `rebuildNativeLfos`, `lfoAnchor`, `lfoSink` | Puffer aus der Form, Schlüssel mit Hash, Blende |
| Anzeige | `pageLfo`, `drawShape`, `lfoPrevFrame`, `lfoNow`, `modLive` | ✎, Vorschau, Laufpunkte |
| Daten | `normAnalog` (Z. 13257), `normSynthP` (Z. 13341), `normalizeSound`, `soundHash`, `PD['l1shape']`, `LFO_SHAPE_ICO/NAME`, `LFO_FX_SHAPE` | Bereich 0–5, `l1f`/`l2f`, `formNorm` |
| Export/Import | DX-`.syx`-Export (Z. 32061), DX-Import (Z. 31966), v2-API `LSH_V2` (Z. 27784), Zufalls-Klang (Z. 29769) | Export: Form 5 → nächstliegende DX-Welle nach Korrelation (Dreieck, Säge ab, Säge auf, Rechteck, Sinus), Hinweis „LFO-Form angenähert“; Import und Zufall unverändert; `LSH_V2[5] = 'drawn'` |
| Undo | `soundSnapshot`/`commitSound`, `timApply`, I1 `'sr'`/`'song'`, I2 Clip | ein Undo je Strich/Wahl |
| Bedienung | `haptic`, `ctlPrecision` (Regler Tiefe/Unten/Oben), `openPop`, `lcdShow`, `safeRebuild(buildSynthEd)`, `uiPrefs` | Haptik, Fein-Modus, Raster/Aufräumen im Geräteprofil |
| Latenz | `AU.outLat` (`updateOutLat`, Z. 17416) | Einwischen §5.5 |
| K1 Mod-Übersicht | `k1Mods` (`n5-br-K` Z. 31538), `k1FmxLfo` (Z. 31619) | Quellen-Text „LFO 1 ✎ (Name)“; FELD-LFO zeigt die Form ebenso |
| MS 2000 (MK6) | `t[].seq` (Z. 13095), `seqToolsPop`, `timApply`, Ansicht SCHRITTE | Zeile „Aus Form“; MK6-Suite muss grün bleiben; **keine** gemalte Welle am Bedienfeld (F1) |
| **I1 Super-Regler** | `S.sr`, `song.sr[].f`, Nachricht `sr.ramp`, `SRCore`, `srAt`, Song-Werkzeuge, Teil-Blatt, Super-Regler-Feld | §3.3, §4.6, §6.8 (I3f erst nach I1c + I1e); Vormachen kann `l1shape` als stufigen Wert umschalten, `l1f` selbst ist nicht morphbar |
| **I2 P-Locks** | `lanePut`, neu `lockPut`, Reihen-Optionen [⋯], Klang-Lock `{kl}` | §3.4, §6.7; Klang-Lock-Nebenkern bekommt `lf` mit (I3e nach I2a + I2c, Klang-Lock-Teil nach I2d) |
| I4 Tipp-Summen, G1–G9, VS-L/VS-P | Mikrofon, Takes, Songtext | kein Eingriff |
| VV1–VV3 Video | `vvSwapIn`, Offline-Render; VV3 LFO-Welle | gleiche Nachrichten offline; VV3 zeichnet mit `FORM.eval` |
| Bit Mask (Nachtrag 7) | `synq-bm`, LFO §1.8 (8 Wellen, Phase 0 bei ▶) | keine gemalte Welle (F1); Formen wirken dort über I2-Reihen (I2g) und den Super-Regler (I1h) |
| North (Nachtrag 6) | `synq-md` | kein LFO; Formen über I2-Reihen auf `drum.*` |
| Spur-Effekt Pumpen | `fx.pump`, `FX.pump`, `pumpSrc` | unverändert; nur Namensgleichheit mit der Bibliotheksform (§12) |
| FR1 Einfrieren (geplant) | – | Formänderung = neu rechnen wie eine Reglerdrehung |
| Online-Speichern | Format 5 | nur Zusatzfelder; `max_app` siehe Regel 20 |

---

## 8. Unterpakete, Zweige, Dauer, Budget, Abnahme

**Ausgangsstand:** Hauptlinie mit K1 (4.25.0) und VV1 (Offline-Render für I3-05). VV3-Haken, sobald VV3 zusammengeführt ist.
**Zweige (Regel 29):**
- **A `i3-br-K`:** I3a → I3b (DOM-freier Kern und Aufräumen).
- **B `i3-br-U`:** I3c + I3d gegen die hier festgelegte Schnittstelle (`FORM`, `FORMCLEAN` als Platzhalter, bis A zusammengeführt ist).
- Danach auf der Hauptlinie: I3e (MS-2000-Teil sofort, I2-Teil nach I2a + I2c) → I3f (nach I1c + I1e) → I3g.
- Die Schnittstellen (§3, §4.2, §4.6, §6.9) ändern sich im Bau nicht. Mit zwei Helfer-Sitzungen sind es ≈ 10–13 h Kalenderzeit.
- Jede Stufe hat Changelog, Snapshot und eine „Bitte prüfen“-Liste (Regel 22).

| Paket | Inhalt | Dauer | Budget |
|---|---|---|---|
| I3a | Form-Kern: Daten, `formNorm`, `FORM.eval`, Worklet Fall 5 + `lf` + 5-ms-Blende, Takt-Lage, nativer Puffer, Anzeigen, DX-Export, v2-API, K1-Text, VV3-Haken | 4–5 h | +7 KB (davon ≈ 2,5 KB ASCII im Worklet) |
| I3b | `FORMCLEAN`: Aufräumen §5.2, Aufräumen aus §5.4, Einwisch-Rechnung §5.5, Korpus-Test | 3–4 h | +6 KB (im Block bei Bedarf) |
| I3c | Form-Blatt hoch/quer, Malen, Übermalen, Einwischen, Raster, Schalter, Infozeile, Rückmeldung §5.3, LFO-Seite ✎ | 5–6 h | +13 KB im Block bei Bedarf, +1 KB Seite |
| I3d | Bibliothek Pumpen/Gate/Triller, Meine Formen (KV) | 1–1,5 h | +3 KB (im Block bei Bedarf) |
| I3e | Einsetzen: MS-2000-Mod-Sequenz; I2-Reihe (`lanePut`/`lockPut`); Klang-Lock trägt `lf` | 2–3 h | +4 KB |
| I3f | Super-Regler-Kurve: `S.sr.f`, `song.sr[].f`, `sr.ramp.k`, `FORM.rideAt`, Chip, Teil-Blatt, Streifen | 2–3 h | +4 KB |
| I3g | Zusammenführen, Regel-28-Golden, Regression, Fach-Prüfung, Bilder, „Bitte prüfen“ | 1,5–2 h | – |
| **Summe** | | **≈ 19–25 h** (18,5–24,5) | **≈ +38 KB**, davon ≈ 22 KB erst beim ersten Öffnen |

Der Vorschlag nannte ≈ 14 h. Die Mehrzeit hat vier Gründe: Die Form muss auf zwei Wegen genau gleich klingen (Worklet und nativer Puffer), die
Einsetz-Ziele I1 und I2 sind noch nicht gebaut (Schnittstellen und spätere Anschluss-Stufen), das Einwischen braucht einen Latenzausgleich,
und die Erkennung bekommt einen Korpus-Test, damit „aufräumen“ messbar richtig ist.

### Abnahme I3a — Form-Kern
- [ ] **I3-01** **Regel 28:** Demo-Projekt, alle Werks-Klänge und alle Projekte in `synq-snapshots/` gegen den Vorgänger-Stand: normalisiertes JSON
      Zeichen für Zeichen gleich; Mitschnitt aller `port.postMessage` an die Worklets über 32 Takte byte-gleich (keine `lf`-Nachricht);
      `syncLfoSet`-Schlüssel unverändert; Offline-Render bitgleich (M-NULL = −∞).
- [ ] **I3-02** `formNorm`: 1000 Zufallsformen (gültig, kaputt, zu lang, unsortiert, NaN, drei gleiche `x`) → alle Regeln §3.1 erfüllt; zweimal
      normalisieren = einmal (deep-equal); `l1shape` 5 ohne `l1f` → 1; Speichern → Laden, Sound sichern → laden, Kopieren/Einfügen, Spur
      duplizieren, Klang-Lock-Kopie: `l1f`/`l2f` deep-equal.
- [ ] **I3-03** **Gleiche Formel** (M-LFO): 8 Prüfformen (Säge, Treppe 8, Pumpen, Gate, Triller, Kurve b = ±100, 64 Abschnitte) an 1000
      Zufallsphasen: Worklet-Wert = `FORM.eval` ± 1e-6 außerhalb der Kanten; Kanten: Rampe 1 ms ± 1 Steuerblock, je Steuerblock höchstens
      2 · CR / (0,001 · SR) Änderung (48 kHz: 0,667); kein NaN.
- [ ] **I3-04** **Takt-Lage:** Takt 1/1 bei 120 BPM: Phase am Song-Schlag b = (b/4) mod 1 ± 16 Samples; Song-Start bei Takt 7 → Phase 0 bei
      Takt 7; Tempo 120 → 90 in Takt 5: kein Wertsprung über die Steigung eines Steuerblocks hinaus; Start NOTE: Phase 0 bei jedem Notenanfang
      ± 1 Steuerblock.
- [ ] **I3-05** **Gleich in Song, Export und Video:** zwei Offline-Render (VV1) bitgleich; Offline gegen Echtzeit-Mitschnitt: Korrelation ≥ 0,99;
      VV3 (wenn gebaut): gezeichnete Phase ± 2 % (VV3-01).
- [ ] **I3-06** **Kein Klick** (M-KLICK ≤ 6 dB): Gate → Lautstärke (Menge 1,0) 1/16 bei 140 BPM auf Sinus 220 Hz und auf einer Säge-Fläche;
      Pumpen → Cutoff; neue Tabelle während des Klingens (5-ms-Blende) bei voller Menge.
- [ ] **I3-07** **Nativ:** WT-Spur und `?engine=native`: Pumpen auf Cutoff und auf `fx.rev` (Spur-Effekt-Route) → gemessener Verlauf gegen
      `FORM.eval` Korrelation ≥ 0,99; Tempo-Wechsel baut den Puffer phasengleich neu (Phasenfehler ≤ 1 ms); kein LFO bleibt stehen (`lfoSink`);
      keine Konsolenfehler.
- [ ] **I3-08** **Engines:** VA, FM DX (Route LFO 1 → Tonhöhe) und FM-FELD (lfoAm/lfoFm) folgen der Form (`__lfoProbe`, `fmxLv`); MS-2000- und
      Bit-Mask-Bedienfeld unverändert (DOM-Vergleich, F1-Vorgabe).
- [ ] **I3-09** **CPU** nach §4.8 (Xeon-Mediane); kein GC-Ereignis in 60 s Node-Shim, Heap ± 1 MB; `lfMiss` = 0 in allen Tests.
- [ ] **I3-10** **Ränder:** DX-Export eines FM-Klangs mit Form 5 → gültige Datei, LFO-Welle = beste Korrelation, Hinweis „LFO-Form angenähert“;
      v2-API liest `'drawn'`; Zufalls-Klang wählt nie 5; eine Vorgänger-Version öffnet ein I3-Projekt ohne Fehler mit Hinweisband VO-R1.

### Abnahme I3b — Aufräumen
- [ ] **I3-11** **Korpus** (M-FORM): 20 Zielformen × 10 Kritzel (Zittern σ = 1,5 % der Höhe, Überschwinger 4 % an Ecken, Strichdauer 0,3–1,5 s,
      Abtastung 60 Hz, Raster 1/16) → ≥ 90 % **strukturgleich** (gleiche Zahl und Art der Abschnitte, Kanten auf dem Raster ± 1 Tick, Stufen
      ± 20 von 1000) und 100 % mit höchstens einem Strukturfehler.
- [ ] **I3-12** **Gerade Rampen:** Kritzel einer Rampe (Zittern σ = 1,5 %, RMS-Abweichung von der Geraden ≤ 2 %) → genau ein Abschnitt „Gerade“,
      Anfang und Ende auf dem Raster.
- [ ] **I3-13** **Saubere Treppen:** Treppen mit 4, 8 und 16 Stufen (Raster 1/16) → alle Stufen gleich lang (genau Raster) und gleich hoch
      (± 5 von 1000).
- [ ] **I3-14** **Keine falsche Begradigung:** Sinus-, Bogen- und Pump-Kritzel → Kurven oder ≥ 4 Abschnitte, RMS zum Vorbild ≤ 5 %, keine Treppe;
      Aufräumen aus → RMS zur Rohform ≤ 1,5 %; Umschalten direkt nach dem Strich wendet auf diesen Strich an (ein Undo).
- [ ] **I3-15** **Übermalen:** Strich nur im 2. Viertel → Knoten außerhalb [Viertel 2 ± 1 Rasterfeld] deep-equal zur Form davor.
- [ ] **I3-16** **Grenzen und Zeit:** ≤ 32 Abschnitte nach dem Aufräumen, ≤ 64 ohne; Aufräumen ≤ 5 ms (Median, Chromium), ≤ 20 ms mit 4-facher
      CPU-Drosselung; keine Aufgabe > 50 ms.

### Abnahme I3c — Form-Blatt
- [ ] **I3-17** **Öffnen und Schließen:** aus ✎ (erster Tipp), aus der Vorschau, aus den Sequenz-Werkzeugen, aus den Reihen-Optionen, aus dem
      Kurven-Chip; die Kopfzeile nennt das richtige Ziel; jeder Schließ-Weg aus §6.3 schließt ohne Datenverlust und ohne Rest-Zustand.
- [ ] **I3-18** **Malen** (M-GESTE): Strich in 600 ms über das Feld → Form folgt; Gleiten 150 ms, `snap` genau einmal, Infozeile mit richtigen
      Zahlen; ein Undo je Strich; `pointercancel` → Form deep-equal zu davor; Tipp < 4 Ticks ändert nichts.
- [ ] **I3-19** **Einwischen** (M-WISCH): ▶ 120 BPM, gestellte Latenz `AU.outLat` = 50 ms, 2 Takte Höhenfahrt → geschriebene Lage ± 12 Ticks
      (1/64 Zyklus) zur gehörten Stelle; nur der berührte Bereich ändert sich; Engine-Updates ≤ 30/s während der Geste, aufgeräumte Form nach dem
      Abheben (Abfrage `__lfoProbe`); ohne ▶ grau mit Grund.
- [ ] **I3-20** **Anzeige:** Laufstrich folgt der gehörten Phase ± 1 Bild (30 Bilder/s); Rasterlinien = Raster-Wahl; Felderzahl und Länge in
      der Infozeile richtig; Raster < 2 bzw. > 64 Felder wechselt automatisch.
- [ ] **I3-21** **M-PLATZ** in allen Formaten aus §6.10: Malfeld ≥ 120 px hoch, alle Tasten ≥ 44 × 44, nichts abgeschnitten, Höhe von Seite und
      Editor ± 0 px beim Öffnen und Schließen, Drehen ohne Datenverlust; Bibliotheks-Zeile scrollt per Finger.
- [ ] **I3-22** **Flüssig:** Malen während ▶ mit 4 Spuren: 59+ Bilder/s (Chromium), Zeichnen ≤ 2 ms je Bild; Startzeit der App ± 5 % (Block
      `sq-form-src` nicht beim Start ausgewertet); erstes Öffnen ≤ 50 ms; Worklet `late` = 0.
- [ ] **I3-23** **LFO-Seite:** ✎ ≥ 44 × 44 in allen Formaten; erster Tipp setzt Form 5, TAKT 1/1 (wenn FREI) und das Start-Dreieck in einem
      Undo; FREI grau mit Grund; Rückschalten behält `l1f`; Vorschau zeigt einen Zyklus mit Laufpunkt; Mod-Übersicht „LFO 1 ✎ Pumpen“.

### Abnahme I3d — Bibliothek
- [ ] **I3-24** Knoten genau wie §6.5; Wahl = ein Undo, Kopie (Ändern ändert die Bibliothek nicht); hörbar gemessen bei 120 BPM, Route Menge 1,0:
      **Pumpen** → Lautstärke: 4 Einbrüche je Takt auf den Vierteln ± 1 ms; **Gate** → Lautstärke: 10 Pegelfenster je Takt auf den Sechzehnteln
      1, 3, 4, 6, 7, 9, 11, 12, 14, 15 ± 1 ms; **Triller** → Tonhöhe (Route = 2 Halbtöne): Wechsel alle 1/32 ± 1 ms, Tonhöhen 0 / +200 ct ± 5 ct.
- [ ] **I3-25** **Meine Formen:** Sichern mit Namen, erscheint oben in der Liste, Einsetzen = Kopie, ✕ mit Rückfrage; höchstens 64 (die 65. wird
      mit Hinweis abgewiesen); übersteht Neuladen der Seite; ohne Speicher: Hinweis, keine Fehler.

### Abnahme I3e — Einsetzen
- [ ] **I3-26** **MS 2000:** Treppe mit 16 Stufen → SEQ 2 (Ziel Cutoff): Werte = Mittelwert × 63 ± 1, Bewegung Stufe; Rampenform → Glatt, Werte am
      Schrittbeginn; Ziel Tonhöhe → Bereich ±24; LÄNGE 8 → Form auf 8 Schritte, Schritte 9–16 unverändert; Tiefe 50 % → halbe Werte ± 1; ein
      Undo je Strich; LCD-Meldung; MK6-Suite grün.
- [ ] **I3-27** **I2-Reihe:** frei, Raster 1/16 → `lanePut` mit len 16 (1/32 → 32, 1/16T → 24), Werte = Unten + (w̄ + 1)/2 · (Oben − Unten) ± 0,001,
      stufige Ziele auf erlaubte Werte; „An Noten“ → `lockPut` nur auf Schritten mit Note, Hinweis mit richtiger Zahl; je Strich ein Undo
      (Undo-Art Clip); I2-02 bleibt grün.
- [ ] **I3-28** **Keine Restverbindung:** nach [Fertig] ändert eine Säule in SCHRITTE bzw. ein Reihen-Schritt keine Form und umgekehrt; Klang-Lock
      mit Form-5-Klang: Nebenkern bekommt `lf`, `lfMiss` = 0 (nach I2d).

### Abnahme I3f — Super-Regler-Kurve
- [ ] **I3-29** Fahrt 0,2 → 0,8 über 4 Takte mit Form „Treppe 4“: Stellung (`__srProbe`) = `x0 + (x1 − x0)·F̂(u)` ± 0,002; Beginn = aktuelle
      Stellung (Sprung ≤ 0,002); Ende = `x1` am Teilanfang ± 128 Samples; Kanten 20 ms, M-KLICK ≤ 6 dB; Pumpen-Kurve mit G(0) ≠ 0 beginnt
      trotzdem ohne Sprung.
- [ ] **I3-30** `song.sr[].f` übersteht Speichern/Laden, `srShift`/`srClear`/`srCutTo`/Undo (deep-equal bzw. nach Regel §3.3); zwei Offline-Render
      bitgleich; Einträge ohne `f` und `sr.ramp` ohne `k` byte- und bitgleich zu I1 (I1-50/I1-21 bleiben grün).
- [ ] **I3-31** Kurven-Chip ≥ 52 × 44 in allen Formaten des Super-Regler-Felds (I1-30 bleibt: Feldhöhe ± 0 px), zeigt die Mini-Kurve; Teil-Blatt-
      Zeile zeigt die Kurve, Tipp ändert sie (ein Undo); Matrix-Fahrt nutzt `S.sr.f`; Einwischen in der Kurve grau mit Grund.

### Abnahme I3g — Zusammenführung
- [ ] **I3-32** Regression: Smoke, DoD (Worklet und nativ je 10/10), K1-Suite, MK6-Suite, VV1-Suite, I1- und I2-Suiten (soweit zusammengeführt),
      LAUF/ROLLE.
- [ ] **I3-33** 3 Minuten Wiedergabe mit 3 gemalten LFOs (Pumpen, Gate, eigene Form), Szenenwechseln und Einwischen während ▶: keine Knackser
      (M-KLICK), `late` = 0, `lfMiss` = 0, keine hängenden Noten, keine Konsolenfehler.
- [ ] **I3-34** Marke: `grep -i -E 'serum|vital|bitwig|kilohearts|xfer|procreate|waveshaper|animoog|moog'` in DOM, Hilfe, CSS, Bezeichnern,
      Testnamen = 0.
- [ ] **I3-35** Kein Supabase-Aufruf; Hilfe-Zeilen; Bilder für Xander (hoch und quer: LFO-Seite mit ✎, Form-Blatt beim Malen und Einwischen,
      Bibliothek, Sequenz-Werkzeuge mit „Aus Form“, Kurven-Chip) in `i3-shots/`.
- [ ] **I3-36** **iPhone (Xander, Pages-Seite):** „Bitte prüfen“ §12 und `perfProbe` mit I3-Probe (4 Spuren, je beide LFOs gemalt mit Start NOTE,
      6 Stimmen) → Last ≤ 0,45, kein `late`, 3 min ohne Aussetzer. Ergebnis-JSON im Changelog.

---

## 9. Messverfahren (neu; vorhandene M-KLICK, M-NULL, M-SP, M-CPU, M-ZEIT, M-PLATZ, M-EINBRUCH gelten unverändert; M-GESTE aus I2)

| Kürzel | Name | Definition |
|---|---|---|
| **M-FORM** | Erkennungs-Korpus | Skript `i3-korpus.mjs` (fester Startwert) erzeugt aus 20 Zielformen je 10 menschenähnliche Striche (Zittern, Überschwinger, Tempo, 60-Hz-Abtastung); Wiedergabe als CDP-Touch (`Input.dispatchTouchEvent`) aufs Feld; Vergleich der Knotenliste mit der Zielform: Struktur (Zahl/Art der Abschnitte), Kanten-Ticks, Stufenhöhen, RMS |
| **M-LFO** | Worklet gegen Formel | `__lfoProbe` je Steuerblock `{frame, ph, v}` offline; Soll `FORM.eval(f, ph(frame), e)`; Abweichung außerhalb der Kanten, Kantenbreite und größter Schritt je Block |
| **M-WISCH** | Einwisch-Lage | CDP-Touch mit festen Zeitstempeln, `AU.outLat` gestellt (z. B. 50 ms), Transport läuft; geschriebener Tick gegen erwarteten Tick aus §5.5 |
| **M-TAKT** | Takt-Lage | Offline-Render mit Prüfton und Form „Säge 1/1“ auf Lautstärke; Nulldurchgang der Säge (Kante) gegen `b2t(Taktanfang)` in Samples; mit Tempo-Wechsel und Song-Start mitten im Song |
| M-SR (aus I1) | Fahrt-Stellung | `__srProbe` je Block, Soll nach §4.6 |

---

## 10. Risiken

1. **Die Erkennung rät falsch** (gewollte Kurve wird Treppe oder umgekehrt). Gegenmittel: Korpus I3-11/I3-14 mit festen Schwellen,
   Übermalen nur der Stelle, Schalter „Aufräumen“ für den letzten Strich, Undo. Schwellen §5.2 stehen als Konstanten an einer Stelle, damit
   eine Korrektur nach Xanders Test klein bleibt.
2. **Ältere iOS-Fassungen** ohne `getCoalescedEvents` (vor 18.2) bzw. mit dem `pointerId`-Fehler [W]: Merkmal-Abfrage; bei 60 Hz und schnellem
   Strich füllt die lineare Verbindung die Lücken. Das reicht für die Erkennung (Korpus läuft mit 60 Hz).
3. **Systemgesten am Rand** (Wischen vom linken Rand = Zurück in Safari, Kontrollzentrum oben): Feld ≥ 16 px vom Rand, `pointercancel` verwirft
   den Strich ohne Schaden. Bleibt es am Gerät störend, wird der Rand breiter (nur Maß, keine neue Funktion).
4. **Einwisch-Latenz am iPhone** unbekannt genau (Finger → Ereignis ≈ 30 ms angenommen, Ausgabe über `AU.outLat`). Gegenmittel: Rechnung §5.5,
   Prüfpunkt in §12. Liegt es daneben, wird nur die Konstante 0,030 s angepasst.
5. **Klick an harten Kanten** auf der Lautstärke: 1-ms-Kante, M-KLICK; Rückfall 2 ms (§4.1).
6. **Zwei Rechenwege** (Worklet-Formel, nativer Puffer) könnten auseinanderlaufen. Gegenmittel: eine Referenz `FORM.eval`, Tests I3-03 und I3-07.
7. **Ältere App-Versionen** klemmen Form 5 auf S&H und verwerfen `l1f`. Gegenmittel: Hinweisband VO-R1 (vorhanden), `max_app` rechtzeitig
   anheben.
8. **Abhängigkeiten:** I3e (Reihe) braucht I2a + I2c, I3f braucht I1c + I1e, VV3 ist noch nicht gebaut. Gegenmittel: Reihenfolge §8, feste
   Schnittstellen, MS-2000-Teil von I3e und I3a–I3d sind unabhängig und können sofort veröffentlicht werden („wenn du irgendein Paket fertig hast,
   lad es schon hoch“).
9. **Namensgleichheit „Pumpen“** (Bibliotheksform und vorhandener Spur-Regler): kann verwirren. Name aus dem freigegebenen Vorschlag bleibt,
   Prüfpunkt in §12.
10. **Haupt-Faden beim Malen während ▶** (Planer-Takt 25 ms): Zeichnen ≤ 2 ms je Bild, Aufräumen ≤ 5 ms erst beim Abheben, Nachrichten ≤ 30/s.
    I3-22 misst `late` = 0.

---

## 11. Fragen an Xander (nur echte; ohne Antwort wird die Vorgabe gebaut)

- **F1 MS-2000- und Bit-Mask-Bedienfeld.** Beide Bedienfelder sollen „wie am Gerät“ sein, und deren LFOs haben feste Wellen. Soll die gemalte
  Form trotzdem auch dort als LFO-Welle wählbar sein? **Vorgabe: nein.** Dort wirkt eine Form über die Mod-Sequenz (MS 2000), über Lock-Reihen
  (I2) und über den Super-Regler.
- **F2 Kurve für den Super-Regler.** Soll die gemalte Form **einmal über die ganze Fahrt** gedehnt werden (z. B. Treppe: 4 Stufen bis zum
  Refrain, egal wie lang die Fahrt ist) oder sich **jeden Takt wiederholen** (z. B. pumpend aufwärts)? **Vorgabe: einmal gedehnt.** Anfang und
  Ende passen dabei genau.
- **F3 Die drei Bibliotheksformen.** Geplant sind: **Pumpen** = 4-mal je Takt auf den Vierteln, schnell erholt; **Gate** = 1/16-Muster
  x.xx.xx.x.xx.xx.; **Triller** = Wechsel alle 1/32 zwischen Grundton und oben. Passt das, oder hast du andere Muster im Kopf?
  **Vorgabe: so bauen.**

---

## 12. Bitte prüfen (Xander am iPhone, Pages-Seite)

1. LFO 1 → ✎. Kritzle schnell eine Rampe und danach eine Treppe. Rastet es so ein, wie du es gemeint hast? Fühlt sich die Haptik beim Einrasten
   und an den Viertel-Linien gut an?
2. Male eine geschwungene Kurve (z. B. einen Bogen). Bleibt sie eine Kurve und wird sie nicht zur Treppe?
3. Übermale nur ein Viertel. Bleibt der Rest so, wie er war?
4. Loop läuft → Einwischen. Landet die Höhe genau an der Stelle, die du gerade hörst (nicht zu früh oder zu spät)?
5. Pumpen auf Lautstärke, Gate auf Lautstärke, Triller auf Tonhöhe: Klingen sie so, wie du es erwartest? Stört dich, dass die Bibliotheksform
   „Pumpen“ genauso heißt wie der Spur-Regler „Pumpen“?
6. MS 2000: Werkzeuge (SHIFT + 5) → „Aus Form“ → SEQ 2. Hörst du die Form in der Sequenz?
7. Super-Regler: Kurve „Treppe“ wählen, [bis zum nächsten Teil fahren]. Kommt der Aufbau so, wie du ihn willst?
8. Namen: „✎ Gemalt“, „Form“, „Malen“, „Einwischen“, „Aufräumen“, „Meine Formen“, „Aus Form“, „Kurve“. Passen sie?
9. Probe: Menü → Leistung → I3-Probe. Schick mir das Ergebnis (I3-36).

---

## 13. Recherche (kurz, eigene Worte; nur für die Vergleiche in dieser Spec)

- **Gemalte LFOs am Rechner (Vorbilder):** In bekannten Software-Synths setzt man Punkte mit der Maus, schaltet mit Zusatztasten auf
  Stufen-Zeichnen um und stellt das Raster in X und Y getrennt ein. Ein „Smooth“-Regler rundet die Kanten. Nutzer wünschen sich ein feineres
  freies Zeichnen und mehr Platz. → Hier: Finger statt Maus, Aufräumen statt Zusatztasten, Kanten fest 1 ms.
  Quellen: Serum-Tipps (Raster, Stufen mit Zusatztaste, Punkte), `https://chilloutwithbeats.com/en/serum-editing-lfo2/`,
  `https://cymatics.fm/blog/serum-tutorial-25-tips/`; Vital-Forum (Raster, Malwerkzeug, Wunsch nach feinerem Zeichnen),
  `https://forum.vital.audio/t/tips-tricks-and-secret-functions/4249/24`,
  `https://forum.vital.audio/t/it-would-be-great-if-you-could-draw-lfos-like-you-can-draw-waveforms-in-the-wt-editor/14080`;
  Kurven-Editor eines Plugin-Herstellers (Stufen-Zeichnen rastet immer waagrecht ein), `https://kilohearts.com/docs/curves_lfos_remaps`
  (nur über das Suchergebnis gelesen, die Seite war aus dieser Sitzung nicht erreichbar).
- **„Malen, halten, es rastet ein“ (Vorbild für das Aufräumen):** In einer bekannten Zeichen-App wird ein Strich zu einer perfekten Linie,
  einem Bogen oder einer Form, wenn man am Ende den Finger kurz hält. Nutzer berichten, dass das leicht aus Versehen auslöst. → Hier rastet es
  beim **Abheben** ein, ohne Halten, und „Aufräumen“ ist für den letzten Strich umschaltbar.
  Quelle: Procreate-Handbuch QuickShape, `https://help.procreate.com/procreate/handbook/guides/quickshape`.
- **Zwischenpunkte der Berührung in iOS-Safari:** `PointerEvent.getCoalescedEvents()` gibt es auf iOS ab Safari 18.2; in den ersten Fassungen
  fehlten bei den Zwischenpunkten `pointerId` und `target`. Quellen: WebKit-Fehler 277185 (`https://bugs.webkit.org/show_bug.cgi?id=277185`),
  Flutter-Commit mit Umgehung (`https://dart.googlesource.com/external/github.com/flutter/engine/+/23447c4674b0837ada66d29099147e05a695cec4`).
- **Display iPhone 12 Pro Max:** 60 Hz (die vorher gemeldeten 120 Hz kamen nicht). Quellen: MacRumors
  (`https://www.macrumors.com/2020/08/24/iphone-12-pro-to-ship-with-60hz-but-delay-possible/`), Notebookcheck
  (`https://www.notebookcheck.net/Apple-said-to-have-dropped-120-Hz-display-for-iPhone-12-Pro-models-ahead-of-production.493024.0.html`).
  Die Touch-Abtastrate des Geräts ist nicht offiziell belegt. Die Spec rechnet darum mit 60 Punkten je Sekunde ohne Zwischenpunkte.
- **Linien vereinfachen:** Ramer-Douglas-Peucker teilt rekursiv am Punkt mit dem größten Abstand zur Sehne, bis alle Punkte innerhalb ε liegen
  (Ramer 1972, Douglas & Peucker 1973). Quelle: `https://www.rosettacode.org/wiki/Ramer-Douglas-Peucker_line_simplification`. Hier mit
  senkrechtem Abstand, weil die Form eine Funktion der Zeit ist.
