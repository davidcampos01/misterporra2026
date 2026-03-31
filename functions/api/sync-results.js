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
  "Cape Verde": "Cabo Verde", "Ivory Coast": "Costa de Marfil", "Cote d'Ivoire": "Costa de Marfil",
  "New Zealand": "Nueva Zelanda", "Tunisia": "Túnez", "Egypt": "Egipto",
  "Paraguay": "Paraguay", "Uruguay": "Uruguay", "Ghana": "Ghana",
  "Panama": "Panamá", "Haiti": "Haití", "Curacao": "Curazao", "Qatar": "Qatar",
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
};

const LEAGUE_CONFIG = {
  euro2024:    { leagueId: 4,  season: 2024 },
  mundial2026: { leagueId: 1,  season: 2026 },
};

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  try {
    if (!env.API_FOOTBALL_KEY) {
      return Response.json({ error: "Falta API_FOOTBALL_KEY" }, { status: 500 });
    }

    const tournamentId = url.searchParams.get("tournament") ?? "euro2024";
    const config = LEAGUE_CONFIG[tournamentId];
    if (!config) {
      return Response.json({ error: `Torneo desconocido: ${tournamentId}` }, { status: 400 });
    }

    const apiUrl = `https://v3.football.api-sports.io/fixtures?league=${config.leagueId}&season=${config.season}&status=FT-AET-PEN`;

    async function tryFetch(key) {
      const r = await fetch(apiUrl, { headers: { "x-apisports-key": key } });
      if (!r.ok) return null;
      const d = await r.json();
      if (d.errors?.requests || d.errors?.token) return null;
      return d;
    }

    let apiData = await tryFetch(env.API_FOOTBALL_KEY);
    if (!apiData && env.API_FOOTBALL_KEY_2) apiData = await tryFetch(env.API_FOOTBALL_KEY_2);
    if (!apiData) return Response.json({ error: "Límite de peticiones alcanzado" }, { status: 429 });

    const scores = [];
    for (const fix of apiData.response ?? []) {
      const home = TEAM_MAP[fix.teams.home.name] ?? fix.teams.home.name;
      const away = TEAM_MAP[fix.teams.away.name] ?? fix.teams.away.name;
      const homeScore = fix.goals.home;
      const awayScore = fix.goals.away;
      if (homeScore !== null && awayScore !== null) {
        const entry = { home, away, homeScore: String(homeScore), awayScore: String(awayScore), apiId: fix.fixture.id };
        const ph = fix.score.penalty.home;
        const pa = fix.score.penalty.away;
        if (ph !== null && pa !== null) {
          entry.penaltyHome = String(ph);
          entry.penaltyAway = String(pa);
        }
        scores.push(entry);
      }
    }

    return Response.json({ ok: true, scores });
  } catch (err) {
    return Response.json({ error: err.message ?? "Error interno" }, { status: 500 });
  }
}
