# MIX3 – ein Mix-&-Master-Blatt überall, Mix & Master live in der Matrix, Chor sauber, „Refrain groß“

## Für Xander
- **Ein Blatt für Mischen und Mastern:** [AUTO-MASTER] und [MIX-ASSISTENT] (FX › MASTER) und der kleine Master-Balken öffnen jetzt alle das Blatt **Mix & Master** – der passende Weg (Mastern bzw. Mischen) leuchtet. [Messen]/[Übernehmen] gibt es nicht mehr, [Mastern] macht beides. Neben jeder Spur steht ihr Pegel mit derselben dB-Zahl wie am Spurkopf.
- **Mix & Master in der Matrix:** Läuft eine Szene, hört das Blatt 4 Takte mit (Messen aus **Auto · Song · Live**) – kein Song nötig, das Ergebnis klingt sofort. Mischen geht auch live.
- **Auto-Nachführen** (an, sobald du einmal gemastert hast): Nach jeder Änderung (Clip, Klang, Pegel) wartet es 4 s Ruhe, misst kurz live und gleitet in 1,5 s auf die neuen Werte – nie während einer Aufnahme. [↶ Nachführen zurück] im Blatt.
- **Chor sauber** (Chor-Blatt, Mix & Master › Gesang): selbst gesungene Chorstimmen rücken im Timing an den Lead (höchstens ±40 ms, ohne hörbares Schneiden), Tonhöhe enger aber natürlich, Brummen/Rauschen weg, Zischlaute leiser, Chor etwas hinter und breiter als der Lead. Ein ↶.
- **Refrain groß** (Chor-Blatt, Marken-Blatt eines Refrain-Teils, Mix & Master): aus deiner einen Lead-Aufnahme im Refrain 3 enge Dopplungen links/rechts, Oktave tiefer, Terz/Quinte aus den Akkorden, leiser Hauch, Parallel-Kompression, Luft, kurzer Gated-Plate und Echo 1/8 punktiert nur am Zeilenende; die Strophe bleibt trocken. Ein ↶; [Chor an/aus] = A/B.
- **Refrain 2× singen:** legt zwei Doppel-Spuren (L/R) an und schaltet „Selbst singen“ scharf – jede Aufnahme wird danach automatisch an den Lead ausgerichtet.

## Technik
Ein Block `MX3 BEGIN … MX3 END` (JS, direkt hinter `MX2 END`) und ein CSS-Block `MX3 BEGIN … MX3 END` (hinter dem MX2-CSS). Präfixe `mx3*`, `ch1*`, `MX3`, `CH1`, `MIX3_API`; neue Datenfelder `fxBus.am.mx3`, `chor.grp.ch1`, `take.ch1` (additiv, alte Projekte unverändert).

**MX3 (live):** Worklet `synq-mx3-cap` (im MIX-A-Modul) schneidet den Master-Eingang `AU.M.vol` und den bisherigen Weg (`M.am.ceil`) für 4 Takte (4–8 s) mit; Merkmale/Prüfung im MIX-A-Worker (`mx2feat`/`mx2exact`), Ergebnis als `MX2.cache` (src 'live') – alles Weitere (Stile, Vorlieben, A/B, Warum) ist MX2. Mischen live: dieselben Analyse-Worklets `synq-mixa-an`/`synq-mx1-an` an den Spuren, Ende über absolute Frame-Zahl, Worker-Auftrag `mix` ohne Songteile. Auto-Nachführen: Takt 1 s (`mx3Tick`), Änderung = `TKGEN` + Prüfsumme `mx3Sig` (Klänge, Mix, Stumm, Chor, Clip-Noten, Busse, Song – ohne Auto-Master), 4 s Ruhe, nur wenn es läuft, nicht bei Aufnahme/Selbst-Singen/Render/A-Seite; Anpassung `mx3Apply` ohne ↶-Schritt, Gleiten `mx3RampFrom` (alte Parameter sofort zurück an den Knoten, dann alle 60 ms S-Kurve auf die neuen; eine andere Änderung bricht ab). Speicher: nur „aus“ (`am.mx3 = {af: 0}`).

