# SYNQUENZER v3 — Nachtrag 4: Gesang lang, Melodieerkennung an/aus, Stimme im Mix (Xander 27.10. mittags)

Status: **gilt für den Bau.** Grundlage ist App 4.23.0 (`synq-snapshots/G-MK8b-merge.html`). Beide Pakete werden parallel in
Zweig-Kopien gebaut und danach zusammengeführt: **gemeinsame Version 4.24.0** (`APP_CODE` 4 024 000). Format bleibt 5, nur additive
Felder. Kein Supabase-Aufruf (der Wächter wird von Xander per SQL erhöht).

## Auftrag (wörtlich)

> „Mir ist aufgefallen, dass die Aufnahme ein bisschen zu kurz ist. Das sind, glaube ich, nur 4 Takte, die man machen kann. Ich brauche
> mindestens 16 Takte. Und kann man das irgendwie so umschalten, dass die Melodieerkennung von dem Mikrofon nicht immer mit aufnimmt,
> wenn man Vocals aufnehmen möchte? Und dann ist noch eine Sache, sie sind im Kontext zu den Synthesizern oder anderen Spuren, die man
> baut, meistens viel zu leise. Kann man da noch irgendwie was machen, dass die Stimme lauter ist oder dass das in besserem Verhältnis
> zueinander funktioniert?“

**Regel 27 gilt** (typische-fehler.md): nur das hier Beschriebene bauen. Keine eigenen Namen, keine Zusatzfunktionen, keine andere
Gestaltung. Was unklar ist oder eine weitere sichtbare Änderung bräuchte: nicht bauen, sondern im Changelog unter „Fragen an Xander“.
Alle anderen Punkte der Fehlerliste gelten ebenfalls (Tasten ≥ 44 × 44, nichts abgeschnitten, kein Layout-Sprung, kein Knacken,
deutsche Texte, kein Markenwort).

---

## Paket VS-L — Gesang mindestens 16 Takte + Schalter „Melodieerkennung“

### L.1 Länge: jede Gesangsaufnahme in einer Szene kann mindestens 16 Takte lang sein

Xander hat am iPhone nur 4 Takte Gesang aufnehmen können. Bekannte Stellen im Code, die auf eine kürzere Länge führen (vom Builder
mit echten Läufen nachzuweisen und zu ergänzen; die Liste ist nicht vollständig):

- `tkVoiceTake`: Overdub auf einen vorhandenen STIMME-Audio-Clip behält dessen Länge (`L = old.len`) → der neue Take wird auf einen
  Durchgang des alten Clips gekürzt (z. B. 4 Takte), auch wenn 16 Takte gesungen wurden.
- `vsRecDone`: über einem vorhandenen MELODIE-Clip gilt dessen Länge.
- Einstellung „Länge“ der Aufnahme (AUTO, 1, 2, 4, 8): eine feste Länge beendet die Aufnahme; 16 gibt es nicht.
- `vsFangDone`/`vsPhrase`: Stimme-FANG nimmt die Phrase bis zur letzten Pause ≥ 1 Takt, Länge als Zweierpotenz ≤ 16.

Ziel:

1. **Jeder Weg, in einer Szene Gesang aufzunehmen**, kann einen Take von **mindestens 16 Takten** ergeben: ● REC mit 🎤 auf einen
   leeren Platz, ● REC mit 🎤 über einem vorhandenen MELODIE-Clip, ● REC mit 🎤 über einem vorhandenen STIMME-Clip (Overdub), bei jedem
   Tempo, das die App erlaubt. Der Ringpuffer (`ST_SEC` = 120 s) muss beim langsamsten erlaubten Tempo 16 Takte + Vorlauf fassen; reicht
   er nicht, wird er gerade so weit vergrößert (Speicher am iPhone im Changelog angeben).
2. **Overdub auf einen STIMME-Clip:** ist die neue Aufnahme länger als der alte Clip, wird der Clip so lang wie die neue Aufnahme
   (ganze Takte, höchstens 16 – die Grenze aller Szene-Clips); der neue Take ist die ganze Aufnahme, der alte geht wie heute stumm in
   `alt`. Ist sie nicht länger, bleibt alles wie heute (jüngster voller Durchgang).
3. **„Länge“ bekommt zusätzlich 16** (AUTO, 1, 2, 4, 8, 16) an beiden Stellen (Aufnahme-Optionen und Einstellungen); die
   Normalisierung (`recLength`) nimmt 16 an. Bei AUTO läuft die Aufnahme wie heute bis ● (spätestens 16 Takte).
