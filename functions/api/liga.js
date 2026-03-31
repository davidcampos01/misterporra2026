// functions/api/liga.js
// Cloudflare Pages Function — proxy de football-data.org para clasificaciones y resultados

export async function onRequest({ request, env }) {
  if (!env.FOOTBALL_DATA_KEY) {
    return Response.json({ error: "Falta FOOTBALL_DATA_KEY" }, { status: 500 });
  }

  const url = new URL(request.url);
  const type        = url.searchParams.get("type")        ?? "standings"; // standings | matches
  const competition = url.searchParams.get("competition") ?? "PD";
  const season      = url.searchParams.get("season")      ?? "2025";
  const matchday    = url.searchParams.get("matchday");

  let fdoUrl;
  if (type === "standings") {
    fdoUrl = `https://api.football-data.org/v4/competitions/${competition}/standings?season=${season}`;
  } else if (type === "matches") {
    const base = `https://api.football-data.org/v4/competitions/${competition}/matches?season=${season}&status=FINISHED`;
    fdoUrl = matchday ? `${base}&matchday=${matchday}` : base;
  } else {
    return Response.json({ error: "Tipo inválido" }, { status: 400 });
  }

  try {
    const r = await fetch(fdoUrl, { headers: { "X-Auth-Token": env.FOOTBALL_DATA_KEY } });
    if (!r.ok) {
      const text = await r.text();
      return Response.json({ error: `API error ${r.status}: ${text}` }, { status: r.status });
    }
    const data = await r.json();
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
