# ARP1 – „Arp für jede Synth-Spur“ (Notizen, 17.11.2026)

index.html = basis.html (Synquenzer 4.78.0, rel-4780, md5 68e92c03…) + `python3 apply.py` (reproduzierbar, Anker je genau 1×).
VERSION bleibt 4.78.0. Bausteine: `arp1-core.js` (Kern-Teil im stillen Block sq-arp-src), `arp1-block.js` (Haupt-Faden, hinter
`/* LT2-END */`), `arp1-ui.js` (stiller Block `<script type="text/plain" id="sq-arp1-src">`, das Blatt, erst beim ersten Öffnen
ausgewertet). Alle Code-Stellen tragen „ARP1“ (Blöcke `/* ARP1-BEGIN … ARP1-END */`, Haken mit `/* ARP1 */`).
`apply.py [ein] [aus]` baut auch auf einen anderen Stand (z. B. NST1, siehe unten).

## Was es kann
- **Arp für VA, FM und WT** (auch Klangkorn) – je Spur (`tr.arp`), bleibt beim Durchblättern der Klänge an, wandert mit
  „Spur duplizieren“. MS-Platte und Bit Mask haben ihren eigenen Arp: dort ruht der Spur-Arp (kein doppelter Arp, ⋯ verweist auf
  den eigenen), zurück auf VA/FM/WT spielt er wieder.
- **Muster**: Auf · Ab · Auf-Ab (Enden nicht doppelt) · Zufall (Saat = Projekt + Spur: Song, Video, MIDI gleich) · Gespielt
  (Reihenfolge wie eingegeben) · Treppe (1-2-1-3-2-4 …) · **Oktave** (je Ton Grundton und Oktave im Wechsel – „Da dub“; mehr
  Oktaven setzen das Paar eine Oktave höher fort) · Akkord (alle Töne je Schritt, je Durchlauf eine Oktave höher).
- **Rate** 1/4 · 1/8 · 1/16 · 1/32, jeweils auch als Triole · **Oktaven** 1–4 · **Wiederholen** 1×–4× (jeder Schritt n-mal) ·
  **Gate** 5–100 % (100 = gebunden) · **Swing** −100…+100 % (0 = Song-Swing gilt; ≠ 0 ersetzt ihn, wie beim Arp der MS-Platte) ·
  **Key Sync** (neuer Akkord = Schritt 1; aus = läuft mit dem Takt) · **Latch** (hält bis zur nächsten Note, endet am Szenenwechsel) ·
  **Kurze Noten: ganze Figur** (Standard an): eine kurze Clip-Note hält im Arp bis zur nächsten Note, höchstens eine Figur – sonst
  bekommt eine 1/16 lange Note auf einem Achtel-Platz kein „dub“ (gemessen, Test B4).
- **Überall gleich**: Tasten (live), Matrix, Song, Song-/Teil-Melodie, Anlauf, Begleiter (alle laufen über arpOn → ARPC),
  Audio-/Video-/Stem-Export (derselbe Planer im Offline-Render), MIDI-Export (Schalter), „In den Clip schreiben“.
- **MIDI-Export**: Export-Blatt › Zeile „Arp: als Noten | wie im Clip“ (nur sichtbar, wenn eine MIDI-Spur Arp an hat; Standard
  „als Noten“ = das Gehörte). Gilt für Szene, alle Szenen, Song und je Spur; der Mitschnitt hat die Arp-Noten schon (nie doppelt).
  Song-Swing wie bisher nicht im MIDI, eigener Arp-Swing ja.
- **In den Clip schreiben** (Blatt): die Arp-Noten einer Clip-Länge werden echte Clip-Noten (Clip-Raum, vor Träger; Noten-Locks der
  Quellnote kommen mit), danach Arp aus – **ein ↶** (Gruppe Clip + Arp). Leerer Clip / Arp aus → Knopf grau mit Grund.

## Bedienung (Fotos in fotos/)
1. **OSZ › STIMME, unterste Zeile** (VA/FM/WT): `ARP [AUS|AN]` + Zusammenfassung „Oktave · 1/16 · 1 Okt.“ (Tipp öffnet das Blatt).
   Hochkant und quer ganz sichtbar, Tasten ≥ 44 px.
2. **⋯ › Arpeggiator** (alle Synth-Spuren; auf MS-Platte/Bit Mask: Hinweis auf den eigenen Arp).
3. **Blatt „Arp · Spur“**: An/Aus · Zusammenfassung · Bild der nächsten 8 Schritte (Lauflicht, solange etwas spielt) · Schnellwahl
   „Oktav-Bass“, „Treppe 1/16“, „Akkord-Puls“ · Muster als Bild-Knöpfe (SVG, keine Emojis) · Rate + Triole · Oktaven · Wiederholen ·
   Gate ‹ › · Swing ‹ › · Key Sync · Latch · Kurze Noten · ▶ Probe (2 Takte, nur wenn nichts läuft) · In den Clip schreiben · Szene n.
   Hochkant passt es ganz (428 × 926), quer rollt es innen. Jede Änderung = ein ↶ (Gate-/Swing-Tipps innerhalb von 2 s zusammen).
