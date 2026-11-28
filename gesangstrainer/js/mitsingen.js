// Gesangstrainer – mitsingen.js: Mitsing-Ansicht (Karaoke mit Vokal-Kugeln). Alles lokal, nichts wird gesendet.
//
// export async function zeige(el, lied, {stimme}) → {schliesse()}
//   lied: Lied-Objekt wie daten/the-wall.json oder ein eigenes Lied aus speicher.js (zeilen[].silben[].t/dauer/midi)
//   stimme: 'm'|'w' oder Stimmprofil {tief, hoch, kern:[lo,hi], …} (Kernbereich wird als Band gezeigt)
// Wiedergabe: Instrumental + „Meine Vokal-Spur“ (Regler 0–100 %, Standard 50 %), Umschalter echt/geglättet,
//   Teil-Auswahl mit Schleife. The Wall: daten/the-wall-audio.json. Eigene Lieder: Audio aus speicher.js →
//   vokalfilter.js im Worker (Stereo: trennen) → Vokal-Spur on-the-fly. Ton startet nur nach einem Tipp (iOS).
//   Mikrofon (optional): Vokal-Spiegel (vokalspiegel.js) + Live-Tonhöhe als sanfte Linie gegen die Noten.

const BASIS = new URL('../', import.meta.url);            // = app/
const VKL = { a: 'v-a', e: 'v-e', i: 'v-i', y: 'v-i', o: 'v-o', u: 'v-u', 'ä': 'v-ae', 'ö': 'v-oe', 'ü': 'v-ue' };
const VFARBE = { a: '#ff7f4e', e: '#ffc23e', i: '#33cdd0', o: '#b56cff', u: '#5a98ff', 'ä': '#ffa253', 'ö': '#b9a3cf', 'ü': '#5fd884' };
const vNorm = (v) => { const c = String(v || 'a').trim().toLowerCase()[0] || 'a'; return VKL[c] ? (c === 'y' ? 'i' : c) : 'a'; };

function h(tag, attr, ...kinder) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attr || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v; else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v); else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kinder.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
}
const ic = (name) => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('class', 'ic'); s.setAttribute('aria-hidden', 'true'); const u = document.createElementNS('http://www.w3.org/2000/svg', 'use'); u.setAttribute('href', '#i-' + name); s.append(u); return s; };
function kugel(s, cls = '') {
  const anz = String(s.anzeige || (s.vokal ? String(s.vokal).toUpperCase() : 'A'));
  const haupt = anz[0] || 'A', nach = s.gleit ? String(s.gleit) : anz.length > 1 ? anz.slice(1) : '';
  return h('span', { class: `kugel ${VKL[vNorm(s.vokal || haupt)]} ${cls}`, 'aria-hidden': 'true' }, haupt, nach ? h('span', { class: `nach ${VKL[vNorm(nach)]}` }, nach) : null);
}

