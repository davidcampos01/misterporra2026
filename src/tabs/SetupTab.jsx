import { useState } from "react";
import { PLAYER_COLORS } from "../constants/theme";

function PlayerNameInput({ name, onSave }) {
  const [local, setLocal] = useState(name);
  // Si el nombre cambia desde Firestore, sincronizar
  // (pero solo si el input no tiene el foco)
  return (
    <input
      value={local}
      onChange={e => setLocal(e.target.value)}
      onBlur={() => { if (local !== name) onSave(local); }}
      style={{ flex: 1, background: "none", border: "none", color: "#f0f0f8", fontSize: 15, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, outline: "none" }}
    />
  );
}

const SYNC_KEY = import.meta.env.VITE_SYNC_KEY;

// Banderas para equipos de repechaje (inglés traducido → emoji)
const FLAG_MAP = {
  "Grecia": "🇬🇷", "Ucrania": "🇺🇦", "Turquía": "🇹🇷", "Georgia": "🇬🇪",
  "Islandia": "🇮🇸", "Gales": "🏴󠁧󠁢󠁷󠁬󠁳󠁿", "Bosnia": "🇧🇦", "Israel": "🇮🇱",
  "Finlandia": "🇫🇮", "Montenegro": "🇲🇪", "Bulgaria": "🇧🇬",
  "Macedonia del Norte": "🇲🇰", "Kosovo": "🇽🇰", "Luxemburgo": "🇱🇺",
  "Suecia": "🇸🇪", "Irlanda": "🇮🇪", "Chipre": "🇨🇾", "Kazajistán": "🇰🇿",
  "Eslovaquia": "🇸🇰", "Polonia": "🇵🇱", "Hungría": "🇭🇺", "Rumanía": "🇷🇴",
  "Serbia": "🇷🇸", "Albania": "🇦🇱", "Croacia": "🇭🇷", "Chequia": "🇨🇿",
  "Eslovenia": "🇸🇮", "Dinamarca": "🇩🇰",
  "Trinidad y Tobago": "🇹🇹", "Honduras": "🇭🇳", "Jamaica": "🇯🇲",
  "Costa Rica": "🇨🇷", "El Salvador": "🇸🇻", "Panamá": "🇵🇦",
  "Islas Salomón": "🇸🇧", "Baréin": "🇧🇭", "Irak": "🇮🇶",
  "Indonesia": "🇮🇩", "Tailandia": "🇹🇭",
  "Perú": "🇵🇪", "Bolivia": "🇧🇴", "Venezuela": "🇻🇪", "Chile": "🇨🇱",
};

// Componente para editar equipos pendientes de repechaje
function PendingTeamsSection({ tournament, teamOverrides, setTeamOverride }) {
  const pendingTeams = [];
  Object.values(tournament.groups ?? {}).forEach(g => {
    g.teams.forEach(t => { if (t.pending) pendingTeams.push(t); });
  });
  if (!pendingTeams.length) return null;

  return (
    <div style={{ background: "#111120", border: "1px solid #2a1a0a", borderRadius: 14, padding: 18, marginBottom: 14 }}>
      <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 18, letterSpacing: 2, color: "#f5a623", marginBottom: 4 }}>
        🔄 Equipos pendientes de repechaje
      </div>
      <div style={{ fontSize: 11, color: "#4040a0", marginBottom: 14, lineHeight: 1.6 }}>
        Cuando se confirmen los equipos de repechaje, actualiza su nombre y bandera aquí.
        Todos los jugadores verán el cambio automáticamente.
      </div>
      {pendingTeams.map(t => {
        const ov = teamOverrides?.[t.name] ?? {};
        return (
          <PendingTeamRow
            key={t.name}
            placeholder={t.name}
            overrideName={ov.name ?? ""}
            overrideFlag={ov.flag ?? ""}
            onSave={(name, flag) => {
              if (name.trim()) setTeamOverride(t.name, { name: name.trim(), flag: flag.trim() || "🏳️" });
            }}
          />
        );
      })}
    </div>
  );
}

function PendingTeamRow({ placeholder, overrideName, overrideFlag, onSave }) {
  const [name, setName] = useState(overrideName);
  const [flag, setFlag] = useState(overrideFlag);
  const isDirty = name !== overrideName || flag !== overrideFlag;
  const isConfirmed = !!overrideName;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, background: "#080811", borderRadius: 10, padding: 10, border: `1px solid ${isConfirmed ? "rgba(6,214,160,.3)" : "rgba(245,166,35,.2)"}` }}>
      <div style={{ fontSize: 11, color: "#4040a0", minWidth: 110, fontFamily: "'Space Mono',monospace", fontSize: 10 }}>
        {placeholder}
      </div>
      <input
        value={flag}
        onChange={e => setFlag(e.target.value)}
        placeholder="🏳️"
        style={{ width: 44, background: "none", border: "1px solid #2a2a40", borderRadius: 6, color: "#f0f0f8", fontSize: 20, textAlign: "center", padding: "4px 2px", outline: "none", flexShrink: 0 }}
      />
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        onBlur={() => { if (isDirty && name.trim()) onSave(name, flag); }}
        placeholder="Nombre del equipo"
        style={{ flex: 1, background: "none", border: "1px solid #2a2a40", borderRadius: 6, color: "#f0f0f8", fontSize: 13, padding: "6px 8px", outline: "none", fontFamily: "'DM Sans',sans-serif" }}
      />
      {isDirty && name.trim() && (
        <button
          onClick={() => onSave(name, flag)}
          style={{ flexShrink: 0, padding: "6px 10px", background: "rgba(6,214,160,.15)", border: "1px solid rgba(6,214,160,.4)", borderRadius: 6, color: "#06d6a0", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
        >✓</button>
      )}
      {isConfirmed && !isDirty && (
        <span style={{ color: "#06d6a0", fontSize: 14, flexShrink: 0 }}>✓</span>
      )}
    </div>
  );
}

