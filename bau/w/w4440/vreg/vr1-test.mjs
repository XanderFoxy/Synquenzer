// VR1: Ereigniserkennung + Auto-Regie (Regeln, Clip „Im Video“), Gerät/Modulation im Editor-Blatt, Klavier steigt auf,
// Bedienung (Clip-Blatt, Regel-Blatt, Video-Streifen), kurzer Video-Render. Aufruf: node vr1-test.mjs <index.html> <out-dir>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs'; import { execSync } from 'child_process';
const APP = process.argv[2], OUT = process.argv[3], ST = OUT + '/stills';
fs.mkdirSync(ST, {recursive: true});
const C = []; const ok = (id, c, info) => { C.push([id, !!c]); console.log((c ? 'PASS ' : 'FAIL ') + id + (info != null ? ' — ' + JSON.stringify(info).slice(0, 700) : '')); };
const save = (name, b64) => fs.writeFileSync(ST + '/' + name, Buffer.from(b64, 'base64'));
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 428, height: 926}, deviceScaleFactor: 1});
const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + APP); await p.waitForTimeout(1500); await p.mouse.click(5, 300);
await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 15000}).catch(() => {});
await p.waitForTimeout(300);
// ---------- der Song: Intro (Bass, Drums, ab 3 Akkorde) · Strophe (Gesang ab 5, Gegenmelodie ab 9, Fill in 12) · Refrain (Synth 4 ab 13,
// ◆-Klangfahrt ab 15) · Break (alles still außer Akkorde) · Drop (Drums + Bass zurück) · Outro
const setup = await p.evaluate(async () => {
  const A = SYNQUENZER; A.setMetronome && A.setMetronome(false);
  const pcm = []; for (let k = 0; k < 48000 * .9; k++) pcm.push(Math.round(9000 * Math.sin(k * 2 * Math.PI * 220 / 48000) * Math.min(1, k / 2000, (43200 - k) / 2000)));
  const inj = await A.tkInject({pcm, sr: 48000, scene: 0, len: 2});
  const syn = (n0, pat) => ({len: 1, notes: pat.map(([t, d, n, v]) => ({t, d, n: n0 + n, v}))});
  A.setClip(0, 0, syn(36, [[0, .5, 0, .9], [1, .5, 0, .6], [2, .5, 7, .8], [3, .5, 5, .5]]));
  A.setClip(1, 0, syn(72, [[0, 1.5, 0, .5], [1.5, .5, 2, .7], [2, 1, 4, .95], [3, 1, 7, .4]]));
  A.setClip(2, 0, syn(60, [[0, 4, 0, .6], [0, 4, 4, .55], [0, 4, 7, .5]]));
  A.setClip(3, 0, syn(67, [[0, .25, 0, .8], [.5, .25, 7, .7], [1, .25, 12, 1], [1.5, .25, 7, .6], [2, .25, 0, .8], [2.5, .25, 7, .7], [3, .25, 12, .9], [3.5, .25, 5, .6]]));
  A.setClip(3, 1, syn(67, [[0, .5, 0, .8], [.5, .5, 5, .7], [1, .5, 7, 1], [1.5, .5, 12, .6], [2, .5, 7, .8], [2.5, .5, 5, .7], [3, 1, 0, .9]]));
  A.setClip(DRUM_T, 0, {len: 1, notes: [[0, 36, .95], [1, 38, .8], [2, 36, .9], [3, 38, .85], [0, 42, .5], [.5, 42, .4], [1, 42, .5], [1.5, 42, .4], [2, 42, .5], [2.5, 42, .4], [3, 42, .5], [3.5, 42, .4]].map(([t, n, v]) => ({t, d: .25, n, v}))});
  A.setClip(DRUM_T, 1, {len: 1, notes: [[0, 36, .95], [1, 50, .8], [1.5, 50, .7], [2, 47, .85], [2.5, 47, .75], [3, 45, .9], [3.5, 38, 1]].map(([t, n, v]) => ({t, d: .25, n, v}))});
  A.v6aSetState(3, 1, {p: {cutoff: 6000, res: .6}});
  const st = stimmeT(), nt = NT(), lanes = Array.from({length: nt}, () => []);
  lanes[0] = [{bar: 0, slot: 0}, {bar: 16, slot: -1}, {bar: 18, slot: 0}];
  lanes[1] = [{bar: 8, slot: 0}, {bar: 16, slot: -1}];
  lanes[2] = [{bar: 2, slot: 0}];
  lanes[3] = [{bar: 12, slot: 0}, {bar: 14, slot: 1}, {bar: 16, slot: -1}];
  lanes[DRUM_T] = [{bar: 0, slot: 0}, {bar: 11, slot: 1}, {bar: 12, slot: 0}, {bar: 16, slot: -1}, {bar: 18, slot: 0}];
  lanes[st] = [{bar: 4, slot: 0}, {bar: 10, slot: -1}];
  A.setSong({bars: 24, lanes, carrier: [], marks: [{id: 'm1', a: 0, len: 4, name: 'Intro'}, {id: 'm2', a: 4, len: 8, name: 'Strophe'}, {id: 'm3', a: 12, len: 4, name: 'Refrain'},
    {id: 'm4', a: 16, len: 2, name: 'Break'}, {id: 'm5', a: 18, len: 4, name: 'Drop'}, {id: 'm6', a: 22, len: 2, name: 'Outro'}]});
  A.vr1RulesSet(null);
  return {st, nt, inj: !!inj, bars: S.song.bars, bpm: S.bpm, drumT: DRUM_T};
});
ok('Song aufgebaut (STIMME, Gegenmelodie, Fill, ◆, Break/Drop)', setup.st >= 0 && setup.bars === 24, setup);
const ST_T = setup.st, DR = setup.drumT;
// ---------- 1. Ereignisse ----------
const ev = await p.evaluate(() => SYNQUENZER.vr1Events(0, 24).map(e => [e.x, e.ev.map(q => q.k + (q.t != null ? ':' + q.t : '') + (q.why ? '/' + q.why : ''))]));
console.log('Ereignisse', JSON.stringify(ev));
const has = (x, s) => { const e = ev.find(q => q[0] === x); return !!e && e[1].some(q => q.startsWith(s)); };
ok('Ereignisse: Spur setzt ein (Takt 3 Akkorde, Takt 9 Gegenmelodie)', has(2, 'ein:2') && has(8, 'ein:1'));
ok('Ereignisse: Gesang beginnt (Takt 5)', has(4, 'gesang:' + ST_T));
ok('Ereignisse: Fill (Takt 12, ein Takt anderer Drum-Clip)', has(11, 'fill:' + DR));
ok('Ereignisse: Klangfahrt ◆ (Takt 15) + neuer Clip', has(14, 'morph:3') && has(14, 'neu:3'));
ok('Ereignisse: Teilwechsel an jedem Teil, Drop (Takt 19), Spur setzt aus (Takt 17)', [0, 4, 12, 16, 18, 22].every(x => has(x, 'teil')) && has(18, 'drop') && has(16, 'aus:0'));
const ev2 = await p.evaluate(() => JSON.stringify(SYNQUENZER.vr1Events(0, 24)));
ok('Ereignisse deterministisch (zweimal gleich)', ev2 === JSON.stringify(await p.evaluate(() => SYNQUENZER.vr1Events(0, 24))));
// ---------- 2. Auto-Regie nach den Regeln ----------
const cut = o => p.evaluate(o => SYNQUENZER.vr1Cuts(o), o || {range: {a: 0, b: 24}});
const shotAt = (cs, x) => cs.shots.find(s => s.a === x);
let cs = await cut(); console.log('Schnitte', JSON.stringify(cs.shots.map(s => [s.a, s.b, s.v, s.t, s.why])));
ok('Auto-Regie: Gesang (Takt 5) → STIMME-Welle', (shotAt(cs, 4) || {}).v === 'spur' && shotAt(cs, 4).t === ST_T, shotAt(cs, 4));
ok('Auto-Regie: Gegenmelodie (Takt 9) → ihre Spur (Zelle, dann Noten)', (shotAt(cs, 8) || {}).v === 'roll' && shotAt(cs, 8).t === 1, shotAt(cs, 8));
ok('Auto-Regie: Fill (Takt 12) → Drum-Sequenzer ab Takt 11, Refrain-Anfang bleibt ein Schnitt (Synth 4 setzt ein → seine Spur)', (shotAt(cs, 10) || {}).v === 'drum' && (shotAt(cs, 12) || {}).t === 3, [shotAt(cs, 10), shotAt(cs, 12)]);
ok('Auto-Regie: Klangfahrt (Takt 15) → Mäusekino', (shotAt(cs, 14) || {}).v === 'kino', shotAt(cs, 14));
ok('Auto-Regie: Drop (Takt 19) → Matrix', (shotAt(cs, 18) || {}).v === 'matrix', shotAt(cs, 18));
ok('Auto-Regie: Schnitte nur auf Taktstrichen, ≥ 2 Takte, ≤ 8 Takte', cs.shots.every((s, k) => s.b - s.a >= 2 || k === cs.shots.length - 1) && cs.shots.every(s => s.b - s.a <= 8), cs.shots.map(s => s.b - s.a));
const h1 = cs.hash; ok('Schnittliste deterministisch', h1 === (await cut()).hash);
// Regeln: Gesang aus, Klangfahrt → Gerät, Reihenfolge
let r2 = await p.evaluate(() => { const R_ = SYNQUENZER.vr1Rules(); R_.find(q => q.k === 'gesang').on = false; R_.find(q => q.k === 'morph').v = 'geraet'; return SYNQUENZER.vr1RulesSet(R_); });
cs = await cut();
ok('Regel aus: Gesang → Takt 5 zeigt nicht die STIMME', !(shotAt(cs, 4) && shotAt(cs, 4).t === ST_T), shotAt(cs, 4));
ok('Regel geändert: Klangfahrt → Gerät der Spur', (shotAt(cs, 14) || {}).v === 'geraet' && shotAt(cs, 14).t === 3, shotAt(cs, 14));
r2 = await p.evaluate(() => { const R_ = SYNQUENZER.vr1Rules(); const j = R_.findIndex(q => q.k === 'ein'); R_.unshift(R_.splice(j, 1)[0]); R_.find(q => q.k === 'gesang').on = true; return SYNQUENZER.vr1RulesSet(R_).map(q => q.k); });
ok('Regel-Reihenfolge = Vorrang (Spur setzt ein ganz oben gespeichert)', r2[0] === 'ein', r2);
const pr = await p.evaluate(() => { const R_ = SYNQUENZER.vr1Rules(); const j = R_.findIndex(q => q.k === 'teil'); R_.unshift(R_.splice(j, 1)[0]); SYNQUENZER.vr1RulesSet(R_); return SYNQUENZER.vr1Cuts({range: {a: 0, b: 24}}).shots.find(s => s.a === 12); });
ok('Vorrang wirkt: Teilwechsel ganz oben → Refrain-Anfang zeigt die App statt Synth 4', pr && pr.v === 'app', pr);
await p.evaluate(() => SYNQUENZER.vr1RulesSet(null));
ok('Standard wiederhergestellt → gleiche Schnittliste', (await cut()).hash === h1);
// Clip „Im Video“: Akkorde → Klavier, Gegenmelodie → aus; Undo; Speichern/Laden
const cv = await p.evaluate(() => { const a = SYNQUENZER.vr1SetVid(2, 0, 'klav'), b = SYNQUENZER.vr1SetVid(1, 0, 'aus'); return {a, b, v2: SYNQUENZER.vr1Vid(2, 0), v1: SYNQUENZER.vr1Vid(1, 0)}; });
cs = await cut();
ok('Clip „Im Video: Klavier“: Einsatz der Akkorde (Takt 3) zeigt Klavier', (shotAt(cs, 2) || {}).v === 'klav', shotAt(cs, 2));
ok('Clip „Im Video: aus“: die Gegenmelodie kommt nie in den Fokus', !cs.shots.some(s => s.t === 1), cs.shots.map(s => [s.a, s.v, s.t]));
const rt = await p.evaluate(() => { const nos = j => { const o = JSON.parse(j); delete o.sum; const can = x => (Array.isArray(x) ? x.map(can) : x && typeof x === 'object' ? Object.keys(x).sort().reduce((r, k) => (r[k] = can(x[k]), r), {}) : x); return JSON.stringify(can(o)); }, j = SYNQUENZER.serialize(); SYNQUENZER.importJSON(j); const j2 = SYNQUENZER.serialize(), d = []; const walk = (q, u, v) => { if (JSON.stringify(u) === JSON.stringify(v)) return; if (u && v && typeof u === 'object' && typeof v === 'object') { for (const k of new Set(Object.keys(u).concat(Object.keys(v)))) walk(q + '.' + k, u[k], v[k]); } else d.push(q + ': ' + JSON.stringify(u).slice(0, 60) + ' → ' + JSON.stringify(v).slice(0, 60)); }; walk('', JSON.parse(j), JSON.parse(j2));
  return {v2: SYNQUENZER.vr1Vid(2, 0), v1: SYNQUENZER.vr1Vid(1, 0), same: nos(j2) === nos(j), diff: d.slice(0, 8)}; });
