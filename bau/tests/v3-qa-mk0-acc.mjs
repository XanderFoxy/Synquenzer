// MK0 (Nachtrag 3, EN3-04): sounds of newer engines stay, nothing writes over a newer version's copy.
// The app runs under its Pages address (context.route), Supabase is a fake: the client (supabase-js API subset) talks to a
// Node-side store through exposeFunction, save_project / save_library are real fetches to the routed Supabase address.
// No request leaves the machine (every other request is answered locally or aborted and counted).
// Usage: node v3-mk0-schutz.mjs <index.html> [only-test-prefix]
import { chromium } from 'playwright';
import fs from 'fs';
process.chdir('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/');
const FILE = process.argv[2], ONLY = process.argv[3] || '';
const HTML = fs.readFileSync(FILE);
const BASE = 'https://xanderfoxy.github.io/Synquenzer/', SB = 'https://dbdnsryoivvezspgydpx.supabase.co';
const UID = '11111111-1111-4111-8111-111111111111';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const results = []; let fails = 0;
const ok = (id, cond, info) => { results.push([id, !!cond, info || '']); if (!cond) fails++; console.log((cond ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const canon = o => JSON.stringify(o, (k, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.keys(v).sort().reduce((a, k2) => (a[k2] = v[k2], a), {}) : v));
const deq = (a, b) => canon(a) === canon(b);

// ---- fake server -------------------------------------------------------------------------------------------------
function server() {
  return {projects: new Map(), lib: null, calls: [], foreignReq: 0, libFormat: 1,
    sel(st) {
      const f = (k) => { const x = st.filters.find(q => q[1] === k); return x ? x[2] : undefined; };
      const T = st.table;
      if (T === 'profiles') return st.single ? {id: UID, display_name: 'Xander', friend_code: 'XAND', findable: false, is_admin: true} : [];
      if (T === 'projects') { const rows = [...this.projects.values()].map(p => p.row); return st.single ? rows.find(r => r.id === f('id')) || null : rows; }
      if (T === 'project_data') { const p = this.projects.get(f('project_id')); return p ? {version: p.row.version, body: p.body} : null; }
      if (T === 'user_libraries') return this.lib ? {version: this.lib.version, body: this.lib.body} : null;
      return st.single ? null : [];
    }};
}
async function setup(srv, opts) {
  opts = opts || {};
  const ctx = await browser.newContext({viewport: opts.vp || {width: 390, height: 844}, hasTouch: true});
  const errs = [];
  await ctx.route('**/*', async r => {
    const u = r.request().url();
    if (u === BASE || u.startsWith(BASE + '?') || u.startsWith(BASE + '#') || u === BASE + 'index.html') return r.fulfill({status: 200, contentType: 'text/html; charset=utf-8', body: opts.html || HTML});
    if (u === BASE + 'sw.js') return r.fulfill({status: 200, contentType: 'application/javascript', body: '// test'});
    if (u.startsWith(SB + '/rest/v1/rpc/')) {
      const fn = u.slice((SB + '/rest/v1/rpc/').length).split('?')[0];
      let body = {}; try { body = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
      srv.calls.push({fn, body});
      if (fn === 'save_library') { const v = (srv.lib ? srv.lib.version : 0) + 1; srv.lib = {version: v, body: body.p_body}; return r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({status: 'ok', version: v})}); }
      if (fn === 'save_project') {
        const p = [...srv.projects.values()].find(x => x.row.id === body.p_id);
        if (p && srv.strict) {
          const bf = typeof p.body === 'string' ? JSON.parse(p.body) : p.body;
          if ((+bf.format || 4) > body.p_format) return r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({status: 'outdated', version: p.row.version})});
          if (body.p_base !== p.row.version) return r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({status: 'conflict', version: p.row.version, updated_by: p.row.updated_by, updated_at: p.row.updated_at})});
        }
        const v = (p ? p.row.version : 0) + 1;
        if (p) { p.row.version = v; p.body = body.p_body; } else srv.projects.set(body.p_id, {row: {id: body.p_id, owner_id: UID, local_id: body.p_local_id, title: body.p_title, version: v, updated_at: new Date().toISOString(), updated_by: UID, deleted_at: null, space_id: null}, body: body.p_body});
        return r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({status: p ? 'ok' : 'created', version: v})});
      }
      return r.fulfill({status: 200, contentType: 'application/json', body: 'null'});
    }
    if (u.startsWith(SB)) return r.fulfill({status: 200, contentType: 'application/json', body: '{}'});
    if (u.startsWith('data:') || u.startsWith('blob:')) return r.continue();
    srv.foreignReq++;
    return r.fulfill({status: 404, body: ''});
  });
  await ctx.exposeFunction('__fs', (op, a) => {
    if (op === 'sel') return {data: srv.sel(a), error: null};
    if (op === 'rpc') { srv.calls.push({fn: a.fn, body: a.args, rpc: true}); return {data: a.fn === 'ping' ? 'pong' : null, error: null}; }
    return {data: null, error: null};
  });
  await ctx.addInitScript(({UID, session}) => {
    window.__synqFakeSupa = {createClient: () => {
      const q = table => { const st = {table, filters: [], single: false};
        const b = {select() { return b; }, eq(k, v) { st.filters.push(['eq', k, v]); return b; }, is(k, v) { st.filters.push(['is', k, v]); return b; },
          not(k, o, v) { st.filters.push(['not', k, v]); return b; }, in(k, v) { st.filters.push(['in', k, v]); return b; }, order() { return b; }, limit() { return b; },
          maybeSingle() { st.single = true; return b; }, single() { st.single = true; return b; }, then(res, rej) { return window.__fs('sel', st).then(res, rej); }};
        return b; };
      return {auth: {getSession: async () => ({data: {session: {user: {id: UID}, access_token: 'tok', expires_at: 9999999999}}}), onAuthStateChange() { return {data: {subscription: {unsubscribe() {}}}}; },
        refreshSession: async () => ({data: {}}), signOut: async () => ({}), startAutoRefresh: async () => {}, stopAutoRefresh: async () => {}},
        from: q, rpc: (fn, args) => window.__fs('rpc', {fn, args})};
    }};
    if (session && !sessionStorage.getItem('mk0.nosess')) { try { localStorage.setItem('synq-auth', JSON.stringify({user: {id: UID}, expires_at: 9999999999, access_token: 'tok'})); } catch (e) {} }
  }, {UID, session: !!opts.session});
  const page = await ctx.newPage();
  page.on('pageerror', e => errs.push('pageerror: ' + e));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  return {ctx, page, errs};
}
const boot = async page => { await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000}); await page.waitForTimeout(300); };
const go = async page => { await page.goto(BASE); await boot(page); };
const idb = (page, op, key, val) => page.evaluate(([op, key, val]) => new Promise((res, rej) => {
  const rq = indexedDB.open('synquenzer', 1); rq.onupgradeneeded = () => rq.result.createObjectStore('kv');
  rq.onsuccess = () => { const db = rq.result, t = db.transaction('kv', op === 'get' ? 'readonly' : 'readwrite'), st = t.objectStore('kv');
    const r = op === 'get' ? st.get(key) : op === 'del' ? st.delete(key) : st.put(val, key); t.oncomplete = () => { db.close(); res(op === 'get' ? r.result : true); }; t.onerror = () => rej(t.error); };
  rq.onerror = () => rej(rq.error); }), [op, key, val]);

