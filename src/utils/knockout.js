import { getStandings } from "./scoring";

// Tabla oficial FIFA WC2026: grupos elegibles para cada slot de tercero
// Ningún tercero puede enfrentarse al 1º de su propio grupo
const WC26_THIRD_SLOT_ELIGIBLE = {
  T1: new Set(["A","B","C","D","F"]),   // enfrenta a 1E
  T2: new Set(["C","D","F","G","H"]),   // enfrenta a 1I
  T3: new Set(["B","E","F","I","J"]),   // enfrenta a 1D
  T4: new Set(["A","E","H","I","J"]),   // enfrenta a 1G
  T5: new Set(["C","E","F","H","I"]),   // enfrenta a 1A
  T6: new Set(["E","H","I","J","K"]),   // enfrenta a 1L
  T7: new Set(["E","F","G","I","J"]),   // enfrenta a 1B
  T8: new Set(["D","E","I","J","L"]),   // enfrenta a 1K
};

// Asigna los 8 mejores terceros a los slots T1-T8 respetando las restricciones de grupo.
// Usa backtracking: el mejor tercero va al primer slot compatible.
function assignThirdsWC26(rankedThirds) {
  const slotKeys = ["T1","T2","T3","T4","T5","T6","T7","T8"];
  const assignment = {};
  function bt(idx) {
    if (idx === rankedThirds.length) return true;
    const t = rankedThirds[idx];
    for (const s of slotKeys) {
      if (assignment[s] || !WC26_THIRD_SLOT_ELIGIBLE[s]?.has(t.groupLetter)) continue;
      assignment[s] = t;
      if (bt(idx + 1)) return true;
      delete assignment[s];
    }
    return false;
  }
  bt(0);
  return assignment;
}

// Obtiene clasificados: 1º y 2º de cada grupo + N mejores 3ºs
// fixtures y groups se pasan desde el contexto de torneo
export function getQualifiers(results, fixtures, groups, numBest3rds = 8) {
  const groupStandings = {};
  Object.keys(groups).forEach(g => {
    const gf = fixtures.filter(f => f.group === g).map(f => ({
      home: f.home, away: f.away,
      homeScore: results[f.id]?.homeScore ?? "",
      awayScore: results[f.id]?.awayScore ?? "",
    }));
    groupStandings[g] = getStandings(groups[g].teams, gf);
  });

  const slots = {};
  Object.keys(groupStandings).forEach(g => {
    const st = groupStandings[g];
    slots[`1${g}`] = { ...st[0], slot: `1${g}` };
    slots[`2${g}`] = { ...st[1], slot: `2${g}` };
    slots[`3${g}`] = { ...st[2], slot: `3${g}`, pts3: st[2]?.pts, gf3: st[2]?.gf, gd3: (st[2]?.gf ?? 0) - (st[2]?.ga ?? 0) };
  });

  const thirds = Object.keys(groups).map(g => ({ ...slots[`3${g}`], groupLetter: g })).filter(Boolean);
  thirds.sort((a, b) => (b.pts3 - a.pts3) || (b.gd3 - a.gd3) || (b.gf3 - a.gf3));
  const top = thirds.slice(0, numBest3rds);
  if (numBest3rds === 8) {
    // WC26: asignación con tabla FIFA para no emparejar mismo grupo
    const assigned = assignThirdsWC26(top);
    Object.entries(assigned).forEach(([k, t]) => { slots[k] = { ...t, slot: k }; });
    // Fallback: slots sin asignar (no debería ocurrir con datos correctos)
    let fi = 0;
    ["T1","T2","T3","T4","T5","T6","T7","T8"].forEach(k => {
      if (!slots[k]) { slots[k] = { ...top[fi++], slot: k }; }
    });
  } else {
    top.forEach((t, i) => { slots[`T${i + 1}`] = { ...t, slot: `T${i + 1}` }; });
  }

  return slots;
}

