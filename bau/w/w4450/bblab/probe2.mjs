import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2], OUT = process.argv[3] || '/tmp/';
const b = await chromium.launch();
for (const [w, h, tag] of [[428, 926, 'p'], [926, 428, 'l']]) {
  const p = await b.newPage({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER, null, {timeout: 60000});
  await p.waitForTimeout(600);
  await p.evaluate(async () => {
    await SYNQUENZER.newProject();
    const ch = [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]];
    const pad = []; ch.forEach((c, k) => c.forEach(n => pad.push({t: k * 4, d: 4, n: n + 12, v: .7})));
    SYNQUENZER.setClip(2, 0, {len: 4, notes: pad});
    SYNQUENZER.setClip(0, 0, {len: 4, notes: [{t: 0, d: 1, n: 36, v: .8}]});
    openClipSheet(0, 0);
  });
  await p.waitForTimeout(300);
  const cb = await p.evaluate(() => { const b = document.querySelector('#clipSheet .bb1cb'); if (!b) return null; const r = b.getBoundingClientRect(); return {w: r.width, h: r.height, x: r.x, y: r.y, txt: b.textContent}; });
  console.log(tag, 'clip sheet button', JSON.stringify(cb));
  await p.screenshot({path: OUT + 'probe-' + tag + '-clipsheet.png'});
  await p.tap('#clipSheet .bb1cb'); await p.waitForTimeout(300);
  await p.screenshot({path: OUT + 'probe-' + tag + '-sheet.png'});
  const st = await p.evaluate(() => { const P = document.querySelector('.pop.bb1s'); if (!P) return null; const r = P.getBoundingClientRect(); const small = [...P.querySelectorAll('button')].filter(x => { const q = x.getBoundingClientRect(); return q.width > 0 && (q.height < 44 - .5); }).map(x => x.textContent + ':' + Math.round(x.getBoundingClientRect().height)); const X = P.querySelector('.ms-x').getBoundingClientRect(); return {r: [r.x, r.y, r.width, r.height], small, x: [X.x, X.y, X.width, X.height], state: SYNQUENZER.bb1.state()}; });
  console.log(tag, 'sheet', JSON.stringify(st));
  await p.tap('.pop.bb1s button[data-fig="disco-galopp"]'); await p.waitForTimeout(500);
  console.log(tag, 'after fig tap', JSON.stringify(await p.evaluate(() => SYNQUENZER.bb1.state())));
  await p.screenshot({path: OUT + 'probe-' + tag + '-sel.png'});
  await p.tap('.pop.bb1s button[data-bb="ins"]'); await p.waitForTimeout(300);
  console.log(tag, 'after insert', JSON.stringify(await p.evaluate(() => ({s1: S.tracks[0].clips[1] && S.tracks[0].clips[1].notes.length, s0: S.tracks[0].clips[0].notes.length, undo: UNDO[UNDO.length - 1].label, toast: (document.querySelector('.toast') || {}).textContent}))));
  // ROLLE
  await p.evaluate(() => { closeSheets(); openRoll(0, 0); }); await p.waitForTimeout(400);
  const ro = await p.evaluate(() => { const acts = ED.roll && ED.roll.el.acts; if (!acts) return null; const names = [...acts.children].map(x => x.textContent).filter(Boolean); return {names, sw: names.filter(n => n === 'Spielweise').length, hm: names.filter(n => n === 'Harmonie').length, idx: names.indexOf('Werkzeugkasten'), swi: names.indexOf('Spielweise')}; });
  console.log(tag, 'roll', JSON.stringify(ro));
  console.log(tag, 'errs', errs);
  await p.close();
}
await b.close();
