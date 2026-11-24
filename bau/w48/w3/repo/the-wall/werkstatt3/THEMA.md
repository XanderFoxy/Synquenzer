# Farbschema „Konsole“ (Werkstatt 3)

Zweites, umschaltbares Schema neben „Klassisch“. Es soll sich wie ein Bedienpult anfühlen: dunkler Grund,
kräftige Pastell-Balken mit runden Ellbogen um die Bereiche, große Pillen-Knöpfe, klare Zustandsfarben und
sichtbares Leuchten beim Tippen und Ziehen. Die Gestaltung ist eigen: keine Logos, keine Marken- oder
Seriennamen. In der Oberfläche heißen die Schemata nur **Klassisch** und **Konsole**.

- `css/thema-konsole.css`: das Schema (28 KB, gzip 6,7 KB, kein JS, keine Webfonts)
- `css/muster-konsole.html`: Musterseite mit Pianorolle-Attrappe (Canvas), Knöpfen, Fähnchen, Versions-Layern und Umschalter

## Einbinden

```html
<head>
  <meta name="theme-color" content="#fbfaf7">
  <script>try{if(localStorage.getItem('w3-thema')==='konsole')document.documentElement.dataset.thema='konsole'}catch(e){}</script>
  <link rel="stylesheet" href="css/thema-konsole.css">
  <style>/* Klassisch wie bisher: :root{--bg:…;--fg:…} */</style>
</head>
```

- Die Zeile im `<head>` setzt das Schema vor dem ersten Bild, damit beim Laden nichts aufblitzt.
- Ohne `data-thema="konsole"` am `<html>` ändert die Datei nichts am Aussehen.
- Alle Konsole-Regeln hängen an `:root[data-thema=konsole]` (Spezifität 0,2,0). Damit gewinnen sie gegen `:root{…}`
  und einfache Klassenregeln der Seite, egal in welcher Reihenfolge die Dateien geladen werden. ID-Regeln (`#bSpiel{…}`)
  gewinnen weiter. Die sollen deshalb nur Variablen benutzen (`var(--gold)` usw.).
- **Anordnung ist schwach, Aussehen ist stark.** `position`, `display`, `margin`, `flex`, `gap` stehen in `:where(…)`
  mit Spezifität 0. Die Seite kann sie jederzeit überschreiben (sticky Kopf, absolut gesetzte Fähnchen, `display:none`).
  Farben, Rundungen, Schatten, Schrift und Mindestgrößen setzt das Schema.

## Umschalter (10 Zeilen)

Knöpfe: `<div class="seg" role="group" aria-label="Farbschema"><button type="button" data-thema-wahl="klassisch">Klassisch</button><button type="button" data-thema-wahl="konsole">Konsole</button></div>`

```js
// Thema-Umschalter „Klassisch“ ↔ „Konsole“ (Knöpfe mit data-thema-wahl="klassisch|konsole")
(function(){const K='w3-thema',H=document.documentElement;
function setze(t){H.dataset.thema=t;try{localStorage.setItem(K,t)}catch(e){}
  document.querySelectorAll('[data-thema-wahl]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.themaWahl===t)));
  const m=document.querySelector('meta[name=theme-color]');if(m)m.content=getComputedStyle(H).getPropertyValue('--grund').trim()||m.content;
  document.dispatchEvent(new CustomEvent('thema',{detail:t}))}   // Canvas: Farben neu lesen und neu zeichnen
let t='klassisch';try{t=localStorage.getItem(K)||t}catch(e){}
setze(t==='konsole'?'konsole':'klassisch');
document.addEventListener('click',e=>{const b=e.target.closest('[data-thema-wahl]');if(b)setze(b.dataset.themaWahl)});
document.addEventListener('touchstart',()=>{},{passive:true})})(); // ohne das zeigt iOS kein :active-Leuchten
```

Für den Canvas: `document.addEventListener('thema', () => { farben(); zeichne(); })`. Das ist dieselbe Lese-Funktion wie in
Werkstatt 2 (`getComputedStyle(document.documentElement).getPropertyValue('--name')`). Die Farben werden nur beim
Umschalten gelesen, nie pro Bild.

## Variablen

Werte der Konsole. In Klassisch zeigt ein Brücken-Block mit Spezifität 0 (`:where(:root)`) die neuen Namen auf die
alten Werkstatt-2-Namen (`--grund` → `--bg`, `--text` → `--fg`, `--layer-1` → `--c-orig` …). Klassisch sieht damit aus wie
bisher, und die UI kann überall die neuen Namen benutzen. Definiert `index.html` die neuen Namen selbst in `:root`,
gewinnen deren Werte.

