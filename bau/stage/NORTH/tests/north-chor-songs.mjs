// STAGE NORTH (Regel 28): Songs aus 4.27.0 mit Chor-Gruppe (G6+, Stil 80 und Gospel) und Songtext laden in 4.30.0 unverändert.
// Alt (R-4270) baut den Song, speichert ihn und rechnet den Video-Ton; neu lädt die Datei, speichert wieder (deep-equal ohne
// Zeitstempel) und rechnet denselben Video-Ton: gleiche Noten, Pegel ±0,1 dB, kein North-Modul geladen.
// Aufruf: node north-chor-songs.mjs [neu.html] [alt.html]
import {createRequire} from 'module'; const {chromium} = createRequire(import.meta.url)('playwright');
import {setup} from './g6ph-lib.mjs';
const NEW = process.argv[2] || new URL('../index.html', import.meta.url).pathname;
const OLD = process.argv[3] || new URL('../../../snapshots/R-4270.html', import.meta.url).pathname;
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
async function open(file) {
  const p = await b.newPage({viewport: {width: 390, height: 844}}), errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 30000}); await p.waitForTimeout(800);
  return {p, errs};
}
const vvOf = async p => p.evaluate(async () => { try { const r = await SYNQUENZER.vvRender({}); return {peak: r.peak, rms: r.rms, dur: r.dur, notes: (r.log || []).map(e => [e.track, e.out, +(+e.beat).toFixed(3)]).sort((a, b) => a[2] - b[2] || a[0] - b[0] || a[1] - b[1])}; } catch (e) { return {err: String(e)}; } });
const checks = {}; const ok = (k, v, info) => { checks[k] = info ? Object.assign({ok: !!v}, info) : !!v; };
const A = await open(OLD);
await A.p.evaluate(async () => { ensureAudio(); for (let k = 0; k < 50 && !(AU.ctx && AU.ctx.state === 'running'); k++) await new Promise(r => setTimeout(r, 100)); });
await setup(A.p, {bars: 16, at: [4, 10]});
const made = await A.p.evaluate(async () => {
  const Q = SYNQUENZER; Q.loadKit('808');
  const a = await Q.g6pStyle({vox: 'V1'}, '80'), b2 = await Q.g6pStyle({vox: 'V2'}, 'gospel');
  const i1 = Q.g6Info({vox: 'V1'}), i2 = Q.g6Info({vox: 'V2'});
  return {a, b2, v: [i1.chor.v, i2.chor.v], sty: [i1.chor.style, i2.chor.style], file: serializeProject(), ver: Q.version};
});
made.vv = await vvOf(A.p);
ok('old_made', made.a && made.b2 && made.v.join() === '2,2' && made.vv && !made.vv.err, {v: made.v, sty: made.sty, ver: made.ver, vv: made.vv.err || made.vv.notes.length});
await A.p.close();
const B = await open(NEW);
const res = await B.p.evaluate(async text => {
  const Q = SYNQUENZER; ensureAudio(); for (let k = 0; k < 50 && !(AU.ctx && AU.ctx.state === 'running'); k++) await new Promise(r => setTimeout(r, 100));
  const imp = Q.importJSON(text); await new Promise(r => setTimeout(r, 500));
  const i1 = Q.g6Info({vox: 'V1'}), i2 = Q.g6Info({vox: 'V2'});
  return {imp: !!imp, back: serializeProject(), v: [i1.chor.v, i2.chor.v], sty: [i1.chor.style, i2.chor.style], md: DRUM_VOICES.filter(v => mdIsSrc(v.id)).length, mdMod: MDX.info().adds, ver: Q.version};
}, made.file);
res.vv = await vvOf(B.p);
const strip = o => { if (Array.isArray(o)) return o.map(strip); if (o && typeof o === 'object') { const r = {}; for (const k of Object.keys(o).sort()) if (!/^(saved|savedAt|ts|mt|ct|t0|stamp|app|appVersion|version|ver)$/.test(k)) r[k] = strip(o[k]); return r; } return o; };
const diffs = [];
const cmp = (a, c, path) => { if (diffs.length > 8) return; if (typeof a !== typeof c || Array.isArray(a) !== Array.isArray(c)) { diffs.push(path + ': Typ'); return; }
  if (a && typeof a === 'object') { for (const k of new Set([...Object.keys(a), ...Object.keys(c)])) { if (!(k in a) || !(k in c)) { diffs.push(path + '.' + k + (k in a ? ' fehlt neu' : ' neu dazu')); continue; } cmp(a[k], c[k], path + '.' + k); } return; }
  if (a !== c) diffs.push(path + ': ' + JSON.stringify(a).slice(0, 60) + ' → ' + JSON.stringify(c).slice(0, 60)); };
cmp(strip(JSON.parse(made.file)), strip(JSON.parse(res.back)), 'datei');
ok('file_roundtrip_equal', res.imp && !diffs.length, {diffs});
ok('chor_group_kept', res.v.join() === '2,2' && res.sty.join() === made.sty.join(), {v: res.v, sty: res.sty});
ok('no_md_module', res.md === 0 && res.mdMod === 0, {md: res.md, mdMod: res.mdMod});
const dB = (x, y) => 20 * Math.log10(x / y);
ok('video_same_notes', !res.vv.err && JSON.stringify(res.vv.notes) === JSON.stringify(made.vv.notes), {old: made.vv.notes.length, neu: res.vv.notes ? res.vv.notes.length : res.vv.err});
ok('video_level_same', !res.vv.err && Math.abs(dB(res.vv.rms, made.vv.rms)) < 0.1 && Math.abs(dB(res.vv.peak, made.vv.peak)) < 0.1, {rmsDb: +dB(res.vv.rms, made.vv.rms).toFixed(4), peakDb: +dB(res.vv.peak, made.vv.peak).toFixed(4)});
ok('no_page_errors', !A.errs.length && !B.errs.length, {alt: A.errs.slice(0, 3), neu: B.errs.slice(0, 3)});
const pass = Object.values(checks).every(v => v === true || (v && v.ok === true));
console.log(JSON.stringify({test: 'north-chor-songs', pass, checks}));
await b.close(); process.exit(pass ? 0 : 1);
