// M4 passt – Regelwerk: Ergebnisse (bigfive, interessen.*) → Aussagen mit Stufe, Quelle, Begründung in Worten („passt zu deiner Richtung …“).
// Reine Rechnung ohne DOM und ohne kern.js → in Node testbar.
// Grundsätze: nur die Seite zeigen, zu der jemand neigt; im Mittelfeld „beides gehört zu dir“; „klar“ nur, wenn das GANZE
// Band außerhalb 45–55 liegt (KONZEPT §2.3), sonst „leicht“. Profil-Wort-Bild nur, wenn eindeutig.
// KEINE Bewertung nach außen: Zahlen (T-Werte, Bänder, Ränge) werden nur intern gerechnet, nie angezeigt. Texte nur in Worten.
import { BEREICHE, BEREICH, FACETTE_NAME, RIASEC, STAERKEN, ARBEIT, LERNEN, GEEIGNET, SELBST, ANDERE, NICHT, WACHSTUM, VORHERSAGEN, ALLTAG_REIHE } from './texte.js';

export const ABSCHNITTE = [
  { id: 'staerken', titel: 'Stärken und wo sie reiben', kurz: 'Was dir liegt – und die andere Seite davon' },
  { id: 'arbeit', titel: 'Arbeitsweise', kurz: 'Struktur, Team, Druck, Lernen, gute Zeiten' },
  { id: 'geeignet', titel: 'Wofür du geeignet bist', kurz: 'Tätigkeiten, Rollen, Projekte' },
  { id: 'selbst', titel: 'Umgang mit dir selbst', kurz: 'Erholung, innerer Kritiker, Gewohnheiten' },
  { id: 'andere', titel: 'Umgang mit anderen', kurz: 'Reden, Streit, Nähe und Abstand' },
  { id: 'wachstum', titel: 'Wachsen – wenn du willst', kurz: 'Richtungen und kleine Herausforderungen' }
];
export const FRAGEBOEGEN = {
  bigfive: { route: 'fragen/bigfive', titel: 'Persönlichkeit (Big Five)' },
  'interessen.riasec': { route: 'fragen/interessen/riasec', titel: 'Interessen' },
  'interessen.rhythmus': { route: 'fragen/interessen/rhythmus', titel: 'Tagesrhythmus' },
  'interessen.ehrlichkeit': { route: 'fragen/interessen/ehrlichkeit', titel: 'Ehrlichkeit und Bescheidenheit' }
};

