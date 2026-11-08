# INT53C – drei Befunde aus der Zusammenspiel-Prüfung (ORI · VID5 · MIXG) behoben

Kandidat: `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/rel-4530/m3/index.html`
(Stand davor gesichert: `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/rel-4530/m3/int53c/index-vor-int53c.html`).
VERSION/CHANGES nicht angefasst. Jede geänderte Stelle trägt den Kommentar „INT53C“. Aussehen, Größe und Bedienung unverändert
(nur Farbe bei B/C; bei A ändert sich nichts Sichtbares – nur, was in die Datei kommt).

Geändert (3 Zeilen ersetzt, 6 Code-Zeilen und 6 CSS-Zeilen eingefügt, dazu ein Block; `diff` gegen den Stand davor: 3 − / 128 +):

| Stelle | Art | Zweck |
|---|---|---|
| `vvRenderAudio` (G6PH-VIDEO-Hülle) | 1 Zeile: `vvRenderAudio0(o)` → `int53cRender(o)` | Export rechnet mit dem Nachher-Stand |
| `vid5Sig` | 2 Zeilen | Fingerabdruck = Nachher-Stand (`int53cSigP`) |
| `mxgSync`, `mx3Tick` | je 1 Zeile am Anfang | Satzzeilen und Auto-Nachregeln stehen still, solange ein Export geliehen hat |
| `ch1AB` | 2 Zeilen | Fingerabdruck beider Stände beim Wechsel Nachher → Vorher (nur wenn es ein Video gibt) |
| `ORI_CSS` | 3 Regeln neu (alte Zeilen bleiben) | B: Kopf-Farbe am Marken-Editor (+ Raumschiff) |
| `oriLayers` | 1 Zeile neu | C: Dur ↔ Moll-Farbe nach Bereich |
| Block `INT53C-BEGIN … INT53C-END` hinter `VID5-END` | neu | `int53cRender`, `int53cNach`, `int53cMxData`, `int53cHash`, `int53cSigP`, `int53cCh1Pre/Post`, Test-API `SYNQUENZER.int53c` |

---

## Befund A (mittel) – Video/Audio-Export nahm den Vorher-Mix

**Befund (nachgestellt, vorher):** `pruef-vid5/p5-mixg.mjs` auf dem Stand vor INT53C: Mischen (Vergleich `snap`), `mx2AB('A')`,
Blatt abgelegt (⌄), Video-Blatt, erstellen → Ton = VORHER (Abstand Vorher↔Nachher −3,2 dB gegen −16,6 dB zwischen zwei gleichen
Videos), „Video ist aktuell“ gleich danach, nach dem Umschalten auf Nachher „Neu erstellen“ (`curB: false`). Die abgelegte Leiste liegt
unter dem Video-Blatt (`barCoveredBySheet: true`) – VORHER sieht man dort nicht.

**Ursache:** `mx2AB('A')` setzt im Vergleich `snap` per `mx2Restore(A.base)` den Vorher-Mix wirklich in `S`; nur das *Schließen*
beendet den Vergleich (`closePop → mx2Closed → mx2AbEnd`), das *Ablegen* nicht (`pshDock` ruft kein `onClose`). Der Offline-Durchlauf
(`vvRenderAudio`) rechnet `S`, wie es ist – also Vorher. Der Fingerabdruck (`vid5Sig`) las ebenfalls `S` (Vorher) → nach dem Umschalten
auf Nachher galt das Video als veraltet, obwohl Nachher der gewollte Stand ist.

**App-weite Prüfung aller Vorher/Nachher-Zustände** (kann er beim Export noch aktiv sein? – nachgestellt, Skripte
`int53c/probe-reach.mjs`, `int53c/probe-reach2.mjs`, Test A5–A8):

| Zustand | beim Export aktiv? | käme in die Datei? | Behandlung |
|---|---|---|---|
| Mix & Master `snap` auf Vorher | ja (abgelegt ⌄; Video-Blatt und Instrumental-Blatt schließen keine abgelegte Leiste) | ja | Nachher = `MX2.ab.cur` eingesetzt |
| Mix & Master `gain` (nur Auto-Master) | ja | nein – `mixaAbSet` nimmt im Render schon den Auto-Master | wie bisher (p5b) |
| Klang-Editor / Klang-Browser (`UI.ab`, Seite B = Original) | **ja** – bleibt auch nach dem Schließen des Editors; ≡-Menü über dem Editor erreichbar | ja (Original statt Änderung) | Nachher = `UI.ab.a` (deine Änderung) eingesetzt |
| Marken · STIMME (`WP.ab`) / Tonhöhe (`G2.ab`) | **ja** – ≡-Menü über dem Blatt erreichbar, Video-Blatt schließt es nicht | ja (Original-Take) | für den Render aus, danach wieder an |
| Refrain groß / Chor sauber (MX3 Gesang, Chor-Blatt; `ch1AbSide`) | **ja**, wenn Chor- oder Mix-&-Master-Blatt abgelegt ist | ja (ohne den Schritt) | ↷ genau dieses Schritts wie `redo()` (ohne Meldung/Verlauf), danach ↶ wie `undo()` – UNDO bleibt identisch |
| Gesangs-Effekte (`G4.ab`) | nein – Blatt (`g4`-Popup) geht beim Öffnen von Video/Export zu, `onClose` setzt A/B aus | – | nichts (Test A8) |
| Remix-Versuch / Stil-Klang (GEN4/SND1) | nein – Remix-Blatt geht zu (`gen4End`: Vorher = verworfen) | – | nichts (Test A8) |
| Dur ↔ Moll (GEN4/TKT) | nein – Blatt geht zu (`gen4TkEnd`: Vorher = ↶) | – | nichts (Test A8) |
| MIDI | – | MIDI enthält nur Noten; keiner der erreichbaren Zustände ändert Noten | nichts |
| Messlauf MIX-A (`o.mixa`) | – | misst, was klingt (kein Export) | wie bisher, ausgenommen |

