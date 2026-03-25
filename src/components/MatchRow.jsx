import { GROUPS_DATA } from "../constants/groups";
import { PLAYER_COLORS } from "../constants/theme";
import { scoreMatch } from "../utils/scoring";
import { ScoreInput } from "./ScoreInput";

export function MatchRow({ match, resultData, onResultChange, predictions, players, activePlayerIdx, onPredChange, mode }) {
  const rh = resultData?.homeScore ?? "";
  const ra = resultData?.awayScore ?? "";
  const isPending = match.home.includes("*") || match.away.includes("*");

  return (
    <div style={{
      background: "#0f0f1c", border: "1px solid #1a1a2a", borderRadius: 10,
      padding: "10px 12px", marginBottom: 8,
    }}>
      {/* Header partido */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 10, color: "#4040a0", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
          Gr.{match.group} · {match.date.slice(5).replace("-", "/")} {match.timeES}h
        </span>
        <span style={{ fontSize: 10, color: "#4040a0" }}>{match.venue}</span>
      </div>

      {/* Teams + score */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 19 }}>{GROUPS_DATA[match.group].teams.find(t => t.name === match.home)?.flag || "❓"}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: isPending ? "#5050a0" : "#f0f0f8" }}>{match.home}</span>
        </div>

        {mode === "results" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <ScoreInput value={rh} onChange={v => onResultChange("homeScore", v)} />
            <span style={{ color: "#2a2a40", fontWeight: 800, fontSize: 14 }}>–</span>
            <ScoreInput value={ra} onChange={v => onResultChange("awayScore", v)} />
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
            {mode === "predictions" && (
              <div>
                <div style={{ fontSize: 9, color: PLAYER_COLORS[activePlayerIdx % 6].text, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2, textAlign: "center" }}>
                  Pred.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <ScoreInput
                    value={predictions[activePlayerIdx]?.[match.id]?.h ?? ""}
                    onChange={v => onPredChange(match.id, "h", v)}
                    color={PLAYER_COLORS[activePlayerIdx % 6].bg}
                  />
                  <span style={{ color: "#2a2a40" }}>–</span>
                  <ScoreInput
                    value={predictions[activePlayerIdx]?.[match.id]?.a ?? ""}
                    onChange={v => onPredChange(match.id, "a", v)}
                    color={PLAYER_COLORS[activePlayerIdx % 6].bg}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: isPending ? "#5050a0" : "#f0f0f8", textAlign: "right" }}>{match.away}</span>
          <span style={{ fontSize: 19 }}>{GROUPS_DATA[match.group].teams.find(t => t.name === match.away)?.flag || "❓"}</span>
        </div>
      </div>

      {/* Scores strip (marcador tab) */}
      {mode === "scoreboard" && rh !== "" && (
        <div style={{ marginTop: 8, borderTop: "1px solid #1a1a2a", paddingTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
          {players.map((pl, idx) => {
            const pred = predictions[idx]?.[match.id];
            if (!pred || pred.h === "" || pred.h === undefined) return null;
            const { pts, hitExact, hitDiff, hit1x2 } = scoreMatch(+rh, +ra, +pred.h, +pred.a);
            const color = PLAYER_COLORS[idx % 6];
            return (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 4, background: color.light, border: `1px solid ${color.bg}`, borderRadius: 6, padding: "2px 7px", fontSize: 11 }}>
                <span style={{ color: color.text, fontWeight: 700 }}>{pl.name.slice(0, 8)}</span>
                <span style={{ fontFamily: "'Space Mono',monospace", color: color.text }}>{pred.h}–{pred.a}</span>
                {pts > 0 && <span style={{ background: color.bg, color: "#fff", borderRadius: 4, padding: "1px 5px", fontWeight: 800, fontSize: 10 }}>+{pts}</span>}
                {pts === 0 && <span style={{ color: "#3a3a60", fontSize: 10 }}>✗</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
