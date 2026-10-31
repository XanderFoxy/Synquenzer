#!/usr/bin/env node
// Schnäppchen-Wecker: collects offers, computes unit prices, keeps history, decides deals, writes current.json, pushes via ntfy.
// node scan/main.mjs [--dry-run] [--fixtures] [--data <dir>] [--roh <dir>]
// --roh / ROH_DIR: Roh-Mitschnitt (alle Quell-Antworten + Ergebnis in <dir>), immer ohne Push.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseMenge, fuelleMenge, einheitspreis, passt, stueckPasst, norm, round, BASIS_LABEL } from './text.mjs';
import { leereHistorie, eintragen, aufraeumen, statistik } from './history.mjs';
import { referenz, bewerte, versandkosten, technikBewertung } from './deals.mjs';
import { nachricht, dedupeKey, senden } from './notify.mjs';
import { macheAbruf, macheFixtureAbruf } from './http.mjs';
import { rohOrdner, macheMitschnitt } from './roh.mjs';
import { marktguru } from './sources/marktguru.mjs';
import { mydealz } from './sources/mydealz.mjs';
import { keepa } from './sources/keepa.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
export const QUELLEN = { marktguru, mydealz, keepa };

const mitZeitlimit = (p, ms, name) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(`${name}: Zeitlimit`)), ms).unref())]);

function shopErlaubt(shop, cfg) {
  const s = norm(shop);
  return cfg.maerkte.erlaubt.some(m => { const n = norm(m); return s.includes(n) || n.includes(s) && s.length > 3; });
}

function ansicht(a) {
  return {
    shop: a.shop, titel: a.titel, preis: a.preis, versand: a.versand, einheitspreis: a.einheitspreis,
    menge: a.menge, gueltigAb: a.gueltigAb || null, gueltigBis: a.gueltigBis || null, link: a.link, bild: a.bild || '',
    quelle: a.quelle, online: !!a.online, deal: !!a.deal, grund: a.grund || '', ersparnis: a.ersparnis ?? null,
  };
}

