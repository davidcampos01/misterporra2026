// api/match-detail.js — Devuelve eventos y alineaciones de un partido
// ?fixtureApiId=12345  (el ID de API-Football guardado en results[id].apiId)

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600"); // cache 5 min en Vercel Edge

  const { fixtureApiId } = req.query;
  if (!fixtureApiId) {
    return res.status(400).json({ error: "Falta parámetro fixtureApiId" });
  }
  if (!process.env.API_FOOTBALL_KEY) {
    return res.status(500).json({ error: "Falta API_FOOTBALL_KEY" });
  }

  const headers = { "x-apisports-key": process.env.API_FOOTBALL_KEY };
  const base = `https://v3.football.api-sports.io`;

  try {
    // Dos llamadas en paralelo: eventos + alineaciones
    const [eventsRes, lineupsRes] = await Promise.all([
      fetch(`${base}/fixtures/events?fixture=${fixtureApiId}`, { headers }),
      fetch(`${base}/fixtures/lineups?fixture=${fixtureApiId}`, { headers }),
    ]);

    if (!eventsRes.ok || !lineupsRes.ok) {
      return res.status(502).json({ error: "Error al obtener datos de API-Football" });
    }

    const [eventsData, lineupsData] = await Promise.all([
      eventsRes.json(),
      lineupsRes.json(),
    ]);

    return res.json({
      ok: true,
      events: eventsData.response ?? [],
      lineups: lineupsData.response ?? [],
    });

  } catch (err) {
    console.error("match-detail error:", err);
    return res.status(500).json({ error: err.message });
  }
}
