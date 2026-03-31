// functions/api/liga.js
// Cloudflare Pages Function — proxy de football-data.org para clasificaciones y resultados

async function fdoFetch(url, key) {
  let lastError;
  for (let i = 0; i < 3; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 1000 * i));
    try {
      const r = await fetch(url, { headers: { "X-Auth-Token": key } });
      if (r.ok) return { ok: true, data: await r.json() };
      if (r.status === 429) return { ok: false, status: 429, body: await r.text() };
      lastError = `API error ${r.status}`;
    } catch (e) {
      lastError = e.message ?? "fetch error";
    }
  }
  return { ok: false, status: 522, body: lastError };
}

export async function onRequest({ request, env }) {
  if (!env.FOOTBALL_DATA_KEY) {
    return Response.json({ error: "Falta FOOTBALL_DATA_KEY" }, { status: 500 });
  }

  const url = new URL(request.url);
  const type        = url.searchParams.get("type")        ?? "standings";
  const competition = url.searchParams.get("competition") ?? "PD";
  const season      = url.searchParams.get("season")      ?? "2025";
  const matchday    = url.searchParams.get("matchday");

  let fdoUrl;
  if (type === "standings") {
    fdoUrl = `https://api.football-data.org/v4/competitions/${competition}/standings?season=${season}`;
  } else if (type === "matches") {
    fdoUrl = `https://api.football-data.org/v4/competitions/${competition}/matches?season=${season}${matchday ? `&matchday=${matchday}` : ""}`;
  } else {
    return Response.json({ error: "Tipo inválido" }, { status: 400 });
  }

  const result = await fdoFetch(fdoUrl, env.FOOTBALL_DATA_KEY);
  if (!result.ok) {
    return Response.json({ error: result.body }, { status: result.status ?? 500 });
  }
  return new Response(JSON.stringify(result.data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
    },
  });
}
