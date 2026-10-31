# G9U – Paket G9c „Songtext-Bedienung“ (Text-Modus im Marken-Editor)

Zweig `g9-br-U` · Grundlage `bau/snapshots/stage-ges2.html` (4.23.0 + Gesang G1–G8, VS5a/VS5b) · Ergebnis `bau/helfer/G9U/index.html`
(Merge-Basis = die Grundlage; alle Eingriffe in vorhandenen Code stehen als genau einmal vorkommende Ersetzungen in `build.mjs`).
Spec: `spec/n8/G9.md` §5–§7, §10 (G9c), Nachtrag 8 Teil A (A.4, A.8, A.10, A.12, A.13) und B.5 (Dirigenten-Hinweise), Teil C.

## Was Xander bekommt (seine Wünsche vom 31.10.)
- **Ganzen Songtext einfügen → automatisch auf Silben verteilt:** [Ganzer Text] im Text-Modus, Zeilen = Atempausen, Wahl Deutsch/Englisch/Auto,
  [✓ Verteilen] = ein Rückgängig. Eigene Bindestriche gelten. Mehr Text als Marken → nichts geht verloren (rot = ohne eigene Marke).
- **Auf die Wellenform tippen → der Abschnitt bis zur nächsten Marke spielt** (auch auf die Silben-Leiste). Höchstens 4 s, Blenden 5 ms,
  mit der Zeitkarte der Fassung, die gerade wirklich klingt (auch direkt nach dem Quantisieren, solange die neue Fassung noch rechnet).
  Läuft ▶, hält es an (F3-Vorgabe).
- **Beim Losschreiben rastet die Silbe ein:** gelber Rahmen pulsiert (2 → 3 px, 150 ms), der Abschnitt spielt, die Vorschau steht blass in der
  Leiste. Haptik: echter Tipp auf Wellenform, Leiste, ◀ + ▶ und Werkzeuge über ein Schalter-Label im Ziel (der Weg, der auf aktuellem iOS noch
  tickt); beim Übernehmen eines Worts `haptic('snap')` (wirkt nur bis iOS 26.4) – sichtbar ist das Einrasten immer.
- **Mehrsilbige Wörter verteilen sich auf die folgenden Einsätze:** „Liebe“ + Leertaste → „Lie|be“ auf diesem und dem nächsten passenden
  Abschnitt, Rahmen springt weiter und spielt. Bindestrich → Rahmen auf die nächste Silbe desselben Worts (spielt).
- **Text silbenweise verschieben:** „Text ab hier [‹ Silbe] [Silbe ›]“ – zweimal ‹ = 2 Silben nach links; Ton-Marken ohne Silben-Platz werden
  übersprungen; trifft sie die vorige Silbe, liegen beide verschmolzen dort („nachrücken“).
- **Zwei Silben auf einem Einsatz:** [Verschmelzen] / [Trennen]; ohne freie Marke bleibt [Trennen] grau mit „Keine freie Marke – beide Silben
  bleiben zusammen.“ (kein Rat, eine Marke zu setzen – F8-Vorgabe).
- **Leicht ersetzen:** Wort antippen → es steht markiert im Feld → neues Wort → Leertaste. Mehr Silben als Platz → verschmolzen, Toast mit
  [Nachrücken] und [Rückgängig]. Löschen: antippen, Feld leeren, Leertaste. Fehlendes Wort: tippen, [+].
- **Undo:** jede Aktion genau ein Schritt, eigene kleine Undo-Art `'ly'` (nur Text eines Takes). **Speichern/Laden:** neues Take-Feld `ly`
  (Format 5, nur zusätzlich), `lyrics` wird als Klartext mitgeführt (ältere Stände zeigen den Text weiter).
- **Tastatur-Dock:** Mit offener Tastatur wird der Text-Modus zu einem festen Streifen über der Tastatur (hoch 300/250/200 px, quer 118/88 px),
  die Seite dahinter bewegt sich nicht. Die Höhen sind Schätzungen aus §7.10, bis die Geräte-Probe echte Werte liefert.

## Gebaut
**Start-Pfad** (`src/start.js`): `g9NormLy` (§5.2: verwirft keine Silbe, klemmt/ordnet nur; feste Schlüssel-Reihenfolge), Normalisierer in
`tkExt().take`, Undo-Art `'ly'` (`undoState`/`undoApply`), `g9Load` (Block `sq-g9-src`, erst beim ersten [Text] bzw. Öffnen eines Takes mit
`ly`), `tkHeardMap` (nur lesend; der Fassungs-Cache merkt sich dazu seine Karte `map` – Klang unverändert), Haken in `wpOpen`/`wpPaint`/
`wpGest`/`wpClose`/`stop`/`launchScene`, Geräteprofil-Teil `g9 {auto, lang}`, Test-API (§7.12).
**Block `sq-g9-src`:** Text-Modus (`src/ui.js`), Operationen (`src/g9.js`), **Platzhalter-Kern** (`src/kern.js`, siehe unten).
**Hilfe:** Absatz „TEXT (STIMME)“ (§7.11; der Satz zu [Erkennen] kommt mit der Erkennung).
**Geräte-Probe** `probe.html` (M-PROBE nach A.8 H4: 7 Knöpfe ≥ 88 × 88, iOS-Version, Safari/Home-Bildschirm, sichtbare Höhe mit Tastatur
hoch/quer, `crossOriginIsolated`, WebGPU-Adapter, Ja/Nein je Knopf, [Kopieren]) – Dirigenten-Hinweis 2: I4a war beim Start von G9c nicht da.

