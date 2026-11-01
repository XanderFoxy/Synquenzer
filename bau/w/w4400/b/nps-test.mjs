// NPS: North auf der Perkussionsspur – Seite NORTH (Display + schwarze Pads), Platte mit Datenquelle Perkussionsspur, Undo, Klang, Drum-Platte (Rückschritt-Probe)
// node nps-test.mjs <index.html> <ausgabe-ordner>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2], out = process.argv[3] || '.';
const b = await chromium.launch();
const res = {}, fails = [];
const ok = (k, c, v) => { res[k] = c ? 'ok' : 'FEHLER'; if (!c) fails.push(k + ' ' + JSON.stringify(v)); };
const page = async (w, h) => {
  const p = await b.newPage({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  p.errs = []; p.on('pageerror', e => p.errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') p.errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1500);
  await p.evaluate(async () => { const D = window.SYNQUENZER; D.selectTrack(0); D.setParam(0, 'engine', 'north'); D.openEditor(); await new Promise(r => setTimeout(r, 300)); });
  return p;
};
const box = async (p, sel) => { const e = await p.$(sel); if (!e) throw new Error('fehlt: ' + sel); return e.boundingBox(); };
const tap = async (p, sel, fy) => { const r = await box(p, sel); await p.touchscreen.tap(r.x + r.width / 2, r.y + r.height * (fy == null ? .5 : fy)); await p.waitForTimeout(120); };
const drag = async (p, sel, dy) => { const r = await box(p, sel), x = r.x + r.width / 2, y = r.y + r.height / 2; await p.mouse.move(x, y); await p.mouse.down(); for (let k = 1; k <= 12; k++) { await p.mouse.move(x, y - dy * k / 12); await p.waitForTimeout(16); } await p.mouse.up(); await p.waitForTimeout(150); };
const st = p => p.evaluate(() => { const nk = S.tracks[0].sound.p.nk, P = PERC.st[0]; return {ch0: deep(nk.ch[0]), md: deep(nk.md), sent0: P && P.sent ? P.sent[0] || null : null, pst: P ? P.st : 'off', undo: UNDO.length, src: window.NDP && NDP.src ? NDP.src() : null, open: SYNQUENZER.ndpInfo().open}; });

// ---------- hochkant 428x926 ----------
let p = await page(428, 926);
ok('seite.display', await p.$('.percplate .percseg svg') != null, null);
ok('seite.pads12', (await p.$$('.percplate .percpad')).length === 12, null);
await tap(p, '.percpad[data-c="1"]', .2);                                     // SNARE oben = laut
const s1 = await p.evaluate(() => ({strip: document.querySelector('.percstrip b').textContent, sel: [...document.querySelectorAll('.percpad')].findIndex(e => e.classList.contains('sel')), log: PERC.log.slice(-1)[0] || null}));
ok('seite.pad.waehlt', s1.sel === 1 && /SNARE/.test(s1.strip), s1);
ok('seite.pad.schlag', !!s1.log && s1.log.ch === 1 && s1.log.v > .8, s1.log);
await tap(p, '.percpad[data-c="0"]', .85);                                    // KICK unten = leise
const s2 = await p.evaluate(() => PERC.log.slice(-1)[0] || null);
ok('seite.pad.leise', !!s2 && s2.ch === 0 && s2.v < .6, s2);
const lay = async (p) => p.evaluate(() => { const pg = document.querySelector('.pg.percpg'), r = e => { const q = e.getBoundingClientRect(); return {x: q.left, y: q.top, w: q.width, h: q.height, r: q.right, b: q.bottom}; };
  const small = [...pg.querySelectorAll('.percpad,.percsec,.percprg,.percplt,.perckit,.percfol')].filter(e => { const q = e.getBoundingClientRect(); return q.width && (q.height < 44 || q.width < 44); }).map(e => e.className);
  return {pg: r(pg), scrollW: pg.scrollWidth, clientW: pg.clientWidth, docW: document.scrollingElement.scrollWidth, plate: r(document.querySelector('.percplate')), small}; });
let L = await lay(p);
ok('seite.hochkant.passt', L.scrollW <= L.clientW && L.docW <= 428 && L.plate.r <= 428 && L.small.length === 0, L);
await p.screenshot({path: out + '/nps-seite-hochkant.png'});

// Sektion TONE → Platte für die Perkussionsspur, Kanal KICK
await tap(p, '.percsec[data-s="tone"]'); await p.waitForTimeout(600);
let a = await st(p);
ok('platte.offen.perc', a.open && a.src && a.src.perc === 0 && a.src.c === 0, a.src);
const inf = await p.evaluate(() => SYNQUENZER.ndpInfo());
ok('platte.sektion.tone', inf.sec === 'tone' && inf.md === true && inf.voice === 0, {sec: inf.sec, md: inf.md, voice: inf.voice});
ok('platte.hochkant.passt', inf.scrollW <= inf.clientW && inf.docScrollW <= 428, {sw: inf.scrollW, cw: inf.clientW, d: inf.docScrollW});
await p.waitForTimeout(800);                                                 // Knoten der Spur bereit
a = await st(p);
// DECAY ändern (Regler ziehen) → nk.ch[0].mDec, ein Undo-Schritt, Klang neu gesendet
const dec0 = a.ch0.mDec, u0 = a.undo;
await drag(p, '#ndp .ndpk[data-k="mDec"]', 70);
let c = await st(p);
ok('decay.geaendert', c.ch0.mDec !== dec0, {vor: dec0, nach: c.ch0.mDec});
ok('decay.einUndo', c.undo === u0 + 1, {vor: u0, nach: c.undo});
ok('decay.gesendet', c.pst === 'ready' && (c.sent0 && JSON.parse(c.sent0).mDec === c.ch0.mDec), {pst: c.pst, sent: c.sent0 && JSON.parse(c.sent0).mDec});
const drumKick = await p.evaluate(() => { const s = mdSlot('kick'); return s ? s.mDec : null; });
await p.screenshot({path: out + '/nps-platte-hochkant.png'});
// Undo über ↶ der Platte
await tap(p, '#ndp .ndpu'); await p.waitForTimeout(250);
c = await st(p);
ok('undo.zurueck', c.ch0.mDec === dec0, {soll: dec0, ist: c.ch0.mDec});
ok('undo.gesendet', c.pst === 'ready' && (c.sent0 && JSON.parse(c.sent0).mDec === dec0), {pst: c.pst, sent: c.sent0 && JSON.parse(c.sent0).mDec});
ok('drum.unberuehrt', await p.evaluate(() => { const s = mdSlot('kick'); return s ? s.mDec : null; }) === drumKick, null);
// HALL · ECHO (Kit-Effekte nk.md): COLOR ziehen
await p.evaluate(() => SYNQUENZER.ndpView({sec: 'kit', zoom: false})); await p.waitForTimeout(150);
const rv0 = (await st(p)).md.rvT;
await drag(p, '#ndp .ndpk[data-k="k.rvT"]', 60);
c = await st(p);
ok('kit.hall.geaendert', c.md.rvT !== rv0, {vor: rv0, nach: c.md.rvT});
// Kanal-Taste SNARE (schwarze Schlagfläche) wählt Kanal 2, DECAY dort
await p.evaluate(() => SYNQUENZER.ndpView({sec: 'tone'}));
const chk = await p.evaluate(() => { const k = document.querySelector('#ndp .ndpch .bank .ndpkey'), cs = getComputedStyle(k); return {bg: cs.backgroundImage.slice(0, 40), r: cs.borderTopLeftRadius}; });
ok('kanaltasten.schwarz', /radial-gradient/.test(chk.bg) && parseFloat(chk.r) >= 10, chk);
await tap(p, '#ndp [data-a="ch:1"]', .3); await p.waitForTimeout(150);
a = await st(p);
ok('kanal.snare', a.src.c === 1, a.src);
// SPIEL: Pad tippen = Schlag auf der Spur
await p.evaluate(() => SYNQUENZER.ndpView({view: 'spiel'})); await p.waitForTimeout(150);
const n0 = await p.evaluate(() => PERC.n);
await tap(p, '#ndp [data-a="pad:3"]', .2);
const hit = await p.evaluate(() => PERC.log.slice(-1)[0]);
ok('spiel.schlag', (await p.evaluate(() => PERC.n)) > n0 && hit.ch === 3, hit);
await p.screenshot({path: out + '/nps-platte-spiel-hochkant.png'});
await p.evaluate(() => SYNQUENZER.ndpView({view: 'geraet'}));
// ✕ schließt, zurück auf Seite NORTH mit Kanal CLAP gewählt
await tap(p, '#ndp .ndpx'); await p.waitForTimeout(250);
a = await st(p);
const back = await p.evaluate(() => ({pg: !!document.querySelector('.percplate'), sel: [...document.querySelectorAll('.percpad')].findIndex(e => e.classList.contains('sel')), app: !document.getElementById('app').classList.contains('ndpon')}));
ok('platte.zu', !a.open && a.src === null && back.pg && back.app && back.sel === 3, back);
// Rückschritt-Probe: Drum-Platte
await p.evaluate(() => { SYNQUENZER.ndpChoose(); SYNQUENZER.ndpOpen(); }); await p.waitForTimeout(700);
const di = await p.evaluate(() => ({i: SYNQUENZER.ndpInfo(), src: NDP.src(), kick: mdSlot('kick') ? mdSlot('kick').mDec : null, ed: R.editor}));
ok('drum.platte.offen', di.i.open && di.src === null && di.i.md === true && di.ed === 'drum', {open: di.i.open, src: di.src, ed: di.ed});
const du = await p.evaluate(() => UNDO.length);
await drag(p, '#ndp .ndpk[data-k="mDec"]', 50);
const dk = await p.evaluate(() => ({kick: mdSlot(DRUM_VOICES[ED.dVoice | 0].id).mDec, u: UNDO.length, perc: S.tracks[0].sound.p.nk.ch[0].mDec}));
ok('drum.platte.regler', dk.u === du + 1 && dk.perc === dec0, dk);
await p.screenshot({path: out + '/nps-drum-platte-hochkant.png'});
await tap(p, '#ndp .ndpx'); await p.waitForTimeout(200);
ok('drum.platte.zu', !(await p.evaluate(() => SYNQUENZER.ndpInfo().open)), null);
ok('fehler.hochkant', p.errs.length === 0, p.errs);
await p.close();

// ---------- quer 926x428 ----------
p = await page(926, 428);
L = await lay(p);
ok('seite.quer.passt', L.scrollW <= L.clientW && L.docW <= 926 && L.plate.r <= 926 && L.small.length === 0, L);
await p.screenshot({path: out + '/nps-seite-quer.png'});
await tap(p, '.percpad[data-c="4"]', .3);
await tap(p, '.percplt'); await p.waitForTimeout(700);
const iq = await p.evaluate(() => ({i: SYNQUENZER.ndpInfo(), src: NDP.src()}));
ok('platte.quer', iq.i.open && iq.src && iq.src.c === 4 && iq.i.land && iq.i.scrollW <= iq.i.clientW && iq.i.docScrollW <= 926, {src: iq.src, sw: iq.i.scrollW, cw: iq.i.clientW});
const offs = iq.i.hits.filter(h => h.x < -1 || h.y < -1 || h.x + h.w > 927 || h.y + h.h > 429 || h.h < 44 && /^(ch:|pad:|sec:)/.test(h.a || ''));
ok('platte.quer.tasten', offs.length === 0, offs.slice(0, 4));
await p.screenshot({path: out + '/nps-platte-quer.png'});
await tap(p, '#ndp .ndpx'); await p.waitForTimeout(200);
// Sektion NOISE auf Seite NORTH: Platte in NOISE, Rad/Display auf einem NOISE-Regler
await tap(p, '.percsec[data-s="noise"]'); await p.waitForTimeout(400);
const iz = await p.evaluate(() => { const i = SYNQUENZER.ndpInfo(); return {sec: i.sec, focus: i.focus, enc: i.enc, strip: i.strip}; });
ok('platte.sektion.noise', iz.sec === 'noise' && /^mN/.test(iz.focus) && iz.enc === 'val', iz);
await tap(p, '#ndp .ndpx'); await p.waitForTimeout(200);
ok('fehler.quer', p.errs.length === 0, p.errs);
await p.close();
await b.close();
console.log(JSON.stringify(res, null, 1));
console.log(fails.length ? 'FEHLER:\n' + fails.join('\n') : 'alle ok');
process.exit(fails.length ? 1 : 0);
