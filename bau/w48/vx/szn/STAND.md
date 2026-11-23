# SZN – Stand (fertig)
Bau: `python3 apply.py <eingang> <ausgang>` (Eingang 4.88.0 md5 695af0504463a6385e21dc94e55b00c9, Ausgang hier `index.html`, md5 7c866eb7b57260fed5029e15e4ac2a3d).
Drei Anker, je genau 1×:
- CSS `block.css` (/* SZN-BEGIN/-END */) direkt nach `.scn .sc:empty{display:none}` (Regel der Akkord-Zeile im Szenen-Kopf).
- JS `block.js` (/* SZN-BEGIN/-END */: `sznName`, `sznHead`) direkt vor `function buildGrid(){`.
- Haken in renderGrid nach `if(b._scT!==scl){b._scT=scl;b._sc.textContent=scl;}` → `sznHead(b,s);/*SZN*/`.

## Was
- Name = `S.scenes[s].name` (getrimmt); leer oder Standard „Szene N“ = kein Name (wie mtxSceneSheet/mtxSceneFree).
- Span `.sn` wird erst angelegt, wenn eine Szene einen Namen hat (zwischen `.st` Nummer und `.sk` Tonart) → ohne Namen DOM und Bild wie 4.88.
- 9px/600, var(--font-ui), var(--text) 85 %, nowrap + ellipsis, max-width 100 %. Mit Name UND Akkord-Zeile: Klasse `snf` → gap 0 (sonst 1 px zu eng).
- Bei Namen zusätzlich `title` „Szene N · Name“ (Maus-Hinweis bei gekürztem Namen).
- Keine neue Einstellung, keine Änderung an gespeicherten Projekten (Namen gab es schon; Lader kürzt wie bisher auf 24 Zeichen).
- Hinweis: Das Start-Demo-Projekt hat schon Namen („Groove“, „Break“) → die zeigt der Kopf jetzt beim ersten Start an (gewollte Wirkung der Funktion).

## Tests
- **Kern-Test-Datei: `szn-test.cjs`** – `node szn-test.cjs <port> [basis-ordner] [neu-ordner]`, Server-Wurzel `srv/` (python3 -m http.server im Ordner srv/), darin `basis/` (4.88.0) und `neu/`, je index.html + version.json.
  Gegen andere Fassung: Ordner unter srv/ anlegen (index.html + version.json) und als 3./4. Argument übergeben. Hilfsdatei `pngdiff.cjs` (Pixel-Vergleich im Browser).
- Ausgabe `szn-test.out`: **ALLE OK (32/32)**, hochkant 428×926 und quer 926×428, Touch, isMobile:
  Start-Geometrie gleich; ohne Namen Szenen-Köpfe pixelgleich (Bild-Vergleich) + Geometrie gleich; „Strophe“ unter der Nummer;
  langer Name mit … und innerhalb der Kachel; „Szene 4“/leer → kein Feld; nichts ragt aus dem Kopf; Kopf-/Zellen-Geometrie mit Namen = 4.88;
  Speichern/Laden behält Namen; Name + Tonart + Akkord-Zeile im Rahmen; Tipp auf Namen startet Szene wie 4.88; Halten öffnet Szenen-Blatt wie 4.88;
  Ziehen am oberen Kopfrand (Szene 1 → 2/3) verschiebt wie 4.88 und Namen wandern mit; keine Seitenfehler.
- Fotos: `foto-vorher.png` / `foto-nachher.png` (hochkant), `-quer.png` (quer); Projekt mit Namen Strophe/Refrain…/Bridge/Outro.
- Pflicht (`pflicht.out`): „MS 2000“ 1×, „  live: true,“ 1×, verbotene Zahlen 0×, doppelt.js neu [], Marker je 2 (JS+CSS).

## Grenzen
- Ziehen startet (wie in 4.88) nur am oberen Rand des Kopfs; auf dem Namen selbst = Tippen/Halten wie auf der Nummer.
- Der erste Bild-Vergleich der ganzen Kopfzeile inkl. Ecke (SONG/SZ-Knopf) war einmal um 44 Pixel im SZ-Knopf verschieden (dortige Animation, nicht von SZN) – Vergleich daher auf die Szenen-Köpfe begrenzt.
