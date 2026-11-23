// TON2 gleich: gemerkte Lautheits-Analyse == frisch gerechnete (bitgleich, auch mit Begrenzer), alte Projekte, falscher Fingerabdruck.
// node gleich.js <port>
const {chromium} = require('playwright');
const port = process.argv[2] || '8851', URL = 'http://127.0.0.1:' + port + '/index.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const br = await chromium.launch();
  const ctx = await br.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const errs = [], pg = await ctx.newPage();
  pg.on('pageerror', e => errs.push('pageerror ' + e.message));
  pg.on('console', m => { if (m.type() === 'error' && !/abspann-logo|Failed to load resource/.test(m.text())) errs.push('console.error ' + m.text()); });
  const ready = () => pg.waitForFunction(() => typeof S !== 'undefined' && S.tracks && S.tracks.length && typeof tkAddPcmTake === 'function', null, {timeout: 60000});
  await pg.goto(URL, {waitUntil: 'load'}); await ready(); await sleep(1200);
  // laut (kein Begrenzer), leise (Begrenzer mit Abschnitten), kurz mit Spitzen
  const ids = await pg.evaluate(async () => {
    const mk = (sek, amp, sr, spikes) => { const n = Math.round(sek * sr), p = new Int16Array(n); let s = 7;
      for (let i = 0; i < n; i++) { const t = i / sr; s = (s * 1103515245 + 12345) & 0x7fffffff; let v = amp * (Math.sin(2 * Math.PI * 220 * t) + .3 * Math.sin(2 * Math.PI * 1330 * t)) / 1.3 + (s / 0x7fffffff - .5) * amp * .05;
        if (spikes && i % 9000 < 40) v = 30000 * Math.sin(2 * Math.PI * 3000 * t); p[i] = Math.max(-32768, Math.min(32767, Math.round(v))); }
      return p; };
    const out = [];
    for (const [sek, amp, sr, sp] of [[180, 12000, 48000, 0], [60, 1500, 44100, 1], [4, 800, 48000, 1]]) { const r = tkAddPcmTake(mk(sek, amp, sr, sp), sr, 'import'); await r.stored; out.push(r.id); }
    const ti = imp1OrigT(); S.tracks[ti].clips[0] = {len: 8, key: Object.assign({}, S.key), notes: [], audio: tkNormAudio({take: out[0], in: 0, out: 180, at: 0})};
    for (let k = 1; k < 3; k++) { const t = NT(); const nt = newSynthTrack(t, DEFAULT_SOUNDS[2]); restoreTrack(t, JSON.stringify(nt)); S.tracks[t].clips[0] = {len: 8, key: Object.assign({}, S.key), notes: [], audio: tkNormAudio({take: out[k], in: 0, out: 2, at: 0})}; }
    saveNow(); await VP_API.vpWait(); for (let k = 0; k < 40 && TON2.save < 3; k++) await new Promise(r => setTimeout(r, 50));
    return out;
  });
  const state = () => pg.evaluate(() => ({hit: TON2.hit, miss: TON2.miss, bad: TON2.bad, save: TON2.save, err: TON2.err, runs: VP.runs}));
  const before = await state();
  const vergleich = () => pg.evaluate(async ids => {
    for (let k = 0; k < 200 && ids.some(id => !TK.buf.has(id)); k++) await new Promise(r => setTimeout(r, 25));
    await VP_API.vpWait();
    const res = [];
    for (const id of ids) {
      const b = TK.buf.get(id), A = VP.m.get(b); if (!A) { res.push({id, fehlt: true}); continue; }
      const J = vpJob(b); vpStep(J, Infinity); const B = J.r; let d = 0, envD = 0, ebN = 0;
      for (const k of ['lufs', 'gDb', 'g', 'pk', 'grDb', 'K']) if (!Object.is(A[k], B[k])) d++;
      if (JSON.stringify(A.segs) !== JSON.stringify(B.segs)) d++;
      if (('eb' in A) !== ('eb' in B) || !!A.eb !== !!B.eb || !!A.env !== !!B.env) d++;
      if (A.eb && B.eb) { const x = A.eb.d || A.eb.getChannelData(0), y = B.eb.d || B.eb.getChannelData(0); ebN = x.length; if (x.length !== y.length) d++; else for (let i = 0; i < x.length; i++) if (!Object.is(x[i], y[i])) d++; }
      if (A.env && B.env) for (const [s0, s1] of B.segs) for (let i = s0; i <= Math.min(B.env.length - 1, s1 + 1); i++) if (!Object.is(A.env[i], B.env[i])) envD++;
      res.push({id, abw: d, envAbw: envD, segs: B.segs.length, ebN, g: B.g, lufs: B.lufs});
    }
    return res;
  }, ids);
  // 1) Neu laden: gemerkte Analyse
  await pg.reload({waitUntil: 'load'}); await ready();
  const r1 = await vergleich(); const s1 = await state();
  // 2) Altes Projekt: Gemerktes löschen -> einmal rechnen, merken -> wieder neu laden: gemerkt
  await pg.evaluate(async ids => { for (const id of ids) await kv.adel(id + ':lv1'); }, ids);
  await pg.reload({waitUntil: 'load'}); await ready();
  const r2 = await vergleich(); await sleep(500); const s2 = await state();
  await pg.reload({waitUntil: 'load'}); await ready();
  const r3 = await vergleich(); const s3 = await state();
  // 3) Falscher Fingerabdruck (z. B. anderes Audio unter derselben ID): nicht übernehmen, neu rechnen
  await pg.evaluate(async id => { const ab = await kv.aget(id + ':lv1'); const dv = new DataView(ab), hl = dv.getUint32(0, true); const h = JSON.parse(new TextDecoder().decode(new Uint8Array(ab, 8, hl)));
    h.fp = 'x' + h.fp.slice(1); const hb = new TextEncoder().encode(JSON.stringify(h)); const o = (8 + hb.length + 3) & ~3, nf = dv.getUint32(4, true), oo = (8 + hl + 3) & ~3; const nb = new ArrayBuffer(o + nf * 4), nv = new DataView(nb);
    nv.setUint32(0, hb.length, true); nv.setUint32(4, nf, true); new Uint8Array(nb, 8, hb.length).set(hb); new Uint8Array(nb, o).set(new Uint8Array(ab, oo, nf * 4)); await kv.aput(id + ':lv1', nb); }, ids[1]);
  await pg.reload({waitUntil: 'load'}); await ready();
  const r4 = await vergleich(); const s4 = await state();
  const gc = await pg.evaluate(async ids => { await tkGc(); const ks = await kv.akeys(); return ids.map(id => ks.includes(id + ':lv1')); }, ids);
  const sz = await pg.evaluate(async ids => { const o = []; for (const id of ids) { const b = await kv.aget(id + ':lv1'); o.push(b ? b.byteLength : 0); } return o; }, ids);
  console.log(JSON.stringify({before, nachLaden: {s1, r1}, altesProjekt: {s2, r2, danach: s3, r3}, falscherFp: {s4, r4}, nachGcBehalten: gc, bytes: sz, errs}, null, 1));
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
