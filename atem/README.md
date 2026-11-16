# Atem

Ruhige Atemübungen mit Belegstärke – Web-App ohne Build-Schritt (ES-Module), offline-fähig, ohne Konto, ohne Analyse.
Alle Daten bleiben im Browser unter `atem.v1.*` (Export, Import, „Alles löschen“ in den Einstellungen).

- `daten.js` und `wissen.js` sind **erzeugt** (`node test/daten-bauen.mjs` im Arbeitsordner), nicht von Hand ändern.
- Versionswechsel: `VERSION` in `app.js` und `SCHALE` in `sw.js` zusammen hochzählen.
- Figur: seit 0.2.0 `figur.js` (stilisiert, leuchtende Lunge, Lichtperlen, Pfeile, Hände; Meditation Kissen/Stuhl/Liegen) in Übung, Vorschau und Meditation – gleiche Schnittstelle wie `anatomie.js`, das nur noch für „Zwerchfell oder Brust?“ dient.
- 0.2.0: Rahmen `layout.js` + Token/Rahmen-CSS (seit der Nachbesserung eingebettet in `index.html`, `<style id="stil-020">` – Quelle `atem-020/layout`, ohne Kommentare) (Leiste Heute · Üben · Meditation · Fortschritt · Mehr), Zähltöne `signale.js` (lädt bei Bedarf), Ziele/Programm/Fortschritt/Erinnerung (ntfy)/Achtsamkeitsminuten (`ziele.js`, `ziele-daten.js`, `fortschritt.js`, `erinnerung.js`, `health.js`), Stimmen de/en/ar/it.
- Kein Ersatz für ärztlichen Rat. Notfall: 112.
