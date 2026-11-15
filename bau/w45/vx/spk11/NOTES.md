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
