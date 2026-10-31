# Mein Vorteil

**Eine Seite für alles:** Angebote & Preisfehler, Vorteile, Konzerte.
<https://xanderfoxy.github.io/Synquenzer/mein-vorteil/> (Safari → Teilen → „Zum Home-Bildschirm“, dann wie eine App)

Die alten Seiten `schnaeppchen/`, `vorteile/` und `konzerte/` leiten sofort hierher weiter (`#angebote`,
`#vorteile`, `#konzerte`). Ihre alten Service Worker werden durch einen Abschalt-Worker ersetzt (Zwischenspeicher
löschen, abmelden, neu laden), damit iPhones mit der alten Seite im Speicher auch hier landen. Alte Symbole auf dem
Home-Bildschirm funktionieren weiter über die Weiterleitung; schöner ist, die neue Seite einmal neu hinzuzufügen.

## Reiter

| Reiter | Inhalt | Daten |
|---|---|---|
| **Angebote** | Preisfehler (oben, wenn es welche gibt), „Jetzt günstig“, „Deine Liste“ | `schnaeppchen-daten` `current.json` + Preisfehler aus `vorteile-daten` |
| **Vorteile** | alle Bereiche aus den Daten, in der Reihenfolge der Daten – ein neuer Bereich (z. B. „Prämien & Freunde werben“) erscheint von selbst; Spar-Tipps & Vorlagen | `vorteile-daten` `aktuell.json` |
| **Konzerte** | Konzerte & Festivals (Umkreis-Schalter), neue Veröffentlichungen | `konzerte-daten` `konzerte.json`, `releases.json`, `status.json` |

Schnäppchen-Angebote und Preisfehler stehen nur unter „Angebote“ (nicht doppelt unter „Vorteile“). Derselbe Preisfehler
aus beiden Quellen (gleicher Link) erscheint einmal. Der letzte Reiter wird gemerkt; `#angebote` usw. öffnen direkt.
Oben: „Stand“ je Quelle (rot, wenn der letzte Lauf zu lange her ist oder keine Verbindung besteht) und „Push einrichten“
(ntfy-Thema `xander-schnaeppchen-b5cbf4442aaa9734f3`, gilt für alle drei).

## Was eine Angebotskarte zeigt

- Überschrift = das Produkt, das du verfolgst (ohne Packungsgröße, wenn das Angebot eine andere Packung ist).
- Darunter der **eigene Titel des Angebots** und seine **Packung** („15 × 25 g“), Preis, Laden, Preis pro Stück / 100 g.
- **„Tiefstpreis?“** mit ja / nein / unklar und dem ehrlichen Satz aus den Daten (`tiefst.text`).
- **„Normalpreis geschätzt“**, solange der Normalpreis nur eine Schätzung ist.
- **Gültig** („bis heute, 19:00 Uhr“, „ab Mo 2.11.“) – in Berliner Zeit.
- Ist die Packungsgröße unsicher (`mengeSicher: false`), gibt es **keine Prozentangabe** und keinen Preis pro Stück.

**Preisfehler:** „vorher 96,99 € → jetzt 23,99 €“, „du sparst 73,00 € (−75 %)“, darunter klein die Quelle des
Vorher-Preises. Ohne bekannten Vorher-Preis steht „Originalpreis unbekannt“ – nie eine erfundene Zahl.

## Abgelaufenes

Die Daten kommen nur stündlich (Konzerte alle 3 h). Deshalb blendet die Seite selbst aus:

- alles mit `bis` / `gueltigBis` / `sichtbarBis` in der Vergangenheit (auch während die Seite offen ist – sie zeichnet
  sich zum nächsten Ende neu),
- Preisfehler ohne jede Ende-Angabe nach 24 Stunden (ältere Daten),
- Vorteile alter Daten mit `frist` vor heute, Konzerte mit `datum` vor heute.

## Technik

- Eine Datei `index.html` (kein Framework), Symbole, `manifest.webmanifest`, `sw.js`.
- Alle Daten werden parallel geholt; der letzte Stand liegt im `localStorage` und erscheint sofort beim Öffnen.
  Ohne Netz bleibt er stehen (Stand-Zeile: „offline“).
- `sw.js` (nur `/mein-vorteil/`): Seite erst aus dem Netz, nach 3 s oder ohne Netz die letzte Kopie; Daten von
  `raw.githubusercontent.com` gehen nie durch den Worker.
- Liest ältere Datenformate mit (ohne `packung`/`mengeSicher`/`tiefst`/`bis`): dann ohne Prozent und Packung,
  Tiefstpreis „unklar“.
- Tests: `cd mein-vorteil && npm test` (Node ≥ 20, Playwright mit Chromium; ohne Playwright werden sie übersprungen).
  Echte Daten vom 31.10.2026 in `test/fixtures/echt-2026-10-31/` (`v1` = damaliges Produktionsformat,
  `v2` = dieselben Rohdaten durch die neuen Scanner), Sonderfälle in `test/fixtures/vertrag/`
  (neu bauen: `npm run fixtures`). Bildschirmfotos: `MV_SHOTS=<ordner> npm test`.
