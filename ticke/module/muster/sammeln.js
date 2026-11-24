// muster – sammelt aeste() und muster(k) aus allen Modulen der Liste (module/liste.js), baut Verbindungen und die Sätze
// „So bist du zusammengesetzt“. Jedes Modul einzeln mit try/catch: Fehlt ein Export oder geht ein Modul nicht, wird es
// übersprungen. Doppelte Ast-IDs: der erste gewinnt. Verwandte IDs, die es nicht gibt, fallen still weg.
import { VERBINDUNGEN } from './verbindungen.js';
import { SEITEN, KOMBIS, seitenVon, erfuellt, waehle, kombiNachbarn } from './kombis.js';

export const BEREICH_REIHE = ['Persönlichkeit', 'Denkweise', 'Werte', 'Entscheiden', 'Beziehungen', 'Interessen', 'Rhythmus', 'Sprache', 'Üben'];
export const slug = (t) => String(t || '').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const DEUTLICH = new Set(['klar', 'leicht', 'beides']);
const liste = (x) => (Array.isArray(x) ? x.filter((v) => v != null && v !== '') : []);
const text = (x) => (typeof x === 'string' ? x : '');

const BASIS = new URL('../../', import.meta.url);
const IMPORTE = new Map();
function importiere(info) {
  if (!IMPORTE.has(info.id)) {
    IMPORTE.set(info.id, import(new URL(info.datei, BASIS).href).catch((e) => { IMPORTE.delete(info.id); throw e; }));
  }
  return IMPORTE.get(info.id);
}
const AESTE_CACHE = new Map();               // modul → normalisierte Äste (Inhalt hängt nicht von Antworten ab)

function normAst(a, modul) {
  if (!a || typeof a.id !== 'string' || !a.id || !a.titel) return null;
  const pole = Array.isArray(a.pole) && a.pole.length === 2 && a.pole.every((p) => p && p.name) ? a.pole : null;
  const wege = Array.isArray(a.wege) && a.wege.length >= 2 && a.wege.every((p) => p && p.name) ? a.wege : null;
  return {
    id: a.id, titel: String(a.titel), modul, bereich: a.bereich ? String(a.bereich) : 'Weitere', pole, wege,
    wasEsIst: text(a.wasEsIst), imAlltag: liste(a.imAlltag), staerken: liste(a.staerken), reibung: liste(a.reibung),
    weiterdenken: liste(a.weiterdenken), ueben: liste(a.ueben).filter((u) => u && u.titel && typeof u.route === 'string'),
    verwandt: liste(a.verwandt).filter((v) => typeof v === 'string'),
    unteraeste: liste(a.unteraeste).filter((u) => u && u.titel), wissen: text(a.wissen),
    fragen: !!a.fragen, nurLernen: !!a.nurLernen
  };
}
function normEintrag(e, modul) {
  if (!e || typeof e.ast !== 'string' || !e.ast) return null;
  const deutlich = DEUTLICH.has(e.deutlich) ? e.deutlich : 'leicht';
  return { ...e, modul, deutlich, titel: text(e.titel), richtung: text(e.richtung), woher: text(e.woher) };
}