**Behebung:** `vvRenderAudio` → `int53cRender(o)`: ist ein Vorhör-Zustand aktiv (und der Auftrag läuft wirklich: kein Messlauf, kein
zweiter Render, keine Aufnahme, ein Song da), wird vor dem Offline-Durchlauf der Nachher-Stand **still** eingesetzt (`mxgQuiet`: kein
Autosave, kein Verlauf; `VD3.mute`: kein Making-of-Eintrag; Wiedergabe vorher gestoppt, wie es `vvRenderAudio0` ohnehin tut; offene
Verlaufs-Ereignisse vorher mit dem echten Stand), danach kommt in umgekehrter Reihenfolge **exakt** der Vorher-Hörzustand zurück
(`mx2Snap()` identisch, Original-Klangobjekt identisch, UNDO-Spitze identisch). War vorher etwas ungespeichert oder wurde inzwischen
gesichert, sichert `markDirty` danach den echten Stand (wie `mxgPvEnd`). Solange geliehen ist, stehen `mxgSync` (Satzzeilen) und
`mx3Tick` (Auto-Nachregeln) still → die Leiste springt nie auf NACHHER, und der geliehene Stand löst kein Nachregeln aus.
Damit gilt es für jeden Export über `vvRenderAudio`: Video (auch Making-of – sein Ton kommt aus demselben Render), Audio/WAV,
Einzelspuren/Nur Gesang/Nur Chor, Instrumental-WAV.
Fingerabdruck: `vid5Sig` nimmt `int53cSigP()` = Projekt-Teil wie bisher (`int53cHash`), aber mit den Nachher-*Werten* (nur Daten, kein
Klang-Umbau; Mix-Werte per `int53cMxData`, Klang per Objekt-Tausch – danach die alten Objekte zurück). Für Refrain groß/Chor sauber
(Daten nur per ↶/↷ erreichbar) merkt `ch1AB` beim Wechsel Nachher → Vorher beide Fingerabdrücke (nur wenn es ein Video gibt), ebenso
jeder Export in diesem Zustand; gilt, solange Vorher unverändert ist.

**Beleg (nachher):** `p5-mixg.mjs` → Vorher↔Nachher-Video −15,3 dB (wie zwei gleiche Videos, −16,4 dB), „Video ist aktuell“ nach dem
Umschalten auf Nachher (`curB: true`), Leiste weiter VORHER. `p5b-gain.mjs` unverändert (gain-Modus: beide Stände −16,09 dBFS).
`int53c-test.mjs` A0–A8 (Tabelle unten): Video, WAV, Instrumental, Klang-Editor, Marken, Chor – Inhalt = Nachher (Abstand ≈ Rauschen
bzw. bitgleich −120 dB), Gegenprobe echter Vorher-Stand −3,2 dB bzw. +3,3/+7,3 dB; Leiste/Satz nie umgesprungen; Fingerabdruck stabil.

Nicht geändert, zur Kenntnis (Vorschlag im Funk, weil Bedienung): Der Klang-Editor-Vergleich bleibt nach dem Schließen auf „Vorher“
stehen – dann speichern Autosave und Projekt-Container das *Original* (der Vergleich ist kein Projektfeld). Ebenso hält Mix & Master
abgelegt auf Vorher den Vorher-Mix im gespeicherten Projekt, bis Nachher oder ✕. Vorschlag: Vergleich beim Schließen des Editors
beenden bzw. beim Ablegen auf Nachher stellen – sichtbar anders, darum nur vorgeschlagen.

## Befund B (niedrig) – Marken-Editor ohne Bereichsfarbe am Kopf

**Befund (nachgestellt, vorher):** `pruef-ori/heads.mjs` (ONLY=wp) + `stripe.mjs`: `wp` gesang, Oberkante 0,00 (hochkant und quer);
`data-oria=gesang` stimmt.

**Ursache:** `ORI_CSS` färbt nur `.sh-head/.rhead/.vvh/.psh-h`; der Marken-Editor (`#wpSheet`, auch Tonhöhe) hat den Kopf `.qh`.
Zusätzlich: die Tasten im `.qh` (✕, A/B, Text, 44 px hoch) beginnen hochkant an der Oberkante und decken einen Innenschatten zu 35 % zu
(gemessen: Anteil 0,65 nur mit Innenschatten).

**Behebung:** `.sheet[data-oria] .qh{box-shadow:inset 0 3px 0 var(--oriC)}` und Raumschiff-Variante (`inset 7px` + `inset 0 3px`,
`border-top-left-radius:16px` wie die anderen Köpfe) als neue Regeln; dazu `.sheet[data-oria]>.qh::after` – eine 3-px-Linie über den
Tasten (absolut im Blatt, `pointer-events:none`, keine Maße). Kopf-Rechteck normal ↔ Raumschiff identisch, ✕ sichtbar.

**Beleg (nachher):** `int53c-test.mjs` B: Anteil 1,00 hochkant und quer; `heads.mjs`/`stripe.mjs` erneut (Tabelle unten).

## Befund C (niedrig) – Dur ↔ Moll immer „Song“-gelb

**Befund (nachgestellt, vorher):** `pruef-ori/durmoll.mjs`: Demo ohne Song, Matrix, ≡ › Dur ↔ Moll → Blatt „Szene 1“, aber
`popOria: song`, Kopfleiste gelb.