// Obtiene clasificados usando predicciones de un jugador
export function getQualifiersFromPreds(playerPreds, fixtures, groups, numBest3rds = 8) {
  const groupStandings = {};
  Object.keys(groups).forEach(g => {
    const gf = fixtures.filter(f => f.group === g).map(f => {
      const p = playerPreds[f.id];
      return {
        home: f.home, away: f.away,
        homeScore: p?.h !== undefined && p?.h !== "" ? p.h : "",
        awayScore: p?.a !== undefined && p?.a !== "" ? p.a : "",
      };
    });
    groupStandings[g] = getStandings(groups[g].teams, gf);
  });
  const slots = {};
  Object.keys(groupStandings).forEach(g => {
    const st = groupStandings[g];
    slots[`1${g}`] = { ...st[0], slot: `1${g}` };
    slots[`2${g}`] = { ...st[1], slot: `2${g}` };
    slots[`3${g}`] = { ...st[2], slot: `3${g}`, pts3: st[2]?.pts, gf3: st[2]?.gf, gd3: (st[2]?.gf ?? 0) - (st[2]?.ga ?? 0) };
  });
  const thirds = Object.keys(groups).map(g => ({ ...slots[`3${g}`], groupLetter: g })).filter(Boolean);
  thirds.sort((a, b) => (b.pts3 - a.pts3) || (b.gd3 - a.gd3) || (b.gf3 - a.gf3));
  const top = thirds.slice(0, numBest3rds);
  if (numBest3rds === 8) {
    const assigned = assignThirdsWC26(top);
    Object.entries(assigned).forEach(([k, t]) => { slots[k] = { ...t, slot: k }; });
    let fi = 0;
    ["T1","T2","T3","T4","T5","T6","T7","T8"].forEach(k => {
      if (!slots[k]) { slots[k] = { ...top[fi++], slot: k }; }
    });
  } else {
    top.forEach((t, i) => { slots[`T${i + 1}`] = { ...t, slot: `T${i + 1}` }; });
  }
  return slots;
}

// Estructura fija del bracket R32 de Mundial 2026 según FIFA 2026
// 16 partidos: 4 cruces 2º vs 2º + 4 cruces 1º vs 2º + 8 cruces 1º vs 3º
// Los terceros (T1-T8) se asignan dinámicamente según ranking de clasificación
export const R32_SLOTS = [
  { id: "R32_1",  slotA: "1E", slotB: "T1" },   // 1ºE vs 3º(ABCDF)
  { id: "R32_2",  slotA: "1I", slotB: "T2" },   // 1ºI vs 3º(CDFGH)
  { id: "R32_3",  slotA: "2A", slotB: "2B" },   // 2ºA vs 2ºB
  { id: "R32_4",  slotA: "1F", slotB: "2C" },   // 1ºF vs 2ºC
  { id: "R32_5",  slotA: "2K", slotB: "2L" },   // 2ºK vs 2ºL
  { id: "R32_6",  slotA: "1H", slotB: "2J" },   // 1ºH vs 2ºJ
  { id: "R32_7",  slotA: "1D", slotB: "T3" },   // 1ºD vs 3º(BEFIJ)
  { id: "R32_8",  slotA: "1G", slotB: "T4" },   // 1ºG vs 3º(AEHIJ)
  { id: "R32_9",  slotA: "1C", slotB: "2F" },   // 1ºC vs 2ºF
  { id: "R32_10", slotA: "2E", slotB: "2I" },   // 2ºE vs 2ºI
  { id: "R32_11", slotA: "1A", slotB: "T5" },   // 1ºA vs 3º(CEFHI)
  { id: "R32_12", slotA: "1L", slotB: "T6" },   // 1ºL vs 3º(EHIJK)
  { id: "R32_13", slotA: "1J", slotB: "2H" },   // 1ºJ vs 2ºH
  { id: "R32_14", slotA: "2D", slotB: "2G" },   // 2ºD vs 2ºG
  { id: "R32_15", slotA: "1B", slotB: "T7" },   // 1ºB vs 3º(EFGIJ)
  { id: "R32_16", slotA: "1K", slotB: "T8" },   // 1ºK vs 3º(DEIJL)
];

// Árbol del bracket: qué partido R32 alimenta cada R16, QF, SF
// R16[i] = ganadores de R32[i*2] vs R32[i*2+1]
// QF[i]  = ganadores de R16[i*2] vs R16[i*2+1]
// SF[0]  = ganadores de QF[0] vs QF[1], SF[1] = QF[2] vs QF[3]
// Final  = ganadores de SF[0] vs SF[1]

