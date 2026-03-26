import { useState } from "react";
import { PLAYER_COLORS } from "../constants/theme";

const SYNC_KEY = import.meta.env.VITE_SYNC_KEY;

export function SetupTab({ players, scores, renamePlayer, removePlayer, addPlayer, tournament, onSync }) {
  const [syncState, setSyncState] = useState(null); // null | "loading" | "ok" | "error"
  const [syncMsg, setSyncMsg] = useState("");

  async function handleSync() {
    if (!SYNC_KEY) {
      setSyncState("error");
      setSyncMsg("Falta la variable VITE_SYNC_KEY en Vercel");
      return;
    }
    setSyncState("loading");
    setSyncMsg("");
    try {
      const res = await fetch(`/api/sync-results?tournament=${tournament.id}&key=${SYNC_KEY}`);
      const data = await res.json();
      if (res.ok && data.ok) {
        // Escribir resultados en Firestore desde el frontend (sin firebase-admin)
        await onSync(data.results);
        setSyncState("ok");
        setSyncMsg(`✓ ${data.matched} partidos actualizados`);
      } else {
        setSyncState("error");
        setSyncMsg(data.error ?? `Error ${res.status}`);
      }
    } catch (e) {
      setSyncState("error");
      setSyncMsg(e.message);
    }
    setTimeout(() => setSyncState(null), 5000);
  }

  return (
    <div style={{ padding: 16 }} className="fade-in">
      {/* Jugadores */}
      <div style={{ background: "#111120", border: "1px solid #1a1a2a", borderRadius: 14, padding: 18, marginBottom: 14 }}>
        <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 20, letterSpacing: 2, color: "#f5c842", marginBottom: 14 }}>
          👥 Jugadores ({players.length})
        </div>
        {players.map((pl, idx) => {
          const color = PLAYER_COLORS[idx % 6];
          return (
            <div key={idx} style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "#080811", borderRadius: 10, padding: 12, marginBottom: 8,
              border: `1px solid ${color.bg}`,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: color.light, border: `2px solid ${color.bg}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                {idx + 1}
              </div>
              <input
                value={pl.name}
                onChange={e => renamePlayer(idx, e.target.value)}
                style={{ flex: 1, background: "none", border: "none", color: "#f0f0f8", fontSize: 15, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, outline: "none" }}
              />
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 20, fontWeight: 700, color: color.text, minWidth: 50, textAlign: "right" }}>
                {scores[idx]?.total ?? 0}
              </div>
              {players.length > 2 && (
                <button onClick={() => removePlayer(idx)} style={{ background: "rgba(255,100,100,.15)", border: "1px solid rgba(255,100,100,.3)", borderRadius: 6, color: "#ff6b6b", fontSize: 12, padding: "4px 8px", cursor: "pointer", fontWeight: 700 }}>✕</button>
              )}
            </div>
          );
        })}
        <button onClick={addPlayer} style={{
          width: "100%", padding: 12, borderRadius: 10, background: "rgba(123,47,255,.1)",
          border: "1.5px dashed #7b2fff", color: "#a066ff", fontSize: 13, fontWeight: 800,
          cursor: "pointer", fontFamily: "'DM Sans',sans-serif", letterSpacing: 1,
        }}>
          + Añadir jugador
        </button>
      </div>

      {/* Sistema de puntuación */}
      <div style={{ background: "#111120", border: "1px solid #1a1a2a", borderRadius: 14, padding: 18 }}>
        <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 18, letterSpacing: 2, color: "#4cc9f0", marginBottom: 12 }}>📋 Sistema Misterporra</div>
        {[
          { phase: "Fase de Grupos · 72 partidos", color: "#06d6a0", items: [
            "Acertar 1X2: +4 pts",
            "Además diferencia de goles: +2 pts",
            "Además resultado exacto: +4 pts",
            "Máximo por partido: 10 pts",
          ]},
          { phase: "Fase Intermedia · Clasificados", color: "#f5c842", items: [
            "Clasificado a 16avos: +5 pts/selección",
            "1º de grupo: +4 pts · 2º: +3 pts",
            "3º de grupo: +2 pts · 4º: +1 pt",
          ]},
          { phase: "Eliminatorias · 32 partidos", color: "#ff6b6b", items: [
            "1X2 en eliminatoria acertada: +4 pts",
            "Además diferencia goles: +2 pts",
            "Además resultado exacto: +4 pts",
            "Clasificado cuartos: +9 pts",
            "Clasificado semis: +11 pts",
            "Clasificado final: +13 pts",
            "Subcampeón: +10 pts · Campeón: +15 pts",
          ]},
        ].map(s => (
          <div key={s.phase} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: s.color, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, borderLeft: `3px solid ${s.color}`, paddingLeft: 8 }}>{s.phase}</div>
            {s.items.map(item => (
              <div key={item} style={{ fontSize: 12, color: "#8080a0", paddingLeft: 12, marginBottom: 3 }}>· {item}</div>
            ))}
          </div>
        ))}
        <div style={{ background: "rgba(76,201,240,.07)", border: "1px solid rgba(76,201,240,.2)", borderRadius: 8, padding: 10, fontSize: 11, color: "#4cc9f0", marginTop: 6, lineHeight: 1.6 }}>
          ⚠️ Equipos con * son repechajes pendientes (UEFA y Repesca Internacional, definidos en marzo 2026).
        </div>
      </div>

      {/* Sincronización de resultados */}
      <div style={{ background: "#111120", border: "1px solid #1a1a2a", borderRadius: 14, padding: 18, marginTop: 14 }}>
        <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 18, letterSpacing: 2, color: "#a066ff", marginBottom: 8 }}>🔄 Resultados en tiempo real</div>
        <div style={{ fontSize: 11, color: "#4040a0", marginBottom: 14, lineHeight: 1.6 }}>
          Importa los resultados oficiales de <strong style={{ color: "#8080b0" }}>{tournament.fullName}</strong> desde API-Football.
          Los resultados se guardan en la base de datos y se actualizan para todos los jugadores.
        </div>
        <button
          onClick={handleSync}
          disabled={syncState === "loading"}
          style={{ width: "100%", padding: "13px 0", borderRadius: 10, background: syncState === "loading" ? "rgba(123,47,255,.05)" : "rgba(123,47,255,.15)", border: "1.5px solid #7b2fff", color: syncState === "loading" ? "#5030a0" : "#a066ff", fontSize: 13, fontWeight: 800, cursor: syncState === "loading" ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", letterSpacing: 1, transition: "all .2s" }}
        >
          {syncState === "loading" ? "⏳ Sincronizando…" : "⬇ Sincronizar resultados ahora"}
        </button>
        {syncState === "ok" && (
          <div style={{ marginTop: 10, background: "rgba(6,214,160,.1)", border: "1px solid rgba(6,214,160,.3)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#06d6a0", fontWeight: 700 }}>{syncMsg}</div>
        )}
        {syncState === "error" && (
          <div style={{ marginTop: 10, background: "rgba(255,107,107,.1)", border: "1px solid rgba(255,107,107,.3)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#ff6b6b" }}>{syncMsg}</div>
        )}
      </div>
    </div>
  );
}
