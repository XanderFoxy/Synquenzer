// BM1 Kern-Test: Filter je Note auf einer Bit-Mask-Spur.
// node bm1-test.mjs <port>   (Server: python3 -m http.server <port> im Ordner srv mit index.html = neu, base.html = 4.86.0)
import {createRequire} from 'module';
const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
const port = process.argv[2];
const res = {}, errs = [];
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else fail++; console.log((c ? 'OK   ' : 'FAIL ') + m); };

async function probe(page) {
  return await page.evaluate(async () => {
    const i = S.tracks.findIndex(t => t && t.kind === 'synth');
    // Vorher-Probe: Filter je Note bei noch nicht geladenem Bit-Mask-Teil darf keinen Fehler werfen (VA-Spur)
    let pre = null; try { const c0 = {notes: [{t: 0, d: 1, n: 60, v: .8, fc: 32}]}; pre = lkNoteX(i, c0, c0.notes[0], 0); pre = {ok: true, loaded: typeof bmTrack === 'function', lk: pre && pre.lk}; } catch (e) { pre = {ok: false, e: String(e)}; }
    if (!bmLoad()) throw new Error('bmLoad');
    const snd = deep(factorySound('f-init-bm'));
    snd.p.bm.a.f.cu = 50; snd.p.bm.a.f.re = 20;
    S.tracks[i].sound = snd;
    const mk = (fa, fb) => {
      const a = {t: 0, d: 1, n: 36, v: .8}, b = {t: 2, d: 1, n: 36, v: .8};
      if (fa) a.fc = fa; if (fb) b.fc = fb;
      return {notes: [a, b]};
    };
    const fft = (x) => { // radix-2 Betragsspektrum
      const N = x.length, re = Float64Array.from(x), im = new Float64Array(N);
      for (let k = 0, j = 0; k < N; k++) { if (k < j) { [re[k], re[j]] = [re[j], re[k]]; } let m = N >> 1; while (m >= 1 && j & m) { j ^= m; m >>= 1; } j |= m; }
      for (let s = 2; s <= N; s <<= 1) { const h = s >> 1, a = -2 * Math.PI / s; for (let k = 0; k < N; k += s) for (let q = 0; q < h; q++) { const c = Math.cos(a * q), si = Math.sin(a * q), tr = re[k + q + h] * c - im[k + q + h] * si, ti = re[k + q + h] * si + im[k + q + h] * c; re[k + q + h] = re[k + q] - tr; im[k + q + h] = im[k + q] - ti; re[k + q] += tr; im[k + q] += ti; } }
      const mag = new Float64Array(N / 2); for (let k = 0; k < N / 2; k++) mag[k] = Math.hypot(re[k], im[k]); return mag;
    };
    const sr = 48000;
    const cent = (L, t0) => { const N = 8192, o = Math.round(t0 * sr), x = new Float64Array(N); for (let k = 0; k < N; k++) x[k] = L[o + k] * (0.5 - 0.5 * Math.cos(2 * Math.PI * k / (N - 1)));
      const m = fft(x); let a = 0, b = 0, hi = 0, all = 0; for (let k = 1; k < N / 2; k++) { const f = k * sr / N, p = m[k] * m[k]; a += f * p; b += p; all += p; if (f > 2000) hi += p; }
      return {c: Math.round(a / b), hi: +(hi / all).toFixed(5)}; };
    const hash = (L, R) => { let h = 0x811c9dc5; for (const A of [L, R]) { const u = new Uint8Array(A.buffer, A.byteOffset, A.byteLength); for (let k = 0; k < u.length; k++) { h ^= u[k]; h = Math.imul(h, 16777619); } } return (h >>> 0).toString(16); };
    async function render(clip) {
      const lx = clip.notes.map(nt => lkNoteX(i, clip, nt, nt.t));
      const oc = new OfflineAudioContext(2, Math.round(2.6 * sr), sr);
      await oc.audioWorklet.addModule('data:application/javascript;base64,' + btoa(BM_WK));
      const E = bmTrack(oc, oc.destination, snd);
      const sent = [], post0 = E.node.port.postMessage.bind(E.node.port);
      E.node.port.postMessage = m => { if (m && m.t === 'on') sent.push(JSON.parse(JSON.stringify(m.list))); post0(m); };
      let tap = null; const h0 = E.node.port.onmessage; E.node.port.onmessage = ev => { if (ev.data && ev.data.t === 'tap') tap = ev.data; else h0(ev); };
      E.reset(); E.tempo(120, null, 0);
      post0({t: 'tap', on: true, k: 'ctl', all: true, len: 13 * 20000});
      E.on(1, 36, .8, .05, -1, 0, lx[0] && lx[0].lk); E.off(1, .95);
      E.on(2, 36, .8, 1.25, -1, 0, lx[1] && lx[1].lk); E.off(2, 2.15);
      E.flush();
      oc.suspend(Math.round(2.5 * sr / 128) * 128 / sr).then(() => { post0({t: 'tap', on: false}); oc.resume(); });
      await new Promise(r => setTimeout(r, 20));
      const b = await oc.startRendering(); await new Promise(r => setTimeout(r, 300));
      const L = b.getChannelData(0), R = b.getChannelData(1);
      // Cutoff je Note aus dem Kern-Abgriff (Median im gehaltenen Teil)
      const fcAt = (t0, t1) => { if (!tap) return null; const B = tap.buf, xs = []; for (let k = 0; k + 13 <= B.length; k += 13) { const t = B[k] / sr; if (t >= t0 && t < t1) xs.push(B[k + 9]); } xs.sort((a, b) => a - b); return xs.length ? Math.round(xs[xs.length >> 1]) : null; };
      return {lk: lx.map(x => x && x.lk), sent, A: cent(L, .35), B: cent(R, 1.55), fcA: fcAt(.4, .9), fcB: fcAt(1.6, 2.1), hash: hash(L, R), tapN: tap ? tap.n : 0};
    }
    const out = {pre};
    out.ohne = await render(mk(0, 0));
    out.mit = await render(mk(32, -32));
    out.mit2 = await render(mk(-32, 32));
    // echter Stimmen-Weg im laufenden Programm: lkNoteX -> spawnClipVoice -> Bit-Mask-Engine -> Nachricht an den Kern
    try {
      await (AU.ctx ? Promise.resolve() : (typeof ensureAudio === 'function' ? ensureAudio() : null));
      if (AU.ctx && AU.ctx.state !== 'running') await AU.ctx.resume().catch(() => {});
      applySound(i, snd); if (typeof bmEnsure === 'function') await bmEnsure(); syncEngine(i, true);
      await new Promise(r => setTimeout(r, 300));
      const E = AU.synth[i]; out.live = {bm: !!(E && E.bm), msgs: []};
      if (E && E.bm) {
        const p0 = E.node.port.postMessage.bind(E.node.port);
        E.node.port.postMessage = m => { if (m && m.t === 'on') out.live.msgs.push(JSON.parse(JSON.stringify(m.list))); p0(m); };
        const clip = mk(32, 0); const now = AU.ctx.currentTime;
        clip.notes.forEach((nt, k) => { const lx = lkNoteX(i, clip, nt, nt.t); spawnClipVoice(i, 60, .8, now + .1 + k * .3, .2, k, null, false, undefined, lx); });
        await new Promise(r => setTimeout(r, 900));
      }
    } catch (e) { out.liveErr = String(e && e.stack || e); }
    return out;
  });
}

