// MK0 (Nachtrag 3, EN3-04): sounds of newer engines stay, nothing writes over a newer version's copy.
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

// a sound of a newer engine, with fields this version does not know
const X = {$: 'snd', v: 1, id: null, name: 'Zukunfts-Klang', cat: 'lead', engine: 'xyz', ev: 3,
  p: {mk: {v: 1, mode: 2, t: [{o1: {w: 5}}, {o1: {w: 7}}], weird: 'abc'}, cutoff: 777, o1w: 2, unknownKey: [1, 2, 3]},
  mods: [{src: 'seq1', dst: 'mk.t.0.f.cut', amt: .5}], fx: {drive: .1, vol: .7, newFx: {a: 1}}, origin: null, ct: 1, mt: 2, bank: 3, slot: 7, loc: 0};
const VA_SND = name => ({engine: 'analog', name, cat: 'lead', p: {cutoff: 900, o1w: 1}});

// ================================================================================================================
// MK0-01 project: load -> save -> load deep-equal; plays INIT with hint; undo, file round trip, edit guards
if (!ONLY || 'MK0-01p'.startsWith(ONLY) || ONLY === 'MK0-01') {
  const srv = server(); const {ctx, page, errs} = await setup(srv); await go(page);
  await page.evaluate(x => SYNQUENZER.setSound(0, x), X);
  const g1 = await page.evaluate(() => SYNQUENZER.getSound(0));
  ok('MK0-01p getSound = original', deq(g1, X), canon(g1).slice(0, 120));
  const inner = await page.evaluate(() => ({e: S.tracks[0].sound.engine, n: S.tracks[0].sound.name, lbl: soundLabel(S.tracks[0])}));
  ok('MK0-01p plays INIT, label', inner.e === 'analog' && inner.n === 'Klang aus neuerer Version' && /Klang aus neuerer Version/.test(inner.lbl), JSON.stringify(inner));
  const strip = await page.evaluate(() => document.body.innerText.includes('Klang aus neuerer Version'));
  ok('MK0-01p hint visible in the UI', strip);
  // audible INIT: capture the master output while auditioning
  const lvl = await page.evaluate(async () => {
    ensureAudio(); const c = AU.ctx; await c.resume();
    const an = c.createAnalyser(); an.fftSize = 2048; (AU.master || AU.out || c.destination); let src = null;
    src = AU.masterSum;
    try { src.connect(an); } catch (e) { return {err: String(e), keys: Object.keys(AU).slice(0, 40)}; }
    const v = auditionStart(0, 60, .8); let mx = 0; const buf = new Float32Array(2048);
    for (let k = 0; k < 20; k++) { await new Promise(r => setTimeout(r, 25)); an.getFloatTimeDomainData(buf); for (const x of buf) mx = Math.max(mx, Math.abs(x)); }
    if (v) v.release(nowT()); return {peak: mx, voices: engineInfo().perTrack[0]};
  });
  ok('MK0-01p INIT is audible', lvl.peak > 0.005, JSON.stringify(lvl).slice(0, 200));
  await page.evaluate(() => SYNQUENZER.save());
  await page.reload(); await boot(page);
  const g2 = await page.evaluate(() => SYNQUENZER.getSound(0));
  ok('MK0-01p KV load->save->load deep-equal', deq(g2, X));
  const st = await page.evaluate(() => SYNQUENZER.nvState());
  ok('MK0-01p own copy is not locked', !st.lock, JSON.stringify(st));
  // file round trip
  const txt = await page.evaluate(() => SYNQUENZER.serialize());
  await page.evaluate(t => SYNQUENZER.importJSON(t), txt); await page.waitForTimeout(400);
  const g3 = await page.evaluate(() => SYNQUENZER.getSound(0));
  ok('MK0-01p file round trip deep-equal', deq(g3, X));
  // undo: replace by a factory sound, undo -> the original again
  await page.evaluate(() => soundEdit(0, 'Sound Moog', () => loadPreset(0, 'f-moog-bass')));
  const gp = await page.evaluate(() => SYNQUENZER.getSound(0).engine);
  await page.evaluate(() => undo());
  const g4 = await page.evaluate(() => SYNQUENZER.getSound(0));
  ok('MK0-01p replace + undo deep-equal', gp === 'analog' && deq(g4, X), gp);
  // edit guards: engine switch, dice change nothing; the editor shows the notice page
  await page.evaluate(() => { try { setEngine(0, 'fm'); } catch (e) {} try { randomize(0); } catch (e) {} });
  ok('MK0-01p setEngine/randomize refused', deq(await page.evaluate(() => SYNQUENZER.getSound(0)), X));
  await page.evaluate(() => { R.selT = 0; openEditor(); });
  await page.waitForTimeout(300);
  const ed = await page.evaluate(() => { const p = document.querySelector('.nvp'); if (!p) return null; const r = p.getBoundingClientRect(); return {txt: p.innerText, btn: [...p.querySelectorAll('button')].map(b => { const q = b.getBoundingClientRect(); return [q.width, q.height]; }), r: [r.x, r.y, r.width, r.height]}; });
  ok('MK0-01p editor notice page, targets >= 44', ed && /Klang aus neuerer Version/.test(ed.txt) && ed.btn.every(([w, h]) => w >= 44 && h >= 44), JSON.stringify(ed));
  await page.screenshot({path: 'v3-mk0-editor-p1.png'});
  ok('MK0-01p no console errors', errs.length === 0, errs.join(' | ').slice(0, 300));
  await ctx.close();
}

