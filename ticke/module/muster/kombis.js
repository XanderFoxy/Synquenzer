// muster – Kombinationen über Module hinweg: Aus mehreren Richtungen wird EIN Satz („So bist du zusammengesetzt“).
// Jede Regel nennt die Äste, die sie braucht, und die Seite je Ast. Ein Satz erscheint nur, wenn alle Äste vorliegen
// und in die genannte Richtung zeigen. Sätze beschreiben, sie bewerten nicht („vielleicht“, „kann“, „vermutlich“).
//
// Seiten: Äste von „muster“ → 'p0' | 'p1' (Index des Pols) | Weg-Name bei „Sinn“ ('Schaffen' | 'Erleben' | 'Haltung').
// Äste anderer Module → 'plus' | 'minus' (siehe SEITEN). 'beides' passt zu keiner Regel mit einer Seite.
// Ohne DOM – auch in Node testbar.

// Woran die Seite eines fremden Astes erkannt wird: Stichwörter im Pol-Namen (wenn das Modul `pol` mitgibt) oder im
// Richtungs-Satz. Das früheste Stichwort gewinnt; vorrang:'minus' = ein minus-Wort schlägt alles; std = Seite ohne Treffer.
export const SEITEN = {
  'bigfive.offenheit': { plus: ['neugier', 'neues', 'neue', 'offen', 'fantasie', 'ideen', 'sucht', 'entdeck'], minus: ['vertraut', 'bewährt', 'beständig', 'halt ', 'bodenständig', 'gewohnt', 'altbekannt'] },
  'bigfive.gewissenhaftigkeit': { plus: ['geplant', 'gründlich', 'planvoll', 'plan', 'ordnung', 'struktur', 'sorgfalt', 'sorgfält', 'verlässlich', 'organis'], minus: ['spontan', 'locker', 'flexib', 'improvis', 'beweglich', 'aus dem moment'] },
  'bigfive.extraversion': { plus: ['gesellig', 'aktiv', 'unter menschen', 'unter leuten', 'kontakt', 'nach außen', 'trubel', 'kontaktfreud'], minus: ['ruhig', 'für dich', 'still', 'rückzug', 'nach innen', 'allein', 'zurückhalt'] },
  'bigfive.vertraeglichkeit': { plus: ['rücksicht', 'mitfühl', 'mitgefühl', 'harmonie', 'kooperat', 'freundlich', 'warmherzig', 'nachgieb', 'verständnis'], minus: ['direkt', 'kritisch', 'streitbar', 'unbequem', 'durchsetz', 'eigensinn', 'hinterfrag'] },
  'bigfive.stabilitaet': { plus: ['gelassen', 'stabil', 'erschüttern', 'ruhe', 'ruhig', 'gefasst'], minus: ['spürt', 'spürst', 'stärker', 'empfind', 'feinfühl', 'intensiv', 'sensib', 'wachsam', 'aufmerksam für'] },
  'interessen.rhythmus': { plus: ['spät', 'abend', 'nacht', 'eule'], minus: ['früh', 'morgen', 'lerche'], beides: ['dazwischen', 'weder', 'mittel', 'mitte'] },
  'interessen.ehrlichkeit': { plus: ['fair', 'bescheiden', 'ehrlich', 'aufrichtig', 'gerecht'], minus: ['vorteil', 'selbstbewusst', 'durchsetz', 'ehrgeiz', 'status', 'selbstbewusstsein'] },
  'interessen.R': { minus: ['kaum', 'wenig', 'nicht'], plus: [], vorrang: 'minus', std: 'plus' },
  'interessen.I': { minus: ['kaum', 'wenig', 'nicht'], plus: [], vorrang: 'minus', std: 'plus' },
  'interessen.A': { minus: ['kaum', 'wenig', 'nicht'], plus: [], vorrang: 'minus', std: 'plus' },
  'interessen.S': { minus: ['kaum', 'wenig', 'nicht'], plus: [], vorrang: 'minus', std: 'plus' },
  'interessen.E': { minus: ['kaum', 'wenig', 'nicht'], plus: [], vorrang: 'minus', std: 'plus' },
  'interessen.C': { minus: ['kaum', 'wenig', 'nicht'], plus: [], vorrang: 'minus', std: 'plus' }
};

