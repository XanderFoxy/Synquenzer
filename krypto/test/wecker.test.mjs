// Krypto-Wecker (GitHub-Action): Secrets KRYPTO + KRYPTO_NTFY_TOPIC, Kurs-Quellen gemockt (kein Netz), Meldungen nur ans
// private Thema, Zustand nur als Zonen-Wort, keine Zahl im Log oder im Zustand. Alle Zahlen hier sind erfunden.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { einstellungen, holeKurse, pruefe, nachricht, main, OEFFENTLICHES_TOPIC, SEITE, saubererZustand } from '../wecker.mjs';

const TOPIC = 'privat-test-7f3a9c';
// erfunden: 0.02 BTC für 1.000 € (Ø 50.000 €), 0.5 ETH für 1.000 € (Ø 2.000 €)
const ENV = { KRYPTO: 'btc:0.02:1000,eth:0.5:1000', KRYPTO_NTFY_TOPIC: TOPIC };

// Kurs-Antworten im Format der echten APIs
function fakeFetch({ kaputt = [], kurse = { btc: 52600, eth: 1890 }, ntfyKaputt = false } = {}) {
  const aufrufe = [], ntfy = [];
  const f = async (url, o = {}) => {
    aufrufe.push(url);
    const json = body => ({ ok: true, status: 200, json: async () => body });
    if (url === 'https://ntfy.sh') { if (ntfyKaputt) return { ok: false, status: 500 }; ntfy.push(JSON.parse(o.body)); return { ok: true, status: 200 }; }
    if (url.includes('coingecko')) {
      if (kaputt.includes('coingecko')) return { ok: false, status: 429, json: async () => ({}) };
      return json({ bitcoin: { eur: kurse.btc }, ethereum: { eur: kurse.eth } });
    }
    if (url.includes('crypto.com')) {
      if (kaputt.includes('cryptocom')) throw new TypeError('fetch failed');
      const i = new URL(url).searchParams.get('instrument_name');
      return json({ id: -1, method: 'public/get-tickers', code: 0, result: { data: [{ i, a: String(i === 'BTC_EUR' ? kurse.btc : kurse.eth), c: '0.0025' }] } });
    }
    if (url.includes('kraken') || url.includes('coinbase')) throw new TypeError('fetch failed');
    throw new Error('unerwarteter Abruf ' + url);
  };
  return { f, aufrufe, ntfy };
}
const leise = () => { const zeilen = []; return { log: s => zeilen.push(String(s)), zeilen }; };
const OHNE_ZAHLEN = /\d/;

test('Secrets: fehlt eins -> nichts tun; öffentliches Thema verboten; Format geprüft', () => {
  assert.deepEqual(einstellungen({}), { aktiv: false, grund: 'Secret KRYPTO fehlt' });
  assert.deepEqual(einstellungen({ KRYPTO: ENV.KRYPTO }), { aktiv: false, grund: 'Secret KRYPTO_NTFY_TOPIC fehlt' });
  assert.equal(einstellungen({ KRYPTO_NTFY_TOPIC: TOPIC }).aktiv, false);
  assert.match(einstellungen({ ...ENV, KRYPTO_NTFY_TOPIC: OEFFENTLICHES_TOPIC }).grund, /öffentliche Thema/);
  assert.equal(einstellungen({ ...ENV, KRYPTO_NTFY_TOPIC: 'mit leerzeichen' }).aktiv, false);
  const e = einstellungen({ ...ENV, KRYPTO: 'btc:0.02:1000,eth:kaputt' });
  assert.equal(e.aktiv, false);
  assert.doesNotMatch(e.grund, /0\.02|1000/, 'Fehlertext ohne die Zahlen aus dem Secret');
  assert.deepEqual(einstellungen(ENV), { aktiv: true, topic: TOPIC, coins: { btc: { menge: 0.02, einsatz: 1000 }, eth: { menge: 0.5, einsatz: 1000 } } });
});