| Gruppe | Variable | Konsole | Wofür |
|---|---|---|---|
| Palette | `--k-orange` `--k-flieder` `--k-hellblau` `--k-pfirsich` | `#ff9f45` `#c3a2f2` `#8ec5ff` `#ffbf9b` | Hauptakzente: Balken, Pillen |
| | `--k-sand` `--k-mint` `--k-rosa` `--k-rot` `--k-cyan` `--k-sonne` | `#ecd28c` `#76e2b3` `#f59cc2` `#ff6e5f` `#62d8ff` `#ffd65e` | Nebenakzente und Zustände |
| Flächen | `--grund` `--flaeche` `--flaeche2` `--flaeche3` | `#04050a` `#0e1019` `#181a28` `#232639` | Seite, Karte, Feld, Segment |
| | `--linie` `--linie2` | `#2a2d43` `#3f4363` | Haarlinien |
| Schrift | `--text` `--text-leise` `--text-auf-farbe` | `#f2eee6` `#a9a5c0` `#07070d` | Text, Nebentext, Text auf Pastell |
| | `--akzent` | = Orange | Hauptakzent (Klassisch: `--gold`) |
| Zustände | `--z-aktiv` | Cyan `#62d8ff` | Schalter an (`aria-pressed=true`) |
| | `--z-gewaehlt` | Sonne `#ffd65e` | eine Wahl aus mehreren, Auswahlbereich |
| | `--z-laeuft` / `--z-ok` | Grün `#6be3a4` | spielt, verbunden, gespeichert |
| | `--z-fehler` / `--z-warn` | `#ff6e5f` / `#ffb04a` | Fehler / prüfen |
| | `--z-aus` `--z-aus-text` `--z-fokus` | `#2a2c3c` `#9a97b1` `#fff` | gesperrt, Tastaturfokus |
| Leuchten | `--leuchten-aktiv` `--leuchten-gewaehlt` `--leuchten-laeuft` `--leuchten-fehler` | box-shadow | fertige Schatten pro Zustand |
| Rahmen | `--rahmen-arm` `--rahmen-balken` `--rahmen-ellbogen` | `16px` `16px` `34px` | Arm links, Balken oben, äußere Rundung |
| | `--rahmen-fuge` `--rahmen-kappe` `--rahmen-innen` | `5px` `30px` `10px` | Lücke vor der Kappe, Kappenbreite, Innenabstand |
| Bedienung | `--tipp` `--tipp-klein` `--pille-pad` | `48px` `44px` `18px` | Tippflächen (nie unter 44 px) |
| | `--knopf-schreibweise` | `uppercase` | auf `none` setzen für normale Schreibung |
| Schrift | `--schrift` | Avenir Next Condensed → Bahnschrift SemiCondensed → Roboto Condensed → sans-serif-condensed → Arial Narrow → … → system-ui | schmale Systemschrift, wo es eine gibt |
| | `--schrift-zahl` | = `--schrift` + `tabular-nums` | Zeit- und Taktanzeigen |
| Bewegung | `--dauer-kurz` `--dauer` `--kurve` | `80ms` `160ms` `cubic-bezier(.2,.8,.2,1)` | kurze Übergänge |
| Pianorolle | `--rolle-grund` `--rolle-zeile` `--rolle-zeile-dunkel` | `#07080f` `#0e1020` `#090a13` | Grund, Zeilen weißer und schwarzer Tasten |
| | `--tasten` `--tasten-text` | `#121423` / leise | Tastenspalte links |
| | `--lineal` `--lineal-text` | Pfirsich / dunkel | Zeitlineal oben (Taktzahlen) |
| Raster | `--raster-fein` `--raster` `--taktstrich` | 8 % / 20 % Blaugrau, Orange 62 % | Sechzehntel, Schläge, Taktstriche (2 px) |
| Noten | `--note` `--note-rand` `--note-text` | Layer 1, Weiß 45 %, dunkel | Notenblob, Kante, Silbe |
| | `--note-gewaehlt` | `#fff` | Ring und Glühen um gewählte Noten (shadowBlur ≈ 10) |
| | `--note-ziehen` `--note-ziehen-rand` | Cyan 28 % / Cyan | Geist beim Ziehen (gestrichelt) |
| | `--tonlinie` | Weiß 85 % | gesungene Tonhöhe |
| Zeit | `--spielkopf` | = läuft (Grün) | Abspielposition mit Glühen |
| | `--bereich` `--bereich-rand` | Sonne 12 % / Sonne | Auswahlbereich |
| Wellen | `--welle` `--welle-fuell` `--welle-mitte` | Hellblau / 20 % / 28 % | Umriss, Füllung, Mittellinie |
| Versions-Layer | `--layer-1` … `--layer-6` | Orange, Flieder, Hellblau, Mint, Rosa, Sand | 1 = neueste Fassung, 6 = älteste |
| | `--layer-alpha-1` … `--layer-alpha-6` | `1` `.72` `.56` `.44` `.34` `.26` | Deckkraft beim Staffeln (Zwiebel) |
| Alte Namen | `--bg --fg --mut --lin --lin2 --gold --goldfg --hi --bar --karte --warn --blau --band1 --band2 --ok --rot --welle --bereich` | auf die neuen Werte gelegt | übernommener Werkstatt-2-Code passt sofort |
| | `--c-orig --c-rein --c-tim --c-ton --c-ende --c-neu --c-spaet --c-frueh --c-pruef` | Pastell-Gegenstücke | Werkstatt-2-Schichtfarben |

