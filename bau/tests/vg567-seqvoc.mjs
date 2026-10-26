// vgmk567: does a stored SEQ (on) still act in vocoder mode (mode 3)? mkRender with a noise modulator on E2, seq on vs off.
import { chromium } from 'playwright';
const FILE = process.argv[2];
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const page = await (await browser.newContext({viewport: {width: 390, height: 844}})).newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const r = await page.evaluate(async () => {
  const Q = SYNQUENZER; Q.setEngine(0, 'mk'); await new Promise(r => setTimeout(r, 300));
  const base = JSON.parse(JSON.stringify(Q.getSound(0)));
  const n = 48000 * 2, e2 = new Float32Array(n); let s = 1; for (let i = 0; i < n; i++) { s = (s * 16807) % 2147483647; e2[i] = (s / 2147483647 - .5) * .5; }
  const mk = (mode, seqOn, tg, vals) => { const x = JSON.parse(JSON.stringify(base)); x.p.mk.mode = mode; const sq = x.p.mk.t[0].seq; sq.on = seqOn; sq.q[0].k = tg; sq.q[0].m = 1; sq.q[0].v = vals; sq.ks = 0; sq.res = 3; return x; };
  const rend = async snd => { const o = await Q.mkRender(snd, [[0, 'on', 48, .8], [1.8, 'off', 48]], {sec: 2, inputs: {e2: Array.from(e2)}}); let d = 0; for (let i = 0; i < o.l.length; i++) d += o.l[i] * o.l[i]; return {l: o.l, rms: 10 * Math.log10(d / o.l.length + 1e-20)}; };
  const out = {};
  const amp = Array.from({length: 16}, (_, k) => (k % 2 ? -63 : 0)), pitch = Array.from({length: 16}, (_, k) => (k % 2 ? 12 : 0));
  for (const [nm, tg, v] of [['AMP PEGEL', 15, amp], ['TONHÖHE', 1, pitch], ['MIXER OSZ 1', 8, Array.from({length: 16}, (_, k) => (k % 2 ? -63 : 0))]]) {
    for (const mode of [0, 3]) {
      const a = await rend(mk(mode, 0, tg, v)), b = await rend(mk(mode, 1, tg, v));
      let md = 0; for (let i = 0; i < a.l.length; i++) md = Math.max(md, Math.abs(a.l[i] - b.l[i]));
      out[nm + ' mode ' + mode] = {rmsOff: +a.rms.toFixed(1), rmsOn: +b.rms.toFixed(1), maxDiff: +md.toFixed(4)};
    }
  }
  return out;
});
console.log(FILE.split('/').slice(-2).join('/'), JSON.stringify(r, null, 1), 'errs', errs.length);
await browser.close();
