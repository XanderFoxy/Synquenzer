#!/usr/bin/env node
// Schnäppchen-Wecker: collects offers, computes unit prices, keeps history, decides deals, writes current.json, pushes via ntfy.
// node scan/main.mjs [--dry-run] [--fixtures] [--data <dir>] [--roh <dir>] [--wiedergabe <roh-ordner>] [--jetzt <ISO>]
// --roh / ROH_DIR: Roh-Mitschnitt (alle Quell-Antworten + Ergebnis in <dir>), immer ohne Push.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bestimmeMenge, einheitspreis, passt, stueckPasst, istSammeldeal, sammelTeil, norm, round, euroKurz, BASIS_LABEL } from './text.mjs';
import { pruefeHistorie, eintragen, aufraeumen, statistik, tiefstSeit } from './history.mjs';
import { referenz, bewerte, versandkosten, technikBewertung, tiefstInfo, schaetzungPlausibel, istGeschaetzt } from './deals.mjs';
import { pruefeDealSeiten, leereDealseiten } from './preisfehler.mjs';
import { nachricht, dedupeKey, senden } from './notify.mjs';
import { macheAbruf, macheFixtureAbruf, macheWiedergabe } from './http.mjs';
import { rohOrdner, macheMitschnitt } from './roh.mjs';
import { leseRss } from './rss.mjs';
import { marktguru } from './sources/marktguru.mjs';
import { mydealz } from './sources/mydealz.mjs';
import { keepa } from './sources/keepa.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
export const QUELLEN = { marktguru, mydealz, keepa };

const mitZeitlimit = (p, ms, name) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(`${name}: Zeitlimit`)), ms).unref())]);

// Nur Läden, in denen Xander einkaufen kann: Ketten aus config.json, ohne Großhandel („EDEKA Foodservice“,
// „NUR FÜR GROSSHÄNDLER“), auch wenn der Kettenname im Namen steckt.
export function shopErlaubt(shop, cfg, text = '') {
  const s = norm(shop);
  if (!s) return false;
  if ((cfg.maerkte.ausgeschlossen || []).some(x => s.includes(norm(x)))) return false;
  if (/nur fuer (?:gross ?haendler|gewerbe)|nur gewerbe|gewerbekunden/.test(norm(text))) return false;
  return cfg.maerkte.erlaubt.some(m => { const n = norm(m); return s.includes(n) || n.includes(s) && s.length > 3; });
}

const kurz = (s, n) => (s && s.length > n ? s.slice(0, n - 1) + '…' : s || '');

// Ein Angebot, wie es in current.json steht (Vertrag: titel, packung, menge, mengeSicher, mengeQuelle, preisVorher, bis …)
function ansicht(a, item) {
  const label = BASIS_LABEL[item.basis];
  return {
    shop: a.shop, titel: a.titel, beschreibung: kurz(a.beschreibung, 200),
    preis: a.preis, versand: a.versand, einheitspreis: a.einheitspreis,
    // geschaetzt: nur für die bisherige Seite (zeigt dann „(geschätzt)“)
    packung: a.packung, menge: a.mengeSicher ? a.menge : { ...a.menge, geschaetzt: true }, mengeSicher: !!a.mengeSicher, mengeQuelle: a.mengeQuelle,
    preisVorher: a.quelle === 'keepa' ? null : a.preisAlt ?? null, // nur ein echter Streichpreis, kein Durchschnitt
    gueltigAb: a.gueltigAb || null, gueltigBis: a.gueltigBis || null, ab: a.gueltigAb || null, bis: a.gueltigBis || null,
    startetSpaeter: !a.laeuft,
    zeile: [a.titel, a.packung, euroKurz(a.preis), a.mengeSicher ? `${euroKurz(a.einheitspreis)} ${label}` : 'Menge unklar'].filter(Boolean).join(' · '),
    link: a.link, bild: a.bild || '',
    quelle: a.quelle, online: !!a.online, deal: !!a.deal, grund: a.grund || '', ersparnis: a.ersparnis ?? null,
  };
}

