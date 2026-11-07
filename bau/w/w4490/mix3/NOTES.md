# MIX3 – ein Mix-&-Master-Blatt überall, Mix & Master live in der Matrix, Chor sauber, „Refrain groß“

## Für Xander
- **Ein Blatt für Mischen und Mastern:** [AUTO-MASTER], [MIX-ASSISTENT], der Master-Balken und [Mix-Assistent] im EQ · KOMP-Blatt öffnen alle das Blatt **Mix & Master**. [Vorschläge je Spur] zeigt die Tipps dort, je Tipp [Übernehmen]/[Zurück]. Pegel je Spur in derselben dB-Zahl wie am Spurkopf.
- **Mix & Master in der Matrix:** Läuft eine Szene, hört das Blatt 4 Takte mit (Messen aus **Auto · Song · Live**). Dafür brauchst du keinen Song, und das Ergebnis klingt sofort.
- **Auto-Nachführen:** Nach einer Änderung wartet es 4 s, misst live und gleitet sanft nach. Stumm/Solo zum Abhören verstellt nichts. Pro Mal ändert es höchstens ±2 dB, und während einer Aufnahme nie.
- **Mit dem Song gemastert?** Dann bleibt der Song-Master. Beim Abspielen des Songs gleicht es nur den Pegel derselben Takte an. 4 Takte aus der Matrix ersetzen ihn nicht mehr.
- **Chor sauber / Refrain groß / Refrain 2× singen** wie gehabt. [A/B · vorher|nachher] vergleicht jetzt wirklich mit vorher (Chor und Hall/Echo des Leads).
- **Chor beim Mischen:** Mischen (live) misst den Chor getrennt vom Lead und zeigt den Abstand („4,7 dB unter dem Lead – passt“). Wenn nötig, leuchtet [leiser] bzw. [lauter].

## Technik
Ein Block `MX3 BEGIN … MX3 END` (JS, direkt hinter `MX2 END`) und ein CSS-Block `MX3 BEGIN … MX3 END` (hinter dem MX2-CSS). Präfixe `mx3*`, `ch1*`, `MX3`, `CH1`, `MIX3_API`. Neue Datenfelder (additiv, alte Projekte unverändert): `fxBus.am.mx3 = {af?: 0, b?: 's'}`, `chor.grp.ch1`, `take.ch1`. Dazu kommen Laufzeit-Schlüssel `MIXA.res.mx3s` und die Undo-Kennung `ch1ab` (nur im Speicher).

**MX3 (live):** Worklet `synq-mx3-cap` (im MIX-A-Modul) schneidet für 4 Takte (4–8 s) den Master-Eingang `AU.M.vol` und den bisherigen Weg (`M.am.ceil`) mit. Es meldet jetzt auch den Start-Frame `f0`. Merkmale und Prüfung laufen im MIX-A-Worker, das Ergebnis landet als `MX2.cache` (src 'live'). Mischen live nutzt dieselben Analyse-Worklets an den Spuren. Dazu kommen Lead (`AU.tracks[st].cut`) und Chor-Gruppen-Bus: bestehende Stücke über `r.chG.guide`, neue Stücke über den vorhandenen Abgriff `G6PC.tap`. Das ergibt `MX3.voc` (LUFS Lead/Chor, Abstand, Empfehlung).

Auto-Nachführen:
- Takt 1 s (`mx3Tick`). Eine Änderung erkennt es über `TKGEN` plus Prüfsumme `mx3Sig`: Klänge, Mix, Chor ohne Stumm, Clip-Noten, Busse, Song.
- Stumm/Solo ist ein eigener Schlüssel `mx3MuteKey`. Er löst nichts aus, aber das Nachführen wartet, solange er anders ist als bei der Messung.
- Wartegründe `mx3WaitWhy`: rec, ab, mute, play, song, songm.
- Weg `mx3Mode`: [Live] → live, [Song] → Song, Auto → Grundlage `am.mx3.b`. `mx3Keep` setzt `b = 's'`, wenn mx2Master aus einer Song-Messung kommt.
- Live heißt `mx3Run` + `mx3Apply`, mit höchstens ±2 dB und genauer Nachprüfung erst nach dem Gleiten.
- Song heißt `mx3FollowRel`: dieselben Song-Takte. Vorher stammt aus `MX2.cache.C.Kf` der Song-Messung (100-ms-Blöcke), nachher aus dem Live-Mitschnitt (K-gewichtet). Nur der Pegel ändert sich (höchstens ±2 dB), Klang und Kompression bleiben. Ohne ▶ SONG oder ohne Song-Messung wartet es.
- `mx3Run` merkt sich den Stand bei Messbeginn. Beim Nachführen verwirft es das Ergebnis, wenn sich währenddessen etwas geändert hat oder eine Aufnahme beginnt; dann misst es nach.
- `mx3RampFrom` friert bei Aufnahmebeginn auf dem Zwischenstand ein (`mx3Freeze`: Daten = Knoten).
- Anderes Projekt (`S` neu) ruft `mx3Reset` auf.

