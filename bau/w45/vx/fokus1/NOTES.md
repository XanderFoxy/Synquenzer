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