Kontrast, nachgerechnet (WCAG): Text auf Grund 17,6 : 1, leiser Text 8,6 : 1 (auf `--flaeche2` 7,3 : 1), dunkler Text auf
jeder Pastell-/Zustandsfarbe mindestens 7,3 : 1 (Fehler-Rot), Pastell als Schrift auf Grund mindestens 7,4 : 1, gesperrter
Text 4,9 : 1. Das liegt überall über 4,5 : 1.

## Klassen

Die Farbe eines Bausteins kommt aus `--farbe` am selben Element. Setzen über Helfer `.f-orange .f-flieder .f-hellblau
.f-pfirsich .f-sand .f-mint .f-rosa .f-rot` oder `.layer-1` … `.layer-6` (setzt auch `--farbe-an`), oder direkt mit
`style="--farbe:var(--k-mint)"`. Jeder Baustein bringt seine Grundfarbe selbst mit und erbt nichts vom Rahmen.

| Klasse | Aussehen | Markup |
|---|---|---|
| `.rahmen` | Balken oben + Arm links, runder Ellbogen, Kappe rechts. Grundfarbe Orange | `<section class="rahmen f-flieder"><h2 class="rahmen-titel">Versionen</h2><span class="rahmen-info">6 Lagen</span>…</section>` |
| `.rahmen.unten` | Ellbogen unten links, Titel im unteren Balken | |
| `.rahmen.rechts` | gespiegelt: Arm rechts, Kappe links | |
| `.rahmen.flach` | nur ein Balken, kein Arm (kleine Bereiche) | |
| `.rahmen-titel` / `.rahmen-info` | Schrift im Balken (bricht ihn), links Titel, rechts Info | `::before` und `::after` des Rahmens sind belegt |
| `.pille` | gefüllte Pille, Grundfarbe Flieder, ≥ 48 px, Großbuchstaben | `<button class="pille" type="button">Einrasten</button>` |
| `.pille.haupt` | Orange, 52 px, für Spielen/Senden | `.pille.haupt.rund` = runder 56-px-Knopf |
| `.pille.klein` / `.rund` / `.umriss` | 44 px / Kreis für Symbole / hohl | `<button class="pille rund" aria-label="Zurück"><svg …></button>` |
| `.pille.ende-links` / `.ende-rechts` | nur ein Ende rund (Anschluss an Balken) | |
| `.pille.schalter` oder `[aria-pressed]` | Lämpchen links. Aus = hohl mit Rand in `--farbe`, an = gefüllt + Leuchten | `<button class="pille" aria-pressed="false">Klick</button>` |
| `button` ohne `.pille` | hohle Pille (dunkel, Pfirsich-Schrift), dieselben Zustände | für alles, was nicht umgebaut wird |
| `.leiste` | Reihe mit 8 px Abstand, bricht um; `.dehnen` füllt den Rest | `<div class="leiste">…</div>` |
| `.seg` | verbundene Segmente (außen rund, innen 6 px), gewählt = Sonne | `<div class="seg" role="group"><button aria-pressed="true">1/8</button>…</div>` |
| `.titel` | kleine Beschriftung in Großbuchstaben in Leisten | |
| `.fahne` | Etikett (26 px, Pastell, Großbuchstaben); `.notiz .info .neu .gewaehlt .gut .warn .fehler` | `<span class="fahne notiz">Notiz</span>` |
| `.fahne.stab` | Fahne an einer Stange (`--stab`: Länge, Standard 30 px), Tippfläche ≥ 44 px | absolut über der Pianorolle setzen |
| `.anzeige` | Pillen-Anzeige für Zeit/Takt in Orange, Ziffern gleich breit; `small` = Beschriftung | `<span class="anzeige"><small>Takt 10 · 2</small>0:42.18</span>` |
| `.meldung` | Statuszeile mit Lämpchen; `.gut .warn .fehler .laeuft` (pulsiert) | `<span class="meldung gut">Gespeichert</span>` |
| `.led` | einzelnes Lämpchen; `.gut .warn .fehler .laeuft .aktiv` | |
| `.buehne` | Canvas-Behälter, Rand liegt über dem Canvas; `.zieht` = hellblaues Leuchten, `.fehler` = rotes | beim Ziehen `.zieht` setzen, beim Loslassen entfernen |
| `.karte` / `.schwebe` / `.dock` | Fläche / schwebendes Feld (Lupe, Menü) / Leiste unten | |
| Eingaben | `input[type=text/search/number]`, `textarea`, `select`: dunkles Feld, Fokus = Cyan-Leuchten | |
| `input[type=range]` | Pillen-Griff in Orange, beim Ziehen Cyan; Füllstand per `el.style.setProperty('--wert', p+'%')` | |

