import Stripe from "stripe";

const getBase = () => (process.env.SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "") + "/rest/v1";
const sbHeaders = () => ({
  "Content-Type": "application/json",
  "apikey": process.env.SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${process.env.SUPABASE_ANON_KEY}`,
});

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", chunk => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = await getRawBody(req);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch(err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  const base = getBase();

  // ─── Paiement abonnement réussi ───────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const meta = session.metadata || {};
    const email = session.customer_email || session.customer_details?.email || "";
    const nom = meta.nom || session.customer_details?.name || "";
    const formule_code = meta.formule_code || "";
    const montant = (session.amount_total || 0) / 100;

    console.log("✅ Paiement reçu:", nom, email, formule_code, montant);

    // 1. Chercher ou créer le client dans Supabase
    let clientId = null;
    const search = await fetch(`${base}/clients_sepulture?email=eq.${encodeURIComponent(email)}&limit=1`, { headers: sbHeaders() });
    const existing = await search.json();

    if (Array.isArray(existing) && existing.length > 0) {
      clientId = existing[0].id;
      // Mettre à jour le statut
      await fetch(`${base}/clients_sepulture?id=eq.${clientId}`, {
        method: "PATCH",
        headers: sbHeaders(),
        body: JSON.stringify({ statut: "actif", formule_code }),
      });
    } else {
      // Créer le client
      const create = await fetch(`${base}/clients_sepulture`, {
        method: "POST",
        headers: { ...sbHeaders(), "Prefer": "return=representation" },
        body: JSON.stringify({
          nom: nom || email,
          email,
          telephone: meta.telephone || "",
          cimetiere: meta.cimetiere || "",
          defunt: meta.defunt || "",
          concession: meta.concession || "",
          formule_code,
          statut: "actif",
          notes: meta.note || "",
        }),
      });
      const created = await create.json();
      if (Array.isArray(created) && created[0]) clientId = created[0].id;
    }

    // 2. Enregistrer le paiement
    if (clientId) {
      await fetch(`${base}/paiements`, {
        method: "POST",
        headers: sbHeaders(),
        body: JSON.stringify({
          client_id: clientId,
          montant,
          moyen: "stripe",
          statut: "paye",
          date_paiement: new Date().toISOString().split("T")[0],
        }),
      });

      // 3. Créer le premier passage prévu
      if (meta.date) {
        await fetch(`${base}/passages`, {
          method: "POST",
          headers: sbHeaders(),
          body: JSON.stringify({
            client_id: clientId,
            date_prevue: meta.date,
            statut: "prevu",
            montant,
            remarques: meta.prestations || "",
          }),
        });
      }
    }

    // 4. Email de confirmation au client
    if (email && process.env.BREVO_API_KEY) {
      const senderEmail = process.env.SENDER_EMAIL || "cleannet06600@gmail.com";
      const html = `
        <div style="font-family:system-ui,sans-serif;max-width:600px;padding:24px;background:#F5F3EF;">
          <div style="background:#2C2C2C;color:white;padding:20px 24px;border-radius:4px 4px 0 0;">
            <h2 style="margin:0;font-family:Georgia,serif;font-weight:400;">CleanNet Tombes</h2>
            <p style="margin:6px 0 0;font-size:13px;color:#AAA;">Votre abonnement est confirmé</p>
          </div>
          <div style="background:white;padding:24px;border-radius:0 0 4px 4px;">
            <p style="font-size:15px;">Bonjour <strong>${nom}</strong>,</p>
            <p style="color:#555;line-height:1.7;">Votre abonnement <strong>${formule_code}</strong> est maintenant actif. Nous nous occupons de tout.</p>
            <div style="background:#E8F0EC;border-radius:4px;padding:16px;margin:16px 0;font-size:14px;line-height:2;">
              <div>⚰️ <strong>Défunt :</strong> ${meta.defunt||"—"}</div>
              <div>📍 <strong>Cimetière :</strong> ${meta.cimetiere||"—"}</div>
              <div>📅 <strong>Première intervention :</strong> ${meta.date||"À confirmer"}</div>
              <div>💶 <strong>Montant :</strong> ${montant.toFixed(2)}€</div>
            </div>
            <p style="color:#555;line-height:1.7;">Nous vous enverrons des photos avant/après après chaque intervention.</p>
            <p style="color:#777;font-size:13px;">Une question ? 📞 06 12 92 20 48</p>
            <p style="color:#AAA;font-size:12px;">CleanNet Multi-Service 06 · Antibes</p>
          </div>
        </div>`;

      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": process.env.BREVO_API_KEY },
        body: JSON.stringify({
          sender: { name: "CleanNet Tombes", email: senderEmail },
          to: [{ email, name: nom }],
          subject: `✅ Abonnement confirmé — Entretien pour ${meta.defunt||"votre sépulture"}`,
          htmlContent: html,
        }),
      }).catch(() => {});
    }

    // 5. SMS à Mike
    if (process.env.BREVO_API_KEY && process.env.OWNER_PHONE) {
      const sms = `CleanNetTombes\n✅ Nouvel abonnement payé !\n👤 ${nom}\n📧 ${email}\n🌿 ${formule_code}\n⚰️ ${meta.defunt||""}\n📍 ${meta.cimetiere||""}\n💶 ${montant.toFixed(2)}€`;
      await fetch("https://api.brevo.com/v3/transactionalSMS/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": process.env.BREVO_API_KEY },
        body: JSON.stringify({ sender: "CleanNet", recipient: `+${process.env.OWNER_PHONE}`, content: sms, type: "transactional" }),
      }).catch(() => {});
    }
  }

  // ─── Résiliation abonnement ───────────────────────────────────────
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const customerId = subscription.customer;

    console.log("❌ Résiliation:", customerId);

    // Chercher le client par stripe_customer_id ou email
    const stripe2 = new Stripe(process.env.STRIPE_SECRET_KEY);
    const customer = await stripe2.customers.retrieve(customerId);
    const email = customer.email || "";

    if (email) {
      // Mettre à jour le statut dans Supabase
      await fetch(`${base}/clients_sepulture?email=eq.${encodeURIComponent(email)}`, {
        method: "PATCH",
        headers: sbHeaders(),
        body: JSON.stringify({ statut: "resilie" }),
      });

      // Email de résiliation au client
      if (process.env.BREVO_API_KEY) {
        const senderEmail = process.env.SENDER_EMAIL || "cleannet06600@gmail.com";
        const html = `
          <div style="font-family:system-ui,sans-serif;max-width:600px;padding:24px;">
            <h2 style="color:#2C2C2C;">CleanNet Tombes — Résiliation confirmée</h2>
            <p>Bonjour,</p>
            <p>Votre abonnement CleanNet Tombes a bien été résilié. Nous n'effectuerons plus de passages.</p>
            <p>Si vous souhaitez reprendre le service, contactez-nous :</p>
            <p>📞 06 12 92 20 48 · cleannet06600@gmail.com</p>
            <p style="color:#AAA;font-size:12px;">CleanNet Multi-Service 06 · Antibes</p>
          </div>`;

        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { "Content-Type": "application/json", "api-key": process.env.BREVO_API_KEY },
          body: JSON.stringify({
            sender: { name: "CleanNet Tombes", email: senderEmail },
            to: [{ email }],
            subject: "Résiliation de votre abonnement CleanNet Tombes",
            htmlContent: html,
          }),
        }).catch(() => {});
      }

      // SMS à Mike
      if (process.env.BREVO_API_KEY && process.env.OWNER_PHONE) {
        const sms = `CleanNetTombes\n❌ Résiliation abonnement\n📧 ${email}`;
        await fetch("https://api.brevo.com/v3/transactionalSMS/sms", {
          method: "POST",
          headers: { "Content-Type": "application/json", "api-key": process.env.BREVO_API_KEY },
          body: JSON.stringify({ sender: "CleanNet", recipient: `+${process.env.OWNER_PHONE}`, content: sms, type: "transactional" }),
        }).catch(() => {});
      }
    }
  }

  return res.status(200).json({ received: true });
}