**Ursache:** `ORI_POP` ordnet `tktmode` fest `song` zu; GEN4 öffnet das Blatt aber auch für eine Szene (`GEN4.tk.sc === 'sz'`).

**Behebung:** eine Zeile in `oriLayers` nach der Popup-Zuordnung: bei `tktmode` und `GEN4.tk.sc === 'sz'` → Bereich der Ebene darunter,
ist das der Song → Matrix (eine Szene ist ein Matrix-Ding); `song` und `all` bleiben Song. `oriFrame` läuft im Bild-Takt → die Farbe geht
beim Umschalten im Blatt sofort mit (kein Neuladen).

**Beleg (nachher):** `durmoll.mjs` → `popOria: matrix`, Kopfleiste türkis; `int53c-test.mjs` C (per Finger: Szene → Alles → Szene, mit
Song: Song → Szene → Song), hochkant und quer.

---

## Tests (nacheinander, Ausgaben unter `…/m3/out/<name>/` bzw. `…/m3/out/<name>.log`)

| Lauf | Ergebnis | Ausgabe |
|---|---|---|
| `int53c-test.mjs` (neu; A0–A8, B, C; hochkant 428×926 + quer 926×428) | **46/46** | `out/int53c.log`, `out/int53c/` (Fotos, JSON) |
| `int53c-test.mjs` Gegenlauf auf dem Stand vor INT53C | 16/44 – A, B, C schlagen an (A1 −3,2 dB, A2 veraltet, A3 WAV/Instrumental −3,2 dB, A5 +7,3 dB, A7 +3,3 dB, B 0,00, C „song“) | `out/int53c-gegenlauf.log` |
| `w4500/ori/ori-test.mjs` (gegen `vor-ori-vid5.html`) | **87/87** | `out/ori.log`, `out/ori/` |
| `w4500/vid5/vid5-test.mjs` (Basis `w4500/basis.html`) | **56/56** | `out/vid5.log`, `out/vid5/` |
| `rel-4530/fix/tests/mixg-test.mjs` (Kopie `t-p/x/index.html`, `t-p/basis.html`) | **48/48** | `out/mixg.log`, `out/mixg/` |
| `w4500/gen4/gen4-test.mjs` (Kopie `t-p/x`) | **72/72** („alles grün“) | `out/gen4.log`, `out/gen4/` |
| `rel-4530/fix/tests/int53p-test.mjs` (Kopie `t-p/x`) | **52/52** | `out/int53p.log`, `out/int53p/` |
| Rauchtest `dirigent-test/smoke.mjs` | Titel SYNQUENZER, Fehler [] | `out/smoke.log`, `out/smoke.png` |
| Pflicht `topdefs.cjs` | Skripte 26, Namen 6662, **doppelt 0, Syntaxfehler 0** | `out/topdefs.log` |
| Pflicht `dupkeys.cjs` | **0 doppelte Schlüssel** | `out/dupkeys.log` |
| Datei-Pflicht | Markenwörter 0, „MS 2000“ 1×, „  live: true,“ 1×; VERSION/CHANGES unverändert | in `int53c-test`, `ori-test` |
| Beleg A `pruef-vid5/p5-mixg.mjs` | vorher: Ton VORHER (−3,2 dB), `curB: false` → nachher: −16,1 dB (= zwei gleiche Videos −16,1 dB), „Video ist aktuell“, `curB: true`, Leiste VORHER | `out/beleg-p5.log` |
| Beleg A `pruef-vid5/p5b-gain.mjs` | gain-Modus unverändert: −16,06 / −16,11 dBFS | `out/beleg-p5b.log` |
| Beleg B `pruef-ori/heads.mjs` + `stripe.mjs` (ONLY wp,mx2,mx2dock,video; p/q/q2) | wp 0,00 → **1,00** in p, q, q2; wp `headDiffs 0, allDiffs 0` | `out/beleg-heads.log`, `out/beleg-stripe.log` |
| Beleg B Lagen gegen den Stand vor INT53C (klang, mx2, mx2dock, takes, chor, wp, video; p/q/q2) | überall `headDiffs 0, allDiffs 0` – nichts verschoben | `out/beleg-heads-vs-vor.log` |
| Beleg C `pruef-ori/durmoll.mjs` | `popOria: song` → **matrix**, Kopfleiste türkis | `out/beleg-durmoll.log` |

Hinweis zum Rauschen: zwei Renders desselben Stands unterscheiden sich in dieser App um etwa −15 … −18 dB (Synth-Phasen); die
Prüfung vergleicht darum „Export im Vorher-Zustand ↔ Nachher-Render“ mit „Nachher ↔ Nachher“ (+4 dB Spielraum) und verlangt für den
echten Vorher-Stand einen mindestens 6 dB größeren Abstand (gemessen −3,2 dB). Einzelspur/Chor-Renders sind bitgleich (−120 dB / −105,7 dB).

Erkundungs-Skripte: `int53c/probe-reach.mjs`, `int53c/probe-reach2.mjs` (welche Zustände beim Öffnen von Video/Export noch aktiv
sind), `int53c/probe-qh.mjs` (was den Kopf des Marken-Editors verdeckt), `int53c/rowpx.mjs` (Pixelzeile), `int53c/patch.py` +
`int53c/block.js` (die Änderung), Läufer `int53c/run-all.sh`, `int53c/run-beleg.sh`.

---

# INT53C – Nachprüfung (2. Runde): Neue Befunde 1–3