## Platzhalter (klar markiert, für die Zusammenführung)
- **Rechen-Kern `G9K`** (`g9Syl`, `g9Feat`, `g9Align`, Sicht §5.1) baut Zweig **g9-br-S**. Bis dahin: Vokalkern-Regel (§6.2, „Silbentrennung
  vereinfacht“, automatisch getrennte Wörter p 0,5 = blass), Merkmale nur aus den Marken (keine Ton-Marken-Erkennung), DP mit den Kosten aus §6.3.
  Beim Zusammenführen wird nur das Objekt `G9K` ersetzt (gleiche Namen/Rückgaben; `g9Syl` liefert ein Feld von Silben-Texten).
- **[Erkennen]** ist vorbereitet: Kopf-Taste, Erkennen-Blatt (§7.8: Größe, Datenschutz-Satz, Sprache, „Neue Aufnahmen automatisch erkennen“,
  [Laden und erkennen] / [Lücken füllen] / [Alles ersetzen] / [Entfernen]) und das Ausrichten des Ergebnisses (Wort-Zeiten als Anker, feste
  Silben bleiben, ein Undo „Erkennen“). Die Taste ist **ausgeblendet**, bis Zweig **g9-br-E** die Andock-Stelle `G9.rec`
  (`{cached, size, load, recognize, remove, stop}`) füllt (Stopp-Punkt 1). Ohne Modell geht alles andere voll.

## Abnahme (echte Läufe, Chromium mit Touch-Emulation; `tests/alle.sh`)
| Punkt | Ergebnis |
|---|---|
| G9-30 Tipp → Rahmen/Vorspielen | ✓ 5/5 Abschnitte genau [t_k, t_k+1) ±1 ms; Auftrag 3,3 ms nach pointerup; Ton +10 ms; A/B Roh-Take; während die Fassung rechnet Quell-Zeiten, danach [warp(t_k), warp(t_k+1)) ±1 ms |
| G9-31 Schreiben | ✓ Puls + Vorspielen; „Liebe“+Leertaste = Lie\|be; Bindestrich; „Weiter“; blur übernimmt; Tastendruck (4× Drossel) Median 1,2 ms, Max 3,4 ms |
| G9-32 Ersetzen 2→3 Silben | ✓ verschmolzen + Hinweis; [Nachrücken] Rest +1 Platz; je ein Undo |
| G9-33 Undo-Zählung | ✓ genau 18 Schritte; alle zurück/vor deep-equal; „geändert“ 18× sofort |
| G9-34 Fokus/Haptik-Label | ✓ 6/6 Ziele: genau ein Label-Klick, Fokus im Feld, Klick-Behandlung einmal; nach Ziehen keiner; `UI.haptics` aus und Marken-Modus: keine Label-Schicht |
| G9-35 M-PLATZ (7 Formate) | ✓ 7/7: Tasten ≥ 44, Feld ≥ 140, Leiste 44, Wellenform ≥ Mindesthöhe, nichts abgeschnitten, P3 zwei Zeilen, Blatt ±0 px |
| G9-36 M-DOCK | ✓ 9/9 (428×926/440, 390×844/380, 375×667/270, 320×568/220, 926×428/130, 844×390/118 und 100, 667×375/100 und 88): über der Tastatur, Treffer ≥ 44, Feld ≥ 140, Leiste sichtbar, Scroll 0, App-Raster ±0, Rückkehr ohne Sprung |
| G9-37 schmale Abschnitte | ✓ (a) 9/9, (b) 5/5, (c) ◀ ▶ 30/30; Zoom höchstens eine Stufe feiner |
| G9-39 Schließen | ✓ 6/6 (✕, [Text], Szenenwechsel, Stopp, Ansichtswechsel, Take gelöscht) |
| G9-07 / G9-11 (Ops, mit Platzhalter-Kern) | ✓ Verschieben 7/7, Kollision 7/7, Ton-Marken 3/3, Trennen ohne Platz grau; Löschen 10/10, Einfügen 10/10, Undo/Redo 20/20 |
| G9-50 alte Projekte | ✓ Vorgänger-Projekt (mit/ohne VS5b-Text) Laden+Speichern zeichengleich; Text-Modus zeigt VS5b-Text wie VS5b; Marken-Modus danach pixelgleich; erste Änderung wandelt um (ein Undo) |
| G9-51 (Teil) | ✓ Speichern → Laden deep-equal mit j/o/p/u/w; `lyrics` = Klartext; Undo `'ly'` stellt beides her |
| G9-52 Klang bitgleich | ✓ gehörte Fassung vor/nach G9-Aktionen gleich (auch quantisiert/Dehnen); `take.marks` unverändert bzw. fehlt weiter |
| Start | ✓ Block nicht ausgewertet, kein Abruf unter `vendor/g9/` |
| Regeln | ✓ „MS 2000“ 1×, `  live: true,` und VERSION-Zeile unverändert, N8-10 (Marken) 0 Treffer in den neuen Zeilen, kein Supabase-/Netz-Aufruf |
| Geräte-Probe | ✓ 7 Knöpfe ≥ 88 × 88 in 3 Formaten, Label-Tipp schaltet, Kopier-Text vollständig |
| F3 / Dock-Fokus | ✓ Tipp bei ▶ hält an und spielt; im Dock behalten ◀ ▶ ‹ › und Leiste den Fokus |

