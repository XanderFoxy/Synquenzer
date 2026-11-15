# PRÜFUNG TRP1 „Abschnitt transponieren“ – unabhängig, nichts repariert

Stand 2026-11-15 04:06–04:30. Geprüft wurde `index.html` gegen `basis.html` (4.68.0) und gegen PLAN §5 P1 TRP1 mit den [K]-Marken aus §8.
Gemessen habe ich mit eigenen Sonden per CDP-Touch in 428×926, 926×428 und 926×370. Die Skripte und Rohdaten liegen in `pruef/`:
`pruef-daten.mjs`, `pruef-b.mjs`, `pruef-ui.mjs`, `pruef-ui2.mjs`, `pruef-rest.mjs`, `pruef-video.mjs`, `pruef-rk.mjs` sowie `*.json`.
Die Fotos liegen in `pruef/fotos/`.

**Ergebnis:** Der Kern stimmt im Normalfall: Song mit lückenlosen Teilen, ↷, Video-Ton, MIDI und Speichern. Die Bedienung erfüllt
44 px, „im Bild“ und 3 Tipps. Die Leistung ist gut.

Es gibt **2 schwere** und **5 mittlere** Befunde. Alle liegen im Zusammenspiel mit vorhandenen Funktionen: Song ohne Marken,
Zusammenfassen, ↶ während ▶, Dur↔Moll und die Rückungs-Zeile. Der Bauer-Test deckt keinen davon ab.
Ich empfehle, vor der Auslieferung mindestens Befund 1 und 2 zu beheben.

## Schwer

1. **Song ohne Marken oder Takte ohne Marke: Die ⇅-feste MELODIE klingt falsch zum Rest.** Laut Spezifikation gilt „alles außer
   Drums, auch ⇅ fest“.
   - *Song ganz ohne Marken:* Bereich-Leiste › Takt 5–6 › +3.
     - Im MIDI sind **59 von 59** Tönen der anderen Spuren um +3 verschoben.
     - Die MELODIE (⇅ fest) ist **0 von 4** verschoben und bleibt 3 Halbtöne daneben.
     - Die Meldung sagt trotzdem „· alles außer Drums“.
     - Live mit ● SONG aufgenommene Songs beginnen ohne Marken (`songEmptyV4`: `marks: []`). Der Fall ist also häufig.
   - *Lücke nach dem Teil:* Teil 3 „nur +3“, danach folgen Takt 7–8 ohne Marke.
     - In der Lücke ist die MELODIE **4 von 4** um +3 verschoben.
     - Die übrigen **27 von 27** Noten sind unverändert.
   - Ursache: `trp1Lv` versetzt den Stand nur an vorhandenen Marken (`mark.rk`/`rkx`). In Takten ohne Marke gilt der Stand der
     Marke davor, ohne Marke bleibt er bei 0. Der Bauer führt die Lücke unter „Offen“ nur als „rückt mit“. Tatsächlich sind es
     falsche Töne.

2. **Zusammenfassen oder Konsolidieren eines Teils mit Stufen löscht die Stufen still, der Song klingt danach anders.**
   - Ablauf: Teil 3 +1 Stufe, dann `s2Sum(4,6)` (Zusammenfassen) bzw. `konDo(4,6)` (Konsolidieren / „Als Teil“).
   - Danach ist `trs` an der neuen Marke `null`. Im MIDI ändern sich **59 von 103** (s2Sum) bzw. **59 von 111** (konDo) Noten
     in Teil 3.
   - Die Song-Melodie bleibt in den Daten um eine Stufe verschoben, weil sie beim Setzen umgeschrieben wurde. Die Clips sind es
     nicht mehr. Melodie und Begleitung passen damit nicht mehr zusammen.
   - Zum Vergleich: Ein „nur dieser Teil +3“ in Halbtönen übersteht beides, mit **0 von 375** bzw. **0 von 383** geänderten Noten.
   - JAM3 hat für `rk`/`rkx` dafür `jam3RkKeep` eingehängt. Für `trs` fehlt ein solcher Haken. Beide Wege versprechen „der Inhalt
     bleibt, wie er ist“.

## Mittel

3. **↶ während ▶ SONG mitten im transponierten Teil: Der ganze Rest des Songs bleibt transponiert.**
   - Ablauf: „nur Teil 3 +3“, ▶, dann ↶ bei Schlag 17,2 (Takt 5).
   - Die Daten sind richtig (`song.xp` = `[]`). Gehört wird aber:
     - Takt 6: 27 Stellen bleiben auf +3.
     - Teil 4, der nie verändert wurde: **22 von 26** auf +3, 4 Stellen der ⇅-festen Spur auf 0. Das ergibt ein gemischtes
       Klangbild.
     - Teil 5: 27 Stellen auf +3.
   - Die Ursache liegt im Bestand: `restoreSong` ruft weder `gr1XpLive` noch `jam3FtLive` auf. Mit der vorhandenen Rückung
     (+3, ↶) misst man in Teil 4 dasselbe (**22 von 26**).
   - Bei „nur dieser Teil“ trifft es aber gerade die Teile, die man nie angefasst hat.
   - Was funktioniert:
     - ↷ während ▶: Teil 3 58 von 58 auf +3, Teil 4 26 von 26 auf 0.
     - ↶ und ↷ bei Stufen während ▶: gleich der Referenz.
     - Setzen während ▶ in Takt 5,3: ab dem nächsten Takt richtig.

