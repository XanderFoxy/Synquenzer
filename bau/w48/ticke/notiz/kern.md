# kern – Bericht (24.11.2026)

Arbeitskopie: `neu/ticke`. Vorlage `alt/ticke` unverändert. sw.js nicht angefasst (siehe kern-WUNSCH.md).

## Geändert (Datei-Liste)

| Datei | Was |
|---|---|
| `antworten.js` (NEU) | Seite „Deine Antworten“ (`#antworten`, `#antworten/<modulid>`, optional `?offen=1`) |
| `seiten.js` | Route `antworten` (lädt antworten.js erst beim Öffnen), zwei große Karten oben auf Start, Quellen-Seite „Woher das Wissen kommt“ ohne Links, Hinweise „Richtungen statt Messwerte“, Bewertungs-/Spiel-Sprache raus, Test-Seite `#muster` → `#bausteine` |
| `kern.js` | NAV 6 Reiter (Muster an 2. Stelle, Profil+Was passt = ein Reiter mit Unterreitern), `kern.exporte(id)`, Router: `antworten`, `bausteine`; `muster` gehört jetzt dem Modul; Quellen-Blatt ohne Link, mit Erklärung |
| `ui.js` | neu `richtung()`, Symbole `muster` (Baum) und `stift`; `band()` bleibt, aria-label ohne Zahlen |
| `mass.js` | WORTE ohne Vergleich mit anderen; neu `mass.deutlich(stufe)`, `mass.richtung(stufe, pole)`, `mass.wort(stufe, pole)` |
| `quellen.js` | alle 28 `url` entfernt, je Quelle `erklaerung` (3–4 Sätze); soto2019-Notiz ohne Prozent |
| `weg.js` | Kurztexte ohne Mess-Sprache, Kommentar „Orientierung, keine Stufen zum Aufsteigen“ (Logik/Speicherformat unverändert) |
| `stil.css` | Unterreiter-Zeile (Grid-Zeile 2, hochkant und quer), Start-Karten, `.richtung`, Antworten-Seite, Quellen-Erklärung, `.antwort[aria-pressed]`; Fehler der Vorlage behoben: Kachel „Entweder – oder“ auf der Start-Seite (neu) war 756 px hoch → jetzt 123 px; Links in „Alle Fragebögen einzeln“ jetzt 44 px hoch |
| `index.html` | meta description neu, `<nav id="unterreiter">`, modulepreload `antworten.js` |
| `manifest.webmanifest` | description neu |
| `module/liste.js` | Eintrag `muster` (genau wie verlangt; nach `interessen`, ohne start/bogen) |

## Für die Module: neue Kern-Bausteine

### `kern.exporte(id)` → Promise der ganzen Modul-Datei (alle benannten Exporte)
Lädt wie `kern.modul(id)` (Schema-Umzug und `start()` inklusive), gibt aber `antwortListe`, `antwortSetzen`, `muster`, `aeste` … zurück. Das Muster-Modul kann damit sammeln statt selbst `import()` zu machen (beides geht).

### `ui.richtung({ titel, pole, deutlich, zu, text, erklaeren, tag })`
Zwei gleichwertige Pole als Worte, dazwischen eine ruhige Linie – keine Zahl, keine Markierung, kein Anteil. Der Satz trägt die Bedeutung.
- `pole`: `[a, b]`, je Text oder `{ name, text }`
- `deutlich`: `'klar' | 'leicht' | 'beides'`
- `zu`: `0 | 1` – zu welchem Pol es geht (hebt ihn hervor; bei `'beides'` werden beide gleich betont; weglassen = keiner)
- `text`: der Satz in Worten; `titel` optional; `erklaeren: true` zeigt die Pol-Texte gleich groß nebeneinander; `tag` z. B. `'li'`

