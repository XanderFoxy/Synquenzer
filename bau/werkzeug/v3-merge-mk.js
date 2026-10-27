export const meta = {
  name: 'synquenzer-mk-merge',
  description: 'Merge parallel MS 2000 branch copies into the main line, resolve conflicts, test, fix',
  phases: [
    { title: 'Merge', detail: '3-way merge of each branch into the main line' },
    { title: 'Test', detail: 'acceptance scripts of all merged packages + regression' },
    { title: 'Fix', detail: 'fix merge-induced defects' },
  ],
}
const A = args
const ENV = `
ORDER (why this run exists): Xander, the owner, asked to build the MS 2000 faster; the orchestrator builds MS 2000 packages in parallel copies and now merges them back. Merging, testing and fixing the merged app IS his request.
FILES
- Main line app (edit in place, single self-contained HTML): ${A.main}
- Merge base (the state all branches started from): ${A.base}
- Branches to merge: ${A.branches.map(b => `${b.name} = ${b.file} (changelog ${b.changes})`).join('; ')}
- Spec of the MS 2000 packages: ${A.nachtrag3} (Nachtrag 2: ${A.nachtrag2})
- Main changelog: ${A.changes}. Test harness dir: ${A.test} (playwright installed; Chromium ONLY via chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--autoplay-policy=no-user-gesture-required'] }); if that path is missing use plain chromium.launch()). Smoke test: node ${A.test}/smoke.mjs <file> <png>. Existing package test scripts are in ${A.test} (names contain mk2, mk3, mk4 …).
- Snapshot dir: ${A.snap}
TYPICAL DEFECTS to check after every merge: /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/v3-ideen/typische-fehler.md.
RULES: no Supabase calls at all (guards already set: max_app 4021000, max_format 5). No git commit/push. Never touch /home/user/Deutsch-Mit-Xander or /home/user/synquenzer. Run every command in the foreground and wait for it; do not end your turn while a background job runs. German UI texts stay German.`

phase('Merge')
const merged = await agent(`${ENV}

TASK: Merge every branch into the main line with a real 3-way merge and keep ALL functionality of the main line and of every branch.
1. Back up the main line to ${A.main}.vor-merge-${A.tag}.html first.
2. For each branch in order: git merge-file -L MAIN -L BASE -L <name> ${A.main} ${A.base} <branch file>. Then resolve every conflict by understanding both sides (both usually add different features to the same panel/engine/worklet code: combine them, do not drop either). VERSION = the highest of all sides. Make sure no conflict markers remain (grep '^<<<<<<<\\|^=======$\\|^>>>>>>>').
3. Append each branch changelog file to ${A.changes} (as its own sections, unchanged text) and add a short section "## ${A.tag} — Zusammenführung" listing the merged packages and every conflict you resolved and how.
4. Run the smoke test, then the existing acceptance test scripts of every merged package (and of the main line's latest MK package) against ${A.main}; fix every failure caused by the merge.
5. Copy the result to ${A.snap}/${A.tag}.html.${A.extra ? '\n6. ' + A.extra : ''}
Return (English, short): conflicts resolved, test scripts run with pass/fail counts, anything left open.`, { label: `merge:${A.tag}`, phase: 'Merge', effort: 'high' })

if (A.mergeOnly) return { merged, mergeOnly: true }

phase('Test')
const FIND = { type: 'object', properties: { findings: { type: 'array', items: { type: 'object', properties: {
  title: { type: 'string' }, severity: { type: 'string', enum: ['critical', 'major', 'minor'] }, repro: { type: 'string' }, expected: { type: 'string' }, actual: { type: 'string' },
}, required: ['title', 'severity', 'repro', 'expected', 'actual'] } } }, required: ['findings'] }
const res = await agent(`${ENV}

An agent just merged ${A.branches.map(b => b.name).join(', ')} into ${A.main}. Its report:
${merged}

TASK (independent, skeptical): verify the merged app really contains and runs every package's features: run the acceptance scripts of each merged package and of the main line's packages again yourself, plus a regression with real touch input at 390×844 and 844×390: song (FANG, Drag & Drop of parts, scenes), MS 2000 sound and panel (all EDIT-WAHL positions, wheels), the newly merged features, save/load roundtrip, no console errors, no clipped labels. Report only genuine defects you observed with exact repro.${A.testNote ? ' ' + A.testNote : ''}`, { label: `test:${A.tag}`, phase: 'Test', schema: FIND })

const defects = ((res && res.findings) || []).filter(f => f.severity !== 'minor')
log(`${A.tag}: ${defects.length} Fehler nach dem Zusammenführen`)
let fixed = 'keine'
if (defects.length) {
  phase('Fix')
  fixed = await agent(`${ENV}

Fix ALL of these defects found after merging, in ${A.main}. Re-run each repro to prove it is fixed, run the smoke test, then copy the app to ${A.snap}/${A.tag}-fix.html and add a short section "## ${A.tag}-fix" to ${A.changes}.
${A.testNote ? A.testNote + '\n' : ''}DEFECTS: ${JSON.stringify(defects)}
Return a short list of what you changed.`, { label: `fix:${A.tag}`, phase: 'Fix', effort: 'high' })
}
return { merged, defects: defects.length, fixed }