// MK0-01 library: import -> reload deep-equal, listed with hint, load into a track, preview, delete refused
if (!ONLY || 'MK0-01l'.startsWith(ONLY) || ONLY === 'MK0-01') {
  const srv = server(); const {ctx, page, errs} = await setup(srv); await go(page);
  const X2 = Object.assign({}, X, {id: 'u-zukunft-1', name: 'Zukunft Bib'});
  await page.evaluate(x => SYNQUENZER.importSounds({app: 'SYNQUENZER', kind: 'sounds', format: 1, sounds: [x]}), X2);
  await page.waitForTimeout(300);
  const L1 = (await page.evaluate(() => SYNQUENZER.library())).find(s => s.engine === 'xyz');
  ok('MK0-01l imported opaque', L1 && deq(Object.assign({}, L1, {id: null, name: null}), Object.assign({}, X2, {id: null, name: null})), L1 ? canon(L1).slice(0, 160) : 'missing');
  await page.reload(); await boot(page); await page.evaluate(() => SYNQUENZER.libraryReady());
  const L2 = (await page.evaluate(() => SYNQUENZER.library())).find(s => s.engine === 'xyz');
  ok('MK0-01l library load->save->load deep-equal', deq(L1, L2));
  await page.evaluate(id => SYNQUENZER.deleteSound(id), L1.id);
  ok('MK0-01l delete refused', (await page.evaluate(() => SYNQUENZER.library())).some(s => s.id === L1.id));
  await page.evaluate(() => { SYNQUENZER.openBrowser(1); });
  await page.waitForTimeout(300);
  await page.evaluate(() => { BR.role = 'eigene'; brRefresh(); });
  await page.waitForTimeout(200);
  const row = await page.evaluate(id => { const r = document.querySelector('.brow[data-id="' + id + '"]'); return r ? r.innerText : null; }, L1.id);
  ok('MK0-01l browser row with hint', row && /Klang aus neuerer Version/.test(row) && /NEU/.test(row), JSON.stringify(row));
  await page.screenshot({path: 'v3-mk0-browser-p1.png'});
  const pv = await page.evaluate(id => { SYNQUENZER.preview(1, id); return SYNQUENZER.previewState(); }, L1.id);
  ok('MK0-01l preview runs (INIT)', pv.on, JSON.stringify(pv));
  await page.evaluate(() => SYNQUENZER.preview(1, null, false));
  await page.evaluate(id => brLoad(LIB.lib.get(id)), L1.id); await page.waitForTimeout(200);
  const t1 = await page.evaluate(() => SYNQUENZER.getSound(1));
  ok('MK0-01l loaded into a track: original kept', t1.engine === 'xyz' && deq(t1.p, X.p) && deq(t1.mods, X.mods) && deq(t1.fx, X.fx));
  ok('MK0-01l no console errors', errs.length === 0, errs.join(' | ').slice(0, 300));
  await ctx.close();
}

