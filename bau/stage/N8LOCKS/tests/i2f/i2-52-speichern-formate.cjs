// I2-52 Anschlag-Änderungen: Speichern/Laden deep-equal, MIDI-Export Anschlag = round(v · 127);
// Formate (P1 P2 P3 L1 L2 W 428×926): ⇕ erreichbar (≥ 44 px breit, Leistenhöhe), Anschlag-Leiste im Bild (44 + ≥ 96 + 44),
// Blatthöhe vor/nach ⇕ ± 0 px. Dazu Regel 28: unverändertes Projekt serialisiert und exportiert bitgleich zur Grundlage.
const L = require('./lib.cjs'), path = require('path');
const BASE = path.resolve(__dirname, '..', '..', '..', '..', 'snapshots', 'R-4300.html');
const rows = [], ok = (id, c, txt) => rows.push({id, ok: !!c, txt});
const NOTES = [{t: 0, n: 60, v: .3, d: 1}, {t: 1, n: 64, v: .8, d: 1}, {t: 2, n: 67, v: .1, d: 1}, {t: 3, n: 62, v: .5, d: 1}];
const midiNotes = () => {   // Note-An der Spur-Kanäle aus buildMidi (Szene)
  const r = buildMidi({mode: 'scene', scene: 0}), b = r.bytes, out = [];
  let i = 14;
  while (i < b.length) {
    i += 4; const len = (b[i] << 24 | b[i + 1] << 16 | b[i + 2] << 8 | b[i + 3]) >>> 0; i += 4; const end = i + len; let st = 0;
    while (i < end) {
      while (b[i++] & 0x80); let x = b[i];
      if (x === 0xFF) { i += 2; let l = 0; do { l = l << 7 | (b[i] & 127); } while (b[i++] & 0x80); i += l; continue; }
      if (x & 0x80) { st = x; i++; } const hi = st & 0xF0;
      if (hi === 0x90 && b[i + 1] > 0) out.push({p: b[i], v: b[i + 1]});
      i += (hi === 0xC0 || hi === 0xD0) ? 1 : 2;
    }
    i = end;
  }
  return out;
};
(async () => {
  const b = await L.launch();
  // 1) Speichern/Laden nach ⇕-Ziehen
  let p = await L.open(b, 'P1');
  await L.rollWith(p, NOTES); await p.waitForTimeout(250);
  await p.evaluate(() => { ED.roll.setTool('vel'); ED.roll.centerOn(63); }); await p.waitForTimeout(120);
  for (const [beat, n, dy] of [[.4, 60, -37], [1.4, 64, 23], [2.4, 67, -151]]) {
    const a = await p.evaluate(([x, y]) => ED.roll._xy(x, y), [beat, n]);
    await L.touch(p, L.line(a.x, a.y, a.x, a.y + dy, 14)); await p.waitForTimeout(100);
  }
  const before = await p.evaluate(() => JSON.parse(JSON.stringify(S.tracks[1].clips[0])));
  const vs = before.notes.map(n => n.v);
  ok('I2-52', vs[0] !== .3 && vs[1] !== .8 && vs[2] !== .1 && vs[3] === .5, 'Anschlag gezogen: ' + vs.join(' · '));
  const back = await p.evaluate(() => { const j = serializeProject(); applyProject(JSON.parse(j), {}); return {c: JSON.parse(JSON.stringify(S.tracks[1].clips[0])), same: serializeProject() === j}; });
  ok('I2-52', JSON.stringify(back.c) === JSON.stringify(before) && back.same, 'Speichern → Laden: Clip deep-equal ' + (JSON.stringify(back.c) === JSON.stringify(before)) + ', Projekt-Text gleich ' + back.same);
  const fileRT = await p.evaluate(() => { const o = JSON.parse(serialize()); const c = (o.project || o).tracks ? (o.project || o).tracks[1].clips[0] : null; return c ? c.notes.map(n => Array.isArray(n) ? n[3] : n.v) : null; });
  ok('I2-52', JSON.stringify(fileRT) === JSON.stringify(vs), 'Datei-Format 5 (serialize, [t, d, n, v]) trägt v: ' + JSON.stringify(fileRT));
  const mid = await p.evaluate(midiNotes);
  const want = before.notes.map(n => ({p: n.n, v: Math.max(1, Math.round(n.v * 127))}));
  const got = want.map(w => mid.find(m => m.p === w.p));
  ok('I2-52', want.every((w, k) => got[k] && got[k].v === w.v), 'MIDI-Export: ' + want.map((w, k) => w.p + ' v' + vs[k] + '→' + (got[k] && got[k].v) + ' (Soll ' + w.v + ')').join(' · '));
  ok('I2-52', !p.errs.length, 'Konsolenfehler (Speichern/MIDI): ' + p.errs.length + ' ' + p.errs.slice(0, 2).join(' | '));
  await p.ctx.close();
  // 2) Regel 28: dasselbe unveränderte Projekt in Grundlage und I2F → gleicher Projekt-Text und gleiche MIDI-Bytes
  const q0 = await L.open(b, 'P1', {file: BASE});
  const A = await q0.evaluate(ns => { S.tracks[1].clips[0] = {len: 1, key: {root: 0, scale: 'ionian', src: 'auto'}, notes: ns}; clipChanged(1, 0);
    return {j: serializeProject(), f: serialize(), m: Array.from(buildMidi({mode: 'scene', scene: 0}).bytes).join(',')}; }, NOTES); await q0.ctx.close();
  const q1 = await L.open(b, 'P1');
  const B = await q1.evaluate(A => { applyProject(JSON.parse(A.j), {}); const f = JSON.parse(serialize()), fa = JSON.parse(A.f); delete f.appVersion; delete fa.appVersion; delete f.sum; delete fa.sum;
    return {j: serializeProject(), f: JSON.stringify(f) === JSON.stringify(fa), m: Array.from(buildMidi({mode: 'scene', scene: 0}).bytes).join(',')}; }, A); await q1.ctx.close();
  ok('R28', A.j === B.j && B.f && A.m === B.m, `Projekt der Grundlage in I2F geladen und geschrieben: Projekt-Text bitgleich ${A.j === B.j} (${A.j.length} Zeichen), Datei gleich ${B.f}, MIDI-Bytes gleich ${A.m === B.m}`);
  // 3) Formate
  for (const f of Object.keys(L.FMT)) {
    p = await L.open(b, f);
    await L.rollWith(p, NOTES); await p.waitForTimeout(300);
    const m = await p.evaluate(async () => {
      const sh = document.getElementById('rollSheet') || ED.roll.el.main.closest('.sheet'), h0 = sh.getBoundingClientRect().height;
      const vb = ED.roll.el.bar.querySelector('.vhit'); vb.scrollIntoView({inline: 'nearest', block: 'nearest'});
      await new Promise(r => setTimeout(r, 60));
      const rb = vb.getBoundingClientRect(), bar = ED.roll.el.bar.getBoundingClientRect();
      const hp = y => { const h = document.elementFromPoint(rb.left + rb.width / 2, y); return !!h && (h === vb || vb.contains(h)); }, hit = hp(bar.top + 2) && hp(bar.bottom - 2) && hp(rb.top + rb.height / 2);
      ED.roll.setTool('vel'); ED.roll.select([S.tracks[1].clips[0].notes[0]]);
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      const h1 = sh.getBoundingClientRect().height;
      const ab = ED.roll.el.acts.getBoundingClientRect(), on = (e, x, y) => { const hh = document.elementFromPoint(x, y); return !!hh && (hh === e || e.contains(hh)); };
      const hh = (e, cx, r) => { let n = 0; for (let y = r.top - 12; y <= r.bottom + 12; y += .5) { const x = document.elementFromPoint(cx, y); if (x === e || (x && e.contains(x))) n += .5; } return n; };   // N8LOCKS: die echte Trefferhöhe
      const q = s => { const e = ED.roll.el.acts.querySelector(s), r = e.getBoundingClientRect(), cx = r.left + r.width / 2; return {w: r.width, h: r.height, l: r.left, r: r.right, t: r.top, b: r.bottom, hitH: hh(e, cx, r), top: on(e, cx, r.top + r.height / 2) && on(e, cx, ab.top + 2) && on(e, cx, ab.bottom - 2)}; };
      const P = q('.vnav[aria-label="Vorige Note"]'), F = q('.vfld'), N = q('.vnav[aria-label="Nächste Note"]');
      return {h0, h1, tw: rb.width, th: rb.height, barH: bar.height, tHit: hit, P, F, N, W: innerWidth, H: innerHeight};
    });
    const inV = o => o.l >= -.5 && o.r <= m.W + .5 && o.t >= -.5 && o.b <= m.H + .5;
    ok('I2-52', m.tw >= 44 && m.tHit,
      `${f}: ⇕ ${m.tw.toFixed(0)} px breit, Trefferfläche über die ganze Leiste (${m.barH.toFixed(0)} px) ${m.tHit} (Bild ${m.th.toFixed(0)} px)`);
    ok('I2-52', [m.P, m.F, m.N].every(o => inV(o) && o.top && o.hitH >= 44) && m.P.w >= 44 && m.N.w >= 44 && m.F.w >= 96,
      `${f}: Leiste ◀ ${m.P.w.toFixed(0)} · VEL ${m.F.w.toFixed(0)} · ▶ ${m.N.w.toFixed(0)} px, Trefferhöhe ${m.P.hitH.toFixed(0)} px (Bild ${m.P.h.toFixed(0)}), im Bild ${[m.P, m.F, m.N].every(inV)}, oben auf ${[m.P, m.F, m.N].every(o => o.top)}`);
    ok('I2-52', Math.abs(m.h1 - m.h0) < .5, `${f}: Blatthöhe vor/nach ⇕ ${m.h0.toFixed(1)} → ${m.h1.toFixed(1)} px`);
    if (p.errs.length) ok('I2-52', false, f + ': Konsolenfehler ' + p.errs.slice(0, 2).join(' | '));
    await p.ctx.close();
  }
  await b.close(); process.exitCode = L.report('I2-52', rows) ? 1 : 0;
})();
