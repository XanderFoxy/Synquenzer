// M3 textspiegel – Aufgaben, Richtungen in Worten, Fragen an dich, Vergleich mit dem Fragebogen, Blindtest. Rein (ohne DOM).
// Regeln (Xander, 24.11.2026): keine Bewertung, keine Zahl über ihn, kein richtig/falsch. Jedes Merkmal ist eine Richtung zwischen
// zwei gleichwertigen Polen (Inhalt: aeste.js), in Worten abgestuft: „deutlich“ (klar), „eher“ (leicht) oder „beides“.
// Die Zahlen der Zählung bleiben intern; gezeigt werden Richtung, Belegwörter und die Stellen aus den eigenen Texten.
import { waage, schwerpunkt, GRENZEN } from './analyse.js';
import { AST } from './aeste.js';

export const AUFGABEN = [
  { id: 'tag', kurz: 'Ganz ich', titel: 'Ein Tag, an dem ich ganz ich war', frage: 'Erzähl von einem Tag, an dem du ganz du selbst warst.',
    hilfen: ['Wo warst du, mit wem, was hast du gemacht?', 'Woran hast du gemerkt, dass du ganz du warst?', 'Wie hat es sich angefühlt?'] },
  { id: 'antrieb', kurz: 'Antrieb', titel: 'Was mich antreibt', frage: 'Was treibt dich an? Wofür stehst du gern auf?',
    hilfen: ['Wobei vergisst du die Zeit?', 'Was willst du in den nächsten Jahren schaffen?', 'Was gibt dir Kraft?'] },
  { id: 'bremse', kurz: 'Bremse', titel: 'Was mich bremst', frage: 'Was bremst dich – und was machst du dann?',
    hilfen: ['Denk an eine Sache, die nicht geklappt hat.', 'Was hält dich zurück, obwohl du eigentlich willst?', 'Was hast du danach gemacht?'] },
  { id: 'freund', kurz: 'Freund', titel: 'Wie mich ein guter Freund beschreiben würde', frage: 'Stell dir vor, eine gute Freundin oder ein guter Freund erzählt jemandem von dir. Was würde sie oder er sagen?',
    hilfen: ['Was mögen andere an dir?', 'Was nervt sie manchmal?', 'Du kannst in ihren Worten schreiben: „Sie/Er ist …“'] }
];
export const AUFGABE = Object.fromEntries(AUFGABEN.map((a) => [a.id, a]));
export const REIHE = AUFGABEN.map((a) => a.id);
export const titelVon = (id) => (AUFGABE[id] ? AUFGABE[id].titel : id);

const anf = (w) => `„${w}“`;
export const belegListe = (belege, n = 4) => belege.slice(0, n).map(([w]) => anf(w)).join(', ');
const pol = (id, i) => AST[id].pole[i].name;