// a sound of a newer engine, with fields this version does not know
const X = {$: 'snd', v: 1, id: null, name: 'Zukunfts-Klang', cat: 'lead', engine: 'xyz', ev: 3,
  p: {mk: {v: 1, mode: 2, t: [{o1: {w: 5}}, {o1: {w: 7}}], weird: 'abc'}, cutoff: 777, o1w: 2, unknownKey: [1, 2, 3]},
  mods: [{src: 'seq1', dst: 'mk.t.0.f.cut', amt: .5}], fx: {drive: .1, vol: .7, newFx: {a: 1}}, origin: null, ct: 1, mt: 2, bank: 3, slot: 7, loc: 0};
const VA_SND = name => ({engine: 'analog', name, cat: 'lead', p: {cutoff: 900, o1w: 1}});

async function newerSnap(page, mod) {
  const fo = JSON.parse(await page.evaluate(() => SYNQUENZER.serialize()));
  const pj = fo.project; mod(pj);
  return {mt: Date.now() + 5000, app: 4009000, project: pj};
}
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
if (!ONLY || ONLY === 'T8') {
  const srv = server(); const {ctx, page, errs} = await setup(srv); await go(page);
  const meas = async () => page.evaluate(async () => {
    ensureAudio(); const c = AU.ctx; await c.resume(); const an = c.createAnalyser(); an.fftSize = 4096; AU.masterSum.connect(an);
    const v = auditionStart(0, 57, .8); await new Promise(r => setTimeout(r, 250)); const b = new Float32Array(4096), f = new Float32Array(2048); let e = 0, n = 0; const spec = new Float32Array(2048);
    for (let k = 0; k < 10; k++) { await new Promise(r => setTimeout(r, 40)); an.getFloatTimeDomainData(b); for (const x of b) { e += x * x; n++; } an.getFloatFrequencyData(f); for (let i = 0; i < f.length; i++) spec[i] += Math.pow(10, f[i] / 10); }
    if (v) v.release(nowT()); await new Promise(r => setTimeout(r, 600)); try { AU.masterSum.disconnect(an); } catch (e) {}
    let num = 0, den = 0; for (let i = 0; i < spec.length; i++) { num += i * spec[i]; den += spec[i]; }
    return {rmsDb: 10 * Math.log10(e / n), centroidHz: num / den * c.sampleRate / 4096};
  });
  await page.evaluate(x => SYNQUENZER.setSound(0, x), X);
  const a = await meas();
  await page.evaluate(() => loadPreset(0, INIT_IDS.analog)); await page.waitForTimeout(300);
  const b = await meas();
  const ed = await page.evaluate(() => SYNQUENZER.getSound(0).engine);
  console.log('wrapped', JSON.stringify(a), 'INIT VA', JSON.stringify(b), 'now', ed);
  ok('T8 wrapped track sounds like INIT VA (±1.5 dB, centroid ±10%)', Math.abs(a.rmsDb - b.rmsDb) < 1.5 && Math.abs(a.centroidHz / b.centroidHz - 1) < .1, JSON.stringify({a, b}));
  ok('T8 no console errors', errs.length === 0, errs.join(' | ').slice(0, 300));
  await ctx.close();
}
console.log('\n' + results.filter(r => r[1]).length + '/' + results.length + ' passed'); await browser.close();
