# FOKUS1 – Kern (Worker-Teil) · Erkenntnisse

Stand: index.html = basis.html (rel-4710) + Block `/* FOKUS1-BEGIN */ … /* FOKUS1-END */` (nach SPK12-END) + 3 Haken-Zeilen.
VERSION bleibt '4.71.0'. Diff gegen basis.html: nur Einfügungen (4 Stellen, 0 gelöschte/geänderte Zeilen).

## Worker-Fall `fokus`
Aufruf: `spk1Call('fokus', {doc, N, mode, aus, thr, sth, K, bw, att, from, to, stream}, null, {chunk, prog})`
- `mode`: `'rest'` (Nur Rest) | `'gef'` (Nur Gefundenes; `'gefunden'` geht auch). `aus`: `'sicher'` | `'alle'`.
- `thr` = „Sicher ab“ (U.opt.n2thr, Standard 0,5), nur für `aus:'alle'` (Vorschläge 'neu' ab thr, wie spk2Each).
- `sth` = Schwelle „Sichere“ (Standard 0,7). Sichere = st 'zu' ODER (st ≠ 'neu' UND (Note liegt in einer Ebene ODER conf ≥ sth)).
  Ohne conf gilt conf = 1. Noten in gelöschten Ebenen zählen nicht (wie spk2Each).
- `K` 16 Teiltöne, `bw` 45 Cent (wie Zuordnen), `att` 42 dB Ausblendung in der Bandmitte.
- Stücke wie 'spec': `{N, k, x0, w, R:984, hop, data (Uint8 R×w, zeilenweise), eO, eR, key, mode, cached}`; je Stück `prog` (stufe 'Fokus') + tick.
- Rückgabe: `{key, nAus, eO, eR, anteil, n, neu, stop, ms, N, hop, cols, rows, chunks, from, to, mode, aus}`.
  `anteil` = eR/eO (Leistung über alle Zellen der gelieferten Stücke) → Status „übrig ≈ xx %“. `stop`: '' | 'abgeloest' | 'geaendert'.
- `fokusKey` (gleiche Parameter) → `{key, nAus}` ohne Rechnen: Ist der Fokus-Satz im Hauptfaden noch aktuell?
- `fokusStop` löst einen laufenden Auftrag ab (eigenes `d.fkTok`, `d.specTok`/`d.stop` bleiben unberührt).

Rechnung je Stück (keine FFT): Original-Stück aus IDB `spk:<id>:v<N>:<ci>` nur lesen (fehlt es: `specChunk` im Speicher, nichts
geschrieben). Rest-Anteil je Basis-Rahmen über `gainFn(mixOf('rest'))` (wie SPK12 gainA, mit SPK6-Kopien), je Zeile Maximum der Bins.
Noten: Grundton aus `fz` (Basis-Rahmen fi+j), Teiltöne h·f0, Breite = max(bw, Hauptkeule ±2 Bins des Anzeige-N) mit Kosinus-Kante,
Hüllkurve mit Einschwingen (a − N/2/sr − 30 ms … a − N/4/sr) und Ausklang (b + 60 ms + N/4/sr, Kante N/4/sr + 50 ms).
„Gef“ = min(1, Σ Ebenen-Masken) ∪ Noten-Bänder. Zellen mit Anteil 1 bleiben byte-gleich.

Zwischenstand: nur Speicher, 6 Stücke, Schlüssel `spk:<id>:fk:<H>:v<N>:<ci>`; H = FNV über Modus, Optionen, N, Dokument, Ebenen id:ver,
gefundene Noten (id, st, a, b, f, fz-Länge@fi). Vor jedem Stück (und nach dem IDB-Lesen) wird H neu gebildet → bei Änderung Abbruch.
Kein IDB-Schreiben, `remove()`/`exportDoc()` unberührt, nichts in d.meta.