ok('Speichern → Laden: „Im Video“ bleibt (deep-equal; die Prüfsumme „sum“ ändert sich mit STIMME-Take auch in 4.42.0)', rt.v2 === 'klav' && rt.v1 === 'aus' && rt.same, rt);
const un = await p.evaluate(() => { SYNQUENZER.vr1SetVid(2, 0, null); const a = SYNQUENZER.vr1Vid(2, 0); SYNQUENZER.undo(); const b = SYNQUENZER.vr1Vid(2, 0); SYNQUENZER.redo(); const c = SYNQUENZER.vr1Vid(2, 0); SYNQUENZER.vr1SetVid(1, 0, null); return {a, b, c}; });
ok('Undo/Redo: ein Schritt je Änderung', un.a === null && un.b === 'klav' && un.c === null, un);
const cp = await p.evaluate(() => { SYNQUENZER.vr1SetVid(0, 0, 'geraet'); SYNQUENZER.copyClip(0, 0); SYNQUENZER.pasteClip(0, 3); const k = SYNQUENZER.duplicateClip(0, 0); return {paste: SYNQUENZER.vr1Vid(0, 3), dup: k >= 0 ? SYNQUENZER.vr1Vid(0, k) : 'kein Platz'}; });
ok('Kopieren/Einfügen/Duplizieren nehmen „Im Video“ mit', cp.paste === 'geraet' && cp.dup === 'geraet', cp);
// manuelle Regie geht vor
const man = await p.evaluate(() => { vvDirSet(4, 6, 'matrix'); const s = SYNQUENZER.vr1Cuts({range: {a: 0, b: 24}}).shots.find(x => x.a === 4); vvDirSet(4, 6, 'auto'); return s; });
ok('Manuelle Regie (Teil/Marke) geht vor', man && man.v === 'matrix', man);
await p.evaluate(() => { SYNQUENZER.vr1SetVid(0, 0, null); SYNQUENZER.vr1SetVid(2, 0, null); });
// Regie-Zeile: „Spur …“ bietet Gerät
const pick = await p.evaluate(() => { vvDirSet(13, 15, 'geraet', 3); const of = vvDirOf(13, 15), row = vvDirRow(13, 15, 'ms-b'); vvDirSet(13, 15, 'auto'); return {of, on: /data-a="vv-spur"[^>]*aria-pressed="true"|class="rb ms-b on" data-a="vv-spur"/.test(row)}; });
ok('Regie-Zeile: Gerät setzbar (Spur … → Gerät), Taste „Spur …“ leuchtet', pick.of === 'geraet:3' && pick.on, pick);
// ---------- 3. Render + Bilder ----------
const T0 = Date.now(); await p.evaluate(() => SYNQUENZER.vvRender({range: {a: 0, b: 24}})); const msAudio = Date.now() - T0;
const tOf = bar => p.evaluate(bar => { const r = VV.last; return (r.lead || 0) + bar * 4 * 60 / r.bpm; }, bar);
// Klavier: 16:9 + 9:16 (Refrain, Takt 13,6 – Noten steigen, oben Funken)
const tK = await tOf(13.6), shots = [];
for (const fmt of ['16:9', '9:16']) { const x = await p.evaluate(([t, f]) => SYNQUENZER.vr1Pic(t, 'klav', null, f), [tK, fmt]); save(`klavier-${fmt.replace(':', 'x')}.png`, x.png); shots.push({fmt, rise: x.klav.rise, notes: x.klav.notes, sparks: x.klav.sparks, lit: x.klav.lit.length, ms: x.ms, rows: x.klav.rows.slice(0, 3)}); }
ok('Klavier: Noten steigen auf (Balken über der Tastatur, oben Funken), 16:9 + 9:16', shots.every(s => s.rise && s.notes > 0 && s.sparks > 0), shots);
const geo = await p.evaluate(t => { const x = SYNQUENZER.vr1Pic(t, 'klav', null, '9:16').klav; return {nowY: x.nowY, yD: x.yD, top: x.top, on: x.rows.filter(r => r.on).map(r => ({y: r.y, h: r.h, end: +(r.y + r.h).toFixed(1)})).slice(0, 4), off: x.rows.filter(r => !r.on).map(r => ({a: r.a, y: r.y})).slice(0, 4)}; }, tK);
ok('Klavier: klingende Note beginnt an der Taste (unten = Jetzt-Linie), verklungene liegen darüber', geo.on.length > 0 && geo.on.every(r => Math.abs(r.end - geo.nowY) < .6) && geo.off.every(r => r.y < geo.nowY), geo);
const a1 = await p.evaluate(t => SYNQUENZER.vr1Pic(t, 'klav', null, '9:16').png, tK);
ok('Klavier deterministisch (gleiches Bild, Samen aus Note/Zeit)', a1 === await p.evaluate(t => SYNQUENZER.vr1Pic(t, 'klav', null, '9:16').png, tK));
const perf = await p.evaluate(t => { const out = {}; for (const up of [true, false]) { SYNQUENZER.vr1Klav(up); out[(up ? 'steigt' : 'fällt-alt') + '@9:16'] = SYNQUENZER.vr1KlavMs(t, '9:16', 30); out[(up ? 'steigt' : 'fällt-alt') + '@16:9'] = SYNQUENZER.vr1KlavMs(t, '16:9', 30); } SYNQUENZER.vr1Klav(true); return out; }, tK);
ok('Klavier: Zeichenzeit je Video-Bild (ms) gemessen, < 33 ms (Echtzeit-Vorschau 30 fps)', perf['steigt@9:16'] < 33 && perf['steigt@16:9'] < 33, perf);
// Gerät + Modulation (keine Regler allein)
const tM = await tOf(14.4);
const ger = await p.evaluate(t => { const g = SYNQUENZER.vr1Pic(t, 'geraet', 3, '9:16'); return {png: g.png, ms: g.ms, ger: g.vv4 && g.vv4.ger ? {kind: g.vv4.ger.kind, page: g.vv4.ger.ed && g.vv4.ger.ed.page, focus: g.vv4.ger.ed && g.vv4.ger.ed.focus, morph: g.vv4.ger.ed && g.vv4.ger.ed.morph, n: g.vv4.ger.ed && g.vv4.ger.ed.knobs.length} : null, els: g.vv4 ? g.vv4.els.map(e => e.el) : []}; }, tM);
save('geraet-9x16-synth4-klangfahrt.png', ger.png);
ok('Gerät (VA): Editor-Blatt der App, Fokus auf dem gleitenden Regler', ger.ger && ger.ger.kind === 'editor' && ger.ger.page === 'filter/ctl' && ger.ger.n >= 7 && ger.ger.focus === 'cutoff', ger);
const mod = await p.evaluate(t => { const g = SYNQUENZER.vr1Pic(t, 'mod', 0, '16:9'); return {png: g.png, mod: g.vv4 && g.vv4.mod ? {ed: g.vv4.mod.ed, focus: g.vv4.mod.focus, knobs: g.vv4.mod.knobs.map(k => k.key), rows: g.vv4.mod.rows.length} : null, els: g.vv4 ? g.vv4.els.map(e => e.el) : []}; }, await tOf(2.5));
save('modulation-16x9-synth1.png', mod.png);
ok('Modulation: Regler im Editor-Blatt (Reiter, Seite) + Mod-Übersicht, kein Einzel-Regler', mod.mod && mod.mod.ed && mod.els.includes('Reiter') && mod.mod.rows >= 1 && mod.mod.knobs.length >= 1, mod.mod);
const mk = await p.evaluate(async t => { const e0 = sndOf(2).engine; setEngine(2, 'mk'); if (typeof mkLoad === 'function') mkLoad(); for (let k = 0; k < 40 && !(window.MKUI && MKUI.ELS); k++) await new Promise(r => setTimeout(r, 100)); const g = SYNQUENZER.vr1Pic(t, 'geraet', 2, '9:16'); const g2 = SYNQUENZER.vr1Pic(t, 'geraet', 2, '16:9'); setEngine(2, e0); return {png: g.png, png2: g2.png, kind: g.vv4 && g.vv4.ger && g.vv4.ger.kind, zoom: g.vv4 && g.vv4.ger && g.vv4.ger.zoom, eng: sndOf(2).engine}; }, await tOf(5.5));
save('geraet-9x16-platte.png', mk.png); save('geraet-16x9-platte.png', mk.png2);
ok('Gerät (Geräte-Platte): die Original-Platte, hochkant mit Nahaufnahme am Regler', mk.kind === 'plate' && mk.zoom === 'f.cut', {kind: mk.kind, zoom: mk.zoom, engDanach: mk.eng});
const pages = await p.evaluate(t => { const keep = vr1Page, out = {}; try { for (const id of Object.keys(VR1_PG)) { vr1Page = () => id; for (const f of ['9:16', '16:9']) { const g = SYNQUENZER.vr1Pic(t, 'geraet', 0, f); out[id + '@' + f] = g.vv4 && g.vv4.ger && g.vv4.ger.ed ? g.vv4.ger.ed.knobs.length : -1; } } } finally { vr1Page = keep; } return out; }, await tOf(2.5));
ok('Editor-Blatt: alle Seiten (Filter, Osz 1–3, Mix, Stimme, Makro, FX) zeichnen ohne Fehler', Object.values(pages).every(n => n >= 2), pages);
const dr = await p.evaluate(t => { const g = SYNQUENZER.vr1Pic(t, 'geraet', DRUM_T, '9:16'); return g.vv4 && g.vv4.ger ? g.vv4.ger.kind : null; }, await tOf(5.5));
ok('Gerät (Drums): Drum-Sequenzer', dr === 'drum', dr);
// ---------- 4. Bedienung: Clip-Blatt, Regel-Blatt, Video-Streifen (hochkant + quer) ----------
const ui = {};
for (const [W, H, tag] of [[428, 926, 'hochkant'], [926, 428, 'quer']]) {
  await p.setViewportSize({width: W, height: H}); await p.waitForTimeout(300);
  await p.evaluate(() => { SYNQUENZER.songView(false); SYNQUENZER.openClipSheet(2, 0); }); await p.waitForTimeout(350);
  const cb = await p.evaluate(() => { const b = document.querySelector('.vr1cb'), r = b && b.getBoundingClientRect(), x = document.querySelector('#clipSheet .sh-x') || EL.clipSheet.querySelector('.sh-x'), xr = x && x.getBoundingClientRect(), sh = EL.clipSheet.getBoundingClientRect();
    return {txt: b && b.textContent, w: r && Math.round(r.width), h: r && Math.round(r.height), inView: !!r && r.bottom <= innerHeight && r.right <= innerWidth, x: !!xr && xr.right <= innerWidth && xr.top >= 0 && xr.width >= 44, over: EL.clipSheet.scrollHeight > EL.clipSheet.clientHeight + 1, shB: Math.round(sh.bottom)}; });
  await p.click('.vr1cb'); await p.waitForTimeout(300);
  const pk = await p.evaluate(() => { const q = [...document.querySelectorAll('.vr1vp button[data-v]')]; return {n: q.length, min: Math.min(...q.map(b => Math.round(Math.min(b.getBoundingClientRect().width, b.getBoundingClientRect().height)))), lab: q.map(b => b.querySelector('b').textContent)}; });
  await p.screenshot({path: `${OUT}/foto-${tag}-clip-im-video.png`});
  await p.click('.vr1vp button[data-v="klav"]'); await p.waitForTimeout(300);
  const after = await p.evaluate(() => ({vid: SYNQUENZER.vr1Vid(2, 0), txt: (document.querySelector('.vr1cb') || {}).textContent}));
  await p.evaluate(() => { SYNQUENZER.vr1SetVid(2, 0, null); closeClipSheet(); });
  ui[tag] = {cb, pk, after};
  ok(`Clip-Blatt ${tag}: Taste „Im Video“ (≥ 44 px, im Bild, Blatt ohne Überlauf), Auswahl Auto | Gerät | Klavier | Mäusekino | Noten | aus`, cb.h >= 44 && cb.inView && cb.x && !cb.over && pk.n === 6 && pk.min >= 44 && after.vid === 'klav' && /Klavier/.test(after.txt), ui[tag]);
  await p.evaluate(() => SYNQUENZER.vvOpen()); await p.waitForTimeout(600);
  const vb = await p.evaluate(() => { const b = document.querySelector('.vr1rb'), r = b && b.getBoundingClientRect(), row = b && b.parentNode, x = document.querySelector('#vvSheet .sh-x').getBoundingClientRect(); return {w: r && Math.round(r.width), h: r && Math.round(r.height), right: r && Math.round(r.right), vw: innerWidth, rowOver: row ? row.scrollWidth > row.clientWidth + 1 : null, x: x.right <= innerWidth && x.width >= 44}; });
  await p.click('.vr1rb'); await p.waitForTimeout(300);
  const rp = await p.evaluate(() => { const P = document.querySelector('.vr1rp'), r = P.getBoundingClientRect(), bs = [...P.querySelectorAll('button')], L = P.querySelector('.vr1rl'); return {rows: P.querySelectorAll('.vr1r').length, minBtn: Math.min(...bs.map(b => Math.round(Math.min(b.getBoundingClientRect().width, b.getBoundingClientRect().height)))), inView: r.top >= 0 && r.bottom <= innerHeight + 1 && r.right <= innerWidth, xFree: (() => { const x = document.querySelector('#vvSheet .sh-x').getBoundingClientRect(); return r.top >= x.bottom || r.right <= x.left; })(), scroll: L.scrollHeight > L.clientHeight, names: [...P.querySelectorAll('.vr1n')].map(n => n.textContent)}; });
  await p.screenshot({path: `${OUT}/foto-${tag}-regie-regeln.png`});
  // ein Tipp auf „Spur setzt ein“ → Ansicht → Gerät; dann ▲
  await p.click('.vr1r[data-k="ein"] .vr1v'); await p.waitForTimeout(200); await p.click('.vr1vw button[data-v="geraet"]'); await p.waitForTimeout(200);
  await p.click('.vr1r[data-k="ein"] button[data-a="up"]'); await p.waitForTimeout(200);
  const rr = await p.evaluate(() => { const R_ = SYNQUENZER.vr1Rules(); return {ein: R_.find(q => q.k === 'ein'), pos: R_.findIndex(q => q.k === 'ein')}; });
  await p.evaluate(() => { SYNQUENZER.vr1RulesSet(null); closePop(); SYNQUENZER.vvClose(); });
  ui[tag + '-regeln'] = {vb, rp, rr};
  ok(`Video-Blatt ${tag}: [Regeln] in der Zeile „Bild“ (≥ 44 px, kein Überlauf, ✕ sichtbar); Regel-Blatt: 9 Regeln, Tasten ≥ 44 px, Ansicht + Vorrang per Tipp`, vb.h >= 44 && vb.right <= vb.vw && !vb.rowOver && vb.x && rp.rows === 9 && rp.minBtn >= 44 && rp.inView && rp.xFree && rr.ein.v === 'geraet' && rr.pos === 2, ui[tag + '-regeln']);
  // der Video-Streifen im Song: liegt in der Taktleiste, verdeckt keine Bedienung (Tipp auf die Takt-Zahl wählt weiter)
  await p.evaluate(() => { vvDirSet(5, 7, 'roll', 0); SYNQUENZER.songView(true); SYNQUENZER.songSelect(null); }); await p.waitForTimeout(400);
  const sv = await p.evaluate(() => { const L = svLayoutInfo(), r = SV.cv.getBoundingClientRect(); return {r: [r.x, r.y, r.width, r.height], vvS: SV.vvS, ru: L.rulerH, cw: L.cellW, x0: L.x0}; });
  const sx = sv.r[0] + 5.5 * sv.cw - sv.x0, sy = sv.r[1] + sv.ru - sv.vvS / 2;
  const hit = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + (e.className || '') : null; }, [sx, sy]);
  ui[tag + '-streifen'] = {sv, hit};
  ok(`Song ${tag}: Video-Streifen (8 px) liegt auf der Song-Fläche, nichts Fremdes darüber`, sv.vvS === 8 && /^CANVAS/.test(hit || ''), ui[tag + '-streifen']);
  await p.evaluate(() => { vvDirSet(5, 7, 'auto'); SYNQUENZER.songView(false); });
}
await p.setViewportSize({width: 428, height: 926}); await p.waitForTimeout(300);
// ---------- 5. kurzer Video-Render (Auto-Regie mit Ereignissen, Klavier) ----------
await p.evaluate(() => SYNQUENZER.vvTest({opus: true}));
const vids = [];
for (const [k, o] of [[1, {fmt: '9:16', view: 'auto', range: {a: 10, b: 16}}], [2, {fmt: '16:9', view: 'auto', range: {a: 10, b: 16}}]]) {
  let r = null, err = null; const T1 = Date.now();
  try { r = await p.evaluate(o => SYNQUENZER.vvMake(o).then(x => ({ms: x.ms, dur: x.dur, how: x.how, W: x.W, H: x.H})), o); } catch (e) { err = String(e).slice(0, 300); }
  if (!r) { vids.push({k, err}); continue; }
  const bl = await p.evaluate(() => SYNQUENZER.vvBlob()), f = `${ST}/video-${k}-${o.fmt.replace(':', 'x')}.${bl.ext}`; fs.writeFileSync(f, Buffer.from(bl.b64, 'base64'));
  const sh = await p.evaluate(() => (VV.lastRt ? VV.lastRt.shots.map(s => [s.a, s.b, s.v, s.t, s.why]) : null));
  vids.push(Object.assign({k, f, wall: Date.now() - T1, shots: sh}, r));
}
console.log('Videos', JSON.stringify(vids));
const v1 = vids.find(v => v.k === 1), v2 = vids.find(v => v.k === 2);
ok('Video 9:16 + 16:9 erstellt, Schnitte aus den Ereignissen (Fill, Teil, Klangfahrt)', v1 && v1.f && v2 && v2.f && v1.shots && v1.shots.some(s => s[2] === 'drum') && v1.shots.some(s => s[2] === 'kino'), vids.map(v => ({k: v.k, err: v.err, dur: v.dur, how: v.how, shots: v.shots})));
if (v1 && v1.f) { const sp = 60 / setup.bpm; try { execSync(`ffmpeg -v error -y -ss ${((14.5 - 10) * 4 * sp).toFixed(3)} -i ${v1.f} -frames:v 1 ${ST}/video-9x16-frame-takt15.png`); execSync(`ffmpeg -v error -y -ss ${((11.5 - 10) * 4 * sp).toFixed(3)} -i ${v1.f} -frames:v 1 ${ST}/video-9x16-frame-takt12.png`); } catch (e) { console.log('ffmpeg', String(e).slice(0, 200)); } }
// Klavier-Video kurz (Regie Klavier für 2 Takte)
await p.evaluate(() => vvDirSet(12, 14, 'klav'));
let kv = null; try { kv = await p.evaluate(() => SYNQUENZER.vvMake({fmt: '9:16', view: 'auto', range: {a: 12, b: 14}}).then(x => ({dur: x.dur, ms: x.ms}))); const bl = await p.evaluate(() => SYNQUENZER.vvBlob()); fs.writeFileSync(`${ST}/video-klavier-9x16.${bl.ext}`, Buffer.from(bl.b64, 'base64'));
  execSync(`ffmpeg -v error -y -ss 2.2 -i ${ST}/video-klavier-9x16.${bl.ext} -frames:v 1 ${ST}/video-klavier-9x16-frame.png`); } catch (e) { kv = {err: String(e).slice(0, 200)}; }
await p.evaluate(() => vvDirSet(12, 14, 'auto'));
ok('Klavier-Video (Takt 13–14, 9:16) erstellt', kv && kv.dur > 0, kv);
fs.writeFileSync(`${OUT}/vr1-test.json`, JSON.stringify({C, ev, msAudio, perf, ui, vids, errs}, null, 1));
ok('keine Seitenfehler', !errs.length, errs);
console.log(C.filter(c => !c[1]).length ? 'FEHLER: ' + C.filter(c => !c[1]).map(c => c[0]).join(' | ') : 'ALLE OK');
await b.close();
