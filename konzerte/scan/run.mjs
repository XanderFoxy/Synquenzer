#!/usr/bin/env node
// Konzert- & Release-Alarm. Aufruf: DATA_DIR=<ordner> node konzerte/scan/run.mjs
// Env: TM_KEY (Ticketmaster), NTFY_TOPIC (überschreibt config), NTFY_TOKEN (optional), DRY_RUN=1 (keine Pushes)
//      ROH_DIR=<ordner>: Roh-Mitschnitt (alle Quell-Antworten + Ergebnis), immer ohne Push.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { macheHttp, ntfy } from './lib.mjs';
import { rohOrdner, macheMitschnitt } from './roh.mjs';
import { koordinaten } from './geo.mjs';
import { verarbeite, mitAltbestand } from './kern.mjs';
import ticketmaster from './sources/ticketmaster.mjs';
import musicbrainz from './sources/musicbrainz.mjs';
import deezer from './sources/deezer.mjs';
import seiten from './sources/seiten.mjs';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HIER, '..');
const lies = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return d; } };
const schreib = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 1) + '\n'); };

// Reihenfolge wichtig: MusicBrainz vor Deezer (liefert alte Titel zur Neuauflagen-Erkennung).
export const QUELLEN = [['ticketmaster', ticketmaster], ['seiten', seiten], ['musicbrainz', musicbrainz], ['deezer', deezer]];

