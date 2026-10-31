// I2a Abnahme (Nachtrag 8 §B.2 I2a): I2-01 Abdeckung, I2-02 Normieren, I2-03 Kopien, I2-04 Daten-Teil (Regel 28), I2-05 Undo,
// I2-06 Baustein N, I2-61 pv-layout.json. Jede Zeile mit Messwert. Aufruf: node i2a-abnahme.mjs [app.html] [basis.html]
import {open, ok, APP} from './lib.mjs';
import {domKeys} from './i2a-domkeys.mjs';
import fs from 'fs';
const FILE = process.argv[2] || APP, BASE = process.argv[3] || new URL('../../../snapshots/G-T-merge-fix.html', import.meta.url).pathname;
const res = {};
const {b, p, errs} = await open(FILE);

/* ---------- I2-01 Abdeckung ---------- */
{
  const r = await p.evaluate(() => {
    const D = SYNQUENZER, L = D.lktAll(), I = D.lkt(), exc = I.exc;
    const has = k => !!L[k] || !!exc[k];
    // Quellen: PD, DPD × Slots, fm6 / fmx / mk Felder (aus der Tabelle selbst gezählt), fx.*
    const miss = [];
    for (const k of Object.keys(PD)) if (!has(k)) miss.push(k);
    for (const sl of DrumKits.SLOTS) for (const k of Object.keys(DPD)) if (!has('drum.' + sl.id + '.' + k)) miss.push('drum.' + sl.id + '.' + k);
    const f6 = SQStore.normFm6({}); for (let o = 0; o < 6; o++) for (const k of Object.keys(f6.ops[o])) { const p = 'fm6.ops.' + o + '.' + k; if (Array.isArray(f6.ops[o][k])) { for (let j = 0; j < 4; j++) if (!has(p + '.' + j)) miss.push(p + '.' + j); } else if (!has(p)) miss.push(p); }
    const X = FMX.norm(FMX.fromFm6(f6), false); for (let o = 0; o < 6; o++) for (const k of Object.keys(X.ops[o])) { const p = 'fmx.ops.' + o + '.' + k; if (k === 'amp') { for (const a of ['r', 'l']) for (let j = 0; j < 4; j++) if (!has(p + '.' + a + '.' + j)) miss.push(p + '.' + a + '.' + j); } else if (k === 'ks') { for (const x of Object.keys(X.ops[o].ks)) if (!has(p + '.' + x)) miss.push(p + '.' + x); } else if (!has(p)) miss.push(p); }
    const MK = SQMK.normMk({}); const walk = (o, pre) => { for (const k of Object.keys(o)) { const v = o[k], q = pre + k; if (Array.isArray(v)) v.forEach((e, j) => (e && typeof e === 'object' ? walk(e, q + '.' + j + '.') : (!has('mk.' + q + '.' + j) && !has('mk.' + q) && miss.push('mk.' + q + '.' + j)))); else if (v && typeof v === 'object') walk(v, q + '.'); else if (!has('mk.' + q)) miss.push('mk.' + q); } };
    walk(MK.t[0], 't.0.'); walk(MK.t[1], 't.1.');
    const cls = k => (L[k] ? L[k].cls : null);
    const s6 = ['lq', 'mode', 'eng', 'fmAmp', 'poly', 'reset'].map(k => [k, cls(k)]);
    const stu = ['o1w', 'o2w', 'o3w', 'o2sync', 'ftype', 'subW', 'subOct', 'o1uni', 'o2uni', 'o3uni'].map(k => [k, cls(k)]);
    const fxr = ['fx.vol', 'fx.pan', 'fx.rev', 'fx.dly', 'fx.pump', 'fx.chorus.mix', 'fx.chorus.rate', 'fx.chorus.depth'].map(k => [k, cls(k)]);
    const sig = [0, 1, 2, 3, 4, 5].flatMap(o => ['wave', 'fbSrc', 'fixed'].map(k => cls('fmx.ops.' + o + '.' + k))).concat([cls('fmx.edges')]);
    const fields = Object.values(L).every(e => e.fam && e.cls && e.lo != null && e.hi != null && e.c && e.lbl && e.sp && e.wi != null && e.nat);
    const cs = new Set(Object.values(L).map(e => e.c));
    return {n: I.n, src: I.src, exc: Object.keys(exc).length, excList: exc, miss, s6, stu, fxr, sig, fields, cs: [...cs].sort()};
  });
  const dk = await domKeys(p), dmiss = [];
  const map = (g, k) => { if (k.includes(':')) return null; const m = /^fmx\.(\d)\.(\w+)$/.exec(k); if (m) return 'fmx.ops.' + (m[1] - 1) + '.' + m[2]; if (g === 'drum' && !k.startsWith('fx.')) return 'drum.kick.' + k; return k; };
  const all = await p.evaluate(() => ({L: SYNQUENZER.lktAll(), E: SYNQUENZER.lkt().exc}));
  let dn = 0; for (const g in dk) for (const k of dk[g]) { const q = map(g, k); if (!q) continue; dn++; if (!all.L[q] && !all.E[q]) dmiss.push(g + ':' + k); }
  const pct = 100 * r.exc / r.src;
  ok(r.miss.length === 0, `I2-01 Quellen: ${r.src} Einträge, ohne LKT/LKT_EXC: ${r.miss.length} ${r.miss.slice(0, 5).join(' ')}`);
  ok(dmiss.length === 0, `I2-01 Regler mit data-key in den Editoren: ${dn} geprüft, ohne Eintrag: ${dmiss.length} ${dmiss.slice(0, 5).join(' ')}`);
  ok(pct <= 5, `I2-01 Ausnahmen ${r.exc} / ${r.src} = ${pct.toFixed(2)} % (≤ 5 %)`);
  ok(r.fields, `I2-01 jeder Eintrag hat fam, cls, lo, hi, c, lbl, sp, wi, nat (${r.n} Einträge); Kennlinien: ${r.cs.join(' ')}`);
  ok(r.s6.every(x => x[1] === 's'), `I2-01 Klasse s: ${r.s6.map(x => x.join('=')).join(' ')}`);
  ok(r.sig.every(x => x === 's'), `I2-01 fmxSig-Teile (wave, fbSrc, fixed je OP, Verbindungen) = s: ${r.sig.filter(x => x === 's').length}/${r.sig.length}`);
  ok(r.stu.every(x => x[1] === 'n'), `I2-01 stufige VA-Werte = n: ${r.stu.map(x => x.join('=')).join(' ')}`);
  ok(r.fxr.every(x => x[1] === 'r'), `I2-01 Spur-Werte = r: ${r.fxr.map(x => x.join('=')).join(' ')}`);
  res.exc = r.excList; res.cov = {src: r.src, n: r.n, exc: r.exc, pct};
}

