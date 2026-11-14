# SPK9 – Prüfung (unabhängig, skeptisch)

Geprüft: `spk9/index.html` (4.63.0 + Block SPK9) gegen `spk9/basis.html` (= basis7, cmp gleich).
Nichts repariert. Eigene Prüf-Skripte und Ergebnisse liegen in `spk9/pruef/`; die Pakete des Bauers wurden nicht überschrieben
(die Regression lief auf einer bitgleichen Kopie in `pruef/reg/`, die nach dem Lauf gelöscht wurde).

## Kurzurteil

- Der Kernauftrag ist erfüllt. Befund 17 (A3 → D4 → H3 ohne Lücke) ergibt 3 Noten, auch mit Pegel-Delle (12/12).
  D4 lässt sich per Touch in „Noten bearbeiten“ einzeln umsetzen, hochkant **und** quer.
- Die Zahlen des Bauers stimmen für seine Stichprobe genau (nachgemessen).
- Mit eigenen Prüffällen (andere Stimme, andere Übergänge) zeigen sich Lücken:
  - langes Gleiten wird zu **einer** falschen Note (Rückschritt gegenüber der Basis),
  - kurze Verzierungstöne gehen verloren,
  - Oktav-Fehler sind deutlich häufiger als angegeben,
  - SPK3 und SPK4 sind nicht umgesetzt.
- Regression, Pflichtprüfungen, Laufzeit, Knackser und Bedienung: unauffällig.

## Befunde

**1. mittel – Langes Gleiten (≥ 0,6 s) wird zu EINER Note mit einer nie gesungenen Tonhöhe (Rückschritt)**
- Eigener Sweep SG: Start 0,5 s, Gleiten über 2/4/7/12 Halbtöne auf und ab, Ziel 0,6 s, je Dauer 8 Fälle. Bewertet wird nur
  die Tonhöhe.
- „Start und Ziel gefunden“ (SPK9; Basis in Klammern):

  | Gleitdauer | getrennt |
  |---|---|
  | 0,15 / 0,3 / 0,45 s | 100 % |
  | 0,6 s | 88 % (Basis 100 %) |
  | 0,8 s | 75 % (Basis 100 %) |
  | 1,0 s | 50 % (Basis 100 %) |
  | 1,4 s | 75 % (Basis 100 %) |
  | 2,0 s | 75 % (Basis 100 %) |

- In 10 von 64 Fällen kommt genau eine Note mit dem Median heraus (Basis: 0 Fälle ab 0,3 s). Beispiele:
  - 59 → 66 in 1 s ergibt eine Note 75,
  - 62 → 55 ergibt 58,
  - 60 → 72 ergibt 68,
  - 54 → 42 in 0,6 s ergibt 47.
  - Eigene Gruppe M8: 53 → 65 in 1 s ergibt 61, 55 → 62 in 1 s ergibt 60.
- Ursache im Code:
  - `steps()` sucht die ruhige Zielhöhe nur bis `look` = 0,5 s nach Beginn der Abweichung (`a - k <= look`).
  - Findet es keine, setzt es `k = q + 1`. Dieses `q` (Ende der Abweichung) liegt bei Gleiten mit anschließendem Zielton am
    Laufende.
  - Folge: keine Grenze, ganze Phrase eine Note.
- Die G-Fälle des Bauers reichten nur bis 0,6 s.

**2. mittel – Gleiten: Zusatz-Noten weit über dem Ziel ≤ 5 % und über der Angabe des Bauers**
- Sweep SG, Zusatz (Basis in Klammern):

  | Gleitdauer | Zusatz |
  |---|---|
  | 0,15 / 0,3 s | 0 % |
  | 0,45 s | 12,5 % (138 %) |
  | 0,6 s | 25 % (156 %) |
  | 0,8 s | 38 % (194 %) |
  | 1,0 s | 44 % (213 %) |
  | 1,4 s | 56 % (256 %) |
  | 2,0 s | 94 % (263 %) |

- Langsames Gleiten (2–5 Halbtöne/s) wird in Halbton-Stufen zerhackt. Beispiel: 57 → 46 in 2,5 s ergibt 9 Noten
  (57 56 55 54 52 50 48 47 46). Grund: Die Viertelton-Treppe der Spur steht je Stufe ≥ 60 ms „ruhig“.
- Leg-Prüffälle des Bauers, andere Stichprobe (`ONLY=L,V,G,A,B,R`, gleiche Erzeugung): G 15,6 % Zusatz. Der Bauer nennt 3,1–12,5 %.

