// SPK11B – Szenen anlegen: Drum-Kit (Treffer ≥ 95 % je Instrument, Zusatz ≤ 5 %) und Bass-Trennreste (still) per Touch, synthetische Lieder
// mit Wahrheit: dicht (dichter Groove mit Bass), intro (leises echtes Bass-Intro, Outro nur Fläche = Trennrest), pruef (Prüferlied, Intro/Outro
// ohne Bass). Aufruf: node spk11b-test.mjs <abs. index.html>   LIEDER=dicht,intro,pruef  VIEW=428x926
import fs from 'node:fs'; import path from 'node:path';
import { server, browser, page, spkLoad, zerlegen, ebeneAusRest } from '../../spk11-fix-pruef/lib.mjs';
import { SONGS } from './songs.mjs';
const file = path.resolve(process.argv[2]), here = path.dirname(new URL(import.meta.url).pathname), fotos = path.join(here, 'fotos'); fs.mkdirSync(fotos, {recursive: true});
const [W, H] = (process.env.VIEW || '428x926').split('x').map(Number), tag = W + 'x' + H, res = {}; let nOk = 0, nF = 0;
const ok = (k, v, c) => { res[k] = {v, ok: !!c}; c ? nOk++ : nF++; console.log((c ? 'OK     ' : 'FEHLER ') + k + ' ' + JSON.stringify(v)); };
const {srv, url} = await server(file), b = await browser();
for (const name of (process.env.LIEDER || 'dicht,intro,pruef').split(',')) {
  const L = SONGS[name](), Pg = await page(b, url, W, H), {p, tap, sel, idle} = Pg;
  await p.evaluate(() => SYNQUENZER.newProject()); await p.waitForTimeout(300);
  await spkLoad(Pg, L.wav, name + '.wav'); let ly = await zerlegen(Pg);
  if (!ly.some(l => l.art === 'pads')) await ebeneAusRest(Pg, 110, 470, '+ Pads');
  await tap(await sel('#spk1Sheet [data-a="view"]')); await p.waitForTimeout(250);
  await tap(await sel('#spk1Sheet .spk1-dd [data-s11="open"]'));
  await p.waitForFunction(() => { const P = __spk11.plan(); return P && !__spk.page.info().busy; }, null, {timeout: 300000}); await p.waitForTimeout(300);
  const t0 = Date.now(); await tap(await sel('#spk1Sheet .spk1-dd [data-s11="go"]'));
  await p.waitForFunction(() => __spk11.last() && !__spk.page.info().busy, null, {timeout: 600000}); await p.waitForTimeout(400);
  const ms = Date.now() - t0; await p.screenshot({path: path.join(fotos, name + '-angelegt-' + tag + '.png')});
  const R = await p.evaluate(() => { const r = __spk11.last(), g = spk1Grid0(__spk.page.ui()), kit = {[DRUM_BY_ID.kick.gm]: 'k', [DRUM_BY_ID.snare.gm]: 's', [DRUM_BY_ID.hatC.gm]: 'h'}, o = {};
    for (const x of r.rows) if (x.m != null) o[x.name] = r.scenes.map((s, j) => { const c = S.tracks[x.m].clips[s], ta = g.off + r.parts[j].A * g.bar; return c ? c.notes.map(n => [+(ta + n.t * 60 / S.bpm).toFixed(3), n.n, kit[n.n] || null]) : []; });
    return {MS: o, parts: r.parts, g: {off: g.off, bar: g.bar}, rows: r.rows.map(x => ({name: x.name, cA: x.clipsA, cM: x.clipsM, n: x.notes, dB: x.dB})), b11: __spk11b.last()}; });
  const partT = R.parts.map(pp => [R.g.off + pp.A * R.g.bar, R.g.off + pp.B * R.g.bar]), inAny = t => partT.some(([a, b2]) => t >= a - 0.03 && t < b2 - 0.03);
  const drName = (R.rows.find(x => /drum/i.test(x.name)) || {}).name, D = ((R.MS[drName]) || []).flat();
  const sc = (w, tru) => { const pr = D.filter(x => x[2] === w); let hit = 0; const used = new Set(); for (const t of tru) { const i = pr.findIndex((x, k) => !used.has(k) && Math.abs(x[0] - t) <= 0.05); if (i >= 0) { used.add(i); hit++; } } return {wahr: tru.length, treffer: hit, zuviel: pr.length - hit, q: +(hit / Math.max(1, tru.length)).toFixed(3), x: +((pr.length - hit) / Math.max(1, tru.length)).toFixed(3)}; };
  const kit = {kick: sc('k', L.truth.kick.filter(inAny)), snare: sc('s', L.truth.snare.filter(inAny)), hihat: sc('h', L.truth.hat.filter(inAny))};
  ok(name + ' drums-kit', Object.assign({ms}, kit, {info: R.b11 && R.b11.hits}), Object.values(kit).every(z => z.q >= 0.95 && z.x <= 0.05));
  // Bass: Noten je Teil gegen die Wahrheit (Teil mit Bass in der Wahrheit → Noten da; ohne Bass → keine Noten, kein Audio-Clip)
  const bName = (R.rows.find(x => /bass/i.test(x.name)) || {}).name, BM = R.MS[bName] || [], bRow = R.rows.find(x => x.name === bName);
  const je = R.parts.map((pp, j) => { const tr = L.truth.bass.filter(q => q.t >= partT[j][0] - 0.03 && q.t < partT[j][1] - 0.03).length; return {teil: pp.name, wahr: tr, noten: (BM[j] || []).length}; });
  const okB = je.every(z => z.wahr ? z.noten >= 0.5 * z.wahr : z.noten === 0);
  ok(name + ' bass-je-teil', {je: je.map(z => z.teil + ' ' + z.noten + '/' + z.wahr).join(' | '), diag: R.b11 && R.b11.diag && R.b11.diag[bName], dB: bRow && bRow.dB}, okB);
  ok(name + ' konsole', Pg.errs, !Pg.errs.length);
  await Pg.ctx.close();
}
fs.writeFileSync(path.join(here, 'spk11b-test.json'), JSON.stringify(res, null, 1));
console.log('ERGEBNIS ' + nOk + ' OK / ' + nF + ' FEHLER'); await b.close(); srv.close();
