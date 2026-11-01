# G6+f – Entkoppeln und „Als Chor-Stimme duplizieren“ · STATUS

Basis `bau/snapshots/R-4252.html` (4.25.2), Arbeitsdatei `index.html`, Patch `patch.diff` (örtlich, `diff -u`). VERSION unverändert (4.25.2).
Spec: `spec/dirigent-spec-v3-nachtrag-10-g6plus-chor.md` §1.4, §1.5, §2.2 (Takes), §2.5, §2.6, Paket G6+f.

**Stand: gebaut, gezielte Tests grün. Noch nicht von Xander geprüft → nicht fertig.**

## Abnahme (Playwright, Chromium; `node bau/helfer/G6PF/tests/<datei>.mjs`)

| Punkt | Ergebnis | Test |
|---|---|---|
| G6P-50 Entkoppeln: neue Kennung, `chunks` = Lead, Felder übernommen, `lyrics` nicht; klingt gleich; danach Lead ↔ Stimme unabhängig | ✓ (Klang: Pegel −0,02/−0,01 dB, Tonhöhe-Median 0 ct je Kopie – **Grob-Messung [S]**, M-CT je Note / M-LU / M-MS gehören in G6+i) · Lead-Note ▲ ⇒ Stimme bitgleich · Stimm-Note ▼ ⇒ Lead bitgleich | `g6pf-more.mjs` |
| G6P-51 Duplizieren: Kopie bitgleich zum Lead, Note ▲ ⇒ Lead bitgleich, [Background] wie Tabelle, 2. Gegenstimme rechts, Anlegen ≤ 100 ms | ✓ (Anlegen 2 ms, derselbe Puffer wie der Lead) | `g6pf-core.mjs` |
| G6P-52 G7: Transponieren nimmt entkoppelte und duplizierte Stimmen mit; zurück ⇒ bitgleich | ✓ mit Probe-Abbildung +3 Halbtöne (outPitch/mapOut im Test ersetzt). **Offen:** echter C → a-Moll-Lauf mit M-CT ± 1 ct (G6+i) | `g6pf-more.mjs` |
| G6P-53 Undo 1 Schritt, Kennung weg, Aufräumen löscht keine Lead-Stücke, ZIP eigenes WAV | ✓ (ZIP-Rundlauf: Kopie mit eigenen Stück-Namen, `src/of` erhalten). „Import ⇒ hörbar bitgleich“ nur über Daten geprüft | `g6pf-core.mjs` |
| G6P-54 Song-Stück: Duplizieren mit Song-Undo | ✓ (Gruppe takes + song + chorlanes). Entkoppeln auf Song-Stimme: gleicher Code-Weg (`tkRef({vox})`), nicht eigens getestet | `g6pf-more.mjs` |
| G6P-55 [Ganze Spur] 3 Clips + 2 Song-Stimmen ⇒ 5 Kennungen, eine Spur, 1 Undo, ↶ deep-equal; Note an einer Stelle ⇒ andere unverändert; > 512 ⇒ Toast, deep-equal | ✓ | `g6pf-more.mjs` |
| G6P-08 (Teil, eigentlich G6+a) geteilte Stücke bleiben beim Aufräumen, auch ohne Lead-Kennung | ✓ | `g6pf-core.mjs` |
| Speichern → Laden deep-equal mit Duplikaten | ✓ | `g6pf-core.mjs` |
| Smoke / Regel 28: Demo und ein v1-Chor (Barbershop) aus R-4252 zeichengleich | ✓ | `g6pf-smoke.mjs` |
| Platz P1/P2/P3/L1/L2/926×428: Takes-Blatt Treffer ≥ 44 px, nichts abgeschnitten, Wahl [Diese Stelle]/[Ganze Spur] ohne Höhensprung, Knöpfe ≤ 2 Zeilen | ✓ (quer knapp: „Als Chor‑Stimme“ passt mit 2 px Luft – am iPhone ansehen) | `g6pf-smoke.mjs`, Bilder `tests/p1-*.png` |