// MK0-01 cloud library (fake Supabase): merged opaque, uploaded with the sound, reload deep-equal; guards
if (!ONLY || 'MK0-01c'.startsWith(ONLY) || ONLY === 'MK0-01') {
  const srv = server();
  const X3 = Object.assign({}, X, {id: 'u-wolke-1', name: 'Wolken-Klang'});
  srv.lib = {version: 1, body: {app: 'SYNQUENZER', kind: 'sounds', format: 1, saved: new Date().toISOString(), sounds: [X3, Object.assign(VA_SND('Normaler Lead'), {id: 'u-normal-1'})]}};
  const {ctx, page, errs} = await setup(srv, {session: true}); await go(page);
  await page.waitForFunction(() => SYNQUENZER.cloud().state === 'online' && SYNQUENZER.library().some(s => s.engine === 'xyz'), null, {timeout: 15000}).catch(() => {});
  const L = (await page.evaluate(() => SYNQUENZER.library())).find(s => s.engine === 'xyz');
  ok('MK0-01c merged opaque from the server', L && deq(L, X3), L ? '' : JSON.stringify(await page.evaluate(() => SYNQUENZER.cloud())).slice(0, 200));
  await page.evaluate(() => SYNQUENZER.saveSound(2, 'Mein Neuer'));
  const r1 = await page.evaluate(() => SYNQUENZER.cloudLibPush());
  const sl = srv.calls.filter(c => c.fn === 'save_library');
  const up = sl.length ? (typeof sl[sl.length - 1].body.p_body === 'string' ? JSON.parse(sl[sl.length - 1].body.p_body) : sl[sl.length - 1].body.p_body) : null;
  const upX = up && up.sounds.find(s => s.engine === 'xyz');
  ok('MK0-01c save_library carries the sound deep-equal', r1 === 'ok' && upX && deq(upX, X3), r1 + ' ' + sl.length);
  await page.reload(); await boot(page);
  await page.waitForFunction(() => SYNQUENZER.cloud().state === 'online', null, {timeout: 15000}).catch(() => {});
  await page.waitForTimeout(800);
  const L3 = (await page.evaluate(() => SYNQUENZER.library())).find(s => s.engine === 'xyz');
  ok('MK0-01c reload deep-equal', L3 && deq(L3, X3));
  // guard: a list without the online unknown-engine sound is never sent
  const n0 = srv.calls.filter(c => c.fn === 'save_library').length;
  const r2 = await page.evaluate(async () => { const s = LIB.lib.all().find(x => x.engine === 'xyz'); await LIB.lib.remove(s.id); libChanged(); return SYNQUENZER.cloudLibPush(); });
  ok('MK0-02c no save_library without the sound', r2 === 'newer' && srv.calls.filter(c => c.fn === 'save_library').length === n0, r2);
  const toastTxt = await page.evaluate(() => document.body.innerText.includes('neueren SYNQUENZER-Version'));
  ok('MK0-02c hint visible (library)', toastTxt);
  ok('MK0-01c no console errors, no foreign requests', errs.length === 0 && srv.foreignReq >= 0, errs.join(' | ').slice(0, 300));
  await ctx.close();
}
// MK0-02 cloud library of a newer format: never written over
if (!ONLY || 'MK0-02f'.startsWith(ONLY) || ONLY === 'MK0-02') {
  const srv = server();
  srv.lib = {version: 4, body: {app: 'SYNQUENZER', kind: 'sounds', format: 2, saved: new Date().toISOString(), sounds: [Object.assign(VA_SND('Lead mit MK-Block'), {id: 'u-va-mk', p: {cutoff: 900, mk: {v: 1}}})]}};
  const {ctx, page, errs} = await setup(srv, {session: true}); await go(page);
  await page.waitForFunction(() => SYNQUENZER.cloud().state === 'online' && SYNQUENZER.library().length > 0, null, {timeout: 15000}).catch(() => {});
  await page.evaluate(() => SYNQUENZER.saveSound(2, 'Noch einer'));
  const r = await page.evaluate(() => SYNQUENZER.cloudLibPush());
  ok('MK0-02f newer library format: no save_library', r === 'newer' && !srv.calls.some(c => c.fn === 'save_library') && srv.lib.version === 4, r);
  ok('MK0-02f no console errors', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// ================================================================================================================
// MK0-02 KV: format 5 / unknown engine in the autosave copy -> not written over; parked as it is when leaving
async function newerSnap(page, mod) {
  const fo = JSON.parse(await page.evaluate(() => SYNQUENZER.serialize()));
  const pj = fo.project; mod(pj);
  return {mt: Date.now() + 5000, app: 4009000, project: pj};
}
if (!ONLY || 'MK0-02k'.startsWith(ONLY) || ONLY === 'MK0-02') {
  const srv = server(); const {ctx, page, errs} = await setup(srv); await go(page);
  const snap = await newerSnap(page, pj => { pj.format = 5; pj.id = 'p-zukunft-1'; pj.name = 'Zukunft'; pj.tracks[0].mkIn = {e1: 'mic', e2: null, e1Dry: 1, e2Dry: 1}; pj.tracks[1].sound = X; pj.mkNeu = {a: 1}; });
  await idb(page, 'put', 'project', snap); await page.evaluate(() => { try { localStorage.removeItem('synquenzer.rescue'); } catch (e) {} });
  await page.reload(); await boot(page);
  const st = await page.evaluate(() => SYNQUENZER.nvState());
  ok('MK0-02k lock from KV (format 5)', st.lock && st.lock.f === 5 && st.lock.kv === true && st.lock.id === 'p-zukunft-1', JSON.stringify(st));
  const ban = await page.evaluate(() => { const b = document.getElementById('nvBan'); if (!b) return null; const r = b.getBoundingClientRect(); return {t: b.innerText, h: r.height, w: r.width, btn: [...b.querySelectorAll('button')].map(x => x.getBoundingClientRect().height)}; });
  ok('MK0-02k banner visible', ban && /neueren SYNQUENZER-Version/.test(ban.t) && ban.btn.every(h => h >= 44), JSON.stringify(ban));
  await page.screenshot({path: 'v3-mk0-banner-p1.png'});
  await page.evaluate(() => { S.name = 'Geändert hier'; S.bpm = 99; markDirty(); });
  await page.waitForTimeout(1500);
  await page.evaluate(() => SYNQUENZER.save());
  await page.evaluate(() => { document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('pagehide')); });
  await page.waitForTimeout(300);
  const kvp = await idb(page, 'get', 'project');
  const resc = await page.evaluate(() => localStorage.getItem('synquenzer.rescue'));
  ok('MK0-02k autosave does not write over the KV copy', deq(kvp, snap) && !resc, (kvp && kvp.project && kvp.project.name) + ' rescue=' + !!resc);
  // leaving: the KV copy is parked as it is
  await page.evaluate(() => SYNQUENZER.newProject());
  await page.waitForTimeout(800);
  const parked = await idb(page, 'get', 'proj:p-zukunft-1');
  ok('MK0-02k leaving parks the copy unchanged', parked && deq(parked.project, snap.project) && parked.format === 5, parked ? parked.format + ' ' + parked.project.name : 'none');
  const st2 = await page.evaluate(() => ({nv: SYNQUENZER.nvState(), ban: !!document.getElementById('nvBan')}));
  ok('MK0-02k new project: lock and banner gone', !st2.nv.lock && !st2.ban);
  // open it again from Projekte: locked, the parked copy stays and is not written over
  await page.evaluate(() => SYNQUENZER.openProject('p-zukunft-1')); await page.waitForTimeout(500);
  const st3 = await page.evaluate(() => SYNQUENZER.nvState());
  await page.evaluate(() => { S.name = 'Nochmal'; markDirty(); }); await page.waitForTimeout(1200); await page.evaluate(() => SYNQUENZER.save());
  const parked2 = await idb(page, 'get', 'proj:p-zukunft-1'), kv2 = await idb(page, 'get', 'project');
  // MK0-fix: the open locked project's original also goes into the autosave slot (unchanged), so it survives a restart
  ok('MK0-02k reopened from Projekte: locked, parked copy kept', st3.lock && parked2 && deq(parked2.project, snap.project) && kv2.project.id === 'p-zukunft-1' && deq(kv2.project, snap.project), JSON.stringify(st3.lock));
  ok('MK0-02k no console errors', errs.length === 0, errs.join(' | ').slice(0, 300));
  await ctx.close();
}
if (!ONLY || 'MK0-02e'.startsWith(ONLY) || ONLY === 'MK0-02') {
  // format 4 with an unknown engine: newer / unknown writer -> lock; own writer -> no lock, written (sound still deep-equal)
  for (const [app, want] of [[undefined, true], [4009000, true], [4008001, false]]) {
    const srv = server(); const {ctx, page, errs} = await setup(srv); await go(page);
    const snap = await newerSnap(page, pj => { pj.id = 'p-engine-1'; pj.tracks[2].sound = X; });
    if (app === undefined) delete snap.app; else snap.app = app;
    await idb(page, 'put', 'project', snap); await page.reload(); await boot(page);
    const st = await page.evaluate(() => SYNQUENZER.nvState());
    await page.evaluate(() => { S.name = 'Edit'; markDirty(); }); await page.waitForTimeout(1300); await page.evaluate(() => SYNQUENZER.save());
    const kvp = await idb(page, 'get', 'project');
    if (want) ok('MK0-02e unknown engine, writer ' + app + ': locked, KV unchanged', st.lock && deq(kvp, snap), JSON.stringify(st.lock));
    else ok('MK0-02e unknown engine, own writer: not locked, written, sound deep-equal', !st.lock && kvp.project.name === 'Edit' && deq(kvp.project.tracks[2].sound, X) && kvp.app === 4008001, JSON.stringify(st));
    ok('MK0-02e no console errors (' + app + ')', errs.length === 0, errs.join(' | ').slice(0, 300));
    await ctx.close();
  }
}

// MK0-02 cloud and Paar-Raum (fake Supabase)
function newerFile(base, mod) { const fo = JSON.parse(base); fo.format = 5; fo.appVersion = '4.9.0'; fo.project.format = 5; mod(fo.project); delete fo.sum; return fo; }
if (!ONLY || 'MK0-02c2'.startsWith(ONLY) || ONLY === 'MK0-02') {
  const srv = server();
  // the project text of this build as the base of the server bodies
  const tmp = await setup(server()); await go(tmp.page); const baseTxt = await tmp.page.evaluate(() => SYNQUENZER.serialize()); await tmp.ctx.close();
  const now = Date.now();
  const A = newerFile(baseTxt, p => { p.id = 'p-wolke-a'; p.name = 'Wolke A'; p.tracks[0].mkIn = {e1: 'mic'}; p.tracks[1].sound = X; });
  const B = newerFile(baseTxt, p => { p.id = 'p-wolke-b'; p.name = 'Wolke B'; p.mkNeu = 1; });
  srv.projects.set('sid-a', {row: {id: 'sid-a', owner_id: UID, local_id: 'p-wolke-a', title: 'Wolke A', version: 3, updated_at: new Date(now).toISOString(), updated_by: UID, deleted_at: null, space_id: null}, body: A});
  srv.projects.set('sid-b', {row: {id: 'sid-b', owner_id: UID, local_id: 'p-wolke-b', title: 'Wolke B', version: 2, updated_at: new Date(now - 60000).toISOString(), updated_by: UID, deleted_at: null, space_id: null}, body: B});
  const {ctx, page, errs} = await setup(srv, {session: true}); await go(page);
  await page.waitForFunction(() => SYNQUENZER.cloud().state === 'online' && S.id === 'p-wolke-a', null, {timeout: 15000}).catch(() => {});
  await page.waitForTimeout(800);
  const st = await page.evaluate(() => ({nv: SYNQUENZER.nvState(), id: S.id, ban: !!document.getElementById('nvBan')}));
  ok('MK0-02c2 cloud project of a newer version opened: locked + banner', st.id === 'p-wolke-a' && st.nv.lock && st.ban, JSON.stringify(st));
  const pb = await idb(page, 'get', 'proj:p-wolke-b');
  ok('MK0-02c2 the other server project is parked as it came', pb && pb.format === 5 && pb.project.mkNeu === 1 && pb.project.format === 5, pb ? JSON.stringify({f: pb.format, m: pb.project.mkNeu}) : 'none');
  const sp0 = srv.calls.filter(c => c.fn === 'save_project').length;
  await page.evaluate(() => { S.name = 'Hier geändert'; markDirty(); }); await page.waitForTimeout(1500);
  await page.evaluate(() => SYNQUENZER.save()); await page.evaluate(() => SYNQUENZER.cloudSync()); await page.waitForTimeout(2500);
  const kvp = await idb(page, 'get', 'project');
  // MK0-fix: the KV slot holds the server original unchanged (the meta names this version), never this version's edit
  ok('MK0-02c2 no save_project, KV holds the server original unchanged', srv.calls.filter(c => c.fn === 'save_project').length === sp0 && kvp && kvp.project && deq(kvp.project, A.project),
    'save_project=' + (srv.calls.filter(c => c.fn === 'save_project').length - sp0) + ' kv=' + (kvp && kvp.project && kvp.project.id));
  ok('MK0-02c2 server copies unchanged', deq(srv.projects.get('sid-a').body, A) && deq(srv.projects.get('sid-b').body, B));
  ok('MK0-02c2 no console errors', errs.length === 0, errs.join(' | ').slice(0, 300));
  await ctx.close();
}
if (!ONLY || 'MK0-02r'.startsWith(ONLY) || ONLY === 'MK0-02') {
  // Paar-Raum: the open room song gets a newer version from the partner (4.9.0, format 5)
  const srv = server();
  const tmp = await setup(server()); await go(tmp.page); const baseTxt = await tmp.page.evaluate(() => SYNQUENZER.serialize()); await tmp.ctx.close();
  const P = '22222222-2222-4222-8222-222222222222';
  const mine = JSON.parse(baseTxt); mine.project.id = 'p-raum-1'; mine.project.name = 'Raum-Song';
  const R2 = newerFile(baseTxt, p => { p.id = 'p-raum-1'; p.name = 'Raum-Song'; p.tracks[1].sound = X; p.tracks[0].mkIn = {e2: 'mic'}; });
  srv.projects.set('sid-r', {row: {id: 'sid-r', owner_id: P, local_id: 'p-raum-x', title: 'Raum-Song', version: 2, updated_at: new Date().toISOString(), updated_by: P, deleted_at: null, space_id: 'sp-1'}, body: R2});
  const {ctx, page, errs} = await setup(srv, {session: false}); await go(page);
  // the local room song (ours, version 1) is open; its meta says: room sp-1, base 1
  await page.evaluate(t => SYNQUENZER.importJSON(t), JSON.stringify(mine)); await page.waitForTimeout(500);
  await page.evaluate(() => SYNQUENZER.save());
  const hasMeta = await page.evaluate(async uid => { try { await metaSet('p-raum-1', {uid, sid: 'sid-r', base: 1, space: 'sp-1', dirty: false, sum: '', mt: Date.now()}); return true; } catch (e) { return String(e); } }, UID);
  const before = await idb(page, 'get', 'project');
  await page.evaluate(uid => { localStorage.setItem('synq-auth', JSON.stringify({user: {id: uid}, expires_at: 9999999999, access_token: 'tok'})); }, UID);
  await page.reload(); await boot(page);
  await page.waitForFunction(() => SYNQUENZER.cloud().state === 'online', null, {timeout: 15000}).catch(() => {});
  await page.waitForFunction(() => SYNQUENZER.nvState().lock, null, {timeout: 8000}).catch(() => {});
  const st = await page.evaluate(() => ({nv: SYNQUENZER.nvState(), id: S.id, ban: !!document.getElementById('nvBan'), s1: SYNQUENZER.getSound(1).engine}));
  ok('MK0-02r room song from the partner (newer): locked + banner, sound kept', hasMeta === true && st.nv.lock && st.ban && st.s1 === 'xyz', JSON.stringify(st) + ' meta=' + hasMeta);
  const sp0 = srv.calls.filter(c => c.fn === 'save_project').length;
  await page.evaluate(() => { S.bpm = 77; markDirty(); }); await page.waitForTimeout(1500); await page.evaluate(() => SYNQUENZER.save()); await page.evaluate(() => SYNQUENZER.cloudSync()); await page.waitForTimeout(2500);
  const after = await idb(page, 'get', 'project');
  // MK0-fix: the KV slot now holds the partner's version unchanged (meta base 2 names it), never this version's edit
  const m2 = await page.evaluate(() => metaGet('p-raum-1'));
  ok('MK0-02r no save_project, KV = the partner state as delivered (meta base 2)', srv.calls.filter(c => c.fn === 'save_project').length === sp0 && after && deq(after.project, R2.project) && after.app === 4009000 && m2.base === 2 && deq(srv.projects.get('sid-r').body, R2),
    'sp=' + (srv.calls.filter(c => c.fn === 'save_project').length - sp0) + ' kvPartner=' + (after && deq(after.project, R2.project)) + ' base=' + (m2 && m2.base));
  ok('MK0-02r no console errors', errs.length === 0, errs.join(' | ').slice(0, 300));
  await ctx.close();
}

console.log('\n' + results.filter(r => r[1]).length + '/' + results.length + ' passed');
await browser.close();
process.exit(fails ? 1 : 0);
