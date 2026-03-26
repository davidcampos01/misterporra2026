import { GROUPS_DATA } from "../constants/groups";
import { FIXTURES } from "../constants/fixtures";
import { getStandings } from "./scoring";

// Obtiene clasificados: 1º y 2º de cada grupo + 8 mejores 3ºs
export function getQualifiers(results) {
  const groupStandings = {};
  Object.keys(GROUPS_DATA).forEach(g => {
    const gf = FIXTURES.filter(f => f.group === g).map(f => ({
      home: f.home, away: f.away,
      homeScore: results[f.id]?.homeScore ?? "",
      awayScore: results[f.id]?.awayScore ?? "",
    }));
    groupStandings[g] = getStandings(GROUPS_DATA[g].teams, gf);
  });

  // Teams indexed by slot: "1A", "2B", etc.
  const slots = {};
  Object.keys(groupStandings).forEach(g => {
    const st = groupStandings[g];
    slots[`1${g}`] = { ...st[0], slot: `1${g}` };
    slots[`2${g}`] = { ...st[1], slot: `2${g}` };
    slots[`3${g}`] = { ...st[2], slot: `3${g}`, pts3: st[2]?.pts, gf3: st[2]?.gf, gd3: (st[2]?.gf ?? 0) - (st[2]?.ga ?? 0) };
  });

  // 8 mejores 3ºs por pts → dif goles → goles a favor
  const thirds = Object.keys(GROUPS_DATA).map(g => slots[`3${g}`]).filter(Boolean);
  thirds.sort((a, b) => (b.pts3 - a.pts3) || (b.gd3 - a.gd3) || (b.gf3 - a.gf3));
  const best8thirds = thirds.slice(0, 8);
  best8thirds.forEach((t, i) => { slots[`T${i + 1}`] = { ...t, slot: `T${i + 1}` }; });

  return slots;
}

// Obtiene clasificados usando predicciones de un jugador
export function getQualifiersFromPreds(playerPreds) {
  const groupStandings = {};
  Object.keys(GROUPS_DATA).forEach(g => {
    const gf = FIXTURES.filter(f => f.group === g).map(f => {
      const p = playerPreds[f.id];
      return {
        home: f.home, away: f.away,
        homeScore: p?.h !== undefined && p?.h !== "" ? p.h : "",
        awayScore: p?.a !== undefined && p?.a !== "" ? p.a : "",
      };
    });
    groupStandings[g] = getStandings(GROUPS_DATA[g].teams, gf);
  });
  const slots = {};
  Object.keys(groupStandings).forEach(g => {
    const st = groupStandings[g];
    slots[`1${g}`] = { ...st[0], slot: `1${g}` };
    slots[`2${g}`] = { ...st[1], slot: `2${g}` };
    slots[`3${g}`] = { ...st[2], slot: `3${g}`, pts3: st[2]?.pts, gf3: st[2]?.gf, gd3: (st[2]?.gf ?? 0) - (st[2]?.ga ?? 0) };
  });
  const thirds = Object.keys(GROUPS_DATA).map(g => slots[`3${g}`]).filter(Boolean);
  thirds.sort((a, b) => (b.pts3 - a.pts3) || (b.gd3 - a.gd3) || (b.gf3 - a.gf3));
  thirds.slice(0, 8).forEach((t, i) => { slots[`T${i + 1}`] = { ...t, slot: `T${i + 1}` }; });
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
