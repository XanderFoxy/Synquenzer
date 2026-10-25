// T2: Paar-Raum pull of a newer partner state into the open room song, then a reload (old cache / "Neu laden")
for (const [ver, fmt] of [['4.9.0', 4], ['4.9.0', 5]]) {
  if (ONLY && ONLY !== 'T2') break;
  const srv = server(); srv.strict = true;
  const tmp = await setup(server()); await go(tmp.page); const baseTxt = await tmp.page.evaluate(() => SYNQUENZER.serialize()); await tmp.ctx.close();
  const P = '22222222-2222-4222-8222-222222222222';
  const mine = JSON.parse(baseTxt); mine.project.id = 'p-raum-1'; mine.project.name = 'Raum-Song';
  const R2 = newerFile(baseTxt, p => { p.id = 'p-raum-1'; p.name = 'Raum-Song'; p.tracks[1].sound = X; p.bpm = 133; }, ver, fmt);
  srv.projects.set('sid-r', {row: {id: 'sid-r', owner_id: P, local_id: 'p-raum-x', title: 'Raum-Song', version: 2, updated_at: new Date().toISOString(), updated_by: P, deleted_at: null, space_id: 'sp-1'}, body: R2});
  const {ctx, page, errs} = await setup(srv, {session: false}); await go(page);
  await page.evaluate(t => SYNQUENZER.importJSON(t), JSON.stringify(mine)); await page.waitForTimeout(500);
  await page.evaluate(() => SYNQUENZER.save());
  await page.evaluate(async uid => { await metaSet('p-raum-1', {uid, sid: 'sid-r', base: 1, space: 'sp-1', dirty: false, sum: '', mt: Date.now()}); }, UID);
  await page.evaluate(uid => { localStorage.setItem('synq-auth', JSON.stringify({user: {id: uid}, expires_at: 9999999999, access_token: 'tok'})); }, UID);
  await page.reload(); await boot(page);
  await page.waitForFunction(() => SYNQUENZER.cloud().state === 'online', null, {timeout: 15000}).catch(() => {});
  await page.waitForFunction(() => SYNQUENZER.nvState().lock, null, {timeout: 8000}).catch(() => {});
  const st1 = await page.evaluate(() => ({nv: SYNQUENZER.nvState(), bpm: S.bpm, s1: SYNQUENZER.getSound(1).engine}));
  const m1 = await metaOf(page, 'p-raum-1');
  console.log(`[${ver}/f${fmt}] after pull: lock=${!!st1.nv.lock} bpm=${st1.bpm} s1=${st1.s1} meta.base=${m1 && m1.base}`);
  // the app is started again (old cache again, or the user taps Neu laden and lands on the same build)
  await page.reload(); await boot(page);
  await page.waitForFunction(() => SYNQUENZER.cloud().state === 'online', null, {timeout: 15000}).catch(() => {});
  await page.waitForTimeout(2500);
  const st2 = await page.evaluate(() => ({nv: SYNQUENZER.nvState(), bpm: S.bpm, s1: SYNQUENZER.getSound(1).engine, id: S.id}));
  const m2 = await metaOf(page, 'p-raum-1');
  console.log(`[${ver}/f${fmt}] after 2nd start: id=${st2.id} lock=${!!st2.nv.lock} bpm=${st2.bpm} s1=${st2.s1} meta.base=${m2 && m2.base} server.version=${srv.projects.get('sid-r').row.version}`);
  ok(`T2 [f${fmt}] after a restart the partner's newer state is not silently replaced by the old local copy`, st2.nv.lock || st2.s1 === 'xyz' || (m2 && m2.base < 2), JSON.stringify({lock: !!st2.nv.lock, bpm: st2.bpm, s1: st2.s1, base: m2 && m2.base}));
  const sp0 = srv.calls.filter(c => c.fn === 'save_project').length;
  await page.evaluate(() => { S.name = 'Raum-Song'; S.tracks[0].mute = !S.tracks[0].mute; markDirty(); }); await page.waitForTimeout(1500);
  await page.evaluate(() => SYNQUENZER.save()); await page.evaluate(() => SYNQUENZER.cloudSync()); await page.waitForTimeout(3000);
  const sps = srv.calls.filter(c => c.fn === 'save_project').slice(sp0);
  const body = srv.projects.get('sid-r').body; const bf = typeof body === 'string' ? JSON.parse(body) : body;
  console.log(`[${ver}/f${fmt}] save_project calls=${sps.length} ${sps.map(c => 'base=' + c.body.p_base + ' fmt=' + c.body.p_format).join(',')} server now: v=${srv.projects.get('sid-r').row.version} format=${bf.format} app=${bf.appVersion} bpm=${bf.project.bpm} s1=${bf.project.tracks[1].sound && bf.project.tracks[1].sound.engine}`);
  ok(`T2 [f${fmt}] the partner's newer server state is not overwritten`, deq(bf, R2), `server s1=${bf.project.tracks[1].sound && bf.project.tracks[1].sound.engine} bpm=${bf.project.bpm} app=${bf.appVersion}`);
  ok(`T2 [f${fmt}] no console errors`, errs.length === 0, errs.join(' | ').slice(0, 300));
  await ctx.close();
}
// T3: cloud: a newer server project opened on a fresh device; then the app starts again
if (!ONLY || ONLY === 'T3') {
  for (const F of [FILE, '../mk-base.html']) {
    const H2 = fs.readFileSync(F);
    const srv = server();
    const tmp = await setup(server()); await go(tmp.page); const baseTxt = await tmp.page.evaluate(() => SYNQUENZER.serialize()); await tmp.ctx.close();
    const A = newerFile(baseTxt, p => { p.id = 'p-wolke-a'; p.name = 'Wolke A'; p.tracks[1].sound = X; }, '4.9.0', 5);
    srv.projects.set('sid-a', {row: {id: 'sid-a', owner_id: UID, local_id: 'p-wolke-a', title: 'Wolke A', version: 3, updated_at: new Date().toISOString(), updated_by: UID, deleted_at: null, space_id: null}, body: A});
    const {ctx, page, errs} = await setup(srv, {session: true, html: H2});
    await go(page);
    await page.waitForFunction(() => SYNQUENZER.cloud().state === 'online' && S.id === 'p-wolke-a', null, {timeout: 15000}).catch(() => {});
    await page.waitForTimeout(800);
    const s1 = await page.evaluate(() => ({id: S.id, ver: SYNQUENZER.version || null}));
    await page.evaluate(() => SYNQUENZER.newProject()); await page.waitForTimeout(1000);
    const l1 = await page.evaluate(async () => (await SYNQUENZER.projects()).map(e => e.id));
    await page.reload(); await boot(page);
    await page.waitForFunction(() => SYNQUENZER.cloud().state === 'online', null, {timeout: 15000}).catch(() => {});
    await page.waitForTimeout(2500);
    const l2 = await page.evaluate(async () => ({open: S.id, list: (await SYNQUENZER.projects()).map(e => e.id)}));
    const m = await metaOf(page, 'p-wolke-a');
    console.log(`[${F.includes('base') ? '4.7.0' : '4.8.1'}] opened=${s1.id} list after Neu=${JSON.stringify(l1)} after restart=${JSON.stringify(l2)} meta=${JSON.stringify(m && {sid: m.sid, base: m.base})}`);
    if (F === FILE) ok('T3 cloud project of a newer version stays reachable on this device after leaving it / restart', l1.includes('p-wolke-a') || l2.list.includes('p-wolke-a') || l2.open === 'p-wolke-a', JSON.stringify({l1, l2}));
    await ctx.close();
  }
}
