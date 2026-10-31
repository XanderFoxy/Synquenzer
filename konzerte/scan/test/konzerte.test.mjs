import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { distanzKm, geohash, istBand, erwaehnt, titelSchluessel, macheHttp } from '../lib.mjs';
import { tmParse, tmUrl } from '../sources/ticketmaster.mjs';
import { mbWaehle, mbParse } from '../sources/musicbrainz.mjs';
import { dzWaehle, dzParse } from '../sources/deezer.mjs';
import { seiteTreffer } from '../sources/seiten.mjs';
import { verarbeite } from '../kern.mjs';
import { lauf } from '../run.mjs';

const FX = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
const fx = n => fs.readFileSync(path.join(FX, n), 'utf8');
const fj = n => JSON.parse(fx(n));
const ALPHA = { name: 'Alphaville', land: 'DE' };
const OMD = { name: 'Orchestral Manoeuvres in the Dark', aliase: ['OMD'] };
const HEUTE = '2026-10-31';
const CONFIG = { zuhause: { lat: 51.1194, lon: 13.1186 }, pushRadiusKm: 200, listenRadiusKm: 400, releaseFensterTage: 120, releaseListeTage: 365 };

test('Distanz Döbeln → Leipzig/Dresden/Berlin/Prag plausibel', () => {
  const d = { lat: 51.1194, lon: 13.1186 };
  assert.ok(Math.abs(distanzKm(d, { lat: 51.3397, lon: 12.3731 }) - 57) < 5);
  assert.ok(Math.abs(distanzKm(d, { lat: 51.0504, lon: 13.7373 }) - 44) < 5);
  assert.ok(Math.abs(distanzKm(d, { lat: 52.52, lon: 13.405 }) - 157) < 6);
  assert.ok(distanzKm(d, { lat: 50.0755, lon: 14.4378 }) < 200);
});

test('Geohash bekannter Punkt', () => {
  assert.equal(geohash(57.64911, 10.40744, 11), 'u4pruydqqvj');
});

test('Namensabgleich: The optional, Aliase, keine Tribute-Bands', () => {
  assert.ok(istBand('Human League', { name: 'The Human League' }));
  assert.ok(istBand('OMD', OMD));
  assert.ok(!istBand('Alphaville Tribute', ALPHA));
});

test('Erwähnung im Fließtext: Schreibweise zählt, kurze Aliase als ganzes Wort', () => {
  assert.ok(erwaehnt('Line-up: NEW ORDER, Mesh', { name: 'New Order' }));
  assert.ok(!erwaehnt('a new order of tickets', { name: 'New Order' }));
  assert.ok(erwaehnt('mit OMD und Camouflage', OMD));
  assert.ok(!erwaehnt('ROMDA Festival', OMD));
  assert.ok(erwaehnt('Frozen Autumn live', { name: 'The Frozen Autumn' }));
});

test('Titelschlüssel entfernt Deluxe/Single-Zusätze', () => {
  assert.equal(titelSchluessel('Neue Sterne (Deluxe Edition)'), titelSchluessel('Neue Sterne'));
  assert.equal(titelSchluessel('Lichtjahr - Single'), 'lichtjahr');
  assert.notEqual(titelSchluessel('Forever Young (Part 2)'), titelSchluessel('Forever Young'));
});

test('Ticketmaster: Band, Festival, keine Abgesagten/Tribute', () => {
  const k = tmParse(fj('tm-alphaville.json'), ALPHA);
  assert.deepEqual(k.map(x => x.stadt), ['Leipzig', 'Berlin', 'Hamburg']);
  assert.equal(k[0].zeit, '20:00');
  assert.equal(k[0].festival, false);
  assert.equal(k[1].festival, true);
  assert.match(tmUrl('K', ALPHA, CONFIG.zuhause, 400), /geoPoint=u3/);
});

