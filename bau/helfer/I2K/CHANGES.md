# CHANGES – Zweig `i2-br-K` (Nachtrag 8, Paket I2: I2a → I2b → I2c)

Basis: `bau/snapshots/G-T-merge-fix.html` (App 4.24.0 mit K1, K2, D1, N1, N2) → `bau/helfer/I2K/index.html`.
VERSION-Zeile und CLOUD-Zeile `  live: true,` unverändert. Kein Supabase-Aufruf. Format bleibt 5 (nur zusätzliche Felder).
Tests: `bau/helfer/I2K/tests/` (Playwright + Node), Aufruf je Datei `node <datei>.mjs`.

---

## I2a — Adressen, Daten, gemeinsame Tabelle, Baustein N (31.10.)

**Kurz für Xander:** Unsichtbares Fundament. Jeder Regler jedes Klangerzeugers hat jetzt eine feste Adresse, ein Schritt kann
Werte speichern, und ältere App-Stände öffnen ein Projekt mit Locks gesperrt statt sie still zu verlieren. Hörbar ist noch nichts
(das kommt mit I2b/I2c). Alte Projekte bleiben Zeichen für Zeichen gleich.

### Gebaut
- **`LKT`** (A.1, §3): eine Adress-Tabelle für alle Engines, beim Start von `lktBuild()` aus `PD`, `DPD` × 12 Pads, den FM-Tabellen
  (`normFm6`/`normOp`, `FMX.norm`), `SQMK.normMk`/`mkRange` und `fx.*` erzeugt. Eintrag `{p, fam, cls, lo, hi, c, k?, vals?, lbl, sp, wi, nat}`
  (+ `q: 1` = ganzzahliges Engine-Feld, intern). Kennlinien `lin bip exp db pow bipow` + `vals` (stufig), wie `PD`.
  1566 Einträge aus 1597 Quell-Einträgen; **`LKT_EXC`** 34 Ausnahmen = 2,13 % (Liste unten).
- **`pv-layout.json`** (A.1, §5.2) eingecheckt neben der App und als `PV_LAYOUT` eingebettet; `lktBuild()` vergibt `wi` nur daraus
  (fehlt ein Pfad, wird er gemeldet: `lkInfo().miss`). Raum **A** 469 Plätze (die ersten **270** mit Stimmen-Wert, Klasse b/n; danach
  199 Plätze der Klasse r, nur Reihen-Feld `lb`), Raum **M** 92 Plätze. Ab jetzt eingefroren, neue Schlüssel nur hinten anhängen.
- **Daten** (§4): `note.lk.v` (≤ 8, 1/1000, Grammatik `^[a-z][A-Za-z0-9]*(\.[A-Za-z0-9-]+){0,6}$`, ≤ 48 Zeichen) und `note.lk.k` an
  Synth- **und** Drum-Noten (`normNoteExtras`: `tune`/`dec` wie bisher nur Drums); `clip.kl` (≤ 3, IDs eindeutig, Klang über
  `normalizeSound` bzw. die normDrum-Regeln, `h` neu gerechnet), `clip.klq`, `clip.ln` (≤ 8, Länge 1–64, Raster ohne „aus“, Chance
  .05–.95, Ratsche 2–4, Schritte `i < len` sortiert) – alle am Ende des Clips in fester Reihenfolge; ohne sie ist die Ausgabe wie bisher.
  `lk.k` ohne passenden `kl`-Eintrag wird entfernt. `cleanNote` kopiert `lk.v` tief, `cleanClip` nimmt `kl`/`klq`/`ln` tief mit
  (Undo, Kopieren/Einfügen, Duplizieren). Schreiben eines Locks kopiert das `lk`-Objekt der Note vorher (flach kopierte Noten aus ×2,
  Teilen, FANG teilen sonst ihr Objekt).
- **Baustein N** (A.4): `S.need` wird beim Speichern aus den Daten berechnet (`['lk']`, leer = Feld fehlt); `normalizeProject` legt
  unbekannte Merkmale in `_newer.n`, `nvLockOf` sperrt dann wie VO-R1 mit dem vorhandenen Hinweisband; der Datei-Wächter `nvNewer`
  prüft `need` ebenso. `KNOWN_NEED = ['lk']`.
