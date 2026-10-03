import Stripe from "stripe";

const PRICE_IDS = {
  mensuel:      "price_1UMZSZ2fqq0knYo0xnR2w1g7",
  bimestriel:   "price_1UMZlg2fqq0knYo0ZhJP8g2f",
  trimestriel:  "price_1UMZmU2fqq0knYo0bW6j3QMF",
  semestriel:   "price_1UMZnF2fqq0knYo0ThqIBE4c",
  annuel:       "price_1UMZnh2fqq0knYo05Ag1Afet",
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { formule_code, nom, email, client_id } = req.body;

  const priceId = PRICE_IDS[formule_code];
  if (!priceId) return res.status(400).json({ error: `Formule inconnue : ${formule_code}` });

  try {
    // Créer ou récupérer le customer Stripe
    let customer;
    const existing = await stripe.customers.list({ email, limit: 1 });
    if (existing.data.length > 0) {
      customer = existing.data[0];
    } else {
      customer = await stripe.customers.create({ email, name: nom });
    }

    // Créer la session de paiement pour l'abonnement
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      locale: "fr",
      customer: customer.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.headers.origin}/admin?subscription=success&client_id=${client_id}`,
      cancel_url: `${req.headers.origin}/admin?subscription=cancel`,
      metadata: { client_id, formule_code },
    });

    return res.status(200).json({ url: session.url, session_id: session.id });
  } catch(error) {
    console.error("Stripe error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