function stil() {
  if (document.getElementById('ms-stil')) return;
  document.head.append(h('style', { id: 'ms-stil' }, `
.ms { display: grid; gap: 14px; padding-bottom: 24px; }
.ms-buehne { position: relative; height: 230px; border-radius: var(--rund, 22px); overflow: hidden; background: var(--karte); box-shadow: var(--schatten); touch-action: pan-y; }
.ms-buehne canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.ms-bahn { position: absolute; inset: 0; pointer-events: none; }
.ms-bahn .kugel { position: absolute; left: 0; top: 0; --g: 46px; will-change: transform; transition: opacity .2s ease; box-shadow: none; }
.ms-bahn .kugel.jetzt { box-shadow: 0 6px 18px color-mix(in srgb, var(--v2) 55%, transparent); }
.ms-bahn .kugel.war { opacity: .38; }
.ms-bahn .kugel.gesprochen { opacity: .5; filter: grayscale(.6); }
.ms-jetzt { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 14px; padding: 14px 16px; }
.ms-jetzt .gross { --g: 96px; }
.ms-jetzt .klein { --g: 52px; opacity: .8; }
.ms-jetzt .silbe-gross { font-size: 30px; font-weight: 850; letter-spacing: -.02em; line-height: 1.1; overflow-wrap: anywhere; }
.ms-jetzt .silbe-klein { font-size: 14px; color: var(--schwach); text-align: center; margin-top: 4px; }
.ms-zeile { text-align: center; color: var(--leise); font-size: 17px; min-height: 26px; }
.ms-zeile b { color: var(--text); }
.ms-steuer { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.ms-steuer .rund-knopf { flex: none; }
.ms-regler { flex: 1 1 200px; display: grid; gap: 4px; }
.ms-regler label { font-weight: 700; font-size: 15px; display: flex; justify-content: space-between; }
.ms-regler input[type=range] { width: 100%; min-height: 44px; accent-color: var(--akzent); }
.ms-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.ms-chips button { min-height: 44px; min-width: 44px; padding: 0 14px; border-radius: 999px; border: 0; background: var(--karte2); font-weight: 700; }
.ms-chips button.an { background: var(--text); color: var(--bg); }
.ms-status { text-align: center; color: var(--schwach); font-size: 14px; min-height: 20px; margin: 0; }
@media (prefers-reduced-motion: reduce) { .ms-bahn .kugel { transition: none; } }
`));
}

