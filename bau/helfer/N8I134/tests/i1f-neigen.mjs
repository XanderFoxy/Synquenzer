// I1f NEIGEN (Nachtrag 8 B.1 §6.7, Abnahme I1-60 … I1-67 mit A.8 H2) in Chromium: Touch-Emulation, CDP-Sensor (M-NEIG).
// node tests/i1f-neigen.mjs            → baut eine frische Kopie (.t-neigen.html) aus index.html + src/, löscht sie am Ende
// I1F_APP=index.html node tests/i1f-neigen.mjs → prüft die eingecheckte Seite
import {createRequire} from 'module'; import {execFileSync} from 'child_process';
import http from 'http'; import fs from 'fs'; import path from 'path'; import {fileURLToPath} from 'url';
const require_ = createRequire(import.meta.url);
let PW; try { PW = require_('playwright'); } catch (e) { PW = require_('/opt/node22/lib/node_modules/playwright'); }
const HERE = path.dirname(fileURLToPath(import.meta.url)), I3U = path.resolve(HERE, '..'), ROOT = path.resolve(I3U, '../../..');
const sleep = ms => new Promise(r => setTimeout(r, ms));
let appName = process.env.I1F_APP, built = false;
if (!appName) { appName = '.t-neigen.html'; execFileSync('node', [path.join(I3U, 'mk.mjs'), '--out', path.join(I3U, appName)]); built = true; }
const MIME = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2', '.wasm': 'application/wasm', '.webmanifest': 'application/manifest+json'};
const serve = port => http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  if (u === '/frame.html') {   // a small page with the NEIGEN source and a button (for the iframe cases)
    r.setHeader('content-type', 'text/html');
    return r.end('<!doctype html><meta charset="utf-8"><button id="nb" style="width:140px;height:64px">N</button><script src="/bau/helfer/I3U/src/neigen.js"></script><script>document.getElementById("nb").addEventListener("click",()=>{window.__st=NEIGEN.tap();});</script>');
  }
  if (u.startsWith('/host-')) {   // a page that embeds frame.html from origin `port`
    const fp = u.slice(6, -5); r.setHeader('content-type', 'text/html');
    return r.end(`<!doctype html><iframe id="f" src="http://${fp === 'x' ? '127.0.0.1:' + PB : 'localhost:' + PA}/frame.html" style="width:300px;height:200px"></iframe>`);
  }
  const fp = path.join(ROOT, u); if (!fp.startsWith(ROOT) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { r.statusCode = 404; return r.end(); }
  r.setHeader('content-type', MIME[path.extname(fp)] || 'application/octet-stream'); fs.createReadStream(fp).pipe(r);
});
const PA = 8731, PB = 8732, sA = serve(PA).listen(PA), sB = serve(PB).listen(PB);
let fail = 0, n = 0; const ok = (c, m) => { n++; console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; return c; };

// rotation helpers (device → earth, W3C Z-X'-Y'')
const D = Math.PI / 180;
const mul = (A, B) => { const C = new Array(9).fill(0); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) C[i * 3 + j] += A[i * 3 + k] * B[k * 3 + j]; return C; };
const axis = (k, deg) => { const [x, y, z] = k, c = Math.cos(deg * D), s = Math.sin(deg * D), C = 1 - c;
  return [c + x * x * C, x * y * C - z * s, x * z * C + y * s, y * x * C + z * s, c + y * y * C, y * z * C - x * s, z * x * C - y * s, z * y * C + x * s, c + z * z * C]; };
