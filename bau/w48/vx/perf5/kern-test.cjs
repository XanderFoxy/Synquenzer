// PERF5 Kern-Test (aus PERF4 erweitert): vorher (a/) gegen nachher (b/), je frische Seite, iPhone hochkant 428x926.
// PERF5 dazu: (6) Worklet-Vorlagen des Haupt-Skripts laden (MIC_WK, ST_WK, MIXA-Verbund mit MX1/MX2/MX3/JAM2),
// (7) CSS-Vorlagen der stillen Blöcke: CSSOM vorher == nachher (je Vorlage alle Regeln als cssText), (8) MS-Platte und
// NDP-Platte: Screenshot-Pixelvergleich (Kontrolle vorher == vorher).
// (1) 12 Werksklänge über das App-Worklet (mkRender, Math.random geseedet) – FNV je Kanal, bitgleich?
// (2) Klangschule öffnen, (3) Klang erkennen mit einem Probe-Ton starten (Worker aus Worklet-Text + MKT + Kern), (4) MS-Platte
//     öffnen (Synth-Spur mit MS-2000-Klang, Editor), (5) Text-Zugriffe: lkWkCheck, vv3Fmx, mkwEval; Konsole/Seitenfehler.
// Aufruf: node kern-test.cjs <port>   (Server-Ordner: a/index.html = vorher, b/index.html = nachher, je version.json)
const {chromium} = require('playwright');
const port = process.argv[2], sleep = ms => new Promise(r => setTimeout(r, ms));
const fs = require('fs'), path = require('path'), acorn = require(path.join(__dirname, 'acorn.js'));
const ROOT = process.argv[3] || path.join(__dirname, 'srv');
// CSS-Vorlagen der stillen Blöcke (` … ` ohne ${, ≥ 1000 Zeichen, kein Worklet) – je Block in Reihenfolge
function cssOf(file) { const s = fs.readFileSync(file, 'utf8'), out = []; const re = /<script type="text\/plain" id="(sq-[\w-]+-src)">/g; let m;
  while ((m = re.exec(s))) { const a = m.index + m[0].length, b = s.indexOf('</script>', a), t = s.slice(a, b), T = [];
    try { acorn.parse(t, {ecmaVersion: 'latest', sourceType: 'script', onToken: T}); } catch (e) { continue; }
    const tt = acorn.tokTypes;
    for (let i = 1; i + 1 < T.length; i++) if (T[i].type === tt.template && T[i - 1].type === tt.backQuote && T[i + 1].type === tt.backQuote) {
      const raw = t.slice(T[i].start, T[i].end); if (raw.length >= 900 && !raw.includes('${') && !raw.includes('registerProcessor') && /\{[^}]*:/.test(raw) && !raw.includes('<')) out.push({id: m[1], raw}); } }
  return out; }
