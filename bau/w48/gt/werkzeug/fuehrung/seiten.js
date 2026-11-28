// ================================================================ #einsingen/<id> – geführte Einheit „Heute einsingen“
const SICHER_TEXT = 'Bei Kratzen, Schmerz oder Heiserkeit: aufhören und Pause machen. Die Übungen ersetzen keinen Gesangsunterricht.';
async function seiteEinsingen(id) {
  setzeNav('einsingen');
  const lied0 = (await holeLied(id || speicher.hole('letztesLied', 'the-wall'))) || (await holeLied('the-wall'));
  const lied = lied0 ? liedFuer(lied0) : null;
  setzeKopf('Heute einsingen', lied0 && id ? `#lied/${enc(lied0.id)}` : '#start');
  const T = await ladeTrainer();
  const st = stimme();
  const plaene = T.p.einheitPlan(lied, st);
  if (!plaene.length) return h('div', { class: 'karte leer' }, h('p', null, 'Die Übungen ließen sich gerade nicht vorbereiten.'));
  const n = plaene.length;
  const erg = new Array(n).fill(undefined);
  let idx = 0, teil = 0, sp = null, gespeichert = false;
  const ringEl = T.t.ring(0, { text: 'warm' });
  const kopf = h('section', { class: 'held eh-held' });
  const box = h('div');
  const fuss = h('div', { class: 'eh-fuss' });
  aufraeumen.push(() => { if (sp) sp.stopp(); T.t.beendeSitzung(); });
  const fertigAnzahl = () => erg.filter((x) => x !== undefined).length;
  const warm = () => Math.min(1, (fertigAnzahl() + teil) / n);
  const schnitt = () => { const w = erg.filter((e) => e && e.gueltig).map((e) => e.gesamt); return w.length ? Math.round(w.reduce((a, b) => a + b, 0) / w.length) : null; };
  const punkte = () => h('div', { class: 'eh-punkte', 'aria-hidden': 'true' }, plaene.map((_, k) => h('i', { class: k === idx ? 'an' : erg[k] !== undefined ? 'fertig' : '' })));
  function kopfZeigen() {
    const p = plaene[idx];
    fuelle(kopf, h('div', null,
      h('span', { class: 'eh-schritt' }, `Schritt ${idx + 1} / ${n}`),
      h('h1', null, p.titel),
      h('p', { class: 'eh-ertrag' }, h('b', null, 'Bringt dir: '), p.ertrag),
      h('p', { class: 'eh-kurz' }, p.kurz), punkte()), ringEl);
    ringEl.setze(warm());
  }
  function zeigeSchritt() {
    if (sp) sp.stopp();
    teil = 0; kopf.classList.remove('eh-ende');
    const p = plaene[idx];
    kopfZeigen();
    box.replaceChildren();
    sp = T.t.spieler(box, p, {
      tonart: lied && lied.tonart, meldung,
      weiterText: idx < n - 1 ? `Weiter zu ${idx + 2}/${n}` : 'Zum Abschluss', onWeiter: weiter,
      onDurchgang: (k, m) => { teil = (k / m) * 0.99; ringEl.setze(warm()); },
      onFertig: (e) => {
        erg[idx] = e || null; teil = 0; kopfZeigen();
        merkeVerlauf({ art: 'uebung', inEinheit: true, uebung: p.uebung, titel: p.titel, liedId: lied0 && lied0.id, prozent: prozentVon(e), teile: teileKurz(e) });
      },
    });
    fuelle(fuss, idx > 0 ? h('button', { class: 'knopf', onclick: () => { idx--; zeigeSchritt(); } }, ic('zurueck'), 'Zurück') : h('span'),
      h('button', { class: 'knopf', onclick: weiter }, idx < n - 1 ? 'Überspringen' : 'Zum Abschluss', ic('weiter')));
    window.scrollTo(0, 0);
  }
  function weiter() { if (idx < n - 1) { idx++; zeigeSchritt(); } else ende(); }
  function ende() {
    if (sp) sp.stopp(); sp = null;
    const avg = schnitt(), gemacht = fertigAnzahl();
    const warmGesungen = avg != null && avg >= 70 && gemacht >= Math.ceil(n * 0.6);
    const ohneMikro = avg == null && gemacht > 0;
    const schwach = plaene.map((p, k) => [p, erg[k]]).filter(([, e]) => e && e.gueltig).sort((a, b) => a[1].gesamt - b[1].gesamt)[0];
    const titel = warmGesungen ? 'Du bist warm gesungen' : ohneMikro ? 'Alle Übungen im Takt gemacht' : !gemacht ? 'Heute noch nichts gesungen' : avg != null ? 'Fast warm' : 'Gut angefangen';
    const text = warmGesungen ? `Im Schnitt ${avg} % – deine Stimme ist bereit${lied0 ? ` für „${lied0.titel}“` : ''}.`
      : ohneMikro ? 'Ohne Mikrofon kann ich keinen Prozentwert zeigen – bewegt hast du die Stimme trotzdem.'
        : !gemacht ? 'Mach ein paar Übungen, dann zeige ich dir hier, wie warm du bist.'
          : avg != null ? `Im Schnitt ${avg} %${schwach ? ` – wiederhole „${schwach[0].titel}“ noch einmal locker` : ''}, dann bist du warm.` : 'Weiter so.';
    kopf.classList.add('eh-ende');
    fuelle(kopf, h('div', null, h('span', { class: 'eh-schritt' }, 'Abschluss'), h('h1', null, titel), h('p', { class: 'eh-kurz' }, text)),
      T.t.ring(avg != null ? avg / 100 : warm(), { text: avg != null ? 'Prozent' : 'warm' }));
    const liste = plaene.map((p, k) => {
      const e = erg[k], w = prozentVon(e);
      return h('div', { class: 'eh-zeile' },
        h('div', null, h('b', null, p.titel), h('p', { class: 'leise klein' }, e === undefined ? 'übersprungen' : e === null ? 'ohne Messung' : e.bewegung ? 'erledigt' : e.tipp || '')),
        h('b', { class: 'p' }, w != null ? `${w} %` : '–'),
        h('button', { class: 'knopf klein', 'aria-label': `${p.titel} wiederholen`, onclick: () => { idx = k; zeigeSchritt(); } }, ic('schleife')));
    });
    box.replaceChildren(
      h('section', { class: 'karte' }, h('h3', null, 'Deine Übungen heute'), h('div', { class: 'eh-liste', style: { marginTop: '10px' } }, liste)),
      h('div', { class: 'knopf-reihe' },
        lied0 ? h('a', { class: 'knopf haupt', href: `#lied/${enc(lied0.id)}/ueben` }, ic('lieder'), 'Jetzt das Lied üben') : null,
        h('a', { class: 'knopf', href: '#verlauf' }, ic('verlauf'), 'Verlauf')),
      lied0 ? h('a', { class: 'knopf klein', href: `#warmup/${enc(lied0.id)}` }, ic('uhr'), 'Warm-up mit Uhr (ohne Mikrofon)') : null);
    fuelle(fuss, h('a', { class: 'knopf', href: '#start' }, ic('zurueck'), 'Zur Startseite'),
      h('button', { class: 'knopf', onclick: () => { erg.fill(undefined); idx = 0; gespeichert = false; zeigeSchritt(); } }, ic('schleife'), 'Neu beginnen'));
    if (gemacht && !gespeichert) {
      gespeichert = true;
      merkeVerlauf({ art: 'einheit', titel: 'Heute einsingen', liedId: lied0 && lied0.id, prozent: avg, anzahl: gemacht, von: n, warm: warmGesungen,
        uebungen: plaene.map((p, k) => ({ titel: p.titel, prozent: prozentVon(erg[k]) })) });
    }
    window.scrollTo(0, 0);
  }
  zeigeSchritt();
  return [kopf,
    !st || !st.kern ? h('a', { class: 'karte hinweis-karte', href: '#stimme' }, h('span', { class: 'pfeil' }, ic('hinweis')), h('p', { class: 'klein' }, 'Noch kein Stimmprofil – die Starttöne gelten für einen typischen Bariton. Stimmlage ermitteln macht sie passend.')) : null,
    box, fuss, h('p', { class: 'leise klein', style: { textAlign: 'center' } }, SICHER_TEXT)];
}

