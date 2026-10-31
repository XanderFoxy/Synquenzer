process.env.APP = process.env.APP || '/home/user/Synquenzer/bau/helfer/VIDSTAGE/index.html';
const {open, sleep} = await import('./n5-k-qa-lib.mjs');
const PLAY = process.argv[2] === 'play', TR = process.argv[3] || 'Synth 3', TI = {'Synth 1': 0, 'Synth 3': 2}[TR];
const T = await open({vp: [390, 844], file: process.env.F}); const {p, E, errs} = T;
await E(() => { SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); });
const drag = async (x, y, dy, ms) => { const n = Math.round(ms / 16); await T.down(x, y); await sleep(30); for (let i = 1; i <= n; i++) { await T.move(x, y + dy * i / n); await sleep(16); } await sleep(30); await T.up(); };
if (PLAY) { const b = (await T.find('button.scn', /^▶\s*1/))[0]; await T.tap(b.cx, b.cy, 200); await sleep(1500); }
const th = (await T.find('.th', new RegExp(TR)))[0]; await T.tap(th.cx, th.cy, 250); await T.tapSel('button', /^KLANG$/, 900);
const L = await T.find('#synthSheet .knob');
const v = () => E(t => { const s = SYNQUENZER.getSound(t).p; return JSON.stringify([s.o1semi, s.o1lvl, s.o1fine, SYNQUENZER.undoInfo().n]); }, TI);
console.log(TR, PLAY ? 'playing' : 'stopped', 'before', await v());
await drag(L[0].cx, L[0].cy, -70, 1500); await sleep(500); console.log('HT up', await v());
await drag(L[2].cx, L[2].cy, 60, 1500); await sleep(500); console.log('Anteil down', await v());
await T.b.close();