export function buildBracket(qualifiers, knockoutResults = {}) {
  const resolve = (slot) => {
    const team = qualifiers[slot];
    if (!team) return { name: slot, flag: "❓", tbd: true };
    return team;
  };

  const getWinner = (matchId, teamA, teamB) => {
    const r = knockoutResults[matchId];
    if (!r || r.homeScore === "" || r.awayScore === "" || r.homeScore === undefined) return null;
    const h = +r.homeScore, a = +r.awayScore;
    // En empate, se guarda winner explícito
    if (r.winner) return r.winner === "A" ? teamA : teamB;
    if (h > a) return teamA;
    if (h < a) return teamB;
    return null;
  };

  // R32: resolver equipos desde slots
  const r32 = R32_SLOTS.map(m => ({
    id: m.id,
    teamA: resolve(m.slotA),
    teamB: resolve(m.slotB),
    slotA: m.slotA,
    slotB: m.slotB,
  }));

  const winnerOf = (match) => getWinner(match.id, match.teamA, match.teamB);

  // R16: 8 partidos (ganador R32[0] vs R32[1], etc.)
  const r16 = Array.from({ length: 8 }, (_, i) => {
    const wA = winnerOf(r32[i * 2]) ?? { name: "?", flag: "❓", tbd: true };
    const wB = winnerOf(r32[i * 2 + 1]) ?? { name: "?", flag: "❓", tbd: true };
    const id = `R16_${i + 1}`;
    return { id, teamA: wA, teamB: wB };
  });

  // QF: 4 partidos
  const qf = Array.from({ length: 4 }, (_, i) => {
    const wA = winnerOf(r16[i * 2]) ?? { name: "?", flag: "❓", tbd: true };
    const wB = winnerOf(r16[i * 2 + 1]) ?? { name: "?", flag: "❓", tbd: true };
    const id = `QF_${i + 1}`;
    return { id, teamA: wA, teamB: wB };
  });

  // SF: 2 partidos
  const sf = Array.from({ length: 2 }, (_, i) => {
    const wA = winnerOf(qf[i * 2]) ?? { name: "?", flag: "❓", tbd: true };
    const wB = winnerOf(qf[i * 2 + 1]) ?? { name: "?", flag: "❓", tbd: true };
    const id = `SF_${i + 1}`;
    return { id, teamA: wA, teamB: wB };
  });

  // 3er lugar (perdedores SF)
  const getLoser = (match) => {
    const r = knockoutResults[match.id];
    if (!r || r.homeScore === "" || r.homeScore === undefined) return null;
    const h = +r.homeScore, a = +r.awayScore;
    if (r.winner) return r.winner === "A" ? match.teamB : match.teamA;
    if (h > a) return match.teamB;
    if (h < a) return match.teamA;
    return null;
  };
  const loserSF1 = getLoser(sf[0]) ?? { name: "?", flag: "❓", tbd: true };
  const loserSF2 = getLoser(sf[1]) ?? { name: "?", flag: "❓", tbd: true };
  const tercerPuesto = { id: "3RD", teamA: loserSF1, teamB: loserSF2 };

  // Final
  const wSF1 = winnerOf(sf[0]) ?? { name: "?", flag: "❓", tbd: true };
  const wSF2 = winnerOf(sf[1]) ?? { name: "?", flag: "❓", tbd: true };
  const final = { id: "FINAL", teamA: wSF1, teamB: wSF2 };

  return { r32, r16, qf, sf, tercerPuesto, final };
}

