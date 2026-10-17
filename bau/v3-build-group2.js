export const meta = {
  name: 'synquenzer-v3-group2',
  description: 'Build one group of SYNQUENZER v3 packages (Nachtrag 2 order): build, test incl. specialist review, verify, fix, group regression',
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
ENVIRONMENT
- The app (single self-contained HTML, edit in place): ${P.app}
- It lives in a git worktree on branch dirigent-synth (${P.wt}). Do NOT commit or push; the orchestrator does that.
- Spec v3 (authoritative for this build; read §0, §1, §16, §17 and every chapter your package references): ${P.spec3}
- Spec v3 NACHTRAG (binding amendments, has priority over spec v3 where they differ; read the part for your package): ${P.nachtrag}
- Spec v3 NACHTRAG 2 (Rev. 3, FINAL, binding, has priority over Nachtrag 1 AND spec v3; defines new packages like VO1, VO2, VS0, V4f, VL, VS1…, V9d, V10P, VI…, group order in Teil E, specialist reviews in Teil J): ${P.nachtrag2}
- Newest user wishes (German): ${P.feedback3}, ${P.feedback4}, ${P.feedback5}
- Standalone address of the app: https://xanderfoxy.github.io/Synquenzer/ (GitHub Pages; microphone and online work only there, not in the Claude viewer). Supabase project for SYNQUENZER: ref dbdnsryoivvezspgydpx ("synquenzer", eu-central-1). You may read it and apply SQL migrations to it with the Supabase MCP tools (apply_migration) when your package requires it, after your local tests pass; NEVER touch the project rolcktiryrvjzbwuvobb (classroom website) or anything of the website repo XanderFoxy/Deutsch-Mit-Xander. Settings that need the Supabase dashboard (auth providers, hooks, URL configuration, captcha) you list for Xander in CHANGES-V3 under "Für Xander im Dashboard".
- Spec v2 (background for existing features): ${P.spec2}
- Latest user feedback that motivated v3 (German): ${P.feedback} and ${P.feedback2}
- Snapshots dir (copy the app here after each finished package as <package>.html, e.g. V0a.html): ${P.snap}
- Test harness dir: ${P.test} - playwright is installed there. Launch Chromium ONLY with chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--autoplay-policy=no-user-gesture-required'] }). Never run "playwright install". Smoke test: node ${P.test}/smoke.mjs <file> <png>. Put your own test scripts in ${P.test} with unique names (prefix v3-). Never write files into /home/user/Deutsch-Mit-Xander.
- The page runs (a) standalone in iPhone Safari and (b) inside the claude.ai artifact viewer (sandboxed iframe): no alert/confirm/prompt, no plain downloads there (window.claude.use('downloads') -> save({filename,data}); allowed types per downloads.d.ts and Nachtrag EN-12 - .mid and .syx must go into a store-only .zip), localStorage/IndexedDB may throw (try/catch, app must still work), no microphone.
- Audible-effect rule: every control you add must change the sound measurably (use OfflineAudioContext or an AnalyserNode capture and assert dB/spectrum deltas as the spec demands). Nothing may click, snap or drop out.
`

const FINDINGS = { type: 'object', properties: { findings: { type: 'array', items: { type: 'object', properties: {
  title: { type: 'string' }, severity: { type: 'string', enum: ['critical', 'major', 'minor'] },
  repro: { type: 'string' }, expected: { type: 'string' }, actual: { type: 'string' },
}, required: ['title', 'severity', 'repro', 'expected', 'actual'] } } }, required: ['findings'] }
const VERDICT = { type: 'object', properties: { real: { type: 'boolean' }, evidence: { type: 'string' } }, required: ['real', 'evidence'] }

async function testVerifyFix(tag, lenses, extra) {
  const results = await pipeline(lenses,
    l => agent(`You are a strict QA tester (lens: ${l.key}) for the SYNQUENZER web app. ${l.prompt}
${extra}
${ENV}
Write and RUN real tests (Playwright/node) - do not guess. Report only genuine defects or clear violations of the spec's acceptance checklists that you actually observed, with exact repro. Ignore features that belong to later packages (Nachtrag 2 Teil E order) that are not built yet. Return an empty list if everything is fine.`, { label: `test:${tag}:${l.key}`, phase: 'Test', schema: FINDINGS }),
    (res, l) => parallel((res?.findings || []).filter(f => f.severity !== 'minor').map(f => () =>
      agent(`Independently try to REPRODUCE this reported defect in the SYNQUENZER app at ${P.app} (spec ${P.spec3}). Default to real=false if you cannot reproduce it with an actual run or if it is not a genuine problem for the user.
Finding: ${JSON.stringify(f)}
${ENV}`, { label: `verify:${tag}:${f.title.slice(0, 28)}`, phase: 'Verify', schema: VERDICT })
        .then(v => v && v.real ? Object.assign({}, f, { lens: l.key, evidence: v.evidence }) : null))))
  const confirmed = results.flat().filter(Boolean)
  log(`${tag}: ${confirmed.length} bestätigte Fehler`)
  if (confirmed.length) await fixAll(tag, confirmed)
  return confirmed
}

