import { launch, OUT } from './v3-mk0rg2-lib.mjs'; import fs from 'fs';
const [a, b, x, y, w, h, out] = process.argv.slice(2);
const br = await launch(); const pg = await br.newPage({viewport: {width: 2 * +w + 10, height: +h}});
const A = fs.readFileSync(OUT + a).toString('base64'), B = fs.readFileSync(OUT + b).toString('base64');
await pg.setContent(`<body style="margin:0;background:#f0f"><div style="display:flex;gap:10px"><div style="width:${w}px;height:${h}px;overflow:hidden;position:relative"><img src="data:image/png;base64,${A}" style="position:absolute;left:-${x}px;top:-${y}px"></div><div style="width:${w}px;height:${h}px;overflow:hidden;position:relative"><img src="data:image/png;base64,${B}" style="position:absolute;left:-${x}px;top:-${y}px"></div></div></body>`);
await pg.waitForTimeout(300); await pg.screenshot({path: OUT + out}); await br.close();
