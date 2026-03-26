import { useMemo, useState } from "react";
import { PLAYER_COLORS } from "../constants/theme";
import { getQualifiers, getQualifiersFromPreds, buildBracket } from "../utils/knockout";

const ROUND_LABELS = {
  r32: "Octavos de Final",
  r16: "Cuartos de Final",
  qf:  "Cuartos de Final",
  sf:  "Semifinales",
  "3rd": "3er Puesto",
  final: "Final",
};

function TeamBox({ team, winner, size = "md" }) {
  if (!team) return <div style={{ opacity: 0.2, fontSize: size === "lg" ? 14 : 11 }}>—</div>;
  const isWinner = winner && winner.name === team.name;
  const isLoser  = winner && winner.name !== team.name && !team.tbd;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: size === "lg" ? 8 : 5,
      padding: size === "lg" ? "7px 10px" : "5px 8px",
      background: isWinner ? "rgba(245,200,66,.15)" : "rgba(255,255,255,.03)",
      borderRadius: 8,
      border: `1px solid ${isWinner ? "#f5c842" : "rgba(255,255,255,.07)"}`,
      opacity: isLoser ? 0.4 : 1,
      transition: "all .2s",
    }}>
      <span style={{ fontSize: size === "lg" ? 20 : 15 }}>{team.flag ?? "❓"}</span>
      <span style={{
        fontSize: size === "lg" ? 13 : 10, fontWeight: isWinner ? 800 : 500,
        color: isWinner ? "#f5c842" : team.tbd ? "#3a3a60" : "#d0d0e8",
        whiteSpace: "nowrap", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis",
      }}>{team.name}</span>
    </div>
  );
}

