# eignung + Mikrofon – Stand 24.11.2026

## Eignung (app/js/eignung.js, neu)
- `eignung(lied, stimme)` → {stufe 'passt'|'mit Übung'|'noch weit', text, gruende, transponieren, stufeTransponiert, schwierig[{zeile, zeilenText, silbe, midi, vokal, warum, art}], weg[{woche, ziel, uebungen, text, trans?, ton?}], kern (10–90 %-Lage, nach Dauer gewichtet), umfang, ohneStimme, ohneMelodie}.
- Grundlagen: Umfang, Tessitur gegen stimme.kern, Töne über stimme.hoch/unter tief, gehaltene Töne genau auf stimme.uebergaenge (≥0,5 s), Sprünge ≥5 HT, Bögen >4,5 s, >5,5 Silben/s, Vokal auf Tönen über dem Kern (Vokal-Ausgleich-Tabelle).
- Transposition: −12…+12 mit Kosten (über Kern, über hoch ×3, unter tief ×2) + kleine Strafe je Halbton.
- Ohne Stimmprofil: BARITON-Annahme (Kern H2–H3, G2–E4) + Hinweis „Stimmlage ermitteln“. Ohne Melodie: ohneMelodie:true, Ampel grau.
- The Wall + Xander-Profil: „mit Übung“ (Des4 3 HT über B3). Test: werkzeug/eignung-test.mjs.

## Oberfläche (app.js)
- Lied-Seite: großer Knopf „Mitsingen mit Instrumental“ (#mitsingen/<id>), Eignungs-Karte (Ampel, Gründe, „Übungen um x transponieren“, schwierigste Stellen, „Weg zu diesem Lied“). Nach #neu-Import springt sie mit Pop-Animation auf.
- Neue Routen: #lied/<id>/weg (Wochen-Pfad, Übungen mit Startton + Vorspielen, Stellen → /bau), #lied/<id>/zeile/<zid>/bau (scrollt zum Bau), #mitsingen/<id> (lädt ./mitsingen.js → zeige(element, lied, {stimme, trans, meldung}); ohne Datei freundlicher Hinweis; 404 im Netzwerk-Log, solange die Datei fehlt).
- Transposition je Lied: localStorage gt.trans {liedId: x}; Lernweg, Warm-up (liedFuer) und Zeilen-Regler folgen ihr.
- Zeile: Karte „Auseinandernehmen und zusammenbauen“ – Rückwärts-Aufbau (letzte Silbe → ganze Zeile; >8 Silben: an Wortgrenzen) und Vorwärts-Kette (Vokale → „da“ → Text), jeder Schritt spielt ab, Vorheriges wird ausgegraut.
- Teil-Lernweg: Stufe 5 „Auseinandernehmen“ mit Chips je Zeile (→ /bau). (uebungen.plan: Schritt mit bau:true)
- Import mit Audio: verteileSilben() – Noten an Pausen >0,3 s in Phrasen teilen, auf Zeilenzahl zusammenlegen/teilen, Silben je Zeile gleichmäßig (Melisma → s.noten).
- Übungen: uebungen.fuerStimme(stimme) sortiert („Für deine Stimme zuerst“ / „Alle weiteren“), je Übung Startton + Tonfolge aus dem Profil, Vorspielen-Knopf.

## Mikrofon / Stimmlage (iPhone-Meldung „Stimmlage kann nicht ermittelt werden“)
- Ursache 1 (sicher): `.mic-ring .welle` lag über dem Mikrofon-Knopf und fing den Tipp ab → Knopf ohne Funktion. Fix: pointer-events:none, Knopf z-index 2.
- Ursache 2 (iOS): AudioContext entstand erst nach `await getUserMedia` (außerhalb des Tipps → suspended). Jetzt: Context + resume() synchron im Tipp, audioSession 'play-and-record', getUserMedia ohne Echo/Rausch/AGC, Analyser im requestAnimationFrame (Ersatz-Uhr 250 ms), Meldung bei „kein Signal“, klare Texte für NotAllowed/NotFound/NotReadable.
- Stimmlage geführt: tief halten → hoch halten → Sirene, Live-Ton, Pegel-Balken, „Erkannt bisher“; Ersatz-Auswertung aus den Meldungen, falls stimmlage() nichts Sicheres findet. Neu: „Ton von Hand wählen“ (Klaviatur E2…E5, Taste klingt, tief/hoch antippen, speichern).
- Test: werkzeug/eignung/knoepfe.cjs (Fake-Mikrofon tonleiter-a2-a3.wav): Mikro erkennt A2–E3, Stimme gespeichert; von Hand A2–D4 gespeichert; 201 Knöpfe angetippt, ohne Wirkung nur bereits gewählte Segmente (Vokale/Vokalstimme/Alle) – Klavier/Vokalstimme spielen jetzt eine Klangprobe. 0 Fehler.
- Rauchtest Eignung: werkzeug/eignung/rauch.cjs (Silver Rain, Sinus-WAV) – 0 Fehler, Fotos fotos/e-eignung.png, e-weg.png, e-stimme-mikro.png, e-stimme-hand.png.
- Offen: echtes iPhone nicht getestet (nur Chromium-Fake-Mikrofon).