**3. mittel – Kurze Töne in Verzierungen und Melismen (≤ ~0,17 s) gehen verloren**
- Ursache 1, die Vibrato-Regel hat keine Hub-Grenze:
  - Ein Ausschlag < 160 ms, der danach ≥ 30 ct zur Gegenseite schwingt, gilt als Vibrato.
  - Das gilt auch bei 100–200 ct Hub; die Vorgabe sagt Vibrato bis ±50 ct.
- Ursache 2, die Übergangs-Regel: Sie verschluckt echte chromatische Durchgangstöne (< 0,25 s, ≤ 1,5 Halbtöne vor dem Ziel).
- Wechselnote/Doppelschlag (Ton, +1/2, −1/2, Ton, +1/2) bei 0,15 s je Ton:
  - getrennt 63 % (Lauf in eine Richtung, gleiche Dauer: 83 %),
  - der Anfangston verschmilzt fast immer mit dem oberen Nachbarn,
  - ab 0,20 s 100 %.
- Melisma (8 Töne, Zufallsschritte 1–3 Halbtöne), getrennt:

  | Tondauer | 0,08 s | 0,10 s | 0,12 s | 0,14 s | 0,17 s | 0,20 s |
  |---|---|---|---|---|---|---|
  | SPK9 | 42 % | 73 % | 81 % | 75 % | 83 % | 98 % |

- Melisma-Gruppe M5 (0,09–0,14 s): 63 %.
- Durchgangstöne verschluckt: 56-57-58 (0,15 s) ergibt 56 + 58, 60-62-63 ergibt 60 + 63.
- Die Vorgabe „neuer Ton ≥ ~60–80 ms stabil“ verlangt Trennung ab etwa 0,1 s. Die R-Fälle des Bauers (0,15–0,24 s) laufen nur in
  eine Richtung und decken das nicht ab.

**4. mittel – Oktav-Fehler bei getrennten Gesangstönen viel häufiger als angegeben (Oktav-Prüfung aus SPK2 unverändert übernommen)**
- Eigene Formant-Stimme (5 Vokale, realistische Übergänge), Oktav-Fehler:

  | Gruppe | Oktav-Fehler | Anteil |
  |---|---|---|
  | M1 tief (E2–G3) | 7 von 159 | 4,4 % |
  | M3 (1–2-Halbton-Schritte mit Vibrato ±40–50 ct) | 11 von 95 | 11,6 % |
  | M2 hoch | 8 von 150 | davon 7 aus der Spur selbst |

- Der Bauer nennt 2 von 172, „Vokal i“.
- Gegenprobe mit einer Mess-Kopie, in der nur die Oktav-Prüfung in `segNotes9` aus war:
  - M1 ohne Oktav-Fehler, getrennt 95,6 % → 100 %,
  - M3 ohne Oktav-Fehler, getrennt 84,8 % → 98,7 %.
  - Die Prüfung ist also die Ursache.
- Folgen:
  - M3 verfehlt dadurch das Ziel ≥ 90 %.
  - Beim „wie MIDI bearbeiten“ steht die Note eine Oktave falsch (Anzeige, Chor-Grundlage).
- Die Ursache bestand schon vorher. SPK9 wendet sie aber auf jeden einzelnen Legato-Ton an.

**5. mittel – Auftrag nur für den einstimmigen SPK2-Weg umgesetzt; SPK3 „Überall finden“ und SPK4 mehrstimmig unverändert**
- Verlangt war ausdrücklich „SPK2/SPK3/SPK4-Weg, einstimmig und mehrstimmig“.
- „Überall finden“:
  - `finden` ruft weiter `segNotes(...)` auf (index.html Z. 100060).
  - `finden3` leitet alles außer Bass an `finden0` weiter.
- Mehrstimmig:
  - `polyNoten` ist der Standard für **Original**, Pads und Rest.
  - Messung mit den Fällen des Bauers, Gesang-Ebene, `POLY=1`: L 17,4 % getrennt, 147 % Zusatz, Befund 17 0/12.
  - Wer „Noten finden“ auf dem Original (Standard: mehrstimmig) mit Gesang startet, bekommt Legato weiter nicht getrennt.
- Der Bauer nennt das unter „Offen“. Die Kopfzeile „SPK9 ist fertig“ ist dafür zu stark.

**6. leicht – Lautstärke-Sprung an der Tongrenze ≥ ~11 dB: Ton geht verloren (Ausklang-Regel 12 dB)**
- Sweep SD: 3 Töne, Schritt 3 Halbtöne, jede Grenze X dB leiser, getrennt:

  | Sprung | −6 dB | −9 dB | −11 dB | −13 dB | −16 dB |
  |---|---|---|---|---|---|
  | SPK9 | 100 % | 89 % | 72 % | 39 % | 11 % |

  - Lauter: +6 dB 100 %, +10 dB 94 %.
  - Basis bei Sprüngen nach unten 0–6 %, also kein Rückschritt.
