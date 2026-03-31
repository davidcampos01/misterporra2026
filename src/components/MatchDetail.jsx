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

function PlayerPin({ player, subIn, isAway, stats }) {
  const [showSub, setShowSub] = useState(false);

  useEffect(() => {
    if (!subIn) return;
    const t = setInterval(() => setShowSub(s => !s), 5000);
    return () => clearInterval(t);
  }, [subIn]);

  const name = showSub ? subIn : (player.name ?? "");
  const short = name.split(" ").pop();
  const borderColor = isAway ? "#6a3060" : "#305070";
  const bgColor     = isAway ? "#1a1020" : "#101828";

  // Badge pequeño en esquina del círculo
  const Badge = ({ style, children }) => (
    <div style={{
      position: "absolute", background: "#0c0c1a", borderRadius: 4,
      minWidth: 14, height: 14, fontSize: 9,
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 1, lineHeight: 1, border: "1px solid #1a1a2a",
      ...style,
    }}>{children}</div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 42, maxWidth: 54 }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        background: bgColor, border: `2px solid ${borderColor}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 700, color: "#f0f0f8",
        flexShrink: 0, position: "relative",
      }}>
        {player.number}
        {/* Goles – arriba derecha */}
        {stats?.goals > 0 && (
          <Badge style={{ top: -6, right: -6 }}>
            ⚽{stats.goals > 1 && <span style={{ color: "#f0f0f8", fontSize: 7, fontWeight: 700 }}>{stats.goals}</span>}
          </Badge>
        )}
        {/* Asistencias – arriba izquierda */}
        {stats?.assists > 0 && (
          <Badge style={{ top: -6, left: -6 }}>
            👟{stats.assists > 1 && <span style={{ color: "#f0f0f8", fontSize: 7, fontWeight: 700 }}>{stats.assists}</span>}
          </Badge>
        )}
        {/* Tarjeta – abajo izquierda */}
        {stats?.card && (
          <Badge style={{ bottom: -6, left: -6, border: "none", background: "transparent" }}>
            {stats.card === "red" ? "🟥" : "🟨"}
          </Badge>
        )}
        {/* Cambio – abajo derecha (mismo símbolo que eventos) */}
        {subIn && (
          <Badge style={{ bottom: -6, right: -6, border: `1px solid ${showSub ? "#a066ff" : "#2a2a50"}` }}>
            <span style={{ color: "#06d6a0", fontSize: 8, fontWeight: 900, lineHeight: 1 }}>↑</span>
            <span style={{ color: "#ff6b6b", fontSize: 8, fontWeight: 900, lineHeight: 1 }}>↓</span>
          </Badge>
        )}
      </div>
      <div style={{
        fontSize: 9, color: showSub ? "#a066ff" : "#e0e0f8", textAlign: "center",
        maxWidth: 50, lineHeight: 1.2,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        textShadow: "0 1px 4px rgba(0,0,0,0.9)",
      }}>
        {short}
      </div>
    </div>
  );
}

function SinglePitch({ homeLineup, awayLineup, events }) {
  const substMap = {};
  (events ?? []).filter(ev => ev.type === "subst").forEach(ev => {
    if (ev.player?.name && ev.assist?.name) substMap[ev.player.name] = ev.assist.name;
  });

  // Stats por jugador: goles, asistencias, tarjeta
  const playerStats = {};
  const getStat = n => {
    if (!n) return null;
    if (!playerStats[n]) playerStats[n] = { goals: 0, assists: 0, card: null };
    return playerStats[n];
  };
  (events ?? []).forEach(ev => {
    const p = ev.player?.name, a = ev.assist?.name;
    if (ev.type === "Goal" && ev.detail !== "Missed Penalty") {
      if (ev.detail !== "Own Goal" && p) getStat(p).goals++;
      if (a) getStat(a).assists++;
    }
    if (ev.type === "Card" && p) {
      const s = getStat(p);
      if (ev.detail === "Red Card" || ev.detail === "Yellow Red Card") s.card = "red";
      else if (!s.card) s.card = "yellow";
    }
  });

  function buildRows(lineup, ascending) {
    const byRow = {};
    (lineup?.startXI ?? []).forEach(({ player: p }) => {
      const [r, c] = (p.grid ?? "1:1").split(":").map(Number);
      if (!byRow[r]) byRow[r] = [];
      byRow[r].push({ ...p, _col: c });
    });
    return Object.keys(byRow).map(Number)
      .sort(ascending ? (a, b) => a - b : (a, b) => b - a)
      .map(row => ({ row, players: [...byRow[row]].sort((a, b) => a._col - b._col) }));
  }

  // Home arriba: GK (row 1) en el borde superior → ascendente
  const homeRows = buildRows(homeLineup, true);
  // Away abajo: GK (row 1) en el borde inferior → descendente (forwards cerca del centro)
  const awayRows = buildRows(awayLineup, false);

  const homeSubs = homeLineup?.substitutes ?? [];
  const awaySubs = awayLineup?.substitutes ?? [];

  return (
    <div style={{ padding: "0 12px 16px" }}>
      {/* Entrenadores */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {[homeLineup, awayLineup].map((lu, i) => !lu ? null : (
          <div key={i} style={{
            flex: 1, display: "flex", alignItems: "center", gap: 7,
            padding: "7px 10px", background: "#080812",
            border: "1px solid #1a1a2a", borderRadius: 10,
          }}>
            <span style={{ fontSize: 18 }}>👔</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#f0f0f8",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {lu.coach?.name ?? "–"}
              </div>
              <div style={{ fontSize: 10, color: "#4040a0" }}>
                {lu.team?.name} · <span style={{ fontFamily: "'Space Mono',monospace" }}>{lu.formation}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Campo único */}
      <div style={{
        borderRadius: 12, border: "1px solid #1a3a1a",
        background: "linear-gradient(180deg,#163a1c 0%,#1a4422 50%,#163a1c 100%)",
        position: "relative", padding: "18px 4px",
        overflow: "hidden",
      }}>
        {/* Decoración del campo */}
        <div style={{ position: "absolute", inset: 8, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "50%", left: "8%", right: "8%", height: 1, background: "rgba(255,255,255,0.18)", transform: "translateY(-50%)" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 54, height: 54, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.13)" }} />
        <div style={{ position: "absolute", top: 8, left: "24%", right: "24%", height: "15%",
          border: "1px solid rgba(255,255,255,0.07)", borderTop: "none" }} />
        <div style={{ position: "absolute", bottom: 8, left: "24%", right: "24%", height: "15%",
          border: "1px solid rgba(255,255,255,0.07)", borderBottom: "none" }} />

        {/* Equipo local (mitad superior) */}
        {homeRows.map(({ row, players }) => (
          <div key={`h${row}`} style={{
            display: "flex", justifyContent: "space-around", alignItems: "flex-start",
            marginBottom: 14, position: "relative", zIndex: 1,
          }}>
            {players.map(p => <PlayerPin key={p.id} player={p} subIn={substMap[p.name]} isAway={false} stats={playerStats[p.name]} />)}
          </div>
        ))}

        {/* Nombres en la línea central */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 18px",
          position: "relative", zIndex: 1, margin: "0 0 14px" }}>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.18)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{homeLineup?.team?.name}</span>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.18)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{awayLineup?.team?.name}</span>
        </div>

        {/* Equipo visitante (mitad inferior) */}
        {awayRows.map(({ row, players }, idx) => (
          <div key={`a${row}`} style={{
            display: "flex", justifyContent: "space-around", alignItems: "flex-start",
            marginBottom: idx < awayRows.length - 1 ? 14 : 0, position: "relative", zIndex: 1,
          }}>
            {players.map(p => <PlayerPin key={p.id} player={p} subIn={substMap[p.name]} isAway={true} stats={playerStats[p.name]} />)}
          </div>
        ))}
      </div>

      {/* Suplentes de ambos equipos */}
      {(homeSubs.length > 0 || awaySubs.length > 0) && (
        <div style={{ marginTop: 14, display: "flex", gap: 16 }}>
          {[[homeSubs, homeLineup, false], [awaySubs, awayLineup, true]].map(([subs, lu, away], i) => {
            const POS_ORDER = { G: 0, D: 1, M: 2, F: 3 };
            const sorted = [...subs].sort((a, b) =>
              (POS_ORDER[a.player.pos] ?? 9) - (POS_ORDER[b.player.pos] ?? 9)
            );
            return subs.length > 0 ? (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: "#3a3a60", letterSpacing: 1, textTransform: "uppercase", marginBottom: 5, fontWeight: 700 }}>
                  Suplentes · {lu?.team?.name}
                </div>
                {sorted.map(({ player: p }) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                    <span style={{ fontSize: 9, fontFamily: "'Space Mono',monospace", minWidth: 16, textAlign: "right",
                      color: away ? "#6a3060" : "#305070" }}>{p.number}</span>
                    <span style={{ fontSize: 11, color: "#5060a0" }}>{p.name}</span>
                  </div>
                ))}
              </div>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

export function MatchDetail({ match, resultData, flagMap, onClose }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [tab, setTab]         = useState("eventos");

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

  const homeTeamId = data?.homeTeamId ?? null;
  const awayTeamId = data?.awayTeamId ?? null;
  const events = data?.events ?? [];

  const homeLineup = data?.lineups?.find(l => l.team?.id === homeTeamId) ?? data?.lineups?.[0];
  const awayLineup = data?.lineups?.find(l => l.team?.id === awayTeamId) ?? data?.lineups?.[1];
  const hasLineups = !!(homeLineup || awayLineup);

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
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,.75)", display: "flex",
      alignItems: "flex-end", justifyContent: "center",
    }}>
      <div
        ref={sheetRef}
        onClick={e => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          background: "#0f0f1c", border: "1px solid #1a1a2a",
          borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 600,
          maxHeight: "90vh", overflowY: "auto", padding: "0 0 32px",
        }}
      >
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
          <div style={{ width: 36, height: 4, background: "#2a2a40", borderRadius: 2 }} />
        </div>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 20px 16px", borderBottom: "1px solid #1a1a2a",
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
            {resultData?.penaltyHome !== undefined && resultData.penaltyHome !== "" && (
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

        {/* Tabs — solo si hay datos y alineaciones */}
        {data && hasLineups && (
          <div style={{ display: "flex", borderBottom: "1px solid #1a1a2a" }}>
            {[["eventos","⚽ Eventos"], ["alineaciones","📋 Alineaciones"]].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)} style={{
                flex: 1, padding: "10px 0", background: "none", border: "none",
                cursor: "pointer", fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
                color: tab === key ? "#f5c842" : "#3a3a60",
                borderBottom: tab === key ? "2px solid #f5c842" : "2px solid transparent",
              }}>
                {label}
              </button>
            ))}
          </div>
        )}

        {!apiId && (
          <div style={{ padding: 24, textAlign: "center", color: "#4040a0", fontSize: 13 }}>
            Los datos de detalle estarán disponibles después de sincronizar resultados.
          </div>
        )}
        {apiId && loading && (
          <div style={{ padding: 32, textAlign: "center", color: "#4040a0", fontSize: 13 }}>Cargando detalles…</div>
        )}
        {error && (
          <div style={{ margin: 16, padding: 12, background: "rgba(255,107,107,.1)", border: "1px solid rgba(255,107,107,.3)", borderRadius: 8, color: "#ff6b6b", fontSize: 12, textAlign: "center" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Tab: Eventos */}
        {data && tab === "eventos" && (
          <div style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "#6060a0", fontWeight: 700 }}>{match.home}</span>
              <span style={{ fontSize: 11, color: "#6060a0", fontWeight: 700 }}>{match.away}</span>
            </div>
            {events.length === 0 ? (
              <div style={{ textAlign: "center", color: "#3a3a60", fontSize: 12, padding: "16px 0" }}>
                Sin eventos disponibles
              </div>
            ) : events.map((ev, i) => (
              <EventRow key={i} ev={ev} homeTeamId={homeTeamId} />
            ))}
          </div>
        )}

        {/* Tab: Alineaciones */}
        {data && tab === "alineaciones" && (
          <div style={{ paddingTop: 16 }}>
            <SinglePitch homeLineup={homeLineup} awayLineup={awayLineup} events={events} />
          </div>
        )}
      </div>
    </div>
  );
}
