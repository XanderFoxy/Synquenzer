# SPK6 Ebenen-Werkstatt – unabhängige Prüfung (Teil 1 + Teil 2)

Geprüft: `spk6/index.html` (8 621 550 B) gegen `spk6/basis.html` (= basis5.html, cmp gleich).
`python3 einbau.py <tmp>` baut eine Datei, die mit index.html bitgleich ist (19 Ersetzungen, je Anker 1×).
Eigene Läufe: Playwright chromium, Touch über CDP, 428×926 und 926×428, deviceScaleFactor 2.
Skript: `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/spk6p/pruef6.mjs` (Teile a–m über `TEIL=`).
Ergebnisse: `spk6p/pruef6-*.json`. Fotos: `spk6p/fotos/p6-*.png`. Am Paket wurde nichts geändert.

Testsignal (wenn nicht anders gesagt): Gesang-Ebene „Gesang“ aus einem Rechteck 0,8–4,1 s / 150–9500 Hz.
Darin A3, D4 und H3 (je 0,92 s, 80 ms Pause, 24 Teiltöne mit Formanten), dazu ein leiser Dauerton E5 (0,02) als Hintergrund und ein Bass 55 Hz im Rest.
Die Notenerkennung findet 57/62/59 (plus eine kurze 57 am Anfang).
„Langes Lied“ = 180 s mit 348 Noten (0,42 s, Abstand 0,5 s).

---

## Befunde

### Schwer

**1. „Anwenden“ rechnet bei jedem Schritt die ganze Ebene neu – auf einem echten Lied viele Sekunden, und der Fortschritt bleibt lange auf 0 %**
- Wiederholen: Langes Lied (3 min) → ⋯ Gesang → Noten bearbeiten → eine Note antippen → +1 → Anwenden.
- Gemessen (12× je eine einzelne Note, API `__spk6.plan`): 5252, 5424, 6246, 5312, 5263, 5492, 5261, 5147, 5295, 5719, 5855, 5742 ms.
- Über die Bedienung (Zeitverlauf der Anzeige, Teil k):
  - 11 ms: „Anwenden … | Rechne 0 %“
  - 4515 ms: „Rechne 5 %“
  - 4695 ms: fertig
  - Der Knopf steht also 4,5 s auf „Rechne 0 %“ und springt dann in 0,2 s auf fertig.
- Ebenso langsam: „Ganze Ebene +1“ 19,5 s, „Chor erzeugen“ mit 4 Stimmen 53,1 s.
- Zum Vergleich: Vorhören (8-s-Ausschnitt) 553 ms, Anwenden auf dem 5-s-Testlied 457 ms.
- Ursache im Code: `plan()`/`shift()`/`chor()` rufen `baseOf(d, b)` ohne Bereich auf. Das rendert die ganze Ebene über `I.render(0 … d.meta.n)` und hat keinen Fortschritt. `remake()` schreibt danach das ganze Audio neu. Fortschritt meldet nur `pv()`.
- Die Angabe in NOTES.md „Rechnung nur in Noten-Bereichen“ gilt nur für den Vocoder-Teil.

**2. Anwenden, Chor oder Transponieren während der Wiedergabe → mehrere Sekunden Stille**
- Wiederholen: Langes Lied → ▶ Abspielen ab 30 s → während es spielt eine Note anwenden.
- Gemessen (Teil g): 4720 ms am Stück ohne geplante Quelle. Danach läuft die Wiedergabe weiter.
- Grund: Der Worker liefert die `block`-Anfragen erst nach der Rechnung.
- `spk6EdGo` stoppt nur das Vorhören (`SPK1.pl.s6`), nicht die normale Wiedergabe.
- Beim Chor (53 s) bzw. bei „Ganze Ebene“ (19,5 s) ist die Lücke entsprechend länger.

