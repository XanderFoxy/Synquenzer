/* ===== Nachtrag 8 (I1a, I1b, I1c, I3a data, Baustein N) — the always-loaded part on the main thread.
   Baustein N (A.4): S.need = the sorted features a project holds that an older state would lose; computed from the data when
   saving, absent when empty (JSON unchanged); unknown features of a newer version lock the project like VO-R1.
   I1c: the super knob S.sr {v, x, sc, t?, f?, z: [{p, u: {uid: {c, d}}}]} (B.1 4.1), addresses after A.1, its table to the
   engines as {sr} (one send path, riding with {set} of a full sync), the hand model R.sr, undo kind 'sr', heardAt (A.11).
   I1a/I1b: clip states clip.st {eng, p, fx, slots?, x} and the scene morph {morph} (KZ1-KZ6); native tracks, track values
   (fx.*, gfx.*), FM operators and drums follow on the main thread in steps of 16 ms / per hit.
   Nothing here runs for a project without these fields: no message, no timer, no extra key. ===== */
const KNOWN_NEED = ['lf', 'sr', 'st'];
function needCalc(p) {
  const s = new Set();
  if (!p || !Array.isArray(p.tracks)) return [];
  if (p.sr || (p.song && Array.isArray(p.song.sr) && p.song.sr.length)) s.add('sr');
  if ((p.sr && p.sr.f) || (p.song && Array.isArray(p.song.sr) && p.song.sr.some(e => e && e.f))) s.add('lf');
  for (const t of p.tracks) {
    if (!t) continue;
    const q = t.sound && t.sound.p; if (q && (q.l1f || q.l2f)) s.add('lf');
    if (Array.isArray(t.clips)) for (const c of t.clips) if (c && c.st) s.add('st');
  }
  return [...s].sort();
}
// called by every write path of the project (serializeProject, projectFileObj): need exactly from the data (I1-28 c)
function needSync(p) {
  if (!p || typeof p !== 'object') return;
  const n = needCalc(p), keep = Array.isArray(p.need) ? p.need.filter(x => typeof x === 'string' && !KNOWN_NEED.includes(x)) : [];
  const all = [...new Set(n.concat(keep))].sort();
  if (all.length) { if (JSON.stringify(p.need) !== JSON.stringify(all)) { delete p.need; p.need = all; } }
  else if ('need' in p) delete p.need;
}
// normalizeProject (A.4): the known features are recomputed, unknown ones lock the project (returned for _newer.n)
function needNorm(obj, p) {
  const raw = obj && Array.isArray(obj.need) ? obj.need.filter(x => typeof x === 'string' && /^[a-z][a-z0-9]{0,15}$/.test(x)) : [];
  const unk = [...new Set(raw.filter(x => !KNOWN_NEED.includes(x)))].sort();
  if (unk.length) p.need = [...new Set(needCalc(p).concat(unk))].sort(); else { const n = needCalc(p); if (n.length) p.need = n; }
  return unk;
}