export async function scan({ cfg, watchlist, history, sent, holeText, env = {}, jetzt = new Date(), log = () => {} }) {
  history ||= leereHistorie();
  sent ||= {};
  const jetztMs = new Date(jetzt).getTime();

  // 1. all sources in parallel; a broken source never stops the others
  const quellen = [];
  const alle = [];
  const namen = Object.keys(QUELLEN).filter(n => cfg.quellen[n]?.aktiv !== false);
  const res = await Promise.allSettled(namen.map(n => mitZeitlimit(QUELLEN[n]({ holeText, cfg, watchlist, env }), 240000, n)));
  res.forEach((r, i) => {
    const name = namen[i];
    if (r.status === 'fulfilled') {
      const { angebote = [], fehler = [], hinweis } = r.value;
      alle.push(...angebote);
      quellen.push({ name, ok: true, anzahl: angebote.length, fehler, hinweis: hinweis || '' });
    } else {
      quellen.push({ name, ok: false, anzahl: 0, fehler: [String(r.reason?.message || r.reason)], hinweis: '' });
    }
    log(`${name}: ${quellen.at(-1).ok ? `${quellen.at(-1).anzahl} Einträge` : 'FEHLER ' + quellen.at(-1).fehler[0]}`);
  });

  // 2. watch items
  const produkte = [];
  const kandidaten = [];
  const punkte = [];
  for (const item of watchlist.produkte) {
    const gruppe = item.gruppe || item.id;
    const stats = statistik(history, gruppe, cfg.deal.normalpreisFensterTage, jetztMs);
    const ref = referenz(item, stats, cfg);
    const gesehen = new Set();
    const angebote = [];
    for (const o of alle) {
      if (!(o.preis > 0)) continue;
      const text = `${o.titel} ${o.beschreibung || ''}`;
      const perAsin = o.asin && (item.asins || []).includes(o.asin);
      if (!perAsin && !passt(text, item)) continue;
      if (!o.online && !shopErlaubt(o.shop, cfg)) continue;
      if (o.gueltigBis && new Date(o.gueltigBis).getTime() < jetztMs - 864e5 / 2) continue;
      const roh = parseMenge(text);
      if (!stueckPasst(roh, item)) continue;
      const key = `${o.link}|${o.shop}|${o.preis}`;
      if (gesehen.has(key)) continue;
      gesehen.add(key);
      const versand = versandkosten(o, cfg);
      const menge = fuelleMenge(roh, item);
      const gesamt = round(o.preis + versand);
      const up = einheitspreis(gesamt, menge, item, versand === 0 ? o.refPreis : null);
      if (up == null) continue;
      const a = { ...o, versand, menge, preis: gesamt, einheitspreis: up };
      // implausible (probably a different product or a parsing error): show, but never alert
      a.unsicher = ref.p > 0 && (up < ref.p * 0.15 || up > ref.p * 6);
      if (!a.unsicher) Object.assign(a, bewerte(a, ref, stats, cfg));
      angebote.push(a);
      const laeuft = !a.gueltigAb || new Date(a.gueltigAb).getTime() <= jetztMs + 864e5 / 2;
      if (!a.unsicher && laeuft) punkte.push({ gruppe, basis: item.basis, p: up, shop: a.shop });
    }
    angebote.sort((x, y) => (x.unsicher - y.unsicher) || (x.einheitspreis - y.einheitspreis));
    const bestes = angebote.find(a => !a.unsicher) || null;
    const p = {
      id: item.id, name: item.name, basis: item.basis, basisLabel: BASIS_LABEL[item.basis], gruppe,
      deal: !!bestes?.deal, grund: bestes?.grund || '', ersparnis: bestes?.ersparnis ?? null,
      normalpreis: ref.p, normalQuelle: ref.quelle,
      tiefstpreis: stats.tiefst?.p ?? null, tiefstTag: stats.tiefst?.tag ?? null, tiefstShop: stats.tiefst?.shop ?? null,
      historieTage: stats.tage,
      bestes: bestes ? ansicht(bestes) : null,
      weitere: angebote.filter(a => a !== bestes).slice(0, 5).map(ansicht),
    };
    produkte.push(p);
    if (bestes?.deal) {
      kandidaten.push({
        typ: 'produkt', id: item.id, name: item.name, basis: item.basis, titel: bestes.titel, shop: bestes.shop,
        preis: bestes.preis, versand: bestes.versand, online: bestes.online, einheitspreis: bestes.einheitspreis,
        normalpreis: ref.p, tiefstpreis: p.tiefstpreis, ersparnis: bestes.ersparnis, grund: bestes.grund,
        gueltigBis: bestes.gueltigBis, link: bestes.link,
      });
    }
  }
  // history after the decision (the decision compares against the past)
  for (const pt of punkte) eintragen(history, pt.gruppe, pt.basis, pt, jetztMs);
  aufraeumen(history, cfg.deal.historieBehaltenTage, jetztMs);
  for (const p of produkte) {
    const s = statistik(history, p.gruppe, cfg.deal.normalpreisFensterTage, jetztMs);
    p.tiefstpreis = s.tiefst?.p ?? null; p.tiefstTag = s.tiefst?.tag ?? null; p.tiefstShop = s.tiefst?.shop ?? null; p.historieTage = s.tage;
  }
  produkte.sort((a, b) => (b.deal - a.deal) || ((b.ersparnis ?? -9) - (a.ersparnis ?? -9)));

  // 3. electronics price errors
  const technik = [];
  if (watchlist.technik) {
    for (const o of alle) {
      if (o.quelle !== 'mydealz' || !(o.preis > 0)) continue;
      const b = technikBewertung(o, watchlist.technik, cfg);
      if (!b) continue;
      const t = { typ: 'technik', id: watchlist.technik.id, name: watchlist.technik.name, titel: o.titel, shop: o.shop, preis: o.preis,
        preisAlt: b.preisAlt, ersparnis: b.ersparnis, grund: b.grund, link: o.link, bild: o.bild || '', datum: o.datum || null };
      technik.push(t);
      kandidaten.push(t);
    }
  }

  // 4. notifications: only new deals
  const neu = kandidaten.filter(k => !sent[dedupeKey(k)]);
  const max = cfg.ntfy.maxProLauf ?? 8;
  const msgs = neu.slice(0, max).map(k => nachricht(k, cfg));
  if (neu.length > max) {
    msgs.push({ topic: cfg.ntfy.topic, title: `Noch ${neu.length - max} weitere Schnäppchen`, message: 'Alle auf einen Blick in der Übersicht.', click: cfg.seite, tags: ['shopping_cart'] });
  }
  const zuSenden = neu.slice(0, max);

  // 5. current.json
  const fehler = quellen.flatMap(q => q.fehler.map(f => `${q.name}: ${f}`));
  const current = {
    version: 1,
    aktualisiert: new Date(jetztMs).toISOString(),
    plz: cfg.plz, ort: cfg.ort,
    deals: produkte.filter(p => p.deal).length + technik.length,
    produkte,
    technik: technik.slice(0, 30),
    quellen,
    fehler,
  };
  return { current, history, sent, msgs, zuSenden };
}

