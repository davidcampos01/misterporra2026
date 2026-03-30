import { PLAYER_COLORS } from "../constants/theme";
import { useTournament } from "../context/TournamentContext";

export function MarcadorTab({ players, scores, standingsScores, koScores, results, predictions, activePlayerIdx }) {
  const { groups } = useTournament();
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
            const koSc = koScores?.[idx]?.total ?? 0;
            const total = sc + stSc + koSc;
            return (
              <div key={idx} style={{ textAlign: "center", minWidth: 90 }}>
                <div style={{ fontSize: 11, color: "#5060a0", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{pl.name}</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 42, fontWeight: 700, lineHeight: 1, color: color.text }}>{total}</div>
                <div style={{ fontSize: 10, color: "#4040a0", marginTop: 2 }}>pts</div>
                {stSc > 0 && <div style={{ fontSize: 9, color: "#f5c842", marginTop: 2 }}>+{stSc} clasi.</div>}
                {koSc > 0 && <div style={{ fontSize: 9, color: "#4cc9f0", marginTop: 2 }}>+{koSc} elim.</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ranking */}
      {[...players.map((pl, i) => ({ pl, i, sc: scores[i], stSc: standingsScores?.[i], koSc: koScores?.[i] }))]
        .sort((a, b) => ((b.sc?.total ?? 0) + (b.stSc?.total ?? 0) + (b.koSc?.total ?? 0)) - ((a.sc?.total ?? 0) + (a.stSc?.total ?? 0) + (a.koSc?.total ?? 0)))
        .map(({ pl, i, sc, stSc, koSc }, rank) => {
          const color = PLAYER_COLORS[i % 6];
          const matchPts = sc?.total ?? 0;
          const clasifPts = stSc?.total ?? 0;
          const koPts = koSc?.total ?? 0;
          const total = matchPts + clasifPts + koPts;
          return (
            <div key={i} style={{ background: "#111120", border: `1px solid ${rank === 0 ? "#f5c842" : "#1a1a2a"}`, borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: rank === 0 ? "rgba(245,200,66,.2)" : "#0f0f1c", border: `2px solid ${rank === 0 ? "#f5c842" : color.bg}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Mono',monospace", fontWeight: 800, fontSize: 14, color: rank === 0 ? "#f5c842" : color.text, flexShrink: 0 }}>
                  {rank + 1}
                </div>
                <div style={{ fontWeight: 700, flex: 1 }}>{pl.name}</div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 24, fontWeight: 700, color: color.text, lineHeight: 1 }}>{total}</div>
                  {(clasifPts > 0 || koPts > 0) && (
                    <div style={{ fontSize: 9, color: "#f5c842", letterSpacing: .5 }}>
                      {matchPts} partidos{clasifPts > 0 ? ` + ${clasifPts} clasi.` : ""}{koPts > 0 ? ` + ${koPts} elim.` : ""}
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
                  <span>{sc?.detail?.length ?? 0} aciertos · {stSc?.detail?.length ?? 0} grupos · {koSc?.detail?.length ?? 0} elim.</span>
                  <span>{total} pts máx. —</span>
                </div>
              </div>
              {/* Puntos por partidos de grupo */}
              {sc?.detail?.length > 0 && (() => {
                const byGroup = {};
                sc.detail.forEach(d => {
                  if (d.m.group && d.m.matchday) {
                    byGroup[d.m.group] = (byGroup[d.m.group] ?? 0) + d.pts;
                  }
                });
                const entries = Object.entries(byGroup).sort(([a], [b]) => a.localeCompare(b));
                if (!entries.length) return null;
                return (
                  <div style={{ borderTop: "1px solid #1a1a2a", padding: "8px 14px" }}>
                    <div style={{ fontSize: 10, color: "#06d6a0", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Puntos partidos</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {entries.map(([g, pts]) => (
                        <div key={g} style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(6,214,160,.08)", border: "1px solid rgba(6,214,160,.2)", borderRadius: 6, padding: "3px 8px" }}>
                          <span style={{ fontFamily: "'Oswald',monospace", fontSize: 11, color: "#06d6a0", letterSpacing: 1 }}>Gr.{g}</span>
                          <span style={{ fontFamily: "'Space Mono',monospace", fontWeight: 800, fontSize: 11, color: "#fff" }}>+{pts}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              {koPts > 0 && (
                <div style={{ borderTop: "1px solid #1a1a2a", padding: "8px 14px" }}>
                  <div style={{ fontSize: 10, color: "#4cc9f0", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Puntos eliminatorias</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {koSc.detail.map((d, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(76,201,240,.08)", border: "1px solid rgba(76,201,240,.2)", borderRadius: 6, padding: "3px 8px" }}>
                        <span style={{ fontFamily: "'Oswald',monospace", fontSize: 11, color: "#4cc9f0", letterSpacing: 1 }}>{d.team} · {d.round}</span>
                        <span style={{ fontFamily: "'Space Mono',monospace", fontWeight: 800, fontSize: 11, color: "#fff" }}>+{d.pts}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Detalle clasificaciones */}
              {clasifPts > 0 && (
                <div style={{ borderTop: "1px solid #1a1a2a", padding: "8px 14px" }}>
                  <div style={{ fontSize: 10, color: "#f5c842", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Puntos clasificaciones</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {stSc.detail.map((d, j) => {
                      const correctPos = d.hits.filter(h => h.correctPos);
                      const qualBonuses = d.hits.filter(h => h.qualBonus > 0);
                      return (
                        <div key={j} style={{ display: "flex", flexDirection: "column", gap: 2, background: "rgba(245,200,66,.08)", border: "1px solid rgba(245,200,66,.2)", borderRadius: 6, padding: "4px 8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontFamily: "'Oswald',monospace", fontSize: 11, color: "#f5c842", letterSpacing: 1 }}>Gr.{d.group}</span>
                            <span style={{ fontFamily: "'Space Mono',monospace", fontWeight: 800, fontSize: 11, color: "#fff" }}>+{d.total}</span>
                          </div>
                          <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                            {d.hits.map((h, hi) => (
                              <span key={hi} style={{
                                fontSize: 9, borderRadius: 3, padding: "1px 4px",
                                background: h.correctPos ? "rgba(6,214,160,.2)" : h.qualBonus > 0 ? "rgba(245,200,66,.15)" : "transparent",
                                color: h.correctPos ? "#06d6a0" : h.qualBonus > 0 ? "#f5c842" : "#3a3a60",
                                fontWeight: 700,
                              }}>
                                {h.pos}º{h.correctPos ? `+${h.pts}` : h.qualBonus > 0 ? `+${h.qualBonus}` : ""}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}


    </div>
  );
}
