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
  // Tiebreaker head-to-head entre equipos empatados
  const h2h = (a, b) => {
    let aPts = 0, bPts = 0, aGF = 0, bGF = 0, aGA = 0, bGA = 0;
    matches.forEach(m => {
      if (m.homeScore === "" || m.awayScore === "") return;
      const isAB = (m.home === a.name && m.away === b.name);
      const isBA = (m.home === b.name && m.away === a.name);
      if (!isAB && !isBA) return;
      const hg = +m.homeScore, ag = +m.awayScore;
      const aScore = isAB ? hg : ag, bScore = isAB ? ag : hg;
      aGF += aScore; aGA += bScore; bGF += bScore; bGA += aScore;
      if (aScore > bScore) aPts += 3;
      else if (aScore < bScore) bPts += 3;
      else { aPts += 1; bPts += 1; }
    });
    return (bPts - aPts) || ((bGF - bGA) - (aGF - aGA)) || (bGF - aGF);
  };
  return Object.values(t).sort((a, b) =>
    (b.pts - a.pts) || ((b.gf - b.ga) - (a.gf - a.ga)) || (b.gf - a.gf) || h2h(a, b)
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

// ── Puntuación Eliminatorias ────────────────────────────────────────────────
// Por cada equipo que el jugador pronostica que avanza a una ronda:
//   Clasificado a QF   → +9 pts
//   Clasificado a SF   → +11 pts
//   Clasificado a Final → +13 pts
//   Subcampeón         → +10 pts
//   Campeón            → +15 pts
// Puntuación de partido (1X2/exacto): solo si el emparejamiento coincide con el real
// Parámetros:
//   realBracket   → { r16, qf, sf, final } con winner en cada partido
//   predBracket   → igual pero construido desde preds del jugador
//   predResults   → { [fixtureId]: { h, a } } predicciones de resultado
//   realResults   → results de Firestore
//   realFixtures  → fixtures reales con group R16/QF/SF/FINAL
const KO_ROUND_PTS = { qf: 9, sf: 11, final: 13, champion: 15, runner: 10 };

export function scoreKnockout(realBracket, predBracket) {
  if (!realBracket || !predBracket) return { total: 0, detail: [] };

  let total = 0;
  const detail = [];

  // Equipos reales clasificados a cada ronda (ganadores de la ronda anterior)
  const realQF  = new Set(realBracket.r16.map(m => m.winner).filter(Boolean));
  const realSF  = new Set(realBracket.qf.map(m => m.winner).filter(Boolean));
  const realFin = new Set(realBracket.sf.map(m => m.winner).filter(Boolean));
  const realChampion = realBracket.final?.winner ?? null;
  const realRunner = realBracket.final
    ? (realBracket.final.winner === realBracket.final.home ? realBracket.final.away : realBracket.final.home)
    : null;

  // Equipos que el jugador pronostica que llegan a cada ronda
  const predQF  = new Set(predBracket.r16.map(m => m.winner).filter(Boolean));
  const predSF  = new Set(predBracket.qf.map(m => m.winner).filter(Boolean));
  const predFin = new Set(predBracket.sf.map(m => m.winner).filter(Boolean));
  const predChampion = predBracket.final?.winner ?? null;
  const predRunner = predBracket.final
    ? (predBracket.final.winner === predBracket.final.home ? predBracket.final.away : predBracket.final.home)
    : null;

  // Solo puntuar rondas donde ya hay resultados reales
  if (realQF.size > 0) {
    predQF.forEach(t => { if (realQF.has(t)) { total += KO_ROUND_PTS.qf; detail.push({ team: t, round: "QF", pts: KO_ROUND_PTS.qf }); } });
  }
  if (realSF.size > 0) {
    predSF.forEach(t => { if (realSF.has(t)) { total += KO_ROUND_PTS.sf; detail.push({ team: t, round: "SF", pts: KO_ROUND_PTS.sf }); } });
  }
  if (realFin.size > 0) {
    predFin.forEach(t => { if (realFin.has(t)) { total += KO_ROUND_PTS.final; detail.push({ team: t, round: "Final", pts: KO_ROUND_PTS.final }); } });
  }
  if (realChampion && predChampion === realChampion) {
    total += KO_ROUND_PTS.champion; detail.push({ team: predChampion, round: "Campeón", pts: KO_ROUND_PTS.champion });
  }
  if (realRunner && predRunner === realRunner && realBracket.final?.winner) {
    total += KO_ROUND_PTS.runner; detail.push({ team: predRunner, round: "Subcampeón", pts: KO_ROUND_PTS.runner });
  }

  return { total, detail };
}

// Puntuación de partido KO: solo si el emparejamiento coincide (mismos equipos, en algún orden)
export function scoreKnockoutMatch(realMatch, predResult) {
  if (!realMatch?.result || !predResult) return null;
  const { homeScore: rh, awayScore: ra } = realMatch.result;
  if (rh === "" || rh === undefined || ra === "" || ra === undefined) return null;
  const ph = predResult.h, pa = predResult.a;
  if (ph === "" || ph === undefined || pa === "" || pa === undefined) return null;
  return scoreMatch(+rh, +ra, +ph, +pa);
}
// Posicion: 1º=4pts, 2º=3pts, 3º=2pts, 4º=1pt
// Clasificado a R16: +5pts por cada equipo pronosticado en top-3 que realmente clasifica
// Para 3ºs: solo bonus si el jugador también los predijo entre los mejores 3ºs (predQualifiedSet)
const POSITION_PTS = [4, 3, 2, 1];
export function scoreStandings(realOrder, predictedOrder, qualifiedSet = new Set(), predQualifiedSet = null) {
  let total = 0;
  const hits = [];
  realOrder.forEach((realName, i) => {
    const predName = predictedOrder[i];
    const correctPos = predName === realName;
    const positionPts = correctPos ? POSITION_PTS[i] : 0;
    // Para 1º/2º: el equipo siempre clasifica si acaba 1º/2º (bonus si realmente clasificó)
    // Para 3º: solo si el jugador lo predijo entre los mejores 3ºs Y realmente clasificó
    const predWouldQualify = i < 2 ? true : (predQualifiedSet ? predQualifiedSet.has(predName) : true);
    const qualBonus = i < 3 && predName && predWouldQualify && qualifiedSet.has(predName) ? 5 : 0;
    const pts = positionPts + qualBonus;
    total += pts;
    hits.push({ pos: i + 1, realName, predName, correctPos, positionPts, qualBonus, pts });
  });
  return { total, hits };
}
