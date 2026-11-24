# uebungen (app/js/uebungen.js)

- 34 Übungen (UEBUNGEN), Stichworte auf den Wortschatz der Oberfläche gebracht (export STICHWORTE = Anzeigenamen).
- plan(lied, stimme): je gesungenem Teil 7 Stufen (+ Zusatzschritte in Stufe 3 je Art der schweren Stelle, Rückwärts-Aufbau in Stufe 5).
  schwierig[]: {art: hoehe|tiefe|sprung|phrase|schnell|halteton|uebergang|diphthong, zeile, wort, midi, uebung, text, tipp, gewicht}.
  Schwelle hoch: über stimme.kern[1], sonst oberste 15 % des Liedumfangs. Tiefe nur mit Stimme (unter kern[0]).
- warmup(lied, stimme): ~9 Min.: Lockerung → Lippenflattern (5-Ton-Leiter durch den Liedbereich) → Ng-Sirene tief…hoch+1 →
  Vokal-Leiter (häufigste Lied-Vokale + Doppellaute) → 3 schwerste Übergänge → schwerste Zeile auf Vokalen.
  ton = {start, von, bis, folge, noten?, gleiten?}; noten = vorzuspielende Tonfolge (app.js notenAus liest .noten bzw. von/bis); vokal je Schritt.
- phonetik.js wird per top-level await abgesichert geladen; Fallback = einfache Vokal-Erkennung. Hinweise aus phonetik.uebergaenge() werden übernommen.
- Ohne Stimme: HINWEIS_STIMMLAGE in Schritt 1 und in plan()[].hinweis; SICHERHEIT (Schmerz = aufhören, kein Ersatz für Unterricht).
- Auffällig (Bereich phonetik): „hypnotised“ (britische Schreibung) → Fallback liefert I · ö · I statt … · Ai.