```js
import { richtung } from '../../ui.js';      // oder kern.ui.richtung
el.innerHTML = richtung({
  titel: 'Offenheit',
  pole: [{ name: 'Neugier auf Neues', text: 'Ideen, Kunst, Fragen, die noch keiner gestellt hat.' },
         { name: 'Halt im Bewährten', text: 'Was sich bewährt hat, Verlässlichkeit, Tiefe statt Breite.' }],
  deutlich: 'leicht', zu: 0,
  text: 'Leicht in Richtung Neugier auf Neues – das Bewährte gehört trotzdem auch zu dir.',
  erklaeren: true
});
```
Mit einer Stufe −2…2 (z. B. aus `mass.stufeT`): `const r = kern.mass.richtung(stufe, ['Neugier auf Neues', 'Halt im Bewährten']); richtung({ titel, pole, ...r, text: r.satz })` → `{ deutlich, zu, satz }`.
Ansehen: `#bausteine?test=1` (hell/dunkel, Fotos `fotos/kern-06…`, `kern-18…`). CSS-Klassen: `.richtung`, `.richtung-pol(.an/.beide)`, `.richtung-linie`, `.richtung-satz`, `.richtung-erkl`.

### „Deine Antworten“ (`antworten.js`) – wie Module erscheinen
- Lädt alle Einträge aus `MODULE` parallel über `kern.exporte`; jeder Teil erscheint, sobald er da ist (zugeklappte `<details>` mit Stand „x beantwortet · y noch offen“).
- `antwortListe(k)` darf ein Array oder Promise liefern; Zeilen ohne `id`/`frage` werden übersprungen; Zusatzfelder stören nicht.
- Blatt je `art`: `wahl` → Optionen als Knöpfe (Tipp = gespeichert), `text` → Textfeld, `zahl` (Komma erlaubt) / `zeit` → Eingabe + Speichern (Enter geht). `wahl` ohne `optionen` → nur Hinweis + Link in den Fragebogen.
- „Vorher“: neueste 5 nach `zeit`, je mit „Wieder nehmen“; in der Zeile klein „vorher: …“. „Antwort löschen“ → `antwortSetzen(k, id, null)`. „Im Fragebogen ansehen“ → `route`.
- Danach ruft die Seite `antwortListe` des Teils neu auf und zeichnet nur diesen Teil neu (Fokus bleibt auf der Zeile).
- Kein Export → „Antworten dieses Teils änderst du direkt im Fragebogen“ (bzw. „direkt dort“) + Link auf `fragen[0].route` oder `routen[0]`. Modul lädt nicht → Hinweis + „Nochmal versuchen“.
- Suche (ohne Umlaute/ß-Unterschied) und „Nur offene“ blenden nur Zeilen aus (kein Neuzeichnen), passende Teile klappen auf.

## Getestet (Zahlen)

Server: `python3 -m http.server` Port 8998 (Ordner `neu`, App `/ticke/`) und 8969 (Test-Kopie `werkzeug/kern-test`: Kern-Dateien von mir + Module der Vorlage + **Test-Stub** `module/muster/modul.js` mit dem Export-Vertrag, weil das echte Muster-Modul beim Test noch fehlte). Playwright chromium, 428×926 hasTouch/isMobile, Service Worker blockiert.

