# VOX2 Stand
- Start: Eingang 4.85.0 geprüft (md5 9c7f63cf…). Keine echten Takes vorhanden (realvox fehlt) -> synthetische Testsignale.
- Plan: (1) Klicks in lauten tiefen Vokalen: puls-synchroner Vergleich in clickScan.test; (2) Plopps messen; (3) Raumton nur wenn Zeit.
- 20 min: Test-Gerüst w/ (gen.mjs synth. Gesang, kt.mjs Klick-Test) fertig; Basis: Treffer 76–80/80, Fehlalarme sauberer tiefer Take A2: 3 (letzter Stimmlippen-Puls am Notenende). block.js Entwurf.
- FERTIG (Endfassung md5 a40c87ea50c3b8dcdbb75647e1e72158 = out.html aus apply.py):
  - Änderung nur in clickScan (vr1Make): Block VOX2-BEGIN/END + 2 Haken (/*VOX2*/): vx2Acc (Annahme puls-synchron, im synth. Test ohne messbaren Gewinn) und vx2Rej (Ablehnung, nur Durchgang 1, Periode >= 5 ms, fh[j] < 0,9 x Puls-Nachbar).
  - Schalter {ps:0} = alte Erkennung bitgleich (geprüft: SUMME wie Basis).
  - Pflicht: MS 2000 1x, "  live: true," 1x, Sperrwörter 0, keine neue Top-Level-Definition (alles in vr1Make), Browser 428x926 + 926x428 errors [].
- OFFEN (ehrlich): Ziel "Klicks in lauten tiefen Vokalen 17/20 -> mehr" ließ sich nicht nachbauen – die echten Takes fehlen (realvox/dl), im
  synthetischen Gesang findet schon 4.85 fast alle Klicks. Plopps (8/10) und Raumton-Farbe nicht angefasst (Zeit; ohne echte Takes kein belastbarer Test).
- Werkzeuge: w/gen.mjs (synth. Gesang), w/kt.mjs (Klick-Test; PK= Klick relativ zur Pulsspitze, GCI= Schärfe Stimmlippen-Schluss, CO= Optionen), w/kern.mjs, w/smoke.cjs.
