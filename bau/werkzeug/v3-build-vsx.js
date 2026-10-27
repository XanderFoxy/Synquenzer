export const meta = {
  name: 'synquenzer-gesang-n4',
  description: 'Nachtrag 4 (Gesang): VS-L and VS-P built in parallel branch copies, each build → two-lens test → fix',
  phases: [
    { title: 'Build', detail: 'one agent per package, each in its own branch copy' },
    { title: 'Test', detail: 'acceptance lens + musician/regression lens per package' },
    { title: 'Fix', detail: 'fix confirmed defects per package' },
  ],
}
const P = args.paths
const ENV = (pk) => `
ORDER (why this run exists): On 27.10. at noon Xander, the owner, tested the vocal recording on his iPhone and asked, in German:
"Mir ist aufgefallen, dass die Aufnahme ein bisschen zu kurz ist. Das sind, glaube ich, nur 4 Takte, die man machen kann. Ich brauche mindestens 16 Takte. Und kann man das irgendwie so umschalten, dass die Melodieerkennung von dem Mikrofon nicht immer mit aufnimmt, wenn man Vocals aufnehmen möchte? Und dann ist noch eine Sache, sie sind im Kontext zu den Synthesizern oder anderen Spuren, die man baut, meistens viel zu leise. Kann man da noch irgendwie was machen, dass die Stimme lauter ist oder dass das in besserem Verhältnis zueinander funktioniert? … wenn du Sachen parallel machen kannst, dann nutze das."
The orchestrator turned this into Nachtrag 4 (${P.spec4}) with two packages built in parallel: VS-L and VS-P. Building/testing/fixing the package named in your task IS his request.
RULE 27 (Xander 27.10.: "Du sollst einfach nichts anderes machen oder selbst bestimmen, nur das, worüber wir geredet haben"): build ONLY what Nachtrag 4 describes for your package. No own names, no extra features, no other design. If something is unclear or would need another visible change, do not build it: list it under "Fragen an Xander" in your changelog.

ENVIRONMENT
- Your app copy (single self-contained HTML, edit in place): ${pk.app} — a BRANCH copy started from App 4.23.0 (${P.base}). The sibling package is built at the same time in ${pk.sibling}; never touch it, the main line ${P.main} or any other copy. The orchestrator merges both branches into the main line later with a 3-way merge: keep your changes inside the functions your package needs, use one-line hooks in shared functions, and do not reformat or move code you do not change.
- Spec for this build (authoritative): ${P.spec4}. Background for the existing voice features: Nachtrag 2 Teil C ${P.nachtrag2}, ${P.scratch}/v3-ideen/r7/stimme.md, and the VS3/VS4/VS5a/VS5b sections of ${P.scratch}/CHANGES-V3.md (what exists, test API, test scripts in ${P.test} named v3-vs3*, v3-vs4*, v3-vs5*, gs7-*).
- VERSION 4.24.0 (APP_CODE 4024000). Project format stays 5 (additive fields only). The line "  live: true," in CLOUD must stay.
- Changelog for this package (German, like CHANGES-V3.md): ${pk.changes} (not CHANGES-V3.md). Sections: Was neu ist, Abnahme table (ID | Ergebnis | Messung/Skript), Abweichungen, Fragen an Xander, iPhone (Xander), Für das Zusammenführen (which functions you changed).
- TYPICAL DEFECTS (exclude them up front, check every point yourself before reporting done): ${P.scratch}/v3-ideen/typische-fehler.md.
- Newest user wishes (German): ${P.feedback5}
- Test harness dir: ${P.test} (playwright installed; launch Chromium with chromium.launch() — it needs no executablePath; add args ['--autoplay-policy=no-user-gesture-required'] and for microphone tests '--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture=<wav>' or the mic dummy in the same AudioContext that the VS3 tests use). Never run "playwright install". Smoke test: node ${P.test}/smoke.mjs <file> <png>. Put your own scripts in ${P.test} with the prefix n4-${pk.tag.toLowerCase()}- . Never write into /home/user/Deutsch-Mit-Xander or /home/user/synquenzer.
- Snapshots dir: ${P.snap} (copy your finished app there as ${pk.tag}.html, after fixes as ${pk.tag}-fix.html).
- The page runs (a) standalone in iPhone Safari (GitHub Pages; microphone only there) and (b) in the claude.ai artifact viewer (sandboxed iframe, no microphone, storage may throw). No alert/confirm/prompt.
- Audible-effect rule: every change that should be heard must be measured (OfflineAudioContext or capture; LUFS/dBTP/dB). Nothing may click, snap or drop out.
- Run every shell command in the foreground and wait for it; never end your turn while a background job runs.
- No git commit/push. SUPABASE: do NOT call any Supabase tool (server guard: private.settings max_app = 4021000, max_format = 5; Xander raises max_app by SQL himself; just note "am Server offen: max_app ≥ 4024000" in the changelog).
- No Korg/microKORG/RADIAS/DWGS word in the app; "MS 2000" only via MK_LABEL.`