// ---------------------------------------------------------------- Audio laden (ohne AudioContext vor dem Tipp)
async function holeBuffer(url, status, name) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${name} nicht gefunden (${r.status})`);
  const ab = await r.arrayBuffer();
  status(`${name} wird vorbereitet …`);
  return dekodiere(ab);
}
function dekodiere(ab) {
  const O = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const off = new O(2, 1, 48000);
  return new Promise((res, rej) => { const p = off.decodeAudioData(ab, res, rej); if (p && p.then) p.then(res, rej); });
}
function alsBuffer(y, sr) {
  const O = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const b = new O(1, 1, sr).createBuffer(1, y.length, sr); b.getChannelData(0).set(y); return b;
}

// ---------------------------------------------------------------- Ansicht
export async function zeige(el, lied, { stimme } = {}) {
  stil();
  const profil = stimme && typeof stimme === 'object' ? stimme : null;
  const geschlecht = typeof stimme === 'string' ? stimme : (profil && profil.geschlecht) || 'm';

  // Silben mit Zeiten + Vokale
  let ph = null; try { ph = await import('./phonetik.js'); } catch (e) { ph = null; }
  const silben = [];
  for (const z of lied.zeilen || []) {
    let v = null; try { v = ph && ph.silbenZuVokalen ? ph.silbenZuVokalen(z) : null; } catch (e) { v = null; }
    (z.silben || []).forEach((s, i) => {
      if (!isFinite(s.t)) return;
      const vi = v && v[i] ? v[i] : { vokal: vNorm((String(s.text).match(/[aeiouyäöü]/i) || ['a'])[0]), gleit: '' };
      silben.push({ ...s, zeile: z.id, teil: z.teil, ende: s.t + (s.dauer || 0.3), vokal: vi.vokal, gleit: vi.gleit || '', anzeige: vi.anzeige, gesprochen: !!s.gesprochen || s.midi == null && !s.noten });
    });
  }
  silben.sort((a, b) => a.t - b.t);
  const zeilen = (lied.zeilen || []).filter((z) => (z.silben || []).some((s) => isFinite(s.t)));
  const dauer = lied.dauer || (silben.length ? silben[silben.length - 1].ende + 4 : 0);
  const teile = (lied.teile || []).map((t) => {
    if (isFinite(t.start) && isFinite(t.ende)) return t;
    const ss = silben.filter((s) => s.teil === t.id); if (!ss.length) return null;
    return { ...t, start: Math.max(0, ss[0].t - 1.5), ende: ss[ss.length - 1].ende + 1 };
  }).filter(Boolean);
  const midis = silben.filter((s) => s.midi != null).map((s) => s.midi);
  let lo = lied.umfang && isFinite(lied.umfang.tief) ? lied.umfang.tief : Math.min(...midis, 60);
  let hi = lied.umfang && isFinite(lied.umfang.hoch) ? lied.umfang.hoch : Math.max(...midis, 48);
  if (!isFinite(lo) || !isFinite(hi) || hi <= lo) { lo = 48; hi = 60; }
  lo -= 2; hi += 2;

  // ---- DOM ----
  const leinwand = h('canvas');
  const bahn = h('div', { class: 'ms-bahn' });
  const buehne = h('div', { class: 'ms-buehne', role: 'img', 'aria-label': 'Vokal-Kugeln wandern zur Liedzeit, die aktuelle Silbe leuchtet' }, leinwand, bahn);
  const grossK = h('div'), kleinK = h('div'), grossT = h('div', { class: 'silbe-gross' }, '…'), kleinT = h('div', { class: 'silbe-klein' });
  const jetztKarte = h('section', { class: 'karte ms-jetzt', 'aria-live': 'off' }, grossK, grossT, h('div', null, kleinK, kleinT));
  const zeileText = h('p', { class: 'ms-zeile' });
  const status = h('p', { class: 'ms-status', role: 'status' }, 'Lädt …');
  const playKnopf = h('button', { class: 'rund-knopf', 'aria-label': 'Abspielen', disabled: true, onclick: () => (spielt ? pause() : spiele()) }, ic('play'));
  const regler = h('input', { type: 'range', min: 0, max: 100, value: 50, id: 'ms-vokal', 'aria-label': 'Meine Vokal-Spur' });
  const reglerWert = h('span', null, '50 %');
  const artChips = h('div', { class: 'ms-chips', role: 'group', 'aria-label': 'Meine Vokale' });
  const teilChips = h('div', { class: 'ms-chips', role: 'group', 'aria-label': 'Teil' });
  const schleifeKnopf = h('button', { 'aria-pressed': 'false', onclick: () => { schleife = !schleife; schleifeKnopf.classList.toggle('an', schleife); schleifeKnopf.setAttribute('aria-pressed', String(schleife)); if (spielt) starteQuellen(liedZeit()); } }, ic('schleife'), ' Schleife');
  const mikroKnopf = h('button', { 'aria-pressed': 'false', onclick: () => mikrofon() }, ic('stimme'), ' Mikrofon');
  const spiegelBox = h('section', { class: 'karte', hidden: true });
  const wurzel = h('div', { class: 'ms' },
    h('section', { class: 'held' }, h('h1', null, 'Mitsingen'), h('p', null, `${lied.titel || 'Lied'} – Instrumental und deine reinen Vokale. Kopfhörer helfen.`)),
    buehne, jetztKarte, zeileText,
    h('section', { class: 'karte' },
      h('div', { class: 'ms-steuer' }, playKnopf,
        h('div', { class: 'ms-regler' }, h('label', { for: 'ms-vokal' }, 'Meine Vokal-Spur', reglerWert), regler)),
      h('div', { style: { marginTop: '12px' } }, artChips),
      h('div', { style: { marginTop: '10px' } }, teilChips),
      h('div', { class: 'ms-chips', style: { marginTop: '10px' } }, schleifeKnopf, mikroKnopf)),
    spiegelBox, status);
  el.replaceChildren(wurzel);

  // Kugeln für alle Silben (einmal), Position per transform
  const kEls = silben.map((s) => { const k = kugel(s, s.gesprochen ? 'gesprochen' : ''); k.style.opacity = '0'; bahn.append(k); return k; });

  // ---- Zustand ----
  let ctx = null, gInst = null, gVok = null, qInst = null, qVok = null;
  let bufInst = null, bufVok = { echt: null, rein: null }, art = 'echt', basisIstMix = false;
  let spielt = false, t0Ctx = 0, off = 0, pos = teile.length ? 0 : 0, auswahl = null, schleife = false, raf = 0, zu = false;
  let spiegel = null, mikroStopp = null; const linie = [];
  let letzteZeile = null;
  const anteil = () => Number(regler.value) / 100;
  const bereich = () => auswahl ? [auswahl.start, auswahl.ende] : [0, dauer];
  function liedZeit() {
    if (!spielt || !ctx) return pos;
    let t = ctx.currentTime - t0Ctx + off;
    const [a, b] = bereich();
    if (schleife && t >= b) t = a + ((t - a) % (b - a));
    return t;
  }
  regler.addEventListener('input', () => { reglerWert.textContent = regler.value + ' %'; if (gVok && ctx) gVok.gain.setTargetAtTime(anteil(), ctx.currentTime, 0.03); });

  function setzeArtChips() {
    const mk = (id, text) => h('button', { class: art === id ? 'an' : '', 'aria-pressed': String(art === id), onclick: () => waehleArt(id) }, text);
    artChips.replaceChildren(h('span', { style: { alignSelf: 'center', fontWeight: 700, marginRight: '4px' } }, 'Meine Vokale:'), mk('echt', 'echt'), mk('rein', 'geglättet'));
  }
  function setzeTeilChips() {
    const mk = (t, text) => h('button', { class: (auswahl === t) ? 'an' : '', 'aria-pressed': String(auswahl === t), onclick: () => { auswahl = t; pos = t ? t.start : 0; linie.length = 0; setzeTeilChips(); if (spielt) starteQuellen(pos); else zeichne(); } }, text);
    teilChips.replaceChildren(mk(null, 'Ganzes Lied'), ...teile.filter((t) => silben.some((s) => s.t >= t.start && s.t < t.ende) || t.id === 'in').map((t) => mk(t, t.name)));
  }
  setzeArtChips(); setzeTeilChips();

  // ---- Audio ----
  const meld = (t) => { status.textContent = t; };
  let vokalQuelle = null;   // eigene Lieder: {kanaele, sr}
  async function lade() {
    try {
      if (lied.id === 'the-wall') {
        const cfg = await (await fetch(new URL('daten/the-wall-audio.json', BASIS))).json();
        meld('Instrumental und Vokal-Spur werden geladen …');
        const [a, b] = await Promise.all([holeBuffer(new URL(cfg.instrumental, BASIS), meld, 'Instrumental'), holeBuffer(new URL(cfg.vokale, BASIS), meld, 'Vokal-Spur')]);
        bufInst = a; bufVok.echt = b;
        if (cfg.vokaleRein) holeBuffer(new URL(cfg.vokaleRein, BASIS), () => {}, 'Geglättete Vokale').then((r) => { bufVok.rein = r; }).catch(() => {});
      } else {
        const speicher = await import('./speicher.js');
        const blob = await speicher.ladeAudio(lied.id);
        if (!blob) { meld('Für dieses Lied ist keine Aufnahme gespeichert – Mitsingen braucht Audio.'); return; }
        meld('Aufnahme wird geladen …');
        const inst = lied.audioArt === 'getrennt' ? await speicher.ladeAudio(lied.id + '#instrumental') : null;
        if (inst) { // Gesang und Instrumental getrennt geladen: echtes Instrumental, Vokal-Spur aus der Gesangsspur
          bufInst = await dekodiere(await inst.arrayBuffer()); basisIstMix = false;
          const g = await dekodiere(await blob.arrayBuffer());
          vokalQuelle = { ks: [g.getChannelData(0).slice()], sr: g.sampleRate };
        } else {
          bufInst = await dekodiere(await blob.arrayBuffer()); basisIstMix = true;
          const ks = []; for (let c = 0; c < Math.min(2, bufInst.numberOfChannels); c++) ks.push(bufInst.getChannelData(c).slice());
          vokalQuelle = { ks, sr: bufInst.sampleRate };
        }
        await baueVokale('echt');
      }
      playKnopf.disabled = false;
      meld(basisIstMix ? 'Bereit. Grundlage ist deine Aufnahme (kein eigenes Instrumental).' : 'Bereit – tippe auf Abspielen.');
    } catch (e) { console.warn(e); meld('Audio ließ sich nicht laden: ' + (e && e.message ? e.message : e)); }
  }
  async function baueVokale(welche) {
    if (bufVok[welche] || !vokalQuelle) return;
    const vf = await import('./vokalfilter.js');
    const ziele = silben.filter((s) => !s.gesprochen).map((s) => ({ t: s.t, ende: s.ende, vokal: s.vokal, gleit: s.gleit }));
    const { ks, sr } = vokalQuelle;
    const r = await vf.imHintergrund(ks.length > 1 ? ks : ks[0], sr, { trennen: ks.length > 1, rein: welche === 'rein', ziele, stimme: geschlecht, fortschritt: (p) => meld(`Vokal-Spur wird berechnet … ${p} %`) });
    bufVok[welche] = alsBuffer(r.y, sr);
  }
  async function waehleArt(id) {
    art = id; setzeArtChips();
    if (!bufVok[id]) {
      if (vokalQuelle) { await baueVokale(id); meld('Bereit.'); }
      else { meld('Geglättete Vokale werden noch geladen …'); for (let i = 0; i < 40 && !bufVok[id]; i++) await new Promise((r) => setTimeout(r, 250)); meld(bufVok[id] ? 'Bereit.' : 'Geglättete Vokale nicht verfügbar.'); }
    }
    if (spielt) starteQuellen(liedZeit());
  }
  function stoppeQuellen() { for (const q of [qInst, qVok]) if (q) { try { q.onended = null; q.stop(); } catch (e) { /* nichts */ } } qInst = qVok = null; }
  function starteQuellen(ab) {
    stoppeQuellen();
    const [a, b] = bereich();
    if (ab < a || ab >= b) ab = a;
    const jetzt = ctx.currentTime + 0.05;
    const mk = (buf, ziel) => {
      if (!buf) return null;
      const q = ctx.createBufferSource(); q.buffer = buf; q.connect(ziel);
      if (schleife) { q.loop = true; q.loopStart = a; q.loopEnd = Math.min(b, buf.duration); }
      q.start(jetzt, Math.min(ab, buf.duration - 0.01));
      if (!schleife) q.stop(jetzt + (b - ab));
      return q;
    };
    qInst = mk(bufInst, gInst); qVok = mk(bufVok[art] || bufVok.echt, gVok);
    if (qInst) qInst.onended = () => { if (spielt && !schleife) { pause(); pos = bereich()[0]; zeichne(); } };
    t0Ctx = jetzt; off = ab;
  }
  async function sichereCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC({ latencyHint: 'interactive' });
      gInst = ctx.createGain(); gInst.gain.value = basisIstMix ? 0.8 : 0.9; gInst.connect(ctx.destination);
      gVok = ctx.createGain(); gVok.gain.value = anteil(); gVok.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') await ctx.resume();
  }
  async function spiele() {   // nur aus dem Tipp heraus (iOS)
    if (!bufInst) return;
    await sichereCtx();
    spielt = true; starteQuellen(pos); if (/Bereit/.test(status.textContent)) meld('');
    playKnopf.replaceChildren(ic('pause')); playKnopf.setAttribute('aria-label', 'Pause');
  }
  function pause() {
    pos = liedZeit(); spielt = false; stoppeQuellen();
    playKnopf.replaceChildren(ic('play')); playKnopf.setAttribute('aria-label', 'Abspielen');
  }

  // ---- Mikrofon: Vokal-Spiegel + Tonhöhen-Linie ----
  function aktuelleSilbe(t) {
    let lo2 = 0, hi2 = silben.length - 1, k = -1;
    while (lo2 <= hi2) { const m = (lo2 + hi2) >> 1; if (silben[m].t <= t) { k = m; lo2 = m + 1; } else hi2 = m - 1; }
    return k;
  }
  async function mikrofon() {
    if (spiegel && spiegel.laeuft) { spiegel.stopp(); mikroKnopf.classList.remove('an'); mikroKnopf.setAttribute('aria-pressed', 'false'); return; }
    if (mikroStopp) { mikroStopp(); mikroStopp = null; mikroKnopf.classList.remove('an'); mikroKnopf.setAttribute('aria-pressed', 'false'); return; }
    await sichereCtx();
    const merke = (zeit, m) => { linie.push({ t: zeit, m }); if (linie.length > 4000) linie.splice(0, 1000); };
    try {
      if (!spiegel) {
        const vs = await import('./vokalspiegel.js');
        spiegelBox.hidden = false;
        spiegel = vs.vokalSpiegel(spiegelBox, {
          stimme: geschlecht,
          ziel: () => { const t = liedZeit(), k = aktuelleSilbe(t), s = silben[k]; return s && t <= s.ende + 0.05 && !s.gesprochen ? { ...s, liedZeit: t } : { liedZeit: t }; },
          onRahmen: (p) => { if (spielt) merke(liedZeit(), p.midiGenau); },
        });
      }
      await spiegel.start(ctx);
      mikroKnopf.classList.add('an'); mikroKnopf.setAttribute('aria-pressed', 'true');
    } catch (e) {
      console.warn(e);
      try { // Ersatz: nur Tonhöhe über ton.js
        const ton = await import('./ton.js');
        mikroStopp = await ton.mikrofon({ ctx, onTon: (r) => { if (spielt) merke(liedZeit(), r.midiGenau); } });
        mikroKnopf.classList.add('an');
      } catch (e2) { meld('Mikrofon nicht verfügbar – bitte Zugriff erlauben.'); }
    }
  }

  // ---- Zeichnen (rAF) ----
  const PX = 90;   // px je Sekunde
  let W = 0, H = 0, dpr = 1;
  function groesse() {
    const r = buehne.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.round(r.width); H = Math.round(r.height);
    leinwand.width = W * dpr; leinwand.height = H * dpr;
  }
  const yVon = (m) => 24 + (hi - m) / (hi - lo) * (H - 48);
  let aktivK = -2;
  function zeichne() {
    if (!W) groesse();
    const t = liedZeit(), x0 = W * 0.28;
    const g = leinwand.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    // Kernbereich der Stimme
    if (profil && Array.isArray(profil.kern)) {
      const y1 = yVon(profil.kern[1] + 0.5), y2 = yVon(profil.kern[0] - 0.5);
      g.fillStyle = 'rgba(111,227,168,.07)'; g.fillRect(0, y1, W, y2 - y1);
    }
    // Noten-Balken
    const t1 = t - x0 / PX, t2 = t + (W - x0) / PX;
    for (const s of silben) {
      if (s.ende < t1 || s.t > t2) continue;
      const nn = s.noten && s.noten.length ? s.noten : s.midi != null ? [{ t: s.t, dauer: s.ende - s.t, midi: s.midi }] : [];
      g.fillStyle = VFARBE[vNorm(s.vokal)]; g.globalAlpha = 0.28;
      for (const n of nn) { const xa = x0 + (n.t - t) * PX, w = Math.max(6, n.dauer * PX); g.beginPath(); g.roundRect ? g.roundRect(xa, yVon(n.midi) - 7, w, 14, 7) : g.rect(xa, yVon(n.midi) - 7, w, 14); g.fill(); }
    }
    g.globalAlpha = 1;
    // Live-Tonhöhe (sanft, ohne Punkte)
    const sicht = linie.filter((p) => p.t >= t1 - 0.2 && p.t <= t + 0.05);
    if (sicht.length > 1) {
      g.strokeStyle = getComputedStyle(wurzel).color; g.globalAlpha = 0.75; g.lineWidth = 3; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath(); let offen = false, glatt = null, tv = -1;
      for (const p of sicht) {
        if (p.m == null || p.t - tv > 0.15) { offen = false; glatt = null; }
        if (p.m == null) { tv = p.t; continue; }
        glatt = glatt == null ? p.m : glatt + 0.45 * (p.m - glatt);
        const x = x0 + (p.t - t) * PX, y = yVon(glatt);
        offen ? g.lineTo(x, y) : g.moveTo(x, y); offen = true; tv = p.t;
      }
      g.stroke(); g.globalAlpha = 1;
    }
    // Jetzt-Linie
    g.fillStyle = 'rgba(255,122,89,.85)'; g.fillRect(x0 - 1.5, 10, 3, H - 20);
    // Kugeln
    const k = aktuelleSilbe(t), aktiv = k >= 0 && t <= silben[k].ende + 0.12 ? k : -1;
    for (let i = 0; i < silben.length; i++) {
      const s = silben[i], el = kEls[i];
      const sichtbar = s.ende >= t1 - 0.3 && s.t <= t2 + 0.3;
      if (!sichtbar) { if (el.style.opacity !== '0') el.style.opacity = '0'; continue; }
      const x = x0 + (s.t - t) * PX, y = s.midi != null ? yVon(s.midi) : H / 2, sc = i === aktiv ? 1.35 : 1;
      el.style.transform = `translate3d(${(x - 23).toFixed(1)}px, ${(y - 23).toFixed(1)}px, 0) scale(${sc})`;
      el.style.opacity = '';
      el.classList.toggle('jetzt', i === aktiv); el.classList.toggle('war', s.ende < t && i !== aktiv);
    }
    // Karte „jetzt / nächste“ (nur bei Wechsel neu)
    const nk = aktiv >= 0 ? aktiv : k + 1;
    if (nk !== aktivK) {
      aktivK = nk;
      const s = silben[nk], n = silben[nk + 1];
      grossK.replaceChildren(s ? kugel(s, 'gross' + (aktiv >= 0 ? ' jetzt' : '')) : '');
      grossT.textContent = s ? (s.gesprochen ? `${s.text} (gesprochen)` : s.text) : 'Ende';
      kleinK.replaceChildren(n ? kugel(n, 'klein') : ''); kleinT.textContent = n ? n.text : '';
      const z = s ? zeilen.find((zz) => zz.id === s.zeile) : null;
      if (z) {
        const idx = z.silben.findIndex((x) => x.t === s.t);
        zeileText.replaceChildren(...z.silben.map((x, i) => (i === idx && aktiv >= 0 ? h('b', null, x.text) : x.text + '')).flatMap((x, i, arr) => {
          const ss = z.silben[i]; return i < arr.length - 1 && ss.wortende !== false ? [x, ' '] : [x];
        }));
      } else zeileText.textContent = '';
      // Zeilenende → Zusammenfassung im Vokal-Spiegel
      const zid = s ? s.zeile : null;
      if (letzteZeile && zid !== letzteZeile && spiegel && spiegel.laeuft) spiegel.zeileFertig(letzteZeile);
      letzteZeile = zid;
    }
  }
  function schleifeRaf() {
    if (zu) return;
    if (!wurzel.isConnected) { schliesse(); return; }
    zeichne();
    raf = requestAnimationFrame(schleifeRaf);
  }
  const beiGroesse = () => { W = 0; };
  window.addEventListener('resize', beiGroesse);
  function schliesse() {
    zu = true; cancelAnimationFrame(raf); stoppeQuellen(); spielt = false;
    window.removeEventListener('resize', beiGroesse);
    if (spiegel) spiegel.stopp(); if (mikroStopp) mikroStopp();
    if (ctx) { try { ctx.close(); } catch (e) { /* nichts */ } }
  }
  raf = requestAnimationFrame(schleifeRaf);
  lade();
  return { schliesse, get zeit() { return liedZeit(); }, get bereit() { return !!bufInst; } };
}