test('ohne Secrets: kein einziger Abruf', async () => {
  const { f, aufrufe } = fakeFetch();
  const { log, zeilen } = leise();
  const r = await main([], {}, { fetchImpl: f, log });
  assert.equal(r.aktiv, false);
  assert.deepEqual(aufrufe, []);
  assert.match(zeilen.join('\n'), /nichts zu tun/);
});

test('Kurs-Quellen der Reihe nach; alle gestört -> Warnung ohne Absturz', async () => {
  const a = fakeFetch({ kaputt: ['coingecko'] });
  const r = await holeKurse(a.f, ['btc', 'eth']);
  assert.equal(r.quelle, 'Crypto.com');
  assert.deepEqual(r.kurse, { btc: 52600, eth: 1890 });
  const b = fakeFetch({ kaputt: ['coingecko', 'cryptocom'] });
  const { log, zeilen } = leise();
  const m = await main(['--zustand', join(await mkdtemp(join(tmpdir(), 'krypto-')), 'z.json')], ENV, { fetchImpl: b.f, log });
  assert.equal(m.kurse, null);
  assert.match(zeilen.join('\n'), /::warning::Kurs gerade nicht abrufbar/);
  assert.equal(b.ntfy.length, 0);
});

test('pruefe: erste Prüfung merkt nur, dann Meldung beim Zonenwechsel – Nachricht mit Kurs, G/V € und %', () => {
  const coins = einstellungen(ENV).coins;
  // BTC 52.600 € -> +5,2 % (+52 €); ETH 1.890 € -> −5,5 %
  const r1 = pruefe({ coins, kurse: { btc: 52600, eth: 1890 }, zustand: null, topic: TOPIC });
  assert.deepEqual(r1.zustand, { btc: 'hoch', eth: 'minus' });
  assert.equal(r1.nachrichten.length, 0);
  assert.deepEqual(r1.status, { btc: 'gemerkt', eth: 'gemerkt' });
  // ETH steigt auf 2.020 € (+1 %) -> Gewinn; BTC bleibt
  const r2 = pruefe({ coins, kurse: { btc: 52700, eth: 2020 }, zustand: r1.zustand, topic: TOPIC });
  assert.deepEqual(r2.nachrichten.map(n => n.coin), ['eth']);
  const m = r2.nachrichten[0].msg;
  assert.equal(m.topic, TOPIC);
  assert.equal(m.title, 'Ξ Ethereum: jetzt im Gewinn');
  assert.match(m.message, /^Kurs 2\.020 € · Gewinn \+10,00 € \(\+1,0 %\) · Wert 1\.010 € · im Plus ab 2\.000 €$/);
  assert.equal(m.click, SEITE);
  // gleiche Lage noch einmal -> nichts
  assert.equal(pruefe({ coins, kurse: { btc: 52700, eth: 2020 }, zustand: r2.zustand, topic: TOPIC }).nachrichten.length, 0);
  // BTC −10 %
  const r3 = pruefe({ coins, kurse: { btc: 45000, eth: 2020 }, zustand: r2.zustand, topic: TOPIC });
  assert.equal(r3.nachrichten[0].msg.title, '₿ Bitcoin: −10 % erreicht');
  assert.match(r3.nachrichten[0].msg.message, /Verlust −100,00 € \(−10,0 %\)/);
  assert.deepEqual(r3.nachrichten[0].msg.tags, ['chart_with_downwards_trend']);
  assert.equal(nachricht('btc', { kurs: 1, wert: 1, gv: 0, prozent: 0, schwelle: 1 }, 'plus5', TOPIC).title, '₿ Bitcoin: +5 % erreicht');
});