/* ---------- addresses (A.1) and descriptions ---------- */
const SR_EXC = new Set(['mode', 'poly', 'eng', 'engine', 'mk.mode', 'l1f', 'l2f', 'lq', 'mw']);
const SR_PATH = /^[a-z][A-Za-z0-9]*(\.[A-Za-z0-9-]+){0,6}$/;
const SR_FMOP = {ol: [0, 99], fine: [0, 99], det: [0, 14]}, SR_FMXOP = {ol: [0, 99], fine: [0, 99], fbAmt: [0, 7]};
function srLawOf(d) { return d.vals ? 'vals' : ['exp', 'db', 'hdec', 'pow', 'bipow'].includes(d.c) ? d.c : 'lin'; }
// srDesc(k) -> {k, law, lo, hi, kk, vals?, l, fam} or null (not addressable / unknown)
function srDesc(k) {
  if (typeof k !== 'string' || k.length > 48 || !SR_PATH.test(k) || SR_EXC.has(k)) return null;
  let m;
  if ((m = /^gfx\.(rev|dly)$/.exec(k))) return {k, law: 'lin', lo: 0, hi: 1, kk: 1, l: m[1] === 'rev' ? 'Hall (Gesang)' : 'Echo (Gesang)', fam: 'gfx'};
  if (k.startsWith('mk.')) { const r = SQMK.mkRange(k.slice(3)); if (!r) return null; return {k, law: r[2] ? 'vals' : 'lin', lo: r[0], hi: r[1], kk: 1, vals: r[2] ? range(r[0], r[1]) : null, l: MK_LABEL + ' ' + k.slice(3), fam: 'mk'}; }
  if ((m = /^fm6\.ops\.([0-5])\.(ol|fine|det)$/.exec(k))) { const r = SR_FMOP[m[2]]; return {k, law: 'lin', lo: r[0], hi: r[1], kk: 1, l: 'OP ' + (+m[1] + 1) + ' ' + ({ol: 'Pegel', fine: 'Fein', det: 'Verstimmung'})[m[2]], fam: 'fm'}; }
  if ((m = /^fmx\.ops\.([0-5])\.(ol|fine|fbAmt)$/.exec(k))) { const r = SR_FMXOP[m[2]]; return {k, law: 'lin', lo: r[0], hi: r[1], kk: 1, l: 'OP ' + (+m[1] + 1) + ' ' + ({ol: 'Pegel', fine: 'Fein', fbAmt: 'Rückkopplung'})[m[2]], fam: 'fmx'}; }
  if ((m = /^fmx\.edge\.([1-6])-([1-6])\.amt$/.exec(k))) return {k, law: 'lin', lo: 0, hi: 99, kk: 1, l: 'Verbindung ' + m[1] + '→' + m[2], fam: 'fmx'};
  if ((m = /^drum\.([A-Za-z0-9]{1,12})\.([A-Za-z0-9]{1,12})$/.exec(k))) {
    const d = DPD[m[2]]; if (!d || !DRUM_BY_ID[m[1]]) return null;
    return {k, law: srLawOf(d), lo: d.min, hi: d.max, kk: d.k || 1, vals: d.vals || null, l: DRUM_BY_ID[m[1]].l + ' ' + d.l, fam: 'drum', d};
  }
  const d = PD[k]; if (!d) return null;
  return {k, law: srLawOf(d), lo: d.min, hi: d.max, kk: d.k || 1, vals: d.vals || null, l: d.l, fam: k.startsWith('fx.') ? 'fx' : k.startsWith('wt.') ? 'wt' : 'flat', d};
}
const srIsDisc = D => D && D.law === 'vals';
function srToN(D, v) { return D.law === 'vals' ? toNorm({vals: D.vals}, v) : SRCORE.toN(D.law, D.lo, D.hi, D.kk, v); }
function srFromN(D, n) { return D.law === 'vals' ? fromNorm({vals: D.vals}, n) : SRCORE.fromN(D.law, D.lo, D.hi, D.kk, n); }
// read / write a path of track tr (A.1): gfx in tr.gfx, mk in p.mk, FM operators in p.fm6 / p.fmx, drums in p.slots, else sndGet
function srGet(tr, k) {
  if (!tr || !tr.sound) return undefined;
  const p = tr.sound.p; let m;
  if (k.startsWith('gfx.')) return tr.gfx ? tr.gfx[k.slice(4)] : undefined;
  if (k.startsWith('mk.')) return p && p.mk ? SQMK.mkPathGet(p.mk, k.slice(3)) : undefined;
  if ((m = /^fm6\.ops\.([0-5])\.(\w+)$/.exec(k))) { const o = p && p.fm6 && p.fm6.ops && p.fm6.ops[+m[1]]; return o ? o[m[2]] : undefined; }
  if ((m = /^fmx\.ops\.([0-5])\.(\w+)$/.exec(k))) { const o = p && p.fmx && p.fmx.ops && p.fmx.ops[+m[1]]; return o ? o[m[2]] : undefined; }
  if ((m = /^fmx\.edge\.([1-6])-([1-6])\.amt$/.exec(k))) { const E = p && p.fmx && Array.isArray(p.fmx.edges) ? p.fmx.edges.find(e => e && e.from === +m[1] && e.to === +m[2]) : null; return E ? E.amt : undefined; }
  if ((m = /^drum\.(\w+)\.(\w+)$/.exec(k))) { if (tr.kind !== 'drum') return undefined; const s = p && p.slots && p.slots[m[1]]; const v = s && s[m[2]]; return v != null ? v : DrumSynth.DEFAULTS[m[2]]; }
  return sndGet(tr.sound, k);
}
function srSet(tr, k, v) {
  if (!tr || !tr.sound) return false;
  const p = tr.sound.p; let m;
  if (k.startsWith('gfx.')) { if (!tr.gfx) return false; tr.gfx[k.slice(4)] = v; return true; }
  if (k.startsWith('mk.')) { if (!p.mk) return false; SQMK.mkPathSet(p.mk, k.slice(3), v); return true; }
  if ((m = /^fm6\.ops\.([0-5])\.(\w+)$/.exec(k))) { const o = p.fm6 && p.fm6.ops && p.fm6.ops[+m[1]]; if (!o) return false; o[m[2]] = v; return true; }
  if ((m = /^fmx\.ops\.([0-5])\.(\w+)$/.exec(k))) { const o = p.fmx && p.fmx.ops && p.fmx.ops[+m[1]]; if (!o) return false; o[m[2]] = v; return true; }
  if ((m = /^fmx\.edge\.([1-6])-([1-6])\.amt$/.exec(k))) { const E = p.fmx && Array.isArray(p.fmx.edges) ? p.fmx.edges.find(e => e && e.from === +m[1] && e.to === +m[2]) : null; if (!E) return false; E.amt = v; return true; }
  if ((m = /^drum\.(\w+)\.(\w+)$/.exec(k))) { if (tr.kind !== 'drum') return false; if (!p.slots) p.slots = {}; (p.slots[m[1]] || (p.slots[m[1]] = {}))[m[2]] = v; return true; }
  sndSet(tr.sound, k, v); return true;
}
// every addressable path a track has now (for the teach-in diff)
function srKeysOf(tr) {
  const out = [], p = tr && tr.sound && tr.sound.p; if (!p) return out;
  if (tr.kind === 'drum') { for (const sl of DRUM_VOICES) for (const k in DPD) if (srDesc('drum.' + sl.id + '.' + k)) out.push('drum.' + sl.id + '.' + k); out.push('fx.vol'); return out; }
  const eng = tr.sound.engine;
  for (const k in PD) { if (SR_EXC.has(k) || k.startsWith('wt.') && eng !== 'wt' || k.startsWith('fm2.') && eng !== 'fm2') continue; if (k.startsWith('fx.') || typeof p[k] === 'number' || k.includes('.')) out.push(k); }
  if (eng === 'mk' && p.mk) { const walk = (o, pre) => { for (const k in o) { const v = o[k], q = pre ? pre + '.' + k : k; if (v && typeof v === 'object') walk(v, q); else if (typeof v === 'number' && srDesc('mk.' + q)) out.push('mk.' + q); } }; walk(p.mk, ''); }
  if (eng === 'fm6' && p.fm6 && Array.isArray(p.fm6.ops)) for (let o = 0; o < 6; o++) for (const f of ['ol', 'fine', 'det']) out.push('fm6.ops.' + o + '.' + f);
  if (eng === 'fm6' && p.fmx && Array.isArray(p.fmx.ops)) { for (let o = 0; o < 6; o++) for (const f of ['ol', 'fine', 'fbAmt']) out.push('fmx.ops.' + o + '.' + f); for (const e of p.fmx.edges || []) if (e) out.push('fmx.edge.' + e.from + '-' + e.to + '.amt'); }
  if (tr.stimme && tr.gfx) out.push('gfx.rev', 'gfx.dly');
  return out;
}

