// keine sichtbare Änderung: Bildschirm (Demo + STIMME-Take, Matrix) in 6 Formaten gegen 4.23.0, Pixelvergleich; Seitenhöhe = Fensterhöhe
import {chromium} from 'playwright';
import {INIT} from './v3-vs2-h.mjs';
import fs from 'fs';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad', OUT = S + '/dirigent-test/n4vsp';
const V = [['P1', 390, 844], ['P2', 375, 667], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375], ['XL', 926, 428]];
const br = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']}); let fail = 0;
for (const [n, w, h] of V) {
  const shots = [];
  for (const f of [S + '/vs-base-B.html', S + '/vs-br-VSP/index.html']) {
    const ctx = await br.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true}), p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e))); await p.addInitScript(INIT);
    await p.goto('file://' + f); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version); await p.waitForTimeout(500);
    await p.evaluate(() => { SYNQUENZER.loadDemo(); SYNQUENZER.play(); SYNQUENZER.stop(); const x = []; for (let i = 0; i < 48000 * 4; i++) x.push(Math.round(6000 * Math.sin(i / 9) * Math.sin(i / 20000))); return SYNQUENZER.tkInject({pcm: x, sr: 48000, scene: 0, len: 2}); });
    await p.waitForTimeout(1200);
    const m = await p.evaluate(() => ({sh: document.documentElement.scrollHeight, ih: innerHeight, sw: document.documentElement.scrollWidth, iw: innerWidth}));
    const tag = f.includes('VSP') ? 'vsp' : 'base', file = `${OUT}/lay-${n}-${tag}.png`;
    await p.screenshot({path: file}); shots.push({file, m, errs}); await ctx.close();
  }
  const a = fs.readFileSync(shots[0].file), b = fs.readFileSync(shots[1].file);
  const same = a.equals(b), m = shots[1].m, okH = m.sh <= m.ih && m.sw <= m.iw;
  console.log(`${okH && !shots[1].errs.length ? '✓' : '✗'} ${n} ${w}×${h}: Seite ${m.sw}×${m.sh} im Fenster, Bild ${same ? 'pixelgleich zu 4.23.0' : 'verschieden (' + a.length + '/' + b.length + ' Bytes)'}${shots[1].errs.length ? ' Fehler ' + shots[1].errs[0] : ''}`);
  if (!okH || shots[1].errs.length) fail++;
}
await br.close(); console.log(fail ? fail + ' FEHLER' : 'ALLE OK');
