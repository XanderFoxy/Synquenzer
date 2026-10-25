import { open, NEW, OUT } from './v3-mk0rg2-lib.mjs';
const {p, errs, close} = await open(NEW, 'P1');
await p.tap('#bKlang'); await p.waitForTimeout(600);
console.log(await p.evaluate(() => JSON.stringify(window.SYNQUENZER.runtime().editor)));
console.log(await p.evaluate(() => [...document.querySelectorAll('.pg *')].filter(x => x.offsetParent && (x.dataset.k || x.dataset.p || x.dataset.param || x.tagName === 'BUTTON' || x.className.toString().match(/knob|kn|fader|sl/))).slice(0, 60).map(x => x.tagName + '#' + (x.id || '') + '.' + x.className.toString().slice(0, 30) + ' ' + JSON.stringify(x.dataset).slice(0, 80) + ' ' + x.textContent.trim().slice(0, 16)).join('\n')));
await p.screenshot({path: OUT + 'probe-ed.png'});
console.log(errs);
await close();
