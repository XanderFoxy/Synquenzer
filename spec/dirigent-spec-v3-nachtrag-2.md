# SYNQUENZER v3 — Nachtrag 2 zur Bau-Spezifikation (verbindlich, Endfassung)

Stand 17.10.2026 (Runden 7–9), **Revision 3 = Endfassung** (Review 1, Revision 2 und Review 2 eingearbeitet, Protokolle am Ende). Status: **verbindlich**. Was Review 2 geändert hat, steht im Review-Protokoll 2 am Ende; die betroffenen Einträge tragen „(Rev. 3)“, neue IDs sind EN2-31, EN2-32, K2-55 … K2-72 und die Abnahmepunkte N2-4f-02, N2-VS1-03, N2-VS5a-01, N2-VO4a-03, V10f-07; neue Rückfragen VC4, S-10, B-12. Builder und Tester lesen `dirigent-spec-v3.md`, `dirigent-spec-v3-nachtrag-1.md` **und** diesen Nachtrag. **Vorrang: Nachtrag 2 vor Nachtrag 1 vor Spec v3.** Was hier nicht geändert wird, gilt unverändert.

## Änderungen dieser Revision (Rev. 2, 17.10.2026)

Grundlage: alle neueren Recherche-Dateien (Liste „Grundlage“ unten) und die Gegenproben N2.0.2 Nr. 8–13. Was nicht genannt ist, steht wie in Revision 1.

1. **FM-Feld neu gegründet (Teil A, EN2-19):** Führend ist jetzt `r7/kodamo-delta-pdf.md` mit `r7/kodamo-pdf/handbuch-komplett.md`. `r7/kodamo-delta.md` gilt nur noch in den Punkten der Entscheidungstabelle A.3 (K2-36; K2-18 ist aufgehoben). Gestrichen sind die Annahmen aus der Suchauszug-Zeit, die dem Handbuch widersprechen: „Bewegen ändert nie Verbindungen“, „Leerraum schnappt zurück“, „Linie antippen = Tiefe/Lösen“, „nur 1 Feedback je Algorithmus“, Tiefe je Kante und Mod-Picker beim Halten.
2. **FM-Feld im Einzelnen:** genau 6 Operatoren (7–8 entfallen); Feedback als Wert mit Badge an jedem Operator; Drücken wählt sofort; Schieber waagrecht wie im Handbuch; Geometrie und Farben nach dem PDF-Delta (Rahmen-Grau #5B6170 bleibt); zweiteiliger Live-Balken; Werkswellen nach den Formeln aus `kodamo-delta.md` mit Mipmaps; Linien-Animation nur beim Verbinden; INIT FM = DX-Alg. 1 (K2-37 … K2-44).
3. **EssenceFM-Hüllkurven (Punkt-Form) fest** als V4f in der FM-Gruppe; Abgleich mit Nachtrag 1, A.4b in A.5; A.4b Punkt 11 geändert (K2-45). Wellen zeichnen (V4e) ist fest und steht nach V8a.
4. **N7F-Abnahme:** gültig sind die IDs aus `kodamo-delta-pdf.md` §9 (N7F-01 … N7F-57, mit 21b und 27b). Die gleichnamigen Punkte in `kodamo-delta.md` §8 sind ungültig. Zuordnung zu den Paketen und Änderungen in A.6.
5. **S9 vollständig (B.5):** Die Song-Seite öffnet sich 600 ms nach dem Anheben von selbst, auch ohne Bewegung, wie Xander es beschreibt. Das Teil-Blatt öffnet nur, wenn vor dem Öffnen ohne Bewegung losgelassen wird. Nach dem Öffnen zählt ein Ablegen erst nach 12 px Bewegung (K2-35 ersetzt K2-23; Abnahme N2-2e′-03).
6. **Eigene Adresse (EN2-21):** Die eigenständige Seite ist jetzt GitHub Pages `https://xanderfoxy.github.io/Synquenzer/` (Repo `XanderFoxy/Synquenzer`). Dort laufen Mikrofon, gespeicherte Takes und Online. Die githack-Seite bleibt Spiegel ohne Online. In der Claude-App gibt es weiter kein Mikrofon (heute erneut gelesen).
7. **Online fest (neu Teil G, EN2-22):** VO1 und VO2 direkt nach V0; VO3 und das gemeinsame Arbeiten am selben Song (VO4a–VO4c nach `r8/zusammenarbeit-modell.md`) nach der Bibliothek; Jam VC3 mit VC3b (Supabase, Fern-Einspielen nach dem Vorbild Digital Musician, Jam-Take als Version). VC1 entfällt, VO3 übernimmt die Gemeinschafts-Sounds (EN2-27). Empfehlung: Supabase-Projekt vor dem Rollout in eine eigene Organisation verschieben (O-2).
8. **Lage-Grenzen fest (neu Teil H, EN2-23):** Paket VL direkt nach den beiden Song-Gruppen.
9. **Resynthese fest (neu Teil I, EN2-24):** E8 aufgehoben; V9d, V9d′ und V9e ersetzen V9c.
10. **Bibliothek (Teil D, EN2-25):** V10P steht jetzt am Anfang von Gruppe 15, hinter dem neuen Tor **PR-V** (Prüfrunde mit Webzugang für alle Quellen, die ohne Netz entstanden sind). V10P bekommt Xanders Lieblings-Sounds (Vogue, And One, Tiga & Zyntherius samt Slap-House-Mix, VIZE, Second Decay, The Frozen Autumn), teils über die neue ★-Ausnahme. SC1 und EB-03 gehören zu Stufe 1 (K2-52).
11. **Instrument-Vorlagen VI1a–VI3** nach `r8/studio-setups.md` (neu D.9, EN2-26).
12. **Neue Reihenfolge (Teil E, EN2-30):** 19 Gruppen in der Reihenfolge des Auftrags, ausdrücklicher Abhängigkeits-Check gegen Nachtrag 1, C.3 (E.3). 78 feste Pakete und 1 optionales, ≈ 377–436 h reine Bauzeit, ≈ 4,59 MB am Ende (gerechnet mit `scratchpad/n2-tools/budget4.py`).
13. **Dateigrenze 5,0 MB** statt 4,5 MB (EN2-28 ersetzt EN2-13); Wächter bleibt die Startzeit-Abnahme §15.3.
14. **Fach-Prüfung (neu Teil J, EN2-29):** Jedes Paket bekommt vor der Abnahme einen Prüf-Blick aus sechs Fachrichtungen (FM/DSP, Touch, Song/Sequencer, Backend/Sicherheit, Klang, iPhone-Leistung).
15. **Folgeänderungen:** V2a vergibt feste `uid` für Spuren und Szenen (N2-2a-01); Zwischenstand nach VS2 für Xanders Gerätetest N7V-12 (N2-VS2-03); während der Mikrofon-Aufnahme lädt SYNC nichts hoch, Audio bleibt lokal (N2-VS1-02); Teil F, Quellen und Protokoll neu.

**Grundlage**
- Xander: `v3-ideen/fragen-xander-7.md` (P1–P5, F, S1–S8, A, L1–L3), `fragen-xander-8.md` (O, V, T, S9), `fragen-xander-9.md` (FM-Hüllkurven, VC3/VC4 fest, Resynthese, Vogue, And One, Slap House, Second Decay, Studio-Setups, Digital Musician).
- FM-Feld: `r7/kodamo-pdf/handbuch-komplett.md` (HK) mit dem Handbuch-PDF `r7/kodamo-pdf/EssenceFM-manual.pdf`; `r7/kodamo-delta-pdf.md` (KP, führend); `r7/kodamo-delta.md` (KD, Stand 15:34, nur nach A.3).
- Song: `r7/song-delta.md` mit `r7/song-geo/`. Stimme: `r7/stimme.md` mit `r7/stimme-proto/`.
- Online: `r7/online.md`, `r7/online-schema.sql`, `r7/online-test/`, `r8/zusammenarbeit-modell.md` (mit `r8/zusammenarbeit-mockups/` und Nachtrag N-DM), `r7/spezial-digitalmusician.md`.
- Lage: `r7/transposition-lage.md` mit `r7/lage-proto/`. Resynthese: `r8/resynthese-pakete.md`, `r8/resyn-prototyp.md`, `r8/resynthese-recherche.md` mit `r8/resyn-proto/`, `r8/resyn-pakete/`, `r8/rev-resyn/`.
- Bibliothek: `r6/bibliothek-recherche.md`, `r7/vorbild-katalog.md` (Master-Katalog mit Stufen, `r7/katalog-work/katalog.json`), `r7/vorbild-spezial.md` (Tier-1-Wünsche), die Quelldateien `r7/vorbild-pop.md`, `-helden.md`, `-pioniere.md`, `-achtziger.md`, `-szene.md`, `-dark.md`, `-coldwave2.md`, `-ebm-dark.md`, `-cold-retro.md`, `-retro.md`, `r7/spezial-vogue.md`, `-andone.md`, `-slaphouse.md`, dazu `r8/studio-setups.md`.
- App-Stand: `synq-snapshots/V0a-fix.html` (App 3.1.0, 1 316 464 Byte), nur gelesen; V0b ist im Bau.
- Plattform (Rev. 2, nur gelesen): Supabase-Projekt `synquenzer` (ref `dbdnsryoivvezspgydpx`), GitHub-Repo `XanderFoxy/Synquenzer`.

**So liest man den Nachtrag**
- **Kennzeichen** für Aussagen über echte Produkte, Bands und Geräte:
  - **BELEGT** = Primärquelle (Handbuch, Interview, Katalog) oder zwei unabhängige Quellen.
  - **WAHRSCHEINLICH** = eine Sekundärquelle.
  - **UNBELEGT** = keine Quelle; Vermutung oder eigene Kenntnis.
  - „(SE)“ = nur ein Suchauszug der genannten Seite wurde gelesen.
- **Eigener Entwurf:** Alles ohne Quellenangabe ist Gestaltung dieses Nachtrags bzw. der Deltas, keine Tatsache. „gemessen“ = Chromium oder Node auf der Xeon-VM, nie am iPhone. **eK** = eigene Kenntnis, ungeprüft.
- **Beleg-Kürzel in Daten:** `b` = BELEGT, `s` = WAHRSCHEINLICH, `h` = von Xander gehört und bestätigt (EN2-18), `u` = UNBELEGT. `e` (Einschätzung) aus R6 zählt wie `u`.
- **Kürzel der Quellen in Teil A:** HK = `r7/kodamo-pdf/handbuch-komplett.md`, KP = `r7/kodamo-delta-pdf.md`, KD = `r7/kodamo-delta.md`; „Handbuch S. n“ = Seite des PDF.
- **IDs:**
  - Neue Entscheidungen `EN2-NN`, Korrekturen `K2-NN`. Revision 2 hat keine ID neu vergeben, die es schon gab; geänderte Einträge tragen „(Rev. 2)“, aufgehobene bleiben mit Verweis stehen.
  - Zusätzliche Abnahmepunkte zu einem Paket: `N2-<Paket ohne V>-NN` (z. B. `N2-4b-01`, `N2-2e′-01`, `N2-VS0-01`, `N2-VO1-01`). Sie gelten **zusätzlich** zur Checkliste des Pakets.
  - Neue Pakete: **V10P**, **VK2**, **V10f**, **V4f**, **VL**, **VO1 … VO3**, **VO4a … VO4c**, **VC3b**, **V9d**, **V9d′**, **V9e**, **VI1a … VI3**; ihre Punkte heißen `<Paket>-NN`.
  - Punkte aus Deltas und Entwürfen behalten ihre IDs: `N7F-NN` (FM-Feld, Zählung KP), `N7S-NN` (Song), `N7V-NN` (Stimme), `N8O-NN` (Online), `ZA-NN` und `DM-NN` (Zusammenarbeit), `N8T-NN` (Lage), `N9R-NN` (Resynthese); Regeln `N7-R1 … R14`, `R0 … R12` (FM-Gesten nach KP), Entscheidungen `EK-NN` (nach KP), `EN7-NN`.
  - Prüf-Blicke der Fach-Prüfung: `FP-DSP`, `FP-TOUCH`, `FP-SONG`, `FP-SICHER`, `FP-KLANG`, `FP-IPHONE` (Teil J).
  - **Gleiche Kürzel, verschiedene Dinge (Rev. 3):** **VL-R1** ist die Verlaufs-Regel aus Nachtrag 1, VC2a (`historyCheck()`); sie gehört **nicht** zum Paket VL (Lage). Paket VL hat die Punkte N8T-NN und N2-VL-NN, keine Regel VL-Rn. **D1–D4 in Teil A** sind Abweichungen vom Handbuch (KP §4.13); **D1–D6 in I.4** sind Entscheidungen aus `resynthese-pakete.md` §12.1. Die gemeinsamen Punkte der Instrument-Vorlagen heißen `<Paket>-VI-0n` (D.9).
- **Bau-Reihenfolge:** Teil E ersetzt Nachtrag 1, C.1, C.2 und C.4 und ergänzt C.3. C.5 gilt weiter, ergänzt um E.5.

**Inhalt**
- N2.0 Grundlagen: Runden 7–9 → Ort, Gegenproben, Entscheidungen, übernommene Deltas und Entwürfe
- Teil A: FM-Feld nach EssenceFM (V4a, V4b, V4f, V4c; V4e)
- Teil B: FANG TEIL und Song-Ablauf (V0c, V2a, V2c–V2f, V3a), S9 vollständig
- Teil C: Stimme und Mikrofon (VS0–VS7), Audio quantisieren
- Teil D: Bibliothek nach Vorbildern (V10P, V10a, V10d, V10f, V10e, VK2, §12.8), Tor PR-V, Instrument-Vorlagen (VI1a–VI3)
- Teil E: Bau-Reihenfolge (19 Gruppen), Abhängigkeiten, Versionen, Budgets
- Teil F: Kurzantworten an Xander und offene Fragen
- Teil G: Online und Zusammenarbeit (VO1–VO3, VO4a–VO4c, VC3, VC3b)
- Teil H: Lage-Grenzen (VL)
- Teil I: Resynthese (V9d, V9d′, V9e)
- Teil J: Fach-Prüfung je Paket (Team)
- Quellen, Revisions- und Review-Protokoll

---

## N2.0 Grundlagen

### N2.0.1 Runden 7–9 → wo es steht

| Xander (gekürzt) | Lösung | Ort | Paket, Gruppe (Teil E) |
|---|---|---|---|
| P1 Kodamo-EssenceFM-Nachbau „genau wie EssenceFM“; Handbuch komplett lesen; unten die Träger, darauf ziehen = modulieren, RECHTS die Werte | Handbuch V7.0 (82 S.) gelesen; Feld links, Wertefeld rechts, Gesten nach Handbuch S. 19, genau 6 Operatoren, Punkt-Hüllkurven wie S. 31–33 | Teil A, EN2-02, EN2-19 | V4a, V4b, V4f, V4c · Gr. 3; V4e · Gr. 13 |
| P2 FANG TEIL / Song-Ablauf (F, S1–S9) | Song = Zeitleiste; Taktstrich-Regel; Ziehen und Ablegen mit Selbstöffner (S9); Einfügen/Ersetzen; Aufnahme im Song; Glas-Ansicht; eigener Clip | Teil B, EN2-04, EN2-20 | V0c (Gr. 1), V2a–V2c′ (Gr. 4), V2d–V2f (Gr. 5) |
| P3 Mikrofon: einsingen, **einspielen**, Beatbox, Gesangsspur säubern | nur auf der eigenen Pages-Seite; Mikro-Check VS0 früh; einspielen (einstimmig) fest in VS2; Akkorde erkennen (VS7) optional | Teil C, EN2-06, EN2-21, K2-33 | VS0 (Gr. 2), VS1–VS2 (Gr. 6), VS3–VS5b (Gr. 7), VS6 und *VS7* (Gr. 8) |
| P4 Akkord-Zeile bearbeiten und quantisieren; Audio quantisieren | Akkord-Chip bearbeiten und Akkorde quantisieren schon in V0c; Audio-Quantisierung in VS5a/VS5b | B.1 Nr. 9–10, C.5, EN2-05, EN2-07 | V0c (Gr. 1), V2c (Gr. 4), VS5a, VS5b (Gr. 7) |
| P5 Bibliothek mit Klassiker-Sounds und Hörbeispielen (L1–L3, V: „zu ALLEN diesen Acts Referenz-Sounds“) | Zulassung nur mit Beleg, ★-Ausnahme für Xanders ausdrückliche Wünsche, erweitert auf je einen Sound jedes in Runde 7/8 genannten Acts ohne Werks-Sound (EN2-31, Rev. 3); And One deutschsprachig = SZ-01 (D.3a, Rückfrage B-12); Prüfrunde PR-V vorher; Hörproben bis 8 Takte, nicht repetitiv; 9 Industrial-/EBM-Bassmuster ⧉; 10 Genre-Demos; Instrument-Vorlagen | Teil D, EN2-08 … EN2-12, EN2-18, EN2-25, EN2-26 | VK2 (Gr. 12), V10P, V10a–V10c (Gr. 15), V10d, V10f, V10e (Gr. 16), VI1a–VI3 (Gr. 17) |
| Runde 8 O: online, Login, paarweise Zusammenarbeit; Runde 9: Supabase als einen der **ersten** Punkte, Dateien des Kumpels sehen, BandLab-Fork, „die Music“ = Digital Musician | `r7/online.md` (Anmelden, nie verloren, Paar-Räume, Realtime), `r8/zusammenarbeit-modell.md` (Versionen, Abzweigen, gleichzeitig am selben Song ohne stilles Überschreiben), `r7/spezial-digitalmusician.md` (Fern-Einspielen, Jam-Take als Version) | Teil G, EN2-22, EN2-27 | VO1, VO2 (Gr. 2); VO3, VO4a–VO4c (Gr. 18); VC3, VC3b (Gr. 19) |
| Runde 8 T: Lage-Grenzen wie Genos, aber einfach | `r7/transposition-lage.md`: Klammer je Spur, Musik folgt der Hand, Pfeile ↑/↓ je Akkord, Richtung je Clip und Akkord | Teil H, EN2-23 | VL (Gr. 6) |
| Runde 9: FM-Hüllkurven „Katastrophe“ | Nachtrag 1, A.4b (V0d, DX7-genau); dazu die EssenceFM-Punkt-Form in V4f | A.5 | V0d (Gr. 1), V4f (Gr. 3) |
| Runde 9: Ja zu VC3 und VC4 | VC3 (zwei Geräte) mit VC3b (Supabase, Fern-Einspielen) und VC4 (KI-Helfer) fest; das VC4-Tor fragt F.2 VC4 ab (Rev. 3) | G.7, E.1, F.2 | Gr. 19 |
| Runde 9: „RLS-Absicherung der Klassenzimmer-Datenbank: Ja … nichts an der Webseite kaputt machen, Webseiten-Code nicht ändern“ (Rev. 3) | **Eigene Aufgabe außerhalb des SYNQUENZER-Baus** (`r8/rls-klassenzimmer.md`, nur mit Xanders Okay je Schritt); EN2-22 und N2-VO1-02 gelten nur für den SYNQUENZER-Bau; kein Bau-Paket ändert Code, Zweige oder Dateien des Webseiten-Repos außer dem Spiegel-Zweig `dirigent-synth` | EN2-32, E.5 Nr. 9, G.8 R0b | – |
| Runde 9: Resynthese (E8 aufheben) | E8 neu; Teiltöne + Rauschbänder + Rauheit + kurze Original-Einsätze, ≤ 60 KB je Klang | Teil I, EN2-24 | V9d, V9d′, V9e (Gr. 14) |
| Runde 9: Studio-Setup je Vorbild, Frozen Autumn „Kawai K1?“, And One | Nur Belegtes ins ⓘ; K1 UNBELEGT (Deutung: Elka Synthex); Instrument-Vorlagen nach Geräte-Rangliste | D.2, D.8, D.9, EN2-18, EN2-26 | V10P (PO-1), VI1a–VI3 (Gr. 17) |
| Runde 9: Vogue „Vom Himmel hoch“ (Bass mit öffnendem Filter, „Sounds, die zu einem sprechen“), And One „I.S.T.“/„Ghama Voodoo“ (bedrohlicher Signal-Bass, typischer And-One-Bass), Tiga & Zyntherius „Sunglasses at Night“ samt Slap-House-Mix, VIZE, Second Decay | Tier-1-Wünsche in V10P, teils über die ★-Ausnahme; Lesarten nebeneinander zum Wählen | D.3a, EN2-25 | V10P (Gr. 15) |
| Runde 9: „Spezialisten für jeden Bereich wie bei Reason/Ableton“ | sechs Prüf-Blicke je Paket vor der Abnahme | Teil J, EN2-29 | alle |
| Runde 9: „mobiler Notizblock wie Ed Sheeran“: einspielen, on the fly loopen, **den Loop erweitern**, live zum Song ausbauen (Rev. 3) | Kern = FANG TEIL + Song-Zeitleiste + Live-Punch (Teil B) + Stimme (Teil C). **Loop erweitern** heute schon: Clip-Blatt [×2] (verdoppelt Länge **und** Inhalt, vorhanden seit v2; Spec §5.3 „Dehnen“ nennt den Unterschied) und weiter einspielen mit REC/Overdub im laufenden Clip (vorhanden); FANG schließt am Taktstrich (N7-R1). Einen laufenden Loop **ohne Anhalten** verlängern und weiter aufnehmen ist nicht geplant → Rückfrage S-10 | B, C, F.2 S-10 | V2d, VS2 (vorhanden: ×2, Overdub); live verlängern nach S-10 |
| Runde 7/9: „aktuellen Stand schicken“ | Zwischenstände nach V0c, V0d, jeder Gruppe, V4c und VS2 (EN2-15); heute liegt V0a-fix schon auf der Pages-Seite | E.5 | – |

### N2.0.2 Gegenproben dieses Nachtrags

1. **EssenceFM-Handbuch, direkt gelesen.** PDF `r7/kodamo-pdf/EssenceFM-manual.pdf` (82 Seiten, „For firmware V7.0, updated 2025-05-15“), Text mit PyMuPDF durchsucht (`scratchpad/n2-tools/pdfgrep.py`, `python3 -I`). Wörtlich gefunden: S. 18 „The voice editor is split into two parts: the left part of the screen displays the algorithm, while the right panel displays parameters relative to the voice (when no operator is focused) or relative to the focused operator.“; S. 18 „Operator output levels are displayed in real-time as you are playing“ (Darstellungsform nicht genannt) und, im Base-Reiter ohne Fokus, „Volume is displayed by a vertical bar on the left side of each operator“, dazu „they all become gray“, sobald ein Operator gedrückt ist; S. 19 Gesten (Ziehen verbindet, auf schon verbundenen = tauschen, Bewegen löst die unteren Verbindungen, Loslassen im Leeren = fällt, zwei Finger = verbinden, Doppeltipp = stumm, grün = fokussiert); S. 11 „Simply drag the slider horizontally to change its value“ (Ziffernblock, Doppeltipp = Mitte); S. 12 Lesart von oben nach unten, Träger unten; S. 13, 25, 28 Feedback Source/Level „[OP1 and OP2 only]“, Quelle jeder Operator, also **zwei** Feedback-Wege je Voice; S. 32–33 Punkt-Hüllkurven, logarithmische Zeitachse, Pinch-Zoom. → BELEGT. Die Auswertung `handbuch-komplett.md` stimmt mit diesen Stellen überein.
2. **Fähigkeitenliste der Claude-App.** Revision 1 las Laufzeitvertrag 0.2.85, Revision 2 las sie am 17.10. erneut (Skill `artifact-capabilities`, angeheftet an Vertrag 0.2.75 des SYNQUENZER-Artifacts): `artifact`, `assets`, `comments`, `db`, `downloads`, `files`, `mcp`, `room`, `sample`, `self`, `user`, dazu `permissions`; „Anything not listed is unavailable to this user.“ **Kein Mikrofon** in beiden Lesungen. → BELEGT (direkt gelesen).
3. **Netz:** Auch in Revision 2 gab es keine neue Websuche (Kontingent der Runde aufgebraucht; WebFetch ENOTFOUND). **Keine Act- oder Geräte-Aussage in D.2 ist gegen ihre URL nachgeprüft.** Deshalb gibt es das Tor PR-V vor V10P (D.2b). Supabase (MCP) und GitHub (`gh api`) waren lesend erreichbar; `xanderfoxy.github.io` wies der Proxy ab (CONNECT 403).
4. **Bau-Stand:** `CHANGES-V3.md` enthält nur V0a (App 3.1.0). V0b ist im Bau (anderer Ablauf, Ordner `dirigent-wt/` nicht angefasst). Der Snapshot `synq-snapshots/V0a-fix.html` (1 316 464 Byte, Version 3.1.0) hat dieselbe Größe wie `index.html` im Pages-Repo (Nr. 10).
5. **Zwei Kodamo-Deltas:** KD (Stand 15:34) behält „Linie antippen (Tiefe/Lösen)“, „Mod-Picker beim Halten“, Tiefe je Kante und DX-Hüllkurven allein (KD Kurzfassung Nr. 6, EK-07, EK-09). KP streicht diese Punkte mit Verweis auf Handbuch S. 12–13, 18–19 und plant die Punkt-Hüllkurven. Entscheidung je Unterschied in A.3 (K2-36).
6. **Budget und Dauer** gerechnet mit `scratchpad/n2-tools/budget4.py` (Prüfung: IDs und Versionen eindeutig, Versionen streng steigend, jede Abhängigkeit liegt vorher; Teil E.4).
7. **Hörproben-Dateien** am Ort geprüft (Liste D.4); in Revision 2 zusätzlich Tempo und Tonart aus `r7/andone-work/aud-blocks.md`, `r7/vogue-work/aud-out.md`, `r7/vorbild-szene-aud.json` (sz01, sz23, sz24) und `r7/vorbild-dark-aud.json` (fa) gelesen.
8. **Supabase (MCP, nur lesend, 17.10.):** `get_project(dbdnsryoivvezspgydpx)` → Name `synquenzer`, Region `eu-central-1`, Status `ACTIVE_HEALTHY`, Postgres 17.11.0.003, angelegt 2026-10-17 10:29 UTC, Organisation `lcdkqquoidsvtitrmedi`. `list_projects` → zwei Projekte in **derselben** Organisation: das Klassenzimmer „XanderFoxy's Project“ (`rolcktiryrvjzbwuvobb`, eu-west-2) und `synquenzer`. `list_tables(public)` → leer (die Migration `vo_init` ist noch nicht eingespielt). Nichts wurde angelegt oder geändert. → BELEGT.
9. **Supabase-Doku** (MCP `search_docs`, Billing FAQ, Volltext): zwei aktive kostenlose Projekte je Owner/Admin, über alle Organisationen gezählt; Projekte lassen sich per Selbstbedienung in eine andere Organisation übertragen. → BELEGT (https://supabase.com/docs/guides/platform/billing-faq · https://supabase.com/docs/guides/platform/project-transfer).
10. **GitHub (`gh api`, 17.10.):** `XanderFoxy/Synquenzer` ist öffentlich, Standard-Zweig `main`, `has_pages: true`, angelegt 17.10. 13:10 UTC, letzter Push 15:20 UTC. Inhalt: `.nojekyll`, `README.md`, `index.html` (1 316 464 Byte). Commits „Initial commit“, „SYNQUENZER-App (Stand V0a) für GitHub Pages“, „SYNQUENZER-App: Stand V0a-fix“. Der Pages-Endpunkt der API ist über den Proxy gesperrt (403). → BELEGT; Pages-Einstellungen ungelesen.
11. **Pages-Adresse:** `https://xanderfoxy.github.io/Synquenzer/` (laut Auftrag; dort funktioniert das Mikrofon laut Meldung des Orchestrators). Von hier nicht abrufbar (Proxy 403). Erreichbarkeit, Groß-/Kleinschreibung des Pfads und der `sw.js`-Bereich des Klassenzimmers auf derselben Herkunft sind **ungeprüft** (eK) → Rollout-Schritt R0b (G.8).
12. **Katalog gegen Revision 1:** `r7/vorbild-katalog.md` §3.2 führt Soft Cell ach·SC1 und Front 242 EB-03 seit seiner Review-Prüfung in Tier 1; Revision 1 hatte beide in V10f (Stufe 2). Berichtigt in K2-52.
13. **S9 gegen `song-delta.md` 5.1:** Dort öffnet die Song-Seite „600 ms nach dem Anheben, solange der Finger hält (egal wo)“; K2-23 aus Review 1 verlangte vorher eine Bewegung. Berichtigt in K2-35.

### N2.0.3 Neue Entscheidungen

| # | Entscheidung | Begründung, Herkunft |
|---|---|---|
| **EN2-01** | **Geltung (Rev. 2).** Verbindlich durch Verweis, jeweils mit den Korrekturen K2-NN: KP Teile 1–9; KD nur §5.2 Nr. 1, §6.2, §6.4 und §6.5 (A.3); `r7/song-delta.md` Teile 3–14; `r7/stimme.md` §4.4, §5–§10, §12–§13; `r7/online.md` §2–§9 mit `r7/online-schema.sql`; `r8/zusammenarbeit-modell.md` §5–§13 mit Nachtrag N-DM; `r7/spezial-digitalmusician.md` §6–§7; `r7/transposition-lage.md` §3, §5–§8; `r8/resynthese-pakete.md` §1, §3–§10; `r8/studio-setups.md` §5–§6. Rangfolge bei Widerspruch: Nachtrag 2 → Delta bzw. Entwurf → Nachtrag 1 → Spec v3. | Alle Entwürfe der Runden 7–9 sind jetzt freigegeben (Auftrag der Endfassung). Doppelte Verbindlichkeit (zwei Kodamo-Deltas) ist aufgelöst. |
| **EN2-02** | **FM-Feld nach EssenceFM (Rev. 2)** wie KP mit A.3: genau 6 Operatoren (immer alle da, aus = stumm), Feld links und Wertefeld rechts, Gesten R0–R9, R11, R12 (R10 und R13 entfallen), Ausgang = Reihe 0 (abgeleitet), Feedback als Wert am Empfänger mit Badge an jedem Operator, DX-Form und Punkt-Form der Hüllkurven, Werkswellen 0–11 mit Mipmaps, Nummern 1–6, DX-Seite bleibt. Farben nach K2-01. | Xander P1; Handbuch S. 2, 11–13, 18–20, 25–33 (N2.0.2 Nr. 1). |
| **EN2-03** | **V4 vor V2 (Rev. 2).** Gruppe 3 = V4a, V4b, V4f, V4c, direkt nach V0 und Online. Nachtrag 1, C.2 Punkt 4 („V4 sogar vor V2: nein“) bleibt aufgehoben. VC2a steht in Gruppe 6; VL-R1 bleibt. | Xanders Reihenfolge P1 vor P2; V4 braucht nur V0d. Die akuten Song-Punkte und P4 kommen schon mit V0c. |
| **EN2-04** | **Song = Zeitleiste** (EN7-01): KETTE, `S.chain`, `ChainItem`, ABWEICHUNG und `flattenChain` entfallen. **Keine neue Zeile** in der Song-Ansicht (EN7-02); der Teil zeigt sich nur als Name in der gelben Taktleisten-Markierung. | Xander S2, S4, S9. |
| **EN2-05** | **V0c übernimmt N7S-01 … N7S-07:** Start-Blatt statt Zielzeile, Banner als Überlagerung, Akkord-Chip bearbeiten, Akkorde quantisieren, gelbe Takt-Auswahl mit Positionsmarke, Schleife als grüne Linie. V0c: 6–7,5 h, +42 KB. | P4 kommt damit in Gruppe 1. Sonst baut V0c eine Zielzeile, die V2e wieder entfernt (`song-delta.md` 14.2). |
| **EN2-06** | **Stimme nur außerhalb der Claude-App (Rev. 2).** Ort: die eigene Pages-Seite (EN2-21), dieselbe Datei mit Feature-Erkennung. VS0–VS6 sind feste Bau-Pakete; „einspielen“ (Quelle „Instrument“, einstimmig, „Oktave sperren“) ist fest in VS2 (K2-33); nur VS7 (Akkorde erkennen) bleibt optional. Gespeicherte Takes (ab VS3) nur auf einer eigenen Herkunft; auf githack Hinweis plus Export. | Fähigkeitenliste ohne Mikrofon (N2.0.2 Nr. 2); `getUserMedia` braucht sicheren Kontext und das oberste Dokument (MDN, BELEGT laut `stimme.md` G4). |
| **EN2-07** | **Audio quantisieren = VS5a (Marken, Scheiben, Quantisieren) und VS5b (Dehnen).** Es gilt das Regelwerk C.5; es ersetzt N7-R14 und `stimme.md` §9, wo sie sich unterscheiden. N7S-51 wandert zu VS5a. | `song-delta.md` §10 verweist selbst auf die Messwerte aus `stimme-proto`. |
| **EN2-08** | **Vorbild-Zulassung.** In die Werksbibliothek kommt ein Vorbild-Sound nur, wenn (a) er in `r7/vorbild-katalog.md` §3 Stufe 1 oder 2 steht und (b) sein Vorbild-Tag den Beleg `b`, `s` oder `h` trägt und die entscheidende Aussage **den Klang betrifft** (Gerät, Patch, Spielweise oder Klangwelt des Acts), mit URL. `u` und `e` → OFFEN (D.8), außer der ★-Ausnahme (EN2-25). Equipboard allein und Gedächtnis zählen nie. Stufe 3 kommt nicht ins Werk, außer ★. Ausnahme: Presets, die Spec A.1 oder R6 (N01–N76) schon planen, bleiben im Werk, verlieren aber ein Vorbild-Tag ohne Beleg. | Auftrag „nur BELEGT/WAHRSCHEINLICH ins Werk“; Katalog-Stufen (`vorbild-katalog.md` §3.1). |
| **EN2-09** | **Hörproben-Format.** `aud.len` ≤ 8 Takte. ▶ spielt „kurz“: die ersten k − 1 Takte und den letzten Takt (die Wendung), zusammen ≤ 8 s bei `aud.bpm`, mindestens 1 Takt. Halten auf ▶ oder ⋯ spielt „ganz“: alle Takte, wenn ≤ 16 s, sonst nach derselben Regel ≤ 16 s. Kein Takt gleich seinem Vorgänger; der letzte Takt ist eine Wendung. **Wendung (Rev. 3, K2-71, messbar):** bei `len` ≥ 2 ist die Intervallfolge des letzten Takts (Tonhöhen relativ zu seiner ersten Note, dazu die Einsatzzeiten) ungleich der des ersten und der des vorletzten Takts, **und** die letzte Note des letzten Takts liegt auf einer anderen Tonstufe der Probe-Tonart als die letzte Note des vorletzten Takts; Drum-Proben: die Einsatzfolge des letzten Takts ≠ der des vorletzten (Fill); bei `len` 1 entfällt die Regel. `v10p-daten.mjs` prüft genau das. Eigene Melodien; einzige Ausnahme gemeinfreie Melodien mit Beleg. IDs `vb-<quelle>-<id>` (D.1). | Xander V („nicht repetitiv“, Wiedererkennung); Dateien liefern 4–8 Takte (`vorbild-katalog.md` §4.8). |
| **EN2-10** | **Vorbild-Paket 1 (V10P) (Rev. 2)** steht am Anfang von Gruppe 15, nach dem Tor PR-V (D.2b): 45 Sounds (die 31 aus Revision 1 und 14 Wünsche Xanders, D.3a), 2 Werks-Sounds, Hörproben, Vorbild- und Wunsch-Filter, Hörtest-Projekt PO-1 und die 9 Industrial-/EBM-Spielmuster als ⧉-Clips (L3). V10d (R6-Presets und restliche Stufe 1) und V10f (Stufe 2) bleiben getrennt. V10a übernimmt die Datenstrukturen aus V10P. | Auftrag: Bibliothek bei V10, Prüfrunde vorher; alle Bausteine (Kits, VK, VK2, Additiv) liegen dann vor, die „Annäherungen“ entfallen fast ganz. |
| **EN2-11** | **DX7-ROM-Werksdaten werden nicht ausgeliefert**, bis die Lizenzfrage geklärt ist (betrifft DM3, N38 bzw. MN4, MM1, MM2). ROM1A bleibt Testreferenz (wie V0d). | Daten von Yamaha; Lizenz UNBELEGT (`vorbild-retro.md` §9 Nr. 6, `vorbild-pop.md` §14). |
| **EN2-12** | **VK2 „Vorbild-Bausteine“ (Rev. 2):** Phaser und Flanger als Spur-Effekt, Vorfilter-Hochpass `p.hpf` 12 dB/Okt., Bitcrusher als Spur-Effekt `fx.crush` (alle Spuren, auch Drums; ersetzt VK Punkt 7 `p.crush`), *(P1)* Poly-Mod-Route. Gruppe 12 nach VK, Version 4.38.0. | Fehlende Bausteine laut Katalog §5.2 und Quelldateien (D.6.4). |
| **EN2-13** | *Dateigrenze 4,5 MB – aufgehoben, ersetzt durch EN2-28.* | – |
| **EN2-14** | **Neue Reihenfolge:** Teil E ersetzt Nachtrag 1, C.1, C.2 und C.4; Versionen neu, streng steigend. | Xanders Prioritäten P1–P5 (Runde 7) und Auftrag der Endfassung (EN2-30). |
| **EN2-15** | **Zwischenstände (Rev. 2):** nach V0c, V0d (EN-20), nach V4c und nach jeder Gruppe an dieselbe Artifact-Adresse **und** auf die Pages-Seite; nach VS2 zusätzlich auf die Pages-Seite für Xanders Gerätetest N7V-12 (N2-VS2-03). Der githack-Spiegel (Zweig `dirigent-synth`) bekommt denselben Stand. | Mikrofon und Online laufen nur auf Pages; Xander will früh probieren. |
| **EN2-16** | **Bedingte Pakete (Rev. 2):** Bedingt ist nur noch VS7 (optional, nach Xanders Ja). VO1–VO3, VO4a–VO4c, VL, V4f, V4e und V9d–V9e sind fest (EN2-19, EN2-22 … EN2-24). VC1 entfällt nach der Bedingung aus Revision 1 (EN2-27). | Alle Entwürfe sind freigegeben (Auftrag der Endfassung). |
| **EN2-17** | **Recherche-Dateien am Bau-Ort (Rev. 2, erweitert C.5 Punkt 9):** V4a–V4f, V4e: HK, KP, KD und `r7/kodamo-delta/`; V0c, V2a–V2f: `r7/song-delta.md`, `r7/song-geo/`; VS0–VS7: `r7/stimme.md`, `r7/stimme-proto/`; VO1–VO4c, VC3b: `r7/online.md`, `r7/online-schema.sql`, `r7/online-test/`, `r8/zusammenarbeit-modell.md`, `r8/zusammenarbeit-mockups/`, `r7/spezial-digitalmusician.md`; VL: `r7/transposition-lage.md`, `r7/lage-proto/`; V9d–V9e: `r8/resynthese-pakete.md`, `r8/resyn-prototyp.md`, `r8/resyn-proto/`, `r8/resyn-pakete/`, `r8/rev-resyn/`; V10P, V10d, V10f, V10e: `r7/vorbild-katalog.md`, `r7/katalog-work/katalog.json`, `r7/vorbild-spezial.md`, die Quelldateien und ihre Hörproben-Dateien (D.4); VI1a–VI3: `r8/studio-setups.md`. Fehlt etwas, wird das Paket nicht begonnen. | Wie Nachtrag 1, C.5 Punkt 9. |
| **EN2-18** | **Hörtest-Projekt PO-1 und Beleg `h`.** Die zugelassenen Wunsch-Sounds ohne Beleg, die nicht schon über die ★-Ausnahme im Werk sind (D.8), kommen als Projektdateien (je Act) außerhalb der Werksbibliothek zu Xander. Sein positives Urteil („erinnert an X“) mit Datum ergibt `h`: Das zählt wie WAHRSCHEINLICH für „erinnert an … (Stil)“, **nie** für ein Gerät. Dasselbe gilt für sein Urteil über die ★-Sounds im Werk. | Xanders Kern-Vorbilder (And One, The Frozen Autumn) haben keinen Gerätebeleg; Xander kennt die Originale. |
| **EN2-19** | **Kodamo-Rangfolge (neu).** KP führt; KD gilt nur nach A.3; Handbuch-Fakten kommen aus HK. Unterschiede werden entschieden nach (1) Handbuch-Fakt vor Auslegung, (2) Xanders P1 „genau wie EssenceFM“ vor eigener Ergänzung, (3) DX-Gleichheit (`fm6` bitgleich) vor Bequemlichkeit. Tabelle A.3. | N2.0.2 Nr. 1 und 5. |
| **EN2-20** | **S9 (neu):** Halten einer Teil-Taste öffnet die Song-Seite nach 600 ms von selbst, auch ohne Bewegung; Teil-Blatt nur bei Loslassen vor dem Öffnen; Schutz 12 px nach dem Öffnen (B.5, K2-35). | Xander S9 „gedrückt halten → die Song-Seite öffnet sich automatisch“; `song-delta.md` 5.1. |
| **EN2-21** | **Eigene Adresse (neu):** Die eigenständige Seite ist `https://xanderfoxy.github.io/Synquenzer/` (Repo `XanderFoxy/Synquenzer`, Zweig `main`). Dort laufen Mikrofon, gespeicherte Takes und Online. `https://raw.githack.com/xanderfoxy/deutsch-mit-xander/dirigent-synth/index.html` bleibt Spiegel ohne Online und ohne gespeicherte Takes (Hinweis plus Export, N2-VS3-01). | Repo und Pages vorhanden (N2.0.2 Nr. 10–11); githack teilt eine Herkunft mit allen Repos (`r7/online.md` §2.7, `stimme.md` G6). |
| **EN2-22** | **Online fest (neu):** VO1 und VO2 in Gruppe 2; VO3 und VO4a–VO4c in Gruppe 18; VC3b in Gruppe 19 (Teil G). Supabase-Projekt `synquenzer` (ref `dbdnsryoivvezspgydpx`); jeder zustandsändernde Rollout-Schritt nur nach Xanders ausdrücklichem Okay; nie im Klassenzimmer-Projekt. | Xander Runde 8 O1–O4 und Runde 9 („Supabase als einen der ersten Punkte“); `r7/online.md` §9 (VO1 braucht kein V2). |
| **EN2-23** | **Lage-Grenzen fest (neu):** Paket VL nach `r7/transposition-lage.md`, erstes Paket von Gruppe 6, direkt nach den Song-Gruppen (Teil H). | Xander Runde 8 T; Auftrag „Song-Gruppen → Lage-Grenzen → Stimme“. |
| **EN2-24** | **Resynthese fest (neu):** E8 ist aufgehoben und durch „E8 (neu)“ ersetzt (I.1); V9c entfällt; V9d, V9d′ und V9e bilden Gruppe 14 (Teil I). | Xander Runde 9; `r8/resynthese-pakete.md` §1. |
| **EN2-25** | **Bibliothek (neu):** (1) Stufen nach `r7/vorbild-katalog.md` §3; (2) **★-Ausnahme:** Ein Sound, den Xander ausdrücklich gewünscht hat (★ in Katalog §3.2 oder `r7/vorbild-spezial.md` §1/§3; dazu C2-06 und DK-05 nach EN2-31), kommt auch mit Beleg `u` ins Werk – ohne Vorbild-Tag, ohne Act im Namen, nur mit dem Chip „Xanders Wunsch ★“ und dem ⓘ-Satz aus D.1 Nr. 12; ein Tag kommt erst mit `h` oder neuem Beleg; (3) **Tor PR-V** vor V10P: Prüfrunde mit Webzugang (D.2b). | Xanders Tier-1-Wünsche haben teils keinen Gerätebeleg; die Quelldateien `vorbild-szene.md`, `vorbild-dark.md` und `vorbild-retro.md` entstanden ohne Web-Recherche (ihre Vorbemerkungen). |
| **EN2-26** | **Instrument-Vorlagen fest (neu):** VI1a, VI1b, VI2a, VI2b, VI3 nach `r8/studio-setups.md` §5–§6 (Stufen A–D), Gruppe 17 (D.9). Stufe E (eigene Samples, Vocoder, Sprachchip) bleibt §18. | Xander Runde 9 („Studio-Setup je Vorbild … Synthesizer nachbauen“). |
| **EN2-27** | **VC neu geordnet (neu):** VC1 entfällt; VO3 („Sounds im Raum“) erfüllt Xanders Wunsch I7 (Freunde laden Sounds mit Namen hoch, zentral bei Xander) auf der Pages-Seite, wie es EN2-16 (Revision 1) als Bedingung nannte. VC3 (zwei Geräte, `room`) und VC4 (KI-Helfer, `sample`) sind fest; neu VC3b (Supabase-Transport, Fern-Einspielen, Jam-Take als Version). | Xander Runde 9 („Ja zu VC3 und VC4“); `r7/online.md` §9; `r7/spezial-digitalmusician.md` L1–L3. |
| **EN2-28** | **Dateigrenze 5,0 MB (neu, ersetzt EN2-13 und EN-17).** Die Startzeit-Abnahme §15.3 bleibt der Wächter. Ab 4,5 MB nennt jedes Paket in CHANGES Dateigröße und Startzeit (Median aus 5). Scheitert die Startzeit-Abnahme, ist das nächste Paket ein Schlankheits-Paket (Daten-Blöcke komprimieren, selten Gebrauchtes erst bei Bedarf entpacken), bevor der Bau weitergeht. | Unbedingte Summe ≈ 4,59 MB (E.4); Artifact-Grenze 16 MB je Seite (Artifact-Werkzeug); `r8/resynthese-pakete.md` D5 schlug dasselbe Prinzip vor. |
| **EN2-29** | **Fach-Prüfung (neu):** Jedes Paket bekommt vor der Abnahme mindestens einen Prüf-Blick aus Teil J (FP-DSP, FP-TOUCH, FP-SONG, FP-SICHER, FP-KLANG, FP-IPHONE). Befunde werden behoben oder in CHANGES begründet; die Zeit zählt zu „Neustarts und Korrekturen“ (1–2 h je Paket). | Xander Runde 9 („Spezialisten für jeden Bereich“). |
| **EN2-30** | **Gruppen-Reihenfolge (neu):** V0 → Online + Mikro-Check → FM-Feld → Song 1 → Song 2 → Lage + Stimme A (+ Mix, Verlauf) → Stimme B → Drums + Beatbox → Editor → Modulation → Klangzustände → Master + Klassiker → Bitmask/Additiv/FM-Wellen → Resynthese → Bibliothek 1 → Bibliothek 2 → Instrument-Vorlagen → Zusammen A → Zusammen B. Abweichungen vom Auftrag sind in E.2 begründet. | Auftrag der Endfassung (Runde 9). |
| **EN2-31** | **★-Ausnahme erweitert (neu, Rev. 3):** Zusätzlich zu den 9 ★-Sounds in V10P kommt je **ein** Sound jedes Acts, den Xander in Runde 7/8 namentlich genannt hat und der sonst keinen Werks-Sound mit Bezug hätte, über die ★-Ausnahme (D.1 Nr. 12) ins Werk: **De/Vision C2-06 Oktav-Pumpbass** und **Static Movement DK-05 Wellenkante-Bass**, gebaut mit **V10f** (beide Katalog-Stufe 2). Sixth June braucht keine Ausnahme: C2-01 Kaltfront-Bass kommt mit V10f über das Genre-Tag (`s`). Die übrigen `u`-Sounds dieser Acts bleiben in PO-1, bis Xander „erinnert an …“ sagt. | Xander Runde 8 V: „zu ALLEN diesen Acts Referenz-Sounds in der Bibliothek“; Katalog §3.3 führt C2-06 und DK-05 mit ★; Review 2. |
| **EN2-32** | **Webseite und Klassenzimmer-Datenbank bleiben unberührt (neu, Rev. 3):** Die RLS-Absicherung der Klassenzimmer-Datenbank ist eine **eigene Aufgabe** außerhalb des SYNQUENZER-Baus (`r8/rls-klassenzimmer.md`, Migration nur mit Xanders Okay je Schritt). Kein SYNQUENZER-Paket und kein Rollout-Schritt ändert Code, Zweige oder Dateien des Webseiten-Repos `XanderFoxy/Deutsch-Mit-Xander`; einzige Ausnahme ist der Spiegel-Zweig `dirigent-synth` (EN2-15). EN2-22 und N2-VO1-02 („nie im Klassenzimmer-Projekt“) gelten für den SYNQUENZER-Bau. | Xander Runde 9: „RLS … Ja … nichts an der Webseite kaputt machen, Webseiten-Code nicht ändern“; Review 2. |

### N2.0.4 Übernommene Deltas und Entwürfe

| Datei | verbindlich | geändert durch |
|---|---|---|
| `r7/kodamo-delta-pdf.md` (KP) | Teile 1–9: Leitsatz, Abgleich A1–A46, EK-01 … EK-14 (ohne EK-07), Definition §4, Mockups und Geometrie §5, Datenmodell §6, Test-API §7, Abnahme N7F-01 … N7F-57 (§9) | K2-01, K2-29, K2-36 … K2-45, K2-55 … K2-61 (Rev. 3) |
| `r7/kodamo-pdf/handbuch-komplett.md` (HK) | Fakten und Seitenangaben zum Handbuch; ersetzt `r7/kodamo-handbuch.md` und `r7/kodamo-oberflaeche.md`, wo sie sich unterscheiden | K2-02 |
| `r7/kodamo-delta.md` (KD) | nur §5.2 Nr. 1 (Ziel-Erkennung), §6.2 (Wellen-Formeln, Prüfmerkmale, Mipmaps), §6.4 (Worklet: Mipmap-Wahl, Phase, Feedback-Rechnung, Live-Pegel), §6.5 (CPU-Messung) | K2-36, K2-38, K2-40, K2-42 (§6.2 nur Tabelle und Mipmaps, §6.4 Mipmap-Wahl je Block; Rev. 3) |
| `r7/song-delta.md` | Teile 3–14 (EN7-01 … EN7-09, N7-R1 … N7-R13, Datenmodell, Test-API, Undo, N7S-01 … N7S-50, Pakete, ersetzte Punkte); Teil 10 (N7-R14) nur, soweit C.5 nichts anderes sagt | K2-05 … K2-07, K2-21, K2-22, K2-24 … K2-28, K2-35, K2-63 |
| `r7/stimme.md` | §4.4, §5–§10, §12 (Pakete), §13 (N7V-01 … N7V-35) | Teil C, K2-07, K2-08, K2-30 … K2-33, K2-64 |
| `r7/vorbild-katalog.md` | §3 (Stufen), §4 (ID- und Namens-Kollisionen, Doppel, eine Beleg-Skala) | EN2-08, EN2-25, EN2-31, K2-09 … K2-17, K2-19, K2-20, K2-52, K2-66, K2-67 |
| `r7/vorbild-spezial.md` | §1 (Tier-1-Tabelle), §3, §4 | EN2-25, K2-53 |
| `r8/studio-setups.md` | §3 (Steckbriefe), §5 (Vorlagen), §6 (Stufen A–D) | D.9, K2-54, K2-72 |
| `r7/online.md` mit `r7/online-schema.sql` | §2–§9: Fakten, Migration `vo_init`, Autosave, Realtime, Oberfläche, Einbau, Test-API, Abnahme N8O-01 … N8O-34, Rollout R0–R13 | Teil G, K2-46, K2-69 |
| `r8/zusammenarbeit-modell.md` | §5–§13 (Begriffe, Versionen, gleichzeitig arbeiten, Abzweigen, Übernehmen, Supabase-Skizze, Konflikt-Regeln, Phasen ZA-A … ZA-D, ZA-01 … ZA-15) und Nachtrag N-DM | Teil G, K2-47, K2-65 |
| `r7/spezial-digitalmusician.md` | §6 (L1–L9), §7 (DM-01 … DM-06) | Teil G, K2-48 |
| `r7/transposition-lage.md` | §3 (Regeln), §5 (Daten, Test-API), §6 (Oberfläche), §7 (Paket), §8 (N8T-01 … N8T-26) | Teil H, K2-50 |
| `r8/resynthese-pakete.md` | §1 (E8 neu), §3–§10 (Technik, Budgets, Oberfläche, Bibliothek, Pakete, N9R-01 … N9R-40, Abhängigkeiten, Test-API) | Teil I, K2-51 |

---

## Teil A — FM-Feld nach EssenceFM (ändert V4a–V4c; neu V4f, V4e fest)

### A.1 Was das Handbuch sagt (BELEGT, Handbuch V7.0, https://kodamo.org/essencefm_manual.php, als PDF gelesen; Auswertung HK)

| Thema | Handbuch (Seite, gekürzt) | Folge im FM-Feld |
|---|---|---|
| Aufteilung | S. 18: links der Algorithmus, rechts die Werte der Stimme (ohne Fokus) bzw. des fokussierten Operators | FELD links (P1 236 px), WERTE rechts (P1 132 px) (KP §5.1) |
| Lesart | S. 12: Operatoren speisen die darunter liegenden; die untersten sind Träger; gelesen wird von oben nach unten; kein Ausgangssymbol in den Bildern | Reihe 0 = Ausgang (abgeleitet); Bodenlinie „AUSGANG“ nur Anzeige (KP Z2) |
| Gesten | S. 19: Ziehen auf einen Operator verbindet; auf einen schon verbundenen tauscht; **jedes Bewegen löst die unteren Verbindungen**; Loslassen im Leeren lässt **fallen** (zum Boden oder auf den nächsten Operator darunter); zwei Finger verbinden zusätzlich; Doppeltipp schaltet stumm | KP R5–R9, R3 |
| Drücken | S. 18–19: Drücken auf einen Operator macht alle anderen grau, das rechte Feld zeigt sofort seine Werte; Drücken ins Leere zeigt die Stimme | R1 (Aufsetzen wählt sofort), R2; Halten wählt nur – kein Mod-Picker beim Halten |
| Pegel | S. 18: Lautstärke als senkrechter Balken links an jeder Kachel (Base-Reiter ohne Fokus, in den Reglerfarben); Ausgangspegel in Echtzeit (Form nicht beschrieben) | zweiteiliger Balken: Fläche bis `ol` + Marke, Live-Teil (KP §4.2, Z5) |
| Farben | S. 18–19 und Bilder: Reglerfarben ohne Fokus; grau + grün mit Fokus; stumm dunkelgrau | KP §4.3 mit K2-01 |
| Feedback | S. 13: Zahl oben rechts = Feedback-Quelle, keine Linie; S. 25, 28: Feedback Source/Level „[OP1 and OP2 only]“, Quelle jeder Operator, auch er selbst → **zwei Wege je Voice** | Wert am Empfänger mit Badge; erlaubt an **jedem** Operator (Abweichung D2, A.3 Nr. 2) |
| Operatoren | S. 2, 6: 6 Operatoren je Voice; mehr nur über Schichten | genau 6 (K2-37); Schichten bleiben §18 |
| Schieber | S. 11: „Simply drag the slider horizontally to change its value“; Ziffernblock; Doppeltipp zentriert bipolare Schieber | waagrechter Relativzug in allen Größen, Ziffernblock, Doppeltipp = Mitte (K2-38) |
| Reiter | S. 27: Base, Amp, Mod, Pitch; M und S | Basis · Amp · Mod · Tonh. + M, Solo unter ⋯ (KP §4.7) |
| Hüllkurven | S. 31–33: bis 6 Punkte, frei setzbar; Sustain, Skip on Release, Loop A/B, Remove Loop, Lin/Exp, Scale, Retrig/FreeRun; logarithmische Zeitachse, Pinch-Zoom, „Total length“ | Punkt-Form in V4f (KP §4.11); DX-Form aus A.4b bleibt (A.5) |
| Tonhöhen-Hüllkurve | S. 30–31: je Operator; Bereich Tone, 5th, 1, 2, 4, 8 Oktaven | `pit` je Operator; Bereiche in V4f, DX-Bereich in V4a |
| Wellen | S. 2, 61: 48 editierbare Wellen, 512 Samples (S. 70, 74); Bild S. 61: Werkswellen 0–11 mit Namen; S. 14: „aliasing limit is easily exceeded“ | Werkswellen 0–11 ab V4a mit Mipmaps (K2-40); Zeichnen V4e (nach V8a) |
| Linien | S. 12–13, Bilder: dünn, mint, unten-Mitte → oben-Mitte, grau von stummen Modulatoren; S. 67 Schalter „Line Animations“ | KP §4.4 mit K2-41 |
| Algorithm Library | S. 20, 25: 32 DX7-Algorithmen als Vorlagen | `dxLayout` (KP §6.5) |
| Randomize | S. 20: Häkchen Freq, Flt, VEG, PEG, Algo, Lvls; Bild S. 18 zusätzlich LFO | Zufall-Blatt (KP §4.7) mit ☑ LFO, ☑ Wellen als Zusatz Z19, Filter nach D4 (K2-59, Rev. 3) |
| Undo | S. 7: bis 1024 Schritte, auch Algorithmus-Änderungen | ein Undo je Geste |

Gemessene Farben aus den Handbuch-Bildern (HK §3.2, eigene Pixelmessung, BELEGT als Messung): Knopf- und Rahmenfarben 1 rot (203,19,23), 2 weiß, 3 grün (71,202,10), 4 grau (89,96,132), 5 blau (10,106,255), 6 schwarz (27,29,37); gewählter Operator petrol gefüllt (10,110,91) mit mint Rahmen (10,202,159); Linien mint (10,255,173); alle anderen Rahmen bei Fokus grau (54,58,78); stumm (62,67,91).

### A.2 Was gilt (Kurzfassung)

- **KP Teile 1–9 gelten**, mit den Änderungen aus A.3 und A.4. Kernpunkte:
  - Leitsatz KP §1: „Das FM-Feld ist der Voice-Editor der EssenceFM auf dem iPhone.“ Abweichen darf nur, was das iPhone erzwingt, oder ein Zusatz, der keine EssenceFM-Regel ändert (Liste Z).
  - Raster 6 × 6 mit freien Plätzen, Reihe 0 = Ausgang, Invarianten I1–I4 (KP §4.1; I5 entfällt, K2-42).
  - Kachel mit Nummer, Frequenz (≤ 4 Zeichen), zweiteiligem Pegelbalken und Feedback-Badge (KP §4.2).
  - Gesten R0–R9, R11, R12 (KP §4.5; R10 und R13 entfallen); Vorschau beim Ziehen zeigt nur das Ergebnis der Regel (Z1).
  - LCD-Zeilen und Hilfe (KP §4.6) mit einer zusätzlichen Hilfe-Zeile (K2-43).
  - Wertefeld: ohne Auswahl Reiter [Pegel] [Stimme] [⋯] / [Vorlagen ▾] [Zufall] [A│B]; mit Auswahl [Basis] [Amp] [M] / [Mod] [Tonh.] [⋯] (KP §4.7, Schieber nach K2-38).
  - Feedback als Wert am Empfänger mit Badge (KP §4.8); DX-/Klassik-Modus bleibt (KP §4.12); Zusätze **Z1, Z2, Z5–Z18** und neu **Z19** (☑ Wellen im Zufall, K2-59); Abweichung D1 (KP §4.13), neu **D2** (Feedback an jedem Operator; ersetzt Z3, K2-59), **D3** (Mipmaps) und **D4** (kein ☑ Filter ohne FM-Filter, K2-59). Z4 entfällt (K2-37) (Rev. 3).
  - Geometrie KP §5 für P1, L1 und M-PLATZ (ohne die Zeilen für 7–8 Operatoren).
  - Datenmodell `p.fmx` Format 2 (KP §6) mit `n` = 6; Test-API KP §7 ohne `setFmxOps`.
- **KD gilt nur** in §5.2 Nr. 1 (Ziel der Ablage = Operator, dessen Rasterzelle den Mittelpunkt des Geists enthält; leere Zelle = Leerraum; Zielwechsel mit `haptic('tick')`), **§6.2 nur mit der Tabelle (Formeln, Namen, Prüfmerkmale) und den Mipmaps** – die Sätze darunter zur Bedienung („Waagrecht ziehen blättert …“, „Blatt mit 12 Bildern (V4c)“, „Eigene … Wellen kommen mit V8a bzw. F6“) gelten nicht, es gilt KP §4.7 in der Fassung von K2-38 und V4e (Rev. 3) –, §6.4 (Worklet: Mipmap-Stufe je Stimme **und Operator in jedem Steuerblock** nach K2-40, Aufbau beim ersten Gebrauch; Phase; Feedback-Rechnung; Live-Pegel an der 30-Hz-Scope-Nachricht) und §6.5 (CPU-Messung). Alles andere in KD ist durch KP ersetzt, auch die Abnahme KD §8, die Test-API KD §10 und die Paket-Tabelle KD §9.1.

### A.3 Entscheidungen bei Unterschieden (K2-36, ersetzt K2-18)

Regel EN2-19: Handbuch-Fakt vor Auslegung; Xanders P1 „genau wie EssenceFM“ vor eigener Ergänzung; DX-Gleichheit vor Bequemlichkeit.

| # | Punkt | Handbuch (HK) | KD | KP | gilt | Grund |
|---|---|---|---|---|---|---|
| 1 | Operatorzahl | 6 (S. 2, 6) | genau 6 | 6, 7–8 zuschaltbar | **genau 6** (K2-37) | Handbuch; Xander: Bausteine „entsprechen den EssenceFM-Operatoren“; P1: 6 Kacheln à 36 px + 5 × 4 px Abstand = 236 px Feld + 6 px Lücke + 132 px Wertefeld = 374 px (KP §5.1; Rev. 3). Rückfrage E-K1 |
| 2 | Feedback | zwei Wege, Empfänger OP 1/OP 2, Quelle jeder OP; Badge, keine Linie (S. 13, 25, 28) | an jedem OP, `fb {src, amt}` | an jedem OP, `fbSrc`/`fbAmt`, Badge (Z3) | **an jedem OP, Daten und Badge nach KP** (Abweichung D2) | Nur so tragen FELD und DX-Seite dieselben Nummern (DX-Alg. 1: Feedback an OP 6; KP §4.12). Darstellung und Bedienung bleiben wie bei EssenceFM. Rückfrage F-3 |
| 3 | Linie antippen | Tippen ins Leere = Stimme; keine Linien-Geste (S. 19) | bleibt (Tiefe/Lösen) | entfällt (X12) | **entfällt** | Handbuch-Fakt; Lösen über ⋯ › Ziele und Zwei Finger (Z6, Z7) |
| 4 | Tiefe je Kante | Stärke = Pegel des Modulators (S. 12–13) | `edges[].amt` 0–1 | keine | **keine** | Handbuch-Fakt |
| 5 | Halten auf einer Kachel | Drücken = wählen (S. 18–19) | Halten 450 ms → Mod-Picker | R1 wählt sofort; Picker unter ⋯ (Z13) | **KP** | Handbuch-Fakt |
| 6 | Bewegen, Leerraum | löst die unteren Verbindungen; fällt (S. 19) | gleich | gleich (R6, R7) | gleich | Handbuch |
| 7 | Platz nach dem Verbinden, Mitwandern | nicht beschrieben | Reihen berechnet, Spalten stabil, Kacheln gleiten 150 ms | Zellen frei, R6 c/d mit Mitwandern und Abweisen | **KP** | freie Plätze und Lücken wie Bild S. 18–19; Rückfrage F-6 |
| 8 | Ziel-Erkennung beim Ziehen | – | Zelle unter dem Geist-Mittelpunkt, Haptik „tick“ | nicht genannt | **KD §5.2 Nr. 1** | ergänzt KP R4, kein Widerspruch |
| 9 | Zwei Finger in derselben Reihe | – | die zuerst berührte moduliert | nichts, LCD „gleiche Reihe …“ | **KP** | keine waagrechten Kanten (I2) |
| 10 | Wertefeld-Zustände | Stimme ohne Fokus, Operator mit Fokus; Reiter Base, Amp, Mod, Pitch; M und S (S. 18, 27) | ALLE OP + MAKRO / OP n mit BASIS · HÜLLK. · MOD · TONH. | Pegel · Stimme · ⋯ · Vorlagen · Zufall · A│B / Basis · Amp · M · Mod · Tonh. · ⋯ | **KP** | Reiter-Namen wie im Handbuch |
| 11 | Breite des Wertefelds P1 | 56 % (Bild S. 18) | 126 px | 132 px (x 242–373) | **132 px** | KP-Geometrie ist vollständig bemaßt und hält das 365-px-Budget aus A.4b |
| 12 | Schieber | waagrecht (S. 11) | waagrecht (Welle blättern) | Hochformat senkrecht, Querformat waagrecht | **waagrecht in allen Größen** (K2-38) | Handbuch-Fakt |
| 13 | Live-Pegel | in Echtzeit (S. 18), Form offen | Leuchten | zweiteiliger Balken (Z5) | **KP** | eine Anzeige statt zwei |
| 14 | Farben | Messwerte (A.1) | eigene Palette | Messwerte | **KP §4.3 mit #5B6170** für alle nicht gewählten Rahmen (K2-01) | Kontrast |
| 15 | Hüllkurven | Punkt-Form (S. 31–33) | DX-Art, Punkt-Form in §18 | DX-Form und Punkt-Form | **beide; Punkt-Form fest als V4f** | Xander P1 „genau wie EssenceFM“; A.4b bleibt die Grundlage der DX-Form (A.5) |
| 16 | Hüllkurven-Ansicht Hochformat | Algorithmus links, Hüllkurve rechts (Bild S. 29, 31) | Reiter HÜLLK. im Wertefeld (Breit-Modus) | Mini-Feld links, Hüllkurve rechts (EK-13) | **KP + „⤢ Hüllkurve groß“** (K2-44) | großer A.4b-Editor für Feinarbeit |
| 17 | „Feld groß ⤢“ | – | blendet Spielleiste und Tastatur aus (E-K2) | – | **entfällt** | KP passt in 365 px; Frage E-K2 entfällt |
| 18 | Wellen-Formen | nur Namen und Bilder von Sine/SSine (S. 61–62) | eigene Formeln, bandbegrenzt (Mipmap je Oktave) | eigene Formeln, ohne Bandbegrenzung | **KD-Formeln mit Mipmaps** (K2-40, Abweichung D3) | Aliasing-Warnung S. 14; Prüfmerkmale liegen in KD vor |
| 19 | Wellen bearbeiten | 48 editierbar (S. 2, 61) | mit V8a bzw. §18 | V4e *(P1)*: 1–11 als Kopie, 0 fest, 12–47 eigene | **V4e fest, nach V8a**; Welle 0 fest (D1) | eigene Wellen brauchen den bandbegrenzten Tabellen-Bau aus V8a |
| 20 | Linien-Animation | Schalter, Form nicht beschrieben (S. 67) | *(P1)* | Verbinden 200 ms + Dauerlauf | **nur Verbinden 200 ms** (K2-41) | Akku, Ruhe im Bild |
| 21 | Init | Tipp „Start with a single operator“ (S. 14) | FELD-Init: OP 1 an, OP 2–6 stumm | INIT FM = DX-Alg. 1 | **KP**; Tipp als Hilfe-Zeile (K2-43) | N7F-19 … N7F-21b bauen auf DX-Alg. 1 |
| 22 | Stimmen und Kanten | Hardware bis 300 Stimmen | 8 Stimmen fest, keine Kantengrenze (gemessen 1,19 × DX) | §9.1-Regeln, I5 ≤ 16 | **8 Stimmen, keine Kantengrenze**, CPU-Wächter N7F-10 (K2-42) | KD-Messung `cpu6.out` |
| 23 | Paketschnitt | – | V4a, V4b, V4c | V4a, V4b, V4c (Hüllkurven), V4d (Vorhersage), V4e *(P1)* | **V4a, V4b, V4f (= KP V4c), V4c (= KP V4d), V4e (fest)** (K2-39) | Namen aus Revision 1 bleiben stabil |
| 24 | Abnahme-IDs | – | N7F-01 … N7F-30 | N7F-01 … N7F-57 | **KP** | eindeutige IDs |
| 25 | Test-API | – | `fieldDrop`, `fieldTwo`, `fieldDoubleTap`, `fieldUi` … | `fmxGesture`, `fmxPreview`, `fmxView`, `fmxEnvAction` … | **KP §7** ohne `setFmxOps` | eine API |
| 26 | Mod-Ziele | – | `fmx.<A–H>` → `fmx.<1–6>`, dazu `fmx.edge.<von>-<nach>.amt` | `fmx.<1–8>.…`, keine Kanten-Pfade | **KP §6.6 für OP 1–6** | keine Tiefe je Kante |

### A.4 Korrekturen

| # | Stelle | Korrektur |
|---|---|---|
| **K2-01** (Rev. 2) | KP §4.3 Zeilen „nichts gewählt, andere Seite“ und „ein Operator gewählt“; N7F-16 | Alle nicht gewählten Rahmen sind **#5B6170** statt #363A4E. Gegen den Feld-Grund #121317 hat #363A4E nur 1,65 : 1, #5B6170 3,0 : 1 (gegen die Kachel #0A0A0A 1,76 bzw. 3,19 : 1; eigene Rechnung nach WCAG). Alles andere aus KP §4.3 bleibt: gewählte Kachel Füllung #0A6E5B, 2 px Rahmen #0ACA9F, Nummer weiß (6,2 : 1); Linien #0AFFAD, von einer stummen Quelle #3E435B; stumm #3E435B mit 40 % Deckkraft für Nummer und Frequenz; Feld-Grund #121317; OP-Farben 1–6 wie gemessen, OP 6 mit Halo und #8A90A8 für Marke und Live-Teil. N7F-16 liest sich mit #5B6170 statt #363A4E. |
| **K2-02** | `r7/kodamo-handbuch.md`, `r7/kodamo-oberflaeche.md` | Für Handbuch-Fakten gilt HK (Korrekturliste dort §10). Die Farben in `kodamo-oberflaeche.md` sind nicht aus dem Handbuch. Beide Dateien tragen oben den Vermerk **ÜBERHOLT**; vier falsche BELEGT-Stellen sind direkt berichtigt (am PDF V7.0 geprüft): Pitch EG Range „Tone, 5th, 1, 2, 4 and 8 octaves“ (S. 31), Operator-Reiter „Base, Amp, Mod and Pitch“ (S. 27), Zwei-Finger-Wortlaut „connect them together … additional connections“ (S. 19); Mixer-Operator und Fan-out stammen aus SysEx-Doku bzw. Forum, nicht aus dem Handbuch. Beide Dateien liegen weiter nicht am Bau-Ort (EN2-17). |
| **K2-03** | Nachtrag 1, A.5 (PAD-R1), A.8 (MOD-R1), EN-14/VL-R1 | V4 liegt **vor** V1d, V5d und VC2a. Diese Regeln gelten für V4 deshalb noch nicht; die späteren Pakete holen das FM-Feld nach: N2-1d-01, N2-5d-01, N2-C2a-01 (A.7). |
| **K2-04** | *ersetzt durch K2-39 (Rev. 2).* | – |
| **K2-18** | *aufgehoben durch K2-36 (Rev. 2): KP ist führend (EN2-19), die Entscheidungen je Unterschied stehen in A.3.* | – |
| **K2-29** (Rev. 2) | KP §4.2/§4.3 (Balken in allen Zuständen) | Das Handbuch beschreibt den Balken nur im Base-Reiter ohne Fokus. Dass er in allen Zuständen sichtbar ist (OP-Farbe bzw. weiß), ist eigene Festlegung und bleibt. |
| **K2-36** | KD gegen KP | Entscheidungstabelle A.3. |
| **K2-37** (Rev. 3) | KP EK-07, §4.5 R13, §4.7 Stimme Zeile 1, §4.9, §4.13 Z4, §5 (7–8-OP-Zeilen), §6.1 `n`, §7 `setFmxOps`, N7F-01, N7F-30; dazu EK-03, X6, X8, §4.5 Satz „Vorlagen“, §5.2 L1 „Pegel mit 7–8 OP“, §6.2 `n`, §7 `setFmx`, N7F-49 | **Genau 6 Operatoren.** `n` bleibt im Schema und ist immer 6 (`normFmx` setzt 6). Es entfallen: EK-07 (7–8 zuschaltbar), R13, die Stimme-Zeile „Operatoren [6│7│8]“, Z4, die Wertzeilen für 7–8 Operatoren (P1 76 + 35·i), `setFmxOps`, N7F-30. Vorlagen und Zufall setzen keine OP 7/8. Die Farben 7 und 8 bleiben unbenutzt. Mod-Ziele `op1…op6`, Pfade `fmx.<1–6>`. N7F-01: „200 Zufallsgraphen (6 Op, alle Kantenzahlen, alle Formen) …“. Mehr Operatoren gibt es später nur über Schichten (§18 Super-Synth). **Rest-Stellen (Rev. 3):** EK-03 und X8 „Nummern **1–6**“; X6 „Ersatz: alle 6 Operatoren sind immer da, aus = stumm (R3)“; §4.5 Satz „Vorlagen ▾“: der Satzteil „bei 7–8 Operatoren kommen OP 7/8 stumm …“ entfällt; §5.2 L1 „Pegel mit 7–8 OP: 3 Spalten à 165“ entfällt; §6.2 „`n` = 6“ statt „`n` ∈ {6, 7, 8}“; §7 `setFmx` „wirft bei Verstoß gegen I1–I4 oder bei einem **7.** Operator“; **N7F-49** lautet: „[DX-tauglich machen] an einem 6-Op-Graph mit Wellen ≠ 0, Punkt-Hüllkurven und zwei Feedback-Wegen (Empfänger 2 und 6): Liste nennt jede Abweichung mit Folge …; nach dem Anwenden Badge ✓; ein Undo.“ |
| **K2-38** (Rev. 3) | KP §4.7 „Schieber im Wertefeld“, §4.7 Basis Zeile 1 (Welle), N7F-26, N7F-27, N7F-28 | **Waagrecht in allen Größen** (Handbuch S. 11): rechts = mehr; Relativzug mit Pointer-Capture, 4 px Totzone, kein Sprung beim Aufsetzen; der Finger darf das Wertefeld verlassen. **Verstärkung = Balkenbreite ÷ Bereich** wie bei EssenceFM (ein Schieber deckt seinen ganzen Bereich auf seiner eigenen Breite ab, die Füllung folgt dem Finger; Bild S. 27, Handbuch S. 11): Der Zug verschiebt die **Füllkante** um genau die Fingerstrecke, sie bleibt unter dem Finger; bei Modulatoren läuft die Füllkante in der V0d-Anzeigekurve p = (OL/99)^(1/0,45), der Wert folgt aus ihr. P1: Balken ≈ 90 px (x 242–373 abzüglich Wertzone 30 px und Fahne 12 px) → `ol` im Mittel ≈ 0,9 px je Schritt, 0…127-Werte ≈ 0,7 px, `det`/`vs` (14 Schritte) ≈ 6,4 px, `fbAmt` (70 Schritte à 0,1) ≈ 1,3 px; L1 nach seiner Balkenbreite. FEIN = ×¼ (die Füllkante läuft ¼ der Fingerstrecke). Ein senkrechter Zug ≥ 12 px vor dem ersten waagrechten Schritt ist auf den **Schieber-Zeilen** kein Wertzug (nichts ändert sich, kein Undo); **ausgenommen** sind die Kurven-Griffe der Tasten-Skalierung (Mod, Zeilen 4–6: `ld`/`rd` senkrecht, `bp` waagrecht) und der Hüllkurven-Graph. Ziffernblock (Tipp auf die Wertzone) und Doppeltipp = Mitte bleiben. **Welle** (Basis Zeile 1) ist wie „Waveform“ bei EssenceFM (Bild S. 27) ein waagrechter Schieber: Relativzug blättert 0…11 (ab V4e 0…47), 8 px je Welle, Mini-Vorschau und Name folgen sofort; Tipp auf die Vorschau öffnet die Liste mit Vorschau; ‹ › bleiben im Querformat. **N7F-26** lautet für P1: „Zug 45 px nach rechts an Zeile 4 ab der Füllkante → Füllkante +45 px (±1), `ol` nach der Anzeigekurve; 0 → 99 in **einem** Zug vom linken Balkenende; 45 px nach links → Füllkante −45 px (±1); mit FEIN 40 px nach rechts → Füllkante +10 px (±1); Aufsetzen und 3 px Bewegung → unverändert; 30 px senkrecht ohne waagrechten Anteil → unverändert“; der Rest von N7F-26 bleibt. **N7F-27** ergänzt: „Zug 24 px nach rechts ab Welle 0 → Welle 3, ein Undo“. **N7F-28** ergänzt (Gegentest): „30 px senkrecht am `ld`-Griff → `ld` ändert sich, ein Undo“. |
| **K2-39** | KP §8 (Pakete), KD §9.1, K2-04 | Paketnamen und Zahlen: **V4a** (KP V4a) 3.8.0, +48 KB, 7,5–8,5 h (KP-Umfang + Mipmaps nach KD §6.2/§6.4, Dauer nach KD §9.1); **V4b** (KP V4b) 3.9.0, +95 KB, 9–10 h (KP-Umfang ohne 7–8-Operator-Teile, dazu ⤢ Hüllkurve groß und waagrechte Schieber; Dauer nach KD, weil R5–R7 mit Mitwandern und Abweisen viel Testarbeit brauchen); **V4f** (KP V4c) 3.10.0, +40 KB, 5–6 h; **V4c** (KP V4d) 3.11.0, +30 KB, 4–4,5 h – die Spec-Punkte heißen weiter **V4c-01 … V4c-07**; **V4e** (KP V4e) 4.43.0, fest, +28 KB, 4–5 h, nach V8a. Abhängigkeiten in A.6. |
| **K2-40** (Rev. 3) | KP §4.10 (Formen der Werkswellen), §4.13, N7F-03, N7F-42; KD §6.4 (Mipmap-Wahl) | Formen, Namen und Prüfmerkmale der Werkswellen 0–11 nach **KD §6.2** (0 Sinus, 1 Säge, 2 Säge weich, 3 Dreieck, 4 Rechteck, 5 Halbsinus, 6 Puls 25 %, 7 Oberton 2, 8 Oberton 3, 9 Sinus weich, 10 Sinus weich 2, 11 Rauschen; Reihenfolge wie die Werksliste im Handbuch-Bild S. 61), bandbegrenzt mit einer Mipmap-Stufe je Oktave, Gleichanteil frei, Spitze 1; **Wahl der Stufe (Rev. 3) je Stimme und Operator in jedem Steuerblock (16 Samples) aus der aktuellen Operatorfrequenz (mit Tonhöhen-Hüllkurve, `lfoFm` und Bend), mit Überblendung zwischen den beiden Nachbarstufen** (kein Sprung; ersetzt „beim Anschlag“ in KD §6.4), damit ein Tonhöhen-Sprung bis +8 Okt. (V4f) kein Aliasing zurückbringt. **Abweichung D3** (neu in KP §4.13): EssenceFM begrenzt nicht (Handbuch S. 14). Eigene und geänderte Wellen (V4e) bekommen ihre Mipmaps aus dem Tabellen-Bau von V8a. N7F-03 lautet: „Welle 0 bitgleich zum bisherigen Sinus-Pfad (≤ −120 dB); Wellen 1–11 erfüllen die Prüfmerkmale aus KD §6.2 (Teiltonpegel ±0,5 dB, Spitzenlage ±1 %); Welle 4 bei C7: gefaltete Energie ≤ −50 dB relativ zum Nutzsignal; Wellenwechsel bei gehaltener Note besteht M-KLICK.“ **N7F-42** ergänzt (V4f): „Welle 4, C4, Tonh. Punkt-Form +4 Okt.: gefaltete Energie am Gipfel ≤ −50 dB; die Stufenwechsel bestehen M-KLICK.“ |
| **K2-41** | KP §4.4 „Linien-Animation“, N7F-17 | Der dauernde Strich-Lauf entfällt. Der Schalter „Linien-Animation“ (Stimme, Zeile 6) steuert nur das Aufzeichnen einer neuen Linie in 200 ms beim Verbinden; Standard an, aus bei `prefers-reduced-motion`. N7F-17 prüft Anfang und Ende der Linien und die 200-ms-Animation an/aus. |
| **K2-42** (Rev. 3) | KP §4.1 I5, §4.6 LCD, §4.7 Stimme Zeile 4 und Zufall, §4.8 letzter Punkt, §4.9, §6.2 Reparatur, §7 `setFmx`, N7F-10, N7F-22, N7F-31, N7F-52 | I5 (≤ 16 Kanten + Feedback-Wege) entfällt: Bei 6 Operatoren gibt es höchstens 15 Kanten und 6 Feedback-Wege. **Stimmen fest 8** (KD §6.4); die §9.1-Regeln „7–8 Op → 6 Stimmen“ und „> 12 Kanten → 4 Stimmen“ entfallen. **Rest-Stellen (Rev. 3):** In KP §6.2 entfällt die Reparatur „mehr als 16 Kanten + Feedback-Wege → Kanten mit der höchsten Nummer entfernen“; LCD (§4.6) und Stimme Zeile 4 zeigen „Kanten 3“ ohne „/16“; Zufall, N7F-22 und N7F-31 lauten „I1–I4“; §4.8 letzter Punkt: „Jeder aktive Feedback-Weg zählt für den CPU-Wächter (N7F-10)“; §7 `setFmx` wirft bei Verstoß gegen I1–I4 oder bei einem 7. Operator (K2-37). **N7F-10 (V4a)** lautet: „Schlechtester Fall: 6 Op, 15 Kanten + 6 Feedback-Wege (davon ≥ 2 mit fremder Quelle), alle Wellen ≠ 0, alle Hüllkurven in **DX-Form**, 8 Stimmen: ≤ 12 % je Spur (Xeon). Liegt der Wert darüber, gilt ab dann ‚mehr als 12 Kanten → 6 Stimmen‘ mit Grund im Kopf (L9), und CHANGES nennt den Messwert. 6 Op in DX-Form mit 8 Stimmen ≤ Messwert vor V4a + 5 %.“ Den Fall mit Punkt-Form und Schleife misst **N2-4f-02** in V4f. **N7F-22 (b)** lautet (der Fall „kein Platz über Y“ ist mit 6 Operatoren nicht erreichbar, gerechnet: eine Zielreihe > 5 bräuchte mindestens 7 Operatoren): „INIT FM, Zwei Finger auf 5 und 2 → Kante 5→2; dann Kachel 4 in die leere Zelle (2, 0) → nichts ändert sich (5 käme in Reihe 1 neben 2), LCD ‚geht nicht: 5 → 2 zeigt dann nicht mehr nach unten‘, kein Undo-Schritt.“ N7F-52: „6 Op“ statt „8 Op“. |
| **K2-43** | KD §5.3 (FELD-Init), KP §4.6 | INIT FM ist **DX-Alg. 1** (KP; Grundlage von N7F-19 … N7F-21b). Der FELD-Init aus KD entfällt. Neue Hilfe-Zeile 7: „Tipp: mit einem Operator anfangen, die anderen per Doppeltipp stumm schalten.“ (Handbuch S. 14 sinngemäß; ohne Gerätenamen, N2-4b-02). |
| **K2-44** | KP EK-13, §4.7 (⋯ im Zustand Operator), §5.1 d; KD §4.6 | In den Seiten Amp und Tonh. enthält ⋯ zusätzlich **„⤢ Hüllkurve groß“**. Es öffnet den A.4b-Editor (`fmEnvEditor`, P1 365 px mit eigenem Kopf) für diesen Operator und diese Hüllkurve; [✕] führt zurück auf dieselbe FELD-Seite (Fokus und Reiter wie vorher). Beide Ansichten bearbeiten dieselben Daten (`fmx.ops[k].amp` bzw. `.pit`); ab V4f zeigt der große Editor auch die Punkt-Knöpfe aus KP §4.11. „⤢ Feld groß“ aus KD und die Frage E-K2 entfallen. Prüfung N2-4b-04. |
| **K2-45** | Nachtrag 1, A.4b Punkt 11 („was nach V4 wandert“); KD §9.2 Abschnitt „A.4b Punkt 11“ | Es gilt die Zuordnung aus KP §4.11 („A.4b Punkt 11 eingelöst“) mit den Paketnamen dieses Nachtrags: **Mehrpunkt-Hüllkurven mit Schleife → V4f** (statt §18); Pitch-EG je Operator, Anschlag ± (`vs`), Time/Key ± (`rs`), DX-LFO je Operator mit Key-Sync (`lfoAm`, `phm`) und ECO mit echter PM → V4a; Hold Time je Operator → Punkt-Form (flaches erstes Segment), kein eigener Parameter; Spektralformen und Hüllkurven als Mod-Quelle → §18. Der Abschnitt in KD §9.2 gilt nicht mehr. |
| **K2-55** (Rev. 3) | KP §4.11 „Ein Editor“, §5.1 und §5.2 Geometrie Amp/Tonh. („Halten 160 · Lücke 8 · Release 68“), N7F-47 | **Punkt-Form = eine durchgehende logarithmische Zeitachse** wie EssenceFM (Bild S. 29, 32; HK Bild S. 29: blaue senkrechte Linie durch den Sustain-Punkt). Der Sustain-Punkt trägt eine blaue senkrechte Linie (#0A6AFF, 1 px); es gibt **keine** Lücke „Loslassen“ und kein zweites Lineal. Die Teilung „Halten ┊ Release“ aus A.4b gilt nur für die **DX-Form**. Damit sind auch sus −1, [Frei] und eine Schleife nach dem Sustain eindeutig dargestellt. P1-Geometrie der Punkt-Form: Graph 236 × 117 px ohne Lücke (L1 entsprechend ohne Lücke). N7F-47 ergänzt: „Punkt-Form mit sus −1 und mit [Frei]: eine Achse, keine Lücke; mit Sustain: blaue Linie am Sustain-Punkt (±1 px); DX-Form unverändert mit Halten ┊ Release.“ |
| **K2-56** (Rev. 3) | KP §4.7 Tonh., §4.11 Knopfbelegung, §5.1, §5.2; N7F-43 | **Tonhöhen-Bereich bedienbar** (Handbuch S. 31: „Pitch EG Range“ sichtbar, wenn kein Punkt gewählt ist): Seite Tonh., nichts gewählt → Knopfzeile 2 = **[Bereich ▾] [Alle Mod.] [Kopieren] [Einfügen]**; [Alle Ausg.] liegt bei Tonh. unter ⋯. [Bereich ▾] öffnet die Liste DX │ Ton │ Quinte │ 1 │ 2 │ 4 │ 8 Okt. (ein Bereich außer DX wechselt nach A.5 Nr. 4 in die Punkt-Form). L1: [Bereich ▾] in Knopfzeile 3 neben [DX-Zeile ▾] [FEIN]. N7F-43 ergänzt: „[Bereich ▾] nur bei Tonh. und ohne gewählten Punkt sichtbar; Text passt in 56 bzw. 52 px.“ |
| **K2-57** (Rev. 3) | KP §4.11 „Punkt-Form, Verhalten“ (Exp), N7F-37 | Das Bild S. 29 zeigt im Exp-Modus steigende Segmente erst schnell, dann flach (Segment 2→3), fallende ebenso erst schnell, dann flach; Lin-Segmente sind gerade Linien (Bild S. 32 oben), obwohl die Achse logarithmisch ist (geprüft am Bild aus dem PDF, Review 2). Neu: **Exp:** fallende Segmente dB-linear (wie der msfa-Abfall), **steigende Segmente nach dem msfa-Anstieg** (schnell, zum Ziel hin langsamer; dieselbe Rechnung wie der A.4b-Angriff); **Lin:** amplitudenlinear. Der Graph zeichnet jedes Segment in **Segment-Koordinaten**: Lin als gerade Linie zwischen den Punkten, Exp als Annäherungskurve. N7F-37 ergänzt: „Exp steigend 0 → 99 über 100 ms: nach 50 ms ≥ 75 % des Endpegels (Amplitude); Lin-Segmente im Graph gerade (±1 px).“ |
| **K2-58** (Rev. 3) | KP §4.11 „Tonhöhen-Hüllkurve je Operator“; A.5 Nr. 2; N7F-42 | Das Handbuch vermerkt Einschränkungen nach Frequenzmodus ausdrücklich („only shown in Multiplicative mode“, S. 28), beim Pitch-Reiter nicht (S. 27, 30–31). Neu: Die DX-Regel „feste Frequenz ohne PEG“ gilt **nur für `pr 'dx'`**. In der Punkt-Form wirkt die Tonhöhen-Hüllkurve auch auf feste Operatoren (f · 2^(HT/12)), z. B. für Kick, Tom und Effekte (S. 31). N7F-42 lautet im Teil „fest“: „OP mit fester Frequenz und `pr 'dx'` unverändert (±0,02 HT); mit Bereich 1 Okt. und y 99 → +12 HT (±0,1).“ |
| **K2-59** (Rev. 3) | KP §4.7 Zufall, §4.13 Z3 und Tabelle D; A.1 Zeile Randomize | **Zufall wie EssenceFM** (Handbuch S. 20: Freq, Flt, VEG, PEG, Algo, Lvls; Bild S. 18 zusätzlich LFO): Das Blatt bekommt **☑ LFO** (würfelt die Stimmen-LFO-Werte des FM-Klangs: Rate, Verzögerung, Welle, AM-/FM-Tiefe; ein Undo). **☑ Filter** gibt es nur, wenn der FM-Klang ein Filter hat (ab VI3 „Filter nach FM“); bis dahin ist das die **Abweichung D4** (Grund: FM-Klänge haben vorher kein Filter; KP §4.13 bekommt die Zeile D4). **☑ Wellen** ist **Zusatz Z19**, Standard aus (Hinweis auf Aliasing, Handbuch S. 14). **Z3 entfällt** und ist durch **D2** ersetzt (Feedback an jedem Operator ändert eine EssenceFM-Regel): KP §4.13 bekommt die Zeile D2 mit Grund A.3 Nr. 2 und Frage F-3. |
| **K2-60** (Rev. 3) | KP §4.11 „Wechsel in die Punkt-Form“; A.5 Nr. 4; N7F-45 | Die DX-Form zeigt [✗] (Punkt löschen) und am Sustain-Punkt [Skip] (Mockup §5.1 d), kann beides aber nicht. Neu: **[✗] und [Skip] wechseln ebenfalls in die Punkt-Form**; ein Undo stellt die DX-Form deep-equal her. N7F-45 gilt auch für diese beiden Aktionen. |
| **K2-61** (Rev. 3) | KP R1, N7F-18, EK-13 | R1 ergänzt: „Aus dem Zustand Stimme öffnet Aufsetzen die Seite Basis. **Zwischen Operatoren bleibt die aktuelle Seite** (Basis/Amp/Mod/Tonh.) erhalten“ – so lassen sich Hüllkurven im Mini-Feld (EK-13) nacheinander vergleichen. N7F-18 ergänzt: „OP 4 auf Amp, Tipp auf OP 2 im Mini-Feld → `page` 'amp', `focus` 2.“ |
| **K2-62** (Rev. 3) | Spec §15.1 (Zeile FM „8 Op, 16 Kanten“), §15.2 Stufe 2 („FM-Feld 7–8 Op: Poly ≤ 4“) | Mit genau 6 Operatoren und 8 Stimmen (K2-37, K2-42) läuft die alte Zeile ins Leere. §15.1 Zeile FM: „6 Op, 15 Kanten + 6 Feedback-Wege, 8 Stimmen ≤ 12 % je Spur (N7F-10, N2-4f-02)“. §15.2 Stufe 2 neu: „FM-Feld mit > 12 Kanten oder Punkt-Form mit Schleife: Poly ≤ 4 (nur Laufzeit, I-08); Morph-Interpolation je 2 Blöcke“. |

### A.5 Abgleich mit Nachtrag 1, A.4b (Hüllkurven aus V0d)

1. **A.4b bleibt die Grundlage.** V0d baut die DX-Hüllkurven msfa-genau mit Haltephase, die PEG mit ±4 Oktaven und den Editor `fmEnvEditor` (logarithmische Zeitachse „Halten ┊ Release“, ms und DX-Rate, Klick-Grenze, FEIN, Vorlagen Snap/Pluck/Pad/Orgel, Auf alle …). Daran ändert Teil A nichts.
2. **V4a übernimmt sie als DX-Form** `{f:'dx', r[4], l[4]}` je Operator (KP §4.11, §6.1); `fmxFromFm6` überträgt `fm6.peg` in jeden Verhältnis-Operator (`pr 'dx'`). Feste Operatoren haben in der DX-Form keine Tonhöhen-Hüllkurve (A.4b-Regel); in der Punkt-Form wirkt sie auch auf sie (K2-58, Rev. 3).
3. **FELD › Amp und A.4b-OP-Seite rechnen gleich.** V0d-2-06 … V0d-2-12 bestehen auch aus FELD › Amp (N7F-44); Sounds ohne Punkt-Form klingen nach V4f bitgleich wie nach V4b (N7F-48).
4. **Die Punkt-Form (V4f) ist eine zweite Form.** Sie entsteht nur durch eine Aktion, die DX nicht kann ([+], [✗], [Skip], Sustain auf einem anderen Punkt, Loop, Lin, Frei, Skala, ein Tonhöhen-Bereich außer DX; [✗] und [Skip] nach K2-60, Rev. 3). Die Punkte übernehmen die angezeigten Zeiten und Pegel; der Klang ändert sich dabei ≤ 1 dB (N7F-45). Ein Undo stellt die DX-Form deep-equal her; der Rückweg sonst nur über [DX-tauglich machen] (V4c, mit angezeigter Abweichung).
5. **Ein Editor:** der A.4b-Editor, erweitert um die EssenceFM-Knöpfe (KP §4.11); im Hochformat als Ansicht EK-13 neben dem Mini-Feld und groß über ⤢ (K2-44). **Punkt-Form (Rev. 3, K2-55):** eine durchgehende logarithmische Zeitachse wie EssenceFM (Bild S. 29, 32); der Sustain-Punkt hat eine blaue senkrechte Linie, es gibt keine Lücke „Loslassen“ und kein zweites Lineal. Die Teilung Halten ┊ Release gilt nur für die DX-Form. Exp-Segmente nach K2-57.
6. **Xanders Befund aus Runde 9** (die Modulator-Hüllkurve schneidet den Klang ab, Raster-Gefühl) behebt V0d. V4f darf das nicht verschlechtern: N2-4f-01.
7. **A.4b Punkt 11** ist durch K2-45 geändert.

### A.6 Pakete, Versionen, Budgets, Abnahme

| Paket | Inhalt | Version | Budget | Dauer | braucht | Abnahme |
|---|---|---|---|---|---|---|
| **V4a** FM-Graph-Engine | KP V4a: Graph-Renderer, Format 2 (`n` = 6), `normFmx` mit Reparatur, `fmxFromFm6`, `dxLayout`, `dxMatch`, Werkswellen 0–11 (KD-Formeln, Mipmaps), Phase + Modus, Feedback je Operator mit Quelle, stumm, `vs` ±, `lfoAm`/`lfoFm`, DX-LFO-Import (`ams`, `pms`, `osync`), DX-Form-Hüllkurven je Operator inkl. `pit`, Live-Pegel, Stimmen-Überblendung 30 ms, nativer Rückfall, Mod-Ziele `op1…op6` | 3.8.0 | +48 KB | 7,5–8,5 h | V0d | N7F-01 … N7F-12 (N7F-10 in DX-Form, K2-42) |
| **V4b** FELD und Wertefeld | KP V4b ohne 7–8-Operator-Teile: Raster, Kachel, Farben, Linien, Boden, Gesten R0–R9, R11, R12 mit Vorschau, LCD, Hilfe, Wertefeld (Pegel, Stimme, Vorlagen, Zufall, A│B, Basis, Mod, M, ⋯ mit Solo, Ziele, Kopieren, Modulieren mit …, ⤢ Hüllkurve groß), waagrechter Relativzug und Ziffernblock, Badge, Nummern angleichen; Amp/Tonh. bis V4f mit der DX-Form (EK-13) | 3.9.0 | +95 KB | 9–10 h | V4a | N7F-13 … N7F-36 (mit 21b, 27b; ohne N7F-30), N2-4b-01 … N2-4b-04 |
| **V4f** EssenceFM-Hüllkurven | KP §4.11: Punkt-Form in Worklet und nativem Pfad, Tonhöhen-Bereiche, Editor-Knöpfe inkl. [Skip] und [Loop weg], Pinch, Fußzeile, Umwandlung, Warnchips, Punkt-Knöpfe in EK-13 und im großen Editor | 3.10.0 | +40 KB | 5–6 h | V4b, V0d | N7F-37 … N7F-48, N2-4f-01, N2-4f-02 |
| **V4c** Vorhersage, Raster, DX-Brücke | KP V4d: Vorhersage im LCD während des Ziehens, Raster aus der Basis-Zeile „Verhältnis“, [DX-tauglich machen] mit Gründen (auch Punkt-Form → DX), .syx-Export (ZIP seit V0a, N0a-03), Import ins FELD | 3.11.0 | +30 KB | 4–4,5 h | V4b, V4f, V0a | V4c-01 … V4c-07 (Spec, in der Lesart von KP §9 „V4d“), N7F-49 … N7F-52, N2-4c-01 |
| **V4e** Wellen zeichnen | KP V4e: Wellen-Werkstatt (Zeichnen, Auswahl, Werkzeuge), Vorrat 12–47, Werkswellen 1–11 als Kopie, Mitnahme in die Bibliothek; Mipmaps aus dem V8a-Tabellen-Bau | 4.43.0 (Gr. 13) | +28 KB | 4–5 h | V4b, V8a | N7F-53 … N7F-57 |

- **Gruppe 3** (V4a, V4b, V4f, V4c): ≈ 25,5–29 h, +213 KB. V4e steht in Gruppe 13.
- **Geänderte N7F-Punkte (Revision 2 und 3), sonst gilt KP §9 wörtlich:** N7F-01 (6 Op, K2-37), N7F-03 (K2-40), N7F-10 (DX-Form, K2-42), N7F-12 (`op1…op6`), N7F-13 (ohne 7–8-Operator-Zeilen), N7F-16 (#5B6170, 6 Operatoren, K2-01), N7F-17 (K2-41), N7F-18 (K2-61), N7F-22 (b) und „I1–I4“ (K2-42), N7F-26, N7F-27, N7F-28 (K2-38), N7F-30 entfällt (K2-37), N7F-31 (I1–I4, K2-42), N7F-37 (K2-57), N7F-42 (K2-40, K2-58), N7F-43 (K2-56), N7F-45 (K2-60), N7F-47 (K2-55), N7F-49 (6-Op-Graph, K2-37), N7F-52 (6 Op).
- **Spec und Nachtrag 1:** Es gilt die Änderungsliste KP §10 mit den Paketnamen aus K2-39 und mit „6 Operatoren“ statt „1–8“ (§9.1, §14, **§15.1, §15.2** (K2-62, Rev. 3), A.8, C.1, C.3, C.4).

### A.7 Zusatz-Abnahme

- [ ] **N2-4b-01 Farben (Rev. 2):** Pixelproben in P1 und L1: gewählte Kachel innen `#0A6E5B` ±8, Rahmen `#0ACA9F` ±8; nicht gewählte Rahmen im Zustand „ein Operator gewählt“ `#5B6170` ±8; eine Linie zwischen zwei klingenden Operatoren `#0AFFAD` ±8; Linie von einem stummen Operator `#3E435B` ±8. Linien-Proben in der Mitte einer Kante, DPR 2, Mittelwert über 3 Pixel quer zur Linie.
- [ ] **N2-4b-02 Kein Gerätename in der Bedienung:** LCD, Hilfe und Beschriftungen enthalten weder „Kodamo“ noch „EssenceFM“ (Ganzwort-Prüfung); das Vorbild steht nur im ⓘ mit dem Pflichtsatz „Marken gehören ihren Inhabern, keine Verbindung.“
- [ ] **N2-4b-03 Handbuch-Ablauf am Stück (Rev. 2; CDP-Touch, P1 und L1, ein Skript, jeder Schritt ab INIT FM per Undo):** (1) Kachel 3 auf Kachel 1 → LCD vorher „3 → 1 verbinden“, Ergebnis wie N7F-19; (2) Kachel 4 auf Kachel 3 → „4 ↔ 3 tauschen“, wie N7F-20; (3) Kachel 5 in die leere Zelle (2, 3) → „5 fällt → Ausgang“, Badge „DX 5 ✓“, wie N7F-21; (4) Doppeltipp auf OP 1 → stumm, Rahmen `#3E435B`; zweiter Doppeltipp → wieder an; (5) Aufsetzen auf OP 4 → Wertefeld „OP 4“ schon vor dem Loslassen (N7F-18); (6) Tipp ins Leere → Pegel-Seite; (7) Pegel-Seite: Zeile 2 um 20 px nach rechts → Füllkante +20 px (±1), `ol` nach der Anzeigekurve (K2-38, Rev. 3). Jeder ändernde Schritt ist **ein** Undo; Bildschirmfotos je Schritt in CHANGES.
- [ ] **N2-4b-04 Große Hüllkurve (K2-44):** P1, OP 4 gewählt, Seite Amp → ⋯ › „⤢ Hüllkurve groß“ → A.4b-Editor in voller Höhe für OP 4 (`fmEnvView()` nennt OP 4 und `amp`); einen Punkt ziehen → `getFmx` zeigt die Änderung; [✕] → FELD, Seite Amp, Fokus OP 4, Mini-Feld sichtbar; je Zug ein Undo; M-PLATZ in P1–P3, L1.
- [ ] **N2-4f-01 A.4b bleibt Grundlage:** Nach V4f bestehen V0d-2-01 … V0d-2-20 unverändert (N7F-48), auch für einen Klang, der zwischendurch per [Lin] in die Punkt-Form und per Undo zurück in die DX-Form gewechselt ist (deep-equal, bitgleich gerendert). Der FM-Bass-Prüfklang aus A.4b mit kurzer Modulator-Hüllkurve klingt in der Punkt-Form mit denselben Zeiten ≤ 1 dB neben der DX-Form (M-PEGEL in 20-ms-Fenstern).
- [ ] **N2-4f-02 CPU mit Punkt-Form (Rev. 3, K2-42):** Derselbe schlechteste Fall wie N7F-10 (6 Op, 15 Kanten + 6 Feedback-Wege, alle Wellen ≠ 0, 8 Stimmen), aber alle Hüllkurven in **Punkt-Form mit Schleife** an allen 6 Operatoren und Tonhöhen-Hk. mit Bereich 8 Okt.: ≤ 12 % je Spur (Xeon). Liegt der Wert darüber, gilt die Stimmenregel aus K2-42 („mehr als 12 Kanten → 6 Stimmen“) bzw. der Begrenzer §15.2 Stufe 2 (K2-62); CHANGES nennt den Messwert.
- [ ] **N2-4c-01 Zwischenstand (EN2-15):** Nach V4c geht der Stand an die Artifact-Adresse und auf die Pages-Seite. iPhone-Prüfpunkte für Xander (nach KP §8): (1) FM-Pluck öffnen → FELD: unten die Ausgänge, darüber die Modulatoren, rechts die Pegel-Seite in denselben Farben; (2) einen Modulator auf einen Ausgang ziehen → verbunden; nochmal auf denselben → Plätze getauscht; ins Leere → fällt nach unten; (3) Doppeltipp → stumm; (4) Operator antippen → rechts Basis/Amp/Mod/Tonh.; Amp → Punkte ziehen, [Sustain] mit [Skip], [Loop A]/[Loop B], [Loop weg]; das Feld bleibt links sichtbar; (5) Querformat: Feld und Hüllkurve nebeneinander; (6) Pegel-Seite: waagrecht ziehen ändert den Wert ohne Sprung, Tipp auf die Zahl öffnet den Ziffernblock; (7) einen FM-Bass mit kurzer Modulator-Hüllkurve bauen und tief spielen.
- [ ] **N2-1d-01 (zu V1d, PAD-R1):** Ein Synth-Pad mit FM-Klang aus dem FELD (`p.fmx`, 6 Operatoren, 2 fremde Feedback-Quellen) spielt am Pad gleich wie auf der Spur (RMS-Differenz ≤ −50 dB, offline).
- [ ] **N2-5d-01 (Rev. 2; zu V5d, MOD-R1):** Mod-Ziele sind die Pfade aus KP §6.6 für OP 1–6: `fmx.<1–6>.<ol|ph|fine|det|fbAmt|lfoAm|lfoFm|bp|ld|rd>`, Hüllkurven `fmx.<k>.amp.<r1…r4|l1…l4>` (DX-Form) bzw. `fmx.<k>.amp.<t1…t5|y0…y5>` (Punkt-Form), ebenso `fmx.<k>.pit.…`, dazu `fmx.<k>.wave` (gestuft). Kanten haben keinen Pfad. Abdeckungs-Skript V5d-01 mit 100 %.
- [ ] **N2-C2a-01 (Rev. 2; zu VC2a, VL-R1):** Jede ändernde `fmxGesture` (`drop`, `two`, `dtap`), jeder Wertefeld-Zug, jede `fmxEnvAction`, Vorlage und Zufall erscheint als Verlaufs-Ereignis; nach dem V4-Test-Skript ergibt `historyCheck()` true.

---

## Teil B — FANG TEIL und Song-Ablauf (ändert V0c, V2a, V2c–V2f, V3a)

### B.1 Xanders Wortlaut → Regel (verbindlich)

Die Regeln sind eigener Entwurf aus `r7/song-delta.md`; die Vorbilder anderer Programme stehen dort in Teil 15 (mit URL und Status) und in B.2.

| Nr | Xander | Regel (Kurzfassung) | Delta | Paket | Abnahme |
|---|---|---|---|---|---|
| 1 | F1/F2: FANG fängt die Transposition **und alle Clip-Zustände** (Clips aus verschiedenen Szenen, zwischendurch aus und wieder an) | FANG TEIL fängt **je Takt**: Träger (auch ORIGINAL, `tg:null`), welcher Clip aus welcher Szene läuft, Clip aus/an, Phase laufender Clips (`ph`). Daten `Part.lanes`. | 4.1, 12.1 | V2c (`tg:null`), V2d | N7S-08, N7S-11 … N7S-13, N7S-25 |
| 2 | F3: Schließen am **letzten logischen Taktende**, auch wenn schon in den nächsten Takt gespielt | **Taktstrich-Regel N7-R1:** zuerst entscheidet die Struktur (Periode, sonst 1/2/4/8/16 Takte); nur bei Gleichstand die Zeit: weniger als 50 % des neuen Takts gespielt → Ende am vorigen Taktstrich. Die Klammer friert beim Tipp ein. | 4.2, 4.3 | V2d | N7S-14 … N7S-16 |
| 3 | F4: danach als Song-Teil benennen | N7-R2: Vorschlag Strophe → Refrain → …; Namen Intro · Strophe · Pre · Refrain · Bridge · Break · Outro; Freitext ≤ 12 Zeichen; Teil-Taste ≤ 8 Zeichen (Kurzform) | 4.4, 4.5 | V2d | N7S-17 |
| 4 | S4, S9b: **keine zusätzliche Zeile**, kein Teil-Block, keine Überschrift, keine Layout-Verschiebung | Song-Ansicht = Taktleiste, je Spur eine Zeile, AKKORDE, MELODIE – sonst nichts. Keine TEIL-Zeile, kein ⊙, kein „Spuren ▸“, keine Zielzeile, keine Teil-Leiste im Hochformat. Canvas wie V0a ±2 px. Reichen 26 px je Zeile nicht, blättert die Spurbank. | EN7-02, 6.5 (N7-R13) | V0c, V2e | N7S-01, N7S-02, N7S-33, N7S-36 |
| 5 | S4: **Name des Teils in der gelben Markierung** der Taktleiste, davor/dahinter/dazwischen die Taktnummern | Teil-Marke = Band in Amber `#ffb22e` über den Takten des Teils, mit dem Namen statt der Nummern; 1-Takt-Marke zeigt die Kurzform. Tipp auf die Marke → weißer Rand und Marken-Blatt (×n, verschieben, kopieren, ersetzen, löschen, Name entfernen, auf alle übertragen) | N7-R7, 6.1–6.3 | V2e | N7S-34, N7S-35 |
| 6 | S1, S9a: Teil **halten und auf das Feld SONG ziehen**, Song-Seite öffnet sich, am Taktstrich ablegen, Teil entfaltet sich in seine Clips | Teil-Taste 450 ms halten → Geist mit Fortschrittsring; Finger auf „SONG ⇄“ (Feld oben links) → Song-Ansicht ≤ 1 Bild später offen (Federtaste), sonst **600 ms nach dem Anheben von selbst, auch ohne Bewegung** (S9, K2-35); Loslassen ohne Bewegung **vor** dem Öffnen → Teil-Blatt (L4); nach dem Öffnen zählt ein Ablegen erst nach ≥ 12 px Bewegung; Einfüge-Strich rastet am nächsten Taktstrich; Rand-Rollen 2 Takte/s, nach 1 s 6 Takte/s; Loslassen auf Transport oder Etiketten = Abbruch. Entfalten ≤ 300 ms, ohne Layout-Verschiebung. Ablauf vollständig in B.5. | N7-R3, N7-R4, N7-R6 | V2d (Daten), V2e′ (Gesten) | N7S-19, N7S-41 … N7S-45, N2-2e′-03 |
| 7 | S3: liegt schon etwas → „Takt 3–4 komplett **ersetzen**“ oder „dazwischen **einfügen**“ (Rest rutscht nach hinten) | Rückfrage nur, wenn ab der Ablagestelle Inhalt liegt. „Ersetzen“ ersetzt komplett (Clips, Akkorde, Melodie, eigene Clips in diesen Takten). Ablegen am oder hinter dem Ende hängt ohne Rückfrage an. | EN7-06, N7-R4, N7-R5 | V2d, V2e, V2e′ | N7S-19 … N7S-22, N7S-42 |
| 8 | S5: ab Takt n aufnehmen (**Punch**) → überschreiben oder dazwischen aufnehmen; Bereich markieren → **ersetzen** oder **Overdub** | Tipp auf Takt n wählt (gelb), ● öffnet das **Start-Blatt**: „ab Takt n überschreiben“ │ „ab Takt n einfügen“. Mit Bereich: „im Bereich ersetzen“ │ „Overdub“. Bei 1 gewähltem Takt (a = b) zeigt das Blatt beides: [Ab Takt n: Überschreiben │ Einfügen] und [Nur Takt n: Ersetzen │ Overdub] (K2-27). Ziele CLIPS · AKKORDE · NOTEN. **Überschreiben bei NOTEN ersetzt auf der Ziel-Spur alle Takte von n bis zum Ende E, auch leer gelassene** (K2-21). Ende per ● nach N7-R1. Szenen bleiben unberührt (EN7-04). | N7-R8 (7.1–7.4) | V0c (Start-Blatt), V2d′ (vollständig) | N7S-01, N7S-27 … N7S-31, N2-2d′-01 |
| 9 | S6a: **Akkord-Zeile bearbeiten**: hineintippen, anderen Akkord eintragen | Tipp auf einen Akkord-Chip → Akkord-Auswahl mit Texteingabe („Dm7“), Eintrag am selben Schlag. In einer Marke gilt die Änderung nur an dieser Stelle; [Für alle „Strophe“] setzt sie überall. | N7-R10 | V0c (Song-Träger), V2e (Marken) | N7S-03, N7S-38 |
| 10 | S6b: Akkorde **quantisierbar** | [Quantisieren] mit Raster Takt │ ½ Takt │ Schlag. Jeder Akkord rückt auf den nächsten Rasterpunkt; landen zwei auf demselben Punkt, gewinnt der zuletzt gespielte. Wirkt auf die Auswahl, sonst auf alles. Ein Undo, Toast mit den Zahlen. | N7-R11 | V0c (Song-Träger), V2c (Akkord-Zeilen von Szene/Teil) | N7S-04, N7S-05, N7S-09 |
| 11 | S7a: Umschalten zwischen den kleinen Vierecken und **gläsernen Clips mit Noten** | Umschalter in der Transportzeile: ▦ Kästchen (Standard) │ ◧ Glas (Kacheln wie im Clip-Launcher, durchscheinende Spurfarbe, Mini-Noten ≤ 160). Gleiche Zeilenhöhe; Umschalten ändert keine Daten. | N7-R12 | V2e′ | N7S-46 |
| 12 | S7b: Clip **halten** → aus der Schatten-/Referenz-Kopie wird ein echter Clip | Halten auf eine Verweis-Zelle öffnet beim Loslassen (ohne Bewegung) das **Zell-Blatt** [Eigener Clip (dieser Durchlauf)] [Ganzer Block] [Abbrechen] (L4-Muster, K2-24); erst der Tipp macht den Durchlauf zum **eigenen Clip** (Kopie, ein Undo `own`), Toast [Bearbeiten] [Rückgängig]; [Zurück zum Szenen-Clip] stellt den Verweis her. Ein Tipp wechselt weiter den Clip (WP6). | EN7-07, N7-R9 | V2d′ (Daten), V2e′ (Gesten) | N7S-32, N7S-47, N7S-48 |
| 13 | S8: **Punch-in live** im Song, Noten an dieser Stelle ändern, ohne die Szenen anzutasten | Ziel NOTEN: gespielte Noten landen in eigenen Clips an dieser Stelle; `S.tracks[].clips` bleiben deep-equal. Overdub = alt + neu hörbar; Ersetzen schaltet die alten Noten während der Aufnahme stumm. | N7-R8, EN7-04 | V2d′ | N7S-29, N7S-30 |
| 14 | F: FANG auch, wenn nur Clips wechseln | Der FANG-Platz heißt „FANG TEIL“, wenn 8 s keine Note kam, aber seit dem letzten Grenzpunkt Clip- oder Szenenwechsel geschahen. | EN7-09 | V2d | N7S-18 |
| 15 | – (Folge aus S5) | Tipp auf die Taktleiste **wählt** (gelb) und springt nicht; ▶ startet an der Positionsmarke | N7-R7 | V0c | N7S-06 |
| 16 | A: Audio quantisierbar | Teil C.5 | – | VS5a, VS5b | N7V-26 … N7V-30, N7S-51 |
| 17 | – (Folge aus EN2-04: Kette entfällt) | Teil-Tipp bei laufendem Song (ohne Aufnahme): springt am nächsten Taktstrich zur nächsten Marke dieses Teils; gibt es keine, übernimmt die Hand (orange [↩ SONG], E3-10). Ersetzt die Ketten-Regel aus Spec §4.4/V2e-01 (K2-28). | – | V2d | N7S-25b |

### B.2 Übernahme aus `r7/song-delta.md` (verbindlich, Kurzfassung)

- **EN7-01 … EN7-09**, Regeln **N7-R1 … N7-R13**, Datenmodell 12.1 (`Part.lanes`, `song.marks`, `song.own`, `ph`, `re`; Format 4), Test-API 12.2 (ersetzt `chain`, `setChain`, `chainInsert`, `chainMove`, `chainDelete`, `flatten`, `splitRecording`), Undo-Gruppen 12.3 (TA8-Art `chain` entfällt, neu `own`), Abnahme **N7S-01 … N7S-50**, ersetzte Spec- und Nachtrag-Punkte 14.3.
- **Was wegfällt:** „Teil ändern = alle Stellen ändern sich“ wird die ausdrückliche Aktion [Auf alle übertragen] bzw. ⟳ beim FANG TEIL. [In Teile zerlegen] (E3-31) entfällt. WP6-Songs sind ohne Umbau bearbeitbar.
- **Vorbilder** (Quelle sagt, `song-delta.md` Teil 15): Apple HIG beschreibt „spring loading“ beim Ziehen (BELEGT, direkt gelesen: https://developer.apple.com/design/human-interface-guidelines/drag-and-drop); Logic-Arrangement-Marker verschieben und kopieren alle Regionen eines Abschnitts (BELEGT, SE: https://support.apple.com/en-bh/guide/logicpro/lgcpf7c0c09c/mac); Cubase/Nuendo kennen Shared Copies und „Convert to Real Copy“ (BELEGT, SE: https://archive.steinberg.help/nuendo/v8/en/cubase_nuendo/topics/parts_events/parts_creating_shared_copies_c.html) sowie MIDI-Aufnahmemodi New Parts/Merge/Replace (BELEGT, SE: https://steinberg.help/nuendo/v12/en/cubase_nuendo/topics/recording/recording_midi_record_modes_r.html); Loopy Pro beendet eine Aufnahme ohne Auto-Count-Out am **nächsten** Vielfachen (BELEGT, SE: https://wiki.loopypro.com/Working_with_Record_Count-In/Out_and_Quantization). Ein Rückwärts-Fenster wie N7-R1 als Standard eines Loopers ist **UNBELEGT** (nicht gefunden) – N7-R1 ist eigener Entwurf.

### B.3 Korrekturen

| # | Stelle | Korrektur |
|---|---|---|
| **K2-05** | `song-delta.md` 14.2 (V0c-Hinweis) | V0c ist beim Erscheinen dieses Nachtrags **nicht begonnen** (V0b im Bau). Daher gilt EN2-05: N7S-01 … N7S-07 komplett in V0c. Fall B (V0c läuft schon): N7S-01, -02, -06 in V0c; N7S-03, -04, -05, -07 als Paket **V0c-2** direkt danach (vor V0d, +1–1,5 h, Version 3.3.1). Fall C (V0c schon abgenommen): V0c-2 mit N7S-01 … N7S-07 vor V0d. P4 bleibt so in Gruppe 1. |
| **K2-06** (Rev. 2) | `song-delta.md` 14.1 Versionen, Gruppe V2-2 | V2e′ = **4.8.0** (statt 4.7.1), V2f = 4.9.0. V7a verlässt die Song-Gruppe und steht in Gruppe 6 nach VL, VS1 und VS2, vor V3 und V6a (E3-32; Teil E.2). |
| **K2-07** | `song-delta.md` §10, §14.1 Zeile VS4, N7S-51 | Audio-Quantisierung ist **VS5a/VS5b** (nicht VS4; VS4 = Säubern). N7S-51 gehört zu VS5a. Regelwerk C.5. In §10 heißt es richtig: gesungene Melodie = VS2, Beatbox = VS6 (`stimme.md` §12). |
| **K2-21** | `song-delta.md` 7.2, Spalte „Überschreiben ab n“, beide Zeilen NOTEN; N7S-31 | Xander S5: „alles ab Takt 3 überschreiben“. Neu: **Auf der Ziel-Spur werden alle Takte von n bis zum Ende E ersetzt, auch Takte ohne neue Note**; ab n ist die Ziel-Spur während der Aufnahme stumm (wie „Bereich: Ersetzen“). Für CLIPS und AKKORDE gilt 7.2 unverändert („Spuren ohne Ereignis spielen weiter“). Nach E spielt der alte Inhalt weiter. N7S-31 letzter Satz lautet neu: „Überschreiben ab n ersetzt alle Takte n … E-1 der MELODIE-Spur, auch leere.“ Neuer Punkt **N2-2d′-01** (B.5). |
| **K2-22** (Rev. 2) | Kette-Reste: Spec V2f-01, V3b-11; Nachtrag 1 VC2a (Undo-Arten), VC2b (Gewichtung, „Szene bzw. Kette“), VC2c (Bühne „Kettenblöcke“), VC3 („Synchronisiert werden: … Kette“) | V2f-01 → „Test-Song mit Marken Teil 1 (Am F C G) und Teil 2 (F G Am Am), Bass betont A → ‚a-Moll‘, Sicherheit ≥ 60 %; Anzeige im Song-Kopf und im Marken-Blatt (N7S-49)“. V3b-11 → „MIDI-Export, `songTick` und eigene Clips nutzen die aktive Variante“. VC2a-Arten: `chain` gestrichen, `own` aufgenommen. VC2b: „Struktur-Ereignisse (Clip, Teil, Marke, Song)“, „was zuletzt lief (Szene bzw. Song)“. VC2c: „Matrix bzw. Song-Taktleiste mit Marken“. VC3: „Song-Position (Takt) und Änderungen an `song.marks`/`song.own` als Ereignis ‚Song geändert‘ (Spätkommer über `live/stand`)“; dasselbe gilt für VC3b (G.7). |
| **K2-23** | `song-delta.md` 5.1 Schritt 3 (S9); N7S-10, N7S-41 | *Aufgehoben durch K2-35 (Rev. 2).* Revision 1 ließ den Selbstöffner erst nach einer Bewegung ≥ 8 px laufen; das widersprach Xanders S9-Wortlaut („gedrückt halten → die Song-Seite öffnet sich automatisch“). |
| **K2-24** | `song-delta.md` 9.2 (N7-R9), N7S-47, V2e′ Umfang 5 | Halten auf eine Verweis-Zelle folgt dem L4-Muster: Loslassen ohne Bewegung öffnet das **Zell-Blatt** [Eigener Clip (dieser Durchlauf)] [Ganzer Block] [Abbrechen]; erst der Tipp ändert Daten (Undo `own`). Bewegung > 8 px = Rollen, nie ein eigener Clip. N7S-47 neu: „Halten → Zell-Blatt → [Eigener Clip] bzw. [Ganzer Block]“; die Ergebnisse (a), (b) und [Ganzer Block] bleiben. L4 und GEST bleiben ohne Ausnahme. |
| **K2-25** | `song-delta.md` 6.3 und Mockup P-7 (Marken-Blatt), Bereich-Leiste, N7S-40 | Marken-Blatt **P1/P2: 32 + 4 × 44 = 208 px** (Zeile [● Neu aufnehmen …] 44 statt 26 px; P1 ab y 636). **P3: Zeile 3 bricht um** ([✎ Name][Farbe ●] │ [Teil-Vorlage ›][Auf alle übertragen]), also 32 + 5 × 44 = 252 px, Blatt ab y 316; der Song-Canvas endet in P3 bei y 274,6 (`song-geo/geo.out`) und bleibt frei. In P3 trägt Zeile 2 Kurztexte ([⧉ Kopie][⇄ Ersetzen ▾][✕][Name weg]). L bleibt 28 + 2 × 44 = 116 px (L-3). **Bereich-Leiste** (56 px hoch, Breiten eigener Entwurf): P1 sechs Knöpfe, 6 × 58 + 5 × 4 = 368 ≤ 374 px; P2 6 × 56 + 5 × 3 = 351 ≤ 359 px; passt ein Text nicht (Messung `scrollWidth`), gilt Kurztext („Aufn.“, „Teil“) bzw. das Symbol; P3 nur Symbole [▶][●][⧉→][✕][⋯] à 52 px (5 × 52 + 4 × 4 = 276 ≤ 304 px), „Als Teil …“ unter ⋯. N7S-40 prüft diese Zahlen (±2 px) und M-PLATZ. |
| **K2-26** | `song-delta.md` 6.5 Transportzeile P1 | Summe berichtigt: [CLIPS ⇄ 64] + [● ▾ 76] + [▶ SONG 76] + [⟲ Song ▾ 86] + [▦│◧ 44] = **346 px** + 4 Lücken à 4 px = 362 px ≤ 374 px. Das ⧉-Feld beim Ziehen einer Marke liegt an der Stelle von CLIPS ⇄ (x 8…72). |
| **K2-27** | `song-delta.md` 6.2 und 7.1 (Einzeltakt/Bereich), N7S-06, N7S-29 | Auswahl mit a = b (1 Takt, z. B. nach Tipp auf eine Taktnummer): Das Start-Blatt zeigt **[Ab Takt n: Überschreiben │ Einfügen]** und **[Nur Takt n: Ersetzen │ Overdub]**. Ab 2 Takten nur die Bereich-Modi. Ohne Auswahl (nur Positionsmarke) nur „ab Takt n“. `songRecFrom` = „ab n“, `songRecRange` = {a, b} auch bei a = b. N7S-29 ergänzt: „Auswahl T4 (a = b = 3), [Nur Takt 4: Ersetzen], NOTEN auf Synth 2 → nur T4 neu, T5 alt (`noteLog`).“ |
| **K2-28** | Spec §4.4 („Läuft die Kette, springt ein Tipp … zur nächsten Kettenstelle“), V2e-01 | Ersetzt durch B.1 Nr. 17: Teil-Tipp bei laufendem Song (ohne Aufnahme) springt am nächsten Taktstrich zur nächsten Marke dieses Teils, ohne Marke übernimmt die Hand (orange [↩ SONG]). Neuer Punkt **N7S-25b (V2d):** „Song läuft in T2, Tipp auf Teil STROPHE (Marke T3–6 und T9–12) → ab T3 die Marke; nochmals in T7 → ab T9; Tipp auf einen Teil ohne Marke → Hand-Übernahme, [↩ SONG] orange; `project()` deep-equal.“ |
| **K2-35** | `song-delta.md` 5.1 Schritte 2–4 (S9); N7S-10, N7S-41; K2-23 | Ersetzt K2-23. Es gilt `song-delta.md` 5.1 wörtlich: Der Selbstöffner läuft ab dem Anheben 600 ms, solange der Finger liegt, egal ob und wo er sich bewegt. Das Teil-Blatt öffnet nur, wenn ohne Bewegung **vor** dem Öffnen losgelassen wird (zwischen 450 und 1050 ms nach dem Aufsetzen). Nach dem Öffnen zählt ein Ablegen erst nach ≥ 12 px Bewegung; Loslassen davor = Abbruch zurück zur Ausgangsansicht. N7S-10 lautet: „Tipp startet; Halten 450 ms ohne Bewegung und Loslassen vor dem Öffnen → Teil-Blatt; Halten + Ziehen → kein Teil-Blatt; Halten ohne Bewegung bis zum Öffnen → kein Teil-Blatt.“ N7S-41 (b) lautet wieder: „600 ms nach dem Anheben ruhig halten → offen.“ Ablauf B.5, Prüfung N2-2e′-03, Rückfrage S-8 (F.2). |
| **K2-63** (Rev. 3) | `song-delta.md` 7.x (Banner „In der Clip-Ansicht liegt es über der Teil-Leiste“), N7S-02; C.2 Punkt 1 (Mikro-Zeile) | Die Teil-Tasten sind während ● (Ziel CLIPS: sie schreiben Lanes und Marke, `song-delta.md` 7.2) und während 🎤 (Teile schalten beim Singen) eine **Eingabe**. Ein Banner bzw. eine Mikro-Zeile von 26–28 px über der 40 px hohen Teil-Leiste ließe nur 12–14 px frei. Neu: **In der Clip-Ansicht liegen Aufnahme-Banner und Mikro-Zeile nie über der Teil-Leiste**, sondern als Überlagerung in der **Kopfzeile `#top`** (44 px, an der Stelle des Projekttitels, gleiche Höhe, verschiebt nichts). In der Song-Ansicht bleibt das Banner über der Taktleiste. N7S-02 ergänzt: „Bei ● in der Clip-Ansicht liefert `elementFromPoint` in der Mitte jeder Teil-Taste die Teil-Taste; ihre freie Höhe ist ≥ 36 px; ein Tipp startet den Teil am nächsten Takt.“ Dasselbe prüft N2-VS1-03 für 🎤. |
| **K2-70** (Rev. 3) | N2-2a-01 („erste 10 Zeichen von base32(md5(…))“, Budget +2 KB) | Die App hat kein MD5 (V0a-fix: 0 Treffer; vorhanden ist `fnv`), WebCrypto bietet kein MD5, und `crypto.subtle.digest` ist asynchron, während `normalizeProject` synchron läuft. Neu: deterministische `uid` aus zweimal `fnv` (Schlüssel mit den Endungen „a“ und „b“, Wortlaut in N2-2a-01) zu 64 Bit, base32hex, erste 10 Zeichen; Abnahme unverändert (zwei Ladevorgänge → gleiche `uid`), Budget unverändert. |

### B.4 Pakete

| Paket | Inhalt aus dem Delta | Version | Budget | Dauer | Abnahme (zusätzlich) |
|---|---|---|---|---|---|
| V0c | Start-Blatt statt Zielzeile, Banner als Überlagerung, Akkord-Chip bearbeiten (N7-R10), Akkorde quantisieren im Song (N7-R11), gelbe Auswahl + Positionsmarke + „Tipp springt nicht“ (N7-R7, nur Auswahl), Schleife als grüne Linie | 3.3.0 | +42 KB | 6–7,5 h | N7S-01 … N7S-07, N2-0c-01 |
| V2a | wie Nachtrag 1 (Format 4, 8 Spuren, 8 Szenen, MELODIE), dazu feste `uid` für Spuren und Szenen (Grundlage für VO4a) | 4.0.0 | +47 KB | 4,5–5,5 h | N2-2a-01 |
| V2c | `ChordRow.tg:null`, [Quantisieren] im Akkord-Zeilen-Blatt, Teil-Taste: Halten = anheben, Teil-Blatt beim Loslassen | 4.3.0 | +64 KB | 5,5 h | N7S-08 … N7S-10 |
| V2c′ | unverändert („Eine Skala“ wirkt auch auf aufgelöste Teile und eigene Clips) | 4.4.0 | +20 KB | 3–4 h | – |
| V2d | FANG TEIL v2, `Part.lanes`, Teil-Wiedergabe mit Lanes, Zeitleisten-Operationen und Marken (Daten, API), `re`/`ph` in `songTick`; ohne Kette; Teil-Tipp bei laufendem Song (B.1 Nr. 17) | 4.5.0 | +40 KB | 5–6 h | N7S-11 … N7S-26, N7S-25b |
| V2d′ | Aufnahme ab Takt n / im Bereich mit Modi, NOTEN-Ziel, eigene Clips (Daten, Wiedergabe), Ende nach N7-R1; Überschreiben nach K2-21, 1-Takt-Auswahl nach K2-27 | 4.6.0 | +35 KB | 5 h | N7S-27 … N7S-32, N2-2d′-01 |
| V2e | Song-Ansicht: Marken in der Taktleiste, Bereich-Leiste, Marken-Blatt, Ersetzen/Einfügen-Blatt, Spurbank, Etikett = Spur, MIDI-Marker; ohne TEIL-Zeile, ⊙, Spuren ▸, [In Teile zerlegen] | 4.7.0 | +55 KB | 5 h | N7S-33 … N7S-40 |
| **V2e′ (neu)** | siehe unten | 4.8.0 | +40 KB | 4–5 h | N7S-41 … N7S-48, N2-2e′-01 … N2-2e′-03 |
| V2f | Song-Tonart zählt eigene Clips; Tonart je Marke | 4.9.0 | +20 KB | 3,5–4 h | N7S-49 |
| V3a | gemeinsames Auswahl-Bild (Tokens) | 4.24.0 | +45 KB | 4–5 h | N7S-50 |

#### NEU V2e′ — Ziehen, Glas, eigener Clip

**Ziel.** Ein fertiger Teil kommt per Ziehen und Ablegen in den Song und entfaltet sich dort in seine Clips. Der Song lässt sich als Glas-Ansicht mit Noten sehen. Ein Clip im Song wird per Halten zum eigenen Clip (Xander S1, S3, S7, S9).

**Umfang.**
1. Ziehen aus der Teil-Taste, aus dem FANG-Blatt (Teil-Chip) und aus einer Marke: Geist, Federtaste „SONG ⇄“ (öffnet beim Darüberfahren), Öffnen 600 ms nach dem Anheben auch ohne Bewegung, Teil-Blatt nur bei Loslassen vor dem Öffnen, Schutz 12 px nach dem Öffnen (B.5, K2-35), Einfüge-Strich am Taktstrich, Rand-Rollen, Abbruch-Ziele (N7-R3).
2. Ablegen mit dem Ersetzen/Einfügen-Blatt aus V2e (N7-R4); Ziehen aus dem FANG-Blatt = Teil anlegen + ablegen in **einem** Undo (`group`).
3. Entfalten in die Clip-Bestandteile, ≤ 300 ms, ohne Verschiebung eines Bedienelements, Haptik einmal (N7-R6).
4. Umschalter ▦ Kästchen │ ◧ Glas in der Transportzeile (P1 44×40 px); Glas-Kacheln je Durchlauf mit Mini-Noten (N7-R12).
5. Halten auf eine Verweis-Zelle → beim Loslassen Zell-Blatt [Eigener Clip (dieser Durchlauf)] [Ganzer Block] [Abbrechen] (K2-24); [Bearbeiten] im Toast öffnet ROLLE auf dem eigenen Clip; [Zurück zum Szenen-Clip] (N7-R9).

**Nicht-Umfang.** Mehrere Marken auf einmal ziehen; Ziehen zwischen Projekten; Stummschalten einfangen (Frage 4 in Teil F, *(P1)* später).

**Berührungspunkte.** Teil-Leiste (V2c), FANG-Blatt (V2d), Song-Ansicht (V2e), Pointer-Ereignisse, `songTick` mit eigenen Clips (V2d′), Undo-Arten `group` und `own`, Haptik.

**Dauer** 4–5 h · **App-Version** 4.8.0 · **Budget** +40 KB.

**Abnahme-Checkliste:** N7S-41 … N7S-48 (`song-delta.md` Teil 13), dazu N2-2e′-01 … N2-2e′-03 (B.6).

**Tests.** `v2e2-ziehen.mjs`, `v2e2-glas.mjs`, `v2e2-ablauf.mjs`.

**Risiken.** Langes Drücken kann in iOS Safari Textauswahl oder Kontextmenü auslösen (eK) → auf Teil-Tasten und Zellen `-webkit-touch-callout: none` und `user-select: none` (Entwurf). Das Feld „SONG ⇄“ ist in P1 nur 95×44 px groß (gemessen in V0a) → beim Ziehen Trefferzone +8 px rundum.

### B.5 S9 vollständig: Teil halten, Song-Seite öffnet sich, ablegen, entfalten (EN2-20, K2-35)

**Xander (S9, `fragen-xander-8.md`):** „Den mit FANG (inkl. aller Clip-Zustände) aufgenommenen fertigen Song-Teil gedrückt halten → die Song-Seite öffnet sich automatisch → den Baustein auf einen Taktstrich im Song-Modus ziehen → das ‚Puzzle-Stück‘ entfaltet sich dort wie von Zauberhand in seine Clip-Bestandteile aus den verwendeten Szenen. Im Song-Modus wird NICHTS Neues gebaut: kein Teil-Block, keine Überschrift, keine zusätzliche Zeile. Einzige Kennzeichnung: der Name des Song-Teils in der gelben Markierung der Taktleiste, ohne das Layout zu verschieben.“

**Grundlage:** `song-delta.md` 5.1 (N7-R3, Schritte 1–7), 5.2 (N7-R4), 5.4 (N7-R6), 6.1 (N7-R7), Mockups P-2, P-3, P-5, L-2. Diese Stellen gelten wörtlich; B.5 fasst sie als Ablauf zusammen und legt die offenen Kleinigkeiten fest (eigener Entwurf). Vorbilder (Quelle sagt, `song-delta.md` Teil 15): Apple beschreibt „spring loading“ beim Ziehen über Schaltflächen (BELEGT, direkt gelesen: https://developer.apple.com/design/human-interface-guidelines/drag-and-drop); Ableton Live und Bitwig legen Launcher-Clips per Ziehen ins Arrangement (laut `song-delta.md` 5.1).

**Zeiten und Schwellen**

| Größe | Wert | Herkunft |
|---|---|---|
| Halten bis „angehoben“ | 450 ms, Bewegung ≤ 8 px | L4, `song-delta.md` 5.1 Schritt 1 |
| Selbstöffner | 600 ms nach dem Anheben (also 1050 ms nach dem Aufsetzen), solange der Finger liegt, egal ob und wo er sich bewegt | `song-delta.md` 5.1 Schritt 3 (S9) |
| Federtaste „SONG ⇄“ | öffnet sofort, sobald der Finger darüber ist (Trefferzone +8 px rundum) | Schritt 3 (S1), V2e′ Risiken |
| Schutz nach dem Öffnen | Ablegen zählt erst nach ≥ 12 px Bewegung seit dem Öffnen | Schritt 4 |
| Überblendung beim Öffnen | 150 ms, kein Element springt (L3) | Schritt 3 |
| Rand-Rollen | ≤ 24 px am Rand: 2 Takte/s, nach 1 s 6 Takte/s; nie vor Takt 1, nie weiter als Song-Ende + 4 | Schritt 6 |
| Entfalten | ≤ 300 ms (je Takt 15 ms Versatz), Haptik einmal | N7-R6 |

**Ablauf (Quelle a: Teil-Taste in der Teil-Leiste)**

| # | Ereignis | Zustand danach | Bild | Haptik | Daten |
|---|---|---|---|---|---|
| 1 | Aufsetzen auf eine Teil-Taste | BEREIT | – | – | – |
| 2 | Loslassen vor 450 ms ohne Bewegung | Tipp: Teil startet am nächsten Takt (Spec §4.4, E3-09) | wie heute | – | wie heute |
| 3 | Bewegung > 8 px vor 450 ms | kein Ziehen (Rollen bzw. nichts, wie heute) | – | – | – |
| 4 | 450 ms ohne Bewegung | **ANGEHOBEN** | Geist 24 px über dem Finger (durchscheinend amber, Name, Länge, Mini-Spuren) mit Fortschrittsring 600 ms; Quelle grau; „SONG ⇄“ leuchtet amber mit „↖ IN DEN SONG“ (Mockup P-2) | „pop“ | – |
| 5 | Loslassen in ANGEHOBEN ohne Bewegung > 8 px, vor dem Öffnen | **Teil-Blatt** (L4, N7S-10) | Blatt wie heute | – | – |
| 6 | Bewegung > 8 px in ANGEHOBEN | **ZIEHEN** in der Ausgangsansicht | Geist folgt dem Finger; der Ring läuft weiter | – | – |
| 7 | Loslassen in ZIEHEN vor dem Öffnen | **Abbruch** | Geist fliegt in 200 ms zurück | – | deep-equal |
| 8 | Finger über „SONG ⇄“ (in ANGEHOBEN oder ZIEHEN) | **SONG OFFEN** sofort | Überblendung 150 ms in die Song-Ansicht | „tick“ | – |
| 9 | Ring voll (600 ms nach dem Anheben) in ANGEHOBEN oder ZIEHEN | **SONG OFFEN** von selbst (S9) | wie 8 | „tick“ | – |
| 10 | SONG OFFEN, Finger seit dem Öffnen < 12 px bewegt | **SCHUTZ** | Geist sichtbar, kein Einfüge-Strich | – | – |
| 11 | Loslassen in SCHUTZ | **Abbruch**, zurück zur Ausgangsansicht | Geist fliegt zurück; LCD „Zum Ablegen den Teil an einen Taktstrich ziehen“ | – | deep-equal |
| 12 | Bewegung ≥ 12 px seit dem Öffnen | **ABLEGEN-BEREIT** | Einfüge-Strich (amber, 2 px) am nächsten Taktstrich `n = round(x/36)`, gestrichelte künftige Marke, künftige Zellen 30 % (N7-R4); Rand-Rollen | „tick“ je neuem n (≤ 10/s) | – |
| 13 | Loslassen über dem Song-Canvas (Taktleiste oder Spuren) | **ABLEGEN** (N7-R4): n ≥ Song-Länge → anhängen ohne Rückfrage; sonst Blatt [Takte n–… ersetzen] [Einfügen] [Abbrechen], ohne Vorbelegung | Entfalten ≤ 300 ms in die Clip-Bestandteile (N7-R6), danach gelbe Teil-Marke mit Namen (N7-R7) | „snap“ | **ein** Undo `song` (aus dem FANG-Blatt: `group` [part, song]) |
| 14 | Loslassen auf Transport, Etiketten, Tastatur, Teil-Leiste, Seitenfeld | **Abbruch**, zurück zur Ausgangsansicht | Geist fliegt zurück | – | deep-equal |
| 15 | `pointercancel`, Anruf, Seite verliert den Fokus | **Abbruch** | wie 14 | – | deep-equal |

**Festlegungen**
1. **Ein zweiter Finger** wird in allen Zuständen ignoriert (L4). Während des Ziehens startet nichts, keine Zelle ändert sich, FOLGEN hält mit Grund „Finger“ (EN-07; `song-delta.md` 5.1 Schritt 7).
2. **Quelle b (Teil-Chip im Blatt „Teil gefangen“):** wie oben, aber Schritt 5 tut nichts (kein Teil-Blatt). Ablegen legt den Teil an und legt ihn ab, in **einem** Undo `group` (N7S-44).
3. **Quelle c (Teil-Marke in der Song-Ansicht):** Der Song ist schon offen; Schritte 8–11 entfallen. Halten 450 ms hebt die Marke an; Loslassen ohne Bewegung → Marken-Blatt (N7S-35); ≥ 12 px Bewegung → verschieben, Finger ≥ 250 ms über ⧉ (an der Stelle von „CLIPS ⇄“, K2-26) → Kopie (N7S-44).
4. **Querformat:** Die Teil-Leiste liegt im Seitenfeld (Mockup L-2); „SONG ⇄“ ist dort die Federtaste an derselben Stelle wie im Hochformat oben links; alle Zeiten gleich.
5. **Song-Ansicht beim und nach dem Ablegen:** keine neue Zeile, kein Teil-Block, keine Überschrift; einzige Spur ist die gelbe Marke mit dem Namen in der Taktleiste (B.1 Nr. 4–5, EN7-02). Alle Bedienelemente bleiben ±2 px an ihrem Ort (M-ANSICHT, N2-2e′-02).
6. **Schutz gegen Fehlgriffe:** Den Selbstöffner kann man nicht abschalten; wer das Teil-Blatt will, lässt vor dem Öffnen los (Ring zeigt die Restzeit). Nach dem Öffnen gilt der 12-px-Schutz. Beides fragt Rückfrage S-8 ab.
7. **iOS:** Teil-Tasten und Zellen tragen `-webkit-touch-callout: none` und `user-select: none` (V2e′ Risiken); Haptik nur, wo das Gerät sie bietet.
8. **Test-API:** keine neue Funktion; der Ablauf wird per CDP-Touch gefahren, die Daten mit `placePart`, `project()`, `svLayoutInfo()` geprüft (`song-delta.md` 12.2).

**Abnahme:** N7S-10, N7S-41 … N7S-45 in der Fassung von K2-35, dazu N2-2e′-03 (B.6).

### B.6 Zusatz-Abnahme

- [ ] **N2-0c-01 Zwischenstand nach V0c (EN-20), Prüfpunkte für Xander:** (1) in der Song-Ansicht einen Akkord-Chip antippen und „Dm7“ eintippen; (2) [Quantisieren] mit Raster Takt; (3) Tipp auf eine Taktnummer wählt sie gelb, ▶ startet dort. Dazu die drei Punkte aus Nachtrag 1, C.5 Punkt 3.
- [ ] **N2-2e′-01 Xanders Ablauf am Stück** (ein Skript, CDP-Touch, P1, Song aus `song-delta.md` 5.5):
  1. Vier Szenen laufen mit Clips aus verschiedenen Szenen, ein Clip wird zwischendurch aus- und wieder eingeschaltet, Träger Am F C G; FANG TEIL kurz nach dem Taktstrich 9 (7 %) → neuer Teil, 8 Takte, Lanes wie N7S-12; im Blatt den Chip [Strophe] antippen → [＋ Strophe 2] (Standard) → [ALS TEIL ✓]; Teil-Taste „STR2“. (Im Song aus 5.5 sind INTRO, STROPHE und REFRAIN Teile in `S.parts`; der Vorschlag nach N7-R2 wäre deshalb „Bridge“, das Skript wählt den Chip ausdrücklich.)
  2. Teil-Taste „STR2“ halten, auf „SONG ⇄“ ziehen → Song-Ansicht offen; am Taktstrich 3 ablegen → Blatt → „Einfügen“.
  3. Taktleiste: gelbes Band „STROPHE 2“ über T3–10, Nummern 1–2 und ab 11 sichtbar.
  4. Tipp in die Marke über Takt 4 → weißer Rand und Marken-Blatt (N7S-35); zweiter Tipp → Takt 4 gewählt, Nummern in der Marke sichtbar; ● → Start-Blatt → „ab Takt 4 überschreiben“, Ziel NOTEN auf Synth 2, zwei Takte spielen, ● kurz nach dem Taktstrich 6 → Ende am Taktstrich 6 (N7-R1).
  5. ◧ Glas → die Kachel von Synth 2 in T4–5 zeigt die neuen Noten; Halten auf Synth 1 in T7 → Zell-Blatt → [Eigener Clip] → eigener Clip (K2-24).
  - Soll: `S.tracks[].clips` nach jedem Schritt deep-equal zum Start; jeder Schritt ist genau **ein** Undo; Undo bis zum Anfang stellt `project()` deep-equal her; 0 Konsolenfehler.
- [ ] **N2-2d′-01 Überschreiben ab Takt n (K2-21):** Song aus 5.5 nach „Einfügen“; Start-Blatt „ab Takt 4 überschreiben“, Ziel NOTEN Synth 2: in T4 spielen, T5 leer lassen, Ende am Taktstrich 6 → in T5 erklingt keine alte Note von Synth 2 (`noteLog`), ab T6 spielt der alte Inhalt; `S.tracks[].clips` deep-equal; ein Undo.
- [ ] **N2-2e′-02 Ruhe im Bild:** Während des ganzen Ablaufs N2-2e′-01 bleiben alle Bedienelemente der Song-Ansicht ±2 px an ihrem Ort (M-ANSICHT), und `svLayoutInfo().rows` ändert sich nicht.
- [ ] **N2-2e′-03 S9-Zeiten (K2-35; CDP-Touch, P1 und L1, Song aus `song-delta.md` 5.5):** (a) Teil-Taste halten, Loslassen bei 800 ms ohne Bewegung → Teil-Blatt offen, Song-Ansicht zu; (b) Halten ohne Bewegung → Song-Ansicht offen bei 1050 ms (±1 Bild); danach Loslassen ohne Bewegung → Abbruch, Clip-Ansicht, kein Teil-Blatt, `project()` deep-equal; (c) Halten, bei 500 ms 20 px bewegen → offen bei 1050 ms; dann 15 px weiter → Einfüge-Strich sichtbar; Loslassen bei x = 3·36 + 10 → Ersetzen/Einfügen-Blatt wie N7S-42; (d) Halten, 20 px bewegen, Finger bei 600 ms auf „SONG ⇄“ → offen ≤ 1 Bild später; (e) nach dem Öffnen nur 11 px bewegen und loslassen → Abbruch (Schutz), deep-equal; (f) `pointercancel` während ZIEHEN → Abbruch, deep-equal; (g) in (a)–(f) bleibt `svLayoutInfo().rows` gleich, alle Bedienelemente ±2 px (M-ANSICHT); Haptik-Aufrufe wie Tabelle B.5.
- [ ] **N2-2a-01 Feste IDs (zu V2a, Format 4; Grundlage für VO4a):** Jede Spur und jede Szene trägt eine `uid` (10 Zeichen aus `0-9a-v`). Neue Spuren und Szenen bekommen eine zufällige (`crypto.randomUUID`, gekürzt); Kopieren vergibt neue, Verschieben, Umbenennen, Undo und Redo behalten sie. Beim Laden eines Format-3-Projekts ist sie **deterministisch** (Rev. 3, K2-70; die App hat kein MD5, WebCrypto ist asynchron, `normalizeProject` synchron): aus der vorhandenen Funktion `fnv` (FNV-1a 32 Bit) werden `fnv('<Projekt-ID>|t|<Index>|a')` und `fnv('…|b')` zu 64 Bit verbunden, als base32hex (`0-9a-v`) geschrieben und die ersten 10 Zeichen genommen (Szenen mit `|s|`), sodass zwei Geräte, die dieselbe alte Datei laden, dieselben `uid` erhalten. Prüfung: Speichern/Laden, Kopieren, Undo deep-equal; zwei Ladevorgänge derselben Format-3-Datei liefern gleiche `uid`; doppelte `uid` in einem Projekt werden beim Laden repariert (Konsolenzeile). Budget in V2a eingerechnet (+2 KB, +0,5 h).

---

## Teil C — Stimme und Mikrofon (VS0–VS7), Audio quantisieren

### C.1 Fakten

| # | Aussage | Status | Quelle |
|---|---|---|---|
| C1 | Die Claude-App bietet diesem Konto kein Mikrofon: Die Fähigkeitenliste nennt `artifact`, `assets`, `comments`, `db`, `downloads`, `files`, `mcp`, `room`, `sample`, `self`, `user` und `permissions`; „Anything not listed is unavailable to this user.“ Gelesen in Revision 1 (Vertrag 0.2.85) und erneut in Revision 2 (Vertrag 0.2.75 des SYNQUENZER-Artifacts). | BELEGT (direkt gelesen) | Skill `artifact-capabilities` |
| C2 | Das öffentliche Repo `XanderFoxy/Synquenzer` (Zweig `main`, `has_pages: true`) enthält `index.html` mit der Größe von `V0a-fix.html` (1 316 464 Byte), dazu `.nojekyll` und `README.md`. Die Seite heißt `https://xanderfoxy.github.io/Synquenzer/`. | Repo BELEGT (GitHub-API, 17.10.); Seite von hier nicht abgerufen (Proxy 403) | https://github.com/XanderFoxy/Synquenzer |
| C2b | Der Spiegel `https://raw.githack.com/xanderfoxy/deutsch-mit-xander/dirigent-synth/index.html` (Branch `dirigent-synth` des Repos `deutsch-mit-xander`) bleibt erhalten. | BELEGT (GitHub-API, `r7/stimme.md` G1) | https://raw.githack.com/xanderfoxy/deutsch-mit-xander/dirigent-synth/index.html |
| C3 | `getUserMedia` geht nur im sicheren Kontext (https) und nur im obersten Dokument (ein iframe nur mit Permissions-Policy); die Erlaubnis des Nutzers ist immer nötig. | BELEGT (MDN-Quelltext und Kompatibilitätsdaten, `stimme.md` G4) | https://github.com/mdn/content · https://github.com/mdn/browser-compat-data |
| C4 | githack ist ein Caching-Proxy; Entwicklungs-URLs holen neue Pushes nach wenigen Minuten; keine Verfügbarkeits-Garantie; HTML zeigt einmal eine Bestätigungsseite. | WAHRSCHEINLICH (SE, `stimme.md` G2, G3) | https://raw.githack.com/faq |
| C5 | Alle githack-Seiten teilen eine Herkunft `https://raw.githack.com` und damit IndexedDB, `localStorage` und eine dauerhaft erteilte Mikrofon-Erlaubnis. | Herkunftsbegriff BELEGT (MDN); die Folgerung für githack ist **eigene Folgerung, nicht getestet** (`stimme.md` G6, `online.md` §2.7) | https://github.com/mdn/content |
| C6 | Safari meldet `noiseSuppression`, `autoGainControl`, `channelCount` und `latency` als nicht unterstützt; `echoCancellation` ab 13.1. | BELEGT (`stimme.md` I1) | https://github.com/mdn/browser-compat-data |
| C7 | Mit laufendem Mikrofon wird die Wiedergabe auf iOS schlechter (niedrigere Rate, Mono), WebKit-Bug 311451 (gemeldet 03.04.2026). | WAHRSCHEINLICH (SE, `stimme.md` I6) | https://bugs.webkit.org/show_bug.cgi?id=311451 |
| C8 | Safari löscht per Skript angelegte Daten einer Herkunft nach 7 Tagen Browser-Nutzung ohne Interaktion; `persist()` ab Safari 15.2. | BELEGT (`stimme.md` S2, S3) | https://github.com/mdn/content · https://github.com/mdn/browser-compat-data |
| C9 | pYIN ist ein veröffentlichtes Verfahren zur Tonhöhenerkennung (Vorbild für pYIN-lite). | BELEGT (Projektseite) | https://code.soundsoftware.ac.uk/projects/pyin |
| C10 | Melodyne „Quantize Time“ schiebt Noten zum beabsichtigten Schlag bzw. zur Rasterlinie, Stärke wählbar. | BELEGT (Herstellerseite, SE, `stimme.md` §9) | https://helpcenter.celemony.com/M5/doc/melodyneEssential5/en/M5tour_MacroTiming |
| C11 | Auf der Pages-Adresse funktioniert das Mikrofon. | gemeldet vom Orchestrator (Auftrag der Endfassung, 17.10.); hier nicht nachgeprüft | – |
| C12 | Die Herkunft `https://xanderfoxy.github.io` teilen alle Pages-Seiten von Xanders Konto, auch das Klassenzimmer. Ein `sw.js` des Klassenzimmers darf den Pfad `/Synquenzer/` nicht abdecken. | Herkunftsbegriff BELEGT (MDN); Folgerung `online.md` §2.7 (eigene Folgerung, ungeprüft) | https://github.com/mdn/content |

**Gemessen** (Node auf der Xeon-VM, synthetische Signale, **nie am iPhone**, `r7/stimme-proto/`): Noten-F mit Stimmung und Skala 0,934–0,961 je Bedingung (`bench.out`); Echo-Abzug mit 2-s-Einmess-Rauschen: SDR 19,6 dB, Minderung in Pausen 20,4 dB, Tonhöhe danach 99,9 % richtig; Rundlauf per Chirp: 95-%-Fehler 0,031–0,034 ms.

### C.2 Entscheidungen (zu EN2-06, EN2-21)

1. **Ort:** Mikrofon nur auf der eigenen Seite außerhalb der Claude-App, vor allem auf der Pages-Seite. Es ist **dieselbe Datei** wie in der Claude-App. 🎤, BEATBOX, Mikro-Zeile und Mikro-Check erscheinen nur, wenn `navigator.mediaDevices?.getUserMedia` existiert **und** die Seite das oberste Fenster ist (`window.top === window`). Sonst bleibt alles unsichtbar (N7V-05).
   - **Projektformat (K2-31):** `take`/`audioClip` und die Spur-Art STIMME sind **additive Felder in Format 4** (keine neue Formatnummer; `normalizeProject` erhält sie, E3-02 sinngemäß). In der Claude-App erscheint eine STIMME-Spur grau mit „Audio nur auf der eigenen Seite“; ihre Daten bleiben beim Speichern deep-equal. Der WAV-Teil eines ZIP-Imports wird dort mit Toast „Audio übergangen – nur auf der eigenen Seite“ übersprungen, das Projekt lädt (N2-VS3-03).
   - **Bildschirm (K2-32, Rev. 3):** Die Mikro-Zeile (28 px) ist eine **Überlagerung** in fester Höhe und verschiebt nichts (L3, M-ANSICHT, Xanders S4). In der **Clip-Ansicht** liegt sie in der Kopfzeile `#top` an der Stelle des Projekttitels, **nie über der Teil-Leiste** (Teil-Tasten bleiben beim Singen bedienbar, K2-63); in der Song-Ansicht über der Taktleiste wie das Aufnahme-Banner (N7S-02).
   - **Modusleiste Hochformat (gemessen an V0a-fix, CSS `#modebar`):** Spalten ‹ 44 │ Segment │ › 44 │ FANG 64 mit 3 Lücken à 5 px und 8 px Rand je Seite; also **Segment = Breite − 16 − 44 − 44 − 64 − 15** = P1 207 px, P2 192 px, P3 137 px (innen 2 Lücken à 2 px). Mit 🎤 (Breiten eigener Entwurf): **P1** [♪ SPIELEN │ 🎤 SINGEN │ ⇅ TRANSP.] 3 × 67 + 2 × 2 = 205 ≤ 207 px, Textstufen `.tight` wie V0a; **P2** 3 × 62 + 4 = 190 ≤ 192 px mit Textstufe `.tight`/`.short`; **P3** nur Symbole ♪ │ 🎤 │ ⇅, 3 × 44 + 4 = 136 ≤ 137 px. FANG bleibt 64 px, ‹ › bleiben 44 px.
   - **Querformat L1/L2:** Das Segment ist dort eine Spalte (`flex-direction: column`) in der 96-px-Mode-Spalte; ein dritter Knopf wäre ≈ 24 px (L1) bzw. ≈ 22,5 px (L2) hoch, also unter L4. Deshalb bleibt das Segment **zweiteilig** (♪ │ ⇅) wie in V0a, und **🎤 ist ein eigener Knopf 44 × 36 px in der Kopfzeile `#top`**, nur sichtbar, wenn `getUserMedia` da ist und die Seite das oberste Fenster ist. (Gerechnet aus der V0a-CSS: Unterzeile clamp(110 px, 34dvh, 150 px), Segment = Höhe − 56 px → zwei Knöpfe ≈ 37 px in L1, ≈ 35 px in L2, ≈ 26 px bei offenem Blatt; das ist V0a-Stand, 🎤 ändert daran nichts; FP-TOUCH vermerkt den Wert in CHANGES.) Prüfung N2-VS1-01, N2-VS1-03.
2. **Herkunft (Rev. 2):** Auf der Pages-Seite (eigene Herkunft, geteilt nur mit Xanders eigenen Pages-Seiten, C12) gibt es keinen Hinweis. Auf githack zeigt VS3 vor dem ersten Take den Hinweis „Aufnahmen liegen auf einer geteilten Adresse – bitte die Seite https://xanderfoxy.github.io/Synquenzer/ benutzen oder exportieren“ und bietet [WAV/ZIP exportieren] (N2-VS3-01). VS0–VS2 speichern keine Roh-Aufnahmen und laufen auf beiden Seiten.
3. **Tore (Rev. 2):** VS1 beginnt erst, wenn Xanders VS0-Ergebnis vorliegt und positiv ist (N2-VS0-02). VS3 beginnt erst nach Xanders Gerätetest N7V-12 mit dem Zwischenstand nach VS2 (N2-VS2-03). Liegt das Ergebnis beim Ende von Gruppe 6 positiv vor, kommt Gruppe 7 (VS3–VS5b) vor Gruppe 8 (Drums); sonst werden die Gruppen getauscht (Tausch-Regel E.1). Ein geschlossenes Tor verschiebt auch alle Pakete, die das Paket brauchen (E.5 Punkt 3).
4. **Audio-Sitzung:** `play-and-record` nur, solange 🎤 an ist; danach sofort `playback` und alle Spuren `ended` (N7V-06). Mikrofon nur auf Tipp, im selben Tipp `ctx.resume()`.
5. **Datenschutz (Rev. 3):** Während einer Take-Aufnahme, beim Säubern und im Mikro-Check keine Netzaufrufe (N7V-35), auch nicht durch SYNC oder Realtime (N2-VS1-02); beim bloßen 🎤-Hören (Stimme → Noten live) laufen SYNC und Realtime weiter. Audio (Takes, Quellen der Resynthese) verlässt das Gerät nie; ein Audio-Speicher online ist nicht Teil von v3 (`online.md` §2.6 bleibt Skizze, §18).
6. **Kein Gate:** Säubern zieht das eigene Playback ab (Referenz-Eingang), mit Einmessen; Stille entsteht nie durch ein Gate (N7V-23).

### C.3 Pakete (ersetzt Nachtrag 1, Teil B „VS“, und `SYNQUENZER-stimme-jam.md` Teil 3)

Inhalt wörtlich nach `r7/stimme.md` §12; hier Version, Gruppe und Tore.

| Paket | Inhalt (Kurzfassung) | Version | Budget | Dauer | braucht | Gruppe |
|---|---|---|---|---|---|---|
| **VS0** Mikro-Check | verstecktes Testblatt (⚙ → „Mikro-Check“, nur oberstes Fenster): sicherer Kontext, Constraints, Abtastraten, Latenzen, Audio-Sitzung, Fehlername, 4-Chirp-Rundlauf, Frequenzgang, 2-min-Drift, Speicher-Test, Ja/Nein zum Klang, Ergebnis als JSON kopieren/speichern | 3.7.0 | +15 KB | 4 h | – | 2 |
| **VS1** Mikro-Grundlage | 🎤 in der Modusleiste (Breiten C.2 Punkt 1); Mikro-Zeile als Überlagerung (in der Clip-Ansicht in `#top`, K2-63); Start nur auf Tipp; Worklet `stimme` mit Mikro- und Referenz-Eingang; Ringpuffer 2 min; Pegel; Einmessen je Weg; Fehlerpfade; SYNC-Pause (N2-VS1-02) | 4.11.0 | +25 KB | 5–6 h | VS0 positiv | 6 |
| **VS2** Stimme → Noten, Instrument einspielen | MPM live (Taste leuchtet), pYIN-lite offline mit Segmentierung, Stimmung, Einrasten; Stimme-FANG (N7-R1) und ● REC → MELODIE-Clip; Ergebnis-Blatt; Teilen/Verbinden/Oktave; **Quelle „Stimme │ Instrument“** (einstimmig, `stimme.md` §4.5) mit Schalter „Oktave sperren“ (K2-33) | 4.12.0 | +36 KB | 6–7,5 h | VS1, FANG, V2a, V2d | 6 |
| **VS3** STIMME-Spur & Takes | Spur-Art STIMME; IndexedDB v2 Store `audio`; Takes, Overdub, Punch mit Rückfrage (überschreiben/einfügen, Bereich); WAV-Export, ZIP; `persist()`; Herkunfts-Hinweis | 4.15.0 | +35 KB | 6 h | VS2, V2a, V2e; N7V-12 bestanden | 7 |
| **VS4** Säubern | Echo-Abzug (NLMS → Block/MDF), Nachfilter, Wiener-Entrauschen, HP 80 Hz, Regler SÄUBERN (0 % = bitgleich), A/B | 4.16.0 | +25 KB | 5 h | VS3 | 7 |
| **VS5a** Marken & Scheiben | Silben-/Wort-Marken, Marken-Editor, Zeitkarte `warp.map`, Quantisieren (C.5), Modus Scheiben, „Audio folgt“ | 4.17.0 | +25 KB | 5 h | VS3 | 7 |
| **VS5b** Dehnen & Songtext | Modus Dehnen (20 ms Transient fest + WSOLA), Grenzen 0,5–2,0, Render-Cache; Songtext auf Silben; *(P1)* Signalsmith Stretch nachladbar | 4.18.0 | +30 KB | 5–6 h | VS5a | 7 |
| **VS6** Beatbox | Flux-Einsätze, Merkmale, k-NN, Anlernen b/k/ts, Regeln ohne Anlernen, Anschlag aus Pegel, Pads 36/38/42; live nur mit Kopfhörer | 4.23.0 | +20 KB | 4–5 h | VS1, V1d | 8 |
| *VS7* Akkorde erkennen *(optional)* | Chroma-Akkorde (gespielte Fläche, Gitarre, Klavier) → Akkord-Zeile mit Undo (N7V-34); die Quelle „Instrument“ ist schon in VS2 | 4.23.5 | +14 KB | 3–3,5 h | VS2, V2c | 8 (nach Xanders Ja) |

Variante B der Tausch-Regel (E.4) nennt die Versionen, wenn Gruppe 8 vor Gruppe 7 gebaut wird.

### C.4 Abnahme

N7V-01 … N7V-35 (`r7/stimme.md` §13) gelten verbindlich, mit diesen Änderungen: **N7V-13** (VS2) lautet neu: „Stimme-FANG, Tipp 1/8 Takt nach dem Taktstrich, Phrase mit 4 Takten (gleiche Lage wie `song-delta.md` 4.2 Fall 3b) → Ende nach `fangClose` (Struktur vor Zeit, N7-R1); Ergebnis MELODIE-Clip; ein Undo entfernt ihn.“ Die Take-Verknüpfung prüft N2-VS3-02 (VS3). **N7V-33** gehört zu VS2 (K2-33), **N7V-34** bleibt bei VS7. „Gerät“-Punkte prüft Xander am iPhone und meldet das Ergebnis. Zusätzlich:

- [ ] **N2-VS1-01 Ruhe im Bild (Rev. 3):** 🎤 an/aus: alle Bedienelemente ±2 px (M-ANSICHT), die Mikro-Zeile überlagert nur. M-PLATZ der Modusleiste mit genau den Werten aus C.2 Punkt 1 (±1 px): Segment P1 205 px (3 × 67), P2 190 px (3 × 62), P3 136 px (3 × 44), FANG 64 px, ‹ › je 44 px; je Modus-Knopf `scrollWidth ≤ clientWidth`. L1, L2: Segment zweiteilig, Modus-Knöpfe so hoch wie in V0a (±1 px), 🎤 in `#top` ≥ 44 × 36 px, auch bei offenem Blatt.
- [ ] **N2-VS1-03 Teil-Tasten beim Singen (Rev. 3, K2-63):** Clip-Ansicht, 🎤 an, Mikro-Zeile sichtbar (P1–P3, L1, L2): `elementFromPoint` in der Mitte jeder Teil-Taste liefert die Teil-Taste, ihre freie Höhe ist ≥ 36 px, ein Tipp startet den Teil am nächsten Takt; die Mikro-Zeile liegt vollständig in `#top`.
- [ ] **N2-VS2-02 Einspielen:** Quelle „Instrument“, Node-Test mit einstimmiger Synth-Säge (8 Takte, bekannte Noten) → Noten-F ≥ 0,93 (Zielwert eigener Entwurf, in Höhe der Stimm-Messung `stimme-proto/bench.out`); mit „Oktave sperren“ und Sub-Oszillator −1 Okt. 0 Oktavfehler-Frames (N7V-33). Am iPhone (Gerät): Xander spielt eine Melodie auf einem Instrument vor dem Mikrofon und zählt die richtigen Noten.
- [ ] **N2-VS1-02 SYNC und Mikrofon (Rev. 3):** (1) Das Verbot gilt **während einer Take-Aufnahme, beim Säubern und im Mikro-Check**, nicht beim bloßen 🎤-Hören (Stimme → Noten live). (2) Für diese Zeit trennt SYNC alle Realtime-Kanäle (`removeAllChannels`) und baut sie ≤ 5 s nach dem Ende wieder auf; Änderungen warten im Postausgang und gehen ≤ 5 s nach dem Ende hoch; ein laufender Jam (VC3b) zeigt beiden „Jam pausiert – <Name> nimmt auf“. (3) Der Zähler umfasst `fetch`, XHR, `sendBeacon` und gesendete WebSocket-Frames und steht in dieser Zeit auf 0 (N7V-35). Takes und Quellen der Resynthese gehen nie hoch; der Projekttext trägt nur `take`-IDs; im Paar-Raum sieht der Partner die STIMME-Spur grau mit „Audio nur auf dem Gerät von <Name>“.
- [ ] **N2-VS2-03 Zwischenstand für den Gerätetest:** Direkt nach der Abnahme von VS2 geht der Stand auf die Pages-Seite (EN2-15). Xander prüft N7V-12 (8 Takte zum Klick mit Kopfhörern singen, dann FANG; ≥ 80 % der Noten ohne Korrektur richtig) und N2-VS2-02 am iPhone. Das Ergebnis steht in CHANGES und entscheidet die Tausch-Regel E.1.

- [ ] **N2-VS0-01 Nur eigenständig:** In der Claude-App (iframe) gibt es keinen Eintrag „Mikro-Check“ und keinen `getUserMedia`-Aufruf (Zähler 0). Auf der Pages-Seite (und dem githack-Spiegel) liefert „Ergebnis kopieren“ gültiges JSON; das Schema steht in CHANGES.
- [ ] **N2-VS0-02 Tor für VS1:** VS1 beginnt nur, wenn Xanders JSON vorliegt mit `getUserMedia` erfolgreich, Chirp-Streuung ≤ 2 ms (N7V-03) und „Ja“ beim Klang. Sonst: Befund in CHANGES, Rückfrage an Xander; VS1, VS2 und alle Pakete, die sie brauchen (VS3–VS6), rücken nach E.5 Punkt 3.
- [ ] **N2-VS0-03 (zu VS0, aus S0):** Auf der Pages-Seite ist keine Funktion sichtbar, die eine Claude-Fähigkeit braucht (`use()` → `null`, EN-13). Ein Projekt wandert per Export und Import zwischen Claude-App und Pages-Seite und klingt danach bitgleich (getrennte Herkunft, getrennte Daten).
- [ ] **N2-VS2-01 Eine Ende-Regel:** Stimme-FANG ruft dieselbe Funktion wie FANG TEIL (`fangClose`, N7-R1). Die Fälle 1–9 aus `song-delta.md` 4.2 mit gesungenen Noten liefern dieselben Enden wie mit gespielten.
- [ ] **N2-VS3-01 Herkunfts-Hinweis:** Mit `location.origin = 'https://raw.githack.com'` (Test-API-Override) zeigt VS3 vor dem ersten Take den Hinweis und [WAV/ZIP exportieren]; mit `https://xanderfoxy.github.io` (Pages) nicht.
- [ ] **N2-VS3-02 Clip und Take (aus N7V-13):** Stimme-FANG legt MELODIE-Clip und STIMME-Take mit gleicher `take`-ID an; ein Undo entfernt beides; Redo stellt beides her.
- [ ] **N2-VS3-03 Rundweg (K2-31):** Projekt mit STIMME-Take → Export (JSON) → Import in der Claude-App → Speichern → Export → Import auf der Pages-Seite: `project()` deep-equal, der Take spielt bitgleich. ZIP mit WAV in der Claude-App: Toast, Projekt lädt, kein Konsolenfehler.
- [ ] **N2-VS5a-01 Marken von Hand (Rev. 3, K2-64; zu VS5a):** Halten 1 s ohne Bewegung auf einer Marke → keine Datenänderung (deep-equal); Halten 600 ms und dann 40 px ziehen → nur Verschieben (ein Undo); Tipp auf eine leere Stelle → neue Marke (ein Undo); Tipp auf eine Marke → Blatt [✕ Löschen] [Abbrechen]; [✕ Löschen] → Marke weg, ein Undo, Toast [Rückgängig].

### C.5 Audio quantisieren (Regelwerk; ersetzt N7-R14 und `stimme.md` §9, wo verschieden)

1. **Gilt für** Takes der STIMME-Spur (Gesang, Hör-Spur) und Instrument-Takes. Gesungene Melodie (VS2) und Beatbox (VS6) werden Noten und nutzen das Noten-Quantisieren. In der Claude-App gibt es den Menüpunkt nicht.
2. **Marken** = Noteneinsätze aus VS2 (Gesang) bzw. Flux-Einsätze (Beatbox, Instrument), je mit Vertrauen. **Von Hand (Rev. 3, K2-64):** Tipp auf eine leere Stelle = Marke setzen; Ziehen (> 8 px) = verschieben; Tipp auf eine Marke = wählen mit kleinem Blatt [✕ Löschen] [Abbrechen] (L4-Muster); Löschen ist ein Undo mit Toast [Rückgängig]. **Halten hat im Marken-Editor keine eigene Bedeutung** (Spec §1: im Editor kein Lang-Druck mit neuer Bedeutung; K2-24: L4 und GEST ohne Ausnahme).
3. **Eine Quantisier-Funktion** für Noten und Audio (Logik von `quantizeNoteSet()`): Raster 1/4, 1/8, 1/16, 1/8T, 1/16T oder Auto; Stärke 0–100 % (Standard 100 % in „Scheiben“, 70 % in „Dehnen“); Swing. Ist ein MELODIE-Clip mit dem Take verknüpft, nimmt sein Quantisieren den Take mit (Schalter „Audio folgt“).
4. **Fangfenster:** Nur Marken innerhalb ±40 % des Rasterabstands um einen Rasterpunkt rücken; andere bleiben (gewollte Offbeats).
5. **Zeitkarte** `warp.map` stückweise linear zwischen den Marken; gerendert wird im Worker, nicht zerstörend, mit Cache.
6. **Modus „Scheiben“** (Beatbox, Drums, Perkussives): Schnitt 3 ms vor jedem Einsatz am Nulldurchgang (±2 ms); Scheiben werden nur verschoben; eine Lücke füllt der natürliche Ausklang der vorigen Scheibe; Überlappungen 5 ms gleichleistungsgemäß überblendet; Anschläge bitgleich.
7. **Modus „Dehnen“** (Gesang): die ersten 20 ms nach jeder Marke unverändert; der Rest der Scheibe per WSOLA auf die Ziellänge; Überblendung 5 ms; Faktor 0,5–2,0, außerhalb nur verschieben mit Warnung. *(P1)* Signalsmith Stretch (MIT, `stimme.md` §1.5) nur auf der eigenständigen Seite nachladbar.
8. **Stärke 0 %** = Original bitgleich; A/B-Schalter; ein Undo; nach Undo ist das Original bitgleich.
9. **Nicht im Umfang:** Tonhöhenkorrektur (Auto-Tune-artig).
10. **Abnahme:** N7V-26 … N7V-30 und N7S-51 (jetzt VS5a), dazu N2-VS5a-01 (C.4, Rev. 3).

Vorbilder, was die Quellen sagen (`song-delta.md` Teil 15): Logic Flex Time „Slicing“ schneidet an Transienten und füllt Lücken (BELEGT, SE: https://support.apple.com/en-my/guide/logicpro-ipad/flex-time-algorithms-and-parameters-lpipab631a74/1.0/ipados/16.0); Pro Tools Beat Detective trennt an Transienten, richtet am Raster aus und glättet Schnitte mit Blenden (BELEGT, SE: https://www.avid.com/pro-tools/user-guide/beat-detective). Die Zahlen oben sind eigener Entwurf bzw. aus dem Prototyp.

### C.6 Risiken

Wie `r7/stimme.md` §14 (R1–R13). Am wichtigsten: schlechtere Wiedergabe bei laufendem Mikrofon (C7); geteilte Herkunft (githack für alle Repos, C5; Pages nur mit Xanders eigenen Seiten, C12); Löschen nach 7 Tagen (C8, Gegenmittel `persist()` und Export-Erinnerung); echte Stimmen sind schwerer als die synthetischen Tests (Gerätetest N7V-12 vor VS3); CPU am iPhone ungemessen (N7V-15).

### C.7 Korrekturen

| # | Stelle | Korrektur |
|---|---|---|
| **K2-08** (Rev. 2) | Nachtrag 1, Teil B „VS“, Paket S0 (eigenständige Version) | S0 entfällt als eigenes Paket; die eigenständige Seite gibt es schon (C2). Manifest, Icons und lokale Schriften (kein Zugriff auf fonts.googleapis.com und fonts.gstatic.com) kommen mit VO1 (fest, Gruppe 2). Die übrigen S0-Abnahmepunkte gehen in N2-VS0-03. Der Hinweis zu Datenschutz und Impressum bleibt ein Hinweis (Rechtslage unsicher, keine Rechtsberatung). |
| **K2-30** | `stimme.md` §13 N7V-13 | Neu gefasst (C.4): Ende nach `fangClose` (Struktur vor Zeit), nicht pauschal „am vorigen Taktstrich“; die Take-Verknüpfung wandert nach VS3 (N2-VS3-02), weil Takes erst mit VS3 entstehen (C.2 Punkt 2). |
| **K2-31** | `stimme.md` §8 „Format 4 + Feld audio, Version +1“ | Additive Felder in Format 4, keine neue Formatnummer; Verhalten in der Claude-App nach C.2 Punkt 1; Prüfung N2-VS3-03. |
| **K2-32** (Rev. 3) | `stimme.md` §11 Skizze 1 (Mikro-Zeile als eigene Zeile), Modusleiste ohne Breiten | Mikro-Zeile = Überlagerung (Clip-Ansicht in `#top`, K2-63); Breiten nach C.2 Punkt 1, **neu gerechnet an der V0a-CSS** (Segment = Breite − 183 px; P1 3 × 67, P2 3 × 62, P3 3 × 44 nur Symbole; FANG 64, ‹ › 44); L1/L2: Segment zweiteilig, 🎤 als eigener Knopf in `#top`; Prüfung N2-VS1-01, N2-VS1-03. Die Werte aus Revision 2 (3 × 70, 3 × 66, FANG 72) passten nicht. §11 bleibt sonst unverbindlich (EN2-01). |
| **K2-64** (Rev. 3) | `stimme.md` §9 und C.5 Nr. 2 (Marken von Hand: „halten = löschen“) | Halten mit zerstörender Wirkung widersprach Spec §1 und K2-24 und kollidierte mit dem Ziehen. Neu nach C.5 Nr. 2 (Tipp = setzen bzw. wählen, Ziehen = verschieben, Löschen über das Blatt); Prüfung N2-VS5a-01. |
| **K2-33** (Rev. 2) | `stimme.md` §12 Zeilen VS2 und VS7, §4.5 | Xanders P3 nennt „einsingen **oder einspielen**“. Die einstimmige Quelle „Instrument“ mit „Oktave sperren“ und N7V-33 gehören fest zu VS2 (+1–1,5 h, +6 KB; Version 4.12.0 nach Teil E). VS7 enthält nur noch das Akkord-Erkennen (N7V-34; 3–3,5 h, +14 KB). |

---

## Teil D — Bibliothek nach Vorbildern (ändert V10a, V10b, V10d, V10e, VK, §12.8; neu V10P, V10f, VK2, VI1a–VI3)

### D.0 Lage

- **Rezepte:** R6 hat 76 (N01–N76, Parameter in `r6/n6/rezepte76.json`), Spec A.1 hat 46, die R7-Dateien haben rund 253 neue. Der Master-Katalog `r7/vorbild-katalog.md` ordnet 334 Einträge zu 111 Acts in drei Stufen: Tier 1 = 43 Kern-Sounds und 1 Kandidat (Quinten-Bass), Tier 2 = 90, Tier 3 = 194 (nicht ins Werk). Maschinenlesbar: `r7/katalog-work/katalog.json`.
- **Xanders persönliche Wünsche** (`r7/vorbild-spezial.md`): 17 neue Sounds (6 Vogue, 7 And One, 4 Slap House bzw. Electroclash) und 2 hochgestufte (SZ-01 Körperbass, C2-13 Reese-Hüpfer); Second Decay ohne neue Rezepte (N19/N20 bzw. SZ-23/SZ-24).
- **Studio-Setups** (`r8/studio-setups.md`): Geräte-Rangliste der 20 Vorbilder (Sampler und Moog-Familie vorn), 14 Instrument-Vorlagen in den Stufen A–E (D.9).
- **Nichts ist angehört, nichts auf der App-Kette gemessen** (außer den R6-Rezepten mit [g], offline). Alle Rezepte und Hörproben sind eigene Entwürfe, per Skript auf Takt-Wiederholung, Taktgrenzen und Lage geprüft.
- **Keine neue Web-Recherche** (N2.0.2 Nr. 3). Die Dateien `vorbild-szene.md`, `vorbild-dark.md` und `vorbild-retro.md` sind laut ihren eigenen Vorbemerkungen **ganz ohne Web** entstanden: Ihre Belege stammen aus Suchauszügen früherer Runden, alles andere ist eK und gilt als UNBELEGT. Deshalb das Tor PR-V (D.2b).

### D.1 Regeln (verbindlich)

1. **Zulassung** nach EN2-08. Skalen: Katalog „B“ → `b`, „W“ → `s`, „W-schwach“ (nur Equipboard oder Nutzerfoto) → `u`, „U“ → `u`; R6 `e` → `u`.
2. **„Betrifft den Klang“** heißt: Gerät, Patch, Spielweise oder Klangwelt des Acts, oder die Technik eines Genres (z. B. Slap-House-Tutorials). Biografie, Chartplätze oder Titel allein tragen kein Tag.
3. **Eine Hörprobe je Sound** (`aud`). Zweite Hörproben (Katalog §4.4) werden nicht übernommen; *(P1)* `aud.alt[]`. Mehrspurige Act-Hörproben: jeder Sound bekommt seine eigene Spur; die anderen Spuren nur *(P1)* als `aud.band` (−9 dB). Zwei Lesarten eines Wunsches dürfen sich eine Hörprobe teilen (SH-1/SH-3).
4. **ⓘ-Text:** „erinnert an … (Stil)“; Belegsatz nach Kürzel – `b`: „belegt (Quelle: <Domain>)“, `s`: „schwach belegt (Quelle: <Domain>)“, `h`: „von Xander gehört (<Datum>)“; Pflichtsatz „Marken gehören ihren Inhabern, keine Verbindung.“ Ein Gerät steht im ⓘ nur, wenn genau dieses Gerät `b` oder `s` hat. Nie „so klingt <Titel>“. Widersprüche (Katalog §4.7) neutral. Fehlt ein Baustein, steht „Annäherung“ dabei.
5. **Namen:** E9 und Spec A.4/A.13, dazu die Umbenennungen aus Katalog §4.2: C2-13 → „Reese-Hüpfer“; SZ-20 → „Dämmerungs-Chor“; NU1 „Kaltfront-Riff“ → **„Frostmaschinen-Riff“**; „Kunstleder-Riff“ → „Schnarr-Riff“; „Sonnenbrillen-Bass“ → „Kalter Achtel-Bass“; A.1 #13 „Synthex-Streicher“ → „Eiszeit-Streicher“. Werks-Sounds tragen die Namen aus A.4; wer einen Werks-Sound taggt, zieht dessen A.4-Umbenennung vor (Alias bleibt).
6. **Doppel** (Katalog §4.3) werden **ein** Eintrag: A.1 #1 ↔ DM1, A.1 #3 ↔ AH1, A.1 #46 ↔ SH-1, A.1 #16 ↔ SZ-10, A.1 #30 ↔ SZ-08, N17 ↔ SZ-16, N19 ↔ SZ-23, N21 ↔ SZ-20. Der ältere Name bleibt Alias. Die übrigen Paare entscheidet die Trick-Messung (V10d-08).
7. **IDs** neuer R7-Sounds: `vb-<quelle>-<ID in Kleinbuchstaben>`, Quelle ∈ {`pop`, `hel`, `pio`, `ach`, `szn`, `dark`, `cw2`, `ebm`, `cr`, `ret`, `spz`} wie im Katalog. Beispiel: `vb-pio-vg1` (Vangelis) ≠ `vb-spz-vg-1` (Vogue). Das löst alle ID-Kollisionen aus Katalog §4.1. R6- und A.1-IDs bleiben.
8. **Lizenz:** EN2-11.
9. **Recht** (Linie der Quelldateien, kein Rechtsrat): eigene Melodien und Muster, keine Samples und keine Resynthese fremder Aufnahmen. Einzige Ausnahme: die gemeinfreie Choral-Melodie „Vom Himmel hoch, da komm ich her“ (1539; BELEGT laut `r7/spezial-vogue.md`: https://en.wikipedia.org/wiki/Vom_Himmel_hoch,_da_komm_ich_her). Ihre Töne in vg-v4 sind aus dem Gedächtnis geschrieben (UNBELEGT) und werden in PR-V bzw. vor dem Einbau gegen eine Notenquelle geprüft (V10P-06).
10. **Kalibrierung:** Hörprobe −18 ± 3 LUFS (trocken), PR1 und PR8; Bässe M-HANDYrel bei C2 ≥ −20 dB.
11. **Lage-Default (Rev. 2):** `sound.lage`, `sound.role` und `sound.dirAt` (Spalten im Katalog und in `vorbild-spezial.md` §1) werden übernommen; VL ist fest (Teil H) und vor der Bibliothek gebaut.
12. **★-Ausnahme (neu, EN2-25):** Ein ★-Sound mit Beleg `u` kommt ins Werk ohne Vorbild-Tag, ohne Gerät und ohne Act im Namen. Er erscheint unter „Xanders Wunsch ★“, nicht unter „Vorbild ▾“. Sein ⓘ lautet: „Dein Wunsch (Runde 9): ‚<Xanders Wortlaut, gekürzt>‘ – eigener Stil-Entwurf; wie das Original entstand, ist nicht belegt. Marken gehören ihren Inhabern, keine Verbindung.“ Mit `h` (Xanders Urteil, EN2-18) oder einem neuen Beleg bekommt er das Tag im nächsten Bibliotheks-Paket. Die Ausnahme gilt nach EN2-31 auch für C2-06 (De/Vision) und DK-05 (Static Movement), gebaut mit V10f (Rev. 3).
13. **Tor PR-V (neu):** Vor V10P und vor jedem Bibliotheks-Paket mit Vorbild-Tags (V10b, V10d, V10f, V10e) muss die Prüfrunde D.2b protokolliert sein.

### D.2 Belege je Act (Quelle sagt; Status aus den Quelldateien und Katalog §4.6)

| Act | Entscheidende Aussage | Status | Quelle | Folge |
|---|---|---|---|---|
| Isao Tomita | Moog-Pfiff aus selbstschwingendem Filter und Rauschen; Patch-Diagramm nachgebaut | Diagramm BELEGT, Bauweise WAHRSCHEINLICH → `s` | https://www.synthtopia.com/content/2021/05/14/recreating-isao-tomitas-iconic-whistle-patch/ · https://www.matrixsynth.com/2021/05/tomita-whistle-patch-tutorial.html | T1 in V10P |
| Kraftwerk (K1) | Minimoog-Bass um 1974 („Autobahn“) | Gerät BELEGT → `b` | https://hifinews.com/content/kraftwerk-autobahn-production-notes · https://mixdownmag.com.au/features/gear-rundown-kraftwerk-autobahn/ · https://en.wikipedia.org/wiki/Autobahn_(song) | K1 in V10P |
| Kraftwerk (K2) | ab 1977 („Trans-Europe Express“): Synthanorma-Sequenzer von Matten & Wiechers steuert den Minimoog; Widerspruch: ein Forumszitat sagt, ein Sequenzer sei auf keiner Aufnahme benutzt worden | BELEGT (Hersteller und Einsatz, laut `vorbild-helden.md` §3.1) → `b`; Widerspruch neutral im ⓘ | https://en.wikipedia.org/wiki/Trans-Europe_Express_(album) · https://sdiy.info/wiki/Synthesizerstudio_Bonn | K2 in V10P; `src` je **Sound**, nicht je Act (V10P-02) |
| Gary Numan | im Studio vorgefundener Minimoog; Polymoog-Preset „Vox Humana“ für Flächen | BELEGT → `b` | https://en.wikipedia.org/wiki/Are_%22Friends%22_Electric%3F · https://reverb.com/news/video-the-synth-sounds-of-gary-numan · https://musictech.com/news/gear/moog-ujam-plugin-gary-numan-vox-humana/ | NU1, NU2 in V10P |
| Vangelis | Yamaha CS-80; Ausdruck über Anschlag, Aftertouch, Ribbon | BELEGT → `b` | https://reverbmachine.com/blog/vangelis-blade-runner-synth-sounds · https://www.musicradar.com/news/blade-runner-best-synth-sound | VG1 in V10P |
| Giorgio Moroder | „I Feel Love“: Moog Modular mit Delay | BELEGT → `b` | https://www.musicradar.com/news/donna-summer-i-fee-love-best-synth-sound · https://en.wikipedia.org/wiki/I_Feel_Love | Werk „Disko-Puls“ (Tag, Hörprobe) in V10P |
| OMD | „Enola Gay“-Lead vom Korg-Micro-Preset | BELEGT → `b` | https://www.electronicsound.co.uk/features/landmarks/orchestral-manoeuvres-in-the-dark-enola-gay | N07 in V10P |
| The Human League | „Dare“-Sequenzlinien vom MC-4 | WAHRSCHEINLICH → `s` | https://www.sonicstate.com/news/2025/01/31/the-synths-used-on-dont-you-want-me/ | N11 in V10P |
| The Human League | „Being Boiled“: Korg 700S und Roland System-100 | BELEGT (Gerät) → `b`; Klang UNBELEGT | https://daily.redbullmusicacademy.com/2013/11/key-tracks-martyn-ware-being-boiled · https://www.bonedo.de/artikel/human-league-being-boiled-und-das-roland-system-100 | N10 mit neuer Hörprobe in V10d |
| Depeche Mode | „Just Can't Get Enough“ mit Jupiter-4 (nur Händler-Blog); „Enjoy the Silence“-Bass Minimoog + ARP 2600 (Nachbau-Text) | WAHRSCHEINLICH → `s` | https://www.thomann.de/blog/en/15-songs-with-a-fat-synth-sound/ · https://reverb.com/news/the-synth-sounds-of-depeche-modes-enjoy-the-silence | DM1, DM4 in V10P |
| Erasure / Vince Clarke | Arbeitsweise: MC-4 per CV/Gate, nur Analog | BELEGT → `b` | https://en.wikipedia.org/wiki/Chorus_(Erasure_album) · https://www.muzines.co.uk/articles/vince-clarke/7547 | ER1 in V10P |
| Eurythmics | „Sweet Dreams“: SH-101, getaktet vom Movement Systems Drum Computer | BELEGT → `b` | https://en.wikipedia.org/wiki/Sweet_Dreams_(Are_Made_of_This) · https://www.vintagedigital.com.au/movement-systems-drum-computer/ | EU1 in V10P |
| New Order | „Blue Monday“-Bass: Moog Source mit Powertran-Sequenzer (Live-Toningenieur Roger Wilkinson) | BELEGT (2 Quellen laut `vorbild-pop.md` §8.1) → `b` | https://en.wikipedia.org/wiki/Moog_Source · https://www.neworderonline.com/community/forums/digital-republic/26518-the-most-technologically-in-depth-article-about-new-order-s-live-sound-ever-and-it-even-mentions-the-vikings · https://bbc.in/1SC6Atc | N13 in V10P; MusicRadar ist dort Beleg für die DMX-Drums (N14), nicht für den Bass |
| a-ha | „Take On Me“-Thema auf Roland Juno-60 | BELEGT → `b` | https://www.soundonsound.com/techniques/classic-tracks-ha-take-me · https://articles.roland.com/take-on-me-a-ha · https://en.wikipedia.org/wiki/Take_On_Me | AH1 in V10P |
| Alphaville | Gold: frühe Geräte „basically toys – the cheapest monophonic synthesizers“; Geräteliste aus Lloyds Gedächtnis (u. a. PPG, Solina, Jupiter-8, MFB-Sequenzer); welcher Part von welchem Gerät: UNBELEGT | Zitat BELEGT (SE); Liste WAHRSCHEINLICH → `s` nur für „Klangwelt“ | https://www.classicpopmag.com/?p=12154 · https://fr.audiofanzine.com/synthetiseur-rack/forums/t.662742,synthes-dans-la-variete-internationale-dans-les-annees-70-et-80.html | N01, N02 in V10P |
| Alphaville | „Big in Japan“-Bass: Roland System-100M, zwei Oszillatoren eine Quinte gegeneinander verstimmt | BELEGT → `b` | https://www.songwritingmagazine.co.uk/?p=44703 · https://www.tip-berlin.de/konzerte-party/tontraeger/alphaville-remaster-interview-80er-in-berlin/ | neues Rezept „Quinten-Bass“ in V10d |
| VNV Nation | Supersaw-Klang (JP-8000, Virus) | WAHRSCHEINLICH → `s` | https://en.wikipedia.org/wiki/VNV_Nation | SZ-29 in V10P |
| DAF | Korg MS-20 mit Sequenzer SQ-10 | BELEGT → `b` | https://en.wikipedia.org/wiki/Deutsch_Amerikanische_Freundschaft · https://www.electricityclub.co.uk/?p=72597 | EB-01 in V10P |
| Nitzer Ebb | „That Total Age“ auf einem Roland SH-101 (Zitat aus zweiter Hand) | WAHRSCHEINLICH → `s` | https://en.wikipedia.org/wiki/SH-101 · https://articles.roland.com/?p=4098 | EB-04 in V10P |
| Skinny Puppy | cEvin Key: Moog Multimoog, Sequential Pro-One, „stark auf den Platten benutzt“ | BELEGT (Interview) → `b` | https://side-line.com/?p=6085 | EB-05 in V10P |
| Agonoize / Aggrotech | „saturated basslines“, Supersaw-Lead im Genre | WAHRSCHEINLICH → `s` | https://festt.io/en/genres/aggrotech · https://en.wikipedia.org/wiki/Agonoize | C2-10 in V10P |
| Kavinsky | „Nightcall“-Arp mit Chorus, Juno-Emulation | WAHRSCHEINLICH → `s` | https://reverbmachine.com/blog/how-kavinsky-created-nightcall/ | N33 in V10P |
| The Midnight | McEwans Synths auf „Heroes“ u. a. Juno-106, OB-6, Prophet-6 | BELEGT (Interviews) → `b`; Part UNBELEGT | https://www.musicradar.com/news/the-midnight-tim-mcewan-synths-plugins-interview · https://musictech.com/features/interviews/the-midnight-interview-syndicate/ | N31 in V10P |
| Carpenter Brut | Geräte 2018 und „distorted synths“ | BELEGT (Interviews) → `b` | https://vehlinggo.com/2018/12/06/carpenter-brut-interview/ · https://loudersound.com/features/carpenter-brut-interview-2022 | N39 in V10P |
| Vogue („Himmlische Klangdimensionen“, 1988) | Hülle: „the very special souds by FZ 1 (Casio)“; ob der Bass vom FZ-1 kommt: UNBELEGT (Credit „Bass“ ohne Instrument) | WAHRSCHEINLICH (SE) → `s` nur für die Klangwelt des Albums | https://www.discogs.com/de/release/4033064-Vogue-Himmlische-Klangdimensionen | VG-1, VG-2, VG-4, VG-5 in V10P; VG-3 über die ★-Ausnahme |
| Casio FZ-1 (Gerät) | Sampler mit additiver Synthese (48 Obertöne), gezeichneten Wellen, Tiefpass, 8-stufigen Hüllkurven | BELEGT | https://www.vintagesynth.com/casio/fz1.php · https://www.muzines.co.uk/articles/casio-fz-1-sampling-keyboard/1980 | Bauweise von VG-2 und VG-6 |
| And One | „I.S.T.“ aus „Fragmenten von Wörtern und Klängen“ | WAHRSCHEINLICH (Fan-Biografie) → `s` | https://www.cancioneros.com/letras/artista/2025/and-one | AO-06 in V10P |
| And One | Gerät: belegt ist nur „Naghavi arbeitet nur am Macintosh“ (Interview 2002, SE) | Synth-Modell UNBELEGT → `u` | https://www.shout.ru/exclusives/exclusive_interview_with_Steve_2002_e.htm | SZ-01, AO-01 … AO-05 über die ★-Ausnahme in V10P; SZ-02, AO-07 → OFFEN, PO-1 |
| And One | Xanders „Gamma“/„Voodoo“ = **ein** Titel „Ghama Voodoo“ (5:40) auf der Streaming-Fassung von „I.S.T.“ | BELEGT (Spotify) | https://open.spotify.com/track/4ufLTs7KdeexR2MzlXblb5 | Hörtest-Bezug für den Signal-Bass |
| Slap House (VIZE) | Bass-Technik: Säge mit Unison, sehr tiefes Filter, kurze Filter-Hüllkurve, Tonhöhen-Klick, Sidechain | BELEGT (mehrere Tutorials) → `b`; VIZE-Gerät UNBELEGT | https://www.balticaudio.net/en-us/blogs/sound-design-tutorials/how-to-make-a-slap-house-bass-like-vize-in-serum · https://monosounds.studio/how-to-make-slap-house-in-serum-2-free-presets-inside/ | SH-1, SH-2 in V10P |
| Tiga & Zyntherius | Act und Titel „Sunglasses at Night“ existieren | BELEGT (Spotify) | https://open.spotify.com/artist/22nkKzwR2y3oIST0Gw6tX9 | beide Lesarten in V10P (SH-4 Original, SH-1 Slap-House-Mix); Rückfrage B-4 entfällt |
| Tiga & Zyntherius | Jahr 2001, Electroclash | WAHRSCHEINLICH (Wikipedia „Zyntherius“, URL wie in `vorbild-spezial.md` §0; die Spotify-Künstlerseite belegt Jahr und Genre nicht) | https://www.wikipedia.com/wiki/Zyntherius | „kein Slap House“ ist eigene Einschätzung |
| Second Decay | Titel „I Hate Berlin“ existiert | BELEGT (Spotify) | https://open.spotify.com/track/45KxaiZDWCY2rxyLYQImlc | – |
| Second Decay | „I Hate Berlin“ ist der größte Hit | WAHRSCHEINLICH (ein Konzertbericht laut `spezial-slaphouse.md` §5; Spotify zeigt nur, dass der Titel existiert) | https://www.reflectionsofdarkness.com/festivals/1584-elektrisch-festival-krefeld-2007 | löst Nachtrag 1, E.1 (K2-14) |
| Second Decay | Duo Christian Purwien und Andreas Michael Sippel; Purwien als Sänger (dazu Xanders Aussage, Runde 9) | WAHRSCHEINLICH (Qobuz + Fanblog, nicht klar unabhängig, `vorbild-szene.md`) | https://www.qobuz.com/ca-en/interpreter/second-decay/9406900 · https://systemsofromance.com/blog/category/second-decay | – |
| Purwien | heute „Purwien & Kowa“; Frontmann im Projekt PURWIEN | BELEGT (eventim, laut `spezial-slaphouse.md` §5) | https://www.eventim.de/artist/purwien/ | – |
| The Frozen Autumn | „Kawai K1“: 0 Treffer in 8 Suchen; Synthex und K4 nur Equipboard | UNBELEGT → `u` | – | DK-01 über die ★-Ausnahme in V10P; DK-02, DK-04 → OFFEN, PO-1 |
| Static Movement | Synthex, PPG Wave 2.2: nur ein Suchauszug ohne eigene URL | UNBELEGT für die Zulassung (K2-12) | – | DK-05 über die ★-Ausnahme in V10f (EN2-31, Rev. 3); DK-06 → OFFEN, PO-1; A.1 #12/#13 ohne Tag |
| De/Vision (Rev. 3) | kein Gerät und kein Patch belegt (Katalog §5.2) | UNBELEGT → `u` | – | C2-06 über die ★-Ausnahme in V10f (EN2-31); C2-05 → OFFEN, PO-1 |
| Sixth June (Rev. 3) | Geräte UNBELEGT; Genre Coldwave/Minimal Wave: analoge Synths, „clinical drum machines“, mechanische Tempi | Genre WAHRSCHEINLICH → `s` (Genre-Technik, D.1 Nr. 2) | https://www.masterclass.com/articles/coldwave-music-guide (laut `vorbild-coldwave2.md` §3.1) | C2-01 Kaltfront-Bass in V10f mit Genre-Tag; C2-02, C2-03 → OFFEN, PO-1 |
| Static Movement | „Radio Station“ ist ein Titel auf „Visionary Landscapes“ (1999) | BELEGT (Spotify) | https://open.spotify.com/track/6PJEaZPToWHo0cVtPQF8wC | Xanders Frage geklärt |
| Second Decay | „nur analoge Synthesizer“ (eine Quelle) | WAHRSCHEINLICH (SE, R6) → `s` nur für die Klangwelt | https://www.qobuz.com/ca-en/interpreter/second-decay/9406900 · https://systemsofromance.com/blog/category/second-decay | SZ-23, SZ-24, N20 in V10P |
| Tiga & Zyntherius | Slap-House-Fassungen von „Sunglasses at Night“ gibt es (z. B. DJ Gollum & Mark Future) | WAHRSCHEINLICH (Spotify-Katalog laut `vorbild-spezial.md` §5, hier nicht geprüft) | https://open.spotify.com/track/5mi1Ytywbr16M0U8bu194e | Lesart „Slap-House-Mix“ = SH-1 (Technik `b`); Lesart „Original 2001“ = SH-4 (★-Ausnahme) |
| VIZE / Slap House (Reese) | „legato reese bass“, „punchy, attack-forward“, Sidechain im Genre | WAHRSCHEINLICH (SE, Genre, `vorbild-coldwave2.md` §4.4) → `s` (Technik) | Quellen in `vorbild-coldwave2.md` §4.4 | C2-13 „Reese-Hüpfer“ in V10P |

Alle übrigen Acts (Stufe 2, V10f): Status und URLs nach der jeweiligen Quelldatei (Abschnitt „Belege“) und Katalog §4.6; dieser Nachtrag ändert sie nicht, außer K2-12, K2-13, K2-34 und K2-52.

**Prüfstand der Tabelle:** Keine Zeile ist in den Runden 7–9, im Review 1 oder in Revision 2 gegen ihre URL nachgeprüft (kein Netz, N2.0.2 Nr. 3). Die Spalte „geprüft am“ wird deshalb in `katalog.json` je Tag geführt (`chk: 'JJJJ-MM-TT'`, sonst leer). Geprüft wird im Tor PR-V (D.2b).

### D.2b Tor PR-V — Prüfrunde vor der Bibliothek (neu, EN2-25)

**Wann:** nach Gruppe 14, vor V10P. PR-V ist kein Bau-Paket, sondern ein Recherche-Lauf mit Webzugang (Orchestrator oder Recherche-Agent mit frischem Suchkontingent; Schätzung 25–40 Abfragen, UNBELEGT). Es gibt kein Budget in KB.

**Was:**
1. **Stichprobe aller `b`-Zeilen** dieser Tabelle und aller Tags, die V10P, V10b, V10d und V10f setzen: die angegebene(n) URL(s) öffnen und festhalten, ob genau die entscheidende Aussage dort steht (wörtlich oder sinngleich, Zitat in CHANGES) → `chk` in `katalog.json`.
2. **Die drei Dateien ohne Web:** die mit ⚑ markierten Prüfpunkte aus `vorbild-szene.md` §9, die Prüfliste aus `vorbild-retro.md` §10 und die eK-Punkte aus `vorbild-dark.md` (Vorbemerkung Nr. 1) suchen. Gefundene Belege werden `b` bzw. `s` mit URL, nicht gefundene bleiben `u`.
3. **Notenquelle** der Choralzeile „Vom Himmel hoch“ (D.1 Nr. 9) suchen und als URL in CHANGES eintragen.
4. **Neu einstufen:** Fällt eine Aussage durch, gilt die strengere Stufe (`s` oder `u`), und EN2-08 entscheidet neu (OFFEN, PO-1 oder ★-Ausnahme). Neue Belege heben einen Sound nach Katalog §3.1 um eine Stufe.
5. **Ergebnis:** Protokoll in CHANGES (Datum, Zahl der geöffneten URLs, Ergebnis je Act, geänderte Stufen), `katalog.json` mit `chk`, neue Liste aus `v10-zulassung.mjs`.

**Ohne Netz:** Gibt es auch dann keinen Webzugang, fragt der Orchestrator Xander (Rückfrage B-11). Vorgabe: V10P beginnt trotzdem; jedes `b` ohne `chk` zählt als `s` (ⓘ „schwach belegt“), Aussagen aus den drei Dateien ohne Web bleiben `u`, und PR-V wird vor V10d nachgeholt. CHANGES vermerkt das.

- [ ] **N2-10P-00 (Rev. 2) PR-V protokolliert:** Jede `b`-Zeile von D.2 hat `chk` oder ist herabgestuft; die ⚑-Liste aus `vorbild-szene.md` §9 und die Prüfliste aus `vorbild-retro.md` §10 sind abgearbeitet (gefunden/nicht gefunden je Punkt); `v10-zulassung.mjs` läuft mit dem neuen `katalog.json` ohne Fehler; die Liste der V10P-Sounds steht in CHANGES. Ohne PR-V beginnt V10P nur mit der Rückfrage B-11.
- Bleibt nach PR-V eine `b`-Aussage ungeprüft (Seite nicht erreichbar), zählt sie in V10P-02 als `s` (ⓘ „schwach belegt“). Die Zulassung ändert sich dadurch nicht, weil `s` zugelassen ist.

### D.3 Signature-Sounds

#### D.3a Vorbild-Paket 1 (V10P): 45 Sounds und 2 Werks-Sounds

Rezepte: R6 aus `r6/n6/rezepte76.json`, R7 aus der Quelldatei (Abschnitt des Sounds, Lese-Schlüssel R6 §12.2). Hörproben: Notenlisten und `aud`-Daten in den Dateien nach D.4. „T“ = Takte der gespeicherten Probe (vor EN2-09-Kürzung).

| # | Karte | Quelle · ID | Engine · Rolle | Vorbild · Beleg | Rezept-Kern (Entwurf) | Hörprobe · BPM · Tonart · T |
|---|---|---|---|---|---|---|
| 1 | Pfeif-Stimme ★ | hel · T1 | VA · Lead | Isao Tomita · `s` | Werk „Pfeif-Lead“ (selbstschwingendes Filter) + Rauschen, Anblas-Schleifer, Hall | hel:t1 · 72 · F-Dur (Fmaj7) · 8 |
| 2 | Fahrbahn-Bass ★ | hel · K1 | VA · Bass | Kraftwerk · `b` | Oktav-Bass mit analogem Echo | hel:k1 · 116 · F-Dur · 8 |
| 3 | Rechenwerk-Sequenz ★ | hel · K2 | VA · Sequenz | Kraftwerk · `b` | Puls 30 % + Säge, LP24 650 Hz Res .55, kurze Filter-Hk, Ping-Pong 1/16 | hel:k2 · 120 · a-Moll · 4 |
| 4 | Frostmaschinen-Riff ★ (alt: Kaltfront-Riff) | pio · NU1 | VA · Riff | Gary Numan · `b` | drei Sägen (eine −1 Okt.), LP24 850, Drive .45, Phaser (VK2) | pio:nu1 · 128 · c-Moll · 4 |
| 5 | Menschenstimme-Fläche ★ | pio · NU2 | VA · Fläche | Gary Numan · `b` | Säge + Puls 40 % + Säge +1 Okt., LP12 2300, PWM-LFO, Chorus ENS, poly 6 | pio:nu2 · 112 · f-Moll · 4 |
| 6 | Sternfall-Brass ★ | pio · VG1 | VA · Lead | Vangelis · `b` | Säge + Puls 45 %, LP12 650, Filter-Attack 0,3 s, Glide 0,22 s (Ersatz Ribbon), Mod-Rad → Filter | pio:vg1 · 72 · d-Moll · 4 |
| 7 | Wanderer-Lead ★ | R6 · N07 | VA [g] · Lead | OMD · `b` | R6-Rezept | pop:n07 · 140 · a-Moll · 4 |
| 8 | Spinnen-Sequenz | R6 · N11 | VA · Sequenz | The Human League · `s` | R6-Rezept | hel:h1 · 118 · d-Moll · 4 |
| 9 | Kettenreim-Lead ★ (Alias: Ketten-Riff, A.1 #1) | pop · DM1 | VA · Lead | Depeche Mode · `s` | Puls 40 % + Säge +1 Okt., LP24 2600, Chorus I, Echo 1/8, poly 4; Rezept nach Blindvergleich mit A.1 #1 [g] | pop:dm1 · 128 · F-Dur · 4 |
| 10 | Zitter-Bass 90 ★ | pop · DM4 | VA · Bass | Depeche Mode · `s` | zwei Sägen + Puls −1 Okt., LP24 420, Zufall auf Tonhöhe ≈ ±5 ct je Note, mono | pop:dm4 · 113 · d-Moll · 4 |
| 11 | Mono-Gitter-Bass ★ | pop · ER1 | VA · Bass | Erasure · `b` | Säge + Puls 30 % + Sub, LP24 480 Res .35, Anschlag → Filter-Hk, mono, Reset | pop:er1 · 122 · A-Dur · 4 |
| 12 | Traum-Sequenzbass | ach · EU1 | VA · Bass/Sequenz | Eurythmics · `b` | Säge + Sub, LP24 600, kurze Filter-Hk, mono | ach:eu1 · 120 · a-Moll · 8 |
| 13 | Sequenzer-Bass 83 ★ | R6 · N13 | VA [g] · Bass | New Order · `b` | R6-Rezept | hel:n1 · 128 · e-Moll · 4 |
| 14 | Fjordlauf-Lead ★ (Alias: Fjord-Riff, A.1 #3) | pop · AH1 | VA · Lead | a-ha · `b` | Säge + Puls 50 % + Sub, LP24 3200, Chorus I 80 %, Ping-Pong 1/8, poly 6 | pop:ah1 · 169 · D-Dur · 4 |
| 15 | Weitblick-Fläche ★ (Xander: „Forever Young“-Fläche) | R6 · N01 | VA [g] · Fläche | Alphaville (Klangwelt) · `s` | R6-Rezept | pop:n01 · 69 · F-Dur · 4 |
| 16 | Fanfaren-Lead ★ (Xander: „Sounds Like a Melody“-Lead) | R6 · N02 | VA [g] · Lead | Alphaville (Klangwelt) · `s` | R6-Rezept | pop:n02 · 118 · G-Dur · 4 |
| 17 | Leuchtfeuer-Lead | szn · SZ-29 | VA · Lead | VNV Nation · `s` | Säge Unison 7 + Säge +1 Okt. Unison 5, LP12 4800, Hall + Echo (Variante Werk „Supersaw-Hymne“) | szn: VNV-Hörbeispiel, eigene Spur · 136 · fis-Moll |
| 18 | Schiefe Kette | ebm · EB-01 | VA · Bass/Sequenz | DAF · `b` | Säge, LP24 520 Res .55, Zufall ±14 ct je Ton, mono, Vorfilter-Hochpass `p.hpf` (VK2) | ebm:eb01 · 126 · e (Quinten) · 8 |
| 19 | Ein-Osz-Drillbass | ebm · EB-04 | VA · Bass | Nitzer Ebb · `s` | Puls 50 % + Sub, LP24 330 Res .5, sehr kurze Filter-Hk, Drive | ebm:eb04 · 130 · g-Moll · 8 |
| 20 | Pro-Schnarrbass | ebm · EB-05 | VA · Bass | Skinny Puppy · `b` | Säge + Puls −1 Okt., LP24 380 Res .6, *(P1)* Poly-Mod aus VK2, sonst Filter-Hk → Tonhöhe („Annäherung“), schneller LFO aufs Filter, Glide | ebm:eb05 · 112 · b-Moll · 4 |
| 21 | Stampf-Bass ★ | cw2 · C2-10 | VA · Bass | Agonoize (Aggrotech) · `s` | Säge + Puls 40 % −1 Okt., LP24 260 Res .35, Filter-Hk 70 ms, Spur-Drive 55 %, Pumpen 50 % | cw2: „Funkenregen“, Bass-Spur · 140 · f-Moll · 8 |
| 22 | Neon-Arp | R6 · N33 | VA · Sequenz | Kavinsky · `s` | R6-Rezept | ret:kv2 · 100 · a-Moll · 4 |
| 23 | Nachtblau-Fläche ★ | R6 · N31 | VA · Fläche | The Midnight · `b` (Gerät), Part `u` | R6-Rezept | ret:mn1 · 100 · D-Dur · 4 |
| 24 | Dunkelfahrt-Bass | R6 · N39 | VA [g] · Bass | Carpenter Brut · `b` | R6-Rezept mit Korrektur aus Nachtrag 1 (Filter-Drive 10 %, Spur-Drive 70 %) | ret:cb1 · 120 · d-Moll · 4 |
| 25 | Himmelstor-Bass ★ | spz · VG-1 | VA · Bass | Vogue · `s` | zwei Sägen + Sinus-Sub, LP24 140 Res .42, Filter-Attack 0,55 s (öffnet langsam), Chorus | vg-v1 · 88 · C-Dur |
| 26 | Achtstufen-Bass ★ | spz · VG-2 | VA · Bass | Vogue · `s` | Säge + Puls 30 % + Sub, LP24 180, zweite langsame Öffnung über die Mod-Hüllkurve | vg-v2 · 92 · a-Moll |
| 27 | Sprechende Stimme ★ | spz · VG-4 | WT `vocal` · Lead | Vogue · `s` | Tabelle `vocal` scan .67 in 0,45 s („o-a-e“), LP12 3500, Glide, spätes Vibrato | vg-v4 · 92 · C-Dur (Choralzeile 1539, D.1 Nr. 9) |
| 28 | Wau-Stimme ★ | spz · VG-5 | VA · Lead | Vogue · `s` | Säge + Puls 20 %, BP24 420 Res .75, Anschlag → Filter-Hk („wau“) | vg-v5 · 100 · a-Moll dorisch |
| 29 | Wortfetzen-Formant ★ | spz · AO-06 | WT `vocal` · Sequenz | And One · `s` | Tabelle `vocal` scan .4 in 0,15 s, BP12 1100, Sample & Hold aufs Filter | ao06 · 122 · E phrygisch |
| 30 | Klatsch-Bass ★ (übernimmt A.1 #46) | spz · SH-1 | VA · Bass | Slap House (VIZE) · `b` (Technik) | Säge Unison 3 + Sinus-Sub, LP24 90, Filter-Hk kurz (D 0,18 s), Tonhöhen-Klick 40 ms, Pumpen | sh-h1 · 124 · a-Moll · 8 |
| 31 | Klatsch-FM ★ | spz · SH-2 | FM6 · Bass | Slap House · `b` (Technik) | Alg. 5, FB 5, „Twang“-Modulator, Klick-Operator, Tonhöhen-Hk 30 ms, Pumpen (braucht V0d) | sh-h2 · 122 · fis-Moll |
| 32 | Engelschor ★ | spz · VG-3 | WT `vocal` · Fläche | Vogue · `u` (★-Ausnahme) | Tabelle `vocal` pos 0, scan .5 in 4 s (O → A), LP12 2600, Attack .7, Vibrato erst nach 1,2 s, Chorus ENS, Hall .5, poly 8 | vg-v3 · 76 · C-Dur · 4 |
| 33 | Körperbass ★ | szn · SZ-01 | VA · Bass | And One (typischer Bass) · `u` (★-Ausnahme) | Rezept `vorbild-szene.md` §4.1 | szn:sz01 (Werte in `r7/vorbild-szene-aud.json`) |
| 34 | Signalbass ★ | spz · AO-01 | VA · Bass | And One (bedrohlicher Signal-Bass, „Ghama Voodoo“) · `u` (★-Ausnahme) | Puls 22 % + Säge −1 Okt. + Sub, LP24 220 Res .62, Drive .45, Anschlag → Filter .7, Filter-D .11, LFO 2 Säge (Sync 32) → Cutoff (öffnet über 8 Takte), mono | ao01 · 122 · E phrygisch · 8 |
| 35 | Funkfeuer-Bass ★ | spz · AO-02 | VA (Sync) · Bass | And One (Lesart „Piu“) · `u` (★-Ausnahme) | Osz.-Sync, Osz. 2 +7 HT, Mod-Hk → Osz.-2-Tonhöhe (D .16), Sample & Hold 1/16, LP24 900, mono; nur mit Worklet hörbar | ao02 · 122 · e-Moll · 4 |
| 36 | Peilsender ★ | spz · AO-03 | VA + Ringmod (VK) · Bass-Effekt | And One (Lesart „metallisch“) · `u` (★-Ausnahme) | Dreieck × Dreieck +6 HT (Tritonus), Ring .6, LP12 1400, LFO 1 Rechteck 1/8 → Pegel −.5 | ao03 · 122 · E phrygisch · 4 |
| 37 | Grollbass FM ★ | spz · AO-04 | FM6 · Bass | And One (Lesart „knurrend“) · `u` (★-Ausnahme); „DX7 bei And One“ ist UNBELEGT und steht nie im ⓘ | Alg. 5, FB 6, OP 1 ← OP 2 (Anschlag 5), OP 3/4 aus, OP 5 −4, OP 6 +4 mit Rückkopplung, mono | ao04 · 122 · e-Moll · 4 |
| 38 | Doppelsägen-Oktavbass ★ | spz · AO-05 | VA · Bass | And One (typischer Bass, zweite Farbe) · `u` (★-Ausnahme) | 2 Sägen (+11 ct) + Säge −1 Okt., LP24 520 Res .4, Filter-D .14, freilaufend, Pumpen .4 (1/8) | ao05 · 132 · a-Moll · 4 |
| 39 | Klatsch-WT ★ | spz · SH-3 | WT `digital` · Bass | Slap House (VIZE) · `b` (Technik) | pos .55, scan −.4 in 0,2 s, LP24 140, Filter-Hk .55 (D .2), Tonhöhen-Klick 25 ms, Pumpen .65 | sh-h1 (geteilt mit SH-1) · 124 · a-Moll · 8 |
| 40 | Reese-Hüpfer ★ (alt: Gummi-Bass) | cw2 · C2-13 | VA · Bass (Legato-Reese) | Slap House (VIZE) · `s` (Technik) | 2 Sägen ±12 ct + Sinus-Sub 55 %, LP24 900 Res .25, Filter-Hk +30 HT (D .12), Legato, Glide 60 ms, Spur-Drive 20 %, Pumpen 70 % (1/4) | cw2:„Gummiband“ (Grundton B♭1–G2) |
| 41 | Kalter Achtel-Bass ★ (alt: Sonnenbrillen-Bass) | spz · SH-4 | VA · Bass | Tiga & Zyntherius (Original 2001) · `u` (★-Ausnahme) | Puls 35 % + Säge −1 Okt. (+4 ct), LP24 300 Res .45, Filter-Hk .45 (D .12), mono, ohne Pumpen | **neu** (eigene, gerade Achtel; V10P-17) |
| 42 | Kellerpuls-Bass ★ (Alias: Analogkeller-Bass, R6 N19) | szn · SZ-23 | VA · Bass | Second Decay · `s` (Klangwelt „nur analog“) | Rezept `vorbild-szene.md` §4.7 (N19 verfeinert) | szn:sz23 |
| 43 | Kaltlicht-Stakkato ★ | szn · SZ-24 | VA · Sequenz | Second Decay · `s` | Rezept `vorbild-szene.md` §4.7 | szn:sz24 |
| 44 | Analogkeller-Lead ★ | R6 · N20 | VA · Lead | Second Decay · `s` | R6-Rezept (Puls 45 % + Säge +7 ct, LP24 2,2 kHz, Glide 40 ms, Vibrato verzögert, Echo 1/8 punktiert) | **neu** (eigene Melodie; Katalog: „♫ fehlt“) |
| 45 | Herbstriff-Bass ★ | dark · DK-01 | VA · Bass (melodisch, hoch) | The Frozen Autumn · `u` (★-Ausnahme) | Rezept `vorbild-dark.md` (DK-01) | dark:fa „Herbstbahn“, Bass-Spur · 126 · e-Moll · 4 |
| W1 | Disko-Puls (Werk, alt „Moroder-Puls“) | Werk | VA · Sequenz/Bass | Giorgio Moroder · `b` | Werks-Rezept unverändert; nur Tag, Hörprobe, A.4-Name | pio:mo1 · 124 · e-Moll · 4 |
| W2 | Gated 84 (Werks-Kit) | Werk | Drum · Drums | kein Act-Tag (Genre nur Einschätzung) | Werks-Kit unverändert; nur Hörprobe | ret:mo2 · 108 · 4 |

★ = Xanders Wunsch laut Katalog oder `vorbild-spezial.md` (er hat genau diesen Klang oder diesen Act genannt); 37 der 45 Sounds. 9 der 45 kommen über die ★-Ausnahme (D.1 Nr. 12): Nr. 32–38, 41 und 45. **Lesarten eines Wunsches** (Katalog §4.3; Blatt „Lesarten wählen“, V10P-16): Bass mit öffnendem Filter VG-1/VG-2 · sprechende Stimmen VG-4/VG-5/VG-3/AO-06 · bedrohlicher Signal-Bass AO-01/AO-02/AO-03/AO-04 · typischer And-One-Bass SZ-01/AO-05 (die **deutschsprachige, härtere Seite** – „Deutschmaschine“/„Krieger“, `vorbild-szene.md` Klangbild – deckt **SZ-01 Körperbass** ab: 16tel mit Oktavsprung und kurzem Filter-Tock, Hörprobe sz01; SZ-02 Paradestab bleibt in PO-1; Rückfrage B-12, Rev. 3) · Slap-House-Bass SH-1/SH-2/SH-3/C2-13 · „Sunglasses at Night“ SH-4 (Original) / SH-1 (Slap-House-Mix). Nach Xanders Urteil bleibt, was er wählt; der Rest geht in Stufe 3 und wird in V10a aus dem Werk genommen (Alias bleibt für geladene Projekte, N2-10a-01).

**Gegenüber Revision 1 (Rev. 3):** Nr. 4 und 18 brauchen keine „Annäherung“ mehr, weil VK2 vor V10P gebaut ist (Phaser, Vorfilter-Hochpass `p.hpf`). **Nr. 20** braucht sie nur dann nicht, wenn VK2 die *(P1)*-Poly-Mod-Route gebaut hat; sonst trägt ihr ⓘ „Annäherung“ bis V10f-05. Nr. 32–45 sind neu.

#### D.3b Alle übrigen Signature-Sounds: Zuordnung

| Gruppe | Sounds | Ziel |
|---|---|---|
| Stufe 1, braucht Kits, neue Daten oder neue Rezepte | N09 Rhythmus-Box 78 und N14 Stotter-Kit 83 (ev3-Kits), DM2 Zählwerk-Kit 81 (Korg KR-55 + ARP-Kick, `b`), J1 Phasen-Streicher (Jarre, Eminent 310 + Small-Stone-Phaser, `b`), D1 Zufalls-Arp 82 (Duran Duran, Jupiter-4-Arp auf Zufall, `b`; als ⧉ mit eigener Zufallsfolge), EB-02 Ziegel-Kit (Front 242, Drumulator, `b`; ev3 + `fx.crush`), **EB-03 FM-Kantenstab** (Front 242, DX7, `b`; K2-52), **SC1 Spielzeug-Bass 81** (Soft Cell, SB-100, `b`; K2-52), SZ-05 Rasterzeilen-Arp ⧉ (Welle:Erdball, C64-SID, `b`), N10 Hohltropfen (Human League, `b` Gerät; neue Hörprobe), **Quinten-Bass** (Alphaville „Big in Japan“, `b`; neues Rezept und neue Hörprobe) | **V10d** |
| Stufe 1, Spielmuster (Xander L3 „Industrial-Bass-Muster“) | 9 Bass-Muster aus `vorbild-dark.md` §4 als ⧉-Clips: P1 Galopp, P2 Drill, P3 Offbeat-Roll, P3b Offbeat-Roll gerade, P4 Hammer, P5 8-Schritt-Kette, P6 Halbton-Pendel, P7 Triolen-Galopp, P8 Achtel-Oktave. Muster und „typisch für …“ sind eigener Entwurf bzw. UNBELEGT (eK); sie tragen kein Vorbild-Tag | **V10P** (Umfang 7) |
| Stufe 1 und Tier-1-Wünsche mit `u` | SZ-01, AO-01 … AO-05, DK-01, VG-3, SH-4 | **V10P** (★-Ausnahme) |
| Stufe 2 ★, Alphaville | N03 Utopia-Glas (Xander: Alphaville „Dance With Me“; Klang offen, Rückfrage B-9), Tag nur „Alphaville (Klangwelt)“ `s` | **V10d** (R6-Preset) |
| Stufe 1, Lizenz | DM3 Hallen-Stahl FM (DX7-ROM) | **OFFEN** (EN2-11) |
| Stufe 1, Spec-A.1 | A.1 #12 Kaltes Glas | V10b ohne Vorbild-Tag (K2-12) |
| R6-Presets N01–N76 (soweit nicht in V0d oder V10P) | Rezepte laut Nachtrag 1 V10d; Tags nur mit `b`/`s` | **V10d** |
| Stufe 2 mit `b`/`s` (neue R7-Sounds) | Liste in D.6.6 | **V10f** |
| Stufe 2 ★ mit `u`, Act aus Runde 7/8 ohne Werks-Sound (Rev. 3, EN2-31) | C2-06 Oktav-Pumpbass (De/Vision), DK-05 Wellenkante-Bass (Static Movement) | **V10f** (★-Ausnahme) |
| Stufe 2 mit `u`, Acts, die Xander genannt hat | SZ-02, AO-07 Schaltwerk-Kit, C2-02, C2-03, C2-05, DK-02, DK-04, DK-06, SZ-14, SZ-15, SZ-19 (Rev. 3: ohne C2-06, DK-05 → V10f; ohne SZ-20 = N21 im Werk, K2-67) | **OFFEN**, PO-1 |
| Stufe 2 mit `u`, als R6-Preset schon im Werk (Rev. 3, K2-67) | SZ-20 Dämmerungs-Chor = **N21** (D.1 Nr. 6), gebaut in V10d mit den R7-Werten von SZ-20, **ohne Vorbild-Tag** (EN2-08-Ausnahme); Xanders Urteil `h` dazu wie bei den ★-Sounds im Werk (D.8 „Urteil“) | **V10d** |
| Stufe 2 mit `u`, übrige Acts | z. B. DK-11, DK-24, DK-31, EB-11 | **OFFEN** (nur Katalog) |
| Stufe 2, Lizenz | N38 Neon-Zinken (ROM „E.PIANO 1“) | **OFFEN** (EN2-11) |
| Stufe 3 | Liste Katalog §3.3, außer SH-3 und SH-4 (★, V10P) | nicht ins Werk; Aufstieg nur mit neuem Beleg oder Xanders Wunsch (Katalog §3.1) |

### D.4 Hörproben-Dateien (am Bau-Ort nötig, EN2-17)

`r7/pop-work/aud-blocks.json` · `r7/helden-work/aud-blocks.md` · `r7/pioniere-work/aud-blocks.json` · `r7/achtziger-work/aud-achtziger.json` · `r7/vorbild-szene-aud.json` · `r7/vorbild-dark-aud.json` · `r7/vorbild-coldwave2.md` (Notenlisten im Text) · `r7/ebm-work/aud-ebm.json` · `r7/cold-retro-work/aud-blocks.json` · `r7/retro-work/aud-retro.json` · `r7/spezial-andone-aud.json` · `r7/vogue-work/aud-out.md` · `r7/slaphouse-work/aud-out.md`. Anschlag in `aud.notes` als 0–1 (Rohdaten 1–127 umrechnen, Katalog §4.8). Dazu (Rev. 2) `r7/andone-work/aud-blocks.md` (Tempo und Tonart der ao-Proben). Neu zu schreiben (eigene Melodien, EN2-09): SH-4 und N20 (V10P), N10 und Quinten-Bass (V10d).

### D.5 NEU V10P — Vorbild-Paket 1 (Rev. 2)

**Ziel.** Xander hört die wichtigsten belegten Vorbild-Klänge und zuerst seine persönlichen Tier-1-Wünsche (Vogue, And One, Tiga & Zyntherius samt Slap-House-Mix, VIZE, Second Decay, The Frozen Autumn), jeweils mit einer Hörprobe, die zeigt, wofür der Klang gedacht ist (P5, L1, V). Gebaut wird mit allen Engines und Bausteinen, die nach Gruppe 14 da sind (VA, FM6 mit FM-Feld, WT, Kits, VK, VK2); kein V10P-Sound braucht Additiv (V9a, Rev. 3, K2-68).

**Tor.** PR-V ist protokolliert (D.2b, N2-10P-00) oder die Rückfrage B-11 ist beantwortet.

**Umfang.**
1. Die 45 Sounds aus D.3a und die zwei Werks-Sounds W1, W2. Parameter wörtlich aus der Quelle; fehlt ein Baustein trotzdem, steht „Annäherung“ im ⓘ.
2. Daten nach D.6.5: `role`, `style`, `aud` (EN2-09), `info.tags` mit `beleg` und `src` (URL); ★-Sounds tragen `info.star`; die 9 Sounds der ★-Ausnahme tragen kein Vorbild-Tag, sondern den ⓘ-Text nach D.1 Nr. 12.
3. **▶ Hörprobe** über die Vorhör-Stimme aus V0b (`previewStart`): Transport steht → „kurz“ in Original-Tempo und Original-Tonart; Transport läuft → ab der nächsten Zählzeit im Song-Tempo, transponiert auf den Grundton von Szene bzw. Träger (Tongeschlecht bleibt, §12.3), in der Lage des Sounds (`sound.lage`, Teil H). Halten → „ganz“.
4. **Bibliothek:** Chip „Vorbild ▾“ (Acts mit ≥ 1 zugelassenem Tag) und „Xanders Wunsch ★“; Engine-Filter bleibt vorn (EN-04); ⓘ nach D.1 Nr. 4 bzw. Nr. 12.
5. A.4-Umbenennung für W1 (Moroder-Puls → Disko-Puls, Alias) und die Namen aus D.1 Nr. 5.
6. **Blatt „Lesarten“** (Bibliothek → „Xanders Wunsch ★“ → [Lesarten]): je Wunsch die Lesarten aus D.3a nebeneinander mit ▶; nur Anhören, keine Datenänderung. Xanders Wahl gibt der Orchestrator an V10a weiter (N2-10a-01).
7. **Hörtest-Projekt PO-1** (D.8) als **mehrere** Projektdateien `hoertest-po1-<act>-<n>.json`, nicht in der App-Datei: je Datei ein Act, Format 4, **höchstens 7 Synth-Klänge** auf den Synth-Spuren 1–6 und MELODIE (je ein Klang) und höchstens 1 Kit auf DRUMS (Spec §4.11: `S.tracks` ≤ 8 mit festen Indizes; Rev. 3, K2-66). Szene k spielt nur die Hörprobe des k-ten Synth-Klangs (Spur-Reihenfolge `S.ui.order` ohne DRUMS); die Kit-Hörprobe läuft in der letzten belegten Szene.
8. **Spielmuster ⧉ (Xander L3):** die 9 Bass-Muster aus D.3b als Clip-Vorlagen (`SQ_PATTERNS`, je 1 Takt, 16 Schritte bzw. 12 bei P7, Grundton relativ, Anschläge nach `vorbild-dark.md` §4). Erreichbar über Bibliothek → Chip „Muster ⧉“. Ein Tipp legt das Muster als Clip in den gewählten **leeren** Slot der aktuellen Spur, sonst in den nächsten freien; nie überschreiben, nie automatisch (Regel Spec §12.5, die V10P damit vorzieht); Toast [Rückgängig]. Dazu tragen EB-01 (P5), EB-04 (P2), EB-05 (P6) und C2-10 (P4) ihr Muster als `clip` (⧉ in der Liste, Toast „Bringt eine Sequenz mit · [In Slot legen] [Rückgängig]“).

**Nicht-Umfang.** Weitere Kits außer W2 (V10d); weitere ⧉-Presets (V10b, V10d); DX7-ROM-Sounds (EN2-11); Lektionen und Demos; `aud.band`, `aud.alt`; Stufe-2-Sounds ohne ★ (V10f).

**Berührungspunkte.** `SQ_FACTORY` (kompakt kodiert), Bibliothek-Ansicht und Vorhören aus V0b, `info`, Projekt-Import (`importProject`) und Format 4 (V2a) für PO-1, Clip-Slots und Undo (`clip`) für Muster ⧉, Lage-Stufe (VL) beim Vorhören.

**Dauer** 9–10,5 h in zwei Bau-Abschnitten wie V0d (1: Daten, ▶, Filter, ⓘ, Sounds 1–31, W1, W2; 2: Sounds 32–45, Lesarten-Blatt, PO-1, Muster ⧉), eine Version · **App-Version** 4.47.0 · **Budget** +72 KB.

**Abnahme-Checkliste**
- [ ] V10P-01 Alle 45 Sounds sind da, jeder mit `role`, `style`, `aud`; die 36 Sounds mit Beleg tragen `info.tags` (`beleg` ∈ {`b`, `s`}, `src` mit URL), die 9 Sounds der ★-Ausnahme tragen kein Vorbild-Tag, aber `info.star` und den ⓘ-Text nach D.1 Nr. 12. W1 hat Tag und Hörprobe, W2 nur die Hörprobe. Klänge von W1 und W2 bitgleich zu vorher (max |Δ| ≤ 1e-6).
- [ ] V10P-02 Kein Tag mit `u` oder `e`; kein Beleg, dessen einzige Quelle Equipboard ist (Prüfskript gegen `katalog.json` und D.2). `src` wird **je Sound** geprüft (die URL muss die Aussage dieses Sounds tragen, z. B. K2 → Trans-Europe-Express-Quellen). Ein `b` ohne `chk` (D.2b) erscheint im ⓘ als „schwach belegt“.
- [ ] V10P-03 Jedes ⓘ mit Vorbild enthält den Pflichtsatz, den Belegsatz nach D.1 Nr. 4 und „erinnert an … (Stil)“; kein Gerätename ohne `b`/`s` für genau dieses Gerät; kein „so klingt …“. Jedes ⓘ der ★-Ausnahme lautet nach D.1 Nr. 12 und nennt kein Gerät.
- [ ] V10P-04 Namensprüfung (A.4 + A.13 + Tabelle VORBILD + Katalog §4.2, ganze Wörter) und Doppel-Check (`r6/n6/doppel-check.mjs`, angepasst) bestanden; DM1/A.1 #1, AH1/A.1 #3, SH-1/A.1 #46 und SZ-23/N19 sind je ein Eintrag mit Alias.
- [ ] V10P-05 ▶ bei stehendem Transport: Hörprobe im Original-Tempo und in Original-Tonart (`noteLog`); bei laufendem Transport: Start an der nächsten Zählzeit, Song-Tempo, transponiert auf den Szenen- bzw. Träger-Grundton; bei stehendem Transport Tipp bis Klang ≤ 150 ms (M-ZEIT); Halten spielt „ganz“. Tipp auf den Namen lädt stumm (U-01).
- [ ] V10P-06 Hörproben (Skript): `len` ≤ 8, „ganz“ ≤ 16 s, „kurz“ ≤ 8 s (beide nach EN2-09 mit letztem Takt), kein Takt gleich seinem Vorgänger, letzter Takt eine Wendung nach der Definition in EN2-09 (Rev. 3), keine Note über das Ende. CHANGES vermerkt je Probe „eigene Melodie“; für vg-v4 die Notenquelle der Choralzeile (URL aus PR-V), sonst wird T2–T3 neu geschrieben.
- [ ] V10P-07 Pegel: Hörprobe −18 ± 3 LUFS trocken; PR1 und PR8; Bässe M-HANDYrel bei C2 ≥ −20 dB. Verfehlt ein Sound eine Grenze, wird das Rezept nachgestimmt (Wert und Grund in CHANGES), nicht die Grenze.
- [ ] V10P-08 Filter „Vorbild ▾ → a-ha“ liefert genau die Sounds mit diesem Tag (Vergleich mit den Daten); „Xanders Wunsch ★“ genau die Sounds mit ★ in D.3a (in V10P 37); N0b-01 (Engine-Filter) bleibt erfüllt.
- [ ] V10P-09 Jede PO-1-Datei lädt über Menü → Projekt → Import als **neues** Projekt; das offene Projekt bleibt gespeichert und deep-equal. Je Datei ≤ 7 Synth-Klänge auf den Synth-Spuren 1–6 und MELODIE (je ein Klang) + höchstens 1 Kit auf DRUMS; Szene k spielt nur die Hörprobe des k-ten Synth-Klangs (`S.ui.order` ohne DRUMS), die Kit-Hörprobe in der letzten belegten Szene (Rev. 3); je Datei nur **ein** Act; keine Vorbild-Tags und keine Vorbild-Namen; je Datei ≤ 200 KB. Die Summe der Dateien deckt genau die Liste D.8 ab (Skript).
- [ ] V10P-10 `aud`, `role`, `style` und `info` zählen nicht zum `soundHash`; alte Projekte laden und klingen bitgleich.
- [ ] V10P-11 Budget ≤ +72 KB; Startzeit-Abnahme; Regression und DoD.
- [ ] V10P-12 iPhone-Prüfpunkte im Gruppen-Stand (EN2-15): (1) Bibliothek → „Xanders Wunsch ★“ → ▶ Himmelstor-Bass (das Filter öffnet sich langsam); (2) [Lesarten] → „bedrohlicher Signal-Bass“: die vier Lesarten nacheinander anhören und eine oder zwei wählen; (3) Vorbild ▾ → „a-ha“ → ▶ Fjordlauf-Lead; (4) mit laufendem Song ▶ auf Zitter-Bass 90 → spielt im Song-Tempo; (5) die PO-1-Dateien nacheinander importieren und je Sound sagen, ob er an das Vorbild erinnert; (6) Muster ⧉ → „Galopp“ in einen leeren Slot legen und mit Stampf-Bass spielen.
- [ ] V10P-13 Spielmuster: Alle 9 Muster sind über „Muster ⧉“ ladbar, je 1 Takt (≤ 2 Takte), laufen mit jedem Stufe-1-Bass aus V10P und folgen ⇅ TRANSPONIEREN; ein belegter Slot bleibt deep-equal (Regel §12.5); EB-01, EB-04, EB-05, C2-10 bieten ihr Muster per Toast an. Muster sind eigene Muster (D.1 Nr. 9); CHANGES vermerkt das.
- [ ] V10P-14 ★-Ausnahme: Die 9 Sounds (D.3a Nr. 32–38, 41, 45) erscheinen unter „Xanders Wunsch ★“ und nicht unter „Vorbild ▾“; ihr Name nennt keinen Act; ein Skript gegen `katalog.json` bestätigt für jeden `u` oder `h` – bei `h` muss das Tag „erinnert an … (Stil)“ ohne Gerät gesetzt sein.
- [ ] V10P-15 Tor: CHANGES enthält vor dem ersten Bau-Schritt das PR-V-Protokoll (N2-10P-00) oder Xanders Antwort auf B-11.
- [ ] V10P-16 Blatt „Lesarten“: alle 6 Gruppen aus D.3a vorhanden, jede Lesart mit ▶; das Blatt ändert keine Daten (`project()` deep-equal); M-PLATZ in P1–P3 und L1.
- [ ] V10P-17 Die neuen Hörproben von SH-4 (Kalter Achtel-Bass) und N20 (Analogkeller-Lead) erfüllen V10P-06; CHANGES vermerkt „eigene Melodie, kein Bezug auf eine Original-Melodie“.

**Tests.** `v10p-daten.mjs` (Zulassung, ★-Ausnahme, Namen, Hörproben-Regeln), `v10p-pegel.mjs` (LUFS, PR1, PR8, M-HANDYrel), `v10p-ui.mjs` (▶, Filter, ⓘ, Lesarten, Muster ⧉), `v10p-po1.mjs`.

**Risiken.** Nichts ist angehört; Xanders Urteil entscheidet über die Lesarten und darüber, ob ein ★-Sound sein Vorbild trifft. Die Rezepte der R7-Sounds sind ungemessen (Pegel und Bässe am Handy-Lautsprecher können nachgestimmt werden müssen). 45 Sounds in einem Paket sind viel; deshalb zwei Bau-Abschnitte und kein neuer Baustein im Paket.

### D.6 Änderungen an V10a, V10b, V10d, V10e, VK, §12.8 und neue Pakete VK2, V10f

#### D.6.1 V10a (ändert N10a aus Nachtrag 1)

- V10a baut auf V10P auf: `aud`, `info.tags`, ▶ und der Chip „Vorbild ▾“ sind schon da. V10a ergänzt die volle Ansicht (§12.2), „Mein Clip“ (§12.3), eigene Sounds mit Hörprobe (§12.4) und die Tiefe-Zeile `Stil ▾ Vorbild ▾`.
- **Tabelle VORBILD** = alle Acts mit mindestens einem zugelassenen Sound (`b`, `s`, `h`), Anzeigenamen aus dem Katalog. Sie ersetzt „wörtlich aus R6 §11, Gruppen 1–3“. Acts ohne zugelassenen Sound erscheinen nicht.
- [ ] **N2-10a-01** Xanders Wahl der Lesarten (D.3a, Hinweis unter der Tabelle) ist umgesetzt: nicht gewählte Lesarten sind aus dem Werk entfernt; ein Projekt, das sie enthält, lädt und klingt bitgleich (volle Kopie im Projekt), `loadPreset(t, alterName)` meldet „nicht mehr im Werk“.
- [ ] **N2-10a-02** N10a-02 gilt für **jedes** Act der Tabelle VORBILD (nicht nur Depeche Mode).

#### D.6.2 V10b (ändert §12.6 und Anhang A.1)

- A.1-Presets tragen ein Vorbild-Tag nur nach EN2-08; sonst ohne Tag.
- **Doppel:** A.1 #1, #3 und #46 baut V10b nicht neu (sie sind DM1, AH1, SH-1 aus V10P; Alias). A.1 #16 und #30 baut V10b gleich mit den Werten und Hörproben von SZ-10 bzw. SZ-08 (`r7/vorbild-szene.md`).
- A.1 #13 heißt „Eiszeit-Streicher“. A.1 #12 und #13 tragen kein Static-Movement-Tag (K2-12).
- **⧉ (§12.5):** Die Lade-Regel und der Toast „Bringt eine Sequenz mit“ sind seit V10P da (D.5 Umfang 7); V10b nutzt sie für die A.1-⧉-Presets. V10b-03 bleibt als Regressionspunkt.
- **§12.6, Absatz „Weihnachtsalbum“** ist überholt und lautet neu: „Das Album ‚Himmlische Klangdimensionen‘ (Vogue, 1988) ist gefunden; laut Hülle stammen die Klänge vom Casio FZ-1 (WAHRSCHEINLICH, https://www.discogs.com/de/release/4033064-Vogue-Himmlische-Klangdimensionen). Gruppe E bleibt eine Annäherung an den CZ-Charakter; das Vogue-Tag tragen nur die VG-Sounds (V10P).“

#### D.6.3 V10d (ändert Nachtrag 1, A.12 V10d)

- **Umfang:** Die R6-Presets N01–N76 wie in Nachtrag 1, **ohne** die in V0d gebauten (N63–N70) und **ohne** die zehn aus V10P (N01, N02, N07, N11, N13, N19 = SZ-23, N20, N31, N33, N39). N17 und N21 werden mit den R7-Werten und -Hörproben von SZ-16 bzw. SZ-20 („Dämmerungs-Chor“) gebaut; N21/SZ-20 trägt kein Vorbild-Tag (Beleg `u`, EN2-08-Ausnahme), bis Xander `h` gibt (K2-67, Rev. 3). Dazu der Rest von Stufe 1 aus D.3b: DM2, J1, D1 ⧉, EB-02, EB-03, SC1, SZ-05 ⧉, N10 (neue Hörprobe), **Quinten-Bass** (neues Rezept und neue Hörprobe nach dem Beleg in D.2; eigener Entwurf).
- **Tags** aller R6-Presets nach EN2-08 und der Skala aus Katalog §4.6 (z. B. N11 MC-4 nur `s`, N16 Prophet-5 nur `s`).
- **Dauer** 5–6 h · **App-Version** 4.51.0 · **Budget** +113 KB (+3 KB für EB-03 und SC1, K2-52).
- V10d-01 lautet: „Alle Presets der Umfangsliste sind vorhanden …“; V10d-04: „… für jedes Act der Tabelle VORBILD ≥ 1 Sound“. Die übrigen V10d-Punkte bleiben. Zusätzlich:
- [ ] **N2-10d-01** Kein **neuer R7-Sound** der Katalog-Stufe 3 ist im Werk (Skript gegen `katalog.json`). R6- und A.1-Presets der Stufe 3 bleiben nach der Ausnahme in EN2-08, mit Vorbild-Tag nur bei `b`/`s`.
- [ ] **N2-10d-02** N10 und der Quinten-Bass haben Hörproben nach EN2-09; der Quinten-Bass zeigt seinen Trick: Zwei Oszillatoren im Abstand von 7 Halbtönen ±5 ct (Spektral-Spitzen bei f und 1,498 · f).

#### D.6.4 NEU VK2 — Vorbild-Bausteine

**Ziel.** Bausteine, die belegte Vorbild-Klänge brauchen: Phaser und Flanger (Jarre: Eminent 310 durch einen Small-Stone-Phaser BELEGT, RMI meist durch einen Flanger WAHRSCHEINLICH, `r7/vorbild-helden.md` §5.1: https://en.wikipedia.org/wiki/Equinoxe · https://hifinews.com/content/jean-michel-jarre-equinoxe-production-notes · https://www.sonicstate.com/news/2016/02/17/worlds-first-digital-synth-revived-for-reason/), ein Hochpass vor dem Filter (für MS-20-artige Bässe; dass der MS-20 Hoch- und Tiefpass hintereinander hat, ist hier eK, ungeprüft), ein Bitcrusher für Sample-Drums (Front 242: Drumulator und Emulator II BELEGT, https://www.bonedo.de/artikel/die-praegenden-synthesizer-von-front-242 · https://www.gearnews.com/front-242-most-used-synths-drum-machines-and-sounds; die körnige Klangwirkung ist eK), *(P1)* Poly-Mod (Pro-One BELEGT bei Skinny Puppy, das Verfahren ist eK).

**Befund (Quelldateien):** Phaser, Flanger, Hochpass vor dem Hauptfilter und Bitcrusher fehlen in der App (`vorbild-helden.md` §9, `vorbild-ebm-dark.md` §6, `vorbild-dark.md` §6).

**Umfang.** Alle neuen Schlüssel sind neutral bzw. aus (I-10).
1. Spur-Effekt **Phaser** `fx.phaser = {stages: 4|6, rate 0,05–2 Hz, depth 0–1, fb −0,9…0,9, mix 0–1}` (Allpass-Kette).
2. Spur-Effekt **Flanger** `fx.flanger = {delay 0,5–5 ms, depth 0–1, rate 0,05–5 Hz, fb −0,9…0,9, mix 0–1}`.
3. **Vorfilter-Hochpass** `p.hpf = {on, cutoff 20 Hz–2 kHz, res 0–0,7}`, 12 dB/Okt., vor dem Hauptfilter jeder Stimme.
4. **Bitcrusher als Spur-Effekt** `fx.crush = {bits 16 → 4, rate ÷1 … ÷16, mix 0–1}` für **alle** Spuren, auch Drums. Ersetzt VK Punkt 7 (`p.crush`, P1) und VK-08.
5. *(P1)* Mod-Vorlage **Poly-Mod** (Filter-Hüllkurve und Osz. 2 → Frequenz Osz. 1) im Mod-Picker, nutzt VK `ofm`.
6. MOD-R1: alle neuen stetigen Werte sind Mod-Ziele und morphbar (N6a-01).

**Nicht-Umfang.** Zweites volles Filter je Stimme, Gitarre, Sampler.

**Berührungspunkte.** Spur-Effektkette (auch Drum-Spur), Worklet-Stimme (Vorfilter), `PD` und `normalizeSound`, FX-Seite, `MODT`, Hilfe.

**Dauer** 4–5 h · **App-Version** 4.38.0 · **Budget** +30 KB.

**Abnahme-Checkliste**
- [ ] VK2-01 Alles aus = bitgleich: Werks-Sounds und Demo offline, max |Δ| ≤ 1e-6 gegen den Stand nach VK.
- [ ] VK2-02 Phaser (4 Stufen, depth 1, fb 0, mix 0,5) auf weißes Rauschen: ≥ 2 Kerben ≥ 12 dB tief; bei rate 0,5 Hz wandert die tiefste Kerbe über ≥ 1 Oktave.
- [ ] VK2-03 Flanger (delay 2 ms, fb 0,7, mix 0,5) auf Rauschen: Kammabstand = 1/delay ± 5 %, Kerbtiefe ≥ 15 dB.
- [ ] VK2-04 Hochpass mit Res 0: Steilheit 11–13 dB/Okt. (gemessen bei ½ und ¼ des Cutoffs), Durchlass ±1 dB.
- [ ] VK2-05 Bitcrusher: 4 Bit → Signal-Rausch-Abstand ≤ 30 dB; rate ÷8 → Alias-Anteile ≥ −30 dB; mix 0 = bitgleich; wirkt auf der Drum-Spur.
- [ ] VK2-06 MOD-R1: Abdeckungs-Skript V5d-01 bleibt bei 100 %; LFO → Phaser-Rate und → `p.hpf.cutoff` hörbar (H-1).
- [ ] VK2-07 CPU (Xeon): 4 Spuren mit Phaser, Flanger und Crush an ≤ +3 Prozentpunkte gegenüber aus.
- [ ] VK2-08 Ein- und Ausschalten jedes Effekts bei klingender Note besteht M-KLICK; M-PLATZ der FX-Seite.
- [ ] VK2-09 Regression und DoD (Worklet-ASCII).

**Tests.** `vk2-fx.mjs` (Node-Offline), `vk2-ui.mjs`. **Risiken.** CPU am iPhone ungemessen.

#### D.6.5 §12.8 Daten (ersetzt den Block)

```js
Sound += { role, style,
  aud?: { bpm, key:{root, scale}, len /* Takte ≤ 8 */, kurz? /* Takte; sonst nach EN2-09 */,
          notes:[[b, d, n, v, a?]] /* ≤ 512; v = Anschlag 0–1 */, drums?:{kit, pattern},
          band?:[{sound, notes}] /* (P1), −9 dB */, alt?:[…] /* (P1) */ },
  clip?: { len, notes } /* ⧉ */,
  info?: { tags:[{ k:'vorbild'|'geraet'|'genre', id, beleg:'b'|'s'|'h', src?:url, datum?:'JJJJ-MM-TT' /* bei h */ }],
           star?: 1 /* ★, D.1 Nr. 12 */, text? } }
```
- In Werks-Daten gibt es kein `beleg:'u'` und kein `'e'` (EN2-08). Nachtrag 1 (N10a) erlaubte `b|s|e|u`; das gilt nur noch für geladene alte Projekte.
- `star: 1` markiert Xanders Wunsch (★). Sounds der ★-Ausnahme (D.1 Nr. 12) tragen `star` ohne Vorbild-Tag; ihr ⓘ-Satz steht in `text`.
- Schätzung: ≈ 1,45 KB je Preset mit Hörprobe (Nachtrag 1: 110 KB für 76).

#### D.6.6 NEU V10f — Vorbild-Paket 2 (Katalog-Stufe 2)

**Ziel.** Die zweite Charge belegter Vorbild-Sounds, über „Vorbild ▾“ erreichbar; dazu (Rev. 3, EN2-31) je ein ★-Sound für De/Vision und Static Movement unter „Xanders Wunsch ★“.

**Umfang.**
1. Alle neuen R7-Sounds der Katalog-Stufe 2 mit Beleg `b`, `s` oder `h`, ermittelt mit dem Skript `v10-zulassung.mjs` aus `katalog.json` (Skala D.1 Nr. 1). Erwartete Liste (Stand 17.10.; maßgeblich ist das Skript): hel·K4, hel·D2, pio·MO3, pio·SU1, pio·UV1, pio·YM1, pop·OM1, pop·DM5, pop·HL2, pop·YZ2, pop·ER3, ach·TF2, ach·IG1, SZ-06, SZ-07, SZ-09, SZ-13, SZ-30 ⧉, EB-06, EB-07, DK-07, C2-01, C2-09, C2-12, CR-01, CR-13, CR-16, CR-25, ret·MN3, VG-6 „Sinus-48-Glocke“ (Additiv aus V9). Nicht mehr in V10f: SC1 und EB-03 (Stufe 1 → V10d, K2-52), SZ-24 und C2-13 (Xanders Wünsche → V10P).
2. Tags und Hörproben für Werks- und A.1-Sounds der Stufe 2 nur mit `b`/`s` (z. B. Ensemble-Streicher, Weite 82, DCO-Fläche, DCO-Streicher, Kaskaden-Bass, Zweipol-Brass).
3. *(P1)* EB-05 bekommt die Poly-Mod-Route, falls VK2 sie gebaut hat; sonst bleibt „Annäherung“. NU1 und EB-01 haben ihren Baustein schon in V10P (VK2 liegt davor).
4. Sounds, die Xander in PO-1 mit „ja“ bewertet hat (`h`), wenn sie zu Stufe 1 oder 2 gehören.
5. **★-Ausnahme (Rev. 3, EN2-31):** C2-06 Oktav-Pumpbass (De/Vision, VA, Hörprobe cw2:„Leuchtturm“, Bass-Spur) und DK-05 Wellenkante-Bass (Static Movement, WT, Hörprobe dark:sm, Bass-Spur) nach D.1 Nr. 12: ohne Vorbild-Tag, ohne Act im Namen, `info.star` und ⓘ-Text „Dein Wunsch (Runde 8): ‚…‘ – eigener Stil-Entwurf …“. Rezepte wörtlich aus `vorbild-coldwave2.md` bzw. `vorbild-dark.md`.

**Nicht-Umfang.** Stufe 3; OFFEN ohne `h`; neue Rezepte (nur Nachstimmen).

**Dauer** 5–6 h · **App-Version** 4.52.0 · **Budget** +58 KB (+3 KB für C2-06 und DK-05, Rev. 3).

**Abnahme-Checkliste**
- [ ] V10f-01 Alle Sounds der Skript-Liste sind da, jeder mit `role`, `style`, `aud` und `info.tags`; die Liste steht in CHANGES.
- [ ] V10f-02 Zulassung: kein `u`/`e`, kein neuer R7-Sound der Stufe 3, kein Equipboard-only-Beleg (Skript).
- [ ] V10f-03 Pegel und Hörproben wie V10P-06 und V10P-07.
- [ ] V10f-04 Namen und Doppel wie V10P-04; die verwechselbaren Namen aus Katalog §4.2 sind geprüft und entschieden (CHANGES).
- [ ] V10f-05 *(P1)* EB-05 zeigt den Poly-Mod-Trick im Vergleich an gegen aus (sinngemäß VK2-02); ⓘ ohne „Annäherung“.
- [ ] V10f-06 Budget ≤ +58 KB; Startzeit-Abnahme; Regression und DoD.
- [ ] V10f-07 (Rev. 3) ★-Ausnahme: C2-06 und DK-05 erscheinen unter „Xanders Wunsch ★“, nicht unter „Vorbild ▾“; ihre Namen nennen keinen Act; ⓘ nach D.1 Nr. 12; Hörprobe nach EN2-09; ein Skript gegen `katalog.json` bestätigt `u` oder `h`. Danach hat jeder in Runde 7/8 genannte Act mindestens einen Werks-Sound mit Tag oder ★ (Liste in CHANGES).

#### D.6.7 V10e (ändert Nachtrag 1, A.12 V10e)

- **10 Demos** nach D.7 statt der 9-Genre-Tabelle. Jedes Demo ist eine **Song-Zeitleiste mit Teil-Marken** (EN7-01) statt der Kette A A B B.
- Nur zugelassene Sounds (Werk, A.1, R6, V10P, V10d, V10f). Steht im Bauplan ein Sound aus OFFEN oder ein neuer R7-Sound der Stufe 3, nimmt der Bau den Sound **gleicher Rolle und naher Lage** aus der Ersatz-Tabelle `v10e-ersatz.json`; jede Ersetzung mit Grund in CHANGES. Die Noten der Hörproben bleiben, soweit die Lage passt.
- Demo-Namen sind eigene Namen (D.7); die Demo-Info nennt nur das Genre.
- V10e-01: „Die Liste zeigt 10 Demos“. V10e-02: „Jedes Demo spielt seine ganze Zeitleiste ohne Konsolenfehler; `songKey()` und Tempo stimmen; jede Spur hat RMS > −40 dBFS dort, wo sie spielt; die Marken tragen die Teil-Namen des Bauplans.“ Die übrigen V10e-Punkte bleiben. Zusätzlich:
- [ ] **N2-10e-01** Kein Sound aus OFFEN und kein neuer R7-Sound der Stufe 3 in einem Demo (Skript); jede Ersetzung steht in CHANGES.
- **Dauer** 6 h (statt 5) · **App-Version** 5.0.0 · **Budget** +60 KB.

#### D.6.8 VK (ändert Nachtrag 1, A.10)

- Punkt 7 (*(P1)* Bitcrusher `p.crush`) und VK-08 entfallen; der Bitcrusher kommt als Spur-Effekt mit VK2.

### D.7 Demo-Baupläne (verbindlich für V10e; Baupläne sind eigener Entwurf der Quelldateien)

| # | Genre | Demo (Bauplan-Quelle) | Tempo · Tonart | Teile in Takten | Kennzeichen | Ersatz nötig (Beispiele) |
|---|---|---|---|---|---|---|
| 1 | Industrial | „Rostlicht“ (`vorbild-dark.md` D3) | 118 · f-Moll | Intro 8 · Strophe 16 · Refrain 16 · Mittelteil 8 · Refrain 16 · Outro 8 | raue Bässe, Rauschen mit Zufallssprüngen, verhallte Metall-Snare, Streicher im Refrain | DK-20 → EB-05; DK-21 … DK-26 → Werk/V10f gleicher Rolle |
| 2 | EBM | „Gleichschritt“ (`vorbild-dark.md` D2) | 124 · a-Moll | Intro 4 · A 16 · B 8 · A 16 · Break 8 · B 8 · A 16 | ein Akkord über lange Strecken, 16tel-Bass, Klatschen statt Snare, Metall auf Offbeats | DK-15 → EB-04; DK-18 → EB-01; DK-14 → EB-02; DK-12 → EB-03 |
| 3 | Cold Wave | „Glasherbst“ (`vorbild-dark.md` D1) | 126 · e-Moll | Intro 8 · Strophe 16 · Refrain 16 · Zwischenspiel 8 · Strophe 8 · Refrain 32 · Outro 8 | hoher Chorus-Bass als Melodie, Achtel-Hats, Echo-Lead, Dur-Dominante im Refrain | DK-02, DK-03, DK-04, DK-06 → CR-01, C2-01, A.1 #12, A.1 #14 (DK-01 ist über die ★-Ausnahme im Werk) |
| 4 | New Wave | „Kathedrale 81“ (`vorbild-pop.md` 12.3) | 140 · a-Moll, Bridge im 12/8-Gefühl | Intro 4 · Strophe 8 · Refrain 8 · Strophe 8 · Refrain 8 · Bridge 8 · Refrain 8 · Outro 4 | Refrain ohne Gesang, Chor aus einzeln einsetzenden Stimmen, Wechsel ins Walzer-Gefühl | HL1 → N07 |
| 5 | Synthpop | „Hüpf-Pop 81“ (`vorbild-pop.md` 12.1) | 128 · F-Dur | Intro 4 · Strophe 8 · Refrain 8 · Strophe 8 · Refrain 8 · Bridge 4 · Refrain 8 (+1 HT) · Outro 4 | Riff allein im Intro, einstimmig, Klanghölzchen, trockener Raum | YZ1 → ER3 |
| 6 | Electropop | „Halle 90“ (`vorbild-pop.md` 12.4) | 130 · e-Moll | A 8 · B 8 · B 8 · Break 8 · B 16 · A 8 | Aufbau Spur für Spur, 16tel-Sequenzbass mit Zittern, Chor-Stöße, Break mit Stampfen | DM3 (Lizenz) → N16 |
| 7 | Future Pop | „Fernlicht“ (`vorbild-szene.md` G6) | 136 · fis-Moll | Intro 16 · Strophe 16 · Pre 8 · Refrain 16 · Breakdown 16 · Build-up 8 · Refrain 32 | i–VI–III–VII, Offbeat-Bass, Trance-Gate als Clip, langer Build-up, hymnischer Lead | SZ-25 … SZ-28, SZ-31, SZ-32 → V10f/Werk gleicher Rolle |
| 8 | Darkwave | R6-Demo (Nachtrag 1, V10e) | 104 · h-Moll | wie `r6/bibliothek-recherche.md` §7, als Zeitleiste | – | – |
| 9 | Retrowave | „Neonküste“ (`vorbild-retro.md` 8.1) | 104 · a-Moll | Intro 4 · A 8 · B 8 · Break 4 · B 8 (+2 HT) · Outro 4 | punktiertes Echo am Arp, Oktav-Bass pumpt, Gated Snare, Sax-Hook, letzter Refrain höher | N38 (Lizenz) → Werk Zinken-Piano |
| 10 | Body-Pop/EBM | „Körpertakt“ (`vorbild-szene.md` G1) | 126 · d-Moll | Intro 8 · Strophe 16 · Pre 8 · Refrain 16 · Marsch-Bridge 8 · Breakdown 8 · Refrain 32 · Outro 8 | 16tel-Bass ohne Pause, Offbeat-Stabs, Marsch-Wirbel vor dem letzten Refrain | SZ-02 … SZ-04 → EB-01, EB-04, SZ-24, A.1 #8 (SZ-01 ist über die ★-Ausnahme im Werk) |

Weitere Baupläne (`vorbild-pop.md` 12.2, `vorbild-szene.md` G2–G5, G7, G8, `vorbild-dark.md` D4, `vorbild-retro.md` 8.2–8.5, `vorbild-achtziger.md` §3) bleiben für später. Die Namen „Fernlicht“ und „Körpertakt“ sind neu und vor dem Bau gegen die Prüfliste zu prüfen (V10d-05, N10a-03, ganze Wörter).

### D.8 OFFEN und Hörtest-Projekt PO-1 (Rev. 2)

**OFFEN** (nicht im Werk): alle neuen R7-Sounds der Stufen 1 und 2 mit Beleg `u`, die nicht unter die ★-Ausnahme fallen (D.3b; SZ-20 ist als N21 im Werk, K2-67), die Lizenz-Fälle DM3, N38/MN4, MM1, MM2 (EN2-11) und alle neuen R7-Sounds der Stufe 3 außer SH-3 und SH-4 (bleiben im Katalog). R6- und A.1-Presets bleiben nach der Ausnahme in EN2-08 im Werk.

**PO-1** (EN2-18), gebaut mit V10P:
- **Inhalt:** die Sounds der Stufe 2 mit Beleg `u` von Acts, die Xander genannt hat (And One, The Frozen Autumn, Static Movement, Sixth June, De/Vision, Project Pitchfork, Kirlian Camera, S.P.O.C.K): SZ-02, AO-07 (Kit auf Basis „Rom Pop“), C2-02, C2-03, C2-05, DK-02, DK-04, DK-06, SZ-14, SZ-15, SZ-19 (Rev. 3). Nicht mehr in PO-1, weil über die ★-Ausnahme im Werk: SZ-01, AO-01 … AO-05, DK-01, VG-3 (V10P) sowie C2-06 und DK-05 (V10f, EN2-31); SZ-20 ist als N21 im Werk (V10d, K2-67).
- **Aufteilung (V10P-09):** je Datei **ein** Act, höchstens 7 Synth-Klänge auf den Synth-Spuren 1–6 und MELODIE und höchstens 1 Kit auf DRUMS (AO-07); Szene k spielt die Hörprobe des k-ten Synth-Klangs (`S.ui.order` ohne DRUMS), die Kit-Hörprobe läuft in der letzten belegten Szene (Rev. 3, K2-66). Keine Vorbild-Tags, keine Vorbild-Namen in Spur- oder Sound-Namen; der Act steht nur im Dateinamen und im Projektnamen („Hörtest 1 – And One“).
- **Weg:** Dateien `hoertest-po1-<act>-<n>.json` neben dem Gruppen-Stand (Pages-Repo und Anhang); Import über Menü → Projekt → Import.
- **Urteil:** Xander importiert die Dateien nacheinander und sagt je Sound „erinnert an <Act>: ja/nein“; ebenso für die ★-Sounds im Werk und für N21 Dämmerungs-Chor (SZ-20). Der Orchestrator trägt ein „ja“ als `h` mit Datum in `katalog.json` und CHANGES ein. Mit `h` kommt der Sound in das nächste Bibliotheks-Paket (V10d oder V10f) bzw. bekommt dort sein Tag „erinnert an <Act> (Stil)“, ohne Geräte-Angabe.

### D.9 NEU Instrument-Vorlagen VI1a–VI3 (EN2-26, nach `r8/studio-setups.md`)

**Ziel.** Xander kann die typischen Geräte seiner Vorbilder als Charakter-Vorlage spielen: Moog, Prophet, Elka Synthex (Cold Wave), Juno, Oberheim, Rhythmusboxen, Jupiter-Arp, String-Machines, C64, PPG, Kawai K1/K4, Sampler-Charakter und FM mit Filter. Grundlage sind die Rangliste (`studio-setups.md` §2), die Steckbriefe (§3), die Lücken (§4), die Vorlagen (§5) und die Stufen A–D (§6).

**Befund (Quelle sagt, `studio-setups.md` §0):** Ein Kawai K1 ist bei The Frozen Autumn nirgends belegt (8 Suchen ohne Treffer); für Diego Merletto nennt nur Equipboard Geräte (Elka Synthex, Korg DS-8, Roland JX-305, Kawai K4 – WAHRSCHEINLICH, schwach). Die Deutung „LK sind“ = „Elka Synth(ex)“ ist UNBELEGT. Die Synthex-Bauweise (2 DCOs je Stimme, Ringmod, 4-Pol-Multimode-Filter, Chorus I/II/III) ist öffentlich beschrieben; NEBEL-8 bildet sie nach. Status im ⓘ: WAHRSCHEINLICH.

**Gemeinsame Regeln für alle VI-Pakete**
1. **Vorlage** = Engine-Setup + Charakter-Module + eigene Frontplatte (≤ 12 Regler, Signalfluss links → rechts) + 4–8 Werksklänge. Die Klänge sind vorhandene Rezepte, die umgehängt werden (`studio-setups.md` §5, „Klänge je Vorlage“); neue Rezepte nur für NEBEL-8 (Cold-Wave-Satz: Bass, Glas-Keys, Fläche, Arp) und VIERER-VEKTOR.
2. **Namen ohne Marken** (E9): KASKADE, FÜNFER, NEBEL-8, DCO-CHOR, ZWEIPOL, PRESET-BOX, ZUFALLS-VIER, STREICHKISTE, BROTKASTEN, GLAS, VIERER-VEKTOR, KÖRNUNG-8, ZWEI-PAAR-FM. Das Vorbild steht nur im ⓘ: „Vorbild: <Gerät> · <Belegstatus aus `studio-setups.md` §1/§3> · Marken gehören ihren Inhabern, keine Verbindung.“
3. **Eine Wahrheit:** Die Frontplatte schreibt dieselben Parameter wie der normale Editor (keine Schatten-Werte). „Vorlage verlassen“ zeigt den normalen Editor mit denselben Werten; der Klang bleibt bitgleich. Alle Frontplatten-Regler sind Mod-Ziele (MOD-R1).
4. **Neue DSP-Bausteine** sind aus neutral (I-10): alles aus = bitgleich zum Stand davor.
5. **Ort:** Bibliothek → Chip „Vorlagen ▾“ und im Synth-Editor ⋯ › „Als Vorlage zeigen“.

| Paket | Inhalt (Stufe aus `studio-setups.md` §6) | Version | Budget | Dauer | braucht |
|---|---|---|---|---|---|
| **VI1a** Vorlagen-Rahmen und Analog-Kern | Frontplatten-Rahmen (Datenformat `tpl`, Darstellung P1/L1, Hilfe) · **KASKADE** (Moog-Familie: drei Oszillatoren, Mischer mit RÜCKKOPPLUNG, Kontur, Glide, Drift) · **FÜNFER** (Prophet: Osz. A/B, POLY-MOD über VK `ofm`, VINTAGE) · **NEBEL-8** (Synthex: Osz. 1/2, RING, PW-KREUZ, Filtermodus, Chorus I/II; Chorus III und BP 6 dB folgen mit VI2a) (Stufe A) | 5.1.0 | +30 KB | 6–7 h | VK, VK2, V10d |
| **VI1b** Weitere Analog-Vorlagen | **DCO-CHOR** (Juno: DCO Säge/Puls/Sub/Rauschen, PWM, Chorus I/II; HPF-Stufen mit VI2a) · **ZWEIPOL** (Oberheim/SEM: SVF-Blende LP ↔ Notch ↔ HP aus VK) · **PRESET-BOX** (Mini Pops/CR-78/KR-55: Muster A, Tempo, Klang je Instrument; Muster-Layer mit VI2a) (Stufe A) | 5.2.0 | +20 KB | 4–5 h | VI1a |
| **VI2a** „VK+“-Bausteine | Arp mit **ZUFALL**, **Juno-Hochpass** in 4 Stufen, **SID-Kombiwellen** mit schneller Arp-Treppe, Synthex-Feinheiten (**BP 6 dB**, **Chorus III**), **Muster-Layer** der Preset-Box → Vorlagen **ZUFALLS-VIER** (Jupiter-4/8), **STREICHKISTE** (Eminent 310/Solina, Phaser aus VK2), **BROTKASTEN** (C64-SID) (Stufe B; Phaser und Flanger sind schon in VK2, K2-54) | 5.3.0 | +30 KB | 5–6 h | VK, V5d, VI1a |
| **VI2b** Tabellen-Vorlagen | **GLAS** (PPG: Tabelle, Position, Hüllkurve → Position, STUFEN/GLATT, **8-Bit-Schalter** im Tabellen-Oszillator aus V8a) · **VIERER-VEKTOR** (Kawai K1/K4: 4 Quellen, XY-Stick aus V9a, **Hüllkurve je Quelle**, Filter aus/2-Pol) (Stufe C) | 5.4.0 | +25 KB | 5–6 h | VI2a, V8a, V9a |
| **VI3** Sampler-Charakter und FM mit Filter | **KÖRNUNG-8** (Bits, Rate, Companding + LP 24, Loop; erweitert `fx.crush` aus VK2) mit **ANSCHLAG-Schicht** (30–150 ms Rauschen, FM oder Tabelle vor dem Klang) · **ZWEI-PAAR-FM** (Korg DS-8: SPECTRUM, TIMBRE, Timbre-Hüllkurve, **Filter nach FM**) (Stufe D) | 5.5.0 | +30 KB | 6–7 h | VK2, V0d, VI1a |

**Nicht-Umfang.** Stufe E (eigene Samples aus Datei oder Mikrofon, Vocoder, Sprachchip; bleibt §18, zusammen mit dem Mikrofon zu planen); SCHREI (MS-20 mit zweitem Filter und Korg35) sowie Virus-, Nord-, JD-800- und M1-Vorlagen (`studio-setups.md` §6: „nicht planen“); Layer „Double“ (Super-Synth, §18).

**Abnahme-Checkliste (alle VI-Pakete, je Vorlage; Rev. 3, K2-72: je Paket als `<Paket>-VI-0n` geführt, z. B. VI1a-VI-01, VI3-VI-05, damit CHANGES und Testskripte jedes Ergebnis einem Paket zuordnen)**
- [ ] VI-01 Die Vorlage lädt ihre 4–8 Werksklänge; Frontplatte ≤ 12 Regler; M-PLATZ in P1–P3, L1, L2; Treffer nach L4.
- [ ] VI-02 Jeder Frontplatten-Regler schreibt denselben Pfad wie der normale Editor (deep-equal `getSound`); „Vorlage verlassen“ und zurück ändert nichts (bitgleich gerendert, max |Δ| ≤ 1e-6).
- [ ] VI-03 Neue Bausteine aus = bitgleich zum Stand vor dem Paket (Werks-Sounds und Demo offline, max |Δ| ≤ 1e-6).
- [ ] VI-04 ⓘ jeder Vorlage mit Vorbild, Belegstatus und Pflichtsatz; kein Gerätename in Vorlagen- oder Sound-Namen (Ganzwort-Prüfung gegen die Prüfliste A.13).
- [ ] VI-05 CPU (Xeon): je neuem Baustein ≤ +1 Prozentpunkt je Spur bei 8 Stimmen; MOD-R1-Abdeckung (V5d-01) 100 %.
- [ ] VI-06 Regression und DoD.

**Zusätzlich je Paket**
- [ ] VI2a-01 Arp ZUFALL: Akkord mit 4 Tönen, 2000 Schritte → jeder Ton 25 % ± 4 %; gleicher Startwert → gleiche Folge (deep-equal `noteLog`); Wechsel des Modus wirkt am nächsten Schritt.
- [ ] VI2a-02 Juno-Hochpass: Stufe 0 flach (±0,5 dB über 20 Hz–20 kHz); jede höhere Stufe hebt die −3-dB-Ecke um mindestens eine Oktave (Eckwerte eigener Entwurf, gemessen in CHANGES).
- [ ] VI2a-03 (Rev. 3) Chorus III und BP 6 dB: Chorus III weicht in Modulationsrate **oder** -tiefe um ≥ 25 % von Chorus I und von Chorus II ab (gemessen am Verzögerungsverlauf); BP 6 dB fällt beidseitig 5–7 dB/Okt.
- [ ] VI2b-01 8-Bit-Schalter: Sinus-Tabelle mit 8 Bit → Signal-Rausch-Abstand 50 dB ± 3 dB; aus = bitgleich.
- [ ] VI2b-02 Vektor: in jeder Ecke des XY-Sticks klingt genau eine Quelle (die drei anderen ≤ −60 dB); in der Mitte alle vier gleich laut (±0,5 dB); Fahren des Sticks besteht M-KLICK.
- [ ] VI3-01 KÖRNUNG-8: 8 Bit → Signal-Rausch-Abstand 50 dB ± 3 dB; Rate ÷4 → Alias-Anteile ≥ −30 dB; Mix 0 = bitgleich.
- [ ] VI3-02 ANSCHLAG-Schicht: Länge 30–150 ms einstellbar (±2 ms); danach ≤ −60 dB; Pegel folgt dem Anschlag.
- [ ] VI3-03 Filter nach FM: Cutoff-Fahrt an einem FM6-Klang ändert den spektralen Schwerpunkt mindestens um den Faktor 2; Filter offen = bitgleich zum FM-Klang ohne Filter.

**Tests.** `vi-vorlagen.mjs` (Laden, Pfade, bitgleich), `vi-dsp-node.mjs` (neue Bausteine offline), `vi-ui.mjs` (M-PLATZ, ⓘ). **Risiken.** Nichts ist angehört; die Vorlagen sind Charakter-Annäherungen, keine Emulationen. CPU am iPhone ungemessen.

### D.10 Korrekturen

| # | Stelle | Korrektur |
|---|---|---|
| **K2-09** | `r7/vorbild-cold-retro.md` (Verweis „DK-05 … DK-08“ für Clan of Xymox) | gemeint sind DK-07 … DK-10 (`vorbild-dark.md` §5.3) |
| **K2-10** | gleiche Kurz-IDs in mehreren Dateien (MO1/MO2, H1/H2, SC, SP, D1–D4, K1/K2, N1/N01, V1–V6, S1–S4, T1–T3, PR1/PR8) | gelöst durch D.1 Nr. 7 und die Katalog-IDs VG-1 … VG-6, SH-1 … SH-4 (Katalog §4.1) |
| **K2-11** | Namen „Gummi-Bass“ (C2-13), „Sonnenbrillen-Bass“, „Kunstleder-Riff“, „Kaltfront-Riff“ (NU1), SZ-20, A.1 #13 | Umbenennung nach D.1 Nr. 5 |
| **K2-12** | Static Movement: R6 §11 „b“, Spec A.1 #12/#13 „belegt (SE)“, Katalog „W“ | Kein eigener Beleg mit URL → für die Zulassung `u`. A.1 #12/#13 bleiben Presets ohne Vorbild-Tag, bis eine Quelle mit URL vorliegt. |
| **K2-13** | Covenant (nur Equipboard) | `u` |
| **K2-14** | Nachtrag 1, Frage E.1 („I Hate Berlin“, „proWIN“) | „I Hate Berlin“ ist ein Titel von Second Decay (BELEGT, Spotify) und laut einem Konzertbericht ihr größter Hit (WAHRSCHEINLICH, D.2). „proWIN“ ist sehr wahrscheinlich der Diktatfehler für „Purwien“ (Xander nennt Purwien in Runde 9 als Sänger; das Wort selbst ist nicht belegt). Beide sind keine Einträge der Tabelle VORBILD; Second Decay bleibt. |
| **K2-15** | Tags und ⓘ der Werks-, A.1- und R6-Sounds | Die Korrekturlisten der R7-Dateien gelten (`vorbild-pop.md` K-P1 … K-P13, `vorbild-retro.md` K-R1 … K-R9, `vorbild-szene.md` §6, `vorbild-dark.md` §7, `vorbild-ebm-dark.md` §5, `vorbild-achtziger.md` §4, `vorbild-cold-retro.md`, `vorbild-pioniere.md`, `vorbild-helden.md`), dazu die eine Skala aus Katalog §4.6. |
| **K2-16** | Spec §12.8 `len ≤ 4`, §12.3 „höchstens 4 Takte bzw. 8 s“ | `len ≤ 8`; die 8 s gelten für „kurz“, „ganz“ ≤ 16 s (EN2-09) |
| **K2-17** | Nachtrag 1, C.2 Punkt 4 und die 9-Demo-Tabelle in V10e | aufgehoben durch EN2-03 bzw. D.7 |
| **K2-19** | Spec §12.6, Absatz „Weihnachtsalbum … nicht gefunden“ | ersetzt (D.6.2) |
| **K2-20** | Nachtrag 1, N10a „Tabelle VORBILD wörtlich aus R6 §11“ | ersetzt (D.6.1) |
| **K2-34** | D.2 (Fassung vor Review 1) und Quelldateien | Quellen und Stufen berichtigt: Kraftwerk geteilt (K1 „Autobahn“; K2 Synthanorma ab 1977 mit den Trans-Europe-Express-Quellen aus `vorbild-helden.md` §3.1); New Order mit den Quellen aus `vorbild-pop.md` §8.1 statt MusicRadar und „R6 §1“; Tiga & Zyntherius nur „Titel existiert“ BELEGT, Jahr/Genre WAHRSCHEINLICH; Second Decay: Duo WAHRSCHEINLICH, größter Hit WAHRSCHEINLICH, Purwien & Kowa BELEGT. `r7/vorbild-spezial.md` (Kurzfazit Nr. 5, §3) und `r7/spezial-slaphouse.md` (§0 Nr. 6, §5) sind auf denselben Stand gebracht. |
| **K2-52** | Nachtrag 2 Rev. 1, D.3b und D.6.6 (SC1, EB-03 in V10f) | `vorbild-katalog.md` §3.2 führt ach·SC1 Spielzeug-Bass 81 (Nr. 17) und EB-03 FM-Kantenstab (Nr. 32) seit seiner Review-Prüfung in Tier 1. Beide kommen in V10d (Rest von Stufe 1), nicht in V10f; V10d +3 KB, V10f −5 KB (mit SZ-24 und C2-13, die nach V10P wandern). |
| **K2-53** | `r7/vorbild-spezial.md` §1, §3, §4 Nr. 2 und 4–5; Katalog §3.1–§3.3 | Xanders Tier-1-Wünsche kommen nach EN2-25 in V10P: VG-3, SZ-01, AO-01 … AO-05, SH-3, C2-13, SH-4, SZ-23, SZ-24, N20, DK-01 (D.3a Nr. 32–45). Ein Tag `tiga-zyntherius` gibt es erst mit `h`; „Sonnenbrillen-Bass“ heißt „Kalter Achtel-Bass“ (D.1 Nr. 5); Katalog-Stufe 3 gilt für SH-3 und SH-4 nicht (★). Die Hinweise „Grollbass FM und Klatsch-FM erst nach der FM-Hüllkurven-Reparatur“ und „Peilsender erst mit VK“ sind erfüllt, weil V0d und VK vor V10P liegen. |
| **K2-54** | `r8/studio-setups.md` §6 (Stufen A–D) | Stufe A „sobald VK steht“ → nach V10d (Gruppe 17), weil die Vorlagen Werksklänge aus der Bibliothek umhängen; Stufe B ohne Phaser und Flanger (schon in VK2, EN2-12); Pakete, Versionen und Abnahme nach D.9. |
| **K2-66** (Rev. 3) | D.5 Umfang 7, V10P-09, D.8 „Aufteilung“ (PO-1: „höchstens 8 Synth-Spuren … und 1 Drum-Spur“, „Szene k … Spur k“) | Widerspruch zum Format 4 (Spec §4.11: `S.tracks` ≤ 8 mit festen Indizes 0–3 Synth 1–4, 4 DRUMS, 5 MELODIE, 6–7 Synth 5–6). Neu: je Datei ≤ 7 Synth-Klänge auf Synth 1–6 und MELODIE, höchstens 1 Kit auf DRUMS; Szene k = Hörprobe des k-ten Synth-Klangs in `S.ui.order` ohne DRUMS; Kit-Hörprobe in der letzten belegten Szene. |
| **K2-67** (Rev. 3) | D.3b und D.8 (SZ-20 als „OFFEN, PO-1“) gegen D.1 Nr. 6 (N21 ↔ SZ-20 = ein Eintrag) und D.6.3 (V10d baut N21 mit den Werten von SZ-20) | Verbindliche Lesart: **SZ-20 = N21 im Werk** (R6-Preset, EN2-08-Ausnahme) **ohne Vorbild-Tag**; SZ-20 steht in keiner OFFEN- oder PO-1-Liste. Xanders Urteil `h` gilt wie bei den ★-Sounds im Werk (D.8 „Urteil“). N2-10e-01 und V10P-09 sind damit widerspruchsfrei. |
| **K2-68** (Rev. 3) | E.3 Zeile V10P („V9a (Additiv)“, Gruppen 1, 12, 13), D.5 Ziel; E.2 Nr. 9 (Option) | Kein V10P-Sound braucht V9a (D.3a); die Kante V10P → V9a widersprach der Option „V10P nach Gruppe 12“. Neu: V10P braucht **V0b, V0d, V2a (Format 4 für PO-1, Clip-Slots für Muster ⧉), VL (`sound.lage` beim Vorhören), VK, VK2; Tor PR-V**. `budget4.py` ist angepasst und prüft die Option mit: „Prüfung: OK“, „Option V10P nach Gruppe 12 (Abhängigkeiten): OK“. |
| **K2-71** (Rev. 3) | EN2-09, V10P-06, V10P-17, V10f-03 („der letzte Takt ist eine Wendung“) | „Wendung“ war kein messbares Kriterium. Definition jetzt in EN2-09 (Intervall- und Einsatzfolge des letzten Takts ≠ erster und vorletzter Takt, letzte Note auf anderer Tonstufe als die des vorletzten Takts; Drums: Einsatzfolge ≠ vorletzter Takt); `v10p-daten.mjs` prüft genau das. |
| **K2-72** (Rev. 3) | D.9 Abnahme „VI-01 … VI-06 (alle VI-Pakete, je Vorlage)“, VI2a-03 | Die gemeinsamen Punkte heißen je Paket `<Paket>-VI-0n` (VI1a-VI-01 … VI3-VI-06); VI2a-03 hat jetzt eine Schwelle (≥ 25 % Abweichung in Rate oder Tiefe). |

---

## Teil E — Bau-Reihenfolge (Endfassung; ersetzt Nachtrag 1, C.1, C.2, C.4 und ergänzt C.3)

### E.0 Stand (17.10.2026)

V0a ist gebaut (App 3.1.0, Snapshot `V0a-fix.html`, liegt auch als `index.html` im Pages-Repo), V0b ist im Bau. Geplant sind **78 feste Pakete** (ohne V0a) und **1 optionales** (VS7). Bedingte Pakete gibt es nicht mehr (EN2-16). Tore: VS1 (VS0 positiv, N2-VS0-02), VS3 (N7V-12, N2-VS2-03), V10P und die Bibliotheks-Pakete mit Tags (PR-V, D.2b), Online-Rollout (Xanders Okay je Schritt, G.8), **VC4: Tor = Xanders Antwort auf F.2 VC4** (die drei Bedingungen aus Nachtrag 1, VC4-Tor; Rev. 3). Gruppe V0 bleibt vorn und unverändert in ihrer Reihenfolge.

### E.1 Gruppen (verbindlich, EN2-14, EN2-30)

Gebaut wird Gruppe für Gruppe, innerhalb jeder Gruppe in der angegebenen Reihenfolge. Dauer = reine Bauzeit (Summe der Paketangaben, `budget4.py`); „bis hier“ = Summe ab heute (ohne V0a).

| # | Gruppe | Pakete | Dauer | bis hier | Was Xander danach hat |
|---|---|---|---|---|---|
| 1 | **V0** | V0a ✓, V0b (im Bau), V0c, V0d | 21,5–26 h | 21,5–26 h | Fehler weg; Bibliothek bleibt in der Engine; FOLGEN; ▶ im Song spielt den Song; **Akkord-Chip bearbeiten und Akkorde quantisieren (P4)**; FM-Hüllkurven nach DX7-Vorbild, snappy FM-Bässe |
| 2 | **Online + Mikro-Check** | VO1, VO2, VS0 | 18–20,5 h | 39,5–46,5 h | **alles online gesichert, nach dem Neuladen nie weg**; Anmelden auf der Pages-Seite; Freund per Mitmach-Link; Paar-Raum; Speichern des Partners sofort sichtbar; Abzweigen; Mikro-Check |
| 3 | **FM-Feld** | V4a, V4b, V4f, V4c | 25,5–29 h | 65–75,5 h | **FM-Feld wie EssenceFM (P1)** mit Punkt-Hüllkurven; Vorhersage, DX-Brücke |
| 4 | **Song 1** (V2-1) | V2a, V2a′, V2b, V2c, V2c′ | 20–23 h | 85–98,5 h | 8 Spuren und 8 Szenen, MELODIE-Spur, Teile, Akkord-Zeilen mit Quantisieren, „Eine Skala“ |
| 5 | **Song 2** (V2-2) | V2d, V2d′, V2e, V2e′, V2f | 22,5–25 h | 107,5–123,5 h | **FANG TEIL mit allen Clip-Zuständen, Taktstrich-Regel, Teil halten → Song-Seite öffnet sich (S9), Einfügen/Ersetzen, Name in der gelben Taktleiste, Punch/Overdub, Glas-Ansicht, eigener Clip (P2)** |
| 6 | **Lage, Stimme A, Mix, Verlauf** | VL, VS1, VS2, V7a, VC2a | 26,5–31,5 h | 134–155 h | **Lage-Grenzen** (Bass bleibt unten, Musik folgt der Hand, Pfeile je Akkord); **Mikrofon an, Melodie einsingen oder einstimmig einspielen → Noten (P3)**; MIX; Verlauf zeichnet ab jetzt auf |
| 7 | **Stimme B** (Tor N7V-12) | VS3, VS4, VS5a, VS5b | 21–22 h | 155–177 h | Gesangsspur mit Takes und Punch, Säubern, **Audio quantisieren (P4)**, Songtext |
| 8 | **Drums + Beatbox** | V1a, V1b, V1c, V1d, VS6 *(+ VS7 optional)* | 19–24 h | 174–201 h | Drums mit eigenen Reglern je Instrument, BISS, Kits, Engine je Pad; Beatbox → Drums |
| 9 | **Editor** | V3a, V3b, V3c | 12–15 h | 186–216 h | Taktleiste, Drehen, Spiegeln, Varianten, LAUF+ |
| 10 | **Modulation** | V5a, V5b, V5c, V5d | 17–18 h | 203–234 h | Mod-Stränge, LOCK, jeder Regler modulierbar (Bitwig-Wunsch) |
| 11 | **Klangzustände** | V6a, V6a′, V6b | 11–13 h | 214–247 h | Klangzustände, Morph, Teil-Klang |
| 12 | **Master + Klassiker** | V7b, V7c, V7d, VK, VK2 | 22–24 h | 236–271 h | Kontext-Master, Klassiker-Bausteine, Phaser, Flanger, Hochpass, Bitcrusher |
| 13 | **Bitmask, Additiv, FM-Wellen** | V8a, V8b, V9a, V9b, V4e | 21–23 h | 257–294 h | Bitmask, Additiv, KLANGKÖRPER, eigene FM-Wellen zeichnen |
| 14 | **Resynthese** | V9d, V9d′, V9e | 14–16,5 h | 271–310,5 h | Klang einfangen (Saxofon, Klavier, Sprache sicher; Löwe und andere Naturklänge ohne Zusage, die Ampel zeigt, wie nah es klingt; Werks-Löwe nur mit N9R-38), spielen, verwandeln |
| 15 | **Bibliothek 1** (Tor PR-V) | V10P, V10a, V10b, V10c | 22–26,5 h | 293–337 h | **45 Vorbild-Sounds, Xanders Lieblinge zuerst, mit Hörproben (P5)**; 9 Industrial-/EBM-Bassmuster ⧉; volle Bibliothek; Signature-Paket A.1; Lektionen-Motor |
| 16 | **Bibliothek 2** | V10d, V10f, V10e | 16–18 h | 309–355 h | R6-Presets und restliche Stufe 1, Stufe-2-Sounds, je ein Wunsch-Bass für De/Vision und Static Movement (★), 10 Genre-Demos |
| 17 | **Instrument-Vorlagen** | VI1a, VI1b, VI2a, VI2b, VI3 | 26–31 h | 335–386 h | Moog-, Prophet-, Synthex-, Juno-, Oberheim-, Jupiter-, PPG-, K1- und Sampler-Charakter |
| 18 | **Zusammen A** (online) | VO3, VO4a, VO4b, VO4c | 21–25 h | 356–411 h | „René ist da“, Sounds im Raum; gleichzeitig am selben Song, jede Speicherung eine Version, nie still überschreiben, Übernehmen mit A/B |
| 19 | **Zusammen B** | VC3, VC3b, VC2b, VC2c, VC4 | 21–25 h | 377–436 h | zwei Geräte live, Fern-Einspielen wie bei Digital Musician, Zeitraffer, Video, KI-Helfer |

**Tausch-Regel Gruppen 7/8 (verbindlich):** Liegt beim Ende von Gruppe 6 Xanders Ergebnis von N7V-12 **positiv** vor (N2-VS2-03), gilt die Reihenfolge 7 → 8. Sonst wird zuerst Gruppe 8 gebaut (V1a–V1d, VS6, *VS7*), dann Gruppe 7. Die Versionen folgen dann Variante B in E.4 (streng steigend); CHANGES nennt die gewählte Variante.

**Gesamt:** ≈ 377–436 h reine Bauzeit offen (ohne V0a), optional VS7 +3–3,5 h. Neustarts, Korrekturen und Fach-Prüfung (Teil J) kommen hinzu (1–2 h je Paket).

### E.2 Begründung

Der Auftrag der Endfassung nennt die Reihenfolge: **V0 (läuft) → VO1 + VO2 → V4 → Song-Gruppen V2-1, V2-2 → Lage-Grenzen → Stimme (Pages) → Rest (V1, V3, V5, V6, V7 + VK, V8, V9 mit Additiv und Resynthese, V10, VC mit VC3 und VC4 fest)**. Teil E folgt ihr; Abweichungen sind klein und begründet:

1. **V0 zuerst** (läuft, EN-20).
2. **Online direkt nach V0** (Xander Runde 9: „Supabase als einen der ersten Punkte“). VO1 braucht nur den Stand von V0a, VO2 nur VO1 (`online.md` §9). **VS0 kommt in dieselbe Gruppe** (Abweichung): 4 h, braucht nichts, läuft auf derselben Pages-Adresse und entscheidet früh über VS1; so wartet die Stimme später nicht auf die Messung.
3. **FM-Feld (P1)** danach; V4 braucht nur V0d. V4f ist jetzt fest (Xander P1 „genau wie EssenceFM“); V4c steht nach V4f, weil [DX-tauglich machen] auch die Punkt-Form zurückführt (N7F-49).
4. **Song (P2)** in zwei Gruppen, Schnitt nach V2c′ wie in Nachtrag 1 („Eine Skala“ vor V2d, E3-25).
5. **Lage-Grenzen** direkt danach. VL nach den Song-Gruppen braucht V2c (Pfeile), V2d (Handton und Anker im FANG TEIL), V2e (AKK-Zeile mit ↑/↓) und V2f (`S.shift` vor der Lage); VL baut diese Haken selbst nach (Teil H).
6. **Stimme A (P3)** in derselben Gruppe direkt nach VL. **V7a und VC2a schließen Gruppe 6 ab** (Abweichung, ≈ 9–10 h): V7a muss vor V3 und V6a liegen (E3-32, keine zweite Migration), VC2a zeichnet erst ab dem Einbau auf (EN-14). Beide sind klein, und Xander hat in dieser Zeit den Zwischenstand nach VS2 für den Gerätetest N7V-12 (N2-VS2-03), der VS3 freigibt.
7. **Stimme B vor den Drums**, wie der Auftrag es nennt („Stimme → Rest mit V1“); VS6 (Beatbox) braucht die Drums und steht deshalb in Gruppe 8. Ist N7V-12 beim Ende von Gruppe 6 nicht positiv, tauschen 7 und 8 (Tausch-Regel E.1).
8. **Rest in der Reihenfolge von Nachtrag 1** (V3 → V5 → V6 → V7b–d + VK → V8/V9), dazu: VK2 nach VK; V4e nach V8a (eigene Wellen brauchen den bandbegrenzten Tabellen-Bau); Resynthese direkt nach Bitmask/Additiv (`resynthese-pakete.md` §9.2).
9. **Bibliothek nach der Prüfrunde PR-V** (EN2-25). Gegenüber Revision 1 kommt das Vorbild-Paket damit später (dort Gruppe 2). Gründe: Auftrag (V10 im Rest), PR-V braucht Webzugang, und mit allen Bausteinen (Kits, VK, VK2, Additiv) entfallen die „Annäherungen“ fast ganz. **Option:** Will Xander die Vorbild-Sounds früher, kann V10P nach Gruppe 12 vorgezogen werden, sobald PR-V bestanden ist (VK und VK2 liegen dann vor; V10P braucht V9a nicht, K2-68; `budget4.py` prüft die Option: OK). Die Versionen folgen dann E.5 Punkt 3.
10. **Instrument-Vorlagen** nach V10d, weil sie Werksklänge aus der Bibliothek umhängen (`studio-setups.md` §6 Stufe A).
11. **Zusammen A** (VO3, VO4a–c) nach der Bibliothek: VO3 braucht V10a (Sounds im Raum), VO4a braucht V2a (`uid`) und VO2. Zeitversetzte Zusammenarbeit läuft schon ab Gruppe 2 (VO2); VO4 bringt das gleichzeitige Arbeiten am selben Song.
12. **Zusammen B zuletzt:** VC3 und VC4 sind fest (Runde 9); VC3b braucht VO4b (Jam-Take als Version, Anwesenheit mit Spur-Fokus). VC1 entfällt (EN2-27).

### E.3 Abhängigkeits-Check (ergänzt Nachtrag 1, C.3)

Geprüft mit `scratchpad/n2-tools/budget4.py`: Jede Abhängigkeit liegt in der Bau-Reihenfolge vorher, alle Versionen sind eindeutig und streng steigend („Prüfung: OK“).

**Vergleich mit Nachtrag 1, C.3** (alle Kanten von dort bleiben erfüllt):

| Kante aus C.3 | jetzt | erfüllt |
|---|---|---|
| WP7 ─ V0a ─ V0b ─ V0c ─ V0d | Gruppe 1 in Reihenfolge | ✓ |
| V0d ─ V1a ─ V1b ─ V1c ─ V1d | Gruppe 1 → Gruppe 8 | ✓ |
| V0d ─ V2a ─ V2a′ ─ V2b ─ V2c ─ V2c′ ─ V2d ─ V2d′ ─ V2e ─ V2f ─ V7a | Gruppen 4, 5, 6 (V7a in Gruppe 6) | ✓ |
| V0d ─ V4a ─ V4b ─ V4c (.syx-ZIP aus V0a) | Gruppe 3; dazu V4f zwischen V4b und V4c | ✓ |
| VC2a (V2a) | Gruppe 4 → Gruppe 6 | ✓ |
| V3a (V2a) ─ V3b ─ V3c | Gruppe 4 → Gruppe 9 | ✓ |
| V5a ─ V5b (V1a) ─ V5c (V3c) ─ V5d | Gruppen 8, 9 → Gruppe 10 | ✓ |
| V6a (V2c, V4a, V5c, V5d, V7a) ─ V6a′ ─ V6b | Gruppen 3, 4, 6, 10 → Gruppe 11 | ✓ |
| V7b (V7a) ─ V7c ─ V7d | Gruppe 6 → Gruppe 12 | ✓ |
| VK (V5d; V4a) | Gruppen 3, 10 → Gruppe 12 | ✓ |
| V8a ─ V8b ─ V9a ─ V9b ─ V9c | Gruppe 13; **V9c entfällt** (Resynthese, Teil I) | ✓ |
| V10a ─ V10b (V4, V8, V9) ─ V10c (V1b, V2e) ─ V10d (V10a, VK, V1d) ─ V10e (V10c, V10d, V2f, V7d) | Gruppen 15, 16; V10b zusätzlich nach V4c, V4e, V9e | ✓ |
| VC1 (V10a) | **entfällt** (EN2-27) | – |
| VC2b (VC2a) ─ VC2c · VC3 (V2d) · VC4 (V5d) | Gruppe 19 | ✓ |

**Neue oder geänderte Pakete:**

| Paket | braucht (fachlich) | liegt in Gruppe | erfüllt |
|---|---|---|---|
| VO1 | V0a (`SQStore.Autosave` mit `onWritten`, Projekte, `parseFile`) | 1 | ✓ |
| VO2 | VO1 | 2 | ✓ |
| VS0 | – (nur oberstes Fenster mit `getUserMedia`) | – | ✓ |
| V4a · V4b | V0d (Hüllkurven, Haltephase, PEG aus A.4b) · V4a | 1 · 3 | ✓ |
| V4f | V4b (Editor-Ansicht EK-13), V0d (A.4b-Editor) | 3 · 1 | ✓ |
| V4c | V4b, V4f (N7F-49), V0a (.syx-ZIP, N0a-03) | 3 · 1 | ✓ |
| V2a (mit `uid`) | V0d (Kette C.3) | 1 | ✓ |
| VL | V2c, V2c′, V2d, V2e, V2f | 4, 5 | ✓ |
| VS1 | VS0 positiv (Tor) | 2 | ✓ (Tor) |
| VS2 | VS1, FANG, V2a, V2d (N7-R1) | 4, 5, 6 | ✓ |
| V7a | V2a, V2f (E3-32) | 4, 5 | ✓ |
| VC2a | V2a (Format 4, Undo-Gruppen) | 4 | ✓ |
| VS3 | VS2, V2a, V2e; N7V-12 (Tor) | 4, 5, 6 | ✓ (Tor) |
| VS4 · VS5a · VS5b | VS3 · VS3 · VS5a | 7 | ✓ |
| VS6 | VS1, V1d | 6, 8 | ✓ |
| *VS7* | VS2, V2c | 4, 6 | ✓ |
| VK2 | VK, V5d (MOD-R1) | 10, 12 | ✓ |
| V4e | V4b, V8a (Tabellen-Bau, Mipmaps) | 3, 13 | ✓ |
| V9d | V9b (Sinusbank); weich VS1 (🎤), VO1 (Projekt-Text ≤ 2 MB) | 13, 6, 2 | ✓ |
| V9d′ | V9d, V1d (PAD-R1), V5d (MOD-R1), VC2a (VL-R1) | 14, 8, 10, 6 | ✓ |
| V9e | V9d′, V9a (*(P1)* → TABELLE) | 14, 13 | ✓ |
| V10P (Rev. 3) | V0b (EN-04, ▶, U-01), V0d (FM-Bässe), V2a (Format 4 für PO-1, Clip-Slots für Muster ⧉), VL (`sound.lage` beim Vorhören), VK (Ringmod, Peilsender), VK2 (Phaser, `p.hpf`); Tor PR-V | 1, 4, 6, 12 | ✓ (Tor) |
| V10a | V0b, V10P | 1, 15 | ✓ |
| V10b | V4c, V4e, V8b, V9b, V9e (alle Engines) | 3, 13, 14 | ✓ |
| V10c | V1b, V2e | 5, 8 | ✓ |
| V10d | V10a, VK, VK2, V1d | 8, 12, 15 | ✓ |
| V10f | V10d, VK2, V9a (VG-6) | 12, 13, 16 | ✓ |
| V10e | V10c, V10d, V2f, V7d | 5, 12, 15, 16 | ✓ |
| VI1a · VI1b | VK, VK2, V10d · VI1a | 12, 16 · 17 | ✓ |
| VI2a | VK, V5d, VI1a | 10, 12, 17 | ✓ |
| VI2b | VI2a, V8a, V9a | 13, 17 | ✓ |
| VI3 | VK2, V0d, VI1a | 1, 12, 17 | ✓ |
| VO3 | VO2, V10a (Bibliothek für Raum-Sounds) | 2, 15 | ✓ |
| VO4a | VO2, V2a (`uid`, N2-2a-01) | 2, 4 | ✓ |
| VO4b · VO4c | VO4a · VO4b | 18 | ✓ |
| VC3 | V2d (Song statt Kette) | 5 | ✓ |
| VC3b | VC3, VO2, VO4b (Version, Anwesenheit), V2a | 2, 4, 18, 19 | ✓ |
| VC2b · VC2c | VC2a · VC2b | 6 · 19 | ✓ |
| VC4 | V5d | 10 | ✓ |

**Regeln mit Wirkung auf die Reihenfolge:**
- **PAD-R1** (ab V1d): V4 und VS liegen davor → N2-1d-01 (FM-Feld als Pad-Quelle). V9d′ nach V1d nimmt RESYNTHESE als Pad-Quelle auf.
- **MOD-R1** (ab V5d): V4, VL, VS1–VS5b, V1, V7a, V3 liegen davor → V5d-01 deckt alle bis dahin gebauten stetigen Regler ab (100 %), ausdrücklich `fmx.*` (N2-5d-01). Spätere Pakete (VK2, V9d′, VI) halten MOD-R1 selbst ein.
- **VL-R1** (ab VC2a): V0–V4, VO1/VO2 (ohne eigene Undo-Arten), V2a–V2f, VL (Art `lage`), VS1, VS2 liegen davor → VC2a zeichnet alle bis dahin vorhandenen Undo-Arten auf, ausdrücklich die FELD-Gesten (N2-C2a-01) und `lage`.

### E.4 App-Versionen, Budgets, Dauer (ersetzt Nachtrag 1, C.4)

| Paket | Version | KB | h | | Paket | Version | KB | h |
|---|---|---|---|---|---|---|---|---|
| V0a ✓ | 3.1.0 | 30 | – | | V5a | 4.27.0 | 40 | 4 |
| V0b | 3.2.0 | 50 | 5–6 | | V5b | 4.28.0 | 30 | 4 |
| V0c | 3.3.0 | 42 | 6–7,5 | | V5c | 4.29.0 | 30 | 4–5 |
| V0d | 3.4.0 | 65 | 10,5–12,5 | | V5d | 4.30.0 | 45 | 5 |
| VO1 | 3.5.0 | 38 | 6–7 | | V6a | 4.31.0 | 35 | 4–5 |
| VO2 | 3.6.0 | 40 | 8–9,5 | | V6a′ | 4.32.0 | 25 | 4 |
| VS0 | 3.7.0 | 15 | 4 | | V6b | 4.33.0 | 25 | 3–4 |
| V4a | 3.8.0 | 48 | 7,5–8,5 | | V7b | 4.34.0 | 40 | 4–5 |
| V4b | 3.9.0 | 95 | 9–10 | | V7c | 4.35.0 | 60 | 5 |
| V4f | 3.10.0 | 40 | 5–6 | | V7d | 4.36.0 | 40 | 4 |
| V4c | 3.11.0 | 30 | 4–4,5 | | VK | 4.37.0 | 30 | 5 |
| V2a | 4.0.0 (Format 4) | 47 | 4,5–5,5 | | VK2 | 4.38.0 | 30 | 4–5 |
| V2a′ | 4.1.0 | 30 | 4 | | V8a · V8b | 4.39.0 · 4.40.0 | 42 · 40 | 4–5 · 4 |
| V2b | 4.2.0 | 25 | 3–4 | | V9a · V9b | 4.41.0 · 4.42.0 | 30 · 50 | 4 · 5 |
| V2c | 4.3.0 | 64 | 5,5 | | V4e | 4.43.0 | 28 | 4–5 |
| V2c′ | 4.4.0 | 20 | 3–4 | | V9d · V9d′ · V9e | 4.44.0 · 4.45.0 · 4.46.0 | 67 · 35 · 105 | 5–5,5 · 4–5 · 5–6 |
| V2d | 4.5.0 | 40 | 5–6 | | V10P | 4.47.0 | 72 | 9–10,5 |
| V2d′ | 4.6.0 | 35 | 5 | | V10a · V10b · V10c | 4.48.0 · 4.49.0 · 4.50.0 | 45 · 120 · 60 | 4–5 · 5–6 · 4–5 |
| V2e | 4.7.0 | 55 | 5 | | V10d · V10f | 4.51.0 · 4.52.0 | 113 · 58 | 5–6 · 5–6 |
| V2e′ | 4.8.0 | 40 | 4–5 | | V10e | 5.0.0 | 60 | 6 |
| V2f | 4.9.0 | 20 | 3,5–4 | | VI1a · VI1b | 5.1.0 · 5.2.0 | 30 · 20 | 6–7 · 4–5 |
| VL | 4.10.0 | 31 | 6,5–8 | | VI2a · VI2b | 5.3.0 · 5.4.0 | 30 · 25 | 5–6 · 5–6 |
| VS1 | 4.11.0 | 25 | 5–6 | | VI3 | 5.5.0 | 30 | 6–7 |
| VS2 | 4.12.0 | 36 | 6–7,5 | | VO3 | 5.6.0 | 20 | 4–5 |
| V7a | 4.13.0 | 50 | 5 | | VO4a · VO4b · VO4c | 5.7.0 · 5.8.0 · 5.9.0 | 35 · 35 · 20 | 6–7 · 7–8 · 4–5 |
| VC2a | 4.14.0 | 30 | 4–5 | | VC3 · VC3b | 5.10.0 · 5.11.0 | 45 · 25 | 5–6 · 4–5 |
| VS3 · VS4 | 4.15.0 · 4.16.0 | 35 · 25 | 6 · 5 | | VC2b · VC2c | 5.12.0 · 5.13.0 | 30 · 40 | 4 · 4–5 |
| VS5a · VS5b | 4.17.0 · 4.18.0 | 25 · 30 | 5 · 5–6 | | VC4 | 5.14.0 | 35 | 4–5 |
| V1a · V1b | 4.19.0 · 4.20.0 | 40 · 60 | 4–5 · 4–5 | | | | | |
| V1c · V1d | 4.21.0 · 4.22.0 | 25 · 40 | 3–4 · 4–5 | | | | | |
| VS6 · *VS7* | 4.23.0 · *4.23.5* | 20 · *14* | 4–5 · *3–3,5* | | | | | |
| V3a · V3b · V3c | 4.24.0 · 4.25.0 · 4.26.0 | 45 · 40 · 30 | 4–5 · 4–5 · 4–5 | | | | | |

**Variante B (Tausch-Regel E.1, N7V-12 beim Ende von Gruppe 6 nicht positiv):** V1a 4.15.0 · V1b 4.16.0 · V1c 4.17.0 · V1d 4.18.0 · VS6 4.19.0 · *VS7 4.19.5* · VS3 4.20.0 · VS4 4.21.0 · VS5a 4.22.0 · VS5b 4.23.0. Budgets und Dauer je Paket wie oben; alle übrigen Nummern bleiben.

**Größe** (gerechnet mit `scratchpad/n2-tools/budget4.py`, 1 316 464 B + KB × 1024, MB = 10⁶ B):
- Ausgangspunkt ist `V0a-fix.html` mit 1 316 464 Byte.
- Die festen Budgets nach V0a ergeben **+3 201 KB, also ≈ 4,59 MB** am Ende (Rev. 3: V10f +3 KB); mit VS7 ≈ 4,61 MB. Stände: nach Gruppe 5 ≈ 2,18 MB, nach Gruppe 14 ≈ 3,62 MB, nach Gruppe 16 ≈ 4,16 MB.
- Gegenüber Revision 1 (+2 600 KB unbedingt, ≈ 3,98 MB) sind es +601 KB: Online VO1–VO4c und VC3b +213 KB, Resynthese +177 KB (V9d, V9d′, V9e abzüglich V9c), Instrument-Vorlagen +135 KB, FM-Feld +66 KB (V4f, V4e, Mipmaps, V4b −5 KB), VL +31 KB, Bibliothek +22 KB (V10P +21, V10d +3, V10f −2), `uid` in V2a +2 KB; VC1 fällt weg (−45 KB).
- **Grenze nach EN2-28: 5,0 MB.** Überschreitet ein Paket sein Budget um mehr als 50 %, begründet CHANGES das (§15.3). Ab 4,5 MB (erreicht in Gruppe 19; nach Gruppe 18 ≈ 4,42 MB) nennt jedes Paket Dateigröße und Startzeit.

### E.5 Regeln für den Bau (ergänzt Nachtrag 1, C.5)

1. Nachtrag 1, C.5 Punkte 1–9 gelten weiter; Punkt 9 ist durch EN2-17 erweitert.
2. **Zwischenstände (EN2-15):** nach V0c, V0d, V4c, VS2 und nach jeder Gruppe an die Artifact-Adresse und auf die Pages-Seite (Repo `XanderFoxy/Synquenzer`, Zweig `main`); der githack-Spiegel (Zweig `dirigent-synth`) bekommt denselben Stand. Auf beide kommt nur ein abgenommener Stand. Vor jeder Pages-Version mit Online-Teil wird `private.settings.max_app` erhöht (Rollout R7, G.8).
3. **Tore:** VS1 (N2-VS0-02), VS3 (N7V-12), V10P und die Bibliotheks-Pakete mit Tags (PR-V), Online-Rollout (Xanders Okay je Schritt), VC4 (Xanders Antwort auf F.2 VC4; ohne Ja wird VC4 nicht gebaut, Rev. 3). Ein geschlossenes Tor verschiebt das Paket **und alle Pakete, die es nach E.3 brauchen**; nicht betroffene Pakete der Gruppe laufen weiter, danach beginnt die nächste Gruppe. Die verschobenen Pakete werden nach Öffnen des Tors vor der jeweils nächsten Gruppe gebaut. Damit die Versionen streng steigend bleiben (EN2-14), bekommen sie die nächsten freien Zwischennummern nach dem zuletzt gebauten Paket (z. B. 4.25.1, 4.25.2 …); CHANGES nennt die Zuordnung, alle anderen Nummern bleiben. Beispiele: VS0 negativ → VS1, VS2 und VS3–VS6 rücken mit; N7V-12 zu → Tausch-Regel E.1; Rollout ohne Okay → VO1/VO2 werden gebaut und mit Online „aus“ ausgeliefert (Fake-Server-Tests bestehen), live geht es erst nach dem Okay.
4. **Fähigkeiten (EN-19):** Die VS- und VO-Pakete deklarieren keine Fähigkeit; Mikrofon und Online laufen nur außerhalb der Claude-App. Ab VC3 lautet die Summe ohne die VC1-Regeln: `downloads` (wie bisher), `room: {topics: {takt, start, traeger, zeit}}`, `db: {rules: [{path: 'live', read: 'view', write: 'admin'}]}`, ab VC4 zusätzlich `sample: {}`; CHANGES führt die Summe wörtlich.
5. **Versionen:** Entfällt das optionale VS7, bleiben alle anderen Nummern.
6. **Recherche:** Bibliotheks-Pakete prüfen vor dem Bau, ob `katalog.json` neuer ist als dieser Nachtrag. Neue Belege (`b`, `s`, `h`) gelten; der Bau nimmt sie ohne neuen Nachtrag auf, die Liste steht in CHANGES.
7. **Fach-Prüfung (EN2-29):** vor jeder Abnahme nach Teil J; das Ergebnis steht in CHANGES.
8. **Größe (EN2-28):** ab 4,5 MB Startzeit je Paket in CHANGES; bei Fehlschlag zuerst ein Schlankheits-Paket.
9. **Webseite unberührt (Rev. 3, EN2-32):** Kein Paket und kein Rollout-Schritt ändert Code, Zweige außer `dirigent-synth` oder Dateien des Webseiten-Repos `XanderFoxy/Deutsch-Mit-Xander`, und kein Schritt berührt das Klassenzimmer-Projekt `rolcktiryrvjzbwuvobb`. Deckt das `sw.js` des Klassenzimmers `/Synquenzer/` ab (R0b), wird **nicht** am Webseiten-Code geändert: Online bleibt aus, und der Orchestrator fragt Xander. Die RLS-Absicherung der Klassenzimmer-Datenbank läuft getrennt (`r8/rls-klassenzimmer.md`).

---

## Teil F — Kurzantworten an Xander und offene Fragen

### F.1 Kurzantworten (für die Nachricht an Xander; Kurzfassung `antwort-kurz-8.md`)

- **Prioritäten verstanden, nichts verloren.** Gebaut wird jetzt so: V0 (läuft) → **Online** (Supabase: Anmelden, alles online gesichert, dein Kumpel per Link) und Mikro-Check → **FM-Feld wie EssenceFM** → **Song mit FANG TEIL** → **Lage-Grenzen** und **Einsingen/Einspielen → Noten** → Gesangsspur, Säubern, Audio quantisieren → Drums und Beatbox → Editor, Modulation, Klangzustände, Master → Bitmask, Additiv → **Resynthese** → **Bibliothek mit deinen Lieblings-Sounds** → Instrument-Vorlagen → gemeinsam am selben Song → Jam, Zeitraffer, KI-Helfer. Rund 380–440 Stunden reine Bauzeit.
- **Stand zum Ausprobieren:** V0a (mit Korrekturen) liegt auf deiner Seite https://xanderfoxy.github.io/Synquenzer/; bitte einmal am iPhone öffnen und sagen, ob sie lädt (von hier aus war sie nicht abrufbar, R0b). **Schon neu in V0a** (`CHANGES-V3.md`): Drums ohne Aussetzer und Doppelplanung (K-01), Hall- und Gate-Wechsel ohne Knacken (K-02), Loop-Klammer in der PianoRoll lässt sich wieder verlängern und versteckte Noten hinter dem Clip-Ende sind weg (K-05, K-06), FANG über Akkordwechsel richtig (K-07), Träger-Anzeige mit Zieltonart „+3 · → C-Dur“ (K-08), CPU-Stufe sichtbar (K-14). V0b wird gerade gebaut. Das nächste Update nach V0c (mit V0b) bringt: Tipp in der Bibliothek lädt still, ▶ hört vor, FOLGEN, Song-Fehler weg, Akkord-Chip antippen und ändern, Akkorde quantisieren; danach V0d mit den neuen FM-Hüllkurven. Beide Stände kommen in die Claude-App und auf deine Seite (EN2-15). Nach Gruppe 2: auf deiner Seite anmelden, René einladen und im Safari-Tab ⚙ → „Mikro-Check“ machen, dann „Ergebnis kopieren“ und schicken – davon hängt ab, wann das Einsingen startet (N2-VS0-02).
- **FM-Hüllkurven:** V0d macht sie DX7-genau (snappy FM-Bässe, der Modulator schneidet den Träger nicht mehr ab). Im FM-Feld kommen dann auch die EssenceFM-Hüllkurven mit bis zu 6 Punkten, Sustain und Schleife.
- **FM-Feld (Kodamo):** Handbuch komplett gelesen. 6 Operatoren, links das Feld, rechts die Werte. Ziehen verbindet, noch einmal ziehen tauscht, ins Leere fallen lassen, Doppeltipp = stumm, zwei Finger = Zusatz-Verbindung; Schieber waagrecht wie am Gerät; die kleine Zahl oben rechts ist die Feedback-Quelle. Linie antippen und Halten-Menü gibt es nicht, weil EssenceFM das nicht so macht.
- **Song (S9):** Teil gedrückt halten → nach gut einer Sekunde öffnet sich die Song-Seite von selbst (sofort, wenn du auf „SONG ⇄“ fährst) → an einen Taktstrich ziehen → er entfaltet sich in seine Clips; im Song steht nur der Name in der gelben Taktleiste. Kurz halten und vor dem Öffnen loslassen = Teil-Blatt zum Bearbeiten.
- **Online:** Das Projekt „synquenzer“ ist angelegt (noch leer). Du meldest dich auf deiner Pages-Seite mit Name, E-Mail und Passwort an; alles liegt zusätzlich online und ist nach dem Neuladen nie weg. René kommt über deinen Mitmach-Link; ihr seht nur, was ihr zwei teilt. **In der Claude-App** (und auf dem githack-Spiegel) bleibt alles nur auf dem Gerät (grauer Punkt); zum Sichern dort [In Safari öffnen und mitnehmen]. **Schon ab dem Online-Paket (Gruppe 2) wird nichts still überschrieben:** Habt ihr beide geändert, wählst du „Übernehmen“ oder „Beide behalten“. Ab Gruppe 18 arbeitet ihr gleichzeitig am selben Song, und jede Speicherung wird eine Version; Abzweigen geht wie bei BandLab. Jam wie bei Digital Musician: einer spielt, der andere hört es einen Durchlauf später, jeder Take wird eine Version. Mein Vorschlag: das Projekt vorher in eine eigene Organisation verschieben, getrennt vom Klassenzimmer (Frage O-2).
- **Mikrofon:** In der Claude-App gibt es weiter keins (heute erneut geprüft); auf deiner Pages-Seite ja. Aufnahmen bleiben auf deinem Gerät.
- **Lage-Grenzen (T):** Der Bass bleibt in seinem Bereich, die Musik folgt deiner Hand (oberes C → unteres F geht runter), die Fläche greift um, und je Akkord ziehst du ein Kästchen hoch oder runter.
- **Resynthese:** fest eingeplant, direkt nach Bitmask und Additiv. Saxofon, Klavier und Sprache sind sicher; Löwe und andere Naturklänge gehen auch, die Ampel zeigt, wie nah es klingt; der Werks-Löwe kommt nur, wenn der Hörtest N9R-38 besteht.
- **Bibliothek:** Vorher werden alle Quellen online nachgeprüft (diese Runde ging keine Websuche). Dann kommen zuerst deine Lieblinge: Vogue-Bass mit dem langsam öffnenden Filter und die „sprechenden“ Sounds, der bedrohliche And-One-Signal-Bass in vier Lesarten und der typische And-One-Bass, „Sunglasses at Night“ (Original und Slap-House-Mix), der VIZE-Slap-Bass, Second Decay und der Frozen-Autumn-Bass – mit einem Blatt, auf dem du die Lesarten vergleichst. Deine Wunsch-Sounds ohne Beleg stehen unter „Xanders Wunsch ★“ ohne Bandnamen (dazu in Gruppe 16 je ein Bass für De/Vision und Static Movement); weitere Sounds deiner Bands bekommst du als Hörtest-Dateien, bis du sagst „klingt wie …“. **Vogue:** Die Hülle nennt den Casio FZ-1; der ist nicht nur Sampler, sondern kann auch additiv (48 Obertöne) und gezeichnete Wellen – das passt zu deinem Eindruck. Ob der Bass daher kommt, ist nicht belegt.
- **Studio-Setups:** Ein Kawai K1 ist bei The Frozen Autumn nicht belegt; vermutlich meintest du den Elka Synthex („LK sind“). Dafür gibt es die Vorlage NEBEL-8, dazu Vorlagen für Moog, Prophet, Juno, Oberheim, Jupiter, PPG, K1/K4, Sampler und FM mit Filter.
- **Spezialisten:** Jedes Paket prüft vor der Abnahme ein eigener Prüf-Blick aus sechs Fachrichtungen (FM/Klangtechnik, Touch-Bedienung, Song/Sequencer, Online/Sicherheit, Sounddesign, iPhone-Leistung).
- **KI-Helfer ist nicht FANG:** FANG fängt, was du spielst. Der KI-Helfer ist Claude in der App (Klang beschreiben → Einstellungen, Mix-Fragen, Hilfe) – **nur in der Claude-App, nur für dich**: Er läuft über deine Claude-Nutzung, nicht auf der Pages-Seite und nicht für René. Beide sowie VC3 (zwei iPhones live) sind fest eingeplant; für den KI-Helfer brauche ich dein Ja zu Frage VC4.

### F.2 Offene Fragen (nicht blockierend; der Bau nimmt die Vorgabe)

| # | Frage | Vorgabe |
|---|---|---|
| **VC4** (Rev. 3) | Der KI-Helfer läuft über deine Claude-Nutzung, nur in der Claude-App (nicht auf der Pages-Seite) und nur für dich, nicht für René; ein Artifact mit KI-Helfer lässt sich nicht öffentlich teilen. Einverstanden? | ja (ohne Ja wird VC4 nicht gebaut) |
| E-K1 | Reichen 6 Operatoren genau wie bei EssenceFM? (mehr später nur über Schichten) | 6 |
| F-1 | Hochformat Amp/Tonh.: kleines Feld links, Hüllkurve rechts; für Feinarbeit ⋯ › „⤢ Hüllkurve groß“. Passt das? | ja |
| F-3 | Feedback an jedem Operator (EssenceFM: nur 1 und 2)? Nötig, damit die DX-Seite dieselben Nummern zeigt. | ja |
| F-4 | Zwei Finger auf schon verbundene Operatoren = Verbindung lösen? | ja |
| F-5 | Linie zeichnet sich beim Verbinden kurz auf (ohne Dauer-Lauf)? | ja |
| F-6 | Weißt du (oder ein Video), wo ein Operator auf der EssenceFM landet, wenn man ihn auf einen anderen zieht, und ob seine Modulatoren mitwandern? | Regeln R5–R7 |
| F-7 | Sinus (Welle 0) bleibt fest, damit DX-Klänge bitgleich bleiben? | ja |
| S-1 | Zu spät gedrückt: zählt die Hälfte des neuen Takts (50 %) oder nur das erste Viertel (25 %)? | 50 % |
| S-2 | „Ersetzen“ beim Ablegen löscht in diesen Takten auch die Melodie? | ja |
| S-3 | Halten macht nur diesen Durchlauf zum eigenen Clip ([Ganzer Block] für mehr)? | Durchlauf |
| S-4 | Stummschalten (M) beim FANG TEIL mit einfangen? | nein (später) |
| S-5 | Teil-Namen Intro · Strophe · Pre · Refrain · Bridge · Break · Outro – fehlt einer? | so |
| S-6 | Tipp auf die Taktleiste wählt nur (gelb) und spielt nicht sofort? | ja |
| S-7 | Teil-Tasten auch in der Song-Ansicht im Hochformat (wäre eine zusätzliche Zeile)? | nein |
| S-8 (Rev. 2) | Teil halten: Nach gut 1 s öffnet sich die Song-Seite von selbst, auch ohne Bewegung (wie du es beschrieben hast); wer vorher loslässt, bekommt das Teil-Blatt. Passt das? (K2-35) | ja |
| S-9 | Clip im Song halten → kleines Blatt [Eigener Clip] [Ganzer Block]; erst der Tipp macht den echten Clip. Passt das? (K2-24) | ja |
| S-10 (Rev. 3) | „Loop erweitern“: meinst du, den laufenden Loop live zu verlängern (×2 mit Kopie, ohne Anhalten) und gleich weiter einzuspielen? Heute geht das über Clip-Blatt [×2] und REC/Overdub. | ja, später als eigenes Paket |
| M-2 | Singst du mit Kopfhörern (Kabel oder Bluetooth) oder über den Lautsprecher? | beides, Einmessen je Weg |
| M-3 | Beatbox: welche Laute für Kick, Snare, HiHat? | b / k / ts |
| M-4 | Gesangsspur nur zum Merken oder fertiger Gesang? | beides; keine Tonhöhenkorrektur |
| B-1 | Signal-Bass aus „Ghama Voodoo“: welche Lesart (Signalbass, Funkfeuer, Peilsender, Grollbass FM)? Bei welcher Minute? | Blatt „Lesarten“ in V10P |
| B-2 | Vogue „Vom Himmel hoch“: Synth-Bass oder E-Bass? Hast du ein Foto der CD-Rückseite? | Synth |
| B-3 | Je Wunsch eine oder zwei Lesarten behalten? | alle, bis du wählst |
| B-5 | The Frozen Autumn „Kawai K1“: woher stammt die Info? War „LK sind“ der **Elka Synthex**? | Synthex (Vorlage NEBEL-8), kein Geräte-Eintrag ohne Quelle |
| B-6 | DX7-Werksklänge (ROM) erst nach Klärung der Lizenz? | nicht ausliefern |
| B-7 | Dürfen die Genre-Demos auch deine ★-Sounds ohne Beleg benutzen (z. B. Körperbass im Body-Pop-Demo)? | ja, ohne Vorbild-Namen |
| B-8 | Welche Lieder von The Midnight mag dein Kumpel am meisten? | Bibliothek nimmt die belegten Klänge |
| B-9 | Alphaville „Dance With Me“: Welcher Klang genau? Ein Zeitstempel reicht. | Utopia-Glas (N03) |
| B-10 | Second Decay: Bass, Lead oder Stakkato – oder alle drei? | alle drei |
| B-11 | Falls die Quellen vor der Bibliothek nicht online geprüft werden können: trotzdem bauen (ungeprüfte Belege als „schwach belegt“) oder warten? | bauen |
| B-12 (Rev. 3) | And One deutschsprachig: welche Stücke meinst du (z. B. „Deutschmaschine“, „Krieger“)? | SZ-01 Körperbass (16tel mit Oktavsprung); SZ-02 Paradestab im Hörtest PO-1 |
| E-1 | 3/4- und 6/8-Takt im Song? | später |
| E-2 | Vorbild-Paket früher (nach Gruppe 12) statt am Anfang von Gruppe 15? | so lassen |
| O-1 | Gemeinschafts-Bibliothek über VO3 (nur auf deiner Pages-Seite) statt VC1 (in der Claude-App)? | VO3 |
| O-2 | Supabase-Projekt „synquenzer“ vor dem ersten Live-Betrieb in eine eigene, kostenlose Organisation verschieben (getrennt vom Klassenzimmer)? | ja |
| O-3 | Mitwirkenden-Liste je Song (wer hat welche Spur gespielt)? | nein, später |
| O-4 | Jam wie bei Digital Musician: einer spielt, der andere hört es einen Durchlauf später – reicht das? | ja |
| O-5 | Ihr habt beide denselben Clip geändert: „Beide behalten“ als Variante im selben Feld oder in der nächsten freien Szene? | Variante |
| O-6 | Renés Änderungen am nächsten Taktanfang einspielen statt sofort? | ja |
| O-7 | Abzweigen: Standard „Nur ich“ oder „Mit René“? | Nur ich |
| O-8 | Die übrigen Vorgaben aus `r7/online.md` §10 (Wach-Ping täglich, Anmelde-Bremse 12 Konten/5 am Tag, CAPTCHA, Registrierung ohne Link-Zwang, Name nicht suchbar) bleiben? | ja |
| L-1 | Soll die Fläche umgreifen wie ein Keyboarder, oder wie heute parallel mitspringen? | umgreifen; parallel = Rolle Sequenz |
| L-2 | Soll die Musik beim Spielen deiner Hand folgen (tiefer greifen = tiefer)? | ja |
| L-3 | Darf ein Pfeil ↑ auch den Bass mitnehmen, solange er in seiner Klammer bleibt? | ja, nie über die Klammer |
| R-1 | Löwe: Nimmst du im Zoo selbst einen auf (Sprachmemo reicht), oder nehmen wir eine freie Aufnahme? | freie Aufnahme, deine ersetzt sie |
| R-2 | Soll die sprechende Fläche mit deiner Stimme sprechen (ein Satz, 2–3 s)? | freie Stimme (Thorsten-Voice, CC0) |
| R-3 | Reichen 8 Sekunden je Klang? | ja |

Entfallen gegenüber Revision 1: E-K2 (K2-44), E-K3 (V4f fest), M-1 (Pages ist die eigene Adresse), B-4 (Tiga & Zyntherius: beide Lesarten, D.3a).

---

## Teil G — Online und Zusammenarbeit (VO1, VO2, VO3, VO4a–VO4c, VC3, VC3b) (neu, EN2-22, EN2-27)

Grundlage: `r7/online.md` (verbindlich §2–§9, mit `r7/online-schema.sql` und `r7/online-test/`), `r8/zusammenarbeit-modell.md` (§5–§13 und Nachtrag N-DM), `r7/spezial-digitalmusician.md` (§6–§7). Diese Dateien gelten durch Verweis; Teil G nennt Pakete, Versionen, Reihenfolge und die Änderungen.

### G.1 Fakten

| # | Aussage | Status | Quelle |
|---|---|---|---|
| G1 | Supabase-Projekt `synquenzer`, ref `dbdnsryoivvezspgydpx`, Region `eu-central-1`, `ACTIVE_HEALTHY`, Postgres 17.11.0.003, angelegt 17.10.2026 10:29 UTC; Schema `public` ohne Tabellen | BELEGT (Supabase-MCP, 17.10., nur gelesen) | N2.0.2 Nr. 8 |
| G2 | Es liegt in **derselben Organisation** wie das Klassenzimmer-Projekt „XanderFoxy's Project“ (`rolcktiryrvjzbwuvobb`, eu-west-2). `online.md` §2.1 empfiehlt eine eigene Organisation, weil Kontingente, Egress und Einschränkungen je Organisation gelten. | BELEGT (MCP `list_projects`); Kontingent-Regel [Doku] laut `online.md` §2.1 | N2.0.2 Nr. 8 |
| G3 | Zwei aktive kostenlose Projekte je Owner/Admin, über alle Organisationen gezählt; Projekte lassen sich per Selbstbedienung in eine andere Organisation übertragen. | BELEGT (Supabase-Doku, MCP `search_docs`) | https://supabase.com/docs/guides/platform/billing-faq · https://supabase.com/docs/guides/platform/project-transfer |
| G4 | Repo `XanderFoxy/Synquenzer`: öffentlich, `main`, `has_pages: true`, `index.html` = V0a-fix | BELEGT (`gh api`) | N2.0.2 Nr. 10 |
| G5 | Pages-Adresse `https://xanderfoxy.github.io/Synquenzer/`; Erreichbarkeit, Schreibweise des Pfads und `sw.js`-Bereich des Klassenzimmers ungeprüft | Auftrag; hier nicht abrufbar (Proxy 403) | N2.0.2 Nr. 11 |
| G6 | Free-Plan: 500 MB Datenbank, danach nur lesen; Pause nach 7 Tagen ohne Aktivität, Wiederherstellen bis 90 Tage; Realtime 200 Verbindungen, 100 Nachrichten/s, Presence 20/s; Auth-Mails ohne eigenen SMTP nur an Team-Mitglieder | [Doku] laut `online.md` §2.1–§2.5 | `online.md` „Quellen“ |
| G7 | Im Claude-Viewer blockiert die Plattform Verbindungen zu fremden Hosts; Online ist dort aus. | laut `online.md` §2.7 (Seitenvertrag des Artifact-Werkzeugs) | – |
| G8 | Digital Musician (2005–2018) verband zwei Studios über ein Plug-in; der Partner spielte zur Wiedergabe des Besitzers ein, die Aufnahme kam zeitgenau ins Projekt; Versionen oder Zweige sind nicht belegt. | BELEGT bzw. WAHRSCHEINLICH (nur WebSearch-Auszüge, `spezial-digitalmusician.md` §1–§3) | dort D1–D22 |
| G9 | Lokale Prüfungen: RLS-/RPC-Matrix in PGlite 0.5.8 (Postgres 18.3) mit Supabase-Nachbau, Fake-Server 11/11; **kein** echtes Projekt berührt | gemessen (`online-test/`) | `online.md` §3.4, §7.7 |

### G.2 Entscheidungen

1. **Online ist fest** (EN2-22): VO1 und VO2 in Gruppe 2, VO3 und VO4a–VO4c in Gruppe 18, VC3b in Gruppe 19.
2. **Nur auf der eigenen Herkunft:** Online läuft nur auf der Pages-Seite. Claude-Viewer und githack zeigen dauerhaft „Nur auf diesem Gerät – nicht online“ und bieten [In Safari öffnen und mitnehmen] (N8O-01, N8O-05).
3. **Anmeldung, Schutz, Räume, nie verloren:** wie `online.md` §2.4, §2.4b, §3, §4 (offene Registrierung mit Name, E-Mail und Passwort, „Confirm email“ aus, Turnstile, Anmelde-Bremse 12/5, Probe-Quote 5 MB, Gesamt-Grenze 380 MB, Paar-Räume nach O3, lokal zuerst mit Postausgang und Server-Autosave, Konflikte behalten beide Fassungen).
4. **Zusammenarbeit am selben Song:** Versionen mit weichen Sperren je Teil, **kein CRDT** (`zusammenarbeit-modell.md` §11). Ab VO4a wird jede Speicherung eine unveränderliche Version (§6).
5. **Lehren aus Digital Musician** (L1–L9): Fern-Einspielen mit Song-Position statt Uhrzeit, Jam-Take als Version, Spur-Zuteilung = Anwesenheit, keine öffentliche Börse, ein Link statt Hürden, kein eigenes Gegensprechen oder Video, „Alles exportieren“ mit Verlauf, Mitwirkenden-Liste nur auf Wunsch (O-3), Standard-Realtime statt eigener Technik.
6. **Organisation:** Vor dem ersten Live-Schritt (R2) schlägt der Orchestrator Xander vor, `synquenzer` in eine eigene Free-Organisation „SYNQUENZER“ zu übertragen (O-2, Vorgabe ja). Lehnt er ab, bleibt das Projekt, wo es ist; Restrisiko: eine Kontingent-Einschränkung träfe auch das Klassenzimmer (G2).
7. **Audio bleibt lokal** (C.2 Punkt 5, N2-VS1-02).
8. **VC1 entfällt**, VO3 übernimmt die Gemeinschafts-Sounds (EN2-27).

### G.3 Paket VO1 — Anmelden, Server-Autosave, eigene Adresse, Offline-Neuladen

**Ziel.** Alles, was Xander macht, liegt zusätzlich online und ist nach dem Neuladen nie weg (O1, O4); Anmelden auf der Pages-Seite (O2).

**Umfang** (`online.md` §9 VO1):
1. Migration `vo_init` (= `online-schema.sql`, Teile A und B; Teil 8 Audio nicht) – eingespielt im Rollout R2, nur mit Xanders Okay.
2. SYNC-Kern (§4, §7.2): lokal zuerst, Postausgang je Konto, Geräte-Kennung `cloud:device`, Server-Autosave 2 s nach der letzten Änderung (auch während eines Konflikts), Start-Abgleich mit `isPristine`, Versions-Wächter (`max_app`, `max_format`), Versionen ansehen und zurückholen, [Als Kopie öffnen], eigene Sounds über `save_library`.
3. supabase-js 2.117.2 nur bei Bedarf (§2.3): zuerst `vendor/supabase-js-2.117.2.umd.js` neben `index.html` im Pages-Repo, sonst jsDelivr; beide mit SRI; nie im Viewer, nie auf githack.
4. Anmelde-Blatt (§6.2) mit echtem Formular, offener Registrierung, „findbar“-Schalter, Turnstile (`CLOUD.captcha`), Texten der Anmelde-Bremse und [Passwort ändern]; Status-Punkt am Menü-Knopf (§6.1); Online-Abschnitt; kleine Bildschirme (§6.10).
5. `sw.js` mit Bereich `/Synquenzer/`: network-first für `index.html`, cache-first für die vendor-Datei; Neuladen ohne Netz startet die App (T3b).
6. Viewer und githack: Zustand „Nur auf diesem Gerät“, [In Safari öffnen und mitnehmen] (`#import=`).
7. Manifest, Icons und lokale Schriften für die Home-Bildschirm-App (K2-08).

**Nicht-Umfang.** Anfragen, Räume, Realtime (VO2); Audio online; Magic Link, Code-Mail, Passwort-Reset per Mail (ohne SMTP, §2.4).

**Berührungspunkte.** `online.md` §7.1 (Stellen in V0a), §7.2 (Modul `SYNC`), §7.3 (keine Migration des Projektformats), §7.4 (Undo und Verlauf unberührt), §7.6 (Test-API).

**Dauer** 6–7 h · **App-Version** 3.5.0 · **Budget** +38 KB in `index.html` (die vendor-Datei mit 217 945 Byte liegt daneben).

**Abnahme.** N8O-01 … N8O-20b (`online.md` §7.8; N8O-19 nach K2-46), N2-VO1-01, N2-VO1-02. **Tests.** `online.md` §7.7 (T1–T4 mit `fake-supa.mjs`, `rls-matrix.mjs`; berühren nie das echte Projekt). **Fach-Prüfung** FP-SICHER (blockierend), FP-IPHONE.

### G.4 Paket VO2 — Anfragen, Paar-Räume, Realtime, Abzweigen

**Ziel.** Zusammenarbeit nur auf Anfrage und streng paarweise (O3); speichert der Kumpel, sieht Xander es sofort (O1); ein Stand lässt sich abzweigen, das Original bleibt (Runde 9, BandLab-Fork).

**Umfang.**
1. `online.md` §9 VO2: Suchen (Code, genauer Name nur bei „findbar“), Anfragen, Annehmen/Ablehnen, Zurückziehen, Paar-Räume, Teilen (mit Herkunfts-Raum), Raum-Listen mit Autor und Zeit, Realtime-Abos und Toasts, Konflikt-Wahl [Übernehmen] [Beide behalten], Presence-light („René arbeitet gerade an …“), Zusammenarbeit beenden, Mitmach-Link, Konten-Blatt für Xander (Vertrauen, Sperren, Sperren + Daten löschen, Aufräumen), „✓ Verwalter“ auf Karte und Treffer.
2. **Abzweigen** (`zusammenarbeit-modell.md` §8.1, hier auf dem r7-Schema): Verlauf → Fassung → [Abzweigen] → neues Projekt mit Verweis „abgezweigt von <Titel>, Fassung n (<Name>, <Datum>)“, Ort „Nur ich“ oder der Raum der Quelle; nie ein anderer Raum (`mixed_origin`). Migration-Ergänzung: `projects.forked_from_project`, `projects.forked_from_version`, RPC `fork_project` nach den r7-Regeln (SECURITY DEFINER, `search_path=''`, Rechte über `private.can_write`), neue Fälle in `rls-matrix.mjs`.
3. **Geräte-Werte lokal** (`zusammenarbeit-modell.md` §8.4 Punkt 4, ZA-13): Felder, die nur ein Gerät betreffen (Ansicht, Auswahl, Metronom-Lautstärke, Eingabe-Oktave; Liste `DEVICE_KEYS` in CHANGES), gehen nicht in den Server-Text und bleiben je Gerät lokal. Keine Änderung des Projektformats.

**Dauer** 8–9,5 h · **App-Version** 3.6.0 · **Budget** +40 KB · **braucht** VO1.

**Abnahme.** N8O-21 … N8O-30b, N2-VO2-01, N2-VO2-02. **Fach-Prüfung** FP-SICHER (blockierend), FP-TOUCH.

### G.5 Paket VO3 — Anwesenheit und Sounds im Raum (ersetzt VC1)

**Ziel.** „René ist da“; Freunde teilen eigene Sounds mit Namen, und Xander hat sie alle in seiner Bibliothek (Wunsch I7).

**Umfang.** `online.md` §9 VO3 ohne die Jam-Brücke (→ VC3b) und ohne Audio: Presence auf dem privaten Kanal `space:<id>` (Realtime „Allow public access“ aus, R5); `space_sounds` (≤ 64 KB je Sound, Laden über `normalizeSound`, Texte nur per `textContent`); Bibliothek-Chip „Von <Name>“ je Raum.

**Dauer** 4–5 h · **App-Version** 5.6.0 · **Budget** +20 KB · **braucht** VO2, V10a.

**Abnahme.** N8O-31, N8O-32, N8O-33, N2-VO3-01.

### G.6 Pakete VO4a, VO4b, VO4c — gemeinsam am selben Song (`zusammenarbeit-modell.md` ZA-A, ZA-B, ZA-C)

| Paket | Inhalt | Version | Budget | Dauer | braucht | Abnahme |
|---|---|---|---|---|---|---|
| **VO4a** Versionen und Teile | Projekt in Teile zerlegt (Projekt-Kopf, Spur-Kopf, Klang, Clip, Song-Spur und – Rev. 3, K2-65 – **Analyse**: `p.resyn.data` je `rid`, Hash über die Daten, der Klang verweist nur auf `rid`; Hash über kanonischen JSON-Text) mit den `uid` aus V2a; Migration `vo_parts`: `parts`, `versions` (unveränderlich, Trigger gegen UPDATE/DELETE), `projects.head_version`; RPCs `commit_version`, `fork_project` (mit Teilen), `get_parts`, `version_list` (§9); Überführung der VO1/VO2-Fassungen (`kind 'import'`); jede Speicherung eine Version, Ausdünnen entfällt, Füllstand bleibt (Warnung ab 80 %); Postausgang je Teil; Speicherpunkt am Ende jeder Geste (höchstens alle 2 s, spätestens alle 20 s); Verlauf (m4), Zurückholen, Abzweigen (m5); **„Alles exportieren“** mit Verlauf und Import ohne Server (L7) | 5.7.0 | +35 KB | 6–7 h | VO2, V2a | ZA-01, ZA-02, ZA-09, ZA-10, ZA-12, ZA-13, ZA-14, DM-05, N2-VO4a-01 … N2-VO4a-03 |
| **VO4b** Gleichzeitig arbeiten | Anwesenheit mit Fokus `{art: 'clip' │ 'klang' │ 'spur', …}` (oranger Ring); weiche Sperre (m2: Zuschauen, Eigene Variante, René fragen); fremde Teile taktgenau einspielen (am nächsten Taktanfang, Clips am Loop-Ende; steht der Transport, sofort; 3 s Leuchten); Zusammenführen je Teil nach der 3-Wege-Tabelle §7; Konflikt-Karte (m3: ▶ Deine, ▶ Renés, Beide behalten, Später) und Varianten; Regeln §10 (keine Fachwörter, erst hören, keine Karte mitten im Spiel, wer zuerst kam, behält den Kopf) | 5.8.0 | +35 KB | 7–8 h | VO4a | ZA-03 … ZA-08, ZA-15, N2-VO4b-01 |
| **VO4c** Übernehmen | Übernehmen aus einem Zweig oder einer Version mit A/B je Teil (m6): nur der Hash des Teils wird ersetzt, Teile, die beide geändert haben, nur „Als Variante“; neue Version mit `merge_from`. *(Mitwirkenden-Liste L8 nur, wenn O-3 ja: +0,5 h)* | 5.9.0 | +20 KB | 4–5 h | VO4b | ZA-11, N2-VO4c-01 |

**Nicht-Umfang.** ZA-D (Broadcast-Vorschau beim Ziehen, gemeinsamer Start; später). **Fach-Prüfung** FP-SICHER (blockierend bei VO4a und VO4b), FP-SONG, FP-TOUCH. **Messung** ZA-05 (Verzögerung Speichern → sichtbar beim Partner, Median ≤ 3 s) läuft gegen das echte Projekt, mit Xanders Okay.

### G.7 VC3 und VC3b — zwei Geräte, Jam, Fern-Einspielen (dazu VC2b, VC2c, VC4)

- **VC3** gilt wie Nachtrag 1, Teil B (R0 Raum-Check, R1 Taktsynchron, Kanäle über `room` in der Claude-App, VC3-01 … VC3-12), mit drei Änderungen (K2-49): fest (kein Tor E.7 mehr), Song statt Kette (K2-22), Version 5.10.0.
- **VC3b (neu)** — Jam auf der Pages-Seite und Fern-Einspielen:
  1. **Gleiche Logik, zweiter Weg:** R0 und R1 aus VC3 laufen über einen privaten Supabase-Kanal `space:<id>:jam` (Broadcast und Presence, Rechte wie VO2/VO3), nur zwischen den zwei Mitgliedern eines Paar-Raums. In der Claude-App bleibt `room`.
  2. **Fern-Einspielen** (VC3-R1b, L1): Jedes live gespielte Ereignis trägt `{szene: uid, spur: uid, takt, tick}` relativ zum Taktanker des TAKTGEBERs; beim Partner erklingt es im **nächsten Loop-Durchlauf** desselben Clips an derselben Song-Position. Noten je Schlag gebündelt (im Mittel ≤ 2,5 Nachrichten/s je Spieler, keine Nachricht > 4 KiB).
  3. **Jam-Take als Version** (L2): Endet ein eingespielter Durchlauf (Loop-Ende oder Stopp), speichert das Gerät des Spielers den Clip als Version „Jam-Take n · <Name>“ (`commit_version`, VO4a); bei Funkloch im Postausgang.
  4. **Spur-Zuteilung = Anwesenheit** (L3): „Dieses Gerät spielt: …“ setzt den Fokus `{art: 'spur'}`; auf dieser Spur gilt für den anderen die weiche Sperre (VO4b).
  5. **Klartext nach R0** (L5): „Jam geht gut“ / „Jam geht, Partner hört dich einen Durchlauf später“ / „Nur zeitversetzt“. Fern-Einspielen geht auch bei langer Laufzeit; die R0-Schwelle (Median ≤ 150 ms) gilt nur fürs gemeinsame Starten.
  - **Nicht-Umfang:** Audio, Gegensprechen, Video (L6), öffentliche Börse (L4).
  - **Dauer** 4–5 h · **App-Version** 5.11.0 · **Budget** +25 KB · **braucht** VC3, VO2, VO4b, V2a.
  - **Abnahme:** N8O-34 (VC3-01 … VC3-12 mit Supabase-Fake und einstellbarer Laufzeit), DM-01 … DM-04, DM-06, N2-VC3b-01.
- **VC2b, VC2c, VC4** gelten wie Nachtrag 1, Teil B, mit den Versionen 5.12.0, 5.13.0, 5.14.0 und K2-22. VC4 ist fest; sein Tor bleibt als Zustimmung (Anfragen über Xanders Claude-Nutzung; ein Artifact mit `sample` lässt sich nicht öffentlich teilen; kein KI-Helfer für Eingeladene). **Rev. 3:** Das Tor ist Xanders Antwort auf **F.2 VC4**; der KI-Helfer läuft nur in der Claude-App (`sample`), nicht auf der Pages-Seite.

### G.8 Rollout (Orchestrator; ergänzt `online.md` §8)

Jeder zustandsändernde Schritt erst nach **Xanders ausdrücklichem Okay**. Nie im Projekt „XanderFoxy's Project“ (Klassenzimmer, `rolcktiryrvjzbwuvobb`).

| # | Schritt | Stand 17.10.2026 | offen |
|---|---|---|---|
| R0 | Entscheidungen | offene Registrierung ✓ (17.10.), eigene Adresse Pages ✓, Region `eu-central-1` ✓ | eigene Organisation (O-2), Wach-Ping (Vorgabe ja) |
| R0b | Eigene Herkunft | Repo `XanderFoxy/Synquenzer` mit Pages ✓ (G4) | Pages-Quelle `main` bestätigen; `https://xanderfoxy.github.io/Synquenzer/` lädt die App; `sw.js` des Klassenzimmers deckt `/Synquenzer/` nicht ab; Schreibweise festhalten (N2-VO1-01). **Rev. 3:** Deckt es den Pfad doch ab, wird **nicht** am Webseiten-Code geändert (EN2-32, E.5 Nr. 9): Online bleibt aus, der Orchestrator fragt Xander. |
| R1 | Projekt | angelegt ✓ (G1) | Transfer in eine eigene Free-Organisation (Dashboard → Project Settings → Transfer project), danach `list_projects` |
| R2 | Migration `vo_init` | Schema leer ✓ (G1) | `apply_migration` mit ref `dbdnsryoivvezspgydpx` (vorher zweimal vergleichen); `list_tables` zeigt die Tabellen; `get_advisors(security)` ohne ERROR |
| R3 | Auth | – | Email an, Signup an, Confirm email aus, Mindestlänge 8; Site URL und Redirect URL = `https://xanderfoxy.github.io/Synquenzer/`; Hook „Before User Created“; Turnstile gleichzeitig mit der ersten Online-Version; Pflicht-Probe `signup_open = false` |
| R4–R13 | Verwalter, Realtime privat, Schlüssel (nur Publishable Key), Ausliefern (`max_app`, `max_format`), Probe, Freunde, Wach-Ping, Sicherung, Passwort-Reset, Aufräumen | – | wie `online.md` §8, mit Repo `XanderFoxy/Synquenzer` |
| R14 | Migration `vo_parts` (VO4a) | – | vorher [Alles sichern] und Prüfung in PGlite mit `rls-matrix.mjs`; der Free-Plan hat keine Branches (eK) |

### G.9 Zusatz-Abnahme

- [ ] **N2-VO1-01 Herkunft und Pfad:** `CLOUD.origin` = `https://xanderfoxy.github.io`, `CLOUD.path` = `/Synquenzer/`; `sw.js` mit `scope: '/Synquenzer/'`; supabase-js lädt nur, wenn `location.origin === CLOUD.origin` und der Pfad mit `CLOUD.path` beginnt. Mit githack- und Viewer-Attrappe: 0 Anfragen an `*.supabase.co` und an die vendor-Datei. **Rev. 3 (K2-69):** Weicht `location.pathname` nur in der Groß-/Kleinschreibung von `CLOUD.path` ab (z. B. `/synquenzer/`), leitet die App vor dem Start mit `location.replace` auf die kanonische Adresse um; ein Projekt-Import mit `#import=` bleibt dabei erhalten. Test mit der Attrappe `/synquenzer/` → Umleitung, danach 1 Anfrage an supabase.
- [ ] **N2-VO1-02 Rollout-Protokoll:** CHANGES nennt je Schritt R0–R8 Datum, Xanders Okay, die ref (zweimal verglichen), die Organisation nach R1 und das Advisor-Ergebnis nach R2. Kein MCP-Aufruf nennt `rolcktiryrvjzbwuvobb` (Protokoll der Aufrufe).
- [ ] **N2-VO2-01 Abzweigen:** Aus Fassung 3 eines Projekts im Raum „Mit René“ entsteht ein neues Projekt in „Nur ich“ mit Verweis; Kopf und alle Fassungen des Originals bleiben byte-gleich (md5); Abzweigen in einen anderen Raum ist nicht möglich (`mixed_origin`); René sieht das neue Projekt nicht.
- [ ] **N2-VO2-02 Geräte-Werte lokal:** Gerät A ändert nur Ansicht, Auswahl und Metronom-Lautstärke → kein `save_project`, Server-Text unverändert (md5), Gerät B unverändert.
- [ ] **N2-VO3-01 Ersatz für VC1:** René teilt einen Sound in „Mit René“ → bei Xander unter „Von René“ mit Namen ≤ 2 s; David sieht ihn nicht; Laden über `normalizeSound`; ein Sound-Name mit Anweisungstext ändert nichts (nur `textContent`).
- [ ] **N2-VO4a-01 Alte Fassungen übernommen:** Projekt mit 12 VO1-Fassungen → nach `vo_parts` 12 Versionen `import` plus Kopf; jede lädt deep-equal zum alten Text (nach `normalizeProject`); `rls-matrix.mjs` mit neuen Fällen für `parts` und `versions` bestanden.
- [ ] **N2-VO4a-02 Unveränderlich:** UPDATE und DELETE auf `versions` und `parts` als `authenticated` scheitern (ZA-02); `purge_project` nur für eigene, private Projekte im Papierkorb.
- [ ] **N2-VO4a-03 Analysen als eigene Teile (Rev. 3, K2-65):** Projekt mit 8 Resynthese-Analysen à 60 KB; ein Regler an einem Resynthese-Klang geändert → die neue Version lädt ≤ 4 KB hoch, die Hashes der Analyse-Teile bleiben gleich; `get_parts` liefert jede Analyse genau einmal; Laden ist deep-equal. Erst mit bestandenem Punkt entfällt der Hinweis aus N2-9d-01.
- [ ] **N2-VO4b-01 Undo und fremde Teile:** Xander macht einen Schritt rückgängig, dessen Teil René danach geändert hat → Konflikt-Karte statt stillem Rücksetzen; jedes gespeicherte Undo ist eine neue Version.
- [ ] **N2-VO4c-01 Probehören ohne Speichern:** ▶ Deins und ▶ Seins spielen den Teil im Loop mit dem aktuellen Rest des Songs; das Probehören erzeugt keine Version und ändert `project()` nicht.
- [ ] **N2-VC3b-01 Ein Jam, zwei Wege:** VC3-01 … VC3-12 bestehen mit dem `room`-Mock (Claude-App) und mit dem Supabase-Fake (Pages); die Wahl hängt nur an `window.claude` bzw. `CLOUD`; David kommt nicht in `space:<XR>:jam`. **Rev. 3:** Jam läuft, ein Partner startet eine Take-Aufnahme → beide sehen „Jam pausiert – <Name> nimmt auf“, nach dem Ende ≤ 5 s Wiederaufnahme ohne Verlust (Postausgang, N2-VS1-02).

### G.10 Korrekturen

| # | Stelle | Korrektur |
|---|---|---|
| **K2-46** | `r7/online.md` | (1) Status „Entwurf zur Freigabe“ → verbindlich (EN2-01, EN2-22). (2) Repo und Adresse: `xanderfoxy/synquenzer` → `XanderFoxy/Synquenzer`, `https://xanderfoxy.github.io/Synquenzer/` (Site URL, Redirect URL, `CLOUD.path`, `sw.js`-Bereich, R0b, R7, R10); ob die Kleinschreibung auch lädt, ist ungeprüft. (3) §2.3: die vendor-Datei liegt im Pages-Repo neben `index.html`, nicht im Zweig `dirigent-synth`. (4) §0, §2.1, R1: Das Projekt ist angelegt, aber in der Organisation des Klassenzimmers → Transfer (O-2). (5) N8O-19: `index.html` +≤ 38 KB (wie §9) statt 35 KB. (6) §9: „VO3 optional“ → fest; die Jam-Brücke aus VO3 ist VC3b; „VC1 nur behalten, wenn …“ → VC1 entfällt (EN2-27); „Audio-Speicher erst mit VS“ ist nicht Teil von v3. (7) §9 Reihenfolge „V0 → VO1 → V4 → VO2 → V2“ → V0 → VO1 → VO2 → V4 → V2 (Teil E). |
| **K2-47** | `r8/zusammenarbeit-modell.md` | (1) Phasen ZA-A, ZA-B, ZA-C sind die Pakete VO4a, VO4b, VO4c; ZA-D bleibt später; Fern-Einspielen und Jam-Take gehören zu VC3b. (2) §8.4: Bis VO4a gelten die r7-Regeln (`save_project`, Ausdünnen der automatischen Fassungen); ab VO4a „jede Speicherung eine Version“; die r7-Fassungen werden überführt (N2-VO4a-01). (3) „Format 4: `uid`“ kommt mit V2a (N2-2a-01); „Geräte-Einstellungen aus der Projektdatei“ schon mit VO2 als SYNC-Filter ohne Formatänderung (N2-VO2-02). (4) §9 ist eine Skizze; `vo_parts` wird vor VO4a lokal in PGlite mit `rls-matrix.mjs` geprüft. (5) §15 Fragen 2–4 → O-5 … O-7; Frage 1 ist beantwortet (Digital Musician). |
| **K2-48** | `r7/spezial-digitalmusician.md` | VC3-R1b „Fern-Einspielen“ ist Teil von VC3b; „Alles exportieren mit Verlauf“ (L7) ist Teil von VO4a; DM-01 … DM-06 gelten wörtlich (DM-05 bei VO4a, die übrigen bei VC3b); F1 → O-4, F2 → O-3. |
| **K2-65** (Rev. 3) | G.6 VO4a (Teil-Arten), `r8/zusammenarbeit-modell.md` §5 („Teil“), I.4 D6, N2-9d-01 | VO4a kannte keine Teil-Art „Analyse“; eine Analyse (≤ 60 KB) hätte im Teil „Klang“ gesteckt und jede Klang-Änderung bis 60 KB neu hochgeladen. Neu: Teil-Art **Analyse** (`p.resyn.data` je `rid`), der Klang verweist auf `rid`; Prüfung N2-VO4a-03; erst danach entfällt der Hinweis aus N2-9d-01. |
| **K2-69** (Rev. 3) | N2-VO1-01 (`CLOUD.path` = `/Synquenzer/`), K2-46 (2) („ob die Kleinschreibung auch lädt, ist ungeprüft“) | Lädt dieselbe Seite auch unter `/synquenzer/`, schlüge der Pfad-Vergleich still fehl (Online aus, `sw.js` greift nicht) und Xander hielte lokal Gespeichertes für online gesichert. Neu: Umleitung auf die kanonische Schreibweise vor dem Start (N2-VO1-01). |
| **K2-49** | Nachtrag 1, Teil B (VC1–VC4, B.0) | VC1 entfällt (EN2-27). VC3: Tor (Frage E.7) entfällt, Nicht-Umfang „Live-Noten aus der Ferne“ entfällt (VC3b), Version 5.10.0. VC4: fest, Tor bleibt als Zustimmung, Version 5.14.0. VC2b 5.12.0, VC2c 5.13.0. Die Summe der Fähigkeiten nach B.0 gilt ohne die VC1-Regeln (E.5 Punkt 4). |

### G.11 Risiken

Wie `online.md` §10 und `zusammenarbeit-modell.md` §11, dazu: dieselbe Organisation wie das Klassenzimmer (G2, O-2); dieselbe Herkunft wie die Pages-Seiten des Klassenzimmers (C12, R0b); die SQL-Prüfung lief in PGlite mit Postgres 18.3, das echte Projekt hat Postgres 17.11 (nur Funktionen ab Postgres 15 benutzt; nach R2 die Advisors laufen lassen); die Migration `vo_parts` verändert gespeicherte Fassungen (vorher [Alles sichern], R14); echte Laufzeiten, Hintergrund-Verhalten und Speicher-Löschung am iPhone sind ungemessen (ZA-05 und R0 messen sie).

---

## Teil H — Lage-Grenzen (VL) (neu, EN2-23)

Grundlage: `r7/transposition-lage.md` (verbindlich §3, §5–§8) mit dem Prototyp `r7/lage-proto/`. Diese Stellen gelten durch Verweis; Teil H nennt Ort, Version, Nachrüstungen und Zusatz-Abnahme.

### H.1 Befund (BELEGT, gemessen an V0a, `transposition-lage.md` §1)

- Beim Transponieren nimmt jeder Clip heute den kürzesten Weg zu **seinem eigenen** Grundton (−5 … +6 Halbtöne, `octaveMode: 'nearest'`), egal wo die Hand greift. Vom oberen C auf das untere F geht ein C-Clip deshalb +5 (höher), ein a-Moll-Clip beim selben F −4: „manche Sequenzen klingen höher“ (`repro-ist.out` A, B).
- Grenzen je Spur gibt es nicht; der Bass kann seine Lage verlassen (§1.4).
- Vorbilder (Quelle sagt, §2): Yamaha Genos/PSR (Style File Format, Note-Transposition-Regeln NTR/NTT, High Key, Note Limit), Korg Pa, Logic Session Player, Cubase Akkordspur; was Nutzer am Genos mühsam finden, steht in §2.2. Die Übersetzung Genos → SYNQUENZER steht in §3.9.

### H.2 Regeln (Kurzfassung von §3; verbindlich ist §3)

1. **Klammer:** Was transponiert wird, bleibt in der LAGE-Klammer der Spur. Der Bass bricht nie aus, Sequenz und Lead bleiben als Ganzes darin, die Fläche greift um wie ein Keyboarder.
2. **Richtung:** Beim Spielen folgt die Musik der Hand (tiefer greifen = tiefer, bis zur Klammer), auch beim ersten Griff nach ORIGINAL. In der Akkord-Zeile nimmt jede Spur ohne Pfeil den Weg mit den kleinsten Sprüngen über die ganze Zeile, einschließlich der Naht vom letzten zum ersten Akkord; der Akkord, in dem ein Clip aufgenommen ist, klingt original.
3. **Pfeile:** ↑/↓ an einem Akkord-Kästchen = „dieser Akkord oben/unten“ (absolut); je Clip und Akkord-Grundton dasselbe im LAGE-Blatt (`dirAt`, gilt auch live). Rangfolge `dirAt` > Clip-Richtung > Pfeil bzw. Hand > Auto; die Klammer gilt zuletzt.
4. **Kern bleibt zu (I-01):** Die Lage ist eine Stufe nach der Harmonie-Abbildung und nach `S.shift`/`R.xp`; sie verschiebt nur Oktaven (bei der Fläche ordnet sie die Stimmen innerhalb der Tonklassen der Abbildung neu). **Aus = bitgleich.** Neue Projekte haben sie an, gespeicherte Projekte und die Demo aus.
5. **Null-Einrichtung:** Rolle und Klammer kommen aus Klang-Kategorie und Clips (Auto-Klammer ≥ Clip-Umfang + 14 HT, Bass-Boden E1); `sound.lage` aus der Bibliothek schneidet die Klammer (§3.7).
6. **Zusammenspiel** (§3.8): FANG speichert wie gehört; FANG TEIL schreibt Handton und Anker; beim Ablegen eines Teils im Song steht der Neustart in `song.carrier[i].target.neu` (die gelbe Marke bleibt reines Etikett, S9); MIDI-Export „mit Träger“ benutzt dieselbe Ausgabe; Live SPIELEN, Song-Melodie und Drums werden nie gefaltet.

### H.3 Paket VL — Lage und Richtung

**Ziel.** Lage-Grenzen wie beim Genos, aber einfach: Der Bass bleibt in seinem Bereich, Melodien dürfen mehr in die Höhe, die Musik folgt der Hand, und je Akkord lässt sich festlegen, ob ein Clip nach oben oder unten geht (Xander Runde 8 T).

**Umfang.**
1. Lage-Stufe nach `transposition-lage.md` §3.4 mit Rollen (§3.3), Richtung (§3.5), Flächen-Stimmführung mit Durchgang `g` (§3.6), Auto-Klammer und „eng“ (§3.7); Zwischenspeicher je (Clip, Träger-Eintrag, Einstellungs-Stand).
2. Daten §5 (Format 4 additiv: `settings.harmony.lage`, `track.role`, `track.lage`, `clip.dir`, `clip.dirAt`, `note.g`, `ChordRow.ch[i].d`, `tg.hand`, `ChordRow.anker`, `song.carrier[i].target.{hand, d, neu, zl, anker}`, `sound.lage/role/dirAt`), Undo-Art `lage`, Test-API §5.
3. Oberfläche §6: Klammer in der Tastenspalte der ROLLE (Griffe 40 × 44 P / 40 × 36 L), LAGE-Blatt (5 Rollen-Chips, [Auto], Richtungs-Chips, `dirAt`-Chips; P1 ≤ 216 px, L1 ≤ 150 px), Pfeile in der Akkord-Zeile (Kästchen hoch/runter ziehen, [↕]), Texte §6.5.
4. **Nachrüstung der Song-Pakete** (die vor VL gebaut sind; `transposition-lage.md` §7 „Ergänzungen an anderen Paketen“): V2d/FANG TEIL schreibt `tg.hand` und `anker`, beim Ablegen eines Teils `neu`/`zl` am ersten Träger-Eintrag; V2e zeigt ↑/↓ in der Song-Zeile AKK.; V2f rechnet `S.shift` vor der Lage, [Fest anwenden] nimmt Auto-Klammern mit; `normTarget` und `logCarrier` übernehmen `hand`, `d`, `neu`, `zl`, `anker`; MIDI-Export über die Lage-Ausgabe.
5. `track.role` ist die **eine** Rolle für Lage, Mischung und Hilfe; V7a (danach gebaut) und V7c lesen dasselbe Feld (kein `track.mix.role`).

**Nicht-Umfang.** Live SPIELEN falten; Song-Melodie und Drums falten; Tonhöhenkorrektur; eine neue Zeile in der Song-Ansicht.

**Berührungspunkte.** `transposition-lage.md` §7 (u. a. `outPitch`, `scheduleTrack`, `spawnClipVoice`, `applyCarrierChange`, `clipNoteFor`, `buildMidi`/`buildMidiSong`, `T.onCommit`, `route 'carrier'`, `normTarget`, `logCarrier`, PianoRoll, Akkord-Zeilen-Blatt, `normalizeProject`, Undo, Test-API, Hilfe).

**Dauer** 6,5–8 h (über der 4–5-h-Regel; zwei Bau-Abschnitte: 1 Kern-Stufe, Rollen, Klammer, LAGE-Blatt; 2 Pfeile, `dirAt`, Nachrüstung V2d–V2f, Export) · **App-Version** 4.10.0 · **Budget** +31 KB · **braucht** V2c, V2c′, V2d, V2e, V2f.

**Abnahme.** N8T-01 … N8T-26 (`transposition-lage.md` §8) und N2-VL-01 … N2-VL-03. **Tests.** `vl-lage.mjs` (übernimmt `lage-proto/beweis.mjs` und `stress.mjs`), `vl-ui.mjs`. **Fach-Prüfung** FP-SONG (blockierend), FP-TOUCH. **iPhone-Prüfpunkte** wie §8 (oberes C → unteres F; C Am F G mit Bass unten und umgreifender Fläche; Am-Kästchen hoch; nach ORIGINAL das untere F).

**Risiken.** Wie §7: Flächen klingen anders (Umkehrungen statt parallel; Gegenmittel Rolle Sequenz, Frage L-1); Griffe gegen Scrollen in der Tastenspalte; Hand-Richtung bei Umkehrungen am iPhone prüfen; Zwischenspeicher bei jeder Clip-Bearbeitung verwerfen.

### H.4 Zusatz-Abnahme

- [ ] **N2-VL-01 Projekte aus der Zeit vor VL:** Ein Projekt ohne `settings.harmony.lage` bleibt bitgleich (= N8T-01). Schaltet Xander die Lage darin ein, laufen Teile ohne `tg.hand` nach der Auto-Regel (zyklisch, §3.5), ohne Fehler; das LCD zeigt einmal „Teil vor der Lage aufgenommen – Richtung automatisch“.
- [ ] **N2-VL-02 Teil im Song (S9):** Ein Teil, der nach dem Ablauf B.5 abgelegt wird, schreibt `neu`/`zl` am ersten Träger-Eintrag; Löschen, Verschieben oder Umbenennen der gelben Marke ändert das `noteLog` um 0 Töne (N8T-26); keine neue Zeile.
- [ ] **N2-VL-03 Eine Rolle:** `track.role` ist das einzige Rollen-Feld; V7a liest es für die Mischung, `normalizeProject` legt kein `track.mix.role` an; ein Rollenwechsel im LAGE-Blatt ist ein Undo `lage` und wirkt am nächsten Takt.

### H.5 Korrekturen

| # | Stelle | Korrektur |
|---|---|---|
| **K2-50** | `r7/transposition-lage.md` §7 (Ort, Gruppe, Version, „Option früher bauen“) | Ort: erstes Paket von Gruppe 6, **nach** V2f (statt nach V2c′); Version 4.10.0 (statt 4.4.5); Budget +31 KB, 6,5–8 h (Fassung 3 mit den Nachrüstungen); die Teilung der Gruppe V2-1 entfällt; die Ergänzungen an V2d, V2e, V2f baut VL selbst nach; „Option früher bauen“ entfällt. Status „Entwurf“ → verbindlich (EN2-01). |

---

## Teil I — Resynthese (V9d, V9d′, V9e) (neu, EN2-24)

Grundlage: `r8/resynthese-pakete.md` (verbindlich §1, §3–§10), `r8/resyn-prototyp.md` (Messungen am Prototyp), `r8/resynthese-recherche.md` (Verfahren, Vorbilder), Messdateien `r8/resyn-proto/`, `r8/resyn-pakete/`, `r8/rev-resyn/`.

### I.1 E8 (neu) — Wortlaut (ersetzt E8 der Vision und Satz 2 von E3-22)

> **E8 (neu, 17.10.2026):** Allgemeine Resynthese ist Teil von v3.
> - **Quelle:** eine Aufnahme bis **8 s** (Mono-Summe). Datei-Import in beiden Umgebungen; Mikrofon nur auf der eigenen Seite außerhalb der Claude-App (Pages, EN2-21) und nur über VS1; App-Klang offline gerendert.
> - **Modell:** zeitveränderliche Teiltöne (höchstens **64** gleichzeitig, Profi **128**), **32** Rauschbänder (ERB), Rauheit (Feinhüllkurve) und höchstens **4 Original-Einsätze** zu je ≤ 60 ms (8-Bit). Gespeichert wird nur das Modell, **≤ 60 KB je Klang**. Die Originalaufnahme bleibt nur auf dem Gerät.
> - **Zusage** (Abnahme) gilt für einstimmige Quellen: ein Ton, eine Phrase, ein Wort. **Tier- und Naturgeräusche** und mehrstimmige Quellen sind erlaubt, aber **ohne Zusage**; die **Ampel** zeigt, wie nah der Nachbau ist. Die Zusage für Tiergeräusche kommt erst, wenn N9R-38 besteht (unkomprimierte, dokumentierte Löwen-Aufnahmen neu gemessen, Hörtest).
> - **Nicht in v3:** neuronale Verfahren (DDSP, RAVE, Codecs), Zerlegen von Mischungen, Abspielen ganzer Aufnahmen (Sample-Import bleibt §18), mehrere Analysen je Klang (Zonen).
> - **Werks-Klänge** nur aus eigenen oder frei lizenzierten Aufnahmen (CC0, CC BY mit Namensnennung). Herkunft und Lizenz stehen im Klang (`src`).

**Begründung (gemessen, `resynthese-pakete.md` §1.2, §4):** Echte Resynthese erreicht bei Sax-Ton, Sprache, Wort und beiden Löwen den Zufallsboden des eigenen Modells (Sax-Ton Mel 0,8 dB, MCD 2,1); die V9c-Näherung lag bei MCD 13–52. Eine Stimme mit 64 Teiltönen kostet 1,40 % (Xeon), 8 Stimmen 11,2 %, mit versetzter Hop-Phase je Stimme ≈ 9 % je Block (P99 16 %) – der Versatz ist Pflicht. Typische Klänge 9–50 KB. Vorbilder: SMS, Alchemy, Loris, SPEAR, Synclavier „Hybrid Attack“ (BELEGT bzw. SE, Links dort). Nichts ist angehört; die Ampel prüft neben der Mel-Distanz Stimmhaftigkeit bzw. Rauigkeit und Puls (Anker-Selbsttest N9R-13b).

### I.2 Was sich in Spec und Nachtrag 1 ändert

Wie `resynthese-pakete.md` §1.3: E3-22 Satz 2 entfällt; §11 „Löwe nur als Monster-Brüllen“ → Resynthese aus einer Aufnahme; **V9c entfällt** als Paket (V9c-01 … V9c-05 werden N9R-32, N9R-10, N9R-06, N9R-09, N9R-10); neuer Abschnitt §11.5 „Resynthese“; `Sound.engine` um `'resyn'`; neue Felder `p.resyn`, `p.rs`; Test-API §10; §18 behält nur den Grain-Modus.

### I.3 Pakete

| Paket | Inhalt (`resynthese-pakete.md` §7) | Version | Budget | Dauer | braucht | Abnahme |
|---|---|---|---|---|---|---|
| **V9d** Klang einfangen | Resynthese-Kern (ein Code für Worker, Worklet und Tests), Analyse mit AUTO und Ampel, Format und `normalizeSound('resyn')`, Größen-Begrenzer (≤ 60 KB), Quellen und Original lokal (`resyn-src`), Blatt KLANG EINFANGEN Schritte 1–3 mit A/B; Quellen DATEI, APP-KLANG und 🎤 (über VS1, nur Pages); Hinweis ab dem 9. Resynthese-Klang je Projekt bis VO4a (N2-9d-01) | 4.44.0 | +67 KB | 5–5,5 h | V9b; weich VS1, VO1 | N9R-01 … N9R-15, N9R-13b, N9R-39 a, N9R-40, N2-9d-01 |
| **V9d′** Klang spielen | Engine `resyn` im Worklet (Formanterhalt, keine Micky-Maus), [ÜBERNEHMEN] mit einem Undo, Editor-Seite, TIEFE › Rauschen und › Quelle, CPU-Begrenzer Stufen 1–2 mit Hop-Versatz; PAD-R1, MOD-R1, VL-R1 | 4.45.0 | +35 KB | 4–5 h | V9d, V1d, V5d, VC2a | N9R-16 … N9R-26, N9R-22b, N9R-39 b |
| **V9e** Formen und Morphen | Einfrieren und Scannen, Verwandeln A ↔ B, „Sprechen“, Vereinfachen, → KLANGKÖRPER, Teiltöne malen/radieren, Grundklang SÄGE, 4 Werks-Klänge (Saxofon, Klavier, Sprechende Fläche, Löwe nur mit N9R-38) mit Lizenz-Protokoll, *(P1)* → TABELLE | 4.46.0 | +45 KB Code + ≤ 60 KB Werks-Daten = 105 KB | 5–6 h | V9d′, V9a | N9R-27 … N9R-38 |

- **Gruppe 14:** ≈ 14–16,5 h, +207 KB. V9c (−30 KB, −4 h) ist in Gruppe 13 nicht mehr enthalten.
- **Gerätemessung** N9R-39 a/b auf der Pages-Seite (nicht githack) über die Test-API; Ergebnisse in CHANGES.
- **Fach-Prüfung** FP-DSP (blockierend bei V9d und V9d′), FP-IPHONE, FP-KLANG (V9e: Werks-Klänge, Lizenzen).

### I.4 Entscheidungen D1–D6 aus `resynthese-pakete.md` §12.1

| # | Vorschlag dort | gilt |
|---|---|---|
| D1 | E8 (neu) wie §1.1 | angenommen (I.1) |
| D2 | V9c entfällt, Abnahme wandert nach N9R | angenommen |
| D3 | Gruppe RS nach V8V9 | angenommen: Gruppe 14 direkt nach Gruppe 13 |
| D4 | Original-EINSATZ (≤ 4 × 60 ms) ist hier erlaubt | angenommen |
| D5 | Dateigrenze 4,5 MB, Startzeit als Wächter | ersetzt durch EN2-28 (5,0 MB, gleiches Prinzip) |
| D6 | Analysen online je `rid` einmal speichern | ab VO4a ist jede Analyse ein eigener Teil der Teil-Art „Analyse“ (ein Hash, einmal gespeichert; K2-65, N2-VO4a-03, Rev. 3); bis dahin höchstens 8 Resynthese-Klänge je Projekt mit Hinweis (N2-9d-01) |

### I.5 Zusatz-Abnahme

- [ ] **N2-9d-01 Grenze bis VO4a:** Vor VO4a zeigt das Blatt KLANG EINFANGEN beim 9. Resynthese-Klang eines Projekts den Hinweis „Mehr als 8 eingefangene Klänge machen das Online-Speichern schwer – bitte einen entfernen oder exportieren“; nichts wird abgelehnt. Ein Projekt mit 8 Analysen à 60 KB bleibt unter `too_large` (2 MB) und speichert online (Fake-Server). Der Hinweis entfällt erst, wenn N2-VO4a-03 bestanden ist (Rev. 3).

### I.6 Korrekturen

| # | Stelle | Korrektur |
|---|---|---|
| **K2-51** | `r8/resynthese-pakete.md` §0 Nr. 6, §7, §9.2, §12 | Mikrofon über VS1 auf der Pages-Seite (statt raw.githack); Versionen 4.44.0, 4.45.0, 4.46.0 (statt 4.32.0–4.34.0); Gruppe 14; V9d +67 KB, 5–5,5 h (Hinweis N2-9d-01 und Projekt-Text-Grenze von VO1 eingerechnet); D5 → EN2-28; D6 → I.4. Status „Entwurf“ → verbindlich (EN2-01). |

---

## Teil J — Fach-Prüfung je Paket (Team) (neu, EN2-29)

**Xander (Runde 9):** „Für jeden Bereich Spezialisten wie bei Reason/Ableton – damit wir besser sind als alle anderen zusammen.“

### J.1 Ablauf

1. Der Builder baut das Paket und hakt seine Checkliste ab (Spec §1.3 DoD, Paket-Punkte, Zusatz-Punkte dieses Nachtrags).
2. **Vor der Abnahme** prüft ein zweiter Lauf ohne den Kontext des Builders (eigener Agent) das Paket mit dem Prüf-Blick aus J.3: Diff, Testausgaben, Bildschirmfotos und – wo vorhanden – Messdateien. Er arbeitet die Checkliste seines Blicks ab (J.2) und schreibt Befunde mit Datei, Stelle und Beleg.
3. Jeder Befund wird behoben oder in CHANGES mit Grund als bewusste Abweichung geführt. Bei **blockierenden** Paketen (● in J.3) beginnt das nächste Paket erst danach; bei den übrigen darf der Bau parallel weiterlaufen, die Abnahme folgt erst nach der Prüfung.
4. CHANGES nennt je Paket: Prüf-Blick(e), Zahl der Befunde, behoben/begründet. Die Zeit zählt zu „Neustarts und Korrekturen“ (1–2 h je Paket).

### J.2 Die sechs Prüf-Blicke

| ID | Fachrichtung | prüft vor allem |
|---|---|---|
| **FP-DSP** | FM- und Klangtechnik (DSP) | Gleichheit gegen Referenz (bitgleich bzw. dB-Grenzen, msfa/DX-Gleichheit), Aliasing und Mipmaps, Feedback-Stabilität (NaN, Spitzen), M-KLICK und M-EINBRUCH bei Umschaltungen, CPU je Stimme und je Block (Spitze, nicht nur Mittel), Worklet-ASCII, nativer Rückfall, Zahlen der Messung gegen die Abnahme-Schwellen |
| **FP-TOUCH** | Touch-Bedienung | L4-Trefferflächen, Gesten-Konflikte (Halten, Ziehen, Rollen, zwei Finger, Doppeltipp-Zoom, Kontextmenü und Textauswahl in iOS Safari), M-PLATZ in P1–P3, L1, L2, W, M-ANSICHT (nichts springt), Kontrast nach WCAG, ein Undo je Geste, Haptik, Texte ohne Fachwörter |
| **FP-SONG** | Song und Sequencer | Taktgenauigkeit (M-ZEIT), Daten-Invarianten (`S.tracks[].clips` deep-equal, EN7-04), Undo-Gruppen und Rundweg Speichern/Laden, Zeitleisten-Operationen, Taktstrich-Regel, Harmonie-Kern unverändert (I-01), MIDI-Export, FOLGEN |
| **FP-SICHER** | Backend und Sicherheit | RLS- und RPC-Matrix, Rechte der SECURITY-DEFINER-Funktionen, keine Geheimnisse im Build (kein `sb_secret_`), Herkunft und Token-Speicher, CAPTCHA und Anmelde-Bremse, Quoten, Versions-Wächter, Datenschutz (N7V-35), Migration mit Rücksicherung, nie das Klassenzimmer-Projekt, fremde Daten nur als Daten (`textContent`, `normalizeSound`) |
| **FP-KLANG** | Sounddesign und Bibliothek | Pegel −18 LUFS, M-HANDYrel, Hörproben-Regeln (EN2-09), Zulassung und Belege (EN2-08, EN2-25, D.1), Namen (E9, Prüfliste), ⓘ-Texte, Rezept-Treue zur Quelldatei, „Annäherung“, Lizenzen der Werks-Klänge |
| **FP-IPHONE** | iPhone-Leistung | Startzeit §15.3 und Dateigröße (EN2-28), Speicher, rAF ≥ 55 fps und keine `longtask` > 50 ms (PE1), CPU mit dem iPhone-Faktor (unbelegt, §15.1), Audio-Sitzung und Hintergrund, Safari-Speicher (7-Tage-Regel), Geräte-Prüfpunkte für Xander klar und kurz |

### J.3 Zuordnung (● = blockierend)

| Gruppe | Paket | Haupt-Blick | Zweit-Blick |
|---|---|---|---|
| 1 | V0b, V0c | FP-TOUCH | FP-SONG |
| 1 | V0d ● | FP-DSP | FP-TOUCH |
| 2 | VO1 ●, VO2 ● | FP-SICHER | FP-IPHONE (VO1), FP-TOUCH (VO2) |
| 2 | VS0 | FP-IPHONE | FP-SICHER |
| 3 | V4a ● | FP-DSP | FP-IPHONE |
| 3 | V4b ● | FP-TOUCH | FP-DSP |
| 3 | V4f, V4c | FP-DSP | FP-TOUCH |
| 4 | V2a ●, V2a′, V2b, V2c, V2c′ | FP-SONG | FP-TOUCH |
| 5 | V2d ●, V2d′ ●, V2e, V2e′ ●, V2f | FP-SONG | FP-TOUCH |
| 6 | VL ● | FP-SONG | FP-TOUCH |
| 6 | VS1, VS2 ● | FP-DSP | FP-IPHONE |
| 6 | V7a | FP-KLANG | FP-SONG |
| 6 | VC2a | FP-SONG | FP-SICHER |
| 7 | VS3, VS4, VS5a, VS5b | FP-DSP | FP-IPHONE (VS3: FP-SICHER für Speicher und Datenschutz) |
| 8 | V1a–V1d | FP-DSP | FP-KLANG |
| 8 | VS6, VS7 | FP-DSP | FP-TOUCH |
| 9 | V3a–V3c | FP-TOUCH | FP-SONG |
| 10 | V5a–V5d | FP-DSP | FP-TOUCH |
| 11 | V6a, V6a′, V6b | FP-DSP | FP-SONG |
| 12 | V7b–V7d | FP-KLANG | FP-DSP |
| 12 | VK, VK2 | FP-DSP | FP-KLANG |
| 13 | V8a, V8b, V9a, V9b, V4e | FP-DSP | FP-IPHONE |
| 14 | V9d ●, V9d′ ●, V9e | FP-DSP | FP-IPHONE, FP-KLANG (V9e) |
| 15 | V10P ●, V10a, V10b, V10c | FP-KLANG | FP-TOUCH |
| 16 | V10d, V10f, V10e | FP-KLANG | FP-SONG (V10e) |
| 17 | VI1a–VI3 | FP-KLANG | FP-DSP |
| 18 | VO3, VO4a ●, VO4b ●, VO4c | FP-SICHER | FP-SONG, FP-TOUCH |
| 19 | VC3, VC3b ● | FP-SONG | FP-SICHER |
| 19 | VC2b, VC2c | FP-TOUCH | FP-IPHONE |
| 19 | VC4 | FP-SICHER | FP-TOUCH |

---

## Quellen

**Direkt gelesen (lokal oder am 17.10.2026):**
- Kodamo EssenceFM User Manual V7.0, 82 S., als PDF `r7/kodamo-pdf/EssenceFM-manual.pdf` (Web: https://kodamo.org/essencefm_manual.php); Auswertung `r7/kodamo-pdf/handbuch-komplett.md`.
- Skill `artifact-capabilities` (Fähigkeitenliste; Revision 1: Laufzeitvertrag 0.2.85, Revision 2: 0.2.75 des SYNQUENZER-Artifacts).
- App-Stand `synq-snapshots/V0a.html` und `V0a-fix.html` (3.1.0), `CHANGES-V3.md`.
- Supabase (MCP, nur lesend): `get_project`, `list_projects`, `list_tables` für `dbdnsryoivvezspgydpx`; `search_docs` mit https://supabase.com/docs/guides/platform/billing-faq und https://supabase.com/docs/guides/platform/project-transfer.
- GitHub (`gh api`): `repos/XanderFoxy/Synquenzer`, `…/contents`, `…/commits` (https://github.com/XanderFoxy/Synquenzer).
- Apple HIG Drag and Drop: https://developer.apple.com/design/human-interface-guidelines/drag-and-drop (laut `r7/song-delta.md` direkt gelesen).

**Aus den R6–R8-Dateien übernommen (meist Suchauszüge; Status in den Teilen):**
- Song: https://support.apple.com/en-bh/guide/logicpro/lgcpf7c0c09c/mac · https://archive.steinberg.help/nuendo/v8/en/cubase_nuendo/topics/parts_events/parts_creating_shared_copies_c.html · https://steinberg.help/nuendo/v12/en/cubase_nuendo/topics/recording/recording_midi_record_modes_r.html · https://wiki.loopypro.com/Working_with_Record_Count-In/Out_and_Quantization · https://support.apple.com/en-my/guide/logicpro-ipad/flex-time-algorithms-and-parameters-lpipab631a74/1.0/ipados/16.0 · https://www.avid.com/pro-tools/user-guide/beat-detective
- Stimme: https://github.com/mdn/content · https://github.com/mdn/browser-compat-data · https://bugs.webkit.org/show_bug.cgi?id=311451 · https://raw.githack.com/faq · https://code.soundsoftware.ac.uk/projects/pyin · https://helpcenter.celemony.com/M5/doc/melodyneEssential5/en/M5tour_MacroTiming
- Vorbilder: alle URLs in D.2 und D.6.4; vollständige Listen in den Quelldateien (`r7/vorbild-*.md` jeweils Abschnitt „Quellen“, `r7/spezial-*.md`, `r7/vorbild-katalog.md` §6, `r7/vorbild-spezial.md` §6, `r8/studio-setups.md` §8).
- Online und Zusammenarbeit: `r7/online.md` „Quellen“ (Supabase-Doku S1–S26, Web W1–W9, npm N1–N2, Klassenzimmer-Repo L1–L5), `r8/zusammenarbeit-modell.md` „Quellen“ (Q1–Q52) und N-DM.6, `r7/spezial-digitalmusician.md` „Quellen“ (D1–D22).
- Lage: `r7/transposition-lage.md` §10. Resynthese: `r8/resynthese-pakete.md` „Quellen“, `r8/resynthese-recherche.md`.

**Eigene Rechnungen dieses Nachtrags:** `scratchpad/n2-tools/budget4.py` (Reihenfolge, Versionen, Abhängigkeiten, Budgets, Dauer, Größe), `scratchpad/n2-tools/pdfgrep.py` (Handbuch-Suche), Kontrastwerte in K2-01 (WCAG-Formel), Gestenbeispiel N7F-22 (b) und die Aussage „kein Platz über Y ist mit 6 Operatoren nicht erreichbar“ (K2-42, von Hand gerechnet).

**Nicht möglich in dieser Runde:** neue Websuche (Kontingent aufgebraucht), Abruf von kodamo.org, soundonsound.com und `xanderfoxy.github.io` (ENOTFOUND bzw. Proxy 403), Pages-Endpunkt der GitHub-API (403). Kein Sound wurde angehört, nichts wurde am iPhone gemessen; im Supabase-Projekt wurde nichts angelegt oder geändert.

---

## Revisions-Protokoll (Revision 2 = Endfassung, 17.10.2026)

**Auftrag:** Nachtrag 2 mit allen neueren Recherche-Dateien in die endgültige Form bringen (Teile A–J), Reihenfolge nach Xanders Prioritäten und Runde 9, IDs eindeutig, Änderungen oben aufgelistet.

**Vorgehen:** Alle Quelldateien der Grundlage gelesen (KP, KD, HK; `song-delta.md` 5.1–5.4 und 13; `online.md` §0–§10 mit Schema-Übersicht; `zusammenarbeit-modell.md` §5–§15 und N-DM; `spezial-digitalmusician.md` §6–§9; `transposition-lage.md` §0–§9; `resynthese-pakete.md` §0–§12; `vorbild-katalog.md` §0, §3; `vorbild-spezial.md` §0–§5; `studio-setups.md` §0, §4–§7; die Vorbemerkungen von `vorbild-szene.md`, `vorbild-dark.md`, `vorbild-retro.md`; Nachtrag 1 B.0, VC3, VC4, C.3). Plattform lesend geprüft (N2.0.2 Nr. 8–11). Reihenfolge, Versionen, Abhängigkeiten und Summen mit `budget4.py` gerechnet (Prüfung OK).

**Entschieden in dieser Revision:** EN2-19 … EN2-30, K2-35 … K2-54; geändert EN2-01, -02, -03, -06, -10, -12, -15, -16, -17, -18, K2-01, -06, -08, -22, -29, -33; aufgehoben EN2-13, K2-04, K2-18, K2-23 (Einträge bleiben mit Verweis stehen).

**Bewusst offen gelassen:** Erreichbarkeit und Schreibweise der Pages-Adresse (R0b); Organisation des Supabase-Projekts (O-2); alle Act- und Geräte-Belege bis zum Tor PR-V; alle Klang- und iPhone-Aussagen bis zu den Gerätetests.

**Folgen für Summen:** 78 feste Pakete + 1 optionales, ≈ 377–436 h reine Bauzeit (+3–3,5 h mit VS7), +3 198 KB → ≈ 4,59 MB (≤ 5,0 MB, EN2-28; Revision 3: +3 201 KB, Review-Protokoll 2). Kurzantwort `antwort-kurz-8.md` ist angeglichen.

---

## Review-Protokoll (Review 1 zu Nachtrag 2, 17.10.2026; historisch, Zahlen Stand Revision 1)

Jeder Befund wurde vor der Übernahme an der Quelle geprüft (Datei, Zeile, V0a.html, Handbuch-Text `scratchpad/rev-src/manual.txt`). Netz war auch hier nicht verfügbar (WebSearch-Kontingent aufgebraucht, WebFetch ENOTFOUND); Web-Prüfungen sind deshalb als Pflicht N2-10P-00 eingeplant, nicht erledigt.

**Übernommen wie vorgeschlagen (27):** VC1 wieder unbedingt (EN2-16, E.1 Gr. 15, E.4, O-1) · Instrument einspielen fest in VS2 (K2-33, N2-VS2-02) · Überschreiben ab n bei NOTEN (K2-21, N2-2d′-01) · Tausch-Regel Gruppen 6/7 mit Variante B (E.1, E.2 Nr. 7, E.4) · F.1 Reihenfolge ehrlich, E-2 · Alphaville-Titel (D.3a, D.3b, F.1, B-9) · Hörproben-Erwartung in F.1 · PO-1 als mehrere Dateien (D.5, V10P-09, D.8) · Marken-Blatt- und Bereich-Leisten-Maße (K2-25) · N7V-13 (K2-30, N2-VS3-02) · Format und Claude-App-Verhalten der STIMME-Spur (K2-31, N2-VS3-03) · Mikro-Zeile als Überlagerung, Modusleisten-Breiten (K2-32, N2-VS1-01) · Kette-Reste (K2-22) · N2-2e′-01 Schritt 1 (Chip [Strophe] → [＋ Strophe 2]; INTRO/STROPHE/REFRAIN sind Teile) · N2-4b-03 Schritt 4 und N2-4b-01 Messpunkt · VC1-Version (VC1 zuerst in Gr. 15) · Transportzeilen-Summe (K2-26) · V10d-08 → V10d-05/N10a-03 in D.7 · E-K3 ehrlich formuliert · 1-Takt-Auswahl (K2-27) · Teil-Tipp bei laufendem Song (B.1 Nr. 17, K2-28, N7S-25b) · Web-Stichprobe als N2-10P-00 und Regel „`b` ohne `chk` zählt als `s`“ · Kraftwerk geteilt · New Order · Tiga & Zyntherius (alle K2-34) · A.1 „Pegel“ (K2-29) · ÜBERHOLT-Vermerk und vier Berichtigungen in `kodamo-handbuch.md`/`kodamo-oberflaeche.md` (K2-02).

**Übernommen mit Änderung (5):**
- *Spielmuster:* Der Befund nennt „P1–P8 + Achtel-Oktave“. Laut `vorbild-dark.md` §4 **ist** P8 die Achtel-Oktave; das neunte Muster ist **P3b** „Offbeat-Roll gerade“. Übernommen sind P1–P8 und P3b. Die Muster kommen nicht nur als `clip` an vier Bässen, sondern als eigene Vorlagen („Muster ⧉“), weil sie laut Katalog „mit jedem Tier-1-Bass“ laufen sollen; dafür zieht V10P die ⧉-Regel aus §12.5 vor (+1–1,5 h, +6 KB).
- *S9 ↔ N7S-10:* Der Vorschlag (Selbstöffner erst nach ≥ 8 px Bewegung) weicht leicht von Xanders S9-Wortlaut „gedrückt halten → Song-Seite öffnet sich automatisch“ ab; deshalb zusätzlich Rückfrage S-8 (Vorgabe ja).
- *N7-R9:* Von den zwei Wegen ist das Zell-Blatt gewählt (L4 bleibt ohne Ausnahme); weil Xander „halten → echter Clip“ sagte, zusätzlich Rückfrage S-9.
- *Tor-Regel E.5 Punkt 3:* übernommen bis auf „ihre Versionsnummern bleiben“; das widerspräche EN2-14 (streng steigend), wenn ein verschobenes Paket nach einer späteren Gruppe gebaut wird. Verschobene Pakete bekommen deshalb die nächsten freien Zwischennummern.
- *Second Decay „größter Hit“:* nicht UNBELEGT, sondern WAHRSCHEINLICH, weil `spezial-slaphouse.md` §5 einen Konzertbericht nennt (https://www.reflectionsofdarkness.com/festivals/1584-elektrisch-festival-krefeld-2007); der Bericht selbst ist nicht nachgelesen.

**Abgelehnt (0).** Alle 32 Befunde haben sich an der Quelle bestätigt. Die Teile, die abweichend umgesetzt sind, stehen oben mit Grund.

**Folgen für Summen:** unbedingt 63 Pakete, ≈ 289,5–330 h, ≈ 3,98 MB; bedingt 6 Pakete, +31–37 h; mit allem und RS ≈ 4,34 MB (≤ 4,5 MB, EN2-13). Kurzantwort `antwort-kurz-7.md` ist angeglichen.

---

## Review-Protokoll 2 (Review 2 zu Nachtrag 2, 17.10.2026; ergibt Revision 3)

**Prüfweg:** Jeder der 41 Befunde wurde vor der Übernahme an der Quelle geprüft: `fragen-xander-7.md`/`-8.md`/`-9.md` (Wortlaut), `r7/katalog-work/katalog.json` und `r7/vorbild-katalog.md` §2–§3 (Stufen, ★, Belege von De/Vision, Sixth June, Static Movement), `synq-snapshots/V0a-fix.html` (CSS `#modebar`, `#modeSeg`, Querformat-Raster `96px … 300px`, Unterzeile `clamp(110px,34dvh,150px)`; `md5` 0 Treffer, `function fnv` vorhanden), `CHANGES-V3.md` (K-01 … K-17), `r7/song-delta.md` Z. 425 und 438, Spec §1 (Gesten), §4.11 (`S.tracks`), §15.1/§15.2, `r7/online.md` §4.7, `r8/zusammenarbeit-modell.md` §5, `r8/rls-klassenzimmer.md`, Nachtrag 1 VC4-Tor, KP §4.1–§4.13, §5.1, §6.2, §7, §9 und KD §6.2/§6.4 (Wortlaut), HK (Randomize mit LFO im Bild S. 18; Pitch EG Range; Bild S. 29 mit blauer Sustain-Linie). Die Handbuch-Bilder S. 29 und S. 32 wurden aus dem PDF gezogen und angesehen (`scratchpad/n2-tools/rev3/p29_0.png`, `p32_0.png`): eine durchgehende Zeitachse, blaue senkrechte Sustain-Linie, Exp-Anstieg 2→3 erst steil, dann flach, Lin-Segmente gerade. `budget4.py` neu gelaufen: „Prüfung: OK“, Option V10P nach Gruppe 12: OK, +3 201 KB → 4,594 MB, 377–436 h.

**Übernommen wie vorgeschlagen (36):** RLS/Webseite (EN2-32, N2.0.1, E.5 Nr. 9, G.8 R0b) · VC4-Tor als Frage (F.2 VC4, F.1, E.0, E.5 Punkt 3, G.7) · And One deutschsprachig (D.3a Lesarten, B-12) · F.1 Online (Claude-App nur lokal, Konflikt-Wahl ab VO2) · F.1 Resynthese und E.1 Gruppe 14 (Löwe ohne Zusage) · F.1 Vogue/FZ-1 · F.1 „schon neu in V0a“ · Modusleiste Hochformat neu gerechnet (C.2 Punkt 1, K2-32, N2-VS1-01) · Banner und Mikro-Zeile in `#top` (K2-63, N7S-02, N2-VS1-03) · Marken-Editor ohne Halten-Löschen (C.5 Nr. 2, K2-64, N2-VS5a-01) · SYNC-Pause nur bei Aufnahme/Säubern/Mikro-Check mit `removeAllChannels` und Zähler inkl. WebSocket (N2-VS1-02, C.2 Punkt 5, N2-VC3b-01) · Teil-Art „Analyse“ (K2-65, G.6, N2-VO4a-03, I.4 D6, N2-9d-01) · PO-1 im Format 4 (K2-66, D.5, V10P-09, D.8) · SZ-20 = N21 im Werk (K2-67, D.3b, D.6.3, D.8) · V10P-Kanten (K2-68, E.3, D.5, `budget4.py`) · N7F-10 geteilt, N2-4f-02 (K2-42, A.6, A.7) · §15.1/§15.2 (K2-62, A.6) · `ld`/`rd`-Ausnahme von der Senkrecht-Sperre (K2-38, N7F-28) · `uid` aus `fnv` (K2-70, N2-2a-01) · kanonischer Pfad (K2-69, N2-VO1-01) · D.3a Satz zu Nr. 20 · VI-IDs je Paket und VI2a-03-Schwelle (K2-72, D.9) · VL-R1 ≠ Paket VL (N2.0 IDs) · A.3 Nr. 1 Pixel (236 + 6 + 132 = 374) · K2-42 Rest-Stellen (I5) · K2-37 Rest-Stellen (7–8 Op, N7F-49) · Punkt-Form mit einer Achse (K2-55, A.5 Nr. 5, N7F-47) · Exp-Anstieg (K2-57, N7F-37) · Schieber-Verstärkung = Balkenbreite ÷ Bereich (K2-38, N7F-26, N2-4b-03) · Welle als waagrechter Schieber und KD §6.2 nur Tabelle + Mipmaps (A.2, K2-38, N7F-27) · Mipmap-Wahl je Steuerblock (A.2, K2-40, N7F-42) · [Bereich ▾] (K2-56, N7F-43) · [✗]/[Skip] wechseln in die Punkt-Form (K2-60, A.5 Nr. 4, N7F-45) · Tonhöhen-Hk. an festen Operatoren in der Punkt-Form (K2-58, A.5 Nr. 2, N7F-42) · Z3 → D2 (A.2, K2-59) · R1: Seite bleibt zwischen Operatoren (K2-61, N7F-18).

**Übernommen mit Änderung (5):**
- *★-Ausnahme für weitere Acts (Befund 1):* Für **Sixth June** trifft der Befund nicht zu: C2-01 Kaltfront-Bass hat laut Katalog „U (Genre W)“ und steht schon in V10f (Genre-Tag `s`, D.6.6). Die Ausnahme gilt deshalb nur für **De/Vision C2-06** und **Static Movement DK-05** (EN2-31). Beide kommen mit **V10f** (Katalog-Stufe 2, Gruppe 16), nicht mit V10P: V10P bleibt bei 45 Sounds und zwei Bau-Abschnitten; V10f +3 KB (58 KB). F.1 ist wie vorgeschlagen berichtigt; die Alternativ-Rückfrage entfällt.
- *L1/L2 (Befund 11):* Der vorgeschlagene Prüfpunkt „jeder Modus-Knopf ≥ 36 px hoch in L1, L2 und bei offenem Blatt“ ist schon mit dem heutigen zweiteiligen Segment nicht erfüllbar (aus der V0a-CSS gerechnet: L2 ≈ 35 px, offenes Blatt ≈ 26 px); er würde VS1 an einem V0a-Zustand scheitern lassen. Übernommen: Segment bleibt zweiteilig, 🎤 als 44 × 36-Knopf in `#top`; N2-VS1-01 prüft „Modus-Knöpfe so hoch wie in V0a (±1 px), 🎤 ≥ 44 × 36“; der V0a-Wert steht als FP-TOUCH-Vermerk in CHANGES.
- *Loop erweitern (Befund 9):* Die Zeile nennt jetzt, was es schon gibt (Clip-Blatt [×2] mit Inhalt, REC/Overdub, FANG nach N7-R1); für das Verlängern **ohne Anhalten** gibt es keine Funktion, deshalb zusätzlich Rückfrage S-10 (Vorgabe „ja, später als eigenes Paket“), kein neues Paket in dieser Revision.
- *Wendung (Befund 26):* Die vorgeschlagene Definition enthielt einen überflüssigen Teil („oder auf dem Grundton nach einem Takt ohne Grundton-Ende“ ist im ersten Teil schon enthalten). Übernommen in vereinfachter, gleichwertiger Form, ergänzt um Einsatzzeiten, Drum-Proben und `len` 1 (EN2-09, K2-71).
- *Zufall (Befund 39):* Die vorgeschlagene Begründung „EK-08“ passt nicht (EK-08 ist in KP das Wertefeld). Umgesetzt: ☑ LFO kommt dazu (der FM-Klang hat einen Stimmen-LFO); ☑ Filter nur mit FM-Filter (ab VI3), bis dahin Abweichung **D4** mit dem Grund „FM-Klänge haben vorher kein Filter“; ☑ Wellen als Z19, Standard aus (K2-59).

**Abgelehnt (0).** Kein Befund war falsch; die Abweichungen oben betreffen nur Teilaussagen (Sixth June) oder die Form der Umsetzung.

**Folgen für Summen:** 78 feste Pakete + 1 optionales (unverändert), ≈ 377–436 h (unverändert), **+3 201 KB → ≈ 4,59 MB** (V10f +3 KB), nach Gruppe 18 ≈ 4,42 MB; Gruppen-Reihenfolge unverändert (E.1). Kurzantwort `antwort-kurz-8.md` ist angeglichen (Online, Bibliothek, Vogue, Resynthese, „schon neu“, KI-Helfer, vierte Frage VC4).

## Nachtrag zur Reihenfolge (Xander 19.10., 13:15–13:30, verbindlich, ersetzt Teil E dort, wo sie abweicht)
G-P1 = VS1, V2a, V2b, V2c, V2d, VS2 · G-P2 = V2d′, V2e, V2e′, VS3 · danach V2a′, V2c′, V2f, VL, V7a, VC2a, VS4 …; microKORG (nur Original-microKORG) zuletzt.
Stand 24.10.: VS1 … V2c-fix ausgeliefert (App 4.3.0). Offen in G-P1: V2d, VS2. Tor N2-VS0-02: bestanden mit Auflagen (siehe fragen-xander-9.md); VS1 am Gerät bestanden.

Korrektur 24.10. (Xander): microKORG kommt NICHT zuletzt, sondern direkt nach dem Kern: G-P1b (V2d, VS2) → G-P2 (V2d′, V2e, V2e′, VS3) → microKORG (Klangaufbau, wiedererkennbare Oberfläche ohne Korg-Name/Logo, Presets; DWGS-Wellen später aus Xanders Samples) → V2a′, V2c′, V2f, VL, V7a, VC2a, VS4 …

Xander 24.10. (Transponieren): Skala-Quantisierer (V2c′ „Eine Skala“: Töne, die nach dem Transponieren nicht in die Tonleiter des Zielakkords passen, automatisch einrasten) wird vorgezogen: direkt nach VS2, vor G-P2. Einfache Methode bleibt AKKORD mit „Ein Ton = Stufe in der Tonart“ (A in C-Dur → Am). Wunsch für später: OP-Z-Nachbau (Transposition wie OP-Z Master-Track: Tonart aus Bass/Lead/Arp/Akkord erkennen, Spuren musikalisch transponieren); Vergleich OP-Z ↔ OP-XY Brain ↔ Improvisor mit Handbüchern belegen.

Xander 24.10. (Song/Teile, gilt für V2e/V2e′): (a) Teil per Drag & Drop an JEDEN Taktstrich legen, auch in einen leeren Song oder hinter leere Takte (z. B. auf Takt 4, Takte 1–3 bleiben leer für Eigenes) – nicht nur ans Ende anhängen; (b) im Szenen-Menü (Szenenbank) auch Song-Teile auswählbar, auch wenn der Song noch leer ist; (c) Einfügen zwischen zwei Teilen = Bindeglied, alles rechts rückt sichtbar nach; (d) bearbeitete Verweis-Clips werden eigene Clips als neue Version/Iteration des alten Clips, überall im Song nutzbar.

Abgleich OP-Z/OP-XY (24.10., forschung/r9/opz-transposition.md): Zum Skala-Quantisierer-Paket (nach VS2) gehören zusätzlich: Brain-Verhalten „transponierte Töne in die Skala zwingen“ als Schalter, Drums optional mittransponieren (Fills), Tonart automatisch │ manuell sichtbar umschaltbar. Kein eigener OP-Z-Nachbau für die Transposition.
