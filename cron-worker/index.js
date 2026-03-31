// cron-worker/index.js
// Cloudflare Worker con cron trigger — llama al endpoint /api/cron-sync de Pages
// y envía un email resumen via Resend (resend.com)

const PAGES_URL = "https://misterporra2026.pages.dev";
const NOTIFY_EMAIL = "davicitocamposerrano@gmail.com";

async function sendEmail(apiKey, subject, html) {
  if (!apiKey) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Porra 2026 <onboarding@resend.dev>",
      to: [NOTIFY_EMAIL],
      subject,
      html,
    }),
  });
}

export default {
  async scheduled(event, env, ctx) {
    const headers = env.CRON_SECRET
      ? { Authorization: `Bearer ${env.CRON_SECRET}` }
      : {};

    const tournaments = ["euro2024", "mundial2026"];
    const results = await Promise.all(
      tournaments.map(t =>
        fetch(`${PAGES_URL}/api/cron-sync?tournament=${t}`, { headers })
          .then(r => r.json())
          .then(data => ({ tournament: t, ...data }))
          .catch(err => ({ tournament: t, error: err.message }))
      )
    );

    results.forEach(r => console.log(`[cron] ${r.tournament}:`, JSON.stringify(r)));

    // Email resumen
    const now = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";
    const rows = results.map(r => {
      if (r.error) return `<tr><td><b>${r.tournament}</b></td><td colspan="3" style="color:red">❌ ${r.error}</td></tr>`;
      return `<tr>
        <td><b>${r.tournament}</b></td>
        <td>✅ ${r.matched ?? 0} partidos sincronizados</td>
        <td>${r.total ?? 0} totales en API</td>
        <td>${r.overridesWritten ? `+${r.overridesWritten} equipos detectados` : ""}</td>
      </tr>`;
    }).join("");

    const html = `
      <h2 style="font-family:sans-serif">⚽ Porra 2026 — Sync automático</h2>
      <p style="font-family:sans-serif;color:#666">${now}</p>
      <table style="font-family:sans-serif;border-collapse:collapse;width:100%">
        <thead><tr style="background:#f0f0f0">
          <th style="padding:8px;text-align:left">Torneo</th>
          <th style="padding:8px;text-align:left">Resultado</th>
          <th style="padding:8px;text-align:left">API</th>
          <th style="padding:8px;text-align:left">Equipos</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    await sendEmail(env.RESEND_API_KEY, `⚽ Porra sync — ${now}`, html);
  },
};
