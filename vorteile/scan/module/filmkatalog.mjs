// Modul "filmkatalog" (Xander 28.11.2026): „ALLE Filme für 3,99 € – nicht nur die Apple-Angebotsräume, auch Titel, die außerhalb
// der Kategorien 3,99 € kosten … Spalten je Genre, aber VOLLSTÄNDIG innerhalb der Genres“ und „Serien: Staffeln im Angebot für
// 4,99 € (9,99 € lohnt nicht) – eigene Spalte“.
//
// Ehrlich: Apple hat keine Schnittstelle, die alle Filme eines Preises auflistet. Die Legacy-Charts (RSS als JSON) zeigen je Genre
// höchstens 100 Titel (limit=200 = dieselben 100, echter Lauf 43796648997). Darum baut der Radar einen KATALOG auf: jeder Film und
// jede Staffel, die er je in einem Genre-Chart oder in einer Box gesehen hat, bleibt gemerkt (zustand.filmkatalog) und bekommt
// reihum einen frischen Preis über die Lookup-Schnittstelle (bis lookupMax Nummern je Abruf; /lookup erlaubt die robots.txt).
// So bleiben auch Filme sichtbar, die aus den Top 100 gefallen sind. Vollständig ist das nur so weit, wie Apple einen Titel
// irgendwann in einem Chart (oder einer Box) zeigt – die Seite nennt darum, wie viele Titel der Radar kennt und geprüft hat.
//
// Quellen (alle über holeText, also Regel-Wache + Roh-Mitschnitt):
//  - dieselben Chart-Adressen wie Modul „filme“ (Hauptgenres limit=100, breite Genres limit=200, Serien) – lief „filme“ im selben
//    Lauf, sind sie gemerkt (lib/robots.mjs: Schnittstellen-Adresse nie zweimal je Lauf) und kosten keinen Abruf; dazu höchstens
//    neueCharts weitere Genres je Lauf (am längsten nicht geholte zuerst),
//  - iTunes Lookup (deutscher Store): Preise, Bilder, Links; Box-Nummer (collectionId) jedes Films,
//  - Box-Inhalt: Lookup der Box mit entity=movie (einzelne Teile einer Box, z. B. „Police Academy“-Box) – Format im Roh-Lauf prüfen;
//    ohne Antwort zählen die Filme, deren eigener Lookup die Box nennt.
// Boxen: jede Box, die ein Lookup nennt, kommt zusätzlich in die Box-Liste des Moduls „filme“ (zustand.filme.boxen; dort Preis,
// „deutlich reduziert“, Knüller) – so findet der Radar mehr Boxen im Angebot.
// Ausgabe: <data>/filmkatalog.json für die Seite (Reiter „Filme“: „Alle 3,99 €“, „Staffeln 4,99 €“, Inhalt der Boxen). Keine Pushes
// (die kommen weiter vom Modul „filme“: Wunschliste, Most Wanted, Angebote).
import { round } from '../lib/text.mjs';
import { berlinTag } from '../lib/ende.mjs';
import { istRegelSperre } from '../lib/robots.mjs';
import {
  chartUrl, serienChartUrl, lookupUrl, leseCharts, leseErgebnisse, ausItunes, boxVon, fremdStore, ladeListen, horrorText,
  staffelInfo, komplettInfo,
} from './filme.mjs';