Stand davor gesichert: `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/rel-4530/m3/int53c2/index-vor-n.html`
(md5 `c6126dd4…`), Kandidat jetzt md5 `9dccd08f…` (`t-p/x/index.html` gleich). Die Änderung steckt in
`int53c2/patch.py`, jede Stelle wird genau einmal getroffen. `diff` gegen den Stand davor: 16 Zeilen − und 36 Zeilen +.
VERSION und CHANGES sind nicht angefasst. „MS 2000“ steht 1×, „  live: true,“ 1×. Es kommt kein Markenwort dazu:
iPhone 28, TikTok 3, Safari 40, Claude 16, alles wie vor dieser Runde. Aussehen, Größe und Bedienung sind unverändert.

| Stelle | Art | Zweck |
|---|---|---|
| `vvMake` | 1 Zeile eingefügt vor `vd3ResPatch`: `int53cHoldEnd()` | Erst nach dem letzten Bild kommt Vorher zurück. Der Fingerabdruck wird danach wie bisher gerechnet. |
| `saveFile`, `tkZipBytes`, `backupAll`, `cloudHandoffUrl` | je 1 Ausdruck: `projectFileObj(…)` → `int53cFile(() => projectFileObj(…))` | Die Projektdatei enthält den Nachher-Stand. |
| INT53C-Block | Kopf-Kommentar; `INT53C.hold`; `int53cRender` mit Halten (`give`); neu `int53cHoldEnd`, `int53cFile`, Hülle um `vvMake`; ch1-Rückweg; Test-API `hold` | Befunde 1–3 |

## Neuer Befund 1 (mittel): Video-Bild war ein halber Zustand – BEHOBEN

- **Nachgeprüft:** Bestätigt mit `nach/n1-bild.mjs` und dem Gegenlauf N1 auf dem Stand davor.
  - WebCodecs: 126 Bilder zeigen die Änderung, 79 Bilder das Original.
  - Aufnahme-Weg (`vvTest({noVE})`): alle 207 Bilder zeigen das Original, der Ton ist aber die Änderung. Damit ist die Vermutung
    „aus dem Code“ gemessen bestätigt.
- **Ursache:** `int53cRender` gab den Stand im `finally` zurück, sobald der Ton fertig war.
  - `vvEncodeWC` zeichnet hinter dem Ton her weiter aus `S`.
  - `vvEncodeMR` zeichnet erst nach dem Ton.
- **Behebung:**
  - Ist ein Video-Auftrag im Gang (`VV.job === true`), legt `int53cRender` den Rückweg als `INT53C.hold` ab, statt ihn gleich auszuführen.
  - `vvMake` ruft `int53cHoldEnd()` nach dem letzten Bild und vor dem Fingerabdruck. Die Rechnung von `vid5Sig` bleibt damit genau wie bisher.
  - Eine Hülle um `vvMake` (keine fremde Zeile umgeschrieben) gibt auch bei Abbruch oder Fehler nach dem Ton zurück. Läuft noch ein
    anderer Auftrag (`VV.job` an), behält dieser seinen Stand.
  - Ein Durchlauf während des Haltens leiht nichts doppelt (`INT53C.hold` → `vvRenderAudio0`).
  - `mxgSync` und `mx3Tick` stehen wie bisher still (`INT53C.n`), bis das letzte Bild gezeichnet ist.
- **Beleg (nachher):**
  - `nach/n1-bild.mjs`: 337/337 Bilder zeigen Cutoff 45,6 (Änderung, `n1`), danach wieder Original 380 und dasselbe Objekt.
  - Test N1: WebCodecs 205/205 und Aufnahme-Weg 207/207 Bilder = Änderung.
  - Abbruch während das Bild noch hält: danach exakt Vorher (Original, `n 0`, kein `hold`).
  - `nach/n2-mx2.mjs` erneut: Video = Nachher (−16,4 dB, Rauschen −16,4), echter Vorher-Stand +2,1 dB.
    Projekt, mx2Snap, ↶/↷ samt Zeiten, Verlauf, Autosave und Making-of sind gleich. Die 158 AudioParam-Werte zeigen 0 Abweichungen.
    Beim Abspielen danach 0 Sprünge, „Video ist aktuell“.
- **Gegenlauf N1** auf dem Stand davor schlägt an. Rest siehe Testtabelle.

## Neuer Befund 2 (mittel): Zwei Datei-Wege nahmen Vorher – Projektdatei BEHOBEN, Echtzeit-Mitschnitt begründet NICHT geändert

Beide nachgeprüft mit `nach/n9-andere-dateien.mjs` auf dem Stand davor: Die Datei hat den Vorher-Mix bzw. Cutoff 380.
Der Mitschnitt läuft live mit 380 und `INT53C.n = 0`.

### Projektdatei: behoben

- **Behebung:** `int53cFile(fn)` = `int53cNach(false)` um den Bau der Datei. Das sind dieselben Werte, die schon der Fingerabdruck
  nimmt (Mix & Master `snap`, Klang-Editor), ohne Klang-Umbau und synchron. Danach kommen sofort die alten Objekte zurück, und
  zu hören bleibt Vorher.
- **Betroffene Wege:** alle, die das offene Projekt als Datei oder Übergabe herausgeben:
  - ≡ › Projekt › Als Datei sichern (.json), auch Projekte › Als Datei sichern für das offene Projekt
  - Export › Sichern mit allen Audios (ZIP, `projekt.json`)
  - Alles sichern (offenes Projekt)
  - Übergabe-Link (Menü › Online)