Ein Blatt: `mx3Open` holt ein abgelegtes Blatt zurück (`pshUndock`). `mx3Sug`/`mx3SugRow` analysieren ohne zu übernehmen und nutzen `mixaApply`/`mixaRevert`/`mixaSug`/`mixaIsApplied`. Live analysiert es neu, wenn inzwischen eine andere Szene läuft. Der Live-Status ersetzt „erst ● SONG“.

**CH1:**
- „Chor sauber“: je eigener Chor-Aufnahme Säubern 60 % und Ausrichten. Das nutzt die VS5a-Marken beider Takes, nur Silben-Anfänge mit Energieanstieg ≥ 6 dB, Zuordnung ±90 ms, Verschiebung ±40 ms und die Zeitkarte „Dehnen“. Dazu kommt G2 weich/Raster/85 %/natürlich 40. Für die Gruppe gilt hp ≥ 160, sib −12, Hall ≥ Lead + 0,1, Vorverzögerung, Breite ≥ 0,6. Ein Gruppen-↶.
- „Refrain groß“: `g6pApplyStyle` mit dem Rezept `CH1_RG` und dem Klang am Stück `ch1GroupX`. Ein flaches Gruppen-↶ mit Kennung `ch1ab`.
- A/B: `ch1AbSide`/`ch1AB` schalten über ↶/↷ genau dieses Schritts (die Kennung wandert mit über `groupSwap`). Der Knopf erscheint nur, solange der Schritt oben liegt. Solange A läuft, pausiert das Nachführen.
- Auto-Ausrichten neuer Doppel-Takes: `ch1AutoTick`.

**Einhänge-Zeilen (fremder Code, je eine Zeile/ein Ausdruck):**
- `mixaModSrc`: `+ mx3ModSrc()`
- `mixaNormAm`: `...mx3NormAmX(a)`
- `mx2Master`: `Object.assign(…, {mx2: …}, mx3Keep())`
- `mx2Run` erste Zeile: `if (mx3UseLive()) return mx3Run(withMix, tag);`
- `mx2Tap` erste Zeile: `if (mx3Tap(b)) return;` (fängt auch `asst` ab)
- `mx2Paint` nach `c.innerHTML = …`: `mx3Paint(p, c);`
- `mixaBtns` onTap: `mx3Open(b.dataset.a === 'am' ? 'am' : 'mix')` (statt `amSheet`/`mixaSheet`)
- `mtrMasterBtn` onTap: `mx3Open(null)` (statt `openMasterPage`)
- **neu (Prüfung):** `mx1EqSheet` onTap: `else if (a === 'mix') { mx3Open('mix'); haptic('tick'); }` (statt `mixaSheet()`)
- `g6pNormGrp` vor `return o`: `{ const q = ch1NormGrp(g.ch1); if (q) o.ch1 = q; }`
- `g6pApplyStyle`: `const S0 = id && id.voices ? id : G6P_STYLE[id]` und `style: id && id.voices ? id.style : id`
- `g6pcGroup`: `if (!meas && a.chor.grp && a.chor.grp.ch1 && a.chor.grp.ch1.rg) ch1GroupX(G, a);`
- `g6pcGroupDrop`: `if (G.ch1) ch1GroupDrop(G);`
- `g6pStart` nach `g6pcGroupSet(G, a, false, false, gA);`: `if (G.ch1) ch1Start(G, a, o, r);`
- `g6SheetPaint`: `g6pePaint(p, X); ch1G6Row(p, X);`
- `g6peTap` erste Zeile: `if (b.dataset.ch1) return ch1Tap(b);`
- `openMarkSheet` nach `gr1MarkSheetPaint(p, m);`: `ch1MarkSheetPaint(p, m);`
- Ende der API-Liste (nach `vd3`): `Object.assign(SYNQUENZER, {mix3: MIX3_API}); mx3Boot();`

