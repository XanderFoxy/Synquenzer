// G9U T4: M-PLATZ ohne Tastatur (G9-35) und M-DOCK mit simulierter Tastatur (G9-36) in allen Formaten; Bildschirmfotos
import {launch, open, clickTake, sleep, report, SET} from './h.mjs';
const SP = '/tmp/claude-0/-home-user-Synquenzer/0ccf4ae1-e5bb-5672-9a39-faad0a082d38/scratchpad/shots/';
import fs from 'fs'; fs.mkdirSync(SP, {recursive: true});
const ok = report(); const br = await launch();
const VPS = [[390, 844], [375, 667], [320, 568], [844, 390], [667, 375], [926, 428], [428, 926]];
// Tastatur: sichtbare Höhen (Schätzung §7.10, bis G9-61 misst)
const KB = {'428x926': [440], '390x844': [380], '375x667': [270], '320x568': [220], '926x428': [130], '844x390': [118, 100], '667x375': [100, 88]};
const meas = () => {
  const sh = document.getElementById('wpSheet'), E = WP.ed, G = E && E.g9, out = {small: [], cut: [], sheet: null, wave: 0, bar: 0, field: 0, rows: null, hidden: []};
  const r = sh.getBoundingClientRect(); out.sheet = {x: r.left, y: r.top, w: r.width, h: r.height};
  for (const b of sh.querySelectorAll('button')) {
    if (!b.offsetParent) continue; const q = b.getBoundingClientRect();
    if (q.width < 44 - .5 || q.height < 44 - .5) { if (!(window.innerWidth > window.innerHeight && !sh.classList.contains('g9dock') && b.closest('.qh') && q.height >= 38)) out.small.push((b.getAttribute('aria-label') || b.textContent) + ' ' + q.width.toFixed(0) + '×' + q.height.toFixed(0)); }
    if (b.scrollWidth > b.clientWidth + .5) out.cut.push(b.textContent);
    if (q.right > window.innerWidth + .5 || q.bottom > window.innerHeight + .5 || q.left < -.5 || q.top < -.5) out.hidden.push(b.textContent);
  }
  const tb = sh.querySelector('.qh b'); if (tb && tb.offsetParent && tb.scrollHeight > tb.clientHeight + 1) out.cut.push('Titel');
  if (G) { out.wave = E.cvw.getBoundingClientRect().height; out.bar = G.bar.getBoundingClientRect().height; out.field = G.field.getBoundingClientRect().width;
    out.rows = [G.inr.getBoundingClientRect().top, G.tl.getBoundingClientRect().top]; out.short = G.tl.classList.contains('short');
    const fr = G.field.getBoundingClientRect(); if (fr.bottom > window.innerHeight + .5) out.hidden.push('Feld'); }
  return out;
};
const appRows = () => ['top', 'gridArea', 'kbArea', 'modebar'].map(id => { const e = document.getElementById(id); if (!e) return null; const r = e.getBoundingClientRect(); return [id, Math.round(r.top * 10) / 10, Math.round(r.height * 10) / 10]; });
let all35 = 0, all36 = 0, n36 = 0;
for (const [w, h] of VPS) {
  const {p, errs, ctx} = await open(br, {viewport: {width: w, height: h}, mobile: false});
  await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
  const tk = await clickTake(p, Array.from({length: 16}, (_, k) => 0.3 + k * 0.22), 4);
  await SET(p, tk.id, {op: 'text', text: 'Lie-be ist ein Feu-er\nin mir so hell und heiß', lang: 'de'});
  await p.evaluate(r => SYNQUENZER.wpOpen(r), tk.ref); await sleep(250);
  const m0 = await p.evaluate(meas);
  await p.evaluate(r => SYNQUENZER.g9Text(r, true), tk.ref); await sleep(300); await p.evaluate(() => SYNQUENZER.g9Sel(4)); await sleep(100);
  const m1 = await p.evaluate(meas), tag = w + 'x' + h, P3 = h <= 600 && h > w, land = w > h;
  const minWave = P3 ? 72 : land ? 96 : 120;
  const e35 = [];
  if (m1.small.length) e35.push('klein: ' + m1.small.join(', '));
  if (m1.cut.length) e35.push('abgeschnitten: ' + m1.cut.join(', '));
  if (m1.hidden.length) e35.push('außerhalb: ' + m1.hidden.join(', '));
  if (m1.field < 140) e35.push('Feld ' + m1.field);
  if (Math.abs(m1.bar - 44) > .5) e35.push('Leiste ' + m1.bar);
  if (m1.wave < minWave - .5) e35.push('Wellenform ' + m1.wave.toFixed(1) + ' < ' + minWave);
  if (Math.abs(m1.sheet.h - m0.sheet.h) > .5 || Math.abs(m1.sheet.y - m0.sheet.y) > .5) e35.push('Blatt-Höhe ' + m0.sheet.h + ' → ' + m1.sheet.h);
  if (!(m1.rows[1] > m1.rows[0] + 40)) e35.push('Eingabe/Werkzeuge nicht in zwei Zeilen');
  ok(!e35.length, `G9-35 ${tag}: Tasten ≥ 44, Feld ${m1.field.toFixed(0)} px, Leiste ${m1.bar}, Wellenform ${m1.wave.toFixed(0)} (≥ ${minWave}), ${m1.short ? 'Kurz-Namen' : 'lange Namen'}, Blatt ±0` + (e35.length ? ' – ' + e35.join(' · ') : ''));
  if (!e35.length) all35++;
  await p.screenshot({path: SP + 'g9-' + tag + '.png'});
  // ---------- Dock ----------
  for (const vis of KB[tag]) {
    n36++;
    const rows0 = await p.evaluate(appRows);
    await p.evaluate(() => SYNQUENZER.g9Sel(4));
    await p.evaluate(v => { WP.ed.g9.field.focus({preventScroll: true}); SYNQUENZER.g9KbSim(v); }, vis); await sleep(250);
    const d = await p.evaluate(meas), info = await p.evaluate(() => SYNQUENZER.g9Info()), scr = await p.evaluate(() => [window.scrollY, (document.scrollingElement || document.documentElement).scrollTop]);
    const rows1 = await p.evaluate(appRows);
    const barVis = await p.evaluate(() => { const b = WP.ed.g9.bar.getBoundingClientRect(); return b.height >= 43.5 && b.width > 100; });
    const e36 = [];
    if (!info.ed.dock) e36.push('kein Dock');
    if (d.sheet.y < -.5 || d.sheet.y + d.sheet.h > vis + .5) e36.push('Dock nicht über der Tastatur: ' + d.sheet.y.toFixed(1) + '…' + (d.sheet.y + d.sheet.h).toFixed(1) + ' > ' + vis);
    if (d.small.length) e36.push('klein: ' + d.small.join(', '));
    if (d.cut.length) e36.push('abgeschnitten: ' + d.cut.join(', '));
    if (d.field < 140) e36.push('Feld ' + d.field);
    if (!barVis) e36.push('Leiste fehlt');
    if (scr[0] || scr[1]) e36.push('Scroll ' + scr);
    if (JSON.stringify(rows0) !== JSON.stringify(rows1)) e36.push('App-Raster bewegt: ' + JSON.stringify(rows0) + ' → ' + JSON.stringify(rows1));
    if (!info.ed.focus) e36.push('Fokus weg');
    await p.screenshot({path: SP + 'g9-dock-' + tag + '-' + vis + '.png'});
    // zurück: Tastatur zu → Blatt ohne Sprung
    await p.evaluate(() => SYNQUENZER.g9KbSim(null)); await sleep(200);
    const back = await p.evaluate(meas);
    if (Math.abs(back.sheet.y - m1.sheet.y) > .5 || Math.abs(back.sheet.h - m1.sheet.h) > .5) e36.push('Rückkehr springt: ' + JSON.stringify(back.sheet) + ' statt ' + JSON.stringify(m1.sheet));
    ok(!e36.length, `G9-36 ${tag} Tastatur ${vis} px → Dock ${info.ed.dock && info.ed.dock.H} px (${info.ed.dock && info.ed.dock.cls}), Feld ${d.field.toFixed(0)}, ${info.ed.short ? 'Kurz-Namen' : 'lang'}` + (e36.length ? ' – ' + e36.join(' · ') : ''));
    if (!e36.length) all36++;
    await p.evaluate(() => document.activeElement && document.activeElement.blur()); await sleep(100);
  }
  ok(errs.length === 0, tag + ' keine Konsolen-Fehler ' + errs.join(' | '));
  await ctx.close();
}
console.log('G9-35', all35 + '/' + VPS.length, '· G9-36', all36 + '/' + n36);
process.exitCode = ok.done(); await br.close();
