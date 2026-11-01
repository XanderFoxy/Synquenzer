# CHANGES – G6+e (Blatt „Chor“ neu), Zweig g6p-e

Basis: `bau/snapshots/R-4252.html` (4.25.2, VERSION unverändert). Spec: `spec/dirigent-spec-v3-nachtrag-10-g6plus-chor.md` §1.1–§1.3, §2.2, §2.5, G6+e, Nachtrag „Kopplung Lead ↔ Chor“.

## Neu
- Block `/* G6PE-BEGIN */ … /* G6PE-END */` direkt nach `/* G6-END */`; CSS-Block `/* G6PE-CSS-BEGIN */` direkt nach dem G6-CSS.
  Quellen getrennt in `src-g6pe.js` / `src-g6pe.css`; `patch.py` baut `index.html` aus R-4252 neu (wiederholbar).
- Blatt „Chor“: Stil-Raster (2 × 4 / quer 4 × 2), Gruppen-Zeile mit [Chor an], **[Gekoppelt]**, Regler **„Chor“** (Abstand), Hall, Echo, [Klang ▸], [Auf alle Stellen]; Spur-Zeilen mit Farbfeld/Ziffer,
  Name (umbenennen), [S] [M] [♪] [⋯], Pegel, Pan; [⋯] mit Doppel/Versatz/Cent/Breite, Selbst singen, Entkoppeln, Stimme löschen bzw. Spur löschen; [+ Stimme ▾].
- Daten nur über Spec-Felder: `audio.chor` v2 (`v, style, grp, voices[{lane, rule, n[{d,o,iv}], db, pan, w, dbl}]` + Rückfall-Felder), `S.tracks[st].chor = {lanes, mute?, cpl?}`.
  **Schnittstellen-Vorschlag an G6+a/G6+c:** Kopplung als `S.tracks[st].chor.cpl = {off: true, ref: <Lead-dB beim Trennen>}`, fehlt = gekoppelt (additiv).
- Undo-Element `{kind: 'chorlanes', track, before}` (Spec §2.5) in `undoState`/`undoApply`.
- Farb-Tokens `--chor1/2/3/4/5/6/8/--chorf` (dunkel; Variante für `[data-theme=light]` vorbereitet).
- Test-API: `g6pInfo`, `g6pStyle`, `g6pConvert`, `g6peState`, `g6peMul`, `g6peLeadDb`, `g6peLeadVol`, `g6peRoundtrip`, `g6peUndoLabels`, `g6peTiles`.

## Typische Fehler, beim Bau gefunden und behoben
- Spur-Zeilen schrumpften in der scrollenden Liste und überlappten sich (Flex-Schrumpfen) → `flex: 0 0 auto`.
- **Geister-Tipp:** Nach [Spur löschen] rutschte ein Regler unter den Finger und bekam den nachgeschobenen Maus-Klick (Pegel sprang, zusätzlicher Undo-Schritt) → Maus-Ereignisse auf Reglern ≤ 600 ms nach einem Tipp werden verworfen.
- Neuaufbau des Blatts (fertig gerechnete Stimmen) während ein Regler gehalten wird → zurückgestellt bis zum Loslassen.
- Leere Regler-Schritte (gleicher Wert) → kein Undo-Eintrag.
- P1 320 px: Kachel-Name 4 px zu breit, Spur-Namen 38 px → engere Abstände, Namen dürfen zweizeilig umbrechen (keine Auslassungspunkte).
- L1 568 × 320: Gruppen-Zeile und Klang-Knöpfe (27 px) zu schmal → eigene Regel bis 720 px Breite.

## Nicht im Umfang (Auftrag)
- Farbpunkte in Matrix / Farbstreifen im Song: nur Vorschlag (STATUS.md), nicht gebaut.
- Kein Supabase-Aufruf, keine Markennamen, VERSION unverändert.

## Tests
`node tests/g6pe.mjs [app.html]` (Playwright, vorinstalliertes Chromium): G6P-40, G6P-41 (6 Formate × 4 Zustände), G6P-42, G6P-K1, v1-Ansicht, M-SAVE, Smoke. Ergebnis: `tests/last-run.txt` (78 ✓).
Bildschirmfotos: `shots/g6pe-<Format>-{leer,mix,dot,klang}.png`, `shots/g6pe-P2-{gospel,klang,dot}.png`, `shots/g6pe-P3-v1.png`.