## Prüfung (unabhängiger Prüfer, 9 Befunde – alle nachgeprüft, alle behoben)
1. **Stumm löst Nachführen aus → Pegelsprung (hoch)**: stimmte. Behoben: Stumm/Solo (auch Chor aus, Chor-Spur stumm) zählt nicht mehr als Änderung. Eine echte Änderung wartet, solange Stumm/Solo anders ist als bei der Messung. Pro Nachführen höchstens ±2 dB.
   Test: 5 Spuren stumm → 0 Nachführen, Gain ±0. Änderung bei stummen Spuren → wartet („mute“), nach Stumm aus 1× (+0,03 dB). Alle Spuren −12 dB → +2,00 dB statt +12.
2. **Aufnahme während der Messung → Master gleitet trotzdem (mittel)**: stimmte. Behoben: Das Ergebnis wird verworfen, wenn bei Messende eine Aufnahme läuft. Beginnt die Aufnahme während des Gleitens, bleibt der Master auf dem Zwischenstand (Daten = Knoten); nach der Aufnahme misst es neu.
   Test: scharf 2 s nach Messbeginn → 0 Nachführen, 1 verworfen, Gain ±0, kein Gleiten; nach der Aufnahme 1×.
3. **Änderung während der Messung geht verloren (mittel)**: stimmte. Behoben: Grundlage ist der Stand bei Messbeginn. Beim Nachführen wird eine währenddessen geänderte Messung verworfen und neu gemessen.
   Test: Änderung 6 s in die 8-s-Messung → verworfen, dann 1× nachgeführt, danach `pending` false und Grundlage = jetziger Stand.
4. **Song-Master wird durch 4 Takte ersetzt (mittel)**: stimmte. Behoben über den zweiten Vorschlag, die Pegeldifferenz derselben Takte. Der Master merkt sich seine Herkunft (`am.mx3.b = 's'`). In der Matrix wartet es. Beim Song vergleicht es dieselben Takte, vorher aus der Song-Messung und nachher live; nur der Pegel ändert sich, Klang und Kompression bleiben.
   Ein automatisches Offline-Rendern wurde bewusst nicht gebaut: `vvRenderAudio` stoppt die Wiedergabe und sperrt die Ansichten.
   Test (Aufbau wie beim Prüfer): Fläche +0,5 dB, Song-Takte vorher −20,69 / nachher −20,21 LUFS → Gain −0,48 dB (vorher beim Prüfer +3,44 dB); Klang und Kompression bleiben gleich.
5. **Projekt wechseln + ▶ verstellt den Master (mittel)**: stimmte. Behoben: Ein neues Projekt (`S` neu) setzt Grundlage, `gen`, `pending`, ↶-Nachführen und Song-Bezug zurück.
   Test: laden → `pending` false; ▶ 7 s → 0 Nachführen, Gain ±0.
6. **Altes Mix-Assistent-Blatt erreichbar (mittel)**: stimmte. Behoben: Der Knopf im Blatt heißt jetzt [Vorschläge je Spur]. Er analysiert ohne zu übernehmen und zeigt je Spur die Vorschläge (auch „Wahl“-Optionen) mit [Übernehmen]/[Zurück], ≥ 44 px. [Mix-Assistent] im EQ · KOMP-Blatt öffnet das eine Blatt (Weg Mischen), auch wenn es abgelegt war. Das ✕ 36×40 gehörte zum alten Blatt; dieses Blatt ist nicht mehr erreichbar.
   Test: 11 Vorschlagszeilen, 1 Übernehmen = 1 ↶ „Mix: …“, Blatt bleibt `mx2`; EQ · KOMP → `mx2`, nie `mixa`.
