// the app's real fonts (fonts/ next to the published page) as data: URLs, for layout checks in file:// runs
import fs from 'fs';
const FD = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-wt/fonts/';
export const FONT_CSS = [['Barlow Semi Condensed', 'barlow-semi-condensed', [500, 600, 700]], ['JetBrains Mono', 'jetbrains-mono', [500, 700]]].map(([fam, f, ws]) => ws.map(w => `@font-face{font-family:"${fam}";font-weight:${w};src:url(data:font/woff2;base64,${fs.readFileSync(FD + f + '-latin-' + w + '-normal.woff2').toString('base64')}) format("woff2")}`).join('')).join('');
export async function realFont(page) {
  await page.addStyleTag({content: FONT_CSS});
  return page.evaluate(async () => { await Promise.all(['500', '600', '700'].map(w => document.fonts.load(w + ' 12px "Barlow Semi Condensed"'))); await document.fonts.load('500 12px "JetBrains Mono"'); await document.fonts.ready;
    return document.fonts.check('600 12px "Barlow Semi Condensed"') && [...document.fonts].some(f => f.family.includes('Barlow') && f.status === 'loaded'); });
}
