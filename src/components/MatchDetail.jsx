import { useState, useEffect, useRef } from "react";

// Iconos de eventos
const EVENT_ICON = {
  Goal:            "⚽",
  "Own Goal":      "⚽",
  "Missed Penalty":"❌",
  "Yellow Card":   "🟨",
  "Red Card":      "🟥",
  "Yellow Red Card":"🟧",
  subst:           "🔄",
};

function eventIcon(type, detail) {
  if (type === "Goal") {
    if (detail === "Own Goal")      return "⚽💔";
    if (detail === "Penalty")       return "🎯";
    if (detail === "Missed Penalty") return "❌";
    return "⚽";
  }
  if (type === "Card") return detail === "Red Card" ? "🟥" : detail === "Yellow Red Card" ? "🟧" : "🟨";
  if (type === "subst") return "🔄";
  if (type === "Var") return "📺";
  return "·";
}

function EventRow({ ev, homeTeamId }) {
  const isHome = ev.team?.id === homeTeamId;
  const icon = eventIcon(ev.type, ev.detail);
  const minute = ev.time?.elapsed + (ev.time?.extra ? `+${ev.time.extra}` : "");
  const playerName = ev.player?.name ?? "";
  const assistName = ev.assist?.name;
  const isGoal = ev.type === "Goal";

  const Cell = ({ side }) => {
    const show = side === "home" ? isHome : !isHome;
    if (!show) return <div style={{ flex: 1 }} />;
    const nameColor = isGoal ? "#f0f0f8" : "#7070a0";
    return (
      <div style={{ flex: 1, textAlign: side === "home" ? "right" : "left", padding: side === "home" ? "0 8px 0 0" : "0 0 0 8px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4,
          flexDirection: side === "home" ? "row-reverse" : "row" }}>
          <span style={{ fontSize: 13, lineHeight: 1 }}>{icon}</span>
          <div>
            <div style={{ fontSize: 12, color: nameColor, fontWeight: isGoal ? 700 : 400 }}>
              {playerName}
            </div>
            {ev.type === "subst" && assistName && (
              <div style={{ fontSize: 10, color: "#4040a0" }}>↑ {assistName}</div>
            )}
            {isGoal && assistName && (
              <div style={{ fontSize: 10, color: "#4040a0" }}>ast. {assistName}</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", alignItems: "center", minHeight: 30, padding: "2px 0" }}>
      <Cell side="home" />
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#5050a0",
        minWidth: 36, textAlign: "center", flexShrink: 0, borderLeft: "1px solid #1a1a2a",
        borderRight: "1px solid #1a1a2a", padding: "2px 0" }}>
        {minute}'
      </div>
      <Cell side="away" />
    </div>
  );
}

function PlayerPin({ player }) {
  const parts = (player.name ?? "").split(" ");
  const shortName = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 40, maxWidth: 52 }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50%",
        background: "#111130", border: "2px solid #3a3a70",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 700, color: "#f0f0f8",
        flexShrink: 0,
      }}>
        {player.number}
      </div>
      <div style={{
        fontSize: 9, color: "#e0e0f8", textAlign: "center",
        maxWidth: 50, lineHeight: 1.2,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        textShadow: "0 1px 3px rgba(0,0,0,0.8)",
      }}>
        {shortName}
      </div>
    </div>
  );
}

