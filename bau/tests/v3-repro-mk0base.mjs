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
    if (u === BASE || u.startsWith(BASE + '?') || u.startsWith(BASE + '#') || u === BASE + 'index.html') return r.fulfill({status: 200, contentType: 'text/html; charset=utf-8', body: srv.html || opts.html || HTML});
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
          if ((p.row.app_code || 0) > (body.p_app || 0) || (+bf.format || 4) > body.p_format) { srv.outdated = (srv.outdated || 0) + 1; return r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({status: 'outdated', version: p.row.version})}); }
          if (body.p_base !== p.row.version) return r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({status: 'conflict', version: p.row.version, updated_by: p.row.updated_by, updated_at: p.row.updated_at})});
        }
        const v = (p ? p.row.version : 0) + 1;
        if (p) { p.row.version = v; p.body = body.p_body; p.row.app_code = Math.max(p.row.app_code || 0, body.p_app || 0); p.row.updated_by = UID; } else srv.projects.set(body.p_id, {row: {id: body.p_id, owner_id: UID, local_id: body.p_local_id, title: body.p_title, version: v, updated_at: new Date().toISOString(), updated_by: UID, deleted_at: null, space_id: null}, body: body.p_body});
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

// ===== independent repro: meta.base advanced by a locked cloudApply =====
const H490 = Buffer.from(HTML.toString().replace("const VERSION = '4.8.1'", "const VERSION = '4.9.0'"));
const P = '22222222-2222-4222-8222-222222222222';
for (const variant of ['A-restart-481', 'B-neuladen-490']) {
  if (ONLY && ONLY !== variant) continue;
  const srv = server(); srv.strict = true;
  const tmp = await setup(server()); await go(tmp.page); const baseTxt = await tmp.page.evaluate(() => SYNQUENZER.serialize()); await tmp.ctx.close();
  const mine = JSON.parse(baseTxt); mine.project.id = 'p-raum-1'; mine.project.name = 'Raum-Song';
  const R2 = newerFile(baseTxt, p => { p.id = 'p-raum-1'; p.name = 'Raum-Song'; p.tracks[1].sound = X; p.bpm = 133; }, '4.9.0', 4);
  const R2txt = JSON.stringify(R2);
  srv.projects.set('sid-r', {row: {id: 'sid-r', owner_id: P, local_id: 'p-raum-x', title: 'Raum-Song', version: 2, app_code: 4009000, updated_at: new Date().toISOString(), updated_by: P, deleted_at: null, space_id: 'sp-1'}, body: R2});
  const {ctx, page, errs} = await setup(srv, {session: false}); await go(page);
  await page.evaluate(t => SYNQUENZER.importJSON(t), JSON.stringify(mine)); await page.waitForTimeout(500);
  await page.evaluate(() => SYNQUENZER.save());
  await page.evaluate(async uid => { await metaSet('p-raum-1', {uid, sid: 'sid-r', base: 1, space: 'sp-1', dirty: false, sum: '', mt: Date.now()}); }, UID);
  await page.evaluate(uid => { localStorage.setItem('synq-auth', JSON.stringify({user: {id: uid}, expires_at: 9999999999, access_token: 'tok'})); }, UID);
  await page.reload(); await boot(page);
  await page.waitForFunction(() => SYNQUENZER.cloud().state === 'online', null, {timeout: 15000}).catch(() => {});
  await page.waitForFunction(() => SYNQUENZER.nvState().lock, null, {timeout: 8000}).catch(() => {});
  await page.waitForTimeout(800);
  const st1 = await page.evaluate(() => ({lock: !!SYNQUENZER.nvState().lock, bpm: S.bpm, s1: SYNQUENZER.getSound(1).engine, ban: !!document.getElementById('nvBan')}));
  const kv1 = await idb(page, 'get', 'project'); const m1 = await metaOf(page, 'p-raum-1');
  console.log(`[${variant}] 1st start after pull: ${JSON.stringify(st1)} | KV project bpm=${kv1.project.bpm} s1=${kv1.project.tracks[1].sound && kv1.project.tracks[1].sound.engine} app=${kv1.app} | meta.base=${m1.base} dirty=${m1.dirty}`);
  if (variant.startsWith('B')) {
    // user taps "Neu laden" in the banner, the new build 4.9.0 arrives
    srv.html = H490;
    await Promise.all([page.waitForNavigation(), page.evaluate(() => document.querySelector('#nvBan .go').click())]);
  } else await page.reload();
  await boot(page);
  await page.waitForFunction(() => SYNQUENZER.cloud().state === 'online', null, {timeout: 15000}).catch(() => {});
  await page.waitForTimeout(3000);
  const st2 = await page.evaluate(() => ({ver: VERSION, lock: !!SYNQUENZER.nvState().lock, bpm: S.bpm, s1: SYNQUENZER.getSound(1).engine, id: S.id, cloud: SYNQUENZER.cloud().state}));
  const m2 = await metaOf(page, 'p-raum-1');
  const pulls0 = srv.calls.length;
  console.log(`[${variant}] 2nd start: ${JSON.stringify(st2)} | meta.base=${m2 && m2.base} | server v=${srv.projects.get('sid-r').row.version}`);
  const sp0 = srv.calls.filter(c => c.fn === 'save_project').length;
  await page.evaluate(() => { S.tracks[0].mute = !S.tracks[0].mute; markDirty(); }); await page.waitForTimeout(1500);
  await page.evaluate(() => SYNQUENZER.save()); await page.evaluate(() => SYNQUENZER.cloudSync()); await page.waitForTimeout(3000);
  const sps = srv.calls.filter(c => c.fn === 'save_project').slice(sp0);
  const row = srv.projects.get('sid-r').row; const body = srv.projects.get('sid-r').body; const bf = typeof body === 'string' ? JSON.parse(body) : body;
  const m3 = await metaOf(page, 'p-raum-1');
  const st3 = await page.evaluate(() => ({bpm: S.bpm, s1: SYNQUENZER.getSound(1).engine, ban: document.body.innerText.match(/neuere SYNQUENZER-Version[^\n]*/) ? document.body.innerText.match(/neuere SYNQUENZER-Version[^\n]*/)[0] : null}));
  console.log(`[${variant}] after edit: save_project=${sps.map(c => 'base=' + c.body.p_base + ' app=' + c.body.p_app + ' fmt=' + c.body.p_format).join(',')} outdated=${srv.outdated || 0} | server v=${row.version} app=${bf.appVersion} bpm=${bf.project.bpm} s1=${bf.project.tracks[1].sound && bf.project.tracks[1].sound.engine} | partner state intact=${deq(bf, R2)} | meta=${JSON.stringify({base: m3.base, outdated: !!m3.outdated, conflict: !!m3.conflict, dirty: m3.dirty})} | device ${JSON.stringify(st3)}`);
  console.log(`[${variant}] errors: ${errs.length ? errs.join(' | ').slice(0, 300) : 'none'}`);
  await ctx.close();
}
await browser.close();
