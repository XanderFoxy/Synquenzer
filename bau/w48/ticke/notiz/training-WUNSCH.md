# training – Wünsche an fremde Dateien (für den Zusammenbau)

1. **sw.js** (Offline-Vorrat): neue Datei `./module/training/aeste.js` in `DATEIEN` aufnehmen; `PRUEF` für alle Training-Dateien neu berechnen
   (`modul.js`, `plan.js`, `uebungen.js`, `quellen.js`, `stil.css`, `aeste.js` haben sich geändert). Ohne das lädt das Training offline nicht.
2. **module/liste.js** (Kommentar Zeile ~57, nur Doku): Routen unverändert; neu sind nur die Exporte `antwortListe`, `antwortSetzen`, `muster`, `aeste`.
3. **Muster-Modul**: Ast-Seiten `#muster/ast/training.<gruppe>` werden vom Training aus verlinkt (Bereich, Übung, Wachsen, Herausforderung).
   Meine `aeste()` haben ein Zusatzfeld `route` ('training/gruppe/<id>') – darf genutzt oder ignoriert werden.
4. Beim Test fehlten noch `module/muster/modul.js` und `module/muster/quellen.js` (404 in der Konsole, Kern-Quellenlader fängt es ab) – Sache des Muster-Agenten.
