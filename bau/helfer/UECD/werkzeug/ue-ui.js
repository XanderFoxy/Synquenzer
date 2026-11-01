/* ---------- Bedienung (UE-Kern minimal – beim Merge durch UE-A/UE-B ersetzt: Leiste, Ziehen, Chips; UE-D: Break-/Einwurf-Blatt) ---------- */
const UE_CSS = `
#songView{position:relative}
.sv-cw > .sv-ue{position:absolute;right:6px;bottom:6px;z-index:4;width:54px;height:44px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:0 2px;color:var(--amber,#ffb22e);opacity:.92}
.sv-cw > .sv-ue .d{font-size:13px;line-height:1}.sv-cw > .sv-ue .t{font:700 8px/1 var(--font-ui);letter-spacing:.04em;color:var(--text,#ece8df)}
.sv-cw > .sv-ue[hidden]{display:none}
.ue-bar{position:absolute;right:8px;bottom:4px;z-index:6;border-radius:8px;background:var(--chassis,#15171b);border-top:1px solid var(--line,#2d323c);touch-action:none;
  box-shadow:0 -6px 18px rgba(0,0,0,.45);display:flex;flex-direction:column}
.ue-bar[hidden]{display:none}
.ue-tabs{display:flex;gap:4px;padding:4px 6px 0;align-items:center}
.ue-tabs button{height:44px;min-width:44px;padding:0 12px;font:700 13px/1 var(--font-ui);color:var(--text-dim,#9aa0aa);background:none;border:0;border-bottom:2px solid transparent}
.ue-tabs button.on{color:var(--amber,#ffb22e);border-bottom-color:var(--amber,#ffb22e)}
.ue-tabs .ue-x{margin-left:auto;font-size:16px;color:var(--text,#ece8df)}
.ue-row{display:flex;gap:6px;padding:6px;overflow:hidden;white-space:nowrap}
.ue-tile{flex:0 0 auto;width:96px;height:78px;border-radius:8px;background:var(--chassis-2,#1c1f25);border:1px solid var(--line,#2d323c);color:var(--text,#ece8df);
  display:flex;flex-direction:column;align-items:stretch;justify-content:space-between;padding:5px 6px;font:600 11px/1.15 var(--font-ui);text-align:left;user-select:none;-webkit-user-select:none}
.ue-tile.held{border-color:var(--amber,#ffb22e)}
.ue-tile > span:first-child{white-space:normal;overflow-wrap:anywhere;line-height:1.1}
.ue-tile svg{width:100%;height:30px;display:block}
.ue-bar.one{flex-direction:row;align-items:stretch}
.ue-bar.one .ue-tabs{padding:4px 0 4px 4px;flex:0 0 auto}
.ue-bar.one .ue-tabs button{padding:0 7px;font-size:12px}
.ue-bar.one .ue-row{flex:1 1 auto;padding:4px}
.ue-bar.one .ue-tile{height:52px;width:88px;padding:3px 5px}
.ue-bar.one .ue-tile svg{height:14px}
.ue-bar.one .ue-tile .ue-l{display:none}
.ue-bar.one .ue-tile > span:first-child{font-size:10.5px}
.ue-bar.one .ue-tabs .ue-x{order:9;margin-left:0}
.ue-bar.one > .ue-x{flex:0 0 44px}
.ue-tile .ue-l{color:var(--text-dim,#9aa0aa);font:600 10px/1 var(--font-num)}
.ue-ghost{position:fixed;z-index:60;pointer-events:none;opacity:.9;transform:translate(-50%,-110%);transition:none}
.ue-ghost.back{transition:left .22s ease-in,top .22s ease-in,opacity .22s}
.pop.ue-pop{max-width:min(380px,calc(100vw - 16px))}
.pop.ue-pop .seg button{min-height:44px;min-width:44px}
.pop.ue-pop .ue-trk{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}
.pop.ue-pop .ue-trk button{min-height:44px;min-width:56px;padding:0 10px;font:600 12px/1 var(--font-ui)}
.pop.ue-pop .ue-trk button.on{border-color:var(--amber,#ffb22e);color:var(--amber,#ffb22e)}
.pop.ue-pop .ue-act{display:flex;gap:6px;margin-top:8px}
.pop.ue-pop .ue-act button{flex:1 1 0;min-height:44px}
.pop.ue-pop .ue-k{font:600 11px/1.3 var(--font-ui);color:var(--text-dim,#9aa0aa);margin:4px 0}`;
function ueCssOnce() { if (UE.css) return; UE.css = true; const s = document.createElement('style'); s.textContent = UE_CSS; document.head.appendChild(s); }
// Mini-Schrittbild einer Kachel (SVG, eine Zeile je Instrument; gezeichnete Formen, kein Emoji)
const UE_ROWS = [49, 46, 42, 50, 47, 45, 37, 39, 38, 36];
function ueSvg(w) {
  const L = Math.max(1, w.lens[0]), ns = w.k === 'break' ? [] : ueGen(w, w.lens[0], 1, 'gleich');
  const used = UE_ROWS.filter(g => ns.some(n => n.n === g)), H = 30, rh = used.length ? Math.min(7, H / used.length) : 7, W = 84, span = L + (ns.some(n => n.t >= L - 1e-9) ? .25 : 0);
  let s = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true"><rect x="0" y="0" width="${W}" height="${H}" rx="3" fill="rgba(255,255,255,.04)"/>`;
  if (w.k === 'break') s += `<rect x="6" y="6" width="${W - 12}" height="${H - 12}" fill="none" stroke="#ffb22e" stroke-dasharray="3 3"/><rect x="${W / 2 - 7}" y="9" width="4" height="12" fill="#ffb22e"/><rect x="${W / 2 + 3}" y="9" width="4" height="12" fill="#ffb22e"/>`;
  for (const n of ns) { const r = used.indexOf(n.n), x = 2 + (span > 0 ? n.t / span : 0) * (W - 8), y = (H - used.length * rh) / 2 + r * rh; s += `<rect x="${x.toFixed(1)}" y="${(y + .5).toFixed(1)}" width="${n.r ? 4 : 3}" height="${(rh - 1).toFixed(1)}" rx="1" fill="${n.n === 49 ? '#ffb22e' : n.a ? '#ece8df' : '#9aa0aa'}" opacity="${(.45 + .55 * n.v).toFixed(2)}"/>`; }
  return s + '</svg>';
}
function ueToggle(on) {
  on = on == null ? !UE.open : !!on;
  if (on && !UE.el) ueBuildBar();
  UE.open = on; if (UE.el) UE.el.hidden = !on;
  if (SV.btn && SV.btn.bUe) SV.btn.bUe.hidden = on;
  ueBarPlace();
  if (!on) ueDragEnd(null);
  UI.dirty.song = true;
  return on;
}
// die Leiste liegt unten über dem Song-Bereich (rechts der Transport-Spalte); die Song-Zeilen rücken über sie (padding der .sv-body),
// die Tastatur bleibt sichtbar. Kleine Höhe (< 360 px Song-Bereich) oder quer: eine Zeile (Reiter links, Kacheln daneben)
function ueBarPlace() {
  const body = EL.songView && EL.songView.querySelector('.sv-body'); if (!body) return;
  if (!UE.open || !UE.el) { UE.padH = 0; if (body.style.paddingBottom) { body.style.paddingBottom = ''; } return; }
  body.style.paddingBottom = '';
  const one = body.getBoundingClientRect().height < 360 || EL.songView.classList.contains('side');
  UE.el.classList.toggle('one', one);
  UE.el.style.left = body.offsetLeft + 'px';
  UE.padH = UE.el.offsetHeight + 4; body.style.paddingBottom = UE.padH + 'px';
}
function ueBuildBar() {
  ueCssOnce();
  const b = el('div', 'ue-bar'), tabs = el('div', 'ue-tabs'), row = el('div', 'ue-row');
  for (const [k, l] of UE_TABS) { const t = el('button', 'rb' + (UE.tab === k ? ' on' : ''), l); t.dataset.tab = k; tabs.appendChild(t); }
  const x = el('button', 'rb ue-x', '✕︎'); x.setAttribute('aria-label', 'Übergänge schließen'); tabs.appendChild(x);
  onTap(tabs, t => { if (t.classList.contains('ue-x')) { ueToggle(false); return; } UE.tab = t.dataset.tab; for (const c of tabs.children) c.classList.toggle('on', c === t); ueFillRow(); haptic('tick'); }, 'button');
  b.append(tabs, row); guardTouch(b);
  b.addEventListener('pointerdown', e => e.stopPropagation());
  UE.el = b; UE.row = row; EL.songView.appendChild(b);
  if (!UE.rs) { UE.rs = true; window.addEventListener('resize', () => requestAnimationFrame(ueBarPlace)); }
  ueFillRow(); ueBindRow(row);
}
function ueFillRow() {
  const row = UE.row; if (!row) return; row.innerHTML = ''; row.scrollLeft = 0;
  for (const w of UE_WERK) if (w.tab === UE.tab) {
    const t = el('div', 'ue-tile', `<span>${esc(w.name)}</span>${ueSvg(w)}<span class="ue-l">${w.lens.map(L => UE_LENT[L] || L / 4).join(' · ')}${w.lens[0] ? ' T' : ''}</span>`);
    t.dataset.src = w.id; t.setAttribute('role', 'button'); t.setAttribute('aria-label', w.name + ' – antippen: vorhören, halten und ziehen: ablegen'); row.appendChild(t);
  }
}
// Kachelreihe: waagerecht wischen = blättern; Tipp = vorhören; halten (300 ms) und ziehen = ablegen (Geist folgt dem Finger)
function ueBindRow(row) {
  let st = null;
  row.addEventListener('pointerdown', e => {
    const t = e.target.closest('.ue-tile'); if (!t || e.button > 0) return;
    try { row.setPointerCapture(e.pointerId); } catch (_) {}
    const me = st = {id: e.pointerId, t, x0: e.clientX, y0: e.clientY, sl: row.scrollLeft, mode: null};
    me.timer = setTimeout(() => { if (st === me && !me.mode) { me.mode = 'drag'; t.classList.add('held'); haptic('pop'); ueDragStart(t.dataset.src, e.clientX, e.clientY, t); } }, 300);
  });
  row.addEventListener('pointermove', e => {
    if (!st || e.pointerId !== st.id) return;
    const dx = e.clientX - st.x0, dy = e.clientY - st.y0;
    if (!st.mode && Math.hypot(dx, dy) > 10) { clearTimeout(st.timer); st.mode = Math.abs(dx) >= Math.abs(dy) ? 'scroll' : 'drag'; if (st.mode === 'drag') { st.t.classList.add('held'); ueDragStart(st.t.dataset.src, e.clientX, e.clientY, st.t); } }
    if (st.mode === 'scroll') row.scrollLeft = st.sl - dx;
    else if (st.mode === 'drag') ueDragMove(e.clientX, e.clientY);
  });
  const end = e => {
    if (!st || e.pointerId !== st.id) return;
    const s = st; st = null; clearTimeout(s.timer); s.t.classList.remove('held');
    if (s.mode === 'drag') { ueDragEnd(e.type === 'pointerup' ? {x: e.clientX, y: e.clientY} : null); return; }
    if (!s.mode && e.type === 'pointerup') { uePreview(s.t.dataset.src); haptic('tick'); }
  };
  row.addEventListener('pointerup', end); row.addEventListener('pointercancel', end);
}
// Ziel unter dem Finger: Kante im Fangbereich ±½ Takt (amber) bzw. freier Song-Schlag auf 1/16 (Einwurf, Break in einem Teil)
function ueTargetAt(src, cx, cy, moveId) {
  const song = S.song, w = ueWerk(src) || (moveId && ueWerk((ueGet(moveId) || {}).src)), wr = SV.wrap; if (!song || !w || !wr || !song.bars) return null;
  const r = wr.getBoundingClientRect(), bar = UE.el && !UE.el.hidden ? UE.el.getBoundingClientRect().top : r.bottom;
  if (cx < r.left || cx > r.right || cy < r.top + SV.rulerH || cy > Math.min(r.bottom, bar)) return null;
  const beat = (cx - r.left + SV.x) / SV.cellW * 4, u = moveId ? ueGet(moveId) : null, adl = u ? u.k === 'adlib' : w.tab === 'adl';
  if (!adl) {
    let best = null, bd = UE_SNAP + 1e-9;
    for (const m of ueEdgeMarks(song)) { const d = Math.abs(beat - m.a * 4); if (d <= bd) { bd = d; best = m; } }
    if (best) return {m: best.id, edge: best.a * 4};
    if (w.k !== 'break') return null;
  }
  const at = Math.round(beat * 4) / 4; if (at < 0 || at >= song.bars * 4) return null;
  return {at};
}
function ueDragStart(src, x, y, tile, moveId) {
  ueCssOnce();
  const w = ueWerk(src); if (!w) return;
  const g = el('div', 'ue-tile ue-ghost', tile ? tile.innerHTML : `<span>${esc(w.name)}</span>${ueSvg(w)}`);
  document.body.appendChild(g);
  const r0 = tile ? tile.getBoundingClientRect() : null;
  UE.drag = {src, w, g, home: r0 ? {x: r0.left + r0.width / 2, y: r0.top + r0.height} : {x, y}, tgt: null, moveId: moveId || null};
  ueDragMove(x, y);
}
function ueDragMove(x, y) {
  const d = UE.drag; if (!d) return;
  d.g.style.left = x + 'px'; d.g.style.top = y + 'px';
  const t = ueTargetAt(d.src, x, y, d.moveId), k = t ? (t.m || '') + ':' + (t.at != null ? t.at : '') : '';
  if (k !== d.k) { d.k = k; if (t && t.m) haptic('tick'); }
  d.tgt = t; UI.dirty.song = true; svDraw(true);                  // im selben Bild sichtbar (UE-09)
}
// Loslassen: auf einem Ziel ablegen (1 Undo); daneben: der Geist fliegt zurück, nichts ändert sich
function ueDragEnd(p) {
  const d = UE.drag; if (!d) return null;
  UE.drag = null; UI.dirty.song = true;
  let id = null;
  if (p) {
    const t = ueTargetAt(d.src, p.x, p.y, d.moveId);
    if (t) { if (d.moveId) { if (ueMove(d.moveId, t)) id = d.moveId; } else id = ueAdd(d.src, t.m ? {m: t.m} : {at: t.at}); }
    else if (d.moveId && ueOutside(p.x, p.y)) { const u = ueGet(d.moveId); if (u && ueDel(d.moveId)) toast((ueWerk(u.src) || {name: 'Übergang'}).name + ' entfernt', {label: '↶ Rückgängig', fn: () => undo()}); d.g.remove(); svDraw(true); return null; }
  }
  if (id) { d.g.remove(); haptic('pop'); }
  else { const g = d.g; g.classList.add('back'); requestAnimationFrame(() => { g.style.left = d.home.x + 'px'; g.style.top = d.home.y + 'px'; g.style.opacity = '0'; }); setTimeout(() => g.remove(), 260); }
  svDraw(true);
  return id;
}
// ein Chip, der aus dem Song gezogen wird (über die Leiste oder aus der Song-Fläche hinaus), wird gelöscht
function ueOutside(x, y) { const wr = SV.wrap; if (!wr) return true; const r = wr.getBoundingClientRect(), bar = UE.el && !UE.el.hidden ? UE.el.getBoundingClientRect().top : r.bottom; return x < r.left || x > r.right || y < r.top || y > bar; }
/* ---------- Zeichnen in der Song-Fläche (svDraw): Chips in der Drum-Zeile, schraffierte Bereiche, Einrasten ---------- */
function ueHatch(g, x0, x1, y, h, col) {
  if (x1 <= x0) return; g.save(); g.beginPath(); g.rect(x0, y, x1 - x0, h); g.clip();
  g.strokeStyle = col; g.lineWidth = 1.5; g.beginPath(); for (let x = x0 - h; x < x1 + h; x += 6) { g.moveTo(x, y + h); g.lineTo(x + h, y); } g.stroke(); g.restore();
}
function ueDraw(g, song, XB, W, H, ru, rh) {
  g.save(); try { ueDraw0(g, song, XB, W, H, ru, rh); } finally { g.restore(); }   // Schrift/Ausrichtung des Song-Bilds bleiben
}
function ueDraw0(g, song, XB, W, H, ru, rh) {
  UE.chips = [];
  const rd = SV.rows.indexOf(DRUM_T), d = UE.drag;
  if (song.ue && rd >= 0 && !UI.svGlass) {
    const y = ru + rd * rh;
    g.font = '700 10px ' + (SV.uiFont || (SV.uiFont = getComputedStyle(document.body).getPropertyValue('--font-ui') || 'sans-serif'));
    for (const u of song.ue) {
      const A = ueAnchor(song, u); if (A == null) continue;
      const s = A + u.a, e = s + u.len, x0 = XB(s), x1 = XB(e), w = ueWerk(u.src);
      if (x1 < -60 || x0 > W + 60) continue;
      if (u.k === 'break') { for (const i of u.stop || []) { const r = SV.rows.indexOf(i); if (r >= 0) { g.fillStyle = 'rgba(11,12,15,.55)'; g.fillRect(x0, ru + r * rh, x1 - x0, rh); ueHatch(g, x0, x1, ru + r * rh, rh, 'rgba(255,178,46,.35)'); } } }
      else if (u.len > 0) ueHatch(g, x0, x1, y + 1, rh - 2, u.mode === 'ersetzt' ? 'rgba(255,178,46,.45)' : 'rgba(255,178,46,.22)');
      const lab = (u.k === 'break' ? '‖ ' : u.k === 'adlib' ? '● ' : '◆ ') + (w ? w.sh : u.k) + (u.m != null && u.k !== 'break' ? ' ' + UE_ARR[ueDirOf(song, u)] : '');
      const tw = g.measureText(lab).width + 10, ch = Math.min(rh - 4, 18), cy = y + (rh - ch) / 2;
      const cx = u.m != null && u.k !== 'break' ? Math.max(x0, XB(A) - tw) : x0;
      g.fillStyle = u.id === UE.sel ? '#ffb22e' : '#2a2416'; g.strokeStyle = '#ffb22e'; g.lineWidth = 1;
      g.beginPath(); if (g.roundRect) g.roundRect(cx, cy, tw, ch, 4); else g.rect(cx, cy, tw, ch); g.fill(); g.stroke();
      g.fillStyle = u.id === UE.sel ? '#111' : '#ffd27a'; g.textAlign = 'left'; g.fillText(lab, cx + 5, cy + ch / 2); g.textAlign = 'center';
      // Trefferfläche ≥ 44 × 44 (UE-07)
      const hx = cx + tw / 2, hy = cy + ch / 2, hw = Math.max(44, tw), hh = Math.max(44, ch);
      UE.chips.push({id: u.id, lab, x0: hx - hw / 2, x1: hx + hw / 2, y0: hy - hh / 2, y1: hy + hh / 2});
    }
  }
  // Einrasten beim Ziehen: amber Kante + Schraffur der betroffenen Schläge
  if (d && d.tgt) {
    const w = d.moveId ? ueWerk((ueGet(d.moveId) || {}).src) : d.w, u = d.moveId ? ueGet(d.moveId) : null, L = u ? u.len : w ? w.lens[0] : 0;
    if (d.tgt.m) { const x = XB(d.tgt.edge), s = w && w.k === 'crash' ? d.tgt.edge : d.tgt.edge - L; g.fillStyle = '#ffb22e'; g.fillRect(x - 1.5, ru, 3, H - ru); g.save(); g.shadowColor = 'rgba(255,178,46,.8)'; g.shadowBlur = 8; g.fillRect(x - 1, ru, 2, H - ru); g.restore(); ueHatch(g, XB(s), x, ru, H - ru, 'rgba(255,178,46,.4)'); }
    else { const x = XB(d.tgt.at); g.fillStyle = 'rgba(255,178,46,.9)'; g.fillRect(x - 1, ru, 2, H - ru); ueHatch(g, x, XB(d.tgt.at + Math.max(L, .25)), ru, H - ru, 'rgba(255,178,46,.35)'); }
  }
}
function ueChipAt(x, y) { for (let k = UE.chips.length - 1; k >= 0; k--) { const c = UE.chips[k]; if (x >= c.x0 && x <= c.x1 && y >= c.y0 && y <= c.y1) return c.id; } return null; }
/* ---------- Blatt (Tipp auf einen Chip): Länge, Dichte, Richtung, Modus; Break: Spuren + [Kick bleibt]; Entfernen ---------- */
function ueSheet(id) {
  const u = ueGet(id); if (!u) return false;
  const w = ueWerk(u.src), song = S.song; ueCssOnce();
  UE.sel = id; UI.dirty.song = true;
  openPop(null, p => {
    guardTouch(p); p.classList.add('ue-pop');
    const A = ueAnchor(song, u), m = u.m != null ? song.marks.find(x => x.id === u.m) : null;
    const where = m ? 'Kante vor ' + esc(markLabel(m)) : 'Takt ' + (Math.floor(A / 4) + 1) + ', Schlag ' + (+(A % 4 + 1).toFixed(2)).toString().replace('.', ',');
    const kit = esc((S.tracks[DRUM_T].sound && S.tracks[DRUM_T].sound.name) || 'Kit');
    let h = `<h4>${esc(w ? w.name : u.k)}</h4><div class="ue-k">${where}${u.k !== 'break' ? ' · Kit der Spur: ' + kit : ''}</div>`;
    if (w && w.lens.length > 1) h += segHTML('ueLen', w.lens.map(L => [L, ueLenTxt(L)]), u.len);
    if (u.k === 'break') {
      h += '<div class="ue-k">Diese Spuren schweigen:</div><div class="ue-trk">' + S.tracks.map((t, i) => `<button class="rb${(u.stop || []).includes(i) ? ' on' : ''}" data-tr="${i}" aria-pressed="${(u.stop || []).includes(i)}">${esc(svShort(i))}</button>`).join('') + '</div>';
      if ((u.stop || []).includes(DRUM_T)) h += `<div class="ue-trk"><button class="rb${u.mode === 'dazu' ? ' on' : ''}" data-kick="1" aria-pressed="${u.mode === 'dazu'}">Kick bleibt</button></div>`;
      h += '<div class="ue-k">Hall und Echo klingen natürlich aus.</div>';
    } else {
      h += segHTML('ueDens', UE_DENS.map((l, k) => [k, l]), u.dens);
      if (u.m != null && u.k !== 'adlib') h += segHTML('ueDir', [['auto', 'Auto ' + UE_ARR[ueDirOf(song, Object.assign({}, u, {dir: 'auto'}))]], ['auf', UE_ARR.auf + ' auf'], ['ab', UE_ARR.ab + ' ab']], u.dir);
      if (u.k !== 'adlib' && u.len > 0) h += segHTML('ueMode', [['ersetzt', 'ersetzt'], ['dazu', 'dazu']], u.mode);
    }
    h += `<div class="ue-act">${u.k !== 'break' ? '<button class="rb" data-a="hear">Anhören</button>' : ''}<button class="rb" data-a="del">Entfernen</button></div>`;
    p.innerHTML = h;
    const re = () => { if (UI.pop && UI.pop.name === 'ue') { closePop(); ueSheet(id); } };
    bindSeg(p, 'ueLen', v => { ueSet(id, {len: +v}, 'Länge'); re(); });
    bindSeg(p, 'ueDens', v => { ueSet(id, {dens: +v}, 'Dichte'); });
    bindSeg(p, 'ueDir', v => { ueSet(id, {dir: v}, 'Richtung'); });
    bindSeg(p, 'ueMode', v => { ueSet(id, {mode: v}, 'Modus ' + v); });
    onTap(p, b => {
      const x = ueGet(id); if (!x) { closePop(); return; }
      if (b.dataset.tr != null) { const i = +b.dataset.tr, s = new Set(x.stop || []); if (s.has(i)) s.delete(i); else s.add(i); ueSet(id, {stop: [...s]}, 'Break-Spuren'); re(); }
      else if (b.dataset.kick) { ueSet(id, {kick: x.mode !== 'dazu'}, 'Kick bleibt'); re(); }
      else if (b.dataset.a === 'hear') { const W = ueWerk(x.src); if (W) { ensureAudio(); const c = AU.ctx, t0 = c.currentTime + .008, sp = spb(); for (const nt of x.notes) for (const hh of DrumSeq.expandStep(nt, 0, 0)) drumHit(nt.n, hh.v, t0 + (nt.t + hh.beat) * sp, 'preview', hh.acc || hh.lk ? hh : null); } }
      else if (b.dataset.a === 'del') { closePop(); const nm = w ? w.name : 'Übergang'; if (ueDel(id)) toast(nm + ' entfernt', {label: '↶ Rückgängig', fn: () => undo()}); }
      haptic('tick');
    }, 'button[data-tr],button[data-kick],button[data-a]');
  }, {name: 'ue', onClose: () => { UE.sel = null; UI.dirty.song = true; }});
  return true;
}
// Song-Fläche: ein Chip unter dem Finger – Tipp = Blatt, halten (450 ms) und ziehen = verschieben / aus dem Song ziehen = löschen
function ueChipGesture(w, e, p) {
  const id = ueChipAt(p.x, p.y); if (!id) return false;
  const u = ueGet(id); if (!u) return false;
  try { w.setPointerCapture(e.pointerId); } catch (_) {}
  const st = {id: e.pointerId, x0: e.clientX, y0: e.clientY, mode: null};
  st.timer = setTimeout(() => { if (!st.mode) { st.mode = 'drag'; haptic('pop'); ueDragStart(u.src, e.clientX, e.clientY, null, id); UE.drag.home = {x: e.clientX, y: e.clientY}; } }, 450);
  const mv = ev => { if (ev.pointerId !== st.id) return; if (!st.mode && Math.hypot(ev.clientX - st.x0, ev.clientY - st.y0) > 10) { clearTimeout(st.timer); st.mode = 'none'; } if (st.mode === 'drag') ueDragMove(ev.clientX, ev.clientY); };
  const up = ev => {
    if (ev.pointerId !== st.id) return;
    clearTimeout(st.timer); w.removeEventListener('pointermove', mv, true); w.removeEventListener('pointerup', up, true); w.removeEventListener('pointercancel', up, true);
    if (st.mode === 'drag') ueDragEnd(ev.type === 'pointerup' ? {x: ev.clientX, y: ev.clientY} : null);
    else if (!st.mode && ev.type === 'pointerup') ueSheet(id);
    ev.stopPropagation();
  };
  w.addEventListener('pointermove', mv, true); w.addEventListener('pointerup', up, true); w.addEventListener('pointercancel', up, true);
  e.stopPropagation(); e.preventDefault();
  return true;
}
/* ---------- Test-API (UE-C/D) ---------- */
const UE_API = {
  ueLib: tab => UE_WERK.filter(w => !tab || w.tab === tab).map(w => ({id: w.id, tab: w.tab, name: w.name, k: w.k, lens: w.lens.slice(), mode: w.mode || null})),
  ueGen: (src, len, dens, dir) => { const w = ueWerk(src); return w ? ueGen(w, isNum(len) ? len : w.lens[0], dens == null ? 1 : dens, dir || 'gleich') : null; },
  ueAdd: (src, pl, o) => ueAdd(src, pl, o), ueSet: (id, p) => ueSet(id, p || {}), ueDel: id => ueDel(id), ueMove: (id, pl) => ueMove(id, pl),
  ueList: () => (S.song && S.song.ue ? deep(S.song.ue) : []),
  ueDir: id => { const u = ueGet(id); return u ? ueDirOf(S.song, u) : null; },
  uePreview: (src, o) => uePreview(src, o), uePrevT: () => UE.prevT,
  ueOpen: on => ueToggle(on), ueSheet: id => ueSheet(id),
  ueInfo: () => ({open: UE.open, tab: UE.tab, chips: UE.chips.map(c => Object.assign({}, c)), drag: UE.drag ? {src: UE.drag.src, tgt: UE.drag.tgt} : null, brk: (UE.brk || []).map(b => ({tr: [...b.tr], kick: b.kick, t0: b.t0, t1: b.t1})),
    gains: AU.tracks.map(A => (A && A.ueB ? A.ueB.gain.value : null))}),
  ueTab: k => { if (!UE_TABS.some(t => t[0] === k)) return false; UE.tab = k; if (UE.el) { for (const c of UE.el.querySelector('.ue-tabs').children) c.classList.toggle('on', c.dataset.tab === k); ueFillRow(); } return true; },
  ueDragTest: (src, pts, moveId) => { ueDragStart(src, pts[0].x, pts[0].y, null, moveId); for (const p of pts.slice(1, -1)) ueDragMove(p.x, p.y); const q = pts[pts.length - 1]; ueDragMove(q.x, q.y); const tgt = UE.drag ? UE.drag.tgt : null; return {tgt, id: ueDragEnd(q)}; },
  ueTargetAt: (src, x, y) => ueTargetAt(src, x, y),
};