function argWert(args, name) { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; }
async function leseJson(pfad, fallback) { try { return JSON.parse(await readFile(pfad, 'utf8')); } catch { return fallback; } }

// test: { fetchImpl, abruf } nur für Tests (eigenes fetch, z. B. ohne Pause)
export async function main(args = process.argv.slice(2), env = process.env, test = {}) {
  const fixtures = args.includes('--fixtures');
  const rohDir = rohOrdner(args, env);
  // Roh-Modus ist immer ein Probelauf: keine Pushes (der Workflow schreibt dann auch nichts auf den Daten-Zweig)
  const dryRun = fixtures || !!rohDir || args.includes('--dry-run') || env.DRY_RUN === '1';
  const roh = rohDir ? macheMitschnitt(rohDir, { projekt: 'schnaeppchen', env }) : null;
  const basis = resolve(HIER, '..');
  const datenDir = resolve(argWert(args, '--data') || env.SCHNAEPPCHEN_DATA || join(basis, 'data'));
  const cfg = JSON.parse(await readFile(join(basis, 'config.json'), 'utf8'));
  if (env.NTFY_TOPIC) cfg.ntfy.topic = env.NTFY_TOPIC;
  const watchlist = JSON.parse(await readFile(join(basis, 'watchlist.json'), 'utf8'));
  const history = await leseJson(join(datenDir, 'history.json'), leereHistorie());
  const sent = await leseJson(join(datenDir, 'sent.json'), {});
  const fetchImpl = roh ? roh.fetch(test.fetchImpl) : test.fetchImpl;
  const holeText = fixtures ? macheFixtureAbruf(join(HIER, 'test', 'fixtures')) : macheAbruf({ ...cfg.abruf, ...test.abruf }, fetchImpl);
  const jetzt = argWert(args, '--jetzt') ? new Date(argWert(args, '--jetzt')) : new Date();

  let r;
  try { r = await scan({ cfg, watchlist, history, sent, holeText, env, jetzt, log: console.log }); }
  catch (e) { roh?.abschluss({ absturz: String(e?.message || e) }); throw e; }
  const ok = await senden(r.msgs, cfg, { dryRun });
  r.zuSenden.forEach((k, i) => { if (ok[i]) r.sent[dedupeKey(k)] = r.current.aktualisiert; });
  const grenze = new Date(new Date(jetzt).getTime() - 45 * 864e5).toISOString();
  for (const [k, v] of Object.entries(r.sent)) if (v < grenze) delete r.sent[k];

  await mkdir(datenDir, { recursive: true });
  await writeFile(join(datenDir, 'current.json'), JSON.stringify(r.current, null, 1) + '\n');
  await writeFile(join(datenDir, 'history.json'), JSON.stringify(r.history) + '\n');
  await writeFile(join(datenDir, 'sent.json'), JSON.stringify(r.sent, null, 1) + '\n');
  if (roh) {
    roh.ausgabe('current.json', JSON.stringify(r.current, null, 1) + '\n');
    roh.ausgabe('history.json', JSON.stringify(r.history) + '\n');
    roh.ausgabe('sent.json', JSON.stringify(r.sent, null, 1) + '\n');
    roh.ausgabe('pushes.json', r.msgs);
    roh.abschluss({ dryRun: true, deals: r.current.deals, pushes: r.msgs.length });
    console.log(`Roh-Mitschnitt: ${roh.abrufe.length} Abrufe → ${roh.dir}`);
  }
  console.log(`${r.current.deals} Deals, ${r.msgs.length} Nachrichten${dryRun ? ' (dry-run, nichts gesendet)' : ''}, ${r.current.fehler.length} Quellen-Fehler → ${datenDir}`);
  return r;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(e => { console.error(e); process.exit(1); });
}
