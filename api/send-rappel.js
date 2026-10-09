/**
 * Envoie un rappel email la veille de chaque passage prévu.
 * Appelé automatiquement par Vercel Cron chaque soir à 18h.
 * Peut aussi être déclenché manuellement via GET /api/send-rappel?secret=xxx
 */

const getBase = () =>
  (process.env.SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "") + "/rest/v1";

const sbHeaders = () => ({
  "Content-Type": "application/json",
  apikey: process.env.SUPABASE_ANON_KEY,
  Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
});

export default async function handler(req, res) {
  // Sécurité : Vercel Cron envoie un header Authorization, ou on accepte un secret en query
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers["authorization"];
  const querySecret = req.query?.secret;

  if (cronSecret) {
    const valid =
      authHeader === `Bearer ${cronSecret}` || querySecret === cronSecret;
    if (!valid) return res.status(401).json({ error: "Unauthorized" });
  }

  const base = getBase();

  // Date de demain (format YYYY-MM-DD)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split("T")[0];

  try {
    // Récupérer les passages prévus demain avec les infos client
    const r = await fetch(
      `${base}/passages?date_prevue=eq.${dateStr}&statut=eq.prevu&select=*,clients_sepulture(nom,email,telephone,cimetiere)`,
      { headers: sbHeaders() }
    );
    const passages = await r.json();

    if (!Array.isArray(passages) || passages.length === 0) {
      return res.status(200).json({ sent: 0, message: "Aucun passage demain" });
    }

    const results = [];
    for (const passage of passages) {
      const client = passage.clients_sepulture;
      if (!client?.email) {
        results.push({ id: passage.id, skipped: "pas d'email" });
        continue;
      }

      const prestationsStr = Array.isArray(passage.prestations)
        ? passage.prestations.join(", ")
        : passage.prestations || "Entretien";

      const emailResult = await sendEmail({
        to: client.email,
        clientNom: client.nom,
        date: dateStr,
        cimetiere: client.cimetiere || passage.cimetiere || "Votre cimetière",
        prestations: prestationsStr,
      });

      results.push({ id: passage.id, email: client.email, ...emailResult });
    }

    const sent = results.filter((r) => r.ok).length;
    return res.status(200).json({ sent, total: passages.length, results });
  } catch (err) {
    console.error("send-rappel error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}

async function sendEmail({ to, clientNom, date, cimetiere, prestations }) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return { ok: false, error: "RESEND_API_KEY manquante" };

  const dateFormatted = new Date(date + "T12:00:00").toLocaleDateString(
    "fr-FR",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;color:#2C2C2C;background:#F5F3EF;">
  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="font-size:22px;color:#5C7A6B;margin:0;">🌿 CleanNet Tombes</h1>
    <p style="color:#7A7A7A;margin:4px 0 0;">Entretien de sépultures — Côte d'Azur</p>
  </div>

  <div style="background:#fff;border:1px solid #DDD8D0;border-radius:8px;padding:24px;margin-bottom:24px;">
    <p style="font-size:16px;margin-top:0;">Bonjour <strong>${clientNom}</strong>,</p>
    <p>Nous vous rappelons que votre intervention est prévue <strong>${dateFormatted}</strong>.</p>

    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr style="border-bottom:1px solid #DDD8D0;">
        <td style="padding:8px 4px;color:#7A7A7A;width:40%;">📍 Lieu</td>
        <td style="padding:8px 4px;font-weight:600;">${cimetiere}</td>
      </tr>
      <tr>
        <td style="padding:8px 4px;color:#7A7A7A;">🧹 Prestation</td>
        <td style="padding:8px 4px;font-weight:600;">${prestations}</td>
      </tr>
    </table>

    <p style="margin-bottom:0;font-size:14px;color:#7A7A7A;">
      Des photos avant/après vous seront envoyées après l'intervention.<br>
      Pour toute question : <a href="tel:0612922048" style="color:#5C7A6B;">06 12 92 20 48</a>
      ou <a href="mailto:cleannet06600@gmail.com" style="color:#5C7A6B;">cleannet06600@gmail.com</a>
    </p>
  </div>

  <p style="text-align:center;font-size:12px;color:#7A7A7A;">
    CleanNet Multi-Service 06 — Antibes<br>
    SIRET 539 560 607 00035
  </p>
</body>
</html>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CleanNet Tombes <onboarding@resend.dev>",
        to: [to],
        subject: `🌿 Rappel : votre passage est demain — ${dateFormatted}`,
        html,
      }),
    });
    const data = await r.json();
    if (!r.ok) return { ok: false, error: data.message || `HTTP ${r.status}` };
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
