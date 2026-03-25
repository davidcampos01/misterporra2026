import { useState, useMemo } from "react";
import { GROUPS_DATA } from "../constants/groups";
import { FIXTURES } from "../constants/fixtures";
import { PLAYER_COLORS } from "../constants/theme";
import { FilterChip } from "../components/FilterChip";
import { MatchRow } from "../components/MatchRow";

export function PronosticosTab({ players, activePlayerIdx, setActivePlayerIdx, results, setResult, predictions, setPred }) {
  const [filterGroup, setFilterGroup] = useState("ALL");

  const filteredFixtures = useMemo(
    () => FIXTURES.filter(f => filterGroup === "ALL" || f.group === filterGroup),
    [filterGroup]
  );

  return (
    <div style={{ padding: 16 }} className="fade-in">
      {/* Toggle jugadores */}
      <div style={{ display: "flex", background: "#111120", borderRadius: 40, padding: 4, marginBottom: 14, border: "1px solid #1a1a2a", overflowX: "auto", gap: 2 }}>
        {players.map((pl, idx) => {
          const color = PLAYER_COLORS[idx % 6];
          const active = activePlayerIdx === idx;
          return (
            <button key={idx} onClick={() => setActivePlayerIdx(idx)} style={{
              flex: "0 0 auto", padding: "8px 14px", borderRadius: 36, fontSize: 12, fontWeight: 800,
              cursor: "pointer", border: "none", whiteSpace: "nowrap",
              background: active ? color.bg : "transparent",
              color: active ? (idx === 1 ? "#080811" : "#fff") : "#4040a0",
            }}>
              {pl.name}
            </button>
          );
        })}
      </div>

      <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 20, letterSpacing: 2, marginBottom: 4 }}>
        Pronóst. · <span style={{ color: PLAYER_COLORS[activePlayerIdx % 6].text }}>{players[activePlayerIdx]?.name}</span>
      </div>
      <div style={{ fontSize: 11, color: "#4040a0", marginBottom: 14 }}>Introduce tu predicción para cada partido</div>

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
    </div>
  );
}