const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
for (const f of ['base', 'index']) {
  const c = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await c.newPage();
  p.on('pageerror', e => errs.push(f + ' pageerror ' + e));
  p.on('console', m => { if (m.type() === 'error' && !/abspann-logo/.test(m.location().url || '') && !/Failed to load resource/.test(m.text())) errs.push(f + ' ' + m.text()); });
  p.on('response', r => { if (r.status() >= 400 && !/abspann-logo/.test(r.url())) errs.push(f + ' HTTP ' + r.status() + ' ' + r.url()); });
  await p.goto('http://127.0.0.1:' + port + '/' + f + '.html');
  await p.waitForFunction(() => window.SYNQUENZER, null, {timeout: 90000});
  await p.waitForTimeout(2500);
  res[f] = await probe(p);
  await c.close();
}
await b.close();
const N = res.index, B = res.base;
console.log(JSON.stringify({base: {ohne: B.ohne.A, mitA: B.mit.A, mitB: B.mit.B, fcA: B.mit.fcA, hash: [B.ohne.hash, B.mit.hash]},
  neu: {ohne: [N.ohne.A, N.ohne.B, N.ohne.fcA, N.ohne.fcB], mit: [N.mit.A, N.mit.B, N.mit.fcA, N.mit.fcB], mit2: [N.mit2.A, N.mit2.B, N.mit2.fcA, N.mit2.fcB], hash: [N.ohne.hash, N.mit.hash], sent: N.mit.sent, live: N.live, liveErr: N.liveErr}}, null, 1));
