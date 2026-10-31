// K1-05 (alte Projekte): the demo project and a „Leer (Init)“ project made in an older build (its own page, its own render),
// opened in this build: every synth track renders as in its version (<= -90 dB)
import {chromium} from 'playwright';
import {APP, dbDiff} from './n5-k-blib.mjs';
const OLDS = process.argv.slice(2);
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const seed = p => p.evaluate(() => { const el = document.getElementById('sq-worklet-src'); if (!el.dataset.k1) { el.dataset.k1 = 1; el.textContent = 'Math.random = (() => { let s = 12345; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; })();\n' + el.textContent; } });
async function open(file) { const p = await b.newPage(); await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version); await p.waitForTimeout(600); await seed(p); return p; }
const ev = [[0, 'on', 48, .9], [0, 'on', 55, .8], [0, 'on', 64, .7], [1.0, 'off', 48], [1.0, 'off', 55], [1.0, 'off', 64], [1.1, 'on', 67, .8], [1.6, 'off', 67]];
const rend = (p, s) => p.evaluate(async ([s, ev]) => { const r = await SYNQUENZER.mkRender(s, ev, {sec: 2, seed: 1}); return Array.from(r.l); }, [s, ev]);
const NEW = await open(APP);
for (const OLD of OLDS) {
  const O = await open(OLD), out = {file: OLD.split('/').pop(), tracks: []};
  for (const kind of ['demo', 'init']) {
    const proj = await O.evaluate(k => { if (k === 'demo') SYNQUENZER.loadDemo(); else SYNQUENZER.newProject({init: true}); return serializeProject(); }, kind);
    const n = JSON.parse(proj).tracks.length;
    await NEW.evaluate(j => switchProject(normalizeProject(JSON.parse(j)), {}), proj);
    for (let t = 0; t < n; t++) {
      const so = await O.evaluate(t => { const tr = S.tracks[t]; return tr && tr.kind === 'synth' ? SYNQUENZER.getSound(t) : null; }, t); if (!so) continue;
      const sn = await NEW.evaluate(t => SYNQUENZER.getSound(t), t);
      let best = 1e9; for (let k = 0; k < 3 && best > -90; k++) best = Math.min(best, dbDiff(Float32Array.from(await rend(NEW, sn)), Float32Array.from(await rend(O, so))));
      out.tracks.push([kind, t, so.name, +best.toFixed(1), (await NEW.evaluate(t => SYNQUENZER.soundEdited(t), t)) ? 'geändert!' : 'ok']);
    }
  }
  out.pass = out.tracks.every(x => x[3] <= -90 && x[4] === 'ok');
  console.log(JSON.stringify(out));
  await O.close();
}
await b.close();
