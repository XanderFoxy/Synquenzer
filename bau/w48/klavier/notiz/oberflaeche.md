# oberflaeche – Stand
Dateien: app/index.html, app/stil.css, app/js/app.js, app/manifest.webmanifest, app/icon.svg. Test: test/app-rauch.mjs (Server: python3 -m http.server 8766 --directory app; dann node test/app-rauch.mjs <klavier-ordner>).
Fotos: fotos/k-start.png, k-stueck.png (428×926 hell), k-quer.png (926×428 dunkel), k-uebung.png.

## Seiten
- #start: großer Knopf „Notenblatt laden" (auch Ziehen und Ablegen), Meine Stücke (IndexedDB 'klavier-lernhilfe'/'stuecke', mit Ersatz im Speicher, löschbar), 3 Beispiele, 3 Übungen, Farblegende.
- #stueck/<id>: Notenblatt mit Rollenfarben und Akkordnamen über jedem Abschnitt (Am, Am/C 1. Umk., …; antippen = Akkord hören und erklären). Note antippen = Ton, Taste leuchtet, Karte mit Rolle, Ort im Schlüssel und Erklärung. Takt antippen = Anfang, zweiter Takt = Ende → Schleife (✕ = ganzes Stück). Abspielen: Zeiger, klingende Noten markiert, Tastatur leuchtet in Rollenfarben, Akkordkarte läuft mit, Noten und Tastatur scrollen mit. Tempo 40–100 % (auch während des Spielens), Hand Beide/Links/Rechts, Farben an/aus, Namen an/aus (alle Tasten / nur C).
- #uebungen/<lesen|akkord|intervall>: bindet uebungen.js ein.
- Bild/PDF → ehrliches Hinweisblatt (Text aus bildErkennen + was sofort geht).

## Änderung an einem Baustein
notensatz.js Zeile 267: neue Option `kopfRaum` (px Platz über jeder Zeile für die Akkordnamen). Sie ist rein zusätzlich, ohne die Option bleibt alles wie vorher.
app.js übergibt `breite` selbst und bricht bei Größenänderung (hoch/quer) selbst neu um, damit die Akkordnamen erhalten bleiben.

## Offen
Kein Service Worker (offline erst nach dem ersten Laden aus dem Browser-Cache). Echt auf dem iPhone nicht geprüft (Klang, Safari-Leisten). Schleife nur über Takt-Tipps, kein Ziehen.