// ================================================================ #uebung/<id>[/<startton>] – eine Übung im Takt
async function seiteUebung(id, startRoh) {
  setzeNav('uebungen');
  const u = uebungVon(id);
  if (!u) { setzeKopf('Übung', '#uebungen'); return h('div', { class: 'karte leer' }, h('p', null, 'Diese Übung gibt es nicht.'), h('a', { class: 'knopf', href: '#uebungen', style: { marginTop: '12px' } }, 'Zu den Übungen')); }
  setzeKopf(u.titel, '#uebungen');
  const T = await ladeTrainer();
  const lied0 = (await holeLied(speicher.hole('letztesLied', 'the-wall'))) || (await holeLied('the-wall'));
  const lied = lied0 ? liedFuer(lied0) : null;
  const start = startRoh != null && isFinite(Number(startRoh)) ? Math.round(Number(startRoh)) : undefined;
  const plan = T.p.spielplan(id, { stimme: stimme(), lied, start });
  if (!plan || !plan.durchgaenge.length) return h('div', { class: 'karte leer' }, h('p', null, 'Für diese Übung gibt es gerade keinen Ablauf.'));
  const box = h('div'); let sp = null;
  aufraeumen.push(() => { if (sp) sp.stopp(); T.t.beendeSitzung(); });
  sp = T.t.spieler(box, plan, { tonart: lied && lied.tonart, meldung, weiterText: 'Andere Übung', onWeiter: () => { location.hash = '#uebungen'; },
    onFertig: (e) => merkeVerlauf({ art: 'uebung', uebung: id, titel: plan.titel, liedId: lied0 && lied0.id, prozent: prozentVon(e), teile: teileKurz(e) }) });
  const letzte = verlauf().filter((x) => x.uebung === id && x.prozent != null).slice(-1)[0];
  return [h('section', { class: 'held' }, h('h1', null, plan.titel),
    h('p', { class: 'eh-ertrag' }, h('b', null, 'Bringt dir: '), plan.ertrag),
    h('p', { class: 'eh-kurz' }, plan.kurz),
    letzte ? h('p', { class: 'klein', style: { marginTop: '8px' } }, `Zuletzt: ${letzte.prozent} % (${new Date(letzte.datum).toLocaleDateString('de-DE')})`) : null),
  box,
  u.anleitung && u.anleitung.length ? h('details', { class: 'karte' }, h('summary', { class: 'klein', style: { minHeight: '44px', display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: '700' } }, 'Ausführliche Anleitung'),
    u.ziel ? h('p', { class: 'leise', style: { marginTop: '6px' } }, u.ziel) : null, h('ol', { class: 'anleitung' }, u.anleitung.map((a) => h('li', null, a)))) : null,
  h('p', { class: 'leise klein', style: { textAlign: 'center' } }, SICHER_TEXT)];
}