/* ---------- data: S.sr (B.1 4.1), clip.st (4.3), song.sr (4.2) ---------- */
const r4 = v => Math.round(v * 1e4) / 1e4;
function srJsonOk(o, max) { try { const s = JSON.stringify(o); return s != null && s.length <= (max || 4096); } catch (e) { return false; } }
const srCopy = o => JSON.parse(JSON.stringify(o));
function srFormKeep(f) { if (!f || typeof f !== 'object') return null; if (typeof FORM !== 'undefined' && FORM.norm) return FORM.norm(f); return srJsonOk(f) ? srCopy(f) : null; }
function srNorm(o, tracks) {
  if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
  const uids = new Set((tracks || []).map(t => t && t.uid).filter(Boolean));
  const out = {v: 1, x: r4(clamp(isNum(o.x) ? o.x : 0, 0, 1)), sc: o.sc === 'track' ? 'track' : 'all'};
  if (out.sc === 'track' && typeof o.t === 'string' && uids.has(o.t)) out.t = o.t; else if (out.sc === 'track') out.sc = 'all';
  if (o.f) { const f = srFormKeep(o.f); if (f) out.f = f; }
  const Z = [];
  let total = 0; const perT = {};
  for (const z of Array.isArray(o.z) ? o.z : []) {
    if (!z || typeof z !== 'object' || !isNum(z.p)) continue;
    const p = r4(clamp(z.p, .1, 1)), u = {};
    for (const uid in (z.u && typeof z.u === 'object' ? z.u : {})) {
      if (!uids.has(uid)) continue;
      const e = z.u[uid]; if (!e || typeof e !== 'object') continue;
      const c = {}, d = {};
      for (const k in (e.c || {})) { if (!srDesc(k) || srIsDisc(srDesc(k)) || !isNum(e.c[k])) continue; if ((perT[uid] || 0) >= 64 || total >= 256) break; c[k] = r4(clamp(e.c[k], -1, 1)); perT[uid] = (perT[uid] || 0) + 1; total++; }
      for (const k in (e.d || {})) { const D = srDesc(k); if (!D || !srIsDisc(D) || !D.vals.includes(e.d[k])) continue; if ((perT[uid] || 0) >= 64 || total >= 256) break; d[k] = e.d[k]; perT[uid] = (perT[uid] || 0) + 1; total++; }
      const q = {}; if (Object.keys(c).length) q.c = c; if (Object.keys(d).length) q.d = d;
      if (q.c || q.d) u[uid] = q;
    }
    const nz = {p, u};
    for (const k in z) if (!['p', 'u'].includes(k) && srJsonOk(z[k])) nz[k] = srCopy(z[k]);      // unknown fields stay (newer versions)
    Z.push(nz);
  }
  Z.sort((a, b) => a.p - b.p);
  const zz = [];
  for (const z of Z) { if (zz.length >= 3) break; if (zz.length && z.p - zz[zz.length - 1].p < .1 - 1e-9) continue; zz.push(z); }
  out.z = zz;
  for (const k in o) if (!['v', 'x', 'sc', 't', 'f', 'z'].includes(k) && srJsonOk(o[k])) out[k] = srCopy(o[k]);
  return out;
}
// song.sr (4.2, F3): entries are only written after Xander's answer; the normaliser keeps them lossless already
function srSongNorm(a, bars) {
  if (!Array.isArray(a)) return null;
  const n = Math.max(1, (bars | 0) || 1) * 4, out = [];
  for (const e of a) {
    if (!e || !isNum(e.a) || !isNum(e.b)) continue;
    const A = clamp(Math.round(e.a), 0, n), B = clamp(Math.round(e.b), A + 1, n + 1);
    const o = {a: A, b: B, x0: r4(clamp(isNum(e.x0) ? e.x0 : 0, 0, 1)), x1: r4(clamp(isNum(e.x1) ? e.x1 : 0, 0, 1))};
    if (e.f) { const f = srFormKeep(e.f); if (f) o.f = f; }
    out.push(o);
  }
  out.sort((x, y) => x.a - y.a);
  const r = []; for (const e of out) if (!r.length || e.a >= r[r.length - 1].b) r.push(e);
  return r.length ? r : null;
}
const ST_X = ['flow', 'bar1', 'bar2', 'jump'];
function stNorm(st) {
  if (!st || typeof st !== 'object') return null;
  const o = {eng: typeof st.eng === 'string' ? st.eng.slice(0, 12) : 'analog', p: {}};
  for (const k in (st.p || {})) { const D = srDesc(k), v = st.p[k]; if (!D || D.fam === 'gfx' || (srIsDisc(D) ? !D.vals.includes(v) : !isNum(v))) continue; o.p[k] = srIsDisc(D) ? v : clamp(v, D.lo, D.hi); }
  const fx = {};
  if (st.fx && typeof st.fx === 'object') {
    for (const k of ['vol', 'pan', 'rev', 'dly', 'drive']) if (isNum(st.fx[k])) { const D = PD['fx.' + k]; fx[k] = D ? clamp(st.fx[k], D.min, D.max) : st.fx[k]; }
    if (st.fx.chorus && isNum(st.fx.chorus.mix)) fx.chorus = {mix: clamp(st.fx.chorus.mix, 0, 1)};
  }
  if (Object.keys(fx).length) o.fx = fx;
  if (st.slots && typeof st.slots === 'object') { const sl = {}; for (const id in st.slots) { if (!DRUM_BY_ID[id]) continue; const q = {}; for (const k in st.slots[id]) { const d = DPD[k], v = st.slots[id][k]; if (d && (d.vals ? d.vals.includes(v) : isNum(v))) q[k] = d.vals ? v : clamp(v, d.min, d.max); } if (Object.keys(q).length) sl[id] = q; } if (Object.keys(sl).length) o.slots = sl; }
  o.x = ST_X.includes(st.x) ? st.x : 'flow';
  if (!Object.keys(o.p).length && !o.fx && !o.slots) return null;
  return o;
}
// a track went away: its entries leave S.sr in the same action (4.1); the caller groups the undo
function srDropUid(uid) {
  if (!S.sr || !uid) return false; let ch = false;
  for (const z of S.sr.z) if (z.u[uid]) { delete z.u[uid]; ch = true; }
  if (S.sr.t === uid) { delete S.sr.t; S.sr.sc = 'all'; ch = true; }
  if (ch) srSyncAll();
  return ch;
}