// ── Tabla oficial UEFA Euro 2024 para asignación de terceros en R16 ───────────
// Clave: 4 grupos clasificados como terceros, ordenados alfab. (ej: "CDEF")
// Valor: { posición → letra del grupo cuyo 3er clasificado va ahí }
// Posiciones: B=vs1B(m1038), C=vs1C(m1043), E=vs1E(m1041), F=vs1F(m1040)
// Garantiza que ningún 3er clasificado se enfrente a un equipo de su mismo grupo
const UEFA_THIRD_PLACE_TABLE = {
  ABCD: { B:"A", C:"D", E:"B", F:"C" },
  ABCE: { B:"A", C:"E", E:"B", F:"C" },
  ABCF: { B:"A", C:"F", E:"B", F:"C" },
  ABDE: { B:"D", C:"E", E:"A", F:"B" },
  ABDF: { B:"D", C:"F", E:"A", F:"B" },
  ABEF: { B:"E", C:"F", E:"A", F:"B" },
  ACDE: { B:"E", C:"D", E:"C", F:"A" },
  ACDF: { B:"F", C:"D", E:"C", F:"A" },
  ACEF: { B:"E", C:"F", E:"C", F:"A" },
  ADEF: { B:"E", C:"F", E:"D", F:"A" },
  BCDE: { B:"E", C:"D", E:"C", F:"B" },
  BCDF: { B:"F", C:"D", E:"C", F:"B" },
  BCEF: { B:"F", C:"E", E:"C", F:"B" },
  BDEF: { B:"F", C:"E", E:"D", F:"B" },
  CDEF: { B:"F", C:"E", E:"D", F:"C" },
};

// Estructura R16 Euro 2024 (orden importa: pares 0-1, 2-3, 4-5, 6-7 forman los QF)
// slotA/slotB: posición fija | thirdPos: posición de la tabla UEFA (B/C/E/F)
// Verificado con Euro 2024 real: 1037=1Avs2C, 1038=1Bvs3F, 1039=2Dvs2E,
//   1040=1Fvs3C, 1041=1Evs3D, 1042=1Dvs2F, 1043=1Cvs3E, 1044=2Avs2B
const EURO_R16_STRUCTURE = [
  { matchId: 1037, slotA: "1A", slotB: "2C"  },  // fijo
  { matchId: 1038, slotA: "1B", thirdPos: "B" }, // 1B vs 3er del grupo asignado por tabla
  { matchId: 1039, slotA: "2D", slotB: "2E"  },  // fijo
  { matchId: 1040, slotA: "1F", thirdPos: "F" }, // 1F vs 3er del grupo asignado por tabla
  { matchId: 1041, slotA: "1E", thirdPos: "E" }, // 1E vs 3er del grupo asignado por tabla
  { matchId: 1042, slotA: "1D", slotB: "2F"  },  // fijo
  { matchId: 1043, slotA: "1C", thirdPos: "C" }, // 1C vs 3er del grupo asignado por tabla
  { matchId: 1044, slotA: "2A", slotB: "2B"  },  // fijo
];