- **Haupt-Faden-Rechnung:** `lkResolve(track, note, path, t)` (Noten-Lock ?? Reihenwert ?? Grundwert, I1 §5.1 mit SR = 0, ohne Zustand),
  `lkValueAt`, `laneAt` (Schritt-Rechnung mit `d1Pos`, Chance über `DrumSeq.rand01(sd, pass, j, 1000 + Reihe)`, Ratsche gerade/ungerade),
  `heardAt` (A.11: Grund + Lock; I1c ergänzt Zustand/SR), `lkStepOf` (L6: nächster Schritt, Drums + `m`).
- **Test-API** (`SYNQUENZER.*`): `lkt`, `lktAll`, `pvLayout`, `lkGet`, `lkSet`, `laneSet`, `lanePut`, `lockPut`, `lkInfo`
  ({paths, lkBad, klLate, kerne, faecher, bytes, …}), `lkResolve`, `lkValueAt`, `laneAt`, `heardAt`, `lkToN`/`lkFromN`, `needOf`,
  `needKnown` (nur Tests, A.4 Fall a). `lanePut`/`lockPut`/`lkSet`/`laneSet` = je ein Undo der Art `'clip'`; Grenzen L4 beim Anlegen
  (LCD nennt den Grund); Klasse `s` → „nur als Klang-Lock“, Klasse `r` als Noten-Lock → „nur als freie Reihe“.

### Messwerte (`tests/i2a-abnahme.mjs`, alle grün)
| Abnahme | Ergebnis |
|---|---|
| I2-01 Abdeckung | 1597 Quell-Einträge, 0 ohne Eintrag; 116 Regler mit `data-key` (VA, FM, FELD, WT, MS-Platte-Spur, Drum) 0 ohne Eintrag; Ausnahmen 34 = 2,13 %; Klasse s `lq mode eng fmAmp poly reset` ✓, fmxSig-Teile 19/19 s, stufige VA-Werte n ✓, `fx.*` r ✓ |
| I2-02 Normieren | 1000 Zufalls-Clips: 0 Verstöße; zweimal normiert gleich 1000/1000; Datei-Packen → Entpacken deep-equal 1000/1000; 4814 unbekannte gültige Pfade erhalten; tiefste Pfade `mk.t.1.p.3.i fm6.ops.5.r.3 fmx.edge.6-1.amt bm.a.o1.m drum.hatC.mFrq cutoff` überstehen Speichern → Laden; `lanePut`/`lockPut` je 1 Undo (Art clip); `lockPut` nur 4 Noten-Schritte |
| I2-03 Kopien | cleanNote tief; Kopieren/Einfügen, Duplizieren, ×2, eigener Song-Clip (`ownNorm`), Undo-Schnappschuss tragen lk/kl/klq/ln deep-equal; Spiegeln/Umdrehen lässt lk je Note gleich |
| I2-04 (Daten-Teil) | Demo + 60 Werksklang-Projekte: normalisiertes JSON **und** Datei gegen 4.24.0 Zeichen für Zeichen gleich 61/61; kein `need` ohne I2-Daten. (Nachrichten/Render-Teil: I2b) |
| I2-05 Undo | lkSet, Lock löschen, laneSet, Reihe löschen, lanePut, lockPut: je 1 Schritt, Undo/Redo stellt her (6/6) |
| I2-06 Baustein N | `need` = `["lk"]`; (a) ohne `'lk'` in KNOWN_NEED: gesperrt, Hinweisband, Original unverändert gehalten; `need: ['zz']` gesperrt; (b) 4.24.0 öffnet ohne Fehler, verliert lk/ln beim Speichern (bekannte Lücke); (c) neuer Stand frei und deep-equal |
| I2-61 Platz-Liste | Datei = eingebettete Liste = `lktBuild()`-Plätze Zeichen für Zeichen; zweiter Start gleich; A 469 (270), M 92 |
| Konsole | 0 Fehler |