- Bei −13 dB wird teils die ganze Phrase zu einer Note mit mittlerer Tonhöhe (57-60-63 ergibt 60).
- Gemischte Pegel −14…+10 dB (Gruppe M4): 66,7 %.

**7. leicht – Vibrato mit Pegel-Schwankung erzeugt weiter Zusatz-Noten (Anschlag-Regel aus SPK2, unverändert)**
- Gehaltene Töne 2 s, ±40 ct, Tremolo in Prozent des Pegels, Zusatz:

  | Tremolo | 0 % / 10 % | 20 % | 30 % |
  |---|---|---|---|
  | Zusatz | 25 % | 150 % | 375 % |

  - Die 25 % bei 0 % und 10 % Tremolo sind nur Oktav-Fehler.
  - Basis und SPK9 liefern dieselben Werte; der Fehler ist nicht neu.
- Gemischte Gruppe M7 (24 gehaltene Töne):
  - 6 Tremolo-Fälle: 29 Zusatz-Noten.
  - 18 Fälle ohne Tremolo: 2 Zusatz-Noten bei 48 kHz, 4 bei 44,1 kHz. Das sind ausschließlich Oktav- und Diphthong-Teilungen.
  - Das Ziel ≤ 5 % gilt also nur für Vibrato ohne Pegelschwankung und ohne Oktav-Fehler. Die V-Fälle des Bauers liefern 0 %.

**8. leicht – Auswahl oben ≤ 400 Hz schaltet SPK9 auch auf der Gesang-Ebene ab**
- Befund 17 auf der Gesang-Ebene:
  - ohne Auswahl: 3 Noten,
  - Auswahl 150–600 Hz: 3 Noten,
  - Auswahl 150–380 Hz: **eine** Note 59 wie in der Basis.
- Wer bei einer tiefen Stimme den Grundton-Bereich markiert, verliert die Trennung. Die Regel `fbMin = 400` greift also nicht nur
  für die Bass-Ebene.

**9. leicht – Zahlen des Bauers hängen von der Stichprobe ab und sind teils zu günstig angegeben**
- Mit `leg.mjs` des Bauers reproduziert, exakt gleich:
  - 48 kHz: L 98,8 % / 1,2 %, V 0 %, G 96,9 % / 12,5 %, A 0 %, B 12/12.
  - 44,1 kHz: L 98,3 %, G 9,4 %.
- Gleiche Erzeugung, andere Zufallsfolge (`ONLY=L,V,G,A,B,R`): G 15,6 %, A 12,5 % (statt 0 %), R 97,2 % (statt 100 %).
- Die G-Wahrheit wurde während der Entwicklung auf „Mitte des Gleitens“ gesetzt (LOG 20:53). Das ist vertretbar, senkt aber den
  gemessenen Zusatz-Anteil.

## Was stimmt (eigene Messungen)

**Legato mit eigener Stimme**
- Aufbau: 40 Teiltöne, 4 Formanten je Vokal, Zittern, Intonation ±15 ct.
- Übergänge realistisch: Überschwingen 15 % des Intervalls, höchstens 0,5 Halbtöne; Anschleifen 40 ct.
- Getrennt (Zusatz ohne Oktav-Fehler ≤ 1,3 %):

  | Gruppe | getrennt | Basis |
  |---|---|---|
  | M1 tief | 95,6–98,7 % | 4–35 % |
  | M2 hoch | 92,6–96,6 % | 20–44 % |
  | M3 kleine Schritte + Vibrato | 84,8–93,3 % (oktavtolerant 98,7–100 %) | |

- Weitere Gruppen:
  - Konsonant-Lücken (M6): 83 % (Basis 44 %).
  - Anschleifen und Phrasen-Fall (M9): 90 %, Zusatz ohne Oktav-Fehler 5 %.
  - Befund-17-Abwandlungen (0,35/0,5 s, Vibrato, Gleiten) M10: 24/24.
- 44,1 kHz: M1 95,0 %, M2 95,3 %, M3 85,3 %.
- Hinweis: Mit übertriebenem Überschwingen (30 % des Intervalls, bei großen Sprüngen > 1 Halbton für ~100 ms) entstehen kurze
  Zusatz-Noten. Das ist vertretbar, weil die Höhe wirklich gesungen wurde.

