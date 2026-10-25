// MK1 variant of v3-mk0-gleich.mjs (render comparison by sound id). MK0-03: projects and libraries without an unknown engine behave deep-equal to the predecessor; all sounds bit-identical.
// Usage: node v3-mk0-gleich.mjs <predecessor.html> <new.html>
import { chromium } from 'playwright';
import fs from 'fs';
const [OLD, NEW] = process.argv.slice(2);
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };

// odd inputs for normalizeSound / the library / project files (every known engine, unknown keys, legacy fm2, a VA sound with
// an engine block this version does not know, NaN, strings)
const ODD = [
  {engine: 'analog', name: '  Komisch\tName  ', cat: 'xyz', p: {cutoff: 'NaN', o1w: 9, unknown: 1, mk: {v: 1}}, mods: [{src: 'lfo1', dst: 'cutoff', amt: 2}, {src: 'bad', dst: 'x', amt: 1}], fx: {vol: 3, chorus: {mode: 'zz'}}},
  {engine: 'fm6', name: 'FM roh', p: {alg: 40, fb: 9, ops: [{coarse: 3, r: [1, 2, 3, 4]}]}},
  {engine: 'fm2', name: 'Alt FM', p: {fm2: {ratio: 3.4, index: 12}}},
  {engine: 'wt', name: 'WT', p: {wt: {table: 'vocal', pos: 2}}},
  {engine: 'drum', name: 'Kit', p: {base: 'Rom Pop', slots: {kick: {lvl: .5, bad: {}}}}},
  {engine: 'xyz-unbekannt-mit-langem-namen-ueber-24', name: 'kein gültiger Name der Engine', p: {}},
  {engine: 5, name: 'Zahl', p: {}}, null, 'text',
];
async function collect(file) {
  const page = await browser.newPage({viewport: {width: 390, height: 844}});
  const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + file); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000}); await page.waitForTimeout(400);
  const out = await page.evaluate(async ODD => {
    // ids and uids are random per load (newProjectId), the demo name carries the time: left out of the comparison
    const unid = o => JSON.parse(JSON.stringify(o, (k, v) => (k === 'uid' || k === 'ct' || k === 'mt' ? undefined : v)), (k, v) => v);
    const pj = o => { o = unid(o); delete o.id; delete o.name; return o; };
    const strip = t => { const o = JSON.parse(t); delete o.appVersion; delete o.saved; delete o.sum; o.project = pj(o.project); return o; };
    const r = {};
    r.demo = strip(SYNQUENZER.serialize());
    r.norm = ODD.map(x => SQStore.normalizeSound(x)).map(s => s && Object.assign({}, s, {ct: 0, mt: 0}));
    const ids = SYNQUENZER.factory().map(f => f.id).concat(Object.values(INIT_IDS), ['f-melodie-lead']);
    r.fac = ids.map(id => { const s = factorySound(id); return s && JSON.stringify(s); });
    // a project with odd sounds on every track through the file path and normalizeProject
    const fo = JSON.parse(SYNQUENZER.serialize()); fo.project.tracks.forEach((t, i) => { if (ODD[i] && t.kind !== 'drum') t.sound = ODD[i]; });
    const pr = SQStore.parseFile(JSON.stringify(fo), LEGACY_HOOKS);
    r.file = pj(pr.project); r.fileWarn = pr.warnings; r.fileSounds = pr.sounds;
    r.np = pj(normalizeProject(fo.project));
    // library: import, reload-equivalent (normalize again), export
    await SYNQUENZER.importSounds({app: 'SYNQUENZER', kind: 'sounds', format: 1, sounds: ODD.filter(Boolean)});
    r.lib = SYNQUENZER.library().map(s => Object.assign({}, s, {id: s.id ? s.id.slice(0, 2) : s.id, ct: 0, mt: 0}));
    r.libHash = SYNQUENZER.library().map(s => SQStore.soundHash(s));
    // KV snapshot after an explicit save
    await SYNQUENZER.save();
    const kvp = await new Promise(res => { const rq = indexedDB.open('synquenzer', 1); rq.onsuccess = () => { const t = rq.result.transaction('kv').objectStore('kv').get('project'); t.onsuccess = () => res(t.result); }; });
    r.kv = kvp ? {mt: typeof kvp.mt, project: pj(kvp.project)} : null; r.kvKeys = kvp ? Object.keys(kvp).filter(k => k !== 'app').sort() : null;
    // offline render of every synth factory sound through the worklet (C4, 0.6 s held, 1.0 s)
    // a fixed noise seed for the worklet's own Math.random (same prefix for both builds; each OfflineAudioContext has its own scope)
    const SEED = 'Math.random=(function(){var s=12345;return function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};})();\n';
    const src = SEED + document.getElementById('sq-worklet-src').textContent, sr = 48000, H = [];
    const one = async snd => {
      const oc = new OfflineAudioContext(2, sr, sr);
      await oc.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src));
      const E = SynthHost.track(oc, oc.destination, wkFlat(snd), wkMods(snd), snd.engine === 'fm6' && snd.p.fm6 ? wkFmOf(snd.p) : null);
      E.tempo(120, 0); E.on(1, 60, .8, .02); E.off(1, .62); E.flush();
      await new Promise(r2 => setTimeout(r2, 20));
      const b = await oc.startRendering(); let h = 0x811c9dc5, pk = 0, e = 0;
      for (let c = 0; c < 2; c++) { const d = new Uint32Array(b.getChannelData(c).buffer); for (let i = 0; i < d.length; i++) { h ^= d[i]; h = Math.imul(h, 16777619) >>> 0; } for (const x of b.getChannelData(c)) { pk = Math.max(pk, Math.abs(x)); e += x * x; } }
      return [h, +pk.toFixed(4), 10 * Math.log10(e / (2 * sr) + 1e-20)];
    };
    for (const id of ids) {
      const snd = factorySound(id); if (!snd || snd.engine === 'drum') continue;
      const x1 = await one(snd), x2 = await one(snd);
      let lv = x1[2];
      if (x1[0] !== x2[0]) { let e = 0; for (let k = 0; k < 4; k++) e += Math.pow(10, (await one(snd))[2] / 10); lv = 10 * Math.log10(e / 4); }   // §0.3: mean over 4 seeds
      H.push([id, x1[0], x1[1], x1[0] === x2[0], lv]);
    }
    r.render = H;
    return r;
  }, ODD);
  out.errs = errs; await page.close(); return out;
}
const a = await collect(OLD), b = await collect(NEW);
const J = JSON.stringify;
if (process.env.DBG) { const d = (x, y, path) => { if (J(x) === J(y)) return; if (x && y && typeof x === 'object' && typeof y === 'object') { for (const k of new Set(Object.keys(x).concat(Object.keys(y)))) d(x[k], y[k], path + '.' + k); } else console.log('DIFF', path, J(x).slice(0, 150), '|', J(y).slice(0, 150)); };
  d(a.file, b.file, 'file'); console.log(J(a.render.filter(x => !x[3])), J(b.render.filter(x => !x[3]))); }
{ const paths = (x, y, path, out) => { if (out.length > 6 || J(x) === J(y)) return out; if (x && y && typeof x === 'object' && typeof y === 'object') { for (const k of new Set(Object.keys(x).concat(Object.keys(y)))) paths(x[k], y[k], path + '.' + k, out); } else out.push(path + ': ' + J(x) + ' → ' + J(y)); return out; };
  for (const k of ['demo', 'norm', 'fac', 'file', 'np', 'lib', 'libHash', 'fileWarn', 'fileSounds']) console.log('DIFF ' + k + ' ' + paths(a[k], b[k], '', []).join(' | ').slice(0, 600)); }
