import { useState, useMemo } from "react";
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
  const { fixtures } = useTournament();
  const [selectedDate, setSelectedDate] = useState(null);
  const [detailMatch, setDetailMatch] = useState(null);

  const allDates = useMemo(() => [...new Set(fixtures.map(f => f.date))].sort(), [fixtures]);

  const effectiveDate = useMemo(() => {
    if (selectedDate) return selectedDate;
    const today = new Date().toISOString().slice(0, 10);
    // Hoy si hay partidos hoy, si no la fecha pasada más reciente
    if (allDates.includes(today)) return today;
    const past = allDates.filter(d => d < today);
    return past[past.length - 1] ?? allDates[0] ?? null;
  }, [selectedDate, allDates]);

  const dayFixtures = useMemo(() =>
    fixtures.filter(f => f.date === effectiveDate).sort((a, b) => {
      const toMin = t => { const [h, m] = t.replace(/\+.*/, "").split(":").map(Number); return h * 60 + m; };
      return toMin(a.timeES) - toMin(b.timeES);
    })
  , [fixtures, effectiveDate]);

  return (
    <div style={{ padding: 16 }} className="fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 24, letterSpacing: 2 }}>Calendario</div>
        <div style={{ fontSize: 11, color: "#4040a0", fontWeight: 700 }}>Hora española</div>
      </div>

      {/* Selector de fechas */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
        {allDates.map(d => (
          <button key={d} onClick={() => setSelectedDate(d)} style={{
            flexShrink: 0, padding: "6px 10px", borderRadius: 8, cursor: "pointer",
            border: d === effectiveDate ? "1.5px solid #f5c842" : "1px solid #1a1a2a",
            background: d === effectiveDate ? "rgba(245,200,66,.15)" : "#111120",
            color: d === effectiveDate ? "#f5c842" : "#4040a0",
            fontSize: 11, fontWeight: d === effectiveDate ? 700 : 400, whiteSpace: "nowrap",
          }}>{formatDateES(d)}</button>
        ))}
      </div>

      {/* Partidos */}
      {dayFixtures.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#3a3a60", fontSize: 13 }}>Sin partidos este día</div>
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
