# CHANGES G6+d (Zweig g6p-d) – Genre-Stile der Chor-Gruppe

Basis: `bau/snapshots/R-4252.html` (4.25.2). Spec: `spec/dirigent-spec-v3-nachtrag-10-g6plus-chor.md` §1.1, §1.2, §1.5 Nr. 4, §2.2, §2.5, §3 G6+d.

## Änderungen (alle örtlich, `patch.diff`)
1. **Neuer Block `/* G6PD-BEGIN */ … /* G6PD-END */`** direkt nach `/* G6-END */`:
   - `G6P_STYLE` (80, pop, gospel, barber, rock, ballade, disco, wave) und `G6P_BG`, tief eingefroren (`Object.freeze`), Fassung `G6P_STYLE_V = 1`.
     Gruppenfelder `grp = {below, hp, mid, midF, air, sib, rev, pre, dly}`; `sib` in dB (0/−6/−12/−18, „weg“ = −60); `pre` = `'aus'|'1/64'|'1/32'|'1/16'`.
     Gospel: Kopien „versetzt je Stimme +2 ms“ ausgeschrieben (Sopran 9/21/34, Alt 11/23/36, Tenor 13/25/38 ms). Barbershop „Mitte 0“ mit `midF 400`.
   - Regeln `st±n`, `oct±n`, `ch±n`, `root-`, `uni`, `free`, Zusatz `/o±n` (`G6P_RULE`); `g6pNote` rechnet je Lead-Ton `{d, o, x, iv}` (Akkord-Regeln als `d/o/x` gespeichert).
   - `g6pApplyStyle(r, id)` (async: Lead-Noten über die G2-Analyse nur, wenn eine Regel an der Stelle neu ist; gleiche Regel → Noten übernommen, nichts gerechnet).
   - `g6pBackground`, `g6pEchoTake`, `g6pGrpAll`, `g6pStyleVal`, `g6pRoleName`, `g6pTrackOf`, `g6pLanesSnap/Restore`.
   - **Brücke** `g6pdNorm` in `tkExt().audio` (nur `chor.v === 2`; v1 unberührt). Nutzt `g6pNorm2`, sobald G6+a es liefert → beim Merge die Brücke streichen.
   - Test-API `G6PD_API`: `g6pStyles, g6pStyle, g6pBackground, g6pEcho, g6pGrpAll, g6pStyleVal, g6pRoleName, g6pNoteOf, g6pLanes, g6pLast`.
2. **Undo-Element `chorlanes`** (§2.5) in `undoState`/`undoApply` (je eine Zeile). G6+a baut dasselbe Element – beim Merge eine Fassung behalten (Snapshot = JSON von `S.tracks[st].chor`).
3. `Object.assign(SYNQUENZER, G6PD_API)` nach der G6-Zeile.

## Schnittstellen für die anderen Pakete
- G6+e: Kachel-Daten `G6P_STYLE[id].label/sub/help`, Reihenfolge `G6P_STYLE_ORDER`, Aufruf `g6pApplyStyle(r, id)`, Doppeltipp `g6pStyleVal(id, rule|null, feld)`, Echo-Knopf `g6pEchoOf(id)` / `g6pEchoTake(id)`.
- G6+f: `G6P_BG.grp` beim Duplizieren auf eine neue Gruppe, danach `g6pBackground(r, lane, ganzeSpur)`.
- G6+b/c lesen nur `chor.v/style/grp/voices` (keine Laufzeit-Felder von G6+d).

## Bewusst nicht geändert
Kein Eingriff in G6 v1 (`g6NormChor`, `g6Mix`, Blatt), `normTrack`, Format, Klangweg, Worker. Kein Markenname. VERSION bleibt.
