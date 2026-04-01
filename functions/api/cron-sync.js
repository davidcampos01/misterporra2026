// functions/api/cron-sync.js
// Cloudflare Pages Function — equivalente al antiguo api/cron-sync.js de Vercel
// Llamado por el cron-worker (o manualmente) con ?tournament=euro2024|mundial2026

import { FIXTURES }         from "../../src/constants/fixtures.js";
import { EURO2024_FIXTURES } from "../../src/constants/euro2024Fixtures.js";

const FIREBASE_PROJECT  = "misterporra2026";
const FIREBASE_API_KEY  = "AIzaSyCD8pl8PP5KaeDLKLdFs5d-xmYRCeGUP_4";

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
  "Cape Verde": "Cabo Verde", "Cape Verde Islands": "Cabo Verde",
  "Ivory Coast": "Costa de Marfil", "Cote d'Ivoire": "Costa de Marfil", "Côte d'Ivoire": "Costa de Marfil",
  "New Zealand": "Nueva Zelanda", "Tunisia": "Túnez", "Egypt": "Egipto",
  "Paraguay": "Paraguay", "Uruguay": "Uruguay", "Ghana": "Ghana",
  "Panama": "Panamá", "Haiti": "Haití", "Curacao": "Curazao", "Curaçao": "Curazao", "Qatar": "Qatar",
  "Greece": "Grecia", "Iceland": "Islandia", "Wales": "Gales",
  "Bosnia and Herzegovina": "Bosnia", "Bosnia Herzegovina": "Bosnia", "Bosnia-Herzegovina": "Bosnia", "Bosnia": "Bosnia",
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
  "Papua New Guinea": "Papúa Nueva Guinea",
  // Variantes específicas de football-data.org
  "Korea Republic": "Corea del Sur", "Republic of Korea": "Corea del Sur",
  "DR Congo": "RD Congo", "Congo DR": "RD Congo",
  "Czechia": "Chequia", "Czech Republic": "Chequia",
  "United Arab Emirates": "Emiratos Árabes Unidos", "UAE": "Emiratos Árabes Unidos",
  "Kyrgyzstan": "Kirguistán", "Tajikistan": "Tayikistán",
  "Türkiye": "Turquía", "Turkey": "Turquía",
};

const FLAG_MAP = {
  "Grecia": "🇬🇷", "Ucrania": "🇺🇦", "Turquía": "🇹🇷", "Georgia": "🇬🇪",
  "Islandia": "🇮🇸", "Gales": "🏴󠁧󠁢󠁷󠁬󠁳󠁿", "Bosnia": "🇧🇦", "Israel": "🇮🇱",
  "Finlandia": "🇫🇮", "Montenegro": "🇲🇪", "Bulgaria": "🇧🇬",
  "Macedonia del Norte": "🇲🇰", "Kosovo": "🇽🇰", "Luxemburgo": "🇱🇺",
  "Suecia": "🇸🇪", "Irlanda": "🇮🇪", "Chipre": "🇨🇾", "Kazajistán": "🇰🇿",
  "Eslovaquia": "🇸🇰", "Polonia": "🇵🇱", "Hungría": "🇭🇺", "Rumanía": "🇷🇴",
  "Serbia": "🇷🇸", "Albania": "🇦🇱", "Croacia": "🇭🇷", "Chequia": "🇨🇿",
  "Eslovenia": "🇸🇮", "Dinamarca": "🇩🇰",
  "Trinidad y Tobago": "🇹🇹", "Honduras": "🇭🇳", "Jamaica": "🇯🇲",
  "Costa Rica": "🇨🇷", "El Salvador": "🇸🇻", "Panamá": "🇵🇦",
  "Islas Salomón": "🇸🇧", "Baréin": "🇧🇭", "Irak": "🇮🇶",
  "Indonesia": "🇮🇩", "Tailandia": "🇹🇭",
  "Perú": "🇵🇪", "Bolivia": "🇧🇴", "Venezuela": "🇻🇪", "Chile": "🇨🇱",
  "Papúa Nueva Guinea": "🇵🇬",
};

const LEAGUE_CONFIG = {
  euro2024:    { leagueId: 4,  season: 2024, fdoCode: "EC", fixtures: EURO2024_FIXTURES },
  mundial2026: { leagueId: 1,  season: 2026, fdoCode: "WC", fixtures: FIXTURES },
};

function fsVal(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean")        return { booleanValue: v };
  if (typeof v === "number")         return { integerValue: String(Math.floor(v)) };
  if (typeof v === "string")         return { stringValue: v };
  if (typeof v === "object")         return { mapValue: { fields: fsFields(v) } };
  return { stringValue: String(v) };
}
function fsFields(obj) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fsVal(v)]));
}

async function firestoreWrite(docPath, fieldPath, value) {
  const url =
    `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/${docPath}` +
    `?key=${FIREBASE_API_KEY}&updateMask.fieldPaths=${fieldPath}`;
  const r = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: { [fieldPath]: fsVal(value) } }),
  });
  if (!r.ok) throw new Error(`Firestore PATCH ${r.status}: ${await r.text()}`);
  return r.json();
}

