// VXRR Kern-Test: Gesang reinigen – Regler Gesamt + Stärke je Schritt.
// Aufruf: node vxrr-test.cjs <neu.html> <alt-4.88.html> [fotos]   (fotos = Bildschirmfotos vorher/nachher schreiben)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const {chromium} = require('playwright');
const NEU = path.resolve(process.argv[2]), ALT = path.resolve(process.argv[3]), FOTO = process.argv[4] === 'fotos';
const D = __dirname, SRV = path.join(D, 'srv');
let okN = 0, badN = 0; const R = {};
const ok = (c, n, info) => { if (c) okN++; else badN++; console.log((c ? 'OK ' : 'FEHLER ') + n + (info != null ? ' – ' + JSON.stringify(info) : '')); };
for (const [k, f] of [['alt', ALT], ['neu', NEU]]) { fs.mkdirSync(path.join(SRV, k), {recursive: true}); fs.copyFileSync(f, path.join(SRV, k, 'index.html')); fs.writeFileSync(path.join(SRV, k, 'version.json'), '{"version":"4.88.0"}'); }
const PORT = 9000 + Math.floor(Math.random() * 100);
const srv = cp.spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {cwd: SRV, stdio: 'ignore'});
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Synthetische Gesangs-Spur (12 s, 44,1 kHz): Silben 220 Hz mit Obertönen, Pausen mit Raumrauschen, Brumm 50 Hz, Klicks, Plopps
function take() {
  const sr = 44100, n = sr * 12, x = new Float32Array(n); let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296 - 0.5; };
  const syl = []; for (let t = 0.3; t < 11.4; t += 0.75) syl.push([t, t + 0.5]);
  for (let i = 0; i < n; i++) { const t = i / sr; x[i] = 0.002 * rnd() + 0.01 * (Math.sin(2 * Math.PI * 50 * t) + 0.5 * Math.sin(2 * Math.PI * 150 * t + 1)); }
  for (const [a, b] of syl) { const i0 = Math.round(a * sr), i1 = Math.round(b * sr); for (let i = i0; i < i1; i++) { const t = (i - i0) / sr, L = (i1 - i0) / sr, env = Math.min(1, t / 0.03, (L - t) / 0.05), f = 220 * (1 + 0.01 * Math.sin(2 * Math.PI * 5 * t)); let s = 0; for (let h = 1; h <= 12; h++) s += Math.sin(2 * Math.PI * f * h * t + h) / (h * 1.3); x[i] += 0.12 * env * s; } }
  const clicks = [], plops = [];
  for (let k = 0; k < 7; k++) { const t = syl[k * 2 + 1][1] + 0.12, i0 = Math.round(t * sr); clicks.push(i0); for (let i = 0; i < 40; i++) x[i0 + i] += 0.3 * rnd() * 2 * Math.exp(-i / 10); }
  for (let k = 0; k < 5; k++) { const t = syl[k * 3 + 2][0], i0 = Math.round(t * sr), L = Math.round(0.045 * sr); plops.push(i0); for (let i = 0; i < L; i++) x[i0 + i] += 0.45 * Math.sin(Math.PI * i / L); }
  const q = new Int16Array(n); for (let i = 0; i < n; i++) q[i] = Math.max(-32768, Math.min(32767, Math.round(x[i] * 32767)));
  return {sr, q, clicks, plops};
}
const T = take();