export async function scan({ cfg, watchlist, history, sent, dealseiten, holeText, env = {}, jetzt = new Date(), log = () => {} }) {
  const hp = pruefeHistorie(history);
  if (hp.neu) log('Preisverlauf neu gestartet (alte Version mit falschen Packungsgrößen verworfen)');
  history = hp.historie;
  sent ||= {};
  dealseiten = dealseiten?.version === 1 ? dealseiten : leereDealseiten();
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
  const verlaesslich = a => !a.unsicher && a.mengeSicher;
  for (const item of watchlist.produkte) {
    const gruppe = item.gruppe || item.id;
    const stats = statistik(history, gruppe, cfg.deal.normalpreisFensterTage, jetztMs);
    const ref = referenz(item, stats, cfg);
    const gesehen = new Set();
    const angebote = [];
    for (const roh of alle) {
      if (!(roh.preis > 0)) continue;
      const perAsin = roh.asin && (item.asins || []).includes(roh.asin);
      if (!perAsin && !passt(`${roh.titel} ${roh.beschreibung || ''}`, item)) continue;
      let o = roh;
      // mydealz-Sammeldeal („Ben Jerrys 3,49 / Kartoffeln 7,5KG 4,44 / …“): nur der eigene Teil zählt (Titel, Preis)
      if (roh.quelle === 'mydealz' && istSammeldeal(roh.titel)) {
        const teil = sammelTeil(roh.titel, item);
        if (!teil) continue;
        o = { ...roh, titel: teil.titel, preis: teil.preis ?? roh.preis, beschreibung: '', sammeldeal: true };
      }
      const text = `${o.titel} ${o.beschreibung || ''}`;
      if (!o.online && !shopErlaubt(o.shop, cfg, text)) continue;
      // abgelaufen = weg (kein Nachlauf; die Seite blendet zusätzlich beim Anzeigen aus)
      if (o.gueltigBis && Date.parse(o.gueltigBis) < jetztMs) continue;
      const mg = bestimmeMenge(o, item);
      if (!stueckPasst(mg.menge, item)) continue;
      const key = `${o.link}|${o.shop}|${o.preis}`;
      if (gesehen.has(key)) continue;
      gesehen.add(key);
      const versand = versandkosten(o, cfg);
      const gesamt = round(o.preis + versand);
      const up = einheitspreis(gesamt, mg.menge, item, versand === 0 ? o.refPreis : null);
      if (up == null) continue;
      const a = { ...o, versand, preis: gesamt, einheitspreis: up, ...mg };
      // implausible (probably a different product or a parsing error): show, but never alert
      a.unsicher = ref.p > 0 && (up < ref.p * 0.15 || up > ref.p * 6);
      a.laeuft = !a.gueltigAb || Date.parse(a.gueltigAb) <= jetztMs;
      angebote.push(a);
    }
    angebote.sort((x, y) => (verlaesslich(y) - verlaesslich(x)) || (x.unsicher - y.unsicher) || (x.einheitspreis - y.einheitspreis));
    const sichere = angebote.filter(verlaesslich);
    const plausibel = schaetzungPlausibel(ref, sichere);
    for (const a of angebote) Object.assign(a, bewerte(a, ref, stats, cfg, { guenstigstes: a === sichere[0], plausibel }));
    for (const a of sichere) if (a.laeuft) punkte.push({ gruppe, basis: item.basis, p: a.einheitspreis, shop: a.shop });
    const bestes = angebote.find(a => !a.unsicher) || null;
    produkte.push({ item, gruppe, ref, angebote, sichere, bestes });
  }
  // history after the decision (the decision compares against the past)
  for (const pt of punkte) eintragen(history, pt.gruppe, pt.basis, pt, jetztMs);
  aufraeumen(history, cfg.deal.historieBehaltenTage, jetztMs);

  const karten = produkte.map(({ item, gruppe, ref, angebote, sichere, bestes }) => {
    const s = statistik(history, gruppe, cfg.deal.normalpreisFensterTage, jetztMs);
    const tiefst = tiefstInfo({ bestes, sichere, stats: s, tiefst30: tiefstSeit(history, gruppe, 30, jetztMs), basis: item.basis, cfg });
    const p = {
      id: item.id, name: item.name, basis: item.basis, basisLabel: BASIS_LABEL[item.basis], gruppe,
      deal: !!bestes?.deal, grund: bestes?.grund || '', ersparnis: bestes?.ersparnis ?? null,
      normalpreis: ref.p, normalQuelle: ref.quelle, normalGeschaetzt: istGeschaetzt(ref),
      tiefst,
      // ältere Felder (bisherige Seite)
      tiefstpreis: s.tiefst?.p ?? null, tiefstTag: s.tiefst?.tag ?? null, tiefstShop: s.tiefst?.shop ?? null, historieTage: s.tage,
      anzahlAngebote: angebote.length,
      bestes: bestes ? ansicht(bestes, item) : null,
      weitere: angebote.filter(a => a !== bestes).slice(0, 5).map(a => ansicht(a, item)),
    };
    if (bestes?.deal) {
      kandidaten.push({
        typ: 'produkt', id: item.id, name: item.name, basis: item.basis, titel: bestes.titel, shop: bestes.shop,
        packung: bestes.packung, preis: bestes.preis, versand: bestes.versand, online: bestes.online, einheitspreis: bestes.einheitspreis,
        normalpreis: ref.p, normalGeschaetzt: p.normalGeschaetzt, tiefstpreis: p.tiefstpreis, tiefstText: tiefst.text,
        ersparnis: bestes.ersparnis, grund: bestes.grund, gueltigAb: bestes.gueltigAb, gueltigBis: bestes.gueltigBis,
        startetSpaeter: !bestes.laeuft, link: bestes.link,
      });
    }
    return p;
  });
  karten.sort((a, b) => (b.deal - a.deal) || ((b.ersparnis ?? -9) - (a.ersparnis ?? -9)));

  // 3. electronics price errors: nur frische (≤ maxAlterStunden) und laut Deal-Seite nicht abgelaufene
  const technik = [];
  const pf = cfg.preisfehler || {};
  const maxAlterMs = (pf.maxAlterStunden ?? 72) * 36e5;
  const technikFehler = [];
  if (watchlist.technik) {
    const vorauswahl = alle
      .filter(o => o.quelle === 'mydealz' && o.preis > 0 && technikBewertung(o, watchlist.technik, cfg))
      .filter(o => { const t = Date.parse(o.datum); return Number.isFinite(t) && jetztMs - t <= maxAlterMs && t <= jetztMs + 36e5; })
      .sort((a, b) => Date.parse(b.datum) - Date.parse(a.datum));
    const { ergebnisse } = await pruefeDealSeiten(vorauswahl.map(o => o.link), {
      holeText, cache: dealseiten, jetztMs, max: pf.dealSeitenProLauf ?? 10, neuPruefenMin: pf.neuPruefenNachMinuten ?? 45, log,
    });
    for (const o of vorauswahl) {
      const seite = ergebnisse.get(o.link);
      if (!seite) continue; // diesmal nicht geprüft -> nicht zeigen (nächster Lauf)
      if (!seite.ok) { technikFehler.push(`Deal-Seite nicht lesbar: ${seite.fehler}`); continue; }
      if (seite.abgelaufen) continue;
      const b = technikBewertung(o, watchlist.technik, cfg, seite);
      if (!b) continue;
      const geplant = seite.bis && Date.parse(seite.bis) > jetztMs ? seite.bis : null;
      const bis = geplant || new Date(Date.parse(o.datum) + maxAlterMs).toISOString();
      if (Date.parse(bis) < jetztMs) continue;
      const t = {
        typ: 'technik', id: watchlist.technik.id, name: watchlist.technik.name, titel: o.titel, shop: seite.haendler || o.shop,
        preis: b.preis, versand: seite.versand ?? null,
        preisVorher: b.preisVorher, vorherQuelle: b.vorherQuelle, ersparnisEuro: b.ersparnisEuro, ersparnisProzent: b.ersparnisProzent,
        preisAlt: b.preisVorher, ersparnis: b.ersparnis, grund: b.grund,
        link: o.link, bild: o.bild || '', datum: o.datum, bis, bisGeschaetzt: !geplant, geprueft: seite.geprueft,
        temperatur: seite.temperatur ?? o.temperatur ?? null,
      };
      technik.push(t);
      kandidaten.push(t);
    }
  }
  if (technikFehler.length) {
    const q = quellen.find(x => x.name === 'mydealz');
    if (q) q.fehler.push(...[...new Set(technikFehler)]);
  }

  // 4. notifications: only new deals
  const neu = kandidaten.filter(k => !sent[dedupeKey(k)]);
  const max = cfg.ntfy.maxProLauf ?? 8;
  const msgs = neu.slice(0, max).map(k => nachricht(k, cfg, jetztMs));
  if (neu.length > max) {
    msgs.push({ topic: cfg.ntfy.topic, title: `Noch ${neu.length - max} weitere Schnäppchen`, message: 'Alle auf einen Blick in der Übersicht.', click: cfg.seite, tags: ['shopping_cart'] });
  }
  const zuSenden = neu.slice(0, max);

  // 5. current.json
  const fehler = quellen.flatMap(q => q.fehler.map(f => `${q.name}: ${f}`));
  const current = {
    version: 2,
    aktualisiert: new Date(jetztMs).toISOString(),
    plz: cfg.plz, ort: cfg.ort,
    deals: karten.filter(p => p.deal).length + technik.length,
    produkte: karten,
    technik: technik.slice(0, 30),
    quellen,
    fehler,
  };
  return { current, history, sent, dealseiten, msgs, zuSenden };
}

