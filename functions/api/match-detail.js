// functions/api/match-detail.js
// Cloudflare Pages Function — equivalente al antiguo api/match-detail.js de Vercel
// ?fixtureApiId=12345

async function fetchWithFallback(urls, primaryKey, fallbackKey) {
  async function tryKey(key) {
    const headers = { "x-apisports-key": key };
    const responses = await Promise.all(urls.map(u => fetch(u, { headers })));
    if (responses.some(r => !r.ok)) return null;
    const jsons = await Promise.all(responses.map(r => r.json()));
    // Detectar error de límite de peticiones
    const limited = jsons.some(j => j.errors?.requests || j.errors?.token);
    if (limited) return null;
    return jsons;
  }
  const result = await tryKey(primaryKey);
  if (result) return result;
  if (fallbackKey) return await tryKey(fallbackKey);
  return null;
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const fixtureApiId = url.searchParams.get("fixtureApiId");

  if (!fixtureApiId) {
    return Response.json({ error: "Falta parámetro fixtureApiId" }, { status: 400 });
  }
  if (!env.API_FOOTBALL_KEY) {
    return Response.json({ error: "Falta API_FOOTBALL_KEY" }, { status: 500 });
  }

  const base = "https://v3.football.api-sports.io";
  const urls = [
    `${base}/fixtures?id=${fixtureApiId}`,
    `${base}/fixtures/events?fixture=${fixtureApiId}`,
    `${base}/fixtures/lineups?fixture=${fixtureApiId}`,
  ];

  try {
    const jsons = await fetchWithFallback(urls, env.API_FOOTBALL_KEY, env.API_FOOTBALL_KEY_2);
    if (!jsons) {
      return Response.json({ error: "Límite de peticiones alcanzado en ambas claves" }, { status: 429 });
    }

    const [fixtureData, eventsData, lineupsData] = jsons;
    const fix = fixtureData.response?.[0];
    const homeTeamId = fix?.teams?.home?.id ?? null;
    const awayTeamId = fix?.teams?.away?.id ?? null;
    const events = eventsData.response ?? [];

    const cacheHeader = events.length > 0
      ? "s-maxage=300, stale-while-revalidate=600"
      : "s-maxage=30, stale-while-revalidate=60";

    return new Response(
      JSON.stringify({ ok: true, homeTeamId, awayTeamId, events, lineups: lineupsData.response ?? [] }),
      { headers: { "Content-Type": "application/json", "Cache-Control": cacheHeader } }
    );
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
