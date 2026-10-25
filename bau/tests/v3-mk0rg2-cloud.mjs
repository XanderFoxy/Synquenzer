// QA regression MK0 (copy of the v3-mk0-schutz.mjs fake-Supabase harness): positive controls for normal projects/libraries
// The app runs under its Pages address (context.route), Supabase is a fake: the client (supabase-js API subset) talks to a
// Node-side store through exposeFunction, save_project / save_library are real fetches to the routed Supabase address.
// No request leaves the machine (every other request is answered locally or aborted and counted).
// Usage: node v3-mk0-schutz.mjs <index.html> [only-test-prefix]
import { chromium } from 'playwright';
import fs from 'fs';
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
    if (u === BASE || u.startsWith(BASE + '?') || u.startsWith(BASE + '#') || u === BASE + 'index.html') return r.fulfill({status: 200, contentType: 'text/html; charset=utf-8', body: HTML});
    if (u === BASE + 'sw.js') return r.fulfill({status: 200, contentType: 'application/javascript', body: '// test'});
    if (u.startsWith(SB + '/rest/v1/rpc/')) {
      const fn = u.slice((SB + '/rest/v1/rpc/').length).split('?')[0];
      let body = {}; try { body = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
      srv.calls.push({fn, body});
      if (fn === 'save_library') { const v = (srv.lib ? srv.lib.version : 0) + 1; srv.lib = {version: v, body: body.p_body}; return r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({status: 'ok', version: v})}); }
      if (fn === 'save_project') {
        const p = [...srv.projects.values()].find(x => x.row.id === body.p_id);
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
const out = {};
const VA_SND = name => ({engine: 'analog', name, cat: 'lead', p: {cutoff: 900, o1w: 1}});
// C1: two normal server projects (written by 4.7.0); pristine start opens the newest, the other is parked; an edit uploads
{
  const srv = server();
  const tmp = await setup(server()); await go(tmp.page); const baseTxt = await tmp.page.evaluate(() => SYNQUENZER.serialize()); await tmp.ctx.close();
  const mk = (id, name, bpm) => { const fo = JSON.parse(baseTxt); fo.appVersion = '4.7.0'; fo.project.id = id; fo.project.name = name; fo.project.bpm = bpm; delete fo.sum; return fo; };
  const A = mk('p-norm-a', 'Norm A', 111), B = mk('p-norm-b', 'Norm B', 99); const now = Date.now();
  srv.projects.set('sid-a', {row: {id: 'sid-a', owner_id: UID, local_id: 'p-norm-a', title: 'Norm A', version: 3, updated_at: new Date(now).toISOString(), updated_by: UID, deleted_at: null, space_id: null}, body: A});
  srv.projects.set('sid-b', {row: {id: 'sid-b', owner_id: UID, local_id: 'p-norm-b', title: 'Norm B', version: 2, updated_at: new Date(now - 60000).toISOString(), updated_by: UID, deleted_at: null, space_id: null}, body: B});
  srv.lib = {version: 1, body: {app: 'SYNQUENZER', kind: 'sounds', format: 1, saved: new Date().toISOString(), sounds: [Object.assign(VA_SND('Normaler Lead'), {id: 'u-normal-1'})]}};
  const {ctx, page, errs} = await setup(srv, {session: true}); await go(page);
  await page.waitForFunction(() => SYNQUENZER.cloud().state === 'online' && S.id === 'p-norm-a', null, {timeout: 15000}).catch(() => {});
  await page.waitForTimeout(800);
  out.opened = await page.evaluate(() => ({id: S.id, bpm: S.bpm, ban: !!document.getElementById('nvBan'), nv: SYNQUENZER.nvState ? JSON.stringify(SYNQUENZER.nvState()) : 'n/a', st: SYNQUENZER.cloud().state}));
  const pb = await idb(page, 'get', 'proj:p-norm-b');
  out.parkedB = pb ? {format: pb.format, app: pb.appVersion, id: pb.project.id, bpm: pb.project.bpm, name: pb.project.name} : null;
  out.libMerged = (await page.evaluate(() => SYNQUENZER.library())).map(s => s.name);
  const sp0 = srv.calls.filter(c => c.fn === 'save_project').length;
  await page.evaluate(() => { SYNQUENZER.setBpm(123); SYNQUENZER.setClip(3, 3, {len: 1, notes: [{t: 0, d: 1, n: 60, v: .8}]}); }); await page.waitForTimeout(1500);
  await page.evaluate(() => SYNQUENZER.save()); const cs = await page.evaluate(() => SYNQUENZER.cloudSync()); await page.waitForTimeout(2500);
  const calls = srv.calls.filter(c => c.fn === 'save_project').slice(sp0);
  out.saveProject = calls.length; const last = calls[calls.length - 1];
  if (last) { const b = typeof last.body.p_body === 'string' ? JSON.parse(last.body.p_body) : last.body.p_body; out.uploaded = {app: b.app, ver: b.appVersion, fmt: b.format, id: b.project && b.project.id, bpm: b.project && b.project.bpm, clip: !!(b.project && b.project.tracks[3].clips[3])}; }
  out.serverA = (() => { const b = srv.projects.get('sid-a').body; const o = typeof b === 'string' ? JSON.parse(b) : b; return {ver: o.appVersion, bpm: o.project.bpm, v: srv.projects.get('sid-a').row.version}; })();
  // C2: own sound → save_library
  const sl0 = srv.calls.filter(c => c.fn === 'save_library').length;
  await page.evaluate(() => SYNQUENZER.saveSound(2, 'QA Wolke'));
  out.libPush = await page.evaluate(() => SYNQUENZER.cloudLibPush());
  const sl = srv.calls.filter(c => c.fn === 'save_library').slice(sl0); out.saveLibrary = sl.length;
  if (sl.length) { const b = sl[sl.length - 1].body.p_body; const o = typeof b === 'string' ? JSON.parse(b) : b; out.libUp = o.sounds.map(s => s.name).sort(); }
  // C3: switch to the parked project B (Projekte) and back: no lock, A parked
  await page.evaluate(() => SYNQUENZER.openProject('p-norm-b')); await page.waitForTimeout(1200);
  out.switched = await page.evaluate(() => ({id: S.id, bpm: S.bpm, ban: !!document.getElementById('nvBan')}));
  const pa = await idb(page, 'get', 'proj:p-norm-a'); out.parkedA = pa ? {format: pa.format, id: pa.project.id, bpm: pa.project.bpm} : null;
  out.errs = errs.slice(); out.foreign = srv.foreignReq;
  await ctx.close();
}
console.log(JSON.stringify(out));
await browser.close();
