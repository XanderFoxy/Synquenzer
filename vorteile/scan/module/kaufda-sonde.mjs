// NUR Probe-Zweig mv-kaufda-ort (16.11.2026): welche kaufDA-Adresse liefert Angebote für Döbeln/Chemnitz/Leipzig?
// Wenige Abrufe (Budget), Pause wie immer 2,1 s (abruf.pauseMsJeHost), robots.txt beachtet (keine /api/, /search, /portal/).
const NEXT = /<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]+?)<\/script>/;
const ORT = /filiale|chemnitz|doebeln|d%c3%b6beln|döbeln|leipzig|dresden|sachsen|stadt|staedte|standort|ort=|plz|zip|lat=|lng=/i;
const VERBOTEN = /\/(?:Catalogue|mv|brochure-viewer\/brochure|dyn|api\/febe|api\/frontend|sessionData|portal|webapp|shelf|contentViewer|search|einkaufshelfer)\b|\/[^/]+\/[^/]+\/ajax\//i;

function lies(html, basis) {
  const r = { bytes: html.length };
  const m = html.match(NEXT);
  if (m) {
    try {
      const d = JSON.parse(m[1]);
      r.page = d.page; r.query = d.query; r.buildId = d.buildId;
      const pp = d.props?.pageProps || {};
      r.pageProps = Object.keys(pp);
      const pi = pp.pageInformation || {};
      r.pi = Object.keys(pi);
      r.location = pi.location || null; r.url = pi.url || null; r.type = pi.type || null; r.template = pi.template || null;
      const items = [];
      const lauf = (x, t) => { if (!x || typeof x !== 'object' || t > 8) return; if (Array.isArray(x)) { for (const y of x) { if (y && y.type === 'OFFER') items.push(y); else lauf(y, t + 1); } return; } for (const v of Object.values(x)) lauf(v, t + 1); };
      lauf(pi, 0);
      const jeH = {};
      for (const o of items) jeH[o.publisherName] = (jeH[o.publisherName] || 0) + 1;
      r.angebote = items.length; r.haendler = jeH;
      r.prospekte = [...new Set(items.map(o => o.parentContent?.id).filter(Boolean))].slice(0, 12);
      const br = pi.brochures;
      const brl = [];
      const bl = (x, t) => { if (!x || typeof x !== 'object' || t > 5) return; if (Array.isArray(x)) { for (const y of x) { if (y && y.id && (y.validFrom || y.title)) brl.push({ id: y.id, titel: y.title || y.name, von: y.validFrom, bis: y.validUntil, haendler: y.publisherName || y.publisher?.name, seiten: y.pageCount }); else bl(y, t + 1); } return; } for (const v of Object.values(x)) bl(v, t + 1); };
      bl(br, 0);
      r.brochures = brl.slice(0, 15);
      // Schlüssel mit Orts-/Filial-Bezug irgendwo im Datenblock
      const keys = new Set();
      const kl = (x, pfad, t) => { if (!x || typeof x !== 'object' || t > 7) return; for (const [k, v] of Object.entries(x)) { if (/store|filial|city|cities|near|location|region|zip/i.test(k)) keys.add(`${pfad}.${k}`); if (k !== '_nextI18Next') kl(v, `${pfad}.${k}`, t + 1); } };
      kl(pp, 'pp', 0);
      r.ortsSchluessel = [...keys].slice(0, 40);
    } catch (e) { r.nextFehler = String(e.message); }
  } else r.ohneNext = true;
  const links = new Set();
  for (const mm of html.matchAll(/https?:\\?\/\\?\/www\.kaufda\.de(\\?\/[^"'<>\s\\]*)/g)) links.add(mm[1].replace(/\\\//g, '/'));
  for (const mm of html.matchAll(/href="(\/[^"]*)"/g)) links.add(mm[1]);
  const alle = [...links].filter(l => l.length > 1);
  r.linksOrt = alle.filter(l => ORT.test(l)).slice(0, 60);
  const muster = {};
  for (const l of alle) { const k = l.split('?')[0].split('/').slice(0, 3).join('/'); muster[k] = (muster[k] || 0) + 1; }
  r.linkMuster = Object.entries(muster).sort((a, b) => b[1] - a[1]).slice(0, 40);
  r.skripte = [...html.matchAll(/src="(\/_next\/static\/chunks\/(?:pages\/[^"]+|main-[^"]+|webpack-[^"]+))"/g)].map(x => x[1]).slice(0, 8);
  r.basis = basis;
  return r;
}

export async function kaufdaSonde({ holeText, basis = 'https://www.kaufda.de', max = 26, log = console.log }) {
  const out = { schritte: [], abrufe: 0 };
  const opts = { headers: { accept: 'text/html,application/xhtml+xml' } };
  const hole = async (pfad, warum) => {
    const url = /^https?:/.test(pfad) ? pfad : `${basis}${pfad}`;
    if (VERBOTEN.test(new URL(url).pathname)) { out.schritte.push({ url, warum, fehler: 'robots.txt' }); return null; }
    if (out.abrufe >= max) { out.schritte.push({ url, warum, fehler: 'Budget' }); return null; }
    out.abrufe++;
    try {
      const html = await holeText(url, opts);
      const r = lies(html, basis);
      out.schritte.push({ url, warum, ...r });
      log(`SONDE ${url} [${warum}] page=${r.page} loc=${JSON.stringify(r.location)} angebote=${r.angebote} haendler=${JSON.stringify(r.haendler)} ortLinks=${(r.linksOrt || []).length}`);
      return r;
    } catch (e) {
      out.schritte.push({ url, warum, fehler: String(e.message) });
      log(`SONDE ${url} [${warum}] FEHLER ${e.message}`);
      return null;
    }
  };
  const start = await hole('/', 'Startseite: Stadt-Links?');
  const kl = await hole('/Geschaefte/Kaufland', 'Händlerseite bundesweit');
  // Orts-Links aus Start- und Händlerseite verfolgen (Döbeln/Chemnitz/Leipzig zuerst)
  const kandidaten = [...new Set([...(kl?.linksOrt || []), ...(start?.linksOrt || [])])];
  const prio = l => (/doebeln|döbeln|d%c3%b6beln/i.test(l) ? 0 : /chemnitz/i.test(l) ? 1 : /leipzig/i.test(l) ? 2 : /filiale/i.test(l) ? 3 : 4);
  kandidaten.sort((a, b) => prio(a) - prio(b));
  out.kandidaten = kandidaten.slice(0, 80);
  const gefolgt = new Set();
  for (const l of kandidaten.slice(0, 6)) { gefolgt.add(l); await hole(l, 'Orts-Link'); }
  // Muster aus gefundenen Filial-/Stadt-Links auf Döbeln/Chemnitz/Leipzig übertragen
  const stadtMuster = [];
  for (const l of kandidaten) {
    const m = l.match(/^(\/[^/?]*Filiale[^/?]*\/)([^/?]+)(\/[^?]*)?/i);
    if (m) stadtMuster.push(m);
  }
  const probiert = new Set(gefolgt);
  for (const m of stadtMuster.slice(0, 3)) {
    for (const stadt of ['Doebeln', 'Chemnitz']) {
      const p = `${m[1]}${stadt}${m[3] || ''}`;
      if (!probiert.has(p)) { probiert.add(p); await hole(p, `Muster ${m[0]} -> ${stadt}`); }
    }
  }
  // Raten (nur wenn oben nichts kam): typische Formen
  for (const p of ['/Filialen/Doebeln', '/Filialen/Chemnitz/Kaufland', '/Geschaefte/Kaufland/Doebeln', '/Doebeln', '/Chemnitz']) {
    if (!probiert.has(p)) { probiert.add(p); await hole(p, 'geraten'); }
  }
  // Ort per Adresse (Parameter) – ändert sich location?
  await hole('/Geschaefte/Kaufland?lat=51.1197&lng=13.1104', 'Parameter lat/lng Döbeln');
  await hole('/Geschaefte/Kaufland?zip=04720', 'Parameter zip');
  await hole('/Geschaefte/Marktkauf', 'Marktkauf bundesweit');
  // Skripte für die Ortswahl (Cookie-/Parameter-Namen), nur die Seiten-Chunks
  const skripte = [...new Set([...(kl?.skripte || [])])].filter(s => /pages\//.test(s)).slice(0, 2);
  for (const s of skripte) await hole(s, 'Skript (Ortswahl?)');
  log(`SONDE fertig: ${out.abrufe} Abrufe`);
  return out;
}