const eul = (a, b, g) => mul(mul(axis([0, 0, 1], a), axis([1, 0, 0], b)), axis([0, 1, 0], g));
const rightOf = ang => [Math.cos(ang * D), -Math.sin(ang * D), 0], upOf = ang => [Math.sin(ang * D), Math.cos(ang * D), 0];
const away = (ang, deg) => axis(rightOf(ang), -deg);     // top edge away from the body by deg
function quat(R) {   // rotation matrix → quaternion {x,y,z,w}
  const t = R[0] + R[4] + R[8]; let w, x, y, z;
  if (t > 0) { const s = Math.sqrt(t + 1) * 2; w = s / 4; x = (R[7] - R[5]) / s; y = (R[2] - R[6]) / s; z = (R[3] - R[1]) / s; }
  else if (R[0] > R[4] && R[0] > R[8]) { const s = Math.sqrt(1 + R[0] - R[4] - R[8]) * 2; w = (R[7] - R[5]) / s; x = s / 4; y = (R[1] + R[3]) / s; z = (R[2] + R[6]) / s; }
  else if (R[4] > R[8]) { const s = Math.sqrt(1 + R[4] - R[0] - R[8]) * 2; w = (R[2] - R[6]) / s; x = (R[1] + R[3]) / s; y = s / 4; z = (R[5] + R[7]) / s; }
  else { const s = Math.sqrt(1 + R[8] - R[0] - R[4]) * 2; w = (R[3] - R[1]) / s; x = (R[2] + R[6]) / s; y = (R[5] + R[7]) / s; z = s / 4; }
  return {x, y, z, w};
}
// seeded noise
let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

const br = await PW.chromium.launch();
async function appPage(o = {}) {
  const ctx = await br.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  await ctx.grantPermissions(['accelerometer', 'gyroscope', 'magnetometer']);
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  const c = await ctx.newCDPSession(p);
  let sensor = 'emu';
  if (o.sensor !== false) {
    try { await c.send('Emulation.setSensorOverrideEnabled', {enabled: true, type: 'relative-orientation'}); }
    catch (e) { sensor = 'dor'; }
  }
  await p.goto(`http://localhost:${PA}/bau/helfer/I3U/${appName}`);
  await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 30000});
  await p.evaluate(() => {
    if (typeof srLoad === 'function') srLoad();
    if (typeof NEIGEN === 'undefined') { const s = document.createElement('script'); s.textContent = document.getElementById('sq-sr-src').textContent; document.head.appendChild(s); s.remove(); }
    window.__N = NEIGEN;
    // test field (invisible to the app: only this test creates it)
    const b = document.createElement('div'); b.id = 'tN'; b.style.cssText = 'position:fixed;left:20px;top:300px;width:140px;height:64px;z-index:99999;background:#333';
    document.body.appendChild(b); NEIGEN.attach(b);
    b.addEventListener('click', () => { window.__tapSt = NEIGEN.tap(); });
    b.addEventListener('click', () => { window.__ck = true; }, true);                       // in the click dispatch …
    document.addEventListener('click', () => { window.__ck = false; });                     // … and not after it
    window.__hand = []; NEIGEN.hooks.get = () => window.__x0; window.__x0 = .5;
    NEIGEN.hooks.hand = (x, ph) => { window.__hand.push([ph, x, performance.now()]); window.__x0 = x; };
    window.__hap = []; const H0 = window.haptic;
    window.haptic = function (k) { window.__hap.push([k, (new Error().stack || '').slice(0, 400)]); return H0 && H0.apply(this, arguments); };
  });
  const S = {R: eul(0, 40, 0), noise: 0, ang: 0, run: true, n: 0};
  const send = async () => {
    let R = S.R; if (S.noise) R = mul(R, mul(axis([1, 0, 0], (rnd() * 2 - 1) * S.noise), axis([0, 1, 0], (rnd() * 2 - 1) * S.noise)));
    else R = mul(R, axis([0, 0, 1], (S.n & 1) * 1e-4));      // events only come on a change
    S.n++;
    if (sensor === 'emu') await c.send('Emulation.setSensorOverrideReadings', {type: 'relative-orientation', reading: {quaternion: quat(R)}});
    else { const [a, b, g] = (() => { let cb = Math.hypot(R[6], R[8]); if (R[8] < 0) cb = -cb; let a = Math.atan2(-R[1] / cb, R[4] / cb) / D; if (a < 0) a += 360; return [a, Math.atan2(R[7], cb) / D, Math.atan2(-R[6] / cb, R[8] / cb) / D]; })();
      await c.send('DeviceOrientation.setDeviceOrientationOverride', {alpha: a, beta: b, gamma: g}); }
  };
  const loop = (async () => { while (S.run) { if (o.sensor !== false && !S.pause) { try { await send(); } catch (e) {} } await sleep(16); } })();
  const box = await p.evaluate(() => { const r = document.getElementById('tN').getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; });
  const touch = async (type) => c.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x: box.x, y: box.y, id: 1}]});
  const tap = async () => { await touch('touchStart'); await sleep(40); await touch('touchEnd'); await sleep(60); };
  const orient = async ang => c.send('Emulation.setDeviceMetricsOverride', {width: ang % 180 ? 926 : 428, height: ang % 180 ? 428 : 926, deviceScaleFactor: 1, mobile: true,
    screenOrientation: {type: {0: 'portraitPrimary', 90: 'landscapePrimary', 180: 'portraitSecondary', 270: 'landscapeSecondary'}[ang], angle: ang}});
  // a ramp of the sensor from the current matrix by `fn(k)` over `ms`
  const ramp = async (from, fn, ms = 240) => { const steps = Math.round(ms / 16); for (let k = 1; k <= steps; k++) { S.R = mul(from, fn(k / steps)); await sleep(16); } };
  const N = (f, ...a) => p.evaluate(f, ...a);
  return {ctx, p, c, S, tap, touch, orient, ramp, N, errs, sensor, close: async () => { S.run = false; await loop; await ctx.close(); }};
}