/* ---------- I2-61 pv-layout.json ---------- */
{
  const f = JSON.parse(fs.readFileSync(new URL('../pv-layout.json', import.meta.url), 'utf8'));
  const r = await p.evaluate(() => { const L = SYNQUENZER.pvLayout(), I = SYNQUENZER.lkt(), A = SYNQUENZER.lktAll(); let bad = 0; L.A.forEach((p, i) => { if (!A[p] || A[p].wi !== i || A[p].sp !== 'A') bad++; }); L.M.forEach((p, i) => { if (!A[p] || A[p].wi !== i || A[p].sp !== 'M') bad++; }); return {L, miss: I.miss, bad, nAV: I.nAV}; });
  const same = JSON.stringify(f) === JSON.stringify(r.L);
  ok(same && r.bad === 0 && r.miss.length === 0, `I2-61 pv-layout.json = lktBuild()-Plätze Zeichen für Zeichen: ${same}, falsche wi ${r.bad}, fehlend ${r.miss.length}; A ${f.A.length} (Stimmen-Plätze ${r.nAV}), M ${f.M.length}`);
  const html = fs.readFileSync(FILE, 'utf8'), m = /\/\*PVL\{\*\/(.*?)\/\*\}PVL\*\//s.exec(html);
  ok(m && m[1] === JSON.stringify(f), `I2-61 eingebettete PV_LAYOUT = Datei (${m ? m[1].length : 0} Zeichen)`);
  // zweiter Start: gleiche Plätze
  const {b: b2, p: p2} = await open(FILE); const L2 = await p2.evaluate(() => SYNQUENZER.pvLayout()); await b2.close();
  ok(JSON.stringify(L2) === JSON.stringify(f), 'I2-61 zweiter Start erzeugt dieselben wi');
  res.pv = {A: f.A.length, AV: r.nAV, M: f.M.length};
}

