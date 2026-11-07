#!/usr/bin/env node
// Krypto-Wecker (stündlich als GitHub-Action, .github/workflows/krypto.yml): prüft Bitcoin/Ethereum in Euro gegen
// Xanders Käufe und schickt eine ntfy-Nachricht beim Wechsel Gewinn ↔ Verlust sowie beim Erreichen von +5 %, +10 %
// und −10 % – je Coin, ohne doppelte Meldungen (Zonen mit 0,5 Punkten Hysterese, krypto/zonen.mjs).
//
// DATENSCHUTZ: Die Zahlen stehen NUR im GitHub-Secret KRYPTO („btc:<menge>:<einsatz>,eth:<menge>:<einsatz>“), die
// Nachrichten gehen NUR an das private Thema aus dem Secret KRYPTO_NTFY_TOPIC (nie an das öffentliche Thema der
// anderen Wecker). Fehlt eins, tut der Wecker nichts. Ins Log (bei einem öffentlichen Repo öffentlich) und in den
// Daten-Zweig krypto-daten kommt nie eine Zahl: gemerkt wird je Coin nur die Zone als Wort (tief/minus/plus/hoch/top).
//
// node krypto/wecker.mjs [--zustand <datei>] [--probe]     (--probe oder DRY_RUN=1: nichts senden, nichts speichern)
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KRYPTO_COINS, ZONEN, MELDUNG, naechsteZone, kryptoPosition, kryptoErgebnis, leseKryptoText } from './zonen.mjs';

export const NTFY_SERVER = 'https://ntfy.sh';
export const SEITE = 'https://xanderfoxy.github.io/Synquenzer/mein-vorteil/#krypto';
// Öffentliches Thema der anderen Wecker (schnaeppchen/config.json) – für Krypto nie erlaubt
export const OEFFENTLICHES_TOPIC = 'xander-schnaeppchen-b5cbf4442aaa9734f3';
const ZEITLIMIT_MS = 10000;

/** Einstellungen aus den Secrets. -> { aktiv: true, topic, coins } | { aktiv: false, grund } (grund ohne Zahlen) */
export function einstellungen(env = {}) {
  const roh = String(env.KRYPTO ?? '').trim();
  const topic = String(env.KRYPTO_NTFY_TOPIC ?? '').trim();
  if (!roh) return { aktiv: false, grund: 'Secret KRYPTO fehlt' };
  if (!topic) return { aktiv: false, grund: 'Secret KRYPTO_NTFY_TOPIC fehlt' };
  if (topic === OEFFENTLICHES_TOPIC) return { aktiv: false, grund: 'KRYPTO_NTFY_TOPIC ist das öffentliche Thema – bitte ein eigenes, privates' };
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(topic)) return { aktiv: false, grund: 'KRYPTO_NTFY_TOPIC: nur Buchstaben, Ziffern, - und _ (6 bis 64 Zeichen)' };
  const r = leseKryptoText(roh);
  if (!r.ok) return { aktiv: false, grund: `Secret KRYPTO hat nicht das Format btc:<menge>:<einsatz>,eth:<menge>:<einsatz> (${r.fehler})` };
  return { aktiv: true, topic, coins: r.coins };
}

