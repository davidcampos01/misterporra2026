import { useState, useMemo } from "react";
import { GROUPS_DATA } from "../constants/groups";
import { FIXTURES } from "../constants/fixtures";
import { PLAYER_COLORS } from "../constants/theme";
import { getStandings } from "../utils/scoring";
import { FilterChip } from "../components/FilterChip";
import { MatchRow } from "../components/MatchRow";

const POS_COLORS = ["#06d6a0", "#4cc9f0", "#f5c842", "#ff6b6b"];

function PredictedStandings({ activePlayerIdx, predictions }) {
  const playerPreds = predictions[activePlayerIdx] ?? {};
  const color = PLAYER_COLORS[activePlayerIdx % 6];

  const groupStandings = useMemo(() => {
    const out = {};
    Object.keys(GROUPS_DATA).forEach(g => {
      const groupFixtures = FIXTURES.filter(f => f.group === g).map(f => {
        const pred = playerPreds[f.id];
        return {
          home: f.home,
          away: f.away,
          homeScore: pred?.h !== undefined && pred?.h !== "" ? pred.h : "",
          awayScore: pred?.a !== undefined && pred?.a !== "" ? pred.a : "",
        };
      });
      out[g] = getStandings(GROUPS_DATA[g].teams, groupFixtures);
    });
    return out;
  }, [playerPreds]);

  const totalPredicted = useMemo(
    () => FIXTURES.filter(f => {
      const p = playerPreds[f.id];
      return p?.h !== undefined && p?.h !== "" && p?.a !== undefined && p?.a !== "";
    }).length,
    [playerPreds]
  );

  return (
    <div>
      <div style={{ background: `${color.light}`, border: `1px solid ${color.bg}`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: color.text, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Pronósticos introducidos</span>
        <span style={{ fontFamily: "'Space Mono',monospace", fontWeight: 800, fontSize: 16 }}>{totalPredicted} / {FIXTURES.length}</span>
      </div>

      {Object.keys(GROUPS_DATA).map(g => {
        const st = groupStandings[g];
        const hasPreds = FIXTURES.filter(f => f.group === g).some(f => {
          const p = playerPreds[f.id];
          return p?.h !== undefined && p?.h !== "";
        });

        return (
          <div key={g} style={{ background: "#111120", border: "1px solid #1a1a2a", borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "linear-gradient(90deg,rgba(123,47,255,.08),transparent)" }}>
              <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 16, letterSpacing: 2, color: "#f5c842" }}>Grupo {g}</span>
              {!hasPreds && <span style={{ fontSize: 10, color: "#3a3a60", fontWeight: 700, letterSpacing: 1 }}>SIN PRONÓSTICOS</span>}
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["#", "Equipo", "PJ", "PTS", "DG", "GF"].map(h => (
                    <th key={h} style={{ padding: "5px 8px", textAlign: h === "Equipo" ? "left" : "center", color: "#4040a0", fontWeight: 800, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", borderBottom: "1px solid #1a1a2a" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {st.map((team, i) => {
                  const posColor = POS_COLORS[i];
                  const gd = team.gf - team.ga;
                  return (
                    <tr key={team.name} style={{ borderBottom: i < 3 ? "1px solid rgba(26,26,42,.6)" : "none", opacity: hasPreds ? 1 : 0.35 }}>
                      <td style={{ padding: "8px 8px" }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", background: posColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#080811" }}>{i + 1}</div>
                      </td>
                      <td style={{ padding: "8px 8px", borderLeft: `3px solid ${posColor}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ fontSize: 15 }}>{team.flag}</span>
                          <span style={{ fontSize: 11, fontWeight: 500, color: team.pending ? "#4040a0" : "#f0f0f8" }}>{team.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "8px 8px", textAlign: "center", fontFamily: "'Space Mono',monospace", fontSize: 11 }}>{team.mp}</td>
                      <td style={{ padding: "8px 8px", textAlign: "center", fontFamily: "'Space Mono',monospace", fontWeight: 800, fontSize: 13, color: "#f5c842" }}>{team.pts}</td>
                      <td style={{ padding: "8px 8px", textAlign: "center", fontFamily: "'Space Mono',monospace", fontSize: 11, color: gd > 0 ? "#06d6a0" : gd < 0 ? "#ff6b6b" : "#4040a0" }}>{gd > 0 ? `+${gd}` : gd}</td>
                      <td style={{ padding: "8px 8px", textAlign: "center", fontFamily: "'Space Mono',monospace", fontSize: 11 }}>{team.gf}</td>
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

export function PronosticosTab({ players, activePlayerIdx, setActivePlayerIdx, results, setResult, predictions, setPred }) {
  const [filterGroup, setFilterGroup] = useState("ALL");
  const [view, setView] = useState("partidos");

  const filteredFixtures = useMemo(
    () => FIXTURES.filter(f => filterGroup === "ALL" || f.group === filterGroup),
    [filterGroup]
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
            {Object.keys(GROUPS_DATA).map(g => (
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
        <PredictedStandings activePlayerIdx={activePlayerIdx} predictions={predictions} />
      )}
    </div>
  );
}