// ================================================================ #lied/<id>/ueben[/<zeile>[/<schritt>]] – Liedmodus
async function seiteLiedUeben(id, zid, nrRoh) {
  const lied0 = await holeLied(id);
  if (!lied0) return nichtGefunden();
  speicher.merke('letztesLied', id); setzeNav('start');
  const lied = liedFuer(lied0), ton = lied.tonart;
  const T = await ladeTrainer();
  const st = stimme(), S = T.p.stimmeVon(st);
  const info = T.p.zeilenInfo(lied, st);
  const v = verlauf();
  const bestes = (z2, nr2) => { const e = v.filter((x) => x.art === 'zeile' && x.liedId === id && x.zeile === z2 && String(x.schritt) === String(nr2) && x.prozent != null); return e.length ? Math.max(...e.map((x) => x.prozent)) : null; };
  if (zid) return seiteLiedZeile(lied0, lied, T, st, info, zid, nrRoh, bestes);
  setzeKopf(`${lied0.titel || 'Lied'} üben`, `#lied/${enc(id)}`);
  const mitMel = info.some((x) => x.mitMelodie);
  const teile = lied.teile.filter((t) => info.some((x) => x.teil === t.id));
  let wahl = (speicher.hole('lmTeil', {}) || {})[id];
  if (!teile.some((t) => t.id === wahl)) wahl = (teile.find((t) => info.some((x) => x.teil === t.id && x.hart >= 2)) || teile[0] || {}).id;
  const chips = h('div', { class: 'lm-teile', role: 'group', 'aria-label': 'Liedteil' });
  const liste = h('div');
  const schritteVon = (x) => {
    if (!x.mitMelodie) return [{ nr: 1, titel: 'Im Rhythmus sprechen' }];
    const out = [{ nr: 1, titel: 'Nur Vokale' }, { nr: 2, titel: 'Mit Text und Begleitung' }, { nr: 3, titel: `Tief → hoch bis ${nName(x.hoch, ton)}` }];
    const g = x.gruende.find((r) => r.art === 'sprung') || x.gruende.find((r) => r.art === 'diphthong') || x.gruende.find((r) => r.art === 'atem');
    if (g) out.push({ nr: 4, titel: g.art === 'sprung' ? 'Der Sprung' : g.art === 'diphthong' ? 'Doppellaut oben' : 'Atem für den Bogen' });
    return out;
  };
  function male() {
    chips.replaceChildren(...teile.map((t) => h('button', { class: `chip ${t.id === wahl ? 'an' : ''}`, 'aria-pressed': String(t.id === wahl), onclick: () => {
      wahl = t.id; const a = { ...(speicher.hole('lmTeil', {}) || {}) }; a[id] = wahl; speicher.merke('lmTeil', a); male();
    } }, t.name)));
    liste.replaceChildren(...info.filter((x) => x.teil === wahl).map((x) => h('section', { class: 'karte lm-zeile' },
      h('div', { class: 'station-kopf' }, h('p', { class: 'lm-text' }, x.text),
        x.mitMelodie ? h('span', { class: `lm-badge ${x.hoch >= S.ue ? '' : 'ruhig'}` }, x.hoch >= S.ue ? `bis ${nName(x.hoch, ton)}` : 'bequem') : h('span', { class: 'lm-badge ruhig' }, 'gesprochen')),
      h('div', { class: 'lm-kette', 'aria-label': `Vokale: ${x.kette.map((k) => k.anzeige).join(' ')}` }, x.kette.map((k) => kugel(k))),
      x.gruende.length ? h('ul', { class: 'lm-gruende' }, x.gruende.slice(0, 3).map((g) => h('li', null, g.text, g.uebung && uebungVon(g.uebung) ? h('b', null, ` → ${uebungVon(g.uebung).titel}`) : null)))
        : h('p', { class: 'leise klein' }, 'Keine besondere Hürde – gut zum Festigen.'),
      h('div', { class: 'lm-schritte' }, schritteVon(x).map((s) => { const b = bestes(x.zid, s.nr); return h('a', { class: 'lm-schritt', href: `#lied/${enc(id)}/ueben/${enc(x.zid)}/${s.nr}` }, h('span', { class: 'nr' }, String(s.nr)), h('span', null, s.titel), b != null ? h('span', { class: 'p' }, `${b} %`) : null); })))));
  }
  male();
  // Welche Übung hilft wo – und warum
  const jeUebung = new Map();
  for (const x of info) for (const g of x.gruende) {
    if (!g.uebung || !uebungVon(g.uebung)) continue;
    const e = jeUebung.get(g.uebung) || { zeilen: [], text: g.text, art: g.art };
    if (!e.zeilen.includes(x)) e.zeilen.push(x);
    jeUebung.set(g.uebung, e);
  }
  const hilfe = [...jeUebung.entries()].sort((a, b) => b[1].zeilen.length - a[1].zeilen.length).slice(0, 6).map(([uid, e]) => {
    const u = uebungVon(uid);
    const texte = [...new Set(e.zeilen.map((z) => kurz(z.text, 30)))];
    return h('a', { class: 'karte hinweis-karte', href: `#uebung/${enc(uid)}` }, uebSymbol(u),
      h('div', null, h('h3', null, u.titel), h('p', { class: 'leise klein', style: { marginTop: '2px' } }, `${e.zeilen.length === 1 ? '1 Zeile' : `${e.zeilen.length} Zeilen`}: ${texte.slice(0, 3).map((t) => `„${t}“`).join(', ')}${texte.length > 3 ? ' …' : ''}`),
        h('p', { class: 'klein', style: { marginTop: '4px' } }, h('b', null, 'Warum: '), e.text)), h('span', { class: 'pfeil' }, ic('weiter')));
  });
  return [h('section', { class: 'held' }, h('h1', null, `${lied0.titel || 'Lied'} üben`),
    h('p', null, 'Zeile für Zeile: erst die reinen Vokale, dann mit Text und Begleitung, dann der Weg in die Höhe.'),
    h('div', { class: 'chips', style: { marginTop: '12px' } },
      h('span', { class: 'chip', style: { background: 'rgba(255,255,255,.22)', color: '#fff' } }, `Dein Übergang: ${nName(S.ue, ton)}`),
      h('span', { class: 'chip', style: { background: 'rgba(255,255,255,.22)', color: '#fff' } }, `sicher bis ${nName(S.hoch, ton)}`),
      S.annahme ? h('a', { class: 'chip', href: '#stimme', style: { background: '#fff', color: '#2b1d24', minHeight: '44px' } }, 'Annahme – Stimmlage ermitteln') : null)),
  mitMel ? null : h('div', { class: 'karte leer' }, h('p', null, 'Zu diesem Lied gibt es noch keine Melodie. Lade beim Anlegen eine Gesangsaufnahme dazu – dann gibt es Vorsingen und Nachsingen je Zeile.'), h('a', { class: 'knopf', href: '#neu', style: { marginTop: '12px' } }, ic('plus'), 'Lied mit Audio anlegen')),
  chips, liste,
  hilfe.length ? h('h2', null, 'Welche Übung hilft wo') : null,
  hilfe.length ? h('p', { class: 'leise klein', style: { marginTop: '-4px' } }, 'Aus deinem Lied und deiner Stimme berechnet – tippe eine Übung an, um sie im Takt zu üben.') : null, ...hilfe];
}
function seiteLiedZeile(lied0, lied, T, st, info, zid, nrRoh, bestes) {
  const id = lied0.id, ton = lied.tonart;
  const z = lied.zeilen.find((x) => x.id === zid);
  if (!z) return nichtGefunden();
  const t = lied.teile.find((x) => x.id === z.teil);
  setzeKopf(`${t ? t.name : 'Zeile'} üben`, `#lied/${enc(id)}/ueben`);
  const schritte = T.p.zeilenSchritte(lied, zid, st);
  if (!schritte.length) return h('div', { class: 'karte leer' }, h('p', null, 'Für diese Zeile gibt es keine Übung.'));
  const zi0 = info.find((x) => x.zid === zid);
  const zs = lied.zeilen.filter((x) => x.text), zi = zs.indexOf(z);
  let k = Math.max(0, schritte.findIndex((s) => String(s.nr) === String(nrRoh)));
  const tabs = h('div', { class: 'lm-schritte', role: 'tablist' });
  const warum = h('div', { class: 'lm-warum' });
  const box = h('div'); let sp = null;
  aufraeumen.push(() => { if (sp) sp.stopp(); T.t.beendeSitzung(); });
  function tabsZeigen() {
    tabs.replaceChildren(...schritte.map((x, j) => { const b = bestes(zid, x.nr); return h('button', { class: `lm-schritt ${j === k ? 'an' : ''}`, role: 'tab', 'aria-selected': String(j === k), onclick: () => waehle(j) },
      h('span', { class: 'nr' }, String(x.nr)), h('span', null, x.titel), b != null ? h('span', { class: 'p' }, `${b} %`) : null); }));
  }
  function waehle(j) {
    k = j; if (sp) sp.stopp();
    const s = schritte[k];
    try { history.replaceState(null, '', `#lied/${enc(id)}/ueben/${enc(zid)}/${s.nr}`); } catch (e) { /* egal */ }
    tabsZeigen();
    fuelle(warum, ic('hinweis'), h('div', null, h('b', null, `Schritt ${s.nr} – warum: `), s.warum));
    box.replaceChildren();
    const weiterZu = k < schritte.length - 1 ? () => waehle(k + 1) : zi < zs.length - 1 ? () => { location.hash = `#lied/${enc(id)}/ueben/${enc(zs[zi + 1].id)}/1`; } : () => { location.hash = `#lied/${enc(id)}/ueben`; };
    sp = T.t.spieler(box, s.plan, { tonart: ton, meldung,
      weiterText: k < schritte.length - 1 ? `Weiter: Schritt ${schritte[k + 1].nr}` : zi < zs.length - 1 ? 'Nächste Zeile' : 'Zur Übersicht', onWeiter: weiterZu,
      onFertig: (e) => {
        merkeVerlauf({ art: 'zeile', liedId: id, zeile: zid, schritt: s.nr, titel: `„${kurz(z.text, 30)}“ · ${s.titel}`, prozent: prozentVon(e), teile: teileKurz(e) });
        bestesNeu(); tabsZeigen();
      } });
  }
  // nach dem Speichern die Bestwerte neu lesen
  const bestesNeu = () => { const neu = verlauf(); bestes = (z2, nr2) => { const e = neu.filter((x) => x.art === 'zeile' && x.liedId === id && x.zeile === z2 && String(x.schritt) === String(nr2) && x.prozent != null); return e.length ? Math.max(...e.map((x) => x.prozent)) : null; }; };
  waehle(k);
  const nav = h('div', { class: 'knopf-reihe' },
    zi > 0 ? h('a', { class: 'knopf', href: `#lied/${enc(id)}/ueben/${enc(zs[zi - 1].id)}` }, ic('zurueck'), 'Vorige Zeile') : null,
    h('a', { class: 'knopf', href: `#lied/${enc(id)}/ueben` }, 'Alle Zeilen'),
    zi < zs.length - 1 ? h('a', { class: 'knopf', href: `#lied/${enc(id)}/ueben/${enc(zs[zi + 1].id)}` }, 'Nächste Zeile', ic('weiter')) : null);
  return [h('section', { class: 'held' },
    h('p', { class: 'klein', style: { marginTop: 0 } }, `${t ? t.name : ''} · Zeile ${zi + 1} von ${zs.length}`),
    h('h1', { style: { fontSize: '26px', marginTop: '4px' } }, z.text),
    h('div', { class: 'held-kugeln', style: { flexWrap: 'wrap' } }, (zi0 ? zi0.kette : []).map((x) => kugel(x, 'mini'))),
    zi0 && zi0.mitMelodie ? h('p', { class: 'klein' }, `${nName(zi0.tief, ton)}–${nName(zi0.hoch, ton)}${lied.transponiert ? ` · transponiert ${lied.transponiert > 0 ? '+' : '−'}${Math.abs(lied.transponiert)}` : ''}`) : null),
  tabs, warum, box,
  zi0 && zi0.gruende.length ? h('details', { class: 'karte' }, h('summary', { class: 'klein', style: { minHeight: '44px', display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: '700' } }, 'Darauf achten in dieser Zeile'),
    h('ul', { class: 'lm-gruende', style: { marginTop: '6px' } }, zi0.gruende.map((g) => h('li', null, g.text)))) : null,
  nav];
}