// Nur im Roh-Modus: ein paar Deal-Seiten der Preisfehler-Gruppe mitschneiden (neueste + älteste), weil der Feed
// weder Altpreis noch „abgelaufen“ als eigenes Feld hat – zum Nachsehen, ob die Seite selbst es liefert.
export async function rohDealSeiten(holeText, cfg, max = 6) {
  const feed = cfg.quellen.mydealz.feeds.find(f => f.preisfehler);
  if (!feed) return 0;
  let items = [];
  try { items = leseRss(await holeText(feed.url)); } catch { return 0; }
  const links = [...new Set([...items.slice(0, max - 2), ...items.slice(-2)].map(it => it.link).filter(Boolean))].slice(0, max);
  for (const l of links) { try { await holeText(l, { headers: { accept: 'text/html' } }); } catch { /* steht im Mitschnitt */ } }
  return links.length;
}

function argWert(args, name) { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; }
async function leseJson(pfad, fallback) { try { return JSON.parse(await readFile(pfad, 'utf8')); } catch { return fallback; } }

// test: { fetchImpl, abruf } nur für Tests (eigenes fetch, z. B. ohne Pause)
export async function main(args = process.argv.slice(2), env = process.env, test = {}) {
  const fixtures = args.includes('--fixtures');
  // --wiedergabe <ordner>: einen Roh-Mitschnitt (index.json + quellen/) offline noch einmal durchrechnen
  const wiedergabe = argWert(args, '--wiedergabe') || null;
  const rohDir = wiedergabe ? null : rohOrdner(args, env);
  // Roh-Modus ist immer ein Probelauf: keine Pushes (der Workflow schreibt dann auch nichts auf den Daten-Zweig)
  const dryRun = fixtures || !!wiedergabe || !!rohDir || args.includes('--dry-run') || env.DRY_RUN === '1';
  const roh = rohDir ? macheMitschnitt(rohDir, { projekt: 'schnaeppchen', env }) : null;
  const basis = resolve(HIER, '..');
  const datenDir = resolve(argWert(args, '--data') || env.SCHNAEPPCHEN_DATA || join(basis, 'data'));
  const cfg = JSON.parse(await readFile(join(basis, 'config.json'), 'utf8'));
  if (env.NTFY_TOPIC) cfg.ntfy.topic = env.NTFY_TOPIC;
  const watchlist = JSON.parse(await readFile(join(basis, 'watchlist.json'), 'utf8'));
  const history = await leseJson(join(datenDir, 'history.json'), null);
  const sent = await leseJson(join(datenDir, 'sent.json'), {});
  const dealseiten = await leseJson(join(datenDir, 'dealseiten.json'), null);
  const fetchImpl = roh ? roh.fetch(test.fetchImpl) : test.fetchImpl;
  const holeText = wiedergabe ? macheWiedergabe(wiedergabe)
    : fixtures ? macheFixtureAbruf(join(HIER, 'test', 'fixtures')) : macheAbruf({ ...cfg.abruf, ...test.abruf }, fetchImpl);
  const jetzt = argWert(args, '--jetzt') ? new Date(argWert(args, '--jetzt')) : new Date();

  let r;
  try { r = await scan({ cfg, watchlist, history, sent, dealseiten, holeText, env, jetzt, log: console.log }); }
  catch (e) { roh?.abschluss({ absturz: String(e?.message || e) }); throw e; }
  const ok = await senden(r.msgs, cfg, { dryRun });
  r.zuSenden.forEach((k, i) => { if (ok[i]) r.sent[dedupeKey(k)] = r.current.aktualisiert; });
  const grenze = new Date(new Date(jetzt).getTime() - 45 * 864e5).toISOString();
  for (const [k, v] of Object.entries(r.sent)) if (v < grenze) delete r.sent[k];

  await mkdir(datenDir, { recursive: true });
  await writeFile(join(datenDir, 'current.json'), JSON.stringify(r.current, null, 1) + '\n');
  await writeFile(join(datenDir, 'history.json'), JSON.stringify(r.history) + '\n');
  await writeFile(join(datenDir, 'sent.json'), JSON.stringify(r.sent, null, 1) + '\n');
  await writeFile(join(datenDir, 'dealseiten.json'), JSON.stringify(r.dealseiten) + '\n');
  if (roh) {
    if (!fixtures) await rohDealSeiten(holeText, cfg);
    roh.ausgabe('current.json', JSON.stringify(r.current, null, 1) + '\n');
    roh.ausgabe('history.json', JSON.stringify(r.history) + '\n');
    roh.ausgabe('sent.json', JSON.stringify(r.sent, null, 1) + '\n');
    roh.ausgabe('dealseiten.json', JSON.stringify(r.dealseiten) + '\n');
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