/* ---------- runtime (4.4) ---------- */
R.sr = {ver: 0, tc: [], x: 0, xs: 0, drive: null, hand: null, cap: null, sent: new Array(16).fill(false), pend: false, t: 0, anim: 0, mainT: 0};
R.st = new Array(16).fill(null);
function srOnLoad() {
  R.sr.ver++; R.sr.tc = [];
  R.sr.x = R.sr.xs = S.sr ? S.sr.x : 0; R.sr.drive = null; R.sr.hand = null; R.sr.cap = null;
  R.st.fill(null);
  for (let i = 0; i < R.sr.sent.length; i++) R.sr.sent[i] = false;
}
// the table of one track (5.2): continuous keys with their law and the deltas at the targets that set them; stepped keys with
// their values. wk: only what the worklet core of this engine computes (flat P keys; mk paths on AM); the rest is main thread
function srTabOf(i) {
  const tr = S.tracks[i], Z = S.sr ? S.sr.z : null; if (!tr || !Z || !Z.length) return null;
  const C_ = R.sr.tc[i], eng_ = tr.sound && tr.sound.engine;
  if (C_ && C_.ver === R.sr.ver && C_.z === Z && C_.uid === tr.uid && C_.eng === eng_) return C_.T;
  const T_ = srTabBuild(i, tr, Z); R.sr.tc[i] = {ver: R.sr.ver, z: Z, uid: tr.uid, eng: eng_, T: T_}; return T_;
}
function srTabBuild(i, tr, Z) {
  const uid = tr.uid, eng = tr.sound && tr.sound.engine, C = new Map(), Dd = new Map();
  for (const z of Z) {
    const e = z.u[uid]; if (!e) continue;
    for (const k in e.c || {}) { (C.get(k) || C.set(k, {n: [], d: []}).get(k)).n.push(z.p); C.get(k).d.push(e.c[k]); }
    for (const k in e.d || {}) { (Dd.get(k) || Dd.set(k, {n: [], v: []}).get(k)).n.push(z.p); Dd.get(k).v.push(e.d[k]); }
  }
  if (!C.size && !Dd.size) return null;
  const wk = [], disc = [], main = [];
  const wkKey = k => (eng === 'mk' ? k.startsWith('mk.') : (eng === 'analog' || eng === 'fm6') && !k.includes('.'));
  for (const [k, q] of C) {
    const D = srDesc(k); if (!D) continue;
    const e = {k, law: D.law === 'bip' ? 'lin' : D.law, lo: D.lo, hi: D.hi, n: q.n, d: q.d}; if (D.law === 'pow' || D.law === 'bipow') e.kk = D.kk;
    if (wkKey(k) && tr.kind === 'synth') wk.push(e); else main.push(e);
  }
  for (const [k, q] of Dd) {
    const D = srDesc(k); if (!D) continue;
    const e = {k, n: q.n, v: q.v, xf: XF_KEYS_MAIN.has(k) ? 1 : 0};
    if (wkKey(k) && tr.kind === 'synth') disc.push(e); else main.push(Object.assign(e, {disc: true}));
  }
  return {wk, disc, main};
}
const XF_KEYS_MAIN = new Set(['o1w', 'o2w', 'o3w', 'o1uni', 'o2uni', 'o3uni', 'o2sync', 'ftype', 'subW', 'subOct']);
// the {sr} part of a message for track i; null = this track has no entries (and never had: nothing is sent, rule 28)
function srMsgOf(i, snap) {
  const T = srTabOf(i), E = AU.synth[i];
  if (!T || (!T.wk.length && !T.disc.length)) return R.sr.sent[i] ? null : undefined;
  const tr = S.tracks[i], tab = T.wk.map(e => (e.k.startsWith('mk.') ? Object.assign({}, e, {b: +srGet(tr, e.k) || 0}) : e));
  const m = {tab, disc: T.disc, x: R.sr.drive ? R.sr.drive.x0 : R.sr.x};
  if (snap) m.snap = 1;
  if (R.sr.drive && E) m.ramp = {x0: R.sr.drive.x0, x1: R.sr.drive.x1, t0: R.sr.drive.t0, t1: R.sr.drive.t1};
  return m;
}
// one send path (A.3): {sr} alone (target kept / deleted, undo, position) or riding with {set} (riders(), full sync)
function srSend(i, snap) {
  const E = AU.synth[i]; if (!E || E.dead) return;
  const m = srMsgOf(i, snap); if (m === undefined) return;
  R.sr.sent[i] = m !== null;
  E.n8({sr: m});
}
function srSyncAll(snap) { R.sr.ver++; for (let i = 0; i < NT(); i++) if (S.tracks[i] && S.tracks[i].kind === 'synth') srSend(i, snap); srMainKick(); }
// the riders of a full sync / a new engine (A2, A.3): lf, morph and sr in the SAME message as set, taken before it
function n8Riders(i, full) {
  const tr = S.tracks[i]; if (!tr) return null;
  let o = null;
  const lf = lfRider(i, true); if (lf) (o || (o = {})).lf = lf;
  const mo = stRider(i); if (mo) (o || (o = {})).morph = mo;
  const m = srMsgOf(i, !full); if (m !== undefined) { (o || (o = {})).sr = m; R.sr.sent[i] = m !== null; }
  return o;
}
// the hand (bar, TILT, double tap, undo): position now; at most 60 messages per second, coalesced per frame (5.2)
function srHand(x, src, phase) {
  x = clamp(+x || 0, 0, 1);
  const H = R.sr;
  if (phase === 'start') { H.hand = src || 'bar'; H.handX0 = S.sr ? S.sr.x : H.x; if (H.drive) srDriveStop(true); }
  H.x = x;
  srPostX();
  if (phase === 'end') {
    H.hand = null;
    if (S.sr && r4(x) !== S.sr.x) { const before = JSON.stringify(S.sr); S.sr.x = r4(x); undoPush({kind: 'sr', before, label: 'Super-Regler ' + Math.round((H.handX0 || 0) * 100) + ' % → ' + Math.round(x * 100) + ' %'}); markDirty(); }
  }
}
function srPostX() {
  if (R.sr.pend) return; R.sr.pend = true;
  const go = () => { if (!R.sr.pend) return; R.sr.pend = false; for (let i = 0; i < NT(); i++) if (R.sr.sent[i] && AU.synth[i]) AU.synth[i].n8({sr: {x: R.sr.x}}); srMainKick(); };
  requestAnimationFrame(go); setTimeout(go, 40);
}
// a ride (I1e core; the button comes with I1d after question 2): linear in the position from the CURRENT position to x1
function srDriveTo(x1, t0, t1, src) {
  const c = AU.ctx; if (!c) return false;
  const x0 = srAt(t0);
  R.sr.drive = {x0, x1: clamp(x1, 0, 1), t0, t1: Math.max(t1, t0 + .005), src: src || 'live'};
  for (let i = 0; i < NT(); i++) if (R.sr.sent[i] && AU.synth[i]) AU.synth[i].n8({sr: {ramp: {x0, x1: R.sr.drive.x1, t0, t1: R.sr.drive.t1}}});
  srMainKick(); return true;
}
function srDriveStop(keep) {
  const D = R.sr.drive; if (!D) return; const c = AU.ctx, x = c ? srAt(c.currentTime) : D.x1;
  R.sr.drive = null; R.sr.x = x; if (!keep) srPostX(); else srPostX();
}
// position at audio time t (drums per hit, heardAt, the main-thread steps): the ride exactly, else the hand position
function srAt(t) {
  const D = R.sr.drive;
  if (D) { const x = SRCORE.rampAt(D, t); if (t >= D.t1) { R.sr.x = D.x1; } return x; }
  return R.sr.x;
}
function srDriveTick() { const D = R.sr.drive, c = AU.ctx; if (D && c && c.currentTime >= D.t1 + .05) { R.sr.drive = null; R.sr.x = D.x1; if (D.src === 'matrix' && S.sr) { const before = JSON.stringify(S.sr); S.sr.x = r4(D.x1); undoPush({kind: 'sr', before, label: 'Super-Regler-Fahrt'}); markDirty(); } } }
// the shift of key k of track i at position x (SYNQUENZER.sr.path)
function srPathOf(i, k, x) {
  const T = srTabOf(i); if (!T) return 0;
  const e = T.wk.concat(T.main).find(q => q.k === k && !q.disc); if (e) return SRCORE.path(e.n, e.d, x);
  const dc = T.disc.concat(T.main).find(q => q.k === k && (q.disc || q.v)); if (dc) { const idx = SRCORE.stufe(dc.n, x, -1); return idx ? dc.v[idx - 1] : null; }
  return 0;
}
// the heard value of a path (A.11): ground, state (moving), super knob at time t; no LFO
function heardAt(i, k, t) {
  const tr = S.tracks[i]; if (!tr) return undefined;
  const D = srDesc(k), c = AU.ctx; if (t == null) t = c ? c.currentTime : 0;
  let b = stValAt(i, k, t); if (b === undefined) b = srGet(tr, k);
  if (!D || typeof b !== 'number' && !srIsDisc(D)) return b;
  const x = srAt(t), T = srTabOf(i); if (!T) return b;
  const all = T.wk.concat(T.disc, T.main);
  const e = all.find(q => q.k === k); if (!e) return b;
  if (e.d) return SRCORE.endVal(e.law, e.lo, e.hi, e.kk || 1, b, SRCORE.path(e.n, e.d, x));
  const idx = SRCORE.stufe(e.n, x, -1); return idx ? e.v[idx - 1] : b;
}
// the effective sound of track i at time t (state + super knob) for the native path and the main-thread keys; the ground
// sound itself when nothing applies (the same object: rule 28)
const SREFF = new WeakMap();
function srEffSnd(i, t) {
  const tr = S.tracks[i]; if (!tr || !tr.sound) return null;
  const T = S.sr ? srTabOf(i) : null, st = R.st[i];
  if (!T && !st) return tr.sound;
  const keys = new Set(); if (T) for (const e of T.wk.concat(T.disc, T.main)) keys.add(e.k); if (st) for (const k of st.keys) keys.add(k);
  if (!keys.size) return tr.sound;
  const s = JSON.parse(JSON.stringify(tr.sound));
  const fake = {kind: tr.kind, sound: s, gfx: tr.gfx ? Object.assign({}, tr.gfx) : null, stimme: tr.stimme};
  for (const k of keys) { const v = heardAt(i, k, t); if (v !== undefined) srSet(fake, k, v); }
  SREFF.set(s, fake);
  return s;
}
// track values on the main thread (5.5): fx.* (and gfx.* of the STIMME track, G4 priority) at the heard position
function srFx(tr, fx) {
  if (!tr) return fx;
  const i = S.tracks.indexOf(tr); if (i < 0) return fx;
  const T = S.sr ? srTabOf(i) : null, st = R.st[i]; if (!T && !st) return fx;
  const c = AU.ctx, t = c ? c.currentTime : 0, g = tr.stimme && tr.gfx && tr.gfx.on && !G4.ab;
  const has = k => (T && T.main.some(e => e.k === k)) || (st && st.keys.includes(k));
  for (const k of ['vol', 'pan', 'rev', 'dly', 'drive']) {
    if (g && (k === 'rev' || k === 'dly')) { if (has('gfx.' + k)) fx[k] = heardAt(i, 'gfx.' + k, t); continue; }
    if (has('fx.' + k)) { const v = heardAt(i, 'fx.' + k, t); if (isNum(v)) fx[k] = v; }
  }
  if (has('fx.chorus.mix') && fx.chorus) { fx.chorus = Object.assign({}, fx.chorus, {mix: heardAt(i, 'fx.chorus.mix', t)}); }
  return fx;
}
// drums (5.5): every hit reads its slot values at its own time
function srDrumP(id, P0, t) {
  const T = S.sr ? srTabOf(DRUM_T) : null, st = R.st[DRUM_T]; if (!T && !st) return P0;
  let P = null;
  const ks = new Set(); if (T) for (const e of T.main) if (e.k.startsWith('drum.' + id + '.')) ks.add(e.k); if (st) for (const k of st.keys) if (k.startsWith('drum.' + id + '.')) ks.add(k);
  for (const k of ks) { const v = heardAt(DRUM_T, k, t); if (v !== undefined) { if (!P) P = Object.assign({}, P0); P[k.split('.')[2]] = v; } }
  return P || P0;
}
// the main-thread steps (16 ms): only while something moves; track values, FM operators, native voices
function srMainKick() {
  if (R.sr.mainT) return;
  const anyMain = () => { for (let i = 0; i < NT(); i++) { const T = S.sr ? srTabOf(i) : null; if ((T && (T.main.length || (!AU.synth[i] && (T.wk.length || T.disc.length)))) || (R.st[i] && R.st[i].main)) return true; } return false; };
  if (!anyMain()) return;
  const step = () => {
    R.sr.mainT = 0;
    try {
      srDriveTick();
      const H = R.sr, now = performance.now(), dt = Math.min(.1, (now - (H.t || now)) / 1000); H.t = now;
      H.xs = SRCORE.smooth(H.xs, H.drive && AU.ctx ? srAt(AU.ctx.currentTime) : H.x, 1 - Math.exp(-dt / SRCORE.TAU));
      let moving = H.xs !== (H.drive ? NaN : H.x) || !!H.drive;
      for (let i = 0; i < NT(); i++) {
        const tr = S.tracks[i]; if (!tr) continue;
        const T = S.sr ? srTabOf(i) : null, st = R.st[i];
        if (st && st.t1 > (AU.ctx ? AU.ctx.currentTime : 0)) moving = true;
        if (!T && !st) continue;
        if ((T && T.main.some(e => e.k.startsWith('fx.') || e.k.startsWith('gfx.'))) || (st && st.keys.some(k => k.startsWith('fx.')))) applyTrackParams(i, false);
        if (tr.kind === 'synth' && AU.synth[i] && T && T.main.some(e => e.k.startsWith('fm6.') || e.k.startsWith('fmx.'))) wkFm6(i, false);
        if (tr.kind === 'synth' && !AU.synth[i]) { const eff = srEffSnd(i, AU.ctx ? AU.ctx.currentTime : 0); if (eff !== tr.sound) for (const k of (T ? T.wk.concat(T.disc, T.main).map(e => e.k) : []).concat(st ? st.keys : [])) if (!k.includes('.') && typeof eff.p[k] === 'number') liveUpdate(i, k, eff.p); }
      }
      if (moving) R.sr.mainT = setTimeout(step, 16);
    } catch (e) { logErr(e); }
  };
  R.sr.t = performance.now(); R.sr.mainT = setTimeout(step, 0);
}
// the FM patch of the worklet with the super knob / state on the operators (main-thread keys, 30 Hz through wkFm6)
function srFmPatch(i, fp) {
  if (!fp || !S.sr && !R.st[i]) return fp;
  const T = S.sr ? srTabOf(i) : null; if (!T || !T.main.some(e => e.k.startsWith('fm6.') || e.k.startsWith('fmx.'))) return fp;
  const eff = srEffSnd(i, AU.ctx ? AU.ctx.currentTime : 0); return eff && eff.p.fm6 ? wkFmOf(eff.p) : fp;
}

