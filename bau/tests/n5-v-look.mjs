import { chromium } from 'playwright';
const F = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/n5-br-V/index.html';
const b = await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
for (const [w,h,n] of [[390,844,'p'],[844,390,'l']]) {
const p = await b.newPage({viewport:{width:w,height:h}});
await p.goto('file://'+F); await p.waitForTimeout(1200);
await p.evaluate(() => { const A = SYNQUENZER; A.setSong({bars: 8, lanes: [[{bar:0,slot:0},{bar:4,slot:1}], [{bar:0,slot:0}], [{bar:2,slot:0}], [], [{bar:0,slot:0}], []], carrier: [], mel: {}}); A.launchScene(0); });
await p.waitForTimeout(800);
await p.screenshot({path: 'n5-v-look-'+n+'-matrix.png'});
await p.evaluate(() => { SYNQUENZER.songView(true); SYNQUENZER.songPlay && SYNQUENZER.songPlay(); });
await p.waitForTimeout(1500);
await p.screenshot({path: 'n5-v-look-'+n+'-song.png'});
await p.close();
}
await b.close();
