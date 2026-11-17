# NST1 LOG

- 21:54 Start NST1; basis.html aus rel-4780 kopiert (68e92c03). Code gelesen: I2b-Weg (LKT, lkNoteX, E.on-Paare, lkStart/lkLegato im
  Worklet), spawnVoice, cancelTrackFrom, startTransport/stop (runId), normalizeSound, Sound-Undo (soundSnapshot/commitSound), AK1,
  Picker (pickerOpen), ⋯-Menü (openEdMore), Guide (ui1Entries), Muster-Vorbilder (Arp, MK6-SEQ).
- 22:05 Entscheidung: Schritt beim Note-an im Haupt-Faden (ein Haken in spawnVoice, vor allen Engine-Abzweigen), Werte als Je-Stimme-Paare
  über den I2b-Weg; Worklet nur, falls Legato knackt. Rücknahme in cancelTrackFrom, Rückstellen über runId / Clip-Start / Kontext.
- 22:10 Block nst1-block.js + apply.py (6 Haken) geschrieben; topdefs 0/0, dupkeys 0, smoke [] .
- 22:12 Erkundung: Analog Intervall 0/4/8/12 HT gemessen. Klick-Messung Dreieck↔Sinus: POLY 0,87, MONO/LEGATO 17,7 → Worklet-Teil nötig.
- 22:16 NST1W (n1Hold in monoOn, n1Blk im Steuer-Block, 96+96 Samples Dip) eingebaut.
- 22:20 Messungen auffällig gut (auch FM/mk „ohne Wirkung“) → Ursache: Worklet lud nicht mehr (SynthHost failed), alle Tests liefen nativ.
- 22:22 Fund: Worklet-Quelltext muss ASCII sein (der NST1W-Kommentar hatte Umlaute; data:-Laden nutzt btoa). Kommentar auf ASCII,
  Worklet „ready“. Messungen neu über den Worklet: MONO/LEGATO 1,0 (statt 17,7); mk Osz 2 0/4/8/12; FM OP1 ×1…×4 = 0/12/19/24 HT; WT nativ.
- 22:24 Bedien-Blatt angesehen (Fotos): Schnellwahl schien „aus“ → AK1: setP (Begleit-Änderungen der Schnellwahl) legt die ◆-Arbeits-
  kopie an, das Feld landete auf dem alten Objekt. nst1Edit setzt das Feld jetzt nach den Änderungen auf tr.sound und auf den Grundklang.
  Zustand je Spur über Einstellungs-Schlüssel (Kopien zählen weiter). Ziel-Zeile als umbrechende Chips, Schnellwahl-Knöpfe untereinander.
- 22:26 Arten-Vergleich über Kennung (nst1Same), Zusammenfassung bei gemischten Zielen, Treppen-Bild nach oben.
- 22:28 nst1-test.mjs geschrieben, Lauf 1.
- 22:30 Lauf 1: 64/68 (3 Testfehler: fehlendes v gegen, Log-Reset, ↶-Liste nach Laden; 1 echter: Ping-Pong-Start – Note 1 setzt jetzt alle Bahnen). Behoben → 68/68.
- 22:33 Hörbeispiele (App-Render → MP3): 1-sendersuche, 2-gegenlaeufig-2-osz, 3-spreizen-3-saegen, 4-zufall-wellen (je 8,6 s, −1,5 dBFS Spitze).
- 22:34 golden.mjs basis gegen index: bitgleich (12 Werksklänge, Worklet). Test um F5 MIDI + F6 Engine mk ergänzt → 70/70.
- 22:37 Beschriftung „Welche“ (statt „Wer“); Pflicht: topdefs 0/0, dupkeys 0, smoke [], MS 2000 1×, live: true 1×, VERSION 4.78.0. Endlauf nst1-test.
- 22:39 Endlauf nst1-test 70/70 (test-ergebnis.txt, index 05057d56). NOTES.md fertig (Funk-Entwurf, Grenzen, Phase 2).
- 23:30 NST1-P (Prüfung): Sicherung index.vor-pruef.html (05057d56), apply.py baut sie bitgleich nach. Befunde nachgeprüft:
  (1) Akkordfenster 35 ms auch für geplante Noten – bestätigt (Prüfer-Probe: 1/32 bei 240 BPM k = 0,0,1,1 …); (2) Beschriftungen laufen
  über – bestätigt und schlimmer als gemeldet: auch 414 und 428 px (Hoch-Runter 64 > 61 px), dazu Toast über den Zeilen;
  (3) Sendersuche – gemessen 2,3 HT Gleiten, Rauschen fast nur Saw-Obertöne; (4) aus probe-ziel: Engine mk Ziel-Wechsel Intervall →
  Anteil legte 3 Bahnen an (alle Wege des Timbres) – echter Fehler.
- 23:45 Behoben im Block: nst1Chord/nst1Held (≤ 2 ms immer Akkord, sonst ≤ 35 ms nach dem letzten Akkordton nur solange dieser gehalten
  wird, Fenster ≤ 100 ms), grpT in Zustand/Rücknahme; nst1Who/nst1Keep (Ziel-Wechsel nach Oszillator); CSS: Umbruch + Sperrung 0, ≤ 400 px
  Beschriftung über der Zeile; Schnellwahl-Hinweis als Zeile mit ↶ im Blatt (Toast nur bei geschlossenem Blatt); nst1Radio (Osz 2 Sinus
  wenn stumm, Hüllk. 2 → Osz-2-Tonhöhe 0,4 + → Rauschen 1,0, Hüllk. 2 nur wenn frei). Messung: Gleiten 6,7 HT, Rausch-Stoß sichtbar.
- 23:50 Tests B8/B9/S/G8 ergänzt (nst1-test.mjs), Lauf 1.
- 23:52 Lauf 1 93/94 (S2 hinter 2,6-kHz-Filter) → Rauschen rosa, wenn der Klang keins hatte → Lauf 2 94/94. Pflicht grün, golden bitgleich
  (Kontrolle Basis/Basis unter Last abweichend), Hörbeispiele 1–4 neu + 5 (Filter offen), Fotos, KURZ.md, NOTES „Prüfung“.