**Seite per Touch**
- Getestet hochkant 428×926 und quer 926×428, mit `pruef/ui-pruef.mjs` und Fotos in `pruef/fotos/`.
- Ablauf nur per Touch: ⋯ der Ebene → „Noten bearbeiten“ (findet die Noten selbst) → Note ziehen → „Anwenden“ → ↶.
  - Legato mit Vibrato ±40 ct und 60 ms Gleiten (E4 G4 F4 D4 E4): 5 Noten. F4 → G4.
    - Ziel −3,7 ct, Nachbarn unverändert (+2,2 / −8,1 / +6,0 / −3,0 ct wie vorher).
    - Nach ↶ wieder genau wie vorher.
  - Befund 17: 3 Noten, D4 → C#4. Ziel 0,004 ct, Nachbarn unverändert.
- „Anwenden“ dauert 537–600 ms (der erste Lauf einmal 1041 ms).
- Knackser: Die Grenzen der umgesetzten Note liegen bei 0,43–1,19 × Innenpegel der 2. Differenz (vorher 1,00–1,04). Kein Knack.
- Konsole ohne Fehler.

**Laufzeit**
- Eigener 3-Minuten-Gesang, Ebene Gesang, „Noten finden“: Basis 7,0–7,9 s, SPK9 6,9–8,2 s (je 2 Läufe, zweimal). Es wurden 360
  statt 88 Noten gefunden.
- Mit `leg.mjs` (88 Fälle): 25,0 s → 25,2 s.

**Begleitung in derselben Ebene (Pad −12 dB + Hi-Hat)**
- Getrennt 88,6 % (Basis 11,4 %).
- Der Zusatz kommt fast nur vom Pad vor und nach der Stimme, nicht von SPK9.

**Probe-Merge mit `git merge-file`**
- SPK9 auf 4.64.0 (basis8): 0 Konflikte. topdefs 0/0, dupkeys 0, Legato wirkt dort gleich: L 98,8 %, B 12/12
  (4.64 allein: 12,8 %, 0/12).
- Danach mit SPK10 und VX3: 0 Konflikte.
- Mit IMP2 (Basis basis7): 0 Konflikte. CHR5 ist noch gleich basis7.

## Regression (einzeln nacheinander, Kopie in `pruef/reg/`)

- spk4-test gegen basis7: 6 FEHLER von 23 (404 s).
  - a1-mehrstimmig-gemisch-besser und a3-unison-pad-besser: identische Werte wie vorher (8/28, 0,96), wie im SPK8-Paket.
  - a2-verfeinern-plus-1db: −0,01 dB, bekannt.
  - a3-nachbau-zeit: nur `abstaendeGleich` false, alle Zeiten ≤ 1,3×. Die Klang-Probe schwankt (lead 1,34 → 0,95).
  - reg-spk3-test: 14/17, die bekannten drei.
  - reg-ki1-test: quer-428, quer-370 und besser-als-klassisch-demo (vorbestehend).
  - Alles ohne SPK9-Bezug. Die zusätzliche Abweichung gegenüber dem Bauer-Lauf (a3-nachbau-zeit) ist in der Aufgabe als
    erwartet genannt.
  - reg-spk2-test 28/30 mit noten-erkannt 14/51 wie Basis. a1-bassband unverändert. vx1-test 61/61.
- spk5-test: ALLES OK 24/24 (60 s).
- spk5-fade-test: ALLES OK (39 s).
- spk6-test: ALLES OK (36 s).
- spk6-pruef-test: fails 0 (139 s).
- spk1-test: 17/18, nur verfeinern-verbessert-ziel (wie Basis).

## Pflichtprüfungen (auch in LOG.md)

- topdefs: Skripte 26, Namen 7460, doppelt 0, Syntaxfehler 0.
- dupkeys: 0.
- smoke: errors [] (`pruef/smoke-pruef.png`).
- „MS 2000“ 1×, „  live: true,“ 1×, VERSION 4.63.0 (unverändert).
- Markenwörter (13er-Liste der Prüf-Skripte): Summe Basis 17 = SPK9 17, kein Wort gestiegen.
- In Block, einbau.py, NOTES, LOG, leg/, spk9-ui.mjs und `pruef/` stehen keine Marken-, Datensatz- oder Produktnamen.
- einbau.py baut bitgleich nach. Der Diff gegen die Basis enthält nur den Block und 3 Haken.

## Dateien

`pruef/legx.mjs` (eigene Prüffälle M1–M10, Sweeps SD/SM/SG/ST/SK/SZ, MX), `pruef/rescore.cjs` (Oktav-Fehler getrennt zählen),
`pruef/lang.mjs` (Laufzeit 3 min), `pruef/bassband.mjs` (Auswahl ≤ 400 Hz), `pruef/ui-pruef.mjs` + `ui-pruef.json` + `fotos/`,
Ergebnis-JSONs `pruef/*.json`, Regression `pruef/reg/*.out|json|log`.
