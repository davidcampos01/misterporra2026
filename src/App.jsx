import { useState, useMemo } from "react";
import { GROUPS_DATA } from "./constants/groups";
import { FIXTURES } from "./constants/fixtures";
import { PLAYER_COLORS } from "./constants/theme";
import { getStandings, scoreMatch } from "./utils/scoring";
import { css } from "./styles/global";
import { SetupTab } from "./tabs/SetupTab";
import { CalendarioTab } from "./tabs/CalendarioTab";
import { GruposTab } from "./tabs/GruposTab";
import { PronosticosTab } from "./tabs/PronosticosTab";
import { MarcadorTab } from "./tabs/MarcadorTab";

const TABS = [
  { id: "setup",       emoji: "⚙️",  label: "Setup"    },
  { id: "calendario",  emoji: "📅",  label: "Calendario" },
  { id: "grupos",      emoji: "📊",  label: "Grupos"   },
  { id: "pronosticos", emoji: "🔮",  label: "Pronóst." },
  { id: "marcador",    emoji: "🏆",  label: "Puntos"   },
];

export default function App() {
  const [tab, setTab] = useState("grupos");
  const [players, setPlayers] = useState([{ name: "Jugador 1" }, { name: "Jugador 2" }]);
  const [activePlayerIdx, setActivePlayerIdx] = useState(0);
  const [results, setResults] = useState({});
  const [predictions, setPredictions] = useState([]);

  const addPlayer = () => {
    setPlayers(prev => [...prev, { name: `Jugador ${prev.length + 1}` }]);
    setPredictions(prev => [...prev, {}]);
  };

  const removePlayer = (idx) => {
    if (players.length <= 2) return;
    setPlayers(prev => prev.filter((_, i) => i !== idx));
    setPredictions(prev => prev.filter((_, i) => i !== idx));
    if (activePlayerIdx >= players.length - 1) setActivePlayerIdx(Math.max(0, activePlayerIdx - 1));
  };

  const renamePlayer = (idx, name) => {
    setPlayers(prev => { const n = [...prev]; n[idx] = { ...n[idx], name }; return n; });
  };

  const setResult = (matchId, key, val) => {
    setResults(prev => ({ ...prev, [matchId]: { ...prev[matchId], [key]: val } }));
  };

  const setPred = (playerIdx, matchId, key, val) => {
    setPredictions(prev => {
      const n = [...prev];
      if (!n[playerIdx]) n[playerIdx] = {};
      n[playerIdx] = { ...n[playerIdx], [matchId]: { ...n[playerIdx][matchId], [key]: val } };
      return n;
    });
  };

  const scores = useMemo(() => players.map((_, pidx) => {
    let total = 0, detail = [];
    FIXTURES.forEach(m => {
      const r = results[m.id];
      const p = predictions[pidx]?.[m.id];
      if (!r || r.homeScore === "" || r.awayScore === "" || !p || p.h === "" || p.h === undefined) return;
      const result = scoreMatch(+r.homeScore, +r.awayScore, +p.h, +p.a);
      total += result.pts;
      if (result.pts > 0) detail.push({ m, ...result });
    });
    return { total, detail };
  }), [results, predictions, players]);

  const standings = useMemo(() => {
    const out = {};
    Object.keys(GROUPS_DATA).forEach(g => {
      const groupFixtures = FIXTURES.filter(f => f.group === g).map(f => ({
        home: f.home, away: f.away,
        homeScore: results[f.id]?.homeScore ?? "",
        awayScore: results[f.id]?.awayScore ?? "",
      }));
      out[g] = getStandings(GROUPS_DATA[g].teams, groupFixtures);
    });
    return out;
  }, [results]);

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: "#080811", minHeight: "100vh", color: "#f0f0f8", paddingBottom: 80 }}>
      <style>{css}</style>

      {/* HEADER */}
      <div style={{
        background: "linear-gradient(160deg,#080811 0%,#110828 60%,#080811 100%)",
        padding: "40px 20px 20px", textAlign: "center", borderBottom: "1px solid #1a1a2a",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 50% at 50% -5%,rgba(245,200,66,.15) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ fontSize: 46, position: "relative" }}>🏆</div>
        <h1 style={{ fontFamily: "'Oswald',sans-serif", fontSize: 40, letterSpacing: 5, color: "#f5c842", lineHeight: 1, textShadow: "0 0 40px rgba(245,200,66,.3)", position: "relative" }}>
          MUNDIAL 2026
        </h1>
        <p style={{ color: "#4040a0", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginTop: 5, position: "relative" }}>
          Misterporra · {players.length} jugadores · 104 partidos
        </p>
      </div>

      {/* NAV */}
      <nav style={{ display: "flex", background: "#0c0c18", borderBottom: "1px solid #1a1a2a", overflowX: "auto", position: "sticky", top: 0, zIndex: 99 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: "0 0 auto", padding: "12px 16px", fontSize: 11, fontWeight: 800,
            letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer",
            background: "none", border: "none",
            borderBottom: tab === t.id ? "3px solid #f5c842" : "3px solid transparent",
            color: tab === t.id ? "#f5c842" : "#4040a0",
            whiteSpace: "nowrap",
          }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </nav>

      {tab === "setup" && (
        <SetupTab players={players} scores={scores} renamePlayer={renamePlayer} removePlayer={removePlayer} addPlayer={addPlayer} />
      )}
      {tab === "calendario" && (
        <CalendarioTab results={results} setResult={setResult} predictions={predictions} players={players} activePlayerIdx={activePlayerIdx} />
      )}
      {tab === "grupos" && (
        <GruposTab standings={standings} results={results} setResult={setResult} predictions={predictions} players={players} activePlayerIdx={activePlayerIdx} />
      )}
      {tab === "pronosticos" && (
        <PronosticosTab players={players} activePlayerIdx={activePlayerIdx} setActivePlayerIdx={setActivePlayerIdx} results={results} setResult={setResult} predictions={predictions} setPred={setPred} />
      )}
      {tab === "marcador" && (
        <MarcadorTab players={players} scores={scores} results={results} predictions={predictions} activePlayerIdx={activePlayerIdx} />
      )}
    </div>
  );
}