// ---------- Ersatz: Vorlage-Ergebnisse lesen, wenn ein Modul (noch) kein muster() hat ----------
const BF = {
  offenheit: ['Offenheit', 'Halt im Vertrauten', 'Neugier auf Neues'],
  gewissenhaftigkeit: ['Gewissenhaftigkeit', 'Spontan und locker', 'Geplant und gründlich'],
  extraversion: ['Extraversion', 'Ruhig und für dich', 'Gesellig und aktiv'],
  vertraeglichkeit: ['Verträglichkeit', 'Direkt und kritisch', 'Rücksichtsvoll und mitfühlend'],
  stabilitaet: ['Emotionale Stabilität', 'Spürt Druck deutlich', 'Gelassen']
};
function satz(deutlich, a, b, seite) {
  if (deutlich === 'beides') return `Beides gehört zu dir: „${a}“ und „${b}“.`;
  return `${deutlich === 'klar' ? 'Klar' : 'Leicht'} in Richtung „${seite > 0 ? b : a}“.`;
}
export function ersatz(k, modul) {
  const S = k && k.speicher; if (!S) return [];
  const raus = [];
  try {
    if (modul === 'bigfive') {
      const e = S.ergebnis('bigfive'), B = e && e.bereiche;
      if (B) for (const [id, [titel, a, b]] of Object.entries(BF)) {
        const st = B[id] && B[id].stufe; if (typeof st !== 'number') continue;
        const deutlich = st === 0 ? 'beides' : Math.abs(st) >= 2 ? 'klar' : 'leicht';
        raus.push({ ast: 'bigfive.' + id, titel, deutlich, richtung: satz(deutlich, a, b, st), wort: deutlich === 'beides' ? 'beides' : st > 0 ? b : a, woher: 'Aus deinen Antworten im Fragebogen zur Persönlichkeit.', ersatz: true });
      }
    }
    if (modul === 'interessen') {
      const r = S.ergebnis('interessen.rhythmus'), T = { frueh: [-2], 'eher-frueh': [-1], mittel: [0], 'eher-spaet': [1], spaet: [2] };
      if (r && T[r.typ]) {
        const st = T[r.typ][0], deutlich = st === 0 ? 'beides' : Math.abs(st) >= 2 ? 'klar' : 'leicht';
        raus.push({ ast: 'interessen.rhythmus', titel: 'Tagesrhythmus', deutlich, richtung: satz(deutlich, 'Früh wach', 'Spät wach', st), wort: deutlich === 'beides' ? 'dazwischen' : st > 0 ? 'Spät wach' : 'Früh wach', woher: 'Aus deinen Schlafzeiten im Tagesrhythmus.', ersatz: true });
      }
    }
  } catch (f) { console.warn('muster: Ersatz für', modul, f); }
  return raus;
}

// ---------- IDs auflösen (exakt → ohne Groß/klein → gleiches Modul + gleicher letzter Teil) ----------
function finder(ids) {
  const genau = new Set(ids), klein = new Map(), teil = new Map();
  for (const id of ids) {
    const l = id.toLowerCase(); if (!klein.has(l)) klein.set(l, id);
    const [mod] = l.split('.'); const letzt = l.split(/[._-]/).pop();
    const k = mod + '|' + letzt; teil.set(k, teil.has(k) ? null : id);   // null = mehrdeutig
  }
  return (wunsch) => {
    if (typeof wunsch !== 'string' || !wunsch) return null;
    if (genau.has(wunsch)) return wunsch;
    const l = wunsch.toLowerCase(); if (klein.has(l)) return klein.get(l);
    const [mod] = l.split('.'); const t = teil.get(mod + '|' + l.split(/[._-]/).pop());
    return t || null;
  };
}

// ---------- Sammeln ----------
// selbst: die Exporte dieses Moduls ({ aeste, muster }), damit es sich nicht selbst importieren muss.
export async function sammle(k, selbst) {
  const infos = (k.module || []).filter((m) => m && m.id && m.datei);
  if (!infos.some((m) => m.id === 'muster')) infos.push({ id: 'muster', name: 'Muster und Verästelungen', datei: null });
  const geladen = await Promise.all(infos.map(async (info) => {
    if (info.id === 'muster') return { info, mod: selbst };
    try { return { info, mod: await importiere(info) }; } catch (e) { console.warn('muster: Modul nicht ladbar', info.id, e); return { info, mod: null }; }
  }));
  const aeste = [], nachId = new Map(), eintraege = [], stand = [];
  for (const { info, mod } of geladen) {
    const s = { id: info.id, name: info.name || info.id, aeste: 0, muster: false, antworten: !!(mod && typeof mod.antwortListe === 'function'), ersatz: false };
    // Äste (einmal je Modul, dann aus dem Speicher)
    let A = AESTE_CACHE.get(info.id);
    if (!A && mod && typeof mod.aeste === 'function') {
      try { A = liste(mod.aeste()).map((a) => normAst(a, info.id)).filter(Boolean); AESTE_CACHE.set(info.id, A); } catch (e) { console.warn('muster: aeste() von', info.id, e); A = []; }
    }
    for (const a of A || []) if (!nachId.has(a.id)) { nachId.set(a.id, a); aeste.push(a); s.aeste++; }
    // Richtungen (jedes Mal neu: hängen von den Antworten ab)
    let E = null;
    if (mod && typeof mod.muster === 'function') {
      try { E = liste(mod.muster(k)); s.muster = true; } catch (e) { console.warn('muster: muster() von', info.id, e); E = []; }
    } else { E = ersatz(k, info.id); s.ersatz = E.length > 0; }
    for (const e of E) { const n = normEintrag(e, info.id); if (n) eintraege.push(n); }
    stand.push(s);
  }
  return baue(aeste, nachId, eintraege, stand, k);
}