- **Beleg (nachher):** `n9` zeigt in der Datei den Nachher-Mix 1/0,847/0,755 und Cutoff 45,6. Test N2:
  - Alle vier Wege mit Mix & Master abgelegt auf Vorher → Nachher-Mix. `mx2Snap`, `serialize()`, Leiste und abgelegtes Blatt bleiben Vorher.
  - Alle vier Wege mit dem Klang-Editor auf Original → deine Änderung. Zu hören bleibt das Original, dasselbe Objekt.
  - Ohne Vergleich sind alle vier wie bisher.
  - Gegenlauf N2 auf dem Stand davor schlägt an.
- **Bewusst gleich geblieben:**
  - Refrain groß / Chor sauber auf Vorher: Die Projektdatei hat dort den ↶-Stand. Den Nachher-Stand gibt es nur per ↷ mit
    Klang-Umbau, und das wäre beim Sichern während der Wiedergabe hörbar.
  - Das Autosave sowie das Parken und Kopieren beim Projektwechsel bleiben beim Hörzustand. Das ist der Funk-Vorschlag aus Runde 1.

### Echtzeit-Mitschnitt: begründet nicht geändert, Vorschlag im Funk

Warum nicht geändert:

1. Der Mitschnitt spielt den Song live ab und nimmt den Ausgang auf. Man hört dabei, was in die Datei kommt. Ein stilles Leihen
   wäre also hörbar: Es klänge Nachher, während Leiste und Satz („▶ läuft · du hörst: VORHER“) Vorher zeigen. Der Satz müsste
   sonst eingefroren werden und bliebe dann auf „gestoppt“.
2. Während des Mitschnitts bleibt die App voll bedienbar: Leiste Vorher │ Nachher, Regler, Klang-Editor. Beim Zurückgeben würde
   jede Bedienung am geliehenen Stand überschrieben (Datenverlust), oder der Vergleich müsste sichtbar enden.
3. MX2 nimmt den Mitschnitt bewusst aus dem Pegelangleich (`mx2Trim`: `SREC.on`). Das Paket nimmt also den Vergleichsstand so
   auf, wie er klingt.

Der Test N2 hält fest, dass hier nichts geliehen wird.

**Vorschlag (Funk):** „Startest du den Echtzeit-Mitschnitt, während irgendwo VORHER aktiv ist (Mix & Master, Klang-Editor,
Marken, Refrain groß), stelle ich vorher sichtbar auf NACHHER. Die Meldung heißt dann ‚Song wird aufgenommen – … · mit Nachher‘.
Die Aufnahme klingt so, wie die Datei wird, und die Leiste zeigt NACHHER. Oder soll ich vorher fragen?“ Das ändert sichtbar die
Bedienung und wird darum erst nach Xanders Antwort gebaut.

## Neuer Befund 3 (sehr niedrig): ↷-Eintrag nach dem Chor-Export – BEHOBEN

- **Nachgeprüft:** `nach/n6b-ch1.mjs` auf dem Stand davor: `redoDiff [.mergeKey: UNDEF → null]`, die REDO-Zeit springt von 4187 auf 5959.
- **Behebung:** Der Rückweg legt den ↷-Eintrag mit seinen alten Feldern zurück (`Object.assign({}, r, {items: …})`). Nur die
  Schritte selbst sind frisch aus `groupSwap`, wie bei `undo()`. Damit sind Zeit, Kennung und Text gleich, und es kommt kein
  `mergeKey` dazu.
- **Beleg (nachher):**
  - `n6b`: `redoDiff []`, REDO-Zeit 4182 → 4182, ↶ und ↷ als JSON gleich (`undoJ`, `redoJ`), Projekt gleich, Video aktuell.
  - Test N3: REDO und UNDO als JSON samt Zeiten gleich, dieselben Schlüssel, kein `mergeKey`.
- **Nebenbei gesehen:** Kein neuer Befund. Der Chor-Puffer der Vorher-Stimme ist direkt nach so einem Export kurz „nicht bereit“,
  weil der Render den Nachher-Chor rechnet. Er ist nach ≤ 0,5–1 s von selbst wieder bereit (`int53c2/n6c-ready.mjs`:
  `[false, true, true, …]`).

## Tests (nacheinander, Ausgaben unter `…/m3/out3/`, Läufer `int53c2/run-all.sh`)

| Lauf | Ergebnis | Ausgabe |
|---|---|---|
| `int53c-test.mjs` (A0–A8, B, C, neu N1–N3 + Einhänge-Prüfung; p + q) | **56/56** | `out3/int53c.log`, `out3/int53c/` |
| `int53c-test.mjs` ONLY_N, Gegenlauf auf dem Stand davor | 5/12: N1 ×3, N2 ×2, N3 und die Einhänge-Prüfung schlagen an. Grün bleiben Pflicht, „ohne Vergleich“, „Mitschnitt unverändert“ und „keine Fehler“. | `out3/int53c-gegen.log` |
| `ori-test` | **87/87** | `out3/ori.log` |
| `vid5-test` | **56/56** | `out3/vid5.log` |
| `mixg-test` (`t-p/x`) | **48/48** | `out3/mixg.log` |
| `gen4-test` (`t-p/x`) | **„alles grün“** | `out3/gen4.log` |
| `int53p-test` (`t-p/x`) | **52/52** | `out3/int53p.log` |
| Rauchtest `smoke.mjs` | Titel SYNQUENZER, Fehler [] | `out3/smoke.log`, `out3/smoke.png` |
| Pflicht `topdefs.cjs` | Skripte 26, Namen 6664 (+2: `int53cHoldEnd`, `int53cFile`), **doppelt 0, Syntaxfehler 0** | `out3/topdefs.log` |
| Pflicht `dupkeys.cjs` | **0 doppelte Schlüssel** | `out3/dupkeys.log` |
| Prüfer-Skripte erneut: `n1-bild`, `n9-andere-dateien`, `n6b-ch1`, `n2-mx2` | siehe oben (Bild 337/337 Änderung, Dateien Nachher, Mitschnitt live wie bisher, ↷ gleich, n2 alles gleich und 0 Param-Abweichungen) | `out3/n1.log`, `out3/n9.log`, `out3/n6b.log`, `out3/n2.log` |

