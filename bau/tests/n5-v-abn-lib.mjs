import { chromium } from 'playwright';
import { execSync } from 'child_process';
export const APP = process.env.APP || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/n5-br-V/index.html';
export const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n5-v-abn-out/';
const FD = 'file:///tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/fonts/';
export async function open(o = {}) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required'].concat(o.args || [])});
  const p = await b.newPage({viewport: {width: o.w || 390, height: o.h || 844}, deviceScaleFactor: o.dpr || 1, hasTouch: !!o.touch, isMobile: !!o.touch});
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  if (o.init) await p.addInitScript(o.init);
  await p.goto('file://' + APP); await p.waitForTimeout(1500);
  if (o.fonts !== false) {
    const ff = [['Barlow Semi Condensed', 'barlow-semi-condensed', [500, 600, 700]], ['JetBrains Mono', 'jetbrains-mono', [500, 700]]];
    await p.addStyleTag({content: ff.map(([fam, file, ws]) => ws.map(wt => `@font-face{font-family:"${fam}";font-style:normal;font-weight:${wt};src:url(${FD}${file}-latin-${wt}-normal.woff2) format("woff2")}`).join('')).join('')});
    await p.evaluate(async () => { await Promise.all(['500 12px "Barlow Semi Condensed"', '600 12px "Barlow Semi Condensed"', '700 12px "Barlow Semi Condensed"', '500 12px "JetBrains Mono"', '700 12px "JetBrains Mono"'].map(s => document.fonts.load(s))); await document.fonts.ready; });
  }
  if (o.touch) await p.touchscreen.tap(5, 300); else await p.mouse.click(5, 300);
  await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 15000}).catch(() => {});
  await p.waitForTimeout(300);
  return {b, p, errs};
}
export const SONG8 = {bars: 8, lanes: [[{bar: 0, slot: 0}, {bar: 4, slot: 1}], [{bar: 0, slot: 0}], [{bar: 2, slot: 0}, {bar: 6, slot: -1}], [], [{bar: 0, slot: 0}, {bar: 4, slot: 1}], []],
  carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 4, name: 'Strophe'}, {id: 'm2', a: 4, len: 4, name: 'Refrain'}]};
export const probe = f => JSON.parse(execSync(`ffprobe -v error -show_entries stream=index,codec_type,codec_name,width,height,r_frame_rate,avg_frame_rate,duration,nb_frames,start_time,sample_rate:format=duration,format_name,start_time -of json "${f}"`).toString());
export const saveBlob = async (p, fs, name) => { const bl = await p.evaluate(() => SYNQUENZER.vvBlob()); const f = OUT + name + '.' + bl.ext; fs.writeFileSync(f, Buffer.from(bl.b64, 'base64')); return f; };