7. **Lead/Chor nicht getrennt (mittel)**: stimmte (`tr.chor.length` ist bei `{lanes}` immer undefined). Behoben: Erkennung über `tr.chor.lanes`. Beim Mischen live wird der Chor als eigene Rolle mitgeschnitten (Lead nach dem Regler ↔ Chor-Gruppen-Bus). Der Abstand steht in der Zeile Chor, die Empfehlung leuchtet.
   Der Chor kommt nicht in die MIX-A-Worker-Liste `MIXA.res.T`: der MX1-Worker greift über `t.i` auf Spur-Daten zu, ein Pseudo-Eintrag wäre riskant.
   Test: Lead −20,3 / Chor −25,0 LUFS → „4,7 dB unter dem Lead – passt“.
8. **Status widerspricht sich (niedrig)**: stimmte. Behoben: Bei „Messen aus: Live“ steht statt „erst ● SONG“ der Live-Status („Live gemessen (8,3 s) · …“ bzw. „Geändert seit der Messung [neu messen]“).
9. **A/B mit [Chor an/aus] ist kein Vorher (niedrig)**: stimmte. Behoben: Der neue Knopf [A/B · vorher|nachher] (Chor-Blatt hochkant 4 Spalten, quer in der unteren Knopfzeile; Mix & Master › Gesang) ist ein echtes Vorher/Nachher über ↶/↷ genau dieses Schritts.
   Test: Lead-Sends 0,25/0,15 → A: Chor ohne Refrain groß, Sends 0,25/0,15 → B: wieder Refrain groß, 0,08/0,04.

## Tests
- `node mix3-test.mjs <index.html> <ordner>` → **34/34 OK** (Ergebnis `mix3-test-ergebnis.json`). Die 23 bisherigen Prüfungen bleiben, dazu 11 neue:
  - Prüfung 9, 7, 6 (2×) im selben Projekt.
  - Prüfung 8, 1 (2×), 2, 3, 5, 4 in einem frischen zweiten Tab.
  - Angepasst: Das Chor-Blatt darf den 4. Knopf [A/B · …] zeigen. `gain1` wird 0,8 s nach dem Gleiten gelesen, weil die genaue Nachprüfung jetzt erst nach dem Gleiten kommt.
- Pflicht: topdefs 0 doppelt / 0 Syntaxfehler, dupkeys 0, Rauchtest `errors []`, Markenwörter 0, „MS 2000“ 1×, „  live: true,“ 1×.
- Gegenprobe: MX2-Test (w4480/mx2/mx2-test.mjs) auf dieser Kopie **34/34 OK**.
- Fotos:
  - `mix3-p-blatt.png` (hochkant, Blatt mit Messen aus/Auto-Nachführen), `mix3-l-blatt.png` (quer).
  - `mix3-p-chor.png` (Chor-Blatt hochkant mit [A/B · nachher]), `mix3-l-chor.png` (quer, Gesang + A/B in der unteren Knopfzeile).
  - `mix3-l-marke.png` (Marken-Blatt quer), **neu** `mix3-p-vorschlaege.png` (quer: Vorschläge je Spur im Blatt mit [Übernehmen]/[Zurück]).

## Offen
- Song-Master in der Matrix: Das Nachführen wartet auf ▶ SONG. Nach dem Neuladen eines Projekts mit Song-Master fehlt die Song-Messung, deshalb steht „[Mastern] misst den Song neu“.
- Die Pegeldifferenz gilt für die gerade gespielten Song-Takte. Ändert sich nur ein Teil des Songs (z. B. nur der Refrain), ist sie eine Näherung für den ganzen Song.
- Chor als eigene Rolle nur beim Mischen **live**. Beim Mischen über [Song] (Offline-Render) fehlt der Chor-Abgriff. Den Chor-Pegel ändert Mischen nicht selbst; es zeigt nur die Empfehlung.
- Das alte Mix-Assistent-Blatt (`mixaSheet`) gibt es im Code noch (Test-Schnittstelle), aus der Oberfläche ist es nicht mehr erreichbar.
- „Hauch-Schicht“ ist eine leise, gesättigte Höhen-Schicht des Leads, keine echte Flüster-Aufnahme. „Oktave tiefer dunkel“ nutzt den Gruppen-Klang.
- Lead-Effekte von „Refrain groß“ hängen am Stück: Stumm/Solo der STIMME-Spur wird beim Einsetzen des Stücks gelesen.
- Ausrichten nutzt die Zeitkarte des Takes. Wer danach Marken der Chor-Aufnahme verschiebt, quantisiert sie neu.
- Test mit echter Stimme/iPhone (CPU, Latenz des Mitschnitts) steht aus.