ok(N.pre && N.pre.ok && N.pre.loaded === false, 'Filter je Note auf VA vor dem Laden des Bit-Mask-Teils: kein Fehler ' + JSON.stringify(N.pre));
ok(N.ohne.tapN > 0 && N.mit.tapN > 0, 'Kern-Abgriff liefert Werte');
ok(N.ohne.hash === B.ohne.hash, 'ohne Filter-je-Note-Werte: Audio bitgleich zur 4.86.0 (' + N.ohne.hash + ')');
ok(JSON.stringify(N.ohne.sent) === JSON.stringify(B.ohne.sent), 'ohne Werte: Note-an-Nachrichten gleich wie 4.86.0');
ok(B.mit.hash === B.ohne.hash, 'Vorher (4.86.0): Werte wirken auf Bit Mask nicht (Audio gleich)');
ok(N.mit.hash !== N.ohne.hash, 'mit Werten: Audio anders');
ok(N.mit.sent.flat().map(x => x.fc).join() === '24,-24', 'Note-an traegt +24 / -24 Halbtoene (fc +32 / -32)');
ok(N.mit.A.c > N.ohne.A.c * 1.3 && N.mit.B.c < N.ohne.B.c / 1.3, 'Helligkeit: Note +32 heller, Note -32 dunkler (Schwerpunkt ' + N.mit.A.c + ' / ' + N.ohne.A.c + ' / ' + N.mit.B.c + ' Hz)');
ok(N.mit2.A.c < N.ohne.A.c / 1.3 && N.mit2.B.c > N.ohne.B.c * 1.3, 'umgekehrt: Note 1 dunkler, Note 2 heller');
ok(Math.abs(N.mit.fcA / N.ohne.fcA - 4) < .05 && Math.abs(N.mit.fcB / N.ohne.fcB - .25) < .01, 'Cutoff je Stimme x4 / x1/4 = 2^(+-24/12), wie VA (' + N.mit.fcA + ' / ' + N.ohne.fcA + ' / ' + N.mit.fcB + ' Hz)');
ok(N.live && N.live.bm && N.live.msgs.flat().map(x => x.fc === undefined ? 'leer' : x.fc).join() === '24,leer', 'Programm-Weg (lkNoteX -> Stimme -> Kern): Note mit Wert traegt 24, Note ohne Wert ohne Feld');
ok(errs.length === 0, 'keine Seitenfehler / console.error ' + JSON.stringify(errs));
console.log((fail ? 'FAIL' : 'OK') + ' BM1: ' + pass + '/' + (pass + fail) + ' bestanden');
process.exit(fail ? 1 : 0);
