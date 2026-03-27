import { useState, useMemo } from "react";
import { getStandings, scoreMatch, scoreStandings, scoreKnockout } from "./utils/scoring";
import { getQualifiers, buildEuroBracket, buildPredBracket } from "./utils/knockout";
import { css } from "./styles/global";
import { useGameState } from "./hooks/useGameState";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { TournamentContext } from "./context/TournamentContext";
import { TOURNAMENTS } from "./lib/tournaments";
import { SetupTab } from "./tabs/SetupTab";
import { CalendarioTab } from "./tabs/CalendarioTab";
import { GruposTab } from "./tabs/GruposTab";
import { PronosticosTab } from "./tabs/PronosticosTab";
import { MarcadorTab } from "./tabs/MarcadorTab";
import { EliminatoriaTab } from "./tabs/EliminatoriaTab";

const TABS = [
  { id: "setup",          emoji: "⚙️",  label: "Setup"    },
  { id: "calendario",     emoji: "📅",  label: "Calendario" },
  { id: "grupos",         emoji: "📊",  label: "Grupos"   },
  { id: "eliminatorias",  emoji: "🥊",  label: "Elimin."  },
  { id: "pronosticos",    emoji: "🔮",  label: "Pronóst." },
  { id: "marcador",       emoji: "🏆",  label: "Puntos"   },
];

