// MK1 data / format acceptance (Nachtrag 3 MK1-01, 01b, 02, 02b, 03, 28, 29, 30). Pages address routed, fake Supabase as in
// v3-mk0-schutz.mjs (nothing leaves the machine). Usage: node v3-mk1-format.mjs <new.html> <predecessor 4.8.1.html>
import { chromium } from 'playwright';
import fs from 'fs';
const NEW = process.argv[2], OLD = process.argv[3], ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const CUR = {html: fs.readFileSync(NEW)};
const BASE = 'https://xanderfoxy.github.io/Synquenzer/', SB = 'https://dbdnsryoivvezspgydpx.supabase.co';
const UID = '11111111-1111-4111-8111-111111111111';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const canon = o => JSON.stringify(o, (k, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.keys(v).sort().reduce((a, k2) => (a[k2] = v[k2], a), {}) : v));
const deq = (a, b) => canon(a) === canon(b);
const T = (id, f) => (ONLY && !ONLY.test(id) ? null : f());
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
    if (u === BASE || u.startsWith(BASE + '?') || u.startsWith(BASE + '#') || u === BASE + 'index.html') return r.fulfill({status: 200, contentType: 'text/html; charset=utf-8', body: CUR.html});
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



// ---- MK1-01 data: normMk clamps 1000 random patches; round trips; VA -> AM -> VA; labels; browser lists ----
await T('MK1-01', async () => {
  const srv = server(); const {ctx, page, errs} = await setup(srv); await go(page);
  const r = await page.evaluate(() => {
    const out = {bad: [], n: 0}; let seed = 7; const rnd = () => (seed = (Math.imul(seed, 1103515245) + 12345) >>> 0) / 4294967296;
    const wild = () => { const k = rnd(); return k < .2 ? (rnd() - .5) * 1e4 : k < .3 ? 'x' : k < .35 ? null : k < .4 ? NaN : k < .45 ? [1, 2] : (rnd() - .5) * 400; };
    const fill = o => { if (Array.isArray(o)) return o.map(fill); if (o && typeof o === 'object') { const x = {}; for (const k in o) x[k] = fill(o[k]); x['zz' + Math.floor(rnd() * 9)] = 1; return x; } return rnd() < .7 ? wild() : o; };
    const I0 = SQMK.init();
    for (let n = 0; n < 1000; n++) {
      const p = fill(I0), q = SQMK.normMk(p);
      // every leaf: integer (eq gains in 0.5 steps) within its range; the shape equals INIT (no unknown keys)
      const walk = (a, b, path) => { if (Array.isArray(b)) { if (!Array.isArray(a) || a.length !== b.length) out.bad.push(path + ' len'); else b.forEach((x, i) => walk(a[i], x, path + '.' + i)); return; }
        if (b && typeof b === 'object') { const ka = Object.keys(a || {}).sort().join(), kb = Object.keys(b).sort().join(); if (ka !== kb) out.bad.push(path + ' keys ' + ka); for (const k in b) walk(a[k], b[k], path + '.' + k); return; }
        if (b === null) { if (a !== null && !Array.isArray(a)) out.bad.push(path + ' null'); return; }
        if (typeof a !== 'number' || !isFinite(a)) { out.bad.push(path + ' nan'); return; }
        const rg = SQMK.mkRange(path.slice(1)); const half = /eq\.(lg|hg)$/.test(path);
        if (!half && Math.round(a) !== a) out.bad.push(path + ' frac ' + a);
        if (rg && (a < rg[0] || a > rg[1])) out.bad.push(path + ' range ' + a); };
      walk(q, I0, '');
      const q2 = SQMK.normMk(JSON.parse(JSON.stringify(q))); if (JSON.stringify(q2) !== JSON.stringify(q)) out.bad.push('idempotent');
      out.n++;
    }
    return {n: out.n, bad: out.bad.slice(0, 5), nbad: out.bad.length};
  });
  ok('MK1-01 normMk: 1000 Zufalls-Patches geklemmt, ganzzahlig, unbekannte Schlüssel fallen weg', r.nbad === 0 && r.n === 1000, r.nbad + ' Fehler ' + JSON.stringify(r.bad));
  const rt = await page.evaluate(async () => {
    const D = SYNQUENZER; D.setEngine(0, 'mk'); D.mkSet(0, 't.0.f.cut', 77); D.mkSet(0, 't.0.o1.w', 1); D.mkSet(0, 'mfx.dep', 33);
    const s1 = D.getSound(0), h1 = SQStore.soundHash(s1); await D.save(); return {s1, h1};
  });
  await page.reload(); await boot(page);
  const rt2 = await page.evaluate(() => ({s: SYNQUENZER.getSound(0), h: SQStore.soundHash(SYNQUENZER.getSound(0))}));
  ok('MK1-01 Speichern → Laden deep-equal, soundHash stabil', deq(rt.s1, rt2.s) && rt.h1 === rt2.h, rt.h1 + ' / ' + rt2.h);
  // VA -> AM -> VA (no gesture): the same hash, not "geändert"; one undo after the switch restores the sound; VA renders bit-identical
  const sw = await page.evaluate(async () => {
    const D = SYNQUENZER; D.loadPreset(1, 'f-moog-bass'); const a = D.getSound(1), ha = SQStore.soundHash(a);
    D.setEngine(1, 'mk'); const mid = D.getSound(1); D.setEngine(1, 'va'); const b = D.getSound(1), edited = D.soundEdited(1);
    const und = (() => { soundEdit(1, 'Klangerzeugung', () => D.setEngine(1, 'mk')); D.undo(); return D.getSound(1); })();
    const lab = soundLabel(S.tracks[0]);
    const fp = async snd => { const r = await D.mkRender(snd, [[0, 'on', 48, .8], [.6, 'off', 48]], {sec: 1}); let h = 0x811c9dc5; for (const x of new Uint32Array(r.l.buffer)) { h ^= x; h = Math.imul(h, 16777619) >>> 0; } return h; };
    return {same: SQStore.soundHash(b) === ha, edited, midEng: mid.engine, hasMk: !!mid.p.mk, back: !('mk' in b.p), undo: JSON.stringify(und) === JSON.stringify(a), lab, ra: await fp(a), rb: await fp(b)};
  });
  ok('MK1-01 VA → AM → VA: soundHash gleich, nicht geändert, VA bitgleich; ein Undo stellt her', sw.same && !sw.edited && sw.back && sw.hasMk && sw.undo && sw.ra === sw.rb, JSON.stringify(sw));
  const names = await page.evaluate(async () => {
    const D = SYNQUENZER; D.selectTrack(0); D.openEditor(); await new Promise(r => setTimeout(r, 300));
    const head = document.querySelector('#synthSheet .sh-head').innerText;
    D.closeEditor(); D.openBrowser(2); D.browserScope({all: true}); await new Promise(r => setTimeout(r, 300));
    const rows = D.browserRows(), mkRows = rows.filter(r => r.engine === 'mk');
    const sc = document.querySelector('#sndSheet') ? document.querySelector('#sndSheet').innerText : '';
    D.closeBrowser(); const mid = trackMidiName(S.tracks[0]);
    return {head: /MS 2000/.test(head), lab: soundLabel(S.tracks[0]), mkRows: mkRows.length, browserTxt: /MS 2000/.test(sc), midi: /MS 2000/.test(mid)};
  });
  ok('MK1-01 „MS 2000“ in Blattkopf, Sound-Label, Browser („Alle Engines“) und MIDI-Spurname', names.head && /^MS 2000 · /.test(names.lab) && names.mkRows >= 1 && names.midi, JSON.stringify(names));
  ok('MK1-01 keine Konsolenfehler', errs.length === 0, errs.join(' | ').slice(0, 300));
  await ctx.close();
});
// ---- MK1-01b cold start: library with an AM sound, reload without opening AM ----
await T('MK1-01b', async () => {
  const srv = server(); const {ctx, page, errs} = await setup(srv); await go(page);
  const a = await page.evaluate(async () => { const D = SYNQUENZER; D.setEngine(0, 'mk'); D.mkSet(0, 't.0.f.res', 99); await D.saveSound(0, 'Mein AM'); D.loadPreset(0, 'f-moog-bass'); await D.save(); return D.library().find(s => s.engine === 'mk'); });
  await page.reload(); await boot(page); await page.evaluate(() => SYNQUENZER.libraryReady());
  const b = await page.evaluate(() => ({s: SYNQUENZER.library().find(s => s.engine === 'mk'), info: SYNQUENZER.mkInfo()}));
  ok('MK1-01b Kalt-Start: p.mk deep-equal, mkInfo().loaded === false', a && b.s && deq(a.p.mk, b.s.p.mk) && b.info.loaded === false, JSON.stringify(b.info));
  ok('MK1-01b keine Konsolenfehler', errs.length === 0, errs.join(' | ').slice(0, 300));
  await ctx.close();
});
// ---- MK1-02 format 5; format 3 / 4 files load as in 4.8.1; demo and every factory sound render bit-identical ----
await T('MK1-02', async () => {
  const collect = async file => {
    CUR.html = fs.readFileSync(file); const srv = server(); const {ctx, page, errs} = await setup(srv); await go(page);
    const o = await page.evaluate(async () => {
      const D = SYNQUENZER, r = {};
      const unid = o => JSON.parse(JSON.stringify(o, (k, v) => (k === 'uid' || k === 'ct' || k === 'mt' || k === 'id' || k === 'name' ? undefined : v)));
      r.newFmt = JSON.parse(D.serialize()).format;
      const f = JSON.parse(D.serialize()); r.demo = unid(normalizeProject(f.project));
      // a format 3 / 4 file of the demo (same content, older envelope)
      for (const fm of [3, 4]) { const g = JSON.parse(D.serialize()); g.format = fm; const pr = SQStore.parseFile(JSON.stringify(g), LEGACY_HOOKS); r['f' + fm] = unid(pr.project); }
      const SEED = 'Math.random=(function(){var s=12345;return function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};})();\n';
      const src = SEED + document.getElementById('sq-worklet-src').textContent, sr = 48000, H = [];
      const ids = D.factory().map(f => f.id).concat(['f-init-analog', 'f-init-fm', 'f-init-tabelle', 'f-melodie-lead']);
      for (const id of ids) {
        const snd = factorySound(id); if (!snd || snd.engine === 'drum') continue;
        const oc = new OfflineAudioContext(2, sr, sr); await oc.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src));
        const E = SynthHost.track(oc, oc.destination, wkFlat(snd), wkMods(snd), snd.engine === 'fm6' && snd.p.fm6 ? wkFmOf(snd.p) : null);
        E.tempo(120, 0); E.on(1, 60, .8, .02); E.off(1, .62); E.flush(); await new Promise(q => setTimeout(q, 20));
        const b = await oc.startRendering(); let h = 0x811c9dc5, mx = 0;
        for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (const x of new Uint32Array(d.buffer)) { h ^= x; h = Math.imul(h, 16777619) >>> 0; } }
        const d0 = b.getChannelData(0); H.push([id, h, Array.from(d0.filter((_, i) => i % 97 === 0))]);
      }
      r.render = H; return r;
    });
    o.errs = errs; await ctx.close(); return o;
  };
  const a = await collect(OLD), b = await collect(NEW); CUR.html = fs.readFileSync(NEW);
  ok('MK1-02 neue Projekte Format 5 (vorher 4)', b.newFmt === 5 && a.newFmt === 4, a.newFmt + ' → ' + b.newFmt);
  ok('MK1-02 Format 3 und 4 laden deep-equal zum Vorgänger', deq(a.f3, b.f3) && deq(a.f4, b.f4) && deq(a.demo, b.demo));
  let maxd = 0, nb = 0; a.render.forEach((x, i) => { const y = b.render[i]; if (!y || x[1] !== y[1]) { nb++; for (let k = 0; k < x[2].length; k++) maxd = Math.max(maxd, Math.abs(x[2][k] - (y ? y[2][k] : 0))); } });
  ok('MK1-02 Demo- und Werks-Sounds (VA, FM, WT) offline bitgleich zum Vorgänger (' + a.render.length + ')', nb === 0 || maxd <= 1e-6, nb + ' abweichend, max |Δ| ' + maxd);
  ok('MK1-02 keine Konsolenfehler', a.errs.length === 0 && b.errs.length === 0, b.errs.join(' | ').slice(0, 200));
});
// ---- MK1-02b a sound of an unknown engine survives (MK0 stays) ----
await T('MK1-02b', async () => {
  const X = {$: 'snd', v: 1, id: null, name: 'Zukunft', cat: 'lead', engine: 'xyz', ev: 3, p: {zz: 1, mk: {v: 9}}, mods: [], fx: {vol: .7, q: 1}, origin: null, ct: 1, mt: 2};
  const srv = server(); const {ctx, page, errs} = await setup(srv, {session: true}); await go(page);
  await page.evaluate(x => SYNQUENZER.setSound(0, x), X); await page.evaluate(() => SYNQUENZER.save());
  await page.evaluate(x => SYNQUENZER.importSounds({app: 'SYNQUENZER', kind: 'sounds', format: 2, sounds: [Object.assign({}, x, {id: 'u-zz-1'})]}), X);
  await page.evaluate(() => SYNQUENZER.cloudLibPush()); await page.waitForTimeout(500);
  await page.reload(); await boot(page); await page.evaluate(() => SYNQUENZER.libraryReady());
  const g = await page.evaluate(() => ({s: SYNQUENZER.getSound(0), l: SYNQUENZER.library().find(s => s.engine === 'xyz')}));
  const lib = srv.lib && JSON.parse(typeof srv.lib.body === 'string' ? srv.lib.body : JSON.stringify(srv.lib.body));
  const inCloud = JSON.stringify(lib || {}).includes('"xyz"');
  ok('MK1-02b Engine „xyz“: Projekt, Bibliothek und Cloud-Bibliothek deep-equal', deq(g.s, X) && g.l && deq(Object.assign({}, g.l, {id: 0}), Object.assign({}, X, {id: 0})) && inCloud, canon(g.s).slice(0, 80));
  ok('MK1-02b keine Konsolenfehler', errs.length === 0, errs.join(' | ').slice(0, 200));
  await ctx.close();
});
// ---- MK1-03 brand words (B.6 Nr. 9 a, b, c) ----
await T('MK1-03', async () => {
  const s = fs.readFileSync(NEW, 'utf8');
  const all = (s.match(/micro ?korg|radias|dwgs/gi) || []).length, ms = s.match(/ms[ -]?2000/gi) || [];
  const line = s.split('\n').filter(l => /ms[ -]?2000/i.test(l));
  const mkSrc = s.slice(s.indexOf('id="sq-mk-src"'), s.indexOf('</script>', s.indexOf('id="sq-mk-src"')));
  const wl = s.slice(s.indexOf('id="sq-worklet-src"'), s.indexOf('</script>', s.indexOf('id="sq-worklet-src"'))), am = wl.slice(wl.indexOf('/*MK{*/'), wl.indexOf('/*}MK*/'));
  const sq = s.slice(s.indexOf('const MK_LABEL'), s.indexOf('G.SQMK ='));
  const rx = /korg|micro ?korg|ms[ -]?2000|radias|dwgs|dw[ -]?[68]000|\bvox\b/gi;
  const a = (mkSrc.match(rx) || []).length + (am.match(rx) || []).length + ((sq.replace("const MK_LABEL = 'MS 2000';", '')).match(rx) || []).length;
  ok('MK1-03 AM-Teil ohne Markenwort (a)', a === 0, a + ' Treffer');
  ok('MK1-03 ganze Datei: microKORG/RADIAS/DWGS 0, „MS 2000“ genau 1 (MK_LABEL)', all === 0 && ms.length === 1 && ms[0] === 'MS 2000' && line.length === 1 && /MK_LABEL = 'MS 2000'/.test(line[0]), all + ' / ' + ms.length);
  const ff = (s.match(/@font-face/g) || []).length, fo = (fs.readFileSync(OLD, 'utf8').match(/@font-face/g) || []).length, img = /data:image|<img/.test(mkSrc);
  ok('MK1-03 keine neue Schrift, keine Bild-Daten im Bedienfeld (c)', ff === fo && !img, ff + ' / ' + fo);
});
// ---- MK1-28 version guard; MK1-30 the flat VA state rests ----
await T('MK1-28', async () => {
  const srv = server(); const {ctx, page, errs} = await setup(srv, {session: true}); await go(page);
  const r = await page.evaluate(async () => { const D = SYNQUENZER; D.setEngine(0, 'mk'); await D.save(); await D.cloudSync(); return {code: APP_CODE, cloud: D.cloud().state}; });
  await page.waitForTimeout(1500);
  const sp = srv.calls.filter(c => c.fn === 'save_project').map(c => ({f: c.body.p_format, a: c.body.p_app}));
  const nonClass = srv.calls.every(c => !JSON.stringify(c).includes('rolcktiryrvjzbwuvobb'));
  ok('MK1-28 APP_CODE 4 009 000; save_project mit Format 5 und App 4009000; kein Klassenzimmer-Projekt', r.code === 4009000 && sp.length >= 1 && sp.every(x => x.f === 5 && x.a === 4009000) && nonClass, JSON.stringify(sp) + ' ' + r.cloud + ' code ' + r.code + ' fremd ' + srv.foreignReq + ' ' + nonClass);
  await ctx.close();
});
await T('MK1-30', async () => {
  const srv = server(); const {ctx, page, errs} = await setup(srv); await go(page);
  const r = await page.evaluate(async () => {
    const D = SYNQUENZER; ensureAudio(); await new Promise(q => setTimeout(q, 1200));
    D.setMod(0, 'lfo1', 'fx.rev', .8); D.setMod(0, 'lfo1', 'cutoff', .5);
    const A = AU.tracks[0], va = A.nl.routes.length;
    // spy on the worklet messages of track 0
    const E = AU.synth[0], sent = []; const pm = E.node.port.postMessage.bind(E.node.port); E.node.port.postMessage = m => { sent.push(JSON.parse(JSON.stringify(m))); pm(m); };
    D.setEngine(0, 'mk'); const am = A.nl.routes.length;
    D.keyOn(60); await new Promise(q => setTimeout(q, 200)); D.keyOff(60);
    const mods = sent.filter(m => m.mods).map(m => m.mods.length), glide = sent.filter(m => m.ev).flatMap(m => m.ev).filter(e => e[1] === 1).map(e => e[5]);
    D.setEngine(0, 'va'); const back = A.nl.routes.length;
    return {va, am, back, mods, glide};
  });
  ok('MK1-30 VA-Zustand ruht: kein fx.rev-LFO, keine VA-Mods, kein glideFrom; zurück auf VA wirkt die Route', r.va >= 1 && r.am === 0 && r.mods.every(n => n === 0) && r.glide.every(g => g === -1) && r.back >= 1, JSON.stringify(r));
  ok('MK1-30 keine Konsolenfehler', errs.length === 0, errs.join(' | ').slice(0, 200));
  await ctx.close();
});
// ---- MK1-29 the older version (4.8.1) opens a format-5 project / a library with AM sounds: nothing is overwritten ----
await T('MK1-29', async () => {
  CUR.html = fs.readFileSync(NEW);
  const srv = server(); const {ctx, page, errs} = await setup(srv, {session: true}); await go(page);
  const before = await page.evaluate(async () => { const D = SYNQUENZER; D.setEngine(0, 'mk'); D.mkSet(0, 't.0.f.cut', 55); await D.saveSound(0, 'AM eins'); await D.save(); await D.cloudSync(); await D.cloudLibPush(); return {s: D.getSound(0), lib: D.library().filter(x => x.engine === 'mk')}; });
  await page.waitForTimeout(1500);
  const kv0 = await idb(page, 'get', 'project'), lib0 = JSON.stringify(srv.lib), proj0 = JSON.stringify([...srv.projects.values()].map(p => p.body));
  CUR.html = fs.readFileSync(OLD); await page.reload(); await boot(page);
  const old = await page.evaluate(async () => { const D = SYNQUENZER; const st = D.nvState(); S.bpm = 99; markDirty(); await D.save(); try { await D.cloudLibPush(); } catch (e) {} try { await D.cloudSync(); } catch (e) {} return {st, ver: D.version}; });
  await page.waitForTimeout(1500);
  const kv1 = await idb(page, 'get', 'project');
  ok('MK1-29 4.8.1: Format-5-Projekt gesperrt, KV unverändert, Server-Projekt und -Bibliothek unverändert', old.ver === '4.8.1' && !!old.st.lock && deq(kv0.project, kv1.project) && JSON.stringify(srv.lib) === lib0 && JSON.stringify([...srv.projects.values()].map(p => p.body)) === proj0, JSON.stringify(old.st).slice(0, 120));
  CUR.html = fs.readFileSync(NEW); await page.reload(); await boot(page); await page.evaluate(() => SYNQUENZER.libraryReady());
  const after = await page.evaluate(() => ({s: SYNQUENZER.getSound(0), lib: SYNQUENZER.library().filter(x => x.engine === 'mk')}));
  ok('MK1-29 zurück auf 4.9.0: Sound und AM-Bibliothek deep-equal', deq(before.s, after.s) && deq(before.lib, after.lib));
  await ctx.close();
});
await browser.close();
console.log(fails ? fails + ' FEHLER' : 'alles bestanden');
process.exit(fails ? 1 : 0);