**Testanpassung A7:** Die „Nur Chor“-Renders sind fast bitgleich: −105 … −112 dB, das ist die 16-bit-Stufe. Dort ist „Rauschen + 4 dB“
Zufall, der erste Lauf scheiterte mit −106,2 gegen −112,1 (`out3/int53c-lauf1.log`). Jetzt gilt
`≤ max(Rauschen + 4, −90 dB)`. Die Gegenprobe echter Vorher-Stand liegt weiter bei +3,3 dB.

---

# Schlussprüfung (INT53D) – vier Randfälle behoben

Stand davor gesichert: `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/rel-4530/m3/int53d/index-vor-d.html`
(md5 `9dccd08f…`), Kandidat jetzt md5 `b35ccc19…` (`t-p/x/index.html` gleich). `diff` gegen den Stand davor: **1 Zeile − / 53 Zeilen +**
(eine fremde Zeile umgeschrieben – der Bild-Schritt in `vvEncodeMR`, dort reicht kein Einhänge-Punkt –, 3 Zeilen eingefügt, Block
`INT53D-BEGIN … INT53D-END` hinter `INT53C-END`, 49 Zeilen). Jede Stelle trägt den Kommentar „INT53D“. VERSION/CHANGES nicht angefasst,
„MS 2000“ 1×, „  live: true,“ 1×, Markenwörter wie vorher (iPhone 28, TikTok 3, Safari 40, Claude 16, Marken-Liste 0).
Aussehen, Größe und Bedienung unverändert; hörbar/sichtbar bleibt VORHER, danach ist alles exakt wie vorher.

| Stelle | Art | Zweck |
|---|---|---|
| `vvEncodeMR` Bild-Schritt | 1 Zeile ersetzt: `const step = () => { try { step1(); } catch (e) { rej(e); } }, step1 = () => {` | 1: Fehler beim Zeichnen beendet die Aufnahme |
| `histBusy` | 1 Zeile eingefügt (am Anfang): `INT53C.n > 0` → beschäftigt | 4: kein Verlaufs-Durchgang/Keyframe beim Leihen |
| `histSweep` | 1 Zeile eingefügt (nach der ersten): `INT53C.n > 0` → nichts tun, `HIST.dirty` bleibt | 4: auch `histLeave` (Seite weg) und `histExport` (Verlauf in die Datei) |
| `int53cRender` (INT53C-Block) | 1 Zeile eingefügt nach `d0`: offener Durchgang vor dem Leihen | 4: die Änderung kommt mit dem echten Stand in den Verlauf |
| Block INT53D | neu | `INT53D`, `int53dPut`, `int53dCh1Data`, Hülle um `int53cFile` (2), Hülle um `vvEncodeWC` (3), Test-API `SYNQUENZER.int53d` |

## Befund 1 (mittel): Aufnahme-Weg hing nach einem Fehler beim Zeichnen – BEHOBEN

- **Befund (nachgestellt):** `schluss/s2b-mr-fehler.mjs` auf `index-vor-d.html` (`int53d/vorher/s2b-snd.log`): nach 25 s und nach ✕
  weiter `hoere: Nachher, n 1, hold true, mute 1, job true, busy true`, das Versprechen endet nie.
- **Ursache:** `vvEncodeMR` zeichnet jedes Bild in `requestAnimationFrame(step)`. Wirft das Zeichnen, landet die Ausnahme im
  rAF-Rückruf; `step` plant sich nicht neu ein, und weder `res` noch `rej` wird gerufen. Damit laufen weder das `finally` von `vvMake`
  noch die INT53C-Hülle (`int53cHoldEnd`) – der Nachher-Stand bleibt geliehen, `VV.job` bleibt an (jeder weitere Export: „Läuft schon“).
  Das Hängen selbst gab es schon in 4.52.
- **Behebung:** Der Bild-Schritt ist in `try { … } catch (e) { rej(e); }` gefasst (umbenannt zu `step1`, `step` ruft ihn). Ein Fehler
  beendet die Aufnahme wie beim WebCodecs-Weg mit dieser Meldung: `.finally` stoppt Recorder, Quelle und Spuren, `vvMake` räumt auf,
  die Hülle gibt den Vorher-Stand zurück, `vvGo` zeigt „Video fehlgeschlagen: …“.
- **Beleg:** `s2b-mr-fehler.mjs` (snd und mx2, `int53d/nachher/s2b-*.log`): `ende: „Testfehler beim Zeichnen“`, danach `hoere Vorher,
  n 0, hold false, mute 0, job false`. `s2-bild-abbruch.mjs` snd + mx2: alle 10 Läufe `diff []`, „Aufnahme: Fehler beim Kodieren“
  jetzt `err: Testfehler beim Kodieren` nach 6 s statt „HÄNGT“; Leiste nie NACHHER. Test D1 (je Klang-Editor und Mix & Master,
  über den Knopf „Video erstellen“): Meldung „Video fehlgeschlagen: Testfehler beim Zeichnen“, Projekt/↶/↷/Leiste/Live-Kette exakt
  Vorher, nächster Export (Aufnahme-Weg) läuft, jedes Bild Nachher.

## Befund 2 (mittel): „Chor sauber“ / „Refrain groß“ auf Vorher – Projektdatei nahm Vorher – BEHOBEN

