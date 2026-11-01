/* ===== ND-P (Paket North-Platte): block sq-ndp-src, evaluated on first open (ndpLoad, Muster sq-mk-src). Das Instrument-Gesicht
   der Drum-Engine MD_NAME: rote Front, schwarze Beschriftungsfelder, Kanal-Tasten in zwei Bänken, 3-stelliges Siebensegment-Display,
   großes Rad, Sektionen TONE · NOISE · CLICK · MIX/FX mit Regler-Paaren (obere/untere Reihe wie am Gerät, §1.3–§1.9) und die
   Kit-Effekte HALL · ECHO (§1.10). Keine eigene Datenhaltung: jede Bedienung schreibt über dieselben Wege wie der North-Editor
   (mdSet, mdScl, mdKitSet, mdTap, soundSnapshot/commitSound auf DRUM_T) → slot.md und p.md, ein Undo je Geste.
   DOM + CSS (Block NDP-CSS), Siebensegment als SVG, keine Bilddaten, keine neue Schrift. ===== */
(function () {
'use strict';
const NDP_CSS = `/*@NDP_PLATTE_CSS@*/`;
const P = {open: false, root: null, fr: null, view: 'geraet', sec: 'tone', rows: {}, shiftLatch: false, shiftHold: 0, zoom: false, bank: 0, focus: 'mDec',
  enc: 'val', ver: '', raf: 0, ui: null, land: false, lastTap: null, seen: false, hitT: {}, rsT: 0, kitIdx: 0, encAcc: 0, moves: 0, moveMs: 0, moveMax: 0, moveL: []};
// die Sektionen: je Spalte ein Bedien-Paar [obere Reihe, untere Reihe] (§1.3, §1.7, §1.8, §1.9, §1.10)
const SECS = [
  {id: 'tone', l: 'TONE', cols: [['mSpc', 'mWav'], ['mFrq', 'mDyf'], ['mDec', 'mode'], ['mBnd', 'mBt'], ['mPit', 'scl']], part: 'tone'},
  {id: 'noise', l: 'NOISE', cols: [['mNres', 'mNtyp'], ['mNfrq', 'mNdyf'], ['mNdec', 'nmode']], part: 'noise'},
  {id: 'click', l: 'CLICK', cols: [['mClv', 'mCty']], part: 'click'},
  {id: 'mix', l: 'MIX · FX', cols: [['mNlv', 'mTlv'], ['mLvl', 'mPan'], ['mEqf', 'mEqg'], ['mDst', 'mDty'], ['mRvb', 'mDly']], part: 'all'},
  {id: 'kit', l: 'HALL · ECHO', cols: [['k.rvT', 'k.rvC'], ['k.dl', 'k.dlF']], part: 'all', kit: 1},
];
const SEC_BY = Object.fromEntries(SECS.map(s => [s.id, s]));
const secOfKey = k => SECS.find(s => s.cols.some(c => c.includes(k))) || SECS[0];
const shiftOn = () => P.shiftLatch || P.shiftHold > 0;
const rowOf = (sec, c) => (shiftOn() ? 1 : P.rows[sec + ':' + c] | 0);
const curSl = () => mdCurSl();
const isMd = () => mdIsSrc(curSl().id);
/* ---------- Parameter-Beschreibungen: dieselben Zell-Daten wie der North-Editor (MD_CELL, MDN.K, MDN.KK) ---------- */
const SEGX = s => String(s).replace(/[+\s♩♪♬]/g, '').replace(/[−–]/g, '-').replace(/,/g, '.');
const D_ = new Map();
function desc(key) {
  let d = D_.get(key); if (d) return d;
  if (key.startsWith('k.')) d = kitDesc(key.slice(2));
  else {
    const C = MD_CELL[key]; d = {key, l: C.l, what: C.what};
    if (C.dyn) {
      const n = C.vals.length, N = n + 51;
      Object.assign(d, {kind: 'list', min: 0, max: N - 1, def: 0, list: 1,
        get: () => { const s = mdCur(); return s[C.m] === 'D' ? n + s[C.d] : Math.max(0, C.vals.indexOf(s[C.m])); },
        set: v => { const i = clamp(Math.round(v), 0, N - 1); if (i < n) mdSet(C.m, C.vals[i]); else { mdSet(C.m, 'D'); mdSet(C.d, i - n); } },
        str: v => { const i = Math.round(v); return i < n ? (key === 'nmode' && C.vals[i] === 'E1' ? 'E' : C.vals[i]) : String(i - n); },
        sub: v => { const i = Math.round(v); return i < n ? MD_MODE_S[C.vals[i]] : 'Dyn. ' + mdTime(mdT(i - n)); },
        long: v => { const i = Math.round(v); return i < n ? MD_MODE[C.vals[i]] : 'Dynamic Decay: leise ' + mdTime(mdT(i - n)) + ', voll = DECAY'; }});
    } else if (C.vals) {
      const V = C.vals;
      Object.assign(d, {kind: 'list', min: 0, max: V.length - 1, list: 1, def: key === 'scl' ? 0 : Math.max(0, V.indexOf(MDN.K[key][4])),
        get: () => Math.max(0, V.indexOf(key === 'scl' ? MDE.scl : mdCur()[key])),
        set: v => { const x = V[clamp(Math.round(v), 0, V.length - 1)]; if (key === 'scl') mdScl(x); else mdSet(key, x); },
        str: v => { const x = V[clamp(Math.round(v), 0, V.length - 1)]; return key === 'scl' && !x ? '--' : x; },
        sub: v => { const x = V[clamp(Math.round(v), 0, V.length - 1)]; return key === 'scl' ? (x ? MD_SCL[x][0] : 'aus') : C.sub(x) || ''; },
        long: v => { const x = V[clamp(Math.round(v), 0, V.length - 1)]; return key === 'scl' ? (x ? MD_SCL[x][0] + ' ab dem tiefsten Kanal' : 'aus – Start beim tiefsten Kanal') : key === 'mWav' ? (MD_WAVE[x] || ['', ''])[1] : C.long ? C.long(x) : C.sub(x) || C.what; }});
    } else {
      const [a, b] = C.n;
      Object.assign(d, {kind: 'num', min: a, max: b, def: MDN.K[key][4], bip: !!C.bip, pit: !!C.pit,
        get: () => mdCur()[key],
        set: (v, fine) => mdSet(key, C.pit && fine ? Math.round(v * 10) / 10 : Math.round(v)),
        str: v => (C.fmt ? C.fmt(Math.round(v)) : C.pit ? (Math.round(v * 10) / 10).toFixed(1) : C.bip ? mdSgn(Math.round(v)) : String(Math.round(v))),
        sub: v => C.sub(C.pit ? v : Math.round(v), mdCur()) || '', long: v => C.sub(C.pit ? v : Math.round(v), mdCur()) || C.what});
    }
    d.inert = () => !isMd() || !!(C.inert && C.inert(mdCur()));
    d.why = () => (!isMd() ? 'Kanal spielt die Drum-Stimme – SHIFT + Kanal-Taste = ' + MD_NAME : key === 'mEqf' ? 'ohne Wirkung bei EQ GAIN 0' : 'ohne Wirkung bei WAVE ' + mdCur().mWav);
    d.seg = v => SEGX(d.str(v));
  }
  D_.set(key, d); return d;
}
function kitDesc(k) {
  const d = {key: 'k.' + k, kit: 1, inert: () => !mdUsed(), why: () => 'erst ein ' + MD_NAME + '-Pad wählen'};
  if (k === 'rvT') { const RV = MDN.KK.rvT[1]; Object.assign(d, {l: 'REVERB TYPE', what: 'Art des gemeinsamen Halls', kind: 'list', list: 1, min: 0, max: RV.length - 1, def: RV.indexOf(MDN.KK.rvT[3]),
    get: () => Math.max(0, RV.indexOf(mdKit().rvT)), set: v => mdKitSet('rvT', RV[clamp(Math.round(v), 0, RV.length - 1)]), str: v => RV[Math.round(v)], sub: v => MD_RVT[RV[Math.round(v)]], long: v => MD_RVT[RV[Math.round(v)]]}); }
  else if (k === 'rvC') Object.assign(d, {l: 'COLOR', what: 'Klangfarbe des Halls', kind: 'num', min: -9, max: 9, def: 0, bip: true, get: () => mdKit().rvC, set: v => mdKitSet('rvC', Math.round(v)), str: v => mdSgn(Math.round(v)),
    sub: v => (v < 0 ? 'Höhen weg' : v > 0 ? 'Tiefen weg' : 'neutral'), long: v => (v < 0 ? 'Höhen weg' : v > 0 ? 'Tiefen weg' : 'neutral')});
  else if (k === 'dlF') Object.assign(d, {l: 'FEEDBACK', what: 'Wiederholungen des Echos', kind: 'num', min: 0, max: 20, def: 0, get: () => mdKit().dlF, set: v => mdKitSet('dlF', Math.round(v)), str: v => String(Math.round(v)),
    sub: v => (v ? (Math.round(v) >= 20 ? 'fast endlos' : Math.round(v) + ' / 20') : 'ein Echo'), long: v => (v ? (Math.round(v) >= 20 ? 'fast endlos' : Math.round(v) + ' / 20') : 'ein Echo')});
  else {   // k.dl: RATE (0–99) bzw. BPM (Strecke 0–470), je nach Echo-Modus des Kits
    const b = () => mdKit().dlM === 'b';
    Object.defineProperty(d, 'l', {get: () => (b() ? 'BPM' : 'RATE'), enumerable: true});
    Object.defineProperty(d, 'max', {get: () => (b() ? 470 : 99), enumerable: true});
    Object.defineProperty(d, 'def', {get: () => (b() ? 60 : 50), enumerable: true});
    Object.assign(d, {what: 'Echo-Zeit', kind: 'num', min: 0, get: () => (b() ? mdKit().dlB : mdKit().dlR), set: v => mdKitSet(b() ? 'dlB' : 'dlR', Math.round(v)),
      str: v => (b() ? mdBpmTxt(Math.round(v)) : String(Math.round(v))),
      sub: v => mdTime(b() ? MD_BPM[clamp(Math.round(v), 0, 470)][2] : 1.15 * Math.pow(.01 / 1.15, Math.round(v) / 99)), long: v => 'Echo ' + mdTime(b() ? MD_BPM[clamp(Math.round(v), 0, 470)][2] : 1.15 * Math.pow(.01 / 1.15, Math.round(v) / 99))});
    d.seg = v => { if (!b()) return String(Math.round(v)); const x = MD_BPM[clamp(Math.round(v), 0, 470)]; return x[1] === 's' ? String(Math.round(x[0] * 1000)) : String(x[0]); };
  }
  if (!d.seg) d.seg = v => SEGX(d.str(v));
  return d;
}
const norm = (d, v) => { const lo = d.min, hi = d.max; return hi > lo ? clamp((v - lo) / (hi - lo), 0, 1) : 0; };
const angle = (d, v) => -135 + 270 * norm(d, v);
/* ---------- Siebensegment (3 Stellen + Punkte) ---------- */
const SEGP = {a: 'M12 4h36l-6 7H18z', b: 'M50 6l-7 7v30l7 6z', c: 'M50 51l-7 6v30l7 7z', d: 'M12 96h36l-6-7H18z', e: 'M10 51l7 6v30l-7 7z', f: 'M10 6l7 7v30l-7 6z', g: 'M14 50l5-5h22l5 5-5 5H19z'};
const SEGC = {0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg', A: 'abcefg', b: 'cdefg', C: 'adef', c: 'deg', d: 'bcdeg',
  E: 'adefg', F: 'aefg', G: 'acdef', H: 'bcefg', h: 'cefg', i: 'c', I: 'bc', J: 'bcd', L: 'def', n: 'ceg', o: 'cdeg', O: 'abcdef', P: 'abefg', p: 'abefg', r: 'eg', S: 'acdfg', s: 'acdfg',
  t: 'defg', U: 'bcdef', u: 'cde', v: 'cde', y: 'bcdfg', '-': 'g', _: 'd', ' ': ''};
function segDigit() {
  const ns = 'http://www.w3.org/2000/svg', s = document.createElementNS(ns, 'svg'); s.setAttribute('viewBox', '0 0 66 100'); s.setAttribute('aria-hidden', 'true');
  const g = {}; for (const k in SEGP) { const p = document.createElementNS(ns, 'path'); p.setAttribute('d', SEGP[k]); p.setAttribute('class', 's'); s.appendChild(p); g[k] = p; }
  const dp = document.createElementNS(ns, 'circle'); dp.setAttribute('cx', '59'); dp.setAttribute('cy', '93'); dp.setAttribute('r', '5'); dp.setAttribute('class', 'dp'); s.appendChild(dp); g.dp = dp;
  s._g = g; s._k = ''; return s;
}
// Text → 3 Zellen (Punkt hängt an der Zelle davor); zu lang: Nachkomma weg (Punkt bleibt als Zeichen für „mehr“), dann rechts bündig gekürzt
function segCells(t) {
  t = String(t == null ? '' : t); const c = [];
  for (const ch of t) { if (ch === '.') { if (c.length) c[c.length - 1].dp = 1; else c.push({ch: ' ', dp: 1}); } else c.push({ch, dp: 0}); }
  if (c.length > 3 && t.includes('.')) { const k = c.findIndex(x => x.dp); if (k >= 0 && k < 3) { c.length = k + 1; } }
  while (c.length > 3) c.shift();
  while (c.length < 3) c.unshift({ch: ' ', dp: 0});
  return c;
}
function segPaint(digs, t) {
  const cells = segCells(t);
  digs.forEach((s, i) => { const x = cells[i], key = x.ch + (x.dp ? '.' : ''); if (s._k === key) return; s._k = key; const on = SEGC[x.ch] != null ? SEGC[x.ch] : SEGC[x.ch.toUpperCase()] || '';
    for (const k in SEGP) s._g[k].classList.toggle('on', on.includes(k)); s._g.dp.classList.toggle('on', !!x.dp); });
}
/* ---------- Aufbau ---------- */
const keyEl = (a, html, cls) => { const b = el('div', 'ndpkey' + (cls ? ' ' + cls : ''), html); b.dataset.a = a; b.setAttribute('role', 'button'); return b; };
function build() {
  const R0 = P.root; R0.innerHTML = '';
  P.land = window.innerWidth > window.innerHeight; R0.classList.toggle('ndpq', P.land);
  const ui = P.ui = {knob: {}, lab: {}, key: {}, ch: [], pads: []};
  // Kopf: ✕ ↶ ↷ ▶ · North / Kit · [GERÄT | SPIEL] · ⋯
  const h = el('div', 'ndph');
  const x = el('button', 'ndpx', '✕'); x.setAttribute('aria-label', 'Platte schließen'); onTap(x, () => close());
  const u = el('button', 'ndpu', '↶'), rd = el('button', 'ndpr', '↷'); u.setAttribute('aria-label', 'Rückgängig'); rd.setAttribute('aria-label', 'Wiederholen');
  onTap(u, () => undo()); onTap(rd, () => redo());
  const pl = el('button', 'ndpplay', '<i class="pl ndptri"></i><i class="st ndpsq"></i>'); pl.setAttribute('aria-label', 'Song Start / Stopp');
  on(pl, 'pointerdown', e => { e.preventDefault(); ensureAudio(); togglePlay(); });
  const tt = el('div', 'ndpttl', `<b>${esc(MD_NAME)}</b><small></small>`);
  const tabs = el('div', 'ndptabs'); for (const [id, l] of [['geraet', 'GERÄT'], ['spiel', 'SPIEL']]) { const b = el('button', P.view === id ? 'on' : '', l); b.dataset.v = id; tabs.appendChild(b); }
  onTap(tabs, b => { if (b.dataset.v !== P.view) { P.view = b.dataset.v; build(); } }, 'button');
  const more = el('button', 'ndpm', '⋯'); more.setAttribute('aria-label', 'Mehr: Programm, Kanal, Quelle'); onTap(more, () => morePop(more));
  h.append(x, u, rd, pl, tt, tabs, more); R0.appendChild(h);
  ui.undo = u; ui.redo = rd; ui.kitT = tt.querySelector('small');
  const fr = P.fr = el('div', 'ndpfr'); R0.appendChild(fr);
  if (P.view === 'spiel') buildSpiel(fr); else buildPlate(fr);
  wire(fr);
  P.ver = ''; paint();
}
function buildPlate(fr) {
  const ui = P.ui, pl = el('div', 'ndppl'); fr.appendChild(pl);
  pl.appendChild(el('div', 'ndptop', `<span class="ndpname">${esc(MD_NAME)}</span><span class="ndpkitn"></span>`)); ui.kitn = pl.querySelector('.ndpkitn');
  // Display-Feld
  const dsp = el('div', 'ndpdisp');
  const seg = el('div', 'ndpseg ndpfld'); seg.dataset.a = 'disp'; seg.setAttribute('role', 'button'); seg.setAttribute('aria-label', 'Display: Modus WERT / PROG / KIT');
  ui.dig = [segDigit(), segDigit(), segDigit()]; ui.dig.forEach(s => seg.appendChild(s));
  const sl = el('div', 'ndpsegl', '<i data-m="val">WERT</i><i data-m="prog">PROG</i><i data-m="kit">KIT</i>'); seg.appendChild(sl); ui.segl = [...sl.children];
  const mode = el('div', 'ndpmode');
  mode.append(keyEl('prog', '<i class="led"></i><span>PROG</span>'), keyEl('kit', '<i class="led"></i><span>KIT</span>'), keyEl('enter', '<span>LISTE</span>'));
  const enc = el('div', 'ndpenc', '<div class="cap"></div><div class="rot"><i></i></div><span class="el">WERT</span>'); enc.dataset.a = 'enc'; enc.setAttribute('role', 'slider'); enc.setAttribute('aria-label', 'Rad');
  ui.enc = enc; ui.encRot = enc.querySelector('.rot'); ui.encL = enc.querySelector('.el');
  const strip = el('div', 'ndpstrip ndpfld', '<b></b><span></span>'); ui.s1 = strip.children[0]; ui.s2 = strip.children[1];
  dsp.append(seg, mode, enc, strip); pl.appendChild(dsp);
  // Sektions-Tasten mit LED
  const secs = el('div', 'ndpsecs');
  for (const s of SECS) { const k = keyEl('sec:' + s.id, `<i class="led"></i><span>${s.kit ? 'HALL<br>ECHO' : esc(s.l)}</span>`, s.kit ? 'kit' : ''); k.setAttribute('aria-label', 'Sektion ' + s.l); secs.appendChild(k); }
  pl.appendChild(secs);
  const field = el('div', 'ndpfield'); ui.field = field; pl.appendChild(field);
  // Funktions-Tasten
  const fn = el('div', 'ndpfn');
  fn.append(keyEl('shift', '<i class="led"></i><span>SHIFT</span>'), keyEl('all', '<i class="led"></i><span>ALLE KAN.</span>'), keyEl('solo', '<i class="led"></i><span>SOLO PART</span>'), keyEl('trig', '<i class="ndptri"></i>', 'trig'));
  fn.querySelector('[data-a="trig"]').setAttribute('aria-label', 'TRIG: Kanal anschlagen');
  pl.appendChild(fn);
  // Kanal-Tasten: Hochformat eine Bank (6) + BANK, Querformat beide Bänke
  const ch = el('div', 'ndpch'); ui.chRow = ch; pl.appendChild(ch);
  for (const a of ['prog', 'kit', 'enter', 'shift', 'all', 'solo', 'trig']) ui.key[a] = pl.querySelector('[data-a="' + a + '"]');
  for (const s of SECS) ui.key['sec:' + s.id] = pl.querySelector('[data-a="sec:' + s.id + '"]');
  buildCh(); buildField(); requestAnimationFrame(() => { if (P.open && P.ui === ui) { size(); paint(); } }); size();
}
function buildCh() {
  const ui = P.ui, ch = ui.chRow; ch.innerHTML = ''; ui.ch = [];
  const bankBox = b => { const box = el('div', 'bank'); for (let j = 0; j < 6; j++) { const i = b * 6 + j, v = DRUM_VOICES[i];
    const k = keyEl('ch:' + i, `<i class="led"></i><span>${esc(v.sl)}</span><small class="nr">${i + 1}</small>`); k.setAttribute('aria-label', 'Kanal ' + (i + 1) + ' ' + v.l); box.appendChild(k); ui.ch[i] = k; } return box; };
  P.two = !P.land && window.innerHeight >= 780; ch.classList.toggle('two', P.two);   // hohes Hochformat: beide Bänke übereinander
  if (P.land || P.two) { ch.append(bankBox(0), bankBox(1)); }
  else { const bk = keyEl('bank', '<i class="led"></i><span>BANK</span><small></small>', 'bk'); bk.setAttribute('aria-label', 'Bank 1–6 / 7–12'); ui.key.bank = bk; ch.append(bk, bankBox(P.bank)); }
}
function buildField() {
  const ui = P.ui, f = ui.field; if (!f) return; f.innerHTML = ''; ui.knob = {}; ui.lab = {};
  const S_ = SEC_BY[P.sec] || SECS[0];
  f.classList.toggle('zoom', P.zoom);
  const knob = key => { const d = desc(key), k = el('div', 'ndpk' + (d.bip ? ' bip' : ''), '<div class="arc"></div><div class="cap"></div><div class="rot"><i></i></div>'); k.dataset.a = 'knob'; k.dataset.k = key; k.setAttribute('role', 'slider'); k.setAttribute('aria-label', d.l); return k; };
  if (P.zoom) {
    S_.cols.forEach(c => c.forEach((key, r) => { const z = el('div', 'ndpzc'); z.style.gridRow = String(r + 1); const lab = el('div', 'zl', `${esc(desc(key).l)}<em></em>`); const k = knob(key);
      if (r === 0) z.append(lab, k); else z.append(k, lab); f.appendChild(z); ui.knob[key] = k; ui.lab[key] = {el: lab, vl: lab.querySelector('em'), zoom: 1}; }));
    if (S_.kit) f.appendChild(kitKeys(true));
  } else {
    S_.cols.forEach((c, ci) => { const col = el('div', 'ndpcol'); col.dataset.c = ci;
      const mk = r => { const key = c[r], b = el('div', 'ndplab ' + (r ? 'dn' : 'up'), '<span class="nm"></span><span class="vl"></span>'); b.dataset.a = 'lab'; b.dataset.k = key; b.dataset.c = ci; b.dataset.r = r; b.setAttribute('role', 'button');
        ui.lab[key] = {el: b, nm: b.children[0], vl: b.children[1]}; return b; };
      const k = knob(c[0]); k.dataset.c = ci; col.append(mk(0), k, mk(1)); f.appendChild(col); ui.knob['c' + ci] = k; });
    if (S_.kit) f.appendChild(kitKeys(false));
  }
  for (const a of ['rate', 'tap']) ui.key[a] = f.querySelector('[data-a="' + a + '"]');
}
function kitKeys(z) {
  const c = el('div', 'ndpkcol'); c.style.gridRow = z ? '1 / span 2' : '';
  c.append(keyEl('rate', '<i class="led"></i><span>RATE | BPM</span>'), keyEl('tap', '<i class="led"></i><span>TAP</span>'));
  return c;
}
// Größen aus dem freien Platz (eine Messung je Aufbau / Drehung): Regler ≥ 44 px, Rad, linke Spalte im Querformat
function size() {
  const ui = P.ui, R0 = P.root; if (!ui || !ui.field) return;
  if (P.land) R0.style.setProperty('--wl', Math.round(clamp(window.innerWidth * .27, 220, 300)) + 'px');
  const tall = !P.land && window.innerHeight >= 780; R0.style.setProperty('--sh', (tall ? 96 : 64) + 'px'); R0.classList.toggle('tall', tall);
  const r = ui.field.getBoundingClientRect(); if (!r.width || !r.height) return;
  const colW = r.width / 5 - 8;
  const ks = P.zoom ? Math.min(colW, (r.height - 2 * 24 - 14) / 2) : Math.min(colW, r.height - 2 * 44 - 10);
  R0.style.setProperty('--ks', Math.round(clamp(ks, 44, 96)) + 'px');
  let es = tall ? 156 : 112;
  if (P.land) { const fn = P.root.querySelector('.ndpfn').getBoundingClientRect(), dw = ui.enc.parentNode.getBoundingClientRect().width, st = ui.s1.parentNode.getBoundingClientRect().height;
    es = Math.min(dw - 10, fn.bottom - r.top - 64 - st - 44 - 3 * 6 - 6); }
  R0.style.setProperty('--es', Math.round(clamp(es, 72, 170)) + 'px');
}
/* ---------- Spiel-Ansicht: 12 große Pads, Anschlag nach Tipp-Höhe (oben laut) ---------- */
function buildSpiel(fr) {
  const ui = P.ui, sp = el('div', 'ndpsp');
  const top = el('div', 'sptop'); const seg = el('div', 'ndpseg ndpfld'); ui.dig = [segDigit(), segDigit(), segDigit()]; ui.dig.forEach(s => seg.appendChild(s));
  const strip = el('div', 'ndpstrip ndpfld', '<b></b><span></span>'); ui.s1 = strip.children[0]; ui.s2 = strip.children[1];
  top.append(seg, strip);
  const pads = el('div', 'pads'); ui.pads = [];
  DRUM_VOICES.forEach((v, i) => { const p = el('div', 'ndppad', `<i class="led"></i><span>${esc(v.sl)}</span><small></small>`); p.dataset.a = 'pad:' + i; p.setAttribute('role', 'button'); p.setAttribute('aria-label', 'Spielen: ' + v.l); pads.appendChild(p); ui.pads[i] = p; });
  sp.append(top, pads); fr.appendChild(sp);
}
/* ---------- Anzeigen ---------- */
function curDesc() { return desc(P.focus); }
function stripTxt(a, b) { const ui = P.ui; if (!ui || !ui.s1) return; if (ui.s1.textContent !== a) ui.s1.textContent = a; if (ui.s2.textContent !== b) ui.s2.textContent = b; }
function paintDisp() {
  const ui = P.ui; if (!ui || !ui.dig) return;
  const sl = curSl();
  if (P.view === 'spiel') { segPaint(ui.dig, String(sl.idx + 1)); const s = mdSlot(sl.id); stripTxt(sl.l + ' · ' + (isMd() ? MD_NAME : 'Drum-Stimme'), isMd() ? (s.mName || 'INIT') + ' · Tipp oben = laut, unten = leise' : 'Tipp = spielen'); return; }
  if (P.enc === 'prog') { const L = progList(), k = L.findIndex(x => x.name === mdCur().mName); segPaint(ui.dig, 'P' + String(k < 0 ? 0 : k + 1).padStart(2, '0'));
    stripTxt('PROG · ' + sl.l, isMd() ? (mdCur().mName || 'INIT') + (k >= 0 ? ' · ' + (L[k].cat || '') : '') + ' · Rad = Programm' : 'Kanal spielt die Drum-Stimme'); }
  else if (P.enc === 'kit') { const L = MD_KIT_NAMES, k = L.findIndex(n => kitId(n) === drumSnd().origin); segPaint(ui.dig, 'S' + String(k < 0 ? 0 : k + 1).padStart(2, '0'));
    stripTxt('KIT', (k >= 0 ? L[k] : drumSnd().name) + ' · Rad = Kit'); }
  else {
    const d = curDesc(), v = d.get(), inert = d.inert();
    segPaint(ui.dig, inert ? '---' : d.seg(v));
    const S_ = secOfKey(P.focus);
    stripTxt(S_.l + ' · ' + d.l + (d.kit ? '' : ' · ' + sl.sl), inert ? d.why() : d.str(v) + ' · ' + (d.long(v) || d.what));
  }
  ui.segl.forEach(i => i.classList.toggle('on', i.dataset.m === P.enc));
  if (ui.encL) ui.encL.textContent = P.enc === 'val' ? 'WERT' : P.enc.toUpperCase();
}
function paintKnobEl(k, key) {
  const d = desc(key), v = d.get(), a = angle(d, v);
  if (k._key !== key) { k._key = key; k.dataset.k = key; k.classList.toggle('bip', !!d.bip); k.setAttribute('aria-label', d.l); }
  const s = a.toFixed(1); if (k._a !== s) { k._a = s; k.style.setProperty('--r', s + 'deg'); k.style.setProperty('--a', (a + 135).toFixed(1) + 'deg'); if (d.bip) k.style.setProperty('--b', a.toFixed(1) + 'deg'); }
  k.classList.toggle('inert', d.inert()); k.classList.toggle('foc', key === P.focus);
  k.setAttribute('aria-valuetext', d.str(v));
}
function paintLab(key) {
  const L = P.ui.lab[key]; if (!L) return; const d = desc(key), v = d.get(), t = d.inert() ? '–' : d.str(v) + (d.kind === 'list' && d.sub(v) && !L.zoom ? ' ' + d.sub(v) : '');
  if (L.zoom) { if (L.vl.textContent !== t) L.vl.textContent = t; return; }
  if (L.nm.textContent !== d.l) L.nm.textContent = d.l; if (L.vl.textContent !== t) L.vl.textContent = t;
  L.el.classList.toggle('inert', d.inert()); L.el.classList.toggle('foc', key === P.focus);
}
function paintField() {
  const ui = P.ui; if (!ui || !ui.field) return; const S_ = SEC_BY[P.sec];
  if (P.zoom) { for (const c of S_.cols) for (const key of c) { paintKnobEl(ui.knob[key], key); paintLab(key); } }
  else S_.cols.forEach((c, ci) => { const r = rowOf(S_.id, ci); paintKnobEl(ui.knob['c' + ci], c[r]); for (let j = 0; j < 2; j++) { paintLab(c[j]); ui.lab[c[j]].el.classList.toggle('on', j === r); } });
  if (ui.key.rate) { setLed(ui.key.rate, mdKit().dlM === 'b' ? 'amb' : 'on'); ui.key.rate.querySelector('span').textContent = mdKit().dlM === 'b' ? 'BPM' : 'RATE'; }
}
function setLed(k, st) { const L = k && k.querySelector('.led'); if (!L) return; const c = 'led' + (st ? ' ' + st : ''); if (L.className !== c) L.className = c; }
function paintKeys() {
  const ui = P.ui; if (!ui) return;
  if (ui.undo) { ui.undo.disabled = !UNDO.length; ui.redo.disabled = !REDO.length; }
  P.root.classList.toggle('run', !!R.playing);
  const kn = drumSnd().name + (soundEdited(drumSnd()) ? ' •' : ''); if (ui.kitT && ui.kitT.textContent !== kn) ui.kitT.textContent = kn; if (ui.kitn && ui.kitn.textContent !== kn) ui.kitn.textContent = kn;
  for (const s of SECS) setLed(ui.key['sec:' + s.id], s.id === P.sec ? (P.zoom ? 'amb' : 'on') : '');
  setLed(ui.key.shift, P.shiftLatch ? 'on' : P.shiftHold ? 'amb' : ''); setLed(ui.key.all, MDE.all ? 'on' : ''); setLed(ui.key.solo, MDE.solo ? 'on' : '');
  setLed(ui.key.prog, P.enc === 'prog' ? 'on' : ''); setLed(ui.key.kit, P.enc === 'kit' ? 'on' : '');
  if (ui.key.bank) { setLed(ui.key.bank, P.bank ? 'amb' : 'on'); const s = ui.key.bank.querySelector('small'); const t = P.bank ? '7–12' : '1–6'; if (s.textContent !== t) s.textContent = t; }
  const cur = ED.dVoice | 0;
  ui.ch.forEach((k, i) => { if (!k) return; const md = mdIsSrc(DRUM_VOICES[i].id); setLed(k, P.hitT[i] ? 'on' : i === cur ? (md ? 'on' : 'amb') : md ? 'half' : '');
    k.classList.toggle('sel', i === cur); k.classList.toggle('dr', !md); k.classList.toggle('foc', !!MDE.all && md); });
  ui.pads.forEach((p, i) => { const v = DRUM_VOICES[i], s = mdSlot(v.id), md = !!s && s.src === 'md'; p.classList.toggle('sel', i === cur); p.classList.toggle('md', md); p.classList.toggle('dr', !md); p.classList.toggle('hit', !!P.hitT[i]);
    const t = md ? (s.mName || 'INIT') : 'Drum-Stimme', sm = p.querySelector('small'); if (sm.textContent !== t) sm.textContent = t; });
}
function paint() { if (!P.open || !P.ui) return; paintKeys(); paintField(); paintDisp(); }
// jedes Bild: nur ein Vergleich der Zähler (Undo, Kanal, Daten, Transport); Neuzeichnen nur bei Änderung
function loop() {
  P.raf = 0; if (!P.open) return;
  const v = UI.drumVer + '|' + UI.sndVer + '|' + UNDO.length + '|' + REDO.length + '|' + (ED.dVoice | 0) + '|' + MDE.all + MDE.solo + MDE.scl + '|' + !!R.playing + '|' + MDS.st + '|' + drumSnd().name;
  if (v !== P.ver) { P.ver = v; paint(); }
  P.raf = requestAnimationFrame(loop);
}
/* ---------- Gesten (ein Zeiger je Element; zwei Finger = zwei Regler) ---------- */
const PT = new Map();
function wire(fr) {
  guardTouch(fr);
  fr.addEventListener('pointerdown', down); fr.addEventListener('pointermove', move);
  fr.addEventListener('pointerup', e => up(e, false)); fr.addEventListener('pointercancel', e => up(e, true));
  fr.addEventListener('contextmenu', e => e.preventDefault());
}
function down(ev) {
  if (ev.button > 0) return;
  const t = ev.target.closest('[data-a]'), a = t ? t.dataset.a : 'free';
  ev.preventDefault();
  const st = {id: ev.pointerId, a, t, x0: ev.clientX, y0: ev.clientY, y: ev.clientY, t0: performance.now(), moved: false};
  for (const o of PT.values()) if (t && o.t === t) st.a = 'ign';
  try { P.fr.setPointerCapture(ev.pointerId); } catch (_) {}
  PT.set(ev.pointerId, st); gestBegin(ev.pointerId, () => { if (PT.get(ev.pointerId) === st) end(st, true); });
  if (st.a === 'knob') knobStart(st);
  else if (st.a === 'enc') encStart(st, ev);
  else if (st.a === 'shift') { P.shiftHold++; st.t.classList.add('dn'); paint(); }
  else if (st.a.startsWith('ch:')) chDown(st, ev);
  else if (st.a.startsWith('pad:')) padDown(st, ev);
  else if (st.a === 'trig') { st.t.classList.add('dn'); mdAudition(true); flash(ED.dVoice | 0); }
  else if (st.t && st.t.classList.contains('ndpkey')) { st.t.classList.add('dn'); if (st.a.startsWith('sec:') || st.a === 'disp') st.hold = setTimeout(() => holdKey(st), LP_MS + 150); }
  else if (st.a === 'disp') st.hold = setTimeout(() => holdKey(st), LP_MS + 150);
}
function move(ev) {
  const st = PT.get(ev.pointerId); if (!st) return;
  const t0 = performance.now();
  if (st.a === 'knob') knobMove(st, ev);
  else if (st.a === 'enc') encMove(st, ev);
  else if (!st.moved && Math.hypot(ev.clientX - st.x0, ev.clientY - st.y0) > 10) { st.moved = true; clearTimeout(st.hold); if (st.t) st.t.classList.remove('dn'); }
  const dt = performance.now() - t0; P.moves++; P.moveMs += dt; if (dt > P.moveMax) P.moveMax = dt; if (P.moveL.length < 4000) P.moveL.push(dt);
}
function up(ev, cancel) { const st = PT.get(ev.pointerId); if (st) end(st, cancel, ev); }
function end(st, cancel, ev) {
  PT.delete(st.id); clearTimeout(st.hold); if (st.t) st.t.classList.remove('dn');
  const dt = performance.now() - st.t0, tap = !cancel && !st.moved && !st.held;
  try {
    if (st.a === 'knob') knobEnd(st, cancel);
    else if (st.a === 'enc') encEnd(st, cancel);
    else if (st.a === 'shift') { P.shiftHold = Math.max(0, P.shiftHold - 1); if (tap && dt < 350 && !st.used) P.shiftLatch = !P.shiftLatch; paint(); }
    else if (st.a.startsWith('ch:')) chUp(st, cancel);
    else if (st.a === 'free' && !cancel && P.zoom) { const dx = (ev ? ev.clientX : st.x0) - st.x0; if (Math.abs(dx) >= 50) secStep(dx < 0 ? 1 : -1); }
    else if (tap) press(st);
  } catch (e) { logErr(e); }
  if (GEST.has(st.id)) gestEnd(st.id);
}
function anyShiftUse() { for (const o of PT.values()) if (o.a === 'shift') o.used = 1; }
// Tipp auf eine Taste
function press(st) {
  const a = st.a;
  if (a.startsWith('sec:')) { const id = a.slice(4); if (P.sec === id) P.zoom = !P.zoom; else { P.sec = id; secFocus(); } MDE.sub = id === 'kit' ? 'mix' : id; if (MDE.solo) mdSoloApply(); buildField(); size(); paint(); hint(); return; }
  if (a === 'lab') { const key = st.t.dataset.k, ci = +st.t.dataset.c, r = +st.t.dataset.r; P.rows[P.sec + ':' + ci] = r; if (shiftOn() && r === 0) P.shiftLatch = false; anyShiftUse(); P.focus = key; P.enc = 'val'; paint(); haptic('tick'); return; }
  if (a === 'disp') { P.enc = P.enc === 'val' ? 'prog' : P.enc === 'prog' ? 'kit' : 'val'; paint(); return; }
  if (a === 'prog' || a === 'kit') { P.enc = P.enc === a ? 'val' : a; paint(); return; }
  if (a === 'enter') { listFor(st.t); return; }
  if (a === 'all') { MDE.all = !MDE.all; if (!MDE.all) MDE.scl = ''; mdFocus(); stripTxt('ALLE KANÄLE', MDE.all ? 'an – jede Änderung gilt für alle ' + MD_NAME + '-Kanäle' : 'aus'); paintKeys(); return; }
  if (a === 'solo') { MDE.solo = !MDE.solo; MDE.sub = P.sec === 'kit' ? 'mix' : P.sec; mdSoloApply(); try { mdHeadSolo(); } catch (e) {} stripTxt('SOLO PART', MDE.solo ? 'an – nur ' + (SEC_BY[P.sec].part === 'all' ? 'dieser Kanal' : SEC_BY[P.sec].l) + ' klingt' : 'aus'); paintKeys(); return; }
  if (a === 'bank') { P.bank ^= 1; buildCh(); paintKeys(); return; }
  if (a === 'rate') { soundEdit(DRUM_T, 'Echo ' + (mdKit().dlM === 'b' ? 'RATE' : 'BPM'), () => mdKitSet('dlM', mdKit().dlM === 'b' ? 'r' : 'b')); P.focus = 'k.dl'; paint(); return; }
  if (a === 'tap') { const sp = st.t.querySelector('span'); mdTap(sp); P.focus = 'k.dl'; paintDisp(); return; }
}
// Halten: Sektions-Taste = SOLO PART für diesen Teil; Display = Liste (Programm / Kit / Wert)
function holdKey(st) {
  st.held = true; haptic('tick');
  if (st.a.startsWith('sec:')) { const id = st.a.slice(4); if (id === 'kit') return; P.sec = id; secFocus(); MDE.sub = id; MDE.solo = !MDE.solo; mdSoloApply(); try { mdHeadSolo(); } catch (e) {} buildField(); size(); paint();
    stripTxt('SOLO PART', MDE.solo ? 'an – nur ' + (SEC_BY[id].part === 'all' ? 'dieser Kanal' : SEC_BY[id].l) + ' klingt' : 'aus'); return; }
  if (st.a === 'disp') listFor(st.t);
}
function listFor(anchor) {
  if (P.enc === 'prog') { if (isMd()) mdProgPop(anchor); return; }
  if (P.enc === 'kit') { kitPop(anchor); return; }
  const d = curDesc(); if (d.kit || !d.list || d.inert()) { stripTxt(d.l, d.inert() ? d.why() : 'Liste nur bei Codes (WAVE, MODE, TYPE …)'); return; }
  mdList(P.focus, anchor);
}
function hint() { const S_ = SEC_BY[P.sec]; stripTxt(S_.l + (P.zoom ? ' · ZOOM' : ''), P.zoom ? 'beide Reihen als Regler · wischen = nächste Sektion · Taste nochmal = zurück' : 'Name antippen = obere/untere Reihe · Taste nochmal = Zoom · halten = SOLO PART'); }
// eine neue Sektion: das Rad und das Display gehen auf ihren ersten Regler (die gewählte Reihe), wenn der Wert-Modus läuft
function secFocus() { const S_ = SEC_BY[P.sec]; if (!secOfKey(P.focus) || secOfKey(P.focus).id !== S_.id) P.focus = S_.cols[0][rowOf(S_.id, 0)]; }
function secStep(dir) { const k = SECS.findIndex(s => s.id === P.sec), n = clamp(k + dir, 0, SECS.length - 1); if (n === k) return; P.sec = SECS[n].id; secFocus(); MDE.sub = P.sec === 'kit' ? 'mix' : P.sec; if (MDE.solo) mdSoloApply(); buildField(); size(); paint(); hint(); }
/* ---------- Regler: senkrecht ziehen, seitlich weg = fein (ctlPrecision), SHIFT = fein, Mittelraste bei zweipoligen, 2× tippen = INIT ---------- */
function knobKey(st) { return st.t.dataset.k; }
function knobStart(st) {
  const key = knobKey(st), d = desc(key); st.key = key; st.d = d; st.v = d.get(); st.st = 'down'; st.before = null; st.det = 0;
  st.t.classList.add('dn'); anyShiftUse();
  if (d.inert()) { stripTxt(d.l, d.why()); st.dead = 1; return; }
  if (P.focus !== key) { P.focus = key; P.enc = 'val'; paintDisp(); paintField(); }
  st.before = soundSnapshot(DRUM_T);   // Undo-Stand beim Aufsetzen: der erste pointermove bleibt kurz
  if (d.list && !d.kit) st.hold = setTimeout(() => { if (st.st === 'down' && PT.get(st.id) === st) { st.held = true; haptic('tick'); mdList(key, st.t); } }, LP_MS + 150);
}
function knobMove(st, ev) {
  if (st.dead || st.held) return;
  const d = st.d;
  if (st.st === 'down') { if (Math.abs(ev.clientY - st.y0) < CTL_SLOP && Math.abs(ev.clientX - st.x0) < CTL_SLOP) return; st.st = 'drag'; st.y = ev.clientY; clearTimeout(st.hold); histCurveStart(); }
  const lo = d.min, hi = d.max, n = hi - lo, list = d.kind === 'list' || n <= 24, px = list ? n * clamp(PX_FULL / Math.max(1, n), 14, 40) : PX_FULL;
  let f = ctlPrecision(Math.abs(ev.clientX - st.x0)); if (shiftOn()) f = Math.min(f, .25);
  let dy = st.y - ev.clientY; st.y = ev.clientY;
  if (d.bip && st.det > 0) { const u = Math.min(st.det, Math.abs(dy)); st.det -= u; dy = Math.sign(dy) * (Math.abs(dy) - u); }
  const prev = st.v; st.v = clamp(st.v + dy / px * n * f, lo, hi);
  if (d.bip && ((prev > 0 && st.v < 0) || (prev < 0 && st.v > 0))) { st.v = 0; st.det = DETENT_PX; }
  const fine = d.pit && f < 1, nv = d.pit ? (fine ? Math.round(st.v * 10) / 10 : Math.round(st.v)) : Math.round(st.v), before = d.get();
  if (nv === before) return;
  d.set(nv, fine); histCurve(d.get());
  if (list || d.kind === 'list') haptic('tick');
  paintKnobEl(st.t, st.key); paintLab(st.key); paintDisp();
  audSoon(d.kit);
}
// Vorhören beim Drehen (höchstens alle 300 ms, nicht bei laufendem Transport) nach dem Handler: der pointermove bleibt kurz
function audSoon(kit) { if (R.playing || performance.now() - MDE.aud < 300 || P.audQ) return; P.audQ = 1; setTimeout(() => { P.audQ = 0; if (!P.open) return; if (!kit) mdAudition(); else if (!R.playing && performance.now() - MDE.aud >= 300) { MDE.aud = performance.now(); drumAudition(ED.dVoice | 0, .8); } }, 0); }
function knobEnd(st, cancel) {
  st.t.classList.remove('dn'); clearTimeout(st.hold);
  if (st.st === 'drag') { if (st.before != null && commitSound(DRUM_T, st.before, MD_NAME + ' ' + st.d.l) && !R.playing) { MDE.aud = 0; mdAudition(); } paint(); return; }
  if (cancel || st.held || st.dead) return;
  const now = performance.now(), L = P.lastTap;
  if (L && L.key === st.key && now - L.t < DBL_MS + 60) { P.lastTap = null; const d = st.d; soundEdit(DRUM_T, MD_NAME + ' ' + d.l + ' INIT', () => d.set(d.def)); if (!R.playing) { MDE.aud = 0; mdAudition(); } stripTxt(d.l + ' · INIT', d.str(d.get())); paint(); return; }
  P.lastTap = {key: st.key, t: now};
}
/* ---------- das Rad: drehen in Rasten (15°), schnell = 4 Schritte je Raste, SHIFT = fein; Modus WERT / PROG / KIT, ein Undo je Geste ---------- */
function encCenter() { const r = P.ui.enc.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
function encStart(st, ev) { const [cx, cy] = encCenter(); st.cx = cx; st.cy = cy; st.ang = Math.atan2(ev.clientY - cy, ev.clientX - cx); st.acc = 0; st.before = soundSnapshot(DRUM_T); st.n = 0; st.tl = performance.now(); anyShiftUse(); }
function encMove(st, ev) {
  const dx = ev.clientX - st.cx, dy = ev.clientY - st.cy; if (Math.hypot(dx, dy) < 8) return;
  const a = Math.atan2(dy, dx); let da = a - st.ang; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI; st.ang = a;
  if (!st.moved) { if (Math.hypot(ev.clientX - st.x0, ev.clientY - st.y0) < 6) return; st.moved = true; }
  P.encAcc = (P.encAcc + da * 180 / Math.PI); P.ui.encRot.style.transform = 'rotate(' + P.encAcc.toFixed(1) + 'deg)';
  st.acc += da * 180 / Math.PI; const now = performance.now(), sp = Math.abs(da * 180 / Math.PI) / Math.max(1, now - st.tl); st.tl = now;
  while (Math.abs(st.acc) >= 15) { const dir = st.acc > 0 ? 1 : -1; st.acc -= dir * 15; encStep(dir * (sp > .6 && !shiftOn() ? 4 : 1)); st.n++; }
}
function encStep(n) {
  if (P.enc === 'prog') { if (!isMd()) return; const L = progList(); if (!L.length) return; let k = L.findIndex(x => x.name === mdCur().mName); k = clamp((k < 0 ? (n > 0 ? -1 : 0) : k) + Math.sign(n), 0, L.length - 1);
    const x = L[k]; mdLoadProgram(curSl().id, x.p, x.name); haptic('tick'); paintDisp(); return; }
  if (P.enc === 'kit') { const L = MD_KIT_NAMES; let k = L.findIndex(m => kitId(m) === drumSnd().origin); k = clamp((k < 0 ? (n > 0 ? -1 : 0) : k) + Math.sign(n), 0, L.length - 1); loadKit(L[k]); haptic('tick'); P.ver = ''; paint(); return; }
  const d = curDesc(); if (d.inert()) { stripTxt(d.l, d.why()); return; }
  const fine = d.pit && shiftOn(), step = fine ? .1 : 1, v = d.get(), nv = clamp(Math.round((v + n * step) * 10) / 10, d.min, d.max);
  let w = nv; if (d.bip && ((v > 0 && nv < 0) || (v < 0 && nv > 0))) w = 0;
  if (w === v) return; d.set(w, fine); haptic('tick');
  const S_ = secOfKey(P.focus); if (S_.id === P.sec) paintField(); paintDisp();
  audSoon(d.kit);
}
function encEnd(st, cancel) {
  if (st.moved) { const lab = P.enc === 'prog' ? 'Programm ' + (mdCur().mName || '') : P.enc === 'kit' ? 'Kit ' + drumSnd().name : MD_NAME + ' ' + curDesc().l;
    if (st.before != null && commitSound(DRUM_T, st.before, lab) && !R.playing) { MDE.aud = 0; if (P.enc !== 'kit') mdAudition(); else drumAudition(ED.dVoice | 0, .8); } paint(); return; }
  if (!cancel) listFor(P.ui.enc);
}
const progList = () => mdFactory().map(x => ({name: x.name, p: x, cat: (MD_CAT.find(c => c[0] === x.mCat) || ['', ''])[1]})).concat(mdLibList().map(u => ({name: u.name, p: u.p, cat: 'Eigene'})));
function kitPop(anchor) {
  openPop(anchor, p => {
    const cur = drumSnd().origin;
    p.innerHTML = '<h4>' + esc(MD_NAME) + '-Kits</h4><div class="plist pan-y">' + MD_KIT_NAMES.map((n, k) => `<button class="rb${kitId(n) === cur ? ' on' : ''}" data-k="${k}">${esc(n)}</button>`).join('') + '</div>';
    guardTouch(p);
    onTap(p, b => { closePop(); const n = MD_KIT_NAMES[+b.dataset.k]; soundEdit(DRUM_T, 'Kit ' + n, () => loadKit(n)); drumAudition(ED.dVoice | 0, .8); P.ver = ''; paint(); }, 'button[data-k]');
  }, {name: 'ndpkit'});
}
/* ---------- Kanal-Tasten: Tipp = wählen + anschlagen (oben laut, unten leise); halten = Programm-Liste; SHIFT + Tipp = Quelle Drum ↔ MD_NAME ---------- */
function velAt(st, ev) { const r = st.t.getBoundingClientRect(); return clamp(1 - (ev.clientY - r.top) / Math.max(1, r.height) * .65, .35, 1); }
function flash(i) { P.hitT[i] = 1; paintKeys(); clearTimeout(P['hT' + i]); P['hT' + i] = setTimeout(() => { delete P.hitT[i]; if (P.open) paintKeys(); }, 140); }
function chDown(st, ev) {
  const i = +st.a.slice(3); st.i = i; st.t.classList.add('dn');
  if (shiftOn()) { anyShiftUse(); st.shift = 1; return; }
  const prev = ED.dVoice | 0; ED.dVoice = i; if (MDE.solo) mdSoloApply();
  drumAudition(i, velAt(st, ev)); flash(i);
  if (prev !== i) { P.ver = ''; paint(); }
  st.hold = setTimeout(() => { if (PT.get(st.id) === st && !st.moved) { st.held = true; haptic('tick'); if (mdIsSrc(DRUM_VOICES[i].id)) mdProgPop(st.t); else stripTxt(DRUM_VOICES[i].l, 'spielt die Drum-Stimme – SHIFT + Taste = ' + MD_NAME); } }, LP_MS + 150);
}
function chUp(st, cancel) {
  if (cancel || !st.shift) return;
  const i = st.i, v = DRUM_VOICES[i], to = mdIsSrc(v.id) ? 'drum' : 'md';
  ED.dVoice = i; soundEdit(DRUM_T, 'Quelle ' + mdSrcLabel(to), () => mdSetSrc(v.id, to)); drumAudition(i, .8); flash(i);
  stripTxt('QUELLE · ' + v.l, mdSrcLabel(to)); P.ver = ''; paint();
}
function padDown(st, ev) { const i = +st.a.slice(4); ED.dVoice = i; drumAudition(i, velAt(st, ev)); flash(i); P.ver = ''; paint(); }
/* ---------- ⋯ ---------- */
function morePop(anchor) {
  const sl = curSl(), md = isMd(), all = DRUM_VOICES.every(v => mdIsSrc(v.id));
  openPop(anchor, p => {
    p.innerHTML = '<h4>' + esc(MD_NAME) + ' · ' + esc(sl.l) + '</h4><div class="plist edmore">' +
      (md ? '<button class="rb" data-a="prog"><b>Programm ▾</b><small>Liste nach Kategorie, Tipp = laden + hören</small></button><button class="rb" data-a="kanal"><b>Kanal ▸</b><small>Kopieren, Einfügen, Tauschen, Init, Programm sichern</small></button>' : '') +
      `<button class="rb" data-a="src"><b>Quelle: ${esc(md ? 'Drum-Stimme' : MD_NAME)}</b><small>dieses Pad umschalten (auch SHIFT + Kanal-Taste)</small></button>` +
      (all ? '' : `<button class="rb" data-a="choose"><b>Alle Pads ${esc(MD_NAME)}</b><small>jedes Pad mit dem Programm seiner Rolle, ein Schritt</small></button>`) +
      '<button class="rb" data-a="ed"><b>Zum Editor</b><small>Zellen-Ansicht des Drum-Editors</small></button></div>';
    guardTouch(p);
    onTap(p, b => { const a = b.dataset.a;
      if (a === 'prog') { closePop(); mdProgPop(anchor); return; }
      if (a === 'kanal') { closePop(); mdMore(anchor); return; }
      closePop();
      if (a === 'src') { soundEdit(DRUM_T, 'Quelle ' + mdSrcLabel(md ? 'drum' : 'md'), () => mdSetSrc(sl.id, md ? 'drum' : 'md')); drumAudition(sl.idx, .8); }
      else if (a === 'choose') ndpChoose();
      else if (a === 'ed') { close(); return; }
      P.ver = ''; paint(); }, 'button[data-a]');
  }, {name: 'ndpmore'});
}
/* ---------- Öffnen / Schließen ---------- */
function open(o) {
  o = o || {};
  ensureCss();
  if (!P.root) { const r = el('div', ''); r.id = 'ndp'; r.setAttribute('role', 'dialog'); r.setAttribute('aria-label', MD_NAME + '-Platte'); document.body.appendChild(r); P.root = r; }
  if (o.view) P.view = o.view === 'spiel' ? 'spiel' : 'geraet';
  if (o.sec && SEC_BY[o.sec]) P.sec = o.sec; if (o.zoom != null) P.zoom = !!o.zoom;
  P.open = true; P.root.hidden = false; EL.app.classList.add('ndpon');
  if (!P.focus || !desc(P.focus)) P.focus = 'mDec';
  build();
  if (!P.raf) P.raf = requestAnimationFrame(loop);
  window.addEventListener('resize', onResize); document.addEventListener('keydown', onKey, true);
  if (!P.seen) { P.seen = true; stripTxt(MD_NAME, 'Kanal-Taste = spielen · Regler ziehen · Sektion 2× = Zoom'); }
  return true;
}
function close(quiet) {
  if (!P.open) return false;
  P.open = false; for (const st of [...PT.values()]) end(st, true); PT.clear(); P.shiftHold = 0;
  if (P.raf) cancelAnimationFrame(P.raf); P.raf = 0;
  window.removeEventListener('resize', onResize); document.removeEventListener('keydown', onKey, true);
  if (PK.open) closePop();
  P.root.hidden = true; P.root.innerHTML = ''; P.ui = null; P.fr = null; EL.app.classList.remove('ndpon');
  try { mdEditEnd(true); } catch (e) { logErr(e); }             // ALLE KANÄLE / SOLO PART enden mit dem Schließen (Regel 6)
  if (!quiet && R.editor === 'drum' && EL.drumSheet.classList.contains('open')) safeRebuild(buildDrumEd);
  return true;
}
function onResize() { clearTimeout(P.rsT); P.rsT = setTimeout(() => { if (P.open) build(); }, 80); }
function onKey(e) { if (e.key === 'Escape' && P.open && !PK.open) { e.preventDefault(); e.stopPropagation(); close(); } }
/* ---------- Test-API: ndpInfo(), ndpView(o) ---------- */
function rect(e) { const q = e.getBoundingClientRect(); return {x: +q.left.toFixed(1), y: +q.top.toFixed(1), w: +q.width.toFixed(1), h: +q.height.toFixed(1)}; }
function info() {
  if (!P.open || !P.root) return {open: false};
  const vis = e => e.offsetWidth > 0 || e.offsetHeight > 0;
  const hits = [...P.root.querySelectorAll('[data-a],.ndph button')].filter(vis).map(e => Object.assign({a: e.dataset.a || e.className || e.textContent, k: e.dataset.k || undefined}, rect(e)));
  const knobs = [...P.root.querySelectorAll('.ndpk')].map(e => { const key = e.dataset.k, d = desc(key); return Object.assign({key, l: d.l, val: d.get(), str: d.str(d.get()), angle: +angle(d, d.get()).toFixed(2), inert: d.inert()}, rect(e)); });
  const segs = P.ui && P.ui.dig ? P.ui.dig.map(s => s._k).join('') : '';
  return {open: true, view: P.view, sec: P.sec, zoom: P.zoom, bank: P.bank, focus: P.focus, enc: P.enc, shift: shiftOn(), land: P.land, voice: ED.dVoice | 0, md: isMd(),
    seg: segs, strip: P.ui && P.ui.s1 ? [P.ui.s1.textContent, P.ui.s2.textContent] : null, frame: rect(P.root), scrollW: P.root.scrollWidth, clientW: P.root.clientWidth,
    docScrollW: document.scrollingElement.scrollWidth, hits, knobs, perf: {moves: P.moves, ms: +P.moveMs.toFixed(2), max: +P.moveMax.toFixed(2), p95: +(P.moveL.slice().sort((x, y) => x - y)[Math.floor(P.moveL.length * .95)] || 0).toFixed(2)}};
}
function view(o) { o = o || {}; if (o.sec && SEC_BY[o.sec]) { P.sec = o.sec; secFocus(); } if (o.zoom != null) P.zoom = !!o.zoom; if (o.view) P.view = o.view; if (o.enc) P.enc = o.enc; if (o.focus) P.focus = o.focus; if (o.bank != null) P.bank = o.bank ? 1 : 0; if (o.shift != null) P.shiftLatch = !!o.shift; if (P.open) build(); return info(); }
function ensureCss() { if (document.getElementById('ndp-css')) return; const st = document.createElement('style'); st.id = 'ndp-css'; st.textContent = NDP_CSS; document.head.appendChild(st); }
window.NDP = {open, close, isOpen: () => P.open, info, view, desc, SECS, perfReset: () => { P.moves = 0; P.moveMs = 0; P.moveMax = 0; P.moveL = []; }};
})();