// Regeln. braucht: [[ast-id, seite], …]. Reihenfolge = Vorrang bei gleicher Größe (Module übergreifend zuerst).
export const KOMBIS = [
  { id: 'abend-kreativ', braucht: [['bigfive.offenheit', 'plus'], ['interessen.rhythmus', 'plus'], ['interessen.A', 'plus']],
    satz: 'Neugier, ein später Rhythmus und Lust am Gestalten kommen bei dir zusammen: Gut möglich, dass deine besten Ideen eher abends kommen – ein festes Abendfenster für eigene Projekte kann sich lohnen.' },
  { id: 'abend-denken', braucht: [['muster.neugier_denken', 'p0'], ['interessen.rhythmus', 'plus']],
    satz: 'Du denkst gern um des Denkens willen und tickst eher spät: Die stillen Abendstunden können deine Zeit für große Fragen sein.' },
  { id: 'morgen-plan', braucht: [['interessen.rhythmus', 'minus'], ['bigfive.gewissenhaftigkeit', 'plus']],
    satz: 'Früh wach und gern geplant: Der Morgen ist vermutlich deine Zeit für das, was dir wichtig ist – bevor der Tag dazwischenkommt.' },
  { id: 'offen-neu', braucht: [['muster.ungewissheit', 'p0'], ['bigfive.offenheit', 'plus']],
    satz: 'Neues und Offenes ziehen dich an: Du kannst dich auf Unbekanntes einlassen, ohne gleich eine fertige Antwort zu brauchen.' },
  { id: 'klar-gruendlich', braucht: [['muster.ungewissheit', 'p1'], ['bigfive.gewissenhaftigkeit', 'plus']],
    satz: 'Du magst Klarheit und gehst gründlich vor: Andere können sich auf deine Absprachen und Pläne verlassen.' },
  { id: 'hand-plan', braucht: [['muster.kontrolle', 'p0'], ['bigfive.gewissenhaftigkeit', 'plus']],
    satz: 'Du erlebst vieles als beeinflussbar und gehst planvoll vor – Ziele mit einem klaren Plan liegen dir vermutlich.' },
  { id: 'lauf-gelassen', braucht: [['muster.kontrolle', 'p1'], ['bigfive.stabilitaet', 'plus']],
    satz: 'Du nimmst die Dinge, wie sie kommen, und bleibst dabei gelassen – eine Haltung, die schon die Stoiker als Lebenskunst beschrieben.' },
  { id: 'spueren-halt', braucht: [['bigfive.stabilitaet', 'minus'], ['muster.ungewissheit', 'p1']],
    satz: 'Du spürst Druck deutlich und findest Halt in Klarheit: Feste Absprachen und ein klarer Rahmen können dir Ruhe schenken.' },
  { id: 'wir-ruecksicht', braucht: [['muster.werte_ich_wir', 'p1'], ['bigfive.vertraeglichkeit', 'plus']],
    satz: 'Menschen und Zusammenhalt stehen bei dir weit vorn: Du achtest darauf, wie es anderen geht, und Gemeinschaft gibt dir Kraft.' },
  { id: 'wir-sozial', braucht: [['muster.werte_ich_wir', 'p1'], ['interessen.S', 'plus']],
    satz: 'Verbundenheit ist dir wichtig, und Tätigkeiten mit Menschen ziehen dich an: Helfen, Beraten oder Beibringen kann für dich sinnvoll sein.' },
  { id: 'ich-direkt', braucht: [['muster.werte_ich_wir', 'p0'], ['bigfive.vertraeglichkeit', 'minus']],
    satz: 'Du folgst deinem eigenen Urteil und sprichst auch Unbequemes aus: In Gruppen kannst du ein ehrlicher, eigenständiger Gegenpol sein.' },
  { id: 'wandel-neu', braucht: [['muster.werte_wandel', 'p1'], ['bigfive.offenheit', 'plus']],
    satz: 'Aufbruch und Neues passen zu dir: Veränderung erlebst du eher als Einladung als als Verlust.' },
  { id: 'bewahren-sorgfalt', braucht: [['muster.werte_wandel', 'p0'], ['bigfive.gewissenhaftigkeit', 'plus']],
    satz: 'Du schätzt, was sich bewährt hat, und gehst sorgfältig damit um: Verlässlichkeit ist eine deiner Wurzeln.' },
  { id: 'denken-forschen', braucht: [['muster.neugier_denken', 'p0'], ['interessen.I', 'plus']],
    satz: 'Nachdenken macht dir Freude, und Forschen zieht dich an: Dingen auf den Grund zu gehen, ist vermutlich eine deiner Kraftquellen.' },
  { id: 'schaffen-kunst', braucht: [['muster.sinn', 'Schaffen'], ['interessen.A', 'plus']],
    satz: 'Sinn findest du im Schaffen, und Gestalten zieht dich an: Ein eigenes Werk – groß oder klein – kann für dich sehr erfüllend sein.' },
  { id: 'schaffen-hand', braucht: [['muster.sinn', 'Schaffen'], ['interessen.R', 'plus']],
    satz: 'Sinn liegt für dich im Schaffen, und praktisches Anpacken zieht dich an: Etwas mit eigenen Händen fertig zu machen, kann dich tief zufrieden machen.' },
  { id: 'erleben-offen', braucht: [['muster.sinn', 'Erleben'], ['bigfive.offenheit', 'plus']],
    satz: 'Sinn findest du im Erleben, und du bist offen für Neues: Begegnungen, Natur und Kunst können dir viel Kraft geben.' },
  { id: 'bauch-gesellig', braucht: [['muster.entscheiden', 'p0'], ['bigfive.extraversion', 'plus']],
    satz: 'Aus dem Bauch und gern unter Menschen: Im Gespräch spürst du oft schnell, was passt, und entscheidest im Fluss.' },
  { id: 'kopf-ruhe', braucht: [['muster.entscheiden', 'p1'], ['bigfive.extraversion', 'minus']],
    satz: 'Du wägst gern ab und brauchst Ruhe dafür: Gute Entscheidungen reifen bei dir vermutlich dann, wenn du Zeit für dich hast.' },
  { id: 'fair-wir', braucht: [['interessen.ehrlichkeit', 'plus'], ['muster.werte_ich_wir', 'p1']],
    satz: 'Fairness und Verbundenheit gehen bei dir zusammen: Dir ist wichtig, dass es in einer Gemeinschaft gerecht zugeht.' },
  { id: 'anstossen-hand', braucht: [['interessen.E', 'plus'], ['muster.kontrolle', 'p0']],
    satz: 'Etwas anzustoßen zieht dich an, und du erlebst vieles als beeinflussbar: Wenn du an eine Sache glaubst, kannst du andere mitziehen.' },
  { id: 'ordnung-klar', braucht: [['interessen.C', 'plus'], ['muster.ungewissheit', 'p1']],
    satz: 'Ordnung und Klarheit passen zu dir: Klare Abläufe sind für dich eher Werkzeug als Zwang.' },
  // ---- innerhalb der Denkweise (tragen, solange andere Teile noch offen sind)
  { id: 'kopf-klarheit', braucht: [['muster.entscheiden', 'p1'], ['muster.ungewissheit', 'p1']],
    satz: 'Du magst Klarheit und wägst gründlich ab: Bevor du entscheidest, willst du die Lage verstehen – deine Entscheidungen sind dadurch gut begründet.' },
  { id: 'bauch-offen', braucht: [['muster.entscheiden', 'p0'], ['muster.ungewissheit', 'p0']],
    satz: 'Du vertraust deinem Gespür und kannst Offenes stehen lassen: In unklaren Lagen improvisierst du, wo andere erst einen Plan brauchen.' },
  { id: 'philosophisch', braucht: [['muster.neugier_denken', 'p0'], ['muster.ungewissheit', 'p0']],
    satz: 'Große Fragen ohne fertige Antwort reizen dich: Du hast eine philosophische Ader – das Offene ist für dich ein Denkraum.' },
  { id: 'denken-tun', braucht: [['muster.neugier_denken', 'p1'], ['muster.entscheiden', 'p0']],
    satz: 'Du denkst, um zu handeln, und vertraust deinem Gespür: Bei dir ist der Weg vom Gedanken zur Tat kurz.' },
  { id: 'gruendlich-denken', braucht: [['muster.neugier_denken', 'p0'], ['muster.entscheiden', 'p1']],
    satz: 'Nachdenken ist dir etwas wert, und du wägst gern ab: Du nimmst dir Zeit, Dinge wirklich zu durchdringen.' },
  { id: 'wachsen-hand', braucht: [['muster.lernen', 'p0'], ['muster.kontrolle', 'p0']],
    satz: 'Du glaubst ans Wachsen durch Üben und erlebst vieles als beeinflussbar: Neue Fähigkeiten traust du dir zu, wenn du dranbleibst.' },
  { id: 'begabung-lauf', braucht: [['muster.lernen', 'p1'], ['muster.kontrolle', 'p1']],
    satz: 'Du baust auf das, was dir liegt, und nimmst die Dinge, wie sie kommen: Du musst nicht alles können – und gehst gelassen mit Grenzen um.' },
  { id: 'frei-neu', braucht: [['muster.werte_ich_wir', 'p0'], ['muster.werte_wandel', 'p1']],
    satz: 'Eigener Weg und Lust auf Neues: Selbstbestimmt Neues zu erkunden, ist vermutlich ein starker Antrieb für dich.' },
  { id: 'wir-wurzeln', braucht: [['muster.werte_ich_wir', 'p1'], ['muster.werte_wandel', 'p0']],
    satz: 'Gemeinschaft und Bewährtes geben dir Halt: Familie, Freundschaften und Traditionen sind für dich vermutlich wichtige Wurzeln.' },
  { id: 'haltung-stoa', braucht: [['muster.sinn', 'Haltung'], ['muster.kontrolle', 'p1']],
    satz: 'Du findest Sinn auch in deiner Haltung zu dem, was sich nicht ändern lässt – nahe an der Stoa und an Viktor Frankl.' },
  { id: 'schaffen-gestalten', braucht: [['muster.sinn', 'Schaffen'], ['muster.kontrolle', 'p0']],
    satz: 'Sinn liegt für dich im Schaffen, und du erlebst vieles als gestaltbar: Du willst etwas bewirken – und traust es dir zu.' },
  { id: 'erleben-wir', braucht: [['muster.sinn', 'Erleben'], ['muster.werte_ich_wir', 'p1']],
    satz: 'Sinn findest du im Erleben, und Verbundenheit ist dir wichtig: Gemeinsame Momente mit nahen Menschen tragen dich vermutlich besonders.' },
  { id: 'wandel-offen', braucht: [['muster.werte_wandel', 'p1'], ['muster.ungewissheit', 'p0']],
    satz: 'Du magst Aufbruch und kannst Offenes aushalten: Unbekanntes Terrain schreckt dich wenig – es lockt eher.' },
  { id: 'bewahren-klar', braucht: [['muster.werte_wandel', 'p0'], ['muster.ungewissheit', 'p1']],
    satz: 'Bewährtes und Klarheit geben dir Halt: Wo andere Neues ausprobieren, sorgst du dafür, dass das Gute bleibt.' }
];

