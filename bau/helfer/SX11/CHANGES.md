# SX11 · Teil-Fassungen „leicht / voll“ (Basis 4.30.0, VERSION unverändert)

## Was Xander sieht
- **Marken-Blatt** (Marke in der Taktleiste antippen): neue Zeile **[Leicht] [Voll] [⧉ Variante] [Einfügen]**.
  - Hochkant eine eigene Zeile unter „Neu aufnehmen · Bearbeiten · Zusammenfassen“; quer teilt sie sich die Zeile mit
    [Als neuen Teil konsolidieren] – das Blatt ist quer nicht höher als vorher.
  - Unter **Leicht** steht klein, was in der leichten Fassung aus ist, z. B. „S3 S4 aus · DR dünn“; unter **Voll** „alles an“.
  - Die gerade spielende Fassung ist amber umrandet. In der Taktleiste trägt eine leichte Marke „·L“ (z. B. „REFRAIN ·L“).
- **Ein Tipp auf [Leicht]**: Beim ersten Mal macht die App einen Vorschlag (siehe unten). Danach gilt immer die gespeicherte Auswahl.
- **Ein Tipp auf [Voll]**: Alle Clips sind wieder genau wie vorher da (auch die Original-Drums).
- **Jede Fassung merkt sich ihre Auswahl.** In [Bearbeiten] (S0) schaltet man Spuren/Clips der gerade spielenden Fassung an/aus.
  Der Kopf zeigt dort „· Bearbeiten · Leicht“ bzw. „· Voll“. Die ausgedünnten Drums stehen dort als „Dünn“.
- **[⧉ Variante]** kopiert die gerade spielende Fassung. Im Marken-Blatt eines anderen Teils macht **[Einfügen]** dort dieselben
  Spuren aus/dünn und schaltet diese Fassung ein.
- **Während des Abspielens** wirkt jeder Tipp (auch ↶ Rückgängig / ↷ Wiederholen) am **nächsten Taktstrich**. Eine Fläche, die über
  den Taktstrich klingt, klingt mit ihrem Release aus – kein Knackser.
- Jede Aktion = ein Undo-Schritt.

## Der Vorschlag „leicht“ (Profi-Wahl)
Wie bei Begleitautomatik-Styles (abgespeckte gegen volle Hauptfassung):
| Spur-Rolle | leicht |
|---|---|
| Drums | **ausgedünnt**: kein Becken, offene Hi-Hat → geschlossene, Hi-Hat/Shaker höchstens Achtel, keine Hi-Hat-Ratsche; Kick, Snare, Toms, Perc bleiben |
| Bass | bleibt |
| Akkord (Poly, Pluck) | die erste bleibt, weitere aus |
| Fläche | aus (bleibt nur, wenn es keine Akkord-Spur gibt) |
| Phrase (Lead, Sequenz, Glocke, Effekt) | aus |
| Melodie-Spur, STIMME (Gesang + Chor-Gruppe) | bleiben |

Die Rolle kommt aus der Klang-Kategorie, bei FM- und eigenen Klängen aus den Noten (tief + einstimmig = Bass, lang = Fläche,
drei und mehr gleichzeitig = Akkord, sonst Phrase). Es bleibt immer mindestens eine Spur außer den Drums an.

## Technisch (kurz)
- Additiv `mark.vr = {c?: 'l', l?: [{t, b0, b1, k}], v?: [...], dn?: [...]}` (k `x` aus, `d` dünn; die gerade nicht spielende
  Fassung steht in `l` bzw. `v`; `dn` = die Original-Drum-Einträge wie `mark.off`). Ein Song ohne Fassung speichert nichts Neues
  (byte-gleich); alte Songs laden, speichern und klingen unverändert.
- Aus ist S0 (`mark.off`, gleiche Daten), ausgedünnt ist ein **eigener Clip** (`song.own`). Darum stimmen Video (Spur-Bilder zeigen
  den dünnen Clip bzw. nichts), Konsolidieren, Export, MIDI und North ohne Sonderweg. Nichts wird gerendert.
- `s0SegSet` ist unverändert im Verhalten; sein Rumpf heißt jetzt `s0SegApply` (damit viele Segmente in einem Undo-Schritt gehen).
- An den Kanten der Marke werden Einträge entfernt, die den Clip nur phasengleich neu starten (klingt gleich, laneSwitch schneidet dort
  nicht) – so gibt [Voll] exakt die Spuren von vorher zurück.
- Im Lauf: Der dünne Drum-Clip spielt bis zum Taktstrich weiter, obwohl ihn der Schritt schon aus `song.own` nimmt (nur für SX11-Schritte,
  `sx11Held` in `ownPlaying`). Undo/Redo eines SX11-Schritts stößt `songResync` an (sonst blieben ausgeschaltete Spuren bis zum
  nächsten Spur-Eintrag stumm).
- `marksNorm` behält `vr`, `marksCut` verschiebt es wie `mark.off` (Marke vorne gekürzt / geteilt).
- Test-API: `markFassung`, `markFassungSet(id, 'l'|'v')`, `markFassungInfo`, `markRollen`, `fassungKopieren`, `fassungEinfuegen`,
  `fassungAblage`. `markFassung` liefert auch die Richtung für einen späteren Fill-Übergang (UE-C).

## Bewusste Entscheidungen
- **Konsolidieren** nimmt die gehörte Fassung (der neue Teil = leicht, wenn leicht spielt). Die Fassungen bleiben im Ursprung;
  [Zurückholen] bringt sie exakt zurück. (Wie bei S0: Konsolidieren/„Auf alle übertragen“/„Ersetzen durch“ nehmen `mark.off` nicht mit.)
- Gesang (STIMME, Song-Stimme) und Chor-Gruppe sind nie im Vorschlag; wer will, schaltet die STIMME in [Bearbeiten] aus – der Chor hängt
  am Lead-Stück und geht mit.
- Effekt-„Looks“ gibt es nicht (gestrichen, Super-Regler).

## Fragen an Xander
1. Drum-Ausdünnung so richtig (offene Hi-Hat wird zur geschlossenen, statt ganz zu fehlen)?
2. Die Markierung „·L“ in der Taktleiste: so lassen, oder lieber ohne?
3. Soll ein späterer Wunsch „Drums in leicht doch voll“ eine eigene Taste bekommen? Heute geht es über [Bearbeiten]: Dünn → aus → an
   ergibt die dünne Fassung wieder; die Original-Drums in leicht gibt es nur über „Zurück zum Szenen-Clip“ am Drum-Clip.