ok('MK0-03 demo project file deep-equal', J(a.demo) === J(b.demo));
ok('MK0-03 normalizeSound (odd inputs) deep-equal', J(a.norm) === J(b.norm), J(a.norm.map(x => x && x.engine)) + ' / ' + J(b.norm.map(x => x && x.engine)));
ok('MK0-03 factory sounds deep-equal (' + a.fac.length + ')', J(a.fac) === J(b.fac));
ok('MK0-03 project file with odd sounds deep-equal', J(a.file) === J(b.file) && J(a.fileWarn) === J(b.fileWarn) && J(a.fileSounds) === J(b.fileSounds));
ok('MK0-03 normalizeProject deep-equal', J(a.np) === J(b.np));
ok('MK0-03 library deep-equal (' + a.lib.length + ' sounds)', J(a.lib) === J(b.lib) && J(a.libHash) === J(b.libHash));
ok('MK0-03 KV snapshot deep-equal (only the new writer field app)', J(a.kv) === J(b.kv) && J(a.kvKeys) === J(b.kvKeys));
// deterministic sounds: the same samples (FNV over the float bits); sounds with free-running randomness (the worklet's own
// Math.random: S&H, noise seeds) differ from render to render even in one build: their level must match within 0.5 dB
const det = a.render.filter(x => x[3]), rnd = a.render.filter(x => !x[3]);
const bId = new Map(b.render.map(x => [x[0], x])); const diff = a.render.filter(x => { const y = bId.get(x[0]); return !y || (x[3] && y[3] ? x[1] !== y[1] : Math.abs(x[4] - y[4]) > .5); });   // MK1: matched by id (the new INIT AM sits in the list)
console.log('ids only in new: ' + b.render.filter(x => !a.render.some(y => y[0] === x[0])).map(x => x[0]).join());
ok('MK0-03 all synth sounds render bit-identical (' + det.length + ' deterministic; ' + rnd.length + ' random within 0.5 dB: ' + rnd.map(x => x[0]).join(',') + ')',
  a.render.length > 30 && diff.length === 0 && a.render.every(x => x[2] > 0), diff.slice(0, 3).map(x => x[0]).join(','));
const wl = f => { const s = fs.readFileSync(f, 'utf8'); const i = s.indexOf('id="sq-worklet-src"'); return s.slice(i, s.indexOf('</script>', i)); };
ok('MK0-03 worklet source unchanged', wl(OLD) === wl(NEW));
const size = fs.statSync(NEW).size - fs.statSync(OLD).size;
ok('MK0-03 budget <= +4 KB', size <= 4096, '+' + size + ' B');
ok('MK0-03 no console errors', a.errs.length === 0 && b.errs.length === 0, J(b.errs));
await browser.close();
process.exit(fails ? 1 : 0);
