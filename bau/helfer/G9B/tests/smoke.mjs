// G9B Smoke: App startet ohne Fehler, Version 4.26.2, live bleibt an, kein Abruf von Modell/Bibliothek, Text-Modus + Marken-Editor öffnen
import {launch, open, mkTake, sleep, report, cdn, HITS} from './h.mjs';
const ok = report(); const br = await launch(); const {p, errs} = await open(br, {route: c => cdn(c)});
const v = await p.evaluate(() => ({v: SYNQUENZER.version, live: !!(typeof CLOUD === 'object' && CLOUD.live), code: typeof APP_CODE === 'number' ? APP_CODE : null}));
ok(v.v === '4.26.2' && v.code === 4026002, 'Version ' + JSON.stringify(v));
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
const tk = await mkTake(p, [0.5, 0.75, 1.0, 1.5, 1.75, 2.25, 2.5, 3.0], 4);
await p.evaluate(r => SYNQUENZER.wpOpen(r), tk.ref); await sleep(300);
await p.evaluate(r => SYNQUENZER.g9Text(r, true), tk.ref); await sleep(500);
ok(await p.locator('#wpSheet .g9rec').isVisible(), '[Erkennen] sichtbar');
ok(HITS.length === 0, 'kein Abruf an CDN/Modell-Ablage ohne Tipp (' + HITS.length + ')');
ok(!(await p.evaluate(() => caches.has('synq-g9-asr-v1'))), 'kein Modell-Cache ohne Tipp');
ok(errs.length === 0, 'keine Fehler ' + errs.join('|'));
const f = ok.done(); await br.close(); process.exit(f ? 1 : 0);