**3. Speicher wächst mit jedem Anwenden – die Undo-Grenze zählt das Audio nicht mit**
- Wiederholen: Langes Lied → 12× nacheinander je eine Note umsetzen (Anwenden).
- Danach im Worker gezählt (Teil c, `K.docs.get(id).a6`): 12 Audio-Fassungen = 201,4 MB.
- Nach zusätzlich Chor (4 Stimmen): 16 Fassungen = 268,5 MB.
- `d.undo` hat 14 bzw. 20 Schritte. Die Byte-Grenze in `uEnd` (48e6) sieht davon 0 MB (`u.bytes` zählt nur Masken-Streifen).
- Je Fassung ≈ 16,8 MB (3 min, Int16 mono). Bei 30 Undo-Schritten sind das ≈ 500 MB im Worker – auf dem iPhone droht der Abbruch des Tabs.
- `prune` gibt nur Audio frei, das kein Undo/Redo-Schritt mehr nennt.

### Mittel

**4. Die Kopie ist auf Masken-Ebene nicht unabhängig von der Quelle**
- Wiederholen: ⋯ Gesang → Kopieren. Dann ein Rechteck 2,2–2,8 s / 150–9500 Hz wählen → In Ebene ▾ → „Gesang Kopie“ (aus Original, Verschieben).
- Gemessen (Teil a2): Die Quelle „Gesang“ verliert diesen Bereich ganz – RMS 2,3–2,7 s von 0,0755 auf 0,0000.
- Grund: `transfer()` (von 'orig', verschieben) nimmt den Bereich allen anderen Ebenen weg, also auch der Quelle. Umgekehrt (In Ebene → Quelle) verliert die Kopie.
- Gleiche Ursache beim erneuten Zerlegen (Teil m): Erst Zerlegen, dann die Gesang-Ebene kopieren, dann noch einmal Zerlegen. Die Energie der Gesang-Ebene sinkt von 0,21 auf 0,09, weil die Kopie als „eigene Ebene“ belegt zählt.
- Das widerspricht „echte, unabhängige Kopie … nachbearbeiten“.

**5. Quelle löschen, Kopie behalten → der Gesang klingt doppelt**
- Wiederholen: ⋯ Gesang → Kopieren → ⋯ Gesang → Ebene löschen.
- Gemessen (Teil a14, Effekte der Kopie aus, Chor stumm), RMS des Mix 1,3–1,7 s:
  - Original: 0,1351
  - mit Kopie: 0,1983
  - nach dem Löschen der Quelle: weiterhin 0,1983
- Der Rest bekommt den Gesang zurück, und die Kopie (`k6 = 1`) klingt weiter zusätzlich.
- Erwartung: Die Kopie übernimmt die Stelle der Quelle, also 0,1351.

**6. „▶ Auswahl“ spielt umgesetzte Ebenen und Chorstimmen nicht**
- Wiederholen: Eine Note der Gesang-Ebene umsetzen (Anwenden). Dann ein Rechteck über alles wählen (0,5–4,5 s, 100–9000 Hz) → ▶ Auswahl.
- Gemessen (Teil l, Blöcke 3–11 mit Auswahl):

  | Mischung | vorher | nach dem Umsetzen |
  |---|---|---|
  | Gesang allein | 1480,56 | 0 |
  | ganzer Mix | 1480,57 | 0,01 |

  Ohne Auswahl klingt die Ebene (1141,84).
- Grund: In `raw()` steht `if (l.a6) { if (sel) return null; … }`, und die Ebene ist zugleich aus dem Spektral-Durchgang genommen.
- Das steht nicht in NOTES.md.

**7. Der Modus „Noten bearbeiten“ bleibt nach einem Dokumentwechsel oder nach dem Löschen der Ebene hängen**
- Wiederholen A (Teil a16): ⋯ Gesang Kopie → Noten bearbeiten → eine Note 1 Zeile hochziehen (Entwurf) → anderes Dokument öffnen (Ansicht → Andere Quelle … bzw. `__spk.page.open`).
  - Ergebnis: Das Werkzeug ist weiter `s6ed`, kein Werkzeug-Knopf ist aktiv.
  - Die Optionszeile zeigt „Noten · Gesang Kopie“ (Ebene aus dem alten Dokument).
  - Die Statuszeile zeigt „1 gewählt · 1 geändert · „Anwenden“ rechnet neu“.
  - Ein Rechteck-Zug im neuen Dokument erzeugt keine Auswahl (`sel 0`).
