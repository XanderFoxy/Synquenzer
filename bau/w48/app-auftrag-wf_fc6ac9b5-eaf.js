export const meta = {
  name: 'app-auftrag',
  description: 'Eine App für Xander: optional recherchieren, dann bauen und in kleinen Runden prüfen',
  phases: [
    { title: 'Recherche', detail: 'parallele Recherche (falls nötig)' },
    { title: 'Bauen', detail: 'umsetzen' },
    { title: 'Prüfen', detail: 'kurze Prüfrunde mit Korrektur' },
  ],
}

const GA = `
GRUNDREGELN FÜR APPS (Xander):
- Arbeite NUR in deinem Arbeitsordner (unten genannt). Kein git, nichts veröffentlichen, nichts außerhalb löschen. Die Hauptsitzung veröffentlicht später.
- Geräte: iPhone 12 Pro Max (428×926 hochkant und quer) und künftig ein faltbares iPhone (aufgeklappt hochkant, teste z. B. 760×1000). Safe-Areas, Tippflächen mindestens 44 px.
- Designregel (Xander): App-Look statt Textwände – schöne Farben, Optik, klarer Arbeitsfluss, Animationen nur mit transform/opacity. Man findet alles sofort, verliert nie den Spaß, super einfach. Jede App hat ihren eigenen passenden Look. Was Xander bewusst festgelegt hat (Aussehen, Größe, Bedienung), bleibt, außer der Auftrag ändert es.
- Keine Emoji als Grafik (Formen als SVG zeichnen). Keine Marken-/Produktnamen in der App-Oberfläche.
- Fehler schon beim Bau ausschließen: jede JS-Datei mit node --check; ein kurzer Playwright-Lauf (require('playwright'), chromium.launch() ohne Optionen, Viewport 428×926 und 926×428): keine Konsolenfehler, Hauptwege antippbar. Prüfbilder nur für dich (deviceScaleFactor 1). Kleine Prüfrunden, nicht endlos testen.
- Hat die App einen Service Worker mit Version/Dateiliste/Prüfsummen: nach der App-eigenen Konvention hochzählen/aktualisieren, damit das Update auf dem iPhone ankommt.
- Schnell laden: keine schweren Bibliotheken ohne Grund, Daten erst laden, wenn gebraucht. WebGL nur, wo es wirklich etwas bringt.
- Urheberrecht: keine geschützten Texte, Rezepte, Bilder abschreiben; eigene Texte schreiben, Zitate nur sehr kurz. Quellen verlinken statt kopieren. Nie Quellen, Zahlen oder Patente erfinden – Unsicheres weglassen oder markieren.
- Ehrlichkeit: Was technisch im Browser nicht zuverlässig geht, offen in der App sagen statt vortäuschen.
- Am Ende kurz berichten: geänderte Dateien, was neu ist, offene Punkte, und 1–3 Schritte „Bitte prüfen" für Xander.
`

const rech = (args.recherche || []).concat((args.rechercheTeile || []).map(t => ({ label: t.label, prompt: args.rechercheVorlage.split('{BEREICH}').join(t.bereich).split('{DATEI}').join(t.datei) })))
const schritte = args.schritte || []
let fundus = ''
if (rech.length) {
  const r = await parallel(rech.map(x => () => agent(GA + '\n' + x.prompt, { label: x.label, phase: 'Recherche' })))
  fundus = r.map((t, i) => `[${rech[i].label}] ${t ? String(t).slice(0, 1500) : 'FEHLGESCHLAGEN'}`).join('\n')
}
const ergebnisse = []
let vorher = fundus
for (const s of schritte) {
  const t = await agent(GA + '\n' + s.prompt + (vorher ? `\n\nBERICHTE DER VORHERIGEN SCHRITTE (Kurzfassung):\n${vorher}` : ''), { label: s.label, phase: s.phase || 'Bauen' })
  ergebnisse.push({ schritt: s.label, bericht: t })
  vorher += `\n[${s.label}] ${t ? String(t).slice(0, 2500) : 'FEHLGESCHLAGEN'}`
}
return { name: args.name, ergebnisse }
