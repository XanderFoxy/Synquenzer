# training – Bericht (24.11.2026)

## Geändert (nur module/training/)
- quellen.js: alle 41 `url`-Links entfernt; je Quelle neues Feld `erklaerung` (2–4 Sätze, was dort steht). Erzeugt mit werkzeug/gen-training-quellen.mjs + training-erklaerungen.mjs.
- modul.js: keine Serie („Tage in Folge“), keine 7-Tage-Punkte, kein „x von 7“, kein „N-mal“, kein „Woche davor: an N Tagen“, kein Lob („stark“).
  „Geschafft“ → „Gemacht“ (Merkzettel). „Wie war’s?“ → „Wie war das für dich?“: tat mir gut / weder noch / passt gerade nicht (Werte 2/1/0 wie Vorlage).
  Neu: „Dein Tagebuch“ (zuletzt gemacht, antippbar), Bereichsseite mit zwei gleichwertigen Polen + Sprung `#muster/ast/training.<gruppe>`,
  Übungsseite mit „Weiter springen“, Wochenrückblick als Tagebuch (Pläne: „abgehakt: Di, Do“ statt Zahl), Links auf `#muster`, `#antworten/training`.
  Entfernt: Link zur Atem-App (`../atem/`), „Satz kopieren“. Erinnerung (.ics) enthält nur die eigene App-Adresse (gleicher Ursprung geprüft).
  Exporte: `antwortListe(k)`, `antwortSetzen(k,id,wert)`, `muster(k)`, `aeste()`. Antwort-IDs: schwerpunkt, zeit, gefuehl.<übung|hf-…>,
  plan.<id>.<feld>, notiz.<JJJJ-Www>. „vorher“ (≤5 je Antwort) im Modul-Speicher `vorher`; auch Änderungen in der Modul-Oberfläche pflegen es.
- plan.js: Gründe aus dem Profil nur in Worten („Dein Profil zeigt klar/leicht in Richtung „spontan und beweglich““) statt „niedriger als die meisten“, T-Bereich, Stunden;
  serie/letzteTage/hakenWoche entfernt; neu zuletzt, tagWort, juengsterEintrag, juengstesGefuehl, gemachteIds, gruppeVon, mitVorher.
- uebungen.js: Atem-Übung jetzt ganz in der App (Atem-Takt mit Kreis, 4 s ein / 6 s aus, läuft mit dem Timer, ruhig bei „weniger Bewegung“); POL_WORT (zwei Pole je Big-Five-Bereich).
- aeste.js (neu): 8 Äste `training.<gruppe>` (bereich 'Üben') mit Polen, wasEsIst (5 Sätze), je 4–5 Punkte imAlltag/staerken/reibung/weiterdenken,
  4–5 Unter-Äste, ueben (alle Übungen der Gruppe), verwandt (53 IDs, alle gegen die vorhandenen Äste der anderen Module geprüft), wissen als Text.
  musterAusDaten(): Muster nur aus seinem eigenen Gefühl nach Übungen + gewähltem Schwerpunkt, in Worten (klar/leicht/beides), ohne Zahl.
- stil.css: Serie-/Punkte-Stile raus; Atem-Kreis, Pole, Tagebuch rein.
- notiz/training-uebungen.json: 55 Übungen {id, titel, route, gruppe, ast, dauer, kurz, passtZu} (29 Ast-IDs darin, alle vorhanden).

## Getestet
- node --check alle 6 JS-Dateien.
- werkzeug/training-unit.mjs: 344 Prüfungen bestanden (Quellen ohne Link, Äste-Vertrag, Muster ändert sich bei geänderter Antwort, vorher ≤5, Gründe ohne Zahl/Vergleich).
- werkzeug/training-app-test.js (Playwright, iPhone 428×926 + quer 926×428, SW blockiert, Alt-Daten echt mit Vorlage 0.2.1 erzeugt):
  - stabile Kopie (Vorlage + nur mein Training): 352/352 Prüfungen, 0 Seitenfehler, 0 Anfragen nach draußen, 55 Übungen + 8 Bereiche geöffnet.
  - Arbeitskopie neu: 351/352 – einzige Meldung: 404 module/muster/quellen.js (Muster-Agent noch nicht fertig).
  - Alt-Daten laden (Einwilligung, Tage, Plan, Schwerpunkt, Notiz); Gefühl ändern → muster() rechnet neu (Fokus klar → beides); vorher gepflegt.
  - Über die Kern-Seite `#antworten/training`: 10 Antworten gelistet, Zeit im Blatt geändert → gespeichert, vorher gepflegt.
- Fotos: fotos/tr-*.png (hell/dunkel).

## Offen
- `#muster/ast/training.*` konnte nicht angesehen werden (Muster-Modul fehlte beim Test noch).
- sw.js muss aeste.js aufnehmen + Prüfsummen (siehe training-WUNSCH.md).