// --- Kurs-Quellen (öffentlich, ohne Schlüssel). Der Reihe nach, bis eine alle gebrauchten Coins liefert. ---------------
export function zahlAus(s) {
  if (typeof s === 'number') return Number.isFinite(s) ? s : null;
  const t = String(s ?? '').trim();
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : null;
}
async function jsonVon(fetchImpl, url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ZEITLIMIT_MS);
  try {
    const r = await fetchImpl(url, { headers: { accept: 'application/json', 'user-agent': 'Krypto-Wecker/2.0 (privat, 1x pro Stunde)' }, signal: ctl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } finally { clearTimeout(t); }
}
export const QUELLEN = [
  { name: 'CoinGecko', hole: async f => {
    const d = await jsonVon(f, 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=eur');
    return { btc: d?.bitcoin?.eur, eth: d?.ethereum?.eur };
  } },
  { name: 'Crypto.com', hole: async f => {
    const [b, e] = await Promise.all(['BTC_EUR', 'ETH_EUR'].map(i => jsonVon(f, `https://api.crypto.com/exchange/v1/public/get-tickers?instrument_name=${i}`)));
    return { btc: zahlAus(b?.result?.data?.[0]?.a), eth: zahlAus(e?.result?.data?.[0]?.a) };
  } },
  { name: 'Kraken', hole: async f => {
    const r = (await jsonVon(f, 'https://api.kraken.com/0/public/Ticker?pair=XBTEUR,ETHEUR'))?.result || {};
    const k = Object.keys(r);
    return { btc: zahlAus(r[k.find(x => /XBT/.test(x))]?.c?.[0]), eth: zahlAus(r[k.find(x => /ETH/.test(x))]?.c?.[0]) };
  } },
  { name: 'Coinbase', hole: async f => {
    const [b, e] = await Promise.all(['BTC-EUR', 'ETH-EUR'].map(p => jsonVon(f, `https://api.exchange.coinbase.com/products/${p}/ticker`)));
    return { btc: zahlAus(b?.price), eth: zahlAus(e?.price) };
  } },
];
const plausibel = (c, v) => typeof v === 'number' && Number.isFinite(v) && v >= KRYPTO_COINS[c].min && v <= KRYPTO_COINS[c].max;

/** -> { kurse: { btc, eth }, quelle, fehler } oder { kurse: null, fehler: [...] } */
export async function holeKurse(fetchImpl, coins = Object.keys(KRYPTO_COINS), quellen = QUELLEN) {
  const fehler = [];
  for (const q of quellen) {
    try {
      const k = await q.hole(fetchImpl);
      const fehlt = coins.filter(c => !plausibel(c, k?.[c]));
      if (fehlt.length) { fehler.push(`${q.name}: kein gültiger Kurs für ${fehlt.join(', ')}`); continue; }
      return { kurse: Object.fromEntries(coins.map(c => [c, k[c]])), quelle: q.name, fehler };
    } catch (e) { fehler.push(`${q.name}: ${e?.name === 'AbortError' ? 'Zeitlimit' : e?.message || e}`); }
  }
  return { kurse: null, quelle: null, fehler };
}

const deZahl = (v, nk) => v.toLocaleString('de-DE', { minimumFractionDigits: nk, maximumFractionDigits: nk });
export const euro = v => `${deZahl(v, Math.abs(v) < 100 ? 2 : 0)} €`;
export const euroVz = v => `${v > 0 ? '+' : v < 0 ? '−' : '±'}${deZahl(Math.abs(v), 2)} €`;
export const prozentVz = p => `${p > 0 ? '+' : p < 0 ? '−' : '±'}${deZahl(Math.abs(p), 1)} %`;

/** Nachricht an das PRIVATE Thema: Kurs, Gewinn/Verlust in € und %, Wert. */
export function nachricht(c, e, meldung, topic) {
  const coin = KRYPTO_COINS[c];
  const runter = meldung === 'verlust' || meldung === 'minus10';
  return {
    topic,
    title: `${coin.zeichen} ${coin.name}: ${MELDUNG[meldung]}`,
    message: `Kurs ${euro(e.kurs)} · ${e.gv >= 0 ? 'Gewinn' : 'Verlust'} ${euroVz(e.gv)} (${prozentVz(e.prozent)}) · Wert ${euro(e.wert)} · im Plus ab ${euro(e.schwelle)}`,
    click: SEITE,
    priority: 4,
    tags: [runter ? 'chart_with_downwards_trend' : 'chart_with_upwards_trend'],
    actions: [{ action: 'view', label: 'Mein Vorteil öffnen', url: SEITE, clear: true }],
  };
}
/** Einmal beim allerersten Lauf: der Wecker läuft (mit dem Stand je Coin). */
export function startNachricht(stand, topic) {
  return {
    topic,
    title: 'Krypto-Wecker ist aktiv',
    message: `${Object.entries(stand).map(([c, e]) => `${KRYPTO_COINS[c].name} ${prozentVz(e.prozent)} (${euroVz(e.gv)})`).join(' · ')}. Du bekommst eine Nachricht bei Gewinn ↔ Verlust, +5 %, +10 % und −10 %.`,
    click: SEITE,
    priority: 3,
    tags: ['bell'],
  };
}

/** Gemerkter Zustand -> nur gültige Zonen-Wörter (alles andere wird verworfen). */
export function saubererZustand(z) {
  const out = {};
  if (z && typeof z === 'object') for (const c of Object.keys(KRYPTO_COINS)) if (ZONEN.includes(z[c])) out[c] = z[c];
  return out;
}

/**
 * Ein Prüflauf ohne Netz und Dateien. coins = { btc: { menge, einsatz } }, kurse = { btc: 67971 }, zustand = { btc: 'plus' }.
 * -> { zustand, nachrichten: [{ coin, msg }], stand: { btc: ergebnis }, status: { btc: 'gemeldet'|'unverändert'|'gemerkt'|'kein Kurs' } }
 */
export function pruefe({ coins, kurse, zustand, topic }) {
  const vorher = saubererZustand(zustand);
  const neu = { ...vorher };
  const nachrichten = [], stand = {}, status = {};
  for (const [c, x] of Object.entries(coins)) {
    const e = kryptoErgebnis(kryptoPosition({ kaeufe: [{ betrag: x.einsatz, menge: x.menge }] }), kurse?.[c]);
    if (!e) { status[c] = 'kein Kurs'; continue; }
    stand[c] = e;
    const z = naechsteZone(vorher[c], e.prozent);
    neu[c] = z.zone;
    if (z.meldung) { nachrichten.push({ coin: c, msg: nachricht(c, e, z.meldung, topic) }); status[c] = 'gemeldet'; }
    else status[c] = vorher[c] ? 'unverändert' : 'gemerkt';
  }
  return { zustand: neu, nachrichten, stand, status };
}

export async function senden(msgs, { dryRun = false, fetchImpl = fetch, log = console.log } = {}) {
  const ok = [];
  for (const m of msgs) {
    // auch im Probelauf nie den Inhalt ins Log (Zahlen!)
    if (dryRun) { log('[probe] Nachricht vorbereitet, nicht gesendet'); ok.push(true); continue; }
    try {
      const r = await fetchImpl(NTFY_SERVER, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(m) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      ok.push(true);
    } catch (e) { log(`ntfy fehlgeschlagen: ${e.message}`); ok.push(false); }
  }
  return ok;
}

const arg = (args, n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
async function leseJson(pfad) { try { return JSON.parse(await readFile(pfad, 'utf8')); } catch { return null; } }

export async function main(args = process.argv.slice(2), env = process.env, { fetchImpl = globalThis.fetch, log = console.log } = {}) {
  const e = einstellungen(env);
  if (!e.aktiv) { log(`Krypto-Wecker: ${e.grund} – nichts zu tun.`); return { aktiv: false, grund: e.grund }; }
  const pfad = resolve(arg(args, '--zustand') || env.KRYPTO_ZUSTAND || 'krypto-zustand.json');
  const dryRun = args.includes('--probe') || env.DRY_RUN === '1';
  const { kurse, quelle, fehler } = await holeKurse(fetchImpl, Object.keys(e.coins));
  if (!kurse) {
    log(`::warning::Kurs gerade nicht abrufbar – nächster Versuch in einer Stunde. ${fehler.join(' | ')}`);
    return { aktiv: true, kurse: null, fehler };
  }
  const vorher = await leseJson(pfad);
  const r = pruefe({ coins: e.coins, kurse, zustand: vorher, topic: e.topic });
  const msgs = r.nachrichten.map(n => n.msg);
  const erster = !vorher || !Object.keys(saubererZustand(vorher)).length;
  if (erster && Object.keys(r.stand).length) msgs.push(startNachricht(r.stand, e.topic));
  const ok = await senden(msgs, { dryRun, fetchImpl, log });
  // nicht zugestellt -> alte Zone behalten (der nächste Lauf meldet noch einmal)
  r.nachrichten.forEach((n, i) => {
    if (ok[i]) return;
    const alt = saubererZustand(vorher)[n.coin];
    if (alt) r.zustand[n.coin] = alt; else delete r.zustand[n.coin];
    r.status[n.coin] = 'Meldung fehlgeschlagen';
  });
  // Log ist bei einem öffentlichen Repo öffentlich: nur Wörter, nie Mengen, Einsätze, Prozente oder Zonen
  for (const [c, s] of Object.entries(r.status)) log(`${KRYPTO_COINS[c].name}: ${s}`);
  log(`Kurs-Quelle: ${quelle}${fehler.length ? ` (vorher versucht: ${fehler.join(' | ')})` : ''}`);
  const inhalt = JSON.stringify(saubererZustand(r.zustand)) + '\n';
  const geaendert = JSON.stringify(saubererZustand(vorher)) + '\n' !== inhalt;
  if (!dryRun && (geaendert || !vorher)) {
    await mkdir(dirname(pfad), { recursive: true });
    await writeFile(pfad, inhalt);
  }
  return { aktiv: true, kurse, quelle, gesendet: ok.filter(Boolean).length, zustand: r.zustand, status: r.status, geaendert };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(err => { console.error(err?.message || err); process.exit(1); });
}
