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

const STATUS_MAP = {
  FT: "FINISHED", AET: "FINISHED", PEN: "FINISHED",
  NS: "TIMED", TBD: "TIMED",
  "1H": "IN_PLAY", "2H": "IN_PLAY", HT: "IN_PLAY",
  PST: "POSTPONED", CANC: "CANCELLED",
};

async function apfFetch(url, key) {
  const r = await fetch(url, { headers: { "x-apisports-key": key } });
  if (!r.ok) throw new Error(`API error ${r.status}`);
  const d = await r.json();
  if (d.errors?.requests || d.errors?.token) throw new Error("Límite de peticiones alcanzado");
  return d.response ?? [];
}

export async function onRequest({ request, env }) {
  const key = env.API_FOOTBALL_KEY;
  if (!key) return Response.json({ error: "Falta API_FOOTBALL_KEY" }, { status: 500 });

  const url = new URL(request.url);
  const type        = url.searchParams.get("type")        ?? "standings";
  const competition = url.searchParams.get("competition") ?? "PD";
  const season      = url.searchParams.get("season")      ?? "2025";
  const matchday    = url.searchParams.get("matchday");

  const leagueId = LEAGUE_IDS[competition];
  if (!leagueId) return Response.json({ error: `Liga desconocida: ${competition}` }, { status: 400 });

  const base = "https://v3.football.api-sports.io";

  try {
    if (type === "standings") {
      const response = await apfFetch(`${base}/standings?league=${leagueId}&season=${season}`, key);
      const leagueData = response[0]?.league;
      const rawTable   = leagueData?.standings?.[0] ?? [];
      const roundStr   = leagueData?.round ?? "";
      const currentMatchday = parseInt(roundStr.match(/(\d+)$/)?.[1] ?? "1", 10);

      const table = rawTable.map(row => ({
        position:      row.rank,
        team: {
          id:        row.team.id,
          name:      row.team.name,
          shortName: row.team.name,
          crest:     row.team.logo,
        },
        playedGames:   row.all.played,
        won:           row.all.win,
        draw:          row.all.draw,
        lost:          row.all.lose,
        goalsFor:      row.all.goals.for,
        goalsAgainst:  row.all.goals.against,
        goalDifference: row.goalsDiff,
        points:        row.points,
        // API-Football: "WWDLW" → convertir a "W,W,D,L,W" para el FormBadge
        form: (row.form ?? "").split("").join(","),
      }));

      return Response.json({
        standings:   [{ type: "TOTAL", table }],
        season:      { currentMatchday },
        competition: { name: leagueData?.name ?? competition },
      }, { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200" } });
    }

    if (type === "matches") {
      if (!matchday) return Response.json({ error: "Falta matchday" }, { status: 400 });
      const round = `Regular Season - ${matchday}`;
      const response = await apfFetch(
        `${base}/fixtures?league=${leagueId}&season=${season}&round=${encodeURIComponent(round)}`,
        key
      );

      const matches = response.map(fix => ({
        id:     fix.fixture.id,
        status: STATUS_MAP[fix.fixture.status.short] ?? fix.fixture.status.short,
        utcDate: fix.fixture.date,
        homeTeam: { id: fix.teams.home.id, name: fix.teams.home.name, shortName: fix.teams.home.name, crest: fix.teams.home.logo },
        awayTeam: { id: fix.teams.away.id, name: fix.teams.away.name, shortName: fix.teams.away.name, crest: fix.teams.away.logo },
        score: { fullTime: { home: fix.goals.home, away: fix.goals.away } },
      }));

      const allFinished = matches.length > 0 && matches.every(m => m.status === "FINISHED");
      const cacheControl = allFinished
        ? "s-maxage=86400, stale-while-revalidate=172800"
        : "s-maxage=300, stale-while-revalidate=600";

      return Response.json({ matches }, { headers: { "Cache-Control": cacheControl } });
    }

    return Response.json({ error: "Tipo inválido" }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