// ---------- Richtungen (je Ast eine Achse zwischen zwei Polen) ----------
// art waage: Wortgruppe a gegen b (Verhältnis im eigenen Text, braucht keine Vergleichswerte); min = so viele Treffer zusammen.
// art dichte: Wörter einer Gruppe je 100 Wörter, art wert: Satzlänge/Wortvielfalt – beide mit eigenen, groben Grenzen
// [k1, k2, k3, k4]: unter k1 deutlich a, unter k2 eher a, bis k3 beides, bis k4 eher b, darüber deutlich b.
export const RICHTUNGEN = [
  { id: 'zeit', art: 'waage', a: ['vergangenheit'], b: ['zukunft'], min: 6 },
  { id: 'haltung', art: 'waage', a: ['vorsicht'], b: ['handeln'], min: 6 },
  { id: 'gefuehl', art: 'dichte', gruppen: ['freude', 'belastung'], grenzen: [1.5, 2.5, 4.5, 6.5] },
  { id: 'wer', art: 'waage', a: ['ich'], b: ['wir', 'du', 'menschen'], min: 6, nurEher: 'a', grenzeA: 0.15 },
  { id: 'satzlaenge', art: 'wert', grenzen: [8, 11, 16, 21] },
  { id: 'absolut', art: 'waage', a: ['absolut'], b: ['abgestuft'], min: 5 },
  { id: 'begruenden', art: 'dichte', gruppen: ['begruenden'], grenzen: [0.8, 1.6, 3.5, 5] },
  { id: 'vielfalt', art: 'wert', grenzen: [0.62, 0.68, 0.79, 0.84] }
];
const summe = (an, gr) => gr.reduce((s, g) => s + an.merkmale[g].anzahl, 0);
const belegeVon = (an, gr, n = 4) => gr.flatMap((g) => an.merkmale[g].belege).sort((x, y) => y[1] - x[1]).slice(0, n);
function stufe(v, [k1, k2, k3, k4]) {
  if (v < k1) return { seite: 'a', deutlich: 'klar' };
  if (v < k2) return { seite: 'a', deutlich: 'leicht' };
  if (v <= k3) return { seite: 'beide', deutlich: 'beides' };
  if (v <= k4) return { seite: 'b', deutlich: 'leicht' };
  return { seite: 'b', deutlich: 'klar' };
}
// Seite und Deutlichkeit einer Achse – oder null, wenn die Texte dazu (noch) zu wenig sagen.
function lage(an, R, o) {
  if (R.art === 'waage') {
    const a = summe(an, R.a), b = summe(an, R.b), s = a + b, min = o.min || R.min;
    if (s < min) return null;
    const pb = b / s;
    let r = R.grenzeA != null
      ? (pb >= 2 / 3 ? { seite: 'b', deutlich: 'klar' } : pb >= 0.5 ? { seite: 'b', deutlich: 'leicht' } : pb <= R.grenzeA ? { seite: 'a', deutlich: 'leicht' } : { seite: 'beide', deutlich: 'beides' })
      : pb >= 0.75 ? { seite: 'b', deutlich: 'klar' } : pb >= 2 / 3 ? { seite: 'b', deutlich: 'leicht' }
        : pb <= 0.25 ? { seite: 'a', deutlich: 'klar' } : pb <= 1 / 3 ? { seite: 'a', deutlich: 'leicht' } : { seite: 'beide', deutlich: 'beides' };
    if (r.deutlich === 'klar' && s < 2 * min) r = { ...r, deutlich: 'leicht' };
    return { ...r, a, b };
  }
  if (R.art === 'dichte') {
    if (an.woerter < GRENZEN.min) return null;
    const v = R.gruppen.reduce((x, g) => x + an.merkmale[g].pro100, 0);
    return stufe(v, R.grenzen);
  }
  if (R.id === 'satzlaenge') return an.satzlaenge.unklar || an.satzlaenge.mittel == null || an.saetze < 3 ? null : stufe(an.satzlaenge.mittel, R.grenzen);
  if (R.id === 'vielfalt') return an.vielfalt.wert == null || an.vielfalt.kurz ? null : stufe(an.vielfalt.wert, R.grenzen);
  return null;
}
const DEUT = { klar: 'deutlich', leicht: 'eher' };
// Alle Richtungen der Texte. o: { muttersprache (true/false/null), min (für einzelne Texte kleiner), ohneThema }.
// Rückgabe je Ast: { id, ast, titel, pole, seite: 'a'|'b'|'beide'|null, deutlich, satz, woher, belege: {a, b}, thema }
export function richtungen(an, o = {}) {
  const k = Object.values(an.aufgaben).filter((x) => x.woerter > 0).length;
  return RICHTUNGEN.map((R) => {
    const A = AST[R.id], l = lage(an, R, o);
    const aus = { id: R.id, ast: A.id, titel: A.titel, pole: A.pole, seite: null, deutlich: null, satz: '', woher: '', thema: null,
      belege: R.art === 'waage' ? { a: belegeVon(an, R.a), b: belegeVon(an, R.b) } : R.art === 'dichte' ? { b: belegeVon(an, R.gruppen, 6) } : {} };
    if (!l) return aus;
    let deutlich = l.deutlich;
    // Vorsicht: unter 300 Wörtern oder ohne Deutsch als Muttersprache nie „deutlich“; „von dir aus“ höchstens „eher“ (die Aufgaben fragen nach dir)
    if (deutlich === 'klar' && (an.umfang !== 'hinweise' || o.muttersprache === false)) deutlich = 'leicht';
    if (R.nurEher && l.seite === R.nurEher && deutlich === 'klar') deutlich = 'leicht';
    // Steckt der Großteil der Wörter einer Seite in EINER Aufgabe, liegt es nahe am Thema: höchstens „eher“
    if (!o.ohneThema && R.art === 'waage' && l.seite !== 'beide' && k > 1) {
      for (const g of (l.seite === 'a' ? R.a : R.b)) { const sp = schwerpunkt(an, g); if (sp) { aus.thema = sp.id; break; } }
      if (aus.thema && deutlich === 'klar') deutlich = 'leicht';
    }
    aus.seite = l.seite; aus.deutlich = deutlich;
    aus.satz = l.seite === 'beide' ? A.saetze.beide : A.saetze[l.seite].replace('{d}', DEUT[deutlich]);
    aus.woher = woherText(an, R, aus, k);
    return aus;
  });
}
function woherText(an, R, r, k) {
  const texte = k === 1 ? 'deinem Text' : `deinen ${k === 2 ? 'zwei' : k === 3 ? 'drei' : 'vier'} Texten`;
  let t;
  if (R.art === 'waage') {
    const seite = (x, i) => (r.belege[x].length ? `Wörter wie ${belegListe(r.belege[x], 3)} (${pol(R.id, i)})` : `kaum Wörter für „${pol(R.id, i)}“`);
    t = `Aus ${texte}: ${seite('b', 1)} und ${seite('a', 0)}.`;
  } else if (R.art === 'dichte') {
    t = r.belege.b.length ? `Aus ${texte}: Wörter wie ${belegListe(r.belege.b, 4)} – und wie dicht sie zwischen den anderen Wörtern stehen.` : `Aus ${texte}: Dort stehen kaum solche Wörter.`;
  } else if (R.id === 'satzlaenge') t = `Aus der Länge deiner Sätze in ${texte}.`;
  else t = `Aus dem Wechsel der Wörter in ${texte}.`;
  if (r.thema) t += ` Vieles davon steht in ${anf(titelVon(r.thema))} – das liegt nahe am Thema.`;
  return t;
}

