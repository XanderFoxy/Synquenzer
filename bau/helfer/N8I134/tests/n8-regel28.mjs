// Regel 28 / I1-80 / N8-01: the same calls in 4.30.0 (bau/snapshots/R-4300.html) and in N8I134 must give the same results:
// video offline render (VV1-VV4 path, PCM hash), GarageBand instrumental (G-GB WAV hash), North model drum render, MS 2000 render,
// MIDI export, consolidate (KON), choir group norm (G6+), syllables (G9), VV4 probe, saved JSON of the demo, the messages of a
// full engine sync. node n8-regel28.mjs [index.html]
import {chromium} from 'playwright';
import path from 'path'; import {fileURLToPath} from 'url'; import crypto from 'crypto';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const NEW = path.resolve(process.argv[2] || path.join(HERE, '../index.html')), OLD = path.resolve(HERE, '../../../snapshots/R-4300.html');
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const h = s => crypto.createHash('sha1').update(typeof s === 'string' ? s : JSON.stringify(s)).digest('hex').slice(0, 12);
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
async function run(file) {
  const p = await b.newPage({viewport: {width: 428, height: 926}}); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(() => {     // M-MSG: every structured message to the worklets (set / mods / fm6 / mk / sr / morph / lf), no events
    const o = MessagePort.prototype.postMessage; window.__msg = [];
    MessagePort.prototype.postMessage = function (m) { try { if (m && typeof m === 'object' && !m.ev && !m.tempo && (m.set || m.mods || m.fm6 || m.mk || 'sr' in m || m.morph || m.lf)) window.__msg.push(JSON.stringify(m)); } catch (e) {} return o.apply(this, arguments); };
  });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  const r = await p.evaluate(async () => {
    const out = {}, T = async (k, f) => { try { out[k] = await f(); } catch (e) { out[k] = 'ERR ' + String(e && e.message || e).slice(0, 80); } };
    ensureAudio(); await new Promise(r => setTimeout(r, 1200));
    // a song: scene 1 and 2 placed (the demo has none), the same in both versions
    await T('song', () => { SYNQUENZER.placePart('S1', 0, 'insert'); SYNQUENZER.placePart('S2', 4, 'insert'); return S.song ? S.song.bars : null; });
    await T('json', () => JSON.stringify(JSON.parse(serializeProject()), (k, v) => (k === 'id' || k === 'uid' || k === 'mark' ? undefined : v)));
    window.__msg.length = 0; syncEngines(); await new Promise(r => setTimeout(r, 100)); await T('msg', () => window.__msg.slice());
    await T('midi', async () => { const x = await SYNQUENZER.exportMidi({dry: true, song: true}); return x && x.bytes ? Array.from(x.bytes).join(',') : JSON.stringify(x); });
    await T('mk', async () => { const r = await SYNQUENZER.mkRender(SQStore.normalizeSound({engine: 'mk', name: 'T', p: {}}), [[0, 'on', 60, .8], [.5, 'off', 60]], {sec: .8, seed: 1}); return r && r.ch ? Array.from(r.ch[0].slice(0, 30000)).map(v => Math.round(v * 1e6)).join(',') : JSON.stringify(r); });
    await T('md', async () => { const r = await SYNQUENZER.mdRender([[0, 36, .9], [.25, 38, .8]], {sec: .6}); return r && r.ch ? Array.from(r.ch[0]).map(v => Math.round(v * 1e6)).join(',') : JSON.stringify(r && (r.pcm || r)); });
    await T('g9', () => JSON.stringify([SYNQUENZER.g9Syl('Sonnenschein', 'de'), SYNQUENZER.g9Syl('wonderful', 'en')]));
    await T('g6', () => JSON.stringify(SYNQUENZER.g6pNorm({v: 1, lanes: [{role: 'terz', vol: .7}]})));
    await T('vv4', () => JSON.stringify(SYNQUENZER.vv4Probe('spur', 0, 0)));
    await T('vv', async () => { const r = await SYNQUENZER.vvRender({}); const pcm = SYNQUENZER.vvPcm(); return JSON.stringify({peak: r.peak, rms: r.rms, dur: r.dur, sr: r.sr, n: pcm && pcm.n}); });
    await T('ggb', async () => { const r = await SYNQUENZER.ggbExport({remember: true}); const w = SYNQUENZER.ggbWav(); return w ? w.b64.slice(0, 400000) : JSON.stringify(r); });
    await T('kon', () => { const a = SYNQUENZER.konsolidieren(0, 0, 'Test'); return JSON.stringify([a, SYNQUENZER.kons()]); });
    return out;
  });
  await p.close(); return {r, errs};
}
const A = await run(OLD), B = await run(NEW);
// the video render is not bit-equal even in 4.30.0 itself (free start phases per note since 4.24.1, noise): length and level
{ const pa = JSON.parse(A.r.vv), pb = JSON.parse(B.r.vv), db = 20 * Math.log10(pb.rms / pa.rms);
  ok('N8-01 vv Video-Offline-Render: Länge gleich, Pegel ± 0,5 dB (4.30.0 selbst nicht bitgleich)', pa.n === pb.n && pa.dur === pb.dur && Math.abs(db) <= .5, pa.n + ' Frames, ' + db.toFixed(2) + ' dB'); delete A.r.vv; delete B.r.vv; }
for (const k of Object.keys(A.r)) {
  const a = A.r[k], c = B.r[k], same = JSON.stringify(a) === JSON.stringify(c);
  ok('N8-01 ' + k + ' gleich wie 4.30.0', same, (typeof a === 'string' && a.startsWith('ERR') ? a + ' / ' : '') + h(a) + (same ? '' : ' ≠ ' + h(c) + (typeof c === 'string' && c.startsWith('ERR') ? ' ' + c : '')) + (typeof a === 'string' ? ' (' + a.length + ' Zeichen)' : ''));
}
ok('Konsole 4.30.0 / N8I134 gleich fehlerfrei', B.errs.length <= A.errs.length, A.errs.length + ' / ' + B.errs.length + ' ' + B.errs.slice(0, 2).join(' | '));
await b.close();
console.log(fails ? 'FEHLER: ' + fails : 'ALLES GRÜN');
process.exit(fails ? 1 : 0);