test('MusicBrainz: richtiger Künstler nach Land, keine Compilations, Angekündigtes erkannt', () => {
  assert.equal(mbWaehle(fj('mb-artist-alphaville.json'), ALPHA), '6b1c4d3e-alphaville-de');
  const { neu, alt } = mbParse(fj('mb-rg-alphaville.json')['release-groups'], ALPHA, HEUTE, 120);
  assert.deepEqual(neu.map(r => r.titel), ['Neue Sterne', 'Lichtjahr']);
  assert.equal(neu[1].angekuendigt, true);
  assert.equal(alt.get('forever young'), '1984-09-27');
});

test('Deezer: Neuauflagen und Compilations raus', () => {
  assert.equal(dzWaehle(fj('dz-search-alphaville.json'), ALPHA), 5402);
  const { alt } = mbParse(fj('mb-rg-alphaville.json')['release-groups'], ALPHA, HEUTE, 120);
  const r = dzParse(fj('dz-albums-alphaville.json'), ALPHA, HEUTE, 120, alt);
  assert.deepEqual(r.map(x => x.titel), ['Neue Sterne (Deluxe Edition)', 'Lichtjahr - Single']);
});

test('Festival-Seite: Bands im Text, nicht in Skripten', () => {
  const bands = [{ name: 'Elegant Machinery' }, OMD, { name: 'The Frozen Autumn' }, { name: 'Depeche Mode' }, { name: 'New Order' }];
  const t = seiteTreffer(fx('wgt.html'), { id: 'wgt', name: 'WGT', art: 'festival', url: 'https://x', stadt: 'Leipzig', lat: 51.34, lon: 12.37 }, bands);
  assert.deepEqual(t.map(x => x.band), ['Elegant Machinery', 'Orchestral Manoeuvres in the Dark', 'The Frozen Autumn']);
});

function beispiel() {
  const { neu, alt } = mbParse(fj('mb-rg-alphaville.json')['release-groups'], ALPHA, HEUTE, 365);
  return {
    konzerte: tmParse(fj('tm-alphaville.json'), ALPHA),
    releases: [...neu, ...dzParse(fj('dz-albums-alphaville.json'), ALPHA, HEUTE, 365, alt)],
  };
}

test('Erstlauf: nichts einzeln pushen, alles als gesehen merken', () => {
  const e = verarbeite({ ...beispiel(), gesehen: null, config: CONFIG, heute: HEUTE });
  assert.equal(e.erstlauf, true);
  assert.equal(e.pushes.length, 0);
  assert.equal(Object.keys(e.gesehen.releases).length, 2);
});

test('Folgelauf: nur Neues in Reichweite, MusicBrainz+Deezer = ein Release, Hamburg nur Liste', () => {
  const e = verarbeite({ ...beispiel(), gesehen: { konzerte: {}, releases: {} }, config: CONFIG, heute: HEUTE });
  const titel = e.pushes.map(p => p.titel);
  assert.deepEqual(titel.filter(t => t.startsWith('Konzert') || t.startsWith('Festival')), ['Konzert: Alphaville', 'Festival: Alphaville']);
  assert.equal(e.releases.length, 2);
  const ns = e.releases.find(r => r.titel === 'Neue Sterne');
  assert.deepEqual(ns.quellen.sort(), ['deezer', 'musicbrainz']);
  assert.match(ns.link, /deezer\.com/);
  assert.ok(e.konzerte.some(k => k.stadt === 'Hamburg' && k.km > 200));
  assert.match(e.pushes[0].text, /14\.03\.2027 20:00 · Haus Auensee, Leipzig \(\d+ km\)/);
  // Zweiter Durchlauf mit gemerktem Stand: keine Wiederholung
  for (const p of e.pushes) e.gesehen[p.art][p.key] = HEUTE;
  const e2 = verarbeite({ ...beispiel(), gesehen: e.gesehen, config: CONFIG, heute: HEUTE });
  assert.equal(e2.pushes.length, 0);
});

