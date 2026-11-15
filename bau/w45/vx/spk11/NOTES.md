# SPK11 – Spektral-Seite → Szenen · NOTES

Paket: `index.html` = 4.66.0 + SPK11 (basis.html daneben unverändert). Ein Block `/* SPK11-BEGIN */ … /* SPK11-END */` direkt nach
`/* SPK6-END */`, zwei Ein-Zeilen-Haken mit typeof-Schutz:
- `spk1ViewDd` (nach der SPK5-Zeile „Farbstufen“): `spk11ViewRow(U, dd)` → Ansicht ▾ › Abschnitt „Szenen“ › [Szenen anlegen …]
- `spk1MoreDd` (nach `dd.appendChild(del);`): `spk11MoreDd(U, dd, lid)` → Ebenen-Menü ⋯ › Werkstatt › [Klang nachbauen]
Nicht angefasst: imp1Core / IMP1-Block (IMP2B), Kern der Spektral-Seite (kein neuer Worker-Op), SPK1–SPK10.
Hülle im Block (keine Zeile außerhalb): `spk2KlRun` merkt das Nachbau-Ergebnis je Dokument + Ebene (SPK11.kl).

## Bedienweg
Spektral-Seite → Ansicht ▾ → „Szenen anlegen …“ → Klappfenster (Stil wie „Klang nachbauen“/„Loop → Matrix“):
1. „Erkenne Songteile … nn %“ (Dokument-Audio Original, ohne Spektrum-Umweg, 20-s-Stücke → imp1Analyse im Import-Worker; Tempo des
   Dokuments als Vorgabe, wenn es aus der Erkennung beim Öffnen stammt oder gestellt wurde). Ergebnis je Dokument/Raster gemerkt.
2. Kopf: „4 Teile · 120 BPM · 4/4 [· nur die Auswahl a–b s]“, farbiger Teile-Streifen (Farben wie IMP1), Liste „Strophe 1 · Takt 1–8 → Szene 1“.
3. „Ebenen → Spuren“: je Ebene Name + Notenzahl, Wahl [Beides │ Audio │ MIDI │ Aus] (44 px), Zeile „Audio → … · MIDI → … · Nachbau-Klang“.
4. [N Szenen anlegen] → (falls nötig Noten finden je Ebene, eigener ↶ der Seite) → Audio je Ebene rechnen (Fortschritt in der Statuszeile)
   → ein App-↶ „Szenen aus der Spektral-Seite“ (imp1Step = ganzer Stand). Toast mit „↶ Rückgängig“.

## Entscheidungen
- **Teile**: IMP1-Erkennung wiederverwendet (imp1Analyse, Worker). IMP1 fasst „Y folgt immer auf X“ zu EINEM Teil zusammen (für den Import
  richtig: Strophe+Refrain = ein Durchgang). Für Szenen zu grob (S8 R8 S8 R8 → 2 Teile à 16). Daher `spk11Seg`: dieselben 4-Takt-Block-Etiketten
  (`diag.bloecke`) und dieselbe Namensregel (oft + laut = Refrain, dann Strophe, Teil A…, Intro/Outro/Bridge), aber zusammengefasst wird nur
  bei zwei EINZELNEN Blöcken (4+4 = eine 8-Takt-Phrase). Ohne Blöcke → IMP1-Teile. Teile hängen an der Zeit und werden auf das Raster des
  Dokuments (Lineal) gelegt; Vorlauf vor der „1“ = negativer Takt (Audio davor wird Stille, wie Loop → Matrix). > 64 Takte → geteilt.
- **Auswahl begrenzt automatisch**: Zeit = Spanne der Auswahl (Teile darauf zugeschnitten, nur Teile darin); Audio = op `block` mit `sel`
  (nur die Frequenzen der Auswahl, wie ▶ Auswahl); Noten = Anfang + Grundton in einer Form der Auswahl (zeit/freq/rect/pinsel/harm);
  vorgewählt nur Ebenen mit Noten darin (+ die gewählte Ebene). Wahl je Ebene wird je Dokument und „mit/ohne Auswahl“ gemerkt (Sitzung).
- **Szenen**: nur ganz leere Szenen (keine Spur belegt), der Reihe nach; Name der Szene = Teil. Zu wenige frei → das Blatt sagt vorher,
  wie viele Teile nicht passen.