4. **Dur↔Moll nach einem Stufen-Teil ergibt leiterfremde Töne.**
   - Nach `tktModeDo` (C-Dur → c-Moll) bleibt `trs` = `[1, 0, "ionian"]`.
   - Teil 3 hat danach **16 von 91** Tönen außerhalb von c-Moll (A = 45/69). Teil 1 mit derselben Szene hat 0.
   - Die Stufen merken sich die Tonart beim Setzen und folgen keiner späteren Tonart-Änderung.

5. **„nur dieser Teil“ bleibt für alle Marken an, auch nach dem Guide, und ändert still die vorhandene Rückungs-Zeile.**
   - Ablauf: einmal „nur dieser Teil“ tippen, Blatt schließen, die Marke von Teil 5 öffnen (Teil 5 hat Rückung +2).
   - Die 5 Tasten sind weiter `data-trv`, also im Modus „nur“.
   - Die vorhandene Rückung +2 ist **nicht mehr markiert**, weil keine Taste `on` ist.
   - Die Beschriftung lautet „nur Teil“ statt „jetzt/ab hier“.
   - Ein Tipp auf +1 wirkt dann als „nur“ (Ergebnis `xp [[32,3]]`).
   - Der Guide-Eintrag schaltet `TRP1.only = true` dauerhaft. Auch eine später normal geöffnete Marke steht danach auf „nur Teil“.
   - Der Bauer-Test setzt den Zustand selbst mit `opts({only:false})` zurück.
   - Folge: Xanders gewohnte Rückung −2 … +2 macht ohne Hinweis etwas anderes.

6. **Nach „nur Teil 3 +3“ zeigt Teil 4 „−3“. Der naheliegende Tipp zerstört dann das Ergebnis.**
   - Die Taktleiste zeigt: Teil 3 „+3“, Teil 4 **„−3“**. Das Marken-Blatt von Teil 4 sagt „jetzt −3“, keine Taste ist markiert.
   - Tippt man bei Teil 4 auf „0“, um das −3 wegzumachen, gilt `xp [[16,3]]`. Ab Teil 3 ist dann der ganze Song +3, das „nur“ ist
     weg.
   - Tippt man bei Teil 4 auf „+1“, liegt Teil 4 bei **+4** absolut.
   - Der Bauer nennt die Anzeige unter „Offen“. Die Falle durch die Bedienung erwähnt er nicht.

7. **Das Blatt „Transponieren“ springt beim ersten Umschalten.**
   - Es öffnet zentriert und wird nach dem ersten Tipp (z. B. „in der Tonart“) unten angedockt:
     - hochkant: von `[14, 255, 414, 671]` auf `[8, 511, 436, 918]`. Die Tasten rutschen um **256 px** unter dem Finger weg.
     - quer: von `[53, 113, 873, 316]` auf `[8, 226, 934, 420]`, also 113 px nach unten.
   - Ein schneller zweiter Tipp kann eine andere Taste treffen.
   - Angedockt ist das Blatt 8 px breiter als das Bild (rechts 436 > 428). Das ✕ liegt bei 394–434 px und damit 6 px außerhalb.
     Der 8-px-Überstand ist wie bei den gedockten Blättern der Basis, der Sprung ist neu.

## Leicht

8. **Stufen über einen Bereich mit halben Teilen werden still nur teilweise ausgeführt.**
   - Ablauf: Bereich Takt 4–7, +1 Stufe.
   - Nur Teil 3 bekommt die Stufe (`trs` = `[0, 0, 1, 0, 0]`). Takt 4 und 7 bleiben unverändert.
   - Die Meldung lautet trotzdem „Nur Takt 4–7 +1 Stufe in C-Dur – danach wie vorher“.

9. **„in der Tonart“ bleibt gemerkt. Die Ablehnung klingt dann wie ein Erfolg.**
   - Ablauf: Bereich-Leiste › Takt 4–5 über die Teil-Grenze. Das Blatt öffnet mit „in der Tonart“ vorgewählt.
   - Ein Tipp auf +1 bewirkt nichts (`xp` unverändert, Blatt bleibt offen).
   - Die Meldung lautet: „In der Tonart geht für ganze Teile – hier in Halbtönen“. Das liest sich wie „wurde in Halbtönen gemacht“.

10. **Leiterfremde Töne fallen beim Stufen-Schritt zusammen.**
    - C-Dur +1: D♯ → F **und** E → F (beide 65), A♯ → C **und** H → C (beide 72).
    - Chromatische Durchgangstöne und Akkordtöne verschmelzen dabei zu einer Note.
    - Der Plan regelt das nicht. Musikalisch geht Information verloren, deshalb gehört es in die NOTES.

