import { useState, useEffect } from "react";
import { css } from "../styles/global";

const FDO_KEY = import.meta.env.VITE_FOOTBALL_DATA_KEY;
const FDO_BASE = "https://api.football-data.org/v4";

// Cache en localStorage: resultados de jornadas terminadas no cambian nunca
const CACHE_VERSION = "v1";
function cacheKey(type, code, season, matchday) {
  return `liga_${CACHE_VERSION}_${type}_${code}_${season}${matchday != null ? `_j${matchday}` : ""}`;
}
function cacheGet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
function cacheSet(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

async function fdoFetch(path, lsKey, isPermanent) {
  // Permanent = jornada ya terminada, cache para siempre
  // No permanent = jornada en curso o standings, cache 1 hora
  if (lsKey) {
    const cached = cacheGet(lsKey);
    if (cached) {
      const age = Date.now() - (cached._ts ?? 0);
      if (isPermanent || age < 3600_000) return cached.data;
    }
  }
  const r = await fetch(`${FDO_BASE}${path}`, {
    headers: { "X-Auth-Token": FDO_KEY ?? "" },
  });
  if (!r.ok) throw new Error(`API error ${r.status}`);
  const data = await r.json();
  if (lsKey) cacheSet(lsKey, { data, _ts: Date.now() });
  return data;
}

const LEAGUES = [
  { code: "PD",  name: "La Liga",        country: "🇪🇸", season: 2025 },
  { code: "PL",  name: "Premier League", country: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", season: 2025 },
  { code: "BL1", name: "Bundesliga",     country: "🇩🇪", season: 2025 },
  { code: "SA",  name: "Serie A",        country: "🇮🇹", season: 2025 },
  { code: "FL1", name: "Ligue 1",        country: "🇫🇷", season: 2025 },
  { code: "DED", name: "Eredivisie",     country: "🇳🇱", season: 2025 },
];

function FormBadge({ result }) {
  const config = {
    W: { bg: "#16a34a", label: "G" },
    D: { bg: "#a16207", label: "E" },
    L: { bg: "#dc2626", label: "P" },
  };
  const c = config[result] ?? { bg: "#333", label: result };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 17, height: 17, borderRadius: 3,
      background: c.bg, color: "#fff",
      fontSize: 9, fontWeight: 800, marginRight: 2,
    }}>
      {c.label}
    </span>
  );
}