- **Befund (nachgestellt):** `schluss/s7-chor-datei.mjs` (`int53d/vorher/s7.log`): .json, ZIP, Alles sichern, Übergabe = VORHER,
  erste Abweichung `/tracks/6/clips/2/audio/chor/grp/hp: 120 ≠ 160`; Video/WAV dagegen Nachher.
- **Ursache:** Den Nachher-Stand gibt es nur als ↷-Eintrag (`REDO`-Spitze, `ch1ab`). `int53cFile` setzte nur die Werte von Mix & Master
  und Klang-Editor ein; der Chor-Schritt wäre nur über `redo()` erreichbar gewesen – mit Klang-Umbau, also hörbar.
- **Behebung:** Die ↷-Schritte genau dieses Eintrags werden **nur als Daten** eingesetzt (`int53dPut`: dieselben Datenzeilen wie
  `undoApply`, ohne die Folgen – kein `clipRestored`, `songChanged`, `g6pcApplyAll`, `mixaAfter`, keine Meldung, kein Verlauf), dann die
  Datei gebaut und sofort die alten Objekte zurückgelegt (synchron – kein Audio-Takt, kein Timer sieht den Tausch). Erst der
  Chor-Schritt, dann wie bisher Mix & Master / Klang-Editor (Reihenfolge wie beim Export). Bekannte Arten: `clip`, `takes`, `song`,
  `chorlanes`, `mixa` – das sind alle, die „Chor sauber“ (clip/song + takes) und „Refrain groß“ (clip/song + chorlanes, mit
  Strophe trocken + mixa) erzeugen. Eine andere Art → nichts eingesetzt, Datei wie bisher (Vorher). Bedingung wie beim Export
  (`int53cCh1`: Chor- oder Mix-&-Master-Blatt offen/abgelegt); Blatt in Vorher geschlossen = verworfen → Datei Vorher (wie bisher).
  Der Fingerabdruck (`int53cHash`) bleibt unverändert.
- **Beleg:** `s7-chor-datei.mjs` (`int53d/nachher/s7.log`): alle vier Wege NACHHER, `ersteAbweichungDateiZuNachher: null`, danach
  `side A`, Projekt = Vorher. Erkundung `int53d/probe-ch1.mjs` (clean, big, bigfx): Daten-Einsetzen = Projekt nach echtem ↷ (bitgleich),
  Rückweg = Vorher. Test D2: drei Fälle (Chor sauber mit eigener Stimme, Refrain groß, Refrain groß mit Lead-Hall) – alle vier Dateien
  Nachher; Projekt, ↶/↷, **dieselben Objekte** (Clip, Song, Takes, Chor-Spuren), 0 AudioParam-Abweichungen; jede Art einzeln =
  `undoApply` (auch `song`); unbekannte Art → wie bisher. `s6-verlauf.mjs ch1`: alle 10 Wege `diff []`.

## Befund 3 (niedrig): Abbruch vor dem Offline-Durchlauf – verwaister Durchlauf hielt Nachher – BEHOBEN

- **Befund (nachgestellt):** `schluss/s8b-frueh-nachher.mjs` (`int53d/vorher/s8b.log`): nach „abgebrochen“ `hoere Nachher, n 1`;
  ✕ + NACHHER → am Ende Seite B / Leiste NACHHER, im Projekt aber der Vorher-Mix (Mischen verloren). `s1-hold.mjs` B1/B2 (Schlussprüfung):
  ~2,5 s geliehen nach „abgebrochen“, sofortiger Neustart „Wiedergabe läuft“. (`s8` ist zeitabhängig: im Nachstell-Lauf traf der
  Abbruch das Chor-Warten zufällig noch rechtzeitig.)
- **Ursache:** `vvMake` wartet im `catch` nur auf `rP`, wenn `VV.off` gesetzt ist. Das Leihen (`int53cRender`) beginnt aber vorher;
  danach setzt das `finally` von `vvMake` `VV.cancel = false`, der Durchlauf sieht den Abbruch nicht mehr und rechnet durch.
- **Behebung:** Hülle um `vvEncodeWC` (dort kommt ein früher Abbruch an; der Aufnahme-Weg wartet ohnehin auf den Ton): endet sie mit
  Abbruch, während dieser Auftrag geliehen hat (`INT53C.n > 0`, nicht im Halten), bleibt `VV.cancel` an und sie wartet auf `job.rP`.
  Der Durchlauf bricht an seinem nächsten Prüfpunkt ab (Chor-Warten alle 40 ms, vor dem Start, jeder Schritt), `int53cRender` gibt
  zurück – erst dann geht „abgebrochen“ weiter. Andere Fehler (Kodierer) laufen wie bisher in den Ersatzweg.
- **Beleg:** `s8b` (`int53d/nachher/s8b.log`): nach Abbruch `hoere Vorher, n 0`; ✕ + NACHHER → `Nachher/B`, Leiste NACHHER, bleibt so.
  `s8`: direkt nach „abgebrochen“ `n 0`, ↶/↷/Projekt gleich. `s1-hold` B1: `afterEnd n 0`, `borrowedAfterEndMs 0`, `offAfterEnd 0`;
  B2: Neustart „fertig“, am Ende Original. Test D3 (Klang-Editor; Mix & Master mit ✕ + NACHHER): `waits 1`, kein Durchlauf danach.

## Befund 4 (niedrig): Verlauf – geliehener Wert landete im Verlauf – BEHOBEN

- **Befund (nachgestellt):** `schluss/s1d-echt.mjs` (`int53d/vorher/s1d.log`): Umbenennen 300 ms vor dem Export → zwei Einträge
  `name + cutoff=45.6` und `cutoff=380` (Video und WAV).
