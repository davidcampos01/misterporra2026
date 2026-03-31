// functions/api/match-detail.js
// Cloudflare Pages Function — equivalente al antiguo api/match-detail.js de Vercel
// ?fixtureApiId=12345

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const fixtureApiId = url.searchParams.get("fixtureApiId");

  if (!fixtureApiId) {
    return Response.json({ error: "Falta parámetro fixtureApiId" }, { status: 400 });
  }
  if (!env.API_FOOTBALL_KEY) {
    return Response.json({ error: "Falta API_FOOTBALL_KEY" }, { status: 500 });
  }

  const headers = { "x-apisports-key": env.API_FOOTBALL_KEY };
  const base = "https://v3.football.api-sports.io";

  try {
    const [fixtureRes, eventsRes, lineupsRes] = await Promise.all([
      fetch(`${base}/fixtures?id=${fixtureApiId}`, { headers }),
      fetch(`${base}/fixtures/events?fixture=${fixtureApiId}`, { headers }),
      fetch(`${base}/fixtures/lineups?fixture=${fixtureApiId}`, { headers }),
    ]);

    if (!fixtureRes.ok || !eventsRes.ok || !lineupsRes.ok) {
      return Response.json({ error: "Error al obtener datos de API-Football" }, { status: 502 });
    }

    const [fixtureData, eventsData, lineupsData] = await Promise.all([
      fixtureRes.json(),
      eventsRes.json(),
      lineupsRes.json(),
    ]);

    const fix = fixtureData.response?.[0];
    const homeTeamId = fix?.teams?.home?.id ?? null;
    const awayTeamId = fix?.teams?.away?.id ?? null;

    return new Response(
      JSON.stringify({ ok: true, homeTeamId, awayTeamId, events: eventsData.response ?? [], lineups: lineupsData.response ?? [] }),
      { headers: { "Content-Type": "application/json", "Cache-Control": "s-maxage=300, stale-while-revalidate=600" } }
    );
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