export const stufeT = (t) => (t < 35 ? -2 : t < 45 ? -1 : t <= 55 ? 0 : t <= 65 ? 1 : 2);
const zahl = (x) => typeof x === 'number' && isFinite(x);
export function uhrText(h) { if (!zahl(h)) return '–'; let m = Math.round((((h % 24) + 24) % 24) * 12) * 5; m %= 1440; return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`; }

// ---------- Richtung in Worten ----------
// deutlich: 'klar' (ganzes Band auf einer Seite) | 'leicht' (Richtung zeigt sich, Band reicht in die Mitte) | 'beides'
export const deutlichAus = (l) => (!l || !l.pol ? 'beides' : l.sicher === 'klar' ? 'klar' : 'leicht');
export const DEUTLICH_WORT = { klar: 'klar', leicht: 'leicht', beides: 'beides' };
export function poleVon(id) {
  if (BEREICH[id]) return [BEREICH[id].links, BEREICH[id].rechts];
  if (id === 'ehrlichkeit') return ['Eigener Vorteil im Blick', 'Fair und bescheiden'];
  if (id === 'rhythmus') return ['Abends wach', 'Morgens wach'];
  return ['', ''];
}
// „klar in Richtung „Neugier auf Neues““ | „leicht in Richtung …“ | „beides gehört zu dir“
export function richtungWort(id, l) {
  const d = deutlichAus(l); if (d === 'beides') return 'beides gehört zu dir';
  const [a, b] = poleVon(id); return `${d} in Richtung „${l.pol > 0 ? b : a}“`;
}
export const wortT = (s) => (s > 0 ? 'Richtung rechter Pol' : s < 0 ? 'Richtung linker Pol' : 'beides');   // alt, nur noch für Prüfungen
const INTERESSE_WORT = { 2: 'zieht dich klar an', 1: 'zieht dich an', 0: 'teils, teils', '-1': 'zieht dich weniger an', '-2': 'zieht dich kaum an' };
export const interesseWort = (x) => INTERESSE_WORT[String(Math.max(-2, Math.min(2, Math.round(zahl(x && x.stufe) ? x.stufe : 0))))];
export const RHYTHMUS_WORT = { frueh: 'klar in Richtung „Morgens wach“', 'eher-frueh': 'leicht in Richtung „Morgens wach“', mittel: 'beides gehört zu dir – weder ausgeprägt früh noch spät',
  'eher-spaet': 'leicht in Richtung „Abends wach“', spaet: 'klar in Richtung „Abends wach“' };
export const RHYTHMUS_SATZ = { frueh: 'Morgens bist du klar wacher als abends.', 'eher-frueh': 'Morgens bist du eher wacher als abends.', mittel: 'Morgens und abends – beides geht bei dir.',
  'eher-spaet': 'Abends bist du eher wacher als morgens.', spaet: 'Abends bist du klar wacher als morgens.' };
export const rhythmusDeutlich = (typ) => (/^(frueh|spaet)$/.test(typ) ? 'klar' : /^eher-/.test(typ) ? 'leicht' : 'beides');

// ---------- Lage eines Bandes ----------
// T-Skala: pol −1/0/1, sicher 'klar' (ganzes Band außerhalb 45–55) | 'eher' (Wert außerhalb, Band reicht hinein) | 'mitte'.
export function lageT(b) {
  if (!b || !zahl(b.wert) || !zahl(b.unten) || !zahl(b.oben)) return null;
  const unten = Math.min(b.unten, b.oben), oben = Math.max(b.unten, b.oben);
  const klar = oben < 45 ? -1 : unten > 55 ? 1 : 0, stufe = stufeT(b.wert);
  const pol = klar || Math.sign(stufe);
  return { pol, sicher: klar ? 'klar' : stufe ? 'eher' : 'mitte', stufe, klar, wert: b.wert, unten, oben, abstand: Math.abs(b.wert - 50), skala: 'T', grob: !!b.grob };
}
// pomp-Skala (0–100, ohne Vergleich): Mittelfeld 40–60; Wort kommt aus dem Ergebnis (nie „als die meisten“).
export function lagePomp(b) {
  if (!b || !zahl(b.wert)) return null;
  const unten = zahl(b.unten) ? Math.min(b.unten, b.oben) : b.wert, oben = zahl(b.oben) ? Math.max(b.unten, b.oben) : b.wert;
  const stufe = zahl(b.stufe) ? Math.max(-2, Math.min(2, Math.round(b.stufe))) : (b.wert < 20 ? -2 : b.wert < 40 ? -1 : b.wert <= 60 ? 0 : b.wert <= 80 ? 1 : 2);
  const klar = oben < 40 ? -1 : unten > 60 ? 1 : 0, pol = klar || Math.sign(stufe);
  return { pol, sicher: klar ? 'klar' : stufe ? 'eher' : 'mitte', stufe, klar, wert: b.wert, unten, oben, abstand: Math.abs(b.wert - 50), skala: 'pomp', wort: typeof b.wort === 'string' ? b.wort : '' };
}

// ---------- Eingaben prüfen (nur bekannte Schemata, ARCH.md §3.4) ----------
export function pruefe(roh = {}) {
  const e = { bigfive: null, riasec: null, rhythmus: null, ehrlichkeit: null, unbekannt: [], fehlt: [] };
  const b = roh.bigfive, r = roh['interessen.riasec'], y = roh['interessen.rhythmus'], h = roh['interessen.ehrlichkeit'];
  const pruef = (k, wert, ok) => { if (!wert) e.fehlt.push(k); else if (ok) return true; else e.unbekannt.push(k); return false; };
  if (pruef('bigfive', b, b && b.schema === 1 && b.skala === 'T' && b.bereiche && typeof b.bereiche === 'object' && BEREICHE.some((x) => lageT(b.bereiche[x.id])))) e.bigfive = b;
  if (pruef('interessen.riasec', r, r && r.schema === 1 && r.typen && Array.isArray(r.top) && r.top.length && r.top.every((t) => RIASEC[t] && r.typen[t] && zahl(r.typen[t].wert)))) e.riasec = r;
  if (pruef('interessen.rhythmus', y, y && y.schema === 1 && typeof y.typ === 'string')) e.rhythmus = y;
  if (pruef('interessen.ehrlichkeit', h, h && h.schema === 1 && zahl(h.wert))) e.ehrlichkeit = h;
  return e;
}

// Lagen aller Bereiche (+ ehrlichkeit) und gemessene Facetten
export function lagen(E) {
  const L = {}, F = {};
  if (E.bigfive) {
    // Fragliche Antwort-Qualität (Big Five, Prüfung 17.11. F6): Bänder ja, aber keine Pol-Texte → wie Mittelfeld behandeln
    const fraglich = !!(E.bigfive.qualitaet && E.bigfive.qualitaet.fraglich);
    for (const B of BEREICHE) { const l = lageT(E.bigfive.bereiche[B.id]); if (l) L[B.id] = fraglich ? { ...l, pol: 0, klar: 0, sicher: 'mitte', fraglich: true } : l; }   // stufe bleibt: das Wort passt zum Band
    if (!fraglich) for (const [k, v] of Object.entries(E.bigfive.facetten || {})) { const l = lageT(v); if (l && FACETTE_NAME[k]) F[k] = l; }
  }
  if (E.ehrlichkeit) { const l = lagePomp(E.ehrlichkeit); if (l) L.ehrlichkeit = l; }
  return { L, F };
}
const rhythmusSeite = (y) => !y ? 0 : (y.typ === 'spaet' || y.typ === 'eher-spaet') ? -1 : (y.typ === 'frueh' || y.typ === 'eher-frueh') ? 1 : 0;

// ---------- Begründung („Weil …“) mit Zahl und Vergleich ----------
export function weilT(id, l) {
  const B = BEREICH[id]; if (!B || !l) return '';
  const lo = rund(Math.max(20, l.unten)), hi = rund(Math.min(80, l.oben));
  return `${B.name}: ${wortT(l.stufe)} (Bereich ${lo}–${hi}, Mitte 50)${l.fraglich ? ' – Antworten fraglich' : l.sicher === 'eher' ? ' – noch unsicher' : ''}`;
}
function weilH(l) { return `Ehrlichkeit-Bescheidenheit: ${l.wort || (l.pol > 0 ? 'eher fair und bescheiden' : 'eher eigener Vorteil')}${l.sicher === 'eher' ? ' – noch unsicher' : ''}`; }
function weilR(r, t) { const x = r.typen[t]; return `Interesse ${RIASEC[t].name}: ${x.wort || 'Platz ' + x.rang}${zahl(x.rang) ? ` (Platz ${x.rang} von 6)` : ''}`; }
function weilY(y) { return `Tagesrhythmus: ${y.wort || y.typ}${zahl(y.schlafmitteKorr) ? `, Schlafmitte an freien Tagen ≈ ${uhrText(y.schlafmitteKorr)} Uhr` : ''}`; }

const RANG = { klar: 0, eher: 1, mitte: 2 };
function aussage(abschnitt, id, t, weil, sicher, extra = {}) {
  const a = { id, abschnitt, text: typeof t.text === 'function' ? '' : t.text, stufe: t.stufe || 'idee', quellen: [...(t.quellen || [])], weil, sicher, ...extra };
  if (t.kosten) a.kosten = { text: t.kosten.text, stufe: t.kosten.stufe || 'idee', quellen: [...(t.kosten.quellen || [])] };
  return a;
}
// Bereiche mit Lage außerhalb der Mitte, klar vor eher, dann nach Abstand
function seiten(L) {
  return BEREICHE.map((B) => [B.id, L[B.id]]).filter(([, l]) => l && l.pol !== 0)
    .sort((a, b) => RANG[a[1].sicher] - RANG[b[1].sicher] || b[1].abstand - a[1].abstand);
}

// ---------- Profil-Name: nur wenn eindeutig ----------
// Regel: Zwei Bereiche liegen KLAR außerhalb der Mitte (ganzes Band). Bei drei oder mehr klaren Bereichen nur, wenn die zwei
// stärksten deutlich vor dem dritten liegen (Abstand ≥ 5 T-Punkte). Name = Eigenschaftswort (zweitstärkster) + Nomen (stärkster).
export const NAME_ABSTAND = 5;
const BEUGUNG = { m: 'er', n: 'es', f: 'e' };
export function profilName(L) {
  const k = BEREICHE.map((B) => [B.id, L[B.id]]).filter(([, l]) => l && l.klar !== 0).sort((a, b) => b[1].abstand - a[1].abstand);
  if (k.length < 2) return { name: null, grund: k.length ? 'eine' : 'keine', achsen: k.map(([id]) => id) };
  if (k.length > 2 && k[1][1].abstand - k[2][1].abstand < NAME_ABSTAND) return { name: null, grund: 'mehrdeutig', achsen: k.map(([id]) => id) };
  const [[id1, l1], [id2, l2]] = k;
  const [nomen, geschlecht] = BEREICH[id1].nomen[String(l1.klar)];
  const adj = BEREICH[id2].adj[String(l2.klar)] + BEUGUNG[geschlecht];
  const name = adj.charAt(0).toUpperCase() + adj.slice(1) + ' ' + nomen;
  return { name, grund: 'eindeutig', achsen: [id1, id2] };
}
export function profilNameText(p) {
  if (p.name) return `Nur ein Spitzname für dein Muster, kein Typ: Die zwei Bereiche ${p.achsen.map((a) => BEREICH[a].name).join(' und ')} liegen klar außerhalb der Mitte.`;
  if (p.grund === 'mehrdeutig') return 'Kein Profil-Name: Mehrere Bereiche liegen klar außerhalb der Mitte, ohne dass zwei deutlich vorne liegen. Ein kurzer Name würde dich verkürzen – die Balken sagen mehr.';
  if (p.grund === 'eine') return `Kein Profil-Name: Nur ein Bereich (${BEREICH[p.achsen[0]].name}) liegt klar außerhalb der Mitte. Ein Name braucht zwei.`;
  return 'Kein Profil-Name: Gemischtes Profil – das ist häufig und kein Mangel. Die Bänder sind noch breit oder liegen nahe der Mitte.';
}

// ---------- Konfliktstil (abgeleitet, Antonioni 1998) ----------
export function streitStil(L) {
  const p = (id) => (L[id] ? L[id].pol : 0);
  if (!BEREICHE.some((B) => L[B.id])) return null;
  const s = {
    durchsetzen: p('extraversion') - p('vertraeglichkeit') + p('stabilitaet'),
    ausweichen: p('vertraeglichkeit') - p('stabilitaet') - p('extraversion'),
    loesen: p('extraversion') + p('offenheit') + p('gewissenhaftigkeit') + p('vertraeglichkeit')
  };
  let best = null;
  for (const k of ['loesen', 'durchsetzen', 'ausweichen']) if (s[k] >= 2 && (!best || s[k] > s[best] || (s[k] === s[best] && k === 'durchsetzen' && p('vertraeglichkeit') < 0))) best = k;
  return best ? { stil: best, werte: s } : null;
}

// ---------- Wachstum: Richtungen bewerten ----------
const ERSATZ = { 'stabilitaet.selbstsicherheit': 'stabilitaet', 'gewissenhaftigkeit.selbstdisziplin': 'gewissenhaftigkeit', 'gewissenhaftigkeit.besonnenheit': 'gewissenhaftigkeit', 'extraversion.durchsetzung': 'extraversion', 'extraversion.erlebnishunger': 'extraversion' };
export function richtungen(L, F = {}) {
  const hatBF = BEREICHE.some((B) => L[B.id]);
  const liste = WACHSTUM.richtungen.map((r, i) => {
    const facette = r.richtung.includes('.') ? r.richtung : null;
    const l = facette && F[facette] ? F[facette] : L[facette ? ERSATZ[facette] : r.richtung];
    let punkte = 0, quelle = facette && F[facette] ? 'facette' : 'bereich';
    if (l) punkte = r.ziel === 'mehr' ? (l.pol < 0 ? 2 : l.pol === 0 ? 1 : 0) : (l.pol > 0 ? 2 : 0);
    // „Für dich einstehen“ ohne gemessene Facette: naheliegend bei hoher Verträglichkeit (eigene Wünsche kommen zu kurz)
    if (r.id === 'einstehen' && quelle === 'bereich' && (L.vertraeglichkeit || L.extraversion)) {
      const a = L.vertraeglichkeit ? L.vertraeglichkeit.pol : 0, e = L.extraversion ? L.extraversion.pol : 0;
      punkte = e > 0 ? (a > 0 ? 1 : 0) : a > 0 ? 2 : a < 0 ? 0 : 1;
    }
    const weil = !l ? '' : quelle === 'facette' ? `Facette ${FACETTE_NAME[facette]}: ${wortT(l.stufe)}` : weilT(facette ? ERSATZ[facette] : r.richtung, l);
    return { ...r, punkte, weil, nr: i, lage: l || null };
  });
  liste.sort((a, b) => b.punkte - a.punkte || a.nr - b.nr);
  // Naheliegend: höchstens 3 mit 2 Punkten; nie zwei Richtungen desselben Bereichs mit entgegengesetztem Ziel.
  const nahe = [];
  for (const r of liste) {
    if (!hatBF || r.punkte < 2 || nahe.length >= 3) continue;
    const basis = r.richtung.split('.')[0];
    if (nahe.some((n) => n.richtung.split('.')[0] === basis && n.ziel !== r.ziel)) continue;
    nahe.push(r);
  }
  return { nahe, alle: liste, hatBF };
}

// ---------- Treffer-Probe ----------
export function vorhersagen(L, max = 3) {
  return seiten(L).slice(0, max).map(([id, l]) => {
    const v = VORHERSAGEN[id];
    return { bereich: id, frage: v.frage, a: v.a, b: v.b, erwartet: l.pol > 0 ? v.hoch : (v.hoch === 'a' ? 'b' : 'a'), weil: weilT(id, l) };
  });
}

// ---------- Entwicklung zwischen zwei Big-Five-Ergebnissen ----------
// Unterschied „deutlich“, wenn er größer ist als der Messfehler beider Messungen zusammen (95 %).
export function entwicklung(alt, neu) {
  if (!alt || !neu || alt.skala !== 'T' || neu.skala !== 'T') return [];
  const r = [];
  for (const B of BEREICHE) {
    const a = alt.bereiche && alt.bereiche[B.id], n = neu.bereiche && neu.bereiche[B.id];
    if (!lageT(a) || !lageT(n)) continue;
    const se = Math.sqrt(((a.oben - a.unten) / 2 / 1.96) ** 2 + ((n.oben - n.unten) / 2 / 1.96) ** 2);
    const d = n.wert - a.wert;
    r.push({ bereich: B.id, name: B.name, diff: Math.round(d), deutlich: Math.abs(d) > 1.96 * se, grenze: Math.round(1.96 * se) });
  }
  return r;
}

// ---------- Hauptfunktion ----------
// roh: { bigfive, 'interessen.riasec', 'interessen.rhythmus', 'interessen.ehrlichkeit' } (neueste Einträge); o.alter aus den Einstellungen.
export function auswerten(roh = {}, o = {}) {
  const E = pruefe(roh), { L, F } = lagen(E), S = seiten(L);
  const A = { staerken: [], arbeit: [], geeignet: [], selbst: [], andere: [], wachstum: [] };
  const R = E.riasec, Y = E.rhythmus, ys = rhythmusSeite(Y);
  const top = R ? R.top.slice(0, 3) : [];
  const pol = (id) => (L[id] ? L[id].pol : 0);

  // Stärken mit Preis
  for (const [id, l] of S) A.staerken.push(aussage('staerken', `st-${id}-${l.pol}`, STAERKEN[id][String(l.pol)], weilT(id, l), l.sicher, { bereich: id, pol: l.pol }));
  if (L.ehrlichkeit && L.ehrlichkeit.pol) A.staerken.push(aussage('staerken', `st-ehrlichkeit-${L.ehrlichkeit.pol}`, STAERKEN.ehrlichkeit[String(L.ehrlichkeit.pol)], weilH(L.ehrlichkeit), L.ehrlichkeit.sicher, { bereich: 'ehrlichkeit', pol: L.ehrlichkeit.pol }));
  if (R && R.typen[top[0]].stufe >= 1) {
    const t = STAERKEN.interesse;
    A.staerken.push({ ...aussage('staerken', `st-interesse-${top[0]}`, t, weilR(R, top[0]), R.typen[top[0]].stufe >= 2 ? 'klar' : 'eher', { bereich: 'interessen' }), text: t.text(RIASEC[top[0]].name) });
  }
  if (ys) { const k = ys < 0 ? 'spaet' : 'frueh'; A.staerken.push(aussage('staerken', `st-${k}`, STAERKEN[k], weilY(Y), /^(spaet|frueh)$/.test(Y.typ) ? 'klar' : 'eher', { bereich: 'rhythmus', pol: ys })); }

  // Arbeitsweise
  for (const [id, l] of S) if (ARBEIT[id]) A.arbeit.push(aussage('arbeit', `ar-${id}-${l.pol}`, ARBEIT[id][String(l.pol)], weilT(id, l), l.sicher, { bereich: id, pol: l.pol, titel: ARBEIT[id].titel }));
  if (Y && Y.fokus && zahl(Y.fokus.von)) {
    const f2 = Y.fokus2 && zahl(Y.fokus2.von) ? ` und noch einmal etwa von ${uhrText(Y.fokus2.von)} bis ${uhrText(Y.fokus2.bis)} Uhr` : '';
    A.arbeit.push(aussage('arbeit', 'ar-zeit', { text: `Schwere Aufgaben gelingen dir vermutlich am besten etwa von ${uhrText(Y.fokus.von)} bis ${uhrText(Y.fokus.bis)} Uhr${f2}.`, stufe: 'abgeleitet', quellen: ['schmidt2007'] }, weilY(Y), 'eher', { bereich: 'rhythmus', titel: 'Beste Zeit für schwere Aufgaben' }));
    if (Y.ideen && zahl(Y.ideen.von)) A.arbeit.push(aussage('arbeit', 'ar-einfall', { text: `Für Aufgaben, die einen Einfall brauchen, kann die „falsche“ Tageszeit helfen – bei dir etwa ${uhrText(Y.ideen.von)} bis ${uhrText(Y.ideen.bis)} Uhr.`, stufe: 'abgeleitet', quellen: ['wieth2011'] }, weilY(Y), 'eher', { bereich: 'rhythmus', titel: 'Zeit für Einfälle' }));
  }
  A.arbeit.push(aussage('arbeit', 'ar-lernen', LERNEN.alle, 'gilt für alle Menschen, unabhängig vom Profil', 'alle', { titel: 'Lernen' }));
  for (const [id, l] of S) { const t = LERNEN[id] && LERNEN[id][String(l.pol)]; if (t) A.arbeit.push(aussage('arbeit', `ar-lernen-${id}`, t, weilT(id, l), l.sicher, { bereich: id, pol: l.pol, titel: 'Lernen' })); }
  A.arbeit.push(aussage('arbeit', 'ar-lernstile', LERNEN.stile, 'gilt für alle Menschen', 'alle', { titel: 'Lernen' }));

  // Wofür geeignet
  if (R) {
    A.geeignet.push(aussage('geeignet', 'ge-passung', GEEIGNET.passung, 'gilt für alle Menschen', 'alle'));
    top.forEach((t, i) => A.geeignet.push(aussage('geeignet', `ge-int-${t}`, { text: `${RIASEC[t].taetigkeit} Im Team oft: ${RIASEC[t].rolle}.`, stufe: i === 0 && R.typen[t].stufe >= 1 ? 'abgeleitet' : 'idee', quellen: i === 0 && R.typen[t].stufe >= 1 ? ['nye2012'] : [] }, weilR(R, t), R.typen[t].stufe >= 1 ? 'eher' : 'mitte', { bereich: 'interessen', titel: RIASEC[t].name })));
  }
  for (const [id, l] of S) { const t = GEEIGNET.bereiche[id] && GEEIGNET.bereiche[id][String(l.pol)]; if (t) A.geeignet.push(aussage('geeignet', `ge-${id}-${l.pol}`, t, weilT(id, l), l.sicher, { bereich: id, pol: l.pol })); }
  const formate = GEEIGNET.formate.filter((f) => Object.entries(f.wenn).every(([k, v]) => k === 'interesse' ? top.includes(v) : pol(k) === v)).slice(0, 4);
  formate.forEach((f, i) => A.geeignet.push(aussage('geeignet', `ge-format-${i}`, { text: f.text, stufe: 'idee' }, Object.entries(f.wenn).map(([k, v]) => k === 'interesse' ? `Interesse ${RIASEC[v].name}` : weilT(k, L[k])).join(' · '), 'idee', { titel: 'Format-Idee' })));
  if (R && top[0]) {
    const tempo = pol('gewissenhaftigkeit') > 0 ? 'jede Woche ein festes Stück, mit Plan' : pol('gewissenhaftigkeit') < 0 ? 'in kurzen Etappen, mit jemandem, der nachfragt' : 'mit einem festen Termin pro Woche';
    A.geeignet.push(aussage('geeignet', 'ge-projekt', { text: `Ein Projekt für die nächsten vier Wochen: ${RIASEC[top[0]].projekt} – ${tempo}.`, stufe: 'idee' }, weilR(R, top[0]) + (L.gewissenhaftigkeit ? ' · ' + weilT('gewissenhaftigkeit', L.gewissenhaftigkeit) : ''), 'idee', { titel: 'Was du damit erreichen kannst' }));
    A.geeignet.push(aussage('geeignet', 'ge-koennen', GEEIGNET.koennen, 'gilt für alle Menschen', 'alle'));
  }

  // Umgang mit dir selbst
  if (E.bigfive) A.selbst.push(aussage('selbst', 'se-alle', SELBST.alle, 'gilt für alle Menschen', 'alle'));
  for (const [id, l] of S) (SELBST[id] && SELBST[id][String(l.pol)] || []).forEach((t, i) => A.selbst.push(aussage('selbst', `se-${id}-${l.pol}-${i}`, t, weilT(id, l), l.sicher, { bereich: id, pol: l.pol })));
  if (Y && zahl(Y.sozialerJetlag) && Y.sozialerJetlag >= 2) {
    const h = (Math.round(Y.sozialerJetlag * 2) / 2).toLocaleString('de-DE');
    A.selbst.push({ ...aussage('selbst', 'se-jetlag', SELBST.jetlag, weilY(Y) + `, Unterschied ${h} Std.`, 'klar', { bereich: 'rhythmus' }), text: SELBST.jetlag.text(h) });
    A.selbst.push(aussage('selbst', 'se-licht', SELBST.licht, weilY(Y), 'eher', { bereich: 'rhythmus' }));
  }
  if (ys < 0) A.selbst.push(aussage('selbst', 'se-morgen', SELBST.spaetMorgen, weilY(Y), 'eher', { bereich: 'rhythmus' }));

  // Umgang mit anderen
  for (const [id, l] of S) { const t = ANDERE.reden[id] && ANDERE.reden[id][String(l.pol)]; if (t) A.andere.push(aussage('andere', `an-reden-${id}-${l.pol}`, t, weilT(id, l), l.sicher, { bereich: id, pol: l.pol, titel: 'Reden und zuhören' })); }
  const st = streitStil(L);
  if (st) {
    const beteiligt = { durchsetzen: ['extraversion', 'vertraeglichkeit', 'stabilitaet'], ausweichen: ['vertraeglichkeit', 'stabilitaet', 'extraversion'], loesen: ['extraversion', 'offenheit', 'gewissenhaftigkeit', 'vertraeglichkeit'] }[st.stil];
    const ws = beteiligt.filter((id) => L[id] && L[id].pol !== 0);
    A.andere.push(aussage('andere', `an-streit-${st.stil}`, ANDERE.streit[st.stil], ws.map((id) => weilT(id, L[id])).join(' · '), ws.every((id) => L[id].sicher === 'klar') ? 'klar' : 'eher', { titel: 'Im Streit', stil: st.stil }));
  }
  const n = L.extraversion && L.extraversion.pol && ANDERE.naehe.extraversion[String(L.extraversion.pol)];
  if (n) A.andere.push(aussage('andere', `an-naehe-${L.extraversion.pol}`, n, weilT('extraversion', L.extraversion), L.extraversion.sicher, { bereich: 'extraversion', pol: L.extraversion.pol, titel: 'Nähe und Abstand' }));
  if (L.ehrlichkeit && L.ehrlichkeit.pol) A.andere.push(aussage('andere', `an-ehrlich-${L.ehrlichkeit.pol}`, ANDERE.ehrlichkeit[String(L.ehrlichkeit.pol)], weilH(L.ehrlichkeit), L.ehrlichkeit.sicher, { bereich: 'ehrlichkeit', pol: L.ehrlichkeit.pol, titel: 'Fairness' }));

  // Wachstum (Texte; die Richtungen kommen aus richtungen())
  const W = richtungen(L, F);
  A.wachstum.push(aussage('wachstum', 'wa-anders', WACHSTUM.anders, 'gilt für alle Menschen', 'alle'));
  A.wachstum.push(aussage('wachstum', 'wa-einstieg', WACHSTUM.einstieg, 'gilt für alle Menschen', 'alle'));
  A.wachstum.push(aussage('wachstum', 'wa-machen', WACHSTUM.machen, 'gilt für alle Menschen', 'alle'));
  A.wachstum.push(aussage('wachstum', 'wa-selbst', WACHSTUM.vonSelbst, 'gilt für alle Menschen', 'alle'));

  // Kurz gesagt: drei Stärken (klar zuerst)
  const kurz = A.staerken.filter((a) => a.sicher !== 'mitte').slice(0, 3);
  return {
    eingaben: E, L, F, abschnitte: A, kurz, richtungen: W, name: profilName(L), streit: st,
    mitte: BEREICHE.filter((B) => L[B.id] && L[B.id].pol === 0 && !L[B.id].fraglich).map((B) => B.id),
    fraglich: !!(E.bigfive && E.bigfive.qualitaet && E.bigfive.qualitaet.fraglich),
    vorhersagen: vorhersagen(L), nicht: NICHT, u16: o.alter === 'u16'
  };
}
