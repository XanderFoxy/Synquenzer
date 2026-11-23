# KKS – Stand (fertig)
Bau: `python3 apply.py <eingang> <ausgang>` (Eingang 4.88.0, md5 695af0504463a6385e21dc94e55b00c9; Ausgang hier `index.html`, md5 bd0d0ab9a14eeb310630fad54c2f67bf).
Änderungen (je Anker genau 1×):
1. Block `block.js` (`/* KKS-BEGIN … KKS-END */`, JS + kleines CSS per `<style id="kks-css">`) direkt vor `function spk7NormWt(w,base){` (gleicher Skript-Block wie der Klangkorn-Kern).
2. `function pageWt(pg,i){` + Haken `if(typeof kksPage==='function'&&kksPage(pg,i))return;/*KKS*/` – Klangkorn-Klang (engine wt mit `p.wt.h.take`) → Seite KORN.
3. `subTabsFor`: Unterreiter heißt bei Klangkorn „KORN“ statt „WT“ (`/*KKS*/`).
4. `const SPK7_ROW=false;` → `true` (Knopf „Als Klangkorn“ als 3. Zeile im Aktionsfeld; Layout war in SPK7/SPK13 schon vorbereitet).

## Was
- Seite KORN: Modus Körnchen|Schleife (makeSeg), Regler Position (`wt.pos`), Bewegung, Korngröße, Dichte, Kornform, Streu Ort, Streu Ton, Breite, Lautst.
  (alle `p.wt.h.*`, Bereiche/Anzeige aus SPK7_RG/SPK7_SL), Cutoff, Resonanz, A, D, S, R (vorhandene Klang-Parameter, die spk7Eff schon auf das Klangkorn abbildet).
  Schleife: Korngröße/Dichte/Kornform/Streu Ton „inert“ (wie im Blatt ausgeblendet). ↶ über soundUndo. Live: neue Werte gehen sofort an die Spur-Engine (`kksLive`).
- Quer: Modus-Feld steht in der 2. Reglerzeile (CSS nur für landscape), sonst würde es unter 32 px gedrückt.
- Keine Datenänderung: gespeicherte Projekte laden wie vorher; ohne Klangkorn-Klang alles wie 4.88.

## Tests
- **Kern-Test-Datei: `kks-test.cjs`** – `node kks-test.cjs <port> [basis-ordner] [neu-ordner]` (Standard `basis`/`neu`), Server-Wurzel `srv/`
  (`cd srv && python3 -m http.server <port>`; je Ordner `index.html` + `version.json` {"version":"4.88.0"}). Gegen andere Fassung: deren index.html nach
  `srv/<ordner>/` legen und den Ordnernamen als 4. Argument geben. Ausgabe `kks-test.out`, Daten `kks-test.json`: **ALLE OK (15)**.
  - Basis zeigt für Klangkorn die WT-Seite; neu „KORN“ mit 15 Reglern; Öffnen ändert p.wt.h nicht.
  - Layout hochkant + quer: alles im Bild, ≥ 32 px, keine Überlappung, keine abgeschnittene Beschriftung.
  - Touch-Ziehen Breite 50 → 93 %, Korngröße 80 → 430 ms; gehaltener Ton: Spur-Engine bekommt die Werte live;
    Render-Vergleich (Worklet offline, Werte wie Spur-Engine): Seitenanteil 0,144 → 0,363, Spektral-Abstand 0,125; Schleife per Tipp: 4 Regler inert, Abstand 0,35; ↶ ×3 = Ausgangszustand.
  - VA- und normale WT-Seite: Text/Reiter gleich wie 4.88.
  - Spektral: Knopf „Als Klangkorn“ hochkant 416×44 (Ebenenliste 180 → 129 px, Spektrum 446 px gleich), quer 255×44 (Ebenenliste 284 → 236, Spektrum gleich); im Feld, keine Überlappung;
    vor Auswahl gesperrt, nach Pinsel frei, Tipp → Quelle geholt, Blatt offen, Modus KORN.
  - keine pageerror/console.error (Basis und neu).
- Pflicht (`pflicht.out`): doppelt.js neu [], „MS 2000“ 1×, „  live: true,“ 1×, verbotene Zahlen/Krypto 0×, Marker je 1×.
- Fotos: `foto-vorher.png` / `foto-nachher.png` (Klang-Editor hochkant), `-quer`, `foto-spektral-vorher(-quer).png` / `foto-spektral-nachher(-quer).png`.

## Offen / Grenzen
- Hörtest nur gemessen (Render/Engine-Werte), nicht mit Ohren.
- Quer im Spektral-Feld ist der Hinweistext der Ebenenliste rechts abgeschnitten – genauso in 4.88 (nicht von KKS).
