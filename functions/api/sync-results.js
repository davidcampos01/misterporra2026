// functions/api/sync-results.js
// Cloudflare Pages Function — equivalente al antiguo api/sync-results.js de Vercel

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
  "USA": "EE.UU.", "United States": "EE.UU.", "Mexico": "México",
  "Canada": "Canadá", "Brazil": "Brasil", "Argentina": "Argentina",
  "Morocco": "Marruecos", "South Korea": "Corea del Sur", "Japan": "Japón",
  "Australia": "Australia", "Saudi Arabia": "Arabia Saudí",
  "IR Iran": "Irán", "Iran": "Irán", "Senegal": "Senegal", "Nigeria": "Nigeria",
  "South Africa": "Sudáfrica", "Ecuador": "Ecuador",
  "Norway": "Noruega", "Algeria": "Argelia", "Jordan": "Jordania",
  "Colombia": "Colombia", "Uzbekistan": "Uzbekistán",
  "Cape Verde": "Cabo Verde", "Ivory Coast": "Costa de Marfil", "Cote d'Ivoire": "Costa de Marfil", "Côte d'Ivoire": "Costa de Marfil",
  "New Zealand": "Nueva Zelanda", "Tunisia": "Túnez", "Egypt": "Egipto",
  "Paraguay": "Paraguay", "Uruguay": "Uruguay", "Ghana": "Ghana",
  "Panama": "Panamá", "Haiti": "Haití", "Curacao": "Curazao", "Curaçao": "Curazao", "Qatar": "Qatar",
  "Greece": "Grecia", "Iceland": "Islandia", "Wales": "Gales",
  "Bosnia and Herzegovina": "Bosnia", "Bosnia Herzegovina": "Bosnia", "Bosnia": "Bosnia",
  "Israel": "Israel", "Finland": "Finlandia", "Montenegro": "Montenegro",
  "Bulgaria": "Bulgaria", "North Macedonia": "Macedonia del Norte",
  "Kosovo": "Kosovo", "Luxembourg": "Luxemburgo", "Sweden": "Suecia",
  "Republic of Ireland": "Irlanda", "Ireland": "Irlanda",
  "Cyprus": "Chipre", "Kazakhstan": "Kazajistán",
  "Trinidad and Tobago": "Trinidad y Tobago", "Honduras": "Honduras",
  "Jamaica": "Jamaica", "Costa Rica": "Costa Rica", "El Salvador": "El Salvador",
  "Solomon Islands": "Islas Salomón", "Bahrain": "Baréin", "Iraq": "Irak",
  "Indonesia": "Indonesia", "Thailand": "Tailandia",
  "Peru": "Perú", "Bolivia": "Bolivia", "Venezuela": "Venezuela", "Chile": "Chile",
  // Variantes específicas de football-data.org
  "Korea Republic": "Corea del Sur", "Republic of Korea": "Corea del Sur",
  "DR Congo": "RD Congo", "Congo DR": "RD Congo",
  "Côte d'Ivoire": "Costa de Marfil", "Curaçao": "Curazao",
  "United Arab Emirates": "Emiratos Árabes Unidos", "UAE": "Emiratos Árabes Unidos",
  "Türkiye": "Turquía", "Turkey": "Turquía",
};