- Wiederholen B (Teil j2): Noten bearbeiten auf „Gesang Kopie“ → ⋯ derselben Ebene → Ebene löschen → Wirklich löschen?
  - Ergebnis: Der Modus bleibt, die Zeile zeigt „Noten · Gesang Kopie“, die Fläche reagiert nicht mehr (Foto `p6-09-geloescht-im-notenmodus.png`).
- Risiko: `U.s6e` (lid + Noten-ids) wird nicht zurückgesetzt. Hat das neue Dokument eine Ebene mit derselben id und eine Note mit derselben id (n1, n2, …), wirkt „Anwenden“ dort.
- Der einzige Ausweg ist ein Tipp auf ein Werkzeug der Leiste.

**8. Regler und „Kopieren“ werden während einer laufenden Rechnung still verworfen**
- Wiederholen (Teil h, 40-s-Lied):
  1. ⋯ Gesang → Chor erzeugen … → 6 → Chor erzeugen.
  2. Sofort ⋯ Gesang Kopie → Effekte … → Hall-Regler per Touch ziehen.
- Gemessen: Der Regler zeigt 0,8, `fx` der Ebene bleibt `null` – auch nachdem der Chor fertig ist. Keine Meldung.
- Gleiches mit „Kopieren“ während der Rechnung: Das Menü schließt, die Statuszeile bleibt „Chor …“, es entsteht keine Kopie.
- Grund: `spk6Run` beginnt mit `if (U.busy) return null;`, ohne Rückmeldung und ohne den Regler zurückzusetzen.

**9. Kennungen und Namen in der Ebenen-Zeile sind abgeschnitten bzw. vom S-Knopf überdeckt**
- Wiederholen (Teil f): Kopie + Anwenden + Hall auf der Kopie, Chor 2 Terzen, Echo auf Stimme 1.
- Gemessen, Überstand der Kennung über den Anfang des S-Knopfs:

  | Kennung | hochkant | quer |
  |---|---|---|
  | „Kopie · neu · FX“ | 55 px | 44 px |
  | „Chor · FX“ | 13 px | 2 px |

- Sichtbar bleibt nur „Kopie ·“ bzw. „Chor ·“ (Fotos `p6-kennung-L2-428x926.png`, `p6-kennung-L2-926x428.png`).
- Hochkant sind die Namen auf „Gesa…“ gekürzt. „Gesang Terz ↑“, „Gesang Terz ↓“ und „Gesang Kopie“ sehen gleich aus und lassen sich nicht unterscheiden (`p6-kennung-428x926.png`).
- Art „Satz“ mit 6 Stimmen legt zweimal „Gesang Unisono“ an (gleicher Name).
- Die Angabe im Bericht „Marken unter dem Namen, weil sie hochkant sonst abgeschnitten werden“ trifft nur für kurze Kennungen („Chor“, „Kopie“) zu.

**10. Feinmodus (±50 ct) fehlt im Modus „Noten bearbeiten“**
- Auftrag b: „Halbton-Raster, fein ±50 ct mit Shift-/Feinmodus“.
- Im neuen Editor gibt es nur Halbtöne: Ziehen, ±1, ±12, ↑/↓. Shift+↑/↓ ist dort Oktave, nicht fein.
- Cent gibt es nur im alten Noten-Klappfenster (Werkzeug Noten): ±10 ct je Tipp. Jeder Tipp rechnet sofort neu und legt einen eigenen ↶-Schritt an, auf dem langen Lied je ≈ 5 s (Befund 1).
- NOTES.md nennt das als offen.

**11. Tiefpass-Regler: lineare Skala 0…20000 Hz, 0 = aus**
- Wiederholen: ⋯ → Effekte … → Tiefpass Hz per Touch knapp nach rechts ziehen.
- Der erste Schritt (100) wird zu 200 Hz – stärkste Wirkung. Gemessen über 2,5 kHz:

  | Tiefpass | 200 | 1000 | 3000 | 10000 | 20000 Hz |
  |---|---|---|---|---|---|
  | Pegel über 2,5 kHz | −90,9 | −34,9 | −1,7 | 0 | 0 dB |

