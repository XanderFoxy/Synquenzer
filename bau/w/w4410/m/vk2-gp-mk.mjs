// VK2 Gegenprüfung: nur die MK-Fahrt (SYN 4) im Panel, 16:9 + 9:16
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/', OUT = D + 'w4410/m/';
const FD = 'file://' + D + 'dirigent-test/fonts/';
const { buildSong } = await import(D + 'dirigent-test/n5-v-qm-lib.mjs');
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 926, height: 428}});
const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + OUT + 'index.html'); await p.waitForTimeout(1500);
const ff = [['Barlow Semi Condensed', 'barlow-semi-condensed', [500, 600, 700]], ['JetBrains Mono', 'jetbrains-mono', [500, 700]]];
await p.addStyleTag({content: ff.map(([fam, file, ws]) => ws.map(wt => `@font-face{font-family:"${fam}";font-style:normal;font-weight:${wt};src:url(${FD}${file}-latin-${wt}-normal.woff2) format("woff2")}`).join('')).join('')});
await p.evaluate(async () => { await document.fonts.load('700 12px "Barlow Semi Condensed"'); await document.fonts.load('600 12px "JetBrains Mono"'); });
await p.mouse.click(5, 300);
await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 15000}).catch(() => {});
const res = {song: await buildSong(p)};
res.eng = await p.evaluate(() => { const Q = SYNQUENZER; Q.v6aSetState(3, 0, {p: {'mk.t.0.f.cut': 100, 'mk.t.0.f.res': 20, 'mk.t.0.e2.a': 0, 'mk.t.0.e2.r': 20}}); Q.v6aSetState(3, 1, {p: {'mk.t.0.f.cut': 35, 'mk.t.0.f.res': 118, 'mk.t.0.e2.a': 60, 'mk.t.0.e2.r': 90}, x: 'bar2'}); return S.tracks[3].sound.engine; });
res.r = await p.evaluate(async () => { const r = await SYNQUENZER.vvRender({range: {a: 4, b: 10}}); return {dur: r.dur, lead: VV.last.lead || 0, bpm: VV.last.bpm}; });
const spb = 60 / res.r.bpm, T = x => res.r.lead + x * 4 * spb;
for (const [fmt, f] of [['16:9', 2.5], ['9:16', 3.2]]) {
  res['p' + fmt] = await p.evaluate(([t, fmt]) => { const q = SYNQUENZER.vk2At(t, fmt); return {focus: q.focus, morph: q.morph, ms: q.ms}; }, [T(f), fmt]);
  const png = await p.evaluate(([t, fmt]) => SYNQUENZER.vvShot(t, 'kino', fmt), [T(f), fmt]); fs.writeFileSync(OUT + 'vk2-gp-mk-' + fmt.replace(':', 'x') + '.png', Buffer.from(png, 'base64'));
}
res.errs = errs; console.log(JSON.stringify(res, null, 1)); await b.close();
