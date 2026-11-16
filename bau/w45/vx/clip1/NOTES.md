# CLIP1 – Auswahl im Clip → neuer Clip in freier Szene

Basis: rel-4750 (rel-4760 gibt es nicht), VERSION bleibt 4.75.0. Arbeitsordner vx/clip1.
Nur Matrix-/Clip-Code (MTX3/MTX3B-Blätter) und zwei Toast-Haken; nichts an Spektral oder Import.

## Bedienweg

Noten-Editor (Synth-Spur):
Clip öffnen › Noten wählen (⬚ oder Rahmen) › [Auslagern ▾] › unter „In vorhandene Spur“ der neue Abschnitt
**ALS NEUER CLIP · SYNTH 1**: je freier Szene derselben Spur ein Knopf „Szene 3“ mit klein „2 Takte“.
Tipp › die Auswahl ist ein eigener Clip in Szene 3. Der Schalter NOTEN Verschieben │ Kopieren gilt auch hier.
Toast „8 Noten → neuer Clip · SYNTH 1 · Szene 3 · 2 Takte“ mit [Öffnen] (Editor zu, Szene 3 im Editor auf).
Ist keine Szene frei: „Keine freie Szene auf Synth 1 – Szene leeren oder „In neue Spur darunter““; die anderen Ziele gehen weiter.

Drum-Schritt-Editor:
DRUMS › SCHRITTE › [Auslagern ▾] › Töne wählen › WAS „Ganze Töne“ oder „Nur diese Schritte“ (Schritte antippen)
› unter [Auf eigene Spur] der Abschnitt **ALS NEUER CLIP · DRUMS** › „Szene n“. Immer Kopie, die Quelle bleibt.
„Ganze Töne“ heißt hier: alle Schläge dieser Töne in DIESER Szene. Toast mit [Öffnen].

Vorher (clip0, Umweg 1): 7 Tipps + 2 ↶, 4 von 8 Noten fielen weg (neuer Clip hatte 1 Takt).
Jetzt nach dem Wählen 2 Tipps ([Auslagern ▾], „Szene 3“), 0 von 8 Noten weg, ein ↶.

## Regeln der Länge

- bb = clipBarB(Quelle) (Schläge je Takt, 3/4 = 3). b0 = floor(erste Note / bb) · bb. Ende = max(t + d).
- len = clamp(ceil((Ende − b0) / bb − 1e-6), 1, 64). Noten rücken um b0 nach vorn; eine Note, die über das alte Clip-Ende ragt,
  bleibt ganz (Länge aufgerundet).
- Wie [Zuschneiden] im Editor: der Lauf-Versatz o der Noten rückt mit, die Kurven (Modulation/Biegung/Druck, BM8) werden
  mit cvSlice auf den Ausschnitt [b0, b0 + len·bb) geschnitten (Startwert = Wert bei b0).
- Tonart, Taktart, Raster, Locks wie die Quelle (cleanClip-Kopie, take/pre/lw entfernt), normClip('synth'). Lock-Reihen (ln) rücken um b0 mit (rotiert).
- Erweiterter Inhalt (KL1 clip.lw) der Quelle geht nicht mit: der neue Clip ist nur die Auswahl (Synth und Drums).
- Drums: Kopie des Clips (len, ts) nur mit den gewählten Schlägen; D1-Spurlängen und drum.-Locks nur der beteiligten Töne.

## Haken-Liste (außerhalb des Blocks, je eine Zeile, typeof-gesichert, Marke /* CLIP1 */)

| Ort | Haken |
|---|---|
| toast() | `if (R.editor === 'roll') acts = typeof clip1RollActs === 'function' ? clip1RollActs(acts) : [];` – im Noten-Editor bleibt nur die mit clip1 markierte Aktion [Öffnen] |
| toastHome() | `if (typeof clip1ToastHome === 'function') { const h = clip1ToastHome(); if (h) return h; }` – im Noten-Editor dockt diese Meldung hochkant auf dem Titel („Synth 1 · Szene 1“), quer auf der TAKT-Anzeige (der Titel ist dort 108 px schmal), aber nur solange sie eine reine Anzeige ist. Heißt sie „FILL“ (JAM1-Taste), bleibt sie frei: quer dann Meldung ohne [Öffnen] (durchtippbar, wie jede Meldung im Editor); nie über Werkzeugen oder Tasten |
| mtx3OutSheet | `clip1OutSec(p, t, s, ns)` nach dem Blatt-HTML (Abschnitt hinter der Ziel-Liste) |
| mtx3OutSheet onTap | `clip1OutTap(b, t, s, ns)` – data-m3="clip" → mtx3NewClip |
| mtx3bOutSheet | `clip1DrumSec(p, s, c)` nach dem Blatt-HTML (Abschnitt hinter [Auf eigene Spur]) |
| mtx3bOutSheet onTap | `clip1DrumTap(b, s, c, sel, mode, pick)` – data-m3b="clip" → clip1DrumNew |

