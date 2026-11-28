export const meta = {
  name: 'kabel-check',
  description: 'Stromkabel für Xanders Musikgeräte exakt ermitteln und mit seinen Amazon-Links abgleichen',
  phases: [
    { title: 'Recherche', detail: 'Geräte und Produkte' },
    { title: 'Prüfen', detail: 'Gegenprüfung Polarität/Spannung' },
  ],
}
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/kabel'
const GR = `Regeln: Deutsch, nichts erfinden, Unsicheres klar markieren. Nutze WebFetch/WebSearch. Freigeschaltet sind u. a. www.amazon.de, rode.com/edge.rode.com/help.rode.com, www.roland.com, de.yamaha.com/usa.yamaha.com, www.tc-helicon.com, www.korg.com, kodamo.org, Wikipedia. Offizielle Handbücher (PDF) und Typenschilder/Netzteil-Datenblätter haben Vorrang vor Händlertexten. Polarität ist kritisch (falsche Polarität kann Geräte zerstören) – nur als „sicher“ markieren, wenn ein offizielles Dokument oder das Original-Netzteil-Typenschild sie zeigt. Schreibe dein Ergebnis zusätzlich nach ${S}/<datei>.md.`
const GERAET = (liste, datei) => `${GR}
AUFGABE: Für diese Geräte genau ermitteln: ${liste}.
Je Gerät: Original-Netzteil (Modell), Spannung, Mindest-Strom/Leistung, Hohlstecker Außen/Innen (mm), Polarität (Mitte + oder −), ob USB-Strom möglich ist. Dann auf www.amazon.de konkret passende Kabel suchen: USB-C-PD-Trigger-Kabel (fordert 9/12/15 V vom Ladegerät) oder USB-Step-up-Kabel (5 V → 9/12 V) – mit exakter Produktbezeichnung, ASIN, Preis, Spannung, Stecker, Polarität, Länge; 1–2 Empfehlungen je Gerät (bevorzugt mit ausdrücklich angegebener Polarität). Hinweis, ob das Ladegerät die nötige PD-Stufe (z. B. 12 V) haben muss. Datei: ${datei}.md`
const r = await parallel([
  () => agent(GERAET('RØDECaster Pro II (Mischpult), Yamaha reface DX, Kodamo EssenceFM', 'geraete_a'), { label: 'geräte:rode-reface-kodamo', phase: 'Recherche' }),
  () => agent(GERAET('TC-Helicon Perform-VK, Korg microARRANGER', 'geraete_b'), { label: 'geräte:tc-microarranger', phase: 'Recherche' }),
  () => agent(GERAET('Roland GAIA SH-01, Korg microKORG (1. Generation 2002)', 'geraete_c'), { label: 'geräte:gaia-microkorg', phase: 'Recherche' }),
  () => agent(`${GR}
AUFGABE: Xanders 6 Amazon-Produkte genau bestimmen (Seiten direkt öffnen: https://www.amazon.de/dp/<ASIN>): B0GXBBQSCZ, B0GX91K8FJ, B09LCJPZ1P, B0C58PXB4H, B0GFFV3452, B0CZ98XX7G. Je: exakter Titel, Hersteller, Stecker beidseitig, Spannung (fest/wählbar), Strom, Polarität (Bild/Beschreibung/Fragen&Antworten durchsehen), Stecker-Maß außen/innen, Länge, Stückzahl im Paket, Preis. Datei: produkte.md`, { label: 'produkte:6-links', phase: 'Recherche' }),
])
const zus = r.map((t, i) => `[Teil ${i + 1}]\n${t || 'FEHLGESCHLAGEN'}`).join('\n\n')
const fertig = await agent(`${GR}
AUFGABE: Du bist strenger Prüfer. Hier die Rechercheberichte:\n${zus}\n
1) Prüfe jede Polaritäts- und Spannungsangabe gegen offizielle Quellen nach (Handbuch-PDFs, Typenschild des Original-Netzteils). Wo sich Quellen widersprechen: klar sagen und „vor dem Einstecken mit Multimeter messen“.
2) Ordne Xanders 6 Produkte den Geräten zu (passt sicher / passt wahrscheinlich / passt nicht, mit Grund).
3) Für jedes Gerät, das noch kein sicher passendes Kabel hat: die beste konkrete Amazon-Empfehlung (Titel, ASIN, Link https://www.amazon.de/dp/<ASIN>, Preis, warum).
4) Hinweis zum Ladegerät (PD-Stufen 9/12/15 V; wie Xander am Aufdruck prüft).
Schreibe ${S}/ergebnis.md und gib als Antwort eine knappe deutsche Tabelle/Liste: Gerät → braucht → passendes vorhandenes Produkt → fehlt/Empfehlung.`, { label: 'prüfen:zuordnung', phase: 'Prüfen' })
return fertig