// ---------- Seite eines Eintrags erkennen ----------
const WEG = /(klar|leicht) in richtung|beides gehört zu dir/g;
const norm = (t) => String(t || '').toLowerCase().replace(WEG, ' ');
function zitat(t) { const m = /[„"»]([^“”"«]+)[“”"«]/.exec(String(t || '')); return m ? m[1] : ''; }
function frueh(text, woerter) { let best = Infinity; for (const w of woerter || []) { const i = text.indexOf(w); if (i >= 0 && i < best) best = i; } return best; }
export function seiteAusText(regel, text) {
  const t = norm(text); if (!t.trim()) return null;
  const p = frueh(t, regel.plus), m = frueh(t, regel.minus), b = frueh(t, regel.beides);
  if (regel.vorrang === 'minus' && m < Infinity) return 'minus';
  const min = Math.min(p, m, b);
  if (min === Infinity) return regel.std || null;
  return min === b ? 'beides' : min === p ? 'plus' : 'minus';
}
// eintrag: muster()-Eintrag eines Moduls; ast: der zugehörige Ast (für Pol-Namen); kanon: kanonische ID für SEITEN.
// Gibt eine Menge von Seiten zurück (leer, wenn unklar).
export function seitenVon(eintrag, ast, kanon) {
  const s = new Set();
  if (!eintrag) return s;
  if (eintrag.deutlich === 'beides') { s.add('beides'); return s; }
  if (Array.isArray(eintrag.wege)) eintrag.wege.forEach((w) => s.add(w));
  const pol = eintrag.pol === 0 || eintrag.pol === 1 ? eintrag.pol : null;
  if (pol !== null) s.add('p' + pol);
  const regel = SEITEN[kanon];
  if (regel) {
    const polName = pol !== null && ast && Array.isArray(ast.pole) && ast.pole[pol] ? ast.pole[pol].name : '';
    let x = null;
    for (const t of [polName, zitat(eintrag.richtung), `${eintrag.richtung || ''} ${eintrag.wort || ''}`]) {
      if (t && (x = seiteAusText({ ...regel, std: null }, t))) break;
    }
    x = x || regel.std || null;
    if (x) s.add(x);
  }
  return s;
}

// lagen: Map kanonischeAstId → { seiten:Set, deutlich }. Gibt die erfüllten Regeln zurück (gleiche Reihenfolge wie KOMBIS,
// größere Regeln zuerst). Eine Regel feuert nur bei 'klar' oder 'leicht' auf allen Ästen.
export function erfuellt(lagen) {
  const r = [];
  for (const K of KOMBIS) {
    const ok = K.braucht.every(([id, seite]) => { const L = lagen.get(id); return !!L && L.deutlich !== 'beides' && L.seiten.has(seite); });
    if (ok) r.push(K);
  }
  return r.sort((a, b) => b.braucht.length - a.braucht.length);
}
// Auswahl für die Zusammenfassung: höchstens max Regeln, jeder Ast höchstens zweimal, jede Regel bringt mindestens einen neuen Ast.
export function waehle(regeln, max = 3) {
  const zahl = new Map(), raus = [];
  for (const K of regeln) {
    if (raus.length >= max) break;
    const ids = K.braucht.map(([id]) => id);
    if (ids.some((id) => (zahl.get(id) || 0) >= 2)) continue;
    if (raus.length && ids.every((id) => zahl.has(id))) continue;
    ids.forEach((id) => zahl.set(id, (zahl.get(id) || 0) + 1)); raus.push(K);
  }
  return raus;
}
// Für „Weiter springen“: Äste, die mit `id` in mindestens einer Regel stehen.
export function kombiNachbarn(id) {
  const s = new Set();
  for (const K of KOMBIS) { const ids = K.braucht.map(([x]) => x); if (ids.includes(id)) ids.forEach((x) => x !== id && s.add(x)); }
  return [...s];
}