test('Gesamtlauf: Start-Nachricht, Meldung nur ans private Thema, Zustand nur Zonen-Wörter, Log ohne Zahlen', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'krypto-'));
  const pfad = join(dir, 'krypto', 'zonen.json');
  const a = fakeFetch({ kurse: { btc: 52600, eth: 1890 } });
  const l1 = leise();
  const r1 = await main(['--zustand', pfad], ENV, { fetchImpl: a.f, log: l1.log });
  assert.equal(r1.gesendet, 1);
  assert.equal(a.ntfy[0].title, 'Krypto-Wecker ist aktiv');
  assert.match(a.ntfy[0].message, /Bitcoin \+5,2 % \(\+52,00 €\) · Ethereum −5,5 % \(−55,00 €\)/);
  const inhalt = await readFile(pfad, 'utf8');
  assert.equal(inhalt, '{"btc":"hoch","eth":"minus"}\n');
  assert.doesNotMatch(inhalt, OHNE_ZAHLEN, 'keine Zahl im Daten-Zweig');
  // zweiter Lauf: ETH dreht ins Plus
  const b = fakeFetch({ kurse: { btc: 52600, eth: 2020 } });
  const l2 = leise();
  const r2 = await main(['--zustand', pfad], ENV, { fetchImpl: b.f, log: l2.log });
  assert.equal(r2.gesendet, 1);
  assert.deepEqual(b.ntfy.map(n => n.topic), [TOPIC]);
  assert.equal(b.ntfy[0].title, 'Ξ Ethereum: jetzt im Gewinn');
  assert.equal(await readFile(pfad, 'utf8'), '{"btc":"hoch","eth":"plus"}\n');
  // dritter Lauf: nichts Neues -> nichts senden, Datei unverändert
  const c = fakeFetch({ kurse: { btc: 52650, eth: 2025 } });
  const r3 = await main(['--zustand', pfad], ENV, { fetchImpl: c.f, log: () => {} });
  assert.equal(r3.gesendet, 0);
  assert.equal(r3.geaendert, false);
  // Log: keine Menge, kein Einsatz, kein Prozent, kein Topic
  for (const z of [...l1.zeilen, ...l2.zeilen]) {
    assert.doesNotMatch(z, /0\.02|0\.5|1000|1\.000|%|€|privat-test|hoch|minus|plus/, z);
  }
  assert.match(l2.zeilen.join('\n'), /Ethereum: gemeldet/);
});

test('Meldung fehlgeschlagen -> Zone nicht weiterschalten (nächster Lauf meldet noch einmal); Probelauf sendet und speichert nichts', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'krypto-'));
  const pfad = join(dir, 'z.json');
  await writeFile(pfad, '{"btc":"hoch","eth":"minus"}\n');
  const a = fakeFetch({ kurse: { btc: 52600, eth: 2020 }, ntfyKaputt: true });
  const r = await main(['--zustand', pfad], ENV, { fetchImpl: a.f, log: () => {} });
  assert.equal(r.gesendet, 0);
  assert.equal(await readFile(pfad, 'utf8'), '{"btc":"hoch","eth":"minus"}\n');
  const b = fakeFetch({ kurse: { btc: 52600, eth: 2020 } });
  const { log, zeilen } = leise();
  await main(['--zustand', pfad, '--probe'], ENV, { fetchImpl: b.f, log });
  assert.equal(b.ntfy.length, 0);
  assert.match(zeilen.join('\n'), /\[probe\] Nachricht vorbereitet, nicht gesendet/);
  assert.doesNotMatch(zeilen.join('\n'), /2\.020|Gewinn/);
  assert.equal(await readFile(pfad, 'utf8'), '{"btc":"hoch","eth":"minus"}\n');
});

test('kaputter oder fremder Zustand wird bereinigt (nur Zonen-Wörter bleiben)', () => {
  assert.deepEqual(saubererZustand({ btc: 'hoch', eth: 42, doge: 'top', version: 1 }), { btc: 'hoch' });
  assert.deepEqual(saubererZustand('x'), {});
});
