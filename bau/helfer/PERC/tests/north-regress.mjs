// PERC: North-Regression – die Drum-Spur mit North-Pads klingt wie in R-4300 (Offline-Render bitgleich, Schlag-Log gleich),
// und das Modul synq-md lädt erst, wenn ein Pad oder eine Spur North spielt.
import { chromium } from 'playwright';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = process.argv[2] || path.resolve(HERE, '../index.html');
const BASE = process.argv[3] || path.resolve(HERE, '../../../snapshots/R-4300.html');
const res = []; const out = (name, ok, info) => { res.push({name, ok: !!ok}); console.log(JSON.stringify({test: name, ok: !!ok, info})); };
async function open(file) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const p = await b.newPage({viewport: {width: 428, height: 926}});
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + file); await p.waitForTimeout(1500); await p.mouse.click(5, 300);
  await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 10000}).catch(() => {});
  await p.waitForTimeout(300); return {b, p, errs};
}
const run = async file => {
  const {b, p, errs} = await open(file);
  const r = await p.evaluate(async () => {
    const A = SYNQUENZER, o = {};
    A.play(); await new Promise(r => setTimeout(r, 1500)); A.stop(); await new Promise(r => setTimeout(r, 200));
    o.idle = {state: MDX.info().state, adds: MDX.info().adds, nodes: MDX.info().nodes};
    const K = MDX.kits.find(k => k.name === 'Schräg') || MDX.kits[0];
    for (const id of MDX.ORDER) { A.setPadSource(id, 'md'); }
    await new Promise(r => setTimeout(r, 600));
    const hits = []; for (let k = 0; k < 32; k++) hits.push([k * .0625, MDX.ORDER[k % 12], .5 + (k % 5) / 10, k % 4 === 0 ? .5 : 0]);
    const x = await A.mdRender(hits, {sec: 2.5}); let h = 2166136261, ss = 0;
    for (const ch of [x.l, x.r]) for (let k = 0; k < ch.length; k++) { const v = Math.round(ch[k] * 32767); h ^= v & 0xffff; h = Math.imul(h, 16777619) >>> 0; ss += ch[k] * ch[k]; }
    o.render = {hash: h, rms: Math.sqrt(ss / (2 * x.l.length))};
    A.clearLog(); A.setClip(4, 0, {len: 1, notes: [0, .5, 1, 1.5, 2, 2.5, 3, 3.5].map((t, k) => ({t, d: .25, n: [36, 42, 38, 42][k % 4], v: .9}))});
    A.launchClip(4, 0); A.play(); await new Promise(r => setTimeout(r, 2300)); A.stop();
    o.log = A.noteLog(64).filter(e => e.track === 4 && e.src === 'clip').map(e => [e.clipNote, e.out, +(e.beat || 0).toFixed(3), e.vel]).slice(0, 12);
    o.drum = JSON.stringify(S.tracks[4].sound);
    o.md = {nodes: MDX.info().nodes, state: MDX.info().state};
    return o;
  });
  await b.close(); return {r, errs};
};
const a = await run(BASE), c = await run(APP);
out('modul-erst-bei-bedarf', c.r.idle.state === 'idle' && c.r.idle.adds === 0 && c.r.idle.nodes === 0, c.r.idle);
out('drum-north-render-bitgleich', a.r.render.hash === c.r.render.hash && c.r.render.rms > 1e-3, {base: a.r.render, perc: c.r.render});
out('drum-schlaglog-gleich', JSON.stringify(a.r.log) === JSON.stringify(c.r.log) && c.r.log.length >= 8, {n: c.r.log.length});
out('drum-klang-gleich', a.r.drum === c.r.drum, {len: c.r.drum.length});
out('ein-knoten-ohne-perc', c.r.md.nodes === 1, c.r.md);
out('keine-js-fehler', !a.errs.length && !c.errs.length, {base: a.errs.slice(0, 3), perc: c.errs.slice(0, 3)});
const fail = res.filter(x => !x.ok).map(x => x.name);
console.log(JSON.stringify({ok: res.length - fail.length, fail}));
process.exit(fail.length ? 1 : 0);
