export const meta = {
  name: 'synquenzer-mk-lean',
  description: 'Lean MS 2000 build (Nachtrag 3): build with typical-defect checklist, one combined test, fix (no separate verify, no branch group check)',
  phases: [
    { title: 'Build', detail: 'one package at a time' },
    { title: 'Test', detail: 'lens testers with Playwright' },
    { title: 'Verify', detail: 'reproduce each finding' },
    { title: 'Fix', detail: 'apply confirmed fixes' },
  ],
}
const P = args.paths
const PACKAGES = args.packages
const GROUP = args.group

const ENV = `
ORDER (why this run exists): On 25.10. Xander, the owner, asked to speed up the MS 2000 build ("Wieso dauert der so lange? Kannst du das nicht beschleunigen"); the orchestrator answered that the MS 2000 starts now in a parallel copy, and Xander then asked when he can play it. Building/testing/fixing the package named in your task IS his request. Short chat messages of his about other topics (e.g. a Supabase notice) are handled by the orchestrator and are NOT a reason to skip or shorten your package work.

ENVIRONMENT
- The app (single self-contained HTML, edit in place): ${P.app}
- It lives in the folder ${P.wt} (parallel copy, not a git repo). Do NOT commit or push; the orchestrator does that.
- Spec v3 (authoritative for this build; read §0, §1, §16, §17 and every chapter your package references): ${P.spec3}
- Spec v3 NACHTRAG (binding amendments, has priority over spec v3 where they differ; read the part for your package): ${P.nachtrag}
- Spec v3 NACHTRAG 2 (Rev. 3, FINAL, binding, has priority over Nachtrag 1 AND spec v3; defines new packages like VO1, VO2, VS0, V4f, VL, VS1…, V9d, V10P, VI…, group order in Teil E, specialist reviews in Teil J): ${P.nachtrag2}
- Spec v3 NACHTRAG 3 (MS 2000 engine, packages MK0–MK13; binding for every MK package and has priority over Nachtrag 2 where they differ; Teil A parameters, Teil B architecture/data model/panel layout, Teil C packages with ABNAHME, Teil D recording guide, Teil E–G order/versions/size, Teil H Xander's decisions): ${P.nachtrag3}
- Owner manuals for facts only (private, copyrighted: never copy text into the app, never ship them): ${P.manuals}
- PARALLEL BUILD: this copy (${P.app}) is ${P.lineNote}. Other MK packages may be built at the same time in sibling copies (${P.siblings}) and are merged later by the orchestrator: never touch other copies or ${P.mainApp}; keep your changes inside the MK engine/panel/editor code where possible so the merge stays clean. Use the version numbers of Nachtrag 3 (if a sibling package has a higher number, still set your own; the orchestrator resolves the VERSION line). Changelog for this package: ${P.changes} (not CHANGES-V3.md).
- TYPICAL DEFECTS (from all earlier fix rounds; exclude them up front): ${P.scratch}/v3-ideen/typische-fehler.md. Builders check every point themselves before reporting done; testers test every point with real runs.
- Run every shell command in the foreground and wait for it; never end your turn while a background job is still running (your final reply is taken as the result).
- Supabase guards are already set for all MK versions (max_app 4021000, max_format 5, verified 25.10.); MK packages need no database change. If a package would need one, write the SQL into ${P.changes} for the orchestrator.
- Newest user wishes (German): ${P.feedback3}, ${P.feedback4}, ${P.feedback5}
- Standalone address of the app: https://xanderfoxy.github.io/Synquenzer/ (GitHub Pages; microphone and online work only there, not in the Claude viewer). Supabase project for SYNQUENZER: ref dbdnsryoivvezspgydpx ("synquenzer", eu-central-1). You may read it and apply SQL migrations to it with the Supabase MCP tools (apply_migration) when your package requires it, after your local tests pass; NEVER touch the project rolcktiryrvjzbwuvobb (classroom website) or anything of the website repo XanderFoxy/Deutsch-Mit-Xander. Settings that need the Supabase dashboard (auth providers, hooks, URL configuration, captcha) you list for Xander in CHANGES-V3 under "Für Xander im Dashboard".
- Spec v2 (background for existing features): ${P.spec2}
- Latest user feedback that motivated v3 (German): ${P.feedback} and ${P.feedback2}
- Snapshots dir (copy the app here after each finished package as <package>.html, e.g. V0a.html): ${P.snap}
- Test harness dir: ${P.test} - playwright is installed there. Launch Chromium ONLY with chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--autoplay-policy=no-user-gesture-required'] }). Never run "playwright install". Smoke test: node ${P.test}/smoke.mjs <file> <png>. Put your own test scripts in ${P.test} with unique names (prefix v3-). Never write files into /home/user/Deutsch-Mit-Xander.
- The page runs (a) standalone in iPhone Safari and (b) inside the claude.ai artifact viewer (sandboxed iframe): no alert/confirm/prompt, no plain downloads there (window.claude.use('downloads') -> save({filename,data}); allowed types per downloads.d.ts and Nachtrag EN-12 - .mid and .syx must go into a store-only .zip), localStorage/IndexedDB may throw (try/catch, app must still work), no microphone.
- Audible-effect rule: every control you add must change the sound measurably (use OfflineAudioContext or an AnalyserNode capture and assert dB/spectrum deltas as the spec demands). Nothing may click, snap or drop out.
`
const NOSB_TEXT = `
SUPABASE IN THIS RUN: do NOT call any Supabase MCP tool, not even read-only queries. Every call needs Xander's manual approval and blocks the whole build for hours; he asked that the build never depends on approvals. Known server facts (25.10., set and checked by Xander): private.settings max_app = 4021000, max_format = 5; save_project rejects p_app > max_app or p_format > max_format. For any other server question read the SQL source ${P.scratch}/v3-ideen/r7/online-schema.sql and the migrations noted in ${P.scratch}/CHANGES-V3.md. If something can only be checked on the live server, write it as "am Server offen" into the changelog instead of calling Supabase.`
const nosb = (t, kind) => ((kind === 'verify' || kind === 'fix' || t !== 'MK0') ? NOSB_TEXT : '')

