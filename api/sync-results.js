// api/sync-results.js — Vercel serverless function
// Variables de entorno necesarias en Vercel:
//   FIREBASE_SERVICE_ACCOUNT  → JSON completo de la clave de servicio de Firebase
//   API_FOOTBALL_KEY          → Clave de API-Football (v3.football.api-sports.io)
//   SYNC_API_KEY              → Clave secreta para llamadas manuales
//   CRON_SECRET               → Generado automáticamente por Vercel para el cron

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { EURO2024_FIXTURES } from "../src/constants/euro2024Fixtures.js";
import { FIXTURES } from "../src/constants/fixtures.js";

const TEAM_MAP = {
  "Germany": "Alemania", "Scotland": "Escocia", "Hungary": "Hungría",
  "Switzerland": "Suiza", "Spain": "España", "Croatia": "Croacia",
  "Italy": "Italia", "Albania": "Albania", "Slovenia": "Eslovenia",
  "Denmark": "Dinamarca", "Serbia": "Serbia", "England": "Inglaterra",
  "Poland": "Polonia", "Netherlands": "PaísesBajos", "Austria": "Austria",
  "France": "Francia", "Belgium": "Bélgica", "Slovakia": "Eslovaquia",
  "Romania": "Rumanía", "Ukraine": "Ucrania", "Turkey": "Turquía",
  "Georgia": "Georgia", "Portugal": "Portugal",
  "Czech Republic": "Chequia", "Czechia": "Chequia",
};

const TOURNAMENT_CONFIG = {
  euro2024:    { leagueId: 4,  season: 2024, fixtures: EURO2024_FIXTURES },
  mundial2026: { leagueId: 1,  season: 2026, fixtures: FIXTURES },
};

function getDb() {
  if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore();
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  try {
    // Autenticación
    const cronAuth = process.env.CRON_SECRET &&
      req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`;
    const manualAuth = process.env.SYNC_API_KEY &&
      req.query.key === process.env.SYNC_API_KEY;

    if (!cronAuth && !manualAuth) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validar variables de entorno
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      return res.status(500).json({ error: "Falta FIREBASE_SERVICE_ACCOUNT en las variables de entorno de Vercel" });
    }
    if (!process.env.API_FOOTBALL_KEY) {
      return res.status(500).json({ error: "Falta API_FOOTBALL_KEY en las variables de entorno de Vercel" });
    }

    const tournamentId = req.query.tournament ?? "euro2024";
    const config = TOURNAMENT_CONFIG[tournamentId];
    if (!config) {
      return res.status(400).json({ error: `Torneo desconocido: ${tournamentId}` });
    }

    // Obtener resultados de API-Football (solo partidos terminados FT)
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

    // Construir mapa NombreES|NombreES → resultado
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

    // Cruzar con nuestros fixtures por nombre de equipos
    const results = {};
    let matched = 0;
    for (const fix of config.fixtures) {
      const key  = `${fix.home}|${fix.away}`;
      const rkey = `${fix.away}|${fix.home}`;
      const score = scoreByTeams[key] ?? scoreByTeams[rkey];
      if (!score) continue;
      const homeScore = scoreByTeams[key] ? score.homeScore : score.awayScore;
      const awayScore = scoreByTeams[key] ? score.awayScore : score.homeScore;
      results[String(fix.id)] = { homeScore, awayScore };
      matched++;
    }

    // Escribir en Firestore
    const db = getDb();
    await db.collection("game").doc(tournamentId).set({ results }, { merge: true });

    return res.json({ ok: true, matched, total: config.fixtures.length });

  } catch (err) {
    console.error("sync-results error:", err);
    return res.status(500).json({ error: err.message ?? "Error interno del servidor" });
  }
}

