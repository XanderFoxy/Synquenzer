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
- Tonart, Taktart, Raster, Locks wie die Quelle (cleanClip-Kopie, take/pre entfernt), normClip('synth').
- Drums: Kopie des Clips (len, ts) nur mit den gewählten Schlägen; D1-Spurlängen und drum.-Locks nur der beteiligten Töne.

## Haken-Liste (außerhalb des Blocks, je eine Zeile, typeof-gesichert, Marke /* CLIP1 */)

| Ort | Haken |
|---|---|
| toast() | `if (R.editor === 'roll') acts = typeof clip1RollActs === 'function' ? clip1RollActs(acts) : [];` – im Noten-Editor bleibt nur die mit clip1 markierte Aktion [Öffnen] |
| toastHome() | `if (typeof clip1ToastHome === 'function') { const h = clip1ToastHome(); if (h) return h; }` – im Noten-Editor dockt diese Meldung hochkant auf dem Titel („Synth 1 · Szene 1“), quer auf der TAKT-Anzeige (der Titel ist dort 108 px schmal); nie über Werkzeugen |
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

- Synth-Clips: Lock-Reihen (ln/kl) werden unverändert mitkopiert (wie bei [Zuschneiden], das sie auch nicht verschiebt).
- Drum-Schritt-Editor: „Ganze Töne“ nimmt für den neuen Clip nur die aktuelle Szene (für „Auf eigene Spur“ bedeutet es weiter: alle Szenen).
- Guide-Eintrag („Wo finde ich …?“) für „Als neuer Clip“ nicht ergänzt; der vorhandene Eintrag „Noten auslagern“ führt zum selben Blatt.
- Toast-Haken: die Zeile in toast() ist eine geänderte Bestandszeile (statt `acts = []`), ohne den Block verhält sie sich wie vorher.
