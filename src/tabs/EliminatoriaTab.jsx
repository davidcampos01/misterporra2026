import { useMemo } from "react";
import { getQualifiers, buildBracket, buildEuroBracket, buildWC26Bracket } from "../utils/knockout";
import { useTournament } from "../context/TournamentContext";
import { ScoreInput } from "../components/ScoreInput";

// ── Componentes compartidos ───────────────────────────────────────────────────

function TeamBox({ name, flag, isWinner, isLoser, tbd, size = "md" }) {
  if (!name) return <div style={{ opacity: 0.2, fontSize: 11 }}>—</div>;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: size === "lg" ? 8 : 5,
      padding: size === "lg" ? "7px 10px" : "5px 8px",
      background: isWinner ? "rgba(245,200,66,.15)" : "rgba(255,255,255,.03)",
      borderRadius: 8, border: `1px solid ${isWinner ? "#f5c842" : "rgba(255,255,255,.07)"}`,
      opacity: isLoser ? 0.4 : 1, transition: "all .2s",
    }}>
      <span style={{ fontSize: size === "lg" ? 20 : 15 }}>{flag ?? "❓"}</span>
      <span style={{ fontSize: size === "lg" ? 13 : 10, fontWeight: isWinner ? 800 : 500, color: isWinner ? "#f5c842" : tbd ? "#3a3a60" : "#d0d0e8", whiteSpace: "nowrap", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
    </div>
  );
}