## Bitte prüfen (Xander, iPhone)
1. STIMME-Clip ✎ → Takes-Blatt → **[Als Chor-Stimme duplizieren]** → **[Diese Stelle]**: Noten-Editor „Gegenstimme 1“ öffnet sich; eine Note ziehen → nur die Kopie ändert sich, dein Lead bleibt.
2. Takes-Blatt zeigt „♪ Gegenstimme 1 (aus Take 1)“. Chor-Blatt → Zeile „Gegenstimme 1“ → **[Background]** → klingt breiter, links.
3. [Chor] → Terz oben → in der Stimmen-Zeile **[Entkoppeln]** → klingt gleich wie vorher; Lead-Note ändern → die Terz bleibt.
4. [Ganze Spur] in einem Projekt mit mehreren STIMME-Clips → ↶ macht alles in einem Schritt rückgängig.
5. Querformat: Takes-Blatt, Zeile „♪ Tonhöhe · Noten | Chor | Als Chor-Stimme duplizieren“ – lesbar, nichts abgeschnitten?

## Schnittstellen zu den anderen Paketen (für G6+i)
- **Datenform:** Ich schreibe die v2-Feldnamen aus §2.2 (`lane`, `rule`, `dbl[{ms,ct,p}]`, `w`, `dblOff`, `take`) an **v1-Stimmen** (ohne `chor.v`), weil G6+a/G6+c in dieser Basis fehlen. `g6NormChor` behält sie additiv (alte Daten Zeichen für Zeichen gleich; Stimme 5/6 nur mit `lane`). Beim Zusammenführen: Stellen mit Gegenstimmen auf `chor.v = 2` mit `grp` (Background-Werte) heben, sobald `g6pNorm2`/`g6pStart` da sind – die Feldnamen passen.
- **Platzhalter mit Spec-Namen:** `g6pNormLanes` (Spur-Normalisieren in `normTrack`, `chor` in `tkNormProject` gelöscht), Undo-Art `chorlanes` (`g6pLanesSnap/g6pLanesRestore`), `g6pTrackOf`. G6+a liefert die endgültigen Fassungen – meine dann entfernen.
- **Takes:** `src: 'dup'|'chor'` und `of` über einen `tkExt().take`-Haken (G6+a erweitert die Liste in `tkNormTake` – beides zusammen ist harmlos, einen weglassen).
- **Format 6 (`fmtOf`) fehlt hier** (G6+a): Takes mit `src: 'dup'|'chor'` müssen dort zählen. Bis dahin schreibt dieser Stand Format 5; eine 4.25-App spielt Duplikate als „selbst gesungen“ (Rückfall-Fenster `v.take`) und verwirft `of/src/lane/dbl` beim Speichern.
- **tkGc** behält jetzt nach Stück-Namen (auch G6+a-Aufgabe) – bei Konflikt die G6+a-Fassung nehmen, wenn sie gespeicherte Projekte nach `"chunks"` durchsucht.
- **tkActiveIds/tkUsedIds** zählen `voices[].take.take` (gleich G6+0 Nr. 1).
- **Kopien-Abspielen:** `g6Start/g6Apply/g6Auto/g6Ready/g6Buf` nehmen eigene Kopien (`dbl`) und spielen geteilte Takes im Fenster des Lead-Stücks; v1 unverändert. Der Auto-Pegel misst die K-Leistung der Take-Stimmen über die Worker-Analyse (`g6pfMeasure`). G6+c ersetzt diesen Klangweg für v2.
- **G7:** `g7SegOf` findet Stimmen-Takes über `g6pfStelleOf` → `g7Key` wirkt ohne Änderung.
- **G10c:** `g6pfComp(a)` (= `a.comp`) graut Duplizieren/Entkoppeln aus.

## Bekannte Grenzen / Risiken
- Entkoppeln rechnet die Kopien in zwei G2-Durchgängen (eigener Take mit `sh`, dann Verstimmung der Kopie) – bisher ein Durchgang auf der gehörten Fassung. Gemessen gleich (Grob-Messung), M-CT je Note steht aus.
- Noten-Zeiten der Kopien-Verstimmung: Take-Zeit vor der Zeitkarte gegen gehörte Fassung (nach Zeitkarte). Bei Takes mit Zeitkarte kann die Verstimmung der Kopien an Notengrenzen um die Verschiebung danebenliegen [K].
- Ein v1-Rezept-Tipp im Chor-Blatt behält jetzt entkoppelte/duplizierte Stimmen (höchstens 6 Stimmen zusammen).