/* ---------- undo 'sr' (6.8) ---------- */
function srSnap() { return JSON.stringify(S.sr == null ? null : S.sr); }
function srRestore(o) {
  if (o) S.sr = srNorm(o, S.tracks); else delete S.sr;
  if (R.sr.drive && R.sr.drive.src !== 'song') R.sr.drive = null;
  R.sr.x = S.sr ? S.sr.x : 0;
  srSyncAll(false);
  if (UI.pop && UI.pop.k1r) UI.pop.k1r();
}
function srEdit(label, fn) { const before = srSnap(); const r = fn(); if (srSnap() !== before) { undoPush({kind: 'sr', before, label}); markDirty(); srSyncAll(false); } return r; }

/* ---------- teach-in core (6.3; the bar and the amber row come with I1d after question 2) ----------
   capture: every track in scope plays its working copy = base (+) super knob at p; edits go into the copy (the track's sound
   while the capture runs, so every editor works unchanged); keep: only keys changed in this capture become the target
   (continuous as delta in the knob space, stepped as the copy's value), the ground sound is restored deep-equal and the engine
   gets {set: base, sr: table} in ONE message - at p base + SR = copy, nothing audible changes. One undo step 'sr'. */
function srCapture(scope, t) {
  if (R.sr.cap) return {ok: false, why: 'Vormachen läuft schon'};
  if (rec.state === 'recording' || rec.state === 'overdub') return {ok: false, why: 'Erst Aufnahme beenden'};
  const x = r4(R.sr.x), Z = S.sr ? S.sr.z : [];
  if (x < .1) return {ok: false, why: x === 0 ? 'Bei 0 % klingt der Grundklang – den stellst du ganz normal im Editor ein' : 'Ziele liegen ab 10 % – Regler weiter nach rechts'};
  const near = Z.find(z => Math.abs(z.p - x) <= .05);
  if (!near) { const nb = Z.find(z => Math.abs(z.p - x) < .1); if (nb) return {ok: false, why: 'zu nah an ' + '②③④'[Z.indexOf(nb)] + ' – Regler weiter schieben'}; if (Z.length >= 3) return {ok: false, why: 'Höchstens 4 Klangzustände (mit Ausgang) – erst eins löschen'}; }
  const sc = scope === 'track' ? 'track' : 'all', ti = sc === 'track' ? (t == null ? R.selT : t) : null;
  const cap = {p: near ? near.p : x, sc, t: ti, base: {}, copy0: {}, undo0: UNDO.length, keys: {}};
  for (let i = 0; i < NT(); i++) {
    const tr = S.tracks[i]; if (!tr || (sc === 'track' && i !== ti)) continue;
    cap.base[i] = {sound: JSON.stringify(tr.sound), gfx: tr.gfx ? JSON.stringify(tr.gfx) : null};
    const eff = srEffSnd(i, AU.ctx ? AU.ctx.currentTime : 0), fk = SREFF.get(eff);
    if (eff !== tr.sound) { tr.sound = eff; if (fk && fk.gfx && tr.gfx) Object.assign(tr.gfx, fk.gfx); }
    cap.copy0[i] = {}; for (const k of srKeysOf(tr)) cap.copy0[i][k] = JSON.stringify(srGet(tr, k));
    if (tr.kind === 'synth' && AU.synth[i]) { R.sr.sent[i] = false; AU.synth[i].set(wkFlat(tr.sound), false, null, null, null, {sr: null}); }
  }
  R.sr.cap = cap;
  return {ok: true, p: cap.p};
}
function srCapEnd(keep) {
  const cap = R.sr.cap; if (!cap) return {ok: false};
  const before = srSnap(), Z = S.sr ? srCopy(S.sr.z) : [], made = {};
  let total = 0;
  for (const i in cap.base) {
    const tr = S.tracks[i]; if (!tr) continue;
    const base = {kind: tr.kind, sound: JSON.parse(cap.base[i].sound), gfx: cap.base[i].gfx ? JSON.parse(cap.base[i].gfx) : null, stimme: tr.stimme};
    if (keep) for (const k of srKeysOf(tr)) {
      const now = srGet(tr, k); if (JSON.stringify(now) === cap.copy0[i][k]) continue;
      const D = srDesc(k); if (!D) continue;
      const b = srGet(base, k);
      if (srIsDisc(D)) (made[tr.uid] || (made[tr.uid] = {c: {}, d: {}})).d[k] = now;
      else if (isNum(now) && isNum(b)) (made[tr.uid] || (made[tr.uid] = {c: {}, d: {}})).c[k] = r4(clamp(srToN(D, now) - srToN(D, b), -1, 1));
    }
    tr.sound = base.sound; if (tr.gfx && base.gfx) { for (const k in tr.gfx) delete tr.gfx[k]; Object.assign(tr.gfx, base.gfx); }
  }
  // the undo entries of the capture's own edits go (6.3 point 5: undo during capture only takes back capture edits)
  UNDO.length = Math.min(UNDO.length, cap.undo0); REDO.length = 0;
  R.sr.cap = null;
  if (keep && Object.keys(made).length) {
    let z = Z.find(q => Math.abs(q.p - cap.p) <= .05);
    if (!z) { z = {p: cap.p, u: {}}; Z.push(z); Z.sort((a, b) => a.p - b.p); }
    for (const uid in made) {
      const old = z.u[uid] || {}, c = Object.assign({}, old.c || {}, made[uid].c), d = Object.assign({}, old.d || {}, made[uid].d);
      for (const k in c) if (Math.abs(c[k]) < .0005 && !Z.some(q => q !== z && q.u[uid] && q.u[uid].c && k in q.u[uid].c)) delete c[k];
      z.u[uid] = {}; if (Object.keys(c).length) z.u[uid].c = c; if (Object.keys(d).length) z.u[uid].d = d;
      total += Object.keys(c).length + Object.keys(d).length;
    }
    const nr = srNorm(Object.assign({}, S.sr || {v: 1, x: R.sr.x, sc: cap.sc}, {z: Z, sc: cap.sc}, cap.sc === 'track' && S.tracks[cap.t] ? {t: S.tracks[cap.t].uid} : {}), S.tracks);
    S.sr = nr;
    undoPush({kind: 'sr', before, label: 'Ziel ' + '②③④'[Math.max(0, S.sr.z.findIndex(q => Math.abs(q.p - cap.p) <= .05))] + ' (' + Math.round(cap.p * 100) + ' %) gemerkt'}); markDirty();
  }
  // one message per engine: base without force and the table (6.3 point 6)
  for (const i in cap.base) {
    const ii = +i, tr = S.tracks[ii]; if (!tr) continue;
    if (tr.kind === 'synth' && AU.synth[ii]) { const m = srMsgOf(ii, false); R.sr.sent[ii] = m != null; AU.synth[ii].set(wkFlat(tr.sound), false, null, null, null, m === undefined ? undefined : {sr: m}); }
    applyTrackParams(ii, false);
  }
  srMainKick();
  if (UI.pop && UI.pop.k1r) UI.pop.k1r();
  return {ok: true, keys: total};
}

