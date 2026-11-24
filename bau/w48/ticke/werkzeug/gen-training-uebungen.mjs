// Erzeugt notiz/training-uebungen.json: [{ id, titel, route, gruppe, ast, passtZu: [Stichworte und mögliche Ast-IDs] }]
import fs from 'fs';
const [modDir, ziel] = process.argv.slice(2);
const { UEBUNGEN, GRUPPE } = await import(modDir + '/uebungen.js');
const BF = { G: 'bigfive.gewissenhaftigkeit', O: 'bigfive.offenheit', E: 'bigfive.extraversion', V: 'bigfive.vertraeglichkeit', S: 'bigfive.stabilitaet' };
const W = {
  'f-ein-ding': ['fokus', 'konzentration', 'tiefe', 'ablenkung', 'handy', 'aufschieben', BF.G, 'muster.kontrolle'],
  'f-handy-weg': ['fokus', 'ablenkung', 'handy', 'mitteilungen', 'ruhe', BF.G],
  'f-parkplatz': ['fokus', 'gedanken', 'grübeln', 'offene aufgaben', 'ordnung', BF.G, 'muster.stress'],
  'f-ablenkung': ['fokus', 'ablenkung', 'wenn-dann', 'planen', 'selbststeuerung', BF.G, 'muster.kontrolle'],
  'f-pause': ['pause', 'energie', 'erholung', 'stress', 'bildschirm', 'muster.stress'],
  'f-wichtigstes': ['prioritäten', 'ziele', 'morgen', 'fokus', 'morgentyp', BF.G, 'interessen.rhythmus', 'muster.entscheiden'],
  'f-fenster': ['rhythmus', 'tageszeit', 'chronotyp', 'fokus', 'energie', 'interessen.rhythmus'],
  'z-woop': ['ziele', 'wunsch', 'hindernis', 'planen', 'motivation', 'muster.kontrolle', 'muster.sinn', BF.G],
  'z-wenndann': ['ziele', 'wenn-dann', 'planen', 'aufschieben', 'gewohnheiten', BF.G, 'muster.gewohnheiten'],
  'z-konkret': ['ziele', 'klarheit', 'planen', 'entscheiden', 'muster.entscheiden', BF.G],
  'z-schritt': ['ziele', 'aufschieben', 'anfangen', 'überforderung', 'kleine schritte', 'muster.ungewissheit', BF.G],
  'z-fortschritt': ['ziele', 'tagebuch', 'reflexion', 'dranbleiben', BF.G],
  'z-bestes-selbst': ['zukunft', 'zuversicht', 'werte', 'sinn', 'vorstellung', 'muster.sinn', 'muster.werte_wandel'],
  'g-anker': ['gewohnheiten', 'routine', 'auslöser', 'dranbleiben', 'muster.gewohnheiten', BF.G],
  'g-mini': ['gewohnheiten', 'kleine schritte', 'anfangen', 'aufschieben', 'muster.gewohnheiten'],
  'g-umgebung': ['gewohnheiten', 'umgebung', 'ordnung', 'selbststeuerung', 'muster.gewohnheiten', 'muster.kontrolle'],
  'g-koppeln': ['gewohnheiten', 'motivation', 'genuss', 'aufschieben', 'muster.gewohnheiten'],
  'g-luecke': ['gewohnheiten', 'nachsicht', 'selbstmitgefühl', 'rückschlag', 'muster.selbstmitgefuehl', 'muster.gewohnheiten'],
  'g-abhaken': ['gewohnheiten', 'tagebuch', 'dranbleiben', 'muster.gewohnheiten'],
  'l-abfragen': ['lernen', 'gedächtnis', 'prüfung', 'wissen', 'muster.lernen', 'muster.neugier_denken', 'passt.lernen'],
  'l-verteilen': ['lernen', 'gedächtnis', 'wiederholen', 'planen', 'muster.lernen'],
  'l-erklaeren': ['lernen', 'verstehen', 'sprechen', 'erklären', 'sprache', 'muster.lernen', 'muster.neugier_denken', BF.E],
  'l-warum': ['lernen', 'neugier', 'nachdenken', 'verstehen', 'muster.neugier_denken', BF.O],
  'l-mischen': ['lernen', 'üben', 'musik', 'abwechslung', 'muster.lernen', BF.O],
  'l-schlaf': ['lernen', 'schlaf', 'gedächtnis', 'abend', 'muster.lernen', 'interessen.rhythmus'],
  'l-karten': ['lernen', 'gedächtnis', 'wiederholen', 'muster.lernen'],
  'k-neubewerten': ['gefühle', 'ärger', 'sichtweise', 'stress', 'gelassenheit', BF.S, 'muster.gefuehle', 'muster.denkfallen', 'muster.ungewissheit', 'muster.stress'],
  'k-benennen': ['gefühle', 'achtsamkeit', 'selbstwahrnehmung', 'sprache', BF.S, 'muster.gefuehle'],
  'k-du-sprechen': ['gefühle', 'aufregung', 'auftritt', 'selbstgespräch', 'mut', BF.S, 'muster.stress', 'muster.selbstmitgefuehl'],
  'k-drei-gute': ['dankbarkeit', 'stimmung', 'abend', 'reflexion', 'tagebuch', 'muster.sinn'],
  'k-selbstmitgefuehl': ['selbstmitgefühl', 'fehler', 'stress', 'freundlichkeit', 'perfektionismus', BF.S, BF.G, 'muster.selbstmitgefuehl'],
  'k-sorgen-zeit': ['grübeln', 'sorgen', 'schlaf', 'stress', BF.S, 'muster.stress', 'muster.ungewissheit'],
  'k-geniessen': ['genuss', 'achtsamkeit', 'ruhe', 'sinne', 'erleben', 'muster.sinn'],
  'h-aufstehen': ['schlaf', 'rhythmus', 'morgen', 'regelmäßigkeit', 'interessen.rhythmus', 'muster.gewohnheiten'],
  'h-morgenlicht': ['licht', 'schlaf', 'rhythmus', 'abendtyp', 'morgen', 'draußen', 'interessen.rhythmus'],
  'h-abendlicht': ['licht', 'schlaf', 'abend', 'bildschirm', 'handy', 'interessen.rhythmus'],
  'h-koffein': ['schlaf', 'koffein', 'energydrink', 'abend', 'interessen.rhythmus'],
  'h-gehen': ['bewegung', 'kreativität', 'einfälle', 'draußen', 'neugier', BF.O, 'interessen.riasec'],
  'h-snack': ['bewegung', 'sitzen', 'pause', 'energie'],
  'h-atem': ['atem', 'ruhe', 'stress', 'aufregung', 'entspannung', BF.S, 'muster.stress'],
  'h-gruen': ['natur', 'ruhe', 'aufmerksamkeit', 'erholung', 'draußen', 'muster.stress'],
  'a-zuhoeren': ['zuhören', 'gespräch', 'beziehungen', 'empathie', 'kommunikation', BF.V, BF.E, 'muster.kommunikation', 'muster.werte_ich_wir'],
  'a-nachfragen': ['fragen', 'gespräch', 'neugier', 'kontakt', 'kommunikation', BF.E, 'muster.kommunikation'],
  'a-ich': ['streit', 'konflikt', 'ich-botschaft', 'kommunikation', 'ehrlichkeit', BF.V, 'muster.kommunikation', 'muster.grenzen', 'muster.konflikt', 'passt.andere_streit'],
  'a-grenze': ['nein sagen', 'grenzen', 'rücksicht', 'kraft', 'selbstbestimmung', BF.V, 'muster.grenzen', 'muster.werte_ich_wir'],
  'a-kompliment': ['kompliment', 'wertschätzung', 'kontakt', 'beziehungen', BF.V, 'muster.kommunikation'],
  'a-melden': ['kontakt', 'freundschaft', 'nachricht', 'verbundenheit', BF.E, 'muster.werte_ich_wir', 'muster.naehe', 'passt.andere_naehe'],
  'a-danke': ['dankbarkeit', 'wertschätzung', 'beziehungen', 'nachricht', 'muster.werte_ich_wir'],
  'a-mitfreuen': ['freude', 'beziehungen', 'zuhören', 'nähe', 'muster.kommunikation', 'muster.werte_ich_wir', 'muster.naehe'],
  'a-freundlich': ['freundlichkeit', 'helfen', 'verbundenheit', 'sinn', BF.V, 'muster.werte_ich_wir', 'muster.sinn'],
  'w-mutprobe': ['mut', 'überwindung', 'wachsen', 'unsicherheit', 'passt.wachstum', 'muster.ungewissheit', BF.S, BF.E],
  'w-so-tun': ['wachsen', 'veränderung', 'verhalten', 'persönlichkeit', 'passt.wachstum', 'muster.lernen', 'muster.werte_wandel'],
  'w-rueckmeldung': ['rückmeldung', 'selbstbild', 'wachsen', 'offenheit', 'passt.wachstum', BF.O],
  'w-staerke': ['stärken', 'neugier', 'wachsen', 'passt.staerken', 'passt.wachstum', BF.O],
  'w-werte': ['werte', 'sinn', 'richtung', 'entscheiden', 'muster.sinn', 'muster.werte_wandel', 'muster.werte_ich_wir', 'muster.entscheiden']
};
const out = UEBUNGEN.map((u) => {
  if (!W[u.id]) throw new Error('Stichworte fehlen: ' + u.id);
  return { id: u.id, titel: u.titel, route: 'training/uebung/' + u.id, gruppe: u.gruppe, ast: 'training.' + u.gruppe, dauer: u.dauer, kurz: u.kurz,
    passtZu: [...new Set([...W[u.id], GRUPPE[u.gruppe].titel.toLowerCase()])] };
});
for (const id of Object.keys(W)) if (!out.find((x) => x.id === id)) throw new Error('unbekannt: ' + id);
fs.writeFileSync(ziel, JSON.stringify(out, null, 1));
console.log(out.length, 'Übungen →', ziel);