// Baut aus Ästen und Einträgen alles, was die Ansichten brauchen (auch in Node testbar).
export function baue(aeste, nachId, eintraege, stand = [], k = null) {
  const finde = finder([...new Set([...aeste.map((a) => a.id), ...eintraege.map((e) => e.ast)])]);
  // Einträge je Ast (erster gewinnt), mit Seiten für die Kombinationen
  const kanon = new Map();                          // echte ID → kanonische ID (SEITEN/KOMBIS-Schreibweise)
  for (const id of [...Object.keys(SEITEN), ...KOMBIS.flatMap((K) => K.braucht.map(([x]) => x))]) { const e = finde(id); if (e && !kanon.has(e)) kanon.set(e, id); }
  const richtung = new Map();
  for (const e0 of eintraege) {
    const id = finde(e0.ast) || e0.ast; if (richtung.has(id)) continue;
    const ast = nachId.get(id) || null;
    const e = { ...e0, ast: id, titel: e0.titel || (ast && ast.titel) || id };
    e.seiten = seitenVon(e, ast, kanon.get(id) || id);
    e.wort = kurzWort(e, ast);
    richtung.set(id, e);
  }
  // Nachbarn (beide Richtungen): eigene verwandt-Listen + VERBINDUNGEN
  const nachbar = new Map(aeste.map((a) => [a.id, new Set()]));
  const verbinde = (x, y) => { if (!x || !y || x === y || !nachbar.has(x) || !nachbar.has(y)) return; nachbar.get(x).add(y); nachbar.get(y).add(x); };
  for (const a of aeste) for (const v of a.verwandt) verbinde(a.id, finde(v));
  for (const [x, ys] of Object.entries(VERBINDUNGEN)) for (const y of ys) verbinde(finde(x), finde(y));
  const verwandtVon = new Map(aeste.map((a) => [a.id, [...new Set(a.verwandt.map(finde))].filter((v) => v && v !== a.id && nachId.has(v))]));
  // Kombinationen
  const lagen = new Map();
  for (const [echt, kan] of kanon) { const e = richtung.get(echt); if (e) lagen.set(kan, { seiten: e.seiten, deutlich: e.deutlich }); }
  const regeln = erfuellt(lagen);
  // Bereiche in fester Reihenfolge
  const bereiche = [...new Set([...BEREICH_REIHE.filter((b) => aeste.some((a) => a.bereich === b)), ...aeste.map((a) => a.bereich)])]
    .map((name) => ({ name, slug: slug(name), aeste: aeste.filter((a) => a.bereich === name) }));
  const S = { aeste, nachId, richtung, nachbar, verwandtVon, regeln, bereiche, stand, finde, kanon, k };
  S.saetze = zusammensetzen(S);
  return S;
}