/* ---------- clip states and the scene morph (I1a, KZ1-KZ6) ---------- */
// the state of the clip that plays or switches on track i: keys and target values (ground + state) for the worklet
function stTargetOf(i, clip) {
  const tr = S.tracks[i], st = clip && clip.st; if (!tr) return null;
  const to = {}, ln = {}, disc = {}, keys = [];
  const prev = R.st[i];
  const all = new Set(); if (st) { for (const k in st.p) all.add(k); for (const k in st.fx || {}) all.add(k === 'chorus' ? 'fx.chorus.mix' : 'fx.' + k); for (const id in st.slots || {}) for (const k in st.slots[id]) all.add('drum.' + id + '.' + k); }
  if (prev) for (const k of prev.keys) all.add(k);                       // KZ5: a clip without a state drives back to the ground
  let main = false;
  for (const k of all) {
    const D = srDesc(k); if (!D) continue;
    let v;
    if (st && k in st.p) v = st.p[k];
    else if (st && k.startsWith('fx.')) { const f = st.fx || {}; v = k === 'fx.chorus.mix' ? (f.chorus ? f.chorus.mix : undefined) : f[k.slice(3)]; }
    else if (st && k.startsWith('drum.')) { const q = k.split('.'); v = st.slots && st.slots[q[1]] ? st.slots[q[1]][q[2]] : undefined; }
    if (v === undefined) v = srGet(tr, k);
    if (v === undefined) continue;
    keys.push(k);
    const wk = tr.kind === 'synth' && !k.includes('.') && (tr.sound.engine === 'analog' || tr.sound.engine === 'fm6');
    if (!wk) main = true;
    if (srIsDisc(D)) { if (wk) disc[k] = v; } else if (wk) { to[k] = v; ln[k] = [D.law, D.lo, D.hi, D.kk || 1]; }
  }
  if (!keys.length) return null;
  return {to, ln, disc, keys, main, clip};
}
// KZ1: hand switch from the tap to the bar line (at least 1 beat); song/chain 1 beat before; 'bar1'/'bar2' from the bar line;
// 'jump' 5 ms at the bar line
function stTimes(clip, now, tBar, song) {
  const sp = spb(), bpb = grid().beatsPerBar, x = clip && clip.st ? clip.st.x : 'flow';
  if (x === 'jump') return [tBar, tBar + .005];
  if (x === 'bar1' || x === 'bar2') return [tBar, tBar + (x === 'bar1' ? 1 : 2) * bpb * sp];
  let t0 = song ? Math.max(now, tBar - sp) : now, t1 = tBar;
  if (t1 - t0 < sp) t1 = t0 + sp;
  return [t0, t1];
}
function stStart(i, clip, t0, t1, tBar) {
  const tg = stTargetOf(i, clip);
  if (!tg) { R.st[i] = null; return; }
  const fromState = R.st[i] ? Object.assign({}, R.st[i].cur || {}) : {};
  const tr = S.tracks[i];
  for (const k of tg.keys) if (!(k in fromState)) { const v = stValAt(i, k, t0); fromState[k] = v === undefined ? srGet(tr, k) : v; }
  const target = {}; for (const k of tg.keys) { const v = k in tg.to ? tg.to[k] : k in tg.disc ? tg.disc[k] : undefined; target[k] = v !== undefined ? v : stTargetVal(i, clip, k); }
  R.st[i] = {from: fromState, to: target, t0, t1, at: tBar, keys: tg.keys, main: tg.main, clip, hand: new Set()};
  const E = AU.synth[i];
  if (E && !E.dead && (Object.keys(tg.to).length || Object.keys(tg.disc).length)) E.n8({morph: {id: (++R.stId || (R.stId = 1)), t0, t1, curve: 's', to: tg.to, ln: tg.ln, disc: tg.disc, at: tBar}});
  srMainKick();
}
function stTargetVal(i, clip, k) {
  const st = clip && clip.st, tr = S.tracks[i];
  if (st) { if (k in st.p) return st.p[k]; if (k.startsWith('fx.')) { const f = st.fx || {}; const v = k === 'fx.chorus.mix' ? (f.chorus ? f.chorus.mix : undefined) : f[k.slice(3)]; if (v !== undefined) return v; }
    if (k.startsWith('drum.')) { const q = k.split('.'); const v = st.slots && st.slots[q[1]] ? st.slots[q[1]][q[2]] : undefined; if (v !== undefined) return v; } }
  return srGet(tr, k);
}
// the moving state value of key k at time t (undefined = no state on this track / key)
function stValAt(i, k, t) {
  const M = R.st[i]; if (!M || !M.keys.includes(k) || M.hand.has(k)) return undefined;
  const a = M.from[k], b = M.to[k]; if (a === undefined) return b;
  const D = srDesc(k);
  if (!D || srIsDisc(D) || typeof a !== 'number' || typeof b !== 'number') return t >= M.at ? b : a;
  const u = (t - M.t0) / Math.max(1e-4, M.t1 - M.t0), s = SRCORE.sCurve(u);
  if (s >= 1) return b; if (s <= 0) return a;
  return srFromN(D, srToN(D, a) + (srToN(D, b) - srToN(D, a)) * s);
}
// the rider of a full sync: the state's current values as {morph} toward the target with the remaining time (A2)
function stRider(i) {
  const M = R.st[i]; if (!M) return null;
  const c = AU.ctx, now = c ? c.currentTime : 0, tr = S.tracks[i];
  const to = {}, ln = {}, disc = {};
  for (const k of M.keys) {
    if (k.includes('.') || tr.kind !== 'synth') continue; const D = srDesc(k); if (!D) continue;
    if (srIsDisc(D)) { if (now < M.at) disc[k] = M.to[k]; } else { to[k] = M.to[k]; ln[k] = [D.law, D.lo, D.hi, D.kk || 1]; }
  }
  if (!Object.keys(to).length && !Object.keys(disc).length) return null;
  return {id: R.stId || 0, t0: Math.min(now, M.t1), t1: Math.max(now + .005, M.t1), curve: 's', to, ln, disc, at: Math.max(now, M.at)};
}
// called from tick() for every synth/drum track: a switch that waits (pend), or a clip that plays without its state yet
function stTick(i, now) {
  const tr = S.tracks[i]; if (!tr) return;
  const p = R.pend[i];
  if (p && !p.stSeen) {
    p.stSeen = true;
    const clip = p.slot >= 0 ? tr.clips[p.slot] : null;
    if ((clip && clip.st) || R.st[i]) { const tBar = b2t(p.beat), [t0, t1] = stTimes(clip, now, tBar, !!p.song); stStart(i, clip, t0, t1, tBar); }
    return;
  }
  if (p) return;
  const s = R.slot[i], clip = s >= 0 ? (ownPlaying(i) || tr.clips[s]) : null;
  if (clip && clip.st && (!R.st[i] || R.st[i].clip !== clip)) stStart(i, clip, now, now + .005, now);   // start of the transport: at once
}
function stHand(i, k) { const M = R.st[i]; if (M && M.keys.includes(k) && now_() < M.t1) M.hand.add(k); }    // KZ6
const now_ = () => (AU.ctx ? AU.ctx.currentTime : 0);