async function firestoreRead(docPath) {
  const url =
    `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/${docPath}` +
    `?key=${FIREBASE_API_KEY}`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const data = await r.json();
  function fromFsVal(v) {
    if (v.nullValue    !== undefined) return null;
    if (v.booleanValue !== undefined) return v.booleanValue;
    if (v.integerValue !== undefined) return Number(v.integerValue);
    if (v.doubleValue  !== undefined) return v.doubleValue;
    if (v.stringValue  !== undefined) return v.stringValue;
    if (v.mapValue) {
      return Object.fromEntries(
        Object.entries(v.mapValue.fields ?? {}).map(([k, val]) => [k, fromFsVal(val)])
      );
    }
    return null;
  }
  const fields = data.fields ?? {};
  return fields.teamOverrides ? fromFsVal(fields.teamOverrides) : {};
}

// Lógica principal exportada también para uso desde el cron-worker
export async function runCronSync(tournamentId, apiFootballKey, apiFootballKey2, footballDataKey) {
  const config = LEAGUE_CONFIG[tournamentId];
  if (!config) throw new Error(`Torneo desconocido: ${tournamentId}`);

  if (!footballDataKey && !apiFootballKey) throw new Error("Falta FOOTBALL_DATA_KEY o API_FOOTBALL_KEY");

  const teamOverrides = await firestoreRead(`game/${tournamentId}`);
  const scoreByTeams  = {};

  // ── Fuente primaria: football-data.org (sin límite, acceso a WC 2026 gratis) ──
  let fdoReachable = false;
  if (footballDataKey && config.fdoCode) {
    try {
      const fdoUrl = `https://api.football-data.org/v4/competitions/${config.fdoCode}/matches?status=FINISHED&season=${config.season}`;
      const r = await fetch(fdoUrl, { headers: { "X-Auth-Token": footballDataKey } });
      if (r.ok) {
        fdoReachable = true;
        const d = await r.json();
        for (const m of d.matches ?? []) {
          const home = TEAM_MAP[m.homeTeam.name] ?? m.homeTeam.name;
          const away = TEAM_MAP[m.awayTeam.name] ?? m.awayTeam.name;
          const fh = m.score.fullTime.home, fa = m.score.fullTime.away;
          if (fh === null || fa === null) continue;
          const entry = { home, away, homeScore: String(fh), awayScore: String(fa) };
          const ph = m.score.penalties?.home, pa = m.score.penalties?.away;
          if (ph != null && pa != null) { entry.penaltyHome = String(ph); entry.penaltyAway = String(pa); }
          scoreByTeams[`${home}|${away}`] = entry;
        }
        console.log(`[fdo] partidos FINISHED: ${Object.keys(scoreByTeams).length}`);
      }
    } catch (_) {}
  }

  // ── API-Football: enriquece con apiId (y fuente de fallback si FDO no alcanzable) ──
  let apfData = null;
  if (apiFootballKey) {
    const apfUrl = `https://v3.football.api-sports.io/fixtures?league=${config.leagueId}&season=${config.season}&status=FT-AET-PEN`;
    const tryApf = async (key) => {
      const r = await fetch(apfUrl, { headers: { "x-apisports-key": key } });
      if (!r.ok) return null;
      const d = await r.json();
      if (d.errors?.requests || d.errors?.token || d.errors?.plan) return null;
      return d;
    };
    apfData = await tryApf(apiFootballKey);
    if (!apfData && apiFootballKey2) apfData = await tryApf(apiFootballKey2);
  }

  if (!fdoReachable) {
    // FDO no disponible: usar API-Football como fallback (solo útil para euro2024)
    if (!apfData) {
      console.log(`[cron] FDO no alcanzable y sin API-Football. Continuando sin resultados.`);
    } else {
      for (const fix of apfData.response ?? []) {
        const home = TEAM_MAP[fix.teams.home.name] ?? fix.teams.home.name;
        const away = TEAM_MAP[fix.teams.away.name] ?? fix.teams.away.name;
        if (fix.goals.home === null || fix.goals.away === null) continue;
        const entry = { home, away, homeScore: String(fix.goals.home), awayScore: String(fix.goals.away), apiId: fix.fixture.id };
        const ph = fix.score.penalty.home, pa = fix.score.penalty.away;
        if (ph !== null && pa !== null) { entry.penaltyHome = String(ph); entry.penaltyAway = String(pa); }
        scoreByTeams[`${home}|${away}`] = entry;
      }
    }
  } else if (apfData?.response) {
    // FDO OK: enriquecer con apiId de API-Football
    for (const fix of apfData.response) {
      const h = TEAM_MAP[fix.teams.home.name] ?? fix.teams.home.name;
      const a = TEAM_MAP[fix.teams.away.name] ?? fix.teams.away.name;
      if (scoreByTeams[`${h}|${a}`]) scoreByTeams[`${h}|${a}`].apiId = fix.fixture.id;
    }
  }

  const results = {};
  let matched = 0;
  for (const fix of config.fixtures) {
    const homeReal = teamOverrides?.[fix.home]?.name ?? fix.home;
    const awayReal = teamOverrides?.[fix.away]?.name ?? fix.away;
    const score =
      scoreByTeams[`${homeReal}|${awayReal}`] ??
      scoreByTeams[`${awayReal}|${homeReal}`];
    if (!score) continue;

    const isSwapped = !scoreByTeams[`${homeReal}|${awayReal}`];
    const entry = isSwapped
      ? { homeScore: score.awayScore, awayScore: score.homeScore }
      : { homeScore: score.homeScore, awayScore: score.awayScore };

    if (score.penaltyHome !== undefined) {
      entry.penaltyHome = isSwapped ? score.penaltyAway : score.penaltyHome;
      entry.penaltyAway = isSwapped ? score.penaltyHome : score.penaltyAway;
      entry.winner = Number(entry.penaltyHome) > Number(entry.penaltyAway) ? "A" : "B";
    }
    if (score.apiId) entry.apiId = score.apiId;
    results[String(fix.id)] = entry;
    matched++;
  }

  const newOverrides = {};

  // Detectar qué placeholders siguen sin resolver
  const pendingPlaceholders = config.fixtures
    .filter(f => f.home.endsWith("*") || f.away.endsWith("*"))
    .filter(f => {
      const ph = f.home.endsWith("*") ? f.home : f.away;
      return !teamOverrides?.[ph];
    });

  if (pendingPlaceholders.length > 0 && footballDataKey && config.fdoCode) {
    // Pedir TODOS los partidos del torneo (incluyendo programados) via FDO
    // para detectar qué equipo ocupa cada plaza playoff
    try {
      const fdoAllUrl = `https://api.football-data.org/v4/competitions/${config.fdoCode}/matches?season=${config.season}`;
      const ra = await fetch(fdoAllUrl, { headers: { "X-Auth-Token": footballDataKey } });
      if (ra.ok) {
        const da = await ra.json();
        const allMatches = da.matches ?? [];
        console.log(`[overrides] FDO total matches: ${allMatches.length}`);

        const allTeamsByMatch = {};
        const allConfirmedTeams = new Set();
        for (const m of allMatches) {
          const h = TEAM_MAP[m.homeTeam.name] ?? m.homeTeam.name;
          const a = TEAM_MAP[m.awayTeam.name] ?? m.awayTeam.name;
          if (h && h !== "null" && h !== "undefined") allConfirmedTeams.add(h);
          if (a && a !== "null" && a !== "undefined") allConfirmedTeams.add(a);
          allTeamsByMatch[`${h}|${a}`] = true;
          allTeamsByMatch[`${a}|${h}`] = true;
        }
        console.log(`[overrides] confirmedTeams: ${[...allConfirmedTeams].join(", ")}`);

        for (const fix of pendingPlaceholders) {
          const homeIsPending = fix.home.endsWith("*");
          const placeholder   = homeIsPending ? fix.home : fix.away;
          const anchor        = homeIsPending ? fix.away : fix.home;
          if (newOverrides[placeholder]) continue;
          const knownInGroup = new Set(
            config.fixtures
              .filter(f2 => f2.group === fix.group && f2.id !== fix.id)
              .flatMap(f2 => [f2.home, f2.away])
              .filter(t => !t.endsWith("*") && t !== anchor)
              .map(t => teamOverrides?.[t]?.name ?? t)
          );
          for (const team of allConfirmedTeams) {
            if (team === anchor || knownInGroup.has(team)) continue;
            if (allTeamsByMatch[`${anchor}|${team}`] || allTeamsByMatch[`${team}|${anchor}`]) {
              newOverrides[placeholder] = { name: team, flag: FLAG_MAP[team] ?? "🏳️" };
              console.log(`[overrides] found: ${placeholder} = ${team}`);
              break;
            }
          }
        }
      }
    } catch (e) {
      console.log(`[overrides] FDO error: ${e.message}`);
    }
  }

  await firestoreWrite(`game/${tournamentId}`, "results", results);
  let overridesWritten = 0;
  if (Object.keys(newOverrides).length > 0) {
    const merged = { ...(teamOverrides ?? {}), ...newOverrides };
    await firestoreWrite(`game/${tournamentId}`, "teamOverrides", merged);
    overridesWritten = Object.keys(newOverrides).length;
  }

  return { matched, total: Object.keys(scoreByTeams).length, overridesWritten };
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url);

  // Validar secret (el cron-worker envía Authorization: Bearer <CRON_SECRET>)
  const cronSecret = env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${cronSecret}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!env.API_FOOTBALL_KEY && !env.FOOTBALL_DATA_KEY) {
    return Response.json({ error: "Falta API_FOOTBALL_KEY o FOOTBALL_DATA_KEY" }, { status: 500 });
  }

  const tournamentId = url.searchParams.get("tournament") ?? "mundial2026";
  try {
    const result = await runCronSync(tournamentId, env.API_FOOTBALL_KEY, env.API_FOOTBALL_KEY_2, env.FOOTBALL_DATA_KEY);
    return Response.json({ ok: true, ...result });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
