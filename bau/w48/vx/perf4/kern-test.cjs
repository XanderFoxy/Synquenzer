// PERF4 Kern-Test: vorher (a/) gegen nachher (b/), je frische Seite, iPhone hochkant 428x926.
// (1) 12 Werksklänge über das App-Worklet (mkRender, Math.random geseedet) – FNV je Kanal, bitgleich?
// (2) Klangschule öffnen, (3) Klang erkennen mit einem Probe-Ton starten (Worker aus Worklet-Text + MKT + Kern), (4) MS-Platte
//     öffnen (Synth-Spur mit MS-2000-Klang, Editor), (5) Text-Zugriffe: lkWkCheck, vv3Fmx, mkwEval; Konsole/Seitenfehler.
// Aufruf: node kern-test.cjs <port>
const {chromium} = require('playwright');
const port = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms));
async function run(br, dir) {
  const ctx = await br.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const pg = await ctx.newPage(), errs = [];
  pg.on('pageerror', e => errs.push('pageerror ' + e.message));
  pg.on('console', m => { if (m.type() === 'error' && !/abspann-logo|Failed to load resource/.test(m.text())) errs.push('console.error ' + m.text()); });
  await pg.goto('http://127.0.0.1:' + port + '/' + dir + '/index.html', {waitUntil: 'load'});
  await pg.waitForFunction(() => typeof S !== 'undefined' && S.tracks && S.tracks.length && typeof openEditor === 'function' && window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 60000});
  await sleep(1500);
  const r = await pg.evaluate(async () => {
    const SEED = 'Math.random = (() => { let s = 12345; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; })();\n';
    for (const id of ['sq-worklet-src', 'sq-mk-src', 'sq-bm-src', 'sq-md-src']) { const el = document.getElementById(id); if (el && !el.dataset.g) { el.dataset.g = 1; el.textContent = SEED + el.textContent; } }
    const fnv = a => { const u = new Uint8Array(a.buffer, a.byteOffset, a.byteLength); let h = 0x811c9dc5; for (let i = 0; i < u.length; i++) { h ^= u[i]; h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16); };
    const rms = a => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * a[i]; return +Math.sqrt(s / Math.max(1, a.length)).toFixed(6); };
    const seed = () => { let s = 777; Math.random = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
    const MR = Math.random, out = {version: SYNQUENZER.version};
    const ev = [[0, 'on', 48, .9], [0, 'on', 55, .8], [0, 'on', 64, .7], [1.0, 'off', 48], [1.0, 'off', 55], [1.0, 'off', 64], [1.1, 'on', 67, .8], [1.6, 'off', 67]];
    const ids = []; for (const [id, f] of FACTORY_BY_ID) if (f && f.engine && f.engine !== 'drum') ids.push(id);
    const pick = [], eng = new Set();
    for (const id of ids) { const e = FACTORY_BY_ID.get(id).engine; if (!eng.has(e)) { eng.add(e); pick.push(id); } }
    for (const id of ids) { if (pick.length >= 12) break; if (!pick.includes(id)) pick.push(id); }
    pick.length = Math.min(pick.length, 12);
    out.mk = [];
    for (const id of pick) {
      let res = null;
      for (let v = 0; v < 3; v++) {
        try { seed(); const rec = FACTORY_BY_ID.get(id); const snd = typeof soundCopy === 'function' ? soundCopy(rec) : SQStore.soundFromFactory(rec);
          const x = await SYNQUENZER.mkRender(snd, ev, {sec: 2, seed: 1}); res = {id, engine: rec.engine, h: [fnv(x.l), fnv(x.r || x.l)], rms: rms(x.l)}; }
        catch (e) { res = {id, err: String(e).slice(0, 120)}; } finally { Math.random = MR; }
        if (res.err || res.rms > 0) break;   // stiller Render (App, bekannt KOMM Offen 6): neu versuchen
      }
      out.mk.push(res);
    }
    // Text-Zugriffe
    try { out.lk = typeof lkWkCheck === 'function' ? lkWkCheck() : 'fehlt'; } catch (e) { out.lk = 'ERR ' + e.message; }
    try { const f = typeof mkwEval === 'function' ? mkwEval() : null; out.mkw = f ? Object.keys(f).length : f; } catch (e) { out.mkw = 'ERR ' + e.message; }
    try { if (typeof vv3Fmx === 'function') vv3Fmx(); out.fmx = typeof VV3 !== 'undefined' && VV3.fmx ? Object.keys(VV3.fmx).join(',') + ' ALGS ' + (VV3.fmx.ALGS ? VV3.fmx.ALGS.length : '?') : 'fehlt'; } catch (e) { out.fmx = 'ERR ' + e.message; }
    return out;
  });
  // (2) Klangschule
  r.ks = await pg.evaluate(async () => { try { const ok = ksOpen({}); await new Promise(z => setTimeout(z, 800));
    const vis = [...document.querySelectorAll('[class*="ks"]')].filter(e => e.getBoundingClientRect().height > 40).length;
    const res = {ok: !!ok, geladen: KSM.ok, err: KSM.err || null, sichtbar: vis}; try { KSX.close && KSX.close(); } catch (e) {} return res; } catch (e) { return {err: String(e)}; } });
  await sleep(400);
  // (3) Klang erkennen
  r.ke1 = await pg.evaluate(async () => { try {
    const sr = 48000, n = sr * 1.2, x = new Float32Array(n); let ph = 0;
    for (let i = 0; i < n; i++) { const f = 220; ph += f / sr; const env = Math.min(1, i / 480) * Math.exp(-i / (sr * 0.9)); x[i] = 0.5 * env * (2 * (ph % 1) - 1); }
    const ok = SYNQUENZER.ke1.open({pcm: x, sr, name: 'Probe'});
    let st = null; for (let k = 0; k < 120; k++) { await new Promise(z => setTimeout(z, 250)); st = SYNQUENZER.ke1.state(); if (st && (st.done || st.result || st.err || (st.phase && /fertig|done|ready|res/i.test(String(st.phase))))) break; }
    const s = st ? JSON.stringify(st).slice(0, 300) : null; try { SYNQUENZER.ke1.close(); } catch (e) {}
    return {ok: !!ok, info: SYNQUENZER.ke1.info(), state: s}; } catch (e) { return {err: String(e)}; } });
  await sleep(400);
  // (4) MS-Platte
  r.mk = await pg.evaluate(async () => { try {
    let id = null; for (const [k, f] of FACTORY_BY_ID) if (f && f.engine === 'mk') { id = k; break; }
    const t = S.tracks.findIndex(x => x.kind === 'synth'); selectTrack(t);
    const rec = FACTORY_BY_ID.get(id); const snd = typeof soundCopy === 'function' ? soundCopy(rec) : SQStore.soundFromFactory(rec);
    if (typeof applySound === 'function') applySound(t, snd); else S.tracks[t].sound = snd;
    openEditor(); await new Promise(z => setTimeout(z, 1200));
    const plate = [...document.querySelectorAll('[class*="mkp"],[class*="mksk"]')].filter(e => e.getBoundingClientRect().height > 0).length;
    return {id, t, geladen: MKL.loaded, err: MKL.err || null, plattenTeile: plate, ms2000: document.body.innerText.includes('MS 2000')}; } catch (e) { return {err: String(e)}; } });
  await pg.screenshot({path: __dirname + '/kern-' + dir + '.png'});
  r.errs = errs; await ctx.close(); return r;
}
(async () => {
  const br = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const a1 = await run(br, 'a'), b1 = await run(br, 'b'), a2 = await run(br, 'a');
  await br.close();
  const key = r => JSON.stringify(r.mk);
  console.log(JSON.stringify({vorher: a1, nachher: b1, vorher2: {mk: a2.mk, errs: a2.errs}}, null, 1));
  const kontrolle = key(a1) === key(a2), gleich = key(a1) === key(b1);
  const laut = a1.mk.length === 12 && a1.mk.every(m => m.rms > 1e-4);
  console.log((kontrolle ? 'OK ' : 'FEHLER ') + 'Kontrolle vorher == vorher');
  console.log((laut ? 'OK ' : 'FEHLER ') + 'Render nicht still: ' + a1.mk.length + ' Werksklänge (' + [...new Set(a1.mk.map(m => m.engine))].join('/') + ')');
  console.log((gleich ? 'OK ' : 'FEHLER ') + 'vorher == nachher bitgleich (12 Werksklänge, je 2 Kanäle)');
  const same = k => JSON.stringify(a1[k]) === JSON.stringify(b1[k]);
  for (const k of ['lk', 'mkw', 'fmx', 'ks', 'ke1', 'mk']) console.log((same(k) ? 'OK ' : 'ANDERS ') + k + ' vorher ' + JSON.stringify(a1[k]) + ' | nachher ' + JSON.stringify(b1[k]));
  const fe = [...a1.errs, ...b1.errs, ...a2.errs]; console.log((fe.length ? 'FEHLER ' : 'OK ') + 'Konsole/Seitenfehler ' + JSON.stringify(fe.slice(0, 6)));
  console.log(kontrolle && laut && gleich && !fe.length ? 'ERGEBNIS bitgleich' : 'ERGEBNIS NICHT bitgleich');
})().catch(e => { console.error(e); process.exit(1); });
