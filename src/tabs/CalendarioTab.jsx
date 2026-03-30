import { useState, useMemo } from "react";
import { FilterChip } from "../components/FilterChip";
import { MatchRow } from "../components/MatchRow";
import { MatchDetail } from "../components/MatchDetail";
import { useTournament } from "../context/TournamentContext";

const KO_GROUPS = ["R32", "R16", "QF", "SF", "FINAL", "3RD"];
const PHASE_LABEL = {
  R32: "Dieciseisavos", R16: "Octavos",
  QF: "Cuartos", SF: "Semis", FINAL: "Final", "3RD": "3º puesto",
};
const PHASE_COLOR = {
  R32: "#4cc9f0", R16: "#4cc9f0", QF: "#a066ff",
  SF: "#f5c842", FINAL: "#f5c842", "3RD": "#06d6a0",
};

function formatDateES(dateStr) {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

export function CalendarioTab({ results, setResult, predictions, players, activePlayerIdx, flagMap }) {
  const { fixtures, groups } = useTournament();
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterGroup, setFilterGroup] = useState("ALL");
  const [filterMatchday, setFilterMatchday] = useState("ALL");
  const [filterKO, setFilterKO] = useState("ALL");  // ALL | R32 | R16 | QF | SF | FINAL
  const [phase, setPhase] = useState("ALL"); // ALL | grupo | ko
  const [detailMatch, setDetailMatch] = useState(null);

  const allDates = useMemo(() => [...new Set(fixtures.map(f => f.date))].sort(), [fixtures]);

  const effectiveDate = useMemo(() => {
    if (selectedDate) return selectedDate;
    const today = new Date().toISOString().slice(0, 10);
    return allDates.find(d => d >= today) ?? allDates[allDates.length - 1] ?? null;
  }, [selectedDate, allDates]);

  const hasKO = useMemo(() => fixtures.some(f => KO_GROUPS.includes(f.group)), [fixtures]);
  const koPhases = useMemo(() => KO_GROUPS.filter(p => fixtures.some(f => f.group === p)), [fixtures]);
  const groupKeys = useMemo(() => Object.keys(groups), [groups]);

  const dayFixtures = useMemo(() => {
    let list = fixtures.filter(f => f.date === effectiveDate);
    if (phase === "grupo")  list = list.filter(f => !KO_GROUPS.includes(f.group));
    if (phase === "ko")     list = list.filter(f => KO_GROUPS.includes(f.group));
    if (filterGroup !== "ALL")    list = list.filter(f => f.group === filterGroup);
    if (filterMatchday !== "ALL") list = list.filter(f => String(f.matchday) === filterMatchday);
    if (filterKO !== "ALL")       list = list.filter(f => f.group === filterKO);
    return list.sort((a, b) => {
      const toMin = t => { const [h, m] = t.replace(/\+.*/, "").split(":").map(Number); return h * 60 + m; };
      return toMin(a.timeES) - toMin(b.timeES);
    });
  }, [fixtures, effectiveDate, phase, filterGroup, filterMatchday, filterKO]);

  function switchPhase(p) {
    setPhase(p);
    setFilterGroup("ALL");
    setFilterMatchday("ALL");
    setFilterKO("ALL");
  }

  return (
    <div style={{ padding: 16 }} className="fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 24, letterSpacing: 2 }}>Calendario</div>
        <div style={{ fontSize: 11, color: "#4040a0", fontWeight: 700 }}>Hora española</div>
      </div>

      {/* Selector de fechas */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto", paddingBottom: 4 }}>
        {allDates.map(d => (
          <button key={d} onClick={() => { setSelectedDate(d); setPhase("ALL"); setFilterGroup("ALL"); setFilterMatchday("ALL"); setFilterKO("ALL"); }} style={{
            flexShrink: 0, padding: "6px 10px", borderRadius: 8, cursor: "pointer",
            border: d === effectiveDate ? "1.5px solid #f5c842" : "1px solid #1a1a2a",
            background: d === effectiveDate ? "rgba(245,200,66,.15)" : "#111120",
            color: d === effectiveDate ? "#f5c842" : "#4040a0",
            fontSize: 11, fontWeight: d === effectiveDate ? 700 : 400, whiteSpace: "nowrap",
          }}>{formatDateES(d)}</button>
        ))}
      </div>

      {/* Filtro fase (solo si hay eliminatorias) */}
      {hasKO && (
        <div style={{ display: "flex", gap: 6, marginBottom: 8, overflowX: "auto", paddingBottom: 2 }}>
          {[["ALL","Todos"],["grupo","Grupos"],["ko","Eliminatorias"]].map(([v,l]) => (
            <FilterChip key={v} label={l} active={phase === v} onClick={() => switchPhase(v)} />
          ))}
        </div>
      )}

      {/* Filtros de grupo + jornada */}
      {phase !== "ko" && (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 6, overflowX: "auto", paddingBottom: 2 }}>
            <FilterChip label="Todos Gr." active={filterGroup === "ALL"} onClick={() => setFilterGroup("ALL")} />
            {groupKeys.map(g => (
              <FilterChip key={g} label={`Gr.${g}`} active={filterGroup === g} onClick={() => setFilterGroup(g)} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto", paddingBottom: 2 }}>
            {["ALL","1","2","3"].map(md => (
              <FilterChip key={md} label={md === "ALL" ? "Todas J." : `J${md}`} active={filterMatchday === md} onClick={() => setFilterMatchday(md)} />
            ))}
          </div>
        </>
      )}

      {/* Filtros de fase KO */}
      {phase !== "grupo" && hasKO && koPhases.length > 0 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto", paddingBottom: 2 }}>
          <FilterChip label="Toda Elim." active={filterKO === "ALL"} onClick={() => setFilterKO("ALL")} />
          {koPhases.map(p => (
            <FilterChip key={p} label={PHASE_LABEL[p] ?? p} active={filterKO === p} onClick={() => setFilterKO(p)} />
          ))}
        </div>
      )}

      {/* Partidos */}
      {dayFixtures.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#3a3a60", fontSize: 13 }}>Sin partidos este día con estos filtros</div>
      )}
      {dayFixtures.map(m => {
        const isKO = KO_GROUPS.includes(m.group);
        const phaseLabel = isKO ? (PHASE_LABEL[m.group] ?? m.group) : `Gr.${m.group} · J${m.matchday}`;
        const phaseColor = isKO ? (PHASE_COLOR[m.group] ?? "#a066ff") : "#4040a0";
        return (
          <MatchRow key={m.id} match={m}
            resultData={results[m.id]}
            onResultChange={(key, val) => setResult(m.id, key, val)}
            predictions={predictions} players={players}
            activePlayerIdx={activePlayerIdx}
            onPredChange={() => {}}
            mode="results"
            phaseLabel={phaseLabel}
            phaseColor={phaseColor}
            flagMap={flagMap}
            onDetail={(match, rd) => setDetailMatch({ match, resultData: rd })}
          />
        );
      })}

      {detailMatch && (
        <MatchDetail
          match={detailMatch.match}
          resultData={detailMatch.resultData}
          flagMap={flagMap}
          onClose={() => setDetailMatch(null)}
        />
      )}
    </div>
  );
}