// Kurzes Richtungs-Wort für den Baum (ohne Zahl): eigenes wort/kurz → Pol-Name → Pol-Name im Satz → gekürzter Satz.
function kurzWort(e, ast) {
  if (e.deutlich === 'beides' && !e.wort) return 'beides';
  for (const f of [e.wort, e.kurz]) if (typeof f === 'string' && f.trim()) return f.trim();
  const P = ast && (ast.pole || ast.wege);
  if (P && (e.pol === 0 || e.pol === 1) && P[e.pol]) return P[e.pol].name;
  if (P) { const t = e.richtung.toLowerCase(); const da = P.filter((p) => t.includes(String(p.name).toLowerCase())); if (da.length === 1) return da[0].name; }
  const r = e.richtung.replace(/^(Klar|Leicht) in Richtung\s*/i, '').replace(/[„“"]/g, '');
  return r.length > 40 ? r.slice(0, 38).replace(/\s+\S*$/, '') + ' …' : r;
}

// ---------- „So bist du zusammengesetzt“: 3–6 Sätze ----------
function zusammensetzen(S) {
  const saetze = [];
  const benutzt = new Set();
  for (const K of waehle(S.regeln, 3)) {
    const ids = K.braucht.map(([id]) => S.finde(id)).filter(Boolean);
    saetze.push({ text: K.satz, aeste: ids, art: 'kombi', id: K.id }); ids.forEach((i) => benutzt.add(i));
  }
  const reihe = (e) => { const a = S.nachId.get(e.ast); const b = a ? BEREICH_REIHE.indexOf(a.bereich) : 99; return (b < 0 ? 50 : b); };
  const einzeln = [...S.richtung.values()].filter((e) => e.deutlich !== 'beides' && !benutzt.has(e.ast))
    .sort((x, y) => (x.deutlich === y.deutlich ? 0 : x.deutlich === 'klar' ? -1 : 1) || reihe(x) - reihe(y));
  const bereicheDa = new Set();
  for (const e of einzeln) {
    if (saetze.length >= 5) break;
    const a = S.nachId.get(e.ast), b = a ? a.bereich : e.modul;
    if (bereicheDa.has(b)) continue;
    bereicheDa.add(b); benutzt.add(e.ast);
    saetze.push({ text: `${e.titel}: ${e.richtung}`, aeste: [e.ast], art: 'einzeln' });
  }
  const beides = [...S.richtung.values()].filter((e) => e.deutlich === 'beides' && !benutzt.has(e.ast)).slice(0, 3);
  if (beides.length && saetze.length < 6) {
    const n = beides.map((e) => `„${e.titel}“`);
    const t = n.length === 1 ? n[0] : n.slice(0, -1).join(', ') + ' und ' + n[n.length - 1];
    saetze.push({ text: `Bei ${t} gehört beides zu dir – du kannst je nach Lage zwischen den Polen wechseln.`, aeste: beides.map((e) => e.ast), art: 'beides' });
  }
  return saetze.slice(0, 6);
}

// ---------- Nachbarn für „Weiter springen“ ----------
export function springen(S, id) {
  const a = S.nachId.get(id); if (!a) return { verwandt: [], geschwister: [], ferne: [] };
  const gesehen = new Set([id]);
  const nimm = (ids, max = 99) => { const r = []; for (const x of ids) { if (r.length >= max) break; if (!x || gesehen.has(x) || !S.nachId.has(x)) continue; gesehen.add(x); r.push(S.nachId.get(x)); } return r; };
  const verwandt = nimm([...(S.verwandtVon.get(id) || []), ...(S.nachbar.get(id) || [])], 6);
  const geschwister = nimm(S.aeste.filter((x) => x.bereich === a.bereich).map((x) => x.id), 8);
  const kan = S.kanon.get(id) || id;
  const kombi = kombiNachbarn(kan).map(S.finde).filter(Boolean);
  const anderer = (x) => S.nachId.has(x) && S.nachId.get(x).bereich !== a.bereich;
  const mitRichtung = (x) => (S.richtung.has(x) ? 0 : 1);
  const kandidaten = [...kombi.filter(anderer).sort((x, y) => mitRichtung(x) - mitRichtung(y)),
    ...[...(S.nachbar.get(id) || [])].filter(anderer)];
  const ferne = nimm(kandidaten, 2);
  return { verwandt, geschwister, ferne };
}