- Der nutzbare Bereich 200 Hz–5 kHz belegt nur 24 % des Reglerwegs, 1000 Hz liegt bei 5 %. Der Regler hat also „aus“ an beiden Enden und die stärkste Wirkung direkt neben „aus“.
- Ein Touch-Zug von ≈ 11 px (Ziel 1000 Hz) blieb bei 0 (Teil a9).

**12. „Chor erzeugen“ auf einer Ebene ohne Noten ergibt eine Fehlermeldung samt Konsolenfehler**
- Wiederholen (Teil e5): Neue Ebene ohne Noten → ⋯ → Chor erzeugen … → Chor erzeugen.
- Status: „Chor: Keine Noten – erst „Noten finden““. Die Konsole meldet `Error: Keine Noten – erst „Noten finden“ at spk1Reply` (über `logErr`).
- „Noten bearbeiten“ sucht die Noten in diesem Fall selbst; der Chor tut das nicht.
- Damit ist die Konsole in einem normalen Bedienweg nicht fehlerfrei.

### Leicht

**13. Wichtige Knöpfe des Notenmodus erst nach Wischen sichtbar; zwei Knöpfe heißen „Verwerfen“**
- Hochkant ohne Wischen sichtbar (Teil j1): Alle, −12, −1, +1, +12.
- Nur nach Wischen: ▶ Vorhören, A/B, Anwenden, Verwerfen, Fertig.
- Gleichzeitig stehen zwei Knöpfe „Verwerfen“ auf dem Schirm mit verschiedener Bedeutung: Auswahl in der unteren Leiste, Entwurf in der Optionszeile.

**14. Trefferfläche der Notenbalken nur 18 px hoch**
- Der Balken ist 8 px hoch (Halbton ≥ 8 px beim Öffnen), die Trefferfläche nach `spk6EdHit` 18 px.
- Das liegt unter den sonst geprüften 36/44 px. Auf dem iPhone ist das Antippen einzelner Noten fummelig, solange man nicht zoomt.

**15. Die Erfolgsmeldung nach „Anwenden“ wird auf dem langen Lied sofort überschrieben**
- Teil k: 4695 ms „1 Note neu gerechnet · ↶ macht es rückgängig“, schon 23 ms später „Spektrum 4096 · 47 %“.

**16. Werkstatt oben im ⋯-Menü: Name, Farbe und „Ebene löschen“ liegen quer jetzt unter der Falz**
- Quer: Blatt-Inhalt 470 px bei 356 px Sicht. Es ist per Wischen erreichbar (geprüft), aber die gewohnte Reihenfolge ist geändert.
- Laut CLAUDE.md Regel 3 werden sichtbare Bedienänderungen vorher vorgeschlagen.

**17. Hinweis (bestehende Notenerkennung, nicht SPK6): Gebundener Gesang wird zu einer Note**
- A3 → D4 → H3 ohne Lücke (phasenstetig) ergibt genau eine Note (m 59, 0,99–4,01 s). Auch mit Pegel-Delle von 50 % / 25 % / 0 % an den Grenzen bleibt es eine Note.
- Erst mit 80 ms Pause werden es drei Noten.
- Bei echtem Legato kann „Noten bearbeiten“ einzelne Töne daher nicht umsetzen.

---

## Was funktioniert (eigene Messungen)

**Kopieren und Noten bearbeiten**
- Kopieren per Touch: Kopie bitgleich (Abweichung 0). Mix nachher − vorher = Quelle (max. 8,9e-8). Marke „Kopie“.
- D4 → E4 per Touch (2 Zeilen ziehen, Anwenden, 457 ms):
  - Ziel +1,19 ct, Nachbarn A3 −0,1 ct und H3 −1,55 ct, Quelle unverändert (0).
  - Knack-Maß an den Notengrenzen 0,43 / 0,38, das unbearbeitete Original hat 0,87 / 0,95 – keine Knackser.