// ---------- Kleine Beobachtungen in Worten (ohne Kennzahl) ----------
export function stilNotizen(an) {
  const aus = [], z = an.zeichen;
  aus.push(z.fragen >= 2 ? 'In deinen Texten stehen Fragen – auch Fragen an dich selbst.' : z.fragen === 1 ? 'In deinen Texten steht eine Frage.' : 'Deine Texte stellen keine Fragen – sie erzählen und sagen.');
  if (z.ausrufe) aus.push(z.ausrufe >= 2 ? 'Ausrufezeichen geben deinen Texten an einigen Stellen Nachdruck.' : 'An einer Stelle gibt ein Ausrufezeichen Nachdruck.');
  if (an.merkmale.man.anzahl >= 3) aus.push('Du schreibst öfter „man“, wo auch „ich“ stehen könnte.');
  if (an.verneint.anzahl) aus.push(`Gefühlswörter nach „nicht“ oder „kein“ zählen nicht mit – bei dir zum Beispiel ${belegListe(an.verneint.belege, 2)}.`);
  return aus;
}

// ---------- Fragen an dich (Nachfragen statt Urteil, höchstens 3) ----------
export function nachfragen(an, rr = richtungen(an)) {
  const m = an.merkmale, aus = [], R = Object.fromEntries(rr.map((r) => [r.id, r]));
  if (m.absolut.anzahl >= 3) aus.push(`Du schreibst öfter Wörter wie ${belegListe(m.absolut.belege, 2)}. Stimmt das jeweils ganz genau – oder eher meistens?`);
  if (m.man.anzahl >= 3) aus.push('Du schreibst öfter „man“. Lies die Sätze noch einmal mit „ich“ statt „man“. Klingen sie dann anders?');
  if (R.haltung.seite === 'a') aus.push('Was müsste passieren, damit du bei einer Sache vom Überlegen ins Tun kommst?');
  if (R.haltung.seite === 'b') aus.push('Wann hat dir Abwarten schon einmal mehr gebracht als schnelles Handeln?');
  if (R.zeit.seite === 'b') aus.push('Welches deiner Vorhaben ist so klein, dass du es diese Woche anfangen kannst?');
  if (R.zeit.seite === 'a') aus.push('Was aus deiner Vergangenheit möchtest du mitnehmen – und was darf bleiben, wo es ist?');
  if (R.gefuehl.seite === 'a') aus.push('Wie hat sich der Tag aus der ersten Aufgabe angefühlt – in einem Wort?');
  else if (m.belastung.anzahl >= m.freude.anzahl && m.belastung.anzahl > 0) aus.push('Welche Kleinigkeit hat dir in letzter Zeit trotzdem gutgetan?');
  aus.push('Welcher Satz aus deinen Texten überrascht dich beim Wiederlesen am meisten?');
  return aus.slice(0, 3);
}

