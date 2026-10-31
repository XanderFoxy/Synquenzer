# Konzert-Alarm

Push aufs iPhone, sobald eine deiner Lieblingsbands

- ein **Konzert oder Festival in der Nähe von Döbeln** ankündigt (Push bis **200 km**: Leipzig, Dresden, Chemnitz, Halle, Berlin, Erfurt, Prag …), oder
- **etwas Neues veröffentlicht** (Album, EP, Single – keine Best-ofs, Remaster oder Neuauflagen).

Jede Neuigkeit kommt **genau einmal**, mit direktem Link zu Tickets bzw. zum Anhören.
Übersicht fürs Handy: **https://xanderfoxy.github.io/synquenzer/konzerte/**

## 1. Push abonnieren (einmalig, 1 Minute)

1. ntfy-App öffnen → **+** → Thema eintragen:

   ```
   xander-schnaeppchen-b5cbf4442aaa9734f3
   ```

   Server: `ntfy.sh` (Standard). Oder auf dem iPhone diesen Link öffnen: https://ntfy.sh/xander-schnaeppchen-b5cbf4442aaa9734f3 → „Abonnieren“.
2. Fertig. Beim allerersten Lauf kommt **eine** Nachricht „Konzert-Alarm ist aktiv“ (statt zig Einzelmeldungen für alles, was schon bekannt ist). Danach kommt jede neue Sache einzeln.

Das Thema ist geheim nur durch seinen zufälligen Namen. Wer es kennt, kann mitlesen. Wenn du ein anderes willst: neues Thema ausdenken, in `config.json` (`ntfy.topic`) und in `index.html` (`TOPIC`) eintragen – oder als Secret `NTFY_TOPIC` hinterlegen (Secret gewinnt).

## 2. Ticketmaster-Schlüssel (kostenlos, empfohlen)

Ohne Schlüssel laufen Releases und Festivalseiten trotzdem, aber die meisten Konzerttermine kommen über Ticketmaster (inkl. Eventim-naher Hallen wie Haus Auensee, Columbiahalle, Arenen und Festivals).

1. https://developer.ticketmaster.com → **Get your API key** → kostenlos registrieren.
2. Unter „My Apps“ den **Consumer Key** kopieren.
3. GitHub → Repo **Synquenzer** → *Settings* → *Secrets and variables* → *Actions* → **New repository secret**
   Name: `TM_KEY`, Wert: der Consumer Key.

Optionale Secrets: `NTFY_TOPIC` (anderes Thema), `NTFY_TOKEN` (falls du ein geschütztes ntfy-Thema nutzt).

## 3. Bands hinzufügen / ändern

Datei `konzerte/artists.json`. Neue Band = Eintrag kopieren, Namen ändern:

```json
{ "name": "Camouflage", "land": "DE" }
```

- `aliase`: weitere Schreibweisen, z. B. `["OMD"]`
- `land`: Herkunftsland (DE, GB, SE …) – hilft, die richtige Band bei gleichen Namen zu finden
- `aktiv: false`: Band stummschalten, ohne sie zu löschen
- `mbid` / `deezerId`: nur falls trotzdem die falsche Band erkannt wird (IDs stehen nach dem ersten Lauf in `ids.json` auf dem Daten-Branch)

**Bitte prüfen:** „Plastic Autumn“ (aus der Spracheingabe) gibt es so nicht. Eingetragen bleibt es trotzdem. Mögliche Kandidaten: **Frozen Plasma** (dt. Futurepop, liegt schon als `aktiv: false` bereit), **Autumn** (belg. Synthpop) oder **Plastic** (poln. Synthpop). Sag Bescheid, welche gemeint ist.

## 4. Einstellungen (`konzerte/config.json`)

| Feld | Bedeutung |
|---|---|
| `pushRadiusKm` (200) | Bis hierher gibt es Push |
| `listenRadiusKm` (400) | Bis hierher steht es auf der Seite (Schalter „Alle“, Markierung „weit“) |
| `releaseFensterTage` (120) | Releases, die älter sind, lösen keinen Push mehr aus |
| `releaseListeTage` (365) | So weit zurück zeigt die Seite Releases |
| `seiten` | Festival-/Hallenseiten, die nach Bandnamen durchsucht werden |