## Haken (je eine neue Zeile, typeof-geschützt, Kommentar /* FOKUS1 … */)
1. Kern, nach SPK12 in spk1DspMake: `if (Z2 && typeof fokus1KMake === 'function') fokus1KMake(Z2, {specInfo, specChunk, get, gainFn, mixOf, render, tick, soon, BLK, DBF});`
2. spk1Call, nach dem SPK12-Haken: `if (typeof fokus1CallSrc === 'function') { const rF = fokus1CallSrc(op, a, cb); if (rF) { op = rF[0]; a = rF[1]; if (rF[2]) cb = rF[2]; } }`
3. spk8WUrl, nach der SPK12-Zeile: `if (typeof fokus1KMake === 'function') src = src + ';' + fokus1KMake.toString() + ';';`
   Fällt spk8WUrl in seinen catch, fehlt 'fokus' im Worker → Fehler „op fokus“; die Anzeige muss das abfangen (dann einfach „Alles“).

## Entscheidung: Werkzeuge bei „Nur Rest“ (Punkt 3)
Umlenkung statt nur Verwerfen – die Wege gibt es schon (SPK12 s12src):
- Schalter ist `SPK1.ui.f1.mode === 'rest'` (Anzeige-Teil legt `U.f1 = {mode:'alles'|'rest'|'gef', aus:'sicher'|'alle', …}` an).
- spk12zauber / spk12trans / spk12hauto / spk12follow / spk12aehn bekommen `s12src:'rest'`; 'harm' → 'spk12harm', 'aehnlich' → 'spk12aehnB'.
  Nur wenn SPK12 nicht schon eine Ebene gewählt hat („Alle Ebenen abtasten“ aus + aktive Ebene bleibt Vorrang). Fortschritt
  'Ebene abtasten' erscheint als „Rest abtasten … %“ in spk1Stat.
- 'noten' mit lid 'orig' bekommt `fokus:'rest'`: Rest-Signal (Original minus Ebenen, render blockweise mit tick, ein Eintrag je
  Ebenen-Stand, nach 90 s frei) → `noten0(d2)` mit `d2 = Object.create(d)`, `d2.mid` = Rest. Danach neue Treffer verwerfen, die auf
  Teiltönen gefundener Noten liegen (Verhältnis ½,1,2,3,4 ± 50 Cent; Überlappung > 50 % der kürzeren Note oder ≥ 0,1 s bei conf < 0,6),
  und ausgeblendete Original-Noten, die „Noten finden“ im Bereich ersetzt hätte, wieder einsetzen. Gleicher Undo-Schritt (geprüft:
  Undo stellt den Stand vor „Noten finden“ her).
- 'transfer' (In Ebene, verschieben) mit von 'orig' → von 'rest': nimmt nur den freien Rest und zieht nichts aus den schon gebauten
  Ebenen ab. Ohne das würde „In Ebene“ bei „Nur Rest“ frühere Arbeit zerstören. Kopieren bleibt unverändert.
- Grenze: Der Zauberstab auf dem Rest sieht den Masken-Rest, nicht die zusätzlich ausgeblendeten Noten-Teiltöne. Ist eine Note nur
  „gefunden“ (nicht zugeordnet), kann ein Tipp genau auf die (unsichtbare) Stelle sie noch greifen. Im Test (Ton A in einer Ebene)
  greift er die Rest-Spuren am Rand der Kamm-Maske (Pegel sehr klein, Fläche ähnlich). Für tiefere Wirkung müsste SPK12 chunk()
  einen Fokus-Weg bekommen – bewusst nicht gemacht (keine vorhandene Zeile ändern).

## Für den Anzeige-Teil (U.f1, Tausch der Stücke)
- `FOKUS1_API` (window.__fokus1): get(o, cb) → {…, got}, key(o), stop(), route(op, a). Erweitern statt neu anlegen.
- Erst anfordern, wenn `!U.specQ` (sonst rechnet specChunk doppelt). Stücke streamen ca. 25–32 ms je Stück im Worker.
- `stop === 'geaendert'` → nach Entprellen neu anfordern; `key` aus der Antwort mit `fokusKey` vergleichen.