// ---------- Was das nicht heißt ----------
export const NICHT_HEISST = [
  { text: 'Eine Wortzählung erkennt keine Krankheiten und tut auch nicht so.', stufe: 'belegt', quellen: ['koutsoumpis2022'] },
  { text: 'Alter, Geschlecht, Bildung, Muttersprache und das Thema prägen Wörter stark – oft stärker als die Persönlichkeit.', stufe: 'belegt', quellen: ['newman2008'] },
  { text: 'Ironie, Zitate und ein „nicht“, das weiter weg steht, versteht die Zählung nicht.' },
  { text: 'Es gibt kein richtig oder falsch und kein „mehr als die meisten“. Der Spiegel zeigt nur, wohin deine Texte gehen – beide Seiten jeder Richtung haben ihre Stärken.' }
];

// ---------- Selbstbild (Fragebogen) und Text: nur Gesprächsanstoß ----------
export const VERGLEICH = [
  { bereich: 'extraversion', name: 'Gesellig oder ruhig', ast: 'wer', selbst: ['eher ruhig und gern für dich', 'eher gesellig'],
    forschung: { text: 'Gesellige Menschen schreiben im Mittel ein klein wenig mehr über andere Menschen und über Freude. Der Zusammenhang ist sehr schwach.', stufe: 'belegt', quellen: ['chen2020'] },
    frage: 'Wenn jemand nur deine vier Texte liest: Würde er dich eher gesellig oder eher ruhig schätzen?',
    optionen: [['hoch', 'eher gesellig'], ['niedrig', 'eher ruhig'], ['offen', 'weiß nicht']] },
  { bereich: 'stabilitaet', name: 'Gelassen oder feinfühlig', ast: 'gefuehl', selbst: ['eher feinfühlig für Stress und Sorgen', 'eher gelassen'],
    forschung: { text: 'Wer Stress und Sorgen stärker spürt, schreibt im Mittel ein klein wenig mehr Ich-Wörter. Belastungs-Wörter hängen dagegen stark von Thema und Tagesform ab.', stufe: 'belegt', quellen: ['tackman2019'] },
    frage: 'Wie wirken deine Texte auf dich: eher gelassen oder eher angespannt?',
    optionen: [['hoch', 'eher gelassen'], ['niedrig', 'eher angespannt'], ['offen', 'weiß nicht']] }
];
// Selbstbild aus dem Fragebogen in Worten (stufe −2…2 der Vorlage, ohne Werte und ohne Vergleich mit anderen)
export function selbstSeite(V, stufe) {
  if (typeof stufe !== 'number') return '';
  return stufe > 0 ? `Im Fragebogen beschreibst du dich ${V.selbst[1]}.` : stufe < 0 ? `Im Fragebogen beschreibst du dich ${V.selbst[0]}.` : 'Im Fragebogen liegst du zwischen beiden Seiten.';
}
export function textSeite(an, V, rr = richtungen(an)) {
  const r = rr.find((x) => x.id === V.ast);
  return r && r.satz ? r.satz : 'Dazu sagen deine Texte noch wenig.';
}
// Antwort auf die Wirkungs-Frage gegen die Stufe im Fragebogen (−2…2). Gibt einen Satz (mit Stufe) zurück.
export function vergleichAntwort(antwort, stufe) {
  if (antwort === 'offen') return { text: 'Eine ehrliche Antwort. Vier kurze Texte reichen dafür auch selten.' };
  if (stufe === 0) return { text: 'Im Fragebogen liegst du hier zwischen beiden Seiten – da passt beides gut zusammen.' };
  const gleich = (antwort === 'hoch' && stufe > 0) || (antwort === 'niedrig' && stufe < 0);
  if (gleich) return { text: 'Selbstbild und vermutete Wirkung zeigen in dieselbe Richtung.' };
  return { text: 'Beides kann stimmen: Der Fragebogen zeigt, wie du dich selbst siehst. Sprache hängt etwas stärker damit zusammen, wie andere dich erleben. Vielleicht zeigst du beim Schreiben eine andere Seite als im Alltag.', stufe: 'abgeleitet', quellen: ['koutsoumpis2022'] };
}