Block /* CLIP1-BEGIN */ … /* CLIP1-END */ steht direkt hinter mtx3Out (MTX3-Bereich): CSS (eine Regel-Gruppe für das Raster),
clip1Free, clip1Span, clip1SecHtml, clip1Open, mtx3NewClip(t, s, notes, x, copy, quiet), clip1DrumNew, Test-API SYNQUENZER.clip1.
Wiederverwendet: mtx3OutSrcOk, mtx3Busy, mtx3CopyOn, cleanClip/cleanNote/normClip, undoPush/pushUndo, clipRestored, cvSlice/cvSet,
openRoll/closeRoll, toast/haptic, Blatt-Stil .mtx3-sub / .mtx3-l / mbtn rb / small. Keine neue Leiste, keine neuen Datenfelder.

↶: Noten-Editor ein Gruppen-Eintrag „Noten → neuer Clip · Szene x+1“ (neuer Clip before null; bei Verschieben die Quelle);
Drums ein Clip-Eintrag (before null). Song und Teile bleiben unverändert (neue Szene), es startet nichts.
MTX3.last = CLIP1.last = {op: 'clip', from, s, x, n, len, b0, copy}.

## Aussehen

Raster: hochkant 4 Knöpfe je Zeile (Noten-Blatt 87×48 px, Drum-Blatt 92×48 px bei 428 breit). Quer höchstens 8 je Zeile,
je ≥ 44 px: im 392-px-Noten-Blatt passen 7 (47×53 px, „Szene“ / Nummer / „2 Takte“ untereinander) – acht gingen dort nur unter
44 px, das Blatt bleibt so breit wie bisher; im breiten Drum-Blatt 6 von 8 möglichen (92×48 px). Quer rollt das Blatt wie bisher
(popFit), hochkant passt das Noten-Blatt ohne Rollen (7 freie Szenen = 2 Zeilen).

## Messungen (clip1-test.mjs, Touch über CDP, 3 Größen)

clip1-test.mjs auf der Endfassung: **73/73 grün** (428×926, 926×428, 926×370), Konsole 0 Fehler je Größe.
- C1 Auslagern ▾ zeigt 7 Knöpfe = 7 freie Szenen von Synth 1; „Szene 3“ → Clip len 2, 8 Noten, Zeiten 0..7 (vorher 8..15 = t_alt − 8),
  Tonart gleich; Quelle 16 → 8 Noten (Verschieben); Kopieren: Quelle JSON-gleich. Toast „8 Noten → neuer Clip · SYNTH 1 · Szene 3 · 2 Takte“ mit [Öffnen], Auswahl geleert.
- C2 genau 1 Undo-Eintrag „Noten → neuer Clip · Szene 3“; ↶ stellt Quelle (JSON gleich) und leere Szene 3 her, ↷ wiederholt (JSON gleich).
- C3 Auswahl 2,5–4,5 Takte im 6-Takt-Clip: b0 = 8 Schläge, len 3, Zeiten 2 / 5 / 9,5; Kurve mw [[0,0],[8,.5],[16,1]] → [[0,.5],[8,1],…].
  3/4-Clip: clipBarB 3, b0 3, len 2, ts '3/4' bleibt, Zeiten 1,5 / 3,5.
- C4 alle 8 Szenen belegt: 0 Knöpfe, Hinweiszeile sichtbar, 5 andere Ziele da, „In neue Spur darunter“ geht.
- C5 STIMME / Original / Einzelspur (MTX3-Aufteilung HH ZU): kein Auslagern-Knopf, mtx3NewClip = −1.
- C6 Toast-[Öffnen] (per Touch) → Editor auf Synth 1 · Szene 3 mit 8 Noten. Toast über keinem Editor-Werkzeug, Text ganz lesbar
  (hochkant Titel, quer TAKT-Anzeige 200 px).