// Bracket de PREDICCIONES del jugador para Euro (6 grupos, R16 via tabla UEFA oficial)
// Los terceros se emparejan según qué grupos clasifican, evitando mismo-grupo
export function buildPredBracket(fixtures, playerPreds, groups, numBest3rds = 4) {
  const qualifiers = getQualifiersFromPreds(playerPreds, fixtures, groups, numBest3rds);

  // Determinar los 4 grupos cuyos 3ºs clasifican (los mejores por pts/DG/GF)
  const allThirds = Object.keys(groups).map(g => ({
    group: g,
    pts: qualifiers[`3${g}`]?.pts3 ?? -1,
    gd:  qualifiers[`3${g}`]?.gd3  ?? -999,
    gf:  qualifiers[`3${g}`]?.gf3  ?? -999,
  }));
  allThirds.sort((a, b) => (b.pts - a.pts) || (b.gd - a.gd) || (b.gf - a.gf));
  const comboKey = allThirds.slice(0, numBest3rds).map(t => t.group).sort().join("");
  const allocation = UEFA_THIRD_PLACE_TABLE[comboKey] ?? {};

  const getPredWinner = (home, away, matchId) => {
    if (!home || !away) return null;
    const p = playerPreds?.[matchId];
    if (!p || p.h === "" || p.h === undefined || p.a === "" || p.a === undefined) return null;
    if (+p.h > +p.a) return home;
    if (+p.h < +p.a) return away;
    // Empate → desempate por penaltis pronosticados
    if (p.penH !== "" && p.penH !== undefined && p.penA !== "" && p.penA !== undefined) {
      if (+p.penH > +p.penA) return home;
      if (+p.penH < +p.penA) return away;
    }
    return null;
  };

  // R16: equipos desde clasificados predichos + tabla UEFA para terceros
  const r16 = EURO_R16_STRUCTURE.map(slot => {
    const home = qualifiers[slot.slotA]?.name ?? null;
    let away;
    if (slot.slotB) {
      away = qualifiers[slot.slotB]?.name ?? null;
    } else {
      const srcGroup = allocation[slot.thirdPos];
      away = srcGroup ? (qualifiers[`3${srcGroup}`]?.name ?? null) : null;
    }
    const winner = getPredWinner(home, away, slot.matchId);
    const p = playerPreds?.[slot.matchId];
    const hasPred = home && away && p && p.h !== "" && p.h !== undefined && p.a !== "" && p.a !== undefined;
    return { id: slot.matchId, home: home ?? "?", away: away ?? "?", predResult: hasPred ? p : null, winner };
  });

  const qfFx = [...fixtures.filter(f => f.group === "QF")].sort((a, b) => a.id - b.id);
  const sfFx = [...fixtures.filter(f => f.group === "SF")].sort((a, b) => a.id - b.id);
  const finFx = fixtures.find(f => f.group === "FINAL") ?? null;

  // QF: ganadores R16[i*2] vs R16[i*2+1]
  const qf = qfFx.map((m, i) => {
    const home = r16[i * 2]?.winner ?? null;
    const away = r16[i * 2 + 1]?.winner ?? null;
    const winner = getPredWinner(home, away, m.id);
    const p = playerPreds?.[m.id];
    const hasPred = home && away && p && p.h !== "" && p.h !== undefined && p.a !== "" && p.a !== undefined;
    return { ...m, home: home ?? "?", away: away ?? "?", predResult: hasPred ? p : null, winner };
  });

  // SF: ganadores QF[i*2] vs QF[i*2+1]
  const sf = sfFx.map((m, i) => {
    const home = qf[i * 2]?.winner ?? null;
    const away = qf[i * 2 + 1]?.winner ?? null;
    const winner = getPredWinner(home, away, m.id);
    const p = playerPreds?.[m.id];
    const hasPred = home && away && p && p.h !== "" && p.h !== undefined && p.a !== "" && p.a !== undefined;
    return { ...m, home: home ?? "?", away: away ?? "?", predResult: hasPred ? p : null, winner };
  });

  // FINAL
  const final = finFx ? (() => {
    const home = sf[0]?.winner ?? null;
    const away = sf[1]?.winner ?? null;
    const winner = getPredWinner(home, away, finFx.id);
    const p = playerPreds?.[finFx.id];
    const hasPred = home && away && p && p.h !== "" && p.h !== undefined && p.a !== "" && p.a !== undefined;
    return { ...finFx, home: home ?? "?", away: away ?? "?", predResult: hasPred ? p : null, winner };
  })() : null;

  return { r16, qf, sf, final };
}


// Los partidos de eliminatorias están en fixtures con group="R16"/"QF"/"SF"/"FINAL"
// Los equipos (home/away) son strings — buscar flag en flagMap del componente
export function buildEuroBracket(fixtures, results) {
  const sort = (arr) => [...arr].sort((a, b) => a.id - b.id);
  const r16  = sort(fixtures.filter(f => f.group === "R16"));
  const qf   = sort(fixtures.filter(f => f.group === "QF"));
  const sf   = sort(fixtures.filter(f => f.group === "SF"));
  const fin  = fixtures.find(f => f.group === "FINAL") ?? null;

  const enrichMatch = (m) => {
    const r = results[m.id];
    const hasResult = r && r.homeScore !== "" && r.homeScore !== undefined;
    let winner = null;
    if (hasResult) {
      const h = +r.homeScore, a = +r.awayScore;
      if (r.winner === "A") winner = m.home;
      else if (r.winner === "B") winner = m.away;
      else if (h > a) winner = m.home;
      else if (h < a) winner = m.away;
      else if (r.penaltyHome !== "" && r.penaltyHome !== undefined) {
        if (+r.penaltyHome > +r.penaltyAway) winner = m.home;
        else if (+r.penaltyHome < +r.penaltyAway) winner = m.away;
      }
    }
    return { ...m, result: hasResult ? r : null, winner };
  };

  return {
    r16:   r16.map(enrichMatch),
    qf:    qf.map(enrichMatch),
    sf:    sf.map(enrichMatch),
    final: fin ? enrichMatch(fin) : null,
  };
}