const LEAGUE_CONFIG = {
  euro2024:    { leagueId: 4,  season: 2024, fdoCode: "EC" },
  mundial2026: { leagueId: 1,  season: 2026, fdoCode: "WC" },
};

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  try {
    if (!env.API_FOOTBALL_KEY && !env.FOOTBALL_DATA_KEY) {
      return Response.json({ error: "Falta API_FOOTBALL_KEY o FOOTBALL_DATA_KEY" }, { status: 500 });
    }

    const tournamentId = url.searchParams.get("tournament") ?? "euro2024";
    const config = LEAGUE_CONFIG[tournamentId];
    if (!config) {
      return Response.json({ error: `Torneo desconocido: ${tournamentId}` }, { status: 400 });
    }

    const scores = [];

    // ─ Fuente primaria: football-data.org ─
    let usedFdo = false;
    if (env.FOOTBALL_DATA_KEY && config.fdoCode) {
      try {
        const fdoUrl = `https://api.football-data.org/v4/competitions/${config.fdoCode}/matches?status=FINISHED&season=${config.season}`;
        const r = await fetch(fdoUrl, { headers: { "X-Auth-Token": env.FOOTBALL_DATA_KEY } });
        if (r.ok) {
          const d = await r.json();
          for (const m of d.matches ?? []) {
            const home = TEAM_MAP[m.homeTeam.name] ?? m.homeTeam.name;
            const away = TEAM_MAP[m.awayTeam.name] ?? m.awayTeam.name;
            const fh = m.score.fullTime.home, fa = m.score.fullTime.away;
            if (fh === null || fa === null) continue;
            const entry = { home, away, homeScore: String(fh), awayScore: String(fa) };
            const ph = m.score.penalties?.home, pa = m.score.penalties?.away;
            if (ph != null && pa != null) { entry.penaltyHome = String(ph); entry.penaltyAway = String(pa); }
            scores.push(entry);
          }
          usedFdo = scores.length > 0;
        }
      } catch (_) {}
    }

    // ─ Fallback: API-Football ─
    if (!usedFdo && env.API_FOOTBALL_KEY) {
      const apfUrl = `https://v3.football.api-sports.io/fixtures?league=${config.leagueId}&season=${config.season}&status=FT-AET-PEN`;
      const tryFetch = async (key) => {
        const r = await fetch(apfUrl, { headers: { "x-apisports-key": key } });
        if (!r.ok) return null;
        const d = await r.json();
        if (d.errors?.requests || d.errors?.token || d.errors?.plan) return null;
        return d;
      };
      let apfData = await tryFetch(env.API_FOOTBALL_KEY);
      if (!apfData && env.API_FOOTBALL_KEY_2) apfData = await tryFetch(env.API_FOOTBALL_KEY_2);
      if (apfData) {
        for (const fix of apfData.response ?? []) {
          const home = TEAM_MAP[fix.teams.home.name] ?? fix.teams.home.name;
          const away = TEAM_MAP[fix.teams.away.name] ?? fix.teams.away.name;
          const fh = fix.goals.home, fa = fix.goals.away;
          if (fh === null || fa === null) continue;
          const entry = { home, away, homeScore: String(fh), awayScore: String(fa), apiId: fix.fixture.id };
          const ph = fix.score.penalty.home, pa = fix.score.penalty.away;
          if (ph !== null && pa !== null) { entry.penaltyHome = String(ph); entry.penaltyAway = String(pa); }
          scores.push(entry);
        }
      }
    }

    // ─ Todos los emparejamientos (para detectar overrides de repesca incluso antes de jugar) ─
    let allPairings = [];
    if (env.FOOTBALL_DATA_KEY && config.fdoCode) {
      try {
        const fdoAllUrl = `https://api.football-data.org/v4/competitions/${config.fdoCode}/matches?season=${config.season}`;
        const rAll = await fetch(fdoAllUrl, { headers: { "X-Auth-Token": env.FOOTBALL_DATA_KEY } });
        if (rAll.ok) {
          const dAll = await rAll.json();
          for (const m of dAll.matches ?? []) {
            const h = TEAM_MAP[m.homeTeam?.name] ?? m.homeTeam?.name;
            const a = TEAM_MAP[m.awayTeam?.name] ?? m.awayTeam?.name;
            if (h && a) allPairings.push({ home: h, away: a });
          }
        }
      } catch (_) {}
    }

    return Response.json({ ok: true, scores, allPairings });
  } catch (err) {
    return Response.json({ error: err.message ?? "Error interno" }, { status: 500 });
  }
}

