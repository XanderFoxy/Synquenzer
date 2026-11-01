import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const DIR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4410/m/';
const { buildSong } = await import('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n5-v-qm-lib.mjs');
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 926, height: 428}});
const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + String(e)));
await p.goto('file://' + (process.argv[2] || DIR + 'index.html')); await p.waitForTimeout(1500); await p.mouse.click(5, 300);
await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 15000}).catch(() => {});
await buildSong(p);
const one = () => p.evaluate(async () => {
  await SYNQUENZER.vvRender({range: {a: 4, b: 10}});
  const h = s => { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } return x.toString(16); };
  const o = {song: [], kino: [], probe: [], mtr: VV.last.mtr ? {cnt: VV.last.mtr.Q.cnt, seq: VV.last.mtr.Q.seq} : null, nt: (VV.last.nt || []).map(L => L ? L.length : 0)};
  for (const t of [2, 4.3, 6.1]) { o.song.push(h(SYNQUENZER.vvShot(t, 'song', '16:9'))); o.kino.push(h(SYNQUENZER.vvShot(t, 'kino', '16:9'))); if (SYNQUENZER.vk2At) o.probe.push(JSON.stringify(SYNQUENZER.vk2At(t, "16:9"), (k, v) => k === "ms" ? undefined : v)); }
  // the meter values at a few times
  const q = new Float32Array(4), M = VV.last.mtr; o.m = []; for (const t of [2, 4.3]) { mtrAt(M.Q, M.off + t, 8, q, 0, 1 / 30); o.m.push(Array.from(q).map(x => +x.toFixed(6))); }
  return o;
});
const A = await one(), B = await one();
console.log('song', JSON.stringify(A.song) === JSON.stringify(B.song), 'kino', JSON.stringify(A.kino) === JSON.stringify(B.kino), 'mtr', JSON.stringify(A.mtr), JSON.stringify(B.mtr), 'nt', JSON.stringify(A.nt), JSON.stringify(B.nt));
console.log('m', JSON.stringify(A.m), JSON.stringify(B.m));
for (let k = 0; k < 3; k++) if (A.probe[k] !== B.probe[k]) { const a = JSON.parse(A.probe[k]), c = JSON.parse(B.probe[k]); const d = []; const walk = (x, y, pth) => { if (typeof x !== 'object' || x === null) { if (x !== y) d.push(pth + ': ' + x + ' / ' + y); return; } for (const kk in x) walk(x[kk], y ? y[kk] : undefined, pth + '.' + kk); }; walk(a, c, 't' + k); console.log(d.slice(0, 12).join('\n')); }
console.log('errs', errs);
await b.close();
