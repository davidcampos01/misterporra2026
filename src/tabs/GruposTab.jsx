import { useState } from "react";
import { GROUPS_DATA } from "../constants/groups";
import { FIXTURES } from "../constants/fixtures";
import { MatchRow } from "../components/MatchRow";

export function GruposTab({ standings, results, setResult, predictions, players, activePlayerIdx }) {
  const [expandedGroups, setExpandedGroups] = useState({});

  return (
    <div style={{ padding: 16 }} className="fade-in">
      <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 24, letterSpacing: 2, marginBottom: 14 }}>Clasificaciones</div>
      {Object.keys(GROUPS_DATA).map(g => {
        const open = expandedGroups[g];
        const st = standings[g];
        return (
          <div key={g} style={{ background: "#111120", border: "1px solid #1a1a2a", borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
            <div
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "linear-gradient(90deg,rgba(123,47,255,.1),transparent)", cursor: "pointer" }}
              onClick={() => setExpandedGroups(prev => ({ ...prev, [g]: !open }))}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 19, letterSpacing: 2, color: "#f5c842" }}>Grupo {g}</span>
                <div style={{ display: "flex", gap: 3 }}>
                  {st.slice(0, 2).map(t => <span key={t.name} style={{ fontSize: 18 }}>{t.flag}</span>)}
                </div>
              </div>
              <span style={{ color: "#4040a0", fontSize: 16 }}>{open ? "▲" : "▼"}</span>
            </div>

            {open && (
              <div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["#", "Equipo", "PJ", "PTS", "DG", "GF"].map(h => (
                        <th key={h} style={{ padding: "7px 8px", textAlign: h === "Equipo" ? "left" : "center", color: "#4040a0", fontWeight: 800, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", borderBottom: "1px solid #1a1a2a" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {st.map((team, i) => {
                      const posColor = ["#06d6a0", "#4cc9f0", "#f5c842", "#ff6b6b"][i];
                      const gd = team.gf - team.ga;
                      return (
                        <tr key={team.name} style={{ borderBottom: i < 3 ? "1px solid rgba(26,26,42,.7)" : "none" }}>
                          <td style={{ padding: "9px 8px" }}>
                            <div style={{ width: 20, height: 20, borderRadius: "50%", background: posColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#080811" }}>{i + 1}</div>
                          </td>
                          <td style={{ padding: "9px 8px", borderLeft: `3px solid ${posColor}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 17 }}>{team.flag}</span>
                              <span style={{ fontSize: 12, fontWeight: 500, color: team.pending ? "#4040a0" : "#f0f0f8" }}>{team.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: "9px 8px", textAlign: "center", fontFamily: "'Space Mono',monospace", fontSize: 12 }}>{team.mp}</td>
                          <td style={{ padding: "9px 8px", textAlign: "center", fontFamily: "'Space Mono',monospace", fontWeight: 800, fontSize: 14, color: "#f5c842" }}>{team.pts}</td>
                          <td style={{ padding: "9px 8px", textAlign: "center", fontFamily: "'Space Mono',monospace", fontSize: 12, color: gd > 0 ? "#06d6a0" : gd < 0 ? "#ff6b6b" : "#4040a0" }}>{gd > 0 ? `+${gd}` : gd}</td>
                          <td style={{ padding: "9px 8px", textAlign: "center", fontFamily: "'Space Mono',monospace", fontSize: 12 }}>{team.gf}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div style={{ padding: "10px 12px", borderTop: "1px solid #1a1a2a" }}>
                  <div style={{ fontSize: 10, color: "#4040a0", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Resultados</div>
                  {FIXTURES.filter(f => f.group === g).map(m => (
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
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
