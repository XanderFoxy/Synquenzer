// Kaninchenbau – Speicher. Alles bleibt auf diesem Gerät (localStorage), nichts wird gesendet.
// Jeder Zugriff in try/catch: im privaten Fenster oder bei gesperrtem Speicher läuft die App weiter (nur ohne Merken).
import { AESTE } from './inhalt.js';

const KEY = 'kaninchenbau.v1';
let ok = true;

export const leer = () => ({ v: 1, profil: null, lauf: null, stufen: {}, quiz: null, letztes: null, thema: 'auto' });

const istAst = (id) => typeof id === 'string' && Object.hasOwn(AESTE, id);
const istAntw = (a) => a && typeof a === 'object' && Object.values(a).every((w) => w === 0 || w === 1);

function normal(z) {
  const n = leer();
  if (z.profil && Array.isArray(z.profil.aeste)) n.profil = { aeste: z.profil.aeste.filter(istAst), antw: istAntw(z.profil.antw) ? z.profil.antw : {}, datum: String(z.profil.datum || '') };
  if (n.profil && !n.profil.aeste.length) n.profil = null;
  if (z.lauf && istAntw(z.lauf.antw)) n.lauf = { antw: z.lauf.antw };
  if (z.stufen && typeof z.stufen === 'object') {
    for (const [ast, st] of Object.entries(z.stufen)) {
      if (!istAst(ast) || !st || typeof st !== 'object') continue;
      n.stufen[ast] = {};
      for (const s of ['1', '2', '3']) {
        const e = st[s]; if (!e) continue;
        const beste = Math.max(0, Math.min(3, e.beste | 0));
        n.stufen[ast][s] = { beste, versuche: Math.max(1, e.versuche | 0), geschafft: beste >= 2 };
      }
    }
  }
  const q = z.quiz;
  if (q && istAst(q.ast) && [1, 2, 3].includes(q.stufe) && Array.isArray(q.ok) && Array.isArray(q.seiten)) {
    n.quiz = { ast: q.ast, stufe: q.stufe, ok: q.ok.map(Boolean).slice(0, 3), seiten: q.seiten.map((s) => (s ? 1 : 0)).slice(0, 3), offen: q.offen === 0 || q.offen === 1 ? q.offen : null };
  }
  const l = z.letztes;
  if (l && istAst(l.ast) && [1, 2, 3].includes(l.stufe)) n.letztes = { ast: l.ast, stufe: l.stufe, richtig: l.richtig | 0, neu: !!l.neu, ersterMal: !!l.ersterMal, aufgenommen: !!l.aufgenommen };
  if (['auto', 'hell', 'dunkel'].includes(z.thema)) n.thema = z.thema;
  return n;
}

export function laden() {
  try {
    const t = localStorage.getItem(KEY);
    if (t) { const z = JSON.parse(t); if (z && z.v === 1) return normal(z); }
  } catch { ok = false; }
  return leer();
}

export function sichern(z) {
  try { localStorage.setItem(KEY, JSON.stringify(z)); ok = true; } catch { ok = false; }
  return ok;
}

export function loeschen() { try { localStorage.removeItem(KEY); } catch { /* egal */ } }
export const speicherOk = () => ok;

// Bitte an den Browser, den Speicher nicht bei Platzmangel zu räumen (iPhone: wirkt vor allem als Home-Bildschirm-App).
export function dauerhaft() { try { navigator.storage?.persist?.().catch(() => {}); } catch { /* egal */ } }
