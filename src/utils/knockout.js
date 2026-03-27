import { getStandings } from "./scoring";

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

  const thirds = Object.keys(groups).map(g => slots[`3${g}`]).filter(Boolean);
  thirds.sort((a, b) => (b.pts3 - a.pts3) || (b.gd3 - a.gd3) || (b.gf3 - a.gf3));
  thirds.slice(0, numBest3rds).forEach((t, i) => { slots[`T${i + 1}`] = { ...t, slot: `T${i + 1}` }; });

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
  const thirds = Object.keys(groups).map(g => slots[`3${g}`]).filter(Boolean);
  thirds.sort((a, b) => (b.pts3 - a.pts3) || (b.gd3 - a.gd3) || (b.gf3 - a.gf3));
  thirds.slice(0, numBest3rds).forEach((t, i) => { slots[`T${i + 1}`] = { ...t, slot: `T${i + 1}` }; });
  return slots;
}

// Estructura fija del bracket R32 de Mundial 2026
// 16 partidos: 12 cruces 1º vs 2º (sin mismo grupo) + 4 partidos entre mejores 3ºs
// Organizados en 4 secciones que confluyen en Semifinales
export const R32_SLOTS = [
  // Sección 1 → SF izq
  { id: "R32_1",  slotA: "1A", slotB: "2G" },
  { id: "R32_2",  slotA: "1B", slotB: "2H" },
  { id: "R32_3",  slotA: "T1", slotB: "T2" },
  { id: "R32_4",  slotA: "T3", slotB: "T4" },
  // Sección 2 → SF izq
  { id: "R32_5",  slotA: "1C", slotB: "2I" },
  { id: "R32_6",  slotA: "1D", slotB: "2J" },
  { id: "R32_7",  slotA: "T5", slotB: "T6" },
  { id: "R32_8",  slotA: "T7", slotB: "T8" },
  // Sección 3 → SF der
  { id: "R32_9",  slotA: "1E", slotB: "2K" },
  { id: "R32_10", slotA: "1F", slotB: "2L" },
  { id: "R32_11", slotA: "1G", slotB: "2A" },
  { id: "R32_12", slotA: "1H", slotB: "2B" },
  // Sección 4 → SF der
  { id: "R32_13", slotA: "1I", slotB: "2C" },
  { id: "R32_14", slotA: "1J", slotB: "2D" },
  { id: "R32_15", slotA: "1K", slotB: "2E" },
  { id: "R32_16", slotA: "1L", slotB: "2F" },
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