// ── Bracket real de Mundial 2026 ──────────────────────────────────────────────
// Usa R32_SLOTS + qualifiers para construir el árbol completo con resultados
// Requiere que las fixtures de knock-out existan en el array (group="R32","R16","QF","SF","FINAL")
export function buildWC26Bracket(fixtures, results, qualifiers) {
  const sort = (arr) => [...arr].sort((a, b) => a.id - b.id);
  const r32Fx = sort(fixtures.filter(f => f.group === "R32" || f.stage === "LAST_32"));
  const r16Fx = sort(fixtures.filter(f => f.group === "R16" || f.stage === "LAST_16"));
  const qfFx  = sort(fixtures.filter(f => f.group === "QF"  || f.stage === "QUARTER_FINALS"));
  const sfFx  = sort(fixtures.filter(f => f.group === "SF"  || f.stage === "SEMI_FINALS"));
  const finFx = fixtures.find(f => f.group === "FINAL" || f.stage === "FINAL") ?? null;
  if (!r32Fx.length) return null; // KO fixtures no añadidas aún

  const resolve = (slot) => qualifiers?.[slot] ?? { name: slot, flag: "❓", tbd: true };

  const enrichMatch = (m) => {
    const r = results[m.id];
    const hasResult = r && r.homeScore !== "" && r.homeScore !== undefined;
    let winner = null;
    if (hasResult) {
      const h = +r.homeScore, a = +r.awayScore;
      if (r.winner === "A") winner = m.home;
      else if (r.winner === "B") winner = m.away;
      else if (h > a) winner = m.home;
      else if (h < a) winner = m.away;
      else if (r.penaltyHome !== "" && r.penaltyHome !== undefined) {
        winner = +r.penaltyHome > +r.penaltyAway ? m.home : m.away;
      }
    }
    return { ...m, result: hasResult ? r : null, winner };
  };

  const r32 = R32_SLOTS.map((slot, i) => {
    const teamA = resolve(slot.slotA), teamB = resolve(slot.slotB);
    const fx = r32Fx[i];
    if (!fx) return { id: null, home: teamA.name, away: teamB.name, result: null, winner: null };
    return enrichMatch({ ...fx, home: teamA.name, away: teamB.name });
  });

  const r16 = r16Fx.map((fx, i) => {
    const home = r32[i * 2]?.winner ?? null;
    const away = r32[i * 2 + 1]?.winner ?? null;
    return enrichMatch({ ...fx, home: home ?? "?", away: away ?? "?" });
  });

  const qf = qfFx.map((fx, i) => {
    const home = r16[i * 2]?.winner ?? null;
    const away = r16[i * 2 + 1]?.winner ?? null;
    return enrichMatch({ ...fx, home: home ?? "?", away: away ?? "?" });
  });

  const sf = sfFx.map((fx, i) => {
    const home = qf[i * 2]?.winner ?? null;
    const away = qf[i * 2 + 1]?.winner ?? null;
    return enrichMatch({ ...fx, home: home ?? "?", away: away ?? "?" });
  });

  const final = finFx ? (() => {
    const home = sf[0]?.winner ?? null;
    const away = sf[1]?.winner ?? null;
    return enrichMatch({ ...finFx, home: home ?? "?", away: away ?? "?" });
  })() : null;

  return { r32, r16, qf, sf, final };
}