export async function lauf({ env = process.env, fetchImpl = globalThis.fetch, jetzt = new Date(), quellen = QUELLEN, http } = {}) {
  const config = lies(path.join(ROOT, 'config.json'));
  const bands = lies(path.join(ROOT, 'artists.json')).bands.filter(b => b.aktiv !== false);
  const dir = path.join(env.DATA_DIR || path.join(ROOT, 'data-lokal'), 'konzerte', 'data');
  const f = n => path.join(dir, n);
  const heute = jetzt.toISOString().slice(0, 10);
  const vorher = { konzerte: lies(f('konzerte.json'), {}).konzerte || [], releases: lies(f('releases.json'), {}).releases || [] };
  const ids = lies(f('ids.json'), { mb: {}, deezer: {} });
  const geoCache = lies(f('geo.json'), {});
  const gesehen = lies(f('gesehen.json'), null);
  const rohDir = rohOrdner([], env);
  const roh = rohDir ? macheMitschnitt(rohDir, { projekt: 'konzerte', env }) : null;
  http = http || macheHttp({ fetchImpl: roh ? roh.fetch(fetchImpl) : fetchImpl, abstandMs: { 'musicbrainz.org': 1100, 'nominatim.openstreetmap.org': 1100, 'app.ticketmaster.com': 250 } });

  const ctx = { http, bands, config, env, heute, ids, log: console.log };
  const status = {}, konzerte = [], releases = [], kaputt = new Set(), bandKaputt = new Set();
  let seitenGeprueft = [];
  for (const [name, fn] of quellen) {
    const t0 = Date.now();
    try {
      const r = (await fn(ctx)) || {};
      konzerte.push(...(r.konzerte || [])); releases.push(...(r.releases || []));
      const n = (r.konzerte || []).length + (r.releases || []).length;
      status[name] = { ok: !r.fehler?.length, treffer: n, fehler: r.fehler || [], uebersprungen: r.uebersprungen || null, ms: Date.now() - t0 };
      if (r.fehler?.length && (r.fehler.length >= bands.length || name === 'seiten')) kaputt.add(name);
      for (const f of r.fehler || []) { const b = bands.find(x => String(f).startsWith(`${x.name}:`)); if (b) bandKaputt.add(`${name}|${b.name}`); }
      if (r.geprueft) seitenGeprueft = r.geprueft;
    } catch (e) {
      kaputt.add(name);
      status[name] = { ok: false, treffer: 0, fehler: [String(e.message || e)], ms: Date.now() - t0 };
    }
  }
  // Seiten-Quelle: nur die einzelnen kaputten Seiten aus dem Altbestand übernehmen
  const quelleKaputt = (q, x) => kaputt.has(q) || (q.startsWith('seite:') && !seitenGeprueft.includes(q.slice(6))) || bandKaputt.has(`${q}|${x?.band}`);
  const alleK = mitAltbestand(konzerte, vorher.konzerte, quelleKaputt);
  const alleR = mitAltbestand(releases, vorher.releases, quelleKaputt);

  for (const k of alleK) if ((k.lat == null || k.lon == null) && k.stadt) Object.assign(k, await koordinaten(k.stadt, k.land, geoCache, http) || {});

  const erg = verarbeite({ konzerte: alleK, releases: alleR, gesehen, config, heute, jetzt: jetzt.toISOString(), seitenGeprueft });
  const ziel = { server: config.ntfy.server, topic: env.NTFY_TOPIC || config.ntfy.topic, token: env.NTFY_TOKEN };
  const MAX = 8, seiteUrl = config.seiteUrl;
  let gesendet = 0;
  // Roh-Modus ist immer ein Probelauf: keine Pushes (der Workflow schreibt dann auch nichts auf den Daten-Branch)
  const probe = !!(env.DRY_RUN || roh), probePushes = [];
  const senden = async p => { if (probe) { probePushes.push(p); console.log('[push]', p.titel, '|', p.text.replace(/\n/g, ' / ')); return; } await ntfy(ziel, p, fetchImpl); };

  if (erg.erstlauf) {
    try {
      await senden({ titel: 'Konzert-Alarm ist aktiv', text: `${erg.konzerte.length} Konzerte und ${erg.releases.length} Veröffentlichungen gefunden. Ab jetzt kommt jede Neuigkeit einzeln.`, link: seiteUrl, tags: ['tada'], prio: 3 });
    } catch (e) { status.ntfy = { ok: false, fehler: [e.message] }; }
  }
  for (const [i, p] of erg.pushes.entries()) {
    if (i >= MAX) { erg.gesehen[p.art][p.key] = heute; continue; }
    try { await senden(p); erg.gesehen[p.art][p.key] = heute; gesendet++; }
    catch (e) { status.ntfy = { ok: false, fehler: [...(status.ntfy?.fehler || []), e.message] }; }
  }
  if (erg.pushes.length > MAX) {
    try { await senden({ titel: `+${erg.pushes.length - MAX} weitere Neuigkeiten`, text: 'Alles auf der Konzert-Seite.', link: seiteUrl, tags: ['bell'], prio: 3 }); } catch {}
  }

  const stand = jetzt.toISOString();
  schreib(f('konzerte.json'), { stand, zuhause: config.zuhause, pushRadiusKm: config.pushRadiusKm, konzerte: erg.konzerte });
  schreib(f('releases.json'), { stand, releases: erg.releases });
  schreib(f('status.json'), { stand, quellen: status, pushes: gesendet, erstlauf: erg.erstlauf });
  schreib(f('gesehen.json'), erg.gesehen);
  schreib(f('ids.json'), ids);
  schreib(f('geo.json'), geoCache);
  if (roh) {
    for (const n of ['konzerte.json', 'releases.json', 'status.json', 'gesehen.json', 'ids.json', 'geo.json']) roh.ausgabe(n, fs.readFileSync(f(n), 'utf8'));
    roh.ausgabe('pushes.json', probePushes);
    roh.abschluss({ dryRun: true, konzerte: erg.konzerte.length, releases: erg.releases.length, pushes: probePushes.length });
    console.log(`Roh-Mitschnitt: ${roh.abrufe.length} Abrufe → ${roh.dir}`);
  }
  console.log(`Konzerte: ${erg.konzerte.length}, Releases: ${erg.releases.length}, Pushes: ${gesendet}/${erg.pushes.length}`);
  for (const [n, s] of Object.entries(status)) console.log(`  ${n}: ${s.ok ? 'ok' : 'FEHLER'} ${s.treffer ?? ''} ${s.uebersprungen || ''} ${(s.fehler || []).slice(0, 3).join(' | ')}`);
  return { erg, status, gesendet };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  lauf().catch(e => { console.error(e); process.exit(1); });
}
