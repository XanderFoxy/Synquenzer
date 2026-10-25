// MK1-fix: synth head (MK1-21, H-13, M-ANSICHT) with the app's real font, real taps; formats incl. the 47 px safe area
import {chromium} from 'playwright';
const SP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad';
const FILE = process.env.MK_FILE || SP + '/mk-wt/index.html', FONTS = 'file://' + SP + '/dirigent-wt/fonts/';
const SA = '#app{padding-left:47px!important;padding-right:47px!important}';
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const FM = (process.env.FMT || '844x390s,812x375s,926x428s,844x390,667x375,568x320,320x568,375x667,390x844,414x896,428x926,844x1180').split(',');
const ENG = (process.env.ENGS || 'analog,mk,fm6,wt').split(',');
let fails = 0;
const measure = () => { const hd = document.querySelector('#synthSheet .sh-head'); if (!hd || !document.querySelector('#synthSheet.open')) return null; const hr = hd.getBoundingClientRect();
  const R_ = e => { const r = e.getBoundingClientRect(); return [Math.round(r.left * 10) / 10, Math.round(r.width * 10) / 10]; };
  const els = {}; const pick = (k, s) => { const e = hd.querySelector(s); if (e && e.offsetParent) els[k] = R_(e); };
  pick('x', '.sh-x'); pick('pa1', '.preset .pa'); pick('pv', '.preset .pv'); pick('title', '.sh-title'); pick('hear', '.hb.hold');
  [...hd.querySelectorAll('.hb.ur')].forEach((e, k) => { if (e.offsetParent) els['ur' + k] = R_(e); });
  const eng = hd.querySelector('.seg.eng'); [...eng.children].forEach((e, k) => els['e' + k] = R_(e));
  const over = [...hd.querySelectorAll('button')].filter(x => x.offsetParent && x.getBoundingClientRect().right > hr.right + .5).map(x => x.className + ':' + x.textContent.trim().slice(0, 8));
  const x = hd.querySelector('.sh-x'), xr = x.getBoundingClientRect(), hit = document.elementFromPoint(xr.left + xr.width / 2, xr.top + xr.height / 2);
  const lab = [...hd.querySelectorAll('button, .preset')].filter(e => e.offsetParent && e.scrollWidth > e.clientWidth + 1).map(e => e.className);
  const tb = hd.querySelector('.sh-title .stt b') || hd.querySelector('.sh-title b:not(.mtg)'); const sT = hd.querySelector('.sh-title'); return {tcut: !hd.classList.contains('mkts') && ((!!tb && tb.scrollWidth > tb.clientWidth + 1) || sT.scrollWidth > sT.clientWidth + 1), mkem: document.querySelector('#synthSheet').classList.contains('mkem'), mkpa: hd.classList.contains('mkpa'), mkts: hd.classList.contains('mkts'), chip: eng.classList.contains('engchip'), keys: eng.children.length, mk2z: !!hd.querySelector('.mk2z'), mkht: hd.classList.contains('mkht'), sw: hd.scrollWidth - hd.clientWidth, over, hitX: !!(hit && x.contains(hit)), els, lab,
    hitCls: hit ? (hit.className || hit.tagName) + '<' + (hit.closest('.sheet') ? hit.closest('.sheet').id : '-') + ' open:' + [...document.querySelectorAll('.sheet.open')].map(e => e.id).join(',') : '', abVis: !!(ED.hdr && !ED.hdr.ab.hidden), edited: !!hd.querySelector('.chg'), pn: (hd.querySelector('.pv .pn') || {}).textContent};
};
for (const fm of FM) for (const eng of ENG) {
  const sa = fm.endsWith('s'), [w, h] = fm.replace('s', '').split('x').map(Number), land = w > h;
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  const font = await p.evaluate(async F => { const f = [['Barlow Semi Condensed', 'barlow-semi-condensed', [500, 600, 700]], ['JetBrains Mono', 'jetbrains-mono', [500, 700]]];
    const st = document.createElement('style'); st.textContent = f.map(([fam, file, ws]) => ws.map(w => `@font-face{font-family:"${fam}";font-weight:${w};src:url(${F}${file}-latin-${w}-normal.woff2) format("woff2")}`).join('')).join(''); document.head.appendChild(st);
    await Promise.all(['500 10px "Barlow Semi Condensed"', '700 10px "Barlow Semi Condensed"', '600 10px "Barlow Semi Condensed"', '700 10px "JetBrains Mono"'].map(s => document.fonts.load(s))); await document.fonts.ready;
    return [...document.fonts].some(x => x.family.includes('Barlow') && x.status === 'loaded'); }, FONTS);
  if (sa) await p.addStyleTag({content: SA});
  const nm = await p.evaluate(e => { const f = SYNQUENZER.factory().filter(x => x.engine === e || (e === 'fm6' && x.engine === 'fm2') || (e === 'mk' && x.engine === 'mk')); const id = f.length ? f[Math.min(f.length - 1, 2)].id : INIT_IDS[e]; SYNQUENZER.loadPreset(0, id); SYNQUENZER.selectTrack(0); return S.tracks[0].sound.name; }, eng); await p.waitForTimeout(150);
  const tapSel = async sel => { const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const q = e.getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2]; }, sel); if (!r) return false; await p.touchscreen.tap(r[0], r[1]); await p.waitForTimeout(350); return true; };
  const st = {};
  await tapSel('#bKlang'); st.open = await p.evaluate(measure);
  await p.evaluate(() => SYNQUENZER.setParam(0, 'fx.vol', .5)); await p.waitForTimeout(300);
  st.edited = await p.evaluate(measure);
  const tab2 = await p.evaluate(() => { const t = [...document.querySelectorAll('#synthSheet .sh-tabs .stab, #synthSheet .tabs button, #synthSheet [data-tab]')].filter(e => e.offsetParent); return t.length > 1 ? true : false; });
  const tabSel = await p.evaluate(() => { const t = [...document.querySelectorAll('#synthSheet .sh-tabs button, #synthSheet .sh-tabs .stab')].filter(e => e.offsetParent && !e.classList.contains('on')); if (!t.length) return null; t[0].setAttribute('data-qa', 'tab2'); return '[data-qa=tab2]'; });
  if (tabSel) { await tapSel(tabSel); st.tab = await p.evaluate(measure); }
  await tapSel('#synthSheet .sh-x'); const closed = await p.evaluate(() => R.editor);
  const sheets = await p.evaluate(() => [...document.querySelectorAll('.sheet.open')].map(e => e.id).join(','));
  if (sheets) { await p.evaluate(() => closeSheets()); await p.waitForTimeout(200); }
  await tapSel('#bKlang'); if (!(await p.evaluate(() => R.editor === 'synth' && !document.querySelector('#sndSheet.open')))) { await p.evaluate(() => { closeSheets(); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await p.waitForTimeout(350); }
  st.reopen = await p.evaluate(measure);
  // checks
  const bad = [];
  if (!font) bad.push('font not loaded');
  if (closed !== null && closed !== undefined && closed !== '') bad.push('✕ tap left R.editor=' + closed);
  for (const [k, m] of Object.entries(st)) { if (!m) { bad.push(k + ': sheet not open'); continue; }
    if (m.over.length) bad.push(k + ' over ' + m.over.join('|')); if (m.sw > 0) bad.push(k + ' scroll ' + m.sw); if (!m.hitX) bad.push(k + ' ✕ not hit (' + m.hitCls + ')');
    if (land && m.els.pv && m.els.pv[1] < 72) bad.push(k + ' pv ' + m.els.pv[1]); if (m.tcut) bad.push(k + ' title cut'); if (m.els.title && m.els.title[1] < 32) bad.push(k + ' title ' + m.els.title[1]); if (m.lab.length) bad.push(k + ' label over ' + m.lab.join('|')); }
  if (st.edited && !st.edited.edited) bad.push('not edited');
  const ref = st.edited; for (const k of ['open', 'tab', 'reopen']) { const m = st[k]; if (!m || !ref) continue;
    if (m.chip !== ref.chip || m.mk2z !== ref.mk2z || m.mkht !== ref.mkht) bad.push(k + ' layout ' + [m.chip, m.mk2z, m.mkht] + ' vs ' + [ref.chip, ref.mk2z, ref.mkht]);
    if (k === 'open') { if (m.abVis) bad.push('A/B shown before edit'); continue; }   // before the edit A/B is hidden (as in 4.8.1): row 2 is shorter
    for (const e in ref.els) { if (!m.els[e]) { bad.push(k + ' missing ' + e); continue; } const d = Math.max(Math.abs(m.els[e][0] - ref.els[e][0]), Math.abs(m.els[e][1] - ref.els[e][1])); if (d > 2) bad.push(k + ' moved ' + e + ' ' + d.toFixed(1)); } }
  if (errs.length) bad.push('ERR ' + errs.join(' | '));
  if (bad.length) fails++;
  const E = st.edited || {};
  console.log((bad.length ? 'FAIL ' : 'PASS ') + fm + ' ' + eng + ' ' + (E.chip ? 'chip' : E.keys + ' keys') + (E.mk2z ? ' mk2z' : '') + (E.mkht ? ' mkht' : '') + (E.mkts ? ' mkts' : '') + (E.mkpa ? ' mkpa' : '') + (E.mkem ? ' mkem' : '') + ' pa ' + (E.els && E.els.pa1 ? E.els.pa1[1] : '-') + ' [' + nm + '] pv ' + (E.els && E.els.pv ? E.els.pv[1] : '-') + ' title ' + (E.els && E.els.title ? E.els.title[1] : '-') + ' x@' + (E.els && E.els.x ? E.els.x.join('+') : '-') + (bad.length ? ' :: ' + bad.join('; ') : ''));
  if (process.env.SHOT) await p.screenshot({path: `${SP}/dirigent-test/v3-mk1fix-hdr/${fm}-${eng}.png`, clip: {x: 0, y: 0, width: w, height: Math.min(h, 130)}});
  await ctx.close();
}
console.log(fails ? fails + ' FEHLER' : 'alles bestanden');
await b.close(); process.exit(fails ? 1 : 0);
