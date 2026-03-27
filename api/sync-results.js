// api/sync-results.js — Proxy puro hacia API-Football
// Devuelve los resultados con nombres en español; el frontend hace el matching contra sus fixtures.

const TEAM_MAP = {
  "Germany": "Alemania", "Scotland": "Escocia", "Hungary": "Hungría",
  "Switzerland": "Suiza", "Spain": "España", "Croatia": "Croacia",
  "Italy": "Italia", "Albania": "Albania", "Slovenia": "Eslovenia",
  "Denmark": "Dinamarca", "Serbia": "Serbia", "England": "Inglaterra",
  "Poland": "Polonia", "Netherlands": "Países Bajos", "Austria": "Austria",
  "France": "Francia", "Belgium": "Bélgica", "Slovakia": "Eslovaquia",
  "Romania": "Rumanía", "Ukraine": "Ucrania", "Turkey": "Turquía", "Türkiye": "Turquía",
  "Georgia": "Georgia", "Portugal": "Portugal",
  "Czech Republic": "Chequia", "Czechia": "Chequia",
  // Mundial 2026
  "USA": "Estados Unidos", "United States": "Estados Unidos", "Mexico": "México",
  "Canada": "Canadá", "Brazil": "Brasil", "Argentina": "Argentina",
  "Morocco": "Marruecos", "South Korea": "Corea del Sur", "Japan": "Japón",
  "Australia": "Australia", "Saudi Arabia": "Arabia Saudí",
  "IR Iran": "Irán", "Senegal": "Senegal", "Nigeria": "Nigeria",
};

const LEAGUE_CONFIG = {
  euro2024:    { leagueId: 4,  season: 2024 },
  mundial2026: { leagueId: 1,  season: 2026 },
};

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  try {
    if (!process.env.API_FOOTBALL_KEY) {
      return res.status(500).json({ error: "Falta API_FOOTBALL_KEY en las variables de entorno de Vercel" });
    }

    const tournamentId = req.query.tournament ?? "euro2024";
    const config = LEAGUE_CONFIG[tournamentId];
    if (!config) {
      return res.status(400).json({ error: `Torneo desconocido: ${tournamentId}` });
    }

    const apiUrl = `https://v3.football.api-sports.io/fixtures?league=${config.leagueId}&season=${config.season}&status=FT`;
    const apiRes = await fetch(apiUrl, {
      headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
    });
    if (!apiRes.ok) {
      return res.status(502).json({ error: `API-Football respondió con ${apiRes.status}` });
    }
    const apiData = await apiRes.json();

    if (apiData.errors && Object.keys(apiData.errors).length > 0) {
      return res.status(502).json({ error: "API-Football error", details: apiData.errors });
    }

    // Devolver lista plana de partidos con nombres en español
    // El frontend hace el matching contra sus fixtures por home|away
    const scores = [];
    for (const fix of apiData.response ?? []) {
      const home = TEAM_MAP[fix.teams.home.name] ?? fix.teams.home.name;
      const away = TEAM_MAP[fix.teams.away.name] ?? fix.teams.away.name;
      const homeScore = fix.score.fulltime.home;
      const awayScore = fix.score.fulltime.away;
      if (homeScore !== null && awayScore !== null) {
        scores.push({ home, away, homeScore: String(homeScore), awayScore: String(awayScore) });
      }
    }

    return res.json({ ok: true, scores });

  } catch (err) {
    console.error("sync-results error:", err);
    return res.status(500).json({ error: err.message ?? "Error interno del servidor" });
  }
}

