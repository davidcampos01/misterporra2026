import { PLAYER_COLORS } from "../constants/theme";
import { scoreMatch } from "../utils/scoring";
import { ScoreInput } from "./ScoreInput";
import { useTournament } from "../context/TournamentContext";

export function MatchRow({ match, resultData, onResultChange, predictions, players, activePlayerIdx, onPredChange, mode, onDetail, phaseLabel, phaseColor, flagMap }) {
  const { groups } = useTournament();
  const rh = resultData?.homeScore ?? "";
  const ra = resultData?.awayScore ?? "";
  const isPending = match.home.includes("*") || match.away.includes("*");
  const hasResult = rh !== "" && ra !== "";
  const groupTeams = groups[match.group]?.teams ?? [];
  const homeFlag = groupTeams.find(t => t.name === match.home)?.flag
    || flagMap?.[match.home] || "🏳️";
  const awayFlag = groupTeams.find(t => t.name === match.away)?.flag
    || flagMap?.[match.away] || "🏳️";
  const headerLabel = phaseLabel ?? `Gr.${match.group} · Jornada ${match.matchday ?? ""}`;
  const headerColor = phaseColor ?? "#4040a0";

  return (
    <div
      onClick={hasResult && onDetail ? () => onDetail(match, resultData) : undefined}
      style={{
        background: "#0f0f1c", border: "1px solid #1a1a2a", borderRadius: 10,
        padding: "10px 12px", marginBottom: 8,
        cursor: hasResult && onDetail ? "pointer" : "default",
      }}
    >
      {/* Header partido */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 10, color: headerColor, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
          {headerLabel} · {match.timeES}h
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: "#4040a0" }}>{match.venue}</span>
          {hasResult && onDetail && (
            <span style={{ fontSize: 9, color: "#2a3a50", letterSpacing: 0.5 }}>▼</span>
          )}
        </div>
      </div>

      {/* Teams + score */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 19 }}>{homeFlag}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: isPending ? "#5050a0" : "#f0f0f8" }}>{match.home}</span>
        </div>

        {mode === "results" ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <ScoreInput value={rh} onChange={v => onResultChange("homeScore", v)} />
              <span style={{ color: "#2a2a40", fontWeight: 800, fontSize: 14 }}>–</span>
              <ScoreInput value={ra} onChange={v => onResultChange("awayScore", v)} />
            </div>
            {resultData?.penaltyHome !== undefined && resultData.penaltyHome !== "" && (
              <div style={{ fontSize: 10, color: "#a066ff", fontFamily: "'Space Mono',monospace", letterSpacing: 0.5 }}>
                pen. {resultData.penaltyHome}–{resultData.penaltyAway}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {/* Resultado real */}
            <div style={{ textAlign: "center", minWidth: 54 }}>
              <div style={{ fontSize: 9, color: "#3a3a60", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>Real</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 15, fontWeight: 700, color: rh !== "" ? "#f5c842" : "#2a2a40" }}>
                {rh !== "" ? `${rh}–${ra}` : "–"}
              </div>
            </div>
            {/* Predicción del jugador activo */}
            {mode === "predictions" && (() => {
              const pred = predictions[activePlayerIdx]?.[match.id];
              const ph = pred?.h;
              const pa = pred?.a;
              const hasPred = ph !== undefined && ph !== "" && pa !== undefined && pa !== "";
              const hasReal = rh !== "" && ra !== "";
              const pts = hasPred && hasReal ? scoreMatch(+rh, +ra, +ph, +pa) : null;
              const pColor = PLAYER_COLORS[activePlayerIdx % 6];
              return (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <div style={{ fontSize: 9, color: pColor.text, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2, textAlign: "center" }}>Pred.</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <ScoreInput value={ph ?? ""} onChange={v => onPredChange(match.id, "h", v)} color={pColor.bg} />
                    <span style={{ color: "#2a2a40" }}>–</span>
                    <ScoreInput value={pa ?? ""} onChange={v => onPredChange(match.id, "a", v)} color={pColor.bg} />
                  </div>
                  {pts !== null && (
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 800,
                      background: pts.pts > 0 ? pColor.bg : "#1a1a2a",
                      color: pts.pts > 0 ? "#fff" : "#3a3a60",
                      borderRadius: 5, padding: "2px 7px", letterSpacing: .5 }}>
                      {pts.pts > 0 ? `+${pts.pts}` : "✗"}
                      {pts.pts > 0 && <span style={{ fontSize: 9, marginLeft: 3, opacity: .8 }}>
                        {pts.hitExact ? "Exacto" : pts.hitDiff ? "Dif." : "1X2"}
                      </span>}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: isPending ? "#5050a0" : "#f0f0f8", textAlign: "right" }}>{match.away}</span>
          <span style={{ fontSize: 19 }}>{awayFlag}</span>
        </div>
      </div>

      {/* Scores strip */}
      {(mode === "scoreboard" || mode === "results") && players?.length > 0 && (() => {
        const hasResult = rh !== "" && ra !== "";
        const pills = players.map((pl, idx) => {
          const pred = predictions[idx]?.[match.id];
          if (!pred || pred.h === "" || pred.h === undefined) return null;
          const color = PLAYER_COLORS[idx % 6];
          const sc = hasResult ? scoreMatch(+rh, +ra, +pred.h, +pred.a) : null;
          if (sc !== null && sc.pts === 0) return null; // sin puntos → no mostrar
          return (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 4, background: color.light, border: `1px solid ${color.bg}`, borderRadius: 6, padding: "2px 7px", fontSize: 11 }}>
              <span style={{ color: color.text, fontWeight: 700 }}>{pl.name.slice(0, 8)}</span>
              <span style={{ fontSize: 13 }}>{homeFlag}</span>
              <span style={{ fontFamily: "'Space Mono',monospace", color: color.text }}>{pred.h}–{pred.a}</span>
              <span style={{ fontSize: 13 }}>{awayFlag}</span>
              {sc !== null && sc.pts > 0 && <span style={{ background: color.bg, color: "#fff", borderRadius: 4, padding: "1px 5px", fontWeight: 800, fontSize: 10 }}>+{sc.pts}</span>}
            </div>
          );
        }).filter(Boolean);
        if (!pills.length) return null;
        return (
          <div style={{ marginTop: 8, borderTop: "1px solid #1a1a2a", paddingTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
            {pills}
          </div>
        );
      })()}
    </div>
  );
}