**CH1:** „Chor sauber“ = je eigener Chor-Aufnahme Säubern 60 %, Ausrichten (VS5a-Marken beider Takes, nur Silben-Anfänge mit Energieanstieg ≥ 6 dB, Zuordnung ±90 ms, Verschiebung ±40 ms, Zeitkarte Modus „Dehnen“ über `VSM.makeWarp`), G2 weich/Raster/85 %/natürlich 40 (nur ohne eigene Tonhöhe); Gruppe hp ≥ 160, sib −12, Hall ≥ Lead + 0,1, Vorverzögerung, Breite ≥ 0,6; ein Gruppen-↶ (Takes + Stelle). „Refrain groß“ = `g6pApplyStyle` mit dem Rezept-Objekt `CH1_RG` (keine neue Stil-Tabelle) für alle Refrain-Stellen (Teil-/Szenen-Name Refrain/Chorus/Hook, Song-Teil aus einer Szene, Song-Stücke), STIMME-Sends klein, ein flaches Gruppen-↶; Klang am Stück `ch1GroupX` (nur `grp.ch1.rg`, live und im Render, native Knoten): Parallel-Kompression, Luft parallel ab 8 kHz, Hauch (Lead, HP 3,5 k → Sättigung → L/R versetzt, −23 dB), Gated-Plate (eigene 0,42-s-IR, Gate bei 300 ms), Ping-Pong-Echo 1/8 punktiert mit Send-Automation nur am Zeilenende (Lücke ≥ 0,3 s). Auto-Ausrichten neuer Doppel-Takes: `ch1AutoTick` (Stellen mit `grp.ch1.al`).

**Einhänge-Zeilen (fremder Code, je eine Zeile/ein Ausdruck):**
- `mixaModSrc`: `+ mx3ModSrc()`
- `mixaNormAm`: `...mx3NormAmX(a)`
- `mx2Master`: `Object.assign(…, {mx2: …}, mx3Keep())`
- `mx2Run` erste Zeile: `if (mx3UseLive()) return mx3Run(withMix, tag);`
- `mx2Tap` erste Zeile: `if (mx3Tap(b)) return;`
- `mx2Paint` nach `c.innerHTML = …`: `mx3Paint(p, c);`
- `mixaBtns` onTap: `mx3Open(b.dataset.a === 'am' ? 'am' : 'mix')` (statt `amSheet`/`mixaSheet`)
- `mtrMasterBtn` onTap: `mx3Open(null)` (statt `openMasterPage`)
- `g6pNormGrp` vor `return o`: `{ const q = ch1NormGrp(g.ch1); if (q) o.ch1 = q; }`
- `g6pApplyStyle`: `const S0 = id && id.voices ? id : G6P_STYLE[id]` und `style: id && id.voices ? id.style : id`
- `g6pcGroup`: `if (!meas && a.chor.grp && a.chor.grp.ch1 && a.chor.grp.ch1.rg) ch1GroupX(G, a);`
- `g6pcGroupDrop`: `if (G.ch1) ch1GroupDrop(G);`
- `g6pStart` nach `g6pcGroupSet(G, a, false, false, gA);`: `if (G.ch1) ch1Start(G, a, o, r);`
- `g6SheetPaint`: `g6pePaint(p, X); ch1G6Row(p, X);`
- `g6peTap` erste Zeile: `if (b.dataset.ch1) return ch1Tap(b);`
- `openMarkSheet` nach `gr1MarkSheetPaint(p, m);`: `ch1MarkSheetPaint(p, m);`
- Ende der API-Liste (nach `vd3`): `Object.assign(SYNQUENZER, {mix3: MIX3_API}); mx3Boot();`