## Messungen (fokus1-kern-test.mjs, Chromium, 428×926, dpr 2; Last durch andere Agenten)
- Ton A (220 Hz) nur als gefundene Note (keine Ebene): Teiltöne −41,9 dB; Ton B ±0,00 dB; Zellen außerhalb byte-gleich (0 Abweichungen).
- A zugeordnet (Ebene + Note): −50 … −66 dB; B ±0 dB. „Nur Gefundenes“: A ±0 dB, B weg (< −290 dB).
- Ebene geändert → neuer Schlüssel, 2/2 Stücke neu; verschobener Grundton weg, Obertöne ±0 dB.
- Original-Cache 'spec' byte-gleich vor/nach; Export (PCM + Masken + Noten) und Audio (render) unverändert vor/nach fokus.
- 3 min (16 Stücke): 400–506 ms gesamt, 25–32 ms je Stück, erstes Stück nach 27–64 ms, 0 Long Tasks im Hauptfaden.
- Rückfall Hauptfaden: alle Kern-Prüfungen grün; 2 Stücke 77 ms (≈ 38 ms je Stück, also < 50 ms je Aufgabe in Chromium;
  am iPhone ohne Worker evtl. darüber – nur Rückfall).

# FOKUS1 – Anzeige + Bedienung (Teil 2)

## Was
- „Ansicht ▾“ ganz oben: h5 „Fokus“ + Segment (makeSeg, Klasse `spk1-f1`) „Alles │ Nur Rest │ Nur Gefundenes“.
  Zeile „Ausblenden [Sichere │ Alle]“ (vorhandenes `label`-Aussehen der Pegel-Regler, Segment `spk1-f1b`) nur, wenn Fokus ≠ Alles
  und Noten mit Sicherheit (conf) da sind. Wechselt die Zeile, wird das Klappfenster neu gelegt.
- Hochkant würde das Fenster mit der Zeile „Ausblenden“ (829 px Inhalt ab y 92) nach oben kippen und ↶ ↷ ✕ verdecken. Darum legt
  fokus1ViewDd es nach spk1Dd (Mikroaufgabe) wieder unter den Knopf und begrenzt die Höhe → es scrollt ein paar Pixel. Nur dann, nur
  wenn darunter ≥ 320 px Platz ist (quer greift es nicht; dort scrollt das Fenster wie bisher, Fokus steht oben und ist sichtbar).
- Zustand `U.f1 = {mode, aus, set, sig, st, …}` nur in SPK1.ui (Sitzung). Schließen/Öffnen der Seite behält den Modus, nichts in d.meta.
  Der zweite Satz Stücke ist `U.f1.set = {doc, N, mode, hop, info, chunks[ci] = {x0, w, R, data, tex, old}, key}` (Auftrag nannte ihn U.fokus).
- Zeichnen: fokus1Pre setzt nur für die Dauer eines Bildes `U.spec = {N, hop, info, chunks: arr}` ein; arr[k] = Fokus-Stück, sonst das
  Original-Stück (geliehen, nie freigegeben). fokus1Post stellt U.spec und U.tintOn zurück. „Nur Rest“ zeichnet ohne Tönung.
  „Alles“ tauscht nichts → Bild byte-gleich, Original-Texturen bleiben (kein Neu-Rechnen, kein Neu-Hochladen).
- Hochladen der Fokus-Texturen in fokus1Pre (gleiche G.tex wie spk1GlDraw, R8 + Mipmaps): nur sichtbare Stücke, höchstens 2 je Bild;
  bremst ein Hochladen das nächste Bild (> 45 ms Abstand), hält es danach Abstand (adaptiv, für langsame Grafik). Bis dahin: altes
  Fokus-Stück (bei Neuladen nach Änderung) oder Original. Kontext verloren (U.gl wechselt) → eigene tex = null.
- Laden: fokus1Load → 'fokus' im Worker, sichtbare Stücke zuerst, dann der Rest; nur wenn !U.specQ (sonst `pend`, Start im nächsten Bild).
  Neuzeichnen beim Streamen gedrosselt (90 ms). stop 'geaendert' → entprellt neu; 'abgeloest' → ignorieren. Fehler „op fokus“ (Worker
  ohne Fokus-Kern) → zurück auf „Alles“, Status „Fokus hier nicht verfügbar“.
