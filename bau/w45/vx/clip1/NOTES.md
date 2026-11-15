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

Ein Tipp weniger als vorher gezählt: Umweg 1 (clip0) brauchte 7 Tipps + 2 ↶ und verlor 4 von 8 Noten; jetzt 3 Tipps
(Auslagern ▾ · Szene 3 · fertig) nach dem Wählen, 0 Noten verloren.

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

Raster: hochkant 4 Knöpfe je Zeile (87×48 px bei 428 breit), quer so viele wie in das 392-px-Blatt passen = 7 je Zeile
(46×64 px, „Szene“ / Nummer / „2 Takte“ untereinander). Acht in einer Zeile gingen quer nur mit Knöpfen unter 44 px – das
Blatt bleibt so breit wie bisher. Quer rollt das Blatt wie bisher (popFit), hochkant passt es ohne Rollen.

## Messungen (clip1-test.mjs, Touch über CDP, 3 Größen)

siehe Abschnitt „Ergebnis“ unten (wird nach dem letzten Lauf eingetragen).

## Offen

- Synth-Clips: Lock-Reihen (ln/kl) werden unverändert mitkopiert (wie bei [Zuschneiden], das sie auch nicht verschiebt).
- Drum-Schritt-Editor: „Ganze Töne“ nimmt für den neuen Clip nur die aktuelle Szene (für „Auf eigene Spur“ bedeutet es weiter: alle Szenen).
- Guide-Eintrag („Wo finde ich …?“) für „Als neuer Clip“ nicht ergänzt; der vorhandene Eintrag „Noten auslagern“ führt zum selben Blatt.
- Toast-Haken: die Zeile in toast() ist eine geänderte Bestandszeile (statt `acts = []`), ohne den Block verhält sie sich wie vorher.
