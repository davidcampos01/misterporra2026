export function getStandings(teamsList, matches) {
  const t = {};
  teamsList.forEach(tm => { t[tm.name] = { ...tm, pts: 0, gf: 0, ga: 0, mp: 0 }; });
  matches.forEach(m => {
    if (m.homeScore === "" || m.awayScore === "") return;
    const h = +m.homeScore, a = +m.awayScore;
    t[m.home].mp++; t[m.away].mp++;
    t[m.home].gf += h; t[m.home].ga += a;
    t[m.away].gf += a; t[m.away].ga += h;
    if (h > a)      { t[m.home].pts += 3; }
    else if (h < a) { t[m.away].pts += 3; }
    else            { t[m.home].pts += 1; t[m.away].pts += 1; }
  });
  return Object.values(t).sort(
    (a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf
  );
}

export function get1X2(h, a) {
  return h > a ? "1" : h < a ? "2" : "X";
}

export function scoreMatch(rh, ra, ph, pa) {
  const hit1x2  = get1X2(rh, ra) === get1X2(ph, pa);
  const hitDiff  = (rh - ra) === (ph - pa);
  const hitExact = rh === ph && ra === pa;
  let pts = 0;
  if (hit1x2) { pts += 4; if (hitDiff) { pts += 2; if (hitExact) pts += 4; } }
  return { pts, hit1x2, hitDiff, hitExact };
}
