# SPK11B – Unabhängige Prüfung (nichts repariert)

Geprüft: `vx/spk11b/index.html` gegen `basis.html` (= rel-4690, 4.69.0, byte-gleich bestätigt). Eigene Werkzeuge und Lieder in
`vx/spk11b/pruefung/` (an den Dateien des Pakets nichts geändert; der Test des Pakets lief aus einer Kopie, damit seine Ausgaben nicht
überschrieben werden).

## Urteil in Kürze
- Die beiden offenen Fehler aus SPK11 sind auf den eigenen Liedern **deutlich besser**: viel weniger Zusatz-Kicks, keine Kicks mehr als
  Snare, mehr Hi-Hats, Bass-Phantomnoten im Outro ohne Bass weg. Kein Rückschritt bei den Treffern, keine Konsolenfehler, alle
  Pflichtprüfungen grün, Diff nur Zusätze (135 Zeilen, 0 entfernt).
- **Die Allgemein-Aussage „≥ 95 % je Instrument, ≤ 5 % Zusatz“ gilt nicht allgemein**, und die Aussage „das echte leise Bass-Intro
  bleibt“ gilt nur bis etwa −20 dB. Zwei echte Befunde (B1, B2), dazu vorbestehende Grenzen (B3–B5).

## Eigene Testlieder (`pruefung/lieder.mjs`, andere Klänge als `songs.mjs`)
| Lied | Tempo | Aufbau (Wahrheit) | Prüft |
|---|---|---|---|
| p80 | 80 BPM | I4 S8 R8 O2 | 16tel-Shuffle (60 %), Ghost-Snares (−17 dB), Bass gleichzeitig mit jedem Kick, **sehr leises echtes Bass-Intro (−20 dB, nur Bass + Fläche, lange abklingende Noten)**, Outro nur Fläche, offene Hi-Hat im Refrain |
| p128 | 128 BPM | I4 S8 R8 O4 | 4 auf den Boden mit langem Kick, Bass auf jedem Kick + Offbeat, offene Hi-Hat auf jedem „und“, 16tel-Hats mit Betonung, **ganzes Intro −22 dB**, Outro Drums ohne Bass |
| p174 | 174 BPM | I4 S16 R16 O4 | Zweischritt, Ghost-Snares, Sub-Bass lang und gleichzeitig mit dem Kick, Intro nur Drums (kein Bass), Outro nur Fläche |

Ablauf wie Xander per Touch bei 428×926: Datei laden → Zerlegen (schnell) → + Pads aus Rest → Ansicht → Szenen anlegen.
Wahrheit ±50 ms (zusätzlich „Raster“ = ±halber 1/16-Schritt für den Shuffle: gleiche Zahlen). Jede Fassung 1–3 Läufe, die Ergebnisse
sind zwischen den Läufen gleich.

## Treffer per Touch (vorher `basis.html` → nachher `index.html`)
| Lied | Kick | Snare | Hi-Hat (inkl. offen) | Ghost als Snare / als Kick | Offene HH als HH / als Snare |
|---|---|---|---|---|---|
| p80 | 46/64 +0 → **64/64 +0** | 32/32 **+21** → **32/32 +0** | 218/248 → **248/248** | 0/48 / 0 → 0/48 / 0 | 8/8 / 0 → 8/8 / 0 |
| p128 | 47/96 **+17** → 80/96 +3 | 40/48 **+12** → 40/48 +1 | 153/384 → 167/384 | – | 77/96 / 3 → 79/96 / 1 |
| p174 (Raster 87 BPM, siehe B2) | 67/71 +4 → **71/71 +0** | 72/72 +6 → 71/72 +0 | 240/286 → 283/286 | 0/72 / 0 → 0/72 / 0 | 16/16 / 0 → 16/16 / 0 |

p128: alle fehlenden Kicks (16) und Snares (8) liegen im −22-dB-Intro (B4); ohne Intro Kick 80/80 +3 (3,8 %), Snare 40/40 +1.
Die Hi-Hat-Lücke in p128 sind die leisen 16tel zwischen offenen Hats und Snares (B3).

Phantom-Drums in Teilen ohne Drums (p80 Intro/Outro, p174 Outro): 0 in beiden Fassungen. Die neue Regel „leiser Drum-Teil mit
Muster bleibt“ hat dort nichts fälschlich zurückgeholt.

## Klassifikator allein (offline, gedumpte Drum-/Bass-Ebene, **wahres** Raster; `pruefung/offline.mjs`, `offline.out`)
| Lied | Kick | Snare | Hi-Hat | Zeit spk11Hits → spk11bHits (Median 5, unter Last) |
|---|---|---|---|---|
| p80 | 46/64 +0 → 64/64 +0 | 32/32 +21 → 32/32 +0 | 218/248 → 248/248 | 13,8 → 27,1 ms |
| p128 | 43/96 +19 → 80/96 +3 | 40/48 +11 → 40/48 +0 | 156/384 → 170/384 | 9,7 → 18,6 ms |
| p174 | 67/72 +30 → 71/72 **+16** | 72/72 +5 → 72/72 +0 | 237/288 → 285/288 | 10,9 → 30,4 ms |

