import { useState, useMemo } from "react";

// ─── CONSTANTES ─────────────────────────────────────────────────────────────
const PLAYOFF_UEFA_A = "Rep. UEFA A*";
const PLAYOFF_UEFA_B = "Rep. UEFA B*";
const PLAYOFF_UEFA_C = "Rep. UEFA C*";
const PLAYOFF_UEFA_D = "Rep. UEFA D*";
const PLAYOFF_INT1 = "Rep. Inter. 1*";
const PLAYOFF_INT2 = "Rep. Inter. 2*";

// ─── GRUPOS REALES (sorteo 5 dic 2025) ──────────────────────────────────────
const GROUPS_DATA = {
  A: { teams: [
    { name: "México", flag: "🇲🇽" }, { name: "Sudáfrica", flag: "🇿🇦" },
    { name: "Corea del Sur", flag: "🇰🇷" }, { name: PLAYOFF_UEFA_D, flag: "❓", pending: true }
  ]},
  B: { teams: [
    { name: "Canadá", flag: "🇨🇦" }, { name: PLAYOFF_UEFA_A, flag: "❓", pending: true },
    { name: "Qatar", flag: "🇶🇦" }, { name: "Suiza", flag: "🇨🇭" }
  ]},
  C: { teams: [
    { name: "Brasil", flag: "🇧🇷" }, { name: "Marruecos", flag: "🇲🇦" },
    { name: "Haití", flag: "🇭🇹" }, { name: "Escocia", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" }
  ]},
  D: { teams: [
    { name: "EE.UU.", flag: "🇺🇸" }, { name: "Paraguay", flag: "🇵🇾" },
    { name: "Australia", flag: "🇦🇺" }, { name: PLAYOFF_UEFA_C, flag: "❓", pending: true }
  ]},
  E: { teams: [
    { name: "Alemania", flag: "🇩🇪" }, { name: "Curazao", flag: "🇨🇼" },
    { name: "Costa de Marfil", flag: "🇨🇮" }, { name: "Ecuador", flag: "🇪🇨" }
  ]},
  F: { teams: [
    { name: "Países Bajos", flag: "🇳🇱" }, { name: "Japón", flag: "🇯🇵" },
    { name: PLAYOFF_UEFA_B, flag: "❓", pending: true }, { name: "Túnez", flag: "🇹🇳" }
  ]},
  G: { teams: [
    { name: "Bélgica", flag: "🇧🇪" }, { name: "Egipto", flag: "🇪🇬" },
    { name: "Irán", flag: "🇮🇷" }, { name: "Nueva Zelanda", flag: "🇳🇿" }
  ]},
  H: { teams: [
    { name: "España", flag: "🇪🇸" }, { name: "Cabo Verde", flag: "🇨🇻" },
    { name: "Arabia Saudí", flag: "🇸🇦" }, { name: "Uruguay", flag: "🇺🇾" }
  ]},
  I: { teams: [
    { name: "Francia", flag: "🇫🇷" }, { name: "Senegal", flag: "🇸🇳" },
    { name: PLAYOFF_INT2, flag: "❓", pending: true }, { name: "Noruega", flag: "🇳🇴" }
  ]},
  J: { teams: [
    { name: "Argentina", flag: "🇦🇷" }, { name: "Argelia", flag: "🇩🇿" },
    { name: "Austria", flag: "🇦🇹" }, { name: "Jordania", flag: "🇯🇴" }
  ]},
  K: { teams: [
    { name: "Portugal", flag: "🇵🇹" }, { name: PLAYOFF_INT1, flag: "❓", pending: true },
    { name: "Uzbekistán", flag: "🇺🇿" }, { name: "Colombia", flag: "🇨🇴" }
  ]},
  L: { teams: [
    { name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" }, { name: "Croacia", flag: "🇭🇷" },
    { name: "Ghana", flag: "🇬🇭" }, { name: "Panamá", flag: "🇵🇦" }
  ]},
};

// ─── FIXTURE COMPLETO (hora española = ET + 6h) ──────────────────────────────
// Formato: { id, date, timeET, timeES, group, home, away, venue, matchday }
const FIXTURES = [
  // J1 ── 11 junio
  { id:1, date:"2026-06-11", timeES:"21:00", group:"A", home:"México", away:"Sudáfrica", venue:"Azteca, CDMX", matchday:1 },
  { id:2, date:"2026-06-11", timeES:"04:00+1", group:"A", home:"Corea del Sur", away:PLAYOFF_UEFA_D, venue:"Akron, Zapopan", matchday:1 },
  // J1 ── 12 junio
  { id:3, date:"2026-06-12", timeES:"19:00", group:"B", home:"Canadá", away:PLAYOFF_UEFA_A, venue:"BMO Field, Toronto", matchday:1 },
  { id:4, date:"2026-06-12", timeES:"22:00", group:"B", home:"Qatar", away:"Suiza", venue:"Levi's, Santa Clara", matchday:1 },
  { id:5, date:"2026-06-12", timeES:"01:00+1", group:"D", home:"EE.UU.", away:"Paraguay", venue:"SoFi, Inglewood", matchday:1 },
  // J1 ── 13 junio
  { id:6, date:"2026-06-13", timeES:"00:00", group:"C", home:"Brasil", away:"Marruecos", venue:"MetLife, NJ", matchday:1 },
  { id:7, date:"2026-06-13", timeES:"03:00", group:"C", home:"Haití", away:"Escocia", venue:"Gillette, Foxborough", matchday:1 },
  // J1 ── 14 junio
  { id:8, date:"2026-06-14", timeES:"07:00", group:"D", home:"Australia", away:PLAYOFF_UEFA_C, venue:"BC Place, Vancouver", matchday:1 },
  { id:9, date:"2026-06-14", timeES:"17:00", group:"E", home:"Alemania", away:"Curazao", venue:"NRG, Houston", matchday:1 },
  { id:10, date:"2026-06-14", timeES:"20:00", group:"F", home:"Países Bajos", away:"Japón", venue:"AT&T, Arlington", matchday:1 },
  { id:11, date:"2026-06-14", timeES:"23:00", group:"E", home:"Costa de Marfil", away:"Ecuador", venue:"Lincoln, Phila.", matchday:1 },
  { id:12, date:"2026-06-15", timeES:"02:00", group:"F", home:PLAYOFF_UEFA_B, away:"Túnez", venue:"BBVA, Guadalupe", matchday:1 },
  // J1 ── 15 junio
  { id:13, date:"2026-06-15", timeES:"16:00", group:"H", home:"España", away:"Cabo Verde", venue:"Mercedes-Benz, Atlanta", matchday:1 },
  { id:14, date:"2026-06-15", timeES:"19:00", group:"G", home:"Bélgica", away:"Egipto", venue:"Lumen Field, Seattle", matchday:1 },
  { id:15, date:"2026-06-15", timeES:"22:00", group:"H", home:"Arabia Saudí", away:"Uruguay", venue:"Hard Rock, Miami", matchday:1 },
  { id:16, date:"2026-06-16", timeES:"01:00", group:"G", home:"Irán", away:"Nueva Zelanda", venue:"SoFi, Inglewood", matchday:1 },
  // J1 ── 16 junio
  { id:17, date:"2026-06-16", timeES:"19:00", group:"I", home:"Francia", away:"Senegal", venue:"MetLife, NJ", matchday:1 },
  { id:18, date:"2026-06-16", timeES:"22:00", group:"I", home:PLAYOFF_INT2, away:"Noruega", venue:"Gillette, Foxborough", matchday:1 },
  { id:19, date:"2026-06-17", timeES:"01:00", group:"J", home:"Argentina", away:"Argelia", venue:"Arrowhead, KC", matchday:1 },
  // J1 ── 17 junio
  { id:20, date:"2026-06-17", timeES:"04:00", group:"J", home:"Austria", away:"Jordania", venue:"Levi's, Santa Clara", matchday:1 },
  { id:21, date:"2026-06-17", timeES:"17:00", group:"K", home:"Portugal", away:PLAYOFF_INT1, venue:"NRG, Houston", matchday:1 },
  { id:22, date:"2026-06-17", timeES:"20:00", group:"L", home:"Inglaterra", away:"Croacia", venue:"AT&T, Arlington", matchday:1 },
  { id:23, date:"2026-06-17", timeES:"23:00", group:"L", home:"Ghana", away:"Panamá", venue:"BMO Field, Toronto", matchday:1 },
  { id:24, date:"2026-06-18", timeES:"02:00", group:"K", home:"Uzbekistán", away:"Colombia", venue:"Azteca, CDMX", matchday:1 },

  // J2 ── 18 junio
  { id:25, date:"2026-06-18", timeES:"16:00", group:"A", home:"Sudáfrica", away:PLAYOFF_UEFA_D, venue:"Mercedes-Benz, Atlanta", matchday:2 },
  { id:26, date:"2026-06-18", timeES:"19:00", group:"B", home:"Suiza", away:PLAYOFF_UEFA_A, venue:"SoFi, Inglewood", matchday:2 },
  { id:27, date:"2026-06-18", timeES:"22:00", group:"B", home:"Canadá", away:"Qatar", venue:"BC Place, Vancouver", matchday:2 },
  { id:28, date:"2026-06-19", timeES:"01:00", group:"A", home:"México", away:"Corea del Sur", venue:"Akron, Zapopan", matchday:2 },
  // J2 ── 19 junio
  { id:29, date:"2026-06-19", timeES:"19:00", group:"D", home:"EE.UU.", away:"Australia", venue:"Lumen Field, Seattle", matchday:2 },
  { id:30, date:"2026-06-19", timeES:"22:00", group:"C", home:"Escocia", away:"Marruecos", venue:"Gillette, Foxborough", matchday:2 },
  { id:31, date:"2026-06-20", timeES:"01:00", group:"C", home:"Brasil", away:"Haití", venue:"Lincoln, Phila.", matchday:2 },
  // J2 ── 20 junio
  { id:32, date:"2026-06-20", timeES:"04:00", group:"D", home:"Paraguay", away:PLAYOFF_UEFA_C, venue:"Levi's, Santa Clara", matchday:2 },
  { id:33, date:"2026-06-20", timeES:"17:00", group:"E", home:"Ecuador", away:"Alemania", venue:"MetLife, NJ", matchday:2 },
  { id:34, date:"2026-06-20", timeES:"20:00", group:"F", home:"Túnez", away:"Países Bajos", venue:"Arrowhead, KC", matchday:2 },
  { id:35, date:"2026-06-21", timeES:"23:00", group:"F", home:"Japón", away:PLAYOFF_UEFA_B, venue:"AT&T, Arlington", matchday:2 },
  { id:36, date:"2026-06-21", timeES:"02:00", group:"E", home:"Curazao", away:"Costa de Marfil", venue:"Lincoln, Phila.", matchday:2 },
  // J2 ── 21 junio
  { id:37, date:"2026-06-21", timeES:"19:00", group:"H", home:"Cabo Verde", away:"Arabia Saudí", venue:"Hard Rock, Miami", matchday:2 },
  { id:38, date:"2026-06-21", timeES:"22:00", group:"G", home:"Egipto", away:"Irán", venue:"Lumen Field, Seattle", matchday:2 },
  { id:39, date:"2026-06-22", timeES:"01:00", group:"H", home:"España", away:"Uruguay", venue:"Akron, Zapopan", matchday:2 },
  { id:40, date:"2026-06-22", timeES:"04:00", group:"G", home:"Bélgica", away:"Nueva Zelanda", venue:"BC Place, Vancouver", matchday:2 },
  // J2 ── 22 junio
  { id:41, date:"2026-06-22", timeES:"19:00", group:"I", home:"Noruega", away:"Senegal", venue:"MetLife, NJ", matchday:2 },
  { id:42, date:"2026-06-22", timeES:"22:00", group:"J", home:"Jordania", away:"Argelia", venue:"Levi's, Santa Clara", matchday:2 },
  { id:43, date:"2026-06-23", timeES:"01:00", group:"I", home:"Francia", away:PLAYOFF_INT2, venue:"Mercedes-Benz, Atlanta", matchday:2 },
  { id:44, date:"2026-06-23", timeES:"04:00", group:"J", home:"Argentina", away:"Austria", venue:"AT&T, Arlington", matchday:2 },
  // J2 ── 23 junio
  { id:45, date:"2026-06-23", timeES:"17:00", group:"K", home:PLAYOFF_INT1, away:"Uzbekistán", venue:"NRG, Houston", matchday:2 },
  { id:46, date:"2026-06-23", timeES:"20:00", group:"L", home:"Croacia", away:"Ghana", venue:"Lincoln, Phila.", matchday:2 },
  { id:47, date:"2026-06-23", timeES:"23:00", group:"K", home:"Colombia", away:"Portugal", venue:"BMO Field, Toronto", matchday:2 },
  { id:48, date:"2026-06-24", timeES:"02:00", group:"L", home:"Panamá", away:"Inglaterra", venue:"MetLife, NJ", matchday:2 },

  // J3 ── todos simultáneos por grupo ─────────────────────────────
  // 24 junio
  { id:49, date:"2026-06-24", timeES:"22:00", group:"A", home:"México", away:PLAYOFF_UEFA_D, venue:"Azteca, CDMX", matchday:3 },
  { id:50, date:"2026-06-24", timeES:"22:00", group:"A", home:"Sudáfrica", away:"Corea del Sur", venue:"BBVA, Guadalupe", matchday:3 },
  // 24 junio
  { id:51, date:"2026-06-24", timeES:"19:00", group:"B", home:"Suiza", away:"Canadá", venue:"Levi's, Santa Clara", matchday:3 },
  { id:52, date:"2026-06-24", timeES:"19:00", group:"B", home:PLAYOFF_UEFA_A, away:"Qatar", venue:"Lumen Field, Seattle", matchday:3 },
  // 24 junio
  { id:53, date:"2026-06-24", timeES:"22:00", group:"C", home:"Brasil", away:"Escocia", venue:"Mercedes-Benz, Atlanta", matchday:3 },
  { id:54, date:"2026-06-24", timeES:"22:00", group:"C", home:"Marruecos", away:"Haití", venue:"Mercedes-Benz, Atlanta", matchday:3 },
  // 25 junio
  { id:55, date:"2026-06-25", timeES:"01:00", group:"D", home:"EE.UU.", away:PLAYOFF_UEFA_C, venue:"SoFi, Inglewood", matchday:3 },
  { id:56, date:"2026-06-25", timeES:"01:00", group:"D", home:"Paraguay", away:"Australia", venue:"Levi's, Santa Clara", matchday:3 },
  // 25 junio
  { id:57, date:"2026-06-25", timeES:"20:00", group:"E", home:"Alemania", away:"Costa de Marfil", venue:"NRG, Houston", matchday:3 },
  { id:58, date:"2026-06-25", timeES:"20:00", group:"E", home:"Ecuador", away:"Curazao", venue:"MetLife, NJ", matchday:3 },
  // 25 junio
  { id:59, date:"2026-06-25", timeES:"23:00", group:"F", home:"Japón", away:"Túnez", venue:"BBVA, Guadalupe", matchday:3 },
  { id:60, date:"2026-06-25", timeES:"23:00", group:"F", home:"Países Bajos", away:PLAYOFF_UEFA_B, venue:"Arrowhead, KC", matchday:3 },
  // 26 junio
  { id:61, date:"2026-06-26", timeES:"20:00", group:"G", home:"Bélgica", away:"Irán", venue:"SoFi, Inglewood", matchday:3 },
  { id:62, date:"2026-06-26", timeES:"20:00", group:"G", home:"Nueva Zelanda", away:"Egipto", venue:"Lumen Field, Seattle", matchday:3 },
  // 26 junio
  { id:63, date:"2026-06-26", timeES:"23:00", group:"H", home:"España", away:"Arabia Saudí", venue:"Hard Rock, Miami", matchday:3 },
  { id:64, date:"2026-06-26", timeES:"23:00", group:"H", home:"Uruguay", away:"Cabo Verde", venue:"Akron, Zapopan", matchday:3 },
  // 26 junio
  { id:65, date:"2026-06-26", timeES:"20:00", group:"I", home:"Francia", away:"Noruega", venue:"Arrowhead, KC", matchday:3 },
  { id:66, date:"2026-06-26", timeES:"20:00", group:"I", home:"Senegal", away:PLAYOFF_INT2, venue:"Gillette, Foxborough", matchday:3 },
  // 27 junio
  { id:67, date:"2026-06-27", timeES:"01:00", group:"J", home:"Argentina", away:"Jordania", venue:"AT&T, Arlington", matchday:3 },
  { id:68, date:"2026-06-27", timeES:"01:00", group:"J", home:"Argelia", away:"Austria", venue:"Levi's, Santa Clara", matchday:3 },
  // 27 junio
  { id:69, date:"2026-06-27", timeES:"22:00", group:"K", home:"Colombia", away:PLAYOFF_INT1, venue:"Akron, Zapopan", matchday:3 },
  { id:70, date:"2026-06-27", timeES:"22:00", group:"K", home:"Portugal", away:"Uzbekistán", venue:"NRG, Houston", matchday:3 },
  // 27 junio
  { id:71, date:"2026-06-27", timeES:"22:00", group:"L", home:"Croacia", away:"Panamá", venue:"Lincoln, Phila.", matchday:3 },
  { id:72, date:"2026-06-27", timeES:"22:00", group:"L", home:"Inglaterra", away:"Ghana", venue:"BMO Field, Toronto", matchday:3 },
];

// ─── UTILIDADES ─────────────────────────────────────────────────────────────
function getStandings(teamsList, matches) {
  const t = {};
  teamsList.forEach(tm => { t[tm.name] = { ...tm, pts: 0, gf: 0, ga: 0, mp: 0 }; });
  matches.forEach(m => {
    if (m.homeScore === "" || m.awayScore === "") return;
    const h = +m.homeScore, a = +m.awayScore;
    t[m.home].mp++; t[m.away].mp++;
    t[m.home].gf += h; t[m.home].ga += a;
    t[m.away].gf += a; t[m.away].ga += h;
    if (h > a) { t[m.home].pts += 3; }
    else if (h < a) { t[m.away].pts += 3; }
    else { t[m.home].pts += 1; t[m.away].pts += 1; }
  });
  return Object.values(t).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf);
}

function get1X2(h, a) { return h > a ? "1" : h < a ? "2" : "X"; }

function scoreMatch(rh, ra, ph, pa) {
  const hit1x2 = get1X2(rh, ra) === get1X2(ph, pa);
  const hitDiff = (rh - ra) === (ph - pa);
  const hitExact = rh === ph && ra === pa;
  let pts = 0;
  if (hit1x2) { pts += 4; if (hitDiff) { pts += 2; if (hitExact) pts += 4; } }
  return { pts, hit1x2, hitDiff, hitExact };
}

const PLAYER_COLORS = [
  { bg: "#7b2fff", light: "rgba(123,47,255,.15)", text: "#b388ff" },
  { bg: "#f5c842", light: "rgba(245,200,66,.15)", text: "#f5c842" },
  { bg: "#06d6a0", light: "rgba(6,214,160,.15)", text: "#06d6a0" },
  { bg: "#ff6b6b", light: "rgba(255,107,107,.15)", text: "#ff8888" },
  { bg: "#4cc9f0", light: "rgba(76,201,240,.15)", text: "#4cc9f0" },
  { bg: "#ff9f43", light: "rgba(255,159,67,.15)", text: "#ff9f43" },
];

const MATCHDAY_LABEL = { 1: "Jornada 1", 2: "Jornada 2", 3: "Jornada 3 · Simultáneos" };

// ─── STYLES ──────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=DM+Sans:wght@300;400;500;700;800&family=Space+Mono:wght@400;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
  body{background:#080811;font-family:'DM Sans',sans-serif;color:#f0f0f8}
  input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}
  input[type=number]{-moz-appearance:textfield}
  ::-webkit-scrollbar{display:none}
  .fade-in{animation:fadeIn .3s ease}
  @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
`;

// ─── COMPONENTES ATÓMICOS ────────────────────────────────────────────────────
const ScoreInput = ({ value, onChange, color }) => (
  <input
    type="number" min="0" max="99" value={value}
    onChange={e => onChange(e.target.value)}
    style={{
      width: 38, height: 38, background: "#0a0a14",
      border: `1.5px solid ${color || "#2a2a40"}`, borderRadius: 7,
      color: "#f0f0f8", fontFamily: "'Space Mono',monospace",
      fontSize: 17, fontWeight: 700, textAlign: "center", outline: "none",
    }}
  />
);

function MatchRow({ match, resultData, onResultChange, predictions, players, activePlayerIdx, onPredChange, mode }) {
  const rh = resultData?.homeScore ?? "";
  const ra = resultData?.awayScore ?? "";
  const isPending = match.home.includes("*") || match.away.includes("*");

  return (
    <div style={{
      background: "#0f0f1c", border: "1px solid #1a1a2a", borderRadius: 10,
      padding: "10px 12px", marginBottom: 8,
    }}>
      {/* Header partido */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 10, color: "#4040a0", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
          Gr.{match.group} · {match.date.slice(5).replace("-","/")} {match.timeES}h
        </span>
        <span style={{ fontSize: 10, color: "#4040a0" }}>{match.venue}</span>
      </div>

      {/* Teams + score */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 19 }}>{GROUPS_DATA[match.group].teams.find(t => t.name === match.home)?.flag || "❓"}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: isPending ? "#5050a0" : "#f0f0f8" }}>{match.home}</span>
        </div>

        {mode === "results" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <ScoreInput value={rh} onChange={v => onResultChange("homeScore", v)} />
            <span style={{ color: "#2a2a40", fontWeight: 800, fontSize: 14 }}>–</span>
            <ScoreInput value={ra} onChange={v => onResultChange("awayScore", v)} />
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {/* Resultado real */}
            <div style={{ textAlign: "center", minWidth: 54 }}>
              <div style={{ fontSize: 9, color: "#3a3a60", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>Real</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 15, fontWeight: 700, color: rh !== "" ? "#f5c842" : "#2a2a40" }}>
                {rh !== "" ? `${rh}–${ra}` : "–"}
              </div>
            </div>
            {/* Predicción del jugador activo */}
            {mode === "predictions" && (
              <div>
                <div style={{ fontSize: 9, color: PLAYER_COLORS[activePlayerIdx % 6].text, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2, textAlign: "center" }}>
                  Pred.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <ScoreInput
                    value={predictions[activePlayerIdx]?.[match.id]?.h ?? ""}
                    onChange={v => onPredChange(match.id, "h", v)}
                    color={PLAYER_COLORS[activePlayerIdx % 6].bg}
                  />
                  <span style={{ color: "#2a2a40" }}>–</span>
                  <ScoreInput
                    value={predictions[activePlayerIdx]?.[match.id]?.a ?? ""}
                    onChange={v => onPredChange(match.id, "a", v)}
                    color={PLAYER_COLORS[activePlayerIdx % 6].bg}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: isPending ? "#5050a0" : "#f0f0f8", textAlign: "right" }}>{match.away}</span>
          <span style={{ fontSize: 19 }}>{GROUPS_DATA[match.group].teams.find(t => t.name === match.away)?.flag || "❓"}</span>
        </div>
      </div>

      {/* Scores comparison strip (marcador tab) */}
      {mode === "scoreboard" && rh !== "" && (
        <div style={{ marginTop: 8, borderTop: "1px solid #1a1a2a", paddingTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
          {players.map((pl, idx) => {
            const pred = predictions[idx]?.[match.id];
            if (!pred || pred.h === "" || pred.h === undefined) return null;
            const { pts, hitExact, hitDiff, hit1x2 } = scoreMatch(+rh, +ra, +pred.h, +pred.a);
            const color = PLAYER_COLORS[idx % 6];
            return (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 4, background: color.light, border: `1px solid ${color.bg}`, borderRadius: 6, padding: "2px 7px", fontSize: 11 }}>
                <span style={{ color: color.text, fontWeight: 700 }}>{pl.name.slice(0, 8)}</span>
                <span style={{ fontFamily: "'Space Mono',monospace", color: color.text }}>{pred.h}–{pred.a}</span>
                {pts > 0 && <span style={{ background: color.bg, color: "#fff", borderRadius: 4, padding: "1px 5px", fontWeight: 800, fontSize: 10 }}>+{pts}</span>}
                {pts === 0 && <span style={{ color: "#3a3a60", fontSize: 10 }}>✗</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("grupos");
  const [players, setPlayers] = useState([
    { name: "Jugador 1" }, { name: "Jugador 2" }
  ]);
  const [activePlayerIdx, setActivePlayerIdx] = useState(0);
  const [results, setResults] = useState({}); // { matchId: { homeScore, awayScore } }
  const [predictions, setPredictions] = useState([]); // [ { matchId: {h,a} }, ... ]
  const [expandedGroups, setExpandedGroups] = useState({});
  const [filterGroup, setFilterGroup] = useState("ALL");
  const [filterMatchday, setFilterMatchday] = useState("ALL");

  // Inicializar predicciones cuando hay jugadores
  const initPreds = (count) => Array(count).fill(null).map(() => ({}));

  // Add player
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

  // Results
  const setResult = (matchId, key, val) => {
    setResults(prev => ({ ...prev, [matchId]: { ...prev[matchId], [key]: val } }));
  };

  // Predictions
  const setPred = (playerIdx, matchId, key, val) => {
    setPredictions(prev => {
      const n = [...prev];
      if (!n[playerIdx]) n[playerIdx] = {};
      n[playerIdx] = { ...n[playerIdx], [matchId]: { ...n[playerIdx][matchId], [key]: val } };
      return n;
    });
  };

  // Calcular puntos por jugador
  const scores = useMemo(() => {
    return players.map((_, pidx) => {
      let total = 0;
      let detail = [];
      FIXTURES.forEach(m => {
        const r = results[m.id];
        const p = predictions[pidx]?.[m.id];
        if (!r || r.homeScore === "" || r.awayScore === "" || !p || p.h === "" || p.h === undefined) return;
        const { pts, hit1x2, hitDiff, hitExact } = scoreMatch(+r.homeScore, +r.awayScore, +p.h, +p.a);
        total += pts;
        if (pts > 0) detail.push({ m, pts, hit1x2, hitDiff, hitExact });
      });
      return { total, detail };
    });
  }, [results, predictions, players]);

  // Clasificación de cada grupo
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

  // Filtered fixtures
  const filteredFixtures = useMemo(() => {
    return FIXTURES.filter(f => {
      if (filterGroup !== "ALL" && f.group !== filterGroup) return false;
      if (filterMatchday !== "ALL" && String(f.matchday) !== filterMatchday) return false;
      return true;
    });
  }, [filterGroup, filterMatchday]);

  const TABS = [
    { id: "setup", emoji: "⚙️", label: "Setup" },
    { id: "calendario", emoji: "📅", label: "Calendario" },
    { id: "grupos", emoji: "📊", label: "Grupos" },
    { id: "pronosticos", emoji: "🔮", label: "Pronóst." },
    { id: "marcador", emoji: "🏆", label: "Puntos" },
  ];

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
            borderBottom: tab === t.id ? "3px solid #f5c842" : "3px solid transparent",
            color: tab === t.id ? "#f5c842" : "#4040a0",
            background: "none", border: "none", borderBottom: tab === t.id ? "3px solid #f5c842" : "3px solid transparent",
            whiteSpace: "nowrap",
          }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </nav>

      {/* ══════════════════════════════════════════════ SETUP */}
      {tab === "setup" && (
        <div style={{ padding: 16 }} className="fade-in">
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
        </div>
      )}

      {/* ══════════════════════════════════════════════ CALENDARIO */}
      {tab === "calendario" && (
        <div style={{ padding: 16 }} className="fade-in">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 24, letterSpacing: 2 }}>Calendario Oficial</div>
            <div style={{ fontSize: 11, color: "#4040a0", fontWeight: 700 }}>Hora española (CET+1)</div>
          </div>

          {/* Filtros */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto", paddingBottom: 4 }}>
            <FilterChip label="Todos" active={filterGroup === "ALL"} onClick={() => setFilterGroup("ALL")} />
            {Object.keys(GROUPS_DATA).map(g => (
              <FilterChip key={g} label={`Gr.${g}`} active={filterGroup === g} onClick={() => setFilterGroup(g)} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
            {["ALL", "1", "2", "3"].map(md => (
              <FilterChip key={md} label={md === "ALL" ? "Todas jornadas" : `Jornada ${md}`} active={filterMatchday === md} onClick={() => setFilterMatchday(md)} />
            ))}
          </div>

          {/* Agrupar por jornada */}
          {[1, 2, 3].filter(md => filterMatchday === "ALL" || String(md) === filterMatchday).map(md => {
            const dayFixtures = filteredFixtures.filter(f => f.matchday === md);
            if (!dayFixtures.length) return null;
            return (
              <div key={md}>
                <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 16, letterSpacing: 2, color: md === 3 ? "#f5c842" : "#4cc9f0", padding: "10px 0 6px", borderBottom: "1px solid #1a1a2a", marginBottom: 10, textAlign: "center" }}>
                  {MATCHDAY_LABEL[md]}
                </div>
                {dayFixtures.map(m => (
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
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════ GRUPOS */}
      {tab === "grupos" && (
        <div style={{ padding: 16 }} className="fade-in">
          <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 24, letterSpacing: 2, marginBottom: 14 }}>Clasificaciones</div>
          {Object.keys(GROUPS_DATA).map(g => {
            const open = expandedGroups[g];
            const st = standings[g];
            return (
              <div key={g} style={{ background: "#111120", border: "1px solid #1a1a2a", borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "linear-gradient(90deg,rgba(123,47,255,.1),transparent)", cursor: "pointer" }}
                  onClick={() => setExpandedGroups(prev => ({ ...prev, [g]: !open }))}>
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
                    {/* Partidos del grupo */}
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
      )}

      {/* ══════════════════════════════════════════════ PRONÓSTICOS */}
      {tab === "pronosticos" && (
        <div style={{ padding: 16 }} className="fade-in">
          {/* Toggle jugadores */}
          <div style={{ display: "flex", background: "#111120", borderRadius: 40, padding: 4, marginBottom: 14, border: "1px solid #1a1a2a", overflowX: "auto", gap: 2 }}>
            {players.map((pl, idx) => {
              const color = PLAYER_COLORS[idx % 6];
              const active = activePlayerIdx === idx;
              return (
                <button key={idx} onClick={() => setActivePlayerIdx(idx)} style={{
                  flex: "0 0 auto", padding: "8px 14px", borderRadius: 36, fontSize: 12, fontWeight: 800,
                  cursor: "pointer", border: "none", whiteSpace: "nowrap",
                  background: active ? color.bg : "transparent",
                  color: active ? (idx === 1 ? "#080811" : "#fff") : "#4040a0",
                }}>
                  {pl.name}
                </button>
              );
            })}
          </div>

          <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 20, letterSpacing: 2, marginBottom: 4 }}>
            Pronóst. · <span style={{ color: PLAYER_COLORS[activePlayerIdx % 6].text }}>{players[activePlayerIdx]?.name}</span>
          </div>
          <div style={{ fontSize: 11, color: "#4040a0", marginBottom: 14 }}>Introduce tu predicción para cada partido</div>

          {/* Filtros grupo */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto", paddingBottom: 4 }}>
            <FilterChip label="Todos" active={filterGroup === "ALL"} onClick={() => setFilterGroup("ALL")} />
            {Object.keys(GROUPS_DATA).map(g => (
              <FilterChip key={g} label={`Gr.${g}`} active={filterGroup === g} onClick={() => setFilterGroup(g)} />
            ))}
          </div>

          {filteredFixtures.map(m => (
            <MatchRow key={m.id} match={m}
              resultData={results[m.id]}
              onResultChange={(key, val) => setResult(m.id, key, val)}
              predictions={predictions} players={players}
              activePlayerIdx={activePlayerIdx}
              onPredChange={(matchId, key, val) => setPred(activePlayerIdx, matchId, key, val)}
              mode="predictions"
            />
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════ MARCADOR */}
      {tab === "marcador" && (
        <div style={{ padding: 16 }} className="fade-in">
          {/* Scoreboard */}
          <div style={{ background: "linear-gradient(135deg,#111120,#1a0830)", border: "1px solid #7b2fff", borderRadius: 16, padding: "22px 16px", marginBottom: 16 }}>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 22, letterSpacing: 3, color: "#f5c842", textAlign: "center", marginBottom: 18 }}>
              MARCADOR MISTERPORRA
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
              {players.map((pl, idx) => {
                const color = PLAYER_COLORS[idx % 6];
                const sc = scores[idx]?.total ?? 0;
                return (
                  <div key={idx} style={{ textAlign: "center", minWidth: 90 }}>
                    <div style={{ fontSize: 11, color: "#5060a0", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{pl.name}</div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 42, fontWeight: 700, lineHeight: 1, color: color.text }}>{sc}</div>
                    <div style={{ fontSize: 10, color: "#4040a0", marginTop: 2 }}>pts</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ranking */}
          {[...players.map((pl, i) => ({ pl, i, sc: scores[i] }))]
            .sort((a, b) => (b.sc?.total ?? 0) - (a.sc?.total ?? 0))
            .map(({ pl, i, sc }, rank) => {
              const color = PLAYER_COLORS[i % 6];
              return (
                <div key={i} style={{ background: "#111120", border: `1px solid ${rank === 0 ? "#f5c842" : "#1a1a2a"}`, borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: rank === 0 ? "rgba(245,200,66,.2)" : "#0f0f1c", border: `2px solid ${rank === 0 ? "#f5c842" : color.bg}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Mono',monospace", fontWeight: 800, fontSize: 14, color: rank === 0 ? "#f5c842" : color.text, flexShrink: 0 }}>
                      {rank + 1}
                    </div>
                    <div style={{ fontWeight: 700, flex: 1 }}>{pl.name}</div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 24, fontWeight: 700, color: color.text }}>{sc?.total ?? 0}</div>
                  </div>
                  {/* Barra de progreso */}
                  <div style={{ padding: "0 14px 12px" }}>
                    <div style={{ height: 5, background: "#0f0f1c", borderRadius: 5, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min(100, ((sc?.total ?? 0) / 817) * 100)}%`, background: color.bg, borderRadius: 5, transition: "width .6s" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#4040a0", marginTop: 4 }}>
                      <span>{sc?.detail?.length ?? 0} aciertos</span>
                      <span>{sc?.total ?? 0} / 817 pts máx.</span>
                    </div>
                  </div>
                  {/* Detalle de aciertos */}
                  {sc?.detail?.length > 0 && (
                    <div style={{ borderTop: "1px solid #1a1a2a", padding: "8px 14px" }}>
                      <div style={{ fontSize: 10, color: "#4040a0", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Aciertos destacados</div>
                      {sc.detail.slice(-5).reverse().map((d, j) => (
                        <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, padding: "4px 0", borderBottom: "1px solid #13131f" }}>
                          <span style={{ color: "#8080b0" }}>
                            {GROUPS_DATA[d.m.group].teams.find(t => t.name === d.m.home)?.flag} {d.m.home} vs {d.m.away} {GROUPS_DATA[d.m.group].teams.find(t => t.name === d.m.away)?.flag}
                          </span>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <span style={{ fontSize: 10, color: "#06d6a0" }}>
                              {d.hitExact ? "⬥ Exacto" : d.hitDiff ? "◈ Dif." : "◇ 1X2"}
                            </span>
                            <span style={{ background: color.bg, color: "#fff", borderRadius: 5, padding: "2px 7px", fontFamily: "'Space Mono',monospace", fontWeight: 800, fontSize: 11 }}>+{d.pts}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

          {/* Ver partidos con puntuación */}
          <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 18, letterSpacing: 2, color: "#4cc9f0", margin: "16px 0 10px" }}>Detalle por partido</div>
          {FIXTURES.filter(f => results[f.id]?.homeScore !== undefined && results[f.id]?.homeScore !== "").map(m => (
            <MatchRow key={m.id} match={m}
              resultData={results[m.id]}
              onResultChange={() => {}}
              predictions={predictions} players={players}
              activePlayerIdx={activePlayerIdx}
              onPredChange={() => {}}
              mode="scoreboard"
            />
          ))}
          {Object.keys(results).length === 0 && (
            <div style={{ textAlign: "center", color: "#4040a0", fontSize: 13, padding: 30 }}>
              Introduce resultados en el Calendario o en Grupos para ver los puntos aquí.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: "0 0 auto", padding: "6px 12px", borderRadius: 40, fontSize: 11, fontWeight: 800,
      letterSpacing: .5, textTransform: "uppercase", cursor: "pointer",
      border: `1px solid ${active ? "#7b2fff" : "#1a1a2a"}`,
      background: active ? "#7b2fff" : "transparent",
      color: active ? "#fff" : "#5060a0",
    }}>
      {label}
    </button>
  );
}