try {
  // ---------- I1-60 permission ----------
  {
    const A = await appPage();
    console.log('Sensor-Weg:', A.sensor === 'emu' ? 'Emulation.setSensorOverrideReadings (relative-orientation, Quaternion)' : 'DeviceOrientation.setDeviceOrientationOverride');
    const mock = r => A.N(r => { window.__perm = []; DeviceOrientationEvent.requestPermission = () => { window.__perm.push(window.__ck === true); return r === 'throw' ? Promise.reject(new Error('x')) : Promise.resolve(r); }; __N._reset(); __N.hooks.get = () => window.__x0; }, r);
    await mock('granted'); await A.tap(); await sleep(50);
    let s = await A.N(() => ({st: __N.state(), perm: window.__perm, ret: window.__tapSt}));
    ok(s.perm.length === 1 && s.perm[0] === true && s.st.st === 'ok' && s.st.txt === 'Daumen halten und kippen',
      `I1-60 'granted': requestPermission ${s.perm.length}× gerufen, synchron im click-Handler = ${s.perm[0]}, Zustand ${s.st.st} „${s.st.txt}“`);
    await mock('denied'); await A.tap(); await sleep(50);
    s = await A.N(() => ({st: __N.state(), perm: window.__perm}));
    ok(s.perm[0] === true && s.st.st === 'denied' && s.st.txt === 'Bewegung nicht erlaubt. Safari merkt sich das – Tab schließen und die Seite neu öffnen; hilft das nicht, Safari ganz beenden.' && !/daten/i.test(s.st.txt),
      `I1-60 'denied': grau „${s.st.txt}“ (kein Hinweis auf Website-Daten: ${!/daten/i.test(s.st.txt)})`);
    await mock('throw'); await A.tap(); await sleep(50);
    s = await A.N(() => __N.state()); ok(s.st === 'denied', `I1-60 Fehler beim Fragen → ${s.st}`);
    // no API and a real sensor → ok
    await A.N(() => { delete DeviceOrientationEvent.requestPermission; __N._reset(); __N.tap(); }); await A.p.waitForFunction(() => __N.state().st !== 'asking', null, {timeout: 2000});
    s = await A.N(() => __N.state()); ok(s.st === 'ok', `I1-60 ohne API, Ereignis mit Werten binnen 500 ms → ${s.st}`);
    await A.close();
    // no API and no event at all (no sensor override; listeners swallowed so that no event can arrive)
    const B = await appPage({sensor: false});
    // no API, a null event (a desktop browser without a sensor sends one)
    await B.N(() => { delete DeviceOrientationEvent.requestPermission; __N._reset(); });
    const t0 = Date.now();
    await B.N(() => { window.__tapSt = __N.tap(); setTimeout(() => window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', {alpha: null, beta: null, gamma: null})), 50); });
    await B.p.waitForFunction(() => __N.state().st !== 'asking', null, {timeout: 2000});
    s = await B.N(() => __N.state());
    ok(s.st === 'nosensor' && s.txt === 'Kein Bewegungssensor', `I1-60 ohne API, Ereignis beta = gamma = null → „${s.txt}“ nach ${Date.now() - t0} ms`);
    await B.N(() => { delete DeviceOrientationEvent.requestPermission; __N._reset(); const ae = window.addEventListener; window.addEventListener = function (t, f, o) { if (t === 'deviceorientation') return; return ae.call(this, t, f, o); }; });
    const t1 = Date.now(); await B.N(() => __N.tap()); await B.p.waitForFunction(() => __N.state().st !== 'asking', null, {timeout: 2000});
    s = await B.N(() => __N.state()); ok(s.st === 'nosensor' && s.txt === 'Kein Bewegungssensor', `I1-60 ohne API, kein Ereignis in 500 ms → „${s.txt}“ nach ${Date.now() - t1} ms`);
    await B.close();
    // iframes
    const ctx = await br.newContext({hasTouch: true, isMobile: true}); const p = await ctx.newPage();
    for (const [h, want, nm] of [['x', 'iframe', 'Cross-Origin-iframe'], ['s', null, 'gleicher Ursprung (Gegenprobe)']]) {
      await p.goto(`http://localhost:${PA}/host-${h}.html`); const fr = await (await p.$('#f')).contentFrame(); await fr.waitForFunction(() => typeof NEIGEN === 'object');
      await fr.tap('#nb'); await sleep(80);
      const st = await fr.evaluate(() => NEIGEN.state());
      ok(want ? st.st === want && st.txt === 'Neigen geht nur auf der Webseite in Safari' : st.st !== 'iframe', `I1-60 ${nm}: Zustand ${st.st}${st.txt ? ' „' + st.txt + '“' : ''}`);
    }
    await ctx.close();
  }
  // ---------- I1-61 … I1-67 with the sensor ----------
  {
    const A = await appPage(); const N = A.N;
    await N(() => { DeviceOrientationEvent.requestPermission = () => Promise.resolve('granted'); __N._reset(); __N.hooks.get = () => window.__x0; window.__x0 = .5; });
    await A.tap(); await sleep(50); await N(() => __N.open()); await sleep(100);
    const st0 = await N(() => __N.info()); ok(st0.listeners === 1 && st0.listening, `I1-66 Feld offen + Erlaubnis → Hörer ${st0.listeners}`);
    const hold = async (fn, opt = {}) => { await N(() => { window.__hand = []; window.__x0 = window.__x0 == null ? .5 : window.__x0; }); await A.touch('touchStart'); await sleep(opt.wait || 120); const r = await fn(); if (!opt.keep) { await A.touch('touchEnd'); await sleep(60); } return r; };
    const xs = () => N(() => window.__hand.map(h => h[1]));
    // I1-61 zero position: beta 40, noise ±0.3°
    A.S.R = eul(20, 40, 0); A.S.noise = .3; await sleep(200);
    await N(() => { window.__x0 = .5; });
    let r = await hold(async () => { const v = []; for (let k = 0; k < 15; k++) { v.push(await N(() => [__N.angle().x, __N.state().ref, __N.info().events])); await sleep(20); } return v; });
    let dev = Math.max(...r.map(x => Math.abs(x[0] - .5)));
    ok(r[r.length - 1][1] && r[r.length - 1][2] - r[0][2] > 5 && dev <= .002, `I1-61 Null-Lage bei beta 40° (Rauschen ±0,3°): ${r[r.length - 1][2] - r[0][2]} Ereignisse, 15 Proben in 300 ms, größte Abweichung ${(dev * 100).toFixed(3)} % (Grenze 0,2 %)`);
    A.S.noise = .2;   // a real sensor never stands still (the browser fires only on a change ≥ 0.1°)
    // I1-62 mapping in 0 / 90 / 270
    for (const ang of [0, 90, 270]) {
      await A.orient(ang); await sleep(150);
      const base = eul(30, 40, 5); A.S.R = base; await sleep(100);
      for (const d of [15, -15]) {
        A.S.R = base; await sleep(80); await N(() => { window.__x0 = .5; });
        r = await hold(async () => { await A.ramp(base, k => away(ang, d * k)); await sleep(300); return N(() => ({x: window.__x0, a: __N.angle()})); });
        ok(Math.abs(r.x - (.5 + Math.sign(d) * .45)) <= .02, `I1-62 Winkel ${ang}: ${d > 0 ? '+15° (Oberkante weg)' : '−15°'} → x ${r.x.toFixed(4)} (Soll ${(.5 + Math.sign(d) * .45).toFixed(2)} ± 0,02), θ ${r.a.raw.toFixed(2)}°`);
      }
      A.S.R = base; await sleep(80); await N(() => { window.__x0 = .5; });
      r = await hold(async () => { await A.ramp(base, k => away(ang, 15 * k)); const m = mul(base, away(ang, 15)); await A.ramp(m, k => axis(upOf(ang), 20 * k)); await sleep(300); return N(() => window.__x0); });
      ok(Math.abs(r - .5 - .45) <= .03, `I1-62 Winkel ${ang}: +15°, dann 20° um die Hochachse → Δx ${(r - .5).toFixed(4)} (Soll 0,45 ± 0,03)`);
      A.S.R = base; await sleep(80); await N(() => { window.__x0 = .5; });
      r = await hold(async () => { await A.ramp(base, k => axis([0, 0, 1], 20 * k)); await sleep(300); return N(() => window.__x0); });
      ok(Math.abs(r - .5) <= .02, `I1-62 Winkel ${ang}: nur 20° um die Bildschirm-Normale → Δx ${(r - .5).toFixed(4)} (Soll 0 ± 0,02)`);
    }
    await A.orient(0); await sleep(150);
    // clamp
    A.S.R = eul(0, 40, 0); await sleep(80); await N(() => { window.__x0 = .9; });
    r = await hold(async () => { await A.ramp(eul(0, 40, 0), k => away(0, 35 * k)); await sleep(200); return N(() => window.__x0); });
    let r2; A.S.R = eul(0, 40, 0); await sleep(80); await N(() => { window.__x0 = .1; });
    r2 = await hold(async () => { await A.ramp(eul(0, 40, 0), k => away(0, -35 * k)); await sleep(200); return N(() => window.__x0); });
    ok(r === 1 && r2 === 0, `I1-62 Klemme: 0,9 + 35° → ${r}, 0,1 − 35° → ${r2}`);
    // I1-63 no gimbal jump: reference beta 85°, tilt beyond 90°
    const b85 = eul(10, 85, 3); A.S.noise = 0; A.S.R = b85; await sleep(100); await N(() => { window.__x0 = .5; });
    r = await hold(async () => { await A.ramp(b85, k => away(0, -14 * k), 1200); await sleep(150); return N(() => ({h: window.__hand.map(h => h[1]), x: window.__x0})); });
    let mx = 0; for (let k = 1; k < r.h.length; k++) mx = Math.max(mx, Math.abs(r.h[k] - r.h[k - 1]));
    A.S.noise = .2;
    ok(mx <= .02 && r.h.length > 10, `I1-63 Bezug beta 85°, um 14° über 90° hinaus: ${r.h.length} Werte, größter Schritt ${(mx * 100).toFixed(2)} % (Grenze 2 %), Ende x ${r.x.toFixed(3)}`);
    // I1-64 release: position stays, tilting does nothing; new touch = new zero position
    const b0 = eul(0, 40, 0); A.S.R = b0; await sleep(100); await N(() => { window.__x0 = .5; });
    r = await hold(async () => { await A.ramp(b0, k => away(0, 10 * k)); await sleep(200); return N(() => window.__x0); });
    const xr = r; await N(() => { window.__hand = []; }); const m10 = mul(b0, away(0, 10));
    await A.ramp(m10, k => away(0, 10 * k), 500); await sleep(500);
    const after = await N(() => ({h: window.__hand.length, x: window.__x0}));
    ok(after.h === 0 && Math.abs(after.x - xr) <= .002, `I1-64 Loslassen: Stellung ${xr.toFixed(4)} → nach 1 s weiterem Kippen ${after.x.toFixed(4)}, ${after.h} Sendungen`);
    const m20 = mul(m10, away(0, 10));
    r = await hold(async () => { await sleep(200); return N(() => ({x: window.__x0, a: __N.angle(), ref: __N.ref()})); });
    ok(Math.abs(r.x - xr) <= .002 && Math.abs(r.a.raw) < .5, `I1-64 neues Aufsetzen bei +20° = neue Null-Lage: x ${r.x.toFixed(4)}, θ ${r.a.raw.toFixed(2)}°`);
    void m20;
    // I1-65 orientation changes while holding
    A.S.R = b0; await sleep(100); await N(() => { window.__x0 = .5; });
    r = await hold(async () => {
      await A.ramp(b0, k => away(0, 8 * k)); await sleep(100); const x1 = await N(() => window.__x0);
      await A.orient(90); await sleep(150); await A.ramp(mul(b0, away(0, 8)), k => away(90, 10 * k)); await sleep(150);
      return {x1, x2: await N(() => window.__x0), st: await N(() => __N.state()), ends: await N(() => window.__hand.filter(h => h[0] === 'end').length)};
    }, {keep: true});
    await A.touch('touchEnd'); await sleep(60); await A.orient(0); await sleep(150);
    ok(!r.st.holding && r.ends === 1 && Math.abs(r.x2 - r.x1) <= .002, `I1-65 Ausrichtung 0 → 90 beim Halten: Halten endet (end ${r.ends}×), Stellung ${r.x1.toFixed(4)} → ${r.x2.toFixed(4)}`);
    // I1-67 one hold = one start + one end (one undo step with I1c), no haptic from sensor / pointer
    A.S.R = b0; await sleep(100); await N(() => { window.__x0 = .5; window.__hap = []; });
    r = await hold(async () => { await A.ramp(b0, k => away(0, 12 * k), 400); await sleep(100); return 0; });
    const hh = await N(() => ({s: window.__hand.filter(h => h[0] === 'start').length, e: window.__hand.filter(h => h[0] === 'end').length, m: window.__hand.filter(h => h[0] === 'move').length,
      dt: window.__hand.slice(1).map((h, k) => h[2] - window.__hand[k][2]), hap: window.__hap.length}));
    const minDt = Math.min(...hh.dt.slice(1, -1));
    ok(hh.s === 1 && hh.e === 1, `I1-67 ein NEIGEN-Halten: start ${hh.s}×, move ${hh.m}×, end ${hh.e}× (= ein Undo-Schritt bei I1c)`);
    ok(hh.hap === 0, `I1-67/A.8 H2 haptic-Aufrufe aus deviceorientation/pointermove (Spion): ${hh.hap}`);
    ok(minDt >= 14, `Senden ≤ 60/s: kleinster Abstand ${minDt.toFixed(1)} ms`);
    // I1-66 work per event, listeners after close / hidden
    const inf = await N(() => __N.info());
    ok(inf.medianMs <= .2, `I1-66 Arbeit je Ereignis (Median der letzten 64): ${(inf.medianMs * 1000).toFixed(1)} µs (Grenze 200 µs)`);
    await N(() => { Object.defineProperty(document, 'visibilityState', {configurable: true, get: () => 'hidden'}); document.dispatchEvent(new Event('visibilitychange')); });
    const hid = await N(() => __N.info());
    await N(() => { Object.defineProperty(document, 'visibilityState', {configurable: true, get: () => 'visible'}); document.dispatchEvent(new Event('visibilitychange')); });
    const vis = await N(() => __N.info());
    await N(() => __N.close()); const cl = await N(() => __N.info());
    const ev0 = cl.events; await sleep(200); const ev1 = (await N(() => __N.info())).events;
    ok(hid.listeners === 0 && vis.listeners === 1 && cl.listeners === 0 && ev1 === ev0, `I1-66 Hörer: verborgen ${hid.listeners}, wieder sichtbar ${vis.listeners}, nach Schließen ${cl.listeners} (Ereignisse danach ${ev1 - ev0})`);
    ok(A.errs.length === 0, `keine Konsolen-Fehler (${A.errs.length}${A.errs.length ? ': ' + A.errs[0].slice(0, 120) : ''})`);
    await A.close();
  }
} catch (e) { console.log('✗ Abbruch: ' + (e && e.stack || e)); fail++; }
await br.close(); sA.close(); sB.close();
if (built) fs.rmSync(path.join(I3U, appName), {force: true});
console.log(fail ? `FAIL ${fail}/${n}` : `ALL OK ${n}/${n}`); process.exit(fail ? 1 : 0);
