// Regel 28 / BM5-11: against the base (vs-base-B, 4.23.0): every factory sound normalizes the same, the demo project saves the same,
// VA and MS-2000 offline renders are bit-identical; no network; a copy with another BM_NAME shows only that name.
import {launch, open, sleep, APP} from './lib.mjs';
import fs from 'fs';
const BASE = 'file://' + new URL('../../../werkzeug/vs-base-B.html', import.meta.url).pathname;
let fail = 0, n = 0; const ok = (c, m) => { n++; console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };
const br = await launch();
async function probe(url) {
  const p = await open(br, 390, 844, url);
  const r = await p.evaluate(async () => {
    const out = {};
    out.fac = JSON.stringify(FACTORY.map(f => { const s = SQStore.normalizeSound(f); delete s.ct; delete s.mt; return s; }));
    SYNQUENZER.newProject(); await sleep_(400);
    out.proj = JSON.stringify(SQStore.normalizeProject ? SQStore.normalizeProject(JSON.parse(JSON.stringify(projectData ? projectData() : S))) : S.tracks.map(t => t.sound));
    const h = a => { let x = 0; for (let k = 0; k < a.length; k += 7) x = (x * 31 + Math.round(a[k] * 1e7)) | 0; return x; };
    const va = await mkRender(FACTORY.find(f => f.engine === 'analog'), [[0, 'on', 60, .8], [.5, 'off', 60]], {sec: 1});
    const mk = await mkRender(FACTORY.find(f => f.engine === 'mk') || SQStore.normalizeSound({engine: 'mk', name: 'x', p: {}}), [[0, 'on', 57, .9], [.4, 'off', 57]], {sec: 1});
    out.va = h(va.l) + '/' + h(va.r); out.mk = h(mk.l) + '/' + h(mk.r);
    return out;
    function sleep_(ms) { return new Promise(r => setTimeout(r, ms)); }
  });
  r.net = p.net || 0; r.errs = p.errs; await p.context().close(); return r;
}
const a = await probe(BASE), b = await probe(APP);
{ const A = JSON.parse(a.fac), B = JSON.parse(b.fac), d = A.map((x, k) => JSON.stringify(x) === JSON.stringify(B[k]) ? null : k).filter(x => x != null);
  if (d.length) { const x = A[d[0]], y = B[d[0]]; console.log(x.id, Object.keys(y.p).filter(k => JSON.stringify(x.p[k]) !== JSON.stringify(y.p[k])), Object.keys(y).filter(k => JSON.stringify(x[k]) !== JSON.stringify(y[k]))); }
  ok(!d.length, 'alle Werksklänge normalisieren gleich (' + A.length + ', abweichend ' + d.length + ')'); }
ok(a.proj === b.proj, 'neues Projekt gleich');
ok(a.va === b.va, 'VA-Render bitgleich ' + a.va + ' = ' + b.va);
ok(a.mk === b.mk, 'MS-2000-Render bitgleich ' + a.mk + ' = ' + b.mk);
ok(!b.errs.length, 'keine Konsolenfehler ' + b.errs.slice(0, 2)); ok(b.net <= a.net, 'keine zusätzlichen Netz-Aufrufe (' + b.net + ' / Basis ' + a.net + ')');
// BM_NAME swap: a copy with another name; every display follows
const src = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8'), cp = new URL('./_name.html', import.meta.url).pathname;
fs.writeFileSync(cp, src.replace("const BM_NAME = 'Bit Mask';", "const BM_NAME = 'Probe Name';"));
{ const p = await open(br, 926, 428, 'file://' + cp);
  await p.evaluate(async () => { SYNQUENZER.newProject(); SYNQUENZER.setEngine(0, 'bm'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(900);
  const t = await p.evaluate(() => document.body.innerText + ' ' + [...document.querySelectorAll('[aria-label],[title]')].map(e => (e.getAttribute('aria-label') || '') + ' ' + (e.title || '')).join(' '));
  ok(/Probe\s+Name/.test(t) && !/Bit\s*Mask/i.test(t), 'BM_NAME-Austausch: Anzeige folgt, kein „Bit Mask“ mehr');
  await p.context().close(); }
fs.unlinkSync(cp);
console.log('regel: ' + (n - fail) + '/' + n + ' PASS'); await br.close(); process.exit(fail ? 1 : 0);
