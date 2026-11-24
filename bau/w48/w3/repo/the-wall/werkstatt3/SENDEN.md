# An Claude schicken (js/senden.js)

Xander schickt aus der Werkstatt 3 eine Gesangsdatei privat an Claude, damit Claude Artefakte nachhört und nachbessert.
Das Modul nimmt **genau den Weg der Ton-Post** (`ton-post/ton.js`): dieselben Edge-Funktionen, derselbe private
Speicher, derselbe Code. Es gibt keinen neuen Schlüssel und keine neue Tabelle, und an den Rechten ändert sich nichts.

## So läuft eine Sendung

1. **Vorbereiten:** Dateikopf lesen (WAV: Kanäle, Rate, Bits, Dauer) und SHA-256 bilden (bis 64 MiB eingebaut, darüber
   stückweise in 4-MiB-Schritten, damit die Oberfläche flüssig bleibt).
2. **Anmelden:** `POST https://dbdnsryoivvezspgydpx.supabase.co/functions/v1/ton-ticket` als `text/plain` (kein
   CORS-Vorab-Check), Inhalt `{code, satzName, dateien:[…]}`. Antwort: `satzId` und je Teil eine signierte Upload-Adresse
   (2 h gültig).
3. **Hochladen:** Teile zu je 16 MiB per `PUT` (2 gleichzeitig, mit Fortschritt) in den privaten Bucket `ton-eingang`.
   Bei Netzfehlern wird bis zu ca. 3 Minuten wiederholt, abgelaufene Adressen werden erneuert, und nach 60 s ohne
   Fortschritt startet der Teil neu.
4. **Prüfen:** `POST …/ton-fertig` `{code, satzId, nr, teileDa}`. Der Server zählt selbst nach. Teile, die fehlen, werden
   nachgeschickt.

- **Code:** Das ist der Ton-Post-Code. Ton-Post und Werkstatt liegen beide auf `xanderfoxy.github.io`, deshalb teilen sie
  sich den gemerkten Code (`localStorage["ton-post-code"]`). Wer den Code in der Ton-Post schon einmal eingetippt hat,
  muss hier nichts mehr eingeben.
- **Herkunft:** Der Server lässt nur `https://xanderfoxy.github.io` zu. Von anderswo (z. B. einem lokalen Test-Server)
  kommt sofort `art:'herkunft'` zurück, statt minutenlang zu warten.
- **Fortsetzen:** Bricht die Verbindung ab, setzt ein neuer Tipp mit derselben Datei, Notiz und denselben Stellen dort
  fort, wo es aufgehört hat. Die Satz-ID bleibt gleich, und nur die fehlenden Teile gehen nochmal. Das klappt auch, wenn
  die UI den Blob neu baut, gilt aber nur, solange die Seite offen bleibt.
- **Doppelt:** Ein Doppeltipp führt zu einer einzigen Sendung. Wird derselbe Inhalt nochmal geschickt, kommt
  `{ok:true, doppelt:true}` zurück, ohne dass ein neuer Satz entsteht. `nochmal:true` erzwingt eine neue Sendung.

## Schnittstelle

```js
import { anClaude, codeGemerkt, codeMerken, codePruefen, zeitText } from './js/senden.js';

const r = await anClaude({
  blob,                    // Blob/File der bearbeiteten WAV (z. B. aus io.wav(...))
  name,                    // „The Wall – Haupt v12.wav“ (ohne Endung: .wav wird ergänzt)
  notiz,                   // Freitext, z. B. „klingt artefaktisch bei 1:23“
  stellen,                 // [83.2, {s: 95.4, text: 'zischt'}, …]  Sekunden; wird sortiert
  onFortschritt,           // ({schritt, anteil, gesendet, gesamt, text}) => …   anteil 0…1 über alles
  original, originalName,  // optional: Original-Aufnahme mitschicken
  code,                    // optional: neu eingetippter Code (sonst der gemerkte)
  signal,                  // optional: AbortSignal für „Abbrechen“
  zusatz,                  // optional: {version: 12, bericht: {...}} – geht als Zusatzfelder mit
});
// Erfolg: {ok:true, id, dateien:[{nr, name, rolle, bytes}], doppelt?}   id = Satz-ID im Speicher
// Fehler: {ok:false, art, text}   (wirft nie)
```

