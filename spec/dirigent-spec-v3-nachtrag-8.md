# SYNQUENZER v3 — Nachtrag 8: Super-Regler, Locks für alles, Mal-LFO, Tipp-Summen und Songtext aus Gesang (Xander 31.10.)

**Kurz für Xander**
1. Es kommen fünf Pakete: **Super-Regler** mit weichem Szenenwechsel (I1), **Locks für alles** mit FM-Reihen, eigenem Klang je Schritt und Anschlag sehen/ziehen/hören (I2), **Mal-LFO** (I3), **Tipp-Summen** (I4) und **Songtext aus dem Gesang** mit Silben-Einrasten und Vorspielen (G9).
2. Zuerst kommt, was du sofort benutzt: Anschlag ziehen und hören, Tipp-Summen, Mal-LFO, Songtext-Modus. Der Klang-Teil des Super-Reglers wird gleich mitgebaut, sein Feld erst nach deiner Antwort (Fragen 2–4).
3. Arbeit ≈ 171–219 h (mit allen Tipp-Summen-Extras ≈ 178–229 h); parallel auf bis zu 12 Helfer-Sitzungen sind das ≈ 35–45 h Kalenderzeit, sobald Gesang, Video und K1 zusammengeführt sind.
4. Alte Projekte klingen bitgleich, die Seite startet nicht langsamer (neue Bedienteile laden erst bei Bedarf), und das Sprachmodell (≈ 80–100 MB) lädt nur, wenn du [Erkennen] tippst; es rechnet auf dem iPhone.
5. Ehrlich: Ein fühlbarer Tick geht im Browser auf aktuellem iOS fast nie, beim Ziehen und bei laufendem Mikro gar nicht. Sicher ist überall ein sichtbares Aufleuchten bzw. Einrasten; eine 2-Minuten-Probe an deinem iPhone klärt den Rest.
6. Am Ende stehen 10 Fragen, jede mit Vorgabe. Ohne Antwort baue ich die Vorgabe; nur sichtbar Neues in vorhandenen Ansichten und die Tipp-Summen-Extras warten auf dein Wort.

---

Status: **gilt für den Bau** (31.10. abends), sichtbar Neues nur nach der Regel in A.9. Grundlage ist Xanders Antwort vom 31.10. ~16:50 UTC
(wörtlich in `fragen-xander-9.md`): „Ja, die Innovation kannst du gerne umsetzen. Mir gefällt das mit dem Gesang Hum, dass man dazu tappt, damit
die App erkennt, was als Noten gemeint ist. … Und ich möchte auf jeden Fall auch bei dem Gesang, dass er die Worte erkennt, die ich singe. …
pro Silbe … einschnappt … visuelle Referenz … Haptik … sofort höre, während ich losschreibe … auf die Wellenform klicke … bis zum nächsten
Warp-Marker … die Engine erkennt anhand meines Wortes, wenn es ein zweisilbriges Wort ist, dass diese Silben entsprechend zugeteilt werden zu den
Transienten … laut der Analyse.“ Dazu sein Zusatz ~17:00 UTC zum Songtext (ganzen Text einfügen, silbenweise verschieben, verschmelzen).

**Freigegeben** sind die Innovationen **1 Super-Regler, 2 P-Locks für alles + FM im Sequencer (mit Anschlag sehen/ziehen), 3 Mal-LFO,
4 Tipp-Summen** aus `innovation-vorschlag.md` und das neue Gesangs-Paket **G9 Songtext**. Die Ideen 5–12 sind **nicht** freigegeben und kommen in
diesem Nachtrag nicht vor.

**Aufbau.** Teil A legt die gemeinsamen Schnittstellen fest und löst die Widersprüche zwischen den Paket-Dateien. Teil B enthält die fünf Pakete
(je mit Dirigenten-Hinweisen und dem vollständigen Paket-Text, Fassung 2 nach Fach-Prüfung). Teil C ist der Bauplan für die Helfer, Teil D die
Fragen an Xander. **Vorrang:** Teil A und die Dirigenten-Hinweise in Teil B gehen dem Paket-Text vor. Wo ein Paket-Text abweicht, gilt Teil A;
der Builder nennt die Stelle im Changelog.

**Regeln, die für alle fünf Pakete gelten** (`typische-fehler.md`, CLAUDE.md, unverändert):
- **27** Nur bauen, was hier steht; Unklares als „Fragen an Xander“ in den Changelog. Nötiges aus der Fehlerliste (≥ 44 × 44, nichts
  abgeschnitten, kein Layout-Sprung, kein Knacken) ohne Rückfrage. **CLAUDE.md 3:** Was eine vorhandene Ansicht sichtbar verändert, wird erst
  vorgeschlagen (Regel A.9).
- **28** Alte Projekte klingen gleich: Ohne die neuen Felder bleibt jede Nachricht an die Worklets byte-gleich, jedes gespeicherte JSON
  zeichengleich und jeder Golden-Render der Snapshots in `synq-snapshots/` bitgleich (N8-01).
- **22** Jede Stufe: Changelog-Abschnitt, Snapshot, „Bitte prüfen“-Liste. **29** Parallel in Zweigen, Zwischenstände laufend pushen, der
  Dirigent führt zusammen und veröffentlicht jede fertige Stufe sofort („wenn du irgendein Paket fertig hast, lad es schon hoch“).
- **24 (sinngemäß)** Kein Hersteller-, Geräte-, Modell- oder Produktname in irgendetwas, das ausgeliefert wird (Oberfläche, Hilfe, CSS,
  Bezeichner, Kommentare, Testnamen); Vergleiche nur in den Specs. „MS 2000“ genau einmal (`MK_LABEL`). Gemeinsame Prüfung N8-10.
- **20** Kein Supabase-Aufruf. Format bleibt **5** (nur zusätzliche Felder). Die App-Versionen vergibt der Dirigent; `max_app` (heute
  4 030 000) hebt Xander an, bevor eine Version über 4.30.0 online speichern soll (Frage 1).
- **CLAUDE.md-Vorrang:** schnelle Seite, flüssige Bedienung, stabile Verbindung. Neue Bedienteile laden bei Bedarf (A.13); im Audio-Faden
  rechnet ohne neues Merkmal kein einziger zusätzlicher Befehl. **WebGL bringt in keinem der fünf Pakete etwas** (Balken, Ringe, ein Malfeld,
  eine Fläche, eine Silben-Leiste: alles Canvas 2D/SVG unter 2 ms je Bild). **WebGPU bringt nur bei der Worterkennung (G9) etwas** und wird
  dort genutzt, wo Safari es hat.

## Inhalt
- **Teil A — Gemeinsame Schnittstellen** (A.0 Lesart · A.1 Adressen · A.2 Endwert und Je-Stimme-Werte · A.3 Worklet-Nachrichten · A.4 Baustein N
  `S.need` · A.5 Form-Format · A.6 Tastatur-Feld · A.7 Editor-Ziel · A.8 Haptik und Geräte-Probe · A.9 Sichtbares · A.10 Gesangs-Analyse und
  Zeitachsen · A.11 Regler-Bild, gehörter Wert, Mod-Übersicht · A.12 Undo und Speichern · A.13 Laden bei Bedarf · A.14 Messverfahren, Marken,
  Proben · A.15 Taktarten, Last, Online · A.16 Aufgelöste Widersprüche)
- **Teil B — Die Pakete** (B.0 Überblick · B.1 I1 · B.2 I2 · B.3 I3 · B.4 I4 · B.5 G9)
- **Teil C — Bauplan für Helfer** (Hauptlinie, Zweige, Konfliktzonen, Zusammenführung, gemeinsame Abnahme N8, Gerätetermine, Dauer)
- **Teil D — Fragen an Xander** (10 Fragen mit Vorgabe; Vorgaben, die ohne Rückfrage gelten)

---

## Teil A — Gemeinsame Schnittstellen (gilt vor den Paket-Texten)

### A.0 Lesart
- Jede Schnittstelle hat **genau einen Besitzer**, der sie baut. Die anderen Pakete benutzen sie unverändert. Wird ein Nutzer vor dem Besitzer
  zusammengeführt, bringt er die Schnittstelle **genau nach diesem Teil A** mit, und der Besitzer übernimmt sie ohne Änderung.
- Die Schnittstellen in A.1–A.12 ändern sich im Bau nicht. Muss eine geändert werden, entscheidet der Dirigent und schreibt es in diesen Nachtrag
  (nie still in einem Zweig).

| Schnittstelle | Besitzer (baut) | Nutzer |
|---|---|---|
| Adress-Schema, `LKT`, `lktBuild()`, `pv-layout.json` (A.1) | I2a | I1c, I2b–g, I3e |
| Endwert-Formel (A.2) | I1 §5.1 (Text); Rechnung `SRCore` in I1c | I2 (liefert `Lock_k`) |
| Je-Stimme-Tabelle `v.pv`/`v.pvR`/`v.stOn` (A.2) | I2a (Platzliste), I2b (Lesen/Schreiben im Worklet) | I1c |
| Reihenfolge in `onMsg`, ein Sendeweg (A.3) | I3a (legt die Reihenfolge an, `lf` vor `set`) | I1a/I1c (`morph`, `sr`), I2d (Fächer) an der festen Stelle |
| Baustein N `S.need`/`KNOWN_NEED` (A.4) | I2a (geplant als Erstes auf der Linie) | I1, I3, I4 (Extra e), G9 |
| Form-Format, `formNorm`, `FORM.eval` (A.5) | I3a | I1 (`f`, `ramp.k`), I2 (`lf` im Klang-Lock) |
| `lanePut`/`lockPut` (A.5) | I2a | I3e |
| `kbFieldMode()`/`kbFieldApply()` (A.6) | I4a | I1d |
| Editor-Ziel `ED`/`edSnd()` (A.7) | I2e (Bedienseite des Klang-Lock-Blatts) | I2d, I1a-Oberfläche (nach Frage 3), I1d, I3c |
| Haptik-Regel, Geräte-Probe M-PROBE (A.8) | I4a (Probe-Seite) | I1, I2, I3, G9 |
| Uhren-Brücke `ctxOf()`, `hoerZeit()` (A.10) | I4b | I3b/c (Einwischen) |
| `heardAt()` (A.11) | I1c (ohne Lock), I2b ergänzt den Lock-Teil | VV3-Haken, I1-F7-Marke |

### A.1 Ein Adress-Schema für I1, I2, I3 (und später V5d)
Ein Klang-Parameter hat überall **denselben Pfad**: im Super-Regler-Ziel (I1 `S.sr.z[].u[uid].c/d`), im Klangzustand (V6a `clip.st.p`), im
Noten-Lock (I2 `note.lk.v`), in der freien Reihe (I2 `clip.ln[].p`), in `LKT`, in `pv-layout.json`, in der Mod-Übersicht und in den Test-APIs.

| Familie | Pfad | Beispiele | Beschreibung aus |
|---|---|---|---|
| VA (flach), FM2-Teil | `<PD-Schlüssel>`, `fm2.<…>` | `cutoff`, `res`, `o1w`, `aD` | `PD` |
| WT | `wt.<…>` | `wt.pos` | `PD` |
| Spur-Werte | `fx.<…>` | `fx.vol`, `fx.rev`, `fx.dly`, `fx.chorus.mix` | `PD['fx.*']` (**nicht** `SYN_DESC` mit `fx.reverb`) |
| Gesang-Effekte (nur I1) | `gfx.rev`, `gfx.dly` | | `G4_R` |
| FM DX | `fm6.ops.<0–5>.<k>`, `fmBright`, `fmBite`, `fm6.alg`, `fm6.fb` | `fm6.ops.2.ol`, `fm6.ops.5.r.3` | FM-Tabellen |
| FM-FELD | `fmx.ops.<0–5>.<k>`, `fmx.edge.<von>-<nach>.amt` | `fmx.ops.0.fbAmt`, `fmx.edge.4-1.amt` | FM-Tabellen |
| MS 2000 | `mk.` + K1-Pfad | `mk.t.0.f.cut`, `mk.t.1.p.3.i` | `SQMK.mkRange` |
| Drums | `drum.<Slot>.<k>`, Slot = Schlüssel aus `p.drum.slots` in **Kleinschreibung** (`kick snare rim clap hatC hatO tomL tomM tomH cym perc shaker`) | `drum.kick.tDec` | `DPD` |
| North (später) | `drum.<Slot>.m<…>` | `drum.snare.mDec` | ND-Tabellen (Nachtrag 6 §ND4) |
| Bit Mask (später) | `bm.<a│b>.<…>`, `bm.ly.md` | `bm.a.f.cu`, `bm.a.o1.m` | BM-Tabellen (Nachtrag 7 §1.15) |
| LFO-Form | `l1shape`, `l2shape` (stufig 0–5; 5 = Gemalt nur mit vorhandener `l1f`/`l2f`, sonst 1) | | `PD` |

- **Operator-Index** 0-basiert (Index im Daten-Feld), Anzeige „OP 1–6“. **FELD-Kanten** mit den 1-basierten `from`/`to` der Daten.
- **Grammatik** `^[a-z][A-Za-z0-9]*(\.[A-Za-z0-9-]+){0,6}$`, höchstens 48 Zeichen (I2 §3).
- **Reglerraum** `x ∈ [0, 1]` = Stellung des Reglers mit genau seiner Kennlinie (`toNorm`/`fromNorm`). Kennlinien: **`lin`** (auch `bip` und
  fehlendes `c`), **`exp`**, **`db`**, **`hdec`**, **`pow`** mit Exponent `k`, **`bipow`** mit Exponent `k` (symmetrisch um 0, z. B. `fmBright`),
  **`vals`** (stufig, `x = Index/(n − 1)`). Diese Liste gilt für `LKT.c` **und** `srDesc` (I1); I2 §3 nannte nur `lin|exp|pow|db|bip` – ergänzt.
- **`LKT`** wird von `lktBuild()` (I2a) beim Start aus `PD`, `DPD`, den FM-Tabellen und `normMk`-Bereichen erzeugt; Felder nach I2 §3 plus `k`.
  `srDesc(k)` (I1) liest ab I2a `LKT[k]`; vorher liest es dieselben Quellen direkt (gleiches Ergebnis, I1-27).
- **`pv-layout.json`** (Plätze im Worklet, Räume A und M): von I2a erzeugt, eingecheckt, eingefroren; neue Schlüssel nur hinten anhängen. I1c
  benutzt die Datei unverändert (I2-61).
- **Nicht adressierbar** (benannt in `LKT_EXC` bzw. „nur im Grundklang“): Form-Tabellen `l1f`/`l2f`; Bend, Rad, Druck; Master, Busse,
  Hall-/Echo-Raum, Tempo, Swing; Engine, Modus (`mk.mode`, VA `mode`), Stimmenzahl als Ziel des Super-Reglers oder Klangzustands. Struktur-Werte
  der Klasse `s` (I2 §2 L3) gibt es nur als Klang-Lock (ganzer Klang), nie als einzelnen Lock oder Super-Regler-Ziel.
- **Unbekannte Pfade** (neuere Version) bleiben gespeichert, wirken nicht und erscheinen grau bzw. schraffiert.
- **Folge für I1:** Das Feld `s: {'KICK': {…}}` in I1 §4.1 entfällt. Drum-Werte stehen wie alle anderen in `c` (stetig) bzw. `d` (stufig), z. B.
  `'drum.kick.tDec': 0.12`.

### A.2 Endwert, Je-Stimme-Werte, Kerne
- Die **vollständige Endwert-Formel** steht nur in **I1 §5.1**. I2 liefert genau einen Term: **`Lock_k = Noten-Lock_k ?? Reihenwert_k(t)`**
  (I2 §2 L1). Solange I1 fehlt, gilt dieselbe Formel mit `SR = 0` und ohne Zustand.
- Folgen (gemeinsam geprüft in N8-04 = I1-24 + I2-09 b–d): Lock schlägt Klangzustand; der Super-Regler **verschiebt** gelockte Schritte
  (Vorgabe von Frage 7; bei „fest“ ändern sich nur die eine Zeile in I1 §5.1 und I2-09 b / I1-24 a); stufig gewinnt der Lock; Modulation rechnet
  obendrauf. Ein Klang-Lock ist ein Lock auf **alle** Schlüssel seines Klangs.
- **Je-Stimme-Tabelle** `v.pv` (Float32, `NaN` = frei), `v.pvR`, Weiche `v.stOn`, Reihen-Feld `lb`: Definition **I2 §5.2** für beide Pakete.
  Schreib-Reihenfolge beim Anschlag: (1) I1 stufige Werte aus Super-Regler/Zustand, (2) I2-Paare. Ohne Werte läuft genau der heutige Code.
- **Kerne:** `sr` geht an **alle** Kerne einer Spur (Hauptkern und Fächer `kc[1..8]`), `morph`/`morphStop` **nur** an den Hauptkern; Fächer
  bekommen `kl`/`klSet` (I2 §5.9.3). Globale Ereignisse (all-off, Panik, Tempo, `mkSong`, KEYS 9/10, Begrenzer) an jeden Kern.
- **Unter Last** (K1-Antwort 2 [X]): Begrenzer und Qualität „Auto“ ändern nie Locks, Reihen, Klang-Locks, Zustände, Super-Regler-Werte oder
  Formen. Unter Last werden nur Stimmen geklaut (K2-Regel über alle Kerne) und stufige Überblendungen zeitlich zurückgestellt (I1 §5.4).

### A.3 Worklet-Nachrichten: feste Reihenfolge und ein Sendeweg
- **`onMsg` von `dirigent-analog` übernimmt die Teile einer Nachricht immer in dieser Reihenfolge:**
  `mkSong` → `lf` (I3) → `morphStop` → `morph` (I1a) → `sr` (I1c) → `set` / `fm6` / `mods` / `mk` → Fächer: `kcMake` → `kl` → `klSet` → `klDrop`
  (I2d). Innerhalb von `kl`/`klSet` gilt dieselbe Reihenfolge für das Fach (`lf` vor `set`). Grund: eine stufige Super-Regler- oder
  Zustands-Stelle kann `l1shape` auf 5 setzen (braucht die Tabelle), und der Voll-Abgleich muss von Endwert zu Endwert überblenden (I1 A2).
- **Ein Sendeweg im Haupt-Faden:** `wkSet`/`wkFlush` sammeln je Engine **und je Kern** (`WKSET[i][c]`, I2 §5.9.5) und schicken `lf`, `sr`,
  `morph` und `set` einer Engine in **einer** Nachricht. `syncEngine(i, true)` (Voll-Abgleich mit `force`) packt `lf`, `morph` und `sr` mit
  hinein (I1 A2, I3 §4.2). Neue Engines bekommen `mkSong` sofort, wenn ihr Klang eine Form hat (I3 §4.3).
- **Ereignis-Typen** in der Warteschlange: Note-an mit Zusatz-Paaren (I2 §5.1, höchstens 41 Zahlen), **Typ 11** Reihen-Wert, **Typ 12** Reihen
  leeren (I2c). Andere Pakete legen keine neuen Typen an.
- **Ohne neues Merkmal** ist jede Nachricht byte-gleich zu heute. Ein gemeinsames Werkzeug **M-MSG** (I1 §12) dient I1-01, I2-04 und I3-01.
- Bit Mask bekommt die Formen `{t:'sr', …}`, `{t:'morph', …}` (I1h) und `{t:'on', list:[…lk]}`, `{t:'ln', …}`, `{t:'prog', …}` (I2g); North
  bekommt keine `sr`-Nachricht, jeder Schlag liest `srAt(t)` (I1 §5.5).

### A.4 Baustein N: `S.need` (Vorwärtsschutz für alle neuen Projektfelder)
**Befund [C]:** Der Wächter VO-R1 (`nvLockOf`) sperrt nur bei Format > 5 oder fremder Engine. Reine Zusatzfelder sperren nicht; ein älterer Stand
würde sie beim Speichern **still verwerfen**. Die Aussage in I2 §4 („VO-R1 zeigt das Hinweisband“) stimmt darum nicht.
- **`S.need`** = sortierte Liste der Merkmale, die ein Projekt enthält und die ein älterer Stand verlieren würde. Beim Speichern **aus den
  Daten berechnet**; leer = Feld fehlt (JSON zeichengleich). Merkmale:

| Merkmal | gesetzt, sobald im Projekt … | Paket |
|---|---|---|
| `'sr'` | `S.sr` oder `song.sr` | I1 |
| `'st'` | ein `clip.st` | I1 (V6a) |
| `'lk'` | ein `note.lk.v`, `note.lk.k`, `clip.kl` oder `clip.ln` | I2 |
| `'lf'` | eine `l1f`/`l2f` (Spuren und Klang-Locks), `S.sr.f` oder `song.sr[].f` | I3 |
| `'ly'` | ein `take.ly` | G9 |
| `'tp'` | ein `take.tp` (nur mit I4-Extra e) | I4 |

- `normalizeProject` vergleicht mit `KNOWN_NEED` des Stands. Ein unbekanntes Merkmal kommt in `_newer` (`n: [...]`), und `nvLockOf` sperrt wie
  VO-R1 mit dem vorhandenen Hinweisband („Aus einer neueren SYNQUENZER-Version …“); nichts wird überschrieben.
- **Besitzer:** Baustein N wird mit **I2a** gebaut (+0,5–1 h), weil I2a als erstes Klang-Paket auf die Linie kommt. Jedes Paket trägt bei seiner
  Zusammenführung nur sein Merkmal in `KNOWN_NEED` und in die Berechnung ein. Kommt ein anderes Paket vorher, bringt es Baustein N genau so mit.
- **Bekannte Lücke:** Stände **vor** Baustein N öffnen ein neueres Projekt ohne Sperre und verlieren die neuen Felder beim Speichern. Das lässt
  sich dort nicht nachrüsten; die Pages-Seite liefert immer den neuesten Stand; Vorgänger-Snapshots dienen nur zum Vergleichen (Changelog).
- **Geänderte Abnahmen:** I1-28, I2-06, I3-10, G9-51 und I4-51 prüfen beide Fälle so: (a) Stand mit Baustein N ohne das Merkmal (Test über
  `KNOWN_NEED` ohne Eintrag) → gesperrt mit Hinweisband, keine Speicherung; (b) Stand vor Baustein N → öffnet ohne Fehler (bekannte Lücke);
  (c) zurück im neuen Stand deep-equal. Gemeinsam N8-02.

### A.5 Ein Form-Format für I3, I1 und I2
- **Form** = Objekt aus I3 §3.1: `{v: 1, n?, k: [[x, y, t, b], …]}`; `x` ganze Ticks 0…768 als **Anteil am Zyklus**, `y` −1000…+1000, `t` 0 Halten ·
  1 Gerade · 2 Kurve, `b` Biegung −100…+100; ≤ 65 Knoten, nach Aufräumen ≤ 33; ≤ 1,3 KB.
- **Worklet-Tabelle:** `Float32Array` flach `[x/768, y/1000, t, b/100] × N` (I3 §4.2). Dieselbe Tabelle reist als `lf` (I3, und im Klang-Lock
  `{kl}`/`{klSet}` von I2) und als `k` in `{sr: {ramp: {x0, x1, t0, t1, k}}}` (I1/I3f).
- **Eine Auswertung:** `FORM.eval(f, ph, e, {wrap})` im Haupt-Faden, eine wortgleiche ASCII-Fassung im Worklet, `FORM.rideAt()` für Fahrten
  (I3 §4.6). LFO: `wrap: true`, Kanten 1 ms. Super-Regler-Fahrt: `wrap: false`, Kanten 20 ms, korrigierte Kurve F̂ (Start ohne Sprung).
- **Normalisieren:** `formNorm` (I3a). Vor I3 behält I1 ein `f` unverändert (unbekanntes Objekt ≤ 4 KB) und fährt gerade.
- **Einsetzen** in eine I2-Reihe nur über `lanePut(t, s, path, werte[], {len, g})` und `lockPut(t, s, path, werte[], {g})` (I2a, ein Undo, Art
  `'clip'`); in die MS-2000-Mod-Sequenz über `timApply`. Eingesetzt wird immer eine **Kopie** (Vorgabe, D.2).

### A.6 Tastatur-Feld `#kbArea`: eine Regel für I4 und I1
Gilt wortgleich für I4 §7.2 und I1 §6.1 (ersetzt dort „das zuletzt geöffnete gewinnt“; das Verhalten ist in allen Fällen dasselbe, nur genau
festgelegt). Besitzer: **I4a** (wird vor I1d zusammengeführt); I1d ergänzt nichts außer seinem Feld.
```
kbFieldMode():  'tipp' | 'sr' | 'tasten'                      feste Reihenfolge
  1. 'tipp'    ST.on && vsCfg().rh === 'tippen' && vsCfg().mel !== false && !TIP.zu && !R.songRec && !R.sr?.cap
  2. 'sr'      uiPrefs().kbFeld === 'sr'  ||  R.sr?.cap        (ein laufendes Vormachen hält das Super-Regler-Feld)
  3. 'tasten'
kbFieldApply(): zeigt genau ein Feld (die anderen bleiben im DOM, hidden); Räder #mkWh nur bei 'tasten' (mkWheelFrame fragt den Modus);
                Rasterhöhe von #kbArea unverändert (± 0 px); UI.kbRelayout = true.
Aufrufen bei:   🎤 an/aus · rh- oder mel-Wechsel · [⌨] in Tippfläche oder Super-Regler-Feld · Menü „Super-Regler“ · Start/Ende Vormachen ·
                Start/Ende Song-Aufnahme · Spurwechsel · Laden der Seite.
uiPrefs().kbFeld ('kb' | 'sr', Gerät): 'sr' durch Menü „Super-Regler“, 'kb' durch [⌨] im Super-Regler-Feld.
TIP.zu (Sitzung): true durch [⌨] in der Tippfläche oder Menü „Super-Regler“, solange die Tippfläche zu sehen ist;
                  false durch 🎤 an und durch „Tippen“ im Mikro-Blatt.
Vormachen:      Wird während eines Vormachens 🎤 mit „Tippen“ eingeschaltet, bleibt das Super-Regler-Feld (Hinweis einmal: „Vormachen zuerst
                beenden“); nach Merken/Abbrechen gilt wieder die Reihenfolge oben.
Neuladen:       🎤 ist danach aus → 'sr' oder 'tasten' nach uiPrefs().kbFeld.
```
- Der Einstellungs-Name ist **`uiPrefs().kbFeld`** (I1); I4 §7.2 schrieb `uiPrefs.kbField`.
- **Räder:** Auf AM-Spuren sind die Räder ausgeblendet, solange Tippfläche **oder** Super-Regler-Feld zu sehen ist (beide nutzen die volle Breite;
  I1 rechnet seine Fassungen mit `w` = Breite − 12 px). Ausblenden ändert keinen Rad-Wert.
- Das MS-2000-Blatt, das das Feld abdeckt (`mkcov`), ändert den Modus nicht (I4 §7.2, I1 §6.3).
- **Gemeinsamer Test N8-06** (= I1-45 = I4-02): alle Übergänge der Tabelle, mit Vormachen, AM-Spur, MS-2000-Blatt und Neuladen; je genau ein Feld
  sichtbar, Höhe ± 0 px, keine Konsolen-Fehler.

### A.7 Editor-Ziel: wer bearbeitet gerade was
Vier Pakete leiten die Klang-Editoren um: Grundklang (heute), ◆ Klangzustand (I1a/V6a), Vormachen (I1d), Klang-Lock (I2d/e). Dafür gibt es
**ein** Ziel:
```
ED = {t, ort: 'grund' | 'st' | 'cap' | 'kl', clip?, id?, c}      c = Kern (0 Hauptkern, 1–8 Fach)
edSnd(t)  → 'grund': track.sound · 'st': Zustand clip.st (V6a-Sicht) · 'cap': Arbeitskopie R.sr.cap.copy[uid] · 'kl': clip.kl[id].s
```
- Alle Schreibwege der Editoren (`setP`/`wkSet`, `fmxApply`, `mkSetP`, `edParamChanged`, I3-Malen `wkLf`, Vorhören `model.audition`) gehen
  über `ED`: `'grund'`/`'st'` wie heute bzw. V6a; `'cap'` an den Hauptkern als `{set: Kopie, sr: null}` ohne `force` (I1 §6.3); `'kl'` als
  `{klSet: {c, …}}` (I2 §5.9.5). `sndOf()` bleibt unverändert (Planer und Engine-Abgleich).
- **Ausschluss:** Je Spur ist höchstens ein Ort ≠ `'grund'` offen. Während eines Vormachens sind LOCK-Modus, Klang-Lock-Bearbeitung und Form-Blatt
  grau („erst Ziel merken oder abbrechen“); während LOCK-Modus oder Klang-Lock-Bearbeitung ist [+ Ziel] grau („erst LOCK beenden“). ◆-Zustand und
  Klang-Lock-Bearbeitung schließen sich ebenso aus.
- Die LCD-Zeile des Editors nennt den Ort (Texte aus den Paketen: I1 A9 „Bearbeite: ◆ …“, I1 §6.3 „VORMACHEN 67 % …“, I2 §6.6 Kopfzeile
  „… · Klang-Lock K4 · …“). Die Oberfläche von `'st'` kommt erst nach Frage 3, die von `'cap'` erst nach Frage 2.
- Prüfung N8-07: Port-Spion wie I2-73 für alle vier Orte; im Ort `'cap'` bleiben `track.sound`, `tr.gfx` und alle `clip.st` deep-equal (I1-32).

### A.8 Haptik: eine Regel für alle, eine Geräte-Probe
**Fakten** (I4 [W3]/[W7], G9 [W7], I3 §13): Safari auf dem iPhone hat kein `navigator.vibrate`. `haptic()` klickt heute aus dem Code auf ein
verstecktes Schalter-Label; das wirkt laut Bibliotheks-Doku nur auf iOS 17.4–26.4 und braucht eine Nutzer-Aktivierung. Ein Ziehen
(`pointermove`) und ein Sensor-Ereignis sind nie eine Aktivierung. Während einer Aufnahme schaltet iOS Haptik in der Grundeinstellung ab.
- **H1 Pflicht ist das Sichtbare** (abnahmerelevant): I1 `.hit` 120 ms an Marke und Chip · I2 Zellen-Leuchten 150 ms, LCD, Blase „VEL …“ ·
  I3 Gleiten 150 ms, Aufleuchten 300 ms, Viertel-Linie 120 ms · I4 Fläche hell (`.down`) · G9 Rahmen-Puls 150 ms und Vorspielen.
- **H2** `haptic()` wird **nie** aus `pointermove`, `deviceorientation`, Zeitgebern oder Worklet-Rückmeldungen gerufen. Das streicht: I1 Tick/Snap
  beim Überfahren eines Ziels, an 0/100 % und beim Neigen (I1 §6.2, §6.7); I2 Tick je gemaltem Schritt (§6.3), Tick alle 8 VEL-Stufen und Snap an
  VEL 6/127 beim Ziehen (§6.7). Geänderte Abnahmen: I1-31 und I1-67 prüfen „0 `haptic`-Aufrufe aus Zieh- und Sensor-Ereignissen (Spion)“ statt
  „`haptic` gerufen“; I2 §13 Punkt 9 entfällt.
- **H3** Aus `pointerup`/`click`/Tasten-Eingabe darf `haptic()` dort gerufen werden, wo das Paket es nennt (I3 `snap` beim Abheben, G9 `snap` beim
  Übernehmen eines Worts). Für echte Tipps nutzt G9 das Label-Muster im Ziel (G9 §7.9). Ein Tick beim Aufsetzen auf die Tippfläche (I4 F4) nur
  nach positiver Probe **und** Xanders Ja (Frage 9). `UI.haptics` aus → keine Aufrufe, keine Label-Schicht.
- **H4 Geräte-Probe M-PROBE** (eine Seite für alle; = I4-61 = G9-61; ersetzt die Haptik-Fragen in I1-82, I2 §13.9 und I3 §12.1). Sie liegt in der
  **Werkstatt**, nicht in der App; gebaut als erster Schritt von **I4a** (+0,5 h). Sieben Knöpfe ≥ 88 × 88 px:
  1 Code-Klick bei `pointerdown`, Mikro aus · 2 dasselbe, Mikro an (`getUserMedia`, laufender Kontext, `audioSession.type = 'play-and-record'`) ·
  3 echter Tipp auf ein Label, Mikro aus · 4 dasselbe, Mikro an · 5 Label-Tipp, während ein Textfeld den Fokus hat (Tastatur bleibt offen? Tick?) ·
  6 Label über einer Leinwand · 7 Ziehen über eine 300-px-Leiste mit Code-Klick je 30 px (`pointermove`).
  Anzeigen: iOS-Version, Safari oder Home-Bildschirm (`display-mode`), `visualViewport.height` mit offener Tastatur hoch und quer (Foto),
  `crossOriginIsolated`, WebGPU-Adapter ja/nein. [Kopieren] legt alles als Text für den Funk ab.
- **H5 Auswertung:** Ein Ergebnis für alle Pakete, einmal im Changelog. Knöpfe 1–4 entscheiden I4 F4; 5–6 und die Höhen entscheiden die G9-Labels
  und `g9KbSim`; Knopf 7: Zeigt er auf Xanders iPhone einen Tick, schlägt der Dirigent Ticks für I1-Überfahren und I2-Pinsel vor (Regel 3); bis
  dahin gilt H2.

### A.9 Sichtbares: eine Regel für [V]
Die Paket-Texte benutzen [V] verschieden (I1: wartet; I2/G9: bauen und zeigen; I3/I4: je nach Fall). Ab jetzt gilt für alle:
- **(a) Im freigegebenen Vorschlag beschrieben oder von Xander selbst so gesagt** → bauen, Bilder, „Bitte prüfen“: Punkte-Ring, Regler als Pinsel,
  Anschlag als Füllhöhe mit ◀ ▶ und Vorhören (I2); Mal-Feld mit Aufräumen, Einwischen, Pumpen/Gate/Triller (I3); große Tippfläche (I4);
  Silben-Einrasten, Vorspielen bis zur nächsten Marke, Verteilen, Verschieben, Verschmelzen (G9).
- **(b) Nötig, um (a) zu bedienen, und nur über einen neuen Schalter oder ein neues Blatt erreichbar** → mit Vorgabe bauen, „Bitte prüfen“:
  LOCK-Modus und Lock-Leiste, Reihen-Optionen, Klang-Lock-Blatt (I2); Form-Blatt, ✎ in der Form-Leiste, „Aus Form“ (I3); Zeile „Rhythmus“ im
  Mikro-Blatt, Zählzeile (I4); Text-Modus, Tastatur-Dock, Erkennen-Blatt (G9).
- **(c) Verändert eine vorhandene Ansicht dauerhaft oder belegt einen festen Platz** → **erst nach Xanders Antwort**: Super-Regler-Feld im
  Tastatur-Feld (Frage 2), V6a-Bedienung in den Editor-Köpfen und ◆ in der Clip-Zelle, Regler-Marke und Speichern-Hinweis (Frage 3), Streifen der
  Fahrten in der Song-Ansicht und Teil-Blatt-Zeile (Frage 4), Kurven-Chip von I3 (folgt Frage 2).
- **(d) Zusätzliche Funktionen, die nicht im Vorschlag stehen** → nicht bauen bis Ja: I4-Extras a–f (Frage 8), I3 „Meine Formen“, G9 weitere
  Orte für den Text, G9 Text-Trennpunkt, I2 Lock-Aufnahme (D.2).
- Bis zu einer Antwort laufen die Klang-Teile hinter (c) trotzdem (z. B. V6a-Morph, Super-Regler-Kern); sie sind ohne Oberfläche unhörbar,
  solange keine Daten da sind.

### A.10 Gemeinsame Gesangs-Analyse und Zeitachsen (I4 ↔ G9, dazu I3-Einwischen)
| Achse | Bedeutung | Umrechnung | genutzt von |
|---|---|---|---|
| Kontext-Zeit | `AU.ctx.currentTime` | Berührung: `ctxOf(P)` = Uhren-Brücke (I4 §5.2) | I4, I3 |
| gehörte Zeit `h` | Kontext-Zeit der Musik, die man gerade hörte | Taste: `now − AU.outLat`; Finger: `hoerZeit(P) = ctxOf(P) − AU.outLat − (τ + Δout)/1000` | I4 (Tipps), I3 (Einwischen) |
| Take-Sekunde (Quelle) | Zeit im aufgenommenen Take **vor** der Zeitkarte; Sample 0 = Kontext-Frame `F0` (`tkMakeTake`: `Fa − pre`; `g8MakeTake`: `s.F0`) | `x = h − F0/sr` | G9 `ly.s[].t`, I4 `tp.x` (Extra e), VS5a-Marken |
| Ziel-Zeit | gehörte Lage im Clip nach Quantisieren/Dehnen | `warp(x)` (`VSM.warpTime`); Vorspielen mit der Karte des gelieferten Puffers `tkHeardMap` | G9 Anzeige/Vorspielen, G1 |
| Analyse-Sekunde | pYIN-Rahmen (5 ms, fs = sr/3) der Analyse `A` | live `A.secOfH(h)` (I4); aus dem Take `s = x − (3·d0 + 2)/sr`, ohne Zeitkarte (G5) | I4 `tapNotes` |
| Schlag | Musik-Lage | `t2b(h)` bzw. `A.beatOf` | alle |

- **Eine Uhr für Berührungen:** `ctxOf()` und `hoerZeit()` baut **I4b** (I4 §5.2–5.4: beide Zeitstempel, Plausibilität 2 s, Neustart bei
  Sichtbarkeit, `τ` gelernt/gemessen/geschätzt 30 ms, `Δout` je Ausgabeweg). **I3 §5.5 benutzt dieselbe Funktion statt `getOutputTimestamp()`**
  (I4 [W2]: zu kleine `contextTime` auf iOS; zwei Uhren wären zweimal zu messen). Das bisherige `d_f = 30 ms` von I3 ist `τ` (gleiche Vorgabe).
  I3-19, I3-39 und M-WISCH faken die Uhren-Brücke (feste Zeitstempel, `AU.outLat` 50 ms, τ 30 ms) statt `getOutputTimestamp`. M-LAGE (I3-36)
  bleibt als Befund; weicht die Lage um > 15 ms ab, schlägt der Dirigent eine Korrektur vor. Der Hinweis „Kabellose Ausgabe …“ (I3) bleibt.
- **Analyse:** `A` aus `vsAnalyse` gehört VS2; I4 hängt `A.tips`, `A.secOfH`, `A.tipAlign` an. G9 benutzt `A` nicht, sondern `wpBase(id)`, die
  VS5a-Marken (nur lesen, **G9 schreibt nie `take.marks`**) und eigene Merkmale `g9Feat` (mit Vokal-Einsatz `von`).
- **Tipps als Silben-Hinweis:** nur über `tipTakeTaps(id)` (I4-Extra e) und nur, wenn G9-55 besteht; sonst nichts (I4 F5, G9 §6.3).
- **Geräteprofil `stProf()`:** I4 bekommt `vs.rh` und `tipp` (Lader `tipProfNorm`), G9 bekommt `g9` (Lader `g9ProfNorm`). Niemand schreibt in
  `prof[route]`.
- **Mikrofon hat Vorrang:** Jeder Mikro-Start (`stStart`, `micStart`, `micTapGet`) beendet eine G9-Erkennung (G9 §6.6.10). Die Tippfläche gibt es
  nur mit 🎤 an; Text-Modus und Erkennung laufen nie gleichzeitig mit dem Mikro.
- **Kein gemeinsames Bedien-Bauteil:** ◀ ▶ in I2 und G9 sind getrennt gebaut.

### A.11 Regler-Bild, gehörter Wert, Mod-Übersicht
- **Ebenen am Regler-SVG** (60 px, 56er-Raster, Code Z. 26693 / CSS Z. 962): Wert-Bogen r 22 (darauf nach Frage 3 die I1-Marke, 2 px) ·
  Mod-Ring r 26,5 · Halte-Ring bzw. I2-Punkte-Ring r 29 (I2 §6.4, mit Platzregel und ◆ an kleinen Reglern) · LFO-Laufpunkte wie heute (I3 nutzt
  sie). Kein Paket verschiebt Etikett oder Wert-Text.
- **`heardAt(track, path, t)`** = gehörter Wert nach I1 §5.1 (Grund, Zustand, Lock aus `lkValueAt`, Super-Regler zur Zeit t, ohne LFO). Eine
  Funktion im Haupt-Faden für die VV3-Haken (`vv3Knob`, `vv3PlateN`, `vv3VaState`/`vv3FmState`/`vv3MkState`) und die I1-Marke. I1c baut sie
  (ohne Lock), I2b ergänzt den Lock-Teil – wer zuerst kommt, baut sie ganz mit dem eigenen Teil. Ersetzt die getrennten Haken in I1 §7 und I2 §5.11.
- **Mod-Übersicht (K1):** Abschnitte in dieser Reihenfolge: Modulationen (K1) → Klangzustand ◆ (I1 `'st'`) → Super-Regler (I1 `'sr'`) →
  Schritt-Werte (I2). I3 ändert nur den Quellen-Text („LFO 1 ✎ Pumpen“). Jeder Regler, der sich bewegt, hat **je Ursache genau eine Zeile**.

### A.12 Undo, Speichern, Laden
- Undo-Arten: `'sr'` (I1, `S.sr`) · `'song'` (I1e/I3f, `song.sr`) · `'clip'` (I1 `clip.st`, I2 `lk`/`kl`/`klq`/`ln`, I3 über `lanePut`/`lockPut`) ·
  `'sound'` (I3 `l1f`/`l2f`) · `timApply` (I3 MS-2000-Sequenz) · `'ly'` (G9, nur Text eines Takes) · `'takes'` (G9-Marken-Haken, wie heute) ·
  I4: das vorhandene Ergebnis-Undo. Eine Geste = ein Schritt.
- Wiedergabe, Fahrten, Schleifen, Einwisch-Vorschau und automatische Erkennung ändern nie den Undo-Stapel und nie den „geändert“-Punkt
  (I1 §5.6, I3 §5.5, G9 §7.8).
- Jedes neue Feld läuft durch Normalisieren, Speichern/Laden, Kopieren/Einfügen, Duplizieren, eigene Song-Clips, Teil-Kopien (S0–S2), FANG, ZIP
  (P1) und Online-Projekt (Format 5) deep-equal. Gemeinsamer Test N8-14 mit einem Projekt, das alle Merkmale enthält.
- `historyCheck()` (VC2a) ist auf der Hauptlinie (H1) und gilt in allen Undo-Abnahmen.

### A.13 Laden bei Bedarf und Startzeit
- Bedien-Blöcke, ausgewertet erst beim ersten Gebrauch (Muster `sq-mk-src`): **`sq-sr-src`** (I1d-Feld, Vormachen-Leiste, I1f-NEIGEN) ·
  **`sq-lock-src`** (I2e) · **`sq-form-src`** (I3b–d) · **`sq-g9-src`** (neu: G9c-Text-Modus und die Haupt-Faden-Teile von G9a; ausgewertet beim
  ersten [Text] bzw. beim Öffnen des Marken-Editors für einen Take mit `ly`). Im Start-Pfad bleiben nur Daten, Normalisierer, Undo-Fälle und die
  Worklet-/Planer-Teile.
- Erkennung: Modell, Laufzeit und Bibliothek nie beim Start (G9-23); Silben-Muster beim ersten Text-Modus.
- **Startzeit** der App mit allen fünf Paketen ± 5 % gegen H1 (N8-13). Die App wächst um ≈ +327 KB, davon ≈ 95 KB nur bei Bedarf.

### A.14 Messverfahren, Marken-Prüfung, Proben
- **Namen:** M-TAKT gibt es zweimal. In I1 heißt es ab jetzt **M-FAHRT** (Fahrt-Genauigkeit); M-TAKT bleibt bei I3 (Takt-Lage). Gemeinsam benutzt:
  M-MSG (I1), M-PAAR und M-GESTE (I2), M-PROBE (A.8), M-UHR (I4).
- **Marken-Prüfung N8-10** (ersetzt I1-41, I2-46, I3-34; Verfahren wie I3-34 über den **N8-Diff**: neue und geänderte Zeilen in DOM-Texten,
  Hilfe, CSS, Bezeichnern, Kommentaren, Testnamen):
  `grep -i -P '\b(yamaha|montage|modx|super ?knob|korg|microkorg|wavestate|opsix|modwave|nord(?!en)|kodamo|essencefm|mask ?1(?![0-9])|elektron|digitone|octatrack|machinedrum|serum|vital|bitwig|kilohearts|xfer|procreate|waveshaper|animoog|moog|ableton|logic ?pro|garageband|melodyne|dubler|vochlea|humtap|whisper|openai|hugging ?face)\b'`
  = 0. Ausgenommen: Web-Audio-Namen (`createWaveShaper`, `WaveShaperNode`), vorhandene Werksklang-Namen und -IDs (`Moog-Bass`, `moog-bass`,
  `f-moog-bass`, `Minimoog`, `OLD_PRESETS`) und die G9-Ausnahmen (unveränderte Dateien unter `vendor/g9/`, ihre festen Dateinamen,
  `vendor/g9/LIZENZEN.txt`, die Ersatz-Adresse als Datenzeichenkette, G9 Regel 24). Dazu in der ganzen App: „MS 2000“ genau einmal (`MK_LABEL`).
- **Prüf-Werkzeuge** sind erlaubt und brauchen keinen Vorschlag, weil sie die App im normalen Gebrauch nicht verändern: Prüf-Link `#tippmessung`
  (I4), Adress-Schalter `?g9diag=1` (G9), Probe-Seite in der Werkstatt (A.8), Proben im vorhandenen Leistungs-Blatt (`perfProbe`: I1-, I2-,
  I3-Probe und die N8-Gesamtprobe).

### A.15 Taktarten, Last, Online
- **T1 (Taktarten)** kommt nach den Gesang-, Video- und North-Zusammenführungen. Kein N8-Paket führt neue 4/4-Annahmen ein: Takte nur über
  `grid().beatsPerBar` bzw. Song-Schläge (`song.sr` in Song-Schlägen wie `song.xp`; Form-Zyklen in Schlägen; G9 über die Raster-Funktion).
  T1 prüft den N8-Diff auf `×4`/`16`-Literale.
- **Last:** A.2 (unter Last nie ein anderer Klang). Die K1-Nachbesserung zu Xanders K1-Antworten 1 und 2 (Key-Reset, kein ECO-Umschalten) ist
  **keine** Voraussetzung für N8; I1/I2 verlangen nur, dass `limited()` auf jeden Kern gleich wirkt.
- **Online:** nur Zusatzfelder im Projekt (Format 5) plus `S.need`; kein neuer Server-Aufruf (G9 lädt das Modell vom eigenen Pages-Server).

### A.16 Aufgelöste Widersprüche (Übersicht)
| Thema | Stellen | Entscheidung |
|---|---|---|
| Tastatur-Feld | I1 §6.1 „zuletzt geöffnet gewinnt“ ↔ I4 §7.2 feste Reihenfolge, `kbFeld` ↔ `kbField` | A.6: feste Reihenfolge mit Vormachen-Ausnahme, `uiPrefs().kbFeld`, Räder nur bei 'tasten'; ein Test N8-06 |
| Haptik beim Ziehen/Neigen | I1 §6.2/§6.7, I2 §6.3/§6.7 rufen `haptic()`; I3/I4/G9: wirkt dort nicht | A.8 H2: keine Aufrufe aus Zieh-/Sensor-Ereignissen; Probe-Knopf 7 klärt es am Gerät |
| Drum-Adressen | I1 §4.1 `s: {'KICK': …}` ↔ I2 `drum.kick.*` | A.1: `drum.<Slot>.<k>` klein, in `c`/`d` |
| Kennlinien in `LKT` | I2 §3 ohne `hdec`/`bipow`/`k` ↔ I1 §4.1 | A.1: volle Liste in `LKT.c` + `k` |
| Ältere Stände | I2 §4/I2-06 „VO-R1-Band“ (falsch) ↔ I1 §4.5/I3 §3.7 `S.need`; G9/I4 ohne Schutz | A.4: Baustein N für alle neuen Felder, Merkmale `sr st lk lf ly tp` |
| Bedeutung von [V] | I1 wartet ↔ I2/G9 bauen ↔ I3/I4 je nach Fall | A.9: Regel (a)–(d) |
| Haptik-Probe | I4-61 mit 4 Knöpfen ↔ G9-61 braucht 2 mehr + Höhen; I1-82 fragt nach Ziehen | A.8 H4: eine Probe M-PROBE mit 7 Knöpfen und Anzeigen |
| Gehörte Zeit einer Berührung | I3 §5.5 `getOutputTimestamp` ↔ I4 §5.2 bewusst ohne (iOS-Fehler) | A.10: eine Uhren-Brücke `hoerZeit()` aus I4b |
| Video-Haken der Regler | I1 §7 `effective(t)` ↔ I2 §5.11 `lkValueAt` | A.11: eine Funktion `heardAt()` |
| Messverfahren-Name | M-TAKT in I1 und I3 verschieden | A.14: I1 → M-FAHRT |
| Marken-Prüfung | I1-41 (neue Blöcke), I2-46 (ganze App), I3-34 (Diff) mit verschiedenen Listen | A.14: eine Liste über den N8-Diff (N8-10) |
| Editoren umleiten | I1 „dritter Bearbeitungs-Ort“ ↔ I2 `ED`/`edSnd` (ohne Ort) | A.7: ein `ED` mit `ort`, gegenseitiger Ausschluss |
| Kalenderzeit I2 | I2 §9: Zweig A = 32–40 h, genannt 26–32 h | Teil C: Zweig A geteilt (I2a→b→c ‖ I2d ab I2a) |
| Wer legt `S.need`, `pv-layout.json`, `kbFieldMode` an | „wer zuerst baut“ in I1/I2/I3/I4 | A.0: feste Besitzer (I2a, I2a, I4a) |


---

## Teil B — Die Pakete

### B.0 Überblick
| Paket | Inhalt | Unterpakete | Arbeit | Kalender (parallel) | Budget | wartet auf |
|---|---|---|---|---|---|---|
| **I1** Super-Regler | großer Regler durch bis zu 4 Klangzustände, Vormachen, Fahrt bis zum nächsten Teil, NEIGEN mit Daumen-Kupplung; dazu der geplante weiche Szenenwechsel (V6a/V6a′) | I1a–I1h | 35–46 h | 17–22 h | +123 KB (35 bei Bedarf) | Feld: Frage 2 · Editor-Anzeigen: Frage 3 · Song-Fahrt: Frage 4 · Adapter: Bit Mask/North |
| **I2** Locks für alles | Noten-Locks für jede Engine (eine Adress-Tabelle), freie Reihen mit Länge/Chance/Ratsche („OP 2 Pegel“), Klang-Lock je Schritt (auch anderer FM-Algorithmus), Pinsel, Punkte-Ring, Anschlag sehen/ziehen/hören | I2a–I2g | 55–69 h | 26–32 h | +100 KB (25 bei Bedarf) | Adapter: Bit Mask/North |
| **I3** Mal-LFO | sechste LFO-Form ✎, Aufräumen beim Abheben, Einwischen im laufenden Loop, Bibliothek Pumpen/Gate/Triller, Einsetzen in Mod-Sequenz, Lock-Reihe und Super-Regler-Kurve | I3a–I3g | 21–27 h | 11–14 h (+ Anschluss) | +39 KB (21 bei Bedarf) | I3e-Reihe: I2a + I2c · I3f: I1c–I1e |
| **I4** Tipp-Summen | Stimme gibt den Ton, Finger den Rhythmus; Uhren-Brücke, gelernte Verzögerung, Noten aus Tipps, eine Notenquelle | I4a–I4c, I4e (+ I4x, I4d) | 16–20 h (+ 7–10 h Extras) | 10–12 h | +19 KB (+ 8 KB Extras) | Extras: Frage 8 · Tick: Frage 9 |
| **G9** Songtext | Worte auf dem Gerät erkennen, Silben an Marken ausrichten, Tipp = Vorspielen + Einrasten, Schreiben mit Hören, Ersetzen/Löschen/Einfügen/Verschieben/Verschmelzen/Trennen | G9a–G9e | 37–47 h | 18–24 h | +45 KB (+ ≈ 80–100 MB Modell nur nach [Erkennen]) | Erkennen: Frage 1 (Freigabe) |

**Lesehilfe:** Jedes Paket beginnt mit den **Dirigenten-Hinweisen** (sie gehen dem Paket-Text vor), danach folgt der **vollständige Paket-Text**
(Fassung 2 nach Fach-Prüfung, Überschriften um zwei Ebenen eingerückt, sonst unverändert). Abschnitts-Verweise wie „I2 §5.2“ meinen die
Abschnitte im jeweiligen Paket-Text. Die Fragen der Pakete sind in Teil D zusammengefasst; die dortige Nummer gilt für Xander.


### B.1 Paket I1 — Super-Regler (mit weichem Szenenwechsel V6a)

#### Dirigenten-Hinweise zu I1 (gelten vor dem Paket-Text)
1. **Drums (§4.1):** Das Feld `u[uid].s` entfällt. Drum-Werte stehen als `drum.<Slot>.<k>` (Slot klein, z. B. `'drum.kick.tDec'`) in `c` bzw.
   `d` (A.1); `srDesc` liest sie über `DPD`. I1-17 entsprechend.
2. **Ältere Stände (§4.5, §7 Zeile I2):** Baustein N nach A.4 (gebaut mit I2a); I1 trägt `'sr'` und `'st'` ein. Der Satz „I2 trägt `'lk'` ein“
   ist erledigt. I1-28 prüft nach A.4.
3. **Tastatur-Feld (§6.1):** Es gilt A.6 (feste Reihenfolge `kbFieldMode`, Vormachen hält das Feld, Räder nur bei 'tasten'); `kbFieldMode` legt
   I4a an. I1-45 ist der gemeinsame Test N8-06 (= I4-02).
4. **Haptik (§6.2 Balken, §6.7 NEIGEN):** Nach A.8 H2 gibt es beim Überfahren eines Ziels, an 0 %/100 % und beim Neigen **keinen**
   `haptic()`-Aufruf. Pflicht bleibt `.hit` (120 ms an Marke und Chip). **I1-31** und **I1-67**: statt „`haptic` wird gerufen (Zähler)“ gilt „0
   `haptic`-Aufrufe aus `pointermove`/`deviceorientation` (Spion), `.hit` wie beschrieben“. In **I1-82** entfällt die Haptik-Frage (M-PROBE
   Knopf 7, A.8 H5). §10 „Haptik im Web“ bleibt als Begründung.
5. **Vormachen (§6.3):** Bearbeitungs-Ort `'cap'` im gemeinsamen Editor-Ziel `ED` (A.7). Während des Vormachens sind LOCK-Modus,
   Klang-Lock-Bearbeitung und Form-Blatt grau; [+ Ziel] ist grau, solange LOCK oder eine Klang-Lock-Bearbeitung offen ist. I1-43 prüft beides.
6. **Nachrichten (§5.2):** `onMsg`-Reihenfolge und ein Sendeweg nach A.3.
7. **Video und Regler-Anzeige (§6.5, §7 Zeile VV1–VV3):** gehörter Wert über `heardAt()` (A.11); I1c baut die Funktion.
8. **Messverfahren (§12):** `M-TAKT` heißt hier **M-FAHRT** (A.14).
9. **Song-Werkzeuge (§4.2):** S0–S2 sind auf der Hauptlinie (H1). I1e nimmt `song.sr` auch bei „Teil ersetzen“ (S0), „Teil überarbeiten“ (S1) und
   „Zusammenfassen“ (S2) mit; I1-53 prüft diese drei Wege zusätzlich.
10. **Marken (I1-41):** ersetzt durch N8-10 (A.14).
11. **Laden bei Bedarf:** Feld, Vormachen-Leiste und NEIGEN liegen im Block `sq-sr-src` (A.13).
12. **Sichtbares:** A.9. Tore bleiben: Feld (I1d) nach **Frage 2**, V6a-Oberfläche (A9) und Regler-Anzeige/Speichern-Hinweis nach **Frage 3**,
    Fahrt im Song nach **Frage 4**. Die übrigen I1-Fragen gelten mit Vorgabe (D.2).
13. **Zweige und Basis (§8):** Teil C. Basis ist die aktuelle Hauptlinie H1; I1a darf auf `n5-br-K` beginnen. I1h läuft zusammen mit I2g im
    Adapter-Zweig `n8-br-A`.

#### Paket-Text I1 (Fassung 2, vollständig)

*SYNQUENZER v3 — Nachtrag 8, Paket I1: Super-Regler (mit weichem Szenenwechsel V6a)*

**Kurz für Xander**
1. Ein großer **Super-Regler** verwandelt mit einem Daumen den Klang – für **eine Spur oder alle Spuren** – durch bis zu **vier
   Klangzustände** (z. B. Strophe dunkel → Pre-Chorus offen → Refrain breit mit Hall → Drop verzerrt).
2. Einstellen geht durch **Vormachen**: Regler an eine Stelle schieben, Klang wie gewohnt in den Editoren einstellen, **[✓ Ziel merken]**.
   Keine Zuweisungs-Tabellen. Was du an einer Spur nicht anfasst, bleibt auf seinem Weg, wie es war.
3. **[bis zum nächsten Teil fahren]** lässt den Regler selbst und taktgenau bis zum nächsten Song-Teil hochlaufen. **NEIGEN**: iPhone kippen
   steuert den Regler, aber nur, solange dein Daumen auf dem Feld liegt (die Haltung beim Aufsetzen ist die Null-Lage).
4. Dazu kommt der schon geplante **weiche Szenenwechsel** (V6a): Beim Wechsel fahren die Regler flüssig bis zum Taktstrich in den Klang der
   neuen Szene. **Gehaltene Töne springen nie.** Alles steht in der **Mod-Übersicht** (mit ✕ löschbar), jeder Schritt ist ein Undo, alles wird
   gespeichert, und **alte Projekte klingen bitgleich**. Gelockte Schritte (I2) gehen beim Aufdrehen mit – die Frage dazu steht in I2.
5. Acht Unterpakete (I1a–I1h), zusammen **≈ 35–46 h**. Die Klang-Teile starten sofort. **Alles, was du neu sehen wirst** (das Feld, die Fahrt im
   Song, die Anzeige an den Reglern, die Bedienung des Szenenwechsels), baue ich **erst nach deiner Antwort** auf die 8 Fragen in §9.

---

Status: **Fassung 2 nach Fach-Prüfung (31.10.)**, Entwurf zum Bau nach Xanders Ja (31.10. ~16:50 UTC: „Ja, die Innovation kannst du gerne
umsetzen“; freigegeben sind die Innovationen 1–4 aus `innovation-vorschlag.md`, dieses Paket ist Nr. 1). Quellen im Projekt:
`innovation-vorschlag.md` (Idee 1 und Frage B), `fragen-xander-9.md` (31.10. ~13:00: „Seamless Sound Transition (Szenenwechsel: Regler
fahren weich zur nächsten Szene, wie … Super Knob)“; ~16:00 K1-Antworten; ~17:35 Taktarten T1), `dirigent-spec-v3.md` §6 (Klangzustände,
Morph-Kern KZ1–KZ7) und §17 Pakete **V6a / V6a′ / V6b**, `dirigent-spec-v3-nachtrag-1.md` A.9 (N6a-01), `typische-fehler.md`, Code-Stand
4.23.0 (`vs-base-B.html`) plus K1 (`n5-br-K/index.html`), VV1–VV2 (`n5-br-V/index.html`), G4 (`stage-ges/index.html`). Schwester-Specs
`n8/I2.md` (Fassung 2), `n8/I3.md`, `n8/I4.md`, `n8/G9.md`.

**Was sich gegenüber Fassung 1 geändert hat (Prüfbefunde):** (1) Endwert-Formel mit I2 abgeglichen (`Lock_k` = Noten-Lock ?? Reihenwert aus
I2 L1; `sr` an alle Kerne, `morph` nur an den Hauptkern; Je-Stimme-Tabelle `v.pv` nach I2 §5.2; Abnahme I1-24). (2) Ein Ziel ohne einen
Schlüssel wird für diesen Schlüssel übersprungen (Weg zwischen den Nachbarzielen), Neu-Vormachen behält nicht angefasste Spuren (I1-42).
(3) Feld-Fassungen nach verfügbarer Innenhöhe, die Vormachen-Leiste ersetzt eine Zeile, eigene Querformat-Fassung für 110 px, Platz für I3s
Kurven-Chip (§6.2). (4) Regler-Anzeige und „Sound speichern“ sind eine Frage (F7). (5) Sichtbares wird erst nach Antwort gebaut (§9).
(6) „Song als Audio“ nimmt in Echtzeit auf: Bitgleichheit nur offline, eindeutige Regel für den Fahrt-Beginn (§5.6). (7) Glättung rastet ein,
Leerlauf rechnet nichts (§5.3, I1-25). (8) Vormachen-Leiste im Editor-Kopf, wenn die MS-2000-Platte das Tastatur-Feld verdeckt (§6.3).
(9) iPhone-Tor für die Rechenlast (I1-83), stufige Wechsel höchstens alle 100 ms, unter Last zurückgestellt statt Blende (§5.4). Dazu:
Haptik nur „wo erlaubt“ + sichtbares Signal, NEIGEN-Rückfälle und Winkel genau, Kennlinien und Pfade wie im Code, ältere Versionen, I4-Regel,
Song-Wiedergabe ändert nur die Laufzeit-Stellung, Voll-Abgleich behält die 30-ms-Überblendung, Altlasten aus V6a.

**Kennzeichen:** **[A]** Annahme dieser Spec (der Builder baut genau das) · **[V]** sichtbare Neuerung, steht in §9 zur Freigabe und wird
**erst nach Xanders Antwort** gebaut · **[X]** Entscheidung von Xander · **[W]** Fakt aus der Web-Recherche (§10) · **[C]** Befund im Code.

**Regeln, die hier besonders gelten** (`typische-fehler.md`, CLAUDE.md):
- **27 / CLAUDE.md 3** Nur bauen, was hier steht. Die Namen auf Tasten kommen aus dem freigegebenen Vorschlag („Super-Regler“, „Ziel merken“,
  „bis zum nächsten Teil fahren“, „NEIGEN“); alles weitere Sichtbare ist [V], steht in §9 und wartet auf Xanders Antwort. Fragen ohne [V]
  dürfen mit ihrer Vorgabe gebaut werden.
- **28** Alte Projekte klingen gleich: Ohne `S.sr` und ohne `clip.st` läuft kein neuer Rechenweg; die Nachrichten an die Engines bleiben
  **byte-gleich**, Golden-Render der Snapshots in `synq-snapshots/` **bitgleich** (§7, I1-01, I1-80). `S.sr.v` ist das Versionsfeld für
  spätere Umrechnungen.
- **4 / 1 / 5** Trefferflächen ≥ 44 × 44 px, nichts abgeschnitten, kein Layout-Sprung (Höhe des Tastatur-Felds ± 0 px beim Umschalten),
  Fein-Modus beim Ziehen. **6 / 10** Vormachen und Fahrt enden auf jedem Weg sauber, der scharfe Modus ist immer sichtbar.
- **7 / 8 / 9** „geändert“-Punkt sofort, eine Geste = ein Undo, Speichern → Laden deep-equal (auch Kopieren/Einfügen/Duplizieren).
- **12 / 13 / 16 / 17** Kein Knacken, Stimmenübernahme ohne Sprung, keine Allokation pro Block im Worklet, NaN-/Denormal-Schutz.
- **20** Kein Supabase-Aufruf. Die Versionen vergibt der Dirigent; `max_app` (heute 4 030 000) muss Xander anheben, falls I1 über 4.30.0 geht.
- **24 (sinngemäß)** Kein Hersteller- oder Gerätename in der App (Oberfläche, Hilfe, Kommentare, Bezeichner, Testnamen). Vergleiche mit
  anderen Geräten stehen nur in dieser Spec. Wo die Oberfläche die MS-2000-Engine nennt (z. B. in „Was ändert sich?“), kommt der
  Name nur aus `MK_LABEL`.
- **29** Drei Zweige parallel (§8).
- **CLAUDE.md-Vorrang:** schnelle Seite, flüssige Bedienung, stabile Verbindung. Die Oberfläche (Regler-Feld, Vormachen, NEIGEN) liegt in
  einem Block, der **erst beim ersten Öffnen** geladen wird; das Worklet rechnet nur für Spuren, die wirklich einen Zustand oder Super-Regler-
  Werte haben, und auch dort nur, solange sich etwas bewegt (§5.3). **WebGL bringt hier nichts** (ein Balken, fünf Chips, ≤ 30 Bilder/s im
  DOM) – das sage ich gleich jetzt. Die Rechenlast wird am iPhone gemessen (I1-83).
- **K1-Antwort 2 [X]** (31.10. ~16:00): Qualität „Auto“ ändert nie den Klang → CPU-Begrenzer und Qualität ändern nie Zustände oder
  Super-Regler-Werte; unter Last wird nur der **Zeitpunkt** eines stufigen Wechsels zurückgestellt (§5.4), nie ein Wert.

---

#### 1. Ziel

Xander soll mit einem einzigen Daumen den Klang seines Songs verwandeln können, so wie es auf großen Bühnen-Synths ein großer Regler macht,
aber ohne dessen schwer verständliche Zuweisungs-Ebenen. Der Super-Regler hat bis zu vier Klangzustände auf seinem Weg; man richtet ihn ein,
indem man den Klang einfach vormacht. Er wirkt auf eine Spur oder auf alle Spuren, fährt auf Wunsch selbst und taktgenau bis zum nächsten
Song-Teil hoch und lässt sich über das Kippen des iPhones steuern, ohne dass ein zufälliges Wackeln etwas verstellt. Im selben Paket kommt der
seit v3 geplante weiche Szenenwechsel (Klangzustände je Clip, Morph bis zum Taktstrich), denn beide nutzen denselben Morph-Kern. Gehaltene
Töne springen nie, jede Bewegung ist in der Mod-Übersicht zu sehen, und gespeicherte Projekte klingen danach genau wie vorher.

#### 2. Umfang und Nicht-Umfang

**Umfang**
1. **I1a = V6a (Klangzustände je Clip + Worklet-Morph)**, wie in spec v3 §6.1–6.4, §6.7 und §17 „V6a“ beschrieben, mit den Anpassungen
   A1–A10 in §3.1. **Klang-Teil sofort**; die V6a-Oberfläche ([◆ Merken], Bearbeite-Zeile, ◆ in der Zelle, Liste im Clip-Blatt) **[V] erst
   nach F8**.
2. **I1b = V6a′ (nativer Morph, Spur-Werte, Drums)**, wie in spec v3 §6.4 „Nativ“ und §17 „V6a′“, mit den Anpassungen in §3.2.
3. **I1c Super-Regler-Kern:** Daten (§4), Schicht `effective(t)` um den Super-Regler erweitert, Worklet-Nachricht `sr`, gemeinsamer DOM-freier
   Kern `SRCore` (Kennlinien, Weg, Glättung), Stufen-Regel, Drums je Schlag, nativer Weg, Undo, Speichern/Laden, Vorwärtsschutz `S.need`.
4. **I1d Oberfläche und Vormachen [V] (erst nach F1, Regler-Anzeige nach F7):** Super-Regler-Feld im Tastatur-Bereich (Hoch- und Querformat,
   Fassungen nach Innenhöhe), Ziel-Chips, Vormachen-Leiste (im Feld bzw. im Editor-Kopf), Blatt „Was ändert sich?“, Zeilen in der
   Mod-Übersicht (K1), Regler-Anzeige.
5. **I1e [bis zum nächsten Teil fahren]:** taktgenaue Fahrt in Song und Matrix (Bedienung mit I1d nach F1); **im Song als Eintrag `song.sr`
   gemerkt, Streifen und Teil-Blatt-Zeile [V] erst nach F3**.
6. **I1f NEIGEN:** Bewegungs-Erlaubnis in iOS-Safari, Daumen-Kupplung mit Null-Lage beim Aufsetzen, Winkelrechnung ohne Kardan-Sprung,
   beide Ausrichtungen, Rückfälle ohne Sensor. Die Logik startet sofort (Zweig C), das NEIGEN-Feld kommt mit I1d.
7. **I1g Zusammenführen und Regel 28** (Golden-Render, Regression, iPhone-Tor, „Bitte prüfen“).
8. **I1h Anschluss neuer Engines:** Bit Mask (`synq-bm`, Nachtrag 7) versteht `{t:'morph', …}` und `{t:'sr', …}`; North (`synq-md`,
   Nachtrag 6) liest `srAt` je Schlag – sobald diese Engines auf der Hauptlinie sind.

**Nicht-Umfang**
- **V6b MORPH-Griff** (Schieber Grundklang ↔ ◆ im Editor-Kopf): entfällt, weil der Super-Regler mit einer Spur und einem Ziel genau das ist
  (Frage F6). **Teil-Klang** (`part.st`, V6b) bleibt im alten Plan und wird hier nicht gebaut.
- **[Hierhin fahren]** (Tipp auf ein Ziel fährt den Regler dorthin) – nicht im Vorschlag; nur als Frage F1 (e), Vorgabe: nicht bauen.
- Reglerbewegungen in Clips aufnehmen („Regler aufnehmen“, P1 aus spec v3 §7.5) – nicht besprochen.
- Globale Effekte (Hall-Raum, Echo-Bus, Master) gehören nicht zum Super-Regler; man nimmt die Sends der Spuren.
- Modus (mono/poly/legato), Stimmenzahl und Engine-Wechsel sind nie Teil eines Zustands oder Ziels (KZ3; grau „nur im Grundklang“).
- Gemalte Fahrt-Kurven (I3 Mal-LFO): hier nur das Feld `f` (Inhalt bestimmt I3 §3.3) und ein freier Platz für I3s Kurven-Chip (§6.2).
- MIDI-Export enthält keine Zustände und keinen Super-Regler (Hinweis im Export-Blatt wie spec v3 §6.7).
- Eine Sperre in App-Ständen **vor** I1 (lässt sich dort nicht nachrüsten, §4.5).

---

#### 3. Was aus V6a/V6a′ übernommen wird – und was sich seit v3 im Code geändert hat

##### 3.1 I1a = V6a mit Anpassungen

Es gilt **spec v3 §6.1–6.4, §6.7 (KZ1–KZ7) und das Paket V6a mit seiner Abnahme V6a-01 … V6a-16**, außer:

- **A1 Kein V7a gebaut.** `track.mix` gibt es nicht; Lautstärke, Pan, Hall-/Echo-Send, Drive und Chorus stecken weiter in `sound.fx`
  (`fxOfSound`, `trackFx`). Darum heißt das Zustandsfeld **`st.fx = {vol?, pan?, rev?, dly?, drive?, chorus?:{mix}}`** statt `st.mix`.
  Schlüssel sind die Pfade aus `PD` (4.23.0 Z. 16782–16792 [C]: `'fx.vol'`, `'fx.pan'`, `'fx.rev'`, `'fx.dly'`, `'fx.chorus.mix'` …), gelesen
  und geschrieben über `sndGet`/`sndSet` (Z. 27546 ff.). Die Tabelle `SYN_DESC` mit `'fx.reverb'`/`'fx.delay'` (Z. 16410 f.) wird **nicht**
  benutzt. STIMME-Spur (G4): `'gfx.rev'`, `'gfx.dly'` liegen in `tr.gfx`, nicht im Klang → eigener Lese-/Schreibweg und Vorrang (§5.5).
- **A2 Voll-Abgleich.** `syncEngine(i, true)` schickt heute `AU.synth[i].set(wkFlat(tr.sound), true, fp, wkMods(...), mk)` – den Grundklang
  **mit `force = true`** (4.23.0 Z. 17798–17809 [C]); das löst bei klingenden Stimmen die 30-ms-Stimmen-Überblendung aus (`setReq` →
  `structReq`, Z. 9345 ff.). **Das bleibt so** (Preset laden, Undo des Klangs, Engine-Wechsel, `restoreSoundSnapshot`). Neu: Hat die Spur
  einen laufenden Zustand oder Super-Regler-Werte, tragen **`morph`** (Restzeit) und **`sr`** (Tabelle + Stellung bzw. Fahrt) in **derselben**
  Nachricht mit; das Worklet übernimmt **zuerst** `sr`/`morph` und **dann** `set` → die Überblendung läuft von den alten zu den neuen
  **Endwerten**, nie über den nackten Grundklang. Abgleiche **ohne** Änderung des Grundklangs (Ziel gemerkt/gelöscht, Stellung, Ende des
  Vormachens) schicken **keinen** Voll-Abgleich, sondern nur `{sr}` bzw. `{set (ohne force), sr}` (§6.3). Die XF-Prüfung in `setReq`
  (`XF_KEYS`) vergleicht bei Super-Regler-Schlüsseln den neuen **Endwert** mit dem alten Endwert, nicht den Basiswert. **Ohne** Zustand und
  Super-Regler bleibt jede Nachricht wie heute (byte-gleich, Regel 28, I1-01). Die Zeilenangabe „WP6 Z. 7705“ aus spec v3 §6.4 ist veraltet.
- **A3 MS 2000 (eng 3).** Schlüssel `'mk.' + Pfad` (z. B. `'mk.t.0.f.cut'`, gleiche Schreibweise wie I2 §3), Bereich aus `SQMK.mkRange(path)`
  (Z. 13157), lesen/schreiben über `SQMK.mkPathGet`/`mkPathSet`. Stetige Werte rechnet `MkCore` je Block über dieselben Setter wie `mkSet`
  (die vorhandene 5-ms-Glättung `MK_SM` bleibt). Stufige Werte (Welle, Filtertyp, Spielweise eines Timbres) können nicht je Stimme gehalten
  werden → Überblend-Klasse (§5.4 Punkt 3); **`mk.mode`** (Single/Split/Dual/Vocoder) ist „nur im Grundklang“. Räder (`mw`, Bend) sind
  Live-Werte und nie Teil eines Zustands.
- **A4 FM.** Pfade wie I2 §3: **DX** `'fm6.ops.<0–5>.ol'`, `.fine`, `.det`, dazu `'fmBright'` (Kennlinie `bipow`, k 0,5, Z. 16769 [C]) und
  `'fmBite'`; **FELD** `'fmx.ops.<0–5>.ol'`, `.fine`, **`.fbAmt`** (Rückkopplung je Operator, 0–7, Z. 12290 [C]; ein Feld `fmx.fb` gibt es
  nicht), `'fmx.edge.<von>-<nach>.amt'`. Pegel 0–99 als Kommazahl im Worklet. Stufig (Überblend-Klasse): Algorithmus, Verbindungen, Wellen,
  `coarse`, `fixed`, `fm6.fb`. Stufige FM-Werte gehen über `structReq`/`structXf` (30 ms, gleichleistungsgemäß), **nie** über die 4-ms-Blende
  (`xfLite`), auch nicht unter Last (§5.4). N6a-01 aus Nachtrag 1 gilt: FM je Operator morpht stetig.
- **A5 WT** läuft heute nur nativ (`isWkEngine` = analog, fm6, mk) → WT gehört ganz zu I1b („wirkt nativ ab der nächsten Note“).
- **A6 P-Locks.** V5 ist nicht gebaut; an seine Stelle tritt **I2** (Fassung 2). I2 definiert `Lock_k = Noten-Lock_k ?? Reihenwert_k(t)`
  (I2 L1), die gemeinsame Je-Stimme-Tabelle **`v.pv`/`v.pvR`** mit der Platz-Liste **`pv-layout.json`** und der Weiche `v.stOn` (I2 §5.2 –
  diese Definition gilt für beide) und die Nebenkerne `kc[1..8]` (I2 §5.9). Die **vollständige Endwert-Formel steht nur hier** (§5.1).
- **A7 Mod-Übersicht (K1).** Jeder Schlüssel eines Klangzustands bekommt in `k1Mods(i)` eine Zeile (§6.5); sonst würde ein Regler, der sich
  beim Szenenwechsel bewegt, gegen K1-03 („was sich bewegt, hat eine Zeile“) verstoßen. [A]
- **A8 Versionen** aus spec v3 (4.19.0 usw.) sind überholt; die Version vergibt der Dirigent.
- **A9 V6a-Oberfläche in den heutigen Editoren [V] (F8).** Spec v3 plante ein 24-px-Band – zu klein für Tasten (Regel 4) und nicht gegen die
  heutigen Editoren geprüft. Neu, gleich für VA, FM (DX und FELD), WT und die MS-2000-Platte, weil alle `sheetFrame` (Z. 27442) nutzen:
  **[◆ Merken]** (≥ 44 × 44) in der Kopfzeile `r1` rechts vor ↶ ↷; der Bearbeite-Hinweis steht in der vorhandenen **LCD-Zeile** des Editors
  (amber): „Bearbeite: ◆ Szene 2 · 3 Werte anders“; die Taste **[Grundklang]** (≥ 44 × 44) ersetzt dann [◆ Merken]. Keine zusätzliche
  Höhe → kein Layout-Sprung; **die MS-2000-Platte selbst bleibt unverändert** (Xander: „wie am Gerät“). ◆ in der Clip-Zelle (10 px, rechts
  oben) und die Liste im Clip-Blatt wie spec v3 §6.2. Regler fahren beim Szenenwechsel sichtbar mit (spec v3 §6.4, gehört zu F8).
  Drehen wirkt wie V6a-02: Bearbeite-Ziel ◆ → `clip.st`, sonst `track.sound`.
- **A10 Altlasten.** Undo-Art für alles in `clip.st` (◆ Merken, Bearbeiten, ✕ in der Mod-Übersicht) ist **`'clip'`** (ersetzt „`sound` mit
  Ziel `clip.st`“ aus spec v3 §6.7; `clip.st` ist Clip-Datenteil wie I2s `clip.kl`). V6a′-06 prüft **FX1–FX10, Smoke und DoD** (es gibt
  keine V7a-Tests). Pfade im Zustand haben dieselbe Schreibweise wie I2 §3 (`'fmx.edge.4-1.amt'` statt `'fmx.edges.4.amt'` aus spec v3 §6.7).

##### 3.2 I1b = V6a′ mit Anpassungen

Es gilt **spec v3 §6.4 „Nativ“ und das Paket V6a′ mit V6a′-01 … V6a′-06** (A10), außer: Spur-Werte kommen aus `st.fx` (A1) und gehen über
`applyChainFx(N, fx, immediate)` (4.23.0 Z. 17640) – das setzt Lautstärke, Pan und Sends heute mit `setTargetAtTime(v, now, .015)`;
während eines nativen Morphs bekommt es den Wert aus `effective(t)` in Stufen alle 16 ms, nie eine Kurven-Automation. Native LFO-Raten
und -Formen werden nicht gefahren (der Neubau in `syncLfoSet` wäre zu teuer): Hinweis „nur mit Worklet“ wie in der Mod-Übersicht.

---

#### 4. Datenmodell (Format bleibt 5, nur zusätzliche Felder)

##### 4.1 Projekt: `S.sr` (fehlt = kein Super-Regler)

```js
S.sr = {
  v: 1,                    // Versionsfeld (Regel 28)
  x: 0.4213,               // Hand-Stellung 0…1, 4 Stellen; so öffnet das Projekt. Ändert sich nur durch die Hand (§5.6)
  sc: 'all' | 'track',     // Vorgabe fürs Vormachen (Wahl „Wirkt auf“ in der Vormachen-Leiste)
  t: '<Spur-uid>',         // nur bei sc 'track'
  f?: <Form>,              // Kurve der nächsten Fahrt; Inhalt bestimmt I3 §3.3 (Objekt), I1 schreibt es nie
  z: [                     // die Ziele ②③④, nach p sortiert, höchstens 3 (① Ausgang liegt immer bei 0 und wird nicht gespeichert)
    { p: 0.6667,           // Ort auf dem Weg: 0,10 … 1,00; Abstand ≥ 0,10 zu 0 und zum Nachbarn
      u: {                 // je Spur (uid) nur die Schlüssel, die dieses Ziel festlegt (§6.3 Punkt 6)
        '<uid>': {
          c: {'cutoff': 0.2140, 'fx.rev': 0.1500, 'mk.t.0.f.cut': 0.0950, 'fmx.ops.2.ol': -0.0800},  // stetig: Δ im Reglerraum, −1…+1
          d: {'o1w': 1, 'ftype': 2},                                                                // stufig: Wert
          s: {'KICK': {'tDec': 0.1200}}                                                            // nur Drum-Spur: Δ je Slot
        } } } ] }
```

- **Reglerraum** = die Stellung 0…1 des Reglers, den man dreht, mit genau dessen Kennlinie. Abbildung Pfad → Beschreibung `srDesc(k)`:
  flache Schlüssel und `fx.*` → `PD[k]` mit `toNorm`/`fromNorm` (Z. 16417/16428 [C]); Kennlinien dort: `lin` (auch `c: 'bip'` und fehlendes
  `c` laufen linear), `exp`, `db`, `hdec`, `pow` (mit `k`), `bipow` (mit `k`, symmetrisch um 0, z. B. `fmBright`), `vals` (stufig).
  MS 2000 linear über `SQMK.mkRange`; FM-Pegel linear 0–99, `fbAmt` linear 0–7; `gfx.rev`/`gfx.dly` linear 0–1 (`G4_R`, `stage-ges`
  Z. 42620); Drum-Slots über die Makro-Abbildung, sonst linear in Engine-Einheiten. Cutoff fährt so in Oktaven, Pegel in dB. Sobald I2a
  `LKT` liefert, liest `srDesc` dort (`lo`, `hi`, `c`, `k`) – `LKT.c` muss dafür `bipow` (mit `k`) und `hdec` kennen (Abstimmung §7).
- **Lesen/Schreiben** über `srGet(tr, k)`/`srSet(tr, k, v)`: `'gfx.'` → `tr.gfx`; `'mk.'` → `SQMK.mkPathGet/Set` auf `p.mk`; `'fm6.ops.'`,
  `'fmx.ops.'`, `'fmx.edge.'` → in `p.fm6`/`p.fmx`; sonst `sndGet`/`sndSet` (die nur flache, `wt.`, `fm2.` und `fx.`-Schlüssel kennen).
- Ein Ziel speichert **Abstände zur Basis** (relativ). So wirkt der Super-Regler auch dann sinnvoll, wenn eine Szene einen anderen
  Klangzustand hat (er legt sich darauf), und bei Stellung 0 ist er garantiert unhörbar. Stufige Werte sind absolut.
- Grenzen: ≤ 64 Einträge je Spur (Summe über alle Ziele), ≤ 256 im Projekt; Werte auf 4 Stellen gerundet. Ein Pfad, den der Klang nicht
  (mehr) hat, bleibt gespeichert und wird ignoriert (wie spec v3 §6.7; in „Was ändert sich?“ grau).
- Schlüssel nach Spur-**uid**, nicht nach Index (Spuren lassen sich umsortieren). **Verschwindet eine Spur** (z. B. STIMME-Spur entfernt),
  entfernt **dieselbe Aktion** ihre Einträge aus `S.sr` (Undo-Gruppe mit `'sr'`; ↶ stellt beides her). Im Speicher gibt es darum nie
  Einträge unbekannter uids, und Speichern → Laden ist deep-equal. `srNorm` verwirft beim Laden trotzdem unbekannte uids (Schutz für
  beschädigte Dateien). Eine **duplizierte** Spur bekommt keine Einträge (die Ziele gehören zur Original-Spur) [A].
- `srNorm(obj.sr, p.tracks)` in `normalizeProject` (4.23.0 Z. 17065) klemmt die bekannten Felder; **unbekannte Felder** von `S.sr` und von
  jedem Ziel bleiben unverändert erhalten (tiefe Kopie, nur JSON-Werte, ≤ 4 KB je Objekt, sonst verworfen), damit spätere Versionen nichts
  verlieren. `f`: vor I3 unverändert behalten (gleiche Regel), mit I3 über `formNorm` (I3 §3.3). Ein Projekt ohne `sr` schreibt **kein**
  Feld `sr`.

##### 4.2 Song: `song.sr` (fehlt = keine Fahrten) [V: F3]

```js
song.sr = [{a: 18, b: 32, x0: 0.3333, x1: 0.6667, f?: <Form, I3>}]   // Song-Schläge a < b (wie song.xp), sortiert, ohne Überlappung
```
- Einheit: **Song-Schläge, dieselbe Einheit wie `song.xp` und die Marken**. Kommt T1 (Taktarten, Xander 31.10. ~17:35 [X]), rechnet T1
  `song.sr` mit denselben Regeln um wie `song.xp`.
- `a` = Beginn auf einem ganzen Schlag. `b` = Anfang des nächsten Teils; **Ausnahme:** Restzeit < 1 Schlag → `b = a + 1` (die Fahrt reicht
  höchstens 1 Schlag in den nächsten Teil, §5.6). `x0` = Stellung beim Start (nur Anzeige, und Song-Start-Stellung vor dem ersten
  Eintrag, §5.6), `x1` = Ziel-Stellung.
- `normSong` (4.23.0 Z. 17219) bekommt `srSongNorm(o.sr, bars)` (gleiche Regel für unbekannte Felder und `f` wie §4.1); Song-Werkzeuge
  bekommen Haken neben denen von VV2 (`n5-br-V`): `songShift` (Z. 22829) → `srShift(song, n, d)`, `songClear` (Z. 22839) → `srClear(song,
  a, b)` (überlappende Fahrten werden gekürzt, innere fallen weg), `songTidy` (Z. 22910) → `srTidy` (sortiert, entfernt Überlappungen,
  lässt `b = a + 1` über einen Teilanfang zu), der Song-Ausschnitt (`vvDirCutTo`, Z. 23162) → `srCutTo`, `songWrite` (Z. 22890) → `srWrite`.
  Undo über die vorhandene Art `'song'`.
- `f` ist I3s Form (Objekt, I3 §3.3); I1 schreibt es nie und spielt Einträge mit `f` als Gerade, bis I3 da ist.

##### 4.3 Clip: `clip.st` (V6a, spec v3 §6.7, mit A1)

```js
clip.st = {eng, p: {key: value}, fx: {vol?, pan?, rev?, dly?, drive?, chorus?}, slots?: {[slotId]: {key: value}}, x: 'flow'|'bar1'|'bar2'|'jump'}
```
`normClip` (Z. 17006) und `cleanClip` (Z. 17352) übernehmen `st`; Kopieren/Einfügen, Szene duplizieren und eigene Song-Clips (`ownNorm`)
tragen es mit; neue Clips (FANG, Aufnahme) haben keins. Undo-Art `'clip'` (A10).

##### 4.4 Laufzeit (nicht gespeichert)

`R.st[t] = {from, to, t0, t1, hand:Set}` (V6a) · `R.sr = {x, xs (Modell der geglätteten Stellung, Anzeige), drive: {t0, t1, x0, x1,
src:'song'|'live'} | null, hand: 'bar'|'neigen'|null, cap: {p, sc, t, base: {uid: Werte}, copy: {uid: Werte}, x0} | null}`. Die
Song-Wiedergabe und Fahrten ändern nur `R.sr.x`; `S.sr.x` ändert sich nur durch die Hand (§5.6). `vvSwapIn` sichert und setzt `R.sr` wie die
anderen Laufzeit-Objekte (§5.6).

##### 4.5 Ältere Versionen und Vorwärtsschutz [A]

- **App-Stände vor I1** kennen `S.sr`, `clip.st` und `song.sr` nicht. Sie öffnen ein solches Projekt **ohne** Sperre – der Wächter VO-R1
  sperrt nur bei Format > 5 oder fremder Engine (`nvLockOf`, 4.23.0 Z. 34063 [C]) –, spielen es ohne Zustände und Super-Regler und würden
  die Felder beim Speichern verwerfen. In diesen alten Ständen lässt sich das nicht nachrüsten. Abhilfe: Die Pages-Seite liefert immer den
  neuesten Stand; der Dirigent nutzt Vorgänger-Snapshots nur zum Vergleichen, nie zum Bearbeiten eines neuen Projekts (Changelog-Hinweis).
- **Ab I1 (neu):** `S.need` = sortierte Liste der Merkmale, die das Projekt zum richtigen Klingen braucht – `'sr'` (wenn `S.sr` oder
  `song.sr` da ist), `'st'` (wenn ein `clip.st` da ist). Beim Speichern aus den Daten berechnet; leer = Feld fehlt (JSON zeichengleich).
  `normalizeProject` vergleicht mit `KNOWN_NEED`; ein **unbekannter** Eintrag kommt in `_newer` (`n: [...]`), und `nvLockOf` sperrt dann wie
  VO-R1 mit dem vorhandenen Hinweisband („Aus einer neueren SYNQUENZER-Version …“; nichts wird überschrieben). Spätere Pakete tragen ihre
  Merkmale ein (I2 z. B. `'lk'`, I3 `'lf'`, T1 …) – so öffnen alle Stände ab I1 ein neueres Projekt gesperrt statt still verlustbehaftet.
  Abstimmung: I2 §4 verlässt sich auf VO-R1; für reine Zusatzfelder greift VO-R1 nicht, I2 nutzt `S.need` (§7).

---

#### 5. Klang, DSP und Zeit

##### 5.1 Endwert-Regel (ersetzt KZ4 aus spec v3; gilt auch für I2, I2 L1)

```
Lock_k   = Noten-Lock_k ?? Reihenwert_k(t)                       // von I2 (L1), im Reglerraum 0…1; ohne I2: kein Lock
stetig:  n_k      = Lock_k ?? toNorm_k( Zustand_k(t) ?? Grund_k )
         Endwert_k = SR_k(x) === 0 ? (Lock_k in Engine-Einheiten ?? Zustand_k(t) ?? Grund_k)        // kein Umweg, bitgleich
                                   : fromNorm_k( clamp( n_k + SR_k(x), 0, 1 ) )
         danach relative Drum-Locks (tune/dec, DrumSeq.lockParams Z. 12086) wie bisher, danach + Σ Modulation_k (LFO u. a. wirken weiter)
stufig:  Wert_k    = Lock_k ?? SRstufe_k(x) ?? Zustand_k ?? Grund_k        (je Stimme beim Anschlag festgehalten, §5.4)
```
- `Zustand_k(t)` ist der fahrende Klangzustand (V6a-Morph, S-Kurve). `SR_k(x)` ist die Super-Regler-Verschiebung im Reglerraum (§5.3).
- **Δ = 0 ⇒ kein Umweg über `toNorm`/`fromNorm`**: Ist `SR_k(x)` genau 0 (Stellung 0 oder Schlüssel ohne Eintrag), wird der Basiswert
  unverändert durchgereicht. Nur so bleibt ein Projekt mit Super-Regler auf 0 **bitgleich** zu einem ohne.
- **Locks (I2):** Der Klangzustand wirkt **nicht** auf gelockte Schritte (Lock schlägt Zustand). Der Super-Regler **verschiebt** gelockte
  Schritte im Reglerraum (der Lock- bzw. Reihenwert ist seine Basis; das gelockte Muster wandert mit) – das ist die **Vorgabe der Frage F3
  in I2** (nur dort gefragt). Wird sie mit „fest“ beantwortet, gilt stattdessen `Endwert_k = fromNorm_k(Lock_k)` für gelockte Schritte (SR
  wirkt dort nicht); geändert werden dann nur diese Zeile und I2-09 (b) bzw. I1-24 (a). Stufig gewinnt immer der Lock.
- **Nebenkerne (I2 §5.9):** `sr` geht an **alle** Kerne der Spur (Hauptkern und Fächer `kc[1..8]`), `morph`/`morphStop` **nur** an den
  Hauptkern (I2 §5.9.3). Ein Klang-Lock ist ein Lock auf alle Schlüssel seines Klangs: Im Fach ist die Basis der Klang-Lock-Wert, der
  Zustand wirkt nicht, die stetige SR-Verschiebung wirkt auf Schlüssel, die es in der Engine des Fachs gibt (die Tabelle wird beim Empfang
  einmal je Fach nach Engine-Familie gefiltert), stufige SR-Werte wirken im Fach nicht.
- **Kosten der Locks:** Nur Stimmen, die einen Lock auf einem SR-Schlüssel der Klasse `b` tragen, rechnen je Steuer-Block
  `fromNorm(toNorm(pv) + SR)`; höchstens 8 Locks je Note (I2 L4). Klasse `n` (z. B. Hüllkurven-Zeiten) einmal beim Anschlag.

##### 5.2 Worklet-Nachrichten (AnalogCore `onMsg`, 4.23.0 Z. 9297)

```js
{morph: {id, t0, t1, curve: 's', to: {k: v}, disc: {k: v}, at}}         // V6a (spec v3 §6.4), unverändert
{morphStop: {keys: [...]}}                                               // KZ6
{sr: {tab: [{k, law, lo, hi, kk?, n: [p…], d: [Δ…]}],                   // stetige Schlüssel dieser Spur (nur Ziele, die k festlegen)
      disc: [{k, n: [p…], v: [w…], xf: 0|1}],                            // stufige Schlüssel: Wert je Ziel; xf 1 = Überblend-Klasse (§5.4)
      x, at?}}                                                           // Stellung (Hand/NEIGEN) – oder statt x eine Fahrt:
{sr: {ramp: {x0, x1, t0, t1, k?}}}                                       // linear in der Stellung, Zeiten in Audiosekunden; k = I3-Kurve
{sr: null}                                                               // Super-Regler dieser Spur aus (Vormachen, Engine-Wechsel)
```
- **Kennlinie `law`** genau wie `toNorm`/`fromNorm`: `'lin' | 'exp' | 'db' | 'hdec' | 'pow' | 'bipow'`; `kk` = Exponent `k` bei `pow`/`bipow`;
  `lo`/`hi` = `min`/`max` der Beschreibung (bei `bipow` zählt `hi` als `max`); `'bip'` und fehlendes `c` werden als `'lin'` geschickt. Die
  Kennlinien-Funktionen stehen **einmal** im DOM-freien Kern **`SRCore`** (Kennlinien, Weg, Glättung, Fahrt), dessen Quelltext in Haupt-Faden,
  `dirigent-analog` und (I1h) `synq-bm` eingesetzt wird – keine zweite Fassung (I1-27 gleicht Haupt-Faden und Worklet ab).
- **Einheiten:** Werte im Worklet sind die Einheiten der Klangdaten (`wkFlat` reicht `snd.p` unverändert durch, Z. 17781 [C]; MS 2000 in
  Geräte-Einheiten von `p.mk`; FM in Operator-Daten). `limited()` überschreibt einzelne Werte unter Last; ein solcher Schlüssel bleibt
  Basis wie gesendet (der Begrenzer ändert nie SR-Werte).
- Die Tabelle kommt nur bei Änderung (Ziel gemerkt/gelöscht, Voll-Abgleich, Engine geladen); laufend nur `x` (höchstens 60/s,
  zusammengefasst je Bild wie `wkSet`/`wkFlush`, Z. 18149, mit `setTimeout(…, 40)` als Rückfall).
- Im Worklet: `B[k]` = Basis (Grund bzw. fahrender Zustand), `P[k]` = Endwert. `set`-Nachrichten für SR-Schlüssel schreiben `B[k]`; die
  Stimmen lesen weiter `P`. Enthält eine Nachricht `sr` **und** `set`, wird `sr` zuerst übernommen (A2). Ohne Tabelle (`srOn = false`) läuft
  **kein** zusätzlicher Code.
- **Bit Mask (I1h)** nutzt die Nachrichtenform von Nachtrag 7 (Z. 330): `{t:'sr', tab, disc, x}`, `{t:'sr', ramp}`, `{t:'sr', off: 1}`,
  `{t:'morph', …}`, `{t:'morphStop', keys}` – Inhalt wie oben. **North** bekommt keine `sr`-Nachricht: jeder Schlag liest `srAt(t)` im
  Haupt-Faden (wie Drums, §5.5).

##### 5.3 Rechnen je Block

- **Weg:** Für jeden Schlüssel `k` einer Spur gilt die Menge `Z_k` = { ① bei 0 mit Δ = 0 } ∪ { Ziele, die `k` festlegen }. `SR_k(x)` ist
  stückweise linear zwischen den Punkten von `Z_k`, nach dem letzten gleich bleibend. **Ein Ziel, das `k` nicht festlegt, wird für `k`
  übersprungen** (der Weg läuft gerade zwischen seinen Nachbarn hindurch). Stufig: Wert des nächstgelegenen Punkts von `Z_k`, Wechsel an der
  Mitte zwischen zwei aufeinanderfolgenden Punkten (Hysterese ± 0,02); bei ① gilt kein SR-Wert (Basis).
- **Stellung:** einpolige Glättung `xs += (x − xs)·α`, `α = 1 − e^(−128/(0,020·SR))` je Render-Quantum (τ = **20 ms**). Ein Sprung 0 → 1 ergibt
  höchstens **12,5 %** des Weges im ersten Block (48 kHz). **Einrasten:** `|x − xs| < 1e-6` → `xs = x` (genau).
- **Fahrten** (`ramp`) werden exakt gerechnet: `x(t) = x0 + (x1 − x0)·(t − t0)/(t1 − t0)` (mit `k`: I3 §4.6), ab `t1` **genau** `x1`. War
  `xs` beim Start noch nicht eingerastet, baut sich der Rest mit τ 20 ms ab: `xs = x(t) + e`, `e = (xs(t0) − x0)·e^(−(t−t0)/τ)`, eingerastet,
  sobald `|e| < 1e-6` (danach folgt `xs` der Fahrt exakt, ohne Nachlauf).
- **Leerlauf:** Gilt `xs === x`, läuft keine Fahrt und hat sich weder die Tabelle noch ein `B[k]` geändert, bleibt `P` unverändert und die
  Rechnung je Block entfällt (ein Vergleich). `B[k]` neu (Regler gedreht, Zustand fährt) → nur dieser Schlüssel wird neu gerechnet.
- **Heiße Schlüssel** (Cutoff, Res, Drive, Hüllk.-Menge, Osz-Anteile, PW, Rauschen, Fein, Pan, FM-Operator-Pegel, MS-2000-Cutoff/Res/EG-Int,
  Spur-Lautstärke/-Sends) laufen innerhalb des 128er-Blocks über die 8 Steuerblöcke zu je 16 Samples (`CR = 16`) linear – nur eine
  Addition je Steuerblock; der Filter interpoliert darin ohnehin `gA → gB`. **Übrige stetige Schlüssel** (Hüllkurven-Zeiten, LFO-Raten,
  Unison-Verstimmung/-Mix/-Breite, Glide) einmal je 128er-Block mit **teilweisem** `derive()` (nur die betroffene Gruppe, z. B. `envCoefs`
  der einen Hüllkurve). Gruppen werden beim Empfang der Tabelle einmal bestimmt (keine Allokation je Block).
- **Schutz:** Endwerte, `xs` und `e` werden auf Endlichkeit geprüft; Werte mit `|v| < 1e-30` werden zu 0 (kein subnormaler Wert, Regel 17).
- **Grenzen:** ≤ 64 Einträge je Spur; Ziel CPU ≤ Ruhe + 1 % je Spur in Bewegung, ≤ + 3 % für 6 Spuren × 32 Schlüssel (M-CPU, I1-20), am
  iPhone I1-83. CPU-Begrenzer und Qualität „Auto“ ändern nie Zustände oder Super-Regler-Werte (I-08; K1-Antwort 2).

##### 5.4 Gehaltene Töne springen nie

1. **Stetige Werte** ändern sich auf klingenden Tönen nur über die Glättung bzw. die Fahrt (§5.3): kein Sprung, M-KLICK besteht (I1-13, I1-15).
2. **Stufige Werte, die eine Stimme halten kann** (VA: Welle, Fußlage, HT, Unison-Zahl, Filtertyp, Sync, Sub-Form/-Lage): Beim Anschlag
   schreibt die Stimme den Wert in ihre Je-Stimme-Tabelle **`v.pv`** (I2 §5.2, Schreib-Reihenfolge (1) I1, (2) I2-Locks; Weiche `v.stOn`).
   **Klingende Töne behalten ihren Wert bis zum Loslassen** (KZ3, SSS-Prinzip). Spurweite LFO-Werte (Form, Sync) wechseln am nächsten
   Phasen-Nulldurchgang.
3. **Überblend-Klasse** – stufige Werte, die die Stimmen eines Kerns teilen (FM-Struktur, MS-2000-Timbre-Werte, Bit-Mask-Programm-Ebene;
   `xf: 1` in §5.2): echte **30-ms-Stimmen-Überblendung** (`structReq`/`structXf`, V4a) – kein Loch, kein Neustart. Klang-Locks (I2) spielen
   in eigenen Fächern; eine Überblendung des Hauptkerns berührt sie nicht (I2 §5.9.1).
   - **Höchstens ein Wechsel je Spur und 100 ms:** Überquert die Stellung die Mitte öfter (NEIGEN-Wackeln, Hand), gilt am Ende des Fensters der
     zuletzt erreichte Wert; ein Hin-und-Zurück im selben Fenster löst keine Überblendung aus.
   - **Ab Begrenzer-Stufe 2** (dort nutzt der Code heute die 4-ms-Blende `xfLite`, Z. 9359 [C], und eine Überblendung verdoppelt kurz alle
     Stimmen): Ein Wechsel dieser Klasse wird **zurückgestellt**, bis (a) keine Stimme des Kerns mehr klingt – dann ohne Blende – oder
     (b) die Stufe unter 2 fällt – dann mit 30-ms-Blende. Nie die 4-ms-Blende, nie ein harter Wechsel. Neue Töne spielen bis dahin den
     bisherigen Wert. Zähler `srDefer` in `__srProbe` und `perfProbe`.
4. **Sprünge der Stellung** (Doppeltipp auf ①, Undo, Song-Start im laufenden Ton, Schleifen-Rücksprung) laufen über die 20-ms-Glättung.
5. Beim Merken eines Ziels und beim Abbrechen des Vormachens ändert sich der gehörte Klang nicht hörbar (§6.3).

##### 5.5 Nativer Weg, Spur-Werte, Drums (I1b/I1c)

- Nativ (WT, ECO-Rückfall, `?engine=native`): Stufen alle **16 ms** mit `setTargetAtTime` (τ 8–10 ms), vorher `cancelScheduledValues(now)` +
  `setValueAtTime(aktuell)`, jeder Aufruf in `try/catch`, nie `setValueCurveAtTime` (spec v3 §6.4). Nur für Spuren mit laufender Bewegung.
- Spur-Werte (`fx.*`, `gfx.*`) immer nativ über `applyChainFx` (auch bei Worklet-Spuren). Drive höchstens 8 Stufen ≥ 40 ms (A/B-Shaper).
- **STIMME-Spur, Vorrang (G4):** `g4Fx` (`stage-ges` Z. 42635 [C]) ersetzt `fx.rev`/`fx.dly` durch `tr.gfx.rev`/`.dly`, solange `gfx.on` und
  kein G4-A/B läuft. Die wirksamen Spur-Werte sind darum `srFx(tr, g4Fx(tr, fxOfSound(tr.sound)))`: Bei `gfx.on` wirken SR-Einträge
  `'gfx.rev'`/`'gfx.dly'` auf Hall/Echo; Einträge `'fx.rev'`/`'fx.dly'` dieser Spur wirken dann nicht (in „Was ändert sich?“ grau „wirkt
  nicht, solange die Gesang-Effekte an sind“), bei `gfx` aus umgekehrt. Das Vormachen schreibt Hall/Echo der STIMME-Spur als `'gfx.*'`, wenn
  `gfx.on`, sonst als `'fx.*'`. `tr.gfx` selbst ändert sich durch den Super-Regler nie (Undo-Art `'gfx'` unberührt).
- **Drums:** `drumHit(gm, vel, t, src, ex, o)` (Z. 18722) liest den Slot-Wert zum Schlagzeitpunkt: `stAt(t)` (V6a′) und neu `srAt(t)`
  (Stellung zum Schlagzeitpunkt aus Fahrt bzw. Hand-Modell, gleiche Formeln wie `SRCore`). Jeder Schlag baut seine Stimme neu – Kosten 0.

##### 5.6 Zeit und Takt

- **Fahrt-Beginn:** beim Tipp auf den nächsten **Schlag** (Zählzeit des Song-Tempos, `b2t`, Z. 18820; mit T1 die Zählzeit der dann gültigen
  Taktart). **Ende:** genau am ersten Schlag des nächsten Teils. Ist die Restzeit < 1 Schlag, dauert die Fahrt 1 Schlag (wie KZ1; im Song
  `b = a + 1`, §4.2). Kurve: **linear in der Stellung** [A] (ein Aufbau soll gleichmäßig steigen; der V6a-Szenenwechsel behält seine S-Kurve;
  I3 kann eine Kurve liefern).
- **Eine Regel für den Start, live wie offline:** Jede Fahrt beginnt bei der **aktuellen** Stellung (`R.sr.x` zum Startzeitpunkt) und endet
  bei `x1`. `x0` eines gespeicherten Eintrags ist nur Anzeige – und die Stellung vor dem ersten Eintrag beim Song-Start. Ohne Hand ergibt
  sich daraus eine feste Kette: Eintrag 1 startet bei seinem `x0`, jeder weitere beim `x1` des vorigen. `srSongX(b)` = Stellung dieser Kette
  am Song-Schlag `b` (vor dem ersten Eintrag `x0₁`, in Eintrag i linear von seinem Kettenstart bis `x1ᵢ`, danach `x1ᵢ`).
- **Genauigkeit:** Ende ±128 Samples (ein Render-Quantum) gegen `b2t(Teilanfang)·SR`, im Offline-Render genauso (I1-50).
- **Song-Wiedergabe:** `songTickInner(b0, b1)` (Z. 19582) schickt für Einträge mit Beginn in `[b0, b1)` die `ramp`-Nachricht mit den
  Audiozeiten an alle Spuren mit Super-Regler-Werten (nativ: Stufenplan). **Song-Start** an Schlag b: `R.sr.x = srSongX(b)` (sofort, es klingt
  noch nichts). **Schleife:** am Rücksprung `srSongX(Schleifenanfang)` über die 20-ms-Glättung. Song ohne `song.sr`: die aktuelle Stellung gilt.
- **Wiedergabe ist Laufzeit:** Song-Start, Fahrten und Schleifen ändern nur `R.sr.x`. **`S.sr.x` und der „geändert“-Punkt ändern sich nur durch
  die Hand** (Balken, NEIGEN, Doppeltipp, Undo/Redo, Ende einer Matrix-Fahrt, §6.6). Nach ■ bleibt die Stellung stehen (kein Sprung).
- **Matrix:** Ziel-Zeitpunkt = der nächste wartende Wechsel (`R.partPend.beat` aus `launchPart`, Z. 22483, sonst das kleinste
  `R.pend[i].beat` > jetzt). Nichts wird im Song gespeichert.
- **Offline-Render** (VV1-Weg `vvRenderAudio`/`vvSwapIn`, `n5-br-V` Z. 42037/41982 [C], Video): keine Hand. `vvSwapIn` sichert `R.sr` und setzt
  `x = srSongX(Startschlag)`, `drive = null`, `hand = null`, `cap = null`, ruft `syncEngines()` (Tabelle und Stellung an jede Engine);
  `tick()` plant die Fahrten wie live; danach wird `R.sr` zurückgesetzt. **Zwei Offline-Renders sind bitgleich** (I1-21).
- **„Song als Audio“** (`SREC`, 4.23.0 Z. 36279 [C]) ist **kein** Offline-Render: Der Song läuft einmal in Echtzeit, aufgenommen wird der
  Master (MediaStreamDestination + MediaRecorder, verlustbehaftet). Fahrten aus `song.sr` laufen wie bei der Wiedergabe. **Balken und NEIGEN
  bleiben bedienbar und werden mit aufgenommen** [A] (es ist eine Echtzeit-Aufnahme: aufgenommen wird, was man hört; kein Zusatzbau, „Bitte
  prüfen“). Darum gibt es dort keine Bitgleichheit; ohne Hand: Korrelation ≥ 0,99 gegen den Offline-Render (I1-57).

---

#### 6. Bedienung

##### 6.1 Wo der Super-Regler wohnt [V] (Frage F1)

- **Menü ≡ → „Super-Regler“** schaltet das **Tastatur-Feld** (`#kbArea`) auf das Super-Regler-Feld; **[⌨]** im Feld schaltet zurück.
  Gleicher Rahmen, gleiche Rasterhöhe (Hochformat `clamp(170px, 30dvh, 260px)`, mit offenem Editor 170 px; Querformat
  `clamp(110px, 34dvh, 150px)`, mit offenem Editor 110 px; Querformat ab 561 px Höhe 190 px; 4.23.0 Z. 63–85 [C]) → **kein Layout-Sprung**.
- **Gerät-Einstellung** `uiPrefs().kbFeld = 'kb' | 'sr'` merkt nur das **zuletzt gewählte** Feld (nicht das Projekt); beim App-Start gilt sie.
- **Zusammenspiel mit I4 (Tippfläche):** Tippfläche und Super-Regler-Feld belegen beide `#kbArea`; **das zuletzt geöffnete gewinnt**, beide
  haben [⌨] (I4 §7.2). Wird SINGEN mit „Tippen“ eingeschaltet, erscheint die Tippfläche (zuletzt geöffnet); endet SINGEN, zeigt das Feld
  wieder, was `kbFeld` sagt. Ist SINGEN mit „Tippen“ schon beim App-Start aktiv, gewinnt die Tippfläche (sie hängt an einem laufenden Modus).
  Während eines Vormachens öffnet sich die Tippfläche nicht (Vormachen zuerst beenden; Hinweis einmal). Gemeinsame Abnahme I1-45.
- Der Menü-Eintrag heißt nur „Super-Regler“ (keine Prozent-Anzeige).

##### 6.2 Das Super-Regler-Feld [V] (F1)

**Fassung nach verfügbarer Innenhöhe** `h` = Höhe von `#kbArea` − 12 px (Rand 6 + 5 px, Linie 1 px; Z. 389 [C]), Innenbreite `w` =
Breite − 12 px. Typische Werte: W hochkant 225–260 px Feld (h 213–248), P1 ≈ 199–225 (h 187–213), P2 ≈ 170–180 (h 158–168), P3 170
(h 158), mit offenem Editor immer 170 (h 158); quer W 116–150 (h 104–138), L1/L2 110–133 (h 98–121), mit offenem Editor 110 (h 98).
Die Fassung wird bei jeder Größenänderung neu gewählt (`ResizeObserver`), nie nach „Editor offen“.

**Fassung G – hochkant, h ≥ 196** (Abstände 8 px; Rest der Höhe geht in den Balken, höchstens 96):
```
│ [①] [② 33 %] [③ 100 %] [+ Ziel]                              [⌨] │ 44  Ziel-Chips
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ①━━━━━━━━②━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━③  │ │ 72… Balken, Füllung bis zur Stellung, Marken an den Zielen
│ │ 67 % · zwischen ② und ③                                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ [ NEIGEN (halten) ] [Kurve*] [ ⇥ bis zum nächsten Teil        ]  │ 64
│                              [   → ③ bis Refrain (T. 17)      ]  │
```
**Fassung M – hochkant, 148 ≤ h < 196** (offener Editor, P2, P3, P1 teils; Abstände 4 px):
```
│ [①][②][③][+ Ziel]                              [⌨] │ 44
│ [ Balken, Höhe h − 96 (52…99), Text im Balken     ] │
│ [ NEIGEN ][Kurve*][ ⇥ T. 17 → ③                   ] │ 44
```
**Fassung Q – quer, h ≥ 92** (auch mit offenem Editor bei 110 px Feld = h 98):
```
│ ┌ Balken, Höhe h − 48 ─────────────┐ ┌──────────┐ [ ⇥ T. 17 → ③ ] │
│ └──────────────────────────────────┘ │  NEIGEN  │                 │
│ [①][②][③][+ Ziel][Kurve*]            │ (halten) │ [      ⌨      ] │
│                                       └──────────┘                 │
```
`*` = freier Platz 52 × 44 für I3s Kurven-Chip (I3 §6.8); ohne I3 bekommt ihn [⇥ …] (hochkant) bzw. die Chip-Zeile (quer). Abstimmung mit
I3: hochkant sitzt der Chip in **beiden** Fassungen in der unteren Zeile (I3 §6.8 nannte für den offenen Editor die Chip-Zeile – dort ist auf
P3 kein Platz).

**Maße (Pflicht, M-PLATZ mit echter App-Schrift):**
- Ziel-Chips ≥ 48 × 44; bei `w` ≥ 360 einzeilig „② 33 %“ (≥ 56 breit), darunter zweizeilig (Nummer über Prozent). P3 (`w` 308):
  5 × 48 + 4 × 4 + 8 + 44 = 308 → passt genau.
- Untere Zeile hochkant: NEIGEN ≥ 104 (in G 140), Kurve 52, [⇥ …] erhält den Rest (P3: 308 − 104 − 52 − 12 = 140). Beschriftung von [⇥ …]
  in G zweizeilig „⇥ bis zum nächsten Teil“ / „→ ③ bis Refrain (T. 17)“, in M und Q einzeilig in der längsten Form, die passt („⇥ bis T. 17
  → ③“, „⇥ T. 17 → ③“); der volle Name steht im `aria-label` und in der Erklärung beim Tipp auf die graue Taste. Nie abgeschnitten.
- Quer: NEIGEN 104 × h, rechte Spalte 96 breit mit zwei Tasten je 44 hoch (braucht h ≥ 92), linker Bereich = `w` − 104 − 96 − 16
  (L2: 559 − 216 = 343 ≥ 5 × 52 + 52 + 20 = 332).

**Balken:**
- Ziehen waagrecht, **relativ** (springt nicht zum Finger), volle Breite = ganzer Weg. **Fein-Modus** wie bei allen Reglern über
  `ctlPrecision` (Z. 26739) – hier mit dem **senkrechten** Abstand vom Aufsetzpunkt (≥ 64 px → ×¼, ≥ 140 px → ×1/16) oder einem zweiten
  Finger auf freier Fläche; die Blase zeigt „FEIN ×¼“.
- Beim Überfahren eines Ziels leuchten **Marke und Chip 120 ms** auf (Klasse `.hit`, Pflicht) und `haptic('tick')`, an 0 % und 100 %
  `haptic('snap')` – **Haptik nur, wo das iPhone sie erlaubt** (§10: der Schalter-Trick in `haptic()`, Z. 26684, braucht ab iOS 18.4 einen
  echten Klick und ist laut Berichten in neueren iOS-Fassungen ganz abgestellt; beim Ziehen kommt also wahrscheinlich nichts). Höchstens
  alle 30 ms.
- Tipp ohne Ziehen tut nichts (keine Zufalls-Sprünge). **Doppeltipp = zurück auf ① Ausgang** über die 20-ms-Glättung, ein Undo-Schritt
  („zwei Tipps = Grundwert“ wie bei allen Reglern der App, Z. 26692 [C]).
- Anzeige ≤ 30 Bilder/s, nur wenn sich die Stellung ändert; bei geschlossenem Feld 0 Arbeit.

**Ziel-Chips:** ① Ausgang (immer da, nicht löschbar; Tipp → Hinweis „① ist der Grundklang – den stellst du ganz normal im Editor ein“) ·
②③④ mit Ort in % · **[+ Ziel]** = Vormachen an der aktuellen Stellung (grau mit Grund, §6.3 Punkt 1). Tipp auf ②–④ → Blatt
„Ziel ③ · 67 %“ mit der Liste „Was ändert sich?“ (§6.4), **[Neu vormachen]** und **[Ziel löschen]** (beide ≥ 44 px).

##### 6.3 Vormachen

1. **Start** mit [+ Ziel] (bzw. [Neu vormachen]). Ort `p` = aktuelle Stellung, auf 4 Stellen. Liegt dort schon ein Ziel (± 0,05), wird es
   neu vorgemacht. Grau mit Grund, wenn: `x` < 0,10 („Ziele liegen ab 10 % – Regler weiter nach rechts“; bei genau 0: „Bei 0 % klingt der
   Grundklang – den stellst du ganz normal im Editor ein“) · 0,05 < Abstand zu einem Ziel < 0,10 („zu nah an ② – Regler weiter schieben“) ·
   schon 3 Ziele und keins in ± 0,05 („Höchstens 4 Klangzustände (mit Ausgang) – erst eins löschen“) · ● Aufnahme läuft („Erst Aufnahme
   beenden“).
2. **Vormachen-Leiste [V]** (44 px, amber): „VORMACHEN 67 % · **[Wirkt auf: Alle Spuren ▾]** · **[✓ Ziel merken]** **[Abbrechen]**“.
   - **Im Tastatur-Feld** (solange `#kbArea` normal sichtbar ist): Das Feld zeigt oben die Leiste und darunter **die Tastatur** (Höhe h − 48,
     quer bei h 98 also 50 px), damit man den Klang beim Einstellen anspielen kann. Balken, NEIGEN und die Fahrt-Taste sind in dieser Zeit
     ohnehin gesperrt. Höhe von `#kbArea` ± 0 px.
   - **Im Editor-Kopf**, solange `#kbArea` verdeckt oder verschoben ist (`.mkcov` durch die offene MS-2000-Platte, Z. 5300/6178 [C], im
     Querformat die ganze Fläche; oder `#app.mkqkb`, SPIEL-Ansicht der Platte): Die LCD-Zeile des offenen Editors zeigt amber
     „VORMACHEN 67 % · Synth 2 · Klang einstellen“, und in der Kopfzeile `r1` ersetzen **[✓ Ziel merken]** und **[Abbrechen]** (je ≥ 44 × 44;
     schmal „✓ Merken“ / „Abbrechen“) die Engine-Wahl (die ist im Vormachen ohnehin grau). Gilt für alle Editoren (`sheetFrame`); die Platte
     selbst bleibt unverändert. So ist der scharfe Modus immer sichtbar und beendbar (Regel 6/10).
   - Breiten: je Teil die längste Form, die passt („VORMACHEN 67 %“/„67 %“, „Wirkt auf: Alle Spuren ▾“/„Alle Spuren ▾“/„Alle ▾“,
     „✓ Ziel merken“/„✓ Merken“), nie abgeschnitten. P3 (`w` 308): „67 %“ 44 + [Alle ▾] 76 + [✓ Merken] 92 + [Abbrechen] 84 + 3 × 4 = 308;
     W hochkant (`w` 416): „67 %“ + [Alle Spuren ▾] + [✓ Ziel merken] + [Abbrechen] ≈ 370.
3. **„Wirkt auf“** (Liste „Alle Spuren“, dann jede Spur mit Namen) gilt für dieses Vormachen und wird als Vorgabe gemerkt (`S.sr.sc/t`).
   Änderbar bis zum ersten Griff, danach grau („erst Abbrechen“). **„Diese Spur“:** nur die gewählte Spur nimmt auf; ihr Editor öffnet sich
   von selbst; Griffe an anderen Spuren wirken wie immer (Hinweis einmal: „Vormachen gilt nur für Synth 2“). **„Alle Spuren“:** jede
   angefasste Spur nimmt auf.
4. Man stellt den Klang **ganz normal** in den Editoren ein (VA, FM, FM-Feld, MS-2000-Platte, Drums, FX-Reiter mit Lautstärke/Pan/Sends,
   G4-Sends der STIMME-Spur). Diese Änderungen gehen **nicht** in den Klang der Spur: Jede betroffene Spur bekommt beim ersten Griff eine
   **Arbeitskopie des wirksamen Klangs** (Basis ⊕ Super-Regler an der Stellung `p`); die Editoren zeigen und ändern die Kopie, die Engine
   spielt die Kopie (`{set: Kopie, sr: null}` in einer Nachricht → kein hörbarer Unterschied beim ersten Griff). Umsetzung als dritter
   Bearbeitungs-Ort neben „Grundklang“ und „◆ Zustand“ (V6a). Für Editoren, die ein ganzes Objekt neu bauen (`fmxApply`, `mkSetP`), wird nach
   jeder Geste der Pfad-Unterschied zur Kopie gebildet.
5. **Was während des Vormachens sonst passiert:** Balken, NEIGEN, [⇥ …] und das Umschalten auf die Tippfläche sind gesperrt. Die **Basis** der
   vormachenden Spuren ist die vom Start (`R.sr.cap.base`, eingefroren): Ein Szenen-Morph oder eine Song-Fahrt läuft für die übrigen Spuren
   normal weiter, für die vormachenden Spuren nicht (sie spielen die Kopie). Nach Merken/Abbrechen fährt eine solche Spur in 250 ms (S-Kurve)
   zum dann gültigen Klang. Engine-Wechsel, Modus und Stimmenzahl sind grau („nur im Grundklang“). ↶ während des Vormachens nimmt nur
   Vormachen-Griffe zurück.
6. **[✓ Ziel merken]:** Je vormachende Spur und Schlüssel: **Nur Schlüssel, deren Wert in der Kopie sich in diesem Vormachen geändert hat,
   werden ins Ziel geschrieben**, stetig als `Δ = toNorm(Kopie) − toNorm(Basis)` (der volle Abstand zur Basis), stufig als Wert der Kopie.
   Ein Δ unter 0,0005 wird nur dann (als 0) gespeichert, wenn der Schlüssel in einem anderen Ziel dieser Spur einen Eintrag hat (sonst nichts).
   **Alles andere bleibt, wie es war:** Beim Neu-Vormachen behält das Ziel die Einträge nicht geänderter Schlüssel und nicht angefasster
   Spuren; bei einem neuen Ziel fehlen sie, und nach §5.3 läuft ihr Weg gerade zwischen den Nachbarzielen hindurch → **der Weg aller nicht
   angefassten Spuren und Schlüssel ist unverändert** (I1-34, I1-42). Danach bekommt die Engine `{set: Basis (ohne force), sr: {tab, disc,
   x}}` in einer Nachricht: An der Stellung `p` ist Basis + SR = Kopie, **der gehörte Klang ändert sich nicht** (I1-32; hat eine Song-Fahrt
   die Stellung inzwischen bewegt, gleitet die Spur in 20 ms auf die neue Stellung). Ein Undo-Schritt („Ziel ③ (67 %) gemerkt“);
   `track.sound`, `tr.gfx` und alle `clip.st` bleiben deep-equal.
7. **[Abbrechen]:** Kopien weg, der Klang fährt in 250 ms (S-Kurve) zurück; kein Undo-Eintrag.
8. Vormachen endet auch mit: Projekt laden/neu, ■■ Panik, Wechsel in die Song-Aufnahme (Regel 6/10 – dann wie Abbrechen, Hinweis „Vormachen
   abgebrochen“). Über 64 Einträge je Spur beim Merken: Hinweis, nichts gemerkt, das Vormachen bleibt offen.

##### 6.4 „Was ändert sich?“ (je Ziel) [V] (F1)

Liste in Klartext wie das V6a-Clip-Blatt: „Synth 1 · Cutoff 800 Hz → 2,4 kHz · Hall-Send 15 → 30 %“, „Drums · Kick Decay 0,30 → 0,52 s“;
Werte = Basis (jetzt) → Ziel. Je Zeile **[✕]** (ein Undo, entfernt den Schlüssel aus diesem Ziel; sein Weg läuft dann zwischen den Nachbarn);
unten **[Ziel löschen]** (ein Undo). Engine-fremde Schlüssel grau „passt nicht zur Engine“; G4-Vorrang grau wie §5.5. Beim Engine-Wechsel
einer Spur mit Super-Regler-Werten erscheint das V6a-Blatt sinngemäß: „Super-Regler-Ziele passen nicht – [behalten, inaktiv] [löschen]“.

##### 6.5 Mod-Übersicht (K1) und Regler-Anzeige

- `k1Mods(i)` (`n5-br-K`, Z. 31538) liefert zusätzlich [A]:
  - **Super-Regler:** je Schlüssel dieser Spur **genau eine** Zeile, Quelle „Super-Regler“, Ziel = Reglername, Menge = Werte an den Zielen,
    die ihn festlegen: „800 Hz → 1,9 kHz (33 %) → 2,4 kHz (100 %)“; Art `'sr'`. **✕** = `k1Del` (Z. 31624) entfernt den Schlüssel aus allen
    Zielen dieser Spur (ein Undo, Art `'sr'`). **Tipp** = zum Regler wie bisher (`K1_PG`).
  - **Klangzustand:** je Clip mit `st` und Schlüssel eine Zeile „Klangzustand ◆ Szene 2“ → Ziel · „800 Hz → 2,4 kHz“; Art `'st'`; ✕ entfernt
    den Schlüssel aus `clip.st` (Undo-Art `'clip'`, A10).
  - K1-03 bleibt wahr: Jeder Regler, der sich beim Fahren oder Szenenwechsel bewegt, hat genau eine Zeile.
- Die Übersicht der STIMME-Spur und der Drums zeigt ihre Super-Regler-Zeilen genauso (`gfx.*` als „Hall (Gesang)“, „Echo (Gesang)“).
- **Regler-Anzeige [V] (F7):** Bis zu Xanders Antwort zeigen die Regler **wie heute** den Wert, den Drehen ändert (Grundwert bzw. ◆-Zustand
  nach V6a-Band, A9), und der Super-Regler ist nur in der Mod-Übersicht zu sehen. **Vorgabe von F7:** zusätzlich eine dünne Marke (2 px,
  Spurfarbe) auf dem Bogen am **gehörten** Wert (Basis ⊕ Super-Regler, gleiche Formel wie die Engine, ≤ 30 Hz, kein Rückkanal), solange der
  Super-Regler auf diesen Regler wirkt. Der Bogen folgt der Hand immer 1 : 1; an der Klemme (Basis + Δ ≥ 1) bleibt die Marke am Rand stehen,
  bis der Bogen sie wieder freigibt. Drehen ändert nie die Ziele.

##### 6.6 [bis zum nächsten Teil fahren] (I1e)

- Die Beschriftung zeigt das Ziel: „→ ③ bis Refrain (T. 17)“ (Formen §6.2). Ziel = das **nächste Ziel rechts** der Stellung.
- Grau mit Grund (Tipp zeigt den Grund): „Schon am letzten Ziel“ · „Kein nächster Teil – im Song oder wenn ein Teil/eine Szene wartet“ (F4) ·
  „Erst ▶ starten“ · im Vormachen „erst Ziel merken oder abbrechen“.
- Während der Fahrt: Taste füllt sich als Fortschritt und heißt **[■ Fahrt stoppen]**. **Wer anfasst, übernimmt** (KZ6): Balken oder
  NEIGEN anfassen beendet die Fahrt bei der aktuellen Stellung.
- **Undo:** Eine Fahrt in der **Matrix** ist ein Schritt (Start → Endstellung bzw. Stellung beim Stopp, `S.sr.x` = diese Stellung);
  [■ Fahrt stoppen] erzeugt keinen eigenen Schritt, sondern beendet diesen. Eine anschließende Hand-Geste ist ihr eigener Schritt.
- **Im Song (▶ SONG) [V] (F3, erst nach Antwort):** Die Fahrt wird beim Tipp als Eintrag `song.sr` gemerkt (ein Undo-Schritt Art `'song'`,
  Hinweis „Fahrt T. 13–17 im Song gemerkt · [Rückgängig]“), damit sie beim nächsten Abspielen, im Offline-Render und im Video genauso kommt.
  Stopp, Übernahme durch die Hand oder ■ vor dem Ende **kürzt** den Eintrag (`b` = Schlag des Stopps aufgerundet, ≥ `a + 1`; `x1` = Stellung
  dort) **im selben** Undo-Schritt. `S.sr.x` ändert sich durch eine Song-Fahrt nicht (§5.6). Ein Eintrag im selben Bereich wird ersetzt.
  Die Song-Ansicht zeigt Einträge als schmalen Streifen (8 px, steigender Keil in Amber) unter der Kopfzeile, nur wenn es Einträge gibt (gleiche
  Bauart wie der VV2-Streifen, `svLayout` rechnet ihn ein). Löschen: Tipp auf die gelbe Kopfzeile des Teils → im vorhandenen Teil-Blatt Zeile
  „Super-Regler-Fahrt T. 13–17 [✕]“ (≥ 44 px). **Ohne Antwort auf F3** laufen Fahrten im Song nur live (nichts gemerkt).
- Handbewegungen und NEIGEN werden **nicht** im Song gespeichert (nur `S.sr.x`).

##### 6.7 NEIGEN (I1f)

- **Erlaubnis:** Der **erste Tipp** auf NEIGEN je Seitenaufruf ruft `DeviceOrientationEvent.requestPermission()` **direkt im `click`-Handler**
  auf (kein `await`, kein Worker-Umweg davor) [W]. `'granted'` → Feld aktiv („Daumen halten und kippen“). Ablehnung oder Fehler → grau:
  „Bewegung nicht erlaubt. Safari merkt sich das – Tab schließen und die Seite neu öffnen; hilft das nicht, Safari ganz beenden.“ [W: Safari
  merkt sich die Ablehnung über Neuladen hinweg; wie man sie zurücksetzt, ist nicht offiziell belegt → genauer Weg in „Bitte prüfen“, Text
  danach anpassen]. **Nie** „Website-Daten löschen“ empfehlen – das löscht die lokal gespeicherten Projekte.
- **Kein `requestPermission`** (Desktop, Android): Hörer anmelden; als „Sensor da“ gilt erst ein Ereignis mit **endlichem `beta` und
  `gamma`** binnen 500 ms (ein Desktop-Browser ohne Sensor kann ein Ereignis mit `null`-Werten schicken [W]); sonst grau „Kein Bewegungssensor“.
  In einem fremden Rahmen (Claude-Ansicht = Cross-Origin-iframe) liefert Safari keine Bewegung [W] → grau „Neigen geht nur auf der Webseite in
  Safari“. Nur über HTTPS [W] (die Pages-Seite ist HTTPS).
- **Kupplung:** Neigen wirkt **nur**, solange der Daumen auf dem Feld liegt (`pointerdown` … `pointerup/cancel`, `touch-action: none`).
  **Null-Lage = Haltung beim Aufsetzen:** Bezug ist das letzte gültige Ereignis ≤ 50 ms vor dem Aufsetzen, sonst das erste danach; kommt binnen
  300 ms keins: „Sensor antwortet nicht“. Stellung beim Aufsetzen = `x_ref`. **Loslassen: die Stellung bleibt** (F2).
- **Winkel ohne Kardan-Sprung (genau):** aus `alpha/beta/gamma` (Reihenfolge Z-X′-Y″ der W3C-Spezifikation) die Drehmatrizen `R_ref` (beim
  Aufsetzen) und `R_jetzt`; relative Drehung `Q = R_refᵀ·R_jetzt`. Mit dem Bildschirmwinkel `a` beim Aufsetzen (`screen.orientation.angle`,
  Rückfall `window.orientation`) sind im Gerätesystem: Bildschirm-oben `u = (sin a, cos a, 0)`, Bildschirm-rechts `r = (cos a, −sin a, 0)`,
  Bildschirm-Normale `z = (0, 0, 1)` (zum Gesicht). `u′ = Q·u`; **`θ = atan2(−(u′·z), u′·u)`** = Winkel der Projektion von `u′` auf die Ebene
  senkrecht zu `r`. Positiv = **Oberkante vom Körper weg** [A] (Vorzeichen per I1-62, Gefühl in „Bitte prüfen“). Eine Drehung um die
  Hochachse des Geräts oder um die Bildschirm-Normale ändert `θ` nicht; kein Sprung bei `beta = ±90°`; gleiche Bedeutung hoch und quer.
- **Abbildung:** `θ` einpolig geglättet (τ 40 ms, zeitrichtig je Ereignis), Totzone ± 1,5° (abgezogen), **30° = ganzer Weg**:
  `x = clamp(x_ref + sign(θ)·max(0, |θ| − 1,5°)/30°, 0, 1)`. Senden wie die Hand (≤ 60/s), Glättung im Worklet 20 ms. Stufige Wechsel sind
  je Spur auf einen je 100 ms begrenzt (§5.4).
- Ausrichtung wechselt während des Haltens → Halten endet, Stellung bleibt. Beim Überfahren eines Ziels: Aufleuchten wie beim Balken
  (Pflicht), Haptik wo erlaubt (aus `deviceorientation` heraus voraussichtlich nicht, §10).
- **Sparsam:** Hörer nur, solange das Super-Regler-Feld offen ist und die Erlaubnis da ist; weg bei Schließen und `visibilitychange`.
  Arbeit je Ereignis ≤ 0,2 ms (Median), keine Allokation außer dem Ereignis selbst.

##### 6.8 Undo, Speichern, Hilfe

- Undo-Arten: neu **`'sr'`** (`undoState` Z. 20563 = `JSON.stringify(S.sr ?? null)`, `undoApply` Z. 20586 → `srRestore`, Stellung fährt per
  20-ms-Glättung). Eine Balken-Geste = ein Schritt („Super-Regler 12 % → 67 %“), Doppeltipp = ein Schritt, ein NEIGEN-Halten = ein Schritt,
  Ziel merken/löschen, Schlüssel ✕ = je ein Schritt, Matrix-Fahrt = ein Schritt (§6.6), Fahrt im Song = ein Schritt `'song'` (§6.6), Spur
  entfernen = Gruppe mit `'sr'` (§4.1).
- „geändert“-Punkt des Projekts sofort (Regel 7) bei jeder Hand-Änderung und jedem Ziel; **nie** durch Wiedergabe, Fahrten oder Schleifen
  (§5.6). Der Klang-„geändert“-Punkt einer Spur ändert sich durch den Super-Regler **nicht** (der Klang selbst bleibt gleich).
- **Sound speichern (Bibliothek) [V für den Hinweis] (F7):** speichert wie heute den **Grundklang** ohne Zustände und ohne Super-Regler.
  Vorgabe von F7: steht der Super-Regler ≠ 0 und hat die Spur Werte, zeigt das Speichern-Blatt die Zeile „Super-Regler steht auf 67 % –
  gespeichert wird der Klang bei 0 %“. Ohne Antwort: wie heute, ohne Zeile.
- Hilfe-Zeilen (Menü-Hilfe, mit I1d): drei Sätze zu Super-Regler, Vormachen, NEIGEN; keine Hersteller- oder Gerätenamen.

##### 6.9 Test-API und Haken (nur für Tests)

`SYNQUENZER.sr = {get(), set(x), capture(scope), keep(), cancel(), drive(), stop(), eff(i, key), del(i, key), path(i, key, x),
layout(), neigen: {ref(), angle()}}`; Worklet-Haken `__morphProbe(t, on)` (V6a) und **`__srProbe(t, on)`** (je Block `{f, xs, keys,
active, defer}` der Spur); beide ohne Oberfläche. `SYNQUENZER.sr.path` liefert `SR_k(x)` aus `SRCore` (Haupt-Faden).

---

#### 7. Zusammenspiel mit vorhandenen und kommenden Paketen (im Code geprüft)

| Bereich | Stelle | Was I1 tut |
|---|---|---|
| Engine-Abgleich | `syncEngine`, `syncEngines`, `newEngine`, `wkFlat`, `wkMods`, `wkFm6Patch`/`wkFm6`, `wkSet`/`wkFlush` (4.23.0 Z. 17781–18176) | `effective`-Schicht; Voll-Abgleich weiter mit `force`, `sr`/`morph` in derselben Nachricht zuerst (A2); Byte-Gleichheit ohne Zustände |
| Worklet VA/FM/MS 2000 | `AnalogCore.onMsg`, `setReq` (XF-Prüfung auf Endwerte), `setParams`, `derive`, `structReq`/`structXf`, `xfLite`, Steuerschleife (`cutN`, Z. 9753), `CR = 16`; `MkCore.set` (Z. 9158), `MK_SM` | Nachrichten §5.2, `B`/`P`-Trennung, `SRCore`, `v.pv` (I2 §5.2), teilweises `derive`, Überblend-Klasse mit 100-ms-Grenze und Rückstellung ab Stufe 2 |
| Nativ / Spur-Werte | `applyChainFx`, `applyTrackParams`, `trackFx` (+ G4 `g4Fx`), `syncLfoSet` | Stufen 16 ms; G4-Vorrang §5.5; LFO-Raten nativ nicht gefahren |
| Drums | `drumHit`, `DrumSeq.lockParams` (Z. 12086) | `stAt(t)`, `srAt(t)` je Schlag |
| Daten | `normalizeProject`, `normClip`, `cleanClip`, `normSong`, `ownNorm`, `nvLockOf` | `srNorm`, `srSongNorm` (unbekannte Felder bleiben), `st` mitnehmen, `S.need` + Sperre (§4.5) |
| Song-Werkzeuge | `songShift`, `songClear`, `songTidy`, `songWrite`, `vvDirCutTo` (`n5-br-V` Z. 22829–22910, neben den VV2-Haken) | `srShift/srClear/srTidy/srCutTo/srWrite` |
| Zeitplan | `tick`, `songTickInner`, `R.pend`, `launchPart`/`R.partPend`, `b2t`/`t2b`/`spb` | Fahrten in Audiozeit, `srSongX`, Matrix-Ziel |
| Undo | `undoPush`, `undoState`, `undoApply`, `groupSwap`, `soundSnapshot`/`commitSound` | Art `'sr'`; `clip.st` mit `'clip'`; Vormachen ohne Klang-Undo |
| Bedienung | `ctlPrecision`, `haptic`, `toNorm`/`fromNorm`, `PD`, `sndGet`/`sndSet`, `SQMK.mkPathGet/Set`, `setP`, `mkSetP`, `fmChanged`, `fmxApply`, `edParamChanged`, `sheetFrame` | Fein-Modus, Aufleuchten + Haptik, `srGet`/`srSet`/`srDesc`, Bearbeitungs-Ort „Vormachen“, Leiste im Editor-Kopf |
| MS-2000-Platte | `COVER`/`coverSync` (Z. 5300 ff.), `.mkcov`, `#app.mkqkb` | Leiste wandert in den Editor-Kopf, Platte unverändert |
| K1 Mod-Übersicht | `k1Mods`, `k1Del`, `K1_PG`, `UI.pop.k1r` (`n5-br-K`) | Zeilen `'sr'` und `'st'`, ✕ mit Undo |
| VV1–VV3 Video | `vvSwapIn`, `vvRenderAudio`, `vvStateAt` (`n5-br-V`) | `R.sr` sichern/setzen (`srSongX`); VV3 zeichnet Regler mit `effective(t)` (inkl. Fahrten) |
| „Song als Audio“ | `SREC` (4.23.0 Z. 36279) | Echtzeit; Fahrten laufen, Hand wird mit aufgenommen, keine Bitgleichheit (§5.6) |
| CPU-Begrenzer | `cpuTick`/`limited`/`applyLimiter`, `perfProbe` (MK1) | ändert nie SR-Werte; Stufe ≥ 2 stellt Überblendungen zurück; I1-Probe für I1-83 |
| G4 Gesang | `tr.gfx` (`rev`, `dly`), `g4Fx`, `g4Norm` (`stage-ges`) | `gfx.*` über `srGet/srSet`, Vorrang §5.5; Vormachen nimmt G4-Sends auf |
| G1–G3, G5–G8, VS-L/VS-P | Takes, Marken, Song-Stimme | kein Eingriff; STIMME-Spur nur mit `fx.vol/pan` und `gfx.*` |
| **I2** P-Locks + FM im Sequencer | `Lock_k` (L1), `v.pv`/`pv-layout.json` (§5.2), Fächer `kc[]` (§5.9), F3 | Endwert-Formel nur hier (§5.1); `sr` an alle Kerne, `morph` nur Hauptkern; `pv-layout.json` bringt mit, wer zuerst zusammengeführt wird (I2-61); **Abstimmung:** `LKT.c` braucht `bipow` (mit `k`) und `hdec`; I2 trägt `'lk'` in `S.need` ein (VO-R1 greift für Zusatzfelder nicht) |
| **I3** Mal-LFO | `S.sr.f`, `song.sr[].f` (Form-Objekt, I3 §3.3), `ramp.k`, Kurven-Chip (I3 §6.8) | `f` bleibt erhalten; Platz 52 × 44 je Fassung (§6.2); **Abstimmung:** I3 §6.8 setzt den Chip hochkant immer in die untere Zeile |
| **I4** Tipp-Summen | Tippfläche in `#kbArea` (I4 §7.2) | zuletzt geöffnet gewinnt, beide mit [⌨], `kbFeld` merkt nur das zuletzt gewählte Feld (§6.1), I1-45 |
| **G9** Songtext | Mikrofon, Takes, Silben | kein Eingriff |
| Bit Mask (Nachtrag 7) | `synq-bm`, Nachrichten `{t:'…'}` (Z. 330 dort), Mod-Übersicht BM2-06 | I1h: `{t:'sr', …}`, `{t:'morph', …}`, Je-Stimme-Werte; die BM-Mod-Übersicht (BM2-06) bekommt die Zeilen |
| North (Nachtrag 6, ND1) | `synq-md` | I1h: `srAt` je Schlag wie Drums |
| T1 Taktarten (geplant) | Schlag-Einheit, Taktraster | `song.sr` in Song-Schlägen wie `song.xp`, T1 rechnet um; „nächster Schlag“ = Zählzeit der Taktart |
| FR1 Einfrieren (geplant) | – | Spuren mit Super-Regler-Werten tauen bei Bewegung auf oder werden nicht eingefroren (FR1 regelt das) |
| Online-Speichern | Format 5 | nur Zusatzfelder + `S.need`; `max_app` siehe Regel 20 |

---

#### 8. Unterpakete, Zweige, Dauer, Budget

**Ausgangsstand:** Hauptlinie mit K1 und VV1–VV3 (Dirigent führt zusammen; I1a/I1b dürfen auf `n5-br-K/index.html` beginnen, I1e braucht den
Offline-Render aus VV1). **Freigabe-Tore (§9):** I1a-Klang, I1b, I1c und die NEIGEN-Logik (I1f) starten **sofort**. I1d startet erst nach
**F1**; die Regler-Anzeige und der Hinweis beim Sound-Speichern erst nach **F7**; die V6a-Oberfläche (A9) erst nach **F8**; das Merken von
Fahrten im Song (I1e-Song) erst nach **F3**.
**Zweige (Regel 29):** **A** `i1-br-K` (Klang): I1a → I1b → I1c · **B** `i1-br-U` (Oberfläche, nach F1): I1d gegen die feste Schnittstelle
§5.2/§6.9, dann I1e · **C** `i1-br-N`: I1f-Logik (liefert `srHand(x, 'neigen')`, Erlaubnis, Winkel; das Feld baut B).
Zusammenführung: A + C → B → I1g. I1h im Zweig von Bit Mask/North nach deren Zusammenführung. Jede Stufe mit Changelog, Snapshot,
„Bitte prüfen“-Liste (Regel 22).

| Paket | Inhalt | Dauer | Budget |
|---|---|---|---|
| I1a | V6a + A1–A10: Zustände je Clip, Worklet-Morph, `effective`, Voll-Abgleich, MS 2000/FM, K1-Zeilen `'st'`; Oberfläche nach F8 | 6–7,5 h | +36 KB |
| I1b | V6a′: nativ, Spur-Werte `st.fx`, G4-Sends, Drum-Zustände | 3–4 h | +18 KB |
| I1c | Super-Regler-Kern: Daten, `srGet/srSet/srDesc`, `SRCore`, `sr`-Nachricht, Weg mit `Z_k`, Einrasten/Leerlauf, Stufen-Regel (100 ms, Rückstellung), `v.pv`, Locks/Fächer, Drums, nativ, Undo `'sr'`, Speichern/Laden, `S.need` | 7–9 h | +19 KB |
| I1d | Feld G/M/Q, Balken, Chips, Vormachen (Leiste im Feld und im Editor-Kopf), „Was ändert sich?“, K1-Zeilen `'sr'`, I4-Regel, Regler-Anzeige (F7), Hilfe | 8–10 h | +28 KB (bei Bedarf geladen) |
| I1e | Fahrt Song/Matrix, `srSongX`, `song.sr` + Song-Haken, Streifen, Teil-Blatt-Zeile (F3), Offline/Video | 3–4 h | +9 KB |
| I1f | NEIGEN: Erlaubnis, Rückfälle, Kupplung, Winkel, beide Ausrichtungen | 4–5 h | +7 KB (bei Bedarf geladen) |
| I1g | Zusammenführen, Regel-28-Golden, Regression, iPhone-Tor, Fach-Prüfung, „Bitte prüfen“ | 2–3 h | – |
| I1h | Bit Mask + North verstehen `morph`/`sr` (`SRCore`, ≈ 3 KB je Prozessor) | 2–3 h | +6 KB |
| **Summe** | | **≈ 35–46 h** | **≈ +123 KB**, davon ≈ 35 KB erst beim ersten Öffnen |

Mit drei Zweigen ≈ 17–22 h Kalenderzeit, wenn F1 rechtzeitig beantwortet ist. Der Vorschlag nannte ≈ 24 h + 6 h; mehr ist es, weil V6a an
MS 2000, FM, K1 und das fehlende V7a angepasst werden muss, weil Fahrten in Song, Export und Video gleich klingen müssen und weil die
Prüfung Feld-Fassungen, Lock-Abgleich, Vorwärtsschutz und ein iPhone-Tor verlangt hat.

---

#### 9. Fragen an Xander (jede mit Vorgabe)

**Regel:** Fragen **ohne [V]**: ohne Antwort gilt die Vorgabe. Fragen **mit [V]** (sichtbar Neues): gebaut wird **erst nach deiner Antwort**
(CLAUDE.md Regel 3, typische-fehler 27). Die Frage „Super-Regler und gelockte Schritte – mitgehen oder fest?“ steht **nur in I2 (F3)**.

- **F1 Ort, Form und Einzelheiten des Felds [V] (I1d wartet).** Geplant: Menü → „Super-Regler“ schaltet das Tastatur-Feld um; oben die
  Ziel-Chips ①–④ mit [+ Ziel] und [⌨], in der Mitte ein **waagrechter Balken**, unten NEIGEN und [⇥ bis zum nächsten Teil]. Dazu:
  (a) [+ Ziel] startet das Vormachen; dann zeigt das Feld oben eine amberfarbene Leiste „VORMACHEN 67 % · Wirkt auf ▾ · [✓ Ziel merken]
  [Abbrechen]“ und darunter die Tastatur zum Anspielen; verdeckt die MS-2000-Platte das Feld, stehen Text und die zwei Tasten im Kopf des
  Editors (die Platte bleibt, wie sie ist); (b) Tipp auf ein Ziel öffnet das Blatt „Was ändert sich?“ mit [Neu vormachen] und [Ziel löschen];
  (c) zwei Tipps auf den Balken = zurück auf ① (wie bei allen Reglern); (d) beim Überfahren eines Ziels leuchten Marke und Chip kurz auf
  (Vibration nur, wo das iPhone sie erlaubt); (e) soll ein Tipp auf ein Ziel den Regler auch **dorthin fahren** lassen? Vorgabe: (a)–(d) so,
  (e) nein. Oder statt des Balkens lieber ein großer **runder** Regler, oder ein **immer sichtbarer schmaler Streifen** über der Tastatur (die
  Tastatur würde dafür ≈ 52 px niedriger)?
- **F2 NEIGEN loslassen.** Vorgabe: Die Stellung **bleibt**, wo sie ist. Oder soll sie beim Loslassen zur Stellung beim Aufsetzen
  **zurückfedern** (wie ein Tonhöhen-Rad)?
- **F3 Fahrt im Song merken [V] (Song-Teil von I1e wartet).** Vorgabe: Eine Fahrt während ▶ SONG wird im Song gemerkt (schmaler Streifen in der
  Song-Ansicht, löschbar im Teil-Blatt), damit Song, Video und Offline-Render sie jedes Mal gleich spielen. Oder nur live (dann fehlt sie im
  Video)? Bis zur Antwort: nur live.
- **F4 Matrix ohne wartenden Wechsel.** Vorgabe: [bis zum nächsten Teil fahren] ist dann grau. Oder soll man dort eine Länge wählen können
  (1 / 2 / 4 / 8 Takte)?
- **F5 Einer oder viele.** Vorgabe: **ein** Super-Regler je Projekt (seine Ziele wirken auf eine Spur oder alle). Oder je Spur ein eigener?
- **F6 Kleiner MORPH-Schieber aus dem alten Plan (V6b).** Er sollte im Editor zwischen Grundklang und Szenen-Zustand blenden. Vorgabe: er
  **entfällt**, weil der Super-Regler das kann. Einverstanden?
- **F7 Was zeigen die Regler, wenn der Super-Regler etwas verstellt? [V]** Beispiel: Der Cutoff-Regler steht auf 800 Hz, wegen des Super-Reglers
  hörst du 2,4 kHz. Vorgabe: Der Regler zeigt weiter 800 Hz (das, was Drehen ändert), dazu eine **dünne Marke** bei 2,4 kHz; „Sound speichern“
  speichert den Klang bei 0 % und sagt das in einer Zeile („Super-Regler steht auf 67 % – gespeichert wird der Klang bei 0 %“). Oder: Der
  Regler zeigt 2,4 kHz mit kleinem Hinweis „Super-Regler +“, und beim Speichern fragt die App „Grundklang oder gehörten Klang speichern?“.
  Bis zur Antwort: Regler und Speichern wie heute (keine Marke, keine Zeile).
- **F8 Bedienung des weichen Szenenwechsels [V] (Oberfläche von I1a wartet).** Vorgabe: [◆ Merken] in der Kopfzeile jedes Klang-Editors (auch
  über der MS-2000-Platte, die Platte bleibt unverändert); beim Bearbeiten eines Zustands sagt die LCD-Zeile des Editors in Amber „Bearbeite:
  ◆ Szene 2 · 3 Werte anders“, daneben [Grundklang] zum Zurückschalten; ◆ klein in der Clip-Zelle; die Liste der Abweichungen im Clip-Blatt;
  beim Szenenwechsel bewegen sich die Regler sichtbar mit. Passt das so?

---

#### 10. Recherche (kurz, eigene Worte)

- **Großer Bühnen-Regler (Vorbild):** Bei einer bekannten Bühnen-Workstation (2016) steuert ein großer Regler acht gemeinsame Zuweis-Regler;
  jede Spur hat eigene acht Zuweis-Regler, die man mit ihnen verknüpft, je Ziel mit Bereich, Kurve und Richtung. Nutzer bemängeln das
  „alles oder nichts“ und die vielen Ebenen. → Hier: Vormachen statt Ebenen, Ziele direkt im Klang. Quellen:
  yamahasynth.com „Mastering MONTAGE 1: The Super Knob“ (`https://yamahasynth.com/?p=2020`), „Mastering MONTAGE 8: Assignable Knobs“
  (`https://yamahasynth.com/?p=2028`), Forum `https://yamahasynth.com/community/montage-series-synthesizers/super-knob-1094`.
- **iOS-Erlaubnis für Bewegung:** `requestPermission()` zeigt den Dialog nur aus einer Nutzer-Geste (`click`/`touchend`, nicht
  `touchstart`); nach einem Umweg über einen Worker lehnt Safari ab; nur über HTTPS; eine Erlaubnis gilt für Bewegung und Ausrichtung
  zusammen. Safari merkt sich die Antwort (auch eine Ablehnung) über Neuladen hinweg; ein Weg zum Zurücksetzen ist dort nicht beschrieben →
  am Gerät prüfen. Quellen: WebKit-Fehler 269706 (`https://bugs.webkit.org/show_bug.cgi?id=269706`), Apple-Entwicklerforum
  (`https://developer.apple.com/forums/thread/128376`, dazu Thread 255598032), Übersicht „Using HTML5 accelerometer and gyroscope in 2020“
  (`https://yal.cc/js-device-motion/`, nur über die Suche gelesen).
- **Fremde Rahmen:** WebKit erlaubt Bewegungs-Ereignisse in Cross-Origin-iframes nicht; `requestPermission` fehlt dort sogar mit
  Berechtigungs-Richtlinie. Quellen: WebKit-Fehler 221399 (`https://bugs.webkit.org/show_bug.cgi?id=221399`), 152299
  (`https://bugs.webkit.org/show_bug.cgi?id=152299`), W3C deviceorientation (`https://github.com/w3c/deviceorientation`; ohne Sensor darf ein
  Ereignis mit `null`-Werten kommen).
- **Haptik im Web auf dem iPhone:** Safari hat kein `navigator.vibrate`; der Umweg über ein Schalter-Label (`<input switch>`, so arbeitet
  `haptic()`) wirkt laut den Bibliotheken `ios-vibrator-pro-max` und `ios-haptics` ab iOS 18.4 nur nach einem echten Klick (nicht beim Ziehen,
  gilt ≈ 1 s) und ist laut deren Beschreibung und Nutzerberichten in neueren iOS-Fassungen ganz abgestellt. → Sichtbares Signal ist Pflicht,
  Haptik ein Zusatz; am Gerät prüfen.
- **Prüfen ohne Gerät:** Chromium-DevTools-Protokoll `Emulation.setSensorOverrideEnabled` + `Emulation.setSensorOverrideReadings` (Sensor
  `relative-orientation`, Quaternion) – `DeviceOrientation.setDeviceOrientationOverride` ist als veraltet markiert und nur Rückfall –, dazu
  `Emulation.setDeviceMetricsOverride` mit `screenOrientation {type, angle}` (für M-NEIG).

---

#### 11. Abnahme

**I1a (V6a)** — **V6a-01 … V6a-16 gelten** (spec v3 §17) mit A1–A10 (die Oberflächen-Punkte V6a-01/-02/-14 nach F8), dazu:
- [ ] **I1-01** Regel 28: Projekt ohne `clip.st`/`S.sr` → Nachrichten-Protokoll an alle Engines byte-gleich zum Ausgangsstand (M-MSG über 32
      Takte Demo), Golden-Render bitgleich (M-NULL = −∞), gespeichertes JSON zeichengleich (kein `need`).
- [ ] **I1-02** MS 2000: Zustand mit `mk.t.0.f.cut` morpht über 2 Takte mit ≥ 10 Zwischenwerten (`__morphProbe`), M-SP monoton; stufiger
      Wert (`mk.t.0.o1.w`) am Taktstrich über 30-ms-Blende: M-KLICK besteht, M-EINBRUCH ≤ 3 dB; `mk.mode` im Zustand nicht speicherbar.
- [ ] **I1-03** FM: `fmx.ops.2.ol` und `fm6.ops.2.ol` morphen stetig (≥ 8 Zwischenwerte je N6a-01), `fmx.ops.0.fbAmt` stetig; Algorithmus-
      Wechsel im Zustand → `structXf`, nie `xfLite`-Blende (Zähler im Worklet = 0), M-EINBRUCH ≤ 3 dB.
- [ ] **I1-04** Mod-Übersicht: jeder Zustands-Schlüssel genau eine Zeile „Klangzustand ◆ Szene n“, ✕ entfernt ihn (Undo `'clip'`, deep-equal),
      Tipp leuchtet den Regler; während eines Szenen-Morphs hat jeder bewegte Regler eine Zeile (K1-03).
- [ ] **I1-05** `clip.st` übersteht Speichern/Laden, Kopieren/Einfügen, Szene duplizieren, eigenen Song-Clip (deep-equal); FANG-/Aufnahme-Clips
      haben kein `st`.
- [ ] **I1-07** (nach F8) V6a-Oberfläche in VA, FM-DX, FM-FELD, WT und MS-2000-Platte (hoch und quer): [◆ Merken]/[Grundklang] ≥ 44 × 44,
      Text in der LCD-Zeile nicht abgeschnitten, Höhe der Platte und des Editors ± 0 px gegenüber ohne Zustand (Platte pixelgleich).

**I1b (V6a′)** — **V6a′-01 … V6a′-06 gelten** mit `st.fx` (V6a′-06 nach A10), dazu:
- [ ] **I1-06** STIMME-Spur: Zustand mit `fx.vol` und `gfx.rev` fährt in Stufen ≤ 16 ms (M-SP/Pegel monoton), M-KLICK besteht; gleichzeitig
      G4-Regler drehen → keine Ausnahme (`tickErrors()` und Konsole 0); bei `gfx.on` wirkt ein SR-Eintrag `fx.rev` nicht, `gfx.rev` schon
      (Hall-Send-Pegel ± 0,1 dB gegen Rechnung), bei `gfx` aus umgekehrt.

**I1c Kern**
- [ ] **I1-10** `srNorm`: 1000 Zufalls-`sr` → ≤ 3 Ziele, `p` 0,10–1,00 mit Abstand ≥ 0,10, |Δ| ≤ 1, ≤ 64/256 Einträge, 4 Stellen; unbekannte
      Felder (auch `f` als Objekt) bleiben deep-equal erhalten; Speichern → Laden deep-equal; Projekt ohne `sr` → JSON zeichengleich.
- [ ] **I1-11** Weg: Ziele ② 0,33 (Cutoff +0,2), ④ 1,0 (Cutoff +0,4, Hall +0,3); Stellung 0 → 1 in 101 Schritten offline: Wert je Schritt =
      stückweise lineare Rechnung über `Z_k` (± 0,001); **Hall läuft gerade von 0 bis 1,0** (② legt Hall nicht fest); Cutoff in Hz log-linear;
      nach dem letzten Ziel konstant.
- [ ] **I1-12** Endwert-Regel: Grund 0,30, Zustand 0,50, Δ +0,20 → 0,70 (`__srProbe` ± 0,001); Δ +0,8 → Klemme 1,0; LFO-Route auf Cutoff
      wirkt weiter obendrauf (Schwankung messbar); bei Stellung 0 direkt nach dem Laden Render **bitgleich** zum Projekt ohne `sr`.
- [ ] **I1-13** Glättung: Stellung springt 0 → 1 → größter Schritt je Block ≤ 13 % des Weges, Verlauf e-Funktion mit τ = 20 ± 2 ms; gehaltene
      Fläche mit Res 0,8: M-KLICK besteht.
- [ ] **I1-14** Stufig: Säge im Ausgang, Puls in ②; gehaltener Ton über die Mitte → Teiltöne 1–10 vor/nach je ± 0,5 dB (Spektrum unverändert),
      der erste neue Ton danach klingt Puls; Pendeln ± 0,015 um die Mitte (10 ×) → höchstens 1 Wechsel.
- [ ] **I1-15** Stetig auf gehaltenen Tönen: 4-Ton-Akkord gehalten, Stellung 0 → 100 % in 200 ms per Geste: M-KLICK besteht, M-EINBRUCH ≤ 3 dB,
      Schwerpunkt zwischen 50-ms-Fenstern ohne Sprung > ⅓ Okt.
- [ ] **I1-16** Überblend-Klasse (FM-Struktur, MS-2000-Timbre-Wert): Überqueren der Mitte → 30-ms-Blende, M-EINBRUCH ≤ 3 dB, kein Neustart der
      Hüllkurven (Pegel stetig); NEIGEN-Wackeln ± 0,03 um die Mitte mit 20 Hz über 2 s → höchstens 1 Überblendung je 100 ms; bei
      Begrenzer-Stufe 2 (erzwungen) keine Überblendung und keine 4-ms-Blende, solange eine Stimme klingt (`srDefer` ≥ 1), nach dem Ausklang
      bzw. bei Stufe < 2 der neue Wert; M-KLICK besteht durchgehend.
- [ ] **I1-17** Drums: Kick `tDec` +Δ in ②; Schläge bei Stellung 0 / 0,5 / 1 → Decay = Grund / Mitte (± 2 %) / Ziel; Fahrt über 1 Takt: jeder Schlag
      liest seinen Zeitpunkt.
- [ ] **I1-18** Nativ (`forceNative(true)`): Cutoff fährt in Stufen ≤ 16 ms monoton; Effekt-Regler derselben Spur währenddessen drehen → keine
      Ausnahme; LFO-Rate als Schlüssel nativ grau „nur mit Worklet“.
- [ ] **I1-19** Voll-Abgleich bei Stellung ≠ 0 (Undo auf derselben Spur, Preset-Laden einer anderen Spur, `syncEngines()`): Klang bleibt stetig
      (M-SP ohne Sprung > ⅓ Okt), Stellung und Fahrt laufen weiter; **Preset-Laden auf derselben Spur bei Stellung 0,6 mit gehaltenem Akkord:
      30-ms-Überblendung findet statt (Zähler), M-KLICK besteht**; Merken eines Ziels löst keinen Voll-Abgleich aus (M-MSG).
- [ ] **I1-20** CPU (M-CPU, Xeon): 1 Spur, 16 Schlüssel, Dauerfahrt ≤ Ruhe + 1 %; 6 Spuren × 32 Schlüssel bei NEIGEN-Bewegung ≤ Ruhe + 3 %;
      ohne `sr` + 0,0 %; 60 s Node-Shim ohne GC-Ereignis, Heap ± 1 MB.
- [ ] **I1-21** Offline: Song mit Stellung 0,5 und zwei Fahrten zweimal über `vvRenderAudio` gerendert → **bitgleich**.
- [ ] **I1-22** Undo: Balken-Geste = 1 Schritt, ↶ stellt `S.sr` deep-equal her, Klang gleitet (M-KLICK besteht); ↷ ebenso.
- [ ] **I1-23** Engine-Wechsel einer Spur mit Werten → Blatt „passen nicht“ [behalten, inaktiv] / [löschen], je ein Undo; Modus/Stimmen nie im Ziel.
- [ ] **I1-24** (nach I2) Lock + Super-Regler: (a) Δ +0,2 auf `cutoff` → gelockter Schritt `toNorm(Endwert) − Lock` = 0,200 ± 0,002 (M-LOCK aus
      I2), Schritt mit Reihenwert ebenso, ungelockte +0,2; (b) Wellen-Lock bleibt gegen eine SR-Stufe; (c) Klangzustand-Fahrt lässt den
      gelockten Schritt auf dem Lock-Wert (≤ −90 dB gegen ohne Fahrt); (d) Klang-Lock-Fach: `sr` kommt an (Zähler je Kern), Zustand wirkt nicht,
      SR wirkt auf gleiche Schlüssel, engine-fremde Schlüssel und stufige SR-Werte wirken nicht; `morph` erreicht kein Fach.
- [ ] **I1-25** Einrasten und Leerlauf: (a) 0 → 0,7 → 0 per Hand: danach `xs === 0`, `P[k] === B[k]` für alle Schlüssel (`__srProbe`), `active`
      = false; ein danach neu angeschlagener Ton (alle Stimmen vorher ≥ 1 s still, Effekte aus) ist über 200 ms bitgleich zum selben Ton im
      Projekt ohne `sr`; Fahrt-Ende genau `x1` (`===`). (b) Stellung 0,5 still: CPU gegen dasselbe Projekt mit den Werten als Grundklang
      ≤ + 0,1 % (Rauschgrenze), Rechnungen je Block = 0. (c) 60 s still im Node-Shim: kein subnormaler Wert in `xs`, `e`, `P` (M-DENORM = 0).
- [ ] **I1-26** Pfade und Beschreibungen: `srDesc` liefert für jeden Schlüssel aus `PD`, FM-Tabellen, `mkRange`, `G4_R` und `DPD` eine
      Beschreibung; `'fx.rev'` → `PD['fx.rev']` (nicht `SYN_DESC`); `srGet/srSet` lesen/schreiben `gfx.*`, `mk.*`, `fm6.ops.*`, `fmx.ops.*.fbAmt`,
      `fmx.edge.*` richtig (Rundlauf deep-equal); `'fmx.fb'` wird als unbekannt grau geführt.
- [ ] **I1-27** Kennlinien: `SRCore` im Worklet-Shim gegen `toNorm`/`fromNorm` des Haupt-Fadens für `lin`, `bip`, `exp`, `db`, `hdec`, `pow` (k 1,5 /
      2), `bipow` (`fmBright`, k 0,5) an 10 001 Punkten: |Δ| ≤ 1e-9 (in Reglerraum bzw. relativ in Engine-Einheiten).
- [ ] **I1-28** Ältere Versionen: (a) Vorgänger-Snapshot (Stand vor I1) öffnet ein I1-Projekt ohne Fehler und spielt es ohne Zustände/Super-
      Regler (dokumentiert, Changelog); (b) ein Projekt mit `need: ['zz']` öffnet in I1 gesperrt mit Hinweisband, Klang des Bekannten
      unverändert, kein Speicherweg überschreibt die Datei (wie MK0-Prüfungen); (c) `need` wird beim Speichern genau aus den Daten berechnet.
- [ ] **I1-29** Spur entfernen (STIMME-Spur) mit SR-Einträgen → Einträge weg in einer Undo-Gruppe, ↶ stellt Spur und Einträge deep-equal her;
      danach Speichern → Laden deep-equal; Spur duplizieren → die Kopie hat keine Einträge.

**I1d Oberfläche und Vormachen** (nach F1; I1-38 nach F7)
- [ ] **I1-30** M-PLATZ in P1 390×844, P2 375×667, P3 320×568, L1 844×390, L2 667×375, W 926×428 und 428×926, je ohne Editor, mit offenem
      Editor, mit offener MS-2000-Platte (GERÄT und SPIEL) und im Vormachen; je mit und ohne Platzhalter für I3s Kurven-Chip: richtige Fassung
      G/M/Q zur Innenhöhe, nichts abgeschnitten (`scrollWidth ≤ clientWidth`, echte Schrift), jede Trefferfläche ≥ 44 × 44, kein waagrechtes
      Scrollen; Höhe von `#kbArea` beim Umschalten Tastatur ↔ Super-Regler, beim Start/Ende des Vormachens und bei jeder Fassung ± 0 px.
- [ ] **I1-31** Balken: Ziehen relativ (Aufsetzen ändert nichts), volle Breite = 100 % (± 1 %); Fein ×¼ ab 64 px, ×1/16 ab 140 px senkrecht;
      beim Überfahren jedes Ziels hat Marke und Chip 120 ± 20 ms die Klasse `.hit` (DOM-Beobachter), `haptic` wird gerufen (Zähler), höchstens
      alle 30 ms; Doppeltipp → Stellung 0 über die Glättung, ein Undo-Schritt; Einzeltipp ändert nichts.
- [ ] **I1-32** Vormachen „Diese Spur“: Stellung 67 %, Cutoff und Hall-Send von Synth 2 geändert, [✓ Ziel merken] → genau ein Ziel `p` 0,67 mit
      genau diesen zwei Schlüsseln (Δ ± 0,0005); `track.sound`, `tr.gfx` und alle `clip.st` deep-equal zu vorher; Render um den Merken-Moment
      ohne hörbare Änderung (Pegel ± 0,1 dB, M-KLICK besteht); genau ein Undo-Schritt, ↶ entfernt das Ziel.
- [ ] **I1-33** Vormachen „Alle Spuren“ (hoch und quer, die MS-2000-Platte dabei offen): Griffe an Synth 1 (Cutoff), FM-Spur (OP 2 Pegel im FELD),
      MS-2000-Spur (Filter), Drums (Kick Decay), STIMME (Hall-Send) → Ziel enthält genau diese 5 Spuren mit genau diesen Schlüsseln; unberührte
      Spuren fehlen; die Leiste war die ganze Zeit sichtbar und bedienbar (im Feld bzw. im Editor-Kopf).
- [ ] **I1-34** Vormachen zwischen Zielen: ② 0,33 und ④ 1,0 vorhanden, bei 0,67 Drive dazu → Cutoff- und Hall-Werte bei 0,33 / 0,5 / 0,67 / 0,8 /
      1,0 unverändert (± 0,001), Drive nur um ③ herum.
- [ ] **I1-35** [Abbrechen] → alles wie vorher (deep-equal), Rückfahrt 250 ms ohne Knacken, kein Undo-Eintrag; ↶ im Vormachen nimmt nur
      Vormachen-Griffe zurück; Projekt laden/Panik/Song-Aufnahme beenden das Vormachen sauber; im ● Aufnahme-Zustand nicht startbar.
- [ ] **I1-36** „Was ändert sich?“: Zeilen mit Basis → Ziel in Klartext für alle Engines; ✕ je Zeile und [Ziel löschen] je ein Undo.
- [ ] **I1-37** Mod-Übersicht: je Spur und Schlüssel genau eine Zeile „Super-Regler → …“ mit den Werten an den Zielen; ✕ entfernt den Schlüssel
      aus allen Zielen (ein Undo, hörbar); bei einer Fahrt 0 → 100 % hat jeder sich bewegende Regler eine Zeile (Abgleich mit `__srProbe`).
- [ ] **I1-38** (nach F7, Vorgabe) Regler-Anzeige: Bogen = Wert, den Drehen ändert, folgt der Hand 1 : 1; Marke = gehörter Wert, |Marke −
      `__srProbe`| ≤ 0,005 Reglereinheiten während einer Fahrt; an der Klemme bleibt die Marke am Rand. Vor F7: Regler pixelgleich zu heute.
- [ ] **I1-39** Grenzen und Sperren: 4. Ziel, > 64 Einträge, Engine-Wechsel/Modus im Vormachen → Hinweis, nichts geändert.
- [ ] **I1-40** Leistung: Öffnen des Felds (erstes Mal, Block laden) ohne Aufgabe > 50 ms (Chromium Performance); Ziehen mit 59+ Bildern/s
      (PE1); geschlossenes Feld: 0 Zeichen-Aufrufe.
- [ ] **I1-41** Marke: `grep -i -P 'yamaha|montage|modx|super ?knob|korg|nord(?!en)|kodamo|mask ?1(?![0-9])|elektron'` in DOM, Hilfe, CSS,
      Quelltext der neuen Blöcke = 0.
- [ ] **I1-42** Nicht angefasste Spuren: Ziele ② 0,33 und ④ 1,0 mit Cutoff für Synth 1; Vormachen bei 0,67 nur an Synth 2 → Synth 1 bei 0,33 /
      0,5 / 0,67 / 0,8 / 1,0 unverändert (± 0,001), beim Merken kein Pegel- oder Spektrum-Sprung (± 0,1 dB, M-SP ohne Sprung); danach
      [Neu vormachen] an ③ nur mit Synth 3 → die Einträge von Synth 2 in ③ bleiben deep-equal; ein Schlüssel, der in ③ auf den Basiswert
      zurückgestellt wird und in ② Einträge hat, wird als 0 gespeichert (Weg macht bei ③ eine Delle).
- [ ] **I1-43** Vormachen-Sonderfälle: Start bei 0 / 0,05 / 0,08 neben ② (0,15) / mit 3 Zielen → grau mit dem jeweiligen Grund; Balken, NEIGEN,
      [⇥ …] im Vormachen gesperrt; Szenen-Morph und Song-Fahrt während des Vormachens: die vormachende Spur hört weiter die Kopie, Δ bezieht sich
      auf die Basis vom Start, nach dem Merken fährt sie in 250 ms zum dann gültigen Klang (M-KLICK besteht); [Wirkt auf] nach dem ersten
      Griff grau.
- [ ] **I1-44** Leiste im Editor-Kopf: MS-2000-Platte quer offen (`#kbArea.mkcov`) und SPIEL-Ansicht (`#app.mkqkb`) → LCD-Text amber, [✓ Ziel
      merken]/[Abbrechen] ≥ 44 × 44 in `r1`, beide wirken; die Platte ist pixelgleich zu ohne Vormachen; ebenso in VA-, FM- und Drum-Editor.
- [ ] **I1-45** I1 ↔ I4: Super-Regler offen → SINGEN mit „Tippen“ an → Tippfläche; SINGEN aus → wieder Super-Regler; [⌨] auf beiden →
      Tastatur; Neustart zeigt das zuletzt gewählte Feld; jeder Wechsel ohne Layout-Sprung (± 0 px), keine Konsolen-Fehler.

**I1e Fahrt** (Bedienung nach F1, Song-Teil nach F3)
- [ ] **I1-50** Song mit Teilen Strophe (T. 1–8) und Refrain (T. 9–16), 4/4, Ziele ② 0,33, ③ 0,67, Stellung 0,33; Tipp bei T. 5, Schlag 2,5 →
      Beginn T. 5 Schlag 3 = Song-Schlag 18 (± 128 Samples), 0,67 genau am ersten Schlag von T. 9 = Schlag 32 (± 128 Samples, offline über
      `__srProbe`), Stellung über die Zeit linear (R² ≥ 0,999). (Mit T1: Schläge über dessen Takt-Umrechnung.)
- [ ] **I1-51** Restzeit < 1 Schlag → Fahrt dauert 1 Schlag, im Song `b = a + 1`; `srTidy`/`srClear`/`srShift` behandeln einen solchen Eintrag
      richtig (deep-equal gegen Rechnung); kein nächstes Ziel → grau mit Grund; ohne ▶ → grau.
- [ ] **I1-52** Im Song: Eintrag `{a: 18, b: 32, x0: 0,33, x1: 0,67}` gemerkt, ein Undo-Schritt; erneutes Abspielen ab T. 1 → dieselbe Fahrt;
      Offline-Render zweimal bitgleich; VV3-Bild zeigt den fahrenden Cutoff (± 2 % gegen Rechnung); Stopp bei Schlag 25,4 → Eintrag
      `b = 26`, `x1` = Stellung dort, weiterhin ein Undo-Schritt.
- [ ] **I1-53** Song-Werkzeuge: 2 Takte davor einfügen → Eintrag + 8 Schläge; Takte mit dem Eintrag löschen → weg bzw. gekürzt; Ausschnitt
      verschieben trägt ihn mit; Undo deep-equal; Song ohne `sr` → JSON zeichengleich.
- [ ] **I1-54** Hand zwischen zwei Einträgen live auf 0,9 → der nächste Eintrag beginnt bei 0,9 (kein Sprung: größter Schritt je Block ≤ 13 %,
      M-KLICK besteht); offline (ohne Hand) beginnt er beim `x1` des vorigen (`srSongX`).
- [ ] **I1-55** KZ6: Balken oder NEIGEN während der Fahrt anfassen → Fahrt endet bei der aktuellen Stellung (± 0,5 %), [■] ebenso; Matrix-Fahrt
      = ein Undo-Schritt mit der Stellung beim Ende.
- [ ] **I1-56** Matrix: Szenenwechsel wartet auf T. 4 → Fahrt endet dort (± 128 Samples), nichts gespeichert; kein wartender Wechsel → grau.
- [ ] **I1-57** Wiedergabe ist Laufzeit: Song mit zwei Fahrten abspielen und stoppen → `S.sr.x` unverändert, „geändert“-Punkt aus, kein
      Undo-Eintrag; Song-Start an T. 7 → Stellung = `srSongX`. „Song als Audio“ ohne Hand → Korrelation ≥ 0,99 gegen den Offline-Render; mit
      Hand-Bewegung → die Bewegung ist in der Aufnahme (M-SP folgt), keine Ausnahme.

**I1f NEIGEN**
- [ ] **I1-60** Erlaubnis: Spion zeigt, dass `requestPermission` synchron im `click`-Handler gerufen wird; `'granted'` → aktiv; `'denied'` →
      grau mit dem Text aus §6.7 (kein Hinweis auf Website-Daten); ohne API und ohne Ereignis in 500 ms → „Kein Bewegungssensor“; ohne API mit
      Ereignis `beta = gamma = null` → ebenfalls „Kein Bewegungssensor“; Testseite mit Cross-Origin-iframe → „nur auf der Webseite“.
- [ ] **I1-61** Null-Lage: Gerät bei beta 40° still (Rauschen ± 0,3°), Aufsetzen → Stellung über 300 ms unverändert (± 0,2 %).
- [ ] **I1-62** Abbildung: +15° (Oberkante weg) → `x_ref + 0,45 ± 0,02`; −15° → `− 0,45`; Klemme bei 0/1; gleich in Hochformat (angle 0) und
      Querformat (angle 90 und 270); **+15° Kippen, dann 20° Drehen um die Hochachse des Geräts → weiterhin 0,45 ± 0,03**; nur 20° Drehen um die
      Bildschirm-Normale → 0 ± 0,02.
- [ ] **I1-63** Kein Kardan-Sprung: Bezug beta 85°, kippen über 90° hinaus → Stellung stetig (kein Schritt > 2 % zwischen Ereignissen).
- [ ] **I1-64** Loslassen → Stellung bleibt (± 0,2 % über 1 s), weiteres Kippen wirkt nicht; neues Aufsetzen = neue Null-Lage.
- [ ] **I1-65** Ausrichtung wechselt beim Halten → Halten endet, Stellung bleibt.
- [ ] **I1-66** Hörer nur bei offenem Feld (Zähler 0 nach Schließen und bei verborgener Seite); Arbeit je Ereignis ≤ 0,2 ms (Median).
- [ ] **I1-67** Ein NEIGEN-Halten = ein Undo-Schritt; beim Überfahren eines Ziels `.hit` an Marke und Chip (Pflicht), `haptic` gerufen (Zähler).

**I1g / I1h**
- [ ] **I1-80** Regel 28: alle Projekte in `synq-snapshots/` und die Demo offline gegen den Ausgangsstand bitgleich; Regression grün: Smoke,
      DoD (Worklet und nativ), FX1–FX10, K1-Suite, MS-2000-Kern-Suiten, VV1–VV3, G1–G8, VS-L/VS-P, I2/I3/I4 und North/Bit Mask (soweit
      zusammengeführt); kein Supabase-Aufruf.
- [ ] **I1-81** I1h: Bit-Mask-Spur und North-Kick mit Ziel → stetig (≥ 10 Zwischenwerte) bzw. je Schlag richtig; Bit-Mask-Maskenwechsel als
      stufiger Wert nur an der Periodengrenze und nur für neue Töne bzw. 30-ms-Blende; ohne Werte beide Prozessoren bitgleich; die
      Bit-Mask-Mod-Übersicht (BM2-06) zeigt die Super-Regler-Zeilen.
- [ ] **I1-82** „Bitte prüfen“ für Xander am iPhone (Pages-Seite): Erlaubnis-Dialog und – nach einer Ablehnung – welcher Weg sie zurücksetzt;
      Gefühl und Richtung von NEIGEN; ob beim Ziehen und beim Neigen eine Vibration zu spüren ist; Fahrt zum Refrain; Vormachen in einer und
      allen Spuren (auch mit offener MS-2000-Platte quer); gehaltener Akkord beim Fahren; Doppeltipp auf den Balken; „Song als Audio“ mit
      Hand-Bewegung.
- [ ] **I1-83** **iPhone-Tor (Xander, Pages-Seite):** `perfProbe` mit I1-Probe, zwei Läufe derselben Szene: „ohne“ (Super-Regler-Werte
      entfernt, gleiche Noten) und „mit“ (6 Spuren × 32 Schlüssel, Fahrt 0 → 1 über 4 Takte und zurück, dazu NEIGEN-Bewegung aus dem
      Test-Haken; 2 Spuren FM bzw. MS 2000 mit stufigem Ziel, Stellung pendelt ± 0,03 um die Mitte). Bedingung: „ohne“ ≤ 0,35, „mit“ ≤ 0,40,
      „mit“ − „ohne“ ≤ 0,03, Begrenzer-Stufe die ganze Zeit 0, kein `late`, 3 min ohne Aussetzer (hören). Ergebnis-JSON in den Changelog.

**Tests.** `i1a-states.mjs`, `i1a-morph-node.mjs`, `i1b-native.mjs`, `i1c-sr-node.mjs` (Node-Shim des Worklets, M-DENORM), `i1c-sr.mjs`,
`i1c-law.mjs` (I1-27), `i1d-ui.mjs` (P/L, CDP-Touch, Fassungen), `i1d-capture.mjs`, `i1e-drive.mjs` (offline), `i1f-neigen.mjs`
(CDP-Sensor), `i1g-golden.mjs`.

---

#### 12. Messverfahren

Vorhandene Verfahren (spec v3 Anhang C und Nachträge 6/7) gelten unverändert: **M-SP** (Schwerpunkt in 50-ms-Fenstern), **M-KLICK**,
**M-EINBRUCH**, **M-CPU**, **M-NULL**, **M-PLATZ**, **M-SPEKTRUM**; aus I2: **M-LOCK**. Neu:

| Kürzel | Name | Definition |
|---|---|---|
| **M-SR** | Super-Regler-Protokoll | `__srProbe(t, true)`: je Render-Quantum `{f (Frame), xs, keys: {k: Endwert}, active, defer}` der Spur; dazu `SYNQUENZER.sr.eff(i, k)` und `.path(i, k, x)` im Haupt-Faden. Vergleich gegen die Rechnung §5.3 in Reglereinheiten. |
| **M-TAKT** | Fahrt-Genauigkeit | Offline-Render (`vvRenderAudio`) mit M-SR; Fehler = Frame, in dem `xs === x1` gilt, minus `round(b2t(Teilanfang)·SR)`, in Samples. |
| **M-HALT** | Gehaltener Ton | gehaltene Note C3 (Säge), 200-ms-Fenster vor und nach der Stufen-Mitte, FFT (Hann, 8192), Teiltöne 1–10 in dB; Unterschied je Teilton. |
| **M-SPRUNG** | größter Schritt | aus M-SR die größte Änderung von `xs` bzw. eines Schlüssels zwischen zwei Blöcken, bezogen auf den ganzen Weg. |
| **M-DENORM** | Subnormale Werte | Node-Shim: nach jedem Block `xs`, `e` und alle `P[k]` der SR-Schlüssel prüfen; Zähler für `v !== 0 && Math.abs(v) < 1.2e-38`; muss 0 sein. |
| **M-NEIG** | Neigen ohne Gerät | Chromium per CDP: `Emulation.setSensorOverrideEnabled` + `Emulation.setSensorOverrideReadings` (`relative-orientation`, Quaternion aus alpha/beta/gamma) in 16-ms-Schritten (Rauschen nach Vorgabe; Rückfall `DeviceOrientation.setDeviceOrientationOverride`), `Emulation.setDeviceMetricsOverride` mit `screenOrientation {type, angle}`; `DeviceOrientationEvent.requestPermission` im Test durch eine Attrappe ersetzt (`'granted'`/`'denied'`/fehlt); Ereignis mit `null`-Werten per `dispatchEvent`. |
| **M-MSG** | Nachrichten-Gleichheit | `MessagePort.prototype.postMessage` im Test umwickelt; strukturierte Kopie jeder Nachricht an `dirigent-analog` als JSON über 32 Takte; Vergleich zeichengleich gegen den Ausgangsstand. |
| **M-IPHONE** | Gerätelast | `perfProbe` (MK1) mit I1-Probe auf Xanders iPhone, Werte „ohne“/„mit“, Begrenzer-Stufe, `late`, `srDefer` als JSON. |

---

#### 13. Risiken

- **Eingriff ins VA-Worklet** (`B`/`P`-Trennung, `v.pv`, teilweises `derive`): Regressionen bei Altklängen. → Ohne Werte läuft kein
  neuer Code (`srOn`/Morph aus), Golden-Render und M-MSG als Tor (I1-01, I1-80).
- **Kosten je Block** bei vielen Schlüsseln. → Grenze 64/Spur, heiße Schlüssel nur Additionen, Gruppen-`derive`, Leerlauf ohne Rechnung,
  Messung I1-20 und am iPhone I1-83.
- **Überblendungen unter Last** (FM-Struktur, MS-2000-Timbre verdoppeln kurz die Stimmen). → höchstens eine je 100 ms, ab Stufe 2 zurückgestellt
  (§5.4), I1-16, I1-83.
- **Ein vergessener Leser** des Klangs am Haupt-Faden (liest `track.sound` statt `effective`) → hörbarer Rücksprung beim Voll-Abgleich. →
  Liste der Leser in §7 abarbeiten, I1-19 prüft genau das.
- **I2 baut parallel** an derselben Stelle (Startpunkt der Stimme, `v.pv`, Fächer). → Formel hier, Tabelle in I2 §5.2, `pv-layout.json` bringt
  mit, wer zuerst zusammengeführt wird; I1-24 nach beiden.
- **iOS-Eigenheiten** (Erlaubnis nur aus Geste, gemerkte Ablehnung ohne belegten Rücksetz-Weg, kein Sensor im iframe, Rauschen, Haptik
  im Web kaum noch möglich). → Kupplung, Glättung, Totzone, klare graue Zustände, sichtbares Signal als Pflicht, „Bitte prüfen“.
- **Vormachen über komplexe Editoren** (FM-Feld, MS-2000-Platte bauen ganze Objekte neu; Platte verdeckt das Tastatur-Feld). → Pfad-Unterschied
  nach jeder Geste, Leiste im Editor-Kopf; Tests I1-33, I1-44.
- **Warten auf Antworten** (F1, F3, F7, F8): Die Oberfläche kommt später als der Klang. → Klang-Teile laufen sofort, Fragen sind kurz und mit
  Vorgabe.
- **Alte App-Stände** verlieren Felder beim Speichern (§4.5). → Pages liefert immer den neuesten Stand; `S.need` schützt ab I1.
- **Datenmenge**: Δ auf 4 Stellen, nur festgelegte Schlüssel; typisch < 3 KB je Projekt.

#### 14. Fragen-Kurzliste für den Changelog

F1 Ort/Form/Einzelheiten [V] · F2 NEIGEN loslassen · F3 Fahrt im Song merken [V] · F4 Matrix ohne wartenden Wechsel · F5 einer/je Spur ·
F6 MORPH-Schieber entfällt · F7 Regler-Anzeige und Sound speichern [V] · F8 Bedienung des Szenenwechsels [V] — jeweils mit der Vorgabe aus §9;
[V] wird erst nach der Antwort gebaut. Super-Regler und Locks: I2 F3.


*Ende Paket I1.*

---


### B.2 Paket I2 — P-Locks für alles, FM im Sequencer, Anschlag

#### Dirigenten-Hinweise zu I2 (gelten vor dem Paket-Text)
1. **Kennlinien (§3):** `LKT.c` ∈ `lin | bip | exp | db | hdec | pow | bipow`, dazu das Feld `k` (Exponent bei `pow`/`bipow`), genau wie `PD`
   (A.1). Operator-Index 0-basiert (bestätigt), FELD-Kanten mit 1-basierten `from`/`to`.
2. **Ältere Stände (§4 letzter Punkt, I2-06):** Der Satz „VO-R1 zeigt das Hinweisband“ stimmt nicht. Es gilt Baustein N mit Merkmal `'lk'`
   (A.4). **I2a baut Baustein N** (+0,5–1 h). **I2-06 neu:** „Ein Stand mit Baustein N, aber ohne I2, öffnet ein I2-Projekt gesperrt mit
   Hinweisband und überschreibt nichts; ein Stand vor Baustein N öffnet es ohne Fehler und verliert die I2-Felder beim Speichern (bekannte Lücke,
   Changelog); zurück im neuen Stand deep-equal.“
3. **Editor-Ziel (§5.9.5):** `ED` mit `ort` nach A.7; I2e legt es an. Gegenseitiger Ausschluss mit Vormachen (I1) und ◆-Zustand (V6a).
4. **Haptik (§6.3 Pinsel, §6.7 Anschlag):** Nach A.8 H2 **kein** `haptic()` aus `pointermove`: kein Tick je gemaltem Schritt, keiner alle 8
   VEL-Stufen, kein Snap an VEL 6/127 beim Ziehen. Rückmeldung: Zellen-Leuchten 150 ms, LCD „Pinsel · …“, Blase „VEL …“. **§13 Punkt 9 entfällt**
   (M-PROBE). Ein Tipp auf eine Note (wählen + hören) darf nach H3 rufen, muss aber nicht.
5. **Sichtbares ([V]):** Regel A.9; die I2-Teile fallen unter (a) bzw. (b) → bauen, Bilder, „Bitte prüfen“.
6. **Zweige (§9):** Zweig A wird **geteilt**, sonst stimmt die Kalenderzeit nicht (Zweig A wäre 32–40 h): **A1 `i2-br-K`** I2a → I2b → I2c,
   **A2 `i2-br-D`** I2d, Start sobald I2a auf der Hauptlinie ist. I2g läuft im Adapter-Zweig `n8-br-A` zusammen mit I1h.
7. **Basis (§9):** aktuelle Hauptlinie H1 (enthält K1, K2, D1, N1, N2, G8). Die K1-Nachbesserung (K1-Antwort 2) ist keine Voraussetzung (A.15).
8. **Worklet-Umbau:** `initCore`/`renderVoices` (I2d) kommt **nach** I1c auf die Hauptlinie (Teil C, Konfliktzone Z1).
9. **Video (§5.11):** `vv3Knob`, `vv3PlateN` und `vv3*State` zeichnen über `heardAt()` (A.11); I2b ergänzt darin den Lock-Teil (`lkValueAt`).
10. **Ring und I1-Marke** auf demselben Regler: Ebenen nach A.11.
11. **Marken (I2-46):** ersetzt durch N8-10 (A.14). „MS 2000“ genau einmal bleibt.
12. **Frage F3** (Super-Regler und Locks) ist Frage 7 in Teil D; F1 → Frage 5, F2 → Frage 6, F6 → Frage 10; die übrigen gelten mit Vorgabe (D.2).

#### Paket-Text I2 (Fassung 2, vollständig)

*SYNQUENZER v3 — Nachtrag 8, Paket I2: P-Locks für alles, FM im Sequencer, Anschlag (Xander 31.10.)*

**Kurz für Xander (Ziel)**
Jeder Schritt deines Sequencers kann künftig seinen eigenen Reglerwert haben – bei jedem Klangerzeuger (Synth, FM, FM-FELD, MS 2000,
Wavetable, Drums, später auch North und Bit Mask). Im LOCK-Modus hältst du einen Regler mit dem Daumen fest – so lange du willst – und
wischst mit dem zweiten Finger über die Schritte: Jeder überstrichene Schritt bekommt den Wert; drehst du dabei, steigt oder fällt der Wert
mit. Ein Ring aus Punkten am Regler zeigt dir, welche Schritte einen eigenen Wert haben. Ein Schritt kann sogar einen ganz anderen Klang
bekommen, auch einen anderen FM-Algorithmus – ohne Knacken, weil jeder Ton in seinem eigenen Klang ausklingt; diesen Klang kannst du auch
bearbeiten, während er spielt. Für FM gibt es freie Reihen wie „OP 2 Pegel“ direkt im gewohnten Sequencer, jede mit eigener Länge, Chance
und Ratsche; Spur-Werte wie Hall oder Panorama und Modulations-Tiefen gehen als freie Reihe (Frage F6). Dazu dein Wunsch vom 31.10.: Den
Anschlag jeder Note siehst du als Füllhöhe im Notenblock, du ziehst ihn hoch oder runter und hörst die Note sofort, mit ◀ ▶ gehst du Note
für Note durch. Alte Projekte klingen genau wie vorher. Ehrlich gerechnet sind es **≈ 55–69 h** (der Vorschlag nannte ≈ 42 h): mehr kosten
die sauberen Nebenkerne für Klang-Locks, das Bearbeiten eines Klang-Locks während er spielt und die North-/Bit-Mask-Anschlüsse.
11 Fragen an dich stehen in §12, jede mit Vorgabe.

---

Status: **gilt für den Bau (Fassung 2, nach Fach-Prüfung 31.10.).** Freigabe Xander 31.10. ~16:50 UTC: „Ja, die Innovation kannst du gerne
umsetzen“ für die Innovationen 1–4 aus `innovation-vorschlag.md`; dies ist Innovation 2 „Parameter-Locks für alles, und FM im Sequencer
richtig gemacht“ samt Beipack „Anschlag sehen/ziehen“ (Vorschlag Abschnitt D). Wunsch wörtlich (`fragen-xander-9.md`, 31.10. ~13:00):
„Parameter-Locks für alles; Anschlag (Velocity-Ziel einfacher; Anschlag einer Note auf der Taste farbig sehen, mit Hoch/Runter-Ziehen auf
der Taste einstellen und hören, Noten vor/zurück durchgehen)“, ~16:00: „alle Synth-Grundlagen vollständig (Modulation, Kreuzmodulation,
Mod-Variationen, P-Locks inkl. Anschlag/‚Dynamik-Lock‘)“, danach: „Anschlag-Lock war nur Brainstorming“. Ideen 5–12 sind **nicht**
freigegeben und kommen hier nicht vor.

Ältere Planung, die dieses Paket ersetzt bzw. aufnimmt: `dirigent-spec-v3.md` §7.4–7.6 und Pakete **V5b** (LOCK-Modus, Drum-Locks)
und **V5c** (Synth-Locks); `nachtrag-1` A.8 Punkt 7 (Locks auf jeden Pfad); `nachtrag-3` EN3-18 (MS-2000-Pfade in LOCK); `nachtrag-6`
ND4 und `nachtrag-7` §1.15 (Pfad-Schlüssel für North und Bit Mask, „V5 spricht sie später an“). Die Endwert-Regel KZ4 ist durch
**I1 §5.1** ersetzt (§2 L1). **V5a (Stränge) und V5d (jeder Regler modulierbar) sind nicht Teil von I2**; I2 legt aber die gemeinsame
Adress-Tabelle an, die V5d später übernimmt (eine Tabelle, nicht zwei).

**Was sich gegenüber Fassung 1 geändert hat (Prüfbefunde):** (1) Endwert-Formel nur noch in I1 §5.1, I2 definiert nur `Lock_k`; eine
gemeinsame Je-Stimme-Tabelle `v.pv` (§5.2) für I1 und I2; F3-Vorgabe an I1 angeglichen; Pfade wie I1/`sndGet`. (2) Klang-Lock-Fächer werden
aus dem ganzen Projekt bemessen und vorab geladen, nie ein falscher Klang als Rückfall (§5.9.2). (3) Nebenkerne in eigenem Feld `kc[]` mit
eigenem Zustand, gebaut im Nachrichten-Weg, Speicher gemessen; Klang-Locks nutzen die Effekte der Spur (F7). (4) Live-Bearbeiten über
`{klSet}` und ein Editor-Ziel (§5.9.5). (5) Pinsel startet auch nach langem Halten. (6) CPU-Grenzen relativ, mit Paar-Messung und
Rauschgrenze; I2-60 mit/ohne. (7) Spur-Werte und Mod-Tiefen als freie Reihe + Frage F6. (8) Pfad-Grammatik bis Tiefe 6. (9) K2/D1/N1
(Zweig `helfer-n12d1k2`) eingearbeitet, Basis verlangt sie. Dazu 14 kleinere Korrekturen (Nachrichten-Nummern, Kern-Wege, Raster-Zuordnung,
Ring-Platz, Werkzeugleisten, Schnittstellen I3/VV3, Klang-Lock-IDs, Fragen, Anschlag-Details, Messbarkeit, Haptik, Marken-Prüfung, nativer
Weg).

**Kennzeichen:** **[C]** Befund im Code (4.23.0 `vs-base-B.html`, Zeilennummern ungefähr; andere Dateien genannt) · **[M]** in dieser
Überarbeitung gemessen (Node, Xeon, Worklet aus `vs-base-B.html` über `dirigent-test/gt/N12D1K2/k2-lib.mjs`) · **[Ö]** öffentliche Angabe ·
**[A]** Annahme dieser Spec (der Builder baut genau das) · **[V]** sichtbare Gestaltung dieser Spec (steht in §13 „Bitte prüfen“) ·
**[X]** Entscheidung von Xander.

**Regeln, die hier besonders gelten** (`typische-fehler.md`):
- **27** Nur bauen, was hier steht. Unklares → „Fragen an Xander“ im Changelog. Selbst gewählte Grenzen und Bedeutungen stehen als Frage
  mit Vorgabe in §12 (F8). Nötiges aus der Fehlerliste (≥ 44 × 44, nichts abgeschnitten, kein Layout-Sprung, kein Knacken) ohne Rückfrage.
- **28** Alte Projekte klingen gleich: Ohne Lock, freie Reihe oder Klang-Lock bleibt **jede** Nachricht an die Worklets byte-gleich zu
  heute, es entsteht kein Nebenkern, und `control()` läuft den heutigen Weg (§5.2). Golden-Render gegen `synq-snapshots/`.
- **3** Sichtbares ist mit [V] markiert und wird in §13 gezeigt; Fragen in §12.
- **4/1/5/6/10** Trefferflächen ≥ 44 × 44, Regler senkrecht ziehen mit Fein-Modus, nichts abgeschnitten, kein Layout-Sprung, scharfe
  Modi (LOCK, Pinsel, Anschlag-Werkzeug, Klang-Lock-Bearbeitung) enden auf jedem Weg (Fertig, anderer Reiter, Schließen, Szenenwechsel, ■).
- **7/8/9** „geändert“-Punkt sofort, eine Geste = ein Undo, Speichern → Laden deep-equal (auch Kopieren, Duplizieren, FANG, eigene Clips).
- **12/13/15/16/17** Glätten, Stimmenübernahme ohne Sprung, Panik beendet auch Nebenkerne, keine Allokation in `process()`, NaN-Schutz.
- **K1-Antworten [X] (31.10. ~16:00):** Qualität „Auto“ ändert nie den Klang → Locks, freie Reihen und Klang-Locks werden unter Last
  **nie** ausgedünnt; Last wird über Stimmenklau gelöst. **Achtung [C]:** Diese Antwort ist im K1-Zweig noch nicht gebaut (§0, `limited()`
  schaltet weiter ECO-Filter und Unison-Kappe). I2 verlangt darum nur: `limited()` bzw. sein Nachfolger wirkt auf **jeden** Kern gleich
  (§5.9.4); „Klang ändert sich unter Last nie“ gilt erst mit der K1-Nachbesserung. Keine versteckte Modulation → Locks erscheinen in der
  Mod-Übersicht (§6.8).
- **24** Keine Marken- oder Gerätenamen in App-Texten, Hilfe, Bezeichnern, Kommentaren, Testnamen; „MS 2000“ genau einmal (`MK_LABEL`).
- **20** Kein Supabase-Aufruf. `max_app` (heute 4 030 000) muss die neue Version decken; das setzt Xander.
- **29** Parallel in drei Zweigen (§9).
- **CLAUDE.md-Vorrang** (schnelle Seite, flüssige Bedienung): Die Bedien-Teile (LOCK-Modus, Lock-Leiste, Pinsel, Ring, Reihen-Optionen,
  Klang-Lock-Blatt) liegen in einem **bei Bedarf geladenen Block** `sq-lock-src` (wie `sq-mk-src`), der erst beim ersten LOCK-Tipp oder
  beim Öffnen eines Clips mit Locks ausgewertet wird. Die Startzeit bleibt gleich. **WebGL bringt hier nichts:** Punkte-Ring und
  Füllhöhen sind wenige Formen je Bild (SVG bzw. das vorhandene Canvas der ROLLE); das sage ich gleich jetzt, nicht erst später.
- Format bleibt **5** (nur zusätzliche Felder). Die App-Version vergibt der Dirigent.

---

#### 0. Befund im Code (4.23.0 und wartende Pakete)

| Stelle | Heute | Folge für I2 |
|---|---|---|
| `normNoteExtras` (Z. 16995) | `lk` nur bei Drums (`if (kind !== 'drum') return out` steht **vor** dem `lk`-Teil), nur `tune`/`dec` relativ [C] | `lk.v`, `lk.k` für beide Spurarten |
| `cleanNote` (Z. 17351) | kopiert `lk` **flach** (`Object.assign({}, n.lk)`) [C] | ein verschachteltes `lk.v` würde zwischen Kopien geteilt → tief kopieren (I2-03) |
| `DrumSeq.lockParams` (Z. 12086) | `tune` ×2^(n/12) auf `frq`, `mTun`, `tfFrq`, √ auf `nFrq`; `dec` auf `tDec`, `nDec`, `mDec` [C] | zuerst `lk.v` absolut, dann `tune`/`dec` relativ (I1 §5.1) |
| `scheduleTrack` (Z. 19130) | Synth-Noten gehen als `spawnClipVoice(i, out, v, t, dur, n, key, false, mask)`; Doppelte (gleiche Zeit + Ton) werden zusammengelegt, das lautere gewinnt [C] | Locks/Klang-Lock reisen mit; bei Zusammenlegen gewinnt `lk` der lauteren Note |
| `SynthHost.track` → `E.on` (Z. 14940) | Ereignis-Feld `[t, 1, id, note, vel, from]` bzw. mit `d` (MK5) [C] | Erweiterung nur, wenn Locks da sind (§5.1) |
| Worklet `enqueue` (Z. 9327) | kopiert **höchstens 7 Elemente** [C]; Einfügen bei gleicher Zeit stabil; `kill` (Typ 4) löscht jedes wartende Ereignis mit `q[i][2] === id` außer Typ 5/6 (Z. 9330) [C]; Typ 8 löscht nur Typ 3 | Lock-Paare würden still verworfen → ganzer Rest (I2-08); Element 2 neuer Typen ist nie eine Stimmen-ID (§5.1) |
| Stimmen-IDs `VSEQ` (Z. 17376) | beginnt je Sitzung bei 0, IDs ab 1 [C] | ID 0 ist frei → Platzhalter für Reihen-Ereignisse |
| `AnalogCore` (Z. 9246) | **ist** der Worklet-Prozessor (`extends AudioWorkletProcessor`); ein `P`, `fm`/`gx` für alle Stimmen; der Konstruktor legt alles an, auch einen `MkCore` (2 × `MkTim`, `MkVoc`, `MkFx`) [C] | ein anderer Algorithmus **je Note** geht nicht über `P` → Nebenkern (§5.9); eigener Bau, siehe nächste Zeile |
| `mkGhost` (Z. 9415) | flache Kopie `{...this}`: `mk`, `ps`, `fm` u. a. bleiben **geteilt**; `ghosts = null`, `spare = null`; landet in `this.ghosts` (höchstens 3, `dropGhost(ghosts.shift())`) [C] | **ungeeignet** für Nebenkerne (würde von der nächsten Überblendung des Hauptkerns abgeschnitten) → eigenes Feld `kc[]`, eigener Zustand (§5.9.1) |
| `MkFx.alloc` (Z. 7633), `MK_DLN` (Z. 7580) | Echo-Puffer 2 × 6 s Float32 ≈ 2,3 MB bei 48 kHz, nur wenn Echo-Tiefe > 0, „never in process()“ [C] | Nebenkerne ohne eigenes Programm-Echo (§5.9.6) |
| Speicher/Aufbau eines vollen Kerns | ≈ 270 KB Heap + ≈ 50 KB Felder, Aufbau Median 0,35–0,8 ms, 90 % ≤ 3,2 ms (eng 0/1/3, ohne Echo-Puffer) [M] | Grundlage der Fach-Grenzen (§5.12) |
| `control()` (Z. 9697) | Steuer-Takt 16 Samples (`CR`), liest `P.cutoff` (über `cutN0`), `P.res`, `P.fenv`, Pegel, PW, Drive … [C] | Je-Stimme- und Reihen-Werte (§5.2) |
| `XF_KEYS` (Z. 6980) | `o1w o2w o3w o1uni o2uni o3uni o2sync ftype subW subOct lq mode eng fmAmp`; Kern-Felder `oW`, `uniN`, `uniG` je Kern [C] | stufige VA-Werte werden je Stimme gehalten (§5.2, gemeinsam mit I1 §5.4) |
| Editoren: `sndOf` (Z. 27543), `wkSet` (Z. 18149), `fmxApply` (Z. 27595), `mkSetP` (Z. 17850) | alle an die **Spur** gebunden: `sndOf(t)` = `S.tracks[t].sound`, `wkSet` → `AU.synth[i]` (Hauptkern) [C] | Klang-Lock-Bearbeitung braucht ein Editor-Ziel (§5.9.5) |
| `spawnVoice` (Z. 18489) | Identitäts-Prüfungen: `snd === tr.sound` (Worklet), `N = o.chain || (!o.sound || o.sound === tr.sound ? A : null)` (LFO-Anschluss), `x.P === P` (Legato), `FMEV.note` nur ohne `o.sound` [C] | Locks nativ als eigene Option `o.lkP`, nie als kopierter Klang (§5.6) |
| PianoRoll (Z. 11368) | Anschlag als **Deckkraft** der Note (`.45 + .55·v`), VEL-Leiste unten; Ziehen in der Leiste ändert, **spielt aber nicht** [C] | Füllhöhe, Anschlag-Werkzeug, Vorhören, ◀ ▶ (§6.7) |
| `LANES0.vel` (Z. 12120) | Anschlag geklemmt 0,05–1,00 = VEL 6–127 [C] | Rastpunkte VEL 6 und 127 |
| StepEditor (Z. 12105) | senkrecht Ziehen auf einem Schritt = Wert der aktuellen Lane (120 px = ganzer Bereich); Vorhören nur beim Anlegen [C] | Vorhören auch beim Ziehen von VEL |
| LAUF (Z. 33173) | Lanes `ton okt vel acc tie`; `onValue` spielt nur bei `ton`/`okt` [C] | VEL spielt mit, ◀ ▶ |
| Regler (Z. 26693, CSS Z. 962) | Kasten 72 × 92, SVG 60 px (56er-Raster, `overflow: visible`), Etikett darüber, Wert darunter; Wert-Bogen r 22, Mod-Ring r 26,5 (Strich 2,5), Halte-Ring r 29; `LP_MS = 450`; zweiter Finger auf **freier** Fläche = Fein-Modus; Drum-Blätter 28–34 px [C] | Ring-Lage und Mindestgröße (§6.4); Pinsel ohne Zeitgrenze (§6.3) |
| `haptic` (Z. 26673) | iOS: Klick auf das Etikett eines Schalter-Kästchens (ab iOS 18), höchstens 1 je 30 ms [C] | aus `pointermove` nicht sicher → nur „wenn möglich“ (§6.3) |
| `PD`, `DPD` (Z. 16719, 16500) | Bereich, Kennlinie je Parameter; **auch** Spur-Werte `fx.drive fx.rev fx.dly fx.vol fx.pan fx.pump fx.pumpRel fx.chorus.*` (Z. 16782–16792) [C] | Quelle der Adress-Tabelle (§3); `fx.*` als Reihen-Ziele (F6) |
| `MODT`, `m.path` | **nicht vorhanden** (V5d nicht gebaut) [C] | I2 legt `LKT` an; V5d übernimmt sie |
| Planer | `TICK_MS` 25, `LOOKAHEAD` 0,1 s [C] | freie Reihen werden im selben Fenster geplant |
| K1-Zweig `limited()` (`n5-br-K` Z. 18241) | setzt ab Stufe 1 `lq = 0` (ECO-Filter), ab Stufe 2 Unison ≤ 3, Stimmen 6/4 [C] – Xanders K1-Antwort (2) ist **noch nicht gebaut** | I2 hängt nicht davon ab; `limited()` wirkt auf alle Kerne gleich (§5.9.4) |
| K1 `k1Mods` (`n5-br-K` Z. 31538) | MS-2000-Pfade wie `t.0.f.cut`, Patches `t.k.p.j.i` [C] | MS-2000-Lock-Pfad = `mk.` + K1-Pfad (Wurzel + bis zu 5 Glieder) |
| K2 (`helfer-N12D1K2.html`, Z. 9598, 18342) | Hüllkurven-Rechnung war **richtig**; geändert wurde der Stimmenklau: `stealIfFull` kürzt bei Begrenzer-Kappe nur ausklingende Stimmen, gehaltene erst über der eigenen Stimmenzahl (`polyH`), Blende `STEAL_N` 5 ms [C] | Klau über alle Kerne nach genau dieser Regel (§5.9.4) |
| D1 (`helfer-N12D1K2.html`, Z. 17464–17477, 19354) | `clip.lanes` {GM: {len, dir, seed}}, Schritt-Rechnung `d1Lane`/`d1Pos` (zählt ab Clip-Start, Neustart = Schritt 1); Klammer im Raster **gezeichnet, nicht ziehbar** (Ziehen kollidiert mit Malen) [C] | freie Reihen nutzen `d1Pos`; Länge im Optionen-Blatt, Klammer nur gezeichnet (§6.5) |
| N1/N2 (`helfer-N12D1K2.html`) | `mirrorNotes`/`reverseNotes` ändern `t`/`n` an den Noten-Objekten; Werkzeugleisten der ROLLE und SCHRITTE scrollen in P2/P3 seitlich; Leisten 36–44 px hoch [C] | Locks wandern mit; Werkzeug-Regel §6.9 |
| I1 §5.1/§5.4 (`n8/I1.md`) | Endwert-Formel mit Super-Regler; Je-Stimme-Tabelle `v.pv` für stufige Werte | I2 übernimmt die Formel (§2 L1) und definiert `v.pv` gemeinsam (§5.2) |
| I3 §3.4, §4.2 (`n8/I3.md`) | erwartet `lanePut` **und** `lockPut` aus I2a; schickt gemalte LFO-Tabellen mit einem Klang-Lock (`lf`) | beides hier festgelegt (§5.1, §8 I2a) |
| VV3 (`helfer-VV3.html` Z. 42885 ff.) | Regler-Bild `vv3Knob`, Platte `vv3PlateN`, Zustände `vv3VaState`/`vv3FmState`/`vv3MkState` [C] | Haken für `lkValueAt` (§5.11) |
| G8 (`stage-ges`, Z. 17033) | Clips bis 64 Takte [C] | Ring blättert taktweise, Reihen bis 64 Schritte |

---

#### 1. Umfang und Nicht-Umfang

**Umfang**
1. **Noten-Locks** für jeden stetigen und jeden stufigen Klang-Parameter jedes Klangerzeugers über eine gemeinsame Adress-Tabelle `LKT`
   (§3): VA, FM DX-Seite, FM-FELD, MS 2000 (beide Timbres), WT, Drum-Stimme; North und Bit Mask über Adapter, sobald sie gebaut sind (I2g).
2. **Freie Reihen** (die „FM-Spuren“ aus dem Vorschlag): eine Reihe je Ziel (z. B. „OP 2 Pegel“) mit eigener Länge (1–64 Schritte),
   eigenem Raster, Chance und Ratsche je Schritt; sie laufen im gewohnten Sequencer (LAUF, ROLLE, SCHRITTE) und gelten für alle Klang-
   erzeuger, FM ist der Hauptfall. Zusätzlich als **nur-Reihe-Ziele** (Vorgabe F6): Spur-Werte (`fx.vol fx.pan fx.rev fx.dly fx.pump
   fx.chorus.mix/rate/depth`), Modulations-Tiefen, LFO-Tempo.
3. **Klang-Lock:** ein Schritt spielt einen ganzen anderen Klang, auch mit anderem FM-Algorithmus bzw. anderer FELD-Verbindung, knackfrei;
   der Klang-Lock lässt sich während der Wiedergabe bearbeiten.
4. **Bedienung:** LOCK-Modus mit Lock-Leiste, **Regler als Pinsel**, **Punkte-Ring** am Regler, Reihen-Optionen, Klang-Lock-Blatt, Eintrag
   in der Mod-Übersicht.
5. **Anschlag:** Füllhöhe im Notenblock, Anschlag-Werkzeug ⇕ (hoch/runter ziehen auf der Note, sofort hören), ◀ ▶ von Note zu Note.

**Nicht-Umfang** (nicht bauen; jeweils mit Frage in §12): Lock-Aufnahme beim Spielen (F5); Locks auf Master/Busse, Hall-/Echo-Raum, Tempo,
Swing (F6); **Noten**-Locks auf Spur-Werte und Mod-Tiefen – sie gehen nur als freie Reihe, weil die Spur-Kette für alle Stimmen gemeinsam ist
(F6); Drive der Spur, Chorus-Art, Pump-Release (Kette wird umgebaut, F6); „Velocity-Ziel einfacher“ (F10); eigene Effekte im Klang-Lock (F7);
V5a-Stränge, V5d-Modulationsziele; Chance/Ratsche auf **Synth-Noten** (nur auf freien Reihen); MIDI-Ausgabe der Locks; Parameter-Gleiten
(„Slide“) zwischen Lock-Schritten; ziehbare Reihen-Klammer (wie D1, F11).

---

#### 2. Begriffe und Regeln

- **Grundwert:** der Reglerwert des Klangs.
- **Noten-Lock:** absoluter Wert eines Parameters, der an **einer Note** hängt (`note.lk.v`). Er gilt für diese Note von ihrem Start bis
  zum Ende ihres Ausklangs.
- **Lock-Reihe:** die Anzeige aller Noten-Locks eines Ziels als Reihe im Editor (keine eigenen Daten).
- **Freie Reihe:** eigene Daten im Clip (`clip.ln`), unabhängig von Noten: eigene Länge, eigenes Raster, Chance und Ratsche je Schritt.
  Ihr Wert gilt ab Schrittbeginn für **alle** klingenden Stimmen der Spur und für jede Note, deren Schritt (L6) dieser Schritt ist.
- **Klang-Lock:** eine Note spielt einen der bis zu 3 im Clip gespeicherten Klänge (`clip.kl`) statt des Grundklangs.
- **Nebenkern / Fach:** die Klangerzeugung eines Klang-Lock-Klangs im Worklet der Spur, in einem nummerierten Fach 1–8 (§5.9).

**Regeln**
- **L1 Endwert – nur in I1 §5.1.** Die vollständige Formel (Super-Regler `SR`, Klangzustand, Lock, Grundwert, Klemmen, relative Drum-Locks,
  Modulation, stufige Werte) steht **ausschließlich in I1 §5.1**; I2 wiederholt sie nicht. I2 legt nur den dortigen Term fest:
  **`Lock_k = Noten-Lock_k ?? Reihenwert_k(t)`** (beide im Reglerraum 0–1 gespeichert, `toNorm` entfällt). Folgen, die I2 prüft (I2-09):
  der Klangzustand (V6a) wirkt **nicht** auf gelockte Schritte (Lock schlägt Zustand); die Super-Regler-Verschiebung **verschiebt** gelockte
  Schritte im Reglerraum (Vorgabe F3, wie I1 §5.1); stufig gewinnt der Lock; LFOs, Hüllkurven-Routen, MS-2000-Mod-Sequenz und Patches
  rechnen obendrauf. Ein **Klang-Lock** ist ein Lock auf **alle** Schlüssel seines Klangs (Zustand wirkt nicht; SR wirkt auf gleiche
  Schlüssel, andere entfallen). Solange I1 nicht gebaut ist, gilt dieselbe Formel mit `SR = 0` und ohne Zustand. F3 wird **nur hier**
  gefragt; wird es „fest“ beantwortet, ändert sich nur I1 §5.1 (SR nicht auf Locks) und I2-09 (b).
- **L2 Regler drehen** ändert nur den Grundwert. Locks bleiben. Anzeige: „CUTOFF 1,2 kHz · 3 Schritte gelockt“.
- **L3 Klassen** (je Pfad in `LKT`):
  `b` **Block** – wirkt im Steuer-Takt auf klingende Stimmen (Cutoff, Resonanz, Pegel, OP-Pegel …);
  `n` **Notenstart** – wird beim Start der Stimme gelesen (Hüllkurvenzeiten, Gleiten, Fußlage, Halbton, **stufige VA-Werte je Stimme**: Wellen,
  Sync, Filtertyp, Sub-Form/-Lage, Unison-Zahl, §5.2);
  `s` **Struktur** – ändert den Aufbau des ganzen Kerns (FM-Algorithmus, FELD-Verbindungen/Wellen, MS-2000-Wellen/Filtertyp/Programm-Ebene,
  VA `lq mode eng fmAmp poly reset`) und ist **nur als Klang-Lock** möglich (§5.9);
  `r` **nur Reihe** – wirkt auf Kern- oder Spur-Ebene (LFO-Tempo, Mod-Tiefen, Spur-Werte `fx.*`), nie als Noten-Lock.
- **L4 Grenzen (fest, nie unter Last verändert; Vorgabe F8):** ≤ 8 Noten-Locks je Note (`tune`/`dec` zählen nicht), ≤ 8 freie Reihen je
  Clip, ≤ 64 Schritte je Reihe, ≤ 3 Klang-Locks je Clip, ≤ 8 verschiedene Klang-Lock-Klänge je Spur (= Fächer), Speicher-Rahmen der Fächer im
  Projekt (§5.12). Abgewiesen wird **beim Anlegen** (9. Lock, 9. Reihe, 4. Klang-Lock, 9. verschiedener Klang der Spur, Rahmen voll), nie beim
  Abspielen; das LCD nennt den Grund.
- **L5 Klang-Lock und Locks:** In einem Klang-Lock gelten Noten-Locks und freie Reihen weiter, wenn es den Pfad im Klang-Lock gibt
  (gleiche Engine-Familie); sonst werden sie für diese Note übergangen (in der Reihe schraffiert „nicht in K2“).
- **L6 Schritt einer Note:** Eine Note gehört zum **nächsten** Schritt des Reihen-Rasters (± ½ Schritt um ihren Beginn; bei Aufnahmen der
  gespeicherte Beginn, bei Drums Schritt + Mikro-Timing `m`). Nach diesem Schritt richten sich Reihen-Wert beim Anschlag (§5.8), Ring,
  Lock-Reihe und Pinsel.

---

#### 3. Adressen: die Lock-Tabelle `LKT`

Eine Tabelle für alle Engines, beim Start **aus den vorhandenen Definitionen erzeugt** (`PD`, `DPD`, FM-Tabellen, `normMk`-Bereiche,
später BM/ND-Tabellen), nicht von Hand gepflegt. **Pfade = dieselben Schlüssel wie `sndGet`/`sndSet` und I1 §4.1** (eine Schreibweise für I1,
I2, I3 und später V5d). Ausnahmen stehen benannt in `LKT_EXC` (Pfad + Grund). V5d übernimmt dieselbe Tabelle als `MODT` (MOD-R1). Eintrag:

```js
LKT['<Pfad>'] = { p, fam: 'va'|'fm6'|'fmx'|'mk'|'wt'|'fx'|'drum'|'md'|'bm', cls: 'b'|'n'|'s'|'r',
                  lo, hi, c /* lin|exp|pow|db|bip */, vals? /* stufig */, lbl /* Anzeigename */,
                  sp: 'A'|'M'|'-' /* Index-Raum im Worklet, §5.2 */, wi /* Platz in pv-layout.json */,
                  nat: 'ja'|'start'|'nein' /* nativer Weg: Block über AudioParam | nur Notenstart | gar nicht */ }
```

| Familie | Pfad-Muster [A] | Klasse `b` (Beispiele) | Klasse `n` | Klasse `s` (nur Klang-Lock) | Klasse `r` |
|---|---|---|---|---|---|
| VA | `<PD-Schlüssel>` flach, `fm2.<…>` | `cutoff res fenv kt drive bass o1lvl…o3lvl o1pw… noise subLvl level uniDet o1fine…` | `aA aD aS aR fA fD fS fR aCurve glide ampVel fvel analog o1oct o1semi …`; stufig je Stimme: `o1w o2w o3w o2sync ftype subW subOct o1uni o2uni o3uni` | `lq mode eng fmAmp poly reset` | `l1rate l2rate`, Mod-Tiefen `mods.<Quelle>-<Ziel>.amt` |
| FM DX | `fm6.ops.<0–5>.<Schlüssel>`, `fmBright`, `fmBite` | `fm6.ops.k.ol`, `.fine`, `.det`, `fmBright`, `fmBite` | `fm6.ops.k.r.<0–3>`, `.l.<0–3>`, `.coarse` | `fm6.alg`, `fm6.fb`, `fm6.ops.k.on`, `.fixed` | – |
| FM-FELD | `fmx.ops.<0–5>.<Schlüssel>`, `fmx.edge.<von>-<nach>.amt` | `fmx.ops.k.ol`, Verhältnis fein, `fbAmt`, Kantentiefen | Hüllkurven der Operatoren | alles, was `fmxSig` ändert: Verbindungen, Welle, Feedback-Quelle, [x │ Hz] | – |
| MS 2000 | `mk.t.<0│1>.<Abschnitt>.<Schlüssel>` (= K1-Pfad mit `mk.` davor), Patches `mk.t.<0│1>.p.<0–3>.i` | `.f.cut`, `.f.res`, `.f.eg`, `.f.kbd`, `.mix.o1/o2/n`, `.o1.c1/c2`, `.o2.tune`, `.a.lvl`, `.a.pan`, `.l1.f`, `.l2.f`, `.p.<0–3>.i`, `.udet`, `.vib` | `.e1.a/d/s/r`, `.e2.a/d/s/r`, `.porta`, `.o2.semi`, `.trans`, `.tune` | `.o1.w`, `.o2.w`, `.o2.mod`, `.f.type`, `.asg`, `.trig`, Programm-Ebene (`mk.mode`, `mk.tv`, Arp, Vocoder) | – |
| WT | `wt.<Schlüssel>` | – (nativer Weg) | alle stetigen | Tabelle | – |
| Spur | `fx.<…>` | – | – | – | `fx.vol fx.pan fx.rev fx.dly fx.pump fx.chorus.mix fx.chorus.rate fx.chorus.depth` (F6); Ausnahmen: `fx.drive`, `fx.chorus.mode`, `fx.pumpRel` |
| Drum-Stimme | `drum.<Pad-ID>.<Schlüssel>` (`DPD`; Pad-IDs `kick snare rim clap hatC hatO tomL tomM tomH cym perc shaker`) | – (jeder Schlag ist neu) | alle stetigen: `frq pAmt pDec tDec tSpk o2 o2r fmI tfFrq tfQ nFrq nQ nDec mTun mDec cTon cLvl lvl pan drv …` | `wav o2w tfTyp nTyp nCol nBur cTyp` | – |
| North (I2g) | `drum.<Pad-ID>.m<…>` (Nachtrag 6 §ND4) | – | `mFrq mDec mBnd mPit mNfrq mNdec mClv mTlv mNlv mLvl mPan mDst mEqf mEqg …` | `mWav mNtyp mCty mDm mNdm mDty mMono` | – |
| Bit Mask (I2g) | `bm.<a│b>.<…>` (Nachtrag 7 §1.15, z. B. `bm.a.o1.m`, `bm.a.f.cu`) | `bm.a.f.cu`, `.f.re`, `.o1.m`, `.o2.m`, `.n.fr`, `.g.vo` | Hüllkurven, Δ-Werte | `bm.a.f.md`, `bm.a.g.mo`, `bm.ly.md`, LFO-Formen | – |

- **Operator-Index** = Index im Daten-Feld (0–5), Anzeige „OP 1–6“; FELD-Kanten mit den 1-basierten `from`/`to` der Daten. I1 §4.1 benutzt
  dieselbe Schreibweise (gilt für beide; Abgleich über `pv-layout.json`, §5.2).
- **Pfad-Grammatik:** `^[a-z][A-Za-z0-9]*(\.[A-Za-z0-9-]+){0,6}$`, höchstens 48 Zeichen. Tiefste bekannte Pfade: `mk.t.1.p.3.i` (Wurzel + 5),
  `fm6.ops.5.r.3` (Wurzel + 4), `fmx.edge.6-1.amt`, `bm.a.o1.m`, `drum.hatC.mFrq` (I2-02 prüft je Familie den tiefsten).
- **Gespeichert wird der Reglerstand** `x ∈ [0, 1]` in der Kennlinie des Reglers (dieselbe Abbildung wie der Regler zeigt, `toNorm`/`fromNorm`;
  stufig: `x = Index / (n − 1)`), auf 1/1000 gerundet. Der Haupt-Faden rechnet `x` beim Planen in Engine-Einheiten um; das Worklet kennt keine
  Kennlinien.
- **Nicht lockbar:** Master/Busse, Hall-/Echo-Raum, Tempo, Swing (F6); Bend, Rad, Druck (Live-Werte; die Bit-Mask-Clip-Kurven sind eigene
  Daten, §5.10); `fx.drive`, `fx.chorus.mode`, `fx.pumpRel` (Kette wird umgebaut; benannte Ausnahmen).
- **Unbekannte Pfade** (aus neueren Versionen) bleiben gespeichert, wirken nicht und erscheinen schraffiert „unbekannt“.
- **Abdeckung:** Jeder Eintrag aus `PD`, `DPD`, den FM-Tabellen, `normMk`-Bereichen und `fx.*` hat einen `LKT`-Eintrag **oder** steht in
  `LKT_EXC`; die Ausnahmen sind ≤ 5 % aller Einträge und werden im Changelog als Liste ausgegeben (I2-01).

---

#### 4. Daten (Format 5, nur zusätzliche Felder)

```js
// Note (Synth- und Drum-Clips, MELODIE-Clips, eigene Song-Clips S.song.own)
note.lk = {
  tune?, dec?,                         // bleibt: relative Drum-Locks (WP6), nur Drums
  v?: { '<Pfad>': 0..1 },              // NEU: absolute Noten-Locks, höchstens 8 Schlüssel, 1/1000
  k?: 'k<n>'                           // NEU: Klang-Lock, verweist auf clip.kl[].id
}
// Clip
clip.kl = [                             // NEU, höchstens 3; die Klänge liegen IM Clip (Kopieren nimmt sie mit, nichts hängt an der Bibliothek)
  { id: 'k4', n: 'Glocke', e: 'fm6' | 'analog' | 'mk' | 'wt' | 'drum' | 'md' | 'bm',
    s: <Synth-Klang wie track.sound (normalizeSound) | Drum: flaches Slot-Objekt (normDrum-Regeln)>, h: '<Hash>' } ]
clip.klq = 5                            // NEU: nächste Klang-Lock-Nummer dieses Clips (IDs werden nie wiederverwendet); fehlt = 1 + größte vorhandene
clip.ln = [                             // NEU, höchstens 8 freie Reihen
  { p: 'fmx.ops.1.ol', len: 12 /*1..64*/, g: '1/16' /*Q_GRIDS ohne 'aus'*/, sd: <int, Startwert der Chance>,
    st: [ { i: 0, v: .80, c?: .5 /*.05..0.95, fehlt = 100 %*/, r?: 2 /*2..4, fehlt = 1*/ }, … ] } ]   // i < len, sortiert
```

- **`normNoteExtras(src, out, kind)`:** `lk.tune`/`lk.dec` wie heute nur bei `kind === 'drum'`; `lk.v` und `lk.k` bei **beiden** Arten.
  `lk.v`: Pfad-Grammatik §3, höchstens 8 (die ersten 8 in Schlüssel-Reihenfolge), Werte geklemmt 0–1, 1/1000. `lk.k` nur `^k[1-9][0-9]{0,2}$`;
  `normClip` entfernt ihn, wenn `clip.kl` die ID nicht hat. Leeres `lk` wird gelöscht.
- **`normClip`:** `kl` (≤ 3, IDs eindeutig, Klang über `normalizeSound` bzw. Drum-Slot-Regeln, `h` neu berechnet), `klq` (ganze Zahl,
  ≥ 1 + größte ID-Nummer), `ln` (≤ 8, Werte wie oben, Schritte mit `i ≥ len` entfallen). Feste Schlüssel-Reihenfolge. **Ohne diese Felder ist
  die Ausgabe Zeichen für Zeichen wie heute.**
- **`cleanNote` tief kopieren:** `o.lk = {...n.lk}; if (n.lk.v) o.lk.v = {...n.lk.v}` (Befund §0). Clip-Kopie (`cleanClip`, Kopieren/
  Einfügen, Duplizieren, Takt-Aktionen ×2, FANG, `S.song.own`, S1/S2 wenn gebaut) nimmt `kl`, `klq` und `ln` als tiefe Kopie mit.
- **Klang-Lock löschen** ([✕] im Blatt oder in der Mod-Übersicht): entfernt im selben Undo alle `lk.k`-Verweise darauf im Clip. IDs werden
  nie wiederverwendet (`klq` zählt weiter), alte Verweise können also nie still einen neuen Klang spielen.
- **Noten zwischen Clips einfügen:** `lk.k` wird umgesetzt: Hat der Ziel-Clip einen Klang-Lock mit gleichem `h`, zeigt die Note auf ihn;
  sonst wird der Klang-Lock mit neuer ID mitkopiert, solange der Ziel-Clip < 3 hat; sonst entfällt `lk.k` an diesen Noten – das LCD sagt es
  vorher („Ziel-Clip hat schon 3 Klang-Locks – n Noten spielen den Grundklang“). Alles in einem Undo.
- **Kopieren auf eine andere Spur:** Klang-Locks mit einer Engine, die die Ziel-Spur nicht spielen kann (§5.9.6), bleiben gespeichert,
  spielen dort aber den Grundklang; die Noten tragen einen grauen „K“-Hinweis mit Grund.
- **Größe:** ein Lock ≈ 25 Byte; typischer Clip (16 Schritte × 4 Locks) ≈ 1,6 KB; ein Klang-Lock 1–4 KB. Gut für Online-Speichern.
- **Ältere App-Versionen** verwerfen `lk.v`/`lk.k` bei Synth-Noten sowie `kl`/`klq`/`ln` beim Speichern → Versions-Wächter VO-R1 zeigt das
  Hinweisband „neuere Version“; `max_app` muss die I2-Version decken (Xander, Regel 20).

---

#### 5. Klang: DSP und Zeit

##### 5.1 Nachrichten an `dirigent-analog`
- **Note an, ohne Lock und Klang-Lock:** unverändert `[t, 1, id, note, vel, from]` bzw. `[…, d]` (Regel 28, byte-gleich).
- **Note an, mit Lock, Reihen-Startwert oder Klang-Lock:** `[t, 1, id, note, vel, from, d, c, n, i1, x1, …, in, xn]` – `d` Timbre-Maske
  (0 = wie heute), `c` Kern (0 = Hauptkern, 1–8 = Fach), `n` Zahl der Paare (≤ 16: ≤ 8 Noten-Locks + ≤ 8 Reihen-Startwerte), `x` in
  Engine-Einheiten. `i ≥ 0`: Noten-Lock bzw. Klasse-`n`-Wert auf Platz `i`; `i < 0`: **Reihen-Startwert** für Platz `−1 − i`, gilt bis zum
  nächsten Typ-11-Ereignis dieses Platzes im Kern (§5.8). Höchstens **41 Zahlen**. `enqueue` übernimmt den ganzen Rest (heute bei Element 7
  abgeschnitten, §0); es legt dabei wie heute ein Feld je Ereignis an – das geschieht im Nachrichten-Weg, nicht in `process()`.
- **Reihen-Wert (neu, Typ 11):** `[t, 11, 0, c, i, x, r]` – Element 2 ist immer **0** (nie eine Stimmen-ID, §0). `c` = Fach 0–8, `−1` = alle
  Kerne des Index-Raums A, `−2` = alle des Raums M (§5.2). Setzt den Reihen-Wert `i` auf `x` (`NaN` = zurück zum Grundwert), Rampe `r` Samples
  (0 = Sprung).
- **Reihen leeren ab Zeit (neu, Typ 12):** `[t, 12, 0, c]` – wird **sofort in `enqueue`** ausgeführt (wie Typ 4/8, nicht eingereiht) und
  entfernt alle wartenden Typ-11-Ereignisse der Kerne `c` mit Frame ≥ Frame(t). Der Host schickt ihn in derselben Sendung **vor** den
  `NaN`-Rücksetzungen desselben Zeitpunkts.
- **Kill-Filter:** Der Filter von Typ 4 lässt Typ 11 und 12 ausdrücklich stehen (`q[i][1] < 11`), zusätzlich zur ID 0 (I2-65).
- **Fächer** (§5.9): `{kcMake: {c, sp}}` Fach anlegen · `{kl: {c, h, set, fm6, mods, mk, lf}}` Klang ins Fach laden (`lf` = gemalte
  LFO-Tabellen aus I3 §4.2, `[k1 | null, k2 | null]`) · `{klSet: {c, set?, fm6?, mods?, mk?, lf?}}` Live-Änderung (gleicher Weg wie `set`/
  `fm6`/`mk`/`lf` am Hauptkern, inkl. 30-ms-Überblendung) · `{klDrop: c}` Fach leeren, sobald still · Antwort `{klOk: {c, h}}`.
- **Reihenfolge:** Der Host legt Reihen-Ereignisse vor die Noten derselben Zeit; `enqueue` fügt bei gleicher Zeit stabil ein [C].

##### 5.2 Die Je-Stimme-Tabelle `v.pv` (gemeinsam mit I1 §5.4 – diese Definition gilt für beide)
- **Name und Form:** `v.pv = Float32Array(PV_A)` je `AnalogCore`-Stimme (VA, FM DX, FELD) bzw. `Float32Array(PV_M)` je `MkTim`-Stimme
  (MS 2000), angelegt im Konstruktor bzw. beim Fach-Bau, nie je Note. Dazu `v.pvR = Uint8Array(gleiche Länge)` (1 = Reihen-Startwert).
- **Plätze:** zwei Index-Räume **A** und **M**; Platz = `LKT[Pfad].wi`. Die Belegung steht in der eingecheckten Liste **`pv-layout.json`**
  (einmal von `lktBuild()` aus PD/FM/MK-Tabellen erzeugt, geprüft, dann **eingefroren**; neue Schlüssel werden nur hinten angehängt). I1c
  und I2a benutzen **dieselbe Datei**; wer zuerst zusammengeführt wird, bringt sie mit, der andere nimmt sie unverändert (I2-61).
- **Bedeutung:** `NaN` = kein Je-Stimme-Wert → der Kern-Wert gilt (Reihen-Feld `lb`, sonst der I1-Endwert bzw. Grundwert). Endlicher Wert =
  Wert dieser Stimme in Engine-Einheiten.
- **Schreiben beim Anschlag (`startVoice`), feste Reihenfolge:** (1) I1: stufige Werte aus Super-Regler/Zustand (nur wenn I1 dafür einen
  Eintrag hat); (2) I2: die Paare der Note-an-Nachricht überschreiben (Lock schlägt SR-Stufe und Zustand, I1 §5.1). Der Host schickt je
  Platz höchstens **einen** Wert.
- **Lesen:** Klasse `b` in `control()` je Steuer-Block; Klasse `n` einmal beim Start (Hüllkurven-Koeffizienten, Gleiten, Fußlage); die
  stufigen VA-Werte setzen beim Start stimmeigene Felder (`v.oW`, `v.uN`, `v.uG`, `v.ft`, Sub, Sync), die der Stimmen-Code statt der
  Kern-Felder `oW`/`uniN`/`uniG`/`P.ftype` liest – **nur** wenn die Stimme einen stufigen Je-Stimme-Wert hat (Weiche `v.stOn`); sonst liest
  sie die Kern-Felder wie heute (so bleiben auch die WP4-Blende bei Begrenzer-Stufe ≥ 2 und Regel 28 unverändert). Die Felder werden im
  Stimmen-Konstruktor angelegt (`v.uG` = 3 × 7 × 2 Float64 je Stimme, zusammen ≈ 4 KB je Kern).
- **Kern:** Reihen-Feld `this.lb = Float32Array(PV)` (`NaN` = keine Reihe) mit Rampen-Zustand `lbT` (Ziel), `lbN` (Rest-Samples), `lbD`
  (Schritt). Ein Typ-11-Ereignis auf Platz `i` setzt `lb[i]` und löscht bei allen Stimmen des Kerns die Reihen-Startwerte dieses Platzes
  (`pvR[i] = 1` → `pv[i] = NaN`).
- **Weiche:** Zähler `this.lkAny` = Stimmen mit mindestens einem endlichen `pv`-Wert + endliche `lb`-Plätze. Ist er 0, läuft **genau der
  heutige Code** (ein Vergleich am Anfang von `control()`) → bitgleich. Sonst je Platz: `v.pv[k]` → `this.lb[k]` → Kern-Wert (erster
  Nicht-NaN-Wert), Umrechnung wie in `derive()` (z. B. Cutoff Hz → `cutN`).
- **Mono/Legato:** Ein neuer Lock-Wert auf einer weiterlaufenden Stimme gleitet in **5 ms** (lineare Rampe im Steuer-Takt) [A, wie
  V5-Plan „≈ 5 ms“]. Neue Stimmen starten ohne Rampe auf dem Lock-Wert.
- **Stimmenklau:** Der Lock gehört zur Note, nicht zum Stimmen-Platz; `endVoice` setzt `pv` auf `NaN`, `pvR` auf 0 (I2-17).
- **Schutz:** Lock-Werte werden im Haupt-Faden auf `LKT`-Bereiche geklemmt; das Worklet prüft Endlichkeit (`x === x`) und den Platz
  (`0 ≤ i < PV`), sonst wird das Paar verworfen und `lkBad` gezählt (muss in allen Abnahmen 0 sein).
- **Größe:** A-Raum ≈ 240 Plätze × 4 B × 12 Stimmen ≈ 11,5 KB je Kern, M-Raum ≈ 100 Plätze × 4 B × 12 ≈ 4,8 KB (Rechnung); mit den
  stufigen Feldern Grenze ≤ 20 KB je Kern (§5.12).

##### 5.3 VA
- Klasse `b` wie Tabelle §3. Klasse `n` beim Start, auch die stufigen Werte je Stimme (§5.2) – damit braucht „andere Welle auf Schritt 3“
  **keinen** Nebenkern mehr. LFO-Tempo (`l1rate`/`l2rate`) und Mod-Tiefen nur als Reihe auf Kern-Ebene (Klasse `r`, Raum A).
- Struktur (`lq mode eng fmAmp poly reset`) nur über Klang-Lock.

##### 5.4 FM (DX-Seite und FELD)
- **DX (`fm6`):** `fmVoicePatch(v, live, note, vel127)` schreibt je Stimme Operator-Pegel und -Frequenz; Locks auf `fm6.ops.k.ol`, `fine`,
  `det` gehen dort in die Stimmen-Kopie, Hüllkurven (`r`, `l`) als Klasse `n`. Reihen auf diese Pfade rufen je Reihen-Schritt die
  Live-Rechnung (`fmVoicePatch(v, true, …)`) für die klingenden Stimmen des Kerns, höchstens einmal je Steuer-Block.
- **FELD (`fmx`):** `fmxNoteOn(v)` übernimmt Locks auf Pegel, Verhältnis-fein, `fbAmt` und Kantentiefen; Reihen laufen über den
  vorhandenen Live-Weg `ptLive(v, k)` (V4a). OP-Pegel-Sprünge werden über die Rampe (3 ms) geglättet (I2-24).
- **Algorithmus, Verbindungen, Wellen** (`fmxSig`) sind Struktur → Klang-Lock (§5.9). Damit ist „anderer FM-Algorithmus je Schritt“
  möglich, ohne dass sich der Algorithmus der klingenden Nachbarnoten ändert.

##### 5.5 MS 2000 (MkCore)
- `MkCore.noteOn(id, note, vel, d, Paare)`; die `MkTim`-Stimme hält ihre `pv` (Raum M) für die im Steuer-Takt gelesenen Timbre-Werte.
- Die **Mod-Sequenz** (MK6) und PATCH 1–4 rechnen weiter obendrauf (L1). Arp-Töne (MK5) übernehmen `lk` und `k` der gehaltenen Clip-Note,
  aus der sie entstehen (`ARPC.clip` reicht sie durch); der Arp ist immer der der Spur.
- Programm-Ebene (Modus, Timbre-Wahl, Vocoder, Arp-Typ) ist Struktur → nur über Klang-Lock (ohne Vocoder, §5.9.6).

##### 5.6 WT und nativer Weg (`?engine=native`, ECO-Rückfall)
- `spawnVoice` bekommt Locks als **eigene Option `o.lkP`** (`{Schlüssel: Engine-Wert}`); `o.sound` bleibt leer. In `NativeVoice.source/tail`
  wird eine Sicht `PL = Object.assign(Object.create(P), o.lkP)` gelesen, wo heute `P` beim Notenstart gelesen wird. Alle Identitäts-Prüfungen
  (`snd === tr.sound`, LFO-Anschluss `N = …`, Legato `x.P === P`, `FMEV.note`) bleiben auf dem Spur-Klang → **LFOs wirken weiter** (I2-14).
- Freie Reihen nativ auf Cutoff und Pegel (AudioParam `setTargetAtTime` zur Schrittzeit, τ = 1 ms); andere Synth-Ziele erscheinen
  schraffiert „nur mit Worklet“ (`LKT.nat`). Spur-Werte `fx.*` laufen immer nativ (§5.8).

##### 5.7 Drum-Stimme
- `DrumSeq.lockParams(P, lk)`: zuerst `lk.v` (über `DPD`-Kennlinie in Engine-Einheiten), **dann** `tune`/`dec` relativ wie heute. Kosten 0
  (jeder Schlag baut seine Stimme neu). Freie Reihen auf `drum.<Pad-ID>.*` werden am **Schritt des Schlags** (L6: nächster Schritt inkl.
  Mikro-Timing `m`) abgetastet, nicht zur Schlagzeit; der Noten-Lock gewinnt.
- **Klang-Lock** einer Drum-Note: `drumHit` nimmt die Slot-Werte aus `clip.kl[k].s` statt aus dem Pad; Pad-Zuordnung, Choke-Gruppe, Pan der
  Spur und Pumpen-Auslöser bleiben die des Pads, auf dem der Schritt liegt. (Keine Nebenkerne nötig.)

##### 5.8 Freie Reihen: Zeitplan
- `scheduleLanes(i, clip, from, to, late)` läuft in `scheduleTrack` (Synth- und Drum-Zweig) **vor** den Noten, im selben Fenster
  (`LOOKAHEAD` 0,1 s, `TICK_MS` 25).
- **Schritt-Rechnung (D1):** Schrittlänge `sb = GRID[g]`; globaler Schritt `k = floor((B − cs) / sb)` ab Clip-Start `cs`; Reihen-Index
  `j = d1Pos({Ls: len, dir: 'fwd'}, k)` (D1-Funktion, `helfer-n12d1k2`); Durchlauf `pass = floor(k / len)`; Zeit `t = b2t(B + swingOffset(B − cs))`
  (dasselbe Swing wie die Noten). Wie D1: beim Neustart des Clips (Szene, Teil, eigener Clip) beginnt jede Reihe bei Schritt 1; freie Reihen
  laufen nur vorwärts [A].
- **Chance:** `DrumSeq.rand01(sd, pass, j, 1000 + Reihen-Nr.) < c` → Wert, sonst `NaN` (Grundwert). Gleicher Startwert = gleiche
  Entscheidungen in jedem Durchlauf; neues Planen ändert nichts (I2-22).
- **Ratsche** `r ∈ {2, 3, 4}`: Teil-Schritte bei `B + m · sb / r`; gerades `m` = Schrittwert, ungerades `m` = Grundwert [A, F8]. Bei 1/16 und
  120 BPM, r = 4: 31,25 ms je Teil.
- **Rampe:** Klasse `b`/`r` stetig 3 ms (`round(.003 · sampleRate)` Samples); stufige Werte springen am Rampen-Ende.
- **Noten vor ihrem Schritt (L6):** Beginnt eine Note früher als das Reihen-Ereignis ihres Schritts (Aufnahme ohne Raster, Swing-Rundung,
  Drum-`m` < 0) **und** unterscheidet sich der Schrittwert vom gerade geltenden, bekommt sie den Schrittwert als Reihen-Startwert-Paar
  (`i < 0`, §5.1); Klasse `n` als normales Paar. So hört sie ihren Schritt ab dem ersten Sample; das Reihen-Ereignis löst den Startwert ab.
- **Spur-Werte (`fx.*`, Klasse `r`):** nativ über die Knoten von `applyChainFx` (`setTargetAtTime` zur Schrittzeit, τ 1 ms), auf
  Worklet- und nativen Spuren gleich. Mod-Tiefen und LFO-Tempo: Typ 11 im Raum A.
- **Doppelte vermeiden:** gleicher Wert wie der vorige Schritt → kein Ereignis. Rechnerisch höchstens 8 Reihen × 24 Schritte/s (1/32 bei
  180 BPM) × 4 Teile = **768 Ereignisse/s je Index-Raum**; ein Ereignis mit `c = −1/−2` gilt für alle Kerne des Raums (keine Vervielfachung
  durch Fächer).
- **Ende:** `cutTrackAt`/`cancelTrackFrom` senden `[t, 12, 0, c]` und danach je aktivem Platz `[t, 11, 0, c, i, NaN, Rampe]`; Spur-Werte gehen
  nativ auf den Grundwert; ■, Szenenwechsel, Mute, Song-Teilwechsel ebenso.
- **Reihen-Wert in der Anzeige:** `laneAt(i, path, t)` (Haupt-Faden, gleiche Rechnung) für Ring, LCD und Video (VV3).

##### 5.9 Klang-Lock und Nebenkerne

###### 5.9.1 Aufbau
- **Eigenes Feld:** Die Fächer liegen in `this.kc[1..8]` des `dirigent-analog`-Knotens der Spur, **nie** in `ghosts`. Ein Fach wird von
  `kcMake(sp)` gebaut: `Object.setPrototypeOf({}, AnalogCore.prototype)` + `initCore(opt)` – der heutige Konstruktor-Körper wird zur Methode
  `initCore`, die der Konstruktor aufruft (Hauptkern dadurch unverändert, I2-04).
- **Eigener Zustand** (nichts geteilt): `P A F M`, Stimmen-Pool `V` (POOL 12, mit `pv`/`pvR`), `q`, `stack`, `ended`, `tnext` (Kopie),
  `fm`, `gx`, `fr`, `ps`, `msrc/mdst/mamt`, `src/dst`, `oW/oSemi/oRat/oLvl/oPw`, `uniG/uniR/uniN`, `bl/br`, `oL/oR/nL/nR`, `zL/zR`, `dcS`,
  LFO-Zustand, **`ghosts = []` und `spare = []`** (eigene 30-ms-Überblendungen bei Struktur-Änderungen im Klang-Lock), `lb`, eigener
  `MkCore` (2 × `MkTim`) mit Konstruktor-Option `side: true`: **kein** `MkVoc`, kein eigener Effekt-Lauf (`MkFx` wird nicht geladen, also
  kein Echo-Puffer, §5.9.6). `port` = Stummel, der an den Port des Hauptkerns weiterleitet
  (Nachricht mit `c` markiert).
- **Bau nie in `process()`:** nur im Nachrichten-Weg (`{kcMake}`, `{kl}`); Zähler `kcInProc` muss 0 bleiben.
- **Rendern:** Der Stimmen- und Geister-Teil von `process()` wird zur Methode `renderVoices(L, R, N)`; `process()` ruft sie für den
  Hauptkern (gleiche Reihenfolge der Rechnungen → bitgleich) und danach für jedes Fach mit klingender Stimme oder Geist. Auf einer
  MS-2000-Spur gibt **jedes** Fach seine Summe in die Effekt-Eingangssumme des Haupt-`MkCore` (die Effekt-Fahne zählt sie mit), sonst geht
  sie direkt in den Ausgang.
- Eine Struktur-Überblendung (`structXf`/`engXf`) des **Hauptkerns** berührt die Fächer nicht (I2-67).
- **Leerlauf:** Ein Fach ohne Stimme und ohne Geist wird übersprungen (eine Abfrage). **Ohne Klang-Lock** gibt es kein Fach, und `process()`
  läuft wie heute.

###### 5.9.2 Vorrat und Laden (vorab, aus dem ganzen Projekt)
- **Bemessung:** Der Host bildet je Spur die Menge der **verschiedenen** Klang-Lock-Klänge (gleiches `h` = ein Fach) über **alle**
  Behälter der Spur (Szenen-Clips, eigene Song-Clips, Teil-Kopien). Jeder bekommt ein Fach; höchstens 8 je Spur (L4).
- **Wann geladen:** beim Öffnen des Projekts, beim Engine-Wechsel der Spur, beim Anlegen/Ableiten/Bearbeiten eines Klang-Locks, beim Einfügen
  eines Clips. Nicht erst beim Start eines Clips → Szenenstart mit Note auf Schlag 1, Wechsel A→B mit je 3 anderen Klängen und Song-Teilwechsel
  sind ohne Sonderfall abgedeckt (I2-33).
- **Häppchen:** höchstens ein `{kcMake}`/`{kl}` je 20 ms (`setTimeout`-Kette); bei laufendem Transport nur, solange `cpuLoad() < 0,45`,
  nach 2 s Warten trotzdem (ein Bau kostet einmalig ≈ 1 ms).
- **Bereit-Regel statt Rückfall:** ▶, Szenenstart und Song-Start warten, bis alle Fächer der beteiligten Spuren `{klOk}` gemeldet haben
  (höchstens 300 ms nach dem Öffnen; LCD „Klang-Locks laden …“). Wird ein Klang-Lock bei laufendem Transport neu angelegt, plant der Host
  Noten mit diesem Klang-Lock erst nach `{klOk}`; bis dahin **schweigen** sie (`klLate` zählt). Eine Klang-Lock-Note spielt **nie** im
  Grundklang oder einem anderen Klang. Offline-Render lädt vorher (`klReady()`).
- **Entfernen:** Fächer, deren Klang im Projekt nicht mehr vorkommt, bekommen `{klDrop}` und werden still geleert, nie mit klingender Stimme.

###### 5.9.3 Ereignisse über Kern-Grenzen
- **ID-Ereignisse** (2 off, 3 retune, 4 kill, 7 fast-off, 8 cancelRetune) finden ihre Stimme **über alle Kerne** (`findId` durchsucht
  Hauptkern und Fächer; `mk.killId`/`mk.has` in jedem `MkCore`). Kein Ereignis wird nur an den Hauptkern geschickt.
- **Globale Ereignisse** gehen an **jeden** Kern: 5 all-off, 6 panic, Tempo/`tnext`, `mkSong`, `mkWheel`, `mkSeed`, KEYS 9/10 (Key-Sync der
  MS-2000-Mod-Sequenz und LFOs in jedem MS-2000-Kern), `sr` (I1, Super-Regler), Begrenzer-Werte (§5.9.4).
- **Klang-Inhalt** (`set`, `fm6`, `mods`, `mk`, `lf`, `morph`, `morphStop`) geht nur an den Hauptkern; Fächer bekommen `kl`/`klSet`.
- Prüfung: keine hängende Note, wenn ein Off in ein Fach muss; Key-Sync im Fach wie im Hauptkern (I2-69).

###### 5.9.4 Stimmen und Last (nach K2)
- Die Stimmenzahl gilt für die Spur als Ganzes: Haupt- und Fach-Stimmen zusammen ≤ `poly` des Grundklangs. `stealIfFull` wird zur
  Spur-Sicht über alle Kerne, mit **genau der K2-Regel**: Unter einer Begrenzer-Kappe werden nur **ausklingende** Stimmen gekürzt (die
  leiseste nach `aOut` über alle Kerne zuerst); gehaltene Stimmen erst über der eigenen Stimmenzahl (`polyH`), dann die älteste über alle
  Kerne; Blende `STEAL_N` 5 ms. Die Grenze „> 12 Verbindungen → 6 Stimmen“ gilt je FELD-Kern.
- `limited()` (bzw. sein Nachfolger nach der K1-Nachbesserung) wirkt auf **jeden Kern gleich**: `applyLimiter` schickt jedem Fach
  `{klSet: {c, set: limited(kl.s.p)}}` (und `mkLim`), so wie heute dem Hauptkern.
- **Mono/Legato über Kern-Grenzen:** Die alte Note bekommt ihr normales Loslassen, die neue startet im anderen Kern mit Gleiten von der
  letzten Tonhöhe (`from`); Legato ohne Neuanschlag gibt es über Kern-Grenzen nicht (Hinweis im LCD beim Anlegen).

###### 5.9.5 Klang-Lock bearbeiten, auch während er spielt
- **Editor-Ziel:** `ED = {t, kl: null | {clip, id}, c}` (c = 0 Hauptkern, 1–8 Fach). Die Editor-Aufrufstellen lesen den Klang über
  `edSnd(t)` (= `clip.kl[id].s` bzw. `sndOf(t)`); `sndOf` selbst bleibt unverändert (Planer und Engine-Abgleich nutzen weiter den Spur-Klang).
  `wkSet(i, key, v)` sammelt je Kern (`WKSET[i][c]`) und schickt bei `c > 0` `{klSet: {c, set}}`; ebenso `fmxApply` (`fm6`), `mkSetP` (`mk`),
  I3-Malen (`lf`) und das Vorhören (`model.audition` spielt ins Fach).
- **Gemeinsames Fach:** Teilen sich mehrere Klang-Locks (gleiches `h`) ein Fach, bekommt der bearbeitete beim Öffnen von [Bearbeiten] ein
  eigenes Fach (Bau vor dem ersten Dreh), damit andere Clips nicht mitklingen. `h` wird bei [Fertig] neu gerechnet; gleich gewordene
  Klänge werden später still zusammengelegt.
- Stetige Werte wirken im nächsten Block nach Eintreffen; stufige/strukturelle (Welle, Algorithmus) über die 30-ms-Überblendung **des Fachs**.
  Undo-Art **Clip**.

###### 5.9.6 Engines, Effekte und Grenzen des Klang-Locks
- **Erlaubte Engines** [A]: Auf einer `dirigent-analog`-Spur (VA, FM, MS 2000) darf ein Klang-Lock VA, FM (DX/FELD) oder MS 2000 sein;
  WT nur auf WT-Spuren (nativer Weg, §5.9.7); Bit Mask nur auf Bit-Mask-Spuren, Drum/North nur auf der Drum-Spur (I2g). Die Auswahl zeigt nur
  passende Klänge, andere grau mit Grund.
- **Effekte [A, Frage F7]:** Ein Klang-Lock nutzt die **Effekte der Spur**: Spur-Kette (`fx.*`: Drive, Chorus, Hall-/Echo-Send, Lautstärke,
  Pan, Pumpen) und auf einer MS-2000-Spur deren Mod-FX/Delay/EQ. Die eigenen Effekt-Werte des Klangs bleiben gespeichert, werden aber nicht
  gespielt. Ein MS-2000-Klang-Lock auf einer VA/FM-Spur klingt ohne MS-2000-Effekte. Das Klang-Lock-Blatt sagt das (§6.6). So braucht ein Fach
  keinen Echo-Puffer (≈ 2,3 MB, §0).
- **Nicht als Klang-Lock wählbar:** Vocoder-Programme (grau, „braucht einen Eingang“). Der Arp eines MS-2000-Klang-Locks wirkt nicht; es
  gilt der Arp der Spur (§5.5).
- **Struktur-Lock** (z. B. „Algorithmus 5“ auf Schritt 4): erzeugt bzw. nutzt automatisch einen abgeleiteten Klang-Lock „Grundklang ·
  Alg 5“ (Hash-Vergleich, kein Doppel). Ändert man später den Grundklang, bleibt der Klang-Lock so, wie er angelegt wurde (absolut, L1);
  [Neu ableiten] im Klang-Lock-Blatt übernimmt den aktuellen Grundklang mit der Struktur-Änderung (ein Undo).
- **Stopp/Panik:** ■ lässt alle Kerne ausklingen; ■■ und Panik schalten alle Kerne inkl. MS-2000-Effektfahnen in ≤ 50 ms stumm.

###### 5.9.7 Nativer Weg (`?engine=native`, ECO-Rückfall, Worklet nicht da)
- Eine Klang-Lock-Note baut eine native Stimme aus `kl.s` mit der neuen Option `o.klNat` (Ausgang in die Kette **der Spur**, also deren
  Effekte); MS 2000 nativ über `mkEco(kl.s)` (Timbre 1, wie das ECO-Bild der Spur). Spur-LFOs und LFOs des Klang-Locks wirken dort nicht
  (native LFOs hängen an der Spur); das Klang-Lock-Blatt zeigt „LFO nur mit Worklet“ (I2-14).

##### 5.10 Bit Mask und North (Adapter, Paket I2g, erst nach deren Bau)
- **Bit Mask** (`synq-bm`, Nachtrag 7 §2.1): `{t:'on', list:[{n, v, at, d, k?, lk?:[i, x, …]}]}`; Masken-Locks wechseln wie alle Masken
  erst an der Periodengrenze; Klang-Lock = zusätzliche Programm-Plätze `{t:'prog', ab:'k1'|'k2'|'k3', p}`; freie Reihen als
  `{t:'ln', at, k, i, x, r}`. `bmInfo().fallbacks` bleibt 0 (benötigte Masken der Locks werden beim Laden mit angefordert).
- **Bit-Mask-Clip-Kurven** (`cv`: Bend, Rad, Druck, Nachtrag 7 §5.4) sind Spielhilfen, keine `LKT`-Ziele: Sie wirken über die Mod-Plätze als
  Modulation **obendrauf** auf den Lock-/Reihen-Wert (Σ Modulation in I1 §5.1). Eine freie Reihe kann Bend/Rad/Druck nicht zum Ziel haben;
  es gibt darum keinen Vorrang-Streit.
- **North** (`synq-md`, Nachtrag 6 §ND1): `{t:'hit', list:[{ch, at, v, acc, tune, dec, k?, lk?:[i, x, …]}]}`; Strukturwerte wirken je
  Schlag (jeder Schlag startet neu); Klang-Lock = zusätzliches Kanal-Programm `{t:'chk', k, p}`. Reihenfolge absolut → relativ wie §5.7.
- **Bedienfelder:** Auf den Bedienfeldern von Bit Mask und North (Xander 31.10. ~17:00: „alles wie am Gerät“) erscheint **kein** Punkte-Ring;
  Ring nur in der Lock-Leiste (Vorgabe F4).

##### 5.11 Offline, Video, Einfrieren
- Offline-Render (VV1, später FR1) spielt dieselben Nachrichten; alle Fächer werden vor dem Render geladen (`klReady()`), zwei Render
  derselben Folge sind bitgleich.
- **VV3-Haken:** `vv3Knob` und `vv3PlateN` zeichnen den Reglerwert aus `lkValueAt(track, path, t)` (Noten-Lock der klingenden Note bzw.
  Reihen-Wert, sonst Grundwert); `vv3VaState`, `vv3FmState`, `vv3MkState` nehmen für die klingende Note deren aufgelöste Werte
  (`lkResolve(track, note, path, t)`).
- FR1 (Einfrieren): Ändern eines Locks/einer Reihe/eines Klang-Locks im eingefrorenen Clip löst das Neurechnen aus wie eine Notenänderung.

##### 5.12 CPU- und Speicher-Rahmen (iPhone 12 Pro Max)
**Messverfahren M-PAAR (§10):** Worklet im Node-Shim (wie K2 `k2-lib.mjs`), µs je 128er-Block; dieselbe Szene **mit** und **ohne** das
I2-Merkmal abwechselnd, ≥ 20 Paare zu je 10 000 Blöcken; Grenze gilt für die **obere 95-%-Schranke** der mittleren Paar-Differenz. Vorher
A/A-Paare: Ist die halbe Breite des A/A-Intervalls größer als die halbe Grenze, wird die Paarzahl verdoppelt (höchstens 160). Hintergrund:
K2 maß 10–12 µs je VA-Stimme und 14–28 µs je 6-OP-Stimme (Streuung), absolute Prozentpunkt-Grenzen lägen im Rauschen.

| Teil | Grenze |
|---|---|
| ohne Lock/Reihe/Klang-Lock | gleicher Code-Weg und bitgleich (I2-04); Paar-Differenz innerhalb der A/A-Rauschgrenze |
| Noten-Locks VA: 8 Stimmen × 8 Locks | ≤ +3 % gegen dieselbe Szene ohne Locks |
| Noten-Locks FM DX und FELD (6 OP): 8 Stimmen × 8 Locks | ≤ +3 % |
| Noten-Locks MS 2000: 8 Stimmen (2 Timbres) × 8 Locks (Je-Stimme-Werte in `MkTim`) | ≤ +4 % |
| Stufige VA-Werte je Stimme (§5.2), 8 Stimmen mit verschiedenen Wellen | ≤ +3 % gegen gleiche Wellen über `P` |
| Freie Reihen: 8 Reihen, 1/32, Ratsche 4, 180 BPM | Worklet ≤ +5 %; Haupt-Faden ≤ 0,3 ms zusätzlich je Tick (Median); ≤ 768 Ereignisse/s je Index-Raum |
| Fach im Leerlauf | ≤ 2 µs je Block und Fach |
| Fach klingend | n Stimmen im Fach ≤ dieselben n Stimmen im Hauptkern + 5 % |
| Fach-Bau (Nachrichten-Weg) | Median ≤ 1,5 ms (VA/FM) bzw. ≤ 2 ms (MS 2000), Xeon; gemessen für einen **vollen** Kern 0,35–0,8 ms [M]; ≥ 20 ms Abstand; nie in `process()` |
| Speicher | Fach nominal **384 KB** (gemessen ≈ 270 KB Heap + ≈ 50 KB Felder je vollem Kern [M], Rest Puffer); ≤ 8 Fächer je Spur; Projekt ≤ **32 Fächer = 12 MB** [A, F8]; Je-Stimme-Tabellen und -Felder ≤ 20 KB je Kern |
| Nachricht Note an | ≤ 41 Zahlen |
| Haupt-Faden: Ring + Lock-Leiste zeichnen | ≤ 1 ms je Bild, ≤ 30 Bilder/s, nur bei offenem Editor |
| Haupt-Faden: Pinsel-Geste | ≤ 4 ms je `pointermove` (Median), keine Aufgabe > 50 ms |
| Anschlag-Vorhören | ≤ 11 Anspiel-Noten/s, je ≤ 350 ms, höchstens 2 gleichzeitig |

Die Fach-Größe ist eine **feste Nenngröße** (`KC_BYTES`), nicht der freie Speicher des Geräts: Was abgewiesen wird, ist auf jedem Gerät gleich
(offline = live). I2d misst im ersten Schritt die wirkliche Größe eines Fachs (ohne `MkVoc`, ohne Echo) und ersetzt 384 KB durch Messwert
+ 20 %; Projekt-Grenze = 12 MB / Nenngröße (abgerundet; Vorgabe 32). **Gerät:** I2-60 misst mit und ohne die I2-Merkmale (§8). **Unter Last** werden
Locks, Reihen und Klang-Locks nie ausgedünnt; nur die Stimmen-Kappe greift nach §5.9.4.

---

#### 6. Bedienung

##### 6.1 Überblick: wo was erscheint
| Ansicht | neu |
|---|---|
| ROLLE (Synth, MELODIE, eigener Song-Clip) | Füllhöhe, Werkzeug ⇕ Anschlag, Anschlag-Leiste ◀ VEL ▶, [LOCK] in der Werkzeugleiste, Lock-Reihen unter VEL, Lock-Leiste, Pinsel, „K“-Zeichen |
| LAUF (Synth) | ◆-Reiter für Lock- und freie Reihen, [LOCK], Lock-Leiste, Pinsel, ◀ ▶, VEL hörbar, „K“-Zeichen |
| SCHRITTE (Drums) | ◆-Reiter, [LOCK], Lock-Leiste (Pad-Parameter), Pinsel, VEL hörbar, „K“-Zeichen |
| Synth-Editor (VA, FM DX/FELD, WT) | Punkte-Ring an Reglern ≥ 48 px mit Locks, kleine Form darunter; Klang-Lock-Bearbeitung mit Kopfzeile |
| Bedienfelder MS 2000, Bit Mask, North | **kein** Ring auf der Platte (Frage F4); Ring nur in der Lock-Leiste |
| Mod-Übersicht (K1) | Abschnitt „Schritt-Werte“ |

##### 6.2 LOCK-Modus und Lock-Leiste [V]
- **[LOCK]** in der Werkzeugleiste von ROLLE, LAUF und SCHRITTE (Regeln der Leiste §6.9). Tipp → Banner (rot gesäumt, 32 px)
  „LOCK · Schritte antippen oder Regler halten und wischen · **Fertig**“. Endet mit Fertig, Werkzeugwechsel, Reiter- oder Ansichtswechsel,
  Schließen, ■, Szenenwechsel (Regel 6/10).
- Im LOCK-Modus wählt **Tippen** Schritte bzw. Noten aus (mehrere; Tippen schaltet **nicht** an/aus, ROLLE: Werkzeug ruht).
- **Lock-Leiste** unter der Reihen-Fläche, ersetzt solange die Aktionszeile: 6 Regler (SVG 48 px) + **[mehr ▾]** + Aktionen
  **[Lock löschen] [Klang ▾]**. Regler je Engine [A]:
  VA: Cutoff · Resonanz · F-Hüllk. · Amp-Decay · Drive · Fein · FM DX/FELD: Helligkeit · Biss · OP-Pegel (OP-Wahl ‹ › auf dem Regler-Etikett,
  Standard OP 2) · OP-Verhältnis fein · Feedback-Menge (FELD) bzw. OP-Decay (DX) · Amp-Decay · MS 2000 (englisch wie das Bedienfeld,
  H-16 [X]): CUTOFF · RESO · EG INT · OSC2 LVL · OSC1 CTRL1 · EG2 DECAY · WT: Position · Scan · Cutoff · Resonanz · Amp-Decay · Pegel ·
  Drums: die ersten 6 stetigen Werte der SOUND-Seite des gewählten Pads.
  Jeder Regler zeigt den Wert des ersten gewählten Schritts (bzw. den Grundwert grau, wenn der keinen Lock hat). Drehen schreibt den
  Lock auf **alle** gewählten Schritte (ein Undo je Geste); die Lock-Reihe dieses Ziels erscheint als Reiter.
- **[mehr ▾]** = Ziel-Liste: alle `LKT`-Pfade der Engine, gruppiert nach Abschnitten (Osz., Filter, Hüllkurven, OP 1–6, Spur …), Zeilen
  ≥ 44 px, scrollt per Finger, aktueller Wert rechts. Struktur-Ziele tragen „◆ Klang“ (legt einen abgeleiteten Klang-Lock an, §5.9.6);
  Ziele der Klasse `r` tragen „nur Reihe“ (Wahl legt eine freie Reihe an). Nativ nicht wirksame Ziele schraffiert „nur mit Worklet“. Wahl
  ersetzt den Regler, auf dessen Etikett man vorher getippt hat (ohne Markierung den 6. Platz). Die Belegung wird je Engine im Geräteprofil
  gemerkt.
- **[Lock löschen]**: entfernt die Locks des aktiven Ziels (Reiter) auf den gewählten Schritten (ein Undo); ohne Auswahl grau.
- **Halten:** Regler der Lock-Leiste haben im LOCK-Modus **keinen** Halte-Zeitmesser (kein Mod-Picker). Liegt Finger A ≥ 450 ms ohne zweiten
  Finger, zeigt das Banner kurz „Zweiten Finger auf die Schritte“.
- Mod-Modus und LOCK-Modus schließen sich aus.

##### 6.3 Regler als Pinsel [V]
- **Start:** Im LOCK-Modus liegt Finger A auf einem Regler der Lock-Leiste. Setzt Finger B auf einen **Schritt**, eine **Note** (ROLLE) oder
  die Reihen-Fläche → Pinsel, **egal wie lange A schon liegt und ob A dreht**. Setzt B auf eine **freie** Fläche, gilt weiter der Fein-Modus
  wie heute.
- **Malen:** Jeder Schritt, den B überstreicht (Treffer: Zellmitte bzw. ROLLE: Noten, deren Schritt (L6) im Zeitbereich unter dem Finger
  liegt, alle Töne eines Akkords), bekommt den aktuellen Wert des Reglers. Lock-Reihe (an Noten): nur Schritte mit Note; leere Schritte blinken
  grau. Freie Reihe: jeder Schritt. Erneutes Überstreichen überschreibt.
- **Rampe:** Der Pinsel malt immer den **aktuellen** Reglerwert. Dreht A während des Malens (senkrecht, `PX_FULL` 200 px, Fein-Modus wie
  heute bei ≥ 64 px waagrechtem Versatz), bekommen die folgenden Schritte den neuen Wert; der Schritt unter B wird sofort mitgeführt
  (Frage F8 c).
- **Rückmeldung:** gemalte Zelle leuchtet 150 ms in der Spurfarbe, Regler mit Pinsel-Rand, LCD „Pinsel · Cutoff 1,2 kHz · 7 Schritte“ –
  das ist die Haupt-Rückmeldung. **Haptik** „tick“ je neu gemaltem Schritt (höchstens 1 je 30 ms, `haptic`) nur **wenn möglich**: Der iOS-Weg
  über das Schalter-Etikett ist aus `pointermove` nicht sicher (§0); geprüft wird am Gerät (§13). Transport steht → der Schritt unter B wird
  mit seinem Lock vorgehört, wenn B ≥ 150 ms darauf ruht; Transport läuft → kein Vorhören (man hört es im nächsten Durchlauf).
- **Ende:** Beide Finger oben → **ein** Undo „Locks malen · Cutoff · 7 Schritte“. B darf abheben und neu ansetzen, solange A liegt (gleiche
  Geste). `pointercancel` (iOS-Systemgeste) nimmt die ganze Geste zurück.
- **ROLLE:** Während des Pinsels ist der Zwei-Finger-Zoom der Rolle aus (A liegt außerhalb der Rolle, B wird an den Pinsel geleitet,
  `opts.reg`); das Werkzeug der Rolle wirkt nicht.

##### 6.4 Punkte-Ring [V]
- Um jeden Regler, dessen Pfad im **Bezugs-Clip** Locks oder Werte einer freien Reihe hat. **Lage:** Kreis **r 29** (die Spur des
  Halte-Rings; während eines Halte-Fortschritts außerhalb von LOCK ist der Ring kurz ausgeblendet), Schritt 1 oben, im Uhrzeigersinn. Punkte
  im 56er-Raster: gefüllt Ø 2,4 (Spurfarbe) = Lock bzw. Reihenwert; Ring Ø 1,8 (Strich 0,6, grau) = Note ohne Lock; blass (25 %) = kein
  Schritt. Der ganze Ring liegt innerhalb r ≤ 30,5; erlaubter Bereich der Mitte r 28,8–29,5 (M-PLATZ entscheidet). Laufender Schritt:
  weißer Rand (nur bei ▶, ≤ 30 Bilder/s).
- **Punkte-Zahl:** so viele wie Schritte je Takt im Raster des Editors, höchstens 16 (1/32 → 16 Punkte, je 2 Schritte; 1/16T → 12).
- **Mindestgröße:** Ring nur an Reglern mit SVG ≥ 48 px (Lock-Leiste 48 px, Synth-Editor 60 px). **Kleinere Regler** (Drum-Blätter 28–34 px)
  zeigen stattdessen ein **◆** (8 px, Spurfarbe) rechts oben innerhalb des Regler-Kastens; Berühren zeigt im LCD „◆ 4 Schritte gelockt“.
- **Platz (Pflicht, M-PLATZ):** Abstand ≥ 1 px zwischen Ring und der Schrift des Etiketts bzw. des Werts (Text-Kasten über `Range`), ≥ 2 px
  zum Ring des Nachbarn, bei jeder benutzten Reglergröße und in allen Formaten. Reicht es nicht, wird der Ring-Radius verkleinert (bis
  r 28,8), nie das Etikett verschoben; reicht auch das nicht, gilt an diesem Regler die kleine Form ◆. Lock-Leiste bei 375 px hochkant:
  Spalte ≈ 58 px, Ring Ø ≈ 52 px → 6 px Luft.
- **Bezugs-Clip:** im Editor der offene Clip; im Synth-Editor der Clip der gewählten Spur in der gewählten Szene, sonst der spielende Clip.
  **Takt:** im LAUF die Seite, in der ROLLE der Takt am linken Rand bzw. bei ▶ der laufende Takt; mehr als 1 Takt → kleine Ziffer „2/4“
  unter dem Regler (Schrift wie Regler-Wert).
- Nur Anzeige, keine Trefferfläche. Aktualisierung ≤ 1 Bild nach jeder Änderung.
- Freie Reihe mit eigener Länge: der Ring zeigt die Reihen-Werte, die in diesem Takt **gelten** (Wiederholungen eingeschlossen).

##### 6.5 Lock-Reihen und freie Reihen im Sequencer [V]
- **Reiter:** In der Reiter-Zeile (ROLLE unter VEL als Umschalter `VEL │ ◆ Cutoff │ ◆ OP 2 Pegel │ ◆ +`, LAUF/SCHRITTE wie die übrigen
  Lanes) erscheint je Ziel mit Locks ein Reiter „◆ <Name>“; „◆ +“ öffnet die Ziel-Liste (§6.2). Mehr Reiter als Platz → die Zeile scrollt
  per Finger, der aktive bleibt sichtbar. Ein Reiter ohne Werte verschwindet beim Schließen.
- **Lock-Reihe (an Noten):** Fläche wie die vorhandenen absoluten Lanes: Grundwert als grauer **Geist** je Schritt, „kein Lock“ = leere
  Raute, Ziehen auf einem Schritt ohne Lock beginnt beim Geist (V5-Plan). Kein Doppeltipp im Editor.
- **Freie Reihe:** Rechts in der Reiter-Zeile **[⋯]** (44 × 44) = Reihen-Optionen der aktiven Reihe als Popover:
  `Reihe [An Noten │ Frei]` · `Länge ‹ 12 ›` mit Länge-Regler (1–64, wie D1-Blatt) · `Raster [1/32 1/16 1/16T 1/8 1/8T 1/4]` ·
  `Ebene [Wert │ Chance │ Ratsche]` · [Reihe löschen] (I3 ergänzt hier [Aus Form …]). Umschalten An Noten → Frei übernimmt die Werte der
  Noten-Schritte als Reihen-Schritte (ein Undo), Frei → An Noten schreibt die Werte in die Noten der passenden Schritte (Schritte ohne Note
  gehen verloren, das Popover sagt vorher „3 Werte ohne Note entfallen“).
- **Anzeige der freien Reihe:** Die Fläche zeigt die Schritte der aktuellen Seite; Schritte jenseits der ersten Reihen-Runde zeigen die
  Wiederholung blass (60 %) mit dünnem Strich an jedem Rundenbeginn; am Reihen-Ende steht eine **gezeichnete Klammer ┃** (wie D1, **nicht
  ziehbar**: Wischen malt; Länge im Popover; Frage F11). Bearbeiten einer Wiederholung ändert ihren Ursprungs-Schritt (alle Wiederholungen
  folgen sichtbar).
- **Ebenen:** Wert = senkrechte Balken absolut wie die vorhandenen Lane-Flächen; Chance = 5–100 % (wie CHANCE der Drums);
  Ratsche = 1×–4× (wie WIRBEL). Im LAUF/in SCHRITTEN wirkt senkrechtes Ziehen auf einem Schritt auf die aktive Ebene.
- **„K“-Zeichen** für Klang-Lock: LAUF/SCHRITTE oben links in der Zelle („K4“ = Nummer der ID, Bernstein, 10,5 px wie `.ln`), ROLLE als
  Buchstabe links im Notenblock (ab 18 px Breite).

##### 6.6 Klang-Lock-Blatt [V]
- LOCK-Modus, Schritte gewählt → **[Klang ▾]** → Popover „Klang für 3 Schritte“: `Grundklang` · `K4 Glocke ✓` · `K5 …` ·
  `+ Aktueller Klang` · `+ Aus Bibliothek …` (öffnet den Klang-Browser im Wahl-Modus, nur passende Engines; Vocoder-Programme grau) · je
  Eintrag [Bearbeiten] [Neu ableiten] (nur bei abgeleiteten) [✕]. Unter der Liste eine Zeile **„Effekte: die der Spur“**, bei einem Klang
  mit eigenen Effekten zusätzlich „eigene Effekte von ‚Glocke‘ werden hier nicht gespielt“ (F7). Vierter Eintrag grau „höchstens 3
  Klang-Locks je Clip“; 9. verschiedener Klang der Spur bzw. voller Speicher-Rahmen grau mit Grund. Jede Wahl ein Undo; [✕] löscht auch die
  Verweise (§4).
- **[Bearbeiten]** öffnet den Synth-Editor auf dem Klang-Lock (Editor-Ziel §5.9.5): Kopfzeile „Synth 2 · Klang-Lock K4 · Glocke“ mit
  Bernstein-Rahmen, [Fertig] kehrt zurück. Änderungen gehen in `clip.kl[…].s` (Undo-Art Clip) und sind **sofort hörbar**, auch während der
  Klang-Lock spielt. Vorhören über die Tastatur spielt im Fach.
- **Algorithmus je Schritt:** Ziel-Liste → „Algorithmus ◆ Klang“ öffnet die Algorithmus-Wahl des FM-Editors als Popover; Wahl = abgeleiteter
  Klang-Lock für die gewählten Schritte. FELD: „Verbindungen ◆ Klang“ öffnet das FELD auf einer Kopie (Klang-Lock-Bearbeitung).

##### 6.7 Anschlag sehen, ziehen, hören (Xanders Wunsch 31.10.) [V]
- **Füllhöhe (ROLLE):** Notenblock = Rahmen 1,5 px Spurfarbe, Innenfläche Spurfarbe 18 %, von unten gefüllt bis `Höhe · v` (mindestens
  2 px) in voller Spurfarbe (Farbe ändert sich nicht mit dem Anschlag, Frage F2). Ersetzt die heutige Deckkraft-Kodierung.
  **Notenname:** Liegt die Mitte seines Text-Kastens im gefüllten Teil, ist er dunkel (`#0a0b0d`), sonst weiß; immer mit 1-px-Saum in der
  Gegenfarbe; Kontrast ≥ 4,5 : 1 gegen den Teil unter der Kasten-Mitte (I2-47). Die gewählte Note markiert zusätzlich ihre Taste links in
  der Klaviatur in derselben Füllhöhe (Frage F2).
- **LAUF/SCHRITTE:** Die Zellen zeigen bei aktivem VEL-Reiter die Füllhöhe schon heute (`.f`); neu ist nur das Hören (unten).
- **Werkzeug ⇕ „Anschlag“** in der Werkzeug-Gruppe der ROLLE `[✎][⬚][⇕][⌫]` (aria-label „Anschlag“, Trefferfläche §6.9):
  Tippen auf eine Note = wählen und hören (ist sie Teil einer Auswahl, bleibt die Auswahl). Senkrecht ziehen auf der Note (nach 4 px) =
  Anschlag relativ: **eine** Zieh-Skala für Note und VEL-Feld: `PX_FULL` 200 px = Wert 0→1, Fein-Modus ×¼ ab 64 px waagrechtem Versatz;
  alle gewählten Noten ändern sich um dasselbe Δ (je für sich geklemmt 0,05–1,00). Blase am Finger „VEL 96“ (6–127 wie heute). Ein Undo je
  Geste, Bezeichnung „Anschlag“. Notenverschieben ist in diesem Werkzeug aus.
- **Sofort hören:** Bei jeder Änderung um ≥ 2 VEL-Stufen spielt die berührte Note (bzw. die erste gewählte) mit dem neuen Anschlag
  über `model.audition`: Länge min(Notenlänge, 350 ms), höchstens alle 90 ms, höchstens 2 gleichzeitig (die älteste endet). Haptik (wenn
  möglich) „tick“ alle 8 Stufen, „snap“ bei **VEL 127** und **VEL 6** (Grenzen der Klemmung, §0). Dasselbe Hören gilt für die VEL-Leiste der
  ROLLE, den VEL-Reiter im LAUF (`onValue` → `laufHear`) und in SCHRITTEN (`model.audition(i, v)` beim Ziehen).
- **Anschlag-Leiste:** Ist ⇕ aktiv, zeigt die Aktionszeile `[◀] [VEL 96 ⇕] [▶]` (44 + ≥ 96 + 44 px). ◀ ▶ wählen die vorige/nächste Note
  (Reihenfolge: Startzeit, dann Tonhöhe aufsteigend; Akkordtöne einzeln), spielen sie und holen sie ins Bild (`centerIfHidden`); am Anfang
  bzw. Ende ist der Knopf blass. Das Feld „VEL 96“ ist ein senkrechter Zieh-Regler mit derselben Skala (200 px) für die gewählte(n) Note(n).
  LAUF: dieselben ◀ ▶ in der Aktionszeile, sobald ein Schritt gewählt ist (`LAUF.sel ≥ 0`).
- Die Anschlag-Grunddynamik bleibt „Spielweise“ und kein Mod-Eintrag (K1-Antwort 4 [X]); es gibt keinen eigenen Anschlag-Lock
  (Xander: „nur Brainstorming“). „Velocity-Ziel einfacher“ ist hier nicht enthalten (F10).

##### 6.8 Mod-Übersicht (K1)
- Neuer Abschnitt „Schritt-Werte“ unter den Modulationen, nur wenn es welche gibt: je Ziel eine Zeile „◆ Cutoff · 5 Schritte · Szene 2“,
  „◆ OP 2 Pegel · freie Reihe 12“, „◆ Hall · freie Reihe 8 (Spur)“ bzw. „Klang-Lock K4 Glocke · 3 Schritte“. Tipp = öffnet den Editor im
  LOCK-Modus auf diesem Reiter; [✕] (44 × 44) entfernt alle Locks dieses Ziels im Clip bzw. die Reihe bzw. den Klang-Lock samt Verweisen
  (ein Undo). Was im Ring leuchtet, hat hier eine Zeile.

##### 6.9 Formate und Maße
- Prüf-Formate (M-PLATZ, echte App-Schrift): **P1** 390×844, **P2** 375×667, **P3** 320×568, **L1** 844×390, **L2** 667×375, **W** 926×428
  und Xanders **428×926**.
- Alle neuen Knöpfe, Reiter, Listenzeilen ≥ 44 × 44 (Ring-Punkte sind keine Trefferflächen). Lock-Leiste hochkant: 6 Regler in einer Reihe
  (Spalte ≥ 52 px, SVG 48 px), bei P3 2 Reihen à 3 in derselben Höhe wie die Aktionszeile + Reihen-Fläche, kein Höhen-Sprung; quer: eine Reihe
  rechts neben der Reihen-Fläche. Blatthöhe vor/nach LOCK, ⇕, Reiterwechsel, Popover, Klang-Lock-Bearbeitung ± 0 px.
- **Werkzeugleisten:** Die vorhandenen Werkzeugleisten der ROLLE und von SCHRITTE dürfen wie heute seitlich scrollen (N1/D1-Befund).
  [LOCK] und ⇕ müssen erreichbar sein (per Wischen ins Bild), Trefferfläche ≥ 44 px breit und so hoch wie die vorhandene Leiste (36–44 px,
  N1-Befund). Die Leisten werden **nicht** höher gemacht; dafür gilt die offene N1-Frage „Editor-Leisten höher für 44-px-Tasten?“.

---

#### 7. Zusammenspiel mit Bestehendem und Geplantem

| Funktion / Paket | Wirkung von I2 | Prüfen |
|---|---|---|
| `scheduleTrack`, `scheduleDrums`, `spawnClipVoice`, `spawnVoice` (`o.lkP`, `o.klNat`), `spawnWkVoice`, `drumHit`, `DrumSeq.expandStep` | tragen `lk`/`k` weiter; `scheduleLanes` davor | I2-04, I2-20 |
| `SynthHost.track` (`E.on`, neues `E.lane`, `E.kl`), Worklet `enqueue`, `runEvents`, `startVoice`, `control`, `endVoice`, `findId`, `stealIfFull`, `fmVoicePatch`, `fmxNoteOn`, `ptLive`, `MkCore.noteOn`, neu `initCore`, `renderVoices`, `kcMake` | §5 | I2-07 … I2-36, I2-61 … I2-72 |
| Editoren (`edSnd`, `wkSet`, `fmxApply`, `mkSetP`, Vorhören) | Editor-Ziel für Klang-Locks | I2-68, I2-73 |
| `normNoteExtras`, `normClip`, `cleanNote`, `cleanClip`, `pushUndo`, `clipChanged`, Kopieren/Duplizieren, `S.song.own`, FANG | §4 | I2-02, I2-03, I2-05, I2-71 |
| `cutTrackAt`, `cancelTrackFrom`, `switchTrackAt` (rückwirkend), Panik, ■■ | Reihen enden, Typ 12, Fächer still | I2-25, I2-35 |
| CPU-Begrenzer `cpuTick`/`limited`/`applyLimiter`, `cpuLoad`, `perfProbe` (MK1) | gleiche Wirkung auf alle Kerne; I2-Probe | I2-33, I2-60, I2-72 |
| Arp (MK5, `ARPC.clip`) | Arp-Töne erben `lk`/`k` | I2-11 |
| MS-2000-Mod-Sequenz (MK6) | rechnet obendrauf | I2-11 |
| Eine Skala, Transponieren, ⇅, Quantisieren | Locks hängen an der Note und wandern mit; freie Reihen bleiben | I2-04 |
| MIDI-Export | unverändert; Anschlag wie gespeichert | I2-52 |
| K1 Mod-Übersicht (`k1Mods`, `k1JumpPath`) | Abschnitt „Schritt-Werte“; MS-2000-Pfade = `mk.` + K1-Pfad; Begrenzer-Nachbesserung (K1-Antwort 2) steht aus | I2-43 |
| **K2** (`helfer-n12d1k2`) | Stimmenklau über alle Kerne nach `stealIfFull`/`polyH`/`STEAL_N` (§5.9.4); Hüllkurven-Rechnung war richtig | I2-32 |
| **D1** (`helfer-n12d1k2`) | freie Reihen nutzen `d1Pos`; Klammer gezeichnet, nicht ziehbar; `clip.lanes` (D1) und `clip.ln` (I2) sind getrennte Felder | I2-19 |
| **N1** (`helfer-n12d1k2`) | Spiegeln/Umdrehen: Locks bleiben an ihren Noten; freie Reihen unverändert | I2-03 |
| **N2** (Mini-Karte beim Ziehen) | Pinsel und Anschlag-Werkzeug zeigen keine Mini-Karte (kein Ziehen von Noten) | – |
| G8 (Clips bis 64 Takte, `stage-ges`) | Ring blättert taktweise; Reihen ≤ 64 Schritte unabhängig von der Clip-Länge | I2-40 |
| VV1/VV2/VV3 (Video) | gleiche Nachrichten offline; VV3: `vv3Knob`, `vv3PlateN`, `vv3VaState`/`vv3FmState`/`vv3MkState` über `lkValueAt`/`lkResolve` | I2-36 |
| FR1 (Einfrieren, geplant) | Lock-Änderung = Neurechnen | – |
| S0/S1/S2 (Teile) | Teil-Kopien tragen `lk`, `kl`, `klq`, `ln` | I2-03 |
| **I1 Super-Regler / V6a Morph** | Endwert-Formel **nur** in I1 §5.1; I2 liefert `Lock_k`; gemeinsame `v.pv` und `pv-layout.json` (§5.2); `sr` an alle Kerne, `morph` nur Hauptkern; F3 nur hier | I2-09, I2-61 |
| **I3 Mal-LFO** | `lanePut(t, s, path, werte[], {len, g})` und `lockPut(t, s, path, werte[], {g})` (beide I2a, ein Undo, Art Clip); `{kl}`/`{klSet}` tragen `lf` | I2-02 |
| **I4 Tipp-Summen** | erzeugte Noten haben normalen Anschlag; nachträglich mit ⇕ bearbeitbar | – |
| **G9 Songtext** | kein gemeinsames Bauteil (G9 §8: „kein Berührungspunkt“); ◀ ▶ hier eigenständig | – |
| Bit Mask (Nachtrag 7), North (Nachtrag 6) | Adapter I2g nach BM2/BM6 bzw. ND1/ND4; Clip-Kurven wirken obendrauf; kein Ring auf deren Platten | I2-53 … I2-55 |

---

#### 8. Teilpakete

Jedes Teilpaket mit Changelog-Abschnitt, Snapshot, „Bitte prüfen“-Liste (Regel 22) und Fragen; Tests schlank (Abnahme + gezielte
Regression der Nachbarn).

##### I2a — Adressen, Daten, gemeinsame Tabelle, Endwert-Kern
**Ziel.** Eine Adress-Tabelle für alle Engines, eine Platz-Liste für I1 und I2, sichere Daten. **Umfang.** §3, §4, §5.2 (Liste und
Größen), Endwert-Rechnung im Haupt-Faden (`lkResolve(track, note, path, t)`, `lkValueAt`, `laneAt`), Test-API `lkGet(t, s)`,
`lkSet(t, s, i, path, x)`, `laneSet(t, s, def)`, `lanePut(t, s, path, werte[], {len, g})`, `lockPut(t, s, path, werte[], {g})`,
`lkInfo()` ({paths, lkBad, klLate, kerne, faecher, bytes}). **Dauer** 5–6 h · **Budget** +13 KB.
- [ ] **I2-01** Abdeckung: Skript zählt alle Einträge aus PD, DPD, FM-Tabellen, `normMk`-Bereichen und `fx.*` sowie alle Regler mit `data-key`
  in VA, FM DX/FELD, WT, MS 2000, Drum SOUND/TIEF → jeder hat einen `LKT`-Eintrag mit Klasse, Bereich, Kennlinie, Name **oder** steht in
  `LKT_EXC` mit Grund; Ausnahmen ≤ 5 %, Liste im Changelog. Klasse `s` deckt `lq mode eng fmAmp poly reset` und alle `fmxSig`-Teile; die
  stufigen VA-Werte sind Klasse `n`; `fx.vol/pan/rev/dly/pump/chorus.mix/rate/depth` sind Klasse `r`.
- [ ] **I2-02** Normieren: 1000 Zufalls-Clips mit `lk.v`, `lk.k`, `kl`, `klq`, `ln` → Grenzen L4 eingehalten, Werte 0–1 auf 1/1000, unbekannte
  Pfade erhalten, `lk.k` ohne `kl`-Eintrag entfernt; Speichern → Laden deep-equal; je Familie der tiefste Pfad (`mk.t.1.p.3.i`,
  `fm6.ops.5.r.3`, `fmx.edge.6-1.amt`, `bm.a.o1.m`, `drum.hatC.mFrq`, flach `cutoff`) übersteht Speichern → Laden; `lanePut` und `lockPut`
  schreiben je mit einem Undo (Art Clip), `lockPut` nur auf Schritte mit Note.
- [ ] **I2-03** Kopien: `cleanNote`-Kopie ändern lässt das Original deep-equal (tiefe Kopie von `lk.v`); Kopieren/Einfügen, Duplizieren, ×2,
  FANG, eigener Song-Clip, Teil-Kopie tragen `lk`, `kl`, `klq`, `ln` deep-equal; N1 Spiegeln/Umdrehen lässt `lk` je Note deep-equal.
- [ ] **I2-04** **Regel 28:** Demo-Projekt, alle Werks-Klänge und alle Projekte in `synq-snapshots/` gegen den Vorgänger-Stand: normalisiertes
  JSON Zeichen für Zeichen gleich, Ereignis-Mitschnitt an die Worklets byte-gleich, kein Fach, kein Typ-11/12-Ereignis, Offline-Render
  bitgleich (M-NULL = −∞) – auch nach dem Umbau `initCore`/`renderVoices`.
- [ ] **I2-05** Undo/Redo jeder Aktion aus I2a–I2f einzeln, `historyCheck()` = true, „geändert“-Punkt sofort (Regel 7).
- [ ] **I2-06** Vorgänger-Version öffnet ein I2-Projekt ohne Fehler, Hinweisband VO-R1 sichtbar; zurück in der neuen Version deep-equal.
- [ ] **I2-61** Gemeinsame Liste: `pv-layout.json` ist eingecheckt; `lktBuild()` erzeugt daraus bei jedem Start dieselben `wi` (Abgleich
  Zeichen für Zeichen); I1c (wenn zusammengeführt) benutzt dieselben Plätze (Test liest beide Seiten).

##### I2b — Noten-Locks im Klang
**Ziel.** Jeder Lock wirkt hörbar und genau auf seine Note. **Umfang.** §5.1–5.7 (VA inkl. stufiger Werte je Stimme, FM DX/FELD, MS 2000,
WT/nativ, Drum-Stimme), Schritt-Zuordnung L6. **Dauer** 10–12 h · **Budget** +16 KB (davon ≈ 10 KB ASCII im Worklet).
- [ ] **I2-07** VA, Grundwert Cutoff 500 Hz, Lock 2 kHz auf Schritt 3 (LAUF 1/16, 120 BPM, F-Hüllk. 0, LFO aus): M-LOCK der Stimme =
  2 kHz ± 0,5 %; M-SP dort +2 Okt ± 0,1; übrige Schritte ≤ 0,05 Okt gegen ohne Lock.
- [ ] **I2-08** Nachricht: Note mit 8 Lock-Paaren + 8 Reihen-Startwerten (41 Zahlen) kommt vollständig an (`enqueue` schneidet nicht ab);
  `lkBad` = 0; ein Paar mit `NaN` bzw. Platz außerhalb → verworfen, `lkBad` = 1.
- [ ] **I2-09** Endwert nach I1 §5.1 (Vorgabe F3): (a) LFO 2 Hz mit Key-Sync → Cutoff schwankt auf dem gelockten Schritt weiter (≥ 0,3 Okt
  innerhalb der Note); Regler drehen ändert keinen Lock; LCD „n Schritte gelockt“. Nach I1 (wenn zusammengeführt): (b) Super-Regler mit
  Δ = +0,2 auf `cutoff` → gelockter Schritt `toNorm(Endwert) − Lock` = 0,200 ± 0,002 (M-LOCK), ungelockte ebenso +0,2; Wellen-Lock bleibt
  gegen eine SR-Stufe; (c) Klangzustand-Fahrt (V6a) lässt den gelockten Schritt auf dem Lock-Wert (Render gegen ohne Fahrt ≤ −90 dB);
  (d) Klang-Lock-Stimme: Zustand wirkt nicht, SR wirkt auf gleiche Schlüssel.
- [ ] **I2-10** FM: OP-2-Pegel-Lock (DX und FELD, 6 OP) → Operator-Pegel (`fmxLv`) = Soll ± 1 dB; Helligkeits-Lock M-SP ≥ ⅓ Okt (Grund 0,3,
  Lock 0,8); OP-Hüllkurven-Lock (Klasse `n`) T60 je Note ± 10 %, auch mit 6 aktiven Operatoren.
- [ ] **I2-11** MS 2000: `mk.t.0.f.cut` Grund ≈ 500 Hz, Lock ≈ 2 kHz → M-SP +2 Okt ± 0,15; Mod-Sequenz (Key-Sync) auf Cutoff rechnet
  obendrauf (Schwankung wie ohne Lock ± 10 %); Arp-Töne aus einer gelockten Clip-Note tragen den Lock; Patch-Lock `mk.t.0.p.0.i` wirkt.
- [ ] **I2-12** Hüllkurven-Lock `aD` je Note: Abklingen je Note = Soll ± 10 %; Nachbarnoten unverändert.
- [ ] **I2-13** Mono-Legato-Wechsel zwischen zwei Lock-Werten: Übergang 5 ± 1 ms, M-KLICK ≤ 6 dB.
- [ ] **I2-14** Nativ (`?engine=native` und WT): alle flachen Locks wirken beim Notenstart (Cutoff, Pegel, Hüllkurve gemessen); **LFO 2 Hz auf
  Cutoff schwankt auf der gelockten Note weiter** (≥ 0,3 Okt); Legato-Erkennung wie ohne Lock; Klang-Lock-Note nativ = Stimme aus `kl.s`
  durch die Spur-Kette (Pegel ± 1 dB gegen Vorhören desselben Klangs), Hinweis „LFO nur mit Worklet“; Reihen-Ziele ohne AudioParam
  schraffiert; keine Konsolenfehler.
- [ ] **I2-15** Drum-Stimme: `drum.snare.tDec`-Lock → T60 ± 10 %; Reihenfolge: `drum.kick.frq`-Lock + TUNE +12 auf demselben Schritt →
  Grundfrequenz = Lock-Wert × 2 ± 5 ct; WP6-T-Tests unverändert grün.
- [ ] **I2-16** Neunter Lock einer Note wird abgewiesen, LCD nennt den Grund; Daten unverändert.
- [ ] **I2-17** Stimmenklau: geklaute Stimme gibt ihren Lock nicht an die neue Note weiter (Render der neuen Note = ohne Lock ≤ −90 dB).
- [ ] **I2-18** CPU nach §5.12 (VA, DX, FELD, MS 2000, stufige Werte je Stimme) mit M-PAAR; kein GC-Ereignis in 60 s Node-Shim, Heap ± 1 MB.
- [ ] **I2-63** Stufige VA-Werte je Stimme: Welle-Lock (Säge → Puls) auf Schritt 3 → nur diese Note mit Puls (Spektrum), Nachbarnoten im selben
  Kern bitgleich zu ohne Lock; Filtertyp- und Unison-Lock ebenso; kein Fach entsteht.
- [ ] **I2-64** Schritt-Zuordnung: Note 10 ms vor Schritt 5 (Reihe auf Cutoff, Schritt 4 ≠ Schritt 5) hat ab dem ersten Sample den Wert von
  Schritt 5 (M-LOCK); danach übernimmt das Reihen-Ereignis ohne Sprung (M-KLICK ≤ 6 dB); Drum-Schlag mit `m = −0,3` wird am eigenen Schritt
  abgetastet.

##### I2c — Freie Reihen (FM-Spuren) mit Länge, Chance, Ratsche
**Ziel.** „OP 2 Pegel“ & Co. laufen im gewohnten Sequencer, eigenständig. **Umfang.** §5.8, Worklet Typ 11/12, Haupt-Faden
`scheduleLanes`, Spur-Werte nativ. **Dauer** 5–7 h · **Budget** +10 KB.
- [ ] **I2-19** Polymeter: Reihe Länge 12 (1/16) gegen Clip 16 Schritte → Werte-Muster wiederholt sich alle 12 Schritte, nach 48 Schritten
  wieder deckungsgleich (Ereignis-Mitschnitt); Schritt-Index = `d1Pos` (gleiche Funktion wie D1).
- [ ] **I2-20** Zeit: Reihen-Ereignisse offline ± 1 Sample am Soll, mit Swing gleicher Versatz wie die Noten ± 1 Sample; live 32 Takte
  `late` = 0 (M-ZEIT).
- [ ] **I2-21** Eine Note, die mit einem Reihen-Schritt beginnt, hat ab ihrem ersten Steuer-Block den Reihen-Wert (Abfrage + Render).
- [ ] **I2-22** Chance 50 % → 50 ± 10 % Treffer über 200 Durchläufe; zwei Läufe mit gleichem Startwert identisch; Planen mit anderem Fenster
  (`tickAhead(.3)`) ändert keine Entscheidung.
- [ ] **I2-23** Ratsche 4 auf 1/16 bei 120 BPM → 4 Teile à 31,25 ms ± 1 Sample, abwechselnd Wert / Grundwert.
- [ ] **I2-24** Glätten: OP-Pegel-Sprünge 0 ↔ 99 auf 1/32 (FELD, DX) → M-KLICK ≤ 6 dB; Rampe 3 ms ± 0,2 ms; stufige Werte springen am
  Rampen-Ende.
- [ ] **I2-25** Ende: Clip-Stopp, ■, Szenenwechsel, rückwirkendes Umschalten (`switchTrackAt` mit `beat < R.schedBeat`) → Grundwert nach
  ≤ 3 ms, keine verspäteten Reihen-Werte (Typ 12 wirkt, danach die `NaN`-Rücksetzungen stehen).
- [ ] **I2-26** CPU nach §5.12 (8 Reihen, 1/32, Ratsche 4, 180 BPM) mit M-PAAR; Ereignisse ≤ 768/s je Index-Raum.
- [ ] **I2-27** Drum-Spur: freie Reihe `drum.hatC.nFrq` wird je Schlag am Schritt abgetastet (gemessene Filterfrequenz je Schlag = Reihe
  ± 3 %); Noten-Lock gewinnt.
- [ ] **I2-65** Kill-Sicherheit: frische Sitzung, Reihen-Ereignisse für Fach 1 und Hauptkern warten; `kill` der Stimme ID 1 (und 2, 3) →
  alle Reihen-Ereignisse bleiben in der Warteschlange und kommen zur Soll-Zeit.
- [ ] **I2-66** Nur-Reihe-Ziele: Reihe auf `fx.rev` (Spur) → Send-Pegel zur Schrittzeit = Wert ± 1 % (± 1 ms), auf Worklet- und nativer
  Spur gleich; Reihe auf eine Mod-Tiefe → LFO-Hub folgt (± 5 %); Ende setzt beide auf den Grundwert zurück.

##### I2d — Klang-Lock und Nebenkerne (FM-Algorithmus je Schritt)
**Ziel.** Ein Schritt spielt einen anderen Klang, knackfrei, vorab geladen, live bearbeitbar. **Umfang.** §5.9 (Aufbau `initCore`/
`renderVoices`/`kcMake`, Fächer, Vorrat und Laden, Kern-Wege, Stimmen nach K2, Begrenzer, Live-Nachricht `klSet`, Effekte, nativer
Weg), Struktur-Locks, Stopp/Panik. Erster Schritt: Größe und Bauzeit eines Fachs messen, `KC_BYTES` festlegen. **Dauer** 12–15 h ·
**Budget** +18 KB.
- [ ] **I2-28** FM-Clip 1/16, 120 BPM, Release 50 ms, LFO aus bzw. mit Key-Sync, Spur-Effekte aus; Schritt 5 Klang-Lock (Algorithmus 5,
  Grundklang Algorithmus 1): Fenster [Beginn Schritt 5, Beginn Schritt 6) gegen Einzel-Render der Klang-Lock-Note allein → Korrelation
  ≥ 0,99; Gesamt-Render minus Einzel-Render der Klang-Lock-Note = Render ohne Schritt 5 (M-NULL ≤ −90 dB über den ganzen Clip).
- [ ] **I2-29** Knackfrei: Algorithmus 1 / 32 im Wechsel auf jeder 1/16 bei 140 BPM, 16 Takte, überlappende Ausklänge: M-KLICK ≤ 6 dB,
  M-EINBRUCH ≤ 3 dB.
- [ ] **I2-30** Ausklang: Die vorige Note klingt in ihrem Kern mit ihrem eigenen Release aus (gemessene Release-Zeit = Soll ± 10 %).
- [ ] **I2-31** Mono-Linie mit Klang-Locks: Gleiten von der letzten Tonhöhe (Start ± 5 ct), kein Doppel-Anschlag im selben Kern.
- [ ] **I2-32** Stimmen nach K2: `poly` 6 über alle Kerne; die 7. Note nimmt zuerst die leiseste **ausklingende** Stimme über alle Kerne,
  Blende 5 ms (`STEAL_N`), M-KLICK ≤ 6 dB; Begrenzer-Kappe 4 + `polyH` 6: ein 6-Ton-Akkord aus Haupt- und Fach-Stimmen bleibt ganz.
- [ ] **I2-33** Laden (M-KERN): (a) Clip A (3 Klang-Locks) → Clip B (3 andere) auf derselben Spur, Wechsel am Taktstrich, Release 2 s: B klingt ab
  der ersten Note in seinen Fächern, A klingt aus; (b) Szenenstart mit Note auf Schlag 1 direkt nach dem Öffnen (▶ wartet ≤ 300 ms);
  (c) Song-Teilwechsel mit neuen Klang-Locks. In (a)–(c): `klLate` = 0, kein `late`, Live-Mitschnitt gegen Offline-Render Korrelation ≥ 0,99,
  zwei Offline-Render bitgleich. (d) Klang-Lock bei laufendem Transport neu angelegt: Note schweigt bis `klOk`, spielt nie im Grundklang.
- [ ] **I2-34** Struktur-Lock „Algorithmus 5“ auf Schritt 4 und 8 erzeugt **einen** abgeleiteten Klang-Lock (Hash), wiederholtes Anlegen nutzt
  ihn; [Neu ableiten] übernimmt den geänderten Grundklang mit der Struktur-Änderung (ein Undo).
- [ ] **I2-35** ■■/Panik: alle Kerne inkl. MS-2000-Effektfahnen ≤ −90 dBFS nach 50 ms; ■: Ausklang wie Hauptkern.
- [ ] **I2-36** Offline = live: Video-Render 8 Takte mit Locks, Reihen, Klang-Locks zweimal bitgleich; gegen Echtzeit-Mitschnitt Korrelation ≥ 0,99.
- [ ] **I2-67** Eigener Zustand: Algorithmus-Wechsel (`structXf`) und Engine-Wechsel (`engXf`) am **Hauptkern**, während eine Fach-Stimme klingt
  → Fach-Abgriff (M-KERN) gegen Fach allein ≤ −90 dB; kein Feld des Fachs zeigt auf ein Objekt des Hauptkerns (Test vergleicht Identitäten).
- [ ] **I2-68** Live-Bearbeiten: Cutoff am Klang-Lock drehen, während seine Note klingt → im Fach-Abgriff im ersten Block nach Eintreffen der
  `klSet`-Nachricht wirksam (≤ 50 ms nach der Berührung); Welle/Algorithmus ändern → 30-ms-Überblendung im Fach, M-KLICK ≤ 6 dB; Hauptkern
  unberührt; Undo-Art Clip; gemeinsames Fach → bearbeiteter Klang-Lock bekommt eigenes Fach, Notes des anderen Clips unverändert.
- [ ] **I2-69** Kern-Wege: 200 Noten zufällig auf Haupt- und Fach-Kernen mit Off, Retune, Kill, Fast-Off → keine hängende Note, `findId`
  trifft immer; MS-2000-Klang-Lock: KEYS 9 setzt Mod-Sequenz und LFO im Fach zurück wie im Hauptkern (Phase ± 1 Block).
- [ ] **I2-70** Speicher und Bau: `lkInfo().bytes` je Fach ≤ Nenngröße; Bau-Median ≤ 1,5 ms (VA/FM) bzw. ≤ 2 ms (MS 2000); `kcInProc` = 0;
  Bau-Nachrichten ≥ 20 ms auseinander; 9. verschiedener Klang einer Spur und Überschreiten der Projekt-Grenze werden beim Anlegen abgewiesen
  (LCD), nie beim Abspielen.
- [ ] **I2-72** Begrenzer: Stufe 2/3 erzwungen → Hauptkern und Fächer bekommen dieselben `limited()`-Werte (Mitschnitt), Stimmen-Kappe wirkt
  über alle Kerne nach K2.

##### I2e — Bedienung: LOCK, Lock-Leiste, Pinsel, Ring, Reihen, Klang-Lock-Blatt, Übersicht
**Ziel.** Alles mit dem Finger, sichtbar, ohne versteckte Modi. **Umfang.** §6.1–6.6, §6.8, §6.9, Editor-Ziel §5.9.5 (Bedienseite);
Block `sq-lock-src` bei Bedarf. **Dauer** 12–15 h · **Budget** +30 KB (davon ≈ 25 KB im Block bei Bedarf).
- [ ] **I2-37** LOCK-Modus: Banner, Tipps wählen (Notenmenge unverändert), Lock-Leiste mit den 6 Reglern der Engine + [mehr ▾]; Drehen schreibt
  auf alle gewählten Schritte (ein Undo), Reiter erscheint; Modus endet auf jedem Weg aus §6.2; „nur Reihe“-Ziele legen eine freie Reihe an.
- [ ] **I2-38** Pinsel (M-GESTE): (a) A auf Regler, B wischt sofort in 600 ms über 16 Schritte → 16 Locks (an Noten: nur Schritte mit Note),
  ein Undo; A dreht dabei von 20 % auf 80 % → Werte steigen monoton; (b) **A ruht 1 s**, dann wischt B über 16 Schritte → 16 Locks, ein Undo,
  kein Mod-Picker; (c) wie (b) bei laufendem Transport; `pointercancel` → alles zurück.
- [ ] **I2-39** Pinsel stört nichts: Mod-Picker öffnet nicht, Rollen-Zoom startet nicht, Fein-Modus mit B auf freier Fläche wirkt wie vorher.
- [ ] **I2-40** Ring (M-RING): Locks auf 1, 5, 9, 13 → genau diese Punkte gefüllt; Aktualisierung ≤ 1 Bild nach Änderung; laufender Punkt folgt
  dem Schritt ± 1 Bild (30 Bilder/s); 1/16T → 12 Punkte; 64-Takt-Clip (G8) blättert mit „n/m“; kein Ring auf den Platten MS 2000, Bit Mask,
  North (F4); **Platz** (M-PLATZ): Ring ≥ 1 px von Etikett- und Wert-Schrift, ≥ 2 px vom Nachbar-Ring, in allen Formaten und Reglergrößen;
  Regler < 48 px zeigen ◆ statt Ring.
- [ ] **I2-41** Freie Reihe: Optionen [An Noten │ Frei], Länge per ‹ › und Länge-Regler, Raster, Ebenen Wert/Chance/Ratsche; Wiederholungen
  blass; Klammer gezeichnet, Wischen über die Klammer malt; Umschalten mit Hinweis „n Werte ohne Note entfallen“; je ein Undo.
- [ ] **I2-42** Klang-Lock-Blatt: aus aktuellem Klang, aus Bibliothek (nur passende Engines, Vocoder grau), Bearbeiten mit Kopfzeile,
  Zeile „Effekte: die der Spur“, „K“-Zeichen in LAUF/SCHRITTE/ROLLE, vierter Eintrag grau mit Grund; FM-Algorithmus-Wahl als Struktur-Lock.
- [ ] **I2-43** Mod-Übersicht: Abschnitt „Schritt-Werte“ vollständig (Abgleich mit `lkGet`, inkl. Spur-Reihen), Tipp öffnet LOCK auf dem
  Reiter, [✕] entfernt mit einem Undo.
- [ ] **I2-44** M-PLATZ in P1, P2, P3, L1, L2, W, 428×926: alles im Bild, Trefferflächen nach §6.9 (neue ≥ 44 × 44; [LOCK]/⇕ ≥ 44 px breit ×
  Leistenhöhe, per Wischen erreichbar), kein waagrechtes Scrollen außer Reiter-Zeile und den vorhandenen Werkzeugleisten, Blatthöhe ± 0 px bei
  LOCK, Reiterwechsel, Popover, Klang-Lock-Bearbeitung; Listen scrollen per Finger.
- [ ] **I2-45** Flüssig: Öffnen von LOCK ≤ 50 ms (keine Aufgabe > 50 ms, inklusive erstem Laden von `sq-lock-src`), Pinsel ≤ 4 ms je
  `pointermove` (Median), 59+ Bilder/s beim Malen (Chromium); Startzeit der App ± 5 % (Block wird nicht beim Start ausgewertet).
- [ ] **I2-46** Marke: `grep -i -E '\b(elektron|digitone|octatrack|machinedrum|korg|wavestate|opsix|modwave|microkorg|kodamo|essencefm|mask1|nord|yamaha|modx)\b'`
  in DOM, Hilfe, CSS, Bezeichnern, Kommentaren, Testnamen = 0; `grep -o -i -E 'ms ?2000'` in der ganzen App = genau 1 (`MK_LABEL`).
- [ ] **I2-71** Klang-Lock-IDs: [✕] löscht alle Verweise im selben Undo; neuer Klang-Lock bekommt nie eine gelöschte ID (`klq`); Noten in einen
  anderen Clip einfügen → `lk.k` zeigt auf gleichen Klang (gleiches `h`) bzw. Klang-Lock wird mitkopiert; bei vollem Ziel-Clip Hinweis vorher,
  ein Undo.
- [ ] **I2-73** Editor-Ziel: Während der Klang-Lock-Bearbeitung schickt kein Editor (VA, FM DX, FELD, MS-2000-Platte, I3-Malen, Vorhören)
  eine Nachricht an den Hauptkern (Spion am Port); der Spur-Klang bleibt deep-equal; [Fertig] und jeder Weg aus Regel 6 beendet die Bearbeitung.

##### I2f — Anschlag sehen, ziehen, hören
**Ziel.** Xanders Wunsch vom 31.10. **Umfang.** §6.7 (ROLLE inkl. MELODIE und eigener Song-Clip, LAUF, SCHRITTE). Unabhängig von I2a–I2e.
**Dauer** 5–6 h · **Budget** +7 KB.
- [ ] **I2-47** Füllhöhe: v = 0,5 → gefüllter Teil = 50 % der Innenhöhe ± 1 px (Pixeltest), v = 0,05 → ≥ 2 px; Notenname: Farbe nach Lage der
  Kasten-Mitte (Fälle Füllung 30 %, 50 %, 55 %, 80 %), Kontrast ≥ 4,5 : 1 gegen den Teil unter der Kasten-Mitte, Saum vorhanden; Klaviatur-Taste
  der gewählten Note mit Füllhöhe.
- [ ] **I2-48** Werkzeug ⇕: 100 px hoch → +0,50 ± 0,01; VEL-Feld 100 px → +0,50 ± 0,01 (gleiche Skala); Fein-Modus ×¼; drei gewählte Noten
  ändern sich um dasselbe Δ (geklemmt); kein Verschieben; ein Undo „Anschlag“; Rastpunkte bei VEL 6 und 127.
- [ ] **I2-49** Hören (M-HÖR): erstes Audio ≤ 40 ms nach dem Zieh-Ereignis, das ≥ 2 Stufen ändert (Chromium); ≤ 11 Anspiel-Noten/s; Pegel folgt dem
  Anschlag (RMS-Unterschied = Anschlag-Kennlinie des Klangs ± 1 dB); 1 s nach dem Loslassen keine klingende Vorhör-Stimme.
- [ ] **I2-50** ◀ ▶: Reihenfolge Zeit, dann Tonhöhe; jeder Schritt wählt, spielt, holt ins Bild; Enden blass; in ROLLE (Synth, MELODIE, eigener
  Clip) und LAUF.
- [ ] **I2-51** VEL-Leiste der ROLLE, VEL-Reiter im LAUF und in SCHRITTEN spielen beim Ziehen hörbar mit (Grenzen wie I2-49).
- [ ] **I2-52** Anschlag-Änderungen: Speichern/Laden deep-equal, MIDI-Export Anschlag = round(v · 127); Formate wie I2-44 für ⇕ und die
  Anschlag-Leiste.

##### I2g — Adapter Bit Mask und North (nach BM2/BM6 bzw. ND1/ND4)
**Ziel.** Locks, Reihen und Klang-Locks auch für die zwei neuen Engines. **Umfang.** §5.10, `LKT`-Einträge aus deren Tabellen.
**Dauer** 3–4 h · **Budget** +6 KB.
- [ ] **I2-53** Bit Mask: Lock auf `bm.a.f.cu` (M-SP ≥ ⅓ Okt) und `bm.a.o1.m` je Note; Maskenwechsel an der Periodengrenze ± 1 Sample;
  Klang-Lock über Programm-Platz; freie Reihe zeitgenau ± 1 Sample; `fallbacks` = 0; Clip mit Rad-Kurve und Cutoff-Lock: Kurve moduliert
  obendrauf (Rad 0 → Render = nur Lock); kein Ring auf der Platte.
- [ ] **I2-54** North: `drum.snare.mDec`-Lock → T60 ± 10 %; `mFrq`-Lock + TUNE +12 → × 2 ± 5 ct; Klang-Lock = anderes Kanal-Programm je Schlag;
  CPU ohne Locks unverändert (M-PAAR, innerhalb der A/A-Rauschgrenze); kein Ring auf der Platte.
- [ ] **I2-55** Regel 28 für beide: Projekte ohne Locks bitgleich zum Stand vor I2g; `LKT`-Abdeckung (I2-01) schließt beide Editoren ein.

##### Gemeinsame Abnahme (Zusammenführung)
- [ ] **I2-56** Regression: Smoke, DoD (Worklet und nativ je 10/10), WP6-Drums, MK1–MK7-Kern-Suiten, K1-Suite, K2-/D1-/N1-/N2-Suiten
  (`helfer-n12d1k2`), VV1-Suite, LAUF-/ROLLE-Suiten, G1/G8 (wenn zusammengeführt), I1-Suite (wenn zusammengeführt).
- [ ] **I2-57** 3 Minuten Wiedergabe mit Szenenwechseln, Lock-Änderungen, Klang-Lock-Bearbeitung und Pinsel während ▶: keine Knackser
  (M-KLICK), keine hängenden Noten, keine Konsolenfehler, `lkBad` = `klLate` = 0.
- [ ] **I2-58** Kein Supabase-Aufruf; Hilfe-Zeilen (U-07-Stil) für LOCK, Pinsel, Ring, freie Reihe, Klang-Lock (mit „Effekte der Spur“),
  Anschlag-Werkzeug.
- [ ] **I2-59** Bilder für Xander (P und L: LOCK mit Lock-Leiste, Ring im FM-Editor und ◆ an kleinen Reglern, freie Reihe mit Klammer,
  Klang-Lock-Blatt, ROLLE mit Füllhöhen und Anschlag-Leiste) in `i2-shots/`.
- [ ] **I2-60** **iPhone (Xander, Pages-Seite):** `perfProbe` mit I2-Probe, **zwei Läufe** derselben Szene: „ohne“ (Locks, Reihen und
  Klang-Locks entfernt, gleiche Noten) und „mit“ (1 FELD-Spur 6 OP mit 6 Stimmen und je 8 Locks + 4 freie Reihen 1/16; 1 VA-Spur 6 Stimmen mit
  je 8 Locks; 1 MS-2000-Spur 4 Stimmen mit je 4 Locks; 2 FM-Klang-Locks klingend). Beide Werte ins Ergebnis-JSON (Changelog). Bedingung:
  „ohne“ ≤ 0,35 (sonst wird die Szene vor der Prüfung verkleinert, nicht die Grenze erhöht); „mit“ ≤ 0,45, „mit“ − „ohne“ ≤ 0,04, kein `late`,
  3 min ohne Aussetzer (hören).

---

#### 9. Dauer, Größe, Reihenfolge, Zweige

| Teilpaket | Inhalt | Dauer | Budget |
|---|---|---|---|
| I2a | Adressen `LKT`, `pv-layout.json`, Daten, Endwert, Test-API inkl. `lanePut`/`lockPut` | 5–6 h | +13 KB |
| I2b | Noten-Locks im Klang (VA inkl. stufiger Werte je Stimme, FM DX/FELD, MS 2000, WT/nativ `o.lkP`, Drums), Schritt-Zuordnung | 10–12 h | +16 KB |
| I2c | Freie Reihen mit Länge, Chance, Ratsche; Typ 11/12; Spur-Werte nativ | 5–7 h | +10 KB |
| I2d | Fächer (`initCore`, `renderVoices`, `kcMake`), Vorrat/Laden, Kern-Wege, Stimmen nach K2, `klSet`, nativer Weg | 12–15 h | +18 KB |
| I2e | Bedienung (LOCK, Lock-Leiste, Pinsel, Ring, Reihen, Klang-Lock-Blatt, Übersicht), Editor-Ziel | 12–15 h | +30 KB |
| I2f | Anschlag sehen/ziehen/hören, ◀ ▶ | 5–6 h | +7 KB |
| I2g | Adapter Bit Mask + North | 3–4 h | +6 KB |
| Zusammenführen, Fach-Prüfung, iPhone-Probe | | 3–4 h | – |
| **Summe** | | **≈ 55–69 h** | **≈ +100 KB**, davon ≈ 25 KB nur bei Bedarf geladen |

Gegenüber dem Vorschlag (≈ 36 h + 6 h) kommen hinzu: eigene Nebenkerne statt Geist-Kopien, Vorrat aus dem ganzen Projekt, Live-Bearbeiten
mit Editor-Ziel, stufige VA-Werte je Stimme (gemeinsam mit I1), Spur-Reihen, die Adapter für North und Bit Mask.

**Basis:** Kopie ab dem dann aktuellen Stand der Hauptlinie, auf der **K1, K2, D1, N1 und N2** zusammengeführt sind (K2/D1/N1/N2 aus
`helfer-n12d1k2`). Fehlt einer davon, wird nicht begonnen.

**Zweige (Regel 29):**
- **A `i2-br-K` (Klang):** I2a → I2b → I2c → I2d.
- **B `i2-br-U` (Bedienung):** I2f sofort (unabhängig) → I2e gegen die in §3/§4/§5.1/§5.9.5 festgelegte Schnittstelle (Test-API von I2a als
  Stub, bis A zusammengeführt ist).
- **C `i2-br-A` (Adapter):** I2g, sobald BM2 + BM6 bzw. ND1 + ND4 auf der Hauptlinie sind (getrennt freigebbar).
- **Abstimmung mit I1:** `pv-layout.json` und der Umbau `initCore`/`renderVoices` sind gemeinsame Stellen. Wer zuerst zusammengeführt wird,
  bringt sie mit; der andere setzt darauf auf (I2-61, I2-04).
- **Zusammenführung:** I2f (sofort veröffentlichen, Xanders Wunsch zuerst) → I2a + I2b → I2c → I2e → I2d → I2g. Schnittstelle (§3, §4, §5.1,
  §5.2) ist hier festgelegt und ändert sich im Bau nicht. Mit drei Helfer-Sitzungen ≈ 26–32 h Kalenderzeit.

---

#### 10. Messverfahren (neu; vorhandene M-KLICK, M-NULL, M-SP, M-CPU, M-ZEIT, M-PLATZ, M-EINBRUCH, M-CENT gelten unverändert)

| Kürzel | Name | Definition |
|---|---|---|
| **M-LOCK** | wirksamer Wert | `lkInfo({stimme})` liest je Stimme und Steuer-Block den gerechneten Endwert (Worklet-Abfrage wie `scopeDst`); Vergleich mit dem Soll aus `lkResolve` |
| **M-PAAR** | CPU-Paarmessung | Worklet im Node-Shim (wie `k2-lib.mjs`), µs je 128er-Block; Szene mit/ohne Merkmal abwechselnd, ≥ 20 Paare × 10 000 Blöcke; Grenze für die obere 95-%-Schranke der mittleren Paar-Differenz (t-Verteilung); vorher A/A-Paare für die Rauschgrenze, Paarzahl verdoppeln bis halbe A/A-Breite ≤ halbe Grenze (höchstens 160) |
| **M-KERN** | Kern-Abgriff | Test-Haken `kcTap(c)` rendert nur Kern `c` in einen eigenen Puffer (nur im Test aktiv); Vergleich gegen den Kern allein |
| **M-GESTE** | Mehrfinger | Playwright + CDP `Input.dispatchTouchEvent` mit zwei Touch-Punkten (A ruht – auch ≥ 1 s –, B bewegt sich in 16-ms-Schritten), Ergebnis aus `lkGet` und Undo-Stapel |
| **M-RING** | Ring | SVG-Abfrage der Punkt-Zustände (gefüllt/Ring/blass) gegen `lkGet` und Ansicht; Zeitpunkt der Änderung per `requestAnimationFrame`-Zähler; Abstände per `getBoundingClientRect` der Punkte und `Range.getBoundingClientRect` der Schrift |
| **M-HÖR** | Vorhör-Zeit | Zeit vom `pointermove`-Ereignis bis zum ersten Sample > −60 dBFS am Master-Abgriff (`AU.ctx`-Zeit, Ausgabe-Latenz abgezogen) |
| **M-REIHE** | Reihen-Zeitplan | Mitschnitt aller Typ-11/12-Ereignisse (Frame, Kern, Platz, Wert) offline; Soll aus `laneAt` |

---

#### 11. Risiken

1. **Worklet-Eingriff in den Kern** (`control`, `startVoice`, `enqueue`, Umbau `initCore`/`renderVoices`): Gefahr für Regel 28.
   Gegenmittel: `lkAny`-Weiche, gleiche Rechen-Reihenfolge im Hauptkern, Ereignis-Mitschnitt byte-gleich und Golden-Render aller Snapshots
   (I2-04) **nach** dem Umbau und vor jedem weiteren Schritt.
2. **Fächer auf dem iPhone:** Speicher (Nenngröße gemessen, Projekt-Grenze) und Bauzeit im Audio-Faden (Nachrichten-Weg, Häppchen ≥ 20 ms,
   bei Last warten). Reicht die Last im Gerätetest nicht (I2-60), wird **nichts** am Klang gespart; die Grenze 8 Fächer je Spur wird erst
   nach Rückfrage bei Xander gesenkt.
3. **iOS-Mehrfinger:** Safari meldet zwei Zeiger zuverlässig, aber eine Systemgeste (Wischen vom Rand) bricht mit `pointercancel` ab →
   Geste wird ganz zurückgenommen (gewollt); Pinsel nur im Blatt, nicht am Bildschirmrand (Abstand ≥ 20 px zum Rand für den Start von B).
4. **Haptik auf iOS** ist nur über einen Umweg möglich und aus `pointermove` unsicher; die sichtbare Rückmeldung und das LCD tragen die
   Bedienung allein (§6.3, §13).
5. **Bedien-Dichte in P3 (320 px):** Lock-Leiste 2 × 3, vorhandene scrollende Werkzeugleisten; M-PLATZ.
6. **Begriffsverwechslung** „Spur“ (Instrument) und „Reihe“ (Werte im Sequencer): darum heißen die FM-Spuren in der App „Reihe“ bzw. tragen
   nur „◆ Ziel“; Namen stehen in §13 zur Prüfung.
7. **Wartende Pakete** (G8, BM, ND, I1, K1-Nachbesserung) ändern dieselben Stellen; Gegenmittel: Basis-Bedingung §9, gemeinsame Liste
   `pv-layout.json`, Schnittstellen hier fest, Merge-Tests I2-56.
8. **Editor-Umleitung:** Ein vergessener Schreibweg würde den Spur-Klang statt des Klang-Locks ändern; Gegenmittel: Port-Spion I2-73.
9. **Datenverlust in älteren Versionen** beim Speichern (verworfene Felder): VO-R1-Band; `max_app` vorab erhöhen.

---

#### 12. Fragen an Xander (nur echte; Vorgabe, falls keine Antwort)

- **F1 Sequencer des FM-Vorbilds (Frage aus dem Vorschlag, noch offen):** „Was genau stört dich am Sequencer des FM-Geräts?“
  **Vorgabe:** Wir nehmen an: eigener, angehängter Bereich, zum Start ohne Chance und Ratsche, schwer zu verstehen. Darum laufen die
  FM-Reihen im gewohnten Sequencer mit Chance und Ratsche (so geplant).
- **F2 „Anschlag auf der Taste farbig sehen“:** (a) Meintest du die **Note im Editor** (Füllhöhe im Notenblock, die Taste links in der
  Klaviatur leuchtet mit) oder die **Taste der Spiel-Tastatur** beim Live-Spielen? (b) Soll sich zusätzlich die **Farbe** mit dem Anschlag
  ändern (leise blasser, laut kräftiger)? **Vorgabe:** (a) Note im Editor + Taste der Klaviatur in der ROLLE; (b) nein, Füllhöhe in voller
  Spurfarbe (wie im freigegebenen Vorschlag).
- **F3 Super-Regler und Locks** (nur hier gefragt, nicht in I1): Wenn du mit dem Super-Regler (I1) den Klang aufdrehst – sollen gelockte
  Schritte **mitgehen** (ihr Abstand bleibt, das Muster wandert mit) oder **fest** bleiben? **Vorgabe:** mitgehen (so steht es in I1 §5.1).
- **F4 Punkte-Ring auf den Geräte-Bedienfeldern:** MS 2000, Bit Mask und North sollen „genau so“ bzw. „wie am Gerät“ aussehen. Darf dort der
  Punkte-Ring um die Regler erscheinen? **Vorgabe:** nein, Ring nur in der Lock-Leiste.
- **F5 Vorschlag (nicht gebaut):** Reglerbewegungen während ● REC als Locks in die Schritte schreiben („Lock-Aufnahme“)? **Vorgabe:** nicht
  bauen, bis du Ja sagst.
- **F6 „Locks für alles“ – Spur-Werte, Mod-Tiefen, Tempo:** Lautstärke, Panorama, Hall- und Echo-Anteil, Pumpen, Chorus-Mischung/-Tempo/-Tiefe
  und Modulations-Tiefen wirken auf die ganze Spur. **Vorgabe:** als **freie Reihe** möglich (Schritt für Schritt, mit Länge, Chance,
  Ratsche), aber nicht als Lock an einer einzelnen Note; Drive der Spur, Chorus-Art und Pump-Release ausgenommen (die Kette würde bei jedem
  Schritt umgebaut); Tempo, Swing, Master und der gemeinsame Hall-/Echo-Raum ohne Locks.
- **F7 Effekte eines Klang-Locks:** Ein Klang-Lock nutzt die Effekte der Spur (Hall, Echo, Chorus, Drive; bei MS 2000 deren Mod-FX/Delay/EQ).
  Ein „Glocke“-Klang aus der Bibliothek klingt darum auf einem Schritt etwas anders als im Browser, wenn er eigene Effekte hat; das Blatt sagt
  es. Eigene Effekte je Klang-Lock kosten auf dem iPhone viel Speicher (Echo ≈ 2,3 MB je Klang). **Vorgabe:** Effekte der Spur.
- **F8 Grenzen und Kleinigkeiten:** (a) Höchstens 8 eigene Werte je Note, 8 freie Reihen je Clip, 3 Klang-Locks je Clip, 8 verschiedene
  Klang-Lock-Klänge je Spur, 32 im Projekt – reicht das? (b) Ratsche auf einer Werte-Reihe: Teilschritte wechseln zwischen Schrittwert und
  Grundwert (flattern) – oder sollen alle Teilschritte den Schrittwert neu anfahren? (c) Pinsel: Drehen am gehaltenen Regler während des
  Wischens malt eine Rampe (der Pinsel malt immer den aktuellen Wert) – so gewollt? **Vorgabe:** (a) ja, (b) wechseln, (c) ja.
- **F9 Lange Klang-Lock-Listen:** Klang-Lock-Nummern werden nie wiederverwendet; nach Löschen kann „K4“ neben „K2“ stehen. **Vorgabe:** so
  (verhindert, dass alte Noten still einen neuen Klang spielen).
- **F10 „Velocity-Ziel einfacher“** (31.10. ~13:00): Meintest du, den Anschlag einfacher einem Ziel zuzuweisen (z. B. Anschlag → Filter)?
  **Vorgabe:** nicht in I2; ein eigenes kleines Paket nach deiner Antwort.
- **F11 Klammer der Reihen-Länge ziehen** (gleiche Frage wie bei D1): Direkt im Raster ziehen kollidiert mit dem Malen. **Vorgabe:** Länge im
  Optionen-Fenster, Klammer nur gezeichnet (wie D1 gebaut).

---

#### 13. Bitte prüfen (Xander am iPhone, Pages-Seite)

1. LOCK antippen, zwei Schritte wählen, Cutoff drehen → hörst du nur diese zwei Schritte anders?
2. Regler mit dem Daumen halten (ruhig auch länger), mit dem Zeigefinger über die Schritte wischen, dabei drehen → entsteht die Rampe, wie du
   sie willst?
3. Ist der Punkte-Ring um den Regler gut lesbar (Größe, Farbe)? Und das ◆ an den kleinen Drum-Reglern?
4. FM-Reihe „OP 2 Pegel“ mit Länge 12, ein Schritt mit Chance 50 %, einer mit Ratsche 3 → klingt es so, wie du es dir vorgestellt hast?
5. Ein Schritt mit anderem Algorithmus → hörst du irgendwo ein Knacken? Den Klang-Lock während des Spielens bearbeiten → hörst du es sofort?
6. Ein Klang-Lock aus der Bibliothek → klingt er mit den Effekten der Spur so, dass es passt (F7)?
7. Namen: „LOCK“, „Lock-Leiste“, „Klang-Lock“, „Reihe“, „◆ OP 2 Pegel“, „nur Reihe“, Werkzeug „⇕ Anschlag“ – passen sie?
8. ROLLE: Werkzeug ⇕, auf einer Note hoch/runter ziehen → siehst du die Füllhöhe und hörst du die Note sofort? ◀ ▶ durchgehen.
9. Spürst du beim Malen mit dem Pinsel und beim Anschlag-Ziehen ein leichtes Ticken? (Wenn nicht: kein Fehler, nur sag es mir.)
10. Probe: Menü → Leistung → I2-Probe, beide Läufe („ohne“ und „mit“), Ergebnis an mich (I2-60).

---

#### Quellen (kurz, für die Vergleiche im Text)

- Elektron: bis zu 72 gelockte Parameter je Pattern, „lock memory full“ bei Überlauf; Sound-Locks als eigener Mechanismus [Ö]:
  [Elektronauts, Digitone-Fragen](https://www.elektronauts.com/t/all-general-digitone-operating-questions/52585?page=6),
  [Elektronauts, Sound Locks](https://stage2.elektronauts.com/t/some-questions-about-sound-locks-newbe-here/137225).
- Wave Sequencing 2.0: Reihen („Lanes“) mit eigener Schrittzahl und eigenen Start-/End-/Loop-Punkten, Schritte mit Wahrscheinlichkeit
  überspringen [Ö]: [Händlerseite moogaudio](https://moogaudio.com/products/korg-wavestate-wave-sequencing-synthesizer);
  Motion Sequencing 2.0: bis 64 Schritte je Reihe [Ö]: [Handbuch-Seite (modwave)](https://www.manualslib.com/manual/2157468/Korg-Modvawe.html?page=36).
- FM-Gerät Firmware 7.0 (Mai 2025): 16 Spuren, bis 128 Schritte, beim Start ohne Wahrscheinlichkeit und Ratschen [Ö]:
  [Synth Anatomy](https://synthanatomy.com/2025/05/kodamo-essencefm-7-0-new-firmware-adds-multi-track-sequencer-second-lfo-and-more.html).
- Anschlag-Werkzeug am Rechner: senkrecht auf der Note ziehen, Note klingt beim Ziehen [Ö]:
  [Apple Logic Pro Hilfe](https://help.apple.com/logicpro/mac/10.1/en.lproj/lgcpa8fee137.html).
- AudioWorklet: `process()` ohne `true` darf vom Browser beendet werden → Nebenkerne leben im vorhandenen Knoten, nicht als eigene Knoten [Ö]:
  [MDN process()](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/process).
- Haptik im iOS-Browser nur über den Schalter-Umweg (ab iOS 18), Verhalten aus Zieh-Ereignissen unsicher [Ö, nicht bestätigt, ob später
  geändert]: [ios-haptics](https://github.com/tijnjh/ios-haptics), [WebKit Bug 285120](https://bugs.webkit.org/show_bug.cgi?id=285120).


*Ende Paket I2.*

---


### B.3 Paket I3 — Mal-LFO (Form malen oder einwischen)

#### Dirigenten-Hinweise zu I3 (gelten vor dem Paket-Text)
1. **Gehörte Zeit beim Einwischen (§5.5):** Statt `getOutputTimestamp()` gilt die gemeinsame Uhren-Brücke aus I4b (A.10):
   `t_h = hoerZeit(e.timeStamp) = ctxOf(e.timeStamp) − AU.outLat − (τ + Δout)/1000`, `τ` und `Δout` je Ausgabeweg nach I4 §5.4 (Vorgabe τ = 30 ms
   = bisheriges `d_f`). Ist I4b noch nicht auf der Linie, bringt I3b `ctxOf`/`hoerZeit` genau nach I4 §5.2–5.4 mit (τ fest 30 ms). **I3-19,
   I3-39, M-WISCH:** Fake der Uhren-Brücke (feste Zeitstempel, `AU.outLat` 50 ms, τ 30 ms) statt Fake von `getOutputTimestamp`; der zweite Lauf
   „Funktion entfernt“ entfällt. M-LAGE (I3-36) bleibt als Befund; > 15 ms Abweichung → Vorschlag des Dirigenten. Der Hinweis „Kabellose
   Ausgabe …“ bleibt.
2. **Ältere Stände (§3.7):** Baustein N (A.4), Merkmal `'lf'`; I3-10 prüft nach A.4.
3. **Form-Format:** ist das gemeinsame Format A.5 (unverändert). `onMsg`-Reihenfolge: I3a legt sie nach A.3 an.
4. **Haptik:** I3 erfüllt A.8 schon (nur `snap` beim Abheben). Die Frage „Tick gespürt?“ in §12.1 beantwortet M-PROBE.
5. **Marken (I3-34):** wird zur gemeinsamen Prüfung N8-10; ihr Diff-Verfahren gilt jetzt für alle Pakete (A.14).
6. **Messverfahren:** M-TAKT behält hier seinen Namen (I1 heißt jetzt M-FAHRT).
7. **Zweige (§8):** I3e und I3f laufen nicht „auf der Hauptlinie“, sondern als eigene Zweige ab der Hauptlinie (Regel 25): `i3-br-E` (I3e; der
   MS-2000-Teil sobald I3a zusammengeführt ist, der Reihen-Teil nach I2a + I2c) und `i3-br-F` (I3f nach I1c + I1d + I1e).
8. **Laden bei Bedarf:** Block `sq-form-src` (unverändert, A.13).
9. **Fragen:** alle I3-Fragen gelten mit Vorgabe (D.2); der Kurven-Chip folgt Frage 2 (Feld des Super-Reglers).

#### Paket-Text I3 (Fassung 2, vollständig)

*SYNQUENZER v3 — Nachtrag 8, Paket I3: Mal-LFO (Form malen oder einwischen)*

**Kurz für Xander**
1. Beim LFO gibt es neben Sinus, Dreieck, Säge, Rechteck und S&H eine sechste Form **✎ Gemalt**. Du malst sie mit dem Finger in ein Feld,
   das einen Zyklus breit ist (Vorgabe: **ein Takt**). Sie läuft dann im Takt immer wieder ab.
2. Du darfst schnell kritzeln: Beim Abheben **räumt die App auf**. Aus wackeligen Strichen werden gerade Rampen, aus schiefen Stufen saubere
   Treppen auf dem Raster, Kurven bleiben Kurven. Du **siehst**, wie es einrastet (die Linie gleitet in die saubere Form und leuchtet kurz auf).
   Einen Haptik-Tick gibt es nur, wo dein iOS ihn einer Webseite erlaubt – auf neuen iOS-Versionen vermutlich nicht. Stimmt eine Stelle nicht,
   malst du nur über diese Stelle neu.
3. **Einwischen:** Läuft der Loop, fährst du mit dem Finger nur hoch und runter. Die App schreibt die Höhe an die Stelle, die du gerade hörst,
   und du hörst das Ergebnis schon im nächsten Durchlauf. Das geht beim LFO, bei der MS-2000-Mod-Sequenz und bei freien Lock-Reihen.
4. Eine kleine **Bibliothek** liegt bei: **Pumpen, Gate, Triller**. Eine Form setzt du an vier Orten ein: als **LFO-Welle**, in die
   **MS-2000-Mod-Sequenz**, in eine **Lock-Reihe** (I2) und als **Kurve für den Super-Regler** (I1). Eingesetzt wird eine **Kopie** (Frage F4).
   Eigene Formen auf dem iPhone sammeln („Meine Formen“) baue ich nur, wenn du das willst (Frage F5).
5. Die Form läuft fest am **Song-Schlag**. Ob du bei Takt 1 oder Takt 7 startest, aus der Matrix in den Song wechselst, eine Schleife läuft
   oder du exportierst: Song, Export und Video klingen **gleich**. Alte Projekte klingen bitgleich. Es gibt sieben Unterpakete (I3a–I3g),
   zusammen **≈ 21–27 h**. Vorher stelle ich dir 5 kurze Fragen (§11), jede mit geplanter Vorgabe.

---

Status: **Fassung 2 nach Fach-Prüfung (31.10.)**, Entwurf zum Bau nach Xanders Ja (31.10. ~16:50 UTC: „Ja, die Innovation kannst du gerne
umsetzen“; freigegeben sind die Innovationen 1–4 aus `innovation-vorschlag.md`, dies ist Nr. 3 „Mal-LFO“ samt Frage C). Ideen 5–12 sind
**nicht** freigegeben und kommen hier nicht vor. Quellen im Projekt: `innovation-vorschlag.md` (Frage C und Idee 3), `fragen-xander-9.md`
(31.10., darin ~17:00 „fest IM Clip … keine Extra-Daten“ und ~17:35 Taktarten T1), `typische-fehler.md`, `n8/I1.md` (Fassung 2: Super-Regler,
Feld `f`, Platz für den Kurven-Chip), `n8/I2.md` (Fassung 2: Lock-Reihen, `lanePut`/`lockPut`, Klang-Lock `lf`), `n8/G9.md` §7.9 und
`n8/I4.md` §7.3 (Haptik-Befund), Nachtrag 3 MK6 (Mod-Sequenz, Song-Schlag-Fix), Nachtrag 7 §1.8 (Bit-Mask-LFOs wie am Gerät), Nachtrag 5
VV1–VV3 (Video). Code-Stand: 4.23.0 (`vs-base-B.html`), K1 (`n5-br-K/index.html`), VV1/VV2 (`n5-br-V/index.html`).

**Was sich gegenüber Fassung 1 geändert hat (Prüfbefunde):** (1) Die gemalte Form rechnet ihre Phase aus dem **Song-Schlag** (wie die
MS-2000-Sequenz bei KEY SYNC AUS), nicht aus dem Transport-Start; nur so stimmen Song-Start an beliebigem Takt, Übergabe Matrix → Song,
Schleifen und Export-Ausschnitte für alle Zykluslängen (§4.3, I3-04/I3-05). (2) Die Tabelle `lf` geht an das Worklet, **sobald eine Form
existiert**, unabhängig von der gewählten Form, und immer in derselben Nachricht vor `set` (§4.2, I3-37). (3) Haptik ist nur ein Versuch,
das sichtbare Einrasten ist Pflicht (§5.3, I3-40). (4) Einwischen ist je Ziel genau festgelegt; die Vorschau läuft ohne Undo, ein Abbruch
schickt sofort den alten Stand zurück (§5.5, I3-39). (5) Raster bei punktierten und triolischen Zykluslängen, Verhalten unter Taktarten
(T1) (§3.1, §4.9, §6.3, I3-38). (6) Die Marken-Prüfung gilt nur für den I3-Diff (I3-34). Dazu: nativer Formwechsel ohne Neubau der Routen,
Kantenbreite mit Untergrenze, Fahrt-Kurve ohne Zyklus-Kante, Fragen F4 (Kopie) und F5 (Meine Formen), Kurven-Chip auf dem von I1 (Fassung 2)
freigehaltenen Platz, I2-Reihe behält ihre Länge, Bibliotheksformen für Lautstärke 0 … −1000, MS-2000 in Spiel-Reihenfolge und nach
Schrittzeiten, Ausgabe-Zeitstempel beim Einwischen, Undo-Randfälle, fester Erkennungs-Korpus, Messbedingungen, ältere Versionen über `S.need`.

**Kennzeichen:** **[C]** Befund im Code (Zeilennummern 4.23.0, ungefähr) · **[A]** Annahme dieser Spec (der Builder baut genau das) ·
**[V]** sichtbare Neuerung: steht sie im freigegebenen Vorschlag, wird sie gebaut und steht in §12 „Bitte prüfen“; steht sie dort nicht, ist
sie eine Frage in §11 und wird **erst nach Xanders Antwort** gebaut · **[X]** Entscheidung von Xander · **[W]** Fakt aus der Web-Recherche (§13).

**Regeln, die hier besonders gelten** (`typische-fehler.md`, CLAUDE.md):
- **27** Nur bauen, was hier steht. Namen auf Tasten stammen aus dem freigegebenen Vorschlag („Mal-LFO“, „einwischen“, „aufräumen“, „Pumpen“,
  „Gate“, „Triller“). Neue sichtbare Dinge sind mit [V] markiert. **Kein** Punkte-Editor (Knoten ziehen), **kein** Spiegeln/Umdrehen der
  Form, **keine** weiteren Bibliotheksformen. Was der Vorschlag nicht nennt und man sieht („Meine Formen“), ist Frage F5 (CLAUDE.md Regel 3:
  erst vorschlagen, dann bauen).
- **28** Alte Projekte klingen gleich. Ohne `l1f`/`l2f` im Klang und ohne `f` in Super-Regler-Fahrten gibt es **keine** neue Nachricht an die
  Worklets, und kein neuer Rechenweg läuft. Die Formen 0–4 behalten ihre heutige Takt-Lage (Transport). Golden-Render der Snapshots in
  `synq-snapshots/` **bitgleich** (I3-01).
- **1 / 3 / 4 / 5** Nichts abgeschnitten (echte App-Schrift), Listen scrollen per Finger, Trefferflächen ≥ 44 × 44 px, kein Layout-Sprung
  (Seiten- und Editorhöhe ± 0 px beim Öffnen und Schließen des Form-Blatts). **6 / 10** Malen und Einwischen enden auf jedem Weg sauber.
- **7 / 8 / 9** „geändert“-Punkt sofort, ein Strich = ein Undo, Speichern → Laden deep-equal (auch Kopieren, Sound sichern, Klang-Lock).
- **12 / 16 / 17** Kanten der Form werden im Klang geglättet (§4.1). Keine Allokation in `process()`, NaN-Schutz. **19** Tempo-Sync,
  Start NOTE und Song-Start getrennt prüfen (I3-04).
- **20** Kein Supabase-Aufruf. `max_app` (heute 4 030 000) muss die I3-Version decken. Das setzt Xander.
- **22** Jede Stufe hat Changelog, Snapshot und „Bitte prüfen“ (§12).
- **24** Kein Hersteller- oder Produktname in der App (Oberfläche, Hilfe, Kommentare, Bezeichner, Testnamen). Vergleiche stehen nur in dieser
  Spec. Wo die Oberfläche die MS-2000-Engine nennt, kommt der Name aus `MK_LABEL`.
- **29** Zwei Zweige parallel (§8).
- **CLAUDE.md-Vorrang:** Die Seite bleibt schnell und die Bedienung flüssig. Form-Blatt und Aufräumen liegen im Block `sq-form-src`, der
  **erst beim ersten Öffnen** ausgewertet wird (wie `sq-mk-src`). Ohne gemalte Form rechnet das Worklet keinen einzigen zusätzlichen Befehl.
  **WebGL bringt hier nichts:** Das Feld zeichnet höchstens 769 Punkte mit Canvas 2D in ≤ 2 ms je Bild. Das sage ich gleich jetzt.
- Format bleibt **5** (nur zusätzliche Felder). Die App-Version vergibt der Dirigent.

---

#### 0. Befund im Code (4.23.0 und wartende Pakete)

| Stelle | Heute | Folge für I3 |
|---|---|---|
| `AnalogCore.lfoVal(shape, ph, sh)` (Z. 9688) | 5 Formen: 0 Sinus · 1 Dreieck · 2 Säge · 3 Rechteck · `default` = 4 S&H [C] | neuer Fall **5** vor `default`; alte Formen unverändert |
| `AnalogCore.control()` (Z. 9694–9722) | Takt-LFO: `gl1 = frac(songT / spb / l1sync)` mit `songT = frame·ISR − songStart`; `songStart` = **Transport-Start** (`R.startTime`, `newEngine` Z. 17794); Start NOTE: Phase je Stimme ab 0 (Z. 9619); Steuer-Takt `CR` = 16 Samples (Z. 6962) [C] | Transport-Lage stimmt nur für Zyklen, die 4 Schläge teilen → Form 5 rechnet am **Song-Schlag** (§4.3) |
| Song-Schlag: `R.songPlay.off` (Song-Start `off = −bar0·4`, Z. 19470; Übergabe Matrix → Song `off = nb − bar0·4`, Z. 19480; Schleife/Sprung `prevOff`, `wrapAt`, Z. 19556/19632), `songBeatOf(tb)` (Z. 19705) | Song-Schlag = Transport-Schlag − `off` (vor dem Rücksprung `prevOff`) [C] | Grundlage der Form-Phase |
| `mkSongSync()` (Z. 19712, jeder Planer-Takt Z. 19103), Worklet `sqSong` (Z. 9307), MS-2000-Sequenz (Z. 8133) | schickt `{mkSong: {off, prev, wrap}}` an **jede** Synth-Engine, sobald sich etwas ändert; die MS-2000-Sequenz rechnet damit bei KEY SYNC AUS den Song-Schlag (MK6-Fix FP-SONG) [C] | Form 5 nutzt genau diese Nachricht; **keine** neue Nachricht für die Lage |
| FM-FELD (`fmx`, Z. 10246 ff.) | Operator-LFO (lfoAm/lfoFm) liest `this.src[S_LFO1]` [C] | die gemalte Form wirkt dort ohne Zusatzarbeit |
| `wkFlat(snd)` (Z. 17781) | schickt nur Zahlen aus `snd.p` an das Worklet [C] | die Knoten der Form brauchen eine eigene Nachricht `lf` (§4.2); ohne Form bleibt alles byte-gleich |
| `syncEngine(i, full)` (Z. 17798), `newEngine` (Z. 17790), `wkSet`/`wkFlush` (Z. 18149/18174) | Voll-Abgleich `E.set(wkFlat, true, fp, mods, mk)` in **einer** Nachricht; Einzelwerte über `wkSet` gesammelt [C] | `lf` reist in derselben Nachricht, vor `set` (§4.2) |
| `FX.lfoShape`, `FX.lfoBuffer` (`CYC` 1024), `FX.TempoLFO` (Z. 14995–15050) | nativer LFO als geschleifter Puffer, Phase über `L.start(songStart, bpm, when)` [C] | Puffer aus der Form (§4.4) |
| `syncLfoSet` (Z. 17686), `lfoAnchor()` = `R.startTime` (Z. 17674), `lfoSink` | `lkey` = `Form│Takt│Tempo` steckt in `skey`; ändert sich `skey`, werden **alle Routen-Gains neu gebaut** (`g._src.disconnect(g)`) [C] | Form-Hash **nicht** in `skey` (§4.4); `lfoSink` gilt auch hier |
| Lautstärke-Route Worklet (Z. 9763) | `vgain = level · vg · max(0, 1 + dst[D_AMP])` → LFO ±1 bei Menge 1,0 = Faktor 0 … 2 (+6 dB) [C] | Bibliotheksformen für Lautstärke gehen von 0 bis −1000 (§6.5) |
| Lautstärke-Route nativ (`syncLfoSet`, `ampK`) | Tremolo `1 − abs(amt)/4 + amt/4·lfo` → 0,5 … 1 bei Menge 1,0 [C] | nativ schließt ein Gate nie ganz (§10, §12) |
| `pageLfo(pg, i, n)` (Z. 28331) | Form-Leiste mit 5 Symbolen `LFO_SHAPE_ICO` (Z. 16797), FREI/TAKT, Rate/Takt, Start FREI/NOTE (`l1retrig`), Einblenden, Mod-Rad, Vorschau `.lfopv` 120–150 × 56 px (44 px im Querformat) mit Laufpunkt (`lfoPrevFrame`, Z. 28373) [C] | 6. Symbol ✎, Vorschau zeigt die Form, Tipp öffnet das Form-Blatt (§6.2) |
| `lfoNow` (Z. 26994) | Wert der LFOs für die Laufpunkte an den Reglern [C] | rechnet die Form mit derselben Formel und Phase |
| `LFO_SYNC` / `LFO_SYNC_LBL` (Z. 16714) | 32, 16, 8, 4, 3, 2, 1,5, 1, 0,75, 0,6667, 0,5, 0,375, 0,3333, 0,25, 0,1667, 0,125 Schläge = 8/1 … 1/2. … 1/4T … 1/32 [C] | punktierte und triolische Zyklen → Raster-Regel §6.3 |
| `PD['l1shape']` (Z. 16761), Bereich `l1shape: [0, 4, 1]` in `normAnalog` (Z. 13257), `LFO_FX_SHAPE` (Z. 16799) | Werte 0–4 [C] | Werte 0–5; **ältere Versionen klemmen 5 auf 4 (S&H)** → §3.7 |
| `normSynthP` (Z. 13341) | übernimmt nur bekannte Blöcke [C] | `l1f`/`l2f` neu übernehmen |
| DX-Export (Z. 32061) | Tabelle `{1: 0, 2: 1, 3: 3, 0: 4, 4: 5}[l1shape]` [C] | für 5 fehlt ein Eintrag → würde `undefined` schreiben; I3a legt die Annäherung fest |
| v2-API `LSH_V2` (Z. 27784), Zufalls-Klang (Z. 29769) | 4 Namen; Zufall wählt 0–2 [C] | `LSH_V2[5]` = `'drawn'` (nur lesen); der Zufall bleibt unverändert |
| MS 2000 `mkLfoV` (Z. 7835), Bedienfeld „wie am Gerät“ | eigene LFO-Wellen [C] | **keine** gemalte Welle auf dem Bedienfeld (Frage F1) |
| MS-2000-Mod-Sequenz `t[].seq` (`normMk` Z. 13095: `last` 1–16, `type` 0–3, `run` 0/1, `ks` 0–2, `res`, `q[k] = {k, m, v[16]}`), `sqPrep` (Z. 8027: Spiel-Reihenfolge `sqO` je TYP, Schrittdauern `sqD` aus Auflösung **und** Schrittlänge-SEQ = Ziel 2, Z. 8060), `seqToolsPop` (Block `sq-mk-src`, Z. 5887), `timApply` (Z. 4728, ein Undo + ganzer Klang), `mkSetP`/`E.mkSet` (Z. 17850) | TYP Rückwärts/Wechsel spielt die Schritte in anderer Reihenfolge; die Schrittlänge-SEQ dehnt die Zeit; KEY SYNC 0 = AUS (Song-Schlag) [C] | Einsetzen in Spiel-Reihenfolge nach Schrittzeiten (§4.7); Vorschau beim Einwischen über `E.mkSet` ohne Undo (§5.5) |
| Spur-Effekt `fx.pump` „Pumpen“ (Z. 16787, `FX.pump` Z. 15367) | Seitenketten-Ducking auf Kick oder 1/4, 1/8 [C] | **gleicher Name** wie die Bibliotheksform → bleibt unverändert, Hinweis in §12 |
| `haptic(kind)` (Z. 26684), `hapticInit` (Z. 26673) | `tick`/`snap`/`pop`, höchstens 1 je 30 ms, iOS über `HAP.lbl.click()` **aus dem Code** [C] | laut G9 §7.9 [W7] und I4 §7.3 [W3] auf aktuellem iOS vermutlich wirkungslos (ab iOS 26.5 abgestellt; aus `pointermove` nie eine Nutzer-Aktivierung) → nur Versuch, sichtbarer Ersatz ist Pflicht (§5.3) |
| `AU.outLat = devLat + graphLat` (`updateOutLat`, Z. 17417) | `devLat` = `outputLatency` bzw. `baseLatency`, **auf ≤ 0,1 s geklemmt**; `graphLat` = Vorausschau der Kompressoren ≈ 12 ms [C] | Einwischen nimmt den Ausgabe-Zeitstempel (§5.5) |
| `nvLockOf` (≈ Z. 34063) | Hinweisband VO-R1 sperrt nur bei Format > 5 oder fremder Engine [C] | reine Zusatzfelder sperren nicht → Vorwärtsschutz über `S.need` (§3.7) |
| I1 Fassung 2 (`n8/I1.md` §4.1, §4.2, §4.5, §6.2) | `S.sr.f` und `song.sr[].f` sind I3s Form (Objekt); vor I3 unverändert behalten (≤ 4 KB je Objekt); `S.need` mit `'lf'` vorgesehen; freier Platz 52 × 44 für den Kurven-Chip in jeder Feld-Fassung | I3 legt den Inhalt fest (§3.3) und nutzt den Platz unverändert (§6.8) |
| I2 Fassung 2 (`n8/I2.md` §5.1, §5.8, §5.9.5, §7) | `lanePut(t, s, path, werte[], {len, g})`, `lockPut(t, s, path, werte[], {g})` (beide I2a, ein Undo, Art Clip); freie Reihen ab Clip-Start `cs` mit Swing; `{kl}`/`{klSet}` tragen `lf` = `[k1 │ null, k2 │ null]`; L4: ≤ 8 Noten-Locks je Note | I3e nutzt beides (§4.7) |
| VV3 (Nachtrag 5) | „LFO als laufende Welle mit Phasenpunkt“, gerechnet wie die Klangerzeugung | nutzt `FORM.eval` und die Phase aus §4.3 |

---

#### 1. Ziel

Xander soll eine Bewegung, die er im Kopf hat, mit dem Finger in einen Takt malen können: ein Pumpen auf der Lautstärke, ein Gate-Rhythmus,
ein Wah-Muster auf dem Filter oder einen Triller auf der Tonhöhe. Er darf dabei schnell und ungenau sein. Beim Abheben räumt die App die Form
auf: Gerade Striche werden gerade Rampen, Stufen landen sauber auf dem Raster, gewollte Kurven bleiben Kurven, und er sieht, wie es einrastet.
Läuft der Loop, kann er die Form auch „einwischen“: Er bewegt den Finger nur hoch und runter, und die App schreibt die Höhe an die Stelle,
die er gerade hört. Eine Form wird als LFO-Welle benutzt, kann aber auch in die MS-2000-Mod-Sequenz, in eine Lock-Reihe oder als Kurve für die
Fahrt des Super-Reglers eingesetzt werden. Weil die Form fest am Song-Schlag hängt, klingt sie im Song, im Audio-Export und im Video jedes
Mal gleich. Gespeicherte Projekte klingen danach genau wie vorher.

#### 2. Umfang und Nicht-Umfang

**Umfang**
1. **Form-Kern (I3a):** Datenmodell der Form (§3), Auswertung `FORM.eval` mit geglätteten Kanten (§4.1), LFO-Form 5 im Worklet (VA, FM DX,
   FM-FELD über LFO 1) und auf dem nativen Weg (WT, ECO, Spur-Effekt-Routen), Lage am Song-Schlag, Anzeigen (Vorschau, Laufpunkte, VV3),
   DX-Export, v2-API, Mod-Übersicht, Vorwärtsschutz `S.need`.
2. **Aufräumen und Einwischen (I3b):** die Erkennung aus §5 als DOM-freies Modul `FORMCLEAN` mit Korpus-Test, Raster-Rechnung §6.3,
   Einwisch-Rechnung §5.5.
3. **Form-Blatt (I3c):** Malen, Übermalen, Einwischen samt Vorschau und Abbruch, Raster, Schalter „Aufräumen“, Infozeile, sichtbares
   Einrasten, Undo; Einstieg von der LFO-Seite; Hoch- und Querformat.
4. **Bibliothek (I3d):** Pumpen, Gate, Triller (fest im Code). „Meine Formen“ (auf dem Gerät) **nur nach F5 = ja**.
5. **Einsetzen (I3e):** Form → MS-2000-Mod-Sequenz (SEQ 1–3) und Form → I2-Reihe (frei oder an Noten).
6. **Super-Regler-Kurve (I3f):** Form als Verlauf von [bis zum nächsten Teil fahren] (I1), im Song gemerkt, gleich in Export und Video.
7. **Zusammenführen (I3g):** Regel-28-Golden, Regression, Fach-Prüfung, „Bitte prüfen“.

**Nicht-Umfang** (nicht bauen)
- Gemalte Welle auf dem MS-2000- und dem Bit-Mask-Bedienfeld (Frage F1, Vorgabe nein), auf North (hat keinen LFO).
- Gemalte Form in **FREI** (Hz, nicht am Takt). Der Vorschlag sagt „läuft fest am Song-Takt“ [X über die Freigabe].
- Knoten einzeln ziehen, Punkte-Editor, Spiegeln, Umdrehen, Glätten-Regler, Zufalls-Formen, mehr als drei Bibliotheksformen.
- Eine dauerhafte Verbindung zwischen einer Form und den Orten, an denen sie eingesetzt wurde (Frage F4, Vorgabe: Kopie).
- Überblenden zwischen zwei gemalten Formen (Morph); `l1f` ist „nur im Grundklang“ (kein Klangzustand, kein Lock, vgl. I2 `LKT` Klasse `s`).
- Neue Zykluslängen (z. B. „1 Takt“ in 5/4): das entscheidet T1 (§4.9).
- MIDI-Export der Form (LFOs gehen heute auch nicht in den MIDI-Export).

---

#### 3. Datenmodell (Format bleibt 5, nur zusätzliche Felder)

##### 3.1 Die Form

```js
form = {
  v: 1,                       // Versionsfeld (Regel 28)
  n: 'Pumpen',                // optional: Name, ≤ 24 Zeichen (Bibliothek); jeder neue Strich löscht ihn → Anzeige „Gemalt“
  k: [ [x, y, t, b], … ]      // Knoten, nach x sortiert
}
// x: ganze Ticks 0…768 = Anteil am Zyklus (1/768). Unabhängig von Tempo, Zykluslänge und Taktart: dieselbe Form passt auf jede Länge.
//    erster Knoten x = 0, letzter Knoten x = 768; höchstens zwei Knoten mit demselben x (= senkrechte Kante)
// y: ganze Zahl −1000…+1000 (= −1…+1)
// t: Art des Abschnitts bis zum nächsten Knoten: 0 Halten · 1 Gerade · 2 Kurve; beim letzten Knoten 0
// b: Biegung −100…+100, nur bei t = 2 (b = 0 wird zu t = 1)
// höchstens 65 Knoten (64 Abschnitte); nach dem Aufräumen höchstens 33 Knoten (32 Abschnitte)
```
- **Raster und Ticks:** Bei Zykluslängen aus Zweierpotenzen (8/1, 4/1, 2/1, 1/1, 1/2, 1/4, 1/8, 1/16, 1/32) liegen alle Rasterlinien aus §6.3
  auf ganzen Ticks (768 = 2⁸ · 3). Bei punktierten und triolischen Längen (1/2., 1/4., 1/8., 1/16., 1/4T, 1/8T, 1/16T) ist eine Rasterlinie
  oft keine ganze Zahl (Beispiel 1/2. mit Raster 1/16T: 42,67 Ticks). Dann rastet ein Knoten auf den **nächsten ganzen Tick** ein. Der Fehler
  ist ≤ ½ Tick = 1/1536 Zyklus, im ungünstigsten Fall (1/2. bei 40 BPM, Zyklus 4,5 s) ≤ 2,9 ms [A]. Der Klang folgt genau den gespeicherten
  Ticks; Worklet, nativer Weg und Anzeige rechnen mit denselben Zahlen.
- Größe: 1 Knoten ≈ 18 Zeichen JSON, eine Form ≤ 1,3 KB, typisch 0,2–0,6 KB. Gut für Online-Speichern und unter I1s Grenze (≤ 4 KB je Objekt).
- **Fest im Klang, keine Extra-Daten:** Jede benutzte Form steckt **als Kopie** im Klang bzw. im Song-Eintrag. Damit gilt Xanders Regel vom
  31.10. („fest IM Clip, beim Kopieren immer mit kopiert, keine Extra-Daten wie in vielen DAWs“). Eine Bibliotheksform wird beim Wählen
  kopiert, eine eingesetzte Form ebenso. Ein späteres Ändern ändert keinen anderen Ort (Frage F4, Vorgabe so) [A].
- `formNorm(f)`: prüft `v`, klemmt `y` und `b`, rundet `x` auf ganze Ticks, sortiert stabil, entfernt einen dritten Knoten mit gleichem `x`,
  setzt den ersten `x` auf 0 und den letzten auf 768 (fehlt einer: Knoten ergänzen mit dem Wert des Nachbarn). Bei mehr als 65 Knoten
  bleiben die ersten 64 plus der Endknoten. Bei weniger als 2 gültigen Knoten ist die Form ungültig. `n`: Steuerzeichen entfernt, ≤ 24 Zeichen.
  Feste Schlüssel-Reihenfolge `v, n, k`.

##### 3.2 Klang

```js
sound.p.l1shape = 5      // NEU als erlaubter Wert: 5 = Gemalt (0–4 wie bisher)
sound.p.l1f = form        // NEU, nur vorhanden, wenn je gemalt oder gewählt; bleibt erhalten, wenn man auf Sinus usw. zurückschaltet
sound.p.l2shape, sound.p.l2f   // genauso für LFO 2
```
- `normAnalog`: Bereich `l1shape`/`l2shape` wird `[0, 5, 1]` (Z. 13257). `normSynthP`: `if (p.l1f) { const f = formNorm(p.l1f); if (f) o.l1f = f; }`,
  ebenso `l2f`. **Steht `l1shape` auf 5 ohne gültige `l1f`, wird `l1shape` 1 (Dreieck)** [A] (immer gleich, damit Laden zweimal dasselbe ergibt).
- Bei Form 5 muss `l1sync > 0` sein. `normAnalog` setzt `l1sync = 4` (1/1), wenn `l1shape = 5` und `l1sync = 0` ist [A].
- `soundHash` ändert sich nur für Klänge mit Form (die Form steckt in `p`). Alte Klänge behalten ihren Hash.
- Sound sichern (Bibliothek), Kopieren/Einfügen, Spur duplizieren, Timbre kopieren und Klang-Lock (`clip.kl[].s`, I2) tragen `l1f`/`l2f` als
  tiefe Kopie mit.

##### 3.3 Super-Regler (nur mit I1)

```js
S.sr.f = form                                   // NEU (zu I1 §4.1): Kurve für die nächste Fahrt; fehlt = Gerade (wie I1)
song.sr = [{a, b, x0, x1, f?: form}]            // I1 §4.2: f ist I3s Form (Objekt) – I3 legt fest: f enthält die Form selbst
```
- `srNorm`/`srSongNorm` (I1) rufen ab I3 `formNorm` für `f` auf. Eine ungültige Form entfällt, und die Fahrt ist dann gerade. Vor I3 behält I1
  `f` unverändert als Objekt (I1 §4.1, ≤ 4 KB) und spielt die Fahrt als Gerade.
- Song-Werkzeuge (I1: `srShift`, `srClear`, `srTidy`, `srCutTo`, `srWrite`): `f` reist unverändert mit. **Kürzt** ein Werkzeug eine Fahrt,
  gilt `f` für die verbleibende Länge (die Form wird auf die neue Länge gedehnt, wie `x0`/`x1` nach I1s Regel bleiben) [A].
- Eine Fahrt ohne `f` ist genau die Gerade aus I1 (bitgleich, I3-30).

##### 3.4 Einsetzen: keine neuen Felder

- **MS-2000-Mod-Sequenz:** I3 schreibt einmalig in `p.mk.t[t].seq.q[k].v` (16 Werte) und `.m` (Bewegung) über `timApply`. Der Sound merkt
  sich keine Form (§6.6).
- **I2-Reihe:** I3 schreibt einmalig über `lanePut(t, s, path, werte[], {len, g})` (freie Reihe, `len` und `g` **unverändert** aus der Reihe)
  bzw. über `lockPut(t, s, path, werte[], {g})` (Reihe „An Noten“; `werte[]` je Raster-Schritt über die ganze Clip-Länge, `NaN` = nicht setzen).
  Beide legt **I2a** an (I2 §7 und §8, ein Undo, Art Clip).

##### 3.5 Meine Formen (nur nach F5 = ja) [V]

- Gespeichert im vorhandenen Geräte-Speicher `KV` unter `'forms'`: `[{id, n, k, at}]`, höchstens 64, neueste zuerst. Nicht im Projekt, nicht
  online (wie die Sound-Bibliothek) [A]. Im Projekt steckt jede benutzte Form ohnehin als Kopie.
- Die Liste liegt **nur auf diesem Gerät**. Safari kann Webseiten-Speicher nach 7 Tagen ohne Besuch löschen (Home-Bildschirm-Apps zählen
  eigene Tage, G9 [W8]). Die Hilfe sagt das in einem Satz; die Liste zeigt es klein unter der Überschrift („nur auf diesem iPhone“).
- Privates Fenster oder gesperrter Speicher: Liste leer, „Sichern“ grau mit Grund „Speicher nicht verfügbar“. Nichts wirft einen Fehler.

##### 3.6 Laufzeit (nicht gespeichert)

`UI.form = {target, raw: Int16Array(769) | null, lastStroke: {before, rawForm, cleanForm} | null, grid, mode: 'malen'|'wischen', clean: true,
pre: {…} | null, pvAt}`.
- `lastStroke` erlaubt das Umschalten von „Aufräumen“ für den letzten Strich, solange das Blatt offen ist (§5.4). Es wird **verworfen** bei
  ↶/↷, bei jeder anderen Änderung der Form (Bibliothek, Einsetzen) und beim Schließen.
- `pre` = gespeicherter Stand des Ziels vor der laufenden Geste (Tabelle bzw. Schrittwerte), damit ein Abbruch ihn sofort zurückschickt (§5.5).
- `R.lanePv = {t, clip, path, werte} | null`: Vorschau-Werte einer I2-Reihe während des Einwischens (§5.5).

##### 3.7 Ältere App-Versionen und Vorwärtsschutz

- **Versionen vor I1** klemmen `l1shape = 5` auf 4 (S&H), spielen Fahrten gerade und verwerfen `l1f`/`l2f` beim Speichern. Das Hinweisband
  VO-R1 erscheint dort **nicht**, denn `nvLockOf` sperrt nur bei Format > 5 oder fremder Engine [C]. Nachrüsten lässt sich das in alten
  Ständen nicht; die Pages-Seite liefert immer den neuesten Stand (wie I1 §4.5). Changelog-Hinweis.
- **Ab I1** (oder ab I3, wenn I3 zuerst zusammengeführt wird: dann legt I3a `S.need`/`KNOWN_NEED` genau nach I1 §4.5 an): Beim Speichern
  kommt `'lf'` in `S.need`, sobald irgendein Klang des Projekts (Spuren und Klang-Locks) eine `l1f`/`l2f` hat oder `S.sr.f`/`song.sr[].f`
  existiert. Ein Stand ohne I3 öffnet ein solches Projekt dann gesperrt mit dem vorhandenen Hinweisband und überschreibt nichts.
- `max_app` muss die I3-Version decken (Regel 20).

---

#### 4. Klang, DSP und Zeit

##### 4.1 Auswerten einer Form

```
FORM.eval(f, ph, e, o)     ph ∈ [0, 1) = Phase im Zyklus, e = Kantenbreite (Sekunden → je Kante umgerechnet), o = {wrap: true|false}
  u = ph · 768;  Abschnitt i mit x_i ≤ u < x_{i+1};  s = (u − x_i) / (x_{i+1} − x_i)
  t = 0 Halten:  y_i
  t = 1 Gerade:  y_i + (y_{i+1} − y_i) · s
  t = 2 Kurve:   y_i + (y_{i+1} − y_i) · g(s),   g(s) = (e^{κs} − 1) / (e^{κ} − 1),  κ = 0,06 · b   (b = ±100 → κ = ±6)
  Ergebnis / 1000 → −1…+1
Kanten: jeder Sprung (Ende eines Halten-Abschnitts mit y_{i+1} ≠ y_i, Abschnitt der Länge 0 und – nur bei wrap: true – Zyklus-Ende mit
  y_768 ≠ y_0) wird kausal als lineare Rampe ab der Sprungstelle gerechnet. Breite für die Kante vor dem Abschnitt j (Länge L_j, Sekunden
  beim aktuellen Tempo):
    e_j = min( L_j , max( e_min , min( 1 ms , ¼ · L_j ) ) ),     e_min = 2 · CR / SR   (48 kHz: 0,667 ms; 44,1 kHz: 0,726 ms)
  e_j ≤ L_j: Jede Rampe ist fertig, bevor der nächste Abschnitt beginnt. Die Form bleibt dadurch immer stetig.
LFO: wrap: true (die Form läuft im Kreis).  Super-Regler-Fahrt: wrap: false (die Form gilt einmal, §4.6).
```
- **Kurve:** `b < 0` = erst schnell, dann langsam (Pumpen-Erholung). `b > 0` = erst langsam, dann schnell. Bei `|κ| < 1e-4` wird `g(s) = s`
  gerechnet (kein 0/0).
- **Kantenbreite 1 ms** [A], wie MK6 „Stufe = 1-ms-Rampe“. Beispiele: Zyklus 1/1 bei 120 BPM, Treppe 16: e = 1 ms. Triller (24 Ticks) bei
  Zyklus 1/16 und 120 BPM: L = 3,9 ms → e = 0,98 ms. Triller bei Zyklus 1/32 und 120 BPM: L = 1,95 ms → e = 0,67 ms (Untergrenze).
  Besteht Gate → Lautstärke die Klick-Prüfung M-KLICK nicht (I3-06), wird „1 ms“ zu 2 ms. Das steht dann im Changelog.
- **Sehr feine Formen** werden **nicht** abgelehnt, sonst verschwände ein Triller bei kurzen Zyklen. Ist beim Abheben bzw. Einsetzen ein
  Abschnitt kürzer als 4 · e_min (48 kHz: 2,67 ms) beim aktuellen Tempo und Zyklus, meldet die Infozeile „Sehr fein für 1/32 bei 120 BPM:
  Kanten werden weicher“ [A]. Die Formel hält die Form trotzdem stetig.
- Dieselbe Funktion gibt es zweimal: im Worklet (ASCII, ohne Objekte) und im Haupt-Faden (`FORM.eval`). Ein Test vergleicht beide (I3-03).

##### 4.2 Worklet (`dirigent-analog`, AnalogCore)

- **Nachricht** `{lf: [a1, a2]}`, je LFO ein Eintrag: `Float32Array` (Tabelle, flach `[x/768, y/1000, t, b/100] × N`) · `null` (keine Form) ·
  `false` (unverändert, nur bei Live-Änderungen). `{kl}`/`{klSet}` aus I2 tragen dasselbe Feld (I2 §5.1: `[k1 │ null, k2 │ null]`).
- **Wann sie geschickt wird** – immer, wenn der Klang eine gültige `l1f`/`l2f` hat, **unabhängig von `l1shape`**. Alte Klänge haben keine
  `l1f`, darum bleibt für sie alles byte-gleich (I3-01):
  (a) beim Bau der Engine (`newEngine`) in der ersten Nachricht und beim Voll-Abgleich (`syncEngine(i, true)`): `E.set(…, lf)` packt `lf`
      **in dieselbe Nachricht** wie `set`;
  (b) bei **jeder** Änderung von `l1f`/`l2f` – Malen, Bibliothek, Undo/Redo, A/B, Klang laden oder einsetzen, Klang-Lock bearbeiten –
      über `wkLf(i, n, f)`: die Tabelle wird bei `wkSet` gesammelt, und `wkFlush` schickt `{lf, set}` in **einer** Nachricht;
  (c) als Vorschau beim Einwischen höchstens 30-mal je Sekunde (gleicher Weg wie b, ohne Undo, §5.5);
  (d) beim Laden eines Klang-Locks (I2 `{kl: {…, lf}}`) für den Nebenkern.
  `E.lfSig[n]` (Hash der zuletzt geschickten Tabelle) verhindert doppeltes Senden; eine neue Engine hat keinen Hash und bekommt die Tabelle.
- **Reihenfolge:** `onMsg` übernimmt `m.lf` **vor** `m.set`. Darum gibt es nie einen Render-Block, in dem Form 5 schon gilt, die Tabelle aber
  fehlt. Ein bloßes Umschalten auf ✎ (`setP` → `wkSet {l1shape: 5}`) braucht keine Tabelle mehr, denn sie liegt seit dem Laden dort.
- **Stufige Umschaltung durch andere Pakete:** Der Super-Regler (I1 `SRstufe_k`, Vormachen) und V6a-`disc` können `l1shape` auf 5 stellen.
  Der Haupt-Faden schickt den stufigen Wert 5 nur für einen Klang mit gültiger `l1f`, sonst 1 (Dreieck, wie §3.2) [A]. Malen während des
  Vormachens ist gesperrt (§6.3); eine `l1f` gehört immer zum Grundklang.
- **Speicher:** je LFO zwei vorab angelegte `Float64Array(4 · 65)` (aktiv und alt) und eine Zählvariable. Der Empfang kopiert in die freie
  Tabelle und tauscht dann. In `process()` gibt es keine Allokation.
- **Wechsel ohne Klick:** Kommt eine neue Tabelle, während die Form klingt, blendet `lfoVal` **5 ms** linear von alt nach neu
  (Zähler im Steuer-Takt: 5 ms / (CR/SR) = 15 Steuerblöcke bei 48 kHz).
- **Phasensprung ohne Klick:** Springt die Phase eines Form-LFOs (Song-Schleife, Sprung im Song, §4.3) um mehr als 1e-6 gegen den erwarteten
  Fortschritt, gleitet der Ausgang mit demselben Zähler in 5 ms vom zuletzt ausgegebenen Wert zum neuen. Beim ersten Block nach ▶ gibt es
  keine Blende (es gibt keinen alten Wert).
- **`lfoVal` Fall 5:** `case 5: return this.formVal(n, ph)`. Die Kantenbreite kommt aus der Zyklusdauer `l1sync · 60 / bpm`, die `control()`
  ohnehin kennt (`r1`). Abschnittssuche mit Merker je LFO und je Stimme (die Phase läuft vorwärts → im Mittel O(1)), bei einem Rücksprung
  Binärsuche über ≤ 65 Knoten.
- **Fehlt die Tabelle trotzdem** (Fehlerfall), liefert Fall 5 das Dreieck (wie §3.2) und zählt `lfMiss`. In allen Abnahmen muss `lfMiss` 0 sein.
- **Ohne Form 5** wird der neue Code nie erreicht (gleicher `switch`, Fall 5 steht vor `default`). Die übrigen Formen bleiben bitgleich.

##### 4.3 Takt-Lage am Song-Schlag (gleich in Song, Export und Video)

- Eine gemalte Form läuft **immer im TAKT** (`l1sync` > 0, Werte aus `LFO_SYNC` 8/1 … 1/32, Vorgabe beim ersten Wählen: **1/1 = 4 Schläge**).
- **Phase (nur Form 5, Start FREI):** `ph = frac(B_s / l1sync)`. `B_s` ist der **Song-Schlag** = Transport-Schlag − `off` (vor dem
  Rücksprung `prev`), genau wie `songBeatOf()` (Z. 19705) und wie die MS-2000-Sequenz bei KEY SYNC AUS (Z. 8133). Ohne Song (Matrix) ist
  `off` = 0: Die Phase zählt ab ▶, wie heute jeder TAKT-LFO [A]. Die Formen 0–4 bleiben bei der Transport-Lage (Regel 28).
  - **Worklet:** `b = (frame·ISR − songStart) · bpm / 60; if (sqSong) b −= (sqSong.wrap != null && b < sqSong.wrap − 1e-9) ? sqSong.prev :
    sqSong.off`. Das ist die vorhandene Nachricht `{mkSong: {off, prev, wrap}}` von `mkSongSync()`; sie geht schon heute an jede
    Synth-Engine und kommt vor dem Rücksprung an, weil der Planer vorausläuft [C]. **Keine neue Nachricht.** Einzige Ergänzung: Eine **neu
    gebaute** Engine, deren Klang eine Form hat, bekommt `mkSong` sofort mit (sonst rechnet sie bis zum nächsten Planer-Takt, ≤ 25 ms, mit
    der Transport-Lage). Klänge ohne Form bleiben beim heutigen Ablauf (I3-01).
  - **Nativ:** Anker `formAnchor(t)` = `b2t(t2b(t) − songBeatOf(t2b(t)))` = Audiozeit von Song-Schlag 0, gültig zur Zeit `t`; ohne Song
    `lfoAnchor()`. Start: `L.start(formAnchor(now), S.bpm, now)`. Bei einem Rücksprung (neues `wrapAt`) setzt `nlSongSync()` – im Planer
    direkt nach `mkSongSync()`, nur für Spuren mit nativer Form 5 – den Puffer zur Zeit `b2t(wrapAt)` mit dem neuen Anker fort (Blende 5 ms, §4.4).
- **Folgen** (alle mit I3-04/I3-05 geprüft):
  - Song-Start an Takt n: `B_s = 4·(n − 1)`, also `ph = frac(4·(n − 1) / l1sync)`. Bei 1/1 ist das immer 0; bei 2/1 ist es an ungeraden
    Takten 0 und an geraden 0,5; bei 1/2. (3 Schläge) an Takt 2 ⅓.
  - Übergabe Matrix → Song (`songPlayStartAt`): dieselbe Phase wie beim Start an diesem Takt, egal wie lange vorher die Matrix lief.
  - Song-Schleife oder Sprung: Die Phase springt auf die des Ziel-Schlags, der Wert gleitet in 5 ms (§4.2). Nach jedem Durchlauf ist es
    dieselbe Stelle.
  - Tempo-Wechsel: Das Worklet verankert `songStart` neu (`tempoAt`); der Song-Schlag und damit die Phase laufen stetig weiter.
  - Export-Ausschnitt ab Takt 5: Offline startet der Song bei `bar0 = 4`, also `off = −16`, und die Phase ist die des Live-Songs an Takt 5.
  - **Start NOTE:** Die Phase beginnt je Stimme bei 0 (Z. 9619), unabhängig vom Song. Auch das ist deterministisch, weil es nur von den
    Notenzeiten abhängt.
- Ohne laufenden Transport (Vorhören auf der Tastatur) läuft die Phase frei. So ist es heute auch.
- **Offline (Audio-Export, Video VV1):** Der Offline-Planer ruft denselben `songTick` und `mkSongSync`; `vvSwapIn` ruft `syncEngines()`, so
  hat jede Engine `lf` und `mkSong` vor dem ersten Block. Zwei Offline-Render sind bitgleich, und offline klingt wie live (I3-05).

##### 4.4 Nativer Weg (WT, ECO-Rückfall, `?engine=native`, Spur-Effekt-Routen `fx.*`)

- `LFO_FX_SHAPE[5] = 'form'`. `FX.lfoBuffer(ctx, 'form', seed, {form, e})` baut **einen** Zyklus aus **2048** Samples:
  `d[i] = FORM.eval(form, i / 2048, e, {wrap: true})` mit `e` = 1 ms bezogen auf die Zyklusdauer beim aktuellen Tempo (mindestens 1 Puffer-Sample).
- **Formwechsel ohne Routen-Neubau:** `lkey` bleibt `'form' + '|' + sync + '|' + S.bpm` **ohne** Form-Hash; damit ändert sich `skey` beim
  Malen nicht, und die Routen-Gains bleiben dieselben Objekte. Der Hash steht nur in `nl.fh[k]`. Ein neuer Schritt `nlForm(A, P, k)` läuft am
  Ende **beider** Zweige von `syncLfoSet` (auch im frühen Rücksprung „nur Mengen geändert“): Ist der Hash anders, ruft er
  `L.setForm(buf, formAnchor(now), now)`.
- **`L.setForm` / `L.jump`** (nur für TempoLFOs der Form `'form'`): Jede Quelle hat eine eigene kleine Gain vor `L.out`. Die neue Quelle startet
  phasengleich am Anker, ihre Gain fährt in 5 ms von 0 auf 1, die alte in 5 ms von 1 auf 0 und wird nach 20 ms gestoppt. `L.out` und alle
  Routen bleiben unberührt. `L.jump` (Schleifen-Rücksprung, §4.3) macht dasselbe mit demselben Puffer und neuem Anker zur Zeit `b2t(wrapAt)`.
  TempoLFOs der Formen 0–4 bekommen diese Gain nicht; ihr Audio-Graph bleibt unverändert (I3-01).
- **Tempo-Wechsel:** wie heute bei jedem TAKT-LFO (Schlüssel mit `S.bpm`, Neustart über `start`), für Form 5 mit `formAnchor(now)` statt
  `lfoAnchor()`. Der Puffer wird mit der neuen Kantenbreite neu gebaut.
- `lfoSink` hält auch diesen LFO am Laufen (K1-Fix „LFOs halten an“).
- **Bekannter Unterschied (nicht Teil von I3, Regel 28):** Die native Lautstärke-Route ist ein Tremolo von 0,5 … 1 bei Menge 1,0
  (`syncLfoSet`, `ampK`). Ein Gate schließt dort nicht ganz (an ≈ −2,5 dB, aus ≈ −6 dB gegen trocken), im Worklet schon. Steht in §10 und §12.

##### 4.5 Anzeigen (eine Formel für alles)

- `lfoNow(i, P, n, t)` (Laufpunkte an den Reglern), Vorschau `drawShape` und `lfoPrevFrame` (Laufpunkt) rufen für Form 5 `FORM.eval` mit der
  Phase aus §4.3 (`songBeatOf(t2b(t))` im Song, sonst Transport). Die **Vorschau zeigt bei ✎ einen Zyklus** über die ganze Breite (statt
  zwei). So ist die gemalte Form lesbar [A].
- **VV3 (Video, Innenleben):** Die LFO-Welle mit Phasenpunkt nutzt `FORM.eval` und dieselbe Phase wie §4.3. Das Bild stimmt also mit dem Klang
  (VV3-01: ± 2 % Phase).
- **Mod-Übersicht (K1, `k1Mods`):** Die Quelle heißt bei Form 5 „LFO 1 ✎“ bzw. „LFO 1 ✎ Pumpen“ (mit Namen). Es gibt keine neuen Zeilen, denn
  die Form ist keine Modulation, sondern die Welle einer vorhandenen Quelle.

##### 4.6 Super-Regler-Fahrt mit Kurve (I3f, nur mit I1)

```
G(u) = (FORM.eval(f, u, e_r, {wrap: false}) + 1) / 2   für u ∈ [0, 1)   und   G(1) = (y_768 / 1000 + 1) / 2
F̂(u) = G(u) − G(0) · (1 − u) + (1 − G(1)) · u          → F̂(0) = 0 und F̂(1) = 1 genau
x(t) = clamp( x0 + (x1 − x0) · F̂(u), 0, 1 ),   u = (t − t0) / (t1 − t0),   e_r = 0,020 s (Kantenbreite, Formel §4.1 mit 20 ms statt 1 ms)
```
- **Ohne Zyklus-Kante** (`wrap: false`): Die Form gilt einmal. `G(0)` ist der Wert des ersten Knotens, `G(1)` der des letzten. Bei Pumpen
  (Knoten 0 bei −1000) ist `G(0)` = 0, bei Triller (Knoten 0 bei 0) ist `G(0)` = 0,5.
- Die Form wird **einmal über die ganze Fahrt gedehnt** (Frage F2). Die Korrektur `F̂` sorgt dafür, dass die Fahrt **genau** bei der aktuellen
  Stellung beginnt und genau am Ziel endet (I1 §5.6: „kein Sprung“). Eine Form, die links unten beginnt und rechts oben endet, bleibt unverändert.
- **Kanten der Fahrt** bekommen **20 ms** statt 1 ms. Das ist dieselbe Zeit wie die Glättung der Stellung in I1 §5.3, weil Sprünge der Stellung
  viele Regler zugleich bewegen.
- **Worklet:** I1s Nachricht `{sr: {ramp: {x0, x1, t0, t1, k?}}}` trägt in **`k`** die Knoten wie §4.2. Ohne `k` ist sie die Gerade aus I1, und
  die Nachricht bleibt byte-gleich. Mit `k` rechnet `SRCore` `x(t)` je 128er-Block exakt (keine Glättung, wie die Gerade).
- **Nativ und Drums** (I1 §5.5: Stufen alle 16 ms, `srAt(t)` je Schlag) rechnen `x(t)` mit `FORM.rideAt(entry, t)`, derselben Formel im
  Haupt-Faden.
- **Matrix-Fahrt** (nicht gespeichert) nutzt `S.sr.f`. **Song-Fahrt** nutzt `song.sr[i].f` (beim Merken aus `S.sr.f` kopiert).

##### 4.7 Einsetzen: Abtastung

- **Fenster** eines Schritts j: `[s_j, s_{j+1})` als Anteil am Zyklus der Form. **Mittelwert** `w̄_j` = Mittel von
  `FORM.eval(f, s_j + (m + 0,5)/32 · (s_{j+1} − s_j), 0)` über m = 0…31 (32 Teilpunkte, ohne Kanten). **Wert am Schrittbeginn** `w_j = FORM.eval(f, s_j, 0)`.
- **MS-2000-Mod-Sequenz:**
  - **Zyklus der Form = der erste Durchlauf der Sequenz.** Reihenfolge wie `sqPrep` (Z. 8029): TYP Vorwärts spielt Schritt 1 … L, TYP Rückwärts
    L … 1; TYP Wechsel 1/2 spielt hin und zurück – dann gilt der **Hin-Weg** als Zyklus, und die Sequenz spielt die Form danach gespiegelt
    zurück. Die Infozeile und das LCD sagen das: „TYP WECHSEL: FORM LÄUFT HIN UND ZURÜCK“.
  - **Schrittzeiten:** Die Fenster folgen den **tatsächlichen** Schrittdauern `D_s` (Auflösung plus Schrittlänge-SEQ, Ziel 2, wie Z. 8060):
    `s_j = (Σ_{i<j} D_{O[i]}) / C`, `C` = Summe über den Zyklus. Ist das Ziel selbst die Schrittlänge-SEQ, gelten gleich lange Fenster (die
    Werte bestimmen dort ja die Zeit). Der Wert des Fensters an Spiel-Position j geht in den Schritt `O[j]`.
  - Bewegung: **Stufe**, wenn die Form nur aus Halten-Abschnitten besteht, sonst **Glatt** [A]. Werte: Stufe → `w̄_j`, Glatt → `w_j`.
  - `v = round(w · R · τ)`, `R` = 63 (Tonhöhe und OSZ2-Halbton: 24, Schrittlänge: 6, wie MK6), `τ` = Tiefe 0–100 % (Vorgabe 100 %).
    Die Schritte nach LÄNGE `last` bleiben unverändert. LAUF EINMAL: Die Form läuft einmal je Start (nichts weiter zu tun).
- **I2 freie Reihe:** Die vorhandene Länge `len` und das Raster `g` der Reihe **bleiben**. Zyklus der Form = `len · GRID[g]` Schläge,
  Fenster `s_j = j / len`. `lanePut` mit unverändertem `{len, g}`. Swing ändert nur, **wann** ein Schritt klingt (I2 §5.8), nicht seinen Wert.
- **I2 Reihe „An Noten“:** Zyklus = **1 Takt** (heute 4 Schläge; unter T1 die Taktlänge, §4.9), wiederholt über alle Takte des Clips. Jede
  Note gehört nach I2 L6 zum nächsten Schritt `k` des Reihen-Rasters (auch ROLLE-Noten außerhalb des Rasters); ihr Wert ist `w̄` des Fensters
  `[(k·sb) mod Z, (k·sb) mod Z + sb)` mit `Z` = Taktlänge. `werte[]` hat einen Eintrag je Raster-Schritt über die ganze Clip-Länge, `NaN`
  ohne Note. Noten, die den Pfad noch nicht tragen und schon 8 Locks haben (I2 L4), weist `lockPut` ab.
  Die Infozeile meldet einmal: „n Werte entfallen (a ohne Note, b wegen 8 Locks je Note)“.
- **Reglerraum (beide I2-Fälle):** `x_j = Unten + (w̄_j + 1)/2 · (Oben − Unten)`, auf 1/1000 gerundet. Stufige Ziele (`vals`) werden auf den
  nächsten erlaubten Wert gerundet. Vorgabe `Unten`/`Oben` = Reglerstand des Grundwerts ∓ 0,25, geklemmt auf 0…1 [A].

##### 4.8 CPU- und Zeitrahmen (M-CPU: Chromium-Worklet, Median 10 s; iPhone-Faktor 1,5–2,5 × angenommen wie in I2)

| Teil | höchstens |
|---|---|
| ohne Form (`l1f`/`l2f` fehlen) | **± 0** (gleicher Weg, bitgleich) |
| LFO 1 + 2 gemalt, Start FREI (einmal je Steuerblock, Song-Schlag inklusive) | + 0,02 Prozentpunkte gegenüber Dreieck |
| LFO 1 + 2 gemalt, Start NOTE, 8 Stimmen (je Stimme) | + 0,15 Prozentpunkte gegenüber Dreieck |
| Tabellen-Wechsel oder Phasensprung (5-ms-Blende) | keine Spitze > + 0,05 Prozentpunkte |
| Speicher im Worklet | 2 LFOs × 2 Tabellen × 65 × 4 × 8 Byte ≈ 8 KB je Spur, beim Bau angelegt |
| Haupt-Faden: Zeichnen des Felds | ≤ 2 ms je Bild (Median), ≤ 60 Bilder/s, nur bei offenem Blatt |
| Haupt-Faden: Aufräumen beim Abheben | ≤ 5 ms (Median), ≤ 20 ms mit 4-fach gedrosselter CPU; keine Aufgabe > 50 ms |
| Einwischen: Vorschau an die Engine | ≤ 30 Nachrichten je Sekunde, je ≤ 1,1 KB (LFO) bzw. ≤ 16 Werte (MS 2000) |
| nativer Puffer neu bauen | ≤ 1 ms (2048 Werte) |

**Unter Last** ändert sich nichts am Klang (K1-Antwort 2 [X]). Formen werden nie vereinfacht.

##### 4.9 Taktarten (T1, kommt später) – jetzt festgelegt

Xander hat am 31.10. ~17:35 Taktarten freigegeben (T1: 3/4, 6/8, 5/4, 7/8 …; „Raster, Metronom, Quantisieren, Gesang, Video ziehen mit“).
T1 wird erst nach den Gesang-, Video- und North-Zusammenführungen gebaut. Für I3 gilt schon jetzt:
- `l1sync` bleibt in **Schlägen** gespeichert (wie heute), `x` bleibt Anteil am Zyklus. Eine Form muss unter T1 **nie umgerechnet** werden;
  alte Formen klingen unverändert (Regel 28).
- Die Phase rechnet in Song-Schlägen (§4.3). T1 muss `songBeatOf()` in Schlägen halten; dann gilt §4.3 unverändert.
- Die Infozeile nennt den Zyklus mit seinem Namen aus `LFO_SYNC_LBL` („1/1“, „1/2.“). Das Wort „Takt“ steht dort nur, wenn der Song in 4/4 ist
  (heute immer); sonst „1/1 = 4 Schläge“.
- Pumpen, Gate und Triller sind Formen für einen 4/4-Takt (4 Viertel bzw. 16 Sechzehntel je Zyklus 1/1). Ob T1 Zykluslängen „1 Takt der
  Taktart“ (z. B. 5 Schläge) ergänzt, entscheidet T1; die Raster-Regel aus §6.3 deckt solche Längen schon ab (5/4 mit 1/16 = 20 Felder,
  Linien auf dem nächsten ganzen Tick).
- Reihen „An Noten“ (§4.7): Zyklus = Taktlänge des Clips, die T1 festlegt; bis dahin 4 Schläge.

---

#### 5. Aufräumen (Erkennung) und Einwischen

##### 5.1 Eingabe beim Malen

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

##### 5.2 Aufräumen: Schritte und Zahlen

Gerechnet wird nur auf dem berührten Bereich, ± ein Rasterfeld zum Verbinden mit den Nachbarknoten. `y` in Einheiten von 1/1000, volle Höhe = 2000.
`Z` = Feldbreite in Ticks nach §6.3 (reelle Zahl; 1/1 mit 1/16 → 48). „Rasterlinie“ = Linie aus §6.3, auf den nächsten ganzen Tick gerundet.

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
   Dann bekommen alle Stufen die gleiche Länge (Median, auf ganze Felder gerundet, ab der ersten Kante; Kanten auf den Rasterlinien) und gleich
   große Sprünge (gleichmäßig vom ersten bis zum letzten Wert, auf 5 gerundet).
9. **Zusammenfassen:** Nachbar-Geraden mit Steigungen innerhalb ±10 % werden eins. Nachbar-Halten mit |Δy| ≤ 20 werden eins.
10. **Grenze:** Hat die **ganze** Form danach mehr als 32 Abschnitte, wiederholt die App die Schritte 2–9 **nur im berührten Bereich** mit
    ε · 1,25 (höchstens 6-mal). Der Rest der Form wird nie vereinfacht (I3-15). Reicht es nicht, wird der Strich verworfen: Infozeile „Zu viele
    Abschnitte – Strich nicht übernommen“, die Form bleibt deep-equal, kein Undo-Eintrag.
11. **Naht:** Ist |y_768 − y_0| ≤ 60, wird `y_768 = y_0` gesetzt. Dann springt die Form an der Zyklusgrenze nicht.

Ergebnis: neue Knotenliste und Zählung `{rampen, stufen, kanten}` für die Infozeile.

##### 5.3 Rückmeldung beim Einrasten [V]

**Pflicht ist das Sichtbare** (abnahmerelevant, I3-40):
- Beim Abheben gleitet die blasse Rohlinie (40 % Deckkraft) in **150 ms** in die aufgeräumte Form (bei `prefers-reduced-motion` ohne Gleiten,
  sofort).
- Erkannte Treppen und Geraden leuchten 300 ms in der Spurfarbe auf.
- Während des Malens hebt sich jede **Viertel-Linie**, die der Finger überquert, für 120 ms hervor (doppelte Stärke, Spurfarbe).
- Die Infozeile meldet „Aufgeräumt: 2 Rampen · 8 Stufen“ (Zahlen aus §5.2).

**Haptik ist nur ein Versuch** (wie G9 §7.9 und I4 §7.3): Beim Abheben ruft die App einmal `haptic('snap')` (wenn `UI.haptics` an). Das wirkt
nur auf iOS-Versionen, die den Klick aus dem Code noch zulassen (laut Bibliotheken iOS 17.4–26.4; ab 26.5 abgestellt [W]); `pointerup` ist
eine Nutzer-Aktivierung, darum ist es dort überhaupt möglich. **Während des Malens gibt es keinen `haptic`-Aufruf**: `pointermove` ist nie eine
Nutzer-Aktivierung, ein Tick käme nicht an. Ein echtes Label über dem Malfeld (der Weg von G9) geht hier nicht, denn Malen ist ein Ziehen und
kein Tipp. Kein Abnahmepunkt setzt fühlbare Haptik voraus; Xander meldet seine iOS-Version und ob er etwas spürt (§12.1).

##### 5.4 Aufräumen aus [V]

- Der Schalter **[Aufräumen ✓]** im Blatt (Vorgabe an, Wahl im Geräteprofil `uiPrefs`) gilt für die nächsten Striche.
- Ist er aus, laufen nur Schritt 1 und ein RDP mit ε = 10 (0,5 %). Alle Abschnitte werden dann „Gerade“, höchstens 64 (ε wächst bei Bedarf,
  sonst wie §5.2 Schritt 10 mit 64 statt 32).
- **Umschalten direkt nach einem Strich** wendet die neue Wahl auf **diesen** Strich an: `lastStroke`, ein Undo, Bezeichnung „Aufräumen an/aus“.
  Das geht bis zum nächsten Strich, bis zu ↶/↷ oder einer anderen Änderung der Form, oder bis das Blatt schließt (§3.6). Danach gibt es keine
  Rohdaten mehr (sie werden nicht gespeichert); der Schalter gilt dann nur für die nächsten Striche.

##### 5.5 Einwischen

**Wo es geht** – sonst ist [≋ Einwischen] grau und nennt den Grund:

| Ziel | Bedingung | gehörte Stelle `u` (0…768) |
|---|---|---|
| LFO-Form | ▶ läuft, Start FREI | `u = 768 · frac(B_s(t_h) / l1sync)` (§4.3) |
| MS-2000-Mod-Sequenz | ▶ läuft, KEY SYNC AUS (`ks` 0), TYP Vorwärts (`type` 0), LAUF Schleife (`run` 1) | Song-Schlag wie MK6 (Z. 8133): `p = B_s(t_h) mod C` (C = Summe der Schrittdauern `sqD`); Schritt und Anteil aus den tatsächlichen Schrittgrenzen, `u` = Fenster nach §4.7 |
| I2 freie Reihe | ▶ läuft, der Clip der Reihe spielt auf seiner Spur | nach I2 §5.8: `k = floor((B_h − cs)/sb)`, `j = d1Pos(…, k)`; Schrittgrenzen mit Swing `B + swingOffset(B − cs)`; `u = 768 · (j + Anteil im geswingten Schritt) / len` |
| I2 Reihe „An Noten“, Super-Regler-Kurve | – | immer grau |

Gründe: „Einwischen geht bei laufendem Loop (▶)“ · „Einwischen geht bei Start FREI“ · „Einwischen braucht KEY SYNC AUS, TYP VORWÄRTS und LAUF
SCHLEIFE“ · „Der Clip dieser Reihe spielt gerade nicht“ · „Einwischen geht bei freien Reihen“ · „Eine Fahrt wiederholt sich nicht“.
Bei Start NOTE, KEY SYNC Timbre/Stimme oder TYP Rückwärts/Wechsel gibt es keine eine „gehörte Stelle“ (jede Stimme bzw. Richtung läuft anders).

**Gehörte Zeit** je Ereignis (samt Zwischenpunkten); die waagrechte Lage des Fingers zählt nicht:
```
ts  = AU.ctx.getOutputTimestamp()          // einmal je Ereignis-Bündel
t_h = ts.contextTime + (e.timeStamp − ts.performanceTime) / 1000 − AU.graphLat − d_f
Rückfall (Funktion fehlt oder ts.contextTime = 0):
t_h = AU.ctx.currentTime − (performance.now() − e.timeStamp) / 1000 − AU.outLat − d_f
d_f = 0,030 s   (Finger → Ereignis) [A, am Gerät gemessen, §12.4]
B_h = t2b(t_h),  B_s(t_h) = songBeatOf(B_h) im Song, sonst B_h
```
- `contextTime` ist die Stelle, die **gerade am Ausgang** ist; die Verzögerung des Geräts steckt darin schon. `AU.graphLat` (Vorausschau der
  Kompressoren, ≈ 12 ms) kommt dazu. Der Rückfall nutzt `AU.outLat`, dessen Geräteanteil in `updateOutLat` auf ≤ 0,1 s geklemmt ist [C].
- Kabellose Kopfhörer verzögern oft 150–250 ms. Meldet der Browser `outputLatency` > 0,1 s, zeigt die Infozeile „Kabellose Ausgabe: die Lage
  kann versetzt sein“. Ohne diese Angabe gibt es keinen sicheren Ausgleich; der Gerätecheck misst Lautsprecher und Kopfhörer (I3-36), danach
  wird höchstens `d_f` angepasst.

**Schreiben:** Die Höhe des Fingers wird bei `u` in den Malpuffer gemalt, linear verbunden mit dem vorigen Punkt. Über die Zyklusgrenze geht es
bei 0 weiter, und nach einer ganzen Runde überschreibt die neue Runde die alte. Der berührte Bereich wird mitgeschrieben.

**Hören während der Geste (Vorschau, ohne Undo, ohne Speichern):** Höchstens alle 33 ms geht der Rohstand (RDP ε 10) an die Engine. Die
gespeicherten Daten bleiben unverändert, bis der Finger abhebt:
- LFO: nur `lf` (§4.2 c); `p.l1f` unverändert.
- MS 2000: nur die geänderten Schrittwerte über `E.mkSet({'t.<k>.seq.q.<j>.v.<s>': v, …})` – derselbe Weg wie das Ziehen einer Säule in
  SCHRITTE –, `p.mk` unverändert, **kein** `timApply`.
- I2 freie Reihe: `R.lanePv` (§3.6). `scheduleLanes` liest für genau diese Reihe die Vorschau-Werte statt der gespeicherten (Haken in I2,
  eine Zeile); **kein** `lanePut`.

**Abheben:** Aufräumen (wenn an), sichtbares Einrasten (§5.3), dann **einmal** schreiben: LFO über `commitSound` (Undo-Art `'sound'`),
MS 2000 über `timApply`, I2 über `lanePut`. Ein Undo je Wisch-Geste. Die Vorschau (`R.lanePv`, `pre`) wird gelöscht.

**Abbruch** – `pointercancel`, Blatt schließen, ■, ■■/Panik, Transport hält an, Szenen- oder Teilwechsel, der Clip der Reihe endet, Projekt
laden: Die Geste wird **verworfen** [A, auch für ■ mitten in der Geste], und der Stand von vorher geht **sofort** zurück an die Engine:
LFO → `lf` mit der Tabelle aus `p.l1f`; MS 2000 → `E.mkSet` mit den gespeicherten Werten der berührten Schritte; I2 → `R.lanePv` löschen und
neu planen (I2-Typ 12 „Reihen leeren ab Zeit“ und neues Planen, wie bei jeder Reihen-Änderung). Kein Undo-Eintrag. Danach steht der Modus
wieder auf Malen.

**Anzeige:** Ein senkrechter Laufstrich an der gehörten Stelle läuft über das Feld. Die Fingerhöhe ist ein Punkt auf dem Strich, und der
überschriebene Bereich ist hell hinterlegt.

---

#### 6. Bedienung

##### 6.1 Überblick: wo was erscheint [V]

| Ort | neu |
|---|---|
| Synth-Editor, Seite LFO 1 / LFO 2 (`pageLfo`) | 6. Form **✎** in der Form-Leiste; Vorschau zeigt die Form; Tipp auf die Vorschau bei ✎ öffnet das **Form-Blatt** |
| Form-Blatt | Malfeld, Malen/Einwischen, Raster, Aufräumen, Bibliothek, Infozeile, ↶ ↷, je nach Ziel Tiefe bzw. Unten/Oben; „Meine Formen“ nur nach F5 |
| MS 2000: Sequenz-Werkzeuge (`seqToolsPop`, SHIFT + 5) | Zeile **„Aus Form“** [S1] [S2] [S3] |
| I2: Reihen-Optionen [⋯] | Zeile **„Aus Form …“** |
| I1: Super-Regler-Feld | Chip **Kurve** (Mini-Kurve + ▾) auf dem von I1 freigehaltenen Platz; Teil-Blatt-Zeile der Fahrt zeigt die Kurve |
| Mod-Übersicht (K1) | Quelle „LFO 1 ✎ (Name)“ |

##### 6.2 LFO-Seite [V]

- Die Form-Leiste bekommt das 6. Feld **✎** (`LFO_SHAPE_ICO[5] = '✎'`, `LFO_SHAPE_NAME[5] = 'Gemalt'`, aria-label „LFO n Form Gemalt“), ≥ 44 × 44.
  Das Feld ist immer da, die Höhe der Seite ändert sich also nicht. In P3 (320 px) bricht die Zeile wie heute um, immer gleich.
- Der **erste Tipp auf ✎** (noch keine `l1f`) wählt Form 5, setzt TAKT 1/1, wenn FREI war, und legt als Startform ein **Dreieck** an
  (`[[0, −1000, 1, 0], [384, 1000, 1, 0], [768, −1000, 0, 0]]`, so hört man sofort etwas) [A]. Tabelle und Formwert gehen in einer Nachricht
  (§4.2). Dann öffnet sich das Form-Blatt. Das ist ein Undo („LFO 1 Form Gemalt“). Gibt es schon eine `l1f`, schaltet der Tipp nur auf ✎
  (ein Undo), ohne das Blatt zu öffnen.
- Bei ✎ ist **FREI grau** mit dem Grund „Gemalte Formen laufen im Takt“. Der Takt-Regler (Länge 8/1 … 1/32) bleibt bedienbar.
- **Vorschau** (`.lfopv`, ≥ 120 × 44): zeigt einen Zyklus der Form mit Laufpunkt, darunter klein den Namen („Pumpen“/„Gemalt“). Bei ✎ ist die
  Vorschau eine Taste, und ein Tipp öffnet das Form-Blatt. Bei anderen Formen tut ein Tipp wie heute nichts.
- Zurück auf Sinus usw.: `l1f` bleibt gespeichert, und ein späteres ✎ bringt die Form zurück.
- **Während des Vormachens (I1)** ist ✎ wählbar (stufiger Wert), aber das Form-Blatt öffnet nicht; ein Tipp auf die Vorschau meldet „Form im
  Grundklang malen (nach dem Vormachen)“ [A].

##### 6.3 Das Form-Blatt [V]

Das Blatt liegt **über dem Editor-Bereich** und lässt die Tastatur frei, damit man Noten spielen und die Form hören kann. Es hat eine feste Höhe
(oben die sichere Zone, unten die Oberkante von `#kbArea`), darum gibt es keinen Layout-Sprung (± 0 px). Es kommt aus dem Block `sq-form-src`.

**Hochformat (428 × 926; innen 396 px breit; Maße in px; alle Tasten ≥ 44 × 44):**
```
│ [◂ Fertig]   Form · LFO 1 · Synth 2                         [↶] [↷] │ 44
│ [Pumpen] [Gate] [Triller]   (nach F5 = ja: [Meine ▾] [＋ Sichern])   │ 44 (scrollt per Finger)
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │  Malfeld 396 × Rest (≥ 160; 428×926 mit Tastatur 170: ≈ 300)       │ │
│ │  Rasterlinien, Viertel kräftiger, Mittellinie, Form 2 px Spurfarbe │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│ 1/1 · 16 Felder · Aufgeräumt: 2 Rampen · 8 Stufen                    │ 24 Infozeile
│ [✎ Malen] [≋ Einwischen]   [Raster 1/16 ▾]   [Aufräumen ✓]           │ 44
│ (nur beim Einsetzen:)  [Tiefe 100 %]  bzw.  [Unten 30 %] [Oben 80 %] │ 56 Regler (senkrecht ziehen, Fein-Modus)
```
**Querformat (926 × 428; mit sicherer Zone ≈ 832 px breit; Blatthöhe ≈ 428 − Tastatur 110…150):**
```
│ [◂ Fertig] Form · LFO 1 · Synth 2   1/1 · 16 Felder · Aufgeräumt …      [↶][↷] │ 44
│ ┌──────────────────── Malfeld ≈ 648 × Rest (≥ 120) ────────────────┐ ┌────────┐ │
│ │                                                                  │ │Pumpen  │ │ rechte Spalte 168 px:
│ │                                                                  │ │Gate    │ │ Bibliothek als Liste (Zeilen 44,
│ └──────────────────────────────────────────────────────────────────┘ │Triller │ │ scrollt per Finger); nach F5 = ja
│ [✎ Malen][≋ Einwischen] [Raster 1/16 ▾] [Aufräumen ✓] [Tiefe …]       │(Meine) │ │ dazu Meine Formen, ＋ Sichern
```
- In L2 (667 × 375) ist das Malfeld ≈ 470 × 130. In P3 (320 × 568) ist es 288 × ≥ 160. Die Beschriftungen dürfen kürzer werden („Wischen“,
  „Aufr. ✓“), werden aber nie abgeschnitten (M-PLATZ mit echter App-Schrift).
- **Kopfzeile** nennt das Ziel: „Form · LFO 1 · Synth 2“, „Form → SEQ 2 · T1 · Synth 3“, „Form → Reihe ◆ OP 2 Pegel“, „Kurve der Fahrt“.
- **Raster und Felder:**
  - Wahl **Raster ▾** (nur beim LFO-Ziel): 1/4 · 1/8 · 1/16 · 1/32 · 1/8T · 1/16T (Vorgabe 1/16, gemerkt im Geräteprofil).
  - Feldbreite `Z = 768 · G / Zyk` Ticks (`G` = Raster, `Zyk` = Zykluslänge, beide in Schlägen; reelle Zahl). Rasterlinien bei `r · Z`
    (r = 0, 1, …), gezeichnet und eingerastet auf dem nächsten ganzen Tick. Zahl der Felder `N = ⌈Zyk / G⌉`. Ist `Zyk / G` keine ganze Zahl,
    ist das **letzte Feld angeschnitten** (endet bei 768); die Infozeile sagt dann „2 Felder + Rest“. Beispiele: 1/2. mit 1/16 → 12 Felder
    zu 64 Ticks; 1/2. mit 1/16T → 18 Felder zu 42,67 Ticks; 1/4T mit 1/16 → Linien bei 0, 288, 576, „2 Felder + Rest“; 1/8. mit 1/16 → 3 Felder.
  - Unter 2 Feldern wird automatisch das nächstfeinere Raster genommen (gibt es keines, bleibt das feinste, angeschnitten), über 64 das
    nächstgröbere.
  - **Beim Einsetzen** ist das Raster das des Ziels und die Wahl grau („Raster = Schritte der Sequenz“ bzw. „… der Reihe“): MS 2000 = die
    Schritte mit ihren tatsächlichen Dauern (§4.7), I2 frei = `len` Felder, I2 „An Noten“ = Schritte eines Takts im Reihen-Raster.
    Super-Regler-Kurve: Wahl „4 · 8 · 16 Felder“ (eine Fahrt hat keine feste Taktlänge).
- **Infozeile:** Zyklus mit seinem Namen aus `LFO_SYNC_LBL` (§4.9), Felder, Ergebnis des Aufräumens bzw. Hinweise (§4.1, §4.7, §5.2, §5.5).
- **Laufanzeige:** Bei ▶ läuft ein senkrechter Strich an der gehörten Stelle durch das Feld (≤ 30 Bilder/s, nur wenn sich etwas ändert).
- **Schließen:** mit [◂ Fertig], mit Editor schließen, Zurück zu SPIEL, Szenenwechsel, ■■/Panik, Projekt laden. Ein laufender Strich bzw. eine
  laufende Wisch-Geste wird dann wie `pointercancel` verworfen und der alte Stand zurückgeschickt (§5.5; Regel 6/10). Alles andere ist schon
  gespeichert.
- **Undo:** [↶] [↷] sind der normale Undo-Stapel. Ein Strich, eine Wisch-Geste, eine Bibliothekswahl und ein Umschalten von „Aufräumen“
  sind je ein Schritt. Die Undo-Art hängt vom Ziel ab (§6.9). ↶/↷ verwirft `lastStroke` (§3.6).

##### 6.4 Malen und Einwischen

- **[✎ Malen]** (Vorgabe): wie §5.1–5.3. Zwei Finger auf dem Feld tun nichts (kein Zoom).
- **[≋ Einwischen]:** wie §5.5. Die Wahl bleibt, bis man umschaltet. Hält der Transport an, wird eine laufende Geste verworfen (§5.5), und die
  Wahl springt auf Malen zurück.
- **Rand:** Das Feld beginnt ≥ 16 px vom Bildschirmrand. Ein `pointercancel` (z. B. eine Systemgeste vom Rand) verwirft den laufenden Strich,
  und die Form bleibt, wie sie war.

##### 6.5 Bibliothek [V]

Ein Tipp auf eine Bibliotheksform **kopiert** sie in das Ziel (ein Undo, Name wird übernommen). Feste Knoten [A] (Frage F3). Pumpen und Gate
gehen von **0 bis −1000**: Auf der Lautstärke ist „an“ dann genau der trockene Pegel und „aus“ Stille (Worklet: `vgain` mit Faktor 1 + LFO,
§0). Mit ±1000 wären die An-Schritte bei Menge 1,0 doppelt so laut (+6 dB).

| Name | Gedacht für | Knoten `[x, y, t, b]` (Zyklus 1/1) |
|---|---|---|
| **Pumpen** | Lautstärke | je Viertel q = 0…3: `[192q, −1000, 2, −60]`, `[192q + 134, 0, 0, 0]`; Ende `[768, 0, 0, 0]` (fällt auf jedem Viertel auf Stille, erholt sich in 70 % des Viertels auf den vollen Pegel, schnell zuerst) |
| **Gate** | Lautstärke, Filter | 1/16-Muster **x.xx.xx.x.xx.xx.** (Schritte 1, 3, 4, 6, 7, 9, 11, 12, 14, 15 an): je An-Schritt, i = Schritt − 1: `[48i, 0, 0, 0]`, `[48i + 41, −1000, 0, 0]` (85 % Länge); Ende `[768, −1000, 0, 0]` |
| **Triller** | Tonhöhe | 32 Abschnitte à 24 Ticks: `[24j, j gerade ? 0 : 1000, 0, 0]` für j = 0…31; Ende `[768, 1000, 0, 0]` (Wechsel alle 1/32 zwischen Grundton und oben; die Höhe des Trillers stellt die Route LFO → Tonhöhe ein) |

- Routen werden **nicht** automatisch angelegt (Regel 27). Man verbindet den LFO wie gewohnt (Regler halten → LFO 1). Auf der Lautstärke ist
  Menge 1,0 die volle Wirkung; auf dem nativen Weg (WT, ECO) schließt das Gate nicht ganz (§4.4).
- **Meine Formen (nur nach F5 = ja):** **[＋ Sichern]** fragt nach einem Namen (Vorgabe „Form n“) und speichert eine Kopie auf dem Gerät (§3.5).
  **[Meine ▾]** zeigt die Liste (Zeilen ≥ 44 px, Mini-Kurve links, scrollt per Finger, Hinweis „nur auf diesem iPhone“). Ein Tipp setzt die
  Form ein (Kopie, ein Undo), **[✕]** löscht nach Rückfrage. Löschen ist kein Projekt-Undo, denn die Liste gehört dem Gerät.
- In der Super-Regler-Kurve steht zusätzlich **[Gerade]** vorne. Das entfernt die Kurve.

##### 6.6 Einsetzen in die MS-2000-Mod-Sequenz [V]

- Im Werkzeug-Blatt der Sequenz (`seqToolsPop`) gibt es eine neue Zeile **„Aus Form“** mit [S1] [S2] [S3] (je ≥ 44 × 44), gleich gebaut wie
  die Zeilen „Neu“ und „Tauschen“. Das Bedienfeld selbst bleibt unverändert („wie am Gerät“).
- Ein Tipp öffnet das Form-Blatt mit dem Ziel „SEQ k · T n“. Die Startform ist die heutige Sequenz, als Form gelesen (Spiel-Reihenfolge und
  Schrittzeiten wie §4.7; Stufe → Halten-Abschnitte, Glatt → Geraden durch die Schrittwerte). Unten steht **[Tiefe 100 %]**.
- **Jeder fertige Strich** (bzw. jede Bibliothekswahl, jede Wisch-Geste) setzt sofort neu ein (§4.7) über `timApply(i, 'SEQ k aus Form', …)`,
  ein Undo. So hört man es im nächsten Durchlauf. Die LCD-Zeile meldet „SEQ 2 ← FORM · STUFE · 16“, bei TYP Wechsel zusätzlich
  „FORM LÄUFT HIN UND ZURÜCK“.
- Nach [Fertig] besteht keine Verbindung mehr (Kopie, F4). Wer danach die Säulen in der Ansicht SCHRITTE ändert, ändert keine Form, und
  umgekehrt (I3-28).
- Ziel, LÄNGE, TYP, LAUF, KEY SYNC und Auflösung der Sequenz bleiben, wie sie sind. Nur Werte und Bewegung ändern sich.

##### 6.7 Einsetzen in eine I2-Reihe [V] (nach I2a + I2c)

- In I2s Reihen-Optionen [⋯] gibt es die Zeile **[Aus Form …]** (≥ 44 px). Sie öffnet das Form-Blatt mit dem Ziel „Reihe ◆ ‹Name›“.
  Unten stehen **[Unten]** und **[Oben]** als kleine Regler im Reglerraum des Ziels, mit Anzeige in dessen Einheit (z. B. „800 Hz“).
- Jeder fertige Strich setzt neu ein (§4.7): bei einer **freien** Reihe `lanePut` mit der **vorhandenen** Länge und dem vorhandenen Raster
  (die Form wird auf `len` Schritte gedehnt; eine Länge 12 für Polymetrik bleibt 12), bei einer Reihe **„An Noten“** `lockPut` auf alle Takte
  des Clips. Je Strich gibt es ein Undo (Undo-Art Clip). Bei „An Noten“ steht der Hinweis „n Werte entfallen (a ohne Note, b wegen 8 Locks
  je Note)“ einmal in der Infozeile.

##### 6.8 Super-Regler-Kurve [V] (nach I1c + I1d + I1e)

- Im Super-Regler-Feld gibt es den Chip **Kurve** (52 × 44, zeigt eine Mini-Kurve von `S.sr.f`, sonst eine Gerade, dazu ▾). Er sitzt **genau auf
  dem Platz, den I1 (Fassung 2, §6.2) dafür freihält**: hochkant in der unteren Zeile zwischen NEIGEN und [⇥ …] (Fassungen G und M), quer am
  Ende der Ziel-Chip-Zeile (Fassung Q). **I3 ändert das I1-Layout nicht**; NEIGEN und [⇥ …] haben die Breiten aus I1 §6.2.
- Das Feld selbst wartet auf Xanders Antwort zu **I1-F1** (Ort und Form). Ändert die Antwort das Feld, folgt der Chip dem freien Platz, den I1
  dann festlegt; I3f baut den Chip erst, wenn I1d steht.
- Ein Tipp öffnet das Form-Blatt „Kurve der Fahrt“. Das Feld zeigt den Weg von unten (Startstellung) nach oben (Ziel), dazu dünn die korrigierte
  Kurve `F̂` (§4.6), so wie sie wirklich gefahren wird. Einwischen ist grau. Änderungen schreiben `S.sr.f` (Undo-Art `'sr'`).
- **Im Song:** Merkt I1 eine Fahrt (`song.sr`), kopiert es `S.sr.f` in den Eintrag. Die Teil-Blatt-Zeile „Super-Regler-Fahrt T. 13–17 [✕]“
  zeigt links die Mini-Kurve. Ein Tipp auf die Zeile öffnet das Form-Blatt für **diesen** Eintrag (Undo-Art `'song'`).
- Der Streifen der Fahrt in der Song-Ansicht (I1: steigender Keil) zeigt bei einer Kurve deren Verlauf statt des Keils (gleiche Höhe 8 px).

##### 6.9 Undo, Speichern, Hilfe, Test-API

- **Undo-Arten:** LFO-Form → `'sound'` (`soundSnapshot`/`commitSound`, z. B. „LFO 1 Form gemalt“, „LFO 1 Form Pumpen“); Mod-Sequenz → über
  `timApply` (Sound); I2-Reihe → Clip (I2); Super-Regler-Kurve → `'sr'` bzw. `'song'` (I1). Der „geändert“-Punkt erscheint sofort (Regel 7).
  Der Klang-„geändert“-Punkt und A/B folgen der LFO-Form (sie gehört zum Klang). Jede dieser Änderungen schickt die Tabelle nach §4.2 (b).
- **Hilfe:** drei Sätze (Mal-LFO, Aufräumen/Übermalen, Einwischen samt der Bedingungen aus §5.5) ohne Hersteller- oder Produktnamen; nach
  F5 = ja ein vierter Satz zu „Meine Formen“ (nur auf diesem Gerät, Safari kann sie löschen).
- **Test-API:** `SYNQUENZER.form = {get(i, n), set(i, n, f), eval(f, ph, e, o), clean(punkte, {grid, zyk, on}) → {f, stats}, raster(zyk, g),
  wisch(punkte, {ziel, ts}), abort(), lib(), mine(), put(ziel, f, opts), ride(eintrag, t), info() → {lfMiss, tabs, pv}}`. Dazu kommt der
  Worklet-Haken **`__lfoProbe(t, on)`**: je Steuerblock `{frame, b_s, ph1, v1, h1, ph2, v2, h2}` der Spur (`h` = Hash der aktiven Tabelle),
  ohne Oberfläche, und der Spion `hapSpy()` (Aufrufe von `haptic` mit Art und Zeit).

##### 6.10 Formate

Prüf-Formate (M-PLATZ, echte App-Schrift): **428×926** (Xander), **926×428**, P1 390×844, P2 375×667, P3 320×568, L1 844×390, L2 667×375
(sichere Zonen). In allen Formaten gilt: alle Tasten ≥ 44 × 44, Malfeld ≥ 120 px hoch, nichts abgeschnitten, keine waagrechte Seiten-Scrollleiste
(nur die Bibliotheks-Zeile scrollt), Höhe von Seite und Editor beim Öffnen und Schließen ± 0 px. Drehen des Geräts mit offenem Blatt baut das
Blatt in der anderen Anordnung neu, ohne Datenverlust (eine laufende Geste wird dabei verworfen, §5.5).

---

#### 7. Zusammenspiel mit vorhandenen und kommenden Paketen (im Code geprüft)

| Bereich | Stelle | Was I3 tut |
|---|---|---|
| Worklet VA/FM/FELD | `AnalogCore.lfoVal`, `control()` (Phasen `gl1/gl2`, `v.l1/v.l2`, `r1/r2`), `onMsg` (Z. 9297, `lf` vor `set`), `tempoAt`, `sqSong` | Fall 5, Nachricht `lf`, Song-Schlag-Phase für Form 5, 5-ms-Blenden, `lfMiss`, `__lfoProbe` |
| Engine-Abgleich | `syncEngine`, `syncEngines`, `newEngine`, `wkFlat`, `wkSet`/`wkFlush`, `mkSongSync` | `lf` immer bei vorhandener Form, in derselben Nachricht wie `set`; neue Engine mit Form bekommt `mkSong` sofort |
| Song-Lage | `R.songPlay` (`off`, `prevOff`, `wrapAt`), `songBeatOf`, `songPlayStart`/`songPlayStartAt`, `songTick` | nur gelesen; `nlSongSync` neben `mkSongSync` für native Form-LFOs |
| Nativ | `FX.lfoShape`, `FX.lfoBuffer`, `FX.TempoLFO` (`setForm`, `jump`), `syncLfoSet` (`nlForm`, `nl.fh`), `rebuildNativeLfos`, `formAnchor`, `lfoSink` | Puffer aus der Form, Wechsel ohne Routen-Neubau, Blende, Song-Schlag-Anker |
| Anzeige | `pageLfo`, `drawShape`, `lfoPrevFrame`, `lfoNow`, `modLive` | ✎, Vorschau, Laufpunkte |
| Daten | `normAnalog` (Z. 13257), `normSynthP` (Z. 13341), `normalizeSound`, `soundHash`, `PD['l1shape']`, `LFO_SHAPE_ICO/NAME`, `LFO_FX_SHAPE`, `S.need` | Bereich 0–5, `l1f`/`l2f`, `formNorm`, Merkmal `'lf'` |
| Export/Import | DX-`.syx`-Export (Z. 32061), DX-Import (Z. 31966), v2-API `LSH_V2` (Z. 27784), Zufalls-Klang (Z. 29769) | Export: Form 5 → nächstliegende DX-Welle nach Korrelation (Dreieck, Säge ab, Säge auf, Rechteck, Sinus), Hinweis „LFO-Form angenähert“; Import und Zufall unverändert; `LSH_V2[5] = 'drawn'` |
| Undo | `soundSnapshot`/`commitSound`, `timApply`, I1 `'sr'`/`'song'`, I2 Clip | ein Undo je Strich/Wahl/Wisch-Geste; Vorschau ohne Undo |
| Bedienung | `haptic` (nur `snap` beim Abheben, Versuch), `ctlPrecision` (Regler Tiefe/Unten/Oben), `openPop`, `lcdShow`, `safeRebuild(buildSynthEd)`, `uiPrefs` | sichtbares Einrasten, Fein-Modus, Raster/Aufräumen im Geräteprofil |
| Latenz | `AU.ctx.getOutputTimestamp`, `AU.graphLat`, `AU.outLat` (`updateOutLat`, Z. 17417) | Einwischen §5.5 |
| K1 Mod-Übersicht | `k1Mods` (`n5-br-K` Z. 31538), `k1FmxLfo` (Z. 31619) | Quellen-Text „LFO 1 ✎ (Name)“; FELD-LFO zeigt die Form ebenso |
| MS 2000 (MK6) | `t[].seq` (Z. 13095), `sqPrep` (`sqO`, `sqD`), `seqToolsPop`, `timApply`, `E.mkSet`, Ansicht SCHRITTE | Zeile „Aus Form“; Spiel-Reihenfolge und Schrittzeiten; Vorschau über `E.mkSet`; MK6-Suite muss grün bleiben; **keine** gemalte Welle am Bedienfeld (F1) |
| **I1 Super-Regler** (Fassung 2) | `S.sr.f`, `song.sr[].f`, `sr.ramp.k`, `SRCore`, `srAt`, Song-Werkzeuge, Teil-Blatt, Super-Regler-Feld §6.2, `R.sr.cap` (Vormachen), `S.need` | §3.3, §4.6, §6.8 (I3f nach I1c + I1d + I1e); Chip auf I1s freiem Platz, kein Layout-Eingriff; stufig 5 nur mit `l1f`; Malen im Vormachen gesperrt |
| **I2 P-Locks** (Fassung 2) | `lanePut`, `lockPut`, Reihen-Optionen [⋯], `scheduleLanes` (Haken `R.lanePv`), Klang-Lock `{kl}`/`{klSet}`, L4, L6 | §3.4, §4.7, §5.5, §6.7; Klang-Lock-Nebenkern bekommt `lf` mit (I3e nach I2a + I2c, Klang-Lock-Teil nach I2d) |
| I4 Tipp-Summen, G1–G9, VS-L/VS-P | Mikrofon, Takes, Songtext | kein Eingriff; Haptik-Befund von G9-61/I4-61 gilt auch hier |
| VV1–VV3 Video | `vvSwapIn`, Offline-Render (gleicher Planer mit `mkSongSync`); VV3 LFO-Welle | gleiche Nachrichten offline; VV3 zeichnet mit `FORM.eval` und der Phase aus §4.3 |
| Bit Mask (Nachtrag 7) | `synq-bm`, LFO §1.8 (8 Wellen, Phase 0 bei ▶) | keine gemalte Welle (F1); Formen wirken dort über I2-Reihen (I2g) und den Super-Regler (I1h) |
| North (Nachtrag 6) | `synq-md` | kein LFO; Formen über I2-Reihen auf `drum.*` |
| **T1 Taktarten** (später) | `songBeatOf`, Raster, `LFO_SYNC` | §4.9: Zyklus bleibt in Schlägen, Form zyklus-relativ, keine Umrechnung |
| Spur-Effekt Pumpen | `fx.pump`, `FX.pump`, `pumpSrc` | unverändert; nur Namensgleichheit mit der Bibliotheksform (§12) |
| FR1 Einfrieren (geplant) | – | Formänderung = neu rechnen wie eine Reglerdrehung |
| Online-Speichern | Format 5 | nur Zusatzfelder; `max_app` siehe Regel 20 |

---

#### 8. Unterpakete, Zweige, Dauer, Budget, Abnahme

**Ausgangsstand:** Hauptlinie mit K1 (4.25.0) und VV1 (Offline-Render für I3-05). VV3-Haken, sobald VV3 zusammengeführt ist.
**Zweige (Regel 29):**
- **A `i3-br-K`:** I3a → I3b (DOM-freier Kern, Song-Schlag-Lage, Aufräumen, Raster- und Einwisch-Rechnung).
- **B `i3-br-U`:** I3c + I3d gegen die hier festgelegte Schnittstelle (`FORM`, `FORMCLEAN` als Platzhalter, bis A zusammengeführt ist).
- Danach auf der Hauptlinie: I3e (MS-2000-Teil sofort, I2-Teil nach I2a + I2c) → I3f (nach I1c + I1d + I1e) → I3g.
- Die Schnittstellen (§3, §4.2, §4.3, §4.6, §5.5, §6.9) ändern sich im Bau nicht. Mit zwei Helfer-Sitzungen sind es ≈ 11–14 h Kalenderzeit.
- „Meine Formen“ (I3d) wird nur nach F5 = ja gebaut; alles andere wartet auf keine Antwort (ohne Antwort gilt die Vorgabe von F1–F4).
- Jede Stufe hat Changelog, Snapshot und eine „Bitte prüfen“-Liste (Regel 22).

| Paket | Inhalt | Dauer | Budget |
|---|---|---|---|
| I3a | Form-Kern: Daten, `formNorm`, `FORM.eval` (mit `wrap`), Worklet Fall 5 + `lf` (vor `set`) + Blenden, Song-Schlag-Phase, nativer Puffer mit `setForm`/`jump`/`formAnchor`/`nlSongSync`, Anzeigen, DX-Export, v2-API, K1-Text, VV3-Haken, `S.need` | 5–6 h | +8 KB (davon ≈ 3 KB ASCII im Worklet) |
| I3b | `FORMCLEAN`: Aufräumen §5.2, Aufräumen aus §5.4, Raster-Rechnung §6.3, Einwisch-Rechnung §5.5 (alle drei Ziele, Ausgabe-Zeitstempel), Korpus-Test | 3–4 h | +6 KB (im Block bei Bedarf) |
| I3c | Form-Blatt hoch/quer, Malen, Übermalen, Einwischen mit Vorschau und Abbruch, Raster, Schalter, Infozeile, sichtbares Einrasten §5.3, LFO-Seite ✎ | 5,5–6,5 h | +14 KB im Block bei Bedarf, +1 KB Seite |
| I3d | Bibliothek Pumpen/Gate/Triller; nach F5 = ja zusätzlich Meine Formen (KV, +1 h, +2 KB) | 0,5–1 h | +1 KB (im Block bei Bedarf) |
| I3e | Einsetzen: MS-2000-Mod-Sequenz (Spiel-Reihenfolge, Schrittzeiten, Vorschau über `E.mkSet`); I2-Reihe (`lanePut` mit vorhandener Länge, `lockPut` über alle Takte, L4-Zählung, Haken `R.lanePv`); Klang-Lock trägt `lf` | 3–4 h | +5 KB |
| I3f | Super-Regler-Kurve: `S.sr.f`, `song.sr[].f`, `sr.ramp.k`, `FORM.rideAt`, Chip auf I1s Platz, Teil-Blatt, Streifen | 2–3 h | +4 KB |
| I3g | Zusammenführen, Regel-28-Golden, Regression, Fach-Prüfung, Bilder, „Bitte prüfen“ | 2 h | – |
| **Summe** | | **≈ 21–27 h** (21–26,5; + 1 h bei F5 = ja) | **≈ +39 KB**, davon ≈ 21 KB erst beim ersten Öffnen |

Der Vorschlag nannte ≈ 14 h. Die Mehrzeit hat fünf Gründe: Die Form muss auf zwei Wegen genau gleich klingen (Worklet und nativer Puffer), ihre
Lage muss für jede Zykluslänge am Song-Schlag stimmen (Start an jedem Takt, Übergabe, Schleife, Export-Ausschnitt), die Einsetz-Ziele I1 und I2
sind noch nicht gebaut (Schnittstellen und spätere Anschluss-Stufen), das Einwischen braucht Latenzausgleich, Vorschau und sauberen Abbruch
für drei Ziele, und die Erkennung bekommt einen Korpus-Test, damit „aufräumen“ messbar richtig ist.

##### Abnahme I3a — Form-Kern
- [ ] **I3-01** **Regel 28:** Demo-Projekt, alle Werks-Klänge und alle Projekte in `synq-snapshots/` (keine `l1f`/`l2f`, kein `f`) gegen den
      Vorgänger-Stand: normalisiertes JSON Zeichen für Zeichen gleich, kein `S.need`-Eintrag `'lf'`; Mitschnitt aller `port.postMessage` an die
      Worklets über 32 Takte byte-gleich (keine `lf`-Nachricht, `mkSong` nach Inhalt und Zeitpunkt unverändert); `syncLfoSet`-Schlüssel und
      nativer Audio-Graph (Knoten und Verbindungen) unverändert; TAKT-LFOs der Formen 0–4 behalten die Transport-Lage; Offline-Render
      bitgleich (M-NULL = −∞).
- [ ] **I3-02** `formNorm`: 1000 Zufallsformen (gültig, kaputt, zu lang, unsortiert, NaN, drei gleiche `x`) → alle Regeln §3.1 erfüllt; zweimal
      normalisieren = einmal (deep-equal); `l1shape` 5 ohne `l1f` → 1; Speichern → Laden, Sound sichern → laden, Kopieren/Einfügen, Spur
      duplizieren, Klang-Lock-Kopie: `l1f`/`l2f` deep-equal; `S.need` enthält `'lf'` genau dann, wenn eine `l1f`/`l2f` (auch in Klang-Locks)
      oder ein `f` (`S.sr`, `song.sr`) existiert.
- [ ] **I3-03** **Gleiche Formel** (M-LFO, 48 kHz, 120 BPM, Zyklen 1/1, 1/16 und 1/32): 8 Prüfformen (Säge, Treppe 8, Pumpen, Gate, Triller,
      Kurve b = ±100, 64 Abschnitte) an 1000 Zufallsphasen: Worklet-Wert = `FORM.eval` ± 1e-6 außerhalb der Kanten; jede Kante hat die Breite
      `e_j` aus §4.1 ± 1 Steuerblock (z. B. 1/1: 1 ms; Triller bei 1/32: 0,667 ms); die Änderung zwischen zwei Steuerblöcken ist nie größer
      als `|Δy| · CR / (e_j · SR) + |Steigung| · CR / SR + 1e-6` (bei 1/1 und |Δy| = 2: 0,667); kein NaN; nativer Puffer und Anzeige nutzen
      dieselbe Funktion (Quelltext-Vergleich).
- [ ] **I3-04** **Takt-Lage am Song-Schlag** (M-TAKT, 120 BPM, Worklet; dieselben Fälle nativ auf einer WT-Spur ± 1 ms):
      (a) Zyklen 1/1, 2/1, 4/1 und 1/2., Song-Start an Takt 1, 2 und 7 → Phase am Song-Schlag `B` = `frac(B / l1sync)` ± 16 Samples
      (z. B. 2/1 ab Takt 2: 0,5; 4/1 ab Takt 7: 0,5; 1/2. ab Takt 2: 0,333);
      (b) 3 Takte Matrix, dann Übergabe in den Song an Takt 1 und an Takt 2 (`songPlayStartAt`) → Phase wie bei (a);
      (c) Song-Schleife über 3 Takte (T. 5–7) mit Zyklus 2/1: nach jedem Rücksprung an T. 5 Phase 0 ± 16 Samples, der Wert gleitet in 5 ms
      (M-KLICK ≤ 6 dB);
      (d) Tempo 120 → 90 in Takt 5: kein Wertsprung über die Steigung eines Steuerblocks hinaus;
      (e) Start NOTE: Phase 0 bei jedem Notenanfang ± 1 Steuerblock;
      (f) neu gebaute Engine mitten im Song (Spur-Engine wechseln): richtige Phase ab dem ersten Block.
- [ ] **I3-05** **Gleich in Song, Export und Video:** zwei Offline-Render (VV1) bitgleich; Offline gegen Echtzeit-Mitschnitt: Korrelation ≥ 0,99;
      Export-Ausschnitt ab Takt 5 (Zyklen 2/1 und 1/2.) gegen den Live-Mitschnitt des ganzen Songs ab Takt 1: Phase ab Takt 5 ± 16 Samples
      (`__lfoProbe`); VV3 (wenn gebaut): gezeichnete Phase ± 2 % (VV3-01).
- [ ] **I3-06** **Kein Klick** (M-KLICK ≤ 6 dB): Gate → Lautstärke (Menge 1,0) 1/16 bei 140 BPM auf Sinus 220 Hz und auf einer Säge-Fläche;
      Pumpen → Cutoff; neue Tabelle während des Klingens (5-ms-Blende) bei voller Menge; Phasensprung an der Song-Schleife bei voller Menge.
- [ ] **I3-07** **Nativ:** WT-Spur und `?engine=native`: Pumpen auf Cutoff und auf `fx.rev` (Spur-Effekt-Route) → gemessener Verlauf gegen
      `FORM.eval` Korrelation ≥ 0,99; Formwechsel während ▶ (Pumpen → Gate → eigene Form) auf Cutoff und Lautstärke: M-KLICK ≤ 6 dB, die
      Routen-Gains sind dieselben Objekte wie vorher, `nl.skey` unverändert, alte Quelle nach ≤ 20 ms gestoppt; Tempo-Wechsel baut den Puffer
      phasengleich neu (Phasenfehler ≤ 1 ms); Song-Schleife: `L.jump` zur Zeit `b2t(wrapAt)` ± 1 ms; kein LFO bleibt stehen (`lfoSink`);
      keine Konsolenfehler.
- [ ] **I3-08** **Engines:** VA, FM DX (Route LFO 1 → Tonhöhe) und FM-FELD (lfoAm/lfoFm) folgen der Form (`__lfoProbe`, `fmxLv`); MS-2000- und
      Bit-Mask-Bedienfeld unverändert (DOM-Vergleich, F1-Vorgabe).
- [ ] **I3-09** **CPU** nach §4.8 (Xeon-Mediane); kein GC-Ereignis in 60 s Node-Shim, Heap ± 1 MB; `lfMiss` = 0 in allen Tests.
- [ ] **I3-10** **Ränder:** DX-Export eines FM-Klangs mit Form 5 → gültige Datei, LFO-Welle = beste Korrelation, Hinweis „LFO-Form angenähert“;
      v2-API liest `'drawn'`; Zufalls-Klang wählt nie 5; ein Stand mit `S.need`, aber ohne I3, öffnet ein I3-Projekt gesperrt mit Hinweisband
      und speichert nicht; ein Stand vor I1 öffnet es ohne Fehler (S&H statt Form – bekannt, Changelog).
- [ ] **I3-37** **`lf`-Weg** (Mitschnitt der Nachrichten): (a) Projekt mit `l1shape` 0 und gespeicherter `l1f` laden → ✎ tippen (nur `setP`)
      → `lfMiss` 0, Wert ab dem ersten Block = Form, kein Sprung über eine Block-Steigung hinaus; (b) Undo/Redo und A/B zwischen Form und Sinus,
      Klang aus der Bibliothek einsetzen → `lfMiss` 0; (c) I1-Stufe bzw. V6a-`disc` schaltet auf 5 → `lfMiss` 0; ein Klang ohne `l1f` bekommt
      stufig 1 statt 5; (d) neue Tabelle und `set` kommen in **einer** Nachricht, `lf` vor `set`; (e) unveränderte Tabelle wird nicht noch einmal
      geschickt (`E.lfSig`); (f) während des Vormachens öffnet das Form-Blatt nicht (Meldung).

##### Abnahme I3b — Aufräumen
- [ ] **I3-11** **Korpus** (M-FORM, die 20 Zielformen aus §9.1): 20 × 10 Kritzel (Zittern σ = 1,5 % der Höhe, Überschwinger 4 % an Ecken,
      Strichdauer 0,3–1,5 s, Abtastung 60 Hz, Zyklus 1/1, Raster 1/16) → ≥ 90 % **strukturgleich** (gleiche Zahl und Art der Abschnitte, Kanten
      auf dem Raster ± 1 Tick, Stufen ± 20 von 1000) und 100 % mit höchstens einem Strukturfehler.
- [ ] **I3-12** **Gerade Rampen:** Kritzel einer Rampe (Zittern σ = 1,5 %, RMS-Abweichung von der Geraden ≤ 2 %) → genau ein Abschnitt „Gerade“,
      Anfang und Ende auf dem Raster.
- [ ] **I3-13** **Saubere Treppen:** Treppen mit 4, 8 und 16 Stufen (Korpus 6–9, Raster 1/16) → alle Stufen gleich lang (genau Raster) und gleich
      hoch (± 5 von 1000).
- [ ] **I3-14** **Keine falsche Begradigung:** Sinus-, Bogen- und Pump-Kritzel → Kurven oder ≥ 4 Abschnitte, RMS zum Vorbild ≤ 5 %, keine Treppe;
      Aufräumen aus → RMS zur Rohform ≤ 1,5 %; Umschalten direkt nach dem Strich wendet auf diesen Strich an (ein Undo); nach ↶ ist das
      Umschalten für den rückgängig gemachten Strich nicht mehr möglich (`lastStroke` verworfen, Schalter gilt nur für die nächsten Striche).
- [ ] **I3-15** **Übermalen:** Strich nur im 2. Viertel → Knoten außerhalb [Viertel 2 ± 1 Rasterfeld] deep-equal zur Form davor; ein Übermalen,
      das insgesamt > 32 Abschnitte ergäbe, vereinfacht nur den berührten Bereich; reicht das nach 6 Versuchen nicht, wird der Strich mit
      Hinweis verworfen (Form deep-equal, kein Undo-Eintrag).
- [ ] **I3-16** **Grenzen und Zeit:** ≤ 32 Abschnitte nach dem Aufräumen, ≤ 64 ohne; Aufräumen ≤ 5 ms (Median, Chromium), ≤ 20 ms mit 4-facher
      CPU-Drosselung; keine Aufgabe > 50 ms.
- [ ] **I3-38** **Raster bei punktierten und triolischen Zyklen:** 1/2. mit 1/16 → 12 Felder, Linien auf Vielfachen von 64; 1/2. mit 1/16T →
      18 Felder, jede Linie auf dem nächsten ganzen Tick (Abweichung ≤ ½ Tick); 1/4T mit 1/16 → Linien 0, 288, 576 und „2 Felder + Rest“;
      1/8. mit 1/16 → 3 Felder; 1/16T-Zyklus mit 1/32 → feinstes Raster, angeschnitten; Einrasten trifft die gerundeten Linien; Infozeile nennt
      Zyklus und Felder richtig; Korpus-Formen 6–9 und 12–13 mit Zyklus 1/2. und 1/4T: ≥ 85 % strukturgleich.

##### Abnahme I3c — Form-Blatt
- [ ] **I3-17** **Öffnen und Schließen:** aus ✎ (erster Tipp), aus der Vorschau, aus den Sequenz-Werkzeugen, aus den Reihen-Optionen, aus dem
      Kurven-Chip; die Kopfzeile nennt das richtige Ziel; jeder Schließ-Weg aus §6.3 schließt ohne Datenverlust und ohne Rest-Zustand.
- [ ] **I3-18** **Malen** (M-GESTE): Strich in 600 ms über das Feld → Form folgt; Gleiten 150 ms, Infozeile mit richtigen Zahlen; ein Undo je
      Strich; `pointercancel` → Form deep-equal zu davor; Tipp < 4 Ticks ändert nichts; `hapSpy`: höchstens ein `haptic('snap')` je Strich,
      beim Abheben, kein Aufruf während des Malens, keiner mit `UI.haptics` aus.
- [ ] **I3-19** **Einwischen LFO** (M-WISCH): ▶ 120 BPM, Zyklus 1/1 und 2/1, gestellter Ausgabe-Zeitstempel (Fake für `getOutputTimestamp`)
      bzw. Rückfall mit `AU.outLat` = 50 ms, 2 Takte Höhenfahrt → geschriebene Lage ± 12 Ticks (1/64 Zyklus) zur gehörten Stelle; nur der
      berührte Bereich ändert sich; Vorschau ≤ 30 Nachrichten/s, während der Geste kein Undo-Eintrag und `p.l1f` unverändert; nach dem Abheben
      genau ein Undo und die aufgeräumte Tabelle im Worklet (`__lfoProbe`-Hash).
- [ ] **I3-39** **Einwisch-Ziele und Abbruch:** Taste grau mit dem Grund aus §5.5 für: kein ▶, Start NOTE, MS 2000 mit KEY SYNC Timbre bzw. Stimme,
      TYP Rückwärts/Wechsel, LAUF Einmal, Reihe „An Noten“, Clip spielt nicht, Super-Regler-Kurve; MS 2000 (KEY SYNC AUS, mit aktiver
      Schrittlänge-SEQ) und I2 freie Reihe (`len` 12, Swing 60 %) → Lage ± 12 Ticks; während der Geste kein `timApply` und kein `lanePut`
      (Spion), danach genau eines; Abbruch über `pointercancel`, ■, Blatt schließen und Szenenwechsel → `__lfoProbe`-Hash = vorher,
      MS-2000-Schrittwerte (`mkInfo`) = vorher, `R.lanePv` leer, keine Undo-Einträge, Modus wieder Malen.
- [ ] **I3-20** **Anzeige:** Laufstrich folgt der gehörten Phase ± 1 Bild (30 Bilder/s); Rasterlinien = Raster-Wahl bzw. Schritte des Ziels;
      Felderzahl und Zyklus in der Infozeile richtig; Raster < 2 bzw. > 64 Felder wechselt automatisch.
- [ ] **I3-21** **M-PLATZ** in allen Formaten aus §6.10: Malfeld ≥ 120 px hoch, alle Tasten ≥ 44 × 44, nichts abgeschnitten, Höhe von Seite und
      Editor ± 0 px beim Öffnen und Schließen, Drehen ohne Datenverlust; Bibliotheks-Zeile scrollt per Finger.
- [ ] **I3-22** **Flüssig** (Chromium, 4-fache CPU-Drosselung über `Emulation.setCPUThrottlingRate`): Malen während ▶ mit 4 Spuren: Median
      ≥ 55 Bilder/s, kein Bild > 50 ms, Zeichnen ≤ 8 ms je Bild (Median); erstes Öffnen des Blatts (Tipp bis erstes gezeichnetes Bild) ≤ 150 ms;
      Startzeit der App ± 5 % (Block `sq-form-src` nicht beim Start ausgewertet); Worklet `late` = 0. Ohne Drosselung zur Information: ≥ 59
      Bilder/s, Zeichnen ≤ 2 ms, erstes Öffnen ≤ 50 ms.
- [ ] **I3-23** **LFO-Seite:** ✎ ≥ 44 × 44 in allen Formaten; erster Tipp setzt Form 5, TAKT 1/1 (wenn FREI) und das Start-Dreieck in einem
      Undo; FREI grau mit Grund; Rückschalten behält `l1f`; Vorschau zeigt einen Zyklus mit Laufpunkt; Mod-Übersicht „LFO 1 ✎ Pumpen“.
- [ ] **I3-40** **Sichtbares Einrasten** (Bild-Vergleich der Zustände): Gleiten 150 ms (mit `prefers-reduced-motion` sofort), Aufleuchten der
      erkannten Geraden und Treppen 300 ms, Viertel-Linie hebt sich beim Überqueren 120 ms hervor; alles auch mit `UI.haptics` aus.

##### Abnahme I3d — Bibliothek
- [ ] **I3-24** Knoten genau wie §6.5; Wahl = ein Undo, Kopie (Ändern ändert die Bibliothek nicht). Gemessen im Worklet bei 120 BPM, Route
      Menge 1,0: **Pumpen** → Lautstärke: 4 Einbrüche je Takt auf den Vierteln ± 1 ms, Tiefe ≤ −40 dB, nach der Erholung Pegel = trocken ± 1 dB;
      **Gate** → Lautstärke: An-Schritte = trocken ± 1 dB, Aus-Schritte ≤ −40 dB, Fenster auf den Sechzehnteln 1, 3, 4, 6, 7, 9, 11, 12, 14, 15
      ± 1 ms; **Triller** → Tonhöhe (Route = 2 Halbtöne): Wechsel alle 1/32 ± 1 ms, Tonhöhen 0 / +200 ct ± 5 ct. Nativ (WT) zur Information:
      Gate an ≈ −2,5 dB, aus ≈ −6 dB (Messwerte im Changelog, §4.4).
- [ ] **I3-25** **Meine Formen (nur nach F5 = ja):** Sichern mit Namen, erscheint oben in der Liste, Einsetzen = Kopie, ✕ mit Rückfrage;
      höchstens 64 (die 65. wird mit Hinweis abgewiesen); übersteht Neuladen der Seite; ohne Speicher: Hinweis, keine Fehler; Hinweis „nur auf
      diesem iPhone“ sichtbar und Hilfe-Satz zum Löschen durch Safari vorhanden.

##### Abnahme I3e — Einsetzen
- [ ] **I3-26** **MS 2000:** Treppe mit 16 Stufen → SEQ 2 (Ziel Cutoff): Werte = Mittelwert × 63 ± 1, Bewegung Stufe; Rampenform → Glatt, Werte am
      Schrittbeginn; Ziel Tonhöhe → Bereich ±24; LÄNGE 8 → Form auf 8 Schritte, Schritte 9–16 unverändert; Tiefe 50 % → halbe Werte ± 1;
      TYP Rückwärts → der zuerst gespielte Schritt (8 bzw. 16) trägt den Formanfang; aktive Schrittlänge-SEQ → Fenster nach den tatsächlichen
      Schrittzeiten, gemessener Verlauf der Sequenz gegen `FORM.eval` Korrelation ≥ 0,98; TYP Wechsel → LCD-Meldung; ein Undo je Strich;
      MK6-Suite grün.
- [ ] **I3-27** **I2-Reihe:** frei mit Länge 12 und Raster 1/16 → `lanePut` mit `len` 12 und unverändertem `g`, Form über 3 Schläge gedehnt;
      Werte = Unten + (w̄ + 1)/2 · (Oben − Unten) ± 0,001; stufige Ziele auf erlaubte Werte; „An Noten“ in einem 2-Takt-Clip mit ROLLE-Noten
      außerhalb des Rasters → `lockPut` in beiden Takten gleich, Noten nach L6 dem nächsten Schritt zugeordnet; Noten mit schon 8 Locks
      abgewiesen und im Hinweis gezählt; je Strich ein Undo (Undo-Art Clip); I2-02 bleibt grün.
- [ ] **I3-28** **Keine Restverbindung:** nach [Fertig] ändert eine Säule in SCHRITTE bzw. ein Reihen-Schritt keine Form und umgekehrt; Klang-Lock
      mit Form-5-Klang: Nebenkern bekommt `lf`, `lfMiss` = 0 (nach I2d).

##### Abnahme I3f — Super-Regler-Kurve
- [ ] **I3-29** Fahrt 0,2 → 0,8 über 4 Takte mit Form „Treppe 4“: Stellung (`__srProbe`) = `x0 + (x1 − x0)·F̂(u)` ± 0,002; Beginn = aktuelle
      Stellung (Sprung ≤ 0,002); Ende = `x1` am Teilanfang ± 128 Samples; Kanten 20 ms, M-KLICK ≤ 6 dB; Form „Triller“ (erster Knoten 0,
      `G(0)` = 0,5): Beginn trotzdem ohne Sprung (≤ 0,002); keine Zyklus-Kante (`wrap: false`): `G(0)` = Wert des ersten Knotens.
- [ ] **I3-30** `song.sr[].f` übersteht Speichern/Laden, `srShift`/`srClear`/`srCutTo`/Undo (deep-equal bzw. nach Regel §3.3); zwei Offline-Render
      bitgleich; Einträge ohne `f` und `sr.ramp` ohne `k` byte- und bitgleich zu I1 (I1-50/I1-21 bleiben grün).
- [ ] **I3-31** Kurven-Chip 52 × 44 auf dem von I1 §6.2 freigehaltenen Platz in den Fassungen G, M und Q (I1-30 bleibt grün: Feldhöhe ± 0 px,
      NEIGEN und [⇥ …] in den Breiten aus I1), zeigt die Mini-Kurve; Teil-Blatt-Zeile zeigt die Kurve, Tipp ändert sie (ein Undo); Matrix-Fahrt
      nutzt `S.sr.f`; Einwischen in der Kurve grau mit Grund.

##### Abnahme I3g — Zusammenführung
- [ ] **I3-32** Regression: Smoke, DoD (Worklet und nativ je 10/10), K1-Suite, MK6-Suite, VV1-Suite, I1- und I2-Suiten (soweit zusammengeführt),
      LAUF/ROLLE.
- [ ] **I3-33** 3 Minuten Wiedergabe mit 3 gemalten LFOs (Pumpen, Gate, eigene Form), Szenenwechseln, Song-Schleife und Einwischen während ▶:
      keine Knackser (M-KLICK), `late` = 0, `lfMiss` = 0, keine hängenden Noten, keine Konsolenfehler.
- [ ] **I3-34** **Marke:** `grep -i -E 'serum|vital|bitwig|kilohearts|xfer|procreate|waveshaper|animoog|moog'` über den **I3-Diff** (neue und
      geänderte Zeilen: DOM-Texte, Hilfe, CSS, Bezeichner, Kommentare, Testnamen) = 0. Ausgenommen sind Namen der Web-Audio-Schnittstelle
      (`createWaveShaper`, `WaveShaperNode`) und vorhandene Werksklang-Namen und -IDs (`Moog-Bass`, `moog-bass`, `f-moog-bass`, `Minimoog`,
      `OLD_PRESETS`); sie bleiben unverändert, denn gespeicherte Projekte verweisen darauf (Regel 28). Zusätzlich: „MS 2000“ kommt im Diff
      nur über `MK_LABEL` vor.
- [ ] **I3-35** Kein Supabase-Aufruf; Hilfe-Zeilen; Bilder für Xander (hoch und quer: LFO-Seite mit ✎, Form-Blatt beim Malen und Einwischen,
      Bibliothek, Sequenz-Werkzeuge mit „Aus Form“, Kurven-Chip) in `i3-shots/`.
- [ ] **I3-36** **iPhone (Xander, Pages-Seite):** „Bitte prüfen“ §12 und `perfProbe` mit I3-Probe (4 Spuren, je beide LFOs gemalt mit Start NOTE,
      6 Stimmen) → Last ≤ 0,45, kein `late`, 3 min ohne Aussetzer; **Bildrate beim Malen mit ▶** (Median ≥ 55 Bilder/s, 95. Perzentil der
      Bildzeit ≤ 33 ms); **Einwisch-Lage** mit dem Einwisch-Teil der I3-Probe (M-LAGE, §9) über Lautsprecher, Kabel-Kopfhörer und – falls vorhanden –
      kabellosen Kopfhörer: Versatz in ms je Ausgabe (Ziel mit Lautsprecher: ± 25 ms); iOS-Version und „Tick beim Abheben gespürt ja/nein“
      (nur Befund, kein Bestehen-Kriterium). Ergebnis-JSON im Changelog.

---

#### 9. Messverfahren (neu; vorhandene M-KLICK, M-NULL, M-SP, M-CPU, M-ZEIT, M-PLATZ, M-EINBRUCH gelten unverändert; M-GESTE aus I2)

| Kürzel | Name | Definition |
|---|---|---|
| **M-FORM** | Erkennungs-Korpus | Skript `i3-korpus.mjs` (fester Startwert) erzeugt aus den 20 Zielformen aus §9.1 (Datei `i3-korpus.json`, eingecheckt) je 10 menschenähnliche Striche (Zittern, Überschwinger, Tempo, 60-Hz-Abtastung); Wiedergabe als CDP-Touch (`Input.dispatchTouchEvent`) aufs Feld; Vergleich der Knotenliste mit der Zielform: Struktur (Zahl/Art der Abschnitte), Kanten-Ticks, Stufenhöhen, RMS |
| **M-LFO** | Worklet gegen Formel | `__lfoProbe` je Steuerblock offline; Soll `FORM.eval(f, ph(frame), e)`; Abweichung außerhalb der Kanten, Kantenbreite und größte Änderung je Block (Grenze aus dem tatsächlichen `e_j`, §4.1) |
| **M-WISCH** | Einwisch-Lage (Chromium) | CDP-Touch mit festen Zeitstempeln, `getOutputTimestamp` durch einen Fake mit bekanntem `contextTime`/`performanceTime` ersetzt (zweiter Lauf: Funktion entfernt, Rückfall mit `AU.outLat` = 50 ms); Transport läuft; geschriebener Tick gegen erwarteten Tick aus §5.5 |
| **M-TAKT** | Takt-Lage | Offline-Render mit Prüfton und Form „Säge 1/1“ (bzw. dem geprüften Zyklus) auf Lautstärke, dazu `__lfoProbe` (`b_s`, `ph`); Kante der Säge gegen `b2t(Song-Schlag)` in Samples; Fälle aus I3-04 (Start an Takt n, Übergabe, Schleife, Tempo-Wechsel, Export-Ausschnitt) |
| **M-LAGE** | Einwisch-Lage am iPhone | Teil der I3-Probe (Menü → Leistung, wie `perfProbe`; keine neue Taste in der App): Klick auf jedem Viertel, das Blatt steht auf Einwischen; Xander tippt 16-mal im Takt des **gehörten** Klicks ins Feld; die App rechnet je Tipp `t_h` nach §5.5 und den Abstand zum nächsten Klick-Schlag; Mittelwert und Streuung in ms je Ausgabe (Lautsprecher, Kabel, kabellos) |
| M-SR (aus I1) | Fahrt-Stellung | `__srProbe` je Block, Soll nach §4.6 |

##### 9.1 Die 20 Zielformen des Korpus (Knoten `[x, y, t, b]`, Zyklus 1/1, Raster 1/16)

| Nr. | Name | Knoten |
|---|---|---|
| 1 | Rampe auf | `[0,−1000,1,0] [768,1000,0,0]` |
| 2 | Rampe ab | `[0,1000,1,0] [768,−1000,0,0]` |
| 3 | Dreieck | `[0,−1000,1,0] [384,1000,1,0] [768,−1000,0,0]` |
| 4 | Säge mit Kante (2 je Zyklus) | `[0,−1000,1,0] [384,1000,0,0] [384,−1000,1,0] [768,1000,0,0]` |
| 5 | Rechteck halb | `[0,1000,0,0] [384,−1000,0,0] [768,−1000,0,0]` |
| 6 | Treppe 4 auf | Halten je 192 Ticks auf −750, −250, 250, 750; Ende `[768,750,0,0]` |
| 7 | Treppe 4 ab | Halten je 192 auf 750, 250, −250, −750; Ende `[768,−750,0,0]` |
| 8 | Treppe 8 auf | Halten je 96 auf −875, −625, −375, −125, 125, 375, 625, 875; Ende `[768,875,0,0]` |
| 9 | Treppe 16 auf | Halten je 48 auf −1000, −875, …, 875 (Schritt 125); Ende `[768,875,0,0]` |
| 10 | Bogen | `[0,−1000,2,−60] [384,1000,2,60] [768,−1000,0,0]` |
| 11 | Sinus | Knoten bei 0, 192, 384, 576, 768 mit y = 0, 1000, 0, −1000, 0, alle t = 2; `b` je Abschnitt aus der Bestanpassung an den Sinus (einmal vom Skript bestimmt und in `i3-korpus.json` festgeschrieben) |
| 12 | Pumpen | Bibliothek §6.5 |
| 13 | Gate | Bibliothek §6.5 |
| 14 | Triller | Bibliothek §6.5 (32 Abschnitte = Grenze) |
| 15 | Rampe + Halten | `[0,−1000,1,0] [576,1000,0,0] [768,1000,0,0]` |
| 16 | Halten + Rampe ab + Halten | `[0,1000,0,0] [192,1000,1,0] [576,−1000,0,0] [768,−1000,0,0]` |
| 17 | Abklingen (schnell zuerst) | `[0,1000,2,−80] [768,−1000,0,0]` |
| 18 | Anschwellen (langsam zuerst) | `[0,−1000,2,80] [768,1000,0,0]` |
| 19 | Achtel-Puls | je Viertel q: `[192q,1000,0,0] [192q+96,0,0,0]`; Ende `[768,0,0,0]` |
| 20 | Gemischt | `[0,−1000,1,0] [192,500,0,0] [384,−500,2,−50] [768,1000,0,0]` (Rampe, Halten, Kante, Kurve) |

---

#### 10. Risiken

1. **Die Erkennung rät falsch** (gewollte Kurve wird Treppe oder umgekehrt). Gegenmittel: Korpus I3-11/I3-14 mit festen Schwellen,
   Übermalen nur der Stelle, Schalter „Aufräumen“ für den letzten Strich, Undo. Schwellen §5.2 stehen als Konstanten an einer Stelle, damit
   eine Korrektur nach Xanders Test klein bleibt.
2. **Ältere iOS-Fassungen** ohne `getCoalescedEvents` (vor 18.2) bzw. mit dem `pointerId`-Fehler [W]: Merkmal-Abfrage; bei 60 Hz und schnellem
   Strich füllt die lineare Verbindung die Lücken. Das reicht für die Erkennung (Korpus läuft mit 60 Hz).
3. **Systemgesten am Rand** (Wischen vom linken Rand = Zurück in Safari, Kontrollzentrum oben): Feld ≥ 16 px vom Rand, `pointercancel` verwirft
   den Strich ohne Schaden. Bleibt es am Gerät störend, wird der Rand breiter (nur Maß, keine neue Funktion).
4. **Einwisch-Latenz am iPhone** unbekannt genau: Finger → Ereignis ≈ 30 ms angenommen; ob WebKits `getOutputTimestamp` die Geräte-Verzögerung
   enthält, ist ungeprüft; kabellose Kopfhörer liegen weit über dem geklemmten `devLat`. Gegenmittel: Ausgabe-Zeitstempel mit Rückfall (§5.5),
   Hinweis bei bekannter kabelloser Ausgabe, Messung M-LAGE (I3-36). Liegt es daneben, wird nur `d_f` angepasst.
5. **Klick an harten Kanten** auf der Lautstärke: 1-ms-Kante mit Untergrenze `e_min`, M-KLICK; Rückfall 2 ms (§4.1).
6. **Zwei Rechenwege** (Worklet-Formel, nativer Puffer) könnten auseinanderlaufen. Gegenmittel: eine Referenz `FORM.eval`, Tests I3-03 und I3-07.
7. **Ältere App-Versionen** vor I1 klemmen Form 5 auf S&H und verwerfen `l1f` ohne Warnung (VO-R1 greift für Zusatzfelder nicht). Gegenmittel:
   `S.need` ab I1/I3, Pages-Seite liefert immer den neuesten Stand, `max_app` rechtzeitig anheben.
8. **Abhängigkeiten:** I3e (Reihe) braucht I2a + I2c, I3f braucht I1c + I1d + I1e (und damit I1-F1), VV3 ist noch nicht gebaut. Gegenmittel:
   Reihenfolge §8, feste Schnittstellen, MS-2000-Teil von I3e und I3a–I3d sind unabhängig und können sofort veröffentlicht werden („wenn du
   irgendein Paket fertig hast, lad es schon hoch“).
9. **Namensgleichheit „Pumpen“** (Bibliotheksform und vorhandener Spur-Regler): kann verwirren. Name aus dem freigegebenen Vorschlag bleibt,
   Prüfpunkt in §12.
10. **Haupt-Faden beim Malen während ▶** (Planer-Takt 25 ms): Zeichnen ≤ 2 ms je Bild, Aufräumen ≤ 5 ms erst beim Abheben, Vorschau ≤ 30/s.
    I3-22 misst `late` = 0 mit gedrosselter CPU, I3-36 die Bildrate am iPhone.
11. **Haptik** wirkt auf aktuellem iOS vermutlich nicht (G9 [W7], I4 [W3]). Gegenmittel: sichtbares Einrasten als Pflicht (§5.3); Befund aus
    G9-61/I4-61 und I3-36 geht in den Changelog.
12. **Nativer Unterschied auf der Lautstärke** (Tremolo 0,5 … 1): Gate und Pumpen sind auf WT/ECO flacher als im Worklet. Nicht änderbar ohne
    Regel-28-Umrechnung aller alten nativen LFO-Routen → nur benannt (§4.4, §12).
13. **Taktarten (T1)** kommen später und berühren Raster und Takt-Begriffe. Gegenmittel: §4.9 legt jetzt fest, dass Formen zyklus-relativ in
    Schlägen bleiben; nichts muss umgerechnet werden.

---

#### 11. Fragen an Xander (nur echte; ohne Antwort wird die Vorgabe gebaut – außer F5, sie ist [V])

- **F1 MS-2000- und Bit-Mask-Bedienfeld.** Beide Bedienfelder sollen „wie am Gerät“ sein, und deren LFOs haben feste Wellen. Soll die gemalte
  Form trotzdem auch dort als LFO-Welle wählbar sein? **Vorgabe: nein.** Dort wirkt eine Form über die Mod-Sequenz (MS 2000), über Lock-Reihen
  (I2) und über den Super-Regler.
- **F2 Kurve für den Super-Regler.** Soll die gemalte Form **einmal über die ganze Fahrt** gedehnt werden (z. B. Treppe: 4 Stufen bis zum
  Refrain, egal wie lang die Fahrt ist) oder sich **jeden Takt wiederholen** (z. B. pumpend aufwärts)? **Vorgabe: einmal gedehnt.** Anfang und
  Ende passen dabei genau.
- **F3 Die drei Bibliotheksformen.** Geplant sind: **Pumpen** = 4-mal je Takt auf den Vierteln auf Stille, schnell erholt; **Gate** =
  1/16-Muster x.xx.xx.x.xx.xx.; **Triller** = Wechsel alle 1/32 zwischen Grundton und oben. Passt das, oder hast du andere Muster im Kopf?
  **Vorgabe: so bauen.**
- **F4 Kopie oder Verbindung.** Im Vorschlag stand, eine Form „kann gleichzeitig LFO-Welle, Mod-Sequenz, Lock-Spur und Kurve sein“. Geplant
  ist: Eine Form wird beim Einsetzen **kopiert**; änderst du sie später an einem Ort, ändert sich an den anderen Orten nichts. Das folgt deiner
  Regel vom 31.10. („fest IM Clip, beim Kopieren immer mit kopiert, keine Extra-Daten“). Ok? **Vorgabe: Kopie.**
- **F5 „Meine Formen“ [V].** Soll es zusätzlich eine eigene Liste geben, in der du gemalte Formen mit Namen auf dem iPhone sicherst und in
  andere Klänge einsetzt (bis 64)? Sie läge nur auf diesem Gerät; Safari kann sie löschen, wenn du die Seite 7 Tage nicht öffnest (als
  Home-Bildschirm-App zählt Safari eigene Tage). Im Vorschlag stand nur die kleine Bibliothek. **Vorgabe: nicht bauen.** (Eine Form steckt
  ohnehin in jedem Klang, den du sicherst.)

---

#### 12. Bitte prüfen (Xander am iPhone, Pages-Seite)

1. LFO 1 → ✎. Kritzle schnell eine Rampe und danach eine Treppe. Rastet es so ein, wie du es gemeint hast? Siehst du deutlich, wie es
   einrastet (Gleiten, Aufleuchten)? Spürst du beim Abheben einen Tick? Bitte nenne deine iOS-Version (Einstellungen → Allgemein → Info).
2. Male eine geschwungene Kurve (z. B. einen Bogen). Bleibt sie eine Kurve und wird sie nicht zur Treppe?
3. Übermale nur ein Viertel. Bleibt der Rest so, wie er war?
4. Loop läuft → Einwischen. Landet die Höhe genau an der Stelle, die du gerade hörst (nicht zu früh oder zu spät)? Bitte einmal mit dem
   Lautsprecher und einmal mit Kopfhörern; dazu der Einwisch-Teil der I3-Probe (Menü → Leistung → I3-Probe, M-LAGE).
5. Pumpen auf Lautstärke, Gate auf Lautstärke, Triller auf Tonhöhe: Klingen sie so, wie du es erwartest? Stört dich, dass die Bibliotheksform
   „Pumpen“ genauso heißt wie der Spur-Regler „Pumpen“? (Auf einer WT-Spur schließt das Gate nicht ganz – das ist eine Grenze des einfachen
   Klangwegs.)
6. Starte den Song einmal bei Takt 1 und einmal mitten drin, und lass eine Schleife laufen: Sitzt die gemalte Form jedes Mal gleich im Takt?
7. MS 2000: Werkzeuge (SHIFT + 5) → „Aus Form“ → SEQ 2. Hörst du die Form in der Sequenz?
8. Super-Regler: Kurve „Treppe“ wählen, [bis zum nächsten Teil fahren]. Kommt der Aufbau so, wie du ihn willst?
9. Namen: „✎ Gemalt“, „Form“, „Malen“, „Einwischen“, „Aufräumen“, „Aus Form“, „Kurve“ (und nach F5 „Meine Formen“). Passen sie?
10. Probe: Menü → Leistung → I3-Probe. Schick mir das Ergebnis (I3-36).

---

#### 13. Recherche (kurz, eigene Worte; nur für die Vergleiche in dieser Spec)

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
- **Haptik aus einer Webseite (iOS):** übernommen aus G9 [W7] und I4 [W3] (dort mit Datum und Version belegt): Der Klick aus dem Code auf das
  Schalter-Kästchen wirkte laut Bibliothek und Test-Seite nur auf iOS 17.4–26.4; die verbreitete Bibliothek nutzt seit Juni 2026 nur noch ein
  durchsichtiges Label, das den echten Fingertipp weiterreicht; WebKit verlangt eine Nutzer-Aktivierung (Fehler 285120). Quellen:
  `https://github.com/tijnjh/ios-haptics`, `https://rapidtoolset.com/en/tool/ios-haptics-tester`, `https://bugs.webkit.org/show_bug.cgi?id=285120`.
  Eine Ziehbewegung (`pointermove`) ist nach dem HTML-Standard keine aktivierende Eingabe; darum gibt es während des Malens keinen Tick.
- **Webseiten-Speicher in Safari:** wird nach 7 Tagen ohne Besuch gelöscht; Home-Bildschirm-Apps zählen eigene Tage (G9 [W8]).
- **Ausgabe-Zeitstempel:** `AudioContext.getOutputTimestamp()` liefert ein Paar aus Kontextzeit der gerade ausgegebenen Stelle und der
  passenden `performance.now()`-Zeit; laut Prüfbericht (MDN) gibt es die Funktion in Safari auf iOS ab 14.5. Die MDN-Seite war aus dieser
  Sitzung nicht erreichbar; darum Merkmal-Abfrage und Rückfall (§5.5) sowie die Messung M-LAGE am Gerät.


*Ende Paket I3.*

---


### B.4 Paket I4 — Tipp-Summen

#### Dirigenten-Hinweise zu I4 (gelten vor dem Paket-Text)
1. **Feld-Regel (§7.2):** A.6 übernimmt den I4-Block mit zwei Ergänzungen: Vormachen hält das Super-Regler-Feld (`!R.sr?.cap` in 'tipp'),
   und der Einstellungs-Name ist `uiPrefs().kbFeld` ('kb' | 'sr'). **I4a legt `kbFieldMode`/`kbFieldApply` an.** I4-02 = I1-45 = N8-06.
   Die Frage „Räder auch beim Super-Regler-Feld ausblenden?“ ist entschieden: ja (A.6).
2. **Haptik-Probe (§7.3, I4-61):** wird die gemeinsame Probe **M-PROBE** mit 7 Knöpfen und Anzeigen (A.8 H4). I4a baut sie ganz als ersten
   Schritt (+0,5 h). G9-61 und die Haptik-Fragen von I1/I2/I3 nutzen dasselbe Ergebnis.
3. **Uhren-Brücke (§5.2–5.4):** `ctxOf()` und `hoerZeit()` sind gemeinsame Funktionen (A.10); I3 nutzt sie beim Einwischen.
4. **Extra e (`take.tp`, §4.2):** Merkmal `'tp'` in Baustein N (A.4); I4-51 prüft nach A.4.
5. **Prüf-Werkzeuge:** Der Prüf-Link `#tippmessung` und die Probe-Seite in der Werkstatt sind erlaubt und brauchen keinen Vorschlag (A.14).
6. **Quellen:** [W3] (Haptik-Tester-Seite, Forum-Bericht, WebKit-Fehler 285120) und [W8] (WebKit-Fehler 185040) waren auch vom Dirigenten aus
   nicht erreichbar (Proxy 403, 31.10.). Keine Entscheidung hängt an ihnen: Probe (I4-61) und Messung (I4-60b) am Gerät entscheiden. Vermerk im
   Changelog.
7. **Basis:** aktuelle Hauptlinie H1 (VS-L, VS-P, G1–G8 zusammengeführt). `tapNotes` darf vorher im Node-Korpus beginnen.
8. **Fragen:** F7 (Extras) ist Frage 8, F4 (Tick) ist Teil von Frage 9; die übrigen gelten mit Vorgabe (D.2).

#### Paket-Text I4 (Fassung 2, vollständig)

*SYNQUENZER v3 — Nachtrag 8, Paket I4: Tipp-Summen (die Stimme gibt den Ton, der Finger den Rhythmus)*

**Kurz für Xander**
1. Du summst oder singst und tippst gleichzeitig mit einem Finger auf eine **große Fläche** (dort, wo sonst die Tastatur ist), einmal pro Ton.
   **Finger runter = der Ton beginnt, Finger hoch = der Ton endet.** Die Tonhöhe kommt aus deiner Stimme.
2. So gehen schnelle Läufe nicht verloren (zwei Finger abwechselnd gehen auch), viermal derselbe Ton wird vier Noten, Vibrato macht keine
   falschen Zwischennoten. Tippst du nicht, bleibt alles wie heute.
3. Es gilt bei **Stimme-FANG** und **● REC → MELODIE**. Die Verzögerung von Finger und Bildschirm gleicht die App selbst aus und lernt sie
   über mehrere Aufnahmen dazu.
4. Ehrlich: Ein **fühlbarer Tick** bei jedem Tipp geht auf aktuellen iPhones sehr wahrscheinlich nicht mehr. Laut den Machern einer
   Haptik-Bibliothek ist der Browser-Trick seit iOS 26.5 abgestellt, und während einer Aufnahme schaltet iOS die Vibration normalerweise ab.
   Sicher ist: **Die Fläche leuchtet** beim Tippen auf. Den Tick prüfen wir vorher kurz an deinem iPhone.
5. Zuerst kommt nur der **Kern** (≈ 16–20 h). Sechs Extras (z. B. eine Tipp-Spur oder Tippen im Song) baue ich nur nach deinem Ja (§13, F7).
   Am Klang und an alten Projekten ändert sich nichts.

---

Status: **Entwurf, Fassung 2** (nach der Prüfung, 31.10. ~18:30 UTC). Grundlage ist Xanders Ja vom 31.10. ~16:50 UTC, wörtlich: „Ja, die
Innovation kannst du gerne umsetzen. Mir gefällt das mit dem Gesang Hum, dass man dazu tappt, damit die App erkennt, was als Noten gemeint
ist.“ Freigegeben sind die Innovationen 1–4 aus `innovation-vorschlag.md`; dieses Paket ist **Nr. 4**. Der Songtext-Teil derselben Nachricht
(Worte erkennen, Silben einrasten, Abschnitt vorspielen) ist Paket **G9** (`n8/G9.md`). Quellen im Projekt: `innovation-vorschlag.md`
(Idee 4), `fragen-xander-9.md` (31.10., v. a. ~16:50 und T1 ~17:35; „schnelle Töne fehlen“/„wackelt“ aus VS2b), Nachtrag 2 C.3 (VS2),
Nachtrag 4 (VS-L), Nachtrag 5 (G1–G8), `typische-fehler.md`. Code geprüft: 4.23.0 `vs-base-B.html`, `stage-ges/index.html` (4.23.0 +
VS-L + G3/G4/G5/G8; alle Zeilenangaben ≈ beziehen sich darauf), `helfer-G267.html` (G1/G2/G6/G7), `vs-br-VSL`, `vs-br-VSP`, `n5-br-K` (K1),
`n5-br-H` (VC2a); Schwester-Specs `n8/I1.md`, `n8/I2.md`, `n8/G9.md`.

**Änderungen gegenüber Fassung 1** (Prüfbericht, alle Haupt- und Nebenpunkte):
1. **Haptik:** Der Code-Klick, den `haptic()` heute benutzt, wirkt laut Bibliotheks-Doku seit iOS 26.5 nicht mehr [W3]; außerdem schaltet iOS
   Haptik während einer Aufnahme in der Grundeinstellung ab [W7]. Rückmeldung ist darum das Licht. Ein Tick je Tipp kommt nur nach einer
   Geräte-Probe (I4-61, erster Schritt von I4a) und nur mit F4.
2. **Speicherort:** Die Tipp-Verzögerung liegt in einem eigenen Geräte-Schlüssel `stProf().tipp` mit eigenem Lader, nie in `prof[route]` (§4.1, I4-13b).
3. **Prüfgrenzen:** I4-20 und I4-12 haben jetzt feste Seeds, getrennte Läufe und Grenzen, die mit den eingespeisten Fehlern erreichbar sind.
4. **Lernen:** k wird aus einem Pool von Paaren über mehrere Aufnahmen gelernt (auch gebunden gesummt). Der Startwert je Weg kommt aus der
   gemeldeten Ausgangs-Latenz (§5.4/§5.5, I4-15, I4-16).
5. **iPhone-Zeit:** Neu ist I4-60b (Haupt-Faden-Last, `pointerdown` gegen `touchstart`, oben/unten, hoch/quer, Safari/Home-Bildschirm).
   Die Plausibilitätsgrenze liegt jetzt bei 2 s.
6. **G5:** Die Tipps laufen nicht durch die Zeitkarte; Analyse-Sekunde = Take-Sekunde − (3·d0 + 2)/sr. Es gibt keinen zweiten Feinabgleich
   und kein Lernen (§6.1, I4-75).
7. **Eine Notenquelle:** Die Tipps hängen an `A`, also nehmen alle `vsNotesOf`-Aufrufer (auch `g3RecStart`) sie. Auftakt-Tipps im Einzählen
   werden Vorlauf wie ein gesungener Auftakt (§6.7, I4-31, I4-33).
8. **Tastatur-Feld:** Es gibt eine Regel `kbFieldMode()`, wortgleich für I1. Die Räder sind ausgeblendet, solange die Fläche zu sehen ist.
   Die Größen gelten auch mit offenem Blatt (§7.2).
9. **Kleineres:** eigene Aktionen `tOhne`/`tDazu` (nie `drop`), Kern und Extras getrennt (Regel 27), Grenze 20 000 Tipps mit Hinweis,
   G8-Take-Zeit festgelegt, Höhen-Rückfall nur innerhalb des Tipps, `historyCheck` = VC2a, Taktlänge über `grid().beatsPerBar`,
   Klopfgeräusch in allen Test-Signalen.

**Kennzeichen:** **[A]** Annahme dieser Spec (der Builder baut genau das) · **[V]** sichtbare Neuerung, steht in §13 zur Freigabe ·
**[E]** Extra, wird nur nach Xanders Ja gebaut (F7) · **[X]** Entscheidung von Xander · **[W]** Fakt aus der Web-Recherche (§Quellen).

**Regeln, die hier besonders gelten** (`typische-fehler.md`, CLAUDE.md):
- **27** Nur bauen, was hier steht und besprochen ist. **Ohne Antwort wird nur der Kern gebaut** (§2); jedes Extra [E] wartet auf Xanders Ja.
  Kein Live-Ton beim Tippen, keine Anschlagstärke aus dem Finger, kein Schlagzeug aus Tipps (§2).
- **CLAUDE.md Nr. 3** Was sichtbar anders wird, wird vorgeschlagen (§13). Die Fläche selbst gehört zur freigegebenen Idee („tippt auf eine
  große Fläche“); ihr Ort und ihre Namen stehen trotzdem in F1.
- **28** Alte Projekte klingen gleich: I4 ändert **keine** Klangerzeugung, keinen Effekt und keine Regler-Kennlinie. Ein Projekt ohne Tipps
  bleibt **Zeichen für Zeichen** gleich (I4-50). Die VS2-Erkennung (`segment`) bleibt **unverändert**, ihr Ergebnis auf dem Korpus deep-equal.
- **1 / 3 / 4 / 5** Nichts abgeschnitten (sechs Formate), Blatt-Inhalt per Finger rollbar, Trefferflächen ≥ 44 × 44 px, **kein
  Layout-Sprung** (Höhe von `#kbArea` ± 0 px beim Umschalten).
  **6 / 10** Die Fläche verschwindet auf jedem Weg sauber (🎤 aus, [⌨], Ansichtswechsel, Song-Aufnahme).
- **7 / 8 / 9** „geändert“-Punkt sofort, ein Ergebnis = ein Undo, Speichern → Laden deep-equal.
- **18** Live gespielt = aufgenommen: Die Tipps landen auf dem Schlag, den man **gehört** hat (dieselbe Achse wie Tasten und Gesang, §5).
- **20** Kein Supabase-Aufruf. Versionen vergibt der Dirigent; `max_app` (heute 4 030 000) muss Xander anheben, falls I4 über 4.30.0 geht.
- **22** Vor „fertig“: Changelog-Abschnitt und Snapshot; dazu je Stufe die „Bitte prüfen“-Liste (§14).
- **26** Absichtlich überholte Test-Erwartungen früherer Pakete (z. B. `vsNotesOf` mit Tipps ≠ VS2) werden im Changelog genannt.
- **24 (sinngemäß)** Kein Hersteller-, Geräte- oder Produktname in der App (Oberfläche, Hilfe, Kommentare, Bezeichner, Testnamen).
  Vergleiche mit anderen Produkten stehen nur in dieser Spec.
- **29** Zwei Zweige parallel (§9).
- **CLAUDE.md-Vorrang** (schnelle Seite, flüssige Bedienung, stabile Verbindung): Je Berührung macht der Haupt-Faden nur zwei Zeitstempel
  und eine CSS-Klasse (kein Layout, kein Rechnen). Das Worklet bekommt **keine** zusätzliche Arbeit. Die Noten werden erst nach FANG/REC auf
  der ohnehin berechneten Tonhöhenspur berechnet (≤ 15 ms für 64 Takte). **WebGL bringt hier nichts** (eine Fläche, eine Klasse) – das sage
  ich gleich jetzt.

---

#### 0. Befund im Code (was es schon gibt, worauf I4 aufsetzt)

| Baustein | Stelle (stage-ges) | Bedeutung für I4 |
|---|---|---|
| VS2-Kern `vsDspMake()` (Block `VSDSP-BEGIN … END`) | `pyin` (fs = Kontext-Rate : 3, Hop 5 ms); `segment` (≈ 38500–38612): Noten mit `by: 'einsatz'` **nur** nach Pause oder Energie-Einbruch ≥ 6 dB, `'ton'` bei Tonwechsel ohne Absetzen, `'maske'`; Beginn + `bias` 12 ms; Einrasten mit Gleichstand → höher | Tonquelle und Einsätze für den Feinabgleich. Eine gebunden gesummte Phrase liefert meist nur 1–2 `'einsatz'` → Lernen über mehrere Aufnahmen (§5.5). `segment` bleibt, wie es ist. |
| Live-Weg im Worklet `synq-stimme` | MPM, meldet `{lit}` → `vsLitMsg` (`VS.lit`) | nur für Extra a (Ton-Anzeige). |
| Zeitkarte Mikro ↔ Musik | `stLatAt(F)`, `stRead(a, b, {align, d16})`, `ST.marks`, `ST.latMs` | Gesang liegt schon auf der „gehörten“ Achse (Rundlauf R, auf Xanders iPhone ≈ 75 ms). |
| Geräte-Profil `synq-stimme-v1` (`stProf()`, ≈ 37689) | Der Lader übernimmt einen Weg in `prof` **nur mit gültigem `p.ms`** und kopiert **feste Felder**; `vs` ebenfalls mit festen Feldern (`src, lock, snap, grid`, VS-L `mel`). `stCalEnd` ('voll', ≈ 37991) **ersetzt** `prof[ST.route]` ganz. Der Weg-Hinweis (≈ 37847) bietet „Einmessen“ nur an, wenn `stProf().prof[g]` fehlt. | I4 schreibt **nie** in `prof[route]`. Eigener Schlüssel `tipp` mit eigenem Lader; `rh` wird in Lader, `vsCfg`, `vsCfgSet` ergänzt (§4.1). |
| Latenz | `audBeat() = t2b(currentTime − AU.outLat)`, `AU.outLat = devLat + graphLat`, `devLat = clamp(outputLatency ‖ baseLatency, 0, 0,1 s)` (`updateOutLat`, ≈ 17445), `graphLat` = Vorausschau der Kompressoren (≈ 12 ms); `stOutMs()` = (outputLatency + baseLatency)·1000; `prof[route].outMs` beim Einmessen | Startwert der Tipp-Verzögerung je Weg (§5.4). |
| Stimme-FANG | `vsFang` → `fangCompute` → `vsAnalyse(ta, tb, cfg)` → `vsFangDone` (`vsNotesOf`, `vsPhrase`, `g3FirstBar`) → `vsApply` → `vsResSheet` | Hier hängen die Tipps ein (§6.7). |
| ● REC → MELODIE | `vsRecEnd` analysiert ab `r.start − 0,5 − G3_PRE_BARS·4` Schlägen (Einzählen eingeschlossen); `vsRecDone` → **`g3RecStart(r, A)`** (≈ 42084, ruft selbst `vsNotesOf`) → `vsApply` → `g3ApplyPre`/`g3PreNotes` (Auftakt → `clip.pre`) | Alle Aufrufer brauchen dieselbe Notenquelle (§6.7). |
| Aufrufer von `vsNotesOf` | `vsFangDone`, `vsApply`, `g3RecStart`, `g5Scene`, `g5Song`, Test-API `vsAnalyseRange` | dto. |
| Ergebnis-Blatt | `vsResPaint`: `data-a="drop"` = **Verwerfen** (→ `vsResDrop` → `undo()`), `data-a="x"` = ✕; `vsResSet` ändert ohne neuen Undo-Schritt | Neue Knöpfe nie mit `drop` (§7.4). |
| Takes (VS3, G3, G8) | `tkMakeTake`: `tkReadMic` liest das Mikro bei `F + lat(F)` → **Take-Sample 0 = gehörter Kontext-Frame `F0 = Fa − pre`** (inkl. G3-Anlauf); G8 `g8MakeTake`: Strom über dieselbe Funktion, Sample 0 = `s.F0` | Take-Sekunde = gehörte Kontext-Sekunde − F0/sr (Extra e, §4.2). |
| G5 | `g5Analyse` (≈ 42883): pYIN auf den **rohen** Take-Samples; Analyse-Sekunde s ↔ Take-Sample 3·(d0 + s·fs) + 2; die Zeitkarte wirkt **nur** in `beatOf` (`wt(…)`, ≈ 42897) | Tipps nie durch die Zeitkarte (Extra e). |
| Haptik | `hapticInit()`/`haptic()` (≈ 26712): verstecktes Schalter-Kästchen, `HAP.lbl.click()` **aus dem Code**, ≥ 30 ms Abstand, `UI.haptics` | Laut [W3] seit iOS 26.5 wirkungslos; während einer Aufnahme schaltet iOS Haptik in der Grundeinstellung ab [W7] (§7.3). |
| Tastatur-Feld `#kbArea` | Hoch `clamp(170px, 30dvh, 260px)`, bei ≤ 700 px Höhe `clamp(140px, 27dvh, 220px)`; Blatt offen 170 / 140 / 110 px (≤ 600 px Höhe). Quer `clamp(110px, 34dvh, 150px)`, Blatt offen 110 px. Polster 6/6/5 px + 1 px Linie. AM-Spur: `#kbArea.mkw` mit Rädern `#mkWh` (92 px + 4 px Abstand, `mkWheelFrame`, ≈ 18141). Das MS-2000-Blatt deckt das Feld ab (`mkcov`, nur Sichtbarkeit). I1 will dasselbe Feld (Super-Regler). | §7.2. |
| `fangMode()` (≈ 23479) | 'stimme' bei Gesang in den letzten 8 s und keiner Taste danach (`CAP.last`) | Tipps sind keine Tasten (§7.2); Änderung nur mit Extra f. |
| Takt | `grid().beatsPerBar` = 4 (fest). Taktarten (T1) sind freigegeben, der Umbau kommt nach den Gesangs-Merges. | I4 rechnet Taktlängen **nur** über `grid().beatsPerBar` (keine neuen ×4). |
| Undo-Prüfung | `historyCheck()` gibt es nur im Zweig `n5-br-H` (VC2a), nicht in 4.23.0/stage-ges | I4-51. |
| Mikro-Check | `micOpen`/`micBuild`/`micRender` (Diagnose-Blatt) | Das Messblatt nutzt denselben Stil (§7.5). |

Wichtig: Heute ist der **Rhythmus** der erkannten Noten allein Sache der Stimme (`segment`). Genau das ist die Schwachstelle, über die
Xander am 24.10. klagte („falsche Zwischennoten“, „es wackelt“, schnelle Töne fehlen). Die Hysterese 70 ms/60 ct, die das Wackeln bändigt,
verschluckt zwangsläufig schnelle oder gleich hohe Töne. Tipps lösen das, ohne `segment` anzufassen.

---

#### 1. Ziel

Xander soll eine Melodie, die er im Kopf hat, sauber als Noten in die App bekommen, auch wenn sie schnell ist, gleiche Töne wiederholt oder
mit Vibrato gesungen wird. Dazu summt er wie bisher ins Mikrofon und tippt gleichzeitig mit einem Finger auf eine große Fläche, einmal pro
Ton: Solange der Finger liegt, klingt die Note. Die App nimmt den Rhythmus aus dem Finger und die Tonhöhe aus der Stimme. Die Verzögerungen
von Bildschirm und Mikrofon gleicht sie selbst aus, und das Ergebnis landet im gewohnten MELODIE-Clip mit demselben Ergebnis-Blatt wie heute.
Tippt er nicht, bleibt alles wie bisher. Am Klang und an gespeicherten Projekten ändert sich nichts.

#### 2. Umfang und Nicht-Umfang

**Kern (wird gebaut, auch ohne weitere Antwort)**
1. **Tippfläche** im Tastatur-Feld, solange 🎤 SINGEN an ist und im Mikro-Blatt „Rhythmus: Tippen“ gewählt ist (Hoch- und Querformat) [V, F1].
   Dazu die gemeinsame Feld-Regel mit I1 (§7.2).
2. **Tipp-Zeit**: Berührungs-Zeitstempel → gehörter Schlag (Uhren-Brücke), Tipp-Verzögerung je Weg (Startwert, gelernt, gemessen),
   Feinabgleich je Aufnahme an den Stimm-Einsätzen (§5).
3. **Noten aus Tipps** (DSP, DOM-frei, im VS2-Block): Fenster je Tipp, Tonhöhe, Stimmung, Einrasten, Anschlag, Tipps ohne Ton, Stimme ohne
   Tipp (gezählt), zwei Töne in einem Tipp, mehrere Finger. **Eine** Notenquelle für alle Aufrufer, Rückfall ohne Tipps (§6).
4. **Zählzeile** im Ergebnis-Blatt („12 Noten · aus 12 Tipps · …“) [V, F1].
5. **Messwerkzeuge für das iPhone**, in der App nicht zu sehen: das Messblatt hinter dem Prüf-Link `#tippmessung` (I4-60/60b) und die
   Haptik-Probe-Seite in der Werkstatt (I4-61, nicht Teil der App).
6. Hilfe-Satz, Test-API, Changelog, „Bitte prüfen“.

**Extras [E] (nur nach Xanders Ja, F7; ohne Antwort werden sie nicht gebaut)**
- **a** Tipp-Spur oben in der Fläche (gerade gesungener Ton, Tipps der letzten 2 Takte).
- **b** Zeile „Tippen messen“ im Mikro-Check (das Messblatt aus dem Kern, sichtbar gemacht).
- **c** Umschalter „Rhythmus [Tipps] [Stimme]“ im Ergebnis-Blatt.
- **d** Knöpfe [Weglassen] (Tipps ohne Ton) und [Dazunehmen] (Stellen ohne Tipp) im Ergebnis-Blatt.
- **e** Tipps am Take speichern → Tippen auch bei ● SONG, „In Melodie umwandeln“ (G5) mit Tipps; G9 darf sie lesen.
- **f** FANG erkennt „nur getippt, kaum gesummt“ als Gesang (`fangMode`).
- **F4** Tick je Tipp – nur wenn die Geräte-Probe ihn mit 🎤 an fühlbar zeigt **und** Xander ihn will.

**Nicht im Umfang** (Regel 27; nur auf Xanders Wort)
- Kein **Live-Ton** beim Tippen: Beim Aufsetzen des Fingers ist die Tonhöhe noch nicht bekannt. Die erste sichere Höhe kommt ≈ 50–60 ms nach
  dem Einsatz, ein Ton dann wäre zu spät oder falsch.
- Kein **Anschlag aus dem Finger**: Das iPhone 12 Pro Max misst keinen Fingerdruck. Der Anschlag kommt wie heute aus der Lautstärke der Stimme.
- Kein **Schlagzeug** aus Tipps, keine Akkorde (eine Fläche = eine Stimme).
- **G2** (Gesang als Noten-Blöcke) bekommt seine Blöcke weiter aus VS2.
- **Silben des Songtexts** sind Sache von G9 (aus der Analyse, wie Xander es beschrieben hat). I4 liefert Tipps nur mit Extra e (F5).
- Keine automatische Entfernung des **Klopfgeräuschs** aus dem Gesangs-Take (erst messen, F6).

---

#### 3. Ablauf aus Xanders Sicht

**Einschalten (einmal):** 🎤 SINGEN an → Mikro-Blatt (Tipp auf die Mikro-Zeile) → Zeile **„Rhythmus“ [aus der Stimme] [Tippen]** → Tippen.
Die Einstellung gilt auf diesem Gerät (wie „In Tonart einrasten“), nicht im Projekt. Ab jetzt zeigt das Tastatur-Feld bei SINGEN die
**Tippfläche**. **[⌨]** in der Fläche schließt sie bis zum nächsten Einschalten von 🎤; die Einstellung „Tippen“ bleibt.

**Stimme-FANG:** ▶ läuft (Loop), Xander summt und tippt mit, drückt **FANG**. Die App nimmt die letzte Phrase (wie heute); die Noten kommen
aus den Tipps. Das Ergebnis-Blatt zeigt wie heute die Noten und dazu die Zählzeile, z. B. „12 Noten · aus 12 Tipps · Finger 14 ms nach der
Stimme – ausgeglichen“.

**● REC mit 🎤:** wie heute; die Tipps im Aufnahme-Bereich bestimmen die Noten des MELODIE-Clips. Ein getippter Auftakt im Einzählen wird wie
ein gesungener Auftakt zum Vorlauf des Clips (G3).

**● SONG mit 🎤:** Im Kern ist die Fläche während einer Song-Aufnahme nicht zu sehen (Tastatur wie heute). Mit Extra e werden die Tipps am
Song-Take gespeichert, und „In Melodie umwandeln“ (G5) nimmt sie.

**Ohne Tipps:** Hat Xander in der Phrase gar nicht getippt, rechnet die App genau wie heute aus der Stimme („keine Tipps – aus der Stimme“).

---

#### 4. Datenmodell (Format bleibt 5, nur zusätzliche Felder, alte Projekte Zeichen für Zeichen gleich)

##### 4.1 Gerät (nicht im Projekt): Profil `synq-stimme-v1` (`stProf()`)
```
vs.rh       'stimme' | 'tippen'                         fehlt = 'stimme' (Vorgabe)
tipp        {speaker?: T, wired?: T, bt?: T, src?: 'pointer' | 'touch'}      eigener Schlüssel, NIE in prof[route]
  T.pool    [[τ, …], …]   je Aufnahme ein Feld (neueste zuletzt), höchstens 8 Aufnahmen × 16 Werte; τ in ms auf 0,1, Bereich −80 … 250
  T.mess    {τ, spread, n, at}   aus dem Messblatt (nur Lautsprecher-Weg): spread = IQR/1,35 in ms, n = gehörte Tipps (6 … 10)
  T.at      ISO-Zeit der letzten Änderung (≤ 30 Zeichen)
  src       Quelle der Zeitstempel, vom Messblatt gesetzt (I4-60b); fehlt = 'pointer'
```
τ (Tipp-Anteil) ist die Tipp-Verzögerung **ohne** den Fehler der Ausgabe-Latenz; die benutzte Verzögerung ist k = τ + Δout (§5.4).
- **Lader:** `tipProfNorm(o.tipp)` in `stProf()` neben der `vs`-Zeile. Unbekannte Wege und Felder fallen weg, Zahlen müssen endlich und im
  Bereich sein, Felder werden gekürzt (Pool ≤ 8 × 16); ungültig → das Feld fehlt. In der `vs`-Zeile kommt
  `rh: o.vs.rh === 'tippen' ? 'tippen' : 'stimme'` dazu; `vsCfg()`/`vsCfgSet({rh})` wie `mel` (VS-L).
- **Nie berührt:** `prof[route]` (Einmessen, Weg-Hinweis und `.ms`-Leser bleiben unverändert). I4 liest dort nur `outMs` (§5.4).
- `stProfSave()` schreibt `ST.prof` ganz, also ist `tipp` dabei. Eine ältere App-Version lässt `tipp` und `rh` beim nächsten Speichern des
  Profils weg; danach gilt wieder die Vorgabe (Changelog).

##### 4.2 Take: `S.takes[id].tp` (nur mit Extra e; fehlt = keine Tipps)
```
tp = {v: 1, k, f, x: [[d, u], …]}
   x   Tipps in Take-Sekunden, Take-Sekunde = gehörte Kontext-Sekunde − F0/sr. F0 = Kontext-Frame von Take-Sample 0:
       tkMakeTake  F0 = Fa − pre (inkl. G3-Anlauf)      g8MakeTake  F0 = s.F0 (Beginn des Song-Stroms)
       Schon mit k und f (gehörte Zeit, §5), d = Finger runter, u = Finger hoch (u ≥ d + 0,005), aufsteigend nach d, auf 0,0001 s,
       höchstens 20 000 Paare
   k, f   angewandte Werte (ms, 0,1), nur zur Auskunft – die Rechnung nutzt x
```
Liegen mehr als 20 000 Tipps im Bereich, kommt einmal der Hinweis „Mehr als 20 000 Tipps – die weiteren werden nicht gespeichert“, und
`tipInfo().cut` zählt sie; nichts wird still abgeschnitten. Normalisieren über den vorhandenen Haken
`tkExt().take.push((raw, o) => { const t = tipNormTp(raw.tp, o.len / o.sr); if (t) o.tp = t; })`: Ungültige Paare fallen weg, `d`/`u`
werden auf [0, Take-Länge] begrenzt, ohne gültiges Paar fehlt `tp`. Kopien, Duplizieren, P1-Datei (ZIP) und Undo-Schnappschüsse tragen `tp`
mit (JSON). Eine Vorgänger-Version öffnet das Projekt ohne Fehler und lässt `tp` beim Speichern weg (Changelog).

##### 4.3 Clips, Noten, Song: **nichts Neues**
MELODIE-Noten bleiben `{t, o, d, n, v}`, dazu `clip.q`, `clip.take`, `clip.pre` (G3) wie heute. Es gibt **kein** Merkmal „aus Tipps“ an
Noten oder Clips. Markierungen leben nur im offenen Ergebnis-Blatt (`VS.res`).

##### 4.4 Laufzeit (nicht gespeichert)
```
TIP = {el, open: Map(pointerId → {P, Pt, y}), ring: [{c0, c1, k, y}] (Kontext-Sekunden der Berührung, k beim Aufsetzen, y = Lage 0…1),
       br: {buf: Float64Array(80), i, n, o}, zu: bool (Sitzung: mit [⌨] geschlossen), bad: n, cut: n}
A.tips      [{s0, s1}]   Analyse-Sekunden, an A gehängt von vsAnalyse (Live) bzw. g5Analyse (Extra e)
A.tipAlign  {f, fHow: 'abgeglichen' | 'begrenzt' | 'zu wenig', pairs: [Δ, …], kUsed, dOut}      nur Live-Weg
VS.res.tip  {n, f, fHow, noTone: [i], two: [i], open: [{b, d, n, v}], omit: bool, add: bool}      omit/add nur mit Extra d
```
`P`/`Pt` = Zeitstempel aus `pointerdown` bzw. `touchstart` (beide gemerkt, §5.2). `TIP.ring` hält 130 s (Mikro-Ring `ST_SEC` 120 s +
Rand), höchstens 20 000 Tipps. Wird die Grenze erreicht, fallen die ältesten weg (außerhalb des Mikro-Rings wertlos). Mit Extra e während
● SONG fällt nichts weg; am Take gilt §4.2.

---

#### 5. Zeit: vom Finger zum gehörten Schlag

##### 5.1 Zwei Ketten, eine Achse
```
Stimme:  Mund (Zeit T) → Mikro → Worklet-Eingang → Ringpuffer → um R nach vorn (Rundlauf, eingemessen) → gehörte Zeit
Finger:  Glas (Zeit T) → Touch-Abtastung + iOS → Zeitstempel P → Uhren-Brücke → Kontext-Zeit c(P) → − AU.outLat − k − f
```
„Gehörte Zeit“ heißt: die Kontext-Zeit, zu der die Musik berechnet wurde, die man in dem Moment hörte. Auf derselben Achse liegen heute
Tasten (`t2b(now − AU.outLat)`) und Gesang (`vsAnalyse` → `beatOf`). Schlag = `t2b(h)`.

##### 5.2 Stufe 1 – Uhren-Brücke (immer)
Heute nimmt die Tastatur `AU.ctx.currentTime` **beim Abarbeiten** des Ereignisses. Ist der Haupt-Faden gerade 20–40 ms beschäftigt
(Zeichnen, Speichern), liegt die Note um so viel zu spät. I4 nimmt den **Zeitstempel der Berührung** und rechnet ihn in Kontext-Zeit um:
- In `tick()` (alle 25 ms, vorhanden) und in jedem Tipp-Ereignis kommt ein Paar `o = ctx.currentTime − performance.now()/1000` in einen Ring
  über 2 s (80 Werte). `currentTime` springt in Blöcken (Chromium 128 Samples = 2,7 ms; iOS je nach Hardware-Puffer bis ≈ 21 ms). Die
  Werte direkt nach einem Sprung sind die genauesten → **o\* = Maximum** im Ring.
- `ctxOf(P) = P/1000 + o*`. Der Ring wird geleert, wenn der Kontext `running` wird, die Seite wieder sichtbar wird (`visibilitychange`,
  `pageshow`) oder `o` um > 50 ms springt.
- **Quelle:** Beide Zeitstempel werden je Tipp gemerkt: `pointerdown/up` (`e.timeStamp`) und `touchstart/end` (passiv, dieselbe Fläche).
  Benutzt wird `tipp.src` (Vorgabe `'pointer'`); das Messblatt setzt es nach I4-60b auf die Quelle, die unter Last stabil bleibt.
- `getOutputTimestamp()` wird **nicht** benutzt (auf iOS gab es einen Fehler mit zu kleiner `contextTime` [W2]).
- **Plausibilität:** Liegt der Zeitstempel > 5 ms nach `performance.now()` oder ist er **älter als 2 s**, gilt die Zeit beim Abarbeiten
  (gezählt in `tipInfo().bridge.bad`). Die Grenze ist absichtlich weit: Gültige Stempel sind bei blockiertem Haupt-Faden bis zu einigen
  100 ms alt, die bekannten Fehler liegen Minuten daneben [W8]. Sind von den letzten 10 Tipps ≥ 3 schlecht, gilt für den Rest der Sitzung
  die Abarbeitungszeit (nur `tipInfo().bridge.mode = 'abarbeiten'`, kein Toast).
- Ziel in Chromium: Fehler der Brücke ≤ 2 ms (P95), unabhängig von der Haupt-Faden-Last (I4-10). Auf dem iPhone ist das nicht bewiesen →
  I4-60b.

##### 5.3 Gehörte Zeit eines Tipps
`h0 = ctxOf(P_down) − AU.outLat − k/1000`, `h1 = ctxOf(P_up) − AU.outLat − k/1000`, mit k und `AU.outLat` vom Moment des Aufsetzens.
Der Feinabgleich `f` (§5.5) kommt erst bei der Auswertung dazu. `pointercancel`/`touchcancel` zählen wie Loslassen (Zeitstempel des Abbruchs).

##### 5.4 Stufe 2 – Tipp-Verzögerung k je Weg: k = τ + Δout
- **Δout** (Fehler der Ausgabe-Latenz, ms) = clamp(`stOutMs()` − 1000·`AU.devLat`, 0, 150), im Moment des Aufsetzens. Fehlt `stOutMs()`,
  wird das beim Einmessen gespeicherte `prof[route].outMs` genommen (nur lesen), sonst gilt 0. Δout ist das, was die App bei der Ausgabe weglässt:
  die Kappung auf 100 ms bei Bluetooth und `baseLatency`, wenn `outputLatency` da ist. Vor iOS 18.4 fehlt `outputLatency` [W2] → Δout ≈ 0,
  und den Rest lernt der Pool.
- **τ** (Finger, Bildschirm, Gewohnheit), Quellen in dieser Reihenfolge:
  1. **gelernt**: Pool dieses Wegs mit ≥ 8 Werten aus ≥ 3 Aufnahmen und Streuung MAD ≤ 30 ms → Median (§5.5).
  2. **gemessen**: `tipp[route].mess` aus dem Messblatt (§7.5).
  3. **vom Lautsprecher**: τ des Lautsprecher-Wegs (gelernt oder gemessen). Finger und Bildschirm sind auf allen Wegen gleich; was sich je Weg
     unterscheidet, steckt in Δout.
  4. **geschätzt**: 30 ms (Touch-Abtastung 120 Hz = 8,3-ms-Raster, iOS-Weg bis 2 Bilder bei 60 Hz ≈ 33 ms [W1]).
- Bereich k: −50 … 250 ms. `tipInfo()` zeigt k, τ, Δout und die Quelle („gelernt“, „gemessen“, „vom Lautsprecher“, „geschätzt“).

##### 5.5 Stufe 3 – Feinabgleich je Aufnahme und Lernen über mehrere Aufnahmen
Hintergrund: Menschen tippen zu einem Takt im Mittel einige 10 ms **zu früh** [W4]. Beim Mitklopfen zu Sprache liegen die Tipps an den
Einsätzen der Silbenkerne (Vokale) [W5]. Die Stimme ist über R eingemessen und bei jedem Start geprüft – sie ist die verlässlichere Uhr.
1. **Einsätze** der Stimme = die Noten von `segment` mit `by === 'einsatz'` (Beginn nach Pause oder Energie-Einbruch, Zeit inkl. `bias`).
2. **Paare:** zu jedem Einsatz der nächste Tipp-Beginn im Abstand ≤ 150 ms, jeder Tipp höchstens einmal. Δ = Tipp − Einsatz (vor f).
3. **f für diese Aufnahme:** nur bei **≥ 5 Paaren** und MAD ≤ 30 ms: `f = clamp(median(Δ), −80, +80)` ms, alle Tipps der Aufnahme um −f
   („abgeglichen“, bzw. „begrenzt“, wenn der Median außerhalb ±80 ms lag). Sonst `f = 0`, „zu wenig klare Einsätze“.
4. **Pool:** Jede Aufnahme mit **≥ 1 Paar** legt ihre Werte `τᵢ = k_benutzt + Δᵢ − Δout_benutzt` ab (höchstens 16, die dem Median
   nächsten), auch wenn f = 0 blieb. So lernt k auch aus gebunden gesummten Phrasen mit nur 1–2 klaren Einsätzen. Liegt die Pool-MAD
   > 30 ms, bleibt die bisherige Quelle (§5.4).
5. **Wo und wie oft:** `tipAlign(A)` läuft **einmal** je Analyse in `vsAnalyse` (rein: rechnet Paare und f, legt `A.tipAlign` an, verschiebt
   `A.tips`). `tipLearn(A)` läuft **genau einmal** je Auftrag in `vsFangDone`/`vsRecDone`, und nur wenn das Ergebnis Noten hat. Spätere
   `vsNotesOf`-Aufrufe (Oktave, Raster, Einrasten) rechnen nichts davon neu. G5 ruft keins von beiden (in `tp` steckt f schon).
6. **Anzeige** in der Zählzeile: „Finger 14 ms nach der Stimme – ausgeglichen“ / „… vor der Stimme …“ / „Finger und Stimme gleich“
   (|f| < 3 ms); bei „zu wenig“ nichts dazu.

##### 5.6 Was auf dem iPhone unsicher ist (darum I4-60b)
- Ob `PointerEvent.timeStamp` die Berührungszeit des Systems ist oder die Zeit, zu der der Web-Prozess das Ereignis gebaut hat (dann wirkt
  Haupt-Faden-Last doch). Darum wird `touchstart` daneben gemessen.
- Bekannte WebKit-Fehler mit versetzten oder negativen Zeitstempeln nach dem Hintergrund [W8] → Neustart der Brücke, Grenze 2 s.
- Bündelung der Berührungen auf 60 Hz (Raster 16,7 ms → zusätzliche Streuung ≈ 5 ms).
- System-Gesten nahe am unteren Rand (Home-Bildschirm-App mit `apple-mobile-web-app-capable`) können Berührungen dort verzögern → Vergleich
  obere/untere Hälfte der Fläche.
- Weicht ein Fall um > 8 ms ab (unten/oben, hoch/quer, Safari/Home-Bildschirm), schlägt der Dirigent Xander eine Korrektur vor (Regel 3).
  I4 selbst baut dafür nichts vorab; der Pool gleicht den Mittelwert aus.

##### 5.7 Zahlen auf einen Blick
| Größe | Wert |
|---|---|
| Analyse-Raster (pYIN) | 5 ms je Frame, fs = Kontext-Rate : 3 (48 kHz → 16 kHz) |
| Rundlauf R Lautsprecher (Xanders iPhone) | ≈ 75 ms, bei jedem Start kurz geprüft (VS1) |
| Touch-Abtastung iPhone 12 Pro Max | 120 Hz (Raster 8,3 ms), Anzeige 60 Hz [W1] |
| k | τ + Δout; τ geschätzt 30 ms; k-Bereich −50 … 250 ms |
| Feinabgleich je Aufnahme | ≥ 5 Paare, Paar-Abstand ≤ 150 ms, MAD ≤ 30 ms, Grenze ±80 ms |
| Lernen (Pool je Weg) | ≥ 8 Werte aus ≥ 3 Aufnahmen, MAD ≤ 30 ms, höchstens 8 Aufnahmen × 16 Werte |
| Plausibilität Zeitstempel | > 5 ms Zukunft oder > 2 s alt → Abarbeitungszeit |
| Prellen | zweites Aufsetzen < 30 ms nach dem vorigen = verworfen |
| kürzeste Note | 1/32 Schlag im Clip (wie VS2), Tipp-Länge ≥ 25 ms intern |
| Tonhöhen-Suchfenster | Tipp-Beginn −60 ms … Ende +40 ms (kurzer Tipp < 150 ms: bis +250 ms, nie über den nächsten Tipp −10 ms) |

---

#### 6. Noten aus Tipps (DSP)

##### 6.1 Ort und Form
Neue Funktion **`tapNotes(tr, taps, o)`** im VS2-Block `vsDspMake()` (DOM-frei, auch in Node/Worker nutzbar). Rückgabe wie `segment`:
`{notes: [{t0, t1, m, n, raw, by: 'tipp' | 'ohne' | 'zwei', lv}], tuneCt, open: [...]}`. `pyin` und `segment` bleiben Zeichen für Zeichen
gleich. Stimmung und Einrasten werden in `tapNotes` mit derselben Rechnung nachgebaut (≈ 15 Zeilen), statt `segment` umzubauen.
Eingang: `tr` = `A.tr` (5-ms-Frames), `taps` = `A.tips` in **Analyse-Sekunden**, `o` = `{scale, root, snap, tuning: 'auto', segNotes, bleed}`.
- **Live (`vsAnalyse`):** neue Funktion `A.secOfH(h)`, die Umkehrung von `A.beatOf` ohne `t2b`: `M₀ = h·sr + lat(h·sr)`,
  `M = h·sr + lat(M₀)` (ein Schritt genügt, `lat` ändert sich langsam), `s = ((M + 21)/3 − d0)/fs` (aus `M = 3·(d0 + s·fs) + 2 − 23`).
  Rundlauf-Probe: |`A.beatOf(A.secOfH(h))` − `t2b(h)`| entspricht ≤ 0,1 ms (I4-33).
- **G5 (Extra e):** `s = x − (3·d0 + 2)/sr` aus den Take-Sekunden von `tp`, **ohne** Zeitkarte. Die Zeitkarte (VS5a/G1 „Audio folgt“) wirkt
  nur über `A.beatOf` auf die fertigen Noten, wie beim Gesang heute; `secOfH` braucht G5 nicht. G2-Höhe (`g5Pitched`) und Säubern
  (`clEnsure`) ändern keine Zeiten.
Rechnen im Haupt-Faden nach dem Worker-pYIN (O(Frames), ≤ 15 ms für 64 Takte in Chromium, I4-32).

##### 6.2 Tipps ordnen
1. Nach Beginn sortieren; ein Aufsetzen < 30 ms nach dem vorigen fällt weg (Prellen, Doppelkontakt).
2. **Eine Stimme:** Ende_i = min(Loslassen_i, Beginn_{i+1}). Ein noch liegender Finger endet am Bereichsende (FANG-Zeit bzw. REC-Ende).
   Zwei Finger abwechselnd ergeben so saubere Legato-Noten; das spätere Loslassen des ersten Fingers wird ignoriert.
3. Tipp-Länge intern ≥ 25 ms (im Clip ≥ 1/32 Schlag wie `vsNotesOf`).

##### 6.3 Tonhöhe je Tipp
- **Suchfenster** W_i = [Beginn − 60 ms, Ende + 40 ms]. Ist der Tipp kürzer als 150 ms (kurz angetippt, Ton weiter gehalten), endet das
  Suchfenster bei min(Beginn + 250 ms, nächster Beginn − 10 ms). Nie in den nächsten Tipp hinein.
- **Gezählte Frames:** stimmhaft (`f0 > 0`), nicht `unk` (Klick-/Treffer-Maske, Aussetzer), nicht Übersprechen.
- **Kern:** ab dem späteren von Tipp-Beginn und erstem stimmhaften Frame im Fenster, + min(60 ms, 25 % der Länge) (Anschleifen), bis
  Ende − min(30 ms, 15 %) (Abfall) – dieselben Anteile wie `center()` in `segment`.
- **Höhe:** Median der Kern-Frames (in MIDI, nicht gerundet), wenn ≥ 30 ms (6 Frames) stimmhaft sind. Sonst Median über den **Tipp selbst**
  ([Beginn, Ende], beim kurzen Tipp [Beginn, verlängertes Ende]), wenn dort ≥ 20 ms stimmhaft sind – nicht über die Ränder −60/+40 ms, damit in
  schnellen Läufen keine Nachbarhöhe gewinnt. Sonst **Tipp ohne Ton** (§6.4).
- **Zwei Töne in einem Tipp:** Aus dem 3-Frame-Median werden ruhige Strecken gesucht (≥ 45 ms innerhalb 25 ct, wie `flat()`). Gibt es zwei mit
  ≥ 0,8 Halbtönen Abstand, jede ≥ 60 ms, gilt die **längere** (bei ±10 ms gleich: die frühere); Merkmal `by: 'zwei'`, im Blatt gezählt.
- **Vibrato** bis ±130 ct bei 5–7 Hz: Der Median liegt in der Mitte (Abweichung ≤ 20 ct, I4-23). **Oktavsprünge** einzelner Frames (< 50 %)
  ändern den Median nicht.
- **Übersprechen** (Lautsprecher): Die gewählte Höhe wird mit `A.bleed({t0, t1, m})` geprüft. Ist sie nur die App selbst, wird die nächste
  ruhige Strecke geprüft, sonst gilt der Tipp als ohne Ton.

##### 6.4 Tipp ohne Ton (Vorgabe nach F2)
Note mit der Höhe des vorigen Tipps mit Ton (Abstand ≤ 2 s), sonst des nächsten; Anschlag ebenso übernommen; Merkmal `by: 'ohne'`. Gibt es in
der ganzen Phrase keinen Ton, entsteht nichts („Nur Tipps, kein Gesang erkannt“). Im Kern steht in der Zählzeile „2 Tipps ohne Ton – Höhe vom
Ton davor“. Mit Extra d kommt [Weglassen] dazu.

##### 6.5 Stimme ohne Tipp
`segment` läuft auf derselben Spur mit (dieselben Optionen wie `vsNotesOf`, Ergebnis aus `tipAlign` wiederverwendet). Eine VS2-Note gilt als
„ohne Tipp“, wenn ≥ 50 % ihrer Dauer in keinem Suchfenster liegen, sie ≥ 120 ms lang ist und kein Übersprechen ist. Sie wird **nicht**
übernommen, nur gezählt: „1 Stelle ohne Tipp“. Mit Extra d fügt [Dazunehmen] genau diese VS2-Noten ein.

##### 6.6 Stimmung, Einrasten, Oktave, Anschlag, Raster
- Stimmung: gewichteter Kreis-Mittelwert der Nachkommastellen über alle Tipp-Noten mit Ton (Gewicht = stimmhafte Kern-Frames), wie `segment`.
- Einrasten: nächster Ton der Tonart der Stelle (`vsKeyAt`, Szene/Träger/Song), gemessen an der Höhe ohne Stimmung, Gleichstand → höher
  (genau die Regel aus `segment`); „Frei“ = gerundet. Oktave ‹ › wie heute (`o.oct`).
- Anschlag: `v = clamp(0,5 + (lv + 26)/40, 0,3, 1)` mit lv = Median-Pegel (dB) der Kern-Frames – dieselbe Formel wie `vsNotesOf`.
- Raster: Das Raster des Blatts (frei · 1/16 · 1/8) setzt wie heute nur den Beginn (`qPos`); die Länge bleibt die Finger-Länge (F3).

##### 6.7 Eine Notenquelle für alle Aufrufer
- `vsAnalyse(ta, tb, cfg)` hängt die Tipps aus `TIP.ring` mit Beginn in [ta, tb] als `A.tips` an (über `A.secOfH`) und ruft `tipAlign(A)`.
  `g5Analyse` hängt mit Extra e die Tipps aus `take.tp` an (§6.1), ohne `tipAlign`.
- **`vsNotesOf(A, o)`**: Hat `A.tips` Einträge und ist `o.rh !== 'stimme'`, kommen die Noten aus `tapNotes`, umgerechnet über `A.beatOf`, in
  **derselben Form** `{notes: [{b, d, n, raw, m, v, by}], tuneCt, key}` plus `tip` (Zählwerte). Sonst ist die Funktion unverändert. Ergebnis
  je `snap|oct` an `A` zwischengespeichert.
- Damit nehmen **alle** Aufrufer ohne eigene Änderung die Tipp-Noten: `vsFangDone` (Phrase über `vsPhrase`), `vsApply`, **`g3RecStart`**
  (Anfangstakt aus der ersten Tipp-Note ab `r.start − 0,25`), `g5Scene`/`g5Song` (Extra e) und die Test-API `vsAnalyseRange`.
- **Auftakt und Einzählen:** Tipp-Noten vor dem Clip-Anfang laufen wie gesungene durch `g3PreNotes`/`g3ApplyPre` und werden zu Vorlauf-Noten
  (`clip.pre`), so weit G3 sie nimmt (neuer Clip, nicht beim Overdub; bis `G3_PRE_BARS` Takte). Ein getippter Auftakt im Einzählen von ● REC
  verhält sich also genau wie ein gesungener.
- **FANG-Bereich:** `from` = der frühere Wert aus der heutigen Regel (`vsLiveStart`) und Tipp-Phrasenbeginn − 1 Schlag, nie vor
  `E − 260`. Tipp-Phrasenbeginn = erster Tipp nach einer Tipp-Lücke ≥ 1 Takt (`grid().beatsPerBar` Schläge).
- Mit Extra c fragt der Umschalter mit `o.rh = 'stimme'` die VS2-Noten derselben Analyse ab.

##### 6.8 Rückfall
- Keine Tipps im Bereich → `vsNotesOf` wie heute (Ergebnis deep-equal zum Stand vor I4, I4-28), Zählzeile „keine Tipps – aus der Stimme“.
- Tipps, aber 🎤 lieferte nichts (`vsWhenData` false) → wie heute „Mikrofon liefert gerade nichts“.

---

#### 7. Bedienung

##### 7.1 Schalter im Mikro-Blatt (Kern) [V, F1]
In `stSheetFill` unter „Stimme → Noten“ (unter der VS-L-Zeile „Melodieerkennung“) eine Zeile **„Rhythmus“** mit
`segHTML('vsRh', [['stimme', 'aus der Stimme'], ['tippen', 'Tippen']])`, Knöpfe ≥ 44 px hoch. Bei „Tippen“ steht darunter klein: „Beim Singen
einmal pro Ton auf die Fläche tippen – so lange der Finger liegt, so lang ist die Note.“ Die Zeile ist grau mit dem Satz „nur mit
Melodieerkennung An“, wenn VS-L auf „Aus“ steht. Sie gilt für Quelle Stimme und Instrument (gleiche Analyse). `bindStSheet` →
`vsCfgSet({rh})`, setzt `TIP.zu = false`, `kbFieldApply()`.

##### 7.2 Tastatur-Feld: eine Regel für I1 und I4, Tippfläche
**Gemeinsame Regel (wortgleich in I1 §6.1/§8 zu übernehmen; wer zuerst baut, legt die Funktionen an, der zweite ergänzt seinen Zweig):**
```
kbFieldMode():  'tipp' | 'sr' | 'tasten'      (feste Reihenfolge, keine „zuletzt geöffnet“-Regel)
  1. 'tipp'    ST.on && vsCfg().rh === 'tippen' && vsCfg().mel !== false && !TIP.zu && !R.songRec      (I4; R.songRec erlaubt nur mit Extra e)
  2. 'sr'      uiPrefs.kbField === 'sr'                                                                  (I1, Gerät)
  3. 'tasten'
kbFieldApply(): zeigt genau ein Feld (die anderen bleiben im DOM, hidden), Räder #mkWh nur bei 'tasten' (mkWheelFrame fragt den Modus),
                Rasterhöhe von #kbArea unverändert, UI.kbRelayout = true.
Aufrufen bei: 🎤 an/aus, rh- oder mel-Wechsel, [⌨] in Tippfläche oder Super-Regler-Feld, Menü „Super-Regler“, Beginn/Ende Song-Aufnahme,
              Spurwechsel (Räder), Laden der Seite.
TIP.zu (Sitzung, nie gespeichert): true durch [⌨] in der Tippfläche oder durch Menü „Super-Regler“, solange die Tippfläche zu sehen ist;
              false durch 🎤 an und durch „Tippen“ im Mikro-Blatt.
Neuladen: 🎤 ist danach aus (heute so) → 'sr' oder 'tasten' nach uiPrefs. 🎤 an → 'tipp', falls rh = 'tippen'. 🎤 aus → zurück nach uiPrefs.
```
- Das MS-2000-Blatt, das das Feld abdeckt (`mkcov`), ändert den Modus nicht. Unter dem Blatt kommen keine Tipps an.
- **Tipps sind keine Tasten:** kein `noteOn`, kein Eintrag in `CAP.last`, kein MIDI. FANG-Moduswahl wie heute (Änderung nur mit Extra f).

**Wo:** Die Tippfläche ersetzt in `#kbWrap` die Tastatur `#kb` und die Pads `#pads` (beide bleiben im DOM, `hidden`). `#kbArea` behält seine
Rasterhöhe, also gibt es keinen Sprung. Auf AM-Spuren sind die Räder ausgeblendet, solange die Fläche zu sehen ist (die Fläche nutzt die volle
Breite). Das Ausblenden ändert keinen Rad-Wert; Pitch steht losgelassen ohnehin in der Mitte.

| Format | `kb`-Zeile | Fläche ≈ (ohne Blatt / Blatt offen) |
|---|---|---|
| 428 × 926 hoch (Safari mit Leisten … Home-Bildschirm) | 225–260 px, Blatt offen 170 | 416 × 213–248 / 416 × 158 |
| 390 × 844 hoch | 198–253, Blatt offen 170 | 378 × 186–241 / 378 × 158 |
| 375 × 667 hoch (≤ 700 px Höhe) | 148–180, Blatt offen 140 | 363 × 136–168 / 363 × 128 |
| 320 × 568 hoch (≤ 600 px Höhe) | 140–153, Blatt offen 110 | 308 × 128–141 / 308 × 98 |
| 926 × 428 quer (Safe-Area 47 px je Seite) | ≈ 145, Blatt offen 110 | ≈ 724 × 133 / 724 × 98 |
| 844 × 390 quer | ≈ 133, Blatt offen 110 | ≈ 642 × 121 / 642 × 98 |
| 667 × 375 quer (ohne Safe-Area) | ≈ 128, Blatt offen 110 | ≈ 559 × 116 / 559 × 98 |

**Aussehen (Kern):** eine dunkle Fläche in Gehäusefarbe mit feiner Linie, in der Mitte „TIPPEN“ und klein „einmal pro Ton“ (gedimmt). Oben
rechts **[⌨]** 44 × 44 (`aria-label` „Tippfläche schließen“), der einzige Bereich, der keine Tipps fängt. Finger unten: Fläche heller
(Klasse `.down`, nur Farbe und Schatten). Läuft ▶ nicht, steht in der Mitte „Erst ▶ – dann singen und tippen“, und Tipps werden nicht
gezählt. Kein Emoji in der Fläche. Bei 90–100 px Höhe (Blatt offen) bleibt „TIPPEN“ in einer Zeile, der kleine Satz entfällt nur, wenn er
nicht passt (kein Abschneiden).
**Extra a – Tipp-Spur [E]:** ein 44-px-Streifen oben (darf überdeckt getippt werden, nur [⌨] fängt ab): links der gerade gesungene Ton
(`VS.lit`, sonst „–“), in der Mitte die Tipps der letzten 2 Takte (Taktlänge über `grid().beatsPerBar`, Taktlinien, je Tipp ein Block in
der MELODIE-Farbe `--t6`, grau ohne Ton). Gezeichnet in der vorhandenen UI-Schleife, nur bei Änderung, höchstens 20 Bilder/s, nur bei
sichtbarer Fläche und laufendem ▶.
**Technik:** `touch-action: none` auf der Fläche, Zeiger-Ereignisse (`pointerdown/up/cancel`, `setPointerCapture`), mehrere Finger über
`pointerId`, dazu passive `touchstart/end/cancel` nur für den zweiten Zeitstempel. Im Handler werden nur Zeitstempel und Lage gemerkt und die
Klasse gesetzt (kein Layout-Lesen, kein `getBoundingClientRect`, kein `offsetY`; `y` aus `clientY` und der Lage der Fläche, die beim
Einblenden und über `ResizeObserver` gemerkt wird). Kein
Auswahl-Menü, kein Doppeltipp-Zoom (`user-select: none`, `-webkit-touch-callout: none`).

##### 7.3 Rückmeldung: Licht und (vielleicht) Haptik
- **Licht (Kern, die verlässliche Rückmeldung):** sofort beim Aufsetzen (CSS-Klasse, kein Layout), aus beim Loslassen des letzten Fingers.
- **Haptik – Fakten:** `haptic()` löst den Tick per **Klick aus dem Code** aus. Laut Bibliotheks-Doku wirkt das nur auf iOS 17.4 bis 26.4
  und wurde mit iOS 26.5 abgestellt; die Bibliothek nutzt seitdem ein durchsichtiges Label, das den **echten** Fingertipp weiterreicht [W3].
  Das ist keine Aussage von Apple, aber G9 (§7.9, [W7] dort) kommt zum selben Schluss. Ein echter Tipp auf ein Label löst erst beim
  **Loslassen** aus (`click`), und ein Tick beim Loslassen wäre missverständlich (ausgeschlossen). Dazu kommt: iOS spielt in der Grundeinstellung
  während einer Aufnahme keine App-Haptik und keine System-Töne, außer die App erlaubt es ausdrücklich [W7]. Ob WebKit das bei laufendem
  Mikrofon erlaubt, ist unbekannt, und die Fläche gibt es nur bei 🎤 an. **Ein Tick beim Tippen ist auf Xanders iPhone also sehr
  wahrscheinlich nicht zu spüren.**
- **Erster Schritt von I4a: Geräte-Probe (I4-61).** Eine kleine Probe-Seite in der Werkstatt (nicht in der App) mit großen Knöpfen:
  (1) Tick per Code-Klick beim Aufsetzen (`pointerdown`, wie `haptic()`), (2) Tick per echtem Tipp auf ein Label; jeweils mit Mikrofon aus und
  an (`getUserMedia`, laufender Kontext, `audioSession.type = 'play-and-record'` wie 🎤). Die Seite zeigt die iOS-Version. Xander meldet
  4 × ja/nein. Das Ergebnis geht auch an G9 (G9-61).
- **Haptik je Tipp (F4) wird nur gebaut, wenn (1) mit Mikrofon an fühlbar ist und Xander ihn will.** Dann gilt: `haptic('tick')` beim
  Aufsetzen, wenn `UI.haptics` an ist; M-HAPTIK (§11) prüft, ob der Stoß im eingebauten Mikro landet. Ist er > −55 dBFS oder erzeugt er
  stimmhafte Frames, gibt es auf dem Lautsprecher-Weg während der Tippfläche keine Haptik. Ohne positive Probe wird nichts davon gebaut.

##### 7.4 Ergebnis-Blatt (`vsResPaint`)
- **Kern [V, F1]:** Die Zeile `.fs-end` wird zur Zählzeile erweitert, nur Text: „12 Noten · aus 12 Tipps · Finger 14 ms nach der Stimme –
  ausgeglichen · Stimmung passt · C-Dur eingerastet“. Bei Bedarf kommen dazu: „2 Tipps ohne Ton – Höhe vom Ton davor“, „1 Stelle ohne Tipp“,
  „1 Tipp mit 2 Tönen“. Ohne Tipps: „keine Tipps – aus der Stimme“.
- **Extra c [E]:** Zeile „Rhythmus [Tipps] [Stimme]“ (nur wenn Tipps da waren). Sie wechselt zwischen Tipp-Noten und VS2-Noten derselben Analyse
  (`vsResSet({rh})`, kein neuer Undo-Schritt); Oktave, Einrasten und Raster wirken in beiden.
- **Extra d [E]:** Knöpfe **[Weglassen]** hinter „Tipps ohne Ton“ und **[Dazunehmen]** hinter „Stelle ohne Tipp“, ≥ 44 × 44 px; ein zweites
  Antippen nimmt die Wahl zurück. **Eigene Aktionen** `data-a="tOhne"` und `data-a="tDazu"`, Felder `VS.res.tip.omit`/`.add`. Der Name
  `drop` ist **verboten**, denn er heißt dort schon „Verwerfen“ (→ `vsResDrop` → `undo()`). Mini-Rolle: Tipp-Noten ohne Ton als Umriss.
- Das Blatt bleibt in allen Formaten im Bild (`fangPlace`/`popFit`); wird es im Querformat höher als der Platz, rollt sein Inhalt per Finger.

##### 7.5 Messblatt „Tippen messen“
- **Kern (unsichtbar):** Der Prüf-Link `…/#tippmessung` öffnet das Messblatt (wie `#import`/`#mitmachen`: Hash lesen, dann entfernen). In der
  App führt kein Knopf dorthin. Voraussetzung: 🎤 an, Lautsprecher-Weg eingemessen, sonst steht im Blatt der Grund. Ablauf: Musik aus, Satz
  „Leise sein und 10× kräftig mit der Fingerkuppe auf das Feld tippen“, Tipp-Feld ≥ 300 × 120 px mit sichtbarer Mitte (oben/unten). Je Tipp
  werden beide Zeitstempel (`pointerdown`, `touchstart`) und die Hälfte gemerkt. Knöpfe: **[Messen]**, **[Messen mit Last]** (M-LAST, §11).
  Ergebnis-Tabelle je Quelle, Hälfte und Lauf: k-Median, Streuung, „9 von 10 gehört“; dazu Ausrichtung, Anzeige-Art
  (`matchMedia('(display-mode: standalone)')`), iOS-Version. **[Übernehmen]** speichert `tipp.speaker.mess` (nur bei ≥ 6 gehört und Streuung
  ≤ 10 ms) und `tipp.src` (die Quelle, die I4-60b besteht). **[Kopieren]** legt die Tabelle als Text in die Zwischenablage (für den Funk).
  < 6 gehört: „Tipp-Geräusch nicht gehört – kräftiger tippen“, nichts gespeichert.
- **Extra b [E]:** Dasselbe Blatt als Zeile „Tippen“ mit [Messen] im Mikro-Check (`micBuild`/`micRender`); grau mit Grund außerhalb des
  Lautsprecher-Wegs oder ohne Einmessen.

##### 7.6 Hilfe
Im vorhandenen Hilfe-Abschnitt zur Stimme zwei Sätze: „Rhythmus: Tippen – beim Singen einmal pro Ton auf die Fläche tippen. Die Töne kommen
aus der Stimme, Anfang und Ende aus dem Finger. Zwei Finger abwechselnd gehen für schnelle Läufe; weich tippen, sonst hört das Mikro das
Klopfen mit.“

##### 7.7 Test-API (nur Tests)
`SYNQUENZER.tipFeed([{c0, c1}] | [{b0, b1}])`: Tipps ohne DOM in den Ring, als Kontext-Sekunden der Berührung (wie `ctxOf(P)`, die App zieht
`AU.outLat` und k ab) oder als gehörte Schläge (ohne k, für reine Noten-Tests). `tipInfo()` → `{on, shown, mode, n, ring, k, tau, dOut, how,
src, bridge: {o, n, bad, mode}, pool: {route: [n, takes, mad]}, cut, last: {n, f, fHow, noTone, two, open, ms}}`. `tipSet({rh, k, zu})`,
`tipCal({thumps, load})` (Messblatt mit eingespeisten Geräuschen), `tipNotes(A, taps, o)` (der DSP-Kern, wie `VSD.tapNotes`),
`tipSpy()` (zählt `tipAlign`, `tipLearn`, `haptic`, `vsResDrop`).

---

#### 8. Zusammenspiel mit vorhandenen und kommenden Paketen (im Code geprüft)

| Stelle | Änderung durch I4 |
|---|---|
| `vsDspMake()` (VSDSP-Block) | + `tapNotes`; `pyin`, `segment`, `fft`, `median`, `midiOf` unverändert. |
| `vsAnalyse(ta, tb, cfg)` | + `A.secOfH`, + `A.tips` aus `TIP.ring`, + `tipAlign(A)` (einmal). |
| `vsNotesOf(A, o)` | mit `A.tips` (und `o.rh !== 'stimme'`) → Tipp-Noten in derselben Form, sonst unverändert (§6.7). |
| `vsFangDone` / `vsRecDone` | + `tipLearn(A)` genau einmal bei `res.count > 0`; sonst unverändert (die Tipp-Noten kommen über `vsNotesOf`). |
| `g3RecStart`, `g3PreNotes`, `g3ApplyPre` | **keine Code-Änderung**; sie bekommen die Tipp-Noten über `vsNotesOf` (Anfangstakt, Auftakt → `clip.pre`). Geprüft in I4-31/I4-33. |
| `vsApply(res)` | reicht `res.rh` (Extra c) und `res.tip.omit/add` (Extra d) an `vsNotesOf`; G3 wie heute. |
| `vsFang(o)` | FANG-Bereich `from` (§6.7). |
| `fangMode()` | nur Extra f: ein Tipp in den letzten 8 s zählt wie Gesang. |
| `vsResSheet` / `vsResPaint` / `vsRollPaint` / `vsResSet` | Zählzeile (Kern); Extras c/d mit Aktionen `tOhne`/`tDazu`, nie `drop` (§7.4). |
| `stSheetFill` / `bindStSheet` / `stProf` / `vsCfg` / `vsCfgSet` | §7.1, §4.1 (`rh`, eigener Schlüssel `tipp`); `stCalEnd` und Weg-Hinweis unverändert. |
| `tick()` | ein Paar für die Uhren-Brücke (eine Subtraktion). |
| `mkWheelFrame()` | `want` zusätzlich nur bei `kbFieldMode() === 'tasten'` (§7.2). |
| `haptic` / `UI.haptics` | im Kern nicht benutzt; nur mit F4 nach positiver Probe. |
| `tkMakeTake` / `g8MakeTake` + `tkExt().take` | nur Extra e: Tipps des Take-Bereichs → `take.tp` (Take-Sekunde = gehörte Sekunde − F0/sr, §4.2). |
| G5 `g5Analyse` / `g5Scene` / `g5Song` | nur Extra e: `A.tips` aus `tp` ohne Zeitkarte, kein `tipAlign`, kein `tipLearn`; Noten über `A.beatOf` (mit Zeitkarte). |
| VS-L `vsCfg().mel === false` | keine Tippfläche, keine Tipps. |
| G2 / G6 / G7 (`helfer-G267`) | unverändert. Hinweis: In `helfer-G267` analysiert `vsRecEnd` ab `r.start − 0,5` (ohne G3); I4 baut auf der zusammengeführten Fassung mit G3. |
| G4 / VS-P / VS4 Säubern | unverändert (Tipps sind keine Audio-Bearbeitung). |
| **I1** Super-Regler-Feld (`#kbArea`) | gemeinsame Regel `kbFieldMode()`/`kbFieldApply()` (§7.2). **I1 muss sie wortgleich übernehmen**; in I1 §8 steht heute für I4 „kein Eingriff“. |
| I2 Anschlag-Werkzeug, I3 Mal-LFO | kein Berührungspunkt. |
| G9 Songtext | Silben aus der Analyse (G9). Mit Extra e liefert I4 `tipTakeTaps(id)` → `[[d, u]]` in Take-Sekunden. Haptik-Befund (I4-61 ↔ G9-61) wird geteilt. |
| T1 Taktarten | I4 nutzt nur `grid().beatsPerBar`; vorhandene ×4 in `vsPhrase`/`g3PreNotes` stellt T1 um. |
| MK7 Vocoder-Mikro (`micTapGet`), MK-P | Mikro-Teilung unverändert; das MS-2000-Blatt deckt die Fläche ab (`mkcov`). |
| Video VV1–VV3, K1, North, Bit Mask | kein Berührungspunkt (Noten sind gewöhnliche Noten). |

**Zusammenführungs-Hinweis:** `vsFangDone`, `vsRecDone`, `vsApply`, `vsResPaint` sind schon von VS-L, G3, G5 und G8 geändert. I4 baut darum
auf der **Hauptlinie nach Zusammenführung von Nachtrag 4/5** (VS-L, VS-P, G1–G8), nicht auf 4.23.0.

---

#### 9. Unterpakete, Zweige, Dauer, Budget

**Ausgangsstand:** Hauptlinie mit VS-L, VS-P, G1–G8 (der Dirigent führt zusammen). **Zweige (Regel 29):** **A** `i4-br-T` (Zeit + Fläche):
I4a → I4b · **B** `i4-br-N` (Noten): I4c gegen `tipFeed` und den Node-Korpus, ohne DOM. Zusammenführung A + B → I4e. Extras nach Xanders Ja
im Zweig **C** `i4-br-X` (I4x, I4d). Jede Stufe mit Changelog, Snapshot und „Bitte prüfen“-Liste (Regel 22).

| Paket | Inhalt | Dauer | Budget |
|---|---|---|---|
| **I4a** | **zuerst** Haptik-Probe-Seite (I4-61, wartet nicht auf die Antwort); Tippfläche P/L, `kbFieldMode`/`kbFieldApply`, Räder aus, Zeiger + Touch-Zeitstempel, mehrere Finger, Prellen, `TIP.ring`, Mikro-Blatt-Zeile, Profil `rh` + Lader `tipp`, Hilfe, `tipFeed`/`tipSet`/`tipInfo` | 4–5 h | +6 KB |
| **I4b** | Uhren-Brücke (Neustart, Grenze 2 s), gehörte Zeit, k = τ + Δout, Pool-Lernen, Feinabgleich, Messblatt `#tippmessung` (beide Quellen, Hälften, M-LAST, Übernehmen, Kopieren), `tipCal` | 4,5–5,5 h | +6 KB |
| **I4c** | `tapNotes`, `secOfH`, `A.tips` in `vsAnalyse`, eine Notenquelle (alle Aufrufer, G3-Auftakt), FANG-Bereich, Zählzeile, `tipAlign`/`tipLearn`, Korpus-Läufe A/B/C mit und ohne Klopfen | 5,5–6,5 h | +7 KB |
| **I4e** | Zusammenführen, Regel-28-Prüfung, Regression VS2/G3/G5/VS-L, Formate, Fach-Prüfung, iPhone-Werte, „Bitte prüfen“ | 2–3 h | – |
| **Kern** | | **≈ 16–20 h** | **≈ +19 KB** |
| I4x [E] | a Tipp-Spur 1–1,5 h · b Mikro-Check-Zeile 0,5–1 h · c Rhythmus-Umschalter 0,5–1 h · d Weglassen/Dazunehmen 1–1,5 h · f `fangMode` 0,25 h · F4 Haptik + M-HAPTIK 1 h (nur nach positiver Probe) | 4,5–6,5 h | +5 KB |
| I4d [E] | Extra e: `take.tp` (Normalisieren, Kopien, P1, Grenze), Song-Take (G8-Zeit), Fläche bei ● SONG, G5 mit Tipps, `tipTakeTaps` | 2,5–3,5 h | +3 KB |
| **Alles** | | **≈ 23–30 h** | **≈ +27 KB** |

Mit zwei Zweigen braucht der Kern ≈ 10–12 h Kalenderzeit. Der Vorschlag nannte ≈ 14 h. Mehr ist es, weil die Verzögerung je Weg gelernt und
gemessen werden muss (sonst liegen die Noten auf dem iPhone daneben), weil die iPhone-Zeit unter Last geprüft wird und weil das Tastatur-Feld
eine gemeinsame Regel mit I1 bekommt.

---

#### 10. Abnahme

Alle Punkte mit echten Läufen. Chromium-Tests mit Mikro-Attrappe (wie VS2/VS3), Berührungen über CDP `Input.dispatchTouchEvent`.
Zufall nur mit **festen Seeds** (Lauf r, Stück/Fall i → `seed = 1000·r + i`); die Seeds stehen im Changelog. Tipp-Streuung, wo nicht
anders angegeben: Normal σ 15 ms, gekappt auf ±40 ms; zwei Tipps nie näher als 50 ms (sonst neu ziehen).

**I4a — Fläche und Erfassung**
- [ ] **I4-61** (erster Schritt, iPhone) Haptik-Probe (M-PROBE): iOS-Version; Tick per Code beim Aufsetzen mit 🎤 aus / an; Tick per echtem
  Tipp mit 🎤 aus / an → 4 × ja/nein im Changelog und an G9. Entscheidet, ob F4 überhaupt angeboten wird.
- [ ] **I4-01** Mehrere Finger: zwei Finger abwechselnd, 16tel bei 150 BPM, 8 Takte (128 Tipps, Überlappung 0–30 ms) → 128 Einträge,
  Ende = min(Loslassen, nächster Beginn); ein zweites Aufsetzen 10–29 ms nach dem vorigen wird verworfen, eines nach 31 ms nicht;
  `pointercancel` beendet den Tipp mit seinem Zeitstempel; je Tipp liegen beide Zeitstempel vor.
- [ ] **I4-02** Feld-Regel (`kbFieldMode`): Fläche genau bei 🎤 an + „Tippen“ + Melodieerkennung An + keine Song-Aufnahme. [⌨] → Super-Regler
  (wenn `uiPrefs.kbField = 'sr'`) bzw. Tastatur, bis 🎤 neu an. 🎤 aus → zurück. Neuladen mit „Tippen“ und SR-Vorliebe → Super-Regler,
  dann 🎤 an → Fläche. Menü „Super-Regler“ bei sichtbarer Fläche → Super-Regler (SR-Fälle nur, wenn I1 schon auf der Linie ist; sonst mit
  gesetztem `uiPrefs.kbField` gegen die Regel geprüft). VS-L „Aus“ → keine Fläche. Song-Aufnahme → keine Fläche
  (Kern). **AM-Spur gewählt:** Fläche volle Breite, Räder weg; danach Räder wieder da, Rad-Werte unverändert. MS-2000-Blatt offen → kein
  Tipp gezählt. In jedem Fall: genau ein Feld sichtbar, keine Konsolen-Fehler.
- [ ] **I4-03** M-PLATZ in 428 × 926, 390 × 844, 375 × 667, 320 × 568 (hoch) und 926 × 428, 844 × 390, 667 × 375 (quer), je ohne und mit
  offenem Blatt und je mit Lead- und AM-Spur: Fläche ≥ 300 × 120 px (hoch) bzw. ≥ 540 × 105 px (quer); mit offenem Blatt ≥ 300 × 90 bzw.
  ≥ 540 × 90 px; [⌨] ≥ 44 × 44. Texte nicht abgeschnitten (`scrollWidth ≤ clientWidth`, echte Schrift), Höhe `#kbArea` ± 0 px beim Umschalten,
  keine Seiten-Bewegung oder Zoom bei 20 schnellen Tipps und Doppeltipp, kein Auswahl-Menü bei 1 s Halten.
- [ ] **I4-04** Leistung: `pointerdown`-Handler Median ≤ 0,5 ms, Maximum ≤ 2 ms (Chromium, 4× CPU-Drossel), kein „Layout“ im Handler
  (Performance-Mitschnitt); M-CPU des Worklets ± 1 % gegen ohne Fläche.
- [ ] **I4-06** `vs.rh` und `tipp` nur im Geräte-Profil (Projekt-JSON unverändert), überleben Neuladen; ungültige `tipp`-Daten (Text statt
  Zahl, unbekannter Weg, 30 Aufnahmen) → bereinigt bzw. weggelassen, kein Fehler. Mikro-Blatt-Zeile ≥ 44 px, grau mit Satz bei
  Melodieerkennung Aus.

**I4b — Zeit**
- [ ] **I4-10** Uhren-Brücke (M-UHR, Chromium): 200 Tipps, Haupt-Faden zufällig 0/20/40 ms blockiert → |`ctxOf(e.timeStamp)` − Referenz|
  ≤ 2 ms (P95), ≤ 4 ms (Max); Unterschied der Fehler zwischen 0 und 40 ms Blockade ≤ 1 ms. Zum Vergleich protokolliert: Fehler des heutigen
  Wegs (`currentTime` beim Abarbeiten), erwartet bis 40 ms.
- [ ] **I4-11** Gehörte Zeit: 120 BPM, Tipps per CDP genau auf die gehörten Schläge (`AU.outLat` bekannt), `tipSet({k: 0})` → Schläge
  ganzzahlig ± 2 ms; k = 30 → alle −30 ± 2 ms.
- [ ] **I4-12** Feinabgleich (M-FEIN, 20 Seeds je Fall): 16 Noten mit klaren Einsätzen (alle `'einsatz'`, Abstand 500 ms), Tipp-Versatz
  +60 / −40 / 0 ms → RMS(f − Vorgabe) ≤ 7 ms, kein Seed > 15 ms. 4 Paare → f = 0 „zu wenig“. Feste Δ abwechselnd −45/+45 ms (MAD 45)
  → f = 0. +120 ms → f = +80 „begrenzt“ in allen Seeds. Alles noch einmal **mit Klopfgeräusch** (M-KLOPF) → dieselben Grenzen.
- [ ] **I4-13** Lernen: drei Aufnahmen mit je 6 klaren Paaren, wahre Verzögerung = k₀ + 20 ms (Streuung σ 5) → `tipInfo().how` = „gelernt“,
  k = k₀ + 20 ± 3 ms; anderer Weg unverändert; nur `localStorage`, nichts im Projekt.
- [ ] **I4-13b** Profil-Sicherheit: Pool und Messung vorhanden → volles Einmessen (`stCal('voll')`), kurzes Einmessen, Neuladen → `tipp`
  deep-equal zu vorher, `prof[route]` enthält kein I4-Feld. Lernen auf einem nie eingemessenen Weg (`bt`) → `prof.bt` fehlt weiter, der
  Weg-Hinweis zeigt „noch nicht eingemessen“ mit [Einmessen].
- [ ] **I4-14** Messblatt (M-TIPP mit eingespeisten Klopfgeräuschen, 2-ms-Stoß 2–6 kHz, −30 dBFS, bekannte Versätze 20/35/50 ms) → τ auf
  ±2 ms, Streuung angezeigt; 5 von 10 hörbar → „nicht gehört“, nichts gespeichert; Kopfhörer-Weg oder nicht eingemessen → Grund statt
  [Messen]; [Kopieren] liefert die Tabelle als Text.
- [ ] **I4-15** Lernen bei gebundenem Summen (M-FEIN-L, 20 Seeds): wahre Verzögerung 70 ms, Start „geschätzt“; 5 FANGs nacheinander mit je
  einer 4-Takt-Phrase aus 8 gebunden gesummten Tönen (geprüft: je Phrase ≤ 2 `'einsatz'`) → f bleibt in jedem FANG 0 („zu wenig“),
  „gelernt“ spätestens nach dem 4. FANG, nach dem 5.: RMS(k − 70) ≤ 8 ms, kein Seed > 20 ms. Mit Klopfgeräusch dieselben Grenzen.
- [ ] **I4-16** Startwert je Weg: Attrappe `outputLatency` 0,180 s, `baseLatency` 0,010 s (Bluetooth) → `devLat` 0,1 s, Δout = 90 ms, k = τ + 90;
  ohne `outputLatency` → Δout = 0; Kabel-Weg ohne eigenen Pool → τ „vom Lautsprecher“ + eigenes Δout.
- [ ] **I4-17** Brücke robust: Seite verborgen → sichtbar → Ring neu; Zeitstempel 1,5 s alt (blockierter Haupt-Faden) → benutzt; 3 s alt oder
  in der Zukunft → Abarbeitungszeit, `bridge.bad` gezählt; 3 schlechte von 10 → `bridge.mode = 'abarbeiten'`.

**I4c — Noten**
- [ ] **I4-20** Korpus (M-TKORPUS, alle Stücke des VS2-Korpus mit Noten-Bezeichnung, feste Seeds):
  **Lauf A** (saubere Tipps: je Note genau ein Tipp, Streuung wie oben, kein Versatz) → Einsatz-F (±50 ms) über den Korpus ≥ 0,99; Tonhöhe
  exakt (Halbton nach Einrasten) bei ≥ 97 % der Noten; Note-F je Stück ≥ VS2-Wert desselben Stücks − 0,01 und im Korpus-Mittel ≥ VS2-Mittel
  (Tabelle im Changelog).
  **Lauf B** (Fehltipps: 3 % fehlend, 3 % zusätzlich, Zusatz-Tipps ≥ 60 ms innerhalb gesungener Noten) → Notenzahl je Stück **genau**
  Bezeichnung − fehlend + zusätzlich; jede Zusatz-Note hat die Höhe der umgebenden Note; jede fehlende Note ≥ 120 ms, die VS2 dort als eigene
  Note findet, steht unter „ohne Tipp“, und dort steht nichts, das nicht zu einer fehlenden Note gehört.
  **Lauf C** (Versatz +40 ms) → auf jedem Stück mit „abgeglichen“: |Median(Noten-Beginn − Bezeichnung)| ≤ 5 ms + |Median-Einsatzfehler von
  VS2 auf diesem Stück|, jede Note ≤ 45 ms (3σ); Stücke mit < 5 Paaren: „zu wenig“, f = 0 (Anzahl im Changelog).
  Läufe A und C noch einmal **mit Klopfgeräusch** (M-KLOPF) → dieselben Grenzen (das Klopfen darf f nicht zu 0 ziehen).
- [ ] **I4-21** Schneller Lauf (M-LAUF): legato gesungene 16tel bei 140 BPM, 16 Töne auf und ab, Anschleifen ≤ 40 ms, mit Klopfgeräusch →
  16/16 Noten, alle Höhen richtig; VS2 auf derselben Aufnahme im Changelog daneben.
- [ ] **I4-22** Tonwiederholung: ein gehaltenes „aaa“ auf einer Höhe mit 4 Tipps → 4 Noten gleicher Höhe, je Ende = nächster Beginn (VS2: 1 Note).
- [ ] **I4-23** Vibrato: 2-s-Ton ±120 ct bei 6 Hz, 1 Tipp → 1 Note, gemessene Höhe ±20 ct der Mitte, richtiger Halbton.
- [ ] **I4-24** Tipp ohne Ton: ein geflüstertes „t“ unter einem Tipp zwischen gesungenen Tönen → Note mit Höhe und Anschlag des vorigen Tons;
  Zählzeile „1 Tipp ohne Ton – Höhe vom Ton davor“; Undo des Ergebnisses = Zustand davor (deep-equal). Schneller Lauf mit schwachem Kern:
  Die Höhe kommt nie von der Nachbar-Note (Rückfall nur innerhalb des Tipps).
- [ ] **I4-25** Stimme ohne Tipp: 400-ms-Ton ohne Tipp → nicht im Clip, Zählzeile „1 Stelle ohne Tipp“.
- [ ] **I4-26** Zwei Töne in einem Tipp: C 300 ms, dann E 150 ms unter einem Tipp → eine Note C, „1 Tipp mit 2 Tönen“.
- [ ] **I4-27** Übersprechen (Lautsprecher-Attrappe, Kopplung −20 dB): Bass der App auf derselben Höhe, kein Gesang unter dem Tipp → „ohne Ton“;
  mit Gesang → Gesangshöhe.
- [ ] **I4-28** Rückfall: keine Tipps → Noten deep-equal zu `vsNotesOf` (Stand vor I4), Zählzeile „keine Tipps – aus der Stimme“;
  `segment`-Ausgabe auf dem ganzen Korpus deep-equal zum Stand vor I4.
- [ ] **I4-30** Stimme-FANG: 4-Takt-Loop, Phrase mit Tipps, FANG → MELODIE-Clip mit derselben Längen-Regel wie heute, Noten = Tipp-Noten;
  Phrasenbeginn aus den Tipps, wenn die Stimme ihn später meldet. G3: Auftakt-Tipps 2 Schläge vor dem Clip → Vorlauf-Noten (`clip.pre`).
- [ ] **I4-31** ● REC → MELODIE mit Tipps (neuer Clip, Länge „auto“): Noten aus den Tipps im REC-Bereich; Anfangstakt aus der ersten
  Tipp-Note (`g3RecStart`), auch wenn die Stimme dort erst später erkannt wird; **ein Auftakt-Tipp im Einzählen** (1 Schlag vor `r.start`, mit
  gesummtem Ton) → Vorlauf-Note in `clip.pre`, genau wie derselbe Auftakt nur gesungen (Vergleichslauf ohne Tipps). Overdub auf belegtem
  Clip wie heute (alte Noten bleiben, kein `clip.pre`).
- [ ] **I4-32** Rechenzeit: `tapNotes` für 64 Takte ≤ 15 ms (Chromium) bzw. ≤ 40 ms (iPhone-Probe); Gesamtzeit FANG ≤ heute + 5 %.
- [ ] **I4-33** Eine Notenquelle: Für dieselbe Analyse liefern `vsFangDone`, `vsApply`, `g3RecStart` und `vsAnalyseRange` dieselben Tipp-Noten
  (deep-equal); mit `o.rh = 'stimme'` deep-equal zu VS2. `secOfH`-Rundlauf ≤ 0,1 ms über 1 000 Zufallszeiten, auch über eine Zeitkarten-Marke.
- [ ] **I4-34** Einmal-Regel (`tipSpy`): `tipAlign` einmal je Analyse, `tipLearn` einmal je FANG/REC (auch nach Oktave, Raster, Einrasten
  im Blatt), kein `tipLearn` bei 0 Noten.

**Extras [E] (nur wenn gebaut)**
- [ ] **I4-70** a Tipp-Spur: ≤ 20 Bilder/s, nur bei sichtbarer Fläche und ▶; Taktlinien nach `grid().beatsPerBar`; Text nicht abgeschnitten;
  I4-03 mit Streifen bestanden.
- [ ] **I4-71** b Mikro-Check-Zeile: ≥ 44 px, grau mit Grund außerhalb des Lautsprecher-Wegs; Ergebnis gleich dem Messblatt.
- [ ] **I4-72** c Rhythmus [Tipps]↔[Stimme]: Ergebnis jeweils deep-equal zur direkten Rechnung; Oktave/Einrasten/Raster in beiden; ein
  Undo-Schritt „Stimme“ für das ganze Ergebnis.
- [ ] **I4-73** d [Weglassen] entfernt genau die Noten ohne Ton, [Dazunehmen] fügt genau die VS2-Note(n) der Stelle ein (deep-equal zu
  `vsNotesOf` dort), je kein neuer Undo-Schritt; zweites Antippen nimmt zurück; **`vsResDrop` wird dabei nie aufgerufen** (`tipSpy`), das
  Ergebnis bleibt bestehen; Aktionen heißen `tOhne`/`tDazu`.
- [ ] **I4-74** e Takes: Nach FANG/REC/● SONG mit Tipps hat `S.takes[id].tp` alle Tipps (Anzahl gleich, Zeiten ±0,1 ms gegen gehörte Zeit −
  F0/sr, bei `tkMakeTake` inkl. G3-Anlauf, bei `g8MakeTake` ab `s.F0`). Speichern → Laden und P1-Datei deep-equal; ungültige `tp` werden
  beim Laden verworfen, ohne den Take zu verlieren; 20 001 Tipps → 20 000 gespeichert, Hinweis einmal, `cut` = 1.
- [ ] **I4-75** e G5 mit Tipps: „In Melodie umwandeln“ auf einem Take mit `tp` → Noten aus den Tipps (Analyse-Sekunde = Take-Sekunde −
  (3·d0 + 2)/sr); nach Quantisieren mit „Audio folgt“ sitzen die Noten auf der gehörten Lage ±2 ms, **auch bei starker Zeitkarte**
  (Marken um ±80 ms verschoben); Tonhöhen gleich wie ohne Zeitkarte (gleiche pYIN-Frames); mit G2-Tonhöhe → gehörte Höhe; kein `tipAlign`,
  kein `tipLearn`.
- [ ] **I4-76** e Song: ● SONG mit 🎤 und Tipps 3 min → Fläche sichtbar, `tp` vollständig (Anfang da, G8), G5 Song-Melodie aus den Tipps an
  derselben Stelle.
- [ ] **I4-77** e Ohne Audio-Speicher (Claude-App): Tipps wirken im Ergebnis-Blatt, kein `tp`, kein Fehler.
- [ ] **I4-78** f FANG wählt „Stimme“ auch, wenn in 8 s nur Tipps kamen (Ton leise); eine Taste danach → wie heute Tasten-FANG.
- [ ] **I4-79** F4 Haptik (nur Code-Weg prüfbar): `UI.haptics` an → genau ein `haptic('tick')` je Aufsetzen (Spion), nie öfter als alle
  30 ms; aus → keiner; Sperre aus M-HAPTIK → keiner; Messblatt → keiner. Fühlbarkeit nur über I4-61/I4-63.

**Gemeinsam**
- [ ] **I4-50** Regel 28: Demo-Projekt und alle Projekte in `synq-snapshots/` → normalisiertes JSON Zeichen für Zeichen gleich, Offline-Render
  bitgleich (M-NULL = −∞), Nachrichten an die Worklets unverändert.
- [ ] **I4-51** Undo/Redo jeder I4-Aktion, „geändert“-Punkt sofort. `historyCheck()` = true, **falls VC2a (`n5-br-H`) bis I4e auf der
  Hauptlinie ist**; sonst Ersatz: nach jedem Undo/Redo normalisiertes Projekt-JSON deep-equal zum Schnappschuss davor bzw. danach
  (`undoInfo()`). Eine Vorgänger-Version öffnet ein Projekt mit `tp` (Extra e) ohne Fehler.
- [ ] **I4-52** 3-min-Lauf mit Fläche, Szenenwechseln, 5× FANG, 2× REC, Weg-Wechsel Lautsprecher ↔ Kabel: keine Konsolen-Fehler, kein
  Aussetzer (M-EINBRUCH), kein hängender Ton.
- [ ] **I4-53** Ergebnis-Blatt mit allen gebauten Zeilen in allen Formaten im Bild bzw. per Finger rollbar, Knöpfe ≥ 44 × 44.

**iPhone (Xander bzw. Dirigent am Gerät, Werte in den Changelog)**
- [ ] **I4-60** M-TIPP am iPhone 12 Pro Max über `#tippmessung` (Lautsprecher-Weg, eingemessen, Ruhe): τ-Median und Streuung je Quelle;
  Streuung ≤ 10 ms, ≥ 6 von 10 gehört.
- [ ] **I4-60b** Zeitstempel unter Last (M-TIPP + M-LAST): je Quelle (`pointerdown`, `touchstart`) |Median(Last) − Median(Ruhe)| ≤ 3 ms
  und Streuung ≤ 10 ms; die bestehende Quelle wird `tipp.src` (beide bestehen → `pointer`). Protokolliert, ohne Grenze: obere gegen untere
  Hälfte, hoch gegen quer, Safari gegen Home-Bildschirm; > 8 ms Unterschied → Vorschlag an Xander (§5.6). Besteht keine Quelle, steht es als
  Risiko im Changelog (der Pool gleicht dann nur den Mittelwert aus).
- [ ] **I4-62** Echte Summ-Aufnahme (Bitte prüfen Nr. 1–3): Xander bestätigt „Noten stimmen, schnelle Töne da“; f, k und Quelle notiert.
- [ ] **I4-63** (nur mit F4) M-HAPTIK am iPhone: Pegel des Taptic-Stoßes im Mikro, stimmhafte Frames, fühlbar beim Aufsetzen mit 🎤 an.

---

#### 11. Messverfahren

Vorhandene Verfahren gelten unverändert: **M-PLATZ**, **M-CPU**, **M-NULL**, **M-EINBRUCH**, **M-KLICK**, VS2-Korpus-Werkzeug (Note-F wie
`mir_eval`, Einsatz-Toleranz ±50 ms). Neu:

| Kürzel | Name | Definition |
|---|---|---|
| **M-UHR** | Uhren-Brücke | Referenz: in einer Kalibrier-Schleife 2 s lang Paare (`performance.now()`, `currentTime`) so dicht wie möglich, obere Hülle → lineare Karte G(P). Fehler je Tipp = `ctxOf(e.timeStamp)` − G(e.timeStamp). Blockade durch eine Rechenschleife von 0/20/40 ms zwischen Senden und Abarbeiten. |
| **M-TIPP** | Tipp-Verzögerung | Musik aus, Metronom aus, Lautsprecher-Weg eingemessen. Mikro voll aufgelöst und um R ausgerichtet (`stRead(a, b, {align: true})`), Hochpass 2 kHz (2. Ordnung), Hülle \|x\| über 1 ms; Grundrauschen = Median der Hülle in 2 s Stille davor. Je Tipp und Quelle im Fenster [h − 150 ms, h + 50 ms] (h = gehörte Zeit ohne k): erstes Sample > 20 dB über Grund, Einsatz = erstes Sample > 50 % der Spitze innerhalb 5 ms. kᵢ = h − Einsatz, τᵢ = kᵢ − Δout; Median, Streuung = IQR/1,35; gültig mit ≥ 6 von 10. Getrennt nach Quelle und Hälfte (oben/unten). |
| **M-LAST** | Haupt-Faden-Last | Während der Messung alle 100 ms eine Rechenschleife von 30 ms (`setInterval`, `performance.now()`-Warten). Gleiche Auswertung wie M-TIPP. |
| **M-KLOPF** | Klopfgeräusch im Test-Signal | Zur echten Aufsetz-Zeit jedes Tipps (also vor k) wird ein Klopfer ins Mikro-Signal gemischt: Pegel und Form aus I4-60, bis dahin 2-ms-Stoß 2–6 kHz bei −30 dBFS plus 10-ms-Dumpf 80–200 Hz bei −36 dBFS. |
| **M-FEIN** | Feinabgleich | Mikro-Attrappe spielt synthetische Summ-Töne (Sägezahn durch 3 Formanten, 110–440 Hz, Einsätze bekannt). Tipps per `tipFeed` mit Versatz und Streuung nach Vorgabe; Fehler = f − Vorgabe. **M-FEIN-L:** dieselben Töne gebunden (Tonwechsel ohne Absetzen, „mmm“), 4-Takt-Phrasen bei 100 BPM, je Phrase ≤ 2 `'einsatz'` (geprüft); Fehler = k − wahre Verzögerung. |
| **M-TKORPUS** | Korpus mit Tipps | Node: VS2-Korpus, `pyin` → `tapNotes` mit Tipps aus der Bezeichnung (Läufe A/B/C nach I4-20, feste Seeds), mit und ohne M-KLOPF; danach dieselbe Auswertung wie VS2; Vergleich je Stück mit `segment`. |
| **M-LAUF** | schwere Fälle | synthetische Läufe (16tel 140 BPM legato), Tonwiederholung, Vibrato ±120 ct/6 Hz, Anschleifen 40/150 ms, Flüster-„t“, Zwei-Ton-Tipp, jeweils mit M-KLOPF; Erwartung je Fall wie I4-21 … I4-26. |
| **M-PROBE** | Haptik-Probe | Werkstatt-Seite (§7.3): vier Knöpfe ≥ 88 × 88 px, Anzeige der iOS-Version; Xander tippt je Knopf 5× und meldet „gespürt ja/nein“. |
| **M-HAPTIK** | Haptik im Mikro (nur F4) | iPhone, Stille, 20 × `haptic('tick')` im Abstand 300 ms (aus Tipps ausgelöst); Mikro-Pegel 50–500 Hz und breitbandig je Stoß (dBFS), pYIN über die Strecke: stimmhafte Frames ±50 ms um jeden Stoß. Grenze: ≤ −55 dBFS und 0 Frames. |

---

#### 12. Risiken

- **Zeitstempel auf iOS** (Bedeutung von `e.timeStamp`, 60-Hz-Bündelung, Rand-Gesten, Fehler nach dem Hintergrund) → zwei Quellen, Brücke
  mit Neustart und 2-s-Grenze, Feinabgleich und Pool an der Stimme, Messung unter Last am Gerät (I4-60b).
- **Wenige klare Einsätze beim gebundenen Summen** → Pool über mehrere Aufnahmen (I4-15); bis dahin Startwert τ + Δout.
- **`outputLatency` fehlt vor iOS 18.4, Bluetooth gekappt** → Δout aus der gemeldeten Latenz, den Rest lernt der Pool je Weg.
- **Haptik:** sehr wahrscheinlich nicht möglich (Code-Klick abgestellt [W3], Aufnahme schaltet Haptik ab [W7]) → Licht als Rückmeldung,
  Probe zuerst (I4-61), F4.
- **Doppel-Aufgabe** Summen + Tippen ist anfangs ungewohnt; manche tippen ungenau → Rückfall ohne Tipps, Raster wie gewohnt; mit Extra c der
  Umschalter auf die Stimme.
- **Klopfgeräusch im Gesangs-Take** (eingebautes Mikro direkt unter der Fläche): Klopfen ist im STIMME-Take hörbar und könnte falsche Einsätze
  erzeugen → in allen Test-Signalen (M-KLOPF); Hilfe-Satz „weich tippen“; Entscheidung F6.
- **Konflikte beim Zusammenführen** (`vsFangDone`, `vsRecDone`, `vsApply`, `vsResPaint` von VS-L/G3/G5/G8 geändert) → Bau auf der
  zusammengeführten Linie; Regression I4-28, I4-30, I4-31.
- **Tastatur-Feld doppelt belegt** (I1) → eine Regel `kbFieldMode()`; **I1 muss sie übernehmen** (offener Punkt für den Dirigenten).
- **Übersprechen** über Lautsprecher: Tipps lösen das nicht; die vorhandene Sperre gilt je Tipp (I4-27).

#### 13. Fragen an Xander (nur echte; ohne Antwort wird die Vorgabe gebaut, bei F7 also nichts)

- **F1 Kern – Ort und Namen [V].** Gebaut wird: Mikro-Blatt → Zeile **„Rhythmus [aus der Stimme] [Tippen]“** (Vorgabe „aus der Stimme“, also
  ändert sich ungefragt nichts). Bei „Tippen“ wird das Tastatur-Feld bei SINGEN zur **Tippfläche** („TIPPEN · einmal pro Ton“, [⌨] schließt
  sie). Im Ergebnis-Blatt steht eine **Zählzeile** („12 Noten · aus 12 Tipps · Finger 14 ms nach der Stimme“). Passen Ort und Namen?
- **F2 Tipp ohne Ton** (du tippst, aber die App hört keinen Ton): **Vorgabe:** Note mit der Höhe des Tons davor, in der Zählzeile genannt.
  Oder lieber gleich weglassen?
- **F3 Notenlänge:** Im Vorschlag stand „so lange der Finger liegt“. Viele tippen aber nur kurz an und singen den Ton länger. **Vorgabe:**
  Finger-Länge. Oder: bis der gesungene Ton endet (höchstens bis zum nächsten Tipp)?
- **F4 Tick beim Tippen:** Auf aktuellen iPhones geht er aus dem Browser sehr wahrscheinlich nicht mehr, schon gar nicht, während das Mikro
  läuft. **Vorgabe:** kein Tick, nur Licht. Wir prüfen es zuerst kurz an deinem iPhone (4 Knöpfe, 2 Minuten). Spürst du den Tick dort mit
  Mikro an – willst du ihn dann beim Tippen?
- **F5 Silben für den Songtext (G9):** Die Silben verteilt G9 aus der Analyse, so wie du es beschrieben hast; Tippen ist dafür nicht nötig.
  **Vorgabe:** I4 liefert G9 nichts. Nur mit Extra e (F7) könnte G9 deine Tipps zusätzlich als Silben-Anfänge nehmen.
- **F6 Klopfgeräusch im Gesang:** Beim Tippen auf das Handy hört das eingebaute Mikro das Klopfen mit. **Vorgabe:** erst messen, nichts
  automatisch entfernen, Hilfe-Satz „weich tippen“. Soll die App die Klopfer später automatisch leiser machen?
- **F7 Extras – jedes einzeln ja/nein (Vorgabe: nein, bis du ja sagst):**
  a) **Tipp-Spur** oben in der Fläche: gerade gesungener Ton und deine Tipps der letzten 2 Takte.
  b) **„Tippen messen“** im Mikro-Check (sonst nur über einen Prüf-Link).
  c) Umschalter **„Rhythmus [Tipps] [Stimme]“** im Ergebnis-Blatt, um zu vergleichen.
  d) Knöpfe **[Weglassen]** (Tipps ohne Ton) und **[Dazunehmen]** (gesungene Stellen ohne Tipp).
  e) **Tippen auch im Song** (● SONG) und bei „In Melodie umwandeln“; die Tipps werden dafür am Take gespeichert.
  f) FANG nimmt die Stimme auch, wenn du fast nur getippt und sehr leise gesummt hast.

#### 14. Bitte prüfen (Xander am iPhone)

0. Vorab (2 Minuten): Haptik-Probe-Seite öffnen, die vier Knöpfe je 5× antippen – wo spürst du einen Tick (Mikro aus / an)?
1. Mikro-Blatt → „Rhythmus: Tippen“, SINGEN an, Loop läuft: eine Melodie summen, je Ton einmal tippen, FANG → stimmen die Noten?
2. Ein schneller Lauf, mit zwei Fingern abwechselnd getippt → sind alle Töne da?
3. Viermal derselbe Ton, gebunden gesungen, viermal getippt → vier Noten?
4. Gebunden gesummt, 5× FANG hintereinander: Sitzen die Noten ab dem 4.–5. Mal besser im Takt (die App hat deine Verzögerung gelernt)?
5. Prüf-Link `#tippmessung`: [Messen] und [Messen mit Last], dann [Kopieren] und die Tabelle in den Funk.
6. Ergebnis-Blatt: Was steht bei „Finger … nach/vor der Stimme“? Ist die Zählzeile verständlich?
7. Querformat: Ist die Fläche groß genug, kommst du gleichzeitig an FANG? Auf einer MS-2000-Spur: Sind die Räder weg, solange die Fläche da ist?
8. Namen: „Rhythmus“, „aus der Stimme“, „Tippen“, „TIPPEN – einmal pro Ton“, „Tipps ohne Ton“, „Stelle ohne Tipp“ – passen sie?

**Fragen-Kurzliste für den Changelog:** F1 Ort/Namen · F2 Tipp ohne Ton · F3 Notenlänge · F4 Tick · F5 Silben/G9 · F6 Klopfgeräusch ·
F7 Extras a–f — jeweils mit der Vorgabe aus §13.

---

#### Quellen (kurz, eigene Worte)

- **[W1] Touch auf dem iPhone:** Der Berührungs-Sensor des iPhone 12 Pro Max tastet mit 120 Hz ab, die Anzeige läuft mit 60 Hz
  ([GSMArena-Test](https://www.google.nl/amp/s/m.gsmarena.com/apple_iphone_12_pro_max-review-2200p3.php)). Apple nannte laut einem
  Entwickler-Forum 2015 höchstens 2 Bilder (≈ 33 ms) Touch-Verzögerung, gemessen wurde teils mehr
  ([Apple Developer Forums](https://developer.apple.com/forums/thread/71301)); ältere iPhones lagen je nach Messart bei 55–85 ms Tipp-bis-Bild
  ([iMore](https://www.imore.com/iphone-5-touchscreen-latency-measured-found-be-25-times-faster-closest-android-device)). → Schätzwert 30 ms;
  der echte Wert wird gemessen bzw. gelernt.
- **[W2] Safari Web Audio:** `getOutputTimestamp()` ab Safari 14.1, `outputLatency` erst ab Safari/iOS 18.4
  ([web.dev](https://web.dev/articles/audio-output-latency), [Kompatibilitäts-Tabelle](https://docs.w3cub.com/dom/audiocontext)); nach iOS 15.1
  lieferte `getOutputTimestamp()` eine viel zu kleine `contextTime` ([Apple Developer Forums](https://developer.apple.com/forums/thread/696356)).
  → Brücke aus `currentTime`, nicht aus `getOutputTimestamp()`; Δout nur, wo `outputLatency` da ist.
- **[W3] Haptik im Browser (Fremdquellen, keine Aussage von Apple):** Die npm-Bibliothek `ios-haptics` schreibt in Version 3.1.1 (26.06.2026),
  der Trick wirke nur auf iOS 17.4 bis 26.4, weil Apple ihn in iOS 26.5 abgestellt habe. Seit 3.0.0 (24.06.2026) und noch in 3.3.0 (25.10.2026)
  legt sie ein durchsichtiges Label über das Element, damit der **echte** Fingertipp den Schalter umlegt. Selbst nachgelesen in den Paketen
  der npm-Registry ([npm](https://www.npmjs.com/package/ios-haptics); dieselbe Datei unter `unpkg.com/ios-haptics@3.1.1/README.md` war von
  hier aus gesperrt). Weitere Hinweise laut Prüfbericht und G9 [W7], von hier aus nicht geöffnet:
  [Haptik-Tester](https://rapidtoolset.com/en/tool/ios-haptics-tester) („Code-Haptik iOS 17.4–26.4“), ein Erfahrungsbericht eines
  Forum-Projekts ([Flarum](https://discuss.flarum.org/d/39406/17)), WebKit-Fehler zur Nutzer-Aktivierung
  ([Bug 285120](https://bugs.webkit.org/show_bug.cgi?id=285120)). Technik erklärt: [Blog](https://azukiazusa.dev/en/blog/ios-safari-web-haptics).
  → Kein Tick per Code; Geräte-Probe (I4-61).
- **[W4] Menschen tippen zu früh:** Beim Mitklopfen zu einem regelmäßigen Takt liegen Tipps im Mittel einige 10 ms vor dem Schlag („negative
  mittlere Asynchronie“), bei Musikern weniger (Repp 2005; Repp & Su 2013,
  [Psychonomic Bulletin & Review](https://link.springer.com/article/10.3758/s13423-012-0371-2)). → Feinabgleich an der Stimme statt
  blindem Vertrauen in die Finger-Uhr.
- **[W5] Tippen zu Sprache:** Tipps sammeln sich an den Einsätzen der Silbenkerne (Vokale), nicht an anderen Merkmalen (Rathcke & Lin 2023,
  Journal of Phonetics 100, [Huddersfield](https://pure.hud.ac.uk/en/publications/an-acoustic-study-of-rhythmic-synchronization-with-natural-englis/);
  ähnlich Janker 1996, [ZAS Papers](https://zaspil.leibniz-zas.de/article/view/743)). → Paare Tipp ↔ Stimm-Einsatz.
- **[W6] Summen → Noten bei anderen:** Systeme, die Melodien aus Summen erkennen, holen die Einsätze aus Pegel und Tonhöhe der Stimme, und genau
  das ist ihre Schwachstelle ([CubyHum, ISMIR 2002](https://archives.ismir.net/ismir2002/paper/000024.pdf),
  [Onset-Ansatz, arXiv 1908.07409](https://arxiv.org/pdf/1908.07409)). Die im Vorschlag genannten Produkte (Summen-zu-MIDI-Apps,
  Tonhöhen-Editoren am Rechner) nehmen den Rhythmus ebenfalls aus der Stimme; eine App, die Klopfen nutzt, macht daraus nur Schlagzeug.
  Tipp-Summen trennt Ton (Stimme) und Rhythmus (Finger) – nach unserem Wissen neu.
- **[W7] Haptik während der Aufnahme (Apple):** `AVAudioSession.allowHapticsAndSystemSoundsDuringRecording` legt fest, ob System-Töne und Haptik
  während einer Aufnahme spielen; die Grundeinstellung ist **aus** (`false`)
  ([Apple Developer Documentation](https://developer.apple.com/documentation/avfaudio/avaudiosession/allowhapticsandsystemsoundsduringrecording),
  selbst nachgelesen). Ob WebKit das bei `getUserMedia` einschaltet, ist nicht dokumentiert. → Probe mit 🎤 an (I4-61).
- **[W8] WebKit-Zeitstempel:** Bekannte Fehler mit versetzten oder negativen Ereignis-Zeitstempeln nach dem Hintergrund
  ([WebKit Bug 185040](https://bugs.webkit.org/show_bug.cgi?id=185040), laut Prüfbericht; von hier aus nicht geöffnet). → Neustart der Brücke
  bei Sichtbarkeit, 2-s-Grenze, Abarbeitungszeit als Rückfall.


*Ende Paket I4.*

---


### B.5 Paket G9 — Songtext aus Gesang

#### Dirigenten-Hinweise zu G9 (gelten vor dem Paket-Text)
1. **Ältere Stände (§5.1, §5.2, G9-51):** Merkmal `'ly'` in Baustein N (A.4). „Vorgänger-Version öffnet ohne Fehler“ gilt für Stände vor
   Baustein N; ein Stand mit Baustein N, aber ohne G9 öffnet gesperrt mit Hinweisband. Der Klartext `lyrics` wird wie geplant mitgeführt.
2. **Haptik (§7.9):** erfüllt A.8; G9-61 = M-PROBE (gebaut in I4a). Ist I4a beim Start von G9c noch nicht da, baut G9c an Tag 1 die ganze
   Probe-Seite nach A.8 H4.
3. **Laden bei Bedarf:** Text-Modus (G9c) und die Haupt-Faden-Teile von G9a kommen in den Block `sq-g9-src` (A.13). `g9NormLy`, die Undo-Art
   `'ly'` und die Marken-Haken bleiben im Start-Pfad. G9-23 (App-Start ± 3 %) bleibt; N8-13 misst alle Pakete zusammen.
4. **Zeitachsen:** A.10 (Take-Sekunde vor der Zeitkarte für `ly`, Vorspielen mit `tkHeardMap`). G9 schreibt nie `take.marks`.
5. **Freigabe F0 und Repo-Größe:** Frage 1 in Teil D (Domains für Modell und Prüfkorpus, ≈ 120 MB Modelldateien auf der Pages-Seite).
   Ohne Freigabe gilt Stopp-Punkt 1 (Text-Werkzeuge ohne [Erkennen]).
6. **Marken:** N8-10 mit den G9-Ausnahmen (A.14).
7. **Basis:** aktuelle Hauptlinie H1 (VS-L, VS-P, G1–G8). `g9Syl`/`g9Align` und G9b-V dürfen vorher DOM-frei im Node-Korpus beginnen.
8. **Fragen:** F0 ist Frage 1, F5 ist Teil von Frage 9; die übrigen gelten mit Vorgabe (D.2), F7 (Testmaterial) als Bitte.

#### Paket-Text G9 (Fassung 2, vollständig)

*SYNQUENZER v3 — Nachtrag 8, Paket G9: Songtext aus Gesang (Worte erkennen, Silben einrasten, korrigieren)*

**Kurz für Xander**
1. Die App erkennt deine gesungenen Worte (Deutsch, Englisch) selbst auf dem iPhone. Dafür lädt sie einmal ein Sprachmodell (≈ 80–100 MB),
   danach braucht sie kein Internet, und dein Gesang bleibt auf dem Gerät.
2. Tippst du auf die Wellenform, spielt der Abschnitt bis zur nächsten Marke und rastet ein. Schreibst du los, hörst du ihn, und ein Wort wie
   „Lie-be“ verteilt sich selbst auf die passenden Abschnitte.
3. Korrigieren: Wort ersetzen, löschen oder einfügen, Text silbenweise verschieben, zwei Silben verschmelzen, alles mit Rückgängig. Klang und
   alte Projekte bleiben, wie sie sind.
4. Ob die Erkennung bei Gesang gut genug ist, messe ich zuerst. Dafür brauche ich einmal eine Freigabe von dir (F0), dazu 8 kurze Fragen,
   jede mit Vorgabe (§13).

---

Status: **Entwurf, Fassung 2** (nach der Prüfung, 31.10. abends). Grundlage ist Xanders Wunsch vom 31.10. ~16:50 UTC, wörtlich in
`fragen-xander-9.md`: „… dass er die Worte erkennt, die ich singe. Ist das möglich, dass ich das nicht einzeln eintragen muss? … pro Silbe …
einschnappt … visuelle Referenz … in der Haptik … die sofort höre, während ich losschreibe … auf die Wellenform klicke … bis zum nächsten
Warp-Marker … die Engine erkennt anhand meines Wortes, wenn es ein zweisilbriges Wort ist, dass diese Silben entsprechend zugeteilt werden zu den
Transienten … laut der Analyse“. Dazu der Zusatz ~17:00 UTC: „ganzen Songtext einfügen → automatisch auf Silben verteilt; … Text silbenweise
verschieben (z. B. 2 Silben nach links) …; immer in einzelnen Silben messen; zwei Silben zusammennehmen/verschmelzen, wenn ein Transient beide
enthält (nachrücken)“. G9 gehört nicht zu den freigegebenen Innovationen 1–4. Es ist ein eigenes Gesangs-Paket nach Nachtrag 5 (G1–G8).

**Was sich gegenüber Fassung 1 ändert (Prüfung):** Bibliothek/Laufzeit-Paarung neu (§4.4), Bezug von Modell und Prüfkorpus als Schritt 0
(§4.6, F0), Mess-Spike vor dem Einbau (§9), eigene Spracherkennung, Vorwissen gestrichen (§6.6), verbundene Stimm-Strecken in 30-s-Fenstern,
[Stopp] = Worker beenden, Erkennung hält bei jeder Aufnahme an. Außerdem: Haptik-Label nach dem Muster der zitierten Bibliothek mit
Fokus-Rückgabe (§7.9), überzählige Silben gehen nie verloren (`o`), „Wort löschen“ und „Wort einfügen“, kein Rat mehr zu neuen Marken
(F8), Verschieben in Silben-Plätzen, eigener kleiner Undo-Typ `'ly'`, Quer-Dock für ≈ 120 px, Vorspielen mit der Karte des gelieferten Puffers,
Neu-Einrasten nach Säubern, synthetische Tipp-Daten, Gerätepunkte ohne Mac.

Quellen im Projekt: `fragen-xander-9.md` (31.10.), Nachtrag 2 Teil C.5 und Tabelle C.3 (VS5a Marken, VS5b Dehnen & Songtext), `r7/stimme.md`
§10 und N7V-30, `CHANGES-V3.md` (VS5b-Abschnitt), Nachtrag 5 (G1–G8), `n8/I4.md` (F5: Tipps als Silbenanfänge, I4-61 Haptik-Probe),
`n8/I2.md` §7 (◀ ▶ eigenständig), `typische-fehler.md`.
Code geprüft: 4.23.0 `vs-base-B.html`, `stage-ges/index.html` (4.23.0 + G3/G4/G5/G8), `helfer-G267.html` (G1/G2/G6/G7, 4.25.0).
Fremdpakete selbst geprüft (npm-Registry): Bibliothek 4.3.2, Laufzeit 1.31.0-dev.20260914-8d85527a0, Haptik-Bibliothek 3.3.0, Silben-Muster 6.1.0.

**Kennzeichen:** **[A]** Annahme dieser Spec (der Builder baut genau das) · **[V]** sichtbare Neuerung, steht in §13/§14 zur Prüfung ·
**[X]** Entscheidung von Xander · **[W]** Fakt aus Recherche oder Paket-Prüfung (§Quellen) · **[S]** Schätzung, wird in G9b gemessen.

**Regeln, die hier besonders gelten** (`typische-fehler.md`, CLAUDE.md):
- **3 / 27** Nur bauen, was hier steht. Den Ablauf hat Xander selbst beschrieben. Anordnung, Namen und Farben der neuen Teile sind trotzdem [V]
  und stehen in §13/§14. **Nicht** gebaut: Betonungs-Prüfung „Text auf Noten“, Sprech-Spur, Songtext in Song-Ansicht, Noten-Editor oder Video
  (F6), Server-Erkennung, Vorwissen aus anderen Takes, Text-Trennpunkt ohne Marke (F8).
- **28** Alte Projekte bleiben **Zeichen für Zeichen** gleich und klingen gleich. G9 ändert keine Klangerzeugung, keinen Effekt, keine Marke und
  keine Zeitkarte. Songtext ist reine Beschriftung: Renders (Zeitkarte, Dehnen, G2/G7-Tonhöhe, G4-Effekte inkl. Silben-Dynamik) bleiben
  **bitgleich**, egal was am Text geändert wird (G9-52). G9 rät auch nie dazu, eine Marke zu setzen (§2).
- **4 / 5 / 1** Treffer ≥ 44 × 44 px, nichts abgeschnitten, **kein Layout-Sprung**, auch mit offener Bildschirm-Tastatur, hoch und quer.
- **7 / 8 / 9** Der „geändert“-Punkt erscheint sofort. Eine Aktion ist ein Undo (ein Wort, ein Löschen, ein Einfügen, ein Verschieben, eine
  Erkennung). Speichern → Laden ist deep-equal (neues Take-Feld `ly` in Normalisieren, Kopien, ZIP; Normalisieren verwirft keine Silbe des Nutzers).
- **20** Kein Supabase-Aufruf. Versionen vergibt der Dirigent. `max_app` (heute 4 030 000) muss Xander anheben, falls G9 über 4.30.0 geht.
- **24 (sinngemäß)** Kein Hersteller-, Modell- oder Produktname in Oberfläche, Hilfe, Kommentaren, eigenen Bezeichnern und Testnamen. Im Code heißt
  das Modell neutral „Sprachmodell“ (`SM`), sein Ordner `vendor/g9/sm-base/`. **Ausnahmen, ausdrücklich:** (1) unveränderte Fremddateien unter
  `vendor/g9/` (Bibliothek, Laufzeit, Muster-Module, Modell-Konfiguration und Tokenizer). Sie enthalten zwangsläufig den Namen der
  Modell-Familie (die Bibliothek braucht `model_type` in `config.json`) und Hub-Adressen, und die Builder benennen **nichts darin** um. (2) Die
  Dateinamen im Modell-Ordner, die die Bibliothek fest erwartet (`config.json`, `onnx/encoder_model_quantized.onnx` …). (3) Die Lizenz-Hinweise in
  `vendor/g9/LIZENZEN.txt`. (4) Die Adresse des Ersatz-Servers als Datenzeichenkette (§4.5). Vergleiche mit Produkten stehen nur in dieser Spec.
- **29** Drei Zweige parallel (§9).
- **CLAUDE.md-Vorrang** (schnelle Seite, flüssige Bedienung, stabile Verbindung): **Nichts** von der Erkennung lädt beim App-Start. Die App wächst
  um ≈ 45 KB Code. Erkennung und Ausrichtung rechnen in **Workern**, nie im Haupt-Faden (kein Task > 50 ms). Das Modell kommt nur nach einem Tipp
  auf [Erkennen] und nachdem Xander die Größe bestätigt hat. Jede Aufnahme hat Vorrang vor der Erkennung (§6.6.10). **WebGPU bringt hier wirklich
  etwas** (der Encoder ist der teure Teil, ≈ 3–5× schneller [S]). Es wird genutzt, wo Safari es hat. Für das Zeichnen der Silben-Leiste bringt es
  nichts (Canvas 2D reicht); das sage ich gleich jetzt.

---

#### 0. Befund im Code (was es schon gibt, worauf G9 aufsetzt – nichts davon wird neu gebaut)

| Baustein | Stelle (4.23.0 / stage-ges / helfer-G267) | Bedeutung für G9 |
|---|---|---|
| VS5a-Kern `vsMarksMake()` (`VSM`) | `detectMarks(x, sr)`: Hop 5 ms, Spektralfluss + Energie-Anstieg, Feinlage harter Anschläge (`fine`), Mindestabstand 70 ms, `word` = ≥ 120 ms Stille davor, Ton-Marken bei ≥ 80 ct Sprung (`src: 'pitch'`); Rückgabe `{t, i, conf, src, word, voiced}` | Das sind Xanders „Transienten / Warp-Marker“. Ein **Silben-Abschnitt** reicht von Marke k bis Marke k+1. |
| Marken im Projekt | `wpNormMarks` speichert nur `{t, conf, word?, user?}`. `take.marks` steht erst im Projekt, wenn von Hand geändert oder quantisiert, sonst `WP.det` (erkannt, Cache je Take, `wpDetect`, Worker `wpCall({op:'det'})`). Ändert sich die Säubern-Stärke, erkennt `wpDetect` auf der neuen Quelle neu; bis dahin liefert `wpMarks` `null`. | `src`/`voiced` sind nach dem Normalisieren weg, darum rechnet G9 eigene Merkmale je Marke (§6.1). Erkannte Marken sind nicht gespeichert → Silben brauchen eine Regel zum Neu-Einrasten (§5.1). G9 **schreibt keine Marken** (sonst änderte sich G4, §8). |
| VS5b-Songtext | `take.lyrics` = „Lie-be ist ein Feu-er“ (≤ 400 Zeichen), `wpNormLyr`, `wpSetLyrics` (ein Undo, Art `'takes'`), `wpLyr` → `VSM.assignLyrics(text, nMarks)` = **eine Silbe je Marke von links**, überzählige rot, fehlende „·“. Anzeige in `wpPaint` an der Ziel-Zeit (`VSM.warpTime`). Eingabe-Pop `wpLyrPop` (Kopf-Taste **[Text]** `.wptx`), Test-API `wpLyrics`, `wpLyr`, `wpLyrGeom`; Abnahme N7V-30 | G9 **erweitert** das: Silben hängen künftig an **ihrer** Marke statt „von links abgezählt“, mit Überspringen (Melisma) und Verschmelzen. Projekte nur mit `lyrics` bleiben unverändert und sehen gleich aus (§5.3). |
| Marken-Editor | `wpOpen(r)` (Blatt `#wpSheet`, hoch 350 px unten / P3 292 px, quer 380 px rechts), `wpPaint`, `wpGest` (Tipp leer = Marke setzen, Ziehen > 8 px = verschieben/schwenken, Tipp auf Marke = Blatt), `wpView` mit `WP_ZOOM = [1, 2, 4, 0]` (feinste Stufe 1 Takt, 0 = Ganz), `wpEdit` (ein Undo je Marken-Änderung), `wpMarkAdd/Move/Del`, A/B `WP.ab` | G9 baut den **Text-Modus** in dieses Blatt (wie G2 `#wpSheet.g2`). Keine neue Zoom-Stufe (§7.2). |
| `wpEdit` | schreibt `take.marks` (friert die erkannten Marken ein) und ruft bei quantisierten Takes `wpRequant` → neue Zeitkarte; danach `haptic('tick')` | Eine neue Marke ist **hörbar** (Quantisierung, G4-Silben-Dynamik). Darum schlägt G9 nie vor, eine Marke zu setzen (§2, F8). |
| Zeitkarte / Dehnen | `take.warp.map` (src → dst, Take-Sekunden), `wpWarp`, `VSM.warpTime`; Fassungs-Cache `wpPlay`: solange die neue Fassung rechnet, liefert es die **vorige** Fassung (`WP.cache`) oder `null` (dann Roh-/Säubern-Take). G1: Marken springen sichtbar aufs Raster (`E.mpos`, `E.anim`, `wpMovedN`) | Silben werden an der **gehörten** Stelle gezeichnet und vorgespielt. Das Vorspielen schneidet mit der Karte des **tatsächlich gelieferten** Puffers (§6.7). |
| Gehörte Fassung | `tkHeard(id, a)` / `tkPlayBuf` = Kette `tkExt().proc` (Zeitkarte `wpProc` → G2 `g2Proc` → G4 `g4Proc` → VS4 Säubern → Roh-Take), Take-Länge bleibt | Das Vorspielen eines Abschnitts ist ein Ausschnitt dieser Fassung. |
| Quelle für Analysen | `wpBase(id)` (Säubern bzw. Roh, ohne Zeitkarte), `wpDetect` erkennt dort | Erkennung und Merkmale rechnen auf **derselben** Quelle wie die Marken. |
| G2 / G7 | `g2PitchMake` (TD-PSOLA, Länge bitgleich), `take.pitch`, `g2Notes(id)`, `g7Shift` | ändern keine Zeiten → der Songtext bleibt, wo er ist. `#wpSheet.g2` und Text-Modus schließen sich aus. |
| G3 | `take.pre {in, sec}` / `take.post {out, sec}`, `g3PreOf(a)`, `g3PostOf(a)`; ein Take beginnt bis 2 Takte vor dem Clip | Auftakt-Silben liegen vor `a.in`. Der Text-Modus zeigt diesen Bereich bearbeitbar. |
| G4 | `g4Marks(id, b)` nimmt `take.marks`, sonst eigene Erkennung am G4-Eingang; `g4MkSig` | Würde G9 Marken ins Projekt schreiben, änderte sich die Silben-Dynamik (Regel 28). G9 schreibt darum keine. |
| G8 | Song-Takes ohne Zeitgrenze (`g8MakeTake`), Clips bis 64 Takte | Erkennung in 30-s-Fenstern, Fortschritt, Stopp (§6.6). |
| I4 (kommt) | Extra e: `take.tp = {x: [[d, u], …]}` (Tipps in Take-Sekunden), `tipTakeTaps(id)`; I4 §5.5/[W5]: Tipps sammeln sich an den **Vokal-Einsätzen** | Hinweis in der Ausrichtung, gemessen am Vokal-Einsatz (§6.3), nur wenn vorhanden und nach G9-55. |
| Mikrofon-Wege | `stStart` (🎤 live: Stimme-FANG, ● REC, ● SONG mit 🎤), `micStart` (Mikro-Check), `micTapGet` (Eingang Mikro der Vocoder-Engine); je `getUserMedia` | Haken „Aufnahme hat Vorrang“ (§6.6.10). |
| Speichern | `saveNow()` (Autosave sofort schreiben) | Vor jeder Erkennung (§6.6.10). |
| Haptik | `hapticInit()` (verstecktes `<input type=checkbox switch>` + `label.click()` aus dem Code), `haptic('tick'|'snap'|'pop')`, ≥ 30 ms Abstand, Schalter `UI.haptics` | Der Code-Klick wirkt laut Bibliotheks-Doku nur bis iOS 26.4 [W7], derselbe Befund wie I4 [W3]. G9 nimmt für echte Tipps ein **Label im Ziel** (§7.9). |
| Tastatur-Lage | `popDock(p)` (setzt Pops per `visualViewport` über die Tastatur), `cloudKb()` | Muster für das Text-Dock (§7.10). |
| Nachladen | `CLOUD.lib = {local: 'vendor/…', cdn: '…', sri}`, Service Worker `sw.js` (Scope `/Synquenzer/`), Worker aus Blob-URL | G9 lädt genauso: erst eigener Server (`vendor/g9/`), dann Ersatz, jede Datei mit Prüfsumme. Ein Blob-Worker braucht **absolute** URLs (§4.4). |
| Undo | `undoPush({kind, before, label})`, `undoState`/`undoApply` je Art; `'takes'` speichert `JSON.stringify(S.takes)` (ganze Takes), `UNDO_MAX = 60`; `wpUndone()` | G9-Textschritte bekommen eine **eigene kleine Art `'ly'`** (nur Text eines Takes, §5.6). Marken-Haken bleiben `'takes'`. |

**Wichtig:** Heute verteilt VS5b den Text stur „eine Silbe je Marke von links“. Jede zusätzliche Marke (z. B. ein Tonwechsel mitten in einer
gehaltenen Silbe) verschiebt den ganzen Rest. Genau das meint Xander mit „wenn die App falsch zuordnet … 2 Silben nach links“. G9 löst das mit
einer Ausrichtung, die Melismen überspringt, verschmolzene Silben zulässt und Silben fest an ihre Marke bindet.

---

#### 1. Ziel

Xander soll den Text seines Gesangs nicht mehr Silbe für Silbe eintippen müssen. Nach der Aufnahme erkennt die App die gesungenen Worte auf dem
iPhone selbst, zerlegt sie in Silben und legt jede Silbe auf die Marke, an der sie im Take beginnt. Hat er den Text schon, fügt er ihn als
Ganzes ein. Was nicht stimmt, korrigiert er direkt an der Wellenform. Ein Tipp spielt den Abschnitt bis zur nächsten Marke vor und markiert ihn.
Beim Losschreiben hört er ihn sofort, und ein Wort mit mehreren Silben verteilt sich von selbst auf die passenden folgenden Abschnitte. Mit
Ersetzen, Löschen, Einfügen, Verschieben, Verschmelzen und Trennen bringt er Text und Marken in Sekunden in Deckung, und jeder Schritt ist
rückgängig zu machen. Der Text bleibt beim Quantisieren, Dehnen, Tonhöhe-Ändern, Transponieren und bei langen Aufnahmen an seiner Silbe. Klang
und alte Projekte bleiben genau, wie sie sind. Nichts lädt, bevor er es will, kein Ton verlässt das Gerät, und eine Aufnahme wird nie von der
Erkennung gestört.

#### 2. Umfang und Nicht-Umfang

**Umfang**
1. **Silbentrennung** Deutsch und Englisch (gesungene Silben, nicht Buchsatz-Trennung). Bindestriche des Nutzers haben Vorrang. Ohne
   geladene Muster gilt eine einfache Vokalkern-Regel (§6.2).
2. **Ausrichtung** Silben → Marken (dynamische Programmierung mit Überspringen und Verschmelzen) für eingefügten, getippten und erkannten Text
   (§6.3, §6.4).
3. **Erkennung auf dem Gerät** (Sprachmodell, nur auf Wunsch geladen, WebGPU oder WASM, Wort-Zeiten, Deutsch/Englisch mit eigener
   Sprach-Erkennung) (§4, §6.6), mit Bezug der Dateien als Schritt 0 (§4.6).
4. **Text-Modus** im Marken-Editor: Silben-Leiste, Tipp = vorspielen + einrasten, Schreiben mit sofortigem Hören, Wort ersetzen, löschen,
   einfügen, Text ab hier verschieben, Verschmelzen/Trennen, Ganzer Text, Erkennen, Tastatur-Dock hoch/quer, Haptik mit Ersatz (§7) [V].
5. **Datenmodell** `take.ly` (additiv, Format 5), Lesen von VS5b `take.lyrics`, Mitführen von `lyrics` als Klartext, Undo-Art `'ly'` (§5).
6. **Zusammenspiel** mit G1/G2/G3/G4/G7/G8, Dehnen, Säubern, I4, Aufnahme-Wegen, Undo, ZIP, Kopien (§8). Test-API, Hilfe-Sätze, Changelog,
   „Bitte prüfen“.

**Nicht im Umfang** (Regel 27; nur auf Xanders Wort)
- Keine **Server-Erkennung** (Kosten, Daten verlassen das Gerät; §4.2) und keine **Web-Speech-Schnittstelle** (§4.1).
- Kein **Vorwissen** aus dem Text anderer Takes. Die Bibliothek nimmt es nicht von selbst an (§4.3). Ein späterer Schritt wäre ein eigener Präfix
  in `decoder_input_ids`; die Bibliothek reicht dessen Länge schon an die Wort-Zeit-Rechnung weiter. Das geht nur auf Wunsch.
- **Keine neuen Marken**, weder automatisch noch als Rat. Fehlt in der Analyse ein Silben-Einsatz, liegen beide Silben **verschmolzen** auf einer
  Marke, so wie Xander es beschrieben hat („wenn ein Transient beide enthält“). G9 empfiehlt nicht, im Marken-Modus eine Marke zu setzen, denn
  eine neue Marke ändert Quantisierung und Silben-Dynamik hörbar (§0 `wpEdit`). Einen reinen **Text-Trennpunkt ohne Marke** gibt es nur nach F8.
- Songtext **nicht** in Song-Ansicht, Noten-Editor (G2), MELODIE-Noten oder Video (F6). Keine Betonungs-/Silben-Prüfung gegen Noten.
- Keine weiteren Sprachen als Deutsch/Englisch (das Modell könnte mehr; nur auf Wunsch).
- Kein Ton-Effekt beim Einrasten (kein Klick-Geräusch). Die hörbare Rückmeldung ist das Vorspielen des Abschnitts.
- Keine Anzeige im Takes-Blatt oder in der STIMME-Zeile (alles Neue liegt im Marken-Editor und im Erkennen-Blatt, §7.1).

---

#### 3. Ablauf aus Xanders Sicht

**Erkennen lassen (einmal einrichten):** Take aufnehmen (Stimme-FANG, ● REC, ● SONG mit 🎤) → Takes-Blatt **[✎ Marken · Quantisieren]** →
Kopf-Taste **[Text]** → Text-Modus. Steht noch kein Text da, tippt er **[Erkennen]**. Das Blatt sagt: „Worte erkennen: lädt einmal ein
Sprachmodell (≈ 80 MB) auf dieses Gerät. Danach ohne Internet. Der Gesang bleibt auf dem Gerät.“ Dann **[Laden und erkennen]**. Der Fortschritt
steht in der Info-Zeile („Erkennen … 40 %“, [Stopp]). Danach stehen die Silben unter der Wellenform; unsichere sind blasser. Ab jetzt erkennt die
App neue Takes von selbst (F1), aber nie, während das Mikrofon läuft.

**Text schon fertig:** Text-Modus → **[Ganzer Text]** → Text einfügen (mit Zeilen) → ✓. Jede Zeile beginnt bevorzugt nach einer Atempause.

**Korrigieren:** Tipp auf die Wellenform → der Abschnitt bis zur nächsten Marke spielt und rastet ein (gelber Rahmen, Tick). Losschreiben →
das Feld über der Tastatur zeigt das Wort, das dort steht (markiert, wird überschrieben), und der Abschnitt spielt. „Liebe“ + Leertaste →
„Lie-be“ liegt auf diesem und dem passenden nächsten Abschnitt, der Rahmen springt weiter, der nächste Abschnitt spielt. Ein Bindestrich geht
zur nächsten Silbe desselben Worts. **◀ ▶** gehen Abschnitt für Abschnitt. Ein **erfundenes Wort** löscht er: antippen, Feld leeren, Leertaste.
Ein **fehlendes Wort** setzt er ein: Abschnitt antippen, Wort tippen, **[+]** statt Leertaste → der Rest rückt nach. Steht der ganze Rest falsch:
**Text ab hier [‹ Silbe] [Silbe ›]**. Zwei Silben in einem Abschnitt: **[Verschmelzen]**; wieder auseinander: **[Trennen]**. Jeder Schritt ist
ein Undo mit Toast [Rückgängig].

**Danach:** Quantisieren (G1), Dehnen, Tonhöhe (G2), Transponieren (G7), Vorlauf (G3). Der Text bleibt an seiner Silbe.

---

#### 4. Technik-Entscheidung: Worte erkennen auf dem iPhone 12 Pro Max (Safari)

##### 4.1 Web-Speech-Schnittstelle (`SpeechRecognition`) – **nein**
- Safari bietet sie als `webkitSpeechRecognition` seit 14.1/14.5 an, aber nur mit **eingeschaltetem Siri-Dienst**. Ob Safari auf dem Gerät oder
  bei Apple rechnet, ist nicht belegt [W1].
- Sie hört **nur das Live-Mikrofon**. Einen gespeicherten Take (Puffer) kann man ihr nicht geben. Die neue Variante `start(MediaStreamTrack)` ist
  ein Vorschlag im Entwurf, bisher nur von Chrome getrieben [W1]. Den Take über den Lautsprecher abspielen und mithören ist unbrauchbar.
- **Keine Wort-Zeiten** (nur Text + Sicherheit); für eine Silben-Ausrichtung ist das zu wenig.
- Sie greift selbst aufs Mikrofon zu und gerät mit dem Mikro-Weg der App (`getUserMedia` + Worklet, VS1) und der iOS-Audio-Sitzung in Konflikt.
- Sie ist für **Sprache** gemacht, nicht für Gesang.
- **Was trotzdem hilft (kein Bau):** Die **Diktier-Taste der Bildschirm-Tastatur** wirkt in jedem Textfeld, also auch im Feld des Text-Modus und
  in [Ganzer Text]. Gesprochener Text landet dort und wird wie getippter verteilt. Ein Satz in der Hilfe (§7.11).

##### 4.2 Erkennung auf einem Server – **nein** (Vorgabe Xander: keine Zusatzkosten)
- Preise 2026 laut Vergleichsseiten: ≈ 0,003 $/min (kleines Modell) bis 0,006 $/min (große Modelle) [W9]. Dazu bräuchte es einen eigenen
  Schlüssel-Dienst (z. B. Edge-Funktion), einen Datenschutz-Hinweis und Netz. Der Gesang würde das Gerät verlassen.
- Bringt bei Gesang nicht automatisch Sicherheit: Selbst die größten offenen Modelle liegen bei ganzen Songs um 36 % Wortfehler [W4].
- → Nicht gebaut. Bleibt nur auf Xanders Wort eine spätere Option.

##### 4.3 Auf dem Gerät: offenes Sprachmodell (Encoder-Decoder, 2022, MIT-Lizenz) über eine ONNX-Laufzeit im Browser

| Größe | Parameter | Download (≈) [W3][S] | Rechenzeit 16 Takte = 32 s Take (≈ 25 s stimmhaft → 1 Fenster), iPhone 12 Pro Max [S] | Eignung |
|---|---|---|---|---|
| klein („tiny“) | 39 M | ≈ 40 MB | WASM ≈ 10–15 s · WebGPU ≈ 4–6 s | schnell, bei Gesang zu ungenau (wird nur gemessen, nicht angeboten) |
| **mittel („base“)** | 74 M | **WASM-Satz ≈ 75–80 MB, WebGPU-Satz ≈ 95 MB** | **WASM ≈ 25–45 s · WebGPU ≈ 8–15 s** | **gewählt** (Kompromiss aus Größe, Zeit, Güte) |
| groß („small“) | 244 M | ≈ 250 MB (8-Bit) / ≈ 150–180 MB (4-Bit) | WASM ≈ 2–3 min · WebGPU ≈ 25–45 s | nur mit WebGPU sinnvoll; nur nach F2 |

Grundlage der Schätzung: gemessene Browser-Zeiten des kleinsten Modells (englisch) im WASM-Weg, ein Kern: 30 s Audio ≈ 9 s, 60 s ≈ 16 s, Modell
≈ 40 MB [W3]. „base“ rechnet ≈ 2,5× so viel; WebGPU ist laut Berichten 3–10× schneller [W3]. **Die Kosten hängen an Fenstern, nicht an
Sekunden:** Die Bibliothek füllt jedes Stück auf 3000 Merkmal-Rahmen = 30 s auf (`_generate_with_seek`) [W2]. Ein Encoder-Durchlauf kostet also
immer so viel wie 30 s, auch für 3 s Gesang. Darum verbindet G9 die Stimm-Strecken zu vollen Fenstern (§6.6.2/3). **Gemessen wird zuerst im
Mess-Spike (G9b-1), dann am Gerät (G9-20/G9-60).**
Die Laufzeit ist **einkernig**: GitHub Pages kann die Kopfzeilen COOP/COEP nicht setzen → keine `SharedArrayBuffer` → keine WASM-Threads [A]. Ein
Service-Worker-Trick, der die Isolation erzwingt, ist **verboten** (er würde Online, Turnstile und die Claude-App-Ansicht stören).

**Güte bei Gesang (ehrlich):** Für Gesang gibt es nur Messungen an ganzen Songs mit Begleitung. Großes Modell: ≈ 36 % Wortfehler (WER) auf dem
Lyrics-Prüfsatz Jam-ALT, der Deutsch-Teil mit Stimm-Trennung 43–65 % [W4]. Bei griechischem Gesang ohne Anpassung: „small“ 92 %, „medium“ 65 %,
„large“ 54 % [W4]. Schon bei **vorgelesenem** Deutsch liegt „base“ deutlich über 15 % WER [S]. Takes in SYNQUENZER sind **Solo-Gesang**
(Begleitung höchstens als Übersprechen) und meist deutlich gesungen. Das ist leichter, aber Zahlen dafür gibt es nicht. Darum: (1) Die Erkennung
ist ein **Entwurf**. (2) Der sicherste Weg ist **Text einfügen + Ausrichtung** (braucht kein Modell). (3) **Messung vor jedem Einbau** als kurzer
Spike (G9b-1, Gate G9-21). Liegt „base“ über der Grenze, gehen die Zahlen an Xander, und die Erkennung wird nicht eingebaut.

**Wort-Zeiten:** Die Bibliothek (4.3.2, Apache-2.0) liefert Wort-Zeiten über die Kreuz-Aufmerksamkeit ausgewählter Decoder-Köpfe
(`alignment_heads`) und Zeit-Verzerrung (DTW) [W2]; Genauigkeit typisch ±0,1–0,3 s [S]. G9 nutzt sie nur als **weichen Anker**. Die genaue Lage
kommt von den Marken (VS5a-Feinlage, ±5 ms).
**Was die Bibliothek nicht kann (im Quelltext geprüft) [W2]:** (a) **keine Sprach-Erkennung.** Ohne Sprache meldet `_retrieve_init_tokens` „No
language specified – defaulting to English“ und nimmt Englisch. G9 erkennt die Sprache darum selbst (§6.6.4). (b) **kein Vorwissen.**
`prompt_ids` ist in der Generierungs-Konfiguration nur deklariert, in `generate()` auskommentiert, ohne Behandlung von `<|startofprev|>`.
Angenommen wird dagegen ein eigener Präfix in `decoder_input_ids`, und dessen Länge geht als `num_input_ids` in die Wort-Zeit-Rechnung. G9 nutzt
das nur für die Sprach-Erkennung (§6.6.4).

##### 4.4 Gewählt [A]
- **Modell:** „base“, mehrsprachig, ein Export **mit Kreuz-Aufmerksamkeits-Ausgabe** (für Wort-Zeiten), feste Revision. **Decoder 8-Bit in beiden
  Wegen** (dieselbe Datei). Encoder 8-Bit im WASM-Weg, fp16 im WebGPU-Weg.
- **Geräte je Modul:** Im WebGPU-Weg rechnet **nur der Encoder** auf der GPU. Der Decoder läuft im WASM-Teil derselben Laufzeit (die Bibliothek
  stellt das Gerät je Modul ein: `device: {encoder_model: 'webgpu', decoder_model_merged: 'wasm'}`, `dtype: {encoder_model: 'fp16',
  decoder_model_merged: 'q8'}`). So kommen die Wort-Zeiten in beiden Wegen aus demselben Decoder; der früher lückenhafte WebGPU-Decoder [W2] wird
  nicht gebraucht. Einen 4-Bit-Decoder auf der GPU gibt es nur, wenn G9b-1 ihn schneller misst **und** seine Wort-Zeiten vollständig sind. Dann ist
  er ein dritter Gewichts-Satz, den [Entfernen] mit erfasst.
- **Bibliothek:** `dist/transformers.min.js` aus 4.3.2 (587 917 B / 170 477 B gz), **in sich geschlossen**. Sie bündelt die JS-Teile der
  ONNX-Laufzeit `1.31.0-dev.20260914-8d85527a0` (das ist die Version, auf die 4.3.2 festgelegt ist, **nicht** 1.31.1) [W2].
  **Nicht** `transformers.web.min.js`: Sie importiert `onnxruntime-web/webgpu` und `onnxruntime-common` als nackte Modul-Namen. Die lösen sich in
  einem (Blob-/Modul-)Worker nicht auf, weil Import-Maps in Workern nicht gelten [W2]. Ein eigener Bündel-Schritt (web.min.js + Laufzeit 1.31.1)
  ist nicht gewählt: Er wäre zusätzliche Bau-Technik mit ungetesteter Paarung.
- **Laufzeit-Binärteile:** genau diese Version aus npm `onnxruntime-web@1.31.0-dev.20260914-8d85527a0` (MIT), selbst gemessen [W2]:

  | Weg | Dateien | Größe | gz -9 |
  |---|---|---|---|
  | WASM | `ort-wasm-simd-threaded.mjs` + `.wasm` | 24 381 B + 14 264 838 B | 9 096 B + 3 667 699 B |
  | WebGPU | `ort-wasm-simd-threaded.asyncify.mjs` + `.wasm` | 53 057 B + 26 861 777 B | 19 248 B + 6 596 873 B |

  Selbst gehostet unter `vendor/g9/rt/`. Ob Pages `.wasm` gepackt ausliefert, misst G9b-2; sonst gilt die ungepackte Größe.
- **Pfade immer ausdrücklich:** `env.backends.onnx.wasm.wasmPaths = {mjs, wasm}` des gewählten Wegs (WASM → schlicht, WebGPU → asyncify), als
  **absolute** URLs bzw. als Blob-URLs aus dem geprüften Cache. Der Worker kommt aus einer Blob-URL, und relative Pfade gehen dort nicht. Ohne
  diese Angabe nähme die Bibliothek auf Safari ≥ 26 die 28-MB-asyncify-Datei von jsDelivr [W2]. Außerdem `env.allowRemoteModels = false`,
  `env.localModelPath` = absolute URL von `vendor/g9/` (bzw. Ersatz), `numThreads = 1`.
- **Weg-Wahl:** In einem Modul-Worker: Gibt es `navigator.gpu` und liefert `requestAdapter()` einen Adapter → WebGPU-Weg, sonst WASM-Weg. Safari 26
  hat WebGPU auf iOS [W6]. Ob der A14 des iPhone 12 Pro Max es bekommt, ist nicht belegt, darum wird zur Laufzeit geprüft (`g9Info().how`). Geladen
  werden **nur** die Dateien des gewählten Wegs.
- **Speicher-Grenze:** Spitze (JS + WASM + GPU-Puffer) ≤ 600 MB (G9-24, G9-63). Reicht es nicht (Abbruch/Fehler), meldet die App „zu wenig
  Speicher“ und bietet nicht stillschweigend etwas Kleineres an.

##### 4.5 Laden bei Bedarf, Cache, Netz
- **Nie beim Start.** Modell und Laufzeit kommen erst nach [Laden und erkennen]. Vorher zeigt das Blatt die Größe des gewählten Wegs („≈ 80 MB,
  einmalig; WLAN empfohlen“ bzw. ≈ 100 MB) und wie viel Platz frei ist (`navigator.storage.estimate()`). Die **Silben-Muster** (79 KB gz) sind
  kein Teil davon. Sie laden, sobald der Text-Modus das erste Mal öffnet (§6.2).
- **Quellen:** zuerst der eigene Pages-Server `vendor/g9/` (Bibliothek `lib/`, Laufzeit `rt/`, Muster `syl/`, Modell `sm-base/` mit den
  Dateinamen, die die Bibliothek erwartet: `config.json`, `generation_config.json`, `preprocessor_config.json`, `tokenizer.json`,
  `tokenizer_config.json`, `onnx/encoder_model_quantized.onnx`, `onnx/encoder_model_fp16.onnx`, `onnx/decoder_model_merged_quantized.onnx`; die
  genauen Namen für q8/fp16 prüft G9b-0 an 4.3.2). Danach die öffentliche Modell-Ablage (feste Revision) bzw. die npm-CDN (feste Version). Jede
  Datei wird mit **SHA-256** geprüft (Liste im Code); eine Abweichung bricht mit Meldung ab. Jede Datei < 100 MB (Git-Grenze), **kein Git LFS**
  (Pages liefert LFS-Dateien nicht aus).
- **Eigener Lader:** G9 lädt jede Datei selbst (`fetch` in Stücken, Fortschritt in MB), prüft die Prüfsumme und legt sie unter ihrer vendor-URL in den
  Cache-Speicher `synq-g9-v1`. Die Bibliothek liest daraus (`env.useCustomCache = true`, `env.customCache` = dieser Cache; G9b-0 prüft das an
  4.3.2, sonst ein eigener `fetch`-Ersatz im Worker). Die Laufzeit bekommt Blob-URLs aus demselben Cache. `sw.js` lässt `vendor/g9/` unberührt
  (kein Vorab-Cache, keine Umleitung).
- **Löschung durch Safari:** Safari löscht Webseiten-Speicher nach 7 Tagen ohne Besuch (Home-Bildschirm-Apps zählen eigene Tage) [W8]. Fehlt das
  Modell, steht [Erkennen] wieder mit „lädt ≈ 80 MB“.
- **Platz anzeigen und freigeben:** nur im **Erkennen-Blatt** (§7.8): „Sprachmodell auf diesem Gerät: 78 MB [Entfernen]“. Die Zahl ist die
  Summe **aller** Dateien in `synq-g9-v1` (auch ein zweiter Satz, falls der Weg einmal gewechselt hat). [Entfernen] löscht den ganzen Cache.
- **Datenschutz:** Während der Erkennung gibt es **nur GET-Abrufe** der Dateien aus der Liste, nie einen Upload (G9-25).
- **Verbindung zu den anderen (Online):** Der Download läuft mit `fetch` in Stücken im Worker. Online-Speichern und -Abgleich bleiben nutzbar (G9-26).
- **Claude-App-Ansicht:** kein Mikrofon, keine Takes → dort gibt es keinen Text-Modus (wie VS3, `tkAudioOk()`).

##### 4.6 Bezug von Modell und Prüfkorpus (Schritt 0, vor jedem Einbau)
**Befund:** In den Cloud-Sitzungen dieses Projekts sperrt der Netz-Proxy die Modell-Ablage (`huggingface.co`), jsDelivr, unpkg und Zenodo. Die
npm-Registry, PyPI und GitHub sind erreichbar (am 31.10. selbst geprüft). Das Modell mit Kreuz-Aufmerksamkeits-Export und der öffentliche
Gesangs-Datensatz (K-G9 a) liegen auf der gesperrten Ablage. Fremde Spiegel auf npm/GitHub nimmt G9 **nicht**, weil ihre Herkunft nicht prüfbar ist.
**Weg (F0):**
1. Xander erlaubt **einmal** in den Einstellungen der Cloud-Umgebung (Titelleiste der Sitzung → Umgebung → Bearbeiten → Netzwerkzugriff →
   Erlaubte Domains) `huggingface.co` und `*.hf.co` (über diese Unterdomains laufen die Downloads; den genauen Namen meldet der erste Versuch). Das
   Häkchen „Paketmanager erlauben“ bleibt an. Anleitung: [Cloud-Umgebungen, Netzwerkzugriff](https://code.claude.com/docs/en/cloud-environments#network-access).
2. Der Dirigent lädt die Dateien in der festen Revision (Modell „tiny“ und „base“ als q8 + fp16-Encoder; „small“ nur, wenn „base“ das Gate
   verfehlt) und den Prüfkorpus (40 + 40 Phrasen). Er notiert SHA-256 und Größen und legt das Modell „base“ unter `vendor/g9/sm-base/` in den
   Pages-Zweig. Bibliothek, Laufzeit und Muster kommen aus npm (schon erreichbar) nach `vendor/g9/lib|rt|syl/`. Der Korpus bleibt privat unter
   `S/korpus-g9/` (nie im Repo).
3. Danach darf Xander die Freigabe wieder entfernen. Die App selbst braucht sie nie, denn sie lädt vom eigenen Pages-Server.
**Ohne Freigabe:** G9b endet nach dem modellfreien Teil (G9b-V). Text einfügen, tippen und korrigieren werden trotzdem gebaut (Zweige A und C).
[Erkennen] erscheint dann nicht (Stopp-Punkt 1, §9).

---

#### 5. Datenmodell (Format bleibt 5, nur zusätzliche Felder, alte Projekte Zeichen für Zeichen gleich)

##### 5.1 Take: `S.takes[id].ly` (fehlt = kein G9-Text)
```
ly = {v: 1, lang: 'de'|'en', src: 'erkannt'|'getippt'|'eingefuegt'|'vs5b', s: [Silbe, …]}
Silbe = {x, t, w?, j?, o?, p?, u?}
   x   Text der Silbe, 1–24 Zeichen, ohne Steuerzeichen, ohne Leerzeichen; Satzzeichen bleiben am Wort (z. B. „Herz,“)
   t   Anker = Zeit der Marke in Take-Sekunden (Quelle, VOR der Zeitkarte), auf 1e-6 (tkR6) – die Silbe beginnt an dieser Marke
   w   1 = Wortanfang, 2 = Wort- und Zeilenanfang (aus [Ganzer Text]); fehlt = Silbe im Wort
   j   1 = mit der vorigen Silbe auf DERSELBEN Marke verschmolzen (t = t der vorigen); höchstens 3 Silben je Marke über j
   o   1 = ohne eigene Marke („überzählig“): Text hinter der letzten Marke, 4. und weitere Silbe auf einer Marke, Rest nach Marke-Löschen;
       t = Marke, an der sie hängt; KEINE Obergrenze je Marke; Anzeige rot
   p   Sicherheit 0…1 auf 0,01 (erkannte Silben; 0,5 bei vereinfachter Trennung §6.2; fehlt = sicher)
   u   1 = von Hand gesetzt/bestätigt (bleibt bei neuer Ausrichtung/Erkennung fest)
   Reihenfolge = Lesereihenfolge; t nicht fallend; höchstens 4000 Silben je Take
```
- **Überzählige Silben** sind durch `o` eindeutig von einer echten Verschmelzung (`j`) getrennt. Sie gehen nie verloren, auch nicht beim
  Normalisieren, Speichern/Laden oder Marke-Löschen (G9-10).
- **Neu-Einrasten (Marken nicht gespeichert):** Erkannte Marken stehen nicht im Projekt und können sich ändern (andere Säubern-Stärke, spätere
  VS5a-Fassung, anderes Gerät). Die Anzeige leitet darum aus `ly` und den aktuellen Marken eine **Sicht** ab (`g9View(id)`, nicht gespeichert):
  1. Liegt eine Marke ≤ 30 ms vom Anker, sitzt die Silbe dort.
  2. Sonst werden **nicht feste** Silben (`u` fehlt) eines solchen Stücks zwischen den nächsten eingerasteten Nachbarn **lokal neu ausgerichtet**
     (dieselbe DP, §6.3).
  3. **Feste** Silben (`u: 1`) wandern nie. Fehlt ihre Marke, zeigt die Anzeige sie gestrichelt an `t` („ohne Marke“, Hinweis in der Info-Zeile,
     [Neu ausrichten] = Schritt 2 auch für sie, ein Undo).
  `ly` selbst ändert sich erst mit der nächsten G9-Aktion an diesem Take: Dann schreibt sie die Sicht in denselben Undo-Schritt. Laden + Speichern
  ohne Bedienung bleibt Zeichen für Zeichen gleich (Regel 28).

##### 5.2 Normalisieren, Kopien
`tkExt().take.push((m, o) => { const l = g9NormLy(m.ly, o.len / o.sr); if (l) o.ly = l; })`.
Das Normalisieren **verwirft keine Silbe des Nutzers**. Es klemmt und ordnet nur:
- `x` wird von Steuerzeichen und Leerzeichen befreit und auf 24 Zeichen gekürzt. Nur eine Silbe, deren `x` danach leer ist, fällt weg.
- `t` wird auf [0, Länge] geklemmt. Ein fallendes `t` wird auf das `t` der vorigen Silbe angehoben und bekommt `o: 1`. Die Lesereihenfolge bleibt.
- `j` bleibt nur nach einer Silbe mit gleichem `t`, sonst wird es entfernt. Mehr als 3 Silben je Marke über `j` → ab der 4. `o: 1` statt `j`.
- Mehr als 4000 Silben gibt es nur in kaputten Dateien; dann wird gekürzt (Changelog nennt es). Ohne gültige Silbe fehlt `ly`.
Undo-Schnappschüsse, Duplizieren, P1-ZIP und Online-Projekt tragen `ly` mit (JSON). Eine Vorgänger-Version öffnet das Projekt ohne Fehler und lässt
`ly` weg. Sie zeigt dann `lyrics` (§5.3); der Changelog nennt das.

##### 5.3 VS5b-Feld `take.lyrics` (bleibt)
- **Lesen:** Hat ein Take nur `lyrics`, zeigt G9 ihn **genau wie VS5b** (`VSM.assignLyrics`, eine Silbe je Marke von links; pixelgleich, G9-50).
  Beim Laden wird nichts umgewandelt.
- **Umwandeln:** Bei der **ersten G9-Änderung** an diesem Take entsteht `ly` aus der VS5b-Verteilung (Silbe k → Marke k, überzählige `o: 1`,
  `src: 'vs5b'`), im selben Undo-Schritt wie die Änderung.
- **Mitführen:** Jede G9-Änderung schreibt `lyrics` als Klartext mit Bindestrichen neu (Silben eines Worts mit „-“, Wörter mit Leerzeichen,
  ≤ 400 Zeichen). Längerer Text wird für `lyrics` am Wortende gekürzt; `ly` bleibt vollständig. So zeigen ältere Versionen den Text noch an.
- **Löschen:** Text-Modus → leeres [Ganzer Text] + ✓ löscht `ly` und `lyrics` (ein Undo).

##### 5.4 Gerät (nicht im Projekt): Profil `synq-stimme-v1` (`stProf()`)
```
g9 = {auto: bool (F1; fehlt = true, sobald das Modell geladen wurde), lang: 'auto'|'de'|'en' (fehlt = 'auto'),
      sm: {rev, how: 'webgpu'|'wasm', at}}   (nur Auskunft über das geladene Modell)
```

##### 5.5 Laufzeit (nicht gespeichert)
```
G9 = {w: Worker|null, job: Map(takeId → {p, phase, next: Fensterindex, words: [...]}), hold: bool (Mikrofon aktiv),
      feat: Map(takeId+'@'+bid → Merkmale je Marke), auto: Map(takeId → ly), view: Map(takeId → Sicht §5.1),
      ed: {sel: k (Abschnitt), wi: Wortindex im Feld, prev: Vorschau-Verteilung, kb: Tastatur-Höhe, play: Quelle|null}, sm: {state, bytes, how}}
```
`G9.auto` hält das letzte automatische Erkennungsergebnis je Take, damit ein Undo eines anderen Schritts es nicht verliert (§7.8).
`G9.job.words` hält die Wörter fertiger Fenster, damit [Stopp] und „Aufnahme hat Vorrang“ nichts Fertiges verwerfen.

##### 5.6 Undo-Art `'ly'` (neu, klein)
G9-Textschritte ändern nur `ly` und `lyrics` **eines** Takes. Sie bekommen darum die Art `{kind: 'ly', id, before, label}` mit
`before = JSON.stringify({ly, lyrics})` dieses Takes statt des ganzen `S.takes`. Dazu kommen `undoState`/`undoApply`-Fälle (setzen bzw.
entfernen beide Felder, dann `g9Undone(id)` und `markDirty`). Eine Aktion bleibt ein Schritt (Regel 8). Ein Schnappschuss ist dann einige KB statt
einiger hundert KB (G9-57).
**Bleiben `'takes'`:** die Marken-Haken (§6.5 letzter Punkt, laufen in `wpEdit`) und alles, was Marken oder Zeitkarte ändert.
**Ohne Schritt:** das automatische Erkennungsergebnis (§7.8).

---

#### 6. DSP und Zeit

##### 6.1 Merkmale je Marke (`g9Feat`, DOM-frei, im VS5a-Worker `wpCall({op: 'g9f'})`)
Auf der Analyse-Quelle `wpBase(id)` (wie `wpDetect`), Hop 5 ms, für jede Marke k mit Zeit tₖ:

| Merkmal | Rechnung | Verwendung |
|---|---|---|
| `rise` | Pegel (RMS, 10 ms) im Fenster [tₖ, tₖ+40 ms] minus Minimum in [tₖ−30 ms, tₖ] in dB | echter Silben-Einsatz, wenn ≥ 6 dB |
| `gap` | Länge der Stille (Pegel < Grundrauschen + 10 dB, wie `detectMarks`) direkt vor tₖ in ms | Wort-/Zeilenanfang |
| `pj` | Tonhöhen-Sprung über die Marke in Cent (Median 30 ms davor/danach, VS5a-`voicing`) | reine Ton-Marke (Melisma), wenn ≥ 80 ct und `rise` < 3 dB |
| `vo` | stimmhaft in [tₖ+20, tₖ+60 ms] (Aperiodizität < 0,25) | Vokal folgt |
| `von` | Vokal-Einsatz: erster Rahmen ab tₖ mit Aperiodizität < 0,25 in [tₖ, tₖ+150 ms]; fehlt → tₖ + 40 ms | Bezug für Tipps (§6.3) |
| `uv` | stimmloser Anteil in [tₖ−60 ms, tₖ+20 ms] (Nulldurchgänge > 3000/s, Pegel > Grund + 6 dB) | Konsonant (s, sch, t, f) davor |
| `dur` | tₖ₊₁ − tₖ (letzte: bis Ende stimmhaft) | Länge des Abschnitts |
| `conf` | aus der Marke | Gewicht |

Kosten: ≈ 4 ms je Sekunde Take (Chromium) [S]. Cache je Take + Quellpuffer (`wpBid`); er wird verworfen, wenn sich die Marken ändern.
**Silben-Platz:** Marke k ist ein Silben-Platz, wenn sie eine Silbe trägt oder ihre Überspring-Kosten (§6.3) ≥ 0,5 sind. Reine Ton-Marken und
schwache Marken ohne Anstieg und ohne Pause sind keine Plätze. Diese Einheit nutzt „Text ab hier ‹ Silbe / Silbe ›“ (§6.5).

##### 6.2 Silbentrennung (`g9Syl(word, lang)`, DOM-frei)
- **Muster:** Deutsch: Silben-Muster „de-x-syllable“ (MIT, 94 905 B / 63 652 B gz), Englisch: Trennmuster „en-us“ (freie Lizenz, 21 027 B /
  14 877 B gz), beide aus dem Paket Hyphenopoly 6.1.0 (MIT) [W10]. Die Muster gibt es **nur als WASM-Module**. Sie haben keine Importe und bringen
  ihre Trenn-Maschine mit (Exporte `hyphenate`, `subst`, `lmi`, `rmi`, `lct`, `mem`). G9 nutzt sie **direkt** per `WebAssembly.instantiate`, im
  Haupt-Faden und im Worker: Das Wort kommt als UTF-16 mit Null-Ende ab Byte 0 in `mem` (≤ 61 Zeichen), dann `hyphenate(lmi, rmi, Trennzeichen)`
  → Länge, Ergebnis zurücklesen. Das Aufruf-Muster stammt aus dem Paket (≈ 1 KB). Ein eigener Liang-Nachbau entfällt. Mindestlänge
  links/rechts **1** (gesungen: „A-bend“, „O-fen“).
- **Laden:** beim ersten Öffnen des Text-Modus für die Sprache des Takes (nicht beim App-Start), aus `vendor/g9/syl/`, danach im Cache
  `synq-g9-v1`. Damit geht Tippen später auch offline.
- **Ohne Muster** (erstes Öffnen offline, Ladefehler): eine **Vokalkern-Regel**. Jeder Vokalkern (Diphthonge wie unten) ist eine Silbe, getrennt
  vor dem letzten Konsonanten zwischen zwei Kernen (V-KV, „ck“, „sch“, „ch“, „ph“, „th“ bleiben zusammen). Solche Silben bekommen `p: 0,5` (blass),
  und die Info-Zeile sagt „Silbentrennung vereinfacht“. Ziel: Anzahl DE ≥ 90 % (G9-12).
- **Gesang-Regeln** (nach den Mustern): ei/ai/au/eu/äu/ie bzw. en: ea/ee/oo/ou/ai/oa sind **ein** Kern. Zwei Vokalkerne ohne Konsonant dazwischen
  werden getrennt, wenn sie kein Diphthong sind („Feu-er“, „ge-ehrt“, „be-ach-ten“). Englisch: Ein stummes End-„e“ zählt nicht („love“, „time“),
  „-ed“ nach t/d zählt („wan-ted“), „-le“ nach Konsonant zählt („lit-tle“). Hat das Muster weniger Silben als Vokalkerne, wird zusätzlich nach V-KV
  getrennt.
- **Vorrang Nutzer:** Ein vom Nutzer getippter Bindestrich wird genommen, wie er ist; ein Wort mit Bindestrichen wird nicht weiter getrennt.
  Apostroph-Formen („geht's“, „don't“) sind nur dann eine Silbe mehr, wenn ein Vokalkern dazukommt.
- **Zahlen** aus der Erkennung: 0–20 und die Zehner werden als Wort geschrieben (Tabelle DE/EN, ≈ 0,4 KB), sonst bleibt die Zahl eine Silbe mit
  `p` ≤ 0,3.
- **Güte-Ziel:** Silben-Anzahl DE ≥ 98 %, EN ≥ 95 %; Grenzen DE ≥ 95 % auf der Prüfliste (G9-01, M-SILBE).

##### 6.3 Ausrichtung Silben → Marken (`g9Align(syl, marks, feat, o)`, DOM-frei)
Monotone Zuordnung per dynamischer Programmierung über (Silbe i, Marke j). Jede Silbe bekommt **genau eine** Marke. Zwischen zwei Silben dürfen
Marken **übersprungen** werden (die vorige Silbe klingt weiter = Melisma „–“), oder zwei/drei Silben liegen **auf einer Marke** (verschmolzen).

| Kosten-Teil | Wert [A] |
|---|---|
| Marke überspringen | 0,2 + 1,5·conf·[rise ≥ 6 dB] + 2,0·[gap ≥ 120 ms] − 0,8·[pj ≥ 80 ct und rise < 3 dB] (min. 0) |
| Verschmelzen (Silbe auf der Marke der vorigen) | 1,2 + 0,6·[neues Wort]; ×0,5, wenn `dur` der Marke ≥ 1,7 × Median-`dur`; 4. Silbe auf einer Marke nur als `o` (Kosten 3,0) |
| Wortanfang auf Marke mit gap ≥ 120 ms | −0,5 |
| Silbe im Wort auf Marke mit gap ≥ 250 ms | +1,0 |
| Zeilenanfang (`w: 2`) auf Marke mit gap ≥ 300 ms | −1,0; sonst +0,5 |
| Silbe mit Konsonant-Anfang (s, sch, st, t, k, p, f, z, ch, th) auf Marke mit `uv` | −0,2 |
| Wort-Zeit aus der Erkennung (erwartete Silbenzeit τᵢ, Wort-Intervall nach Vokal-Gewicht geteilt) | min(4, ((tⱼ − τᵢ)/0,15 s)²)/2 |
| Tipp (I4 `take.tp`) im Fenster [tⱼ − 40 ms, vonⱼ + 60 ms] | Silbe dort −0,8; diese Marke überspringen +1,5. **Nur eingeschaltet, wenn G9-55 besteht**, sonst aus |
| feste Silbe (`u: 1`) | Marke vorgegeben (harte Bedingung) |
| Marken vor der ersten / nach der letzten Silbe frei lassen | 0,3 je Marke |
| Silbe über die letzte Marke hinaus (`o`, rot) | 3,0 je Silbe |

- **Tipps am Vokal:** Menschen tippen am Vokal-Einsatz (I4 §5.5, [W5] dort), die VS5a-Marke sitzt am Konsonanten-Einsatz. Darum misst das
  Tipp-Fenster bis `von` + 60 ms statt nur ±40 ms um die Marke.
- **Größe:** Ohne Erkennungs-Anker volle Tabelle (≤ 1000 × 1000 in ≤ 60 ms im Worker), mit Ankern ein Band ±1,5 s um τᵢ. Lange Takes (G8) werden an
  festen Silben bzw. Pausen ≥ 1 s in Stücke geteilt.
- **Ergebnis** → `ly.s` (t = Marken-Zeit, `j` bei Verschmelzung, `o` bei Überzahl), `w` aus dem Text, `p` aus der Erkennung, `u` bleibt.
- **Gelernte Kosten?** Nein. Die Werte sind fest [A]. G9a darf sie **einmal** am Prüfkorpus nachstellen (Raster-Suche ±50 %); das Ergebnis steht im
  Changelog.

##### 6.4 Ein Wort tippen, ersetzen, löschen, einfügen (lokal, Xanders Ablauf)
Abschnitt k ist gewählt, Xander tippt ein Wort mit n Silben.
- **Bei jedem Tastendruck** (≤ 2 ms): `g9Syl` + lokale Ausrichtung der n Silben auf die Marken k … k+8 (bis vor die nächste feste Silbe). Die erste
  Silbe liegt **fest auf k**. Die Vorschau zeigt die Silben blass an den Ziel-Abschnitten (Überschreiben-Verteilung).
- **Leertaste / ✓ / Eingabe-Taste („Weiter“) / ▶:** übernehmen (ein Undo „Songtext: ‹Wort›“), Silben `u: 1`. Der Rahmen springt auf den Abschnitt
  nach der letzten Silbe bzw. auf die nächste schon beschriftete Silbe, und dieser Abschnitt spielt.
- **Bindestrich:** Silbe übernehmen; der nächste Abschnitt ist die nächste Silbe desselben Worts (nach Ausrichtungs-Kosten, nicht stur k+1).
- **Ersetzen:** Steht an k schon ein Wort, ist es im Feld markiert. Das neue Wort ersetzt **genau die Silben dieses Worts**. Hat es mehr Silben, als
  bis zum nächsten Wort Abschnitte frei sind, wird als Vorgabe **verschmolzen** (Hinweis „2 Silben auf einer Marke · [Nachrücken]“; [Nachrücken] =
  der Rest ab dem nächsten Wort wandert um die fehlenden Silben-Plätze nach rechts, ein Undo). Hat es weniger, bleiben die übrigen Abschnitte als
  Melisma der letzten Silbe („–“), und der Rest rückt nicht.
- **Wort löschen:** Wort gewählt (Tipp), Feld geleert (Lösch-Taste), dann Leertaste / ✓ / „Weiter“ → die Silben dieses Worts verschwinden (ein
  Undo „Wort gelöscht: ‹Wort›“, Toast [Rückgängig]). Der folgende Text **bleibt auf seinen Marken**; die frei gewordenen Abschnitte zeigen „–“
  (Melisma der vorigen Silbe) bzw. „·“. Gegen erfundene oder doppelte Wörter der Erkennung.
- **Wort einfügen:** Wort tippen, dann **[+]** statt Leertaste → das Wort wird **vor** dem gewählten Abschnitt eingesetzt (erste Silbe fest auf k),
  und der gewählte und alle folgenden Silben rücken um n Silben-Plätze nach rechts. Das ist ein Schritt mit einem Undo („Wort eingefügt: ‹Wort›“).
  Ist das Feld leer, ist [+] grau. Gegen Wörter, die die Erkennung verschluckt hat.
- **Lösch-Taste im leeren Feld:** geht zur vorigen Silbe (Abschnitt wird gewählt, Wort markiert) und löscht nichts.

##### 6.5 Verschieben, Verschmelzen, Trennen (ein Undo je Druck)
- **Text ab hier [‹ Silbe] / [Silbe ›]:** Die gewählte Silbe und **alle folgenden** (bis Take-Ende) wandern um **einen Silben-Platz** (§6.1) nach
  links/rechts; die Abstände in Silben-Plätzen bleiben. Reine Ton-Marken zwischen den Plätzen werden übersprungen, Melismen bleiben Melismen.
  Links: Trifft sie den Platz der vorigen Silbe, liegen beide **verschmolzen** dort („nachrücken“). Rechts: Ist die Silbe verschmolzen, löst sie
  sich zuerst. Was am Ende über die letzte Marke hinausgeht, wird `o` (rot). Zweimal ‹ = „2 Silben nach links“.
- **[Verschmelzen]:** Die **nächste** Silbe kommt auf die Marke der gewählten (`j: 1`); alle danach rücken einen Silben-Platz nach links.
- **[Trennen]** (nur bei verschmolzenen Silben): Die letzte Silbe des Abschnitts geht auf den nächsten Silben-Platz; ist der belegt, rückt der Rest
  einen Platz nach rechts. Gibt es keinen nächsten Platz, ist [Trennen] grau, mit dem Toast „Keine freie Marke – beide Silben bleiben zusammen.“
  (kein Rat, eine Marke zu setzen; §2, F8).
- **Marke im Marken-Modus verschoben** (`wpMarkMove`): Silben mit Anker = alte Zeit (|Δ| < 1e-4 s) bekommen die neue Zeit, **im selben Undo**
  (Haken in `wpEdit`, Art `'takes'`). **Marke gelöscht** (`wpMarkDel`): Ihre Silben werden mit der vorigen Marke verschmolzen (`j`); was dort über
  3 Silben ginge, wird `o` (rot, nichts geht verloren). Die Info sagt „1 Silbe verschmolzen“ bzw. „1 Silbe ohne Marke“. **Marke gesetzt**
  (`wpMarkAdd`): Keine Silbe wandert; der neue Abschnitt zeigt „–“.

##### 6.6 Erkennung (`g9Recognize(id)`, Modul-Worker)
1. **Quelle:** `wpBase(id)` (wie die Marken), ganzer Take inkl. G3-Anlauf/Ausklang. Ein Kanal, Hochpass 80 Hz (2. Ordnung), Spitze auf −3 dBFS,
   Abtastrate 16 kHz (Polyphase-Filter, Durchlass bis 7,2 kHz, Sperre ≥ 60 dB) [A].
2. **Stimm-Strecken finden und verbinden:** stimmhafte/aktive Strecken wie `detectMarks` (Energie über Grund + 10 dB, Lücken < 400 ms
   überbrückt), je mit 200 ms Rand. Die Strecken werden zu **einem Strom verbunden**, zwischen zwei Strecken 0,3 s Nullen (eine klare Wort-Grenze
   für das Modell). Eine **stückweise Zeit-Karte** merkt sich je Strecke (Strom-Beginn, Take-Beginn, Länge). Stille geht so gar nicht ins Modell.
   Das spart Rechenzeit, weil weniger Fenster nötig sind, und verhindert erfundene Wörter in Stille.
3. **Fenster:** Der verbundene Strom wird in Fenster ≤ 30 s geteilt, jedes so voll wie möglich, weil die Bibliothek ohnehin auf 30 s auffüllt.
   Geschnitten wird an der letzten Strecken-Grenze zwischen 24 und 30 s; gibt es keine, im leisesten 200-ms-Fenster zwischen 24 und 30 s. Für die
   Fensterzahl gilt ⌈L/30 s⌉ ≤ `chunks` ≤ ⌈L/24 s⌉ (L = Länge des verbundenen Stroms). G8: beliebig viele Fenster, Fortschritt je Fenster. Der
   32-s-Referenz-Take (≈ 22–28 s stimmhaft) braucht meist **ein** Fenster.
4. **Sprache:** `lang` des Takes bzw. Profil. Bei „Auto“ gilt die **eigene Erkennung** (die Bibliothek hat keine, §4.3). Erstes Fenster:
   `generate({inputs, decoder_input_ids: [[<|startoftranscript|>]], max_new_tokens: 1})` mit einem Logits-Filter, der nur `<|de|>` und `<|en|>` zulässt
   (eigener `LogitsProcessor`; falls die Bibliothek ihn nicht annimmt, `suppress_tokens` = alle anderen Tokens). Das erzeugte Token entscheidet. Die
   Kosten sind ein zusätzlicher Encoder-Durchlauf auf Fenster 1, einmal je Take; gemessen in G9b-1. Ergebnis je Take in `ly.lang`. Danach läuft
   jedes Fenster mit **gesetzter** Sprache (`language: 'de'|'en'`, `task: 'transcribe'`), nie ohne.
5. **Aufruf je Fenster:** Pipeline „automatic-speech-recognition“ mit `return_timestamps: 'word'`, **ohne** `chunk_length_s` (G9 schneidet
   selbst), ein Aufruf je Fenster. Die Wörter eines fertigen Fensters gehen sofort an den Haupt-Faden (`G9.job.words`).
6. **Ausgabe:** Wörter mit Start/Ende, über die Zeit-Karte zurück in Take-Sekunden. Ein Wort über eine Strecken-Grenze hinweg gehört zur Strecke
   seiner Mitte. Ein `p` (Mittel der Token-Wahrscheinlichkeiten) gibt es nur, wenn G9b-1 zeigt, dass die Bibliothek Token-Bewertungen liefert
   (`output_scores`). Sonst fehlt `p`, und unsicher markieren nur die Regeln in Schritt 7.
7. **Schutz gegen Erfundenes:** Ein Wort wird verworfen, wenn < 30 % seiner Zeit in einer Stimm-Strecke liegt oder seine Mitte in den 0,3-s-Nullen.
   Eine Folge aus ≥ 3 Wörtern, die sich > 2× direkt wiederholt, wird auf 2× gekürzt. Ein Fenster mit Durchschnitt `p` < 0,2 → seine Wörter werden
   als unsicher markiert (`p` gesetzt) statt verworfen.
8. **Silben:** `g9Syl` je Wort, dann `g9Align` mit den Wort-Zeiten als Anker (§6.3); feste Silben (`u`) bleiben. Bei vorhandenem Text werden nur
   Lücken gefüllt (Strecken ohne Silbe), es sei denn, Xander wählt im Blatt „Alles ersetzen“.
9. **[Stopp]:** `worker.terminate()`. Das wirkt sofort (≤ 0,5 s bis „gestoppt“), denn ein laufender Rechenschritt der Laufzeit lässt sich
   nicht unterbrechen. Fertige Fenster bleiben (Schritt 5) und werden ausgerichtet. Bei Bedarf entsteht ein neuer Worker; das Modell kommt dann aus
   dem Cache (≤ 5 s, G9-20).
10. **Aufnahme hat Vorrang:** Bei jedem Start des Mikrofons (`stStart`, `micStart`, `micTapGet`, also auch Mikro-Check, Stimme-FANG, ● REC,
    ● SONG mit 🎤, Mikro-Eingang der Vocoder-Engine) wird die Erkennung beendet (`terminate`, `G9.hold = true`). Fertige Fenster bleiben; `job.next`
    merkt das nächste Fenster. 2 s nachdem das letzte Mikrofon aus ist, geht es dort weiter (neuer Worker). Eine automatische Erkennung startet
    nie, solange ein Mikrofon läuft. Vor **jedem** Start einer Erkennung wird `saveNow()` aufgerufen, damit ein Neuladen des Tabs durch
    Speicherdruck nichts verliert.
11. **Während ▶:** Die Erkennung läuft weiter (Worker, eigener Kern). Stellt M-EINBRUCH einen Aussetzer fest, pausiert sie bei ▶ (zwischen Fenstern)
    (G9-27).

##### 6.7 Vorspielen eines Abschnitts (`g9Play(id, a, k)`)
- Puffer = gehörte Fassung `tkHeard(id, a)` (bei A/B `WP.ab` der Roh-Take). **Geschnitten wird mit der Karte, die zu diesem Puffer gehört:**
  `tkHeardMap(id, a)` (neu, nur lesend) sagt, welche Zeitkarte in der gelieferten Fassung steckt. Der Fassungs-Cache merkt sich dazu je Eintrag
  seine Karte (`{key, buf, map}`); der Klang bleibt unverändert. Aktuelle Fassung → [warp(tₖ), warp(tₖ₊₁)). Vorige Fassung, solange die neue
  rechnet → mit **deren** Karte. Roh-/Säubern-Take (`null` aus `wpPlay`) → Quell-Zeiten [tₖ, tₖ₊₁).
- Höchstens **4 s** (bei längeren Abschnitten die ersten 4 s), mindestens 120 ms (kürzere: bis 120 ms weiter), Blenden 5 ms.
- Weg: `AudioBufferSourceNode` → derselbe Spur-Weg wie `tkPlace` (Spur-Lautstärke, Pan, VS-P-Pegel/Begrenzer, Sends) [A].
- Start bei `currentTime + 0,01 s`. Ein neuer Abschnitt beendet den vorigen mit 5-ms-Blende. Läuft ▶: siehe F3 (Vorgabe: ▶ hält an, dann spielt der
  Abschnitt).

##### 6.8 Zahlen auf einen Blick
| Größe | Wert |
|---|---|
| App-Code G9 | ≈ +45 KB (in der Datei) |
| Nachladen Silben-Muster | DE 64 KB gz, EN 15 KB gz (beim ersten Öffnen des Text-Modus, dann im Cache) |
| Nachladen Erkennung, WASM-Weg | Bibliothek 170 KB gz + Laufzeit 3,7 MB gz (14,3 MB ungepackt) + Modell ≈ 75–80 MB [S] ≈ **80 MB** |
| Nachladen Erkennung, WebGPU-Weg | Bibliothek 170 KB gz + Laufzeit 6,6 MB gz (26,9 MB ungepackt) + Modell ≈ 95 MB [S] ≈ **100 MB** |
| Download bei 50 / 10 Mbit/s | WASM ≈ 13 s / ≈ 66 s · WebGPU ≈ 16 s / ≈ 82 s |
| Erkennung 16 Takte (32 s, 1 Fenster) iPhone 12 Pro Max | Ziel WASM ≤ 45 s, WebGPU ≤ 15 s (G9-20) |
| [Stopp] | ≤ 0,5 s (Worker beenden) |
| Ausrichtung ganzer Text 64 Takte | ≤ 60 ms im Worker |
| Tastendruck → Vorschau | ≤ 2 ms Median, ≤ 6 ms Max (4× CPU-Drossel) |
| Tipp → Rahmen sichtbar / Ton startet | ≤ 1 Bild (16,7 ms) / ≤ 30 ms nach dem Tipp + Ausgabe-Verzögerung |
| Undo-Schritt Text | einige KB (Art `'ly'`), 60 Schritte auf 5-min-Take ≤ 4 MB (G9-57) |
| Silben-Lage | an der Marke (VS5a-Feinlage ±5 ms), Wort-Zeiten nur Anker (±0,1–0,3 s) |

---

#### 7. Bedienung

##### 7.1 Einstieg [V]
- Die vorhandene Kopf-Taste **[Text]** (`.wptx`) im Marken-Editor öffnet künftig den **Text-Modus** statt des kleinen Eingabe-Pops `wpLyrPop`.
  Noch einmal [Text] = zurück in den Marken-Modus. Der Modus gilt, bis das Blatt schließt. `#wpSheet.g9`; schließt den G2-Noten-Editor
  (`#wpSheet.g2`) und umgekehrt.
- Takes-Blatt und STIMME-Zeile: **nichts Neues** (Regel 27). Der Weg bleibt Marken-Editor → [Text]. Modell-Größe, [Entfernen], Sprache und
  „automatisch erkennen“ liegen im Erkennen-Blatt (§7.8).

##### 7.2 Aufbau Text-Modus (ohne Tastatur) [V]
**Hochformat** (Blatt wie heute 350 px, P3 292 px):

| Zeile | Höhe | Inhalt |
|---|---|---|
| Kopf | 44 | Titel „Text · STIMME · ‹Clip›“ (umbrechend wie heute), **[Erkennen]** (≥ 64 × 44; fehlt ohne Erkennung, §9), **[Text]** an, [A/B], [✕] |
| Wellenform | Rest (≥ 120, P3 ≥ 72) | wie Marken-Modus (Raster, Marken, Zeitkarte), dazu der **gewählte Abschnitt** hell hinterlegt (rgba 255,211,90,.18) mit gelben Rändern (`#ffd35a`, 2 px) |
| Silben-Leiste | 44 | je Abschnitt ein Feld von Marke zu Marke mit der Silbe (13 px, 600), im Hintergrund die Hüllkurve des Abschnitts (`tkPeaks`); verschmolzen „ist·ein“; Melisma „–“; leer „·“; unsicher blass (55 %) mit gepunkteter Linie; von Hand weiß; **rot = ohne Marke (`o`)**; gestrichelt = feste Silbe ohne Marke |
| Eingabe | 44 | **[◀]** 44 × 44 · Feld „Silbe oder Wort“ (Rest, ≥ 140 px) · **[+]** 44 × 44 („Wort hier einfügen“) · **[▶]** 44 × 44 |
| Werkzeuge | 44 | **[‹ Silbe]** **[Silbe ›]** (Beschriftung darüber klein: „Text ab hier“) · **[Verschmelzen]** · **[Trennen]** · **[Ganzer Text]** |

**Lange oder kurze Namen:** Die langen Namen stehen nur da, wenn sie ohne Kürzung passen (M-PLATZ mit echter Schrift). Sonst gelten Kurz-Namen
[‹] [›] [⌒] [⌣] [≡] mit `aria-label`; jede Taste ≥ 44 × 44.
**P3 (≤ 600 px hoch, z. B. 320 × 568):** Kopf 44, Wellenform ≥ 72, Leiste 44, Eingabe 44, Werkzeuge 44 mit Kurz-Namen. **Zwei** Zeilen, nicht eine:
Eine gemeinsame Zeile mit acht Tasten ließe auf 320/375 px kein Feld übrig.
**Querformat** (Blatt 380 px rechts): Kopf 40 (Treffer bis 44 wie `#qSheet`-Muster), Wellenform Rest (≥ 96), Leiste 44, Eingabe 44, Werkzeuge 44
(Kurz-Namen; jede Taste ≥ 44 × 44).

**Zoom im Text-Modus:** keine neue Zoom-Stufe. Der Text-Modus öffnet mit der Stufe des Marken-Modus. Ist dort der Median-Abschnitt < 44 px breit,
geht er eine Stufe feiner, höchstens bis 1 Takt (die feinste vorhandene Stufe, `WP_ZOOM`). Bei schnellen Stellen (120 BPM, 1/16-Silben ≈ 26 px
hoch) bleiben Abschnitte schmaler als 44 px. Dafür gilt die Treffer-Regel unten, und **◀ ▶ ist der genaue Weg**. Ziehen auf Wellenform/Leiste
schwenkt (> 8 px). Der gewählte Abschnitt bleibt im mittleren Drittel (weiches Nachführen ≤ 200 ms).
**Treffer-Regel:** Ein Abschnitt < 44 px bekommt links und rechts je (44 − Breite)/2 dazu, aber nur auf Kosten eines Nachbarn, der danach selbst
noch ≥ 44 px hat. Liegen schmale Abschnitte nebeneinander, teilen sie sich die Fläche in der Mitte zwischen ihren Mittelpunkten (nächste Mitte
gewinnt).
**G3-Bereich:** Der hörbare Anlauf (`g3PreOf(a)`) und Ausklang (`g3PostOf(a)`) sind heller als „außerhalb“ und bearbeitbar. Die Ansicht beginnt
bei a.in − g3PreOf(a).
**G1:** Silben und Abschnitts-Rahmen sitzen an den gezeichneten (quantisierten) Positionen `E.mpos` und laufen mit der Sprung-Animation mit.

##### 7.3 Tipp auf Wellenform oder Silben-Leiste
- Tipp (kein Ziehen, < 500 ms) → Abschnitt k nach der Treffer-Regel wählen. Der Rahmen erscheint sofort (Klasse/Neuzeichnen im selben Bild), der
  **Abschnitt spielt** (§6.7), dazu Haptik (§7.9). Das Feld bekommt im selben Ereignis den Fokus (`focus({preventScroll: true})`), damit die Tastatur
  aufgeht bzw. offen bleibt. Im Feld steht das Wort an k, markiert.
- Info-Zeile: „Silbe 7 · Takt 3.2 · 0,42 s · ‹Wort›“ (oder „unsicher · ‹Wort›“). Takt-Angaben über die vorhandene Raster-Funktion (keine eigene
  4/4-Annahme, wichtig für T1).
- Im Text-Modus setzt ein Tipp **keine** Marke (das bleibt dem Marken-Modus). Marken verschieben per Ziehen geht hier nicht (Ziehen = schwenken).

##### 7.4 Schreiben und Einrasten
- **Erster Tastendruck** in einem Abschnitt: Der Rahmen „rastet ein“ (Rand 2 → 3 px und zurück, 150 ms), und der Abschnitt spielt (außer er hat in
  den letzten 1,5 s schon gespielt). Die Vorschau der Silben-Verteilung steht blass in der Leiste (§6.4).
- **Leertaste / ✓ / Eingabe-Taste:** Wort übernehmen (ein Undo); der Rahmen springt zum nächsten Abschnitt, der spielt; die Tastatur bleibt offen.
  **Bindestrich:** nächste Silbe. **[+]:** Wort einfügen (§6.4).
- **[◀] [▶]:** voriger/nächster Abschnitt (spielt, Haptik).
- Feld: `autocomplete/autocorrect/autocapitalize=off`, `spellcheck=false`, **`enterkeyhint="next"`** (Taste „Weiter“ = übernehmen + nächster
  Abschnitt), `inputmode="text"`, Länge ≤ 60.
- **„Fertig“ der Safari-Leiste über der Tastatur** (nimmt dem Feld den Fokus): Ein geändertes Wort im Feld wird übernommen (ein Undo), dann wird
  das Dock ohne Sprung wieder zum Blatt (G9-31).
- Kein eigener Ton beim Einrasten außer dem Abschnitt selbst.

##### 7.5 Ersetzen, Löschen, Einfügen
- **Ersetzen:** Tipp auf ein falsches Wort → das ganze Wort steht markiert im Feld → neues Wort tippen → Leertaste. Regeln §6.4. Toast
  „‹alt› → ‹neu›“ [Rückgängig]. Die neuen Silben sind `u: 1` (fest).
- **Löschen:** Tipp auf das Wort → Lösch-Taste → Leertaste. Toast „‹Wort› gelöscht“ [Rückgängig].
- **Einfügen:** Tipp auf den Abschnitt, vor dem das Wort fehlt → Wort tippen → [+]. Toast „‹Wort› eingefügt“ [Rückgängig].

##### 7.6 Werkzeuge
Wie §6.5. Jede Taste mit `aria-label` („Text ab hier eine Silbe nach links“, „… nach rechts“, „Mit nächster Silbe verschmelzen“, „Trennen“, „Ganzen
Text einfügen“, „Wort hier einfügen“). Grau (mit Grund im Toast beim Antippen), wenn nicht möglich. Die ◀ ▶ des Text-Modus sind eigenständig; I2
legt kein gemeinsames Bauteil an (I2 §7, Zeile G9).

##### 7.7 [Ganzer Text] [V]
Blatt mit mehrzeiligem Feld (≥ 5 Zeilen sichtbar, Eingabe-Taste = neue Zeile), Satz „Zeilen = Atempausen. Silben trennt die App; eigene Bindestriche
gelten.“, Wahl **[Deutsch] [Englisch] [Auto]**, **[✓ Verteilen]** (ein Undo „Songtext eingefügt“). Einfügen ersetzt den **ganzen** Text des
Takes (auch feste Silben). Das Feld ist mit dem vorhandenen Text vorbelegt (Zeilen aus `w: 2`), also verliert nichts, wer nichts ändert. Toast mit
[Rückgängig]. Leer + ✓ = Text löschen. Mehr Text als Marken → die Überzahl wird `o` (rot) und bleibt erhalten. Das Blatt dockt über der Tastatur
(`popDock`-Muster).

##### 7.8 [Erkennen] und automatische Erkennung [V]
- **Erstes Mal:** Blatt mit Größe des Wegs, freiem Platz, einem Satz zum Datenschutz, Wahl Sprache [Auto] [Deutsch] [Englisch], Schalter „Neue
  Aufnahmen automatisch erkennen“ (Vorgabe an, F1), **[Laden und erkennen]** / [Abbrechen]. Download-Fortschritt in MB, [Stopp].
- **Später:** [Erkennen] erkennt sofort. Hat der Take schon Text, gibt es die Wahl **[Lücken füllen]** (Vorgabe) / **[Alles ersetzen]**; feste Silben
  bleiben in beiden Fällen. Im selben Blatt: „Sprachmodell auf diesem Gerät: 78 MB [Entfernen]“, Sprache, Schalter „automatisch erkennen“.
- **Automatisch** (F1, wenn das Modell im Cache liegt): nach jeder neuen Aufnahme mit 🎤 (Stimme-FANG, REC, SONG), wenn ▶ steht bzw. nach dem Stopp
  und **nur ohne laufendes Mikrofon** (§6.6.10). Höchstens ein Take gleichzeitig, in Aufnahme-Reihenfolge, **nur für Takes ohne Text**. Tippt
  Xander, bevor das Ergebnis da ist, wird es verworfen (Info „Erkennung verworfen – Text schon da“; [Erkennen] → „Lücken füllen“ holt es nach).
  Das Ergebnis kommt **ohne eigenen Undo-Schritt** an den Take (wie der G3-Anlauf `g3TakePre`), mit `src: 'erkannt'`. Ein Undo der Aufnahme nimmt
  es mit. Ein Undo/Redo eines `'takes'`-Schritts, dessen Schnappschuss älter ist, setzt es aus `G9.auto` wieder ein (`wpUndone`-Haken), solange der
  Nutzer den Text noch nicht geändert hat. `'ly'`-Schritte sind davon nicht betroffen: Ihr Schnappschuss enthält das Ergebnis schon.
- **Anzeige:** nur in der Info-Zeile des Marken-Editors: „Erkennen … 3/5 · 60 %“ bzw. „23 Wörter erkannt · 5 unsicher“ bzw. „Erkennen wartet
  (Aufnahme)“.
- **Diagnose (nur mit `?g9diag=1` in der Adresse, wie `?engine=native`):** eine Zeile im Erkennen-Blatt mit Weg, Zeit je Fenster, WASM-Speicher
  (soweit die Laufzeit ihn zeigt), Modell-Bytes, Zahl der Abrufe und Upload-Bytes (`g9Net()`). Damit misst Xander am iPhone ohne Rechner
  (G9-63). Ohne den Schalter ist nichts davon sichtbar.

##### 7.9 Haptik (iOS-Safari)
**Fakten** (derselbe Befund wie I4 [W3], hier [W7]): `navigator.vibrate` gibt es in Safari auf dem iPhone nicht. Seit Safari 17.4 gibt es das
Schalter-Kästchen `<input type="checkbox" switch>`; ab iOS 18 gibt sein Umschalten einen System-Tick. Ein **Klick aus dem Code** (`label.click()`,
so macht es `hapticInit/haptic` heute) wirkt laut Doku der Haptik-Bibliothek nur auf iOS 17.4 bis 26.4 und ist seit iOS 26.5 abgestellt. Die
Bibliothek legt seit 3.0.0 ein Label **in** das Ziel-Element, damit der **echte Fingertipp** den Schalter umlegt. Der Tick kommt beim Loslassen
(`click`). Beim **Schreiben auf der Tastatur** gibt es keinen Fingertipp auf die Seite, dort ist Haptik aus der Seite nicht möglich. Die
Tastatur tickt selbst, wenn in den iPhone-Einstellungen „Töne & Haptik → Tastaturfeedback → Haptik“ an ist.
**Umsetzung [A]** (Muster der Bibliothek 3.3.0, im Paket nachgelesen):
1. **Ein Label je Ziel:** Ziele sind der Wellenform-Rahmen, die Silben-Leiste, [◀] [+] [▶] und die Werkzeuge. In jedes kommt als letztes Kind ein
   `<label aria-hidden="true">` (absolut, `inset: 0`, durchsichtiger Tipp-Effekt, dieselbe `touch-action` wie das Ziel). Darin liegt ein
   `<input type="checkbox" switch>` mit 1 × 1 px und **`visibility: hidden`**, **ohne** `tabindex`; sein `click` stoppt das Weiterreichen. Der Klick
   auf das Label läuft zum Ziel hoch, also bleibt **die eigene Klick-Behandlung des Ziels** (keine Lage-Berechnung). Die Gesten der Wellenform
   (`wpGest`) hängen dafür am Rahmen statt an der Leinwand. Die Label-Schicht gibt es nur im Text-Modus und nur bei `UI.haptics` an; im Marken-Modus
   ist sie aus (`display: none`).
2. **Fokus bleibt beim Feld:** Ein verstecktes Kästchen nimmt keinen Fokus. Zusätzlich setzt jede Klick-Behandlung im Text-Modus, wenn das Dock
   aktiv ist, **im selben Klick** `g9Field.focus({preventScroll: true})`. Tasten verhindern bei `mousedown` den Fokus-Wechsel (`preventDefault`;
   wichtig für Chromium). G9-34 prüft `document.activeElement` nach jedem Label-Klick.
3. **Geräte-Entscheidung am ersten Tag von G9c (G9-61):** Die Probe-Seite von I4 (I4-61) bekommt zwei Knöpfe dazu: (5) Label-Tipp, während ein
   Textfeld den Fokus hat (bleibt die Tastatur offen? Tick?), und (6) Label über einer Leinwand. Xander meldet ja/nein. **Schließt sich die
   Tastatur** oder kommt kein Tick, ist die Label-Schicht aus, solange die Tastatur offen ist (Ticks nur ohne Tastatur), und „Bitte prüfen“ sagt
   es ihm.
4. **Beim Schreiben** (Einrasten, Wort übernommen): `haptic('snap')` wie bisher. Das wirkt nur bis iOS 26.4, sonst bleibt es still. Ersatz immer:
   sichtbarer Rahmen-Puls + Vorspielen. Hilfe-Satz zum Tastatur-Feedback (§7.11).
5. **Mikrofon:** Im Text-Modus läuft keine Aufnahme, also ist M-HAPTIK aus I4 hier nicht nötig.
6. **Ein Befund für alle:** Das Ergebnis der Probe gilt für I1–I4 und G9 (I1/I3 benutzen `haptic()` beim Ziehen). Es steht einmal im Changelog;
   I4-61 und G9-61 sind dieselbe Probe.

##### 7.10 Tastatur-Dock (Hoch- und Querformat) [V]
Sobald das Feld den Fokus hat und `visualViewport.height` < `innerHeight` − 120 ist (Tastatur offen), wird der Text-Modus zum **Dock**:
`position: fixed`, oben = `vv.offsetTop + vv.height − Dockhöhe`, volle Breite (Ränder 8 px + Safe-Area), über allem außer Toasts. Die Seite dahinter
bewegt sich nicht (Scroll-Lage 0, `focus({preventScroll: true})`, Rücksetzen bei iOS-Eigenscroll), und das Raster der App bleibt.
Die sichtbaren Höhen sind Schätzungen [S] mit Vorschlagsleiste und Safari-Leiste über der Tastatur. Die **echten Werte misst die Probe-Seite**
(G9-61, vor G9c) und trägt sie in `g9KbSim` ein.

| Format (CSS-px) | sichtbare Höhe mit Tastatur (≈) [S] | Dock | Inhalt |
|---|---|---|---|
| 428 × 926 hoch | ≈ 400–480 | 300 | Kopf 44 · Wellenform 120 · Leiste 44 · Eingabe 44 · Werkzeuge 44 |
| 390 × 844 hoch | ≈ 360–400 | 300 | wie oben |
| 375 × 667 hoch | ≈ 250–290 | 250 | Kopf 44 · Wellenform 70 · Leiste 44 · Eingabe 44 · Werkzeuge 44 |
| 320 × 568 hoch | ≈ 200–240 | 200 | Wellenform 64 · Leiste 44 · Eingabe 44 ([◀] Feld [+] [▶]) · Werkzeuge 44 ([‹] [›] [⌒] [⌣] [≡] [✕]); Kopf weg |
| 926 × 428 quer | ≈ 120–140 | **118** | Mini-Wellenform 30 · Leiste 44 (mit Hüllkurve) · **eine** Zeile 44: [◀] Feld [+] [▶] [‹] [›] [⌒] [⌣] [≡] [✕] |
| 844 × 390 / 667 × 375 quer | ≈ 100–130 | 118 bzw. 88 | wie oben; unter 118 px sichtbar entfällt die Mini-Wellenform (88 = Leiste + Zeile) |

Die **Leiste** ist auch im kleinsten Dock die sichtbare Wellen-Referenz: Sie zeigt im Hintergrund die Hüllkurve jedes Abschnitts, und der gewählte
ist gelb gerahmt. Die eine Querformat-Zeile braucht 9 × 44 px + Feld ≥ 140 px + Abstände ≈ 580 px und passt damit auch in 667 px. Liegt die
gemessene Höhe auf Xanders Gerät unter 88 px, sagt „Bitte prüfen“ das mit einem Vorschlag (kein stilles Weglassen). Tastatur zu → zurück ins Blatt
ohne Sprung.

##### 7.11 Hilfe (zwei bis drei Sätze im Hilfe-Abschnitt zur Stimme)
„Text: Im Marken-Editor [Text] – auf die Wellenform tippen spielt den Abschnitt bis zur nächsten Marke; einfach losschreiben, Wörter mit mehreren
Silben verteilen sich selbst; ein Wort antippen, Feld leeren und Leertaste löscht es, [+] fügt das getippte Wort ein. [Erkennen] schreibt die gesungenen Worte
(Sprachmodell auf dem Gerät, einmal ≈ 80–100 MB). Statt tippen geht auch die Diktier-Taste der Tastatur; für einen Tick je Taste in den
Einstellungen das Tastatur-Feedback ‚Haptik‘ einschalten.“

##### 7.12 Test-API (nur Tests)
`g9Syl(word, lang)`, `g9Align(syl, marks, feat, o)`, `g9Feat(id)`, `g9View(id)`, `g9Set(id, ops)` (Wort / Löschen / Einfügen / Ganzer Text /
Verschieben / Verschmelzen / Trennen ohne DOM), `g9Ly(id)` (deep), `g9Recognize(id, {lang, how, model})` → Promise `{words, ms, how, chunks, lang}`,
`g9Info()` → `{sm: {state, bytes, how, rev}, job, hold, auto, mem: {wasm, model}, ed: {sel, prev, dock, kb}}`, `g9KbSim(h)` (simulierte
Tastatur-Höhe für Chromium), `g9PlayLog()` (letzte Vorspiel-Bereiche mit Karte), `g9HapLog()` (Label-Klicks / `haptic`-Aufrufe / `activeElement`
danach), `g9Net()` (Abrufe der Erkennung: URL, Methode, Bytes).

---

#### 8. Zusammenspiel mit vorhandenen und kommenden Paketen (im Code geprüft)

| Stelle | Änderung durch G9 |
|---|---|
| `vsMarksMake()` (`VSM`) | **unverändert** (Version `vs5a-marks-2`); `assignLyrics` bleibt für VS5b-Texte. |
| VS5a-Worker (`wpCall`) | + `op: 'g9f'` (Merkmale) und `op: 'g9a'` (ganze Ausrichtung); Erkennung in eigenem Modul-Worker (`G9.w`). |
| `wpOpen` / `wpPaint` / `wpGest` / `wpView` | Text-Modus (Klasse `g9`), Leiste, Rahmen, Tipp-Wahl statt Marke setzen, Zoom-Regel; Gesten am Rahmen statt an der Leinwand (nur Text-Modus braucht das; Marken-Modus verhält sich gleich). |
| `wpLyrPop` / `wpSetLyrics` / `wpNormLyr` / `wpLyr` | Pop wird nicht mehr von [Text] geöffnet (bleibt für Test-API `wpLyrics`); `wpSetLyrics` schreibt bei vorhandenem `ly` beides (§5.3). |
| `wpEdit` / `wpMarkMove` / `wpMarkDel` / `wpMarkAdd` | Haken: Silben-Anker mitnehmen bzw. verschmelzen / `o` (§6.5), im selben `'takes'`-Undo. |
| `wpQuant` / `wpRequant` / Zeitkarte, Dehnen (VS5b), G1 (`E.mpos`) | unverändert; Silben an `warpTime`/`E.mpos` gezeichnet und vorgespielt. |
| `wpPlay` / `wpRender` (Fassungs-Cache) | Eintrag merkt sich seine Karte (`map`); neu `tkHeardMap(id, a)` (nur lesend). Klang unverändert. |
| `tkExt().take` | Normalisierer `g9NormLy`. `tkExt().proc` **unverändert** (Text erzeugt keine Fassung). |
| `tkHeard` / `tkPlace`-Weg | Vorspielen (§6.7). |
| `undoPush` / `undoState` / `undoApply` / `wpUndone` | neue Art `'ly'` (§5.6); `wpUndone` + Wieder-Einsetzen aus `G9.auto` (§7.8). |
| `stStart` / `micStart` / `micTapGet`, `saveNow` | Haken „Aufnahme hat Vorrang“ (§6.6.10); `saveNow()` vor jeder Erkennung. |
| G2 (`#wpSheet.g2`, `g2Proc`, `take.pitch`) | schließen sich im Blatt gegenseitig aus; Tonhöhe ändert keine Zeiten → kein Einfluss. |
| G3 (`take.pre/post`, `g3PreOf/g3PostOf`) | Anlauf/Ausklang im Text-Modus sichtbar/bearbeitbar; Erkennung über den ganzen Take. |
| G4 (`g4Marks`, `g4MkSig`, Silben-Dynamik) | **kein** Einfluss: G9 schreibt nie `take.marks` und rät nie zu neuen Marken; Render bitgleich (G9-52). |
| G5 (`g5Analyse`) / G6 (Chor) | kein Berührungspunkt (Text nur am Lead-Take). |
| G7 (`g7Shift`) | kein Einfluss (Tonhöhe). |
| G8 (lange Takes) | Erkennung in Fenstern, Ausrichtung in Abschnitten; Text-Modus mit Nachführen. |
| VS4 Säubern (`clEnsure`, `take.cl`) | Erkennung/Merkmale auf `wpBase` (wie `wpDetect`). Ändert sich Säubern, bleibt der Text und rastet nach §5.1 neu ein; Merkmal-Cache neu. |
| VS-L (`vsCfg().mel`) / VS-P | kein Einfluss. |
| I4 (`take.tp`, `tipTakeTaps`) | wenn vorhanden und G9-55 bestanden: Tipps als Silben-Hinweis am Vokal-Einsatz (§6.3); sonst nichts. Haptik-Probe gemeinsam (I4-61 = G9-61). |
| I1 (Super-Regler-Feld in `#kbArea`) / I3 | kein Konflikt (G9 nutzt die Bildschirm-Tastatur, nicht `#kbArea`); Haptik-Befund gilt auch dort (§7.9). |
| I2 | kein gemeinsames Bauteil; ◀ ▶ in beiden Paketen eigenständig (so steht es in I2 §7). |
| T1 Taktarten (kommt) | G9 nimmt Takt-Angaben aus der vorhandenen Raster-Funktion; keine eigene 4/4-Annahme. |
| North / Bit Mask / K1 | kein Berührungspunkt. |
| VV1–VV3 (Video) | kein Einfluss (Text wird nicht gezeigt, F6). |
| `sw.js` | `vendor/g9/` ausgenommen (kein Vorab-Cache). |
| Online (Supabase-Projekt-JSON) | `ly` reist im Projekt mit (Format 5); kein neuer Aufruf. |

**Zusammenführungs-Hinweis:** `wpOpen`, `wpPaint`, `wpGest`, `wpView`, `wpDetect`, `tkSheet` sind von G1/G2/G3/G4/G8 schon geändert. G9 baut auf der
**Hauptlinie nach Zusammenführung von Nachtrag 4/5** (VS-L, VS-P, G1–G8). I4 ist keine Voraussetzung (Prüfung `typeof tipTakeTaps === 'function'`).

---

#### 9. Unterpakete, Zweige, Dauer, Budget

**Ausgangsstand:** Hauptlinie mit VS-L, VS-P, G1–G8. **Zweige (Regel 29):** **A** `g9-br-S` (Silben + Ausrichtung + Text-Operationen, DOM-frei,
Node-Korpus) · **B** `g9-br-E` (Erkennung: erst modellfrei, dann Bezug, Spike, Einbau) · **C** `g9-br-U` (Text-Modus gegen einen Stub von A). Danach
Zusammenführung A + B + C → G9d → G9e. Jede Stufe mit Changelog, Snapshot und „Bitte prüfen“ (Regel 22).

| Paket | Inhalt | Dauer | Budget (App) |
|---|---|---|---|
| **G9a** Silben & Ausrichtung | `g9Syl` (Muster-Module direkt, Gesang-Regeln, Vokalkern-Ersatz, Zahlen), `g9Feat` (+ `von`, Silben-Platz), `g9Align` (DP, lokal + ganz), `take.ly` + `g9NormLy` (`o`, nichts verwerfen), `g9View` (Neu-Einrasten), VS5b-Lesen/Umwandeln/Mitführen, Wort/Löschen/Einfügen, Verschieben/Verschmelzen/Trennen, Marken-Haken, Prüfliste + Korpus, Kosten-Abgleich | 9–11 h | +16 KB (+ Muster 79 KB gz nachgeladen) |
| **G9b-V** Erkennung ohne Modell | 16-kHz-Vorstufe, Stimm-Strecken, Verbinden + Zeit-Karte, Fenster-Regel, Rückrechnung, Schutz-Regeln; Tests mit erfundenen Wortlisten. Darf vor F0 laufen. | 2–2,5 h | +4 KB |
| **G9b-0** Bezug (Dirigent, nach F0) | Dateien laden, SHA-256 + Größen, `vendor/g9/` (Modell, Bibliothek, Laufzeit, Muster), Dateinamen der Bibliothek prüfen, Lizenzen | 0,5–1 h | – |
| **G9b-1** Mess-Spike (Node) | Node-Build der Bibliothek 4.3.2 (gleiche q8-Gewichte) auf K-G9: WER tiny/base DE/EN (small nur bei Bedarf), eigene Sprach-Erkennung (G9-29), Halluzination in Stille (G9-22), Silben auf richtiger Marke nach Erkennung, Zeit je Fenster, Token-Bewertungen ja/nein; 5 Phrasen gegen Chromium-WASM gegenprüfen. **Gate G9-21.** | 2,5–3,5 h | – |
| **G9b-2** Einbau (nur nach bestandenem Gate) | Lader (vendor → Ersatz, SHA-256, Cache, Fortschritt, Entfernen beider Sätze), Modul-Worker, Weg-Wahl, `wasmPaths`, Geräte je Modul, Stopp = `terminate`, „Aufnahme hat Vorrang“, `saveNow`, Diagnose-Zeile, Messungen G9-19…G9-28 | 6–8 h | +8 KB (+ ≈ 4–7 MB Laufzeit + ≈ 80–95 MB Modell nachgeladen) |
| **G9c** Text-Modus | **Tag 1: Geräte-Probe G9-61** (Probe-Seite von I4 + 2 Knöpfe + Höhen-Anzeige). Dann Leiste, Rahmen, Tipp → Vorspielen + Fokus, Treffer-Regel, Schreiben mit Vorschau, Ersetzen/Löschen/Einfügen, ◀ ▶, Werkzeuge, [Ganzer Text], [Erkennen]-Blatt (Modell-Zeile, Sprache, Schalter), automatische Erkennung, Haptik-Labels + Fokus-Rückgabe, Tastatur-Dock (Werte aus der Probe), Hilfe | 10–12 h | +14 KB |
| **G9d** Einbau | G1/G3/G8/Dehnen/Säubern/I4, Undo-Art `'ly'`, `wpUndone` + `G9.auto`, Fassungs-Cache-Karte + `tkHeardMap`, Mikrofon-Haken, ZIP/Kopien/Online, `sw.js`-Ausnahme, Test-API | 4–5 h | +3 KB |
| **G9e** Abnahme & Zusammenführung | Regel-28-Prüfung (Renders bitgleich), Regression VS5a/VS5b/G1–G8, M-PLATZ mit Tastatur, Fach-Prüfung, Geräte-Liste, „Bitte prüfen“ | 3–4 h | – |
| **Summe** | | **≈ 37–47 h** | **≈ +45 KB** App; Rest nur bei Bedarf |

Mit drei Zweigen ≈ 18–24 h Kalenderzeit (A 9–11 h ‖ B 11–15 h ‖ C 10–12 h, dann G9d + G9e).
**Stopp-Punkt 1 (keine Freigabe F0):** B endet nach G9b-V. A und C werden fertig; [Erkennen] und das Erkennen-Blatt fehlen (Kopf-Taste ausgeblendet),
alles andere geht.
**Stopp-Punkt 2 (Gate G9-21 verfehlt):** Der Einbau G9b-2 entfällt. Xander bekommt die Tabelle tiny/base/(small) × DE/EN mit Zeiten und entscheidet
(F2). A und C werden wie bei Stopp-Punkt 1 fertig.
**Go/No-go G9c Tag 1 (G9-61):** Das Ergebnis der Geräte-Probe legt fest, ob die Haptik-Labels bei offener Tastatur aktiv sind, und liefert die
Dock-Höhen. Ohne Antwort baut C mit den geschätzten Höhen und mit Labels nur ohne Tastatur.

---

#### 10. Abnahme

Alle Punkte mit echten Läufen. Chromium-Tests mit Takes aus dem Korpus (K-G9), Berührungen über CDP `Input.dispatchTouchEvent`, Tasten über
`Input.dispatchKeyEvent`/`insertText`, Tastatur über `g9KbSim(h)`. Gerätepunkte (G9-6x) am iPhone 12 Pro Max, **ohne Rechner messbar** (Xander hat
keinen): Probe-Seite, Diagnose-Zeile `?g9diag=1`, Bildschirmfotos.

**G9a — Silben und Ausrichtung**
- [ ] **G9-01** Silbentrennung (M-SILBE) mit den Muster-Modulen direkt: Prüfliste 500 deutsche Song-Wörter (inkl. „A-bend“, „Feu-er“, „ge-ehrt“,
  „Lie-be“, „Sehn-sucht“, „Ge-dan-ken“) → Anzahl ≥ 98 %, Grenzen ≥ 95 %; 500 englische (inkl. „lit-tle“, „wan-ted“, „love“, „fire“, „ev-ery“) →
  Anzahl ≥ 95 %. Nutzer-Bindestriche werden unverändert genommen (100 %). Gleiches Ergebnis im Haupt-Faden und im Worker (100 %).
- [ ] **G9-02** Ausrichtung mit richtigem Text (M-AUSR, K-G9 mit Silben-Einsätzen): ≥ 92 % der Silben auf der richtigen Marke (= erkannte Marke, die
  dem wahren Einsatz am nächsten liegt, ±60 ms); Median |Lage − wahrer Einsatz| ≤ 25 ms für Silben mit eigener Marke.
- [ ] **G9-03** Melisma: Silbe über 3 Ton-Marken gehalten → die folgenden Silben verschieben sich nicht (≥ 90 % von 40 Fällen). VS5b-„von links“
  läge im selben Fall falsch (Vergleich im Changelog).
- [ ] **G9-04** Verschmelzen: 30 Fälle mit nur einem Einsatz für zwei Silben („ge-ehrt“, schnelles „ist ein“) → beide Silben auf einer Marke, der
  Rest unverschoben (≥ 90 %).
- [ ] **G9-05** Zeilen: eingefügter Text mit 8 Zeilen auf einem Take mit 8 Atempausen ≥ 300 ms → jede Zeile beginnt an der Marke nach der Pause
  (8/8).
- [ ] **G9-06** Getipptes Wort (§6.4): Auf dem Korpus wird jedes 2- und 3-silbige Wort an seinem richtigen ersten Abschnitt getippt → alle Silben
  richtig ≥ 90 %; Vorschau = Ergebnis nach der Leertaste (100 %).
- [ ] **G9-07** Verschieben/Verschmelzen/Trennen (Tabellen-Tests, je 10 Fälle, **davon je 3 mit Melisma bzw. reinen Ton-Marken dazwischen**):
  „‹ Silbe“ × 2 = zwei Silben-Plätze nach links (Ton-Marken übersprungen, keine Silbe landet auf einer reinen Ton-Marke); Kollision → verschmolzen;
  „Silbe ›“ löst eine Verschmelzung; Trennen ohne freien Platz → grau + Toast, nichts geändert, kein Rat zu Marken; je Druck genau ein Undo;
  Undo/Redo deep-equal.
- [ ] **G9-08** Marken-Haken: Marke verschieben → ihre Silben folgen (gleiche Anzeige-Lage ±0,6 px), ein Undo stellt Marke **und** Silben her. Marke
  löschen → Silben verschmolzen mit der vorigen; Marke löschen neben einer Marke mit 3 Silben → Überzahl `o`, **0 Silben verloren**. Marke setzen →
  keine Silbe bewegt.
- [ ] **G9-09** Rechenzeit: ganze Ausrichtung 64 Takte (≈ 300 Marken × 250 Silben) ≤ 60 ms im Worker (Chromium, 4× Drossel ≤ 240 ms); lokale
  Wort-Ausrichtung ≤ 1 ms.
- [ ] **G9-10** Überzahl bleibt: 300 Silben auf 250 Marken → 50 Silben `o`, rot gezeigt; Speichern → Laden deep-equal (auch ZIP, Duplizieren);
  `g9NormLy` auf eine Datei mit 5 Silben je Marke und fallenden Zeiten → 0 Silben verloren, Lesereihenfolge gleich.
- [ ] **G9-11** Wort löschen / einfügen (je 10 Fälle): Löschen entfernt genau die Silben des Worts, der folgende Text bleibt auf seinen Marken (0 Silben
  verschoben); Einfügen eines 2-silbigen Worts vor Abschnitt k → erste Silbe auf k, alle folgenden +2 Silben-Plätze; je ein Undo; Undo/Redo deep-equal.
- [ ] **G9-12** Ohne Muster (Vokalkern-Regel): Silben-Anzahl DE ≥ 90 %, EN ≥ 85 % auf der Prüfliste; Silben tragen `p: 0,5`; Info-Zeile zeigt den
  Hinweis.

**G9b — Erkennung**
- [ ] **G9-19** Laden aus `vendor/g9/` (Chromium und iPhone): Bibliothek (`transformers.min.js`), Laufzeit des gewählten Wegs und Modell kommen
  vom eigenen Server; danach **offline** (Netz aus): zweite Erkennung lädt alles aus `synq-g9-v1`; kein Abruf an jsDelivr oder die Modell-Ablage
  (M-NETZ). Worker ohne Konsolen-Fehler; `wasmPaths` zeigt auf den gewählten Weg.
- [ ] **G9-20** Zeiten (M-ZEIT-SM): 16-Takt-Take (32 s, 120 BPM) mit geladenem Modell: iPhone 12 Pro Max WASM ≤ 45 s, WebGPU (falls vorhanden)
  ≤ 15 s; Chromium WASM 1 Kern ≤ 25 s; Modell-Start aus dem Cache (neuer Worker) ≤ 5 s (iPhone). `g9Recognize` meldet ⌈L/30 s⌉ ≤ `chunks` ≤
  ⌈L/24 s⌉ (L = Länge der verbundenen Stimm-Strecken). Je Modellgröße tiny/base (small nur WebGPU), im Changelog.
- [ ] **G9-21** Güte-Gate (M-WER, K-G9-sauber), **zuerst im Spike G9b-1**: „base“ erreicht WER ≤ 30 % (DE) und ≤ 25 % (EN). Sonst Stopp-Punkt 2
  mit Tabelle tiny/base/small × DE/EN × Zeit an Xander. Zusätzlich: Anteil der Silben auf richtiger Marke nach Erkennung (nur richtig erkannte
  Wörter) ≥ 85 %. Nach dem Einbau: 5 Phrasen in Chromium-WASM gegen den Spike → gleiche Wörter ≥ 95 %.
- [ ] **G9-22** Schutz gegen Erfundenes: 60 s Stille + Atmer + Übersprechen der Musik −30 dB → 0 erfundene Wörter; Wiederholungs-Schleife (≥ 3
  Wörter, > 2×) wird auf 2× gekürzt (10 künstliche Fälle).
- [ ] **G9-23** Laden: **kein Abruf von Modell- oder Laufzeit-Dateien** vor dem Tipp auf [Laden und erkennen] (M-NETZ, ganzer App-Start + 3 min
  Bedienung; Muster-Abrufe beim Öffnen des Text-Modus sind erlaubt und gezählt). App-Start ± 3 % gegen ohne G9. SHA-256-Fehler → Abbruch mit
  Meldung. [Entfernen] gibt den ganzen Cache frei (`storage.estimate().usage` sinkt um ≥ 95 % der angezeigten Größe), auch mit zwei Sätzen.
- [ ] **G9-24** Speicher (Chromium): Spitze während einer 5-min-Erkennung ≤ 600 MB (`performance.measureUserAgentSpecificMemory`); kein
  Speicher-Wachstum über 3 Erkennungen > 10 %. Gerät: G9-63.
- [ ] **G9-25** Datenschutz: während der Erkennung nur GET-Abrufe der Liste in §4.5; 0 Bytes Upload (M-NETZ in Chromium; am iPhone `g9Net()` in
  der Diagnose-Zeile).
- [ ] **G9-26** Verbindung: Online-Speichern während eines laufenden Modell-Downloads ≤ 2× der Zeit ohne Download; kein Fehler im Abgleich.
- [ ] **G9-27** Klang während Erkennung: 3 min Song mit ▶ und laufender Erkennung → M-EINBRUCH 0 Aussetzer, M-KLICK ohne Befund (iPhone und
  Chromium mit 4× Drossel). Sonst greift die Pause bei ▶, und der Test wird damit wiederholt.
- [ ] **G9-28** Lange Takes (G8) und Stopp: 5-min-Song-Take → Erkennung in Fenstern, Fortschritt steigt monoton. **[Stopp] → Worker beendet und
  „gestoppt“ sichtbar ≤ 0,5 s**, Wörter fertiger Fenster bleiben und werden ausgerichtet. Nächstes [Erkennen] startet einen neuen Worker. Kein
  Haupt-Faden-Task > 50 ms.
- [ ] **G9-29** Sprache mit eigener Erkennung (§6.6.4): 10 DE- und 10 EN-Phrasen mit „Auto“ → ≥ 19/20 richtige Sprache (im Spike gemessen, nach dem
  Einbau gegengeprüft). Kein Fenster läuft ohne gesetzte Sprache (Spion auf `generate`). Ein Take mit fester Wahl [EN] wird englisch getrennt.

**G9c — Text-Modus**
- [ ] **G9-30** Tipp (M-TIPP-AB): Rahmen im selben Bild (≤ 16,7 ms), Vorspiel-Start ≤ 30 ms nach dem Tipp (+ Ausgabe-Verzögerung). Gespielter
  Bereich = [warp(tₖ), warp(tₖ₊₁)) ±1 ms (`g9PlayLog`), bei A/B der Roh-Take, > 4 s gekappt, Blenden 5 ms (M-KLICK ohne Befund). **Tipp direkt
  nach Quantisieren**, solange die neue Fassung rechnet → Bereich nach der Karte des gelieferten Puffers (vorige Karte bzw. Quell-Zeiten),
  hörbar die richtige Silbe (gleiche Hüllkurve ±1 ms).
- [ ] **G9-31** Schreiben: erster Tastendruck → Einrast-Puls und Vorspielen; „Liebe“ + Leertaste → „Lie|be“ auf den richtigen zwei Abschnitten,
  Rahmen auf dem nächsten, der spielt; Bindestrich → nächste Silbe; Eingabe-Taste „Weiter“ = übernehmen + nächster Abschnitt, Fokus bleibt;
  Fokus-Verlust („Fertig“ simuliert per `blur`) → geändertes Wort übernommen, Dock → Blatt ohne Sprung. Tastendruck-Handler Median ≤ 2 ms,
  Max ≤ 6 ms (4× Drossel).
- [ ] **G9-32** Ersetzen: falsches 2-silbiges Wort durch ein 3-silbiges → verschmolzen + Hinweis; [Nachrücken] → Rest einen Silben-Platz rechts; je
  ein Undo; Toast „alt → neu“ mit [Rückgängig].
- [ ] **G9-33** Undo-Zählung: 10 Wörter, 1 Einfügen (Ganzer Text), 1 Wort löschen, 1 Wort einfügen ([+]), 2 Verschieben, 1 Verschmelzen, 1
  Trennen, 1 Erkennen → genau 18 Schritte; alle zurück = `S.takes` deep-equal zum Anfang; alle vor = deep-equal zum Ende; „geändert“-Punkt nach
  jedem Schritt sofort.
- [ ] **G9-34** Fokus und Haptik-Label: Tipp auf Wellenform/Leiste/◀/+/▶/Werkzeug bei offener Tastatur → nach **jedem** Label-Klick ist
  `document.activeElement === g9Field` (`g9HapLog`), Tastatur bleibt offen (Chromium: kein `blur`; iPhone: G9-61). Genau ein Label-Klick je Tipp,
  keiner nach Ziehen, keiner bei `UI.haptics` aus, keine Label-Schicht im Marken-Modus. Die eigene Klick-Behandlung des Ziels läuft genau einmal.
- [ ] **G9-35** M-PLATZ ohne Tastatur in 390 × 844, 375 × 667, 320 × 568, 844 × 390, 667 × 375, 926 × 428 und 428 × 926: alle Tasten ≥ 44 × 44,
  Feld ≥ 140 px, Leiste 44 hoch, Wellenform ≥ Mindesthöhe (§7.2), Texte nicht abgeschnitten (`scrollWidth ≤ clientWidth`, echte Schrift; lange
  Namen nur, wo sie passen), P3 in zwei Zeilen, Blatt-Höhe gleich wie Marken-Modus (± 0 px beim Umschalten [Text]).
- [ ] **G9-36** M-DOCK mit Tastatur (`g9KbSim` mit den Höhen aus G9-61, ersatzweise aus §7.10; hoch und quer, quer auch 118 und 88 px): Dock
  vollständig über der Tastatur, alle Treffer ≥ 44 × 44, Feld ≥ 140 px breit, Leiste mit Hüllkurve sichtbar, Dokument-Scroll 0, App-Raster
  unverändert (Höhen der Zeilen ± 0 px), Rückkehr ohne Sprung.
- [ ] **G9-37** Schmale Abschnitte (Treffer-Regel §7.2): (a) 18-px-Abschnitt zwischen zwei 80-px-Abschnitten → Tipps an 9 Stellen innerhalb ±22 px
  um seine Mitte wählen ihn (9/9); (b) fünf benachbarte 18-px-Abschnitte → ein Tipp ±8 px um jede Mitte wählt genau diesen (5/5); (c) ◀ ▶ erreichen
  jeden Abschnitt der Reihe nach und spielen ihn. Zoom-Regel: öffnet höchstens eine Stufe feiner als der Marken-Modus, nie feiner als 1 Takt.
- [ ] **G9-38** Automatische Erkennung (F1): neuer Take mit Modell im Cache → Text erscheint ohne Bedienung; Undo der Aufnahme entfernt Take und
  Text; Undo eines späteren Quantisierens lässt den erkannten Text stehen; Tippen vor dem Ergebnis → Ergebnis verworfen, getippter Text bleibt; mit
  „aus“ geschieht nichts.
- [ ] **G9-39** Schließen auf jedem Weg: ✕, [Text], Szenenwechsel, Stopp, Ansichtswechsel, Take gelöscht → Text-Modus/Dock weg, Vorspielen endet
  (Blende), Tastatur zu, keine Konsolen-Fehler.

**G9d — Zusammenspiel, Daten, Regel 28**
- [ ] **G9-50** Alte Projekte: Projekt aus 4.21–4.25 mit VS5b-`lyrics` und ohne → Laden + Speichern **Zeichen für Zeichen** gleich (ohne Bedienung).
  Der Text-Modus zeigt VS5b-Text pixelgleich zu `wpPaint` (VS5b); der N7V-30-Test bleibt unverändert grün; die erste Änderung wandelt in `ly` um
  (ein Undo).
- [ ] **G9-51** Speichern → Laden deep-equal mit `ly` (inkl. `j`, `o`, `p`, `u`, `w: 2`), auch über ZIP (P1), Duplizieren, Online-Projekt;
  `lyrics` = Klartext von `ly`; Vorgänger-Version öffnet ohne Fehler; Undo-Art `'ly'` stellt `ly` **und** `lyrics` her.
- [ ] **G9-52** Klang bitgleich (M-BITGLEICH): Für Takes mit Zeitkarte (Scheiben, Dehnen), G2-Tonhöhe, G7 +2, G4 an (Silben-Dynamik) und
  Säubern ist die gehörte Fassung (`wpPlayed`/`tkHeard`) vor und nach jeder G9-Aktion bitgleich; `take.marks` nach G9-Aktionen unverändert (bzw.
  fehlt weiter).
- [ ] **G9-53** Folgen: Quantisieren 1/16 100 % → jede Silbe am Ziel ihrer Marke (≤ 0,6 px, wie N7V-30); Dehnen ↔ Scheiben; G2 +3 Halbtöne; G7;
  G3-Auftakt-Silben vor dem Clip sichtbar und spielbar; Song-Stück (`vox`) mit `in` > 0 zeigt die richtigen Silben.
- [ ] **G9-54** Neu-Einrasten (§5.1): Säubern 0 → Maximum auf K-G9 (Marken werden neu erkannt) → ≥ 95 % der Silben haben wieder eine Marke, 0 Silben
  verloren, feste Silben unverändert (`t` gleich, ggf. „ohne Marke“). Laden + Speichern ohne Bedienung danach Zeichen für Zeichen gleich.
- [ ] **G9-55** Tipps (K-G9-tipps, synthetisch, §11): Ausrichtung mit Tipps ≥ 3 Punkte besser als ohne (G9-02-Maß). Sonst bleibt der Tipp-Kosten-Teil
  aus (Changelog). Unabhängig davon, ob I4 schon gebaut ist.
- [ ] **G9-56** Aufnahme hat Vorrang (Chromium, 4× Drossel, Mikro-Ersatz): 3 Takes direkt hintereinander mit F1 an → bei jedem Mikrofon-Start ist
  der Erkennungs-Worker binnen 100 ms beendet (`g9Info().hold`), 0 Aussetzer-Marken (VS1) in allen 3 Takes, danach werden alle 3 erkannt
  (fertige Fenster nicht doppelt gerechnet); `saveNow` vor jeder Erkennung aufgerufen (Spion). Gilt auch für Mikro-Check und Stimme-FANG.
- [ ] **G9-57** Undo-Fußabdruck: 5-min-Take (≈ 1200 Silben), 60 Wörter getippt → Summe der Undo-Schnappschüsse ≤ 4 MB (zum Vergleich im Changelog:
  dieselben 60 Schritte als `'takes'`).

**Gerät (Xander am iPhone 12 Pro Max, ohne Rechner)**
- [ ] **G9-60** Erkennen am Gerät: Weg (WebGPU/WASM) und Zeit für einen 16-Takt-Take aus der Diagnose-Zeile im Changelog; Ergebnis von Xander
  beurteilt („Bitte prüfen“ 1).
- [ ] **G9-61** Geräte-Probe **am ersten Tag von G9c** (gemeinsam mit I4-61, eine Seite in der Werkstatt): iOS-Version; Tick bei echtem Label-Tipp;
  **Label-Tipp bei fokussiertem Textfeld: Tastatur bleibt offen ja/nein**; Label über einer Leinwand; Code-Klick (`haptic('snap')`) fühlbar; die Seite
  zeigt `visualViewport.height` bei offener Tastatur hoch und quer (Xander schickt ein Bildschirmfoto). Ergebnis = Go/No-go für die Labels im Dock
  und Werte für `g9KbSim`.
- [ ] **G9-62** Dock am Gerät nach dem Bau, hoch und quer, mit echter Tastatur (inkl. Vorschlagsleiste): alles im Bild, keine Bewegung der Seite
  (Bildschirmfotos).
- [ ] **G9-63** Speicher am Gerät: 3 Erkennungen hintereinander (davon eine 5-min-Song-Take) → kein Neuladen des Tabs; Werte der Diagnose-Zeile
  (WASM-Speicher, Modell-Bytes, Abrufe, Upload 0) im Changelog.
- [ ] **G9-64** Aufnahme nach Erkennung am Gerät: 3 Takes in Folge mit F1 an → keine Aussetzer-Marke, kein Neuladen, alle 3 danach erkannt.

---

#### 11. Messverfahren

Vorhandene Verfahren gelten unverändert: **M-PLATZ**, **M-CPU**, **M-NULL**, **M-EINBRUCH**, **M-KLICK**, **M-ZEIT**, das VS2-Korpus-Werkzeug und
**M-PROBE** aus I4 (hier um zwei Knöpfe und die Höhen-Anzeige erweitert). Neu:

| Kürzel | Name | Definition |
|---|---|---|
| **K-G9** | Prüfkorpus | (a) öffentlicher mehrsprachiger Gesangs-Datensatz mit Phonem-Zeiten (z. B. GTSinger, Lizenz CC BY-NC-SA, **nur Test**, nie im Repo/in der App; Bezug nach F0, §4.6): 40 Phrasen DE, 40 EN; Silben-Einsätze aus den Phonem-Grenzen (erster Laut der Silbe), Vokal-Einsätze (erster Vokal-Laut). (b) **Xanders eigene** Takes (F7): 10 Zeilen DE, 10 EN mit Text, privat unter `S/korpus-g9/`. (c) abgeleitete Fälle: Melisma (Silbe über 3 Töne), Verschmelzung (Einsatz entfernt), Stille/Atmer/Übersprechen −30 dB. „K-G9-sauber“ = (a)+(b) ohne Übersprechen. „K-G9-tipps“ = (a) mit **synthetischen Tipps**: je Silbe ein Tipp am wahren Vokal-Einsatz + gleichverteilt ±25 ms Streuung, Tipp-Dauer 80 ms. Ohne F7 fehlt (b); alle Punkte sind mit (a)+(c) messbar. |
| **M-SILBE** | Silben | Prüfliste (eigene, 2 × 500 Wörter, gesungene Trennung von Hand, im Repo als Test-Daten ohne Fremdtexte); Vergleich Anzahl und Grenzen je Wort; einmal mit Mustern, einmal mit Vokalkern-Regel. |
| **M-AUSR** | Ausrichtung | Je Silbe: richtige Marke = Marke mit kleinstem Abstand zum wahren Einsatz (±60 ms, sonst „keine richtige Marke“ → die Silbe zählt nur für Verschmelz-Fälle); Quote richtig, Median |Fehler|. Text = Referenz (G9-02) bzw. Erkennung (G9-21, nur richtig erkannte Wörter). |
| **M-WER** | Wortfehler | Standard-WER (Ersetzen + Löschen + Einfügen) / Referenzwörter, nach Normalisierung: klein, Satzzeichen weg, Zahlen als Wörter, Umlaute bleiben, Apostroph-Formen vereinheitlicht. Je Sprache getrennt, Mittel über Phrasen gewichtet nach Wortzahl. |
| **M-SPIKE** | Mess-Spike | Node 22, Node-Build der Bibliothek 4.3.2 (`transformers.node.mjs`, Laufzeit onnxruntime-node 1.30.0, CPU), dieselben q8-Gewichte und dieselbe Vorstufe/Fenster-Regel wie in der App (Code aus G9b-V); M-WER, M-AUSR, Sprache, Zeit je Fenster; Gegenprobe 5 Phrasen in Chromium-WASM (gleiche Wörter ≥ 95 %). |
| **M-ZEIT-SM** | Erkennungszeit | Zeit von [Erkennen] bis Ergebnis (Modell im Cache; Worker warm bzw. neu getrennt), Median aus 3 Läufen; Take-Länge, stimmhafte Länge L und `chunks` angegeben. |
| **M-NETZ** | Netz | Chromium: CDP `Network.*` (URL, Methode, Upload-Bytes). iPhone: `g9Net()` in der Diagnose-Zeile (alle Abrufe der Erkennung laufen über den G9-Lader und werden dort gezählt; Upload-Bytes aus den Anfragen). |
| **M-SPEICHER** | Speicher | Chromium: `performance.measureUserAgentSpecificMemory()` alle 2 s während der Erkennung, Spitze. iPhone: kein Neuladen über 3 Erkennungen + Werte der Diagnose-Zeile (kein Web-Inspektor nötig). |
| **M-TIPP-AB** | Tipp → Bild/Ton | CDP-Touch mit Zeitstempel; Bild: `requestAnimationFrame`-Mitschnitt bis der Rahmen gezeichnet ist; Ton: `g9PlayLog().t` (geplante `currentTime`) − Tipp-Zeit (Uhren-Brücke wie I4 M-UHR). |
| **M-DOCK** | Tastatur-Lage | `g9KbSim(h)` setzt eine simulierte `visualViewport`-Höhe (Werte aus G9-61). Messung wie M-PLATZ + Dokument-Scroll + Zeilenhöhen des App-Rasters vor/nach. Am iPhone: Bildschirmfotos hoch/quer mit Vorschlagsleiste. |
| **M-BITGLEICH** | Klang | `wpPlayed(id, 0, n)` bzw. `tkHeard` als Zahlen vor/nach; SHA-256 der Float32-Bytes gleich. |

---

#### 12. Risiken

- **Kein Zugang zu Modell und Korpus** (Proxy sperrt die Modell-Ablage) → Schritt 0 mit einmaliger Freigabe (F0); ohne Freigabe Stopp-Punkt 1,
  Text-Werkzeuge kommen trotzdem.
- **Erkennung bei Gesang zu ungenau** („base“ schon bei Sprache > 15 % WER; Vibrato, gedehnte Vokale, Synthpop-Aussprache) → Spike **vor** dem
  Einbau (G9b-1), Gate G9-21, Stopp-Punkt 2. Einfügen/Tippen geht ohne Modell; feste Silben schützen Korrekturen; Löschen/Einfügen räumt Fehler weg.
- **Bibliothek/Laufzeit:** Die Bibliothek ist auf eine Entwickler-Version der Laufzeit festgelegt. G9 nimmt genau diese, selbst gehostet, mit
  ausdrücklichen `wasmPaths` und Prüfsummen (G9-19). Ein Update der Bibliothek ist ein eigener, gemessener Schritt.
- **Safari-Grenzen:** WebGPU auf A14 unsicher, WASM nur einkernig (keine Isolation auf Pages), Speicherdruck im Tab → Weg-Wahl zur Laufzeit,
  600-MB-Grenze, `saveNow` vor jeder Erkennung, Erkennung hält bei jeder Aufnahme an, ehrliche Meldung statt stillem Ausweichen. Zeiten sind
  Schätzungen [S] → G9-20.
- **Pages und große Dateien:** einzelne Dateien bis ≈ 55 MB, kein LFS möglich; Repo wächst um ≈ 120 MB (beide Encoder + Decoder) → einmalig, im
  Changelog; ob Pages `.wasm` packt, misst G9b-2.
- **Speicher-Löschung nach 7 Tagen** → Modell lädt erneut (80–100 MB); Anzeige im Erkennen-Blatt.
- **Haptik:** Der Code-Tick wirkt ab iOS 26.5 nicht mehr; das Label könnte die Tastatur schließen → Probe am ersten Tag von G9c (G9-61) mit
  Rückfall „Labels nur ohne Tastatur“; Ersatz sichtbar + hörbar; Tastatur-Feedback des Systems.
- **Tastatur-Dock auf iOS** (Seite scrollt beim Fokus, `visualViewport`-Sprünge, Vorschlagsleiste, quer nur ≈ 120 px) → fixes Dock, `preventScroll`,
  Rücksetzen, Quer-Dock 118/88 px, echte Höhen aus der Probe vor dem Bau.
- **Wort-Zeiten:** Im WebGPU-Weg waren sie früher lückenhaft [W2] → Decoder immer im WASM-Teil (§4.4); fehlen sie trotzdem, Ausrichtung nur nach Text
  (Kosten ohne τ); im Changelog.
- **Undo-Tiefe:** `UNDO_MAX = 60`. Wer einen ganzen Song Wort für Wort tippt, kann danach die Aufnahme selbst nicht mehr rückgängig machen (wie bei
  jeder anderen Folge von 60 Aktionen). Die Art `'ly'` hält den Speicher klein (G9-57). Mehrere Wörter in einem Zug als **einen** Schritt zu zählen,
  wäre eine Abweichung von Regel 8 und geschieht nur auf Xanders Wort (nicht gebaut).
- **Lizenzen/Namen:** Modell (MIT), Bibliothek (Apache-2.0), Laufzeit (MIT), Muster (MIT bzw. freie Lizenz) → Hinweise in `vendor/g9/LIZENZEN.txt`;
  Fremddateien bleiben unverändert (Ausnahme Regel 24); Test-Korpus nur privat.
- **Zusammenführung:** `wpOpen/wpPaint/wpGest` sind von G1/G2/G3/G4 schon geändert → Bau auf der zusammengeführten Linie, Regression VS5a/VS5b/G1/G2.
- **Download auf Mobilfunk** (80–100 MB) → Größe vorher, „WLAN empfohlen“, Abbrechen jederzeit.

---

#### 13. Fragen an Xander (nur echte; ohne Antwort wird die Vorgabe gebaut)

- **F0 Freigabe (Bitte, einmalig, ≈ 2 Minuten):** Damit ich das Sprachmodell und Test-Gesang holen kann, erlaube bitte in den Einstellungen der
  Cloud-Umgebung (Titelleiste der Sitzung → Umgebung → Bearbeiten → Netzwerkzugriff → Erlaubte Domains) `huggingface.co` und `*.hf.co`. Danach
  kannst du es wieder entfernen; die App braucht es nie. **Ohne Freigabe:** Text einfügen, tippen und korrigieren kommen trotzdem, nur [Erkennen]
  nicht.
- **F1 Automatisch erkennen:** Soll jede neue Gesangsaufnahme von selbst erkannt werden, sobald das Sprachmodell einmal geladen ist (nie während
  einer Aufnahme)? **Vorgabe:** ja, im Hintergrund, abschaltbar im Erkennen-Blatt.
- **F2 Größeres Modell:** Das „mittlere“ Modell (≈ 80–100 MB) ist die Vorgabe. Ein größeres (≈ 150–250 MB) erkennt besser, ist auf deinem iPhone aber
  nur mit WebGPU schnell genug. **Vorgabe:** nur das mittlere; das größere biete ich dir erst an, wenn die Messung (G9-21) zeigt, dass es ≥ 10 Punkte
  besser und höchstens doppelt so langsam ist.
- **F3 Tipp auf die Wellenform, während der Song läuft:** **Vorgabe:** ▶ hält an, dann spielt der Abschnitt. Oder: nur wählen und nichts vorspielen,
  solange ▶ läuft?
- **F4 Vorspielen beim Schreiben:** **Vorgabe:** einmal je Silbe (beim ersten Buchstaben und bei jedem Weiterspringen). Oder in Schleife, bis du zur
  nächsten Silbe gehst?
- **F5 Haptik:** Safari erlaubt auf aktuellen iPhones den Tick nur bei echten Fingertipps auf die Seite (Wellenform, ◀ ▶), nicht beim Tippen auf
  der Tastatur. **Vorgabe:** Tick bei Tipps (wenn die kurze Probe zeigt, dass die Tastatur dabei offen bleibt), beim Schreiben der Tastatur-Tick
  des iPhones (Einstellung „Tastaturfeedback → Haptik“) plus sichtbares Einrasten und Vorspielen. Passt das?
- **F6 Wo der Text noch erscheinen soll:** **Vorgabe:** nur im Marken-Editor (Text-Modus). Möchtest du ihn später auch in der Song-Ansicht unter der
  STIMME-Spur, über den Noten (G2) oder als Karaoke-Zeile im Video sehen? (Jeweils ein eigenes kleines Paket.)
- **F7 Testmaterial:** Damit die Erkennung an **deiner** Stimme gemessen wird: Kannst du 10 kurze Zeilen auf Deutsch und 10 auf Englisch einsingen
  und den Text dazuschreiben? **Vorgabe:** ohne deine Aufnahmen messe ich nur mit öffentlichem Testmaterial (nicht im Projekt, nicht in der App).
- **F8 Zwei Silben auf einer Marke trennen, ohne den Klang zu ändern:** Wenn die Analyse den Anfang einer Silbe nicht findet, liegen zwei Silben
  auf einer Marke (wie du es beschrieben hast). Eine neue Marke würde Quantisierung und Silben-Dynamik ändern. **Vorgabe:** sie bleiben zusammen.
  Oder möchtest du einen reinen **Text-Trennpunkt** (dünne Linie, nur für die Beschriftung, ändert nichts am Klang)?

#### 14. Bitte prüfen (Xander am iPhone)

0. Vorab (2 Minuten, gleiche Seite wie bei den Tipp-Summen): Probe-Seite öffnen, Knöpfe antippen, sagen, wo du einen Tick spürst und ob die Tastatur
   offen bleibt; ein Bildschirmfoto hoch und quer mit offener Tastatur schicken.
1. Marken-Editor → [Text] → [Erkennen]: Wie lange dauert es (Zahl in der Info-Zeile), und wie viele Wörter stimmen?
2. Tipp auf die Wellenform: Hörst du genau die Silbe bis zur nächsten Marke? Fühlst du einen Tick?
3. Ein falsches Wort antippen und ein zweisilbiges Wort darüber schreiben: Landen die Silben richtig? Hörst du beim Losschreiben den Abschnitt?
4. Ein erfundenes Wort löschen (antippen, Feld leeren, Leertaste) und ein fehlendes einfügen (Wort tippen, [+]): verständlich?
5. Text ab hier [‹ Silbe] zweimal: Rückt alles richtig nach? [Verschmelzen] / [Trennen]: verständlich?
6. [Ganzer Text]: deinen Songtext einfügen – wie viele Silben musstest du danach noch verschieben?
7. Querformat mit offener Tastatur: Ist alles erreichbar, verdeckt die Tastatur nichts, siehst du die Leiste mit der Wellen-Hüllkurve?
8. Erkennen-Blatt: Sind „Sprachmodell auf diesem Gerät … [Entfernen]“, die Sprach-Wahl und „Neue Aufnahmen automatisch erkennen“ an der richtigen
   Stelle?
9. Namen: „Text“, „Erkennen“, „Ganzer Text“, „Text ab hier ‹ Silbe / Silbe ›“, „Verschmelzen“, „Trennen“, „+“ (Wort einfügen), „Lücken füllen“,
   „Alles ersetzen“, „Laden und erkennen“, „Sprachmodell“ – passen sie?

**Fragen-Kurzliste für den Changelog:** F0 Freigabe · F1 automatisch · F2 Modellgröße · F3 Tipp bei ▶ · F4 einmal/Schleife · F5 Haptik · F6 weitere
Orte · F7 Testmaterial · F8 Text-Trennpunkt — jeweils mit der Vorgabe aus §13.

---

#### Quellen (kurz, eigene Worte)

- **[W1] Web-Speech-Schnittstelle:** Entwurf mit `processLocally` und `start(MediaStreamTrack)` (Community-Gruppe, noch Entwurf;
  [Spezifikation](https://webaudio.github.io/web-speech-api/), [Mozilla dev-platform](https://groups.google.com/a/mozilla.org/g/dev-platform/c/6f4l8P9hO6o),
  [W3C-Liste April 2025](https://lists.w3.org/Archives/Public/public-webapps-github/2025Apr/0450.html)); Safari: `webkitSpeechRecognition` seit 14.1/14.5,
  Siri muss an sein ([Addpipe](https://blog.addpipe.com/apple-speechanalyzer-api/), [technetexperts](https://www.technetexperts.com/ios-safari-speechrecognition-not-working/)).
- **[W2] Bibliothek und Laufzeit (selbst in den npm-Paketen nachgelesen, 31.10.):** `@huggingface/transformers` 4.3.2 (Apache-2.0).
  `package.json` legt `onnxruntime-web` auf **1.31.0-dev.20260914-8d85527a0** fest. `dist/transformers.web.min.js` (456 110 B / 127 921 B gz) hat
  nackte Importe `onnxruntime-web/webgpu` und `onnxruntime-common`. `dist/transformers.min.js` (587 917 B / 170 477 B gz) bündelt die Laufzeit
  (Versionszeichen 1.31.0-dev.20260914-8d85527a0) und lädt nur die `.mjs`/`.wasm` nach. Ohne `wasmPaths` nimmt sie
  `https://cdn.jsdelivr.net/npm/onnxruntime-web@<Version>/dist/ort-wasm-simd-threaded.asyncify.*`, die schlichte Fassung nur bei Safari < 26 ohne
  WebGPU. Weiter: `_retrieve_init_tokens`: ohne Sprache Warnung und Englisch (keine Spracherkennung); `generate()`: `prompt_ids` auskommentiert,
  `decoder_input_ids` als Präfix angenommen und als `num_input_ids` an `_extract_token_timestamps` weitergereicht; `_generate_with_seek` füllt jedes
  Stück auf 3000 Rahmen (30 s) auf; Wort-Zeiten über `alignment_heads` + DTW. `onnxruntime-web@1.31.0-dev.20260914-8d85527a0` (MIT, npm):
  Dateigrößen in §4.4 selbst gemessen (gz -9). Wort-Zeiten im WebGPU-Weg früher lückenhaft
  ([Issue #820](https://github.com/huggingface/transformers.js/issues/820), [whisper-web #17](https://github.com/xenova/whisper-web/issues/17)).
- **[W3] Geschwindigkeit/Größe im Browser:** kleinstes Modell (englisch), WASM, ein Kern: 30 s ≈ 9 s, 60 s ≈ 16 s, ≈ 40 MB
  ([browser-whisper-benchmark](https://github.com/nickwebt800/browser-whisper-benchmark)); M1 ≈ 13× Echtzeit
  ([makecaption](https://makecaption.com/blog/whisper-tiny-in-browser-benchmark)); WebGPU vs. WASM ([SitePoint](https://www.sitepoint.com/webgpu-vs-webasm-transformers-js/));
  quantisiertes mittleres Modell ≈ 75 MB, kleines ≈ 249 MB (Modell-Seiten der Modell-Ablage, Suchergebnis; die Ablage ist von hier aus gesperrt,
  genaue Größen in G9b-0).
- **[W4] Gesang ist schwer:** Jam-ALT, großes Modell ≈ 35,7 % WER, Deutsch mit Trennung 43,5–65,2 %
  ([Jam-ALT](https://astro.paperswithcode.com/paper/jam-alt-a-formatting-aware-lyrics), [arXiv 2311.13987](https://arxiv.org/pdf/2311.13987v1.pdf));
  griechischer Gesang ohne Anpassung: small 92,3 %, medium 65,1 %, large 53,6 % ([arXiv 2609.11302](https://arxiv.org/pdf/2609.11302));
  Text-zu-Gesang-Ausrichtung heute < 0,2 s mittlerer Fehler auf ganzen Songs ([arXiv 2306.07744](https://arxiv.org/pdf/2306.07744),
  [mir_eval](https://mir-eval.readthedocs.io/latest/api/alignment.html)).
- **[W6] WebGPU in Safari 26** (iOS/iPadOS/macOS), Hardware-Grenzen nicht belegt ([AppDeveloperMagazine](https://appdevelopermagazine.com/webgpu-in-ios-26/),
  [Privacy Guides/WebKit WWDC25](https://discuss.privacyguides.net/t/news-from-wwdc25-webkit-in-safari-26-beta/28226)).
- **[W7] Haptik (gleich I4 [W3]):** npm `ios-haptics`: Doku 3.1.1 (26.06.2026) – Code-Trick nur iOS 17.4 bis 26.4, in 26.5 abgestellt; Code 3.3.0
  (25.10.2026, selbst nachgelesen): Label als letztes Kind **im** Ziel (`position: absolute; inset: 0`, `aria-hidden`, `touch-action: manipulation`),
  darin `<input type=checkbox switch>` 1 px mit `visibility: hidden`, ohne `tabindex`, Klick auf den Schalter stoppt das Weiterreichen
  ([npm](https://npmjs.com/package/ios-haptics), [GitHub](https://github.com/tijnjh/ios-haptics)); WebKit-Fehler zur Nutzer-Aktivierung
  ([Bug 285120](https://bugs.webkit.org/show_bug.cgi?id=285120)); „Code-Haptik iOS 17.4–26.4“ ([rapidtoolset](https://rapidtoolset.com/en/tool/ios-haptics-tester));
  Technik erklärt ([azukiazusa](https://azukiazusa.dev/en/blog/ios-safari-web-haptics)).
- **[W8] Speicher in Safari:** 7-Tage-Löschung von Skript-Speicher inkl. Cache, Home-Bildschirm-Apps eigener Zähler
  ([Search Engine Land](https://searchengineland.com/what-safaris-7-day-cap-on-script-writeable-storage-means-for-pwa-developers-332519),
  [iTnews](https://www.itnews.com.au/news/apple-cops-flak-for-deleting-local-browser-storage-after-7-days-539833)).
- **[W9] Server-Preise 2026** (Vergleichsseiten, nicht vom Anbieter selbst): ≈ 0,003–0,006 $/min
  ([diyai](https://diyai.io/ai-tools/speech-to-text/openai-whisper-api-pricing-2026/), [costgoat](https://costgoat.com/pricing/openai-transcription)).
- **[W10] Silben-Muster:** npm `hyphenopoly` 6.1.0 (MIT): `patterns/de-x-syllable.wasm` (MIT, 94 905 B / 63 652 B gz), `patterns/en-us.wasm` (freie
  Lizenz, 21 027 B / 14 877 B gz). Beide Module ohne Importe, Exporte `lmi`, `rmi`, `lct`, `subst`, `hyphenate`, `mem`; Aufruf-Muster in
  `hyphenopoly.module.js` (`encloseHyphenateFunction`: Wort als UTF-16 ab Byte 0, `hyphenate(lmi, rmi, Trennzeichen)` → Länge) – selbst geprüft.
- **[W11] Netz der Cloud-Sitzungen:** am 31.10. selbst geprüft: Modell-Ablage, jsDelivr, unpkg, Zenodo und die Original-Gewichte des Herstellers
  gesperrt; npm-Registry, PyPI, GitHub erreichbar. Freigabe einzelner Domains: [Cloud-Umgebungen, Netzwerkzugriff](https://code.claude.com/docs/en/cloud-environments#network-access).
- **[A] GitHub Pages** setzt keine eigenen Kopfzeilen (COOP/COEP) → keine Cross-Origin-Isolation → WASM einkernig (bekannte Einschränkung; am Gerät
  über `crossOriginIsolated === false` bestätigen). Pages liefert keine Git-LFS-Dateien aus.


*Ende Paket G9.*

---


---

## Teil C — Bauplan für Helfer

### C.1 Aktuelle Hauptlinie (H1) und was vorher zusammengeführt sein muss
**Aktuelle Hauptlinie** = die nächste veröffentlichte App, die der Dirigent **vor** dem Start von Nachtrag 8 aus den wartenden Paketen
zusammenführt (Ausgang: 4.23.0, `vs-base-B.html`). Die Version vergibt der Dirigent. H1 enthält:

| Paket | Stand (Scratchpad) | gebraucht von |
|---|---|---|
| VS-L, VS-P (Nachtrag 4, 4.24.0) | `vs-br-VSL/index.html`, `vs-br-VSP/index.html` | I4, G9 |
| K1 (4.25.0) | `n5-br-K/index.html` | I1, I2, I3 |
| VV1 + VV2 | `n5-br-V/index.html` | I1e, I3 (Offline-Render), I2-36 |
| VV3 | `helfer-VV3.html` | I1, I2, I3 (Video-Haken über `heardAt()`) |
| G1, G2, G6, G7 | `helfer-G267.html` | G9, I4 |
| G3, G4, G5, G8 | `stage-ges/index.html` (4.23.0 + G3/G4/G5/G8) | I1b (G4-Sends), I2 (G8: 64 Takte), I4, G9 |
| VC2a Verlauf | `n5-br-H/index.html` | `historyCheck()` in allen Undo-Abnahmen |
| S0–S2 | `helfer-S012.html` | I1e (Song-Werkzeuge), I2 (Teil-Kopien) |
| K2, D1, N1, N2 | `helfer-N12D1K2.html` | I2 (Basis-Bedingung I2 §9) |

**Nicht in H1** (kommen, wenn fertig; N8 wartet nicht darauf): North ND1–ND4 (`helfer-nd13`, `helfer-nd42`), Bit Mask BM1–BM8, die
K1-Nachbesserung zu Xanders K1-Antworten. Nur der Adapter-Zweig `n8-br-A` (I1h + I2g) braucht North bzw. Bit Mask. **T1 (Taktarten)** kommt nach
N8-Kern und den North-Merges (A.15).

Ein Zweig darf **vor** der vollständigen H1 beginnen, wenn seine eigenen Voraussetzungen (Spalte „mindestens“ in C.2) schon auf der Linie sind;
DOM-freie Teile (Node-Korpus, Rechen-Kerne) dürfen sofort beginnen und werden beim Einbau auf die Linie gesetzt.

### C.2 Zweige (Regel 29)
Jeder Zweig ist eine Kopie der aktuellen Hauptlinie zum Startzeitpunkt (`<zweig>/index.html` im Scratchpad, Git-Zweig mit demselben Namen),
pusht Zwischenstände laufend und liefert je Stufe Changelog (`CHANGES-V3-N8-<Zweig>.md`), Snapshot und „Bitte prüfen“. Kein Zweig fasst die
Hauptlinie oder einen Geschwister-Zweig an (Regel 25).

| Zweig | Stufen (nacheinander) | mindestens auf der Linie | darf früher beginnen | Arbeit |
|---|---|---|---|---|
| `i2-br-U` | I2f → I2e | H1 (K1, D1, N1, N2, G8) | – | 17–21 h |
| `i2-br-K` (A1) | I2a (+ Baustein N, `LKT`, `pv-layout.json`, `lanePut`/`lockPut`) → I2b → I2c | H1 (K1, K2, D1) | – | 20,5–26 h |
| `i2-br-D` (A2) | I2d | I2a | – | 12–15 h |
| `i1-br-K` | I1a → I1b → I1c | K1; I1b-STIMME: G4; I1-21: VV1 | I1a auf `n5-br-K` (I1 §8) | 16–20,5 h |
| `i1-br-N` | I1f-Logik (Erlaubnis, Winkel, Kupplung, `srHand`) | – | ja (DOM-arm, Einbau mit I1d) | 4–5 h |
| `i1-br-U` | I1d → I1e | I1c, I4a (`kbFieldMode`); erst nach **Frage 2** (Song-Teil nach Frage 4, Anzeige nach Frage 3) | gegen Schnittstelle I1 §5.2/§6.9 | 11–14 h |
| `i3-br-K` | I3a → I3b | H1 (K1, VV1) | `FORMCLEAN` sofort (DOM-frei) | 8–10 h |
| `i3-br-U` | I3c + I3d | H1 (K1) | gegen `FORM`-Platzhalter | 6–7,5 h |
| `i3-br-E` | I3e (MS-2000-Teil, dann Reihen-Teil) | I3a; Reihen-Teil: I2a + I2c | – | 3–4 h |
| `i3-br-F` | I3f | I1c + I1d + I1e | – | 2–3 h |
| `i4-br-T` | I4a (zuerst M-PROBE) → I4b | H1 (VS-L, VS-P, G1–G8) | Probe-Seite sofort (Werkstatt) | 9–11 h |
| `i4-br-N` | I4c | H1 für den Einbau | `tapNotes` im Node-Korpus sofort | 5,5–6,5 h |
| `i4-br-X` | I4x, I4d | I4e; erst nach **Frage 8** | – | 7–10 h |
| `g9-br-S` | G9a | H1 für den Einbau | `g9Syl`/`g9Align` im Node-Korpus sofort | 9–11 h |
| `g9-br-E` | G9b-V → G9b-0 (Dirigent, nach Frage 1) → G9b-1 → G9b-2 | H1 für G9b-2 | G9b-V sofort | 11–15 h |
| `g9-br-U` | G9c (Tag 1: M-PROBE-Ergebnis) | H1 | – | 10–12 h |
| `g9-br-D` | G9d → G9e | G9a + G9b + G9c | – | 7–9 h |
| `n8-br-A` | I1h + I2g | I1c, I2c, I2d; BM2 + BM6 bzw. ND1 + ND4 | getrennt freigebbar | 5–7 h |

Gleichzeitig laufen höchstens **12** Sitzungen (Welle A ab H1: `i2-br-U`, `i2-br-K`, `i1-br-K`, `i1-br-N`, `i3-br-K`, `i3-br-U`, `i4-br-T`,
`i4-br-N`, `g9-br-S`, `g9-br-E`, `g9-br-U`; Welle B: `i2-br-D`, `i1-br-U`, `i3-br-E`, `g9-br-D`; Welle C: `i3-br-F`, `n8-br-A`, `i4-br-X`).
Zusammenführen, I1g, I2-/I3-/I4-Abschluss und die N8-Abnahme macht der Dirigent.

### C.3 Konfliktzonen in der einen HTML-Datei
| Zone | Stellen (4.23.0, Zeilen ungefähr) | Pakete | Regel beim Zusammenführen |
|---|---|---|---|
| **Z1 Worklet-Kern** | `AnalogCore` Konstruktor (→ `initCore`), `onMsg` (9297), `enqueue` (9327), `startVoice`/`endVoice`, `control()` (9697), `lfoVal` (9688), `process` (→ `renderVoices`), `setReq`/`structReq`/`xfLite`, `MkCore.noteOn/set` | I1a, I1c, I2b, I2c, I2d, I3a | `onMsg`-Reihenfolge A.3; `v.pv` und `pv-layout.json` nur aus I2a; Umbau `initCore`/`renderVoices` (I2d) erst **nach** I1c; nach jedem Merge M-MSG und Golden-Render (N8-01) |
| **Z2 Engine-Abgleich** | `syncEngine`, `newEngine`, `wkFlat`, `wkSet`/`wkFlush` (18149), `mkSongSync` (19712) | I1a/c, I2d, I3a | ein Sendeweg je Engine und Kern (A.3) |
| **Z3 Daten** | `normalizeProject` (17065), `normClip` (17006), `cleanClip` (17352), `normNoteExtras` (16995), `cleanNote` (17351), `normSynthP` (13341), `normAnalog` (13257), `normSong` (17219), `ownNorm`, `nvLockOf` (34063), `tkExt().take` | I1, I2, I3, I4 (Extra e), G9 | Baustein N einmal (A.4); je Paket eine eigene Normalisier-Funktion mit fester Schlüssel-Reihenfolge |
| **Z4 Planer** | `tick`, `scheduleTrack` (19130), `songTickInner` (19582), `cutTrackAt`, `cancelTrackFrom` | I1e, I2b/c, I3a, I4b | feste Plätze: Brücken-Paar am Anfang von `tick` (I4); `nlSongSync` direkt nach `mkSongSync` (I3); `scheduleLanes` vor den Noten (I2); Fahrten in `songTickInner` (I1) |
| **Z5 Tastatur-Feld** | `#kbArea`, `#kbWrap`, `mkWheelFrame` (18141), CSS (63–85, 389) | I4a, I1d | A.6, angelegt von I4a |
| **Z6 Editoren** | `sheetFrame` (27442, Kopfzeile `r1`, LCD), `pageLfo` (28331), `setP`, `edParamChanged`, `fmxApply` (27595), `mkSetP` (17850), `model.audition` | I1a-Oberfläche, I1d, I2d/e, I3c | Editor-Ziel A.7 |
| **Z7 Mod-Übersicht** | `k1Mods` (n5-br-K 31538), `k1Del`, `K1_PG` | I1a/c/d, I2e, I3a | Abschnitts-Reihenfolge A.11 |
| **Z8 Undo** | `undoPush`, `undoState` (20563), `undoApply` (20586), `wpUndone` | I1 (`'sr'`), G9 (`'ly'`) | je Art ein eigener Fall (A.12) |
| **Z9 Song-Werkzeuge** | `songShift` (22829), `songClear` (22839), `songTidy` (22910), `songWrite` (22890), `vvDirCutTo`, S0–S2-Aktionen | I1e, I3f | Haken neben VV2, auch in S0–S2 |
| **Z10 Bedien-Grundteile** | `haptic`/`hapticInit` (26673), `ctlPrecision` (26739), Regler-SVG (26693, CSS 962) | G9c (Labels), I1d (Marke), I2e (Ring) | A.8, A.11 |
| **Z11 Gesang** | `vsAnalyse`, `vsNotesOf`, `vsFangDone`, `vsRecDone`, `vsResPaint`, `stProf`, `stSheetFill`; `wpOpen`, `wpPaint`, `wpGest`, `wpEdit`, `wpPlay`; `stStart`, `micStart`, `micTapGet` | I4, G9 | getrennte Profil-Schlüssel (A.10); G9-Haken je eine Zeile |
| **Z12 Noten-Editoren** | PianoRoll (11368), StepEditor (12105), LAUF (33173) | I2f, I2e | I2f zuerst |
| **Z13 Leistung** | `perfProbe`, `cpuTick`/`limited`/`applyLimiter` | I1, I2, I3 | Proben als Teile einer Probe; `limited()` gleich für alle Kerne |
| **Z14 Video** | `vvSwapIn`, `vvRenderAudio`, `vv3Knob`, `vv3PlateN`, `vv3*State` | I1e, I2b, I3a | `heardAt()` (A.11) |

### C.4 Zusammenführung: Abhängigkeiten und Reihenfolge
**Feste Abhängigkeiten** (sonst wird nicht zusammengeführt): I2a vor I1c, I2b, I2c, I2d, I3e-Reihe · I1c vor I1d, I1e, I2d, I3f, I1h ·
I2c vor I3e-Reihe · I1d + I1e vor I3f · I3a vor I3e und I3f · I4a vor I1d · G9a + G9b + G9c vor G9d · North/Bit Mask vor `n8-br-A`.
Alles andere wird **in der Reihenfolge des Fertigwerdens** zusammengeführt. Jede Stufe wird sofort veröffentlicht (Changelog, Snapshot,
„Bitte prüfen“, N8-01).

**Geplante Reihenfolge**
1. **H1** (C.1).
2. **I2f** Anschlag sehen/ziehen/hören → veröffentlichen (Xanders Wunsch zuerst).
3. **I2a** Fundament: Adressen, `pv-layout.json`, Baustein N, `lanePut`/`lockPut`.
4. **I4a + I4b + I4c → I4e** Tipp-Summen (mit `kbFieldMode`, M-PROBE, `hoerZeit`) → veröffentlichen.
5. **I3a + I3b → I3c + I3d** Mal-LFO → veröffentlichen; danach I3e-MS-2000-Teil.
6. **I1a + I1b + I1c** (+ I1f-Logik) Klang des weichen Szenenwechsels und Super-Regler-Kern (ohne neue Sicht).
7. **I2b → I2c** → I3e-Reihen-Teil → **I2e** Locks und Reihen → veröffentlichen.
8. **G9a + G9b + G9c → G9d → G9e** Songtext → veröffentlichen (unabhängig; sobald fertig, auch vor 5–7).
9. **I2d** Klang-Lock → veröffentlichen.
10. **I1d + I1e** (nach Frage 2; Song-Teil nach Frage 4; Anzeige und V6a-Oberfläche nach Frage 3) → **I3f** → **I1g** → veröffentlichen.
11. **N8-Gesamtabnahme** (C.5) mit iPhone-Gesamttor.
12. Später: `n8-br-A` (I1h + I2g) nach North/Bit Mask; `i4-br-X` nach Frage 8.

### C.5 Gemeinsame Abnahme N8 (nach jeder Zusammenführung, ganz nach Schritt 11)
- [ ] **N8-01** Regel 28: Demo und alle Projekte in `synq-snapshots/` gegen H1: normalisiertes JSON zeichengleich (kein `need`), Nachrichten an alle
      Worklets byte-gleich (M-MSG, 32 Takte), Offline-Render bitgleich (M-NULL = −∞); nach **jeder** Zusammenführung.
- [ ] **N8-02** Baustein N (A.4): Projekt mit allen Merkmalen → `S.need` = genau `['lf','lk','ly','sr','st']` (+ `'tp'` mit Extra e); je Merkmal ein
      Stand ohne dieses Merkmal in `KNOWN_NEED` → gesperrt mit Hinweisband, nichts überschrieben; `need: ['zz']` → gesperrt; zurück deep-equal.
- [ ] **N8-03** Adressen (A.1): `srDesc` und `LKT` liefern für jeden Pfad dieselbe Beschreibung; 200 Zufallspfade aller Familien:
      `srGet`/`srSet` ↔ `lkResolve`/`sndGet` Rundlauf deep-equal; I1-27 für alle Kennlinien über `LKT`; I2-61 (`pv-layout.json` gleich auf beiden Seiten).
- [ ] **N8-04** Endwert gemeinsam: I1-24 und I2-09 (b)–(d) bestehen auf derselben Linie.
- [ ] **N8-05** `onMsg`-Reihenfolge (A.3): eine Nachricht mit `lf`, `morph`, `sr` und `set` wird in der festen Reihenfolge übernommen (Worklet-Protokoll);
      `lfMiss` = 0, kein Block mit halbem Zustand; stufig 5 ohne `l1f` → 1.
- [ ] **N8-06** Tastatur-Feld (A.6) = I1-45 = I4-02, mit Vormachen, AM-Spur, MS-2000-Blatt, Song-Aufnahme und Neuladen.
- [ ] **N8-07** Editor-Ziel (A.7): Port-Spion für die Orte `'grund'`, `'st'`, `'cap'`, `'kl'`; gegenseitiger Ausschluss (grau mit Grund); im Ort
      `'cap'` bleiben `track.sound`, `tr.gfx`, alle `clip.st` deep-equal.
- [ ] **N8-08** Haptik (A.8): Spion über alle N8-Wege: 0 `haptic`-Aufrufe aus `pointermove`, `deviceorientation`, Zeitgebern; an jeder früheren
      Haptik-Stelle ist das sichtbare Signal da (DOM-Beobachter); mit `UI.haptics` aus keine Aufrufe, keine Label-Schicht.
- [ ] **N8-09** M-PROBE am iPhone erledigt; Ergebnis (iOS-Version, 7 Antworten, Tastatur-Höhen, `crossOriginIsolated`, WebGPU) im Changelog; die
      Folgen (I4 F4, G9-Labels, `g9KbSim`, Knopf 7) umgesetzt bzw. als Vorschlag im Funk.
- [ ] **N8-10** Marken (A.14) über den N8-Diff = 0 Treffer außer den Ausnahmen; „MS 2000“ in der ganzen App genau einmal.
- [ ] **N8-11** **iPhone-Gesamttor** (Xander, Pages-Seite, `perfProbe` mit N8-Probe): dieselbe Szene „ohne“ (alle N8-Daten entfernt, gleiche Noten)
      und „mit allem“ (I1-83 „mit“ + I2-60 „mit“ + 4 Spuren mit je zwei gemalten LFOs Start NOTE). Bedingung: „ohne“ ≤ 0,35, „mit allem“ ≤ 0,50,
      „mit allem“ − „ohne“ ≤ 0,08, Begrenzer-Stufe die ganze Zeit < 2, kein `late`, 3 min ohne Aussetzer (hören). Dazu G9-27 (Erkennung während ▶).
      Die Einzel-Tore I1-83, I2-60, I3-36 bestehen weiter.
- [ ] **N8-12** 3-min-Gesamtlauf: Szenenwechsel mit Morph, Super-Regler-Fahrt, Pinsel und Klang-Lock-Bearbeitung während ▶, Einwischen, FANG mit
      Tipps, Text-Modus-Eingabe nach dem Stopp → keine Knackser (M-KLICK), keine hängenden Noten, keine Konsolen-Fehler, `lkBad` = `klLate` =
      `lfMiss` = 0; Mod-Übersicht: je bewegtem Regler und Ursache genau eine Zeile.
- [ ] **N8-13** Startzeit: App-Start ± 5 % gegen H1 (Chromium, 4× CPU-Drossel, Median aus 5); keiner der Blöcke `sq-sr-src`, `sq-lock-src`,
      `sq-form-src`, `sq-g9-src` wird beim Start ausgewertet; kein Abruf unter `vendor/g9/` beim Start.
- [ ] **N8-14** Speichern → Laden, Kopieren/Einfügen, Duplizieren, Teil-Kopie (S0–S2), ZIP (P1) und Online-Speichern eines Projekts mit allen
      N8-Feldern deep-equal; Undo/Redo aller N8-Aktionen mit `historyCheck()` = true.

### C.6 Gerätetermine für Xander (in dieser Reihenfolge)
1. **Sobald I4a steht:** Probe-Seite M-PROBE (2 Minuten, 7 Knöpfe, zwei Bildschirmfotos mit Tastatur) → Ergebnis in den Funk.
2. **Nach I2f:** I2 „Bitte prüfen“ Nr. 8 (Anschlag ziehen und hören, ◀ ▶).
3. **Nach I4e:** I4 „Bitte prüfen“ 1–8, Prüf-Link `#tippmessung` ([Messen], [Messen mit Last], [Kopieren]).
4. **Nach I3:** I3 „Bitte prüfen“ 1–7, 9–10 (I3-Probe mit Einwisch-Lage).
5. **Nach I2e/I2d:** I2 „Bitte prüfen“ 1–8, 10 (I2-Probe „ohne“ und „mit“).
6. **Nach G9e:** G9 „Bitte prüfen“ 1–9, Diagnose-Zeile `?g9diag=1` (G9-60, G9-63, G9-64).
7. **Nach I1g:** I1-82, I1-83, I3 „Bitte prüfen“ 8, dann das N8-Gesamttor N8-11.

### C.7 Dauer und Budget gesamt
| Paket | Arbeit | Kalender (parallel) | Budget App | davon bei Bedarf |
|---|---|---|---|---|
| I1 | 35–46 h | 17–22 h (ab Antwort auf Frage 2) | +123 KB | 35 KB |
| I2 | 55–69 h | 26–32 h (4 Zweige) | +100 KB | 25 KB |
| I3 | 21–27 h (+1 h bei „Meine Formen“) | 11–14 h + Anschluss I3e/I3f | +39 KB | 21 KB |
| I4 Kern | 16–20 h | 10–12 h | +19 KB | – |
| G9 | 37–47 h (ohne Freigabe 9–12,5 h weniger) | 18–24 h | +45 KB | 14 KB (`sq-g9-src`) |
| Zusatz N8 über die Paket-Schätzungen: Baustein N (in I2a), M-PROBE gesamt (in I4a), Konflikte beim Zusammenführen, N8-Abnahme, Gesamttor | 7–10 h | 4–6 h am Ende | +1 KB | – |
| **Summe Kern** | **≈ 171–219 h** | **≈ 35–45 h** ab H1 | **≈ +327 KB** | **≈ 95 KB** |
| I4-Extras a–f (nur nach Frage 8) | 7–10 h | 4–6 h | +8 KB | – |
| **Summe mit den I4-Extras** | **≈ 178–229 h** (mit „Meine Formen“ +1 h) | | **≈ +335 KB** | |

Die Kalenderzeit hängt am längsten Weg (I2: I2a → I2b → I2c → I2e/I2d → Merge, dann I3e-Reihe) und an der Antwort auf Frage 2 (I1d, danach I3f).
Kommt die Antwort erst nach ≈ 20 h, verschiebt sich nur der Super-Regler-Teil; alles andere wird vorher veröffentlicht. Nachgeladen werden nur
bei Bedarf: G9-Laufzeit ≈ 4–7 MB und Modell ≈ 80–95 MB (nach [Erkennen]), Silben-Muster 79 KB (erster Text-Modus).

---

## Teil D — Fragen an Xander

**Regel:** Jede Frage hat eine Vorgabe. Ohne Antwort wird die Vorgabe gebaut – außer bei den Fragen 2, 3, 4 und 8: Dort wird **erst nach
deiner Antwort** gebaut, weil sie eine vorhandene Ansicht sichtbar verändern oder Extras sind (A.9).

### D.1 Die zehn Fragen
1. **Zwei einmalige Freigaben.** (a) Erlaubst du in der Cloud-Umgebung (Titelleiste der Sitzung → Umgebung → Bearbeiten → Netzwerkzugriff →
   Erlaubte Domains) einmal `huggingface.co` und `*.hf.co`, damit ich das Sprachmodell und Test-Gesang holen kann? Danach kannst du es wieder
   entfernen; die Pages-Seite wächst einmalig um ≈ 120 MB Modelldateien. (b) Hebst du `max_app` an, sobald wir über 4.30.0 kommen (ich schicke
   dir die Zeile)? **Vorgabe:** ohne (a) kommen Text einfügen, tippen und korrigieren, aber kein [Erkennen].
2. **Super-Regler – Ort und Form.** Menü → „Super-Regler“ schaltet das Tastatur-Feld um: oben die Ziele ①–④ mit [+ Ziel], in der Mitte ein
   waagrechter Balken, unten NEIGEN und [⇥ bis zum nächsten Teil]; beim Vormachen eine amberfarbene Leiste mit [✓ Ziel merken] und darunter die
   Tastatur; zwei Tipps auf den Balken = zurück auf ①. **Vorgabe:** so (ein Tipp auf ein Ziel fährt **nicht** dorthin). Oder lieber ein großer
   runder Regler bzw. ein immer sichtbarer Streifen über der Tastatur (die Tastatur würde ≈ 52 px niedriger)?
3. **Anzeigen in den Klang-Editoren.** (a) Weicher Szenenwechsel: [◆ Merken] in der Kopfzeile, beim Bearbeiten eines Szenen-Klangs ein
   Amber-Text in der LCD-Zeile mit [Grundklang], ◆ klein in der Clip-Zelle, die Regler fahren beim Wechsel sichtbar mit; die MS-2000-Platte bleibt
   unverändert. (b) Verstellt der Super-Regler einen Regler, zeigt dieser weiter seinen Grundwert plus eine dünne Marke am gehörten Wert;
   „Sound speichern“ speichert den Klang bei 0 % und sagt das in einer Zeile. **Vorgabe:** beides so. Bis zur Antwort bleiben die Editoren wie heute.
4. **Super-Regler-Fahrt im Song merken.** Eine Fahrt bis zum Refrain während ▶ SONG wird im Song gespeichert (schmaler Streifen unter der
   Kopfzeile, löschbar im Teil-Blatt), damit Song, Export und Video sie immer gleich spielen. **Vorgabe:** ja. Bis zur Antwort laufen Fahrten nur
   live (im Video fehlen sie dann).
5. **FM-Sequencer.** Was genau stört dich am Sequencer des FM-Geräts? **Vorgabe:** Wir nehmen an: angehängter Extra-Bereich, anfangs ohne
   Chance und Ratsche, schwer verständlich. Darum laufen FM-Reihen wie „OP 2 Pegel“ im gewohnten Sequencer mit eigener Länge, Chance und Ratsche.
6. **„Anschlag auf der Taste farbig sehen“.** Meintest du die Note im Editor oder die Spiel-Tastatur beim Live-Spielen, und soll sich die Farbe
   mit dem Anschlag ändern? **Vorgabe:** Note im Editor als Füllhöhe in voller Spurfarbe (die Farbe bleibt gleich), dazu zeigt die Taste links in
   der Klaviatur der ROLLE dieselbe Füllhöhe.
7. **Gelockte Schritte und Super-Regler.** Wenn du mit dem Super-Regler aufdrehst: Sollen gelockte Schritte mitgehen (ihr Abstand bleibt, das
   Muster wandert mit) oder fest bleiben? **Vorgabe:** mitgehen.
8. **Tipp-Summen-Extras, jedes einzeln ja/nein:** a) Tipp-Spur oben in der Fläche, b) „Tippen messen“ im Mikro-Check, c) Umschalter „Rhythmus
   [Tipps] [Stimme]“ im Ergebnis-Blatt, d) [Weglassen]/[Dazunehmen] im Ergebnis-Blatt, e) Tippen auch bei ● SONG und bei „In Melodie umwandeln“,
   f) FANG erkennt „fast nur getippt, leise gesummt“. **Vorgabe:** keins, bis du ja sagst; der Kern kommt so oder so.
9. **Tick (Haptik).** Auf aktuellem iOS gibt der Browser fast nie einen Tick, beim Ziehen und bei laufendem Mikro gar nicht. Bitte tippe einmal die
   Probe-Seite in der Werkstatt durch (2 Minuten, 7 Knöpfe, zwei Fotos mit offener Tastatur). **Vorgabe:** überall sichtbares Aufleuchten bzw.
   Einrasten; ein Tick nur bei echten Tipps (Wellenform, ◀ ▶ im Songtext), wo die Probe ihn zeigt; beim Summen-Tippen nur, wenn er mit Mikro
   fühlbar ist und du ihn willst.
10. **„Locks für alles“ – auch Spur-Werte?** Lautstärke, Panorama, Hall-/Echo-Anteil, Pumpen, Chorus und Modulations-Tiefen wirken auf die ganze
    Spur. **Vorgabe:** Schritt für Schritt als freie Reihe (mit Länge, Chance, Ratsche), aber nicht als Lock an einer einzelnen Note; Drive der
    Spur, Chorus-Art, Pump-Release, Tempo, Swing, Master und der gemeinsame Hall-Raum bekommen keine Locks.

Zuordnung: 1 = G9 F0 (+ `max_app`) · 2 = I1 F1 · 3 = I1 F7 + F8 · 4 = I1 F3 · 5 = I2 F1 · 6 = I2 F2 · 7 = I2 F3 · 8 = I4 F7 · 9 = I4 F4 + G9 F5 ·
10 = I2 F6.

### D.2 Vorgaben, die ohne Rückfrage gelten (stehen im Changelog unter „Fragen an Xander“; ändern nur auf dein Wort)
| Paket | Frage | gebaute Vorgabe |
|---|---|---|
| I1 | F2 NEIGEN loslassen | Stellung bleibt (federt nicht zurück) |
| I1 | F4 Matrix ohne wartenden Wechsel | [bis zum nächsten Teil fahren] grau mit Grund |
| I1 | F5 einer oder viele | ein Super-Regler je Projekt (Ziele für eine Spur oder alle) |
| I1 | F6 MORPH-Schieber (alter Plan V6b) | entfällt, der Super-Regler kann das |
| I2 | F4 Punkte-Ring auf den Geräte-Platten | nein, nur in der Lock-Leiste |
| I2 | F5 Regler bei ● REC als Locks aufnehmen | nicht bauen |
| I2 | F7 Effekte eines Klang-Locks | die Effekte der Spur |
| I2 | F8 Grenzen und Kleinigkeiten | 8 Locks je Note, 8 Reihen je Clip, 3 Klang-Locks je Clip, 8 je Spur, 32 im Projekt; Ratsche wechselt Wert/Grundwert; Pinsel malt beim Drehen eine Rampe |
| I2 | F9 Klang-Lock-Nummern | nie wiederverwenden |
| I2 | F10 „Velocity-Ziel einfacher“ | nicht in I2; eigenes kleines Paket nach deiner Erklärung |
| I2 | F11 Klammer der Reihen-Länge | nur gezeichnet, Länge im Optionen-Fenster (wie D1) |
| I3 | F1 gemalte Welle auf MS-2000-/Bit-Mask-Platte | nein |
| I3 | F2 Kurve des Super-Reglers | einmal über die ganze Fahrt gedehnt |
| I3 | F3 Bibliothek | Pumpen, Gate (x.xx.xx.x.xx.xx.), Triller (1/32) wie beschrieben |
| I3 | F4 Kopie oder Verbindung | Kopie |
| I3 | F5 „Meine Formen“ | nicht bauen |
| I4 | F1 Ort und Namen | Mikro-Blatt „Rhythmus [aus der Stimme] [Tippen]“ (Vorgabe „aus der Stimme“), Fläche „TIPPEN · einmal pro Ton“, Zählzeile |
| I4 | F2 Tipp ohne Ton | Note mit der Höhe des Tons davor, in der Zählzeile genannt |
| I4 | F3 Notenlänge | so lange der Finger liegt (wie im Vorschlag) |
| I4 | F5 Silben für G9 | I4 liefert nichts (nur mit Extra e) |
| I4 | F6 Klopfgeräusch | nur messen, Hilfe-Satz „weich tippen“ |
| G9 | F1 automatisch erkennen | ja, sobald das Modell geladen ist, nie während einer Aufnahme; abschaltbar |
| G9 | F2 größeres Modell | nur das mittlere; das größere nur nach Messung (≥ 10 Punkte besser, ≤ 2× langsamer) als neue Frage |
| G9 | F3 Tipp auf die Wellenform bei ▶ | ▶ hält an, dann spielt der Abschnitt |
| G9 | F4 Vorspielen beim Schreiben | einmal je Silbe |
| G9 | F6 Text an weiteren Orten | nur im Marken-Editor |
| G9 | F7 Testmaterial (Bitte) | ohne deine Aufnahmen nur öffentliches Testmaterial; 10 deutsche und 10 englische Zeilen mit Text würden die Messung an deiner Stimme ermöglichen |
| G9 | F8 Text-Trennpunkt ohne Marke | nein, zwei Silben auf einer Marke bleiben zusammen |
