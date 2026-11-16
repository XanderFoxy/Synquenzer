// robots.txt beachten (MV5 Gesuche, 16.11.2026): Der Radar liest eine Quelle nur automatisch, wenn deren robots.txt den Pfad
// erlaubt – sonst bleibt sie ein Link „hier selbst suchen“ auf der Seite. Regeln nach RFC 9309:
//  - Gruppe für unseren Namen („vorteils-radar“, aus dem User-Agent) vor „*“; mehrere passende Gruppen werden vereint,
//  - längste passende Regel gewinnt, bei Gleichstand Allow; „*“ = beliebig viele Zeichen, „$“ = Ende,
//  - robots.txt fehlt (HTTP 4xx) = alles erlaubt; Server-Fehler/keine Antwort = dieses Mal NICHT lesen (vorsichtig).
// Ergebnis je Host im Zustand (zustand.robots[host] = { tag, status, regeln }) – höchstens einmal pro ROBOTS_TAGE neu holen.

export const ROBOTS_TAGE = 7;

/** robots.txt -> Liste von Gruppen [{ agents: [..], regeln: [{ erlaubt, pfad }] }] */
export function leseRobots(text) {
  const gruppen = [];
  let g = null, zuletztAgent = false;
  for (const roh of String(text || '').split(/\r?\n/)) {
    const zeile = roh.replace(/#.*$/, '').trim();
    const m = zeile.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const feld = m[1].toLowerCase(), wert = m[2].trim();
    if (feld === 'user-agent') {
      if (!g || !zuletztAgent) { g = { agents: [], regeln: [] }; gruppen.push(g); }
      g.agents.push(wert.toLowerCase());
      zuletztAgent = true;
    } else if (feld === 'allow' || feld === 'disallow') {
      zuletztAgent = false;
      if (!g) continue;
      if (feld === 'disallow' && !wert) continue; // „Disallow:“ leer = nichts verboten
      g.regeln.push({ erlaubt: feld === 'allow', pfad: wert });
    } else zuletztAgent = false;
  }
  return gruppen;
}

/** Regeln, die für unseren Agenten gelten (eigene Gruppe, sonst „*“). agent = Produktname klein, z. B. „vorteils-radar“ */
export function regelnFuer(gruppen, agent) {
  const a = String(agent || '').toLowerCase();
  const eigene = gruppen.filter(g => g.agents.some(x => x !== '*' && a && (a === x || a.startsWith(x))));
  const liste = eigene.length ? eigene : gruppen.filter(g => g.agents.includes('*'));
  return liste.flatMap(g => g.regeln);
}

const alsMuster = pfad => new RegExp('^' + pfad.replace(/[.+?^${}()|[\]\\]/g, m => (m === '$' ? m : '\\' + m)).replace(/\*/g, '.*').replace(/\\\$$|\$$/, '$'));
/** Darf `pfad` (mit Query) gelesen werden? regeln = regelnFuer(...) */
export function erlaubt(regeln, pfad) {
  let best = null;
  for (const r of regeln) {
    if (!r.pfad) continue;
    if (!alsMuster(r.pfad).test(pfad)) continue;
    const len = r.pfad.replace(/\*/g, '').length;
    if (!best || len > best.len || (len === best.len && r.erlaubt && !best.erlaubt)) best = { len, erlaubt: r.erlaubt, pfad: r.pfad };
  }
  return best ? { ok: best.erlaubt, regel: `${best.erlaubt ? 'Allow' : 'Disallow'}: ${best.pfad}` } : { ok: true, regel: null };
}

/** Produktname aus dem User-Agent: „Vorteils-Radar/1.0 (…)“ -> „vorteils-radar“ */
export const agentAus = ua => String(ua || '').split(/[\s/]/)[0].toLowerCase();

/**
 * Prüft eine Adresse gegen die robots.txt ihres Hosts. holeRoh(url) -> { status, text } (Status 0 = keine Antwort).
 * -> { ok, grund } ; grund z. B. „robots.txt: Disallow: /api/“ oder „robots.txt nicht lesbar (HTTP 503)“
 */
export async function robotsErlaubt(url, { holeRoh, zustand = null, agent = 'vorteils-radar', jetzt = new Date(), tage = ROBOTS_TAGE }) {
  const u = new URL(url);
  const speicher = zustand ? (zustand.robots ||= {}) : {};
  const jetztMs = new Date(jetzt).getTime();
  let e = speicher[u.host];
  if (!e || !(jetztMs - Date.parse(e.zeit) < tage * 864e5) || e.status === 0 || e.status >= 500) {
    let r;
    try { r = await holeRoh(`${u.protocol}//${u.host}/robots.txt`); } catch (err) { r = { status: 0, text: '', fehler: String(err?.message || err) }; }
    const regeln = r.status >= 200 && r.status < 300 ? regelnFuer(leseRobots(r.text), agent) : [];
    e = { zeit: new Date(jetztMs).toISOString(), status: r.status, regeln: regeln.slice(0, 200) };
    speicher[u.host] = e;
  }
  if (e.status === 0 || e.status >= 500) return { ok: false, grund: `robots.txt nicht lesbar (${e.status ? `HTTP ${e.status}` : 'keine Antwort'})` };
  if (e.status >= 400) return { ok: true, grund: `keine robots.txt (HTTP ${e.status})` };
  const p = erlaubt(e.regeln, u.pathname + u.search);
  return p.ok ? { ok: true, grund: p.regel ? `robots.txt: ${p.regel}` : 'robots.txt erlaubt' } : { ok: false, grund: `robots.txt: ${p.regel}` };
}