| `art` | wann | `text` (für die Anzeige, schon deutsch) |
|---|---|---|
| `code` | Code fehlt oder ist falsch | „Bitte einmal den Ton-Post-Code eintippen …“ bzw. „Der Code stimmt nicht …“ |
| `netz` | ca. 3 min keine Verbindung | „Keine Verbindung … nochmal tippen – schon Gesendetes wird übersprungen.“ |
| `platz` | Speicher voll (1 GB, geteilt mit der Ton-Post) | „… zu voll (frei 12,3 MB, nötig 98 MB) …“ |
| `drossel` | mehr als 20 Sendungen pro Stunde | „… in einer Stunde nochmal senden.“ |
| `abgebrochen` | `signal` ausgelöst | „Senden abgebrochen. Nochmal tippen setzt fort.“ |
| `herkunft` | Seite läuft nicht auf xanderfoxy.github.io | „… nur auf der echten Seite …“ |
| `eingabe` / `server` | leere Datei, Server lehnt ab oder antwortet nicht | Grund steht im Text |

Werte für `schritt`: `vorbereiten` (0–6 %), `anmelden`, `senden` (6–97 %, `text` z. B. „Sende 12,3 MB von 98,1 MB“),
`warten` (Netz hakt), `pruefen`, `fertig` (100 %). Es kommen höchstens 10 Meldungen pro Sekunde.

## Einbau in die UI (Vorschlag – Aussehen und Ort bestimmt die Werkstatt)

- Knopf **„An Claude schicken“** neben dem Speichern-Knopf. Darunter ein Fortschrittsbalken mit `anteil` und dem
  `text` als Statuszeile.
- **Notizfeld** („Notiz an Claude“), Platzhalter z. B. „klingt artefaktisch bei 1:23 …“.
- **„Stelle markieren“** nimmt die aktuelle Abspielzeit in die Liste auf. Die Liste zeigt Chips mit `zeitText(s)`, und ein
  Antippen entfernt den Chip wieder.
- **Code-Feld** nur zeigen, wenn `!codeGemerkt()` oder nach `art:'code'`.

```js
const stellen = [];
$('stelle').onclick = () => { stellen.push({ s: spieler.zeit() }); zeigeStellen(); };      // spieler.zeit() = Abspielzeit in s
function zeigeStellen() { $('stellen').textContent = stellen.map((x) => zeitText(x.s)).join(' · '); }

let ab = null;
$('anClaude').onclick = async () => {
  ab = new AbortController(); $('anClaude').disabled = true;
  const v = verlauf.aktuell();                                   // die Version, die gerade vorne liegt
  const blob = v.wavBlob || (v.wavBlob = wav(v.x, v.sr, 24));    // Blob merken: spart beim zweiten Tipp die Prüfsumme
  const r = await anClaude({
    blob, name: `The Wall – ${v.name}.wav`, notiz: $('notiz').value, stellen,
    code: $('code').value, signal: ab.signal, zusatz: { version: v.nr },
    onFortschritt: (f) => { $('balken').style.width = (f.anteil * 100).toFixed(1) + '%'; $('status').textContent = f.text; },
  });
  $('anClaude').disabled = false;
  $('status').textContent = r.ok ? (r.doppelt ? 'Schon angekommen.' : 'Angekommen – Claude kann es jetzt abholen.') : r.text;
  $('codeTeil').hidden = codeGemerkt() && r.art !== 'code';
};
```

Mit `codePruefen(code)` lässt sich ein frisch eingetippter Code vorab prüfen (`{ok:true, frei}`). Ein Code, der stimmt,
wird dabei gemerkt.

## Wo Claude die Datei findet

- **Supabase-Projekt:** `dbdnsryoivvezspgydpx`. Das Projekt `rolcktiryrvjzbwuvobb` wird nie benutzt.
- **Ton:** privater Bucket `ton-eingang`, Pfad `<satzId>/<nr>-<Name>/0001.part, 0002.part …`. Die Teile werden der Reihe
  nach aneinandergehängt. Danach muss der SHA-256 dem Wert in `sha256` entsprechen.