const FINDINGS = { type: 'object', properties: { findings: { type: 'array', items: { type: 'object', properties: {
  title: { type: 'string' }, severity: { type: 'string', enum: ['critical', 'major', 'minor'] },
  repro: { type: 'string' }, expected: { type: 'string' }, actual: { type: 'string' },
}, required: ['title', 'severity', 'repro', 'expected', 'actual'] } } }, required: ['findings'] }

const PKGS = args.packages
const results = await pipeline(PKGS,
  pk => agent(`Implement package ${pk.tag} of Nachtrag 4 (${P.spec4}, section "Paket ${pk.tag}") in the SYNQUENZER app ${pk.app}.
${ENV(pk)}
RESTART SAFETY: if ${P.snap}/${pk.tag}.html already exists and the app already contains this package (container restart), do NOT rebuild: re-verify the acceptance list, finish only what is missing, refresh the snapshot. Half-done work from an interrupted attempt: complete it or cleanly revert it.
FIRST reproduce the problem Xander reported for your package in the unchanged app with real runs and write the cause(s) with numbers into the changelog; then fix the causes. Keep everything else working (songs, scenes, FANG, MS 2000, voice takes, Säubern, marks, stretch, save/load, undo). Layout must work in portrait 390x844, 375x667, 320x568 and landscape 844x390, 667x375, 926x428. When done, run every acceptance item ${pk.tag}-NN with real Playwright/audio tests and fix what fails, run the smoke test and the existing VS3/VS4/VS5 acceptance scripts that cover what you touched, look at screenshots, write the changelog, set VERSION 4.24.0, copy the app to ${P.snap}/${pk.tag}.html.
Return (English, concise): the causes you found (with numbers), what you built, acceptance results, deviations, questions for Xander, functions changed.`, { label: `build:${pk.tag}`, phase: 'Build', effort: 'high' }),
  (summary, pk) => parallel([
    { key: 'abnahme', prompt: `Check package ${pk.tag} item by item against Nachtrag 4 (${P.spec4}): every acceptance item ${pk.tag}-NN with real recordings through the app's real recording paths (fake mic / mic dummy as the VS3 tests do) and measured audio, plus every point of ${P.scratch}/v3-ideen/typische-fehler.md that applies (touch targets ≥ 44 × 44 via elementFromPoint, nothing clipped, no layout jump, German texts, rule 27: anything built that Nachtrag 4 does not describe is a 'major' defect). A failed acceptance item is 'major'.` },
    { key: 'musiker', prompt: `Think like Xander, a synthpop musician on an iPhone 12 Pro Max, at 390x844 and 844x390 with touch input: open the demo project, record vocals over the song idea the way he would (scene with existing clips, ● REC with 🎤, 16 bars, overdub a second take, Stimme-FANG, ● SONG with 🎤), listen to the mix, switch the new options of ${pk.tag} if any, undo/redo, save/load roundtrip, 3 min playback with scene switches. Report anything that still limits a vocal recording to fewer than 16 bars, a voice that is still clearly too quiet against the synths, anything broken, inaudible, confusing, clicking, or any console error, plus regressions in songs, FANG, MS 2000, Säubern, marks/stretch. A regression or a not-fulfilled wish of Xander is 'major'.` },
  ].map(l => () => agent(`You are a strict QA tester (lens: ${l.key}) for the SYNQUENZER app ${pk.app} (package ${pk.tag}). ${l.prompt}
${ENV(pk)}
Builder summary: ${(summary || '').slice(0, 3500)}
Write and RUN real tests (Playwright/node) - do not guess. Do not edit the app. Report only genuine defects you observed and reproduced twice, with exact repro. Return an empty list if everything is fine.`, { label: `test:${pk.tag}:${l.key}`, phase: 'Test', schema: FINDINGS })))
    .then(rs => ({ summary, findings: rs.filter(Boolean).flatMap(r => r.findings || []) })),
  (r, pk) => {
    const real = r.findings.filter(f => f.severity !== 'minor')
    log(`${pk.tag}: ${real.length} Befunde (+${r.findings.length - real.length} klein)`)
    if (!real.length) return { tag: pk.tag, summary: r.summary, findings: r.findings, fixed: 'keine' }
    return agent(`First reproduce each of these reported defects yourself (skip and list any you cannot reproduce), then fix ALL real ones in ${pk.app}. RESTART SAFETY: if ${P.snap}/${pk.tag}-fix.html already exists, check which defects are already fixed and finish only the rest. Re-run each repro to prove it is fixed, re-run the acceptance items ${pk.tag}-NN that the fix touches and the smoke test, add a section "## ${pk.tag}-fix" to ${pk.changes}, copy the app to ${P.snap}/${pk.tag}-fix.html.
${ENV(pk)}
DEFECTS: ${JSON.stringify(real)}
Return a short list of what you changed.`, { label: `fix:${pk.tag}`, phase: 'Fix', effort: 'high' })
      .then(fixed => ({ tag: pk.tag, summary: r.summary, findings: r.findings, fixed }))
  })
return results