4. **Export-Blatt**: Zeile „Arp“ (siehe oben).
5. **Guide**: „Arpeggiator (jede Synth-Spur)“ (Suche: arp, oktavbass, da dub, treppe, latch, festschreiben …), Sprung öffnet
   OSZ › STIMME + Blatt. „Arp Treppe“ (KF1) nennt jetzt auch „jede andere Synth-Spur: STIMME › ARP › Treppe“ und springt ohne
   MS-Platte/Bit Mask direkt in das Arp-Blatt.
Keine Markennamen in den neuen Texten (auf MS-Platte/Bit Mask heißt es „Diese Klangerzeugung hat einen eigenen: GERÄT › ARP“ bzw. „Arp-Taste“).

## Technik
- **Kein zweiter Arp-Kern**: ein Adapter in Form des MS-Programms (`{gn:1, a1, mode:0, sb, arp:{…}}`) wie bei Bit Mask. Planer, Raster,
  Latch, Key Sync, Swing, Gate, „späte erste Note“, Neuplanung und Aufräumen (Stopp, Szenenwechsel, stumm, Klangwechsel, Arp aus)
  sind die vorhandenen (ARPC). Timing sample-genau über den Lookahead-Planer (`spawnVoice` mit Zeitstempel), keine setTimeout-Noten.
- **Kern (Block sq-arp-src)**: 3 geänderte Zeilen (`A_`, `on`, `stepB` – je am Zeilenende „ARP1 (geändert)“), eingefügt: `gnA`,
  `gnNotes`-Aufruf nach der Muster-Zeile, `gnUnit/gnSrc/gnLen/gnNotes/gnFig` (arp1-core.js), `gnFig` in `add`, eine Zeile in `plan`
  (nur Spur-Arp: ein frischer Zustand nimmt eine Note kurz nach einem Rasterpunkt als „späte erste Note“ wie ein laufender – sonst
  hing es vom Planer-Takt ab, ob nach einer Pause der erste Schritt kam), NST1-Rücknahme in `rewind`, `window.ARP1K`. Für
  MS-Platte/Bit Mask liefert `gnA` null → alter Weg (Test A4: bitgleich).
- **Keine Zuweisung je Schritt im ARP1-Teil**: Adapter je `tr.arp` zwischengespeichert (WeakMap, Vergleich der 10 Werte, kein JSON),
  Töne aus einem Puffer je Adapter (Einheiten werden wiederverwendet). Der gemeinsame Planer legt wie beim Arp der MS-Platte je
  Schritt sein Protokoll-Objekt an (vorhanden, unverändert); der Adapter nutzt Typ 5, damit die alte Muster-Zeile nur eine kleine
  Kopie macht (statt Objekte je Ton).
- **reine Rechnung `arp1Render`** (Schläge statt Sekunden, dieselben Regeln wie der Planer, auch „späte erste Note“ und „ganze
  Figur“) für MIDI-Export, Festschreiben und das Bild im Blatt. Test C1: Planer (App-Render) = Rechnung in allen Fällen.
- **Daten** `tr.arp = {on, m, r, tri, o, g, sw, ks, la, rep, fig}` – additiv, `normTrack`-Haken bereinigt (Test A3); fehlt das Feld,
  ist die Datei bitgleich wie 4.78.0 (Test A2). Undo-Art `'arp1'` (HIST.kind registriert).

### Haken im Haupt-Faden (je eine neue Zeile)
| Stelle | Haken |
|---|---|
| `arpOn` vor dem Bit-Mask-Zweig | `arp1Gn(tr) → arp1On` (lädt sq-arp-src sofort, 1 ms, einmal – auch im Planer) |
| `normTrack` | `o.arp = arp1Norm(t.arp)` |
| `undoState` / `undoApply` | Art `'arp1'` |
| `assembleMidi` | `arp1Midi(evs, idxs, marks, endTk, counts)` – Arp-Noten statt Clip-Noten (Schalter) |
| `buildMidiLog` | `arp1Skip()` – Mitschnitt nie doppelt |
| `wegeVa1Html` / `wegeVa1Tap` | Zeile „Arp“ im Export-Blatt / Tipp |
| `vvRenderAudio0` (2) | `arpEndAll()` am Render-Anfang; `arp1RenderLead(h)` nach `songPlayStart` |
| `vvSwapOut` | `arpEndAll()` – kein Arp-Zustand mit Render-Zeiten bleibt im Live-Betrieb |
| `pageVoice` | `arp1VoiceRow(pg, i)` – Zeile ARP auf STIMME |
| `openEdMore` (2) | `arp1MoreBtn(t)` / `arp1MoreTap(p, anchor, t)` (Anker wie NST1, verträglich) |