- C7 saveNow → Seite neu laden → Synth 1 Szene 3 JSON-gleich (Noten, len, Tonart).
- C8 DRUMS › SCHRITTE › Auslagern ▾ › HH ZU › Nur diese Schritte 2 3 6 7 (1 4 5 8 abgewählt) › „Szene 3“: neuer DRUMS-Clip len 1,
  4 Schläge nur HH ZU bei 0,25 / 0,5 / 1,25 / 1,5; Quelle JSON-gleich; 1 Undo-Eintrag; Toast „4 Schläge → neuer Clip · DRUMS · Szene 3 · 1 Takt“
  mit [Öffnen] → Drum-Editor auf Szene 3; ↶ nimmt den Clip weg.
- C9 Knöpfe ≥ 44×44 (s. Aussehen), Blatt im Bild, Text in keinem Knopf abgeschnitten, Fotos in fotos/ (c1…c7, je 3 Größen; c5 hochkant).

## Offen

- Drum-Schritt-Editor: „Ganze Töne“ nimmt für den neuen Clip nur die aktuelle Szene (für „Auf eigene Spur“ bedeutet es weiter: alle Szenen).
  Der Abschnitt sagt das jetzt („Als neuer Clip · DRUMS · aus Szene 1“), spielt der Ton dort nicht, kommt „CLAP spielt in Szene 1 nicht“.
- Quer mit FILL-Schritten im Projekt: die Meldung kommt ohne [Öffnen] (kein freier Platz im Kopf); der neue Clip ist in der Matrix zu öffnen.
- Lock-Reihen: passt b0 nicht auf das Raster einer Reihe (nur bei Taktarten mit halben Schlägen wie 7/8 und Raster 1/4), bleibt diese Reihe unverschoben.
- Lauf-Start (LF1 clip.lf.st) wird wie bei [Zuschneiden] unverändert mitkopiert.
- Toast-Haken: die Zeile in toast() ist eine geänderte Bestandszeile (statt `acts = []`), ohne den Block verhält sie sich wie vorher.
- Nur der letzte Punkt von Xanders Gesamtwunsch (Auswahl im Clip → neuer Clip). Songteile erkennen, Teil-Namen im Lineal, Fokus je Teil,
  Teil → Matrix mit Noten je Ebene sind andere Pakete.

## Regression und Pflichtprüfungen (Endfassung md5 76557351b4b52697aa7844028006750b, 9 426 061 Byte, +12 284 gegenüber rel-4750)

- topdefs: Skripte 26, Namen 7940, doppelt 0, Syntaxfehler 0 · dupkeys: 0 doppelte Schlüssel
- grep 'MS 2000' = 1 · grep '^  live: true,' = 1 · VERSION '4.75.0'
- Rauchtest (dirigent-test/smoke.mjs): errors [] (reg/smoke-final.png)
- mtx3-test: 51/51
- mtx3b-test: 87/87 (Endfassung, Last 3,9). Unter Last (Lastmittel 7–10, andere Läufe parallel) zweimal 86/87: nur
  „Tastatur-Overdub auf HH ZU“ zählte 1–2 statt 3 Tastenschläge – reine Zeitfrage, die Basis rel-4750 lief dabei 87/87,
  ein weiterer Lauf der Endfassung 87/87; CLIP1 berührt Tastatur/Aufnahme nicht.
- mtx4-test: Endfassung 115/118, Basis rel-4750 im selben Zeitraum 114/118 – offen sind auf beiden nur Zeitmessungen
  (Bild der Matrix ≤ 16 ms, kein Long Task > 50 ms bei 64 dichten Clips) unter Lastmittel ~10; alle Funktionsprüfungen grün.
- clip0-test (Kopie in reg/clip0n): Umweg A weiterhin wie vorher (7 Tipps, „Neuer Clip“ + „Einfügen“, 3 Noten, 1 Takt);
  das Auslagern-Blatt zeigt zusätzlich „Szene 2 … Szene 8“; Konsole 0 Fehler in allen 3 Größen.

## Prüfung (Nachbesserung 16.11., 00:24–00:40)

Prüfer-Befunde (2 mittel, 3 klein) – alle behoben, je mit Test (clip1-test.mjs P1–P5, Touch, 3 Größen):

