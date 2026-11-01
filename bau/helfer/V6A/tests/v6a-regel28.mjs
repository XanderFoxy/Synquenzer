// Regel 28: ein Projekt ohne Klangzustände klingt wie 4.30.0. (1) Jede Nachricht an die Klang-Engines während eines Offline-Renders
// ist byte-gleich (M-MSG, Spion auf MessagePort.postMessage); (2) der Render weicht nicht mehr ab als 4.30.0 von sich selbst (Chromium
// rechnet den Hall nicht bit-reproduzierbar: zwei Renders desselben Standes unterscheiden sich in der 9. Stelle)
import { chromium } from 'playwright';
import { ok, done, APP, BASE } from './v6a-lib.mjs';
const SPY = () => { const L = window.__msgs = []; const o = MessagePort.prototype.postMessage;
  MessagePort.prototype.postMessage = function (m, t) { try { if (window.__spyOn) L.push(JSON.stringify(m, (k, v) => (ArrayBuffer.isView(v) ? Array.from(v) : v))); } catch (e) {} return o.call(this, m, t); }; };
async function render(file) {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); await p.addInitScript(SPY);
  await p.goto('file://' + file); await p.waitForTimeout(1200);
  const r = await p.evaluate(async () => {
    const Q = window.SYNQUENZER; Q.stop(); try { ensureAudio(); } catch (e) {}
    for (let k = 0; k < 100 && !wkReady(); k++) await new Promise(r => setTimeout(r, 50));
    Q.loadDemo(); await new Promise(r => setTimeout(r, 300));
    const ch = []; for (let s = 0; s < 8; s++) if (S.tracks.some(t => t && t.clips[s])) ch.push({scene: s, bars: 2}); Q.songFromChain(ch.slice(0, 3));
    window.__spyOn = true; const rr = await Q.vvRender({range: {a: 0, b: Math.min(S.song.bars, 6)}}); window.__spyOn = false;
    const L = VV.last.ch[0], Rr = VV.last.ch[1], f = new Float32Array(L.length * 2); for (let k = 0; k < L.length; k++) { f[2 * k] = L[k]; f[2 * k + 1] = Rr[k]; }
    const u8 = new Uint8Array(f.buffer); let s = ''; for (let k = 0; k < u8.length; k += 32768) s += String.fromCharCode.apply(null, u8.subarray(k, k + 32768));
    return {bars: S.song.bars, pcm: btoa(s), msgs: window.__msgs, rms: rr.rms};
  });
  await b.close(); r.errs = errs; r.x = new Float32Array(Buffer.from(r.pcm, 'base64').buffer.slice(0)); delete r.pcm; return r;
}
const dif = (a, b) => { const n = Math.min(a.length, b.length); let e = 0, s = 0, mx = 0; for (let k = 0; k < n; k++) { const d = a[k] - b[k]; e += d * d; s += a[k] * a[k]; if (Math.abs(d) > mx) mx = Math.abs(d); } return {db: 10 * Math.log10((e + 1e-30) / (s + 1e-30)), mx, n: a.length === b.length}; };
const a1 = await render(BASE), a2 = await render(BASE), v1 = await render(APP);
const noise = dif(a1.x, a2.x), dv = dif(a1.x, v1.x);
const mA = a1.msgs.join('\n'), mV = v1.msgs.join('\n');
let fi = -1; for (let k = 0; k < Math.max(a1.msgs.length, v1.msgs.length); k++) if (a1.msgs[k] !== v1.msgs[k]) { fi = k; break; }
ok('R28-0 Song im Demo-Projekt', a1.bars > 0, a1.bars + ' Takte');
ok('R28-1 Nachrichten an die Engines byte-gleich (M-MSG)', mA === mV && a1.msgs.length > 10, a1.msgs.length + ' / ' + v1.msgs.length + ' Nachrichten' + (fi >= 0 ? ' · erste Abweichung #' + fi + ': ' + String(a1.msgs[fi]).slice(0, 120) + ' ↔ ' + String(v1.msgs[fi]).slice(0, 120) : ''));
ok('R28-2 Render gleich lang', dv.n, a1.x.length + ' / ' + v1.x.length);
ok('R28-3 Abweichung V6A ↔ 4.30.0 nicht größer als 4.30.0 ↔ 4.30.0', dv.db <= Math.max(noise.db + 6, -120) && dv.mx <= Math.max(noise.mx * 4, 1e-6), `V6A ${dv.db.toFixed(1)} dB (max ${dv.mx.toExponential(2)}) · Bezug ${noise.db.toFixed(1)} dB (max ${noise.mx.toExponential(2)})`);
ok('R28-4 keine Fehler', !a1.errs.length && !v1.errs.length, [...a1.errs, ...v1.errs].join(' | ').slice(0, 300));
process.exit(done() ? 1 : 0);