## Tests
- `node mix3-test.mjs <index.html> <ordner>` → **23/23 OK** (Ergebnis `mix3-test-ergebnis.json`):
  D3 (AUTO-MASTER/MIX-ASSISTENT/Balken öffnen das eine Blatt, Weg hervorgehoben, kein Messen/Übernehmen), D15 (dB = Spurkopf);
  MX3 live gemessen in der Matrix (8 s, 0 Song-Renders, Ziel −14,0 LUFS), entprellt (2,5 s nichts, Start nach ~5,9 s), nachgeführt nach +3,9 dB Spur-Pegel (Master −0,66 dB, wieder −14,0 LUFS), sanft (26 Schritte über 1,5 s, größter Schritt 0,04 dB, monoton), kein ↶-Eintrag, [↶ Nachführen zurück], wartet bei Selbst-Singen und misst danach, Mischen live;
  CH1a Onset-Abweichung gemessen am gehörten Take **Ø 27 ms (max 34) → Ø 2,7 ms (max 14)**, G2 weich/natürlich 40, Säubern 60, hp 160, sib −12, ein ↶/↷;
  CH1b Rezept (uni×3 ±5–12 ct/10–30 ms/L+R, oct−1, ch+1, ch+2), Render Seiten-Anteil **0,027 → 0,144**, Lautheit −17,0 → −16,6 LUFS, True-Peak −5,2 dBTP, Spitze 0,55 (keine Clips), Echo-Wurf am Zeilenende geplant, ein ↶/↷;
  Bedienung (Chor-Blatt/Marken-Blatt, ≥ 44 px, [OK] und ✕ hochkant + quer sichtbar), Speichern/Laden der neuen Felder, Konsole ohne Fehler.
- Pflicht: topdefs 0 doppelt / 0 Syntaxfehler, dupkeys 0, Rauchtest `errors []`, Markenwörter 0, „MS 2000“ 1×, „  live: true,“ 1×.
- Gegenprobe: MX2-Test (w4480/mx2/mx2-test.mjs) auf dieser Kopie **34/34 OK** (Song-Messung, Stile, A/B, Seitenkette, Kanalzug unverändert).
- Fotos: `mix3-p-blatt.png` (hochkant, Blatt mit Messen aus/Auto-Nachführen), `mix3-l-blatt.png` (quer), `mix3-p-chor.png` (Chor-Blatt hochkant, Zeile Gesang), `mix3-l-chor.png` (quer, Gesang in der unteren Knopfzeile), `mix3-l-marke.png` (Marken-Blatt quer).

## Offen
- „Hauch-Schicht“ ist eine leise, gesättigte Höhen-Schicht des Leads (L/R versetzt), keine echte Flüster-Aufnahme; „Oktave tiefer dunkel“ nutzt den Gruppen-Klang (kein eigener Tiefpass je Stimme).
- Lead-Effekte von „Refrain groß“ (Parallel-Kompression, Luft, Hauch, Plate, Würfe) hängen am Stück: Stumm/Solo der STIMME-Spur wird beim Einsetzen des Stücks gelesen, nicht mitten im Stück.
- Ausrichten nutzt die Zeitkarte des Takes: wer danach im Marken-Editor Marken der Chor-Aufnahme verschiebt, quantisiert sie wieder aufs Raster (dann ist die Ausrichtung weg).
- Live-Mitschnitt misst nur, was gerade läuft (eine leise Szene wird auf Ziel-Lautheit gebracht); für den ganzen Song bleibt [Song]. „Lauteste Stelle“ gilt live nicht.
- Mischen nach Profil berücksichtigt den Chor noch nicht automatisch (Chor-Pegel im Blatt per [leiser]/[lauter]); der Lauteste-Stelle-Bereich und die Guide-Einträge „Auto-Master“/„Mix-Assistent“ zeigen weiter auf FX › MASTER (die Knöpfe dort öffnen das eine Blatt).
- Test mit echter Stimme/iPhone (CPU, Latenz des Mitschnitts) steht aus.