- **Spuren (8 Spuren / 8 Szenen)**: MIDI zuerst auf vorhandene Spuren mit passender Rolle (sx11Role: Bass → Bass-Spur, Pads → Fläche,
  Gesang → Melodie, Lead → Lead/Phrase, Drums → Drum-Spur), dann Audio-Spuren (neu; sonst leere Zusatzspur; zuletzt eine ganz leere Grundspur,
  im Blatt „(wird Audio-Spur)“), dann neue MIDI-Spuren. Audio-Spur = Spur „Original“-Art (track.orig, Take-Wiedergabe), Name der Ebene,
  ein Take je Ebene (erster bis letzter Teil), Clips = Ausschnitte (imp1Clip). Rest standardmäßig „Aus“.
- **Instrument**: leere oder neue MIDI-Spur → Name der Ebene + Klang = „Klang nachbauen“-Ergebnis der Ebene (spk2KlSnd), sonst – wenn die
  Rolle der Spur nicht passt – Grundklang der Rolle (DEFAULT_SOUNDS wie Loop → Matrix). Spuren mit Inhalt behalten Klang und Namen.
- **MIDI**: wie Loop → Matrix (spk2MxMidi): Noten mit Anfang im Teil, 1/16-Raster, Länge = Teil; Vorschläge erst ab „Sicher ab“.
- **Drums → Kit**: `spk11Hits` auf dem Audio der Drum-Ebene: Hüllkurven tief (< 150 Hz) / Mitte / hoch (> 5 kHz), Anstieg je 1/16
  (−30…+35 ms), normiert am 97-%-Wert je Band. Kick = tief, Tiefen ≥ ½ Mitten, Abklingen nach 100 ms < 0,6; Snare = Mitten ≥ 1,9× Tiefen
  oder lautester Höhen-Einsatz; sonst Hi-Hat (zu). Töne = DRUM_BY_ID kick/snare/hatC (GM 36/38/42).
- **Klang nachbauen im Ebenen-Menü**: beste Note der Ebene (spk2KlPick); hat die Ebene keine Noten → erst „Noten finden“ (spk6NeedNotes);
  dann dasselbe Klappfenster wie über die Note. Drums: kein Eintrag (keine Tonhöhe).
- Speichern/Laden/ZIP: alles liegt im Projekt (Spuren, Clips, Takes mit `imp`-Raster, Szenen-Namen); `spk1Link` verweist auf die Analyse
  (Container nimmt sie mit). Nichts Neues im Dateiformat.

## Offen
- Drum-Kit-Erkennung in der getrennten Drum-Ebene (Zerlegen schnell): Kick an allen echten Stellen (63/64), aber 26 Zusatz-Kicks aus
  Bass-Resten; Snare 42/64 an der richtigen Stelle (Mitten der Snare landen beim Zerlegen teils in anderen Ebenen). Test bleibt streng (FEHLER).
  Nächster Schritt: Kick/Snare-Vorlagen aus dem Lied selbst lernen (Häufungen der Band-Merkmale) statt fester Verhältnisse.
- Das Nachbau-Ergebnis je Ebene gilt für die Sitzung (nicht im Dokument gespeichert).
- Kein Song-Ablauf (song.lanes) – nur Szenen in der Matrix (der Import „In Szenen“ legt ihn an; hier bewusst nicht, damit ein vorhandener
  Song bleibt). Vorschlag für den Funk: optional „auch als Song-Ablauf“.

## Prüfung 1 – Nachbesserung (Befunde aus PRUEFUNG.md)
Alles im SPK11-Block; Haken unverändert (2 Ein-Zeiler). Neue Entscheidungen:
- **Vorwahl (B1)**: ohne und mit Auswahl alle Ebenen vorgewählt (Rest „Aus“); mit Auswahl und gewählter Ebene (nicht Rest/Original) nur
  diese. Ob eine Ebene im Bereich etwas hat, entscheidet das Anlegen selbst: Pegel je Teil aus dem (mit Auswahl gefilterten) Audio der Ebene –
  still = −26 dB unter dem lautesten Teil der Ebene, −30 dB unter der lautesten Ebene im Teil oder unter −54 dBFS → kein Clip (Audio und MIDI).
  Toast nennt Ebenen ohne Inhalt („nichts in Lead“). Zeilentext: „Noten werden beim Anlegen gesucht“ nur bei MIDI; sonst „noch keine Noten“.
- **Vorgabe je Ebene (B10)**: Drums und Bass „Beides“, Flächen/Lead/Gesang/Original „Audio“ (ihre Noten sind für Clips zu unsicher);
  MIDI bleibt wählbar. Spart nebenbei MIDI-Spuren.
