const {chromium} = require('playwright'); const fs = require('fs'), path = require('path'), acorn = require(path.join(__dirname, '..', 'acorn.js'));
function cssOf(file) { const s = fs.readFileSync(file, 'utf8'), out = []; const re = /<script type="text\/plain" id="(sq-[\w-]+-src)">/g; let m;
  while ((m = re.exec(s))) { const a = m.index + m[0].length, b = s.indexOf('</script>', a), t = s.slice(a, b), T = [];
    try { acorn.parse(t, {ecmaVersion: 'latest', sourceType: 'script', onToken: T}); } catch (e) { continue; }
    const tt = acorn.tokTypes;
    for (let i = 1; i + 1 < T.length; i++) if (T[i].type === tt.template && T[i - 1].type === tt.backQuote && T[i + 1].type === tt.backQuote) {
      const raw = t.slice(T[i].start, T[i].end); if (raw.length >= 900 && !raw.includes('${') && !raw.includes('registerProcessor') && /\{[^}]*:/.test(raw) && !raw.includes('<')) out.push({id: m[1], raw}); } }
  return out; }
(async () => { const A = cssOf(process.argv[2]), B = cssOf(process.argv[3]);
  const br = await chromium.launch(); const pg = await br.newPage();
  const ser = await pg.evaluate(([A, B]) => { const f = t => { const sh = new CSSStyleSheet(); sh.replaceSync(t); return [...sh.cssRules].map(x => x.cssText); }; return A.map((a, k) => [f(a), f(B[k])]); }, [A.map(x => x.raw), B.map(x => x.raw)]);
  ser.forEach(([x, y], k) => { for (let i = 0; i < Math.max(x.length, y.length); i++) if (x[i] !== y[i]) { console.log(A[k].id, i, '\nA:', x[i], '\nB:', y[i]); } });
  await br.close(); })();
