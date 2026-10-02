export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { prenom, nom, email, telephone, cimetiere, defunt, concession, date, formule, prestations, total, note } = req.body;
  const brevoKey = process.env.BREVO_API_KEY;
  const ownerEmail = process.env.OWNER_EMAIL || "cleannet06600@gmail.com";
  const senderEmail = process.env.SENDER_EMAIL || "cleannet06600@gmail.com";

  const ownerHtml = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;padding:24px;">
      <h2 style="color:#5C7A6B;">⚰️ Nouvelle demande d'entretien de tombe</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:6px 0;color:#777;width:140px;">Client</td><td style="font-weight:600;">${prenom} ${nom}</td></tr>
        <tr><td style="padding:6px 0;color:#777;">Téléphone</td><td style="font-weight:600;">${telephone}</td></tr>
        <tr><td style="padding:6px 0;color:#777;">Email</td><td style="font-weight:600;">${email}</td></tr>
        <tr><td style="padding:6px 0;color:#777;">Défunt</td><td style="font-weight:600;">${defunt}</td></tr>
        <tr><td style="padding:6px 0;color:#777;">Cimetière</td><td style="font-weight:600;">${cimetiere}</td></tr>
        <tr><td style="padding:6px 0;color:#777;">Concession</td><td style="font-weight:600;">${concession || "Non précisée"}</td></tr>
        <tr><td style="padding:6px 0;color:#777;">Formule</td><td style="font-weight:600;">${formule}</td></tr>
        <tr><td style="padding:6px 0;color:#777;">Prestations</td><td style="font-weight:600;">${prestations}</td></tr>
        <tr><td style="padding:6px 0;color:#777;">Date souhaitée</td><td style="font-weight:600;">${date}</td></tr>
        <tr><td style="padding:6px 0;color:#777;">Total</td><td style="font-weight:700;color:#5C7A6B;">${total}€</td></tr>
        ${note ? `<tr><td style="padding:6px 0;color:#777;">Notes</td><td>${note}</td></tr>` : ""}
      </table>
    </div>`;

  const clientHtml = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;padding:24px;background:#F5F3EF;">
      <div style="background:#2C2C2C;color:white;padding:20px 24px;border-radius:4px 4px 0 0;">
        <h2 style="margin:0;font-family:Georgia,serif;font-weight:400;">CleanNet Tombes</h2>
        <p style="margin:6px 0 0;font-size:13px;color:#AAA;">Votre demande a bien été reçue</p>
      </div>
      <div style="background:white;padding:24px;border-radius:0 0 4px 4px;">
        <p style="font-size:15px;">Bonjour <strong>${prenom}</strong>,</p>
        <p style="color:#555;line-height:1.7;">Nous avons bien reçu votre demande d'entretien pour <strong>${defunt}</strong>.<br>
        Nous vous confirmons l'intervention sous 24h et vous enverrons les photos avant/après par SMS et email.</p>
        <div style="background:#E8F0EC;border-radius:4px;padding:16px;margin:16px 0;font-size:14px;line-height:2;">
          <div>🌿 <strong>Formule :</strong> ${formule}</div>
          <div>📍 <strong>Cimetière :</strong> ${cimetiere}</div>
          <div>📅 <strong>Date souhaitée :</strong> ${date}</div>
          <div>💶 <strong>Total :</strong> ${total}€ — Paiement à l'intervention</div>
        </div>
        <p style="color:#777;font-size:13px;">Une question ? 📞 06 12 92 20 48</p>
        <p style="color:#AAA;font-size:12px;">CleanNet Multi-Service 06 · Antibes</p>
      </div>
    </div>`;

  try {
    if (brevoKey) {
      // Email propriétaire
      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": brevoKey },
        body: JSON.stringify({ sender: { name: "CleanNet Tombes", email: senderEmail }, to: [{ email: ownerEmail }], subject: `⚰️ Nouvelle demande — ${defunt} — ${cimetiere}`, htmlContent: ownerHtml }),
      });
      // Email client
      if (email) {
        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { "Content-Type": "application/json", "api-key": brevoKey },
          body: JSON.stringify({ sender: { name: "CleanNet Tombes", email: senderEmail }, to: [{ email, name: `${prenom} ${nom}` }], subject: `✅ Demande reçue — Entretien pour ${defunt}`, htmlContent: clientHtml }),
        });
      }
      // SMS propriétaire
      if (process.env.OWNER_PHONE) {
        const smsText = `CleanNetTombes\nNouvelle demande !\n⚰️ ${defunt}\n📍 ${cimetiere}\n📅 ${date}\n💶 ${total}€\n📞 ${telephone}`;
        await fetch("https://api.brevo.com/v3/transactionalSMS/sms", {
          method: "POST",
          headers: { "Content-Type": "application/json", "api-key": brevoKey },
          body: JSON.stringify({ sender: "CleanNet", recipient: `+${process.env.OWNER_PHONE}`, content: smsText, type: "transactional" }),
        });
      }
    }
    return res.status(200).json({ success: true });
  } catch(e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
