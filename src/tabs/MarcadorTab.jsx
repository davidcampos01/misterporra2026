import { GROUPS_DATA } from "../constants/groups";
import { FIXTURES } from "../constants/fixtures";
import { PLAYER_COLORS } from "../constants/theme";
import { MatchRow } from "../components/MatchRow";

export function MarcadorTab({ players, scores, standingsScores, results, predictions, activePlayerIdx }) {
  return (
    <div style={{ padding: 16 }} className="fade-in">
      {/* Marcador global */}
      <div style={{ background: "linear-gradient(135deg,#111120,#1a0830)", border: "1px solid #7b2fff", borderRadius: 16, padding: "22px 16px", marginBottom: 16 }}>
        <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 22, letterSpacing: 3, color: "#f5c842", textAlign: "center", marginBottom: 18 }}>
          MARCADOR MISTERPORRA
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
          {players.map((pl, idx) => {
            const color = PLAYER_COLORS[idx % 6];
            const sc = scores[idx]?.total ?? 0;
            const stSc = standingsScores?.[idx]?.total ?? 0;
            const total = sc + stSc;
            return (
              <div key={idx} style={{ textAlign: "center", minWidth: 90 }}>
                <div style={{ fontSize: 11, color: "#5060a0", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{pl.name}</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 42, fontWeight: 700, lineHeight: 1, color: color.text }}>{total}</div>
                <div style={{ fontSize: 10, color: "#4040a0", marginTop: 2 }}>pts</div>
                {stSc > 0 && <div style={{ fontSize: 9, color: "#f5c842", marginTop: 2 }}>+{stSc} clasi.</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ranking */}
      {[...players.map((pl, i) => ({ pl, i, sc: scores[i], stSc: standingsScores?.[i] }))]
        .sort((a, b) => ((b.sc?.total ?? 0) + (b.stSc?.total ?? 0)) - ((a.sc?.total ?? 0) + (a.stSc?.total ?? 0)))
        .map(({ pl, i, sc, stSc }, rank) => {
          const color = PLAYER_COLORS[i % 6];
          const matchPts = sc?.total ?? 0;
          const clasifPts = stSc?.total ?? 0;
          const total = matchPts + clasifPts;
          return (
            <div key={i} style={{ background: "#111120", border: `1px solid ${rank === 0 ? "#f5c842" : "#1a1a2a"}`, borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: rank === 0 ? "rgba(245,200,66,.2)" : "#0f0f1c", border: `2px solid ${rank === 0 ? "#f5c842" : color.bg}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Mono',monospace", fontWeight: 800, fontSize: 14, color: rank === 0 ? "#f5c842" : color.text, flexShrink: 0 }}>
                  {rank + 1}
                </div>
                <div style={{ fontWeight: 700, flex: 1 }}>{pl.name}</div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 24, fontWeight: 700, color: color.text, lineHeight: 1 }}>{total}</div>
                  {clasifPts > 0 && (
                    <div style={{ fontSize: 9, color: "#f5c842", letterSpacing: .5 }}>
                      {matchPts} partidos + {clasifPts} clasi.
                    </div>
                  )}
                </div>
              </div>
              {/* Barra de progreso */}
              <div style={{ padding: "0 14px 12px" }}>
                <div style={{ height: 5, background: "#0f0f1c", borderRadius: 5, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, (total / (817 + 132)) * 100)}%`, background: color.bg, borderRadius: 5, transition: "width .6s" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#4040a0", marginTop: 4 }}>
                  <span>{sc?.detail?.length ?? 0} aciertos · {stSc?.detail?.length ?? 0} grupos</span>
                  <span>{total} / {817 + 132} pts máx.</span>
                </div>
              </div>
              {/* Detalle clasificaciones */}
              {clasifPts > 0 && (
                <div style={{ borderTop: "1px solid #1a1a2a", padding: "8px 14px" }}>
                  <div style={{ fontSize: 10, color: "#f5c842", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Puntos por clasificaciones</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {stSc.detail.map((d, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(245,200,66,.08)", border: "1px solid rgba(245,200,66,.2)", borderRadius: 6, padding: "3px 8px" }}>
                        <span style={{ fontFamily: "'Oswald',monospace", fontSize: 11, color: "#f5c842", letterSpacing: 1 }}>Gr.{d.group}</span>
                        <span style={{ fontFamily: "'Space Mono',monospace", fontWeight: 800, fontSize: 11, color: "#fff" }}>+{d.total}</span>
                        <span style={{ fontSize: 9, color: "#8080b0" }}>{d.hits.filter(h => h.correct).map(h => `${h.pos}º`).join(" ")}</span>
                      </div>
                    ))}</div>
                </div>
              )}
              {/* Detalle de aciertos en partidos */}
              {sc?.detail?.length > 0 && (
                <div style={{ borderTop: "1px solid #1a1a2a", padding: "8px 14px" }}>
                  <div style={{ fontSize: 10, color: "#4040a0", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Aciertos destacados</div>
                  {sc.detail.slice(-5).reverse().map((d, j) => (
                    <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, padding: "4px 0", borderBottom: "1px solid #13131f" }}>
                      <span style={{ color: "#8080b0" }}>
                        {GROUPS_DATA[d.m.group].teams.find(t => t.name === d.m.home)?.flag} {d.m.home} vs {d.m.away} {GROUPS_DATA[d.m.group].teams.find(t => t.name === d.m.away)?.flag}
                      </span>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 10, color: "#06d6a0" }}>
                          {d.hitExact ? "⬥ Exacto" : d.hitDiff ? "◈ Dif." : "◇ 1X2"}
                        </span>
                        <span style={{ background: color.bg, color: "#fff", borderRadius: 5, padding: "2px 7px", fontFamily: "'Space Mono',monospace", fontWeight: 800, fontSize: 11 }}>+{d.pts}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

      {/* Detalle por partido */}
      <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 18, letterSpacing: 2, color: "#4cc9f0", margin: "16px 0 10px" }}>Detalle por partido</div>
      {FIXTURES.filter(f => results[f.id]?.homeScore !== undefined && results[f.id]?.homeScore !== "").map(m => (
        <MatchRow key={m.id} match={m}
          resultData={results[m.id]}
          onResultChange={() => {}}
          predictions={predictions} players={players}
          activePlayerIdx={activePlayerIdx}
          onPredChange={() => {}}
          mode="scoreboard"
        />
      ))}
      {Object.keys(results).length === 0 && (
        <div style={{ textAlign: "center", color: "#4040a0", fontSize: 13, padding: 30 }}>
          Introduce resultados en el Calendario o en Grupos para ver los puntos aquí.
        </div>
      )}
    </div>
  );
}