Mit und ohne Bass-Ebene als Gegenreferenz kommen auf allen drei Liedern **dieselben** Treffer heraus; die Wiederholungs-Regel je Takt
ändert auf allen drei Liedern ebenfalls nichts (`kdiag.mjs`: gleiche Zahl mit 16 Schritten je Takt und mit abgeschalteter Regel).

## Bass je Wahrheits-Teil (Noten / Wahrheit)
| Lied | Intro | Strophe | Refrain | Outro |
|---|---|---|---|---|
| p80 basis | 1/8 | 39/32 | 43/32 | 0/0 |
| p80 index | **0/8** (als Trennrest still, B1) | 38/32 | 43/32 | 0/0 |
| p128 basis | 0/32 (Basis-Regel −26 dB) | 69/64 | 68/64 | **12/0** |
| p128 index | 0/32 (unverändert) | 68/64 | 68/64 | **0/0** (Rest: ges −16, Band −48) |
| p174 basis = index | 1/0 | 40/32 | 18/32 | 2/0 |

p174: Die Tempoerkennung liefert 87 statt 174 BPM, daher sind die erkannten Teile verschoben. „Intro 0–4“ (87er Takte) enthält das
Intro ohne Bass und 4 Takte Strophe mit Bass, „Outro“ enthält 4 Takte Refrain. Die Regel kann dort nicht greifen. Mit den Wahrheits-Teilen
offline (`introsweep.out`) wäre das reine Drum-Intro ein Trennrest (Band −42,7 dB), also richtig erkannt.

## Befunde
**B1 (mittel) – sehr leises echtes Bass-Intro wird als Trennrest gelöscht.** p80: Bass gleiches Register wie die Strophe, etwa −20 dB,
lange abklingende Noten. Messwerte: gesamt −23 dB, Grundton-Band −31,2 dB, Anteil 0,09, also `rest: true`. Ergebnis: Intro still, keine
Notensuche, kein Clip. In `basis.html` ist das Intro nicht still (findet nur 1/8 Noten). Die Regel kippt 1 dB unter der Schwelle: mit
+3 dB bleibt das Intro (`introsweep.out`). Die in NOTES genannte Grenze („nur ≥ 8 dB leiser **und** eine Oktave höher“) ist zu eng gefasst.
Tatsächlich fällt jedes echte Intro, dessen Grundton-Band ≤ −30 dB liegt und dessen Noten abklingen (Anteil < 0,35 schützt dann nicht).
Das eigene Testlied „intro“ des Pakets lag mit −11/−16 dB weit weg von der Schwelle. Die Trennreste lagen in allen gemessenen Fällen
bei −42,7 … −119 dB (eigene) bzw. −74/−77 dB (Paket), es gäbe also Abstand für eine tiefere Schwelle. Das ist ein Vorschlag, ich habe es
nicht gebaut.

**B2 (mittel) – Zusatz-Kicks 1/16 nach dem Kick bei 174 BPM mit Sub-Bass.** Offline mit wahrem Raster: 16 Zusatz-Kicks auf 72 (22 %,
Basis 30 = 42 %), alle auf @1 und @11, also 1/16 nach den Kicks auf @0 und @10. Das ist die Schwebung von Kick-Ende und Sub-Bass
(27–38 Hz). Merkmale an den Stellen: nl 0,43–0,45, Mitten/Tiefen 0,12–0,66 (< 0,9), Drum-Ebene tief 6–14× stärker als die Bass-Ebene
(`kdiag-p174.out`). Ursache: Die Ausnahme `strong` (nl ≥ 0,65 × Mittel der Kick-Häufung) überspringt Anschlag-, Abkling- und Snare-Prüfung,
und die Schwebung erreicht diese Höhe. Die Bass-Gegenreferenz greift nicht. Per Touch ist der Fehler nur deshalb unsichtbar, weil das
Raster auf 87 BPM steht und @1/@11 dann zwischen den Rasterpunkten liegen. Das Kriterium „≤ 5 % Zusatz“ ist hier nicht erfüllt.

**B3 (vorbestehend, leicht besser) – leise 16tel-Hi-Hats unter offener Hi-Hat/Snare.** p128: 167/384 (Basis 153). Die normierten
Höhen-Einsätze dort liegen bei 0,00–0,13, unter der Schwelle 0,12 (`hatpos.out`). Das Einsatz-Maß (Pegel minus Mittel der 40 ms davor)
verliert sie im Ausklang. Das Kriterium „≥ 95 % HH“ ist nicht erfüllt, es ist aber kein Rückschritt.

**B4 (vorbestehend) – ganz leises Intro (alles −22 dB):** In beiden Fassungen gibt es dort keine Drum-Treffer, weil die Schwellen am
97-%-Wert des ganzen Lieds hängen. Den Intro-Bass legt schon das Zerlegen nicht in die Bass-Ebene (Grundton-Band −110 dB), und die
Basis-Regel (−26 dB) setzt ihn still.