function PitchLineup({ team, label }) {
  if (!team) return null;

  // Agrupar titulares por fila (campo grid "fila:columna")
  const byRow = {};
  (team.startXI ?? []).forEach(({ player: p }) => {
    const [r, c] = (p.grid ?? "1:1").split(":").map(Number);
    if (!byRow[r]) byRow[r] = [];
    byRow[r].push({ ...p, _col: c });
  });

  // Filas descendentes: delanteros arriba, portero abajo
  const rows = Object.keys(byRow).map(Number).sort((a, b) => b - a);

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Barra entrenador */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 12px",
        background: "#080812", border: "1px solid #1a1a2a",
        borderRadius: "10px 10px 0 0",
      }}>
        <div style={{ fontSize: 22, lineHeight: 1 }}>👔</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f8",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {team.coach?.name ?? "–"}
          </div>
          <div style={{ fontSize: 10, color: "#4040a0" }}>Entrenador · {label}</div>
        </div>
        <div style={{ flexShrink: 0, textAlign: "right" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#f5c842", letterSpacing: 0.5 }}>{team.team?.name}</div>
          <div style={{ fontSize: 10, color: "#5050a0", fontFamily: "'Space Mono',monospace" }}>{team.formation}</div>
        </div>
      </div>

      {/* Campo */}
      <div style={{
        border: "1px solid #1a3a1a", borderTop: "none",
        borderRadius: "0 0 10px 10px",
        padding: "14px 6px 10px",
        background: "#1a4020",
        backgroundImage: [
          "repeating-linear-gradient(180deg,transparent,transparent 28px,rgba(0,0,0,0.12) 28px,rgba(0,0,0,0.12) 56px)",
          "linear-gradient(180deg,#1a4020 0%,#163518 100%)",
        ].join(","),
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Línea central */}
        <div style={{ position: "absolute", top: "50%", left: "8%", right: "8%",
          height: 1, background: "rgba(255,255,255,0.12)" }} />
        {/* Círculo central */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 50, height: 50, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)" }} />

        {rows.map((row, idx) => {
          const players = [...byRow[row]].sort((a, b) => a._col - b._col);
          return (
            <div key={row} style={{
              display: "flex", justifyContent: "space-around", alignItems: "flex-start",
              marginBottom: idx < rows.length - 1 ? 12 : 0,
              position: "relative", zIndex: 1,
            }}>
              {players.map(p => <PlayerPin key={p.id} player={p} />)}
            </div>
          );
        })}
      </div>

      {/* Suplentes */}
      {team.substitutes?.length > 0 && (
        <div style={{ marginTop: 10, padding: "0 4px" }}>
          <div style={{ fontSize: 9, color: "#3a3a60", letterSpacing: 1,
            textTransform: "uppercase", marginBottom: 5, fontWeight: 700 }}>
            Suplentes
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 12px" }}>
            {team.substitutes.map(({ player: p }) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 9, color: "#3a3a60",
                  fontFamily: "'Space Mono',monospace", minWidth: 14, textAlign: "right" }}>
                  {p.number}
                </span>
                <span style={{ fontSize: 11, color: "#5050a0" }}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function MatchDetail({ match, resultData, flagMap, onClose }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const apiId = resultData?.apiId;

  useEffect(() => {
    if (!apiId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/match-detail?fixtureApiId=${apiId}`)
      .then(r => r.json())
      .then(d => {
        if (d.ok) setData(d);
        else setError(d.error ?? "Error desconocido");
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [apiId]);

  const homeFlag = flagMap?.[match.home] ?? "🏳️";
  const awayFlag = flagMap?.[match.away] ?? "🏳️";
  const rh = resultData?.homeScore ?? "";
  const ra = resultData?.awayScore ?? "";

  const homeTeamId  = data?.homeTeamId ?? null;
  const awayTeamId  = data?.awayTeamId ?? null;
  const events = data?.events ?? [];

  // Lineups ordenados: primero home, luego away
  const homeLineup = data?.lineups?.find(l => l.team?.id === homeTeamId) ?? data?.lineups?.[0];
  const awayLineup = data?.lineups?.find(l => l.team?.id === awayTeamId) ?? data?.lineups?.[1];

  // Swipe-down para cerrar
  const sheetRef = useRef(null);
  const touchStartY = useRef(null);
  function onTouchStart(e) { touchStartY.current = e.touches[0].clientY; }
  function onTouchEnd(e) {
    if (touchStartY.current == null) return;
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    if (delta > 80) onClose();
    touchStartY.current = null;
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,.75)", display: "flex",
        alignItems: "flex-end", justifyContent: "center",
      }}
    >
      <div
        ref={sheetRef}
        onClick={e => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          background: "#0f0f1c",
          border: "1px solid #1a1a2a",
          borderRadius: "20px 20px 0 0",
          width: "100%",
          maxWidth: 600,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "0 0 32px",
        }}
      >
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
          <div style={{ width: 36, height: 4, background: "#2a2a40", borderRadius: 2 }} />
        </div>

        {/* Header del partido */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 20px 16px",
          borderBottom: "1px solid #1a1a2a",
        }}>
          <div style={{ flex: 1, textAlign: "right" }}>
            <div style={{ fontSize: 28 }}>{homeFlag}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#f0f0f8", marginTop: 4 }}>{match.home}</div>
          </div>
          <div style={{ textAlign: "center", padding: "0 16px", minWidth: 90 }}>
            {rh !== "" ? (
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 32, fontWeight: 700, color: "#f5c842" }}>
                {rh} – {ra}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: "#3a3a60" }}>vs</div>
            )}
            <div style={{ fontSize: 9, color: "#3030a0", letterSpacing: 1, marginTop: 4, textTransform: "uppercase" }}>
              {match.date?.slice(5).replace("-","/")} {match.timeES}h
            </div>
            {resultData?.penaltyHome !== undefined && (
              <div style={{ fontSize: 11, color: "#a066ff", marginTop: 2 }}>
                Pen. {resultData.penaltyHome}–{resultData.penaltyAway}
              </div>
            )}
          </div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontSize: 28 }}>{awayFlag}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#f0f0f8", marginTop: 4 }}>{match.away}</div>
          </div>
        </div>

        {!apiId && (
          <div style={{ padding: 24, textAlign: "center", color: "#4040a0", fontSize: 13 }}>
            Los datos de detalle estarán disponibles después de sincronizar resultados.
          </div>
        )}

        {apiId && loading && (
          <div style={{ padding: 32, textAlign: "center", color: "#4040a0", fontSize: 13 }}>
            Cargando detalles…
          </div>
        )}

        {error && (
          <div style={{ margin: 16, padding: 12, background: "rgba(255,107,107,.1)", border: "1px solid rgba(255,107,107,.3)", borderRadius: 8, color: "#ff6b6b", fontSize: 12, textAlign: "center" }}>
            ⚠️ {error}
          </div>
        )}

        {data && (
          <>
            {/* Timeline de eventos */}
            <div style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 11, color: "#4040a0", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, fontWeight: 700 }}>
                Eventos del partido
              </div>

              {/* Cabecera equipos */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "#6060a0", fontWeight: 700 }}>{match.home}</span>
                <span style={{ fontSize: 11, color: "#6060a0", fontWeight: 700 }}>{match.away}</span>
              </div>

              {events.length === 0 && (
                <div style={{ textAlign: "center", color: "#3a3a60", fontSize: 12, padding: "16px 0" }}>
                  Sin eventos disponibles
                </div>
              )}

              {events.map((ev, i) => (
                <EventRow key={i} ev={ev} homeTeamId={homeTeamId} />
              ))}
            </div>

            {/* Alineaciones */}
            {(homeLineup || awayLineup) && (
              <div style={{ padding: "16px 16px 0", borderTop: "1px solid #1a1a2a" }}>
                <div style={{ fontSize: 11, color: "#4040a0", letterSpacing: 1,
                  textTransform: "uppercase", marginBottom: 14, fontWeight: 700 }}>
                  Alineaciones
                </div>
                <PitchLineup team={homeLineup} label="Local" />
                <PitchLineup team={awayLineup} label="Visitante" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