/* ---------- the drawn LFO table (I3a 4.2): with the sound whenever it has a form, independent of the chosen shape ---------- */
function lfRider(i, force) {
  const tr = S.tracks[i], E = AU.synth[i]; if (!tr || tr.kind !== 'synth' || !tr.sound) return null;
  const p = tr.sound.p; if (!p.l1f && !p.l2f && !(E && E.lfSig)) return null;
  const sig = FORM.hash(p.l1f) + '|' + FORM.hash(p.l2f);
  if (!force && E && E.lfSig === sig) return null;
  if (E) E.lfSig = sig;
  return [p.l1f ? FORM.tab(p.l1f) : null, p.l2f ? FORM.tab(p.l2f) : null];
}
// wkLf (4.2 b/c): a new table of LFO n at once (preview of a wipe sends the raw state, an abort the stored one)
function wkLf(i, n, f) {
  const E = AU.synth[i]; if (!E || E.dead) return;
  const a = [false, false]; a[n - 1] = f ? FORM.tab(f) : null;
  E.lfSig = null; E.n8({lf: a});
}

/* ---------- Mod-Übersicht (K1, A.11): state rows then super-knob rows, one per key and cause ---------- */
function n8K1Rows(i, out) {
  const tr = S.tracks[i]; if (!tr) return out;
  const fmtV = (k, v) => { const D = srDesc(k); if (!D || !D.d) return typeof v === 'number' ? k1Num(v, 2) : String(v); try { return fmtVal(D.d.fmt, v); } catch (e) { return String(v); } };
  tr.clips.forEach((c, s) => { if (!c || !c.st) return;
    const sc = S.scenes && S.scenes[s] ? S.scenes[s].name || ('Szene ' + (s + 1)) : 'Szene ' + (s + 1);
    for (const k in c.st.p) { const D = srDesc(k); if (!D) continue; out.push({key: 'st:' + s + ':' + k, src: 'Klangzustand ◆ ' + sc, dst: D.l, amt: fmtV(k, srGet(tr, k)) + ' → ' + fmtV(k, c.st.p[k]), kind: 'st', s, p: k}); }
  });
  if (S.sr && S.sr.z.length) {
    const ks = new Map();
    for (const z of S.sr.z) { const e = z.u[tr.uid]; if (!e) continue; for (const k in e.c || {}) (ks.get(k) || ks.set(k, []).get(k)).push([z.p, e.c[k], 'c']); for (const k in e.d || {}) (ks.get(k) || ks.set(k, []).get(k)).push([z.p, e.d[k], 'd']); }
    for (const [k, L] of ks) {
      const D = srDesc(k); if (!D) continue; const b = srGet(tr, k);
      const vals = L.map(([p, v, c]) => (c === 'd' ? fmtV(k, v) : fmtV(k, srFromN(D, srToN(D, b) + v))) + ' (' + Math.round(p * 100) + ' %)');
      out.push({key: 'sr:' + k, src: 'Super-Regler', dst: D.l, amt: fmtV(k, b) + ' → ' + vals.join(' → '), kind: 'sr', p: k});
    }
  }
  return out;
}
function n8K1Del(i, e) {
  const tr = S.tracks[i];
  if (e.kind === 'sr') return srEdit('Super-Regler ' + e.dst + ' gelöscht', () => { for (const z of S.sr.z) { const q = z.u[tr.uid]; if (!q) continue; if (q.c) delete q.c[e.p]; if (q.d) delete q.d[e.p]; if (q.c && !Object.keys(q.c).length) delete q.c; if (q.d && !Object.keys(q.d).length) delete q.d; if (!q.c && !q.d) delete z.u[tr.uid]; } return true; });
  if (e.kind === 'st') { const c = tr.clips[e.s]; if (!c || !c.st) return false; const before = cleanClip(c); delete c.st.p[e.p]; if (!Object.keys(c.st.p).length && !c.st.fx && !c.st.slots) delete c.st; pushUndo(i, e.s, before, 'Klangzustand ' + e.dst + ' gelöscht'); markDirty(); return true; }
  return false;
}

// the flat values of a {set} (full sync or knob flush) while a clip state holds keys: the state's value is the base (A2, V6a)
function n8Flat(i, o, only) {
  const M = R.st[i]; if (!M) return o;
  const t = now_();
  for (const k of M.keys) { if (k.includes('.') || (only && !(k in o)) || M.hand.has(k)) continue; const v = stValAt(i, k, t); if (typeof v === 'number') o[k] = v; }
  return o;
}