Testläufe: t2 34/34 · t3 41/41 · t4 23/23 · t5 25/25 · t6 15/15 · t7 4/4.

## Offen / nicht in diesem Zweig
- **G9-38 automatische Erkennung, „Aufnahme hat Vorrang“, `G9.auto` + `wpUndone`-Haken** → mit g9-br-E / G9d.
- **Marken-Haken (G9-08: Marke verschieben/löschen nimmt Silben mit)** → G9a (g9-br-S) bzw. G9d. Bis dahin rasten Silben nach §5.1 (Sicht) neu ein.
- **Baustein N (`S.need` mit Merkmal `'ly'`)** gehört I2a; ohne ihn öffnet ein Vorgänger-Stand ein Projekt mit `ly` ohne Fehler und zeigt `lyrics`.
- **Budget:** der Zweig bringt ≈ 64 KB unkomprimiert (davon ≈ 10 KB Platzhalter-Kern, ≈ 57 KB im Lade-Block, der beim Start nicht ausgewertet
  wird); geplant waren +14 KB für G9c. Beim Zusammenführen ersetzt der echte Kern den Platzhalter; Kommentare können dann gekürzt werden.
- Bestehende VS5b-Test-Erwartung: [Text] öffnet nicht mehr das kleine Eingabe-Pop, sondern den Text-Modus (Spec §7.1, absichtlich). Das Pop
  bleibt als Rückfall und über die Test-API `wpLyrics`.

## Fragen an Xander (Vorgaben gebaut, Regel 30)
F1 automatisch erkennen: ja (kommt mit der Erkennung) · F3 Tipp bei ▶: ▶ hält an, dann spielt der Abschnitt · F4 Vorspielen beim Schreiben:
einmal je Silbe · F5 Haptik: Tick bei echten Tipps über das Label, beim Schreiben der Tastatur-Tick des iPhones (Einstellung) + sichtbares
Einrasten · F6 Text nur im Marken-Editor · F8 kein Text-Trennpunkt ohne Marke.

## Bitte prüfen (Xander am iPhone)
0. **Geräte-Probe** (`bau/helfer/G9U/probe.html`, 2 Minuten): Knöpfe 1–7 antippen, je „Tick ja/nein“, bei 5 sagen, ob die Tastatur offen bleibt;
   ein Bildschirmfoto hoch und quer mit offener Tastatur; [Kopieren] und schicken. Davon hängen ab: Haptik-Labels bei offener Tastatur und die Dock-Höhen.
1. Takes-Blatt → [✎ Marken · Quantisieren] → [Text]: Tipp auf die Wellenform – hörst du genau die Silbe bis zur nächsten Marke? Spürst du einen Tick?
2. Einfach losschreiben, z. B. „Liebe“ + Leertaste: landet „Lie|be“ auf den richtigen zwei Abschnitten, und hörst du beim ersten Buchstaben den Abschnitt?
3. [Ganzer Text]: deinen Songtext einfügen (mit Zeilen) – wie viele Silben musstest du danach noch verschieben?
4. Ein falsches Wort antippen und überschreiben; ein Wort löschen (antippen, Feld leeren, Leertaste); ein fehlendes einfügen (tippen, [+]) – verständlich?
5. „Text ab hier [‹ Silbe]“ zweimal; [Verschmelzen] / [Trennen] – rückt alles richtig nach?
6. Mit offener Tastatur hoch und quer: alles erreichbar, nichts verdeckt, siehst du die Leiste mit der Wellen-Hüllkurve?
7. Namen: „Text“, „Ganzer Text“, „Text ab hier ‹ Silbe / Silbe ›“, „Verschmelzen“, „Trennen“, „+“, „Nachrücken“ – passen sie?
Hinweis: Die Silbentrennung ist bis zur Zusammenführung mit dem Silben-Kern vereinfacht (blasse Silben, Hinweis in der Info-Zeile).