### Zustände (gilt für `.pille`, für `button` und, wo es passt, für `.fahne`, `.meldung`, `.led`)

| Zustand | Auslöser | Aussehen |
|---|---|---|
| gedrückt | `:active` oder `.gedrueckt` (per JS bei pointerdown) | kleiner (scale .95), heller, Leuchtring sofort an; klingt in 220 ms aus |
| aktiv (Schalter an) | `[aria-pressed=true]`, `.aktiv` (`.an` bei `button`) | Cyan gefüllt + Leuchten, Lämpchen voll. Bei `.layer-n` in der Layer-Farbe |
| gewählt | `[aria-selected=true]`, `[aria-current]`, `.gewaehlt`; in `.seg` auch `aria-pressed=true` | Sonnengelb + Ring |
| läuft | `.laeuft` | Grün, Leuchtring pulsiert (nur Deckkraft, 1,4 s) |
| Fehler | `.fehler`, `[aria-invalid=true]` | Rot + kurzes Zucken (380 ms, einmal) |
| aus | `:disabled`, `[aria-disabled=true]` | Grau, kein Leuchten, keine Bewegung |
| bestätigt | `.blitz` kurz setzen (z. B. nach dem Speichern) | Ring blitzt einmal auf (700 ms) |
| Fokus | `:focus-visible` | weißer Ring, 3 px |

Bewegung: Animiert werden nur `transform`, `opacity` und `filter` an kleinen Elementen, das ist billig für die GPU. Kein
`transition: all`, kein `backdrop-filter`. Mit `prefers-reduced-motion: reduce` entfallen alle Übergänge, das Pulsieren und
das Verkleinern. Das Leuchten bleibt als ruhiger Rand.

## Canvas: was die Pianorolle zeichnet

Reihenfolge wie im Muster (`css/muster-konsole.html`, Funktion `zeichne()`):

1. Zeilen `--rolle-zeile` / `--rolle-zeile-dunkel`, dann `--bereich`
2. Raster `--raster-fein` (Sechzehntel), `--raster` (Schläge), `--taktstrich` (2 px), dann die Kanten von `--bereich-rand`
3. Tastenspalte `--tasten`, Lineal `--lineal` mit Taktzahlen in `--lineal-text`
4. ältere Fassungen hinten: `--layer-6` … `--layer-2` mit `globalAlpha = --layer-alpha-n`, je Lage leicht versetzt (gestaffelt)
5. aktuelle Fassung `--note` (= `--layer-1`) mit Kante `--note-rand`, gewählte Note mit Ring und Glühen `--note-gewaehlt`
6. gezogene Note als Geist `--note-ziehen` mit gestricheltem Rand `--note-ziehen-rand`
7. `--tonlinie`, danach die Silben `--note-text` (bleiben lesbar)
8. `--spielkopf` mit `shadowBlur` ≈ 12, darunter die Welle: `--welle-mitte`, `--welle-fuell`, `--welle`

`shadowBlur` nur für Spielkopf und gewählte Note benutzen, nicht für alle Noten. Das hält das Zeichnen schnell.

## Hinweise

- Die Rahmen brauchen etwa 26 px links (Arm + Innenabstand). Auf 428 px Breite bleiben bei 12 px Seitenrand 378 px Inhalt.
- `.rahmen` setzt sein `padding` selbst. Eigener Innenabstand gehört an ein Kind-Element.
- In Konsole gilt immer `color-scheme: dark`, unabhängig vom System-Dunkelmodus. Klassisch folgt weiter dem System.
- Im Muster-Foto (Linux) fehlt eine schmale Schrift, dort steht Inter. Auf iPhone/Mac greift Avenir Next Condensed,
  auf Windows Bahnschrift, auf Android sans-serif-condensed.