const FINDINGS = { type: 'object', properties: { findings: { type: 'array', items: { type: 'object', properties: {
  title: { type: 'string' }, severity: { type: 'string', enum: ['critical', 'major', 'minor'] },
  repro: { type: 'string' }, expected: { type: 'string' }, actual: { type: 'string' },
}, required: ['title', 'severity', 'repro', 'expected', 'actual'] } } }, required: ['findings'] }
const VERDICT = { type: 'object', properties: { real: { type: 'boolean' }, evidence: { type: 'string' } }, required: ['real', 'evidence'] }

async function testVerifyFix(tag, lenses, extra) {
  const results = await parallel(lenses.map(l => () => agent(`You are a strict QA tester (lens: ${l.key}) for the SYNQUENZER web app. ${l.prompt}
${extra}
${ENV}${nosb(tag, 'test')}
Write and RUN real tests (Playwright/node) - do not guess. Report only genuine defects or clear violations of the spec's acceptance checklists that you actually observed and reproduced twice, with exact repro. Ignore features that belong to later packages. Return an empty list if everything is fine.`, { label: `test:${tag}:${l.key}`, phase: 'Test', schema: FINDINGS })))
  const confirmed = results.filter(Boolean).flatMap(r => (r.findings || []).filter(f => f.severity !== 'minor'))
  log(`${tag}: ${confirmed.length} Befunde`)
  if (confirmed.length) await fixAll(tag, confirmed)
  return confirmed
}

