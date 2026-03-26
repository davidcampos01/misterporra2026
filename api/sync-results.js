// api/sync-results.js — Vercel serverless function
// Obtiene resultados de API-Football y los escribe en Firestore
//
// Variables de entorno necesarias en Vercel:
//   FIREBASE_SERVICE_ACCOUNT  → JSON completo de la clave de servicio de Firebase
//   API_FOOTBALL_KEY          → Clave de API-Football (v3.football.api-sports.io)
//   SYNC_API_KEY              → Clave secreta propia para llamar a este endpoint
//
// Uso: GET /api/sync-results?tournament=euro2024&key=TU_SYNC_KEY

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Mapeo de nombres en inglés (API-Football) → español (nuestros datos)
const TEAM_MAP = {
  // Euro 2024
  "Germany": "Alemania",
  "Scotland": "Escocia",
  "Hungary": "Hungría",
  "Switzerland": "Suiza",
  "Spain": "España",
  "Croatia": "Croacia",
  "Italy": "Italia",
  "Albania": "Albania",
  "Slovenia": "Eslovenia",
  "Denmark": "Dinamarca",
  "Serbia": "Serbia",
  "England": "Inglaterra",
  "Poland": "Polonia",
  "Netherlands": "PaísesBajos",
  "Austria": "Austria",
  "France": "Francia",
  "Belgium": "Bélgica",
  "Slovakia": "Eslovaquia",
  "Romania": "Rumanía",
  "Ukraine": "Ucrania",
  "Turkey": "Turquía",
  "Georgia": "Georgia",
  "Portugal": "Portugal",
  "Czech Republic": "Chequia",
  "Czechia": "Chequia",
};

function getDb() {
  if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore();
}

const TOURNAMENT_CONFIG = {
  euro2024:    { leagueId: 4,  season: 2024 },
  mundial2026: { leagueId: 1,  season: 2026 },
};

export default async function handler(req, res) {
  // Acepta llamadas del cron de Vercel (CRON_SECRET) o manuales (SYNC_API_KEY)
  const cronAuth = req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`;
  const manualAuth = process.env.SYNC_API_KEY && req.query.key === process.env.SYNC_API_KEY;
  if (!cronAuth && !manualAuth) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const tournamentId = req.query.tournament ?? "euro2024";
  const config = TOURNAMENT_CONFIG[tournamentId];
  if (!config) {
    return res.status(400).json({ error: "Unknown tournament" });
  }

  // ── 1. Obtener resultados de API-Football ─────────────────────────────────
  const apiUrl = `https://v3.football.api-sports.io/fixtures?league=${config.leagueId}&season=${config.season}&status=FT`;
  const apiRes = await fetch(apiUrl, {
    headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
  });
  if (!apiRes.ok) {
    return res.status(502).json({ error: "API-Football error", status: apiRes.status });
  }
  const apiData = await apiRes.json();

  // Construir mapa "NombreES_NombreES" → { homeScore, awayScore }
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

  // ── 2. Cargar nuestros fixtures ───────────────────────────────────────────
  const { default: fixtureModule } = await import(
    tournamentId === "euro2024"
      ? "../src/constants/euro2024Fixtures.js"
      : "../src/constants/fixtures.js"
  );
  const fixtures = Object.values(fixtureModule)[0]; // primer export del módulo

  // ── 3. Cruzar resultados por equipos home+away ────────────────────────────
  const results = {};
  let matched = 0;
  for (const fix of fixtures) {
    const key  = `${fix.home}|${fix.away}`;
    const rkey = `${fix.away}|${fix.home}`; // por si la API invirtió home/away
    const score = scoreByTeams[key] ?? scoreByTeams[rkey];
    if (!score) continue;
    const homeScore = scoreByTeams[key] ? score.homeScore : score.awayScore;
    const awayScore = scoreByTeams[key] ? score.awayScore : score.homeScore;
    results[String(fix.id)] = { homeScore, awayScore };
    matched++;
  }

  // ── 4. Escribir en Firestore ──────────────────────────────────────────────
  const db = getDb();
  await db.collection("game").doc(tournamentId).set({ results }, { merge: true });

  return res.json({ ok: true, matched, total: fixtures.length });
}
