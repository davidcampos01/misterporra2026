// api/sync-results.js — Proxy de API-Football (sin firebase-admin)
// Autenticación: SYNC_API_KEY (llamadas manuales) o CRON_SECRET (cron Vercel)
// El frontend recibe los resultados y los escribe en Firestore con el SDK cliente.

import { EURO2024_FIXTURES } from "../src/constants/euro2024Fixtures.js";
import { FIXTURES } from "../src/constants/fixtures.js";

const TEAM_MAP = {
  "Germany": "Alemania", "Scotland": "Escocia", "Hungary": "Hungría",
  "Switzerland": "Suiza", "Spain": "España", "Croatia": "Croacia",
  "Italy": "Italia", "Albania": "Albania", "Slovenia": "Eslovenia",
  "Denmark": "Dinamarca", "Serbia": "Serbia", "England": "Inglaterra",
  "Poland": "Polonia", "Netherlands": "Países Bajos", "Austria": "Austria",
  "France": "Francia", "Belgium": "Bélgica", "Slovakia": "Eslovaquia",
  "Romania": "Rumanía", "Ukraine": "Ucrania", "Turkey": "Turquía",
  "Georgia": "Georgia", "Portugal": "Portugal",
  "Czech Republic": "Chequia", "Czechia": "Chequia",
};

const TOURNAMENT_CONFIG = {
  euro2024:    { leagueId: 4,  season: 2024, fixtures: EURO2024_FIXTURES },
  mundial2026: { leagueId: 1,  season: 2026, fixtures: FIXTURES },
};

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  try {
    if (!process.env.API_FOOTBALL_KEY) {
      return res.status(500).json({ error: "Falta API_FOOTBALL_KEY en las variables de entorno de Vercel" });
    }

    const tournamentId = req.query.tournament ?? "euro2024";
    const config = TOURNAMENT_CONFIG[tournamentId];
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

    const scoreByTeams = {};
    for (const fix of apiData.response ?? []) {
      const home = TEAM_MAP[fix.teams.home.name] ?? fix.teams.home.name;
      const away = TEAM_MAP[fix.teams.away.name] ?? fix.teams.away.name;
      const homeScore = String(fix.score.fulltime.home ?? "");
      const awayScore = String(fix.score.fulltime.away ?? "");
      if (homeScore !== "" && awayScore !== "") {
        scoreByTeams[`${home}|${away}`] = { homeScore, awayScore };
      }
    }

    const results = {};
    let matched = 0;
    for (const fix of config.fixtures) {
      // Solo fase de grupos tiene matchday (evitar cruzar eliminatorias vacías)
      if (!fix.matchday) continue;
      const key  = `${fix.home}|${fix.away}`;
      const rkey = `${fix.away}|${fix.home}`;
      const score = scoreByTeams[key] ?? scoreByTeams[rkey];
      if (!score) continue;
      results[String(fix.id)] = scoreByTeams[key]
        ? { homeScore: score.homeScore, awayScore: score.awayScore }
        : { homeScore: score.awayScore, awayScore: score.homeScore };
      matched++;
    }

    // Devolvemos los resultados al frontend — él los escribe en Firestore
    return res.json({ ok: true, matched, total: config.fixtures.filter(f => f.matchday).length, results });

  } catch (err) {
    console.error("sync-results error:", err);
    return res.status(500).json({ error: err.message ?? "Error interno del servidor" });
  }
}