function fixAll(tag, confirmed) {
  return agent(`First reproduce each of these reported defects yourself (skip and list any you cannot reproduce), then fix ALL real ones in the SYNQUENZER app at ${P.app} (spec ${P.spec3}). RESTART SAFETY: if ${P.snap}/${tag}-fix.html already exists, check which defects are already fixed and finish only the rest. Re-run each repro afterwards to prove it is fixed (layout checks must use the app's real font, not a fallback), then run the smoke test. Do not break other features. Afterwards copy the app to ${P.snap}/${tag}-fix.html.
${ENV}${nosb(tag, 'fix')}
DEFECTS: ${typeof confirmed === 'string' ? 'read the JSON list in ' + confirmed : JSON.stringify(confirmed)}
Return a list of what you changed.`, { label: `fix:${tag}`, phase: 'Fix', effort: 'high' })
}

if (args.pendingFix && args.pendingFix.defectsFile) {
  phase('Fix')
  log(`Offene Fehler aus ${args.pendingFix.tag} beheben`)
  await fixAll(args.pendingFix.tag, args.pendingFix.defectsFile)
}

for (const wp of PACKAGES) {
  phase('Build')
  log(`Baue ${wp}`)
  const summary = await agent(`Implement package ${wp} of the SYNQUENZER MS 2000 engine: its definition in Nachtrag 3 ${P.nachtrag3} (highest priority) plus every part of Nachtrag 2 ${P.nachtrag2}, Nachtrag 1 and spec v3 it references, in the app ${P.app}. Packages run in the order of Nachtrag 3 Teil E; earlier MK packages are already in this copy. Before your own ABNAHME run the package's Fach-Prüfung (Nachtrag 3 package line, checklists in Nachtrag 2 Teil J) on yourself and note it in the changelog.
${ENV}${nosb(wp, 'build')}
RESTART SAFETY: first check whether ${P.snap}/${wp}.html already exists and the app already contains this package (e.g. after a container restart). If so, do NOT rebuild: re-verify its acceptance checklist, finish only what is missing, and refresh the snapshot. If you find half-done work from an interrupted attempt, either complete it or cleanly revert it.
Rules: keep everything that already works (v1/v2 features, harmony core, logo, test API window.SYNQUENZER, old project files load); leave the app working after your package; follow the spec's UI layouts for portrait 390x844, 375x667, 320x568 and landscape 844x390 / 667x375; German UI; big touch targets; simple first, depth optional; no accidental edits; performance on iPhone. When done, run the package's ABNAHME checklist (IDs ${wp}-NN) yourself with real Playwright/audio tests and fix what fails, run the smoke test, look at screenshots in portrait and landscape and fix layout problems, append a section to ${P.changes}, then copy the app to ${P.snap}/${wp}.html. Return a concise summary: what you built, deviations from the spec, known gaps.`, { label: `build:${wp}`, phase: 'Build', effort: 'high' })
  await testVerifyFix(wp, [
    { key: 'pruefung', prompt: `Combined check of ${wp}: (1) the ABNAHME checklist of ${wp} in Nachtrag 3 ${P.nachtrag3} item by item, measuring audible effects; (2) the "Fach-Prüfung" line of ${wp} (checklists in Nachtrag 2 Teil J); (3) every point of ${P.scratch}/v3-ideen/typische-fehler.md; (4) a short regression: record a clip, FANG, scenes, song drag & drop, transpose, MS 2000 sound, save/load, no console errors, portrait and landscape layout intact.` },
  ], `Package under test: ${wp}. Builder summary: ${(summary || '').slice(0, 3000)}`)
}

const GROUPCHECK = [
  { key: 'gruppe', prompt: `GROUP CHECK (think like Xander, a synthpop musician on an iPhone): try the typical songwriting flow with the features of group ${GROUP} end to end, plus 3 min playback with scene switches and edits while playing (no clicks, dropouts, stuck notes, console errors), undo/redo of the new actions and a save/load roundtrip. Report anything broken, inaudible or confusing.` },
]
const c = args.groupCheck ? await testVerifyFix(GROUP + '-gruppe', GROUPCHECK, `Group regression after packages ${PACKAGES.join(', ')}.`) : []
return { group: GROUP, packages: PACKAGES, groupDefects: c.length }