### Nebenbei behoben (im Funk nennen)
- **Render-Anfang**: der Offline-Render plant beim Start nur 100 ms voraus, der erste Halt kommt erst nach 125 ms – Arp-Schritte
  dazwischen kamen zu spät oder fielen weg (gemessen: 1/32 0,7 ms zu spät, bei 1/32-Triolen fehlte der 2. Schritt). Gilt in 4.78.0
  auch für den Arp der MS-Platte. Behoben, **sobald eine Spur den Spur-Arp an hat** (`arp1RenderLead`: erster Planer-Durchlauf
  gleich mit dem Horizont des ersten Halts – Clip-Noten und Arp gemeinsam, wie bei jedem Halt). Ohne Spur-Arp bleibt alles bitgleich
  (Pflicht „MS-Platte unverändert“); für die MS-Platte allein wäre es eine Zeile mehr – Vorschlag, nicht gebaut.
- `arpEndAll()` am Render-Anfang/-Ende (gilt für alle Arps): ein bei stehendem Transport gelatchter Live-Akkord läuft nicht in den
  Render, und nach einem Abbruch bleibt kein Zustand mit Render-Zeiten.

## Verträglichkeit NST1 („Je Note weiterschalten“)
Beide Reihenfolgen bauen sauber (NST1 → ARP1 mit `apply.py ../nst1/index.html …`, ARP1 → NST1 mit dem NST1-apply auf ARP1-index),
alle Anker eindeutig. Jede Arp-Note ist für NST1 eine neue Note (zählt, gewollt). Arp-Neuplanung (neue Taste, Latch, Tempo, Träger)
nimmt den NST1-Zähler jetzt zurück (Zeile in `rewind`, wirkt nur mit NST1; ohne NST1 wirkungslos).

## Messung
(siehe test-ergebnis.txt; Zahlen unten aus dem Endlauf)

## Grenzen / später
- Gate über 100 % (Legato-Arp) bräuchte eine 4. Kernzeile (Gate wird im Kern auf 100 % begrenzt).
- Key Sync aus zählt den Takt fest mit 4 Schlägen (vorhandene Grenze des MS-Arps; in 3/4 ungenau).
- Arp aus während eine Taste/ein langer Clip-Akkord schon hält: die gehaltenen Töne klingen erst mit der nächsten Note wieder
  direkt (kein Nachschieben der laufenden Töne). Arp an im Lauf: ab der nächsten Note.
- MIDI-Export: Szenen-/Teilwechsel innerhalb der Datei beenden einen gelatchten Akkord an den Marken der Datei (Szene, Teil);
  der Song-MIDI kennt die Clip-Wechsel je Spur nicht einzeln.
- MIDI-Export des Arps der MS-Platte/Bit Mask (heute nur Clip-Noten) wäre mit derselben Rechnung machbar – eigener Schritt.
- Arp je Clip an/aus (z. B. nur im Refrain) wäre ein späterer Wunsch (Klangzustand ◆).
- Gesehen, nicht angefasst (schon in 4.78.0): ein Werksklang heißt mit Markennamen („Moog-Bass“, 3× in der Datei).

## Hörbeispiele (hoeren/, App-Render → MP3 160 kbit/s, je ~8 s, nur eigene Testnoten)
1-oktave-da-dub (Achtel-Bass a-Moll, Oktave 1/16, ganze Figur) · 2-oktave-ohne-ganze-figur (dasselbe ohne – das „dub“ fehlt) ·
3-auf-2-oktaven · 4-ab · 5-auf-ab-triolen (1/8T) · 6-zufall (FM-Pluck) · 7-gespielt-wiederholen (2×) · 8-treppe · 9-akkord-puls.

## Funk-Entwurf (sichtbare Änderungen – vor Auslieferung vorschlagen)
„Xander, der Arp für jede Synth-Spur ist gebaut (noch nicht ausgeliefert). VA, FM und WT nutzen den Arp der MS-Platte mit – kein
zweiter Arp. Neu sichtbar wäre: (1) unten auf OSZ › STIMME eine Zeile ‚ARP [AUS|AN] Oktave · 1/16 · 1 Okt.‘, (2) unter ⋯ der Eintrag
‚Arpeggiator‘, (3) das Arp-Blatt (Muster als Bilder, Schnellwahl ‚Oktav-Bass‘), (4) im Export-Blatt die Zeile ‚Arp: als Noten | wie im
Clip‘. ‚Oktave‘ macht dein ‚Da dub‘: jede Achtel = Sechzehntel Grundton + Sechzehntel Oktave, auch wenn die Note nur 1/16 lang ist.
Vier Fragen: Arp an der Spur (jetzt) oder am Klang? Swing ersetzen (jetzt) oder addieren? ‚Kurze Noten: ganze Figur‘ standardmäßig an
(jetzt)? Platz unten auf STIMME okay? Hörbeispiele liegen bei.“
