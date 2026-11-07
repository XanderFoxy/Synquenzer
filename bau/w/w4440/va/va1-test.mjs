// VA1-Test: Video mit Ton (PCM/MOV, Opus/MP4, Rückfall, Aufnahme-Weg), Export (WAV, Einzelspuren, Gesang, Chor, MIDI), MIDI-Import,
// Container-Rundlauf (frischer Browser-Speicher), Take-Zwischenspeicher nach dem Offline-Durchlauf, Blatt hochkant/quer (Fotos).
// Aufruf: node va1-test.mjs <index.html> <ausgabe-ordner>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const FILE = process.argv[2], OUT = process.argv[3] || '.';
const R = []; const ok = (name, cond, info) => { R.push({name, ok: !!cond, info}); console.log((cond ? 'OK   ' : 'FAIL ') + name + (info !== undefined ? ' · ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); };
const T0 = Date.now();
/* ---------- MP4/MOV-Leser (Boxen) ---------- */
function mp4(buf) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength), s4 = o => String.fromCharCode(buf[o], buf[o + 1], buf[o + 2], buf[o + 3]);
  const kids = (a, e) => { const o = []; for (let p = a; p + 8 <= e;) { let n = dv.getUint32(p); if (n < 8) n = e - p; o.push({t: s4(p + 4), a: p, e: Math.min(e, p + n)}); p += n; } return o; };
  const top = kids(0, buf.length), ftyp = top.find(x => x.t === 'ftyp'), moov = top.find(x => x.t === 'moov'), mdat = top.find(x => x.t === 'mdat');
  const find = (b, t) => kids(b.a + 8, b.e).find(x => x.t === t);
  const tracks = kids(moov.a + 8, moov.e).filter(x => x.t === 'trak').map(tr => {
    const mdia = find(tr, 'mdia'), hdlr = find(mdia, 'hdlr'), mdhd = find(mdia, 'mdhd'), stbl = find(find(mdia, 'minf'), 'stbl');
    const stsd = find(stbl, 'stsd'), stsz = find(stbl, 'stsz'), stco = find(stbl, 'stco'), stsc = find(stbl, 'stsc');
    const entry = s4(stsd.a + 16 + 4), ssz = dv.getUint32(stsz.a + 12), scnt = dv.getUint32(stsz.a + 16);
    const nco = dv.getUint32(stco.a + 12), co = []; for (let k = 0; k < nco; k++) co.push(dv.getUint32(stco.a + 16 + 4 * k));
    const nsc = dv.getUint32(stsc.a + 12), sc = []; for (let k = 0; k < nsc; k++) sc.push([dv.getUint32(stsc.a + 16 + 12 * k), dv.getUint32(stsc.a + 20 + 12 * k)]);
    const sizes = []; if (!ssz) for (let k = 0; k < scnt; k++) sizes.push(dv.getUint32(stsz.a + 20 + 4 * k));
    const o = {handler: s4(hdlr.a + 16), entry, ts: dv.getUint32(mdhd.a + 20), dur: dv.getUint32(mdhd.a + 24), ssz, scnt, chunks: nco, co, sc, sizes};
    if (entry === 'sowt' || entry === 'mp4a' || entry === 'Opus') { const e0 = stsd.a + 16; o.ch = dv.getUint16(e0 + 24); o.bits = dv.getUint16(e0 + 26); o.sr = dv.getUint32(e0 + 32) / 65536; }
    o.sec = o.dur / o.ts; return o;
  });
  return {brand: ftyp ? s4(ftyp.a + 8) : null, top: top.map(x => x.t), mdatEnd: mdat ? mdat.e : 0, tracks};
}
// PCM-Spur ('sowt') aus der Datei lesen: Spitze (dBFS) und Frames
function pcmOf(buf, t) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength); let pk = 0, fr = 0, sci = 0;
  for (let c = 1; c <= t.chunks; c++) {
    while (sci + 1 < t.sc.length && t.sc[sci + 1][0] <= c) sci++;
    const n = t.sc[sci][1], off = t.co[c - 1];
    for (let i = 0; i < n * 2; i++) { const v = Math.abs(dv.getInt16(off + i * 2, true)); if (v > pk) pk = v; }
    fr += n;
  }
  return {frames: fr, db: pk ? +(20 * Math.log10(pk / 32768)).toFixed(1) : -200};
}
function wav(buf) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength), s4 = o => String.fromCharCode(buf[o], buf[o + 1], buf[o + 2], buf[o + 3]);
  if (s4(0) !== 'RIFF' || s4(8) !== 'WAVE') return null;
  const ch = dv.getUint16(22, true), sr = dv.getUint32(24, true), bits = dv.getUint16(34, true), n = dv.getUint32(40, true) / (ch * 2);
  let pk = 0; const zc = []; let prev = 0, z = 0, half = Math.floor(n / 2), e1 = 0, e2 = 0;
  for (let i = 0; i < n; i++) { const v = dv.getInt16(44 + i * ch * 2, true), a = Math.abs(v); if (a > pk) pk = a; if ((v >= 0) !== (prev >= 0)) z++; prev = v; if (i < half) e1 += v * v; else e2 += v * v; }
  const rmsAt = (a, z) => { let e = 0, k = 0; for (let i = Math.round(a * sr); i < Math.min(n, Math.round(z * sr)); i++) { const v = dv.getInt16(44 + i * ch * 2, true); e += v * v; k++; } return Math.round(Math.sqrt(e / Math.max(1, k))); };
  return {rmsAt, ch, sr, bits, n, sec: n / sr, db: pk ? +(20 * Math.log10(pk / 32768)).toFixed(1) : -200, zcr: Math.round(z / (n / sr)), rms1: Math.sqrt(e1 / Math.max(1, half)), rms2: Math.sqrt(e2 / Math.max(1, n - half))};
}
function unzip(buf) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength), out = []; let o = 0;
  while (o + 30 <= buf.length && dv.getUint32(o, true) === 0x04034b50) {
    const crc = dv.getUint32(o + 14, true), sz = dv.getUint32(o + 18, true), nl = dv.getUint16(o + 26, true), xl = dv.getUint16(o + 28, true);
    const name = Buffer.from(buf.subarray(o + 30, o + 30 + nl)).toString('utf8'), d0 = o + 30 + nl + xl; out.push({name, crc, data: buf.subarray(d0, d0 + sz)}); o = d0 + sz;
  }
  return out;
}
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return u => { let c = 0xFFFFFFFF; for (let i = 0; i < u.length; i++) c = t[(c ^ u[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }; })();
const B = b64 => new Uint8Array(Buffer.from(b64, 'base64'));
/* ---------- Seite ---------- */
const b = await chromium.launch();
async function page(vp) {
  const ctx = await b.newContext({viewport: vp, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(); p.errs = [];
  p.on('pageerror', e => p.errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') p.errs.push(m.text()); });
  await p.goto('file://' + FILE); await p.waitForTimeout(1300);
  await p.mouse.click(200, 300).catch(() => {});
  return p;
}
const p = await page({width: 428, height: 926});
// Song: Szene 0 + 1 (Synth, Drums), zwei Gesangs-Takes (220 Hz in Szene 1, 330 Hz in Szene 2)
const setup = await p.evaluate(async () => {
  const D = window.SYNQUENZER, sr = 48000;
  const tone = (f, sec) => { const n = Math.round(sr * sec), a = new Array(n); for (let i = 0; i < n; i++) a[i] = Math.round(9000 * Math.sin(2 * Math.PI * f * i / sr) * Math.min(1, i / 2000, (n - i) / 2000)); return a; };
  const t1 = await D.tkInject({pcm: tone(220, 1.9), sr, scene: 0, len: 1}), t2 = await D.tkInject({pcm: tone(330, 1.9), sr, scene: 1, len: 1});
  const bars = D.songFromChain([{scene: 0, bars: 1}, {scene: 1, bars: 1}]);
  return {t1, t2, bars, h1: await D.tkPcmHash(t1.id), h2: await D.tkPcmHash(t2.id), st: t1.track};
});
ok('Aufbau: Song mit 2 Takten, 2 Takes auf STIMME', setup.bars === 2 && setup.t1.stored && setup.t2.stored, setup);

/* ===== 1. Video: Wege ===== */
const pth = await p.evaluate(async () => { const D = window.SYNQUENZER; D.vvTest({}); const a = await D.vvPath('9:16'); D.vvTest({noAE: true}); const c = await D.vvPath('9:16'); D.vvTest({opus: true}); const o = await D.vvPath('9:16'); D.vvTest({noVE: true}); const r = await D.vvPath('9:16'); D.vvTest({}); return {a, c, o, r}; });
ok('Weg ohne AAC (Chromium = wie iOS 18): H.264 + PCM in MOV statt Aufnahme', pth.a.how === 'webcodecs' && pth.a.acodec === 'pcm' && pth.a.ext === 'mov', pth.a.why);
ok('Simuliert „kein AudioEncoder“ (noAE): PCM/MOV', pth.c.acodec === 'pcm', pth.c.why);
ok('Mit AudioEncoder (Opus, Test): MP4', pth.o.acodec === 'opus' && pth.o.ext === 'mp4', pth.o.why);
ok('Ohne VideoEncoder: Aufnahme in Echtzeit', pth.r.how === 'recorder', pth.r.why);

async function video(test, fmt) {
  return p.evaluate(async ([test, fmt]) => {
    const D = window.SYNQUENZER; D.vvTest(test); let res = null, err = null;
    try { res = await D.vvMake({fmt}); } catch (e) { err = String(e && e.message || e); }
    const b64 = res ? await D.va1VideoB64() : null, snd = res ? await D.va1HasSound() : null; D.vvTest({});
    return {res: res ? {ext: res.ext, mime: res.mime, how: res.how, why: res.why, aChk: res.aChk, dur: res.dur, size: res.size, W: res.W, H: res.H} : null, err, b64, snd};
  }, [test, fmt]);
}
const vA = await video({}, '9:16');
ok('Video PCM: erstellt (MOV)', vA.res && vA.res.ext === 'mov' && vA.res.mime === 'video/quicktime', vA.res || vA.err);
let pcmA = null;
if (vA.b64) {
  const buf = B(vA.b64), m = mp4(buf), v = m.tracks.find(x => x.handler === 'vide'), a = m.tracks.find(x => x.handler === 'soun');
  ok('MOV-Boxen: ftyp qt, moov vor mdat, Spur vide (avc1) + soun (sowt)', m.brand === 'qt  ' && m.top.indexOf('moov') < m.top.indexOf('mdat') && v && v.entry === 'avc1' && a && a.entry === 'sowt', {brand: m.brand, top: m.top, v: v && v.entry, a: a && a.entry});
  ok('Tonspur: 2 Kanäle, 16 Bit, Abtastrate, 1 Sample = 1 Frame (4 Byte)', a && a.ch === 2 && a.bits === 16 && a.ssz === 4 && a.sr === a.ts && a.scnt === a.dur, a && {ch: a.ch, bits: a.bits, sr: a.sr, ssz: a.ssz, scnt: a.scnt});
  ok('Ton so lang wie das Bild (± 0,1 s)', a && v && Math.abs(a.sec - v.sec) < .1, {a: a && +a.sec.toFixed(3), v: v && +v.sec.toFixed(3), res: vA.res.dur});
  pcmA = a ? pcmOf(buf, a) : null;
  ok('Ton in der Datei hörbar (PCM-Spitze > −40 dBFS) und vollständig', pcmA && pcmA.db > -40 && pcmA.frames === a.scnt, pcmA);
  ok('Prüfung „Datei hat Tonspur“ (va1HasSound) = ja', vA.snd === true);
}
// Ton in der Datei = der Offline-Ton (bitgleich, erste 2 s): das Muxen verändert nichts
if (vA.b64) {
  const ref = await p.evaluate(() => window.SYNQUENZER.vvPcm(0, 2)), want = B(ref.b64), buf = B(vA.b64), a = mp4(buf).tracks.find(x => x.handler === 'soun');
  const got = new Uint8Array(want.length); let o = 0, sci = 0;
  for (let c = 1; c <= a.chunks && o < want.length; c++) { while (sci + 1 < a.sc.length && a.sc[sci + 1][0] <= c) sci++; const n = Math.min(a.sc[sci][1] * 4, want.length - o); got.set(buf.subarray(a.co[c - 1], a.co[c - 1] + n), o); o += n; }
  ok('Ton im Video = Offline-Ton des Songs (bitgleich, erste 2 s)', Buffer.compare(Buffer.from(got), Buffer.from(want)) === 0, {bytes: want.length, sr: ref.sr});
}
const vO = await video({opus: true}, '16:9');
if (vO.b64) { const m = mp4(B(vO.b64)), a = m.tracks.find(x => x.handler === 'soun'); ok('AudioEncoder-Weg (Opus): MP4 mit Tonspur (Opus, soun)', m.brand === 'isom' && a && a.entry === 'Opus' && a.scnt > 10 && vO.res.ext === 'mp4', {brand: m.brand, entry: a && a.entry, scnt: a && a.scnt}); }
else ok('AudioEncoder-Weg (Opus): MP4 mit Tonspur', false, vO.err);
const vF = await video({opus: true, va1BadAE: true}, '9:16');
if (vF.b64) { const m = mp4(B(vF.b64)), a = m.tracks.find(x => x.handler === 'soun'); ok('AudioEncoder ohne Ton → Rückfall PCM (MOV), nicht Aufnahme', vF.res.aChk && vF.res.aChk.fallback === 'pcm' && a && a.entry === 'sowt' && pcmOf(B(vF.b64), a).db > -40, vF.res.aChk); }
else ok('AudioEncoder ohne Ton → Rückfall PCM', false, vF.err);
const vR = await video({noVE: true}, '9:16');
ok('Aufnahme-Weg (ohne VideoEncoder): Datei mit Tonspur', vR.res && vR.res.how === 'recorder' && vR.snd === true, vR.res ? {mime: vR.res.mime, aChk: vR.res.aChk} : vR.err);
const vN = await video({noVE: true, noDecode: true, va1NoTrack: true}, '9:16');
ok('Aufnahme-Weg: Datei ohne Tonspur (nicht dekodierbar) → klare Meldung, kein stummes Video', !vN.res && /keine Tonspur/.test(vN.err || ''), vN.err || vN.res);
const vD = await video({noVE: true, noDecode: true}, '9:16');
ok('Aufnahme-Weg: nicht dekodierbar, aber Tonspur da → angenommen', vD.res && vD.res.aChk && !vD.res.aChk.noTrack && vD.snd === true, vD.res ? vD.res.aChk : vD.err);

/* ===== 3. Fehler: Clip verschwindet nach WAV-Export (Take lud während des Offline-Durchlaufs) ===== */
const bug = await p.evaluate(async () => {
  const D = window.SYNQUENZER; const ag = kv.aget.bind(kv); kv.aget = async k => { await new Promise(r => setTimeout(r, 400)); return ag(k); };
  D.tkForget(); D.tkLoadAll();
  const res = await D.ggbExport({pre: 0, remember: false}); kv.aget = ag;
  await new Promise(r => setTimeout(r, 2500));
  const i = D.tkInfo(); return {buf: i.buf, wait: [...TK.wait.keys()], bytes: res && res.bytes, cellFlat: [...document.querySelectorAll('.cell.filled .mini svg path')].some(x => /H100/.test(x.getAttribute('d') || ''))};
});
ok('WAV-Export (Instrumental) während ein Take lädt: Take danach geladen, nichts hängt', bug.buf.length === 2 && bug.wait.length === 0 && bug.bytes > 1000, bug);

/* ===== 2. Export: WAV, Einzelspuren, Gesang ===== */
const info0 = await p.evaluate(() => window.SYNQUENZER.va1Info());
ok('Einzelspuren-Liste: Synth 1–3, Drums, STIMME Gesang', info0.stems.length >= 4 && info0.stems.some(x => x.vox === 'all'), info0.stems.map(x => x.name));
async function exp(kind) { return p.evaluate(async k => { const D = window.SYNQUENZER; const r = await D.va1Export(k); return {r, b64: r ? await D.va1ResB64() : null}; }, kind); }
const eS = await exp('song');
if (eS.b64) { const w = wav(B(eS.b64)); ok('Ganzer Song als WAV (16 Bit, Stereo, hörbar)', w && w.ch === 2 && w.bits === 16 && w.db > -30 && w.sec > 3, w); } else ok('Ganzer Song als WAV', false, eS.r);
const eL = await exp('lead');
if (eL.b64) { const w = wav(B(eL.b64)); ok('Nur Gesang: hörbar, ohne Drums/Synths (Nulldurchgänge ≈ Sinus 220/330 Hz), beide Takes', w && w.db > -40 && w.zcr < 1400 && w.rms1 > 100 && w.rms2 > 100, w); } else ok('Nur Gesang', false, eL.r);
const eT = await exp('stems');
if (eT.b64) {
  const z = unzip(B(eT.b64)), crcOk = z.every(f => CRC(f.data) === f.crc), ws = z.map(f => ({name: f.name, w: wav(f.data)}));
  ok('Einzelspuren: ZIP mit einem WAV je Spur, CRC stimmt', z.length >= 4 && crcOk && ws.every(x => x.w && x.w.db > -60), ws.map(x => x.name + ' ' + (x.w && x.w.db) + ' dB'));
  const g = ws.find(x => /STIMME|Gesang/i.test(x.name)), dr = ws.find(x => /Drum/i.test(x.name));
  ok('Einzelspur Gesang ohne Drums (Nulldurchgänge niedrig), Drum-Spur mit Drums', g && g.w.zcr < 1400 && dr && dr.w.zcr > g.w.zcr, {g: g && g.w.zcr, dr: dr && dr.w.zcr});
} else ok('Einzelspuren', false, eT.r);
const solo = await p.evaluate(() => ({solo: G6.solo, only: !!VA1.only, cut: AU.tracks.slice(0, NT()).map(A => !!A), dry: GGB.dry}));
ok('Nach den Exporten: Live-Zustand unverändert (Solo, Gesang an)', solo.solo == null && !solo.only && !solo.dry, solo);
// Chor (G6): eine Chor-Stimme auf Take 1, dann „Nur Chor“
const ch = await p.evaluate(async st => { const D = window.SYNQUENZER; try { D.g6Make({t: st, s: 0}); const w = await D.g6Wait({t: st, s: 0}); return {w, info: D.va1Info().chor}; } catch (e) { return {err: String(e)}; } }, setup.st);
if (ch.info) {
  const eC = await exp('chor');
  if (eC.b64) { const w = wav(B(eC.b64)); const b1 = w && w.rmsAt(.3, 1.8), b2 = w && w.rmsAt(2.8, 3.9), lead = wav(B(eL.b64)), l2 = lead.rmsAt(2.8, 3.9); ok('Nur Chor: hörbar im Takt 1 (Take mit Chor); Takt 2 (Take ohne Chor) ohne Lead', w && w.db > -50 && b1 > 300 && b2 < l2 / 4, {takt1: b1, takt2: b2, leadTakt2: l2}); } else ok('Nur Chor', false, eC.r);
  const eL2 = await exp('lead');
  if (eL2.b64 && eL.b64) { const a = wav(B(eL.b64)), c = wav(B(eL2.b64)); ok('Nur Gesang mit Chor im Projekt: Chor bleibt draußen (gleich wie ohne Chor, ±1 dB)', Math.abs(20 * Math.log10(c.rms1 / a.rms1)) < 1, {ohne: Math.round(a.rms1), mit: Math.round(c.rms1)}); }
} else ok('Chor anlegen (g6Make) für „Nur Chor“', false, ch);

/* ===== MIDI ===== */
const md = await p.evaluate(async () => { const D = window.SYNQUENZER; const all = await D.va1Midi(null), one = await D.va1Midi(1); return {all, one, pa: all ? D.va1MidiParse(all.b64) : null, po: one ? D.va1MidiParse(one.b64) : null, src: D.song() ? null : null}; });
ok('MIDI ganzer Song: jede Spur mit Noten (auch über Synth 1–4 hinaus)', md.all && md.pa.tracks.filter(t => t.notes.length).length === md.all.tracks.length && md.all.tracks.length >= 4, md.all && {tracks: md.all.tracks, counts: md.all.counts});
ok('MIDI eine Spur (Synth 2): eine Notenspur', md.one && md.po.tracks.filter(t => t.notes.length).length === 1 && md.one.tracks[0] === 1, md.one && md.one.counts);
// Import der Synth-2-Datei in Synth 4 (leer) → neue Clips; Noten, Länge, Anschlag wie im Song
const imp = await p.evaluate(async b64 => {
  const D = window.SYNQUENZER; D.selectTrack(3); const before = S.tracks[3].clips.filter(Boolean).length;
  const r = D.va1MidiImport(b64, 3), c = r ? S.tracks[3].clips[r.clips[0].scene] : null, parsed = D.va1MidiParse(b64), src = parsed.tracks.find(t => t.notes.length).notes;
  const same = c && c.notes.length === src.length && c.notes.every((n, k) => Math.abs(n.t - src[k].t) < 1e-3 && Math.abs(n.d - src[k].d) < 1e-3 && n.n === src[k].n && Math.abs(n.v - src[k].v) < .006);
  const after = S.tracks[3].clips.filter(Boolean).length; D.undo(); const undone = S.tracks[3].clips.filter(Boolean).length;
  return {r, len: c && c.len, n: c && c.notes.length, src: src.length, same, before, after, undone};
}, md.one.b64);
ok('MIDI-Import: neuer Clip in Synth 4, Noten/Länge/Anschlag gleich, ein ↶', imp.r && imp.same && imp.after === imp.before + 1 && imp.undone === imp.before, imp);

/* ===== 4. Container: Inhaltsliste + Rundlauf in frischem Speicher ===== */
const box = await p.evaluate(async () => { const D = window.SYNQUENZER; const b64 = await D.va1BoxB64(); return {b64, info: D.va1Info()}; });
const zf = unzip(B(box.b64)), man = JSON.parse(Buffer.from(zf.find(f => f.name === 'manifest.json').data).toString('utf8'));
ok('Container: projekt.json zuerst, je Take ein WAV, manifest.json mit Liste', zf[0].name === 'projekt.json' && zf.filter(f => /^takes\/[0-9a-v]{10}\.wav$/.test(f.name)).length === man.takes.length && man.takes.length >= 2 && man.missing.length === 0,
  {files: zf.map(f => f.name), takes: man.takes.map(t => t.where.join(' / '))});
const p2 = await page({width: 428, height: 926});
const rt = await p2.evaluate(async ([b64, h1, h2, id1, id2]) => {
  const D = window.SYNQUENZER; const r = await D.va1BoxImport(b64);
  await new Promise(x => setTimeout(x, 2500));
  const loaded = await D.tkLoadAll(), ha = await D.tkPcmHash(id1), hb = await D.tkPcmHash(id2);
  const e = await D.va1Export('lead'), w = e ? await D.va1ResB64() : null;
  return {r, loaded, same: ha === h1 && hb === h2, w, song: S.song && S.song.bars};
}, [box.b64, setup.h1, setup.h2, setup.t1.id, setup.t2.id]);
const rw = rt.w ? wav(B(rt.w)) : null;
ok('Rundlauf: Container in frischem Speicher geöffnet, beide Takes bitgleich und geladen', rt.r.ok && rt.same && rt.loaded.length >= 2 && rt.r.note && rt.r.note.got === rt.r.note.want, {note: rt.r.note, loaded: rt.loaded.length});
ok('Rundlauf: beide Takes spielen (Gesang im Takt 1 und Takt 2 hörbar)', rw && rw.rms1 > 100 && rw.rms2 > 100, rw);
// Takes-Blatt „ZIP + Projekt“ → Export-Blatt mit Liste
const zipBtn = await p.evaluate(async st => { const D = window.SYNQUENZER; D.tkSheet({t: st, s: 0}); await new Promise(r => setTimeout(r, 300)); const b = document.querySelector('.tksheet button[data-a="zip"]'); if (!b) return {err: 'kein Knopf'}; const r = b.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; }, setup.st);
if (zipBtn.x) { await p.touchscreen.tap(zipBtn.x, zipBtn.y); await p.waitForTimeout(400); }
const sh = await p.evaluate(() => { const q = document.querySelector('.pop.va1'); return q ? {list: q.querySelectorAll('.va1li').length, sum: q.querySelector('.va1sum').textContent} : null; });
ok('Takes-Blatt „ZIP + Projekt“ öffnet das Export-Blatt mit Anzahl und Liste', sh && sh.list >= 2 && /Audio-Takes/.test(sh.sum), sh);

/* ===== Blatt: hochkant und quer (Fotos), ✕ sichtbar, Tasten ≥ 44 px, kein Überlauf ===== */
async function sheetCheck(pg, tag) {
  await pg.evaluate(() => { const D = window.SYNQUENZER; D.va1Close(); D.va1Sheet(); });
  await pg.waitForTimeout(400);
  const m = await pg.evaluate(() => {
    const q = document.querySelector('.pop.va1'), x = q && q.querySelector('.psh-x'), r = x && x.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
    const btns = [...q.querySelectorAll('button')].filter(b => b.offsetParent).map(b => { const z = b.getBoundingClientRect(); return {t: b.textContent.trim().slice(0, 24), h: Math.round(z.height), w: Math.round(z.width), clip: b.scrollWidth > b.clientWidth + 1}; });
    return {x: r ? {l: r.left, t: r.top, r: r.right, b: r.bottom} : null, vw, vh, inView: !!r && r.left >= 0 && r.top >= 0 && r.right <= vw && r.bottom <= vh, small: btns.filter(b => b.h < 44 || b.w < 44), clip: btns.filter(b => b.clip), over: q.scrollWidth > q.clientWidth + 1, docOver: document.documentElement.scrollWidth > vw};
  });
  await pg.screenshot({path: OUT + '/va1-' + tag + '.png'});
  ok('Blatt ' + tag + ': ✕ sichtbar, Tasten ≥ 44 px, nichts abgeschnitten, kein Überlauf', m.inView && !m.small.length && !m.clip.length && !m.over && !m.docOver, {x: m.x, small: m.small, clip: m.clip});
}
await sheetCheck(p, 'hochkant-428x926');
// Video-Blatt: der Weg steht unten („Weg: WebCodecs · H.264 + Ton (PCM) · MOV“)
await p.evaluate(() => { const D = window.SYNQUENZER; D.va1Close(); D.vvTest({}); D.vvOpen(); });
await p.waitForTimeout(900);
const way = await p.evaluate(() => { const w = document.querySelector('#vvSheet .vvway'); return w ? w.textContent : null; });
await p.screenshot({path: OUT + '/va1-video-weg-428x926.png'});
ok('Video-Blatt nennt den Weg mit Ton (PCM · MOV)', /PCM/.test(way || ''), way);
await p.evaluate(() => window.SYNQUENZER.vvClose());
await p.setViewportSize({width: 926, height: 428}); await p.waitForTimeout(500);
await sheetCheck(p, 'quer-926x428');
// Menü → Export
await p.evaluate(() => { window.SYNQUENZER.va1Close(); openMenu(); });
await p.waitForTimeout(300);
const mb = await p.evaluate(() => { const b = [...document.querySelectorAll('#menu button')].find(x => x.textContent.trim() === 'Export'); if (!b) return null; b.scrollIntoView({block: 'center'}); const r = b.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, h: r.height, row: [...b.parentElement.children].map(c => c.textContent.trim())}; });
if (mb) { await p.touchscreen.tap(mb.x, mb.y); await p.waitForTimeout(400); }
const viaMenu = await p.evaluate(() => !!document.querySelector('.pop.va1') && !document.getElementById('menu').classList.contains('open'));
ok('Menü → Export (neben Video, darunter verschiebt sich nichts) öffnet das Blatt, Taste ≥ 44 px', mb && mb.h >= 44 && viaMenu && mb.row.join('|') === 'Video|Export', mb);

const errs = p.errs.concat(p2.errs);
ok('Keine Fehler in der Konsole', !errs.length, errs.slice(0, 5));
const nOk = R.filter(x => x.ok).length;
console.log(`\nVA1: ${nOk}/${R.length} OK · ${Math.round((Date.now() - T0) / 1000)} s`);
await b.close();
