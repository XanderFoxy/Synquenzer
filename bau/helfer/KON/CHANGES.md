# KON · Block und Konsolidieren (Basis 4.26.1, VERSION unverändert)

## Was Xander sieht

**Block (SX10)**
- Takte wählen (Taktleiste antippen, z. B. Strophe + Refrain) → **⋯ Mehr → [▣ Als Block]**.
- Über der Taktleiste erscheint eine dünne Zeile **„▣ BLOCK A“** (eigene Ebene, die Marken bleiben, wie sie sind). Links steht dann „Block“ über „Takt“.
- **Block antippen** → Block-Blatt: [Als neuen Teil konsolidieren] · [Zurückholen] (nur wenn darin konsolidiert wurde) · [✎ Umbenennen] · [Hineingehen] · [Auflösen].
- **Block halten und ziehen** = als Ganzes verschieben; über **CLIPS ⇄ (⧉ KOPIE)** ziehen = Kopie. Der Rest rückt nach wie beim Ziehen einer Marke.
- **Doppeltipp auf den Block** = hineingehen: die Schleife liegt auf dem Block, oben links steht der Pfad **„← Song › Block A“**. Ein Tipp darauf führt hinaus, die Schleife von vorher kommt zurück.
- **Auflösen**: der Block geht weg, der Inhalt bleibt.
- Takte einfügen im Block → der Block wächst; Takte löschen → er wird kürzer.

**Konsolidieren**
- Im **Marken-Blatt**, im **⋯ der Bereich-Leiste** und im **Block-Blatt**: **[Als neuen Teil konsolidieren]** → Name wählen (wie bei „Als Teil …“) → der Bereich wird **ein neuer Teil in der Teil-Leiste/Clip-Matrix**, mit allem, was im Song dort bearbeitet wurde (eigene Clips, Transposition, Akkorde, Song-Melodie, ausgeschaltete Spuren, Stimme).
- Der Song **klingt danach genau gleich** (nichts eingefroren oder gerendert, alles bleibt Noten und Clips); der Bereich zeigt jetzt den neuen Teil.
- **[Zurückholen]** (Marken-Blatt des konsolidierten Teils oder Block-Blatt) stellt den Zustand vor dem Konsolidieren **exakt** wieder her; der neue Teil verschwindet aus der Teil-Leiste, wenn er sonst nirgends steht. Wurde danach im Bereich weitergearbeitet, kommt der gespeicherte Ursprung an diese Stelle zurück.
- Weiterarbeiten wie gewohnt: im Bereich bearbeiten und **wieder konsolidieren** (auch verschachtelt; jedes Zurückholen geht eine Stufe zurück).
- Jede Aktion = ein Undo-Schritt. Speichern/Laden behält Blöcke und Ursprung; alte Songs laden unverändert.

## Technisch (kurz)
- Neu und nur ergänzt: `song.blocks`, `song.kons` (Ursprung), `Part.sxp` (Transposition aus dem Song). Ein Song ohne Block/Konsolidieren speichert nichts Neues.
- Wiederverwendet: S2 Zusammenfassen (`s2Template`, Namens-Blatt), Ziehen mit Nachrücken (Drag-Engine), `songCut`/`opInsert`/`opDelete`.
- Zwei kleine Korrekturen, die nur neue Wege betreffen: ein Block-/Konsolidieren-Stück, das ohne Akkord (ORIGINAL) beginnt, sagt das an seinem Anfang (sonst erbt es woanders den Akkord davor); „Teil′“ zählt ein ORIGINAL auf Schlag 1 wie „kein Eintrag“.

## Fragen an Xander
1. [Hineingehen] steht zusätzlich als Taste im Block-Blatt (Doppeltipp geht auch). Bleibt die Taste?
2. Bestehender Befund (nicht geändert): **⧉ Kopie einer Marke** übernimmt am Ziel den Akkord davor, wenn die Marke ohne Akkord beginnt. Soll das wie beim Block repariert werden?