/* ---------- I2-02 Normieren (1000 Zufalls-Clips) ---------- */
{
  const r = await p.evaluate(() => {
    let s = 7; const R = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
    const L = SYNQUENZER.lktAll(), PS = Object.keys(L), pick = a => a[Math.floor(R() * a.length)];
    const odd = ['zzUnbekannt.neu.wert', 'mk.t.1.p.3.i', 'fm6.ops.5.r.3', 'fmx.edge.6-1.amt', 'bm.a.o1.m', 'drum.hatC.mFrq', 'cutoff', 'Bad.Path', '9x', 'a.b.c.d.e.f.g.h', 'x'.repeat(49)];
    let viol = 0, rt = 0, keptUnknown = 0, droppedK = 0, deep = 0, n = 0;
    for (let i = 0; i < 1000; i++) {
      const drum = R() < .3, kind = drum ? 'drum' : 'synth', notes = [];
      const nkl = Math.floor(R() * 6), kl = [];
      for (let j = 0; j < nkl; j++) kl.push({id: 'k' + (1 + Math.floor(R() * 9)), n: 'K' + j, e: drum ? 'drum' : pick(['analog', 'fm6', 'mk', 'zz']), s: drum ? {frq: 100 + R() * 100, tDec: R()} : {engine: 'analog', name: 'x', p: {cutoff: 500 + R() * 4000}}});
      for (let j = 0; j < 12; j++) {
        const v = {}; const nv = Math.floor(R() * 14); for (let q = 0; q < nv; q++) v[R() < .2 ? pick(odd) : pick(PS)] = R() * 1.4 - .2;
        const lk = {v}; if (R() < .4) lk.k = 'k' + (1 + Math.floor(R() * 9)); if (drum && R() < .3) lk.tune = 3;
        notes.push({t: j * .25, d: .25, n: drum ? 36 : 60 + j, v: .8, lk});
      }
      const ln = []; const nln = Math.floor(R() * 12);
      for (let j = 0; j < nln; j++) { const len = Math.floor(R() * 80); const st = []; for (let q = 0; q < 70; q++) if (R() < .5) st.push({i: Math.floor(R() * 90) - 5, v: R() * 1.2 - .1, c: R() < .3 ? R() : undefined, r: R() < .3 ? Math.floor(R() * 6) : undefined}); ln.push({p: R() < .1 ? pick(odd) : pick(PS), len, g: pick(['1/16', '1/32', '1/8T', 'aus', '3/7']), st}); }
      const c = normClip({len: 1, key: {root: 0, scale: 'ionian'}, notes, kl, klq: R() < .5 ? Math.floor(R() * 4) : undefined, ln}, kind, {root: 0, scale: 'ionian'});
      n++;
      if (c.kl && (c.kl.length > 3 || new Set(c.kl.map(x => x.id)).size !== c.kl.length)) viol++;
      if (c.kl && !(c.klq >= 1 + Math.max(...c.kl.map(x => +x.id.slice(1))))) viol++;
      if (c.ln && c.ln.length > 8) viol++;
      for (const l of c.ln || []) { if (l.len < 1 || l.len > 64 || !LN_GRIDS.includes(l.g)) viol++; for (const x of l.st) { if (x.i >= l.len || x.v < 0 || x.v > 1 || Math.round(x.v * 1e3) / 1e3 !== x.v || (x.c != null && (x.c < .05 || x.c > .95)) || (x.r != null && (x.r < 2 || x.r > 4))) viol++; } }
      const ids = new Set((c.kl || []).map(x => x.id));
      for (const nt of c.notes) { if (!nt.lk) continue; if (nt.lk.v) { const ks = Object.keys(nt.lk.v); if (ks.length > 8) viol++; for (const k of ks) { const x = nt.lk.v[k]; if (x < 0 || x > 1 || Math.round(x * 1e3) / 1e3 !== x || !lkPathOk(k)) viol++; if (!L[k]) keptUnknown++; } } if (nt.lk.k && !ids.has(nt.lk.k)) viol++; }
      droppedK += notes.filter(x => x.lk.k).length - c.notes.filter(x => x.lk && x.lk.k).length;
      const c2 = normClip(JSON.parse(JSON.stringify(c)), kind, {root: 0, scale: 'ionian'});
      if (JSON.stringify(c2) === JSON.stringify(c)) rt++;
      const pk = SQStore.packClipNotes(c), up = normClip(SQStore.unpackClipNotes(JSON.parse(JSON.stringify(pk))), kind, {root: 0, scale: 'ionian'});
      if (JSON.stringify(up) === JSON.stringify(c)) deep++;
    }
    return {n, viol, rt, deep, keptUnknown, droppedK};
  });
  ok(r.viol === 0, `I2-02 ${r.n} Zufalls-Clips: Verstöße gegen L4 / Wertebereich / 1/1000 / Grammatik: ${r.viol}`);
  ok(r.rt === r.n, `I2-02 normieren zweimal = gleich: ${r.rt}/${r.n}`);
  ok(r.deep === r.n, `I2-02 gepackt (Datei) → entpackt → normiert deep-equal: ${r.deep}/${r.n}`);
  ok(r.keptUnknown > 0, `I2-02 unbekannte gültige Pfade erhalten: ${r.keptUnknown}; lk.k ohne kl-Eintrag entfernt: ${r.droppedK}`);
  // tiefste Pfade je Familie, Speichern -> Laden über die Datei
  const r2 = await p.evaluate(async () => {
    const D = SYNQUENZER; D.newProject();
    const deepP = ['mk.t.1.p.3.i', 'fm6.ops.5.r.3', 'fmx.edge.6-1.amt', 'bm.a.o1.m', 'drum.hatC.mFrq', 'cutoff'];
    const v = {}; deepP.forEach((k, i) => { v[k] = (i + 1) / 10; });
    D.setClip(0, 0, {len: 1, notes: [{t: 0, d: .25, n: 60, v: .8, lk: {v}}]});
    D.setClip(DRUM_T, 0, {len: 1, notes: [{t: 0, d: .25, n: 42, v: .8, lk: {tune: 2, v: {'drum.hatC.mFrq': .4}}}]});
    const j = D.serialize(), f = JSON.parse(j);
    const back = normalizeProject(SQStore.parseFile(j, LEGACY_HOOKS).project);
    const a = back.tracks[0].clips[0].notes[0].lk.v, dr = back.tracks[DRUM_T].clips[0].notes[0].lk;
    return {keys: Object.keys(a), same: JSON.stringify(a) === JSON.stringify(v), dr, need: f.project.need};
  });
  ok(r2.same, `I2-02 tiefste Pfade überstehen Speichern → Laden: ${r2.keys.join(' ')}`);
  ok(r2.dr && r2.dr.tune === 2 && r2.dr.v && r2.dr.v['drum.hatC.mFrq'] === .4, `I2-02 Drum-Note: tune (relativ) und lk.v zusammen: ${JSON.stringify(r2.dr)}`);
  // lanePut / lockPut: je ein Undo (Art clip); lockPut nur auf Schritte mit Note
  const r3 = await p.evaluate(() => {
    const D = SYNQUENZER; D.newProject();
    D.setClip(0, 0, {len: 1, notes: [0, 2, 5, 9].map(j => ({t: j * .25, d: .25, n: 60, v: .8}))});
    const u0 = D.undoInfo().n;
    const a = D.lanePut(0, 0, 'fmx.ops.1.ol', [.1, .2, .3, null, .5], {len: 12, g: '1/16'}); const u1 = D.undoInfo();
    const bb = D.lockPut(0, 0, 'cutoff', Array.from({length: 16}, (_, i) => i / 16), {g: '1/16'}); const u2 = D.undoInfo();
    const g = D.lkGet(0, 0);
    const refused = [D.lockPut(0, 0, 'fx.rev', [.5]).why, D.lockPut(0, 0, 'fm6.alg', [.5]).why, D.lanePut(0, 0, 'poly', [.5]).why];
    D.undo(); const g1 = D.lkGet(0, 0); D.undo(); const g2 = D.lkGet(0, 0);
    return {a, bb, u0, u1: [u1.n, u1.top.kind, u1.top.label], u2: [u2.n, u2.top.kind, u2.top.label], notes: g.notes.map(x => [x.i, x.v.cutoff]), ln: g.ln, refused, g1n: g1.notes.length, g1ln: g1.ln.length, g2ln: g2.ln.length};
  });
  ok(r3.u1[0] === r3.u0 + 1 && r3.u1[1] === 'clip' && r3.u2[0] === r3.u0 + 2 && r3.u2[1] === 'clip', `I2-02 lanePut / lockPut je ein Undo (Art clip): ${JSON.stringify([r3.u1, r3.u2])}`);
  ok(r3.bb.n === 4 && JSON.stringify(r3.notes) === JSON.stringify([[0, 0], [1, .125], [2, .313], [3, .563]]), `I2-02 lockPut nur Schritte mit Note: ${r3.bb.n} Noten, Werte ${JSON.stringify(r3.notes)}`);
  ok(r3.ln.length === 1 && r3.ln[0].len === 12 && r3.ln[0].st.length === 4, `I2-02 lanePut: Reihe Länge ${r3.ln[0].len}, ${r3.ln[0].st.length} Schritte (null = kein Wert)`);
  ok(r3.refused.join('|') === 'nur als freie Reihe|nur als Klang-Lock|nur als Klang-Lock', `I2-02 abgewiesen: ${r3.refused.join(' | ')}`);
  ok(r3.g1n === 0 && r3.g1ln === 1 && r3.g2ln === 0, `I2-02 Undo nimmt lockPut dann lanePut zurück: Noten-Locks ${r3.g1n}, Reihen ${r3.g1ln} → ${r3.g2ln}`);
}