function fixAll(tag, confirmed) {
  return agent(`Fix ALL of these confirmed defects in the SYNQUENZER app at ${P.app} (spec ${P.spec3}). RESTART SAFETY: if ${P.snap}/${tag}-fix.html already exists, check which defects are already fixed and finish only the rest. Re-run each repro afterwards to prove it is fixed (layout checks must use the app's real font, not a fallback), then run the smoke test. Do not break other features. Afterwards copy the app to ${P.snap}/${tag}-fix.html.
${ENV}
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
  const summary = await agent(`Implement package ${wp} of the SYNQUENZER v3 spec: its definition in Nachtrag 2 ${P.nachtrag2} (highest priority), Nachtrag 1 ${P.nachtrag} and spec v3 ${P.spec3} §17 "${wp}" plus every chapter and research file they reference (e.g. under v3-ideen/r7 and r8); where they differ, Nachtrag 2 wins in the app ${P.app}. Packages run in the group order of Nachtrag 2 Teil E; earlier groups are already in the app. Before your own ABNAHME run the package's Fach-Prüfung (Nachtrag 2 Teil J) on yourself and note it in CHANGES.
${ENV}
RESTART SAFETY: first check whether ${P.snap}/${wp}.html already exists and the app already contains this package (e.g. after a container restart). If so, do NOT rebuild: re-verify its acceptance checklist, finish only what is missing, and refresh the snapshot. If you find half-done work from an interrupted attempt, either complete it or cleanly revert it.
Rules: keep everything that already works (v1/v2 features, harmony core, logo, test API window.SYNQUENZER, old project files load); leave the app working after your package; follow the spec's UI layouts for portrait 390x844, 375x667, 320x568 and landscape 844x390 / 667x375; German UI; big touch targets; simple first, depth optional; no accidental edits; performance on iPhone. When done, run the package's ABNAHME checklist (IDs ${wp}-NN) yourself with real Playwright/audio tests and fix what fails, run the smoke test, look at screenshots in portrait and landscape and fix layout problems, append a section to ${P.scratch}/CHANGES-V3.md, then copy the app to ${P.snap}/${wp}.html. Return a concise summary: what you built, deviations from the spec, known gaps.`, { label: `build:${wp}`, phase: 'Build', effort: 'high' })
  await testVerifyFix(wp, [
    { key: 'acceptance', prompt: `Check the ABNAHME checklist of ${wp} item by item as defined in Nachtrag 2 ${P.nachtrag2} (and, where it refers to them, Nachtrag 1 ${P.nachtrag} and spec v3 ${P.spec3} §17), measuring audible effects where required.` },
    ...(/^(V4|VO)/.test(wp) ? [{ key: 'specialist', prompt: `Specialist review (Nachtrag 2 Teil J): find the "Fach-Prüfung" line of package ${wp} in ${P.nachtrag2} (FP-DSP, FP-TOUCH, FP-SONG, FP-SICHER, FP-KLANG, FP-IPHONE) and act as each listed specialist with the checklist of Teil J. Measure, do not guess (audio captures, Playwright touch at 390×844 and 844×390, SQL tests locally with PGlite for FP-SICHER, CPU timing). Blocking items are major/critical.` }] : []),
    { key: 'regression', prompt: `Regression check after ${wp}: core still works - record a clip, FANG, launch scenes, transpose with single notes and chords, stop single clips, drums play, synth editor and FM page work, save/load (also an old v2 project file), MIDI export zip; no console errors; portrait and landscape layout intact, nothing clipped or overlapping.` },
  ], `Package under test: ${wp}. Builder summary: ${(summary || '').slice(0, 3000)}`)
}

const GROUPCHECK = [
  { key: 'gruppe', prompt: `GROUP CHECK (think like Xander, a synthpop musician on an iPhone): try the typical songwriting flow with the features of group ${GROUP} end to end, plus 3 min playback with scene switches and edits while playing (no clicks, dropouts, stuck notes, console errors), undo/redo of the new actions and a save/load roundtrip. Report anything broken, inaudible or confusing.` },
]
const c = await testVerifyFix(GROUP + '-gruppe', GROUPCHECK, `Group regression after packages ${PACKAGES.join(', ')}.`)
return { group: GROUP, packages: PACKAGES, groupDefects: c.length }
