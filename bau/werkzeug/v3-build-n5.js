export const meta = {
  name: 'synquenzer-n5',
  description: 'Nachtrag 5 wave 1: video, history recorder and Gesang 2 built in parallel branch copies; packages run in order inside each branch (build → two-lens test → fix)',
  phases: [
    { title: 'Build', detail: 'one agent per package, branches in parallel' },
    { title: 'Test', detail: 'acceptance lens + musician/regression lens per package' },
    { title: 'Fix', detail: 'fix confirmed defects per package' },
  ],
}
const P = args.paths
const ENV = (br) => `
ORDER (why this run exists): On 31.10. Xander, the owner, sent his wishes for the next steps (German, quoted in ${P.feedback}, section "31.10."): a video output of his songs for social media (9:16 and 16:9, view switching that shows what happens inside, prepared per song part, no video editing, later a Procreate-like build-up video), vocal pitch quantize, visible/audible timing quantize of vocals, pickup/tail of sung takes, vocal effects with an automatic compressor. When asked for the order he answered: "Der Gesang hat Priorität, aber dann soll das gleich mit dem Video kommen. Oder mach es wieder parallel. Credits sind genug da." The orchestrator wrote Nachtrag 5 (${P.spec5}) and builds wave 1 in three parallel branch copies. Building/testing/fixing the package named in your task IS his request.
RULE 27 (Xander 27.10.: "Du sollst einfach nichts anderes machen oder selbst bestimmen, nur das, worüber wir geredet haben"): build ONLY what Nachtrag 5 describes for your package (VC2a: exactly the Nachtrag 1 section). No own names, no extra features, no other design. Unclear or would need another visible change → do not build it, list it under "Fragen an Xander" in your changelog. Things required by the typical-defect list (touch targets ≥ 44 × 44, nothing clipped, no layout jump, no clicks) are always done without asking.
PRIORITY (Xander): fast page, fluid UI, no audio dropouts on an iPhone 12 Pro Max.

ENVIRONMENT
- Your app copy (single self-contained HTML, edit in place): ${br.app} — BRANCH "${br.name}" started from App 4.23.0 (${P.base}). Sibling branches are built at the same time (${br.siblings}); the voice packages of Nachtrag 4 (16-bar takes, switch Melodieerkennung, Auto-Pegel) are built in ${P.n4}. Never touch any other copy or the main line ${P.main}. The orchestrator merges all branches later with a 3-way merge: keep changes inside your own code blocks, use one-line hooks in shared functions, do not reformat or move code you do not change.
- Spec (authoritative): ${P.spec5}. VC2a: ${P.nachtrag1}, section "### VC2a — Verlauf-Rekorder". Background: Nachtrag 2 ${P.nachtrag2} (Teil C voice), Nachtrag 3 ${P.nachtrag3} (MS 2000), spec v3 ${P.spec3}, and the existing changelogs ${P.scratch}/CHANGES-V3.md and ${P.scratch}/CHANGES-MK.md (what exists, test API window.SYNQUENZER, test scripts in ${P.test}).
- VERSION 4.25.0 (APP_CODE 4025000). Project format stays 5 (additive fields only). The CLOUD line "  live: true," must stay.
- Changelog for this branch (German, like CHANGES-V3.md): ${br.changes}. One section per package: Was neu ist, Abnahme table (ID | Ergebnis | Messung/Skript), Abweichungen, Fragen an Xander, iPhone (Xander), Für das Zusammenführen (functions/blocks changed).
- TYPICAL DEFECTS (exclude them up front, check every point yourself before reporting done): ${P.scratch}/v3-ideen/typische-fehler.md.
- Test harness dir: ${P.test} (playwright installed; chromium.launch() needs no executablePath; args ['--autoplay-policy=no-user-gesture-required'], for microphone tests add '--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture=<wav>' or use the mic dummy the VS3 tests use). Never run "playwright install". Smoke test: node ${P.test}/smoke.mjs <file> <png>. Your own scripts go into ${P.test} with the prefix n5-${br.name.toLowerCase()}- . Never write into /home/user/Deutsch-Mit-Xander or /home/user/synquenzer.
- Snapshots dir: ${P.snap} (after each package: <package>.html, after its fixes <package>-fix.html).
- The page runs (a) standalone in iPhone Safari (GitHub Pages; microphone and file sharing there) and (b) in the claude.ai artifact viewer (sandboxed iframe: no microphone, storage may throw, downloads only via window.claude.use('downloads') with the types in its downloads.d.ts). No alert/confirm/prompt. Any third-party code you embed must be small, MIT/BSD/Apache-licensed and carry its license text in a comment.
- Audible-effect rule: everything that should be heard is measured (OfflineAudioContext or capture; LUFS/dB/cents/ms). Nothing may click, snap or drop out.
- Run every shell command in the foreground and wait for it; never end your turn while a background job runs.
- No git commit/push. SUPABASE: do NOT call any Supabase tool (server guard max_app = 4021000 is raised by Xander himself; note "am Server offen: max_app ≥ 4025000" in the changelog).
- No Korg/microKORG/RADIAS/DWGS word in the app; "MS 2000" only via MK_LABEL. No emoji used as a drawn symbol (draw shapes).`

