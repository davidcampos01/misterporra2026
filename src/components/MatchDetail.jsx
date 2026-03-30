import { useState, useEffect } from "react";

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

function EventRow({ ev, homeTeamName }) {
  const isHome = ev.team?.name === homeTeamName;
  const icon = eventIcon(ev.type, ev.detail);
  const minute = ev.time?.elapsed + (ev.time?.extra ? `+${ev.time.extra}` : "");
  const playerName = ev.player?.name ?? "";
  const assistName = ev.assist?.name;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "5px 0",
      flexDirection: isHome ? "row" : "row-reverse",
    }}>
      {/* Nombre jugador */}
      <div style={{ flex: 1, textAlign: isHome ? "right" : "left" }}>
        <span style={{ fontSize: 12, color: ev.type === "Goal" ? "#f0f0f8" : "#7070a0", fontWeight: ev.type === "Goal" ? 600 : 400 }}>
          {playerName}
        </span>
        {ev.type === "subst" && assistName && (
          <div style={{ fontSize: 10, color: "#4040a0" }}>↑ {assistName}</div>
        )}
        {ev.type === "Goal" && assistName && (
          <div style={{ fontSize: 10, color: "#4040a0" }}>🅰️ {assistName}</div>
        )}
      </div>
      {/* Icono */}
      <div style={{ fontSize: 14, lineHeight: 1 }}>{icon}</div>
      {/* Minuto */}
      <div style={{
        fontFamily: "'Space Mono',monospace",
        fontSize: 11,
        color: "#5050a0",
        minWidth: 28,
        textAlign: "center",
      }}>
        {minute}'
      </div>
    </div>
  );
}

function LineupColumn({ team }) {
  if (!team) return null;
  const pos = { G: "🧤", D: "🛡️", M: "⚙️", F: "⚡" };
  return (
    <div style={{ flex: 1 }}>
      <div style={{
        fontSize: 11, fontWeight: 800, color: "#f5c842",
        letterSpacing: 1, textTransform: "uppercase",
        marginBottom: 8, textAlign: "center",
      }}>
        {team.team?.name}
        <span style={{ color: "#4040a0", marginLeft: 6, fontWeight: 400 }}>({team.formation})</span>
      </div>
      {team.startXI?.map(({ player: p }) => (
        <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
          <span style={{ fontSize: 9, color: "#3030a0", minWidth: 16, textAlign: "right" }}>{p.number}</span>
          <span style={{ fontSize: 10 }}>{pos[p.pos] ?? "·"}</span>
          <span style={{ fontSize: 11, color: "#d0d0f0" }}>{p.name}</span>
        </div>
      ))}
      {team.substitutes?.length > 0 && (
        <>
          <div style={{ fontSize: 9, color: "#3030a0", marginTop: 8, marginBottom: 4, letterSpacing: 1, textTransform: "uppercase" }}>Suplentes</div>
          {team.substitutes.map(({ player: p }) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
              <span style={{ fontSize: 9, color: "#3030a0", minWidth: 16, textAlign: "right" }}>{p.number}</span>
              <span style={{ fontSize: 11, color: "#5050a0" }}>{p.name}</span>
            </div>
          ))}
        </>
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

  // Para comparar eventos usamos el nombre del equipo local según el primer lineup
  const homeApiName = homeLineup?.team?.name;

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
        onClick={e => e.stopPropagation()}
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

              {/* Línea central */}
              <div style={{ borderLeft: "1px solid #1a1a2a", margin: "0 50%", height: 0 }} />

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
              <div style={{ padding: "0 20px 16px", borderTop: "1px solid #1a1a2a", paddingTop: 16 }}>
                <div style={{ fontSize: 11, color: "#4040a0", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>
                  Alineaciones
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <LineupColumn team={homeLineup} />
                  <div style={{ width: 1, background: "#1a1a2a", flexShrink: 0 }} />
                  <LineupColumn team={awayLineup} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
