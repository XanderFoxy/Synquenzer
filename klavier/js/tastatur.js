// js/tastatur.js – 88-Tasten-Klaviatur (DOM, horizontal scrollbar, deutsche Tastennamen)
import { rollenFarbe, ROLLEN_KURZ, ROLLEN_FARBEN, notenName } from './akkorde.js';

const SCHWARZ = new Set([1, 3, 6, 8, 10]);
const VERSATZ = { 1: -0.08, 3: 0.08, 6: -0.1, 8: 0, 10: 0.1 }; // natürliche Lage der schwarzen Tasten
const SCHWARZ_NAME = { 1: ['Cis', 'Des'], 3: ['Dis', 'Es'], 6: ['Fis', 'Ges'], 8: ['Gis', 'As'], 10: ['Ais', 'B'] };
const ruhig = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };

const STIL = `
.kl-tastatur{--kl-w:44px;--kl-h:156px;--kl-sw:calc(var(--kl-w)*.62);--kl-sh:calc(var(--kl-h)*.62);
 --kl-weiss1:#ffffff;--kl-weiss2:#eef0f3;--kl-rand:#c7cbd1;--kl-schwarz1:#3a3f47;--kl-schwarz2:#14161a;--kl-name:#7a818b;--kl-grund:transparent;
 position:relative;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;touch-action:pan-x;overscroll-behavior-x:contain;
 user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;
 background:var(--kl-grund);border-radius:14px;scrollbar-width:thin;contain:layout paint}
.kl-tasten{position:relative;height:var(--kl-h);margin-top:18px}
.kl-taste{position:absolute;top:0;box-sizing:border-box;cursor:pointer;transition:transform .09s ease}
.kl-w{width:var(--kl-w);height:100%;background:linear-gradient(var(--kl-weiss1),var(--kl-weiss2));border:1px solid var(--kl-rand);border-top:0;border-radius:0 0 9px 9px;z-index:1}
.kl-s{width:var(--kl-sw);height:var(--kl-sh);background:linear-gradient(var(--kl-schwarz1),var(--kl-schwarz2));border-radius:0 0 7px 7px;z-index:2;box-shadow:0 2px 3px rgba(0,0,0,.35)}
.kl-taste::before{content:'';position:absolute;inset:0;border-radius:inherit;background:var(--kl-kf,#9aa0a6);opacity:0;transition:opacity .2s ease}
.kl-w.kl-an::before{opacity:.22}.kl-s.kl-an::before{opacity:.5}
.kl-taste::after{content:'';position:absolute;inset:0;border-radius:inherit;background:var(--kl-lf,#3b82f6);opacity:0;transition:opacity .35s ease}
.kl-leuchtet::after{opacity:.62;transition-duration:.03s}
.kl-gedrueckt,.kl-leuchtet{transform:translateY(2px)}
.kl-punkt{position:absolute;left:50%;width:26px;height:26px;margin-left:-13px;border-radius:50%;background:var(--kl-kf,#9aa0a6);color:#fff;
 font:700 13px/26px system-ui,-apple-system,sans-serif;text-align:center;opacity:0;transform:scale(.5);transition:opacity .2s ease,transform .2s ease;pointer-events:none;box-shadow:0 1px 3px rgba(0,0,0,.25)}
.kl-w .kl-punkt{bottom:30px}.kl-s .kl-punkt{bottom:8px;width:22px;height:22px;margin-left:-11px;line-height:22px;font-size:12px}
.kl-an .kl-punkt{opacity:1;transform:scale(1)}
.kl-name{position:absolute;left:0;right:0;bottom:7px;text-align:center;font:600 11px/1 system-ui,-apple-system,sans-serif;color:var(--kl-name);pointer-events:none}
.kl-s .kl-name{bottom:auto;top:6px;color:#c9ced6;font-size:9px;line-height:1.15;font-weight:500}
.kl-tastatur[data-namen="aus"] .kl-name,.kl-tastatur[data-namen="c"] .kl-name:not(.kl-c),.kl-tastatur[data-namen="c"] .kl-s .kl-name{display:none}
.kl-mitte .kl-name{color:#3b82f6}
.kl-iv{position:absolute;left:3px;right:3px;bottom:5px;height:17px;border-radius:9px;background:var(--kl-ivf,#5b5bd6);color:#fff;
 font:700 10px/17px system-ui,-apple-system,sans-serif;text-align:center;white-space:nowrap;overflow:hidden;letter-spacing:-.01em;pointer-events:none;
 opacity:0;transform:translateY(5px);transition:opacity .2s ease,transform .2s ease;box-shadow:0 1px 3px rgba(0,0,0,.25)}
.kl-s .kl-iv{left:-8px;right:-8px;bottom:34px;height:15px;font-size:9px;line-height:15px;border-radius:7px;overflow:visible}
.kl-iv.kl-zeigt{opacity:1;transform:none}
.kl-mit-iv .kl-name{opacity:0}
.kl-bezug{box-shadow:inset 0 0 0 3px var(--kl-ivf,#5b5bd6)}
.kl-band{position:absolute;top:-16px;height:12px;border-radius:6px;background:var(--kl-bf,#3b82f6);opacity:.22;pointer-events:none}
.kl-bandtext{position:absolute;top:-17px;font:600 10px/14px system-ui,-apple-system,sans-serif;color:var(--kl-name);white-space:nowrap;pointer-events:none;padding-left:6px}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]):not([data-theme="hell"]) .kl-tastatur{--kl-weiss1:#e9ebee;--kl-weiss2:#d4d8de;--kl-rand:#8b929c;--kl-schwarz1:#2a2e35;--kl-schwarz2:#07080a;--kl-name:#5b626c}}
:root[data-theme="dark"] .kl-tastatur,:root[data-theme="dunkel"] .kl-tastatur{--kl-weiss1:#e9ebee;--kl-weiss2:#d4d8de;--kl-rand:#8b929c;--kl-schwarz1:#2a2e35;--kl-schwarz2:#07080a;--kl-name:#5b626c}
@media (prefers-reduced-motion:reduce){.kl-taste,.kl-taste::before,.kl-taste::after,.kl-punkt,.kl-iv{transition:none!important}.kl-gedrueckt,.kl-leuchtet{transform:none}}
`;
function stilEinfuegen() {
  if (typeof document === 'undefined' || document.getElementById('kl-tastatur-stil')) return;
  const s = document.createElement('style'); s.id = 'kl-tastatur-stil'; s.textContent = STIL; document.head.appendChild(s);
}
const farbeAus = (x) => (x && (x in ROLLEN_FARBEN.hell) ? rollenFarbe(x) : x || rollenFarbe('fremd'));

