import { useState, useMemo } from "react";
import { GROUPS_DATA } from "../constants/groups";
import { FIXTURES } from "../constants/fixtures";
import { MATCHDAY_LABEL } from "../constants/theme";
import { FilterChip } from "../components/FilterChip";
import { MatchRow } from "../components/MatchRow";

export function CalendarioTab({ results, setResult, predictions, players, activePlayerIdx }) {
  const [filterGroup, setFilterGroup] = useState("ALL");
  const [filterMatchday, setFilterMatchday] = useState("ALL");

  const filteredFixtures = useMemo(() => FIXTURES.filter(f => {
    if (filterGroup !== "ALL" && f.group !== filterGroup) return false;
    if (filterMatchday !== "ALL" && String(f.matchday) !== filterMatchday) return false;
    return true;
  }), [filterGroup, filterMatchday]);

  return (
    <div style={{ padding: 16 }} className="fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 24, letterSpacing: 2 }}>Calendario Oficial</div>
        <div style={{ fontSize: 11, color: "#4040a0", fontWeight: 700 }}>Hora española (CET+1)</div>
      </div>

      {/* Filtro por grupo */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto", paddingBottom: 4 }}>
        <FilterChip label="Todos" active={filterGroup === "ALL"} onClick={() => setFilterGroup("ALL")} />
        {Object.keys(GROUPS_DATA).map(g => (
          <FilterChip key={g} label={`Gr.${g}`} active={filterGroup === g} onClick={() => setFilterGroup(g)} />
        ))}
      </div>

      {/* Filtro por jornada */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
        {["ALL", "1", "2", "3"].map(md => (
          <FilterChip key={md} label={md === "ALL" ? "Todas jornadas" : `Jornada ${md}`} active={filterMatchday === md} onClick={() => setFilterMatchday(md)} />
        ))}
      </div>

      {[1, 2, 3].filter(md => filterMatchday === "ALL" || String(md) === filterMatchday).map(md => {
        const dayFixtures = filteredFixtures.filter(f => f.matchday === md);
        if (!dayFixtures.length) return null;
        return (
          <div key={md}>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 16, letterSpacing: 2, color: md === 3 ? "#f5c842" : "#4cc9f0", padding: "10px 0 6px", borderBottom: "1px solid #1a1a2a", marginBottom: 10, textAlign: "center" }}>
              {MATCHDAY_LABEL[md]}
            </div>
            {dayFixtures.map(m => (
              <MatchRow key={m.id} match={m}
                resultData={results[m.id]}
                onResultChange={(key, val) => setResult(m.id, key, val)}
                predictions={predictions} players={players}
                activePlayerIdx={activePlayerIdx}
                onPredChange={() => {}}
                mode="results"
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