const CA = cssOf(ROOT + '/a/index.html'), CB = cssOf(ROOT + '/b/index.html');
const CSS = {a: CA.map(x => x.raw), b: CB.map(x => x.raw)};
async function run(br, dir, tag) {
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
    const full = st ? JSON.stringify(st, (k, v) => /^(ms|wMs|took|t0|t1|at|ts)$/.test(k) && typeof v === 'number' ? 0 : v) : ''; let h = 0x811c9dc5; for (let i = 0; i < full.length; i++) { h ^= full.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    const s = {len: full.length, h: h.toString(16), kopf: full.slice(0, 160)}; try { SYNQUENZER.ke1.close(); } catch (e) {}
    const inf = SYNQUENZER.ke1.info(); return {ok: !!ok, geladen: inf.loaded, err: inf.err, state: s}; } catch (e) { return {err: String(e)}; } });
  await sleep(400);
  // (4) MS-Platte
  r.platte = await pg.evaluate(async () => { try {
    let id = null; for (const [k, f] of FACTORY_BY_ID) if (f && f.engine === 'mk') { id = k; break; }
    const t = S.tracks.findIndex(x => x.kind === 'synth'); selectTrack(t);
    const rec = FACTORY_BY_ID.get(id); const snd = typeof soundCopy === 'function' ? soundCopy(rec) : SQStore.soundFromFactory(rec);
    if (typeof applySound === 'function') applySound(t, snd); else S.tracks[t].sound = snd;
    openEditor(); await new Promise(z => setTimeout(z, 1200));
    const plate = [...document.querySelectorAll('[class*="mkp"],[class*="mksk"]')].filter(e => e.getBoundingClientRect().height > 0).length;
    return {id, t, geladen: MKL.loaded, err: MKL.err || null, plattenTeile: plate, ms2000: document.body.innerText.includes('MS 2000')}; } catch (e) { return {err: String(e)}; } });
  r.shotMs = await pg.screenshot({path: __dirname + '/tests/ms-' + dir + tag + '.png'});
  // (8b) NDP-Platte (Drum-Kit)
  r.ndp = await pg.evaluate(async () => { try { try { closeEditor && closeEditor(); } catch (e) {} await new Promise(z => setTimeout(z, 400));
    const ok = window.NDP && NDP.open ? NDP.open({}) : null; await new Promise(z => setTimeout(z, 1500));
    const el = document.getElementById('ndp'); return {ok: !!ok, da: !!el, sichtbar: !!el && !el.hidden && el.getBoundingClientRect().height > 0, teile: el ? el.querySelectorAll('*').length : 0}; } catch (e) { return {err: String(e)}; } });
  r.shotNdp = await pg.screenshot({path: __dirname + '/tests/ndp-' + dir + tag + '.png'});
  // (6) Worklet-Vorlagen des Haupt-Skripts
  r.wk = await pg.evaluate(async () => { const res = {};
    const srcs = {MIC_WK: () => MIC_WK, ST_WK: () => ST_WK, MIXA: () => mixaModSrc()};
    for (const [k, f] of Object.entries(srcs)) { try { const c = new OfflineAudioContext(2, 128, 48000); const src = f();
      await c.audioWorklet.addModule(URL.createObjectURL(new Blob([src], {type: 'application/javascript'}))); res[k] = 'ok'; } catch (e) { res[k] = 'ERR ' + String(e).slice(0, 100); } }
    return res; });
  // (7) CSSOM je CSS-Vorlage
  r.cssom = await pg.evaluate(texts => { const ser = rules => [...rules].map(x => x.cssText).join('\n');
    return texts.map(t => { try { const sh = new CSSStyleSheet(); sh.replaceSync(t); return {n: sh.cssRules.length, s: ser(sh.cssRules)}; } catch (e) { return {err: String(e)}; } }); }, CSS[dir]);
  r.errs = errs; await ctx.close(); return r;
}
(async () => {
  const br = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const a1 = await run(br, 'a', '1'), b1 = await run(br, 'b', '1'), a2 = await run(br, 'a', '2');
  await br.close();
  const key = r => JSON.stringify(r.mk);
  const pix = k => ({kontrolle: Buffer.compare(a1[k], a2[k]) === 0, gleich: Buffer.compare(a1[k], b1[k]) === 0});
  const PX = {ms: pix('shotMs'), ndp: pix('shotNdp')};
  for (const r of [a1, b1, a2]) { delete r.shotMs; delete r.shotNdp; }
  const cssCmp = CA.map((x, k) => ({id: x.id, vorher: x.raw.length, nachher: (CB[k] || {raw: ''}).raw.length, regeln: a1.cssom[k].n, gleich: !!CB[k] && CB[k].id === x.id && JSON.stringify(a1.cssom[k]) === JSON.stringify(b1.cssom[k])}));
  const cssom = a1.cssom; for (const r of [a1, b1, a2]) delete r.cssom;
  console.log(JSON.stringify({vorher: a1, nachher: b1, vorher2: {mk: a2.mk, errs: a2.errs}}, null, 1));
  console.log('CSS-Vorlagen: ' + JSON.stringify(cssCmp));
  const cssOk = CA.length === CB.length && CA.length >= 6 && cssCmp.every(c => c.gleich && c.regeln > 10) && cssom.every(c => !c.err);
  console.log((cssOk ? 'OK ' : 'FEHLER ') + 'CSSOM vorher == nachher (' + CA.length + ' CSS-Vorlagen, ' + cssCmp.reduce((s, c) => s + c.regeln, 0) + ' Regeln, ' + cssCmp.reduce((s, c) => s + c.vorher, 0) + ' -> ' + cssCmp.reduce((s, c) => s + c.nachher, 0) + ' Zeichen)');
  const wkOk = Object.values(a1.wk).every(v => v === 'ok') && JSON.stringify(a1.wk) === JSON.stringify(b1.wk);
  console.log((wkOk ? 'OK ' : 'FEHLER ') + 'Worklet-Vorlagen laden vorher ' + JSON.stringify(a1.wk) + ' | nachher ' + JSON.stringify(b1.wk));
  for (const k of ['ms', 'ndp']) console.log((PX[k].gleich ? 'OK ' : (PX[k].kontrolle ? 'ANDERS ' : 'UNRUHIG ')) + k + '-Platte Screenshot pixelgleich (Kontrolle vorher==vorher: ' + PX[k].kontrolle + ')');
  const kontrolle = key(a1) === key(a2), gleich = key(a1) === key(b1);
  const laut = a1.mk.length === 12 && a1.mk.every(m => m.rms > 1e-4);
  console.log((kontrolle ? 'OK ' : 'FEHLER ') + 'Kontrolle vorher == vorher');
  console.log((laut ? 'OK ' : 'FEHLER ') + 'Render nicht still: ' + a1.mk.length + ' Werksklänge (' + [...new Set(a1.mk.map(m => m.engine))].join('/') + ')');
  console.log((gleich ? 'OK ' : 'FEHLER ') + 'vorher == nachher bitgleich (12 Werksklänge, je 2 Kanäle)');
  const same = k => JSON.stringify(a1[k]) === JSON.stringify(b1[k]);
  for (const k of ['lk', 'mkw', 'fmx', 'ks', 'ke1', 'platte', 'ndp']) console.log((same(k) ? 'OK ' : 'ANDERS ') + k + ' vorher ' + JSON.stringify(a1[k]) + ' | nachher ' + JSON.stringify(b1[k]));
  const fe = [...a1.errs, ...b1.errs, ...a2.errs]; console.log((fe.length ? 'FEHLER ' : 'OK ') + 'Konsole/Seitenfehler ' + JSON.stringify(fe.slice(0, 6)));
  const allOk = kontrolle && laut && gleich && !fe.length && cssOk && wkOk && PX.ms.gleich && PX.ndp.gleich && same('platte') && same('ndp');
  console.log(allOk ? 'ERGEBNIS bitgleich' : 'ERGEBNIS NICHT bitgleich');
})().catch(e => { console.error(e); process.exit(1); });