- **Notensuche je Teil (B2)**: gesucht wird für jede zusammenhängende Strecke von (nicht stillen) Teilen ohne Noten – auch wenn die Ebene
  anderswo schon Noten hat. Je Strecke ein „Noten finden“-Schritt der Seite (wie bisher eigener Seiten-↶).
- **Tempo (B3, B4)**: Projekt-Tempo wie der Import (nx1ImpTarget/imp1Prep: leer oder ohne Audio → gerundetes Dokument-Tempo, sonst bleibt es).
  Weicht es vom Dokument ab (97,3 → 97, oder bestehendes Audio-Projekt), wird das Audio jeder Ebene mit derselben Dehnung wie der Import
  (nx1ImpStretch, Anschläge auf dem Raster) ans Projekt-Tempo gebracht; Take-Raster = Projekt-Tempo, Clip-Grenzen in Projekt-Takten.
  Blatt sagt vorher „Projekt-Tempo 112 → 100 BPM“ / „Audio wird von 97,3 auf 97 BPM angepasst“, Toast danach dasselbe. Dehnen
  unmöglich (kein Worker, Faktor außerhalb 0,5–2) → wie vorher, Hinweis „Audio im eigenen Tempo“.
- **Vor-/Nachlauf (B5)**: eigener Auftakt-Takt erst ab ½ Takt Vorlauf (sonst beginnt das Intro auf der „1“, der Vorlauf entfällt in der
  Szene); Ausklang nach dem letzten ganzen Takt zählt erst ab 0,6 Takt. Anzeige „Auftakt + Takt 1–4“ statt „Takt 0–4“.
- **Spuren (B8, B12)**: keine Grundspur (1–6) wird mehr zur Audio-Spur umgebaut; Audio nur auf neuen oder leeren Zusatzspuren (zuerst
  Ebenen ohne MIDI). Hat die Ebene auch eine MIDI-Spur, heißt die Audio-Spur „<Ebene> Audio“. Ohne Audio-Erlaubnis keine Audio-Ziele,
  Blatt-Hinweis „Audio-Clips nur auf der eigenen Seite – hier nur Noten“; stille Ebenen bekommen keine (leere) Audio-Spur.
  Blatt: „keine Spur frei (höchstens 8 Spuren)“.
- **Drums (B9)**: Hi-Hat unter der Snare, wenn das Hi-Hat-Muster links und rechts (Achtel oder Sechzehntel) weiterläuft; mit
  Frequenz-Auswahl liefern Bänder außerhalb keine Schläge (< 250 Hz → keine Hi-Hat/Snare-Höhen-Regel, > 200 Hz → kein Kick).
- **Seiten-↶ (B7)**: Text korrigiert – Statuszeile „Angelegt: 1 Intro · 2 Strophe 1 … – zurück mit ↶ in der Matrix oder im Hinweis“,
  Blatt „Ein ↶ (Matrix oder Hinweis) nimmt alles zurück“. Das Seiten-↶ bleibt für die Seite (eigener Stapel im Worker).
- **Texte (B14)**: „1 Teil“, BPM mit Komma.

### Nicht gebaut (Vorschlag für den Funk, sichtbare Änderung der Grund-App)
- **B6 Szenen-Namen im Matrix-Kopf**: Der Kopf zeigt Nummer + Tonart (Grund-App, auch beim Import „In Szenen“). Vorschlag: Name klein
  unter der Nummer, wenn die Szene einen eigenen Namen hat. Bis dahin: Namen in Statuszeile der Seite und im Szenen-Blatt (Halten).
- **B13 Quer-Erreichbarkeit**: „Szenen anlegen …“ ganz oben im Ansicht-Menü bzw. „Klang nachbauen“ vor „Kopieren“ würde die vorhandene
  Reihenfolge ändern – Vorschlag für den Funk.
- **B11** Loop → Matrix (Audio) nimmt die erste Audio-Spur (imp1OrigT, Grund-/IMP1-Code, Stelle von IMP2B) – offen.
- **B15** Speicher: je Audio-Ebene ein Take über die Strecke (jetzt höchstens 2 Audio-Ebenen bei 6 Grundspuren) – offen, nicht gemessen.
- Drum-Kit im Bauer-Lied weiter: Kick 63/64 + 26 Zusatz aus Bass-Resten, Snare in den Strophen schwach (Mitten in anderen Ebenen).