/**
 * @param {HTMLElement} el
 * @param {{von?:number, bis?:number, namen?:'c'|'alle'|'aus', breite?:number, hoehe?:number, sofort?:boolean, beiTipp?:(midi:number)=>void}} opt
 */
export function tastatur(el, opt = {}) {
  stilEinfuegen();
  const von = opt.von ?? 21, bis = opt.bis ?? 108;
  el.classList.add('kl-tastatur');
  el.dataset.namen = opt.namen || 'c';
  if (opt.breite) el.style.setProperty('--kl-w', opt.breite + 'px');
  if (opt.hoehe) el.style.setProperty('--kl-h', opt.hoehe + 'px');
  el.setAttribute('role', 'group'); el.setAttribute('aria-label', 'Klaviertastatur');
  el.textContent = '';
  const innen = document.createElement('div'); innen.className = 'kl-tasten';
  const tasten = new Map();
  let weisse = 0;
  const frag = document.createDocumentFragment();
  for (let m = von; m <= bis; m++) {
    const pc = m % 12, s = SCHWARZ.has(pc);
    const t = document.createElement('div');
    t.className = 'kl-taste ' + (s ? 'kl-s' : 'kl-w') + (m === 60 ? ' kl-mitte' : '');
    t.dataset.midi = m;
    t.setAttribute('role', 'button');
    const name = s ? SCHWARZ_NAME[pc].join('/') : notenName(m);
    t.setAttribute('aria-label', s ? `${name} (${notenName(m)})` : name);
    if (s) t.style.left = `calc(${weisse + VERSATZ[pc]} * var(--kl-w) - var(--kl-sw) / 2)`;
    else { t.style.left = `calc(${weisse} * var(--kl-w))`; weisse++; }
    const n = document.createElement('span');
    n.className = 'kl-name' + (pc === 0 ? ' kl-c' : '');
    if (s) n.innerHTML = SCHWARZ_NAME[pc].join('<br>'); else n.textContent = notenName(m);
    const p = document.createElement('span'); p.className = 'kl-punkt';
    const iv = document.createElement('span'); iv.className = 'kl-iv'; iv.setAttribute('aria-hidden', 'true');
    t.append(n, p, iv);
    frag.appendChild(t);
    tasten.set(m, t);
  }
  innen.style.width = `calc(${weisse} * var(--kl-w))`;
  innen.appendChild(frag);
  el.appendChild(innen);

  // Tippen: sofort (spielen) oder erst beim Loslassen, damit Wischen zum Scrollen nicht als Tipp zählt
  let druck = null;
  const tasteAus = (e) => e.target.closest && e.target.closest('.kl-taste');
  innen.addEventListener('pointerdown', (e) => {
    const t = tasteAus(e); if (!t) return;
    druck = { t, x: e.clientX, y: e.clientY, sl: el.scrollLeft };
    t.classList.add('kl-gedrueckt');
    if (opt.sofort) opt.beiTipp && opt.beiTipp(+t.dataset.midi);
  });
  const ende = (e, gilt) => {
    if (!druck) return;
    const d = druck; druck = null;
    d.t.classList.remove('kl-gedrueckt');
    if (!gilt || opt.sofort) return;
    const bewegt = Math.abs(e.clientX - d.x) > 10 || Math.abs(el.scrollLeft - d.sl) > 4;
    if (!bewegt) opt.beiTipp && opt.beiTipp(+d.t.dataset.midi);
  };
  innen.addEventListener('pointerup', (e) => ende(e, true));
  innen.addEventListener('pointercancel', (e) => ende(e, false));
  innen.addEventListener('pointerleave', (e) => ende(e, false));
  innen.addEventListener('contextmenu', (e) => e.preventDefault());

  const an = new Set(), ivAn = new Set();
  const timer = new Map();
  let band = [];

  const api = {
    el, von, bis,
    /** Tasten markieren: farben = Map|Objekt midi → Rolle ('grundton' …) oder CSS-Farbe; Text optional über beschriftung */
    zeige(midiSet, farben, beschriftung) {
      for (const m of an) { const t = tasten.get(m); if (t) t.classList.remove('kl-an'); }
      an.clear();
      for (const m of midiSet || []) {
        const t = tasten.get(m); if (!t) continue;
        const f = farben ? (farben.get ? farben.get(m) : farben[m]) : null;
        t.style.setProperty('--kl-kf', farbeAus(f));
        const txt = beschriftung ? (beschriftung.get ? beschriftung.get(m) : beschriftung[m]) : ROLLEN_KURZ[f];
        t.querySelector('.kl-punkt').textContent = txt ?? '';
        t.classList.add('kl-an');
        an.add(m);
      }
    },
    /** kurz aufleuchten (Wiedergabe/Tipp). ms = 0: bleibt an bis aus(midi) */
    leuchte(midi, rolle, ms = 320) {
      const t = tasten.get(midi); if (!t) return;
      t.style.setProperty('--kl-lf', farbeAus(rolle || 'septime'));
      t.classList.remove('kl-leuchtet'); void t.offsetWidth; t.classList.add('kl-leuchtet');
      clearTimeout(timer.get(midi));
      if (ms > 0) timer.set(midi, setTimeout(() => t.classList.remove('kl-leuchtet'), ms));
    },
    aus(midi) { const t = tasten.get(midi); if (t) t.classList.remove('kl-leuchtet'); clearTimeout(timer.get(midi)); },
    alleAus() { for (const t of tasten.values()) t.classList.remove('kl-leuchtet'); },
    scrolleZu(midi, sanft = true) {
      const t = tasten.get(midi); if (!t) return;
      const links = t.offsetLeft + t.offsetWidth / 2 - el.clientWidth / 2;
      el.scrollTo({ left: Math.max(0, links), behavior: sanft && !ruhig() ? 'smooth' : 'auto' });
    },
    /** Bereich mittig zeigen (z. B. tiefster bis höchster Ton eines Akkords) */
    scrolleZuBereich(a, b, sanft = true) {
      const ta = tasten.get(a), tb = tasten.get(b); if (!ta || !tb) return;
      const mitte = (ta.offsetLeft + tb.offsetLeft + tb.offsetWidth) / 2;
      el.scrollTo({ left: Math.max(0, mitte - el.clientWidth / 2), behavior: sanft && !ruhig() ? 'smooth' : 'auto' });
    },
    /** farbiges Band über den Tasten, z. B. zeigeBereich(43, 57, 'Bassschlüssel') */
    zeigeBereich(a, b, text = '', farbe = '#3b82f6') {
      band.forEach((x) => x.remove()); band = [];
      const ta = tasten.get(a), tb = tasten.get(b); if (!ta || !tb) return;
      const d = document.createElement('div'); d.className = 'kl-band';
      d.style.left = ta.offsetLeft + 'px'; d.style.width = (tb.offsetLeft + tb.offsetWidth - ta.offsetLeft) + 'px';
      d.style.setProperty('--kl-bf', farbe);
      const s = document.createElement('div'); s.className = 'kl-bandtext'; s.textContent = text; s.style.left = ta.offsetLeft + 'px';
      innen.append(d, s); band = [d, s];
    },
    /** Intervall-Schilder: texte = Map midi → kurzer Text (z. B. „gr. 3“), bezug = midi des Bezugstons (Rahmen + „Bezug“). */
    intervalle(texte, bezug) {
      for (const m of ivAn) { const t = tasten.get(m); if (!t) continue; t.querySelector('.kl-iv').classList.remove('kl-zeigt'); t.classList.remove('kl-bezug', 'kl-mit-iv'); }
      ivAn.clear();
      const setze = (m, txt) => {
        const t = tasten.get(m); if (!t) return;
        const s = t.querySelector('.kl-iv'); s.textContent = txt; s.classList.add('kl-zeigt'); t.classList.add('kl-mit-iv');
        ivAn.add(m);
      };
      if (texte) for (const [m, txt] of (texte.entries ? texte.entries() : Object.entries(texte))) setze(+m, txt);
      if (bezug != null && tasten.get(bezug)) { setze(bezug, 'Bezug'); tasten.get(bezug).classList.add('kl-bezug'); }
    },
    setNamen(modus) { el.dataset.namen = modus; },
    taste: (midi) => tasten.get(midi),
  };
  return api;
}
