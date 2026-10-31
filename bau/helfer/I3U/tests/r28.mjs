// Regel 28 / I3-01 (Teil, Platzhalter-Stand): alte Daten bleiben zeichengleich, Worklet-Nachrichten ohne Form 5 unverändert.
// Vergleich gegen die Grundlage bau/snapshots/G-T-merge-fix.html (4.24.0). Node + Chromium.
import {launch, open, sleep, tally} from './h.mjs';
import path from 'path'; import {fileURLToPath} from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.resolve(HERE, '../../../snapshots/G-T-merge-fix.html');
const ok = tally(), br = await launch();
async function grab(app, input) {
  process.env.I3U_APP = app;
  const {ctx, p, errs} = await open(br, {viewport: {width: 428, height: 926}});
  const r = await p.evaluate(async input => {
    const D = SYNQUENZER, out = {};
    if (input) importProject(JSON.parse(input), []);   // the same stored project in both builds (ids and times are random per start)
    out.demo = serializeProject();
    // every factory sound normalized, its hash and the flat worklet patch
    out.fac = D.factory().map(f => { const s = FACTORY_BY_ID.get(f.id); const n = SQStore.normalizeSound(JSON.parse(JSON.stringify(s)));
      return [f.id, JSON.stringify(n), JSON.stringify(wkFlat(n || s))]; });
    // a project round trip (save → load → save)
    importProject(JSON.parse(out.demo), []); out.round = serializeProject();
    // messages to the worklets while the demo plays 2 s: keys per message (times differ between runs)
    const keys = []; const pm = MessagePort.prototype.postMessage;
    MessagePort.prototype.postMessage = function (m, ...a) { try { keys.push(m && typeof m === 'object' ? Object.keys(m).sort().join(',') : typeof m); if (JSON.stringify(m).match(/"l[12]shape":5\b|"lf"/)) keys.push('!!form'); } catch (e) {} return pm.call(this, m, ...a); };
    ensureAudio(); await new Promise(r => setTimeout(r, 300)); D.setBpm(120); D.play(); await new Promise(r => setTimeout(r, 2000)); D.stop();
    MessagePort.prototype.postMessage = pm;
    out.msgKeys = [...new Set(keys)].sort(); out.form = keys.includes('!!form');
    return out;
  }, input || null);
  r.errs = errs; await ctx.close(); return r;
}
const a0 = await grab(BASE), a = await grab(BASE, a0.demo), b = await grab(path.resolve(HERE, '../index.html'), a0.demo);
// creation / change times (ct, mt, saved…) differ between two runs of the same build: masked before the compare
const T = s => s.replace(/"(ct|mt|savedAt|saved|at|ts|created|modified)":\d{10,}/g, '"$1":0').replace(/^\{"format":(\d+),"id":"p-[a-z0-9-]+"/, '{"format":$1,"id":"p"');
const where = (x, y) => { let i = 0; while (i < x.length && x[i] === y[i]) i++; return i >= x.length && x.length === y.length ? '' : ' – ab Zeichen ' + i + ': ' + x.slice(Math.max(0, i - 40), i + 40) + ' ≠ ' + y.slice(Math.max(0, i - 40), i + 40); };
for (const o of [a, b]) { o.demo = T(o.demo); o.round = T(o.round); o.fac = o.fac.map(x => [x[0], T(x[1]), x[2]]); }
ok(a.demo === b.demo, `Demo-Projekt normalisiert zeichengleich (${b.demo.length} Zeichen)` + where(a.demo, b.demo));
ok(a.round === b.round && b.round === b.demo, `Speichern → Laden → Speichern zeichengleich (${b.round.length} Zeichen)` + where(b.demo, b.round));
const diffF = a.fac.filter((x, k) => !b.fac[k] || x[1] !== b.fac[k][1]), diffW = a.fac.filter((x, k) => !b.fac[k] || x[2] !== b.fac[k][2]);
ok(a.fac.length === b.fac.length && !diffF.length, `Werks-Klänge normalisiert gleich: ${a.fac.length - diffF.length}/${a.fac.length}` + (diffF.length ? ' – ' + diffF.slice(0, 3).map(x => x[0]).join(', ') : ''));
ok(!diffW.length, `Worklet-Patch (wkFlat) gleich: ${a.fac.length - diffW.length}/${a.fac.length}`);
ok(JSON.stringify(a.msgKeys) === JSON.stringify(b.msgKeys) && !b.form, `Nachrichten-Arten beim Abspielen gleich (${b.msgKeys.length} Arten), keine Form-Nachricht`);
ok(!b.errs.length, `keine Konsolenfehler (${b.errs.length})` + (b.errs.length ? ' ' + b.errs[0] : ''));
await br.close(); process.exit(ok.done() ? 1 : 0);
