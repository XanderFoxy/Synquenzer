## 4.29.0 — Konsolidieren, Magic Scale, Melodie-Pinsel

Basis 4.27.0 (Chor-Gruppe, Mitlese-Zeile) – alles davon bleibt. Dazu kommen drei Pakete:

- **Block und Konsolidieren (KON):** Takte als Block über der Taktleiste zusammenfassen, hineingehen, den Bereich als neuen Teil
  konsolidieren (der Song klingt genau gleich, auch mit Chor-Gruppe) und jederzeit zurückholen.
- **Magic Scale (MAGIC):** [Magic] im Noten-Editor öffnet eine Zeile mit [Wischen] (Läufe im Tonraster malen), [Tonart] / [Terzen] /
  [Terz+Quinte], [Pause], [Pause +], [Akkorde] mit Umkehrung ▲ ▼ und [Glatt].
- **Melodie-Pinsel (PINSEL):** [Pinsel] mit weichem Einzug (schmal / mittel / breit), [Umkehren ↕], [Krebs ↔], [Tauschen ⇆],
  [Mithören].
- **Zusammen:** Werkzeugleiste im Noten-Editor: ✎ ⬚ ⌫ | **Pinsel · Magic · Mithören** | Raster … Pinsel und Magic schalten sich
  gegenseitig um (Pinsel schließt die Magic-Zeile, Magic beendet den Pinsel). Beide nutzen dieselbe Tonart der Stelle und dieselbe
  Tonart-Handwahl je Clip.
- Keine Klänge geändert, keine neuen Felder außer denen von KON (`song.blocks`, `song.kons`, `Part.sxp`).

### Bitte prüfen am iPhone (Schritt für Schritt)

1. **Version:** ≡ (Menü) → Info: „SYNQUENZER 4.29.0“.
2. **Block:** Song-Ansicht, Takte 3–6 in der Taktleiste antippen → ⋯ Mehr → [▣ Als Block]. Über der Taktleiste steht „▣ BLOCK A“.
   Doppeltipp auf den Block → oben „← Song › Block A“; antippen → wieder draußen.
3. **Konsolidieren:** Block antippen → [Als neuen Teil konsolidieren] → Name. Abspielen: klingt der Song genau wie vorher?
   Der neue Teil steht in der Teil-Leiste.
4. **Mit Chor:** in einem Song mit Chor-Gruppe auf der STIMME den Bereich konsolidieren → Chor klingt weiter.
   Block antippen → [Zurückholen] → alles wie vorher, Chor bleibt.
5. **Magic:** Clip öffnen (✎) → [Magic] → [Wischen] → mit einem Finger schräg nach rechts wischen: Noten im Raster, nur Töne der
   Tonart. [Terzen] probieren. [↶] nimmt den ganzen Zug zurück.
6. **Pinsel:** [Pinsel] antippen → die Magic-Zeile geht zu. Über einen Lauf malen: die Noten folgen weich. [schmal] / [breit] probieren.
7. **Umschalten:** [Magic] antippen → Wischen ist wieder aktiv, Pinsel aus. Nichts liegt übereinander, alle Knöpfe gut zu treffen.
8. **Querformat:** Telefon drehen → Kopfzeile: Titel, dann ✎ ⬚ ⌫ | Pinsel Magic Mithören | … (Leiste scrollt seitlich).
9. **Undo/Redo:** im konsolidierten Teil (Song-Melodie) wischen, malen, dann [↶] dreimal → auch das Konsolidieren ist zurück; [↷] dreimal → alles wieder da.
10. **Speichern/Laden:** speichern, App neu laden → Block, Teil, Chor und Noten sind da; [Zurückholen] geht auch nach dem Laden.