async function page(b, k, w, h) {
  const p = await b.newPage({viewport: {width: w || 428, height: h || 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  p.errs = []; p.on('pageerror', e => p.errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/abspann-logo|404/.test(m.text())) p.errs.push(m.text()); });
  p.on('requestfailed', r => { if (!/abspann-logo/.test(r.url())) p.errs.push('req ' + r.url()); });
  await p.goto('http://127.0.0.1:' + PORT + '/' + k + '/index.html'); await p.waitForTimeout(1500);
  p.run = (fn, arg) => p.evaluate('(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)); return (' + fn.toString() + ')(' + JSON.stringify(arg == null ? null : arg) + '); })()');
  // Mess-Helfer in die Seite
  await p.run(async o => {
    window.__vxm = {
      h(y) { const u = new Uint8Array(y.buffer, y.byteOffset, y.byteLength); let s = 0x811c9dc5; for (let i = 0; i < u.length; i++) { s ^= u[i]; s = Math.imul(s, 0x01000193) >>> 0; } return s.toString(16); },
      db: v => +(10 * Math.log10(v + 1e-20)).toFixed(2),
      click(y, P) { let e = 0; for (const p of P) { let m = 0; for (let i = p - 20; i < p + 60; i++) { const d = y[i] - y[i - 1]; if (d * d > m) m = d * d; } e += m; } return this.db(e / P.length); },
      plop(y, P, sr) { let e = 0; const a = Math.exp(-2 * Math.PI * 120 / sr); for (const p of P) { let z1 = 0, z2 = 0; for (let i = p - 2000; i < p + Math.round(0.06 * sr); i++) { z1 = a * z1 + (1 - a) * y[i]; z2 = a * z2 + (1 - a) * z1; if (i >= p) e += z2 * z2; } } return this.db(e / P.length); },
      hum(y, sr) { const c = 2 * Math.cos(2 * Math.PI * 50 / sr); let p1 = 0, p2 = 0; for (let i = 0; i < y.length; i++) { const s = y[i] + c * p1 - p2; p2 = p1; p1 = s; } return this.db((p1 * p1 + p2 * p2 - c * p1 * p2) / y.length / y.length); },
      diff(a, b) { let e = 0; for (let i = 0; i < a.length; i++) { const d = a[i] - b[i]; e += d * d; } return e / a.length; },
    };
  });
  return p;
}
async function inject(p) {
  return p.run(async o => { const s = atob(o.b), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
    const r = await SYNQUENZER.tkInject({pcm: Array.from(new Int16Array(u.buffer)), sr: o.sr, scene: 0, at: 0, len: 2}); await wait(400); window.__tk0 = r; return r.id; }, {b: Buffer.from(T.q.buffer).toString('base64'), sr: T.sr});
}
async function sheet(p) { await p.run(async () => { if (!(UI.pop && UI.pop.name === 'takes')) { const r = window.__tk0; tkSheet({t: r.track, s: r.scene}); } await wait(500); }); }
const center = async (p, sel) => p.run(async s => { const e = UI.pop.el.querySelector(s); if (!e) return null; e.scrollIntoView({block: 'center'}); await wait(150); const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; }, sel);
async function tapSel(p, sel) { const r = await center(p, sel); if (!r) return false; await p.touchscreen.tap(r.x + r.w / 2, r.y + r.h / 2); await p.waitForTimeout(250); return true; }
// Regler per Fingertipp auf Prozent-Stelle (Daumen-Mitte bei Rand ± 8 px)
async function tapRange(p, sel, pct) { const r = await center(p, sel); if (!r) return null; const x = r.x + 8 + (r.w - 16) * pct / 100; await p.touchscreen.tap(x, r.y + r.h / 2); await p.waitForTimeout(300); return p.run(async s => +UI.pop.el.querySelector(s).value, sel); }
async function probe(p) { await tapSel(p, '[data-vr1="mittel"]'); const t0 = Date.now(); while (Date.now() - t0 < 30000) { const s = await p.run(async () => { const e = document.querySelector('.vr1st'); return e ? e.textContent : ''; }); if (/Befund/.test(s)) return s; await p.waitForTimeout(250); } return null; }
async function applyWait(p, id) {
  const r0 = await p.run(async () => SYNQUENZER.vr1Ver(window.__tk0.id).renders);
  await tapSel(p, '[data-vr1a="ap"]');
  const t0 = Date.now(); while (Date.now() - t0 < 40000) {
    const r = await p.run(async o => { try { window.__vr1.proc(window.__tk0.id, null); } catch (e) {} const v = SYNQUENZER.vr1Ver(window.__tk0.id); if (!v.ready || v.busy || v.renders <= o) return null;
      const id = window.__tk0.id, c = window.__vr1.st.ver.get(id), y = c.buf.getChannelData(0), x = tkBuffer(id).getChannelData(0), M = window.__vxm, sr = c.buf.sampleRate;
      return {hash: M.h(y), same: M.h(y) === M.h(x), click: M.click(y, o.C), plop: M.plop(y, o.P, sr), hum: M.hum(y, sr), diff: M.diff(y, x), weg: (() => { const w = c.wg; if (!w) return null; let e = 0; for (let i = 0; i < w.q.length; i++) { const v = w.q[i] / w.s; e += v * v; } return e / w.q.length; })(), cl: S.takes[id].cl | 0, vr1: JSON.parse(JSON.stringify(S.takes[id].vr1)), ap: document.querySelector('[data-vr1a="ap"]').textContent}; }, {C: T.clicks, P: T.plops, n: r0});
    if (r) return r; await p.waitForTimeout(300);
  }
  return null;
}

(async () => {
  await sleep(600);
  const b = await chromium.launch();
  try {
    // ---------- A) Kern: alt (4.88) gegen neu, gleiche Spur ----------
    const pa = await page(b, 'alt'), pn = await page(b, 'neu');
    const core = async (p, sets) => p.run(async o => { const id = window.__tk0.id, x = tkBuffer(id).getChannelData(0), sr = tkBuffer(id).sampleRate, K = window.__vr1.make(), M = window.__vxm;
      const B = K.done(K.check(x, sr)), A = K.assist(B, 'mittel'), out = {line: B.line, found: A.found, steps: Object.keys(A.steps)};
      const raw = {click: M.click(x, o.C), plop: M.plop(x, o.P, sr), hum: M.hum(x, sr)}; out.raw = raw;
      for (const [nm, mix] of o.sets) { const st = JSON.parse(JSON.stringify(A.steps)); for (const k in st) { const v = mix[k] != null ? mix[k] : mix['*']; if (v != null) st[k].vxa = v; }
        const r = K.done(K.run(x, sr, {steps: st, weg: true})); out[nm] = {hash: M.h(r.y), same: M.h(r.y) === M.h(x), click: M.click(r.y, o.C), plop: M.plop(r.y, o.P, sr), hum: M.hum(r.y, sr), diff: M.diff(r.y, x), wg: M.h(r.wg)}; }
      return out; }, {C: T.clicks, P: T.plops, sets});
    await inject(pa); await inject(pn);
    const ca = await core(pa, [['std', {}]]);
    const cn = await core(pn, [['std', {}], ['g0', {'*': 0}], ['g50', {'*': 0.5}], ['g100', {'*': 1}], ['k0', {click: 0}], ['ohneHp', {hp: 0}], ['p0', {plop: 0, hp: 0}], ['h0', {hum: 0, hp: 0}]]);
    R.kern = {alt: ca, neu: cn};
    console.log('INFO Befund: ' + cn.line + ' · Schritte ' + cn.steps.join(',') + ' · roh Klick ' + cn.raw.click + ' dB, Stoß ' + cn.raw.plop + ' dB, Brumm ' + cn.raw.hum + ' dB');
    ok(cn.found.includes('click') && cn.found.includes('plop') && cn.found.includes('hum'), 'Spur: Klicks, Plopps und Brummen werden gefunden', cn.found);
    ok(ca.std.hash === cn.std.hash && ca.std.wg === cn.std.wg && cn.g100.hash === cn.std.hash, 'Standard (100 %) bitgleich wie 4.88 (Ergebnis und „nur Entferntes“)', [ca.std.hash, cn.std.hash, cn.g100.hash]);
    ok(cn.g0.same && cn.g0.diff === 0, 'Gesamt 0 %: Signal unverändert (bitgleich)', cn.g0.hash);
    const q = cn.g50.diff / cn.std.diff;
    ok(cn.g50.click > cn.std.click + 3 && cn.g50.click < cn.raw.click - 1 && q > 0.15 && q < 0.6, 'Gesamt 50 %: messbar zwischen roh und voll', {klick: [cn.raw.click, cn.g50.click, cn.std.click], abweichungAnteil: +q.toFixed(3)});
    ok(Math.abs(cn.k0.click - cn.raw.click) < 1.5 && Math.abs(cn.k0.plop - cn.std.plop) < 0.5 && Math.abs(cn.k0.hum - cn.std.hum) < 0.5, 'Klicks 0 %: Klicks bleiben, Plopps/Brummen wie voll', {klick: [cn.raw.click, cn.k0.click, cn.std.click], stoss: [cn.k0.plop, cn.std.plop], brumm: [cn.k0.hum, cn.std.hum]});
    // Hochpass 80 Hz nimmt selbst viel vom tiefen Stoß und vom 50-Hz-Brumm: Vergleich daher mit Hochpass 0 % (beides)
    const o = cn.ohneHp;
    ok(cn.p0.plop > o.plop + 6 && Math.abs(cn.p0.plop - cn.raw.plop) < 3 && Math.abs(cn.p0.hum - o.hum) < 0.5 && cn.p0.click < cn.raw.click - 30, 'Plopps 0 %: Stöße bleiben (Stoß-Rest ≈ roh), Brummen wie sonst, Klicks bleiben entfernt', {stoss: [cn.raw.plop, cn.p0.plop, o.plop], brumm: [cn.p0.hum, o.hum], klick: [cn.p0.click, o.click]});
    ok(Math.abs(cn.h0.hum - cn.raw.hum) < 1.5 && o.hum < cn.raw.hum - 15 && Math.abs(cn.h0.plop - o.plop) < 1.5 && cn.h0.click < cn.raw.click - 30, 'Brummen 0 %: Brumm bleibt (≈ roh), Stöße wie sonst, Klicks bleiben entfernt', {brumm: [cn.raw.hum, cn.h0.hum, o.hum], stoss: [cn.h0.plop, o.plop], klick: [cn.h0.click, o.click]});

    // ---------- B) App per Fingertipp ----------
    // B1: Standard über Blatt anwenden: alt und neu gleiche Fassung
    await sheet(pa); await sheet(pn);
    if (FOTO) { await probe(pa); await tapSel(pa, '[data-vr1a="more"]'); await center(pa, '.vr1'); await pa.screenshot({path: path.join(D, 'foto-vorher.png')}); }
    else await probe(pa);
    const s1 = await probe(pn);
    if (FOTO) { await tapSel(pn, '[data-vr1a="more"]'); await center(pn, '.vr1'); await pn.screenshot({path: path.join(D, 'foto-nachher.png')}); await tapSel(pn, '[data-vr1a="more"]'); }
    const G = await pn.run(async () => { const p = UI.pop.el, r = p.querySelector('input.vxrrr[data-vxrr="g"]'), lab = r && r.closest('.clrow').querySelector('.cllab'); const b = r && r.getBoundingClientRect();
      return {da: !!r, wert: r && +r.value, text: lab && lab.textContent, h: b && Math.round(b.height), schritte: [...p.querySelectorAll('input.vxrrr')].length}; });
    ok(G.da && G.wert === 100 && G.text === 'Gesamt 100 %' && G.h >= 32 && G.schritte === 8, 'Blatt: Regler „Gesamt 100 %“ + 7 Schritt-Regler, Trefferhöhe ≥ 32 px', G);
    const aA = await applyWait(pa), aN = await applyWait(pn);
    ok(aA && aN && aA.hash === aN.hash && !aN.vr1.vxrr && JSON.stringify(aA.vr1) === JSON.stringify(aN.vr1) && aA.cl === aN.cl, 'App: Anwenden mit Standard-Reglern = 4.88 (Fassung bitgleich, gespeicherter Stand gleich)', {alt: aA && aA.hash, neu: aN && aN.hash, cl: [aA && aA.cl, aN && aN.cl]});
    // B2: Gesamt per Tipp auf 0 % → Anwenden → Fassung = Roh (Säubern bleibt aus)
    await pn.run(async () => { const id = window.__tk0.id; clSet(id, 0); await wait(200); for (let i = 0; i < 200; i++) { try { window.__vr1.proc(id, null); } catch (e) {} const v = SYNQUENZER.vr1Ver(id); if (v.ready && !v.busy) break; await wait(150); } });
    const v0 = await tapRange(pn, 'input.vxrrr[data-vxrr="g"]', 0);
    const lab0 = await pn.run(async () => ({ap: document.querySelector('[data-vr1a="ap"]').textContent, lab: document.querySelector('b.vxrrv[data-vxrr="g"]').textContent}));
    ok(v0 === 0 && lab0.lab === '0 %' && lab0.ap === 'Anwenden', 'Tipp auf den Regler: Gesamt 0 %, Knopf zeigt wieder „Anwenden“', {wert: v0, lab0});
    const g0 = await applyWait(pn);
    ok(g0 && g0.same && g0.cl === 0 && g0.vr1.vxrr && g0.vr1.vxrr.g === 0 && g0.ap === '✓ angewandt', 'App Gesamt 0 %: neue Fassung = unverändertes Signal (bitgleich), wird mit dem Take gemerkt', g0 && {gleich: g0.same, cl: g0.cl, vxrr: g0.vr1.vxrr, ap: g0.ap});
    // B3: Gesamt 50 %
    await pn.run(async () => { clSet(window.__tk0.id, 0); await wait(200); });
    const v50 = await tapRange(pn, 'input.vxrrr[data-vxrr="g"]', 50);
    const g5 = await applyWait(pn);
    ok(v50 === 50 && g5 && g5.click > aN.click + 3 && g5.click < cn.raw.click - 1 && g5.weg > 0.1 * aN.weg && g5.weg < 0.6 * aN.weg && g5.cl === 30, 'App Gesamt 50 %: Fassung messbar zwischen roh und voll (Entferntes kleiner, Säubern 60 → 30 %)', g5 && {wert: v50, klick: [cn.raw.click, g5.click, aN.click], entferntesAnteil: +(g5.weg / aN.weg).toFixed(3), cl: g5.cl});
    // B4: Mehr ▾ → Klicks 0 % (Gesamt zurück auf 100 %)
    await tapRange(pn, 'input.vxrrr[data-vxrr="g"]', 100);
    await pn.run(async () => { clSet(window.__tk0.id, 0); await wait(200); });
    await tapSel(pn, '[data-vr1a="more"]');
    const vk = await tapRange(pn, 'input.vxrrr[data-vxrr="click"]', 0);
    const k0 = await applyWait(pn);
    ok(vk === 0 && k0 && Math.abs(k0.click - cn.raw.click) < 1.5 && Math.abs(k0.plop - aN.plop) < 0.5 && Math.abs(k0.hum - aN.hum) < 0.5, 'App Klicks 0 %: nur die Klicks bleiben, Stoß-Rest und Brumm wie voll', k0 && {wert: vk, klick: [cn.raw.click, k0.click, aN.click], stoss: [k0.plop, aN.plop], brumm: [k0.hum, aN.hum]});
    // B5: Laden: Regler-Stand übersteht das Normalisieren beim Laden; alter Stand ohne Regler bleibt ohne
    const L = await pn.run(async () => { const f = tkExt().take, a = {vr1: {lv: 'mittel', steps: {click: {sens: 4, vxa: 0}}, br: [], vxrr: {g: 1, a: {click: 0}}}}, o1 = {}, b = {vr1: {lv: 'mittel', steps: {click: {sens: 4}}, br: []}}, o2 = {};
      for (const h of f) { try { h(a, o1); } catch (e) {} try { h(b, o2); } catch (e) {} } return {mit: o1.vr1 && o1.vr1.vxrr, ohne: o2.vr1 && ('vxrr' in o2.vr1), vxa: o1.vr1 && o1.vr1.steps.click.vxa}; });
    ok(L.mit && L.mit.a.click === 0 && L.ohne === false && L.vxa === 0, 'Laden: Regler-Stand bleibt erhalten, alte Projekte ohne Regler unverändert', L);
    // B6: Aussehen hochkant/quer: im Rahmen, keine Überlappung, kein abgeschnittener Text
    const geo = async () => pn.run(async () => { const p = UI.pop.el, pr = p.getBoundingClientRect(), rows = [...p.querySelectorAll('.vr1 .clrow')].filter(e => e.offsetParent);
      const bad = []; for (const r of rows) { const b = r.getBoundingClientRect(), lab = r.querySelector('.cllab'), inp = r.querySelector('input,.clab'); if (b.left < pr.left - 1 || b.right > pr.right + 1) bad.push('rahmen ' + lab.textContent); if (lab.scrollWidth > lab.clientWidth + 1) bad.push('text ' + lab.textContent);
        if (inp) { const l = lab.getBoundingClientRect(), i = inp.getBoundingClientRect(); if (l.right > i.left + 1) bad.push('überlappt ' + lab.textContent); if (i.height < 32) bad.push('klein ' + lab.textContent); } }
      for (let i = 1; i < rows.length; i++) { const a = rows[i - 1].getBoundingClientRect(), c = rows[i].getBoundingClientRect(); if (c.top < a.bottom - 1 && c.left < a.right && a.left < c.right) bad.push('zeilen ' + i); }
      return {zeilen: rows.length, bad, popIn: pr.left >= 0 && pr.right <= innerWidth + 1, scrollX: document.documentElement.scrollWidth > innerWidth + 1}; });
    const g1 = await geo();
    ok(g1.bad.length === 0 && g1.popIn && !g1.scrollX && g1.zeilen >= 10, 'Hochkant 428×926: alles im Rahmen, nichts überlappt/abgeschnitten', g1);
    await pn.setViewportSize({width: 926, height: 428}); await pn.waitForTimeout(600); await sheet(pn); await pn.run(async () => { await wait(300); });
    if (!(await pn.run(async () => { const m = document.querySelector('.vr1more'); return m && !m.hidden; }))) await tapSel(pn, '[data-vr1a="more"]');
    const g2 = await geo();
    ok(g2.bad.length === 0 && g2.popIn && !g2.scrollX, 'Quer 926×428: alles im Rahmen, nichts überlappt/abgeschnitten', g2);
    if (FOTO) { await center(pn, '.vxrrg'); await pn.screenshot({path: path.join(D, 'foto-nachher-quer.png')}); }
    ok(pa.errs.length === 0 && pn.errs.length === 0, 'keine Seitenfehler / console.error', {alt: pa.errs.slice(0, 3), neu: pn.errs.slice(0, 3)});
  } finally { await b.close(); srv.kill(); }
  fs.writeFileSync(path.join(D, 'vxrr-test.json'), JSON.stringify(R, null, 1));
  console.log(`ERGEBNIS ${okN}/${okN + badN}`);
  process.exit(badN ? 1 : 0);
})().catch(e => { console.error(e); srv.kill(); process.exit(2); });
