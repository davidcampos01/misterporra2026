// functions/api/liga.js
// Proxy usando API-Football para clasificaciones y resultados de ligas

const LEAGUE_IDS = {
  PD:  140,  // La Liga
  PL:  39,   // Premier League
  BL1: 78,   // Bundesliga
  SA:  135,  // Serie A
  FL1: 61,   // Ligue 1
  DED: 88,   // Eredivisie
};

async function apfFetch(url, key1, key2) {
  async function tryKey(key) {
    const r = await fetch(url, { headers: { "x-apisports-key": key } });
    if (!r.ok) return null;
    const d = await r.json();
    if (d.errors?.requests || d.errors?.token) return null;
    return d.response ?? [];
  }
  const r1 = await tryKey(key1);
  if (r1 !== null) return r1;
  if (key2) {
    const r2 = await tryKey(key2);
    if (r2 !== null) return r2;
  }
  throw new Error("Límite de peticiones alcanzado");
}

export async function onRequest({ request, env }) {
  const key1 = env.API_FOOTBALL_KEY;
  const key2 = env.API_FOOTBALL_KEY_2;
  if (!key1) return Response.json({ error: "Falta API_FOOTBALL_KEY" }, { status: 500 });

  const url = new URL(request.url);
  const type        = url.searchParams.get("type")        ?? "standings";
  const competition = url.searchParams.get("competition") ?? "PD";
  const season      = url.searchParams.get("season")      ?? "2025";

  const leagueId = LEAGUE_IDS[competition];
  if (!leagueId) return Response.json({ error: `Liga desconocida: ${competition}` }, { status: 400 });

  const base = "https://v3.football.api-sports.io";

  try {
    if (type === "standings") {
      const response = await apfFetch(`${base}/standings?league=${leagueId}&season=${season}`, key1, key2);
      const leagueData = response[0]?.league;
      if (!leagueData) return Response.json({ error: "Sin datos de clasificación" }, { status: 404 });

      const rawTable = leagueData?.standings?.[0] ?? [];
      const roundStr = leagueData?.round ?? "";
      const currentMatchday = parseInt(roundStr.match(/(\d+)$/)?.[1] ?? "1", 10);

      const table = rawTable.map(row => ({
        position:       row.rank,
        team: {
          id:           row.team.id,
          name:         row.team.name,
          shortName:    row.team.name,
          crest:        row.team.logo,
        },
        playedGames:    row.all.played,
        won:            row.all.win,
        draw:           row.all.draw,
        lost:           row.all.lose,
        goalsFor:       row.all.goals.for,
        goalsAgainst:   row.all.goals.against,
        goalDifference: row.goalsDiff,
        points:         row.points,
        form:           (row.form ?? "").split("").join(","),
      }));

      return Response.json({
        standings:   [{ type: "TOTAL", table }],
        season:      { currentMatchday },
        competition: { name: leagueData?.name ?? competition },
      }, { headers: { "Content-Type": "application/json", "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200" } });
    }

    if (type === "fixtures") {
      // Un solo request trae TODOS los partidos terminados del season.
      // El frontend agrupa por jornada con los datos locales → 0 requests adicionales al navegar.
      const response = await apfFetch(
        `${base}/fixtures?league=${leagueId}&season=${season}&status=FT-AET-PEN`,
        key1, key2
      );

      const byRound = {};
      let maxRound  = 0;
      for (const fix of response) {
        const roundStr = fix.league?.round ?? "";
        const roundNum = parseInt(roundStr.match(/(\d+)$/)?.[1] ?? "0", 10);
        if (!roundNum) continue;
        if (!byRound[roundNum]) byRound[roundNum] = [];
        byRound[roundNum].push({
          id:      fix.fixture.id,
          status:  "FINISHED",
          utcDate: fix.fixture.date,
          homeTeam: { id: fix.teams.home.id, name: fix.teams.home.name, shortName: fix.teams.home.name, crest: fix.teams.home.logo },
          awayTeam: { id: fix.teams.away.id, name: fix.teams.away.name, shortName: fix.teams.away.name, crest: fix.teams.away.logo },
          score: { fullTime: { home: fix.goals.home, away: fix.goals.away } },
        });
        if (roundNum > maxRound) maxRound = roundNum;
      }

      return Response.json({ rounds: byRound, maxRound }, {
        headers: { "Content-Type": "application/json", "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600" },
      });
    }

    return Response.json({ error: "Tipo inválido" }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