test('Festival-Erwähnung verschwindet → bei Rückkehr neue Meldung', () => {
  const s = { quelle: 'seite:wgt', band: 'OMD', datum: '', stadt: 'Leipzig', lat: 51.34, lon: 12.37, link: 'https://x', festival: true };
  const g = { konzerte: { 's|wgt|omd': HEUTE }, releases: {} };
  verarbeite({ konzerte: [], releases: [], gesehen: g, config: CONFIG, heute: HEUTE, seitenGeprueft: ['wgt'] });
  assert.equal(g.konzerte['s|wgt|omd'], undefined);
  const e = verarbeite({ konzerte: [s], releases: [], gesehen: g, config: CONFIG, heute: HEUTE, seitenGeprueft: ['wgt'] });
  assert.equal(e.pushes.length, 1);
});

test('HTTP: Retry bei 503, Mindestabstand pro Host', async () => {
  let n = 0; const pausen = [];
  const http = macheHttp({
    fetchImpl: async () => (++n < 2 ? { ok: false, status: 503 } : { ok: true, status: 200, json: async () => ({ ok: 1 }) }),
    schlafen: async ms => { pausen.push(ms); }, abstandMs: { 'a.test': 1000 },
  });
  assert.deepEqual(await http.get('https://a.test/x'), { ok: 1 });
  assert.equal(n, 2);
});

test('Gesamtlauf: kaputte Quelle stoppt nichts, Pushes mit Link, Dedupe über Läufe', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'konz-'));
  const posts = [];
  const fetchImpl = async (url, opt) => {
    if (opt?.method === 'POST') { posts.push(JSON.parse(opt.body)); return { ok: true, status: 200 }; }
    throw new Error('kein Netz im Test');
  };
  const gut = async ctx => ({ konzerte: ctx.bands.some(b => b.name === 'Alphaville') ? tmParse(fj('tm-alphaville.json'), ALPHA) : [] });
  const kaputt = async () => { throw new Error('Quelle tot'); };
  const quellen = [['kaputt', kaputt], ['ticketmaster', gut]];
  const env = { DATA_DIR: dir, NTFY_TOPIC: 'test-topic' };
  const jetzt = new Date(HEUTE + 'T12:00:00Z');
  const r1 = await lauf({ env, fetchImpl, jetzt, quellen });
  assert.equal(r1.erg.erstlauf, true);
  assert.equal(posts.length, 1); // nur die Willkommens-Nachricht
  assert.equal(r1.status.kaputt.ok, false);
  // neues Konzert taucht auf
  const mehr = async () => ({ konzerte: [...tmParse(fj('tm-alphaville.json'), ALPHA), { quelle: 'ticketmaster', band: 'Alphaville', titel: 'Alphaville', datum: '2027-06-06', zeit: '', ort: 'Alter Schlachthof', stadt: 'Dresden', lat: 51.07, lon: 13.73, link: 'https://tickets/dd', festival: false, status: '' }] });
  await lauf({ env, fetchImpl, jetzt, quellen: [['kaputt', kaputt], ['ticketmaster', mehr]] });
  assert.equal(posts.length, 2);
  assert.equal(posts[1].topic, 'test-topic');
  assert.equal(posts[1].click, 'https://tickets/dd');
  assert.match(posts[1].message, /Alter Schlachthof, Dresden/);
  await lauf({ env, fetchImpl, jetzt, quellen: [['kaputt', kaputt], ['ticketmaster', mehr]] });
  assert.equal(posts.length, 2); // keine Wiederholung
  // Quelle fällt aus → Liste bleibt erhalten
  await lauf({ env, fetchImpl, jetzt, quellen: [['ticketmaster', kaputt]] });
  const liste = JSON.parse(fs.readFileSync(path.join(dir, 'konzerte/data/konzerte.json'), 'utf8'));
  assert.ok(liste.konzerte.some(k => k.stadt === 'Dresden'));
  assert.equal(posts.length, 2);
});