| Befund | Schwere | Behebung | Beleg |
|---|---|---|---|
| Quer liegt der [Öffnen]-Toast 5 s auf der FILL-Taste | mittel | neues `clip1Dock()`: TAKT-Anzeige nur, wenn `!jam1Armed()`; sonst kein Platz → `clip1RollActs` gibt `[]` zurück, die Meldung kommt ohne Knopf als durchtippbares Schild (wie jede Meldung im Noten-Editor vorher). Hochkant bleibt [Öffnen] auf dem Titel. Wird die Anzeige in den 5 s zur FILL-Taste, weicht der Toast auf den Titel aus | P1: FILL-Schritt gesetzt, Anzeige „FILL“; quer 926×428 und 926×370: Überdeckung 0 px² (vorher 7 931 von 9 076), Mitte der Taste trifft #takt, Toast pointer-events none; hochkant [Öffnen] auf dem Titel, 0 Werkzeuge überdeckt; ohne FILL quer wieder TAKT-Anzeige. Fotos c8-fill-toast-* |
| Neuer Clip erbt KL1 clip.lw (verborgener Rest der Quelle) | mittel | `delete nc.lw` in mtx3NewClip und clip1DrumNew | P2: Quelle 4 Takte + lw (ganzer Inhalt 32 Noten) → neuer Clip len 2, 8 Noten, kein lw, 0 Noten der Quelle außerhalb der Auswahl, kl1Beats 8; Drum-Quelle mit lw → neuer Clip 2 Schläge, kein lw |
| Drum „Ganze Töne“: Meldung „Erst Töne wählen“, obwohl gewählt | klein | Meldung je Fall: nichts gewählt / „CLAP spielt in Szene 1 nicht“; Abschnitt heißt „Als neuer Clip · DRUMS · aus Szene 1“ | P3: CLAP nur in Szene 2, Blatt auf Szene 1, Ganze Töne → Toast „CLAP spielt in Szene 1 nicht“, kein Clip, kein ↶. Foto c9-drum-meldung-428x926 |
| „Wo finde ich …?“ findet den Weg nicht | klein | eigener Eintrag „Auswahl als neuer Clip“ (Weg Noten-Editor › Noten wählen › Auslagern ▾ › Als neuer Clip › Szene n; Drums: SCHRITTE › Auslagern ▾), „Zeig es mir“ = mtx3GuideOut/mtx3GuideBtn | P4: Suche „neuer Clip“ und „Clip aus Auswahl“ → erster Treffer clip1new; „auslagern“ findet mtx3out und clip1new; Sprung öffnet den Noten-Editor, Rahmen auf [Auslagern ▾] |
| Lock-Reihen (clip.ln) nicht um b0 verschoben | klein | `clip1LnShift`: Schritte jeder Reihe um b0 / Raster rotiert (Reihen laufen ab Clip-Beginn durch, eigene Länge), Länge/Raster/Saat bleiben | P5: Reihe 16 × 1/4, Schritte 0/8/9, Auswahl ab Takt 3 (b0 8) → 8→0, 9→1, 0→8; Quelle unverändert |

Endstand **md5 f192a0534945b64d5acd0af845732094**, 9 429 143 Byte (+15 366 gegenüber rel-4750; +3 082 gegenüber 76557351…):
- clip1-test.mjs: **109/109 grün** (73 alte + 36 neue, 3 Größen), Konsole 0 Fehler je Größe (lauf-nachbesserung.log)
- mtx3-test 51/51 · mtx3b-test 87/87 (Last 4,7–9,5) · clip0-test (reg/n2/clip0n): Umweg wie vorher, Konsole [] in 3 Größen
- Rauchtest errors [] (reg/n2/smoke.png) · topdefs: Skripte 26, Namen 7942, doppelt 0, Syntaxfehler 0 · dupkeys 0 · 'MS 2000' = 1 · '^  live: true,' = 1 · VERSION '4.75.0' · 0 Emojis im Block
- mtx4-test nicht neu gelaufen: die Nachbesserung ändert nur CLIP1-Code (Toast im Noten-Editor, neuer Clip, Drum-Abschnitt, Guide-Eintrag), keinen MTX4-Weg
- Außerhalb des Blocks unverändert die 6 Haken; diff gegen rel-4750 vor dem Block: nur die 2 Toast-Zeilen
- Nebenbefund des Prüfers (Overdub-Toast „+4 Noten“, im Clip 1–3) liegt in rel-4750, nicht in CLIP1 – nicht angefasst