const APPLE = 'https://itunes.apple.com';
export const KATALOG = {
  filmMax: 3.99, // „Alle 3,99 €“: Kaufpreis höchstens so viel
  staffelMax: 4.99, // „Staffeln 4,99 €“
  zeigeMax: 4.99, // Bild/Link nur für Titel bis zu diesem Preis merken (Zustand bleibt klein)
  maxCharts: 45, // Chart-Abrufe je Lauf insgesamt (gemerkte Adressen des Moduls „filme“ zählen mit, kosten aber nichts)
  neueCharts: 8, // davon höchstens so viele Genres, die „filme“ in diesem Lauf nicht geholt hat
  maxLookups: 8, // Lookup-Abrufe je Lauf (Preise, Box-Inhalte)
  lookupMax: 150, // Nummern je Lookup
  boxInhaltMax: 20, // Box-Inhalte je Lauf (ein Lookup mit entity=movie)
  boxInhaltTage: 7, // Box-Inhalt so oft neu holen
  lookupNeuTage: 14, // Film aus den Charts so oft auch per Lookup (Box-Nummer, Kauf HD/SD)
  frischTage: 2, // Preis höchstens so alt (Tage) -> steht auf der Seite; älter = „ungeprüft“
  fehltNach: 3, // so oft in einer erfolgreichen Lookup-Antwort gefehlt -> nicht mehr im Store, aus dem Katalog
  vergessenTage: 120, // so lange in keinem Chart und nie mehr erfolgreich geprüft -> vergessen
  maxKatalog: 8000, // Titel im Katalog höchstens (älteste zuerst raus)
  bisSek: 150, // danach keine Abrufe mehr (main bricht ein Modul nach 240 s ab)
  ausgabeMax: 1500, // Titel je Liste in der Datei höchstens
};

const tagNrVon = tag => Math.round(Date.parse(`${tag}T00:00:00Z`) / 864e5);
const tagVonNr = n => new Date(n * 864e5).toISOString().slice(0, 10);
const ct = v => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.round(v * 100) : 0);
const eur = c => (c > 0 ? round(c / 100, 2) : null);
const liste = v => (v == null ? [] : Array.isArray(v) ? v : [v]);
const nrVon = id => String(id ?? '').replace(/^itunes:/, '');
const istHorror = (genre, genreId, horrorIds) => /horror/i.test(String(genre || '')) || (genreId != null && horrorIds.has(Number(genreId)));

/** Genres aus filme.json (charts): Filme und Staffeln mit der Adresse, die auch Modul „filme“ benutzt. */
export function katalogGenres(listen) {
  const c = listen?.charts || {};
  const horror = new Set(liste(c.horror ?? [4408]).map(Number));
  const breit = c.breit && typeof c.breit === 'object' && c.breit.aktiv !== false ? c.breit : null;
  const breitLimit = breit ? Math.min(200, Math.max(100, Number(breit.limit) || 200)) : 100;
  const haupt = [...liste(c.neu), ...liste(c.angebot)];
  const out = new Map();
  const dazu = (g, art, url, quelle) => {
    const id = g?.id == null ? null : Number(g.id);
    if (art === 'film' && (!Number.isInteger(id) || horror.has(id))) return;
    if (art === 'staffel' && id != null && !Number.isInteger(id)) return;
    const key = `${art === 'film' ? 'f' : 's'}${id ?? 'alle'}`;
    if (!out.has(key)) out.set(key, { key, id, name: String(g?.name || (id == null ? 'Alle Serien' : id)), art, url, quelle });
  };
  for (const g of haupt) dazu(g, 'film', chartUrl(g.id), 'haupt');
  if (breit) for (const g of liste(breit.filme)) dazu(g, 'film', chartUrl(g.id, breitLimit), 'breit');
  for (const g of liste(c.suche)) dazu(g, 'film', chartUrl(g.id), 'suche');
  if (c.serien !== false) for (const g of liste(c.serien ?? [{ id: null, name: 'Alle Serien' }])) dazu(g, 'staffel', serienChartUrl(g?.id ?? null), 'haupt');
  if (breit) for (const g of liste(breit.serien)) dazu(g, 'staffel', serienChartUrl(g.id, breitLimit), 'breit');
  return { genres: [...out.values()], horror };
}

