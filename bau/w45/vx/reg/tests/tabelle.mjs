// REG: Zusammenfassung alt (r4760) / neu je Test als Tabelle → <ordner>/ERGEBNIS.md
import fs from 'node:fs'; import path from 'node:path';
const O = process.argv[2], ALT = process.argv[3] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/r4760';
const here = path.dirname(new URL(import.meta.url).pathname), D = JSON.parse(fs.readFileSync(path.join(here, '..', 'r4760-dauer.json'), 'utf8'));
const alt = n => { const f = path.join(ALT, n + '.log'); if (!fs.existsSync(f)) return null; const t = fs.readFileSync(f, 'utf8'), L = t.split('\n');
  const fe = L.filter(l => /^\s*(FEHLER|FEHL)\b(?!:)\s*(?!\d+\s*s$)(?!\S+:\s*\d+\/\d+ bestanden)/.test(l)).length, ok = L.filter(l => /^\s*OK\b/.test(l)).length, ex = (/^EXIT (\S+)/m.exec(t) || [])[1];
  return {ok, fe, ex, sek: D[n]}; };
const J = fs.readdirSync(O).filter(f => f.endsWith('.json')).map(f => { try { const j = JSON.parse(fs.readFileSync(path.join(O, f), 'utf8')); return j.urteil ? j : null; } catch (e) { return null; } }).filter(Boolean)
  .sort((a, b) => a.name.localeCompare(b.name));
const Z = (() => { try { return fs.readFileSync(path.join(O, 'zeit.txt'), 'utf8'); } catch (e) { return ''; } })();
const rows = J.map(j => { const a = alt(j.name) || {}; const alts = a.ok == null ? '–' : (a.fe ? 'ROT ' : 'grün ') + a.ok + ' OK / ' + a.fe + ' FEHLER' + (a.ex && a.ex !== '0' ? ' · Exit ' + a.ex : '') + (a.sek != null ? ' · ' + a.sek + ' s' : '');
  const notes = [].concat(j.rot.map(x => 'ROT: ' + x), j.zeit.map(x => 'ZEIT: ' + x), j.bekannt.map(x => 'bekannt: ' + x)).map(s => s.replace(/\|/g, '/')).join('<br>');
  return '| ' + j.name + ' | ' + alts + ' | **' + j.urteil + '** ' + j.ok + ' OK / ' + j.fehl + ' FEHLER · ' + j.sek + ' s · Last ' + j.last.mittel + (j.wdh ? ' (Wdh.; Lauf 1 Last ' + j.wdh.last.mittel + ')' : '') + ' | ' + (notes || (j.info || '')) + ' |'; });
const cnt = {}; for (const j of J) cnt[j.urteil] = (cnt[j.urteil] || 0) + 1;
const md = '# REG – Ergebnis ' + O + '\n\n' + Z + '\n\nUrteile: ' + JSON.stringify(cnt) + ' · Tests ' + J.length + '\n\n| Test | alt (r4760, 4.76.0) | neu | Hinweise |\n|---|---|---|---|\n' + rows.join('\n') + '\n';
fs.writeFileSync(path.join(O, 'ERGEBNIS.md'), md); console.log(md);
