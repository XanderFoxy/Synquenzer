// NORTH (Regel 28, ND4-06): alte Songs laden unverändert. In der alten Version (R-4270, 4.27.0) entstehen Projekte – Demo,
// jedes Werks-Kit, ein Song mit Teilen, Akkorden, Melodie, MS-2000-Arp, STIMME-Take und Video-Regie – und werden gespeichert.
// Die neue Version lädt jede Datei, speichert sie wieder: der Inhalt muss gleich bleiben (deep-equal, ohne Zeitstempel).
// Dazu der Song einmal als Video-Ton (vvRender) in beiden Versionen: dieselben Noten, Pegel gleich (±0,5 dB).
// Aufruf: NODE_PATH=/opt/node-tools/node_modules node north-songs.mjs [neu.html] [alt.html]
import {createRequire} from 'module'; const {chromium} = createRequire(import.meta.url)('playwright');
const NEW = process.argv[2] || new URL('../index.html', import.meta.url).pathname;
const OLD = process.argv[3] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/R-4280.html';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
async function open(file) {
  const p = await b.newPage({viewport: {width: 390, height: 844}}), errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 30000}); await p.waitForTimeout(800);
  return {p, errs};
}
const checks = {}; const ok = (k, v, info) => { checks[k] = info ? Object.assign({ok: !!v}, info) : !!v; };
const A = await open(OLD);
const made = await A.p.evaluate(async () => {
  const Q = SYNQUENZER, files = {}; ensureAudio(); Q.setMetronome && Q.setMetronome(false);
  for (let k = 0; k < 50 && !(AU.ctx && AU.ctx.state === 'running'); k++) await new Promise(r => setTimeout(r, 100));
  files.demo = serializeProject();
  const kits = Q.kits().map(k => k.name);
  for (const k of kits) { try { Q.loadKit(k); files['kit ' + k] = serializeProject(); } catch (e) { files['kit ' + k] = 'ERR ' + e; } }
  // ein Song wie in den VV-Tests: MS-2000-Arp auf Synth 4, ein STIMME-Take, Teile, Akkorde, Melodie, Regie
  const out = {};
  try { Q.setEngine(3, 'mk'); mkLoad(); if (window.MKK && MKK.decodeAll) await MKK.decodeAll(); Q.selectTrack(3); Q.browserTap('f-mk-k115'); try { closeBrowser(false); } catch (e) {}
    Q.setClip(3, 0, Q.getClip(0, 0)); out.mk = S.tracks[3].sound.engine; } catch (e) { out.mkErr = String(e); }
  try { const sr = 48000, n = sr * 2, pcm = new Array(n); for (let k = 0; k < n; k++) { const t = k / sr; pcm[k] = Math.round(9000 * Math.sin(2 * Math.PI * 220 * t + 2 * Math.sin(2 * Math.PI * 5 * t)) * Math.min(1, t * 20, (2 - t) * 20)); }
    out.take = !!(await Q.tkInject({pcm, sr, scene: 0, len: 1})); } catch (e) { out.takeErr = String(e); }
  const nt = NT(), st = typeof stimmeT === 'function' ? stimmeT() : -1, lanes = Array.from({length: nt}, () => []);
  lanes[0] = [{bar: 0, slot: 0}]; lanes[1] = [{bar: 2, slot: 0}]; lanes[3] = [{bar: 2, slot: 0}, {bar: 6, slot: -1}]; lanes[4] = [{bar: 0, slot: 0}];
  if (st >= 0) lanes[st] = [{bar: 4, slot: 0}, {bar: 5, slot: -1}];
  const mel = {5: {notes: [[8, 72], [10, 74], [12, 76], [16, 72]].map(([t, n]) => ({t, d: 1.5, n, v: .8}))}};
  Q.setSong({bars: 8, lanes, carrier: [], mel, melodyTrack: 5, marks: [{id: 'm1', a: 0, len: 4, name: 'Strophe'}, {id: 'm2', a: 4, len: 4, name: 'Refrain'}]});
  Q.songSetChord(4, 'Am');
  try { Q.vvDirSet(4, 8, 'matrix'); out.dir = true; } catch (e) { out.dirErr = String(e); }
  await new Promise(r => setTimeout(r, 600));
  files.song = serializeProject();
  let vv = null; try { const r = await Q.vvRender({}); vv = {peak: r.peak, rms: r.rms, dur: r.dur, notes: (r.log || []).map(e => [e.track, e.out, +(+e.beat).toFixed(3), +(+e.vel).toFixed(3)]).sort((a, b) => a[2] - b[2] || a[0] - b[0] || a[1] - b[1])}; } catch (e) { vv = {err: String(e)}; }
  return {files, out, vv, ver: Q.version};
});
ok('old_made', made.out && made.out.take && made.out.mk === 'mk' && made.vv && !made.vv.err, {out: made.out, nFiles: Object.keys(made.files).length, ver: made.ver});
await A.p.close();
const B = await open(NEW);
const strip = o => { if (Array.isArray(o)) return o.map(strip); if (o && typeof o === 'object') { const r = {}; for (const k of Object.keys(o).sort()) if (!/^(saved|savedAt|ts|mt|ct|t0|stamp|app|appVersion|version|ver)$/.test(k)) r[k] = strip(o[k]); return r; } return o; };
const res = await B.p.evaluate(async files => {
  const Q = SYNQUENZER, out = {}; ensureAudio();
  for (let k = 0; k < 50 && !(AU.ctx && AU.ctx.state === 'running'); k++) await new Promise(r => setTimeout(r, 100));
  for (const [name, text] of Object.entries(files)) {
    if (text.startsWith('ERR')) { out[name] = {err: text}; continue; }
    const imp = Q.importJSON(text); await new Promise(r => setTimeout(r, 300));
    out[name] = {imp: !!imp, back: serializeProject(), md: DRUM_VOICES.filter(v => mdIsSrc(v.id)).length, mdMod: MDX.info().adds};
  }
  let vv = null; try { const r = await Q.vvRender({}); vv = {peak: r.peak, rms: r.rms, dur: r.dur, notes: (r.log || []).map(e => [e.track, e.out, +(+e.beat).toFixed(3), +(+e.vel).toFixed(3)]).sort((a, b) => a[2] - b[2] || a[0] - b[0] || a[1] - b[1])}; } catch (e) { vv = {err: String(e)}; }
  return {out, vv, ver: Q.version};
}, made.files);
const diffs = [];
const cmp = (a, b, path) => { if (diffs.length > 8) return; if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b)) { diffs.push(path + ': Typ'); return; }
  if (a && typeof a === 'object') { const ka = Object.keys(a), kb = Object.keys(b); for (const k of new Set([...ka, ...kb])) { if (!(k in a) || !(k in b)) { diffs.push(path + '.' + k + (k in a ? ' fehlt neu' : ' neu dazu')); continue; } cmp(a[k], b[k], path + '.' + k); } return; }
  if (a !== b) diffs.push(path + ': ' + JSON.stringify(a).slice(0, 60) + ' → ' + JSON.stringify(b).slice(0, 60)); };