/** Preis eines Katalog-Eintrags fortschreiben (ct = Cent; 0 = kein Kaufpreis). */
// Kurzprüfung 28.11.2026: ohne Kaufpreis (nur Leihe/Vorbestellung) merkt np = 1 – der alte Preis gilt dann NICHT als frisch
// geprüft (vorher stand er als „3,99 € heute geprüft“ weiter auf der Seite); Historie (p/v/tp/h) bleibt für später.
export function merkePreisK(o, c, tagNr) {
  if (!(c > 0)) { o.k = tagNr; o.np = 1; return o; }
  delete o.np;
  if (o.p !== c) { if (o.p > 0) o.v = o.p; o.p = c; o.ps = tagNr; }
  if (!(o.tp > 0) || c < o.tp) { o.tp = c; o.tt = tagNr; }
  o.h = Math.max(o.h || 0, c);
  o.k = tagNr;
  return o;
}

/** Katalog-Eintrag -> Eintrag der Datei (für die Seite). */
function aus(nr, o, art, genreNamen) {
  const seit = o.ps ? tagVonNr(o.ps) : null;
  const e = {
    id: `itunes:${nr}`, typ: art, titel: o.t, jahr: o.j ?? null, preis: eur(o.p), leihe: eur(o.l),
    bild: o.b || null, link: o.u || `https://itunes.apple.com/de/${art === 'film' ? 'movie' : 'tv-season'}/id${nr}`,
    genres: (o.g || []).filter(g => genreNamen.has(g)), seit, tiefst: o.tp ? { p: eur(o.tp), tag: tagVonNr(o.tt) } : null,
    vorher: o.v && o.v > o.p ? eur(o.v) : null, pos: o.pos ?? null, quelle: 'Apple',
  };
  if (art === 'staffel') { e.serie = o.se || null; e.nr = o.nr ?? null; if (o.ko) e.komplett = true; }
  if (o.x) e.box = `itunes:${o.x}`;
  return e;
}