export function SetupTab({ players, scores, standingsScores, koScores, renamePlayer, removePlayer, addPlayer, tournament, onSync, teamOverrides = {}, setTeamOverride }) {
  const [syncState, setSyncState] = useState(null); // null | "loading" | "ok" | "error"
  const [syncMsg, setSyncMsg] = useState("");

  async function handleSync() {
    setSyncState("loading");
    setSyncMsg("");
    try {
      const res = await fetch(`/api/sync-results?tournament=${tournament.id}`);
      const data = await res.json();
      if (res.ok && data.ok) {
        // Hacer el matching en el frontend usando los fixtures del torneo
        const fixtures = tournament.fixtures;
        const scoreByTeams = {};
        for (const s of data.scores) {
          scoreByTeams[`${s.home}|${s.away}`] = s;
        }
        const results = {};
        let matched = 0;
        for (const fix of fixtures) {
          const key  = `${fix.home}|${fix.away}`;
          const rkey = `${fix.away}|${fix.home}`;
          const score = scoreByTeams[key] ?? scoreByTeams[rkey];
          if (!score) continue;
          const isSwapped = !scoreByTeams[key];
          const entry = isSwapped
            ? { homeScore: score.awayScore, awayScore: score.homeScore }
            : { homeScore: score.homeScore, awayScore: score.awayScore };
          // Guardar penaltis y winner si los hubo
          if (score.penaltyHome !== undefined) {
            entry.penaltyHome = isSwapped ? score.penaltyAway : score.penaltyHome;
            entry.penaltyAway = isSwapped ? score.penaltyHome : score.penaltyAway;
            entry.winner = (Number(entry.penaltyHome) > Number(entry.penaltyAway)) ? "A" : "B";
          }
          if (score.apiId !== undefined) entry.apiId = score.apiId;
          results[String(fix.id)] = entry;
          matched++;
        }
        // Auto-detectar equipos de repechaje: para cada fixture con placeholder (*),
        // buscamos en los resultados un partido del equipo conocido vs uno no conocido del grupo.
        const resolvedOverrides = {};
        const pendingFixes = fixtures.filter(f => f.home.endsWith("*") || f.away.endsWith("*"));
        for (const fix of pendingFixes) {
          const homeIsPending = fix.home.endsWith("*");
          const placeholder = homeIsPending ? fix.home : fix.away;
          const anchor      = homeIsPending ? fix.away : fix.home;
          if (teamOverrides?.[placeholder] || resolvedOverrides[placeholder]) continue;
          const knownOpponents = new Set(
            fixtures
              .filter(f2 => f2.group === fix.group && f2.id !== fix.id)
              .flatMap(f2 => [f2.home, f2.away])
              .filter(t => !t.endsWith("*") && t !== anchor)
          );
          for (const [key] of Object.entries(scoreByTeams)) {
            const [h, a] = key.split("|");
            let realName = null;
            if (h === anchor && !knownOpponents.has(a)) realName = a;
            else if (a === anchor && !knownOpponents.has(h)) realName = h;
            if (realName) {
              resolvedOverrides[placeholder] = { name: realName, flag: FLAG_MAP[realName] ?? "🏳️" };
              break;
            }
          }
        }
        for (const [ph, team] of Object.entries(resolvedOverrides)) {
          setTeamOverride?.(ph, team);
        }

        if (matched === 0) {
          setSyncState("error");
          setSyncMsg("No se encontraron partidos coincidentes. Los resultados existentes no han cambiado.");
        } else {
          await onSync(results);
          const extraMsg = Object.keys(resolvedOverrides).length
            ? ` · ${Object.keys(resolvedOverrides).length} equipo(s) identificado(s)` : "";
          setSyncState("ok");
          setSyncMsg(`✓ ${matched} partidos actualizados${extraMsg}`);
        }
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
              <PlayerNameInput name={pl.name} onSave={newName => renamePlayer(idx, newName)} />
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 20, fontWeight: 700, color: color.text, minWidth: 50, textAlign: "right" }}>
                {(scores[idx]?.total ?? 0) + (standingsScores?.[idx]?.total ?? 0) + (koScores?.[idx]?.total ?? 0)}
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

      {/* Equipos pendientes (solo si hay alguno con pending:true en el torneo) */}
      <PendingTeamsSection tournament={tournament} teamOverrides={teamOverrides} setTeamOverride={setTeamOverride} />

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