function TournamentSelector({ onSelect }) {
  const list = Object.values(TOURNAMENTS);
  return (
    <div style={{ background: "#080811", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, padding: 24 }}>
      <style>{css}</style>
      <div style={{ fontSize: 52 }}>🏆</div>
      <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 26, letterSpacing: 4, color: "#f5c842", textAlign: "center" }}>MISTER PORRA</div>
      <div style={{ color: "#4040a0", fontSize: 11, letterSpacing: 3, textTransform: "uppercase" }}>Selecciona el torneo</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 340 }}>
        {list.map(t => (
          <button key={t.id} onClick={() => onSelect(t.id)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", background: "#111120", border: `1px solid ${t.accentColor}44`, borderRadius: 14, cursor: "pointer", color: "#f0f0f8", textAlign: "left", width: "100%" }}>
            <span style={{ fontSize: 32 }}>{t.emoji}</span>
            <div>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 16, letterSpacing: 2, color: t.accentColor }}>{t.name}</div>
              <div style={{ fontSize: 11, color: "#4040a0", marginTop: 2 }}>{t.fullName}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function GameApp({ tournamentId, tournament, onChangeTournament }) {
  const [tab, setTab] = useState("grupos");
  const [activePlayerIdx, setActivePlayerIdx] = useState(0);

  const fixtures = tournament.fixtures;
  const groups = tournament.groups;

  const { gameState, fbError, setResult, setResults, setPred, addPlayer, removePlayer, renamePlayer } = useGameState(tournamentId);

  // Normalizar players
  const rawPlayers = gameState?.players ?? [];
  const players = Array.isArray(rawPlayers)
    ? rawPlayers
    : Object.keys(rawPlayers).sort((a, b) => Number(a) - Number(b)).map(k => rawPlayers[k]);

  const results = gameState?.results ?? {};

  const rawPreds = gameState?.predictions ?? {};
  const predictions = players.map((_, i) =>
    Array.isArray(rawPreds) ? (rawPreds[i] ?? {}) : (rawPreds[String(i)] ?? {})
  );

  const scores = useMemo(() => players.map((_, pidx) => {
    let total = 0, detail = [];
    fixtures.forEach(m => {
      const r = results[m.id];
      const p = predictions[pidx]?.[m.id];
      if (!r || r.homeScore === "" || r.awayScore === "" || !p || p.h === "" || p.h === undefined) return;
      const result = scoreMatch(+r.homeScore, +r.awayScore, +p.h, +p.a);
      total += result.pts;
      if (result.pts > 0) detail.push({ m, ...result });
    });
    return { total, detail };
  }), [results, predictions, players, fixtures]);

  const standings = useMemo(() => {
    const out = {};
    Object.keys(groups).forEach(g => {
      const groupFixtures = fixtures.filter(f => f.group === g && f.matchday).map(f => ({
        home: f.home, away: f.away,
        homeScore: results[f.id]?.homeScore ?? "",
        awayScore: results[f.id]?.awayScore ?? "",
      }));
      out[g] = getStandings(groups[g].teams, groupFixtures);
    });
    return out;
  }, [results, groups, fixtures]);

  const qualifiedTeams = useMemo(() => {
    const qualifiers = getQualifiers(results, fixtures, groups, tournament.numBest3rds);
    const set = new Set();
    Object.values(qualifiers).forEach(t => { if (t?.name && !t.tbd) set.add(t.name); });
    return set;
  }, [results, fixtures, groups, tournament]);

  const flagMap = useMemo(() => {
    const m = {};
    Object.values(groups).forEach(g => g.teams.forEach(t => { m[t.name] = t.flag; }));
    return m;
  }, [groups]);

  const realBracket = useMemo(() =>
    tournament.id === "euro2024" ? buildEuroBracket(fixtures, results) : null
  , [fixtures, results, tournament.id]);

  const standingsScores = useMemo(() => players.map((_, pidx) => {
    let total = 0;
    const detail = [];
    Object.keys(groups).forEach(g => {
      const realOrder = standings[g]?.map(t => t.name) ?? [];
      const playerPreds = predictions[pidx] ?? {};
      const groupFixtures = fixtures.filter(f => f.group === g && f.matchday).map(f => {
        const pred = playerPreds[f.id];
        return {
          home: f.home, away: f.away,
          homeScore: pred?.h !== undefined && pred?.h !== "" ? pred.h : "",
          awayScore: pred?.a !== undefined && pred?.a !== "" ? pred.a : "",
        };
      });
      const predStandings = getStandings(groups[g].teams, groupFixtures);
      const predOrder = predStandings.map(t => t.name);
      const hasRealResults = fixtures.filter(f => f.group === g && f.matchday).some(f => {
        const r = results[f.id];
        return r && r.homeScore !== "" && r.homeScore !== undefined;
      });
      if (!hasRealResults) return;
      const sc = scoreStandings(realOrder, predOrder, qualifiedTeams);
      total += sc.total;
      if (sc.total > 0) detail.push({ group: g, ...sc });
    });
    return { total, detail };
  }), [standings, predictions, players, results, qualifiedTeams, groups, fixtures]);

  const koScores = useMemo(() => players.map((_, pidx) => {
    const predBr = tournament.id === "euro2024"
      ? buildPredBracket(fixtures, predictions[pidx] ?? {}, groups, tournament.numBest3rds)
      : null;
    return scoreKnockout(realBracket, predBr);
  }), [realBracket, predictions, players, fixtures, groups, tournament]);

  const handleRemovePlayer = (idx) => {
    removePlayer(idx, players, predictions);
    if (activePlayerIdx >= players.length - 1) setActivePlayerIdx(Math.max(0, activePlayerIdx - 1));
  };

  // Pantalla de carga / error
  if (!gameState) {
    return (
      <div style={{ background: "#080811", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
        <style>{css}</style>
        <div style={{ fontSize: 52 }}>{tournament.emoji}</div>
        <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 28, letterSpacing: 4, color: tournament.accentColor }}>{tournament.name}</div>
        {fbError ? (
          <div style={{ background: "rgba(255,107,107,.1)", border: "1px solid #ff6b6b", borderRadius: 10, padding: "12px 20px", color: "#ff8888", fontSize: 12, textAlign: "center", maxWidth: 360 }}>
            ⚠️ Error al conectar con Firebase:<br />
            <code style={{ fontFamily: "monospace", fontSize: 11, color: "#ff6b6b" }}>{fbError}</code>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: "#4040a0", letterSpacing: 2, textTransform: "uppercase" }}>Conectando…</div>
        )}
      </div>
    );
  }

  return (
    <TournamentContext.Provider value={{ fixtures, groups, tournament }}>
      <div style={{ fontFamily: "'DM Sans',sans-serif", background: "#080811", minHeight: "100vh", color: "#f0f0f8", paddingBottom: 80 }}>
        <style>{css}</style>

        {/* HEADER */}
        <div style={{ background: "linear-gradient(160deg,#080811 0%,#110828 60%,#080811 100%)", padding: "40px 20px 20px", textAlign: "center", borderBottom: "1px solid #1a1a2a", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 50% -5%,rgba(245,200,66,.15) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ fontSize: 46, position: "relative" }}>{tournament.emoji}</div>
          <h1 style={{ fontFamily: "'Oswald',sans-serif", fontSize: 40, letterSpacing: 5, color: tournament.accentColor, lineHeight: 1, textShadow: `0 0 40px ${tournament.accentLight}`, position: "relative" }}>
            {tournament.name}
          </h1>
          <p style={{ color: "#4040a0", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginTop: 5, position: "relative" }}>
            Misterporra · {players.length} jugadores
          </p>
          <button onClick={onChangeTournament} style={{ marginTop: 4, background: "none", border: "none", color: "#2a2a50", fontSize: 10, cursor: "pointer", letterSpacing: 1, textTransform: "uppercase" }}>cambiar torneo</button>
        </div>

        {/* NAV */}
        <nav style={{ display: "flex", background: "#0c0c18", borderBottom: "1px solid #1a1a2a", overflowX: "auto", position: "sticky", top: 0, zIndex: 99 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: "0 0 auto", padding: "12px 16px", fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", background: "none", border: "none", borderBottom: tab === t.id ? "3px solid #f5c842" : "3px solid transparent", color: tab === t.id ? "#f5c842" : "#4040a0", whiteSpace: "nowrap" }}>
              {t.emoji} {t.label}
            </button>
          ))}
        </nav>

        {tab === "setup" && (
          <SetupTab players={players} scores={scores} standingsScores={standingsScores} koScores={koScores} renamePlayer={(idx, name) => renamePlayer(idx, name, players)} removePlayer={handleRemovePlayer} addPlayer={() => addPlayer(players, predictions)} tournament={tournament} onSync={setResults} />
        )}
        {tab === "calendario" && (
          <CalendarioTab results={results} setResult={setResult} predictions={predictions} players={players} activePlayerIdx={activePlayerIdx} />
        )}
        {tab === "grupos" && (
          <GruposTab standings={standings} results={results} setResult={setResult} predictions={predictions} players={players} activePlayerIdx={activePlayerIdx} />
        )}
        {tab === "eliminatorias" && (
          <EliminatoriaTab results={results} setResult={setResult} predictions={predictions} players={players} activePlayerIdx={activePlayerIdx} setActivePlayerIdx={setActivePlayerIdx} />
        )}
        {tab === "pronosticos" && (
          <PronosticosTab players={players} activePlayerIdx={activePlayerIdx} setActivePlayerIdx={setActivePlayerIdx} results={results} setResult={setResult} predictions={predictions} setPred={setPred} standings={standings} qualifiedTeams={qualifiedTeams} flagMap={flagMap} />
        )}
        {tab === "marcador" && (
          <MarcadorTab players={players} scores={scores} standingsScores={standingsScores} koScores={koScores} results={results} predictions={predictions} activePlayerIdx={activePlayerIdx} />
        )}
      </div>
    </TournamentContext.Provider>
  );
}

function App() {
  const [tournamentId, setTournamentId] = useState(
    () => localStorage.getItem("misterporra_tournament") ?? null
  );

  const tournament = tournamentId ? TOURNAMENTS[tournamentId] : null;

  if (!tournamentId || !tournament) {
    return (
      <TournamentSelector onSelect={id => {
        localStorage.setItem("misterporra_tournament", id);
        setTournamentId(id);
      }} />
    );
  }

  return (
    <GameApp
      tournamentId={tournamentId}
      tournament={tournament}
      onChangeTournament={() => {
        localStorage.removeItem("misterporra_tournament");
        setTournamentId(null);
      }}
    />
  );
}
export default function AppWithBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}