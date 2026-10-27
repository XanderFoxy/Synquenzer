// MK8b-03 Pegel (as MK8-04) and MK8b-01 hörbar: every Kompakt program with its role's test phrase through the app worklet
// (mkRender, OfflineAudioContext, seed 1): -18 +- 3 LUFS, true peak <= -1 dBTP, basses M-HANDYrel at C2 >= -20 dB. Vocoder
// programs get a microphone dummy into E2 (own vowel source W-44, a e i o u, pre-emphasis x3, -20 dBFS RMS). Audible: C3 held
// 4 s, loudest 400-ms window RMS > -40 dBFS. --cal N: N rounds of calibration (a.lvl / voc.lvl / flat EQ lift; target -18 LUFS),
// rebuilding the data block in between (v3-mk8b-bau.mjs). Usage: node v3-mk8b-pegel.mjs <index.html> [--cal N]
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import {programs, encode, blockText, inject, CAL_FILE} from './v3-mk8b-bau.mjs';
const FILE = path.resolve(process.argv[2]), CAL = process.argv.includes('--cal') ? +process.argv[process.argv.indexOf('--cal') + 1] || 1 : 0;
const DIR = path.dirname(new URL(import.meta.url).pathname), MESS = fs.readFileSync(DIR + '/v3-mk8-mess.js', 'utf8');
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const KIND = {lead: 'lead', pad: 'pad', bass: 'bass', arp: 'chordheld', seq: 'chordheld', chord: 'stab', keys: 'stab', hit: 'stab', drum: 'bass', bell: 'bell', fx: 'fx', voc: 'voc'};
async function run() {
  const page = await browser.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  await page.evaluate(MESS); await page.evaluate(() => { mkLoad(); return MKK.decodeAll(); });
  const res = [];
  for (let g = 1; g <= 8; g++) res.push(...await page.evaluate(async ([g, KIND]) => {
    const mic = sec => { const sr = 48000, x0 = MKUI.mkVowel({f0: 110, v: ['a', 'e', 'i', 'o', 'u'], seg: .5, sec, sr, vib: 15}), x = new Float32Array(x0.length), z = [0, 0, 0]; let e = 0;
      for (let i = 0; i < x0.length; i++) { let y = x0[i]; for (let k = 0; k < 3; k++) { const t = y - .95 * z[k]; z[k] = y; y = t; } x[i] = y; e += y * y; }
      const gn = Math.pow(10, -20 / 20) / Math.sqrt(e / x.length || 1); for (let i = 0; i < x.length; i++) x[i] *= gn; return x; };
    const render = (snd, ev, sec) => SYNQUENZER.mkRender(snd, MK8M.arpEv(snd.p.mk, ev), {sec, seed: 1, inputs: snd.p.mk.mode === 3 ? {e2: mic(sec)} : null});
    const o = [];
    for (let s = 1; s <= 16; s++) {
      const rec = MKK.rec(g, s), snd = factorySound(rec.id), role = MKK.roleOf(g, s), kind = KIND[role] || 'stab', ph = MK8M.phrase(kind), out = {id: rec.id, name: rec.name, g, s, role, kind};
      let r = await render(snd, ph.ev, ph.sec);
      if (MK8M.lufs(r.l, r.r) < -60) r = await render(snd, ph.ev, ph.sec);
      out.lufs = MK8M.lufs(r.l, r.r); out.tp = Math.max(MK8M.tp(r.l), MK8M.tp(r.r));
      let nan = false; for (const x of [r.l, r.r]) for (let i = 0; i < x.length; i += 7) if (!isFinite(x[i])) { nan = true; break; } out.nan = nan;
      if (role === 'bass') { const q = await render(snd, [[0, 'on', 36, .8], [.6, 'off', 36]], .7); out.handy = MK8M.handyRel(q.l); }
      const h = await render(snd, [[0, 'on', 48, .8], [4, 'off', 48]], 4.2), W = 19200; let best = 0;
      for (let a = 0; a + W <= h.l.length; a += 4800) { let e = 0; for (let i = a; i < a + W; i++) e += .5 * (h.l[i] * h.l[i] + h.r[i] * h.r[i]); best = Math.max(best, e / W); }
      out.held = 10 * Math.log10(best + 1e-30);
      o.push(out);
    }
    return o;
  }, [g, KIND]));
  await page.close(); return {res, errs};
}
for (let round = 0; round <= CAL; round++) {
  const {res, errs} = await run();
  if (errs.length) console.log('Konsolenfehler', errs.slice(0, 5));
  if (round === CAL) {
    let fail = 0, deaf = 0;
    for (const r of res) {
      const bad = [];
      if (Math.abs(r.lufs + 18) > 3) bad.push('LUFS'); if (r.tp > -1) bad.push('TP'); if (r.handy != null && r.handy < -20) bad.push('HANDY'); if (r.nan) bad.push('NaN');
      if (!(r.held > -40)) { bad.push('STUMM'); deaf++; }
      if (bad.length) fail++;
      console.log((bad.length ? 'FAIL ' : 'ok   ') + r.id.slice(5).padEnd(5) + r.name.padEnd(13) + r.role.padEnd(6) + ' LUFS ' + r.lufs.toFixed(1).padStart(6) + '  TP ' + r.tp.toFixed(1).padStart(5) + '  C3 ' + r.held.toFixed(1).padStart(6) + (r.handy != null ? '  HANDYrel ' + r.handy.toFixed(1) : '') + (bad.length ? '  ' + bad.join(',') : ''));
    }
    const Lx = res.map(r => r.lufs), T = res.map(r => r.tp), H = res.map(r => r.held);
    console.log((deaf ? 'FAIL' : 'PASS') + ' MK8b-01 hörbar — ' + (128 - deaf) + '/128 über −40 dBFS (C3 gehalten, Vocoder mit Mikro-Attrappe), leisester ' + Math.min(...H).toFixed(1) + ' dBFS');
    console.log((fail - deaf > 0 ? 'FAIL' : 'PASS') + ' MK8b-03 Pegel — LUFS ' + Math.min(...Lx).toFixed(1) + ' … ' + Math.max(...Lx).toFixed(1) + ', True Peak ≤ ' + Math.max(...T).toFixed(1) + ' dBTP, ' + (fail - deaf) + ' Ausreißer');
    fs.writeFileSync(DIR + '/v3-mk8b-pegel.json', JSON.stringify(res));
    break;
  }
  const cal = fs.existsSync(CAL_FILE) ? JSON.parse(fs.readFileSync(CAL_FILE, 'utf8')) : {}, progs = programs(FILE, cal);
  let worst = 0;
  for (const r of res) {
    const P = progs.find(p => p.id === r.id), d = -18 - r.lufs; worst = Math.max(worst, Math.abs(d));
    const c = cal[r.id] = cal[r.id] || {};
    if (c.g == null) c.g = 40 * Math.log10((P.pm.mode === 3 ? P.pm.voc.lvl : Math.max(P.pm.t[0].a.lvl, P.pm.mode === 1 || P.pm.mode === 2 ? P.pm.t[1].a.lvl : 0)) / 127);
    c.g = Math.min(12, Math.round((Math.min(12, c.g) + d) * 100) / 100);
  }
  fs.writeFileSync(CAL_FILE, JSON.stringify(cal, null, 1));
  inject(FILE, blockText(encode(FILE, programs(FILE, cal))));
  console.log('Runde', round + 1, 'größte Abweichung', worst.toFixed(1), 'dB');
}
await browser.close();
