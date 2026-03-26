import { useState, useMemo } from "react";
import { PLAYER_COLORS } from "../constants/theme";
import { getStandings, scoreStandings } from "../utils/scoring";
import { FilterChip } from "../components/FilterChip";
import { MatchRow } from "../components/MatchRow";
import { useTournament } from "../context/TournamentContext";

const POS_COLORS = ["#06d6a0", "#4cc9f0", "#f5c842", "#ff6b6b"];

function PredictedStandings({ activePlayerIdx, predictions, realStandings, qualifiedTeams }) {
  const { fixtures, groups } = useTournament();
  const playerPreds = predictions[activePlayerIdx] ?? {};
  const color = PLAYER_COLORS[activePlayerIdx % 6];

  const groupStandings = useMemo(() => {
    const out = {};
    Object.keys(groups).forEach(g => {
      const groupFixtures = fixtures.filter(f => f.group === g).map(f => {
        const pred = playerPreds[f.id];
        return {
          home: f.home,
          away: f.away,
          homeScore: pred?.h !== undefined && pred?.h !== "" ? pred.h : "",
          awayScore: pred?.a !== undefined && pred?.a !== "" ? pred.a : "",
        };
      });
      out[g] = getStandings(groups[g].teams, groupFixtures);
    });
    return out;
  }, [playerPreds]);

  const standingsScoreByGroup = useMemo(() => {
    const out = {};
    Object.keys(groups).forEach(g => {
      if (!realStandings?.[g]) return;
      const hasReal = realStandings[g].some(t => t.mp > 0);
      if (!hasReal) return;
      const realOrder = realStandings[g].map(t => t.name);
      const predOrder = groupStandings[g].map(t => t.name);
      out[g] = scoreStandings(realOrder, predOrder, qualifiedTeams ?? new Set());
    });
    return out;
  }, [groupStandings, realStandings, qualifiedTeams, groups]);

  const totalPredicted = useMemo(
    () => fixtures.filter(f => {
      if (!f.matchday) return false; // solo fase de grupos
      const p = playerPreds[f.id];
      return p?.h !== undefined && p?.h !== "" && p?.a !== undefined && p?.a !== "";
    }).length,
    [playerPreds, fixtures]
  );
  const totalGroupFixtures = useMemo(
    () => fixtures.filter(f => !!f.matchday).length,
    [fixtures]
  );

  const totalStandingsPts = Object.values(standingsScoreByGroup).reduce((acc, s) => acc + s.total, 0);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <div style={{ flex: 1, background: `${color.light}`, border: `1px solid ${color.bg}`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: color.text, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Pronósticos</span>
          <span style={{ fontFamily: "'Space Mono',monospace", fontWeight: 800, fontSize: 16 }}>{totalPredicted} / {totalGroupFixtures}</span>
        </div>
        <div style={{ flex: 1, background: "rgba(245,200,66,.08)", border: "1px solid rgba(245,200,66,.2)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#f5c842", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Pts clasi.</span>
          <span style={{ fontFamily: "'Space Mono',monospace", fontWeight: 800, fontSize: 16 }}>{totalStandingsPts}</span>
        </div>
      </div>

      {Object.keys(groups).map(g => {
        const st = groupStandings[g];
        const realSt = realStandings?.[g];
        const sc = standingsScoreByGroup[g];
        const hasPreds = fixtures.filter(f => f.group === g).some(f => {
          const p = playerPreds[f.id];
          return p?.h !== undefined && p?.h !== "";
        });
        const hasReal = !!sc;

        return (
          <div key={g} style={{ background: "#111120", border: "1px solid #1a1a2a", borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "linear-gradient(90deg,rgba(123,47,255,.08),transparent)" }}>
              <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 16, letterSpacing: 2, color: "#f5c842" }}>Grupo {g}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {hasReal && sc.total > 0 && (
                  <span style={{ fontFamily: "'Space Mono',monospace", fontWeight: 800, fontSize: 13, color: "#f5c842" }}>+{sc.total}pts</span>
                )}
                {!hasPreds && <span style={{ fontSize: 10, color: "#3a3a60", fontWeight: 700, letterSpacing: 1 }}>SIN PRONÓSTICOS</span>}
              </div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["#", "Pronosticado", "PTS", hasReal ? "Real" : null].filter(Boolean).map(h => (
                    <th key={h} style={{ padding: "5px 8px", textAlign: h === "Pronosticado" || h === "Real" ? "left" : "center", color: "#4040a0", fontWeight: 800, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", borderBottom: "1px solid #1a1a2a" }}>{h}</th>
                  ))}
                  {hasReal && <th style={{ padding: "5px 8px", textAlign: "center", color: "#4040a0", fontWeight: 800, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", borderBottom: "1px solid #1a1a2a" }}>Pts</th>}
                </tr>
              </thead>
              <tbody>
                {st.map((team, i) => {
                  const posColor = POS_COLORS[i];
                  const hit = sc?.hits[i];
                  const realTeam = realSt?.[i];
                  const qualifies = qualifiedTeams?.has(realTeam?.name);
                  const rowBg = hasReal
                    ? (hit?.correctPos && hit?.qualBonus > 0 ? "rgba(6,214,160,.09)"
                      : hit?.correctPos ? "rgba(6,214,160,.04)"
                      : hit?.qualBonus > 0 ? "rgba(245,200,66,.04)"
                      : "rgba(255,107,107,.03)")
                    : "transparent";
                  const leftBorder = hasReal
                    ? (hit?.correctPos ? "#06d6a0" : hit?.qualBonus > 0 ? "#f5c842" : "#ff6b6b")
                    : posColor;
                  return (
                    <tr key={team.name} style={{ borderBottom: i < 3 ? "1px solid rgba(26,26,42,.6)" : "none", opacity: hasPreds ? 1 : 0.35, background: rowBg }}>
                      <td style={{ padding: "8px 8px" }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", background: posColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#080811" }}>{i + 1}</div>
                      </td>
                      <td style={{ padding: "8px 8px", borderLeft: `3px solid ${leftBorder}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ fontSize: 15 }}>{team.flag}</span>
                          <span style={{ fontSize: 11, fontWeight: 500, color: team.pending ? "#4040a0" : "#f0f0f8" }}>{team.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "8px 8px", textAlign: "center", fontFamily: "'Space Mono',monospace", fontWeight: 800, fontSize: 13, color: "#f5c842" }}>{team.pts}</td>
                      {hasReal && (
                        <td style={{ padding: "8px 8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: 14 }}>{realTeam?.flag}</span>
                            <span style={{ fontSize: 10, color: "#8080b0" }}>{realTeam?.name}</span>
                            {qualifies && i < 3 && <span style={{ fontSize: 8, background: "rgba(6,214,160,.15)", color: "#06d6a0", borderRadius: 4, padding: "1px 4px", fontWeight: 800, letterSpacing: .5 }}>R16</span>}
                          </div>
                        </td>
                      )}
                      {hasReal && (
                        <td style={{ padding: "8px 4px", textAlign: "center" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                            {hit?.correctPos && (
                              <span style={{ fontSize: 9, color: "#06d6a0", fontWeight: 800, whiteSpace: "nowrap" }}>✓ +{hit.positionPts}</span>
                            )}
                            {hit?.qualBonus > 0 && (
                              <span style={{ fontSize: 9, color: "#f5c842", fontWeight: 800, whiteSpace: "nowrap" }}>⬆ +5</span>
                            )}
                            {!hit?.correctPos && !hit?.qualBonus && (
                              <span style={{ fontSize: 9, color: "#3a3a60" }}>–</span>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

export function PronosticosTab({ players, activePlayerIdx, setActivePlayerIdx, results, setResult, predictions, setPred, standings, qualifiedTeams }) {
  const { fixtures, groups } = useTournament();
  const [filterGroup, setFilterGroup] = useState("ALL");
  const [view, setView] = useState("partidos");

  const filteredFixtures = useMemo(
    () => fixtures.filter(f => f.matchday && (filterGroup === "ALL" || f.group === filterGroup)),
    [fixtures, filterGroup]
  );

  const color = PLAYER_COLORS[activePlayerIdx % 6];

  return (
    <div style={{ padding: 16 }} className="fade-in">
      {/* Toggle jugadores */}
      <div style={{ display: "flex", background: "#111120", borderRadius: 40, padding: 4, marginBottom: 14, border: "1px solid #1a1a2a", overflowX: "auto", gap: 2 }}>
        {players.map((pl, idx) => {
          const c = PLAYER_COLORS[idx % 6];
          const active = activePlayerIdx === idx;
          return (
            <button key={idx} onClick={() => setActivePlayerIdx(idx)} style={{
              flex: "0 0 auto", padding: "8px 14px", borderRadius: 36, fontSize: 12, fontWeight: 800,
              cursor: "pointer", border: "none", whiteSpace: "nowrap",
              background: active ? c.bg : "transparent",
              color: active ? (idx === 1 ? "#080811" : "#fff") : "#4040a0",
            }}>
              {pl.name}
            </button>
          );
        })}
      </div>

      <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 20, letterSpacing: 2, marginBottom: 12 }}>
        Pronóst. · <span style={{ color: color.text }}>{players[activePlayerIdx]?.name}</span>
      </div>

      {/* Toggle vista Partidos / Clasificaciones */}
      <div style={{ display: "flex", background: "#0f0f1c", borderRadius: 10, padding: 3, marginBottom: 14, border: "1px solid #1a1a2a", width: "fit-content" }}>
        {[{ id: "partidos", label: "📋 Partidos" }, { id: "clasificaciones", label: "📊 Clasificaciones" }].map(v => (
          <button key={v.id} onClick={() => setView(v.id)} style={{
            padding: "7px 16px", borderRadius: 8, fontSize: 11, fontWeight: 800,
            letterSpacing: .5, cursor: "pointer", border: "none", whiteSpace: "nowrap",
            background: view === v.id ? color.bg : "transparent",
            color: view === v.id ? (activePlayerIdx === 1 ? "#080811" : "#fff") : "#4040a0",
          }}>
            {v.label}
          </button>
        ))}
      </div>

      {view === "partidos" && (
        <>
          <div style={{ fontSize: 11, color: "#4040a0", marginBottom: 12 }}>Introduce tu predicción para cada partido</div>
          {/* Filtro por grupo */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto", paddingBottom: 4 }}>
            <FilterChip label="Todos" active={filterGroup === "ALL"} onClick={() => setFilterGroup("ALL")} />
            {Object.keys(groups).map(g => (
              <FilterChip key={g} label={`Gr.${g}`} active={filterGroup === g} onClick={() => setFilterGroup(g)} />
            ))}
          </div>
          {filteredFixtures.map(m => (
            <MatchRow key={m.id} match={m}
              resultData={results[m.id]}
              onResultChange={(key, val) => setResult(m.id, key, val)}
              predictions={predictions} players={players}
              activePlayerIdx={activePlayerIdx}
              onPredChange={(matchId, key, val) => setPred(activePlayerIdx, matchId, key, val)}
              mode="predictions"
            />
          ))}
        </>
      )}

      {view === "clasificaciones" && (
        <PredictedStandings activePlayerIdx={activePlayerIdx} predictions={predictions} realStandings={standings} qualifiedTeams={qualifiedTeams} />
      )}
    </div>
  );
}