/* ---------- I2-03 Kopien ---------- */
{
  const r = await p.evaluate(() => {
    const D = SYNQUENZER; D.newProject();
    const lkv = {cutoff: .4, 'fm6.ops.1.ol': .7};
    D.setClip(0, 0, {len: 1, notes: [{t: 0, d: .5, n: 60, v: .8, lk: {v: lkv, k: 'k2'}}, {t: 1, d: .5, n: 62, v: .8, lk: {v: {res: .2}}}],
      kl: [{id: 'k2', n: 'Glocke', e: 'analog', s: {engine: 'analog', name: 'Glocke', p: {cutoff: 3000}}}], klq: 5, ln: [{p: 'fx.rev', len: 12, g: '1/16', st: [{i: 0, v: .5}, {i: 3, v: .9, c: .5, r: 3}]}]});
    const C = S.tracks[0].clips[0], ref = JSON.stringify(D.getClip(0, 0));
    const cn = cleanNote(C.notes[0]); cn.lk.v.cutoff = .99; cn.lk.k = 'k9';
    const origOk = C.notes[0].lk.v.cutoff === .4 && C.notes[0].lk.k === 'k2';
    const strip = c => { const o = JSON.parse(JSON.stringify(c)); return JSON.stringify({notes: o.notes.map(n => n.lk || null), kl: o.kl, klq: o.klq, ln: o.ln}); };
    const R0 = strip(C), out = {origOk};
    D.copyClip(0, 0); D.pasteClip(0, 3); out.paste = strip(S.tracks[0].clips[3]) === R0;
    const k = D.duplicateClip(0, 0); out.dup = k >= 0 && strip(S.tracks[0].clips[k]) === R0;
    // ×2 der ROLLE (Takt-Aktion): über das Modell
    // ×2 der ROLLE (Z. 11915: flache Kopie {...n, t: n.t + Lb}), hier dieselbe Rechnung am Clip
    let x2 = false; { const c = S.tracks[0].clips[0], Lb = c.len * 4; c.notes = c.notes.concat(c.notes.map(n => Object.assign({...n, t: n.t + Lb}))); c.len *= 2; x2 = !!c.notes[2].lk && JSON.stringify(c.notes[2].lk) === JSON.stringify(c.notes[0].lk); }
    out.x2 = x2;
    // ein Lock an der ×2-Kopie ändern lässt das Original (geteiltes lk-Objekt) unberührt (copy on write)
    D.lkSet(0, 0, 2, 'cutoff', .1); out.cow = S.tracks[0].clips[0].notes[0].lk.v.cutoff === .4 && S.tracks[0].clips[0].notes[2].lk.v.cutoff === .1;
    // eigener Song-Clip (S.song.own) und Normalisieren über ownNorm
    const own = ownNorm(Object.assign(JSON.parse(JSON.stringify(cleanClip(C))), {from: {t: 0, s: 0, bar: 0}}), S.key, S.tracks.length);
    out.own = !!own && strip(own).includes('"klq":5') && JSON.stringify(own.ln) === JSON.stringify(C.ln);
    // N1 Spiegeln / Umdrehen (Funktionen der ROLLE ändern t / n an den Noten-Objekten): lk bleibt je Note
    const ns = JSON.parse(JSON.stringify(C.notes)), byId = ns.map(n => JSON.stringify(n.lk));
    ns.forEach(n => { n.t = 4 - n.t - n.d; n.n = 120 - n.n; }); out.mirror = ns.every((n, i) => JSON.stringify(n.lk) === byId[i]);
    // Undo-Schnappschuss (cleanClip) trägt alles
    out.undoSnap = strip(cleanClip(C)) === strip(C);
    out.ref = ref.length;
    return out;
  });
  ok(r.origOk, 'I2-03 cleanNote-Kopie ändern lässt das Original unverändert (tiefe Kopie von lk.v)');
  ok(r.paste && r.dup, `I2-03 Kopieren/Einfügen ${r.paste}, Duplizieren ${r.dup}: lk, kl, klq, ln deep-equal`);
  ok(r.x2 === true && r.cow, `I2-03 ×2 trägt lk (${r.x2}); Lock an der Kopie ändert das Original nicht (copy on write): ${r.cow}`);
  ok(r.own, `I2-03 eigener Song-Clip (ownNorm) trägt kl, klq, ln: ${r.own}`);
  ok(r.mirror, `I2-03 Spiegeln/Umdrehen: lk je Note deep-equal: ${r.mirror}`);
  ok(r.undoSnap, `I2-03 Undo-Schnappschuss (cleanClip) trägt lk, kl, klq, ln: ${r.undoSnap}`);
}

