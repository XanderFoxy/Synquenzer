import sys
p=sys.argv[1]; s=open(p,encoding='utf-8').read()
R=[
("""function nvBanner() {
  let b = document.getElementById('nvBan'); if (b) b.remove(); if (!NV.lock) return;
  b = el('div', '', `<span class="cb-t">${NV_MSG}: Damit nichts verloren geht, speichert diese Version das Projekt nicht.</span><button class="mbtn rb go">Neu laden</button><button class="mbtn rb" aria-label="Schließen">✕</button>`);
  b.id = 'nvBan'; onTap(b, x => (x.classList.contains('go') ? cloudReload() : b.remove()), 'button'); document.body.appendChild(b);
  try { b.style.top = Math.round(EL.top.getBoundingClientRect().bottom) + 'px'; } catch (e) {}
}
const nvRefuse = () => { if (!NV.lock) return false; toast(NV_MSG + ' – erst neu laden'); return true; };""",
"""/* NOVW (Xander 14.11.: „Diese Benachrichtigung soll da raus“): kein Hinweis-Streifen mehr – die App holt die neuere Fassung still selbst (vwCheck). */
function nvBanner() {
  const b = document.getElementById('nvBan'); if (b) b.remove(); if (!NV.lock) return;
  try { vwCheck(true); } catch (e) {}
}
const nvRefuse = () => { if (!NV.lock) return false; try { vwCheck(true); } catch (e) {} return true; };"""),
("""      c.outdated = Date.now(); SYNC.outdated = {lid, title: f.title, by: ''}; cloudBanner(true);""",
"""      c.outdated = Date.now(); SYNC.outdated = {lid, title: f.title, by: ''}; try { vwCheck(true); } catch (e) {}   // NOVW: still, kein Streifen"""),
("""  if (o.n >= 2) { if (!VW.told) { VW.told = true; toast('Neue Version ' + v + ' liegt bereit – App einmal ganz schließen und neu öffnen'); } return; }
  if (!vwIdle()) {
    if (!VW.told) { VW.told = true; toast('Neue Version ' + v + ' – lädt nach dem Stopp', {label: 'Jetzt', fn: () => vwReload()}); }
    clearTimeout(VW.timer); VW.timer = setTimeout(vwGo, 3000); return;
  }
  toast('Neue Version ' + v + ' wird geladen …'); vwReload();""",
"""  if (o.n >= 2) return;                                                  // NOVW: keine Meldung – beim nächsten Öffnen kommt sie von selbst
  if (!vwIdle()) { clearTimeout(VW.timer); VW.timer = setTimeout(vwGo, 3000); return; }
  vwReload();"""),
]
for a,b in R:
    n=s.count(a)
    if n!=1: print('MISS',n,a[:70]); sys.exit(1)
    s=s.replace(a,b)
open(p,'w',encoding='utf-8').write(s); print('ok')
