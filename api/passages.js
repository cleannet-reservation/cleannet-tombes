const getBase = () => (process.env.SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "") + "/rest/v1";
const headers = () => ({ "Content-Type": "application/json", "apikey": process.env.SUPABASE_ANON_KEY, "Authorization": `Bearer ${process.env.SUPABASE_ANON_KEY}` });

export default async function handler(req, res) {
  const base = getBase();
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    const r = await fetch(`${base}/passages?order=date_prevue.desc`, { headers: headers() });
    const data = await r.json();
    return res.status(200).json(Array.isArray(data) ? data : []);
  }
  if (req.method === "POST") {
    const r = await fetch(`${base}/passages`, { method: "POST", headers: { ...headers(), "Prefer": "return=representation" }, body: JSON.stringify(req.body) });
    const data = await r.json();
    return res.status(201).json(data);
  }
  if (req.method === "PATCH") {
    const { id, ...updates } = req.body;
    const r = await fetch(`${base}/passages?id=eq.${id}`, { method: "PATCH", headers: { ...headers(), "Prefer": "return=representation" }, body: JSON.stringify(updates) });
    const data = await r.json();
    return res.status(200).json(data);
  }
  if (req.method === "DELETE") {
    const { id } = req.body;
    await fetch(`${base}/passages?id=eq.${id}`, { method: "DELETE", headers: headers() });
    return res.status(200).json({ success: true });
  }
  return res.status(405).json({ error: "Method not allowed" });
}