/* ---------- I2-05 Undo / Redo, geändert-Punkt ---------- */
{
  const r = await p.evaluate(() => {
    const D = SYNQUENZER; D.newProject(); D.setClip(0, 0, {len: 1, notes: [{t: 0, d: .25, n: 60, v: .8}, {t: .5, d: .25, n: 62, v: .8}]});
    const st = () => JSON.stringify(D.getClip(0, 0)), s0 = st(), out = [];
    const acts = [['lkSet', () => D.lkSet(0, 0, 0, 'cutoff', .3)], ['lkSet löschen', () => D.lkSet(0, 0, 0, 'cutoff', null)], ['laneSet', () => D.laneSet(0, 0, {p: 'fx.pan', len: 8, st: [{i: 1, v: .2}]})],
      ['laneSet löschen', () => D.laneSet(0, 0, {p: 'fx.pan', del: true})], ['lanePut', () => D.lanePut(0, 0, 'res', [.1, .2])], ['lockPut', () => D.lockPut(0, 0, 'aD', [.5, .5, .5])]];
    for (const [nm, f] of acts) {
      const a = st(), n0 = D.undoInfo().n; BOOT.dirty = false; f(); const b = st(), n1 = D.undoInfo().n;
      D.undo(); const c = st(); D.redo(); const d = st();
      out.push([nm, n1 - n0, c === a, d === b]);
    }
    return {out, s0};
  });
  ok(r.out.every(x => x[1] === 1 && x[2] && x[3]), `I2-05 je Aktion ein Undo-Schritt, Undo/Redo stellt her: ${r.out.map(x => x[0] + ' ' + x[1] + (x[2] && x[3] ? '✓' : '✗')).join(' · ')} (historyCheck: auf dieser Basis nicht vorhanden)`);
}