export default async function filmkatalog(ctx) {
  const { holeText, cfg, zustand, jetzt = new Date() } = ctx;
  const m = { ...KATALOG, ...(cfg?.module?.filmkatalog || {}) };
  const fehler = [];
  let listen = ctx.filmListen;
  if (!listen) {
    try { listen = await ladeListen(); } catch (e) { return { eintraege: [], fehler: [`filme.json nicht lesbar: ${e.message}`] }; }
  }
  const start = Date.now();
  const zeitUm = () => Date.now() - start > m.bisSek * 1000;
  const tag = berlinTag(new Date(jetzt).toISOString());
  const tagNr = tagNrVon(tag);
  const jetztIso = new Date(jetzt).toISOString();
  const zk = (zustand.filmkatalog ||= {});
  zk.v = 1; zk.f ||= {}; zk.s ||= {}; zk.g ||= {}; zk.bx ||= {};
  const st = { ok: true, anzahl: 0, fehler: [], charts: 0, chartsNeu: 0, chartsGemerkt: 0, lookups: 0, geprueft: 0, fehlen: 0, entfernt: 0, boxenNeu: 0, boxInhalte: 0, genres: [] };

  // Apple-Abrufe: nach 3 Fehlern in Folge keiner mehr; Regel-Sperre und „höchstens … je Lauf“ = Ende der Charts (kein Fehler)
  let fehlerInFolge = 0, chartsZu = false, chartsOk = 0;
  const apple = async url => {
    if (fehlerInFolge >= 3) throw new Error('Apple antwortet gerade nicht – Rest im nächsten Lauf');
    try { const t = await holeText(url); fehlerInFolge = 0; return t; } catch (e) { if (!istRegelSperre(e) && !/je Lauf/.test(String(e?.message))) fehlerInFolge++; throw e; }
  };

  // 1) Charts: zuerst, was Modul „filme“ in diesem Lauf schon geholt hat (gemerkt, kostet nichts), dann reihum die übrigen Genres
  const { genres, horror } = katalogGenres(listen);
  const zfb = zustand.filme?.breit?.g || {};
  const vonFilme = g => g.quelle === 'haupt' || (g.quelle === 'breit' && zfb[g.key]?.t === jetztIso);
  const reihe = [...genres].sort((a, b) => (vonFilme(b) - vonFilme(a)) || String(zk.g[a.key]?.t || '').localeCompare(String(zk.g[b.key]?.t || '')));
  const imChart = new Set(); // Nummern, die in diesem Lauf in einem Chart standen
  const genreNamen = new Map(genres.filter(g => g.id != null).map(g => [g.id, g.name]));
  for (const g of reihe) {
    if (chartsZu || zeitUm() || st.charts >= m.maxCharts || fehlerInFolge >= 3) break;
    const gemerkt = vonFilme(g);
    if (!gemerkt && st.chartsNeu >= m.neueCharts) continue;
    st.charts++; if (gemerkt) st.chartsGemerkt++; else st.chartsNeu++;
    let eintraege;
    try { eintraege = leseCharts(await apple(g.url)); }
    catch (e) {
      if (/je Lauf/.test(String(e?.message)) || istRegelSperre(e)) { chartsZu = true; break; } // Obergrenze/Regel: Rest im nächsten Lauf
      st.fehler.push(`${g.art === 'film' ? 'Filme' : 'Serien'} ${g.name}: ${e.message}`);
      continue;
    }
    chartsOk++;
    zk.g[g.key] = { t: jetztIso, n: eintraege.length };
    st.genres.push({ id: g.id, name: g.name, art: g.art, eintraege: eintraege.length });
    for (const e of eintraege) {
      const nr = nrVon(e.id);
      if (!/^\d+$/.test(nr)) continue;
      const gid = g.id ?? (Number(e.genreId) || null);
      if (g.art === 'film') {
        if (istHorror(e.genre, e.genreId, horror) || horrorText(e.text, e.genre) >= 3) { delete zk.f[nr]; continue; }
        const o = (zk.f[nr] ||= { t: e.titel, g: [] });
        o.t = e.titel; o.j = e.jahr ?? o.j ?? null; o.c = tagNr; o.pos = e.pos;
        if (gid != null && !o.g.includes(gid)) o.g = [...o.g, gid].slice(-6);
        o.l = ct(e.leihe) || o.l || 0;
        // Film-Chart: Preis = HD-Kaufpreis (Lookup-Vergleich 25 von 25, Modul „filme“) -> gilt als geprüft
        merkePreisK(o, ct(e.preis), tagNr);
        if (o.p && o.p <= ct(m.zeigeMax)) { o.b = e.bild || o.b || null; o.u = e.link || o.u || null; }
        o.n = 0;
      } else {
        if (istHorror(e.genre, e.genreId, horror)) continue;
        const o = (zk.s[nr] ||= { t: e.titel, g: [] });
        o.t = e.titel; o.j = e.jahr ?? o.j ?? null; o.c = tagNr; o.pos = e.pos;
        const info = komplettInfo(e.titel) || staffelInfo(e.titel);
        if (info) { o.se = info.serie || o.se || null; o.nr = info.nr ?? null; if (info.zusatz === 'komplett') o.ko = 1; }
        if (gid != null && !o.g.includes(gid)) o.g = [...o.g, gid].slice(-6);
        if (e.bild) o.b0 = e.bild; // Bild aus dem Chart, falls der Lookup keins hat
        o.n = 0;
      }
      imChart.add(`${g.art}:${nr}`);
    }
  }

  // 2) Lookups (Reihenfolge unten) und danach die Box-Inhalte (einzelne Teile, eigener Abruf mit entity=movie)
  const zfBoxen = ((zustand.filme ||= {}).boxen ||= {});
  const boxMerken = (box, filmNr) => {
    if (!box) return;
    const neu = !zfBoxen[box.id];
    const b = (zfBoxen[box.id] ||= { n: box.name, filme: box.filme, seit: tag, filmIds: [] });
    b.tag = tag; b.filme = box.filme || b.filme;
    const fid = `itunes:${filmNr}`;
    if (!liste(b.filmIds).includes(fid)) b.filmIds = [...liste(b.filmIds), fid].slice(-30);
    if (neu) st.boxenNeu++;
  };
  const uebernimm = (r, ziel = null) => {
    if (fremdStore(r)) return null;
    const d = ausItunes(r);
    if (!d || (d.typ !== 'film' && d.typ !== 'staffel')) return null;
    const nr = nrVon(d.id);
    if (d.typ === 'film') {
      if (/horror/i.test(String(d.genre || ''))) { delete zk.f[nr]; return null; }
      const o = (zk.f[nr] ||= { t: d.titel, g: [] });
      o.t = d.titel; o.j = d.jahr ?? o.j ?? null; o.l = ct(d.leihe) || 0;
      merkePreisK(o, ct(d.preisHd ?? d.preisSd), tagNr);
      if (o.p && o.p <= ct(m.zeigeMax)) { o.b = d.bild || o.b || null; o.u = d.link || o.u || null; } else { delete o.b; delete o.u; }
      const box = boxVon(r);
      if (box) { o.x = Number(nrVon(box.id)); boxMerken(box, nr); }
      if (ziel) o.x = Number(ziel);
      o.n = 0;
    } else {
      const o = (zk.s[nr] ||= { t: d.titel, g: [] });
      o.t = d.titel; o.j = d.jahr ?? o.j ?? null;
      const info = (d.komplett && komplettInfo(d.titel)) || staffelInfo(d.titel) || komplettInfo(d.titel);
      o.se = info?.serie || d.kuenstler || o.se || null; o.nr = info?.nr ?? o.nr ?? null; if (d.komplett) o.ko = 1;
      merkePreisK(o, ct(d.preisHd ?? d.preisSd), tagNr);
      if (o.p && o.p <= ct(m.zeigeMax)) { o.b = d.bild || o.b0 || o.b || null; o.u = d.link || o.u || null; } else { delete o.b; delete o.u; }
      o.n = 0;
    }
    (d.typ === 'film' ? zk.f : zk.s)[nr].lk = tagNr;
    st.geprueft++;
    return d;
  };
  // Reihenfolge: (3) Staffeln aus den Charts ohne Preis von heute, (2) Filme aus den Charts, die noch nie (oder vor mehr als
  // lookupNeuTage) einen Lookup hatten – erst der Lookup nennt die Box (collectionId) und Kauf HD/SD –, (1) alle übrigen Titel,
  // die heute noch nicht geprüft sind (am längsten nicht geprüfte zuerst, Billiges zuerst)
  const offen = [];
  for (const [nr, o] of Object.entries(zk.s)) if (imChart.has(`staffel:${nr}`) && o.lk !== tagNr) offen.push({ nr, art: 'staffel', k: o.lk || 0, p: o.p || 0, vorn: 3 });
  for (const [nr, o] of Object.entries(zk.f)) if (imChart.has(`film:${nr}`) && (!o.lk || tagNr - o.lk >= m.lookupNeuTage)) offen.push({ nr, art: 'film', k: o.lk || 0, p: o.p || 99999, vorn: 2 });
  for (const [art, tab] of [['film', zk.f], ['staffel', zk.s]]) {
    for (const [nr, o] of Object.entries(tab)) if (o.k !== tagNr && !imChart.has(`${art}:${nr}`)) offen.push({ nr, art, k: o.k || 0, p: o.p || 99999, vorn: 1 });
  }
  offen.sort((a, b) => (b.vorn - a.vorn) || (a.k - b.k) || (a.p - b.p));
  const gesehen = new Set();
  const reiheIds = offen.filter(x => !gesehen.has(x.nr) && gesehen.add(x.nr));
  for (let i = 0; i < reiheIds.length && st.lookups < m.maxLookups - 1; i += m.lookupMax) { // ein Abruf bleibt für die Box-Inhalte
    if (zeitUm() || fehlerInFolge >= 3) break;
    const teil = reiheIds.slice(i, i + m.lookupMax);
    st.lookups++;
    try {
      const res = leseErgebnisse(await apple(lookupUrl(teil.map(x => x.nr))));
      const da = new Set();
      for (const r of res) { const d = uebernimm(r); if (d) da.add(nrVon(d.id)); }
      // in einer erfolgreichen Antwort fehlt der Titel: nicht (mehr) im deutschen Store – nach fehltNach Mal raus
      for (const x of teil) {
        if (da.has(x.nr)) continue;
        const tab = x.art === 'film' ? zk.f : zk.s, o = tab[x.nr];
        if (!o) continue;
        // heute mit Kaufpreis in einem Film-Chart = im Store (der Chart-Preis gilt); nur der Lookup kennt ihn nicht -> kein „fehlt“
        if (x.art === 'film' && o.c === tagNr && o.k === tagNr && !o.np && o.p > 0) { o.lk = tagNr; continue; }
        o.k = tagNr; o.n = (o.n || 0) + 1; st.fehlen++;
        if (o.n >= m.fehltNach) { delete tab[x.nr]; st.entfernt++; }
      }
    } catch (e) { st.fehler.push(`Lookup: ${e.message}`); }
  }

  // Box-Inhalte (nach den Preisen: eine eben entdeckte Box ist gleich dabei): Boxen aus filme.json (Boxen im Angebot) zuerst,
  // dann die übrigen bekannten – am längsten nicht geholte zuerst
  const filmeBoxen = liste(ctx.filmeDatei?.gruppen?.boxen).map(t => nrVon(t?.id)).filter(x => /^\d+$/.test(x));
  const alleBoxen = [...new Set([...filmeBoxen, ...Object.keys(zfBoxen).map(nrVon)])].filter(x => /^\d+$/.test(x));
  const boxReihe = alleBoxen.filter(b => !zk.bx[b]?.k || tagNr - zk.bx[b].k >= m.boxInhaltTage)
    .sort((a, b) => (filmeBoxen.includes(b) - filmeBoxen.includes(a)) || ((zk.bx[a]?.k || 0) - (zk.bx[b]?.k || 0))).slice(0, m.boxInhaltMax);
  if (boxReihe.length && !zeitUm() && st.lookups < m.maxLookups) {
    st.lookups++;
    try {
      const res = leseErgebnisse(await apple(`${lookupUrl(boxReihe)}&entity=movie`));
      const inhalt = new Map(boxReihe.map(b => [b, []]));
      for (const r of res) {
        if (r?.wrapperType !== 'track' || !inhalt.has(String(r.collectionId))) continue;
        const d = uebernimm(r, String(r.collectionId));
        if (d?.typ === 'film') inhalt.get(String(r.collectionId)).push(Number(nrVon(d.id)));
      }
      for (const [b, f] of inhalt) { zk.bx[b] = { k: tagNr, f: [...new Set(f)].slice(0, 40) }; if (f.length) st.boxInhalte++; }
    } catch (e) { st.fehler.push(`Box-Inhalte: ${e.message}`); }
  }
  // 3) Aufräumen: lange nirgends gesehen und nicht mehr erfolgreich geprüft; Größe begrenzen (älteste zuerst)
  for (const tab of [zk.f, zk.s]) {
    for (const [nr, o] of Object.entries(tab)) if (!o || typeof o !== 'object' || tagNr - Math.max(o.c || 0, o.k || 0) > m.vergessenTage) delete tab[nr];
    const n = Object.keys(tab).length;
    if (n > m.maxKatalog) for (const [nr] of Object.entries(tab).sort((a, b) => Math.max(a[1].c || 0, a[1].k || 0) - Math.max(b[1].c || 0, b[1].k || 0)).slice(0, n - m.maxKatalog)) delete tab[nr];
  }
  for (const [b, x] of Object.entries(zk.bx)) if (!x?.k || tagNr - x.k > m.vergessenTage) delete zk.bx[b];
  for (const k of Object.keys(zk.g)) if (!genres.some(g => g.key === k)) delete zk.g[k];

  // 4) Datei: nur Titel mit frischem Preis (höchstens frischTage alt) bis zur Grenze, je Genre. Nicht frisch: in der letzten
  //    erfolgreichen Lookup-Antwort gefehlt (n > 0) oder zuletzt ohne Kaufpreis (np) – Kurzprüfung 28.11.2026
  const frisch = o => o && o.k != null && tagNr - o.k <= m.frischTage && o.p > 0 && !(o.n > 0) && !o.np;
  const sortiere = (a, b) => (a[1].pos ?? 999) - (b[1].pos ?? 999) || (a[1].p - b[1].p) || String(a[1].t).localeCompare(String(b[1].t), 'de');
  const filme = Object.entries(zk.f).filter(([, o]) => frisch(o) && o.p <= ct(m.filmMax)).sort(sortiere).slice(0, m.ausgabeMax).map(([nr, o]) => aus(nr, o, 'film', genreNamen));
  const staffeln = Object.entries(zk.s).filter(([, o]) => frisch(o) && o.p <= ct(m.staffelMax)).sort(sortiere).slice(0, m.ausgabeMax).map(([nr, o]) => aus(nr, o, 'staffel', genreNamen));
  const zaehle = (arr, id) => arr.filter(t => t.genres.includes(id)).length;
  const bekannt = (tab, id) => Object.values(tab).filter(o => (o.g || []).includes(id)).length;
  const genreListe = genres.filter(g => g.id != null).map(g => {
    const arr = g.art === 'film' ? filme : staffeln, tab = g.art === 'film' ? zk.f : zk.s;
    return { id: g.id, name: g.name, art: g.art, n: zaehle(arr, g.id), bekannt: bekannt(tab, g.id), stand: zk.g[g.key]?.t ?? null };
  });
  // Box-Inhalte (einzelne Teile): je Box die Filme mit Preis (auch über der Grenze – „einzeln je …“)
  const boxInhalt = {};
  for (const [b, x] of Object.entries(zk.bx)) {
    const teile = liste(x.f).map(nr => [String(nr), zk.f[String(nr)]]).filter(([, o]) => o?.t)
      .map(([nr, o]) => ({ id: `itunes:${nr}`, titel: o.t, jahr: o.j ?? null, preis: frisch(o) ? eur(o.p) : null }));
    if (teile.length) boxInhalt[`itunes:${b}`] = teile;
  }
  const geprueft = tab => Object.values(tab).filter(frisch).length;
  const zahlen = {
    filmeBekannt: Object.keys(zk.f).length, filmeGeprueft: geprueft(zk.f), filme399: filme.length,
    staffelnBekannt: Object.keys(zk.s).length, staffelnGeprueft: geprueft(zk.s), staffeln499: staffeln.length,
    boxen: Object.keys(boxInhalt).length,
  };
  st.anzahl = filme.length + staffeln.length;
  st.ok = !st.fehler.length;
  fehler.push(...st.fehler);
  const kurz = { filme399: filme.length, staffeln499: staffeln.length, bekannt: zahlen.filmeBekannt };
  const nichtsGeholt = chartsOk === 0 && st.geprueft === 0;
  // alles gestört und nichts Frisches: letzter Stand bleibt (Seite zeigt „Quelle gestört“)
  if (nichtsGeholt && fehler.length && ctx.vorherDatei?.filme) {
    return { eintraege: [], fehler, datei: { ...ctx.vorherDatei, status: { katalog: st }, gestoert: true }, letzterStand: true, kurz, zahl: { n: kurz.filme399, wort: 'Filme für 3,99 €' } };
  }
  const datei = {
    version: 1,
    aktualisiert: jetztIso,
    grenzen: { film: m.filmMax, staffel: m.staffelMax, frischTage: m.frischTage },
    genres: genreListe,
    filme,
    staffeln,
    boxInhalt,
    zahlen,
    status: { katalog: st },
    hinweis: 'Katalog des Radars: jeder Film/jede Staffel, die er je in einem Apple-Chart (je Genre höchstens 100) oder in einer Box gesehen hat, mit frischem Preis über die iTunes-Lookup-Schnittstelle. Vollständig nur so weit, wie Apple die Titel irgendwann zeigt. Tiefst = eigene Beobachtung.',
  };
  return { eintraege: [], fehler, datei, kurz, zahl: { n: filme.length, wort: 'Filme für 3,99 €' } };
}

export const _intern = { tagNrVon, tagVonNr, APPLE };