function StandingsTable({ table }) {
  const n = table.length;
  function borderColor(pos) {
    if (pos <= 4)        return "#3b82f6"; // Champions League
    if (pos === 5)       return "#f97316"; // Europa League
    if (pos === 6)       return "#22c55e"; // Conference League
    if (pos >= n - 2)    return "#ef4444"; // Descenso
    return "transparent";
  }

  return (
    <div>
      {/* Leyenda */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", padding: "8px 16px 4px", fontSize: 10, color: "#6060a0" }}>
        {[["#3b82f6","Champions"], ["#f97316","Europa League"], ["#22c55e","Conference"], ["#ef4444","Descenso"]].map(([c, l]) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: "inline-block" }} />
            {l}
          </span>
        ))}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ color: "#4040a0", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", borderBottom: "1px solid #1a1a2a" }}>
              <th style={{ padding: "6px 8px", textAlign: "center", width: 28 }}>#</th>
              <th style={{ padding: "6px 8px", textAlign: "left", minWidth: 130 }}>Equipo</th>
              <th style={{ padding: "6px 4px", textAlign: "center" }}>PJ</th>
              <th style={{ padding: "6px 4px", textAlign: "center" }}>G</th>
              <th style={{ padding: "6px 4px", textAlign: "center" }}>E</th>
              <th style={{ padding: "6px 4px", textAlign: "center" }}>P</th>
              <th style={{ padding: "6px 4px", textAlign: "center" }}>GF</th>
              <th style={{ padding: "6px 4px", textAlign: "center" }}>GC</th>
              <th style={{ padding: "6px 4px", textAlign: "center" }}>Dif</th>
              <th style={{ padding: "6px 8px", textAlign: "center", color: "#f5c842" }}>Pts</th>
              <th style={{ padding: "6px 8px", textAlign: "center" }}>Forma</th>
            </tr>
          </thead>
          <tbody>
            {table.map(row => {
              const bc = borderColor(row.position);
              const diff = row.goalDifference;
              return (
                <tr key={row.team.id} style={{ borderBottom: "1px solid #111120", borderLeft: `3px solid ${bc}` }}>
                  <td style={{ padding: "9px 8px", textAlign: "center", color: "#6060a0", fontSize: 11 }}>{row.position}</td>
                  <td style={{ padding: "9px 8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {row.team.crest
                        ? <img src={row.team.crest} alt="" width={20} height={20} style={{ objectFit: "contain", flexShrink: 0 }} />
                        : <span style={{ width: 20 }} />
                      }
                      <span style={{ color: "#f0f0f8", fontWeight: 500, whiteSpace: "nowrap" }}>
                        {row.team.shortName ?? row.team.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "9px 4px", textAlign: "center", color: "#8080c0" }}>{row.playedGames}</td>
                  <td style={{ padding: "9px 4px", textAlign: "center", color: "#8080c0" }}>{row.won}</td>
                  <td style={{ padding: "9px 4px", textAlign: "center", color: "#8080c0" }}>{row.draw}</td>
                  <td style={{ padding: "9px 4px", textAlign: "center", color: "#8080c0" }}>{row.lost}</td>
                  <td style={{ padding: "9px 4px", textAlign: "center", color: "#8080c0" }}>{row.goalsFor}</td>
                  <td style={{ padding: "9px 4px", textAlign: "center", color: "#8080c0" }}>{row.goalsAgainst}</td>
                  <td style={{ padding: "9px 4px", textAlign: "center", color: diff > 0 ? "#22c55e" : diff < 0 ? "#ef4444" : "#8080c0", fontWeight: diff !== 0 ? 700 : 400 }}>
                    {diff > 0 ? "+" : ""}{diff}
                  </td>
                  <td style={{ padding: "9px 8px", textAlign: "center", color: "#f5c842", fontWeight: 800, fontSize: 14 }}>{row.points}</td>
                  <td style={{ padding: "9px 8px", textAlign: "center", whiteSpace: "nowrap" }}>
                    {(row.form ?? "").split(",").filter(Boolean).map((f, i) => <FormBadge key={i} result={f} />)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MatchRow({ match }) {
  const hs = match.score.fullTime.home;
  const as = match.score.fullTime.away;
  const home = match.homeTeam.shortName ?? match.homeTeam.name;
  const away = match.awayTeam.shortName ?? match.awayTeam.name;
  const date = new Date(match.utcDate).toLocaleDateString("es-ES", { weekday: "short", day: "2-digit", month: "short" });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 1fr", alignItems: "center", padding: "10px 12px", borderBottom: "1px solid #111120", gap: 4 }}>
      {/* Local */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
        <span style={{ fontSize: 13, color: hs > as ? "#f0f0f8" : "#6060a0", fontWeight: hs > as ? 700 : 400, textAlign: "right" }}>{home}</span>
        {match.homeTeam.crest && <img src={match.homeTeam.crest} alt="" width={22} height={22} style={{ objectFit: "contain", flexShrink: 0 }} />}
      </div>
      {/* Marcador */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#f5c842", letterSpacing: 3 }}>{hs} – {as}</div>
        <div style={{ fontSize: 10, color: "#4040a0", marginTop: 2 }}>{date}</div>
      </div>
      {/* Visitante */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {match.awayTeam.crest && <img src={match.awayTeam.crest} alt="" width={22} height={22} style={{ objectFit: "contain", flexShrink: 0 }} />}
        <span style={{ fontSize: 13, color: as > hs ? "#f0f0f8" : "#6060a0", fontWeight: as > hs ? 700 : 400 }}>{away}</span>
      </div>
    </div>
  );
}

export function LigaTab({ onBack }) {
  const [leagueCode, setLeagueCode]       = useState("PD");
  const [section, setSection]             = useState("results");
  const [standingsData, setStandingsData] = useState(null);
  const [matchesData, setMatchesData]     = useState(null);
  const [selectedMatchday, setSelectedMatchday] = useState(null);
  const [maxMatchday, setMaxMatchday]     = useState(38);
  const [loadingS, setLoadingS]           = useState(false);
  const [loadingM, setLoadingM]           = useState(false);
  const [errorS, setErrorS]               = useState(null);
  const [errorM, setErrorM]               = useState(null);

  const league = LEAGUES.find(l => l.code === leagueCode);

  if (!FDO_KEY) {
    return (
      <div style={{ background: "#080811", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
        <style>{css}</style>
        <div style={{ fontSize: 40 }}>⚠️</div>
        <div style={{ color: "#ef4444", fontSize: 13, textAlign: "center", maxWidth: 340 }}>
          Falta la variable <code>VITE_FOOTBALL_DATA_KEY</code>.<br />
          Añádela en Cloudflare Pages → Settings → Environment variables con el mismo valor que <code>FOOTBALL_DATA_KEY</code>.
        </div>
        <button onClick={onBack} style={{ marginTop: 8, background: "none", border: "1px solid #1a1a2a", color: "#f0f0f8", borderRadius: 8, padding: "8px 20px", cursor: "pointer" }}>← Volver</button>
      </div>
    );
  }

  // Fetch standings + currentMatchday al cambiar de liga
  useEffect(() => {
    if (!league) return;
    setLoadingS(true);
    setStandingsData(null);
    setErrorS(null);
    setMatchesData(null);
    // Standings: cache 1 hora (cambia tras cada jornada)
    const key = cacheKey("standings", league.code, league.season);
    fdoFetch(`/competitions/${league.code}/standings?season=${league.season}`, key, false)
      .then(d => {
        setStandingsData(d);
        const cm = d.season?.currentMatchday;
        if (cm) {
          setSelectedMatchday(cm);
          setMaxMatchday(cm);
        } else {
          setSelectedMatchday(1);
        }
      })
      .catch(e => setErrorS(e.message))
      .finally(() => setLoadingS(false));
  }, [leagueCode]);

  // Fetch partidos al cambiar jornada
  useEffect(() => {
    if (!selectedMatchday || !league) return;
    setLoadingM(true);
    setMatchesData(null);
    setErrorM(null);
    // Jornadas anteriores a la actual: cache permanente (resultados no cambian)
    const isPermanent = selectedMatchday < maxMatchday;
    const key = cacheKey("matches", league.code, league.season, selectedMatchday);
    fdoFetch(`/competitions/${league.code}/matches?season=${league.season}&matchday=${selectedMatchday}`, key, isPermanent)
      .then(d => setMatchesData(d))
      .catch(e => setErrorM(e.message))
      .finally(() => setLoadingM(false));
  }, [selectedMatchday, leagueCode]);

  const table   = standingsData?.standings?.find(s => s.type === "TOTAL")?.table ?? [];
  const matches = (matchesData?.matches ?? []).filter(m => m.status === "FINISHED");

  return (
    <div style={{ background: "#080811", minHeight: "100vh", color: "#f0f0f8", paddingBottom: 80 }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ background: "#0c0c18", borderBottom: "1px solid #1a1a2a", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: "none", border: "1px solid #1a1a2a", color: "#f0f0f8", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>‹</button>
        <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 20, letterSpacing: 3, color: "#f5c842" }}>⚽ LIGA</div>
        <div style={{ marginLeft: "auto", fontSize: 11, color: "#4040a0" }}>
          {standingsData?.competition?.name
            ? `${standingsData.competition.name} ${league?.season}/${String(Number(league?.season)+1).slice(2)}`
            : ""}
        </div>
      </div>

      {/* Selector de liga */}
      <div style={{ padding: "12px 16px 4px", overflowX: "auto", display: "flex", gap: 8 }}>
        {LEAGUES.map(l => (
          <button key={l.code} onClick={() => { setLeagueCode(l.code); setSection("standings"); }} style={{
            flexShrink: 0, padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: leagueCode === l.code ? 800 : 400,
            background: leagueCode === l.code ? "#f5c842" : "#111120",
            color: leagueCode === l.code ? "#080811" : "#8080c0",
            border: "1px solid " + (leagueCode === l.code ? "#f5c842" : "#1a1a2a"),
            cursor: "pointer",
          }}>
            {l.country} {l.name}
          </button>
        ))}
      </div>

      {/* Pestañas sección */}
      <div style={{ display: "flex", background: "#0c0c18", borderBottom: "1px solid #1a1a2a", marginTop: 8 }}>
        {[["standings", "📊 Clasificación"], ["results", "📅 Resultados"]].map(([id, label]) => (
          <button key={id} onClick={() => setSection(id)} style={{
            flex: 1, padding: "11px 0", fontSize: 12, fontWeight: 800, letterSpacing: 1,
            textTransform: "uppercase", cursor: "pointer",
            background: "none", border: "none",
            borderBottom: section === id ? "3px solid #f5c842" : "3px solid transparent",
            color: section === id ? "#f5c842" : "#4040a0",
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* CLASIFICACIÓN */}
      {section === "standings" && (
        <div className="fade-in">
          {loadingS && <div style={{ textAlign: "center", color: "#4040a0", padding: 48, fontSize: 13 }}>Cargando clasificación…</div>}
          {errorS  && <div style={{ textAlign: "center", color: "#ef4444",  padding: 48, fontSize: 13 }}>{errorS}</div>}
          {!loadingS && !errorS && table.length > 0 && (
            <div style={{ background: "#0d0d1e", margin: 12, borderRadius: 12, border: "1px solid #1a1a2a", overflow: "hidden" }}>
              <StandingsTable table={table} />
            </div>
          )}
        </div>
      )}

      {/* RESULTADOS */}
      {section === "results" && (
        <div className="fade-in">
          {/* Navegador de jornada */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, padding: "12px 16px", background: "#0c0c18", borderBottom: "1px solid #1a1a2a" }}>
            <button
              onClick={() => setSelectedMatchday(d => Math.max(1, d - 1))}
              disabled={selectedMatchday <= 1}
              style={{ background: "none", border: "1px solid #1a1a2a", color: "#f0f0f8", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 18, opacity: selectedMatchday <= 1 ? 0.3 : 1 }}>‹</button>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 17, letterSpacing: 3, color: "#f5c842", minWidth: 130, textAlign: "center" }}>
              JORNADA {selectedMatchday ?? "—"}
            </div>
            <button
              onClick={() => setSelectedMatchday(d => Math.min(maxMatchday, d + 1))}
              disabled={selectedMatchday >= maxMatchday}
              style={{ background: "none", border: "1px solid #1a1a2a", color: "#f0f0f8", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 18, opacity: selectedMatchday >= maxMatchday ? 0.3 : 1 }}>›</button>
          </div>

          <div style={{ background: "#0d0d1e", margin: 12, borderRadius: 12, border: "1px solid #1a1a2a", overflow: "hidden" }}>
            {loadingM && <div style={{ textAlign: "center", color: "#4040a0", padding: 40, fontSize: 13 }}>Cargando partidos…</div>}
            {errorM   && <div style={{ textAlign: "center", color: "#ef4444",  padding: 40, fontSize: 13 }}>{errorM}</div>}
            {!loadingM && !errorM && matches.length === 0 && (
              <div style={{ textAlign: "center", color: "#4040a0", padding: 40, fontSize: 13 }}>Sin resultados para esta jornada</div>
            )}
            {matches.map(m => <MatchRow key={m.id} match={m} />)}
          </div>
        </div>
      )}
    </div>
  );
}