11. **Texte**
    - „Halbtone“ statt „Halbtöne“ in drei neuen Stellen, Meldung und aria-label, z. B. „Nur Szene 1 +3 Halbtone – danach wie
      vorher“. Derselbe Fehler steht zweimal schon in der Basis (JAM2).
    - „danach wie vorher“ erscheint auch beim letzten Teil, nach dem nichts mehr kommt.
    - Blattkopf und Meldung nennen nur den Teil-Namen, z. B. „Transponieren · Szene 1“. Im Testsong heißen Teil 1, 3 und 5 so;
      die Takt-Angabe fehlt.

12. **Ort des Codes.** Die allgemeine Abnahme sagt „neuer Code nur in nachgeladenen Teilen“. Der Block liegt aber im Hauptskript.
    - Die Größe wächst um +20,6 KB (+0,23 %), das liegt innerhalb ±1 %.
    - So machen es auch JAM2, JAM3, MTX3 und SPK11. Das ist ein Hinweis, kein Fehler.

## Ohne Befund geprüft (Messwerte)

- **Pflicht:**
  - topdefs: 26 Skripte, 7588 Namen, 0 doppelt, 0 Syntaxfehler.
  - dupkeys: 0. smoke: `errors []`.
  - „MS 2000“ 1×, „^  live: true,“ 1×, VERSION 4.68.0.
  - diff gegen die Basis: 261 Zeilen neu, 0 entfernt oder geändert. 10 Haken, alle mit typeof-Schutz.
  - Keine Marken- oder Produktnamen im Block, keine Emojis als Grafik.
- **Kern im Normalfall:**
  - Referenz ohne Transponieren: Teil 3 = Teil 1 (58 von 58), Teil 4 = Teil 2 (26 von 26).
  - Mit „nur Teil 3 +3“ und ↷ während ▶: Teil 3 58 von 58 auf +3, Teil 4 26 von 26 auf 0.
- **Video-Ton** (Offline-Render, Protokoll), Bereich Takt 5–6:
  - ohne Änderung 55 von 55 gleich, mit Stufe 55 von 55 richtig, mit +3 55 von 55 richtig.
  - Die Partitur prüft der Bauer-Test.
- **MIDI je Spur / Stems** (`va1MidiSong`) gleich Song-MIDI bei Stufen: 99 von 99 Noten in Teil 3.
- **Container-ZIP und Speichern/Laden:**
  - `projekt.json` enthält `trs` `[1, 0, "ionian"]` an Teil 3.
  - Speichern/Laden ist bit-gleich, das MIDI nach dem Laden identisch.
  - Getestet mit Stufen, „nur“ und Rückung zusammen.
- **Matrix ohne ▶ SONG:** 78 Noten, 0 durch einen Stufen-Teil verändert.
  - Matrix-Gesten und Spektral-Werkzeuge haben keinen TRP1-Haken (grep), also keine Berührung.
  - Die Live-Tastatur geht nicht über `outPitch` und bleibt deshalb unverändert.
- **Bedienung, alle 3 Größen:**
  - Alle neuen Tasten sind ≥ 44 px, liegen im Bild, sind nicht verdeckt (elementFromPoint) und überlappen sich nicht.
  - Das Marken-Blatt öffnet im Reiter Ablauf.
  - Marke › Mehr ▾ › +3 sind 3 Tipps. Das Ergebnis `xp [[16,3],[24,0],[32,2]]` stimmt, die spätere Rückung +2 bleibt.
  - Höhe des Marken-Blatts: hochkant 219 → 267 px (+48); quer und quer-370 unverändert 173 px, weil die Zeile in der
    Rückungs-Zeile liegt.
  - Bei Stufen sind ±8 … ±12 gesperrt (10 Tasten).
  - Quer hat das Blatt „Transponieren“ wie andere UI1-Blätter kein ✕; ein Tipp daneben schließt es, geprüft in 926×428 und
    926×370.
- **Leistung:**
  - Blatt öffnen und tippen: kein Long Task, Frames höchstens 17 ms.
  - Während ▶ mit Stufen-Teil, offenem Blatt und 4× Umschalten: 267 Frames, höchstens 17 ms, 0 über 20 ms, 0 Long Tasks.
  - `trp1P`: 0,19 µs je Aufruf. Song-MIDI: 0,87 → 1,18 ms mit Stufen.
  - `trp1Set` auf 64 Takten mit 32 Teilen: 0,5 ms (Halbtöne), 0,9 ms (Stufen).
  - Der einzige Long Task (111 ms) kommt beim ersten ▶ nach dem Laden; die Basis zeigt dort 147 ms.

## Offen laut Bauer (bestätigt, nicht neu bewertet)

- Die Funk-Ankündigung fehlt. Sichtbar neu sind die Zeile „Wirkt …“ hochkant (+48 px) und der Eintrag im ⋯ der Bereich-Leiste.
- Die Song-Aufnahme über einem Stufen-Teil und das Neu-Stimmen gehaltener Noten an der Teil-Grenze sind nicht gemessen.