Festivalseiten (alle 3 h höflich ein Abruf): Wave-Gotik-Treffen (Leipzig), Dark Storm (Chemnitz), NCN (Deutzen), Gothic meets Klassik (Leipzig). Die URLs von Dark Storm, NCN und Gothic meets Klassik sind **bitte prüfen** – konnten hier nicht live getestet werden. Weitere Seite = Eintrag mit `url`, `stadt`, `lat`, `lon` ergänzen. Wird eine Band dort erwähnt, kommt „Festival: Band“ mit Link zur Seite (ohne genaues Datum).

## Wie es funktioniert

```
GitHub Actions (alle 3 h + manuell)  .github/workflows/konzerte.yml
  └─ node konzerte/scan/run.mjs
       ├─ Ticketmaster Discovery API   Konzerte + Festivals im Umkreis (Koordinaten → km)
       ├─ Festival-/Hallenseiten       Bandname im Programm?
       ├─ MusicBrainz                  Release-Groups (Album/EP/Single, ohne Compilations), 1 Anfrage/s
       └─ Deezer                       neue Alben/Singles + Hör-Link, Neuauflagen per MusicBrainz-Abgleich raus
  ├─ Dedupe gegen gesehen.json → ntfy-Push (max. 8 pro Lauf, Rest als Sammelmeldung)
  └─ JSON → Branch konzerte-daten (nicht main → die App-Seite wird nicht neu gebaut)
konzerte/index.html liest raw.githubusercontent.com/xanderfoxy/synquenzer/konzerte-daten/konzerte/data/*.json
```

- Fällt eine Quelle aus, laufen die anderen weiter; ihre alten Einträge bleiben auf der Seite stehen. Fehler stehen unten auf der Seite unter „Quellen“ und in `status.json`.
- Kann ein Push nicht zugestellt werden, wird er beim nächsten Lauf erneut versucht.
- Städte ohne Koordinaten: eingebaute Tabelle, sonst einmalig OpenStreetMap/Nominatim, gecacht in `geo.json`.
- Nicht genutzt: **Bandsintown** und **Songkick** – deren APIs sind nur für Künstler/Partner mit eigenem Schlüssel freigegeben; Scrapen wäre gegen die Nutzungsbedingungen. Eventim hat keine offene API.

## Starten

Der Workflow läuft automatisch, sobald `.github/workflows/konzerte.yml` auf **main** liegt (zeitgesteuerte Workflows laufen nur vom Standard-Branch). Ersten Lauf sofort: GitHub → *Actions* → **konzerte** → *Run workflow*.

Lokal testen (ohne Netz, mit aufgezeichneten Beispieldaten):

```
node --test konzerte/scan/test/*.test.mjs
DRY_RUN=1 node konzerte/scan/run.mjs   # echte Abrufe, Pushes nur in der Konsole, Daten in konzerte/data-lokal/
```

Roh-Mitschnitt für die Fehlersuche: *Run workflow* mit Haken **roh** → kein Push, nichts auf den Daten-Zweig; alle Quell-Antworten (je max. 2 MB, Schlüssel geschwärzt) und das berechnete Ergebnis landen auf dem Zweig **`roh-daten`** unter `konzerte/<Lauf-Nr.>/` (`index.json`, `quellen/`, `ausgabe/`). Lokal: `ROH_DIR=/tmp/roh node konzerte/scan/run.mjs`.

## Hinweis für den Einbau in main

Der Service-Worker der Synquenzer-App (`sw.js`, Scope `/synquenzer/`) behandelt **jede** Seitennavigation unter seinem Scope als App-Startseite: Er speichert die geladene Seite als Offline-Kopie der App und liefert bei langsamem Netz (> 3 s) die App statt dieser Seite. Wer `/synquenzer/konzerte/` öffnet, nachdem die App installiert ist, kann damit die Offline-Kopie der App überschreiben. Empfehlung (nicht Teil dieses Branches, weil `sw.js` hier tabu ist): in `sw.js` Navigationen nach `konzerte/` überspringen, z. B. `if (rest.startsWith('konzerte/')) return;` direkt nach der Berechnung von `rest`.
