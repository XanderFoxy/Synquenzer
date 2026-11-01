# G6+e – Blatt „Chor“ neu · STATUS

**Stand:** gebaut, alle Paket-Tests grün (78/78, `tests/last-run.txt`). **Nicht abgenommen:** Xander hat es noch nicht gesehen.
Basis `bau/snapshots/R-4252.html` (VERSION unverändert 4.25.2), Arbeitsdatei `index.html`, Unterschied `patch.diff` (örtlich gegen R-4252).

## Gebaut
- Stil-Raster: 8 Kacheln (≥ 52 px), hochkant 2 × 4, quer 4 × 2, Name + Zeile (≤ 20 Zeichen) einzeilig ohne Auslassungspunkte, auch bei 320 px.
  Fortschritt als drehender Ring in der Kachel, ohne Höhenänderung (gemessen).
- Mischpult der Chor-Gruppe: [Chor an/aus], **[Gekoppelt]** (Standard AN), [Klang ▸], [Auf alle Stellen]; Regler **„Chor“** (= Abstand zum Lead in dB), Hall, Echo.
- [Klang ▸]: Tiefschnitt, Mitte, Luft, Zischlaute [ganz][leiser][weg], Hall-Vorverzögerung [aus][1/64][1/32][1/16], Zeile „Echo-Zeit des Songs“ mit [Stil-Wert … übernehmen] (nur wenn der Stil einen Vorschlag hat und Echo > 0).
- Spur-Zeilen: Farbfeld mit Ziffer (Tabelle §1.6, Tokens `--chor1…--chorf`), Name (Tipp = umbenennen, ≤ 24 Zeichen), [S] [M] [♪] [⋯]; Pegel und Pan.
  Hochkant zweizeilig, quer einzeilig ab 720 px Breite (bei 568 px quer zweizeilig, die Liste scrollt innen).
- [⋯]: Doppel [1–4], Versatz, Cent, Breite, [Selbst singen], [Entkoppeln], [Stimme löschen]; graue Spur: nur [Spur löschen].
- [+ Stimme ▾] mit 15 Rollen (vorhandene grau), höchstens 6 Stimmen und 8 Spuren (eine graue Spur wird übernommen, sonst Toast).
- Ein Chor aus 4.25: alte Knöpfe + Kopfzeile „Chor (Fassung 4.25)“ + [Auf Chor-Gruppe umstellen] + Stil-Raster.
- Undo: jede Geste ein Schritt (Regler beim Loslassen, Doppeltipp = Stil-Wert als ein Schritt, Stil = Gruppen-Undo inkl. `chorlanes`).
- Kopplung (Nachtrag 01.11.): AN = Chor folgt dem Lead-Regler (dB-gleich). AUS speichert den Lead-Pegel (`S.tracks[st].chor.cpl = {off, ref}`),
  danach wird jede Änderung am Lead-Regler im Chor ausgeglichen. Wieder AN: Der jetzige Abstand bleibt, der Ausgleich geht in `grp.below` jeder Stelle (ein Undo).

## Abnahme (Paket-Tests, `node tests/g6pe.mjs`)
| Punkt | Ergebnis |
|---|---|
| G6P-40 Ablauf per Touch: Takes-Blatt → [Chor] → [Gospel] → 3 Spuren „Chor Sopran/Alt/Tenor“ mit Farben, jede Geste 1 Undo, ↶/↷ deep-equal | ✓ |
| G6P-41 Platz in P1 320×568, P2 375×667, P3 390×844, L1 568×320, L2 844×390, XL 926×428 (leer, Mischpult, [⋯] offen, Klang offen): Treffer ≥ 44, nichts abgeschnitten, Blatt im Bild, keine Seiten-Überbreite, Spur-Liste scrollt innen | ✓ |
| G6P-41 kein Layout-Sprung beim Rechnen | ✓ |
| G6P-42 Umbenennen per Tastatur ≤ 24 Zeichen, Doppeltipp = Stil-Wert (1 Schritt), [Spur löschen] grau = 1 Schritt | ✓ |
| G6P-K1 Lead −6 dB: gekoppelt → Chor folgt; entkoppelt → Ausgleich +6,00 dB (Chor bleibt); wieder an → Abstand bleibt | ✓ (Faktor gemessen, nicht am Ausgang) |
| v1-Ansicht, Umstellen v1 → v2, ↶ → v1 deep-equal | ✓ |
| M-SAVE Speichern → Laden deep-equal (Chor v2 + Chor-Spuren) | ✓ |
| Smoke: keine Seitenfehler in allen Läufen | ✓ |

## Offen / bewusst nicht gebaut
- **Farbpunkte in Matrix und Song: nicht gebaut** (laut Auftrag nur Vorschlag, [V-Funk]). Vorschlag: eine Reihe 6-px-Punkte (Farbe der Spur, §1.6) unten in der STIMME-Zelle, Song: 2-px-Streifen je Stimme am unteren Rand, innerhalb der heutigen Höhe.
- G6P-43/44 (Bildzeit Matrix/Song, Tipp-Reaktion) nicht gemessen; G6P-40 „wirken (Messwerte wie G6+c)“ nur als Daten/Knoten-Faktor geprüft, nicht am Ausgang – das misst G6+c.
- Lead-Pegel „je Songteil/Refrain-Block“ (Nachtrag Kopplung): der Ausgleich liest nur den Spur-Regler `sound.fx.vol`; Teil-Pegel kommen mit G6+c.
- Klang auf dem 4.25-Weg (Platzhalter): Stumm/Chor aus/Kopplung/Abstand wirken über `g6Apply`; Doppel-Anzahl, Versatz, Cent, Breite, Tiefschnitt, Mitte, Luft, Zischlaute, Vorverzögerung werden gespeichert, hörbar erst mit G6+b/G6+c.
- Regler-Griff: sichtbar 22 px, Trefferfläche ist der ganze Regler (≥ 44 × 44 px, Tipp springt dorthin).

## Platzhalter (werden beim Zusammenführen ersetzt; nur gesetzt, wenn die Funktion fehlt)
`g6pTrackOf`, `g6pNormLanes`, `g6pNorm2`, `G6P_STYLE` (Tabelle aus §3 G6+d abgeschrieben), `g6pApplyStyle`, `g6pConvert`, `g6pDecouple` (Toast „kommt mit G6+f“), `g6pVoiceMul`, `g6pInfo`.
Nahtstellen im Alt-Code (je 1–2 Zeilen, siehe `patch.diff`): `g6NormChor` (v2-Weiche), `undoState`/`undoApply` (`chorlanes`), `normTrack`/`tkNormProject` (`chor` an der STIMME-Spur),
`g6Sheet`/`g6SheetPaint` (neues Blatt, alte Ansicht als `g6SheetPaintV1`), `g6Auto` (Abstand aus `grp.below`), `g6Apply` (Faktor `g6pVoiceMul`).

## Bitte prüfen (Xander, iPhone, ca. 3 min)
1. STIMME-Clip ✎ → [Chor] → [Gospel]: erscheinen drei Spuren „Chor Sopran / Alt / Tenor“ mit Farbfeld?
2. [M] bei Sopran, dann Regler „Chor“ ziehen: Chor leiser/lauter, Lead bleibt?
3. Lead-Spur-Regler runter: Chor geht mit. [Gekoppelt] aus, Lead-Regler runter: Chor bleibt stehen.
4. Hochkant und quer: Ist irgendwo etwas abgeschnitten oder zu klein?