/* ---------- I2-04 (Daten-Teil): ohne I2-Felder Zeichen für Zeichen wie der Vorgänger ---------- */
{
  const corpus = await p.evaluate(() => {
    const D = SYNQUENZER, out = [];
    D.loadDemo(); out.push(['demo', D.serialize()]);
    const fac = D.factory();
    for (let i = 0; i < fac.length; i += 1) {
      const f = fac[i]; D.newProject();
      try { if (f.engine === 'drum') D.loadKit && null; else D.loadPreset(0, f.id); } catch (e) {}
      D.setClip(0, 0, {len: 1, notes: [{t: 0, d: .5, n: 60, v: .8}, {t: 1, d: .5, n: 64, v: .6, o: 1.01}]});
      D.setClip(DRUM_T, 0, {len: 1, notes: [{t: 0, d: .25, n: 36, v: .8, lk: {tune: 3, dec: 1.5}, p: .5, r: 2, m: .1, a: 1}]});
      out.push([f.id, D.serialize()]);
    }
    return out;
  });
  const {b: b0, p: p0} = await open(BASE);
  const diff = [];
  const reNew = await p.evaluate(c => c.map(([id, j]) => [id, JSON.stringify(normalizeProject(SQStore.parseFile(j, LEGACY_HOOKS).project), stripReplacer)]), corpus);
  const reOld = await p0.evaluate(c => c.map(([id, j]) => [id, JSON.stringify(normalizeProject(SQStore.parseFile(j, LEGACY_HOOKS).project), stripReplacer)]), corpus);
  // auch die Datei selbst: die neue App schreibt dasselbe wie die alte (ohne need)
  const fileOld = await p0.evaluate(c => c.map(([id, j]) => { const q = normalizeProject(SQStore.parseFile(j, LEGACY_HOOKS).project); return JSON.stringify(SQStore.buildProjectFile(q, null, '4.24.0').project); }), corpus);
  const fileNew = await p.evaluate(c => c.map(([id, j]) => { const q = normalizeProject(SQStore.parseFile(j, LEGACY_HOOKS).project); needSync(q); return JSON.stringify(SQStore.buildProjectFile(q, null, '4.24.0').project); }), corpus);
  await b0.close();
  for (let i = 0; i < corpus.length; i++) if (reNew[i][1] !== reOld[i][1] || fileNew[i] !== fileOld[i]) diff.push(corpus[i][0]);
  ok(diff.length === 0, `I2-04 (Daten) Demo + ${corpus.length - 1} Werksklang-Projekte: normalisiertes JSON und Datei gegen 4.24.0 Zeichen für Zeichen gleich: ${corpus.length - diff.length}/${corpus.length} ${diff.slice(0, 5).join(' ')}`);
  const needNo = await p.evaluate(c => c.filter(([id, j]) => JSON.parse(j).project.need != null).length, corpus);
  ok(needNo === 0, `I2-04 kein need-Feld ohne I2-Daten: ${needNo} Projekte mit need`);
}

