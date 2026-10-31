import { chromium } from 'playwright';
const SONG = {bars: 12, lanes: [[{bar: 0, slot: 0}, {bar: 6, slot: 1}], [{bar: 2, slot: 0}], [{bar: 4, slot: 0}], [], [{bar: 0, slot: 0}, {bar: 6, slot: 1}], []], carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 6, name: 'Strophe'}, {id: 'm2', a: 6, len: 6, name: 'Refrain'}]};
const apps = {vv1: '/home/user/Synquenzer/bau/snapshots/VV1.html', vv2: '/home/user/Synquenzer/bau/helfer/VIDSTAGE/index.html'};
const cases = (process.argv[2] || 'vv1:16:9:song,vv2:16:9:song,vv1:9:16:song,vv2:9:16:song,vv2:9:16:auto,vv2:16:9:auto').split(',');
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
for (const c of cases) {
  const [app, f1, f2, view] = c.split(':'), fmt = f1 + ':' + f2;
  const p = await b.newPage({viewport: {width: 390, height: 844}});
  await p.goto('file://' + apps[app]); await p.waitForTimeout(1500); await p.mouse.click(5, 300);
  await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 10000}).catch(() => {});
  const r = await p.evaluate(async ([s, fmt, view]) => { SYNQUENZER.setSong(s); SYNQUENZER.vvTest({opus: true}); const m = await SYNQUENZER.vvMake({fmt, view}); const P = SYNQUENZER.vvInfo().prof; const fr = P.frame; const big = (P.big || []).filter(x => x[0] === 'frame').map(x => x[2]).sort((a, b) => b - a); return {ms: m.ms, dur: +m.dur.toFixed(1), n: fr.n, mittel: +(fr.sum / fr.n).toFixed(1), max: Math.round(fr.max), ueber50: big.filter(x => x > 50).length, top: big.slice(0, 5)}; }, [SONG, fmt, view]);
  console.log(c, JSON.stringify(r), require_load());
  await p.close();
}
function require_load() { return ''; }
await b.close();
