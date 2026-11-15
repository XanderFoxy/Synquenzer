# LT1B – Import-Vorbereitung: Speicher begrenzen und Neustart (Rest der LT1-Zweitprüfung, Basis 4.75.0 = rel-4750)

Auftrag (OFFEN.md „LT1 (4.74) Rest aus Zweitprüfung“):
(1) Die LT1-Vorbereitung (Take-Kopie Int16 + AudioBuffer Float32 = 6 Byte je Probe ≈ 17 MB/min bei 48 kHz) liegt im Speicher, solange
das Import-Blatt offen ist – auch nach „Als Gesang“. → Obergrenze, keine Vorbereitung bei Gesang.
(2) Nach „Blatt in die Leiste und zurück“, „1“ verschoben oder Tempo/Taktart mit anderem Versatz startet die Vorbereitung nicht neu
(Ergebnis richtig, nur der alte, langsame Weg). → Neustart entprellt, alte Vorbereitung sofort freigeben.

## Änderung
Alles im vorhandenen Block `LT1-BEGIN … LT1-END` (Kennung „LT1B“ in den Kommentaren) + 3 neue einzeilige Haken.
- `LT1_MAXB = 100 MiB` und **`lt1PreWant(c)`** (neu): eine Stelle für alle Bedingungen – Blatt offen, `IMP1.cur === c`, `st === 'fertig'`,
  Audio erlaubt, kein Dehnen (wie bisher) und neu:
  - `n · 6 Byte ≤ 100 MiB` (n = Take-Länge in Proben) → ≈ 6,1 min bei 48 kHz, 6,6 min bei 44,1 kHz, 3 min bei 96 kHz; darüber alter Weg
    (`LT1.big` = Länge des zuletzt abgewiesenen Takes, nur Messung).
  - nicht, wenn im Blatt „Als Gesang importiert“ steht (`c.made`, das ist das im Blatt sichtbare zuletzt gewählte Ziel). Vor dem Tipp ist
    das Ziel im Blatt **nicht** erkennbar (drei Knöpfe, der Tipp legt sofort ab) – darum: nach „Als Gesang“ wird die liegende Vorbereitung
    sofort freigegeben (Haken imp1Paint am Ende von imp1Place) und nicht neu gestartet. Der Datei-Wähler mit Hinweis „gesang“ öffnet das
    Blatt gar nicht (ggbImportBuf) – dort gab es nie eine Vorbereitung.
  - nicht, wenn das Blatt schon einen Take hat (`c.take` in `S.takes`): imp1Place nimmt ihn wieder, imp1Take läuft gar nicht
    (z. B. nach dem ersten Ablegen oder beim Blatt aus einem Clip „Original“ / imp1OpenTake).
- **`lt1PreCheck()`** (neu, Haken in imp1Paint, imp1Sheet, pshUndock; außerdem im 1-s-Nachsehen der fertigen Vorbereitung):
  passt die liegende/laufende Vorbereitung nicht mehr (anderes c/Audio/Rate, Versatz `round(org·sr)` oder Länge anders, Gesang, Take liegt
  vor, Dehnen, Grenze) → **sofort** `lt1PreDrop()` (`LT1.drop` zählt). Lohnt eine Vorbereitung und es gibt keine → Start nach **400 ms Ruhe**
  (jede weitere Änderung schiebt den Start; `LT1.re` zählt die Neustarts).
- `lt1PreStart(c)`: nutzt `lt1PreWant` (vorher eigene Bedingungen), löscht einen wartenden Neustart. Füll-Schleifen, `lt1Take`,
  `lt1PreBuf`, `lt1StoreJobs` unverändert → gleiche Rechnung, gleiche Prüfung beim Ablegen (sonst alter Weg).

### Haken (außerhalb des Blocks, je eine neue Zeile, mit typeof abgesichert)
| # | Stelle | Haken |
|---|---|---|
| 7 | `imp1Paint` letzte Zeile | `if (typeof lt1PreCheck === 'function') lt1PreCheck();   /* LT1B: „1“/Tempo/Ziel geändert → … */` |
| 8 | `imp1Sheet` vor `return p` | `if (typeof lt1PreCheck === 'function') lt1PreCheck();   /* LT1B: Blatt wieder offen → … */` |
| 9 | `pshUndock` vor `haptic('tick')` | `if (typeof lt1PreCheck === 'function') lt1PreCheck();   /* LT1B: Import-Blatt aus der Leiste zurück → … */` |
Haken 1–6 aus LT1 unverändert. imp1Paint läuft nach jeder Änderung im Blatt (Tempo ±, ½×, 2×, Tippen, Taktart, „1“ loslassen, Teile,
Ablegen, Erkennen); während des Ziehens der „1“ nur imp1Draw → der Neustart kommt nach dem Loslassen. pshUndock ist allgemein (alle
Blätter); lt1PreCheck tut nur etwas, wenn das Import-Blatt offen ist.
Diff gegen basis: `git diff --no-index --stat` 35 insertions(+), 5 deletions(-) (Block + 3 Haken). Keine sichtbare Änderung.

## Verfahren
`t/ab.mjs` = Kopie von `vx/lt1/pruef2/ab.mjs` (Prüfer-Randfälle a1–a14, index vs basis je frischer Kontext, Vergleich Fall-Ergebnis,
Take-Daten + AudioBuffer-Hash + PCM-Stücke aus IndexedDB (`tkPcm`), Daten-/Raster-Signatur, ↶/↷, a9 Speichern/Neu laden) + neue Fälle
b1–b7 (Schlüssel `q*` = Messung, nicht verglichen; Speicher = CDP `Runtime.getHeapUsage().backingStorageSize` nach 3× gc()).
basis = 4.75.0 (LT1 Teil 2 ohne LT1B) = „vorher“.

## Messung
(Ergebnis-Tabelle siehe unten, wird nach den Läufen gefüllt)