- Zeit +1/16 per Touch: Einsatz 3,263 s (Soll 3,25 s, Schwellen-Messung), Knack-Maß 0,02 / 0,38 / 0,02, Ton −1,5 ct.
- ↶ ↶ per Kopf-Taste: Die Kopie ist wieder bitgleich zur ursprünglichen Kopie. ↷ ↷ ist bitgleich zum Stand nach dem Anwenden.
- Kopie einer schon umgesetzten Ebene: bitgleich, unabhängig, Tonhöhen 0,0 ct.
- Ganze Ebene +1, danach eine Note +2: 0,0 ct; die anderen Noten +1: 0,0 ct.
- „Fertig“ mit Entwurf fragt einmal („Entwurf weg?“). Enter auf einem fokussierten Knopf löst keine Doppelaktion aus.

**Chor**
- Per Touch: 4 Quinten, Breite 50 %.
  - Vorhören 1,5 s, dabei entsteht keine neue Ebene.
  - Erzeugen 1,24 s, Tonart D-Dur.
  - Pan −0,275 / +0,275 / −0,15 / +0,15, Versatz 11 / 19 / 7 / 23 ms.
  - Ein ↶ entfernt alle 4 Stimmen.
- Intervalle (Terz, Quinte, Oktave, Unisono, je auf A3/D4/H3) liegen genau auf Ziel + Streuung (Abweichung 0,0 ct). Knack-Maß Chorstimme 0,96 / 1,17 (wie das Original).
- Formant-Erhalt bei Oktave +, Bänder 300–1000 / 1000–2000 / 2000–3500 Hz relativ:
  - vorher 0 / −4,7 / −14,5 dB
  - nachher 0 / −3,3 / −14,1 dB
  - Ton 0,0 ct

**Effekte**
- Tiefpass 1000 Hz −34,9 dB über 2,5 kHz. Hall per Touch 0,65: Nachklang +80,8 dB. Pan −1: rechts 0.
- Zwei Regler kurz nacheinander während der Wiedergabe: beide übernommen.

**Wiedergabe, Matrix, Speichern**
- Erster Block nach ▶: 34 ms.
- Langes Lied mit Hall/Echo/Tiefpass und 4 Chorstimmen mit Hall:
  - je Block (341 ms Audio) 54–173 ms Rechnung
  - Start 180 ms
  - keine Leerlauf-Proben in 6 s
- In die Matrix (Audio) aus einer Ebene mit Effekten: ohne Fehler, Take auf „Original“.
- Seite neu laden (IDB): Mix- und Ebenen-Energie identisch, Kennungen wieder da.

**Quer**
- Menü, Chor- und Effekte-Blatt sind per Wischen im Blatt bis zum letzten Element erreichbar.
- Die Optionszeile im Notenmodus lässt sich wischen; „Fertig“ ist danach sichtbar.

---

## Pflichtprüfungen (auf einer bitgleichen Kopie in spk6p/)

**Statische Prüfungen**
- topdefs: Skripte 26, Namen 7334, doppelt 0, Syntaxfehler 0.
- dupkeys: 0.
- smoke: errors [] (`spk6p/smoke-p1.png`).
- „MS 2000“ 1× (Basis 1×), „  live: true,“ 1×, vwStart 3×.
- Krypto-Währungs-grep 0. Die 9 Treffer „crypto“ sind die Web-Crypto-Schnittstelle und stehen gleich oft in der Basis.

**Markenwörter**
- Je Wort gleich wie die Basis, keines gestiegen.
- In den geänderten Zeilen 0, in spk6-block.js, Tests, NOTES.md, LOG.md und einbau.py 0.

**Regression**
- spk1-test: ALLE OK (18).
- spk3-test gegen basis5: 13 OK / 4 FEHLER. Das sind die bekannten Basis-Fehler mit identischen Werten:
  - Bass 3,01
  - Verfeinern +0,52
  - mehrstimmig 0/28
  - Nachbau 2,13 → 2,13
- spk2-test: 29/30 (= Basis), Layout drei Größen OK, keine Konsolenfehler.
- Chor-Werkzeuge (chr2-test, Kopie in spk6p/chr): 77/82 OK. Die 5 „FEHLER“ sind Vergleiche „Knackser weniger als Basis“ mit identischen Werten (z. B. 0 (1,8 dB) → 0 (1,8 dB)) – keine Abweichung durch SPK6.