4. **Stimme-FANG** behält seine Phrasen-Regel (von Xander als „relativ sauber“ abgenommen); eine 16-Takt-Phrase ohne Pause ≥ 1 Takt
   ergibt MELODIE-Clip und STIMME-Take mit 16 Takten (Rückblick reicht 16 Takte).
5. **● SONG mit 🎤** (Punch): 16 Takte und mehr ohne Kürzung (bis zur Ringpuffer-Grenze; die Grenze in Sekunden im Changelog nennen).
6. Ein 16-Takt-STIMME-Clip zeigt die Wellenform über die ganze Länge und läuft phasengleich in Schleife.

### L.2 Schalter „Melodieerkennung“ (An | Aus)

- **Ort:** Mikro-Blatt, Abschnitt „Stimme → Noten“, eine Zeile **„Melodieerkennung“** mit zwei Knöpfen **[An] [Aus]** (≥ 44 × 44 in
  allen Formaten, das Blatt passt weiter ganz ins Bild). **Standard: An** (das heutige Verhalten, Zeichen für Zeichen gleich).
- Gespeichert wie Quelle/Einrasten im Geräteprofil (`stProf().vs`, neues Feld), **nicht im Projekt**.
- **Aus:** ● REC mit 🎤, Stimme-FANG und ● SONG mit 🎤 nehmen **nur Gesang** auf: STIMME-Take und STIMME-Clip (bzw. `song.vox`) wie
  heute, **kein MELODIE-Clip, keine Noten, kein Ergebnis-Blatt**; die Offline-Tonhöhen-Auswertung für diese Aufnahme läuft nicht (spart
  Rechenzeit). Statt „Kein Gesang erkannt“ kommt die kurze Meldung „Gesang aufgenommen · n Takte“. Ein Undo-Schritt wie heute.
- Stimme-FANG bei Aus: der STIMME-Take umfasst den gesungenen Abschnitt nach derselben Pausen-Regel (Pause ≥ 1 Takt, höchstens
  16 Takte), bestimmt aus dem Pegel der Stimme statt aus Noten.
- Bei Aus steht unter der Zeile ein kurzer Satz: „Aufnahme nur als Gesang auf der STIMME-Spur – keine Noten.“
- Zeigt ein Aufnahme-Banner MELODIE als Ziel, nennt es bei Aus die STIMME-Spur.

### VS-L Abnahme (alle mit echter Mikro-Attrappe bzw. Fake-Mikro und gemessenem Audio)

- [ ] **VS-L-01** 120 BPM, leerer Platz, ● REC mit 🎤, 16 Takte singen, ● → STIMME-Clip 16 Takte, Take hörbar in Takt 1 und Takt 16;
      Melodieerkennung An: MELODIE-Clip mit Noten in Takt 1–16.
- [ ] **VS-L-02** Overdub: 4-Takt-STIMME-Clip, neue Aufnahme 16 Takte → Clip 16 Takte, neuer Take oben, alter in `alt`; neue Aufnahme
      3 Takte → Verhalten wie 4.23.0 (deep-equal zum alten Ergebnis).
- [ ] **VS-L-03** ● REC mit 🎤 über einem vorhandenen 4-Takt-MELODIE-Clip (Demo-Szene) → STIMME-Take 16 Takte.
- [ ] **VS-L-04** Länge 16 → Aufnahme endet nach genau 16 Takten; Speichern/Laden behält 16; die Auswahl passt in P1, P2, P3, L1, L2,
      926 × 428, Knöpfe ≥ 44 px.
- [ ] **VS-L-05** Langsamstes erlaubtes Tempo: 16 Takte + Vorlauf liegen ganz im Ringpuffer (kein späterer Anfang, `late` = 0).
- [ ] **VS-L-06** Stimme-FANG, 16-Takt-Phrase ohne Pause ≥ 1 Takt → MELODIE-Clip und STIMME-Take je 16 Takte.
- [ ] **VS-L-07** ● SONG mit 🎤 über 16 Takte → `song.vox` 16 Takte, hörbar bis zum Ende.
- [ ] **VS-L-08** Melodieerkennung Aus: ● REC, Stimme-FANG und ● SONG ergeben nur STIMME-Takes; MELODIE-Spur deep-equal unverändert;
      Zähler der Offline-Auswertung bleibt 0; Meldung „Gesang aufgenommen · n Takte“. An: Ergebnisse deep-equal zu 4.23.0.
- [ ] **VS-L-09** Schalter bleibt nach Neuladen (Gerät), steht nicht im Projekt (Projekt-JSON deep-equal); Claude-App unverändert.
- [ ] **VS-L-10** M-PLATZ: Mikro-Blatt mit der neuen Zeile in P1, P2, P3, L1, L2, 926 × 428: nichts abgeschnitten, ≥ 44 × 44, kein
      Layout-Sprung.