- Neu holen: fokus1Got (Anfang spk1Layers – läuft bei jedem Kern-Ergebnis: In Ebene, Undo/Redo, Noten finden, Zuordnen, Zerlegen,
  SPK6 …) vergleicht sig = Dokument + N + Modus + Ausblenden + „Sicher ab“ + Ebenen id:ver + Noten (lid,id,st,conf,a,b,f,fz) und lädt
  entprellt (120 ms) nur bei Fokus ≠ Alles. Solo/Stumm/Lautstärke ändern sig nicht. Dokumentwechsel → Satz weg.
- Freigeben: fokus1Free (spk1SpecFree: FFT-Wechsel, Dokument, Seite verlassen) löscht nur eigene Texturen, stoppt den Auftrag
  (fokusStop) und lädt nach dem Original neu. Auf „Alles“ werden die Fokus-Texturen nach 20 s freigegeben (GPU-Speicher).
- Status in spk1Stat: hochkant „Fokus: Rest · 2 Noten ausgeblendet · übrig ≈ 39 %“, quer (< 330 px) „Rest · 39 % übrig · 2 aus“;
  voller Text (… der Energie) im title. Fortschritt „Fokus · 40 %“. Nie mit „Spektrum“ am Anfang (sonst überschreibt spk1SpecLoad).
  „Nur Gefundenes“: „Fokus: Gefundenes · 2 Noten · ≈ 61 % der Energie“.
- Kern-Ergänzung (im FOKUS1-Block, Worker): Zauberstab bei „Nur Rest“ prüft die angetippte Stelle im Fokus-Stück: ist sie dort
  ≥ 20 dB leiser als im Original (Ebene oder gefundene Note), wählt er nichts (cells 0 → SPK12 meldet „nichts gefunden – auf eine
  helle Stelle tippen“). Damit greift er keine schon gefundene Note doppelt (vorher: gleiche Fläche aus den Rest-Spuren).
  Routing gibt dafür aus/thr mit (gleicher Zwischenstand-Schlüssel wie die Anzeige).
- Anleitung: Eintrag „Fokus: Gefundenes ausblenden (Nur Rest)“ in der Suche (ui1Entries, wie SPK12), Weg „Spektral › Ansicht ▾ › Fokus“.
  Suche „erkannte noten ausblenden“ findet ihn als ersten Treffer. Vorher gab es so etwas nicht (kein „Fokus“/„ausblenden“ im Spektral-Teil).

## Haken (jede Zeile neu, typeof-geschützt, /* FOKUS1 … */) – zusammen mit den 3 Kern-Haken
4. spk1Frame vor `try {`: `if (typeof fokus1Pre === 'function') fokus1Pre(U);`
5. spk1Frame nach `} catch (e) { logErr(e); }`: `if (typeof fokus1Post === 'function') fokus1Post(U);` (außerhalb von try → läuft immer)
6. spk1Layers erste Zeile: `if (typeof fokus1Got === 'function') fokus1Got(U);`
7. spk1ViewDd erste Zeile in der Füll-Funktion: `if (typeof fokus1ViewDd === 'function') fokus1ViewDd(U, dd);`
8. spk1SpecFree nach dem deleteTexture: `if (typeof fokus1Free === 'function') fokus1Free(U);`
Diff gegen basis.html: 8 Einfüge-Stellen + Block, 0 geänderte/gelöschte Zeilen.

## Test-Zugang (FOKUS1_API erweitert)
`S()`, `mode(m)`, `aus(a)`, `info()` → {mode, aus, run, pend, aktuell, st, txt, title, n, tex, key, err}, `chunks()` (Fokus-Satz), `idle()`.

