# Atem

Ruhige Atemübungen mit Belegstärke – Web-App ohne Build-Schritt (ES-Module), offline-fähig, ohne Konto, ohne Analyse.
Alle Daten bleiben im Browser unter `atem.v1.*` (Export, Import, „Alles löschen“ in den Einstellungen).

- `daten.js` und `wissen.js` sind **erzeugt** (`node test/daten-bauen.mjs` im Arbeitsordner), nicht von Hand ändern.
- Versionswechsel: `VERSION` in `app.js` und `SCHALE` in `sw.js` zusammen hochzählen.
- Figur (`anatomie.js`) läuft in der Übung im selben Bild wie der Kreis (gleiche Phase, gleiches v); `vorschau.js` zeigt sie auf Tippen in Vorbereitung, Singen und Wissen.
- Kein Ersatz für ärztlichen Rat. Notfall: 112.