// ---------- Blindtest: Welche von drei Beschreibungen fühlt sich nach deinen Texten an? (gegen den Barnum-Effekt, ohne Wertung) ----------
export const BLIND = {
  zeit: { vorn: 'schaut mehr nach vorn als zurück', zurueck: 'schaut mehr zurück als nach vorn', gleich: 'blickt etwa gleich oft zurück und nach vorn' },
  haltung: { tun: 'schreibt mehr vom Tun als vom Zögern', abwaegen: 'schreibt mehr vom Abwägen als vom Tun', gleich: 'Tun und Abwägen halten sich die Waage' },
  satz: { kurz: 'schreibt in kurzen Sätzen', mittel: 'schreibt in mittellangen Sätzen', lang: 'schreibt in langen Sätzen' },
  gefuehl: { oft: 'nennt oft Gefühle beim Namen', manchmal: 'nennt ab und zu Gefühle', selten: 'nennt selten Gefühle beim Namen' },
  fragen: { ja: 'stellt in den Texten Fragen', nein: 'stellt kaum Fragen' }
};
export function blindProfil(an) {
  const zeit = waage(summe(an, ['vergangenheit']), summe(an, ['zukunft'])), halt = waage(summe(an, ['vorsicht']), summe(an, ['handeln']));
  const s = an.satzlaenge.mittel || 12, g = an.merkmale.freude.pro100 + an.merkmale.belastung.pro100;
  return {
    zeit: zeit.richtung === 'b' ? 'vorn' : zeit.richtung === 'a' ? 'zurueck' : 'gleich',
    haltung: halt.richtung === 'b' ? 'tun' : halt.richtung === 'a' ? 'abwaegen' : 'gleich',
    satz: s < 10 ? 'kurz' : s > 16 ? 'lang' : 'mittel',
    gefuehl: g >= 5 ? 'oft' : g < 2.5 ? 'selten' : 'manchmal',
    fragen: an.zeichen.fragen >= 2 ? 'ja' : 'nein'
  };
}
export const blindText = (p) => Object.keys(BLIND).map((k) => BLIND[k][p[k]]);
// Zwei Köder: je 2–3 Merkmale anders als das eigene Profil, untereinander verschieden. zufall() → [0,1)
export function blindKoeder(p, zufall = Math.random) {
  const schl = Object.keys(BLIND), aus = [], key = (x) => schl.map((k) => x[k]).join('|');
  let n = 0;
  while (aus.length < 2 && n++ < 200) {
    const k = { ...p }, wahl = [...schl].sort(() => zufall() - 0.5).slice(0, 2 + Math.floor(zufall() * 2));
    for (const s of wahl) { const andere = Object.keys(BLIND[s]).filter((v) => v !== p[s]); k[s] = andere[Math.floor(zufall() * andere.length)]; }
    if (key(k) !== key(p) && !aus.some((x) => key(x) === key(k))) aus.push(k);
  }
  return aus;
}