## Grenzen / Hinweise
- Long Tasks: Im Test-Chromium (Software-Grafik, viele Agenten parallel) entstehen beim Hochladen von Texturen (Mipmaps) Long Tasks
  von 50–90 ms AUSSERHALB von JavaScript (kein Bild > 8 ms, kein fokus1Pre > 6 ms gemessen) – auch beim Laden des Original-Spektrums
  in basis.html (gemessen 55–185 ms). Mit Abstand + Drossel: „Nur Rest“ meist 0, „Nur Gefundenes“ 50–57 ms. Am iPhone (echte Grafik)
  ist ein Hochladen von 1 MB R8 + Mipmaps ~1–2 ms. Profi-Weg für später: Mipmaps erst nach dem Umschalten nachziehen oder ein
  Textur-Atlas (weniger Uploads) – jetzt nicht, weil das Aussehen beim Herauszoomen gleich bleiben soll.
- Tipp auf die Statuszeile ändert schon in basis.html das Bild (gemessen: Hash anders, Ursache nicht Fokus) – der Test schließt das
  Klappfenster deshalb ohne Tipp auf die Statuszeile.
- Noten-Kästchen (SPK2-Überlagerung) bleiben bei „Nur Rest“ sichtbar – sie zeigen, was gefunden ist; das Spektrum zeigt, was übrig ist.
- „In Ebene“ bei „Nur Rest“ nimmt nur den freien Rest (Kern-Umlenkung transfer orig → rest) – bitte von der Hauptsitzung abnicken.
- Harmonische / Ähnliches auf dem Rest sehen die Masken, nicht die zusätzlich ausgeblendeten (nur gefundenen) Noten.
- Nachtrag Leistung: Ursache der meisten Long Tasks beim Umschalten auf „Nur Gefundenes“ war die Tönung (Ebenen-Farben) während des
  Hochladens. Jetzt zeichnet „Nur Gefundenes“ die Farben erst, wenn alle sichtbaren Stücke da sind (ein Wechsel am Ende) → 8 → 0 Long Tasks.

## Ergebnis (fokus1-test.mjs, 428×926 + 926×428 + CPU-Rückfall, Touch über CDP, dpr 2)
51 OK / 0 FEHLER (fokus1-ergebnis.json, test-voll.log). 3 Minuten (15 Stücke): erster Lauf unter Last 1 Long Task 56 ms, Wiederholung
0 / 0 / 0 (Rest / Alles / Gefundenes; Laden des Original-Spektrums im selben Lauf: 177 ms – Grundlast der Test-Grafik).
Kern-Test erneut: Worker 26/0, Hauptfaden-Rückfall 24/0 (Zauberstab-Prüfung an das neue Verhalten angepasst: Stelle im Rest
≥ 20 dB leiser → nichts wählen). Pflicht: topdefs 0/0, dupkeys 0, smoke errors [], MS 2000 = 1, live = 1, Diff 8 Haken + Block, 0 gelöscht.

## Prüfung iPhone/Bedienung (unabhängig, pruef-iphone/pruef.mjs, hasTouch/isMobile/dpr 3)
- Klappfenster: hochkant 80–420 × 92–918 (scrollt 3 px), quer 340–680 × 45–403 (scrollt, Finger-Scroll geht). Fokus-Knöpfe 52–102 × 44, alle per Treffer-Test tippbar. Ansicht-Knopf selbst (basis): 36 px hoch, erst nach 2× (hochkant) / 1× (quer) Wischen in der Werkzeugleiste sichtbar.
- FEHLER Status: Rest → Alles → Rest (oder Gef → Alles → Gef) innerhalb 20 s: Statuszeile bleibt „Fokus aus · alles sichtbar“, Bild zeigt Rest (lA 0) bzw. Gefundenes (lB 0). Nach 21 s korrekt. Ursache: fokus1Mode setzt F.st = null, fokus1Load „noch aktuell“ → fokus1Done kehrt bei F.st null zurück.
- Quer-Status: „Gefunden · 58 % · 1 Noten“ (Einzahl fehlt), „Rest · 42 % übrig · 1 aus“; title „… noch nichts gefunden der Energie“.
- Kein Dauer-Anzeiger: nach Werkzeug-Tipp steht Werkzeug-Hinweis in der Statuszeile, „Nur Rest“ bleibt an (lA 0), Ansicht-Knopf unverändert; Modus überlebt Schließen/Öffnen und Liedwechsel.
- Rest-Halo: Spalte durch Ton A bei 4 s: 220 Hz 191→0, aber 196 Hz 142→121, 246,9 Hz 130→103, 174,6 Hz 75→75 (Fensterflanke bleibt hell unter/über der ausgeblendeten Note).
- Herauskristallisieren 2 Runden (A Ebene → B finden+Ebene → C finden+Ebene): nichts doppelt, Runde 2 1 Phantom verworfen, Status 55 % → 24 % → < 1 %, Rest nach Ebene in 560/605 ms neu.
- Speicher 3 min (15 Stücke): zweiter Satz +18,1 MB Texturen (R8+Mipmaps, geschätzt) + 13,6 MB Daten; 21 s nach „Alles“ frei.
- Long Tasks 3 min: erstes Umschalten auf Rest 2–4 Tasks 51–62 ms (6/6 Läufe), außerhalb JS (spk1Frame 0 ms); wiederholt 0. Grundlast 6 Bilder „Alles“: 0. Mit 1 Upload/Bild (Kopie exp/): 0 bzw. 1×52 ms. CPU 4×: Grundlast-Bilder selbst 50–58 ms; Umschalten bis 64 ms, Rest-Neuladen 4–11 Tasks bis 73 ms.
- CPU-Rückfall ohne WebGL: hochkant/quer Rest dunkel (A 191→23/42), Alles byte-gleich, 0 Long Tasks, 0 Fehler.