- **Metadaten:** Tabelle `privat.ton_eingang`, eine Zeile je Datei. Sie liegt im Schema `privat`: Es gibt kein REST
  darauf, und `anon` hat keine Rechte.
  - Spalten: `satz_id, satz_name („Werkstatt 3 – …“), nr, datei, pfad, groesse, sha256, format, kanaele, rate, bits,
    dauer_s, teile, teile_da, angekommen, eingang, extra`.
  - `extra` (jsonb) enthält:
    - `quelle: "Werkstatt 3"`, `rolle: "bearbeitet" | "original"` und beim Original `original_von`.
    - `zeitpunkt` (Ortszeit mit Versatz, z. B. `2026-11-24T00:12:05+01:00`) und `seite` (Pfad der Seite).
    - `notiz`. Ein langer Text wird in Stücke geteilt: `notiz`, `notiz_2` …, dazu `notiz_teile`. Der Grund: Der Server
      übernimmt jedes Zusatzfeld nur bis 2000 Zeichen JSON.
    - `stellen: [{s, zeit:"1:23,2", text?}]`. Lange Listen werden genauso geteilt.
    - Alle Felder aus `zusatz`.

## Wie Claude abholt

Das geht nur mit dem **Abhol-Schlüssel** der Ton-Post. Er steht nicht in der Seite und nicht im Repo, die Datenbank hält
nur einen PBKDF2-Prüfwert in `privat.ton_geheim`.

```sh
H="x-ton-holen: $TON_HOLEN"       # Abhol-Schlüssel der Ton-Post
F=https://dbdnsryoivvezspgydpx.supabase.co/functions/v1/ton-holen
curl -s -H "$H" "$F" > saetze.json                     # alle offenen Sätze; Download-Adressen je Teil, 1 h gültig
jq '.saetze[] | select(any(.dateien[]; .extra.quelle=="Werkstatt 3"))
    | {satzId, satzName, eingang, dateien: [.dateien[] | {nr, datei, angekommen, sha256, extra}]}' saetze.json
# Datei holen: teileUrls der Reihe nach laden und aneinanderhängen, dann prüfen
jq -r '.saetze[0].dateien[0].teileUrls[]' saetze.json | while read -r u; do curl -s "$u"; done > gesang.wav
sha256sum gesang.wav                                    # = .sha256
# Nach dem Abholen löschen (Ton und Metadaten), damit Platz frei wird:
curl -s -H "$H" -H 'content-type: application/json' -d '{"aktion":"geholt","satzId":"<satzId>"}' "$F"
```

Eine falsche Kopfzeile ergibt nur ein `404` ohne Hinweis. Nur nachsehen, ohne abzuholen, geht auch über die
Supabase-Werkzeuge, rein lesend:
`select satz_id, satz_name, nr, datei, groesse, angekommen, eingang, extra from privat.ton_eingang where extra->>'quelle' = 'Werkstatt 3' order by eingang desc;`
Den Ton selbst gibt es nur über `ton-holen`.

## Grenzen

- Höchstens 45 MiB je Teil. Das Modul nimmt 16 MiB.
- Speicher: 1 GB, davon 900 MB nutzbar, geteilt mit der Ton-Post.
- Höchstens 20 Sätze pro Stunde und 60 Dateien je Satz.
- Upload-Adressen gelten 2 h. Das Modul erneuert sie selbst.

## Geprüft

Am 24.11.2026 mit Node 22 und Chromium:

- **Nachgebauter Server** mit den Regeln von ton-ticket und ton-fertig:
  - 41-MB-WAV in 3 Teilen plus Original. Bytes und SHA-256 stimmen, die Zusatzfelder kommen vollständig an, eine lange
    Notiz wird in Stücke geteilt, die Stellen sind sortiert, der Fortschritt steigt stetig bis 100 %.
  - Netzfehler werden wiederholt. Nach einem Netzabbruch setzt der nächste Tipp fort und schickt nur den fehlenden Teil.
  - Abbrechen, abgelaufene Adressen, ein Teil, der fehlt, ein verschwundener Satz, Code falsch oder fehlend,
    Platz voll, Drossel und Server-Fehler 500 liefern jeweils die richtige Meldung.
  - Eine 70-MiB-Datei wird stückweise gehasht, und die Prüfsumme stimmt.
- **Chromium auf der Herkunft xanderfoxy.github.io:** XHR-Upload mit dem gemerkten Ton-Post-Code.
- **Live, nur lesend:** Die echte `ton-ticket`-Funktion mit absichtlich falschem Code liefert aus Node und aus Chromium
  (echte CORS-Antwort) `art:'code'`. Bei falschem Code schreibt der Server nichts.
- **Kein echter Upload:** Dafür bräuchte es Xanders Code.