- **Ursache:** `histBusy()` prüfte nur `UI.vvOff`; der Verlaufs-Timer lief vor dem Offline-Durchlauf und im Halten danach mit dem
  geliehenen Stand. Ebenso hätten `histLeave` (Seite weg) und `histExport` gesweept.
- **Behebung:** `histBusy()` ist beschäftigt, solange `INT53C.n > 0`; `histSweep()` tut dann nichts (`HIST.dirty` bleibt, der Timer holt
  es danach mit dem echten Stand nach); `int53cRender` erledigt einen offenen Durchgang noch vor dem Leihen (wie schon die offenen
  Ereignisse), damit die Änderung zur richtigen Zeit mit dem echten Stand im Verlauf steht.
- **Beleg:** `s1d` (`int53d/nachher/s1d.log`): je genau ein Eintrag `name=…`, kein Cutoff. `s1c-phasen.mjs`: einziger Durchgang bei
  `n 0`, keine Einträge. `s1-hold` A2/A3: `histAdded 0` (vorher 2, geliehener Cutoff), `s1b-hold-hist`: `added 0`. Test D4: Video,
  Aufnahme-Weg, WAV je ein Eintrag (nur der Name); Timer im Offline-Durchlauf + `histLeave` im Halten → ein Eintrag mit echtem Stand;
  `histVerify` ok.

## Tests (nacheinander, Ausgaben unter `…/m3/out4/`, Beleg-Skripte unter `…/m3/int53d/nachher/`, Läufer `int53d/run-all.sh`)

| Lauf | Ergebnis | Ausgabe |
|---|---|---|
| `int53d-test.mjs` (neu; D1–D4 + Pflicht; hochkant) | **31/31** | `out4/int53d.log`, `out4/int53d/` |
| `int53d-test.mjs` Gegenlauf auf `int53d/index-vor-d.html` | 12/31 – D1 (hängt 45 s, „Läuft schon“), D2 (Dateien VORHER, `int53dPut` fehlt), D3, D4 (geliehener Cutoff) und die Einhänge-Prüfung schlagen an; grün bleiben Pflicht, „bleibt Vorher“, „Blatt zu = Vorher“, histVerify, „keine Fehler“ | `out4/int53d-gegen.log` |
| `int53c-test.mjs` | **56/56** | `out4/int53c.log` |
| Beleg-Skripte `schluss/` (s1, s1b, s1c, s1d, s2 snd/mx2, s2b snd/mx2, s3 snd/mx2, s4, s5, s5b, s6 ch1/snd/mx2, s7, s8, s8b) | siehe Befunde; s3: alle Wege Nachher; s4 (ohne Vergleich): Übergabe, .json, ZIP, serialize, MIDI, ↶ gleich wie Kandidat davor (Ton/Video sind von Lauf zu Lauf verschieden, auch k1 ↔ k2); s5/s5b wie vorher; s6: alle 30 Wege `diff []` | `int53d/nachher/*.log`, Nachstellen `int53d/vorher/*.log` |
| `w4500/ori/ori-test.mjs` (gegen `vor-ori-vid5.html`) | **87/87** | `out4/ori.log`, `out4/ori/` |
| `w4500/vid5/vid5-test.mjs` (Basis `w4500/basis.html`) | **56/56** | `out4/vid5.log`, `out4/vid5/` |
| `rel-4530/fix/tests/mixg-test.mjs` (Kopie `t-p/x/index.html`, neu kopiert, md5 gleich) | **48/48** | `out4/mixg.log`, `out4/mixg/` |
| `w4500/gen4/gen4-test.mjs` (Kopie `t-p/x`) | **„alles grün“** | `out4/gen4.log`, `out4/gen4/` |
| `rel-4530/fix/tests/int53p-test.mjs` (Kopie `t-p/x`) | **52/52** | `out4/int53p.log`, `out4/int53p/` |
| Rauchtest `dirigent-test/smoke.mjs` | Titel SYNQUENZER, Fehler [] | `out4/smoke.log`, `out4/smoke.png` |
| Pflicht `topdefs.cjs` | Skripte 26, Namen 6667 (+3: `INT53D`, `int53dPut`, `int53dCh1Data`), **doppelt 0, Syntaxfehler 0** | `out4/topdefs.log` |
| Pflicht `dupkeys.cjs` | **0 doppelte Schlüssel** | `out4/dupkeys.log` |
| Datei-Pflicht | Markenwörter wie vorher, „MS 2000“ 1×, „  live: true,“ 1×; VERSION/CHANGES unverändert | in `int53d-test`, `ori-test` |

Offen bleibt nichts aus diesen vier Befunden. Weiter nur als Funk-Vorschlag (sichtbar, darum nicht gebaut, wie in Runde 1/2):
Echtzeit-Mitschnitt und Autosave bleiben beim Hörzustand.

Erkundung/Läufer: `int53d/probe-ch1.mjs` (welche ↷-Schritte, Daten = echtes ↷), `int53d/run-vorher.sh` (Nachstellen auf dem Stand
davor), `int53d/run-nachher.sh` (Beleg-Skripte danach), `int53d/run-all.sh` (alles nacheinander).

Hinweis: `int53d/nachher/s2b-*.log`, `s7.log`, `s8.log`, `s8b.log`, `s1d.log` liefen auf der Zwischenfassung md5 `51196b94…`; danach wurde
nur in der alten `histBusy`-Zeile ein versehentlich entferntes Leerzeichen zurückgesetzt (die fremde Zeile ist jetzt wieder
byte-gleich). Alle übrigen Läufe der Tabelle (auch `int53d-test` 31/31 mit D1–D4) liefen auf dem Endstand `b35ccc19…`.
