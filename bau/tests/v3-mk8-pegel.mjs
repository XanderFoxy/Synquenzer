// MK8-04 Pegel (and the data for MK8-06): every program with its role's test phrase through the app worklet (mkRender,
// OfflineAudioContext, seed 1): -18 +- 3 LUFS, true peak <= -1 dBTP, basses M-HANDYrel at C2 >= -20 dB; H15 (input) and H16
// (INIT) exempt. --cal N: N rounds of calibration (a.lvl of the timbres, voc.lvl of vocoder programs; target -18 LUFS),
// rebuilding the data block in between (v3-mk8-bau.mjs). Usage: node v3-mk8-pegel.mjs <index.html> [--cal N] [--bands]
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import {programs, encode, blockText, inject, CAL_FILE} from './v3-mk8-bau.mjs';
const FILE = path.resolve(process.argv[2]), CAL = process.argv.includes('--cal') ? +process.argv[process.argv.indexOf('--cal') + 1] || 1 : 0, BANDS = process.argv.includes('--bands');
const DIR = path.dirname(new URL(import.meta.url).pathname), MESS = fs.readFileSync(DIR + '/v3-mk8-mess.js', 'utf8');
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
async function run() {
  const page = await browser.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  await page.evaluate(MESS); await page.evaluate(() => { mkLoad(); return MKF.decodeAll(); });
  const res = [];
  for (let b = 1; b <= 8; b++) res.push(...await page.evaluate(async ([b, bands]) => { const o = []; for (let s = 1; s <= 16; s++) o.push(await MK8M.measure(b, s, {bands})); return o; }, [b, BANDS]));
  await page.close(); return {res, errs};
}
const exempt = id => id === 'f-mk-h15' || id === 'f-init-am';
for (let round = 0; round <= CAL; round++) {
  const {res, errs} = await run();
  if (errs.length) console.log('Konsolenfehler', errs.slice(0, 5));
  if (round === CAL) {   // report
    let fail = 0;
    for (const r of res) {
      const bad = [];
      if (!exempt(r.id)) { if (Math.abs(r.lufs + 18) > 3) bad.push('LUFS'); if (r.tp > -1) bad.push('TP'); if (r.handy != null && r.handy < -20) bad.push('HANDY'); }
      if (r.nan) bad.push('NaN');
      if (bad.length) fail++;
      console.log((bad.length ? 'FAIL ' : 'ok   ') + r.id.padEnd(10) + r.role.padEnd(10) + ' LUFS ' + r.lufs.toFixed(1).padStart(6) + '  TP ' + r.tp.toFixed(1).padStart(5) + (r.handy != null ? '  HANDYrel ' + r.handy.toFixed(1) : '') + (exempt(r.id) ? '  (ausgenommen)' : '') + (bad.length ? '  ' + bad.join(',') : ''));
    }
    const L = res.filter(r => !exempt(r.id)).map(r => r.lufs);
    console.log((fail ? 'FAIL' : 'PASS') + ' MK8-04 — ' + fail + ' Ausreißer · LUFS ' + Math.min(...L).toFixed(1) + ' … ' + Math.max(...L).toFixed(1));
    fs.writeFileSync(DIR + '/v3-mk8-pegel.json', JSON.stringify(res));
    if (BANDS) {   // MK8-06: pairs inside each bank and the same place across banks differ by >= 3 dB in one relevant M-BAND
      const rel = B => { const mx = Math.max(...B.flat()); return B.map(w => w.map(x => x >= mx - 30)); };
      const differ = (x, y) => { const rx = rel(x.bands), ry = rel(y.bands); let best = 0;
        for (let w = 0; w < 2; w++) for (let k = 0; k < 7; k++) if (rx[w][k] || ry[w][k]) best = Math.max(best, Math.abs(x.bands[w][k] - y.bands[w][k])); return best; };
      const P = res.filter(r => r.id !== 'f-mk-h15'), bad = []; let n = 0, mn = 99;
      for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) { const a = P[i], b = P[j]; if (a.b !== b.b && a.s !== b.s) continue; n++; const d = differ(a, b); mn = Math.min(mn, d); if (d < 3) bad.push(a.id.slice(5) + '/' + b.id.slice(5) + ' ' + d.toFixed(1)); }
      console.log((bad.length ? 'FAIL' : 'PASS') + ' MK8-06 — ' + n + ' Paare, kleinster Unterschied ' + mn.toFixed(1) + ' dB' + (bad.length ? ' · ' + bad.join(', ') : ''));
    }
    break;
  }
  // calibration: level in device units, gain = K (v / 127)^2 -> v' = v * 10^(dB / 40)
  const cal = fs.existsSync(CAL_FILE) ? JSON.parse(fs.readFileSync(CAL_FILE, 'utf8')) : {}, progs = programs(FILE, cal);
  let worst = 0;
  for (const r of res) {
    if (exempt(r.id)) continue;
    const P = progs.find(p => p.id === r.id), d = -18 - r.lufs; worst = Math.max(worst, Math.abs(d));
    const c = cal[r.id] = cal[r.id] || {};
    if (c.g == null) c.g = 40 * Math.log10((P.pm.mode === 3 ? P.pm.voc.lvl : Math.max(P.pm.t[0].a.lvl, P.pm.t[1].a.lvl)) / 127);
    c.g = Math.min(12, Math.round((Math.min(12, c.g) + d) * 100) / 100);   // make-up at most +12 dB (EQ range)
    if (P.hold) c.hold = cal._hold[P.hold];
  }
  fs.writeFileSync(CAL_FILE, JSON.stringify(cal, null, 1));
  const enc = encode(FILE, programs(FILE, cal)); inject(FILE, blockText(enc));
  console.log('Runde', round + 1, 'größte Abweichung', worst.toFixed(1), 'dB');
}
await browser.close();
