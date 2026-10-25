import { chromium } from 'playwright'; import fs from 'fs';
const FILE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'});
const page = await browser.newPage(); await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const flats = await page.evaluate(() => FACTORY.filter(s => s.engine === 'analog' || s.engine === 'wt').map(s => { const snd = factorySound(s.id); let mods = []; try { mods = typeof wkMods === 'function' ? wkMods(snd) : (snd.mods || []); } catch (e) {} return {id: s.id, eng: s.engine, flat: wkFlat(snd), mods}; }));
fs.writeFileSync('v3-sp-mk1-flats.json', JSON.stringify(flats)); console.log(flats.length, flats.slice(0, 3).map(f => f.id + ':' + f.eng + ':' + f.flat.eng));
await browser.close();