# Prüfung der Befunde (Fix-Runde 13:00–13:30, Sicherung index.vor-fix.html)

Umgebung: Platte voll (0–30 MB frei, auch basis.html stürzte im Browser ab). Gelöst ohne fremde Dateien: index.vor-kern.html (= basis.html,
gleiche md5), index.vor-ueberlappung.html und die Prüfer-Kopie pruef-iphone/exp/index.html gelöscht; Browser-Profil über TMPDIR=/dev/shm/fk1tmp.

1. Projekt laden / Schließen-Öffnen → alter Zwischenstand (hoch): ECHT, behoben. Kennung je Dokument-Objekt `inst(d)` (d.fkI) in sigOf und
   im restMid-Schlüssel. m2 b nachher: neuer Schlüssel, neu 2, cached [false,false], B −321 dB (vorher ±0 dB, alter Inhalt).
   Hauptfaden: spk1Show → spk1SpecLoad → spk1SpecFree → fokus1Free verwirft den Satz ohnehin; nur der Worker-Speicher war betroffen.
2. Kamm-Maske ohne Noten zu hell (hoch): ECHT, teilweise behoben. rowsOf: statt Maximum über floor..ceil jetzt leistungsgewichtetes
   Mittel g² über die Hann-Hauptkeule (±2 Basis-Bins, (½+½cos)²) plus Zeilenbreite; dazu im Rest-Modus je Spalte Glätten über ±2,5 Anzeige-
   Bins mit der Leistung des Originalbilds (Flanken gehören zur hellen Stelle; nie heller als vorher). m2 a (Fokus / wahr):
   220 Hz halt N4096 −15,2 → −17,0 (wahr −32,4), N16384 −21,1 → −21,4 (−34,8); 65 Hz −14,6 → −18,6 (−24,4). m1 C3 Rechteck 65 Hz
   −5,1 → −8,5 (−17,7), Umfeld 40–130 Hz N4096 −2,4 → −7,2, N1024 −0,8 → −2,4. Ziel „≤ 3 dB zum wahren Rest“ NICHT erreicht: dafür
   bräuchte es die Leistung je Basis-Bin (Basis-STFT), die im Fokus-Kern nicht vorliegt – Rest-Audio neu rechnen wäre der echte Weg (teuer).
3. „übrig ≈ %“ verzerrt (mittel): ECHT, behoben. Zeilengewicht wr = min(Zeilenbreite in Hz, sr/N). m3 c: tief 0,415/0,418, hoch 0,585/0,582
   (= capBin des Prüfers; vorher 0,05/0,95). m1 C2 gleich.
