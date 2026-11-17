# KE1 – „Klang erkennen“ (Notizen, 17.11.2026)

`index.html` = `basis.html` (Synquenzer 4.78.0, rel-4780, md5 68e92c03…) + Hauptblock `/* KE1-BEGIN … KE1-END */` hinter
`/* LT2-END */` + stiller Block `<script type="text/plain" id="sq-ke1-src">` (vor `sq-md-src`, ebenfalls `/* KE1-BEGIN … KE1-END */`)
+ 5 einzeilige Haken (alle mit „KE1“). Keine vorhandene Zeile geändert (`diff basis.html index.html`: nur `a`-Zeilen). VERSION bleibt
4.78.0. Bauen: `python3 apply.py` (basis.html + `src/ke1-main.js` + `src/compose.js` + `src/ke1-core.js` + `src/ke1-ui.js` → index.html).
Nur Scratchpad, nichts veröffentlicht, keine Datenbank, kein Netzabruf. Markenfrei: die Engine heißt in der Bedienung nur über `MK_LABEL`
(„MS 2000“ steht genau 1× in der Datei), keine Geräte-/App-Namen.

## Entscheidungen (Xander: generelles OK, Empfehlungen gelten)
- **E1** Knopf „Klang erkennen“ im **Takes-Blatt** (direkt neben „Im Spektrum öffnen“) und im **FANG-Ergebnis** bei „EINGESPIELT“
  (untere Leiste; bei „GESUNGEN“ nicht). Auf der **Spektral-Seite** sitzt schon „Klang nachbauen“: dort kein zweiter Knopf-Satz, sondern
  eine Zeile „Klang erkennen (genauer) …“, die dieselbe Note (das PCM der Ebene) ins neue Blatt bringt.
- **E2** Gewissheit als Worte **● sicher / ◐ ungefähr / ○ geraten**; Prozent, Spanne und zweitbeste Deutung erst beim Antippen einer Zeile.
- **E3** Die **ähnlichste Engine zuerst** (Reiter ✓), die anderen als Reiter daneben (Antippen = nur Vorhören). Gleichstand (Engine 3
  höchstens 10 % + 0,02 schlechter als die beste) → Engine 3 zuerst [Vorschlag, die Hörschwelle ist nicht gemessen].

## Was gebaut ist
**Ablauf:** Tipp → stiller Block wird ausgewertet (`blockLoad`, gemessen 3,8 ms) → Worker aus Text (Engine-Text `sq-worklet-src` als
Fabrik + Speicherwellen-Tabellen `MKTAB` aus `sq-mk-src` + Kern; Bau 8–23 ms im Hauptfaden) → Take-PCM aus dem Gerät (`tkPcm`, Ausschnitt
des Segments) wird übertragen (nicht kopiert) → im Worker: auf 44,1 kHz bringen, **Töne finden** (YIN auf 11 kHz, Einsatz/Tonhöhen-
Sprung/Pause; bester Ton = lang, laut, stabil; ‹ › wählt einen anderen) → **Stufe 1** (Prototyp: Quelle × Filter, Schwebung, Filter-/Amp-
Hüllkurve, Rauschen, Vibrato; neu: Speicherwellen Top-3 aus den Tabellen-Teiltönen) → **Stufe 2** (Nachspielen mit der echten Engine,
22,05 kHz, Nelder–Mead-Blöcke + CMA-ES) für **Engine 3** (Hypothesen + Filtertyp 24/12 LP, 12 BP, 12 HP), **VA** (dieselbe Hypothese
umgerechnet auf Hz/s, Vibrato über LFO 1 → Tonhöhe) und **FM** (2 Operatoren in der FM-Engine, Verhältnis/Index aus den Bessel-Linien,
Index-Hüllkurve) → je Engine Ergebnis + Gewissheit + Render bei 44,1 kHz für A/B.
- **Budget:** 6 s / 450 Versuche (bei laufender Wiedergabe 4 s / 320); Engine 3 bekommt immer den größten Teil (50 %), Zeit- und
  Versuchsgrenze, Stopp-Prüfung nach jedem Versuch, Fortschritt höchstens alle 200 ms, Zeichnen höchstens 4×/s.
