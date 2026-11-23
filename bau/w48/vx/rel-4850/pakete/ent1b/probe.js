// ENT1B Sonde: Bildwechsel-Takt gehoert zum Projekt
const { chromium } = require('playwright');
const URL = process.argv[2] || 'http://127.0.0.1:8741/index.html';
const res = []; let fails = 0;
const ok = (name, cond, info) => { res.push((cond ? 'OK   ' : 'FAIL ') + name + (info !== undefined ? ' :: ' + JSON.stringify(info) : '')); if (!cond) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function ctxFor(browser, w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('response', r => { if (r.status() >= 400 && !/\/medien\//.test(r.url())) errs.push('http ' + r.status() + ' ' + r.url()); });
  page.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push('console.error: ' + m.text()); });
  await page.goto(URL);
  await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.vid6 && typeof SYNQUENZER.vvOpen === 'function', null, { timeout: 60000 });
  await sleep(1500);
  return { ctx, page, errs };
}
async function tapSel(page, sel) {
  const b = await page.$(sel); if (!b) return false;
  await b.scrollIntoViewIfNeeded();
  const r = await b.boundingBox(); if (!r) return false;
  await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await sleep(250); return true;
}
async function openRules(page) {
  await page.evaluate(() => { SYNQUENZER.vvOpen(); });
  await sleep(1200);
  const t = await tapSel(page, '.vr1rb');
  await sleep(300);
  return t && await page.evaluate(() => !!document.querySelector('.vid6n'));
}
const n = page => page.evaluate(() => SYNQUENZER.vid6.info().n);
const projV = page => page.evaluate(() => { const o = JSON.parse(SYNQUENZER.serialize()); return o.project.settings.vid6n; });

(async () => {
  const browser = await chromium.launch();
  // Hochkant
  let { ctx, page, errs } = await ctxFor(browser, 428, 926);
  ok('hochkant: Regeln-Feld mit Takt-Wahl per Touch offen', await openRules(page));
  ok('Start = 2 Takte', (await n(page)) === 2, await n(page));
  ok('Tap „4“', await tapSel(page, '.vid6n .rb[data-n="4"]'));
  ok('Projekt-Wert 4', (await projV(page)) === 4 && (await n(page)) === 4, await projV(page));
  ok('Knopf „4“ markiert', await page.evaluate(() => { const b = document.querySelector('.vid6n .rb[data-n="4"]'); return !!b && b.classList.contains('on'); }));
  // Rueckgaengig
  await tapSel(page, '.vid6n .rb[data-n="8"]');
  ok('Tap „8“ → 8', (await n(page)) === 8);
  await page.evaluate(() => SYNQUENZER.undo());
  await sleep(200);
  ok('↶ → wieder 4', (await n(page)) === 4 && (await projV(page)) === 4, [await n(page), await projV(page)]);
  const idA = await page.evaluate(() => JSON.parse(SYNQUENZER.serialize()).project.id);
  ok('speichern', await page.evaluate(() => SYNQUENZER.save()));
  // Neues Projekt: bekommt Geraet-Vorschlag (4), dort „Musik folgt“ waehlen → Geraet-Wert = m
  await page.evaluate(() => { try { document.querySelector('.pop') && SYNQUENZER.closePop && SYNQUENZER.closePop(); } catch (e) {} });
  await page.evaluate(() => SYNQUENZER.newProject());
  await sleep(1200);
  ok('neues Projekt übernimmt Gerät-Vorschlag 4 (auch nach ↶)', (await projV(page)) === 4, await projV(page));
  ok('neu: Regeln offen', await openRules(page));
  await tapSel(page, '.vid6n .rb[data-n="m"]');
  ok('neu: Musik folgt (0)', (await n(page)) === 0 && (await projV(page)) === 'm');
  const devNow = await page.evaluate(() => { try { return JSON.parse(JSON.stringify(SYNQUENZER.vid6.info())).n; } catch (e) { return null; } });
  await page.evaluate(() => SYNQUENZER.save());
  // Projekt A laden → 4 trotz Geraet = m
  await page.evaluate(id => SYNQUENZER.openProject(id), idA);
  await sleep(1500);
  ok('Projekt A geladen: 4 gilt (Gerät steht auf Musik folgt)', (await n(page)) === 4, [await n(page), devNow]);
  // Altes Projekt ohne Wert → Geraet-Wert (m → 0)
  const old = await page.evaluate(async () => {
    const o = JSON.parse(SYNQUENZER.serialize()); delete o.project.settings.vid6n; o.project.id = 'p-alt-ent1b'; o.project.name = 'Alt';
    const r = await SYNQUENZER.importJSON(JSON.stringify(o)); await new Promise(r => setTimeout(r, 800));
    return { r: !!r, v: JSON.parse(SYNQUENZER.serialize()).project.settings.vid6n, n: SYNQUENZER.vid6.info().n };
  });
  ok('altes Projekt ohne Wert nimmt Gerät-Wert (Musik folgt)', old.v === undefined && old.n === 0, old);
  ok('hochkant: keine Fehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close();

  // Quer + Neu laden (Speicher ueberlebt)
  ({ ctx, page, errs } = await ctxFor(browser, 926, 428));
  ok('quer: Regeln offen', await openRules(page));
  const before = await n(page);
  await tapSel(page, '.vid6n .rb[data-n="1"]');
  ok('quer: Tap „1“ → 1', (await n(page)) === 1 && (await projV(page)) === 1, before);
  ok('quer: Knopf ≥44px', await page.evaluate(() => { const r = document.querySelector('.vid6n .rb[data-n="1"]').getBoundingClientRect(); return r.width >= 44 && r.height >= 44; }));
  ok('quer: keine Fehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close();
  await browser.close();
  console.log(res.join('\n'));
  console.log(`\n${res.length - fails}/${res.length} OK`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log(res.join('\n')); console.error('ABBRUCH', e); process.exit(2); });