**B5 (Info) – Ghost-Notes:** Sie werden in beiden Fassungen nicht als Snare erkannt (0/48, 0/72), aber auch nicht als Kick, es entstehen
also keine Falschnoten. Den Shuffle (60 %, +37 ms bei 80 BPM) setzt der Klassifikator sauber auf das 1/16-Raster.

**B6 (gering) – Aufwand der Gegenreferenz ohne Nutzen auf den eigenen Liedern.** spk11bHits braucht mit Bass-Ebene etwa doppelt so lange
(siehe Tabelle). Dazu bleibt die gerenderte Bass-Ebene während des ganzen Anlegens in `SPK11B.go.bass` im Speicher, auch wenn die
Bass-Zeile kein Audio anlegt. Bei 4 Minuten sind das etwa 42 MB zusätzlich. Ist die Bass-Zeile abgewählt, wird die Bass-Ebene allein
für die Referenz zusätzlich gerendert.

**B7 (gering) – Haupt-Thread:** `spk11bSpec` läuft am Stück synchron: 44–71 ms je 47–68 s Audio (Node, unter Last, etwa 1 ms je
Sekunde). Bei einem 4-Minuten-Lied auf dem iPhone sind das geschätzt einige hundert ms ohne Fortschrittsanzeige. Die Seite hängt
nicht, aber in dieser Zeit ruckelt sie.

**B8 (kosmetisch):**
- Der Kommentar über `spk11bFft` („Anteil der Ebene … Original minus Ebene“) beschreibt den verworfenen Ansatz.
- `tK2 = Math.min(tK, 0.3)` ist wegen der Klemmung tK ≥ 0,3 immer 0,3.
- `diag[...].band` hängt als Eigenschaft an einem Array und fehlt deshalb in JSON und Testausgabe.

**Nicht SPK11B (wie NOTES, bestätigt):**
- Tempoerkennung oktavfalsch bei 174 BPM (87).
- Teilnamen schief (p80: „Refrain 1 | Bridge | Refrain 2“ für I | S+R | O).
- Bass-Oktavfehler in den Teilen (p128: 14 von 115).

Ein Versuch, das Raster bei p174 von Hand auf 174 zu setzen, war ungültig: Das Raster wurde beim Anlegen zurückgesetzt. Die Rohdaten
liegen getrennt in `pruefung/roh-ungueltig/` und sind nicht gewertet.

## Laufzeit „Szenen anlegen“ (Tippen bis fertig, Median, 4 Kerne mit Fremdlast)
| Lied | basis | index |
|---|---|---|
| p80 (3 Läufe) | 8746 ms | 7647 ms |
| p128 (3 Läufe) | 5877 ms | 5120 ms |
| p174 (1 Lauf) | 7453 ms | 7732 ms |

Die Fassung `index.html` ist schneller, weil für still gesetzte Teile keine Notensuche läuft. Bei p128 ist das richtig (Outro ohne Bass),
bei p80 kommt der Gewinn vom fälschlich gelöschten Intro (B1). Die Zusatzkosten von spk11bHits und spk11bSpec (zusammen unter 0,1 s je
Lied) gehen im Rauschen unter.

## Nachgeprüft
- Test des Pakets (Kopie `pruefung/spk11b-test-kopie.mjs`, Ausgabe `spk11b-test-kopie.out`): **9 OK / 0 FEHLER**, Zahlen wie im Paket.
- topdefs (mit `NODE_PATH=/opt/node-tools/node_modules`): 26 Skripte, 7614 Namen, 0 doppelt, 0 Syntaxfehler.
- dupkeys: 0. Ohne NODE_PATH bricht auch dieses Werkzeug ab, weil es `acorn` nicht findet.
- smoke: errors [] (`pruefung/smoke-pruef.png`).
- „MS 2000“ 1×, „^  live: true,“ 1×.
- VERSION-Zeilen identisch mit basis (4.69.0).
- Keine Emojis im Block und im Haken, keine Marken- oder Produktnamen.

## Dateien (`vx/spk11b/pruefung/`)
- Lieder und Abläufe: `lieder.mjs`, `lauf.mjs`, `lauf1.out`, `lauf2.out`
- Rohdaten: `roh/*.json`
- Bewertung: `bewerte.mjs`, `bewertung.out`, `bewertung.json`, `zeiten.mjs`
- Offline-Prüfungen: `offline.mjs`, `offline.out`, `hatpos.mjs`, `hatpos.out`, `kdiag.mjs`, `kdiag-p174.out`, `introsweep.mjs`, `introsweep.out`, `hatlev.mjs`
- Gedumpte Ebenen: `dump/<lied>/`
- Fotos: `fotos/`
- Test des Pakets aus der Kopie: `spk11b-test-kopie.mjs`, `spk11b-test-kopie.out`
