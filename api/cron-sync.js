// api/cron-sync.js
// Llamado por Vercel cron cada hora. Descarga resultados de API-Football
// y los escribe directamente en Firestore via REST API (sin Admin SDK).

import { FIXTURES }    from "../src/constants/fixtures.js";
import { EURO2024_FIXTURES } from "../src/constants/euro2024Fixtures.js";

const FIREBASE_PROJECT = "misterporra2026";
// API key pública de Firebase (igual que en src/lib/firebase.js)
const FIREBASE_API_KEY  = "AIzaSyCD8pl8PP5KaeDLKLdFs5d-xmYRCeGUP_4";

const TEAM_MAP = {
  // Euro 2024
  "Germany": "Alemania", "Scotland": "Escocia", "Hungary": "Hungría",
  "Switzerland": "Suiza", "Spain": "España", "Croatia": "Croacia",
  "Italy": "Italia", "Albania": "Albania", "Slovenia": "Eslovenia",
  "Denmark": "Dinamarca", "Serbia": "Serbia", "England": "Inglaterra",
  "Poland": "Polonia", "Netherlands": "Países Bajos", "Austria": "Austria",
  "France": "Francia", "Belgium": "Bélgica", "Slovakia": "Eslovaquia",
  "Romania": "Rumanía", "Ukraine": "Ucrania", "Turkey": "Turquía", "Türkiye": "Turquía",
  "Georgia": "Georgia", "Portugal": "Portugal",
  "Czech Republic": "Chequia", "Czechia": "Chequia",
  // Mundial 2026 — equipos confirmados
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
  "Panama": "Panamá", "Haiti": "Haití", "Curacao": "Curazao",
  "Qatar": "Qatar",
  // Candidatos repechaje UEFA
  "Greece": "Grecia", "Iceland": "Islandia", "Wales": "Gales",
  "Bosnia and Herzegovina": "Bosnia", "Bosnia Herzegovina": "Bosnia", "Bosnia": "Bosnia",
  "Israel": "Israel", "Finland": "Finlandia", "Montenegro": "Montenegro",
  "Bulgaria": "Bulgaria", "North Macedonia": "Macedonia del Norte",
  "Kosovo": "Kosovo", "Luxembourg": "Luxemburgo", "Sweden": "Suecia",
  "Republic of Ireland": "Irlanda", "Ireland": "Irlanda",
  "Cyprus": "Chipre", "Kazakhstan": "Kazajistán",
  // Candidatos repechaje intercontinental
  "Trinidad and Tobago": "Trinidad y Tobago", "Honduras": "Honduras",
  "Jamaica": "Jamaica", "Costa Rica": "Costa Rica", "El Salvador": "El Salvador",
  "Solomon Islands": "Islas Salomón", "Bahrain": "Baréin", "Iraq": "Irak",
  "Indonesia": "Indonesia", "Thailand": "Tailandia",
  "Peru": "Perú", "Bolivia": "Bolivia", "Venezuela": "Venezuela", "Chile": "Chile",
  "Papua New Guinea": "Papúa Nueva Guinea",
};

// Banderas para equipos de repechaje que pueden detectarse automáticamente
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
  euro2024:    { leagueId: 4,  season: 2024, fixtures: EURO2024_FIXTURES },
  mundial2026: { leagueId: 1,  season: 2026, fixtures: FIXTURES },
};

// ── Convierte un objeto JS plano a Firestore REST value ───────────────────────
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

