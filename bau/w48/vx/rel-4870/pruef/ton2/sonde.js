// TON2-Sonde (aus TON1): Projekt mit Audio-Take (Original-Spur) anlegen, Seite neu laden, sofort ▶, Pegel ab Start messen.
// node sonde.js <port> [fall: orig|korn] [sek-take] [verz-ms] [amp: 12000=laut, 1500=leise (Begrenzer aktiv)] [alt: 1 = gemerkte Analyse vorher löschen (altes Projekt, erstes Laden)]
const {chromium} = require('playwright');
const port = process.argv[2] || '8851', FALL = process.argv[3] || 'orig', SEK = +(process.argv[4] || 0) || (FALL === 'orig' ? 180 : 3);
const VERZ = +(process.argv[5] || 0), AMP = +(process.argv[6] || 12000), ALT = +(process.argv[7] || 0);
const URL = 'http://127.0.0.1:' + port + '/index.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const TAP = () => {
  const SRC = "class T extends AudioWorkletProcessor{constructor(){super();this.b=new Float32Array(2048);this.k=0;this.f=-1;}process(i){const x=i[0];const n=128;if(this.f<0)this.f=currentFrame;const L=x&&x[0],R=x&&(x[1]||x[0]);for(let j=0;j<n;j++)this.b[this.k++]=L?(L[j]+R[j])*0.5:0;if(this.k>=2048){this.port.postMessage({f:this.f,d:this.b.slice(0)});this.k=0;this.f=-1;}return true;}}registerProcessor('ton1-tap',T);";
  const url = URL.createObjectURL(new Blob([SRC], {type: 'text/javascript'}));
  window.__tap = []; const W = new WeakMap(), oc = AudioNode.prototype.connect;
  const tapOf = c => { let p = W.get(c); if (p) return p; p = c.audioWorklet.addModule(url).then(() => { const t = new AudioWorkletNode(c, 'ton1-tap', {numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1], channelCount: 2, channelCountMode: 'explicit'}); const z = c.createGain(); z.gain.value = 0; oc.call(t, z); oc.call(z, c.destination); t.port.onmessage = e => window.__tap.push(e.data); return t; }); W.set(c, p); return p; };
  AudioNode.prototype.connect = function (d, ...a) { const r = oc.call(this, d, ...a); try { if (d instanceof AudioDestinationNode && typeof AudioContext === 'function' && d.context instanceof AudioContext) { const me = this; tapOf(d.context).then(t => { try { oc.call(me, t); } catch (e) {} }); } } catch (e) {} return r; };
  const AC = window.AudioContext; window.AudioContext = class extends AC { constructor(...a) { super(...a); tapOf(this); } };
  if (window.webkitAudioContext) window.webkitAudioContext = window.AudioContext;
};
(async () => {
  const br = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await br.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const errs = [];
  await ctx.addInitScript(TAP);
  if (VERZ) await ctx.addInitScript(ms => { // langsamer Gerätespeicher: Lesen aus dem Audio-Speicher verzögern
    const g = IDBObjectStore.prototype.get; IDBObjectStore.prototype.get = function (k) { const r = g.call(this, k); if (typeof k === 'string' && /:\d+$/.test(k) && this.name === 'audio') r.__slow = ms; return r; };
    const d = Object.getOwnPropertyDescriptor(IDBRequest.prototype, 'onsuccess');
    Object.defineProperty(IDBRequest.prototype, 'onsuccess', {configurable: true, get() { return d.get.call(this); }, set(fn) { const me = this; d.set.call(this, fn && function (e) { if (me.__slow) setTimeout(() => fn.call(me, e), me.__slow); else fn.call(me, e); }); }});
  }, VERZ);
  const pg = await ctx.newPage();
  pg.on('pageerror', e => errs.push('pageerror ' + e.message));
  pg.on('console', m => { if (m.type() === 'error' && !/abspann-logo|Failed to load resource/.test(m.text())) errs.push('console.error ' + m.text()); });
  await pg.goto(URL, {waitUntil: 'load'});
  await pg.waitForFunction(() => typeof S !== 'undefined' && S.tracks && S.tracks.length && typeof tkAddPcmTake === 'function', null, {timeout: 60000});
  await sleep(1500);
  const setup = await pg.evaluate(async ([fall, sek, amp]) => {
    const sr = 48000, f = 220, n = Math.round(sek * sr), p = new Int16Array(n);
    for (let i = 0; i < n; i++) { const t = i / sr; p[i] = Math.round(amp * (Math.sin(2 * Math.PI * f * t) + .5 * Math.sin(4 * Math.PI * f * t) + .25 * Math.sin(6 * Math.PI * f * t)) / 1.75); }
    const r = tkAddPcmTake(p, sr, 'import'); await r.stored;
    let ti;
    if (fall === 'orig') {
      ti = imp1OrigT(); S.tracks[ti].clips[0] = {len: 8, key: Object.assign({}, S.key), notes: [], audio: tkNormAudio({take: r.id, in: 0, out: sek, at: 0})};
    } else {
      ti = NT(); const nt = newSynthTrack(ti, DEFAULT_SOUNDS[2]); nt.name = 'Korn'; restoreTrack(ti, JSON.stringify(nt));
      applySound(ti, spk7Snd(r.id, {f0: 220}, spk7P(), 'Korn'));
      S.tracks[ti].clips[0] = {len: 2, key: Object.assign({}, S.key), notes: [{t: 0, d: 0.5, n: 57, v: 0.9}, {t: 1, d: 3, n: 57, v: 0.9}]};
    }
    for (let j = 0; j < S.tracks.length; j++) if (j !== ti) S.tracks[j].mute = true;
    saveNow(); return {ti, take: r.id, n: S.tracks.length, clip: JSON.stringify(S.tracks[ti].clips[0]).slice(0, 200)};
  }, [FALL, SEK, AMP]);
  await sleep(1500);
  if (ALT) await pg.evaluate(async take => { await kv.adel(take + ':lv1'); }, setup.take);
  // Neu laden, sofort ▶
  const t0 = Date.now();
  await pg.reload({waitUntil: 'commit'});
  await pg.waitForFunction(() => typeof S !== 'undefined' && S.tracks && S.tracks.length && typeof R !== 'undefined' && document.querySelector('#bPlay') && document.querySelector('#bPlay').getBoundingClientRect().width > 0, null, {timeout: 60000, polling: 5});
  const bp = await pg.evaluate(() => { const r = document.querySelector('#bPlay').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await pg.touchscreen.tap(bp[0], bp[1]);
  const at = await pg.evaluate(take => ({ms: 0, playing: R.playing, st: R.startTime, sr: AU.ctx && AU.ctx.sampleRate, buf: TK.buf.has(take), pcm: typeof SPK7 !== 'undefined' && SPK7.pcm.has(take)}), setup.take);
  at.ms = Date.now() - t0;
  // Ankunft der Quelle messen
  const ank = await pg.evaluate(take => new Promise(ok => { const t = performance.now(), c = AU.ctx.currentTime, chk = () => { const b = TK.buf.has(take), q = b && VP.m.has(TK.buf.get(take)); if (b && q || performance.now() - t > 4000) ok({ms: Math.round(performance.now() - t), ct: AU.ctx.currentTime, c0: c, b, q}); else setTimeout(chk, 5); }; chk(); }), setup.take);
  await sleep(2200);
  const mess = async st => pg.evaluate(([st]) => {
    const T = window.__tap, sr = AU.ctx.sampleRate, f0 = Math.round(st * sr), out = {bins: [], jump: 0, jumpT: 0, first: null};
    const at = fr => { for (const b of T) if (fr >= b.f && fr < b.f + b.d.length) return b.d[fr - b.f]; return null; };
    let prev = null;
    for (let k = 0; k < 24; k++) { let s = 0, m = 0; for (let i = 0; i < sr * .05; i++) { const x = at(f0 + k * sr * .05 + i); if (x == null) continue; s += x * x; m++; if (prev != null) { const j = Math.abs(x - prev); if (j > out.jump) { out.jump = j; out.jumpT = (k * .05 + i / sr); } } prev = x; if (out.first == null && Math.abs(x) > 0.01) out.first = +(k * .05 + i / sr).toFixed(3); } out.bins.push(m ? +Math.sqrt(s / m).toFixed(4) : null); }
    out.jump = +out.jump.toFixed(4); out.jumpT = +out.jumpT.toFixed(3); return out;
  }, [st]);
  const erst = await mess(at.st);
  await pg.evaluate(() => { stop(); });
  await sleep(800);
  await pg.evaluate(() => { window.__tap.length = 0; ensureAudio(); play(); });
  const st2 = await pg.evaluate(() => R.startTime);
  await sleep(300); const dbg = await pg.evaluate(() => ({pl: R.playing, cs: AU.ctx.state, ct: AU.ctx.currentTime, st: R.startTime, n: window.__tap.length, f: window.__tap.length ? [window.__tap[0].f, window.__tap[window.__tap.length - 1].f] : null}));
  await sleep(2000);
  const ref = await mess(st2);
  await pg.evaluate(() => { stop(); });
  const r300 = b => { const v = b.slice(0, 6).filter(x => x != null); return +Math.sqrt(v.reduce((s, x) => s + x * x, 0) / Math.max(1, v.length)).toFixed(4); };
  const ton2 = await pg.evaluate(() => typeof TON2 !== 'undefined' ? {hit: TON2.hit, miss: TON2.miss, bad: TON2.bad, save: TON2.save} : null);
  console.log(JSON.stringify({fall: FALL, sek: SEK, verz: VERZ, amp: AMP, alt: ALT, ton2, dbg, setup, at, ank, erst300: r300(erst.bins), ref300: r300(ref.bins), erst, ref, errs}, null, 0));
  await br.close();
})().catch(e => { console.error(e); process.exit(1); });
