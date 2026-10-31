// G9U T1: Text-Modus öffnen, Ganzer Text, Tipp → Vorspielen, Schreiben, Bildschirmfotos
import {launch, open, mkTake, sleep, report} from './h.mjs';
const SP = '/tmp/claude-0/-home-user-Synquenzer/0ccf4ae1-e5bb-5672-9a39-faad0a082d38/scratchpad/';
const ok = report(); const br = await launch(); const {p, errs} = await open(br);
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
const T = [0.5, 0.75, 1.0, 1.5, 1.75, 2.25, 2.5, 3.0];
const tk = await mkTake(p, T, 4);
await p.evaluate(r => SYNQUENZER.wpOpen(r), tk.ref); await sleep(200);
const on = await p.evaluate(r => SYNQUENZER.g9Text(r, true), tk.ref); await sleep(200);
ok(on === true, 'Text-Modus an');
let r = await p.evaluate(id => SYNQUENZER.g9Set(id, {op: 'text', text: 'Liebe ist ein Feuer\nin mir'}), tk.id);
console.log(JSON.stringify(r));
console.log(JSON.stringify(await p.evaluate(id => SYNQUENZER.g9View(id), tk.id)));
console.log(JSON.stringify(await p.evaluate(id => SYNQUENZER.g9Ly(id), tk.id)));
await p.evaluate(() => SYNQUENZER.g9Sel(2)); await sleep(100);
console.log(JSON.stringify(await p.evaluate(() => SYNQUENZER.g9Info())));
await p.screenshot({path: SP + 't1-hoch.png'});
ok(errs.length === 0, 'keine Fehler ' + errs.join('|'));
ok.done(); await br.close();