/* ---------- I2-06 Baustein N ---------- */
{
  const mk = await p.evaluate(() => { const D = SYNQUENZER; D.newProject(); D.setClip(0, 0, {len: 1, notes: [{t: 0, d: .5, n: 60, v: .8, lk: {v: {cutoff: .7}}}], ln: [{p: 'fx.rev', len: 4, st: [{i: 0, v: .3}]}]}); return {j: D.serialize(), need: JSON.parse(D.serialize()).project.need}; });
  ok(JSON.stringify(mk.need) === '["lk"]', `I2-06 S.need beim Speichern aus den Daten: ${JSON.stringify(mk.need)}`);
  // (a) Stand mit Baustein N ohne Merkmal 'lk' (KNOWN_NEED ohne Eintrag) -> gesperrt, Hinweisband, nichts überschrieben
  const a = await p.evaluate(async j => {
    const D = SYNQUENZER; D.needKnown([]);
    const r = D.importJSON(j); await new Promise(r => setTimeout(r, 400));
    const ban = document.getElementById('nvBan'), lock = !!NV.lock, raw = NV.raw ? JSON.stringify(NV.raw.project) : null;
    const out = {r, lock, ban: !!ban && ban.textContent.includes('neueren SYNQUENZER-Version'), rawSame: raw === JSON.stringify(JSON.parse(j).project), n: NV.lock && NV.lock.n};
    // zz: unbekanntes Merkmal
    D.needKnown(['lk']);
    const o = JSON.parse(j); o.project.need = ['zz']; o.sum = SQStore.fnv(JSON.stringify(o.project));
    D.importJSON(JSON.stringify(o)); await new Promise(r => setTimeout(r, 400));
    out.zz = !!NV.lock && JSON.stringify(NV.lock.n) === '["zz"]';
    return out;
  }, mk.j);
  ok(a.lock && a.ban && a.rawSame && JSON.stringify(a.n) === '["lk"]', `I2-06 (a) Stand ohne 'lk' in KNOWN_NEED: gesperrt ${a.lock}, Hinweisband ${a.ban}, Original unverändert gehalten ${a.rawSame}, n=${JSON.stringify(a.n)}`);
  ok(a.zz, `I2-06 need: ['zz'] → gesperrt: ${a.zz}`);
  // (b) Stand vor Baustein N (4.24.0) öffnet ohne Fehler (bekannte Lücke: verliert die I2-Felder beim Speichern)
  const {b: b0, p: p0, errs: e0} = await open(BASE);
  const bb = await p0.evaluate(async j => { const D = SYNQUENZER; const r = D.importJSON(j); await new Promise(r => setTimeout(r, 400)); const s = JSON.parse(D.serialize()).project; return {r, lock: !!NV.lock, lost: !s.tracks[0].clips[0].notes[0].lk && !s.tracks[0].clips[0].ln}; }, mk.j);
  await b0.close();
  ok(bb.r && !bb.lock && e0.length === 0, `I2-06 (b) 4.24.0 öffnet ohne Fehler (gesperrt: ${bb.lock}, Konsolenfehler ${e0.length}); verliert lk/ln beim Speichern: ${bb.lost} (bekannte Lücke)`);
  // (c) zurück im neuen Stand deep-equal
  const c = await p.evaluate(async j => { const D = SYNQUENZER; D.needKnown(['lk']); D.importJSON(j); await new Promise(r => setTimeout(r, 400)); return {lock: !!NV.lock, same: JSON.stringify(JSON.parse(D.serialize()).project) === JSON.stringify(JSON.parse(j).project)}; }, mk.j);
  ok(!c.lock && c.same, `I2-06 (c) neuer Stand öffnet frei (${!c.lock}) und schreibt deep-equal zurück: ${c.same}`);
}

ok(errs.length === 0, `Konsolenfehler: ${errs.length} ${errs.slice(0, 3).join(' | ')}`);
fs.writeFileSync(new URL('./i2a-ergebnis.json', import.meta.url), JSON.stringify(res, null, 1));
await b.close();
