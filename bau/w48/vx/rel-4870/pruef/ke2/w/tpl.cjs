// holt die Klang-Vorlagen (wie tpl() im Blatt) einmal aus der Seite -> tpl.json
const {chromium} = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + process.argv[2]); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 90000});
  const t = await p.evaluate(() => { const mk = SQStore.normalizeSound(factorySound(INIT_IDS.mk)), va = spk2KlSnd({eng: 'va', fix: {o1: 0, o2: 0}, u: [.5, 0, .5, .3, 0, .3, 1, .3, 0, 0, .5]}), fm = spk2KlSnd({eng: 'fm', fix: {r: 1}, u: [.5, .5, .5, 0, .3, 1, .3, 1]});
    return {mk: JSON.parse(JSON.stringify(mk.p.mk)), va: {flat: wkFlat(va)}, fm: {flat: wkFlat(fm), fm6: JSON.parse(JSON.stringify(fm.p.fm6))}}; });
  fs.writeFileSync(path.join(__dirname, 'tpl.json'), JSON.stringify(t)); console.log('ok', Object.keys(t)); await b.close();
})();