### Abweichungen / selbst nötige Festlegungen (bitte bestätigen)
1. **`v.pv`-Länge:** Die Spec nennt `Float32Array(PV_A)` und ≤ 20 KB je Kern. Mit allen Pfaden hat Raum A 469 Plätze (12 Stimmen ×
   469 × 4 B = 22,5 KB, zu viel). Darum liegen die Klasse-r-Plätze (nur Reihe, Kern-Ebene) **hinten**, und `v.pv` braucht nur die
   ersten 270 (Stimmen-Plätze) → 13 KB + `pvR` 3,2 KB. `lb` hat alle 469.
2. **Klassen, die §3 nicht nennt** (nach dem Ort, an dem der Kern sie liest): VA `uniMix uniWidth spread analog` = n; LFO-Werte
   `l1/l2 shape sync retrig fade` = r (Kern-Ebene wie `rate`); FM-Tastatur-Skalierung `ks.*` und die FELD-Tonhöhen-Hüllkurve `pit`/`pr` = s
   (sonst sprengt Raum A die 20 KB); `fm6.pms/pmd/amd/ams.*/osync`, `fmx.pmd/amd` = s; MS-Timbre `prio a.gate a.dist` = s, `bend porta e*.rst
   l*.w l*.ks l*.sync l*.note f.vel a.vel a.kbd` = n; die ganze MS-Mod-Sequenz `seq.*` = s (nur Klang-Lock); `eng` als Klasse-s-Eintrag (I2-01).
3. **`fmx.edge.<von>-<nach>.amt`:** In den FELD-Daten hat eine Kante **keine eigene Tiefe** (`edges: [{from, to}]`; die Tiefe ist der
   Pegel des Quell-Operators). Darum steht der Pfad in `LKT_EXC`; er wird gespeichert (Grammatik gültig), wirkt aber nicht. → Frage unten.
4. **MS-Effekte** `mk.mfx.* mk.dly.* mk.eq.*` stehen in `LKT_EXC` (wirken für alle Stimmen wie Spur-Effekte, F7).
5. **Budget:** I2a ist +41 KB statt +13 KB (davon 9,4 KB die eingebettete Platz-Liste, Rest Tabellen-Erzeugung mit Kommentaren).
6. Basis enthält **kein `historyCheck()`** (VC2a nicht in 4.24.0) und kein `synq-snapshots/`; I2-04/05 prüfen darum gegen die Demo,
   60 Werksklang-Projekte und Undo/Redo-Rundlauf.

### Ausnahmen `LKT_EXC` (34)
`mw` (Live-Wert) · `fx.drive`, `fx.chorus.mode`, `fx.pumpRel` (Kette würde umgebaut, F6) · `l1f`, `l2f` (Form-Tabellen) · `fm6.approx`,
`fm6.perm` (Import-Kennzeichen) · `fmx.uw` (eigene Wellen) · `fmx.edge.*.amt` (keine Kanten-Tiefe in den Daten) · `mk.mfx.type/spd/dep`,
`mk.dly.type/sync/time/note/dep`, `mk.eq.lf/lg/hf/hg` (Effekte der Spur) · `drum.<12 Pads>.choke` (Choke bleibt die des Pads, §5.7).

### Fragen an Xander (Vorgaben gelten, bis du anders entscheidest)
- Frage 7 (gelockte Schritte mit dem Super-Regler): Vorgabe **mitgehen** – betrifft I1, hier nur vorbereitet.
- Frage 10 (Spur-Werte): Vorgabe **nur als freie Reihe** – `fx.*` sind Klasse r, als Noten-Lock abgewiesen.
- Neu: FELD-„Kantentiefe“ gibt es in den Daten nicht. Soll eine Reihe auf „OP n → OP m“ den Pegel des Quell-Operators meinen
  (dann wäre es dasselbe Ziel wie „OP n Pegel“), oder entfällt das Ziel? **Vorgabe:** entfällt (Ausnahme).

### Bitte prüfen (Xander)
Nichts zu hören oder zu sehen in I2a. Bitte nur: ein altes Projekt öffnen, speichern, wieder öffnen → alles wie vorher.
