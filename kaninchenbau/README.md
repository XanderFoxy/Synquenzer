# Kaninchenbau 0.1

Lern-App: einfache Startfragen (zwei bunte Knöpfe) → 3–5 Interessen-Äste → je Ast 3 Stufen
(Einsteiger, Fortgeschritten, Profi) mit kurzen Wissensfragen, Möhren als Belohnung, Quellen an jedem Ast,
Baum mit Querverbindungen (gleicher Ort, gleiche Person, gleiche Zeit, gleiche Idee).
Getrennt von „Wie ich ticke“ (nur die Fragen-Technik ist gleich). Alles bleibt auf dem Gerät (`localStorage`, Schlüssel `kaninchenbau.v1`).

Online: https://xanderfoxy.github.io/Synquenzer/kaninchenbau/

| Datei | Inhalt |
|---|---|
| `inhalt.js` | 4 Gebiete, 12 Äste, 108 Fragen, 50 Quellen (geprüft 22.11.2026), 15 Querverbindungen |
| `profil.js` | Startfragen und Auswertung (reine Funktionen, alle Antwortwege getestet) |
| `app.js` | Seiten, Lernstand, Baum, Offline-Anmeldung |
| `speicher.js` | Speichern auf dem Gerät (läuft auch ohne Speicher weiter) |
| `sw.js` | Offline: prüft jede Datei per Prüfsumme; Liste mit `node test/sw-liste.mjs` erzeugen |

Neue Fassung: `VERSION` in `app.js` und `V` in `sw.js` gleich hochzählen, dann `node test/sw-liste.mjs`.
Quellen-Regel: nur echte, prüfbare Titel (Autor, Verlag/ISBN oder Link) – nichts erfinden.