- `werkzeug/kern-pruef.js` (Test-Kopie mit Stub): **60 ok, 0 nicht ok, 0 Seitenfehler/console.error/HTTP-Fehler.** Darin u. a.: 6 Reiter je 71×64 px, Schrift einzeilig auch bei „Sehr groß“; Start (neu und begonnen) zwei Karten oben; `#profil`/`#passt` Unterreiter 47 px hoch, Reiter „Profil“ bleibt aktiv, kein Zurück-Pfeil; Quellen-Seite 120/120 Einträge mit Erklärung, 0 Links nach draußen auf allen Kern-Seiten; Wortwahl-Scan (Punkte, %, Prozent, die meisten, in Folge, Level, Abzeichen, Rang, Perzentil, Wahrscheinlichkeit, „Mit Claude“) auf 10 Seiten sauber; Antworten: Wahl setzen → Ergebnis `muster` neu, ändern → „vorher“ sichtbar, „Wieder nehmen“, Text, Zeit (Enter), Zahl mit Komma, löschen → „noch offen“, Stand „4 beantwortet · 1 noch offen“, „Nur offene“ 1 Zeile, Suche „ratsel“ findet „Rätsel“, kein Treffer → Hinweis, nach Neuladen (mit Einwilligung) gespeichert, `#antworten/muster` springt (Teil offen, oben 0 px, Fokus auf summary), Tastatur Enter/Escape; Vorlage-Daten (Format 1: Einwilligung, m.weg, m.training mit 2 Tagen, passt.wachstum) laden ohne Fehler, Training ohne Serien-Zähler; quer 926×428 dunkel: Leiste links, Unterreiter über dem Inhalt.
- `werkzeug/kern-quer.js`: 12 Kern-Seiten × hochkant/quer = **24 Ansichten, 0 mit Überlauf**, 0 Fehler. Einzige kleine Tippfläche: der Schalter „Auf diesem Gerät merken“ (54×32, aber die ganze Zeile ist als Label antippbar, wie in der Vorlage).
- `werkzeug/kern-live.js` gegen die echte Arbeitskopie (Stand während der Arbeit): bigfive 30, interessen 43, passt 6, training 2, spiel 55 Antworten werden gelistet; bigfive-Antwort im Blatt gesetzt → Zeile „stimmt eher“, Stand „1 beantwortet · 29 noch offen“. muster: Datei fehlte noch → „gerade nicht geladen“ + Nochmal-Knopf. textspiegel: noch kein Export → Hinweis + Link.
- `kern-pruef.js` gegen die echte Arbeitskopie: 45 ok, 0 nicht ok; die 9 Fehlermeldungen stammen alle aus fremden, gerade entstehenden Dateien (404 `module/muster/modul.js` + `quellen.js`; `module/passt/modul.js` importierte `wortT`, das `regeln.js` nicht mehr hatte).
- `node --check`: kern.js, ui.js, seiten.js, weg.js, mass.js, quellen.js, antworten.js, module/liste.js – alle ok. Start bis h2: ~110 ms lokal.
- Fotos: `fotos/kern-01…19` (hell, dunkel, quer).

## Offen / ehrlich

- **sw.js** braucht `./antworten.js` und die neuen `module/muster/*`-Dateien in DATEIEN/PRUEF und eine neue Fassung (V = VERSION in kern.js, dort steht noch 0.2.1) → kern-WUNSCH.md.
- Mit dem **echten** Muster-Modul ist `#antworten` erst teilweise getestet (es fehlte noch); getestet ist der Vertrag mit einem Stub.
- Die Quellen der **Module** (module/*/quellen.js) zeigen auf der Seite „Woher das Wissen kommt“ ihre `erklaerung`, sobald die Modul-Agenten sie eintragen; sonst die `notiz`.
- Vorschläge, die sichtbar etwas ändern würden (CLAUDE.md Regel 3: erst fragen, nicht gebaut):
  1. Die Kachel „Entweder – oder“ hat noch den bunten Spiel-Verlauf (orange-pink-lila). Ruhiger wäre die normale Kachel-Farbe – passt zu „nicht wie ein Spiel“.
  2. „Dein Weg“ könnte einen Schritt „Dein Muster“ bekommen (nach der Profil-Karte). Bewusst nicht gebaut: ändert die Schritt-Zahl und den Ablauf.
  3. Die alte Kurzform-Profil-Karte (`band()`) wird von Modulen evtl. noch genutzt; `band()` bleibt, zeigt aber für Screenreader keine Zahlen mehr.
- Entfernt aus dem Kern: Serien-Zeile „Training: x Tage in Folge“ (jetzt nur „Heute schon etwas gemacht“ / „Ein kleiner Vorschlag für heute“), gelber „fraglich“-Punkt bei Big Five auf der Start-Seite, „Mit Claude tiefer lesen“-Satz in den Hinweisen, Band-Beispiel „eher höher als die meisten“.
- Der Test-Seiten-Name `#muster?test=1` heißt jetzt `#bausteine?test=1` (`#muster` gehört dem Modul).