const FINDINGS = { type: 'object', properties: { findings: { type: 'array', items: { type: 'object', properties: {
  title: { type: 'string' }, severity: { type: 'string', enum: ['critical', 'major', 'minor'] },
  repro: { type: 'string' }, expected: { type: 'string' }, actual: { type: 'string' },
}, required: ['title', 'severity', 'repro', 'expected', 'actual'] } } }, required: ['findings'] }

async function onePackage(br, tag) {
  const summary = await agent(`Implement package ${tag} (branch ${br.name}) in the SYNQUENZER app ${br.app}. Definition: ${tag === 'VC2a' ? P.nachtrag1 + ', section "### VC2a — Verlauf-Rekorder" (unchanged), placed in wave 1 by Nachtrag 5 ' + P.spec5 : P.spec5 + ', section "## ' + tag + '"'}.
${ENV(br)}
RESTART SAFETY: if ${P.snap}/${tag}.html already exists and the app already contains this package (container restart), do NOT rebuild: re-verify the acceptance list, finish only what is missing, refresh the snapshot. Half-done work from an interrupted attempt: complete it or cleanly revert it.
Keep everything else working (songs, scenes, FANG, MS 2000, FM, voice takes, Säubern, marks, stretch, save/load, undo, performance). Layouts: portrait 390x844, 375x667, 320x568, landscape 844x390, 667x375, 926x428. When done, run every acceptance item ${tag}-NN with real Playwright/audio/video tests and fix what fails, run the smoke test and the existing acceptance scripts that cover what you touched, look at screenshots, write the changelog section, set VERSION 4.25.0, copy the app to ${P.snap}/${tag}.html.
Return (English, concise): what you built, acceptance results with numbers, deviations, questions for Xander, functions/blocks changed.`, { label: `build:${tag}`, phase: 'Build', effort: 'high' })
  const rs = await parallel([
    { key: 'abnahme', prompt: `Check package ${tag} item by item: every acceptance item ${tag}-NN of its definition (${tag === 'VC2a' ? P.nachtrag1 + ' section VC2a' : P.spec5 + ' section ' + tag}) with real runs and measurements, plus every applicable point of ${P.scratch}/v3-ideen/typische-fehler.md (touch targets ≥ 44 × 44 via elementFromPoint, nothing clipped, no layout jump, German texts). Rule 27: anything built that the definition does not describe is 'major'. A failed acceptance item is 'major'.` },
    { key: 'musiker', prompt: `Think like Xander, a synthpop musician on an iPhone 12 Pro Max, at 390x844 and 844x390 with touch input: use the new feature of ${tag} the way he would for a real song (demo project: scenes, song parts, MS 2000/FM tracks, a vocal take), then a regression: record a clip, FANG, song drag & drop, transpose, MS 2000 sound, vocal take playback, undo/redo, save/load roundtrip, 3 min playback with scene switches (no clicks, dropouts, stuck notes, console errors). Report what is broken, confusing, slow, inaudible or ugly, and regressions. A regression or an unfulfilled wish of Xander is 'major'.` },
  ].map(l => () => agent(`You are a strict QA tester (lens: ${l.key}) for the SYNQUENZER app ${br.app} (package ${tag}, branch ${br.name}). ${l.prompt}
${ENV(br)}
Builder summary: ${(summary || '').slice(0, 3500)}
Write and RUN real tests (Playwright/node) - do not guess. Do not edit the app. Report only genuine defects you observed and reproduced twice, with exact repro. Return an empty list if everything is fine.`, { label: `test:${tag}:${l.key}`, phase: 'Test', schema: FINDINGS })))
  const all = rs.filter(Boolean).flatMap(r => r.findings || [])
  const real = all.filter(f => f.severity !== 'minor')
  log(`${tag}: ${real.length} Befunde (+${all.length - real.length} klein)`)
  let fixed = 'keine'
  if (real.length) fixed = await agent(`First reproduce each of these reported defects yourself (skip and list any you cannot reproduce), then fix ALL real ones in ${br.app}. RESTART SAFETY: if ${P.snap}/${tag}-fix.html already exists, check which defects are already fixed and finish only the rest. Re-run each repro to prove it is fixed, re-run the acceptance items ${tag}-NN the fix touches and the smoke test, add a section "## ${tag}-fix" to ${br.changes}, copy the app to ${P.snap}/${tag}-fix.html.
${ENV(br)}
DEFECTS: ${JSON.stringify(real)}
Return a short list of what you changed.`, { label: `fix:${tag}`, phase: 'Fix', effort: 'high' })
  return { tag, summary, minor: all.filter(f => f.severity === 'minor'), defects: real.length, fixed }
}

const results = await pipeline(args.branches, async br => {
  const out = []
  for (const tag of br.packages) out.push(await onePackage(br, tag))
  return { branch: br.name, packages: out }
})
return results
