const P = await import(process.argv[2]);
for (const t of ['Are we hypnotised?', 'open your eyes', 'Welcome to the fake zombies living']) {
  const r = P.zeileZuVokalen(t, 'en');
  console.log(t, JSON.stringify(r.map(w => [w.wort, w.silben.map(s => s.text + ':' + s.vokal + '/' + s.gleit + '/' + s.anzeige)])));
  console.log('  UEB', JSON.stringify(P.uebergaenge(r)).slice(0, 600));
}
