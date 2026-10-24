// QA group: part tap while ▶ SONG runs (N7S-25b): touch vs API; song from flow2
import {open, OUT, check, done, tapEl, tapText} from './v3-qa-grp-lib.mjs';
import fs from 'fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const how = process.argv[2] || 'touch';
const {br, p, errs, E} = await open({mic: false});
const proj = JSON.parse(fs.readFileSync(OUT + 'flow2-project.json', 'utf8'));
await E(pj => SYNQUENZER.importJSON(JSON.stringify({app: 'SYNQUENZER', kind: 'project', format: 4, project: pj})), proj).catch(e => console.log('import err', String(e)));
await sleep(500);
console.log('marks', JSON.stringify(await E(() => SYNQUENZER.songMarks().map(m => m.name + '@' + m.a))), 'parts', JSON.stringify(await E(() => SYNQUENZER.parts().filter(Boolean).map(p => p.id + ':' + p.name))));
await E(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); SYNQUENZER.songLoop(true); SYNQUENZER.songPlay(0); });
await p.waitForFunction(() => { const b = SYNQUENZER.runtime().song.beat; return b != null && b >= 17 && b < 18; }, null, {timeout: 60000, polling: 10});
const sb0 = await E(() => SYNQUENZER.runtime().song.beat);
if (how === 'touch') console.log('tap', JSON.stringify(await tapText(p, '.pk', /STROPHE/)));
else if (how === 'click') { const b = await E(() => { const e = [...document.querySelectorAll('.pk')].find(e => /STROPHE/.test(e.textContent)); const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; }); await p.mouse.click(b.x, b.y); }
else await E(() => SYNQUENZER.partTap(0));
await sleep(80);
console.log('after tap', JSON.stringify(await E(() => ({sp: R.songPlay && {jump: R.songPlay.jump, off: R.songPlay.off}, part: SYNQUENZER.runtime().part, pend: SYNQUENZER.partInfo().partPend, toast: (document.querySelector('#toast') || {}).textContent}))));
await p.waitForFunction(x => audBeat() >= x, 24.5, {timeout: 20000, polling: 10});
const j = await E(() => SYNQUENZER.runtime().song);
check(`${how}: part tap in the song jumps to the Strophe mark`, (j.beat % 32) < 4, {sb0, beat: j.beat, play: j.play});
console.log('errs', errs);
await br.close(); done();