// ── Bracket de PREDICCIONES del jugador para Mundial 2026 ────────────────────
// T1-T8 = los 8 mejores 3ºs ordenados por pts/DG/GF.
// Usa IDs sintéticos (R32_1, R16_1…) cuando aún no hay fixtures KO en Firestore.
export function buildPredBracketWC26(fixtures, playerPreds, groups, numBest3rds = 8) {
  const qualifiers = getQualifiersFromPreds(playerPreds, fixtures, groups, numBest3rds);

  const sort = (arr) => [...arr].sort((a, b) => a.id - b.id);
  const r32Fx = sort(fixtures.filter(f => f.group === "R32" || f.stage === "LAST_32"));
  const r16Fx = sort(fixtures.filter(f => f.group === "R16" || f.stage === "LAST_16"));
  const qfFx  = sort(fixtures.filter(f => f.group === "QF"  || f.stage === "QUARTER_FINALS"));
  const sfFx  = sort(fixtures.filter(f => f.group === "SF"  || f.stage === "SEMI_FINALS"));
  const finFx = fixtures.find(f => f.group === "FINAL" || f.stage === "FINAL") ?? null;

  const mkId = (prefix, i) => `${prefix}_${i + 1}`;

  const resolve = (slot) => qualifiers[slot] ?? { name: slot, flag: "❓", tbd: true };

  const getPredWinner = (home, away, matchId) => {
    if (!home || !away || home === "?" || away === "?") return null;
    const p = playerPreds?.[matchId];
    if (!p || p.h === "" || p.h === undefined || p.a === "" || p.a === undefined) return null;
    if (+p.h > +p.a) return home;
    if (+p.h < +p.a) return away;
    if (p.penH !== "" && p.penH !== undefined && p.penA !== "" && p.penA !== undefined) {
      return +p.penH > +p.penA ? home : away;
    }
    return null;
  };

  const r32 = R32_SLOTS.map((slot, i) => {
    const teamA = resolve(slot.slotA), teamB = resolve(slot.slotB);
    const fx = r32Fx[i];
    const id = fx?.id ?? slot.id;
    const home = teamA.name, away = teamB.name;
    const winner = getPredWinner(home, away, id);
    const p = playerPreds?.[id];
    const hasPred = home && away && home !== "?" && away !== "?" && p && p.h !== "" && p.h !== undefined;
    return { id, home, away, predResult: hasPred ? p : null, winner };
  });

  const r16 = Array.from({ length: 8 }, (_, i) => {
    const fx = r16Fx[i];
    const id = fx?.id ?? mkId("R16", i);
    const home = r32[i * 2]?.winner ?? null;
    const away = r32[i * 2 + 1]?.winner ?? null;
    const winner = getPredWinner(home, away, id);
    const p = playerPreds?.[id];
    const hasPred = home && away && p && p.h !== "" && p.h !== undefined;
    return { id, home: home ?? "?", away: away ?? "?", predResult: hasPred ? p : null, winner };
  });

  const qf = Array.from({ length: 4 }, (_, i) => {
    const fx = qfFx[i];
    const id = fx?.id ?? mkId("QF", i);
    const home = r16[i * 2]?.winner ?? null;
    const away = r16[i * 2 + 1]?.winner ?? null;
    const winner = getPredWinner(home, away, id);
    const p = playerPreds?.[id];
    const hasPred = home && away && p && p.h !== "" && p.h !== undefined;
    return { id, home: home ?? "?", away: away ?? "?", predResult: hasPred ? p : null, winner };
  });

  const sf = Array.from({ length: 2 }, (_, i) => {
    const fx = sfFx[i];
    const id = fx?.id ?? mkId("SF", i);
    const home = qf[i * 2]?.winner ?? null;
    const away = qf[i * 2 + 1]?.winner ?? null;
    const winner = getPredWinner(home, away, id);
    const p = playerPreds?.[id];
    const hasPred = home && away && p && p.h !== "" && p.h !== undefined;
    return { id, home: home ?? "?", away: away ?? "?", predResult: hasPred ? p : null, winner };
  });

  const finalId = finFx?.id ?? "FINAL";
  const final = (() => {
    const home = sf[0]?.winner ?? null;
    const away = sf[1]?.winner ?? null;
    const winner = getPredWinner(home, away, finalId);
    const p = playerPreds?.[finalId];
    const hasPred = home && away && p && p.h !== "" && p.h !== undefined;
    return { id: finalId, home: home ?? "?", away: away ?? "?", predResult: hasPred ? p : null, winner };
  })();

  return { r32, r16, qf, sf, final };
}