// ── Escribe un campo en Firestore via REST ────────────────────────────────────
async function firestoreWrite(docPath, fieldPath, value) {
  const url =
    `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/${docPath}` +
    `?key=${FIREBASE_API_KEY}&updateMask.fieldPaths=${fieldPath}`;
  const body = JSON.stringify({ fields: { [fieldPath]: fsVal(value) } });
  const r = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body,
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Firestore PATCH ${r.status}: ${txt}`);
  }
  return r.json();
}

// ── Lee teamOverrides del documento Firestore ─────────────────────────────────
async function firestoreRead(docPath) {
  const url =
    `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/${docPath}` +
    `?key=${FIREBASE_API_KEY}`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const data = await r.json();
  // Convertir campos Firestore de vuelta a JS
  function fromFsVal(v) {
    if (v.nullValue !== undefined)    return null;
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
  const overrides = fields.teamOverrides ? fromFsVal(fields.teamOverrides) : {};
  return overrides;
}

export default async function handler(req, res) {
  // Vercel inyecta CRON_SECRET como Bearer token en solicitudes cron
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers["authorization"] ?? "";
    if (auth !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  const tournamentId = req.query.tournament ?? "mundial2026";
  const config = LEAGUE_CONFIG[tournamentId];
  if (!config) return res.status(400).json({ error: "Torneo desconocido" });

  try {
    // 1. Leer teamOverrides de Firestore para resolver equipos pendientes
    const teamOverrides = await firestoreRead(`game/${tournamentId}`);

    // 2. Construir mapa inverso: nombre real → fixture name (para matching con pending teams)
    const overrideReverse = {};
    Object.entries(teamOverrides ?? {}).forEach(([placeholder, team]) => {
      if (team?.name) overrideReverse[team.name] = placeholder;
    });

    // 3. Fetch de API-Football
    if (!process.env.API_FOOTBALL_KEY) {
      return res.status(500).json({ error: "Falta API_FOOTBALL_KEY" });
    }
    const apiUrl = `https://v3.football.api-sports.io/fixtures?league=${config.leagueId}&season=${config.season}&status=FT-AET-PEN`;
    const apiRes = await fetch(apiUrl, {
      headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
    });
    if (!apiRes.ok) return res.status(502).json({ error: `API-Football ${apiRes.status}` });

    const apiData = await apiRes.json();
    if (apiData.errors && Object.keys(apiData.errors).length > 0) {
      return res.status(502).json({ error: "API-Football error", details: apiData.errors });
    }

    // 4. Construir mapa de resultados por equipos
    const scoreByTeams = {};
    for (const fix of apiData.response ?? []) {
      const home = TEAM_MAP[fix.teams.home.name] ?? fix.teams.home.name;
      const away = TEAM_MAP[fix.teams.away.name] ?? fix.teams.away.name;
      if (fix.goals.home === null || fix.goals.away === null) continue;
      const entry = {
        home, away,
        homeScore: String(fix.goals.home),
        awayScore: String(fix.goals.away),
      };
      const ph = fix.score.penalty.home, pa = fix.score.penalty.away;
      if (ph !== null && pa !== null) {
        entry.penaltyHome = String(ph);
        entry.penaltyAway = String(pa);
      }
      scoreByTeams[`${home}|${away}`] = entry;
    }

    // 5. Matching con fixtures (resolviendo pending teams via overrides)
    const results = {};
    let matched = 0;
    for (const fix of config.fixtures) {
      // Resolver nombres reales de equipos (pueden ser pendientes)
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
      results[String(fix.id)] = entry;
      matched++;
    }

    // 6. Auto-detectar equipos pendientes de repechaje
    // Estrategia: para cada fixture con placeholder (*), buscamos en los resultados
    // un partido del equipo conocido (no pendiente) contra un equipo no conocido del grupo.
    const newOverrides = {};
    for (const fix of config.fixtures) {
      const homeIsPending = fix.home.endsWith("*");
      const awayIsPending = fix.away.endsWith("*");
      if (!homeIsPending && !awayIsPending) continue;
      const placeholder = homeIsPending ? fix.home : fix.away;
      const anchor      = homeIsPending ? fix.away : fix.home;
      if (teamOverrides?.[placeholder] || newOverrides[placeholder]) continue;
      // Compañeros de grupo confirmados (no el placeholder)
      const knownOpponents = new Set(
        config.fixtures
          .filter(f2 => f2.group === fix.group && f2.id !== fix.id)
          .flatMap(f2 => [f2.home, f2.away])
          .filter(t => !t.endsWith("*") && t !== anchor)
      );
      // Buscar en resultados: anchor jugó contra alguien que no es un oponente conocido
      for (const [key] of Object.entries(scoreByTeams)) {
        const [h, a] = key.split("|");
        let realName = null;
        if (h === anchor && !knownOpponents.has(a)) realName = a;
        else if (a === anchor && !knownOpponents.has(h)) realName = h;
        if (realName) {
          newOverrides[placeholder] = { name: realName, flag: FLAG_MAP[realName] ?? "🏳️" };
          break;
        }
      }
    }

    // 7. Escribir en Firestore
    await firestoreWrite(`game/${tournamentId}`, "results", results);
    let overridesWritten = 0;
    if (Object.keys(newOverrides).length > 0) {
      const merged = { ...(teamOverrides ?? {}), ...newOverrides };
      await firestoreWrite(`game/${tournamentId}`, "teamOverrides", merged);
      overridesWritten = Object.keys(newOverrides).length;
    }

    return res.json({ ok: true, matched, total: Object.keys(scoreByTeams).length, overridesWritten });
  } catch (err) {
    console.error("cron-sync error:", err);
    return res.status(500).json({ error: err.message });
  }
}
