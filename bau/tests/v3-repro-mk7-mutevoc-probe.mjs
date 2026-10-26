import { chromium } from 'playwright';
const FILE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK7/index.html';
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const page = await (await br.newContext()).newPage();
await page.goto('file://' + FILE);
await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
console.log(await page.evaluate(() => JSON.stringify(S.tracks.map((t, i) => ({i, kind: t.kind, eng: t.sound && t.sound.engine, clips: t.clips.map(c => c ? {len: c.len, n: c.notes.length, first: c.notes[0]} : null)})))));
await br.close();
