// REG: führt einen Regressions-Test aus, wertet FEHLER-Zeilen nach bekannt.json, wiederholt NUR Zeit-/Last-Prüfungen 1× und schreibt die Last mit.
// Aufruf: node lauf.mjs <name> <ausgabe-ordner> <timeout-s> -- <befehl …>     → <ordner>/<name>.log (+ .lauf1.log bei Wiederholung), <ordner>/<name>.json
import { spawn } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const [name, out, tos] = process.argv.slice(2, 5), cmd = process.argv.slice(process.argv.indexOf('--') + 1);
const here = path.dirname(new URL(import.meta.url).pathname), RG = JSON.parse(fs.readFileSync(process.env.REGEL || path.join(here, 'bekannt.json'), 'utf8'));
const R = RG[name] || {}, CPU = os.cpus().length, load = () => +fs.readFileSync('/proc/loadavg', 'utf8').split(' ')[0];
const mk = L => (L || []).map(([re, why]) => [new RegExp(re), why]), BK = mk(R.bekannt), ZT = mk(R.zeit).concat((RG._zeit_alle || []).map(re => [new RegExp(re, 'i'), 'Long Tasks (alle Tests)']));
function lauf(logf) { return new Promise(ok => { const t0 = Date.now(), L = [load()], fd = fs.openSync(logf, 'w');
  const p = spawn(cmd[0], cmd.slice(1), {stdio: ['ignore', fd, fd], env: Object.assign({}, process.env, {NODE_PATH: process.env.NODE_PATH || '/opt/node-tools/node_modules'})});
  const iv = setInterval(() => L.push(load()), 5000); let to = false; const k = setTimeout(() => { to = true; p.kill('SIGKILL'); }, (+tos || 1500) * 1000);
  p.on('exit', (code, sig) => { clearInterval(iv); clearTimeout(k); L.push(load()); fs.closeSync(fd); fs.appendFileSync(logf, 'EXIT ' + (code == null ? sig : code) + (to ? ' (Zeitlimit)' : '') + '\n');
    ok({code: to ? 'timeout' : code, sek: Math.round((Date.now() - t0) / 1000), last: {start: L[0], max: Math.max(...L), mittel: +(L.reduce((a, b) => a + b, 0) / L.length).toFixed(1)}}); }); }); }
function werte(txt, r) {
  const lines = txt.split('\n'), F = [], K = [], Z = [], X = [];
  for (const l of lines) { const m = /^\s*(FEHLER|FEHL|FAIL)\b(?!:)\s*(.*)$/.exec(l); if (!m) continue; const t = m[2].trim();
    if (/^\d+\s*s$/.test(t) || /^\S+:\s*\d+\/\d+ bestanden/.test(t) || /^\d+ von \d+/.test(t)) continue; F.push(t);
    const b = BK.find(([re]) => re.test(t)), z = !b && ZT.find(([re]) => re.test(t));
    (b ? K : z ? Z : X).push(t.slice(0, 160) + (b ? '  ⟶ ' + b[1] : z ? '  ⟶ ' + z[1] : '')); }
  const ok = lines.filter(l => /^\s*OK\b/.test(l)).length;
  if (r.code !== 0 && !F.length) X.push('Exit ' + r.code + ' ohne FEHLER-Zeile (Absturz/Zeitlimit): ' + lines.filter(l => l.trim()).slice(-4, -1).join(' / ').slice(0, 200));
  if (R.muss && !new RegExp(R.muss, 'm').test(txt)) X.push('Pflicht-Ausgabe fehlt: /' + R.muss + '/');
  if (R.verboten && new RegExp(R.verboten, 'm').test(txt)) X.push('verbotene Ausgabe: /' + R.verboten + '/');
  return {ok, fehl: F.length, K, Z, X}; }
const logf = path.join(out, name + '.log'); let r = await lauf(logf), w = werte(fs.readFileSync(logf, 'utf8'), r), r1 = null, w1 = null;
if (!w.X.length && w.Z.length) { fs.renameSync(logf, path.join(out, name + '.lauf1.log')); r1 = r; w1 = w; r = await lauf(logf); w = werte(fs.readFileSync(logf, 'utf8'), r); }
const urteil = w.X.length ? (R.echtzeit && r.last.mittel > 2 * CPU ? 'UNGÜLTIG (Last)' : 'ROT') : w.Z.length ? (r.last.mittel > CPU ? 'LAST' : 'ROT') : w1 ? 'GRÜN (Wdh.)' : w.K.length ? 'BEKANNT' : R.info ? 'INFO' : 'GRÜN';
const res = {name, urteil, ok: w.ok, fehl: w.fehl, bekannt: w.K, zeit: w.Z, rot: w.X, exit: r.code, sek: r.sek + (r1 ? r1.sek : 0), last: r.last, wdh: r1 ? {sek: r1.sek, last: r1.last, zeit: w1.Z} : null, cpu: CPU, info: R.info || null};
fs.writeFileSync(path.join(out, name + '.json'), JSON.stringify(res, null, 1));
console.log(urteil.padEnd(12) + name.padEnd(10) + ' ' + res.sek + ' s · Last ' + r.last.mittel + (r1 ? ' · Wdh. (Lauf 1: ' + w1.Z.length + ' Zeit-Fehler, Last ' + r1.last.mittel + ')' : ''));