- [ ] **VS-L-11** Undo/Redo: jeder neue Weg genau ein Schritt, danach deep-equal.

---

## Paket VS-P — Stimme im Mix (nicht mehr viel zu leise)

1. **Erst messen, dann ändern:** Pegel über den ganzen Weg Mikro (ohne Pegel-Automatik) → Ringpuffer → Take-PCM → Säubern (VS4) →
   `tkStartSrc` → Kette der STIMME-Spur (Pegel-Standard, Pan, Sends) → Master, verglichen mit den Synth-Spuren (Demo-Projekt;
   MS-2000-Programme sind je Programm auf −18 LUFS kalibriert). Die Zahlen kommen in den Changelog. Ein Pegelverlust unterwegs
   (Absenkung, zu leiser Standard, Säubern senkt den Pegel) wird zuerst an der Ursache behoben.
2. **Auto-Pegel je Take:** Lautheit des stimmhaften Teils messen (ITU-R BS.1770, K-Filter, Gate; auf der Fassung, die klingt, also nach
   Säubern) und den Take mit dem Ausgleich abspielen, der **−16 LUFS** ergibt (2 dB über einem einzelnen kalibrierten Synth-Programm).
   Ausgleich −12 … +24 dB. Gilt auch für vorhandene Takes (gemessen, sobald ihr Audio geladen ist). Der Wert wird aus dem Audio
   berechnet (auf jedem Gerät gleich) und **nicht** ins Projekt geschrieben; WAV/ZIP-Export bleibt der Roh-Take (bitgleich, N7V-20).
3. **Spitzen-Schutz:** ein unauffälliger Begrenzer nur auf der STIMME-Spur: wahre Spitze am Ausgang der STIMME-Spur ≤ −1 dBTP auch bei
   einem Take mit Spitzen bei 0 dBFS nach dem Ausgleich; bei natürlichem Gesang ≤ 3 dB Pegelminderung in 95 % der stimmhaften Frames
   (kein Pumpen); keine hörbare Verschiebung gegen die anderen Spuren; kein Knacken.
4. Der Pegel-Regler und Mute der STIMME-Spur wirken wie bisher zusätzlich (relativ). Gilt für Szene-Clips und `song.vox`.
5. **Kein neuer Regler, kein neuer Knopf** (Regel 27). Hält der Builder einen Schalter für nötig (z. B. Auto-Pegel aus), steht das
   nur unter „Fragen an Xander“.
6. Leistung: ohne STIMME-Spur kein zusätzlicher Knoten; Messung eines 16-Takt-Takes ohne langen Task (> 50 ms) im Hauptfaden
   (sonst im Worker); CPU bei 3 min Wiedergabe höchstens +2 %.

### VS-P Abnahme

- [ ] **VS-P-01** Drei Takes mit Mikro-Pegel −36, −28 und −20 dBFS RMS (natürlicher gesungener Vokal) → Lautheit am Ausgang der
      STIMME-Spur je −16 ± 1,5 LUFS.
- [ ] **VS-P-02** Demo-Projekt mit Gesangs-Take, alle Regler auf Standard: die Stimme liegt höchstens 3 LU unter und höchstens 3 LU
      über der lautesten Synth-Spur (Messung je Spur, Changelog).
- [ ] **VS-P-03** Take mit Spitzen bei 0 dBFS → wahre Spitze am STIMME-Ausgang ≤ −1 dBTP; natürlicher Gesang: Pegelminderung wie Punkt 3.
- [ ] **VS-P-04** Ein mit 4.23.0 aufgenommener Take spielt nach dem Laden mit dem Ausgleich; WAV-Export bitgleich zum Roh-Take; Projekt
      ohne Takes Zeichen für Zeichen gleich.
- [ ] **VS-P-05** Kein Knacken bei Schleife, Take-Wechsel, A/B, Säubern-Änderung, Stopp (FP-DSP wie VS3).
- [ ] **VS-P-06** Kein langer Task > 50 ms beim Fertigwerden/Laden eines Takes; CPU 3 min Wiedergabe ≤ +2 %.

---

## Zusammenführen

VS-L ändert die Aufnahme-Wege (`tkVoiceTake`, `vsRecDone`, `vsFangDone`, `recLength`, Mikro-Blatt), VS-P die Wiedergabe-Kette
(`tkStartSrc`, Kette der STIMME-Spur, Messung beim Fertigwerden des Takes). Jeder Zweig hält sich aus den Funktionen des anderen heraus,
wo es geht (Ein-Zeilen-Haken), damit der Zusammenbau sauber bleibt. Beide setzen `VERSION` 4.24.0.
