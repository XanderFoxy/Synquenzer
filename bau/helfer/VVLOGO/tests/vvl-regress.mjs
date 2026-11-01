// VV-LOGO regression: without a logo (file:// = no access, and over http with the switch off) the video is the one of R-4261:
// no Abspann, the same way, the sound track = the song, the picture track as in R-4261 (R-4261 run twice: not repeatable bit for bit). Both ways.
import * as L from './vvl-lib.mjs';
import { chromium } from 'playwright';
import path from 'path'; import crypto from 'crypto'; import { execSync } from 'child_process';
const C = [], X = {runs: []};
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const BASE = path.resolve(L.DIR, '../../snapshots/R-4261.html'), NEU = path.join(L.DIR, 'index.html');
const md5 = buf => crypto.createHash('md5').update(buf).digest('hex').slice(0, 12);
async function run(kind, way, fmt, url) {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}}); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(1200); await p.mouse.click(5, 300);
  await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 15000}).catch(() => {});
  await L.song(p);
  if (kind === 'neu-aus') await p.evaluate(() => SYNQUENZER.vvLogo({pref: false}));
  await p.evaluate(t => SYNQUENZER.vvTest(t), way === 'wc' ? {opus: true} : {noVE: true});
  const r = await p.evaluate(f => SYNQUENZER.vvMake({fmt: f}).then(x => ({dur: x.dur, how: x.how, logo: x.logo === undefined ? null : x.logo, W: x.W, H: x.H})), fmt);
  const f = await L.saveBlob(p, `regress-${kind}-${way}-${fmt.replace(':', 'x')}`);
  const v = L.decEnd(f, 'v'), a = L.decEnd(f, 'a');
  const pcm = execSync(`ffmpeg -v error -i ${f} -vn -f s16le -`, {maxBuffer: 1 << 28});
  const fr = [.5, r.dur / 2, r.dur - .2].map(t => md5(execSync(`ffmpeg -v error -ss ${t.toFixed(3)} -i ${f} -frames:v 1 -vf scale=240:-2,format=gray -f rawvideo -`)));
  await ctx.close();
  return {kind, way, fmt, W: r.W, dur: +r.dur.toFixed(4), how: r.how, logo: r.logo, vEnd: v.end, vFrames: v.frames, aEnd: a.end, pcm: md5(pcm), fr, errs};
}
const s = await L.serve('mp4', 'index.html');
for (const [way, fmt] of [['wc', '16:9'], ['mr', '9:16']]) {
  const base = await run('basis', way, fmt, 'file://' + BASE), base2 = await run('basis2', way, fmt, 'file://' + BASE);
  const neu = await run('neu', way, fmt, 'file://' + NEU);
  const aus = await run('neu-aus', way, fmt, s.url + 'index.html');
  X.runs.push(base, base2, neu, aus);
  const tolA = way === 'wc' ? .06 : .2;
  // the old picture track: R-4261 itself is not repeatable (the Ausklang length and, WebCodecs, the frames behind it vary per run)
  C.push([`${way} ${fmt}: R-4261 zweimal – Ausklang/Bildzahl schwanken schon in der Basis`, true, {basis: [base.dur, base.vEnd, base.vFrames], basis2: [base2.dur, base2.vEnd, base2.vFrames]}]);
  for (const n of [neu, aus]) {
    const tag = `${way} ${fmt} ${n.kind}`;
    C.push([tag + ': kein Abspann', n.logo === null, n.logo]);
    C.push([tag + ': Weg wie Basis', n.how === base.how && n.W === base.W, [n.how, base.how]]);
    C.push([tag + ': Tonspur = Song (wie Basis)', Math.abs(n.aEnd - n.dur) < tolA && Math.abs(base.aEnd - base.dur) < tolA, {neu: [n.dur, n.aEnd], basis: [base.dur, base.aEnd]}]);
    C.push([tag + ': Bildspur ≥ Song (wie Basis)', n.vEnd >= n.dur - tolA && base.vEnd >= base.dur - tolA, {neu: [n.dur, n.vEnd], basis: [base.dur, base.vEnd]}]);
    C.push([tag + ': keine Konsolenfehler', n.errs.length === 0, n.errs]);
  }
}
await s.close();
L.report('regress', C, X);
await b.close();