// ================================================================ #verlauf
function seiteVerlauf() {
  setzeKopf('Verlauf', '#start'); setzeNav('start');
  const v = verlauf();
  const held = h('section', { class: 'held' }, h('h1', null, 'Verlauf'), h('p', null, 'Deine Einheiten und Übungen – gespeichert nur auf diesem Gerät.'));
  if (!v.length) return [held, h('div', { class: 'karte leer' }, h('p', null, 'Noch nichts geübt. Nach jeder Übung erscheint hier dein Prozentwert.'),
    h('a', { class: 'knopf haupt', href: '#einsingen', style: { marginTop: '14px' } }, ic('play'), 'Einsingen starten'))];
  const tage = new Map();
  for (const x of v) { const k = tagSchluessel(x.datum); if (!tage.has(k)) tage.set(k, []); tage.get(k).push(x); }
  let folge = 0; for (const d = new Date(); tage.has(tagSchluessel(d)); d.setDate(d.getDate() - 1)) folge++;
  const mittel = (a) => (a.length ? Math.round(a.reduce((s, x) => s + x, 0) / a.length) : null);
  const w7 = v.filter((x) => x.datum >= Date.now() - 7 * 864e5 && x.prozent != null && x.art !== 'einheit').map((x) => x.prozent);
  const zahlen = h('div', { class: 'vl-zahlen' },
    h('div', { class: 'vl-zahl' }, h('b', null, String(folge)), h('small', null, folge === 1 ? 'Tag in Folge' : 'Tage in Folge')),
    h('div', { class: 'vl-zahl' }, h('b', null, String(v.filter((x) => x.art === 'einheit').length)), h('small', null, 'Einheiten')),
    h('div', { class: 'vl-zahl' }, h('b', null, mittel(w7) != null ? `${mittel(w7)} %` : '–'), h('small', null, 'Ø 7 Tage')));
  // Balken: letzte 14 Tage (Durchschnitt aller gemessenen Übungen)
  const W = 350, H = 150, tage14 = [];
  for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const e = tage.get(tagSchluessel(d)) || []; tage14.push({ d, w: mittel(e.filter((x) => x.prozent != null && x.art !== 'einheit').map((x) => x.prozent)), n: e.length }); }
  const bw = W / 14;
  let svg = `<svg class="vl-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Durchschnitt der letzten 14 Tage"><defs><linearGradient id="vlg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff9a52"/><stop offset="1" stop-color="#a56bff"/></linearGradient></defs>`;
  svg += `<line x1="0" x2="${W}" y1="${H - 22 - 0.7 * (H - 40)}" y2="${H - 22 - 0.7 * (H - 40)}" stroke="#6fe3a8" stroke-dasharray="4 4" stroke-width="1"/><text class="achse" x="${W - 2}" y="${H - 26 - 0.7 * (H - 40)}" text-anchor="end">70 %</text>`;
  tage14.forEach((t, i) => {
    const x = i * bw + 4, hgt = t.w != null ? Math.max(3, (t.w / 100) * (H - 40)) : t.n ? 3 : 0;
    if (hgt) svg += `<rect x="${x}" y="${H - 22 - hgt}" width="${bw - 8}" height="${hgt}" rx="5" fill="${t.w != null ? 'url(#vlg)' : '#9d8c99'}"/>`;
    if (t.w != null) svg += `<text class="achse" x="${x + (bw - 8) / 2}" y="${H - 26 - hgt}" text-anchor="middle">${t.w}</text>`;
    if (i % 2 === 1 || i === 13) svg += `<text class="achse" x="${x + (bw - 8) / 2}" y="${H - 6}" text-anchor="middle">${t.d.getDate()}.</text>`;
  });
  svg += '</svg>';
  const tagListe = [...tage.entries()].sort((a, b) => b[1][0].datum - a[1][0].datum).slice(0, 21).map(([, eintraege]) => {
    const d = new Date(eintraege[0].datum);
    return h('div', null, h('p', { class: 'vl-tag' }, d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })),
      h('div', { class: 'eh-liste' }, eintraege.slice().reverse().map((x) => h('div', { class: 'eh-zeile' },
        h('div', null, h('b', null, x.art === 'einheit' ? `Einsingen${x.warm ? ' – warm gesungen' : ''}` : x.titel || x.uebung || 'Übung'),
          h('p', { class: 'leise klein' }, [new Date(x.datum).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }), x.art === 'einheit' ? `${x.anzahl} von ${x.von} Übungen` : x.inEinheit ? 'in der Einheit' : x.art === 'zeile' ? 'Liedzeile' : 'freie Übung',
            x.teile && x.teile.treff != null ? `Treffen ${x.teile.treff} %` : null].filter(Boolean).join(' · '))),
        h('b', { class: 'p' }, x.prozent != null ? `${x.prozent} %` : '–')))));
  });
  return [held, zahlen, h('section', { class: 'karte' }, h('h3', null, 'Die letzten 14 Tage'), h('p', { class: 'leise klein' }, 'Durchschnitt deiner gemessenen Übungen je Tag; die Linie zeigt 70 % („warm“).'), h('div', { html: svg, style: { marginTop: '8px' } })),
    ...tagListe,
    h('button', { class: 'knopf klein', style: { marginTop: '20px' }, onclick: () => { if (confirm('Den ganzen Verlauf auf diesem Gerät löschen?')) { speicher.merke('verlauf', []); meldung('Verlauf gelöscht'); zeige(); } } }, ic('loeschen'), 'Verlauf löschen')];
}