function MatchCard({ match, knockoutResults, size = "md", label }) {
  const r = knockoutResults?.[match.id];
  const hasResult = r && r.homeScore !== "" && r.homeScore !== undefined;
  const winner = hasResult ? (
    r.winner ? (r.winner === "A" ? match.teamA : match.teamB) :
    +r.homeScore > +r.awayScore ? match.teamA :
    +r.homeScore < +r.awayScore ? match.teamB : null
  ) : null;

  return (
    <div style={{
      background: "#111120", border: "1px solid #1a1a2a", borderRadius: 10,
      overflow: "hidden", minWidth: size === "lg" ? 160 : 130,
    }}>
      {label && (
        <div style={{ fontSize: 9, color: "#3a3a60", fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", padding: "5px 8px 3px", borderBottom: "1px solid #1a1a2a" }}>
          {label}
        </div>
      )}
      <div style={{ padding: "6px 4px", display: "flex", flexDirection: "column", gap: 3 }}>
        <TeamBox team={match.teamA} winner={winner} size={size} />
        <div style={{ textAlign: "center", fontSize: 9, color: "#2a2a50", fontWeight: 800, letterSpacing: 1 }}>VS</div>
        <TeamBox team={match.teamB} winner={winner} size={size} />
      </div>
      {hasResult && (
        <div style={{ textAlign: "center", padding: "4px 0 6px", fontFamily: "'Space Mono',monospace", fontSize: size === "lg" ? 16 : 13, fontWeight: 800, color: "#f5c842" }}>
          {r.homeScore} – {r.awayScore}
          {r.winner && <span style={{ fontSize: 9, color: "#4040a0", marginLeft: 5 }}>TP</span>}
        </div>
      )}
    </div>
  );
}

function BracketSection({ title, matches, knockoutResults, size }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 14, letterSpacing: 3, color: "#4cc9f0", textTransform: "uppercase", marginBottom: 10, paddingBottom: 5, borderBottom: "1px solid #1a1a2a" }}>
        {title}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {matches.map((m, i) => (
          <MatchCard key={m.id} match={m} knockoutResults={knockoutResults} size={size}
            label={`Partido ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}

function QualifiersGrid({ qualifiers }) {
  const groups = "ABCDEFGHIJKL".split("");
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 14, letterSpacing: 3, color: "#4cc9f0", marginBottom: 10, paddingBottom: 5, borderBottom: "1px solid #1a1a2a" }}>
        Clasificados de grupos
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 6 }}>
        {groups.map(g => {
          const t1 = qualifiers[`1${g}`];
          const t2 = qualifiers[`2${g}`];
          return (
            <div key={g} style={{ background: "#111120", border: "1px solid #1a1a2a", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ background: "rgba(123,47,255,.08)", padding: "4px 8px", fontSize: 11, fontFamily: "'Oswald',sans-serif", letterSpacing: 2, color: "#f5c842", borderBottom: "1px solid #1a1a2a" }}>
                Grupo {g}
              </div>
              {[{ t: t1, pos: "1º", col: "#06d6a0" }, { t: t2, pos: "2º", col: "#4cc9f0" }].map(({ t, pos, col }) => (
                <div key={pos} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 8px", borderBottom: "1px solid rgba(26,26,42,.5)" }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: col, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, color: "#080811", flexShrink: 0 }}>{pos}</div>
                  <span style={{ fontSize: 14 }}>{t?.flag ?? "❓"}</span>
                  <span style={{ fontSize: 10, color: t?.tbd ? "#3a3a60" : "#d0d0e8", flexShrink: 0, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t?.name ?? "—"}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {/* 8 mejores 3ºs */}
      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 10, color: "#3a3a60", fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>8 Mejores Terceros</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {Array.from({ length: 8 }, (_, i) => {
            const t = qualifiers[`T${i + 1}`];
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, background: "#111120", border: "1px solid #1a1a2a", borderRadius: 8, padding: "5px 8px" }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#f5c842", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, color: "#080811", flexShrink: 0 }}>T{i + 1}</div>
                <span style={{ fontSize: 14 }}>{t?.flag ?? "❓"}</span>
                <span style={{ fontSize: 10, color: t?.tbd ? "#3a3a60" : "#d0d0e8" }}>{t?.name ?? "—"}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function EliminatoriaTab({ results, predictions, players, activePlayerIdx, setActivePlayerIdx }) {
  const [mode, setMode] = useState("real"); // "real" | "pred"

  // Para el modo "real", usamos resultados reales
  const realQualifiers = useMemo(() => getQualifiers(results), [results]);

  // Para el modo "predicciones", usamos el jugador activo
  const predQualifiers = useMemo(
    () => getQualifiersFromPreds(predictions[activePlayerIdx] ?? {}),
    [predictions, activePlayerIdx]
  );

  const qualifiers = mode === "real" ? realQualifiers : predQualifiers;

  // knock resultados solo aplican en modo real (no editable en pred por ahora)
  const bracket = useMemo(() => buildBracket(qualifiers, {}), [qualifiers]);

  const color = PLAYER_COLORS[activePlayerIdx % 6];

  return (
    <div style={{ padding: 16 }} className="fade-in">
      {/* Toggle real / pronóstico */}
      <div style={{ display: "flex", background: "#111120", borderRadius: 40, padding: 4, marginBottom: 14, border: "1px solid #1a1a2a", gap: 2 }}>
        {[
          { id: "real", label: "⚽ Resultados Reales" },
          { id: "pred", label: "🔮 Mis Pronósticos" },
        ].map(opt => (
          <button key={opt.id} onClick={() => setMode(opt.id)} style={{
            flex: 1, padding: "9px 14px", borderRadius: 36, fontSize: 12, fontWeight: 800,
            cursor: "pointer", border: "none", whiteSpace: "nowrap",
            background: mode === opt.id ? (opt.id === "pred" ? color.bg : "#7b2fff") : "transparent",
            color: mode === opt.id ? "#fff" : "#4040a0",
            transition: "all .2s",
          }}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Toggle jugadores (solo en modo predicciones) */}
      {mode === "pred" && (
        <div style={{ display: "flex", background: "#111120", borderRadius: 40, padding: 4, marginBottom: 14, border: "1px solid #1a1a2a", overflowX: "auto", gap: 2 }}>
          {players.map((pl, idx) => {
            const c = PLAYER_COLORS[idx % 6];
            const active = activePlayerIdx === idx;
            return (
              <button key={idx} onClick={() => setActivePlayerIdx(idx)} style={{
                flex: "0 0 auto", padding: "8px 14px", borderRadius: 36, fontSize: 12, fontWeight: 800,
                cursor: "pointer", border: "none", whiteSpace: "nowrap",
                background: active ? c.bg : "transparent",
                color: active ? "#fff" : "#4040a0",
              }}>
                {pl.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Clasificados */}
      <QualifiersGrid qualifiers={qualifiers} />

      {/* Bracket */}
      <BracketSection title="Octavos de Final" matches={bracket.r32} knockoutResults={{}} />
      <BracketSection title="Cuartos de Final" matches={bracket.r16} knockoutResults={{}} />
      <BracketSection title="Semifinales" matches={bracket.sf} knockoutResults={{}} size="lg" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 14, letterSpacing: 3, color: "#ff9944", textTransform: "uppercase", marginBottom: 10, paddingBottom: 5, borderBottom: "1px solid #1a1a2a" }}>3er Puesto</div>
          <MatchCard match={bracket.tercerPuesto} knockoutResults={{}} size="lg" />
        </div>
        <div>
          <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 14, letterSpacing: 3, color: "#f5c842", textTransform: "uppercase", marginBottom: 10, paddingBottom: 5, borderBottom: "1px solid #1a1a2a" }}>🏆 Final</div>
          <MatchCard match={bracket.final} knockoutResults={{}} size="lg" />
        </div>
      </div>
    </div>
  );
}
