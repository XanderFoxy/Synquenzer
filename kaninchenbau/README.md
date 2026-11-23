# Kaninchenbau 0.2

Kurze Runden (5, 8 oder 12 Fragen, 1–3 Minuten), jede Antwort ein Tipp: Persönlichkeit, Denken, Gefühlsleben, Ideen, Wissen,
Mindset, Kreativität. Fragen passen sich an (Bereich mit dem größten Bedarf, Abwechslung, Nachfragen direkt nach der passenden
Antwort, Kontrollfrage bei gemischten Antworten). Jede Antwort lässt sich sofort korrigieren: ↶ in der Runde, „Ändern“ in
„Antworten“ (mit Rückgängig). Prozent je Bereich und gesamt. „Defragmentieren“ ordnet die verstreuten Antworten nach Bereichen,
zeigt eine Karte mit Verbindungen, einen kurzen Kern und Ideen für die Zukunft – regelbasiert, lokal, ohne KI.
Dazu der Lernen-Teil aus 0.1 (Gänge, Stufen, Möhren, Baum, Quellen). Keine Diagnose, kein wissenschaftlicher Test.

Alles bleibt auf dem Gerät: `localStorage` (`kaninchenbau.v2`) + Sicherheitskopie in IndexedDB (`kaninchenbau`). Daten aus 0.1
(`kaninchenbau.v1`) werden beim ersten Start übernommen. Sicherung als Datei (JSON mit lesbarer Auswertung) und Laden.

Online: https://xanderfoxy.github.io/Synquenzer/kaninchenbau/

| Datei | Inhalt |
|---|---|
| `wesen.js` | 7 Bereiche, 33 Merkmale (5 davon Nachfragen), 123 Fragen, Verbindungs- und Ideen-Regeln (reine Daten) |
| `auswertung.js` | Fortschritt, nächste Frage, Kern, Karte, Ideen, Stücke fürs Defragmentieren (reine Funktionen) |
| `seiten.js` | Bau, Runde, Runden-Ende, Bereich, Antworten, Karte, Mehr |
| `lernen.js` | Lernen-Teil aus 0.1 (Startfragen, Gänge, Stufen, Baum, Quellen) |
| `kern.js` | Zustand, Speichern, Symbole, Meldung, Datei; `VERSION` |
| `app.js` | Seiten zeigen, Tipps, hell/dunkel, Offline, Übernahme 0.1, Sicherheitskopie |
| `speicher.js` | localStorage + IndexedDB, Format 2, Übernahme 0.1, Sicherung/Laden |
| `inhalt.js`, `profil.js` | Inhalte und Startfragen des Lernen-Teils (unverändert aus 0.1) |
| `sw.js` | Offline: prüft jede Datei per Prüfsumme; Liste mit `node test/sw-liste.mjs` erzeugen |

Neue Fassung: `VERSION` in `kern.js` und `V` in `sw.js` gleich hochzählen, dann `node test/sw-liste.mjs`.
Fragen-IDs (Merkmal + Nummer) stehen in gespeicherten Antworten: nie umsortieren oder löschen, nur anhängen.
