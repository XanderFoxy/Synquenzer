// T4: „Alles sichern“ while a newer project is open (locked)
if (!ONLY || ONLY === 'T4') {
  const srv = server(); const {ctx, page, errs} = await setup(srv); await go(page);
  const snap = await newerSnap(page, pj => { pj.format = 5; pj.id = 'p-zukunft-3'; pj.name = 'Zukunft3'; pj.tracks[0].mkIn = {e1: 'mic'}; pj.mkNeu = {a: 1}; pj.tracks[1].sound = X; });
  await idb(page, 'put', 'project', snap); await page.reload(); await boot(page);
  const lk = await page.evaluate(() => !!SYNQUENZER.nvState().lock);
  const got = await page.evaluate(async () => { const out = []; const d0 = window.deliver; window.deliver = async (b, bytes) => { out.push(new TextDecoder().decode(bytes)); return true; }; await SYNQUENZER.cloudBackup(); window.deliver = d0; return out; });
  const b = got.length ? JSON.parse(got[0]) : null; const p0 = b && b.projects[0];
  console.log('locked=', lk, 'backup projects[0]: format', p0 && p0.format, 'app', p0 && p0.appVersion, 'mkNeu', p0 && JSON.stringify(p0.project.mkNeu), 's1', p0 && p0.project.tracks[1].sound.engine);
  ok('T4 backup of the locked open project keeps the newer copy', p0 && p0.format === 5 && p0.project.mkNeu, p0 ? 'format=' + p0.format + ' app=' + p0.appVersion : 'none');
  // duplicate of the locked open project
  await page.evaluate(() => SYNQUENZER.duplicateProject(S.id)); await page.waitForTimeout(500);
  const ix = await idb(page, 'get', 'projIndex'); const dup = ix && ix.find(e => /Kopie/.test(e.name));
  const dfo = dup ? await idb(page, 'get', 'proj:' + dup.id) : null;
  console.log('duplicate: format', dfo && dfo.format, 'app', dfo && dfo.appVersion, 'mkNeu', dfo && JSON.stringify(dfo.project.mkNeu));
  ok('T4 no console errors', errs.length === 0, errs.join(' | ').slice(0, 300));
  await ctx.close();
}
// T6: drum track with a sound of a newer engine
if (!ONLY || ONLY === 'T6') {
  const srv = server(); const {ctx, page, errs} = await setup(srv); await go(page);
  const XD = Object.assign({}, X, {engine: 'xyzdrum', name: 'Zukunfts-Kit'});
  const fo = JSON.parse(await page.evaluate(() => SYNQUENZER.serialize())); fo.project.tracks[4].sound = XD; fo.project.id = 'p-drum-1';
  await page.evaluate(t => SYNQUENZER.importJSON(t), JSON.stringify(fo)); await page.waitForTimeout(500);
  const r = await page.evaluate(() => { const t = S.tracks[DRUM_T]; return {inner: t.sound.engine, name: t.sound.name, g: SYNQUENZER.getSound(DRUM_T), lock: SYNQUENZER.nvState().lock}; });
  console.log('lock', JSON.stringify(r.lock));
  console.log('drum:', r.inner, r.name, r.g && r.g.engine);
  ok('T6 drum track: original kept, plays INIT kit', r.inner === 'drum' && deq(r.g, XD), JSON.stringify({i: r.inner, n: r.name}));
  await page.evaluate(() => SYNQUENZER.save()); await page.reload(); await boot(page);
  const g2 = await page.evaluate(() => SYNQUENZER.getSound(DRUM_T));
  ok('T6 drum track: reload deep-equal', deq(g2, XD), g2 && g2.engine);
  // play the demo 4 s with the drum track wrapped; measure
  const lv = await page.evaluate(async () => { ensureAudio(); await AU.ctx.resume(); const an = AU.ctx.createAnalyser(); an.fftSize = 2048; AU.masterSum.connect(an); SYNQUENZER.play && SYNQUENZER.play(); let mx = 0; const b = new Float32Array(2048);
    for (let k = 0; k < 80; k++) { await new Promise(r => setTimeout(r, 50)); an.getFloatTimeDomainData(b); for (const x of b) mx = Math.max(mx, Math.abs(x)); } SYNQUENZER.stop && SYNQUENZER.stop(); return mx; });
  console.log('play peak', lv);
  await page.evaluate(() => { R.selT = DRUM_T; openEditor(); }); await page.waitForTimeout(400);
  const ed = await page.evaluate(() => !!document.querySelector('.nvp'));
  ok('T6 drum editor notice page', ed);
  ok('T6 no console errors', errs.length === 0, errs.join(' | ').slice(0, 300));
  await ctx.close();
}
// T7: cloud newer project opened on a fresh device, then just a restart (or [Neu laden] in the banner)
if (!ONLY || ONLY === 'T7') {
  const srv = server();
  const tmp = await setup(server()); await go(tmp.page); const baseTxt = await tmp.page.evaluate(() => SYNQUENZER.serialize()); await tmp.ctx.close();
  const A = newerFile(baseTxt, p => { p.id = 'p-wolke-a'; p.name = 'Wolke A'; p.tracks[1].sound = X; }, '4.9.0', 5);
  srv.projects.set('sid-a', {row: {id: 'sid-a', owner_id: UID, local_id: 'p-wolke-a', title: 'Wolke A', version: 3, updated_at: new Date().toISOString(), updated_by: UID, deleted_at: null, space_id: null}, body: A});
  const {ctx, page, errs} = await setup(srv, {session: true}); await go(page);
  await page.waitForFunction(() => SYNQUENZER.cloud().state === 'online' && S.id === 'p-wolke-a', null, {timeout: 15000}).catch(() => {});
  await page.waitForTimeout(800);
  const ban = await page.evaluate(() => !!document.getElementById('nvBan'));
  await page.evaluate(() => document.querySelector('#nvBan .go').click()).catch(() => {});
  await page.waitForTimeout(500);
  await boot(page);
  await page.waitForFunction(() => SYNQUENZER.cloud().state === 'online', null, {timeout: 15000}).catch(() => {});
  await page.waitForTimeout(2500);
  const l2 = await page.evaluate(async () => ({url: location.search, open: S.id, list: (await SYNQUENZER.projects()).map(e => e.name)}));
  console.log('banner', ban, 'after [Neu laden]:', JSON.stringify(l2));
  ok('T7 after [Neu laden] the cloud project is still on this device', l2.open === 'p-wolke-a' || l2.list.includes('Wolke A'), JSON.stringify(l2));
  await ctx.close();
}
