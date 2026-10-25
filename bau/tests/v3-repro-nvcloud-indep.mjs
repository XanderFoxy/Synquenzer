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
      if (T === 'project_data') this.calls.push({fn: 'sel:project_data:' + f('project_id')});
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

const metaOf = (page, lid) => page.evaluate(l => (typeof metaGet === 'function' ? metaGet(l) : null), lid);
const metaAllOf = page => page.evaluate(() => (typeof metaAll === 'function' ? metaAll() : []));
const H490 = Buffer.from(HTML.toString().replace("const VERSION = '4.8.1'", "const VERSION = '4.9.0'"));
const variants = (process.argv[4] || 'T3-neu,T7-neuladen,R-reload').split(',');
for (const variant of variants) {
  // a base file from this build, then made into a 4.9.0 / format 5 file with an unknown engine
  const tmp = await setup(server()); await go(tmp.page); const baseTxt = await tmp.page.evaluate(() => SYNQUENZER.serialize()); await tmp.ctx.close();
  const fo = JSON.parse(baseTxt); fo.format = 5; fo.appVersion = '4.9.0'; fo.project.format = 5; fo.project.id = 'p-wolke-a'; fo.project.name = 'Wolken-Song'; fo.project.bpm = 131;
  fo.project.tracks[1].sound = X; delete fo.sum;
  const srv = server(); srv.strict = true;
  srv.projects.set('sid-a', {row: {id: 'sid-a', owner_id: UID, local_id: 'p-wolke-a', title: 'Wolken-Song', version: 3, app_code: 4009000, updated_at: new Date().toISOString(), updated_by: UID, deleted_at: null, space_id: null}, body: fo});
  const {ctx, page, errs} = await setup(srv, {session: true}); await go(page);
  await page.waitForFunction(() => SYNQUENZER.cloud().state === 'online', null, {timeout: 15000}).catch(() => {});
  await page.waitForFunction(() => S && S.name === 'Wolken-Song', null, {timeout: 8000}).catch(() => {});
  await page.waitForTimeout(1200);
  const st1 = await page.evaluate(() => ({ver: VERSION, name: S.name, id: S.id, bpm: S.bpm, lock: SYNQUENZER.nvState ? SYNQUENZER.nvState().lock : 'n/a', ban: !!document.getElementById('nvBan')}));
  const kv1 = await idb(page, 'get', 'project');
  const pr1 = await page.evaluate(() => SYNQUENZER.projects());
  console.log(`[${variant}] after first start: ${JSON.stringify(st1)} | KV project=${kv1 ? kv1.project.name + '/' + kv1.project.id : 'none'} | projects=${JSON.stringify(pr1.map(p => p.name + ':' + p.id))}`);
  console.log(`[${variant}] metas: ${JSON.stringify(await metaAllOf(page))}`);
  const pd0 = srv.calls.length;
  let fetches0 = 0;
  if (variant.startsWith('T3')) {
    const r = await page.evaluate(() => SYNQUENZER.newProject()); await page.waitForTimeout(1500);
    const pr = await page.evaluate(() => SYNQUENZER.projects());
    console.log(`[${variant}] newProject resolved=${r} | projects now=${JSON.stringify(pr.map(p => p.name + ':' + p.id))}`);
    await page.reload();
  } else if (variant.startsWith('T7')) {
    if (variant.endsWith('490')) srv.html = H490;
    await Promise.all([page.waitForNavigation(), page.evaluate(() => document.querySelector('#nvBan .go').click())]);
  } else if (variant.startsWith('UI')) {
    // [Neu] via UI path: switchProjectUI
    const r = await page.evaluate(() => switchProjectUI(newProject(), {}, 'Neues Projekt')); await page.waitForTimeout(1500);
    const pr = await page.evaluate(() => SYNQUENZER.projects());
    console.log(`[${variant}] switchProjectUI=${r} | projects now=${JSON.stringify(pr.map(p => p.name + ':' + p.id))}`);
    await page.reload();
  } else await page.reload();
  await boot(page);
  await page.waitForFunction(() => SYNQUENZER.cloud().state === 'online', null, {timeout: 15000}).catch(() => {});
  await page.waitForTimeout(3500);
  const st2 = await page.evaluate(() => ({ver: VERSION, name: S.name, id: S.id, lock: SYNQUENZER.nvState ? !!SYNQUENZER.nvState().lock : 'n/a', cloud: SYNQUENZER.cloud().state}));
  const pr2 = await page.evaluate(() => SYNQUENZER.projects());
  const parked = await idb(page, 'get', 'proj:p-wolke-a');
  const kv2 = await idb(page, 'get', 'project');
  console.log(`[${variant}] after restart: ${JSON.stringify(st2)} | projects=${JSON.stringify(pr2.map(p => p.name + ':' + p.id))} | proj:p-wolke-a=${!!parked} | KV project=${kv2 ? kv2.project.name + '/' + kv2.project.id : 'none'}`);
  console.log(`[${variant}] meta p-wolke-a=${JSON.stringify(await metaOf(page, 'p-wolke-a'))}`);
  // a second restart to see whether reconcile ever pulls it again
  await page.reload(); await boot(page);
  await page.waitForFunction(() => SYNQUENZER.cloud().state === 'online', null, {timeout: 15000}).catch(() => {});
  await page.waitForTimeout(3500);
  const pr3 = await page.evaluate(() => SYNQUENZER.projects());
  const bodyFetchesAfter = srv.calls.slice(pd0).length;
  console.log(`[${variant}] after 2nd restart: name=${await page.evaluate(() => S.name)} projects=${JSON.stringify(pr3.map(p => p.name + ':' + p.id))} | server calls since action=${bodyFetchesAfter} ${JSON.stringify(srv.calls.slice(pd0).map(c=>c.fn))}`);
  if (process.env.TRYOPEN) { const ok = await page.evaluate(() => SYNQUENZER.cloudOpen('sid-a')); await page.waitForTimeout(1500);
    console.log(`[${variant}] manual cloudOpen(sid-a)=${ok} -> open=${await page.evaluate(() => S.name + '/' + S.id + ' lock=' + !!SYNQUENZER.nvState().lock)}`); }
  console.log(`[${variant}] errors: ${errs.length ? errs.join(' | ').slice(0, 300) : 'none'}`);
  await ctx.close();
}
await browser.close();