4. Schatten vor/nach Ebenen-Tönen bei N 16384 (mittel): ECHT, teilweise behoben. Bei Anzeige-N > Basis-N wird der Rest-Anteil² über die
   Basis-Rahmen im Fenster ±N/2 gemittelt (Hann² × Breitband-Leistung des Rahmens aus d.mid, einmal je Dokument). m2 a: vor 0 → −7,4 dB
   (wahr −25,6), nach 0 → −15,6 dB (wahr −25,8); m1 C3 −3,9 / −6,5 (wahr −16,3 / −27,1). Genauer ginge es nur mit Band-Leistung je Rahmen.
   Versucht und verworfen: Glätten über Nachbar-Spalten mit der Leistung des Bildes (nach-Wert schlechter, −6,4).
5. Status „Fokus aus“ nach Rest → Alles → Rest (mittel): ECHT, behoben. Ergebnis liegt am Satz (S.st); „noch aktuell“ setzt F.st = S.st.
   pruef.mjs STAGE=stat nachher: rest_nach_alles_2s und gef_nach_alles_1s zeigen den richtigen Status (pruef-iphone/nachfix-stat.log).
6. Helle Flanke neben ausgeblendeter Note (mittel): ECHT, behoben über das Glätten aus 2. (kein breiteres Ausblende-Band, also keine feste
   Sperre für Nachbarnoten: eine echte Nachbarnote hat eigene Leistung und bleibt sichtbar, nur gedämpft, bei gleicher Lautstärke ≈ −3 dB).
   STAGE=col nachher (Alles → Rest): 196 Hz 142 → 45,6 (vorher 121), 246,9 Hz 130 → 31,7 (vorher 103), 174,6 Hz 75 → 48,6, 698 Hz 72 → 10.
   Dafür ist die Mitte von A nicht mehr schwarz: 191 → 41 (vorher 1), Summe der Spalte 872 → 612. Ursache der Flanke war die lineare
   Zwischenwert-Bildung von rmap zwischen Anzeige-Bins (Hann bei 2,2 Bins ≈ −32 dB, angezeigt −23 dB).
7. Kein bleibender Hinweis (mittel): ECHT, teilweise. Gebaut (ohne neuen Look): beim Wechsel auf ein anderes Lied springt der Fokus auf
   „Alles“ (Werkzeuge arbeiten im neuen Lied wieder normal). Schließen/Öffnen derselben Seite behält den Modus. Ein Zeichen am Knopf
   („Ansicht · Rest ▾“) ist sichtbar → NICHT gebaut, Funk-Vorschlag.
8. Long Tasks beim ersten Umschalten (klein): umgesetzt wie vorgeschlagen, upMax 2 → 1 (ohne Risiko). Messung in dieser Runde nicht
   aussagekräftig: Last + volle Platte; Grundlast „6 Bilder in Alles“ ohne Fokus hat selbst 50–90 ms; index.vor-fix.html (früher 51/0)
   ergab im A/B unter gleicher Last ebenfalls 46 OK / 5 FEHLER, dieselben 5 Long-Task-Prüfungen.
9. Quer-Statustexte (klein): behoben. Schmal: „Rest 42 % · 1 Note weg“, „Gefunden · 58 % · 1 Note“; title ohne „der Energie“, wenn
   keine Zahl im Text („noch nichts gefunden“).
10. Ansicht-Knopf außerhalb / 36 px (klein): ABGEWIESEN für FOKUS1 – schon in basis.html, nicht Teil des Pakets (Funk-Vorschlag möglich).
11. Anleitung verdrängt 'frequenzen'/'erkannt' (klein): ABGEWIESEN (bewusst so) – Xanders Wortlaut ist „erkannte Frequenzen“; alle 175
    alten Eintragsnamen behalten ihren ersten Treffer.

Kosten: Worker je Stück (3 min, 16 Stücke) 41–46 ms statt 30–35 ms (gleiche Last, A/B); Hauptfaden-Rückfall 2 Stücke 148 ms statt 77 ms
(nur ohne Worker). Hauptfaden mit Worker unverändert (nur Hochladen).