const per = {};
for (const [name, text] of Object.entries(made.files)) {
  const r = res.out[name]; if (!r || r.err) { per[name] = r ? r.err : 'fehlt'; continue; }
  const n0 = diffs.length; cmp(strip(JSON.parse(text)), strip(JSON.parse(r.back)), name);
  per[name] = {imp: r.imp, same: diffs.length === n0, md: r.md, mdModule: r.mdMod};
}
ok('files_roundtrip_equal', !diffs.length && Object.values(per).every(x => x.imp && x.same), {n: Object.keys(per).length, diffs});
ok('no_md_pad_no_md_module', Object.values(per).every(x => x.md === 0 && x.mdModule === 0), {per});
const na = JSON.stringify(made.vv.notes), nb = JSON.stringify(res.vv && res.vv.notes);
ok('song_video_same_notes', !!res.vv && !res.vv.err && na === nb, {old: made.vv.notes.length, neu: res.vv && res.vv.notes ? res.vv.notes.length : res.vv});
const dB = (x, y) => 20 * Math.log10(x / y);
ok('song_video_level_same', !!res.vv && Math.abs(dB(res.vv.rms, made.vv.rms)) < 0.5 && Math.abs(dB(res.vv.peak, made.vv.peak)) < 0.5, {rmsDb: +dB(res.vv.rms, made.vv.rms).toFixed(3), peakDb: +dB(res.vv.peak, made.vv.peak).toFixed(3), dur: [made.vv.dur, res.vv.dur]});
ok('no_page_errors', !A.errs.length && !B.errs.length, {alt: A.errs.slice(0, 3), neu: B.errs.slice(0, 3)});
const pass = Object.values(checks).every(v => v === true || (v && v.ok === true));
console.log(JSON.stringify({test: 'north-songs', ids: ['ND4-01', 'ND4-06'], pass, checks}));
await b.close(); process.exit(pass ? 0 : 1);