// Tarjeta WC — teams son objetos { name, flag, tbd }
function WCMatchCard({ match, knockoutResults, size = "md", label }) {
  const r = knockoutResults?.[match.id];
  const hasResult = r && r.homeScore !== "" && r.homeScore !== undefined;
  const winner = hasResult ? (r.winner === "A" ? match.teamA : r.winner === "B" ? match.teamB : +r.homeScore > +r.awayScore ? match.teamA : +r.homeScore < +r.awayScore ? match.teamB : null) : null;
  return (
    <div style={{ background: "#111120", border: "1px solid #1a1a2a", borderRadius: 10, overflow: "hidden", minWidth: size === "lg" ? 160 : 130 }}>
      {label && <div style={{ fontSize: 9, color: "#3a3a60", fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", padding: "5px 8px 3px", borderBottom: "1px solid #1a1a2a" }}>{label}</div>}
      <div style={{ padding: "6px 4px", display: "flex", flexDirection: "column", gap: 3 }}>
        <TeamBox name={match.teamA?.name ?? "?"} flag={match.teamA?.flag} tbd={match.teamA?.tbd} isWinner={winner === match.teamA} isLoser={winner && winner !== match.teamA && !match.teamA?.tbd} size={size} />
        <div style={{ textAlign: "center", fontSize: 9, color: "#2a2a50", fontWeight: 800, letterSpacing: 1 }}>VS</div>
        <TeamBox name={match.teamB?.name ?? "?"} flag={match.teamB?.flag} tbd={match.teamB?.tbd} isWinner={winner === match.teamB} isLoser={winner && winner !== match.teamB && !match.teamB?.tbd} size={size} />
      </div>
      {hasResult && <div style={{ textAlign: "center", padding: "4px 0 6px", fontFamily: "'Space Mono',monospace", fontSize: size === "lg" ? 16 : 13, fontWeight: 800, color: "#f5c842" }}>{r.homeScore} – {r.awayScore}{r.winner && <span style={{ fontSize: 9, color: "#4040a0", marginLeft: 5 }}>TP</span>}</div>}
    </div>
  );
}

// Tarjeta Euro — teams son strings, flags via flagMap
// onResultChange: si se pasa, muestra inputs editables
function EuroMatchCard({ match, flagMap, size = "md", label, onResultChange }) {
  const { result, winner } = match;
  const rh = result?.homeScore ?? "";
  const ra = result?.awayScore ?? "";
  const isDraw = rh !== "" && ra !== "" && String(rh) === String(ra);
  const penH = result?.penaltyHome ?? "";
  const penA = result?.penaltyAway ?? "";

  return (
    <div style={{ background: "#111120", border: "1px solid #1a1a2a", borderRadius: 10, overflow: "hidden", minWidth: onResultChange ? 185 : size === "lg" ? 165 : 140 }}>
      {label && <div style={{ fontSize: 9, color: "#3a3a60", fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", padding: "5px 8px 3px", borderBottom: "1px solid #1a1a2a" }}>{label}</div>}
      <div style={{ padding: "6px 4px", display: "flex", flexDirection: "column", gap: 3 }}>
        <TeamBox name={match.home} flag={flagMap[match.home]} isWinner={winner === match.home} isLoser={winner && winner !== match.home} size={size} />
        {onResultChange ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "4px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <ScoreInput value={rh} onChange={v => onResultChange("homeScore", v)} />
              <span style={{ color: "#2a2a40", fontWeight: 800, fontSize: 14 }}>–</span>
              <ScoreInput value={ra} onChange={v => onResultChange("awayScore", v)} />
            </div>
            {isDraw && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input type="number" min="0" max="99" value={penH}
                  onChange={e => onResultChange("penaltyHome", e.target.value)}
                  placeholder="–" style={{ width: 30, height: 28, background: "#0a0a14", border: "1.5px solid #a066ff", borderRadius: 6, color: "#f0f0f8", fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700, textAlign: "center", outline: "none" }} />
                <span style={{ fontSize: 9, color: "#a066ff", fontWeight: 800, letterSpacing: 1 }}>PEN</span>
                <input type="number" min="0" max="99" value={penA}
                  onChange={e => onResultChange("penaltyAway", e.target.value)}
                  placeholder="–" style={{ width: 30, height: 28, background: "#0a0a14", border: "1.5px solid #a066ff", borderRadius: 6, color: "#f0f0f8", fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700, textAlign: "center", outline: "none" }} />
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", fontSize: 9, color: "#2a2a50", fontWeight: 800, letterSpacing: 1 }}>VS</div>
        )}
        <TeamBox name={match.away} flag={flagMap[match.away]} isWinner={winner === match.away} isLoser={winner && winner !== match.away} size={size} />
      </div>
      {!onResultChange && result && (
        <div style={{ textAlign: "center", padding: "4px 0 6px", fontFamily: "'Space Mono',monospace", fontSize: size === "lg" ? 16 : 13, fontWeight: 800, color: "#f5c842" }}>
          {result.homeScore} – {result.awayScore}
          {result.penaltyHome !== undefined && result.penaltyHome !== "" && <span style={{ fontSize: 10, color: "#a066ff", marginLeft: 5 }}>({result.penaltyHome}-{result.penaltyAway} pen)</span>}
        </div>
      )}
    </div>
  );
}

function RoundSection({ title, color = "#4cc9f0", children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 14, letterSpacing: 3, color, textTransform: "uppercase", marginBottom: 10, paddingBottom: 5, borderBottom: "1px solid #1a1a2a" }}>{title}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{children}</div>
    </div>
  );
}

function QualifiersGrid({ qualifiers, groups, numBest3rds }) {
  const groupKeys = Object.keys(groups).sort();
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 14, letterSpacing: 3, color: "#4cc9f0", marginBottom: 10, paddingBottom: 5, borderBottom: "1px solid #1a1a2a" }}>Clasificados de grupos</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 6 }}>
        {groupKeys.map(g => {
          const t1 = qualifiers[`1${g}`]; const t2 = qualifiers[`2${g}`];
          return (
            <div key={g} style={{ background: "#111120", border: "1px solid #1a1a2a", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ background: "rgba(123,47,255,.08)", padding: "4px 8px", fontSize: 11, fontFamily: "'Oswald',sans-serif", letterSpacing: 2, color: "#f5c842", borderBottom: "1px solid #1a1a2a" }}>Grupo {g}</div>
              {[{ t: t1, pos: "1º", col: "#06d6a0" }, { t: t2, pos: "2º", col: "#4cc9f0" }].map(({ t, pos, col }) => (
                <div key={pos} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 8px", borderBottom: "1px solid rgba(26,26,42,.5)" }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: col, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, color: "#080811", flexShrink: 0 }}>{pos}</div>
                  <span style={{ fontSize: 14 }}>{t?.flag ?? "❓"}</span>
                  <span style={{ fontSize: 10, color: t?.tbd ? "#3a3a60" : "#d0d0e8", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t?.name ?? "—"}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 10, color: "#3a3a60", fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>{numBest3rds} Mejores Terceros</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {Array.from({ length: numBest3rds }, (_, i) => {
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

// ── Euro bracket (usa fixtures de R16/QF/SF/FINAL) ───────────────────────────
function EuroBracket({ results, setResult, flagMap }) {
  const { fixtures } = useTournament();
  const br = useMemo(() => buildEuroBracket(fixtures, results), [fixtures, results]);
  if (!br) return null;
  const mkChange = (id) => setResult ? (key, val) => setResult(id, key, val) : undefined;
  return (
    <>
      <RoundSection title="Octavos de Final">{br.r16.map((m, i) => <EuroMatchCard key={m.id} match={m} flagMap={flagMap} label={`Partido ${i + 1}`} onResultChange={mkChange(m.id)} />)}</RoundSection>
      <RoundSection title="Cuartos de Final">{br.qf.map((m, i) => <EuroMatchCard key={m.id} match={m} flagMap={flagMap} label={`CF ${i + 1}`} onResultChange={mkChange(m.id)} />)}</RoundSection>
      <RoundSection title="Semifinales">{br.sf.map((m, i) => <EuroMatchCard key={m.id} match={m} flagMap={flagMap} label={`SF ${i + 1}`} size="lg" onResultChange={mkChange(m.id)} />)}</RoundSection>
      {br.final && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 14, letterSpacing: 3, color: "#f5c842", textTransform: "uppercase", marginBottom: 10, paddingBottom: 5, borderBottom: "1px solid #1a1a2a" }}>🏆 Final</div>
          <EuroMatchCard match={br.final} flagMap={flagMap} size="lg" onResultChange={mkChange(br.final.id)} />
        </div>
      )}
    </>
  );
}

// ── WC bracket (usa buildWC26Bracket con fixtures reales + resultados editables) ──
function WCBracket({ qualifiers, results, setResult }) {
  const { fixtures } = useTournament();
  const br = useMemo(() => buildWC26Bracket(fixtures, results, qualifiers), [fixtures, results, qualifiers]);

  // Si no hay fixtures KO en Firestore aún, usar buildBracket estático
  const staticBr = useMemo(() => !br ? buildBracket(qualifiers, results) : null, [br, qualifiers, results]);
  const bracket = br ?? staticBr;
  if (!bracket) return null;

  const mkChange = (id) => setResult ? (key, val) => setResult(id, key, val) : undefined;

  const renderWCMatch = (match, label) => {
    if (!match) return null;
    const r = results?.[match.id];
    const hasResult = r && r.homeScore !== "" && r.homeScore !== undefined;
    const isDraw = hasResult && String(r.homeScore) === String(r.awayScore);
    // Para bracket estático (sin fixtures KO), teamA/teamB son objetos; para dinámico son strings
    const homeStr = typeof match.home === "string" ? match.home : (match.teamA?.name ?? "?");
    const awayStr = typeof match.away === "string" ? match.away : (match.teamB?.name ?? "?");
    const homeFlag = typeof match.home === "string" ? (qualifiers?.[match.home]?.flag ?? "❓") : (match.teamA?.flag ?? "❓");
    const awayFlag = typeof match.away === "string" ? (qualifiers?.[match.away]?.flag ?? "❓") : (match.teamB?.flag ?? "❓");
    const homeTbd = homeStr === "?" || homeStr.startsWith("?");
    const awayTbd = awayStr === "?" || awayStr.startsWith("?");
    const bothKnown = !homeTbd && !awayTbd && homeStr !== "?" && awayStr !== "?";

    const winner = hasResult
      ? (r.winner === "A" ? homeStr : r.winner === "B" ? awayStr : +r.homeScore > +r.awayScore ? homeStr : +r.homeScore < +r.awayScore ? awayStr : null)
      : null;

    return (
      <div key={match.id} style={{ background: "#111120", border: "1px solid #1a1a2a", borderRadius: 10, overflow: "hidden", minWidth: setResult ? 185 : 130 }}>
        {label && <div style={{ fontSize: 9, color: "#3a3a60", fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", padding: "5px 8px 3px", borderBottom: "1px solid #1a1a2a" }}>{label}</div>}
        <div style={{ padding: "6px 4px", display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 8px", background: winner === homeStr ? "rgba(245,200,66,.15)" : "rgba(255,255,255,.03)", borderRadius: 8, border: `1px solid ${winner === homeStr ? "#f5c842" : "rgba(255,255,255,.07)"}`, opacity: (winner && winner !== homeStr && !homeTbd) ? 0.4 : 1 }}>
            <span style={{ fontSize: 15 }}>{homeFlag}</span>
            <span style={{ fontSize: 10, fontWeight: winner === homeStr ? 800 : 500, color: homeTbd ? "#3a3a60" : winner === homeStr ? "#f5c842" : "#d0d0e8", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{homeStr}</span>
          </div>
          {setResult && bothKnown && match.id ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "4px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <ScoreInput value={r?.homeScore ?? ""} onChange={v => mkChange(match.id)("homeScore", v)} />
                <span style={{ color: "#2a2a40", fontWeight: 800, fontSize: 14 }}>–</span>
                <ScoreInput value={r?.awayScore ?? ""} onChange={v => mkChange(match.id)("awayScore", v)} />
              </div>
              {isDraw && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input type="number" min="0" max="99" value={r?.penaltyHome ?? ""} onChange={e => mkChange(match.id)("penaltyHome", e.target.value)} placeholder="–" style={{ width: 30, height: 28, background: "#0a0a14", border: "1.5px solid #a066ff", borderRadius: 6, color: "#f0f0f8", fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700, textAlign: "center", outline: "none" }} />
                  <span style={{ fontSize: 9, color: "#a066ff", fontWeight: 800, letterSpacing: 1 }}>PEN</span>
                  <input type="number" min="0" max="99" value={r?.penaltyAway ?? ""} onChange={e => mkChange(match.id)("penaltyAway", e.target.value)} placeholder="–" style={{ width: 30, height: 28, background: "#0a0a14", border: "1.5px solid #a066ff", borderRadius: 6, color: "#f0f0f8", fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700, textAlign: "center", outline: "none" }} />
                </div>
              )}
              {isDraw && <div style={{ fontSize: 9, color: "#a066ff", letterSpacing: 1, fontWeight: 800 }}>DESEMPATE POR PENALTIS</div>}
            </div>
          ) : (
            <div style={{ textAlign: "center", fontSize: 9, color: "#2a2a50", fontWeight: 800, letterSpacing: 1 }}>
              {hasResult ? `${r.homeScore} – ${r.awayScore}${r.penaltyHome !== undefined && r.penaltyHome !== "" ? ` (${r.penaltyHome}-${r.penaltyAway}p)` : ""}` : "VS"}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 8px", background: winner === awayStr ? "rgba(245,200,66,.15)" : "rgba(255,255,255,.03)", borderRadius: 8, border: `1px solid ${winner === awayStr ? "#f5c842" : "rgba(255,255,255,.07)"}`, opacity: (winner && winner !== awayStr && !awayTbd) ? 0.4 : 1 }}>
            <span style={{ fontSize: 15 }}>{awayFlag}</span>
            <span style={{ fontSize: 10, fontWeight: winner === awayStr ? 800 : 500, color: awayTbd ? "#3a3a60" : winner === awayStr ? "#f5c842" : "#d0d0e8", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{awayStr}</span>
          </div>
        </div>
      </div>
    );
  };

  const r32matches = br ? bracket.r32 : bracket.r32;
  const r16matches = bracket.r16;
  const qfmatches = bracket.qf;
  const sfmatches = bracket.sf;
  const tercero = bracket.tercerPuesto;
  const final = bracket.final;

  return (
    <>
      <RoundSection title="Dieciseisavos de Final" color="#4cc9f0">
        {r32matches.map((m, i) => renderWCMatch(m, `P${i + 1}`))}
      </RoundSection>
      <RoundSection title="Octavos de Final" color="#4cc9f0">
        {r16matches.map((m, i) => renderWCMatch(m, `OF ${i + 1}`))}
      </RoundSection>
      <RoundSection title="Cuartos de Final" color="#a066ff">
        {qfmatches.map((m, i) => renderWCMatch(m, `CF ${i + 1}`))}
      </RoundSection>
      <RoundSection title="Semifinales" color="#f5c842">
        {sfmatches.map((m, i) => renderWCMatch(m, `SF ${i + 1}`))}
      </RoundSection>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 14, letterSpacing: 3, color: "#ff9944", textTransform: "uppercase", marginBottom: 10, paddingBottom: 5, borderBottom: "1px solid #1a1a2a" }}>3er Puesto</div>
          {renderWCMatch(tercero, null)}
        </div>
        <div>
          <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 14, letterSpacing: 3, color: "#f5c842", textTransform: "uppercase", marginBottom: 10, paddingBottom: 5, borderBottom: "1px solid #1a1a2a" }}>🏆 Final</div>
          {renderWCMatch(final, null)}
        </div>
      </div>
    </>
  );
}

// ── Tab Eliminatorias ─────────────────────────────────────────────────────────
export function EliminatoriaTab({ results, setResult, predictions, players, activePlayerIdx, setActivePlayerIdx }) {
  const { fixtures, groups, tournament } = useTournament();
  const isEuro = tournament.id === "euro2024";

  const flagMap = useMemo(() => {
    const m = {};
    Object.values(groups).forEach(g => g.teams.forEach(t => { m[t.name] = t.flag; }));
    return m;
  }, [groups]);

  const realQualifiers = useMemo(() => getQualifiers(results, fixtures, groups, tournament.numBest3rds), [results, fixtures, groups, tournament.numBest3rds]);

  return (
    <div style={{ padding: 16 }} className="fade-in">
      <QualifiersGrid qualifiers={realQualifiers} groups={groups} numBest3rds={tournament.numBest3rds} />
      {isEuro ? <EuroBracket results={results} setResult={setResult} flagMap={flagMap} /> : <WCBracket qualifiers={realQualifiers} results={results} setResult={setResult} />}
    </div>
  );
}