- **Stufe-1-Welle bleibt**, wenn eine andere Welle nicht > 10 % näher ist (Prototyp-Befund 1: Stufe 2 verwechselt sonst Rechteck/Dreieck/Sinus).
- **Gewissheit:** diskrete Werte (Welle, OSZ 2, Filtertyp, Engine, FM-Verhältnis) über exp(−ΔD/T), T = 0,25 × D; stetige Werte aus den
  nahen Versuchen gewichtet (10–90-%-Spanne). Danach **gedeckelt nach der Ähnlichkeit** (Eichlauf, Saat 20261117: „sicher“ stimmte bei
  „nah“/„grob“ zu selten): ab „nah“ höchstens „ungefähr“, ab „grob“ „geraten“; Filter-Grenze höchstens „ungefähr“ (nie verlässlich);
  Rauschen/Bewegung mindestens „ungefähr“. Nicht nach ECE geeicht (Konzept KE1e).
- **Karte:** Tonquelle (1/2 Oszillatoren, Welle, Oktave, Verstimmung in ct, Speicherwelle Nr.), Filter (Typ, Grenze beim Halten in Hz,
  Resonanz), Filter-Lauf, Lautstärke (Anschlag/Halten/Ausklang in Worten), Bewegung (Vibrato Hz/ct), Rauschen, Raum-Hinweis (Take mit
  Weg „Lautsprecher“/„Bluetooth“). Kopf: „am nächsten: …, Ähnlichkeit sehr nah/nah/grob/fern“ (Grenzen D 0,5/0,85/1,3 – vorläufig).
- **A/B gleich laut** (Effektivwert der Note abgeglichen, Spitze ≤ 0,9), ▶/■, „Weiter verbessern“ (+4 s an der gewählten Engine ab dem
  besten Stand), „Start-Klang“ schon nach Stufe 1 hörbar.
- **Übernehmen** (ein ↶): „+ Neue Spur“ (Standard, vorne) oder eine vorhandene Synth-Spur; Klang „Erkannt ‹Take›“ als normaler Klang
  (Engine 3 aus dem INIT-Programm + Werte; VA/FM aus den vorhandenen Nachbau-Vorlagen), `normalizeSound`-fest, Speichern/Laden gleich.
- **Original als Instrument** (die App hat das: Klangkorn „Als Instrument“): Ausschnitt als Take (`tkAddPcmTake`) + Klangkorn-Klang
  (`spk7Snd`, Grundton aus Stufe 1) auf neue/gewählte Spur, ein ↶. Steht oben, wenn keine Engine näher als „grob“ kommt.
- **Guide:** Eintrag „Klang erkennen“ (Weg: Takes-Blatt / FANG-Ergebnis).
- **Worker** bleibt nach dem Schließen 60 s, dann beendet (Speicher frei). Kein Netz, kein Modell, keine GPU.

## Haken (je eine neue Zeile)
| Stelle | Haken |
|---|---|
| `tkSheetPaint` | `ke1TkBtn(x)` hinter `spk1TkBtn()` |
| `tkSheet` Tipp-Weiche | `d.a === 'ke1'` → `ke1Go(ke1TkSrc(x, rr))` |
| `vsResPaint` | `ke1ResHtml(h, r, inst)` – Knopf in `.fs-bot`, nur eingespielt + Take |
| `vsResSheet` Tipp | `a === 'ke1'` → `ke1ResTap(VS.res)` (Noten bleiben wie „OK“) |
| `spk2KlDd` | `ke1KlHook(U, K, dd)` – Weg zur Erkennung derselben Note |

## Messwerte (Chromium, Xeon 4 Kerne, Rechnerlast 2–6, `nice -n 10`)
Siehe `test-ergebnis.txt` (Endlauf) – Kurzfassung:
- Start: Bild hochkant/quer pixelgleich zur Basis; Block nicht ausgewertet, kein Worker; Startzeit (Median aus 3) nicht langsamer.
- HTML +109,5 KB roh / +36 KB gzip (+1,15 %); Block 103 KB roh / **34,7 KB gzip** (Budget ≤ 35 KB).
- Erster Tipp: Block 3,8 ms, Worker-Bau 8–23 ms; während Laden + Rechnen + Zeichnen **0 Aufgaben ≥ 50 ms** im Hauptfaden
  (Zeichnen ≤ 25 ms). Der erste Tipp der App überhaupt startet die Audio-Engine (bis ~300 ms, gibt es in 4.78 genauso) – im Test vorher.
