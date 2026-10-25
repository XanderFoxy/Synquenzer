// ===== QA acceptance probes =====
const metaOf = (page, lid) => page.evaluate(l => metaGet(l), lid);
function newerFile(base, mod, ver, fmt) { const fo = JSON.parse(base); fo.format = fmt; fo.appVersion = ver; fo.project.format = fmt; mod(fo.project); delete fo.sum; return fo; }

// T1: rename / duplicate / export of a parked newer project
if (!ONLY || ONLY === 'T1') {
  const srv = server(); const {ctx, page, errs} = await setup(srv); await go(page);
  const snap = await newerSnap(page, pj => { pj.format = 5; pj.id = 'p-zukunft-1'; pj.name = 'Zukunft'; pj.tracks[0].mkIn = {e1: 'mic'}; pj.tracks[1].sound = X; pj.mkNeu = {a: 1}; });
  await idb(page, 'put', 'project', snap); await page.evaluate(() => { try { localStorage.removeItem('synquenzer.rescue'); } catch (e) {} });
  await page.reload(); await boot(page);
  await page.evaluate(() => SYNQUENZER.newProject()); await page.waitForTimeout(800);
  const p0 = await idb(page, 'get', 'proj:p-zukunft-1');
  console.log('parked before rename: format', p0 && p0.format, 'mkNeu', p0 && JSON.stringify(p0.project.mkNeu), 'mkIn', p0 && JSON.stringify(p0.project.tracks[0].mkIn));
  await page.evaluate(() => SYNQUENZER.renameProject('p-zukunft-1', 'Zukunft neu')); await page.waitForTimeout(500);
  const p1 = await idb(page, 'get', 'proj:p-zukunft-1');
  console.log('parked after rename: format', p1 && p1.format, 'appVersion', p1 && p1.appVersion, 'proj.format', p1 && p1.project.format, 'mkNeu', p1 && JSON.stringify(p1.project.mkNeu), 'mkIn', p1 && JSON.stringify(p1.project.tracks[0].mkIn), 'snd1', p1 && p1.project.tracks[1].sound.engine);
  ok('T1 rename keeps the parked newer copy (format 5, new fields)', p1 && p1.format === 5 && p1.project.mkNeu && p1.project.tracks[0].mkIn, p1 ? 'format=' + p1.format + ' mkNeu=' + JSON.stringify(p1.project.mkNeu) : 'none');
  // reopen: still locked?
  await page.evaluate(() => SYNQUENZER.openProject('p-zukunft-1')); await page.waitForTimeout(600);
  const st = await page.evaluate(() => SYNQUENZER.nvState());
  ok('T1 renamed project still locked on open', !!st.lock, JSON.stringify(st));
  const kvp = await idb(page, 'get', 'project');
  console.log('KV after reopen: id', kvp.project.id, 'format', kvp.project.format, 'mkNeu', JSON.stringify(kvp.project.mkNeu));
  ok('T1 no console errors', errs.length === 0, errs.join(' | ').slice(0, 300));
  await ctx.close();
}
// T1b: duplicate + export of a parked newer project
if (!ONLY || ONLY === 'T1b') {
  const srv = server(); const {ctx, page, errs} = await setup(srv); await go(page);
  const snap = await newerSnap(page, pj => { pj.format = 5; pj.id = 'p-zukunft-2'; pj.name = 'Zukunft2'; pj.tracks[0].mkIn = {e1: 'mic'}; pj.mkNeu = {a: 1}; });
  await idb(page, 'put', 'project', snap); await page.reload(); await boot(page);
  await page.evaluate(() => SYNQUENZER.newProject()); await page.waitForTimeout(800);
  const got = await page.evaluate(async () => { const out = []; const d0 = window.deliver; window.deliver = async (b, bytes, kind) => { out.push(new TextDecoder().decode(bytes)); return true; };
    await SYNQUENZER.renameProject; await exportProjectById('p-zukunft-2'); window.deliver = d0; return out; });
  const ex = got.length ? JSON.parse(got[0]) : null;
  console.log('export of parked newer project: format', ex && ex.format, 'appVersion', ex && ex.appVersion, 'mkNeu', ex && JSON.stringify(ex.project.mkNeu));
  ok('T1b export of parked newer project keeps it', ex && ex.format === 5 && ex.project.mkNeu, ex ? 'format=' + ex.format + ' app=' + ex.appVersion : 'no export');
  await ctx.close();
}