- Zeit je Ton 3,9 s (sauber) / 5,9 s (Mikro) für ~445 Versuche, Stufe 1 ~300 ms (Xeon). iPhone: **nicht gemessen** (Faktor 2–3 geschätzt
  → Zeitgrenze 6 s greift, dann weniger Versuche).
- Stopp: Antwort 22–25 ms im Worker. 0 Netzaufrufe.

## Trefferquoten
Endlauf-Tabelle in `test-ergebnis.txt` (Saat 20261118, nicht zum Eichen benutzt). Eichlauf (Saat 20261117) unter
`src/korpus-eichlauf-20261117.{json,log}`. Wichtigste Punkte (Eichlauf, 14 saubere + 12 Mikro-artige Engine-3-Töne):
Welle 71 % sauber / 25 % Mikro; Vibrato 100 %; Tonhöhe 1 ct (Mikro 13 ct); Speicherwelle Top-3 2/2; Filter-Grenze Median 6,6 HT
(Prototyp 1,5 – die drei Engines teilen sich die Versuche); Amp-Abfall ~2,3 Oktaven (wie Prototyp); FM-Töne: Verhältnis 2/3 richtig.

## Ehrliche Grenzen
1. **Gleich klingend ≠ gleiche Regler.** Kleiner Abstand („sehr nah“) heißt oft trotzdem andere Filter-/Hüllkurven-Werte (Filter-Grenze im
   Median mehrere Halbtöne daneben). Darum steht beim Filter nie „sicher“.
2. **Welle** ist weiter das schwächste Glied bei Mikro/Hall (25 %). Raum/Hall wird nicht ausgeblendet (KE1j), nur als Hinweis gezeigt.
3. **Engine-Wahl:** Engine-3-Töne werden oft gleich gut mit VA/FM nachgebaut; der Gleichstand-Vorrang (10 %) ist nicht am Gehör geeicht.
4. **Gewissheit** gedeckelt nach Eichlauf, nicht nach ECE geeicht; Prozentwerte sind „wie sicher die Suche ist“, nicht „wie oft richtig“.
5. **Nur ein Ton, nur Timbre 1**, keine Effekte, kein Keytrack/Anschlag/Unison/Ring/Sync, nur einfache Speicherwellen (55 von 64),
   keine Stimme/Vocoder (KE1h), keine Mehrfach-Samples (KE1m).
6. **iPhone-Zeiten und Safari-Worker nicht gemessen**; Speicher des Workers nicht gemessen.
7. **↶ nach „Neue Spur“** stellt den Inhalt her; liegt im Projekt schon ein Audio-Take, ordnet der vorhandene ↶-Weg (`imp1Step`, auch
   „Klang nachbauen“/„Klangkorn“) die Schlüssel eines Audio-Stücks um – Speicherstand nicht zeichengleich, Inhalt gleich (in 4.78 genauso,
   `src/probe-undo3.mjs`).

## Funk-Entwurf an Xander
„Klang erkennen ist gebaut (noch nicht ausgeliefert): Knopf im Takes-Blatt und nach FANG (eingespielt). Die App hört deinen Take an,
probiert ein paar Sekunden MS 2000, VA und FM aus und zeigt den ähnlichsten zuerst – mit sicher/ungefähr/geraten, Prozent beim Antippen.
A/B gleich laut, Übernehmen auf eine Spur (↶), oder das Original als Instrument. Bei sauberen Tönen klingt es oft sehr nah, die Regler
stimmen aber nicht immer (Filter!). Mit Mikro im Raum wird es grob. Willst du es so ausprobieren?“

## Nächste Schritte (Vorschlag)
KE1a iPhone-Messung (Zeit je Versuch, 2 Worker) · Hörtest für Ähnlichkeits-Worte und Gleichstand (KE1k) · Hall ausblenden (KE1j) ·
Welle aus dem Anschlag (Prototyp §9.1) · Gewissheit nach ECE eichen (KE1e) · mehrere Töne (KE1i).
